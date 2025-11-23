"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import dynamic from "next/dynamic";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { BankInfo, CompanyInfo, InvoiceData, PersonalInfo } from "../types";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { useEffect, useState } from "react";
import { useBankFormContext } from "../context/BankInfoContext";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
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
    marginRight: 10, // Add spacing between columns
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
    width: "38%", // Restrict the width to less than half the page
    marginLeft: "auto", // Push the section to the right corner
    marginBottom: 10, // Add some space below
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2, // Minimal vertical spacing
  },
  detailLabel: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "left", // Align label to the left within the row
  },
  detailValue: {
    flex: 2,
    textAlign: "right", // Align value to the right within the row
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
    width: "80%", // Set a fixed width
    wordWrap: "break-word", // Allow text to wrap within the fixed width
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
    bottom: 60, // Adjust this value as needed to position above footer
    left: 40,
    right: 40,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9", // Subtle light background
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2, // Reduced vertical spacing between rows
  },
  paymentLabel: {
    fontWeight: "bold",
    flex: 1, // Label takes 1 unit of space
    textAlign: "left", // Ensure labels are left-aligned
  },
  paymentValue: {
    flex: 2, // Value takes 2 units of space
    textAlign: "right", // Ensure values are right-aligned
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8, // Reduced margin for a tighter feel
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

function MyDocument({
  companyFormData,
  personalFormData,
  invoiceFromData,
  bankFormData,
}: {
  companyFormData: CompanyInfo;
  personalFormData: PersonalInfo;
  invoiceFromData: InvoiceData;
  bankFormData: BankInfo;
}) {
  // Helper function to format dates
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate due date based on payment terms
  const calculateDueDate = (
    invoiceDate: Date,
    dueTerms: string,
    customDays?: number
  ): Date => {
    const dueDate = new Date(invoiceDate);

    switch (dueTerms) {
      case "due_on_receipt":
        return dueDate;
      case "net_15":
        dueDate.setDate(dueDate.getDate() + 15);
        return dueDate;
      case "net_30":
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate;
      case "net_60":
        dueDate.setDate(dueDate.getDate() + 60);
        return dueDate;
      case "custom":
        if (customDays) {
          dueDate.setDate(dueDate.getDate() + customDays);
        }
        return dueDate;
      default:
        return dueDate;
    }
  };

  // Get payment terms label for display
  const getPaymentTermsLabel = (
    dueTerms: string,
    customDays?: number
  ): string => {
    switch (dueTerms) {
      case "due_on_receipt":
        return "Due on Receipt";
      case "net_15":
        return "Net 15";
      case "net_30":
        return "Net 30";
      case "net_60":
        return "Net 60";
      case "custom":
        return customDays ? `Net ${customDays}` : "Custom";
      default:
        return "Due on Receipt";
    }
  };

  // Calculate invoice number based on month/year
  const generateInvoiceNumber = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year
    return `00${month}${year}`;
  };

  // Generate the invoice period
  const generateInvoicePeriod = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return `${formatDate(startOfMonth)} - ${formatDate(endOfMonth)}`;
  };

  // Calculate Subtotal and Total
  const subtotal = invoiceFromData.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const taxRate = 0; // Update as necessary
  const tax = subtotal * (taxRate / 100);
  const total = (subtotal + tax) * 1.0;

  return (
    <Document title="Invoice">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              #{generateInvoiceNumber(invoiceFromData.date)}
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
                    invoiceFromData.customDueDays
                  )
                )}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Period:</Text>
              <Text style={styles.detailValue}>
                {generateInvoicePeriod(invoiceFromData.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Terms:</Text>
              <Text style={styles.detailValue}>
                {getPaymentTermsLabel(
                  invoiceFromData.dueTerms,
                  invoiceFromData.customDueDays
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
          </View>
          <View style={styles.column}>
            <Text style={styles.title}>From:</Text>
            <Text style={styles.text}>{personalFormData.name}</Text>
            <Text style={styles.text}>Tax# {personalFormData.taxID}</Text>
            <Text style={styles.text}>{personalFormData.email}</Text>
            <Text style={styles.address}>
              {personalFormData.address.street}
            </Text>
            <Text style={styles.text}>
              {personalFormData.address.city}, {personalFormData.address.zip}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellDescription}>Description</Text>
            <Text style={styles.tableCell}>Rate (€)</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCell}>Line Total (€)</Text>
          </View>

          {/* Table Rows */}
          {invoiceFromData.items.map((item) => (
            <View key={item.key} style={styles.tableRow}>
              <Text style={styles.tableCellDescription}>
                {item.description}
              </Text>
              <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Subtotal and Total Rows */}
          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Subtotal</Text>
            <Text style={styles.totalCellValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          {taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.tableCellDescription}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.totalCellLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.totalCellValue}>{tax.toFixed(2)} €</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Total</Text>
            <Text style={styles.totalCellValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Payment Details at the Bottom */}
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentTitle}>Payment Details:</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Bank Name:</Text>
            <Text style={styles.paymentValue}>{bankFormData.name}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account Title:</Text>
            <Text style={styles.paymentValue}>{bankFormData.accountTitle}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>IBAN:</Text>
            <Text style={styles.paymentValue}>{bankFormData.iban}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>BIC:</Text>
            <Text style={styles.paymentValue}>{bankFormData.bic}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Amount due: {total.toFixed(2)} €{"\n"}
          Thank you for your business! Payment is{" "}
          {invoiceFromData.dueTerms === "due_on_receipt"
            ? "due upon receipt of this invoice"
            : `due within ${
                invoiceFromData.dueTerms === "custom" &&
                invoiceFromData.customDueDays
                  ? invoiceFromData.customDueDays
                  : invoiceFromData.dueTerms.replace("net_", "")
              } days of invoice date`}
          .
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

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, [invoiceFromData]);

  if (!isReady) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div style={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <PDFViewer style={{ flex: 1 }}>
        <MyDocument
          personalFormData={personalFormData}
          companyFormData={companyFormData}
          invoiceFromData={invoiceFromData}
          bankFormData={bankFromData}
        />
      </PDFViewer>
    </div>
  );
}

export default function Preview() {
  return <PdfView />;
}
