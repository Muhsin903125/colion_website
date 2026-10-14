/**
 * The page builder: add, reorder, hide and edit the sections of a page.
 *
 * Each section type declares its own field set and defaults, so adding a type
 * here is all that is needed for editors to place it — SectionRenderer already
 * knows how to draw it. Types and fields mirror `src/data/schema.ts`.
 */
import { checkbox, el, field, grid, group, linesField, linkField, listField, numberField, repeater, select } from './fields';
import { mediaField } from './media';
import { confirmAction } from './dialog';
import { showPreview } from './preview';
import { clone, get, set } from './state';

const SIZE = {
  bleed: 'Upload 2400 × 1400 px or larger, landscape. It runs full-bleed behind text, so keep the middle uncluttered.',
  frame: 'Upload 1600 × 1200 px (4:3, landscape).',
  portrait: 'Upload 1200 × 1500 px (4:5, portrait).',
  card: 'Upload 1600 × 1000 px (16:10, landscape).',
};

type P = (string | number)[];

const image = () => ({ publicId: '', alt: '', version: null, width: null, height: null });
const link = () => ({ label: '', href: '' });
const intro = () => ({ label: '', lines: [], body: '', cta: link() });
const video = () => ({ src: '', srcMobile: '', poster: image() });

const introFields = (path: P, opts: { cta?: boolean } = {}) => [
  linesField('Heading (one line per row — the last line is set in the accent italic)', [...path, 'lines']),
  field('Body', [...path, 'body'], { multiline: true, rows: 3, help: 'Links: [text](/products/printers/). Bold: **text**.' }),
  ...(opts.cta === false ? [] : [linkField('Button', [...path, 'cta'])]),
];

const videoFields = (path: P) =>
  group('Background video (optional)', [
    field('Video', [...path, 'src'], { help: 'A /videos/… path, or a Cloudinary video public id from the Gallery tab.' }),
    field('Phone video', [...path, 'srcMobile'], { help: 'Optional smaller or vertical version for phones.' }),
    mediaField('Poster image', [...path, 'poster'], { size: SIZE.bleed }),
  ]);

const stats = (path: P) =>
  repeater({
    title: 'Figures (leave empty to use the site figures from Highlights)',
    path,
    label: (s, i) => (s.value ? `${s.value}${s.unit} ${s.label}` : `Figure ${i + 1}`),
    defaults: { value: '', unit: '', label: '' },
    render: (p) => grid([field('Value', [...p, 'value']), field('Unit', [...p, 'unit']), field('Caption', [...p, 'label'])]),
  });

const titleBody = (title: string, path: P) =>
  repeater({
    title,
    path,
    label: (x, i) => x.title || `Item ${i + 1}`,
    defaults: { title: '', body: '' },
    render: (p) => grid([field('Title', [...p, 'title']), field('Body', [...p, 'body'], { multiline: true, rows: 2 })]),
  });

export interface SectionType {
  name: string;
  hint: string;
  defaults: () => Record<string, unknown>;
  fields: (path: P, item: any) => HTMLElement[];
}

export const SECTION_TYPES: Record<string, SectionType> = {
  videoHero: {
    name: 'Home hero (full-bleed video)',
    hint: 'Headline over a full-screen background video, with a rotating last word.',
    defaults: () => ({ eyebrow: '', lines: [], rotating: [], body: '', cta: link(), secondary: link(), video: video(), chips: [], trust: [] }),
    fields: (p) => [
      linesField('Heading lines', [...p, 'lines']),
      listField('Rotating words', [...p, 'rotating'], 'One per line. They cycle at the end of the last heading line.'),
      field('Body', [...p, 'body'], { multiline: true, rows: 3 }),
      linkField('Main button', [...p, 'cta']),
      linkField('Second button', [...p, 'secondary']),
      videoFields([...p, 'video']),
    ],
  },
  pageHero: {
    name: 'Page hero',
    hint: 'Interior page opener: heading and copy beside a photo or video.',
    defaults: () => ({ background: image(), video: video(), intro: intro(), secondary: link(), align: 'left', size: 'medium', focus: '' }),
    fields: (p) => [
      ...introFields([...p, 'intro']),
      linkField('Second button', [...p, 'secondary']),
      mediaField('Photo', [...p, 'background'], { size: SIZE.frame }),
      videoFields([...p, 'video']),
      select('Size', [...p, 'size'], ['tall', 'medium', 'short']),
    ],
  },
  featureStrip: {
    name: 'Feature strip',
    hint: 'The five promises (delivery, wholesale, installation, support, AMC) from Highlights.',
    defaults: () => ({ intro: intro() }),
    fields: (p) => introFields([...p, 'intro']),
  },
  answerSection: {
    name: 'Question & answer',
    hint: 'A question heading with a 40–60 word answer — the shape search snippets and AI answers quote.',
    defaults: () => ({ label: '', question: '', answer: '', bullets: [], image: image(), cta: link() }),
    fields: (p) => [
      field('Question', [...p, 'question']),
      field('Answer (40–60 words; name Colion and the place)', [...p, 'answer'], { multiline: true, rows: 4 }),
      listField('Bullet points', [...p, 'bullets'], 'One per line. Optional.'),
      mediaField('Photo', [...p, 'image'], { size: SIZE.frame }),
      linkField('Button', [...p, 'cta']),
    ],
  },
  splitProse: {
    name: 'Story (heading + paragraphs)',
    hint: 'A sticky heading beside long-form paragraphs, with optional figures.',
    defaults: () => ({ intro: intro(), paragraphs: [], stats: [] }),
    fields: (p) => [...introFields([...p, 'intro'], { cta: false }), listField('Paragraphs', [...p, 'paragraphs'], 'One paragraph per line.'), stats([...p, 'stats'])],
  },
  aboutBlock: {
    name: 'About block',
    hint: 'Two overlapping photos, paragraphs, ticked highlights and two buttons.',
    defaults: () => ({ intro: intro(), paragraphs: [], image: image(), secondImage: image(), badge: { value: '', label: '' }, highlights: [], secondary: link() }),
    fields: (p) => [
      ...introFields([...p, 'intro']),
      listField('Paragraphs', [...p, 'paragraphs'], 'One paragraph per line.'),
      listField('Highlights', [...p, 'highlights'], 'One per line.'),
      linkField('Second button', [...p, 'secondary']),
      mediaField('Main photo', [...p, 'image'], { size: SIZE.portrait }),
      mediaField('Small photo', [...p, 'secondImage'], { size: 'Square, 1000 × 1000 px.' }),
    ],
  },
  pillarGrid: {
    name: 'Reasons grid',
    hint: 'Cards with an icon, title and text — e.g. why choose Colion.',
    defaults: () => ({ tone: 'light', columns: 3, intro: intro(), items: [] }),
    fields: (p) => [
      ...introFields([...p, 'intro']),
      select('Background', [...p, 'tone'], ['light', 'sky', 'dark']),
      numberField('Columns (2–4)', [...p, 'columns']),
      repeater({
        title: 'Cards',
        path: [...p, 'items'],
        label: (x, i) => x.title || `Card ${i + 1}`,
        defaults: { icon: 'check', title: '', body: '' },
        render: (ip) => grid([select('Icon', [...ip, 'icon'], ICONS), field('Title', [...ip, 'title']), field('Text', [...ip, 'body'], { multiline: true, rows: 2 })]),
      }),
    ],
  },
  featureSplit: {
    name: 'Feature split',
    hint: 'Two photos beside a heading and a definition list.',
    defaults: () => ({ images: [image(), image()], intro: intro(), items: [], reverse: false }),
    fields: (p) => [
      ...introFields([...p, 'intro']),
      mediaField('Photo 1', [...p, 'images', 0], { size: SIZE.portrait }),
      mediaField('Photo 2', [...p, 'images', 1], { size: SIZE.portrait }),
      titleBody('Items', [...p, 'items']),
      checkbox('Photos on the right', [...p, 'reverse']),
    ],
  },
  statBand: {
    name: 'Figures band (dark, video)',
    hint: 'Headline numbers over a dark full-width video.',
    defaults: () => ({ background: image(), video: video(), intro: intro(), stats: [] }),
    fields: (p) => [...introFields([...p, 'intro'], { cta: false }), stats([...p, 'stats']), mediaField('Background photo', [...p, 'background'], { size: SIZE.bleed }), videoFields([...p, 'video'])],
  },
  cardGrid: {
    name: 'Card grid',
    hint: 'Free-form cards with a photo or icon, text and a link.',
    defaults: () => ({ intro: intro(), columns: 3, cards: [] }),
    fields: (p) => [
      ...introFields([...p, 'intro']),
      numberField('Columns (2–4)', [...p, 'columns']),
      repeater({
        title: 'Cards',
        path: [...p, 'cards'],
        label: (c, i) => c.title || `Card ${i + 1}`,
        defaults: { icon: '', title: '', body: '', image: image(), cta: link() },
        render: (cp) => grid([field('Title', [...cp, 'title']), field('Text', [...cp, 'body'], { multiline: true, rows: 2 }), select('Icon', [...cp, 'icon'], ['', ...ICONS]), mediaField('Photo', [...cp, 'image'], { size: SIZE.card }), linkField('Link', [...cp, 'cta'])]),
      }),
    ],
  },
  processSteps: {
    name: 'Steps',
    hint: 'Numbered steps. Tick "HowTo" to publish them as a how-to for search.',
    defaults: () => ({ intro: intro(), steps: [], image: image(), asHowTo: false }),
    fields: (p) => [...introFields([...p, 'intro']), titleBody('Steps', [...p, 'steps']), mediaField('Photo', [...p, 'image'], { size: SIZE.frame }), checkbox('Publish as HowTo structured data', [...p, 'asHowTo'])],
  },
  faqBlock: {
    name: 'FAQ',
    hint: 'Accordion of questions from the FAQ tab.',
    defaults: () => ({ intro: intro(), source: 'top', groupIds: [] }),
    fields: (p) => [...introFields([...p, 'intro']), select('Which questions', [...p, 'source'], ['top', 'all', 'groups']), listField('Group ids (for "groups")', [...p, 'groupIds'], 'One per line: ordering, delivery, warranty, services.')],
  },
  ctaBand: {
    name: 'Call to action (dark, video)',
    hint: 'Closing band with a WhatsApp button over a video.',
    defaults: () => ({ background: image(), video: video(), intro: intro(), secondary: link() }),
    fields: (p) => [...introFields([...p, 'intro']), linkField('Second button', [...p, 'secondary']), mediaField('Background photo', [...p, 'background'], { size: SIZE.bleed }), videoFields([...p, 'video'])],
  },
  richText: {
    name: 'Text',
    hint: 'Plain paragraphs — legal pages, notes, one-off copy.',
    defaults: () => ({ tone: 'white', align: 'left', intro: intro(), paragraphs: [] }),
    fields: (p) => [...introFields([...p, 'intro'], { cta: false }), listField('Paragraphs', [...p, 'paragraphs'], 'One paragraph per line. **bold** and [links](/url) work.'), select('Background', [...p, 'tone'], ['white', 'surface', 'sky']), select('Alignment', [...p, 'align'], ['left', 'center'])],
  },
  formBlock: {
    name: 'Quotation form',
    hint: 'The enquiry form that opens WhatsApp or email.',
    defaults: () => ({ intro: intro(), note: '', interests: [], quantities: [], next: [] }),
    fields: (p) => [
      ...introFields([...p, 'intro'], { cta: false }),
      field('Note under the form', [...p, 'note']),
      listField('"Interested in" options', [...p, 'interests'], 'Leave empty to list every product category and service automatically.'),
      listField('Quantity options', [...p, 'quantities'], 'One per line.'),
      titleBody('What happens next', [...p, 'next']),
    ],
  },
  ticker: {
    name: 'Ticker',
    hint: 'A scrolling line of short phrases.',
    defaults: () => ({ tone: 'light', items: [] }),
    fields: (p) => [listField('Phrases', [...p, 'items'], 'One per line.'), select('Tone', [...p, 'tone'], ['light', 'dark'])],
  },
  serviceGrid: {
    name: 'Services grid',
    hint: 'Cards for the services from the Services tab.',
    defaults: () => ({ intro: intro(), source: 'all', slugs: [] }),
    fields: (p) => [...introFields([...p, 'intro']), select('Which', [...p, 'source'], ['all', 'featured', 'slugs']), listField('Slugs (for "slugs")', [...p, 'slugs'], 'One per line.')],
  },
  categoryGrid: {
    name: 'Product categories grid',
    hint: 'Photo cards for the categories from the Products tab.',
    defaults: () => ({ intro: intro(), source: 'all', slugs: [], layout: 'grid' }),
    fields: (p) => [...introFields([...p, 'intro']), select('Layout', [...p, 'layout'], ['grid', 'rail']), select('Which', [...p, 'source'], ['all', 'slugs']), listField('Slugs (for "slugs")', [...p, 'slugs'], 'One per line.')],
  },
  brandMarquee: {
    name: 'Brand marquee',
    hint: 'Scrolling rows of brand logos.',
    defaults: () => ({ intro: intro(), rows: 2, source: 'all' }),
    fields: (p) => [...introFields([...p, 'intro'], { cta: false }), numberField('Rows (1 or 2)', [...p, 'rows']), select('Brands', [...p, 'source'], ['core', 'all'])],
  },
  logoWall: {
    name: 'Brand wall',
    hint: 'Every brand, filterable by category, each linking to its page.',
    defaults: () => ({ intro: intro() }),
    fields: (p) => introFields([...p, 'intro']),
  },
  teamGrid: {
    name: 'Team',
    hint: 'Team cards from the Team tab.',
    defaults: () => ({ intro: intro(), source: 'featured' }),
    fields: (p) => [...introFields([...p, 'intro']), select('Who', [...p, 'source'], ['featured', 'all'])],
  },
  testimonialSlider: {
    name: 'Reviews',
    hint: 'Customer reviews; shows a "review us on Google" prompt until there are some.',
    defaults: () => ({ intro: intro() }),
    fields: (p) => introFields([...p, 'intro'], { cta: false }),
  },
  locationGrid: {
    name: 'Emirates grid',
    hint: 'Photo tiles for the seven emirates with delivery times.',
    defaults: () => ({ intro: intro() }),
    fields: (p) => introFields([...p, 'intro']),
  },
  comparisonTable: {
    name: 'Comparison table',
    hint: 'A real table — the shape search engines lift into table snippets.',
    defaults: () => ({ intro: intro(), caption: '', columns: [], rows: [], note: '' }),
    fields: (p) => [
      ...introFields([...p, 'intro'], { cta: false }),
      field('Caption', [...p, 'caption']),
      listField('Column headings', [...p, 'columns'], 'One per line.'),
      repeater({ title: 'Rows (leave empty on the delivery page to build from the emirates)', path: [...p, 'rows'], label: (r, i) => r.cells?.[0] || `Row ${i + 1}`, defaults: { cells: [] }, render: (rp) => grid([listField('Cells', [...rp, 'cells'], 'One per line, in column order.')]) }),
      field('Note under the table', [...p, 'note']),
    ],
  },
  credentialsBand: {
    name: 'Credentials',
    hint: 'Licences and certificates from the Highlights tab.',
    defaults: () => ({ intro: intro() }),
    fields: (p) => introFields([...p, 'intro'], { cta: false }),
  },
  contactPanel: {
    name: 'Contact & addresses',
    hint: 'WhatsApp, phone, email and every location with a map.',
    defaults: () => ({ intro: intro(), showMap: true }),
    fields: (p) => [...introFields([...p, 'intro'], { cta: false }), checkbox('Show the map', [...p, 'showMap'])],
  },
  galleryStrip: {
    name: 'Gallery strip',
    hint: 'The newest photos from the Gallery tab.',
    defaults: () => ({ intro: intro(), tag: '', limit: 8 }),
    fields: (p) => [...introFields([...p, 'intro']), select('Only this tag', [...p, 'tag'], ['', 'operations', 'warehouse', 'delivery', 'installation', 'showroom', 'products', 'events', 'team']), numberField('How many', [...p, 'limit'])],
  },
  reelRail: {
    name: 'Reels rail',
    hint: 'The vertical reels from the Gallery tab, as a swipeable row.',
    defaults: () => ({ intro: intro(), limit: 10 }),
    fields: (p) => [...introFields([...p, 'intro']), numberField('How many', [...p, 'limit'])],
  },
};

export const ICONS = ['check', 'shield', 'truck', 'warehouse', 'tools', 'headset', 'tag', 'globe', 'printer', 'desktop', 'monitor', 'projector', 'server', 'network', 'router', 'bolt', 'battery', 'cable', 'box', 'award', 'users', 'phone', 'mail', 'pin', 'clock'];


/** A short, stable id for a newly added section. */
const newId = (type: string) => `${type}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * The section list for one page.
 *
 * Rendered as its own repeater so adding or moving a section redraws only this
 * list, and only the section being edited is expanded.
 */
export function sectionList(pageKey: string): HTMLElement {
  const path = ['pages', pageKey, 'sections'];

  const card = el('section', 'card');
  const head = el('div', 'card-head');
  head.append(el('h2', '', 'Sections'));

  const picker = document.createElement('select');
  picker.className = 'add-picker';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Add a section…';
  picker.append(placeholder);
  for (const [type, def] of Object.entries(SECTION_TYPES)) {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = def.name;
    option.title = def.hint;
    picker.append(option);
  }

  picker.addEventListener('change', () => {
    const type = picker.value;
    picker.value = '';
    if (!type) return;
    const def = SECTION_TYPES[type];
    const items = [...(get(path, []) as any[])];
    items.push({ id: newId(type), type, anchor: '', hidden: false, ...clone(def.defaults()) });
    set(path, items);
    draw();
  });

  const previewAll = el('button', 'btn btn-sm', 'Preview page');
  previewAll.type = 'button';
  previewAll.title = 'See the whole page as it stands, including unsaved edits';
  previewAll.addEventListener('click', () =>
    showPreview(() => get(path, []) as unknown[], 'Whole page'),
  );

  const headTools = el('div', 'repeat-tools');
  headTools.append(previewAll, picker);
  head.append(headTools);
  card.append(head);

  const list = el('div', 'repeat');
  card.append(list);

  function move(from: number, to: number) {
    const items = [...(get(path, []) as any[])];
    if (to < 0 || to >= items.length) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    set(path, items);
    draw();
  }

  function draw() {
    list.replaceChildren();
    const items = get(path, []) as any[];

    if (!items.length) {
      list.append(el('p', 'empty', 'This page has no sections yet. Add one above.'));
      return;
    }

    items.forEach((item, index) => {
      const def = SECTION_TYPES[item.type];
      const itemPath = [...path, index];

      const row = el('details', 'repeat-item section-item');
      if (item.hidden) row.classList.add('is-hidden');

      const summary = el('summary', 'repeat-head');
      const title = el('span', 'section-title');
      title.append(el('strong', '', def ? def.name : item.type));
      const subtitle = item.intro?.lines?.[0] || item.lines?.[0] || item.question || item.id;
      if (subtitle) title.append(el('span', 'section-sub', subtitle));
      if (item.hidden) title.append(el('span', 'badge', 'hidden'));
      summary.append(title);

      const tools = el('div', 'repeat-tools');

      const up = el('button', 'btn btn-icon', '↑');
      up.type = 'button';
      up.title = 'Move up';
      up.disabled = index === 0;
      up.addEventListener('click', (e) => { e.preventDefault(); move(index, index - 1); });

      const down = el('button', 'btn btn-icon', '↓');
      down.type = 'button';
      down.title = 'Move down';
      down.disabled = index === items.length - 1;
      down.addEventListener('click', (e) => { e.preventDefault(); move(index, index + 1); });

      // Hiding keeps the section and its copy in the document. Deleting a
      // seasonal band every year and rewriting it is how copy gets lost.
      const hide = el('button', 'btn btn-icon', item.hidden ? '👁' : '⦸');
      hide.type = 'button';
      hide.title = item.hidden ? 'Show on the site' : 'Hide from the site';
      hide.addEventListener('click', (e) => {
        e.preventDefault();
        set([...itemPath, 'hidden'], !item.hidden);
        draw();
      });

      const preview = el('button', 'btn btn-icon', '◑');
      preview.type = 'button';
      preview.title = 'Preview this section';
      preview.addEventListener('click', (e) => {
        e.preventDefault();
        // Read by index on every render, so edits and reorders stay reflected.
        showPreview(
          () => {
            const one = (get(path, []) as any[])[index];
            return one ? [{ ...one, hidden: false }] : [];
          },
          def ? def.name : item.type,
        );
      });

      const remove = el('button', 'btn btn-icon btn-danger', '✕');
      remove.type = 'button';
      remove.title = 'Delete';
      remove.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = await confirmAction({
          title: `Delete the ${def ? def.name : item.type} section?`,
          body: 'Its heading, copy and images go with it.',
          warning: 'Hiding it instead keeps the copy and takes it off the site just the same — that is the reversible one.',
          confirmLabel: 'Delete section',
          tone: 'danger',
        });
        if (!ok) return;
        const next = [...(get(path, []) as any[])];
        next.splice(index, 1);
        set(path, next);
        draw();
      });

      tools.append(preview, up, down, hide, remove);
      summary.append(tools);
      row.append(summary);

      const body = el('div', 'section-body');
      if (def) {
        for (const node of def.fields(itemPath, item)) body.append(node);
      } else {
        body.append(el('p', 'f-help', `Unknown section type "${item.type}".`));
      }
      body.append(
        group('Background behind this section (optional)', [
          mediaField('Background photo', [...itemPath, 'backdrop', 'image'], { size: SIZE.bleed }),
          field('Background video', [...itemPath, 'backdrop', 'video', 'src'], { help: 'A /videos/… path or a Cloudinary video id. Overrides the photo.' }),
          numberField('White wash over it (0–100)', [...itemPath, 'backdrop', 'wash'], 'Higher keeps text easy to read. 80–90 is typical.'),
        ]),
        grid([
          field('Anchor', [...itemPath, 'anchor'], {
            help: 'Optional #id, so in-page links keep working if the section moves.',
          }),
        ]),
      );
      row.append(body);
      list.append(row);
    });
  }

  draw();
  return card;
}
