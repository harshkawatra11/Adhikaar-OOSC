// A curated, illustrative mapping of common RTI subject matter to the
// Seventh Schedule of the Constitution (List I Union, List II State,
// List III Concurrent). This is not a substitute for the Schedule itself
// and does not cover every entry; it covers the subjects that recur most
// often in ordinary RTI practice, which is what the triage engine needs.
// Each entry names the List and the closest matching Entry number so the
// reasoning shown to an operator is checkable, not asserted.

export interface ScheduleMapping {
  keywords: string[];
  subjectMatter: string;
  list: "Union" | "State" | "Concurrent";
  entry: string;
  typicalAuthority: string;
}

export const SEVENTH_SCHEDULE_MAP: ScheduleMapping[] = [
  {
    keywords: [
      "land record", "khasra", "khatauni", "7/12", "patta", "mutation", "revenue record",
      "survey number", "fmb", "plot", "khata", "property", "land bearing", "ownership of land",
      "registered owner", "land dispute", "encroachment", "land allotted", "chain of ownership",
      "gairmajarua", "tehsildar", "collector rate", "registry for",
    ],
    subjectMatter: "Land and land revenue",
    list: "State",
    entry: "List II, Entry 18 (Land)",
    typicalAuthority: "Tehsildar / District Collector / Revenue Department",
  },
  {
    keywords: ["police", "fir", "station house", "arrest", "encounter", "law and order"],
    subjectMatter: "Police",
    list: "State",
    entry: "List II, Entry 2 (Police)",
    typicalAuthority: "Superintendent of Police / State Home Department",
  },
  {
    keywords: ["ration card", "pds", "public distribution", "fair price shop"],
    subjectMatter: "Public distribution system",
    list: "Concurrent",
    entry: "List III, Entry 33 (Trade and commerce in essential commodities)",
    typicalAuthority: "State Food and Civil Supplies Department",
  },
  {
    keywords: ["municipal", "nagar nigam", "nagar palika", "gram panchayat", "building plan sanction", "trade licence", "property tax"],
    subjectMatter: "Local government",
    list: "State",
    entry: "List II, Entry 5 (Local government)",
    typicalAuthority: "Municipal Corporation / Panchayat",
  },
  {
    keywords: ["hospital", "primary health centre", "phc", "public health", "vaccination", "medical college admission"],
    subjectMatter: "Public health and hospitals",
    list: "State",
    entry: "List II, Entry 6 (Public health and sanitation)",
    typicalAuthority: "State Health Department",
  },
  {
    keywords: ["school", "education board", "college affiliation", "scholarship", "university admission"],
    subjectMatter: "Education",
    list: "Concurrent",
    entry: "List III, Entry 25 (Education)",
    typicalAuthority: "State Education Department, or the relevant Central university / UGC for central institutions",
  },
  {
    keywords: ["railway", "train", "irctc", "railway recruitment"],
    subjectMatter: "Railways",
    list: "Union",
    entry: "List I, Entry 22 (Railways)",
    typicalAuthority: "Zonal Railway / Railway Board",
  },
  {
    keywords: ["passport", "visa"],
    subjectMatter: "Passports",
    list: "Union",
    entry: "List I, Entry 19 (Passports and visas)",
    typicalAuthority: "Regional Passport Office, Ministry of External Affairs",
  },
  {
    keywords: ["bank", "loan", "nationalised bank", "rbi", "epf", "provident fund", "pf claim"],
    subjectMatter: "Banking and provident fund",
    list: "Union",
    entry: "List I, Entry 45 (Banking) / Entry 44 (Provident funds)",
    typicalAuthority: "Concerned bank's CPIO or Regional Provident Fund Commissioner (EPFO)",
  },
  {
    keywords: ["income tax", "gst", "customs"],
    subjectMatter: "Central taxation",
    list: "Union",
    entry: "List I, Entry 82 (Income tax) / Entry 83 (Customs)",
    typicalAuthority: "Income Tax Department / CBIC",
  },
  {
    keywords: ["defence", "army", "navy", "air force", "cantonment"],
    subjectMatter: "Defence",
    list: "Union",
    entry: "List I, Entry 1 (Defence of India)",
    typicalAuthority: "Ministry of Defence",
  },
  {
    keywords: ["electricity", "power connection", "discom", "electricity board"],
    subjectMatter: "Electricity",
    list: "Concurrent",
    entry: "List III, Entry 38 (Electricity)",
    typicalAuthority: "State electricity distribution company (DISCOM)",
  },
  {
    keywords: ["forest", "wildlife", "tree felling"],
    subjectMatter: "Forests",
    list: "Concurrent",
    entry: "List III, Entry 17A (Forests)",
    typicalAuthority: "State Forest Department",
  },
  {
    keywords: ["road", "highway", "nhai", "national highway"],
    subjectMatter: "National highways",
    list: "Union",
    entry: "List I, Entry 23 (Highways)",
    typicalAuthority: "National Highways Authority of India",
  },
  {
    keywords: ["state highway", "pwd", "public works", "local road"],
    subjectMatter: "State roads and public works",
    list: "State",
    entry: "List II, Entry 13 (Roads, bridges)",
    typicalAuthority: "State Public Works Department",
  },
  {
    keywords: ["aadhaar", "uidai"],
    subjectMatter: "Aadhaar",
    list: "Union",
    entry: "Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016",
    typicalAuthority: "Unique Identification Authority of India (UIDAI)",
  },
];

export function classifySubjectMatter(text: string): ScheduleMapping | null {
  const lower = text.toLowerCase();
  let best: ScheduleMapping | null = null;
  let bestHits = 0;
  for (const mapping of SEVENTH_SCHEDULE_MAP) {
    const hits = mapping.keywords.filter((k) => lower.includes(k)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = mapping;
    }
  }
  return bestHits > 0 ? best : null;
}
