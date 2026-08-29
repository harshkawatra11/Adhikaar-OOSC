// Pre-filled, editable question starting points, keyed to the subject
// matter the jurisdiction engine already classified. Every template is
// written to already pass the eighteen-rule linter (a certified copy
// of a record, not an opinion, not unbounded), which teaches the
// citizen what a compliant question looks like by example rather than
// by reading a rulebook. Always editable; never submitted as-is.

const TEMPLATES_BY_SUBJECT: Record<string, string[]> = {
  "Land and land revenue": [
    "Please provide a certified copy of the mutation register entry and the current record of rights for the property described above, for the period 2020 to 2024.",
    "Please provide a certified copy of the file noting recording the decision on any application concerning this land filed by me in the last two years.",
  ],
  Police: [
    "Please provide a certified copy of the First Information Report and the current investigation status noting for the complaint described above.",
  ],
  Passports: [
    "Please provide the current status of my passport application, the date police verification was completed, and the reason for any delay beyond the standard processing time.",
  ],
  "Banking and provident fund": [
    "Please provide a copy of my Provident Fund passbook statement for the last three years and the current processing status of my claim.",
  ],
  "Central taxation": [
    "Please provide the current processing status of my return for the assessment year described above and the reason for any delay beyond the standard processing time.",
  ],
  "Public distribution system": [
    "Please provide a certified copy of the record showing the current status of my ration card application or grievance described above.",
  ],
  Education: [
    "Please provide a certified copy of the file noting recording the decision on the admission or scholarship matter described above.",
  ],
  "Public health and hospitals": [
    "Please provide a certified copy of the record or order relating to the matter described above, for the period stated.",
  ],
  Aadhaar: [
    "Please provide a certified copy of my original Aadhaar enrolment form and the history of correction requests I have submitted.",
  ],
  Railways: [
    "Please provide a certified copy of the record or order relating to the matter described above.",
  ],
  Electricity: [
    "Please provide a certified copy of the record or order relating to the connection or billing matter described above.",
  ],
};

const GENERIC_TEMPLATE =
  "Please provide a certified copy of the file noting, order, or record relating to the matter described above, for the period [insert specific date range].";

export function suggestQuestionTemplates(subjectMatter: string | undefined): string[] {
  const specific = subjectMatter ? TEMPLATES_BY_SUBJECT[subjectMatter] ?? [] : [];
  return specific.length ? specific : [GENERIC_TEMPLATE];
}
