import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { PersonalInfo } from "../types";

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
      "usePersonalFormContext must be used within a PersonalFormProvider"
    );
  }
  return context;
};

// Check if we are running in the browser
const isBrowser = typeof window !== "undefined";

// Load initial state from localStorage
const loadInitialState = (): PersonalInfo => {
  if (isBrowser) {
    const storedData = localStorage.getItem("personalFormData");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error("Failed to parse stored personal form data:", error);
      }
    }
  }

  return {
    name: "",
    email: "",
    taxID: "",
    address: {
      street: "",
      city: "",
      zip: "",
    },
  };
};

export const PersonalFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<PersonalInfo>(loadInitialState);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem("personalFormData", JSON.stringify(formData));
    }
  }, [formData]);

  return (
    <PersonalInfoFormContext.Provider
      value={{ personalFormData: formData, setFormData }}
    >
      {children}
    </PersonalInfoFormContext.Provider>
  );
};
