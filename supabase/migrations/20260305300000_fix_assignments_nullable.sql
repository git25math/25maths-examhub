-- Fix assignments table for Keywords compatibility
-- The table was created by 25maths-website with NOT NULL constraints on columns
-- that Keywords doesn't use (institution_id, exercise_slugs, due_at).
-- Keywords uses deck_slugs + deadline instead.

-- 1. Make institution_id nullable (Keywords uses schools, not institutions)
ALTER TABLE public.assignments ALTER COLUMN institution_id DROP NOT NULL;

-- 2. Give exercise_slugs a default (Keywords uses deck_slugs instead)
ALTER TABLE public.assignments ALTER COLUMN exercise_slugs SET DEFAULT '{}';
ALTER TABLE public.assignments ALTER COLUMN exercise_slugs DROP NOT NULL;

-- 3. Give due_at a default (Keywords uses deadline instead)
ALTER TABLE public.assignments ALTER COLUMN due_at SET DEFAULT now();
ALTER TABLE public.assignments ALTER COLUMN due_at DROP NOT NULL;
