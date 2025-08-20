// components/LanguagePicker.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";

// --- Types ---
export type NormalizedLanguage = {
  tag: string;         // canonical BCP-47 tag (e.g., 'es', 'pt-BR', 'yue')
  display_name: string;
  proficiency?: "native" | "fluent" | "conversational" | "basic" | "nonverbal";
};

// --- Normalization Map (aliases & common variants) ---
// Keep this small and tailored to your regions; expand over time.
const ALIASES: Record<string, NormalizedLanguage> = {
  // Core
  "english": { tag: "en", display_name: "English" },
  "spanish": { tag: "es", display_name: "Spanish" },
  "español": { tag: "es", display_name: "Spanish" },
  "portuguese": { tag: "pt", display_name: "Portuguese" },
  "português": { tag: "pt", display_name: "Portuguese" },
  "brazilian portuguese": { tag: "pt-BR", display_name: "Portuguese (Brazil)" },
  "european portuguese": { tag: "pt-PT", display_name: "Portuguese (Portugal)" },

  "french": { tag: "fr", display_name: "French" },
  "german": { tag: "de", display_name: "German" },
  "russian": { tag: "ru", display_name: "Russian" },
  "ukrainian": { tag: "uk", display_name: "Ukrainian" },
  "polish": { tag: "pl", display_name: "Polish" },
  "italian": { tag: "it", display_name: "Italian" },
  "romanian": { tag: "ro", display_name: "Romanian" },
  "greek": { tag: "el", display_name: "Greek" },

  // Arabic & variants
  "arabic": { tag: "ar", display_name: "Arabic" },
  "levantine arabic": { tag: "ar-x-levantine", display_name: "Arabic (Levantine)" },
  "egyptian arabic": { tag: "ar-EG", display_name: "Arabic (Egypt)" },

  // Chinese & Sinosphere
  "chinese": { tag: "zh", display_name: "Chinese" },
  "mandarin": { tag: "cmn", display_name: "Chinese (Mandarin)" },
  "cantonese": { tag: "yue", display_name: "Cantonese" },
  "zh-hans": { tag: "zh-Hans", display_name: "Chinese (Simplified)" },
  "zh-hant": { tag: "zh-Hant", display_name: "Chinese (Traditional)" },

  // South & Central Asia
  "hindi": { tag: "hi", display_name: "Hindi" },
  "urdu": { tag: "ur", display_name: "Urdu" },
  "bengali": { tag: "bn", display_name: "Bengali" },
  "punjabi": { tag: "pa", display_name: "Punjabi" },
  "punjabi (gurmukhi)": { tag: "pa-Guru", display_name: "Punjabi (Gurmukhi)" },
  "punjabi (shahmukhi)": { tag: "pa-Arab", display_name: "Punjabi (Shahmukhi)" },
  "farsi": { tag: "fa-IR", display_name: "Persian (Iran)" },
  "persian": { tag: "fa-IR", display_name: "Persian (Iran)" },
  "dari": { tag: "fa-AF", display_name: "Dari (Afghanistan)" },
  "pashto": { tag: "ps", display_name: "Pashto" },
  "kurdish": { tag: "ku", display_name: "Kurdish" },
  "kurdish (sorani)": { tag: "ckb", display_name: "Kurdish (Sorani)" },
  "kurdish (kurmanji)": { tag: "kmr", display_name: "Kurdish (Kurmanji)" },

  // SE/E Asia
  "tagalog": { tag: "fil", display_name: "Filipino/Tagalog" },
  "filipino": { tag: "fil", display_name: "Filipino/Tagalog" },
  "vietnamese": { tag: "vi", display_name: "Vietnamese" },
  "thai": { tag: "th", display_name: "Thai" },
  "burmese": { tag: "my", display_name: "Burmese" },
  "myanmar": { tag: "my", display_name: "Burmese" },
  "khmer": { tag: "km", display_name: "Khmer" },
  "japanese": { tag: "ja", display_name: "Japanese" },
  "korean": { tag: "ko", display_name: "Korean" },
  "hmong": { tag: "hmn", display_name: "Hmong" },

  // Africa
  "swahili": { tag: "sw", display_name: "Swahili" },
  "somali": { tag: "so", display_name: "Somali" },
  "amharic": { tag: "am", display_name: "Amharic" },
  "tigrinya": { tag: "ti", display_name: "Tigrinya" },
  "hausa": { tag: "ha", display_name: "Hausa" },
  "yoruba": { tag: "yo", display_name: "Yoruba" },
  "igbo": { tag: "ig", display_name: "Igbo" },

  // Americas
  "haitian creole": { tag: "ht", display_name: "Haitian Creole" },
  "quechua": { tag: "qu", display_name: "Quechua" },
  "navajo": { tag: "nv", display_name: "Navajo" },

  // Middle East & others
  "turkish": { tag: "tr", display_name: "Turkish" },
  "hebrew": { tag: "he", display_name: "Hebrew" },
  "yiddish": { tag: "yi", display_name: "Yiddish" },
};

const SAFE_TWO_LETTER: Record<string, NormalizedLanguage> = {
  en: { tag: "en", display_name: "English" },
  es: { tag: "es", display_name: "Spanish" },
  fr: { tag: "fr", display_name: "French" },
  de: { tag: "de", display_name: "German" },
  pt: { tag: "pt", display_name: "Portuguese" },
  it: { tag: "it", display_name: "Italian" },
  ru: { tag: "ru", display_name: "Russian" },
  ar: { tag: "ar", display_name: "Arabic" },
  zh: { tag: "zh", display_name: "Chinese" },
  hi: { tag: "hi", display_name: "Hindi" },
  ur: { tag: "ur", display_name: "Urdu" },
  fa: { tag: "fa-IR", display_name: "Persian (Iran)" },
};

function canonicalKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[._]/g, " ")
    .replace(/\(.*?\)/g, "")
    .trim();
}

function normalizeLanguage(inputRaw: string): NormalizedLanguage | null {
  const key = canonicalKey(inputRaw);
  if (!key) return null;

  // Direct hits
  if (ALIASES[key]) return ALIASES[key];

  // Heuristics for common hints users type
  if (/^portuguese.*brazil/.test(key)) return { tag: "pt-BR", display_name: "Portuguese (Brazil)" };
  if (/^portuguese.*portugal/.test(key)) return { tag: "pt-PT", display_name: "Portuguese (Portugal)" };
  if (/^arabic.*egypt/.test(key)) return { tag: "ar-EG", display_name: "Arabic (Egypt)" };
  if (/^chinese.*simplified/.test(key)) return { tag: "zh-Hans", display_name: "Chinese (Simplified)" };
  if (/^chinese.*traditional/.test(key)) return { tag: "zh-Hant", display_name: "Chinese (Traditional)" };

  // Cautious 2-letter fallbacks
  const guess2 = key.slice(0, 2);
  if (SAFE_TWO_LETTER[guess2]) return SAFE_TWO_LETTER[guess2];

  return null;
}

function tokenize(input: string): string[] {
  return input
    .split(/[;,/|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- Suggestions shown in dropdown (subset of aliases) ---
const SUGGESTIONS: NormalizedLanguage[] = [
  { tag: "en", display_name: "English" },
  { tag: "es", display_name: "Spanish" },
  { tag: "pt-BR", display_name: "Portuguese (Brazil)" },
  { tag: "pt-PT", display_name: "Portuguese (Portugal)" },
  { tag: "fr", display_name: "French" },
  { tag: "de", display_name: "German" },
  { tag: "ru", display_name: "Russian" },
  { tag: "uk", display_name: "Ukrainian" },
  { tag: "ar", display_name: "Arabic" },
  { tag: "ar-x-levantine", display_name: "Arabic (Levantine)" },
  { tag: "cmn", display_name: "Chinese (Mandarin)" },
  { tag: "yue", display_name: "Cantonese" },
  { tag: "zh-Hans", display_name: "Chinese (Simplified)" },
  { tag: "zh-Hant", display_name: "Chinese (Traditional)" },
  { tag: "vi", display_name: "Vietnamese" },
  { tag: "fil", display_name: "Filipino/Tagalog" },
  { tag: "ja", display_name: "Japanese" },
  { tag: "ko", display_name: "Korean" },
  { tag: "so", display_name: "Somali" },
  { tag: "am", display_name: "Amharic" },
  { tag: "ti", display_name: "Tigrinya" },
  { tag: "fa-IR", display_name: "Persian (Iran)" },
  { tag: "fa-AF", display_name: "Dari (Afghanistan)" },
  { tag: "ps", display_name: "Pashto" },
  { tag: "ckb", display_name: "Kurdish (Sorani)" },
  { tag: "kmr", display_name: "Kurdish (Kurmanji)" },
];

// --- Component ---
type Props = {
  value?: NormalizedLanguage[];
  onChange?: (langs: NormalizedLanguage[]) => void;
  placeholder?: string;
  allowFreeText?: boolean; // if false, force selection from suggestions/aliases only
  showProficiency?: boolean; // toggles small per-chip select
  disabled?: boolean;
  className?: string;
};

export default function LanguagePicker({
  value = [],
  onChange,
  placeholder = "Add languages (e.g., Spanish, Cantonese)",
  allowFreeText = true,
  showProficiency = false,
  disabled = false,
  className = "",
}: Props) {
  const [items, setItems] = React.useState<NormalizedLanguage[]>(value);
  const [query, setQuery] = React.useState("");
  const [openList, setOpenList] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setItems(value), [value]);

  function emit(next: NormalizedLanguage[]) {
    setItems(next);
    onChange?.(next);
  }

  function addOne(n: NormalizedLanguage) {
    if (items.some((x) => x.tag === n.tag)) return;
    emit([...items, n]);
    setQuery("");
    setOpenList(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    emit(items.filter((x) => x.tag !== tag));
  }

  function setProf(tag: string, prof: NormalizedLanguage["proficiency"]) {
    emit(items.map((it) => (it.tag === tag ? { ...it, proficiency: prof } : it)));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      const tokens = tokenize(query);
      let added = false;
      tokens.forEach((tok) => {
        const n = normalizeLanguage(tok);
        if (n) {
          addOne(n);
          added = true;
        } else if (allowFreeText) {
          // store as-is with a private-use tag (BCP-47 'x-' extension)
          addOne({ tag: `x-${canonicalKey(tok)}`, display_name: tok.trim() });
          added = true;
        }
      });
      if (added) e.preventDefault();
    } else if (e.key === "Backspace" && !query && items && items.length > 0) {
      // quick remove last chip
      removeTag(items[items.length - 1]!.tag);
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTIONS.filter((s) => !items.some((x) => x.tag === s.tag));
    const inAliases = Object.values(ALIASES).filter(
      (a, idx, arr) =>
        arr.findIndex((z) => z.tag === a.tag) === idx && // unique by tag
        (a.display_name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q))
    );
    const base = [...SUGGESTIONS, ...inAliases];
    // unique by tag & not already chosen
    const uniq = new Map<string, NormalizedLanguage>();
    base.forEach((b) => {
      if (!items.some((x) => x.tag === b.tag) && !uniq.has(b.tag)) uniq.set(b.tag, b);
    });
    return Array.from(uniq.values()).slice(0, 20);
  }, [query, items]);

  return (
    <div
      className={`w-full ${className}`}
      onFocusCapture={() => setOpenList(true)}
      onBlurCapture={(e: React.FocusEvent<HTMLDivElement>) => {
        // Close only if focus left the entire component
        const next = e.relatedTarget as Node | null;
        if (!next || !e.currentTarget.contains(next)) {
          setOpenList(false);
        }
      }}
    >
      <div
        className={`flex min-h-11 w-full flex-wrap items-center gap-2 rounded-2xl border border-muted-foreground/20 bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40 ${disabled ? "opacity-60" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Chips */}
        {items.map((lang) => (
          <div key={lang.tag} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
            <span className="font-medium">{lang.display_name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(lang.tag)}
                className="rounded-full p-1 hover:bg-muted-foreground/10"
                aria-label={`Remove ${lang.display_name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenList(true);
          }}
          onKeyDown={handleKeyDown}
          // onFocus not required; wrapper handles opening
          placeholder={items.length === 0 ? placeholder : ""}
          aria-label="Add language"
        />
      </div>

      {/* Dropdown */}
      {openList && filtered.length > 0 && (
        <div className="relative">
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-muted-foreground/20 bg-popover p-1 shadow-lg">
            {filtered.map((opt) => (
              <button
                key={opt.tag}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                onClick={() => addOne(opt)}             // addOne closes list explicitly
              >
                <div className="flex items-center justify-between">
                  <span>{opt.display_name}</span>
                  <span className="text-xs text-muted-foreground">{opt.tag}</span>
                </div>
              </button>
            ))}

            {/* Optional "use as typed" */}
            {allowFreeText && query.trim() && normalizeLanguage(query) === null && (
              <button
                type="button"
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  addOne({ tag: `x-${canonicalKey(query)}`, display_name: query.trim() })
                }
              >
                Use “{query.trim()}” as entered
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

}
