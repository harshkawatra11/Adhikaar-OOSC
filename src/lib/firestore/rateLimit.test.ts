import { describe, it, expect, beforeEach, vi } from "vitest";

describe("assertWriteAllowed", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows writes under the per-window limit", async () => {
    const { assertWriteAllowed } = await import("@/lib/firestore/rateLimit");
    for (let i = 0; i < 30; i++) {
      expect(() => assertWriteAllowed()).not.toThrow();
    }
  });

  it("throws once the per-window limit is exceeded", async () => {
    const { assertWriteAllowed, RateLimitExceededError } = await import("@/lib/firestore/rateLimit");
    for (let i = 0; i < 30; i++) assertWriteAllowed();
    expect(() => assertWriteAllowed()).toThrow(RateLimitExceededError);
  });

  it("resets the count in a fresh window", async () => {
    vi.useFakeTimers();
    const { assertWriteAllowed } = await import("@/lib/firestore/rateLimit");
    for (let i = 0; i < 30; i++) assertWriteAllowed();
    vi.advanceTimersByTime(61_000);
    expect(() => assertWriteAllowed()).not.toThrow();
    vi.useRealTimers();
  });
});
