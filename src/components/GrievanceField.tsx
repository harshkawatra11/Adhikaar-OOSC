"use client";

import { useState } from "react";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";

export function GrievanceField() {
  const [value, setValue] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Grievance, in the citizen&rsquo;s own words <span style={{ color: "var(--seal)" }}>*</span>
        </span>
        <VoiceDictationButton onTranscript={(text) => setValue((prev) => (prev ? prev + " " + text : text))} />
      </div>
      <textarea
        name="grievance"
        required
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="For example: I want a copy of the 7/12 extract and mutation register for my father’s land in Nagpur taluka, khasra number 134/1, 2, 3."
        className="w-full border p-3 font-body text-base"
        style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
      />
    </div>
  );
}
