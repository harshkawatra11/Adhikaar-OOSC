import type { CaseRecord } from "@/lib/types";

/** Every backing store, file or Firestore, implements exactly this.
 *  Ownership is enforced inside the store rather than by the caller,
 *  because there are many callers and one of them will forget. A
 *  mismatched owner returns undefined/false, never throws: a wrong
 *  owner should be indistinguishable from a case that does not exist. */
export interface CaseStore {
  listCases(ownerUid: string): Promise<CaseRecord[]>;
  getCase(id: string, ownerUid: string): Promise<CaseRecord | undefined>;
  createCase(
    partial: Omit<CaseRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<CaseRecord>;
  updateCase(
    id: string,
    ownerUid: string,
    patch: Partial<Omit<CaseRecord, "id" | "createdAt" | "ownerUid">>
  ): Promise<CaseRecord | undefined>;
  deleteCase(id: string, ownerUid: string): Promise<boolean>;
  /** Cron only. Returns every case with an open deadline across all
   *  owners. No route reachable by a browser may call this. */
  listAllOpenCases(): Promise<CaseRecord[]>;
}
