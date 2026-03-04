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
- [ ] 每日挑战模式（随机 10 词限时赛）
- [ ] 分享结果卡片（截图友好的成绩单）
- [ ] 与 25maths-website 会员系统深度对接
- [ ] 学习数据可视化（趋势图、日历热力图）

## Phase 4.1 — 25Maths 校本课程 Y7-Y11 词汇 [DONE]
- [x] 25Maths Curriculum board（🏫 Y7-11，5 个年级分类）
- [x] 55 个教学单元拆分为 173 个闪卡级别（≤10 词/级）
- [x] 1,502 个英中双语术语，覆盖 Year 7-11
- [x] 自动生成脚本 `scripts/gen-25m-levels.py`
- [x] 总规模：3 个考试局/课程，264 级，2,200 词

---

## Phase 9 — 内容扩展
- [x] Edexcel 4MA1 vocabulary sets → Phase 4 完成
- [x] 25Maths Curriculum Y7-Y11 vocabulary sets → Phase 4.1 完成
- [ ] IB Mathematics vocabulary sets
- [ ] AQA GCSE Mathematics vocabulary sets
- [ ] 用户创建 + 分享自定义词库（community decks）
- [ ] Import/Export 增加 Anki 格式支持
- [ ] 多语言扩展（pinyin 显示选项、繁体中文）

## Phase 10 — PWA + 离线
- [ ] Service Worker 离线缓存
- [ ] PWA manifest + install prompt
- [ ] 离线状态自动检测 + 重连同步
- [ ] build-single.py 更新适配新架构
