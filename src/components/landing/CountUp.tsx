"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// The evidence numeral is the strongest fact in the product; this is
// its one moment. SSR always renders the final value in plain text, so
// the number is present and correct in the markup with JavaScript
// disabled. GSAP only replaces the display text at runtime, counting
// up from zero once the element scrolls into view, and is skipped
// entirely under prefers-reduced-motion.

export function CountUp({
  to,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
  className,
  style,
}: {
  to: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const proxy = { value: 0 };
      const tween = gsap.to(proxy, {
        value: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = format(proxy.value);
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [to, format]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(to)}
    </span>
  );
}
