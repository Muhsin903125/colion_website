/**
 * Cloudinary delivery URLs — images and video.
 *
 * A URL builder and nothing else: no SDK, no API key, no secret. Safe in any
 * bundle, which is why it is separate from `src/lib/cms/cloudinary-server.ts`
 * (signing) and `scripts/cloudinary.mjs` (the CLI).
 *
 * A reference can be either form, and both resolve here:
 *
 *   "/images/products/printer-hp-office.webp"   a file shipped in public/
 *   "colion/gallery/2026-10/warehouse-1"        a Cloudinary public id
 *
 * The seed ships with local files so the site renders before anything is in
 * Cloudinary; every editor upload is a public id. They coexist indefinitely.
 */

export interface ImageRef {
  publicId: string;
  alt?: string;
  /** Cloudinary asset version. Carried so a re-upload busts the CDN cache. */
  version?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  /** Crop mode; `auto`/`fill` keep the subject in frame, `pad` letterboxes. */
  crop?: 'auto' | 'fill' | 'fit' | 'scale' | 'pad' | 'limit';
  /** Pad colour, hex without the `#`. Only meaningful with `crop: 'pad'`. */
  background?: string;
  quality?: number | 'auto';
  /** Greyscale, for the brand marquee's resting state. */
  grayscale?: boolean;
}

/*
 * The cloud name is read from the private variable. Every caller runs on the
 * server during render; the admin gets the value from `/api/config`.
 */
const CLOUD = import.meta.env.CLOUDINARY_CLOUD_NAME ?? '';

/** A local `public/` path or an absolute URL, not a Cloudinary id. */
export const isLocal = (publicId: string) => publicId.startsWith('/') || /^https?:\/\//.test(publicId);

/** The ceiling for an image asked for without a width. */
const MAX_WIDTH = 1600;

/**
 * The rungs a responsive `srcset` is built from. Deliberately not round:
 * 1100 catches the 412px × 2.625 DPR Lighthouse phone that a 1080 rung misses.
 */
export const SRCSET_WIDTHS = [360, 480, 640, 828, 1100, 1280, 1600, 1920];

/** A delivery URL for a Cloudinary public id (or the local path, untouched). */
export function cld(publicId: string, opts: TransformOptions = {}, version?: number | null): string {
  if (!publicId) return '';
  if (isLocal(publicId)) return publicId;

  if (!CLOUD) {
    console.warn(`[cloudinary] CLOUDINARY_CLOUD_NAME is unset; cannot build a URL for "${publicId}"`);
    return '';
  }

  const segments: string[] = [];
  // One effect per URL component: Cloudinary applies at most one `e_` each.
  if (opts.grayscale) segments.push('e_grayscale');

  const t: string[] = ['f_auto'];
  t.push(`w_${opts.width ?? MAX_WIDTH}`);
  if (opts.height) t.push(`h_${opts.height}`);
  const crop = opts.crop ?? 'limit';
  t.push(`c_${crop}`);
  if (crop === 'auto' || crop === 'fill') t.push('g_auto');
  if (opts.background) t.push(`b_rgb:${opts.background.replace('#', '')}`);
  t.push(`q_${opts.quality ?? 'auto'}`);
  segments.push(t.join(','));

  if (version) segments.push(`v${version}`);
  segments.push(publicId);

  return `https://res.cloudinary.com/${CLOUD}/image/upload/${segments.join('/')}`;
}

/** The `src` for an image reference from the CMS document. */
export function resolveImage(ref: ImageRef | string | null | undefined, opts: TransformOptions = {}): string {
  if (!ref) return '';
  if (typeof ref === 'string') return cld(ref, opts);
  return cld(ref.publicId, opts, ref.version);
}

/**
 * `src` + `srcset` + `sizes` for one reference. Local files have no
 * derivatives, so they come back as a bare `src`.
 *
 * `sizes` is the CSS width of the slot, passed in by the component that owns
 * the layout — get it wrong and the browser picks the wrong rung.
 */
export function imageAttrs(
  ref: ImageRef | string | null | undefined,
  opts: TransformOptions & { sizes?: string; widths?: number[] } = {},
): { src: string; srcset?: string; sizes?: string; width?: number; height?: number } {
  const { sizes, widths = SRCSET_WIDTHS, ...transform } = opts;
  const publicId = typeof ref === 'string' ? ref : ref?.publicId;
  const version = typeof ref === 'string' ? undefined : ref?.version;
  const src = resolveImage(ref, transform);
  const dims =
    typeof ref === 'object' && ref?.width && ref?.height ? { width: ref.width, height: ref.height } : {};
  if (!src || !publicId || isLocal(publicId)) return { src, ...dims };
  if (transform.height) return { src, sizes };

  return {
    src,
    srcset: widths.map((w) => `${cld(publicId, { ...transform, width: w }, version)} ${w}w`).join(', '),
    sizes: sizes ?? '100vw',
    ...dims,
  };
}

/** The same responsive attributes, from an already-built delivery URL. */
export function responsive(
  url: string,
  sizes = '100vw',
  widths: number[] = SRCSET_WIDTHS,
): { src: string; srcset?: string; sizes?: string } {
  if (!url.startsWith('https://res.cloudinary.com/')) return { src: url };
  if (!/[/,]w_\d+/.test(url) || /[/,]h_\d+/.test(url)) return { src: url };
  return {
    src: url,
    srcset: widths.map((w) => `${url.replace(/([/,])w_\d+/, `$1w_${w}`)} ${w}w`).join(', '),
    sizes,
  };
}

/* ── video ──────────────────────────────────────────────────────────────── */

/**
 * A playable URL for a video reference.
 *
 * Local `/videos/...` paths are served from Vercel's CDN as encoded by
 * `scripts/compress-video.mjs`. A Cloudinary video id — what the admin's bulk
 * upload produces for gallery reels — is delivered as `f_auto:video,q_auto`
 * capped at `width`, so a phone-shot 4K reel never reaches a visitor as 4K.
 */
export function videoUrl(src: string, width = 720): string {
  if (!src) return '';
  if (isLocal(src)) return src;
  if (!CLOUD) return '';
  return `https://res.cloudinary.com/${CLOUD}/video/upload/f_auto:video,q_auto,w_${width},c_limit/${src}`;
}

/** The poster frame for a Cloudinary video — its first second, as a still. */
export function videoPoster(src: string, width = 720): string {
  if (!src || isLocal(src)) return '';
  if (!CLOUD) return '';
  return `https://res.cloudinary.com/${CLOUD}/video/upload/so_1,f_auto,q_auto,w_${width},c_limit/${src}.jpg`;
}
