/**
 * The site's data, read at request time.
 *
 * Every page and component calls `load()` in its frontmatter. It reads the CMS
 * document from the store, builds the lookups the templates need, and caches
 * the result briefly so one render does not make a dozen round trips.
 *
 * Pages are ISR-cached at Vercel's edge, so this runs once per publish per
 * path, not once per visitor.
 */
import { readContent } from '../lib/cms/store';
import { isLocal, resolveImage } from '../lib/cloudinary';
import { verdict, type PageKind, type Verdict } from './quality';
import type {
  Brand,
  Category,
  Content,
  Emirate,
  FaqItem,
  GalleryItem,
  Service,
  TeamMember,
  Testimonial,
} from './schema';

/** The wordmark shipped with the site, used until an editor uploads one. */
export const SHIPPED_LOGO = { src: '/images/brand/colion-logo.webp', width: 640, height: 159 };

export interface SiteData {
  content: Content;
  site: Content['site'];
  nav: Content['nav'];
  seo: Content['seo'];
  features: Content['features'];
  stats: Content['stats'];
  credentials: Content['credentials'];
  registration: Content['registration'];

  logo: { src: string; width: number; height: number };
  /** Where the business is. `showroom` is the store customers walk into. */
  corporate: Content['site']['locations'][number] | undefined;
  showroom: Content['site']['locations'][number] | undefined;
  /** Every walk-in branch, in the order the CMS lists them. */
  stores: Content['site']['locations'];

  services: Service[];
  categories: Category[];
  brands: Brand[];
  coreBrands: Brand[];
  emirates: Emirate[];
  team: TeamMember[];
  /** Real people only — the ones that may appear in structured data. */
  realTeam: TeamMember[];
  testimonials: Testimonial[];
  /** Newest first. */
  gallery: GalleryItem[];
  reels: GalleryItem[];

  faqGroups: Content['faqGroups'];
  allFaqs: FaqItem[];
  topFaqs: FaqItem[];
  socialLinks: Content['site']['social'];

  service: (slug: string) => Service | undefined;
  category: (slug: string) => Category | undefined;
  brand: (slug: string) => Brand | undefined;
  emirate: (slug: string) => Emirate | undefined;
  member: (id: string) => TeamMember | undefined;

  /** Brands stocked in a category: the category's own list, plus any brand that names it. */
  brandsIn: (categorySlug: string) => Brand[];
  categoriesOf: (brand: Brand) => Category[];
  servicesFor: (categorySlug: string) => Service[];
  galleryFor: (filter: { category?: string; brand?: string; service?: string; location?: string; tag?: string }) => GalleryItem[];

  /** The quality gate's verdict for one programmatic page. */
  verdictFor: (kind: PageKind, item: any) => Verdict;
  indexable: {
    services: Service[];
    categories: Category[];
    brands: Brand[];
    emirates: Emirate[];
  };

  waLink: (message?: string) => string;
  telLink: string;
  href: (value: string) => string;
}

const bySlug = <T extends { slug: string }>(items: T[]) => {
  const map = new Map(items.map((i) => [i.slug, i]));
  return (slug: string) => map.get(slug);
};

/** Build every view from one document. Pure — no I/O. */
export function build(content: Content): SiteData {
  const { site } = content;

  const uploaded = resolveImage(content.site.logo.onLight, { width: 640 });
  const logo = uploaded
    ? {
        src: uploaded,
        width: content.site.logo.onLight.width ?? SHIPPED_LOGO.width,
        height: content.site.logo.onLight.height ?? SHIPPED_LOGO.height,
      }
    : SHIPPED_LOGO;

  const services = content.services;
  const categories = content.productCategories;
  const brands = content.brands;
  const emirates = content.locations;

  const service = bySlug(services);
  const category = bySlug(categories);
  const brand = bySlug(brands);
  const emirate = bySlug(emirates);

  const gallery = [...content.gallery].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const faqGroups = content.faqGroups;
  const allFaqs = faqGroups.flatMap((g) => g.items);

  const cache = new Map<string, Verdict>();
  const verdictFor = (kind: PageKind, item: any) => {
    const key = `${kind}:${item.slug}`;
    if (!cache.has(key)) cache.set(key, verdict(kind, item));
    return cache.get(key)!;
  };

  const waLink = (message = '') =>
    `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return {
    content,
    site,
    nav: content.nav,
    seo: content.seo,
    features: content.features,
    stats: content.stats,
    credentials: content.credentials,
    registration: content.registration,

    logo,
    corporate: site.locations.find((l) => l.id === 'corporate') ?? site.locations[0],
    showroom: site.locations.find((l) => l.id === 'showroom') ?? site.locations.find((l) => l.kind === 'store') ?? site.locations[1],
    stores: site.locations.filter((l) => l.kind === 'store'),

    services,
    categories,
    brands,
    coreBrands: brands.filter((b) => b.tier === 'core'),
    emirates,
    team: content.team,
    realTeam: content.team.filter((t) => !t.placeholder),
    testimonials: content.testimonials,
    gallery,
    reels: gallery.filter((g) => g.kind === 'reel'),

    faqGroups,
    allFaqs,
    topFaqs: allFaqs.filter((f) => f.top),
    /** Only real profiles; a placeholder is a dead link and poisons `sameAs`. */
    socialLinks: site.social.filter((s) => /^https?:\/\//.test(s.href)),

    service,
    category,
    brand,
    emirate,
    member: (id) => content.team.find((t) => t.id === id),

    brandsIn: (slug) => {
      const own = category(slug)?.brands ?? [];
      return brands.filter((b) => own.includes(b.slug) || b.categories.includes(slug));
    },
    categoriesOf: (b) => categories.filter((c) => b.categories.includes(c.slug) || c.brands.includes(b.slug)),
    servicesFor: (slug) => services.filter((s) => s.categories.includes(slug) || category(slug)?.service === s.slug),
    galleryFor: (f) =>
      gallery.filter(
        (g) =>
          (f.category && g.category === f.category) ||
          (f.brand && g.brand === f.brand) ||
          (f.service && g.service === f.service) ||
          (f.location && g.location === f.location) ||
          (f.tag && g.tags.includes(f.tag)),
      ),

    verdictFor,
    indexable: {
      services: services.filter((s) => verdictFor('service', s).index),
      categories: categories.filter((c) => verdictFor('category', c).index),
      brands: brands.filter((b) => verdictFor('brand', b).index),
      emirates: emirates.filter((e) => verdictFor('location', e).index),
    },

    waLink,
    telLink: `tel:${site.phone.replace(/[^\d+]/g, '')}`,
    /** A `wa:` href becomes a WhatsApp deep link with the rest as the message. */
    href: (value: string) => (value.startsWith('wa:') ? waLink(value.slice(3)) : value),
  };
}

const TTL_MS = 5_000;
let cached: { data: SiteData; at: number } | null = null;

export async function load(): Promise<SiteData> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  const data = build(await readContent());
  cached = { data, at: Date.now() };
  return data;
}

/** Drop the cache. Called after a save so the next render is current. */
export const invalidate = () => {
  cached = null;
};

export { isLocal };
