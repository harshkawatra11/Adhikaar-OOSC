"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateAllSchemes, type SchemeResult } from "@/lib/schemes/evaluate";
import { getScheme, type CitizenProfile, type OccupationCategory, type RationCardType } from "@/lib/data/schemes";
import type { Lang } from "@/lib/i18n/dictionary";

const OCCUPATIONS: { value: OccupationCategory; labelEn: string }[] = [
  { value: "farmer", labelEn: "Farmer / cultivates land" },
  { value: "government_employee", labelEn: "Government employee or pensioner" },
  { value: "professional", labelEn: "Doctor, engineer, lawyer, CA, or architect" },
  { value: "daily_wage_or_domestic_worker", labelEn: "Daily-wage or domestic worker" },
  { value: "artisan_or_craftsperson", labelEn: "Artisan or craftsperson (carpenter, potter, tailor, etc.)" },
  { value: "unemployed", labelEn: "Not currently working" },
  { value: "other", labelEn: "Other" },
];

const RATION_CARDS: { value: RationCardType; labelEn: string }[] = [
  { value: "BPL", labelEn: "BPL (Below Poverty Line)" },
  { value: "AAY", labelEn: "AAY (Antyodaya Anna Yojana)" },
  { value: "APL", labelEn: "APL (Above Poverty Line)" },
  { value: "none", labelEn: "No ration card" },
  { value: "unknown", labelEn: "Not sure" },
];

const VERDICT_LABEL: Record<SchemeResult["verdict"], string> = {
  eligible: "Eligible",
  not_eligible: "Not eligible",
  more_information_needed: "Need more information",
};

const VERDICT_COLOR: Record<SchemeResult["verdict"], string> = {
  eligible: "var(--forest)",
  not_eligible: "var(--brick)",
  more_information_needed: "var(--gilt)",
};

// TODO: full Hindi translation of this component's own strings
// (labels, buttons) is still pending; `lang` is threaded through now
// so the page-level wiring is correct and callers do not need to
// change again once that pass lands. Interim state under time
// pressure: accepted and currently unused past voice dictation.
export function EligibilityWizard({ lang = "en" }: { lang?: Lang }) {
  const router = useRouter();
  const [profile, setProfile] = useState<CitizenProfile>({});
  const [results, setResults] = useState<SchemeResult[] | null>(null);

  function update<K extends keyof CitizenProfile>(key: K, value: CitizenProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function handleCheck() {
    setResults(evaluateAllSchemes(profile));
  }

  function handleAskWhy(schemeId: string) {
    const scheme = getScheme(schemeId);
    const question = scheme
      ? `Please provide a certified copy of the eligibility criteria applied and the reasons recorded for my status under ${scheme.nameEn}.`
      : "Please provide a certified copy of the eligibility criteria applied to my case.";
    router.push(`/start?problem=${encodeURIComponent(question)}`);
  }

  return (
    <div className="space-y-8" data-lang={lang}>
      <div className="border p-5 space-y-5" style={{ borderColor: "var(--rule-strong)" }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Your age</span>
            <input
              type="number"
              min={0}
              max={120}
              value={profile.age ?? ""}
              onChange={(e) => update("age", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Gender</span>
            <select
              value={profile.gender ?? ""}
              onChange={(e) => update("gender", (e.target.value || undefined) as CitizenProfile["gender"])}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>State</span>
            <input
              value={profile.state ?? ""}
              onChange={(e) => update("state", e.target.value || undefined)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
              Annual household income (Rs.)
            </span>
            <input
              type="number"
              min={0}
              value={profile.annualHouseholdIncome ?? ""}
              onChange={(e) => update("annualHouseholdIncome", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Land holding (acres, 0 if none)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={profile.landHoldingAcres ?? ""}
              onChange={(e) => update("landHoldingAcres", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Ration card</span>
            <select
              value={profile.rationCardType ?? ""}
              onChange={(e) => update("rationCardType", (e.target.value || undefined) as CitizenProfile["rationCardType"])}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="">Select</option>
              {RATION_CARDS.map((r) => <option key={r.value} value={r.value}>{r.labelEn}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Occupation</span>
            <select
              value={profile.occupationCategory ?? ""}
              onChange={(e) => update("occupationCategory", (e.target.value || undefined) as CitizenProfile["occupationCategory"])}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            >
              <option value="">Select</option>
              {OCCUPATIONS.map((o) => <option key={o.value} value={o.value}>{o.labelEn}</option>)}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(profile.ownsPuccaHouse)}
              onChange={(e) => update("ownsPuccaHouse", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>I already own a pucca (permanent) house</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(profile.isGovernmentEmployeeOrPensioner)}
              onChange={(e) => update("isGovernmentEmployeeOrPensioner", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>I am a government employee or pensioner</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(profile.paysIncomeTax)}
              onChange={(e) => update("paysIncomeTax", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>I paid income tax last assessment year</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(profile.hasDaughterUnder10)}
              onChange={(e) => update("hasDaughterUnder10", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>I have a daughter under 10 years old</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          className="border-2 px-6 py-3 font-body font-semibold"
          style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
        >
          Check eligibility
        </button>
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Leave anything blank you are not sure of; we will say &ldquo;need more information&rdquo; rather
          than guess.
        </p>
      </div>

      {results && (
        <div className="space-y-4">
          {results.map((result) => {
            const scheme = getScheme(result.schemeId);
            if (!scheme) return null;
            return (
              <div key={result.schemeId} className="border p-5" style={{ borderColor: "var(--rule-strong)" }}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium" style={{ color: "var(--ink)" }}>{scheme.nameEn}</p>
                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>{scheme.ministry}</p>
                  </div>
                  <span
                    className="font-mono text-xs uppercase px-2 py-1 border shrink-0"
                    style={{ color: VERDICT_COLOR[result.verdict], borderColor: VERDICT_COLOR[result.verdict] }}
                  >
                    {VERDICT_LABEL[result.verdict]}
                  </span>
                </div>

                {scheme.confidence !== "verified" && (
                  <p className="text-xs mb-2" style={{ color: "var(--brick)" }}>
                    {scheme.confidence === "conflicting_sources" ? "Sources disagree on some figures for this scheme." : "This scheme's figures are unverified against a primary source this session."}
                  </p>
                )}

                <ul className="space-y-1 text-sm mb-3">
                  {result.criteria.map((c) => (
                    <li key={c.id} style={{ color: c.outcome === "not_met" ? "var(--brick)" : c.outcome === "unknown" ? "var(--gilt)" : "var(--forest)" }}>
                      {c.outcome === "met" ? "✓" : c.outcome === "not_met" ? "✕" : "?"} {c.labelEn}
                      {c.outcome !== "met" && (
                        <span className="block text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{c.ruleTextEn}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {result.verdict === "eligible" && (
                  <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>{scheme.benefitEn}</p>
                )}

                {result.verdict !== "eligible" && (
                  <button
                    type="button"
                    onClick={() => handleAskWhy(result.schemeId)}
                    className="text-sm underline"
                    style={{ color: "var(--seal-deep)" }}
                  >
                    Ask them why, in writing
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
