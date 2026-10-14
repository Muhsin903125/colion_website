/** Menu drawer, enquiry form, filter chips, and the FAQ accordion analytics. */
import { track } from './analytics';

export function initUI() {
  initMenu();
  initEnquiryForm();
  initFilter();
  initCarousels();
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function initMenu() {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!menu) return;
  const panel = menu.querySelector<HTMLElement>('[data-panel]');
  const overlay = menu.querySelector<HTMLElement>('[data-overlay]');
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-menu-open]')];
  let isOpen = false;
  let lastFocused: HTMLElement | null = null;

  const open = () => {
    isOpen = true;
    lastFocused = document.activeElement as HTMLElement | null;
    menu.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay?.classList.add('opacity-100');
      panel?.classList.remove('translate-x-full');
      panel?.focus();
    });
    document.body.style.overflow = 'hidden';
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'true'));
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    overlay?.classList.remove('opacity-100');
    panel?.classList.add('translate-x-full');
    document.body.style.overflow = '';
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    setTimeout(() => menu.classList.add('hidden'), 500);
    lastFocused?.focus();
  };

  triggers.forEach((b) => b.addEventListener('click', open));
  menu.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', close));
  menu.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', close));

  menu.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab' || !panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/**
 * The quotation form. It composes the request into a WhatsApp message and
 * opens wa.me — the channel UAE buyers already use for quotations. No back
 * end, nothing stored.
 */
function initEnquiryForm() {
  document.querySelectorAll<HTMLFormElement>('[data-enquiry]').forEach((form) => {
    const msg = form.querySelector<HTMLElement>('[data-enquiry-msg]');
    const say = (text: string) => {
      if (!msg) return;
      msg.textContent = text;
      msg.hidden = false;
    };

    const brief = () => composeBrief(new FormData(form));

    // `?interest=Printers` (linked from product and brand pages) preselects the
    // topic. Done here, not at render, because ISR caches one copy per path.
    const wanted = new URLSearchParams(location.search).get('interest');
    const select = form.querySelector<HTMLSelectElement>('select[name="interest"]');
    if (wanted && select) {
      const match = [...select.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase());
      if (match) select.value = match.value;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const number = (form.dataset.whatsapp || '').replace(/\D/g, '');
      const url = `https://wa.me/${number}?text=${encodeURIComponent(brief())}`;
      track('generate_lead', { method: 'whatsapp', interest: String(new FormData(form).get('interest') ?? '') });
      say('Opening WhatsApp with your request filled in — just press send.');
      // A short beat so the lead event leaves before the page navigates.
      setTimeout(() => (window.location.href = url), 250);
    });
  });
}

function composeBrief(data: FormData) {
  const get = (k: string) => String(data.get(k) ?? '').trim();
  // Optional fields are left out entirely rather than sent as "Company: ".
  const opt = (label: string, k: string) => (get(k) ? [`${label}: ${get(k)}`] : []);
  return [
    'Hello Colion International, I would like a quotation.',
    '',
    `Name: ${get('name')}`,
    ...opt('Company', 'company'),
    `Phone: ${get('phone')}`,
    ...opt('Email', 'email'),
    ...opt('Emirate', 'emirate'),
    `Interested in: ${get('interest') || '—'}`,
    ...opt('Brand', 'brand'),
    ...opt('Quantity', 'quantity'),
    '',
    'Details:',
    get('message') || '—',
  ].join('\n');
}

/**
 * Filter chips: `[data-filter-root]` holds `[data-filter="value"]` buttons and
 * `[data-filter-item]` elements carrying a space-separated `data-tags`.
 */
function initFilter() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
    const count = root.querySelector<HTMLElement>('[data-filter-count]');
    const search = root.querySelector<HTMLInputElement>('[data-filter-search]');
    const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
    let value = 'all';
    const apply = () => {
      const q = (search?.value ?? '').trim().toLowerCase();
      let shown = 0;
      items.forEach((item) => {
        const inCat = value === 'all' || (item.dataset.tags ?? '').split(' ').includes(value);
        const show = inCat && (!q || (item.dataset.name ?? item.textContent ?? '').toLowerCase().includes(q));
        item.hidden = !show;
        if (show) {
          // Shown items pop in, staggered, so the change reads as movement.
          item.classList.add('is-in');
          if (!reduce) item.animate([{ opacity: 0, transform: 'translateY(14px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: Math.min(shown, 20) * 22, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
          shown++;
        }
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === value)));
      if (count) count.textContent = String(shown);
      empty?.classList.toggle('hidden', shown > 0);
      root.dispatchEvent(new CustomEvent('filter:change', { detail: { value } }));
    };
    chips.forEach((chip) => chip.addEventListener('click', () => {
      value = chip.dataset.filter!;
      apply();
    }));
    search?.addEventListener('input', apply);
  });
}

/**
 * Prev / next buttons for horizontal rails: `[data-carousel]` holds a
 * `[data-carousel-track]` and `[data-carousel-prev]` / `[data-carousel-next]`.
 * Each press scrolls about one screenful; a button disables at its end.
 */
function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-carousel-track]');
    const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
    if (!track || !prev || !next) return;
    const step = () => {
      const first = track.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      const card = first ? first.offsetWidth + gap : 280;
      return Math.max(card, Math.floor(track.clientWidth / card) * card);
    };
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      root.toggleAttribute('data-carousel-static', max <= 4);
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true });
    new ResizeObserver(sync).observe(track);
    sync();
  });
}
