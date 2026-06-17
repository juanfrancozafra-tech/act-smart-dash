
ALTER TABLE public.accounts
  ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  ADD COLUMN last_active_at TIMESTAMPTZ,
  ADD COLUMN csm_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Backfill last_active_at from free-form last_active strings like "2d ago", "3h ago", "1w ago", "just now"
UPDATE public.accounts
SET last_active_at = CASE
  WHEN last_active ILIKE 'just now%' OR last_active ILIKE 'now%' THEN now()
  WHEN last_active ~* '^\s*(\d+)\s*m(in)?s?\s*ago' THEN now() - (regexp_replace(last_active, '^\s*(\d+).*$', '\1')::int || ' minutes')::interval
  WHEN last_active ~* '^\s*(\d+)\s*h(rs?|ours?)?\s*ago' THEN now() - (regexp_replace(last_active, '^\s*(\d+).*$', '\1')::int || ' hours')::interval
  WHEN last_active ~* '^\s*(\d+)\s*d(ays?)?\s*ago' THEN now() - (regexp_replace(last_active, '^\s*(\d+).*$', '\1')::int || ' days')::interval
  WHEN last_active ~* '^\s*(\d+)\s*w(eeks?|ks?)?\s*ago' THEN now() - (regexp_replace(last_active, '^\s*(\d+).*$', '\1')::int || ' weeks')::interval
  WHEN last_active ~* '^\s*(\d+)\s*mo(nths?)?\s*ago' THEN now() - (regexp_replace(last_active, '^\s*(\d+).*$', '\1')::int || ' months')::interval
  ELSE NULL
END
WHERE last_active IS NOT NULL AND last_active <> '';

-- Backfill csm_user_id by matching the free-form csm name to profiles.full_name (case-insensitive)
UPDATE public.accounts a
SET csm_user_id = p.id
FROM public.profiles p
WHERE a.csm IS NOT NULL
  AND a.csm <> ''
  AND a.csm <> 'Unassigned'
  AND lower(p.full_name) = lower(a.csm);
