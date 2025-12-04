"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@workspace/ui/primitives/select";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Input } from "@workspace/ui/primitives/input";
import { Switch } from "@workspace/ui/primitives/switch";

export type BuiltinScript = { id: string; label: string; content: string };

export type TeleprompterImportContentProps = {
  onApplyText: (text: string) => void;
  cacheEnabled: boolean;
  onCacheEnabledChange: (v: boolean) => void;
  onSaveNow: () => void;
  // Optional sections
  builtinScripts?: BuiltinScript[];
  onApplyBuiltin?: (id: string, text: string) => void;
  onFetchDispatch?: (
    dispatchId: string
  ) => Promise<{ text?: string; title?: string }>;
  onFetchAcademy?: (slug: string) => Promise<{ text?: string; title?: string }>;
  // Optional: namespace used by the script builder for localStorage
  storageNamespace?: string;
};

export default function TeleprompterImportContent({
  onApplyText,
  cacheEnabled,
  onCacheEnabledChange,
  onSaveNow,
  builtinScripts,
  onApplyBuiltin,
  // onFetchDispatch,
  // onFetchAcademy,
  storageNamespace = "teleprompter.builder",
}: TeleprompterImportContentProps) {
  const [builtinId, setBuiltinId] = React.useState<string>(
    builtinScripts?.[0]?.id ?? ""
  );
  const [builtinDraft, setBuiltinDraft] = React.useState<string>(
    builtinScripts?.[0]?.content ?? ""
  );
  const [builtinQuery, setBuiltinQuery] = React.useState<string>("");
  const [pasteText, setPasteText] = React.useState<string>("");
  // const [dispatchId, setDispatchId] = React.useState<string>("");
  // const [academySlug, setAcademySlug] = React.useState<string>("");
  const [importStatus, setImportStatus] = React.useState<string>("");

  // --- User-created scripts from the Script Builder (localStorage) ---
  type BuilderLine = { id?: string; text: string; cues?: string[] };
  const ns = React.useCallback(
    (k: string) => `${storageNamespace}.${k}`,
    [storageNamespace]
  );
  const [userScripts, setUserScripts] = React.useState<BuiltinScript[]>([]);
  const [userId, setUserId] = React.useState<string>("");
  const [userDraft, setUserDraft] = React.useState<string>("");
  const [userQuery, setUserQuery] = React.useState<string>("");

  const compileLines = React.useCallback((lines: any[]): string[] => {
    try {
      return (lines || [])
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (item && typeof item.text === "string") {
            const cues = Array.isArray(item.cues)
              ? (item.cues as string[])
              : [];
            return `${item.text}${cues.length ? " " + cues.join(" ") : ""}`.trim();
          }
          return "";
        })
        .filter((s: string) => typeof s === "string" && s.trim().length > 0);
    } catch {
      return [];
    }
  }, []);

  const loadUserScripts = React.useCallback(() => {
    const collected: BuiltinScript[] = [];
    try {
      const draftNameRaw = window.localStorage.getItem(ns("name")) || "";
      const draftLinesRaw = window.localStorage.getItem(ns("lines")) || "";
      const draftName = draftNameRaw ? draftNameRaw.replace(/^"|"$/g, "") : "";
      let draftContent = "";
      if (draftLinesRaw) {
        try {
          const parsed = JSON.parse(draftLinesRaw);
          if (Array.isArray(parsed)) {
            const compiled = compileLines(parsed);
            draftContent = compiled.join("\n\n");
          }
        } catch {
          /* ignore */
        }
      }
      if (draftContent.trim().length > 0) {
        collected.push({
          id: "__draft__",
          label: `Draft: ${draftName || "Untitled"}`.trim(),
          content: draftContent,
        });
      }
    } catch {
      /* ignore */
    }

    try {
      const savedRaw = window.localStorage.getItem(ns("saved")) || "[]";
      const savedParsed = JSON.parse(savedRaw);
      if (Array.isArray(savedParsed)) {
        savedParsed.forEach((entry: any, idx: number) => {
          const name: string =
            typeof entry?.name === "string" ? entry.name : `Saved ${idx + 1}`;
          const lines: BuilderLine[] = Array.isArray(entry?.lines)
            ? (entry.lines as BuilderLine[])
            : [];
          const compiled = compileLines(lines);
          const content = compiled.join("\n\n");
          if (content.trim().length > 0) {
            const id =
              typeof entry?.id === "string" && entry.id
                ? entry.id
                : `saved_${idx}`;
            collected.push({ id, label: name, content });
          }
        });
      }
    } catch {
      /* ignore */
    }

    setUserScripts(collected);
    // sync selection to available list
    const first = collected[0];
    const nextId =
      userId && collected.some((s) => s.id === userId)
        ? userId
        : first?.id || "";
    setUserId(nextId);
    const selected = collected.find((s) => s.id === nextId) || first;
    setUserDraft(selected?.content || "");
  }, [compileLines, ns, userId]);

  React.useEffect(() => {
    try {
      loadUserScripts();
    } catch {
      void 0;
    }
  }, [loadUserScripts]);

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key) return;
      const watched = [ns("name"), ns("lines"), ns("saved")];
      if (watched.includes(e.key)) loadUserScripts();
    };
    try {
      window.addEventListener("storage", handler);
    } catch {
      void 0;
    }
    const onFocus = () => {
      try {
        loadUserScripts();
      } catch {
        void 0;
      }
    };
    const onVis = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    try {
      window.addEventListener("focus", onFocus);
    } catch {
      void 0;
    }
    try {
      document.addEventListener("visibilitychange", onVis);
    } catch {
      void 0;
    }
    return () => {
      try {
        window.removeEventListener("storage", handler);
      } catch {
        void 0;
      }
      try {
        window.removeEventListener("focus", onFocus);
      } catch {
        void 0;
      }
      try {
        document.removeEventListener("visibilitychange", onVis);
      } catch {
        void 0;
      }
    };
  }, [loadUserScripts, ns]);

  return (
    <div className="grid gap-3 p-4 max-h-[70vh] overflow-y-auto">
      {Array.isArray(userScripts) && userScripts.length > 0 && (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-sm font-medium">My scripts</p>
          <div className="grid gap-2">
            <Select
              value={userId}
              onOpenChange={(open) => {
                if (open) setUserQuery("");
              }}
              onValueChange={(v) => {
                setUserId(v);
                const sel =
                  userScripts.find((s) => s.id === v) ?? userScripts[0];
                if (sel) setUserDraft(sel.content);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose one of your scripts" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-1">
                  <Input
                    placeholder="Search my scripts…"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                </div>
                {userScripts
                  .filter((s) => {
                    const q = userQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      s.label.toLowerCase().includes(q) ||
                      s.id.toLowerCase().includes(q)
                    );
                  })
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadUserScripts()}
              >
                Refresh
              </Button>
            </div>
            <Textarea
              className="h-40"
              value={userDraft}
              onChange={(e) => setUserDraft(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  onApplyText(userDraft);
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const sel =
                    userScripts.find((s) => s.id === userId) ?? userScripts[0];
                  if (sel) setUserDraft(sel.content);
                }}
              >
                Reset
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Loaded from your browser&#39;s script builder saves.
            </div>
          </div>
        </div>
      )}

      {Array.isArray(builtinScripts) && builtinScripts.length > 0 && (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-sm font-medium">Built‑in scripts</p>
          <div className="grid gap-2">
            <Select
              value={builtinId}
              onOpenChange={(open) => {
                if (open) setBuiltinQuery("");
              }}
              onValueChange={(v) => {
                setBuiltinId(v);
                const sel = builtinScripts.find((s) => s.id === v);
                if (sel) setBuiltinDraft(sel.content);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a script" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-1">
                  <Input
                    placeholder="Search scripts…"
                    value={builtinQuery}
                    onChange={(e) => setBuiltinQuery(e.target.value)}
                  />
                </div>
                <SelectSeparator />
                {builtinScripts
                  .filter((s) => {
                    const q = builtinQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      s.label.toLowerCase().includes(q) ||
                      s.id.toLowerCase().includes(q)
                    );
                  })
                  .sort((a, b) =>
                    String(a.label ?? "").localeCompare(String(b.label ?? ""))
                  )
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Textarea
              className="h-40"
              value={builtinDraft}
              onChange={(e) => setBuiltinDraft(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (onApplyBuiltin && builtinId)
                    onApplyBuiltin(builtinId, builtinDraft);
                  else onApplyText(builtinDraft);
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const sel =
                    builtinScripts.find((s) => s.id === builtinId) ??
                    builtinScripts[0];
                  if (sel) setBuiltinDraft(sel.content);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border p-3">
        <p className="mb-2 text-sm font-medium">Upload builder .json</p>
        <Input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const raw = await file.text();
              const data = JSON.parse(raw);
              const name: string | undefined = data?.name;
              const lines: any[] | undefined = data?.lines;
              if (!Array.isArray(lines))
                throw new Error("Invalid JSON: lines must be an array");
              const compiled: string[] = lines.map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item.text === "string") {
                  const cues = Array.isArray(item.cues)
                    ? (item.cues as string[])
                    : [];
                  return `${item.text}${cues.length ? " " + cues.join(" ") : ""}`.trim();
                }
                throw new Error("Invalid line item");
              });
              const joined = compiled.join("\n\n");
              onApplyText(joined);
              if (name)
                try {
                  document.title = `${name} – Teleprompter`;
                } catch {
                  void 0;
                }
            } catch (err: any) {
              setImportStatus(err?.message || "Failed to import builder JSON.");
            }
          }}
        />
      </div>

      <div className="rounded-md border p-3">
        <p className="mb-2 text-sm font-medium">Upload .txt / .md</p>
        <Input
          type="file"
          accept=".txt,.md,.markdown,.mdown"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const content = await file.text();
            onApplyText(content);
          }}
        />
      </div>

      <div className="rounded-md border p-3">
        <p className="mb-2 text-sm font-medium">Paste text</p>
        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          className="h-40"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button
            onClick={() => {
              onApplyText(pasteText);
            }}
          >
            Load
          </Button>
          <Button variant="outline" onClick={() => setPasteText("")}>
            Clear
          </Button>
        </div>
      </div>

      {/* {onFetchDispatch && (
        <div className="grid gap-3 rounded-md border p-3">
          <p className="text-sm font-medium">Open from Dispatch</p>
          <div className="flex items-center gap-2">
            <Input placeholder="Enter dispatch ID" value={dispatchId} onChange={(e) => setDispatchId(e.target.value)} />
            <Button variant="light" onClick={async () => {
              try {
                setImportStatus("Fetching dispatch…");
                const res = await onFetchDispatch(dispatchId);
                const candidate = res?.text;
                if (candidate && typeof candidate === 'string') {
                  onApplyText(candidate);
                  setImportStatus("Loaded dispatch briefing.");
                } else {
                  setImportStatus("No suitable text fields found on this dispatch.");
                }
              } catch (err: any) {
                setImportStatus(err?.message || "Failed to fetch from Dispatch.");
              }
            }}>Fetch</Button>
          </div>
          {importStatus ? <div className="text-xs text-muted-foreground">{importStatus}</div> : null}
        </div>
      )} */}

      {/* {onFetchAcademy && (
        <div className="grid gap-3 rounded-md border p-3">
          <p className="text-sm font-medium">Open from Academy</p>
          <div className="flex items-center gap-2">
            <Input placeholder="Enter lesson slug (e.g., crisis-debrief-care)" value={academySlug} onChange={(e) => setAcademySlug(e.target.value)} />
            <Button variant="light" onClick={async () => {
              try {
                setImportStatus("Fetching lesson…");
                const res = await onFetchAcademy(academySlug);
                const candidate = res?.text;
                if (candidate && typeof candidate === 'string') {
                  onApplyText(candidate);
                  setImportStatus("Loaded lesson.");
                } else {
                  setImportStatus("No suitable fields found on this lesson.");
                }
              } catch (err: any) {
                setImportStatus(err?.message || "Failed to fetch from Academy.");
              }
            }}>Fetch</Button>
          </div>
          {importStatus ? <div className="text-xs text-muted-foreground">{importStatus}</div> : null}
        </div>
      )} */}

      <div className="flex items-center justify-between rounded-md border p-3 text-sm">
        <div className="flex items-center gap-2">
          <Switch
            id="cache"
            checked={cacheEnabled}
            onCheckedChange={(v) => onCacheEnabledChange(!!v)}
          />
          <label htmlFor="cache">Cache this script for offline use</label>
        </div>
        <Button variant="light" onClick={onSaveNow}>
          Save Now
        </Button>
      </div>
    </div>
  );
}
