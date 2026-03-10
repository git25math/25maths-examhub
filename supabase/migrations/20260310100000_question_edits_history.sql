-- question_edits 历史版本表（每个 qid 最多保留 7 份历史）
CREATE TABLE IF NOT EXISTS public.question_edits_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  qid TEXT NOT NULL,
  board TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qe_history_qid ON public.question_edits_history (qid, archived_at DESC);

ALTER TABLE public.question_edits_history ENABLE ROW LEVEL SECURITY;

-- 仅超管可读
CREATE POLICY "admin_read_history" ON public.question_edits_history
  FOR SELECT USING (auth.jwt()->>'email' = 'zhuxingda86@hotmail.com');

-- Trigger: 每次 question_edits UPDATE 前，把旧值存入 history，然后清理超过 7 份的
CREATE OR REPLACE FUNCTION trg_question_edits_history()
RETURNS TRIGGER AS $$
BEGIN
  -- 保存旧版本
  INSERT INTO public.question_edits_history (qid, board, data, status, updated_by, updated_at)
  VALUES (OLD.qid, OLD.board, OLD.data, OLD.status, OLD.updated_by, OLD.updated_at);

  -- 清理超过 7 份的旧记录（保留最新 7 条）
  DELETE FROM public.question_edits_history
  WHERE qid = OLD.qid
    AND id NOT IN (
      SELECT id FROM public.question_edits_history
      WHERE qid = OLD.qid
      ORDER BY archived_at DESC
      LIMIT 7
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER question_edits_before_update
  BEFORE UPDATE ON public.question_edits
  FOR EACH ROW
  EXECUTE FUNCTION trg_question_edits_history();
