"use client";

import { useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Group,
  Stack,
  Text,
  Paper,
  SimpleGrid,
  CopyButton,
  Alert,
} from "@mantine/core";
import {
  IconDownload,
  IconCopy,
  IconCheck,
  IconFileExport,
  IconMail,
  IconFileTypePdf,
  IconAlertTriangle,
  IconExternalLink,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { useBankFormContext } from "../context/BankInfoContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import { MyDocument } from "./preview";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => null },
);

export function ExportModal() {
  const { personalFormData } = usePersonalFormContext();
  const { companyFormData } = useCompanyFormContext();
  const { invoiceFromData } = useInvoiceDataContext();
  const { bankFromData } = useBankFormContext();
  const { unsaved, hasAnyUnsaved } = useUnsavedChanges();
  const { exportFileLabel, templateConfig } = useInvoiceShell();

  const [opened, { open, close }] = useDisclosure(false);
  const [fileName, setFileName] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const getMonthYear = (date: Date) => ({
    monthAbbr: date.toLocaleString("default", { month: "short" }),
    monthFull: date.toLocaleString("default", { month: "long" }),
    year2: String(date.getFullYear()).slice(-2),
    year4: date.getFullYear(),
  });

  const handleOpen = () => {
    const { monthAbbr, monthFull, year2, year4 } = getMonthYear(
      invoiceFromData.date,
    );
    const who = (personalFormData.name ?? "").trim() || "Invoice";
    setFileName(`${who} ${exportFileLabel} Invoice - ${monthAbbr} ${year2}.pdf`);
    setEmailTo(templateConfig.businessEmail ?? "");
    setEmailSubject(`${who} - ${monthAbbr} ${year4} Invoice`);
    setEmailBody(
      `Hello,\n\nPlease find the ${monthFull} ${year4} invoice attached.\n\nRegards,\n${(personalFormData.name ?? "").trim() || "Contractor"}.`,
    );
    open();
  };

  const mailtoHref = useMemo(() => {
    const params = new URLSearchParams();
    if (emailSubject) params.set("subject", emailSubject);
    if (emailBody) params.set("body", emailBody);
    const qs = params.toString();
    return `mailto:${encodeURIComponent(emailTo)}${qs ? `?${qs}` : ""}`;
  }, [emailTo, emailSubject, emailBody]);

  // Only compute doc when modal is open — prevents background PDF refresh
  const doc = useMemo(
    () =>
      opened ? (
        <MyDocument
          personalFormData={personalFormData}
          companyFormData={companyFormData}
          invoiceFromData={invoiceFromData}
          bankFormData={bankFromData}
          templateConfig={templateConfig}
        />
      ) : (
        <></>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opened],
  );

  const unsavedLabels = Object.entries(unsaved)
    .filter(([, dirty]) => dirty)
    .map(([key]) => key);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs">
            <IconFileExport size={18} />
            <Text fw={600} size="md">
              Export Invoice
            </Text>
          </Group>
        }
        size="xl"
        centered
        radius="md"
        padding="xl"
        keepMounted={false}
      >
        <SimpleGrid cols={2} spacing="xl" pt="sm">
          {hasAnyUnsaved && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="orange"
              variant="light"
              title="Unsaved changes"
              style={{ gridColumn: "1 / -1" }}
            >
              {`${unsavedLabels.join(", ")} ${unsavedLabels.length === 1 ? "has" : "have"} unsaved changes and won't be reflected in the downloaded PDF.`}
            </Alert>
          )}

          {/* LEFT — Primary: PDF download */}
          <Paper withBorder radius="md" p="lg">
            <Group gap="xs" mb="lg">
              <IconFileTypePdf size={16} />
              <Text size="sm" fw={600}>
                Download PDF
              </Text>
            </Group>

            <Stack gap="md">
              <TextInput
                label="File name"
                value={fileName}
                onChange={(e) => setFileName(e.currentTarget.value)}
                variant="filled"
                styles={{ input: { fontSize: 13 } }}
              />

              <PDFDownloadLink
                document={doc}
                fileName={fileName}
                style={{ textDecoration: "none" }}
              >
                {({ loading }) => (
                  <Button
                    fullWidth
                    leftSection={<IconDownload size={16} />}
                    loading={loading}
                    disabled={loading}
                    variant="filled"
                    size="md"
                  >
                    {loading ? "Preparing…" : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </Stack>
          </Paper>

          {/* RIGHT — Secondary: Email helper */}
          <Paper withBorder radius="md" p="lg">
            <Group gap="xs" mb="lg">
              <IconMail size={16} />
              <Text size="sm" fw={600}>
                Email
              </Text>
            </Group>

            <Stack gap="md">
              <TextInput
                label="To"
                placeholder="billing@yourcompany.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.currentTarget.value)}
                variant="filled"
                type="email"
                styles={{ input: { fontSize: 13 } }}
              />
              <TextInput
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.currentTarget.value)}
                variant="filled"
                styles={{ input: { fontSize: 13 } }}
              />
              <Textarea
                label="Body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.currentTarget.value)}
                variant="filled"
                autosize
                minRows={5}
                styles={{
                  input: {
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 1.7,
                  },
                }}
              />

              <Button
                component="a"
                href={mailtoHref}
                fullWidth
                leftSection={<IconExternalLink size={14} />}
                variant="light"
                size="sm"
              >
                Open in mail app
              </Button>

              <Text size="xs" c="dimmed">
                Attach the downloaded PDF in your mail app — most mail clients
                don&apos;t support attachments via{" "}
                <Text span ff="monospace">
                  mailto:
                </Text>
                .
              </Text>

              <Group grow gap="xs">
                <CopyButton value={emailTo} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      size="xs"
                      variant={copied ? "filled" : "subtle"}
                      color={copied ? "teal" : "gray"}
                      leftSection={
                        copied ? (
                          <IconCheck size={13} />
                        ) : (
                          <IconCopy size={13} />
                        )
                      }
                      onClick={copy}
                      disabled={!emailTo}
                    >
                      {copied ? "To copied!" : "Copy to"}
                    </Button>
                  )}
                </CopyButton>
                <CopyButton value={emailSubject} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      size="xs"
                      variant={copied ? "filled" : "subtle"}
                      color={copied ? "teal" : "gray"}
                      leftSection={
                        copied ? (
                          <IconCheck size={13} />
                        ) : (
                          <IconCopy size={13} />
                        )
                      }
                      onClick={copy}
                    >
                      {copied ? "Subject copied!" : "Copy subject"}
                    </Button>
                  )}
                </CopyButton>
                <CopyButton value={emailBody} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      size="xs"
                      variant={copied ? "filled" : "subtle"}
                      color={copied ? "teal" : "gray"}
                      leftSection={
                        copied ? (
                          <IconCheck size={13} />
                        ) : (
                          <IconCopy size={13} />
                        )
                      }
                      onClick={copy}
                    >
                      {copied ? "Body copied!" : "Copy body"}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Modal>

      <Button
        leftSection={<IconFileExport size={16} />}
        variant="light"
        size="sm"
        onClick={handleOpen}
      >
        Export
      </Button>
    </>
  );
}
