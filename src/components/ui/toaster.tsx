"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/** Globalt toast-system (DESIGN_PRINCIPLES §7: maks. én ad gangen, 4 s). */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      visibleToasts={1}
      duration={4000}
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        },
      }}
    />
  );
}
