import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "@/lib/i18n/dictionary";

// Re-export the client-safe half so existing `from "@/lib/i18n"`
// imports keep working; only getLang() below actually needs the
// server-only next/headers import, which is why it lives in this file
// and not dictionary.ts (see that file's header for why the split
// exists at all: a client component importing next/headers even
// transitively fails the build).
export { t, LANG_COOKIE, type Lang, type TranslationKey } from "@/lib/i18n/dictionary";

/** Server-side only (reads the cookie via next/headers). Client
 *  components receive the resolved Lang as a prop from a Server
 *  Component ancestor instead of calling this directly. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === "hi" ? "hi" : "en";
}
