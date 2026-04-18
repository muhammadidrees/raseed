"use client";

import { useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Group,
  Tooltip,
  Stack,
  Text,
  Paper,
  SimpleGrid,
  CopyButton,
  ActionIcon,
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
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { usePersonalFormContext } from "../context/PersonalInfoContext";
import { useCompanyFormContext } from "../context/CompanyInfoContext";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { useBankFormContext } from "../context/BankInfoContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
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

  const [opened, { open, close }] = useDisclosure(false);
  const [fileName, setFileName] = useState("");
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
    setFileName(
      `${personalFormData.name} Makula Invoice - ${monthAbbr} ${year2}.pdf`,
    );
    setEmailSubject(`${personalFormData.name} - ${monthAbbr} ${year4} Invoice`);
    setEmailBody(
      `Hello,\n\nPlease find the ${monthFull} ${year4} invoice attached.\n\nRegards,\n${personalFormData.name}.`,
    );
    open();
  };

  // Only compute doc when modal is open — prevents background PDF refresh
  const doc = useMemo(
    () =>
      opened ? (
        <MyDocument
          personalFormData={personalFormData}
          companyFormData={companyFormData}
          invoiceFromData={invoiceFromData}
          bankFormData={bankFromData}
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
              {unsavedLabels.join(", ")}{" "}
              {unsavedLabels.length === 1 ? "has" : "have"} unsaved changes and
              won&apos;t be reflected in the downloaded PDF.
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
                    color="dark"
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
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.currentTarget.value)}
                variant="filled"
                styles={{ input: { fontSize: 13 } }}
                rightSectionWidth={36}
                rightSection={
                  <CopyButton value={emailSubject} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "Copied!" : "Copy subject"}
                        withArrow
                        position="top"
                      >
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color={copied ? "teal" : "gray"}
                          onClick={copy}
                        >
                          {copied ? (
                            <IconCheck size={13} />
                          ) : (
                            <IconCopy size={13} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                }
              />

              <div style={{ position: "relative" }}>
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
                      paddingRight: 32,
                    },
                  }}
                />
                <CopyButton value={emailBody} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? "Copied!" : "Copy body"}
                      withArrow
                      position="left"
                    >
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={copied ? "teal" : "gray"}
                        onClick={copy}
                        style={{ position: "absolute", top: 28, right: 6 }}
                      >
                        {copied ? (
                          <IconCheck size={13} />
                        ) : (
                          <IconCopy size={13} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </div>
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
