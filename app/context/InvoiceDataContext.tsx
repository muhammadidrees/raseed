"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { InvoiceData } from "../types";
import { randomId } from "@mantine/hooks";
import { storageKey } from "@/lib/storage-keys";
import { useInvoiceShell } from "./InvoiceShellContext";

interface InvoiceDataContextProps {
  invoiceFromData: InvoiceData;
  setFormData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

const InvoiceDataContext = createContext<InvoiceDataContextProps | undefined>(
  undefined,
);

export const useInvoiceDataContext = (): InvoiceDataContextProps => {
  const context = useContext(InvoiceDataContext);
  if (!context) {
    throw new Error(
      "useInvoiceDataContext must be used within an InvoiceDataProvider",
    );
  }
  return context;
};

const isBrowser = typeof window !== "undefined";

const loadInitialState = (namespace?: string): InvoiceData => {
  try {
    if (isBrowser) {
      const storedData = localStorage.getItem(
        storageKey("invoiceData", namespace),
      );
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.date = new Date();
        parsedData.dueTerms = parsedData.dueTerms || "due_on_receipt";
        parsedData.customDueDays = parsedData.customDueDays || undefined;
        parsedData.periodStart = undefined;
        parsedData.periodEnd = undefined;
        return parsedData;
      }
    }

    return {
      date: new Date(),
      dueTerms: "due_on_receipt",
      customDueDays: undefined,
      periodStart: undefined,
      periodEnd: undefined,
      items: [
        {
          description: "",
          quantity: 1,
          price: 0,
          key: randomId(),
        },
      ],
    };
  } catch (error) {
    console.error("Error loading initial state:", error);
    return {
      date: new Date(),
      dueTerms: "due_on_receipt",
      customDueDays: undefined,
      periodStart: undefined,
      periodEnd: undefined,
      items: [
        {
          description: "",
          quantity: 1,
          price: 0,
          key: randomId(),
        },
      ],
    };
  }
};

const defaultState: InvoiceData = {
  date: new Date(0),
  dueTerms: "due_on_receipt",
  customDueDays: undefined,
  periodStart: undefined,
  periodEnd: undefined,
  items: [
    {
      description: "",
      quantity: 1,
      price: 0,
      key: randomId(),
    },
  ],
};

export const InvoiceDataProvider = ({ children }: { children: ReactNode }) => {
  const { storageNamespace } = useInvoiceShell();
  const [formData, setFormData] = useState<InvoiceData>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFormData(loadInitialState(storageNamespace));
    setIsLoaded(true);
  }, [storageNamespace]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isBrowser) {
      const dataToStore = {
        date: null,
        dueTerms: formData.dueTerms,
        customDueDays: formData.customDueDays,
        items: formData.items,
      };
      localStorage.setItem(
        storageKey("invoiceData", storageNamespace),
        JSON.stringify(dataToStore),
      );
    }
  }, [formData, isLoaded, storageNamespace]);

  return (
    <InvoiceDataContext.Provider
      value={{ invoiceFromData: formData, setFormData }}
    >
      {children}
    </InvoiceDataContext.Provider>
  );
};
