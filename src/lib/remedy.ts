// Remedy triage: decide whether RTI is even the right instrument before
// anything is drafted. RTI obtains records held by a public authority.
// It does not, by itself, deliver a refund, a wage payment or an eviction
// order. A tool that always produces an RTI draft regardless of what the
// citizen actually needs is not being helpful, it is being compliant.
// This is deterministic keyword and pattern classification, not a model
// call, for the same reason the jurisdiction engine is: the verdict here
// changes what gets filed, and that decision should be auditable.

import type { RemedyClass, RemedyTriageResult } from "@/lib/types";

interface RemedyRule {
  remedyClass: RemedyClass;
  keywords: string[];
  forumName: string;
  limitationPeriod: string;
  guidanceNote: string;
  citationIds: string[];
}

const REMEDY_RULES: RemedyRule[] = [
  {
    remedyClass: "consumer",
    keywords: [
      "refund", "defective", "faulty product", "warranty", "deficient service",
      "did not deliver", "wrong item", "overcharged", "e-commerce", "cheated by seller",
      "insurance claim denied", "builder delay", "possession delay",
    ],
    forumName: "Consumer Disputes Redressal Commission, filed through the e-Daakhil portal",
    limitationPeriod: "Two years from the date the cause of action arose, under section 69 of the Consumer Protection Act, 2019",
    guidanceNote:
      "This is a dispute about goods or services already paid for, not a request for a record held by a public authority. An RTI application will not produce a refund or a repair. File a consumer complaint instead. If a record is needed as evidence, for example a builder's sanctioned plan, an RTI to obtain that record and a consumer complaint to obtain relief are a normal combination, filed as two separate instruments.",
    citationIds: [],
  },
  {
    remedyClass: "labour",
    keywords: [
      "wages not paid", "salary not paid", "unfair dismissal", "terminated without notice",
      "provident fund not credited", "bonus not paid", "gratuity not paid", "labour dispute",
    ],
    forumName: "Labour Commissioner of the concerned state, or the Regional Provident Fund Commissioner for an EPF grievance",
    limitationPeriod: "Varies by claim type; a payment of wages claim generally must be filed within twelve months of the wages falling due",
    guidanceNote:
      "This is a claim for money or reinstatement, which a labour authority or tribunal grants, not information a public authority holds. An RTI to obtain your own service record or PF passbook can support the claim, but the claim itself belongs before the Labour Commissioner or the appropriate industrial forum.",
    citationIds: [],
  },
  {
    remedyClass: "tenancy",
    keywords: [
      "landlord", "tenant", "eviction", "rent not returned", "security deposit not returned",
      "rent agreement dispute",
    ],
    forumName: "State Rent Authority or Rent Control Court of the relevant state",
    limitationPeriod: "Governed by the state's own Rent Control or Model Tenancy Act; there is no single national limitation period",
    guidanceNote:
      "Tenancy law is entirely state-legislated with no uniform national statute, and this directory does not cover any state's rent authority. This case is out of coverage. Direct the citizen to the State Rent Authority, or to a local legal aid clinic if one is available, rather than attempting an RTI, which cannot resolve a landlord-tenant dispute.",
    citationIds: [],
  },
  {
    remedyClass: "grievance",
    keywords: [
      "service not provided", "portal not working", "application stuck", "no response from department",
      "grievance", "complaint against officer",
    ],
    forumName: "Centralised Public Grievance Redress and Monitoring System (CPGRAMS)",
    limitationPeriod: "No fixed limitation period; file as soon as the grievance arises",
    guidanceNote:
      "A grievance about service delivery is usually faster to resolve through CPGRAMS, which routes directly to the department concerned, than through an RTI application, which only obtains records and does not compel a service outcome. Use an RTI where the citizen specifically needs the documentary record, for instance to prove what was promised or when an application was received.",
    citationIds: [],
  },
];

export function runRemedyTriage(grievanceText: string): RemedyTriageResult {
  const lower = grievanceText.toLowerCase();

  let bestRule: RemedyRule | null = null;
  let bestHits = 0;
  for (const rule of REMEDY_RULES) {
    const hits = rule.keywords.filter((k) => lower.includes(k)).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestRule = rule;
    }
  }

  const wantsRecords = /\b(copy of|certified copy|record|document|file|report|order|circular|why|how many|status of my application|information about)\b/.test(lower);

  if (bestRule && wantsRecords) {
    return {
      remedyClass: "hybrid",
      forumName: `RTI for the underlying record, and ${bestRule.forumName} for the relief itself`,
      limitationPeriod: bestRule.limitationPeriod,
      outOfCoverage: bestRule.remedyClass === "tenancy",
      guidanceNote: `This grievance mixes a records request with a substantive claim. ${bestRule.guidanceNote} Draft the RTI for the record only; do not use it to seek the relief itself, since a Public Information Officer has no power to grant a refund, reinstatement or repair.`,
      citationIds: ["rti-2f", ...bestRule.citationIds],
    };
  }

  if (bestRule) {
    return {
      remedyClass: bestRule.remedyClass,
      forumName: bestRule.forumName,
      limitationPeriod: bestRule.limitationPeriod,
      pecuniaryJurisdiction:
        bestRule.remedyClass === "consumer" ? computeConsumerJurisdiction(grievanceText) : undefined,
      outOfCoverage: bestRule.remedyClass === "tenancy",
      guidanceNote: bestRule.guidanceNote,
      citationIds: bestRule.citationIds,
    };
  }

  return {
    remedyClass: "rti",
    forumName: "Right to Information application",
    limitationPeriod: "No limitation period to file the original application; thirty days to appeal a refusal or non-response",
    outOfCoverage: false,
    guidanceNote:
      "This reads as a straightforward request for a record held by a public authority. Proceed with jurisdiction triage and drafting.",
    citationIds: ["rti-2f"],
  };
}

function computeConsumerJurisdiction(text: string) {
  const amountMatch = text.match(/(?:rs\.?|inr|rupees|₹)\s?([\d,]+)/i);
  if (!amountMatch) {
    return {
      level: "District" as const,
      reasoning:
        "No amount was detected in the grievance text. Pecuniary jurisdiction under the Consumer Protection (Jurisdiction) Rules, 2021 is based on the price actually paid for the goods or service, not the compensation sought. Ask the operator for that figure before filing.",
    };
  }
  const amount = Number(amountMatch[1].replace(/,/g, ""));
  if (amount > 20000000) {
    return {
      level: "National" as const,
      reasoning: `Price paid of roughly ₹${amount.toLocaleString("en-IN")} exceeds ₹2 crore, placing this within the National Consumer Disputes Redressal Commission's jurisdiction under the 2021 Rules, computed on price paid rather than compensation sought.`,
    };
  }
  if (amount > 5000000) {
    return {
      level: "State" as const,
      reasoning: `Price paid of roughly ₹${amount.toLocaleString("en-IN")} falls between ₹50 lakh and ₹2 crore, placing this within the State Consumer Disputes Redressal Commission's jurisdiction.`,
    };
  }
  return {
    level: "District" as const,
    reasoning: `Price paid of roughly ₹${amount.toLocaleString("en-IN")} is at or below ₹50 lakh, placing this within the District Consumer Disputes Redressal Commission's jurisdiction.`,
  };
}
