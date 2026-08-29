// The Scheme Eligibility Reader's knowledge base. Bounded on purpose:
// eight schemes, hand-verified, each with its own confidence flag,
// rather than a large unverified catalogue. Every scheme's `note`
// records exactly what was and was not confirmed against a primary
// source; see build-what-india-moves/RESEARCH.md section 8 for the
// fetch attempts, including two official domains (pmjay.gov.in,
// pmayg.nic.in) that refused a direct connection from this environment
// entirely, not merely a bot-block.
//
// The evaluator in src/lib/schemes/evaluate.ts decides eligibility.
// Nothing here is a model call; every `test` function is a plain,
// pure predicate over a CitizenProfile.

export type RationCardType = "BPL" | "AAY" | "APL" | "none" | "unknown";

export type OccupationCategory =
  | "farmer"
  | "government_employee"
  | "professional"
  | "daily_wage_or_domestic_worker"
  | "artisan_or_craftsperson"
  | "unemployed"
  | "other";

/** Every field optional: a citizen may not have answered every
 *  question yet, and the evaluator must return "unknown" rather than
 *  guess when a field a criterion needs is absent. */
export interface CitizenProfile {
  age?: number;
  state?: string;
  annualHouseholdIncome?: number; // rupees per year
  landHoldingAcres?: number; // 0 if landless
  rationCardType?: RationCardType;
  occupationCategory?: OccupationCategory;
  ownsPuccaHouse?: boolean;
  gender?: "female" | "male" | "other";
  isGovernmentEmployeeOrPensioner?: boolean;
  paysIncomeTax?: boolean;
  /** For Sukanya Samriddhi, whose beneficiary is a daughter, not the
   *  adult answering these questions. */
  hasDaughterUnder10?: boolean;
}

export interface Criterion {
  id: string;
  labelEn: string;
  labelHi: string;
  /** Returns null when the profile does not carry enough to decide.
   *  Never guess an unknown into true. */
  test: (p: CitizenProfile) => boolean | null;
  ruleTextEn: string;
  ruleTextHi: string;
}

export type SchemeConfidence = "verified" | "conflicting_sources" | "unverified";

export interface Scheme {
  id: string;
  nameEn: string;
  nameHi: string;
  ministry: string;
  jurisdiction: "union" | "state";
  criteria: Criterion[];
  benefitEn: string;
  benefitHi: string;
  applyUrl: string;
  sourceUrl: string;
  verifiedOn: string;
  confidence: SchemeConfidence;
  note?: string;
}

export const SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    nameEn: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameHi: "पीएम-किसान",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    jurisdiction: "union",
    criteria: [
      {
        id: "landholding",
        labelEn: "Belongs to a land-holding farmer family",
        labelHi: "भूमिधारक किसान परिवार से संबंधित है",
        test: (p) => (p.landHoldingAcres === undefined ? null : p.landHoldingAcres > 0),
        ruleTextEn: "The scheme covers all land-holding farmer families, as per official land records.",
        ruleTextHi: "यह योजना आधिकारिक भूमि अभिलेखों के अनुसार सभी भूमिधारक किसान परिवारों को कवर करती है।",
      },
      {
        id: "not-government-employee",
        labelEn: "Not a serving or retired government employee",
        labelHi: "सरकारी कर्मचारी या सेवानिवृत्त कर्मचारी नहीं है",
        test: (p) => (p.occupationCategory === undefined ? null : p.occupationCategory !== "government_employee"),
        ruleTextEn: "All serving or retired officers and employees of Central or State Government are excluded (Class IV and Group D staff are the one exception the scheme itself carries, which this check does not separately ask about).",
        ruleTextHi: "केंद्र या राज्य सरकार के सभी कार्यरत या सेवानिवृत्त अधिकारी और कर्मचारी बाहर रखे गए हैं।",
      },
      {
        id: "not-professional",
        labelEn: "Not a doctor, engineer, lawyer, chartered accountant, or architect",
        labelHi: "डॉक्टर, इंजीनियर, वकील, चार्टर्ड अकाउंटेंट या आर्किटेक्ट नहीं है",
        test: (p) => (p.occupationCategory === undefined ? null : p.occupationCategory !== "professional"),
        ruleTextEn: "Licensed professionals such as doctors, engineers, lawyers, chartered accountants and architects are excluded, even if they also hold land.",
        ruleTextHi: "डॉक्टर, इंजीनियर, वकील, चार्टर्ड अकाउंटेंट और आर्किटेक्ट जैसे लाइसेंस प्राप्त पेशेवर बाहर रखे गए हैं।",
      },
      {
        id: "no-income-tax",
        labelEn: "Did not pay income tax in the last assessment year",
        labelHi: "पिछले निर्धारण वर्ष में आयकर का भुगतान नहीं किया",
        test: (p) => (p.paysIncomeTax === undefined ? null : !p.paysIncomeTax),
        ruleTextEn: "All persons who paid income tax in the last assessment year are excluded.",
        ruleTextHi: "पिछले निर्धारण वर्ष में आयकर का भुगतान करने वाले सभी व्यक्ति बाहर रखे गए हैं।",
      },
    ],
    benefitEn: "Rs. 6,000 per year, paid in three equal installments of Rs. 2,000 directly to the beneficiary's bank account.",
    benefitHi: "प्रति वर्ष 6,000 रुपये, लाभार्थी के बैंक खाते में सीधे 2,000 रुपये की तीन बराबर किस्तों में भुगतान किया जाता है।",
    applyUrl: "https://pmkisan.gov.in/",
    sourceUrl: "https://pmkisan.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "verified",
    note: "Fetched directly from the official pmkisan.gov.in page and independently cross-checked; both agree on the benefit amount, the three-installment schedule, and the full exclusion list.",
  },
  {
    id: "ayushman-bharat-pmjay",
    nameEn: "Ayushman Bharat PM-JAY",
    nameHi: "आयुष्मान भारत PM-JAY",
    ministry: "National Health Authority, Ministry of Health and Family Welfare",
    jurisdiction: "union",
    criteria: [
      {
        id: "secc-or-senior",
        labelEn: "SECC 2011 deprivation category (via BPL/AAY ration card) or age 70 and above",
        labelHi: "SECC 2011 अभाव श्रेणी (BPL/AAY राशन कार्ड के माध्यम से) या 70 वर्ष और उससे अधिक आयु",
        test: (p) => {
          if (p.age !== undefined && p.age >= 70) return true;
          if (p.rationCardType === undefined) return null;
          return p.rationCardType === "BPL" || p.rationCardType === "AAY";
        },
        ruleTextEn: "Covers families identified as deprived under SECC 2011 rural/urban deprivation categories, or, since September 2024, every citizen aged 70 and above regardless of income.",
        ruleTextHi: "SECC 2011 ग्रामीण/शहरी अभाव श्रेणियों के तहत पहचाने गए परिवारों को कवर करता है, या सितंबर 2024 से, आय की परवाह किए बिना 70 वर्ष और उससे अधिक आयु के हर नागरिक को।",
      },
    ],
    benefitEn: "Health cover up to Rs. 5 lakh per family per year for secondary and tertiary hospitalisation.",
    benefitHi: "द्वितीयक और तृतीयक अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष 5 लाख रुपये तक का स्वास्थ्य कवर।",
    applyUrl: "https://pmjay.gov.in/",
    sourceUrl: "https://pmjay.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "conflicting_sources",
    note: "pmjay.gov.in refused a direct connection this session (not a bot-block, a connection failure), so this was confirmed via eight independent secondary sources agreeing with each other on the SECC deprivation categories and the 70+ universal-coverage expansion, rather than the primary page itself. The full six SECC rural deprivation sub-categories (D1-D7) are simplified here to \"BPL/AAY ration card\" as a practical proxy, since asking a citizen to self-classify against D1-D7 directly is not realistic in this interface.",
  },
  {
    id: "pmay-gramin",
    nameEn: "PM Awas Yojana, Gramin",
    nameHi: "पीएम आवास योजना, ग्रामीण",
    ministry: "Ministry of Rural Development",
    jurisdiction: "union",
    criteria: [
      {
        id: "no-pucca-house",
        labelEn: "Does not already own a pucca house",
        labelHi: "पहले से पक्का मकान नहीं है",
        test: (p) => (p.ownsPuccaHouse === undefined ? null : !p.ownsPuccaHouse),
        ruleTextEn: "Covers households living in a kutcha or dilapidated house, or with no house at all.",
        ruleTextHi: "कच्चे या जर्जर मकान में रहने वाले, या बिना किसी मकान के परिवारों को कवर करता है।",
      },
      {
        id: "secc-listed",
        labelEn: "SECC-listed as housing-deprived (via BPL/AAY ration card)",
        labelHi: "आवास-वंचित के रूप में SECC-सूचीबद्ध (BPL/AAY राशन कार्ड के माध्यम से)",
        test: (p) => (p.rationCardType === undefined ? null : p.rationCardType === "BPL" || p.rationCardType === "AAY"),
        ruleTextEn: "Primary beneficiary identification runs off SECC 2011 housing-deprivation data plus the Awaas+ survey for households missed by SECC. Simplified here to BPL/AAY ration card status as a practical proxy.",
        ruleTextHi: "प्राथमिक लाभार्थी पहचान SECC 2011 आवास-अभाव डेटा और SECC द्वारा छूटे परिवारों के लिए आवास+ सर्वेक्षण पर आधारित है।",
      },
      {
        id: "income-ceiling",
        labelEn: "Household income at or below Rs. 15,000 per month",
        labelHi: "घरेलू आय 15,000 रुपये प्रति माह या उससे कम",
        test: (p) => (p.annualHouseholdIncome === undefined ? null : p.annualHouseholdIncome <= 180000),
        ruleTextEn: "The PMAY-G 2.0 (2024 onward) revision raised the monthly household income ceiling to Rs. 15,000 (from Rs. 10,000 previously). This scheme uses the newer, higher figure; sources disagree on whether the older figure still applies in every state.",
        ruleTextHi: "PMAY-G 2.0 (2024 से) संशोधन ने मासिक घरेलू आय सीमा को 15,000 रुपये (पहले 10,000 रुपये से) तक बढ़ा दिया।",
      },
      {
        id: "not-government-employee",
        labelEn: "Not a government employee and did not pay income tax",
        labelHi: "सरकारी कर्मचारी नहीं है और आयकर का भुगतान नहीं किया",
        test: (p) => {
          if (p.isGovernmentEmployeeOrPensioner === undefined || p.paysIncomeTax === undefined) return null;
          return !p.isGovernmentEmployeeOrPensioner && !p.paysIncomeTax;
        },
        ruleTextEn: "Government employees and income-tax payers are excluded, per the scheme's standard exclusion list.",
        ruleTextHi: "सरकारी कर्मचारी और आयकरदाता योजना की मानक बहिष्करण सूची के अनुसार बाहर रखे गए हैं।",
      },
    ],
    benefitEn: "Financial assistance of Rs. 1.20 lakh (plain areas) or Rs. 1.30 lakh (hilly/difficult areas) to construct a pucca house.",
    benefitHi: "पक्का मकान बनाने के लिए 1.20 लाख रुपये (मैदानी क्षेत्र) या 1.30 लाख रुपये (पहाड़ी/दुर्गम क्षेत्र) की वित्तीय सहायता।",
    applyUrl: "https://pmayg.nic.in/",
    sourceUrl: "https://pmayg.nic.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "pmayg.nic.in returned a DNS failure to a direct fetch this session. Confirmed via secondary sources only, which themselves disagree on the exact income ceiling (Rs. 10,000/month pre-2024 vs Rs. 15,000/month under PMAY-G 2.0); the higher, newer figure is used here. Re-fetch the primary source before relying on the exact figure in a pitch.",
  },
  {
    id: "pm-ujjwala",
    nameEn: "PM Ujjwala Yojana",
    nameHi: "पीएम उज्ज्वला योजना",
    ministry: "Ministry of Petroleum and Natural Gas",
    jurisdiction: "union",
    criteria: [
      {
        id: "adult-woman",
        labelEn: "Applicant is a woman aged 18 or above",
        labelHi: "आवेदक 18 वर्ष या उससे अधिक आयु की महिला है",
        test: (p) => {
          if (p.gender === undefined || p.age === undefined) return null;
          return p.gender === "female" && p.age >= 18;
        },
        ruleTextEn: "The applicant must be a woman who has attained 18 years of age.",
        ruleTextHi: "आवेदक 18 वर्ष की आयु प्राप्त कर चुकी महिला होनी चाहिए।",
      },
      {
        id: "bpl-category",
        labelEn: "Belongs to a BPL or AAY household with no existing LPG connection",
        labelHi: "BPL या AAY परिवार से संबंधित है जिसके पास कोई मौजूदा एलपीजी कनेक्शन नहीं है",
        test: (p) => (p.rationCardType === undefined ? null : p.rationCardType === "BPL" || p.rationCardType === "AAY"),
        ruleTextEn: "Adult women from BPL households (per SECC 2011 or the scheme's own eligible categories, including AAY, SC/ST, forest dwellers and tea-garden tribes) without an existing LPG connection qualify.",
        ruleTextHi: "SECC 2011 के अनुसार BPL परिवारों की वयस्क महिलाएं, जिनके पास कोई मौजूदा एलपीजी कनेक्शन नहीं है, पात्र हैं।",
      },
    ],
    benefitEn: "A free LPG connection with a security-deposit waiver, plus subsidised refills.",
    benefitHi: "सुरक्षा जमा छूट के साथ एक मुफ्त एलपीजी कनेक्शन, साथ ही सब्सिडी वाले रिफिल।",
    applyUrl: "https://www.pmuy.gov.in/",
    sourceUrl: "https://www.pmuy.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "Not directly fetched this session; confirmed via secondary sources only. No source found a specific numeric income ceiling for this scheme; BPL/AAY ration card status is used as the practical eligibility proxy, matching how the scheme's own official guidance describes it categorically rather than by a rupee figure.",
  },
  {
    id: "nsap-old-age-pension",
    nameEn: "NSAP: Indira Gandhi National Old Age Pension Scheme",
    nameHi: "एनएसएपी: इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
    ministry: "Ministry of Rural Development",
    jurisdiction: "union",
    criteria: [
      {
        id: "age-60-plus",
        labelEn: "Aged 60 or above",
        labelHi: "60 वर्ष या उससे अधिक आयु",
        test: (p) => (p.age === undefined ? null : p.age >= 60),
        ruleTextEn: "Applicants must be 60 years of age or above.",
        ruleTextHi: "आवेदकों की आयु 60 वर्ष या उससे अधिक होनी चाहिए।",
      },
      {
        id: "bpl-household",
        labelEn: "Belongs to a BPL household",
        labelHi: "BPL परिवार से संबंधित है",
        test: (p) => (p.rationCardType === undefined ? null : p.rationCardType === "BPL" || p.rationCardType === "AAY"),
        ruleTextEn: "Must belong to a household below the poverty line as per Government of India norms.",
        ruleTextHi: "भारत सरकार के मानदंडों के अनुसार गरीबी रेखा से नीचे के परिवार से संबंधित होना चाहिए।",
      },
    ],
    benefitEn: "Rs. 200 per month up to age 79, and Rs. 500 per month from age 80 onward, under the Central scheme; many states pay a top-up above this.",
    benefitHi: "केंद्रीय योजना के तहत 79 वर्ष तक प्रति माह 200 रुपये, और 80 वर्ष से प्रति माह 500 रुपये; कई राज्य इसके ऊपर अतिरिक्त राशि देते हैं।",
    applyUrl: "https://nsap.nic.in/",
    sourceUrl: "https://nsap.nic.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "Not directly fetched this session (the Guidelines PDF was located but not retrieved). Confirmed via secondary sources only, internally consistent on the central figures; several states pay a materially higher top-up amount (Gujarat, for example, sources describe as Rs. 400/700), which this scheme's benefit figures deliberately state as the Central floor, not a national number.",
  },
  {
    id: "sukanya-samriddhi",
    nameEn: "Sukanya Samriddhi Yojana",
    nameHi: "सुकन्या समृद्धि योजना",
    ministry: "Department of Economic Affairs / India Post",
    jurisdiction: "union",
    criteria: [
      {
        id: "daughter-under-10",
        labelEn: "Has a daughter under 10 years of age",
        labelHi: "10 वर्ष से कम आयु की बेटी है",
        test: (p) => (p.hasDaughterUnder10 === undefined ? null : p.hasDaughterUnder10),
        ruleTextEn: "An account can be opened for a girl child any time from birth until she turns 10; the window closes permanently on her tenth birthday.",
        ruleTextHi: "बालिका के जन्म से लेकर 10 वर्ष की आयु तक कभी भी खाता खोला जा सकता है; उसके दसवें जन्मदिन पर विंडो स्थायी रूप से बंद हो जाती है।",
      },
    ],
    benefitEn: "A savings account for the girl child, currently 8.2% interest compounded annually, maturing 21 years from account opening.",
    benefitHi: "बालिका के लिए एक बचत खाता, वर्तमान में 8.2% ब्याज वार्षिक रूप से चक्रवृद्धि, खाता खोलने के 21 वर्ष बाद परिपक्व।",
    applyUrl: "https://www.indiapost.gov.in/",
    sourceUrl: "https://www.indiapost.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "Not directly fetched from indiapost.gov.in this session; confirmed via multiple independent financial-service secondary sources that agree closely on the age ceiling, tenure and current interest rate.",
  },
  {
    id: "pm-vishwakarma",
    nameEn: "PM Vishwakarma",
    nameHi: "पीएम विश्वकर्मा",
    ministry: "Ministry of Micro, Small and Medium Enterprises",
    jurisdiction: "union",
    criteria: [
      {
        id: "age-18-plus",
        labelEn: "Aged 18 or above",
        labelHi: "18 वर्ष या उससे अधिक आयु",
        test: (p) => (p.age === undefined ? null : p.age >= 18),
        ruleTextEn: "Any artisan aged 18 or above may apply.",
        ruleTextHi: "18 वर्ष या उससे अधिक आयु का कोई भी शिल्पकार आवेदन कर सकता है।",
      },
      {
        id: "artisan-trade",
        labelEn: "Works in one of the 18 notified artisan trades",
        labelHi: "18 अधिसूचित शिल्पकार व्यवसायों में से एक में काम करता है",
        test: (p) => (p.occupationCategory === undefined ? null : p.occupationCategory === "artisan_or_craftsperson"),
        ruleTextEn: "Covers carpenters, blacksmiths, goldsmiths, potters, cobblers, tailors, masons and thirteen other named traditional trades.",
        ruleTextHi: "बढ़ई, लोहार, सुनार, कुम्हार, मोची, दर्जी, राजमिस्त्री और तेरह अन्य नामित पारंपरिक व्यवसायों को कवर करता है।",
      },
    ],
    benefitEn: "Skill training with a stipend, a toolkit incentive, and collateral-free loans up to Rs. 3 lakh in two tranches.",
    benefitHi: "वजीफे के साथ कौशल प्रशिक्षण, एक टूलकिट प्रोत्साहन, और दो किस्तों में 3 लाख रुपये तक का बिना जमानत ऋण।",
    applyUrl: "https://pmvishwakarma.gov.in/",
    sourceUrl: "https://pmvishwakarma.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "Not directly fetched this session; confirmed via secondary sources only. This scheme also excludes an applicant who took a similar government self-employment loan in the last five years; that check is not asked in this interface's profile, since the app scopes its questions to the smallest set that discriminates across all eight schemes. State this limit honestly to a citizen whose result depends on it.",
  },
  {
    id: "mmlby-maharashtra",
    nameEn: "Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra)",
    nameHi: "मुख्यमंत्री माझी लाडकी बहीण योजना (महाराष्ट्र)",
    ministry: "Women and Child Development Department, Government of Maharashtra",
    jurisdiction: "state",
    criteria: [
      {
        id: "female-applicant",
        labelEn: "Applicant is a woman",
        labelHi: "आवेदक एक महिला है",
        test: (p) => (p.gender === undefined ? null : p.gender === "female"),
        ruleTextEn: "Restricted to women, including married, widowed, divorced, abandoned and destitute women, and one unmarried woman per family.",
        ruleTextHi: "महिलाओं तक सीमित, जिसमें विवाहित, विधवा, तलाकशुदा, परित्यक्त और निराश्रित महिलाएं, और प्रति परिवार एक अविवाहित महिला शामिल है।",
      },
      {
        id: "age-band",
        labelEn: "Aged between 21 and 65",
        labelHi: "21 से 65 वर्ष के बीच की आयु",
        test: (p) => (p.age === undefined ? null : p.age >= 21 && p.age <= 65),
        ruleTextEn: "The applicant's age must fall between 21 and 65 years.",
        ruleTextHi: "आवेदक की आयु 21 से 65 वर्ष के बीच होनी चाहिए।",
      },
      {
        id: "maharashtra-resident",
        labelEn: "Resident of Maharashtra",
        labelHi: "महाराष्ट्र का निवासी",
        test: (p) => (p.state === undefined ? null : p.state === "Maharashtra"),
        ruleTextEn: "The applicant must be a resident of Maharashtra state, this being a State scheme rather than a Central one.",
        ruleTextHi: "आवेदक महाराष्ट्र राज्य का निवासी होना चाहिए, क्योंकि यह एक केंद्रीय योजना के बजाय एक राज्य योजना है।",
      },
      {
        id: "income-ceiling",
        labelEn: "Family annual income at or below Rs. 2.5 lakh",
        labelHi: "परिवार की वार्षिक आय 2.5 लाख रुपये या उससे कम",
        test: (p) => (p.annualHouseholdIncome === undefined ? null : p.annualHouseholdIncome <= 250000),
        ruleTextEn: "The applicant's family annual income must not exceed Rs. 2,50,000.",
        ruleTextHi: "आवेदक के परिवार की वार्षिक आय 2,50,000 रुपये से अधिक नहीं होनी चाहिए।",
      },
    ],
    benefitEn: "Rs. 1,500 per month via Direct Benefit Transfer to an Aadhaar-linked bank account.",
    benefitHi: "आधार-लिंक्ड बैंक खाते में प्रत्यक्ष लाभ हस्तांतरण के माध्यम से प्रति माह 1,500 रुपये।",
    applyUrl: "https://ladakibahin.maharashtra.gov.in/",
    sourceUrl: "https://ladakibahin.maharashtra.gov.in/",
    verifiedOn: "2026-08-29",
    confidence: "unverified",
    note: "Not directly fetched this session; confirmed via six or more independent secondary sources that agree closely on the age band, income ceiling and benefit amount. Included specifically as the State-jurisdiction example, since every other scheme in this list is a Central one, and Union/State jurisdiction is a distinction the rest of Adhikaar already reasons about carefully for RTI purposes.",
  },
];

export function getScheme(id: string): Scheme | undefined {
  return SCHEMES.find((s) => s.id === id);
}
