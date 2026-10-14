/**
 * Crawl the site from its sitemap and every internal link, and fail on any
 * page that does not answer 200.
 *
 *   node scripts/check-links.mjs                     # against http://localhost:4321
 *   node scripts/check-links.mjs https://preview-url  # against a deployment
 *
 * Also checks every internal image and video source the pages reference, so a
 * renamed file is caught before a visitor finds the broken frame.
 */
const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
const SITE = 'https://www.colioninternational.com';

const seen = new Map();
const assets = new Set();
const queue = [];

const local = (href) => {
  try {
    const u = new URL(href, base);
    const host = u.origin === base || u.origin === SITE;
    if (!host) return null;
    return u.pathname;
  } catch {
    return null;
  }
};

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) queue.push(new URL(loc).pathname);
queue.push('/', '/404-check-should-be-404/');

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await fetch(base + path, { redirect: 'manual' });
  seen.set(path, res.status);
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('text/html')) continue;
  const html = await res.text();
  for (const [, href] of html.matchAll(/<a[^>]+href="([^"#]+)/g)) {
    const p = local(href);
    if (p && !p.startsWith('/api/') && !/\.(xml|txt)$/.test(p) && !seen.has(p)) queue.push(p);
  }
  for (const [, src] of html.matchAll(/(?:src|data-src|poster|data-lb-src)="(\/[^"@][^"]*)"/g)) assets.add(src.split('?')[0]);
}

let failures = 0;
for (const [path, status] of seen) {
  const expected = path.includes('404-check') ? 404 : 200;
  if (status !== expected) {
    failures++;
    console.error(`  ${status}  ${path}`);
  }
}
for (const asset of assets) {
  const res = await fetch(base + asset, { method: 'HEAD' });
  if (!res.ok) {
    failures++;
    console.error(`  ${res.status}  asset ${asset}`);
  }
}

console.log(`[links] ${seen.size} pages, ${assets.size} assets checked — ${failures ? `${failures} problem(s)` : 'all OK'}`);
process.exit(failures ? 1 : 0);
