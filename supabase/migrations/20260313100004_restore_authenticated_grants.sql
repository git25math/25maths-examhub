-- Restore grants for authenticated role only (anon stays revoked)
-- leaderboard: authenticated users need SELECT + INSERT + UPDATE (own rows via RLS)
GRANT SELECT, INSERT, UPDATE ON public.leaderboard TO authenticated;

-- vocab_progress: authenticated users need SELECT + INSERT + UPDATE (own rows via RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vocab_progress TO authenticated;

NOTIFY pgrst, 'reload schema';
