import type { BankInfo, CompanyInfo } from "@/app/types";

export type CurrencyConfig = {
  /** ISO 4217 code, e.g. "EUR", "USD", "GBP", "PKR" */
  code: string;
  /** Symbol shown in PDF + form, e.g. "€", "$" */
  symbol: string;
  /** Whether to render the symbol before or after the amount */
  position: "before" | "after";
};

export type InvoiceNumberScheme =
  /** "00MMYY" – Makula-style (with optional prefix override) */
  | { kind: "date_mmyy"; prefix?: string }
  /** "MMYYYY" */
  | { kind: "date_mmyyyy"; prefix?: string }
  /** "YYYYMM" */
  | { kind: "date_yyyymm"; prefix?: string }
  /** "YYMM" */
  | { kind: "date_yymm"; prefix?: string }
  /** Custom pattern: substitutes {yyyy} {yy} {mm} {dd} from invoice date. */
  | { kind: "custom"; pattern: string };

export type DateFormat = "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";

export type DueTermsPreset = {
  /** Stable id used in the invoice form value (e.g. "net_30"). Must be unique. */
  id: string;
  /** Human label rendered to contractors and on PDF. */
  label: string;
  /** Days after invoice date. 0 = due on receipt. */
  days: number;
};

export type ContractorFieldVisibility = "required" | "optional" | "hidden";

/**
 * Ordered custom field on the contractor invoice form (personal block or payment block).
 * Same shape everywhere — only the template key differs (`contractorFields` vs `bankFields`).
 */
export type TemplateFieldDefinition = {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
};

/** @deprecated Use TemplateFieldDefinition — kept as alias for readability in payment context */
export type BankFieldDefinition = TemplateFieldDefinition;

/**
 * A predefined line-item description (and optional default price) the
 * contractor can pick from a dropdown when filling the invoice. When the
 * list is empty, the contractor sees a free-text input as before.
 */
export type ItemPreset = {
  description: string;
  /** Optional default unit price; pre-fills the row's price when this preset is selected. */
  price?: number;
};

export interface InvoiceTemplateConfig {
  /** Payee company shown to contractor and printed on PDF. */
  company: CompanyInfo;
  /** Payee bank shown to contractor and printed on PDF. */
  bank: BankInfo;
  /** Short label for default PDF filename, e.g. "Makula" */
  exportName?: string;
  /** Currency for line totals, subtotals, and PDF labels. */
  currency: CurrencyConfig;
  /** How the invoice number is generated from the invoice date. */
  invoiceNumberScheme: InvoiceNumberScheme;
  /** Tax rate applied to subtotal (0 = no tax row shown). */
  taxRate: number;
  /** Optional VAT label shown next to the tax row, e.g. "VAT". */
  taxLabel?: string;
  /** Date format used in PDF for issue / due dates. */
  dateFormat: DateFormat;
  /** Selectable payment-terms presets. */
  dueTermsPresets: DueTermsPreset[];
  /**
   * When true (default), the contractor's payment-terms select includes a
   * “Custom” option that lets them type any number of days. When false,
   * they can only pick from `dueTermsPresets`.
   */
  allowCustomDueTerms: boolean;
  /**
   * Allowed line-item descriptions. Empty = contractor types anything (legacy
   * behavior). When non-empty, the description field becomes a dropdown of
   * these options. If `allowCustomItemDescriptions` is also true, the
   * dropdown is type-ahead and accepts free text alongside suggestions.
   */
  itemPresets: ItemPreset[];
  /** When false and `itemPresets` is non-empty, contractors must pick from the list. Default true. */
  allowCustomItemDescriptions: boolean;
  /**
   * Ordered contractor identity/contact fields (shown under “Personal Info” and printed under From on the PDF).
   * Same shape as `bankFields`. Empty = hide Personal Info block entirely.
   */
  contractorFields: TemplateFieldDefinition[];
  /**
   * Ordered list of custom Payment Details fields the contractor fills on
   * the live form. Empty array = no Payment Details on the invoice.
   */
  bankFields: TemplateFieldDefinition[];
  /** Optional business contact email printed under "Billed To" on the PDF. */
  businessEmail?: string;
  /**
   * When false, suppresses the `businessEmail` line on the PDF even if filled.
   * Lets admins keep the email in the template (for their records / future
   * email-helper features) without printing it on every contractor invoice.
   * Defaults to true. Has no effect when `businessEmail` is empty.
   */
  showBusinessEmail: boolean;
}

const emptyAddress = { street: "", city: "", zip: "" };

const emptyCompany: CompanyInfo = {
  name: "",
  address: { ...emptyAddress },
};

const emptyBank: BankInfo = {};

export const DEFAULT_DUE_TERMS_PRESETS: DueTermsPreset[] = [
  { id: "due_on_receipt", label: "Due on Receipt", days: 0 },
  { id: "net_15", label: "Net 15", days: 15 },
  { id: "net_30", label: "Net 30", days: 30 },
  { id: "net_60", label: "Net 60", days: 60 },
];

export const DEFAULT_CONTRACTOR_FORM_FIELDS: TemplateFieldDefinition[] = [
  { id: "name", label: "Contractor name", required: true },
  { id: "email", label: "Email", required: true },
  { id: "taxID", label: "Tax ID / CNIC", required: true },
  { id: "street", label: "Street address", required: true },
  { id: "city", label: "City", required: true },
  { id: "zip", label: "Zip / Postal code", required: true },
];

/**
 * Defaults match the original Makula 4-field shape, all required, so
 * existing templates without `bankFields` set preserve the previous
 * validation behavior. The ids match the legacy `BankInfo` keys
 * (`name`/`accountTitle`/`iban`/`bic`) so existing contractor localStorage
 * keeps mapping through correctly.
 */
export const DEFAULT_BANK_FIELDS: TemplateFieldDefinition[] = [
  { id: "name", label: "Bank name", required: true },
  { id: "accountTitle", label: "Account title", required: true },
  { id: "iban", label: "IBAN", required: true },
  { id: "bic", label: "BIC", required: true },
];

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  position: "after",
};

export const DEFAULT_INVOICE_NUMBER_SCHEME: InvoiceNumberScheme = {
  kind: "date_mmyy",
  prefix: "00",
};

export const DEFAULT_DATE_FORMAT: DateFormat = "dd/MM/yyyy";

/** Default config for legacy `/` route + brand-new templates that haven't been saved yet. */
export const DEFAULT_INVOICE_TEMPLATE_CONFIG: InvoiceTemplateConfig = {
  company: { ...emptyCompany },
  bank: { ...emptyBank },
  currency: { ...DEFAULT_CURRENCY },
  invoiceNumberScheme: { ...DEFAULT_INVOICE_NUMBER_SCHEME },
  taxRate: 0,
  dateFormat: DEFAULT_DATE_FORMAT,
  dueTermsPresets: DEFAULT_DUE_TERMS_PRESETS.map((p) => ({ ...p })),
  allowCustomDueTerms: true,
  itemPresets: [],
  allowCustomItemDescriptions: true,
  contractorFields: DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f })),
  bankFields: DEFAULT_BANK_FIELDS.map((f) => ({ ...f })),
  showBusinessEmail: true,
};

const VALID_FIELD_VISIBILITIES = new Set<ContractorFieldVisibility>([
  "required",
  "optional",
  "hidden",
]);

const VALID_DATE_FORMATS = new Set<DateFormat>([
  "dd/MM/yyyy",
  "MM/dd/yyyy",
  "yyyy-MM-dd",
]);

function parseCurrency(raw: unknown): CurrencyConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CURRENCY };
  const o = raw as Record<string, unknown>;
  const code =
    typeof o.code === "string" && o.code.trim()
      ? o.code.trim()
      : DEFAULT_CURRENCY.code;
  const symbol =
    typeof o.symbol === "string" && o.symbol
      ? o.symbol
      : DEFAULT_CURRENCY.symbol;
  const position: CurrencyConfig["position"] =
    o.position === "before" ? "before" : "after";
  return { code, symbol, position };
}

function parseInvoiceNumberScheme(raw: unknown): InvoiceNumberScheme {
  if (!raw || typeof raw !== "object")
    return { ...DEFAULT_INVOICE_NUMBER_SCHEME };
  const o = raw as Record<string, unknown>;
  const kind = o.kind;
  const prefix = typeof o.prefix === "string" ? o.prefix : undefined;
  if (kind === "date_mmyy") return { kind, prefix };
  if (kind === "date_mmyyyy") return { kind, prefix };
  if (kind === "date_yyyymm") return { kind, prefix };
  if (kind === "date_yymm") return { kind, prefix };
  if (kind === "custom" && typeof o.pattern === "string" && o.pattern.trim()) {
    return { kind: "custom", pattern: o.pattern };
  }
  return { ...DEFAULT_INVOICE_NUMBER_SCHEME };
}

function parseDueTermsPresets(raw: unknown): DueTermsPreset[] {
  if (!Array.isArray(raw) || raw.length === 0)
    return DEFAULT_DUE_TERMS_PRESETS.map((p) => ({ ...p }));
  const presets: DueTermsPreset[] = [];
  const seenIds = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : `term_${presets.length}`;
    if (seenIds.has(id)) continue;
    const label =
      typeof o.label === "string" && o.label.trim() ? o.label.trim() : id;
    const daysRaw = typeof o.days === "number" ? o.days : Number(o.days);
    const days =
      Number.isFinite(daysRaw) && daysRaw >= 0 ? Math.floor(daysRaw) : 0;
    presets.push({ id, label, days });
    seenIds.add(id);
  }
  if (presets.length === 0)
    return DEFAULT_DUE_TERMS_PRESETS.map((p) => ({ ...p }));
  return presets;
}

function parseFieldVisibility(raw: unknown): ContractorFieldVisibility | null {
  if (typeof raw !== "string") return null;
  return VALID_FIELD_VISIBILITIES.has(raw as ContractorFieldVisibility)
    ? (raw as ContractorFieldVisibility)
    : null;
}

const LEGACY_CONTRACTOR_LABELS: Record<string, string> = {
  name: "Contractor name",
  email: "Email",
  taxID: "Tax ID / CNIC",
  street: "Street address",
  city: "City",
  zip: "Zip / Postal code",
};

const LEGACY_BANK_LABELS: Record<string, string> = {
  name: "Bank name",
  accountTitle: "Account title",
  iban: "IBAN",
  bic: "BIC",
};

function parseContractorFormFields(raw: unknown): TemplateFieldDefinition[] {
  if (raw == null) return DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f }));

  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    const out: TemplateFieldDefinition[] = [];
    const seenIds = new Set<string>();
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : null;
      if (!id || seenIds.has(id)) continue;
      const label =
        typeof o.label === "string" && o.label.trim()
          ? o.label.trim()
          : (LEGACY_CONTRACTOR_LABELS[id] ?? id);
      const placeholder =
        typeof o.placeholder === "string" && o.placeholder.trim()
          ? o.placeholder.trim()
          : undefined;
      const required = Boolean(o.required);
      out.push({ id, label, required, placeholder });
      seenIds.add(id);
    }
    return out.length > 0
      ? out
      : DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f }));
  }

  // Legacy visibility map
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const order = ["name", "email", "taxID", "street", "city", "zip"] as const;
    const out: TemplateFieldDefinition[] = [];
    let sawAnyVisibilityKey = false;
    for (const id of order) {
      if (o[id] !== undefined && o[id] !== null) sawAnyVisibilityKey = true;
      const v = parseFieldVisibility(o[id]);
      if (!v || v === "hidden") continue;
      out.push({
        id,
        label: LEGACY_CONTRACTOR_LABELS[id] ?? id,
        required: v === "required",
      });
    }
    if (!sawAnyVisibilityKey && out.length === 0) {
      return DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f }));
    }
    return out;
  }

  return DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f }));
}

function parseBankFields(raw: unknown): TemplateFieldDefinition[] {
  if (raw == null) return DEFAULT_BANK_FIELDS.map((f) => ({ ...f }));

  // New shape: ordered array of custom field definitions
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    const out: TemplateFieldDefinition[] = [];
    const seenIds = new Set<string>();
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : null;
      if (!id || seenIds.has(id)) continue;
      const label =
        typeof o.label === "string" && o.label.trim()
          ? o.label.trim()
          : (LEGACY_BANK_LABELS[id] ?? id);
      const placeholder =
        typeof o.placeholder === "string" && o.placeholder.trim()
          ? o.placeholder.trim()
          : undefined;
      const required = Boolean(o.required);
      out.push({ id, label, required, placeholder });
      seenIds.add(id);
    }
    return out.length > 0 ? out : DEFAULT_BANK_FIELDS.map((f) => ({ ...f }));
  }

  // Legacy shape: visibility object `{ name: "required" | "optional" | "hidden", ... }`
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const order: Array<keyof typeof LEGACY_BANK_LABELS> = [
      "name",
      "accountTitle",
      "iban",
      "bic",
    ];
    const out: TemplateFieldDefinition[] = [];
    let sawAnyVisibilityKey = false;
    for (const id of order) {
      if (o[id] !== undefined && o[id] !== null) sawAnyVisibilityKey = true;
      const v = parseFieldVisibility(o[id]);
      if (!v || v === "hidden") continue;
      out.push({
        id,
        label: LEGACY_BANK_LABELS[id],
        required: v === "required",
      });
    }
    if (!sawAnyVisibilityKey && out.length === 0) {
      return DEFAULT_BANK_FIELDS.map((f) => ({ ...f }));
    }
    return out;
  }

  return DEFAULT_BANK_FIELDS.map((f) => ({ ...f }));
}

function parseDateFormat(raw: unknown): DateFormat {
  if (typeof raw === "string" && VALID_DATE_FORMATS.has(raw as DateFormat)) {
    return raw as DateFormat;
  }
  return DEFAULT_DATE_FORMAT;
}

function parseItemPresets(raw: unknown): ItemPreset[] {
  if (!Array.isArray(raw)) return [];
  const out: ItemPreset[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const description =
      typeof o.description === "string" ? o.description.trim() : "";
    if (!description) continue;
    const priceRaw = typeof o.price === "number" ? o.price : Number(o.price);
    const price =
      Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : undefined;
    out.push(price === undefined ? { description } : { description, price });
  }
  return out;
}

export function parseInvoiceTemplateConfig(
  raw: unknown,
): InvoiceTemplateConfig {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_INVOICE_TEMPLATE_CONFIG,
      company: { ...emptyCompany },
      bank: { ...emptyBank },
      currency: { ...DEFAULT_CURRENCY },
      invoiceNumberScheme: { ...DEFAULT_INVOICE_NUMBER_SCHEME },
      dueTermsPresets: DEFAULT_DUE_TERMS_PRESETS.map((p) => ({ ...p })),
      itemPresets: [],
      contractorFields: DEFAULT_CONTRACTOR_FORM_FIELDS.map((f) => ({ ...f })),
      bankFields: DEFAULT_BANK_FIELDS.map((f) => ({ ...f })),
    };
  }
  const o = raw as Record<string, unknown>;
  const companyRaw = o.company as Record<string, unknown> | undefined;
  const addrRaw = companyRaw?.address as Record<string, unknown> | undefined;
  const bankRaw = o.bank as Record<string, unknown> | undefined;

  const company: CompanyInfo = {
    name: typeof companyRaw?.name === "string" ? companyRaw.name : "",
    address: {
      street: typeof addrRaw?.street === "string" ? addrRaw.street : "",
      city: typeof addrRaw?.city === "string" ? addrRaw.city : "",
      zip: typeof addrRaw?.zip === "string" ? addrRaw.zip : "",
    },
  };

  const bank: BankInfo = {};
  if (bankRaw && typeof bankRaw === "object") {
    for (const [k, v] of Object.entries(bankRaw)) {
      if (typeof v === "string") bank[k] = v;
    }
  }

  const exportName =
    typeof o.exportName === "string" && o.exportName.trim()
      ? o.exportName.trim()
      : undefined;

  const currency = parseCurrency(o.currency);
  const invoiceNumberScheme = parseInvoiceNumberScheme(o.invoiceNumberScheme);

  const taxRateRaw =
    typeof o.taxRate === "number" ? o.taxRate : Number(o.taxRate);
  const taxRate =
    Number.isFinite(taxRateRaw) && taxRateRaw >= 0 ? taxRateRaw : 0;
  const taxLabel =
    typeof o.taxLabel === "string" && o.taxLabel.trim()
      ? o.taxLabel.trim()
      : undefined;

  const dateFormat = parseDateFormat(o.dateFormat);
  const dueTermsPresets = parseDueTermsPresets(o.dueTermsPresets);
  const allowCustomDueTerms =
    typeof o.allowCustomDueTerms === "boolean" ? o.allowCustomDueTerms : true;
  const itemPresets = parseItemPresets(o.itemPresets);
  const allowCustomItemDescriptions =
    typeof o.allowCustomItemDescriptions === "boolean"
      ? o.allowCustomItemDescriptions
      : true;
  const contractorFields = parseContractorFormFields(o.contractorFields);
  const bankFields = parseBankFields(o.bankFields);

  const businessEmail =
    typeof o.businessEmail === "string" && o.businessEmail.trim()
      ? o.businessEmail.trim()
      : undefined;
  const showBusinessEmail =
    typeof o.showBusinessEmail === "boolean" ? o.showBusinessEmail : true;

  return {
    company,
    bank,
    exportName,
    currency,
    invoiceNumberScheme,
    taxRate,
    taxLabel,
    dateFormat,
    dueTermsPresets,
    allowCustomDueTerms,
    itemPresets,
    allowCustomItemDescriptions,
    contractorFields,
    bankFields,
    businessEmail,
    showBusinessEmail,
  };
}

export interface PublishedInvoiceTemplate {
  slug: string;
  organizationName: string;
  config: InvoiceTemplateConfig;
}

/** Format an amount using a CurrencyConfig (decimals fixed at 2 for invoice display). */
export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyConfig,
): string {
  const num = amount.toFixed(2);
  return currency.position === "before"
    ? `${currency.symbol}${num}`
    : `${num} ${currency.symbol}`;
}

/** Format a Date using a DateFormat string. */
export function formatTemplateDate(date: Date, format: DateFormat): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  switch (format) {
    case "MM/dd/yyyy":
      return `${mm}/${dd}/${yyyy}`;
    case "yyyy-MM-dd":
      return `${yyyy}-${mm}-${dd}`;
    case "dd/MM/yyyy":
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}

/** Generate the invoice number for a date using the configured scheme. */
export function generateInvoiceNumber(
  date: Date,
  scheme: InvoiceNumberScheme,
): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const yy = yyyy.slice(-2);
  switch (scheme.kind) {
    case "date_mmyy":
      return `${scheme.prefix ?? ""}${mm}${yy}`;
    case "date_mmyyyy":
      return `${scheme.prefix ?? ""}${mm}${yyyy}`;
    case "date_yyyymm":
      return `${scheme.prefix ?? ""}${yyyy}${mm}`;
    case "date_yymm":
      return `${scheme.prefix ?? ""}${yy}${mm}`;
    case "custom":
      return scheme.pattern
        .replace(/\{yyyy\}/g, yyyy)
        .replace(/\{yy\}/g, yy)
        .replace(/\{mm\}/g, mm)
        .replace(/\{dd\}/g, dd);
    default:
      return `${mm}${yy}`;
  }
}
