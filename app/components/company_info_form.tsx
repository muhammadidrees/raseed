"use client";

import { useEffect } from "react";
import { isNotEmpty, useForm, UseFormReturnType } from "@mantine/form";
import { TextInput, Button, Group, Stack, Accordion } from "@mantine/core";
import { CompanyInfo } from "../types";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { notifications } from "@mantine/notifications";
import { AccordianControl } from "./AccordianControl";

function onFromSubmit(
  form: UseFormReturnType<CompanyInfo>,
  setFormData: React.Dispatch<React.SetStateAction<CompanyInfo>>,
) {
  console.log(form.values);
  setFormData(form.values);
  notifications.show({
    color: "green",
    title: "Company Info Saved",
    message: "Company Info has been saved successfully",
  });
}

export default function CompanyInfoAccordion() {
  const { companyFormData: formData, setFormData } = useCompanyFormContext();

  const form = useForm<CompanyInfo>({
    initialValues: formData,
    validate: {
      name: isNotEmpty("Company Name is required"),
      address: {
        street: isNotEmpty("Street is required"),
        city: isNotEmpty("City is required"),
        zip: isNotEmpty("Zip is required"),
      },
    },
  });

  useEffect(() => {
    form.setValues(formData);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSaveDisabled =
    JSON.stringify(form.values) === JSON.stringify(formData);

  const isFormEmpty =
    formData.name === "" &&
    formData.address.street === "" &&
    formData.address.city === "" &&
    formData.address.zip === "";

  return (
    <Accordion.Item key={"Company Info"} value={"Company Info"}>
      <AccordianControl
        label={"Company Info"}
        isFormEmpty={isFormEmpty}
        isFormUnsaved={!isSaveDisabled}
      />
      <Accordion.Panel>
        <form onSubmit={form.onSubmit(() => onFromSubmit(form, setFormData))}>
          <Stack>
            <TextInput
              label="Company Name"
              placeholder="Company Name"
              withAsterisk
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <TextInput
              mt="md"
              label="Address"
              placeholder="Address"
              withAsterisk
              key={form.key("address.street")}
              {...form.getInputProps("address.street")}
            />

            <Group grow>
              <TextInput
                mt="md"
                label="City"
                placeholder="City"
                withAsterisk
                key={form.key("address.city")}
                {...form.getInputProps("address.city")}
              />
              <TextInput
                mt="md"
                label="Zip"
                placeholder="Zip"
                withAsterisk
                key={form.key("address.zip")}
                {...form.getInputProps("address.zip")}
              />
            </Group>

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
