# Design audit: Adhikaar

Conducted before the visual reconstruction described in `PRD.md` and `TDD.md`. This document
records the state of the product as it existed at the time of the audit, not the state after
the fixes it recommends.

## Route inventory

| Route | Purpose | Works well | Fails |
|---|---|---|---|
| `/` | Landing, the judge's first impression | Real evidence (`2,797 / 3,128`), honest coverage-limits section, correct copy | Six sections, one visual treatment: a 1px bordered box on flat parchment, repeated. No depth, no motion, no single moment that lands. The evidence numeral, the strongest fact in the product, is styled identically to a page footnote. |
| `/docket` | Case list | Real empty state with a call to action, working ledger striping | No entrance motion, no hover state beyond the underline on the applicant name, dense table with no visual rest |
| `/docket/new` | Intake form | Clear required-field marking, honest placeholder copy | Six form fields with identical border treatment, no field-level focus styling beyond the browser default, no pending state on submit |
| `/docket/[id]` | Case workspace, the densest page (437 lines) | Correct information architecture (remedy triage before jurisdiction before questions before filing), severity-coded lint findings | Every one of nine sections uses the same bordered-box pattern; only two of six forms (`QuestionComposer`, `PolishRewriteButton`) show a pending state; the deadline clock, the single most consequential piece of state in the app, is a plain list item with no visual weight |
| `/methodology` | The anti-wrapper argument | Strong content | Reads as a long unstyled document; the argument that a model may propose but never adjudicate deserves to look like an authority, not a wall of paragraphs |

## The four defects (fixed in this pass, tracked here for the record)

1. **`cursor: help` on a real `<button>`.** `.cite` in `globals.css` set `cursor: help`, and
   `CitationTag.tsx` renders a `<button>` with that class. This is the exact bug the user
   reported: a clickable element showing the cursor-plus-question-mark affordance instead of a
   hand. Root cause and fix in `TDD.md` §1.
2. **No button in the app showed a hand cursor at all.** Tailwind v4's preflight sets
   `button { cursor: default }`. The citation tag was the instance the user happened to notice;
   the defect was global.
3. **Dead Source link.** `SiteHeader.tsx` pointed at `github.com/harshkawatra11/oosc-hackathon`;
   the real remote is `harshkawatra11/Adhikaar-OOSC`. A 404 on the one link most likely to be
   clicked by a judge checking the code.
4. **The seal glyph (`अ`) had no font behind it.** `Seal.tsx` rendered it in `--font-display`
   (Fraunces), which carries no Devanagari glyphs, so every browser silently substituted its own
   system font. The seal, the single most recognisable mark in the product, rendered
   differently on every operating system.

## Heuristic pass

Scored 1 (fails) to 5 (excellent) against the five routes above, before the fixes in this pass.

| Heuristic | Score | Note |
|---|---|---|
| Visual hierarchy | 2/5 | Every section competes at the same visual weight; nothing is told to be the most important thing on the page |
| Feedback and latency | 2/5 | No loading states anywhere: cold navigation, cold Server Actions, and the first paint of a Gemini call are all silent |
| Affordance | 2/5 | Buttons, especially the citation tag, did not read as clickable at the cursor level |
| Consistency | 4/5 | The token system (`--paper`, `--ink`, `--seal`, `--gilt` etc.) is used correctly and consistently everywhere it appears; the failure is in variety of application, not discipline |
| Motion | 1/5 | None. Zero transitions, zero entrance animation, zero scroll-linked behaviour |
| Accessibility (contrast, focus, keyboard) | 3/5 | Contrast ratios pass at the token level (ink on paper is high-contrast by construction); focus rings are the unstyled browser default, which is visible but not integrated into the design language |

## Verdict

The concept is right and the palette is not the problem. Adhikaar's execution is *uniform to
the point of monotony*: every section, on every page, is a bordered rectangle on flat
parchment. Nothing in the product currently tells a viewer where to look first, and nothing
moves. For a hackathon landing page specifically, that flatness costs the product its strongest
asset, which is that the evidence behind its claim is real and specific. `PRD.md` sets the
requirements for fixing this; `TDD.md` sets how.
