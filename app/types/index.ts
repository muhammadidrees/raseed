export interface Invoice {
  invoiceNumber: string;
  terms: string;
  dateInfo: InvoiceDateInfo;
  personalInfo: PersonalInfo;
  companyInfo: CompanyInfo;
  items: InvoiceItem[];
}

export interface InvoiceDateInfo {
  date: string;
  dueDate: string;
  period: string;
}

export interface InvoiceData {
  date: Date;
  dueTerms: string;
  customDueDays?: number;
  periodStart?: Date;
  periodEnd?: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  key: string;
  isBonusPayout?: boolean;
}

/**
 * Contractor personal / identity fields stored by stable template field id.
 * Values keyed by `InvoiceTemplateConfig.contractorFields[].id`.
 *
 * Legacy localStorage stored `{ name, email, taxID, address: { street, city, zip } }`;
 * {@link migrateStoredPersonalInfo} flattens that shape on read.
 */
export type PersonalInfo = Record<string, string>;

/** Normalize legacy nested JSON from localStorage into flat Record<id, string>. */
export function migrateStoredPersonalInfo(raw: unknown): PersonalInfo {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  if ("address" in o && o.address && typeof o.address === "object") {
    const a = o.address as Record<string, unknown>;
    const next: PersonalInfo = {};
    if (typeof o.name === "string") next.name = o.name;
    if (typeof o.email === "string") next.email = o.email;
    if (typeof o.taxID === "string") next.taxID = o.taxID;
    if (typeof a.street === "string") next.street = a.street;
    if (typeof a.city === "string") next.city = a.city;
    if (typeof a.zip === "string") next.zip = a.zip;
    return next;
  }
  const next: PersonalInfo = {};
  for (const [k, v] of Object.entries(o)) {
    if (k === "address") continue;
    if (typeof v === "string") next[k] = v;
  }
  return next;
}

/**
 * Bank info is now a free-form `Record<fieldId, value>` so orgs can define
 * arbitrary Payment Details fields (IBAN, routing number, SWIFT, sort code,
 * Wise tag — whatever they need). The set of available field ids comes from
 * `InvoiceTemplateConfig.bankFields`.
 *
 * Legacy shapes (`{ name, accountTitle, iban, bic }`) are valid records and
 * keep working without migration because those keys are the default field ids.
 */
export type BankInfo = Record<string, string>;

export interface CompanyInfo {
  name: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  zip: string;
}
