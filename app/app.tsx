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

export default function App({ company }: { company?: string }) {
  return (
    <Suspense>
      <UnsavedChangesProvider>
        <InvoiceDataProvider>
          <PersonalFormProvider>
            <CompanyFormProvider company={company}>
              <BankFormProvider>
                <AppShell padding="md" header={{ height: 60 }}>
                  <AppShell.Header>
                    <Group h="100%" px="md" justify="space-between">
                      <Title order={3}>RASEED</Title>
                      <ExportModal />
                    </Group>
                  </AppShell.Header>
                  <AppShell.Main>
                    <Main />
                  </AppShell.Main>
                </AppShell>
              </BankFormProvider>
            </CompanyFormProvider>
          </PersonalFormProvider>
        </InvoiceDataProvider>
      </UnsavedChangesProvider>
    </Suspense>
  );
}
