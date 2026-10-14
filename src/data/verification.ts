/**
 * Search-console and business-platform site verification.
 *
 * Each provider proves you control the domain before it will show you its data.
 * The tokens are public by design — they ship in the HTML of every page — but
 * they are still per-property values that differ between staging and production,
 * so they come from the environment rather than being baked into the repo.
 *
 * `PUBLIC_` prefix: Astro only exposes env vars with that prefix to code that
 * might reach the browser. These are safe to expose (they are in the markup
 * anyway) and the prefix keeps them working no matter where they get imported.
 *
 * Set them in `.env` locally and in the host's environment settings for
 * production — see docs/search-console-setup.md. Any left blank render nothing;
 * an empty `content=""` is worse than no tag, because the provider reads it as a
 * failed verification rather than an absent one.
 */

const env = import.meta.env;

export interface VerificationTag {
  /** The `name` attribute the provider looks for. */
  name: string;
  content: string;
  /** Which console this unlocks — for the setup doc and for error messages. */
  provider: string;
}

const candidates: { name: string; provider: string; value: unknown }[] = [
  {
    name: 'google-site-verification',
    provider: 'Google Search Console',
    value: env.PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  {
    name: 'msvalidate.01',
    provider: 'Bing Webmaster Tools',
    value: env.PUBLIC_BING_SITE_VERIFICATION,
  }, 
  {
    name: 'facebook-domain-verification',
    provider: 'Meta Business Suite',
    value: env.PUBLIC_META_DOMAIN_VERIFICATION,
  },
  {
    name: 'yandex-verification',
    provider: 'Yandex Webmaster',
    value: env.PUBLIC_YANDEX_SITE_VERIFICATION,
  },
  {
    name: 'p:domain_verify',
    provider: 'Pinterest',
    value: env.PUBLIC_PINTEREST_SITE_VERIFICATION,
  },
];

/** Only the providers that actually have a token configured. */
export const verificationTags: VerificationTag[] = candidates
  .filter((c) => typeof c.value === 'string' && c.value.trim().length > 0)
  .map((c) => ({
    name: c.name,
    provider: c.provider,
    content: (c.value as string).trim(),
  }));
