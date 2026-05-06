# Raseed (makula-raseed) — agent notes

## Stack

- Next.js App Router (16.x), React 19, Mantine v9
- PDF: `@react-pdf/renderer` + viewer packages
- Backend: Supabase (Postgres + Auth + RLS). SQL migrations live in `supabase/migrations/`.
- Hosting: Vercel (apex `raseedhq.com`).

## Product surface

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page + waitlist form. Server component forwards `?code=` to `/admin/auth/callback` as a belt-and-braces fix for Supabase Site-URL fallbacks. |
| `/legacy` | Original generic invoice tool (no template, no namespace). Kept for backward compat |
| `/{slug}` | Tenant invoice form for a published org template (e.g. `/makula`, `/acme`) |
| `/admin/login` | Email + password sign-in (un-advertised; share creds 1:1 during alpha) |
| `/admin/auth/callback` | OAuth/OTP code exchange route. Currently unused by the login form (we use password auth) but kept for future password-reset / OAuth flows. |
| `/admin` | Lists orgs the signed-in user belongs to (cards show Draft/Published badge, last-updated, Edit / View live actions) |
| `/admin/o/{slug}/template` | Template editor for that org. Two-column layout: form on the left, **live PDF preview** on the right (sticky, fed with synthetic sample contractor data — see `app/components/admin/TemplatePdfPreview.tsx`). Header has org name, Draft/Published badge, "Open live" button, and a Save button. |
| `/admin/account` | Change password (and view email) |
| `/admin/demo` | Public demo of the template editor — same 2-column form + live preview, but saves to `localStorage` only. No auth. Linked from landing page hero CTA + footer. |
| `/demo` | Public contractor view that reads the demo template from `localStorage`. Mirrors `/{slug}` for prospects. |

## Privacy / product rule

- **Contractor data** stays in the **browser** (`localStorage`, keys namespaced per org slug when using `/{slug}`):
  - Personal info (name, email, tax ID, address)
  - Contractor's bank info ("Payment Details" — where they want to be paid)
  - Line items, amounts, dates
- **Server** stores only org metadata, published **invoice templates**, and the **waitlist** table.
- On tenant routes the **"Billed To" company is server-driven** (locked to the published template — that's the org being invoiced); the `CompanyInfoAccordion` is hidden on tenant routes. The **bank ("Payment Details") is contractor-driven** even on tenant routes — the contractor edits it and it persists in localStorage.
- The legacy `/` route exposes everything as fully editable for backward compat.
- The contractor view (`AppShell.Footer` rendered by `app/app.tsx`) shows a small `ContractorPrivacyFooter` explaining the localStorage model and offering a **"Clear my data"** button. The clear action calls `clearContractorStorage(namespace)` (see `lib/storage-keys.ts`) and reloads the page.
- Admins who are signed in and members of the org get an **"Open admin" pill** in the contractor view header (`AdminJumpPill`). It's invisible to non-members so contractors never see it.

## Template config schema

Stored in `public.invoice_templates.config jsonb`. Parsed and shaped by [`lib/invoice-template.ts`](lib/invoice-template.ts) `parseInvoiceTemplateConfig`. All fields default safely if missing.

- `company` (CompanyInfo) — payee ("Billed To" on PDF; server-locked on tenant routes)
- `bank` (BankInfo) — only used as an initial pre-fill on first load; contractor can fully edit and persist over it
- `exportName` (string?) — short label used in PDF filename
- `currency` `{ code, symbol, position: "before"|"after" }`
- `invoiceNumberScheme` — one of:
  - `{ kind: "date_mmyy" \| "date_mmyyyy" \| "date_yyyymm" \| "date_yymm", prefix?: string }`
  - `{ kind: "custom", pattern: string }` — placeholders `{yyyy} {yy} {mm} {dd}` from invoice date
- `taxRate` (number, %), `taxLabel?`
- `dateFormat` — `"dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd"`
- `dueTermsPresets` — array of `{ id, label, days }`. "custom" is always available as a fallback in the form.
- `contractorFields` — **ordered array** of custom fields for the contractor’s identity block (Personal Info + PDF “From:”), same `{ id, label, placeholder?, required }` shape as `bankFields`. Empty array hides Personal Info entirely. Defaults preserve legacy six-field EU-style ids (`name`, `email`, `taxID`, `street`, `city`, `zip`) so existing contractor localStorage still maps. The parser accepts the legacy visibility-object shape on read and converts it.
- `bankFields` — **ordered array** of custom Payment Details fields (same shape as `contractorFields`). Presets in the editor: EU IBAN, US ACH, UK sort code, or empty.
- `businessEmail?` — auto-fills the **To:** field of the contractor's export dialog (`mailto:` helper). When `showBusinessEmail` is `true` it is *also* printed under "Billed To" on the PDF.
- `showBusinessEmail` (boolean, default `true`)

The Makula-only Bonus Payout helper in [`invoice_data_form.tsx`](app/components/invoice_data_form.tsx) is gated on `storageNamespace === undefined` (legacy `/`) or `storageNamespace === "makula"`. **Known hack** — should become a per-org template toggle (e.g. `enableBonusPayout: boolean`) using the same pattern as `bankFields`. Tracked in "Open follow-ups".

## Auth model — email + password

We do **not** use magic links. Reasons:

- Closed alpha = manual provisioning. The owner (you) creates each customer's account by hand; sharing initial credentials over Zoom is the same effort.
- No reliance on transactional email — Supabase free-tier built-in SMTP throttles at 4 emails/hour, which is too low for development iteration.
- Customers can change their own password at `/admin/account` after first login.

Supabase Auth settings to confirm in the dashboard:

- **Authentication → Providers → Email**: enable email/password sign-in.
- **Authentication → Sign Up**: you can disable public sign-up entirely if you want — we don't expose a sign-up UI anyway. (RLS would still protect data even if a stranger signed up; they'd just have an empty `/admin`.)

## Local setup

1. Apply schema (one-time): use Supabase MCP `apply_migration` with each file in `supabase/migrations/`, OR paste them in order into the SQL editor.
2. `.env.local` should have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (use the modern `sb_publishable_...` key from the Supabase dashboard).
3. Supabase **Authentication → URL Configuration** (only matters for OAuth / future password-reset flows; not required for email+password sign-in):
   - **Site URL**: `https://raseedhq.com`
   - **Redirect URLs**:
     - `http://localhost:*/admin/auth/callback`
     - `https://raseedhq.com/admin/auth/callback`
     - `https://www.raseedhq.com/admin/auth/callback`
     - `https://*.vercel.app/admin/auth/callback`
4. Bootstrap yourself: see "Provisioning runbook" below.

## Vercel

- Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production + Preview + Development.
- Domains: attach `raseedhq.com` (and ideally redirect `www.raseedhq.com → raseedhq.com`).
- Deploy is git-driven (no `gh-pages` target — that script was removed).

## Provisioning runbook (gated alpha)

Use this once for yourself, and again for every new customer until self-serve signup ships. Roughly 5 minutes per customer.

### 1. Create the org + empty template

Via Supabase MCP `execute_sql` or the SQL editor:

```sql
INSERT INTO public.organizations (slug, name) VALUES ('<slug>', '<Org Name>')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.invoice_templates (organization_id, config, is_published)
SELECT id, '{}'::jsonb, false FROM public.organizations WHERE slug = '<slug>'
ON CONFLICT (organization_id) DO NOTHING;
```

### 2. Create the customer's auth.users entry with a starter password

Easiest path — **Supabase Dashboard → Authentication → Users → "Add user" → "Create new user"**:

- Email: customer's email
- Password: a randomly-generated string (use `openssl rand -base64 16` or a password manager)
- Auto Confirm User: ON

The user is created in a confirmed state and can sign in immediately.

Alternative (via SQL — handy if you want everything in one MCP call). Note this requires the `pgcrypto` extension, which Supabase enables by default:

```sql
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  '<their email>',
  crypt('<starter password>', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(), now()
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT gen_random_uuid(), u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', u.email,
  now(), now(), now()
FROM auth.users u
WHERE u.email = '<their email>';
```

### 3. Promote them to owner

```sql
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT o.id, u.id, 'owner'
FROM public.organizations o, auth.users u
WHERE o.slug = '<slug>' AND u.email = '<their email>'
ON CONFLICT DO NOTHING;
```

### 4. Email them the credentials + URLs

Subject template:

> Your Raseed admin is ready
>
> Sign-in URL: https://raseedhq.com/admin/login
> Email: `<their email>`
> Temporary password: `<starter password>`
>
> Once you sign in, please change your password at https://raseedhq.com/admin/account .
>
> Your template editor: https://raseedhq.com/admin/o/`<slug>`/template
> Once you publish the template, your contractors can use https://raseedhq.com/`<slug>` .

### 5. Read the waitlist

```sql
SELECT email, company_name, contractor_count, message, created_at
FROM public.waitlist ORDER BY created_at DESC LIMIT 50;
```

(RLS allows INSERT from anon but no SELECT; service-role bypasses RLS.)

### Resetting a forgotten password (no email infra needed)

Customer emails you. Update directly:

```sql
UPDATE auth.users
SET encrypted_password = crypt('<new starter password>', gen_salt('bf')),
    updated_at = now()
WHERE email = '<their email>';
```

Tell them the new password and to change it at `/admin/account`.

## Routes that should NOT be linked publicly during alpha

- `/admin/login` — only share via 1:1 emails after waitlist reply. The landing footer has a small "Sign in" link so existing customers (and you) can find it without bookmarking the URL.
- `/legacy` — only kept for backward compat; small footer link.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm lint`

## Open follow-ups

- Next 16 deprecates `middleware.ts` in favor of `proxy.ts`. Build succeeds with a deprecation warning. Migrate when convenient.
- Switch `/[company]` from `force-dynamic` to `revalidate = 300` once tenant traffic is non-trivial; pair with `revalidatePath` from a server action on template save.
- Auto-increment invoice number scheme (deferred Phase 1.4). If a customer needs it, add `nextSeq` field in scheme + a `claim_invoice_number(slug)` SQL function (`security definer`) called via Supabase RPC at export time.
- ~~Demo `/admin` route with localStorage-backed template editor~~ — shipped as `/admin/demo` + `/demo`. Form body is shared with the real editor via `app/components/admin/TemplateEditorForm.tsx`. Demo state lives under `raseed.demo.*` localStorage keys (see `lib/demo-template.ts`).
- Once we adopt SMTP (e.g. Resend) for transactional email, switch the password-reset flow from "email me, I'll reset via SQL" to a real `/admin/forgot-password` UI using `supabase.auth.resetPasswordForEmail` + the existing `/admin/auth/callback` route.
- "Preview unpublished draft" — currently `Preview` on the editor page links to `/{slug}` which only shows published templates. If we want to preview unpublished drafts in admin, add `/admin/o/{slug}/preview` that loads the draft config and renders the contractor view directly.
- **Promote Bonus Payout to a per-org template toggle.** Replace the `slug === "makula"` check in `invoice_data_form.tsx` with `templateConfig.enableBonusPayout`. Same shape as `bankFields` / `contractorFields`. Trivial.
- ~~**Custom bank fields for non-IBAN markets.**~~ — shipped. `bankFields` is now an ordered array of admin-defined `{ id, label, placeholder?, required }` records keyed by stable id. `BankInfo` is `Record<string, string>` keyed by field id. Default field set kept (name/accountTitle/iban/bic, all required) so existing templates and contractor localStorage migrate without change.
