// A deliberately simple backstop, not the primary cost control. The
// primary controls are the Firestore free-tier ceiling itself (generous
// enough that ordinary demo traffic never approaches it) and the GCP
// billing budget alert, both described in client.ts. This module exists
// for one narrower purpose: if a bug, a retry storm, or a scripted
// abuse attempt starts calling a write action in a tight loop, stop it
// in-process before it burns through meaningful quota, rather than
// relying only on a human noticing a billing email.
//
// It is a fixed-window counter held in memory, so it resets on cold
// start and is per server instance, not global. That is an accepted
// limitation for a hackathon prototype: it stops a runaway loop on the
// instance handling it, which is the failure mode this guards against.
// A production deployment serving real traffic would move this to a
// shared counter (Firestore itself, or Vercel KV) instead.

const WRITE_LIMIT = 30;
const WINDOW_MS = 60_000;

let windowStart = Date.now();
let writesInWindow = 0;

export class RateLimitExceededError extends Error {
  constructor() {
    super(
      "Too many write operations in a short period. This is a safety limit to keep the demo project's Firestore usage inside its free tier, not a sign anything is wrong with your case. Wait a minute and try again."
    );
    this.name = "RateLimitExceededError";
  }
}

export function assertWriteAllowed(): void {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    writesInWindow = 0;
  }
  writesInWindow += 1;
  if (writesInWindow > WRITE_LIMIT) {
    throw new RateLimitExceededError();
  }
}
