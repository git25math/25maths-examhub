-- Debug: add diagnostic info to create_assignment error messages
-- to identify why class ownership check fails.

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
  v_class_teacher UUID;
BEGIN
  -- Auth: caller must be a teacher
  SELECT id INTO v_teacher_id FROM public.teachers WHERE user_id = auth.uid();
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not a teacher (uid=%)', auth.uid();
  END IF;

  -- Auth: teacher must own the class
  SELECT teacher_id INTO v_class_teacher FROM public.classes WHERE id = p_class_id;
  IF v_class_teacher IS NULL THEN
    RAISE EXCEPTION 'Class not found (class_id=%)', p_class_id;
  END IF;
  IF v_class_teacher <> v_teacher_id THEN
    RAISE EXCEPTION 'Class owner mismatch: class.teacher_id=% but your teacher_id=%', v_class_teacher, v_teacher_id;
  END IF;

  INSERT INTO public.assignments (class_id, teacher_id, title, deck_slugs, deadline, custom_vocabulary)
  VALUES (p_class_id, v_teacher_id, p_title, p_deck_slugs, p_deadline, p_custom_vocabulary)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
