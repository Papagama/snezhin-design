import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cases, servicePages } from '../src/site-data.mjs';
import { articles } from '../src/articles.mjs';
import { notes } from '../src/notes.mjs';
import { localPage } from '../src/local-page.mjs';
import { articleClusters, relatedArticleSlugs, localArticleLinks, articleServiceOverrides, noteConnections } from '../src/content-links.mjs';
import { validateProjectTrust } from '../src/project-trust.mjs';
import { renderProjectTestimonial } from '../src/render.mjs';

const htmlAt = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
const hrefs = html => [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
const occurrences = (html, path) => hrefs(html).filter(href => href === path).length;
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));

const localHtml = await htmlAt(`${localPage.slug}/index.html`);
const localMain = main(localHtml);
assert(!servicePages.some(item => item.slug === localPage.slug), 'Local page must not be a duplicate service');
for (const token of ['service-rows','service-row','offer-strip','project-card','related-case','projects-stack','process-grid','₽']) assert(!localMain.includes(token), `Local page contains a service/portfolio block: ${token}`);
assert.equal((localMain.match(/<section\b/g) || []).length, 9);
assert.equal((localMain.match(/<details\b/g) || []).length, 10);
for (const path of ['/services.html','/portfolio.html','/contact.html']) assert.equal(occurrences(localMain,path),1, `Expected one useful body link to ${path}`);
assert.equal(hrefs(localMain).filter(href=>href.startsWith('/blog/')).length,2);
assert.deepEqual(schemas(localHtml).map(item=>item['@type']),['Person','WebSite','WebPage','BreadcrumbList']);
for (const token of ['"address"','"telephone"','"AggregateRating"','"Review"','"openingHours"']) assert(!localHtml.includes(token), `Unconfirmed local claim: ${token}`);
for (const tag of ['twitter:title','twitter:description','twitter:image','og:title','og:description','og:url']) assert(localHtml.includes(`="${tag}"`), `Missing social metadata: ${tag}`);

for (const file of ['index.html','services.html']) assert.equal(occurrences(main(await htmlAt(file)),localPage.path),1, `One local entry is needed in ${file}`);
const sitemap = await htmlAt('sitemap.xml');
assert.equal((sitemap.match(/<loc>https:\/\/design\.kirill-verstak\.ru\/sozdanie-saitov-kaliningrad\/<\/loc>/g)||[]).length,1);
assert(!sitemap.includes('/404.html'));
const notFound = await htmlAt('404.html');
assert.deepEqual([...notFound.matchAll(/<meta name="robots" content="([^"]+)"/g)].map(x=>x[1]), ['noindex, follow']);
assert(!localHtml.includes('noindex'));

const membership = articleClusters.flatMap(cluster=>cluster.slugs);
assert.equal(new Set(membership).size,articles.length);
assert.deepEqual([...membership].sort(),articles.map(article=>article.slug).sort());
const blog = main(await htmlAt('blog/index.html'));
for (const article of articles) assert(blog.includes(`/blog/${article.slug}/`), `Missing blog entry: ${article.slug}`);
let localSources = 0;
for (const article of articles) {
  const html = main(await htmlAt(`blog/${article.slug}/index.html`));
  const links = hrefs(html);
  const service = articleServiceOverrides[article.slug] || article.relatedService;
  assert(servicePages.some(item=>`/${item.slug}/` === service), `Not an individual service: ${service}`);
  assert(links.includes(service));
  assert(links.includes(`/portfolio/${article.relatedCase}/`));
  const related = relatedArticleSlugs[article.slug];
  assert.equal(new Set(related).size,2);
  for (const slug of related) {
    assert(slug !== article.slug && articles.some(item=>item.slug===slug));
    assert(links.includes(`/blog/${slug}/`));
  }
  const count = occurrences(html,localPage.path);
  const context = localArticleLinks[article.slug];
  assert.equal(count,context ? 1 : 0, `Unexpected local link in ${article.slug}`);
  if (context) {
    localSources++;
    assert(article.sections.some(section=>section.heading===context.heading));
    assert(html.includes('class="article-local-context"'));
  }
}
assert.equal(localSources,3);
for (const note of notes) {
  const html = main(await htmlAt(`blog/${note.slug}/index.html`));
  const connection = noteConnections[note.slug];
  assert(occurrences(html,connection.service)===1);
  assert(occurrences(html,`/portfolio/${connection.caseSlug}/`)===1);
  for (const neighbour of notes.filter(item=>item.slug!==note.slug)) assert.equal(occurrences(html,`/blog/${neighbour.slug}/`),1);
  assert.equal(occurrences(html,localPage.path),0);
}

validateProjectTrust(cases);
for (const item of cases) {
  assert.equal(renderProjectTestimonial(item,[]),'','Do not render an empty testimonial block');
  if (item.status !== 'client') assert.equal(renderProjectTestimonial(item),'');
}
// Synthetic fixture stays in the test process; it never enters generated content.
const fixture = {slug:'test-only',status:'client',client:{name:'Test <company>'}};
const review = {caseSlug:'test-only',author:'Test author',text:'<script>alert(1)</script>',sourceUrl:'https://example.com/review',permissionGranted:true,approved:true};
assert.throws(()=>validateProjectTrust([fixture],[{...review,permissionGranted:false}]));
assert.throws(()=>validateProjectTrust([fixture],[{...review,sourceUrl:'javascript:alert(1)'}]));
assert.throws(()=>validateProjectTrust([{...fixture,status:'concept'}],[review]));
assert.throws(()=>validateProjectTrust([{...fixture,client:undefined}],[review]));
assert.throws(()=>validateProjectTrust([fixture],[review,review]));
assert.equal(renderProjectTestimonial(fixture,[{...review,approved:false}]),'');
validateProjectTrust([fixture],[review]);
const rendered = renderProjectTestimonial(fixture,[review]);
assert(rendered.includes('&lt;script&gt;') && !rendered.includes('<script>'));

console.log('Local SEO passed: distinct local page; three article entries; 15 connected readings; verified project statuses; safe optional testimonials; 404/noindex.');
