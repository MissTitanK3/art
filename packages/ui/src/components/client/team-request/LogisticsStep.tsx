"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  LogisticsItem,
  DispatchAttachment,
} from "@workspace/store/types/dispatch.ts";

interface LogisticsStepProps {
  initial?: {
    logistics?: LogisticsItem[];
    attachments?: DispatchAttachment[];
  };
  onBack: () => void;
  onNext: (data: LogisticsStepProps["initial"]) => void;
}

export function LogisticsStep({ initial, onBack, onNext }: LogisticsStepProps) {
  const [logistics, setLogistics] = useState<LogisticsItem[]>(
    initial?.logistics ?? [],
  );
  const [attachments, setAttachments] = useState<DispatchAttachment[]>(
    initial?.attachments ?? [],
  );

  // Temporary new item fields
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LogisticsItem["category"]>("other");

  const addLogistics = () => {
    if (!description.trim()) return;
    const newItem: LogisticsItem = {
      id: crypto.randomUUID(),
      category,
      description,
      priority: "medium",
      status: "pending",
      updatedAt: new Date().toISOString(),
    };
    setLogistics((prev) => [...prev, newItem]);
    setDescription("");
  };

  const removeLogistics = (id: string) => {
    setLogistics((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: DispatchAttachment[] = Array.from(files).map(
      (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // temporary blob
      }),
    );
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Logistics & Attachments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logistics Section */}
        <div>
          <Label className="font-semibold">Logistics Needs</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe a need (transport, supplies, comms...)"
            />
            <Button onClick={addLogistics}>Add</Button>
          </div>

          <div className="mt-4 space-y-2">
            {logistics.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <span>{item.description}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeLogistics(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <Label className="font-semibold">Attachments</Label>
          <Input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="mt-2"
          />

          <div className="mt-4 grid gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-blue-600 underline text-sm"
                  >
                    Download
                  </a>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeAttachment(file.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onNext({ logistics, attachments })}>Next</Button>
      </CardFooter>
    </Card>
  );
}
