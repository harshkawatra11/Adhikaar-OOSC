import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in | Adhikaar" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
        Sign in
      </p>
      <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink)" }}>
        Your filings, kept together
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Everything you file stays under your own account, private to you, so you never have
        to remember a registration number.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
