/** Namespace localStorage keys per company slug; omit namespace for legacy home `/` keys. */
export function storageKey(base: string, namespace?: string): string {
  if (!namespace) return base;
  return `${base}:${namespace}`;
}

/**
 * Bases of all localStorage keys the contractor form writes to. Used by the
 * "Clear my data" affordance.
 */
export const CONTRACTOR_STORAGE_BASES = [
  "personalFormData",
  "bankFormData",
  "companyFormData",
  "invoiceData",
] as const;

/** Remove every contractor-form key for the given namespace (or legacy `/`). */
export function clearContractorStorage(namespace?: string): void {
  if (typeof window === "undefined") return;
  for (const base of CONTRACTOR_STORAGE_BASES) {
    window.localStorage.removeItem(storageKey(base, namespace));
  }
}
