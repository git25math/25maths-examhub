-- RPC: update_class (SECURITY DEFINER)
-- Bypasses RLS to reliably update class name/grade.
-- Validates caller is a teacher in the same school.

CREATE OR REPLACE FUNCTION public.update_class(
  p_class_id UUID,
  p_name TEXT,
  p_grade TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher teachers%ROWTYPE;
  v_class classes%ROWTYPE;
BEGIN
  SELECT * INTO v_teacher FROM public.teachers WHERE user_id = auth.uid();
  IF v_teacher IS NULL THEN RAISE EXCEPTION 'Not a teacher'; END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id;
  IF v_class IS NULL THEN RAISE EXCEPTION 'Class not found'; END IF;
  IF v_class.school_id <> v_teacher.school_id THEN RAISE EXCEPTION 'Not your school'; END IF;

  UPDATE public.classes SET name = p_name, grade = p_grade WHERE id = p_class_id;

  RETURN json_build_object('id', p_class_id, 'name', p_name, 'grade', p_grade);
END;
$$;
