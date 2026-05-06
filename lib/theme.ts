import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

/**
 * Raseed brand palette.
 *
 * Primary "brand" — a refined indigo/violet that reads as sophisticated and
 * trustworthy (financial / SaaS convention). 10 shades, lightest → darkest.
 * Generated to feel close to Tailwind's indigo with a touch more saturation.
 */
const brand: MantineColorsTuple = [
  "#eef0ff",
  "#dde0fc",
  "#b6bdf6",
  "#8d97f0",
  "#6b76eb",
  "#5560e8",
  "#4853e7", // 6 — primary
  "#3a45cd",
  "#323db7",
  "#2730a1",
];

/** Cool slate, used for text/borders/surfaces in light mode. */
const slate: MantineColorsTuple = [
  "#f7f8fa",
  "#eef0f4",
  "#dde2eb",
  "#c4ccda",
  "#a8b2c4",
  "#8c97ac",
  "#6f7b92",
  "#566076",
  "#3f4759",
  "#262c3a",
];

export const raseedTheme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: {
    brand,
    slate,
  },
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  headings: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontWeight: "650",
    sizes: {
      h1: { fontSize: "2.6rem", lineHeight: "1.15" },
      h2: { fontSize: "2rem", lineHeight: "1.2" },
      h3: { fontSize: "1.5rem", lineHeight: "1.25" },
      h4: { fontSize: "1.2rem", lineHeight: "1.3" },
      h5: { fontSize: "1rem", lineHeight: "1.35" },
    },
  },
  defaultRadius: "md",
  radius: {
    xs: "4px",
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
  },
  shadows: {
    xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
    sm: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
    md: "0 4px 14px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
    lg: "0 16px 32px -8px rgba(15, 23, 42, 0.12), 0 6px 12px -4px rgba(15, 23, 42, 0.06)",
    xl: "0 24px 56px -12px rgba(15, 23, 42, 0.18)",
  },
  components: {
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 550,
          letterSpacing: "-0.005em",
        },
      },
    },
    Anchor: {
      defaultProps: {
        underline: "hover",
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "none",
        },
      },
    },
    Card: { defaultProps: { radius: "md" } },
    Modal: { defaultProps: { radius: "lg" } },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    NumberInput: { defaultProps: { radius: "md" } },
    Textarea: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    MultiSelect: { defaultProps: { radius: "md" } },
    Accordion: {
      styles: {
        item: {
          borderRadius: "var(--mantine-radius-md)",
        },
      },
    },
  },
});

/**
 * Brand-specific CSS variables exposed to consumers (gradients, surfaces).
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--raseed-gradient-hero":
      "linear-gradient(135deg, #4853e7 0%, #7b5fe8 50%, #2730a1 100%)",
    "--raseed-gradient-soft":
      "linear-gradient(135deg, rgba(72,83,231,0.10) 0%, rgba(123,95,232,0.06) 100%)",
  },
  light: {
    "--raseed-page-bg": "#f7f8fa",
    "--raseed-surface": "#ffffff",
    "--raseed-border": "var(--mantine-color-slate-2)",
    "--raseed-muted": "var(--mantine-color-slate-6)",
    "--raseed-hairline": "rgba(15, 23, 42, 0.08)",
  },
  dark: {
    "--raseed-page-bg": "var(--mantine-color-dark-8)",
    "--raseed-surface": "var(--mantine-color-dark-7)",
    "--raseed-border": "var(--mantine-color-dark-4)",
    "--raseed-muted": "var(--mantine-color-dark-2)",
    "--raseed-hairline": "rgba(255, 255, 255, 0.08)",
  },
});
