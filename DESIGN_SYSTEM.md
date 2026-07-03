# DESIGN_SYSTEM.md — Anderson Marketing / charlieanderson.me

Written for whoever is building the booking page (or any new page). Read this alongside HANDOFF.md.
All CSS references are to `css/main.css` unless stated otherwise.

---

## 1. Design Tokens

### Color palette (all defined as CSS custom properties in `:root`, main.css:11)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FAF7F0` | Page background, light-band bg, selection fg |
| `--ink` | `#16130E` | Primary text, borders, btn fill |
| `--ink-soft` | `#3B362C` | Secondary body text (lede, .lede, .page-hero .lede) |
| `--muted` | `#6E6759` | Tertiary text, stat labels, eyebrows, placeholders |
| `--hair` | `#E4DDCE` | Hairline borders (section dividers, card borders, form underline base) |
| `--accent` | `#D64518` | The one accent: CTA fills, italic accent word, underline motif, stat digits, quote bar |
| `--dark-bg` | `#151210` | Dark-band sections: lead form, footer, cta-band, sig-line |
| `--dark-type` | `#F2EDE3` | Text on dark bands |
| `--dark-muted` | `#9C947F` | Secondary text on dark bands, form labels |
| `--dark-hair` | `#2B261E` | Borders on dark bands |
| `--dark-accent` | `#F0552A` | Accent on dark bands (slightly brighter than `--accent`) |
| `--diag-weak` | `#C3352B` | Diagnostic SVG: weak-point labels/borders |
| `--diag-fix` | `#1E7A46` | Diagnostic SVG: fix labels/borders |

No other colors appear in the system. Never introduce a new color.

### Spacing scale

| Token | Value | Usage |
|---|---|---|
| `--wrap` | `1120px` | Max content width |
| `--gut` | `clamp(20px, 4vw, 44px)` | Horizontal padding (used by `.wrap` and `padding-inline`) |
| `--sect` | `clamp(88px, 14vh, 160px)` | Section vertical padding (`padding-block: var(--sect)`) |

The three spacing custom properties are the entire spacing scale. For inner component spacing use literal px values (the codebase uses 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 34 px as the informal fine grid).

### Border-radius values in use

| Value | Where |
|---|---|
| `6px` | prop-card, prop-card-pass badge, form field backgrounds |
| `12px` | mid-card |
| `14px` | pod-card, work-card, team-card |
| `16px` | portrait image |
| `999px` | All buttons (pill shape) |

### Shadow / hairline treatments

- **Hairline border**: `1px solid var(--hair)` — section tops (proof, pod, about-band, range-band), card borders (pod-card, work-card, team-card). On dark sections: `1px solid var(--dark-hair)`.
- **Stat rule sweep-in**: `2px solid var(--ink)` top border on `.stat` — drawn in with a scaleX animation; JS adds `is-in` class (main.css:619).
- **Card box-shadow**: `.mid-card` only — `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--hair)` (main.css:384).
- **Portrait shadow**: `0 22px 54px rgba(22, 19, 14, 0.16)` (main.css:865).
- **Quote bar**: `border-left: 3px solid var(--accent)` on `.quote` (main.css:638).
- **Team-card hover lift**: `transform: translateY(-3px)` only — no box-shadow.
- **Focus ring**: `2px solid var(--accent)` with `outline-offset: 3px; border-radius: 2px` (main.css:60).
- **Nav solid state**: `box-shadow: 0 1px 0 var(--hair)` (main.css:174).

### CSS custom easing functions (main.css:32)

| Token | Value | Personality |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Fast settle — used for most reveals and hovers |
| `--ease-io` | `cubic-bezier(0.65, 0, 0.35, 1)` | Slow start, slow end — used for form underlines, paper wipes |
| `--ease-snap` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot/spring — scoreboard digits, cycling word enter |

Use ONLY these three easings. Never write raw timing-function values.

---

## 2. Typography

### Typefaces (main.css:28)

```
--font-display: "Fraunces", Georgia, "Times New Roman", serif
--font-body:    "Inter", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif
--font-mono:    ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace
```

**Hard rule: never add a third webfont.** Only Fraunces and Inter are loaded from Google Fonts.

### Type role assignments

| Element / class | Face | Weight | Size | Notes |
|---|---|---|---|---|
| `h1`, `h2`, `.display` | Fraunces | 460 (var weight) | h1: `clamp(2.7rem, 8.2vw, 6.2rem)` hero; `clamp(2.8rem, 7vw, 5.4rem)` subpage. h2: `clamp(2rem, 4.6vw, 3.4rem)` | `font-variation-settings: "opsz" 100`; `line-height: 1.04`; `letter-spacing: -0.015em` |
| `body`, `p`, `a` | Inter | 400 | `1.0625rem` base | `line-height: 1.65` |
| `.eyebrow` | system mono | — | `0.78rem` (mobile: `0.72rem`) | `letter-spacing: 0.14em`; `text-transform: uppercase`; `color: var(--muted)` |
| `.hero__meta` | system mono | — | `0.72rem` | `letter-spacing: 0.1em`; `text-transform: uppercase`; `color: var(--muted)` |
| Form labels (`.form-fields label`) | system mono | — | `0.75rem` | `letter-spacing: 0.1em`; `text-transform: uppercase`; `color: var(--dark-muted)` |
| `.case__label`, `.case__block h3` | system mono | 500 / 500 | `0.75rem` / `0.78rem` | `letter-spacing: 0.14em`; `text-transform: uppercase` |
| `.stat__big` | Fraunces | — | `clamp(2.6rem, 5.4vw, 4.2rem)` | `color: var(--accent)`; `font-variant-numeric: tabular-nums`; `line-height: 1` |
| `.quote blockquote` | Fraunces | — | `clamp(1.2rem, 2.2vw, 1.6rem)` | `line-height: 1.35` |
| `.quote__attr` | system mono | — | `0.75rem` | `letter-spacing: 0.08em`; `color: var(--muted)` |
| `.pod-card__name` | Fraunces | 480 | `1.2rem` | |
| `.pod-card__role`, `.pod-card__listen` | system mono | — | `0.72rem` | `letter-spacing: 0.08em / 0.06em`; uppercase |
| `.pane-label` | system mono | — | `0.75rem` | `letter-spacing: 0.16em`; `text-transform: uppercase` |
| `.faq summary` | Fraunces | — | `clamp(1.25rem, 2.4vw, 1.7rem)` | |
| `.btn` | Inter | 600 | `0.98rem` | |
| `.footer__wink` | system mono | — | `0.72rem` | `letter-spacing: 0.06em` |
| `b`, `strong` | (inherit face) | 600 | — | |

### Italic accent word pattern

The distinctive "italic accent word" is an `<em>` inside `h1` or `h2`, combined with the `.accent` color class and typically wrapped in `.u-h1w` to carry the hand-drawn underline SVG:

```html
<h1>I like <em class="accent u-h1w">scoreboards.
  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
    <path d="M3,8 Q45,3 90,7 T197,5"/>
  </svg>
</em></h1>
```

The cycling hero word uses a different path: `<em class="cycle">` inside `.cycle-wrap` with `.cycle-under` SVG (see Section 3).

### Eyebrow label style

```html
<p class="eyebrow">Anderson Marketing · Fairfield County, CT</p>
```

On dark sections, `.is-dark .eyebrow` changes to `color: var(--dark-muted)` (main.css:141).

### Mono label / data style

Used for: hero meta strip, form labels, case labels, section counters (`01 —`), stat attributes, pod-card roles. Always system mono, always uppercase with generous letter-spacing. Never use Fraunces or Inter for these roles.

---

## 3. Components

### 3.1 Buttons

**Base button** (main.css:94):
```html
<a class="btn" href="/book/">Free diagnosis</a>
```
- Pill shape (`border-radius: 999px`), `border: 1.5px solid var(--ink)`
- Hover: accent fill sweeps up from bottom (`::before` translateY animation), text turns `--paper`
- `padding: 16px 26px`; `font-weight: 600`; `font-size: 0.98rem`

**Variants:**

| Class | Appearance | Usage |
|---|---|---|
| `.btn--primary` | Ink fill by default (dark button on paper bg) | Hero CTA, form submit |
| `.btn--nav` | Transparent, smaller padding (`13px 20px`, `0.9rem`) | Nav CTA |
| `.btn--submit` | `--dark-accent` fill, `--dark-bg` text — for use inside `.lead` dark band | Form submit button |
| `.btn--submit.is-busy` | `opacity: 0.6; pointer-events: none` | JS adds while request in flight |

On dark bands (`.cta-band`, `.lead`), the base `.btn` is overridden:
```css
.cta-band .btn { background: var(--dark-accent); border-color: var(--dark-accent); color: var(--dark-bg); }
.cta-band .btn::before { background: var(--paper); }
```

**Link arrow** (main.css:120):
```html
<a class="link-arrow" href="/work/">See the work</a>
```
`border-bottom: 2px solid var(--accent)` + CSS `::after` arrow that slides right on hover. Used for secondary CTAs and inline links.

**Current-page nav state:** `aria-current="page"` on `.btn--nav` triggers `background: var(--ink); color: var(--paper)` (main.css:196). On `.nav__links a`, it draws the accent underline persistently (main.css:195).

### 3.2 Form inputs / labels — the lead form pattern

This is the model for the booking form. Defined at main.css:716. Lives inside `.lead` (dark band).

**Outer structure:**
```html
<section class="lead" aria-label="...">
  <div class="wrap">
    <h2>...</h2>
    <p class="lead__sub" data-reveal>...</p>
    <form data-lead-form action="mailto:charlie@charlieanderson.me"
          method="post" enctype="text/plain" data-reveal>
      <!-- honeypot (required for FormSubmit spam protection) -->
      <input type="hidden" name="_subject" value="...">
      <input type="text" name="_honey" tabindex="-1" autocomplete="off"
             aria-hidden="true" style="position:absolute;left:-9999px">
      <div class="form-fields" data-reveal-group>
        <!-- fields here -->
      </div>
      <button class="btn btn--primary btn--submit" type="submit">Submit</button>
      <p class="form-status" hidden aria-live="polite"></p>
      <p class="form-note">Under-button copy.</p>
    </form>
    <!-- optional Calendly direct-link (hidden when BOOKING_URL is placeholder) -->
    <p class="book-alt" data-optional>
      <a class="link-arrow" data-copy-href="config.BOOKING_URL" href="#">Or grab a time directly</a>
    </p>
  </div>
</section>
```

**Field markup pattern** (main.css:720):
```html
<!-- standard field -->
<label data-reveal>
  Field name
  <input name="fieldname" required autocomplete="...">
</label>

<!-- optional field -->
<label data-reveal>
  <span>Field name <span class="opt">(optional)</span></span>
  <input type="url" name="fieldname" placeholder="https://">
</label>

<!-- full-width textarea (grid-column: 1 / -1) -->
<label class="field--full" data-reveal>
  <span>Label <span class="opt">(1–2 sentences)</span></span>
  <textarea name="fieldname" rows="3" maxlength="400" required></textarea>
</label>
```

**Input styling** (main.css:730):
- No border, no background box — only a bottom hairline using layered gradient backgrounds
- Resting: `--dark-hair` 1.5px underline
- Focus: `--dark-accent` line draws in from left (`background-size` transition with `--ease-io`)
- `font-family: var(--font-body); font-size: 1.05rem; color: var(--dark-type)`
- Label color transitions to `var(--dark-type)` on `:focus-within`

**Grid layout**: `.form-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; }` — collapses to 1-column at 640px.

**Form status states** (main.css:755):
- Success: `.form-status--ok { color: #7FC99A; }` (green, dark-bg context)
- Error: default `.form-status { color: #F08070; }` (red-orange)

**JS behavior** (`data-lead-form`, main.js:155): fetch POST to `COPY.config.FORM_ENDPOINT`; if endpoint is placeholder, opens mailto. On success hides `.form-fields` and the submit button, shows success message. On failure shows inline error with direct email link.

### 3.3 Cards and panels

**Work card** (main.css:837):
```html
<article class="work-card" data-reveal>
  <h3>Title</h3>
  <p>Description</p>
</article>
```
`border: 1px solid var(--hair); border-radius: 14px; padding: clamp(24px, 3vw, 40px)`
Hover: `border-color: var(--ink)`. Grid of 2 columns (1 on mobile).

**Team card** (main.css:876):
```html
<article class="team-card" data-reveal>
  <img class="team-card__photo" ...> <!-- or <span class="team-card__initial"> -->
  <h3>Name</h3>
  <p>Role description</p>
</article>
```
`border: 1px solid var(--hair); border-radius: 14px`. Grid of 4 (→ 2 → 1). `.team-card--bench` uses `border-style: dashed`.

**Pod card** (main.css:662):
```html
<a class="pod-card" data-reveal href="...">
  <span class="pod-card__thumb"><img ...></span>
  <span class="pod-card__body">
    <span class="pod-card__name">Name</span>
    <span class="pod-card__role">Role</span>
    <span class="pod-card__listen">Listen →</span>
  </span>
</a>
```
`border: 1px solid var(--hair); border-radius: 14px`. Grid of 3 (→ 1 on mobile). Paper-wipe reveal animation on `pod-card__thumb`.

**Stat card** (main.css:608):
```html
<div class="stat" data-reveal>
  <p class="stat__big" data-copy="stats.keyName"></p>
  <p class="stat__label">Description text</p>
</div>
```
Top border sweeps in (JS-driven). Digits roll up via `.ch` span mechanism in main.js.

**Mid-card** (inside dark band, main.css:379): white card on dark background, `border-radius: 12px`, heavy drop shadow.

**Chip** (main.css:394):
```html
<span class="chip">label text</span>
```
`font-family: var(--font-mono); border: 1px solid var(--hair); border-radius: 999px; padding: 6px 12px`. First chip in a group gets accent border + color.

**Quote block** (main.css:636):
```html
<figure class="quote" data-reveal>
  <blockquote>"Quote text."</blockquote>
  <figcaption class="quote__attr">— Attribution</figcaption>
</figure>
```

**FAQ accordion** (main.css:897): uses native `<details>/<summary>`. Summary uses Fraunces; `::after` is a `+` that rotates 45° when open.

### 3.4 Dark bands

Three types, all share `background: var(--dark-bg); color: var(--dark-type)`:

| Class | Context |
|---|---|
| `.sig-line` | Home "The Line" section |
| `.lead` | Lead form section (Home + /book/) |
| `.cta-band` | CTA band on /work/ and /about/ |
| `.footer` | Footer on all pages |
| `.is-dark` | Generic utility for dark-band text overrides |

**CTA band pattern** (reused on Work and About):
```html
<section class="cta-band">
  <div class="wrap">
    <h2>...</h2>
    <p>Sub text.</p>
    <a class="btn" href="/book/" data-event="cta_click" data-event-label="...">CTA text</a>
  </div>
</section>
```

### 3.5 The `.wrap` layout container

```css
.wrap { max-width: var(--wrap); margin-inline: auto; padding-inline: var(--gut); }
```

Every page section's content lives inside `<div class="wrap">`. Never nest `.wrap` inside `.wrap`.

### 3.6 Nav (shared header)

Exact markup, copied verbatim into every page (copy the block from book/index.html:36–53):
```html
<header class="nav">
  <div class="nav__inner">
    <a class="nav__mark" href="/" aria-label="Charlie Anderson — home">
      <svg width="38" height="30" viewBox="0 0 38 30" fill="none" aria-hidden="true">
        <path d="M2.5 23 L8.5 7 L14.5 23" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.2 17.6 L11.8 17.6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M19 23 L19 7 L25 16.5 L31 7 L31 23" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="35.4" cy="21.6" r="2.1"/>
      </svg>
    </a>
    <nav class="nav__links" aria-label="Primary">
      <a href="/work/">Work</a>
      <a href="/about/">About</a>
    </nav>
    <a class="btn btn--nav" href="/book/" data-event="cta_click" data-event-label="nav">Free diagnosis</a>
  </div>
</header>
```

On the current page: add `aria-current="page"` to the matching nav link (or to `.btn--nav` if it's the /book/ page). JS handles the scroll-hide/solid behavior automatically.

### 3.7 Footer (shared)

Exact markup, same on every page (main.css:767):
```html
<footer class="footer">
  <div class="wrap footer__inner">
    <p class="footer__brand">Anderson Marketing LLC — Fairfield County, CT</p>
    <div class="footer__links">
      <a data-copy-mailto data-event="email_click" href="mailto:charlie@charlieanderson.me">charlie@charlieanderson.me</a>
      <a data-copy-href="config.SPOTIFY_URL" href="https://open.spotify.com/show/21qiKQ9A0Dk0hfDmqYaZOF" target="_blank" rel="noopener" data-event="podcast_click" data-event-label="footer">Podcast</a>
      <span data-optional><a data-copy-href="config.LINKEDIN_URL" href="#" rel="me noopener" target="_blank">LinkedIn</a></span>
      <span data-optional><a data-copy-href="config.IG_URL" href="#" rel="me noopener" target="_blank">Instagram</a></span>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      <a href="/work/">Work</a><a href="/about/">About</a><a href="/book/">Free diagnosis</a>
    </nav>
    <p class="footer__wink">Built by hand — AI on the grunt work. © 2026</p>
  </div>
</footer>
```

### 3.8 Hand-drawn SVG underline motif

Two variants:

**On the hero cycling word** (`.cycle-under`, main.css:217): SVG inside `.cycle-wrap`, animates in/out with the word swap.

**On subpage display words** (`.u-h1w`, main.css:777):
```html
<em class="accent u-h1w">diagnosis.
  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
    <path d="M3,8 Q45,3 90,7 T197,5"/>
  </svg>
</em>
```
CSS: `position: absolute; left: 1%; bottom: 0.03em; width: 98%; height: 0.13em`. With `.motion` class, the path draws in via `stroke-dashoffset` transition (210px dasharray) when `is-in` fires.

**Inline body text variant** (`.u-hand`, main.css:573):
```html
<p class="u-hand">the offer
  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
    <path d="M2,6 Q60,10 110,5 T198,7"/>
  </svg>
</p>
```
Used for the AI-split "front of house" display words. Each uses a slightly different SVG path for hand-drawn variation.

All underline SVGs share: `fill: none; stroke: var(--accent); stroke-width: 2.2–2.4; stroke-linecap: round`.

### 3.9 Section / page-hero structure

**Subpage hero** (`.page-hero`, main.css:787):
```html
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Label text</p>
    <h1 data-reveal style="--reveal-delay:100ms">Headline.</h1>
    <p class="lede" data-reveal style="--reveal-delay:220ms">Sub text.</p>
  </div>
</section>
```
`padding: clamp(140px, 22vh, 220px) 0 clamp(48px, 7vh, 80px)` — the top padding creates the visual clearance below the fixed nav.

**Two-column split variant** (About hero, main.css:853):
```html
<section class="page-hero">
  <div class="wrap page-hero__split">
    <div><!-- text --></div>
    <figure class="portrait" data-reveal>
      <img ...>
      <figcaption class="portrait__tag">Caption</figcaption>
    </figure>
  </div>
</section>
```

**Standard section** (`padding-block: var(--sect); border-top: 1px solid var(--hair)`): proof, pod, about-band, range-band. Always wrap content in `<div class="wrap">`.

---

## 4. Motion

### The no-js / js / motion class mechanism

`index.html:19` — inline script, runs synchronously before any CSS paints:
```html
<script>document.documentElement.className="js";if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion");</script>
```

- Starts as `class="no-js"` in HTML.
- Script replaces it with `"js"` immediately; adds `"motion"` if `prefers-reduced-motion` is not set.
- CSS scopes animations: `html.js [data-reveal]` (opacity/transform hidden until `.is-in`), `html.motion ...` (GSAP-dependent and complex animations), `html:not(.motion) ...` (static fallback layouts).

### data-reveal pattern (main.js:91, main.css:144)

```html
<p data-reveal style="--reveal-delay:120ms">...</p>
```

- `html.js [data-reveal]`: `opacity: 0; transform: translateY(26px)` — transition on both.
- IntersectionObserver in main.js adds `.is-in` when element enters viewport (rootMargin `-12%` bottom, threshold `0.05`).
- `.is-in`: `opacity: 1; transform: none`.
- `--reveal-delay` custom property staggers items. Without it: `0ms`.
- Groups: `data-reveal-group` on a parent auto-staggers child `[data-reveal]` elements at 90ms intervals (main.js:93).

### Hero line mask variant (`.hline / .hline__in`, main.css:155)

```html
<span class="hline" data-reveal style="--reveal-delay:80ms">
  <span class="hline__in">Line of text</span>
</span>
```
The `.hline` acts as an `overflow: hidden` clip box. `.hline__in` slides up from below (`translateY(112%)`) rather than fading in. Used for headline text to create a "rising into frame" effect.

### GSAP ScrollTrigger

Used ONLY for the three Home signature sections (The Line, Diagnosis, AI Split). Loaded via CDN in `index.html` only (`js/signature.js`). Do NOT load GSAP on subpages that don't need it.

### Reduced-motion handling (main.css:936)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html.js [data-reveal], html.js .hline__in { opacity: 1; transform: none; }
  html.motion .ai-ticker li { opacity: 1; }
}
```

`html:not(.motion)` rules define the structural fallback layouts for static/no-motion states. Animate only `transform`, `opacity`, `clip-path` — never layout properties.

### The `--reveal-delay` convention

- `0ms` (omit the property): first / primary element in a section
- `80–120ms`: second element (eyebrow → h2)
- `100–200ms`: lede/sub text
- `200–320ms`: body / supporting elements
- `90ms` auto-stagger per child when using `data-reveal-group`

---

## 5. Page Anatomy — New Page Recipe

A new page (e.g., `/call/index.html`) must be a faithful sibling of `book/index.html`. Use this template verbatim for the shell, then fill in the content:

```html
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page title — Charlie Anderson, Anderson Marketing</title>
<meta name="description" content="...">
<link rel="canonical" href="https://charlieanderson.me/call/">

<meta property="og:type" content="website">
<meta property="og:url" content="https://charlieanderson.me/call/">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://charlieanderson.me/assets/og.png">
<meta property="og:image:alt" content="Charlie Anderson — Anderson Marketing. There's a line.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FAF7F0">

<!-- CRITICAL: this inline script must run before any CSS paint -->
<script>document.documentElement.className="js";if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion");</script>

<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon-180.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,380..700;1,9..144,380..700&family=Inter:wght@400;500;600&display=swap">

<link rel="stylesheet" href="/css/main.css">

<script defer src="/js/copy.js"></script>
<script defer src="/js/main.js"></script>
<!-- GSAP only if this page needs the three Home signature animations — omit otherwise -->
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

[NAV — copy exactly from book/index.html, set aria-current="page" on matching link]

<main id="main">
  [PAGE CONTENT]
</main>

[FOOTER — copy exactly from book/index.html]
</body>
</html>
```

**Key checklist:**
- `<html class="no-js">` → inline script upgrades to `js` + optional `motion`
- `copy.js` before `main.js`, both `defer`
- `/_vercel/insights/script.js` deferred (Vercel Analytics — harmless if not on Vercel)
- GSAP CDN scripts only on Home (index.html)
- `aria-current="page"` on active nav link
- `<main id="main">` for skip-link target
- All URLs absolute-root (`/assets/`, `/css/`, `/js/`)

---

## 6. Hard Rules from HANDOFF.md

1. **No pop-ups, ever.** No exit-intent modals, no overlays, no live chat widgets. Not on the booking page either.
2. **Never add a third webfont.** Fraunces + Inter only. System mono for labels/data.
3. **copy.js is the source of truth for every number and claim.** Insert stats via `<span data-copy="stats.keyName"></span>`. Any number on the booking page (ROAS, client count, etc.) must come from copy.js, not be hardcoded.
4. **No-JS mailto fallback.** The form's `action` attribute must always be `action="mailto:charlie@charlieanderson.me"`. JS upgrades it to a fetch POST. If the form ever submits without JS, email opens.
5. **Voice.** Direct, plain, slightly blunt. Short declaratives. No agency-speak. Never invent numbers or testimonials. The only real numbers are in copy.js. All claims on the booking page must match existing copy.js values or be zero-number descriptive prose.
6. **Accent discipline.** `var(--accent)` / `var(--dark-accent)` earns its moments. Do not use the orange as a background fill on entire sections, as decorative borders on multiple elements, or on more than one italic word per page.
7. **Analytics events.** Wire `data-event="cta_click"` + `data-event-label="..."` on CTAs. Wire `data-event="diagnosis_submit"` on form success (main.js handles this automatically for `data-lead-form` forms). Wire `data-event="email_click"` on email links.
8. **Photos.** Only use images Charlie explicitly provides. Never pick from his camera roll without asking. All photos should be duotone/warm (CSS filter: `grayscale(0.2) sepia(0.16) contrast(1.02)` on portraits; `grayscale(0.18) sepia(0.12)` on pod cards).
9. **No third-party JS embeds** (no Calendly embed, no live chat). The Calendly link is a plain `<a>` only, hidden behind `data-optional`/`data-copy-href="config.BOOKING_URL"` so it disappears if the slug is ever a placeholder.
10. **Animate only** `transform`, `opacity`, `clip-path`. Never animate layout properties (`width`, `height`, `padding`, `margin`, `top`, `left`).

---

## 7. Booking Page Recipe

A booking page at `/call/index.html` (or wherever) would handle: meeting-type picker → date picker → time-slot grid → booking form → confirmation. Here is how to build each piece using ONLY existing tokens and components.

### 7.1 Page shell

Use the page anatomy from Section 5. Set `aria-current="page"` on the `/book/` nav button (or a new nav link if this is a distinct page). The booking page is a peer of `/book/`.

### 7.2 Page hero

Reuse `.page-hero` exactly as in `book/index.html`:
```html
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Book a call</p>
    <h1 data-reveal style="--reveal-delay:100ms">
      Pick a time. <em class="accent u-h1w">Let's talk.<svg viewBox="0 0 200 12"
        preserveAspectRatio="none" aria-hidden="true"><path d="M3,8 Q45,3 90,7 T197,5"/></svg></em>
    </h1>
    <p class="lede" data-reveal style="--reveal-delay:220ms">Sub text here.</p>
  </div>
</section>
```

### 7.3 Meeting-type picker

No equivalent exists, but map it to the chip pattern inside a paper-band section:

```html
<section style="padding-block: var(--sect); border-top: 1px solid var(--hair)">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Choose a session type</p>
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:24px" data-reveal>
      <!-- Use .chip, override first-chip accent style if needed -->
      <button class="chip" aria-pressed="true">Free diagnosis — 30 min</button>
      <button class="chip" aria-pressed="false">Strategy session — 60 min</button>
    </div>
  </div>
</section>
```

Style `.chip[aria-pressed="true"]` with `border-color: var(--accent); color: var(--accent)` — this is already the behavior of `.chip:first-of-type` so it matches the existing system.

### 7.4 Date picker

No calendar grid exists. Build it from tokens:

- **Outer container**: a `<div class="wrap">` inside a standard section.
- **Month header**: `font-family: var(--font-display); font-size: 1.3rem` (matches `.mid-card__name`).
- **Day-of-week labels**: use `.eyebrow` class (`font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted)`).
- **Date cells**: styled as mini chips. Available: `border: 1px solid var(--hair); border-radius: 6px` (matches `.prop-card` radius). Selected: `border-color: var(--accent); background: var(--accent); color: var(--paper)`. Unavailable/past: `color: var(--muted); opacity: 0.4`.
- **Navigation arrows** (prev/next month): use `font-family: var(--font-mono); color: var(--accent)` — matching `.link-arrow::after`.
- **Grid**: CSS grid, `grid-template-columns: repeat(7, 1fr)`.

No new colors or radii needed.

### 7.5 Time-slot grid

Map to a flex/grid of chips:

```html
<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:10px; margin-top:20px">
  <button class="chip" aria-pressed="false">9:00 AM</button>
  <button class="chip" aria-pressed="false">9:30 AM</button>
  <!-- ... -->
</div>
```

Available slots: default `.chip` styling. Selected: `border-color: var(--accent); color: var(--accent)` (matches `.chip:first-of-type`). Fully booked/unavailable: `color: var(--muted); opacity: 0.4; pointer-events: none`.

### 7.6 Booking form

Reuse the `.lead` dark-band form exactly. Copy the entire `<section class="lead">` block from `book/index.html:67–91`, replacing fields with name + email + optional notes. Wire `data-lead-form` — main.js already handles the POST + mailto fallback + `diagnosis_submit` tracking event.

If this booking page submits to a different endpoint (e.g., Calendly API or a different FormSubmit address), add a new key to `copy.js` (e.g., `CALL_ENDPOINT`) and reference it from JS — never hardcode URLs in HTML.

### 7.7 Confirmation state

On successful POST, main.js already hides `.form-fields` and the submit button, then shows `.form-status` with the success message. For a booking confirmation that needs to show a time summary:

```html
<div class="form-status form-status--ok" hidden aria-live="polite">
  <!-- JS populates this with: "Booked for Tuesday Jan 7 at 10:00 AM." -->
</div>
```

Style the confirmation card using `.mid-card` (white panel on dark bg) or a `.work-card` on paper. No new component needed.

### 7.8 Genuinely new pieces and how to style them

| New piece | Guidance |
|---|---|
| Calendar grid | CSS grid + chip-radius cells; use existing color tokens only (see 7.4 above) |
| Selected-date highlight | `background: var(--accent); color: var(--paper)` — matches `.btn--primary` |
| "Loading" state | Add `opacity: 0.6; pointer-events: none` to the slot grid — same as `.btn--submit.is-busy` |
| Calendar prev/next arrows | `←` / `→` in `font-family: var(--font-mono); color: var(--accent)` |
| Time-zone display | `.eyebrow` class — already the right mono/muted style for metadata |
| Step indicator (1 of 3) | Use `font-family: var(--font-mono); color: var(--muted); font-size: 0.78rem` — matching `.exp-list__num` |
| Divider between steps | `border-top: 1px solid var(--hair)` + `padding-block: var(--sect)` — standard section divider |

**Do not** introduce: new colors, new radius values, new webfonts, JavaScript animation libraries beyond what's already present, or third-party calendar widgets that load external JS/CSS.

---

## 8. Screenshot Tooling (`_tools/`)

`_tools/` is gitignored and contains a Puppeteer-based headless Chrome screenshotter.

**Usage** (from the site root with a local server running):
```
node _tools/shot.js <url> <outPrefix> [flags]
```

**Flags:**
- `--rm` — forces `prefers-reduced-motion: reduce` (tests static/fallback layout)
- `--full` — full-page screenshot instead of viewport
- `--w=N` — viewport width (default 1440)
- `--h=N` — viewport height (default 900)
- `--scroll=N` — scroll to px position before screenshot

**Dependency**: `puppeteer-core` (peer: system Chrome at `/Applications/Google Chrome.app/...`). Install: `cd _tools && npm i puppeteer-core`.

**OG image generation**:
```
node _tools/shot.js http://localhost:PORT/assets/og.html assets/og --w=1200 --h=630
```

**Review shots** land in `_shots/` (also gitignored). That directory contains ~200 audit/QA screenshots from the build process — do not commit them, do not rely on them at runtime.

---

*Path: `/Users/charlesanderson/charlieanderson-site/DESIGN_SYSTEM.md`*
