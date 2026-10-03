/** Ukrainian date/time formatting. Internal timestamps stay ISO (project.md §80–81). */

const DISPLAY_TIME_ZONE = "Europe/Kyiv";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: DISPLAY_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("uk-UA", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: DISPLAY_TIME_ZONE,
});

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return new Date(time);
}

/** `3 жовтня 2026` or `null` when there is no reliable date. */
export function formatDate(iso: string | null | undefined): string | null {
  const date = toDate(iso);
  return date ? dateFormatter.format(date) : null;
}

/** `3 жовтня 2026, 18:26` or `null`. */
export function formatDateTime(iso: string | null | undefined): string | null {
  const date = toDate(iso);
  return date ? dateTimeFormatter.format(date) : null;
}

/** `18:26` or `null`. */
export function formatTime(iso: string | null | undefined): string | null {
  const date = toDate(iso);
  return date ? timeFormatter.format(date) : null;
}

/** `true` when the article was published within the last 24 hours. */
export function isRecent(iso: string | null | undefined, now: number = Date.now()): boolean {
  const date = toDate(iso);
  if (!date) return false;
  return now - date.getTime() <= 24 * 60 * 60 * 1000;
}
