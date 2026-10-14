/**
 * Form primitives, bound to the document by dot-path.
 *
 * Ported from BiasRetailWeb's `js/cms-admin.js` with two fixes.
 *
 *   1. `repeater()` re-renders only the list it changed. Bias calls the whole
 *      panel's `render()` on every Add and Remove, which loses focus, scroll
 *      position and any open section.
 *   2. Inputs are never rebuilt while the editor is typing into them, so a
 *      keystroke cannot be dropped mid-word.
 */
import { clone, get, set, type Path } from './state';

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const idFor = (path: Path) =>
  `f-${(Array.isArray(path) ? path.join('-') : path).replace(/[^\w-]/g, '-')}`;

export interface FieldOptions {
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  help?: string;
  rows?: number;
}

/** A labelled text input or textarea. */
export function field(label: string, path: Path, options: FieldOptions = {}): HTMLElement {
  const wrap = el('div', 'f');
  const id = idFor(path);

  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const input = options.multiline
    ? document.createElement('textarea')
    : document.createElement('input');
  input.id = id;
  if (!options.multiline) (input as HTMLInputElement).type = options.type ?? 'text';
  if (options.multiline && options.rows) (input as HTMLTextAreaElement).rows = options.rows;
  if (options.placeholder) input.placeholder = options.placeholder;
  input.value = String(get(path, ''));
  input.addEventListener('input', () => set(path, input.value));

  wrap.append(labelNode, input);
  if (options.help) wrap.append(el('p', 'f-help', options.help));
  return wrap;
}

export function numberField(label: string, path: Path, help?: string): HTMLElement {
  const wrap = el('div', 'f');
  const id = idFor(path);
  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const input = document.createElement('input');
  input.id = id;
  input.type = 'number';
  input.value = String(get(path, 0));
  // An emptied field stays empty rather than becoming 0 — a blank price should
  // fail validation, not silently publish a free product.
  input.addEventListener('input', () => set(path, input.value === '' ? null : Number(input.value)));

  wrap.append(labelNode, input);
  if (help) wrap.append(el('p', 'f-help', help));
  return wrap;
}

/**
 * An optional colour: swatch, hex, and a way to mean "none".
 *
 * `<input type="color">` cannot express unset — it reports #000000 when it has
 * never been touched, so using one alone for a field whose empty value means
 * "keep the house default" would paint every untouched record black on the
 * first save. Pairing it with the hex as text is what makes clearing possible,
 * and the text box is also how an editor pastes a brand colour they already
 * have rather than hunting for it in the picker.
 */
export function colorField(label: string, path: Path, help?: string): HTMLElement {
  const wrap = el('div', 'f');
  const id = idFor(path);
  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const row = el('div', 'color-row');

  const swatch = document.createElement('input');
  swatch.type = 'color';
  swatch.id = id;

  const hex = document.createElement('input');
  hex.type = 'text';
  hex.placeholder = 'None';
  hex.spellcheck = false;

  const clear = el('button', 'btn btn-icon btn-danger', '✕');
  clear.type = 'button';
  clear.title = 'Clear — back to the default';

  const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

  const sync = () => {
    const value = String(get(path, '') ?? '');
    hex.value = value;
    // The swatch must show something even when nothing is set. Porcelain is
    // what an unset card actually looks like, so opening the picker starts the
    // editor next to the current appearance rather than at black.
    swatch.value = isHex(value) ? value : '#FFF1F6';
  };

  swatch.addEventListener('input', () => {
    set(path, swatch.value);
    hex.value = swatch.value;
  });

  hex.addEventListener('input', () => {
    const value = hex.value.trim();
    set(path, value);
    if (isHex(value)) swatch.value = value;
  });

  clear.addEventListener('click', () => {
    set(path, '');
    sync();
  });

  row.append(swatch, hex, clear);
  wrap.append(labelNode, row);
  if (help) wrap.append(el('p', 'f-help', help));

  sync();
  return wrap;
}

/** A bounded number on a slider, with the value shown beside it. */
export function rangeField(
  label: string,
  path: Path,
  options: { min?: number; max?: number; step?: number; suffix?: string; help?: string } = {},
): HTMLElement {
  const { min = 0, max = 100, step = 1, suffix = '', help } = options;
  const wrap = el('div', 'f');
  const id = idFor(path);
  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const row = el('div', 'range-row');
  const input = document.createElement('input');
  input.id = id;
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(get(path, min) ?? min);

  const readout = el('span', 'range-value', input.value + suffix);
  input.addEventListener('input', () => {
    set(path, Number(input.value));
    readout.textContent = input.value + suffix;
  });

  row.append(input, readout);
  wrap.append(labelNode, row);
  if (help) wrap.append(el('p', 'f-help', help));
  return wrap;
}

export function checkbox(label: string, path: Path): HTMLElement {
  const wrap = el('label', 'f-check');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(get(path, false));
  input.addEventListener('change', () => set(path, input.checked));
  wrap.append(input, document.createTextNode(' ' + label));
  return wrap;
}

export function select(label: string, path: Path, options: string[]): HTMLElement {
  const wrap = el('div', 'f');
  const id = idFor(path);
  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const node = document.createElement('select');
  node.id = id;
  const current = String(get(path, options[0]));
  for (const value of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    option.selected = value === current;
    node.append(option);
  }
  node.addEventListener('change', () => set(path, node.value));

  wrap.append(labelNode, node);
  return wrap;
}

/** One item per line, stored as a string array. */
export function listField(label: string, path: Path, help?: string): HTMLElement {
  const wrap = el('div', 'f');
  const id = idFor(path);
  const labelNode = el('label', '', label);
  labelNode.setAttribute('for', id);

  const input = document.createElement('textarea');
  input.id = id;
  input.rows = 4;
  input.value = (get(path, []) as string[]).join('\n');
  input.addEventListener('input', () => {
    set(path, input.value.split('\n').map((l) => l.trim()).filter(Boolean));
  });

  wrap.append(labelNode, input);
  if (help) wrap.append(el('p', 'f-help', help));
  return wrap;
}

/** A display heading, one line per rendered span. */
export const linesField = (label: string, path: Path) =>
  listField(label, path, 'One line per row — each becomes its own animated line in the heading.');

/** Label plus href, the shape every CTA uses. */
export function linkField(label: string, path: (string | number)[]): HTMLElement {
  return group(label, [
    field('Button text', [...path, 'label']),
    field('Link', [...path, 'href'], {
      placeholder: '/contact/',
      help: 'A path like /contact/, a full URL, or wa:Your message to open WhatsApp with that text prefilled.',
    }),
  ]);
}

export function group(title: string, children: (HTMLElement | null)[]): HTMLElement {
  const card = el('section', 'card');
  card.append(el('h2', '', title));
  const inner = el('div', 'grid');
  for (const child of children) if (child) inner.append(child);
  card.append(inner);
  return card;
}

/** A vertical run of blocks, for a repeater row that needs more than a grid. */
export function stack(children: (HTMLElement | null)[]): HTMLElement {
  const node = el('div', 'stack');
  for (const child of children) if (child) node.append(child);
  return node;
}

export function grid(children: (HTMLElement | null)[]): HTMLElement {
  const node = el('div', 'grid');
  for (const child of children) if (child) node.append(child);
  return node;
}

/* ── repeating lists ────────────────────────────────────────────────────── */

export interface RepeaterOptions {
  title: string;
  path: Path;
  defaults: any;
  /** Label for one row, usually the item's own name. */
  label?: (item: any, index: number) => string;
  render: (itemPath: (string | number)[], item: any, index: number) => HTMLElement;
  sortable?: boolean;
  addLabel?: string;
  /** Rendered when the list is empty. */
  emptyText?: string;
}

/**
 * An editable array.
 *
 * Only this list redraws when a row is added, removed or moved — the rest of
 * the panel, including whatever the editor is mid-way through typing, is left
 * alone.
 */
export function repeater(options: RepeaterOptions): HTMLElement {
  const {
    title,
    path,
    defaults,
    label,
    render,
    sortable = true,
    addLabel = 'Add',
    emptyText = 'Nothing here yet.',
  } = options;

  /**
   * Which rows are expanded, by index.
   *
   * Empty to start, so a list opens as a scannable index rather than as a
   * dozen full forms stacked end to end — twelve fragrances expanded is several
   * screens of scrolling before the second name. The row head already carries
   * the one thing you look for, which is what makes the closed state usable.
   *
   * Held here rather than in the DOM so it survives `redraw()`, which rebuilds
   * every row from scratch on an add, a move or a delete.
   */
  const open = new Set<number>();

  const card = el('section', 'card');
  const head = el('div', 'card-head');
  head.append(el('h2', '', title));

  const expandAll = el('button', 'btn btn-sm', 'Expand all');
  expandAll.type = 'button';
  expandAll.addEventListener('click', () => {
    const items = get(path, []) as any[];
    const allOpen = items.length > 0 && open.size >= items.length;
    open.clear();
    if (!allOpen) items.forEach((_, index) => open.add(index));
    redraw();
  });

  const add = el('button', 'btn btn-sm', addLabel);
  add.type = 'button';
  add.addEventListener('click', () => {
    const items = [...(get(path, []) as any[])];
    items.push(clone(defaults));
    set(path, items);
    // Open the row that was just created and close the rest: it is empty, and
    // it is the only one the editor came here to fill in.
    open.clear();
    open.add(items.length - 1);
    redraw();
  });

  const tools = el('div', 'repeat-tools');
  tools.append(expandAll, add);
  head.append(tools);
  card.append(head);

  const list = el('div', 'repeat');
  card.append(list);

  const basePath = () => (Array.isArray(path) ? [...path] : String(path).split('.'));

  function move(from: number, to: number) {
    const items = [...(get(path, []) as any[])];
    if (to < 0 || to >= items.length) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);

    // Open rows are tracked by index, so they have to follow the same splice —
    // otherwise nudging a row up closes it and opens whichever one took its
    // place, which reads as the panel losing your place.
    const shift = (index: number) => {
      if (index === from) return to;
      if (from < to) return index > from && index <= to ? index - 1 : index;
      return index >= to && index < from ? index + 1 : index;
    };
    const moved_open = [...open].map(shift);
    open.clear();
    for (const index of moved_open) open.add(index);

    set(path, items);
    redraw();
  }

  /** Keep the header control saying what pressing it will do. */
  function syncExpandAll() {
    const count = (get(path, []) as any[]).length;
    expandAll.hidden = count === 0;
    expandAll.textContent = count > 0 && open.size >= count ? 'Collapse all' : 'Expand all';
  }

  function redraw() {
    list.replaceChildren();
    const items = get(path, []) as any[];
    syncExpandAll();

    if (!items.length) {
      list.append(el('p', 'empty', emptyText));
      return;
    }

    items.forEach((item, index) => {
      const itemPath = [...basePath(), index];

      /*
       * A `details` element, the same shape the section list already uses, so
       * both lists collapse the same way and this one inherits the keyboard
       * and screen-reader behaviour for free rather than reimplementing it on
       * a div.
       */
      const row = el('details', 'repeat-item');
      row.open = open.has(index);

      const rowHead = el('summary', 'repeat-head');
      const name = label ? label(item, index) : `Item ${index + 1}`;
      rowHead.append(el('h3', '', name));

      const tools = el('div', 'repeat-tools');

      if (sortable) {
        const up = el('button', 'btn btn-icon', '↑');
        up.type = 'button';
        up.title = 'Move up';
        up.disabled = index === 0;
        // Every tool sits inside the summary, where a click would otherwise
        // toggle the row open as a side effect of pressing the button.
        up.addEventListener('click', (e) => { e.preventDefault(); move(index, index - 1); });

        const down = el('button', 'btn btn-icon', '↓');
        down.type = 'button';
        down.title = 'Move down';
        down.disabled = index === items.length - 1;
        down.addEventListener('click', (e) => { e.preventDefault(); move(index, index + 1); });

        tools.append(up, down);
      }

      const duplicate = el('button', 'btn btn-icon', '⧉');
      duplicate.type = 'button';
      duplicate.title = 'Duplicate';
      duplicate.addEventListener('click', (e) => {
        e.preventDefault();
        const next = [...(get(path, []) as any[])];
        next.splice(index + 1, 0, clone(next[index]));
        set(path, next);
        open.clear();
        open.add(index + 1);
        redraw();
      });

      const remove = el('button', 'btn btn-icon btn-danger', '✕');
      remove.type = 'button';
      remove.title = 'Remove';
      remove.addEventListener('click', async (e) => {
        e.preventDefault();
        /*
         * Imported at click time, not at the top of the file.
         *
         * `dialog` imports `el` from this module, so a static import back the
         * other way is a cycle — and `el` is a `const`, which means whichever
         * module the bundler happens to evaluate second finds the other's
         * binding still in its temporal dead zone. Loading the dialog when the
         * button is pressed removes the question entirely.
         */
        const { confirmAction } = await import('./dialog');
        const ok = await confirmAction({
          title: `Remove ${name}?`,
          body: 'It comes out of the list straight away.',
          warning: 'The panel has no undo. The only way back is to leave without saving, which drops every other edit with it.',
          confirmLabel: 'Remove',
          tone: 'danger',
        });
        if (!ok) return;

        // Re-read rather than closing over the array: the dialog was open for
        // as long as the editor took to read it, and a row may have moved.
        const next = [...(get(path, []) as any[])];
        next.splice(index, 1);
        set(path, next);
        open.clear();
        redraw();
      });

      tools.append(duplicate, remove);
      rowHead.append(tools);

      row.append(rowHead, render(itemPath, item, index));
      row.addEventListener('toggle', () => {
        if (row.open) open.add(index);
        else open.delete(index);
        syncExpandAll();
      });

      list.append(row);
    });
  }

  redraw();
  return card;
}
