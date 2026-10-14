/**
 * The CMS document store, on Cloudinary.
 *
 * One JSON file holds the whole site, stored as a Cloudinary `raw` asset, so
 * the media library and the content record live in one account with one set
 * of credentials instead of two services to provision and pay for.
 *
 * The one thing that needed care is freshness. Cloudinary serves raw assets
 * through its CDN, and `invalidate: true` on an overwrite is documented as
 * taking minutes to propagate — long enough to break the point of publishing
 * instantly. So reads never touch the unversioned URL. The Admin API is asked
 * for the asset's current version, and the versioned URL it returns is
 * immutable and correct the moment the write lands. That was measured, not
 * assumed: an overwrite followed immediately by a fetch of the new versioned
 * URL returns the new bytes.
 *
 * Reads fall back to the committed seed, so a fresh deploy with an empty store
 * — or an unreachable one — serves the last known-good content rather than an
 * empty site.
 */
import seed from '../../data/content.seed.json';
import { checkReferences, ITEM_COLLECTIONS, parseContent, type Content } from '../../data/schema';
import { cloudinaryConfig, signParams } from './cloudinary-server';

/**
 * Raw assets keep their file extension in the public id, so this is the id and
 * not a path with a separate name.
 */
const DOCUMENT_ID = import.meta.env.CMS_DOCUMENT_ID || 'cms/site-content.json';

const config = () => cloudinaryConfig();

/** Durable storage needs the same credentials the media library uses. */
export const hasStore = () => config().enabled;

const adminAuth = () => {
  const c = config();
  return `Basic ${btoa(`${c.apiKey}:${c.apiSecret}`)}`;
};

/**
 * The version of the stored document, remembered between requests.
 *
 * Every write returns the new version, so once this instance has written or
 * read once it can go straight to the immutable URL and skip the Admin API
 * call. That halves the round trips on the hot path and keeps well clear of
 * Cloudinary's Admin API rate limit, which is the one quota a per-request read
 * could otherwise pressure.
 *
 * It is only trusted for VERSION_TTL_MS. A write from anywhere else — another
 * serverless instance, `seed:push` — leaves this instance's old versioned URL
 * still resolving (old versions are not deleted), so without an expiry a warm
 * instance kept rendering the previous document indefinitely, Publish or not.
 */
let knownVersion: number | null = null;
let knownAt = 0;
const VERSION_TTL_MS = 60_000;
const remember = (version: number | null) => {
  knownVersion = version;
  knownAt = Date.now();
};

/** Ask the Admin API where the current document is. */
async function currentUrl(): Promise<string | null> {
  const c = config();
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${c.cloudName}/resources/raw/upload/${DOCUMENT_ID}`,
    { headers: { authorization: adminAuth() } },
  );

  // 404 simply means nothing has been saved yet, which is not an error.
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cloudinary lookup failed: ${response.status}`);

  const meta = await response.json();
  if (meta?.version) remember(meta.version);
  return meta?.secure_url ?? null;
}

const versionedUrl = (version: number) =>
  `https://res.cloudinary.com/${config().cloudName}/raw/upload/v${version}/${DOCUMENT_ID}`;

async function readStored(): Promise<unknown | null> {
  const fresh = knownVersion && Date.now() - knownAt < VERSION_TTL_MS;
  let url = fresh ? versionedUrl(knownVersion!) : await currentUrl();
  if (!url) return null;

  let response = await fetch(url, { cache: 'no-store' });

  // A remembered version can be wrong if another instance has written since.
  // One Admin API lookup recovers it rather than falling back to the seed and
  // silently serving stale content.
  if (!response.ok && knownVersion) {
    knownVersion = null;
    url = await currentUrl();
    if (!url) return null;
    response = await fetch(url, { cache: 'no-store' });
  }

  if (!response.ok) throw new Error(`Cloudinary read failed: ${response.status}`);
  return response.json();
}

/**
 * The current document.
 *
 * Stored content is merged *over* the seed, which covers a top-level key the
 * store genuinely lacks. Be clear about the limit of that: the merge is shallow
 * and Zod fills every key with a default on the first write, so in practice the
 * store wins for anything it has — including a key it holds only as an empty
 * default. Editing the seed after the store is live therefore changes nothing
 * on the site.
 *
 * That is the correct behaviour once the CMS is in use: the store is the source
 * of truth, and a deep merge would resurrect sections an editor deliberately
 * deleted. To push a changed seed into the store on purpose — after adding a
 * page during development, say — use `npm run seed:push`.
 */
export async function readContent(): Promise<Content> {
  if (hasStore()) {
    try {
      const stored = await readStored();
      if (stored) return parseContent({ ...(seed as object), ...(stored as object) });
    } catch (error: any) {
      // A broken store must not take the public site down: fall back to the
      // seed and make the failure visible in the logs instead.
      console.error(`[cms] could not read the store (${error.message}); serving the seed`);
    }
  }
  return parseContent(seed);
}

export interface WriteResult {
  content: Content;
  storage: 'cloudinary' | 'unconfigured';
  version?: number;
  warning?: string;
}

/**
 * Validate, stamp, and persist.
 *
 * `sections` records a timestamp per top-level key, and only for the keys that
 * actually changed. The sitemap reads those for `lastmod`, so stamping
 * everything on every save would tell a crawler the entire site changed each
 * time someone fixed a typo — which is how a sitemap teaches Google to ignore
 * its own `lastmod` values.
 */
export async function writeContent(input: unknown): Promise<WriteResult> {
  const content = parseContent(input);

  const problems = checkReferences(content);
  if (problems.length) throw new Error(problems.join('; '));

  const previous = await readContent();
  const now = new Date().toISOString();

  content.sections = { ...previous.sections };
  for (const key of Object.keys(content) as (keyof Content)[]) {
    if (key === 'updatedAt' || key === 'sections') continue;
    if (JSON.stringify(content[key]) !== JSON.stringify(previous[key])) {
      content.sections[key] = now;
    }
  }

  // Page bodies are stamped individually so one edited page does not re-date
  // every other page's sitemap entry.
  for (const page of Object.keys(content.pages) as (keyof Content['pages'])[]) {
    if (JSON.stringify(content.pages[page]) !== JSON.stringify(previous.pages[page])) {
      content.sections[`pages.${page}`] = now;
    }
  }

  // The same for every programmatic page: editing the HP brand page re-dates
  // `/brands/hp/` in the sitemap and nothing else. Publish also reads these to
  // purge only the paths that changed.
  for (const collection of ITEM_COLLECTIONS) {
    const before = new Map((previous[collection] as { slug: string }[]).map((item) => [item.slug, JSON.stringify(item)]));
    for (const item of content[collection] as { slug: string }[]) {
      if (before.get(item.slug) !== JSON.stringify(item)) content.sections[`${collection}.${item.slug}`] = now;
    }
  }

  content.updatedAt = now;

  if (!hasStore()) {
    return {
      content,
      storage: 'unconfigured',
      warning:
        'Not saved. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable storage.',
    };
  }

  const c = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    public_id: DOCUMENT_ID,
    overwrite: 'true',
    invalidate: 'true',
    timestamp,
  };

  const form = new FormData();
  form.append(
    'file',
    new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }),
    'site-content.json',
  );
  for (const [key, value] of Object.entries(params)) form.append(key, String(value));
  form.append('api_key', c.apiKey);
  form.append('signature', await signParams(params, c.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/raw/upload`, {
    method: 'POST',
    body: form,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? `Cloudinary write failed: ${response.status}`);

  remember(payload.version ?? null);

  return { content, storage: 'cloudinary', version: payload.version };
}
