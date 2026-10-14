/**
 * Conversion events for GA4, by delegation.
 *
 * Any element with `data-track="event_name"` fires that event when clicked —
 * WhatsApp, call, email and directions links across the site — with the page
 * type and path attached. `generate_lead` and `click_whatsapp` should be
 * marked as key events in GA4 (see docs/analytics.md).
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', event, {
    page_type: document.body.dataset.pageType || location.pathname.split('/')[1] || 'home',
    page_path: location.pathname,
    ...params,
  });
}

let wired = false;

export function initAnalytics() {
  // The document listener survives ViewTransitions swaps, so wire it once.
  if (wired) return;
  wired = true;
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      track(el.dataset.track!, { link_text: (el.textContent || '').trim().slice(0, 60), link_url: (el as HTMLAnchorElement).href || '' });
    },
    { capture: true },
  );
}
