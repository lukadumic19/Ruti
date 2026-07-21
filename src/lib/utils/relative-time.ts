const rtf = new Intl.RelativeTimeFormat("da", { numeric: "auto" });

/**
 * Dansk relativ tid, fx "for 2 timer siden". Ren funktion (now injiceres),
 * så den kan testes deterministisk.
 */
export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((then - now.getTime()) / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return rtf.format(Math.round(diffSec / 1), "second");
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (absSec < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86_400), "day");
}
