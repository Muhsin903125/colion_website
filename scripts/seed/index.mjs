/**
 * Build `src/data/content.seed.json` from the modules in this folder.
 *
 *   node scripts/seed/index.mjs      (npm run seed)
 *
 * The seed is the site's fallback content and the starting point the CMS is
 * filled from (`npm run seed:push`). Every local image reference gets its
 * width and height read from the file, so the templates can reserve the box
 * and the layout does not shift as images arrive.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { brands } from './brands.mjs';
import { categories } from './categories.mjs';
import { faqGroups } from './faqs.mjs';
import { gallery } from './gallery.mjs';
import { locations } from './locations.mjs';
import { pages } from './pages.mjs';
import { services } from './services.mjs';
import { credentials, features, nav, seo, site, stats, team, testimonials } from './site.mjs';

const root = resolve(import.meta.dirname, '../..');

const content = {
  site,
  nav,
  seo,
  features,
  stats,
  credentials,
  services,
  productCategories: categories,
  brands,
  locations,
  team,
  testimonials,
  gallery,
  faqGroups,
  pages,
  media: { folder: 'colion' },
  // Stamped when the seed is rebuilt, so sitemap lastmod and dateModified
  // reflect the latest content rather than a fixed date.
  updatedAt: new Date().toISOString(),
  sections: {},
};

/** Walk the document and size every local image. */
const missing = new Set();
const dims = new Map();
async function size(node) {
  if (Array.isArray(node)) {
    for (const item of node) await size(item);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.publicId === 'string' && 'width' in node && node.publicId.startsWith('/')) {
    const file = resolve(root, 'public', node.publicId.slice(1));
    if (!existsSync(file)) {
      missing.add(node.publicId);
    } else if (!node.publicId.endsWith('.svg')) {
      if (!dims.has(file)) {
        const m = await sharp(file).metadata();
        dims.set(file, { width: m.width, height: m.height });
      }
      Object.assign(node, dims.get(file));
    }
  }
  for (const value of Object.values(node)) await size(value);
}
await size(content);

/** Videos must exist too — a missing clip is a black box on the live site. */
const videos = JSON.stringify(content).match(/"\/videos\/[^"]+"/g) ?? [];
for (const v of new Set(videos)) {
  const path = v.slice(1, -1);
  if (!existsSync(resolve(root, 'public', path.slice(1)))) missing.add(path);
}

if (missing.size) {
  console.error(`[seed] ${missing.size} missing file(s):\n  ${[...missing].join('\n  ')}`);
  process.exit(1);
}

writeFileSync(resolve(root, 'src/data/content.seed.json'), `${JSON.stringify(content, null, 2)}\n`);
console.log(
  `[seed] wrote content.seed.json — ${services.length} services, ${categories.length} categories, ${brands.length} brands, ${locations.length} emirates, ${gallery.length} gallery items, ${Object.keys(pages).length} pages`,
);
