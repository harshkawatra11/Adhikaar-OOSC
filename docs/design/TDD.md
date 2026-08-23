# TDD: Adhikaar visual reconstruction

Technical design for the requirements in `PRD.md`, addressing the defects in `AUDIT.md`.

## 1. The cursor defects

Two separate causes, both fixed in `src/app/globals.css`.

- `.cite` in the stylesheet set `cursor: help`. `CitationTag.tsx` applies `.cite` to a real
  `<button>` for the resolved-citation case and to a non-interactive `<span>` for the
  unresolved-citation case. Split into `.cite` (no cursor override, inherits pointer from the
  base rule below) and `.cite-unresolved` (keeps `cursor: help`, correctly, since that span is
  not clickable).
- Tailwind v4's preflight sets `button { cursor: default }`, so no button anywhere in the app
  had a hand cursor; the citation tag was simply the instance the user noticed. Fixed with an
  explicit rule restoring `cursor: pointer` on `button:not(:disabled)`, `[role="button"]`,
  `a[href]`, `summary`, `label[for]`, and the checkbox/radio/select inputs, plus
  `cursor: not-allowed` on `:disabled` and `[aria-disabled="true"]`.

## 2. The `border-radius` reset

The prior rule, `* { border-radius: 0 !important }`, is scoped to `[class] { border-radius: 0 }`
(no `!important`). This keeps the zero-radius look on every element the app itself styles
(everything in this codebase has a class) while no longer fighting arbitrary third-party or
browser-native elements that might not carry a class. `.seal-mark { border-radius: 999px }`
remains the one escape hatch, also without `!important`, since specificity alone is now
sufficient (`.seal-mark` outranks the attribute selector).

## 3. Token layer additions

All nine existing tokens (`primary`-equivalent role names: `paper`, `paper-raised`,
`paper-deep`, `ink`, `ink-soft`, `ink-faint`, `rule`, `rule-strong`, `seal`, `seal-deep`,
`seal-tint`, `gilt`, `gilt-bright`, `gilt-tint`, `forest`, `forest-tint`, `brick`, `brick-tint`)
are unchanged. Added in `:root` and mirrored into `@theme inline` so Tailwind utility classes
can reference them:

- `--paper-endpaper`, `--paper-endpaper-raised`, `--ink-on-dark`, `--ink-on-dark-soft`: the dark
  ground and its text color, for full-bleed "act" sections on the landing page.
- `--foil`, `--foil-dim`: gilt-on-dark accent, distinct from `--gilt` (which is calibrated
  against parchment, not against the dark ground).
- `--emboss`, `--deboss`: ink-derived shadow values for `panel-lift` (a hard-edged offset shadow,
  consistent with the "layered sticker card" motif already established) and `panel-emboss`
  (a pressed-in look for form fields), replacing any temptation to reach for a soft grey
  drop-shadow.
- `--step--1` through `--step-6`: a fluid type scale via `clamp()`, letting the landing headline
  run from roughly 61px at 360px viewport width to 120px at desktop, while every existing
  hardcoded Tailwind text size (`text-3xl`, `text-5xl` etc.) on interior pages is left alone.
- `--ease-strike`, `--ease-settle`, `--dur-fast/base/slow`: named motion timing, consumed by
  both the GSAP timelines and the `motion` components so pacing is a single system decision.
- `--font-devanagari`: `Tiro_Devanagari_Hindi` loaded via `next/font/google` in `layout.tsx`,
  applied via the new `.font-devanagari` utility to the seal glyph in `Seal.tsx`, fixing defect
  4 from the audit.

## 4. Texture

A `.paper-grain` utility applies a fine fibre-noise layer via an inline SVG `feTurbulence` data
URI (no network fetch, so no CLS risk and no CSP concern) at 5% opacity with `multiply` blend
mode on light ground, and a separate lower-opacity `overlay` blend for `.act-dark` sections.
This replaces reliance on the existing 3px repeating-linear-gradient scanline (kept, since it is
cheap and already correct) as the sole texture cue; it is used sparingly, on the landing page's
full-bleed sections only, not applied to every bordered panel in the app.

## 5. Loader architecture

**Entry loader** (`src/components/CourtLoader.tsx`, client component, mounted from
`src/app/layout.tsx` above `<SiteHeader />`):

- Reads `sessionStorage.getItem("adhikaar-loaded")` on mount. If set, renders nothing and
  exits immediately: this satisfies "at most once per session, never on internal navigation"
  without needing route-level suppression logic, since Next's client-side navigation does not
  remount the root layout's client components on every route change; a full server round trip
  (a real cold load) does.
- If not set, renders a fixed-position overlay: the seal ring draws itself with GSAP
  `DrawSVGPlugin`-free stroke-dashoffset animation (avoiding a paid GSAP plugin), the `अ` glyph
  fades and scales in, a `.rule-gilt` sweeps left to right, then the whole overlay lifts on a
  `y` transform and fades, using `motion`'s `AnimatePresence` for the exit so it composes
  cleanly with whatever mounts underneath.
- A hard `setTimeout` of 1400ms forces the exit regardless of animation state, satisfying the
  PRD's latency budget on a slow connection.
- Sets `sessionStorage.setItem("adhikaar-loaded", "1")` on mount, not on exit, so a user who
  navigates away mid-animation does not see it replay.
- Wrapped in `gsap.matchMedia()` / checks `window.matchMedia("(prefers-reduced-motion: reduce)")`
  before running the seal-strike sequence at all; under reduce, it renders a plain 300ms fade
  with no seal animation and exits.

**Route-level loaders** (`src/app/docket/loading.tsx`, `src/app/docket/[id]/loading.tsx`, and a
root `src/app/loading.tsx` for the App Router's own Suspense boundary mechanism): server
components, zero JS cost, rendering a parchment skeleton shaped like the destination page
(ledger-row placeholders for the docket list, a section-shaped skeleton for the case workspace).
This is the mechanism that actually removes the "dead pause on navigation" named in the audit;
the entry loader only covers first paint of the whole app.

## 6. Motion architecture

Two libraries, two distinct jobs, to avoid both fighting over the same DOM properties:

- **GSAP + ScrollTrigger**, landing page only, registered inside one client component
  (`src/components/landing/ActSequence.tsx`) via `gsap.context()` scoped to a ref, with cleanup
  in a `useEffect` return so React Strict Mode's double-invoke in development does not double
  register triggers. Owns: pinned act transitions, the evidence numeral count-up
  (`gsap.to` on a proxy object, `onUpdate` writing formatted text), the gilt rule draw-in, and
  a slow parallax on the statute-column background texture.
- **`motion`** (the current package name for what was Framer Motion), everywhere else. Owns:
  the citation popover open/close (replacing the current instant show/hide), status chip
  transitions, docket row stagger-in, and the loader's own exit.

Both are imported only inside files marked `"use client"`. Every Server Component under
`src/app` (the case workspace, the docket list, the intake form's static shell) stays server
rendered; the page is fully readable with JavaScript disabled, motion is additive.

**Reduced motion, enforced at the framework boundary, not per-component:**
- GSAP: every `ActSequence` timeline is built inside `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {...})`, so timelines simply do not construct under reduce; a separate, un-animated final-state layout renders instead.
- `motion`: components read `useReducedMotion()` from the library and pass `transition={{ duration: reduce ? 0 : ... }}`, or skip the `motion.*` wrapper entirely in favor of a plain element when true.
- The global CSS `@media (prefers-reduced-motion: reduce)` block in `globals.css` (already
  added) is the final backstop, forcing near-zero animation/transition durations on anything
  that slips through the JS-level checks.

## 7. File change map

| File | Change |
|---|---|
| `src/app/globals.css` | Cursor fixes, border-radius scoping, new tokens, texture utilities, motion-token block, reduced-motion media query |
| `src/app/layout.tsx` | Load `Tiro_Devanagari_Hindi`, mount `CourtLoader` |
| `src/components/CourtLoader.tsx` | New |
| `src/components/GithubMark.tsx` | New, inline SVG octocat |
| `src/components/Seal.tsx` | Use `.font-devanagari` |
| `src/components/SiteHeader.tsx` | Corrected repo URL, GitHub button treatment |
| `src/components/CitationTag.tsx` | `.cite-unresolved` split, `motion` popover |
| `src/app/loading.tsx`, `src/app/docket/loading.tsx`, `src/app/docket/[id]/loading.tsx` | New, server-rendered skeletons |
| `src/app/page.tsx` + `src/components/landing/*` | Landing page rebuilt into six acts per `PRD.md` |
| `src/app/docket/[id]/page.tsx` | Pending states unified across all six forms |
| `docs/screenshots/*.png` | Refreshed after implementation, README updated to match |

## 8. Non-changes

`src/lib/**` (jurisdiction, remedy, linter, deadlines, sweep, store, gemini, pdf) is untouched.
This is enforced by running `npm run test` after every implementation step; any red test means
a boundary was crossed that should not have been.
