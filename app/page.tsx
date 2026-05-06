import { redirect } from "next/navigation";
import { LandingPage } from "./components/LandingPage";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Belt-and-braces magic-link handling.
 *
 * Supabase Auth's "Site URL" is its redirect-of-last-resort: if the URL passed
 * to `signInWithOtp({ emailRedirectTo })` isn't on the redirect-URLs allow-
 * list, Supabase quietly rewrites the link to `Site URL/?code=...`. That land
 * here, on the marketing page, with no code-exchange logic. So we forward any
 * `?code=` to the proper handler.
 *
 * The same applies to `?error=` / `?error_description=` (which Supabase
 * appends when it can't redirect to the requested URL).
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const code = firstParam(params.code);
  const error = firstParam(params.error_description) ?? firstParam(params.error);

  if (code) {
    const next = firstParam(params.next) ?? "/admin";
    const target = `/admin/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
    redirect(target);
  }

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error)}`);
  }

  return <LandingPage />;
}
