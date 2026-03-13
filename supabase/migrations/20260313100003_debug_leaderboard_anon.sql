-- Debug: completely block anon from leaderboard
REVOKE ALL ON public.leaderboard FROM anon;

-- Also try vocab_progress for comparison
REVOKE ALL ON public.vocab_progress FROM anon;

NOTIFY pgrst, 'reload schema';
