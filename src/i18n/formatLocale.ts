/**
 * The locale to format dates and times in: the visitor's first preferred
 * language. A browser's own default follows its interface language, which
 * can differ, such as an en-US browser for someone who prefers en-AU. The
 * default is kept when it names the same language and region, since it can
 * carry the device's 12- or 24-hour setting.
 */
export function formatLocale(
  preferred: readonly string[],
  fallback = new Intl.DateTimeFormat().resolvedOptions().locale,
): string {
  const first = preferred[0];
  if (!first) return fallback;
  const base = (tag: string) => new Intl.Locale(tag).baseName;
  return base(first) === base(fallback) ? fallback : first;
}
