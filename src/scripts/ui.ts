/** Menu drawer, enquiry form, filter chips, and the FAQ accordion analytics. */
import { track } from './analytics';

export function initUI() {
  initMenu();
  initEnquiryForm();
  initFilter();
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
 * opens wa.me — the channel UAE buyers already use for quotations — with an
 * email fallback for anyone who prefers it. No back end, nothing stored.
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
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
      track('generate_lead', { method: 'whatsapp', interest: String(new FormData(form).get('interest') ?? '') });
      say('WhatsApp is opening with your request filled in — just press send.');
    });

    form.querySelector<HTMLButtonElement>('[data-enquiry-email]')?.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const to = form.dataset.email || '';
      const subject = `Quotation request — ${String(new FormData(form).get('interest') ?? 'IT hardware')}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;
      track('generate_lead', { method: 'email' });
      say('Your email app is opening with the request filled in.');
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
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
    const count = root.querySelector<HTMLElement>('[data-filter-count]');
    const apply = (value: string) => {
      let shown = 0;
      items.forEach((item) => {
        const show = value === 'all' || (item.dataset.tags ?? '').split(' ').includes(value);
        item.hidden = !show;
        if (show) shown++;
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === value)));
      if (count) count.textContent = String(shown);
      root.dispatchEvent(new CustomEvent('filter:change', { detail: { value } }));
    };
    chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.filter!)));
  });
}
