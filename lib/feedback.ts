/** Stored in `public.feedback.category` — keep in sync with migration CHECK constraint. */
export const FEEDBACK_CATEGORIES = [
  {
    value: "bug",
    label: "Something broke",
    hint: "Errors, confusing flows, or things not working",
  },
  {
    value: "feature",
    label: "Feature idea",
    hint: "Something that would make Raseed better for you",
  },
  {
    value: "question",
    label: "Question",
    hint: "How something works or whether we support it",
  },
  {
    value: "account",
    label: "Account / access",
    hint: "Signing in, org setup, or permissions",
  },
  {
    value: "other",
    label: "Something else",
    hint: "Anything that doesn’t fit above",
  },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

export const FEEDBACK_CATEGORY_VALUES: FeedbackCategory[] =
  FEEDBACK_CATEGORIES.map((c) => c.value);

export function isFeedbackCategory(v: string): v is FeedbackCategory {
  return FEEDBACK_CATEGORY_VALUES.includes(v as FeedbackCategory);
}

/** Derive a coarse `source` for analytics — FAB uses pathname; explicit buttons override. */
export function feedbackSourceFromPathname(pathname: string | null): string {
  if (!pathname || pathname === "/") return "landing";
  if (pathname.startsWith("/admin/login")) return "admin-login";
  if (pathname.startsWith("/admin/demo")) return "admin-demo";
  if (pathname.startsWith("/admin/o/") && pathname.includes("/template")) {
    return "admin-template";
  }
  if (pathname.startsWith("/admin/account")) return "admin-account";
  if (pathname.startsWith("/admin/auth/")) return "admin-auth";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/legacy") return "legacy";
  if (pathname === "/demo") return "demo";
  const seg = pathname.replace(/^\//, "").split("/")[0];
  if (seg && !seg.includes(".")) return `tenant:${seg}`;
  return "app";
}
