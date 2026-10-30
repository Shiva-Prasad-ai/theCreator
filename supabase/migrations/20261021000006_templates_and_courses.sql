-- Migration 06: Templates and Courses tables with RLS

-- Table: templates
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

CREATE POLICY "templates_select_own"
    ON public.templates FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "templates_insert_own"
    ON public.templates FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "templates_update_own"
    ON public.templates FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "templates_delete_own"
    ON public.templates FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Table: courses
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

CREATE POLICY "courses_select_own"
    ON public.courses FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "courses_insert_own"
    ON public.courses FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "courses_update_own"
    ON public.courses FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "courses_delete_own"
    ON public.courses FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
