"use client";

import {} from "@mantine/form";
import { Box, Accordion } from "@mantine/core";
import PersonalInfoFormAccordian from "./personal_info_form";
import BankInfoFormAccordian from "./bank_info_form";
import CompanyInfoAccordion from "./company_info_form";
import InvoiceDataInfoForm from "./invoice_data_form";
import { useInvoiceShell } from "../context/InvoiceShellContext";

export default function InvoiceForm() {
  const { storageNamespace, templateConfig } = useInvoiceShell();
  // On tenant routes the "Billed To" company is locked to the published
  // template (the org being invoiced is fixed). The contractor's bank
  // ("Payment Details") is editable — that's where the contractor wants to
  // be paid. The legacy `/` route exposes both forms.
  const showCompanyForm = !storageNamespace;

  // Empty bankFields list = no Payment Details on the invoice. Drop the
  // whole accordion so the contractor isn't asked for info that won't
  // be printed.
  const showBankForm = templateConfig.bankFields.length > 0;
  const showPersonalForm = templateConfig.contractorFields.length > 0;

  return (
    <Box>
      <InvoiceDataInfoForm />
      <Accordion variant="separated">
        {showPersonalForm ? <PersonalInfoFormAccordian /> : null}
        {showBankForm ? <BankInfoFormAccordian /> : null}
        {showCompanyForm ? <CompanyInfoAccordion /> : null}
      </Accordion>
    </Box>
  );
}
