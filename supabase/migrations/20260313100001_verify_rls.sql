-- Force RLS on leaderboard (belt-and-suspenders)
ALTER TABLE public.leaderboard FORCE ROW LEVEL SECURITY;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
