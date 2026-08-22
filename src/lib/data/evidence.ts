// Figures in this file are measured, not estimated. The primary figures
// come from a document the Department of Land Resources itself published
// under section 4 of the RTI Act: a register of RTI applications received
// and their disposal. It was downloaded and parsed in full (686 pages).
//
// Outcome counted directly from the disposal status printed against each
// of 3,128 uniquely numbered applications in that register:
//   REQUEST RETURN TO APPLICANT : 2,797
//   REQUEST DISPOSE OF          :   265
//   TRANSFER                    :   148 (subset also marked disposed)
//
// This is a single central department whose subject matter, land, is
// almost entirely a State subject under the Seventh Schedule, so its
// return rate is far above the national norm. It must never be quoted as
// a national figure. It is quoted here because it is the direct evidence
// for the specific failure mode this product targets: an application
// addressed to the wrong level of government is returned, not
// transferred, and the fee is not refunded.

export const DOLR_EVIDENCE = {
  sourceLabel: "Department of Land Resources, RTI disposal register (2024 edition)",
  sourceUrl:
    "https://cdnbbsr.s3waas.gov.in/s3d69116f8b0140cdeb1f99a4d5096ffe4/uploads/2024/09/20240901651810853.pdf",
  totalApplications: 3128,
  returned: 2797,
  disposed: 265,
  returnedShare: 2797 / 3128,
  statedReason:
    'Per Department of Personnel and Training Office Memorandum No. 10/2/2008-IR, dated 12 June 2008: where an application concerns a public authority under a State Government, the application "need not be transferred" and is returned to the applicant advising them to approach the State authority, without refund of the fee.',
  caveat:
    "This department's subject matter is land, which is a State subject. Its return rate is not representative of RTI practice generally and should never be cited as a national figure. It is the clearest available primary-source evidence of the specific failure this product targets: the section 6(3) transfer duty does not reach across the Union-State line.",
};

export const NATIONAL_CONTEXT = [
  {
    label: "Applications returned nationally in one tracked year",
    value: "53,000+",
    detail: "Maharashtra highest at 14,478, the Central Information Commission itself second at 13,922.",
    sourceUrl: "https://www.deccanherald.com/india/more-than-53000-rti-complaints-returned-in-one-year-maharashtra-tops-list-3230372",
  },
  {
    label: "National CIC rejection rate (a narrower category than return)",
    value: "approximately 4 percent",
    detail: "Central Information Commission annual reporting places outright rejection under section 8 or 9 in the 3.85 to 4.3 percent range in recent years. Rejection and return are different failures; this figure must not be conflated with the return-rate evidence above.",
    sourceUrl: "https://www.deccanherald.com/amp/national/385-rti-applications-rejected-in-2020-21-cic-report-1087023.html",
  },
  {
    label: "Appeals and complaints registered with 27 Commissions, July 2024 to June 2025",
    value: "2.41 lakh",
    detail: "Against roughly 1.8 lakh disposed in the same period. Six State Information Commissions were non-functional for periods due to unfilled commissioner posts.",
    sourceUrl: "https://www.snsindia.org/rti-assessments/",
  },
];

export const CSC_CONTEXT = {
  functionalCentres: "approximately 582,000",
  vles: "approximately 5.4 lakh",
  gramPanchayatCoverage: "2.5+ lakh Gram Panchayats",
  sourceUrl: "https://csc.gov.in/vle",
};
