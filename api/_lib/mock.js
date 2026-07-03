// In-memory stand-in for Google Calendar/Gmail, enabled with BOOKING_MOCK=1
// (local dev + QA only; a serverless deploy never sets it). Faithful to the
// three behaviors the engine depends on: freebusy reflects bookings, a
// duplicate event id 409s (conflict) — including cancelled tombstones, as
// Google never frees an id — and update honors etag preconditions (412).

const booked = new Map(); // eventId → event (with .etag, .status)
let etagCounter = 1;

// Extra canned busy time: BOOKING_MOCK_BUSY="<iso>/<iso>,<iso>/<iso>"
function cannedBusy(env = process.env) {
  return (env.BOOKING_MOCK_BUSY || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [start, end] = pair.split("/");
      return { start, end };
    });
}

export async function freeBusy() {
  const busy = cannedBusy();
  for (const ev of booked.values()) {
    if (ev.status !== "cancelled") busy.push({ start: ev.start.dateTime, end: ev.end.dateTime });
  }
  return busy;
}

export async function insertEvent({ event }) {
  if (booked.has(event.id)) return { conflict: true };
  booked.set(event.id, { ...event, etag: `"mock-${etagCounter++}"` });
  return { conflict: false, event: booked.get(event.id) };
}

export async function getEvent({ eventId }) {
  return booked.get(eventId) || null;
}

export async function updateEvent({ eventId, event, etag }) {
  const existing = booked.get(eventId);
  if (etag && (!existing || existing.etag !== etag)) return { precondition: true };
  booked.set(eventId, { ...event, etag: `"mock-${etagCounter++}"` });
  return { precondition: false, event: booked.get(eventId) };
}

export async function gmailSend() {
  console.log("[mock] confirmation email (suppressed)");
  return { id: "mock" };
}

// Test hooks (unit tests only)
export function _reset() {
  booked.clear();
  etagCounter = 1;
}

export function _cancel(eventId) {
  const ev = booked.get(eventId);
  if (ev) booked.set(eventId, { ...ev, status: "cancelled", etag: `"mock-${etagCounter++}"` });
}
