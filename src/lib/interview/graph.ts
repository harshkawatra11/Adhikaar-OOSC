// The interview is a deterministic graph, not an LLM agent. Every step
// is a plain data node; the function that picks the next one
// (nextStep, in engine.ts) is pure and fully testable. This matters
// for three reasons: it is testable, it costs nothing to run, and it
// cannot invent a step in front of a judge the way an LLM-driven
// interview could. Gemini's only role anywhere in this flow is
// summarising free text and phrasing a rewrite, never deciding what to
// ask next.

export type StepId =
  | "problem"
  | "triage_result"
  | "wrong_instrument"
  | "state"
  | "authority"
  | "questions"
  | "applicant"
  | "review"
  | "out_of_coverage";

export interface Answers {
  problem?: string;
  state?: string;
  authorityId?: string;
  questions?: string[];
  name?: string;
  address?: string;
  isBpl?: boolean;
  preferredLanguage?: string;
  /** Set once the citizen has seen the wrong-instrument screen and
   *  chosen to continue anyway, to obtain the underlying record. */
  acknowledgedWrongInstrument?: boolean;
}

export interface StepCopy {
  id: StepId;
  titleEn: string;
  titleHi: string;
  helpEn: string;
  helpHi: string;
}

export const STEPS: Record<StepId, StepCopy> = {
  problem: {
    id: "problem",
    titleEn: "What went wrong?",
    titleHi: "क्या गड़बड़ हुई?",
    helpEn: "Describe it the way you would say it out loud. You do not need the right words.",
    helpHi: "जैसे आप इसे बोलकर बताते, वैसे ही लिखिए। सही शब्द जानना ज़रूरी नहीं है।",
  },
  triage_result: {
    id: "triage_result",
    titleEn: "Here is what we worked out",
    titleHi: "हमने यह पता लगाया है",
    helpEn: "Before anything is drafted, this is the subject matter and who is responsible for it.",
    helpHi: "कुछ भी लिखे जाने से पहले, यह विषय और इसके लिए कौन जिम्मेदार है।",
  },
  wrong_instrument: {
    id: "wrong_instrument",
    titleEn: "An RTI may not be the fastest way to fix this",
    titleHi: "आरटीआई शायद इसे ठीक करने का सबसे तेज़ तरीका नहीं है",
    helpEn: "This looks like it needs a different kind of complaint. Here is where it actually goes.",
    helpHi: "इसके लिए शायद एक अलग तरह की शिकायत चाहिए। यह असल में कहाँ जाती है।",
  },
  state: {
    id: "state",
    titleEn: "Which state?",
    titleHi: "कौन सा राज्य?",
    helpEn: "This is a State subject, so we need to know which state to find the right office.",
    helpHi: "यह एक राज्य का विषय है, इसलिए सही कार्यालय खोजने के लिए हमें राज्य जानना होगा।",
  },
  authority: {
    id: "authority",
    titleEn: "Who is legally required to answer you",
    titleHi: "कौन आपको जवाब देने के लिए कानूनी रूप से बाध्य है",
    helpEn: "Pick the office we will address your application to.",
    helpHi: "वह कार्यालय चुनें जिसे हम आपका आवेदन भेजेंगे।",
  },
  questions: {
    id: "questions",
    titleEn: "What do you want to ask for?",
    titleHi: "आप क्या माँगना चाहते हैं?",
    helpEn: "Pick a question below or write your own. We check each one against the law as you type.",
    helpHi: "नीचे से एक प्रश्न चुनें या अपना खुद लिखें। आपके टाइप करते ही हम इसे कानून के अनुसार जाँचते हैं।",
  },
  applicant: {
    id: "applicant",
    titleEn: "Your details",
    titleHi: "आपका विवरण",
    helpEn: "Only what the law actually requires. You never have to explain why you are asking.",
    helpHi: "केवल वही जो कानून वास्तव में मांगता है। आपको यह बताने की ज़रूरत कभी नहीं कि आप क्यों पूछ रहे हैं।",
  },
  review: {
    id: "review",
    titleEn: "Review and file",
    titleHi: "समीक्षा करें और दाखिल करें",
    helpEn: "This is the application we will prepare. Nothing is sent anywhere until you download it.",
    helpHi: "यह वह आवेदन है जो हम तैयार करेंगे। जब तक आप इसे डाउनलोड नहीं करते, कुछ भी कहीं नहीं भेजा जाता।",
  },
  out_of_coverage: {
    id: "out_of_coverage",
    titleEn: "This is outside what we currently cover",
    titleHi: "यह अभी हमारे दायरे से बाहर है",
    helpEn: "We would rather say so than guess an address that turns out to be wrong.",
    helpHi: "हम एक गलत पता अंदाज़ा लगाने के बजाय यह बताना बेहतर समझते हैं।",
  },
};
