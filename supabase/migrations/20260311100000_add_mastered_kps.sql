-- v4.9.0: Add mastered_kps column to leaderboard
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS mastered_kps integer DEFAULT 0;
