// The English dictionary. hi.ts is typed against this file's shape
// (Record<keyof typeof en, string>), so a missing Hindi translation is
// a compile error, not a silent English fallback in a Hindi screen.
//
// Scope, stated honestly: this covers the three surfaces the app's own
// language toggle actually promises full coverage for, the interview
// (/start), the Rights Navigator (/rights), and the Scheme Eligibility
// Reader (/schemes), plus site-wide navigation. The landing page's
// prose acts and the methodology page are long-form written content,
// not interactive flows, and are not translated here; WP10 owns
// whether and how the landing page itself gets a Hindi pass. Toggling
// to Hindi and walking start/rights/schemes end to end should show no
// English string from THIS dictionary; it will still show English
// article and section quotations, since a citation renders the
// statute's actual text, which section 6(1) requires stay in the
// language it will be filed in, never a translation presented as if
// it were the statute (see the note on this in graph.ts's own header).

export const en = {
  "nav.myFilings": "My filings",
  "nav.startFiling": "Start a new filing",
  "nav.rightsNavigator": "Rights Navigator",
  "nav.schemeEligibility": "Scheme Eligibility",
  "nav.methodology": "Methodology",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.signingOut": "Signing out…",

  "common.continue": "Continue",
  "common.back": "Back",
  "common.dictate": "Dictate",
  "common.listening": "Listening…",

  "interview.problem.placeholder": "For example: I want a copy of the 7/12 extract and mutation register for my father's land in Nagpur taluka, khasra number 134/1, 2, 3.",
  "interview.triage.unionSubjectPrefix": "This is a",
  "interview.triage.unionSubjectLabel": "Central (Union) subject",
  "interview.triage.unionSubjectSuffix": "A Central government office is the right one to write to.",
  "interview.triage.stateSubjectPrefix": "This is a",
  "interview.triage.stateSubjectLabel": "State subject",
  "interview.triage.stateSubjectSuffix": "A Central government office cannot lawfully answer this: it would be returned to you rather than forwarded, and the fee is not refunded.",
  "interview.triage.concurrentSubject": "Both the Centre and your State can act on this. We will help you pick the right one.",
  "interview.triage.unclassified": "We could not confidently classify the subject matter from what you wrote. We will not guess; you can pick the office yourself in the next step.",
  "interview.triage.wrongInstrumentHint": "One more thing: this reads less like a records request and more like a",
  "interview.triage.wrongInstrumentHintSuffix": "matter. We will explain on the next screen.",
  "interview.wrongInstrument.continueAnyway": "Continue anyway, to get the record",
  "interview.state.select": "Select your state",
  "interview.state.coveredNote": "Adhikaar currently covers Delhi and Maharashtra in depth at the department level. For any other state we will say so honestly rather than guess an address.",
  "interview.authority.confidence": "confidence",
  "interview.authority.thisIsTheOffice": "This is the office I will write to",
  "interview.questions.useTemplate": "Use:",
  "interview.questions.writeOwn": "Write your own question",
  "interview.questions.addThis": "Add this question",
  "interview.questions.remove": "Remove",
  "interview.applicant.name": "Your name",
  "interview.applicant.address": "Your address",
  "interview.applicant.noReasonNeeded": "That is all we need. You are never required to explain why you want this.",
  "interview.applicant.bpl": "I hold a Below Poverty Line certificate (fee exempt)",
  "interview.applicant.language": "Language for your plain-language copy",
  "interview.review.to": "To:",
  "interview.review.yourQuestions": "Your questions",
  "interview.review.fee": "Fee:",
  "interview.review.payableVia": "payable via",
  "interview.review.prepare": "Prepare my application",
  "interview.review.preparing": "Preparing…",
  "interview.outOfCoverage.noAuthority": "We could not find an authority in our directory that matches this. Rather than guess an address that turns out to be wrong, we are saying so.",
  "interview.outOfCoverage.tenancy": "Tenancy law is entirely state-legislated with no uniform national statute, and this directory does not cover any state rent authority. Direct this to the State Rent Authority for your state, or to a local legal aid clinic.",

  "rights.askLabel": "Ask about a right, in your own words",
  "rights.placeholder": "For example: my landlord is refusing to return my security deposit after I vacated the flat.",
  "rights.ask": "Ask",
  "rights.checking": "Checking the corpus…",
  "rights.noSourceTitle": "No source for this",
  "rights.noSourceBody": "We could not find a statute in our corpus that speaks to this question with enough confidence to answer. Rather than guess, we are saying so.",
  "rights.whatWeCover": "What we do cover:",
  "rights.inPlainLanguage": "In plain language",
  "rights.readTheText": "Read the text",
  "rights.boundaryLine": "This explains what the law says. It is not advice about your specific situation, and for that you need a lawyer or a legal aid clinic.",
  "rights.getTheRecord": "Get the record you will need",

  "schemes.title": "Do you actually qualify?",
  "schemes.yourAge": "Your age",
  "schemes.gender": "Gender",
  "schemes.selectOption": "Select",
  "schemes.female": "Female",
  "schemes.male": "Male",
  "schemes.other": "Other",
  "schemes.state": "State",
  "schemes.annualIncome": "Annual household income (Rs.)",
  "schemes.landHolding": "Land holding (acres, 0 if none)",
  "schemes.rationCard": "Ration card",
  "schemes.occupation": "Occupation",
  "schemes.ownsPuccaHouse": "I already own a pucca (permanent) house",
  "schemes.isGovtEmployee": "I am a government employee or pensioner",
  "schemes.paidIncomeTax": "I paid income tax last assessment year",
  "schemes.hasDaughterUnder10": "I have a daughter under 10 years old",
  "schemes.checkEligibility": "Check eligibility",
  "schemes.leaveBlank": "Leave anything blank you are not sure of; we will say “need more information” rather than guess.",
  "schemes.eligible": "Eligible",
  "schemes.notEligible": "Not eligible",
  "schemes.needMoreInfo": "Need more information",
  "schemes.sourcesDisagree": "Sources disagree on some figures for this scheme.",
  "schemes.unverified": "This scheme's figures are unverified against a primary source this session.",
  "schemes.askWhy": "Ask them why, in writing",
} as const;

export type TranslationKey = keyof typeof en;
