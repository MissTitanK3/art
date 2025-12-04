"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@workspace/ui/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-all outline-none shadow-sm",
        "data-[state=checked]:justify-end data-[state=unchecked]:justify-start",
        "data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-muted/80",
        "dark:data-[state=unchecked]:bg-muted/60",
        "focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-md ring-1 ring-inset ring-border transition-colors",
          "data-[state=checked]:bg-white data-[state=checked]:ring-primary/40",
          "dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground/90",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
