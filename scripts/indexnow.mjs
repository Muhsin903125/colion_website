/**
 * Submit every URL in the built sitemap to IndexNow.
 *
 * IndexNow is the push protocol shared by Bing, Yandex, Naver, Seznam and Yep.
 * Bing's index is what Microsoft Copilot, ChatGPT search and DuckDuckGo answer
 * from, so a ping here is the fastest way to get a changed page in front of
 * those engines — minutes rather than the days a crawl schedule takes. Google
 * does not take part; it reads the sitemap through Search Console instead.
 *
 * No account is needed. The key proves the submitter controls the host: it is
 * a random hex string served at https://<host>/<key>.txt, and public/ holds
 * that file. Run after a production deploy, once the new build is live:
 *
 *   npm run build && npm run indexnow
 *
 * Submitting an unchanged URL is harmless (the engines de-duplicate), but the
 * protocol asks that pings follow real changes, so it is not wired into CI.
 */
import { readdir, readFile } from 'node:fs/promises';

/** Must match `site` in astro.config.mjs. */
const SITE = 'https://www.colioninternational.com';
/**
 * The sitemap is generated per request now, not written to the build output, so
 * there is no file to read. Fetching the live one also makes this honest: it
 * pings the URLs the site is actually serving, not the ones the last build
 * happened to produce.
 */
const SITEMAP_URL = `${SITE}/sitemap.xml`;

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const keyFile = (await readdir('public')).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) fail('No IndexNow key file in public/ (expected <32 hex chars>.txt).');
const key = (await readFile(`public/${keyFile}`, 'utf8')).trim();
if (key !== keyFile.replace(/\.txt$/, '')) {
  fail(`public/${keyFile} must contain exactly its own filename without .txt.`);
}

let xml;
try {
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) fail(`Could not fetch ${SITEMAP_URL} (${response.status})`);
  xml = await response.text();
} catch {
  fail(`${SITEMAP_URL} is not reachable — deploy first, then rerun.`);
}
const host = new URL(SITE).host;
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => new URL(u).host === host);
if (!urlList.length) fail(`Sitemap contains no URLs on ${host}.`);

// Confirm the key is actually being served before pinging — otherwise every
// engine rejects the batch silently and nothing gets indexed.
const keyLocation = `${SITE}/${keyFile}`;
const served = await fetch(keyLocation)
  .then((r) => (r.ok ? r.text() : ''))
  .catch(() => '');
if (served.trim() !== key) {
  fail(`${keyLocation} is not serving the key yet — deploy first, then rerun.`);
}

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

// 200 = accepted; 202 = accepted, key validation still pending. Anything else
// is a real error and the body says why.
const ok = res.status === 200 || res.status === 202;
console.log(`${ok ? 'Submitted' : 'FAILED'} ${urlList.length} URL(s) → IndexNow (HTTP ${res.status})`);
if (!ok) fail(await res.text());
