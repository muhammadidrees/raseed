"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UnsavedChangesContextType {
  unsaved: Record<string, boolean>;
  markUnsaved: (key: string, isDirty: boolean) => void;
  hasAnyUnsaved: boolean;
}

const UnsavedChangesContext = createContext<
  UnsavedChangesContextType | undefined
>(undefined);

export const useUnsavedChanges = () => {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx)
    throw new Error(
      "useUnsavedChanges must be used within UnsavedChangesProvider",
    );
  return ctx;
};

export const UnsavedChangesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [unsaved, setUnsaved] = useState<Record<string, boolean>>({});

  const markUnsaved = (key: string, isDirty: boolean) => {
    setUnsaved((prev) => {
      if (prev[key] === isDirty) return prev;
      return { ...prev, [key]: isDirty };
    });
  };

  const hasAnyUnsaved = Object.values(unsaved).some(Boolean);

  return (
    <UnsavedChangesContext.Provider
      value={{ unsaved, markUnsaved, hasAnyUnsaved }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
};
