/**
 * The section preview drawer.
 *
 * Closed by default and opened on request, because rendering every section
 * eagerly would mean a dozen iframes each pulling the full site stylesheet —
 * and an editor looks at one section at a time anyway.
 *
 * It previews the *draft in memory*, not what is saved and not what is
 * published, and it re-renders as the editor types. That is the whole point:
 * seeing a change before Save, and certainly before Publish, is the thing the
 * old workflow could not do at all.
 *
 * The draft is POSTed to `/preview` through a hidden form targeting the iframe,
 * so a section travels as a body rather than a query string and a hero with
 * five slides is not up against a URL length limit.
 */
import { el } from './fields';
import { onDirtyChange, state } from './state';

type Viewport = 'desktop' | 'mobile';

/**
 * A real viewport, not just a width.
 *
 * The height matters as much as the width: sections are sized in `svh`, so a
 * frame stretched to its own content height would resolve `min-h-[86svh]`
 * against ten thousand pixels and render a hero the size of a building. Giving
 * the frame a genuine viewport and letting it scroll internally is what makes
 * the preview faithful.
 */
const VIEWPORTS: Record<Viewport, { width: number; minHeight: number; maxHeight: number }> = {
  desktop: { width: 1280, minHeight: 720, maxHeight: 1800 },
  mobile: { width: 390, minHeight: 720, maxHeight: 1200 },
};

/** Long enough that a burst of typing renders once, short enough to feel live. */
const DEBOUNCE_MS = 650;

let drawer: HTMLElement | null = null;
let frame: HTMLIFrameElement | null = null;
let stage: HTMLElement | null = null;
let holder: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let stateEl: HTMLElement | null = null;
let viewport: Viewport = 'desktop';

/**
 * Read live from the admin's state rather than holding a copy.
 *
 * A snapshot taken when the drawer opened would go stale on the first
 * keystroke, which is exactly what this is here to avoid.
 */
let source: (() => unknown[]) | null = null;
let timer: number | undefined;

/**
 * What the frame is showing.
 *
 * `sections` POSTs the in-memory draft at `/preview` — the original behaviour,
 * and the only one that can show unsaved edits, because the draft travels in
 * the request. `page` loads a real page from the site instead, which is the
 * only way to preview a tab like Fragrances: those records are read from the
 * store by the page's own components, not composed from the sections the
 * editor is looking at. The cost is that a page preview is only ever as fresh
 * as the last Save, which the state line says out loud.
 */
type Mode = 'sections' | 'page';
let mode: Mode = 'sections';
let pageUrl = '';
let noteEl: HTMLElement | null = null;

const NOTES: Record<Mode, string> = {
  sections: 'Shows unsaved edits. Scroll and pin animations are not simulated.',
  page: 'The real page, as saved. Save to pull edits in — Publish is only needed to reach visitors. Scripts are off, so sliders and scroll animations do not run.',
};

function build() {
  drawer = el('aside', 'preview');
  drawer.hidden = true;

  const head = el('div', 'preview-head');

  const heading = el('div', 'preview-heading');
  titleEl = el('strong', 'preview-title', 'Preview');
  stateEl = el('span', 'preview-state', 'Live draft');
  heading.append(titleEl, stateEl);

  const toggle = el('div', 'preview-toggle');
  for (const mode of ['desktop', 'mobile'] as Viewport[]) {
    const button = el('button', 'preview-mode', mode === 'desktop' ? 'Desktop' : 'Mobile');
    button.type = 'button';
    button.dataset.mode = mode;
    button.addEventListener('click', () => setViewport(mode));
    toggle.append(button);
  }

  const refresh = el('button', 'btn btn-icon', '⟳');
  refresh.type = 'button';
  refresh.title = 'Re-render now';
  refresh.addEventListener('click', () => render());

  const close = el('button', 'btn btn-icon', '✕');
  close.type = 'button';
  close.title = 'Close preview';
  close.addEventListener('click', hide);

  const tools = el('div', 'repeat-tools');
  tools.append(toggle, refresh, close);
  head.append(heading, tools);

  stage = el('div', 'preview-stage');
  holder = el('div', 'preview-holder');
  frame = document.createElement('iframe');
  frame.className = 'preview-frame';
  frame.name = 'section-preview';
  frame.title = 'Section preview';
  // Same-origin so the drawer can size it; scripts stay off because nothing in
  // a static preview needs them, and the content is whatever an editor typed.
  frame.setAttribute('sandbox', 'allow-same-origin');
  holder.append(frame);
  stage.append(holder);

  noteEl = el('p', 'preview-note', NOTES.sections);

  drawer.append(head, stage, noteEl);
  document.body.append(drawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer && !drawer.hidden) hide();
  });

  onDirtyChange(() => {
    if (!isPreviewOpen()) return;

    /*
     * A page preview cannot show an unsaved edit — the page reads the store,
     * and the keystroke is still in this tab's memory. So rather than
     * re-fetching identical HTML on every character, it says what it is
     * showing, and refreshes on the transition back to clean, which is a Save
     * landing.
     */
    if (mode === 'page') {
      if (state.dirty) {
        if (stateEl) stateEl.textContent = 'Unsaved edits — Save to see them';
        return;
      }
      render();
      return;
    }

    // Every edit marks the document dirty, which is the signal to re-render.
    if (stateEl) stateEl.textContent = 'Updating…';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => render(), DEBOUNCE_MS);
  });

  setViewport(viewport);
}

function setViewport(mode: Viewport) {
  viewport = mode;
  if (!stage || !drawer) return;

  for (const button of drawer.querySelectorAll<HTMLElement>('.preview-mode')) {
    button.classList.toggle('is-on', button.dataset.mode === mode);
  }

  /*
   * The frame renders at a real viewport width and is then scaled down to fit
   * the drawer, rather than being squeezed into it. Squeezing would trip the
   * layout's own breakpoints and show a narrow-desktop rendering while claiming
   * to be a desktop preview.
   */
  stage.dataset.mode = mode;
  fit();
}

function fit() {
  if (!frame || !stage || !holder) return;

  const { width, minHeight, maxHeight } = VIEWPORTS[viewport];

  // Fit the whole viewport width into the drawer, so a desktop preview shows
  // the desktop layout end to end rather than a cropped middle.
  const availableWidth = Math.max(stage.clientWidth - 32, 1);
  const availableHeight = Math.max(stage.clientHeight - 32, 1);
  const scale = Math.min(1, availableWidth / width);

  /*
   * The viewport is as tall as the drawer can show at that scale, so the
   * preview fills the panel instead of floating in dead space.
   *
   * This is a real window, not a stretched one: `svh` resolves against this
   * height exactly as it would in a browser sized the same way, so a hero still
   * occupies its proper fraction of the screen. The clamp is what keeps it
   * honest — an unbounded height is how the earlier version ended up resolving
   * `86svh` against a nine-thousand-pixel page and rendering a hero the size of
   * a building.
   */
  const height = Math.min(Math.max(availableHeight / scale, minHeight), maxHeight);

  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  frame.style.transform = `scale(${scale})`;

  // A CSS transform does not change layout size, so the holder carries the
  // scaled dimensions; without it the stage reserves the unscaled height.
  holder.style.width = `${width * scale}px`;
  holder.style.height = `${height * scale}px`;
}

/** Load whatever the current mode points at into the frame. */
function render() {
  if (!frame) return;

  if (mode === 'page') {
    /*
     * A unique query per load, because pages are ISR-cached at the edge: the
     * plain URL would hand back the copy that was cached before the Save, which
     * is the one state this pane exists to avoid showing.
     */
    const separator = pageUrl.includes('?') ? '&' : '?';
    frame.src = `${pageUrl}${separator}cms-preview=${Date.now()}`;
    if (stateEl) stateEl.textContent = state.dirty ? 'Unsaved edits — Save to see them' : 'As saved';
    return;
  }

  if (!source) return;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/preview';
  form.target = 'section-preview';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'sections';
  input.value = JSON.stringify(source());

  form.append(input);
  document.body.append(form);
  form.submit();
  form.remove();

  if (stateEl) stateEl.textContent = 'Live draft';
}

/**
 * Open the drawer on a live view of whatever `getSections` returns.
 *
 * Passing a function rather than the sections themselves is what keeps the
 * preview current: it is re-read on every render, so reordering, hiding or
 * editing shows up without reopening.
 */
export function showPreview(getSections: () => unknown[], title: string) {
  if (!drawer) build();
  mode = 'sections';
  source = getSections;
  if (noteEl) noteEl.textContent = NOTES.sections;
  if (titleEl) titleEl.textContent = title;
  drawer!.hidden = false;
  document.body.classList.add('has-preview');
  render();
  requestAnimationFrame(fit);
}

/**
 * Open the drawer on a real page of the site.
 *
 * Used by every panel heading, so an editor can see the thing they are editing
 * beside the form rather than guessing which page it feeds.
 */
export function showPagePreview(url: string, title: string) {
  if (!drawer) build();
  mode = 'page';
  source = null;
  pageUrl = url;
  if (noteEl) noteEl.textContent = NOTES.page;
  if (titleEl) titleEl.textContent = title;
  drawer!.hidden = false;
  document.body.classList.add('has-preview');
  render();
  requestAnimationFrame(fit);
}

export function hide() {
  if (!drawer) return;
  drawer.hidden = true;
  document.body.classList.remove('has-preview');
  source = null;
  mode = 'sections';
  window.clearTimeout(timer);
}

export const isPreviewOpen = () => Boolean(drawer && !drawer.hidden);

window.addEventListener('resize', () => {
  if (isPreviewOpen()) fit();
});
