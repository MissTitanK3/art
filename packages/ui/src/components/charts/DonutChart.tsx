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
  const slug = React.useCallback(
    (key: string) => key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    [],
  );
  const total = React.useMemo(
    () => data.reduce((acc, d) => acc + (Number(d.value) || 0), 0),
    [data],
  );
  const hasData = total > 0;
  const plotData = hasData
    ? data
    : [{ name: "No Data", value: 1, fill: "#e5e7eb" }];
  return (
    <ChartContainer id={id} className={className} config={config}>
      <Recharts.PieChart>
        <Recharts.Pie
          data={plotData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          label={showLabels && hasData}
        >
          {plotData.map((d) => (
            <Recharts.Cell
              key={d.name}
              fill={d.fill || `var(--color-${slug(d.name)})`}
            />
          ))}
        </Recharts.Pie>
        <Recharts.Tooltip />
        {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </Recharts.PieChart>
    </ChartContainer>
  );
}
