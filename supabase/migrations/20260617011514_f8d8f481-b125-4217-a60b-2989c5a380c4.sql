
-- cohorts
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  window_days INT NOT NULL DEFAULT 90,
  started_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read cohorts" ON public.cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cohorts" ON public.cohorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- account_activity
CREATE TABLE public.account_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  active_sessions INT NOT NULL DEFAULT 0,
  weekly_active_users INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, week_start)
);
GRANT SELECT ON public.account_activity TO authenticated;
GRANT ALL ON public.account_activity TO service_role;
ALTER TABLE public.account_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read account_activity" ON public.account_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage account_activity" ON public.account_activity FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- onboarding_steps
CREATE TABLE public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal INT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.onboarding_steps TO authenticated;
GRANT ALL ON public.onboarding_steps TO service_role;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read onboarding_steps" ON public.onboarding_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage onboarding_steps" ON public.onboarding_steps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- account_onboarding_progress
CREATE TABLE public.account_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.onboarding_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, step_id)
);
GRANT SELECT, INSERT, UPDATE ON public.account_onboarding_progress TO authenticated;
GRANT ALL ON public.account_onboarding_progress TO service_role;
ALTER TABLE public.account_onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read onboarding_progress" ON public.account_onboarding_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "CSMs and admins insert onboarding_progress" ON public.account_onboarding_progress FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'csm'));
CREATE POLICY "CSMs and admins update onboarding_progress" ON public.account_onboarding_progress FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'csm'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'csm'));

-- account_risk_signals
CREATE TABLE public.account_risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_risk_signals TO authenticated;
GRANT ALL ON public.account_risk_signals TO service_role;
ALTER TABLE public.account_risk_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read account_risk_signals" ON public.account_risk_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage account_risk_signals" ON public.account_risk_signals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- kpi_definitions
CREATE TABLE public.kpi_definitions (
  key TEXT PRIMARY KEY REFERENCES public.kpis(key) ON DELETE CASCADE,
  calculation TEXT NOT NULL,
  why TEXT NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kpi_definitions TO authenticated;
GRANT ALL ON public.kpi_definitions TO service_role;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read kpi_definitions" ON public.kpi_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage kpi_definitions" ON public.kpi_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- exports
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  format TEXT NOT NULL,
  size_bytes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.exports TO authenticated;
GRANT ALL ON public.exports TO service_role;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own exports" ON public.exports FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own exports" ON public.exports FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users delete own exports" ON public.exports FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- updated_at trigger for tables that have it
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_onboarding_progress_updated_at
  BEFORE UPDATE ON public.account_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_kpi_definitions_updated_at
  BEFORE UPDATE ON public.kpi_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
