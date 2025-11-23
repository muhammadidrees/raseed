"use client";

import { useForm, UseFormReturnType } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  NumberInput,
  Select,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { InvoiceData } from "../types";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { IconTrash, IconCurrencyEuro } from "@tabler/icons-react";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

function onFromSubmit(
  form: UseFormReturnType<InvoiceData>,
  setFormData: React.Dispatch<React.SetStateAction<InvoiceData>>
) {
  console.log(form.getValues());
  setFormData(form.getValues());
  notifications.show({
    color: "green",
    title: "Invoice Data Saved",
    message: "Invoice Data has been saved successfully",
  });
}

export default function InvoiceDataForm() {
  const { invoiceFromData: formData, setFormData } = useInvoiceDataContext();

  const form = useForm<InvoiceData>({
    mode: "uncontrolled",
    initialValues: formData,
  });

  const fields = form.getValues().items.map((item, index) => (
    <Group key={item.key}>
      <TextInput
        placeholder="Desription"
        withAsterisk
        style={{ flex: 4 }}
        key={form.key(`items.${index}.description`)}
        {...form.getInputProps(`items.${index}.description`)}
      />

      <NumberInput
        placeholder="Qty"
        style={{ flex: 1 }}
        key={form.key(`items.${index}.quantity`)}
        {...form.getInputProps(`items.${index}.quantity`)}
      />
      <NumberInput
        placeholder="Amount"
        style={{ flex: 1 }}
        key={form.key(`items.${index}.price`)}
        {...form.getInputProps(`items.${index}.price`)}
        hideControls
        rightSection={<IconCurrencyEuro />}
      />

      <ActionIcon
        color="red"
        disabled={index === 0}
        onClick={() => form.removeListItem("items", index)}
      >
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  return (
    <form onSubmit={form.onSubmit(() => onFromSubmit(form, setFormData))}>
      <Stack>
        <MonthPickerInput
          mt="md"
          label="Invoice Date"
          placeholder="Invoice Date"
          withAsterisk
          key={form.key("date")}
          {...form.getInputProps("date")}
        />

        <Select
          mt="md"
          label="Payment Terms"
          placeholder="Select payment terms"
          description="When payment is expected"
          withAsterisk
          data={[
            { value: "due_on_receipt", label: "Due on Receipt" },
            { value: "net_15", label: "Net 15" },
            { value: "net_30", label: "Net 30" },
            { value: "net_60", label: "Net 60" },
            { value: "custom", label: "Custom" },
          ]}
          allowDeselect={false}
          key={form.key("dueTerms")}
          {...form.getInputProps("dueTerms")}
        />

        {form.getValues().dueTerms === "custom" && (
          <NumberInput
            mt="md"
            label="Custom Days"
            placeholder="Enter number of days"
            description="Number of days after invoice date"
            withAsterisk
            min={1}
            max={365}
            key={form.key("customDueDays")}
            {...form.getInputProps("customDueDays")}
          />
        )}

        {fields.length > 0 ? (
          <Group>
            <Text fw={500} size="sm">
              Invoice Items
            </Text>
          </Group>
        ) : (
          <Text c="dimmed" ta="center">
            No items added...
          </Text>
        )}

        {fields}

        <Group align="center" mb="xl" grow>
          <Button
            onClick={() =>
              form.insertListItem("items", {
                description: "",
                quantity: 1,
                price: 0,
                key: randomId(),
              })
            }
            variant="light"
          >
            Add item
          </Button>
        </Group>

        <Group align="center" mb="xl" grow>
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  );
}
