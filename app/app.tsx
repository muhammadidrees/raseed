"use client";

import { AppShell, Badge, Grid, Group, Text } from "@mantine/core";
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
import { BrandWordmark } from "./components/Brand";
import type { InvoiceTemplateConfig } from "@/lib/invoice-template";

function Main() {
  return (
    <Grid grow gap={0} align="stretch">
      <Grid.Col
        span={{ base: 12, md: 5 }}
        style={{
          // Hairline divider between the form (left rail) and the document
          // canvas (right). Only show on >=md, since on small screens the
          // columns stack and a vertical line would be wrong.
          borderRight: "1px solid var(--raseed-hairline)",
          paddingRight: "var(--mantine-spacing-md)",
        }}
        className="raseed-form-rail"
      >
        <InvoiceForm />
      </Grid.Col>
      <Grid.Col
        span={{ base: 12, md: 7 }}
        style={{
          // Soft inset so the PDF reads as "the document on the workspace",
          // not floating against the form.
          paddingLeft: "var(--mantine-spacing-md)",
        }}
      >
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
                    footer={{ height: 40 }}
                  >
                    <AppShell.Header
                      style={{
                        background: "rgba(255,255,255,0.78)",
                        backdropFilter: "saturate(180%) blur(14px)",
                        WebkitBackdropFilter: "saturate(180%) blur(14px)",
                        borderBottom: "1px solid var(--raseed-hairline)",
                      }}
                    >
                      <Group h="100%" px="md" justify="space-between">
                        <Group gap="md" wrap="nowrap">
                          <BrandWordmark size={26} />
                          {organizationDisplayName ? (
                            <>
                              <Text c="dimmed" size="sm">
                                /
                              </Text>
                              <Text fw={600} size="sm">
                                {organizationDisplayName}
                              </Text>
                            </>
                          ) : (
                            <Badge variant="light" color="gray" size="sm">
                              Generic
                            </Badge>
                          )}
                          <AdminJumpPill />
                        </Group>
                        <ExportModal />
                      </Group>
                    </AppShell.Header>
                    <AppShell.Main>
                      <Main />
                    </AppShell.Main>
                    <AppShell.Footer
                      style={{
                        background: "var(--raseed-surface)",
                        borderTop: "1px solid var(--raseed-hairline)",
                      }}
                    >
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
