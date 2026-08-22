// State-wise RTI application fee table.
// Coverage is intentionally bounded. Where a source could not be confirmed
// against a gazetted state RTI (Regulation of Fee and Cost) Rules document
// within the time available, the entry is marked "conflicting_sources" or
// "unverified" rather than presented as settled. This is a deliberate
// product decision: a wrong fee is a real filing defect, and a labelled
// gap is safer than a confident guess.

import type { FeeInfo } from "@/lib/types";

export interface StateFeeEntry {
  state: string;
  amount: number;
  paymentModes: string[];
  confidence: FeeInfo["confidence"];
  note?: string;
}

export const CENTRAL_FEE: StateFeeEntry = {
  state: "Union of India (Central)",
  amount: 10,
  paymentModes: ["UPI", "net banking", "Indian Postal Order", "demand draft", "court fee stamp"],
  confidence: "verified",
};

export const STATE_FEES: StateFeeEntry[] = [
  {
    state: "Delhi",
    amount: 10,
    paymentModes: ["court fee stamp", "demand draft", "online via rtionline.delhi.gov.in"],
    confidence: "verified",
  },
  {
    state: "Maharashtra",
    amount: 10,
    paymentModes: ["court fee stamp", "postal order", "online via rtionline.maharashtra.gov.in"],
    confidence: "conflicting_sources",
    note: "One tracked source states 10 rupees under the notified Maharashtra RTI Rules; another states 30 rupees. Confirm against the current Maharashtra Right to Information (Fee) Rules before filing, and do not treat this figure as settled.",
  },
  {
    state: "Karnataka",
    amount: 10,
    paymentModes: ["court fee stamp", "online via rtionline.karnataka.gov.in"],
    confidence: "verified",
  },
  {
    state: "Gujarat",
    amount: 20,
    paymentModes: ["court fee stamp", "postal order"],
    confidence: "verified",
  },
  {
    state: "Punjab",
    amount: 50,
    paymentModes: ["court fee stamp", "postal order"],
    confidence: "verified",
  },
  {
    state: "Tamil Nadu",
    amount: 50,
    paymentModes: ["court fee stamp", "postal order"],
    confidence: "verified",
    note: "The dedicated state RTI portal was found offline at the time this directory was built. File by post or through the State Information Commission's listed channel.",
  },
  {
    state: "Odisha",
    amount: 10,
    paymentModes: ["court fee stamp", "online via rtiodisha.gov.in"],
    confidence: "verified",
  },
  {
    state: "Rajasthan",
    amount: 10,
    paymentModes: ["court fee stamp", "postal order"],
    confidence: "verified",
    note: "Only the State Information Commission side of the portal was confirmed working. First-instance filing may require a physical or postal route.",
  },
  {
    state: "Andhra Pradesh",
    amount: 10,
    paymentModes: ["court fee stamp", "postal order"],
    confidence: "unverified",
    note: "The dedicated state RTI portal was found offline. Fee shown is the commonly cited figure; confirm before filing.",
  },
];

export const BPL_EXEMPTION_NOTE =
  "An applicant who holds a Below Poverty Line certificate pays no fee at all under the proviso to section 7(5), a central provision no state rule can override. Attach a copy of the BPL certificate in place of the fee.";

export function lookupStateFee(state: string): StateFeeEntry | undefined {
  return STATE_FEES.find((s) => s.state.toLowerCase() === state.toLowerCase());
}
