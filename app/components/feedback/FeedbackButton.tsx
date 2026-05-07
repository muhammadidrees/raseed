"use client";

import { Button, type ButtonProps } from "@mantine/core";
import { IconMessage2 } from "@tabler/icons-react";
import type { FeedbackCategory } from "@/lib/feedback";
import { useFeedback } from "./FeedbackProvider";

export type FeedbackButtonProps = {
  /**
   * Stable label describing where the feedback came from (e.g. "admin-list",
   * "landing-footer"). Stored alongside the row.
   */
  source: string;
  /** Optional email pre-fill (e.g. signed-in admin). Editable in the modal. */
  defaultEmail?: string;
  defaultCategory?: FeedbackCategory;
  /** Override button label. Defaults to "Send feedback". */
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  color?: string;
  hideIcon?: boolean;
};

export function FeedbackButton({
  source,
  defaultEmail,
  defaultCategory,
  label = "Send feedback",
  variant = "subtle",
  size = "xs",
  color,
  hideIcon = false,
}: FeedbackButtonProps) {
  const { open } = useFeedback();

  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      leftSection={hideIcon ? undefined : <IconMessage2 size={14} />}
      onClick={() => open({ source, defaultEmail, defaultCategory })}
    >
      {label}
    </Button>
  );
}
