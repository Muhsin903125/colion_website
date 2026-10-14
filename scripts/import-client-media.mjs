/**
 * The owner's own photos and reels → what the site serves.
 *
 *   node scripts/import-client-media.mjs
 *
 * Reads `source-media/client/photos/*.jpg` and `source-media/client/videos/*.mp4`
 * (gitignored originals — WhatsApp exports, phone footage) and writes:
 *
 *   public/images/gallery/<name>.webp        1280px long edge, plus a 480px thumb
 *   public/videos/reels/<name>.mp4           ≤ 720×1280, H.264 + AAC (sound kept
 *                                            for the lightbox; muted in rails)
 *   public/videos/reels/<name>-loop.mp4      first 8 seconds, silent — the rail
 *                                            and hero preview, a fraction of the size
 *   public/images/gallery/<name>.webp        the reel's poster frame
 *
 * This is the one-off import of the launch set. Day-to-day additions go
 * through the admin's Gallery tab, which uploads straight to Cloudinary.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const photos = resolve(root, 'source-media/client/photos');
const videos = resolve(root, 'source-media/client/videos');
const imgOut = resolve(root, 'public/images/gallery');
const vidOut = resolve(root, 'public/videos/reels');
mkdirSync(imgOut, { recursive: true });
mkdirSync(vidOut, { recursive: true });

/** Where each reel's poster frame is taken — past any title card or blur. */
const POSTER_AT = { 'reel-01': 7, 'reel-04': 5, 'reel-02': 2, 'reel-03': 1, 'reel-05': 3, 'reel-06': 1 };

if (existsSync(photos)) {
  for (const file of readdirSync(photos).filter((f) => /\.jpe?g$/i.test(f))) {
    const name = basename(file).replace(/\.jpe?g$/i, '');
    const input = resolve(photos, file);
    await sharp(input).rotate().resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(resolve(imgOut, `${name}.webp`));
    await sharp(input).rotate().resize({ width: 480, height: 480, fit: 'inside' }).webp({ quality: 70 }).toFile(resolve(imgOut, `${name}-sm.webp`));
  }
  console.log('  photos done');
}

if (existsSync(videos)) {
  for (const file of readdirSync(videos).filter((f) => f.endsWith('.mp4'))) {
    const name = basename(file, '.mp4');
    const input = resolve(videos, file);
    const scale = "scale='min(720,iw)':-2:flags=lanczos";
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', input, '-vf', `${scale},fps=30`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', resolve(vidOut, `${name}.mp4`)]);
    const at = POSTER_AT[name] ?? 1;
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(at), '-t', '8', '-i', input, '-an', '-vf', `${scale},fps=25`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '29', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(vidOut, `${name}-loop.mp4`)]);
    const poster = resolve(vidOut, `${name}.jpg`);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(at), '-i', input, '-frames:v', '1', '-q:v', '3', poster]);
    await sharp(poster).webp({ quality: 74 }).toFile(resolve(imgOut, `${name}.webp`));
    console.log(`  ${name} done`);
  }
}

console.log('[client media] imported');
