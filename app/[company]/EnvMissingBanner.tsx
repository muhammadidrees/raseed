"use client";

import "@mantine/core/styles.css";

import { Alert, Code, MantineProvider, Stack, Text, Title, createTheme } from "@mantine/core";

const theme = createTheme({});

export function EnvMissingBanner({ slug }: { slug: string }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Stack p="xl" maw={640}>
        <Title order={3}>Supabase not configured</Title>
        <Alert title="Environment variables" color="blue">
          <Text size="sm">
            Add <Code>NEXT_PUBLIC_SUPABASE_URL</Code> and{" "}
            <Code>NEXT_PUBLIC_SUPABASE_ANON_KEY</Code> to{" "}
            <Code>.env.local</Code>, run the SQL migration in{" "}
            <Code>supabase/migrations/</Code> on your Supabase project, then reload.
          </Text>
        </Alert>
        <Text size="sm" c="dimmed">
          Requested tenant slug: <Code>{slug}</Code>
        </Text>
      </Stack>
    </MantineProvider>
  );
}
