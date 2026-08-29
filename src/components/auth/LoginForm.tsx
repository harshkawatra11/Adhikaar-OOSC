"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/auth/firebaseClient";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

type Mode = "signin" | "signup";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/my";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"demo" | "google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function completeSignIn(credential: UserCredential) {
    const idToken = await credential.user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const body = (await res.json()) as { ok: boolean; error?: string };
    if (!body.ok) {
      throw new Error(body.error || "Could not start a session.");
    }
    // A full navigation, not router.push(). The App Router's client-side
    // Router Cache can hold a "no session, redirect to /login" decision
    // from before this cookie existed (for example a prefetch that ran
    // while signed out) and replay it instead of re-running middleware
    // against the cookie jar as it now stands. window.location forces a
    // real request, which always sees the cookie just set above. This
    // was caught by an end-to-end Playwright run, not by inspection: the
    // sign-in call itself returned 200 and the cookie was genuinely in
    // the browser's jar, and it still bounced back to /login.
    window.location.assign(next);
  }

  async function handleDemo() {
    setError(null);
    setPending("demo");
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
      await completeSignIn(credential);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setPending(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setPending("google");
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await completeSignIn(credential);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setPending(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending("email");
    try {
      const auth = getFirebaseAuth();
      const credential =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      await completeSignIn(credential);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setPending(null);
    }
  }

  if (!isFirebaseClientConfigured()) {
    return (
      <div className="border-2 p-5" style={{ borderColor: "var(--brick)", color: "var(--brick)" }}>
        Sign-in is not configured on this deployment. The four NEXT_PUBLIC_FIREBASE_* variables
        are missing; see .env.example.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleDemo}
        disabled={pending !== null || !DEMO_EMAIL}
        className="w-full border-2 px-6 py-4 font-body font-semibold text-lg disabled:opacity-50"
        style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
      >
        {pending === "demo" ? "Signing in…" : "Enter as a demo citizen"}
      </button>

      {DEMO_EMAIL && (
        <div className="border p-4 text-sm" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }}>
          <p className="mb-1" style={{ color: "var(--ink-soft)" }}>
            Or sign in by hand with the same account:
          </p>
          <p className="font-mono select-all" style={{ color: "var(--ink)" }}>
            {DEMO_EMAIL}
          </p>
          <p className="font-mono select-all" style={{ color: "var(--ink)" }}>
            {DEMO_PASSWORD}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending !== null}
        className="w-full border-2 px-5 py-3 font-body font-semibold disabled:opacity-50"
        style={{ borderColor: "var(--ink)", color: "var(--ink)", background: "var(--paper)" }}
      >
        {pending === "google" ? "Signing in…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--rule)" }} />
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: "var(--ink-faint)" }}>
          or
        </span>
        <div className="h-px flex-1" style={{ background: "var(--rule)" }} />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </label>
        <button
          type="submit"
          disabled={pending !== null}
          className="w-full border-2 px-5 py-3 font-body font-semibold disabled:opacity-50"
          style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
        >
          {pending === "email" ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-sm underline"
          style={{ color: "var(--seal-deep)" }}
        >
          {mode === "signin" ? "New here? Create an account instead." : "Already have an account? Sign in instead."}
        </button>
      </form>

      {error && (
        <p className="border p-3 text-sm" style={{ borderColor: "var(--brick)", color: "var(--brick)" }}>
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
        Your grievance text can contain personal information. It is stored only to let you
        return to a filing in progress, is never shown to anyone but you, and is never used to
        train a model.
      </p>
    </div>
  );
}

function readableError(e: unknown): string {
  if (e instanceof Error) {
    if (e.message.includes("auth/popup-blocked")) {
      return "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.";
    }
    if (e.message.includes("auth/popup-closed-by-user")) {
      return "The Google sign-in window was closed before finishing.";
    }
    if (e.message.includes("auth/wrong-password") || e.message.includes("auth/invalid-credential")) {
      return "That email and password combination was not recognised.";
    }
    if (e.message.includes("auth/email-already-in-use")) {
      return "An account with that email already exists. Try signing in instead.";
    }
    if (e.message.includes("auth/weak-password")) {
      return "Choose a password of at least six characters.";
    }
    return e.message;
  }
  return "Something went wrong. Please try again.";
}
