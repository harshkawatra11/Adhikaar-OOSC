import { intakeAction } from "@/lib/actions";
import { GrievanceField } from "@/components/GrievanceField";
import { requireSession } from "@/lib/auth/session";

export const metadata = { title: "Start a filing | Adhikaar" };

// This page is a placeholder pending WP4, which replaces the single
// form below with a guided interview. Kept working in the meantime,
// with citizen-facing copy rather than operator-facing copy.
export default async function StartPage() {
  await requireSession("/start");

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
        Start a filing
      </p>
      <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink)" }}>
        Tell us what went wrong
      </h1>
      <p className="mb-10 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Describe it the way you would say it out loud. You do not need to know the right words:
        we read what you write to work out the subject and which office is actually responsible,
        before anything is drafted.
      </p>

      <form action={intakeAction} className="space-y-8">
        <GrievanceField />

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
          See who is responsible
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
