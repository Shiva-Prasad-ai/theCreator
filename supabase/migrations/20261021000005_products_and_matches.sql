-- Migration 05: Products, Shared Reference Data (Regions, Companies), and Matches with RLS

-- Table: regions (Shared reference data - no user_id: readable by any signed-in user, writable only by service role)
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regions_select_authenticated"
    ON public.regions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "regions_service_role_all"
    ON public.regions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Table: companies (Shared reference data - no user_id: readable by any signed-in user, writable only by service role)
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

CREATE POLICY "companies_select_authenticated"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "companies_service_role_all"
    ON public.companies FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Table: products (User-owned)
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

CREATE POLICY "products_select_own"
    ON public.products FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "products_insert_own"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_update_own"
    ON public.products FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_delete_own"
    ON public.products FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Table: matches (User-owned)
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

CREATE POLICY "matches_select_own"
    ON public.matches FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "matches_insert_own"
    ON public.matches FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "matches_update_own"
    ON public.matches FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "matches_delete_own"
    ON public.matches FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
