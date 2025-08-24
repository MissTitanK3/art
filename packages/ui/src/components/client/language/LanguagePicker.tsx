// components/LanguagePicker.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { type NormalizedLanguage } from "@workspace/store/types/language.ts";
import { canonicalKey, normalizeLanguage, tokenize } from '@workspace/store/utils/languages'
import { ALIASES, SUGGESTIONS } from "@workspace/ui/lib/constants/language";
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
