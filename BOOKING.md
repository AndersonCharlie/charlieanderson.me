# BOOKING.md — the /call/ booking page (Calendly-style, self-hosted)

A visitor picks an open 30-minute slot on `/call/`, fills in name/email/notes,
and the booking lands on Charlie's Google Calendar with a confirmation email
(carrying the Zoom link) sent from charlie@charlieanderson.me. No Calendly, no
third-party embed, nothing paid.

## How it works

- **Frontend** — `call/index.html` + `js/booking.js` + a marked section at the
  end of `css/main.css`. Pure display: it fetches slot instants (UTC ISO) and
  formats them in the visitor's auto-detected timezone. No timezone math and no
  Google calls ever happen in the browser.
- **Backend** — two serverless functions (Vercel-style, plain Node, zero deps):
  - `api/availability.js` → `GET /api/availability` — Google FreeBusy over the
    next `BOOKING_MAX_DAYS`, then the pure engine in `api/_lib/slots.js`
    computes open slots (working hours in `BOOKING_TZ`, DST-safe, minus busy
    times, buffers, min notice). Visitors only ever see free instants — never
    event titles or details.
  - `api/book.js` → `POST /api/book` — re-validates the slot against the same
    rules *at booking time*, re-checks FreeBusy, then inserts the event with a
    **slot-deterministic event id** (`api/_lib/slots.js:slotEventId`). Google
    atomically rejects a duplicate id with 409, so two people racing for the
    same slot can never both win — the loser sees "that time was just taken."
    The visitor is added as attendee (Google emails them an invite) and the
    confirmation email goes out via the Gmail API.
- **Engine correctness** — `tests/slots.test.js` (`npm test`) pins the slot
  math at fixed instants, including both 2026/27 DST transitions, buffer
  half-open boundaries, min-notice/max-days edges, and grid alignment.

## Setup (one time)

1. **Mint the Google token** (Calendar + gmail.send scopes, account
   charlie@charlieanderson.me — reuses the same OAuth client as the Gmail
   scripts):

   ```
   python3 ~/scripts/calendar_auth.py
   ```

   A browser opens for consent; the script then prints the three `GOOGLE_*`
   env values. If Google says *access denied / app not verified*, add
   charlie@charlieanderson.me as a Test User on the OAuth consent screen of
   the Google Cloud project that owns the client, and rerun with `--force`.

2. **Configure env** — `cp .env.example .env`, paste the three `GOOGLE_*`
   values, and set `BOOKING_ZOOM_URL` to the personal Zoom room link the
   confirmations should carry. Everything else has sane defaults
   (Mon–Fri 9–17 America/New_York, 30 min, 10-min buffer, 12 h notice,
   21 days out) — see `.env.example` for the full list.
   **`.env` is gitignored. Never commit it; never expose these values to the
   browser.**

3. **Run locally**:

   ```
   node _tools/dev-server.mjs          # real calendar (uses .env)
   BOOKING_MOCK=1 node _tools/dev-server.mjs   # no creds needed, in-memory calendar
   ```

   Then open http://localhost:3000/call/. (`_tools/` is local-only tooling,
   gitignored like `shot.js`.)

## Deploy

The static site currently lives on GitHub Pages, **which cannot run the two
api functions** — the booking page needs the site on Vercel (already
recommended in HANDOFF.md for analytics; the insights script is wired):

1. `vercel` from the repo root (or import the repo in the Vercel dashboard).
2. Set the env vars from `.env` in Vercel → Project → Settings → Environment
   Variables (all of them server-side; none are `NEXT_PUBLIC`/client).
3. Point the `charlieanderson.me` DNS at Vercel, per the README.

Nothing about the rest of the static site changes; `api/` only becomes live
endpoints on Vercel.

## Correctness properties (verified; see tests + QA)

- Timezone/DST: slots are enumerated as UTC instants and *read* through the
  business timezone via `Intl` — ambiguous/nonexistent local times can't be
  constructed. 9 AM ET is 13:00Z in July and 14:00Z in December, and the
  tests pin both DST transitions.
- A booked slot disappears from availability immediately (freebusy reflects
  the new event) and buffers block the adjacent slots.
- Double-booking is impossible: deterministic event id → Google 409s the
  second insert atomically. A cancelled event's id (Google keeps tombstones
  forever) is revived via an **etag-guarded** update — If-Match makes the
  revive a compare-and-swap, so even two people racing to rebook a freed
  slot produce exactly one winner (regression-tested in
  `tests/booking.test.js`).
- Min-notice and max-days-out are enforced server-side at booking time, not
  just at page-render time.
- Privacy: the API returns only instants; secrets live only in env vars.
- Honeypot field (`website`) silently no-ops bot submissions.

## Known limitations

- No holiday awareness — block days off in Google Calendar and they're
  excluded automatically (busy = blocked).
- One meeting type. Adding more means a `meetingTypes` config list, a picker
  step in the UI, and duration-aware slot generation (the engine already takes
  `durationMin`).
- No rate limiting on `/api/book` beyond the honeypot; Vercel's platform
  limits are the backstop.
- Confirmation email failure never fails a booking (it's logged; the Google
  Calendar invite still reaches the visitor).
