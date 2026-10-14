/**
 * The one piece of formatting editors get inside a paragraph.
 *
 *   [text](/products/printers/)   an internal (or external) link
 *   **text**                      bold
 *
 * Contextual links inside body copy are the strongest internal-linking signal
 * there is, and the programmatic pages need them to stop reading as islands.
 * Anything beyond these two is deliberately not supported: the input is
 * escaped first, so an editor cannot inject markup, and the output is the only
 * HTML a paragraph can carry.
 */

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeHref = (href: string) => /^(\/|#|https?:\/\/|mailto:|tel:)/.test(href);

export function inline(text: string): string {
  return escape(text ?? '')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
      const raw = href.replace(/&amp;/g, '&');
      if (!safeHref(raw)) return label;
      const external = /^https?:\/\//.test(raw);
      return `<a href="${href}" class="inline-link"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** The same text with the markup removed — for meta descriptions and JSON-LD. */
export function plain(text: string): string {
  return (text ?? '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
}
