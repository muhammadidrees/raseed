import type { BankInfo, CompanyInfo } from "@/app/types";
import {
  type CurrencyConfig,
  type DateFormat,
  type DueTermsPreset,
  type InvoiceNumberScheme,
  type InvoiceTemplateConfig,
  type TemplateFieldDefinition,
} from "@/lib/invoice-template";

export type TemplateFormShape = {
  orgName: string;
  exportName: string;
  company: CompanyInfo;
  bank: BankInfo;
  isPublished: boolean;
  currency: CurrencyConfig;
  invoiceNumberKind: InvoiceNumberScheme["kind"];
  invoiceNumberPrefix: string;
  invoiceNumberPattern: string;
  taxRate: number | string;
  taxLabel: string;
  dateFormat: DateFormat;
  dueTermsPresets: DueTermsPreset[];
  contractorFields: TemplateFieldDefinition[];
  bankFields: TemplateFieldDefinition[];
  businessEmail: string;
  showBusinessEmail: boolean;
};

export const COMMON_CURRENCIES: {
  value: string;
  label: string;
  symbol: string;
}[] = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "PKR", label: "Pakistani Rupee (Rs)", symbol: "Rs" },
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "AED", label: "UAE Dirham (AED)", symbol: "AED" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" },
  { value: "CAD", label: "Canadian Dollar ($)", symbol: "$" },
  { value: "AUD", label: "Australian Dollar ($)", symbol: "$" },
  { value: "SGD", label: "Singapore Dollar ($)", symbol: "$" },
];

function sanitizeFieldList(
  fields: TemplateFieldDefinition[],
): TemplateFieldDefinition[] {
  return fields
    .filter((f) => f.id.trim() && f.label.trim())
    .map((f) => ({
      id: f.id.trim(),
      label: f.label.trim(),
      required: Boolean(f.required),
      ...(f.placeholder?.trim()
        ? { placeholder: f.placeholder.trim() }
        : {}),
    }));
}

export function configToForm(
  cfg: InvoiceTemplateConfig,
  orgName: string,
  isPublished: boolean,
): TemplateFormShape {
  return {
    orgName,
    exportName: cfg.exportName ?? "",
    company: cfg.company,
    bank: cfg.bank,
    isPublished,
    currency: { ...cfg.currency },
    invoiceNumberKind: cfg.invoiceNumberScheme.kind,
    invoiceNumberPrefix:
      cfg.invoiceNumberScheme.kind !== "custom"
        ? (cfg.invoiceNumberScheme.prefix ?? "")
        : "",
    invoiceNumberPattern:
      cfg.invoiceNumberScheme.kind === "custom"
        ? cfg.invoiceNumberScheme.pattern
        : "",
    taxRate: cfg.taxRate,
    taxLabel: cfg.taxLabel ?? "",
    dateFormat: cfg.dateFormat,
    dueTermsPresets: cfg.dueTermsPresets.map((p) => ({ ...p })),
    contractorFields: cfg.contractorFields.map((f) => ({
      ...f,
      placeholder: f.placeholder ?? "",
    })),
    bankFields: cfg.bankFields.map((f) => ({
      ...f,
      placeholder: f.placeholder ?? "",
    })),
    businessEmail: cfg.businessEmail ?? "",
    showBusinessEmail: cfg.showBusinessEmail,
  };
}

export function formToConfig(form: TemplateFormShape): InvoiceTemplateConfig {
  const taxRateNum =
    typeof form.taxRate === "number" ? form.taxRate : Number(form.taxRate || 0);

  let invoiceNumberScheme: InvoiceNumberScheme;
  if (form.invoiceNumberKind === "custom") {
    invoiceNumberScheme = {
      kind: "custom",
      pattern: form.invoiceNumberPattern.trim() || "{mm}{yy}",
    };
  } else {
    invoiceNumberScheme = {
      kind: form.invoiceNumberKind,
      prefix: form.invoiceNumberPrefix.trim() || undefined,
    };
  }

  return {
    company: form.company,
    bank: form.bank,
    exportName: form.exportName.trim() || undefined,
    currency: { ...form.currency },
    invoiceNumberScheme,
    taxRate:
      Number.isFinite(taxRateNum) && taxRateNum >= 0 ? taxRateNum : 0,
    taxLabel: form.taxLabel.trim() || undefined,
    dateFormat: form.dateFormat,
    dueTermsPresets: form.dueTermsPresets
      .filter((p) => p.id.trim() && p.label.trim())
      .map((p) => ({
        id: p.id.trim(),
        label: p.label.trim(),
        days:
          Number.isFinite(p.days) && p.days >= 0 ? Math.floor(p.days) : 0,
      })),
    contractorFields: sanitizeFieldList(form.contractorFields),
    bankFields: sanitizeFieldList(form.bankFields),
    businessEmail: form.businessEmail.trim() || undefined,
    showBusinessEmail: form.showBusinessEmail,
  };
}
