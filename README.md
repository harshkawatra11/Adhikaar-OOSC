# Adhikaar

A jurisdiction-aware caseload workbench for Right to Information applications, built for the person who files them on behalf of others rather than for a single citizen filing once: a Common Service Centre operator, a legal aid volunteer, an RTI activist.

Built for the OOSC 4.0 Hackathon, Problem Statement 3, AI for Civic and Legal Empowerment.

## The claim this is built on

The Department of Land Resources publishes its own register of RTI applications and how each one was disposed of, under section 4 of the Act. That register was downloaded and parsed in full: 3,128 uniquely numbered applications, 2,797 of them returned to the applicant, not answered, with no refund of the fee. The department states the reason itself, quoting a 2008 Office Memorandum: an application concerning a State subject, most often a land record, does not have to be transferred by a Central Public Information Officer. It is simply sent back.

That register belongs to a central land department, and land is almost entirely a State subject, so its return rate is not representative of RTI practice nationally and should never be quoted as one. It is the clearest primary source available for the specific failure this product targets: the section 6(3) transfer duty does not reach across the Union to State line, and an application addressed to the wrong level of government is a defect that can be caught before it is filed, not just diagnosed afterward.

Full sourcing, the national context figures, and the honesty caveat around the register are on the [Methodology](/methodology) page inside the running app.

## What it does

1. **Remedy triage.** Decides whether the grievance needs a records request at all before drafting anything. A refund, a wage payment or an eviction stopping is not something a Public Information Officer can grant; those are routed to the correct forum instead, with consumer pecuniary jurisdiction computed from the price paid.
2. **Jurisdiction triage.** Classifies the subject matter against the Constitution's Seventh Schedule, Union, State or Concurrent, before an authority is ever suggested. Selecting a Central authority for a State subject is blocked outright, citing the exact rule and the DoPT Office Memorandum behind it.
3. **The legality linter.** Eighteen deterministic rules run against every drafted question, each one citing the section of the Right to Information Act it comes from. An opinion-seeking question ("why did you reject this") is flagged and rewritten as a records request before it is ever posted, since section 2(f) does not entitle an applicant to an opinion the authority has not already recorded.
4. **The statutory clock.** Once a case is marked filed, every deadline is computed and tracked: the thirty-day response window under section 7(1), the forty-eight hour life-or-liberty track, the First Appeal window under section 19(1), the Second Appeal window under section 19(3). A daily sweep (demonstrated manually in the running app, intended as a Cloud Scheduler job in production) checks every open case and, on a lapsed deadline, moves it to a deemed refusal and drafts the First Appeal automatically, citing section 7(2), section 19(1) and the free of cost provision at section 7(6), with no further input required.
5. **A real PDF.** The finished application exports as a formal, properly addressed document, ready for a human to review and post. Nothing is filed automatically.

## The boundary between code and a language model

This system does not ask a model to decide anything a citizen's fee or filing depends on. A model may propose and phrase; it may never adjudicate or compute. The full table is on the Methodology page; the short version:

| Decision | Made by |
|---|---|
| Union, State or Concurrent subject matter | Deterministic code, a Seventh Schedule mapping |
| Whether a question is legally refusable | Deterministic code, the eighteen-rule linter |
| Deadline arithmetic | Deterministic code, pure date functions |
| Application fee for a given state | Deterministic code, a cited lookup table |
| Whether a legal claim may render on screen | Deterministic code, a citation render gate that throws on an unresolved citation |
| Rephrasing a question, translation, tone | Proposed by a rule-based rewrite; a human accepts or rejects it |

No Gemini or other model API key is required to run this prototype end to end, or to file a single case. Every decision above is plain TypeScript, which is also why it is fully testable offline, and why the 94-test suite and the evaluation harness both run with no key configured. A key only turns on two additive, clearly-labelled phrasing features described below.

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Case data is stored in a local JSON file at `.data/cases.json`, created on first run and excluded from version control since it can contain citizen personal information during local testing. The architecture this design intends for production is Firestore, org-scoped, with a Cloud Scheduler job running the daily sweep; the local file store implements the same function signatures so that swap touches one file, `src/lib/store.ts`.

**Deployed on Vercel at [adhikaaroosc.vercel.app](https://adhikaaroosc.vercel.app), backed by a real Firestore database.** `src/lib/store.ts` uses Firestore automatically once a service account is present in the environment (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), which is how the live deployment runs; without those three set, it falls back to the local JSON file described above, which is how local development runs by default. A serverless function's own bundle directory is read-only at runtime, so the file store cannot be the production answer on Vercel regardless: only `/tmp` is writable there, and it is ephemeral and not shared across instances. That fallback still exists and is used automatically if Firestore is not configured, so the product runs with zero cloud setup, but it is not what the live URL runs on.

### Cost safety on the live deployment

The Firestore database backing the live URL was provisioned on Google Cloud's perpetual free tier for Firestore, not a trial credit: 50,000 reads, 20,000 writes and 20,000 deletes a day, 1 GiB of storage, every day, for as long as the project exists. Three layers sit on top of that ceiling rather than relying on it alone:

1. **A GCP billing budget alert** on the project, firing at 1 cent, 50 cents and one dollar of spend, so a human is notified quickly if anything unexpected happens.
2. **An in-process write rate limit** (`src/lib/firestore/rateLimit.ts`), thirty writes per minute per server instance, as a backstop against a bug or a scripted loop, not the primary control.
3. **A minimally-scoped service account**, holding only `roles/datastore.user` on a dedicated GCP project, unable to touch billing or create other resources even if the key were compromised.

None of this is a hard, provider-enforced $0 cap; Google Cloud does not offer one without disabling billing entirely, which would also take the database down. Ordinary hackathon-demo traffic does not come close to the free-tier ceiling, and the budget alert is the real backstop if something unexpected ever did.

### Optional: Gemini-backed features

Every decision the product makes, jurisdiction, legality, deadlines, fees, citations, is plain deterministic code and needs no API key at all. Two additive features use Gemini for the two things a model is allowed to do here, propose a rewrite and phrase a translation, both described on the Methodology page:

- A plain-language, translated copy of the filed questions for the citizen, always shown beside the formal English original.
- An optional, more natural-sounding alternative to the linter's own mechanical rewrite of a non-compliant question, offered beside the mechanical one, never in place of it.

To turn these on:

```bash
cp .env.example .env.local
```

Fill in `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey), wired to a Gemini-enabled Google Cloud project. `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`. Without a key, both features show a clear inline message rather than failing silently or affecting anything else on the page, which is exactly what the automated test suite and the browser walkthrough below were run against before any key existed.

```bash
npm run test    # 94 tests: every linter rule fixtured pass and fail, deadline arithmetic, the citation gate, jurisdiction and remedy triage, the sweep pipeline, PDF generation
npm run eval    # measures the jurisdiction classifier against a 220-record gold set sampled from the real DoLR disclosure register
npm run build   # production build
```

## What is covered, and what is deliberately not

Two states are covered by name in the authority directory, Delhi and Maharashtra, alongside twelve central ministries and departments. No other state is covered, and the system says so in the interface rather than guessing an address. Tenancy disputes are recognised and routed to the correct forum by name, but no state rent authority is covered in depth, since tenancy law has no uniform national statute. The Scheme Eligibility Reader direction from the problem statement was deliberately left unbuilt: telling someone they qualify for a scheme does not move them closer to receiving it, since documentation and last-mile delivery are usually the real constraint. The full reasoning for every scoping decision is on the Methodology page.

This is an assistive drafting tool, not a source of legal advice, and every document it produces requires human review before it is filed.

## Stack

Next.js 16 with the App Router, TypeScript, Tailwind CSS 4. Server Actions for mutations, a file-backed store standing in for Firestore, `pdf-lib` for document generation, Vitest for the test suite. No external API calls are required to run or evaluate the deterministic core described above.

## License

Apache License, Version 2.0. See `LICENSE`.
