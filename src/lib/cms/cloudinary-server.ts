/**
 * Server-side Cloudinary: signing uploads, listing and deleting assets.
 *
 * Strictly separate from `src/lib/cloudinary.ts`, which only builds delivery
 * URLs and is safe in the browser bundle. Everything in this file touches the
 * API secret, which must never reach the client — anyone holding it can write
 * to or wipe the account.
 *
 * The signing algorithm is Cloudinary's: sort the parameters, join them as
 * `k=v` pairs, append the secret, SHA-1 the result. Implemented on Web Crypto
 * so it runs unchanged in Node and on the edge.
 */

const encoder = new TextEncoder();

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
  enabled: boolean;
}

/**
 * Three variables, one way to set them.
 *
 * BiasRetailWeb accepted either a packed `CLOUDINARY_URL` or the three discrete
 * values, and merged them with a precedence rule — which meant a stale packed
 * URL could silently override a correct discrete one. One form is clearer than
 * two, and the packed URL has the further problem of putting the API secret in
 * a variable people paste around.
 */
export function cloudinaryConfig(): CloudinaryConfig {
  const env = import.meta.env;

  const cloudName = env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = env.CLOUDINARY_API_KEY || '';
  const apiSecret = env.CLOUDINARY_API_SECRET || '';

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: env.CLOUDINARY_FOLDER || 'colion',
    enabled: Boolean(cloudName && apiKey && apiSecret),
  };
}

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Sign a parameter set.
 *
 * `api_key`, `cloud_name`, `file` and `resource_type` are excluded because
 * Cloudinary does not include them in the signature base; empty values are
 * dropped for the same reason.
 */
export async function signParams(
  params: Record<string, string | number | string[]>,
  apiSecret: string,
): Promise<string> {
  if (!apiSecret) throw new Error('Cloudinary API secret is not configured');

  const excluded = new Set(['api_key', 'cloud_name', 'file', 'resource_type', 'signature']);
  const base = Object.entries(params)
    .filter(([k, v]) => !excluded.has(k) && v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : String(v)}`)
    .join('&');

  return toHex(await crypto.subtle.digest('SHA-1', encoder.encode(`${base}${apiSecret}`)));
}

/** Basic-auth header for Cloudinary's Admin API. */
const adminAuth = (config: CloudinaryConfig) =>
  `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`;

export interface Asset {
  publicId: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  version: number | null;
  createdAt: string;
}

/** Every image in the CMS folder, newest first. */
export async function listAssets(config: CloudinaryConfig, max = 200): Promise<Asset[]> {
  const url = new URL(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image`);
  url.searchParams.set('type', 'upload');
  url.searchParams.set('prefix', `${config.folder}/`);
  url.searchParams.set('max_results', String(Math.min(max, 500)));

  const response = await fetch(url, { headers: { authorization: adminAuth(config) } });
  if (!response.ok) throw new Error(`Cloudinary list failed: ${response.status}`);

  const payload = await response.json();
  return (payload.resources ?? []).map((r: any) => ({
    publicId: r.public_id,
    format: r.format ?? '',
    width: r.width ?? null,
    height: r.height ?? null,
    bytes: r.bytes ?? 0,
    version: r.version ?? null,
    createdAt: r.created_at ?? '',
  }));
}

/** Permanently remove an asset. */
export async function deleteAsset(config: CloudinaryConfig, publicId: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await signParams({ public_id: publicId, timestamp }, config.apiSecret);

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
    { method: 'POST', body },
  );
  if (!response.ok) throw new Error(`Cloudinary delete failed: ${response.status}`);

  const payload = await response.json();
  if (payload.result !== 'ok' && payload.result !== 'not found') {
    throw new Error(`Cloudinary delete returned "${payload.result}"`);
  }
}
