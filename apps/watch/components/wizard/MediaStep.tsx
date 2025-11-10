"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/il8n/useTranslations";
import { useWizard } from "./WizardContext";
import { TranslationKey } from "@/lib/il8n/translations";
import { FrostedButton } from "../ui/FrostedButton";

export default function MediaStep() {
  const { t } = useTranslations();
  const { setCanContinue, formData, setFormData } = useWizard();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const directionOptions = [
    "NorthWest",
    "North",
    "NorthEast",
    "West",
    null,
    "East",
    "SouthWest",
    "South",
    "SouthEast",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-base">{t("officerMovement")}</h4>
        <div className="grid grid-cols-2 gap-4">
          <FrostedButton
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, officer_moving: true }))
            }
            variant={formData.officer_moving === true ? "primary" : "secondary"}
            size="2xl"
            className="w-full justify-center"
          >
            {t("moving")}
          </FrostedButton>

          <FrostedButton
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                officer_moving: false,
                officer_direction: null,
              }))
            }
            variant={
              formData.officer_moving === false ? "primary" : "secondary"
            }
            size="2xl"
            className="w-full justify-center"
          >
            {t("stationary")}
          </FrostedButton>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("directionOfTravel")}
          </label>
          <div className="grid grid-cols-3 gap-3 text-center">
            {directionOptions.map((dir) =>
              dir ? (
                <FrostedButton
                  key={dir}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      officer_direction: dir as typeof prev.officer_direction,
                    }))
                  }
                  variant={
                    formData.officer_direction === dir ? "primary" : "secondary"
                  }
                  size="altLg" // larger padding
                  className="w-full justify-center text-sm" // smaller font
                >
                  {t(`direction.${dir}` as TranslationKey)}
                </FrostedButton>
              ) : (
                <div key="spacer" />
              ),
            )}
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <h4 className="font-semibold text-base">{t("emergencyIndicators")}</h4>
        <div className="grid grid-cols-2 gap-4">
          <FrostedButton
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, lights_on: !prev.lights_on }))
            }
            variant={formData.lights_on ? "primary" : "secondary"}
            size="md"
            className="w-full flex justify-between items-center"
          >
            <span>{t("lights")}</span>
            <span
              className={`w-3 h-3 rounded-full ${formData.lights_on ? "bg-green-400" : "bg-red-400"}`}
            />
          </FrostedButton>

          <FrostedButton
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, sirens_on: !prev.sirens_on }))
            }
            variant={formData.sirens_on ? "primary" : "secondary"}
            size="md"
            className="w-full flex justify-between items-center"
          >
            <span>{t("sirens")}</span>
            <span
              className={`w-3 h-3 rounded-full ${formData.sirens_on ? "bg-green-400" : "bg-red-400"}`}
            />
          </FrostedButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">{t("haveMedia")}</h3>
        <p className="text-sm text-white/70">{t("optionalNote")}</p>
      </div>

      <div className="flex items-center gap-2">
        <p>{t("mediaFundingNotice")}</p>
      </div>

      <div
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        className="relative text-sm text-white/70 underline cursor-help"
      >
        {t("whyUpload")}
        {tooltipVisible && (
          <div className="absolute top-full mt-1 w-72 p-2 bg-white text-black border border-white/40 shadow text-xs text-left z-10 rounded-md">
            {t("mediaPrivacyNote")}
          </div>
        )}
      </div>

      <hr className="my-4" />
    </div>
  );
}
