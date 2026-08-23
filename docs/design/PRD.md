# PRD: Adhikaar visual reconstruction

## Problem

Adhikaar's engineering is complete and tested (109 passing tests, a working deterministic
triage/lint/deadline pipeline, a live Gemini fallback chain). Its presentation does not carry
that weight. See `AUDIT.md` for the full inventory; in short, every page is a flat, uniformly
bordered document with no depth, no motion, and no loading feedback, and the landing page in
particular buries its strongest evidence inside a treatment identical to a footnote.

## Audience and the moment that matters

Two readers, in this order:

1. **A hackathon judge**, roughly ninety seconds on the landing page before deciding whether to
   look further. They have seen many landing pages this week. What earns the extra ninety
   seconds is a claim that is specific, evidenced, and visually inevitable, not a claim that is
   merely present.
2. **A Common Service Centre operator or legal aid volunteer**, the actual user, who will spend
   real time inside `/docket/[id]` filing cases for other people. For them the interior pages
   matter more than the landing page; clarity and speed beat drama.

The landing page is optimised for reader 1. The interior pages are optimised for reader 2.

## The single message

*Adhikaar decides whether an application can be answered before it drafts anything, and it
proves this with a real number from a real government register: 2,797 of 3,128 applications to
one department were returned unanswered, not refused, because they were addressed to the wrong
government.* Every design decision in this pass exists to make that sentence land in the first
scroll, not the fourth.

## Required user journey (landing page)

1. Land on the charge: the headline is legible and commanding within one second, no motion
   required to read it.
2. Scroll into the evidence: the numeral resolves as a genuine moment, not a static stat block.
3. Understand the mechanism: what the four checks do, in sequence, presented as a process.
4. See the limits stated honestly: where the directory does not reach.
5. Leave with one clear next action: open a new case, or read the methodology.

## Acceptance criteria

### Landing page
- The evidence numeral is the visually loudest element on the page after the headline.
- The page reads correctly and completely with JavaScript disabled: no content is
  motion-gated.
- No layout shift attributable to the loader or to scroll-triggered animation
  (cumulative layout shift budget: 0.1).
- Largest Contentful Paint budget: under 2.5s on a throttled connection in local testing.

### Loader
- Plays at most once per session (gated on `sessionStorage`), never on internal navigation.
- Total duration under 1.4s; never blocks interaction past that window even on a slow
  connection (a hard timeout dismisses it regardless of animation state).
- Fully skipped, replaced by an instant fade, under `prefers-reduced-motion: reduce`.

### Motion, sitewide
- Every animated property change has a `prefers-reduced-motion: reduce` fallback that settles
  instantly at the final state. This is verified, not assumed: a screenshot pass runs with
  reduced motion emulated and must match the no-motion-needed final layout.
- No animation traps focus or delays a keyboard user's ability to reach the next interactive
  element.

### Interior pages (case workspace, docket, intake, methodology)
- Every Server Action-backed form shows a visible pending state between submit and the next
  render. Today two of six forms on `/docket/[id]` do; after this pass, six of six do.
- Every clickable element shows `cursor: pointer` (or `not-allowed` when disabled); this is
  checked directly, not inferred, per the reported bug.
- Route-level `loading.tsx` exists for `/docket` and `/docket/[id]`, so cold navigation is never
  a silent pause.

### Accessibility
- Contrast stays at or above WCAG AA for all text-on-ground pairings, including the new dark
  "act" sections.
- Focus is visible against both parchment and the new dark ground at every interactive element,
  reachable in a logical tab order.

## Non-goals

- No change to `src/lib` (the deterministic triage, linting, deadline, or store logic). This is
  a presentation-layer pass only.
- No palette or type-family replacement. The parchment/oxblood/gilt system and the Fraunces /
  Source Serif / IBM Plex Mono stack are kept and extended, not discarded (decision recorded in
  the implementation plan).
- No regression to the functional test suite (109 tests) or to the live end-to-end flow
  (intake through PDF export).
