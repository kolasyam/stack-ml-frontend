/** Return only absolute HTTP(S) URLs suitable for navigation. */
export function safeExternalUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Mammoth intentionally returns HTML. Uploaded documents are untrusted, so
 * keep a small presentational allow-list and strip scripts, event handlers,
 * styles, and non-HTTP URLs before using dangerouslySetInnerHTML.
 */
export function sanitizeDocumentHtml(raw: string): string {
  if (typeof document === 'undefined') return '';
  const template = document.createElement('template');
  template.innerHTML = raw;

  const allowedTags = new Set([
    'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'EM', 'H1', 'H2', 'H3', 'H4',
    'IMG', 'I', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'TABLE', 'TBODY', 'TD',
    'TH', 'THEAD', 'TR', 'U', 'UL',
  ]);
  const blockedTags = new Set(['IFRAME', 'OBJECT', 'EMBED', 'SCRIPT', 'STYLE', 'SVG', 'MATH']);
  const allowedAttributes: Record<string, Set<string>> = {
    A: new Set(['href', 'title']),
    IMG: new Set(['src', 'alt', 'width', 'height']),
  };

  for (const element of Array.from(template.content.querySelectorAll('*')).reverse()) {
    if (!allowedTags.has(element.tagName)) {
      if (blockedTags.has(element.tagName)) {
        element.remove();
      } else {
        // Preserve readable text from harmless formatting wrappers (for
        // example Mammoth's spans) without preserving their attributes.
        element.replaceWith(...Array.from(element.childNodes));
      }
      continue;
    }
    const allowed = allowedAttributes[element.tagName] ?? new Set<string>();
    for (const attr of Array.from(element.attributes)) {
      if (!allowed.has(attr.name.toLowerCase())) element.removeAttribute(attr.name);
    }
    if (element.tagName === 'A') {
      const href = safeExternalUrl(element.getAttribute('href'));
      if (href) {
        element.setAttribute('href', href);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else {
        element.removeAttribute('href');
      }
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') ?? '';
      if (!/^https?:\/\//i.test(src) && !/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(src)) {
        element.remove();
      }
    }
  }
  return template.innerHTML;
}
