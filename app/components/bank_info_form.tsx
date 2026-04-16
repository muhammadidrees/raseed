"use client";

import { useEffect } from "react";
import { isNotEmpty, useForm, UseFormReturnType } from "@mantine/form";
import { TextInput, Button, Group, Stack, Accordion } from "@mantine/core";
import { BankInfo } from "../types";
import { useBankFormContext } from "../context/BankInfoContext";
import { AccordianControl } from "./AccordianControl";
import { notifications } from "@mantine/notifications";

function onFromSubmit(
  form: UseFormReturnType<BankInfo>,
  setFormData: React.Dispatch<React.SetStateAction<BankInfo>>,
) {
  console.log(form.values);
  setFormData(form.values);
  notifications.show({
    color: "green",
    title: "Bank Info Saved",
    message: "Bank Info has been saved successfully",
  });
}

export default function BankInfoAccordion() {
  const { bankFromData: formData, setFormData } = useBankFormContext();

  const form = useForm<BankInfo>({
    initialValues: formData,
    validate: {
      name: isNotEmpty("Bank Name is required"),
      accountTitle: isNotEmpty("Account Title is required"),
      iban: isNotEmpty("IBAN is required"),
      bic: isNotEmpty("BIC is required"),
    },
  });

  useEffect(() => {
    form.setValues(formData);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSaveDisabled =
    JSON.stringify(form.values) === JSON.stringify(formData);

  const isFormEmpty =
    formData.name === "" &&
    formData.accountTitle === "" &&
    formData.iban === "" &&
    formData.bic === "";

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
            <TextInput
              label="Bank Name"
              placeholder="Bank Name"
              withAsterisk
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <TextInput
              mt="md"
              label="Account Title"
              placeholder="Account Title"
              withAsterisk
              key={form.key("accountTitle")}
              {...form.getInputProps("accountTitle")}
            />
            <TextInput
              mt="md"
              label="IBAN"
              placeholder="IBAN"
              withAsterisk
              key={form.key("iban")}
              {...form.getInputProps("iban")}
            />
            <TextInput
              mt="md"
              label="BIC"
              placeholder="BIC"
              withAsterisk
              key={form.key("bic")}
              {...form.getInputProps("bic")}
            />

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
