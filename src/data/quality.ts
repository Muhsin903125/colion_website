/**
 * The quality gate for programmatic pages.
 *
 * Forty-odd brand pages and seven emirate pages built from one template are
 * exactly what a search engine's doorway-page and thin-content filters look
 * for. The defence is not to hide the template but to refuse to *index* a page
 * until it carries enough of its own substance: unique intro copy, an answer,
 * real FAQs, and the facts specific to its subject.
 *
 * A page that fails still renders — a visitor who follows a link gets a useful
 * page — but with `noindex, follow`, and it is left out of the sitemap and
 * `llms.txt`. The admin shows the same verdict, with the reasons, beside each
 * item, so filling in the missing pieces is how an editor promotes a page.
 *
 * Pure functions over plain objects, so the admin bundle can import this too.
 */

export type PageKind = 'service' | 'category' | 'brand' | 'location';

export interface Verdict {
  index: boolean;
  /** Why it is not indexable; empty when it is. */
  reasons: string[];
  forced: boolean;
}

export const words = (text: string | string[] | undefined) =>
  (Array.isArray(text) ? text.join(' ') : text ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Minimums. Deliberately modest: they gate emptiness, not prose style. */
export const RULES = {
  introWords: 120,
  answerMin: 30,
  answerMax: 70,
  faqs: 3,
  productLines: 3,
  areas: 3,
};

interface Indexable {
  indexOverride?: 'auto' | 'index' | 'noindex';
  answer?: string;
  intro?: string[];
  faqs?: { q: string; a: string }[];
  productLines?: string[];
  categories?: string[];
  districts?: string[];
  freeZones?: string[];
  noindex?: boolean;
}

export function verdict(kind: PageKind, item: Indexable): Verdict {
  if (item.indexOverride === 'index') return { index: true, reasons: [], forced: true };
  if (item.indexOverride === 'noindex') return { index: false, reasons: ['Set to “noindex” by an editor'], forced: true };

  const reasons: string[] = [];
  const intro = words(item.intro);
  if (intro < RULES.introWords) reasons.push(`Intro is ${intro} words; needs ${RULES.introWords}+`);

  const answer = words(item.answer);
  if (answer < RULES.answerMin || answer > RULES.answerMax) {
    reasons.push(`Answer is ${answer} words; should be ${RULES.answerMin}–${RULES.answerMax}`);
  }

  const faqs = (item.faqs ?? []).filter((f) => f.q.trim() && f.a.trim()).length;
  if (faqs < RULES.faqs) reasons.push(`${faqs} FAQs; needs ${RULES.faqs}+`);

  if (kind === 'brand') {
    if (!(item.categories ?? []).length) reasons.push('No product categories selected');
    const lines = (item.productLines ?? []).length;
    if (lines < RULES.productLines) reasons.push(`${lines} product lines; needs ${RULES.productLines}+`);
  }

  if (kind === 'location') {
    const areas = (item.districts ?? []).length + (item.freeZones ?? []).length;
    if (areas < RULES.areas) reasons.push(`${areas} districts/free zones; needs ${RULES.areas}+`);
  }

  return { index: reasons.length === 0, reasons, forced: false };
}

export const isIndexable = (kind: PageKind, item: Indexable) => verdict(kind, item).index;
