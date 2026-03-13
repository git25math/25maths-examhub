-- ============================================================
-- Enable RLS on leaderboard & vocab_progress
-- Users can only read/write their own rows (auth.uid() = user_id)
-- ============================================================

-- ── leaderboard ──────────────────────────────────────────────
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- SELECT: own row + read others for leaderboard display
CREATE POLICY "leaderboard_select_own"
  ON public.leaderboard FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: own row only
CREATE POLICY "leaderboard_insert_own"
  ON public.leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: own row only
CREATE POLICY "leaderboard_update_own"
  ON public.leaderboard FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: own row only
CREATE POLICY "leaderboard_delete_own"
  ON public.leaderboard FOR DELETE
  USING (auth.uid() = user_id);

-- Teachers need to read class members' leaderboard rows
CREATE POLICY "leaderboard_teacher_read"
  ON public.leaderboard FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.user_id = auth.uid()
        AND t.school_id = public.leaderboard.school_id
    )
  );

-- Super admin bypass (read all)
CREATE POLICY "leaderboard_superadmin_read"
  ON public.leaderboard FOR SELECT
  USING (public.is_super_admin());

-- ── vocab_progress ───────────────────────────────────────────
ALTER TABLE public.vocab_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: own row only
CREATE POLICY "vocab_progress_select_own"
  ON public.vocab_progress FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: own row only
CREATE POLICY "vocab_progress_insert_own"
  ON public.vocab_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: own row only
CREATE POLICY "vocab_progress_update_own"
  ON public.vocab_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: own row only
CREATE POLICY "vocab_progress_delete_own"
  ON public.vocab_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Super admin bypass
CREATE POLICY "vocab_progress_superadmin_read"
  ON public.vocab_progress FOR SELECT
  USING (public.is_super_admin());
