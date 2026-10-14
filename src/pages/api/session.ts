/**
 * Log in and out.
 *
 * The password is sent exactly once, here. What comes back is a signed httpOnly
 * cookie, so the secret never sits in `sessionStorage` and is never replayed on
 * subsequent requests — which is how BiasRetailWeb, the CMS this is ported
 * from, does it.
 */
import type { APIRoute } from 'astro';
import { clearThrottle, clientId, cookieName, cookieOptions, createSession, throttle, verifyPassword } from '../../lib/cms/auth';
import { json, readJson } from './_guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const client = clientId(request);
  const gate = throttle(client);
  if (!gate.allowed) {
    return new Response(
      JSON.stringify({ error: `Too many attempts. Try again in ${Math.ceil(gate.retryAfter / 60)} minutes.` }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'retry-after': String(gate.retryAfter),
        },
      },
    );
  }

  let body: any;
  try {
    body = await readJson(request);
  } catch (error: any) {
    return json({ error: error.message }, 400);
  }

  if (!(await verifyPassword(typeof body.password === 'string' ? body.password : ''))) {
    return json({ error: 'Incorrect password' }, 401);
  }

  clearThrottle(client);
  cookies.set(cookieName, await createSession(), cookieOptions);
  return json({ authenticated: true });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(cookieName, { path: '/' });
  return json({ authenticated: false });
};
