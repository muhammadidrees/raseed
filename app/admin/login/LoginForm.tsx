"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
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
    <Stack align="center" w="100%" p="xl">
      <Paper withBorder p="xl" maw={420} w="100%">
        <Title order={3} mb="md">
          Admin sign in
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Use the email and password we sent you. You can change your password
          after signing in.
          {next !== "/admin" ? (
            <>
              {" "}
              After signing in you will be redirected to <code>{next}</code>.
            </>
          ) : null}
        </Text>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="email"
            />
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </Stack>
        </form>
        <Text size="xs" c="dimmed" mt="md">
          Forgot your password? Reply to your onboarding email and we&apos;ll
          reset it for you.
        </Text>
        <Anchor component={Link} href="/" size="sm" mt="md" display="block">
          Back to home
        </Anchor>
      </Paper>
    </Stack>
  );
}
