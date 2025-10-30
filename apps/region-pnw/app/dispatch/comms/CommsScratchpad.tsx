"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";

export function CommsScratchpad() {
  const [notes, setNotes] = React.useState("");
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Scratchpad</CardTitle>
        <CardDescription className="text-xs">
          Not saved to the database. Notes stay on this device only.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[360px]">
        <Textarea
          className="h-full min-h-[320px]"
          placeholder="Quick notes for verbal traffic or ops updates..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
