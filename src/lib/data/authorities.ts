// Curated public-authority directory.
// There is no public API for the CPIO directory behind rtionline.gov.in;
// it is a cascading Ministry -> Department -> Organisation form. This
// directory hand-curates the central ministries and two states that a
// working prototype can stand behind, rather than presenting a false
// impression of national coverage.
//
// Officers are addressed by designation, never by name: individual CPIOs
// rotate, often quarterly, by departmental order, while the office
// address is stable. Building addresses below are the well-known,
// long-standing seats of these ministries in New Delhi and are given as
// the office address to write to; the operator should still confirm the
// current designated CPIO through the authority's own section 4(1)(b)
// disclosure before posting an application, and this directory says so
// on every record rather than implying it is unnecessary.

import type { JurisdictionLevel } from "@/lib/types";

export interface Authority {
  id: string;
  name: string;
  department: string;
  jurisdiction: JurisdictionLevel;
  state?: string;
  subjectKeywords: string[];
  cpioAddress: string;
  faaAddress: string;
  coverageNote: string;
}

export const AUTHORITIES: Authority[] = [
  {
    id: "dolr",
    name: "Department of Land Resources",
    department: "Ministry of Rural Development",
    jurisdiction: "union",
    subjectKeywords: ["land record", "khasra", "digitisation of land records", "svamitva"],
    cpioAddress: "The Central Public Information Officer, Department of Land Resources, Ministry of Rural Development, NBO Building, Nirman Bhawan, New Delhi 110001",
    faaAddress: "The Appellate Authority, Department of Land Resources, Ministry of Rural Development, Nirman Bhawan, New Delhi 110001",
    coverageNote: "This department publishes national land-record digitisation policy. It does not hold your local 7/12 extract or khasra record. See the Land and land revenue triage warning.",
  },
  {
    id: "mha",
    name: "Ministry of Home Affairs",
    department: "Ministry of Home Affairs",
    jurisdiction: "union",
    subjectKeywords: ["internal security", "central armed police force", "citizenship", "foreigners registration"],
    cpioAddress: "The Central Public Information Officer, Ministry of Home Affairs, North Block, New Delhi 110001",
    faaAddress: "The Appellate Authority, Ministry of Home Affairs, North Block, New Delhi 110001",
    coverageNote: "Does not cover ordinary state police matters, which sit with the State Home Department and District Superintendent of Police.",
  },
  {
    id: "mea-passport",
    name: "Regional Passport Office coordination, Ministry of External Affairs",
    department: "Ministry of External Affairs",
    jurisdiction: "union",
    subjectKeywords: ["passport", "visa", "consular"],
    cpioAddress: "The Central Public Information Officer, Passport Seva, Ministry of External Affairs, Patiala House Annexe, New Delhi 110001",
    faaAddress: "The Appellate Authority, Ministry of External Affairs, Patiala House Annexe, New Delhi 110001",
    coverageNote: "For a specific application, file with the Regional Passport Office that issued or is processing it; the address above is the coordinating ministry, not every regional office.",
  },
  {
    id: "railway-board",
    name: "Railway Board",
    department: "Ministry of Railways",
    jurisdiction: "union",
    subjectKeywords: ["railway", "train", "railway recruitment board"],
    cpioAddress: "The Central Public Information Officer, Railway Board, Ministry of Railways, Rail Bhawan, New Delhi 110001",
    faaAddress: "The Appellate Authority, Railway Board, Rail Bhawan, New Delhi 110001",
    coverageNote: "For a specific journey, station or divisional matter, the correct authority is usually the Divisional Railway Manager of the zone concerned, not the Railway Board.",
  },
  {
    id: "epfo",
    name: "Employees' Provident Fund Organisation, Head Office",
    department: "Ministry of Labour and Employment",
    jurisdiction: "union",
    subjectKeywords: ["provident fund", "epf claim", "pf transfer", "pension scheme"],
    cpioAddress: "The Central Public Information Officer, EPFO Head Office, Bhavishya Nidhi Bhawan, 14 Bhikaiji Cama Place, New Delhi 110066",
    faaAddress: "The Appellate Authority, EPFO Head Office, Bhavishya Nidhi Bhawan, 14 Bhikaiji Cama Place, New Delhi 110066",
    coverageNote: "For an individual claim, filing with the Regional Provident Fund Commissioner's office holding the account is usually faster than the Head Office.",
  },
  {
    id: "cbdt",
    name: "Central Board of Direct Taxes",
    department: "Ministry of Finance, Department of Revenue",
    jurisdiction: "union",
    subjectKeywords: ["income tax", "pan card", "tax refund"],
    cpioAddress: "The Central Public Information Officer, Central Board of Direct Taxes, North Block, New Delhi 110001",
    faaAddress: "The Appellate Authority, Central Board of Direct Taxes, North Block, New Delhi 110001",
    coverageNote: "An individual assessment or refund query is usually better addressed to the jurisdictional Assessing Officer's CPIO than to the Board.",
  },
  {
    id: "cbic",
    name: "Central Board of Indirect Taxes and Customs",
    department: "Ministry of Finance, Department of Revenue",
    jurisdiction: "union",
    subjectKeywords: ["gst", "customs", "excise"],
    cpioAddress: "The Central Public Information Officer, Central Board of Indirect Taxes and Customs, North Block, New Delhi 110001",
    faaAddress: "The Appellate Authority, Central Board of Indirect Taxes and Customs, North Block, New Delhi 110001",
    coverageNote: "",
  },
  {
    id: "uidai",
    name: "Unique Identification Authority of India",
    department: "Ministry of Electronics and Information Technology",
    jurisdiction: "union",
    subjectKeywords: ["aadhaar", "uidai", "aadhaar enrolment"],
    cpioAddress: "The Central Public Information Officer, Unique Identification Authority of India, Bangla Sahib Road, Behind Kali Mandir, New Delhi 110001",
    faaAddress: "The Appellate Authority, Unique Identification Authority of India, Bangla Sahib Road, New Delhi 110001",
    coverageNote: "",
  },
  {
    id: "nhai",
    name: "National Highways Authority of India",
    department: "Ministry of Road Transport and Highways",
    jurisdiction: "union",
    subjectKeywords: ["national highway", "nhai", "toll plaza"],
    cpioAddress: "The Central Public Information Officer, National Highways Authority of India, G-5 and 6, Sector 10, Dwarka, New Delhi 110075",
    faaAddress: "The Appellate Authority, National Highways Authority of India, Dwarka, New Delhi 110075",
    coverageNote: "A state or district road is a State Public Works Department matter, not NHAI.",
  },
  {
    id: "moef",
    name: "Ministry of Environment, Forest and Climate Change",
    department: "Ministry of Environment, Forest and Climate Change",
    jurisdiction: "union",
    subjectKeywords: ["environmental clearance", "forest clearance", "wildlife"],
    cpioAddress: "The Central Public Information Officer, Ministry of Environment, Forest and Climate Change, Indira Paryavaran Bhawan, Jor Bagh Road, New Delhi 110003",
    faaAddress: "The Appellate Authority, Ministry of Environment, Forest and Climate Change, Indira Paryavaran Bhawan, New Delhi 110003",
    coverageNote: "Routine local tree-felling permission is usually a State Forest Department matter.",
  },
  {
    id: "rbi",
    name: "Reserve Bank of India, Central Office",
    department: "Reserve Bank of India",
    jurisdiction: "union",
    subjectKeywords: ["banking regulation", "rbi circular", "nationalised bank policy"],
    cpioAddress: "The Central Public Information Officer, Reserve Bank of India, Central Office, Shahid Bhagat Singh Marg, Mumbai 400001",
    faaAddress: "The Appellate Authority, Reserve Bank of India, Central Office, Mumbai 400001",
    coverageNote: "A dispute with your own bank account is addressed to that bank's own CPIO, not the Reserve Bank.",
  },
  {
    id: "delhi-revenue",
    name: "Department of Revenue, Government of NCT of Delhi",
    department: "Government of NCT of Delhi",
    jurisdiction: "state",
    state: "Delhi",
    subjectKeywords: ["land record", "khasra", "khatauni", "mutation", "delhi land"],
    cpioAddress: "The Public Information Officer, Department of Revenue, Government of NCT of Delhi, 5th Level, C-Wing, Delhi Secretariat, I.P. Estate, New Delhi 110002",
    faaAddress: "The Appellate Authority, Department of Revenue, Delhi Secretariat, New Delhi 110002",
    coverageNote: "For a specific khasra or mutation record, file with the Sub-Divisional Magistrate or Tehsildar of the concerned area, not the Secretariat directly, where the local office is known.",
  },
  {
    id: "delhi-police",
    name: "Delhi Police",
    department: "Government of NCT of Delhi (administered through Ministry of Home Affairs)",
    jurisdiction: "state",
    state: "Delhi",
    subjectKeywords: ["police", "fir", "delhi police station"],
    cpioAddress: "The Public Information Officer, Delhi Police Headquarters, MSO Building, I.P. Estate, New Delhi 110002",
    faaAddress: "The Appellate Authority, Delhi Police Headquarters, I.P. Estate, New Delhi 110002",
    coverageNote: "Delhi Police is administratively under the Ministry of Home Affairs, an exception to the usual state-police pattern; the CPIO structure still follows the police force, not the ministry.",
  },
  {
    id: "mh-revenue",
    name: "Revenue and Forest Department, Government of Maharashtra",
    department: "Government of Maharashtra",
    jurisdiction: "state",
    state: "Maharashtra",
    subjectKeywords: ["7/12", "satbara", "land record", "mutation", "maharashtra land"],
    cpioAddress: "The Public Information Officer, Revenue and Forest Department, Mantralaya, Mumbai 400032",
    faaAddress: "The Appellate Authority, Revenue and Forest Department, Mantralaya, Mumbai 400032",
    coverageNote: "For a specific 7/12 extract, file with the Tehsildar or Circle Officer of the taluka concerned, not Mantralaya directly, where the local office is known.",
  },
  {
    id: "mh-police",
    name: "Maharashtra Police",
    department: "Home Department, Government of Maharashtra",
    jurisdiction: "state",
    state: "Maharashtra",
    subjectKeywords: ["police", "fir", "maharashtra police station"],
    cpioAddress: "The Public Information Officer, Office of the Director General of Police, Maharashtra, Old Council Hall, Mumbai 400001",
    faaAddress: "The Appellate Authority, Office of the Director General of Police, Maharashtra, Mumbai 400001",
    coverageNote: "For a specific station-level matter, file with that police station's own CPIO where known, rather than the Director General's office.",
  },
];

export function searchAuthorities(query: {
  subjectKeywordHit?: string;
  jurisdiction?: JurisdictionLevel;
  state?: string;
}): Authority[] {
  return AUTHORITIES.filter((a) => {
    if (query.jurisdiction && a.jurisdiction !== query.jurisdiction) return false;
    if (query.state && a.state && a.state.toLowerCase() !== query.state.toLowerCase()) return false;
    return true;
  });
}

export const DIRECTORY_COVERAGE_STATEMENT =
  "This directory currently covers twelve central ministries and departments and two states, Delhi and Maharashtra, at the department level. It does not cover any other state. Where a case falls outside this coverage, Adhikaar says so rather than guessing an address.";
