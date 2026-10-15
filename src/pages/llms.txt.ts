/**
 * `llms.txt`, generated from the CMS document.
 *
 * A plain-text brief for answer engines: what Colion International is, where,
 * how to contact it, what it supplies and how fast it delivers. Every fact is
 * derived from the same content the pages render, so the two cannot disagree,
 * and each line names Colion and its subject so it can be quoted out of context.
 * Only indexable programmatic pages are listed.
 */
import type { APIRoute } from 'astro';
import { load } from '../data/load';
import { SITE_URL } from '../data/seo';
import { plain } from '../lib/inline';

export const prerender = false;

const url = (path: string) => new URL(path, SITE_URL).toString();

export const GET: APIRoute = async () => {
  const d = await load();
  const { site, seo, registration: reg } = d;

  const body = `# ${site.name}

> ${plain(site.description)}

## At a glance

- **Legal name:** ${site.legalName}${reg.legalNameArabic ? ` (${reg.legalNameArabic})` : ''}${reg.legalForm ? `, a ${reg.legalForm} on the Dubai mainland` : ''}.
${reg.licence.number ? `- **Dubai commercial licence:** ${reg.licence.number}${reg.licence.authority ? `, issued by the ${reg.licence.authority}` : ''}${reg.licence.issued ? ` on ${reg.licence.issued}` : ''}${reg.commercialRegister ? `; commercial register ${reg.commercialRegister}` : ''}${reg.chamber.number ? `; ${reg.chamber.name || 'Dubai Chamber'} membership ${reg.chamber.number}` : ''}.
` : ''}${reg.vat.trn ? `- **UAE VAT:** registered with the ${reg.vat.authority || 'Federal Tax Authority'}, TRN ${reg.vat.trn}${reg.vat.effective ? `, since ${reg.vat.effective}` : ''}.
` : ''}${reg.activities.length ? `- **Licensed activities:** ${reg.activities.join('; ')}.
` : ''}- **What it is:** ${site.positioning}
${site.founded ? `- **In business since:** ${site.founded}, in the Dubai market.\n` : ''}${d.realTeam.length ? `- **Leadership:** ${d.realTeam.map((m) => `${m.name} (${m.role}${m.yearsExperience ? `, ${m.yearsExperience}+ years in the IT hardware trade` : ''})`).join(', ')}.\n` : ''}${seo.languages.length ? `- **Languages spoken:** ${seo.languages.join(', ')}.\n` : ''}- **Locations:**
${site.locations.map((l) => `  - ${l.label}: ${l.streetAddress}, ${l.area}, ${l.locality}, UAE${l.mapUrl ? ` — ${l.mapUrl}` : ''}`).join('\n')}
- **Hours:** ${site.hours}.
- **Contact:** ${site.phone} (call and WhatsApp) · ${site.email} · ${url('/contact/')}
- **Official profiles:** ${[...d.socialLinks.map((s) => s.href), ...site.locations.map((l) => l.gbp.url).filter(Boolean)].join(' · ')}
- **Coverage:** delivers to all seven emirates from Dubai; exports to the GCC, the Middle East and Africa.
${d.features.map((f) => `- **${f.title}:** ${f.body}`).join('\n')}
${d.stats.map((s) => `- ${s.label}: ${s.value}${s.unit}`).join('\n')}

## Services

${d.indexable.services.map((s) => `- [${s.name}](${url(`/services/${s.slug}/`)}): ${plain(s.answer)}`).join('\n')}

## Products

${d.indexable.categories.map((c) => `- [${c.name}](${url(`/products/${c.slug}/`)}): ${plain(c.answer)}`).join('\n')}

## Brands

Colion International supplies ${d.brands.length} brands, including: ${d.brands.map((b) => b.name).join(', ')}.

${d.indexable.brands.map((b) => `- [${b.name}](${url(`/brands/${b.slug}/`)}): ${plain(b.answer)}`).join('\n')}

## Delivery by emirate

${d.emirates.map((e) => `- [${e.name}](${url(`/locations/${e.slug}/`)}): ${e.deliveryTime}; ${e.installation.toLowerCase()}.`).join('\n')}

## Key answers

${d.allFaqs
  .filter((f) => f.top)
  .map((f) => `### ${plain(f.q)}\n\n${plain(f.a)}`)
  .join('\n\n')}

## More

- [Full text for language models: every page, answer and FAQ](${url('/llms-full.txt')})
- [All frequently asked questions](${url('/faq/')})
- [About ${site.name}](${url('/about/')})
- [Gallery: showroom, stock and deliveries](${url('/gallery/')})
- [Sitemap](${url('/sitemap.xml')})

---
Generated from the ${site.name} content record; the same facts are rendered on the website.
`;

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
