-- Raseed: organizations, members, published invoice templates (public read by slug)

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE public.invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations (id) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug_lower ON public.organizations (lower(slug));

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read org rows that have a published template (contractor app)
CREATE POLICY organizations_public_read_with_published_template
  ON public.organizations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoice_templates t
      WHERE
        t.organization_id = organizations.id
        AND t.is_published = true
    )
  );

-- Members can always read their organizations (admin, including unpublished)
CREATE POLICY organizations_member_select
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE
        m.organization_id = organizations.id
        AND m.user_id = auth.uid ()
    )
  );

CREATE POLICY organizations_member_update
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE
        m.organization_id = organizations.id
        AND m.user_id = auth.uid ()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE
        m.organization_id = organizations.id
        AND m.user_id = auth.uid ()
    )
  );

-- Published templates: public read for contractor routes
CREATE POLICY invoice_templates_public_read_published
  ON public.invoice_templates
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Members: full template access (draft + published) for their org
CREATE POLICY invoice_templates_member_select
  ON public.invoice_templates
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT m.organization_id
      FROM public.organization_members m
      WHERE
        m.user_id = auth.uid ()
    )
  );

CREATE POLICY invoice_templates_member_insert
  ON public.invoice_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT m.organization_id
      FROM public.organization_members m
      WHERE
        m.user_id = auth.uid ()
    )
  );

CREATE POLICY invoice_templates_member_update
  ON public.invoice_templates
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT m.organization_id
      FROM public.organization_members m
      WHERE
        m.user_id = auth.uid ()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT m.organization_id
      FROM public.organization_members m
      WHERE
        m.user_id = auth.uid ()
    )
  );

CREATE POLICY invoice_templates_member_delete
  ON public.invoice_templates
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT m.organization_id
      FROM public.organization_members m
      WHERE
        m.user_id = auth.uid ()
    )
  );

-- Members see their own memberships
CREATE POLICY organization_members_self_select
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid ());

-- Seed Makula (matches previous hard-coded defaults)
INSERT INTO
  public.organizations (slug, name)
VALUES ('makula', 'Makula Technology GmbH')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO
  public.invoice_templates (organization_id, config, is_published)
SELECT
  o.id,
  jsonb_build_object(
    'company',
    jsonb_build_object(
      'name',
      'Makula Technology GmbH',
      'address',
      jsonb_build_object(
        'street',
        'c/o Mindspace Münzstr. 12',
        'city',
        'Germany',
        'zip',
        '10178 Berlin'
      )
    ),
    'bank',
    jsonb_build_object(
      'name',
      '',
      'accountTitle',
      '',
      'iban',
      '',
      'bic',
      ''
    ),
    'exportName',
    'Makula'
  ),
  true
FROM public.organizations o
WHERE
  o.slug = 'makula'
ON CONFLICT (organization_id) DO NOTHING;
