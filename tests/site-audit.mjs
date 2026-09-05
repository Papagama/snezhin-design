import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const skip = new Set(['dist', 'node_modules', '.git', '.playwright-cli', 'output']);

async function walk(directory, relative = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skip.has(entry.name)) continue;
    const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
    const full = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full, nextRelative));
    else files.push(nextRelative.replaceAll('\\', '/'));
  }
  return files;
}

const allFiles = await walk(root);
const htmlFiles = allFiles.filter(file => extname(file) === '.html' && file !== 'legacy-admin.html');
const issues = [];
const titles = new Map();
const descriptions = new Map();
const home = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'site.css'), 'utf8');

if (!home.includes('class="hero-portrait"') || !home.includes('/assets/profile/kirill-snezhin.png')) issues.push('index.html: missing author portrait in hero');
if (home.includes('class="hero-feature"') || home.includes('WAYPOINT</strong>')) issues.push('index.html: obsolete featured case remains in hero');
if (!css.includes('min-height: calc(100svh - 76px)')) issues.push('site.css: desktop viewport-safe hero rule missing');

function targetFor(link) {
  const clean = link.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean === '/') return 'index.html';
  if (clean.startsWith('/')) return clean.endsWith('/') ? `${clean.slice(1)}index.html` : clean.slice(1);
  return null;
}

for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="(.*?)">/s)?.[1];
  const canonical = html.match(/<link rel="canonical" href="(.*?)">/s)?.[1];
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (!title) issues.push(`${file}: missing title`);
  if (!description) issues.push(`${file}: missing description`);
  if (!canonical) issues.push(`${file}: missing canonical`);
  if (h1Count !== 1) issues.push(`${file}: ${h1Count} H1 elements`);
  if (title) {
    if (titles.has(title)) issues.push(`${file}: duplicate title with ${titles.get(title)}`);
    titles.set(title, file);
  }
  if (description) {
    if (descriptions.has(description)) issues.push(`${file}: duplicate description with ${descriptions.get(description)}`);
    descriptions.set(description, file);
  }
  for (const script of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(script[1]); } catch (error) { issues.push(`${file}: invalid JSON-LD ${error.message}`); }
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]*"/.test(tag[0])) issues.push(`${file}: image without alt`);
    if (!/\bwidth="\d+"/.test(tag[0]) || !/\bheight="\d+"/.test(tag[0])) issues.push(`${file}: image without dimensions`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = match[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(link)) continue;
    const target = targetFor(link);
    if (target && !allFiles.includes(target)) issues.push(`${file}: missing target ${link}`);
  }
  if (html.includes('formspree.io')) issues.push(`${file}: public page contains a Formspree endpoint`);
}

const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== 30) issues.push(`sitemap.xml: expected 30 URLs, received ${sitemapCount}`);

const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap: https://design.kirill-verstak.ru/sitemap.xml')) issues.push('robots.txt: missing sitemap URL');

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}

console.log(`Audit passed: ${htmlFiles.length} public HTML pages, ${sitemapCount} sitemap URLs, no broken root-relative links.`);
