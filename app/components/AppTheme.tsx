"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { cssVariablesResolver, raseedTheme } from "@/lib/theme";

/**
 * Single source of truth for theming the app. Every page/route should wrap
 * its tree in <AppTheme> instead of constructing its own MantineProvider.
 *
 * Default color scheme is `light` — Raseed targets finance/SaaS where light
 * UIs are the norm. Mantine still respects the user's stored preference
 * (set via the `<ColorSchemeScript>` in the root layout).
 */
export function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={raseedTheme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
