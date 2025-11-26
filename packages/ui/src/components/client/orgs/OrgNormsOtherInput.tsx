"use client";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

type OrgNormsOtherInputProps = {
  id?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export function OrgNormsOtherInput({
  id = "org-norm-other",
  value,
  onChange,
  placeholder = "Describe your custom norm",
}: OrgNormsOtherInputProps) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>Other</Label>
      <Input
        id={id}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
