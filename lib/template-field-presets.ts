import type { TemplateFieldDefinition } from "@/lib/invoice-template";

function cloneFields(fields: TemplateFieldDefinition[]): TemplateFieldDefinition[] {
  return fields.map((f) => ({
    id: f.id,
    label: f.label,
    required: f.required,
    ...(f.placeholder?.trim() ? { placeholder: f.placeholder.trim() } : {}),
  }));
}

/** EU-style contractor identity — matches legacy Makula keys for localStorage. */
export const PRESET_CONTRACTOR_EU_STANDARD: TemplateFieldDefinition[] = [
  {
    id: "name",
    label: "Full name",
    placeholder: "Jane Contractor",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    id: "taxID",
    label: "Tax ID / VAT number",
    placeholder: "Optional",
    required: false,
  },
  {
    id: "street",
    label: "Street address",
    placeholder: "Street and number",
    required: true,
  },
  {
    id: "city",
    label: "City",
    placeholder: "Berlin",
    required: true,
  },
  {
    id: "zip",
    label: "Postal code",
    placeholder: "10115",
    required: true,
  },
];

/** Minimal — name + email only. */
export const PRESET_CONTRACTOR_LIGHT: TemplateFieldDefinition[] = [
  {
    id: "name",
    label: "Full name",
    placeholder: "Jane Contractor",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
];

/** Classic EU IBAN block — same ids as legacy bank localStorage. */
export const PRESET_BANK_EU_IBAN: TemplateFieldDefinition[] = [
  {
    id: "name",
    label: "Bank name",
    placeholder: "e.g. Deutsche Bank",
    required: true,
  },
  {
    id: "accountTitle",
    label: "Account title",
    placeholder: "Account holder name",
    required: true,
  },
  { id: "iban", label: "IBAN", placeholder: "DE89 …", required: true },
  { id: "bic", label: "BIC / SWIFT", placeholder: "DEUTDEFF", required: true },
];

/** US ACH-style — new ids (contractors start fresh for these keys). */
export const PRESET_BANK_US_ACH: TemplateFieldDefinition[] = [
  {
    id: "routing",
    label: "Routing number (ABA)",
    placeholder: "9 digits",
    required: true,
  },
  {
    id: "account",
    label: "Account number",
    placeholder: "",
    required: true,
  },
  {
    id: "bankName",
    label: "Bank name",
    placeholder: "Optional",
    required: false,
  },
];

/** UK-style — sort code + account number. */
export const PRESET_BANK_UK: TemplateFieldDefinition[] = [
  { id: "name", label: "Bank name", required: true },
  { id: "accountTitle", label: "Account holder name", required: true },
  {
    id: "sortCode",
    label: "Sort code",
    placeholder: "12-34-56",
    required: true,
  },
  {
    id: "accountNumber",
    label: "Account number",
    required: true,
  },
];

export function clonePreset(
  preset: TemplateFieldDefinition[],
): TemplateFieldDefinition[] {
  return cloneFields(preset);
}
