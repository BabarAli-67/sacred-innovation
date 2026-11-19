# Sacred Innovations — Homepage

Scroll-driven image-sequence homepage for **Sacred Innovations LLC** (Conroe, TX).
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP ScrollTrigger · HTML5 canvas.

> Make your space, Sacred.

---

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (fully static)
npm run start

npm run verify:copy   # asserts the client-supplied hero strings are verbatim
```

## Verbatim hero copy

`copy/hero.json` holds the client-supplied hero strings exactly as given — the
H1, both body paragraphs and both CTA labels. `npm run verify:copy` asserts each
one appears character-for-character in `src/lib/brand.ts`, so a stray reflow,
a smart quote or a well-meaning rewording fails loudly instead of shipping.

**`copy/hero.json` is the source of truth.** If the copy needs to change, edit
that file and then the code to match — never the other way round. Run the check
in CI alongside `tsc` and `eslint`.

The entry panel is a gradient container (`bg-ink/88` plus a white sheen that
never lowers the panel's own opacity), so white text clears 4.5:1 even over the
brightest frames in the sequence. It deliberately avoids `backdrop-filter`:
blurring a backdrop that a canvas is repainting every frame forces a readback
per frame, which is exactly the wrong cost during a scrub.

## Brand source of truth

Everything — palette, type, copy, principles, dates — comes from
`Sacred-Brand-Foundation-v1.pdf` (Leadership Review / 14 Nov 2026) and lives in
one file: [`src/lib/brand.ts`](src/lib/brand.ts). Edit copy there, not in components.

### Palette (section 07)

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#0B0B0B` | Existing website base |
| `paper` | `#FFFFFF` | Existing website base |
| `sacred` | `#E3322B` | Existing website accent |
| `ember` | `#B82520` | Proposed text accent |
| `linen` | `#F2F0ED` | Proposed document support |

### Type (section 08)

DM Serif Display (display) + DM Sans (body), loaded via `next/font/google`.

### Logo (section 06)

The original artwork is embedded as a raster, **never retyped** — the brand
foundation explicitly forbids recreating the wordmark with type.

- `public/logo.png` — white script, for dark backgrounds (primary)
- `public/logo-dark.png` — dark script, for light backgrounds
- `public/icon.png`, `public/apple-icon.png` — square flame mark

---

## The hero

`src/components/HeroScrollytelling.tsx` plays 198 WebP frames
(`public/frames/frame_0001.webp` … `frame_0198.webp`, 1280×720, ~11.3 MB) on a
canvas, scrubbed by scroll.

**Pinning** uses CSS `position: sticky`, not `ScrollTrigger pin`. GSAP drives the
scrub and the overlay choreography only. Sticky avoids the pin-spacer reflow that
is the usual source of layout shift and mobile scrub jitter — measured CLS is `0`.

**Loading** is two-stage: the first 28 frames are fetched at 8-way concurrency
behind the brand preloader, then the remaining 170 fill in during idle time at
6-way concurrency. The background order is strided (every 8th frame, then 4th,
2nd, 1st) so a fast scrubber always lands near a decoded frame. Every image is
`decode()`d before it is cached, so `drawImage` never pays a synchronous decode
mid-scroll. If a frame is not ready, `nearestLoaded()` walks outward up to 48
frames and paints the closest one — the sequence degrades to a lower frame rate
instead of flashing.

**Canvas** uses `alpha: false`, `devicePixelRatio` capped at 2, `object-fit: cover`
math (with the focal point biased upward on portrait viewports), and one paint per
animation frame via a coalescing `requestAnimationFrame`. Redundant draws are
skipped when the rounded frame index has not changed.

### Narrative phases

Each phase is keyed to what the footage is actually doing — verified frame by frame.

| Range | Footage | Message |
| --- | --- | --- |
| 0–20% | Gut stage: exposed brick, open framing, crew working | Entry panel — H1, body copy, both CTAs |
| 20–45% | Framing closed in, trim set, surfaces prepared | Settled before it begins. |
| 45–70% | Finished hallway, custom built-ins, integrated lighting | Built for the way the room is used. |
| 70–90% | Great room reveal: island, pendants, staircase | Every transition, fit and finish. |
| 90–100% | Close on the Sacred mark | Make your space, Sacred. |

**Reduced motion:** the hero collapses to `100svh`, loads three frames instead of
198, paints frame 150 statically and shows the hook with no scrub. All other
motion on the page is disabled in CSS and in JS.

---

## Structure

```
src/
  app/
    layout.tsx       DM fonts, metadata (from the SEO doc), LCP frame preloads
    globals.css      brand tokens (@theme), reveal base state, FAQ, reduced motion
    page.tsx         composition + LocalBusiness JSON-LD
  components/
    Navbar.tsx               transparent → solid past the hero, mobile panel
    Preloader.tsx            brand loader, 12s safety valve
    HeroScrollytelling.tsx   canvas sequence + GSAP scrub + phases
    ScrollReveal.tsx         one IntersectionObserver for all [data-reveal]
    SiteFooter.tsx           logo, nav, service area, contact
    sections/
      SectionHeading.tsx     shared eyebrow / display heading / intro rhythm
      ServicesSection.tsx    01 — six services as a bento grid
      WhySacredSection.tsx   02 — three reasons + before/progress/after stills
      ProcessSection.tsx     03 — four estimate steps on a vertical rail
      CostSection.tsx        04 — preparation checklist + comparing estimates
      ServiceAreaSection.tsx 05 — Conroe and North Houston, as a ledger
      FaqSection.tsx         06 — native <details> + FAQPage JSON-LD
      EstimateCtaSection.tsx 07 — closing CTA, "send these three things"
  content/
    seo.json              all below-the-fold copy, verbatim from the SEO PDF
    links.ts              destinations for the copy's internal-link sentences
    brand-foundation.ts   Brand Foundation material not currently rendered
  lib/
    brand.ts         only what the page imports: brand, heroEntry, contact, nav
    frames.ts        sequence config, path helper, load ordering
```

`src/lib/brand.ts` is imported by client components, so it holds only what the
page actually uses. The rest of the Brand Foundation extract — positioning,
the six working principles, mission, vision, founder and the original service
list — lives in `src/content/brand-foundation.ts`, unrendered but ready for
the service pages, an About page or proposals.

## The interactive components

Everything in `src/components/ui/` is third-party or third-party-shaped, kept
close to upstream so it can be re-synced. ESLint has a scoped override for that
directory (`eslint.config.mjs`) so upstream's own patterns are tolerated there
while our code stays on the full rule set.

| Component | Where | Source |
| --- | --- | --- |
| [Wordmark Reveal Footer](https://21st.dev/@dhxwhy/components/wordmark-reveal-footer) | Footer | 21st.dev, `wordmark-reveal-footer.tsx` |
| [Glyph Portal](https://21st.dev/@Legacy/components/glyph-portal) | Service area | MIT, © 2026 Christian Katzmann, `glyph-portal.tsx` |
| Burn Away | Why Sacred | Built here, `burn-away.tsx` |
| Streaming Message | Process | Built here, `streaming-message.tsx` |

Burn Away and Streaming Message were written rather than fetched: the
21st.dev account is capped at two component retrievals a day. They are not
stand-ins — see below for why each upstream shape would not have fitted.

The Flipping Website Screenshot Deck was removed by request and replaced with
the auto-playing services carousel; its vendored file is deleted rather than
left in the tree unused.

### Burn Away (`burn-away.tsx`)

A scroll-driven ember dissolve from the "before" frame into the "after" frame.
The 21st.dev component of that name is a whole-page transition built on
Chrome's HTML-in-Canvas, which degrades to a crossfade everywhere else — the
wrong shape for an in-page before/after reveal.

A fractal value-noise field is generated once and biased left to right so the
burn sweeps rather than blooming at random. Each frame thresholds a
low-resolution alpha mask out of that field — about 35k pixels, well under a
millisecond — and uses `destination-in` to erase the before image. A second
pass paints a narrow ember band where the threshold is crossing and composites
it with `lighter`. Scaling the small mask up to the canvas softens the edge
for free. Reduced motion renders the finished state.

### Burn Away timing

The burn is timed against `[data-burn-track]` — the right column, which stays
in normal flow — not against the canvas itself. The canvas is `lg:sticky`, so
once it pins its own rect stops advancing and the reveal would stall until the
reader had already scrolled past the section. That was the original bug.

`start: "top 75%"` to `end: "center 40%"` on the column means the burn begins
as the section enters and is finished while the reader is on the second of the
three points, with the finished room pinned for the second and third.

The visual's height is a trade: the column is only as tall as the three points
beside it, so every pixel of image height is a pixel of sticky hold lost. At
`min(62vh, 34rem)` it fills the column (no white void beneath it) and still
leaves ~140px of pin.

### Streaming Message (`streaming-message.tsx`)

The four estimate steps as a consultation panel: pick a step and its answer
arrives token by token, with status lamps on the step list.

The usual implementation appends characters to the DOM over time, which would
mean the server sends an empty box and a crawler sees nothing. On this page
the copy is the whole point, so **every word of all four steps is rendered up
front** and the "streaming" is a progressive opacity reveal of text that is
already there. The inactive steps are stacked in the same grid cell rather
than swapped out, so the full verbatim copy stays in the HTML and the panel
never changes height. Without JavaScript it is simply four paragraphs.

### Changes made to Glyph Portal (marked `SACRED:`)

The portal latched itself into static mode on this page. Its guard disables
motion if the first animation frame lands more than 2.5s after mount, which is
meant to detect a browser withholding frames behind a hung font. Here the
delay was our own hero decoding 198 canvas frames at load, so a healthy
browser got the portal permanently frozen. The frame-timing verdict is now
taken from when the portal first scrolls into view, using the observer it
already had. The font check is untouched.

### Changes made to the footer (marked `SACRED:`)

- The wordmark was capped at **12 glyphs**, which silently truncated
  "Sacred Innovations" to "Sacred Innov". Raised to 24 — the camera already
  pulls back to fit whatever width results.
- A space has no outline, so `TextGeometry` returned an empty bounding box and
  the two words ran together. Spaces now advance without a mesh.
- The component also ships an intro block, a link grid and a bottom bar with
  its own hardcoded "Built with care." and demo copy ("Make room for what
  matters."). The details grid above it replaces all of that, so the wrapper
  keeps the wordmark canvas and hides the rest.

### Photography

`public/images/` holds the section photography, downloaded into the repo so
the site has no runtime dependency on an external host and `next.config` needs
no `remotePatterns`. Every file was downloaded, **viewed, and matched to its
section by subject** before being committed — none were picked from a
filename. `public/images/CREDITS.md` records each Unsplash ID.

They are placeholders for Sacred's own project photography. The one deliberate
exception is the before/after reveal in "Why Sacred", which still uses frames
from the hero sequence: that is Sacred's own documented project, start to
finish, and no stock photograph can stand in for it.

### Server-render the copy, defer only the JavaScript

Both the services carousel and the streaming process panel are
`next/dynamic` **without** `ssr: false`, so they are code-split but their
markup is in the HTML on first byte.

Neither is wrapped in `LazyOnView`. That was tried and it was wrong: gating
render on an IntersectionObserver means the server emits nothing, and the
entire services and process copy vanished from the HTML — present only as
JSON-LD and as serialised props in the RSC payload. Both components already
idle off-screen through their own observers, so there was nothing to gain and
the page's whole reason for existing to lose.

`LazyOnView` is still right for the footer and the burn canvas, which carry
no copy.

### The footer

`SACRED INNOVATIONS` rises letter by letter through a hairline floor, lights a
reflection, then the status band switches on with the live local time in
Conroe. Hovering a letter lifts it and runs a glint across it.

It replaced a Three.js liquid-glass wordmark, which read as a floating box
against the page's flat architectural surfaces and needed a 3D renderer, an
embedded typeface and a WebGL context to draw one word. **That removal took
`three`, `@types/three`, `@gsap/react` and `lucide-react` out of the project
entirely** — this footer uses the Web Animations API and no animation library.

Local changes, marked `SACRED:`

- `brand.blurb` widened from `string` to `ReactNode`, so the brand column can
  carry the pillars line and the phone link as real elements.
- An optional `action` node renders as a final column for the estimate CTA
  and the location line.
- The newsletter form is dropped: there is no address to send to, and a form
  that goes nowhere is worse than no form.
- The status label is always in the DOM. Upstream rendered an empty string
  until the reveal finished, so it was missing from the server HTML and never
  appeared at all without JavaScript. It is now hidden by CSS keyed to
  `data-lit`, gated on `(scripting: enabled)`.
- Top padding is `pt-20 lg:pt-28`, which is what fixed the brand column being
  clipped against the section above.

### The rest of the page still ships no JavaScript

Apart from the two vendored components above, every section under the hero is
a **server component** — zero JS rather than deferred JS, so nothing competes
with the hero canvas for the main thread:

- The FAQ accordion is native `<details>` / `<summary>` — keyboard and
  screen-reader correct for free, open before hydration, and crawlable. The
  open/close animation is CSS (`::details-content` behind an `@supports`
  guard); where it is unsupported the panel opens instantly.
- Hover and focus states are CSS.
- Scroll reveals reuse the one page-wide `IntersectionObserver` in
  `ScrollReveal`, so sections only add `data-reveal` attributes.

The only client components on the page are `Navbar`, `HeroScrollytelling`
and `ScrollReveal`.

## SEO content

`src/content/seo.json` holds the below-the-fold copy verbatim from the client's
SEO PDF, and the sections import it directly — one copy of every string, so the
page cannot drift from the source.

`copy/seo-source.txt` is the raw text extracted from that PDF, and
`npm run verify:seo` asserts every string in `seo.json` still appears in it
(whitespace-normalised, since the PDF wraps mid-sentence). Run it in CI:

```powershell
npm run verify
```

Headings follow the document: one `<h1>` (the hero), an `<h2>` per section, and
an `<h3>` per service, reason, step and FAQ question. The FAQ also emits
`FAQPage` structured data, and the page emits `HomeAndConstructionBusiness`
with the service list and areas served.

### Internal links

The SEO copy ends several passages with a link sentence ("Explore kitchen
remodeling.", "Read how to compare remodeling estimates line by line."). Those
service pages do not exist yet, so rather than ship anchors that 404, the
sentences render as text. Add a path in `src/content/links.ts` and the sentence
becomes a real link — no component changes.

### Scroll reveal

The rule is simple: **an element that is never seen must never be left at
`opacity: 0`.** Getting there took three passes, and each guard exists because
the previous approach was observed failing.

`ScrollTrigger.batch` was dropped first — a single large scroll jump (anchor
link, restored scroll, programmatic `scrollTo`) carries an element past the
viewport without its enter callback running, and the content stays invisible.

`IntersectionObserver` replaced it, but has the same class of hole: it reports
*threshold crossings*, not positions. When the main thread stalls — frame
decoding, a slow device — several scroll steps coalesce into one rendering
update, and a small element can pass from below the fold to above it between
samples. It was not intersecting before or after, so no callback is delivered.

So the observer now has two guards:

1. Anything at or above the fold on first run is shown immediately, covering
   deep links and reloads with restored scroll.
2. A rAF-throttled scroll sweep reveals anything that ended up entirely above
   the viewport without the observer firing. It removes its own listener as
   soon as nothing is pending, so the steady state is zero scroll listeners.

The hidden base state is CSS, gated on `@media (scripting: enabled)` rather than
a class added by an inline script. A script that mutates the `<html>` class
before hydration desyncs React's server and client markup and throws a
hydration mismatch; the media query applies before first paint with no flash,
needs no JavaScript, and still leaves everything visible when JS is off.

---

## Before this goes live

Two things are intentionally left as marked fields, because the brand foundation
(section 11) requires them to be confirmed before any external release:

1. **Contact details** — the phone number is live, in the hero, the navbar, the
   footer and the JSON-LD. Email and website still render as dashed
   placeholders in `src/components/CtaFooter.tsx`.
2. **`metadataBase`** — set the real domain in `src/app/layout.tsx`.

Also note the foundation's copy rules are applied throughout: no "best",
no "guaranteed return", no "zero disruption", no blanket compliance claims, and
no financial results. The figures in the Evidence section are dates, places and
counts only — nothing unverifiable, and no invented testimonials.

Mission and vision statements are carried forward as **proposed**; the footer says
so. They are not adopted policy until Joshua Woolever adopts or revises them.
