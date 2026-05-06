"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BankInfo } from "../types";
import { storageKey } from "@/lib/storage-keys";
import { useInvoiceShell } from "./InvoiceShellContext";

interface BankInfoFormContextType {
  bankFromData: BankInfo;
  setFormData: React.Dispatch<React.SetStateAction<BankInfo>>;
}

const BankInfoFormContext = createContext<BankInfoFormContextType | undefined>(
  undefined,
);

export const useBankFormContext = () => {
  const context = useContext(BankInfoFormContext);
  if (!context) {
    throw new Error(
      "useBankFormContext must be used within a BankFormProvider",
    );
  }
  return context;
};

const isBrowser = typeof window !== "undefined";

const defaultState: BankInfo = {};

export const BankFormProvider = ({
  children,
  serverBankDefaults,
}: {
  children: ReactNode;
  /**
   * Optional pre-fill if the org template happens to ship default bank info.
   * Bank info on tenant routes is still **contractor-driven** (the contractor
   * gets paid into their own account) — the server defaults only seed the
   * form on first load when localStorage is empty. The contractor can fully
   * edit and persist over them.
   */
  serverBankDefaults?: BankInfo;
}) => {
  const { storageNamespace } = useInvoiceShell();
  const [formData, setFormData] = useState<BankInfo>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const lsKey = storageKey("bankFormData", storageNamespace);
    if (isBrowser) {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        try {
          setFormData(JSON.parse(stored) as BankInfo);
          setIsLoaded(true);
          return;
        } catch {
          console.error("Failed to parse stored bank form data");
        }
      }
    }
    if (serverBankDefaults) {
      setFormData(serverBankDefaults);
    } else {
      setFormData(defaultState);
    }
    setIsLoaded(true);
  }, [storageNamespace, serverBankDefaults]);

  useEffect(() => {
    if (!isLoaded || !isBrowser) return;
    const lsKey = storageKey("bankFormData", storageNamespace);
    localStorage.setItem(lsKey, JSON.stringify(formData));
  }, [formData, isLoaded, storageNamespace]);

  return (
    <BankInfoFormContext.Provider
      value={{ bankFromData: formData, setFormData }}
    >
      {children}
    </BankInfoFormContext.Provider>
  );
};
