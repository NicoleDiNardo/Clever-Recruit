/**
 * Time-zone support for interview scheduling — AUD-P1-02's required
 * "interviewer and candidate in different zones" notice.
 *
 * There's no real time-zone field anywhere in this dataset. What does exist
 * is Candidate.location, a real, populated city string ('Rome', 'London',
 * 'Mountain View, CA', ...). This maps those actual seeded cities to an
 * IANA zone — it is not a general geocoder, just a lookup for the cities
 * that appear in mockData.ts, and returns undefined for anything it
 * doesn't recognise (including 'Remote', which genuinely has no zone)
 * rather than guessing.
 *
 * Interviewers (User) have no location data at all, so ORG_TIMEZONE is an
 * explicit, flagged assumption — every mock interviewer is treated as
 * sitting at the org's own HQ, inferred from where its own job listings are
 * based (Mountain View / the Bay Area) — not a claim about any real person.
 */

export const ORG_TIMEZONE = 'America/Los_Angeles';

const CITY_TIMEZONES: Record<string, string> = {
  amsterdam: 'Europe/Amsterdam',
  barcelona: 'Europe/Madrid',
  berlin: 'Europe/Berlin',
  dublin: 'Europe/Dublin',
  london: 'Europe/London',
  'los gatos, ca': 'America/Los_Angeles',
  madrid: 'Europe/Madrid',
  'menlo park, ca': 'America/Los_Angeles',
  'mountain view, ca': 'America/Los_Angeles',
  'new york': 'America/New_York',
  paris: 'Europe/Paris',
  'redmond, wa': 'America/Los_Angeles',
  rome: 'Europe/Rome',
  'san francisco, ca': 'America/Los_Angeles',
  'seattle, wa': 'America/Los_Angeles',
  seoul: 'Asia/Seoul',
  singapore: 'Asia/Singapore',
  'stockholm, sweden': 'Europe/Stockholm',
  sydney: 'Australia/Sydney',
  toronto: 'America/Toronto',
};

/** undefined for an unrecognised or absent location — 'Remote' included,
 *  since it genuinely doesn't map to a zone. Callers must treat undefined
 *  as "unknown," not as a match. */
export function getLocationTimezone(location?: string): string | undefined {
  if (!location) return undefined;
  return CITY_TIMEZONES[location.trim().toLowerCase()];
}

/** Short zone label at a given instant, e.g. 'GMT-7' — via Intl, so it's
 *  correct across DST rather than a hardcoded offset. */
export function formatTzOffset(timezone: string, at: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(at);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? timezone;
  } catch {
    return timezone;
  }
}

/** The time a given instant reads as in a zone, e.g. '2:00 PM'. */
export function formatTimeInZone(timezone: string, at: Date): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
    }).format(at);
  } catch {
    return at.toLocaleTimeString();
  }
}

/** True only when both zones are known and they actually differ at this
 *  instant (comparing offsets, not zone names, so e.g. two zones that
 *  happen to share an offset today aren't flagged as a mismatch). */
export function timezonesDiffer(tzA: string | undefined, tzB: string | undefined, at: Date): boolean {
  if (!tzA || !tzB) return false;
  return formatTzOffset(tzA, at) !== formatTzOffset(tzB, at);
}
