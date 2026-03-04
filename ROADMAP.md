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
- [ ] **待手动配置**：Supabase Dashboard 添加 `https://keywords.25maths.com/` 到 Redirect URLs

## Phase 2.2 — 会员设置 + 昵称 + 密码 [DONE]
- [x] 设置 Modal（⚙ 按钮），侧栏 + 顶栏双入口
- [x] 修改昵称（Supabase user_metadata，无需建表）
- [x] 修改密码（校验≥6位 + 两次一致）
- [x] 昵称优先显示（侧栏/顶栏/排行榜统一逻辑）
- [x] 会员升级路线说明页（免费/Pro/Premium 三级展示）
- [x] Guest 模式设置入口拦截（Toast 提示）

## Phase 2.3 — 云端实时排行榜 [DONE]
- [x] 新建 `leaderboard` 表（Supabase 迁移，RLS 全员可读 / 本人可写）
- [x] `syncToCloud()` 每次学习同步时 upsert 排行榜分数
- [x] `renderBoard()` 重写：async 云端 Top 20 查询，替代 Mock 数据
- [x] 计分公式：掌握率 × 20，显示排名 + 掌握率百分比
- [x] Guest 模式降级为本地数据展示

## Phase 3 — 词汇扩容 (Next)
- [ ] Fix `extract-vocab.py` regex (Python 3.13 backslash escaping)
- [ ] Auto-generate levels.js from 8 .tex files (~317 words, ~40 levels)
  - Algebra / Number / Geometry / Coordinate / Mensuration / Statistics / Trigonometry / Vectors
- [ ] Verify level splitting logic (max 10 words per level)
- [ ] Review timer/combo balance across all levels
- [ ] Level category grouping (show topic headers in deck grid)

## Phase 2.4 — 段位进化路线 + 艾宾浩斯说明页 [DONE]
- [x] 段位进化路线 Modal（5 级段位卡片 + 当前高亮 + 进度条 + 升级提示）
- [x] 艾宾浩斯记忆法 Modal（原理简介 + 8 级 SRS 间隔表 + 评分机制说明）
- [x] 侧栏 / 顶栏段位 emoji 可点击打开段位路线
- [x] 首页统计区下方段位提示行（段位名 + 距下一级词数 + "查看路线"入口）
- [x] 复习仪表盘标题栏 ❓ 帮助按钮入口

## Phase 4 — 认证加固 + UX 打磨
- [ ] 密码重置功能（忘记密码 → 发送重置邮件）
- [ ] 同步冲突改用时间戳比较（替代当前 key 数量比较）
- [ ] 同步失败 Toast 提示（替代静默吞错）
- [ ] 深色模式 (dark mode toggle)
- [ ] 音效系统（配对成功、连击、倒计时警告）
- [x] 新手引导（段位路线 + 艾宾浩斯说明 → Phase 2.4 完成）
- [ ] 搜索/过滤（首页、复习仪表盘）
- [ ] 拼写模式增加语音朗读（Web Speech API）
- [ ] 测验模式增加"英文→中文"与"中文→英文"双向模式

## Phase 5 — 响应式修补 + 移动体验
- [ ] iPhone 刘海适配（safe-area-inset-top）
- [ ] 触控热区最小 44px（移动端按钮/链接）
- [ ] 实战模式网格列数响应式（小屏 3 列 → 大屏 5 列）
- [ ] 闪卡宽度自适应（max-width 百分比）
- [ ] 排版字号断点缩放
- [ ] Toast 位置适配底部导航
- [ ] 连击弹窗手机端尺寸调整

## Phase 6 — 社交 + 云端
- [x] 云端排行榜（替换 Mock 数据，基于 Supabase）→ Phase 2.3 完成
- [ ] 学习连续天数（streak system）
- [ ] 每日挑战模式（随机 10 词限时赛）
- [ ] 分享结果卡片（截图友好的成绩单）
- [ ] 与 25maths-website 会员系统深度对接
- [ ] 学习数据可视化（趋势图、日历热力图）

## Phase 7 — 内容扩展
- [ ] Edexcel 4MA1 vocabulary sets
- [ ] IB Mathematics vocabulary sets
- [ ] 用户创建 + 分享自定义词库（community decks）
- [ ] Import/Export 增加 Anki 格式支持
- [ ] 多语言扩展（pinyin 显示选项、繁体中文）

## Phase 8 — PWA + 离线
- [ ] Service Worker 离线缓存
- [ ] PWA manifest + install prompt
- [ ] 离线状态自动检测 + 重连同步
- [ ] build-single.py 更新适配新架构
