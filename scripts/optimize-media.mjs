/**
 * Turn `source-media/` into the images the site ships in `public/images/`.
 *
 *   node scripts/optimize-media.mjs
 *
 * The old site served its originals directly — a 1.1 MB about photo, a 466 KB
 * HP logo — which is most of why it was slow. Everything here is resized to the
 * largest size it is ever painted at and re-encoded as WebP.
 *
 * These local files are the seed's images, so the site renders fully before a
 * single asset is in Cloudinary. Once an editor uploads a replacement in the
 * admin, the CMS points at the Cloudinary id instead and `resolveImage()`
 * serves that; the two forms coexist (see src/lib/cloudinary.ts).
 *
 * Idempotent: re-running overwrites the outputs with identical files.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const src = (...p) => resolve(root, 'source-media', ...p);
const out = (...p) => resolve(root, 'public/images', ...p);

const ensure = (dir) => mkdirSync(dir, { recursive: true });

async function webp(input, output, { width, height, fit = 'inside', quality = 78 } = {}) {
  ensure(resolve(output, '..'));
  await sharp(input)
    .rotate()
    .resize({ width, height, fit, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(output);
}

/* ── brand ──────────────────────────────────────────────────────────────── */

ensure(out('brand'));
await sharp(src('brand/logo.png')).trim().resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(out('brand/colion-logo.png'));
await sharp(src('brand/logo.png')).trim().resize({ width: 640 }).webp({ quality: 90, alphaQuality: 100 }).toFile(out('brand/colion-logo.webp'));
/*
 * The same mark for dark grounds: navy letters become white, the gold shield
 * stays gold. Done per pixel because a CSS filter cannot recolour one hue and
 * keep the other.
 */
{
  const base = sharp(src('brand/logo.png')).trim().resize({ width: 640 }).ensureAlpha();
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const gold = r > 150 && g > 110 && b < 140 && r > b + 40;
    if (a > 0 && !gold) {
      // Navy → white, keeping the anti-aliased edge as alpha. Near-white
      // background pixels (if any) become transparent.
      const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(a * Math.max(0, Math.min(1, (1 - lum) * 1.6)));
    }
  }
  await sharp(data, { raw: info }).webp({ quality: 92, alphaQuality: 100 }).toFile(out('brand/colion-logo-white.webp'));
}
await sharp(src('brand/about.jpg')).resize({ width: 1400 }).webp({ quality: 76 }).toFile(out('brand/about-team.webp'));

/* Favicons: the gold shield alone reads at 32px; the whole wordmark does not. */
// Found by colour rather than by position: the bounding box of the gold pixels.
const { data, info } = await sharp(src('brand/logo.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
let [x0, y0, x1, y1] = [info.width, info.height, 0, 0];
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r > 170 && g > 130 && g < 200 && b < 120) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
}
const shield = await sharp(src('brand/logo.png'))
  .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
  .toBuffer();
await sharp(shield).resize({ height: 256 }).png().toFile(out('brand/colion-shield.png'));
// The tab icon is the original gold lion shield (source-media/brand/favicon.png)
// on a transparent square. iOS fills transparency with black, so the
// home-screen icon gets a white square instead.
const lion = await sharp(src('brand/favicon.png')).trim().toBuffer();
for (const [name, size, bg] of [['favicon-32.png', 32, 0], ['icon-512.png', 512, 0], ['apple-touch-icon.png', 180, 1]]) {
  const mark = await sharp(lion).resize({ height: Math.round(size * (bg ? 0.74 : 0.96)) }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: bg } } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(resolve(root, 'public', name));
}

/* ── brand logos ────────────────────────────────────────────────────────── */

/**
 * source filename → slug. Duplicates in the old folder ("Konica Minolta.png"
 * vs "Konica-Minolta.png", "Logitech copy.png") are dropped by omission.
 */
const LOGOS = {
  'acer.png': 'acer',
  'ADATA.png': 'adata',
  'amd.png': 'amd',
  'apc.png': 'apc',
  'apple.png': 'apple',
  'Aruba.jpg': 'aruba',
  'asus.png': 'asus',
  'brother.png': 'brother',
  'canon.png': 'canon',
  'cisco.png': 'cisco',
  'Corsair.jpg': 'corsair',
  'Crucial (Micron).png': 'crucial',
  'CyberPower.png': 'cyberpower',
  'D-Link.png': 'd-link',
  'dell.png': 'dell',
  'Eaton.png': 'eaton',
  'epson.svg': 'epson',
  'Fortinet.svg': 'fortinet',
  'G.Skill.svg': 'g-skill',
  'hp.png': 'hp',
  'Huawei.png': 'huawei',
  'HyperX.png': 'hyperx',
  'intel.png': 'intel',
  'Juniper.png': 'juniper',
  'kaspersky.png': 'kaspersky',
  'kingston.png': 'kingston',
  'Konica-Minolta.png': 'konica-minolta',
  'Kyocera.png': 'kyocera',
  'lenovo.png': 'lenovo',
  'LG.png': 'lg',
  'linksys.png': 'linksys',
  'logitech.png': 'logitech',
  'mercury.png': 'mercury',
  'microsoft.png': 'microsoft',
  'Mikrotik.png': 'mikrotik',
  'msi.jpg': 'msi',
  'Netgear.png': 'netgear',
  'philips.png': 'philips',
  'Razer.svg': 'razer',
  'ricoh.png': 'ricoh',
  'samsung.png': 'samsung',
  'seagate.png': 'seagate',
  'TeamGroup.png': 'teamgroup',
  'toshiba.png': 'toshiba',
  'tplink.png': 'tp-link',
  'Ubiquiti.png': 'ubiquiti',
  'Wacom.png': 'wacom',
  'western-digital.png': 'western-digital',
  'xerox.png': 'xerox',
};

ensure(out('brands'));
for (const [file, slug] of Object.entries(LOGOS)) {
  const input = src('brands', file);
  if (!existsSync(input)) {
    console.warn(`  missing logo ${file}`);
    continue;
  }
  if (extname(file) === '.svg') {
    copyFileSync(input, out('brands', `${slug}.svg`));
    continue;
  }
  // Trimmed so every mark fills its box the same way; a JPG with a white
  // ground is flattened onto white so the grid reads as one surface.
  const flat = /\.jpe?g$/i.test(file);
  let pipe = sharp(input).trim({ threshold: 18 });
  if (flat) pipe = pipe.flatten({ background: '#ffffff' });
  await pipe
    .resize({ width: 360, height: 160, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(out('brands', `${slug}.webp`));
}

/* ── product photography ────────────────────────────────────────────────── */

/** old file → new name, by what it actually shows. */
const PRODUCTS = {
  'product-4.jpeg': 'printer-hp-office',
  'product-12.jpg': 'desktop-workstation-tower',
  'product-5.jpg': 'monitors-desktops-lineup',
  'product-03.png': 'all-in-one-pc',
  'product-06.png': 'all-in-one-pc-compact',
  'product-05.png': 'projector-portable',
  'product-2.jpeg': 'server-rack-dell',
  'product-01.png': 'router-switch-stack',
  'product-7.jpeg': 'wifi-router',
  'product-10.jpg': 'router-home-office',
  'product-3.jpeg': 'network-switch-cabling',
  'product-02.png': 'ups-tower-range',
  'product-07.png': 'ups-desktop',
  'product-8.jpg': 'ups-online-rack',
  'product-04.png': 'ethernet-cable',
  'product-1.jpeg': 'laptop-business',
  'product-11.jpg': 'tablet-pen',
  'product-6.jpg': 'external-ssd',
  'product-9.jpg': 'cctv-camera',
};

for (const [file, name] of Object.entries(PRODUCTS)) {
  await webp(src('products', file), out('products', `${name}.webp`), { width: 1200 });
}

/* ── places (Wikimedia Commons — see CREDITS.md) ────────────────────────── */

for (const file of readdirSync(src('stock/places'))) {
  await webp(src('stock/places', file), out('places', `${basename(file, extname(file))}.webp`), { width: 1600, quality: 74 });
}

/* ── stills from the background clips (Mixkit — see CREDITS.md) ─────────── */

const posters = resolve(root, 'public/videos');
if (existsSync(posters)) {
  for (const file of readdirSync(posters).filter((f) => f.endsWith('.jpg'))) {
    await webp(resolve(posters, file), out('stills', `${basename(file, '.jpg')}.webp`), { width: 1280, quality: 74 });
  }
}

console.log('[media] optimized into public/images');
