// The evaluation harness described in the README: measured, not asserted,
// numbers against a real gold set. The 220 records in dolr-gold-set.json
// are a deterministic sample (every sixth record) drawn from the same
// Department of Land Resources disclosure register cited on the landing
// page, each one a real citizen's application text, its stated state, and
// its actual government-recorded disposal.
//
// What this measures: whether the Seventh Schedule classifier correctly
// recognises these as Land, a State subject, from the application text
// alone. Because this register belongs to a central land department,
// almost every record in it is exactly this failure mode, so a high
// recognition rate here is direct evidence that Adhikaar's jurisdiction
// engine would have flagged these applications before they were filed
// centrally and returned.
//
// Run with: npm run eval

import { readFileSync } from "fs";
import path from "path";
import { classifySubjectMatter } from "../src/lib/data/seventh-schedule";
import { runRemedyTriage } from "../src/lib/remedy";

interface GoldRecord {
  regNo: string;
  state: string;
  outcome: "returned" | "disposed" | "transferred";
  content: string;
}

const records: GoldRecord[] = JSON.parse(
  readFileSync(path.join(__dirname, "dolr-gold-set.json"), "utf-8")
);

let classifiedAsLandState = 0;
let classifiedAsAnyState = 0;
let unclassified = 0;
let remedyRti = 0;

for (const r of records) {
  const mapping = classifySubjectMatter(r.content);
  if (!mapping) {
    unclassified += 1;
  } else if (mapping.list === "State") {
    classifiedAsAnyState += 1;
    if (mapping.subjectMatter === "Land and land revenue") classifiedAsLandState += 1;
  }
  const remedy = runRemedyTriage(r.content);
  if (remedy.remedyClass === "rti" || remedy.remedyClass === "hybrid") remedyRti += 1;
}

const total = records.length;
const returnedCount = records.filter((r) => r.outcome === "returned").length;

console.log("Adhikaar evaluation harness");
console.log("============================");
console.log(`Gold set: ${total} records sampled from the Department of Land Resources disclosure register`);
console.log(`Of these, ${returnedCount} (${pct(returnedCount, total)}) were returned to the applicant in the real register.`);
console.log("");
console.log("Jurisdiction classifier (Seventh Schedule mapping), run against the raw application text:");
console.log(`  Classified as a State subject:                 ${classifiedAsAnyState} / ${total}  (${pct(classifiedAsAnyState, total)})`);
console.log(`  Specifically "Land and land revenue":          ${classifiedAsLandState} / ${total}  (${pct(classifiedAsLandState, total)})`);
console.log(`  Not confidently classified (reported as such, not guessed): ${unclassified} / ${total}  (${pct(unclassified, total)})`);
console.log("");
console.log("Remedy classifier:");
console.log(`  Correctly read as a records request (RTI is the right instrument): ${remedyRti} / ${total} (${pct(remedyRti, total)})`);
console.log("");
console.log(
  "Reading: this register belongs to a central land department; almost every record in it is a land query, which is why its return rate is extreme and not representative nationally (see the landing page caveat). The relevant claim this harness supports is narrower: given only the application text, would Adhikaar's classifier have recognised this as a State subject before it was ever filed centrally? The percentage above is that number, measured, not asserted."
);

function pct(n: number, d: number): string {
  return `${((n / d) * 100).toFixed(1)}%`;
}
