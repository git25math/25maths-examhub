# Changelog

## [0.8.1] - 2026-03-04 — 三项体验打磨

### 新增
- **Board 局部统计**：首页每个考试局/课程板块标题栏显示掌握数/总数 · 掌握率
- **全部课程选项**：选课页新增"🌐 全部课程"选项，选择后显示所有模块词汇
- **切模块自动同步**：切换课程后自动触发 `syncToCloud()`，排行榜分数即时更新

### 文件变更
- `js/config.js` — `BOARD_OPTIONS` 开头新增 `all` 选项 + `isLevelVisible()` / `getVisibleBoards()` 加 `all` 判断
- `js/mastery.js` — `renderHome()` board 循环内新增局部统计计算 + `.board-stats` 显示
- `js/auth.js` — `selectBoard()` 末尾新增 `syncToCloud()` 调用
- `css/style.css` — 新增 `.board-stats` 样式 + `.board-code` margin-left 调整

---

## [0.8.0] - 2026-03-04 — 注册选课 + 按模块过滤 + 按模块排行榜/段位

### 新增
- **注册选课**：登录/注册后显示课程选择页（7 个选项：CIE 0580 / Edexcel 4MA1 / 25Maths Y7-Y11）
- **按模块过滤**：选课后首页、侧栏、复习、统计仅显示对应模块词汇
  - CIE/Edexcel 按 `board` 字段过滤
  - 25m-yN 按 `category` 字段过滤
  - 自定义导入词汇始终可见
- **按模块排行榜**：排行榜仅显示同模块用户，标题附带模块标签
- **按模块段位**：掌握率、段位均基于所选模块词汇计算
- **设置页更换课程**：设置 Modal 新增"考试局/年级"区域，显示当前模块 + 更换按钮
- **Guest 支持**：访客 board 存 localStorage，选课后同样过滤

### 数据库迁移
- `leaderboard` 表新增 `board TEXT NOT NULL DEFAULT ''` 列 + 索引

### 设计决策
- **一人一行**：leaderboard 主键不变（user_id），board 列用于过滤
- **进度不丢**：word key 按 slug 存，切模块不删数据，切回进度还在
- **getReviewCount 改用 getDueWords**：确保复习计数也按模块过滤

### 文件变更
- `js/config.js` — 新增 `userBoard` 全局 + `BOARD_OPTIONS` 数组 + `isLevelVisible()` / `getVisibleBoards()` / `getUserBoardOption()` 过滤函数
- `index.html` — 新增 `ov-board` 选课 overlay + `sb-board` 侧栏模块标签
- `css/style.css` — 新增 `.board-sel-btn` 卡片按钮 + `.settings-board-current` + `.sidebar-user-board` 样式
- `js/auth.js` — 新增 `showBoardSelection()` / `selectBoard()` / `changeBoardFromSettings()` + `afterLogin()` 门控 + 设置页 board section
- `js/app.js` — session 读 board + 排行榜查询加 `.eq('board', userBoard)` + 标题加模块标签
- `js/storage.js` — `getAllWords()` 加 `isLevelVisible()` 过滤 + `getReviewCount()` 改用 `getDueWords()` + `syncToCloud()` 加 `board` 字段
- `js/mastery.js` — `renderHome()` 改为 `getVisibleBoards().forEach`
- `js/ui.js` — `updateSidebar()` 改为 `getVisibleBoards().forEach` + 新增 `sb-board` 显示
- `supabase/migrations/20260304144007_add_board_to_leaderboard.sql` — leaderboard 加 board 列 + 索引

---

## [0.7.1] - 2026-03-04 — 关闭邮箱验证 + 客户端防刷保护

### 变更
- **移除邮箱验证流程**：注册后直接登录，不再需要确认邮件
  - 移除 `recoverSessionFromUrl()` 回调恢复函数
  - 移除 `stripAuthParams()` URL 清理函数
  - 移除 "Email not confirmed" 分支（不再 resend 验证邮件）
  - 移除 `signUp` 中 `emailRedirectTo` 选项
- **新增客户端防刷保护**：避免触发 Supabase 服务端 rate limit
  - 两次操作最小间隔 3 秒（AUTH_COOLDOWN_MS）
  - 连续失败 5 次后锁定 60 秒（AUTH_MAX_ATTEMPTS / AUTH_LOCKOUT_MS）
  - Rate limit 错误时直接进入 60 秒锁定
  - 成功登录后重置计数器
- **简化注册流程**：注册成功有 session → 直接进入；无 session → 提示"注册成功，请直接登录"
- **简化错误翻译**：移除 "邮箱未验证" 翻译条目

### 文件变更
- `js/auth.js` — 重写登录流程 + 新增防刷保护（6 个变量 + 3 个函数）；移除 3 个废弃函数
- `js/app.js` — 移除 `recoverSessionFromUrl()` 调用块（-17 行）

### 配置要求
- **Supabase Dashboard** → Authentication → Settings → 关闭 "Confirm email"（手动操作）

---

## [0.7.0] - 2026-03-04 — 添加 25Maths 校本课程 Y7-Y11 词汇（1,502 词）

### 新增
- **25Maths 校本课程词汇**：173 个词汇组，1,502 个词汇，覆盖 Year 7-11 五个年级
  - Year 7（31 组，257 词）：Circle、Constructions、Cylinders and Cones、Division of Fraction 等 11 单元
  - Year 8（31 组，278 词）：Algebraic Formula、Co-ordinates、Further Algebra、Review of Numbers 等 9 单元
  - Year 9（49 组，424 词）：2D Shape、Algebraic Functions、Mastery of Angles、Working with Expressions 等 12 单元
  - Year 10（36 组，327 词）：3D Geometry、Functions、Further Trigonometry、Quadratic Equations 等 12 单元
  - Year 11（26 组，216 词）：Differentiation、Estimation & Bounds、Set Notation & Venn Diagrams 等 11 单元
- **BOARDS 新增第三考试局**：25Maths Curriculum（🏫）含 5 个年级分类（7️⃣-1️⃣1️⃣）
- **自动拆分脚本** `scripts/gen-25m-levels.py`：从 Dashboard 提取的 JSON 自动生成 levels.js 数据

### 拆分策略
- 55 个教学单元均超过 10 词（范围 13-65），按每 10 词切分为闪卡级别
- 拆分后标题带序号：`"Circle (1)"` / `"圆 (1)"`，单组不加序号
- Slug 规则：`25m-y{N}-{slug}-{seq}`，与现有 CIE/Edexcel key 无冲突

### 向后兼容
- CIE + Edexcel 词汇 key 不变（现有进度数据完全保留）
- 25m 词汇 key 带 `25m-` 前缀，无冲突
- 7 种游戏模式 + UI 组件无需修改（多 board 架构在 v0.6.0 已完成）

### 文件变更
- `js/config.js` — BOARDS 数组追加 25m board（5 个 year categories）
- `js/levels.js` — 追加 173 个 25m level（+2,558 行）
- `scripts/gen-25m-levels.py` — 新增数据生成脚本

### 数据统计
- 总词汇量：2,200 词（CIE 390 + Edexcel 308 + 25Maths 1,502）
- 总级数：264 级（CIE 50 + Edexcel 41 + 25Maths 173）
- 总分类：20 个（CIE 8 + Edexcel 7 + 25Maths 5）

---

## [0.6.0] - 2026-03-04 — 添加 Edexcel IGCSE 4MA1 词汇 + 多考试局架构

### 新增
- **多考试局架构**：新增 `BOARDS` 配置层，支持 CIE 0580 和 Edexcel 4MA1 两个考试局
- **Edexcel 4MA1 词汇**：41 个词汇组，308 个词汇，覆盖 7 大分类
  - Numbers & Number System（8 组）
  - Equations, Formulae & Identities（6 组）
  - Sequences, Functions & Graphs（6 组）
  - Geometry & Trigonometry（8 组）
  - Mensuration（4 组）
  - Vectors & Transformations（4 组）
  - Statistics & Probability（5 组）
- **首页双考试局显示**：每个考试局独立板块（带 emoji + 名称 + 考试代码标签）
- **侧栏多考试局手风琴**：📚 CIE IGCSE Maths + 📘 Edexcel IGCSE Maths 两个独立入口
- Helper 函数：`getBoardInfo()`, `boardName()`, `getLevelBoard()`, `getAllCategories()`

### 向后兼容
- CIE 词汇 key 不变（现有进度数据完全保留）
- Edexcel 词汇 key 带 `edx-` 前缀，无冲突
- `CATEGORIES` 保留为 `BOARDS[0].categories` 别名
- 7 种游戏模式无需修改

### 文件变更
- `js/config.js` — 新增 `BOARDS` 数组 + helper 函数，`getCategoryInfo()` 搜索所有 board
- `js/levels.js` — 50 个 CIE level 添加 `board:'cie'`；追加 41 个 Edexcel level（`board:'edx'`）
- `js/mastery.js` — `catCollapsed` 遍历所有 BOARDS；`renderHome()` 三层循环（BOARDS → categories → levels）
- `js/ui.js` — `updateSidebar()` 遍历 BOARDS 渲染多个手风琴
- `css/style.css` — 新增 `.board-section` / `.board-header` / `.board-name` / `.board-code` 样式

### 数据统计
- 总词汇量：698 词（CIE 390 + Edexcel 308）
- 总级数：91 级（CIE 50 + Edexcel 41）
- 总分类：15 个（CIE 8 + Edexcel 7）

---

## [0.5.3] - 2026-03-04 — 侧栏改为单一 CIE IGCSE Maths 入口

### 变更
- 侧栏专题区从 8 个分类手风琴简化为单一「📚 CIE IGCSE Maths / 剑桥IGCSE数学」入口
- 点击展开显示 8 个专题分类（含 emoji + 双语名称）
- 点击分类跳转首页并滚动到对应专题
- `selectCategory()` 简化：不再管理侧栏展开状态，只控制右侧面板
- `updateNav()` 移至 `toggleLang()` 开头，确保语言切换时导航标签立即更新

### 文件变更
- `js/mastery.js` — 新增 `sidebarCIEOpen` + `toggleCIESidebar()`，移除 `sidebarExpanded`
- `js/ui.js` — `updateSidebar()` 重写为单一 CIE 0580 手风琴结构

---

## [0.5.2] - 2026-03-04 — 修复语言切换导航标签不更新

### 修复
- `toggleLang()` 切换语言后导航标签（首页/Home、复习/Review 等）不更新的问题
- 根因：`toggleLang()` 调用了 `updateSidebar()` 但遗漏了 `updateNav()`，而 `data-en`/`data-zh` 标签切换逻辑在 `updateNav()` 中

### 文件变更
- `js/ui.js` — `toggleLang()` 末尾新增 `updateNav()` 调用

---

## [0.5.1] - 2026-03-04 — 侧栏手风琴导航 + 首页默认收起

### 变更
- 侧栏专题改为手风琴式：点击展开子词组列表（显示名称 + 掌握百分比）
- 再次点击折叠；同时只展开一个专题
- 点击侧栏专题同时展开右侧对应分区并滚动到位
- 首页所有专题默认收起（空白），点击侧栏或标题展开
- 新增 `selectCategory()` 联动侧栏 + 右侧面板

### 文件变更
- `js/mastery.js` — 默认全部 collapsed + `selectCategory()` + `sidebarExpanded` 状态
- `js/ui.js` — 侧栏手风琴 HTML（子词组列表 + chevron）
- `css/style.css` — `.sidebar-cat-group` / `.sidebar-sub-item` 手风琴样式

---

## [0.5.0] - 2026-03-04 — EN/中英双语模式全面支持

### 新增
- `t(en, zh)` / `rankName()` / `catName()` / `lvTitle()` 四个 i18n helper 函数
- RANKS 增加 `nameEn` 字段（Bronze Learner / Silver Expert / Gold Scholar / Diamond Master / Word King）
- 50 个 level 增加 `titleZh` 字段（如 "数的类型"、"代数表达式"）
- EN 模式：所有 UI 文本（导航栏、统计标签、模式名、按钮、提示、结果页、排行榜、设置、导入导出）全部显示英文
- 中英模式：专题标题 + 词组卡标题均显示双语（如 "Number 数论"、"Number Types 数的类型"）
- 侧栏/底部导航标签（首页/复习/导入/排行榜）支持语言切换（data-en/data-zh 属性）
- 语言切换后自动刷新当前面板 + 侧栏 + 导航栏

### 覆盖范围（14 文件）
- `js/config.js` — 新增 `t()` / `rankName()` / `catName()` / `lvTitle()` + RANKS.nameEn
- `js/levels.js` — 50 个 level 增加 `titleZh` 字段
- `js/mastery.js` — renderHome / renderDeck / renderPreview 全量 i18n + lvTitle
- `js/ui.js` — updateNav i18n 标签 / updateSidebar / resultScreenHTML / toggleLang 扩大
- `js/study.js` — 学习模式卡片 + 评分按钮 + 结果页
- `js/quiz.js` — 测验提示文本
- `js/spell.js` — 拼写输入提示 + 检查/下一题按钮 + 正确答案
- `js/match.js` — 配对说明 + 计时器 + 结果页
- `js/review.js` — 复习仪表盘 + 艾宾浩斯说明 + 评分按钮 + 结果页
- `js/battle.js` — 实战模式卡片标签 + 胜利/失败文案 + 统计标签 + lvTitle
- `js/auth.js` — 设置 Modal + 段位路线 Modal 全量 i18n
- `js/app.js` — 排行榜标题 + 加载/匿名/访客文本
- `js/export.js` — 导入导出面板全量 i18n
- `index.html` — 侧栏/底部导航标签增加 data-en/data-zh 属性

---

## [0.4.3] - 2026-03-04 — 首页专题模块折叠

### 折叠功能
- 首页 8 个专题分区标题可点击折叠/展开
- 箭头图标随折叠状态旋转（▼ ↔ ▶）
- 折叠带 max-height + opacity 平滑过渡动画
- 折叠状态在当前会话内保持（切换面板后返回首页不重置）

### 文件变更
- `js/mastery.js` — 新增 `catCollapsed` 状态 + `toggleCategory()` 函数（+10 行）
- `css/style.css` — 新增折叠动画 + chevron 旋转样式（+25 行）

---

## [0.4.2] - 2026-03-04 — 移除会员分级，全部功能免费

### 变更
- 移除设置页「⭐ 会员升级」按钮
- 移除 `showMembershipInfo()` 函数及免费/Pro/Premium 三级会员路线表
- 移除 `.membership-table` / `.membership-badge` 相关 CSS（-27 行）
- 所有功能（50 组 390 词、7 种模式、云端同步、排行榜）仅需登录即可使用

### 文件变更
- `js/auth.js` — 删除会员按钮 + `showMembershipInfo()`（-16 行）
- `css/style.css` — 删除会员表格样式（-27 行）

---

## [0.4.1] - 2026-03-04 — 侧栏分类精简

### 侧栏优化
- 侧栏卡组列表从 50 个逐一列出改为只显示 8 个专题分类
- 每个分类显示 emoji + 名称 + 组数
- 点击分类自动导航到首页并平滑滚动到对应分区
- 新增 `scrollToCategory()` 函数 + 首页分区 `id="cat-{catId}"` 锚点

### 文件变更
- `js/ui.js` — `updateSidebar()` 改为分类列表 + 新增 `scrollToCategory()`（+20 行，-15 行）
- `js/mastery.js` — 分类 section 增加 id 属性（+1 行）

---

## [0.4.0] - 2026-03-04 — CIE 0580 词汇扩容（50 级 390 词）

### 词汇数据
- 从零手写 50 级完整 CIE 0580 Core + Extended 词汇，覆盖大纲 9 个 Topic
- 8 个专题分类：Number(9)、Algebra(7)、Coordinate Geometry(5)、Geometry(7)、Mensuration(5)、Trigonometry(5)、Vectors & Transformations(5)、Statistics & Probability(7)
- 每组 5-10 词，共 390 个英中双语术语，无重叠
- 每级设置 timer 和 comboBonus（≤6 词→90s/3, 7-8 词→80s/3, ≥9 词→70s/2）

### 分类系统
- `config.js` 新增 `CATEGORIES` 数组 + `getCategoryInfo()` 函数
- 首页按 8 大专题分组显示卡组网格，每组带分类标题（emoji + 名称 + 组数）
- 侧栏按分类分组显示 50 个卡组
- `css/style.css` 新增 `.category-section` / `.category-header` 样式

### localStorage 重构
- 新增 `wordKey(li, wid)` helper：生成 slug-based key（`L_{slug}_W{id}`）
- 替换所有 11 处 `'L'+li+'_W'+k` 硬编码为 `wordKey()` 调用
- 影响文件：storage.js, mastery.js, ui.js, study.js, quiz.js, spell.js, match.js, review.js

### 文件变更
- `js/config.js` — 新增 CATEGORIES + getCategoryInfo()（+19 行）
- `js/levels.js` — 重写为 50 级完整词汇数据（+815 行）
- `js/storage.js` — 新增 wordKey() + 替换 key 生成（+7 行）
- `js/mastery.js` — renderHome() 分类分组 + 移除 DECK_EMOJIS（+30 行，-27 行）
- `js/ui.js` — updateSidebar() 分类分组 + sortCards() 用 wordKey（+15 行，-13 行）
- `js/study.js` / `js/quiz.js` / `js/spell.js` / `js/match.js` / `js/review.js` — key 替换
- `css/style.css` — 新增分类标题样式（+32 行）

---

## [0.3.2] - 2026-03-04 — 段位进化路线 + 艾宾浩斯说明页

### 段位进化路线 Modal
- 新增 `showRankGuide()`：展示 5 级段位（青铜→王者）完整路线图
- 当前段位高亮标识 + 到下一段位的进度条
- 动态计算门槛词数、还需掌握词数
- 底部「如何升级」3 条要点提示
- 侧栏 / 顶栏段位 emoji 可点击打开

### 艾宾浩斯记忆法 Modal
- 新增 `showEbbinghausGuide()`：原理简介 + 8 级 SRS 间隔表（带颜色标识）
- 评分机制说明（搞定了 ×2.5 / 快了 ×1.2 / 还不熟 降 2 级）
- 复习页标题栏增加 ❓ 帮助按钮入口

### 首页段位提示
- 统计卡片下方新增段位提示行（emoji + 段位名 + 距下一级词数 + "查看路线 →"）

### 文件变更
- `js/auth.js` — 新增 `showRankGuide()`（+50 行）
- `js/review.js` — 新增 `showEbbinghausGuide()` + 标题栏帮助按钮（+42 行）
- `js/ui.js` — `updateSidebar()` 段位 emoji 可点击（+10 行）
- `js/mastery.js` — `renderHome()` 新增段位提示行（+15 行）
- `css/style.css` — 段位/SRS 说明页样式 + 首页段位提示样式（+114 行）

---

## [0.3.1] - 2026-03-04 — 云端实时排行榜

### 排行榜
- 排行榜从 Mock 数据升级为 Supabase 云端实时查询
- 新建 `leaderboard` 表（user_id, nickname, score, mastery_pct, rank_emoji, total_words, mastered_words）
- RLS 策略：所有已登录用户可读，仅本人可写
- 计分公式：`mastery_pct × 20`（掌握率百分比 × 20）
- 显示实时排名 + 掌握率百分比（替代原 streak 天数）
- 未登录用户仅显示本地数据

### 分数同步
- `syncToCloud()` 每次同步学习进度时同步 upsert 排行榜分数
- 包含字段：昵称、分数、掌握率、段位、总词数、已掌握词数
- 打开排行榜面板时从云端拉取 Top 20，确保当前用户在列表中

### 数据库变更
- 新增 Supabase 迁移：`supabase/migrations/20260304_create_leaderboard.sql`
- Supabase 项目已 link 并初始化（`supabase/config.toml`）

### 文件变更
- `js/storage.js` — `syncToCloud()` 增加 leaderboard upsert（+16 行）
- `js/app.js` — `renderBoard()` 重写为 async 云端查询（+45 行，-40 行）
- `supabase/` — 新增项目配置 + 迁移文件

---

## [0.3.0] - 2026-03-04 — 会员设置 + 昵称 + 密码修改

### 会员自助功能
- 新增设置 Modal（⚙ 按钮）：修改昵称 + 修改密码，侧栏和顶栏均可进入
- 昵称存储于 Supabase `user_metadata`，无需额外建表
- 密码修改：校验长度≥6位 + 两次一致，调用 `sb.auth.updateUser({ password })`
- Guest 模式点击设置按钮 → Toast "请先登录"

### 会员升级路线说明
- 设置 Modal 底部可点击"⭐ 会员升级"查看三级会员路线表
- 免费版（当前）→ Pro（即将推出）→ Premium（规划中）
- 纯展示页面，为后续付费功能预留入口

### 昵称显示
- 侧栏 / 顶栏 / 排行榜统一使用昵称优先逻辑：`nickname > email前缀 > 访客模式`
- 登录、注册、session 恢复（回调 + 已有 session）四处均读取 `user_metadata.nickname`

### 文件变更
- `index.html` — 侧栏 + 顶栏各添加 ⚙ 设置按钮（+2 行）
- `js/auth.js` — 新增 `showSettings()` / `saveSettings()` / `showMembershipInfo()`，登录时读取 nickname（+101 行）
- `js/ui.js` — `updateSidebar()` 昵称优先显示（+5 行）
- `js/app.js` — session 恢复读取 nickname + 排行榜使用昵称（+6 行）
- `css/style.css` — 设置表单样式 + 会员路线表样式（+49 行）

---

## [0.2.1] - 2026-03-04 — 跨站认证修复

### 认证系统
- 修复注册后重定向到主站的问题：`signUp()` 添加 `emailRedirectTo` 参数，确认邮件链接回 keywords.25maths.com
- 新增 `recoverSessionFromUrl()` — 自动从回调 URL 恢复 session（支持 access_token / PKCE code / OTP token_hash 三种模式）
- 修复登出竞态条件：`doLogout()` 改为 async，await `syncToCloud()` + `signOut()` 顺序执行
- 注册后若需邮箱验证，显示 Toast 提示而非静默失败
- `AUTH_REDIRECT` 动态取 `window.location.origin`，跨站部署无需改代码

### UX 改进
- 登录按钮添加加载状态（disabled + "登录中..."），防止重复点击
- Supabase 常见错误消息翻译为中文（邮箱或密码错误 / 邮箱未验证 / 已注册 / 操作频繁 / 网络错误）
- 回调 URL 参数自动清理（`stripAuthParams()`），地址栏保持干净

### 文件变更
- `js/auth.js` — 重写（新增 159 行：回调恢复、错误翻译、加载状态、登出修复）
- `js/app.js` — 初始化流程前置 `recoverSessionFromUrl()` 调用

### 配置要求
- Supabase Dashboard → Authentication → URL Configuration 需添加 `https://keywords.25maths.com/`

---

## [0.2.0] - 2026-03-04 — 功能融合 + 响应式升级

### UI / 布局
- 全新三端响应式布局：侧栏（桌面≥1080px）/ 顶栏+底栏（平板640-1079px）/ 紧凑模式（手机<640px）
- 面板导航系统替代旧的覆盖层模式（showPanel/navTo 取代 hideAll/showOv）
- 视觉风格迁移：马卡龙色系 → 紫色系 #5248C9 + Bricolage Grotesque / DM Sans 字体
- 通用 Toast 通知 + Modal 弹窗组件
- 粒子颜色更新匹配新主题

### 新增模式（3个）
- **测验模式** (quiz.js) — 四选一，显示英文选中文释义，绿/红反馈
- **拼写模式** (spell.js) — 显示中文释义+首字母提示，输入英文，Enter 键支持
- **配对模式** (match.js) — 左列英文/右列中文乱序，点击配对，无计时压力

### 首页 + 卡组系统
- 首页仪表盘：总词汇 / 已掌握 / 待复习 统计卡 + 卡组网格（响应式列数）
- 卡组详情页：7 个模式按钮（预览/学习/测验/拼写/配对/实战/复习）
- 排序控制：默认 / A-Z / 随机 / 难词优先
- 词汇列表显示 SRS 等级标签 + 正确/错误次数
- 预览模式：响应式卡片网格浏览

### 数据模型扩展
- 词汇新增 `ok`（正确次数）、`fail`（错误次数）、`lv`（0-7 艾宾浩斯等级）
- SRS 8 级标签：New / 20m / 1h / 9h / 1d / 2d / 1w / 30d
- 向后兼容：现有数据自动补全新字段

### 艾宾浩斯复习
- 复习仪表盘：CSS 柱状图（8 列，按 SRS 等级分组）
- 待复习列表（lv < 3 或到期词汇）
- 全局复习 + 按卡组复习两种入口

### 导入 / 导出系统
- **导入**：文件上传 + 文本粘贴，4 格式自动检测（JSON / Markdown 表格 / CSV-TSV / 自由文本）
- **导出**：CSV（不熟单词）+ JSON（学习记录）+ Markdown 表格（新增）
- 自定义关卡持久化到 localStorage，重启后自动加载

### 其他
- 实战模式结果改用 Modal 弹窗展示
- 排行榜页面（Mock 数据，云端排行即将上线）
- 语言切换按钮（EN / 中英双语）
- 桌面侧栏显示卡组快捷入口
- 全局状态管理：appLang / appView / appSort / appBP
- 断点检测函数 detectBP()

### 文件变更
- 修改 13 个文件，新建 3 个文件（quiz.js / spell.js / match.js）
- 脚本加载顺序从 12 → 15 个文件
- levels.js 格式不变

---

## [0.1.0] - 2026-03-04 — Initial Launch

### Architecture
- Refactored single-file prototype (`word-match-pro.html`) into multi-file project
- 12 modular JS files: config / levels / storage / particles / auth / ui / mastery / study / battle / review / export / app
- Expanded CSS with section comments and full readability (`css/style.css`)
- Clean HTML structure (`index.html`)

### Features (from prototype)
- Three game modes: Study (flashcard flip), Battle (timed matching), Review (spaced repetition)
- Rank system: Bronze → Silver → Gold → Diamond → King (based on mastery %)
- Word mastery tracking with spaced repetition intervals
- Mastery dashboard with filter tabs (All / Mastered / Learning / New)
- Data export: unfamiliar words CSV + learning progress JSON
- Responsive design (mobile / tablet / desktop)

### Backend
- Supabase integration (shared with 25maths-website project)
- `vocab_progress` table for cloud sync (RLS enabled)
- Auth: login / register / guest mode

### Data
- 3 CIE 0580 Algebra vocabulary levels (21 words) for initial launch
  - 代数表达式 (8 words)
  - 指数与方程 (7 words)
  - 图形与函数 (6 words)

### Tooling
- `scripts/build-single.py` — merge into single HTML for offline distribution
- `scripts/extract-vocab.py` — .tex vocabulary extraction (WIP: regex fix needed)
- `data/sources.json` — path mapping for 8 .tex vocab files
- Original prototypes archived in `prototypes/`

### Deployment
- GitHub Pages: https://git25math.github.io/25maths-keywords/
- Repository: https://github.com/git25math/25maths-keywords
