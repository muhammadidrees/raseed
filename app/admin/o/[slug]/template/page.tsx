"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Switch,
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
  const [publishing, setPublishing] = useState(false);
  const [savedConfigJson, setSavedConfigJson] = useState<string>("");
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
      const next = configToForm(cfg, o.name, tmpl?.is_published ?? false);
      form.setValues(next);
      form.resetDirty(next);
      setSavedConfigJson(JSON.stringify(formToConfig(next)));
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

  /**
   * Publish/unpublish in isolation: contractors see /{slug} immediately
   * after this resolves. Publish is a one-bit lifecycle action so we
   * deliberately don't bundle it with the Settings save.
   */
  const togglePublish = async (next: boolean) => {
    if (!org || !templateId) return;
    setPublishing(true);
    // Optimistic: update local state so the Switch animates immediately.
    form.setFieldValue("isPublished", next);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("invoice_templates")
        .update({ is_published: next })
        .eq("id", templateId);
      if (error) throw error;
      notifications.show({
        title: next ? "Published" : "Unpublished",
        message: next
          ? `Contractors can now load /${org.slug}.`
          : `/${org.slug} is hidden again.`,
        color: next ? "teal" : "gray",
      });
    } catch (e: unknown) {
      // Roll back on failure
      form.setFieldValue("isPublished", !next);
      notifications.show({
        title: "Publish failed",
        message: e instanceof Error ? e.message : "Unknown error",
        color: "red",
      });
    } finally {
      setPublishing(false);
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
  const liveConfigJson = JSON.stringify(formToConfig(form.values));
  const hasUnsavedSettings =
    Boolean(templateId) && liveConfigJson !== savedConfigJson;

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
                    Live
                  </Badge>
                ) : (
                  <Badge color="gray" variant="light">
                    Draft
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {isPublished ? (
                  <>
                    Live URL:{" "}
                    <Link href={liveHref}>raseedhq.com/{org.slug}</Link>
                  </>
                ) : (
                  <>Live URL: raseedhq.com/{org.slug} (publish to enable)</>
                )}
              </Text>
            </Stack>
            <Group gap="md" wrap="nowrap" align="center">
              <Tooltip
                label={
                  !templateId
                    ? "Save the template at least once before publishing"
                    : isPublished
                      ? "Hide /" + org.slug + " from contractors"
                      : "Make /" + org.slug + " available to contractors"
                }
              >
                <Group gap={8} wrap="nowrap" align="center">
                  <Switch
                    size="md"
                    color="teal"
                    onLabel="LIVE"
                    offLabel="OFF"
                    checked={isPublished}
                    disabled={!templateId || publishing}
                    onChange={(e) =>
                      void togglePublish(e.currentTarget.checked)
                    }
                    label={isPublished ? "Published" : "Unpublished"}
                    labelPosition="left"
                    styles={{
                      label: {
                        fontSize: 12,
                        fontWeight: 600,
                        color: isPublished
                          ? "var(--mantine-color-teal-7)"
                          : "var(--raseed-muted)",
                        paddingInlineEnd: 8,
                      },
                    }}
                  />
                  {isPublished && hasUnsavedSettings ? (
                    <Tooltip label="You have unsaved settings — Save to push them live.">
                      <Badge color="orange" variant="light" size="xs">
                        Unsaved
                      </Badge>
                    </Tooltip>
                  ) : null}
                </Group>
              </Tooltip>
              <Divider orientation="vertical" />
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
                height: "min(calc(100vh - 32px), 760px)",
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
