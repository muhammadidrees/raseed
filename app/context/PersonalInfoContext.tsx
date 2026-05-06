"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { migrateStoredPersonalInfo, type PersonalInfo } from "../types";
import { storageKey } from "@/lib/storage-keys";
import { useInvoiceShell } from "./InvoiceShellContext";

interface PersonalInfoFormContextType {
  personalFormData: PersonalInfo;
  setFormData: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}

const PersonalInfoFormContext = createContext<
  PersonalInfoFormContextType | undefined
>(undefined);

export const usePersonalFormContext = () => {
  const context = useContext(PersonalInfoFormContext);
  if (!context) {
    throw new Error(
      "usePersonalFormContext must be used within a PersonalFormProvider",
    );
  }
  return context;
};

const isBrowser = typeof window !== "undefined";

const defaultState: PersonalInfo = {};

export const PersonalFormProvider = ({ children }: { children: ReactNode }) => {
  const { storageNamespace } = useInvoiceShell();
  const [formData, setFormData] = useState<PersonalInfo>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const lsKey = storageKey("personalFormData", storageNamespace);
    if (isBrowser) {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        try {
          const parsed: unknown = JSON.parse(stored);
          setFormData(migrateStoredPersonalInfo(parsed));
          setIsLoaded(true);
          return;
        } catch {
          console.error("Failed to parse stored personal form data");
        }
      }
    }
    setFormData(defaultState);
    setIsLoaded(true);
  }, [storageNamespace]);

  useEffect(() => {
    if (!isLoaded || !isBrowser) return;
    const lsKey = storageKey("personalFormData", storageNamespace);
    localStorage.setItem(lsKey, JSON.stringify(formData));
  }, [formData, isLoaded, storageNamespace]);

  return (
    <PersonalInfoFormContext.Provider
      value={{ personalFormData: formData, setFormData }}
    >
      {children}
    </PersonalInfoFormContext.Provider>
  );
};
