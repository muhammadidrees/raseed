"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Button,
  createTheme,
  Group,
  Loader,
  MantineProvider,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import App from "@/app/app";
import {
  loadDemoTemplate,
} from "@/lib/demo-template";
import type { InvoiceTemplateConfig } from "@/lib/invoice-template";

const theme = createTheme({});

export function DemoClientPage() {
  const [state, setState] = useState<{
    config: InvoiceTemplateConfig;
    orgName: string;
    isPublished: boolean;
  } | null>(null);

  useEffect(() => {
    setState(loadDemoTemplate());
  }, []);

  if (!state) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Stack align="center" p="xl">
          <Loader />
        </Stack>
      </MantineProvider>
    );
  }

  if (!state.isPublished) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Stack p="xl" maw={560} mx="auto" mt="xl">
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Text fw={600}>Demo template is unpublished</Text>
              <Text size="sm" c="dimmed">
                In real usage, contractors only see your template once you
                publish it. Toggle <b>Published</b> in the demo editor to enable
                the live form.
              </Text>
              <Group>
                <Button
                  component={Link}
                  href="/admin/demo"
                  leftSection={<IconEdit size={14} />}
                >
                  Open demo editor
                </Button>
                <Button
                  component={Link}
                  href="/"
                  variant="default"
                  leftSection={<IconArrowLeft size={14} />}
                >
                  Back to home
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </MantineProvider>
    );
  }

  const exportFileLabel =
    state.config.exportName?.trim() ||
    state.orgName.trim().split(/\s+/)[0] ||
    "Demo";

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <Paper
        withBorder={false}
        radius={0}
        p="xs"
        style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Group justify="space-between" px="md">
          <Text size="xs" c="yellow.6">
            Demo mode — this page is generated from the template you edited in
            your browser.
          </Text>
          <Group gap="md">
            <Anchor component={Link} href="/admin/demo" size="xs">
              Edit demo template
            </Anchor>
            <Anchor component={Link} href="/" size="xs" c="dimmed">
              Home
            </Anchor>
          </Group>
        </Group>
      </Paper>
      <App
        storageNamespace="demo"
        exportFileLabel={exportFileLabel}
        organizationDisplayName={state.orgName}
        templateConfig={state.config}
      />
    </MantineProvider>
  );
}
