// Pure availability engine — no I/O, no clock, no Google. Everything is
// injected (nowMs, busy intervals, config) so tests can pin any moment,
// including DST transitions.

import { wallClock } from "./time.js";

// Candidate instants are scanned every 15 min (UTC). Real-world UTC offsets
// are all multiples of 15 min, so every wall-clock-aligned slot start in any
// timezone lands on this scan grid; wall alignment itself is enforced in
// isBookableInstant via the formatted local time.
export const SCAN_STEP_MS = 15 * 60_000;

const MIN = 60_000;
const DAY = 86_400_000;

// [{start,end} ISO or ms] → sorted, merged [{start,end} ms]
export function mergeBusy(intervals) {
  const norm = (v) => (typeof v === "number" ? v : Date.parse(v));
  const sorted = (intervals || [])
    .map((b) => ({ start: norm(b.start), end: norm(b.end) }))
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end) && b.end > b.start)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const b of sorted) {
    const last = merged[merged.length - 1];
    if (last && b.start <= last.end) last.end = Math.max(last.end, b.end);
    else merged.push({ ...b });
  }
  return merged;
}

// Half-open overlap: [startMs, endMs) vs merged busy [{start,end})
export function overlapsBusy(startMs, endMs, mergedBusy) {
  for (const b of mergedBusy) {
    if (b.start >= endMs) break; // merged list is sorted
    if (startMs < b.end && b.start < endMs) return true;
  }
  return false;
}

// Rules-only check for a slot START instant: grid alignment, working
// day/hours, min notice, max-days-out window. Busy overlap is checked
// separately (availability filters; booking re-queries freebusy).
// This same function validates incoming booking requests, so the rules a
// visitor sees and the rules the server enforces can never drift apart.
export function isBookableInstant(startMs, nowMs, cfg) {
  if (!Number.isFinite(startMs)) return false;
  if (startMs % SCAN_STEP_MS !== 0) return false; // off-grid (incl. stray seconds/ms)
  if (startMs < nowMs + cfg.minNoticeMin * MIN) return false;
  const endMs = startMs + cfg.durationMin * MIN;
  if (endMs > nowMs + cfg.maxDaysOut * DAY) return false;

  const w = wallClock(startMs, cfg.tz);
  if (!cfg.workDays.includes(w.weekday)) return false;
  if (w.minutes % cfg.slotGridMin !== 0) return false;
  if (w.minutes < cfg.dayStartMin) return false;

  // End is read from the actual end instant, so a slot spanning a DST jump
  // is judged by the real wall time it ends at, not start + duration.
  const e = wallClock(endMs, cfg.tz);
  const endMinutes = e.dateKey === w.dateKey ? e.minutes : e.minutes === 0 ? 1440 : -1;
  if (endMinutes < 0 || endMinutes > cfg.dayEndMin) return false;

  return true;
}

// → sorted array of slot-start epoch ms
export function computeSlots({ nowMs, busy, cfg }) {
  const merged = mergeBusy(busy);
  const bufMs = cfg.bufferMin * MIN;
  const durMs = cfg.durationMin * MIN;
  const windowStart = nowMs + cfg.minNoticeMin * MIN;
  const windowEnd = nowMs + cfg.maxDaysOut * DAY;

  const slots = [];
  const first = Math.ceil(windowStart / SCAN_STEP_MS) * SCAN_STEP_MS;
  for (let t = first; t + durMs <= windowEnd; t += SCAN_STEP_MS) {
    if (!isBookableInstant(t, nowMs, cfg)) continue;
    if (overlapsBusy(t - bufMs, t + durMs + bufMs, merged)) continue;
    slots.push(t);
  }
  return slots;
}

// Deterministic Google Calendar event id for a slot. Google's event ids
// must be base32hex ([a-v0-9]); Number.prototype.toString(32) emits exactly
// that alphabet. Two concurrent bookings of the same slot therefore try to
// insert the SAME id, and Google atomically rejects the second with 409 —
// that collision is the double-booking guard.
export function slotEventId(startMs, durationMin) {
  return `bk${Math.floor(startMs / 1000).toString(32)}d${durationMin.toString(32)}`;
}
