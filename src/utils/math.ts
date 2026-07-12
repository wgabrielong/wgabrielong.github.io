import katex from 'katex';

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Render inline `$...$` math in a plain string to KaTeX HTML, escaping the
 * surrounding text. Intended for short strings (titles, labels) held in
 * frontmatter/data, which the markdown remark-math pipeline never touches.
 * Content is trusted (our own data), so the result is safe for `set:html`.
 */
export function renderInlineMath(input: string): string {
  // Odd-indexed segments are the contents between `$...$` delimiters.
  return input
    .split(/\$([^$]+)\$/g)
    .map((segment, i) =>
      i % 2 === 1
        ? katex.renderToString(segment, { throwOnError: false, displayMode: false })
        : escapeHtml(segment),
    )
    .join('');
}
