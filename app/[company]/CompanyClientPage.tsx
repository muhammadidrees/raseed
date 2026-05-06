"use client";

import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "../app";
import type { PublishedInvoiceTemplate } from "@/lib/invoice-template";

const theme = createTheme({});

function exportLabelFromTemplate(t: PublishedInvoiceTemplate): string {
  if (t.config.exportName?.trim()) return t.config.exportName.trim();
  const first = t.organizationName.trim().split(/\s+/)[0];
  if (first) return first;
  return t.slug;
}

export function CompanyClientPage({
  template,
}: {
  template: PublishedInvoiceTemplate;
}) {
  const exportFileLabel = exportLabelFromTemplate(template);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <App
        storageNamespace={template.slug}
        exportFileLabel={exportFileLabel}
        organizationDisplayName={template.organizationName}
        templateConfig={template.config}
      />
    </MantineProvider>
  );
}
