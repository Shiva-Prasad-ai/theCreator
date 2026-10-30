-- =============================================================================
-- CreatorOS AI: Consolidated PostgreSQL Database Schema (Core Tables)
-- =============================================================================

-- Enable pgvector extension (Rule: no vector tables created)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    persona TEXT CHECK (persona IN ('content_creator', 'product_creator', 'freelancer', 'educator')),
    display_name TEXT,
    niche TEXT,
    tone TEXT,
    audience TEXT,
    goals TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    profile_hash TEXT,
    onboarding_done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 2. events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    due_at TIMESTAMPTZ,
    linked_type TEXT,
    linked_id TEXT,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_own" ON public.events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "events_insert_own" ON public.events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "events_delete_own" ON public.events FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4. connections
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    platform TEXT NOT NULL,
    account_name TEXT,
    token_ciphertext TEXT,
    expires_at TIMESTAMPTZ,
    status TEXT,
    data_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SQL comment explicitly documenting encryption requirement
COMMENT ON COLUMN public.connections.token_ciphertext IS 'stores encrypted text only';

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_select_own" ON public.connections FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "connections_update_own" ON public.connections FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "connections_delete_own" ON public.connections FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. earnings
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    source TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('manual', 'imported')),
    campaign_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "earnings_select_own" ON public.earnings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "earnings_insert_own" ON public.earnings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "earnings_update_own" ON public.earnings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "earnings_delete_own" ON public.earnings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 6. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    client TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    tax NUMERIC NOT NULL DEFAULT 0,
    status TEXT,
    due_date DATE,
    pdf_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_select_own" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "invoices_insert_own" ON public.invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "invoices_update_own" ON public.invoices FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "invoices_delete_own" ON public.invoices FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 7. regions (Shared reference data - no user_id)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regions_select_authenticated" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "regions_service_role_all" ON public.regions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. companies (Shared reference data - no user_id)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    company TEXT NOT NULL,
    industry TEXT,
    headcount INTEGER,
    lat NUMERIC,
    lng NUMERIC,
    data_confidence TEXT CHECK (data_confidence IN ('estimated', 'sample', 'verified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_select_authenticated" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "companies_service_role_all" ON public.companies FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    industry TEXT,
    icp TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_own" ON public.products FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "products_insert_own" ON public.products FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "products_update_own" ON public.products FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "products_delete_own" ON public.products FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 10. matches
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    score NUMERIC,
    tier TEXT CHECK (tier IN ('high', 'mid', 'least')),
    reasoning TEXT,
    brief TEXT,
    call_status TEXT,
    follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_own" ON public.matches FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "matches_insert_own" ON public.matches FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "matches_update_own" ON public.matches FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "matches_delete_own" ON public.matches FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 11. templates
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    category TEXT,
    status TEXT,
    sales INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select_own" ON public.templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "templates_insert_own" ON public.templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "templates_update_own" ON public.templates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "templates_delete_own" ON public.templates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 12. courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    category TEXT,
    status TEXT,
    sales INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_select_own" ON public.courses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "courses_insert_own" ON public.courses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 13. Auto-insert empty profile row on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        display_name,
        persona,
        niche,
        tone,
        audience,
        goals,
        platforms,
        profile_hash,
        onboarding_done
    )
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '[]'::jsonb,
        NULL,
        false
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Beluga constraints & seed reference data
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_pair 
    ON public.matches (user_id, product_id, company_id);

INSERT INTO public.regions (name)
VALUES
    ('North America'),
    ('Europe'),
    ('Asia-Pacific'),
    ('Latin America'),
    ('Global / Remote')
ON CONFLICT (name) DO NOTHING;

