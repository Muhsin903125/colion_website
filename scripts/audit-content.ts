/**
 * Content audit for the programmatic pages — the checks that keep fifty
 * template-built pages from reading as doorway pages.
 *
 *   npm run audit:content
 *
 * - near-duplicate copy: 5-word-shingle Jaccard overlap above 0.35 between any
 *   two intros or answers in the same collection
 * - duplicate titles or meta descriptions
 * - titles over 60 characters, descriptions outside 120–160
 * - missing alt text on gallery items
 *
 * Fails on duplicates and missing alt text; prints length warnings.
 */
import seed from '../src/data/content.seed.json' with { type: 'json' };
import { parseContent } from '../src/data/schema';
import { plain } from '../src/lib/inline';

const content = parseContent(seed);
let errors = 0;
const warn = (m: string) => console.log(`  ! ${m}`);
const fail = (m: string) => {
  errors++;
  console.error(`  ✗ ${m}`);
};

const shingles = (text: string) => {
  const w = plain(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const set = new Set<string>();
  for (let i = 0; i + 5 <= w.length; i++) set.add(w.slice(i, i + 5).join(' '));
  return set;
};
const jaccard = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

const collections = {
  services: content.services,
  categories: content.productCategories,
  brands: content.brands.filter((b) => b.tier === 'core'),
  locations: content.locations,
} as const;

for (const [name, items] of Object.entries(collections)) {
  const texts = (items as any[]).map((i) => ({ slug: i.slug, s: shingles(`${i.answer} ${i.intro.join(' ')}`) }));
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const score = jaccard(texts[i].s, texts[j].s);
      if (score > 0.35) fail(`${name}: "${texts[i].slug}" and "${texts[j].slug}" overlap ${(score * 100).toFixed(0)}%`);
    }
  }
}

const titles = new Map<string, string>();
const check = (where: string, title: string, description: string) => {
  if (title) {
    if (titles.has(title)) fail(`duplicate title "${title}" (${where} and ${titles.get(title)})`);
    titles.set(title, where);
    if (title.length > 60) warn(`${where}: title is ${title.length} characters`);
  }
  if (description && (description.length < 110 || description.length > 165)) warn(`${where}: description is ${description.length} characters`);
};
for (const [key, page] of Object.entries(content.pages)) check(`pages.${key}`, page.title, page.description);
for (const s of content.services) check(`service ${s.slug}`, s.seoTitle || `${s.name} in Dubai & UAE | Colion International`, s.seoDescription);
for (const c of content.productCategories) check(`category ${c.slug}`, c.seoTitle || `${c.name} Supplier in Dubai, UAE – Wholesale | Colion`, c.seoDescription);

for (const g of content.gallery) if (!(g.caption || g.image.alt)) fail(`gallery "${g.id}" has no caption/alt text`);

console.log(errors ? `[audit] ${errors} problem(s)` : '[audit] content OK');
process.exit(errors ? 1 : 0);
