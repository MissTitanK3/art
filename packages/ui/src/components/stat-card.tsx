"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "./card";

type Props = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export default function StatCard({ label, value, icon, className }: Props) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{label}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

