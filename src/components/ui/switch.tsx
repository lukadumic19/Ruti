"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils/cn";

/**
 * Toggle med stor trykflade (min. 44 px inkl. usynlig padding).
 * Tilstand vises med både position OG farve (aldrig kun farve).
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "group inline-flex min-h-11 min-w-11 items-center justify-center",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-14 items-center rounded-full border border-border bg-muted px-1 transition-colors group-disabled:opacity-50 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-primary"
      >
        <SwitchPrimitive.Thumb className="block size-6 rounded-full bg-card shadow transition-transform data-[state=checked]:translate-x-6" />
      </span>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
