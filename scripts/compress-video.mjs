/**
 * Background videos: compress the source clips into what the site serves.
 *
 *   node scripts/compress-video.mjs           # encode everything in CLIPS
 *   node scripts/compress-video.mjs --check   # only verify sizes against budget
 *
 * Every clip is a silent, looping background, so the encode throws away
 * everything a background does not need: audio, resolution above 720p, and the
 * last few seconds of a long take. `+faststart` moves the index to the front of
 * the file so playback starts before the download finishes.
 *
 * Three files per clip:
 *   <name>.mp4        1280×720, H.264 — every browser
 *   <name>-m.mp4      960×540, H.264  — phones (the `srcMobile` source)
 *   <name>.jpg        first frame     — the poster, shown until the clip plays
 *                                       and permanently under reduced motion
 *
 * Sources live in `source-media/` (gitignored); the outputs in
 * `public/videos/` are committed and served by Vercel's CDN with an immutable
 * cache header (see vercel.json).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'public/videos');
mkdirSync(out, { recursive: true });

/** Budgets in bytes. A clip over budget fails `--check`. */
const BUDGET = { desktop: 2.6 * 1024 * 1024, mobile: 1.1 * 1024 * 1024 };

/**
 * name → source, start second, duration.
 * Credits for the Mixkit clips are in CREDITS.md.
 */
const CLIPS = [
  { name: 'hero-datacenter', src: 'stock/video/mixkit-22966.mp4', ss: 0, t: 10 },
  { name: 'dubai-skyline', src: 'video/technology-bg.mp4', ss: 0, t: 12 },
  { name: 'dubai-street', src: 'video/services-bg.mp4', ss: 0, t: 9 },
  { name: 'server-corridor', src: 'stock/video/mixkit-23219.mp4', ss: 0, t: 10 },
  { name: 'server-lights', src: 'stock/video/mixkit-23215.mp4', ss: 0, t: 10 },
  { name: 'engineer-rack', src: 'stock/video/mixkit-23218.mp4', ss: 0, t: 10 },
  { name: 'printer', src: 'stock/video/mixkit-25260.mp4', ss: 0, t: 10 },
  { name: 'courier', src: 'stock/video/mixkit-31267.mp4', ss: 0, t: 10 },
  { name: 'warehouse-team', src: 'stock/video/mixkit-23550.mp4', ss: 0, t: 10 },
  { name: 'truck', src: 'stock/video/mixkit-23011.mp4', ss: 0, t: 10 },
  { name: 'meeting', src: 'stock/video/mixkit-22961.mp4', ss: 0, t: 10 },
  { name: 'circuit', src: 'stock/video/mixkit-47051.mp4', ss: 0, t: 10 },
  { name: 'tech-cabling', src: 'stock/video/mixkit-23374.mp4', ss: 0, t: 10 },
  { name: 'rack-install', src: 'stock/video/mixkit-23375.mp4', ss: 0, t: 10 },
  { name: 'fibre-network', src: 'stock/video/mixkit-47050.mp4', ss: 0, t: 10 },
  { name: 'presenter-display', src: 'stock/video/mixkit-42648.mp4', ss: 0, t: 10 },
  { name: 'meeting-display', src: 'stock/video/mixkit-42666.mp4', ss: 0, t: 10 },
  { name: 'office-laptops', src: 'stock/video/mixkit-42617.mp4', ss: 0, t: 10 },
  { name: 'laptop-typing', src: 'stock/video/mixkit-42653.mp4', ss: 0, t: 10 },
  { name: 'server-racks', src: 'stock/video/mixkit-7887.mp4', ss: 0, t: 10 },
  { name: 'parcel-delivery', src: 'stock/video/mixkit-42130.mp4', ss: 0, t: 10 },
  { name: 'team-laptop', src: 'stock/video/mixkit-261.mp4', ss: 0, t: 10 },
  { name: 'projector-room', src: 'stock/video/mixkit-24068.mp4', ss: 0, t: 10 },
  { name: 'control-room', src: 'stock/video/mixkit-23712.mp4', ss: 0, t: 10 },
];

const CHECK = process.argv.includes('--check');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

function encode(input, output, width, crf, ss, t) {
  execFileSync(ffmpeg, [
    '-y', '-loglevel', 'error',
    '-ss', String(ss), '-t', String(t),
    '-i', input,
    '-an',
    '-vf', `scale=${width}:-2:flags=lanczos,fps=25`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
    '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    output,
  ]);
}

/** Re-encode at a higher CRF until the file is under budget. */
function encodeWithin(input, output, width, budget, ss, t) {
  for (const crf of [28, 30, 32, 34, 36]) {
    encode(input, output, width, crf, ss, t);
    if (statSync(output).size <= budget) return crf;
  }
  return 36;
}

let failed = 0;

for (const clip of CLIPS) {
  if (only.length && !only.includes(clip.name)) continue;
  const input = resolve(root, 'source-media', clip.src);
  const desktop = resolve(out, `${clip.name}.mp4`);
  const mobile = resolve(out, `${clip.name}-m.mp4`);
  const poster = resolve(out, `${clip.name}.jpg`);

  if (!CHECK) {
    if (!existsSync(input)) {
      console.warn(`  skip ${clip.name}: ${clip.src} not found`);
      continue;
    }
    const c1 = encodeWithin(input, desktop, 1280, BUDGET.desktop, clip.ss, clip.t);
    const c2 = encodeWithin(input, mobile, 960, BUDGET.mobile, clip.ss, clip.t);
    execFileSync(ffmpeg, [
      '-y', '-loglevel', 'error', '-ss', String(clip.ss + 0.5), '-i', input,
      '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '5', poster,
    ]);
    console.log(`  ${clip.name.padEnd(18)} ${kb(statSync(desktop).size).padStart(8)} (crf ${c1})  mobile ${kb(statSync(mobile).size).padStart(7)} (crf ${c2})  poster ${kb(statSync(poster).size)}`);
  }

  for (const [file, budget] of [[desktop, BUDGET.desktop], [mobile, BUDGET.mobile]]) {
    if (!existsSync(file)) continue;
    if (statSync(file).size > budget) {
      failed++;
      console.error(`  over budget: ${file} ${kb(statSync(file).size)} > ${kb(budget)}`);
    }
  }
}

if (failed) process.exit(1);
console.log(CHECK ? '[video] every clip is within budget' : '[video] done');
