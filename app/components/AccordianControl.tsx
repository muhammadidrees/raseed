"use client";

import {
  Accordion,
  Box,
  Group,
  HoverCard,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertSquareRounded,
  IconSquareRoundedCheck,
  IconHelpSquareRounded,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  InvoiceRegionHintCard,
  type InvoiceRegion,
} from "./InvoiceRegionDiagram";

interface AccordionControlProps {
  /** Header text shown in the accordion (e.g. "From"). */
  label: string;
  /** Smaller secondary label rendered to the right (e.g. legacy "Personal Info"). */
  sublabel?: string;
  isFormEmpty: boolean;
  isFormUnsaved: boolean;
  /** Which slab of the printed invoice this section controls. When
   * provided, an info-icon next to the label opens a hover card with a
   * schematic diagram of the invoice with the region highlighted. */
  region?: InvoiceRegion;
}

export function AccordianControl({
  label,
  sublabel,
  isFormEmpty,
  isFormUnsaved,
  region,
}: AccordionControlProps) {
  const theme = useMantineTheme();

  const StatusIcon = isFormEmpty ? (
    <IconAlertSquareRounded color={theme.colors.red[6]} />
  ) : isFormUnsaved ? (
    <IconHelpSquareRounded color={theme.colors.brand[6]} />
  ) : (
    <IconSquareRoundedCheck color={theme.colors.teal[6]} />
  );

  return (
    <Accordion.Control suppressHydrationWarning icon={StatusIcon}>
      <Group gap={8} wrap="nowrap" align="center">
        <Text component="span" fw={600} size="sm">
          {label}
        </Text>
        {sublabel ? (
          <Text component="span" c="dimmed" size="xs">
            · {sublabel}
          </Text>
        ) : null}
        {region ? (
          // HoverCard avoids nesting an interactive element inside the
          // Accordion.Control button. The trigger is a plain <span> with a
          // small icon — no extra <button>, no a11y violations.
          <HoverCard
            withArrow
            shadow="md"
            position="right-start"
            offset={10}
            withinPortal
            radius="md"
            openDelay={120}
            closeDelay={80}
          >
            <HoverCard.Target>
              <Box
                component="span"
                aria-label={`What is ${label}?`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "var(--raseed-muted)",
                  cursor: "help",
                  borderRadius: 999,
                  padding: 2,
                  transition: "color 160ms ease, background 160ms ease",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--mantine-color-brand-6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--raseed-muted)";
                }}
              >
                <IconInfoCircle size={15} />
              </Box>
            </HoverCard.Target>
            <HoverCard.Dropdown
              p="sm"
              style={{ background: "var(--raseed-surface)" }}
            >
              <InvoiceRegionHintCard region={region} />
            </HoverCard.Dropdown>
          </HoverCard>
        ) : null}
      </Group>
    </Accordion.Control>
  );
}
