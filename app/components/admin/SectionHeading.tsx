"use client";

import { Box, Group, HoverCard, Text, Title } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  InvoiceRegionHintCard,
  type InvoiceRegion,
} from "@/app/components/InvoiceRegionDiagram";

/**
 * Section heading used inside the admin template editor. Mirrors the
 * info-icon pattern from `AccordianControl` on the contractor side so
 * admins get the same visual cue ("this section controls THIS slab of
 * the printed invoice") whenever the section maps to a region.
 */
export function SectionHeading({
  title,
  description,
  region,
  rightSlot,
  order = 5,
}: {
  title: string;
  description?: string;
  region?: InvoiceRegion;
  rightSlot?: React.ReactNode;
  order?: 3 | 4 | 5 | 6;
}) {
  return (
    <Box>
      <Group justify="space-between" align="center" gap={8} wrap="nowrap">
        <Group gap={6} align="center" wrap="nowrap">
          <Title order={order}>{title}</Title>
          {region ? (
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
                  aria-label={`Where “${title}” appears on the invoice`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: "var(--raseed-muted)",
                    cursor: "help",
                    borderRadius: 999,
                    padding: 2,
                    transition: "color 160ms ease",
                  }}
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
        {rightSlot}
      </Group>
      {description ? (
        <Text size="xs" c="dimmed" mt={4} lh={1.5}>
          {description}
        </Text>
      ) : null}
    </Box>
  );
}
