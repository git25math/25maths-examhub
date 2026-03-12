-- v5.7.0: Grant Super Admin full write access to admin tables

-- ═══ kw_classes: INSERT / UPDATE / DELETE ═══
CREATE POLICY "superadmin_insert_classes" ON public.kw_classes
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "superadmin_update_classes" ON public.kw_classes
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "superadmin_delete_classes" ON public.kw_classes
  FOR DELETE USING (public.is_super_admin());

-- ═══ kw_class_students: INSERT / UPDATE / DELETE ═══
CREATE POLICY "superadmin_insert_students" ON public.kw_class_students
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "superadmin_update_students" ON public.kw_class_students
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "superadmin_delete_students" ON public.kw_class_students
  FOR DELETE USING (public.is_super_admin());

-- ═══ leaderboard: UPDATE for super admin ═══
CREATE POLICY "superadmin_update_leaderboard" ON public.leaderboard
  FOR UPDATE USING (public.is_super_admin());

-- ═══ update_class RPC: allow super admin ═══
CREATE OR REPLACE FUNCTION public.update_class(p_class_id UUID, p_name TEXT, p_grade TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_class RECORD;
BEGIN
  SELECT * INTO v_class FROM public.kw_classes WHERE id = p_class_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found'; END IF;
  -- Super admin can edit any class; teachers can only edit their own
  IF NOT public.is_super_admin() AND v_class.teacher_id != public.my_teacher_id() THEN
    RAISE EXCEPTION 'Not your class';
  END IF;
  UPDATE public.kw_classes SET name = p_name, grade = p_grade WHERE id = p_class_id;
  RETURN json_build_object('id', p_class_id, 'name', p_name, 'grade', p_grade);
END;
$$;
