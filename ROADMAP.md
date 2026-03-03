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

## Phase 3 — 词汇扩容 (Next)
- [ ] Fix `extract-vocab.py` regex (Python 3.13 backslash escaping)
- [ ] Auto-generate levels.js from 8 .tex files (~317 words, ~40 levels)
  - Algebra / Number / Geometry / Coordinate / Mensuration / Statistics / Trigonometry / Vectors
- [ ] Verify level splitting logic (max 10 words per level)
- [ ] Review timer/combo balance across all levels
- [ ] Level category grouping (show topic headers in deck grid)

## Phase 4 — UX 打磨
- [ ] 深色模式 (dark mode toggle)
- [ ] 音效系统（配对成功、连击、倒计时警告）
- [ ] 新手引导（首次使用 onboarding tutorial）
- [ ] Supabase auth loading state 优化
- [ ] 搜索/过滤（首页、复习仪表盘）
- [ ] 拼写模式增加语音朗读（Web Speech API）
- [ ] 测验模式增加"英文→中文"与"中文→英文"双向模式

## Phase 5 — 社交 + 云端
- [ ] 云端排行榜（替换 Mock 数据，基于 Supabase）
- [ ] 每日挑战模式（随机 10 词限时赛）
- [ ] 分享结果卡片（截图友好的成绩单）
- [ ] 与 25maths-website 会员系统对接
- [ ] 学习数据可视化（趋势图、日历热力图）

## Phase 6 — 内容扩展
- [ ] Edexcel 4MA1 vocabulary sets
- [ ] IB Mathematics vocabulary sets
- [ ] 用户创建 + 分享自定义词库（community decks）
- [ ] Import/Export 增加 Anki 格式支持
- [ ] 多语言扩展（pinyin 显示选项、繁体中文）

## Phase 7 — PWA + 离线
- [ ] Service Worker 离线缓存
- [ ] PWA manifest + install prompt
- [ ] 离线状态自动检测 + 重连同步
- [ ] build-single.py 更新适配新架构
