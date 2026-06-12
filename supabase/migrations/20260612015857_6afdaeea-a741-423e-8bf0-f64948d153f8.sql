
-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'csm', 'viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by signed-in users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RETENTION DATA ============
CREATE TABLE public.accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  seats INT NOT NULL DEFAULT 0,
  invited_seats INT NOT NULL DEFAULT 0,
  health_score INT NOT NULL DEFAULT 0,
  primary_risk TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'Low',
  days_since_signup INT NOT NULL DEFAULT 0,
  last_active TEXT NOT NULL DEFAULT '',
  arr INT NOT NULL DEFAULT 0,
  onboarding_completion INT NOT NULL DEFAULT 0,
  features_adopted INT NOT NULL DEFAULT 0,
  features_total INT NOT NULL DEFAULT 12,
  weekly_active_users INT NOT NULL DEFAULT 0,
  csm TEXT NOT NULL DEFAULT 'Unassigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read accounts" ON public.accounts FOR SELECT TO authenticated USING (true);

CREATE TABLE public.kpis (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  delta NUMERIC NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  suffix TEXT NOT NULL DEFAULT '',
  inverse BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT ON public.kpis TO authenticated;
GRANT ALL ON public.kpis TO service_role;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read kpis" ON public.kpis FOR SELECT TO authenticated USING (true);

CREATE TABLE public.churn_trend (
  week TEXT PRIMARY KEY,
  ordinal INT NOT NULL,
  churn NUMERIC NOT NULL,
  retention NUMERIC NOT NULL
);
GRANT SELECT ON public.churn_trend TO authenticated;
GRANT ALL ON public.churn_trend TO service_role;
ALTER TABLE public.churn_trend ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read churn_trend" ON public.churn_trend FOR SELECT TO authenticated USING (true);

CREATE TABLE public.activation_funnel (
  stage TEXT PRIMARY KEY,
  ordinal INT NOT NULL,
  count INT NOT NULL,
  pct NUMERIC NOT NULL
);
GRANT SELECT ON public.activation_funnel TO authenticated;
GRANT ALL ON public.activation_funnel TO service_role;
ALTER TABLE public.activation_funnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read activation_funnel" ON public.activation_funnel FOR SELECT TO authenticated USING (true);

CREATE TABLE public.invite_vs_retention (
  cohort TEXT PRIMARY KEY,
  retained NUMERIC NOT NULL,
  churned NUMERIC NOT NULL
);
GRANT SELECT ON public.invite_vs_retention TO authenticated;
GRANT ALL ON public.invite_vs_retention TO service_role;
ALTER TABLE public.invite_vs_retention ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read invite_vs_retention" ON public.invite_vs_retention FOR SELECT TO authenticated USING (true);

CREATE TABLE public.top_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal INT NOT NULL,
  driver TEXT NOT NULL,
  pct NUMERIC NOT NULL,
  trend TEXT NOT NULL
);
GRANT SELECT ON public.top_drivers TO authenticated;
GRANT ALL ON public.top_drivers TO service_role;
ALTER TABLE public.top_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read top_drivers" ON public.top_drivers FOR SELECT TO authenticated USING (true);

CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal INT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL,
  action TEXT NOT NULL
);
GRANT SELECT ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_insights TO service_role;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read ai_insights" ON public.ai_insights FOR SELECT TO authenticated USING (true);

CREATE TABLE public.recommended_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal INT NOT NULL,
  name TEXT NOT NULL,
  impact TEXT NOT NULL,
  time_estimate TEXT NOT NULL
);
GRANT SELECT ON public.recommended_interventions TO authenticated;
GRANT ALL ON public.recommended_interventions TO service_role;
ALTER TABLE public.recommended_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read recommended_interventions" ON public.recommended_interventions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordinal INT NOT NULL,
  quote TEXT NOT NULL,
  person TEXT NOT NULL,
  context TEXT NOT NULL
);
GRANT SELECT ON public.user_quotes TO authenticated;
GRANT ALL ON public.user_quotes TO service_role;
ALTER TABLE public.user_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read user_quotes" ON public.user_quotes FOR SELECT TO authenticated USING (true);

-- ============ INTERVENTIONS ============
CREATE TABLE public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  template_key TEXT,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.interventions TO authenticated;
GRANT ALL ON public.interventions TO service_role;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Senders and admins read interventions" ON public.interventions FOR SELECT TO authenticated
  USING (sent_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins and CSMs send interventions" ON public.interventions FOR INSERT TO authenticated
  WITH CHECK (sent_by = auth.uid() AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'csm')));
