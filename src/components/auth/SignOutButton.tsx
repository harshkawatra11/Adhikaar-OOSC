"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/auth/firebaseClient";

export function SignOutButton({
  label = "Sign out",
  pendingLabel = "Signing out…",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      if (isFirebaseClientConfigured()) {
        await signOut(getFirebaseAuth());
      }
      await fetch("/api/auth/session", { method: "DELETE" });
      // A full navigation, not router.push(): see the matching comment
      // in LoginForm.tsx. The Router Cache can otherwise replay a
      // stale "signed in" decision from before the cookie was cleared.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate, proven necessary by an end-to-end test; see the comment above.
      window.location.assign("/");
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
      {pending ? pendingLabel : label}
    </button>
  );
}
