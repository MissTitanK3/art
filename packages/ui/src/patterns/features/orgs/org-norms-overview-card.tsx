"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";

import type { OrgNormPresetOption, OrgNorms } from "./types";
import { ORG_NORM_PRESETS } from "./types";
import { formatNormLabel } from "./org-norms-preset-selector";

const CATEGORY_ORDER: (keyof OrgNorms)[] = [
  "decision_making",
  "safety_level",
  "communication",
  "conflict_resolution",
  "safety_protocols",
  "role_boundaries",
  "accountability",
  "onboarding",
  "offboarding",
  "values_culture",
];

function renderLabel(option: string, category: keyof OrgNorms) {
  const match = ORG_NORM_PRESETS?.[category]?.find(
    (preset: OrgNormPresetOption) => preset.value === option
  );
  return match?.label ?? formatNormLabel(option);
}

function renderNormEntries(
  category: keyof OrgNorms,
  value?: { type: string | string[] | null; other: string | null } | null
): { label: string; description?: string | null }[] {
  if (!value) return [];

  const toEntry = (
    option: string
  ): { label: string; description?: string | null } => {
    if (option === "other") {
      return {
        label: value.other ? `Other — ${value.other}` : "Other",
        description: value.other ? null : "Custom option",
      };
    }
    const match = ORG_NORM_PRESETS?.[category]?.find(
      (preset: OrgNormPresetOption) => preset.value === option
    );
    return {
      label: match?.label ?? renderLabel(option, category),
      description: match?.description ?? null,
    };
  };

  if (Array.isArray(value.type)) {
    return value.type.map(toEntry).filter(Boolean);
  }

  if (!value.type) return [];
  return [toEntry(value.type)];
}

type OrgNormsOverviewCardProps = {
  norms?: OrgNorms | null;
};

export function OrgNormsOverviewCard({ norms }: OrgNormsOverviewCardProps) {
  const hasAnyNorm =
    norms &&
    CATEGORY_ORDER.some((category) => {
      const value = norms?.[category];
      return value && (value.type || value.other);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organizational norms</CardTitle>
        <CardDescription>
          Shared expectations for decision-making, communication, and safety.
          Visible to all members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasAnyNorm ? (
          <p className="text-sm text-muted-foreground">
            No norms have been published yet. Owners and admins can add them
            from Settings.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {CATEGORY_ORDER.map((category) => {
              const value = norms?.[category];
              const entries = renderNormEntries(category, value);
              return (
                <div key={category} className="rounded-md border p-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {formatNormLabel(category)}
                  </div>
                  {entries.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Not set</div>
                  ) : (
                    <div className="mt-1 space-y-2">
                      {entries.map((entry, idx) => (
                        <div
                          key={`${category}-${entry.label}-${idx}`}
                          className="text-sm"
                        >
                          <div className="font-medium text-foreground">
                            {entry.label}
                          </div>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
