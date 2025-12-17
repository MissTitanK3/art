"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HowToLayout from "@workspace/ui/patterns/features/how-to/how-to-layout";
import {
  HowToBugTracker,
  NavRolesGuide,
  HowToUserGuide,
  TeamReqGuide,
  DispatchesGuide,
  WatchGuide,
  SchedulesGuide,
  PodsGuide,
  PodsNewGuide,
  AcademyGuide,
  AcademyClassGuide,
  MissingPersonsGuide,
  MissingPersonsIntakeGuide,
  MissingPersonsCaseGuide,
  MyProfileGuide,
  MyProfileMapGuide,
  AdminGuide,
  AdminBugReportsGuide,
  AdminDispatchGuide,
  AdminPodsGuide,
  AdminProfilesGuide,
  AdminTrainingGuide,
  AdminTrustGuide,
  type HowToSectionId,
  DEFAULT_HOW_TO_SECTION_ID,
} from "@workspace/ui/patterns/features/how-to";
import { Button } from "@workspace/ui/primitives/button";
import { BugReportForm } from "@workspace/ui/patterns/features/feedback/bug-report-form";
export default function HowToUsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial =
    (searchParams.get("section") as HowToSectionId) ||
    DEFAULT_HOW_TO_SECTION_ID;
  const [active, setActive] = useState<HowToSectionId>(initial);
  useEffect(() => {
    const fromUrl =
      (searchParams.get("section") as HowToSectionId) ||
      DEFAULT_HOW_TO_SECTION_ID;
    setActive(fromUrl);
  }, [searchParams]);
  const select = useCallback(
    (id: HowToSectionId) => {
      setActive(id);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("section", id);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  const renderers = useMemo(
    () =>
      ({
        "user-guide": <HowToUserGuide />,
        "bug-tracker": (
          <HowToBugTracker
            quickReport={
              <>
                <span className="text-sm text-muted-foreground mb-4">
                  (Not on Github)
                </span>
                <BugReportForm />
              </>
            }
          />
        ),
        "team-req": <TeamReqGuide />,
        dispatches: <DispatchesGuide />,
        watch: <WatchGuide />,
        schedules: <SchedulesGuide />,
        pods: <PodsGuide />,
        "pods-new": <PodsNewGuide />,
        academy: <AcademyGuide />,
        "academy-class": <AcademyClassGuide />,
        "nav-roles": <NavRolesGuide />,
        "missing-persons": <MissingPersonsGuide />,
        "missing-persons-intake": <MissingPersonsIntakeGuide />,
        "missing-persons-case": <MissingPersonsCaseGuide />,
        "my-profile": <MyProfileGuide />,
        "my-profile-map": <MyProfileMapGuide />,
        admin: <AdminGuide />,
        "admin-bug-reports": <AdminBugReportsGuide />,
        "admin-dispatch": <AdminDispatchGuide />,
        "admin-pods": <AdminPodsGuide />,
        "admin-profiles": <AdminProfilesGuide />,
        "admin-training": <AdminTrainingGuide />,
        "admin-trust": <AdminTrustGuide />,
      }) as Record<string, React.ReactNode>,
    [],
  );
  const quick = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-muted rounded-lg p-4">
        <h3 className="font-semibold">Bug Tracker</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Report issues and track fixes directly from the platform.
        </p>
        <div className="mt-3">
          <Button onClick={() => select("bug-tracker")}>
            Open Bug Tracker
          </Button>
        </div>
      </div>
    </div>
  );
  return (
    <HowToLayout
      active={active}
      onSelect={select}
      renderers={renderers}
      quick={quick}
    />
  );
}
