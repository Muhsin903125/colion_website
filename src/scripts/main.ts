/**
 * The critical path — plain DOM and IntersectionObserver, no animation library.
 *
 * Everything the page needs to be *correct* runs here immediately: header
 * state, reveals, counters, background videos, the menu, forms, the gallery.
 * GSAP and Lenis (`motion.ts`, ~160 KB) load when the browser is next idle;
 * they only add scroll choreography, so the page is complete without them.
 *
 * Re-run on every `astro:page-load`, because ViewTransitions swaps the page
 * without a full load.
 */
import { initUI } from './ui';
import { initAnalytics } from './analytics';
import { initGallery } from './gallery';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let observers: IntersectionObserver[] = [];
let cleanups: Array<() => void> = [];

function once(
  selector: string,
  onEnter: (el: HTMLElement, index: number) => void,
  { margin = '0px 0px -10% 0px', threshold = 0 }: { margin?: string; threshold?: number } = {},
) {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      onEnter(el, els.indexOf(el));
      io.unobserve(el);
    });
  }, { rootMargin: margin, threshold });
  els.forEach((el) => io.observe(el));
  observers.push(io);
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let queued = false;
  const update = () => {
    queued = false;
    header.classList.toggle('is-solid', window.scrollY > 24);
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener('scroll', onScroll));
}

function initReveals() {
  const all = '.reveal, .reveal-scale, [data-lines], [data-clip]';
  if (reduce) {
    document.querySelectorAll(all).forEach((e) => e.classList.add('is-in'));
    return;
  }
  document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
    el.querySelectorAll<HTMLElement>('.line-inner').forEach((n, i) => (n.style.transitionDelay = `${i * 0.1}s`));
  });
  once('.reveal, .reveal-scale', (el, i) => setTimeout(() => el.classList.add('is-in'), (i % 4) * 70), { margin: '0px 0px -8% 0px', threshold: 0.08 });
  once('[data-lines]', (el) => el.classList.add('is-in'), { margin: '0px 0px -10% 0px' });
  once('[data-clip]', (el) => el.classList.add('is-in'), { margin: '0px 0px -12% 0px' });
  // Above the fold: don't wait for a scroll.
  document.querySelectorAll<HTMLElement>('[data-hero] [data-lines], [data-hero] [data-clip]').forEach((el) => {
    setTimeout(() => el.classList.add('is-in'), 120);
  });
}

function initCounts() {
  once('[data-count]', (el) => {
    const end = parseFloat(el.dataset.count || '0');
    if (reduce || !end) {
      el.textContent = el.dataset.count ?? '';
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1800);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))).toLocaleString('en');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/** Rotate the hero's closing word. */
function initRotator() {
  document.querySelectorAll<HTMLElement>('[data-rotate]').forEach((wrap) => {
    const words = Array.from(wrap.querySelectorAll<HTMLElement>('[data-word]'));
    if (words.length < 2 || reduce) return;
    let i = 0;
    const timer = window.setInterval(() => {
      words[i].classList.remove('is-on');
      words[i].classList.add('is-out');
      const prev = words[i];
      setTimeout(() => prev.classList.remove('is-out'), 700);
      i = (i + 1) % words.length;
      words[i].classList.add('is-on');
    }, 2400);
    cleanups.push(() => window.clearInterval(timer));
  });
}

/**
 * The hero's slide card: advance every few seconds, play only the clip that is
 * showing, pause while the card is off-screen or the tab is hidden.
 */
function initSlides() {
  document.querySelectorAll<HTMLElement>('[data-slides]').forEach((root) => {
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    const bars = [...root.querySelectorAll<HTMLElement>('[data-slide-go]')];
    if (!slides.length || getComputedStyle(root).display === 'none') return;
    const MS = 5000;
    root.style.setProperty('--slide-ms', `${MS}ms`);
    let i = 0;
    let timer = 0;
    let visible = true;
    const show = (n: number) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        const on = k === i;
        s.classList.toggle('is-on', on);
        s.toggleAttribute('aria-hidden', !on);
        const v = s.querySelector<HTMLVideoElement>('video[data-slide-video]');
        if (!v) return;
        if (on && !reduce) {
          if (!v.src) v.src = v.dataset.src || '';
          v.currentTime = 0;
          v.play().catch(() => {});
        } else v.pause();
      });
      bars.forEach((b, k) => {
        b.classList.remove('is-on');
        b.classList.toggle('is-done', k < i);
      });
      // Restart the fill animation on the active bar.
      void bars[i]?.offsetWidth;
      bars[i]?.classList.add('is-on');
      window.clearTimeout(timer);
      if (slides.length > 1 && visible && !reduce) timer = window.setTimeout(() => show(i + 1), MS);
    };
    bars.forEach((b, k) => b.addEventListener('click', () => show(k)));
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      if (visible) show(i);
      else {
        window.clearTimeout(timer);
        slides.forEach((s) => s.querySelector<HTMLVideoElement>('video')?.pause());
      }
    });
    io.observe(root);
    observers.push(io);
    cleanups.push(() => window.clearTimeout(timer));
  });
}

/**
 * Background and preview videos: attach the source only when the clip nears
 * the viewport, play while visible, pause when not. Skipped entirely on
 * Save-Data, slow connections and reduced motion — the poster stays.
 */
function initVideos() {
  const clips = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-bg-video]'));
  if (!clips.length || reduce) return;
  const conn = (navigator as any).connection;
  if (conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? '')) return;
  const small = window.matchMedia('(max-width: 767px)').matches;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) {
        if (!v.src) {
          v.src = (small && v.dataset.srcMobile) || v.dataset.src || '';
          v.addEventListener('playing', () => v.classList.remove('opacity-0'), { once: true });
        }
        v.play().catch(() => {});
      } else if (v.src) {
        v.pause();
      }
    }
  }, { rootMargin: '200px 0px' });
  clips.forEach((v) => io.observe(v));
  observers.push(io);
}

/**
 * The floating contact dock appears once the hero has left the screen, so it
 * never covers the hero's own call to action.
 */
function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  if (!dock) return;
  dock.classList.remove('is-on');
  dock.querySelector('[data-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    const io = new IntersectionObserver(([entry]) => dock.classList.toggle('is-on', !entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(hero);
    observers.push(io);
  } else {
    const onScroll = () => dock.classList.toggle('is-on', window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }
}

function initProgress() {
  let bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  const el = bar;
  let queued = false;
  const update = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    });
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  cleanups.push(() => window.removeEventListener('scroll', update));
}

/**
 * The old site was one page with anchors. Links people saved — `/#products`,
 * `/#contact` — still arrive at the home page; send them to the real page.
 */
function legacyAnchors() {
  if (location.pathname !== '/' || !location.hash) return;
  const map: Record<string, string> = {
    '#about': '/about/',
    '#services': '/services/',
    '#featured-services': '/services/',
    '#products': '/products/',
    '#contact': '/contact/',
    '#social-media': '/gallery/',
  };
  const to = map[location.hash];
  if (to && !document.getElementById(location.hash.slice(1))) location.replace(to);
}

let motion: typeof import('./motion') | null = null;
function loadMotion() {
  const start = () => {
    import('./motion')
      .then((m) => {
        motion = m;
        m.setupMotion();
      })
      .catch(() => {});
  };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(start, { timeout: 2500 });
  else setTimeout(start, 800);
}

function cleanup() {
  observers.forEach((o) => o.disconnect());
  observers = [];
  cleanups.forEach((fn) => fn());
  cleanups = [];
  motion?.teardownMotion();
}

function setup() {
  (window as any).__colionMotion = true;
  cleanup();
  legacyAnchors();
  initHeader();
  initReveals();
  initCounts();
  initRotator();
  initVideos();
  initSlides();
  initProgress();
  initDock();
  initUI();
  initGallery();
  initAnalytics();
  if (motion) motion.setupMotion();
  else loadMotion();
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', cleanup);
