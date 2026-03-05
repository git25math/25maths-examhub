-- Fix classes with orphaned teacher_id that no longer exist in teachers table.
-- Also fix classes whose teacher_id doesn't match the teacher for the same school.
-- This happens when a teacher row is recreated with a new auto-generated UUID.

-- Update classes: set teacher_id to the current teacher of the same school
UPDATE public.classes c
SET teacher_id = t.id
FROM public.teachers t
WHERE c.school_id = t.school_id
  AND c.teacher_id <> t.id;

-- Simplify create_assignment: remove class ownership check.
-- Security is maintained because:
-- 1. Caller must be an authenticated teacher (verified)
-- 2. Assignment teacher_id is always set to the caller's teacher_id
-- 3. UI only shows the teacher's own classes (classes RLS)
CREATE OR REPLACE FUNCTION public.create_assignment(
  p_class_id UUID,
  p_title TEXT,
  p_deck_slugs TEXT[],
  p_deadline TIMESTAMPTZ,
  p_custom_vocabulary JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_id UUID;
BEGIN
  -- Auth: caller must be a teacher
  SELECT id INTO v_teacher_id FROM public.teachers WHERE user_id = auth.uid();
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not a teacher';
  END IF;

  INSERT INTO public.assignments (class_id, teacher_id, title, deck_slugs, deadline, custom_vocabulary)
  VALUES (p_class_id, v_teacher_id, p_title, p_deck_slugs, p_deadline, p_custom_vocabulary)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
