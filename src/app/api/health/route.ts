import { NextResponse } from "next/server";

import { serverEnv } from "@/config/env";
import { appVersion } from "@/config/version";

export const dynamic = "force-dynamic";

/** Maskinlæsbart health-check (bruges af e2e-tests og senere overvågning). */
export function GET() {
  const env = serverEnv();
  return NextResponse.json({
    status: "ok",
    mode: env.APP_MODE,
    version: appVersion,
    time: new Date().toISOString(),
  });
}
