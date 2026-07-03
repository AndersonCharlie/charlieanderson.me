// Booking confirmation email — built as raw MIME and sent via the Gmail API
// from the same account that owns the calendar. Palette mirrors the site
// ("The Ledger": paper/ink/one accent); email clients get inline styles.

import { formatRange } from "./time.js";
import { gmailSend } from "./google.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function b64url(str) {
  return Buffer.from(str, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// RFC 2047 so names/subjects survive any charset handling.
const encWord = (s) => `=?UTF-8?B?${Buffer.from(s, "utf-8").toString("base64")}?=`;

export function buildConfirmation({ cfg, name, email, startMs, endMs, visitorTz }) {
  const whenVisitor = formatRange(startMs, endMs, visitorTz);
  const whenET = visitorTz === cfg.tz ? null : formatRange(startMs, endMs, cfg.tz);
  const zoomBlock = cfg.zoomUrl
    ? `<p style="margin:24px 0;">
         <a href="${esc(cfg.zoomUrl)}"
            style="display:inline-block;background:#D64518;color:#FAF7F0;text-decoration:none;
                   padding:12px 22px;border-radius:999px;font-weight:600;">Join on Zoom</a></p>
       <p style="margin:0 0 6px;color:#6B6456;font-size:13px;">Zoom link: <a href="${esc(cfg.zoomUrl)}" style="color:#D64518;">${esc(cfg.zoomUrl)}</a></p>`
    : `<p style="margin:24px 0;">I'll send the call link before we talk.</p>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FAF7F0;">
<div style="max-width:560px;margin:0 auto;padding:36px 24px;background:#FAF7F0;color:#16130E;
            font-family:Georgia,'Times New Roman',serif;">
  <p style="font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.14em;
            text-transform:uppercase;color:#6B6456;margin:0 0 18px;">Booking confirmed</p>
  <h1 style="font-size:26px;font-weight:600;margin:0 0 16px;">You're booked, ${esc(name)}.</h1>
  <p style="margin:0 0 8px;font-size:16px;line-height:1.5;"><strong>${esc(cfg.meetingType)}</strong></p>
  <p style="margin:0 0 4px;font-size:16px;line-height:1.5;">${esc(whenVisitor)}</p>
  ${whenET ? `<p style="margin:0 0 4px;color:#6B6456;font-size:13px;">(${esc(whenET)} Eastern)</p>` : ""}
  ${zoomBlock}
  <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">A calendar invite is on its way too.
  Need to move it? Just reply to this email.</p>
  <hr style="border:none;border-top:1px solid #E4DDCE;margin:28px 0;">
  <p style="margin:0;font-size:14px;color:#6B6456;">Charlie Anderson — Anderson Marketing<br>
  <a href="https://charlieanderson.me" style="color:#D64518;">charlieanderson.me</a></p>
</div></body></html>`;

  const subject = `Booked: ${cfg.meetingType} — ${whenVisitor}`;
  const mime = [
    `From: ${encWord(cfg.fromName)} <${cfg.confirmFrom}>`,
    `To: ${encWord(name)} <${email}>`,
    `Subject: ${encWord(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html, "utf-8").toString("base64"),
  ].join("\r\n");

  return b64url(mime);
}

// Best-effort: a failed email must not fail a successful booking.
export async function sendConfirmation(args) {
  try {
    await gmailSend(buildConfirmation(args));
    return true;
  } catch (err) {
    console.error("confirmation email failed:", err.message);
    return false;
  }
}
