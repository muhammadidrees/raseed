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
      "useCompanyFormContext must be used within a CompanyFormProvider"
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
      const parsedData = JSON.parse(storedData);

      return parsedData;
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

export const CompanyFormProvider = ({
  children,
  company,
}: {
  children: ReactNode;
  company?: string;
}) => {
  // If company prop is provided, use company data; otherwise load from localStorage
  const getInitialState = (): CompanyInfo => {
    if (company?.toLowerCase() === "makula") {
      return {
        name: "Makula Technology GmbH",
        address: {
          street: "c/o Mindspace Münzstr. 12",
          city: "Germany",
          zip: "10178 Berlin",
        },
      };
    }
    return loadInitialState();
  };

  const [formData, setFormData] = useState<CompanyInfo>(getInitialState());

  // Update data when company prop changes
  useEffect(() => {
    if (company?.toLowerCase() === "makula") {
      const companyData = {
        name: "Makula Technology GmbH",
        address: {
          street: "c/o Mindspace Münzstr. 12",
          city: "Germany",
          zip: "10178 Berlin",
        },
      };
      setFormData(companyData);
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
