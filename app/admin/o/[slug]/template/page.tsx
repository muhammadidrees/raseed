"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TemplateEditorForm } from "@/app/components/admin/TemplateEditorForm";
import { TemplatePdfPreview } from "@/app/components/admin/TemplatePdfPreview";
import {
  configToForm,
  formToConfig,
  type TemplateFormShape,
} from "@/app/components/admin/template-form-helpers";
import { parseInvoiceTemplateConfig } from "@/lib/invoice-template";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

type Org = { id: string; slug: string; name: string };

export default function AdminTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState<Org | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const form = useForm<TemplateFormShape>({
    initialValues: configToForm(parseInvoiceTemplateConfig({}), "", false),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: memberRows, error: mErr } = await supabase
        .from("organization_members")
        .select("organization_id, organizations ( id, slug, name )")
        .eq("user_id", user.id);

      if (mErr) throw mErr;

      type Row = {
        organization_id: string;
        organizations:
          | { id: string; slug: string; name: string }
          | { id: string; slug: string; name: string }[]
          | null;
      };

      const match = (memberRows as unknown as Row[] | null)?.find((r) => {
        const o = r.organizations;
        const orgSlug = Array.isArray(o) ? o[0]?.slug : o?.slug;
        return orgSlug === slug;
      });
      const rawOrg = match?.organizations;
      const o = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
      if (!o) {
        setOrg(null);
        return;
      }
      setOrg(o);

      const { data: tmpl, error: tErr } = await supabase
        .from("invoice_templates")
        .select("id, config, is_published")
        .eq("organization_id", o.id)
        .maybeSingle();

      if (tErr) throw tErr;

      const cfg = parseInvoiceTemplateConfig(tmpl?.config ?? {});
      setTemplateId(tmpl?.id ?? null);
      form.setValues(configToForm(cfg, o.name, tmpl?.is_published ?? false));
    } catch (e: unknown) {
      notifications.show({
        title: "Load failed",
        message: e instanceof Error ? e.message : "Unknown error",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
    // form.setValues is stable; omit form from deps to avoid reload loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const liveConfig = useMemo(() => formToConfig(form.values), [form.values]);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const config = formToConfig(form.values);

      if (templateId) {
        const { error } = await supabase
          .from("invoice_templates")
          .update({
            config,
            is_published: form.values.isPublished,
          })
          .eq("id", templateId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("invoice_templates")
          .insert({
            organization_id: org.id,
            config,
            is_published: form.values.isPublished,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (data?.id) setTemplateId(data.id);
      }

      const { error: orgErr } = await supabase
        .from("organizations")
        .update({ name: form.values.orgName.trim() || org.name })
        .eq("id", org.id);
      if (orgErr) throw orgErr;

      notifications.show({
        title: "Saved",
        message: "Template updated.",
        color: "teal",
      });
      await load();
    } catch (e: unknown) {
      notifications.show({
        title: "Save failed",
        message: e instanceof Error ? e.message : "Unknown error",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader />
      </Stack>
    );
  }

  if (!org) {
    return (
      <Container size="sm" p="xl">
        <Stack>
          <Text c="dimmed">
            Organization not found or you are not a member.
          </Text>
          <Button
            component={Link}
            href="/admin"
            variant="light"
            leftSection={<IconArrowLeft size={14} />}
            w="fit-content"
          >
            All orgs
          </Button>
        </Stack>
      </Container>
    );
  }

  const isPublished = form.values.isPublished;
  const liveHref = `/${encodeURIComponent(org.slug)}`;

  return (
    <Container size="xl" px="md" py="md">
      <Stack gap="md">
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
                  href="/admin"
                  variant="subtle"
                  size="compact-xs"
                  color="gray"
                  leftSection={<IconArrowLeft size={12} />}
                >
                  All orgs
                </Button>
              </Group>
              <Group gap="xs">
                <Title order={3} mb={0}>
                  {form.values.orgName || org.name}
                </Title>
                {isPublished ? (
                  <Badge color="teal" variant="light">
                    Published
                  </Badge>
                ) : (
                  <Badge color="gray" variant="light">
                    Draft
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                Live URL:{" "}
                {isPublished ? (
                  <Link href={liveHref}>/{org.slug}</Link>
                ) : (
                  <span>/{org.slug} (publish to enable)</span>
                )}
              </Text>
            </Stack>
            <Group gap="xs" wrap="nowrap">
              <Tooltip
                label={
                  isPublished
                    ? "Open the live contractor view in a new tab"
                    : "Publish first to share this URL"
                }
              >
                <span>
                  <Button
                    component={Link}
                    href={liveHref}
                    target="_blank"
                    rel="noreferrer"
                    variant="default"
                    size="sm"
                    rightSection={<IconExternalLink size={14} />}
                    disabled={!isPublished}
                  >
                    Open live
                  </Button>
                </span>
              </Tooltip>
              <Button
                size="sm"
                loading={saving}
                onClick={() => void handleSave()}
                leftSection={<IconDeviceFloppy size={14} />}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Paper>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="sm">
              <Text size="xs" c="dimmed">
                Settings — these are your invoice rules. The preview on the
                right updates as you type.
              </Text>
              <TemplateEditorForm form={form} />
              <Group justify="flex-end">
                <Button
                  size="md"
                  loading={saving}
                  onClick={() => void handleSave()}
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save changes
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
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
                    borderBottom: "1px solid var(--raseed-hairline)",
                    background: "var(--mantine-color-body)",
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
                <Box
                  style={{
                    flex: 1,
                    minHeight: 0,
                    background: "var(--raseed-page-bg)",
                  }}
                >
                  <TemplatePdfPreview
                    templateConfig={liveConfig}
                    organizationName={form.values.orgName || org.name}
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
