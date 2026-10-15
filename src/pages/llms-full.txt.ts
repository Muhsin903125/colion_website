/**
 * `llms-full.txt`: the long companion to `llms.txt`.
 *
 * Where `llms.txt` is the brief, this is the reference: the full written copy
 * of every indexable service, category, brand and emirate page, the founder's
 * profile, and every FAQ answer, as plain Markdown. Answer engines that fetch
 * one file get everything they need to quote Colion accurately, from the same
 * content record the pages render. Thin pages kept out of the index are kept
 * out of here too.
 */
import type { APIRoute } from 'astro';
import { load } from '../data/load';
import { SITE_URL } from '../data/seo';
import { plain } from '../lib/inline';

export const prerender = false;

const url = (path: string) => new URL(path, SITE_URL).toString();
const paras = (list: string[]) => list.filter(Boolean).map(plain).join('\n\n');
const faqs = (list: { q: string; a: string }[]) => list.map((f) => `**${plain(f.q)}**\n${plain(f.a)}`).join('\n\n');

export const GET: APIRoute = async () => {
  const d = await load();
  const { site, seo, registration: reg } = d;

  const out: string[] = [];
  out.push(`# ${site.name} — full reference

> ${plain(site.description)}

Legal name: ${site.legalName}${reg.legalNameArabic ? ` (${reg.legalNameArabic})` : ''}. ${reg.licence.number ? `Dubai commercial licence ${reg.licence.number}${reg.licence.authority ? `, issued by the ${reg.licence.authority}` : ''}. ` : ''}${reg.commercialRegister ? `Commercial register ${reg.commercialRegister}. ` : ''}${reg.chamber.number ? `${reg.chamber.name || 'Dubai Chamber'} membership ${reg.chamber.number}. ` : ''}${reg.vat.trn ? `UAE VAT TRN ${reg.vat.trn}. ` : ''}${reg.activities.length ? `Licensed activities: ${reg.activities.join('; ')}. ` : ''}${site.founded ? `In the Dubai market since ${site.founded}. ` : ''}Phone and WhatsApp: ${site.phone}. Email: ${site.email}. Hours: ${site.hours}. Website: ${url('/')}.

Locations:
${site.locations.map((l) => `- ${l.label}: ${l.streetAddress}, ${l.area}, ${l.locality}, United Arab Emirates${l.geo.lat ? ` (${l.geo.lat}, ${l.geo.lng})` : ''}${l.mapUrl ? ` — ${l.mapUrl}` : ''}`).join('\n')}
${seo.languages.length ? `\nLanguages spoken: ${seo.languages.join(', ')}.` : ''}`);

  if (d.realTeam.length) {
    out.push(`## Leadership\n\n${d.realTeam
      .map((m) => `### ${m.name}, ${m.role}\n\n${plain(m.bio)}${m.expertise.length ? `\n\nExpertise: ${m.expertise.join('; ')}.` : ''}${[m.linkedin, ...m.social.map((s) => s.href)].filter(Boolean).length ? `\n\nProfiles: ${[...new Set([m.linkedin, ...m.social.map((s) => s.href)].filter(Boolean))].join(' · ')}` : ''}`)
      .join('\n\n')}`);
  }

  out.push(`## Services\n\n${d.indexable.services
    .map((s) => `### ${s.name}\n\nURL: ${url(`/services/${s.slug}/`)}\n\n${plain(s.answer)}\n\n${paras(s.intro)}${s.faqs.length ? `\n\n${faqs(s.faqs)}` : ''}`)
    .join('\n\n')}`);

  out.push(`## Products\n\n${d.indexable.categories
    .map((c) => `### ${c.name}\n\nURL: ${url(`/products/${c.slug}/`)}\n\n${plain(c.answer)}\n\n${paras(c.intro)}\n\nBrands: ${d.brandsIn(c.slug).map((b) => b.name).join(', ')}.${c.faqs.length ? `\n\n${faqs(c.faqs)}` : ''}`)
    .join('\n\n')}`);

  out.push(`## Brands\n\n${site.name} supplies ${d.brands.length} brands: ${d.brands.map((b) => b.name).join(', ')}.\n\n${d.indexable.brands
    .map((b) => `### ${b.name}\n\nURL: ${url(`/brands/${b.slug}/`)}\n\n${plain(b.answer)}\n\n${paras(b.intro)}${b.productLines.length ? `\n\nProduct lines: ${b.productLines.join('; ')}.` : ''}${b.faqs.length ? `\n\n${faqs(b.faqs)}` : ''}`)
    .join('\n\n')}`);

  out.push(`## Delivery across the UAE\n\n${d.indexable.emirates
    .map((e) => `### ${e.name}\n\nURL: ${url(`/locations/${e.slug}/`)}\n\nDelivery: ${e.deliveryTime}. Installation: ${e.installation}.\n\n${plain(e.answer)}\n\n${paras(e.intro)}${e.faqs.length ? `\n\n${faqs(e.faqs)}` : ''}`)
    .join('\n\n')}`);

  out.push(`## Frequently asked questions\n\n${d.faqGroups.map((g) => `### ${g.title}\n\n${faqs(g.items)}`).join('\n\n')}`);

  out.push(`---\nGenerated from the ${site.name} content record; the same facts are rendered on ${url('/')}. Summary: ${url('/llms.txt')}.`);

  return new Response(out.join('\n\n') + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
