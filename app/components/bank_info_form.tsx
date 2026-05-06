"use client";

import { useEffect, useMemo } from "react";
import { isNotEmpty, useForm, type UseFormReturnType } from "@mantine/form";
import { TextInput, Button, Group, Stack, Accordion } from "@mantine/core";
import { BankInfo } from "../types";
import { useBankFormContext } from "../context/BankInfoContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import { AccordianControl } from "./AccordianControl";
import { notifications } from "@mantine/notifications";
import type { BankFieldDefinition } from "@/lib/invoice-template";

function buildValidation(fields: BankFieldDefinition[]) {
  const out: Record<string, ReturnType<typeof isNotEmpty>> = {};
  for (const f of fields) {
    if (f.required) {
      out[f.id] = isNotEmpty(`${f.label || "This field"} is required`);
    }
  }
  return out;
}

function valuesEqual(a: BankInfo, b: BankInfo, fieldIds: string[]): boolean {
  for (const id of fieldIds) {
    if ((a[id] ?? "") !== (b[id] ?? "")) return false;
  }
  return true;
}

function onFromSubmit(
  form: UseFormReturnType<BankInfo>,
  setFormData: React.Dispatch<React.SetStateAction<BankInfo>>,
) {
  setFormData(form.values);
  notifications.show({
    color: "green",
    title: "Bank Info Saved",
    message: "Bank Info has been saved successfully",
  });
}

export default function BankInfoAccordion() {
  const { bankFromData: formData, setFormData } = useBankFormContext();
  const { markUnsaved } = useUnsavedChanges();
  const { templateConfig } = useInvoiceShell();
  const fields = templateConfig.bankFields;

  const initialValues = useMemo<BankInfo>(() => {
    const out: BankInfo = {};
    for (const f of fields) out[f.id] = formData[f.id] ?? "";
    return out;
  }, [fields, formData]);

  const validation = useMemo(() => buildValidation(fields), [fields]);

  const form = useForm<BankInfo>({
    initialValues,
    validate: validation,
  });

  // Re-seed when the field set or stored values change (template edits, etc.)
  useEffect(() => {
    form.setValues(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields]);
  const isSaveDisabled = valuesEqual(form.values, formData, fieldIds);

  useEffect(() => {
    markUnsaved("Bank Info", !isSaveDisabled);
  }, [isSaveDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormEmpty = fields.some(
    (f) => f.required && !(formData[f.id] ?? "").trim(),
  );

  return (
    <Accordion.Item key={"Bank Info"} value={"Bank Info"}>
      <AccordianControl
        label={"Bank Info"}
        isFormEmpty={isFormEmpty}
        isFormUnsaved={!isSaveDisabled}
      />
      <Accordion.Panel>
        <form onSubmit={form.onSubmit(() => onFromSubmit(form, setFormData))}>
          <Stack>
            {fields.map((f, idx) => (
              <TextInput
                key={f.id}
                mt={idx === 0 ? undefined : "md"}
                label={f.label || "Untitled field"}
                placeholder={f.placeholder || f.label}
                withAsterisk={f.required}
                {...form.getInputProps(f.id)}
              />
            ))}
            <Group align="center" mt="xl" grow>
              <Button type="submit" disabled={isSaveDisabled}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
