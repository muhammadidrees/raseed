"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useDebouncedValue } from "@mantine/hooks";
import { Loader, Stack, Text } from "@mantine/core";
import { MyDocument } from "../preview";
import {
  type InvoiceTemplateConfig,
} from "@/lib/invoice-template";
import type {
  BankInfo,
  CompanyInfo,
  InvoiceData,
  PersonalInfo,
} from "@/app/types";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <Stack align="center" justify="center" h="100%" gap="xs">
        <Loader size="sm" />
        <Text size="xs" c="dimmed">
          Loading preview…
        </Text>
      </Stack>
    ),
  },
);

const SAMPLE_PERSONAL_BY_ID: Record<string, string> = {
  name: "Jane Contractor",
  email: "jane@example.com",
  taxID: "TAX-1234567",
  street: "42 Sample Avenue",
  city: "Berlin",
  zip: "10115",
};

const SAMPLE_BANK_BY_LEGACY_ID: Record<string, string> = {
  name: "Deutsche Bank",
  accountTitle: "Jane Contractor",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "DEUTDEFF",
};

function pickPersonal(cfg: InvoiceTemplateConfig): PersonalInfo {
  const out: PersonalInfo = {};
  for (const f of cfg.contractorFields) {
    out[f.id] =
      SAMPLE_PERSONAL_BY_ID[f.id] ?? `[Sample ${f.label}]`;
  }
  return out;
}

function buildSampleInvoice(cfg: InvoiceTemplateConfig): InvoiceData {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const dueTerms = cfg.dueTermsPresets[0]?.id ?? "custom";

  return {
    date: today,
    dueTerms,
    customDueDays: 30,
    periodStart,
    periodEnd,
    items: [
      {
        key: "sample-1",
        description: "Senior frontend engineering – sprint 1",
        quantity: 80,
        price: 75,
      },
      {
        key: "sample-2",
        description: "Project review meeting",
        quantity: 4,
        price: 75,
      },
    ],
  };
}

function buildSampleCompany(
  cfg: InvoiceTemplateConfig,
  fallbackOrgName: string,
): CompanyInfo {
  return {
    name: cfg.company.name?.trim() || fallbackOrgName || "Your Organization",
    address: {
      street: cfg.company.address.street?.trim() || "1 Business Park",
      city: cfg.company.address.city?.trim() || "Springfield",
      zip: cfg.company.address.zip?.trim() || "00000",
    },
  };
}

/**
 * Build sample bank values keyed by the template's actual bank-field ids.
 * Pre-fill from `cfg.bank` wins (admin set defaults). Otherwise we reuse the
 * legacy sample for the well-known ids and fall back to a `[Sample <label>]`
 * placeholder for any custom field the admin defined.
 */
function pickBank(cfg: InvoiceTemplateConfig): BankInfo {
  const out: BankInfo = {};
  for (const f of cfg.bankFields) {
    const prefill = cfg.bank[f.id];
    if (prefill && prefill.trim()) {
      out[f.id] = prefill;
      continue;
    }
    if (SAMPLE_BANK_BY_LEGACY_ID[f.id]) {
      out[f.id] = SAMPLE_BANK_BY_LEGACY_ID[f.id];
      continue;
    }
    out[f.id] = `[Sample ${f.label}]`;
  }
  return out;
}

/**
 * Live PDF preview of the template, fed with realistic sample contractor
 * data so admins can see how their template choices land on a real invoice.
 *
 * Updates are debounced 350ms to avoid re-rendering the PDFViewer on every
 * keystroke (which is expensive).
 */
export function TemplatePdfPreview({
  templateConfig,
  organizationName,
}: {
  templateConfig: InvoiceTemplateConfig;
  organizationName: string;
}) {
  const [debouncedConfig] = useDebouncedValue(templateConfig, 350);
  const [debouncedOrgName] = useDebouncedValue(organizationName, 350);

  const sampleInvoice = useMemo(
    () => buildSampleInvoice(debouncedConfig),
    [debouncedConfig],
  );
  const sampleCompany = useMemo(
    () => buildSampleCompany(debouncedConfig, debouncedOrgName),
    [debouncedConfig, debouncedOrgName],
  );
  const bank = useMemo(() => pickBank(debouncedConfig), [debouncedConfig]);
  const personal = useMemo(
    () => pickPersonal(debouncedConfig),
    [debouncedConfig],
  );

  return (
    <PDFViewer
      style={{ width: "100%", height: "100%", border: "none" }}
      showToolbar={false}
    >
      <MyDocument
        personalFormData={personal}
        companyFormData={sampleCompany}
        invoiceFromData={sampleInvoice}
        bankFormData={bank}
        templateConfig={debouncedConfig}
      />
    </PDFViewer>
  );
}
