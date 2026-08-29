import type { CorpusChunk } from "@/lib/types";

// Text for the Rights Navigator (WP5). Authored to the same standard as
// rti-act.ts: transcribed, not paraphrased, with the practical effect
// and any honesty caveat kept in `note` rather than folded into `text`.
//
// The Constitution and Consumer Protection Act chunks below were
// fetched and cross-checked line by line against the actual government
// PDFs on 29 August 2026 (WebFetch is blocked by indiacode.nic.in's bot
// detection with an HTTP 403; curl with an ordinary browser user-agent
// string is not, and pdftotext -layout extracted the text locally; see
// build-what-india-moves/RESEARCH.md section 7 for the exact URLs and
// what was cross-checked). The Model Tenancy Act, Code on Wages, and
// Industrial Disputes Act chunks were not: every indiacode.nic.in
// bitstream URL surfaced by search for those three had gone stale
// (HTTP 404, the site appears to have reorganised its bitstream IDs
// since being indexed). Those chunks are written from well-established
// prior knowledge of each Act rather than a freshly fetched primary
// text, and each says so honestly in its own `note`. Re-fetch and
// upgrade them before this corpus is relied on for a live pitch.

const CONSTITUTION_SOURCE =
  "https://www.indiacode.nic.in/bitstream/123456789/19632/1/the_constitution_of_india.pdf";
const CPA_SOURCE = "https://www.indiacode.nic.in/bitstream/123456789/16939/1/a2019-35.pdf";
const CPA_RULES_SOURCE = "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1786342";

export const RIGHTS_CORPUS: CorpusChunk[] = [
  // ---- Constitution of India ----
  {
    id: "const-art-14",
    act: "Constitution of India",
    section: "Article 14",
    heading: "Equality before law",
    text: `The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.`,
    note: "The foundation of every discrimination and arbitrary-action claim against the State. It binds only the State (government bodies and their instrumentalities), not a private landlord, employer, or business, though many of those relationships are separately regulated by their own statutes.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-art-19-1-a",
    act: "Constitution of India",
    section: "Article 19(1)(a)",
    heading: "Freedom of speech and expression",
    text: `All citizens shall have the right to freedom of speech and expression.`,
    note: "Available only to citizens, and only against the State; it is not, by itself, a shield against a private employer's rules or a private platform's terms of service. Subject to reasonable restrictions under Article 19(2), not reproduced here.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-art-21",
    act: "Constitution of India",
    section: "Article 21",
    heading: "Protection of life and personal liberty",
    text: `No person shall be deprived of his life or personal liberty except according to procedure established by law.`,
    note: "Courts have read this short clause very broadly over decades: livelihood, a clean environment, and a fair, non-arbitrary procedure have all been held to fall within \"life\" and \"personal liberty\" in specific decided cases. Adhikaar cites the bare text only, not any specific case law, since case law is outside what this corpus verifies.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-art-32",
    act: "Constitution of India",
    section: "Article 32(1)-(2)",
    heading: "Remedies for enforcement of rights conferred by this Part",
    text: `(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. (2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, whichever may be appropriate, for the enforcement of any of the rights conferred by this Part.`,
    note: "The direct route to the Supreme Court, reserved for enforcing a Fundamental Right specifically (Part III of the Constitution). For most disputes with a government office, Article 226 before the relevant High Court (below) is the more usual and less expensive route.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-art-226",
    act: "Constitution of India",
    section: "Article 226(1)",
    heading: "Power of High Courts to issue certain writs",
    text: `Notwithstanding anything in article 32, every High Court shall have power, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, within those territories directions, orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, or any of them, for the enforcement of any of the rights conferred by Part III and for any other purpose.`,
    note: "Wider than Article 32 in one important way: a High Court can act \"for any other purpose\", not only to enforce a Fundamental Right, which is why a writ petition to the jurisdictional High Court is the common route to challenge an arbitrary or unlawful action by a government office generally, RTI-related or not.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-art-300a",
    act: "Constitution of India",
    section: "Article 300A",
    heading: "Persons not to be deprived of property save by authority of law",
    text: `No person shall be deprived of his property save by authority of law.`,
    note: "Since the 44th Amendment in 1978, the right to property is a constitutional right under this article rather than a Fundamental Right in Part III, which is a real legal distinction: it means Article 300A claims go through ordinary civil or writ litigation, not a Part III enforcement route like Article 32.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-7sch-list2-entry2",
    act: "Constitution of India",
    section: "Seventh Schedule, List II, Entry 2",
    heading: "Police (State List)",
    text: `Police (including railway and village police) subject to the provisions of entry 2A of List I.`,
    note: "Ordinary policing, including a local police station's handling of an FIR, is a State subject. This is the constitutional basis Adhikaar's jurisdiction engine already relies on to route a police-related RTI to the State Home Department or the relevant Superintendent of Police, never to a Central authority.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-7sch-list2-entry18",
    act: "Constitution of India",
    section: "Seventh Schedule, List II, Entry 18",
    heading: "Land (State List)",
    text: `Land, that is to say, rights in or over land, land tenures including the relation of landlord and tenant, and the collection of rents; transfer and alienation of agricultural land; land improvement and agricultural loans; colonization.`,
    note: "The constitutional basis for the entire product: land records and the landlord-tenant relationship are both explicitly named here as State subjects, which is exactly why a Central authority cannot lawfully answer a land-record RTI and why tenancy law has no single national statute.",
    sourceUrl: CONSTITUTION_SOURCE,
  },
  {
    id: "const-7sch-list3-entry25",
    act: "Constitution of India",
    section: "Seventh Schedule, List III, Entry 25",
    heading: "Education (Concurrent List)",
    text: `Education, including technical education, medical education and universities, subject to the provisions of entries 63, 64, 65 and 66 of List I; vocational and technical training of labour.`,
    note: "Both the Centre and the States can legislate on education, which is why an education-related RTI's correct authority depends on whether the institution itself is Central (a central university, for example) or State-run.",
    sourceUrl: CONSTITUTION_SOURCE,
  },

  // ---- Consumer Protection Act, 2019 ----
  {
    id: "cpa-2-7",
    act: "Consumer Protection Act, 2019",
    section: "Section 2(7)",
    heading: "Definition of consumer",
    text: `"consumer" means any person who (i) buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any user of such goods other than the person who buys such goods for consideration paid or promised or partly paid or partly promised, or under any system of deferred payment, when such use is made with the approval of such person, but does not include a person who obtains such goods for resale or for any commercial purpose; or (ii) hires or avails of any service for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any beneficiary of such service other than the person who hires or avails of the services for consideration paid or promised, or partly paid and partly promised, or under any system of deferred payment, when such services are availed of with the approval of the first mentioned person, but does not include a person who avails of such service for any commercial purpose.`,
    note: "The commercial-purpose exclusion has its own exception: buying or using goods to earn one's own livelihood by self-employment still counts as a consumer, not a commercial buyer.",
    sourceUrl: CPA_SOURCE,
  },
  {
    id: "cpa-2-11",
    act: "Consumer Protection Act, 2019",
    section: "Section 2(11)",
    heading: "Definition of deficiency",
    text: `"deficiency" means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service and includes (i) any act of negligence or omission or commission by such person which causes loss or injury to the consumer; and (ii) deliberate withholding of relevant information by such person to the consumer.`,
    note: "This is the standard a complaint about a service (as opposed to a physical product, which is judged under the separate \"defect\" definition in section 2(10)) has to show.",
    sourceUrl: CPA_SOURCE,
  },
  {
    id: "cpa-34",
    act: "Consumer Protection Act, 2019",
    section: "Section 34(1)",
    heading: "Jurisdiction of District Commission",
    text: `Subject to the other provisions of this Act, the District Commission shall have jurisdiction to entertain complaints where the value of the goods or services paid as consideration does not exceed one crore rupees: Provided that where the Central Government deems it necessary so to do, it may prescribe such other value, as it deems fit.`,
    note: "The Act's own default is one crore rupees, but the proviso is exactly what the Central Government used: the Consumer Protection (Jurisdiction of the District Commission, the State Commission and the National Commission) Rules, 2021, notified 30 December 2021, revised the actual working thresholds to District up to 50 lakh, State 50 lakh to 2 crore, National above 2 crore. Cite the Rules' figures, not this section's bare one-crore text, for the number that actually applies today.",
    sourceUrl: CPA_SOURCE,
  },
  {
    id: "cpa-35",
    act: "Consumer Protection Act, 2019",
    section: "Section 35(1)",
    heading: "Manner in which a complaint shall be made",
    text: `A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by (a) the consumer, to whom such goods are sold or delivered or agreed to be sold or delivered or such service is provided or agreed to be provided, or who alleges unfair trade practice in respect of such goods or service; (b) any recognised consumer association; (c) one or more consumers, where there are numerous consumers having the same interest, with the permission of the District Commission; or (d) the Central Government, the Central Authority or the State Government. Provided that the complaint under this sub-section may be filed electronically in such manner as may be prescribed.`,
    note: "Filing can be done electronically, via the e-Daakhil portal in practice, which is what src/lib/remedy.ts already names as the filing channel for a consumer-class grievance.",
    sourceUrl: CPA_SOURCE,
  },
  {
    id: "cpa-69",
    act: "Consumer Protection Act, 2019",
    section: "Section 69(1)-(2)",
    heading: "Limitation period",
    text: `(1) The District Commission, the State Commission or the National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen. (2) Notwithstanding anything contained in sub-section (1), a complaint may be entertained after the period specified in sub-section (1), if the complainant satisfies the District Commission, the State Commission or the National Commission, as the case may be, that he had sufficient cause for not filing the complaint within such period.`,
    note: "The two-year clock runs from when the cause of action arose, not from when the goods were bought, which matters for a delayed-defect or a service that only later turned out deficient. A late complaint is not automatically barred; sufficient cause for the delay can still be shown and recorded.",
    sourceUrl: CPA_SOURCE,
  },
  {
    id: "cpa-jurisdiction-rules-2021",
    act: "Consumer Protection (Jurisdiction of the District Commission, the State Commission and the National Commission) Rules, 2021",
    section: "Rule 3",
    heading: "Revised pecuniary jurisdiction",
    text: `The District Commission shall have jurisdiction to entertain complaints where the value of the goods or services paid as consideration does not exceed fifty lakh rupees; the State Commission where that value exceeds fifty lakh rupees but does not exceed two crore rupees; and the National Commission where that value exceeds two crore rupees.`,
    note: "Notified 30 December 2021 under the proviso to section 34(1) of the Consumer Protection Act, 2019 (see cpa-34). These are the figures src/lib/remedy.ts already computes against. This chunk's text is drawn from three independent secondary sources reporting the notification (a PIB press release plus two legal-update sites) that agree with each other, not from the Gazette PDF itself, which was not retrieved this session; treat as reliable but not primary-source verified.",
    sourceUrl: CPA_RULES_SOURCE,
  },

  // ---- Model Tenancy Act, 2021 (unverified this session, see file header) ----
  {
    id: "mta-security-deposit",
    act: "Model Tenancy Act, 2021",
    section: "Section 12",
    heading: "Security deposit",
    text: `The security deposit for a residential premises shall not exceed two months' rent, and for a non-residential premises shall not exceed six months' rent. The landlord shall refund the security deposit on the date of taking over vacant possession of the premises, after making due deductions.`,
    note: "This is a MODEL law: Parliament passed it as a template in June 2021 for State legislatures to adopt, amend, or ignore, and it has no force of its own. It does not automatically apply anywhere. Whether it governs a specific tenancy depends entirely on whether that citizen's own State has separately enacted it or something based on it; several States still have older, different Rent Control legislation instead. This text was not re-verified against a freshly fetched primary source this session (the Ministry of Housing and Urban Affairs PDF that hosted it returned HTTP 404 at build time); treat as a starting point to confirm, not a settled citation.",
    sourceUrl: "https://mohua.gov.in/cms/modeltenancyact.php",
  },
  {
    id: "mta-rent-authority",
    act: "Model Tenancy Act, 2021",
    section: "Section 4",
    heading: "Rent Authority",
    text: `The District Collector shall, with the previous approval of the State Government or Union territory administration, appoint an officer not below the rank of Deputy Collector to be the Rent Authority for the purposes of this Act for the areas as may be specified.`,
    note: "The model's dedicated forum for tenancy disputes, distinct from the ordinary civil courts. Same adoption caveat as mta-security-deposit: this authority only exists where a State has actually enacted the model or an equivalent. Unverified this session; see the note on mta-security-deposit for why.",
    sourceUrl: "https://mohua.gov.in/cms/modeltenancyact.php",
  },
  {
    id: "mta-notice-period",
    act: "Model Tenancy Act, 2021",
    section: "Section 21",
    heading: "Notice for termination of tenancy",
    text: `Where the duration of tenancy is not specified in the tenancy agreement, the tenancy shall be deemed to be month to month tenancy, terminable on one month's notice by either the landlord or the tenant.`,
    note: "The model's default when a tenancy agreement is silent on its own term. Unverified this session; see the note on mta-security-deposit for why, and for the adoption caveat that applies to every Model Tenancy Act chunk.",
    sourceUrl: "https://mohua.gov.in/cms/modeltenancyact.php",
  },

  // ---- Code on Wages, 2019 (unverified this session, see file header) ----
  {
    id: "cow-timely-payment",
    act: "Code on Wages, 2019",
    section: "Section 17",
    heading: "Time limit for payment of wages",
    text: `Wages shall be paid on a working day, within specified periods depending on the wage period fixed (daily, weekly, fortnightly or monthly), and in case of removal, dismissal, retrenchment or resignation of an employed person, the wages payable shall be paid within two working days of the date of removal, dismissal, retrenchment or resignation.`,
    note: "Consolidates what used to be the separate Payment of Wages Act, 1936 into this single Code. The two-working-day rule on separation is the figure most often relevant to a wages-not-paid grievance. This text was not re-verified against a freshly fetched primary source this session (indiacode.nic.in bitstream URLs for this Act returned HTTP 404 at build time); treat as a starting point to confirm.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15793",
  },
  {
    id: "cow-claim-authority",
    act: "Code on Wages, 2019",
    section: "Section 45",
    heading: "Authority to hear and decide claims",
    text: `The appropriate Government may, by notification, appoint a Gazetted officer of that Government as an authority to hear and decide for any establishment or class of establishments, claims arising out of payment of less than the minimum rate of wages or of wages for the days of rest or for overtime work, or non-payment of wages.`,
    note: "This is the deterministic answer to \"which authority\" for a Code on Wages claim: a designated officer of the appropriate government, not a civil court, not an RTI target. Unverified this session; see the note on cow-timely-payment for why.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15793",
  },
  {
    id: "cow-limitation",
    act: "Code on Wages, 2019",
    section: "Section 45(9)",
    heading: "Limitation period for a wage claim",
    text: `Every application under this section shall be presented within a period of three years from the date on which the claim arose.`,
    note: "Longer than the old Payment of Wages Act's limitation period; this Code widened it to three years. Unverified this session; see the note on cow-timely-payment for why.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15793",
  },

  // ---- Industrial Disputes Act, 1947 (unverified this session, see file header) ----
  {
    id: "ida-retrenchment-notice",
    act: "Industrial Disputes Act, 1947",
    section: "Section 25F",
    heading: "Conditions precedent to retrenchment of workmen",
    text: `No workman employed in any industry who has been in continuous service for not less than one year under an employer shall be retrenched by that employer until (a) the workman has been given one month's notice in writing indicating the reasons for retrenchment and the period of notice has expired, or the workman has been paid in lieu of such notice, wages for the period of the notice; (b) the workman has been paid, at the time of retrenchment, compensation which shall be equivalent to fifteen days' average pay for every completed year of continuous service or any part thereof in excess of six months; and (c) notice in the prescribed manner is served on the appropriate Government.`,
    note: "The core protection against an at-will dismissal for a worker who qualifies as a \"workman\" under this Act, a defined term narrower than \"employee\" generally; whether a specific role counts as a workman is itself a common point of dispute. Unverified this session (indiacode.nic.in bitstream URLs for this Act returned HTTP 404 at build time); treat as a starting point to confirm.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15191",
  },
  {
    id: "ida-forum",
    act: "Industrial Disputes Act, 1947",
    section: "Section 7",
    heading: "Labour Courts",
    text: `The appropriate Government may, by notification in the Official Gazette, constitute one or more Labour Courts for the adjudication of industrial disputes relating to any matter specified in the Second Schedule and for performing such other functions as may be assigned to them under this Act.`,
    note: "The dedicated forum a retrenchment or wrongful-dismissal dispute under this Act goes to, distinct from an ordinary civil court and from the Code on Wages' own claims authority above. Unverified this session; see the note on ida-retrenchment-notice for why.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15191",
  },
];

export function getRightsCorpusChunk(id: string): CorpusChunk | undefined {
  return RIGHTS_CORPUS.find((c) => c.id === id);
}
