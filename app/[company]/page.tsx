import { notFound } from "next/navigation";
import { fetchPublishedTemplateBySlug } from "@/lib/supabase/fetch-published-template";
import { CompanyClientPage } from "./CompanyClientPage";
import { EnvMissingBanner } from "./EnvMissingBanner";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;

  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseEnv) {
    return <EnvMissingBanner slug={company} />;
  }

  const template = await fetchPublishedTemplateBySlug(company);
  if (!template) {
    notFound();
  }

  return <CompanyClientPage template={template} />;
}
