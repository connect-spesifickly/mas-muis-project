// Timezone utilities for consistent Singapore time (UTC+8)
// We compute month/year boundaries as UTC instants that correspond to
// local Singapore time at 00:00 of the intended boundary.

const SG_TZ_OFFSET_HOURS = 8; // Asia/Singapore

// Returns [start, endExclusive] for the given month (1..12) in Singapore time
export function sgMonthRange(year: number, month1to12: number) {
  if (month1to12 < 1 || month1to12 > 12) {
    throw new Error(`Invalid month: ${month1to12}. Expected 1..12`);
  }
  const start = new Date(
    Date.UTC(year, month1to12 - 1, 1, -SG_TZ_OFFSET_HOURS)
  );
  const endExclusive = new Date(
    Date.UTC(year, month1to12, 1, -SG_TZ_OFFSET_HOURS)
  );
  return { start, endExclusive };
}

// Returns [start, endExclusive] of a whole year in Singapore time
export function sgYearRange(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, -SG_TZ_OFFSET_HOURS));
  const endExclusive = new Date(Date.UTC(year + 1, 0, 1, -SG_TZ_OFFSET_HOURS));
  return { start, endExclusive };
}
