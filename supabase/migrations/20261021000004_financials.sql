-- Migration 04: Earnings and Invoices tables with RLS

-- Table: earnings
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

CREATE POLICY "earnings_select_own"
    ON public.earnings FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "earnings_insert_own"
    ON public.earnings FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "earnings_update_own"
    ON public.earnings FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "earnings_delete_own"
    ON public.earnings FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Table: invoices
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

CREATE POLICY "invoices_select_own"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "invoices_insert_own"
    ON public.invoices FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_update_own"
    ON public.invoices FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_delete_own"
    ON public.invoices FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
