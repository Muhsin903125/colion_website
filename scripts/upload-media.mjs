/**
 * Move the launch gallery from `public/` into Cloudinary.
 *
 *   node scripts/upload-media.mjs            # dry run: list what would upload
 *   node scripts/upload-media.mjs --apply    # upload, then rewrite the seed
 *
 * The site works with the local files; this is for when you want every
 * gallery item managed in one place (and the repo lighter). Photos go to
 * `colion/gallery/launch/<name>`, reels to the same path as video assets.
 * The seed's references are rewritten to the Cloudinary ids, so run
 * `npm run seed:push` afterwards to put them into the live document.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

const root = resolve(import.meta.dirname, '..');
try {
  process.loadEnvFile(resolve(root, '.env'));
} catch {}

const APPLY = process.argv.includes('--apply');
const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret, CLOUDINARY_FOLDER = 'colion' } = process.env;
if (!(cloud && key && secret)) {
  console.error('Missing Cloudinary credentials — see .env.example.');
  process.exit(1);
}
cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret, secure: true });

const seedPath = resolve(root, 'src/data/content.seed.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));

let count = 0;
for (const item of seed.gallery) {
  const jobs = [];
  if (item.image?.publicId?.startsWith('/images/gallery/')) jobs.push(['image', item.image.publicId]);
  if (item.video?.startsWith('/videos/reels/')) jobs.push(['video', item.video]);
  for (const [type, local] of jobs) {
    const name = local.split('/').pop().replace(/\.[^.]+$/, '');
    const publicId = `${CLOUDINARY_FOLDER}/gallery/launch/${name}`;
    count++;
    if (!APPLY) {
      console.log(`  would upload ${local} → ${type}:${publicId}`);
      continue;
    }
    const result = await cloudinary.uploader.upload(resolve(root, 'public', local.slice(1)), { public_id: publicId, resource_type: type, overwrite: true });
    if (type === 'image') item.image = { ...item.image, publicId: result.public_id, version: result.version, width: result.width, height: result.height };
    else item.video = result.public_id;
    console.log(`  uploaded ${local} → ${result.public_id}`);
  }
}

if (APPLY) {
  writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`);
  console.log(`[media] ${count} file(s) uploaded; seed rewritten. Run \`npm run seed:push -- --apply\` next.`);
} else {
  console.log(`[media] ${count} file(s) would upload. Re-run with --apply.`);
}
