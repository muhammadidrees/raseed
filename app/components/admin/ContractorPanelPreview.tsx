"use client";

import {
  Accordion,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconLock, IconEye } from "@tabler/icons-react";
import type { TemplateFieldDefinition } from "@/lib/invoice-template";
import type { CompanyInfo } from "@/app/types";

const SAMPLE_BY_ID: Record<string, string> = {
  // contractor
  name: "Jane Contractor",
  email: "jane@example.com",
  taxID: "TAX-1234567",
  street: "42 Sample Avenue",
  city: "Berlin",
  zip: "10115",
  // bank
  accountTitle: "Jane Contractor",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "DEUTDEFF",
};

function sampleValue(field: TemplateFieldDefinition): string {
  return SAMPLE_BY_ID[field.id] ?? "";
}

/**
 * A non-interactive, deterministic preview of how the contractor accordion
 * panel will render with the current field list. Mirrors the styling of
 * `personal_info_form.tsx` / `bank_info_form.tsx` so admins can see the
 * impact of their changes — labels, placeholders, required asterisks,
 * order — without leaving the editor.
 */
export function ContractorPanelPreview({
  fields,
  title,
  emptyHint,
  sampleData = true,
  variant = "personal",
}: {
  fields: TemplateFieldDefinition[];
  title: string;
  emptyHint: string;
  /** Pre-fills with sample answers so it reads as a finished invoice form. */
  sampleData?: boolean;
  variant?: "personal" | "bank";
}) {
  if (fields.length === 0) {
    return (
      <Paper
        withBorder
        radius="md"
        p="md"
        style={{
          background: "var(--raseed-page-bg)",
          borderStyle: "dashed",
        }}
      >
        <Group gap={8} mb={6}>
          <IconEye size={14} color="var(--raseed-muted)" />
          <Text size="xs" fw={600} c="dimmed">
            Contractor preview · {title}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" fs="italic">
          {emptyHint}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{ background: "var(--raseed-page-bg)" }}
    >
      <Group gap={8} mb={8} px={6}>
        <IconEye size={14} color="var(--raseed-muted)" />
        <Text size="xs" fw={600} c="dimmed">
          Contractor preview · {title}
        </Text>
        <Text size="xs" c="dimmed">
          · this is the form your contractors fill in
        </Text>
      </Group>
      <Box
        style={{
          background: "var(--mantine-color-body)",
          borderRadius: 8,
          border: "1px solid var(--raseed-hairline)",
          overflow: "hidden",
        }}
      >
        <Accordion
          variant="default"
          defaultValue="preview"
          chevronPosition="right"
        >
          <Accordion.Item value="preview">
            <Accordion.Control>
              <Text fw={600} size="sm">
                {variant === "personal" ? "From" : "Payment Details"}
                <Text component="span" c="dimmed" size="xs" ml={6}>
                  ·{" "}
                  {variant === "personal"
                    ? "Your details"
                    : "Where you get paid"}
                </Text>
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                {fields.map((f, idx) => (
                  <TextInput
                    key={f.id}
                    mt={idx === 0 ? undefined : 4}
                    label={f.label || "Field"}
                    placeholder={f.placeholder || f.label || ""}
                    withAsterisk={f.required}
                    value={sampleData ? sampleValue(f) : ""}
                    readOnly
                    onChange={() => {}}
                    styles={{ input: { cursor: "default" } }}
                  />
                ))}
                <Group mt="xs">
                  <Button size="sm" disabled>
                    Save
                  </Button>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    </Paper>
  );
}

/**
 * Read-only mini-preview of the locked "Billed To" company block as the
 * contractor will see it — just to make it concrete that the contractor
 * can't edit those values on their side.
 */
export function CompanyLockedPreview({
  company,
  orgName,
}: {
  company: CompanyInfo;
  orgName: string;
}) {
  const display = {
    name: company.name?.trim() || orgName || "Your Organization",
    street: company.address.street?.trim() || "—",
    city: company.address.city?.trim() || "—",
    zip: company.address.zip?.trim() || "—",
  };
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{ background: "var(--raseed-page-bg)" }}
    >
      <Group gap={8} mb={8} px={6}>
        <IconEye size={14} color="var(--raseed-muted)" />
        <Text size="xs" fw={600} c="dimmed">
          Contractor preview · Billed To
        </Text>
        <Text size="xs" c="dimmed">
          · the contractor sees this on the printed invoice (not as a form)
        </Text>
      </Group>
      <Box
        style={{
          background: "var(--mantine-color-body)",
          borderRadius: 8,
          border: "1px solid var(--raseed-hairline)",
          padding: 14,
        }}
      >
        <Group gap={6} mb={6}>
          <IconLock size={12} color="var(--raseed-muted)" />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Billed To
          </Text>
        </Group>
        <Stack gap={2}>
          <Text size="sm" fw={600}>
            {display.name}
          </Text>
          <Text size="xs" c="dimmed">
            {display.street}
          </Text>
          <Text size="xs" c="dimmed">
            {display.zip}, {display.city}
          </Text>
        </Stack>
      </Box>
    </Paper>
  );
}

/**
 * Mock of the contractor's "Export" dialog so admins know what
 * `Business contact email` and `Export PDF label` actually do.
 */
export function ExportDialogPreview({
  businessEmail,
  exportLabel,
  showBusinessEmailOnPdf,
}: {
  businessEmail: string;
  exportLabel: string;
  showBusinessEmailOnPdf: boolean;
}) {
  const monthAbbr = new Date().toLocaleString("default", { month: "short" });
  const yy = String(new Date().getFullYear()).slice(-2);
  const fname = `Jane Contractor ${exportLabel || "Invoice"} Invoice - ${monthAbbr} ${yy}.pdf`;
  const to =
    businessEmail?.trim() || "(leave blank — contractor will type one)";
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{ background: "var(--raseed-page-bg)" }}
    >
      <Group gap={8} mb={8} px={6}>
        <IconEye size={14} color="var(--raseed-muted)" />
        <Text size="xs" fw={600} c="dimmed">
          Contractor preview · Export dialog
        </Text>
        <Text size="xs" c="dimmed">
          · what they see when they click “Export”
        </Text>
      </Group>
      <Box
        style={{
          background: "var(--mantine-color-body)",
          borderRadius: 8,
          border: "1px solid var(--raseed-hairline)",
          padding: 12,
        }}
      >
        <Stack gap={10}>
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb={4}>
              File name
            </Text>
            <Box
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                padding: "6px 10px",
                background: "var(--raseed-surface)",
                border: "1px solid var(--raseed-hairline)",
                borderRadius: 6,
                color: "var(--mantine-color-text)",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {fname}
            </Box>
          </Box>
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb={4}>
              Email · To
            </Text>
            <Box
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                padding: "6px 10px",
                background: "var(--raseed-surface)",
                border: "1px solid var(--raseed-hairline)",
                borderRadius: 6,
                color: businessEmail?.trim()
                  ? "var(--mantine-color-text)"
                  : "var(--raseed-muted)",
              }}
            >
              {to}
            </Box>
          </Box>
          {businessEmail?.trim() ? (
            <Text size="xs" c="dimmed">
              {showBusinessEmailOnPdf
                ? "Also printed under “Billed To” on the invoice PDF."
                : "Pre-fills the export dialog only — not printed on the invoice."}
            </Text>
          ) : null}
        </Stack>
      </Box>
    </Paper>
  );
}
