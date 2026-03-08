-- Super admin RLS bypass: allow zhuxingda86@hotmail.com to read all data
-- Uses auth.jwt() to check email without needing a teachers record

-- Helper: check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (auth.jwt() ->> 'email') = 'zhuxingda86@hotmail.com';
$$;

-- schools: super admin can read all
CREATE POLICY "superadmin_read_schools" ON public.schools
  FOR SELECT USING (public.is_super_admin());

-- teachers: super admin can read all
CREATE POLICY "superadmin_read_teachers" ON public.teachers
  FOR SELECT USING (public.is_super_admin());

-- kw_classes: super admin can read all
CREATE POLICY "superadmin_read_classes" ON public.kw_classes
  FOR SELECT USING (public.is_super_admin());

-- kw_class_students: super admin can read all
CREATE POLICY "superadmin_read_students" ON public.kw_class_students
  FOR SELECT USING (public.is_super_admin());

-- kw_assignments: super admin can read all
CREATE POLICY "superadmin_read_assignments" ON public.kw_assignments
  FOR SELECT USING (public.is_super_admin());
