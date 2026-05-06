"use client";

import { useState } from "react";
import {
  Button,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
  Text,
  Paper,
} from "@mantine/core";
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
        err instanceof Error ? err.message : "Could not submit. Try again later.";
      notifications.show({ title: "Submission failed", message, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Paper withBorder p="lg" radius="md">
        <Stack gap="xs">
          <Text fw={600}>You&apos;re on the list.</Text>
          <Text size="sm" c="dimmed">
            We&apos;re onboarding new orgs by hand right now. Expect a reply
            within a few business days.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Email"
            placeholder="you@company.com"
            required
            type="email"
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Company name"
            placeholder="e.g. Acme Logistics"
            {...form.getInputProps("companyName")}
          />
          <NumberInput
            label="How many contractors send you invoices?"
            placeholder="approx."
            min={0}
            max={1000}
            {...form.getInputProps("contractorCount")}
          />
          <Textarea
            label="What's the biggest pain in your current invoice flow?"
            placeholder="Optional"
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps("message")}
          />
          <Button type="submit" loading={submitting}>
            Get early access
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
