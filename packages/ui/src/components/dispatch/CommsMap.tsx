"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";

export function CommsMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">Map placeholder</div>
      </CardContent>
    </Card>
  );
}

export default CommsMap;
