-- Migration 07: Automatically insert an empty profile row when a new auth user is created
-- Rule: onboarding_done is set to false

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
