import type { CaseRecord } from "@/lib/types";

/** Every backing store, file or Firestore, implements exactly this. */
export interface CaseStore {
  listCases(): Promise<CaseRecord[]>;
  getCase(id: string): Promise<CaseRecord | undefined>;
  createCase(partial: Omit<CaseRecord, "id" | "createdAt" | "updatedAt">): Promise<CaseRecord>;
  updateCase(
    id: string,
    patch: Partial<Omit<CaseRecord, "id" | "createdAt">>
  ): Promise<CaseRecord | undefined>;
  deleteCase(id: string): Promise<boolean>;
}
