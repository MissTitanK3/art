"use client";

import { useEffect, useState } from "react";
import { BasicInfoStep } from "./BasicInfoStep.tsx";
import { EventTypeStep } from "./EventTypeStep.tsx";
import { ActionsStep } from "./ActionsStep.tsx";
import { RolesStep } from "./RolesStep.tsx";
import { ReviewStep } from "./ReviewStep.tsx";
import { TEAM_CONFIG_PRESETS } from "@workspace/store/types/roles.ts";
import type { DispatchType } from "@workspace/store/types/dispatch.ts";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type StepData = {
  basicInfo?: {
    location_label?: string;
    location?: { lat: number; lng: number };
    state?: string;
    type?: DispatchType;
    visibility_radius_km?: number;
    date_of_event?: string;
  };
  eventType?: keyof typeof TEAM_CONFIG_PRESETS;
  actions?: {
    intended_action_preset?: string;
    intended_actions?: string[];
    intended_action_notes?: string;
    intended_actions_custom?: string;
  };
  rolesNeeded?: {
    required_roles?: string[];
    required_roles_by_type?: Record<string, number>;
  };
};

interface TeamRequestFormProps {
  onSubmitted?: (submission: DispatchSubmission) => void;
  onCreateSubmission: (submission: DispatchSubmission) => void;
  initialData?: StepData;
}

export default function TeamRequestForm({
  onSubmitted,
  onCreateSubmission,
  initialData,
}: TeamRequestFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StepData>(() => initialData ?? {});
  const [autoAdvanceEventStep, setAutoAdvanceEventStep] = useState(
    initialData?.eventType ? true : false,
  );

  const goNext = (data: Partial<StepData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    if (currentStep === 1 && formData.eventType && autoAdvanceEventStep) {
      setAutoAdvanceEventStep(false);
      setCurrentStep(2);
    }
  }, [autoAdvanceEventStep, currentStep, formData.eventType]);

  return (
    <div className="mx-auto">
      {currentStep === 0 && (
        <BasicInfoStep
          initial={formData.basicInfo}
          onNext={(data) => goNext({ basicInfo: data })}
        />
      )}

      {currentStep === 1 && (
        <EventTypeStep
          onBack={goBack}
          onNext={(data) => {
            const preset = TEAM_CONFIG_PRESETS[data.eventType];
            goNext({
              eventType: data.eventType,
              actions: { intended_actions: preset.actions },
              rolesNeeded: {
                required_roles: Object.keys(preset.roles),
                required_roles_by_type: preset.roles,
              },
            });
          }}
        />
      )}

      {currentStep === 2 && (
        <ActionsStep
          initial={formData.actions}
          onBack={goBack}
          onNext={(data) => goNext({ actions: data })}
        />
      )}

      {currentStep === 3 && (
        <RolesStep
          initial={formData.rolesNeeded}
          suggestedRoles={
            formData.eventType
              ? Object.keys(TEAM_CONFIG_PRESETS[formData.eventType].roles)
              : []
          }
          onBack={goBack}
          onNext={(data) => goNext({ rolesNeeded: data })}
        />
      )}

      {currentStep === 4 && (
        <ReviewStep
          data={formData}
          onBack={goBack}
          onReset={() => {
            setFormData({});
            setCurrentStep(0);
          }}
          onSubmitted={onSubmitted}
          onCreateSubmission={onCreateSubmission}
        />
      )}
    </div>
  );
}
