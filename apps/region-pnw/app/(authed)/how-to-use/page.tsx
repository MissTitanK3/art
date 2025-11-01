"use client";

import { Button } from "@workspace/ui/components/button";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import {
  HOW_TO_SECTIONS,
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
  IntentsGuide,
  RolesGuide,
  ImpactGuide,
  MissingPersonsGuide,
  MissingPersonsIntakeGuide,
  MissingPersonsCaseGuide,
  MyProfileGuide,
  MyProfileMapGuide,
  SettingsGuide,
  CredentialsGuide,
  AdminGuide,
  AdminBugReportsGuide,
  AdminDispatchGuide,
  AdminPodsGuide,
  AdminProfilesGuide,
  AdminSettingsGuide,
  AdminTrainingGuide,
  AdminTrustGuide,
  TrustManagementGuide,
  WarehousingGuide,
  type HowToSectionId,
  DEFAULT_HOW_TO_SECTION_ID,
} from "@workspace/ui/components/how-to";
import { BugReportForm } from "@workspace/ui/components/feedback/BugReportForm";

export default function HowToUsePlatformPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sections = useMemo(
    () => [...HOW_TO_SECTIONS].sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  // Group sections into parents with sub-sections where applicable
  const grouped = useMemo(() => {
    const byId = new Map(sections.map((s) => [s.id, s] as const));
    const parentIds = new Set(Array.from(byId.keys()));

    // Build child -> parent relationship only when the prefix is an actual parent id
    const childrenOf = new Map<string, Array<typeof sections[number]>>();
    for (const s of sections) {
      const maybeParentId = Array.from(parentIds).find(
        (pid) => s.id !== pid && s.id.startsWith(`${pid}-`)
      );
      if (maybeParentId) {
        if (!childrenOf.has(maybeParentId)) childrenOf.set(maybeParentId, []);
        childrenOf.get(maybeParentId)!.push(s);
      }
    }

    // Parents are those not recognized as children of another section
    const childIds = new Set(Array.from(childrenOf.values()).flat().map((c) => c.id));
    const parents = sections.filter((s) => !childIds.has(s.id));

    // Sort parents and children by label for stable order
    parents.sort((a, b) => a.label.localeCompare(b.label));
    for (const [pid, list] of childrenOf.entries()) {
      list.sort((a, b) => a.label.localeCompare(b.label));
      childrenOf.set(pid, list);
    }

    return parents.map((p) => ({ parent: p, children: childrenOf.get(p.id) ?? [] }));
  }, [sections]);

  const initialSection =
    (searchParams.get("section") as HowToSectionId) || DEFAULT_HOW_TO_SECTION_ID;
  const [active, setActive] = useState<HowToSectionId>(initialSection);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fromUrl =
      (searchParams.get("section") as HowToSectionId) || DEFAULT_HOW_TO_SECTION_ID;
    setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectSection = (id: HowToSectionId) => {
    setActive(id);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("section", id);
    router.replace(`?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  };

  // Map section ids to rendered components
  const sectionComponents = useMemo(() => {
    return {
      "user-guide": <HowToUserGuide />,
      "bug-tracker": (
        <HowToBugTracker
          quickReport={
            <>
              <span className="text-sm text-muted-foreground mb-4">(Not on Github)</span>
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
      // intents: <IntentsGuide />,
      // roles: <RolesGuide />,
      // impact: <ImpactGuide />,
      "missing-persons": <MissingPersonsGuide />,
      "missing-persons-intake": <MissingPersonsIntakeGuide />,
      "missing-persons-case": <MissingPersonsCaseGuide />,
      "my-profile": <MyProfileGuide />,
      "my-profile-map": <MyProfileMapGuide />,
      // settings: <SettingsGuide />,
      // credentials: <CredentialsGuide />,
      admin: <AdminGuide />,
      "admin-bug-reports": <AdminBugReportsGuide />,
      "admin-dispatch": <AdminDispatchGuide />,
      "admin-pods": <AdminPodsGuide />,
      "admin-profiles": <AdminProfilesGuide />,
      "admin-training": <AdminTrainingGuide />,
      "admin-trust": <AdminTrustGuide />,
      // "trust-management": <TrustManagementGuide />,
      // warehousing: <WarehousingGuide />,
    } as Record<string, ReactNode>;
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-fit max-w-full border-r border-muted py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Help & Guide</h2>
        </div>
        <nav className="text-sm space-y-2">
          <div>
            <div className="text-muted-foreground mb-1">Sections</div>
            <ul className="space-y-1">
              {grouped.map(({ parent, children }) => (
                <li key={parent.id}>
                  <button
                    type="button"
                    onClick={() => selectSection(parent.id)}
                    className={
                      "w-full text-left block px-2 py-1 rounded hover:bg-muted " +
                      (active === parent.id ? "bg-muted font-medium" : "")
                    }
                    aria-current={active === parent.id ? "page" : undefined}
                  >
                    {parent.label}
                  </button>
                  {children.length > 0 ? (
                    <ul className="mt-1 ml-2 space-y-1">
                      {children.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => selectSection(c.id)}
                            className={
                              "w-full text-left block px-2 py-1 rounded hover:bg-muted text-muted-foreground " +
                              (active === c.id ? "bg-muted font-medium text-foreground" : "")
                            }
                            aria-current={active === c.id ? "page" : undefined}
                          >
                            {c.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8 flex flex-col items-center text-center gap-2 lg:flex-row md:items-start md:justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold">How To Use Platform</h1>
            <p className="text-muted-foreground mt-1">
              Learn how to navigate the platform and report issues effectively.
            </p>
          </div>
          <div className="mt-2 lg:hidden z-10">
            <Button variant="outline" onClick={() => setMobileOpen(true)}>Sections</Button>
          </div>
        </header>

        {/* Top quick-access section for key guides */}
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-muted rounded-lg p-4">
              <h3 className="font-semibold">Bug Tracker</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Report issues and track fixes directly from the platform.
              </p>
              <div className="mt-3">
                <Button onClick={() => selectSection("bug-tracker")}>Open Bug Tracker</Button>
              </div>
            </div>
          </div>
        </section>

        {sectionComponents[active] ?? null}

        {/* Mobile Sections Drawer */}
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
          <DrawerContent className="bg-card text-card-foreground">
            <DrawerHeader>
              <DrawerTitle>Help & Guide</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
              <nav className="text-sm">
                <div className="text-muted-foreground mb-2">Sections</div>
                <ul className="space-y-1">
                  {grouped.map(({ parent, children }) => (
                    <li key={parent.id}>
                      <button
                        type="button"
                        onClick={() => selectSection(parent.id)}
                        className={
                          "w-full text-left block px-2 py-2 rounded hover:bg-muted " +
                          (active === parent.id ? "bg-muted font-medium" : "")
                        }
                        aria-current={active === parent.id ? "page" : undefined}
                      >
                        {parent.label}
                      </button>
                      {children.length > 0 ? (
                        <ul className="mt-1 ml-2 space-y-1">
                          {children.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => selectSection(c.id)}
                                className={
                                  "w-full text-left block px-2 py-1 rounded hover:bg-muted text-muted-foreground " +
                                  (active === c.id ? "bg-muted font-medium text-foreground" : "")
                                }
                                aria-current={active === c.id ? "page" : undefined}
                              >
                                {c.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </DrawerContent>
        </Drawer>
      </main>
    </div>
  );
}
