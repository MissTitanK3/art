"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Switch } from "@workspace/ui/primitives/switch";
import {
  Check,
  Paperclip,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import type { DispatchUpdate } from "@workspace/store/types/dispatch";
import { useProfileStore } from "@workspace/store/useProfileStore";

type DispatchUpdatesProps = {
  updates?: DispatchUpdate[];
  onAddUpdate: (update: Omit<DispatchUpdate, "id" | "createdAt">) => void;
  onEditUpdate: (updateId: string, text: string) => void;
  onRemoveUpdate: (updateId: string) => void;
  afterComposer?: ReactNode;
};

export default function DispatchUpdates({
  updates,
  onAddUpdate,
  onEditUpdate,
  onRemoveUpdate,
  afterComposer,
}: DispatchUpdatesProps) {
  const displayName = useProfileStore((s) => s.profile?.display_name);
  const resolvedAuthor =
    displayName && displayName.trim().length > 0 ? displayName : "Dispatcher";
  const [text, setText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const finalText = isUrgent ? `🚨 URGENT: ${text}` : text;
    onAddUpdate({ author: resolvedAuthor, text: finalText });
    setText("");
    setIsUrgent(false);
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const attachments = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    onAddUpdate({ author: resolvedAuthor, text: "", attachments });
    e.target.value = "";
  };

  const handleEditSave = (id: string) => {
    onEditUpdate(id, editText);
    setEditingId(null);
    setEditText("");
  };

  const sortedUpdates = [...(updates ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Add update..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`flex-1 text-sm resize-y min-h-[80px] ${isUrgent ? "border-red-500 ring-red-500/20" : ""}`}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Switch
              id="urgent-mode"
              checked={isUrgent}
              onCheckedChange={setIsUrgent}
            />
            <label
              htmlFor="urgent-mode"
              className={`text-xs font-medium ${isUrgent ? "text-red-600 font-bold" : "text-muted-foreground"}`}
            >
              Urgent
            </label>
          </div>
          <div className="flex gap-2">
            <label htmlFor="dispatch-attach" className="sr-only">
              Attach files
            </label>
            <input
              id="dispatch-attach"
              type="file"
              multiple
              className="hidden"
              onChange={handleAttach}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                document.getElementById("dispatch-attach")?.click()
              }
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Attach
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isUrgent ? "destructive" : "default"}
            >
              Post
            </Button>
          </div>
        </div>
      </form>

      {afterComposer ? <div>{afterComposer}</div> : null}

      <div className="flex-1 overflow-y-auto space-y-3 text-sm">
        {sortedUpdates.map((u) => {
          const isUrgentUpdate = u.text.startsWith("🚨 URGENT:");
          return (
            <div
              key={u.id}
              className={`border rounded-md p-2 ${isUrgentUpdate ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}
            >
              <div className="text-xs text-muted-foreground flex justify-between">
                <div className="flex gap-4 flex-col">
                  <span
                    className={
                      isUrgentUpdate
                        ? "font-bold text-red-700 dark:text-red-400"
                        : ""
                    }
                  >
                    {u.author}
                  </span>
                  <span>{new Date(u.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveUpdate(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(u.id);
                      setEditText(u.text);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editingId === u.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm resize-y min-h-[60px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleEditSave(u.id)}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`mt-1 whitespace-pre-wrap ${isUrgentUpdate ? "font-medium text-red-900 dark:text-red-200" : ""}`}
                >
                  {isUrgentUpdate ? (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{u.text.replace("🚨 URGENT: ", "")}</span>
                    </div>
                  ) : (
                    u.text
                  )}
                </div>
              )}
              {u.attachments?.length ? (
                <div className="mt-2 flex flex-col gap-2">
                  {u.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-2 flex-col w-full"
                    >
                      {a.type.startsWith("image/") ? (
                        <img
                          src={a.url}
                          alt={a.name}
                          className="max-h-80 rounded border"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          📎 {a.name} ({Math.round(a.size / 1024)} KB)
                        </div>
                      )}
                      <a
                        href={a.url}
                        download={a.name}
                        className="text-xs text-blue-600 underline"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
