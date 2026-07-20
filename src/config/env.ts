import { z } from "zod";

/**
 * Eneste sted i kodebasen hvor process.env læses (SECURITY_MODEL §2.4).
 * Server- og klientskemaer er adskilte, så serverhemmeligheder aldrig kan
 * importeres i klientkode uden fejl.
 */

const serverSchema = z
  .object({
    APP_MODE: z.enum(["demo", "live"]).default("demo"),
    HA_URL: z.string().url().optional(),
    HA_WS_URL: z.string().url().optional(),
    HA_TOKEN: z.string().min(1).optional(),
    SESSION_SECRET: z.string().min(32).optional(),
    DATA_DIR: z.string().min(1).default("./data"),
  })
  .superRefine((value, ctx) => {
    if (value.APP_MODE !== "live") return;
    for (const key of ["HA_URL", "HA_WS_URL", "HA_TOKEN"] as const) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} er påkrævet når APP_MODE=live`,
        });
      }
    }
  });

const clientSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

/** Ren funktion, så validering kan unit-testes uden at røre process.env. */
export function parseServerEnv(
  raw: Record<string, string | undefined>,
): ServerEnv {
  const result = serverSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Ugyldig server-miljøkonfiguration:\n${details}`);
  }
  return result.data;
}

export function parseClientEnv(
  raw: Record<string, string | undefined>,
): ClientEnv {
  const result = clientSchema.safeParse(raw);
  if (!result.success) {
    throw new Error("Ugyldig klient-miljøkonfiguration");
  }
  return result.data;
}

let cachedServerEnv: ServerEnv | undefined;

/** Må kun kaldes i serverkode (BFF, server components, route handlers). */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() må aldrig kaldes i browseren");
  }
  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}

/* NEXT_PUBLIC_* inlines af Next' bundler og skal refereres statisk. */
export const clientEnv: ClientEnv = parseClientEnv({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});
