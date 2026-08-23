"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Plays once per browser session, on a real cold load only. Next's
// client-side navigation does not remount this component between
// routes, so no route-change suppression logic is needed beyond the
// sessionStorage gate itself. A hard timeout guarantees the overlay
// never holds up interaction, even on a slow connection or if the
// stroke animation stalls for any reason.
const SESSION_KEY = "adhikaar-loaded";
const HARD_TIMEOUT_MS = 1400;

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  } catch {
    // sessionStorage unavailable, e.g. private browsing; the loader
    // simply won't be gated across reloads, which is a fine fallback.
    return true;
  }
}

export function CourtLoader() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const dismissedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // sessionStorage only exists in the browser, so whether to show the
    // loader can only be known after mount; this is the standard
    // Next.js pattern for a client-only decision that must match the
    // SSR-rendered "nothing yet" state on first paint to avoid a
    // hydration mismatch, not a synchronization that could instead
    // live in the initializer.
    const show = shouldShow();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(show);
    setReady(true);

    if (!show) return;

    const dismiss = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      setVisible(false);
    };

    const timer = setTimeout(dismiss, HARD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "var(--paper-endpaper)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -24 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {reduceMotion ? (
            <span className="font-devanagari text-6xl" style={{ color: "var(--foil)" }}>
              अ
            </span>
          ) : (
            <SealStrike onDone={() => setVisible(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SealStrike({ onDone }: { onDone: () => void }) {
  const ringRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const circle = ringRef.current;
    if (!circle) return;
    const length = circle.getTotalLength();
    circle.style.strokeDasharray = `${length}`;
    circle.style.strokeDashoffset = `${length}`;
    circle.getBoundingClientRect();
    circle.style.transition = "stroke-dashoffset 0.7s var(--ease-strike, cubic-bezier(0.16,1,0.3,1))";
    circle.style.strokeDashoffset = "0";

    const timer = setTimeout(onDone, HARD_TIMEOUT_MS - 200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="relative flex flex-col items-center gap-6">
      <svg width={120} height={120} viewBox="0 0 120 120" className="absolute -inset-0">
        <circle
          ref={ringRef}
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--foil)"
          strokeWidth="2.5"
        />
      </svg>
      <motion.span
        className="font-devanagari"
        style={{ color: "var(--foil)", fontSize: 48, lineHeight: 1 }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        अ
      </motion.span>
      <motion.div
        className="rule-gilt"
        style={{ width: 0 }}
        animate={{ width: 160 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
