/**
 * The media library: what is in the Cloudinary folder, and removing from it.
 *
 * Listing is read live from Cloudinary rather than from the CMS document, so
 * the library shows what actually exists — including anything uploaded outside
 * the admin — instead of a record that can fall out of step with the account.
 */
import type { APIRoute } from 'astro';
import { cloudinaryConfig, deleteAsset, listAssets } from '../../lib/cms/cloudinary-server';
import { isSignedIn, json, unauthorized } from './_guard';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();

  const config = cloudinaryConfig();
  if (!config.enabled) return json({ assets: [], enabled: false });

  try {
    return json({ assets: await listAssets(config), enabled: true, folder: config.folder });
  } catch (error: any) {
    return json({ error: error.message ?? 'Could not list media' }, 502);
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();

  const publicId = new URL(context.request.url).searchParams.get('publicId');
  if (!publicId) return json({ error: 'publicId is required' }, 400);

  const config = cloudinaryConfig();
  if (!config.enabled) return json({ error: 'Cloudinary is not configured' }, 503);

  try {
    await deleteAsset(config, publicId);
    return json({ deleted: publicId });
  } catch (error: any) {
    return json({ error: error.message ?? 'Could not delete' }, 502);
  }
};
