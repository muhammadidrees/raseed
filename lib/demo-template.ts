import {
  parseInvoiceTemplateConfig,
  type InvoiceTemplateConfig,
} from "@/lib/invoice-template";

export const DEMO_TEMPLATE_STORAGE_KEY = "raseed.demo.template";
export const DEMO_TEMPLATE_ORG_NAME_KEY = "raseed.demo.orgName";
export const DEMO_TEMPLATE_PUBLISHED_KEY = "raseed.demo.isPublished";

const ACME_DEFAULT_CONFIG: InvoiceTemplateConfig = parseInvoiceTemplateConfig({
  exportName: "Acme",
  company: {
    name: "Acme Inc",
    address: {
      street: "123 Demo Street",
      city: "Springfield",
      zip: "00000",
    },
  },
  bank: {
    name: "",
    accountTitle: "",
    iban: "",
    bic: "",
  },
  currency: { code: "USD", symbol: "$", position: "before" },
  invoiceNumberScheme: { kind: "date_mmyyyy", prefix: "INV-" },
  taxRate: 0,
  taxLabel: "Tax",
  dateFormat: "MM/dd/yyyy",
  dueTermsPresets: [
    { id: "net_15", label: "Net 15", days: 15 },
    { id: "net_30", label: "Net 30", days: 30 },
    { id: "net_60", label: "Net 60", days: 60 },
  ],
  contractorFields: [
    { id: "name", label: "Full name", required: true },
    { id: "email", label: "Email", placeholder: "you@example.com", required: false },
    { id: "taxID", label: "Tax ID", required: false },
    { id: "street", label: "Street address", required: true },
    { id: "city", label: "City", required: true },
    { id: "zip", label: "Postal code", required: true },
  ],
  businessEmail: "billing@acme.test",
});

export const ACME_DEFAULT_ORG_NAME = "Acme Inc";

export function getDemoDefaults(): {
  config: InvoiceTemplateConfig;
  orgName: string;
} {
  return {
    config: ACME_DEFAULT_CONFIG,
    orgName: ACME_DEFAULT_ORG_NAME,
  };
}

export function loadDemoTemplate(): {
  config: InvoiceTemplateConfig;
  orgName: string;
  isPublished: boolean;
} {
  if (typeof window === "undefined") {
    return {
      config: ACME_DEFAULT_CONFIG,
      orgName: ACME_DEFAULT_ORG_NAME,
      isPublished: true,
    };
  }
  let config = ACME_DEFAULT_CONFIG;
  let orgName = ACME_DEFAULT_ORG_NAME;
  let isPublished = true;
  try {
    const raw = window.localStorage.getItem(DEMO_TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      config = parseInvoiceTemplateConfig(parsed);
    }
    const storedName = window.localStorage.getItem(DEMO_TEMPLATE_ORG_NAME_KEY);
    if (storedName && storedName.trim()) orgName = storedName;
    const pubRaw = window.localStorage.getItem(DEMO_TEMPLATE_PUBLISHED_KEY);
    if (pubRaw === "false") isPublished = false;
  } catch {
    // Fall back to defaults
  }
  return { config, orgName, isPublished };
}

export function saveDemoTemplate(args: {
  config: InvoiceTemplateConfig;
  orgName: string;
  isPublished: boolean;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEMO_TEMPLATE_STORAGE_KEY,
    JSON.stringify(args.config),
  );
  window.localStorage.setItem(DEMO_TEMPLATE_ORG_NAME_KEY, args.orgName);
  window.localStorage.setItem(
    DEMO_TEMPLATE_PUBLISHED_KEY,
    args.isPublished ? "true" : "false",
  );
}

export function resetDemoTemplate(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_TEMPLATE_STORAGE_KEY);
  window.localStorage.removeItem(DEMO_TEMPLATE_ORG_NAME_KEY);
  window.localStorage.removeItem(DEMO_TEMPLATE_PUBLISHED_KEY);
}
