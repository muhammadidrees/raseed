"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconEdit, IconFlask } from "@tabler/icons-react";
import Link from "next/link";
import App from "@/app/app";
import { AppTheme } from "@/app/components/AppTheme";
import { loadDemoTemplate } from "@/lib/demo-template";
import type { InvoiceTemplateConfig } from "@/lib/invoice-template";

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
      <AppTheme>
        <Stack align="center" p="xl">
          <Loader />
        </Stack>
      </AppTheme>
    );
  }

  if (!state.isPublished) {
    return (
      <AppTheme>
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
      </AppTheme>
    );
  }

  const exportFileLabel =
    state.config.exportName?.trim() ||
    state.orgName.trim().split(/\s+/)[0] ||
    "Demo";

  return (
    <AppTheme>
      <Paper
        withBorder={false}
        radius={0}
        p="xs"
        style={{ borderBottom: "1px solid var(--raseed-hairline)" }}
      >
        <Group justify="space-between" px="md" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Badge
              color="yellow"
              variant="light"
              size="sm"
              leftSection={<IconFlask size={11} />}
            >
              Demo mode
            </Badge>
            <Text size="xs" c="dimmed" visibleFrom="sm">
              Generated from the template you edited in your browser.
            </Text>
          </Group>
          <Group gap="md">
            <Anchor component={Link} href="/admin/demo" size="xs" fw={500}>
              Edit template
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
    </AppTheme>
  );
}
