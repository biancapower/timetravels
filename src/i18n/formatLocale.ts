/**
 * The locale to format dates and times in: the visitor's first preferred
 * language. A browser's own default follows its interface language, which
 * can differ, such as an en-US browser for someone who prefers en-AU. The
 * default is kept when it names the same language and region, so nothing
 * changes for visitors it already suited.
 */
export function formatLocale(
  preferred: readonly string[],
  fallback = new Intl.DateTimeFormat().resolvedOptions().locale,
): string {
  for (const tag of preferred) {
    let base: string;
    try {
      base = new Intl.Locale(tag).baseName;
    } catch {
      continue; // A malformed tag, such as "en_US", names no language.
    }
    return base === new Intl.Locale(fallback).baseName ? fallback : tag;
  }
  return fallback;
}
