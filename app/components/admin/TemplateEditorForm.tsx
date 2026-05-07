"use client";

import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Code,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAddressBook,
  IconBuildingBank,
  IconCalendarDollar,
  IconCash,
  IconFileText,
  IconListDetails,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
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
import {
  COMMON_CURRENCIES,
  type TemplateFormShape,
} from "./template-form-helpers";
import { TemplateFieldListEditor } from "./TemplateFieldListEditor";
import { SectionHeading } from "./SectionHeading";
import {
  CompanyLockedPreview,
  ContractorPanelPreview,
  ExportDialogPreview,
} from "./ContractorPanelPreview";

const CONTRACTOR_FIELD_PRESETS = [
  { label: "EU · Full identity", fields: PRESET_CONTRACTOR_EU_STANDARD },
  { label: "Light · Name + email", fields: PRESET_CONTRACTOR_LIGHT },
  { label: "None · hide block", fields: [] },
];

const BANK_FIELD_PRESETS = [
  { label: "EU · IBAN + BIC", fields: PRESET_BANK_EU_IBAN },
  { label: "US · ACH", fields: PRESET_BANK_US_ACH },
  { label: "UK · Sort code + account", fields: PRESET_BANK_UK },
  { label: "None · hide block", fields: [] },
];

/**
 * Template editor — split into a vertical tab nav so admins see only one
 * concern at a time. The right-side live PDF preview keeps showing the
 * combined effect of all tabs.
 */
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
    if (known) form.setFieldValue("currency.symbol", known.symbol);
  };

  const addPreset = () => {
    form.insertListItem("dueTermsPresets", {
      id: `term_${form.values.dueTermsPresets.length + 1}`,
      label: "",
      days: 0,
    });
  };

  const addDefaultItem = () => {
    form.insertListItem("itemPresets", {
      description: "",
      price: "",
    });
  };

  return (
    <Paper withBorder p={0} radius="md" style={{ overflow: "hidden" }}>
      <Tabs
        defaultValue="branding"
        orientation="vertical"
        variant="pills"
        radius="sm"
        keepMounted={false}
        styles={{
          root: { display: "flex", minHeight: 640 },
          list: {
            background: "var(--raseed-surface)",
            borderRight: "1px solid var(--raseed-hairline)",
            padding: 8,
            gap: 2,
            minWidth: 220,
          },
          tab: { justifyContent: "flex-start" },
          panel: { padding: "var(--mantine-spacing-md)", flex: 1, minWidth: 0 },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="branding" leftSection={<IconSettings size={16} />}>
            Branding & contact
          </Tabs.Tab>
          <Tabs.Tab value="rules" leftSection={<IconFileText size={16} />}>
            Invoice rules
          </Tabs.Tab>
          <Tabs.Tab
            value="payment"
            leftSection={<IconCalendarDollar size={16} />}
          >
            Payment terms
          </Tabs.Tab>
          <Tabs.Tab value="items" leftSection={<IconListDetails size={16} />}>
            Line item options
          </Tabs.Tab>
          <Tabs.Tab value="contractor" leftSection={<IconUser size={16} />}>
            Contractor (From)
          </Tabs.Tab>
          <Tabs.Tab value="company" leftSection={<IconAddressBook size={16} />}>
            Billed To
          </Tabs.Tab>
          <Tabs.Tab value="bank" leftSection={<IconBuildingBank size={16} />}>
            Payment Details
          </Tabs.Tab>
          {showPublishToggle ? (
            <Tabs.Tab value="publish" leftSection={<IconWorld size={16} />}>
              Publish
            </Tabs.Tab>
          ) : null}
        </Tabs.List>

        {/* ── Branding & contact ─────────────────────────────────────── */}
        <Tabs.Panel value="branding">
          <Stack gap="md">
            <SectionHeading
              title="Branding & contact"
              description="How your org is named on the invoice and where contractors send the finished PDF."
            />
            <TextInput
              label="Organization display name"
              {...form.getInputProps("orgName")}
            />
            <TextInput
              label="Export PDF label (short)"
              description='Appears in the contractor’s downloaded filename — e.g. "Acme Invoice - May 26.pdf".'
              {...form.getInputProps("exportName")}
            />
            <TextInput
              label="Business contact email"
              description='Auto-fills the "To:" field in the contractor’s export dialog so they can email the invoice straight to your billing address.'
              placeholder="billing@example.com"
              {...form.getInputProps("businessEmail")}
            />
            <Checkbox
              label='Also print this email under "Billed To" on the invoice PDF'
              description="When unchecked, the email still pre-fills the export dialog but doesn’t appear on the printed invoice."
              disabled={!form.values.businessEmail.trim()}
              {...form.getInputProps("showBusinessEmail", { type: "checkbox" })}
            />
            <ExportDialogPreview
              businessEmail={form.values.businessEmail}
              exportLabel={form.values.exportName}
              showBusinessEmailOnPdf={form.values.showBusinessEmail}
            />
          </Stack>
        </Tabs.Panel>

        {/* ── Invoice rules ──────────────────────────────────────────── */}
        <Tabs.Panel value="rules">
          <Stack gap="lg">
            <Stack gap="sm">
              <SectionHeading
                title="Currency"
                region="items"
                description="Sets the currency symbol + position used everywhere amounts appear."
              />
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
            </Stack>

            <Stack gap="sm">
              <SectionHeading
                title="Tax"
                region="items"
                description="Adds a tax row under the subtotal. Set the rate to 0 to hide the row."
              />
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
            </Stack>

            <Stack gap="sm">
              <SectionHeading
                title="Date format"
                region="header"
                description="Used for issued / due / period dates on the printed invoice."
              />
              <Select
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
            </Stack>

            <Stack gap="sm">
              <SectionHeading
                title="Invoice number"
                region="header"
                description="How the invoice number is generated from the invoice date."
              />
              <Radio.Group
                label="Scheme"
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
            </Stack>
          </Stack>
        </Tabs.Panel>

        {/* ── Payment terms ──────────────────────────────────────────── */}
        <Tabs.Panel value="payment">
          <Stack gap="md">
            <SectionHeading
              title="Payment terms"
              region="header"
              description="Define the options the contractor can pick from when invoicing you."
            />
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

            <Checkbox
              mt="xs"
              label="Let contractors enter a custom due-days value"
              description='Adds a "Custom" option to the payment-terms select. Turn off to lock contractors to the presets above.'
              {...form.getInputProps("allowCustomDueTerms", {
                type: "checkbox",
              })}
            />
          </Stack>
        </Tabs.Panel>

        {/* ── Line item options ──────────────────────────────────────── */}
        <Tabs.Panel value="items">
          <Stack gap="md">
            <SectionHeading
              title="Line item options"
              region="items"
              description="Restrict what contractors can put in the description column. Empty list = free text (anything they type). Add options to turn the description field into a dropdown."
            />
            {form.values.itemPresets.length === 0 ? (
              <Box
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: "1px dashed var(--raseed-hairline)",
                  background: "var(--raseed-page-bg)",
                }}
              >
                <Text size="sm" c="dimmed">
                  No options. Contractors will see a free-text Description field
                  — same as today.
                </Text>
              </Box>
            ) : (
              <Stack gap="xs">
                {form.values.itemPresets.map((_item, idx) => (
                  <Group key={idx} align="flex-end" wrap="nowrap" gap="xs">
                    <TextInput
                      label={idx === 0 ? "Description" : undefined}
                      placeholder="Senior frontend engineering"
                      style={{ flex: 1 }}
                      {...form.getInputProps(`itemPresets.${idx}.description`)}
                    />
                    <NumberInput
                      label={
                        idx === 0
                          ? `Default price (${form.values.currency.symbol}) — optional`
                          : undefined
                      }
                      placeholder="leave blank"
                      min={0}
                      decimalScale={2}
                      w={170}
                      {...form.getInputProps(`itemPresets.${idx}.price`)}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => form.removeListItem("itemPresets", idx)}
                      aria-label="Remove option"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
            <Button
              variant="light"
              leftSection={<IconPlus size={14} />}
              size="xs"
              onClick={addDefaultItem}
              w="fit-content"
            >
              Add option
            </Button>

            <Checkbox
              mt="xs"
              label="Let contractors type any description"
              description="On: dropdown becomes type-ahead with your options as suggestions. Off: contractors must pick one of the options above. (When you add exactly one option and turn this off, the field becomes read-only.)"
              disabled={form.values.itemPresets.length === 0}
              {...form.getInputProps("allowCustomItemDescriptions", {
                type: "checkbox",
              })}
            />
          </Stack>
        </Tabs.Panel>

        {/* ── Contractor identity ────────────────────────────────────── */}
        <Tabs.Panel value="contractor">
          <Stack gap="md">
            <SectionHeading
              title="Contractor identity (From)"
              region="from"
              description="Every question contractors answer before invoicing you. The internal id never changes unless you delete and recreate a row. Drag the grip handle to reorder."
            />
            <TemplateFieldListEditor
              form={form}
              listKey="contractorFields"
              presets={CONTRACTOR_FIELD_PRESETS}
              emptyHint="No fields — the From accordion is hidden on the contractor app."
            />
            <ContractorPanelPreview
              fields={form.values.contractorFields}
              title="From"
              emptyHint="With no fields, the From accordion is hidden entirely on the contractor app."
              variant="personal"
            />
          </Stack>
        </Tabs.Panel>

        {/* ── Billed To company ──────────────────────────────────────── */}
        <Tabs.Panel value="company">
          <Stack gap="md">
            <SectionHeading
              title={"\u201CBilled To\u201D company"}
              region="billed-to"
              description="The org receiving the invoice. Locked on the contractor view — they can't edit it."
            />
            <TextInput
              label="Legal name"
              {...form.getInputProps("company.name")}
            />
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
            <CompanyLockedPreview
              company={{
                name: form.values.company.name,
                address: {
                  street: form.values.company.address.street,
                  city: form.values.company.address.city,
                  zip: form.values.company.address.zip,
                },
              }}
              orgName={form.values.orgName}
            />
          </Stack>
        </Tabs.Panel>

        {/* ── Payment details ────────────────────────────────────────── */}
        <Tabs.Panel value="bank">
          <Stack gap="md">
            <SectionHeading
              title="Payment Details"
              region="payment"
              description="Where the contractor wants to be paid. Pick a banking preset or roll your own fields. Drag the grip handle to reorder."
            />
            <TemplateFieldListEditor
              form={form}
              listKey="bankFields"
              presets={BANK_FIELD_PRESETS}
              emptyHint="No fields — Payment Details will not appear on the invoice or contractor form."
            />
            <ContractorPanelPreview
              fields={form.values.bankFields}
              title="Payment Details"
              emptyHint="With no fields, Payment Details is hidden on both the form and the printed invoice."
              variant="bank"
            />
            <Text size="xs" c="dimmed">
              Optional bank pre-fill still lives in your template JSON (
              <Code fz="xs">bank</Code> object, keyed by field id). Most orgs
              leave it empty so every contractor uses their own payout details.
            </Text>
          </Stack>
        </Tabs.Panel>

        {/* ── Publish ────────────────────────────────────────────────── */}
        {showPublishToggle ? (
          <Tabs.Panel value="publish">
            <Stack gap="md">
              <SectionHeading
                title="Publish"
                description="When published, your contractors can load the live form at /{slug}. Unpublish to hide it again — saved data stays in their browser."
              />
              <Paper
                withBorder
                radius="md"
                p="md"
                style={{ background: "var(--raseed-surface)" }}
              >
                <Group gap="sm" align="flex-start">
                  <IconCash size={20} color="var(--raseed-muted)" />
                  <Box style={{ flex: 1 }}>
                    <Checkbox
                      label="Published — contractors can load /{slug}"
                      {...form.getInputProps("isPublished", {
                        type: "checkbox",
                      })}
                    />
                    <Text size="xs" c="dimmed" mt={6}>
                      Toggle this when the rest of the template is ready. Save
                      to apply.
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Stack>
          </Tabs.Panel>
        ) : null}
      </Tabs>
    </Paper>
  );
}
