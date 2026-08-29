export function SiteFooter() {
  return (
    <footer className="border-t-2 mt-16" style={{ borderColor: "var(--ink)" }}>
      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-3 text-sm" style={{ color: "var(--ink-soft)" }}>
        <div>
          <p className="font-display font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Adhikaar
          </p>
          <p>
            A citizen&rsquo;s guided path from am I even eligible to here is the document, grounded in the
            actual statutory text at every step. It is not a source of legal advice, and every filing requires
            your own review before it is sent.
          </p>
        </div>
        <div>
          <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
            Civic and legal empowerment
          </p>
          <p>
            Built for citizens navigating government processes on their own. Released under the Apache
            License, Version 2.0.
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
