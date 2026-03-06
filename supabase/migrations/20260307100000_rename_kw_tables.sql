-- Rename Keywords tables to avoid conflict with 25maths-website B2B tables
-- classes → kw_classes, class_students → kw_class_students, assignments → kw_assignments

-- 1. Drop dependent view first
DROP VIEW IF EXISTS public.student_activity_view;

-- 2. Rename tables
ALTER TABLE public.classes RENAME TO kw_classes;
ALTER TABLE public.class_students RENAME TO kw_class_students;
ALTER TABLE public.assignments RENAME TO kw_assignments;

-- 3. Rename indexes
ALTER INDEX IF EXISTS idx_assignments_class RENAME TO idx_kw_assignments_class;
ALTER INDEX IF EXISTS idx_cs_class RENAME TO idx_kw_cs_class;
ALTER INDEX IF EXISTS idx_cs_student RENAME TO idx_kw_cs_student;

-- 4. Update my_class_ids() function to reference kw_classes
CREATE OR REPLACE FUNCTION public.my_class_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.kw_classes WHERE teacher_id = public.my_teacher_id();
$$;

-- 5. Update RPC functions

-- 5a. create_assignment → reference kw_classes + kw_assignments
CREATE OR REPLACE FUNCTION public.create_assignment(
  p_class_id UUID,
  p_title TEXT,
  p_deck_slugs TEXT[],
  p_deadline TIMESTAMPTZ,
  p_custom_vocabulary JSONB DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_teacher_id UUID;
  v_class_teacher UUID;
  v_new_id UUID;
BEGIN
  SELECT public.my_teacher_id() INTO v_teacher_id;
  IF v_teacher_id IS NULL THEN RAISE EXCEPTION 'Not a teacher'; END IF;
  SELECT teacher_id INTO v_class_teacher FROM public.kw_classes WHERE id = p_class_id;
  IF v_class_teacher IS NULL OR v_class_teacher != v_teacher_id THEN
    RAISE EXCEPTION 'Not your class';
  END IF;
  INSERT INTO public.kw_assignments (class_id, teacher_id, title, deck_slugs, deadline, custom_vocabulary)
  VALUES (p_class_id, v_teacher_id, p_title, p_deck_slugs, p_deadline, p_custom_vocabulary)
  RETURNING id INTO v_new_id;
  RETURN v_new_id;
END;
$$;

-- 5b. list_class_assignments → reference kw_assignments + kw_class_students
CREATE OR REPLACE FUNCTION public.list_class_assignments(p_class_id UUID)
RETURNS SETOF public.kw_assignments LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.my_teacher_id() IS NOT NULL THEN
    RETURN QUERY SELECT * FROM public.kw_assignments
      WHERE class_id = p_class_id AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY created_at DESC;
  ELSIF EXISTS (SELECT 1 FROM public.kw_class_students WHERE class_id = p_class_id AND user_id = auth.uid()) THEN
    RETURN QUERY SELECT * FROM public.kw_assignments
      WHERE class_id = p_class_id AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Access denied';
  END IF;
END;
$$;

-- 5c. get_assignment → reference kw_assignments + kw_class_students
CREATE OR REPLACE FUNCTION public.get_assignment(p_id UUID)
RETURNS SETOF public.kw_assignments LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.my_teacher_id() IS NOT NULL THEN
    RETURN QUERY SELECT * FROM public.kw_assignments WHERE id = p_id;
  ELSIF EXISTS (
    SELECT 1 FROM public.kw_class_students cs
    JOIN public.kw_assignments a ON a.class_id = cs.class_id
    WHERE a.id = p_id AND cs.user_id = auth.uid()
  ) THEN
    RETURN QUERY SELECT * FROM public.kw_assignments WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Access denied';
  END IF;
END;
$$;

-- 5d. delete_assignment → reference kw_assignments
CREATE OR REPLACE FUNCTION public.delete_assignment(p_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_teacher_id UUID;
BEGIN
  SELECT public.my_teacher_id() INTO v_teacher_id;
  IF v_teacher_id IS NULL THEN RAISE EXCEPTION 'Not a teacher'; END IF;
  UPDATE public.kw_assignments SET is_deleted = true
    WHERE id = p_id AND teacher_id = v_teacher_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not found or not yours'; END IF;
END;
$$;

-- 5e. update_class → reference kw_classes
CREATE OR REPLACE FUNCTION public.update_class(p_class_id UUID, p_name TEXT, p_grade TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_class RECORD;
BEGIN
  SELECT * INTO v_class FROM public.kw_classes WHERE id = p_class_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found'; END IF;
  IF v_class.teacher_id != public.my_teacher_id() THEN RAISE EXCEPTION 'Not your class'; END IF;
  UPDATE public.kw_classes SET name = p_name, grade = p_grade WHERE id = p_class_id;
  RETURN json_build_object('id', p_class_id, 'name', p_name, 'grade', p_grade);
END;
$$;

-- 6. Recreate student_activity_view with new table names
CREATE OR REPLACE VIEW public.student_activity_view AS
SELECT cs.class_id, cs.user_id, cs.student_name,
       c.grade, c.school_id, c.name AS class_name,
       l.mastery_pct, l.mastered_words, l.total_words,
       l.rank_emoji, l.score, l.updated_at AS last_active
FROM public.kw_class_students cs
JOIN public.kw_classes c ON cs.class_id = c.id
LEFT JOIN public.leaderboard l ON cs.user_id = l.user_id;

-- 7. Drop & recreate RLS policies for kw_classes
DROP POLICY IF EXISTS "teachers_read_classes" ON public.kw_classes;
DROP POLICY IF EXISTS "teachers_insert_classes" ON public.kw_classes;
DROP POLICY IF EXISTS "teachers_update_classes" ON public.kw_classes;

CREATE POLICY "teachers_read_classes" ON public.kw_classes
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "teachers_insert_classes" ON public.kw_classes
  FOR INSERT WITH CHECK (
    school_id = public.my_school_id()
    AND teacher_id = public.my_teacher_id()
  );
CREATE POLICY "teachers_update_classes" ON public.kw_classes
  FOR UPDATE USING (
    school_id = public.my_school_id()
    AND teacher_id = public.my_teacher_id()
  );

-- 8. Drop & recreate RLS policies for kw_class_students
DROP POLICY IF EXISTS "teachers_read_students" ON public.kw_class_students;
DROP POLICY IF EXISTS "students_read_own" ON public.kw_class_students;

CREATE POLICY "teachers_read_students" ON public.kw_class_students
  FOR SELECT USING (
    class_id IN (SELECT id FROM public.kw_classes WHERE school_id = public.my_school_id())
  );
CREATE POLICY "students_read_own" ON public.kw_class_students
  FOR SELECT USING (user_id = auth.uid());

-- 9. Drop & recreate RLS policies for kw_assignments
DROP POLICY IF EXISTS "kw_assign_select" ON public.kw_assignments;
DROP POLICY IF EXISTS "kw_assign_insert" ON public.kw_assignments;
DROP POLICY IF EXISTS "kw_assign_update" ON public.kw_assignments;
DROP POLICY IF EXISTS "kw_assign_delete" ON public.kw_assignments;

CREATE POLICY "kw_assign_select" ON public.kw_assignments FOR SELECT USING (
  teacher_id = public.my_teacher_id()
  OR class_id IN (SELECT class_id FROM public.kw_class_students WHERE user_id = auth.uid())
);
CREATE POLICY "kw_assign_insert" ON public.kw_assignments FOR INSERT WITH CHECK (
  teacher_id = public.my_teacher_id()
  AND class_id IN (SELECT public.my_class_ids())
);
CREATE POLICY "kw_assign_update" ON public.kw_assignments FOR UPDATE
  USING (teacher_id = public.my_teacher_id());
CREATE POLICY "kw_assign_delete" ON public.kw_assignments FOR DELETE
  USING (teacher_id = public.my_teacher_id());
