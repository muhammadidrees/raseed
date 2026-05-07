"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconMessageCircle,
  IconSend2,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  feedbackSourceFromPathname,
  isFeedbackCategory,
} from "@/lib/feedback";

type OpenArgs = {
  source: string;
  defaultEmail?: string;
  defaultCategory?: FeedbackCategory;
};

type FeedbackContextValue = {
  open: (args: OpenArgs) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return ctx;
}

type FormShape = {
  category: FeedbackCategory | "";
  email: string;
  message: string;
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState<OpenArgs | null>(null);

  const selectData = useMemo(
    () =>
      FEEDBACK_CATEGORIES.map((c) => ({
        value: c.value,
        label: c.label,
      })),
    [],
  );

  const form = useForm<FormShape>({
    initialValues: {
      category: "",
      email: "",
      message: "",
    },
    validate: {
      category: (v) => (v ? null : "Pick a category so we can route this"),
      email: (v) => {
        const trimmed = v.trim();
        if (!trimmed) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
          ? null
          : "Enter a valid email or leave blank";
      },
      message: (v) =>
        v.trim().length >= 4 ? null : "Please write at least a few words",
    },
  });

  const handleClose = () => {
    closeModal();
    setTimeout(() => {
      setSubmitted(false);
      setSession(null);
      form.reset();
    }, 200);
  };

  const handleSubmit = async (values: FormShape) => {
    if (!session?.source || !isFeedbackCategory(values.category)) return;

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const path =
        typeof pathname === "string" && pathname.length > 0 ? pathname : null;

      const { error } = await supabase.from("feedback").insert({
        email: values.email.trim() || null,
        message: values.message.trim(),
        category: values.category,
        source: session.source,
        page_path: path,
        user_id: user?.id ?? null,
      });

      if (error) throw error;

      setSubmitted(true);
      notifications.show({
        title: "Thank you",
        message: "Your note was saved. We read everything we receive.",
        color: "teal",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not send right now. Try again shortly.";
      notifications.show({ title: "Could not send", message, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  const categoryHint =
    FEEDBACK_CATEGORIES.find((c) => c.value === form.values.category)?.hint ??
    null;

  const open = useCallback(
    (args: OpenArgs) => {
      setSession(args);
      setSubmitted(false);
      form.setValues({
        category: args.defaultCategory ?? "",
        email: args.defaultEmail?.trim() ?? "",
        message: "",
      });
      form.clearErrors();
      openModal();
    },
    // Mantine form helpers are stable for our usage; omit `form` to avoid churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.setValues/clearErrors only
    [openModal],
  );

  const value = useMemo(() => ({ open }), [open]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Stack gap={2}>
            <Text fw={600} size="lg">
              Talk to us
            </Text>
            <Text size="sm" c="dimmed" fw={400}>
              Straight to the team — no ticket robots.
            </Text>
          </Stack>
        }
        centered
        radius="md"
        size="md"
        overlayProps={{ backgroundOpacity: 0.45 }}
      >
        {submitted ? (
          <Stack gap="md" py="xs">
            <Group gap="md" align="flex-start" wrap="nowrap">
              <ThemeIcon variant="light" color="teal" size={40} radius="md">
                <IconCheck size={20} />
              </ThemeIcon>
              <Stack gap={6}>
                <Text fw={600}>We&apos;ve got it.</Text>
                <Text size="sm" c="dimmed">
                  If you shared an email, we&apos;ll only use it to follow up on
                  this — never for marketing.
                </Text>
              </Stack>
            </Group>
            <Group justify="flex-end">
              <Button onClick={handleClose}>Close</Button>
            </Group>
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="What is this about?"
                placeholder="Choose one…"
                data={selectData}
                required
                allowDeselect={false}
                nothingFoundMessage="No matches"
                {...form.getInputProps("category")}
              />

              {categoryHint ? (
                <Text size="xs" c="dimmed" mt={-8}>
                  {categoryHint}
                </Text>
              ) : null}

              <Textarea
                label="Details"
                description="Be as specific as you like — screen names, steps, or screenshots you describe in words all help."
                placeholder="What happened, what did you expect, and anything else we should know?"
                required
                autosize
                minRows={4}
                maxRows={12}
                maxLength={4000}
                {...form.getInputProps("message")}
              />

              <TextInput
                label="Email (optional)"
                description="Only if you want a reply. Leave blank to stay anonymous."
                placeholder="you@company.com"
                type="email"
                {...form.getInputProps("email")}
              />

              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={handleClose} type="button">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  rightSection={<IconSend2 size={14} />}
                >
                  Send
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </FeedbackContext.Provider>
  );
}

/** Fixed, low-contrast control — opens the shared feedback modal. */
export function FeedbackFab() {
  const pathname = usePathname();
  const { open } = useFeedback();

  /* Landing already surfaces feedback in the nav + footer; skip the FAB there. */
  if (pathname === "/") return null;

  return (
    <Tooltip
      label="Feedback"
      position="left"
      withArrow
      openDelay={400}
      events={{ hover: true, focus: true, touch: false }}
    >
      <ActionIcon
        variant="default"
        radius="xl"
        size="lg"
        aria-label="Send feedback"
        onClick={() =>
          open({ source: feedbackSourceFromPathname(pathname ?? null) })
        }
        styles={{
          root: {
            position: "fixed",
            right: "max(16px, env(safe-area-inset-right))",
            bottom: "max(16px, env(safe-area-inset-bottom))",
            zIndex: 100,
            boxShadow: "0 1px 8px rgba(15, 23, 42, 0.08)",
            border: "1px solid var(--raseed-hairline)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <IconMessageCircle size={18} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}
