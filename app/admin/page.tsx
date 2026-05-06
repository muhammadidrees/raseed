"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconEdit, IconExternalLink } from "@tabler/icons-react";
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
      <Stack align="center" p="xl">
        <Loader />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack p="xl">
        <Text c="red">{error}</Text>
      </Stack>
    );
  }

  if (orgs.length === 0) {
    return (
      <Container size="sm" py="xl">
        <Stack>
          <Title order={3}>No organizations yet</Title>
          <Text size="sm" c="dimmed">
            You&apos;re signed in but you haven&apos;t been added to any
            organization. The Raseed owner needs to add your user id to{" "}
            <code>organization_members</code>. See <code>AGENTS.md</code> for
            the provisioning runbook.
          </Text>
          <Anchor component={Link} href="/admin/demo" size="sm">
            Try the demo template editor →
          </Anchor>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack>
        <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Title order={3}>Your organizations</Title>
          <Text size="sm" c="dimmed">
            {orgs.length === 1
              ? "1 organization"
              : `${orgs.length} organizations`}
          </Text>
        </Stack>
      </Group>

      <Stack gap="sm">
        {orgs.map((o) => {
          const editHref = `/admin/o/${encodeURIComponent(o.slug)}/template`;
          const liveHref = `/${encodeURIComponent(o.slug)}`;
          return (
            <Paper key={o.id} withBorder p="md" radius="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4}>
                  <Group gap="xs">
                    <Text fw={600}>{o.name}</Text>
                    {o.isPublished ? (
                      <Badge color="teal" variant="light" size="sm">
                        Published
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light" size="sm">
                        Draft
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      /{o.slug}
                    </Text>
                    <Text size="xs" c="dimmed">
                      · last updated {formatRelative(o.updatedAt)}
                    </Text>
                  </Group>
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    component={Link}
                    href={editHref}
                    variant="filled"
                    size="xs"
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
                    size="xs"
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

      <Text size="xs" c="dimmed" mt="md">
        Need a new organization? Provision it via the runbook in{" "}
        <code>AGENTS.md</code> — self-serve signup ships after closed alpha.
      </Text>
      </Stack>
    </Container>
  );
}
