'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import type { AcademySummaryStat } from '@workspace/store/types/academy.ts'

type AcademyStatsGridProps = {
  stats: AcademySummaryStat[]
}

export function AcademyStatsGrid({ stats }: AcademyStatsGridProps) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/60 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
          </CardHeader>
          {stat.helper ? (
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.helper}</p>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  )
}
