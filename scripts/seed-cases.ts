// Resets the docket to a believable demo caseload: real applicant names
// across different states, real subject matters spanning the actual
// authority directory (not just one repeated land-record grievance),
// and a genuine spread of statuses. Every jurisdiction/remedy/lint/
// deadline result here is computed by calling the exact same
// deterministic functions actions.ts calls, in the same order, never
// hand-written; the only thing scripted is which grievance text and
// which UI steps a case walks through, exactly mirroring what an
// operator clicking through the app would produce.
//
// Run with: npm run seed:demo
// Requires FIREBASE_* in .env.local (or the environment); refuses to
// run against the local file store, since a demo reset should not
// silently touch a different, cheaper backend than intended.

import { randomUUID } from "crypto";
import { isFirestoreConfigured } from "../src/lib/firestore/client";
import { firestoreStore } from "../src/lib/store/firestoreStore";
import { runJurisdictionTriage } from "../src/lib/jurisdiction";
import { runRemedyTriage } from "../src/lib/remedy";
import { lintQuestion } from "../src/lib/linter/rules";
import { computeInitialDeadlines } from "../src/lib/deadlines";
import { sweepCase } from "../src/lib/sweep";
import type { CaseRecord, DraftQuestion } from "../src/lib/types";

if (!isFirestoreConfigured()) {
  console.error(
    "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not all set. " +
      "Refusing to run: this script only ever targets Firestore, never the local file store."
  );
  process.exit(1);
}

const store = firestoreStore;

function addQuestion(text: string): DraftQuestion {
  return { id: randomUUID(), text, findings: lintQuestion(text) };
}

function acceptRewrite(question: DraftQuestion): DraftQuestion {
  const finding = question.findings.find((f) => f.suggestedRewrite);
  if (!finding?.suggestedRewrite) return question;
  const rewrite = finding.suggestedRewrite;
  return { ...question, originalText: question.text, text: rewrite, findings: lintQuestion(rewrite) };
}

interface Scenario {
  name: string;
  address: string;
  state: string;
  isBpl: boolean;
  preferredLanguage: string;
  grievanceRaw: string;
  /** How far through the lifecycle this case gets walked. */
  stage: "triaged" | "drafted" | "filed" | "swept";
  questions?: string[];
  /** Accept the mechanical rewrite on the first question, if one fires. */
  acceptFirstRewrite?: boolean;
  filedDate?: string;
  simulateSweepDate?: string;
  /**
   * Force the authority selection to this id instead of the top-ranked
   * candidate. Exists for exactly one purpose: to demonstrate the
   * jurisdiction engine's blockingWarning by walking a State-subject
   * grievance through selecting a wrong, Central authority for it, the
   * way an operator who ignores the ranked suggestions actually could.
   */
  overrideAuthorityId?: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Priya Deshmukh",
    address: "Flat 12, Vijay Nagar Society, Nashik, Maharashtra",
    state: "Maharashtra",
    isBpl: false,
    preferredLanguage: "Marathi",
    grievanceRaw:
      "I want a copy of the 7/12 extract and mutation register entry for my late father's agricultural land, khasra number 88, Nashik taluka, showing the ownership transfer to my name.",
    stage: "filed",
    questions: [
      "Please provide a certified copy of the 7/12 extract and mutation register entry for khasra number 88, Nashik taluka, for the period 2020 to 2024.",
    ],
    // Filed 8 days ago against a 30-day section 7(1) clock leaves ~22
    // days on the countdown: a live, reassuring deadline card, not one
    // that reads as either brand new or nearly overdue.
    filedDate: daysAgo(8),
  },
  {
    name: "Mohammed Aslam",
    address: "House 4, Gali No. 7, Seelampur, Delhi",
    state: "Delhi",
    isBpl: true,
    preferredLanguage: "Hindi",
    grievanceRaw:
      "I want a copy of the FIR I filed at my local police station three weeks ago regarding a mobile phone theft, and to know what action has been taken so far.",
    stage: "triaged",
  },
  {
    name: "Ananya Iyer",
    address: "B-204, Lakeview Apartments, Powai, Mumbai",
    state: "",
    isBpl: false,
    preferredLanguage: "English",
    grievanceRaw:
      "I applied for renewal of my passport four months ago at the Regional Passport Office and have received no update since the police verification stage. I want to know the current status and the reason for the delay.",
    stage: "swept",
    questions: [
      "Please provide the current status of my passport renewal application, the date of completion of police verification, and the reason for any delay beyond the standard processing time.",
    ],
    filedDate: daysAgo(52),
    simulateSweepDate: daysAgo(0),
  },
  {
    name: "Ramesh Yadav",
    address: "Plot 9, Sector 14, Faridabad (correspondence via Delhi office)",
    state: "",
    isBpl: false,
    preferredLanguage: "Hindi",
    grievanceRaw:
      "I want a copy of my Provident Fund passbook statement and the current status of my PF withdrawal claim, UAN linked to my previous employer, submitted two months ago.",
    stage: "filed",
    questions: [
      "Please provide a copy of my Provident Fund passbook statement for the last three years and the current processing status of my withdrawal claim.",
    ],
    filedDate: daysAgo(14),
  },
  {
    name: "Kavita Joshi",
    address: "23 Model Town, Delhi",
    state: "Delhi",
    isBpl: false,
    preferredLanguage: "English",
    grievanceRaw:
      "I want a copy of my original Aadhaar enrolment form and the history of correction requests I have submitted to UIDAI for my date of birth.",
    stage: "triaged",
  },
  {
    name: "Arjun Nair",
    address: "14 Cunningham Road, Bengaluru",
    state: "",
    isBpl: false,
    preferredLanguage: "English",
    grievanceRaw:
      "Why has my income tax refund for assessment year 2024-25 not been processed yet, it has been six months since I filed my return.",
    stage: "drafted",
    questions: [
      "Why has my income tax refund for assessment year 2024-25 not been processed yet",
    ],
    acceptFirstRewrite: true,
  },
  {
    name: "Sunita Devi",
    address: "Village Wathoda, Nagpur Taluka, Maharashtra",
    state: "Maharashtra",
    isBpl: true,
    preferredLanguage: "Marathi",
    grievanceRaw:
      "Why did the tehsildar reject my mutation application for khasra number 55, Nagpur taluka, last year without giving any written reason.",
    stage: "drafted",
    questions: [
      "Why did the tehsildar reject my mutation application for khasra number 55 last year",
    ],
    acceptFirstRewrite: true,
  },
  {
    name: "Deepak Gupta",
    address: "44 Indiranagar 2nd Stage, Bengaluru, Karnataka",
    state: "Other",
    isBpl: false,
    preferredLanguage: "English",
    grievanceRaw:
      "I want a copy of the land records and mutation register for my residential plot in Bengaluru, Karnataka, khata number 1123.",
    stage: "triaged",
  },
  {
    name: "Fatima Sheikh",
    address: "77 Andheri West, Mumbai, Maharashtra",
    state: "Maharashtra",
    isBpl: false,
    preferredLanguage: "English",
    grievanceRaw:
      "I bought a washing machine online for Rs 38,000 that arrived defective, and the seller is refusing to refund me despite the product being under warranty.",
    stage: "triaged",
  },
  {
    // Deliberately walks a State-subject (land) grievance through
    // selecting the Department of Land Resources, a Central authority,
    // instead of the correctly-ranked Maharashtra Revenue Department
    // candidate. This is the one scenario in the docket that exists to
    // show the jurisdiction engine's blockingWarning actually firing
    // (src/lib/jurisdiction.ts, the selectedAuthorityId branch): the
    // single most important thing this tool demonstrates is catching a
    // wrong-authority filing before it goes out and gets returned
    // without a refund. Left at "drafted", not "filed", since the whole
    // point is that this gets caught before filing.
    name: "Suresh Patil",
    address: "14 Shivaji Nagar, Pune, Maharashtra",
    state: "Maharashtra",
    isBpl: false,
    preferredLanguage: "Marathi",
    grievanceRaw:
      "I want a copy of the 7/12 extract and mutation register entry for my agricultural land in Haveli taluka, Pune, khasra number 231. I went to the tehsildar's office twice and they keep telling me to come back later without giving any reason.",
    stage: "drafted",
    questions: [
      "Please provide a certified copy of the 7/12 extract and mutation register entry for khasra number 231, Haveli taluka, Pune district, for the last five years.",
    ],
    overrideAuthorityId: "dolr",
  },
  {
    name: "Vikram Singh",
    address: "19 Rajouri Garden, Delhi",
    state: "Delhi",
    isBpl: false,
    preferredLanguage: "Hindi",
    grievanceRaw:
      "My landlord is refusing to return my security deposit of Rs 50,000 after I vacated the flat two months ago, despite no damage to the property.",
    stage: "triaged",
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// The full purge-and-reseed sequence is 40+ Firestore writes, comfortably
// over the in-process rate limiter's 30-per-60-seconds backstop
// (src/lib/firestore/rateLimit.ts) if fired back to back. That limiter
// is a deliberate cost-safety control, not a bug to route around; this
// script paces itself under it instead, at roughly 24 writes per
// 60-second window, so a full reseed always completes in one run.
const WRITE_PACE_MS = 2500;
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The demo account's uid, created via the Identity Toolkit
// accounts:signUp endpoint (see .env.example's DEMO_UID comment).
// Seeding under this uid, rather than a placeholder, is what makes the
// "Enter as a demo citizen" login on /login show real data; WP9 still
// owns the fuller rewrite of the scenario set itself.
if (!process.env.DEMO_UID) {
  console.error("DEMO_UID is not set. Create the demo account once (see .env.example) and set its uid here.");
  process.exit(1);
}
const TEMP_OWNER_UID: string = process.env.DEMO_UID;

async function purgeExisting(): Promise<void> {
  const existing = await store.listCases(TEMP_OWNER_UID);
  console.log(`Purging ${existing.length} existing case(s)...`);
  for (const c of existing) {
    await store.deleteCase(c.id, TEMP_OWNER_UID);
    await sleep(WRITE_PACE_MS);
  }
}

async function buildScenario(s: Scenario): Promise<void> {
  const lowConfidenceFields: string[] = [];
  if (!s.name) lowConfidenceFields.push("applicant.name");
  if (!s.address) lowConfidenceFields.push("applicant.address");
  if (!s.state) lowConfidenceFields.push("geography.state");

  const jurisdiction = runJurisdictionTriage({ grievanceText: s.grievanceRaw, state: s.state });
  const remedy = runRemedyTriage(s.grievanceRaw);

  let record: CaseRecord = await store.createCase({
    ownerUid: TEMP_OWNER_UID,
    status: "triaged",
    applicant: { name: s.name, address: s.address, isBpl: s.isBpl, preferredLanguage: s.preferredLanguage },
    grievanceSummary: s.grievanceRaw.slice(0, 220),
    grievanceRaw: s.grievanceRaw,
    lowConfidenceFields,
    jurisdiction,
    remedy,
    questions: [],
    deadlines: [],
    operatorNotes: "",
  });
  await sleep(WRITE_PACE_MS);

  if (s.stage === "triaged") {
    console.log(`  ${s.name}: triaged only (${jurisdiction.subjectMatter}, ${jurisdiction.candidates.length} candidate(s))`);
    return;
  }

  // Select the top authority candidate, same as an operator clicking the
  // first radio button and confirming, unless the scenario deliberately
  // overrides that (see overrideAuthorityId) to exercise the wrong-
  // authority blockingWarning path instead.
  const topCandidate = jurisdiction.candidates[0];
  const authorityIdToSelect = s.overrideAuthorityId ?? topCandidate?.authorityId;
  if (authorityIdToSelect) {
    const reJurisdiction = runJurisdictionTriage({
      grievanceText: s.grievanceRaw,
      state: s.state || topCandidate?.state,
      selectedAuthorityId: authorityIdToSelect,
    });
    record = (await store.updateCase(record.id, TEMP_OWNER_UID, {
      selectedAuthorityId: authorityIdToSelect,
      jurisdiction: reJurisdiction,
    }))!;
    await sleep(WRITE_PACE_MS);
    if (reJurisdiction.blockingWarning) {
      console.log(
        `  ${s.name}: blockingWarning fired on authority "${authorityIdToSelect}" (${reJurisdiction.blockingWarning.citationId})`
      );
    }
  }

  const questions: DraftQuestion[] = [];
  for (const text of s.questions ?? []) {
    let q = addQuestion(text);
    if (s.acceptFirstRewrite && q.findings.some((f) => f.suggestedRewrite)) {
      q = acceptRewrite(q);
    }
    questions.push(q);
  }
  if (questions.length) {
    record = (await store.updateCase(record.id, TEMP_OWNER_UID, {
      questions,
      status: record.status === "triaged" ? "drafted" : record.status,
    }))!;
    await sleep(WRITE_PACE_MS);
  }

  if (s.stage === "drafted") {
    console.log(`  ${s.name}: drafted (${questions.length} question(s))`);
    return;
  }

  if (s.filedDate) {
    const deadlines = computeInitialDeadlines({ filedDate: s.filedDate, lifeOrLiberty: false, viaApio: false });
    record = (await store.updateCase(record.id, TEMP_OWNER_UID, { status: "awaiting_response", filedDate: s.filedDate, deadlines }))!;
    await sleep(WRITE_PACE_MS);
  }

  if (s.stage === "filed") {
    console.log(`  ${s.name}: filed on ${s.filedDate}, clock running`);
    return;
  }

  if (s.stage === "swept") {
    const now = s.simulateSweepDate ? new Date(s.simulateSweepDate) : new Date();
    const result = sweepCase(record, now);
    if (result.changed) {
      const remainingDeadlines = record.deadlines.filter(
        (d) => !result.updatedDeadlines.some((u) => u.id === d.id)
      );
      const patch: Partial<CaseRecord> = {
        deadlines: [...remainingDeadlines, ...result.updatedDeadlines, ...result.newDeadlines],
      };
      if (result.nextStatus) patch.status = result.nextStatus;
      if (result.firstAppealDraft) {
        patch.operatorNotes = `Auto-drafted first appeal (${new Date().toISOString().slice(0, 10)})\n\n${result.firstAppealDraft}`;
      }
      record = (await store.updateCase(record.id, TEMP_OWNER_UID, patch))!;
      await sleep(WRITE_PACE_MS);
    }
    console.log(`  ${s.name}: swept -> status ${record.status}`);
  }
}

async function main() {
  await purgeExisting();
  console.log(`Seeding ${SCENARIOS.length} realistic case(s)...`);
  for (const s of SCENARIOS) {
    await buildScenario(s);
  }
  const final = await store.listCases(TEMP_OWNER_UID);
  console.log(`Done. Docket now has ${final.length} case(s).`);
}

main().catch((e) => {
  console.error("Seed script failed:", e);
  process.exit(1);
});
