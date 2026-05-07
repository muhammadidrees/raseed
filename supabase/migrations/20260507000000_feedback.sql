-- Feedback inbox. Optional email; categorized for triage. Anyone can submit;
-- only service role / SQL editor reads rows (RLS blocks SELECT for clients).

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  message text NOT NULL,
  category text NOT NULL,
  source text,
  page_path text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_category_check CHECK (
    category IN ('bug', 'feature', 'question', 'account', 'other')
  )
);

CREATE INDEX idx_feedback_created_at_desc ON public.feedback (created_at DESC);
CREATE INDEX idx_feedback_category_created ON public.feedback (category, created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit feedback.
-- user_id must match the signed-in user or stay null (no spoofing).
CREATE POLICY feedback_public_insert
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) BETWEEN 1 AND 4000
    AND (email IS NULL OR char_length(email) <= 320)
    AND (source IS NULL OR char_length(source) <= 200)
    AND (page_path IS NULL OR char_length(page_path) <= 512)
    AND category IN ('bug', 'feature', 'question', 'account', 'other')
    AND (
      user_id IS NULL
      OR user_id = (SELECT auth.uid())
    )
  );

-- Nobody can SELECT/UPDATE/DELETE through RLS. Read via service role / SQL editor:
--   SELECT category, email, message, source, page_path, user_id, created_at
--   FROM public.feedback
--   WHERE category = 'bug'
--   ORDER BY created_at DESC
--   LIMIT 50;
