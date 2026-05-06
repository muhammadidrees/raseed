"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconKey, IconUser } from "@tabler/icons-react";
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
      newPassword: (v) => (v.length < 8 ? "Use at least 8 characters" : null),
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
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={2}>Account</Title>
          <Text size="sm" c="dimmed">
            Manage how you sign in.
          </Text>
        </Stack>

        <Paper withBorder p="lg" radius="md">
          <Group gap="md" wrap="nowrap">
            <Avatar
              size={48}
              radius="md"
              style={{
                background: "var(--raseed-gradient-hero)",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {(email ?? "·").charAt(0).toUpperCase()}
            </Avatar>
            <Stack gap={2}>
              <Group gap={6}>
                <IconUser size={14} color="var(--raseed-muted)" />
                <Text size="xs" c="dimmed" tt="uppercase" lts="0.06em">
                  Signed in as
                </Text>
              </Group>
              <Text fw={600}>{email ?? "…"}</Text>
            </Stack>
          </Group>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <Group gap={6}>
              <IconKey size={16} color="var(--mantine-color-brand-6)" />
              <Title order={5}>Change password</Title>
            </Group>
            <Divider />
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <PasswordInput
                  label="New password"
                  required
                  size="md"
                  autoComplete="new-password"
                  {...form.getInputProps("newPassword")}
                />
                <PasswordInput
                  label="Confirm new password"
                  required
                  size="md"
                  autoComplete="new-password"
                  {...form.getInputProps("confirmPassword")}
                />
                <Group justify="flex-end" mt="xs">
                  <Button type="submit" loading={saving}>
                    Update password
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
