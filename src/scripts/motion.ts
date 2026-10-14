/**
 * The GSAP layer: smooth scroll, parallax, marquee skew, magnetic buttons.
 * Loaded on idle by `main.ts`; everything here is an enhancement.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;

let lenis: Lenis | null = null;
let tickers: Array<() => void> = [];

/** Smooth wheel scrolling on pointing devices only — touch scrolls natively. */
function initLenis() {
  if (reduce || isCoarse()) return;
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => lenis && lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  tickers.push(() => gsap.ticker.remove(raf));
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add('lenis');
}

/** `data-parallax="0.15"` drifts an element against the scroll. */
function initParallax() {
  if (reduce || !isDesktop()) return;
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.15');
    gsap.fromTo(el, { yPercent: speed * 60 }, {
      yPercent: -speed * 60,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  // Full-bleed media inside dark bands zoom gently as the band crosses.
  gsap.utils.toArray<HTMLElement>('[data-scrub-zoom]').forEach((el) => {
    gsap.fromTo(el, { scale: 1.15 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/**
 * The hero as you leave it: the background drifts down and zooms slightly
 * (depth), the copy rises and fades — the page "lifts off" the hero.
 */
function initHero() {
  if (reduce) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const bg = hero.querySelector<HTMLElement>('[data-hero-bg]');
  const copy = hero.querySelector<HTMLElement>('[data-hero-copy]');
  const trigger = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  if (bg) gsap.fromTo(bg, { yPercent: 0, scale: 1.04 }, { yPercent: 18, scale: 1.14, ease: 'none', scrollTrigger: trigger });
  if (copy) gsap.to(copy, { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: trigger });
}

/**
 * A pinned horizontal rail: the section sticks while its track slides
 * sideways, one card per scroll step. Desktop only — below `lg` the same
 * markup is a native swipe rail, which is what touch expects.
 */
function initHorizontal() {
  if (reduce || !isDesktop()) return;
  gsap.utils.toArray<HTMLElement>('[data-horizontal]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('[data-horizontal-track]');
    if (!track) return;
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
    if (distance() < 40) return;
    track.style.overflow = 'visible';
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });
}

/** Words brighten one by one as the paragraph scrolls through the viewport. */
function initScrubWords() {
  if (reduce) return;
  gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
    if (!el.dataset.split) {
      // Split text nodes only, so inline links and bold survive.
      const walk = (node: Node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
              if (!part.trim()) return frag.append(part);
              const span = document.createElement('span');
              span.className = 'sw';
              span.textContent = part;
              frag.append(span);
            });
            child.replaceWith(frag);
          } else walk(child);
        });
      };
      walk(el);
      el.dataset.split = '1';
    }
    gsap.fromTo(el.querySelectorAll('.sw'), { opacity: 0.18 }, {
      opacity: 1,
      stagger: 0.05,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });
}

/** Dark bands grow from an inset card to full width as they arrive. */
function initScaleIn() {
  if (reduce) return;
  gsap.utils.toArray<HTMLElement>('[data-scale-in]').forEach((el) => {
    gsap.fromTo(el, { scale: 0.92, borderRadius: '40px' }, {
      scale: 1,
      borderRadius: '0px',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true },
    });
  });
}

/** Marquee rows lean into the scroll velocity, then settle. */
function initMarqueeSkew() {
  if (reduce || isCoarse()) return;
  const tracks = gsap.utils.toArray<HTMLElement>('[data-marquee-track]');
  if (!tracks.length) return;
  let skew = 0;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -90);
      if (Math.abs(v) > Math.abs(skew)) skew = v;
    },
  });
  const tick = () => {
    skew = gsap.utils.interpolate(skew, 0, 0.1);
    tracks.forEach((t) => gsap.set(t, { skewX: skew }));
  };
  gsap.ticker.add(tick);
  tickers.push(() => gsap.ticker.remove(tick));
}

function initMagnetic() {
  if (reduce || isCoarse()) return;
  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5 });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    tickers.push(() => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  });
}

/** Process cards stack and recede as the next one scrolls over them. */
function initStack() {
  if (reduce || !isDesktop()) return;
  gsap.utils.toArray<HTMLElement>('[data-stack] > *').forEach((card, i, arr) => {
    if (i === arr.length - 1) return;
    gsap.to(card, {
      scale: 0.94,
      opacity: 0.55,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top 22%', end: 'bottom 12%', scrub: true },
    });
  });
}

/** Cards tilt slightly toward the pointer. */
function initTilt() {
  if (reduce || isCoarse()) return;
  gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((el) => {
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: x * 6, rotateX: -y * 6, transformPerspective: 900, duration: 0.6 });
    };
    const leave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.8 });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    tickers.push(() => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  });
}

export function teardownMotion() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  tickers.forEach((fn) => fn());
  tickers = [];
  if (lenis) {
    lenis.destroy();
    lenis = null;
    document.documentElement.classList.remove('lenis');
  }
}

export function setupMotion() {
  teardownMotion();
  initLenis();
  initHero();
  initHorizontal();
  initScrubWords();
  initScaleIn();
  initParallax();
  initMarqueeSkew();
  initMagnetic();
  initStack();
  initTilt();
  ScrollTrigger.refresh();
}
