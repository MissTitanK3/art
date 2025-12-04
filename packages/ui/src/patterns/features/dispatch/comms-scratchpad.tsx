"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@workspace/ui/primitives/card";
import { Textarea } from "@workspace/ui/primitives/textarea";
export function CommsScratchpad() {
  const [text, setText] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scratchpad</CardTitle>
        <CardDescription>Temporary notes for comms operators</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Notes..."
        />
      </CardContent>
    </Card>
  );
}
export default CommsScratchpad;
