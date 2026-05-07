"use client";

import { Anchor, Button, Group, Text } from "@mantine/core";
import { IconShieldLock, IconTrash } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import { clearContractorStorage } from "@/lib/storage-keys";
import { feedbackSourceFromPathname } from "@/lib/feedback";
import { useFeedback } from "@/app/components/feedback/FeedbackProvider";

export function ContractorPrivacyFooter() {
  const pathname = usePathname();
  const { open } = useFeedback();
  const { storageNamespace, organizationDisplayName } = useInvoiceShell();

  const handleClear = () => {
    const confirmed = window.confirm(
      "This will erase your name, address, bank details, and line items from this browser. This page will reload. Continue?",
    );
    if (!confirmed) return;
    clearContractorStorage(storageNamespace);
    window.location.reload();
  };

  return (
    <Group
      justify="space-between"
      gap="xs"
      px="md"
      h="100%"
      wrap="nowrap"
      style={{ overflow: "hidden" }}
    >
      <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
        <IconShieldLock
          size={14}
          color="var(--mantine-color-dimmed)"
          style={{ flexShrink: 0 }}
        />
        <Text size="xs" c="dimmed" style={{ minWidth: 0 }} truncate>
          Your details stay in this browser only — they auto-save so you
          don&apos;t have to re-type them next time
          {organizationDisplayName ? (
            <>
              {" "}
              you invoice <b>{organizationDisplayName}</b>
            </>
          ) : null}
          .{" "}
          <Anchor
            href="https://en.wikipedia.org/wiki/Web_storage"
            target="_blank"
            rel="noreferrer"
            size="xs"
          >
            What&apos;s localStorage?
          </Anchor>
          {" · "}
          <Anchor
            component="button"
            type="button"
            size="xs"
            underline="never"
            onClick={() =>
              open({
                source: storageNamespace
                  ? `contractor:${storageNamespace}`
                  : feedbackSourceFromPathname(pathname ?? null),
              })
            }
            style={{ cursor: "pointer", verticalAlign: "baseline" }}
          >
            Feedback
          </Anchor>
        </Text>
      </Group>
      <Button
        variant="subtle"
        size="compact-xs"
        color="gray"
        leftSection={<IconTrash size={12} />}
        onClick={handleClear}
        style={{ flexShrink: 0 }}
      >
        Clear my data
      </Button>
    </Group>
  );
}
