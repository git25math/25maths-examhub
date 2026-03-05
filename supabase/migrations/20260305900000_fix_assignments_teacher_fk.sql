-- Fix assignments.teacher_id FK: originally references auth.users(id) from
-- 25maths-website, but Keywords stores teachers.id instead of auth.uid().
-- Drop the old FK and add one referencing teachers(id).

ALTER TABLE public.assignments
  DROP CONSTRAINT IF EXISTS assignments_teacher_id_fkey;

ALTER TABLE public.assignments
  ADD CONSTRAINT assignments_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;
