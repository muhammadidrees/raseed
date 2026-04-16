"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { CompanyInfo } from "../types";

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

// Check if we are running in the browser
const isBrowser = typeof window !== "undefined";

const loadInitialState = (): CompanyInfo => {
  if (isBrowser) {
    const storedData = localStorage.getItem("companyFormData");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error("Failed to parse stored company form data:", error);
      }
    }
  }

  return {
    name: "",
    address: {
      street: "",
      city: "",
      zip: "",
    },
  };
};

const defaultState: CompanyInfo = {
  name: "",
  address: {
    street: "",
    city: "",
    zip: "",
  },
};

const makulaState: CompanyInfo = {
  name: "Makula Technology GmbH",
  address: {
    street: "c/o Mindspace Münzstr. 12",
    city: "Germany",
    zip: "10178 Berlin",
  },
};

export const CompanyFormProvider = ({
  children,
  company,
}: {
  children: ReactNode;
  company?: string;
}) => {
  const [formData, setFormData] = useState<CompanyInfo>(defaultState);

  // Load the correct data after mount to avoid SSR/client hydration mismatch
  useEffect(() => {
    if (company?.toLowerCase() === "makula") {
      setFormData(makulaState);
    } else {
      setFormData(loadInitialState());
    }
  }, [company]);

  // Save formData to localStorage only when no company prop is provided
  useEffect(() => {
    if (!company && isBrowser) {
      localStorage.setItem("companyFormData", JSON.stringify(formData));
    }
  }, [formData, company]);

  return (
    <CompanyInfoFormContext.Provider
      value={{ companyFormData: formData, setFormData }}
    >
      {children}
    </CompanyInfoFormContext.Provider>
  );
};
