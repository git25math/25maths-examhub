-- ══════════════════════════════════════════════════════════════
-- Admin tables: schools, teachers, classes, class_students
-- + leaderboard extensions + student_activity_view
-- ══════════════════════════════════════════════════════════════

-- 1. schools
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. teachers
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. class_students
CREATE TABLE public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);

-- 5. leaderboard extensions
ALTER TABLE public.leaderboard
  ADD COLUMN IF NOT EXISTS school_id UUID,
  ADD COLUMN IF NOT EXISTS class_id UUID;

-- 6. student_activity_view
CREATE OR REPLACE VIEW public.student_activity_view AS
SELECT cs.class_id, cs.user_id, cs.student_name,
       c.grade, c.school_id, c.name AS class_name,
       l.mastery_pct, l.mastered_words, l.total_words,
       l.rank_emoji, l.score, l.updated_at AS last_active
FROM public.class_students cs
JOIN public.classes c ON cs.class_id = c.id
LEFT JOIN public.leaderboard l ON cs.user_id = l.user_id;

-- ═══ RLS ═══
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- Helper: get school_id for current user (teacher)
CREATE OR REPLACE FUNCTION public.my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- schools: same-school teachers can SELECT
CREATE POLICY "teachers_read_own_school" ON public.schools
  FOR SELECT USING (id = public.my_school_id());

-- teachers: same-school teachers can SELECT
CREATE POLICY "teachers_read_colleagues" ON public.teachers
  FOR SELECT USING (school_id = public.my_school_id());

-- classes: same-school teachers can SELECT, creator can INSERT/UPDATE
CREATE POLICY "teachers_read_classes" ON public.classes
  FOR SELECT USING (school_id = public.my_school_id());

CREATE POLICY "teachers_insert_classes" ON public.classes
  FOR INSERT WITH CHECK (
    school_id = public.my_school_id()
    AND teacher_id = (SELECT id FROM public.teachers WHERE user_id = auth.uid())
  );

CREATE POLICY "teachers_update_classes" ON public.classes
  FOR UPDATE USING (
    teacher_id = (SELECT id FROM public.teachers WHERE user_id = auth.uid())
  );

-- class_students: same-school teachers can SELECT, students can SELECT own
CREATE POLICY "teachers_read_students" ON public.class_students
  FOR SELECT USING (
    class_id IN (SELECT id FROM public.classes WHERE school_id = public.my_school_id())
  );

CREATE POLICY "students_read_own" ON public.class_students
  FOR SELECT USING (user_id = auth.uid());

-- ═══ SEED DATA ═══
INSERT INTO public.schools (name, code)
VALUES ('HarrowHaikou International School', 'HARROW2026');
