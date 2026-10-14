/** Small constructors so the seed modules read as content, not plumbing. */

/** A local image reference. Dimensions are filled in by `index.mjs`. */
export const img = (publicId, alt = '') => ({ publicId, alt, version: null, width: null, height: null });

/** A background clip encoded by scripts/compress-video.mjs. */
export const vid = (name, alt = '') => ({
  src: `/videos/${name}.mp4`,
  srcMobile: `/videos/${name}-m.mp4`,
  poster: img(`/images/stills/${name}.webp`, alt),
});

export const noVideo = () => ({ src: '', srcMobile: '', poster: img('') });

export const link = (label = '', href = '') => ({ label, href });

export const intro = (label = '', lines = [], body = '', cta = link()) => ({ label, lines, body, cta });

export const faq = (q, a, top = false) => ({ q, a, top });

let n = 0;
/** A section with a stable id and the base fields. */
export const section = (type, fields = {}) => ({ id: `${type}-${++n}`, anchor: '', hidden: false, type, ...fields });

/** The product photography, by subject. */
export const P = (name, alt) => img(`/images/products/${name}.webp`, alt);
export const STILL = (name, alt) => img(`/images/stills/${name}.webp`, alt);
export const PLACE = (name, alt) => img(`/images/places/${name}.webp`, alt);
