"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconExternalLink,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { TemplateEditorForm } from "@/app/components/admin/TemplateEditorForm";
import { TemplatePdfPreview } from "@/app/components/admin/TemplatePdfPreview";
import {
  configToForm,
  formToConfig,
  type TemplateFormShape,
} from "@/app/components/admin/template-form-helpers";
import { parseInvoiceTemplateConfig } from "@/lib/invoice-template";
import {
  getDemoDefaults,
  loadDemoTemplate,
  resetDemoTemplate,
  saveDemoTemplate,
} from "@/lib/demo-template";

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(true);

  const form = useForm<TemplateFormShape>({
    initialValues: configToForm(parseInvoiceTemplateConfig({}), "", true),
  });

  useEffect(() => {
    const { config, orgName, isPublished } = loadDemoTemplate();
    form.setValues(configToForm(config, orgName, isPublished));
    setLoading(false);
    // form.setValues is stable; intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveConfig = useMemo(
    () => formToConfig(form.values),
    [form.values],
  );

  const handleSave = () => {
    const config = formToConfig(form.values);
    saveDemoTemplate({
      config,
      orgName: form.values.orgName.trim() || "Acme Inc",
      isPublished: form.values.isPublished,
    });
    notifications.show({
      title: "Saved to your browser",
      message:
        "Open the contractor view in a new tab to see your template live.",
      color: "teal",
    });
  };

  const handleReset = () => {
    resetDemoTemplate();
    const { config, orgName } = getDemoDefaults();
    form.setValues(configToForm(config, orgName, true));
    notifications.show({
      title: "Demo reset",
      message: "Form has been reset to the Acme defaults.",
      color: "blue",
    });
  };

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader />
      </Stack>
    );
  }

  return (
    <Container size="xl" px="md" py="md">
      <Stack gap="md">
        <Alert
          icon={<IconSparkles size={16} />}
          color="yellow"
          variant="light"
          title="Demo mode"
        >
          Nothing you change here is saved to a server — it lives in your
          browser only. Tweak the form on the left, watch the invoice on the
          right update. Click <b>Save</b> to keep your changes locally and{" "}
          <b>Open contractor view</b> to see the live form your contractors
          would fill in.
        </Alert>

        <Paper withBorder p="md" radius="md">
          <Group
            justify="space-between"
            align="flex-start"
            wrap="wrap"
            gap="md"
          >
            <Stack gap={4} miw={0}>
              <Group gap="xs">
                <Button
                  component={Link}
                  href="/"
                  variant="subtle"
                  size="compact-xs"
                  color="gray"
                  leftSection={<IconArrowLeft size={12} />}
                >
                  Back to home
                </Button>
              </Group>
              <Group gap="xs">
                <Title order={3} mb={0}>
                  {form.values.orgName || "Acme Inc"}
                </Title>
                <Badge color="yellow" variant="light">
                  Demo
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                Browser-local — contractor preview at{" "}
                <Link href="/demo">/demo</Link>
              </Text>
            </Stack>
            <Group gap="xs" wrap="nowrap">
              <Tooltip label="Reset everything to Acme defaults">
                <Button
                  variant="subtle"
                  size="sm"
                  color="gray"
                  leftSection={<IconRefresh size={14} />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Tooltip>
              <Button
                component={Link}
                href="/demo"
                target="_blank"
                rel="noreferrer"
                variant="default"
                size="sm"
                rightSection={<IconExternalLink size={14} />}
              >
                Contractor view
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                leftSection={<IconDeviceFloppy size={14} />}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Paper>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="sm">
              <Text size="xs" c="dimmed">
                Settings — these are your invoice rules. The preview on the
                right updates as you type.
              </Text>
              <TemplateEditorForm form={form} showPublishToggle={false} />
              <Group justify="flex-end">
                <Button
                  size="md"
                  onClick={handleSave}
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save changes
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Box
              style={{
                position: "sticky",
                top: 16,
                height: "calc(100vh - 32px)",
              }}
            >
              <Paper
                withBorder
                radius="md"
                p={0}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <Group
                  justify="space-between"
                  px="sm"
                  py={8}
                  style={{
                    borderBottom: "1px solid var(--mantine-color-dark-4)",
                  }}
                >
                  <Group gap="xs">
                    <Text size="xs" fw={600}>
                      Live preview
                    </Text>
                    <Badge color="blue" variant="light" size="xs">
                      Sample contractor
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    What contractors will see in their PDF
                  </Text>
                </Group>
                <Box style={{ flex: 1, minHeight: 0, background: "#525659" }}>
                  <TemplatePdfPreview
                    templateConfig={liveConfig}
                    organizationName={form.values.orgName || "Acme Inc"}
                  />
                </Box>
              </Paper>
            </Box>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
