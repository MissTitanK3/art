"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/primitives/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@workspace/ui/primitives/command";
import { Search } from "lucide-react";
type IndexItem = {
  slug: string;
  title: string;
  description?: string;
  version?: number | string | null;
  text: string;
};
// Locally prepared item for faster scoring
type PreparedIndexItem = {
  raw: IndexItem;
  title: string; // normalized
  desc: string; // normalized
  text: string; // normalized
  wordsTitle: string[];
  wordsDesc: string[];
};
// --- Fuzzy matching utilities (lightweight, typo tolerant) ---
function norm(s: unknown) {
  return String(s ?? "").toLowerCase();
}
function tokenize(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}
// Damerau–Levenshtein distance with adjacent transpositions
// Based on pseudocode from Wikipedia; includes early bailouts for performance
function damerauLevenshtein(a: string, b: string, maxDist = 2): number {
  const al = a.length,
    bl = b.length;
  if (a === b) return 0;
  if (al === 0) return bl;
  if (bl === 0) return al;
  if (Math.abs(al - bl) > maxDist) return maxDist + 1;
  const max = al + bl;
  const da: Record<string, number> = {};
  const d: number[][] = Array.from({ length: al + 2 }, () =>
    new Array(bl + 2).fill(0),
  );
  d[0]![0] = max;
  for (let i = 0; i <= al; i++) {
    d[i + 1]![0] = max;
    d[i + 1]![1] = i;
  }
  for (let j = 0; j <= bl; j++) {
    d[0]![j + 1] = max;
    d[1]![j + 1] = j;
  }
  for (let i = 1; i <= al; i++) {
    let db = 0;
    let rowMin = Infinity;
    for (let j = 1; j <= bl; j++) {
      const bj = b.charAt(j - 1);
      const i1 = da[bj] ?? 0;
      const j1 = db;
      const ai = a.charAt(i - 1);
      const bjc = b.charAt(j - 1);
      const cost = ai === bjc ? 0 : 1;
      if (cost === 0) db = j;
      d[i + 1]![j + 1] = Math.min(
        d[i]![j]! + cost, // substitution
        d[i + 1]![j]! + 1, // insertion
        d[i]![j + 1]! + 1, // deletion
        d[i1]![j1]! + (i - i1 - 1) + 1 + (j - j1 - 1), // transposition
      );
      const cell = d[i + 1]![j + 1]!;
      if (cell < rowMin) rowMin = cell;
    }
    da[a.charAt(i - 1)] = i;
    if (rowMin > maxDist) return maxDist + 1; // early exit
  }
  const dist = d[al + 1]![bl + 1]!;
  return dist;
}
function minWordDistance(
  haystack: string,
  needle: string,
  maxDist = 2,
  maxWords = 24,
): number {
  const words = tokenize(haystack);
  return minWordDistanceTokens(words, needle, maxDist, maxWords);
}
function minWordDistanceTokens(
  words: string[],
  needle: string,
  maxDist = 2,
  maxWords = 24,
): number {
  let best = maxDist + 1;
  for (let i = 0; i < words.length && i < maxWords; i++) {
    const d = damerauLevenshtein(words[i]!, needle, maxDist);
    if (d < best) best = d;
    if (best === 0) break;
  }
  return best;
}
function phraseProximityScore(
  s: string,
  tokens: string[],
  baseWeight: number,
): number {
  // Rough span-based proximity: find first occurrence of each token; score higher when close
  const positions = tokens
    .map((t) => s.indexOf(t))
    .filter((p) => p >= 0)
    .sort((a, b) => a - b);
  if (positions.length < 2) return 0;
  const span = positions[positions.length - 1]! - positions[0]!;
  // Smaller span -> higher score; cap influence
  const proximity = Math.max(0, baseWeight - Math.floor(span / 20));
  return proximity;
}
function scorePrepared(
  item: PreparedIndexItem,
  q: string,
  tokens: string[],
): number {
  const query = norm(q);
  if (!tokens.length) return 0;
  const title = item.title;
  const desc = item.desc;
  const text = item.text;
  let score = 0;
  // Full phrase boosts
  if (title.includes(query)) score += 28;
  if (desc.includes(query)) score += 12;
  if (text.includes(query)) score += 7;
  // Phrase proximity weighting (prefer nearby token groupings)
  const proxTitle = phraseProximityScore(title, tokens, 14);
  const proxDesc = phraseProximityScore(desc, tokens, 7);
  const proxText = phraseProximityScore(text, tokens, 4);
  score += proxTitle + proxDesc + proxText;
  // Token-based scoring with typo tolerance (levenshtein <= 1/2)
  let covered = 0;
  for (const t of tokens) {
    let tokenCovered = false;
    // Title
    if (title.includes(t)) {
      score += 14;
      tokenCovered = true;
    } else {
      const dTitle = minWordDistanceTokens(item.wordsTitle, t, 1);
      if (dTitle <= 1) {
        score += 11;
        tokenCovered = true;
      } else {
        const dTitle2 = minWordDistanceTokens(item.wordsTitle, t, 2);
        if (dTitle2 <= 2) {
          score += 7;
          tokenCovered = true;
        }
      }
    }
    // Description
    if (!tokenCovered && desc) {
      if (desc.includes(t)) {
        score += 7;
        tokenCovered = true;
      } else {
        const dDesc = minWordDistanceTokens(item.wordsDesc, t, 1);
        if (dDesc <= 1) {
          score += 5;
          tokenCovered = true;
        } else {
          const dDesc2 = minWordDistanceTokens(item.wordsDesc, t, 2);
          if (dDesc2 <= 2) {
            score += 3;
            tokenCovered = true;
          }
        }
      }
    }
    // Body text (substring only for perf)
    if (!tokenCovered) {
      if (text.includes(t)) {
        score += 3;
        tokenCovered = true;
      }
    }
    if (tokenCovered) covered += 1;
  }
  // Coverage bonus when most tokens matched
  if (covered >= Math.ceil(tokens.length * 0.8)) score += 6;
  return score;
}
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function snippetHtml(text: string, q: string, radius = 60): string {
  const tokens = Array.from(new Set(tokenize(q).filter(Boolean)));
  const lower = text.toLowerCase();
  // find position to center snippet
  let i = -1;
  for (const t of tokens) {
    const idx = lower.indexOf(t);
    if (idx !== -1) {
      i = idx;
      break;
    }
  }
  if (i === -1) i = lower.indexOf(q.toLowerCase());
  if (i === -1) {
    return escapeHtml(text.slice(0, 140)) + (text.length > 140 ? "…" : "");
  }
  const start = Math.max(0, i - radius);
  const end = Math.min(
    text.length,
    i + (tokens[0]?.length ?? q.length) + radius,
  );
  const slice = text.slice(start, end);
  if (tokens.length === 0) return escapeHtml(slice);
  // Build highlighting safely: split by regex and wrap matches
  const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts: string[] = [];
  let lastIndex = 0;
  slice.replace(re, (match, _g1, offset) => {
    parts.push(escapeHtml(slice.slice(lastIndex, offset)));
    parts.push(`<b>${escapeHtml(match)}</b>`);
    lastIndex = offset + match.length;
    return match;
  });
  parts.push(escapeHtml(slice.slice(lastIndex)));
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + parts.join("") + suffix;
}
export default function SearchCoursesModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rawItems, setRawItems] = useState<IndexItem[] | null>(null);
  const [items, setItems] = useState<PreparedIndexItem[] | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // debounce user input to reduce scoring churn
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(t);
  }, [query]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  // Preload index when idle (or on open as fallback)
  useEffect(() => {
    let aborted = false;
    const load = () => {
      if (rawItems !== null) return; // already loaded/attempted
      const ac = new AbortController();
      fetch("/api/search-index", { signal: ac.signal })
        .then((r) => r.json())
        .then((d) => {
          if (aborted) return;
          const list: IndexItem[] = d.items ?? [];
          setRawItems(list);
        })
        .catch(() => {
          if (aborted) return;
          setRawItems([]);
        });
      return () => ac.abort();
    };
    type IdleCallback = (deadline: {
      didTimeout: boolean;
      timeRemaining: () => number;
    }) => void;
    const ric = (window as any).requestIdleCallback as
      | undefined
      | ((cb: IdleCallback) => number);
    let cancel: (() => void) | undefined;
    if (ric) {
      const id = ric(() => {
        cancel = load() || undefined;
      });
      cancel = () => {
        try {
          (window as any).cancelIdleCallback?.(id);
        } catch {
          /* noop */
        }
      };
    } else {
      const id = window.setTimeout(() => {
        cancel = load() || undefined;
      }, 300);
      cancel = () => window.clearTimeout(id);
    }
    return () => {
      aborted = true;
      cancel?.();
    };
  }, [rawItems]);
  // Fallback: ensure index loads when opening if idle prefetch hasn't run
  useEffect(() => {
    if (!open || rawItems !== null) return;
    let aborted = false;
    const ac = new AbortController();
    fetch("/api/search-index", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!aborted) setRawItems(d.items ?? []);
      })
      .catch(() => {
        if (!aborted) setRawItems([]);
      });
    return () => {
      aborted = true;
      ac.abort();
    };
  }, [open, rawItems]);
  // Prepare normalized fields once after raw items load
  useEffect(() => {
    if (!rawItems) {
      setItems(rawItems as any);
      return;
    }
    const prepared: PreparedIndexItem[] = rawItems.map((it) => {
      const title = norm(it.title);
      const desc = norm(it.description);
      const text = norm(it.text);
      return {
        raw: it,
        title,
        desc,
        text,
        wordsTitle: tokenize(title),
        wordsDesc: tokenize(desc),
      };
    });
    setItems(prepared);
  }, [rawItems]);
  // Reset query when closing to keep next open fresh
  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v);
    if (!v) {
      // allow closing animation then clear
      setTimeout(() => setQuery(""), 100);
    }
  }, []);
  const results = useMemo(() => {
    if (!items || !debouncedQuery) return [] as IndexItem[];
    const tokens = tokenize(debouncedQuery);
    const scored = items
      .map((it) => ({
        it: it.raw,
        s: scorePrepared(it, debouncedQuery, tokens),
      }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30)
      .map((x) => x.it);
    return scored;
  }, [items, debouncedQuery]);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 mr-2" /> Search Course Content...
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        className="max-w-3xl"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search all courses (⌘/Ctrl+K)…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>
            {rawItems === null ? "Loading index…" : "No results."}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={r.slug}
                  onSelect={() => {
                    handleOpenChange(false);
                    router.push(`/courses/${r.slug}`);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.description}
                    </div>
                    <div
                      className="text-xs text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: snippetHtml(r.text, debouncedQuery),
                      }}
                    />
                  </div>
                  <span className="ml-auto text-xs text-blue-600">Open</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
