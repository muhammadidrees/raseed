"use client";

import { useState } from "react";
import {
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconSend2 } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

type FormShape = {
  email: string;
  companyName: string;
  contractorCount: number | string;
  message: string;
};

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormShape>({
    initialValues: {
      email: "",
      companyName: "",
      contractorCount: "",
      message: "",
    },
    validate: {
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
          ? null
          : "Enter a valid email address",
    },
  });

  const handleSubmit = async (values: FormShape) => {
    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const contractorCountNum =
        typeof values.contractorCount === "number"
          ? values.contractorCount
          : Number(values.contractorCount);

      const { error } = await supabase.from("waitlist").insert({
        email: values.email.trim(),
        company_name: values.companyName.trim() || null,
        contractor_count: Number.isFinite(contractorCountNum)
          ? Math.max(0, Math.floor(contractorCountNum))
          : null,
        message: values.message.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      form.reset();
      notifications.show({
        title: "Thanks!",
        message: "We'll be in touch within a few days.",
        color: "teal",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not submit. Try again later.";
      notifications.show({ title: "Submission failed", message, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Paper withBorder p="xl" radius="lg" shadow="sm">
        <Group gap="md" align="flex-start" wrap="nowrap">
          <ThemeIcon variant="light" color="teal" size={44} radius="md">
            <IconCheck size={22} />
          </ThemeIcon>
          <Stack gap={4}>
            <Text fw={600}>You&apos;re on the list.</Text>
            <Text size="sm" c="dimmed">
              We&apos;re onboarding new orgs by hand right now. Expect a reply
              within a few business days.
            </Text>
          </Stack>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="xl" radius="lg" shadow="sm">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Work email"
            placeholder="you@company.com"
            required
            type="email"
            size="md"
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Company name"
            placeholder="e.g. Acme Logistics"
            size="md"
            {...form.getInputProps("companyName")}
          />
          <NumberInput
            label="How many contractors send you invoices?"
            placeholder="approx."
            min={0}
            max={1000}
            size="md"
            {...form.getInputProps("contractorCount")}
          />
          <Textarea
            label="What's the biggest pain in your current invoice flow?"
            placeholder="Optional — wrong tax IDs, inconsistent numbering, missing currency…"
            autosize
            minRows={2}
            maxRows={5}
            size="md"
            {...form.getInputProps("message")}
          />
          <Button
            type="submit"
            loading={submitting}
            size="md"
            rightSection={<IconSend2 size={16} />}
          >
            Get early access
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            We&apos;ll only email you about your access — no marketing list,
            ever.
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
