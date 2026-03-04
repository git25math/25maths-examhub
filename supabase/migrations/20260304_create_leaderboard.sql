-- Leaderboard table for 25Maths-Keywords
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  mastery_pct INTEGER NOT NULL DEFAULT 0,
  rank_emoji TEXT NOT NULL DEFAULT '🥉',
  total_words INTEGER NOT NULL DEFAULT 0,
  mastered_words INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: everyone can read, only owner can write
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'leaderboard_select') THEN
    CREATE POLICY leaderboard_select ON public.leaderboard FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'leaderboard_insert') THEN
    CREATE POLICY leaderboard_insert ON public.leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'leaderboard_update') THEN
    CREATE POLICY leaderboard_update ON public.leaderboard FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
