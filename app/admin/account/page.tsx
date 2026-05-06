"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login?next=/admin/account");
        return;
      }
      setEmail(user.email ?? null);
    })();
  }, [router]);

  const form = useForm<{ newPassword: string; confirmPassword: string }>({
    initialValues: { newPassword: "", confirmPassword: "" },
    validate: {
      newPassword: (v) =>
        v.length < 8 ? "Use at least 8 characters" : null,
      confirmPassword: (v, values) =>
        v !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      if (error) throw error;
      form.reset();
      notifications.show({
        title: "Password updated",
        message: "You can use the new password from now on.",
        color: "teal",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not update password";
      notifications.show({ title: "Error", message, color: "red" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Stack>
        <Title order={3}>Account</Title>
      <Paper withBorder p="md">
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Signed in as
          </Text>
          <Text fw={500}>{email ?? "…"}</Text>
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Title order={5} mb="sm">
          Change password
        </Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <PasswordInput
              label="New password"
              required
              autoComplete="new-password"
              {...form.getInputProps("newPassword")}
            />
            <PasswordInput
              label="Confirm new password"
              required
              autoComplete="new-password"
              {...form.getInputProps("confirmPassword")}
            />
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          </Stack>
        </form>
      </Paper>
      </Stack>
    </Container>
  );
}
