"use client";

import da from "@/i18n/messages/da.json";
import { defaultLocale } from "@/i18n/config";

/**
 * Yderste fejlgrænse – erstatter hele root-layoutet og kan derfor ikke bruge
 * i18n-providers. Teksterne kommer stadig fra beskedfilen (ingen hårdkodning).
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang={defaultLocale}>
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div role="alert" style={{ textAlign: "center", padding: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            {da.states.errorTitle}
          </p>
          <p style={{ color: "#6b6b66", marginBottom: "1rem" }}>
            {da.states.errorDescription}
          </p>
          <button
            onClick={reset}
            style={{
              minHeight: 44,
              minWidth: 44,
              padding: "0 1.25rem",
              borderRadius: 10,
              border: "1px solid #d8d5cf",
              background: "#f2f0ec",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {da.states.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
