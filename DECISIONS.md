# DECISIONS

## Build plan (fixed before execution)
1. Scaffold + git. Preserve pre-existing June 17 single-file draft in `_legacy/` (not deleted; superseded).
2. Copy system: narrative copy lives inline in HTML inside `<!-- COPY: name -->` blocks (each block on exactly one page). All numbers/claims/config ([FORM_ENDPOINT] etc.) live once in `js/copy.js`, injected into `[data-copy]` slots. `COPY.md` mirrors everything with pointers.
3. Two hero art-direction comps built by parallel subagents: A "Ledger" (warm paper, editorial serif, orange-red accent) vs B "Signal" (near-black, grotesque, acid accent). Score: skeptical-owner trust + motion quality. Pick one, log it.
4. Build Home: hero (kinetic type) → 3 signature sections (The Line / Diagnosis / AI Split) → proof strip → about teaser → diagnosis form. GSAP+ScrollTrigger (CDN, deferred) only for the 3 signature sections; IntersectionObserver+CSS everywhere else. Critique via Chrome headless screenshots (1440/768/375, `--force-prefers-reduced-motion` for full-layout states). Max 2 loops.
5. Work / About / Book / 404 reuse the system, one loop each.
6. Assets: inline SVG CA monogram (geometric, no font dependency), og.png via headless screenshot of og.html, sitemap, robots.
7. QA subagent runs the gate → QA-REPORT.md. I fix criticals only.
8. Docs (README, HANDOFF, COPY) + final commit. No deploy.
Milestone commits: scaffold/copy → direction → home → pages → QA/docs.

## Decision log
- D1: Existing ~/charlieanderson-site/index.html (June 17 Swiss-minimal draft) moved to `_legacy/2026-06-17-single-file-draft.html`. New build replaces it per spec; kept for copy reference.
- D2: Form no-JS fallback = HTML `action="mailto:charlie@charlieanderson.me"`; JS upgrades to fetch POST → [FORM_ENDPOINT] from copy.js. Endpoint therefore defined exactly once.
- D3: Stats (3.33×, 4.43×, ⅓ CPC, 5–8 clients, $ figures) injected from copy.js so they can appear on Home + Work while existing in one spot. No-JS shows neutral fallback text baked into the span, marked in COPY.md.
- D4: Screenshots via Chrome headless (installed) instead of Playwright install — zero setup cost; reduced-motion flag doubles as fallback-state verification.
- D5: No invented figures anywhere: agency-side "retainer invoice" in The Line uses redacted bars, not dollar amounts.
- D6: No-JS behavior: `<html class="no-js">` swapped to `js` inline. Stat blocks hide under `.no-js` (rather than showing empty/duplicated numbers); forms keep mailto action. Keeps every number defined exactly once in copy.js.
- D7: Case-study narrative (Meal JOY setup/system) written minimally and flagged "EDIT ME" in COPY.md — details need Charlie's confirmation; numbers locked in copy.js.
- D8: Direction A "Ledger" wins (warm paper, Fraunces + Inter, #D64518 accent). Scored on skeptical-owner trust: A reads human/premium; B (dark + acid) executed well but reads "tech agency" — wrong shelf for local owners, and clashes with the anti-AI-slop pillar. Stolen from B: mono 01/04 counter on the hero cycling word, earned-accent discipline. Comps kept in comps/ for reference.
- D9: Hand-drawn SVG underline = recurring "human touch" motif (hero cycle word, AI-split human side). Hero scroll cue replaced by an instrument-style metadata strip (location / scope / capacity).

## Revision round — 2026-07-02 (Charlie's pre-launch edits)
- D10: Logo → "AM." monogram (Anderson Marketing LLC); the accent period doubles as the brand dot-on-the-line. Footer says "Anderson Marketing LLC".
- D11: Form endpoint → FormSubmit AJAX (free, no account) delivering to charlie@charlieanderson.me; honeypot + fixed subject added. First-ever submission requires one-click email activation. Mailto path remains the JS-failure fallback.
- D12: Headline proof updated per Charlie: 4–11× average Meta ROAS + 4× revenue (Meal JOY). Launch-month figures (3.33×, $2,717.66→$9,063.31, 4.43× peak) kept as a "show-your-work receipts" line on /work/ only. All in copy.js.
- D13: Calendly (calendly.com/charlie-interviews) linked from Book hero + under both forms; kept as links, not an embed — embeds load ~1MB of third-party JS and fight the design system. The form stays the primary path (it feeds the diagnosis).
- D14: Headshot: Downloads/Images/pfp.jpg → assets/charlie.jpg (480px, warm grayscale CSS filter to sit in the paper palette). Used on About hero + team card.
- D15: Team section on About (03 — The team): Charlie / Micah (conversion, social) / Thomas (SEO, tuning) / "the bench" (on-call specialists). Work page gains "The range so far" ledger list (pest control, NYC flooring, counseling funnel, consultations) — no invented results attached.
- D16: Deploy target → GitHub Pages (gh CLI already authenticated; free, autonomous). Vercel remains documented as the analytics-enabled alternative.
