import { RTI_ACT_CORPUS } from "@/lib/data/rti-act";
import { RIGHTS_CORPUS } from "@/lib/data/rights-corpus";
import type { CorpusChunk } from "@/lib/types";

// The single merged corpus every citation in the app resolves against.
// src/lib/citations.ts imports getCorpusChunk from here, not from
// rti-act.ts directly, so a citation id from either corpus renders
// through the same render gate. rti-act.ts still exports its own
// getCorpusChunk too, unchanged, so nothing that already imports it
// directly breaks.

export const ALL_CORPUS: CorpusChunk[] = [...RTI_ACT_CORPUS, ...RIGHTS_CORPUS];

export function getCorpusChunk(id: string): CorpusChunk | undefined {
  return ALL_CORPUS.find((c) => c.id === id);
}
