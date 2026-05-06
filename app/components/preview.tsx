"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import dynamic from "next/dynamic";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { BankInfo, CompanyInfo, InvoiceData, PersonalInfo } from "../types";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { useEffect, useState } from "react";
import { useBankFormContext } from "../context/BankInfoContext";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import {
  formatCurrencyAmount,
  formatTemplateDate,
  generateInvoiceNumber,
  type InvoiceTemplateConfig,
} from "@/lib/invoice-template";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  },
);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  invoiceNumber: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "bold",
  },
  invoiceDetails: {
    textAlign: "right",
    fontSize: 11,
    width: "38%",
    marginLeft: "auto",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  detailLabel: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
  detailValue: {
    flex: 2,
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
  },
  address: {
    marginBottom: 4,
    fontSize: 11,
    width: "80%",
    wordWrap: "break-word",
  },
  table: {
    width: "100%",
    marginVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    textAlign: "center",
  },
  tableCellDescription: {
    flex: 3,
    padding: 5,
    textAlign: "left",
  },
  tableCellLineTotal: {
    flex: 1,
    padding: 5,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    borderTopWidth: 1,
    borderColor: "#000000",
  },
  totalCellLabel: {
    flex: 1,
    padding: 5,
    fontWeight: "bold",
    textAlign: "right",
  },
  totalCellValue: {
    flex: 1,
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  paymentDetails: {
    position: "absolute",
    bottom: 60,
    left: 40,
    right: 40,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  paymentLabel: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
  paymentValue: {
    flex: 2,
    textAlign: "right",
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
});

export function MyDocument({
  companyFormData,
  personalFormData,
  invoiceFromData,
  bankFormData,
  templateConfig,
}: {
  companyFormData: CompanyInfo;
  personalFormData: PersonalInfo;
  invoiceFromData: InvoiceData;
  bankFormData: BankInfo;
  templateConfig: InvoiceTemplateConfig;
}) {
  const { currency, invoiceNumberScheme, taxRate, taxLabel, dateFormat } =
    templateConfig;

  const formatDate = (date: Date) => formatTemplateDate(date, dateFormat);
  const formatAmount = (n: number) => formatCurrencyAmount(n, currency);

  const calculateDueDate = (
    invoiceDate: Date,
    dueTerms: string,
    customDays?: number,
  ): Date => {
    const dueDate = new Date(invoiceDate);
    if (dueTerms === "custom") {
      if (customDays) dueDate.setDate(dueDate.getDate() + customDays);
      return dueDate;
    }
    const preset = templateConfig.dueTermsPresets.find((p) => p.id === dueTerms);
    if (preset) {
      dueDate.setDate(dueDate.getDate() + preset.days);
    }
    return dueDate;
  };

  const getPaymentTermsLabel = (
    dueTerms: string,
    customDays?: number,
  ): string => {
    if (dueTerms === "custom") return customDays ? `Net ${customDays}` : "Custom";
    const preset = templateConfig.dueTermsPresets.find((p) => p.id === dueTerms);
    return preset?.label ?? "Due on Receipt";
  };

  const subtotal = invoiceFromData.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Footer "due within X days" copy
  const dueTermsCopy = (() => {
    const t = invoiceFromData.dueTerms;
    if (t === "custom") {
      return invoiceFromData.customDueDays
        ? `due within ${invoiceFromData.customDueDays} days of invoice date`
        : "due as agreed";
    }
    const preset = templateConfig.dueTermsPresets.find((p) => p.id === t);
    if (!preset) return "due as agreed";
    if (preset.days === 0) return "due upon receipt of this invoice";
    return `due within ${preset.days} days of invoice date`;
  })();

  return (
    <Document title="Invoice">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              #{generateInvoiceNumber(invoiceFromData.date, invoiceNumberScheme)}
            </Text>
          </View>
          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Issued Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(invoiceFromData.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(
                  calculateDueDate(
                    invoiceFromData.date,
                    invoiceFromData.dueTerms,
                    invoiceFromData.customDueDays,
                  ),
                )}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Period:</Text>
              <Text style={styles.detailValue}>
                {(() => {
                  const date = invoiceFromData.date;
                  if (
                    invoiceFromData.periodStart &&
                    invoiceFromData.periodEnd
                  ) {
                    return `${formatDate(invoiceFromData.periodStart)} - ${formatDate(invoiceFromData.periodEnd)}`;
                  }
                  const startOfMonth = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1,
                  );
                  const endOfMonth = new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    0,
                  );
                  return `${formatDate(startOfMonth)} - ${formatDate(endOfMonth)}`;
                })()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Terms:</Text>
              <Text style={styles.detailValue}>
                {getPaymentTermsLabel(
                  invoiceFromData.dueTerms,
                  invoiceFromData.customDueDays,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Billed To and From in a Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.title}>Billed To:</Text>
            <Text style={styles.text}>{companyFormData.name}</Text>
            <Text style={styles.address}>{companyFormData.address.street}</Text>
            <Text style={styles.text}>
              {companyFormData.address.zip}, {companyFormData.address.city}
            </Text>
            {templateConfig.businessEmail && templateConfig.showBusinessEmail ? (
              <Text style={styles.text}>{templateConfig.businessEmail}</Text>
            ) : null}
          </View>
          <View style={styles.column}>
            <Text style={styles.title}>From:</Text>
            {templateConfig.contractorFields.map((field) => {
              const raw = (personalFormData[field.id] ?? "").trim();
              if (!raw) return null;
              const text =
                field.id === "taxID" ? `Tax# ${raw}` : raw;
              return (
                <Text key={field.id} style={styles.text}>
                  {text}
                </Text>
              );
            })}
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellDescription}>Description</Text>
            <Text style={styles.tableCell}>Rate ({currency.symbol})</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCellLineTotal}>
              Line Total ({currency.symbol})
            </Text>
          </View>

          {invoiceFromData.items.map((item) => {
            const description = item.isBonusPayout
              ? `Bonus Payout - ${new Date(invoiceFromData.date).toLocaleString("default", { month: "long" })}`
              : item.description;
            return (
              <View key={item.key} style={styles.tableRow}>
                <Text style={styles.tableCellDescription}>{description}</Text>
                <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCellLineTotal}>
                  {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Subtotal</Text>
            <Text style={styles.tableCellLineTotal}>{formatAmount(subtotal)}</Text>
          </View>
          {taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.tableCellDescription}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.totalCellLabel}>
                {taxLabel ?? "Tax"} ({taxRate}%)
              </Text>
              <Text style={styles.tableCellLineTotal}>{formatAmount(tax)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Total</Text>
            <Text style={styles.tableCellLineTotal}>{formatAmount(total)}</Text>
          </View>
        </View>

        {templateConfig.bankFields.length > 0 ? (
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentTitle}>Payment Details:</Text>
            {templateConfig.bankFields.map((field) => {
              const value = bankFormData[field.id] ?? "";
              if (!value && !field.required) return null;
              return (
                <View key={field.id} style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>{field.label}:</Text>
                  <Text style={styles.paymentValue}>{value}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <Text style={styles.footer}>
          Amount due: {formatAmount(total)}
          {"\n"}
          Thank you for your business! Payment is {dueTermsCopy}.
        </Text>
      </Page>
    </Document>
  );
}

export function PdfView() {
  const { companyFormData } = useCompanyFormContext();
  const { personalFormData } = usePersonalFormContext();
  const { invoiceFromData } = useInvoiceDataContext();
  const { bankFromData } = useBankFormContext();
  const { templateConfig } = useInvoiceShell();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, [invoiceFromData]);

  if (!isReady) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div style={{ height: "90vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }} showToolbar={false}>
        <MyDocument
          personalFormData={personalFormData}
          companyFormData={companyFormData}
          invoiceFromData={invoiceFromData}
          bankFormData={bankFromData}
          templateConfig={templateConfig}
        />
      </PDFViewer>
    </div>
  );
}

export default function Preview() {
  return <PdfView />;
}
