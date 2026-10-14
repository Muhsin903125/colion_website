/**
 * Admin authentication.
 *
 * One shared password, as in a simpler CMS — but not the way a simpler CMS does
 * it. There, the password is compared with `===`, kept in `sessionStorage`, and
 * replayed as `Authorization: Bearer <password>` on every mutating request; the
 * live token is also committed to `.env.example` and `wrangler.jsonc`.
 *
 * Here the password comes from `CMS_ADMIN_PASSWORD` in the environment and is
 * sent exactly once, at login. What comes back is a signed, httpOnly cookie, so
 * the secret is never readable by script and never replayed. Comparison is
 * constant time.
 */

const encoder = new TextEncoder();

const COOKIE = 'colion_cms';
const TTL_SECONDS = 8 * 60 * 60;

export const password = () => import.meta.env.CMS_ADMIN_PASSWORD ?? '';

/**
 * Whether a password is configured at all.
 *
 * a simpler CMS treats an unset token as "no auth required" and leaves the CMS
 * wide open. That is a reasonable local-dev affordance and a serious production
 * hazard, so here it opens the admin only when not deployed.
 */
export const authRequired = () => Boolean(password()) || import.meta.env.PROD;

function sessionSecret(): string {
  const secret = import.meta.env.CMS_SESSION_SECRET;
  if (secret) return secret;
  // Falling back to the password keeps local dev working with one variable set.
  // It is not ideal — rotating the password invalidates sessions — but it is
  // far better than a hard-coded default that would be identical everywhere.
  return password();
}

/** Compare via HMAC digests, so the work is independent of where they differ. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const [x, y] = await Promise.all([
    crypto.subtle.sign('HMAC', key, encoder.encode(a)),
    crypto.subtle.sign('HMAC', key, encoder.encode(b)),
  ]);
  const xs = new Uint8Array(x);
  const ys = new Uint8Array(y);
  let diff = xs.length ^ ys.length;
  for (let i = 0; i < xs.length; i++) diff |= xs[i] ^ ys[i];
  return diff === 0;
}

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = password();
  if (!expected) return !import.meta.env.PROD;
  return timingSafeEqual(candidate, expected);
}

/** A signed `expiry.signature` token. Carries no secret and no user data. */
export async function createSession(): Promise<string> {
  const expiry = String(Date.now() + TTL_SECONDS * 1000);
  return `${expiry}.${await sign(expiry)}`;
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature] = token.split('.');
  if (!expiry || !signature) return false;
  if (!Number(expiry) || Number(expiry) < Date.now()) return false;
  return timingSafeEqual(signature, await sign(expiry));
}

export const cookieName = COOKIE;

export const cookieOptions = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: TTL_SECONDS,
};

/* ── login throttling ───────────────────────────────────────────────────── */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Failed logins per client, in memory.
 *
 * Serverless instances are short-lived and there may be several, so this slows
 * an attacker down rather than stopping one — it is not a substitute for a
 * strong password. It is here because the alternative, a simpler CMS's none at
 * all, makes an unlimited online guessing attack against a single shared
 * password completely free.
 */
const attempts = new Map<string, { count: number; first: number }>();

export function throttle(client: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = attempts.get(client);

  if (!record || now - record.first > WINDOW_MS) {
    attempts.set(client, { count: 1, first: now });
    return { allowed: true, retryAfter: 0 };
  }

  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((WINDOW_MS - (now - record.first)) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export const clearThrottle = (client: string) => attempts.delete(client);

/** Best-effort client identity for throttling. */
export const clientId = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  'unknown';
