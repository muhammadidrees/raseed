"use client";

import { Box, Text, Stack } from "@mantine/core";

export type InvoiceRegion =
  | "header"
  | "billed-to"
  | "from"
  | "items"
  | "payment";

const REGION_META: Record<
  InvoiceRegion,
  { label: string; description: string }
> = {
  header: {
    label: "Invoice header",
    description: "Invoice number, issued date, due date and period.",
  },
  "billed-to": {
    label: "Billed To",
    description: "The company you are invoicing — locked by the template.",
  },
  from: {
    label: "From",
    description: "Your contractor identity — name, contact, tax ID.",
  },
  items: {
    label: "Items & totals",
    description: "Line items, subtotal, tax and total.",
  },
  payment: {
    label: "Payment Details",
    description: "Where you want the contractor's invoice paid out.",
  },
};

/**
 * Tiny SVG schematic of an A4 invoice with one region highlighted.
 *
 * Used inside `InvoiceRegionHint` (the info-icon popover next to each form
 * section header). Coordinates are intentionally rough — the goal is "this
 * is roughly which slab of the page that field controls", not a pixel-true
 * preview.
 */
export function InvoiceRegionDiagram({
  region,
  width = 200,
}: {
  region: InvoiceRegion;
  width?: number;
}) {
  const ratio = 297 / 210; // A4
  const height = Math.round(width * ratio);
  // Viewbox in 200×283 logical units so coords below stay readable.
  const VB_W = 200;
  const VB_H = 283;

  // Region rectangles in viewbox units.
  const RECTS: Record<
    InvoiceRegion,
    { x: number; y: number; w: number; h: number }
  > = {
    header: { x: 16, y: 16, w: 168, h: 38 },
    "billed-to": { x: 16, y: 64, w: 78, h: 36 },
    from: { x: 106, y: 64, w: 78, h: 36 },
    items: { x: 16, y: 110, w: 168, h: 100 },
    payment: { x: 16, y: 222, w: 168, h: 46 },
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={`Invoice diagram with ${REGION_META[region].label} highlighted`}
      style={{ display: "block" }}
    >
      {/* Page */}
      <rect
        x={1}
        y={1}
        width={VB_W - 2}
        height={VB_H - 2}
        rx={6}
        ry={6}
        fill="#ffffff"
        stroke="var(--raseed-hairline)"
        strokeWidth={1}
      />

      {/* INVOICE wordmark */}
      <text
        x={20}
        y={32}
        fontSize={11}
        fontWeight={700}
        fill="var(--raseed-muted)"
        letterSpacing={0.5}
      >
        INVOICE
      </text>
      <text x={20} y={44} fontSize={6} fill="var(--raseed-muted)">
        #INV-####
      </text>

      {/* Right-aligned meta lines */}
      {[20, 28, 36, 44].map((dy, i) => (
        <line
          key={i}
          x1={120}
          x2={184}
          y1={dy}
          y2={dy}
          stroke="var(--raseed-hairline)"
          strokeWidth={1.4}
        />
      ))}

      {/* Billed To label */}
      <text
        x={20}
        y={74}
        fontSize={6}
        fontWeight={700}
        fill="var(--raseed-muted)"
      >
        Billed To
      </text>
      {[80, 86, 92].map((y, i) => (
        <line
          key={`bt-${i}`}
          x1={20}
          x2={86}
          y1={y}
          y2={y}
          stroke="var(--raseed-hairline)"
          strokeWidth={1.2}
        />
      ))}

      {/* From label */}
      <text
        x={110}
        y={74}
        fontSize={6}
        fontWeight={700}
        fill="var(--raseed-muted)"
      >
        From
      </text>
      {[80, 86, 92].map((y, i) => (
        <line
          key={`fr-${i}`}
          x1={110}
          x2={176}
          y1={y}
          y2={y}
          stroke="var(--raseed-hairline)"
          strokeWidth={1.2}
        />
      ))}

      {/* Items table header */}
      <line
        x1={16}
        x2={184}
        y1={120}
        y2={120}
        stroke="var(--raseed-hairline)"
        strokeWidth={1.4}
      />
      <line
        x1={16}
        x2={184}
        y1={128}
        y2={128}
        stroke="var(--raseed-hairline)"
        strokeWidth={1}
      />
      {[140, 152, 164, 176].map((y, i) => (
        <line
          key={`it-${i}`}
          x1={20}
          x2={180}
          y1={y}
          y2={y}
          stroke="var(--raseed-hairline)"
          strokeWidth={1}
        />
      ))}
      {/* Totals */}
      <line
        x1={120}
        x2={180}
        y1={194}
        y2={194}
        stroke="var(--raseed-hairline)"
        strokeWidth={1.4}
      />
      <line
        x1={120}
        x2={180}
        y1={204}
        y2={204}
        stroke="var(--raseed-hairline)"
        strokeWidth={1.4}
      />

      {/* Payment Details */}
      <text
        x={20}
        y={234}
        fontSize={6}
        fontWeight={700}
        fill="var(--raseed-muted)"
      >
        Payment Details
      </text>
      {[242, 248, 254, 260].map((y, i) => (
        <line
          key={`pd-${i}`}
          x1={20}
          x2={150}
          y1={y}
          y2={y}
          stroke="var(--raseed-hairline)"
          strokeWidth={1.2}
        />
      ))}

      {/* Highlighted region overlay */}
      {(() => {
        const r = RECTS[region];
        return (
          <g>
            <rect
              x={r.x - 4}
              y={r.y - 4}
              width={r.w + 8}
              height={r.h + 8}
              rx={6}
              ry={6}
              fill="var(--mantine-color-brand-0)"
              stroke="var(--mantine-color-brand-6)"
              strokeWidth={1.6}
              strokeDasharray="0"
              opacity={0.95}
            />
            {/* faint pulsing inner highlight */}
            <rect
              x={r.x - 4}
              y={r.y - 4}
              width={r.w + 8}
              height={r.h + 8}
              rx={6}
              ry={6}
              fill="none"
              stroke="var(--mantine-color-brand-6)"
              strokeWidth={1.6}
              opacity={0.55}
            >
              <animate
                attributeName="opacity"
                values="0.2;0.8;0.2"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        );
      })()}
    </svg>
  );
}

/**
 * Card content for the info-popover next to each form section header.
 */
export function InvoiceRegionHintCard({ region }: { region: InvoiceRegion }) {
  const meta = REGION_META[region];
  return (
    <Stack gap={8} style={{ maxWidth: 240 }}>
      <Box
        style={{
          padding: 8,
          borderRadius: 8,
          background: "var(--raseed-page-bg)",
          border: "1px solid var(--raseed-hairline)",
        }}
      >
        <InvoiceRegionDiagram region={region} width={216} />
      </Box>
      <Stack gap={2}>
        <Text fw={600} size="sm">
          {meta.label}
        </Text>
        <Text c="dimmed" size="xs" lh={1.45}>
          {meta.description}
        </Text>
      </Stack>
    </Stack>
  );
}
