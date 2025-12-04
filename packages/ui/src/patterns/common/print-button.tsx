"use client";

import { Button } from "@workspace/ui/primitives/button";
import { Printer } from "lucide-react";

type PrintButtonProps = {
  label?: string;
};

export default function PrintButton({ label = "Print" }: PrintButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="no-print"
      onClick={() => {
        // Give the layout a moment to settle before printing (useful after route transitions)
        requestAnimationFrame(() => window.print());
      }}
    >
      <Printer className="mr-2 h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Print</span>
    </Button>
  );
}
