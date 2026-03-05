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
- [ ] 首次使用引导动画（步骤 tooltip）

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
- [ ] 作业模板（保存常用词组组合为模板）
- [ ] 作业统计导出（Excel/CSV）

## Phase 9 — 内容扩展
- [x] Edexcel 4MA1 vocabulary sets → Phase 4 完成
- [x] 25Maths Curriculum Y7-Y11 vocabulary sets → Phase 4.1 完成
- [ ] IB Mathematics vocabulary sets
- [ ] AQA GCSE Mathematics vocabulary sets
- [ ] 用户创建 + 分享自定义词库（community decks）
- [ ] Import/Export 增加 Anki 格式支持
- [ ] 多语言扩展（pinyin 显示选项、繁体中文）

## Phase 10 — 平台扩展：从词汇工具到学习支撑平台

> 详见 `docs/analysis/2026-03-05-architecture-review-v2.md`

### Phase 10A — 数据层优化（前置）[DONE]
- [x] levels.js 按 board 拆分为 3 个 JSON（异步按需加载）→ v1.3.1
- [x] 角色按需加载（学生不加载 admin/vocab-admin）→ v1.3.1
- [ ] 简单 minify 脚本（esbuild 一行命令）
- [ ] 首屏从 ~114KB gzip → ~75KB gzip

### Phase 10B — 选择题练习（Layer 3 快速突破）
- [ ] 导入 25maths-website 纯文本选择题（~800 题无 LaTeX 依赖）
- [ ] 复用 Quiz 模式 UI（支持 4 选项数学题）
- [ ] 按 topic + difficulty 筛选
- [ ] 练习进度独立存储（practice_progress 表）
- [ ] 结果页显示 explanation 解析

### Phase 10C — 概念卡 + KaTeX（Layer 2）
- [ ] getPairs() 扩展支持 formula/example 字段
- [ ] KaTeX 按需加载（<50KB gzip，仅概念页触发）
- [ ] 独立 panel-concept（概念卡翻转学习）
- [ ] 剩余 ~400 含 LaTeX 练习题接入

### Phase 10D — 智能学习路径（跨层整合）
- [ ] 词汇→概念→练习 三层关联（subtopicId 映射）
- [ ] 薄弱点检测（wordData.fail 聚合到 topic 维度）
- [ ] 练习推荐引擎（错误率高的 topic 优先推练习题）
- [ ] 教师端：布置练习题作业

### Phase 10E — 评估层（Layer 4，可选）
- [ ] 诊断测试（快速 20 题定位薄弱点）
- [ ] 按考试局模拟卷格式组题
- [ ] 服务端评分（Edge Function）

## Phase 11 — PWA + 离线
- [ ] Service Worker 离线缓存
- [ ] PWA manifest + install prompt
- [ ] 离线状态自动检测 + 重连同步
- [ ] build-single.py 更新适配新架构
