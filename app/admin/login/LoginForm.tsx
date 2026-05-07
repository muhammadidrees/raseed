"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Center,
  Code,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

function sanitizeNext(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      notifications.show({
        title: "Sign-in error",
        message: error,
        color: "red",
      });
    }
  }, [searchParams]);

  const next = sanitizeNext(searchParams.get("next"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.replace(next);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      notifications.show({ title: "Sign-in failed", message, color: "red" });
      setLoading(false);
    }
  };

  return (
    <Box
      className="raseed-auth-shell"
      style={{
        position: "relative",
        minHeight: "calc(100dvh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--mantine-spacing-md)",
        overflow: "hidden",
      }}
    >
      <div className="raseed-hero-glow raseed-auth-glow" aria-hidden />
      <Container
        size={420}
        w="100%"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Stack gap="lg">
          <Paper withBorder p="xl" radius="lg" shadow="md">
            <Stack gap="md">
              <Stack gap={6}>
                <Group gap="xs">
                  <IconLock size={18} color="var(--mantine-color-brand-6)" />
                  <Title order={3} mb={0}>
                    Welcome back
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Sign in to manage your invoice templates.
                  {next !== "/admin" ? (
                    <>
                      {" "}
                      We&apos;ll take you to <Code>{next}</Code> after.
                    </>
                  ) : null}
                </Text>
              </Stack>
              <Divider />
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="you@company.com"
                    type="email"
                    required
                    size="md"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    autoComplete="email"
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="••••••••"
                    required
                    size="md"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    autoComplete="current-password"
                  />
                  <Button type="submit" loading={loading} size="md" mt="xs">
                    Sign in
                  </Button>
                </Stack>
              </form>
              <Text size="xs" c="dimmed" ta="center">
                Forgot your password? Reply to your onboarding email and
                we&apos;ll reset it for you.
              </Text>
            </Stack>
          </Paper>
          <Center>
            <Anchor
              component={Link}
              href="/"
              size="sm"
              c="dimmed"
              underline="hover"
            >
              <Group gap={4}>
                <IconArrowLeft size={14} />
                Back to home
              </Group>
            </Anchor>
          </Center>
        </Stack>
      </Container>
    </Box>
  );
}
