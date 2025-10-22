import * as React from "react";

interface DetailGridProps {
  columns?: 1 | 2;
  children: React.ReactNode;
  className?: string;
}

export function DetailGrid({ columns = 2, children, className }: DetailGridProps) {
  const columnClass = columns === 1 ? "grid-cols-1" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-4 ${columnClass} ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}

interface DetailItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
}

export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-sm text-foreground" suppressHydrationWarning>{value}</div>
    </div>
  );
}
