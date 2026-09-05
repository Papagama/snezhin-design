import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { cases, servicePages, site } from './src/site-data.mjs';
import { articles } from './src/articles.mjs';
import {
  render404,
  renderAbout,
  renderArticle,
  renderBlog,
  renderCase,
  renderContact,
  renderHome,
  renderPortfolio,
  renderPrivacy,
  renderServicePage,
  renderServices
} from './src/render.mjs';

const root = process.cwd();
const dist = resolve(root, 'dist');
const client = resolve(dist, 'client');
const server = resolve(dist, 'server');

const generatedDirectories = [
  'portfolio',
  'blog',
  ...servicePages.map(item => item.slug)
];

for (const directory of generatedDirectories) {
  await rm(resolve(root, directory), { recursive: true, force: true });
}

const pages = [
  { file: 'index.html', path: '/', html: renderHome(), priority: '1.0' },
  { file: 'portfolio.html', path: '/portfolio.html', html: renderPortfolio(), priority: '0.9' },
  { file: 'services.html', path: '/services.html', html: renderServices(), priority: '0.9' },
  { file: 'about.html', path: '/about.html', html: renderAbout(), priority: '0.7' },
  { file: 'contact.html', path: '/contact.html', html: renderContact(), priority: '0.8' },
  { file: 'privacy.html', path: '/privacy.html', html: renderPrivacy(), priority: '0.2' },
  { file: '404.html', path: '/404.html', html: render404(), priority: '0.1', sitemap: false },
  { file: 'blog/index.html', path: '/blog/', html: renderBlog(), priority: '0.8' },
  ...cases.map((item, index) => ({
    file: `portfolio/${item.slug}/index.html`, path: `/portfolio/${item.slug}/`, html: renderCase(item, index), priority: '0.8'
  })),
  ...servicePages.map(item => ({
    file: `${item.slug}/index.html`, path: `/${item.slug}/`, html: renderServicePage(item), priority: item.slug === 'sozdanie-saitov-kaliningrad' ? '0.9' : '0.8'
  })),
  ...articles.map((item, index) => ({
    file: `blog/${item.slug}/index.html`, path: `/blog/${item.slug}/`, html: renderArticle(item, index), priority: '0.7'
  }))
];

if (articles.length !== 12) throw new Error(`Expected 12 articles, received ${articles.length}`);

for (const article of articles) {
  const text = [
    article.title,
    article.lead,
    ...article.sections.flatMap(section => [section.heading, ...section.paragraphs]),
    ...article.faq.flat(),
    article.conclusion || ''
  ].join(' ');
  const wordCount = (text.match(/[A-Za-zА-Яа-яЁё0-9]+(?:[-–][A-Za-zА-Яа-яЁё0-9]+)*/g) || []).length;
  if (wordCount < 1000 || wordCount > 1800) throw new Error(`Article ${article.slug} has ${wordCount} words`);
}

const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const title = page.html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = page.html.match(/<meta name="description" content="(.*?)">/s)?.[1];
  const h1Count = (page.html.match(/<h1\b/g) || []).length;
  if (!title || !description) throw new Error(`Missing metadata in ${page.file}`);
  if (page.file !== '404.html' && titles.has(title)) throw new Error(`Duplicate title: ${title}`);
  if (page.file !== '404.html' && descriptions.has(description)) throw new Error(`Duplicate description: ${description}`);
  if (h1Count !== 1) throw new Error(`${page.file} contains ${h1Count} H1 elements`);
  titles.add(title);
  descriptions.add(description);
  await mkdir(dirname(resolve(root, page.file)), { recursive: true });
  await writeFile(resolve(root, page.file), page.html, 'utf8');
}

const lastModified = '2026-09-05';
const sitemapEntries = pages
  .filter(page => page.sitemap !== false)
  .map(page => `  <url><loc>${site.baseUrl}${page.path}</loc><lastmod>${lastModified}</lastmod><changefreq>${page.path.startsWith('/blog/') ? 'monthly' : 'monthly'}</changefreq><priority>${page.priority}</priority></url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(resolve(root, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *\nAllow: /\nDisallow: /legacy-admin.html\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`;
await writeFile(resolve(root, 'robots.txt'), robots, 'utf8');

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

const rootFiles = [
  'index.html', 'portfolio.html', 'services.html', 'about.html', 'contact.html', 'privacy.html', '404.html',
  'site.css', 'site.js', 'robots.txt', 'sitemap.xml', 'CNAME', 'config.js', 'legacy-admin.html'
];
for (const filename of rootFiles) await cp(resolve(root, filename), resolve(client, filename));
for (const directory of ['assets', 'public', ...generatedDirectories]) {
  await cp(resolve(root, directory), resolve(client, directory), { recursive: true });
}

const worker = `
const assetRequest = (request, pathname) => {
  const target = new URL(request.url);
  target.pathname = pathname;
  target.search = '';
  return new Request(target.toString(), request);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    let response = await env.ASSETS.fetch(assetRequest(request, pathname));
    if (response.status === 404 && pathname.endsWith('/')) {
      response = await env.ASSETS.fetch(assetRequest(request, pathname + 'index.html'));
    }
    if (response.status !== 404) return response;
    return env.ASSETS.fetch(assetRequest(request, '/404.html'));
  }
};
`;
await writeFile(resolve(server, 'index.js'), worker.trimStart(), 'utf8');

const builtIndex = await readFile(resolve(client, 'index.html'), 'utf8');
if (!builtIndex.includes('/site.css') || !builtIndex.includes('/site.js')) throw new Error('Shared site assets are missing from index.html');

console.log(`Built ${pages.length} HTML pages, ${articles.length} articles and ${cases.length} case studies.`);
