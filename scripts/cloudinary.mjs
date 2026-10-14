/**
 * Cloudinary client + CLI for the Colion media library.
 *
 * Credentials come from the environment, never from this file. `.env` is
 * gitignored; `.env.example` documents the three keys. The API secret signs
 * upload and delete requests — anyone holding it can write to or wipe the
 * account, so it must not reach the browser, the repo, or a build artifact.
 * That is also why nothing here is imported by `src/`: this is a Node-only
 * tool, run by hand, and the site itself only ever references delivery URLs.
 *
 *   node scripts/cloudinary.mjs upload <file|url> [public_id]
 *   node scripts/cloudinary.mjs url <public_id> [width] [height]
 *
 * Or `npm run cloudinary -- upload ./public/images/brand/about-team.webp colion/about-team`.
 */
import { v2 as cloudinary } from 'cloudinary';

// Node reads .env itself (>= 20.6). Absent file is fine — the vars may already
// be exported, which is how CI and Vercel supply them.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env; fall through to whatever is already in the environment
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const missing = Object.entries({
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
})
  .filter(([, v]) => !v || v.startsWith('<'))
  .map(([k]) => k);

if (missing.length) {
  console.error(
    `Missing Cloudinary credentials: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill them in — the API secret is under\n' +
      'Cloudinary → Settings → API Keys → View API Keys.',
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  // Delivery URLs must be https; the default is protocol-relative, which breaks
  // when a URL is pasted into a schema field or an email.
  secure: true,
});

export { cloudinary };

/** Upload a local path or a remote URL. Re-running with the same id replaces it. */
export const upload = (source, publicId) =>
  cloudinary.uploader.upload(source, {
    ...(publicId ? { public_id: publicId } : {}),
    overwrite: true,
  });

/**
 * Delivery URL with automatic format and quality — Cloudinary picks AVIF/WebP
 * per browser and tunes compression per image, which is the whole reason to
 * serve through it rather than from public/.
 */
export const optimized = (publicId, opts = {}) =>
  cloudinary.url(publicId, { fetch_format: 'auto', quality: 'auto', ...opts });

/** Optimised and cropped to a box, with the subject kept in frame. */
export const cropped = (publicId, width, height) =>
  optimized(publicId, { crop: 'auto', gravity: 'auto', width, height });

// ---------------------------------------------------------------------------
// CLI. Only runs when invoked directly, so importing the helpers is side-effect
// free apart from the config above.
// ---------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith('cloudinary.mjs')) {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'upload') {
    const [source, publicId] = args;
    if (!source) {
      console.error('usage: node scripts/cloudinary.mjs upload <file|url> [public_id]');
      process.exit(1);
    }
    const result = await upload(source, publicId);
    console.log(`uploaded  ${result.public_id}  ${result.width}x${result.height}  ${result.format}`);
    console.log(`raw       ${result.secure_url}`);
    console.log(`optimized ${optimized(result.public_id)}`);
    console.log(`square    ${cropped(result.public_id, 500, 500)}`);
  } else if (command === 'url') {
    const [publicId, width, height] = args;
    if (!publicId) {
      console.error('usage: node scripts/cloudinary.mjs url <public_id> [width] [height]');
      process.exit(1);
    }
    console.log(
      width && height
        ? cropped(publicId, Number(width), Number(height))
        : optimized(publicId),
    );
  } else {
    console.log(
      'usage:\n' +
        '  node scripts/cloudinary.mjs upload <file|url> [public_id]\n' +
        '  node scripts/cloudinary.mjs url <public_id> [width] [height]',
    );
    process.exit(command ? 1 : 0);
  }
}
