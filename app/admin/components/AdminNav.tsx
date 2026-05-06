"use client";

import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Text,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/app/components/Brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const isLoginPath = pathname?.startsWith("/admin/login");
  const isDemoPath = pathname?.startsWith("/admin/demo");
  const showAuthedLinks = !isLoginPath && !isDemoPath;

  useEffect(() => {
    if (!showAuthedLinks) return;
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setEmail(user?.email ?? null);
      } catch {
        // ignore — provider not configured / network issue
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showAuthedLinks]);

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

  const isOrgsActive = pathname === "/admin";
  const isAccountActive = pathname?.startsWith("/admin/account");

  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        background: "rgba(255,255,255,0.78)",
        borderBottom: "1px solid var(--raseed-hairline)",
      }}
    >
      <Container size="xl">
        <Group h={60} justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Anchor component={Link} href="/" underline="never">
              <BrandWordmark size={26} />
            </Anchor>
            {isDemoPath ? (
              <Badge color="yellow" variant="light" size="sm">
                Demo mode
              </Badge>
            ) : (
              <Badge color="brand" variant="light" size="sm">
                Admin
              </Badge>
            )}
          </Group>

          <Group gap={4} wrap="nowrap">
            {showAuthedLinks ? (
              <>
                <Button
                  component={Link}
                  href="/admin"
                  variant={isOrgsActive ? "light" : "subtle"}
                  color={isOrgsActive ? "brand" : "gray"}
                  size="xs"
                  radius="md"
                >
                  Organizations
                </Button>
                <Menu
                  shadow="md"
                  width={220}
                  position="bottom-end"
                  withArrow
                  arrowPosition="center"
                >
                  <Menu.Target>
                    <Button
                      variant={isAccountActive ? "light" : "subtle"}
                      color={isAccountActive ? "brand" : "gray"}
                      size="xs"
                      radius="md"
                      rightSection={<IconChevronDown size={12} />}
                      leftSection={<IconUserCircle size={14} />}
                    >
                      {email ? email.split("@")[0] : "Account"}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {email ? (
                      <Menu.Label>
                        <Text size="xs" truncate>
                          {email}
                        </Text>
                      </Menu.Label>
                    ) : null}
                    <Menu.Item
                      component={Link}
                      href="/admin/account"
                      leftSection={<IconUserCircle size={14} />}
                    >
                      Account settings
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={14} />}
                      onClick={() => void handleSignOut()}
                      disabled={signingOut}
                    >
                      {signingOut ? "Signing out…" : "Sign out"}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : null}
            {isDemoPath ? (
              <Button
                component={Link}
                href="/admin/login"
                variant="light"
                color="brand"
                size="xs"
                radius="md"
              >
                Sign in
              </Button>
            ) : null}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
