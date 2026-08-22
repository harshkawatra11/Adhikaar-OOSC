export function SiteFooter() {
  return (
    <footer className="border-t-2 mt-16" style={{ borderColor: "var(--ink)" }}>
      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-3 text-sm" style={{ color: "var(--ink-soft)" }}>
        <div>
          <p className="font-display font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Adhikaar
          </p>
          <p>
            An assistive drafting workbench for people who file Right to Information applications on behalf of
            others. It is not a source of legal advice, and every filing requires human review before it is sent.
          </p>
        </div>
        <div>
          <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
            Built for OOSC 4.0
          </p>
          <p>
            Prepared for the OOSC 4.0 Hackathon, Problem Statement 3, AI for Civic and Legal Empowerment. Released
            under the Apache License, Version 2.0.
          </p>
        </div>
        <div>
          <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
            Primary sources
          </p>
          <p>
            Right to Information Act, 2005. Digital Personal Data Protection Act, 2023. Department of Land
            Resources RTI disposal register. Full citations on the Methodology page.
          </p>
        </div>
      </div>
    </footer>
  );
}
