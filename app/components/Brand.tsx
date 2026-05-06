"use client";

import { Box, Group, Text } from "@mantine/core";

/**
 * Logomark — a stylized "R" inside a rounded gradient tile. Used everywhere
 * the brand needs to appear (nav, login, footer, app shell).
 */
export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <Box
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "var(--raseed-gradient-hero)",
        boxShadow:
          "0 6px 14px -4px rgba(72, 83, 231, 0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: Math.round(size * 0.55),
        fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.04em",
        flexShrink: 0,
      }}
    >
      R
    </Box>
  );
}

/**
 * Logo + wordmark, optionally with a tagline. Designed to read as a single
 * brand unit at small and medium sizes.
 */
export function BrandWordmark({
  size = 28,
  tagline,
}: {
  size?: number;
  tagline?: string;
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <BrandLogo size={size} />
      <Box>
        <Text
          fw={700}
          size={size >= 32 ? "lg" : "md"}
          style={{ letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          Raseed
        </Text>
        {tagline ? (
          <Text size="xs" c="dimmed" mt={2} style={{ lineHeight: 1 }}>
            {tagline}
          </Text>
        ) : null}
      </Box>
    </Group>
  );
}
