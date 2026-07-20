"use client";

import { useEffect, useState } from "react";

/** Undgår hydration-mismatch for client-only visninger (fx aktuelt tema). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
