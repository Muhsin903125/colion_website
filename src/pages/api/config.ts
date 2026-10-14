/**
 * What the admin needs before it can render: whether a login is required, where
 * saves will land, and whether uploads are wired up.
 *
 * Public by design — it carries no secret. The Cloudinary cloud name and API
 * key are both public values (the API *secret* never leaves the server), and
 * knowing that a login is required is not a disclosure.
 */
import type { APIRoute } from 'astro';
import { authRequired } from '../../lib/cms/auth';
import { hasStore } from '../../lib/cms/store';
import { cloudinaryConfig } from '../../lib/cms/cloudinary-server';
import { json } from './_guard';
import { isSignedIn } from './_guard';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const cloudinary = cloudinaryConfig();
  return json({
    authRequired: authRequired(),
    authenticated: await isSignedIn(context),
    storage: hasStore() ? 'cloudinary' : 'unconfigured',
    publishConfigured: Boolean(import.meta.env.CMS_REVALIDATE_TOKEN),
    cloudinary: {
      enabled: cloudinary.enabled,
      cloudName: cloudinary.cloudName,
      folder: cloudinary.folder,
    },
  });
};
