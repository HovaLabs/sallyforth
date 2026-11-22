/** Rich-text editors can leave an otherwise blank page full of empty paragraphs. */
export function hasPageContent(body: string | null | undefined): boolean {
  if (!body) return false;
  const html = body.replace(/<!--[\s\S]*?-->/g, '');
  // A script-backed embed, map, photo, or form may have no text at all.
  if (/<script\b[^>]*\ssrc\s*=/i.test(html)) return true;
  const visible = html.replace(/<(style|script|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  if (/<(?:img|picture|svg|video|audio|canvas|iframe|embed|object|form|input|button|select|textarea|[a-z][\w]*-[\w-]+)\b/i.test(visible)) {
    return true;
  }
  const text = visible
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace|#0*(?:160|8203)|#x0*(?:a0|200b));/gi, '')
    .replace(/[\u200b\ufeff]/g, '');
  return text.trim().length > 0;
}
