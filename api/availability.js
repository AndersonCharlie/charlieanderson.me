// GET /api/availability → open slot starts (UTC ISO), respecting working
// hours, min notice, max-days-out, buffers, and real calendar busy times.
// Visitors only ever see instants — never event titles, attendees, or any
// other calendar detail.

import { loadConfig } from "./_lib/config.js";
import { computeSlots } from "./_lib/slots.js";
import { freeBusy } from "./_lib/google.js";
import { sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
  try {
    const cfg = loadConfig();
    const nowMs = Date.now();
    const bufMs = cfg.bufferMin * 60_000;
    const busy = await freeBusy({
      // Widen by buffer so busy events just outside the window still block
      // the slots they buffer against.
      timeMinMs: nowMs + cfg.minNoticeMin * 60_000 - bufMs,
      timeMaxMs: nowMs + cfg.maxDaysOut * 86_400_000 + bufMs,
      calendarId: cfg.calendarId,
    });
    const slots = computeSlots({ nowMs, busy, cfg });
    return sendJson(res, 200, {
      timezone: cfg.tz,
      durationMin: cfg.durationMin,
      meetingType: cfg.meetingType,
      slots: slots.map((ms) => new Date(ms).toISOString()),
    });
  } catch (err) {
    console.error("availability failed:", err.message);
    return sendJson(res, 500, { error: "server_error" });
  }
}
