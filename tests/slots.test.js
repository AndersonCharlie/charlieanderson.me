import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeSlots,
  isBookableInstant,
  mergeBusy,
  overlapsBusy,
  slotEventId,
  SCAN_STEP_MS,
} from "../api/_lib/slots.js";
import { wallClock } from "../api/_lib/time.js";

const CFG = {
  tz: "America/New_York",
  workDays: [1, 2, 3, 4, 5], // Mon–Fri
  dayStartMin: 9 * 60,
  dayEndMin: 17 * 60,
  durationMin: 30,
  bufferMin: 10,
  minNoticeMin: 12 * 60,
  maxDaysOut: 21,
  slotGridMin: 30,
};

const T = (iso) => Date.parse(iso);
// Thu 2026-07-02 11:00 EDT — the canonical "now" for most tests.
const NOW = T("2026-07-02T15:00:00Z");

const slotsOnDay = (slots, dateKey) =>
  slots.filter((ms) => wallClock(ms, CFG.tz).dateKey === dateKey);

test("min notice pushes the first slot past now + 12h (next working morning)", () => {
  const slots = computeSlots({ nowMs: NOW, busy: [], cfg: CFG });
  // now+12h = Thu 23:00 EDT → first bookable is Fri Jul 3, 9:00 EDT = 13:00Z
  assert.equal(slots[0], T("2026-07-03T13:00:00Z"));
});

test("no slot ends past now + maxDaysOut", () => {
  const slots = computeSlots({ nowMs: NOW, busy: [], cfg: CFG });
  const windowEnd = NOW + CFG.maxDaysOut * 86_400_000;
  for (const s of slots) assert.ok(s + CFG.durationMin * 60_000 <= windowEnd);
  // window ends Thu Jul 23 11:00 EDT → last slot starts 10:30 EDT = 14:30Z
  assert.equal(slots[slots.length - 1], T("2026-07-23T14:30:00Z"));
});

test("every slot is Mon–Fri, within 9:00–17:00 wall time, on the 30-min grid", () => {
  const slots = computeSlots({ nowMs: NOW, busy: [], cfg: CFG });
  assert.ok(slots.length > 0);
  for (const s of slots) {
    const w = wallClock(s, CFG.tz);
    assert.ok(w.weekday >= 1 && w.weekday <= 5, `weekend slot ${new Date(s).toISOString()}`);
    assert.ok(w.minutes >= 540, `before 9am: ${new Date(s).toISOString()}`);
    assert.ok(w.minutes <= 990, `starts after 16:30: ${new Date(s).toISOString()}`);
    assert.equal(w.minutes % 30, 0, `off-grid: ${new Date(s).toISOString()}`);
  }
});

test("a busy block removes the slot and buffers block the adjacent ones", () => {
  // Busy Fri Jul 3 10:00–10:30 EDT (14:00–14:30Z), buffer 10 min
  const busy = [{ start: "2026-07-03T14:00:00Z", end: "2026-07-03T14:30:00Z" }];
  const slots = computeSlots({ nowMs: NOW, busy, cfg: CFG });
  const blocked = ["2026-07-03T13:30:00Z", "2026-07-03T14:00:00Z", "2026-07-03T14:30:00Z"];
  const free = ["2026-07-03T13:00:00Z", "2026-07-03T15:00:00Z"];
  for (const iso of blocked) assert.ok(!slots.includes(T(iso)), `${iso} should be blocked`);
  for (const iso of free) assert.ok(slots.includes(T(iso)), `${iso} should be free`);
});

test("buffer boundary is half-open (touching exactly does not block)", () => {
  // Slot 13:30Z buffered window is [13:20, 14:10). Busy ending exactly 13:20 is fine…
  let slots = computeSlots({
    nowMs: NOW,
    busy: [{ start: "2026-07-03T13:00:00Z", end: "2026-07-03T13:20:00Z" }],
    cfg: CFG,
  });
  assert.ok(slots.includes(T("2026-07-03T13:30:00Z")));
  // …but one minute more overlaps.
  slots = computeSlots({
    nowMs: NOW,
    busy: [{ start: "2026-07-03T13:00:00Z", end: "2026-07-03T13:21:00Z" }],
    cfg: CFG,
  });
  assert.ok(!slots.includes(T("2026-07-03T13:30:00Z")));
});

test("DST fall-back (Nov 1 2026): 9am ET is 13:00Z before and 14:00Z after", () => {
  const cfg = { ...CFG, minNoticeMin: 0, maxDaysOut: 10 };
  const slots = computeSlots({ nowMs: T("2026-10-26T00:00:00Z"), busy: [], cfg });
  const friBefore = slotsOnDay(slots, "2026-10-30"); // EDT, UTC-4
  const monAfter = slotsOnDay(slots, "2026-11-02"); // EST, UTC-5
  assert.equal(friBefore[0], T("2026-10-30T13:00:00Z"));
  assert.equal(monAfter[0], T("2026-11-02T14:00:00Z"));
  // Both days hold a full 9:00–16:30 grid: 16 starts each.
  assert.equal(friBefore.length, 16);
  assert.equal(monAfter.length, 16);
});

test("DST spring-forward (Mar 14 2027): 9am ET is 14:00Z before and 13:00Z after", () => {
  const cfg = { ...CFG, minNoticeMin: 0, maxDaysOut: 10 };
  const slots = computeSlots({ nowMs: T("2027-03-10T00:00:00Z"), busy: [], cfg });
  assert.equal(slotsOnDay(slots, "2027-03-12")[0], T("2027-03-12T14:00:00Z")); // EST
  assert.equal(slotsOnDay(slots, "2027-03-15")[0], T("2027-03-15T13:00:00Z")); // EDT
});

test("isBookableInstant enforces the same rules for booking requests", () => {
  const valid = T("2026-07-03T13:00:00Z"); // Fri 9:00 EDT
  assert.equal(isBookableInstant(valid, NOW, CFG), true);
  // off the wall-clock grid (9:15 isn't a 30-min boundary)
  assert.equal(isBookableInstant(T("2026-07-03T13:15:00Z"), NOW, CFG), false);
  // stray seconds — not on the scan grid at all
  assert.equal(isBookableInstant(valid + 1000, NOW, CFG), false);
  // inside the notice window
  assert.equal(isBookableInstant(T("2026-07-02T15:30:00Z"), NOW, CFG), false);
  // beyond max-days-out
  assert.equal(isBookableInstant(T("2026-07-24T13:00:00Z"), NOW, CFG), false);
  // Saturday
  assert.equal(isBookableInstant(T("2026-07-04T13:00:00Z"), NOW, CFG), false);
  // 8:30am — before opening
  assert.equal(isBookableInstant(T("2026-07-03T12:30:00Z"), NOW, CFG), false);
  // 16:30 start is the last that fits before 17:00
  assert.equal(isBookableInstant(T("2026-07-03T20:30:00Z"), NOW, CFG), true);
  assert.equal(isBookableInstant(T("2026-07-03T21:00:00Z"), NOW, CFG), false);
  assert.equal(isBookableInstant(NaN, NOW, CFG), false);
});

test("mergeBusy merges overlapping and touching intervals", () => {
  const merged = mergeBusy([
    { start: "2026-07-03T14:30:00Z", end: "2026-07-03T15:30:00Z" },
    { start: "2026-07-03T14:00:00Z", end: "2026-07-03T14:30:00Z" },
    { start: "2026-07-03T18:00:00Z", end: "2026-07-03T18:30:00Z" },
    { start: "bogus", end: "2026-07-03T19:00:00Z" }, // dropped
  ]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].start, T("2026-07-03T14:00:00Z"));
  assert.equal(merged[0].end, T("2026-07-03T15:30:00Z"));
});

test("overlapsBusy is half-open on both sides", () => {
  const merged = mergeBusy([{ start: "2026-07-03T14:00:00Z", end: "2026-07-03T15:00:00Z" }]);
  assert.equal(overlapsBusy(T("2026-07-03T15:00:00Z"), T("2026-07-03T16:00:00Z"), merged), false);
  assert.equal(overlapsBusy(T("2026-07-03T13:00:00Z"), T("2026-07-03T14:00:00Z"), merged), false);
  assert.equal(overlapsBusy(T("2026-07-03T14:59:00Z"), T("2026-07-03T15:30:00Z"), merged), true);
});

test("slotEventId is deterministic and Google-id-safe (base32hex)", () => {
  const a = slotEventId(T("2026-07-03T13:00:00Z"), 30);
  const b = slotEventId(T("2026-07-03T13:00:00Z"), 30);
  const c = slotEventId(T("2026-07-03T13:30:00Z"), 30);
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[a-v0-9]+$/);
  assert.ok(a.length >= 5 && a.length <= 1024);
});

test("scan grid covers quarter-hour-offset timezones (sanity)", () => {
  // Asia/Kathmandu is UTC+5:45 — wall-aligned 30-min slots exist off the
  // UTC half-hour grid; the 15-min scan step must still find them.
  const cfg = { ...CFG, tz: "Asia/Kathmandu", minNoticeMin: 0, maxDaysOut: 3 };
  const slots = computeSlots({ nowMs: T("2026-07-06T00:00:00Z"), busy: [], cfg });
  assert.ok(slots.length > 0);
  for (const s of slots) {
    assert.equal(wallClock(s, cfg.tz).minutes % 30, 0);
    assert.equal(s % SCAN_STEP_MS, 0);
  }
});
