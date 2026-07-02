# HANDOFF.md — read this first if you're picking this project up cold

Written for the next Claude project (Charlie's social-media folder) and future-Charlie.

## What this is
Charlie Anderson's personal-brand site (charlieanderson.me). Charlie is a performance
marketer/operator — Anderson Marketing, Fairfield County CT, small team, 5–8 clients at a time
(the number lives in `js/copy.js`, don't hardcode it anywhere — including in social posts pulled
from this site; treat copy.js as the source of truth for every claim).

**The three objectives, in order (everything on the site serves these):**
1. **Book free diagnosis calls.** The one conversion: the lead form (on `/` and `/book/`).
   Every page funnels to it. No pop-ups, ever — that's a hard rule Charlie set.
2. **Make the positioning land viscerally.** Three pillars, each built as a designed scroll
   section on Home: *The Line* (cheap AI slop ↔ bloated agency, Charlie is the middle),
   *Diagnosis first* (doctor's-exam funnel scan), *Where AI helps / where it hurts*
   (machine side vs. human side — with the wink that AI helped build this very site).
3. **The site itself is the proof.** Design + motion quality = the portfolio piece.

## Voice (for anything you write on his behalf)
Direct, plain, a little blunt. Zero agency-speak. Short declaratives. He says "money in your
pocket", "systems that pay for themselves", "you work with me, not an intern". Read the three
pillar blocks on the Home page — that's him talking; match that rhythm. Never invent numbers
or testimonials; the only real numbers are in `js/copy.js` (Meal JOY launch: 3.33×, peak 4.43×
over 12 days, creative cut CPC to ~⅓ — cite from copy.js, and if they change there, they've
changed everywhere).

## How copy works (edit safely)
- `js/copy.js` — every number, claim, link, placeholder. Injected into `<span data-copy="...">` slots.
- Narrative sentences — inline in HTML between `<!-- COPY: name -->` markers, each block on exactly one page.
- `COPY.md` — the human-readable mirror of all of it. Update it when you edit either of the above.
- Without JS: stat blocks hide (numbers exist only in copy.js), forms fall back to `action="mailto:"`.
- Small edits: edit between the COPY markers only. Don't regenerate files.

## Design system (hold these rules)
- Direction: "The Ledger" — warm paper (#FAF7F0), ink (#16130E), ONE accent (#D64518),
  hairlines (#E4DDCE). Dark bands (#151210) for The Line, the lead form, footer, CTA bands.
- Type: **Fraunces** (display, italic for the accent word) + **Inter** (body) + system mono
  (labels/data). Never add a third webfont.
- Motifs: hand-drawn SVG underline = the "human touch" mark (hero cycle word, AI-split human side);
  mono instrument labels (hero meta strip, eyebrows); the dot-on-a-line brand mark (favicon, OG image).
- Motion: custom easings only (see `--ease-*` tokens in css/main.css). Reveals via
  IntersectionObserver + CSS. GSAP ScrollTrigger ONLY for the three Home sections.
  `prefers-reduced-motion` → everything static and settled (html gets no `motion` class; CSS
  `html:not(.motion)` rules define the fallback layouts). Animate transform/opacity/clip only.
- Accent discipline: the orange earns its moments — CTA fills, the marker dot, one italic word,
  diagnosis "free" kicker. Don't spread it.

## Analytics
Vercel Web Analytics (enable in dashboard after deploy). Custom events already wired:
`diagnosis_submit` (form success), `cta_click` (all CTAs, with labels), `email_click` (footer email).
Meta Pixel is a commented block in index.html waiting for `[META_PIXEL_ID]`.

## Open items (in priority order)
1. **`[FORM_ENDPOINT]`** in copy.js — until set, form submits fall back to opening the visitor's
   email app. Works, but set up Formspree/Basin early.
2. Testimonials — `[PENDING]` slots on `/` and `/work/` (one each). Real quotes only.
3. `[BOOKING_URL]`, `[LINKEDIN_URL]`, `[IG_URL]` in copy.js (linked elements stay hidden until set).
4. Meal JOY case-study narrative on /work/ is minimal and flagged **EDIT ME** in COPY.md —
   Charlie should confirm the "setup/system" wording (numbers are locked and correct).
5. **Image swaps:** the site currently uses zero raster images by design (SVG/CSS art only).
   Real photos would upgrade: (a) About — a photo of Charlie (gym/climbing/travel would fit the
   discipline/range sections), (b) Work — Meal JOY ad creative or dashboard screenshots (redact
   spend if needed), (c) a real headshot for an eventual OG refresh. When adding, treat them:
   duotone/warm to match the paper palette, and add `SWAP:` notes here.

## Ideas deliberately left out (don't re-add without thinking)
- WebGL/Three.js tier motion — wrong weight for this brand; GSAP scroll is the ceiling.
- Dark acid-green "Signal" direction (see comps/b.html) — executed well but reads tech-agency;
  skeptical local owners trust the warm editorial direction more (see DECISIONS.md D8).
- Blog/insights section — nothing to feed it yet; add only with a real publishing cadence.
- Live chat widgets, exit-intent modals, cookie banners (no cookies needed) — all conversion
  theater that contradicts the no-pop-ups rule.
- Case-study detail pages — one strong flagship beats three thin pages; expand /work/ only
  when there are 2+ full stories with numbers.

## Regenerating assets
- OG image: edit `assets/og.html`, then
  `node _tools/shot.js http://localhost:8471/assets/og.html assets/og --w=1200 --h=630`
  (_tools is gitignored; `cd _tools && npm i puppeteer-core` if missing).
- Screenshots for review: `_tools/shot.js` (same pattern, `--rm` for reduced-motion static states).
