"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import {
  DEFAULT_INVOICE_TEMPLATE_CONFIG,
  type InvoiceTemplateConfig,
} from "@/lib/invoice-template";

export interface InvoiceShellContextValue {
  /** When set, localStorage keys are suffixed for this tenant slug */
  storageNamespace: string | undefined;
  /** Short segment for default PDF filename */
  exportFileLabel: string;
  organizationDisplayName: string;
  /** Resolved template config (server template on tenant routes, defaults on `/`) */
  templateConfig: InvoiceTemplateConfig;
}

const InvoiceShellContext = createContext<InvoiceShellContextValue | undefined>(
  undefined,
);

export const InvoiceShellProvider = ({
  children,
  storageNamespace,
  exportFileLabel,
  organizationDisplayName,
  templateConfig,
}: {
  storageNamespace: string | undefined;
  exportFileLabel: string;
  organizationDisplayName: string;
  templateConfig?: InvoiceTemplateConfig;
  children: ReactNode;
}) => {
  const value = useMemo<InvoiceShellContextValue>(
    () => ({
      storageNamespace,
      exportFileLabel,
      organizationDisplayName,
      templateConfig: templateConfig ?? DEFAULT_INVOICE_TEMPLATE_CONFIG,
    }),
    [storageNamespace, exportFileLabel, organizationDisplayName, templateConfig],
  );

  return (
    <InvoiceShellContext.Provider value={value}>
      {children}
    </InvoiceShellContext.Provider>
  );
};

export const useInvoiceShell = (): InvoiceShellContextValue => {
  const ctx = useContext(InvoiceShellContext);
  if (!ctx) {
    throw new Error("useInvoiceShell must be used within InvoiceShellProvider");
  }
  return ctx;
};
