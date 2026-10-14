/**
 * Push the committed seed into the live store.
 *
 *   node scripts/seed-push.mjs           # show what would change
 *   node scripts/seed-push.mjs --apply   # overwrite the stored document
 *
 * Reads fall back to the seed only for top-level keys the store does not have,
 * and after the first save the store has all of them. So editing
 * `content.seed.json` once the CMS is live has no effect on the site — which is
 * right, because the alternative is a deep merge that would quietly restore
 * content an editor had deleted.
 *
 * This is the deliberate way across: it replaces the stored document with the
 * seed. It is destructive of anything edited in the admin since, which is why
 * it prints a diff and does nothing without --apply.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import crypto from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const APPLY = process.argv.includes('--apply');

try { process.loadEnvFile(resolve(root, '.env')); } catch {}

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
const DOCUMENT_ID = process.env.CMS_DOCUMENT_ID || 'cms/site-content.json';

if (!(cloud && key && secret)) {
  console.error('Missing Cloudinary credentials. See .env.example.');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
const seed = JSON.parse(readFileSync(resolve(root, 'src/data/content.seed.json'), 'utf8'));

let stored = null;
const meta = await fetch(
  `https://api.cloudinary.com/v1_1/${cloud}/resources/raw/upload/${DOCUMENT_ID}`,
  { headers: { authorization: auth } },
);
if (meta.ok) stored = await (await fetch((await meta.json()).secure_url)).json();

const summarise = (doc) =>
  doc
    ? Object.entries(doc.pages ?? {})
        .map(([k, v]) => `${k}(${v.sections?.length ?? 0})`)
        .join(' ')
    : '(nothing stored)';

console.log('  stored:', summarise(stored));
console.log('  seed  :', summarise(seed));

if (!APPLY) {
  console.log('\nRe-run with --apply to overwrite the stored document with the seed.');
  process.exit(0);
}

const sign = (params) =>
  crypto
    .createHash('sha1')
    .update(
      Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&') + secret,
    )
    .digest('hex');

const timestamp = Math.floor(Date.now() / 1000);
const params = { public_id: DOCUMENT_ID, overwrite: 'true', invalidate: 'true', timestamp };

const form = new FormData();
form.append('file', new Blob([JSON.stringify(seed, null, 2)], { type: 'application/json' }), 'site-content.json');
for (const [k, v] of Object.entries(params)) form.append(k, String(v));
form.append('api_key', key);
form.append('signature', sign(params));

const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, { method: 'POST', body: form });
const payload = await response.json();
if (!response.ok) {
  console.error('push failed:', payload?.error?.message ?? response.status);
  process.exit(1);
}

console.log(`\npushed seed to the store (version ${payload.version})`);
console.log('Run Publish in the admin, or the site keeps serving the cached pages.');
