// Booking configuration, read from env with the defaults Charlie chose.
// BOOKING_HOURS format: "Mon-Fri 09:00-17:00" (single day-range + time-range).

const DAY_IDX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function parseHours(spec) {
  const m = /^(\w{3})\s*-\s*(\w{3})\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(
    spec.trim()
  );
  if (!m) throw new Error(`BOOKING_HOURS unparseable: "${spec}" (want "Mon-Fri 09:00-17:00")`);
  const from = DAY_IDX[m[1].toLowerCase()];
  const to = DAY_IDX[m[2].toLowerCase()];
  if (from === undefined || to === undefined) throw new Error(`BOOKING_HOURS bad day in "${spec}"`);
  const workDays = [];
  for (let d = from; ; d = (d + 1) % 7) {
    workDays.push(d);
    if (d === to) break;
  }
  const dayStartMin = Number(m[3]) * 60 + Number(m[4]);
  const dayEndMin = Number(m[5]) * 60 + Number(m[6]);
  if (dayEndMin <= dayStartMin) throw new Error(`BOOKING_HOURS end before start in "${spec}"`);
  return { workDays, dayStartMin, dayEndMin };
}

function int(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? n : fallback;
}

export function loadConfig(env = process.env) {
  const { workDays, dayStartMin, dayEndMin } = parseHours(env.BOOKING_HOURS || "Mon-Fri 09:00-17:00");
  const cfg = {
    tz: env.BOOKING_TZ || "America/New_York",
    workDays,
    dayStartMin,
    dayEndMin,
    durationMin: int(env.BOOKING_DURATION_MIN, 30),
    bufferMin: int(env.BOOKING_BUFFER_MIN, 10),
    minNoticeMin: int(env.BOOKING_MIN_NOTICE_H, 12) * 60,
    maxDaysOut: int(env.BOOKING_MAX_DAYS, 21),
    slotGridMin: int(env.BOOKING_GRID_MIN, 30),
    meetingType: env.BOOKING_MEETING_TYPE || "30-min strategy call",
    calendarId: env.BOOKING_CALENDAR_ID || "primary",
    zoomUrl: env.BOOKING_ZOOM_URL || "",
    confirmFrom: env.BOOKING_CONFIRM_FROM || "charlie@charlieanderson.me",
    fromName: env.BOOKING_FROM_NAME || "Charlie Anderson",
    sendEmail: env.BOOKING_SEND_EMAIL !== "false",
  };

  // Operator misconfiguration should fail loudly (500), not warp the math.
  const bad = (msg) => {
    throw new Error(`booking config: ${msg}`);
  };
  if (!Number.isInteger(cfg.durationMin) || cfg.durationMin <= 0) bad("BOOKING_DURATION_MIN must be a positive integer");
  if (!Number.isInteger(cfg.bufferMin) || cfg.bufferMin < 0) bad("BOOKING_BUFFER_MIN must be a non-negative integer");
  if (!Number.isFinite(cfg.minNoticeMin) || cfg.minNoticeMin < 0) bad("BOOKING_MIN_NOTICE_H must be >= 0");
  if (!Number.isInteger(cfg.maxDaysOut) || cfg.maxDaysOut <= 0) bad("BOOKING_MAX_DAYS must be a positive integer");
  if (!Number.isInteger(cfg.slotGridMin) || cfg.slotGridMin <= 0 || cfg.slotGridMin % 15 !== 0)
    bad("BOOKING_GRID_MIN must be a positive multiple of 15 (the scan step)");
  if (dayEndMin > 1440) bad("BOOKING_HOURS end past 24:00");
  if (cfg.durationMin > dayEndMin - dayStartMin) bad("BOOKING_DURATION_MIN longer than the working day");

  return cfg;
}
