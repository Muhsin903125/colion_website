/**
 * Gallery behaviour: the lightbox, reel previews, and "load more".
 *
 * Any `[data-lb]` element inside a `[data-lb-root]` opens the lightbox on
 * click. It carries what the lightbox needs as data attributes, so the same
 * markup works for the gallery grid, the home-page strip and the reel rail:
 *
 *   data-lb-kind="image|video|reel"  data-lb-src  data-lb-poster
 *   data-lb-title  data-lb-caption  data-lb-ig
 */
import { track } from './analytics';

interface Item {
  kind: string;
  src: string;
  poster: string;
  title: string;
  caption: string;
  ig: string;
}

let box: HTMLElement | null = null;

function buildBox() {
  if (box && document.body.contains(box)) return box;
  box = document.createElement('div');
  box.className = 'lb';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Gallery viewer');
  box.innerHTML = `
    <div class="lb-backdrop" data-lb-close></div>
    <button type="button" class="lb-btn lb-close" data-lb-close aria-label="Close">✕</button>
    <button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="Previous">‹</button>
    <button type="button" class="lb-btn lb-next" data-lb-next aria-label="Next">›</button>
    <figure class="lb-stage"><div class="lb-media"></div>
      <figcaption class="lb-cap"><strong class="lb-title"></strong><span class="lb-text"></span><a class="lb-ig" target="_blank" rel="noopener">View on Instagram ↗</a><span class="lb-count"></span></figcaption>
    </figure>`;
  document.body.appendChild(box);
  return box;
}

function openAt(items: Item[], start: number) {
  const el = buildBox();
  const media = el.querySelector<HTMLElement>('.lb-media')!;
  let index = start;
  let lastFocus = document.activeElement as HTMLElement | null;

  const show = () => {
    const it = items[index];
    media.innerHTML = '';
    if (it.kind === 'image') {
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.caption || it.title;
      media.appendChild(img);
    } else {
      const v = document.createElement('video');
      v.src = it.src;
      v.poster = it.poster;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.className = it.kind === 'reel' ? 'is-reel' : '';
      media.appendChild(v);
      track('reel_play', { title: it.title });
    }
    el.querySelector('.lb-title')!.textContent = it.title;
    el.querySelector('.lb-text')!.textContent = it.caption && it.caption !== it.title ? it.caption : '';
    const ig = el.querySelector<HTMLAnchorElement>('.lb-ig')!;
    ig.hidden = !it.ig;
    if (it.ig) ig.href = it.ig;
    el.querySelector('.lb-count')!.textContent = `${index + 1} / ${items.length}`;
  };

  const go = (step: number) => {
    index = (index + step + items.length) % items.length;
    show();
  };

  const close = () => {
    el.hidden = true;
    media.innerHTML = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    lastFocus?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  el.querySelectorAll('[data-lb-close]').forEach((b) => ((b as HTMLElement).onclick = close));
  (el.querySelector('[data-lb-prev]') as HTMLElement).onclick = () => go(-1);
  (el.querySelector('[data-lb-next]') as HTMLElement).onclick = () => go(1);

  // Swipe on touch.
  let x0 = 0;
  media.ontouchstart = (e) => (x0 = e.touches[0].clientX);
  media.ontouchend = (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  el.hidden = false;
  show();
  (el.querySelector('.lb-close') as HTMLElement).focus();
  track('gallery_open', { title: items[start].title });
}

const read = (el: HTMLElement): Item => ({
  kind: el.dataset.lbKind || 'image',
  src: el.dataset.lbSrc || '',
  poster: el.dataset.lbPoster || '',
  title: el.dataset.lbTitle || '',
  caption: el.dataset.lbCaption || '',
  ig: el.dataset.lbIg || '',
});

function wireRoot(root: HTMLElement) {
  if (root.dataset.lbWired) return;
  root.dataset.lbWired = '1';
  root.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lb]');
    if (!trigger || !root.contains(trigger)) return;
    e.preventDefault();
    const visible = [...root.querySelectorAll<HTMLElement>('[data-lb]')].filter((el) => !el.closest('[hidden]'));
    openAt(visible.map(read), Math.max(0, visible.indexOf(trigger)));
  });
}

/** Reel cards play a silent preview on hover (desktop) or when centred (touch). */
function initPreviews() {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-preview]')];
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = (card: HTMLElement) => {
    const v = card.querySelector<HTMLVideoElement>('video');
    if (!v) return;
    if (!v.src && v.dataset.src) v.src = v.dataset.src;
    v.play().then(() => v.classList.remove('opacity-0')).catch(() => {});
  };
  const stop = (card: HTMLElement) => card.querySelector<HTMLVideoElement>('video')?.pause();

  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach((c) => {
      c.addEventListener('mouseenter', () => start(c));
      c.addEventListener('mouseleave', () => stop(c));
    });
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start(e.target as HTMLElement) : stop(e.target as HTMLElement))),
      { threshold: 0.75 },
    );
    cards.forEach((c) => io.observe(c));
  }
}

/** Reveal the next batch of server-rendered tiles. */
function initLoadMore() {
  document.querySelectorAll<HTMLButtonElement>('[data-load-more]').forEach((btn) => {
    const root = btn.closest<HTMLElement>('[data-lb-root]');
    if (!root) return;
    const step = Number(btn.dataset.loadMore || 12);
    const update = () => {
      const pending = [...root.querySelectorAll<HTMLElement>('[data-more]')].filter((el) => !el.hidden || el.dataset.more === 'pending');
      btn.hidden = !root.querySelector('[data-more="pending"]');
      return pending;
    };
    btn.addEventListener('click', () => {
      const pending = [...root.querySelectorAll<HTMLElement>('[data-more="pending"]')];
      const active = root.dataset.filterActive || 'all';
      let shown = 0;
      for (const el of pending) {
        if (shown >= step) break;
        el.dataset.more = 'shown';
        const match = active === 'all' || (el.dataset.tags ?? '').split(' ').includes(active);
        el.hidden = !match;
        if (match) shown++;
      }
      update();
    });
    root.addEventListener('filter:change', (e: any) => {
      root.dataset.filterActive = e.detail.value;
      // Filtering considers every item, loaded or not, so nothing is "missing".
      root.querySelectorAll<HTMLElement>('[data-more="pending"]').forEach((el) => (el.dataset.more = 'shown'));
      btn.hidden = true;
    });
    update();
  });
}

export function initGallery() {
  document.querySelectorAll<HTMLElement>('[data-lb-root]').forEach(wireRoot);
  initPreviews();
  initLoadMore();
}
