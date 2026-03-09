# Development Roadmap

## Phase 1 — Core Launch [DONE]
- [x] Multi-file architecture refactor
- [x] Supabase auth + cloud sync (`vocab_progress` table)
- [x] 3 algebra levels (21 words) for MVP
- [x] GitHub Pages deployment
- [x] build-single.py offline builder

## Phase 2 — 功能融合 + 响应式升级 [DONE]
- [x] 三端响应式布局（侧栏/顶栏底栏/紧凑模式，3 断点）
- [x] 面板导航系统替代覆盖层
- [x] 紫色系主题 + Bricolage Grotesque / DM Sans 字体
- [x] 首页仪表盘 + 卡组网格 + 7 模式入口
- [x] 测验模式（四选一）、拼写模式、配对模式
- [x] 艾宾浩斯复习仪表盘 + SRS 8 级系统
- [x] 导入系统（4 格式自动检测）+ 自定义关卡
- [x] Markdown 导出 + 语言切换 + 排行榜（Mock）
- [x] Toast / Modal / 排序控制 / 预览模式

## Phase 2.1 — 跨站认证修复 [DONE]
- [x] signUp 添加 emailRedirectTo，回调重定向到 keywords 子站
- [x] recoverSessionFromUrl() 支持 3 种回调模式
- [x] 修复登出竞态（async await signOut）
- [x] 登录按钮加载状态 + 中文错误翻译
- [x] **已废弃**：邮箱验证流程在 v0.7.1 移除，改为注册即登录

## Phase 2.1.1 — 关闭邮箱验证 + 防刷保护 [DONE]
- [x] 关闭邮箱验证：注册后直接登录，移除回调恢复逻辑
- [x] 客户端防刷保护（3s 冷却 + 5 次锁定 60s + rate limit 自动锁定）
- [x] 移除 recoverSessionFromUrl / stripAuthParams / emailRedirectTo
- [ ] **待手动配置**：Supabase Dashboard → Authentication → Settings → 关闭 "Confirm email"

## Phase 2.2 — 账号设置 + 昵称 + 密码 [DONE]
- [x] 设置 Modal（⚙ 按钮），侧栏 + 顶栏双入口
- [x] 修改昵称（Supabase user_metadata，无需建表）
- [x] 修改密码（校验≥6位 + 两次一致）
- [x] 昵称优先显示（侧栏/顶栏/排行榜统一逻辑）
- [x] Guest 模式设置入口拦截（Toast 提示）
- [x] 移除会员分级（免费/Pro/Premium），全部功能免费开放

## Phase 2.3 — 云端实时排行榜 [DONE]
- [x] 新建 `leaderboard` 表（Supabase 迁移，RLS 全员可读 / 本人可写）
- [x] `syncToCloud()` 每次学习同步时 upsert 排行榜分数
- [x] `renderBoard()` 重写：async 云端 Top 20 查询，替代 Mock 数据
- [x] 计分公式：掌握率 × 20，显示排名 + 掌握率百分比
- [x] Guest 模式降级为本地数据展示

## Phase 2.4 — 段位进化路线 + 艾宾浩斯说明页 [DONE]
- [x] 段位进化路线 Modal（5 级段位卡片 + 当前高亮 + 进度条 + 升级提示）
- [x] 艾宾浩斯记忆法 Modal（原理简介 + 8 级 SRS 间隔表 + 评分机制说明）
- [x] 侧栏 / 顶栏段位 emoji 可点击打开段位路线
- [x] 首页统计区下方段位提示行（段位名 + 距下一级词数 + "查看路线"入口）
- [x] 复习仪表盘标题栏 ❓ 帮助按钮入口

## Phase 3 — CIE 0580 词汇扩容 [DONE]
- [x] 手写 50 级完整 CIE 0580 词汇（390 词，8 大专题分类）
- [x] slug-based localStorage key（`wordKey()` helper）
- [x] 首页 + 侧栏按专题分类分组显示
- [x] 分类标题样式（emoji + 名称 + 组数）
- [x] 验证：0 重叠词汇，所有 pair 数据完整
- [x] 侧栏精简：50 个卡组 → 8 个专题分类，点击滚动到对应分区

## Phase 3.1 — EN/中英双语模式 [DONE]
- [x] `t(en, zh)` / `rankName()` / `catName()` i18n helper 函数
- [x] EN 模式全英文 UI（统计、模式名、按钮、结果、设置、排行榜、导入导出）
- [x] 中英模式专题标题双语显示（如 "Number 数论"）
- [x] 段位名称双语（Bronze Learner / 青铜学员 等）
- [x] 语言切换自动刷新所有面板 + 侧栏
- [x] 12 文件全量 i18n 覆盖
- [x] 登录页默认英文 + 右上角语言切换按钮 → v1.0.4 完成

## Phase 4 — Edexcel IGCSE 4MA1 + 多考试局架构 [DONE]
- [x] 多考试局 BOARDS 配置层（CIE 0580 + Edexcel 4MA1）
- [x] Edexcel 4MA1 全部词汇（41 级，308 词，7 大分类）
- [x] 首页 + 侧栏按考试局分组显示（双手风琴）
- [x] Board section 样式（emoji + 名称 + 考试代码标签）
- [x] 向后兼容（CIE 数据 + word key 不变）
- [x] Helper 函数：`getBoardInfo()` / `boardName()` / `getLevelBoard()` / `getAllCategories()`

---

## Phase 5 — 注册选课 + 按模块过滤 + 按模块排行榜/段位 [DONE]
- [x] 注册/登录后选课（7 选项：CIE / Edexcel / 25Maths Y7-11）
- [x] 按模块过滤词汇（首页、侧栏、复习、统计均只显示所选模块）
- [x] 排行榜按模块过滤（leaderboard 新增 board 列）
- [x] 段位/掌握率按模块独立计算
- [x] 设置页更换课程入口
- [x] Guest 模式 board 存 localStorage
- [x] 每个 board section 显示局部统计（该考试局掌握率 / 已掌握词数）
- [x] 选课页"全部课程"选项（查看全量词汇）
- [x] 切模块后自动同步排行榜
- [x] 搜索/过滤功能（首页词组搜索、复习仪表盘过滤）

## Phase 6 — UX 打磨 + 学习体验 [DONE]
- [x] 密码重置功能（忘记密码 → 发送重置邮件）→ v0.9.1 完成
- [x] 同步冲突改用时间戳比较（替代当前 key 数量比较）→ v0.9.1 完成
- [x] 同步失败 Toast 提示（替代静默吞错）→ v0.9.1 完成
- [x] 深色模式 (dark mode toggle) → v0.9.0 完成
- [x] 音效系统（配对成功、连击、倒计时警告）→ v0.9.0 完成
- [x] 拼写模式增加语音朗读（Web Speech API）→ v0.9.0 完成
- [x] 测验模式增加"英文→中文"与"中文→英文"双向模式 → v0.9.0 完成
- [x] 新手引导（段位路线 + 艾宾浩斯说明 → Phase 2.4 完成）

## Phase 7 — 响应式修补 + 移动体验 [DONE]
- [x] iPhone 刘海适配（safe-area-inset-top）→ v0.9.2 完成
- [x] 触控热区最小 44px（移动端按钮/链接）→ v0.9.2 完成
- [x] 实战模式网格列数响应式（小屏 3 列 → 大屏 5 列）→ v0.9.2 完成
- [x] 闪卡宽度自适应（max-width 百分比）→ v0.9.2 完成
- [x] 排版字号断点缩放 → v0.9.2 完成
- [x] Toast 位置适配底部导航 → v0.9.2 完成
- [x] 连击弹窗手机端尺寸调整 → v0.9.2 完成

## Phase 8 — 社交 + 云端
- [x] 云端排行榜（替换 Mock 数据，基于 Supabase）→ Phase 2.3 完成
- [x] 学习连续天数（streak system）→ v0.9.3 完成
- [x] 每日挑战模式（随机 10 词限时赛）→ v0.9.4 完成
- [x] 分享结果卡片（截图友好的成绩单）→ v0.9.5 完成
  - [x] 分享卡片底部显示用户名 → v1.2.5 完成
- [x] 访客模式限制（3 词组免费试用 + 排行榜锁定 + 登录引导）→ v1.0.5 完成；v1.2.8 优化访客 UI（绿色欢迎横幅/排行榜只读/有限设置/登录入口）
- [x] 25m 内容权限控制（仅 `userSchoolId` 用户可见 25m board）→ v1.0.5 完成；v1.2.7 新增 GUEST_FULL_ACCESS 开关暂时开放 Guest 访问
- [x] 年级图标统一为 Negative Circled Numbers（⓻⓼⓽⓾⓫）→ v1.0.5 完成
- [ ] 与 25maths-website 会员系统深度对接
- [x] 学习数据可视化（趋势图、日历热力图）→ v0.9.6 完成
- [x] 底部导航 5 项适配（Phone icon-only + 滚动隐藏 + 滑动切换）→ v0.9.7 完成
- [x] Quiz 干扰项缓存优化（O(2640) → O(n)）→ v0.9.7 完成
- [x] 同步状态指示器（实时状态 + 失败重试 + 手动同步）→ v0.9.7 完成
- [x] 侧栏底部 Claude 风格弹出菜单（紧凑触发器 + 浮层菜单）→ v0.9.8 完成
- [x] 侧栏默认收缩 60px + 点击展开 260px + 导航 tooltip → v0.9.9 完成

## Phase 8.1 — 教师管理系统 [DONE]
- [x] 教师注册（特殊注册码 HARROW2026）→ v1.0.0 完成
- [x] 班级管理（创建班级、指定年级）→ v1.0.0 完成
- [x] 批量创建学生账户（邮箱+密码+姓名，上限30人/次）→ v1.0.0 完成
- [x] 学生自动选课（登录后默认选中所在年级 board）→ v1.0.0 完成
- [x] 班级详情（学生掌握率、最后活跃、段位）→ v1.0.0 完成
- [x] 重置学生密码（教师→同校学生）→ v1.0.0 完成
- [x] 年级概览（按年级分组聚合）→ v1.0.0 完成
- [x] 全校概览（汇总卡片 + Top 10 学生）→ v1.0.0 完成
- [x] 3 个 Edge Functions（register-teacher / create-students / reset-student-password）→ v1.0.0 完成
- [x] RLS 策略 + student_activity_view 视图 → v1.0.0 完成
- [x] 排行榜多维度 Scope Tabs（课程/班级/年级/全校）→ v1.0.1 完成
- [x] 排行榜 Sub Pills（维度内选择具体课程/班级/年级）→ v1.0.2 完成
- [x] 学生操作下拉菜单（改名 / 重置密码 / 移动班级）→ v1.0.3 完成
- [x] Edge Function `update-student`（更新学生 auth metadata）→ v1.0.3 完成

## Phase 8.5 — 超管词库 CRUD + 作业系统 + 站内信 + 反馈 DB [DONE]
- [x] 首页词卡组改为树状条形行显示（deck-row）→ v1.1.0 完成
- [x] 超级管理员词库 CRUD（vocab_levels 表 + 在线编辑/添加/删除）→ v1.1.0 完成
- [x] 教师布置作业（选词组 + 截止日期 + 查看完成情况）→ v1.1.0 完成
- [x] 学生作业系统（测试界面 + 待完成/已完成分区 + 学习建议）→ v1.1.0 完成
- [x] 自定义错词作业（教师从学生错词创建针对性词组，最多 10 词/组）→ v1.1.0 完成
- [x] 站内信通知系统（小铃铛 + 红点徽章 + 作业事件自动推送）→ v1.1.0 完成
- [x] 反馈收集改 DB 存储（已登录用户直接存 Supabase feedback 表）→ v1.1.0 完成
- [x] 超管反馈管理面板（Feedback tab + 状态管理 + 管理员备注）→ v1.1.0 完成

## Phase 8.6 — 项目健康修复（安全 + 性能 + 可访问性）[DONE]

### 安全加固（v1.1.1 — v1.1.4）
- [x] XSS 防护 4 轮全量清除（escapeHtml 覆盖全部 innerHTML 用户数据输出，共 50+ 处）
- [x] onclick 反斜杠逃逸注入修复（admin/homework/spell 4 处）→ v1.1.4
- [x] RLS 增强（assignments INSERT 班级归属 + UPDATE 策略）→ v1.1.1

### 性能优化（v1.1.1 — v1.1.4）
- [x] N+1 查询消除（renderClassHwList 批量 .in() 查询）→ v1.1.2
- [x] 串行→并行（cascadeGradeUpdate Promise.all）→ v1.1.2
- [x] 通知批量 INSERT（doCreateHw 串行→单次批量）→ v1.1.3
- [x] syncToCloud 节流（debouncedSync 2s trailing debounce）→ v1.1.4

### 可访问性（v1.1.2 — v1.1.4）
- [x] 键盘 focus-visible 焦点指示器（全量 9 类元素）→ v1.1.2 / v1.1.3
- [x] prefers-reduced-motion 全局规则 → v1.1.3
- [x] Modal ARIA（role=dialog / aria-modal / aria-labelledby）+ Canvas aria-hidden → v1.1.3
- [x] 可访问性增强（lang/ARIA role/aria-expanded/aria-label ×20）→ v1.1.4

### 健壮性 + 维护（v1.1.1 — v1.1.4）
- [x] 异步修复（sendNotification await×3 + showFeedbackDetail async）→ v1.1.1
- [x] 竞态修复（finishHwTest upsert + maybeSingle）→ v1.1.1
- [x] 异步错误处理（admin×5/auth×1/vocab-admin×2 + callEdgeFunction try/catch）→ v1.1.3 / v1.1.4
- [x] markNotifRead/markAllNotifsRead try/catch → v1.1.2
- [x] 缺失索引×6 → v1.1.1
- [x] 死代码清理 + APP_VERSION 常量统一 → v1.1.4

### 功能修补（v1.1.1 — v1.1.4）
- [x] 深色模式补全（通知/作业/反馈/词库 8 条规则）→ v1.1.1
- [x] 软删除作业（is_deleted 列 + 前端过滤）→ v1.1.1
- [x] 学生作业导航入口（侧栏+底栏📝按钮）→ v1.1.1
- [x] 手机端响应式补全（8 条移动端适配规则）→ v1.1.1
- [x] 自定义词汇校验（最多 10 词上限）→ v1.1.1
- [x] 品牌更名 AISL Harrow Haikou → Harrow Haikou Upper School Mathematics Curriculum → v1.1.3

## Phase 9 — 星级计分系统重构 [DONE]
- [x] computeStars(ok, fail) 纯函数（accuracy 阶梯封顶）→ v1.2.0
- [x] recordAnswer() 统一计分入口（替代 setWordStatus）→ v1.2.0
- [x] Study Easy 防刷（首次 ok=1，之后不变）→ v1.2.0
- [x] Spell 双倍奖励（ok+2）→ v1.2.0
- [x] Match mismatch 记录 fail → v1.2.0
- [x] 双指标体系：学习进度（learningPct 星级加权）+ 精通率（masteryPct 4★占比）→ v1.2.0
- [x] 首页统计卡片：Progress% + Mastery% 替代 Mastered 计数 → v1.2.0
- [x] 卡组行显示 started/total + learningPct 进度条 → v1.2.0
- [x] 卡组详情词汇星级指示器（4 圆点）→ v1.2.0
- [x] 排行榜 score = learningPct × 20，mastery_pct 独立字段 → v1.2.0
- [x] 零迁移：旧数据从 ok/fail 实时计算 stars → v1.2.0
- [x] 排行榜积分说明 Modal（星级→积分→段位完整链路 + 当前段位高亮）→ v1.2.6

## Phase 9.1 — 学习引导优化
- [x] 学习路径两层布局（主线三步 + 辅助三模式 + 箭头引导）→ v1.2.9
- [x] 结果页"下一步"推荐卡片（Study→Quiz / Quiz→Review / Match→Quiz）→ v1.2.9
- [x] 学习路径进度标记（已完成模式显示✓）→ v1.3.0
- [x] 错词即时复习（Quiz/Spell/Match 结果页"只学错的词"按钮）→ v1.3.0
- [x] 首次使用引导动画（步骤 tooltip）→ v1.3.5

## Phase 8.7 — UX 体验优化 + 内容排序 [DONE]
- [x] BOARDS 显示顺序调整：哈罗海口→CIE→Edexcel → v1.1.5
- [x] 刷新页面闪现登录页消除（localStorage 时间戳 + 内联 CSS 注入）→ v1.1.6
- [x] 语言偏好持久化（localStorage wmatch_lang，刷新不重置）→ v1.1.7
- [x] Y7-Y11 词卡教学顺序重排（55 单元从字母序→课纲教学序）→ v1.1.8
- [x] Y7-Y11 词卡按单元分组二级折叠（Unit 层 + 折叠/展开 + 搜索自动展开）→ v1.1.9

## Phase 8.4 — 班级编辑 + 学生导入 [DONE]
- [x] 编辑班级信息（名称/年级，年级变更级联更新）→ v1.0.9 完成，v1.2.3 修复 RLS 静默失败
- [x] 单个添加学生（默认 1 行 + 灵活加行）→ v1.0.9 完成
- [x] CSV 导入学生（粘贴多行 → 解析填入表格）→ v1.0.9 完成

## Phase 8.3 — 教师账号隐藏段位 + 侧栏默认展开 [DONE]
- [x] 教师账号隐藏段位 emoji / rank hint / 排行榜 → v1.0.7 完成
- [x] 侧栏桌面端默认展开 260px → v1.0.7 完成

## Phase 8.2 — 架构优化 + Bug Report [DONE]
- [x] loadS() 内存缓存（消除 95% JSON.parse）→ v1.0.6 完成
- [x] getAllWords() / getWordData() 缓存（_cacheDirty 标记）→ v1.0.6 完成
- [x] isGuestLocked() O(N²) → O(1)（_guestVisCache 缓存）→ v1.0.6 完成
- [x] renderHome() 去重复计算（预计算 stats + 复用 wd）→ v1.0.6 完成
- [x] 公共 helper 提取（isGuest / isLoggedIn / getDisplayName / getPublicBoardOptions）→ v1.0.6 完成
- [x] setWordStatus() 合并读写（3+3 → 1+1）→ v1.0.6 完成
- [x] 命名冲突修复（sb → sidebarEl, searchTimer → _rvSearchTimer）→ v1.0.6 完成
- [x] Bug Report 功能（mailto 表单，侧栏入口，中英文支持）→ v1.0.6 完成

## Phase 4.1 — 25Maths 校本课程 Y7-Y11 词汇 [DONE]
- [x] 25Maths Curriculum board（🏫 Y7-11，5 个年级分类）
- [x] 55 个教学单元拆分为 173 个闪卡级别（≤10 词/级）
- [x] 1,502 个英中双语术语，覆盖 Year 7-11
- [x] 自动生成脚本 `scripts/gen-25m-levels.py`
- [x] 总规模：3 个考试局/课程，264 级，2,200 词

---

## Phase 8.8 — 作业系统增强 + 管理面板优化
- [x] 创建作业支持自定义词汇输入（逐条添加 + 批量粘贴，最多 20 词）→ v1.2.1
- [x] 学生错词保存为自定义学习卡组（一键保存 + 即时可用 + 云端同步）→ v1.2.2
- [x] 班级列表按年级分组 + 默认折叠（Year 7→11 分组 header + chevron 展开/收起）→ v1.2.4
- [x] 作业模板（保存常用词组组合为模板）→ v1.12.1
- [x] 作业统计导出（CSV）→ v1.11.3

## Phase 9 — 内容扩展
- [x] Edexcel 4MA1 vocabulary sets → Phase 4 完成
- [x] 25Maths Curriculum Y7-Y11 vocabulary sets → Phase 4.1 完成
- [ ] IB Mathematics vocabulary sets
- [ ] AQA GCSE Mathematics vocabulary sets
- [ ] 用户创建 + 分享自定义词库（community decks）
- [x] Import/Export 增加 Anki 格式支持（TSV 导出 + 导入已有 TSV 解析）→ v1.11.4
- [ ] 多语言扩展（pinyin 显示选项、繁体中文）

## Phase 10 — 平台扩展：从词汇工具到学习支撑平台

> 详见 `docs/analysis/2026-03-05-architecture-review-v2.md`

### Phase 10A — 数据层优化（前置）[DONE]
- [x] levels.js 按 board 拆分为 3 个 JSON（异步按需加载）→ v1.3.1
- [x] 角色按需加载（学生不加载 admin/vocab-admin）→ v1.3.1
- [x] esbuild minify 脚本（17 JS → 单文件 bundle + CSS minify）→ v1.3.2
- [x] 首屏从 ~114KB gzip → ~66-72KB gzip（按 board 懒加载 JSON）→ v1.3.3
- [x] 首屏优化：资源提示 + 字体条件加载 + Supabase defer + homework 拆包（~66KB → ~47-55KB gzip）→ v1.3.4

### Phase 10B — 选择题练习（Layer 3 快速突破）[DONE]
- [x] 导入 25maths-website 全部选择题 + KaTeX 渲染（2,424 题：CIE 1,488 + Edexcel 936）→ v1.4.0
- [x] 复用 Quiz 模式 UI（支持 4 选项数学题）→ v1.4.0
- [x] 按 topic + difficulty 筛选 → v1.4.0
- [x] 练习进度独立存储（localStorage wmatch_practice）→ v1.4.0
- [x] 结果页显示 explanation 解析 → v1.4.0

### Phase 10B+ — 题目纠错 + 管理员编辑器 [DONE]
- [x] 题目纠错报告（所有用户，自动提取题目数据，存 feedback 表）→ v1.5.0
- [x] 管理员富文本编辑器（超管，textarea + 实时预览 + KaTeX + 图片上传）→ v1.5.0
- [x] 富文本渲染（题干/选项/解析支持 HTML + KaTeX + 图片）→ v1.5.0
- [x] question_edits 覆盖表 + Supabase Storage 图片桶 → v1.5.0

### Phase 10B++ — 超管整套题总览 [DONE]
- [x] 超管 "Review All" 按钮（deck 详情页 Exam Practice 区）→ v1.5.1
- [x] 可滚动列表展示全部题目（qid / topic / difficulty / 题干 / 选项 / 解析）→ v1.5.1
- [x] 每题编辑按钮直接打开编辑器 modal → v1.5.1
- [x] `_openEditor()` 公共函数重构，两入口复用 → v1.5.1
- [x] Practice/Review All 入口从 deck 详情页移到首页分类层级 → v1.5.4

### Phase 10B+++ — 知识点模块纠错 [DONE]
- [x] 知识点详情页 Vocabulary/Practice 模块🚩纠错按钮 → v1.6.1
- [x] 双路径提交（登录→feedback 表 / Guest→mailto）→ v1.6.1
- [x] 按模块区分错误类型（Vocabulary 4 类 / Practice 4 类）→ v1.6.1

### Phase 10C — CIE 考纲驱动重构 [Phase A DONE]
- [x] **Phase A 考纲骨架 + 数据迁移**：9 章 72 知识点 + 517 词 + 1,488 题映射 → v1.6.0
- [x] **Phase B 经典例题**：291 道 CIE worked examples（72 sections × 3-5 道，Core + Extended 分层）→ v2.3.2
  - [x] Phase B+ 例题 UX 优化：手风琴卡片 + 语言切换 + 延迟 KaTeX 渲染 → v2.3.3
  - [x] Phase B++ 质量修复：双击 bug + 语言切换重渲染 + 惰性 pqRender + 箭头统一 → v2.3.4
  - [x] Phase B+++ Knowledge Card 语言切换 + 手机端 we-card 响应式 → v2.3.5
  - [x] P2 优化：KP 手机端响应式 + 键盘可访问性 + 暗色模式补全 → v2.3.6
  - [x] P3 质量优化：硬编码颜色→CSS 类 + 监听器泄漏修复 + 内联样式清理 → v2.3.7
  - [x] P4 质量优化：状态颜色变量化 + KC 惰性渲染 + 编辑器防抖 + focus-visible + 内联→CSS 类 → v2.3.9
  - [x] P5 质量优化：暗色模式补全 + 内联样式清理 + 键盘可访问性（category-header/unit-header） → v2.3.10
  - [x] P6 质量优化：可访问性扩展（31 处 role/tabindex + focus-visible）+ 内联样式清理（23 处→CSS 类）+ 键盘委托 → v2.3.11
  - [x] P7 质量优化：4 文件内联样式清理（~30 处）+ 32 新 CSS 工具类 + 首页空白热修复（Supabase 守卫 + 5s 超时 + 看门狗） → v2.3.12
  - [x] P8 启动 Bug 修复：`_xxxDataReady` 未声明 ReferenceError + `knowledge-edexcel.json` 404 → v2.3.13
  - [x] P9 KP 详情页 UI 优化：概念卡片拆分 + 例题编号 + 三色卡片体系 → v2.3.14
- [x] **Phase C 知识点精析模块 Phase 1**：数据架构 `knowledge-cie.json` + 知识点列表/详情页 5 区域布局 + 事件委托 + LaTeX → v2.3.0
  - [x] Phase 2：Test Yourself MCQ 引擎 + 进度追踪 + getSectionHealth 纳入 knowledgeScore → v2.3.1
  - [x] Phase 2.5：Chapter 1 KP 数据扩充（14 KP 覆盖 8 sections）+ tqItem null guard 修复 → v2.3.2
  - [x] Phase 3 数据扩充：全量 97 KPs 覆盖 72/72 CIE sections（Gemini 批量生成 + JSON 修复 + 合并） → v2.3.15
  - [x] Phase 3.5：CIE 题目补充（2+ quiz/examples）+ HHK Y7-11 全量 55 KPs → v2.3.16
  - [x] Phase 3.6：Edexcel 4MA1 全量 49 KPs 覆盖 39/39 sections + enrichment → v2.3.17
  - [x] Phase 3.7：vocabLinks 补全（200/201 KPs 关联词汇映射） → v2.3.18
  - [ ] Phase 4：超管编辑
- [x] **Phase D 掌握度系统**：4 维掌握度追踪（Vocab/Practice/Papers/Retention）+ 复习计划推荐 → v1.12.0

### Phase 10C-EDX — Edexcel 4MA1 考纲驱动重构 [Phase A+B DONE]
- [x] **Phase A 考纲数据**：6 章 39 知识点 + 385 词 + 936 题映射 + SoW 教学序列 → v1.7.0
- [x] **Phase B JS 架构**：泛化 syllabus.js 多考试局支持 + Edexcel 首页/详情页/练习 → v1.7.0
- [x] **Phase C 词汇审核与重组**：7 section 词汇重写 + 22 section 补充（385→387 词）→ v1.7.3
- [x] **Phase D 练习题质量审计**：133 题搬迁 + 21 题隐藏 + 质量修复 + 层级修正 → v1.7.4
- [x] **Phase C+ 内容继续扩容**：补充练习题（CIE 1.6/1.7/4.8 各 10 题 = 30 题）→ v1.12.6

### Phase 10F — Past Paper 真题引擎 [Phase F+G DONE]
- [x] **Phase A 试点 (2.5 Equations)**: 数据管道 + 127 题 LaTeX→KaTeX + 练习/实战/错题本 → v1.8.0
- [x] **Phase A+ 全章扩展 + 纠错**: 代数全章 793 题 + 15 种题型 + 母题总结 + 纠错模块 → v1.8.1-v1.8.3
- [x] **图表渲染试点**: TikZ→SVG 管道 + S2.5 七题图表 + 暗色模式反色 + PNG 兜底 → v1.8.4
- [x] **Phase B 全面扩展**: 7 Topic 批量标注 3,494 题，覆盖 66/72 sections（92%）→ v1.9.2
- [x] **Phase C 考点精讲**: 72 张双语知识卡片内容质量审核（Markdown→列表 + 60 CIE + 30 Edexcel + 32 剩余 ZH 补全）→ v1.9.3-v1.9.5
- [x] **Phase D 题型归纳**: 按 CIE command words 分类全部 4,107 题 + cmd 筛选 + badge + 套卷 cmd 分布 → v1.9.6
- [x] **Phase E 套卷练习**: 统一数据管道 + 套卷浏览 + 练习/考试模式 + 成绩持久化 → v1.9.0
- [x] **Phase E+ 套卷 UX 优化**: 倒计时器 + 考试确认屏 + 退出确认 + header 试卷信息 + marks=0 过滤 + 暗色模式 → v1.9.1
- [x] **Phase F 词汇联动**: 真题题卡"相关词汇"折叠区 + 知识点详情页词汇进度 + 跳转词汇卡组 → v1.9.7
- [x] **Phase G Edexcel 真题引擎**: 1,855 题 76 套卷 papers-edx.json + 考纲严格标注(39 sections) + SoW 教学流程 + UI 解锁 → v1.12.6

### Phase 10D — 智能学习路径（跨层整合）
- [x] **Phase 10D-A 薄弱点检测 + 学习推荐**: 统一评分函数 + 首页推荐区域 + 详情页健康度 → v1.9.8
- [x] **Phase 10D-B 完整学习闭环**: 旅程条 + 模块完成标记 + 智能下一步推荐 + 里程碑 Toast → v1.9.9
- [x] **Phase 10D-C 练习推荐引擎 + 三层关联**: ppGetWeakGroups 薄弱题型分析 + Focus Areas 精准练习 + Smart Path 弱项标注 → v1.10.0
- [x] **教师端：布置练习题作业** — 作业 Modal 第 3 标签页 + 学生 MCQ 答题 + KaTeX 渲染 + 零 Schema 变更 → v1.12.4

### Phase 10E — 评估层（Layer 4）
- [x] **诊断测试**: 跨知识点 20 题加权选题 + 知识点逐项得分 + 弱项推荐 + 历史记录 → v1.10.1
- [x] **模拟卷生成器**: 按目标分数/侧重模式自动组卷 + 轮询选题 + 难度排序 → v1.10.3
- [ ] 服务端评分（Edge Function）

## Phase 11 — PWA + 离线
- [x] **Service Worker 离线缓存**: 三层策略（shell cache-first / data network-first / CDN cache-first）→ v1.11.0
- [x] **PWA manifest + install prompt**: manifest.json + SVG 图标 + 首页安装提示横条 → v1.11.0
- [x] **离线状态自动检测 + 重连同步**: online/offline 事件 + Toast + is-offline 样式 → v1.11.0
- [x] **SW 版本自动同步**: 构建脚本自动注入 APP_VERSION → sw.js CACHE_VERSION → v1.11.1
- [x] **暗色模式 theme-color**: applyDark() 动态更新 meta theme-color → v1.11.1
- [x] **成绩趋势图**: 诊断/模拟卷结果页历史得分柱状图（>=2 次显示） → v1.11.1
- [x] **build-single.py 全面重写**: 18 JS + 12 数据 JSON 内联 + fetch 拦截 + PWA 移除 → v1.11.2
- [x] **作业模板系统**: 教师保存/加载/删除常用词组模板（localStorage）→ v1.12.1
- [x] **键盘快捷键**: Study 模式 Space/Enter 翻卡 + 1/2/3 评分，Quiz/Daily 1-4 选答案 → v1.12.1
- [x] **统计分模式细分**: 7 模式完成度条形图 + 打印友好样式 → v1.12.2
- [x] **词卡预览打印**: Preview 页面 Print 按钮 + 打印布局优化 → v1.12.3
- [x] **统计数据导出**: CSV 一键导出（活动明细 + 汇总 + 模式完成度）→ v1.12.3
- [x] **复习仪表盘增强**: SRS 等级图例 + 到期词汇按紧急度排序 → v1.12.3
- [x] **P0 快速优化**: Modal 焦点陷阱+ESC + Quiz 方向持久化 + 暗色模式 28 规则修正 + getDeckStats 缓存 + 折叠状态持久化 → v1.12.7
- [x] **P1 优化**: syncToCloud 并发锁 + finishDaily 双调用防护 + Battle/Match 键盘可访问性 + 缓存标签 → v1.12.8
- [x] **P2 可靠性修复**: Timer 泄漏防护 + Modal handler 去重 + 通知 XSS 修复 + 焦点恢复 isConnected → v1.12.9
- [x] **P3 防御性修复**: onclick XSS 消除（spell/practice/homework）+ 空引用防护 → v1.13.0
- [x] **P4 质量修复**: 监听器泄漏修复（6 处）+ 残余 onclick XSS 消除（admin/homework/syllabus/practice 10 处）→ v1.13.1
- [x] **P5 质量修复**: onclick XSS 第三轮消除（admin modal HIGH×3 + syllabus Smart Path HIGH + homework GO/Retry + app Board Pills，共 9 处）→ v1.13.2

## v2.0 结构性重构 [DONE]
- [x] **Phase 1 — HHK 考纲化**: 25m→hhk 考纲驱动架构统一（syllabus-hhk.json + vocabulary-hhk.json + 多 sub-level 聚合）→ v2.0.0
- [x] **Phase 2 — 首页重设计**: 3 区聚焦（Hero Action Card + Quick Stats Strip + Syllabus Explorer）→ v2.0.0
- [x] **Phase 3 — 学习闭环**: 交互旅程条 + section 上下文 + 里程碑庆祝 + 模式完成后智能导航 → v2.0.0
- [x] **Phase 4 — 黏性系统**: 12 成就徽章 + 周目标 + 每日欢迎 + 复习提醒 → v2.0.0
- [x] **Phase 5 — 去 AI 味**: Smart Path/Section Detail/进度标签人性化 + 3 态圆点 + 彩条替代环形分数 → v2.0.0
- [x] **v2.0.1 质量优化**: onclick XSS 消除 9 处 + getDueWords 缓存 + checkBadges 节流 + 暗色模式 8 规则 + 手机端 3 规则 → v2.0.1
- [x] **v2.0.2 HHK 教学目标**: 55 sections core_content→407 条真实双语 LO + 111 子单元卡片 → v2.0.2

## v2.1 侧栏导航重构 + HHK 技能学习系统 [DONE]
- [x] **Phase A — 侧栏导航重构**: 下架 Leaderboard，新增今日计划 + 错题本，底栏同步更新 → v2.1.0
- [x] **Phase B — 今日计划 + 错题本**: renderTodaysPlan（日期/连续天数/待复习/Smart Path/Review Plan）+ renderMistakeBook（Tab 切换/词汇错题/练习错题）→ v2.1.0
- [x] **Phase C — HHK 练习引擎解锁**: 55 道 Y7 MCQ + board guard 放行 25m + Journey Bar 三步 + getSectionHealth practiceScore → v2.1.0
- [x] **Phase D — 诊断反馈 + 学习闭环**: diag 字段 + 答错诊断提示 + 结果页 diag 摘要 + 错题本联动 + Smart Path rec 增强 → v2.1.0
- [x] **v2.1.1 质量修复**: 错题本操作按钮 + Tab 委托优化 + Review/Mistakes badge + 暗色模式补全 + 手机端响应式 + 今日进度 → v2.1.1

## v2.2 子域名自动检测 + Board 锁定 [DONE]
- [x] **HOST_BOARD_MAP 子域名检测**: 3 子站域名→board 映射 + `_hostBoard` + `isSubdomainLocked()` → v2.2.0
- [x] **启动加载优化**: levels-loader boot 优先读 _hostBoard，子站不依赖 localStorage → v2.2.0
- [x] **登录流程适配**: showBoardSelection 守卫跳过 + afterLogin 强制锁定 + HHK 年级保留 → v2.2.0
- [x] **设置页适配**: 子站隐藏"更换课程"按钮 → v2.2.0
- [x] **PWA 兼容**: manifest.json start_url/scope 改为相对路径 `./` → v2.2.0
- [x] **LaTeX tabular 表格 HTML 渲染**: 546 条 texHtml + _ppRenderTex 优先读 texHtml → v2.2.1
- [x] **超管数据质量面板**: 15 规则扫描 + 批量 AI 编辑 + 词级 diff + Auto-Fix + JSON 导出 → v2.2.2
- [x] **HHK 知识卡片+经典例题**: 55 sections × 2 modules = 110 条双语富文本（知识回顾+关键技能+考试技巧+经典例题）→ v2.2.3
- [x] **HHK 练习题扩容 Y8-Y11**: 44 sections × 5 = 220 道 MCQ（h056-h275），HHK 覆盖率 20%→100% → v2.2.4
- [x] **CIE/Edexcel 真题数据质量批量修复**: 13 规则修复 2,901 处 LaTeX 问题（2,213 题），ERROR=0 → v2.2.5
- [x] **Admin UI 一致性优化 + CSS 工具类**: 45 个工具类 + 6 个 JS 文件 40+ 处内联样式清理 + 暗色模式补全 → v2.2.6
- [x] **真题数据深度修复 + DQ 扩展 + 离线构建**: 第二轮 2,295 处修复（dotfill 1722 + currfiledir 14 + centering 27 等）+ DQ 15→30 规则 + EDX 离线构建 → v2.2.7
- [x] **深度内联样式清理**: 20 文件 173 处静态 style= 消除 + 15 个新 CSS 工具类 + battle/srs 组件类化 → v2.2.8
- [x] **CIE/Edexcel 数据一致性修复**: EDX cat 标准化(4→6 分类) + difficulty 标签适配 + DQ underline 规则 → v2.2.9
- [x] **性能优化**: getLevelBySlug() O(1) 哈希索引 + homework.js 3 处线性搜索重构 → v2.2.10
- [x] **性能优化+防御性修复**: getLevelIdxBySlug() + syllabus/app 7处O(1) + practice/homework 错误处理 → v2.2.11
- [x] **暗色模式完备性修复**: PP 模块 4 处硬编码颜色 → CSS 语义变量 → v2.2.12
- [x] **性能优化+防御性修复**: storage.js upsert error 检查 + homework/syllabus O(1) 查找 → v2.2.13
- [x] **getSectionInfo O(1) 缓存 + 防御性修复**: syllabus.js 哈希缓存 + homework.js 3 处 error 检查 → v2.2.14
- [x] **超管加载优化**: admin bundle（3→1 请求）+ teachers 查询去重（2→1 次）+ Promise.all 并行 → v2.2.15
- [x] **renderHome 性能优化**: LEVELS 分类索引缓存 O(1) + scheduleRenderHome 微任务合并 → v2.2.16
- [x] **性能优化第二轮**: HHK slug→idx 索引缓存 + getWordData 共享 + mastery.js wd 未定义修复 → v2.2.17
- [x] **引导系统质量修复**: 可访问性（aria-label/role/keyboard）+ 触摸目标 36px + safe-area + 响应式断点 + ESC 关闭 + print 隐藏 → v2.2.17
- [x] **引导流程优化**: Nudge 30min 冷却 + 徽章庆祝排队 + 首词引导 + streak-at-risk + 阶段升级 + 发现重置 → v2.2.19
- [x] **渐进解锁系统**: 模式解锁链 + 知识点顺序解锁(80%门槛) + 徽章前置链 + 阶段功能门控(4阶段) + 老用户迁移 → v2.2.21
- [x] **渐进解锁质量优化**: XSS onclick消除 + isFeatureUnlocked缓存 + prevStats传递 + HHK解锁修复 + migrateForceUnlock幂等化 + 可访问性 → v2.2.23
- [x] **防御性修复**: showNudge/spell null check + export getWordData循环缓存 → v2.2.25
- [x] **事件委托修复**: practice.js 编辑按钮委托冲突 + quiz querySelector优化 + admin menu抽取 → v2.2.27
