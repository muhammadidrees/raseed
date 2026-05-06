"use client";

import { Anchor, Button, Group, Paper, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const isLoginPath = pathname?.startsWith("/admin/login");
  const isDemoPath = pathname?.startsWith("/admin/demo");
  const showAuthedLinks = !isLoginPath && !isDemoPath;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <Paper
      withBorder={false}
      radius={0}
      p="sm"
      mb="md"
      style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <Text fw={600} size="sm">
            Raseed admin
          </Text>
          {isDemoPath ? (
            <Text size="xs" c="yellow.6" fw={500}>
              demo mode
            </Text>
          ) : null}
        </Group>
        <Group gap="md">
          {showAuthedLinks ? (
            <Anchor component={Link} href="/admin" size="sm">
              Organizations
            </Anchor>
          ) : null}
          {showAuthedLinks ? (
            <Anchor component={Link} href="/admin/account" size="sm">
              Account
            </Anchor>
          ) : null}
          {isDemoPath ? (
            <Anchor component={Link} href="/admin/login" size="sm">
              Sign in
            </Anchor>
          ) : null}
          <Anchor component={Link} href="/" size="sm" c="dimmed">
            Home
          </Anchor>
          {showAuthedLinks ? (
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              loading={signingOut}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          ) : null}
        </Group>
      </Group>
    </Paper>
  );
}
