"use client";

import { useFormStatus } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

// The one place useFormStatus is used, so every Server Action-backed
// form in the case workspace gets a real pending state (a disabled
// button with changed text) without each call site re-implementing it.
// useFormStatus reads the nearest ancestor <form>'s pending state, so
// this only has to sit inside the form; the action itself stays a
// plain Server Action defined where it already was.

export function SubmitButton({
  children,
  pendingLabel,
  className,
  style,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:opacity-50`}
      style={style}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
