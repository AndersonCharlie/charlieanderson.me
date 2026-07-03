// Timezone helpers for the booking engine.
//
// All arithmetic happens on UTC epoch milliseconds. The ONLY timezone
// operation we ever do is the safe direction: format a UTC instant into a
// target zone via Intl (every instant maps to exactly one wall time, so
// DST-ambiguous / nonexistent local times can never be constructed here).

const fmtCache = new Map();

function partsFormatter(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    fmtCache.set(tz, f);
  }
  return f;
}

const WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Wall-clock reading of a UTC instant in `tz`:
// { weekday: 0-6 (Sun=0), minutes: minutes past local midnight, dateKey: "YYYY-MM-DD" }
export function wallClock(ms, tz) {
  const parts = {};
  for (const p of partsFormatter(tz).formatToParts(ms)) parts[p.type] = p.value;
  return {
    weekday: WEEKDAY[parts.weekday],
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

export function isValidTimeZone(tz) {
  if (typeof tz !== "string" || !tz || tz.length > 64) return false;
  try {
    partsFormatter(tz);
    return true;
  } catch {
    return false;
  }
}

// "Thursday, July 9, 2026, 2:00 – 2:30 PM EDT" — for emails / event bodies.
export function formatRange(startMs, endMs, tz) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(startMs);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const start = time.format(startMs);
  const end = time.format(endMs);
  // Drop the duplicated tz suffix from the start time ("2:00 PM EDT" → "2:00 PM")
  const startShort = start.replace(/\s\S+$/, "");
  return `${day}, ${startShort} – ${end}`;
}
