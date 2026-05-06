"use client";

import { AppShell, Grid, Group, Title } from "@mantine/core";
import InvoiceForm from "./components/invoice_form";
import { PersonalFormProvider } from "./context/PersonalInfoContext";
import { CompanyFormProvider } from "./context/CompanyInfoContext";
import { BankFormProvider } from "./context/BankInfoContext";
import Preview from "./components/preview";
import { InvoiceDataProvider } from "./context/InvoiceDataContext";
import { Suspense } from "react";
import { ExportModal } from "./components/ExportModal";
import { UnsavedChangesProvider } from "./context/UnsavedChangesContext";
import { InvoiceShellProvider } from "./context/InvoiceShellContext";
import { ContractorPrivacyFooter } from "./components/ContractorPrivacyFooter";
import { AdminJumpPill } from "./components/AdminJumpPill";
import type { InvoiceTemplateConfig } from "@/lib/invoice-template";

function Main() {
  return (
    <Grid grow>
      <Grid.Col span={3}>
        <InvoiceForm />
      </Grid.Col>
      <Grid.Col span={5}>
        <Preview />
      </Grid.Col>
    </Grid>
  );
}

export default function App({
  storageNamespace,
  exportFileLabel = "Invoice",
  organizationDisplayName = "",
  templateConfig,
}: {
  storageNamespace?: string;
  exportFileLabel?: string;
  organizationDisplayName?: string;
  /** Resolved template config (omitted on legacy `/` route -> shell falls back to defaults). */
  templateConfig?: InvoiceTemplateConfig;
}) {
  return (
    <Suspense>
      <InvoiceShellProvider
        storageNamespace={storageNamespace}
        exportFileLabel={exportFileLabel}
        organizationDisplayName={organizationDisplayName}
        templateConfig={templateConfig}
      >
        <UnsavedChangesProvider>
          <InvoiceDataProvider>
            <PersonalFormProvider>
              <CompanyFormProvider
                serverCompanyDefaults={templateConfig?.company}
              >
                <BankFormProvider serverBankDefaults={templateConfig?.bank}>
                  <AppShell
                    padding="md"
                    header={{ height: 60 }}
                    footer={{ height: 36 }}
                  >
                    <AppShell.Header>
                      <Group h="100%" px="md" justify="space-between">
                        <Group gap="md">
                          <Title order={3}>RASEED</Title>
                          <AdminJumpPill />
                        </Group>
                        <ExportModal />
                      </Group>
                    </AppShell.Header>
                    <AppShell.Main>
                      <Main />
                    </AppShell.Main>
                    <AppShell.Footer>
                      <ContractorPrivacyFooter />
                    </AppShell.Footer>
                  </AppShell>
                </BankFormProvider>
              </CompanyFormProvider>
            </PersonalFormProvider>
          </InvoiceDataProvider>
        </UnsavedChangesProvider>
      </InvoiceShellProvider>
    </Suspense>
  );
}
