/**
 * Validate the committed seed against the CMS schema, the cross-references,
 * and the quality gate.
 *
 *   npm run seed:validate
 *
 * Fails on a schema error or a broken reference — the same checks a save in
 * the admin runs. Prints, but does not fail on, the programmatic pages the
 * quality gate keeps out of the index, so the list of pages still waiting for
 * copy is visible on every run.
 */
import seed from '../src/data/content.seed.json' with { type: 'json' };
import { checkReferences, parseContent } from '../src/data/schema';
import { verdict, type PageKind } from '../src/data/quality';

const content = parseContent(seed);
const problems = checkReferences(content);

if (problems.length) {
  console.error(`[seed] ${problems.length} reference problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

const report = (kind: PageKind, items: any[]) => {
  const results = items.map((i) => ({ slug: i.slug, v: verdict(kind, i) }));
  const indexed = results.filter((r) => r.v.index);
  console.log(`  ${kind.padEnd(9)} ${indexed.length}/${items.length} indexable`);
  for (const r of results.filter((r) => !r.v.index && !r.v.forced)) {
    if (kind !== 'brand') console.log(`    ✗ ${r.slug}: ${r.v.reasons.join('; ')}`);
  }
  return indexed.length;
};

console.log('[seed] schema and references OK');
report('service', content.services);
report('category', content.productCategories);
report('brand', content.brands);
report('location', content.locations);
