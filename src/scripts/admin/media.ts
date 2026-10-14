/**
 * The media picker and the Cloudinary library behind it.
 *
 * Uploads go straight from the browser to Cloudinary using a signature this
 * site's API issues, so image bytes never pass through a serverless function
 * and the API secret never reaches the client.
 */
import { api, get, set, type Path } from './state';
import { el } from './fields';
import { confirmAction } from './dialog';

export interface Asset {
  publicId: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  version: number | null;
  createdAt: string;
  duration?: number;
  resourceType?: string;
}

let cache: Asset[] | null = null;
let cloudName = '';
let enabled = false;

/** A poster frame for an uploaded Cloudinary video. */
export function videoThumb(publicId: string, size = 240): string {
  if (!publicId || !cloudName) return '';
  if (publicId.startsWith('/')) return '';
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_1,c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/${publicId}.jpg`;
}

export function configureMedia(config: any) {
  cloudName = config?.cloudinary?.cloudName ?? '';
  enabled = Boolean(config?.cloudinary?.enabled);
}

export const mediaEnabled = () => enabled;

export async function loadAssets(force = false): Promise<Asset[]> {
  if (cache && !force) return cache;
  const payload = await api('/api/media');
  cache = payload.assets ?? [];
  return cache!;
}

/**
 * A thumbnail URL.
 *
 * Local `public/` paths are passed through untouched so images that have not
 * been migrated to Cloudinary yet still preview correctly.
 */
export function thumb(publicId: string, version?: number | null, size = 240): string {
  if (!publicId) return '';
  if (publicId.startsWith('/') || /^https?:\/\//.test(publicId)) return publicId;
  if (!cloudName) return '';
  const v = version ? `v${version}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,g_auto,w_${size},h_${size},f_auto,q_auto/${v}${publicId}`;
}

/** Pick a file from disk. Resolves null if the dialog is dismissed. */
function chooseFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
    input.click();
  });
}

/**
 * Upload to Cloudinary.
 *
 * Passing `publicId` overwrites that exact asset, which is what makes replacing
 * a photograph a single action: every page referencing it picks up the new file
 * with no content edit. The returned version is stored alongside the id so the
 * delivery URL changes immediately rather than waiting for the CDN to expire.
 */
export async function uploadFile(
  file: File,
  publicId?: string,
  options: { folder?: string; resourceType?: 'image' | 'video'; onProgress?: (fraction: number) => void } = {},
): Promise<Asset> {
  const resourceType = options.resourceType ?? (file.type.startsWith('video/') ? 'video' : 'image');
  const signature = await api('/api/cloudinary', {
    method: 'POST',
    body: JSON.stringify({ ...(publicId ? { publicId } : {}), folder: options.folder, resourceType }),
  });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  if (signature.folder) form.append('folder', signature.folder);
  if (signature.public_id) {
    form.append('public_id', signature.public_id);
    form.append('overwrite', 'true');
    form.append('invalidate', 'true');
  }

  // XHR rather than fetch, for upload progress: a phone-shot reel can be
  // 80 MB, and a bar that does not move reads as a hang.
  const payload: any = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', signature.uploadUrl);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) options.onProgress?.(e.loaded / e.total);
    });
    xhr.addEventListener('load', () => {
      let body: any = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.error?.message ?? `Cloudinary upload failed (${xhr.status})`));
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.send(form);
  });

  cache = null;
  return {
    publicId: payload.public_id,
    format: payload.format ?? '',
    width: payload.width ?? null,
    height: payload.height ?? null,
    bytes: payload.bytes ?? 0,
    version: payload.version ?? null,
    createdAt: payload.created_at ?? '',
    duration: payload.duration ?? 0,
    resourceType: payload.resource_type ?? resourceType,
  };
}

export async function deleteAsset(publicId: string): Promise<void> {
  await api(`/api/media?publicId=${encodeURIComponent(publicId)}`, { method: 'DELETE' });
  cache = null;
}

/* ── the picker dialog ──────────────────────────────────────────────────── */

/** Opens the library and resolves the chosen asset, or null if cancelled. */
export function openPicker(): Promise<Asset | null> {
  return new Promise((resolve) => {
    const overlay = el('div', 'modal');
    const panel = el('div', 'modal-panel');

    const head = el('div', 'modal-head');
    head.append(el('h2', '', 'Media library'));

    const upload = el('button', 'btn btn-sm', 'Upload new');
    upload.type = 'button';

    const close = el('button', 'btn btn-icon', '✕');
    close.type = 'button';

    const tools = el('div', 'repeat-tools');
    tools.append(upload, close);
    head.append(tools);

    const body = el('div', 'modal-body');
    const status = el('p', 'f-help', 'Loading…');
    body.append(status);

    panel.append(head, body);
    overlay.append(panel);
    document.body.append(overlay);

    const done = (asset: Asset | null) => {
      overlay.remove();
      resolve(asset);
    };

    close.addEventListener('click', () => done(null));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) done(null);
    });

    upload.addEventListener('click', async () => {
      const file = await chooseFile();
      if (!file) return;
      status.textContent = `Uploading ${file.name}…`;
      try {
        const asset = await uploadFile(file);
        done(asset);
      } catch (error: any) {
        status.textContent = error.message;
      }
    });

    const draw = async () => {
      try {
        const assets = await loadAssets(true);
        body.replaceChildren();

        if (!assets.length) {
          body.append(el('p', 'empty', 'No images yet. Upload one to get started.'));
          return;
        }

        const gallery = el('div', 'gallery');
        for (const asset of assets) {
          const tile = el('button', 'tile');
          (tile as HTMLButtonElement).type = 'button';

          const img = document.createElement('img');
          img.src = thumb(asset.publicId, asset.version);
          img.alt = '';
          img.loading = 'lazy';

          const caption = el('span', 'tile-cap', asset.publicId.split('/').pop() ?? asset.publicId);
          tile.append(img, caption);
          tile.addEventListener('click', () => done(asset));
          gallery.append(tile);
        }
        body.append(gallery);
      } catch (error: any) {
        body.replaceChildren(el('p', 'f-help', error.message));
      }
    };

    void draw();
  });
}

/**
 * An image field: preview, pick from the library, replace in place, or clear.
 *
 * "Replace" overwrites the Cloudinary asset rather than pointing this one field
 * at a new id — so swapping a product shot updates it everywhere at once.
 */
export interface MediaFieldOptions {
  /**
   * What the site falls back to when this field is empty.
   *
   * Without it an unset field reads "No image selected", which is true of the
   * record and misleading about the site — the logo fields have a file behind
   * them either way, and an editor cannot tell whether the panel is broken or
   * the default is doing its job.
   */
  fallback?: { src: string; note: string };
  /**
   * How to draw the thumbnail. A wordmark is transparent and wider than it is
   * tall, so the default cover-crop on the panel's dark ground shows either a
   * sliver of letterform or, for the black mark, nothing at all.
   */
  preview?: { fit?: 'cover' | 'contain'; background?: string };
  /**
   * What to upload: the shape this slot crops to, and a size that survives a
   * retina screen.
   *
   * Every slot has a fixed aspect ratio in the layout and object-fits to it, so
   * a picture at the wrong shape is not rejected — it is silently cropped, and
   * the editor finds out by looking at the page. Cloudinary serves a scaled
   * derivative of whatever arrives, so oversize costs a slow upload rather than
   * a slow page; undersize is the one that cannot be fixed later.
   */
  size?: string;
}

export function mediaField(
  label: string,
  path: (string | number)[],
  options: MediaFieldOptions = {},
): HTMLElement {
  const wrap = el('div', 'f f-media');
  wrap.append(el('label', '', label));

  const row = el('div', 'media-row');
  const preview = document.createElement('img');
  preview.className = 'media-preview';
  preview.alt = '';
  preview.loading = 'lazy';

  const controls = el('div', 'media-controls');
  const idText = el('p', 'f-help', '');

  if (options.preview?.fit) preview.style.objectFit = options.preview.fit;
  if (options.preview?.background) preview.style.background = options.preview.background;

  const refresh = () => {
    const publicId = String(get([...path, 'publicId'], ''));
    const version = get([...path, 'version'], null) as number | null;

    if (publicId) {
      preview.src = thumb(publicId, version);
      preview.style.display = '';
      idText.textContent = publicId;
      return;
    }

    if (options.fallback) {
      preview.src = options.fallback.src;
      preview.style.display = '';
      idText.textContent = options.fallback.note;
      return;
    }

    preview.style.display = 'none';
    idText.textContent = 'No image selected';
  };

  const choose = el('button', 'btn btn-sm', 'Choose');
  choose.type = 'button';
  choose.addEventListener('click', async () => {
    const asset = await openPicker();
    if (!asset) return;
    set([...path, 'publicId'], asset.publicId);
    set([...path, 'version'], asset.version);
    set([...path, 'width'], asset.width);
    set([...path, 'height'], asset.height);
    refresh();
  });

  const replace = el('button', 'btn btn-sm', 'Replace file');
  replace.type = 'button';
  replace.title = 'Upload a new file over this same image, everywhere it is used';
  replace.addEventListener('click', async () => {
    const publicId = String(get([...path, 'publicId'], ''));
    if (!publicId || publicId.startsWith('/')) {
      alert('Choose a library image first — local files cannot be replaced in place.');
      return;
    }
    const file = await chooseFile();
    if (!file) return;
    const ok = await confirmAction({
      title: 'Replace this image everywhere?',
      body: `The new file is written over “${publicId}”, so every page using that image changes at once — not only this field.`,
      warning: 'The old file is overwritten on Cloudinary and cannot be brought back from the panel.',
      confirmLabel: 'Replace file',
      tone: 'danger',
    });
    if (!ok) return;

    replace.textContent = 'Uploading…';
    try {
      const asset = await uploadFile(file, publicId);
      set([...path, 'version'], asset.version);
      set([...path, 'width'], asset.width);
      set([...path, 'height'], asset.height);
      refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      replace.textContent = 'Replace file';
    }
  });

  const clear = el('button', 'btn btn-icon btn-danger', '✕');
  clear.type = 'button';
  clear.title = 'Clear';
  clear.addEventListener('click', async () => {
    // This asked nothing at all until now, and it sits one button away from
    // "Choose" — a slip took the bottle render off a product with no prompt and
    // nothing on screen to say what had just gone.
    const publicId = String(get([...path, 'publicId'], ''));
    if (!publicId) return;

    const ok = await confirmAction({
      title: `Clear ${label.toLowerCase()}?`,
      body: `This field stops pointing at “${publicId}”. Wherever the site expects a picture here, it renders without one.`,
      warning: 'The file itself stays in the media library, so you can pick it again with Choose.',
      confirmLabel: 'Clear',
      tone: 'danger',
    });
    if (!ok) return;

    set([...path, 'publicId'], '');
    set([...path, 'version'], null);
    refresh();
  });

  controls.append(choose, replace, clear);
  if (options.size) controls.append(el('p', 'f-help media-size', options.size));
  row.append(preview, controls);
  wrap.append(row, idText);

  // Alt text sits with the image because it describes that image, not the field
  // it happens to be used in — and an empty one is an accessibility defect the
  // editor is the only person able to fix.
  const alt = document.createElement('input');
  alt.type = 'text';
  alt.placeholder = 'Alt text — describe what is in the picture';
  alt.value = String(get([...path, 'alt'], ''));
  alt.addEventListener('input', () => set([...path, 'alt'], alt.value));
  wrap.append(alt);

  refresh();
  return wrap;
}
