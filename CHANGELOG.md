# Changelog

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
