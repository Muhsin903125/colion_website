/**
 * The structured-data layer.
 *
 * Everything here answers one question for a machine: *what is Colion
 * International, where is it, and what can it supply?* Classic search gets that
 * from links and keywords; answer engines (Google AI Overviews, ChatGPT search,
 * Perplexity, Copilot, Claude) get it from an unambiguous entity graph plus
 * extractable, self-contained sentences.
 *
 * Every page emits ONE `@graph`. Nodes are addressed by stable `@id`, so the
 * Organization is described once and referenced everywhere else instead of
 * being restated per page with slightly different facts — which is what makes
 * an entity look unreliable to a knowledge graph.
 *
 * Deliberately in code, not the CMS: a graph assembled by an editor is a broken
 * graph. The *facts* (addresses, hours, licence, vocabulary) are editable under
 * the admin's Site and SEO tabs; the shape they are poured into stays here.
 *
 * Two rules this file keeps:
 *   - No invented facts. No `aggregateRating` (self-serving reviews are
 *     ignored by Google and can earn a manual action), no address for an
 *     emirate Colion only delivers to, no Product price that is not set.
 *   - Placeholders never reach the graph. A team member or testimonial still
 *     marked placeholder is rendered on the page and omitted here.
 */
import { resolveImage } from '../lib/cloudinary';
import { plain } from '../lib/inline';
import type { SiteData } from './load';
import type { Brand, Category, Emirate, FaqItem, GalleryItem, Service, TeamMember } from './schema';
import { videoUrl } from '../lib/cloudinary';

/** Must match `site` in astro.config.mjs. */
export const SITE_URL = 'https://www.colioninternational.com';

export const ids = {
  org: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  logo: `${SITE_URL}/#logo`,
  showroom: `${SITE_URL}/#showroom`,
  corporate: `${SITE_URL}/#corporate-office`,
  catalog: `${SITE_URL}/#catalog`,
};

/** Absolute, properly encoded URL. */
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : new URL(encodeURI(path), SITE_URL).toString());

const EMIRATE_WIKI: Record<string, string> = {
  dubai: 'https://en.wikipedia.org/wiki/Dubai',
  'abu-dhabi': 'https://en.wikipedia.org/wiki/Abu_Dhabi',
  sharjah: 'https://en.wikipedia.org/wiki/Sharjah',
  ajman: 'https://en.wikipedia.org/wiki/Ajman',
  'ras-al-khaimah': 'https://en.wikipedia.org/wiki/Ras_Al_Khaimah',
  fujairah: 'https://en.wikipedia.org/wiki/Fujairah',
  'umm-al-quwain': 'https://en.wikipedia.org/wiki/Umm_Al_Quwain',
};

const area = (e: Emirate) => ({
  '@type': 'AdministrativeArea',
  name: e.name,
  ...(e.isoCode ? { identifier: e.isoCode } : {}),
  sameAs: e.wikipedia || EMIRATE_WIKI[e.slug],
});

const postal = (l: SiteData['site']['locations'][number]) => ({
  '@type': 'PostalAddress',
  streetAddress: [l.streetAddress, l.area].filter(Boolean).join(', '),
  addressLocality: l.locality,
  addressRegion: l.region,
  ...(l.postalCode ? { postalCode: l.postalCode } : {}),
  addressCountry: l.country,
});

const hours = (d: SiteData) =>
  d.seo.openingHours.days.length
    ? [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: d.seo.openingHours.days,
          opens: d.seo.openingHours.opens,
          closes: d.seo.openingHours.closes,
        },
      ]
    : undefined;

/** The root entity. */
export function buildOrganization(d: SiteData) {
  const { site, seo } = d;
  const corporate = d.corporate;
  const profiles = d.site.locations.map((l) => l.gbp.url).filter(Boolean);
  const sameAs = [...d.socialLinks.map((s) => s.href), ...profiles];

  return {
    '@type': 'Organization',
    '@id': ids.org,
    name: site.name,
    legalName: site.legalName,
    alternateName: seo.alternateName,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': ids.logo,
      url: abs(d.logo.src),
      width: d.logo.width,
      height: d.logo.height,
      caption: site.name,
    },
    image: abs(resolveImage(seo.defaultShare) || '/images/stills/hero-datacenter.webp'),
    slogan: site.tagline,
    description: plain(site.description),
    ...(site.founded ? { foundingDate: String(site.founded) } : {}),
    email: site.email,
    telephone: site.phone,
    ...(corporate ? { address: postal(corporate) } : {}),
    ...(seo.vatId ? { vatID: seo.vatId } : {}),
    ...(seo.tradeLicense ? { identifier: { '@type': 'PropertyValue', propertyID: 'Dubai Trade Licence', value: seo.tradeLicense } } : {}),
    /**
     * Where Colion sells, which is not the same claim as where it is. Each
     * emirate is named with its Wikipedia entity so "IT supplier in Sharjah"
     * resolves without a second, invented address.
     */
    areaServed: [...d.emirates.map(area), { '@type': 'Country', name: 'United Arab Emirates', sameAs: 'https://en.wikipedia.org/wiki/United_Arab_Emirates' }],
    knowsAbout: seo.knowsAbout,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: site.phone,
        email: site.email,
        areaServed: 'AE',
        availableLanguage: seo.languages.length ? seo.languages : ['English', 'Arabic'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        telephone: site.phone,
        areaServed: 'AE',
        availableLanguage: seo.languages.length ? seo.languages : ['English', 'Arabic'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': ids.catalog,
      name: `${site.name} IT hardware catalogue`,
      itemListElement: d.categories.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.name,
        url: abs(`/products/${c.slug}/`),
      })),
    },
    ...(d.credentials.length
      ? {
          hasCredential: d.credentials.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c.title,
            credentialCategory: c.kind,
            ...(c.issuer ? { recognizedBy: { '@type': 'Organization', name: c.issuer } } : {}),
          })),
        }
      : {}),
    ...(d.stores.length ? { department: d.stores.map((l) => ({ '@id': storeId(l.id) })) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Stable `@id` for a walk-in branch. The first keeps the original `#showroom`. */
export const storeId = (id: string) => (id === 'showroom' ? ids.showroom : `${SITE_URL}/#${id}`);

/**
 * The walk-in branches in Deira: the places a customer visits, so the nodes
 * Google's local results and Maps tie to. `ComputerStore` is the most
 * specific type schema.org has. Each carries its own pin and, where it has
 * one, its Google Business Profile as `hasMap` — never a shared or guessed one.
 */
export function buildStores(d: SiteData) {
  return d.stores.map((l) => ({
    '@type': 'ComputerStore',
    '@id': storeId(l.id),
    name: l.name || `${d.site.name} — ${l.label}`,
    parentOrganization: { '@id': ids.org },
    url: `${SITE_URL}/contact/`,
    telephone: l.phone || d.site.phone,
    email: d.site.email,
    image: abs(resolveImage(l.image) || '/images/places/deira.webp'),
    logo: { '@id': ids.logo },
    address: postal(l),
    ...(l.geo.lat ? { geo: { '@type': 'GeoCoordinates', latitude: l.geo.lat, longitude: l.geo.lng } } : {}),
    ...(l.gbp.url ? { hasMap: l.gbp.url } : l.mapUrl ? { hasMap: l.mapUrl } : {}),
    openingHoursSpecification: hours(d),
    ...(d.seo.priceRange ? { priceRange: d.seo.priceRange } : {}),
    currenciesAccepted: 'AED',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    areaServed: d.emirates.map(area),
  }));
}

export function buildWebsite(d: SiteData) {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: `${SITE_URL}/`,
    name: d.site.name,
    alternateName: d.seo.alternateName,
    description: plain(d.site.description),
    publisher: { '@id': ids.org },
    inLanguage: 'en-AE',
  };
}

/** One breadcrumb trail. Paths without the origin. */
export const breadcrumb = (trail: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  '@id': `${abs(trail[trail.length - 1].path)}#breadcrumb`,
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: abs(t.path),
  })),
});

/**
 * The page node. `speakable` names the two selectors a voice assistant reads:
 * the H1 and the answer-first paragraph every page leads with.
 */
export const webPage = (opts: {
  path: string;
  name: string;
  description: string;
  type?: string;
  breadcrumbId?: string;
  image?: string;
  about?: object;
  mainEntity?: object | object[];
  dateModified?: string | null;
  reviewedBy?: object;
}) => ({
  '@type': opts.type ?? 'WebPage',
  '@id': `${abs(opts.path)}#webpage`,
  url: abs(opts.path),
  name: opts.name,
  description: opts.description,
  isPartOf: { '@id': ids.website },
  about: opts.about ?? { '@id': ids.org },
  inLanguage: 'en-AE',
  ...(opts.breadcrumbId ? { breadcrumb: { '@id': opts.breadcrumbId } } : {}),
  ...(opts.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(opts.image) } } : {}),
  ...(opts.mainEntity ? { mainEntity: opts.mainEntity } : {}),
  ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  ...(opts.reviewedBy ? { reviewedBy: opts.reviewedBy } : {}),
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-answer]'] },
});

/** Question/Answer pairs, merged into the page node as `mainEntity`. */
export const faqEntity = (items: FaqItem[]) =>
  items
    .filter((f) => f.q && f.a)
    .map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } }));

/** A real person, for real profiles only. */
export const person = (m: TeamMember) =>
  m.placeholder
    ? null
    : {
        '@type': 'Person',
        '@id': `${SITE_URL}/team/#${m.id}`,
        name: m.name,
        jobTitle: m.role,
        description: m.bio,
        worksFor: { '@id': ids.org },
        ...(resolveImage(m.photo) ? { image: abs(resolveImage(m.photo, { width: 600 })) } : {}),
        ...(m.expertise.length ? { knowsAbout: m.expertise } : {}),
        ...(m.languages.length ? { knowsLanguage: m.languages } : {}),
        ...(() => {
          const sameAs = [m.linkedin, ...m.social.map((s) => s.href)].filter((h) => /^https?:\/\//.test(h));
          return sameAs.length ? { sameAs } : {};
        })(),
      };

export const serviceNode = (d: SiteData, s: Service) => ({
  '@type': 'Service',
  '@id': `${abs(`/services/${s.slug}/`)}#service`,
  name: s.name,
  serviceType: s.name,
  description: plain(s.answer),
  provider: { '@id': ids.org },
  areaServed: d.emirates.map(area),
  url: abs(`/services/${s.slug}/`),
  ...(resolveImage(s.image) ? { image: abs(resolveImage(s.image)) } : {}),
  ...(s.categories.length
    ? {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${s.name} — products`,
          itemListElement: s.categories
            .map((slug) => d.category(slug))
            .filter(Boolean)
            .map((c) => ({ '@type': 'OfferCatalog', name: c!.name, url: abs(`/products/${c!.slug}/`) })),
        },
      }
    : {}),
});

export const howTo = (name: string, steps: { title: string; body: string }[], path: string) => ({
  '@type': 'HowTo',
  '@id': `${abs(path)}#howto`,
  name,
  step: steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: plain(s.body),
  })),
});

export const itemList = (name: string, items: { name: string; url: string; image?: string }[], path: string) => ({
  '@type': 'ItemList',
  '@id': `${abs(path)}#list`,
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: abs(item.url),
    ...(item.image ? { image: abs(item.image) } : {}),
  })),
});

/** The manufacturer as a Brand entity, tied to its own site. */
export const brandNode = (b: Brand) => ({
  '@type': 'Brand',
  '@id': `${abs(`/brands/${b.slug}/`)}#brand`,
  name: b.name,
  ...(resolveImage(b.logo) ? { logo: abs(resolveImage(b.logo)) } : {}),
  ...(b.website ? { sameAs: [b.website] } : {}),
});

/** What Colion offers of one category — an OfferCatalog, plus Products only where priced. */
export const categoryCatalog = (d: SiteData, c: Category) => {
  const products = c.models
    .filter((m) => m.name)
    .map((m) => {
      const brand = d.brand(m.brand);
      return {
        '@type': 'Product',
        name: m.name,
        category: c.singular || c.name,
        ...(brand ? { brand: { '@type': 'Brand', name: brand.name } } : {}),
        ...(resolveImage(m.image) ? { image: abs(resolveImage(m.image)) } : {}),
        ...(m.highlights.length ? { description: m.highlights.join('. ') } : {}),
        ...(m.priceFrom > 0
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'AED',
                price: m.priceFrom,
                availability: 'https://schema.org/InStock',
                seller: { '@id': ids.org },
                url: abs(`/products/${c.slug}/`),
              },
            }
          : {}),
      };
    })
    // A Product with no offer, review or rating is reported as invalid by
    // Google's rich-result test. Unpriced models stay on the page as copy.
    .filter((p: any) => p.offers);

  return {
    '@type': 'OfferCatalog',
    '@id': `${abs(`/products/${c.slug}/`)}#catalog`,
    name: `${c.name} from ${d.site.name}`,
    itemListElement: [
      ...d.brandsIn(c.slug).map((b) => ({
        '@type': 'OfferCatalog',
        name: `${b.name} ${c.name}`,
        url: abs(`/brands/${b.slug}/`),
      })),
      ...products,
    ],
  };
};

/** An area-served Service for one emirate — never a LocalBusiness with an invented address. */
export const deliveryService = (d: SiteData, e: Emirate) => ({
  '@type': 'Service',
  '@id': `${abs(`/locations/${e.slug}/`)}#service`,
  name: `IT hardware supply and delivery in ${e.name}`,
  serviceType: 'IT hardware supply',
  description: plain(e.answer),
  provider: { '@id': ids.org },
  areaServed: area(e),
  url: abs(`/locations/${e.slug}/`),
  hasOfferCatalog: { '@id': ids.catalog },
});

export const imageObject = (g: GalleryItem, src: string) => ({
  '@type': 'ImageObject',
  contentUrl: abs(src),
  caption: g.caption || g.title,
  name: g.title || g.caption,
  creator: { '@id': ids.org },
  copyrightHolder: { '@id': ids.org },
  creditText: 'Colion International',
  ...(g.date ? { datePublished: g.date } : {}),
});

export const videoObject = (g: GalleryItem, poster: string) => ({
  '@type': 'VideoObject',
  name: g.title || g.caption || 'Colion International',
  description: g.caption || g.title || 'Colion International operations',
  thumbnailUrl: abs(poster),
  contentUrl: abs(videoUrl(g.video)),
  uploadDate: g.date || undefined,
  ...(g.duration ? { duration: `PT${Math.round(g.duration)}S` } : {}),
  ...(g.instagramUrl ? { embedUrl: g.instagramUrl } : {}),
  publisher: { '@id': ids.org },
});
