"use client";
import { useCallback, useRef } from "react";
import { Button } from "@workspace/ui/primitives/button";
import type { CrewCatalog } from "@/schemas/crew";
import { CrewCard } from "./CrewCard";
export function RoleRow({
  role,
  items,
  isActive,
  onHire,
  canHire,
  uncoveredNeeds,
  autoStrategy,
}: {
  role: string;
  items: CrewCatalog[];
  isActive: (id: string) => boolean;
  onHire: (id: string) => void;
  canHire: boolean;
  uncoveredNeeds?: Set<string>;
  autoStrategy: "balanced" | "max-repair" | "max-signal" | "max-morale";
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollByCard = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild?.getBoundingClientRect().width ?? 300;
    let gap = 0;
    try {
      const cs = getComputedStyle(el);
      const cg = (cs.getPropertyValue("column-gap") ||
        cs.getPropertyValue("gap")) as string;
      gap = parseFloat((cg || "0").toString()) || 0;
    } catch {
      /* noop */
    }
    const delta = dir * (cardWidth + gap);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{role}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {items.length} crew
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              aria-label={`Scroll ${role} left`}
              onClick={() => scrollByCard(-1)}
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              aria-label={`Scroll ${role} right`}
              onClick={() => scrollByCard(1)}
            >
              →
            </Button>
          </div>
        </div>
      </div>
      <div
        className="-mx-2 px-2"
        role="region"
        aria-label={`${role} crew gallery`}
      >
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-px-2 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" as any }}
        >
          {items.map((m) => (
            <div
              key={m.id}
              className="snap-start flex-shrink-0 min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] md:min-w-[280px] md:w-[280px] lg:min-w-[300px] lg:w-[300px]"
            >
              <CrewCard
                m={m}
                active={isActive(m.id)}
                onHire={() => onHire(m.id)}
                canHire={canHire}
                uncoveredNeeds={uncoveredNeeds}
                autoStrategy={autoStrategy}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
