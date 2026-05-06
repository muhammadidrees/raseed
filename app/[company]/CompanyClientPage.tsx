"use client";

import { AppTheme } from "@/app/components/AppTheme";
import App from "../app";
import type { PublishedInvoiceTemplate } from "@/lib/invoice-template";

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
    <AppTheme>
      <App
        storageNamespace={template.slug}
        exportFileLabel={exportFileLabel}
        organizationDisplayName={template.organizationName}
        templateConfig={template.config}
      />
    </AppTheme>
  );
}
