"use client";

import React from "react";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type TeleprompterScriptBuilderProps = {
  builtinScripts: Record<string, string>;
  builtinMeta: Array<{ id: string; label: string }>;
  storageNamespace?: string; // prefix for localStorage keys
};

type BuilderLine = {
  id: string;
  text: string;
  cues: string[];
};

const DEFAULT_CUES = ["[pause]", "[look up]", "[breathe]", "[slow]", "[smile]"];
const PLACEHOLDERS = [
  "[ORG]",
  "[NAMES]",
  "[LEAD_NAME]",
  "[LOCATION]",
  "[CHANNEL]",
  "[BACKUP_CHANNEL]",
  "[DISPATCH_CONTACT]",
  "[RENDEZVOUS_POINT]",
  "[SYNC_MINUTE]",
  "[MISSION]",
  "[MEDIA_LEAD]",
  "[PARTNERS]",
  "[BOUNDARIES]",
  "[STATUS]",
  "[OPEN_TASKS]",
  "[RISKS]",
  "[KEY_CONTACTS]",
  "[NEXT_ACTIONS]",
  "[INCOMING_LEAD]",
  "[OUTGOING_LEAD]",
  "[ACTION_ITEMS]",
  "[SHARE_CHANNEL]",
  "[WEATHER]",
  "[SHELTER_LOCATIONS]",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function wordCount(s: string) {
  return (s.trim().match(/\S+/g) || []).length;
}

function charCount(s: string) {
  return s.length;
}

function estimateSeconds(words: number, wpm = 140) {
  return Math.max(2, Math.round((words / wpm) * 60));
}

const LENGTH_HINT = {
  idealMaxChars: 180,
  warnChars: 220,
  idealMaxWords: 30,
  warnWords: 40,
};

function LengthMeter({ text }: { text: string }) {
  const wc = wordCount(text);
  const cc = charCount(text);
  const est = estimateSeconds(wc);
  const severity =
    cc > LENGTH_HINT.warnChars || wc > LENGTH_HINT.warnWords
      ? "danger"
      : cc > LENGTH_HINT.idealMaxChars || wc > LENGTH_HINT.idealMaxWords
        ? "warn"
        : "ok";
  const barPct = Math.min(100, Math.round((cc / LENGTH_HINT.warnChars) * 100));
  const barColor =
    severity === "danger"
      ? "bg-red-500"
      : severity === "warn"
        ? "bg-amber-500"
        : "bg-emerald-500";
  const textColor =
    severity === "danger"
      ? "text-red-600"
      : severity === "warn"
        ? "text-amber-600"
        : "text-emerald-600";
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded bg-muted">
        <div
          className={`h-2 rounded ${barColor}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <div className={`mt-1 text-xs ${textColor}`}>
        Words: {wc} · Chars: {cc} · Est: {est}s —{" "}
        {severity === "ok"
          ? "Good length"
          : severity === "warn"
            ? "Consider splitting"
            : "Too long—split this line"}
      </div>
    </div>
  );
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeleprompterScriptBuilder({
  builtinScripts,
  builtinMeta,
  storageNamespace = "teleprompter.builder",
}: TeleprompterScriptBuilderProps) {
  const ns = (k: string) => `${storageNamespace}.${k}`;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const emptyLines = React.useMemo<BuilderLine[]>(() => [], []);
  const emptySaved = React.useMemo(
    () => [] as { id: string; name: string; lines: BuilderLine[] }[],
    [],
  );
  const [name, setName] = useLocalStorage<string>(ns("name"), "My Script", {
    sync: true,
  });
  const [lines, setLines] = useLocalStorage<BuilderLine[]>(
    ns("lines"),
    emptyLines,
    {
      sync: true,
      debounceMs: 200,
    },
  );
  const [currentText, setCurrentText] = React.useState("");
  const [currentCues, setCurrentCues] = React.useState<string[]>([]);
  const [customCue, setCustomCue] = React.useState("");
  const [saved, setSaved] = useLocalStorage<
    { id: string; name: string; lines: BuilderLine[] }[]
  >(
    ns("saved"),
    emptySaved,
    {
      sync: true,
    },
  );
  const [placeholderMap, setPlaceholderMap] = React.useState<
    Record<string, string>
  >({});
  const [coreId, setCoreId] = React.useState<string>("");
  const [coreLabel, setCoreLabel] = React.useState<string>("");
  const [presetId, setPresetId] = React.useState<string>("");

  const handleKeyReorder = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && (e.altKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (idx > 0) moveLine(idx, idx - 1);
    }
    if (e.key === "ArrowDown" && (e.altKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (idx < lines.length - 1) moveLine(idx, idx + 1);
    }
  };

  const addLine = () => {
    if (!currentText.trim()) return;
    setLines((prev) => [
      ...prev,
      { id: uid(), text: currentText.trim(), cues: currentCues },
    ]);
    setCurrentText("");
    setCurrentCues([]);
  };

  const toggleCue = (cue: string) => {
    setCurrentCues((prev) =>
      prev.includes(cue) ? prev.filter((c) => c !== cue) : [...prev, cue],
    );
  };

  const addCustomCue = () => {
    const c = customCue.trim();
    if (!c) return;
    const normalized = c.startsWith("[") ? c : `[${c}]`;
    setCurrentCues((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized],
    );
    setCustomCue("");
  };

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.id !== id));
  const moveLine = (from: number, to: number) => {
    setLines((prev) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= prev.length ||
        to > prev.length
      )
        return prev;
      const next = [...prev];
      const removed = next.splice(from, 1);
      const it = removed[0];
      if (!it) return prev;
      next.splice(to, 0, it);
      return next;
    });
  };

  const onDragStart = (index: number, e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [dragOverPos, setDragOverPos] = React.useState<
    "above" | "below" | null
  >(null);
  const [liveMessage, setLiveMessage] = React.useState<string>("");
  const onDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isFinite(from) && from !== index) {
      moveLineAtPosition(from, index, dragOverPos || "below");
    }
    setDragOverIndex(null);
    setDragOverPos(null);
  };
  const onDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverPos(e.clientY < midY ? "above" : "below");
  };

  const compiledLines = lines.map((l) =>
    l.cues.length ? `${l.text} ${l.cues.join(" ")}` : l.text,
  );

  const moveLineAtPosition = (
    from: number,
    index: number,
    pos: "above" | "below",
  ) => {
    const destPre = pos === "above" ? index : index + 1;
    const dest = from < index ? destPre - 1 : destPre;
    moveLine(from, Math.max(0, Math.min(lines.length - 1, dest)));
    const finalPos = Math.max(0, Math.min(lines.length - 1, dest)) + 1;
    setLiveMessage(`Moved to position ${finalPos} of ${lines.length}.`);
  };

  const jsonExport = JSON.stringify({ name, lines: compiledLines }, null, 2);
  const tsExport = `// Add this to TELEPROMPTER_SCRIPTS and TELEPROMPTER_SCRIPT_META\n// id suggestion: '${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}'\n[\n${compiledLines
      .map((l) => `  ${JSON.stringify(l)}`)
      .join(",\n")}\n].join("\\n\\n")`;

  const suggestedId = React.useMemo(
    () =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, ""),
    [name],
  );
  const coreScriptsSnippet = React.useMemo(() => {
    const id = coreId || suggestedId || "custom_script";
    const label = coreLabel || name || "Custom Script";
    const body = `  ${id}: [\n${compiledLines.map((l) => `    ${JSON.stringify(l)},`).join("\n")}\n  ].join('\\n\\n'),`;
    const meta = `  { id: '${id}', label: '${label}' },`;
    return `// 1) Add to TELEPROMPTER_SCRIPTS\n${body}\n\n// 2) Add to TELEPROMPTER_SCRIPT_META\n${meta}`;
  }, [compiledLines, coreId, coreLabel, name, suggestedId]);

  const placeholdersInUse = React.useMemo(() => {
    const text = compiledLines.join("\n\n");
    const m = text.match(/\[([A-Z_]+)\]/g) || [];
    const uniq = Array.from(
      new Set(m.map((x) => x.replace(/\[/g, "").replace(/\]/g, ""))),
    );
    return uniq;
  }, [compiledLines]);

  const filledPreview = React.useMemo(() => {
    const all = compiledLines.join("\n\n");
    const replaced = Object.entries(placeholderMap).reduce(
      (acc, [k, v]) => acc.replaceAll(`[${k}]`, v || `[${k}]`),
      all,
    );
    return replaced;
  }, [compiledLines, placeholderMap]);

  const saveLocally = () => {
    const id = uid();
    const entry = { id, name, lines };
    setSaved((prev) => [entry, ...prev]);
  };
  const loadSaved = (id: string) => {
    const found = saved.find((s) => s.id === id);
    if (!found) return;
    setName(found.name);
    setLines(found.lines);
  };
  const deleteSaved = (id: string) =>
    setSaved((prev) => prev.filter((s) => s.id !== id));

  const insertPlaceholder = (ph: string) => {
    setCurrentText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}${ph}`);
  };

  const QUICK_TEMPLATES = React.useMemo(() => {
    // try to pick three useful defaults from builtinMeta
    const candidates = ["media_protocol_60", "arrival_brief", "team_intros"];
    const picks = candidates
      .map((id) => ({ id, meta: builtinMeta.find((m) => m.id === id) }))
      .filter((x) => !!x.meta)
      .slice(0, 3) as Array<{
        id: string;
        meta: { id: string; label: string };
      }>;
    return picks.map((p) => ({
      id: p.meta.id,
      title: p.meta.label,
      blurb: "Quick-start template",
    }));
  }, [builtinMeta]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-medium">Builder</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Write one teleprompter line at a time. Keep each line focused. Use
          cues to guide delivery. If the meter turns amber/red, split the line.
        </p>
        <div className="mt-3 grid gap-3 rounded-md border p-3">
          <div className="text-sm font-medium">Quick templates</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  const t = builtinScripts[tpl.id] || "";
                  const chunks = t
                    .split(/\n\s*\n/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const asLines: BuilderLine[] = chunks.map((chunk) => {
                    const cues = Array.from(chunk.matchAll(/\[(.*?)\]/g))
                      .map((m) => m[0])
                      .filter(Boolean);
                    const text = chunk.replace(/\s*\[(.*?)\]/g, "").trim();
                    return { id: uid(), text, cues };
                  });
                  setLines(asLines);
                  setName(
                    builtinMeta.find((m) => m.id === tpl.id)?.label ||
                    tpl.title,
                  );
                }}
                className="flex flex-col items-start rounded-md border bg-background p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">{tpl.title}</div>
                <div className="text-xs text-muted-foreground">{tpl.blurb}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 rounded-md border p-3">
          <div className="text-sm font-medium">Start from a preset</div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={presetId} onValueChange={setPresetId}>
              <SelectTrigger className="min-w-56">
                <SelectValue placeholder="Choose a preset…" />
              </SelectTrigger>
              <SelectContent>
                {builtinMeta.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => {
                if (!presetId) return;
                const t = builtinScripts[presetId] || "";
                const chunks = t
                  .split(/\n\s*\n/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                const asLines: BuilderLine[] = chunks.map((chunk) => {
                  const cues = Array.from(chunk.matchAll(/\[(.*?)\]/g))
                    .map((m) => m[0])
                    .filter(Boolean);
                  const text = chunk.replace(/\s*\[(.*?)\]/g, "").trim();
                  return { id: uid(), text, cues };
                });
                setLines(asLines);
                if (!name || name === "My Script")
                  setName(
                    builtinMeta.find((m) => m.id === presetId)?.label ||
                    "Preset",
                  );
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Load preset
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium" htmlFor="script-name">
            Script name
          </label>
          <input
            id="script-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Arrival briefing for [LOCATION]"
            className="w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />

          <label className="mt-4 text-sm font-medium" htmlFor="line-text">
            Line text
          </label>
          <textarea
            id="line-text"
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            rows={3}
            placeholder="Who we are: We are with [ORG]. Today’s team: [NAMES]. Lead: [LEAD_NAME]."
            className="w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <LengthMeter text={currentText} />

          <div className="mt-3">
            <div className="text-sm font-medium">Quick placeholders</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLACEHOLDERS.map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(ph)}
                  className="rounded-full border px-3 py-2 text-sm sm:px-3 sm:py-1 sm:text-xs hover:bg-accent"
                >
                  {ph}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium">Cues</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_CUES.map((cue) => {
                const active = currentCues.includes(cue);
                return (
                  <button
                    key={cue}
                    type="button"
                    onClick={() => toggleCue(cue)}
                    className={`rounded-full border px-3 py-2 text-sm sm:px-3 sm:py-1 sm:text-xs ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  >
                    {cue}
                  </button>
                );
              })}
              <div className="flex items-center gap-2">
                <input
                  value={customCue}
                  onChange={(e) => setCustomCue(e.target.value)}
                  placeholder="custom cue"
                  aria-label="Custom cue"
                  className="w-full sm:w-36 rounded-md border bg-background px-3 py-2 text-base sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={addCustomCue}
                  className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                >
                  Add cue
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={addLine}
              className="rounded-md bg-primary px-3 py-2 text-base sm:text-sm text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Add line
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentText("");
                setCurrentCues([]);
              }}
              className="rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-medium">Lines</h2>
        <p className="mt-1 text-xs text-muted-foreground md:hidden">
          Tip: On phones, use the arrow buttons to reorder; drag-and-drop may
          not be available on touch.
        </p>
        {!mounted ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No lines yet. Add your first line above.
          </p>
        ) : (
          <ol className="mt-3 space-y-3">
            {lines.map((l, idx) => (
              <li
                key={l.id}
                draggable
                onDragStart={(e) => onDragStart(idx, e)}
                onDrop={(e) => onDrop(idx, e)}
                onDragOver={(e) => onDragOver(idx, e)}
                className={`relative group flex flex-wrap items-start gap-3 rounded-md border bg-background p-3 ${dragOverIndex === idx ? "ring-2 ring-primary/50" : ""}`}
                aria-label={`Line ${idx + 1}`}
              >
                {dragOverIndex === idx && (
                  <div
                    className={`pointer-events-none absolute left-2 right-2 h-0.5 ${dragOverPos === "above" ? "top-0" : "bottom-0"} bg-primary`}
                    aria-hidden="true"
                  />
                )}
                <div className="mt-1 select-none text-xs text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{l.text}</div>
                  {l.cues.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {l.cues.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border px-2 py-1 text-xs sm:py-0.5 sm:text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-evenly sm:justify-start">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => onDragStart(idx, e)}
                    className="cursor-grab rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent hidden md:inline-flex"
                    title="Drag to reorder (Alt/Ctrl+Arrow keys also work)"
                    aria-label="Drag handle"
                    onKeyDown={(e) => handleKeyReorder(idx, e)}
                  >
                    ☰
                  </button>
                  <button
                    type="button"
                    onClick={() => idx > 0 && moveLine(idx, idx - 1)}
                    aria-label="Move up"
                    className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      idx < lines.length - 1 && moveLine(idx, idx + 1)
                    }
                    aria-label="Move down"
                    className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (idx !== 0) {
                        moveLine(idx, 0);
                        setLiveMessage(
                          `Moved to position 1 of ${lines.length}.`,
                        );
                      }
                    }}
                    aria-label="Move to top"
                    className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                  >
                    ⤒
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (idx !== lines.length - 1) {
                        moveLine(idx, lines.length - 1);
                        setLiveMessage(
                          `Moved to position ${lines.length} of ${lines.length}.`,
                        );
                      }
                    }}
                    aria-label="Move to bottom"
                    className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                  >
                    ⤓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLine(l.id)}
                    aria-label="Delete"
                    className="rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-medium">Preview</h2>
        {mounted && (
          <div className="sr-only" aria-live="polite">
            {liveMessage}
          </div>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          This is how your teleprompter script will render (each line separated
          by an empty line).
        </p>
        <pre className="mt-3 w-full max-h-60 md:max-h-80 overflow-auto rounded-md border bg-background p-3 text-sm whitespace-pre-wrap break-words">
          {mounted ? compiledLines.join("\n\n") : ""}
        </pre>
        {placeholdersInUse.length > 0 && (
          <div className="mt-4 grid gap-2 rounded-md border p-3">
            <div className="text-sm font-medium">
              Inline placeholder preview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {placeholdersInUse.map((k) => (
                <div key={k} className="grid gap-1 min-w-0">
                  <label className="text-xs text-muted-foreground">[{k}]</label>
                  <textarea
                    rows={2}
                    value={placeholderMap[k] || ""}
                    onChange={(e) =>
                      setPlaceholderMap((m) => ({ ...m, [k]: e.target.value }))
                    }
                    className="w-full min-w-0 max-w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm resize-y break-words"
                    placeholder={`Value for [${k}]`}
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="mt-2 text-xs text-muted-foreground">
                Filled preview
              </div>
              <pre className="mt-1 w-full max-h-60 overflow-auto rounded-md border bg-background p-3 text-sm whitespace-pre-wrap break-words">
                {filledPreview}
              </pre>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-medium">Export & Save</h2>
        <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard)
                navigator.clipboard.writeText(jsonExport);
            }}
            className="w-full sm:w-auto rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent"
          >
            Copy JSON
          </button>
          <button
            type="button"
            onClick={() =>
              download(`${name.replace(/\s+/g, "_")}.json`, jsonExport)
            }
            className="w-full sm:w-auto rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard)
                navigator.clipboard.writeText(tsExport);
            }}
            className="w-full sm:w-auto rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent"
          >
            Copy TS snippet
          </button>
          <button
            type="button"
            onClick={saveLocally}
            className="w-full sm:w-auto rounded-md bg-primary px-3 py-2 text-base sm:text-sm text-primary-foreground hover:opacity-90"
          >
            Save locally
          </button>
        </div>
        <div className="mt-4 grid gap-3 rounded-md border p-3 overflow-hidden">
          <div className="text-sm font-medium">Import from JSON</div>
          <div className="text-xs text-muted-foreground max-w-prose break-words">
            Accepts the JSON exported above (
            <code className="mx-1 break-words">
              {"{"} name, lines: string[] {"}"}
            </code>
            ), or a saved format with cues.
          </div>
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                const importedName: string | undefined = data?.name;
                const importedLines: any[] | undefined = data?.lines;
                if (!Array.isArray(importedLines))
                  throw new Error("Invalid JSON: lines must be an array");
                const toLines: BuilderLine[] = importedLines.map(
                  (item: any) => {
                    if (typeof item === "string") {
                      const cues = Array.from(item.matchAll(/\[(.*?)\]/g))
                        .map((m: any) => m[0])
                        .filter(Boolean);
                      const textOnly = item.replace(/\s*\[(.*?)\]/g, "").trim();
                      return { id: uid(), text: textOnly, cues };
                    }
                    if (item && typeof item.text === "string") {
                      const t = item.text as string;
                      const cues = Array.isArray(item.cues)
                        ? (item.cues as string[])
                        : Array.from(t.matchAll(/\[(.*?)\]/g))
                          .map((m: any) => m[0])
                          .filter(Boolean);
                      return {
                        id: uid(),
                        text: t.replace(/\s*\[(.*?)\]/g, "").trim(),
                        cues,
                      };
                    }
                    throw new Error("Invalid line item");
                  },
                );
                if (importedName) setName(importedName);
                setLines(toLines);
              } catch (err) {
                console.error(err);
                alert("Failed to import JSON.");
              }
            }}
            className="w-full sm:max-w-sm"
          />
          <div className="grid gap-2 w-full">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="import-json"
            >
              Paste JSON
            </label>
            <textarea
              id="import-json"
              rows={6}
              placeholder='{"name":"My Script","lines":["Line 1 [pause]","Line 2"]}'
              className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (!value) return;
                try {
                  const data = JSON.parse(value);
                  const importedName: string | undefined = data?.name;
                  const importedLines: any[] | undefined = data?.lines;
                  if (!Array.isArray(importedLines))
                    throw new Error("Invalid JSON: lines must be an array");
                  const toLines: BuilderLine[] = importedLines.map(
                    (item: any) => {
                      if (typeof item === "string") {
                        const cues = Array.from(item.matchAll(/\[(.*?)\]/g))
                          .map((m: any) => m[0])
                          .filter(Boolean);
                        const textOnly = item
                          .replace(/\s*\[(.*?)\]/g, "")
                          .trim();
                        return { id: uid(), text: textOnly, cues };
                      }
                      if (item && typeof item.text === "string") {
                        const t = item.text as string;
                        const cues = Array.isArray(item.cues)
                          ? (item.cues as string[])
                          : Array.from(t.matchAll(/\[(.*?)\]/g))
                            .map((m: any) => m[0])
                            .filter(Boolean);
                        return {
                          id: uid(),
                          text: t.replace(/\s*\[(.*?)\]/g, "").trim(),
                          cues,
                        };
                      }
                      throw new Error("Invalid line item");
                    },
                  );
                  if (importedName) setName(importedName);
                  setLines(toLines);
                } catch (err) {
                  alert("Invalid JSON.");
                }
              }}
            />
            <div className="text-xs text-muted-foreground break-words">
              Tip: paste JSON and click elsewhere to load it.
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 rounded-md border p-3">
          <div className="text-sm font-medium">Add to core scripts</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="grid gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="core-script-id"
              >
                Script ID
              </label>
              <input
                id="core-script-id"
                value={coreId}
                onChange={(e) => setCoreId(e.target.value)}
                placeholder={suggestedId}
                className="w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm"
              />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="core-script-label"
              >
                Label
              </label>
              <input
                id="core-script-label"
                value={coreLabel}
                onChange={(e) => setCoreLabel(e.target.value)}
                placeholder={name}
                className="w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm"
              />
            </div>
          </div>
          <pre className="mt-2 w-full max-h-60 overflow-auto rounded-md border bg-background p-3 text-sm sm:text-xs whitespace-pre-wrap break-words">
            {coreScriptsSnippet}
          </pre>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard)
                  navigator.clipboard.writeText(coreScriptsSnippet);
              }}
              className="w-full sm:w-auto rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent"
            >
              Copy core entries
            </button>
            <button
              type="button"
              onClick={() =>
                download(
                  `${coreId || suggestedId || "custom_script"}.core.ts.txt`,
                  coreScriptsSnippet,
                )
              }
              className="w-full sm:w-auto rounded-md border px-3 py-2 text-base sm:text-sm hover:bg-accent"
            >
              Download entries
            </button>
          </div>
        </div>
        {saved.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium">Saved scripts</div>
            <ul className="mt-2 space-y-2">
              {saved.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border bg-background p-2 text-sm"
                >
                  <div className="truncate">{s.name}</div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => loadSaved(s.id)}
                      className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        download(
                          `${s.name.replace(/\s+/g, "_")}.json`,
                          JSON.stringify(
                            {
                              name: s.name,
                              lines: s.lines.map((l) =>
                                l.cues.length
                                  ? `${l.text} ${l.cues.join(" ")}`
                                  : l.text,
                              ),
                            },
                            null,
                            2,
                          ),
                        )
                      }
                      className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs hover:bg-accent"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSaved(s.id)}
                      className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-medium">Tips</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Lead with “Who we are”: “We are with [ORG] and our names are
            [NAMES].”
          </li>
          <li>
            One idea per line. Use cues like [pause], [look up], [breathe] to
            pace.
          </li>
          <li>
            Keep sensitive info out of on-air comms; use placeholders like
            [LOCATION] or route via dispatch.
          </li>
          <li>
            Prefer verbs: observe, document, escalate. Avoid debating in the
            field.
          </li>
          <li>
            Use the meter. If it goes amber/red, split the line for smoother
            delivery.
          </li>
        </ul>
      </section>
    </div>
  );
}
