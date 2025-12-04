import { useFormContext } from "react-hook-form";

import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import LanguageFluencyEditor from "@workspace/ui/patterns/features/language/language-fluency-editor";
import LanguagePicker from "@workspace/ui/patterns/features/language/language-picker";
import type { RosterEntryFormInput } from "@workspace/store/types/pod.ts";

type FormValues = RosterEntryFormInput;

type RosterEntryLanguagesSectionProps = {
  isActive: boolean;
};

export function RosterEntryLanguagesSection({
  isActive,
}: RosterEntryLanguagesSectionProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const langs = watch("langs") ?? [];

  return (
    <div
      className={`grid gap-3${isActive ? "" : " hidden"}`}
      aria-hidden={!isActive}
    >
      <div className="grid gap-1">
        <Label>Languages</Label>
        <LanguagePicker
          value={langs}
          onChange={(next) =>
            setValue("langs", next, { shouldDirty: true, shouldTouch: true })
          }
          showProficiency={false}
        />
        <LanguageFluencyEditor
          value={langs}
          onChange={(next) =>
            setValue("langs", next, { shouldDirty: true, shouldTouch: true })
          }
        />
        {errors.langs && (
          <p className="text-xs text-destructive">
            {errors.langs.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-1">
        <Label>Skills</Label>
        <Input placeholder="Comma separated" {...register("skills")} />
      </div>
    </div>
  );
}
