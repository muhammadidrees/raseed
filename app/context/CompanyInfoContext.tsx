"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { CompanyInfo } from "../types";
import { storageKey } from "@/lib/storage-keys";
import { useInvoiceShell } from "./InvoiceShellContext";

interface CompanyInfoFormContextType {
  companyFormData: CompanyInfo;
  setFormData: React.Dispatch<React.SetStateAction<CompanyInfo>>;
}

const CompanyInfoFormContext = createContext<
  CompanyInfoFormContextType | undefined
>(undefined);

export const useCompanyFormContext = () => {
  const context = useContext(CompanyInfoFormContext);
  if (!context) {
    throw new Error(
      "useCompanyFormContext must be used within a CompanyFormProvider",
    );
  }
  return context;
};

const isBrowser = typeof window !== "undefined";

const defaultState: CompanyInfo = {
  name: "",
  address: {
    street: "",
    city: "",
    zip: "",
  },
};

export const CompanyFormProvider = ({
  children,
  serverCompanyDefaults,
}: {
  children: ReactNode;
  /** Payee defaults from published Supabase template (optional) */
  serverCompanyDefaults?: CompanyInfo;
}) => {
  const { storageNamespace } = useInvoiceShell();
  // On tenant routes (storageNamespace set), payee company is server-driven and
  // never persisted to localStorage; on the legacy "/" route we keep the old
  // localStorage-backed editable behavior.
  const isServerDriven = Boolean(storageNamespace);
  const [formData, setFormData] = useState<CompanyInfo>(
    isServerDriven && serverCompanyDefaults
      ? serverCompanyDefaults
      : defaultState,
  );
  const [isLoaded, setIsLoaded] = useState(isServerDriven);

  useEffect(() => {
    if (isServerDriven) {
      setFormData(serverCompanyDefaults ?? defaultState);
      setIsLoaded(true);
      return;
    }
    const lsKey = storageKey("companyFormData", storageNamespace);
    if (isBrowser) {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        try {
          setFormData(JSON.parse(stored) as CompanyInfo);
          setIsLoaded(true);
          return;
        } catch {
          console.error("Failed to parse stored company form data");
        }
      }
    }
    setFormData(defaultState);
    setIsLoaded(true);
  }, [storageNamespace, serverCompanyDefaults, isServerDriven]);

  useEffect(() => {
    if (!isLoaded || !isBrowser || isServerDriven) return;
    const lsKey = storageKey("companyFormData", storageNamespace);
    localStorage.setItem(lsKey, JSON.stringify(formData));
  }, [formData, isLoaded, storageNamespace, isServerDriven]);

  return (
    <CompanyInfoFormContext.Provider
      value={{ companyFormData: formData, setFormData }}
    >
      {children}
    </CompanyInfoFormContext.Provider>
  );
};
