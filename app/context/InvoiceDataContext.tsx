import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { InvoiceData } from "../types";
import { randomId } from "@mantine/hooks";

interface InvoiceDataContextProps {
  invoiceFromData: InvoiceData;
  setFormData: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

const InvoiceDataContext = createContext<InvoiceDataContextProps | undefined>(
  undefined
);

export const useInvoiceDataContext = (): InvoiceDataContextProps => {
  const context = useContext(InvoiceDataContext);
  if (!context) {
    throw new Error(
      "useInvoiceDataContext must be used within an InvoiceDataProvider"
    );
  }
  return context;
};

// Check if we are running in the browser
const isBrowser = typeof window !== "undefined";

const loadInitialState = (): InvoiceData => {
  try {
    if (isBrowser) {
      const storedData = localStorage.getItem("invoiceData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);

        parsedData.date = new Date();
        parsedData.dueTerms = parsedData.dueTerms || "due_on_receipt";
        parsedData.customDueDays = parsedData.customDueDays || undefined;

        return parsedData;
      }
    }

    // Default state
    return {
      date: new Date(),
      dueTerms: "due_on_receipt",
      customDueDays: undefined,
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

export const InvoiceDataProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<InvoiceData>(loadInitialState);

  useEffect(() => {
    if (isBrowser) {
      const dataToStore = {
        date: null,
        dueTerms: formData.dueTerms,
        customDueDays: formData.customDueDays,
        items: [formData.items[0]],
      };
      localStorage.setItem("invoiceData", JSON.stringify(dataToStore));
    }
  }, [formData]);

  return (
    <InvoiceDataContext.Provider
      value={{ invoiceFromData: formData, setFormData }}
    >
      {children}
    </InvoiceDataContext.Provider>
  );
};
