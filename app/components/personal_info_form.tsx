"use client";

import { useEffect, useMemo } from "react";
import { isNotEmpty, useForm, type UseFormReturnType } from "@mantine/form";
import { TextInput, Button, Group, Stack, Accordion } from "@mantine/core";
import type { PersonalInfo } from "../types";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import { AccordianControl } from "./AccordianControl";
import { notifications } from "@mantine/notifications";
import type { TemplateFieldDefinition } from "@/lib/invoice-template";

function buildValidation(fields: TemplateFieldDefinition[]) {
  const out: Record<string, ReturnType<typeof isNotEmpty>> = {};
  for (const f of fields) {
    if (f.required) {
      out[f.id] = isNotEmpty(`${f.label || "Field"} is required`);
    }
  }
  return out;
}

function valuesEqual(
  a: PersonalInfo,
  b: PersonalInfo,
  fieldIds: string[],
): boolean {
  for (const id of fieldIds) {
    if ((a[id] ?? "").trim() !== (b[id] ?? "").trim()) return false;
  }
  return true;
}

function onFromSubmit(
  form: UseFormReturnType<PersonalInfo>,
  setFormData: React.Dispatch<React.SetStateAction<PersonalInfo>>,
) {
  setFormData(form.values);
  notifications.show({
    color: "green",
    title: "Personal Info Saved",
    message: "Personal Info has been saved successfully",
  });
}

export default function PersonalInfoAccordian() {
  const { personalFormData: formData, setFormData } = usePersonalFormContext();
  const { markUnsaved } = useUnsavedChanges();
  const { templateConfig } = useInvoiceShell();
  const fields = templateConfig.contractorFields;

  const initialValues = useMemo<PersonalInfo>(() => {
    const out: PersonalInfo = {};
    for (const f of fields) out[f.id] = formData[f.id] ?? "";
    return out;
  }, [fields, formData]);

  const validation = useMemo(() => buildValidation(fields), [fields]);

  const form = useForm<PersonalInfo>({
    initialValues,
    validate: validation,
  });

  useEffect(() => {
    form.setValues(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields]);
  const isSaveDisabled = valuesEqual(form.values, formData, fieldIds);

  useEffect(() => {
    markUnsaved("Personal Info", !isSaveDisabled);
  }, [isSaveDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormEmpty = fields.some(
    (f) => f.required && !(formData[f.id] ?? "").trim(),
  );

  return (
    <Accordion.Item key={"Personal Info"} value={"Personal Info"}>
      <AccordianControl
        label={"Personal Info"}
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
                label={f.label || "Field"}
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
