/**
 * A confirmation dialog for actions that are hard to take back.
 *
 * The browser's own `confirm()` would do the job, but it is dismissed by reflex
 * — it looks identical on every site, so people click through it without
 * reading. This states what will happen in the panel's own voice, and puts the
 * consequence in the body rather than the title, where it might be read.
 *
 * Cancel is focused on open, not the confirm button. Someone who hits Enter out
 * of habit should get the safe outcome.
 */
import { el } from './fields';

export interface ConfirmOptions {
  title: string;
  body: string;
  /** Extra line, used for the "unsaved changes" warning. */
  warning?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` colours the confirm button for destructive actions. */
  tone?: 'primary' | 'danger';
}

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const { title, body, warning, confirmLabel, cancelLabel = 'Cancel', tone = 'primary' } = options;

  return new Promise((resolve) => {
    const overlay = el('div', 'modal confirm-overlay');
    const panel = el('div', 'confirm-panel');
    panel.setAttribute('role', 'alertdialog');
    panel.setAttribute('aria-modal', 'true');

    const heading = el('h2', 'confirm-title', title);
    const id = `confirm-${Math.random().toString(36).slice(2, 7)}`;
    heading.id = id;
    panel.setAttribute('aria-labelledby', id);

    panel.append(heading, el('p', 'confirm-body', body));
    if (warning) panel.append(el('p', 'confirm-warning', warning));

    const actions = el('div', 'confirm-actions');
    const cancel = el('button', 'btn', cancelLabel);
    cancel.type = 'button';
    const go = el('button', `btn ${tone === 'danger' ? 'btn-confirm-danger' : 'btn-primary'}`, confirmLabel);
    go.type = 'button';
    actions.append(cancel, go);
    panel.append(actions);

    overlay.append(panel);
    document.body.append(overlay);

    // Restore focus to whatever opened this, so keyboard users are not dumped
    // at the top of the document.
    const opener = document.activeElement as HTMLElement | null;

    const close = (result: boolean) => {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      opener?.focus?.();
      resolve(result);
    };

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(false);
        return;
      }
      // Keep tabbing inside the dialog while it is open.
      if (event.key === 'Tab') {
        const focusable = [cancel, go];
        const i = focusable.indexOf(document.activeElement as HTMLButtonElement);
        if (i === -1) return;
        event.preventDefault();
        const next = event.shiftKey ? (i + focusable.length - 1) % focusable.length : (i + 1) % focusable.length;
        focusable[next].focus();
      }
    }

    cancel.addEventListener('click', () => close(false));
    go.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKey, true);

    // Cancel, deliberately — Enter should not confirm a destructive action.
    requestAnimationFrame(() => cancel.focus());
  });
}
