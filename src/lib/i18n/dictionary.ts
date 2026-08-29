// Client-safe half of the i18n module: no next/headers import here,
// since client components (Interview, RightsAsk, EligibilityWizard)
// need t() directly and next/headers throws if it reaches a client
// bundle at all, even through a re-export. getLang() (server-only,
// reads the cookie) lives in index.ts instead and imports from here.

import { en } from "@/lib/i18n/en";
import { hi } from "@/lib/i18n/hi";
import type { TranslationKey } from "@/lib/i18n/en";

export type { TranslationKey };
export type Lang = "en" | "hi";

export const LANG_COOKIE = "adhikaar_lang";

const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { en, hi };

export function t(lang: Lang, key: TranslationKey): string {
  return DICTIONARIES[lang][key];
}
