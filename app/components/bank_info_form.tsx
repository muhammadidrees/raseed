"use client";

import { useEffect } from "react";
import { isNotEmpty, useForm, UseFormReturnType } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Accordion,
  ActionIcon,
  Text,
  Divider,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { randomId } from "@mantine/hooks";
import { BankInfo } from "../types";
import { useBankFormContext } from "../context/BankInfoContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { AccordianControl } from "./AccordianControl";
import { notifications } from "@mantine/notifications";

function onFromSubmit(
  form: UseFormReturnType<BankInfo>,
  setFormData: React.Dispatch<React.SetStateAction<BankInfo>>,
) {
  // Drop any additional fields that are completely empty on save,
  // so we don't persist noise from a user who clicked "Add field" and
  // then changed their mind.
  const cleaned: BankInfo = {
    ...form.values,
    additionalFields: (form.values.additionalFields ?? []).filter(
      (f) => f.label.trim() !== "" || f.value.trim() !== "",
    ),
  };
  setFormData(cleaned);
  notifications.show({
    color: "green",
    title: "Bank Info Saved",
    message: "Bank Info has been saved successfully",
  });
}

export default function BankInfoAccordion() {
  const { bankFromData: formData, setFormData } = useBankFormContext();
  const { markUnsaved } = useUnsavedChanges();

  const form = useForm<BankInfo>({
    initialValues: {
      ...formData,
      additionalFields: formData.additionalFields ?? [],
    },
    validate: {
      name: isNotEmpty("Bank Name is required"),
      accountTitle: isNotEmpty("Account Title is required"),
      iban: isNotEmpty("IBAN is required"),
      bic: isNotEmpty("BIC is required"),
      additionalFields: {
        // Require a label whenever a value is present, so nothing lands on
        // the invoice without a heading next to it.
        label: (value, values, path) => {
          const idx = Number(path.split(".")[1]);
          const row = values.additionalFields?.[idx];
          if (row && row.value.trim() !== "" && value.trim() === "") {
            return "Label required";
          }
          return null;
        },
      },
    },
  });

  useEffect(() => {
    form.setValues({
      ...formData,
      additionalFields: formData.additionalFields ?? [],
    });
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSaveDisabled =
    JSON.stringify(form.values) ===
    JSON.stringify({
      ...formData,
      additionalFields: formData.additionalFields ?? [],
    });

  useEffect(() => {
    markUnsaved("Bank Info", !isSaveDisabled);
  }, [isSaveDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormEmpty =
    formData.name === "" &&
    formData.accountTitle === "" &&
    formData.iban === "" &&
    formData.bic === "" &&
    (formData.additionalFields?.length ?? 0) === 0;

  const additionalFields = form.values.additionalFields ?? [];

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

            <Divider
              mt="md"
              label={
                <Text size="xs" c="dimmed" fw={500}>
                  Additional details (optional)
                </Text>
              }
              labelPosition="left"
            />

            {additionalFields.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="xs">
                Add any extra payment info you want on every invoice — e.g.
                Reference, SWIFT code, PayPal, tax ID.
              </Text>
            ) : (
              additionalFields.map((field, index) => (
                <Group
                  key={field.key}
                  align="flex-start"
                  gap="xs"
                  wrap="nowrap"
                >
                  <TextInput
                    placeholder="Label (e.g. Reference)"
                    style={{ flex: 2 }}
                    key={form.key(`additionalFields.${index}.label`)}
                    {...form.getInputProps(`additionalFields.${index}.label`)}
                  />
                  <TextInput
                    placeholder="Value"
                    style={{ flex: 3 }}
                    key={form.key(`additionalFields.${index}.value`)}
                    {...form.getInputProps(`additionalFields.${index}.value`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    mt={4}
                    aria-label="Remove field"
                    onClick={() =>
                      form.removeListItem("additionalFields", index)
                    }
                  >
                    <IconTrash size="1rem" />
                  </ActionIcon>
                </Group>
              ))
            )}

            <Button
              variant="light"
              leftSection={<IconPlus size="1rem" />}
              onClick={() =>
                form.insertListItem("additionalFields", {
                  label: "",
                  value: "",
                  key: randomId(),
                })
              }
            >
              Add field
            </Button>

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
