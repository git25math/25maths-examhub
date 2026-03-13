-- Debug: drop all existing SELECT policies on leaderboard and recreate
-- This ensures no conflicting permissive policy allows public reads

DROP POLICY IF EXISTS "leaderboard_select_own" ON public.leaderboard;
DROP POLICY IF EXISTS "leaderboard_teacher_read" ON public.leaderboard;
DROP POLICY IF EXISTS "leaderboard_superadmin_read" ON public.leaderboard;

-- Revoke direct grants from anon (belt-and-suspenders)
REVOKE ALL ON public.leaderboard FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.leaderboard TO anon;
GRANT SELECT, INSERT, UPDATE ON public.leaderboard TO authenticated;

-- Re-enable RLS (idempotent)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard FORCE ROW LEVEL SECURITY;

-- Single SELECT policy: users read their own row only
CREATE POLICY "leaderboard_select_own"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Teacher reads class members
CREATE POLICY "leaderboard_teacher_read"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.user_id = auth.uid()
        AND t.school_id = public.leaderboard.school_id
    )
  );

-- Super admin reads all
CREATE POLICY "leaderboard_superadmin_read"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
