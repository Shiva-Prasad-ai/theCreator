-- Migration 09: Add user_id to companies and enforce multi-tenant RLS
-- Allows users to upload/manage their own companies without seeing other users' companies

-- 1. Add nullable user_id referencing auth.users
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL;

-- 2. Drop legacy wide-open policy
DROP POLICY IF EXISTS "companies_select_authenticated" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_own" ON public.companies;
DROP POLICY IF EXISTS "companies_update_own" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_own" ON public.companies;

-- 3. RLS: Users can see shared system rows (user_id IS NULL) OR their own uploaded rows
CREATE POLICY "companies_select_accessible"
    ON public.companies FOR SELECT
    TO authenticated
    USING (user_id IS NULL OR user_id = auth.uid());

-- 4. RLS: Authenticated users can insert companies only with their own user_id
CREATE POLICY "companies_insert_own"
    ON public.companies FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 5. RLS: Authenticated users can update only their own companies
CREATE POLICY "companies_update_own"
    ON public.companies FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. RLS: Authenticated users can delete only their own companies
CREATE POLICY "companies_delete_own"
    ON public.companies FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
