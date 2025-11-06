"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React from "react";

/**
 * PrintButton triggers the browser print dialog and is hidden from print output.
 */
export function PrintButton({ label = "Print" }: { label?: string }) {
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

export default PrintButton;
