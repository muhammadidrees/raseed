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
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  key: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  taxID: string;
  address: Address;
}

export interface BankInfo {
  name: string;
  accountTitle: string;
  iban: string;
  bic: string;
}

export interface CompanyInfo {
  name: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  zip: string;
}
