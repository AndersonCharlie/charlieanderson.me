// Coverage for the QA-flagged gaps: mergeBusy input forms, slotEventId
// disambiguation, formatRange across DST, and config parsing/validation.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeBusy, slotEventId } from "../api/_lib/slots.js";
import { formatRange } from "../api/_lib/time.js";
import { loadConfig } from "../api/_lib/config.js";

const T = (iso) => Date.parse(iso);

test("mergeBusy accepts epoch-ms numbers and drops zero/negative-length intervals", () => {
  const merged = mergeBusy([
    { start: T("2026-07-03T14:00:00Z"), end: T("2026-07-03T15:00:00Z") },
    { start: "2026-07-03T14:30:00Z", end: "2026-07-03T15:30:00Z" }, // mixed forms
    { start: T("2026-07-03T16:00:00Z"), end: T("2026-07-03T16:00:00Z") }, // zero-length
    { start: "2026-07-03T18:00:00Z", end: "2026-07-03T17:00:00Z" }, // inverted
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].start, T("2026-07-03T14:00:00Z"));
  assert.equal(merged[0].end, T("2026-07-03T15:30:00Z"));
});

test("slotEventId distinguishes durations and never collides across a grid", () => {
  assert.notEqual(slotEventId(T("2026-07-03T13:00:00Z"), 30), slotEventId(T("2026-07-03T13:00:00Z"), 60));
  const seen = new Set();
  for (let i = 0; i < 10_000; i++) {
    const id = slotEventId(T("2026-01-01T00:00:00Z") + i * 15 * 60_000, 30);
    assert.match(id, /^[a-v0-9]+$/);
    seen.add(id);
  }
  assert.equal(seen.size, 10_000);
});

test("formatRange renders the right tz label on both sides of DST", () => {
  const summer = formatRange(T("2026-07-06T13:00:00Z"), T("2026-07-06T13:30:00Z"), "America/New_York");
  const winter = formatRange(T("2026-12-07T14:00:00Z"), T("2026-12-07T14:30:00Z"), "America/New_York");
  assert.ok(summer.includes("9:00") && summer.includes("9:30 AM EDT"), summer);
  assert.ok(winter.includes("9:00") && winter.includes("9:30 AM EST"), winter);
  assert.ok(summer.startsWith("Monday, July 6, 2026"), summer);
});

test("parseHours: day ranges that wrap the week", () => {
  const cfg = loadConfig({ BOOKING_HOURS: "Fri-Mon 10:00-16:00" });
  assert.deepEqual(cfg.workDays, [5, 6, 0, 1]);
  assert.equal(cfg.dayStartMin, 600);
  assert.equal(cfg.dayEndMin, 960);
});

test("int() env parsing: empty/garbage falls back to defaults", () => {
  const cfg = loadConfig({ BOOKING_DURATION_MIN: "", BOOKING_BUFFER_MIN: "abc" });
  assert.equal(cfg.durationMin, 30);
  assert.equal(cfg.bufferMin, 10);
});

test("config validation throws loudly on operator misconfiguration", () => {
  assert.throws(() => loadConfig({ BOOKING_DURATION_MIN: "-30" }), /DURATION/);
  assert.throws(() => loadConfig({ BOOKING_DURATION_MIN: "0.5" }), /DURATION/);
  assert.throws(() => loadConfig({ BOOKING_MAX_DAYS: "0" }), /MAX_DAYS/);
  assert.throws(() => loadConfig({ BOOKING_GRID_MIN: "20" }), /GRID/); // not a multiple of the 15-min scan
  assert.throws(() => loadConfig({ BOOKING_BUFFER_MIN: "-1" }), /BUFFER/);
  assert.throws(() => loadConfig({ BOOKING_HOURS: "Mon-Fri 09:00-08:00" }), /end before start/);
  assert.throws(() => loadConfig({ BOOKING_HOURS: "whenever" }), /unparseable/);
  // 24:00 end is allowed (the midnight branch in isBookableInstant)
  const cfg = loadConfig({ BOOKING_HOURS: "Mon-Fri 09:00-24:00" });
  assert.equal(cfg.dayEndMin, 1440);
});
