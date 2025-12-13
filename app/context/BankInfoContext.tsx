import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BankInfo } from "../types";

interface BankInfoFormContextType {
  bankFromData: BankInfo;
  setFormData: React.Dispatch<React.SetStateAction<BankInfo>>;
}

const BankInfoFormContext = createContext<BankInfoFormContextType | undefined>(
  undefined
);

export const useBankFormContext = () => {
  const context = useContext(BankInfoFormContext);
  if (!context) {
    throw new Error(
      "useBankFormContext must be used within a BankFormProvider"
    );
  }
  return context;
};

// Check if we are running in the browser
const isBrowser = typeof window !== "undefined";

// Load initial state from localStorage
const loadInitialState = (): BankInfo => {
  if (isBrowser) {
    const storedData = localStorage.getItem("bankFormData");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error("Failed to parse stored bank form data:", error);
      }
    }
  }

  return {
    name: "",
    accountTitle: "",
    iban: "",
    bic: "",
  };
};

export const BankFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<BankInfo>(loadInitialState);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem("bankFormData", JSON.stringify(formData));
    }
  }, [formData]);

  return (
    <BankInfoFormContext.Provider
      value={{ bankFromData: formData, setFormData }}
    >
      {children}
    </BankInfoFormContext.Provider>
  );
};
