import { parseInvoiceTemplateConfig, type PublishedInvoiceTemplate } from "@/lib/invoice-template";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";

export async function fetchPublishedTemplateBySlug(
  slug: string,
): Promise<PublishedInvoiceTemplate | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const normalized = slug.trim();
  if (!normalized) return null;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .ilike("slug", normalized)
    .maybeSingle();

  if (orgError || !org) return null;

  const { data: tmpl, error: tmplError } = await supabase
    .from("invoice_templates")
    .select("config")
    .eq("organization_id", org.id)
    .eq("is_published", true)
    .maybeSingle();

  if (tmplError || !tmpl) return null;

  return {
    slug: org.slug,
    organizationName: org.name,
    config: parseInvoiceTemplateConfig(tmpl.config),
  };
}
