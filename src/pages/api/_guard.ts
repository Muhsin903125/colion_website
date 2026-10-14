/**
 * Shared helpers for the CMS endpoints.
 *
 * Every response here is `no-store`: an edge cache holding a CMS read would
 * show an editor stale content and make a save look like it did not happen.
 */
import type { APIContext } from 'astro';
import { cookieName, isValidSession } from '../../lib/cms/auth';

export const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const unauthorized = () => json({ error: 'Not signed in' }, 401);

/** True when the request carries a valid admin session cookie. */
export const isSignedIn = (context: APIContext) =>
  isValidSession(context.cookies.get(cookieName)?.value);

/** Read a JSON body, failing with a clear message rather than a stack trace. */
export async function readJson(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}
