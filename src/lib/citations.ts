// The citation render gate. The rule the whole product is built around:
// a legal assertion without a citation that resolves to real corpus text
// does not render. This module is the single choke point that enforces
// it, so a UI component cannot quietly skip the check.

import { getCorpusChunk } from "@/lib/data/corpus";
import type { CorpusChunk } from "@/lib/types";

export class UnresolvedCitationError extends Error {
  constructor(citationId: string) {
    super(
      `Citation "${citationId}" does not resolve to any corpus entry. A legal claim without a resolvable citation must not render. Add the citation to RTI_ACT_CORPUS or remove the claim.`
    );
    this.name = "UnresolvedCitationError";
  }
}

/** Throws UnresolvedCitationError if the id does not resolve. Use this
 *  everywhere a citation is about to be shown, not getCorpusChunk directly. */
export function resolveCitation(citationId: string): CorpusChunk {
  const chunk = getCorpusChunk(citationId);
  if (!chunk) {
    throw new UnresolvedCitationError(citationId);
  }
  return chunk;
}

export function tryResolveCitation(citationId: string): CorpusChunk | null {
  try {
    return resolveCitation(citationId);
  } catch {
    return null;
  }
}
