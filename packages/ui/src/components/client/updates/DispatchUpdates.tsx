"use client";

import { useState } from "react";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Check, Paperclip, Pencil, Trash2, X } from "lucide-react";

export default function DispatchUpdates({ dispatchId }: { dispatchId: string }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const dispatch = useDispatchStore((s) =>
    s.submissions.find((d) => d.id === dispatchId)
  );
  const addUpdate = useDispatchStore((s) => s.addUpdate);
  const editUpdate = useDispatchStore((s) => s.editUpdate);
  const removeUpdate = useDispatchStore((s) => s.removeUpdate);

  if (!dispatch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addUpdate(dispatchId, { author: "Dispatcher A", text });
    setText("");
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const attachments = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f), // session-only blob
    }));

    // Create a "blank text" update with only attachments
    addUpdate(dispatchId, { author: "Dispatcher A", text: "", attachments });

    // Reset input so you can re-upload the same file if needed
    e.target.value = "";
  };

  const handleEditSave = (id: string) => {
    editUpdate(dispatchId, id, editText);
    setEditingId(null);
    setEditText("");
  };


  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Add update..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-sm resize-y min-h-[80px]"
        />
        <div className="flex justify-end gap-2">
          <label>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleAttach}
            />
            <Button type="button" size="sm" variant="outline" asChild>
              <span>
                <Paperclip className="h-4 w-4 mr-1" />
                Attach
              </span>
            </Button>
          </label>
          <Button type="submit" size="sm">
            Post
          </Button>
        </div>
      </form>



      {/* Updates Log */}
      <div className="flex-1 overflow-y-auto space-y-3 text-sm">
        {(dispatch.updates ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((u) => (
          <div key={u.id} className="border rounded-md p-2">
            <div className="text-xs text-muted-foreground flex justify-between">
              <div className="flex gap-4 flex-col">
                <span>{u.author}</span>
                <span>{new Date(u.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeUpdate(dispatchId, u.id)}
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
                  <Button
                    size="sm"
                    onClick={() => handleEditSave(u.id)}
                  >
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1 whitespace-pre-wrap">{u.text}</div>
            )}
            {u.attachments?.length ? (
              <div className="mt-2 flex flex-col gap-2">
                {u.attachments.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 flex-col w-full">
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
        ))}
      </div>
    </div>
  );
}
