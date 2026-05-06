"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBuildingStore,
  IconCircleCheck,
  IconEdit,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

type AdminOrg = {
  id: string;
  slug: string;
  name: string;
  isPublished: boolean;
  updatedAt: string | null;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
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

        const orgInfos: { id: string; slug: string; name: string }[] = [];
        for (const r of (memberRows as unknown as Row[] | null) ?? []) {
          const o = Array.isArray(r.organizations)
            ? r.organizations[0]
            : r.organizations;
          if (o) orgInfos.push(o);
        }

        if (orgInfos.length === 0) {
          if (!cancelled) setOrgs([]);
          return;
        }

        const orgIds = orgInfos.map((o) => o.id);
        const { data: templates, error: tErr } = await supabase
          .from("invoice_templates")
          .select("organization_id, is_published, updated_at")
          .in("organization_id", orgIds);
        if (tErr) throw tErr;

        type Tmpl = {
          organization_id: string;
          is_published: boolean;
          updated_at: string;
        };
        const templateByOrgId = new Map<string, Tmpl>();
        for (const t of (templates as Tmpl[] | null) ?? []) {
          templateByOrgId.set(t.organization_id, t);
        }

        const merged: AdminOrg[] = orgInfos.map((o) => {
          const t = templateByOrgId.get(o.id);
          return {
            id: o.id,
            slug: o.slug,
            name: o.name,
            isPublished: t?.is_published ?? false,
            updatedAt: t?.updated_at ?? null,
          };
        });
        merged.sort((a, b) => a.name.localeCompare(b.name));

        if (!cancelled) setOrgs(merged);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load organizations",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <Stack align="center" justify="center" mih={320} gap="xs">
        <Loader color="brand" />
        <Text size="sm" c="dimmed">
          Loading your organizations…
        </Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="lg" radius="md">
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon variant="light" color="red" radius="md" size={40}>
              <IconAlertCircle size={20} />
            </ThemeIcon>
            <Stack gap={4}>
              <Text fw={600}>Couldn&apos;t load your organizations</Text>
              <Text size="sm" c="dimmed">
                {error}
              </Text>
            </Stack>
          </Group>
        </Paper>
      </Container>
    );
  }

  if (orgs.length === 0) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="lg">
          <Stack gap="md" align="center" ta="center">
            <ThemeIcon variant="light" color="brand" size={56} radius="md">
              <IconBuildingStore size={28} />
            </ThemeIcon>
            <Title order={3}>No organizations yet</Title>
            <Text size="sm" c="dimmed" maw={420}>
              You&apos;re signed in but haven&apos;t been added to an
              organization yet. The Raseed owner needs to add your user id to{" "}
              <Text span ff="monospace" inherit>
                organization_members
              </Text>
              .
            </Text>
            <Button
              component={Link}
              href="/admin/demo"
              variant="light"
              leftSection={<IconSparkles size={14} />}
            >
              Try the demo editor
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={2}>Your organizations</Title>
          <Text size="sm" c="dimmed">
            {orgs.length === 1
              ? "1 organization"
              : `${orgs.length} organizations`}
            {" · "}
            Pick one to edit its invoice template.
          </Text>
        </Stack>

        <Stack gap="sm">
          {orgs.map((o) => {
            const editHref = `/admin/o/${encodeURIComponent(o.slug)}/template`;
            const liveHref = `/${encodeURIComponent(o.slug)}`;
            const initial = (o.name || o.slug).trim().charAt(0).toUpperCase();
            return (
              <Paper
                key={o.id}
                withBorder
                p="lg"
                radius="md"
                className="raseed-hover-lift"
              >
                <Group
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap="md"
                >
                  <Group gap="md" wrap="nowrap">
                    <Avatar
                      size={44}
                      radius="md"
                      color="brand"
                      variant="filled"
                      style={{
                        background: "var(--raseed-gradient-hero)",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      {initial || "·"}
                    </Avatar>
                    <Stack gap={2}>
                      <Group gap="xs" wrap="nowrap">
                        <Text fw={600} size="md">
                          {o.name}
                        </Text>
                        {o.isPublished ? (
                          <Badge
                            color="teal"
                            variant="light"
                            size="sm"
                            leftSection={<IconCircleCheck size={11} />}
                          >
                            Published
                          </Badge>
                        ) : (
                          <Badge color="gray" variant="light" size="sm">
                            Draft
                          </Badge>
                        )}
                      </Group>
                      <Group gap={6}>
                        <Text size="sm" c="dimmed" ff="monospace">
                          /{o.slug}
                        </Text>
                        <Text size="xs" c="dimmed">
                          · updated {formatRelative(o.updatedAt)}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      component={Link}
                      href={editHref}
                      variant="filled"
                      size="sm"
                      leftSection={<IconEdit size={14} />}
                    >
                      Edit template
                    </Button>
                    <Button
                      component={Link}
                      href={liveHref}
                      target="_blank"
                      rel="noreferrer"
                      variant="default"
                      size="sm"
                      rightSection={<IconExternalLink size={14} />}
                      disabled={!o.isPublished}
                      title={
                        o.isPublished
                          ? "Open the live contractor view"
                          : "Publish this template first"
                      }
                    >
                      View live
                    </Button>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>

        <Box>
          <Text size="xs" c="dimmed">
            Need a new organization?{" "}
            <Anchor href="mailto:hello@raseedhq.com" size="xs">
              Email us
            </Anchor>{" "}
            — self-serve signup ships after closed alpha.
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
