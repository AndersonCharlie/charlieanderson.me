# charlieanderson.me

Personal-brand site for Charlie Anderson / Anderson Marketing. Static HTML/CSS/vanilla JS —
no build step, no frameworks. GSAP (CDN) powers the three scroll sections on Home.

One conversion: **a business owner requests a free diagnosis** (forms on `/` and `/book/`).

## Deploy to Vercel (~5 minutes)

```bash
# from this folder
npm i -g vercel        # once
vercel                 # answer prompts: no build command, output dir = ./ (root)
vercel --prod
```

Or via dashboard: vercel.com → Add New Project → import this repo (framework preset:
**Other**, no build command, output directory: root). `404.html` at the root is picked up
automatically as the 404 page.

Then in the Vercel dashboard:
1. **Analytics tab → Enable Web Analytics.** The pages already load `/_vercel/insights/script.js`
   (it 404s on localhost — that's normal) and fire `diagnosis_submit`, `cta_click`, `email_click`
   custom events.
2. **Settings → Domains → add `charlieanderson.me`** (and `www.charlieanderson.me`, redirect www → apex).

### DNS (at your registrar for charlieanderson.me)
| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel's dashboard shows the exact records when you add the domain — trust the dashboard if it differs.
Propagation is usually minutes, occasionally up to an hour. Email (Gmail etc.) is untouched — don't
delete existing MX records.

## Swap table — placeholders to replace before/after launch

| What | Where | Swap with |
|---|---|---|
| `[FORM_ENDPOINT]` | `js/copy.js` | A form endpoint (Formspree/Basin/Getform) POST URL. **Until then the form falls back to opening the visitor's email app — it works, but an endpoint converts better.** |
| `[BOOKING_URL]` | `js/copy.js` | Calendly/Cal.com link. The "Or grab a time directly" link on /book/ stays hidden until set. |
| `[LINKEDIN_URL]` / `[IG_URL]` | `js/copy.js` | Social URLs. Footer icons stay hidden until set. |
| `[META_PIXEL_ID]` | `index.html` (commented block near top) | Pixel ID; uncomment the block. |
| SWAP images | — | There are currently **no raster placeholders** to swap; all art is code/SVG. See HANDOFF.md → "Image swaps" for where real photos would slot in. |
| Testimonials | `[PENDING]` slots on `/` and `/work/` | Real client quotes only. |

## Editing copy
Read `COPY.md` first — every word on the site is mirrored there.
Numbers/claims/links live **only** in `js/copy.js`. Sentences live in `<!-- COPY: name -->` blocks in the HTML.

## Local preview
```bash
python3 -m http.server 8471   # from this folder
# open http://localhost:8471 — file:// won't work (root-relative paths)
```

## Repo map
```
index.html            Home (hero + 3 signature scroll sections + proof + form)
work/ about/ book/    subpages     404.html
css/main.css          all styles (design tokens at top)
js/copy.js            ← THE single source for numbers/claims/config
js/main.js            copy injection, reveals, nav, forms, analytics events
js/signature.js       GSAP choreography for the 3 Home sections
assets/               favicon, og.png (+ og.html source)
DECISIONS.md COPY.md HANDOFF.md QA-REPORT.md   docs
comps/                the two hero art-direction studies (reference only)
_legacy/              pre-June-17 single-file draft (reference only)
```
