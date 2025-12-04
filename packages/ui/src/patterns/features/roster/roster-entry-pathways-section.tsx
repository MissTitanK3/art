import { useCallback, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@workspace/ui/primitives/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/primitives/command";
import { Label } from "@workspace/ui/primitives/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import {
  academyCertificationOptions,
  createCertification,
  slugifyIdentifier,
} from "@workspace/ui/lib/academy-utils.ts";
import {
  computeQualificationPathwayStatuses,
  type QualificationPathwayStatus,
} from "@workspace/ui/lib/qualification-pathways.ts";
import {
  matchCertificationToCourse,
  normalizeCourseKey,
} from "@workspace/ui/lib/operational-coverage.ts";
import { humanize } from "@workspace/ui/lib/utils";
import type {
  NormalizedCertification,
  RosterEntry,
} from "@workspace/store/types/pod.ts";

import CertificationEditor from "../certifications/certifications-editor.tsx";
import { QualificationPathwayToggleButton } from "./qualification-pathway-toggle-button.tsx";

type FormValues = RosterEntry;

type RosterEntryPathwaysSectionProps = {
  isActive: boolean;
};

type CertificationDraft = {
  id: string;
  label: string;
};

const TEMPLATE_SLUG = "_course-template";

const COVERAGE_COURSE_LOOKUP = (() => {
  const map = new Map<string, { id: string; label: string }>();
  for (const option of academyCertificationOptions) {
    const key = normalizeCourseKey(option.id);
    if (!map.has(key)) {
      map.set(key, { id: option.id, label: option.label });
    }
  }
  return map;
})();

function resolveCoverageCourse(courseId: string): {
  id: string;
  label: string;
} {
  const normalized = normalizeCourseKey(courseId);
  const match = COVERAGE_COURSE_LOOKUP.get(normalized);
  if (match) {
    return match;
  }
  return {
    id: courseId,
    label: humanize(courseId),
  };
}

export function RosterEntryPathwaysSection({
  isActive,
}: RosterEntryPathwaysSectionProps) {
  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FormValues>();

  const watchedCerts = watch("certs");
  const certs = useMemo(() => watchedCerts ?? [], [watchedCerts]);

  const pathwayStatuses = useMemo<QualificationPathwayStatus[]>(
    () => computeQualificationPathwayStatuses(certs),
    [certs]
  );

  const visiblePathwayStatuses = useMemo(
    () =>
      pathwayStatuses.filter((status) =>
        status.pathway.courseSlugs.some((slug) => slug !== TEMPLATE_SLUG)
      ),
    [pathwayStatuses]
  );

  const handleEnrollPathway = useCallback(
    (pathwayKey: string) => {
      const status = pathwayStatuses.find(
        (entry) => entry.pathway.key === pathwayKey
      );
      if (!status) return;

      const currentCerts = getValues("certs") ?? [];
      const nextCerts: NormalizedCertification[] = [...currentCerts];

      let added = false;
      for (const courseSlug of status.pathway.courseSlugs) {
        if (courseSlug === TEMPLATE_SLUG) continue;
        const existing = matchCertificationToCourse(courseSlug, nextCerts);
        if (existing) continue;
        const courseDetails = resolveCoverageCourse(courseSlug);
        const normalized = {
          ...createCertification(courseDetails.label, courseDetails.id),
          level: "in_progress" as const,
        } satisfies NormalizedCertification;
        nextCerts.push(normalized);
        added = true;
      }

      if (!added) return;

      setValue("certs", nextCerts, { shouldDirty: true, shouldTouch: true });
    },
    [getValues, pathwayStatuses, setValue]
  );

  const [certPickerOpen, setCertPickerOpen] = useState(false);
  const [certDraft, setCertDraft] = useState<CertificationDraft>({
    id: "",
    label: "",
  });
  const [certError, setCertError] = useState<string | null>(null);

  const handleSelectCertification = useCallback((id: string, label: string) => {
    setCertDraft({ id, label });
    setCertPickerOpen(false);
    setCertError(null);
  }, []);

  const handleAddCertification = useCallback(() => {
    const slug = slugifyIdentifier(certDraft.id);
    const label = certDraft.label.trim();
    if (!slug || !label) {
      setCertError("Select or enter a certification before adding.");
      return;
    }
    if (certs.some((cert) => cert.id === slug)) {
      setCertError("Certification already added.");
      return;
    }
    const newCertification = {
      ...createCertification(label, slug),
      level: "in_progress" as const,
    } satisfies NormalizedCertification;
    setValue("certs", [...certs, newCertification], {
      shouldDirty: true,
      shouldTouch: true,
    });
    setCertDraft({ id: "", label: "" });
    setCertError(null);
  }, [certDraft.id, certDraft.label, certs, setValue]);

  return (
    <div
      className={`grid gap-1${isActive ? "" : " hidden"}`}
      aria-hidden={!isActive}
    >
      <div className="space-y-2">
        <Label>Qualification Pathways</Label>
        <p className="text-xs text-muted-foreground">
          Tap a pathway to enroll and auto-add its required courses.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {visiblePathwayStatuses.map((status) => (
            <QualificationPathwayToggleButton
              key={status.pathway.key}
              pathway={status.pathway}
              status={status}
              onToggle={handleEnrollPathway}
            />
          ))}
        </div>
      </div>

      <Label>Certifications</Label>
      <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-3">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
          <Popover open={certPickerOpen} onOpenChange={setCertPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="justify-between"
              >
                {certDraft.id
                  ? certDraft.label || certDraft.id
                  : "Search academy courses"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0">
              <Command>
                <CommandInput placeholder="Search course or slug" />
                <CommandList>
                  <CommandEmpty>No course found</CommandEmpty>
                  <CommandGroup heading="Academy courses">
                    {academyCertificationOptions.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={`${option.id} ${option.label}`}
                        onSelect={() =>
                          handleSelectCertification(option.id, option.label)
                        }
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            certDraft.id === option.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-medium leading-tight">
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {option.id}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddCertification}
            disabled={!certDraft.id || !certDraft.label}
          >
            Add
          </Button>
        </div>
        {certError ? (
          <p className="text-xs text-destructive">{certError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Added certifications appear below. Set their status to reflect
            progress so the operational minimum board stays accurate.
          </p>
        )}
      </div>

      <CertificationEditor
        value={certs}
        onChange={(next) =>
          setValue("certs", next, { shouldDirty: true, shouldTouch: true })
        }
      />

      {certs.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {certs.map((cert) => (
            <span
              key={`${cert.id}-slug`}
              className="rounded border border-border/50 bg-background/60 px-2 py-1"
            >
              {cert.id}
            </span>
          ))}
        </div>
      ) : null}

      {errors.certs && (
        <p className="text-xs text-destructive">
          {errors.certs.message as string}
        </p>
      )}
    </div>
  );
}
