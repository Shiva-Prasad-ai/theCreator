-- Migration 03: Connections table with RLS
-- Rule: connections.token_ciphertext stores encrypted text only. Add a SQL comment saying so.

-- Table: connections
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

CREATE POLICY "connections_select_own"
    ON public.connections FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "connections_insert_own"
    ON public.connections FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "connections_update_own"
    ON public.connections FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "connections_delete_own"
    ON public.connections FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
