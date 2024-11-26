"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import dynamic from "next/dynamic";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { useBankFormContext } from "../context/BankInfoContext";
import { Box, Center, Stepper } from "@mantine/core";
import { Text as MantineText } from "@mantine/core";
import { BankInfo, CompanyInfo, PersonalInfo } from "../types";

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
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  invoiceDetails: {
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
    marginBottom: 4,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
});

function MyDocument({
  companyFormData,
  personalFormData,
  bankFromData,
}: {
  companyFormData: CompanyInfo;
  personalFormData: PersonalInfo;
  bankFromData: BankInfo;
}) {
  return (
    <Document title="Invoice">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Invoice</Text>
          <View style={styles.invoiceDetails}>
            <Text>Invoice #AB2324-01</Text>
            <Text>Issued: 01 Aug, 2023</Text>
            <Text>Due: 15 Aug, 2023</Text>
          </View>
        </View>

        {/* Billed To and From */}
        <View style={styles.section}>
          <Text style={styles.title}>Billed To:</Text>
          <Text style={styles.text}>{companyFormData.name}</Text>
          <Text style={styles.text}>{companyFormData.address.street}</Text>
          <Text style={styles.text}>{companyFormData.address.city}</Text>
          <Text style={styles.text}>{companyFormData.address.zip}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>From:</Text>
          <Text style={styles.text}>{personalFormData.name}</Text>
          <Text style={styles.text}>{personalFormData.taxID}</Text>
          <Text style={styles.text}>{personalFormData.email}</Text>
          <Text style={styles.text}>{personalFormData.address.street}</Text>
          <Text style={styles.text}>{personalFormData.address.city}</Text>
          <Text style={styles.text}>{personalFormData.address.zip}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellDescription}>Description</Text>
            <Text style={styles.tableCell}>Rate</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCell}>Line Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellDescription}>Service Name</Text>
            <Text style={styles.tableCell}>$100.00</Text>
            <Text style={styles.tableCell}>2</Text>
            <Text style={styles.tableCell}>$200.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellDescription}>Service Name</Text>
            <Text style={styles.tableCell}>$100.00</Text>
            <Text style={styles.tableCell}>2</Text>
            <Text style={styles.tableCell}>$200.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Subtotal</Text>
            <Text style={styles.totalCellValue}>$400.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.tableCellDescription}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.totalCellLabel}>Total</Text>
            <Text style={styles.totalCellValue}>$400.00</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Amount due: US$ 400.00{"\n"}
          Thank you for your business! Payment is due upon receipt of this
          invoice.
        </Text>
      </Page>
    </Document>
  );
}

export function PdfView() {
  const { companyFormData } = useCompanyFormContext();
  const { personalFormData } = usePersonalFormContext();
  const { bankFromData } = useBankFormContext();

  return (
    <div style={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <PDFViewer style={{ flex: 1 }}>
        <MyDocument
          personalFormData={personalFormData}
          companyFormData={companyFormData}
          bankFromData={bankFromData}
        />
      </PDFViewer>
    </div>
  );
}

export default function Preview() {
  const { companyFormData } = useCompanyFormContext();
  const { personalFormData } = usePersonalFormContext();
  const { bankFromData } = useBankFormContext();

  const isCompanyFormEmpty =
    companyFormData.name === "" &&
    companyFormData.address.street === "" &&
    companyFormData.address.city === "" &&
    companyFormData.address.zip === "";

  const isPersonalFormEmpty =
    personalFormData.name === "" ||
    personalFormData.email === "" ||
    personalFormData.taxID === "" ||
    personalFormData.address.street === "" ||
    personalFormData.address.city === "" ||
    personalFormData.address.zip === "";

  const isBankFormEmpty =
    bankFromData.name === "" &&
    bankFromData.accountTitle === "" &&
    bankFromData.iban === "" &&
    bankFromData.bic === "";

  const showPreview =
    !isCompanyFormEmpty && !isPersonalFormEmpty && !isBankFormEmpty;

  const active = isPersonalFormEmpty ? 0 : isBankFormEmpty ? 1 : 2;

  return showPreview ? (
    <PdfView />
  ) : (
    <Center h="85vh">
      <Box>
        <MantineText mb="xl" size="xl" c="red">
          Please complete all the steps to preview the invoice!
        </MantineText>

        <Stepper active={active} orientation="vertical">
          <Stepper.Step
            label="Step 1"
            description="Complete & Save Personal Information"
          />
          <Stepper.Step
            label="Step 2"
            description="Complete & Save Bank Info"
          />
          <Stepper.Step
            label="Step 3"
            description="Complete & Save Company Info"
          />
        </Stepper>
      </Box>
    </Center>
  );
}
