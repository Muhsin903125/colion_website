/**
 * Read and save the CMS document.
 *
 * Both verbs require a session. The published site is public, but the *draft*
 * is not — an unsaved price change or an unannounced product should not be
 * readable by anyone who guesses the URL.
 */
import type { APIRoute } from 'astro';
import { readContent, writeContent } from '../../lib/cms/store';
import { invalidate } from '../../data/load';
import { isSignedIn, json, readJson, unauthorized } from './_guard';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();
  return json({ content: await readContent() });
};

export const PUT: APIRoute = async (context) => {
  if (!(await isSignedIn(context))) return unauthorized();

  try {
    const body = await readJson(context.request);
    const result = await writeContent(body?.content ?? body);
    // The render cache holds the pre-save document; drop it so a preview or a
    // revalidation immediately after this reflects what was just written.
    invalidate();
    return json(result);
  } catch (error: any) {
    // Validation failures are the editor's problem to fix, not a server fault,
    // so they come back as 400 with the specific field named.
    return json({ error: error.message ?? 'Could not save' }, 400);
  }
};
