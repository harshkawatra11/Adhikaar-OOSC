# Handoff: Adhikaar visual reconstruction

Ordered work packages. Each lists its files, its acceptance check, and its verification
command, so the build is executable directly from this document.

## WP0: Verified-defect fixes

**Status: done, first commit of this pass.**

- Cursor fixes (`.cite` split, global `cursor: pointer` restoration): `src/app/globals.css`
- `border-radius` reset scoped, `!important` removed: `src/app/globals.css`
- GitHub button (correct URL, octocat mark, black/white treatment): `src/components/SiteHeader.tsx`, `src/components/GithubMark.tsx`
- Devanagari font for the seal glyph: `src/app/layout.tsx`, `src/components/Seal.tsx`

**Check:** `npm run build` clean; a Playwright pass asserting `getComputedStyle` on the citation
tag, a nav link, and a form submit button all report `cursor: pointer`.

## WP1: Design docs

**Status: done, this commit.** `docs/design/AUDIT.md`, `PRD.md`, `TDD.md`, `HANDOFF.md`.

## WP2: Design system token layer

**Files:** `src/app/globals.css`

- Dark-ground tokens, foil tokens, emboss/deboss shadows, fluid type scale, motion tokens,
  paper-grain texture utility, `.act-dark`, `.rule-gilt`, `.rule-foil`, `.panel-lift`,
  `.panel-emboss`.

**Check:** `npm run build` clean, no unused-token lint warnings, visually spot-checked against
one throwaway test element before use in real components.

## WP3: Dependencies

**Command:** `npm install gsap motion`

**Check:** `npm run build` succeeds with both imported in a placeholder client component;
bundle size delta is acceptable (both are client-only, code-split by route since the landing
page's `ActSequence` is the only GSAP consumer).

## WP4: Loader

**Files:** `src/components/CourtLoader.tsx` (new), `src/app/layout.tsx` (mount it),
`src/app/loading.tsx`, `src/app/docket/loading.tsx`, `src/app/docket/[id]/loading.tsx` (new)

**Check:** cold load shows the seal-strike sequence once; a second cold load in the same tab
(same `sessionStorage`) does not; internal navigation between routes never shows it; emulating
`prefers-reduced-motion: reduce` shows a plain fade only; throttling the network does not delay
interaction past 1.4s (hard timeout).

## WP5: Motion primitives

**Files:** `src/components/landing/ActSequence.tsx` (GSAP context + ScrollTrigger setup),
`src/components/CitationTag.tsx` (motion popover)

**Check:** `gsap.context()` cleanup verified by mounting/unmounting in Strict Mode dev without
duplicate ScrollTriggers (checked via `ScrollTrigger.getAll().length` in a dev console);
`useReducedMotion` branch manually verified with the OS setting toggled.

## WP6: Landing page reconstruction

**Files:** `src/app/page.tsx` (rewritten to compose sections), new components under
`src/components/landing/`: `HeroAct.tsx`, `EvidenceAct.tsx`, `ContextAct.tsx`, `ProcessAct.tsx`,
`CoverageAct.tsx`, `CloseAct.tsx`

All copy and sourced figures carry over verbatim from the current `page.tsx`; only the
presentation changes. Six acts, alternating parchment and dark ground, per `PRD.md` §"Required
user journey."

**Check:** every sourced number (`2,797`, `3,128`, `89 percent`, the CSC figures) matches
`src/lib/data/evidence.ts` and `src/lib/data/authorities.ts` exactly, same numbers as before the
rewrite; page reads correctly with JavaScript disabled (`curl` the SSR HTML and confirm the
headline and evidence numeral are present in the markup, not injected client-side).

## WP7: Interior page pass

**Files:** `src/app/docket/[id]/page.tsx` (pending states on all six forms), `src/app/docket/page.tsx` (row entrance, empty state polish), `src/app/methodology/page.tsx` (running heads, numbered sections), `src/components/SiteHeader.tsx` (active-route indicator, scroll-triggered underline)

**Check:** every form on `/docket/[id]` shows a visible pending state (spinner, disabled button
text change, or skeleton) between submit and next render.

## WP8: Verification sweep

1. `npm run test`: all 109+ tests pass, `src/lib` untouched.
2. `npm run build`, `npx eslint .`: clean.
3. Playwright pass: all five routes at 1440px and 390px, zero console errors, cursor check
   (WP0), reduced-motion screenshot pass, keyboard tab-order pass on landing + case workspace.
4. Grep all new/changed copy for em-dash and en-dash bytes: must return nothing.
5. Full end-to-end functional flow against localhost (intake → triage → lint → file → sweep →
   deemed refusal → appeal → PDF) to confirm zero functional regression.
6. Redeploy to Vercel production, re-alias `adhikaaroosc.vercel.app`, repeat the end-to-end flow
   against the live URL.
7. Refresh `docs/screenshots/*.png`, update README image references, commit.
