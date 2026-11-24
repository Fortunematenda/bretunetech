/** Africa/Johannesburg helpers. Persist UTC; format for admin display in SAST. */

export const NEWSLETTER_TIME_ZONE = 'Africa/Johannesburg';

export function formatInJohannesburg(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-ZA', {
    timeZone: NEWSLETTER_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/** Parse an ISO datetime; treat naive strings as Johannesburg wall clock. */
export function parseScheduleInput(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('scheduledAt is required');
  if (/Z$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid scheduledAt');
    return d;
  }
  // Africa/Johannesburg is UTC+2 with no DST.
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid scheduledAt');
    return d;
  }
  const [, y, m, day, h, min, s] = match;
  const utcMs = Date.UTC(
    Number(y),
    Number(m) - 1,
    Number(day),
    Number(h) - 2,
    Number(min),
    Number(s || 0),
  );
  return new Date(utcMs);
}

export function johannesburgMonthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NEWSLETTER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  return `${year}-${month}`;
}
