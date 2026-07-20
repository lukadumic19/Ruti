import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

/** Generisk side-skeleton til loading-tilstande (route-level loading.tsx m.m.). */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
