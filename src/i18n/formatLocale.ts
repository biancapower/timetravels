/**
 * The locale to format dates and times in: the visitor's first preferred
 * language that the interface's messages are in, so dates don't switch
 * language mid-sentence. A browser's own default follows its interface
 * language, which can differ, such as an en-US browser for someone who
 * prefers en-AU. The default is kept when it agrees on the language and
 * region, so nothing changes for visitors it already suited.
 */
export function formatLocale(
  preferred: readonly string[],
  language: string,
  fallback = new Intl.DateTimeFormat().resolvedOptions().locale,
): string {
  const standing = new Intl.Locale(fallback);
  for (const tag of preferred) {
    let wanted: Intl.Locale;
    try {
      wanted = new Intl.Locale(tag);
    } catch {
      continue; // A malformed tag, such as "en_US", names no language.
    }
    if (wanted.language !== language) continue;
    // A bare language, such as "en", says nothing about the region, so the
    // browser's own region stands.
    const agrees =
      wanted.language === standing.language &&
      (wanted.region ?? standing.region) === standing.region;
    return agrees ? fallback : tag;
  }
  return standing.language === language ? fallback : language;
}
