import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const skip = new Set(['dist', 'node_modules', '.git', '.playwright-cli', 'output']);
const issues = [];
const externalLinks = new Set();
const mailtoLinks = new Set();
const projectEmail = 'snezhin.design@mail.ru';

async function walk(directory, relative = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skip.has(entry.name)) continue;
    const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await walk(resolve(directory, entry.name), nextRelative));
    else files.push(nextRelative.replaceAll('\\', '/'));
  }
  return files;
}

for (const file of (await walk(root)).filter(item => extname(item) === '.html' && item !== 'legacy-admin.html')) {
  const html = await readFile(resolve(root, file), 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*?\bhref="([^"]+)"/gi)) {
    const href = match[1];
    if (/^https?:\/\//.test(href)) externalLinks.add(href);
    if (href.startsWith('mailto:')) mailtoLinks.add(href);
  }
}

for (const link of mailtoLinks) {
  let recipient = '';
  try { recipient = decodeURIComponent(link.slice('mailto:'.length).split('?')[0]); } catch { /* reported below */ }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) issues.push(`Invalid email action: ${link}`);
  if (recipient !== projectEmail) issues.push(`Unexpected email action: ${link}`);
}

const results = await Promise.all([...externalLinks].map(async link => {
  try {
    const response = await fetch(link, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
      headers: { 'user-agent': 'snezhin-design-link-check/1.0' }
    });
    await response.body?.cancel();
    return { link, status: response.status };
  } catch (error) {
    return { link, error: error.message };
  }
}));

for (const result of results) {
  if (result.error) issues.push(`Unreachable external link: ${result.link} (${result.error})`);
  else if (result.status < 200 || result.status >= 400) issues.push(`External link returned HTTP ${result.status}: ${result.link}`);
}

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}

console.log(`Link check passed: ${externalLinks.size} external HTTP(S) links and ${mailtoLinks.size} valid email actions.`);
