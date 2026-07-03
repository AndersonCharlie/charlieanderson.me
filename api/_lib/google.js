// Minimal Google API client over fetch — no SDK dependency. Server-side
// only: these functions must never be reachable from browser code, and the
// refresh token/client secret live exclusively in env vars.

import * as mock from "./mock.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL = "https://www.googleapis.com/calendar/v3";
const GMAIL = "https://gmail.googleapis.com/gmail/v1";

// BOOKING_MOCK=1 swaps in the in-memory calendar (local dev/QA only).
const isMock = () => process.env.BOOKING_MOCK === "1";

// Access-token cache survives across warm serverless invocations.
let cached = { token: null, exp: 0 };

export async function accessToken(env = process.env) {
  if (cached.token && Date.now() < cached.exp - 60_000) return cached.token;
  for (const k of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"]) {
    if (!env[k]) throw new Error(`missing env ${k}`);
  }
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`token refresh failed (${res.status}): ${await res.text()}`);
  const d = await res.json();
  cached = { token: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return cached.token;
}

async function call(method, url, body) {
  const token = await accessToken();
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error body */
  }
  return { status: res.status, ok: res.ok, data, text };
}

// → busy intervals [{start,end}] (RFC3339 strings) for the calendar
export async function freeBusy({ timeMinMs, timeMaxMs, calendarId }) {
  if (isMock()) return mock.freeBusy();
  const r = await call("POST", `${CAL}/freeBusy`, {
    timeMin: new Date(timeMinMs).toISOString(),
    timeMax: new Date(timeMaxMs).toISOString(),
    items: [{ id: calendarId }],
  });
  if (!r.ok) throw new Error(`freebusy failed (${r.status}): ${r.text}`);
  const cal = Object.values(r.data.calendars || {})[0];
  if (!cal || cal.errors) throw new Error(`freebusy calendar error: ${JSON.stringify(cal?.errors)}`);
  return cal.busy || [];
}

// events.insert with a caller-supplied id. Returns {conflict:true} on 409
// (id already exists = someone else won the slot race).
export async function insertEvent({ calendarId, event, sendUpdates = "all" }) {
  if (isMock()) return mock.insertEvent({ event });
  const r = await call(
    "POST",
    `${CAL}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=${sendUpdates}&conferenceDataVersion=0`,
    event
  );
  if (r.status === 409) return { conflict: true };
  if (!r.ok) throw new Error(`events.insert failed (${r.status}): ${r.text}`);
  return { conflict: false, event: r.data };
}

export async function getEvent({ calendarId, eventId }) {
  if (isMock()) return mock.getEvent({ eventId });
  const r = await call(
    "GET",
    `${CAL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
  );
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`events.get failed (${r.status}): ${r.text}`);
  return r.data;
}

// Full update (PUT) — used to revive a previously cancelled slot id.
// `etag` makes it a compare-and-swap: If-Match tells Google to apply the
// update only if the event is unchanged since we read it; a lost race
// returns 412 → {precondition:true}. Without this the revive would be
// last-write-wins and two racers could both "win" the slot.
export async function updateEvent({ calendarId, eventId, event, etag, sendUpdates = "all" }) {
  if (isMock()) return mock.updateEvent({ eventId, event, etag });
  const token = await accessToken();
  const res = await fetch(
    `${CAL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}?sendUpdates=${sendUpdates}`,
    {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...(etag ? { "if-match": etag } : {}),
      },
      body: JSON.stringify(event),
    }
  );
  const text = await res.text();
  if (res.status === 412) return { precondition: true };
  if (!res.ok) throw new Error(`events.update failed (${res.status}): ${text}`);
  return { precondition: false, event: JSON.parse(text) };
}

// Gmail send; raw = base64url MIME message. Needs gmail.send scope.
export async function gmailSend(raw) {
  if (isMock()) return mock.gmailSend();
  const r = await call("POST", `${GMAIL}/users/me/messages/send`, { raw });
  if (!r.ok) throw new Error(`gmail send failed (${r.status}): ${r.text}`);
  return r.data;
}
