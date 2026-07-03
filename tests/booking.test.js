// Handler-level tests against the BOOKING_MOCK in-memory calendar —
// including the two races: fresh double-book (deterministic-id 409) and
// the cancelled-tombstone revive (etag compare-and-swap).

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.BOOKING_MOCK = "1";
process.env.BOOKING_SEND_EMAIL = "false";
delete process.env.BOOKING_MOCK_BUSY;

const bookHandler = (await import("../api/book.js")).default;
const availabilityHandler = (await import("../api/availability.js")).default;
const { _reset, _cancel } = await import("../api/_lib/mock.js");
const { computeSlots, slotEventId } = await import("../api/_lib/slots.js");
const { loadConfig } = await import("../api/_lib/config.js");
const { readJson, TOO_LARGE } = await import("../api/_lib/http.js");

const cfg = loadConfig(process.env);
const openSlots = computeSlots({ nowMs: Date.now(), busy: [], cfg });
const SLOT = new Date(openSlots[10]).toISOString();
const SLOT2 = new Date(openSlots[20]).toISOString();

function fakeRes() {
  const r = { statusCode: 0, body: "", headersSent: false };
  r.writeHead = (s) => ((r.statusCode = s), (r.headersSent = true), r);
  r.end = (b) => ((r.body = b || ""), r);
  return r;
}

async function call(handler, { method = "POST", body } = {}) {
  const res = fakeRes();
  await handler({ method, body }, res);
  return { status: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
}

const booking = (over = {}) => ({
  start: SLOT,
  name: "Pat Example",
  email: "pat@example.com",
  notes: "",
  tz: "America/Chicago",
  website: "",
  ...over,
});

beforeEach(() => _reset());

test("booking succeeds and the slot leaves availability", async () => {
  const r = await call(bookHandler, { body: booking() });
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, true);
  const avail = await call(availabilityHandler, { method: "GET" });
  assert.equal(avail.status, 200);
  assert.ok(!avail.json.slots.includes(SLOT), "booked slot must vanish");
});

test("rebooking the same slot 409s (freebusy re-check)", async () => {
  assert.equal((await call(bookHandler, { body: booking() })).status, 200);
  const r = await call(bookHandler, { body: booking({ email: "other@example.com" }) });
  assert.equal(r.status, 409);
  assert.equal(r.json.error, "slot_taken");
});

test("concurrent fresh race: exactly one winner", async () => {
  const results = await Promise.all([
    call(bookHandler, { body: booking({ email: "a@example.com" }) }),
    call(bookHandler, { body: booking({ email: "b@example.com" }) }),
  ]);
  const codes = results.map((r) => r.status).sort();
  assert.deepEqual(codes, [200, 409]);
});

test("cancelled slot can be rebooked (revive path)", async () => {
  assert.equal((await call(bookHandler, { body: booking() })).status, 200);
  _cancel(slotEventId(Date.parse(SLOT), cfg.durationMin));
  const r = await call(bookHandler, { body: booking({ email: "second@example.com" }) });
  assert.equal(r.status, 200);
});

test("REGRESSION: concurrent revive race — etag CAS allows exactly one winner", async () => {
  // This was the critical QA finding: without If-Match, both racers'
  // updates landed (last-write-wins) and both got confirmations.
  assert.equal((await call(bookHandler, { body: booking() })).status, 200);
  _cancel(slotEventId(Date.parse(SLOT), cfg.durationMin));
  for (let round = 0; round < 5; round++) {
    const results = await Promise.all([
      call(bookHandler, { body: booking({ email: `x${round}@example.com` }) }),
      call(bookHandler, { body: booking({ email: `y${round}@example.com` }) }),
    ]);
    const codes = results.map((r) => r.status).sort();
    assert.deepEqual(codes, [200, 409], `round ${round}: got ${codes}`);
    _cancel(slotEventId(Date.parse(SLOT), cfg.durationMin));
  }
});

test("same-email concurrent revive race still has one winner", async () => {
  assert.equal((await call(bookHandler, { body: booking() })).status, 200);
  _cancel(slotEventId(Date.parse(SLOT), cfg.durationMin));
  const results = await Promise.all([
    call(bookHandler, { body: booking() }),
    call(bookHandler, { body: booking() }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
});

test("honeypot gets a fake 200 and books nothing", async () => {
  const r = await call(bookHandler, { body: booking({ start: SLOT2, website: "http://spam" }) });
  assert.equal(r.status, 200);
  const avail = await call(availabilityHandler, { method: "GET" });
  assert.ok(avail.json.slots.includes(SLOT2), "honeypot must not consume the slot");
});

test("validation: bad email, missing name, off-grid start, wrong method, junk tz", async () => {
  assert.equal((await call(bookHandler, { body: booking({ email: "not-an-email" }) })).status, 400);
  assert.equal((await call(bookHandler, { body: booking({ email: "a b@c.d\r\nBcc: x@y.z" }) })).status, 400);
  assert.equal((await call(bookHandler, { body: booking({ name: "  " }) })).status, 400);
  const offGrid = new Date(Date.parse(SLOT) + 61_000).toISOString();
  assert.equal((await call(bookHandler, { body: booking({ start: offGrid }) })).status, 400);
  assert.equal((await call(bookHandler, { method: "GET", body: booking() })).status, 405);
  // junk tz falls back to the business tz and still books
  assert.equal((await call(bookHandler, { body: booking({ tz: "<script>alert(1)</script>" }) })).status, 200);
});

test("oversized body → 413, malformed → 400", async () => {
  const huge = JSON.stringify(booking({ notes: "x".repeat(20 * 1024) }));
  assert.equal((await call(bookHandler, { body: huge })).status, 413);
  assert.equal((await call(bookHandler, { body: "{not json" })).status, 400);
});

test("readJson handles Vercel-parsed bodies and streams", async () => {
  assert.deepEqual(await readJson({ body: { a: 1 } }), { a: 1 });
  assert.deepEqual(await readJson({ body: '{"a":1}' }), { a: 1 });
  assert.equal(await readJson({ body: "z".repeat(17 * 1024) }), TOO_LARGE);

  const { EventEmitter } = await import("node:events");
  const streamReq = () => Object.assign(new EventEmitter(), { body: undefined });
  let req = streamReq();
  const p = readJson(req);
  req.emit("data", Buffer.from('{"b":'));
  req.emit("data", Buffer.from("2}"));
  req.emit("end");
  assert.deepEqual(await p, { b: 2 });

  req = streamReq();
  const pBig = readJson(req, 10);
  req.emit("data", Buffer.from("x".repeat(50)));
  req.emit("data", Buffer.from("y".repeat(50))); // past limit: drained, ignored
  req.emit("end");
  assert.equal(await pBig, TOO_LARGE);
});
