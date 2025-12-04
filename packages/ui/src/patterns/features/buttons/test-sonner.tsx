"use client";

import { toast } from "sonner";
import { Button } from "@workspace/ui/primitives/button";

type Props = Record<string, never>;

export const TestSonner = (props: Props) => {
  return (
    <div>
      <Button size="sm" onClick={() => toast("hi")}>
        Button
      </Button>
    </div>
  );
};
