"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

// Browser-native dictation, not an AI feature: the Web Speech API runs
// entirely client-side, makes no network call this codebase controls,
// and needs no API key or billing surface. Consistent with the
// methodology page's own line between deterministic code and model
// involvement, this is neither; it's input hardware, same category as
// a keyboard. Renders nothing if the browser has no SpeechRecognition
// implementation, rather than showing a control that cannot work.

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

const LANGUAGES = [
  { code: "en-IN", label: "EN" },
  { code: "hi-IN", label: "HI" },
] as const;

export function VoiceDictationButton({
  onTranscript,
  className,
  defaultLang = "en-IN",
}: {
  onTranscript: (text: string) => void;
  className?: string;
  /** Starting language for the EN/HI toggle below, e.g. set to the
   *  page's own language so a citizen in the Hindi interface does not
   *  have to switch the dictation language separately. Still fully
   *  user-overridable via the toggle itself. */
  defaultLang?: (typeof LANGUAGES)[number]["code"];
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<(typeof LANGUAGES)[number]["code"]>(defaultLang);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    // Feature detection depends on `window`, unavailable during SSR;
    // this must run post-mount, matching CourtLoader's justification.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  if (!supported) return null;

  const toggle = () => {
    setError(null);

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
      }
      if (finalText.trim()) onTranscript(finalText.trim());
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : "Dictation stopped: " + event.error
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        className="border flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
        style={
          listening
            ? { borderColor: "var(--seal)", background: "var(--seal-tint)", color: "var(--seal-deep)" }
            : { borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }
        }
      >
        {listening ? <MicOff size={14} /> : <Mic size={14} />}
        {listening ? "Listening…" : "Dictate"}
      </button>
      <div className="flex border" style={{ borderColor: "var(--rule-strong)" }}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className="px-2 py-1.5 text-xs font-mono"
            style={
              lang === l.code
                ? { background: "var(--gilt)", color: "var(--paper)" }
                : { color: "var(--ink-faint)" }
            }
          >
            {l.label}
          </button>
        ))}
      </div>
      {error && (
        <span className="text-xs" style={{ color: "var(--brick)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
