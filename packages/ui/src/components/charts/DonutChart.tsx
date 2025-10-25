"use client";

import * as React from "react";
import * as Recharts from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent } from "../chart";
import type { ChartConfig } from "@workspace/store/types/charts.ts";

export type DonutSlice = {
  name: string;
  value: number;
  fill?: string;
};

type DonutChartProps = {
  id?: string;
  className?: string;
  data: DonutSlice[];
  config: ChartConfig;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  showLabels?: boolean;
  showLegend?: boolean;
};

export default function DonutChart({
  id = "donut",
  className,
  data,
  config,
  innerRadius = 50,
  outerRadius = 80,
  paddingAngle = 3,
  showLabels = true,
  showLegend = true,
}: DonutChartProps) {
  const slug = React.useCallback((key: string) => key.toLowerCase().replace(/[^a-z0-9]+/g, '-'), []);
  return (
    <ChartContainer id={id} className={className} config={config}>
      <Recharts.PieChart>
        <Recharts.Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          label={showLabels}
        >
          {data.map((d) => (
            <Recharts.Cell key={d.name} fill={d.fill || `var(--color-${slug(d.name)})`} />
          ))}
        </Recharts.Pie>
        <Recharts.Tooltip />
        {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </Recharts.PieChart>
    </ChartContainer>
  );
}
