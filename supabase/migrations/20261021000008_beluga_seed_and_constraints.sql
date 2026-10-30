-- Migration 08: Beluga Seed Reference Data & Unique Match Constraint
-- Safe, additive migration adhering to existing schemas

-- 1. Ensure unique match per (user_id, product_id, company_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_pair 
    ON public.matches (user_id, product_id, company_id);

-- 2. Seed initial shared reference regions if not present
INSERT INTO public.regions (name)
VALUES
    ('North America'),
    ('Europe'),
    ('Asia-Pacific'),
    ('Latin America'),
    ('Global / Remote')
ON CONFLICT (name) DO NOTHING;
