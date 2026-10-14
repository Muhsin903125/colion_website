/**
 * Signed direct upload.
 *
 * The browser uploads straight to Cloudinary; this endpoint only signs the
 * request, so image bytes never pass through the site's own serverless
 * functions and the API secret never leaves the server.
 *
 * Passing a `publicId` signs an overwrite of that exact asset, which is what
 * makes "replace this photo" a one-click operation: every reference to it
 * across the site picks up the new file with no content edit at all.
 */
import type { APIRoute } from 'astro';
import { cloudinaryConfig, signParams } from '../../lib/cms/cloudinary-server';
import { isSignedIn, json, readJson, unauthorized } from './_guard';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();

  const config = cloudinaryConfig();
  if (!config.enabled) {
    return json({ error: 'Cloudinary is not configured on the server' }, 503);
  }

  let body: any = {};
  try {
    body = await readJson(context.request);
  } catch {
    body = {};
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // A sub-folder of the library, never a path outside it: gallery uploads ask
  // for `gallery/2026-10` and land in `colion/gallery/2026-10`.
  const sub = typeof body.folder === 'string' ? body.folder.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') : '';
  const folder = sub ? `${config.folder}/${sub}` : config.folder;
  // Reels and clips go to the video endpoint; everything else is an image.
  const resourceType = body.resourceType === 'video' ? 'video' : 'image';

  const params: Record<string, string | number> = { timestamp };
  if (typeof body.publicId === 'string' && body.publicId) {
    // An explicit id means "replace this asset", so the folder is already part
    // of the id and must not be sent again.
    params.public_id = body.publicId;
    params.overwrite = 'true';
    params.invalidate = 'true';
  } else {
    params.folder = folder;
  }

  return json({
    ...params,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    signature: await signParams(params, config.apiSecret),
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
  });
};
