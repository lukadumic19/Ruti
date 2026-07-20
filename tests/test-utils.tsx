import * as React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { defaultLocale } from "@/i18n/config";
import messages from "@/i18n/messages/da.json";

/** Render med danske beskeder, som komponenterne forventer i produktion. */
export function renderWithIntl(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  return render(
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
    options,
  );
}
