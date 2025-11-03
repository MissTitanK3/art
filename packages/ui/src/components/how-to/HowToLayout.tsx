"use client";

import * as React from "react";
import { Button } from "../button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../drawer";
import {
  HOW_TO_SECTIONS,
  type HowToSectionId,
} from "./index";

export interface HowToLayoutProps {
  title?: string;
  subtitle?: string;
  active: HowToSectionId;
  onSelect: (id: HowToSectionId) => void;
  renderers: Record<string, React.ReactNode>;
  quick?: React.ReactNode; // optional quick-access area rendered at top
}

export function HowToLayout({ title = "How To Use Platform", subtitle = "Learn how to navigate the platform and report issues effectively.", active, onSelect, renderers, quick }: HowToLayoutProps) {
  const sections = React.useMemo(
    () => [...HOW_TO_SECTIONS].sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const grouped = React.useMemo(() => {
    const byId = new Map(sections.map((s) => [s.id, s] as const));
    const parentIds = new Set(Array.from(byId.keys()));
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
    const childIds = new Set(Array.from(childrenOf.values()).flat().map((c) => c.id));
    const parents = sections.filter((s) => !childIds.has(s.id));
    parents.sort((a, b) => a.label.localeCompare(b.label));
    for (const [pid, list] of childrenOf.entries()) {
      list.sort((a, b) => a.label.localeCompare(b.label));
      childrenOf.set(pid, list);
    }
    return parents.map((p) => ({ parent: p, children: childrenOf.get(p.id) ?? [] }));
  }, [sections]);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const content = renderers[active] ?? null;

  return (
    <div className="flex w-full min-h-screen bg-background">
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
                    onClick={() => onSelect(parent.id as HowToSectionId)}
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
                            onClick={() => onSelect(c.id as HowToSectionId)}
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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8 flex flex-col items-center text-center gap-2 lg:flex-row md:items-start md:justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="mt-2 lg:hidden z-10">
            <Button variant="outline" onClick={() => setMobileOpen(true)}>Sections</Button>
          </div>
        </header>

        {quick ? (
          <section className="mb-10">{quick}</section>
        ) : null}

        {content}

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
                        onClick={() => { onSelect(parent.id as HowToSectionId); setMobileOpen(false); }}
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
                                onClick={() => { onSelect(c.id as HowToSectionId); setMobileOpen(false); }}
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

export default HowToLayout;

