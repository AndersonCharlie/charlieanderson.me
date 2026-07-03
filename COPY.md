# COPY.md — every word on the site, in one place

This file mirrors the live copy so you can review/edit words without digging through markup.

## How copy works (read this once)
- **Numbers, claims, links, placeholders** live in `js/copy.js` (ONE place). They're injected into
  `<span data-copy="stats.xxx">` slots at load. Edit `js/copy.js`, then update the tables below.
- **Narrative copy** (sentences/paragraphs) lives inline in each HTML file inside clearly marked
  `<!-- COPY: block-name -->` … `<!-- /COPY -->` comments. Each block exists on exactly one page.
  Edit the HTML between the markers, then update this file.
- **Exception (the only inline config):** the two lead forms' `action="mailto:charlie@charlieanderson.me"`
  is baked into `index.html` and `book/index.html` so the form still works without JavaScript.
  If the email ever changes: those 2 form actions + `config.EMAIL` in `js/copy.js`.
- Without JavaScript, stat blocks hide themselves (so no empty numbers show) and forms fall back to email.

## Swap table (all in `js/copy.js`)
| Key | Currently | Notes |
|---|---|---|
| `FORM_ENDPOINT` | FormSubmit → charlie@charlieanderson.me | **REAL.** First-ever submission triggers a one-time activation email — click its confirm link once. |
| `BOOKING_URL` | calendly.com/charlie-interviews | **REAL.** Shown in Book hero, under both forms. |
| `LINKEDIN_URL` | linkedin.com/in/charlie-anderson-957988286 | **REAL.** |
| `IG_URL` | `[IG_URL]` | Still placeholder — footer link hidden until swapped. |
| `EMAIL` | charlie@charlieanderson.me | (real) |

## Claims/stats table (all in `js/copy.js` → `stats`)
| Key | Value | Used on |
|---|---|---|
| `clientCount` | 5–8 | Home hero, The Line, Book FAQ |
| `mealjoyRoasRange` | 4–11× | Home proof strip, Work headline + stats, Book FAQ |
| `mealjoyRevenueMultiple` | 4× | Home proof strip, Work stats, Book FAQ |
| `mealjoyLaunchMultiple` | 3.33× | Work "receipts" line |
| `mealjoyLaunchSpend` | $2,717.66 | Work "receipts" line |
| `mealjoyLaunchReturn` | $9,063.31 | Work "receipts" line |
| `mealjoyPeakMultiple` | 4.43× | Work "receipts" line |
| `mealjoyPeakWindow` | 12-day | Work "receipts" line |
| `mealjoyCpcShort` | ~⅓ | Home proof strip, Work case study |

Testimonials: **LIVE** — real Sergio quotes (chef-owner, Meal JOY Foods) on `/` and `/work/`, transcribed verbatim from "Sergio Testimonial 2x Revenue.MOV". New testimonials: real quotes only.

---

# HOME (`index.html`)

Section order: hero → Diagnosis (pinned) → Podcast → There's a line (pinned) → AI split → Proof → About teaser → Lead form.

### COPY: hero
- Eyebrow: `Anderson Marketing · Fairfield County, CT`
- H1 (kinetic — the bracketed word cycles): `Your [ad spend / funnel / website / email list] should pay for itself.`
- Sub: `I'm Charlie Anderson. My small team builds the ads, funnels, email, and sites that grow
  local businesses — {clientCount} clients at a time, so you work with me, not an intern.`
- CTA: `Get your free diagnosis` · Secondary: `See the work`
- Meta strip (bottom of hero): `Fairfield County · 41.1°N 73.3°W` / `Ads · Funnels · Email · Sites` / `{clientCount} clients at a time`

### COPY: podcast  (sits between Diagnosis and The Line)
- Eyebrow: `The podcast — Redefining Limits`
- Heading: `The internet can't teach you everything.`
- Sub: `I've learned from some of the top performers in the world — and hosted podcasts with some of
  the top CEOs around. You're free to listen.`
- Episode cards (each links to its Spotify episode; thumbnails self-hosted in assets/podcast/):
  `Jeff Campbell — Ex-CEO, Burger King` / `Peter Russell — CEO, Santa Energy` /
  `Michael Tetreau — Serial entrepreneur · politician · Vistage chair`
- CTA: `All episodes on Spotify →`
- NOTE: the Spotify show URL lives in TWO places by design — inline here (works without JS) and
  `config.SPOTIFY_URL` in js/copy.js (feeds the footer links on all pages). Update both.

### COPY: the-line  (signature section 1 — Pillar 1)
- Heading: `There's a line.`
- Left zone (cheap/AI): `On one side: the crappy, cheap Fiverr-and-AI work that never quite gets results.`
  - Prop cards (set dressing, not claims): `$99 WEBSITE — DELIVERED FAST` / `500 AI POSTS — INSTANT` / `LOGO IN 24 HRS`
- Right zone (big agency): `On the other: the big agency that overcharges you on a retainer — where you
  end up working with the boss's assistant's intern, and still never see results.`
  - Prop cards: hand-off chain `Kickoff: the founder → Reassigned: account director → Reassigned: coordinator → Reassigned: the intern` + a retainer invoice card: `RETAINER — AUTO-RENEWS / $4,000/mo` (satirical set dressing; the figure was Charlie's explicit choice).
- Middle (the settle): label `The sweet middle spot.` + `My small team and I take {clientCount} clients
  at a time and work as personally — or as distant — as you'd like. One goal: money in your pocket,
  growing your business profitably through systems that pay for themselves.`
- Zone tags (set dressing): `The cheap end` / `The bloated end`; agency cards carry "↳ passed down" badges.
  - Chips: `{clientCount} clients at a time` / `personal or distant — your call` / `systems that pay for themselves`

### COPY: diagnosis  (signature section 2 — Pillar 2)
- Heading: `Diagnosis first. Like a doctor.`
- Body: `I don't just sell you a website or ads like most. I take a detailed look at your whole funnel —
  how everything actually works together — find the weak points, and build you a detailed plan to fix
  and grow the business.`
- Kicker: `The plan and the call are free. I only charge if you want my help implementing it.`
- Diagram labels (illustrative, not claims): nodes `TRAFFIC → WEBSITE → FOLLOW-UP → SALE`;
  weak-point tags `ads pointed at the homepage` / `no tracking` / `leads go cold`;
  fix tags `landing page matches the ad` / `tracking wired` / `follow-up that sells`.

### COPY: ai-split  (signature section 3 — Pillar 3)
- Heading: `Where AI helps. Where it hurts.`
- Machine side: `I use AI everywhere it speeds up the process — it helped code the site you're looking
  at right now.`
- Human side: `But I won't use it for your brand's front-facing work. That takes human creativity — and
  these days, you can tell. Human work is starting to stand out against the AI slop.`
- Kicker: `Use it where it helps. Not where it hurts.`
- Wink caption: `This page: AI on the grunt work. Human on every word.`

### COPY: proof
- Heading: `Proof, not promises.`
- Stat cards: `{mealjoyRoasRange} average ROAS on Meta ads, week over week` /
  `{mealjoyRevenueMultiple} the client's revenue, multiplied since we started` /
  `{mealjoyCpcShort} the cost-per-click after new creative`
- Attribution: `Meal JOY — local meal-prep. Full breakdown →` (links /work/)
- Quote (REAL — transcribed from Sergio's video testimonial in Charlie's files):
  `"The numbers speak for themselves since he's come on board — our numbers have more than doubled.
  Nothing but great things to say about Charlie." — Sergio, chef-owner, Meal JOY Foods`
  (Work page uses a second verbatim line from the same video. Source: "Sergio Testimonial 2x Revenue.MOV")

### COPY: about-teaser
Roles line: `Founder · University student · Boxer · Rock climber · Skier`
`…and I happen to build systems that make you money without lifting your finger. But I'd rather show
you a working funnel than a slide deck.` → `More about me →`

### COPY: lead  (also the model for /book/)
- Heading: `Get a free diagnosis.`
- Sub: `Tell me what's not working. I'll take a real look at your funnel — ads, site, follow-up, all of
  it — and walk you through the plan on a free call. If I don't think I can help, I'll tell you that too.`
- Fields: Name / Email / Business name / Website URL / Social links (optional) / `What's not working? (1–2 sentences)`
- Button: `Send it — book my free diagnosis`
- Under-note: `No retainer pitch. No pressure. The plan is yours either way.`
- Eyebrow: `The line ends here` (accent — the dot from "There's a line" scrubs in and settles on the section's top rule)
- "What you get" checklist (left column, hand-drawn checks): `Your whole funnel examined — traffic, site,
  follow-up, sale` / `A written plan you keep, either way` / `A free call to walk through it — from me, not a bot`
- Beside checklist: `Rather just talk? Book the call directly →` (→ {BOOKING_URL})
- Form fields carry mono ledger numbers 01–06 (CSS counters — shared with /book/)

---

# WORK (`work/index.html`)

### COPY: work-hero
- H1: `The work.` — Sub: `Fewer clients, deeper work. Here's what that looks like.`

### COPY: case-mealjoy  *(EDIT ME: Charlie — confirm the narrative details; numbers are locked in copy.js)*
- Label: `Flagship case study — Meal JOY · local meal-prep`
- H2: `Ad spend in. {mealjoyRoasRange} out.`
- Stats: `{mealjoyRoasRange} average ROAS on Meta ads, week over week` / `{mealjoyRevenueMultiple} the
  business's revenue, multiplied since we started` / `{mealjoyCpcShort} cost-per-click after new creative`
- Receipts line: `Show-your-work receipts from the launch month: {mealjoyLaunchSpend} in →
  {mealjoyLaunchReturn} out ({mealjoyLaunchMultiple}), peaking at {mealjoyPeakMultiple} across a
  {mealjoyPeakWindow} sprint.`
- The setup: `A local meal-prep company launching paid acquisition. The job: turn ad spend into first
  orders without torching margin.`
- The system: `Paid social into a first-order funnel, with creative tested and replaced as the numbers
  came in.`
- The numbers: `{mealjoyLaunchSpend} in → {mealjoyLaunchReturn} out — a {mealjoyLaunchMultiple} return on
  the launch.` / `{mealjoyPeakMultiple} at peak, across the best {mealjoyPeakWindow} sprint.` /
  `New creative dropped cost-per-click to {mealjoyCpcShort} of where it started.`
- Quote: Sergio verbatim (see proof section note) — the "takes the initiative" line.

### COPY: card-mcgittigan
`Jim McGittigan — ex-Gartner analyst.` / `Website build: a clean, credible home for a former Gartner
analyst's advisory practice.` / status line: `In build — numbers published when they're real`

### COPY: card-vividcottage
`Vivid Cottage — local art business.` / `Email automations: follow-up that turns past buyers into
repeat ones.` / status line: `In build — numbers published when they're real`

### COPY: work-range
- Eyebrow: `The range so far` · Heading: `Different businesses. Same four gears.`
- Ledger rows: `01 Pest control company — SEO + website` / `02 NYC flooring company — custom lead-gen
  software build` / `03 Relationship-counseling brand — full-funnel launch, alongside a large team` /
  `04 Career-development offer — full-funnel setup` / `05 Seven-figure companies — consulting, names
  withheld` / `06 Local practices of all stripes — consultations and funnel diagnoses`

### COPY: work-cta
`Want numbers like these with your name on them?` / `Start where every one of these projects started: a
free diagnosis of your whole funnel.` / button `Get your free diagnosis` (→ /book/)

---

# ABOUT (`about/index.html`)

### COPY: about-story
- H1: `I like results.`
- `I'm Charlie Anderson. I started this little marketing business as a sophomore in high school, and
  it's been quite the few adventures since — a real team, real systems, a short client list on purpose,
  and work that's taken us around the world.`
- `Where this is going: a firm known for one thing — systems that pay for themselves. Plain and simple:
  your business makes more money than it pays me, or I haven't done my job.`

### COPY: about-discipline
- Eyebrow: `01 — Off the clock` · Heading: `Not your average marketing nerd.`
- `Gym every day — boxing, climbing, skiing when there's snow. I'm not the guy who sits behind a screen
  all day; I like being outside, competing, and hanging out with good people. Point is: I'm a normal guy
  you'll actually enjoy working with — who happens to be serious about what he does.`
- Chips: `Daily gym` / `Boxer` / `Climber` / `Skier` / `Marathon in training`
- Photo: ski selfie, AirDropped 102_0548 (assets/about-ski.jpg) · caption `Between runs`

### COPY: about-adventure
- Eyebrow: `02 — The range` · Heading: `Spain. Italy. Texas. Your numbers won't notice.`
- `The work has taken me — and the team — around the world: Spain, Italy, Nevada, Texas, and counting. The systems don't care where I sit — the ads
  run, the follow-up sends, the dashboards update, and you can reach me the same way you always do.
  That's the whole point of building systems instead of selling hours.`
- Photo: Charlie + the team, city night (IMG_2084 → assets/about-range.jpg) · caption `Somewhere without signal`

### Terrain strips (full-bleed parallax dividers, About only)
- After band 01: assets/terrain-winter.jpg (AirDropped IMG_5746) · tag `Somewhere in Montana`
- Before band 04: assets/terrain-valley.jpg (AirDropped IMG_8300) · tag `Worth the climb`
- Spares Charlie provided, unused for now: IMG_5744 (portrait ski action), IMG_8333 (seated overlook).

### COPY: about-team
- Eyebrow: `03 — The team` · Heading: `Small team. No interns.`
- Intro: `I run point on strategy, paid ads, and the funnel. Micah and Thomas cover the ground I don't —
  so between us there's no hand-off chain, no account manager, no intern. And when a build needs more —
  video editing, videography — I bring in people I trust, only for as long as the work needs them.`
- Cards: `Charlie — Strategy, paid ads, funnels, email. Your point of contact — always.` (photo) /
  `Micah — Website conversion and social media. Makes the traffic do something.` /
  `Thomas — SEO, optimization, and fine-tuning. The compounding, unglamorous wins.` /
  `The bench — Video editing, videography, and specialists on call — only when your build needs them.`

### COPY: about-standard
- Eyebrow: `04 — The standard` · Heading: `Done properly, or not at all.`
- `Everything I do runs on one principle: quality. The training, the travel, the client work — if it's
  worth doing, it's worth doing properly. A $25 gig worker gets paid the second the task is marked
  complete, whether it worked or not. I get paid when it works — when your numbers move.`
  (hand underline on "when your numbers move.")
- Photo: beanie ridge shot, AirDropped 102_0471 (assets/about-warning.jpg) · caption `Comes with the standard`

### COPY: about-cta
`Let's see what your numbers could look like.` / `The diagnosis is free: your whole funnel, the
weak points, and a written plan. You keep the plan either way.` / button `Get your free diagnosis`

---

# BOOK (`book/index.html`)

### COPY: book-hero
- H1: `The free diagnosis.`
- `You bring the business. I take a detailed look at the whole funnel — traffic, site, follow-up,
  sale — find where it leaks, and hand you a written plan to fix and grow it. We walk through it on a
  free call. You keep the plan either way. I only charge if you want my help implementing it.`
- Direct link: `Skip ahead — book the call directly` (→ {BOOKING_URL})
### COPY: book-form
- Heading: `Tell me about the business.` · Sub: `Two minutes of your time. I read every one of these myself.`
- Same fields as Home lead form. Button: `Book my free diagnosis`.
- If `BOOKING_URL` set: `Or grab a time directly →` (hidden while placeholder)

### COPY: book-faq
1. `Can you actually deliver?` → `Fair question. The account I run on Meta averages {mealjoyRoasRange}
   ROAS week over week, and the business's revenue is up {mealjoyRevenueMultiple} since we started. But
   you don't have to take numbers on faith: the diagnosis is free, and you see the full plan before you
   pay for anything.`
2. `Is this just another marketer?` → `Most marketers sell you a deliverable and disappear. I diagnose
   first, and my team takes {clientCount} clients at a time — so nothing about your business gets handed
   down to an intern. If the plan doesn't convince you, don't hire me. You keep the plan.`
3. `Will this work in MY market?` → `That's exactly what the diagnosis finds out. Every local business
   runs on the same four gears — traffic, site, follow-up, sale. What changes is where yours leak. If I
   look and don't believe I can move your numbers, I'll tell you that on the call.`
4. `Is this worth the risk?` → `The call is free and the plan is yours to keep, so the only thing you
   risk is the time it takes to talk to me. The paid part — implementation — only happens if you decide
   the plan is worth it.`

---

# SHARED

- Nav: AM. monogram · `Work` / `About` / CTA button `Free diagnosis` (→ /book/)
- Footer: `Anderson Marketing LLC — Fairfield County, CT` · email link (charlie@charlieanderson.me) ·
  `Podcast` (→ Spotify show) · LinkedIn + Instagram (hidden until URLs swapped) ·
  `Built by hand — AI on the grunt work.`
- 404: `This page doesn't convert. It doesn't even exist.` / `Broken links happen — that's exactly the
  kind of leak a diagnosis catches.` / `Back home` / `Turn the detour into a free diagnosis`
