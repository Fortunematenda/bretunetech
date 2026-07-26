/** Remove known SEO filler sentences; keep real product copy. */
export function stripPlaceholderSentences(text?: string | null): string {
  if (!text?.trim()) return '';
  return text
    .replace(/Review the specifications on this page for compatibility before purchase\.?/gi, '')
    .replace(/Available from BretuneTech in South Africa\.?/gi, '')
    .replace(/Buy from BretuneTech in South Africa\.?/gi, '')
    .replace(/listed by BretuneTech with the available supplier technical information[^.]*\.?/gi, '')
    .replace(/available supplier technical information presented for straightforward product selection[^.]*\.?/gi, '')
    .replace(/specification-led buying decision[^.]*\.?/gi, '')
    .replace(/Product details will be updated soon\. Contact BretuneTech for more information\.?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Returns cleaned product copy, or null when nothing useful remains. */
export function displayProductDescription(text?: string | null): string | null {
  const cleaned = stripPlaceholderSentences(text);
  return cleaned || null;
}
