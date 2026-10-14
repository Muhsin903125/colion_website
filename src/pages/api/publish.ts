/**
 * Publish: make the saved draft public.
 *
 * Pages render from the store and Vercel caches them at the edge, so
 * publishing is a cache purge, not a rebuild: each path is re-requested with
 * `x-prerender-revalidate`, which re-renders it and caches the new copy.
 *
 * `?scope=changed` (what the admin sends after a gallery-only save) purges
 * only what the last save touched — the pages that render a changed key — so
 * a daily photo upload refreshes a handful of URLs instead of all ~100.
 * Everything else purges every path. `/sitemap.xml` and `/llms.txt` are always
 * included: they restate the content and must not lag it.
 */
import type { APIRoute } from 'astro';
import { load } from '../../data/load';
import { isSignedIn, json, unauthorized } from './_guard';

export const prerender = false;

const BATCH = 12;

export const POST: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();

  const token = import.meta.env.CMS_REVALIDATE_TOKEN;
  if (!token) {
    return json(
      { error: 'Publishing is not configured. Set CMS_REVALIDATE_TOKEN in the Vercel project settings and redeploy.' },
      503,
    );
  }

  const d = await load();
  const origin = new URL(context.request.url).origin;
  const scope = new URL(context.request.url).searchParams.get('scope');

  const statics = ['/', '/about/', '/team/', '/contact/', '/faq/', '/gallery/', '/services/', '/products/', '/brands/', '/locations/', '/privacy/', '/terms/'];
  const items = [
    ...d.services.map((s) => ({ key: `services.${s.slug}`, path: `/services/${s.slug}/` })),
    ...d.categories.map((c) => ({ key: `productCategories.${c.slug}`, path: `/products/${c.slug}/` })),
    ...d.brands.map((b) => ({ key: `brands.${b.slug}`, path: `/brands/${b.slug}/` })),
    ...d.emirates.map((e) => ({ key: `locations.${e.slug}`, path: `/locations/${e.slug}/` })),
  ];

  let paths: string[];
  if (scope === 'changed') {
    // The keys stamped by the most recent save.
    const stamps = Object.entries(d.content.sections);
    const latest = stamps.map(([, v]) => v).sort().pop();
    const changed = new Set(stamps.filter(([, v]) => v === latest).map(([k]) => k));
    const touched = (k: string) => changed.has(k);
    paths = [];
    if (touched('gallery')) paths.push('/', '/gallery/', '/about/', ...items.map((i) => i.path));
    for (const [key, path] of [
      ['pages.home', '/'], ['pages.about', '/about/'], ['pages.team', '/team/'], ['pages.contact', '/contact/'],
      ['pages.gallery', '/gallery/'], ['pages.services', '/services/'], ['pages.products', '/products/'],
      ['pages.brands', '/brands/'], ['pages.locations', '/locations/'], ['pages.privacy', '/privacy/'], ['pages.terms', '/terms/'],
    ] as const) if (touched(key)) paths.push(path);
    for (const item of items) if (touched(item.key)) paths.push(item.path);
    // Anything site-wide (header, footer, nav, schema facts) means every page.
    if (['site', 'nav', 'seo', 'features', 'stats', 'faqGroups', 'team', 'testimonials', 'credentials'].some(touched) || !paths.length) {
      paths = [...statics, ...items.map((i) => i.path)];
    }
  } else {
    paths = [...statics, ...items.map((i) => i.path)];
  }
  paths = [...new Set([...paths, '/sitemap.xml', '/llms.txt'])];

  const failed: string[] = [];
  for (let i = 0; i < paths.length; i += BATCH) {
    const batch = paths.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        const response = await fetch(new URL(path, origin), { headers: { 'x-prerender-revalidate': token } });
        if (!response.ok && response.status !== 404) throw new Error(`${path} → ${response.status}`);
        return path;
      }),
    );
    results.forEach((r, index) => r.status === 'rejected' && failed.push(batch[index]));
  }

  return json({
    published: true,
    at: new Date().toISOString(),
    scope: scope ?? 'all',
    revalidated: paths.length - failed.length,
    total: paths.length,
    ...(failed.length ? { failed } : {}),
  });
};
