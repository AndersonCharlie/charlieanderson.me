// POST /api/book — validate against the same rules availability uses,
// re-check freebusy, then insert with a slot-deterministic event id.
//
// Double-booking is impossible by construction: both racers compute the
// same event id for the same slot, and Google atomically 409s the second
// insert. The freebusy re-check just gives a cleaner answer when the
// calendar changed between page-load and submit.

import { loadConfig } from "./_lib/config.js";
import { isBookableInstant, overlapsBusy, mergeBusy, slotEventId } from "./_lib/slots.js";
import { freeBusy, insertEvent, getEvent, updateEvent } from "./_lib/google.js";
import { isValidTimeZone } from "./_lib/time.js";
import { sendConfirmation } from "./_lib/email.js";
import { readJson, sendJson, TOO_LARGE } from "./_lib/http.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });

  const body = await readJson(req);
  if (body === TOO_LARGE) return sendJson(res, 413, { error: "too_large" });
  if (!body) return sendJson(res, 400, { error: "invalid_body" });

  // Honeypot: bots that fill the hidden field get a quiet fake success.
  if (body.website) return sendJson(res, 200, { ok: true });

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim();
  const notes = String(body.notes || "").trim().slice(0, 2000);
  const startMs = Date.parse(body.start || "");
  if (!name) return sendJson(res, 400, { error: "invalid_name" });
  if (!EMAIL_RE.test(email) || email.length > 254) return sendJson(res, 400, { error: "invalid_email" });

  try {
    const cfg = loadConfig();
    const nowMs = Date.now();
    const visitorTz = isValidTimeZone(body.tz) ? body.tz : cfg.tz;

    // Same rules the availability endpoint applied — re-evaluated at "now",
    // so min-notice/max-days can't be dodged by holding a stale page open.
    if (!isBookableInstant(startMs, nowMs, cfg)) return sendJson(res, 400, { error: "invalid_slot" });

    const durMs = cfg.durationMin * 60_000;
    const bufMs = cfg.bufferMin * 60_000;
    const endMs = startMs + durMs;

    const busy = await freeBusy({
      timeMinMs: startMs - bufMs,
      timeMaxMs: endMs + bufMs,
      calendarId: cfg.calendarId,
    });
    if (overlapsBusy(startMs - bufMs, endMs + bufMs, mergeBusy(busy))) {
      return sendJson(res, 409, { error: "slot_taken" });
    }

    const eventId = slotEventId(startMs, cfg.durationMin);
    const event = {
      id: eventId,
      status: "confirmed",
      summary: `${cfg.meetingType} — ${name}`,
      description: [
        `Booked via charlieanderson.me/call/`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        notes ? `Notes: ${notes}` : null,
        cfg.zoomUrl ? `` : null,
        cfg.zoomUrl ? `Zoom: ${cfg.zoomUrl}` : null,
      ]
        .filter((l) => l !== null)
        .join("\n"),
      location: cfg.zoomUrl || undefined,
      start: { dateTime: new Date(startMs).toISOString(), timeZone: cfg.tz },
      end: { dateTime: new Date(endMs).toISOString(), timeZone: cfg.tz },
      attendees: [{ email, displayName: name }],
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: false,
    };

    const ins = await insertEvent({ calendarId: cfg.calendarId, event });
    if (ins.conflict) {
      // Same id already exists. Two cases:
      //  - live event → slot genuinely just taken → 409
      //  - cancelled tombstone (Google never frees an id, even after
      //    delete) → the slot was freed by a cancellation; revive it.
      const existing = await getEvent({ calendarId: cfg.calendarId, eventId });
      if (!existing || existing.status !== "cancelled" || !existing.etag) {
        // no etag → we can't revive atomically, so treat as taken
        return sendJson(res, 409, { error: "slot_taken" });
      }
      // Etag-guarded revive: If-Match makes this a compare-and-swap, so of
      // two racers who both read the same tombstone, exactly one update
      // lands — the other gets 412 and the visitor a clean "just taken".
      const upd = await updateEvent({
        calendarId: cfg.calendarId,
        eventId,
        event,
        etag: existing.etag,
      });
      if (upd.precondition) return sendJson(res, 409, { error: "slot_taken" });
    }

    if (cfg.sendEmail) {
      await sendConfirmation({ cfg, name, email, startMs, endMs, visitorTz });
    }

    return sendJson(res, 200, {
      ok: true,
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      meetingType: cfg.meetingType,
    });
  } catch (err) {
    console.error("booking failed:", err.message);
    return sendJson(res, 500, { error: "server_error" });
  }
}
