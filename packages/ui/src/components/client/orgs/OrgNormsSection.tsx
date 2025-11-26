"use client";

import type {
  OrgNormPresetOption,
  OrgNorms,
  OrgNormsCategory,
  OrgNormsMultiCategory,
  OrgNormsSingleCategory,
} from "./types";
import { OrgNormsOtherInput } from "./OrgNormsOtherInput";
import { OrgNormsPresetSelector, formatNormLabel } from "./OrgNormsPresetSelector";

type OrgNormsSectionProps = {
  category: keyof OrgNorms;
  title?: string;
  description?: string;
  value?: OrgNormsCategory | null;
  options: readonly OrgNormPresetOption[];
  onChange?: (category: keyof OrgNorms, value: OrgNormsCategory | null) => void;
  disabled?: boolean;
  allowMultiple?: boolean;
};

export function OrgNormsSection({
  category,
  title,
  description,
  value,
  options,
  onChange,
  disabled,
  allowMultiple,
}: OrgNormsSectionProps) {
  const handlePresetChange = (nextType: string | string[]) => {
    if (allowMultiple) {
      const nextTypes = Array.isArray(nextType) ? nextType : [nextType];
      const includesOther = nextTypes.includes("other");
      const nextValue: OrgNormsMultiCategory = {
        type: nextTypes,
        other: includesOther ? value?.other ?? "" : null,
      };
      return onChange?.(category, nextValue);
    }
    if (!Array.isArray(nextType)) {
      const nextValue: OrgNormsSingleCategory = {
        type: nextType ?? null,
        other: nextType === "other" ? value?.other ?? "" : null,
      };
      return onChange?.(category, nextValue);
    }
    const first = nextType[0] ?? null;
    const nextValue: OrgNormsSingleCategory = {
      type: first,
      other: first === "other" ? value?.other ?? "" : null,
    };
    onChange?.(category, nextValue);
  };

  const handleOtherChange = (other: string) => {
    const currentType = value?.type;
    if (allowMultiple && Array.isArray(currentType)) {
      const nextType = Array.from(new Set([...currentType.filter((t) => t !== "other"), "other"]));
      const nextValue: OrgNormsMultiCategory = {
        type: nextType,
        other,
      };
      onChange?.(category, nextValue);
      return;
    }
    const nextValue: OrgNormsSingleCategory = {
      type: "other",
      other,
    };
    onChange?.(category, nextValue);
  };

  const showOtherInput =
    (Array.isArray(value?.type) && value?.type?.includes("other")) ||
    value?.type === "other";

  return (
    <section className="space-y-3 rounded-lg border p-3 m-2 h-full">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">{title ?? formatNormLabel(category)}</h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        <OrgNormsPresetSelector
          options={options}
          value={value?.type ?? null}
          disabled={disabled}
          allowMultiple={allowMultiple}
          onChange={handlePresetChange}
        />
        {showOtherInput && (
          <OrgNormsOtherInput
            id={`org-norm-other-${category}`}
            value={value?.other ?? ""}
            onChange={handleOtherChange}
          />
        )}
      </div>
    </section>
  );
}
