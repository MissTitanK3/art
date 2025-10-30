"use client";

import * as React from "react";
import type { ComOperator } from "@workspace/store/types/comms.ts";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";

type Props = {
  operators: ComOperator[];
};

// Placeholder map component; sectors instead of exact positions per safety.
export function CommsMap({ operators }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] w-full rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          Sector overview (placeholder). Operators: {operators.length}
        </div>
      </CardContent>
    </Card>
  );
}

