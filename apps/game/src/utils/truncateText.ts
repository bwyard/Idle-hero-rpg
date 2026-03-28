/**
 * truncateText — Sanitizes and truncates display text.
 *
 * Strips control characters (0x00–0x1F except newline and tab),
 * then truncates to maxLength and appends '…' if the text was longer.
 */
export function truncateText(text: string, maxLength = 100): string {
  // Strip control characters except \t (0x09) and \n (0x0A)
  const sanitized = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return sanitized.slice(0, maxLength) + '\u2026';
}
