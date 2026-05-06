"use client";

import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { useInvoiceShell } from "../context/InvoiceShellContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

/**
 * Renders a subtle "Admin" button when the current visitor is signed in AND
 * a member of the org the contractor view belongs to. Invisible otherwise
 * (so contractors who aren't admins never see it).
 */
export function AdminJumpPill() {
  const { storageNamespace } = useInvoiceShell();
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!storageNamespace) {
      setIsMember(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id, organizations!inner ( slug )")
          .eq("user_id", user.id);
        if (error) return;

        type Row = {
          organization_id: string;
          organizations:
            | { slug: string }
            | { slug: string }[]
            | null;
        };
        const member = (data as unknown as Row[] | null)?.some((r) => {
          const slug = Array.isArray(r.organizations)
            ? r.organizations[0]?.slug
            : r.organizations?.slug;
          return slug === storageNamespace;
        });
        if (!cancelled) setIsMember(Boolean(member));
      } catch {
        // Silent — supabase not configured / network failed; just hide the pill.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageNamespace]);

  if (!isMember || !storageNamespace) return null;

  return (
    <Button
      component={Link}
      href={`/admin/o/${encodeURIComponent(storageNamespace)}/template`}
      variant="light"
      color="blue"
      size="compact-xs"
      leftSection={<IconSettings size={12} />}
    >
      Open admin
    </Button>
  );
}
