/**
 * The sitemap, built from live content at request time (ISR-cached, purged on
 * Publish).
 *
 * - Only indexable URLs: a page the quality gate keeps `noindex` is left out,
 *   because listing a URL you also tell crawlers not to index is a mixed
 *   signal Search Console reports as an error.
 * - `lastmod` is the CMS write time for exactly what the page renders —
 *   per item (`brands.hp`), per page (`pages.about`) — so one edit re-dates one
 *   URL. A sitemap whose dates all move together teaches Google to ignore them.
 * - `image:image` and `video:video` entries put the real stock photos and
 *   reels into Google Images and video results.
 */
import type { APIRoute } from 'astro';
import { load } from '../data/load';
import { SITE_URL } from '../data/seo';
import { resolveImage, videoPoster, videoUrl } from '../lib/cloudinary';

export const prerender = false;

interface Entry {
  path: string;
  priority: number;
  changefreq: string;
  keys: string[];
  images?: { url: string; caption?: string }[];
  videos?: { content: string; thumb: string; title: string; description: string; duration?: number; date?: string }[];
}

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const abs = (u: string) => new URL(u, SITE_URL).toString();

export const GET: APIRoute = async () => {
  const d = await load();
  const { sections, updatedAt } = d.content;
  const lastmod = (...keys: string[]) => {
    const dates = keys.map((k) => sections?.[k]).filter(Boolean).sort();
    return dates.length ? dates[dates.length - 1] : (updatedAt ?? '2026-10-14T00:00:00.000Z');
  };
  const img = (ref: any, caption?: string) => {
    const url = resolveImage(ref, { width: 1600 });
    return url ? [{ url, caption: caption ?? ref?.alt }] : [];
  };

  const photos = d.gallery.filter((g) => g.kind === 'image');
  const reels = d.gallery.filter((g) => g.kind !== 'image');

  const entries: Entry[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly', keys: ['pages.home', 'services', 'productCategories', 'gallery'] },
    { path: '/products/', priority: 0.9, changefreq: 'weekly', keys: ['pages.products', 'productCategories'], images: d.categories.flatMap((c) => img(c.image, c.name)) },
    { path: '/services/', priority: 0.9, changefreq: 'monthly', keys: ['pages.services', 'services'], images: d.services.flatMap((s) => img(s.image, s.name)) },
    { path: '/contact/', priority: 0.9, changefreq: 'monthly', keys: ['pages.contact', 'site'] },
    { path: '/brands/', priority: 0.8, changefreq: 'monthly', keys: ['pages.brands', 'brands'] },
    { path: '/about/', priority: 0.8, changefreq: 'monthly', keys: ['pages.about', 'site'] },
    { path: '/locations/', priority: 0.7, changefreq: 'monthly', keys: ['pages.locations', 'locations'] },
    { path: '/faq/', priority: 0.7, changefreq: 'monthly', keys: ['faqGroups'] },
    {
      path: '/gallery/',
      priority: 0.7,
      changefreq: 'weekly',
      keys: ['pages.gallery', 'gallery'],
      images: photos.slice(0, 1000).flatMap((g) => img(g.image, g.caption || g.title)),
      videos: reels.map((g) => ({
        content: abs(videoUrl(g.video)),
        thumb: abs(resolveImage(g.image, { width: 900 }) || videoPoster(g.video)),
        title: g.title,
        description: g.caption || g.title,
        duration: g.duration,
        date: g.date,
      })),
    },
    ...d.indexable.services.map((s) => ({ path: `/services/${s.slug}/`, priority: 0.8, changefreq: 'monthly', keys: [`services.${s.slug}`], images: img(s.image, s.name) })),
    ...d.indexable.categories.map((c) => ({
      path: `/products/${c.slug}/`,
      priority: 0.8,
      changefreq: 'weekly',
      keys: [`productCategories.${c.slug}`],
      images: [...img(c.image, c.name), ...d.galleryFor({ category: c.slug }).filter((g) => g.kind === 'image').slice(0, 10).flatMap((g) => img(g.image, g.caption))],
    })),
    ...d.indexable.brands.map((b) => ({ path: `/brands/${b.slug}/`, priority: 0.7, changefreq: 'monthly', keys: [`brands.${b.slug}`], images: img(b.logo, `${b.name} logo`) })),
    ...d.indexable.emirates.map((e) => ({ path: `/locations/${e.slug}/`, priority: 0.6, changefreq: 'monthly', keys: [`locations.${e.slug}`], images: img(e.image, e.name) })),
    ...(d.realTeam.length ? [{ path: '/team/', priority: 0.5, changefreq: 'monthly', keys: ['pages.team', 'team'] }] : []),
    { path: '/privacy/', priority: 0.2, changefreq: 'yearly', keys: ['pages.privacy'] },
    { path: '/terms/', priority: 0.2, changefreq: 'yearly', keys: ['pages.terms'] },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries
  .map((e) => {
    const images = (e.images ?? [])
      .filter((i) => i.url)
      .map((i) => `    <image:image><image:loc>${xml(abs(i.url))}</image:loc>${i.caption ? `<image:caption>${xml(i.caption)}</image:caption>` : ''}</image:image>`)
      .join('\n');
    const videos = (e.videos ?? [])
      .map(
        (v) => `    <video:video>
      <video:thumbnail_loc>${xml(v.thumb)}</video:thumbnail_loc>
      <video:title>${xml(v.title)}</video:title>
      <video:description>${xml(v.description)}</video:description>
      <video:content_loc>${xml(v.content)}</video:content_loc>${v.duration ? `\n      <video:duration>${Math.round(v.duration)}</video:duration>` : ''}${v.date ? `\n      <video:publication_date>${v.date}</video:publication_date>` : ''}
    </video:video>`,
      )
      .join('\n');
    return `  <url>
    <loc>${xml(abs(e.path))}</loc>
    <lastmod>${lastmod(...e.keys)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>${images ? `\n${images}` : ''}${videos ? `\n${videos}` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
