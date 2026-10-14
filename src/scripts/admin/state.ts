/**
 * Admin state: the whole CMS document in memory, addressed by dot-path.
 *
 * Ported from BiasRetailWeb's `js/cms-admin.js`, which is the good part of that
 * CMS — a form is declared as data (`field('Name', 'site.name')`) rather than
 * as markup, so a new field is one line and cannot fall out of step with where
 * it is stored.
 */

export type Path = string | (string | number)[];

export interface AdminState {
  content: any;
  config: any;
  dirty: boolean;
  authenticated: boolean;
  activeTab: string;
}

export const state: AdminState = {
  content: null,
  config: null,
  dirty: false,
  authenticated: false,
  activeTab: 'site',
};

const listeners = new Set<() => void>();
export const onDirtyChange = (fn: () => void) => listeners.add(fn);

export const parts = (path: Path): (string | number)[] =>
  Array.isArray(path) ? path : String(path).split('.');

export function get(path: Path, fallback: any = ''): any {
  let cursor = state.content;
  for (const part of parts(path)) {
    if (cursor === undefined || cursor === null) return fallback;
    cursor = cursor[part];
  }
  return cursor === undefined || cursor === null ? fallback : cursor;
}

export function set(path: Path, value: any): void {
  const segments = parts(path);
  let cursor = state.content;
  segments.slice(0, -1).forEach((segment, i) => {
    if (cursor[segment] === undefined || cursor[segment] === null || typeof cursor[segment] !== 'object') {
      // Auto-vivify the right container for what comes next.
      cursor[segment] = typeof segments[i + 1] === 'number' ? [] : {};
    }
    cursor = cursor[segment];
  });
  cursor[segments[segments.length - 1]] = value;
  markDirty();
}

export function markDirty(): void {
  state.dirty = true;
  listeners.forEach((fn) => fn());
}

export function markClean(): void {
  state.dirty = false;
  listeners.forEach((fn) => fn());
}

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/* ── api ────────────────────────────────────────────────────────────────── */

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error: any = new Error(payload.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}
