"use client";

import * as React from "react";
import { FormSectionCard } from "../form-section-card";
import DistanceUnitToggle from "../DistanceUnitToggle";
import { Label } from "../label";
import { usePreferencesStore } from "@workspace/store/usePreferencesStore";

export default function PreferencesSection() {
  const unit = usePreferencesStore((s) => s.distanceUnit);
  return (
    <FormSectionCard
      title="Preferences"
      description="Choose how distances are displayed across the app. Your preference is saved on this device."
      sectionName="Preferences"
      // No save button; toggles persist immediately
      footerContent={null}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Distance units</div>
          <div className="text-sm text-muted-foreground">
            Current: {unit.toUpperCase()}
          </div>
        </div>
        <DistanceUnitToggle size="sm" />
      </div>
    </FormSectionCard>
  );
}
