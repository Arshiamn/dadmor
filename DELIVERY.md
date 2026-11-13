# dadmor v5 — Delivery notes

The React rebuild of the dadmor studio site (Vite 8 + React 19 + TypeScript),
built by Muse on the owner's order («خودت شروع کن درست کن», 2026-11-05).
Deployed directly to the main domain https://dadmor.netlify.app — no test site.

**Live version: v32** (v33 built and verified locally, pending deploy).

**Rules that govern this build** (owner orders, in force):
- Deploy to the main domain only, after all work/testing/debugging/optimising.
  Never race two deploys on the same Netlify site. Batch changes — free plan
  is 300 credits/month, 15 per production deploy (~20/month ceiling).
- PageSpeed Insights is BANNED (owner order 2026-11-06 00:05). Use
  WebPageTest and direct in-browser timing.
- The theme-change WAVE animation MUST stay (owner 2026-11-06 11:01):
  1400ms, spreads from the toggle icon, View Transition, preserveDrawingBuffer.
  v31 (instant swap, wave removed) was rejected — never redeploy it.
- DO NOT TOUCH: the wave, the holographic foil (hero lion + work samples),
  animations, copy/slogans, the big page-data lazy refactor (deferred,
  high-risk). `scripts/fix-v4-data.py` must NEVER be re-run.
- NO ZWNJ (half-space) anywhere — ZWNJ rule revoked 2026-11-06 00:49.
- Stats 20+ projects / 5+ years are owner-CONFIRMED (2026-11-06).
- The owner's real iPhone is ground truth for the theme toggle — headless
  QA passed the wave 3 times while his phone still flickered/reloaded.
- `hello@dadmor.com` mailbox NOT verified; dadmor.com domain NOT confirmed
  as his — do NOT switch SITE_URL/canonical to dadmor.com until he confirms.

## Stack

Vite 8.3.6 + React 19.3.1 + TypeScript. three + @react-three/fiber v9,
GSAP + ScrollTrigger + Lenis, react-router-dom, animejs 4.5.0.
(drei + postprocessing REMOVED in v33 — unused.) Per-route prerendering
(`scripts/prerender.mjs`, 35 pages) — a plain SPA was rejected (SEO/hreflang/no-JS).
Content: `src/data/pages/*.json` (copy VERBATIM from v4). `npm run build:all`
= build + build:ssr + prerender.

## Version history (v14–v33)

### v14 (2026-11-06 01:43) — final v7–v14 line
Rainbow holographic foil on the hero lion, tagline accent on both «می» +
«ماند», band-table + WhatsApp BIDI fixed, EN Telegram label fixed, JSON-LD
FAQ filtered per language, Ghazal screenshot with no captions, mobile tool
cards as grids. WebPageTest mobile ALL GRADE A (LCP 1.929s, CLS 0.000,
182KB, 8 requests). Form Active, 5 submissions (old Netlify account).

### v15 (06:53)
Mobile square border removed (cause: `.hero-backdrop` glow; ≤767.98px hide
rule for `.foil,.hero-backdrop`); eyes #00FF41; all lion circles breathe.

### v16 (07:02)
Mobile foil faintly back — MISINTERPRETATION, removed in v17.

### v17 (07:21)
Mobile lion NO background/frame; desktop foil opacity 0.6 + 32px corners;
hero CTAs +16px; service headings de-linked, styled `.service-row-main h3`
violet 700 1.5rem; band formula restructured (three stacked LTR lines);
light tagline accent #7C4DFF (superseded).

### v18 (07:29)
Hero primary CTA JOINED («اسکوپ پروژت رو بساز»); light service headings
#7C3AED (5.70:1, AA).

### v19 (07:36)
Plain contact links removed from footer Studio column + contact-page purpose
sentences (only ChannelLinks pills remain); light tagline accent #7C3AED.

### v20 (07:46)
Language-switch staleness fix (anime-fx: cleanup must NOT call
TextSplitter.revert() — it restored old-language innerHTML over React's
new text; only disconnect the observer).

### v21–v24 (08:01–08:27)
Band BIDI episodes — final winner: plain inline-flex, DOM logical order
S,M,L (a Persian RTL reader scans right-to-left through the WHOLE line
including an embedded LTR span). Estimator titles L/M/S.

### v25 (08:34)
Per-pill channel captions (channel names NOT repeated in captions).

### v26 (08:49)
HeroCanvas GPU shaders; E5 warp filter removed; Lenis lerp 0.2; DPR 1.25.
Long tasks: desktop scroll 443→281ms, mobile scroll 700→192ms.

### v27 (09:28)
Lalezar button font; home contact strip → three sections with real spacing;
theme wave 800→1400ms + origin from toggle button + transitions frozen
during theme-anim + duplicate keyframes deleted + theme-anim removed by
1500ms timer; glass shine → transition; contact page vertical ChannelLinks
+ captions, purpose sentences deleted from data; hero load flicker fixed
(CSS-only word reveal; canvas 800ms fade).

### v28 (09:59, old account) — REJECTED by owner on real iPhone 10:02
Mobile backdrop dots-only + first-frame-gated canvas fade + canvas faded
OUT during theme-anim. Owner: background still late; theme fix «افتضاحه»
(flicker + jump + not smooth); canvas vanishing ~1.6s felt laggy; sparse
backdrop dots didn't read as a background.

### v29 (10:05, old account)
Reverted canvas fade-out; **preserveDrawingBuffer: true** added (root-cause
fix for View Transition canvas snapshots); mobile backdrop dots densified
to 28/36/48px; first-frame `.is-ready` fade kept.

### v30 (speed, owner order ~10:07)
HeroCanvas bare-import preload in main.tsx; `public/_headers` created
(`/assets/*` immutable 1 year; HTML max-age 0). Code-splitting tool pages
and the page-data refactor DECIDED AGAINST. Baseline: main bundle
1,096,718 B raw / 317,247 B gzip; HeroCanvas chunk 924,340 / 241,578.

### v31 (10:58, new account) — REJECTED by owner 11:00–11:01
Instant theme swap (View Transition removed, preserveDrawingBuffer removed,
wave CSS removed). Owner: he LOVED the wave from the icon; «انیمیشن موجی
تغییر رنگ باید حتما باشه». NEVER redeploy v31.

### v32 (11:03, new account) — CURRENT LIVE
Wave restored EXACTLY as v30 (View Transition toggle, 1400ms, origin from
toggle centre, theme-anim class, 1500ms timer + 2000ms safety,
preserveDrawingBuffer restored). QA: wave works 3/4 transitions; EN
light→dark showed NO sweep in desktop QA captures (cause unestablished).
Owner report 2026-11-06 11:17 (real iPhone): the wave IS visible («موج رو
هم میبینم») but STILL flickers («بله هنوز فلیکر میزنه») — accepted
trade-off; the EN light→dark no-sweep was NOT seen on his phone (likely
desktop-QA artifact). Form: 2 verified submissions on the new account.

### v33 (2026-11-06, built + verified locally, pending deploy)
The audit implementation (read-only audit 2026-11-06 11:28; owner order
11:30 «همرو انجام بده»، stats confirmed; 11:32 refinement: copy/slogans
and the page-data refactor are OUT — report only).

**What changed:**
- Theme-toggle double-click race FIXED (App.tsx): timers stored in a ref
  and cleared before each toggle; toggle reads the CURRENT theme from the
  live `data-theme` DOM attribute (immune to React state lag). Wave
  unchanged: same 1400ms, same origin, same preserveDrawingBuffer.
- Lion d0–d2 imports dropped (only d3 renders) — main bundle −143,748 B
  raw / −42,285 B gzip (1,096,778 → 953,104 raw; 317,405 → 272,355 gzip).
- JetBrains Mono subset: 113,672 B → 13,012 B (119 glyphs, fvar wght
  100–800 kept), preloaded in index.html. Original backed up at
  /tmp/jetbrains-mono-var-full.woff2 (ephemeral).
- Ghazal screenshot WebP: 118,375 B → 58,228 B, served via `<picture>`
  (JPEG fallback kept) on home + work (FA + EN).
- JSON-LD logo URL fixed: `/assets/img/` → `/img/` (was a 404).
- drei + postprocessing removed (unused): 45 packages removed from
  node_modules; 0 refs in package-lock.
- Headings promoted h3 → h2 where the outline skipped (services page 6,
  work page 4, process page 5 + 2 boxes, FAQ page 12); 404 renders only
  the matching language (1 h1); CSS selectors updated to `:is(h2, h3)`.
- A11y: FAQ buttons get `aria-controls` + answer `id`; ContactForm gets
  `required` + `aria-invalid`/`aria-describedby`, error summary focused on
  submit, labelled service placeholder («انتخاب کنید»); Estimator "other"
  gets a visible label; mobile menu closes on Escape and returns focus.
- Bidi: `(Letter of Authorisation)` wrapped in `<span dir="ltr" lang="en">`
  on the FA pen-test page.
- Dead code removed: v5.css (`.section-kicker`, `.typing-caret::after` +
  caret-blink keyframes, `.work-item-shot figcaption`), legacy.css
  (`.skip-link`, `.js-anim` motion block, `.theme-wave-canvas`,
  `.warp-defs` + `.hud`, `.tilt-stage`, `.section-intro`, `.work-more`,
  `.tool-note`, `.contact-strip-*`, `.process-note`, `.notice-line`,
  `.band-note`, `.tool-result` incl. print rules, `.team-functions`),
  `src/assets/{react.svg, vite.svg, hero.png}`, prerender.mjs dead lines,
  glitch.ts comment 5–9s → 8–14s.
- 12 mono lion SVG variants archived to `~/workspace/dadmor/brand-archive/lion-mono/`
  (NOT deleted). `dadmor-halftone-logo.svg` KEPT in public/img/ — it IS the
  JSON-LD logo; archiving it would re-break the logo URL.
- **v33 regression caught + fixed in local QA:** promoting the FAQ
  questions to h2 made anime.js's word-split (which targets `main h2`)
  clone each accordion button into a visually-hidden span — 24 buttons,
  duplicated aria-controls ids. Fix: `initAnimeFx` now never splits a
  heading wrapping interactive content (button/a/input/select/textarea).
  This also protects the Ghazal work-item h2 (contains a link). Verified:
  exactly 12 FAQ buttons, unique ids, 0 hidden clones on home + work.

**Skipped (reported, not done):** modulepreload for HeroCanvas (hashed
filename needs prerender injection; 924KB chunk competing with main bundle
+ fonts risks FCP on slow mobile; the v30 bare import already works);
pagePath dedupe (low value, risks the prerender); favicon simplify +
oxlint warnings (brand-sensitive / cosmetic); em-dash copy fixes (EN
slogan, Ghazal alt, doc "coming soon" — owner ruled copy OUT, report only).

**Local verification (22/22 PASS, no page/console errors):** home h1,
lion d3, mono preload, double-click race (final theme stays dark), single
toggle + wave class, theme-anim removal, FAQ 12 h2 / 12 buttons / unique
ids / answer opens, estimator other-field label, 404 single h1 + single
language, contact required ×4 + placeholder + error-summary focus +
4 aria-invalid, services 6 h2, work 4 h2 + Ghazal target=_blank + WebP
picture, Ghazal links 2 per page with 0 hidden clones.

## Netlify accounts

- OLD: arshiaamani12@gmail.com. Credits EXHAUSTED 2026-11-06 10:12
  (300/month; 21 deploys = 315 credits). Site renamed `dadmor` →
  `dadmor-old` (https://dadmor-old.netlify.app serves v29; Forms: 16 verified
  + 1 spam). Team resets Dec 4, 2026.
- NEW: arashmidoo3@gmail.com, team "dadmor". Site `dadmor` →
  https://dadmor.netlify.app, PUBLIC, form detection enabled. Deploys so
  far: v30 ×2, v31, v32 = 4 (~60/300 credits). Forms: 2 verified, 0 spam.
  v33 will be deploy #5.

## Open items (real site, not agreed, not invented)

- `hello@dadmor.com` mailbox NOT verified (owner must create/verify +
  confirm a test email arrives); form notification-email arrival unverified.
- Domain dadmor.com NOT confirmed as owned/pointed — do NOT switch
  SITE_URL/canonical/hreflang/sitemap/OG until the owner confirms.
- Privacy publish date (demo default: November 2026).
- Real work samples beyond Ghazal; a redacted publishable document;
  2–3 things a visitor can check on ghazalalidoost.art; testimonial: none.
- Scope confirmations still open: UI/UX web only or mobile apps too;
  pen-test social/physical/internal out of scope; marketing AI policy +
  monthly notice period; post-launch handover/revision period; outside
  contractors + disclosure; journal cadence line (preview answer: no line).
- The "Powered by Netlify" badge overlaps the mobile hero stats/WhatsApp
  pill (free-tier artifact — do NOT hide via CSS).
