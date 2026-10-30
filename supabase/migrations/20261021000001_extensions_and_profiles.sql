-- Migration 01: Enable pgvector extension and create profiles table
-- Rule: pgvector enabled, no vector tables created

CREATE EXTENSION IF NOT EXISTS vector;

-- Table: profiles
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

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
