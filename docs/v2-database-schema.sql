-- ══════════════════════════════════════════════════════════════════════════════
-- 25Maths ExamHub v2 — Complete Database Schema
-- Target: Supabase (PostgreSQL 15+), shared instance ref: jjjigohjvmyewasmmmyf
-- Date: 2026-03-13
-- ══════════════════════════════════════════════════════════════════════════════
--
-- 设计原则：
--   1. 将 v1 的 monolithic localStorage (wmatch_v3 JSON blob) 拆解为规范化表
--   2. user_plans 作为权限中枢，所有功能访问边界由此表决定
--   3. 复合主键 (user_id, item_id) 避免冗余 UUID，天然按用户分区
--   4. FLM 四态 (new/learning/uncertain/mastered) 用 ENUM 确保类型安全
--   5. 保留现有 13 张表不动，新表使用干净命名（无前缀）
--
-- 现有表（保留不动）：
--   schools, teachers, kw_classes, kw_class_students,
--   kw_assignments, assignment_results, vocab_levels,
--   notifications, feedback, question_edits, question_edits_history,
--   section_edits, leaderboard
--
-- 新增表（本文件）：
--   Layer 1: user_plans, invite_codes
--   Layer 2: vocab_mastery, kp_mastery, pp_mastery, wrong_book
--   Layer 3: daily_activity, paper_results, reforget_log
--   Layer 4: learning_goals, error_patterns, error_events
--   Layer 5: user_badges, custom_lists, user_preferences
--
-- ══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE plan_type AS ENUM ('free', 'school', 'paid', 'teacher', 'admin');
CREATE TYPE plan_source AS ENUM ('invite', 'payhip', 'wechat', 'manual');
CREATE TYPE flm_state AS ENUM ('new', 'learning', 'uncertain', 'mastered');


-- ═══════════════════════════════════════════════════════════════
-- LAYER 1: USER PERMISSIONS
-- ═══════════════════════════════════════════════════════════════

-- invite_codes: 学校邀请码管理
-- 教师创建邀请码 → 学生输入 → 自动创建 user_plans 记录
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,           -- 6-8 位邀请码，如 'HHK2026A'
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL DEFAULT 'school',
  boards TEXT[] NOT NULL DEFAULT '{}', -- 授权板块: {'cie','edx','25m'}
  class_id UUID REFERENCES kw_classes(id) ON DELETE SET NULL, -- 可选：自动加入班级
  max_uses INT NOT NULL DEFAULT 50,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,              -- NULL = 永不过期
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 约束：used_count 不超过 max_uses
  CONSTRAINT invite_codes_uses_check CHECK (used_count <= max_uses)
);

CREATE INDEX idx_invite_codes_school ON invite_codes(school_id);
CREATE INDEX idx_invite_codes_code ON invite_codes(code) WHERE is_active = TRUE;

-- user_plans: 用户订阅/权限控制（核心表）
-- 每个用户一条记录，控制所有功能访问边界
-- Guest 用户无记录 → 前端默认 free 权限
CREATE TABLE user_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL DEFAULT 'free',
  boards TEXT[] NOT NULL DEFAULT '{}', -- 可访问板块，空数组 = 仅免费内容
  source plan_source NOT NULL DEFAULT 'manual',
  invite_code_id UUID REFERENCES invite_codes(id) ON DELETE SET NULL,
  payment_ref TEXT,                    -- Payhip order ID / 微信流水号
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,              -- NULL = 永久有效
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 查询辅助函数：获取当前用户的 plan_type
CREATE OR REPLACE FUNCTION get_user_plan_type(uid UUID)
RETURNS plan_type
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT plan_type FROM user_plans WHERE user_id = uid AND is_active = TRUE),
    'free'::plan_type
  );
$$;

-- 查询辅助函数：检查用户是否有某板块权限
CREATE OR REPLACE FUNCTION user_has_board(uid UUID, board_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_plans
    WHERE user_id = uid
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > now())
      AND board_id = ANY(boards)
  );
$$;

-- RPC：使用邀请码注册
-- 前端调用：await sb.rpc('redeem_invite_code', { p_code: 'HHK2026A' })
CREATE OR REPLACE FUNCTION redeem_invite_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invite invite_codes%ROWTYPE;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  -- 查找有效邀请码
  SELECT * INTO v_invite FROM invite_codes
  WHERE code = p_code AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > now())
    AND used_count < max_uses
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Invalid or expired invite code');
  END IF;

  -- 检查是否已有 plan
  IF EXISTS (SELECT 1 FROM user_plans WHERE user_id = v_uid) THEN
    -- 更新现有 plan
    UPDATE user_plans SET
      plan_type = v_invite.plan_type,
      boards = v_invite.boards,
      source = 'invite',
      invite_code_id = v_invite.id,
      starts_at = now(),
      expires_at = NULL,
      is_active = TRUE,
      updated_at = now()
    WHERE user_id = v_uid;
  ELSE
    -- 创建新 plan
    INSERT INTO user_plans (user_id, plan_type, boards, source, invite_code_id)
    VALUES (v_uid, v_invite.plan_type, v_invite.boards, 'invite', v_invite.id);
  END IF;

  -- 递增使用计数
  UPDATE invite_codes SET used_count = used_count + 1 WHERE id = v_invite.id;

  -- 如果邀请码关联班级，自动加入
  IF v_invite.class_id IS NOT NULL THEN
    INSERT INTO kw_class_students (class_id, user_id)
    VALUES (v_invite.class_id, v_uid)
    ON CONFLICT (class_id, user_id) DO NOTHING;
  END IF;

  RETURN json_build_object(
    'ok', true,
    'plan_type', v_invite.plan_type,
    'boards', v_invite.boards,
    'school_id', v_invite.school_id
  );
END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- LAYER 2: LEARNING PROGRESS (normalized from localStorage)
-- ═══════════════════════════════════════════════════════════════

-- vocab_mastery: 逐词 FLM 状态（替代 wmatch_v3.words）
-- v1 数据迁移: wmatch_v3.words["W_xxx"] → vocab_mastery row
CREATE TABLE vocab_mastery (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_uid TEXT NOT NULL,              -- 'W_{uid}' 格式，全局唯一
  board TEXT NOT NULL,                 -- 'cie' | 'edx' | '25m'
  fs flm_state NOT NULL DEFAULT 'new',
  cs SMALLINT NOT NULL DEFAULT 0,      -- 连续正确次数
  ok INT NOT NULL DEFAULT 0,           -- 累计正确
  fail INT NOT NULL DEFAULT 0,         -- 累计错误
  rc SMALLINT NOT NULL DEFAULT 0       -- 复查轮次 (0-2, cap = REFRESH_INTERVALS.length - 1)
    CHECK (rc >= 0 AND rc <= 2),
  last_seen TIMESTAMPTZ,               -- 最后一次作答
  mastered_at TIMESTAMPTZ,             -- 首次达到 mastered 的时间
  next_review TIMESTAMPTZ,             -- 下次复查时间（mastered 衰退用）
  source TEXT DEFAULT '',              -- 'scan' | 'quiz' | 'reflow' 等
  PRIMARY KEY (user_id, word_uid)
);

CREATE INDEX idx_vocab_mastery_board ON vocab_mastery(user_id, board);
CREATE INDEX idx_vocab_mastery_review ON vocab_mastery(user_id, fs, next_review)
  WHERE fs = 'mastered' AND next_review IS NOT NULL;

-- kp_mastery: 知识点 FLM 状态（替代 wmatch_v3.kpDone）
-- v1 数据迁移: wmatch_v3.kpDone["sectionId.kpId"] → kp_mastery row
CREATE TABLE kp_mastery (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kp_id TEXT NOT NULL,                 -- 'sectionId.kpId' 格式
  board TEXT NOT NULL,
  fs flm_state NOT NULL DEFAULT 'new',
  cs SMALLINT NOT NULL DEFAULT 0,      -- 连续成功 session（cs>=2 → mastered）
  ok INT NOT NULL DEFAULT 0,
  fail INT NOT NULL DEFAULT 0,
  rc SMALLINT NOT NULL DEFAULT 0 CHECK (rc >= 0 AND rc <= 2),
  last_seen TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  PRIMARY KEY (user_id, kp_id)
);

CREATE INDEX idx_kp_mastery_board ON kp_mastery(user_id, board);
CREATE INDEX idx_kp_mastery_review ON kp_mastery(user_id, fs, next_review)
  WHERE fs = 'mastered' AND next_review IS NOT NULL;

-- pp_mastery: 真题 FLM 状态（替代 pp_mastery localStorage）
-- v1 数据迁移: pp_mastery["questionId"] → pp_mastery row
CREATE TABLE pp_mastery (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,           -- 如 '0580-s24-12-1'
  board TEXT NOT NULL,
  fs flm_state NOT NULL DEFAULT 'new',
  cs SMALLINT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,     -- 总作答次数
  rc SMALLINT NOT NULL DEFAULT 0 CHECK (rc >= 0 AND rc <= 2),
  last_seen TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  source TEXT DEFAULT 'practice',      -- 'practice' | 'exam'
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX idx_pp_mastery_board ON pp_mastery(user_id, board);
CREATE INDEX idx_pp_mastery_review ON pp_mastery(user_id, fs, next_review)
  WHERE fs = 'mastered' AND next_review IS NOT NULL;

-- wrong_book: 错题本（替代 pp_wrong_book localStorage）
CREATE TABLE wrong_book (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  board TEXT NOT NULL,
  notes TEXT DEFAULT '',               -- 用户笔记：为什么错了
  wrong_count INT NOT NULL DEFAULT 1,  -- 错误次数
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,            -- 解决时间（NULL = 未解决）
  PRIMARY KEY (user_id, question_id)
);


-- ═══════════════════════════════════════════════════════════════
-- LAYER 3: SESSION & HISTORY
-- ═══════════════════════════════════════════════════════════════

-- daily_activity: 每日学习记录（替代 wmatch_v3.history[]）
-- 每用户每天一行，upsert 模式
CREATE TABLE daily_activity (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activities INT NOT NULL DEFAULT 0,   -- 总活动数
  correct INT NOT NULL DEFAULT 0,
  incorrect INT NOT NULL DEFAULT 0,
  mastered_snapshot INT NOT NULL DEFAULT 0, -- 当天快照
  duration_sec INT DEFAULT 0,          -- 学习时长（秒）
  PRIMARY KEY (user_id, activity_date)
);

-- 连续天数可以从 daily_activity 实时计算，无需单独表
-- SELECT count(*) FROM (
--   SELECT activity_date, activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::INT AS grp
--   FROM daily_activity WHERE user_id = $1 AND activities > 0
--   ORDER BY activity_date DESC
-- ) sub WHERE grp = (SELECT ... LIMIT 1);

-- paper_results: 整套试卷完成记录（替代 pp_paper_results + pp_exam_history）
CREATE TABLE paper_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_key TEXT NOT NULL,             -- '2024March-Paper12'
  board TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  duration_ms INT,                     -- 耗时（毫秒）
  session_type TEXT DEFAULT 'exam',    -- 'exam' | 'practice'
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_paper_results_user ON paper_results(user_id, board, completed_at DESC);

-- reforget_log: 遗忘回退记录（mastered → uncertain/learning）
-- 用于分析遗忘曲线、调整复查间隔
CREATE TABLE reforget_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,              -- word_uid / kp_id / question_id
  item_type TEXT NOT NULL CHECK (item_type IN ('vocab', 'kp', 'pp')),
  board TEXT NOT NULL,
  from_fs flm_state NOT NULL DEFAULT 'mastered',
  to_fs flm_state NOT NULL,
  days_as_mastered INT,                -- 维持 mastered 状态的天数
  section_id TEXT,                     -- 所属章节（可选，用于 section-level 分析）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reforget_user ON reforget_log(user_id, created_at DESC);
-- 保留策略：应用层保留最近 2000 条/用户，定期清理旧数据


-- ═══════════════════════════════════════════════════════════════
-- LAYER 4: PERSONALIZATION & AI
-- ═══════════════════════════════════════════════════════════════

-- learning_goals: 学习目标（替代 wmatch_v3.learningGoals）
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board TEXT,                          -- NULL = 全板块目标
  goal_type TEXT NOT NULL,             -- 'mastery' | 'backlog' | 'streak' | 'section'
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned')),
  target_value INT NOT NULL,           -- 目标值
  current_value INT NOT NULL DEFAULT 0, -- 当前进度
  priority INT NOT NULL DEFAULT 0,
  reasons TEXT[] DEFAULT '{}',         -- 系统生成的目标原因
  section_id TEXT,                     -- goal_type = 'section' 时指定
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user ON learning_goals(user_id, status);

-- error_patterns: 错误模式统计（替代 wmatch_v3.errorPatternMemory.patternStats）
-- 5 类 pattern: vocab / concept / method / reading / calculation
-- pattern_key 格式: 'vocab' (全局) 或 'concept:1.1' (section 级别)
CREATE TABLE error_patterns (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_key TEXT NOT NULL,           -- 'vocab' | 'concept:sectionId' | ...
  board TEXT NOT NULL DEFAULT '',
  persistent_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  evidence_count INT NOT NULL DEFAULT 0,
  recent_weight NUMERIC(8,2) NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pattern_key, board)
);

-- error_events: 错误事件明细（替代 wmatch_v3.errorPatternMemory.recentEvents）
-- 保留最近 200 条/用户，用于计算 recent_weight
CREATE TABLE error_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  section_id TEXT,
  board TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]', -- [{type, weight, reason}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_error_events_user ON error_events(user_id, created_at DESC);


-- ═══════════════════════════════════════════════════════════════
-- LAYER 5: GAMIFICATION & CUSTOMIZATION
-- ═══════════════════════════════════════════════════════════════

-- user_badges: 成就徽章（替代 wmatch_badges localStorage）
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,              -- 'first_word', 'streak_7', 'quiz_perfect' 等
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- custom_lists: 用户自建词汇表（替代 custom_lists localStorage）
CREATE TABLE custom_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',   -- [{type: 'vocab'|'question', ref: 'W_xxx', pos: 0}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_lists_user ON custom_lists(user_id);

-- user_preferences: UI 偏好设置（替代多个 wmatch_* localStorage keys）
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lang TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'zh', 'bilingual')),
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  sound BOOLEAN NOT NULL DEFAULT TRUE,
  quiz_direction TEXT NOT NULL DEFAULT 'en2zh'
    CHECK (quiz_direction IN ('en2zh', 'zh2en')),
  default_board TEXT,                  -- 默认板块
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Helper: reuse existing is_super_admin() function

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reforget_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ── user_plans ──
CREATE POLICY "users_read_own_plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_all_plans" ON user_plans
  FOR ALL USING (is_super_admin());
-- 注意：普通用户不能直接 INSERT/UPDATE user_plans
-- 必须通过 redeem_invite_code() 或 Payhip webhook (Edge Function) 修改

-- ── invite_codes ──
CREATE POLICY "teachers_manage_own_codes" ON invite_codes
  FOR ALL USING (
    created_by = (SELECT id FROM teachers WHERE user_id = auth.uid())
    OR is_super_admin()
  );
CREATE POLICY "anyone_read_active_code" ON invite_codes
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > now()));

-- ── vocab_mastery ──
CREATE POLICY "users_own_vocab" ON vocab_mastery
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "teachers_read_students_vocab" ON vocab_mastery
  FOR SELECT USING (
    user_id IN (
      SELECT cs.user_id FROM kw_class_students cs
      JOIN kw_classes c ON cs.class_id = c.id
      WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- ── kp_mastery ──
CREATE POLICY "users_own_kp" ON kp_mastery
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "teachers_read_students_kp" ON kp_mastery
  FOR SELECT USING (
    user_id IN (
      SELECT cs.user_id FROM kw_class_students cs
      JOIN kw_classes c ON cs.class_id = c.id
      WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- ── pp_mastery ──
CREATE POLICY "users_own_pp" ON pp_mastery
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "teachers_read_students_pp" ON pp_mastery
  FOR SELECT USING (
    user_id IN (
      SELECT cs.user_id FROM kw_class_students cs
      JOIN kw_classes c ON cs.class_id = c.id
      WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- ── wrong_book ──
CREATE POLICY "users_own_wrong_book" ON wrong_book
  FOR ALL USING (auth.uid() = user_id);

-- ── daily_activity ──
CREATE POLICY "users_own_activity" ON daily_activity
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "teachers_read_students_activity" ON daily_activity
  FOR SELECT USING (
    user_id IN (
      SELECT cs.user_id FROM kw_class_students cs
      JOIN kw_classes c ON cs.class_id = c.id
      WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- ── paper_results ──
CREATE POLICY "users_own_paper_results" ON paper_results
  FOR ALL USING (auth.uid() = user_id);

-- ── reforget_log ──
CREATE POLICY "users_own_reforget" ON reforget_log
  FOR ALL USING (auth.uid() = user_id);

-- ── learning_goals ──
CREATE POLICY "users_own_goals" ON learning_goals
  FOR ALL USING (auth.uid() = user_id);

-- ── error_patterns ──
CREATE POLICY "users_own_patterns" ON error_patterns
  FOR ALL USING (auth.uid() = user_id);

-- ── error_events ──
CREATE POLICY "users_own_events" ON error_events
  FOR ALL USING (auth.uid() = user_id);

-- ── user_badges ──
CREATE POLICY "users_own_badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id);

-- ── custom_lists ──
CREATE POLICY "users_own_lists" ON custom_lists
  FOR ALL USING (auth.uid() = user_id);

-- ── user_preferences ──
CREATE POLICY "users_own_prefs" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- 批量 upsert 词汇掌握度（客户端离线→在线同步用）
-- 前端调用: await sb.rpc('sync_vocab_mastery', { p_items: [...] })
CREATE OR REPLACE FUNCTION sync_vocab_mastery(p_items JSONB)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_item JSONB;
  v_count INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  FOR v_item IN SELECT jsonb_array_elements(p_items)
  LOOP
    INSERT INTO vocab_mastery (user_id, word_uid, board, fs, cs, ok, fail, rc, last_seen, mastered_at, next_review, source)
    VALUES (
      v_uid,
      v_item->>'word_uid',
      v_item->>'board',
      (v_item->>'fs')::flm_state,
      COALESCE((v_item->>'cs')::INT, 0),
      COALESCE((v_item->>'ok')::INT, 0),
      COALESCE((v_item->>'fail')::INT, 0),
      COALESCE((v_item->>'rc')::INT, 0),
      (v_item->>'last_seen')::TIMESTAMPTZ,
      (v_item->>'mastered_at')::TIMESTAMPTZ,
      (v_item->>'next_review')::TIMESTAMPTZ,
      COALESCE(v_item->>'source', '')
    )
    ON CONFLICT (user_id, word_uid) DO UPDATE SET
      fs = EXCLUDED.fs,
      cs = EXCLUDED.cs,
      ok = EXCLUDED.ok,
      fail = EXCLUDED.fail,
      rc = EXCLUDED.rc,
      last_seen = GREATEST(vocab_mastery.last_seen, EXCLUDED.last_seen),
      mastered_at = COALESCE(EXCLUDED.mastered_at, vocab_mastery.mastered_at),
      next_review = EXCLUDED.next_review,
      source = EXCLUDED.source;
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('ok', true, 'synced', v_count);
END;
$$;

-- 批量 upsert KP 掌握度
CREATE OR REPLACE FUNCTION sync_kp_mastery(p_items JSONB)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_item JSONB;
  v_count INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  FOR v_item IN SELECT jsonb_array_elements(p_items)
  LOOP
    INSERT INTO kp_mastery (user_id, kp_id, board, fs, cs, ok, fail, rc, last_seen, mastered_at, next_review)
    VALUES (
      v_uid,
      v_item->>'kp_id',
      v_item->>'board',
      (v_item->>'fs')::flm_state,
      COALESCE((v_item->>'cs')::INT, 0),
      COALESCE((v_item->>'ok')::INT, 0),
      COALESCE((v_item->>'fail')::INT, 0),
      COALESCE((v_item->>'rc')::INT, 0),
      (v_item->>'last_seen')::TIMESTAMPTZ,
      (v_item->>'mastered_at')::TIMESTAMPTZ,
      (v_item->>'next_review')::TIMESTAMPTZ
    )
    ON CONFLICT (user_id, kp_id) DO UPDATE SET
      fs = EXCLUDED.fs,
      cs = EXCLUDED.cs,
      ok = EXCLUDED.ok,
      fail = EXCLUDED.fail,
      rc = EXCLUDED.rc,
      last_seen = GREATEST(kp_mastery.last_seen, EXCLUDED.last_seen),
      mastered_at = COALESCE(EXCLUDED.mastered_at, kp_mastery.mastered_at),
      next_review = EXCLUDED.next_review;
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('ok', true, 'synced', v_count);
END;
$$;

-- 获取用户学习概览（教师面板用）
CREATE OR REPLACE FUNCTION get_student_overview(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- 调用者必须是该学生的教师或超级管理员
  IF NOT is_super_admin() AND NOT EXISTS (
    SELECT 1 FROM kw_class_students cs
    JOIN kw_classes c ON cs.class_id = c.id
    WHERE cs.user_id = p_user_id
      AND c.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
  ) THEN
    RETURN json_build_object('ok', false, 'error', 'Unauthorized');
  END IF;

  SELECT json_build_object(
    'vocab', (SELECT json_build_object(
      'total', COUNT(*),
      'mastered', COUNT(*) FILTER (WHERE fs = 'mastered'),
      'learning', COUNT(*) FILTER (WHERE fs = 'learning'),
      'uncertain', COUNT(*) FILTER (WHERE fs = 'uncertain')
    ) FROM vocab_mastery WHERE user_id = p_user_id),
    'kp', (SELECT json_build_object(
      'total', COUNT(*),
      'mastered', COUNT(*) FILTER (WHERE fs = 'mastered')
    ) FROM kp_mastery WHERE user_id = p_user_id),
    'pp', (SELECT json_build_object(
      'total', COUNT(*),
      'mastered', COUNT(*) FILTER (WHERE fs = 'mastered')
    ) FROM pp_mastery WHERE user_id = p_user_id),
    'streak', (SELECT COUNT(*) FROM daily_activity
      WHERE user_id = p_user_id AND activities > 0
        AND activity_date >= CURRENT_DATE - 30),
    'plan', (SELECT json_build_object(
      'type', plan_type, 'boards', boards, 'expires_at', expires_at
    ) FROM user_plans WHERE user_id = p_user_id)
  ) INTO v_result;

  RETURN json_build_object('ok', true, 'data', v_result);
END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════

-- 学生掌握度汇总视图（教师面板用）
CREATE OR REPLACE VIEW student_mastery_summary AS
SELECT
  cs.class_id,
  cs.user_id,
  cs.student_name,
  -- 词汇统计
  COALESCE(v.vocab_total, 0) AS vocab_total,
  COALESCE(v.vocab_mastered, 0) AS vocab_mastered,
  -- KP 统计
  COALESCE(k.kp_total, 0) AS kp_total,
  COALESCE(k.kp_mastered, 0) AS kp_mastered,
  -- 真题统计
  COALESCE(p.pp_total, 0) AS pp_total,
  COALESCE(p.pp_mastered, 0) AS pp_mastered,
  -- 最近活跃
  COALESCE(a.last_active, cs.created_at) AS last_active
FROM kw_class_students cs
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS vocab_total,
         COUNT(*) FILTER (WHERE fs = 'mastered') AS vocab_mastered
  FROM vocab_mastery WHERE user_id = cs.user_id
) v ON TRUE
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS kp_total,
         COUNT(*) FILTER (WHERE fs = 'mastered') AS kp_mastered
  FROM kp_mastery WHERE user_id = cs.user_id
) k ON TRUE
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS pp_total,
         COUNT(*) FILTER (WHERE fs = 'mastered') AS pp_mastered
  FROM pp_mastery WHERE user_id = cs.user_id
) p ON TRUE
LEFT JOIN LATERAL (
  SELECT MAX(activity_date)::TIMESTAMPTZ AS last_active
  FROM daily_activity WHERE user_id = cs.user_id
) a ON TRUE;


-- ═══════════════════════════════════════════════════════════════
-- MIGRATION NOTES (v1 → v2)
-- ═══════════════════════════════════════════════════════════════
--
-- 数据迁移策略：渐进式，不中断 v1 运行
--
-- Phase A: 创建新表（本文件）
--   - 所有新表与现有表共存于同一 Supabase 实例
--   - v1 代码不受影响
--
-- Phase B: 双写期
--   - v1 继续写 localStorage + vocab_progress (JSON blob)
--   - 新增 sync worker: 定期将 vocab_progress blob 拆解写入新表
--   - 新表数据 = blob 展开后的规范化版本
--
-- Phase C: v2 读写新表
--   - v2 前端直接读写规范化表
--   - localStorage 仅作为离线缓存（PWA 场景）
--   - 登录后立即 sync: localStorage → DB (via sync_vocab_mastery RPC)
--
-- Phase D: 清理
--   - 确认所有用户数据已迁移
--   - 废弃 vocab_progress 表
--   - 清理 v1 兼容代码
--
-- ═══════════════════════════════════════════════════════════════
-- 关键数据映射（v1 localStorage → v2 表）
-- ═══════════════════════════════════════════════════════════════
--
-- wmatch_v3.words           → vocab_mastery (逐行展开)
-- wmatch_v3.kpDone          → kp_mastery (逐行展开)
-- wmatch_v3.history[]       → daily_activity (逐天一行)
-- wmatch_v3.streak          → 从 daily_activity 实时计算
-- wmatch_v3.learningGoals   → learning_goals (逐目标一行)
-- wmatch_v3.errorPatternMemory.patternStats → error_patterns
-- wmatch_v3.errorPatternMemory.recentEvents → error_events
-- wmatch_v3.modeDone        → 不迁移（v2 重新设计模式解锁逻辑）
-- wmatch_v3.customLevels    → custom_lists
-- pp_mastery                → pp_mastery 表
-- pp_wrong_book             → wrong_book
-- pp_paper_results          → paper_results
-- pp_exam_history           → paper_results (合并)
-- reforget_log              → reforget_log 表
-- wmatch_badges             → user_badges
-- custom_lists              → custom_lists
-- wmatch_lang/dark/sound    → user_preferences
-- student_profile           → 不迁移（v2 实时计算，不持久化）
-- recovery_schedule         → 不迁移（v2 实时计算 daily plan）
-- scan_log                  → 不迁移（临时数据）
-- vocabBank                 → 不迁移（缓存数据）
--
-- ══════════════════════════════════════════════════════════════════════════════
