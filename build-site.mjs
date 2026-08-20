import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const client = resolve(dist, 'client');
const server = resolve(dist, 'server');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(client, 'assets', 'cases'), { recursive: true });
await mkdir(resolve(client, 'assets', 'generated'), { recursive: true });
await mkdir(server, { recursive: true });

await cp(resolve(root, 'index.html'), resolve(client, 'index.html'));
await cp(resolve(root, 'config.js'), resolve(client, 'config.js'));
for (const filename of ['portfolio.html', 'services.html', 'about.html', 'contact.html', 'seo.css', 'robots.txt', 'sitemap.xml']) {
  await cp(resolve(root, filename), resolve(client, filename));
}
await cp(resolve(root, 'assets', 'cases'), resolve(client, 'assets', 'cases'), { recursive: true });
await cp(resolve(root, 'assets', 'generated'), resolve(client, 'assets', 'generated'), { recursive: true });
await cp(resolve(root, 'public'), resolve(client, 'public'), { recursive: true });

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
    const response = await env.ASSETS.fetch(assetRequest(request, pathname));

    if (response.status !== 404) return response;
    if (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html')) {
      return env.ASSETS.fetch(assetRequest(request, '/index.html'));
    }
    return response;
  }
};
`;

await writeFile(resolve(server, 'index.js'), worker.trimStart(), 'utf8');

const index = await readFile(resolve(client, 'index.html'), 'utf8');
if (!index.includes('./config.js')) throw new Error('config.js is not referenced by index.html');

console.log('Static portfolio build completed.');
