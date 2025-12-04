"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";

export type QuickActionSection = {
  title: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "light" | "secondary";
  }>;
};

export type QuickActionsCardProps = {
  title?: string;
  sections: QuickActionSection[];
  className?: string;
  hiddenOnMobile?: boolean;
};

export default function QuickActionsCard({
  title = "Quick actions",
  sections,
  className,
  hiddenOnMobile = true,
}: QuickActionsCardProps) {
  return (
    <Card
      className={`${hiddenOnMobile ? "hidden md:block" : ""} ${className ?? ""}`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">{sec.title}</p>
              <div className="flex flex-wrap gap-2">
                {sec.actions.map((a, i) => (
                  <Button
                    key={i}
                    className="flex-1 min-w-[160px]"
                    variant={a.variant ?? "default"}
                    onClick={a.onClick}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
