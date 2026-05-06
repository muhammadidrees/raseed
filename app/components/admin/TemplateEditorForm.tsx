"use client";

import {
  ActionIcon,
  Button,
  Checkbox,
  Code,
  Divider,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import {
  DEFAULT_DATE_FORMAT,
  type DateFormat,
  type InvoiceNumberScheme,
} from "@/lib/invoice-template";
import {
  PRESET_BANK_EU_IBAN,
  PRESET_BANK_UK,
  PRESET_BANK_US_ACH,
  PRESET_CONTRACTOR_EU_STANDARD,
  PRESET_CONTRACTOR_LIGHT,
} from "@/lib/template-field-presets";
import { COMMON_CURRENCIES, type TemplateFormShape } from "./template-form-helpers";
import { TemplateFieldListEditor } from "./TemplateFieldListEditor";

const CONTRACTOR_FIELD_PRESETS = [
  {
    label: "EU · Full identity",
    fields: PRESET_CONTRACTOR_EU_STANDARD,
  },
  {
    label: "Light · Name + email",
    fields: PRESET_CONTRACTOR_LIGHT,
  },
  { label: "None · hide block", fields: [] },
];

const BANK_FIELD_PRESETS = [
  { label: "EU · IBAN + BIC", fields: PRESET_BANK_EU_IBAN },
  { label: "US · ACH", fields: PRESET_BANK_US_ACH },
  { label: "UK · Sort code + account", fields: PRESET_BANK_UK },
  { label: "None · hide block", fields: [] },
];

export function TemplateEditorForm({
  form,
  showPublishToggle = true,
}: {
  form: UseFormReturnType<TemplateFormShape>;
  /** When false, the "Published" checkbox is hidden (used by the demo editor). */
  showPublishToggle?: boolean;
}) {
  const handleCurrencyCodeChange = (code: string | null) => {
    if (!code) return;
    const known = COMMON_CURRENCIES.find((c) => c.value === code);
    form.setFieldValue("currency.code", code);
    if (known) {
      form.setFieldValue("currency.symbol", known.symbol);
    }
  };

  const addPreset = () => {
    form.insertListItem("dueTermsPresets", {
      id: `term_${form.values.dueTermsPresets.length + 1}`,
      label: "",
      days: 0,
    });
  };

  return (
    <Paper withBorder p="md">
      <Stack gap="md">
        <TextInput
          label="Organization display name"
          {...form.getInputProps("orgName")}
        />
        <TextInput
          label="Export PDF label (short)"
          description="Used in default download filename"
          {...form.getInputProps("exportName")}
        />
        <Stack gap={6}>
          <TextInput
            label="Business contact email"
            description='Auto-fills the "To:" field in the contractor&apos;s export dialog so they can email the invoice straight to your billing address.'
            placeholder="billing@example.com"
            {...form.getInputProps("businessEmail")}
          />
          <Checkbox
            label='Also print this email under "Billed To" on the invoice PDF'
            description="When unchecked, the email still pre-fills the export dialog but doesn&apos;t appear on the printed invoice."
            disabled={!form.values.businessEmail.trim()}
            {...form.getInputProps("showBusinessEmail", { type: "checkbox" })}
          />
        </Stack>

        <Divider />
        <Title order={5}>Currency</Title>
        <Group grow align="flex-end">
          <Select
            label="Currency code"
            data={COMMON_CURRENCIES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            value={form.values.currency.code}
            onChange={handleCurrencyCodeChange}
            searchable
            allowDeselect={false}
          />
          <TextInput
            label="Symbol"
            description="Override the symbol if needed"
            {...form.getInputProps("currency.symbol")}
          />
          <Select
            label="Symbol position"
            data={[
              { value: "before", label: "Before amount ($100)" },
              { value: "after", label: "After amount (100 €)" },
            ]}
            value={form.values.currency.position}
            onChange={(v) =>
              form.setFieldValue(
                "currency.position",
                v === "before" ? "before" : "after",
              )
            }
            allowDeselect={false}
          />
        </Group>

        <Divider />
        <Title order={5}>Invoice number</Title>
        <Radio.Group
          label="Scheme"
          description="How the invoice number is generated from the invoice date"
          value={form.values.invoiceNumberKind}
          onChange={(v) =>
            form.setFieldValue(
              "invoiceNumberKind",
              v as InvoiceNumberScheme["kind"],
            )
          }
        >
          <Stack gap="xs" mt="xs">
            <Radio value="date_mmyy" label="MM + YY (e.g. 0526)" />
            <Radio value="date_mmyyyy" label="MM + YYYY (e.g. 052026)" />
            <Radio value="date_yyyymm" label="YYYY + MM (e.g. 202605)" />
            <Radio value="date_yymm" label="YY + MM (e.g. 2605)" />
            <Radio value="custom" label="Custom pattern" />
          </Stack>
        </Radio.Group>
        {form.values.invoiceNumberKind !== "custom" ? (
          <TextInput
            label="Prefix"
            description='Optional string prepended to the number (e.g. "INV-" or "00")'
            placeholder='e.g. "INV-"'
            {...form.getInputProps("invoiceNumberPrefix")}
          />
        ) : (
          <TextInput
            label="Pattern"
            description='Use {yyyy}, {yy}, {mm}, {dd} as placeholders. Example: "INV-{yyyy}-{mm}"'
            placeholder="INV-{yyyy}-{mm}"
            {...form.getInputProps("invoiceNumberPattern")}
          />
        )}

        <Divider />
        <Title order={5}>Tax</Title>
        <Group grow>
          <NumberInput
            label="Tax rate (%)"
            description="0 = no tax row on invoice"
            min={0}
            max={100}
            decimalScale={2}
            {...form.getInputProps("taxRate")}
          />
          <TextInput
            label="Tax label"
            description='Optional. e.g. "VAT" or "GST"'
            placeholder="Tax"
            {...form.getInputProps("taxLabel")}
          />
        </Group>

        <Divider />
        <Title order={5}>Date format</Title>
        <Select
          label="Date format on PDF"
          data={[
            { value: "dd/MM/yyyy", label: "31/12/2026" },
            { value: "MM/dd/yyyy", label: "12/31/2026" },
            { value: "yyyy-MM-dd", label: "2026-12-31" },
          ]}
          value={form.values.dateFormat}
          onChange={(v) =>
            form.setFieldValue(
              "dateFormat",
              (v as DateFormat) ?? DEFAULT_DATE_FORMAT,
            )
          }
          allowDeselect={false}
        />

        <Divider />
        <Title order={5}>Payment terms</Title>
        <Text size="xs" c="dimmed">
          Define the options the contractor can pick from. &ldquo;Custom&rdquo;
          is always available as an extra fallback.
        </Text>
        <Stack gap="xs">
          {form.values.dueTermsPresets.map((_preset, idx) => (
            <Group key={idx} grow align="flex-end">
              <TextInput
                label={idx === 0 ? "ID" : undefined}
                description={
                  idx === 0 ? "Stable identifier (no spaces)" : undefined
                }
                placeholder="net_30"
                {...form.getInputProps(`dueTermsPresets.${idx}.id`)}
              />
              <TextInput
                label={idx === 0 ? "Label" : undefined}
                description={idx === 0 ? "Shown in form + PDF" : undefined}
                placeholder="Net 30"
                {...form.getInputProps(`dueTermsPresets.${idx}.label`)}
              />
              <NumberInput
                label={idx === 0 ? "Days" : undefined}
                description={idx === 0 ? "0 = due on receipt" : undefined}
                min={0}
                max={365}
                {...form.getInputProps(`dueTermsPresets.${idx}.days`)}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => form.removeListItem("dueTermsPresets", idx)}
                disabled={form.values.dueTermsPresets.length <= 1}
                aria-label="Remove preset"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button
            variant="light"
            leftSection={<IconPlus size={14} />}
            size="xs"
            onClick={addPreset}
            w="fit-content"
          >
            Add preset
          </Button>
        </Stack>

        <Divider />
        <TemplateFieldListEditor
          form={form}
          listKey="contractorFields"
          title="Contractor identity (Personal Info)"
          description={
            "Define every question contractors answer before invoicing you — labels and placeholders are yours. Same stable-field rules as payment details: the internal id never changes unless you delete and recreate a row. Reorder rows by dragging the grip handle (keyboard: focus the handle, then arrow keys)."
          }
          presets={CONTRACTOR_FIELD_PRESETS}
          emptyHint="No fields — the Personal Info accordion is hidden on the contractor app."
        />

        <Divider />
        <Title order={5}>&ldquo;Billed To&rdquo; company on invoice</Title>
        <Text size="xs" c="dimmed">
          The org receiving the invoice. Locked on the contractor view — they
          can&apos;t edit it.
        </Text>
        <TextInput label="Legal name" {...form.getInputProps("company.name")} />
        <TextInput
          label="Street"
          {...form.getInputProps("company.address.street")}
        />
        <Group grow>
          <TextInput
            label="City"
            {...form.getInputProps("company.address.city")}
          />
          <TextInput
            label="ZIP"
            {...form.getInputProps("company.address.zip")}
          />
        </Group>

        <Divider />
        <TemplateFieldListEditor
          form={form}
          listKey="bankFields"
          title="Payment Details"
          description={
            "Where the contractor wants to be paid. Pick a banking preset or roll your own fields. Reorder rows by dragging the grip handle (keyboard: focus the handle, then arrow keys)."
          }
          presets={BANK_FIELD_PRESETS}
          emptyHint="No fields — Payment Details will not appear on the invoice or contractor form."
        />

        <Text size="xs" c="dimmed">
          Optional bank pre-fill still lives in your template JSON (
          <Code fz="xs">bank</Code> object, keyed by field id). Most orgs leave it
          empty so every contractor uses their own payout details.
        </Text>

        {showPublishToggle ? (
          <>
            <Divider />
            <Checkbox
              label="Published (contractors can load /{slug})"
              {...form.getInputProps("isPublished", { type: "checkbox" })}
            />
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}
