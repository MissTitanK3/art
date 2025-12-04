"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import type { AcademySummaryStat } from "@workspace/store/types/academy.ts";

type AcademyStatsGridProps = {
  stats: AcademySummaryStat[];
};

export function AcademyStatsGrid({ stats }: AcademyStatsGridProps) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {stats.map((stat) => {
        const content = (
          <>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {stat.value}
              </CardTitle>
            </CardHeader>
            {stat.helper ? (
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.helper}</p>
              </CardContent>
            ) : null}
          </>
        );
        const inner = stat.href ? (
          <a
            href={stat.href}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-xl"
          >
            {content}
          </a>
        ) : (
          content
        );
        return (
          <Card
            key={stat.label}
            className="border border-border/60 shadow-none hover:border-primary/40 transition-colors"
          >
            {inner}
          </Card>
        );
      })}
    </div>
  );
}
