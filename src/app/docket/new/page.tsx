import { intakeAction } from "@/lib/actions";

export const metadata = { title: "New Case | Adhikaar" };

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
        New case
      </p>
      <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink)" }}>
        Take down the grievance
      </h1>
      <p className="mb-10 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Write the grievance the way the citizen described it. Do not clean it up first: the triage engine reads
        the raw description to classify the subject matter and to decide whether a Right to Information application
        is even the right instrument.
      </p>

      <form action={intakeAction} className="space-y-8">
        <Field label="Grievance, in the citizen's own words" required>
          <textarea
            name="grievance"
            required
            rows={6}
            placeholder="For example: I want a copy of the 7/12 extract and mutation register for my father's land in Nagpur taluka, khasra number 134/1, 2, 3."
            className="w-full border p-3 font-body text-base"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Applicant name">
            <input
              name="name"
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </Field>
          <Field label="State">
            <select
              name="state"
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
              defaultValue=""
            >
              <option value="">Select if known</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Other">Other (directory coverage limited)</option>
            </select>
          </Field>
        </div>

        <Field label="Applicant address">
          <textarea
            name="address"
            rows={2}
            className="w-full border p-3"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Preferred language for the plain-language copy">
            <input
              name="preferredLanguage"
              defaultValue="Hindi"
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </Field>
          <label className="flex items-center gap-3 pt-8">
            <input type="checkbox" name="isBpl" className="h-4 w-4" />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Applicant holds a Below Poverty Line certificate (fee exempt under section 7(5))
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="border-2 px-8 py-3 font-body font-semibold"
          style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
        >
          Run triage
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
        {label}
        {required && <span style={{ color: "var(--seal)" }}> *</span>}
      </span>
      {children}
    </label>
  );
}
