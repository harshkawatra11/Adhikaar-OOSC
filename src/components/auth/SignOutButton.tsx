"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/auth/firebaseClient";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      if (isFirebaseClientConfigured()) {
        await signOut(getFirebaseAuth());
      }
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="hover:underline disabled:opacity-50"
      style={{ color: "var(--ink-soft)" }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
