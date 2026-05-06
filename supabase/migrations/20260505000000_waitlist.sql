-- Waitlist for raseedhq.com landing page. Anyone can submit; only service
-- role / authenticated dashboard can read.

CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_name text,
  contractor_count integer,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_email_lower ON public.waitlist (lower(email));
CREATE INDEX idx_waitlist_created_at_desc ON public.waitlist (created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit a waitlist entry.
CREATE POLICY waitlist_public_insert
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Nobody can SELECT/UPDATE/DELETE through RLS. The owner reads via the
-- Supabase MCP / SQL editor (service role bypasses RLS).
