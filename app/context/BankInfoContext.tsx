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

const defaultState: BankInfo = {
  name: "",
  accountTitle: "",
  iban: "",
  bic: "",
};

export const BankFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<BankInfo>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after mount to avoid SSR/client hydration mismatch
  useEffect(() => {
    setFormData(loadInitialState());
    setIsLoaded(true);
  }, []);

  // Save formData to localStorage only after real data has loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (isBrowser) {
      localStorage.setItem("bankFormData", JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  return (
    <BankInfoFormContext.Provider
      value={{ bankFromData: formData, setFormData }}
    >
      {children}
    </BankInfoFormContext.Provider>
  );
};
