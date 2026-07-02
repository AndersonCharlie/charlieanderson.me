# charlieanderson.me

Personal-brand site for Charlie Anderson / Anderson Marketing. Static HTML/CSS/vanilla JS —
no build step, no frameworks. GSAP (CDN) powers the three scroll sections on Home.

One conversion: **a business owner requests a free diagnosis** (forms on `/` and `/book/`,
delivered to charlie@charlieanderson.me via FormSubmit) — or books directly on Calendly.

## Hosting — GitHub Pages (live, free)

Deployed from the public repo `AndersonCharlie/charlieanderson.me`, branch `main`, root folder.
The `CNAME` file pins the custom domain. To publish any change:

```bash
git add -A && git commit -m "update" && git push
```
(Pages redeploys automatically in ~1 minute.)

### DNS (one-time, at your registrar for charlieanderson.me)
| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `andersoncharlie.github.io` |

After DNS propagates (minutes–1hr), GitHub auto-issues the HTTPS certificate; then tick
**"Enforce HTTPS"** in the repo → Settings → Pages. Don't touch existing MX records (email).

### Alternative: Vercel (adds working analytics)
The pages already load Vercel Web Analytics (`/_vercel/insights/script.js` — 404s anywhere
but Vercel, harmless) and fire `diagnosis_submit` / `cta_click` / `email_click` events.
Import the repo at vercel.com (preset: Other, no build, root output), add the domain, and
those events light up. Until then, the Meta Pixel block in index.html is the analytics path.

## Config table (all in `js/copy.js`)

| What | Status |
|---|---|
| `FORM_ENDPOINT` | **LIVE** — FormSubmit → charlie@charlieanderson.me. ⚠️ The FIRST submission emails you an activation link — click it once (submit the form yourself to trigger it). |
| `BOOKING_URL` | **LIVE** — calendly.com/charlie-interviews (verify this slug is the client-facing event). |
| `[LINKEDIN_URL]` / `[IG_URL]` | Placeholders — footer links hidden until set. |
| `[META_PIXEL_ID]` | Commented block in `index.html` — set ID + uncomment. |
| Testimonials | `[PENDING]` slots on `/` and `/work/` — real quotes only. |
| Photos | `assets/charlie.jpg` live; Micah/Thomas headshots pending (initial circles until then). |

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
