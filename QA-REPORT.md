# QA-REPORT — final gate, 2026-07-02

Independent QA agent ran the full gate against http://localhost:8471 (all 5 pages × 375/768/1440 ×
motion/reduced-motion — 30 combos). Raw findings lived in `_shots/qa-findings.md` (gitignored);
this is the adjudicated result after fixes.

| # | Gate item | Status |
|---|---|---|
| 1 | Zero pop-ups/modals; lead form inline, degrades to mailto without JS | **PASS** — 0 modal/dialog elements. Submit verified end-to-end: status line shows, `diagnosis_submit` tracked, mailto navigation carries all fields; no-JS forms keep `action="mailto:…"`. |
| 2 | Voice matches seeds; no invented numbers/testimonials; no lorem ipsum; claims single-sourced | **PASS (after fix)** — all visible claims injected from js/copy.js; testimonials are `[PENDING]` slots. Fixed during gate: decorative ticker line "— 0.3s" removed (read as an invented number). Parody props in The Line ("$99 WEBSITE" etc.) are aria-hidden set dressing, not claims. |
| 3 | Three signature sections read instantly AND work reduced-motion | **PASS (after fix)** — CRITICAL found and fixed: `.diag__fix path { stroke-dasharray: 5 5 }` collided with GSAP's draw-in, leaving the green "plan" strokes visible from the start of the pin. Dashed style now scoped to `html:not(.motion)`; draw-in verified hidden-early/drawn-late by screenshot. Also fixed: 375 settle-beat mid-card overlapping the section heading (slimmed card + heading at ≤480px). Static reduced-motion states verified for all three sections at all widths. |
| 4 | Flawless at 375/768/1440; keyboard navigable; alt text everywhere | **PASS (after fix)** — zero horizontal overflow in all 30 combos; skip-link first tab stop; logical tab order; one h1/page, ordered headings; all SVGs aria-hidden/labeled; all inputs labeled; :focus-visible styled. Fixed during gate: four diagram label pills widened so text no longer touches borders. |
| 5 | Analytics: Vercel WA + events; Meta Pixel commented with [META_PIXEL_ID]; all deferred | **PASS** — `window.va` shim + delegated `data-event` tracking (`cta_click`, `email_click`, `diagnosis_submit` — all observed firing); insights script deferred on every page; Pixel block commented on Home. |
| 6 | Fast: no render-blocking JS, fonts swap, lightweight | **PASS** — every script deferred (only inline JS is the ~130-byte class-swap FOUC guard); fonts `display=swap` + preconnect; single stylesheet; heaviest page ≈ 67KB local, entire local asset set ≈ 172KB excl. fonts/GSAP CDN. |
| 7 | Per-page meta/OG + og.png, favicon, sitemap, robots, 404 | **PASS (after fix)** — unique title/description/canonical/OG per indexable page; og.png 1200×630; favicon.svg + favicon-180.png; sitemap lists 4 pages; robots references sitemap; 404 is noindex. Fixed during gate: 404 now includes apple-touch-icon like the other pages. |
| 8 | Internal links | **PASS** — all internal hrefs/srcs across 5 pages resolve (10 unique URLs, all 200). |
| 9 | Console | **PASS** — zero JS errors in all 30 load combos. |
| 10 | GSAP CDN failure resilience (extra) | **PASS** — with cdnjs blocked, `motion` class strips and static states render fully. |

## Waived (with reason)
- **`/_vercel/insights/script.js` 404 on localhost** — the script only exists on Vercel; expected.
- **404.html has no canonical/OG tags** — page is `noindex`; social/search preview irrelevant.
- **Placeholders visible in repo** (`[FORM_ENDPOINT]`, `[BOOKING_URL]`, socials, `[META_PIXEL_ID]`,
  `[PENDING]` quotes) — intentional; behavior degrades gracefully until swapped (see README swap table).
- **Diagram fix-strokes are solid in motion but dashed in reduced-motion** — deliberate: the plan
  "solidifies" as it draws; dashes remain the static annotation style.

**Verdict: ship-ready.** No deploy-blocking items open.
