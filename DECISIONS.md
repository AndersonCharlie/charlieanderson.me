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
