"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Label } from "@workspace/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import type {
  NeedUrgency,
  NeedVisibility,
} from "@workspace/store/types/meet-a-need";
import { AccessRoles, roleLabel } from "@workspace/store/types/roles.ts";
import {
  NEED_CATEGORIES,
  humanizeNeedCategory,
} from "@workspace/ui/lib/constants/meet-a-need";

export type SubmitNeedFormData = {
  category: string;
  description: string;
  urgency: NeedUrgency;
  visibility: NeedVisibility;
  locationLabel?: string;
  contact?: string;
  files: File[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubmitNeedFormData) => Promise<void> | void;
};

export default function SubmitNeedDrawer({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const [pending, setPending] = React.useState(false);
  const [category, setCategory] = React.useState("other");
  const [description, setDescription] = React.useState("");
  const [urgency, setUrgency] = React.useState<NeedUrgency>("normal");
  const [visibility, setVisibility] =
    React.useState<NeedVisibility>("role:team_member");
  const [locationLabel, setLocationLabel] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);

  const reset = () => {
    setCategory("other");
    setDescription("");
    setUrgency("normal");
    setVisibility("region");
    setLocationLabel("");
    setContact("");
    setFiles([]);
    setPreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setPending(true);
    try {
      await onSubmit({
        category,
        description,
        urgency,
        visibility,
        locationLabel,
        contact,
        files,
      });
      reset();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(f);
    setPreviews(f.map((file) => URL.createObjectURL(file)));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
        <DrawerHeader>
          <DrawerTitle>Submit a Need</DrawerTitle>
          <DrawerDescription>
            Describe what’s needed and optionally include photos.
          </DrawerDescription>
        </DrawerHeader>

        <div className="mt-2 overflow-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto">
                    {NEED_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {humanizeNeedCategory(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Urgency</Label>
                <Select
                  value={urgency}
                  onValueChange={(v) => setUrgency(v as NeedUrgency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Minimum Role to View</Label>
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as NeedVisibility)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto">
                    {AccessRoles.map((r) => (
                      <SelectItem key={r} value={`role:${r}`}>
                        {roleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe the need in plain language"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location (optional)</Label>
              <Input
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="online, or area label"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contact preference (optional)</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Signal handle, phone, etc."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Photos (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={onFileChange}
              />
              {previews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={pending || !description.trim()}>
                Post Need
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
