/**
 * The admin application.
 *
 * A tabbed panel over one JSON document: load it into memory, edit it in place
 * through dot-path-bound fields, PUT it back wholesale. Save writes the draft;
 * Publish purges the edge cache so the draft goes live in seconds.
 *
 * The Gallery tab is built for the daily job — drop a batch of photos and
 * reels from the phone, caption them, "Save & publish" — and only refreshes the
 * pages the gallery appears on.
 */
import { checkbox, el, field, grid, group, listField, numberField, repeater, select, stack } from './fields';
import { configureMedia, deleteAsset, loadAssets, mediaEnabled, mediaField, thumb, uploadFile } from './media';
import { confirmAction } from './dialog';
import { sectionList, ICONS } from './sections';
import { showPagePreview } from './preview';
import { api, get, markClean, markDirty, onDirtyChange, set, state } from './state';
import { verdict, type PageKind } from '../../data/quality';

const panel = document.getElementById('panel')!;
const statusEl = document.getElementById('status')!;
const loginEl = document.getElementById('login')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const workspace = document.getElementById('workspace')!;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const publishButton = document.getElementById('publish') as HTMLButtonElement;
const reloadButton = document.getElementById('reload') as HTMLButtonElement;
const logoutButton = document.getElementById('logout') as HTMLButtonElement;
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];

const PAGES: Record<string, { name: string; url: string }> = {
  home: { name: 'Home', url: '/' },
  about: { name: 'About', url: '/about/' },
  team: { name: 'Team', url: '/team/' },
  services: { name: 'Services index', url: '/services/' },
  products: { name: 'Products index', url: '/products/' },
  brands: { name: 'Brands index', url: '/brands/' },
  locations: { name: 'Delivery areas', url: '/locations/' },
  gallery: { name: 'Gallery', url: '/gallery/' },
  contact: { name: 'Contact', url: '/contact/' },
  faq: { name: 'FAQ page', url: '/faq/' },
  privacy: { name: 'Privacy', url: '/privacy/' },
  terms: { name: 'Terms', url: '/terms/' },
};

const image = () => ({ publicId: '', alt: '', version: null, width: null, height: null });
const video = () => ({ src: '', srcMobile: '', poster: image() });
const slugOptions = (key: string) => ['', ...(get(key, []) as any[]).map((x) => x.slug)];
const faqRepeater = (path: (string | number)[]) =>
  repeater({
    title: 'FAQs (3+ needed for the page to be indexed)',
    path,
    label: (q, i) => q.q || `Question ${i + 1}`,
    defaults: { q: '', a: '', top: false },
    render: (qp) => grid([field('Question', [...qp, 'q'], { multiline: true, rows: 2 }), field('Answer — name Colion and restate the subject', [...qp, 'a'], { multiline: true, rows: 4 })]),
  });
const seoGroup = (p: (string | number)[]) =>
  group('Search overrides (optional)', [
    field('Browser title', [...p, 'seoTitle'], { help: 'Leave blank to use the template. ~60 characters.' }),
    field('Meta description', [...p, 'seoDescription'], { multiline: true, rows: 2, help: 'Leave blank to use the answer. 120–160 characters.' }),
    select('Indexing', [...p, 'indexOverride'], ['auto', 'index', 'noindex']),
  ]);

function setStatus(message: string, kind: 'info' | 'ok' | 'error' = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
}

function toast(message: string, kind: 'ok' | 'error' = 'ok') {
  document.querySelector('.toast')?.remove();
  const node = el('div', `toast toast-${kind}`, message);
  document.body.append(node);
  requestAnimationFrame(() => node.classList.add('is-in'));
  const dismiss = () => {
    node.classList.remove('is-in');
    node.addEventListener('transitionend', () => node.remove(), { once: true });
  };
  node.addEventListener('click', dismiss);
  setTimeout(dismiss, 3600);
}

onDirtyChange(() => {
  saveButton.disabled = !state.dirty;
  saveButton.textContent = state.dirty ? 'Save changes' : 'Saved';
});

function heading(title: string, body: string, previewHref?: string): HTMLElement {
  const head = el('div', 'panel-head');
  const text = el('div', 'panel-head-text');
  text.append(el('h1', '', title), el('p', '', body));
  head.append(text);
  if (previewHref) {
    const view = el('button', 'btn btn-sm panel-head-view', 'Preview page');
    view.type = 'button';
    view.addEventListener('click', () => showPagePreview(previewHref, `${title} — ${previewHref}`));
    head.append(view);
  }
  return head;
}

/** "Indexed" / "Not indexed — why" beside a programmatic page. */
function qualityBadge(kind: PageKind, item: any): HTMLElement {
  const v = verdict(kind, item);
  const node = el('p', v.index ? 'quality quality-ok' : 'quality quality-no', v.index ? '● Indexed by search engines' : `○ Not indexed yet — ${v.reasons.join('; ')}`);
  return node;
}

/* ── tabs ───────────────────────────────────────────────────────────────── */

function renderSite() {
  panel.replaceChildren(
    heading('Site', 'Name, contact details, branches and social profiles. The branches are the single source for every address on the site and in the search data.', '/'),
    group('Identity', [
      field('Name', 'site.name'),
      field('Legal name', 'site.legalName'),
      field('Tagline', 'site.tagline'),
      field('Positioning line', 'site.positioning', { multiline: true, rows: 2 }),
      field('Meta description', 'site.description', { multiline: true, rows: 3, help: 'Default description for every page and the Organization schema. ~155 characters.' }),
      numberField('Year founded', 'site.founded', '0 = not shown.'),
    ]),
    group('Logo', [
      mediaField('Logo (for light backgrounds)', ['site', 'logo', 'onLight'], {
        fallback: { src: '/images/brand/colion-logo.webp', note: 'Not set — using the logo shipped with the site.' },
        preview: { fit: 'contain', background: '#FFFFFF' },
        size: 'PNG or WebP with a transparent background, about 1280 × 320 px.',
      }),
    ]),
    group('Contact', [
      field('Email', 'site.email', { type: 'email' }),
      field('Phone', 'site.phone'),
      field('WhatsApp number', 'site.whatsapp', { help: 'Digits only, with country code: 971507668536.' }),
      field('Opening hours (as shown)', 'site.hours'),
      field('Instagram handle', 'site.instagramHandle', { help: 'Without the @.' }),
    ]),
    repeater({
      title: 'Locations',
      path: 'site.locations',
      label: (l, i) => l.label || `Location ${i + 1}`,
      defaults: { id: '', label: '', kind: 'store', name: '', streetAddress: '', area: '', locality: 'Dubai', region: 'Dubai', postalCode: '', country: 'AE', geo: { lat: 0, lng: 0 }, mapUrl: '', hours: '', phone: '', image: image(), gbp: { cid: '', placeId: '', url: '' } },
      render: (p) =>
        stack([
          grid([
            field('Label', [...p, 'label']),
            field('Id', [...p, 'id'], { help: '"corporate" and "showroom" are used by the schema; others are fine for extra branches.' }),
            select('Type', [...p, 'kind'], ['office', 'store', 'warehouse']),
            field('Full name', [...p, 'name']),
            field('Street address', [...p, 'streetAddress']),
            field('Area', [...p, 'area']),
            field('City', [...p, 'locality']),
            field('Hours', [...p, 'hours']),
            field('Phone', [...p, 'phone']),
            numberField('Latitude', [...p, 'geo', 'lat']),
            numberField('Longitude', [...p, 'geo', 'lng']),
            field('Map link', [...p, 'mapUrl'], { type: 'url' }),
          ]),
          group('Google Business Profile', [field('CID', [...p, 'gbp', 'cid']), field('Place ID', [...p, 'gbp', 'placeId']), field('Profile URL', [...p, 'gbp', 'url'], { type: 'url' })]),
          mediaField('Photo', [...p, 'image'], { size: 'Landscape, 1600 × 1000 px.' }),
        ]),
    }),
    repeater({
      title: 'Social profiles',
      path: 'site.social',
      label: (s, i) => s.label || `Profile ${i + 1}`,
      defaults: { label: '', href: '', icon: 'instagram' },
      render: (p) => grid([field('Label', [...p, 'label']), field('URL', [...p, 'href'], { type: 'url' }), select('Icon', [...p, 'icon'], ['instagram', 'facebook', 'linkedin', 'tiktok', 'whatsapp'])]),
    }),
    repeater({
      title: 'Main navigation',
      path: 'nav',
      label: (n, i) => n.label || `Link ${i + 1}`,
      defaults: { label: '', href: '', mega: 'none' },
      render: (p) => grid([field('Label', [...p, 'label']), field('Path', [...p, 'href']), select('Mega menu', [...p, 'mega'], ['none', 'services', 'products'])]),
    }),
  );
}

function renderSeo() {
  panel.replaceChildren(
    heading('SEO', 'The facts the structured data is built from. The schema shape stays in code; these are the values poured into it.', '/'),
    group('Organization', [
      listField('Alternate names', 'seo.alternateName', 'One per line — names the business is also searched for.'),
      field('Price range', 'seo.priceRange'),
      listField('Languages spoken', 'seo.languages', 'One per line.'),
      mediaField('Default share image', ['seo', 'defaultShare'], { size: '1200 × 630 px.' }),
    ]),
    group('Registration', [
      field('Legal name (Arabic)', 'registration.legalNameArabic', { help: 'Everything here is copied from the commercial licence and the VAT certificate, and shown on About, Contact, the footer and in the search data. Keep it exactly as the documents read; dates as YYYY-MM-DD.' }),
      field('Legal form', 'registration.legalForm'),
      field('Commercial licence number', 'registration.licence.number'),
      field('Licensing authority', 'registration.licence.authority'),
      field('Authority website', 'registration.licence.authorityUrl', { type: 'url' }),
      field('Licence issued', 'registration.licence.issued', { placeholder: '2022-12-06' }),
      field('Licence expires', 'registration.licence.expires', { placeholder: '2026-12-05', help: 'Update after every renewal. A past date is hidden from the site.' }),
      field('Commercial register number', 'registration.commercialRegister'),
      field('Chamber', 'registration.chamber.name'),
      field('Chamber membership number', 'registration.chamber.number'),
      field('Chamber website', 'registration.chamber.url', { type: 'url' }),
      field('VAT TRN', 'registration.vat.trn'),
      field('Tax authority', 'registration.vat.authority'),
      field('Tax authority website', 'registration.vat.authorityUrl', { type: 'url' }),
      field('VAT effective from', 'registration.vat.effective', { placeholder: '2023-06-01' }),
      field('Manager on the licence', 'registration.manager'),
      listField('Licensed activities', 'registration.activities', 'One per line, as worded on the licence.'),
    ]),
    group('Opening hours (schema)', [
      listField('Days', 'seo.openingHours.days', 'One per line, e.g. Monday.'),
      field('Opens', 'seo.openingHours.opens', { placeholder: '10:00' }),
      field('Closes', 'seo.openingHours.closes', { placeholder: '22:00' }),
    ]),
    group('Vocabulary', [listField('Topics (knowsAbout)', 'seo.knowsAbout', 'One per line. The terms an answer engine matches a buyer\'s question against.')]),
    group('Footer', [field('Trademark note', 'seo.trademarkNote', { multiline: true, rows: 3 })]),
  );
}

function renderPages() {
  const current = state.activeTab.startsWith('page:') ? state.activeTab.slice(5) : 'home';
  const chooser = el('div', 'chooser');
  for (const [key, page] of Object.entries(PAGES)) {
    const button = el('button', 'chip', page.name);
    button.type = 'button';
    if (key === current) button.classList.add('is-on');
    button.addEventListener('click', () => {
      state.activeTab = `page:${key}`;
      render();
    });
    chooser.append(button);
  }
  panel.replaceChildren(
    heading('Pages', 'Compose each page from sections. Reorder with the arrows; hide a section to take it off the site without losing the copy.', PAGES[current].url),
    chooser,
    group('Page meta', [
      field('Browser title', ['pages', current, 'title'], { help: '~60 characters. "| Colion International" is added unless the title already names Colion.' }),
      field('Meta description', ['pages', current, 'description'], { multiline: true, rows: 2, help: '120–160 characters.' }),
    ]),
    sectionList(current),
  );
}

/* ── gallery ────────────────────────────────────────────────────────────── */

const TAGS = ['operations', 'warehouse', 'delivery', 'installation', 'showroom', 'products', 'events', 'team'];

function renderGallery() {
  panel.replaceChildren(
    heading('Gallery', 'Photos and reels of real stock, deliveries and the showroom. Drop a batch from your phone, add captions, then Save & publish — the gallery, the home page and any page an item is tagged to update in seconds.', '/gallery/'),
  );

  const drop = el('div', 'dropzone');
  drop.innerHTML = '<strong>Drop photos and videos here</strong><span>or click to choose · JPG, PNG, HEIC, MP4, MOV · as many as you like</span>';
  const queue = el('div', 'upload-queue');
  panel.append(drop, queue);

  if (!mediaEnabled()) {
    drop.classList.add('is-disabled');
    drop.innerHTML = '<strong>Uploads are off</strong><span>Cloudinary is not configured on the server (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).</span>';
  }

  const month = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const cloud = state.config?.cloudinary?.cloudName ?? '';

  async function handle(files: File[]) {
    if (!mediaEnabled() || !files.length) return;
    let added = 0;
    for (const file of files) {
      const row = el('div', 'upload-row');
      const name = el('span', 'upload-name', file.name);
      const bar = el('progress', 'upload-bar') as HTMLProgressElement;
      bar.max = 1;
      bar.value = 0;
      row.append(name, bar);
      queue.append(row);
      try {
        const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(file.name);
        const asset = await uploadFile(file, undefined, {
          folder: `gallery/${month}`,
          resourceType: isVideo ? 'video' : 'image',
          onProgress: (f) => (bar.value = f),
        });
        const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
        const portrait = (asset.height ?? 0) > (asset.width ?? 0);
        const item = {
          id: asset.publicId.split('/').pop(),
          kind: isVideo ? (portrait ? 'reel' : 'video') : 'image',
          // A video's poster is Cloudinary's first-second frame, stored as a
          // full URL so it renders anywhere an image reference does.
          image: isVideo
            ? { publicId: `https://res.cloudinary.com/${cloud}/video/upload/so_1,f_auto,q_auto,w_900,c_limit/${asset.publicId}.jpg`, alt: '', version: null, width: asset.width, height: asset.height }
            : { publicId: asset.publicId, alt: '', version: asset.version, width: asset.width, height: asset.height },
          video: isVideo ? asset.publicId : '',
          duration: Math.round(asset.duration ?? 0),
          title: base.length > 3 && !/^(img|dsc|whatsapp|vid|pxl)\b/i.test(base) ? base : '',
          caption: '',
          tags: [],
          category: '',
          brand: '',
          service: '',
          location: '',
          instagramUrl: '',
          date: today,
          featured: false,
        };
        set('gallery', [item, ...(get('gallery', []) as any[])]);
        row.classList.add('is-done');
        added++;
      } catch (error: any) {
        row.classList.add('is-error');
        name.textContent = `${file.name} — ${error.message}`;
      }
    }
    if (added) {
      toast(`${added} item${added > 1 ? 's' : ''} added — add captions, then Save & publish`);
      drawGrid();
    }
  }

  drop.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = true;
    input.addEventListener('change', () => handle([...(input.files ?? [])]), { once: true });
    input.click();
  });
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-over');
    handle([...(e.dataTransfer?.files ?? [])]);
  });

  const actions = el('div', 'gallery-actions');
  const publishNow = el('button', 'btn btn-primary', 'Save & publish gallery');
  publishNow.type = 'button';
  publishNow.addEventListener('click', async () => {
    if (state.dirty) await save();
    if (state.dirty) return;
    await publish('changed');
  });
  actions.append(publishNow);
  panel.append(actions);

  const gridWrap = el('div', 'gallery-edit');
  panel.append(gridWrap);

  const cats = slugOptions('productCategories');
  const brands = slugOptions('brands');
  const services = slugOptions('services');
  const emirates = slugOptions('locations');

  function drawGrid() {
    gridWrap.replaceChildren();
    const items = get('gallery', []) as any[];
    items.forEach((item, index) => {
      const p = ['gallery', index];
      const card = el('div', 'g-card');
      const media = el('div', 'g-media');
      const img = document.createElement('img');
      img.src = item.image?.publicId ? thumb(item.image.publicId, item.image.version, 320) : '';
      img.alt = '';
      img.loading = 'lazy';
      media.append(img);
      if (item.kind !== 'image') media.append(el('span', 'g-kind', item.kind === 'reel' ? '▶ Reel' : '▶ Video'));
      const body = el('div', 'g-body');
      body.append(
        field('Title', [...p, 'title']),
        field('Caption / alt text', [...p, 'caption'], { multiline: true, rows: 2, help: 'Describe what is in the frame.' }),
      );
      const tagRow = el('div', 'g-tags');
      for (const tag of TAGS) {
        const on = (item.tags ?? []).includes(tag);
        const b = el('button', on ? 'tag is-on' : 'tag', tag);
        b.type = 'button';
        b.addEventListener('click', () => {
          const list = new Set<string>(get([...p, 'tags'], []));
          list.has(tag) ? list.delete(tag) : list.add(tag);
          set([...p, 'tags'], [...list]);
          b.classList.toggle('is-on');
        });
        tagRow.append(b);
      }
      body.append(tagRow);
      const more = el('details', 'g-more');
      more.append(el('summary', '', 'Link to a page · date · Instagram'));
      more.append(
        grid([
          select('Product category', [...p, 'category'], cats),
          select('Brand', [...p, 'brand'], brands),
          select('Service', [...p, 'service'], services),
          select('Emirate', [...p, 'location'], emirates),
          field('Date', [...p, 'date'], { type: 'date' }),
          field('Instagram post URL', [...p, 'instagramUrl'], { type: 'url' }),
          checkbox('Featured (shown first)', [...p, 'featured']),
        ]),
      );
      body.append(more);
      const tools = el('div', 'g-tools');
      const up = el('button', 'btn btn-icon', '↑');
      up.type = 'button';
      up.title = 'Move earlier';
      up.disabled = index === 0;
      up.addEventListener('click', () => {
        const list = [...(get('gallery', []) as any[])];
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
        set('gallery', list);
        drawGrid();
      });
      const remove = el('button', 'btn btn-icon btn-danger', '✕');
      remove.type = 'button';
      remove.title = 'Remove from the gallery';
      remove.addEventListener('click', async () => {
        const ok = await confirmAction({ title: 'Remove this item from the gallery?', body: 'It disappears from the site after you save and publish. The file stays in Cloudinary.', confirmLabel: 'Remove', tone: 'danger' });
        if (!ok) return;
        const list = [...(get('gallery', []) as any[])];
        list.splice(index, 1);
        set('gallery', list);
        drawGrid();
      });
      tools.append(up, remove);
      card.append(media, body, tools);
      gridWrap.append(card);
    });
    if (!items.length) gridWrap.append(el('p', 'empty', 'No gallery items yet. Drop some above.'));
  }
  drawGrid();
}

/* ── collections ────────────────────────────────────────────────────────── */

function renderServices() {
  panel.replaceChildren(
    heading('Services', 'Each service is a page at /services/<slug>/. Write the answer first (40–60 words), then the intro (120+ words), then at least three FAQs — that is what gets the page indexed.', '/services/'),
    repeater({
      title: 'Services',
      path: 'services',
      label: (s, i) => s.name || `Service ${i + 1}`,
      defaults: { slug: '', name: '', shortName: '', icon: 'box', tagline: '', image: image(), video: video(), answer: '', intro: [], includes: [], benefits: [], steps: [], categories: [], brands: [], faqs: [], featured: true, extraSections: [], reviewedBy: '', reviewedAt: '', indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: image() },
      render: (p, item) =>
        stack([
          qualityBadge('service', item),
          grid([field('Name', [...p, 'name']), field('Short name', [...p, 'shortName']), field('URL slug', [...p, 'slug'], { help: 'Changing it changes the URL.' }), select('Icon', [...p, 'icon'], ICONS), field('Tagline', [...p, 'tagline'])]),
          field('Answer (40–60 words)', [...p, 'answer'], { multiline: true, rows: 4 }),
          listField('Intro paragraphs', [...p, 'intro'], 'One paragraph per line. [text](/url) adds a link.'),
          listField("What's included", [...p, 'includes'], 'One per line.'),
          listField('Product categories (slugs)', [...p, 'categories'], 'One per line.'),
          listField('Brands (slugs)', [...p, 'brands'], 'One per line.'),
          mediaField('Photo', [...p, 'image'], { size: 'Landscape, 1600 × 1000 px.' }),
          faqRepeater([...p, 'faqs']),
          select('Reviewed by (team id)', [...p, 'reviewedBy'], ['', ...(get('team', []) as any[]).map((t) => t.id)]),
          seoGroup(p),
        ]),
    }),
  );
}

function renderCategories() {
  panel.replaceChildren(
    heading('Product categories', 'Each category is a page at /products/<slug>/, with a buying guide and comparison table that search engines lift into snippets.', '/products/'),
    repeater({
      title: 'Categories',
      path: 'productCategories',
      label: (c, i) => c.name || `Category ${i + 1}`,
      defaults: { slug: '', name: '', singular: '', icon: 'box', tagline: '', image: image(), gallery: [], answer: '', intro: [], useCases: [], buyingGuide: { title: '', steps: [] }, comparison: { caption: '', columns: [], rows: [] }, specs: [], brands: [], service: '', models: [], faqs: [], extraSections: [], reviewedBy: '', reviewedAt: '', indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: image() },
      render: (p, item) =>
        stack([
          qualityBadge('category', item),
          grid([field('Name', [...p, 'name']), field('Singular', [...p, 'singular']), field('URL slug', [...p, 'slug']), select('Icon', [...p, 'icon'], ICONS), field('Tagline', [...p, 'tagline']), select('Related service', [...p, 'service'], slugOptions('services'))]),
          field('Answer (40–60 words)', [...p, 'answer'], { multiline: true, rows: 4 }),
          listField('Intro paragraphs', [...p, 'intro'], 'One paragraph per line.'),
          listField('Who buys it', [...p, 'useCases'], 'One per line.'),
          group('Buying guide (numbered list)', [field('Title', [...p, 'buyingGuide', 'title'], { placeholder: 'How to choose…' }), listField('Steps', [...p, 'buyingGuide', 'steps'], 'One per line, under 15 words each.')]),
          group('Comparison table', [
            field('Caption', [...p, 'comparison', 'caption']),
            listField('Columns', [...p, 'comparison', 'columns'], 'One per line.'),
            repeater({ title: 'Rows', path: [...p, 'comparison', 'rows'], label: (r, i) => r.cells?.[0] || `Row ${i + 1}`, defaults: { cells: [] }, render: (rp) => grid([listField('Cells', [...rp, 'cells'], 'One per line, in column order.')]) }),
          ]),
          listField('Brands (slugs)', [...p, 'brands'], 'One per line.'),
          repeater({
            title: 'Popular ranges',
            path: [...p, 'models'],
            label: (m, i) => m.name || `Range ${i + 1}`,
            defaults: { name: '', brand: '', image: image(), highlights: [], priceFrom: 0 },
            render: (mp) => grid([field('Name', [...mp, 'name']), select('Brand', [...mp, 'brand'], slugOptions('brands')), numberField('Price from (AED, 0 = ask)', [...mp, 'priceFrom']), listField('Highlights', [...mp, 'highlights'], 'One per line.'), mediaField('Photo', [...mp, 'image'])]),
          }),
          mediaField('Card photo', [...p, 'image'], { size: 'Landscape, 1600 × 1200 px.' }),
          faqRepeater([...p, 'faqs']),
          seoGroup(p),
        ]),
    }),
  );
}

function renderBrands() {
  panel.replaceChildren(
    heading('Brands', 'Each brand has a page at /brands/<slug>/. "Top" brands appear in the menu and marquee. A brand page is indexed once it has its own intro (120+ words), answer, 3+ product lines and 3+ FAQs. Only choose "authorized partner" with proof.', '/brands/'),
    repeater({
      title: 'Brands',
      path: 'brands',
      label: (b, i) => `${b.name || `Brand ${i + 1}`}${b.tier === 'core' ? ' ★' : ''}`,
      defaults: { slug: '', name: '', logo: image(), website: '', tier: 'standard', relationship: 'stockist', proof: '', categories: [], productLines: [], answer: '', intro: [], whyGenuine: [], warrantyNote: '', faqs: [], indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: image() },
      render: (p, item) =>
        stack([
          qualityBadge('brand', item),
          grid([field('Name', [...p, 'name']), field('URL slug', [...p, 'slug']), field('Official website', [...p, 'website'], { type: 'url' }), select('Tier', [...p, 'tier'], ['core', 'standard']), select('Relationship', [...p, 'relationship'], ['stockist', 'supplier', 'authorized-partner']), field('Proof (certificate / partner id)', [...p, 'proof'])]),
          mediaField('Logo', [...p, 'logo'], { preview: { fit: 'contain', background: '#FFFFFF' }, size: 'PNG/SVG with transparent background.' }),
          field('Answer (40–60 words)', [...p, 'answer'], { multiline: true, rows: 4 }),
          listField('Intro paragraphs', [...p, 'intro'], 'One paragraph per line.'),
          listField('Product categories (slugs)', [...p, 'categories'], 'One per line.'),
          listField('Product lines', [...p, 'productLines'], 'One per line.'),
          listField('Why buy genuine', [...p, 'whyGenuine'], 'One per line.'),
          field('Warranty note', [...p, 'warrantyNote']),
          faqRepeater([...p, 'faqs']),
          seoGroup(p),
        ]),
    }),
  );
}

function renderLocations() {
  panel.replaceChildren(
    heading('Emirates', 'One page per emirate at /locations/<slug>/. Say plainly that orders are supplied from Dubai — never imply a branch that does not exist.', '/locations/'),
    repeater({
      title: 'Emirates',
      path: 'locations',
      label: (e, i) => e.name || `Emirate ${i + 1}`,
      defaults: { slug: '', name: '', isoCode: '', wikipedia: '', deliveryTime: '', installation: '', answer: '', intro: [], districts: [], freeZones: [], sectors: [], popularCategories: [], image: image(), faqs: [], indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: image() },
      render: (p, item) =>
        stack([
          qualityBadge('location', item),
          grid([field('Name', [...p, 'name']), field('URL slug', [...p, 'slug']), field('ISO code', [...p, 'isoCode']), field('Delivery time', [...p, 'deliveryTime']), field('Installation', [...p, 'installation']), field('Wikipedia URL', [...p, 'wikipedia'], { type: 'url' })]),
          field('Answer (40–60 words)', [...p, 'answer'], { multiline: true, rows: 4 }),
          listField('Intro paragraphs', [...p, 'intro'], 'One paragraph per line.'),
          listField('Districts', [...p, 'districts'], 'One per line.'),
          listField('Free zones', [...p, 'freeZones'], 'One per line.'),
          listField('Sectors', [...p, 'sectors'], 'One per line.'),
          listField('Popular categories (slugs)', [...p, 'popularCategories'], 'One per line.'),
          mediaField('Photo', [...p, 'image'], { size: 'Landscape, 1600 × 1000 px.' }),
          faqRepeater([...p, 'faqs']),
          seoGroup(p),
        ]),
    }),
  );
}

function renderTeam() {
  panel.replaceChildren(
    heading('Team & reviews', 'Real people with real photos build trust. Untick "placeholder" only for a real person — placeholders stay out of the search data, and /team/ is not indexed until at least one real profile exists.', '/team/'),
    repeater({
      title: 'Team',
      path: 'team',
      label: (m, i) => `${m.name || `Member ${i + 1}`}${m.placeholder ? ' (placeholder)' : ''}`,
      defaults: { id: '', name: '', role: '', bio: '', photo: image(), expertise: [], yearsExperience: 0, languages: [], linkedin: '', email: '', social: [], featured: true, placeholder: false },
      render: (p) =>
        stack([
          grid([field('Name', [...p, 'name']), field('Role', [...p, 'role']), field('Id', [...p, 'id'], { help: 'Short, lowercase: mohamed-anas.' }), field('LinkedIn', [...p, 'linkedin'], { type: 'url' }), numberField('Years of experience', [...p, 'yearsExperience']), checkbox('Featured', [...p, 'featured']), checkbox('Placeholder (not a real person)', [...p, 'placeholder'])]),
          field('Bio', [...p, 'bio'], { multiline: true, rows: 3 }),
          listField('Expertise', [...p, 'expertise'], 'One per line.'),
          listField('Languages', [...p, 'languages'], 'One per line.'),
          mediaField('Photo', [...p, 'photo'], { size: 'Portrait 4:5, 1200 × 1500 px — head and shoulders, face in the top third.' }),
          repeater({
            title: 'Social links',
            path: [...p, 'social'],
            label: (x, i) => (x.href ? `${x.network}: ${x.href}` : `Link ${i + 1}`),
            defaults: { network: 'linkedin', href: '' },
            addLabel: 'Add a profile',
            emptyText: 'No profiles yet — add LinkedIn, Instagram, X, WhatsApp…',
            render: (sp) => grid([select('Network', [...sp, 'network'], ['linkedin', 'instagram', 'facebook', 'x', 'tiktok', 'youtube', 'whatsapp', 'website']), field('Profile URL (or WhatsApp number)', [...sp, 'href'])]),
          }),
        ]),
    }),
    repeater({
      title: 'Customer reviews',
      path: 'testimonials',
      label: (t, i) => t.author || `Review ${i + 1}`,
      defaults: { id: '', quote: '', author: '', role: '', company: '', emirate: '', rating: 5, date: '', source: 'google', sourceUrl: '', placeholder: false },
      emptyText: 'No reviews yet. Copy real Google reviews here (with permission) and link to them.',
      render: (p) =>
        grid([
          field('Quote', [...p, 'quote'], { multiline: true, rows: 3 }),
          field('Name', [...p, 'author']),
          field('Role', [...p, 'role']),
          field('Company', [...p, 'company']),
          field('Emirate', [...p, 'emirate']),
          numberField('Stars (1–5)', [...p, 'rating']),
          select('Source', [...p, 'source'], ['google', 'direct']),
          field('Link to the review', [...p, 'sourceUrl'], { type: 'url' }),
        ]),
    }),
  );
}

function renderFaqs() {
  panel.replaceChildren(
    heading('FAQ', 'Answers are quoted whole by Google and AI assistants. Name Colion International and restate the subject in every answer, and lead with the fact.', '/faq/'),
    repeater({
      title: 'Groups',
      path: 'faqGroups',
      label: (g, i) => g.title || `Group ${i + 1}`,
      defaults: { id: '', title: '', blurb: '', items: [] },
      render: (p) =>
        stack([
          grid([field('Title', [...p, 'title']), field('Id', [...p, 'id']), field('Blurb', [...p, 'blurb'])]),
          repeater({
            title: 'Questions',
            path: [...p, 'items'],
            label: (q, i) => q.q || `Question ${i + 1}`,
            defaults: { q: '', a: '', top: false },
            render: (qp) => grid([field('Question', [...qp, 'q'], { multiline: true, rows: 2 }), field('Answer', [...qp, 'a'], { multiline: true, rows: 5 }), checkbox('Show on the home page', [...qp, 'top'])]),
          }),
        ]),
    }),
  );
}

function renderHighlights() {
  panel.replaceChildren(
    heading('Highlights', 'The promises, the headline figures and any licences or certificates — used across the site.', '/'),
    repeater({
      title: 'Promises (feature strip)',
      path: 'features',
      label: (f, i) => f.title || `Promise ${i + 1}`,
      defaults: { icon: 'check', title: '', body: '' },
      render: (p) => grid([select('Icon', [...p, 'icon'], ICONS), field('Title', [...p, 'title']), field('Text', [...p, 'body'], { multiline: true, rows: 2 })]),
    }),
    repeater({
      title: 'Figures',
      path: 'stats',
      label: (s, i) => (s.value ? `${s.value}${s.unit} ${s.label}` : `Figure ${i + 1}`),
      defaults: { value: '', unit: '', label: '' },
      render: (p) => grid([field('Value', [...p, 'value']), field('Unit', [...p, 'unit']), field('Caption', [...p, 'label'])]),
    }),
    repeater({
      title: 'Licences & certificates',
      path: 'credentials',
      label: (c, i) => c.title || `Credential ${i + 1}`,
      defaults: { title: '', issuer: '', year: '', kind: 'partner', image: image(), url: '' },
      emptyText: 'Add the trade licence, brand partner certificates or memberships — they are shown on the About page and in the search data.',
      render: (p) => grid([field('Title', [...p, 'title']), field('Issued by', [...p, 'issuer']), field('Year', [...p, 'year']), select('Kind', [...p, 'kind'], ['license', 'partner', 'membership', 'certification']), field('Link', [...p, 'url'], { type: 'url' }), mediaField('Certificate image', [...p, 'image'])]),
    }),
  );
}

async function renderMedia() {
  panel.replaceChildren(heading('Media', 'Every image in the Cloudinary library. Replacing a file updates it everywhere it is used.', '/'));
  if (!mediaEnabled()) {
    panel.append(el('p', 'empty', 'Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable uploads.'));
    return;
  }
  const wrap = el('div', 'card');
  wrap.append(el('p', 'f-help', 'Loading…'));
  panel.append(wrap);
  try {
    const assets = await loadAssets(true);
    wrap.replaceChildren();
    if (!assets.length) return void wrap.append(el('p', 'empty', 'No images yet.'));
    const gallery = el('div', 'gallery');
    for (const asset of assets) {
      const tile = el('div', 'tile');
      const img = document.createElement('img');
      img.src = thumb(asset.publicId, asset.version);
      img.alt = '';
      img.loading = 'lazy';
      const remove = el('button', 'btn btn-icon btn-danger tile-del', '✕');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        const ok = await confirmAction({ title: 'Delete this image permanently?', body: `"${asset.publicId}" is removed from Cloudinary.`, warning: 'Any page still using it will show a broken image.', confirmLabel: 'Delete permanently', tone: 'danger' });
        if (!ok) return;
        await deleteAsset(asset.publicId).catch((e) => toast(e.message, 'error'));
        void renderMedia();
      });
      tile.append(img, el('span', 'tile-cap', asset.publicId.split('/').pop() ?? ''), remove);
      gallery.append(tile);
    }
    wrap.append(gallery);
  } catch (error: any) {
    wrap.replaceChildren(el('p', 'f-help', error.message));
  }
}

/* ── plumbing ───────────────────────────────────────────────────────────── */

function render() {
  if (!state.content) return;
  for (const tab of tabs) {
    tab.classList.toggle('is-on', tab.dataset.tab === state.activeTab || (state.activeTab.startsWith('page:') && tab.dataset.tab === 'pages'));
  }
  const key = state.activeTab.startsWith('page:') ? 'pages' : state.activeTab;
  const renderers: Record<string, () => void | Promise<void>> = {
    site: renderSite,
    seo: renderSeo,
    pages: renderPages,
    gallery: renderGallery,
    services: renderServices,
    categories: renderCategories,
    brands: renderBrands,
    locations: renderLocations,
    team: renderTeam,
    faqs: renderFaqs,
    highlights: renderHighlights,
    media: renderMedia,
  };
  void renderers[key]?.();
  panel.scrollTo({ top: 0 });
}

function showWorkspace(signedIn: boolean) {
  loginEl.hidden = signedIn;
  workspace.hidden = !signedIn;
  logoutButton.hidden = !signedIn;
  for (const tab of tabs) tab.disabled = !signedIn;
  saveButton.disabled = true;
  publishButton.disabled = !signedIn;
  if (!signedIn) requestAnimationFrame(() => passwordInput.focus());
}

async function loadAll() {
  setStatus('Loading…');
  state.config = await api('/api/config');
  configureMedia(state.config);
  if (!state.config.authenticated) {
    state.authenticated = false;
    showWorkspace(false);
    setStatus('Sign in to continue');
    return;
  }
  const payload = await api('/api/content');
  state.content = payload.content;
  state.authenticated = true;
  markClean();
  showWorkspace(true);
  render();
  setStatus(state.config.storage === 'cloudinary' ? 'Ready · saves go to Cloudinary' : 'Saves are NOT possible — Cloudinary is not configured', state.config.storage === 'cloudinary' ? 'info' : 'error');
}

async function save() {
  saveButton.disabled = true;
  saveButton.textContent = 'Saving…';
  try {
    const payload = await api('/api/content', { method: 'PUT', body: JSON.stringify({ content: state.content }) });
    state.content = payload.content;
    markClean();
    render();
    toast(payload.warning ?? 'Saved', payload.warning ? 'error' : 'ok');
    setStatus(payload.warning ?? 'All changes saved');
  } catch (error: any) {
    if (error.status === 401) return void signOut('Session expired — sign in again', true);
    toast(error.message, 'error');
    setStatus(error.message, 'error');
    saveButton.disabled = false;
    markDirty();
  } finally {
    saveButton.textContent = state.dirty ? 'Save changes' : 'Saved';
  }
}

async function publish(scope?: 'changed') {
  if (!scope) {
    const ok = await confirmAction({
      title: 'Publish to the live site?',
      body: state.dirty ? 'This publishes the last saved version. Unsaved changes are not included.' : 'The saved content goes live on colioninternational.com within seconds.',
      warning: state.dirty ? 'You have unsaved changes. Save first if you want them included.' : undefined,
      confirmLabel: state.dirty ? 'Publish last saved' : 'Publish',
    });
    if (!ok) return;
  }
  publishButton.disabled = true;
  publishButton.textContent = 'Publishing…';
  try {
    const done = await api(`/api/publish${scope ? `?scope=${scope}` : ''}`, { method: 'POST' });
    toast(done.failed?.length ? `Published ${done.revalidated}/${done.total} pages — ${done.failed.length} need retrying` : `Published — ${done.revalidated} pages are live`, done.failed?.length ? 'error' : 'ok');
  } catch (error: any) {
    toast(error.message, 'error');
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = 'Publish';
  }
}

async function signOut(message = 'Signed out', force = false) {
  if (!force) {
    const ok = await confirmAction({
      title: 'Sign out?',
      body: 'You will need the CMS password to get back in.',
      warning: state.dirty ? 'You have unsaved changes. Signing out discards them.' : undefined,
      confirmLabel: 'Sign out',
      tone: state.dirty ? 'danger' : 'primary',
    });
    if (!ok) return;
  }
  await api('/api/session', { method: 'DELETE' }).catch(() => {});
  state.authenticated = false;
  state.content = null;
  markClean();
  passwordInput.value = '';
  showWorkspace(false);
  setStatus(message);
}

export function start() {
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      state.activeTab = tab.dataset.tab!;
      render();
    });
  }
  saveButton.addEventListener('click', save);
  publishButton.addEventListener('click', () => publish());
  reloadButton.addEventListener('click', () => void loadAll());
  logoutButton.addEventListener('click', () => void signOut());
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('Checking…');
    try {
      await api('/api/session', { method: 'POST', body: JSON.stringify({ password: passwordInput.value }) });
      await loadAll();
    } catch (error: any) {
      setStatus(error.message, 'error');
      passwordInput.select();
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
  void loadAll().catch((error) => setStatus(error.message, 'error'));
}

