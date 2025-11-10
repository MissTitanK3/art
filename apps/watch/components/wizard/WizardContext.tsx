"use client";

import { createContext, useContext, useState } from "react";
import { ReportFormData } from "@/types/wizard";

type WizardContextType = {
  step: number;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  canContinue: boolean;
  setCanContinue: (val: boolean) => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  testReportEnabled: boolean;
  setTestReportEnabled: (enabled: boolean) => void;
  finish: () => Promise<void>;
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [testReportEnabled, setTestReportEnabled] = useState(false);

  const [formData, setFormData] = useState<ReportFormData>({
    agency_type: [],
    agency_other: "",
    location: null,
    media_url: null,
    lights_on: null,
    officer_direction: null,
    officer_moving: null,
    sirens_on: null,
    test: null,
  });

  const next = () => {
    if (canContinue) setStep((s) => Math.min(s + 1, 2));
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const finish = async () => {
    const {
      agency_type,
      agency_other,
      location,
      media_url,
      lights_on,
      officer_direction,
      officer_moving,
      sirens_on,
    } = formData;

    const timestamp = new Date().toISOString();
    const report = {
      agency_type,
      agency_other,
      location,
      media_url,
      timestamp,
      lights_on,
      officer_direction,
      officer_moving,
      sirens_on,
      test: testReportEnabled,
    };

    const isOffline = !navigator.onLine;
    const { addReportToQueue } = await import("@/utils/reportQueue");
    const { supabase } = await import("@/utils/supabase/client");

    if (isOffline) {
      addReportToQueue(report);
      window.location.href = "/report/wizard";
      return;
    }

    try {
      const { error } = await supabase.from("wizard").insert([report]);
      if (error) {
        console.error("Insert failed:", error);
        addReportToQueue(report);
      }
    } catch (err) {
      console.error("Submission error:", err);
      addReportToQueue(report);
    }

    window.location.href = "/heatmap";
  };

  return (
    <WizardContext.Provider
      value={{
        step,
        setStep,
        next,
        back,
        canContinue,
        setCanContinue,
        formData,
        setFormData,
        testReportEnabled,
        setTestReportEnabled,
        finish,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within a WizardProvider");
  return ctx;
};
