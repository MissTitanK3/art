"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@workspace/ui/primitives/card";
import { Loader2 } from "lucide-react";

type Props = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
};

export default function StatCard({
  label,
  value,
  icon,
  className,
  loading,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">
          {label}
        </CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-12">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
