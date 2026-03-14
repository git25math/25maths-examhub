# Changelog

## [5.28.0] - 2026-03-15 — 间距系统补全 6px/10px 半步 token

### CSS 间距 token 补全

#### 新增 --sp-1h (6px) / --sp-2h (10px) 半步 token
- 填补 sp-1(4px) 与 sp-2(8px)、sp-2(8px) 与 sp-3(12px) 之间的间隙
- 间距系统现为 10 级：4/6/8/10/12/16/20/24/32/40px

#### 批量替换（~198 处）
- `gap: 6px` → `var(--sp-1h)` — 31 处
- `gap: 10px` → `var(--sp-2h)` — 39 处
- `margin-bottom: 6px` → `var(--sp-1h)` — 19 处
- `margin-bottom: 10px` → `var(--sp-2h)` — 12 处
- `margin-top: 6px` → `var(--sp-1h)` — 18 处
- `margin-top: 10px` → `var(--sp-2h)` — 若干处

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | +2 token (--sp-1h/--sp-2h) + ~198 处 6px/10px → token |
| js/config.js | APP_VERSION → v5.28.0 |

## [5.27.1] - 2026-03-14 — fix: pqRender 跨 bundle 依赖修复

### Bug 修复
- **pqRender 未定义**: `pqRender` 定义在 `practice.js`（懒加载），但 `syllabus-views.js` / `homework.js` 直接调用无 `typeof` 守卫 → ReferenceError
- **修复**: `pqRender` + `pqSanitize` 迁入 `ui.js`（主 bundle），确保所有懒加载模块可用

### 文件变更
| 文件 | 修改 |
|------|------|
| js/ui.js | 新增 pqRender/pqSanitize（从 practice.js 迁入） |
| js/practice.js | 移除重复定义 |
| js/config.js | APP_VERSION → v5.27.1 |

## [5.27.0] - 2026-03-14 — 懒加载深度优化 + 首次登录渲染修复

### 懒加载拆分
- **review.js 移除**: 10 个空函数桩（FLM v2.6.0 废弃），调用方改为跳转 Study 模式
- **particles.js → particles.min.js**: 粒子系统懒加载（1.1KB gzip），ui.js 添加 3 个代理函数
- **board-guides.js → board-guides.min.js**: Board 面板 + Score/Rank Guide 懒加载（3.6KB gzip）
- **deck-detail.js → deck-detail.min.js**: Deck 详情视图懒加载（3.8KB gzip）

### 首次登录渲染修复
- **await loadVisibleBoardData()**: 修复首次登录时 syllabus 数据未就绪导致走 fallback 旧视图的问题
- 现在首次登录即显示有编号的考纲 section 视图，与后续导航一致

### 构建结果
| 指标 | Before | After | 变化 |
|------|--------|-------|------|
| 主 bundle (raw) | 157KB | 135KB | −22KB (−14%) |
| 主 bundle (gzip) | 46KB | 40KB | −6KB (−13%) |
| 懒加载 bundle 数 | 15 | 18 | +3 |
| cat 链文件数 | 10 | 8 | −2 |

### 文件变更
| 文件 | 修改 |
|------|------|
| js/board-guides.js | **新增**: Board 面板 + Score/Rank Guide (~250行) |
| js/deck-detail.js | **新增**: Deck Detail 视图 (~300行) |
| js/particles.js | 3 个函数加 `_` 前缀 |
| js/ui.js | +3 粒子代理, navTo/toggleLang board 分支改 _lazyNav, startReview→startStudy |
| js/mastery.js | 删除 deck detail (~330行), 添加代理, showRankGuide→_lazyCall |
| js/app.js | 删除 board+guide 代码 (~198行), 保留状态变量 |
| js/auth.js | 删除 showRankGuide, await loadVisibleBoardData |
| js/syllabus.js | loadVisibleBoardData 返回 Promise |
| js/spell.js | startReview → _lazyCall startStudy |
| js/quiz.js | startReview → _lazyCall startStudy |
| scripts/minify.sh | cat 链 −2, +3 lazy bundle |
| js/config.js | APP_VERSION → v5.27.0 |

## [5.26.1] - 2026-03-14 — 首屏加载性能优化

### 性能优化

#### Google Fonts 非阻塞加载
- `<link rel="stylesheet">` 改为 `media="print" onload="this.media='all'"` 模式
- 字体不再阻塞首屏渲染（FCP 提前），`display=swap` 确保文字立即可见
- 添加 `<noscript>` 降级确保无 JS 环境仍能加载字体

#### 关键资源预加载
- 新增 `<link rel="preload">` 提前获取 `style.min.css` 和 `app.bundle.min.js`
- 浏览器在解析 HTML 时即开始下载，而非等到遇到 `<link>` / `<script>` 标签

### 文件变更
| 文件 | 修改 |
|------|------|
| index.html | Google Fonts 非阻塞 + CSS/JS preload hints |
| js/config.js | APP_VERSION → v5.26.1 |

## [5.26.0] - 2026-03-14 — 圆角补全 + margin-top 令牌化

### CSS 令牌化

#### border-radius 补全（~54 处）
- `border-radius: 10px` → `var(--r-sm)` — 21 处
- `border-radius: 14px` → `var(--r)` — 21 处
- `border-radius: 20px` → `var(--r-lg)` — 12 处
- 至此所有标准圆角值均由 6 级 token 管控（--r-xs/--r-sm/--r/--r-lg/--r-pill/--r-full）

#### margin-top → --sp-* 令牌（~84 处）
- `margin-top: 4px` → `var(--sp-1)` — 27 处
- `margin-top: 8px` → `var(--sp-2)` — 30 处
- `margin-top: 12px` → `var(--sp-3)` — 11 处
- `margin-top: 16px` → `var(--sp-4)` — 12 处
- `margin-top: 20px` → `var(--sp-5)` — 4 处

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | ~138 处 border-radius + margin-top → token |
| js/config.js | APP_VERSION → v5.26.0 |
| CLAUDE.md | 版本号更新 |

## [5.25.0] - 2026-03-14 — 间距系统全面令牌化

### CSS 间距令牌化

#### gap 值 → --sp-* 令牌（~166 处）
- `gap: 4px` → `var(--sp-1)` — 31 处
- `gap: 8px` → `var(--sp-2)` — 99 处
- `gap: 12px` → `var(--sp-3)` — 30 处
- `gap: 16px` → `var(--sp-4)` — 5 处
- `gap: 20px/24px` → `var(--sp-5/6)` — 1 处各

#### margin-bottom → --sp-* 令牌（~130 处）
- `margin-bottom: 4px` → `var(--sp-1)` — 24 处
- `margin-bottom: 8px` → `var(--sp-2)` — 34 处
- `margin-bottom: 12px` → `var(--sp-3)` — 27 处
- `margin-bottom: 16px` → `var(--sp-4)` — 29 处
- `margin-bottom: 20px` → `var(--sp-5)` — 16 处

#### --t-medium 过渡补漏
- `pp-topic-progress-fill` 遗留 `0.3s` → `var(--t-medium)`

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | ~296 处 gap + margin-bottom → --sp-* token |
| js/config.js | APP_VERSION → v5.25.0 |
| CLAUDE.md | 版本号更新 |

## [5.24.0] - 2026-03-14 — 过渡令牌化 + 状态卡片组件 + 进度条共享基类

### CSS 令牌深化

#### --t-medium 过渡令牌 (0.3s)
- 新增 `--t-medium: 0.3s` 填补 --t-base (0.2s) 与 --t-slow (0.35s) 之间的间隙
- 19 处 hardcoded `0.3s` 全部替换为 `var(--t-medium)`（含进度条、面板切换、动画）
- 至此全部过渡/动画时间均由 4 级 token 管控

#### 共享进度条基类
- 新增 `.progress-track` / `.progress-bar-fill` 共享基类（6px/3px 默认 + lg/sm 变体）
- 现有 9 套进度条 CSS 保留向后兼容，新代码可直接使用共享类

### 状态卡片组件化

#### stat-grid + stat-card 系统
- 新增 `.stat-grid` / `.stat-card` / `.stat-card-num` / `.stat-card-label` CSS 组件
- study.js 16 处 inline style → CSS class（4 组 × 3 色 grid + label）
- practice.js 8 处 inline style → CSS class（2 组 × 3 色 grid + label）
- 共计消除 ~2KB inline style 重复代码

### 死代码清理
- 移除 `.admin-empty` + `.admin-loading` CSS 规则（全部迁移至 .empty-state / .spinner）

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | +1 token (--t-medium) + stat-card 组件 + progress-track 基类 + 19 处 0.3s 替换 + 死 CSS 删除 |
| js/study.js | 16 处 inline style → stat-card/stat-grid class |
| js/practice.js | 8 处 inline style → stat-card/stat-grid class |
| js/config.js | APP_VERSION → v5.24.0 |
| CLAUDE.md | 版本号更新 |

## [5.23.0] - 2026-03-14 — 加载态统一 + 阴影/间距令牌化

### 加载状态统一

#### _renderLoading 组件化
- ui.js 新增 `_renderLoading(text)` — 统一加载态渲染（spinner + 文字）
- `_showPanelLoading` 改用 `.empty-state` 类替代内联样式
- admin.js 7 处 `admin-loading` → `_renderLoading()`
- homework.js 4 处 `admin-loading` → `_renderLoading()`
- data-admin.js 1 处 + vocab-admin.js 1 处 → `_renderLoading()`
- data-admin.js 1 处 `admin-empty` → `_renderEmptyState()`

### CSS 令牌深化

#### 阴影令牌化（7 处）
- `.btn-primary` 阴影 → `var(--shadow-hover)`
- `.pp-rate-btn:hover` / `.sec-module:hover` / `.smart-path-card` → `var(--shadow-sm)` / `var(--shadow)`
- `.pp-browse-entry:hover` / `.pp-paper-card:hover` → `var(--shadow-sm)`

#### 卡片间距令牌化（5 处）
- `.hero-card` / `.plan-card` / `.modal-card.pq-editor-modal` → `var(--card-p-md)`
- `.scan-kp-card` / `.kp-section` → `var(--card-p-lg)`

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | 7 处 shadow + 5 处 card padding → token |
| js/ui.js | 新增 _renderLoading + _showPanelLoading 改用 empty-state |
| js/admin.js | 7 处 admin-loading → _renderLoading |
| js/homework.js | 4 处 admin-loading → _renderLoading |
| js/data-admin.js | 1 处 loading + 1 处 empty → helper |
| js/vocab-admin.js | 1 处 loading → _renderLoading |
| js/config.js | APP_VERSION → v5.23.0 |
| CLAUDE.md | 版本号更新 |

## [5.22.0] - 2026-03-14 — 设计令牌批量迁移 + 空状态统一

### CSS 令牌批量替换

#### border-radius 令牌化
- `border-radius: 50%` → `var(--r-full)` — 26 处圆形元素（头像、圆点、圆环等）
- `border-radius: 999px` → `var(--r-pill)` — 7 处药丸形（进度条、标签、芯片）
- `border-radius: 6px` → `var(--r-xs)` — 17 处小圆角（按钮、输入框、标签）

#### 过渡时间令牌化
- `0.15s` → `var(--t-fast)` — 48 处快速过渡（hover、active 状态）
- `0.2s` → `var(--t-base)` — 32 处标准过渡（面板切换、展开）
- `0.35s` → `var(--t-slow)` — 3 处慢速过渡/动画（popIn、slotIn、折叠）
- 保留 `0.25s`（无精确 token）和 `0.3s`（与 --t-slow 差异明显）

### JavaScript 空状态统一

#### admin.js（8 处）
- 所有 `<div class="admin-empty">` 迁移至 `_renderEmptyState()` helper
- 保留 `admin-loading` 样式（加载状态独立于空状态）

#### homework.js（11 处）
- 错误/未找到/空列表全部迁移至 `_renderEmptyState()`
- 修复 2 处缺失的 `escapeHtml()` 包裹（e.message 直接拼接 → escapeHtml）

#### syllabus-views.js（3 处）
- `mistake-empty` 🎉 类型迁移至 `_renderEmptyState('🎉', text)`

#### vocab-admin.js（2 处）
- 反馈列表空状态 + 错误状态迁移

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | 130+ 处 hardcoded 值替换为 token（border-radius × 50, transition × 83） |
| js/admin.js | 8 处 admin-empty → _renderEmptyState |
| js/homework.js | 11 处 admin-empty → _renderEmptyState + 2 处 XSS 修复 |
| js/syllabus-views.js | 3 处 mistake-empty → _renderEmptyState |
| js/vocab-admin.js | 2 处 admin-empty → _renderEmptyState |
| js/config.js | APP_VERSION → v5.22.0 |
| CLAUDE.md | 版本号更新 |

## [5.21.0] - 2026-03-14 — UI 一致性审查 & 设计令牌体系

### CSS 设计系统

#### 设计令牌扩展
- **圆角**: 新增 `--r-xs` (6px) / `--r-pill` (999px) / `--r-full` (50%)
- **间距**: 新增 8 级间距比例 `--sp-1` (4px) 至 `--sp-10` (40px)
- **阴影**: 新增 `--shadow-sm` / `--shadow-hover`，明暗主题各有优化值
- **过渡**: 新增 `--t-fast` (0.15s) / `--t-base` (0.2s) / `--t-slow` (0.35s)
- **遮罩**: 新增 `--overlay-blur` (8px) / `--overlay-bg`，统一 `.ov` 和 `.modal-overlay`
- **卡片**: 新增 `--card-p-sm` (12px) / `--card-p-md` (16px) / `--card-p-lg` (24px)
- 暗色主题同步新增 `--shadow-sm` / `--shadow-hover` / `--overlay-bg` 覆盖值

#### Header 模式统一
- 新增 `.panel-header` 共享基类，`.deck-header` 和 `.study-topbar` 作为别名
- 统一 flex 布局 + gap + min-height，消除两套重复声明

#### 折叠系统统一
- `.board-body` / `.category-body` / `.unit-body` 共享 overflow/opacity/transition 规则
- 过渡时间统一使用 `var(--t-slow)` 令牌

#### 遮罩统一
- `.ov` 和 `.modal-overlay` 统一使用 `var(--overlay-bg)` 和 `var(--overlay-blur)`
- 移除暗色主题冗余的单独覆盖（由 token 覆盖自动处理）

#### 新增组件
- `.spinner` + `@keyframes spin` — 统一加载旋转器
- `.empty-state` / `.empty-state-icon` / `.empty-state-text` — 统一空状态组件
- `[role="button"]:focus-visible` — 通用键盘焦点环

#### 按钮清理
- `.hero-btn` 移除 3 个 `!important`，改用正常级联
- hover 阴影改用 `var(--shadow-hover)` 令牌

### JavaScript 改进

#### 全局键盘无障碍
- ui.js 新增全局 `role="button"` + `tabindex` keydown 委托（Enter/Space → click）
- 覆盖所有现有和未来的可交互元素，标准 ARIA 模式
- mastery.js 移除冗余的 per-class 键盘处理代码

#### 空状态 helper
- ui.js 新增 `_renderEmptyState(icon, text)` 统一空状态渲染函数

#### 导航历史栈
- ui.js 新增 `_navStack[]` / `navPush(id)` / `navBack()` 导航历史基础设施
- `navTo()` 自动压栈，`openDeck()` / `openSection()` 手动压栈
- mastery.js deck 返回按钮改用 `navBack()` 支持多级回退
- 栈深限制 20 层，自动淘汰旧条目

### 文件变更
| 文件 | 修改 |
|------|------|
| css/style.css | 新增 14 个 token + panel-header + 折叠共享规则 + spinner + empty-state + focus-visible + overlay 统一 + hero-btn 清理 |
| js/ui.js | 新增导航栈 (navPush/navBack) + 全局键盘 a11y + _renderEmptyState |
| js/mastery.js | deck back 改用 navBack + openDeck 压栈 + 移除冗余键盘代码 |
| js/syllabus.js | openSection 压栈 |
| js/config.js | APP_VERSION → v5.21.0 |
| CLAUDE.md | 版本号更新 |

## [5.20.0] - 2026-03-14 — UI/Auth 模块精细拆分 + 粒子性能

### 性能优化

#### Tour / Bug Report / Settings 懒加载拆分
- Tour 引导系统 (104行) 从 ui.js 提取为 `tour.min.js` (1.6KB gzip)，仅新用户首次登录时加载
- Bug Report 表单 (82行) 从 ui.js 提取为 `bug-report.min.js` (1.5KB gzip)，点击反馈按钮时加载
- Settings 面板 (182行) 从 auth.js 提取为 `settings.min.js` (2.3KB gzip)，点击设置按钮时加载
- Speech 函数 (canSpeak/speakWord) 从 ui.js 移至 spell.js (modes.min.js bundle)

#### 粒子系统 RAF 空转优化
- drawP() 改为 idle-aware：无粒子时自动暂停 RAF 循环
- spawnP() 按需重启 RAF，移除启动时的无条件 drawP() 调用
- 减少登录页空闲时 CPU 空转

#### index.html onclick 更新
- showSettings / showBugReport 改为 `_lazyCall()` 触发（sidebar + header 共 3 处）
- app.js 密码恢复回调改为 `_lazyCall('settings', ...)`

### 累计优化（v5.14.0 → v5.20.0）
- 主 bundle: **672KB → 157KB (−77%)**, gzip: **184KB → 46KB (−75%)**
- 懒加载 bundle 数: 4 → 15

### 文件变更
| 文件 | 修改 |
|------|------|
| js/tour.js | **新增**: Tour 引导系统 (~104行) |
| js/bug-report.js | **新增**: Bug Report 表单 (~82行) |
| js/settings.js | **新增**: Settings 面板 + manualSync (~182行) |
| js/ui.js | 移除 tour + bug report + speech (~196行), maybeStartTour 改为 _lazyLoad |
| js/auth.js | 移除 settings / manualSync / _isStudentLocked / changeBoardFromSettings (~182行) |
| js/spell.js | 添加 canSpeak/speakWord (~10行) |
| js/particles.js | RAF 改为 idle-aware (drawP 自动暂停/spawnP 按需启动) |
| index.html | showBugReport/showSettings onclick → _lazyCall |
| js/app.js | showSettings → _lazyCall('settings', ...) |
| scripts/minify.sh | +3 bundle (tour/bug-report/settings) + 报告行 |
| js/config.js | APP_VERSION → v5.20.0 |

## [5.19.0] - 2026-03-14 — Syllabus 视图拆分

### 性能优化

#### syllabus.js 拆分为 core + views
- syllabus.js (174KB) 拆为 syllabus.js core (34KB) + syllabus-views.js (92KB)
- 视图函数（renderSectionDetail, renderTodaysPlan, renderMistakeBook, renderKPDetail 等 64 个）移至懒加载
- 核心函数（数据加载、Home 渲染、getSectionHealth 等）保留在主 bundle
- openSection / openKnowledgePoint 添加 _lazyLoad('syllabus-views') wrapper
- IIFE 事件委托（PP start、KP edit、键盘 a11y）随视图文件一起懒加载
- 主 bundle: **262KB → 170KB (−92KB, −35%)**, gzip: **72KB → 50KB (−30%)**

### 累计优化（v5.14.0 → v5.19.0）
- 主 bundle: **672KB → 170KB (−75%)**, gzip: **184KB → 50KB (−73%)**
- 懒加载 bundle 数: 4 → 12

### 文件变更
| 文件 | 修改 |
|------|------|
| js/syllabus.js | 拆出视图函数，保留核心 (~920 行)；openSection/openKnowledgePoint 加 lazy wrapper |
| js/syllabus-views.js | 新增：视图函数 + IIFE 事件委托 (~2,877 行) |
| scripts/minify.sh | 新增 syllabus-views.min.js bundle |
| js/config.js | APP_VERSION → v5.19.0 |

## [5.18.0] - 2026-03-14 — 首屏加载优化

### 性能优化

#### 按需加载 Syllabus 数据
- syllabus.js 不再在 parse 时自动 fetch 全部 3 个 board 的数据
- 新增 `loadVisibleBoardData()`：根据 userBoard 只加载可见 board 的 syllabus + vocabulary + knowledge JSON
- CIE 用户不加载 HHK 数据，25m 用户不加载 CIE 数据
- 首屏数据 fetch 从 ~416KB 降至 ~125KB（单 board）

#### Script defer 非阻塞加载
- Supabase SDK + app.bundle.min.js 改为 `defer`：HTML 解析不再被阻塞
- 两个 defer script 保持 DOM 顺序执行，确保 Supabase SDK 先于 app 初始化

#### SW 分层预缓存
- SHELL_FILES 从 14 个精简为 4 个（index.html + CSS + app bundle + manifest + icons）
- 懒加载 bundle 改为 runtime cache-first（首次 fetch 时自动缓存）
- SW install 预缓存数据量从 ~1MB 降至 ~280KB

### 文件变更
| 文件 | 修改 |
|------|------|
| js/syllabus.js | 移除 EOF 自动 fetch，新增 loadVisibleBoardData() |
| js/auth.js | afterLogin() + selectBoard() 中调用 loadVisibleBoardData() |
| index.html | script 标签加 defer |
| sw.js | SHELL_FILES 精简为 critical path only |
| js/config.js | APP_VERSION → v5.18.0 |

## [5.17.0] - 2026-03-14 — JS 懒加载优化 Phase 5

### 性能优化

#### Recovery 集群拆出
- 9 个 Recovery 相关文件拆为独立 `recovery.min.js` bundle (75KB / 22KB gzip)
- 包含: recovery-priority, recovery-scheduler, student-profile, learning-goals, ai-tutor, error-patterns, mistake-coach, recovery-session, smart-notif
- 主 bundle: 336KB → 262KB (−74KB raw), gzip: 93KB → 72KB (−21KB)
- 登录后 2s 延迟自动加载 recovery bundle，加载后触发 initSmartNotifications
- 所有跨 bundle 调用已有 typeof guard，无需新增

### 累计优化（v5.14.0 → v5.17.0）
- 主 bundle: **672KB → 262KB (−61%)**, gzip: **184KB → 72KB (−61%)**
- 懒加载 bundle 数: 4 → 11

### 文件变更
| 文件 | 修改 |
|------|------|
| js/ui.js | afterLogin() 改为 _lazyLoad('recovery') 触发 initSmartNotifications |
| scripts/minify.sh | 主 bundle 移除 9 个 recovery 文件，新增 recovery.min.js bundle |
| sw.js | SHELL_FILES +1 (recovery.min.js) |
| js/config.js | APP_VERSION → v5.17.0 |

## [5.16.0] - 2026-03-14 — JS 懒加载优化 Phase 3+4

### 性能优化

#### 主 Bundle 三次瘦身
- 拆出 study.js + quiz.js + battle.js → `study-quiz-battle.min.js` (56KB / 14KB gzip)
- 将 knowledge-node.js + learning-graph.js 并入 practice.min.js bundle
- 主 bundle: 417KB → 336KB (−81KB raw), gzip: 113KB → 93KB (−20KB)
- 新增 `_lazyCall()` 通用延迟调用辅助函数
- mastery.js `_initDeckActionDelegation` / `_initRefluxDelegation` 全部改为 `_lazyCall` 包裹
- ui.js 推荐按钮 onclick、syllabus.js journey delegation 同步改为 `_lazyCall`
- match.js / spell.js 跨 bundle 调用改为 `_lazyCall`
- SW SHELL_FILES 预缓存新 bundle

### 累计优化（v5.14.0 → v5.16.0）
- 主 bundle: **672KB → 336KB (−50%)**, gzip: **184KB → 93KB (−49%)**
- 懒加载 bundle 数: 4 → 10

### 文件变更
| 文件 | 修改 |
|------|------|
| js/ui.js | +_lazyCall() 辅助函数，推荐按钮 onclick 改为 _lazyCall |
| js/mastery.js | modeFns/refluxFns 改为 _lazyCall，studySelected/quizSelected 同步 |
| js/syllabus.js | journey delegation startQuiz 改为 _lazyCall |
| js/match.js | startQuiz/startStudy 调用改为 _lazyCall |
| js/spell.js | startStudy 调用改为 _lazyCall |
| scripts/minify.sh | 主 bundle 移除 5 文件，+study-quiz-battle bundle，practice bundle +2 文件 |
| sw.js | SHELL_FILES +1 (study-quiz-battle.min.js) |
| js/config.js | APP_VERSION → v5.16.0 |

## [5.15.0] - 2026-03-14 — JS 懒加载优化 Phase 2

### 性能优化

#### 主 Bundle 二次瘦身
- 从 app.bundle.min.js 拆出 practice.js (270KB) + lists.js (126KB) 为独立懒加载 bundle
- 主 bundle: 672KB → 417KB (−255KB raw), gzip: 184KB → 113KB (−71KB)
- practice.min.js: 175KB (49KB gzip) — 点击练习按钮时按需加载
- lists.min.js: 80KB (22KB gzip) — 点击 Learning Items 时按需加载
- mastery.js 中 startPractice/startPracticeReview onclick 加 typeof guard + _lazyLoad fallback
- navTo('lists') 改用 _lazyNav 统一懒加载入口
- SW SHELL_FILES 预缓存 2 个新 bundle

### 文件变更
| 文件 | 修改 |
|------|------|
| js/ui.js | navTo('lists') 改为 _lazyNav('lists', ...) |
| js/mastery.js | startPractice/startPracticeReview onclick 加 lazy guard |
| scripts/minify.sh | 主 bundle 移除 practice.js/lists.js，新增 2 个独立 bundle |
| sw.js | SHELL_FILES +2 (practice.min.js, lists.min.js) |
| js/config.js | APP_VERSION → v5.15.0 |

## [5.14.1] - 2026-03-14 — CIE 0580 数据完整性修复

### 数据修复

#### Section 标签全覆盖 (326→0 未标记)
- 新增 `classify_number()` 规则分类器（18 个 section：1.1→1.18）
- 新增 `classify_algebra()` 规则分类器（13 个 section：2.1→2.13）
- 全量重标 Number 1,886 题 + Algebra 803 题
- 4,107 道真题全部获得 section 标签（覆盖率 92%→100%）

#### SECTION_TOPICS 映射修正
- 修正 build-papers-data.py 中 72 个 section→topic 名称映射
- 对齐官方 CIE 0580 2025-2027 考纲编号（C1.x/E1.x/C2.x/E2.x）

#### syllabus-cie.json 考纲对齐
- 重新排列 Chapter 1（Number）和 Chapter 2（Algebra）section 编号
- 修正 16 处 section ID→topic 名称错位
- 所有 72 个 section 现与官方考纲编号完全一致

#### Answer 元数据富化
- 运行 enrich-answers-cie.py，1,926 道题获得 answer 元数据
- 1,831 个 parts 获得 prefix/suffix/type 信息

### 文件变更
| 文件 | 修改 |
|------|------|
| CIE/analysis/scripts/tag_subtopics_auto.py | +classify_number +classify_algebra, CLASSIFIERS 扩展为 9 个 |
| scripts/build-papers-data.py | SECTION_TOPICS 修正 72 项，ALGEBRA_TAGGED 路径更新 |
| data/syllabus-cie.json | Ch1+Ch2 section 重排对齐考纲 |
| data/papers-cie.json | 重建：4,107 题全标记 + answer 富化 |
| data/papers-cie/*.json | 重新拆分 228 份试卷 |

## [5.14.0] - 2026-03-14 — JS 懒加载优化

### 性能优化

#### 主 Bundle 瘦身
- 从 app.bundle.min.js 拆出 6 个文件为 4 个懒加载 bundle
- 主 bundle: 740KB → 672KB (−68KB minified, −18KB gzip)

#### 新增懒加载 Bundle
| Bundle | 包含 | 大小 | 触发时机 |
|--------|------|------|---------|
| tools.min.js | stats.js + export.js | 18KB (6KB gz) | 点击 Stats / Import 面板 |
| modes.min.js | spell.js + match.js | 8.4KB (3KB gz) | 点击 Spell / Match 模式 |
| translate.min.js | translate.js | 12KB (4KB gz) | 启用划词翻译 |
| worksheet.min.js | worksheet.js | 31KB (8KB gz) | 打印修复卷 |

#### 懒加载基础设施 (ui.js)
- `_lazyLoad(bundle, callback)` — 动态 script 注入，状态追踪 + 回调队列 + 错误处理
- `_showPanelLoading(panelId)` — 面板加载 spinner
- `_lazyNav(bundle, fnName, panelId)` — 面板导航懒加载封装

#### 延迟绑定修改
- mastery.js: modeFns/fns 中 spell/match 改为延迟绑定函数
- battle.js: startSpell 交叉引用加 typeof guard + lazy fallback
- practice.js: printRepairWorksheet 加 lazy fallback
- auth.js: _sttEnabled 改为 localStorage 直读 + toggleTranslate 包裹 _lazyLoad

#### SW 预缓存
- 4 个新 bundle 加入 SHELL_FILES（install 时预缓存）
- admin.bundle.min.js 加入 DATA_PATTERNS

### 文件变更
| 文件 | 修改 |
|------|------|
| js/ui.js | +_lazyLoad/+_showPanelLoading/+_lazyNav, navTo() 分发改 lazy |
| js/mastery.js | modeFns/fns spell/match 延迟绑定 |
| js/battle.js | startSpell guard + lazy fallback |
| js/practice.js | printRepairWorksheet lazy fallback |
| js/auth.js | translate 解耦 |
| scripts/minify.sh | 拆分 4 个 bundle 构建 |
| sw.js | SHELL_FILES + DATA_PATTERNS 扩展 |
| js/config.js | APP_VERSION → v5.14.0 |

## [5.13.2] - 2026-03-14 — 架构完备性修复（7 项）

### 安全与数据完整性

#### Fix 1: practice.js — Supabase upsert 缺 .catch()
- 题目编辑 upsert 链追加 `.catch()`，网络失败时显示 toast 而非静默吞错

#### Fix 2: storage.js — 缓存失效补全
- `invalidateCache()` 补充 7 个用户状态缓存清理（dailyPlan/profile/goals/sectionHealth/listRaw）
- 非用户状态缓存（admin/notif/STT 等）不清理

#### Fix 3: homework.js — 作业双击提交防护
- 新增 `_hwSubmitting` guard，`finishHwTest()` 入口检查防止重复提交
- catch 块和正常路径均正确重置 flag

### 架构韧性

#### Fix 4: ui.js — Study 模式 flag 清理
- `_cleanupActiveMode()` 末尾重置 `S._refreshMode/_mistakeMode/_kpScanMode/_kpRefreshMode`
- 防止中途导航后残留 flag 导致下次进入显示错误 UI

#### Fix 5: app.js — 全局错误边界
- 添加 `window.onerror` 结构化日志（return false 保留浏览器默认行为）
- 添加 `unhandledrejection` 监听，仅对网络错误显示 toast

#### Fix 6: recovery-session.js — 会话中断 checkpoint
- 新增 checkpoint 持久化（`_saveRecoveryCheckpoint` / `_loadRecoveryCheckpoint`）
- 每次 `_recordRecoveryResult()` 后写 localStorage
- `_endRecoverySession()` 和 `skipRecoverySession()` 正确清理 checkpoint
- `startRecoverySession()` 开头检查 checkpoint，有未完成进度则恢复并 toast 提示

#### Fix 7: recovery-scheduler.js — Backlog 漂移修复
- backlog 条目增加 `_addedAt` 时间戳
- 过滤条件改为双重限制：时间 ≤ maxCarryOverDays 天 + 跳过次数 < maxSkipCount（默认 5）
- 旧 backlog 无 `_addedAt` 时 fallback 为 `Date.now()`（优雅迁移）

### 误报排除（9 项经代码验证不需修复）
- S1 KaTeX XSS：pqSanitize + escapeHtml 多层防护 ✓
- S3 .single() 错误检查：全部 3 处正确处理 ✓
- S4 客户端 rate-limit：UX 层 + Supabase 后端保护 ✓
- D2 FLM 合并冲突：取高状态 + 求和逻辑正确 ✓
- D4 通知竞态：极低概率偏差可接受 ✓
- A3 typeof 分发：所有路径有 fallback ✓
- A5 索引重建：O(n) 量级可接受 ✓
- A7 时区：一致使用本地时区 ✓
- D6 pastpapers-cie 重复：仅 admin 面板使用 ✓

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 追加 .catch() 错误处理 |
| `js/storage.js` | 扩展 invalidateCache() +7 缓存 |
| `js/homework.js` | 添加 _hwSubmitting 双击防护 |
| `js/ui.js` | _cleanupActiveMode() 追加 flag 清理 |
| `js/app.js` | 新增全局错误边界 |
| `js/recovery-session.js` | 新增 checkpoint 持久化系统 |
| `js/recovery-scheduler.js` | backlog 时间+次数双重过滤 |

## [5.13.1] - 2026-03-13 — 图片仓库清理 + 试卷数据拆分

### 图片仓库清理 (25maths-cie0580-figures)
- 删除 9 个异常 `.png/` 目录（文件名被误作目录名）
- 删除 42 个 MD5 完全相同的冗余副本
- 删除 10 个占位图（2023MayJune/Paper21，均为 3142b 假图）
- 删除 36 个损坏/占位文件（<4KB 批量生成的 stub）
- 重命名 531 个单图描述文件为标准格式（如 `Q07-VennDiagram.png` → `Q07.png`）
- 保留 342 个多图描述文件（同一题多张不同图，描述用于区分）

### 试卷数据拆分 (ExamHub)
- 新增 `scripts/split-papers-cie.js`：按试卷拆分 papers-cie.json
- 新增 `data/papers-cie/` 目录：228 套试卷独立 JSON 文件（按 qnum 升序）
- 新增 `data/papers-index-cie.json`：试卷索引（paper/year/session/variant/count/file）
- 格式化 `data/papers-cie.json` 为多行可读 JSON
- 数据验证：4,107 题，0 重复

### 修改文件
| 文件 | 变更 |
|------|------|
| `scripts/split-papers-cie.js` | **新建**：试卷拆分脚本 |
| `data/papers-cie/*.json` | **新建**：228 个独立试卷文件 |
| `data/papers-index-cie.json` | **新建**：试卷索引 |
| `data/papers-cie.json` | 格式化为多行 JSON（内容不变） |

## [5.13.0] - 2026-03-13 — 安全加固：RLS + 登录注册拆分 + 邮箱验证

### 安全修复

#### 1. RLS 缺口修复（Critical）
- **leaderboard 表**: 启用 RLS + FORCE，撤销 anon 角色权限，仅 authenticated 可读写自己的行
- **vocab_progress 表**: 启用 RLS，撤销 anon 角色权限，仅 authenticated 可读写自己的行
- **教师可读**: 教师可查看同校学生的排行榜数据
- **Super Admin**: 保留全表读取权限

#### 2. 登录/注册拆分（High）
- **拆分为独立按钮**: "Login 登录" + "Register 注册"，不再"登录失败自动注册"
- **登录按钮**: 仅调用 `signInWithPassword()`，失败显示错误，不触发注册
- **注册按钮**: 仅调用 `signUp()`，成功后提示检查邮箱
- **邀请码输入框**: 注册时可选填邀请码（`#auth-invite`），预留 `activate-invite` Edge Function 调用
- **消除账户枚举**: 登录失败统一显示"邮箱或密码错误"

#### 3. 邮箱验证（High）
- **register-teacher Edge Function**: `email_confirm` 从 `true` 改为 `false`，教师注册需验证邮箱
- **注册成功提示**: 显示"请查看邮箱，点击确认链接后再登录"
- **注意**: 需在 Supabase Dashboard → Auth → Providers → Email 开启 "Confirm email"

### UI 变更
- 登录页按钮从单个 "Login / Register" 改为并排 "Login" + "Register"
- 新增 `.btn-outline` 样式（注册按钮）
- 新增 `.auth-btn-row` flex 布局
- 登录页说明文案更新

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/auth.js` | 修改 — 拆分登录/注册事件监听器 + 邮箱验证提示 + 邀请码字段 |
| `index.html` | 修改 — 双按钮 + 邀请码输入框 |
| `css/style.css` | 修改 — `.btn-outline` + `.auth-btn-row` |
| `supabase/functions/register-teacher/index.ts` | 修改 — `email_confirm: false` |
| `supabase/migrations/20260313100000_*.sql` | 新建 — RLS 启用 + 策略 |
| `supabase/migrations/20260313100001_*.sql` | 新建 — FORCE RLS |
| `supabase/migrations/20260313100002_*.sql` | 新建 — 策略重建 + grant 修复 |
| `supabase/migrations/20260313100003_*.sql` | 新建 — 撤销 anon 权限 |
| `supabase/migrations/20260313100004_*.sql` | 新建 — 恢复 authenticated 权限 |

## [5.12.1] - 2026-03-13 — singleRound 练习结果不存库修复

### Bug 修复
- **practice.js**: `startPPScanByIds(ids, board, true)` 的 singleRound 模式下，用户选「完全掌握」后 cs 只有 1（< 2 门槛），状态被错误设为 `uncertain` 而非 `mastered`
- **根因**: `_ratePPScanPractice()` 的 cs≥2 渐进机制不适用于单轮模式（round=5），每题只评分一次无法达到 cs≥2
- **修复**: 新增 `isSingleRound` 检查，单轮模式下用户单次「完全掌握」直接设为 mastered

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | `_ratePPScanPractice()`: 添加 `isSingleRound` bypass cs≥2 门槛 |
| `js/config.js` | 版本号 → v5.12.1 |

## [5.12.0] - 2026-03-13 — 七模块真题卡片升级

### 核心变更
- **Module 3 — 题干翻译**: 新增折叠式翻译占位模块（中文模式自动显示），数据待 Gemini 批量生成
- **Module 4 — 考查知识点升级**: KP 模块增加 explanation 摘要（60 字截断）+ 「📖 深入学习」按钮直达 Knowledge Node
- **Module 5 — 题型归纳 & 解题思路**: 新增折叠模块，展示 `examPatterns` 的 label + description（双语）
- **Module 6 — 下载练习 PDF**: 接入 QP-only 仓库（3,120 PDF），原题PDF + 评分标准并排显示
- **Module 7 — 更多专题练习**: 卡片底部新增 section 名称链接，点击跳转 Topic Browse 并自动滚动到对应 section

### 模块顺序
`body → translation → vocab → kp → pattern → markscheme → solution` + topic-more footer

### 新文件
| 文件 | 说明 |
|------|------|
| `data/qp-index.json` | QP-only PDF 索引（3,120 题 × 187 套卷） |
| `scripts/build-qp-index.js` | 扫描 QP 仓库生成索引脚本 |

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 5 个新/升级模块函数 + 事件委托 + QP URL 构建 + section name helper + topic row data-section-id |
| `css/style.css` | KP row / pattern item / PDF row / topic-more / translation 样式 |
| `js/config.js` | 版本号 → v5.12.0 |
| `data/vocabulary-cie.json` | 修正 4 条三角特殊角定义（sin30°/cos60°/tan45°/cos30° 补充中文） |

## [5.11.1] - 2026-03-13 — 三态语言审计修复

### Bug 修复
- **mastery.js**: ZH 模式下词汇列表和预览网格不显示中文释义（`appLang === 'bilingual'` → `appLang !== 'en'`，2 处）

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | L992, L1143: 条件判断兼容 ZH 模式 |
| `js/config.js` | 版本号 → v5.11.1 |

## [5.11.0] - 2026-03-13 — 三态语言支持（EN / ZH / Bilingual）

### 核心变更
- **三态语言切换**: 新增纯中文模式 `'zh'`，循环顺序 EN → ZH → Bilingual → EN
  - EN 模式：所有导航/标签/按钮显示纯英文
  - ZH 模式：导航/标签显示纯中文，题目内容保持英文
  - Bilingual 模式：导航显示 `"English 中文"` 双语格式（原有行为）
- **`biText()` helper**: 新增用于内联拼接场景，三态感知的文本选择函数
- **按钮标签优化**: EN→`中文` / ZH→`EN/中` / Bilingual→`EN`

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/config.js` | appLang 三态 + `t()` 三态 + `biText()` 新增 + `boardName`/`rankName`/`catName`/`lvTitle` ZH 分支 + 版本号 v5.11.0 |
| `js/ui.js` | `toggleLang()` 三态循环 + `updateNav()` 三态 data-en/data-zh 处理 |
| `js/auth.js` | `toggleAuthLang()` 三态循环 + `updateAuthLang()` 标签/placeholder 适配 |
| `js/syllabus.js` | 6 处内联拼接 → `biText()` / 三态直接判断 |
| `js/mastery.js` | 2 处 hero 区域 → ZH 模式显示中文标签，bilingual 显示双行 |

## [5.10.0] - 2026-03-13 — Mark Scheme PDF + 专题刷题

### 核心变更
- **Mark Scheme PDF 链接**: 做题后可直接查看对应的评分标准 PDF
  - 3 个 PDF 仓库拆分部署（qp-only / ms-only / qp+ms），共 8,010 个 PDF
  - `ppGetMarkSchemeURL(q)` 根据索引文件映射题目到 PDF URL，优先 qp+ms
  - 仅 practice 模式显示，exam 模式隐藏；无 PDF 时自动隐藏按钮
  - 覆盖范围：2019OctNov–2024OctNov + 2025Specimen
- **专题刷题 Tab**: 套卷浏览器新增 "按专题" 切换
  - Tab 切换：📄 套卷 / 📂 专题
  - 专题视图：章节分组 + 题数 badge + 掌握度进度条
  - 点击直接进入该知识点的 practice 模式

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`ppGetMarkSchemeURL` +`_ppRenderMarkSchemeModule` +`_ppRenderTopicBrowse` +`ppSelectBrowseTab`，模块顺序加 markscheme，事件处理加 openMarkScheme (~170行) |
| `css/style.css` | +MS 按钮样式 +Tab 切换样式 +专题浏览样式 (~29行) |
| `js/syllabus.js` | 首页卡片文案 "套卷练习" → "套卷/专题练习" |
| `js/config.js` | 版本号 v5.9.0 → v5.10.0 |
| `data/ms-index.json` | 新增：2,428 条 ms-only PDF 索引 |
| `data/qpms-index.json` | 新增：2,462 条 qp+ms PDF 索引 |

### PDF 仓库
| 库名 | 文件数 | 大小 |
|------|--------|------|
| `25maths-cie0580-pdf-singlequestions` | 3,120 qp-only | 506 MB |
| `25maths-cie0580-pdf-singlems` | 2,428 ms-only | 343 MB |
| `25maths-cie0580-pdf-qpms` | 2,462 qp+ms | 700 MB |

## [5.10.0-pre] - 2026-03-13 — Answer Block 编辑器（答题区块化）

### 核心变更
- **Answer Block 列表编辑器**: 超管编辑器中答题线改造为 block 列表，支持在答题线之间插入文本或空白间距
  - 3 种 block 类型：`answer_line`（答题线）、`text`（文字/LaTeX）、`space`（空白间距）
  - 每行支持 ▲ ▼ ✖ 操作（移动/删除），`+ Answer Block` 添加新行
  - 向后兼容：保留 `answer` 字段，新增 `answerBlocks` 数组，渲染优先读 `answerBlocks`
  - 单一 answer_line 时只保存 `answer`（不生成 `answerBlocks`），保持数据简洁
- **统一渲染**: `_ppRenderAns()` 统一入口，自动判断 answerBlocks vs legacy answer

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 新增 ~150 行（`_ppEdAnswerBlockList`/`_ppEdAnswerBlockRow`/`_ppEdCollectAnswerBlocks`/`_ppRenderAnswerBlocks`/`_ppRenderAns` 等），修改 ~30 行（4 个编辑器调用点 + 3 个收集点 + 4 个渲染点 + 保存流程） |

## [5.9.1] - 2026-03-12 — KP 内容生成管线 + LaTeX 修复

### 核心变更
- **KP 内容批量生成**: Gemini 2.5 Flash 自动填充 201 个知识点的 `solutionMethod` + `commonMistakes`
  - CIE 97/97、EDX 49/49、HHK 55/55，100% 覆盖
  - 每个 KP 新增 3-5 步解题方法（中英双语）+ 2-3 个常见错误及纠正
- **LaTeX 转义修复**: 4 个 KP 的 `\times`/`\text`/`\theta` 因 JSON `\t` 转义损坏，已修复（12 处）
- **Knowledge Node Stage 3/4**: 现在读取真实的 `solutionMethod` 和 `commonMistakes` 数据，不再显示 fallback 内容

### 新增文件
| 文件 | 说明 |
|------|------|
| `scripts/kp-enrich.py` | Gemini KP 内容生成管线（支持 --test / --board / --dry-run） |

### 修改文件
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | 97 个 KP 新增 solutionMethod + commonMistakes |
| `data/knowledge-edx.json` | 49 个 KP 新增 solutionMethod + commonMistakes |
| `data/knowledge-hhk.json` | 55 个 KP 新增 solutionMethod + commonMistakes |

## [5.9.0] - 2026-03-12 — Knowledge Node 知识点学习面板

### 核心变更
- **Knowledge Node 面板**: 答错后出现"📖 Learn This"按钮，打开 6 阶段底部面板（动机→概念→考法→方法→例题→定向练习）
- **weakest-KP 定位**: 根据 FLM 状态（new→learning→uncertain→mastered）自动选择最弱知识点
- **定向练习**: 从知识点关联的真题中精选 5 道，直接进入 PP Scan 练习模式（单轮模式）
- **自测 MCQ**: testYourself 快速自测（数据驱动，来自 knowledge-*.json）
- **startPPScanByIds 时序修复**: showPanel → _cleanupActiveMode 清除 _ppScanState 导致空白
- **singleRound 参数**: 定向练习做完一轮即结束，避免死循环
- **meta tag 更新**: `apple-mobile-web-app-capable` → `mobile-web-app-capable`（消除 deprecation 警告）

### 新增文件
| 文件 | 说明 |
|------|------|
| `js/knowledge-node.js` | Knowledge Node 面板（706 行，含自注入 CSS） |

### 修改文件
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 新增 `_knBuildLearnButton` + ppRate 集成 + startPPScanByIds 时序修复 + singleRound |
| `js/config.js` | APP_VERSION → v5.9.0 |
| `scripts/minify.sh` | 添加 knowledge-node.js 到 bundle 链 |
| `index.html` | meta tag 更新 + cache-bust v5.9.0 |

## [5.8.1] - 2026-03-12 — CIE 图片 Block 数据修复

### 核心变更
- **Figure Block 注入**: 552 题缺失的 figure block 自动注入，覆盖率 64.9% → 97.4%
- **智能定位**: 按 URL 文件名匹配 part 标签（Q01a→part(a)），其余注入 stem
- **Table 去重**: 已有 table block 的题跳过对应 table 渲染图（BarChart/StemLeaf 等 9 题）
- **注入统计**: stem 639 个 + parts 280 个 = 共 919 个 figure block

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/papers-cie.json` | 修改 — 552 题注入 919 个 figure block |

## [5.8.0] - 2026-03-12 — 真题答案解析模块

### 核心变更
- **答案解析渲染器**: `_ppRenderSolution(q)` 支持 Block[] 步骤 + 小题/子题结构 + LaTeX
- **步骤序号**: 每个文本步骤自动编号（圆形紫色徽章），表格/图片/列表不占序号
- **折叠式 UI**: 默认收起，点击"答案解析"展开，展开时自动触发 KaTeX 渲染
- **双模式集成**: Practice 模式 + Scan 模式均支持解析展示
- **数据模型**: `q.solution = { steps: Block[], final: string, parts: [{ label, steps, final, subparts }] }`

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/practice.js` | 修改 — 新增解析渲染器 + 模块集成（~100 行） |
| `css/style.css` | 修改 — 新增解析样式（步骤序号/最终答案/折叠） |

## [5.7.5] - 2026-03-12 — `\( ... \)` → `$\, ... \,$` 数据修复

### 核心变更
- **CIE 0580**: 141 处 `\( ... \)` 替换为 `$\, ... \,$`（33 题，含嵌套括号处理）
- **Edexcel 4MA1**: 2 处同步替换
- **Supabase question_edits**: 已确认 56 行编辑记录中无此 pattern，无需更新

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/papers-cie.json` | 修改 — 141 处替换 |
| `data/papers-edx.json` | 修改 — 2 处替换 |

## [5.7.4] - 2026-03-12 — 编辑器 Figure Block 可视化编辑

### 核心变更
- **Figure URL 解析**: 编辑器中 figure block 的 `.tex` 路径自动替换为实际 GitHub 图片 URL（按文件名匹配）
- **图片缩略图预览**: figure block 编辑时显示实时缩略图，URL 修改后自动刷新
- **Part/Subpart 支持**: 小题和子题中的 figure block 同样解析并可编辑
- **自由移动**: figure block 与其他 block 一样支持 ▲▼ 上下移动

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/practice.js` | 修改 — 新增 `_ppEdResolveFigureUrls` + `_ppEdFigPreview` + 编辑器 figure 预览 |
| `css/style.css` | 修改 — 新增 `.pp-ed-fig-preview` 缩略图样式 |

## [5.7.3] - 2026-03-12 — i18n 双语英中并列显示

### 核心变更
- **`t()` 空格拼接**: 双语模式下 `t('Study','学习')` 返回 `"Study 学习"` 而非纯中文，覆盖 ~2,850 调用点
- **`rankName()` 并列**: 双语模式显示 `"Bronze Learner 青铜学员"` 而非纯中文
- **导航栏并列**: `data-en/data-zh` 元素双语模式显示 `"Home 首页"` 格式
- **语言切换按钮**: EN 模式显示 `"中/EN"`，双语模式显示 `"EN"`
- **登录页占位符**: 双语模式显示 `"Email 邮箱地址"` 格式
- **按钮防溢出**: `.btn` 添加 `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — `t()` 空格拼接 + `rankName()` 并列 |
| `js/ui.js` | 修改 — `updateNav()` 双语并列 + `toggleLang()` 按钮标签 |
| `js/auth.js` | 修改 — `updateAuthLang()` 按钮标签 + 占位符并列 |
| `css/style.css` | 修改 — `.btn` 防溢出 |

## [5.7.2] - 2026-03-12 — Super Admin 全权限用户管理

### 核心变更
- **前端解除只读**: Super Admin 在管理面板可创建班级、添加学生、编辑班级、改名、重置密码、移动班级
- **创建班级增强**: Super Admin 创建班级时新增学校+教师选择器（因无 `_teacherData`）
- **Edge Function SA 绕过**: `create-students`、`reset-student-password`、`update-student` 三个函数添加 Super Admin 邮箱检测，跳过教师/学校校验
- **RLS 写入策略**: `kw_classes`、`kw_class_students`、`leaderboard` 新增 INSERT/UPDATE/DELETE 策略
- **update_class RPC**: 添加 `is_super_admin()` 检查，允许编辑任意班级

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/admin.js` | 修改 — 解除 `_saReadOnly` 限制、`showCreateClassModal` 增加 SA 字段、`doCreateClass` 支持 SA |
| `supabase/functions/create-students/index.ts` | 修改 — 添加 SA 绕过 |
| `supabase/functions/reset-student-password/index.ts` | 修改 — 添加 SA 绕过 |
| `supabase/functions/update-student/index.ts` | 修改 — 添加 SA 绕过 |
| `supabase/migrations/20260312100000_superadmin_write_access.sql` | 新建 — RLS + RPC 更新 |

## [5.7.1] - 2026-03-12 — 用户管理批量操作

### 核心变更
- **批量选择**: 用户管理表格新增 checkbox 列，支持全选当前页 / 单选
- **批量分配班级**: 选中多个用户后一键分配到指定班级，含进度条
- **批量修改角色**: 选中多个用户后批量修改角色（student/teacher/guest），含进度条
- **选中状态可视化**: 选中行高亮 + 批量操作栏自动显示/隐藏

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/admin.js` | 修改 — 新增批量选择 + 批量分配班级 + 批量修改角色（~130 行） |
| `css/style.css` | 修改 — 新增批量操作栏 + 选中行高亮样式 |

## [5.7.0] - 2026-03-12 — 超管用户管理系统

### 核心变更
- **用户管理标签页**: 超管可查看所有注册用户（含未学习的新用户），支持角色过滤、搜索、排序、分页
- **Edge Function `list-users`**: 通过 `service_role` 读取 `auth.users`，关联班级/学校信息
- **Edge Function `admin-update-user`**: 支持 6 种操作（编辑元数据、重置密码、分配班级、修改角色、封禁/解封、删除）
- **完整弹窗系统**: 编辑、重置密码、分配班级、修改角色、封禁确认、删除二次确认（需输入邮箱）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `supabase/functions/list-users/index.ts` | 新建 — 超管用户列表 API |
| `supabase/functions/admin-update-user/index.ts` | 新建 — 超管用户操作 API（6 种 action） |
| `js/admin.js` | 修改 — 新增用户管理标签页 + 渲染 + 弹窗 + 事件委托（~350 行） |
| `css/style.css` | 修改 — 新增角色/封禁 badge + 分页样式 |

## [5.6.3] - 2026-03-12 — CIE 裸露 `\,` 修复

### 核心变更
- **智能修复**: 399 题中 1908 处裸露 `\,`（不在 `$...$` 内）全部修复
- **数字+单位**: `15\,cm` → `$15\,\text{cm}$`，千位分隔 `52\,149` → `$52\,149$`
- **变量+单位合并**: `$3R$\,cm` → `$3R\,\text{cm}$`，含指数 `45\,cm$^3$` → `$45\,\text{cm}^3$`
- **比例/茎叶图**: `\,:\,` → `$\,{:}\,$`，`\,|\,` → `$\,|\,$`
- **清理**: 尾部 `\,` 移除、标签 `(a) \,` 移除、模板 `{---}\,` 替换为空格
- **渲染**: `_ppRenderTexStr` 已有 `\newline → <br>` 支持，KaTeX 自动处理 `$...$` 内的 `\,`

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/papers-cie.json` | 399 题 `\,` 修复 |
| `scripts/fix-thinspace.py` | 新建修复脚本 |

## [5.6.2] - 2026-03-12 — CIE 题目句末换行

### 核心变更
- **句末换行注入**: 4090 道 CIE 真题的 stem/parts/tex 文本中，句末句号后自动添加 `\newline`
- **间距命令替换**: 所有 `\\[...cm]` 间距命令统一替换为 `\newline`
- **渲染支持**: `_ppRenderTexStr` 新增 `\newline` → `<br>` 转换，确保换行在 HTML 中生效
- **安全跳过**: 小数点（0.8）、省略号（...）、数学模式内句号均不受影响

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/papers-cie.json` | 4090 题文本内容添加 `\newline` |
| `js/practice.js` | `_ppRenderTexStr` 新增 1 行 `\newline` → `<br>` |
| `scripts/inject-newline.py` | 新建注入脚本 |

## [5.6.1] - 2026-03-12 — CIE 外部图片注入

### 核心变更
- **图片 URL 注入**: 1107 道 CIE 0580 真题注入外部图片 URL（来自 25maths-cie0580-figures GitHub Pages，共 1862 张图片）
- **Block 渲染支持**: `_ppRenderFigureBlock` 支持 http 外部 URL + `figureUrls` 按 block 索引取图
- **Legacy 渲染支持**: `_ppRenderFigures` 新增 `figureUrls` 降级路径，覆盖无 figure block 的 hasFigure 题
- **注入脚本**: `scripts/inject-figure-urls.py` 一次性脚本，支持重复运行

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/papers-cie.json` | 1107 题新增 `figureUrls` 数组 |
| `js/practice.js` | 3 处渲染函数修改（~16 行） |
| `scripts/inject-figure-urls.py` | 新建注入脚本 |

## [5.6.0] - 2026-03-12 — 自定义学习计划

### 核心变更
- **学习计划数据模型**: 扩展 Custom Lists，新增 `isPlan`/`isHidden`/`targetDate` 字段，6 个计划函数（create/hide/unhide/getActive/getHidden/getProgress）
- **计划管理 UI**: My Lists 标签页分区展示（进行中计划/自定义清单/已完成计划），计划卡片含进度条+截止日期+聚焦学习按钮
- **计划创建弹窗**: 标题+截止日期+状态过滤（仅新词/新+学习中/所有未掌握）+按 section 选择内容，自动收集 vocab+KP+PP
- **聚焦学习模式**: `startPlanFocusStudy()` 过滤已掌握项，只学未掌握内容，复用 List Scan 链式扫描
- **今日计划集成**: 首页 Active Plans 卡片（最多 3 个），含迷你进度条+截止日期提示+继续学习按钮
- **知识点详情页**: 新增"创建学习计划"按钮，一键收集该 section 下所有未掌握内容

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/storage.js` | 新增 6 个计划函数（~87 行） |
| `js/lists.js` | 分区展示 + 计划卡片 + 创建弹窗 + 聚焦学习（~450 行） |
| `js/syllabus.js` | 今日计划卡片 + section 创建按钮（~58 行） |
| `css/style.css` | 计划相关样式（~20 行） |

## [5.5.0] - 2026-03-12 — 逐题核心词汇提取

### 核心变更
- **逐题词汇映射**: 替代 section 级别的全量词汇，每道真题只显示 2-6 个直接相关的核心数学术语
- **Gemini 批处理提取**: `scripts/extract-question-vocab.js` 按 section 分组调用 Gemini，自动提取逐题词汇并发现新词
- **合并验证脚本**: `scripts/merge-question-vocab.js` 去重合并 + 新词入库 + 输出最终映射文件
- **智能降级**: 无逐题映射的题目自动降级显示 section 全量词汇（标题区分"核心词汇"/"相关词汇"）
- **生词库添加**: 每个未学习词汇显示"+ 添加"按钮，一键初始化 FLM 状态并记录添加次数
- **UI 安全强化**: 词汇渲染使用 `escapeHtml()`，按钮改用 `data-action` 事件委托（消除 onclick XSS）

### 数据
- CIE 首批 295 题映射（4 sections: 1.1, 1.2, 1.3, 1.18），15 个新词入库
- 平均每题 3.4 个核心词汇（median: 3）
- 提取脚本支持增量运行（`--section`/`--dry-run`），已完成 section 自动跳过

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `scripts/extract-question-vocab.js` | **新建** — Gemini 批处理逐题词汇提取 |
| `scripts/merge-question-vocab.js` | **新建** — 合并验证 + 新词入库 + 映射输出 |
| `data/question-vocab-cie.json` | **新建** — CIE 逐题词汇映射（295 条，持续扩充） |
| `data/question-vocab-edx.json` | **新建** — EDX 逐题词汇映射（待提取） |
| `data/vocabulary-cie.json` | 修改 — 追加 15 个 Gemini 发现的新词 |
| `js/practice.js` | 修改 — 加载 question-vocab + `_ppGetQuestionVocab` + `_resolveVocabUid` + `ppVocabBankAdd` + UI 改造 |
| `css/style.css` | 修改 — `.pp-vocab-add` / `.pp-vocab-added` 按钮样式 |
| `.gitignore` | 修改 — 排除 `data/qvocab-raw/` 中间数据 |

## [5.4.0] - 2026-03-12 — 智能通知系统

### 核心变更
- **通知基础设施迁移**: 从 `homework.js` 迁移到新建 `smart-notif.js`（core bundle），所有用户（含 Guest）可见铃铛和通知
- **Guest 本地通知**: `localStorage` 存储（key: `local_notifications`，上限 50 条 FIFO），与 Supabase 行结构一致
- **节流/去重系统**: `notif_sent_today` 每日自动重置，按 subtype 防止重复发送
- **5 类智能触发器**:
  - 🏅 `milestone` — 徽章解锁 + 连续天数 [3,7,14,30,60,100] + 知识点 mastered
  - 📋 `plan` — 每日首次生成复习计划时通知（N 词汇 + N 知识点 + N 真题）
  - ⚠️ `weakness` — 正确率下降趋势 + 反复错误模式 + 薄弱知识点
  - ⏰ `hw_deadline` — 24h 内到期且未提交的作业提醒（仅有班级的登录学生）
  - 🔄 `reforget` — 遗忘 3 次以上的项目预警
- **扩展通知路由**: `handleNotifClick` 新增 `plan`/`stats`/`section`/`mistakes`/`daily` 导航
- **通知类型颜色**: `data-ntypec` 属性驱动 `.notif-dot` 颜色区分（milestone=warning, weakness=danger 等）
- **内置 timeAgo**: `_notifTimeAgo()` 独立实现，不依赖 lazy-loaded `admin.js`

### Hook 插入点
- `storage.js` `checkBadges()` — 徽章解锁时调用 `_notifBadgeUnlock(b)`
- `storage.js` `recordActivity()` — 活动记录后调用 `_notifStreakAchievement(streak)`
- `syllabus.js` `checkSectionMilestone()` — mastered 时调用 `_notifSectionMastered()`

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/smart-notif.js` | **新建** — 通知基础设施 + Guest 支持 + 节流 + 5 类触发器 |
| `js/homework.js` | 删减 — 移除 lines 5-135 的通知函数（迁移到 smart-notif.js） |
| `js/storage.js` | 插入 — `checkBadges` + `recordActivity` 两处 hook |
| `js/syllabus.js` | 插入 — `checkSectionMilestone` mastered hook |
| `js/ui.js` | 修改 — `showApp()` 对所有用户显示铃铛 + 延迟初始化智能通知 |
| `scripts/minify.sh` | 修改 — core bundle 添加 `smart-notif.js` |
| `css/style.css` | 追加 — 通知类型颜色 CSS |
| `js/config.js` | 修改 — 版本号 v5.4.0 |

## [5.3.1] - 2026-03-12 — 列表视图优化 + 套卷详情交互筛选

### 核心变更（列表视图）
- **KPs tab 接入 HHK 知识点**: `_getFilteredKPs()` 增加 `25m→hhk` 映射，从 `BOARD_SYLLABUS['hhk']` 和 `_kpData['hhk']` 获取 55 个知识点，年级筛选 `_category` 自动映射（`Y7.1` → `25m-y7`）
- **Board chip 显示计数**: 每个 Board 芯片旁显示当前 tab 的原始数据量（如 `CIE 0580 (72)`），新增 `_getBoardCounts()` 轻量计数函数
- **Section 下拉按 chapter 分组**: `_collectSections()` 返回 `{value, label, group}` 格式，`_renderMultiDrop()` 支持 group 分隔标题（`.lf-drop-group` + `.lf-drop-grouped` 缩进），72+ section 按章节分组更易查找
- **筛选栏重置按钮**: filter bar 末尾新增 `✕ 重置` 按钮，一键清空所有筛选条件
- **`_collectSections()` 加入 hhk**: 选中 25m 或无选择时，section 下拉包含 hhk 章节（Y7.1~Y11.10）
- **`_applyListFilters()` 适配 hhk**: 25m KP 项支持 section 过滤（hhk section 格式 `Y7.1` 与 CIE `1.1` 互不冲突）
- **KPs tab 恢复 25m chip**: 板块切换不再隐藏 25m（仅 PPs tab 隐藏）

### 核心变更（套卷详情交互筛选）
- **知识点分布点击筛选**: 套卷详情页的知识点 chip 可点击切换，点击后题目列表实时过滤只显示包含该知识点的题目，再次点击取消筛选
- **指令动词分布点击筛选**: 指令动词 badge 可点击切换，筛选逻辑与知识点相同，两者可同时组合筛选
- **题目列表实时更新**: 新增 `_ppRenderDetailQList()` 独立渲染题目列表区域，筛选时仅更新题目区域不重建整页
- **筛选计数提示**: 筛选激活时标题显示 `(N/M)` 匹配数量
- **题目行增加 cmd 标签**: 每个题目行显示对应的指令动词 badge，便于区分
- **安全重构**: 题目行 onclick 改为 addEventListener 事件委托（消除 XSS）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — `_getFilteredKPs` 25m→hhk 映射 + `_getBoardCounts` 新增 + `_renderMultiDrop` group 支持 + `_renderListFilters` chip 计数/重置/25m 恢复 + `_collectSections` hhk+group + `_applyListFilters` 25m section + `_bindListFilters` 重置事件 |
| `js/practice.js` | 修改 — `ppShowPaperDetail` 重构为交互式筛选 + 新增 `_ppDetailFilter`/`_ppRenderDetailQList`/`_ppBindDetailChips` |
| `css/style.css` | 修改 — 新增 `.lf-drop-group`/`.lf-drop-grouped`/`.lf-reset-btn` + `.pp-detail-cmd-chip` selected 样式 + 暗色模式 |
| `js/config.js` | 修改 — 版本号 v5.3.1 |

## [5.3.0] - 2026-03-12 — 列表视图筛选重构：Board 优先 + 多选 + 条件筛选

### 核心变更
- **Board 一级芯片切换**: 3 个 toggle chip（哈罗海口/CIE 0580/Edexcel 4MA1），可多选，全不选=显示全部
- **多选下拉组件**: 新建通用 `_renderMultiDrop()` 组件，所有筛选器从单选变为多选（空=全部，非空=OR 匹配）
- **条件二级筛选**: Board 选择驱动二级筛选动态显示 — 25m 显示年级+单元，CIE/EDX 显示章节+年份/考季/试卷（仅 PP Tab）
- **数据增强**: 词汇项增加 `_board`/`_category` 字段，PP 项增加 `_year`/`_session`/`_paper` 字段
- **级联更新**: Board 变更清空不相关子筛选，Grade 变更重新收集 Unit 选项
- **移除日期范围筛选**: 删除 dateFrom/dateTo（低使用率）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — `_listFilters` 全部改为数组 + `_renderMultiDrop` 组件 + `_renderListFilters`/`_bindListFilters`/`_applyListFilters` 全部重写 + 新增 `_collectUnits`/`_collectYears`/`_collectSeasons`/`_collectPapers`/`_cascadeBoardChange`/`_refreshDropBtn` |
| `css/style.css` | 修改 — 新增 `.lf-board-bar`/`.lf-board-chip`/`.lf-drop-*` 样式 + 暗色模式 + 响应式 |
| `js/config.js` | 修改 — 版本号 v5.3.0 |

## [5.2.0] - 2026-03-12 — 学习项目筛选 UX 优化 + 清单按类型自动拆分

### 核心变更
- **固定筛选栏**: `.list-view` 改为 flex 布局，header 固定不滚动，仅 `#list-content` 区域可滚动（`overflow-y:auto`），手机端适配底部导航栏高度
- **分页优化**: 默认每页 20 条，支持 20/50 切换；有数据时始终显示分页栏（含页大小切换），仅总页数 > 1 时显示翻页按钮
- **清单按类型自动拆分**: 勾选混合类型（词汇+知识点+真题）加入清单时，自动拆分为独立子清单（`清单名 — 词汇` / `清单名 — 知识点` / `清单名 — 真题`），各司其职；单一类型则不拆分

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — sticky 布局包裹 + 分页重写 + 清单拆分逻辑 |
| `css/style.css` | 修改 — 新增 `.list-header-sticky` 样式 + 暗色模式 |
| `js/config.js` | 修改 — 版本号 v5.2.0 |

## [5.1.0] - 2026-03-12 — 25m 单元词汇合并（173→55 卡组）

### 核心变更
- **单元合并**: 25m（哈罗）173 个子卡组合并为 55 个（每单元 1 个卡组，平均 ~15 词/组，最大 ~65 词）
  - FLM 筛选机制让已掌握词自动过滤，大卡组不会造成负担
  - 总级别数从 275 → 157（CIE 55 + EDX 47 + 25m 55）
- **数据迁移**: 词汇进度（全局 UID）零影响；`modeDone` 完成标记自动迁移旧 slug → 新 slug
- **slug 回退**: `getLevelBySlug()` / `getLevelIdxBySlug()` 支持旧 slug 自动映射到新 slug（deep link 兼容）
- **首页简化**: 移除 25m 单元折叠分组（unitMap/unitCollapsed/toggleUnit），改为与 CIE/EDX 相同的扁平 deck 列表
- **知识点详情**: vocab 关联区域从多行子卡组列表改为单个可点击模块
- **Homework 模板迁移**: `hw_templates` localStorage 中旧 slug 自动替换

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `scripts/merge-25m-units.js` | **新建** — 合并脚本（读取 levels.js → 输出合并后数据 + slug 映射） |
| `js/levels.js` | **重写** — 173 → 55 个 25m 级别（由脚本生成） |
| `js/config.js` | 修改 — 版本号 v5.1.0 + slug 回退查找 |
| `js/storage.js` | 修改 — `_migrateModeDoneForMerge()` + `_migrateHwTemplateSlugs()` |
| `js/levels-loader.js` | 修改 — 加载 `data/slug-merge-map.json` |
| `js/mastery.js` | 修改 — 移除 25m 单元折叠分组，改为扁平渲染 |
| `js/syllabus.js` | 修改 — 简化 vocabSlugs 区域为单个模块 |
| `data/levels-25m.json` | **重写** — 由 split-levels.js 重新生成（173 → 55 条） |
| `data/slug-merge-map.json` | **新建** — 旧→新 slug 映射（173 条） |
| `data/vocab-uid-map.json` | **更新** — 旧 slug 键替换为新 slug 键 |
| `data/syllabus-hhk.json` | **更新** — vocabSlugs 数组从多个子 slug 合并为单个 |
| `CLAUDE.md` | 更新 — 版本号 + levels 数量 |

## [5.0.1] - 2026-03-12 — 清单学习 Tab 工作台重构

### 核心变更
- **Tab 工作台**: 清单学习模式从扁平序列重构为按类型分 Tab（词汇/知识点/真题），每种类型独立进度、独立导航
  - 多类型清单显示 Tab 行（含进度 `rated/total`），单类型清单隐藏 Tab 行
  - Tab 切换保留各自进度（idx/rated），切回时恢复位置
- **KP 完整渲染**: 知识点卡片从"标题+纯文本"升级为完整详情页
  - ① 概念卡片（`_splitExplanation` + `kpMarkdown` 解析）
  - ② 考试模式（`examPatterns[]` 渲染）
  - ③ 经典例题（可折叠解析，`data-ls-kp-sol` 前缀避免 ID 冲突）
  - ④ 自测 MCQ（`testYourself[]`，`data-ls-kp-q/opt` 属性作用域隔离）
  - 防御式处理 `kp.explanation` 字符串 vs `{en,zh}` 对象
- **分类型完成统计**: 完成页面按词汇/知识点/真题分行展示评分结果
- **评分自动推进**: 当前 Tab 评完 → 跳转下一个未完成 Tab → 全部完成 → 结束
- **完成按钮**: 随时可点 "完成学习" 提前结束

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — 版本号 v5.0.1 |
| `js/lists.js` | 重写 — Tab 工作台 + KP 完整渲染（~550 行替代 ~480 行） |
| `css/style.css` | 修改 — Tab 行样式 + KP-in-card 微调 + 完成页分类行 + 暗色/响应式 |

## [5.0.0] - 2026-03-11 — 自定义清单专注学习工作台

### 核心变更
- **统一学习模式**: 新增"开始学习"按钮，在单一面板内连贯展示词汇/KP/PP 内容卡片，支持前进/后退/跳过自由导航
  - 词汇卡片：大字展示 + 点击揭示释义 + 三按钮评分
  - 知识点卡片：标题/解释/考试模式 + 内嵌 MCQ 练习
  - 真题卡片：完整题干/分题/分值渲染（KaTeX 数学公式）
  - 键盘快捷键：1/2/3 评分，←/→ 导航，Space 下一项，Esc 退出
  - 完成页面：评分统计 + 再学一次
- **数据层增强 (Phase A)**: 清单项目新增 `addedAt`/`learnedAt` 时间戳，旧数据自动迁移回填
- **三种打印模式 (Phase B)**: 打印按钮改为模式选择弹窗 — 项目详情/离线勾选清单/摘要总览
- **数据补录系统 (Phase C)**: 新增"补录"按钮（📝），全宽补录界面按类型分组 + write-through 到全局 FLM
- **聚焦学习增强 (Phase D)**: 预览表标题/时间列 + 行内详情展开 + FLM 统计条 + 快速评分
- **云同步修复**: 清单不再被 syncFromCloud 盲删 + 按 list.id 合并策略 + 离页即时上传

### 设计亮点
- **Write-through**: 评分/补录直接写入各类型主存储，getSectionHealth/Smart Path/Recovery 自动联动
- **离线闭环**: 打印离线勾选清单 → 手写学习 → 补录结果 → 全局同步
- **辅助函数**: `_resolveItemTitle()`/`_resolveItemDetailHtml()` 统一跨类型内容解析

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — 版本号 v5.0.0 |
| `js/storage.js` | 修改 — addedAt/learnedAt 字段 + _migrateListItems + updateItemLearnedAt |
| `js/lists.js` | 修改 — 打印弹窗 + 补录系统 + 统计条 + 行内详情 + 快速评分 + 增强预览表 |
| `js/worksheet.js` | 修改 — printCustomListDetailed + printCustomListChecklist + _resolveItemTitle + _resolveItemDetailHtml |
| `css/style.css` | 修改 — 统计条 + 补录面板 + 行内详情 + 快速评分弹窗 + 暗色模式 |

## [4.9.0] - 2026-03-11 — 哈罗全年级开放 + 成长足迹取代积分排行

### 核心变更
- **全年级开放**: 哈罗 25m-yN 学生可访问 Y7-Y11 全部内容（不再按 category 过滤），Y11 额外看到 CIE
- **成长仪表盘**: panel-board 从排行榜重写为成长仪表盘（词汇/知识点进度条 + 成就徽章 + 里程碑时间线）
- **显示替换**: Quick Stats 条、Hero 卡片 rank 行、侧栏菜单头部 — 积分/排名/百分比改为掌握数量（词汇 + 知识点 + 徽章）
- **Header rank 点击**: 从 showRankGuide 改为跳转 stats 页面
- **Supabase**: leaderboard 表新增 mastered_kps 列，syncToCloud 同步 KP 掌握数

### 首页年级折叠
- 用户所属年级 (userBoard) 默认展开，其余年级默认折叠
- 已有 catCollapsed localStorage 记忆不受影响

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — isLevelVisible() 25m 分支扩展 + getVisibleBoards() 移除年级过滤 + 版本号 |
| `js/mastery.js` | 修改 — getGlobalStats() 加 KP/badge 统计 + _renderQuickStats() 改文案 + hero rank 改文案 + catCollapsed 默认逻辑 |
| `js/ui.js` | 修改 — updateSidebar() 菜单头改为掌握数 + hb-rank 点击改 stats |
| `js/app.js` | 修改 — renderBoard() 重写为成长仪表盘 + _renderGrowthOverview() |
| `js/storage.js` | 修改 — syncToCloud 加 mastered_kps |
| `css/style.css` | 修改 — 新增 growth dashboard 样式 |
| `supabase/migrations/20260311100000_add_mastered_kps.sql` | 新增 — leaderboard 加 mastered_kps 列 |

## [4.8.1] - 2026-03-11 — 全局 UID 架构 Phase 1.5 + Phase 2 (EDX 去重 + DRY + 旧 key 清理)

### 核心变更
- **makeUid() DRY**: 从 `vocab-admin.js._vaMakeUid()` 提取到 `config.js.makeUid()`，`homework.js` 两处内联 fallback 简化为 `makeUid(w)`，算法统一
- **EDX 词库去重**: Edexcel 387→338 个全局 UID（节省 12.7%），`vocabulary-edx.json` 重写为 `{words, sections}` 新格式
- **旧 key 清理**: `_migrateToGlobalKeys()` 迁移完成后删除已转换的 `L_` 旧 key，减少 localStorage 体积
- **自定义清单 ref 归一化**: `_normalizeCustomListRefs()` 将旧格式 `L_{slug}_W{id}` ref 转为 `W_{uid}`，修复去重后 Scan 找不到词的问题

### EDX 去重详情
- 49 个重复词条合并（跨 section 共享如 `parallelogram`、`trapezium` 等）
- 2 个异义词检测：`range`（值域/全距）已消歧，`circumference`（圆周/圆周长）同义合并
- `vocab-uid-map.json` 追加 308 条 EDX 映射（总计 1,810 条）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — 新增 `makeUid()` 全局函数 |
| `js/vocab-admin.js` | 修改 — `_vaMakeUid` 改为 `makeUid` 别名 |
| `js/homework.js` | 修改 — 2 处内联 UID 生成简化为 `makeUid(w)` |
| `js/storage.js` | 修改 — `_migrateToGlobalKeys()` 删除旧 key + 新增 `_normalizeCustomListRefs()` |
| `scripts/dedup-vocab.py` | 修改 — 支持 `--board edx` 参数，board→文件路径映射 |
| `data/vocabulary-edx.json` | 重写 — `{words, sections}` 新格式（338 uid + 39 sections） |
| `data/levels-edx.json` | 修改 — vocabulary id 从数字改为 uid |
| `data/vocab-uid-map.json` | 修改 — 追加 308 条 EDX 映射（总 1,810 条） |
| `data/vocab-disambig-edx.json` | 新增 — EDX 异义词消歧报告 |

## [4.8.0] - 2026-03-11 — 词库去重：全局 UID 词汇架构 Phase 1 (HHK)

### 核心变更
- **全局唯一词汇 ID**: HHK 词库从 1,501 词条去重至 833 个全局 UID（节省 44.5%），学生掌握一个词 = 所有 section 同步
- **wordKey() 自动切换**: 新 uid 格式（含小写字母）返回 `W_{uid}`，旧数字格式保持 `L_{slug}_W{id}`，所有游戏模式零改动
- **FLM 数据迁移**: `_migrateToGlobalKeys()` 一次性合并旧 key → 新 key（取更高 FLM 状态 + 累加 ok/fail + 最新时间戳），保留旧 key 兼容
- **异义词消歧**: 9 组同名异义词自动加语义后缀（如 `degree-angle` / `degree-polynomial`，`square-shape` / `square-power`）
- **跨 level 去重统计**: `getAllWords()` / `_getHHKSectionStats()` / `getSectionHealth()` 按 wordKey 去重，避免重复计数

### 数据格式
- **vocabulary-hhk.json**: 从 `{sectionId: [{word,def,id}]}` 重构为 `{words: {uid: {word,def}}, sections: {sectionId: [uid,...]}}`
- **levels-25m.json**: vocabulary id 从数字 `"0"` 改为 uid `"fraction"`
- **vocab-uid-map.json**: 新增 — 1,502 条 `"slug:oldId" → uid` 映射，供 FLM 迁移使用
- **vocab-disambig.json**: 新增 — 72 个异义词候选（9 个已消歧 + 63 个同义合并）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/storage.js` | 修改 — wordKey() uid 检测 + _migrateToGlobalKeys() + getAllWords() 去重 + getStaleWords() lid 兼容 + _slugBoardFromKey() |
| `js/syllabus.js` | 修改 — _getVocabWords() 新格式适配 + _getHHKSectionStats() 去重 + getSectionHealth() 去重 + _renderSectionRow/_renderBoardHome 适配 |
| `js/levels-loader.js` | 修改 — 启动时加载 vocab-uid-map.json |
| `data/vocabulary-hhk.json` | 重写 — {words, sections} 新格式 |
| `data/levels-25m.json` | 修改 — vocabulary id 改为 uid |
| `data/vocab-uid-map.json` | 新增 — FLM 迁移映射表 |
| `data/vocab-disambig.json` | 新增 — 异义词消歧报告 |
| `scripts/dedup-vocab.py` | 新增 — 去重构建脚本 |
| `js/vocab-admin.js` | 修改 — vaCollectCards() 生成语义 UID 替代数字 ID，新增词自动进入全局去重体系 |

## [4.7.6] - 2026-03-11 — 引导系统审计修复 + 3 端高保真同步管道

### 引导系统修复
- **Tour 步骤重写**: 5 步全部匹配当前首页结构（`.hero-card`/`.quick-stats`/`.deck-row`/nav/`.hero-rank`），修复 v2.0+ 重构后 3/5 步选择器失效问题
- **Tour 导航描述更新**: "Home, Review, Import, Leaderboard and Stats" → "Home, Today's Plan, Mistake Book, Learning Items and Stats"
- **Score Guide 标签修正**: `showScoreGuide()` 中 "排行榜积分" → "综合积分"
- **Guest 提示文案更新**: `showGuestLockPrompt()` 移除 "join the leaderboard" 引用；`showGuestSignupPrompt()` "Join the leaderboard" → "Earn ranks & achievements"
- **废弃 CSS 清理**: 删除 `.home-stats`/`.dc-home-banner`/`.home-rank-hint` 等 3 组死代码（无 JS 引用）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/ui.js` | 修改 — TOUR_STEPS 5 步重写 |
| `js/app.js` | 修改 — Score Guide 积分标签 |
| `js/mastery.js` | 修改 — Guest 提示文案 ×2 |
| `css/style.css` | 修改 — 删除 3 组废弃 CSS |

### 新增
- **fix-hifi-blocks.py**: 高保真 LaTeX 解析器 — 从 QuestionStatement.tex 提取结构化 Block[] + 17 个格式标志，保留原始排版信息
- **export-latex-dryrun.py**: JSON→LaTeX 导出器 — 从 Block[] 重建 LaTeX，支持 raw/blocks/auto 三种模式，含逐字比对验证
- **export-compile-test.py**: 编译验证器 — 导出 LaTeX→XeLaTeX 编译→PDF 大小比对，验证完整闭环
- **data/kp-gen/**: 知识点生成数据（CIE 9 章 + Edexcel + HHK 变体）
- **data/syllabus-edx.json, vocabulary-edx.json**: Edexcel 考纲 + 词汇数据
- **docs/latex-macro-mapping.md, sync-research.md**: LaTeX 宏映射 + 同步研究文档

### 验证结果
- **2025OctNov 12 份试卷**: 317/317 题 100% 逐字匹配（raw + blocks 模式）
- **编译验证**: 12/12 份 PDF 编译通过，大小差异 ≤0.2%（XeLaTeX 非确定性）
- **CIE 修复**: Paper21-Q20 TreeDiagram 图片引用修复（PDF→PNG）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `scripts/fix-hifi-blocks.py` | 新增 — 高保真 LaTeX 解析器 |
| `scripts/export-latex-dryrun.py` | 新增 — JSON→LaTeX 导出+验证 |
| `scripts/export-compile-test.py` | 新增 — 编译闭环验证 |
| `data/kp-gen/*` | 新增 — 知识点生成数据 |
| `data/syllabus-edx.json` | 新增 — Edexcel 考纲 |
| `data/vocabulary-edx.json` | 新增 — Edexcel 词汇 |
| `docs/latex-macro-mapping.md` | 新增 — LaTeX 宏映射 |
| `docs/sync-research.md` | 新增 — 同步研究 |

---

## [4.7.5] - 2026-03-11 — 残余 onclick XSS + 事件监听器泄漏修复

### 安全修复
- **auth.js**: `opt.value` 包裹 `escapeHtml()`（Board 选择按钮）
- **mastery.js**: `cat.id`、`unitKey`、`board.id` 3 处包裹 `escapeHtml()`（分类/单元/考试局折叠）
- **study.js**: `_kpScan.board`、`board` 3 处包裹 `escapeHtml()`（Scan Overview + Focused Study 按钮）
- **homework.js**: `hw.id` 包裹 `escapeHtml()`（作业 banner 点击）
- **vocab-admin.js**: `boardId`/`catId`/`fb.id` 5 处包裹 `escapeHtml()`（词组添加 + 反馈管理）

### Bug 修复
- **spell.js 事件监听器泄漏（P0）**: `renderSpellCard()` 每次调用都新增 keydown 监听器导致重复触发，添加 `_bound` 标志位仅首次绑定

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/auth.js` | 修改 — 1 处 onclick escapeHtml |
| `js/mastery.js` | 修改 — 3 处 onclick escapeHtml |
| `js/study.js` | 修改 — 3 处 onclick escapeHtml |
| `js/homework.js` | 修改 — 1 处 onclick escapeHtml |
| `js/vocab-admin.js` | 修改 — 5 处 onclick escapeHtml |
| `js/spell.js` | 修改 — keydown 监听器 `_bound` 防重复绑定 |
| `js/config.js` | 修改 — `APP_VERSION` → `'v4.7.5'` |

---

## [4.7.4] - 2026-03-11 — onclick XSS 全量转义（第五轮安全审计）

### 安全修复
- **practice.js onclick XSS**: 21 处 onclick 中的动态变量全部包裹 `escapeHtml()`（ppRate/ppShowPaperBrowse/ppMockSetOpt/startPractice 等）
- **syllabus.js onclick XSS**: 23 处 onclick 中的动态变量全部包裹 `escapeHtml()`（openSection/reportSectionModule/editSectionModule/startPractice/startKPScan 等）
- **homework.js onclick XSS**: 4 处 onclick 中的 classId/studentUserId/hwId 全部包裹 `escapeHtml()`
- **admin.js onclick XSS**: 8 处 onclick 中的 classId/grade 全部包裹 `escapeHtml()`
- **syllabus.js prev/next 导航**: `prevSec.id`/`nextSec.id`/`board` 3 个变量补充 `escapeHtml()` 转义

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/practice.js` | 修改 — 21 处 onclick escapeHtml 包裹 |
| `js/syllabus.js` | 修改 — 23 处 onclick escapeHtml 包裹 |
| `js/homework.js` | 修改 — 4 处 onclick escapeHtml 包裹 |
| `js/admin.js` | 修改 — 8 处 onclick escapeHtml 包裹 |
| `js/config.js` | 修改 — `APP_VERSION` → `'v4.7.4'` |

---

## [4.7.3] - 2026-03-11 — 列表视图第四轮修复（12 项）

### 安全修复
- **Board 检测修复**: List Scan 不再依赖 `userBoard` 全局变量（可能为 `null`/`'all'`/`'25m-y7'`），改为从 `_kpData`/`_ppData` 反查每个 item 的实际 board
- **`cl.id` 全量转义**: `data-clid` 和 `id="cl-items-"` 属性统一使用 `_escList()` 转义（与 `data-rm-list` 一致）

### 性能优化
- **Raw data 缓存**: `_listRawCache` 缓存 raw items，sort/page/checkbox 操作不再重复调用 `_getFilteredWords()`/`_getFilteredKPs()`/`_getFilteredPPs()`
- **"Show All" 安全**: 仅在 ≤500 项时显示 "Show All"；"Show 100" 仅在 >100 项时显示

### Bug 修复
- **选中态泄漏**: `renderListView()` 入口清空 `_listSelected` 和 `_listRawCache`，防止跨面板残留
- **CSV 缺列**: 导出 CSV 增加 Section 和 Board 两列

### 体验优化
- **打印状态着色**: 4 种打印的 Status 列改为彩色文字（绿/黄/紫/灰）+ 双语标签
- **预览表头双语**: 清单展开预览表格 Type/Status 表头双语
- **行复选框 aria-label**: 每行复选框 `aria-label` 设为该行 word/ID

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — board 检测重写 + `_detectItemBoard` + `cl.id` 转义 + raw cache + 选中态清空 + CSV 列 + 分页条件 + aria-label + 预览双语（+42 行）|
| `js/storage.js` | 无变更（上轮已修复）|
| `js/worksheet.js` | 修改 — `_printStatus` 彩色标签 + 4 处打印状态替换（+14 行）|
| `js/config.js` | 修改 — `APP_VERSION` → `'v4.7.3'` |

---

## [4.7.2] - 2026-03-11 — 列表视图深度修复（第三轮审计 14 项）

### 安全修复
- **arguments.callee 消除**: Modal 事件绑定改用命名函数 + 最多重试 5 次（防无限循环）
- **搜索输入 XSS**: `_listFilters.search` 注入 value 属性前增加 `_escList()` 转义
- **Session 无上限**: `recordListSession` 每清单最多保留 50 条最新 session（防 localStorage 溢出）

### Bug 修复
- **搜索防抖**: 搜索输入增加 250ms debounce，避免每次按键触发全量重渲染
- **"Show All"不再持久化**: 99999 不写入 localStorage，防止后续访问加载数千行 DOM
- **分页改进**: 去掉 20 页硬上限，改为 prev/next + 滑窗 9 页 + 首末页 + 省略号
- **清单名空格**: 创建/重命名清单时 trim 空白字符，阻止纯空格名称
- **死字段清理**: 移除 `_listFilters.listId`（从未使用）

### 体验优化
- **Session 时间线倒序**: 卡片显示最近 5 次 session（非最旧 5 次）
- **重命名预填名称**: rename prompt 预填当前清单名
- **展开箭头**: 清单卡片标题增加 ▶/▼ 可视箭头指示可展开
- **打印双语表头**: 4 种列表打印（Word/KP/PP/Custom）表头及标题支持中英双语
- **Tab 栏响应式**: 添加 overflow-x:auto + white-space:nowrap 防止手机端换行
- **select-all aria-label**: 全选复选框增加中英双语 aria-label
- **排序列 aria-sort**: 当前排序列增加 `aria-sort="ascending/descending"` 属性

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — 10 项修复（+28 行）|
| `js/storage.js` | 修改 — session 上限 cap（+1 行）|
| `js/worksheet.js` | 修改 — 4 种打印双语表头（+14 行）|
| `css/style.css` | 修改 — 展开箭头样式 + tab 响应式（+4 行）|
| `js/config.js` | 修改 — `APP_VERSION` → `'v4.7.2'` |

---

## [4.7.1] - 2026-03-11 — 列表视图质量修复（第二轮审计 11 项）

### 安全修复
- **inline onclick XSS 消除**: `_renderListScanButtons()` 3 处 `onclick` 改为 `data-action` + `_bindListScanButtons()` 事件委托
- **addlist ID 未转义**: `_showAddToListModal()` 中 `data-addlist` 值增加 `_escList()` 包装

### Bug 修复
- **`getLang()` 不存在**: 10 处调用改为 `appLang !== 'en'`（与 `t()` 函数一致），中文用户不再看到全英文
- **advanceListScan 双击**: 添加 `_listScanAdvancing` 锁变量，防止快速双击跳过 phase
- **`_resolveItemFLM` 返回 undefined**: `_finishListScan` 中 fs 赋值增加 `|| 'new'` fallback
- **Modal 事件绑定竞态**: setTimeout 从 50ms 提升至 150ms + `modal-card` 不存在时自动重试
- **LEVELS[w.level] null 安全**: 增加 typeof/bounds guard 防止越界访问

### 体验优化
- **emoji 按钮 aria-label**: ✏️🗑️🖨️ 按钮添加 `aria-label`（中英双语）
- **分页大小持久化**: `_listPageSize` 存入 localStorage `list_pagesize`
- **清单项删除 toast**: 移除清单项后显示 showToast 提示
- **KP/PP 空 board 提示**: 无可用 board 时显示 empty state 提示文案

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/lists.js` | 修改 — 11 项质量修复（+36 行）|
| `js/study.js` | 修改 — 2 处 `_bindListScanButtons` 调用（+2 行）|
| `js/practice.js` | 修改 — 1 处 `_bindListScanButtons` 调用（+1 行）|
| `js/config.js` | 修改 — `APP_VERSION` → `'v4.7.1'` |

---

## [4.7.0] - 2026-03-11 — FLM 完备性审计 + 自定义清单 + 遗忘追踪 + 列表/打印视图

### 遗忘追踪 (Re-forget Tracking)
- **遗忘日志**: `reforget_log` localStorage 记录所有 mastered→非mastered 降级事件（上限 2000 条）
- **6 个注入点**: recordScan / recordRefreshScan / recordKPRefreshScan / saveKPResult / _ppSetMastery / recordPPRefreshScan
- **查询 API**: `getReforgetLog()` / `getReforgetCount(id)` / `getReforgetTimeline(id)`
- **云同步桥接**: `_reforgetLog` 字段通过 _doSyncToCloud / syncFromCloud 跨设备同步

### 自定义练习清单 (Custom Lists)
- **CRUD 函数**: createCustomList / renameCustomList / deleteCustomList / addItemsToList / removeItemFromList
- **Session 记录**: recordListSession 记录每次清单 Scan 的 FLM 快照
- **全局 FLM**: 清单为引用视图，FLM 状态保持全局不做 per-list 独立
- **云同步桥接**: `_customLists` 字段跨设备同步

### 列表视图面板 (Learning Items Panel)
- **四个 Tab**: Words / Knowledge Points / Past Papers / My Lists
- **7 维筛选引擎**: FLM 状态 / Board / 日期范围 / 遗忘次数 / 搜索 / Section（动态）/ 自定义清单
- **可排序表格**: Word/Status/Section/Last Reviewed/Re-forget 五列可点击排序
- **批量操作**: 多选 → 加入清单 / 导出 CSV / 打印
- **分页控制**: 50/100/All 三档
- **My Lists**: 卡片网格 + Session 历史时间线 + Scan/Rename/Delete/Print 操作
- **清单 Scan**: 链式执行 vocab→KP→PP 分 phase 推进 + 完成后记录 session
- **侧栏/底栏**: 新增 Learning Items 导航入口

### 打印视图 (List Print Views)
- **通用构建器**: `_buildListPrintDoc()` A4 打印文档模板（KaTeX + 自动 print）
- **4 种打印**: printWordList / printKPList / printPPList / printCustomList
- **Session 历史**: 自定义清单打印包含 session 历史表格

### 质量修复（9 项审计 Bug Fix）
- **P0-1**: `_getKPsForSection` 数据结构修复 — `_kpData[board]` 为扁平数组，不再错误访问 `.kps`
- **P0-2**: `getReforgetCount` 性能优化 — 新增 `_reforgetCountMap` 缓存，避免 2000+ 次 JSON.parse
- **P1-1**: List Scan 完整接入 — 4 个 hook 点（vocab/KP/PP 完成+退出）正确链式推进 + 按钮注入
- **P1-2**: Section 筛选下拉 — 动态收集 LEVELS slug / BOARD_SYLLABUS section 构建下拉选项
- **P1-3**: 词汇 `lr` 字段修复 — `getAllWords()` 返回 `lr`（last review），列表视图使用 `lr` 而非 `fmt`
- **P1-4**: 清单项删除按钮 — My Lists 展开表格增加 ✕ 删除列，委托 `removeItemFromList`
- **P2-1**: Tab 切换重置筛选 — 切换 tab 时清空 `_listFilters` 防止跨 tab 筛选残留
- **P2-2**: 遗忘日志 section/board 上下文 — 6 个注入点传入实际 section/board（词汇从 key 提取 slug，KP 从 id 推断 section，PP 从 qid 推断 board）
- **P2-3**: 云同步清理补全 — `_unsyncedKeys` 新增 `reforget_log` + `custom_lists`

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/storage.js` | 修改 — 遗忘追踪 + 自定义清单 + 4 注入点 + 云同步 + `lr` 字段 + section/board 上下文 + 缓存优化（+210 行）|
| `js/practice.js` | 修改 — 遗忘追踪 2 注入点 + PP Scan list hook + board 上下文（+20 行）|
| `js/lists.js` | **新建** — 列表视图面板 + 筛选引擎 + 清单 UI + Section 下拉 + 删除按钮 + Tab 重置（~810 行）|
| `js/study.js` | 修改 — KP Scan list hook 2 处（+18 行）|
| `js/worksheet.js` | 修改 — 4 种打印函数 + 通用构建器（+202 行）|
| `js/ui.js` | 修改 — navTo 'lists' 路由（+1 行）|
| `js/config.js` | 修改 — APP_VERSION v4.7.0 |
| `css/style.css` | 修改 — 列表视图 + 清单卡片 + 暗色 + 响应式 + 打印（+60 行）|
| `index.html` | 修改 — panel-lists + 侧栏/底栏导航 |
| `scripts/minify.sh` | 修改 — lists.js 加入 bundle |

## [4.6.1] - 2026-03-11 — Block-based 结构化编辑器 + Subsubpart 支持

### Block-based 编辑器
- **题干 Block 编辑**: 题干从单一 textarea 改为 Block 列表（text/table/figure/list），每个 block 支持添加/删除/上下移动
- **部件 Block 内容**: Parts/Subparts/Subsubparts 统一使用 Block 列表编辑，支持富内容编排
- **答题线配置**: 所有层级（stem/part/subpart/subsubpart）统一答题线类型选择器（none/number/vector/coordinate/expression/multiline/table_input）
- **实时预览**: 编辑器内所有 block 和答题线变更即时反映到预览区

### Subsubpart 三层嵌套
- **渲染器扩展**: `_ppRenderWithMarksBlocks()` 支持 subpart 下嵌套 subsubparts（第 4 层级）
- **编辑器嵌套**: Part → Subpart → Subsubpart 三层展开/折叠编辑，每层独立 block 内容 + 答题线 + 分数
- **数据合并**: edit merge 和 rollback 增加 `stem` + `answer` 字段支持

### 新增函数（11 个）
- `_ppEdBlockList()` / `_ppEdBlockRow()` / `_ppEdAddBlock()` / `_ppEdMoveBlock()` / `_ppEdCollectBlocks()` — Block 列表 CRUD
- `_ppEdAnswerConfig()` / `_ppEdCollectAnswer()` / `_ppEdAnsTypeChanged()` — 答题线配置
- `_ppEdSubpartRow()` / `_ppEdSubsubpartRow()` / `_ppEdAddSubpart()` / `_ppEdAddSubsubpart()` — 嵌套层级编辑行

### 修改函数（8 个）
- `editPastPaperQ()` — block 编辑器替代 textarea
- `_ppEdPartRow()` — block 内容 + 答题线配置 + subpart 嵌套
- `_ppEdCollectParts()` — 递归收集 parts/subparts/subsubparts + blocks + answers
- `_ppUpdateEditPreview()` — 从 blocks 构建实时预览
- `submitPPEdit()` — 增加 stem + answer 字段
- `_ppRenderWithMarksBlocks()` — subsubpart 渲染
- edit merge loop — 增加 stem + answer 字段合并
- rollback fields — 增加 stem + answer

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/practice.js` | 修改 — 编辑器重写 + 渲染器扩展（+350 行） |
| `css/style.css` | 修改 — block 编辑器 + subsubpart 样式（已含于 v4.6.0） |
| `js/app.bundle.min.js` | 重新构建 |

## [4.6.0] - 2026-03-11 — FLM Scan Preview + 全览模式

### KP Scan Preview + Focused Quiz
- **KP 扫描预览**: Round 1 三按钮快速评估知识点（Know/Fuzzy/Learning），不写 FLM
- **KP 聚焦测验**: Round 2+ 对未掌握 KP 展示 testYourself MCQ 逐题测验
- **多轮筛选**: 每轮结束过滤已掌握项，最多 5 轮自动收敛
- **FLM 写入**: 全部完成后通过 `saveKPResult()` 写入 FLM 状态

### PP Scan Preview + Focused Practice
- **PP 扫描预览**: Round 1 展示题目 parts 概览 + 三按钮评估（Can Do/Unsure/Need Help）
- **PP 聚焦练习**: Round 2+ 完整展示题目 + Show Answer + 自评三按钮（Got it/Partial/Needs Work）
- **cs 累积**: 连续 2 次 Got it 标记 mastered，通过 `_ppSetMastery()` 写入 FLM

### 跨专题全览模式 (Scan Overview)
- **Scan 历史日志**: 每次扫描评分自动记录时间戳（localStorage `scan_log`，上限 5000 条）
- **全览面板**: 跨专题查看所有已扫描项的 FLM 状态，支持三维筛选（类型/状态/模糊次数）
- **日期历史**: 按日期分组查看扫描记录（哪天学了什么，标记了什么）
- **模糊追踪**: 每项显示模糊标记次数 + 最近 8 次评分趋势点
- **聚焦学习**: 从全览面板一键启动针对模糊/不会项的跨专题学习

### Recovery Session 集成
- **新项路由**: Recovery Session 中 new KP/PP 项走 Scan Preview，stale 项走 Refresh Scan

### 入口按钮
- **KP 模块**: 知识点展开区新增「Scan & Quiz / 扫描测验」+ 「Scan Overview / 扫描总览」按钮
- **PP 模块**: Past Papers 操作区新增「Scan & Practice / 扫描练习」按钮

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/study.js` | 修改 — KP Scan 模式 + Scan 历史日志 + 全览模式（+577 行） |
| `js/practice.js` | 修改 — PP Scan 模式（+286 行） |
| `js/syllabus.js` | 修改 — KP/PP 入口按钮 |
| `js/recovery-session.js` | 修改 — new 项走 Scan 路由 |
| `css/style.css` | 修改 — Scan 卡片 + 全览面板样式（+75 行） |
| `js/app.bundle.min.js` | 重新构建 |
| `css/style.min.css` | 重新构建 |

## [4.5.1] - 2026-03-11 — 移除"全部课程"选项

### 变更
- **课程选择**: 移除 "All Courses / 全部课程" 选项，登录页只显示 CIE、Edexcel 和哈罗各年级 7 个选项
- **教师默认**: 新注册教师默认课程从 `all` 改为 `cie`
- **Super Admin**: 仍保留内部 `all` 逻辑（不影响全局可见性）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/config.js` | 修改 — BOARD_OPTIONS 移除 all |
| `js/auth.js` | 修改 — 教师默认 board 改为 cie |
| `js/app.bundle.min.js` | 重新构建 |

## [4.5.0] - 2026-03-11 — 真题结构 v4.0 层级化 Parts + Subparts + List Blocks

### 数据迁移 (papers-cie.json v3.0 → v4.0)
- **层级化重构**: 543 题从扁平 parts 重建为 parent/subpart 层级结构
- **804 个容器 part** 获得 `subparts[]` 数组，共 2,074 个子问题
- **marks 恢复**: marks=0 容器 part 从 1,081 降至 223（仅剩 47 个不匹配题保留 v3.0）
- **List block**: 2 个 `\begin{itemize}` 转为 `{"type":"list","style":"bullet","items":[...]}`
- **安全策略**: 源文件找不到或 part 数量不匹配 → 保留 v3.0 结构不变

### 前端渲染
- **subparts 渲染**: `_ppRenderWithMarksBlocks` 支持容器 part + 缩进子问题 + 独立 marks
- **list block 渲染**: `_ppRenderBlocks` 支持 `<ul class="pp-list">` 列表
- **marks 信息栏**: `_ppPartsInfo` 展开为 `(a)(i) 3 marks · (a)(ii) 4 marks · (b) 3 marks`
- **CSS**: `.pp-subparts` 缩进 + `.pp-subpart-label` 字号 + `.pp-list` 列表样式

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `scripts/migrate-v4.py` | 新增 — v4.0 迁移脚本 |
| `data/papers-cie.json` | 修改 — v3.0 → v4.0 层级化 |
| `js/practice.js` | 修改 — subparts + list 渲染 |
| `js/config.js` | 修改 — APP_VERSION v4.5.0 |
| `css/style.css` | 修改 — subpart + list 样式 |
| `js/app.bundle.min.js` | 重新构建 |
| `css/style.min.css` | 重新构建 |

## [4.4.5] - 2026-03-11 — 真题加载版本兼容修复

### Bug 修复
- **CIE 真题无法打开**: `loadPastPaperData()` 版本检查 `data.v === '2.0'` 不兼容 v3.0 格式，导致整个 JSON 对象被错误包装为 questions，所有真题加载静默失败
- **修复**: 版本检查改为 `if (data.v)` 兼容所有带版本号的格式

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `js/practice.js` | 修复 — loadPastPaperData 版本检查 |
| `js/app.bundle.min.js` | 重新构建 |

## [4.4.4] - 2026-03-11 — Mother Problem 标注试点 Phase 4 + Input Pattern Library

### Mother Problem 标注
- **Paper42 2024MJ 完整标注**: 11 题 → 42 个 unique Mother Problem（5 字段结构）
- **每个 part 标注**: input_pattern + ask_pattern + answer_pattern → mother_problem
- **覆盖 6 大领域**: NUM(5) / GEO(17) / ALG(18) / STAT(4) / PROB(1) / TRIG(3) / REASON(1)
- **发现**: Paper 4 单套卷产出 42 个 unique MP，远超预期的 8-10；但全局会收敛到 120-150

### Input Pattern Library v1
- **22 个 Input Pattern**，5 大类: Visual(6) / Table(4) / Algebraic(5) / Data(3) / Context(4)

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/mother-problem-tagging-paper42-2024mj.json` | 新增 — 完整标注 |
| `data/input-pattern-library.json` | 新增 |

## [4.4.3] - 2026-03-11 — Mother Problem 基础设施 Phase 2-3

### 新增数据文件
- **`data/answer-space-library.json`** — AnswerSpace Library v1（13 模板，覆盖 98.8% 答题格式）
- **`data/ask-pattern-library.json`** — Ask Pattern Library v1（63 问法模式，10 个领域分组）
- **`data/mother-problem-matrix.json`** — Mother Problem 映射矩阵（58 个 Ask+Answer→MP 映射）
- **`scripts/output/paper42-2024mj-tagging.json`** — Paper42 2024MJ 母题标注试点数据

### 数据质量优化
- **prefix/suffix 正规化**: 370 个值清理（`\text{cm}`→`cm`、`x=`→`x =`、`$x$ =`→`x =`、`\degree`→`°`）
- **enrichment 脚本增强**: 新增 `\text{}`/`\overrightarrow{}`/`\vec{}` 清理规则

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/answer-space-library.json` | 新增 |
| `data/ask-pattern-library.json` | 新增 |
| `data/mother-problem-matrix.json` | 新增 |
| `scripts/output/paper42-2024mj-tagging.json` | 新增 |
| `data/papers-cie.json` | 修改 — prefix/suffix 正规化 |
| `scripts/enrich-answers-cie.py` | 修改 — 清理规则增强 |

## [4.4.2] - 2026-03-10 — CIE 真题 Answer 元数据富化 Phase 1

### 数据富化
- **新脚本**: `scripts/enrich-answers-cie.py` — 从源 LaTeX `\AnswerLine[prefix][suffix]` 提取精确 answer 元数据
- **papers-cie.json**: 4,107 题全量扫描，1,991 题 answer 对象富化
  - prefix 添加: 1,020 个（如 `x =`、`d =`、`g⁻¹(x) =`）
  - suffix 添加: 1,253 个（如 `cm`、`cm²`、`°`、`%`、`years`）
  - coordinate 类型: 32 个（含双坐标 `( __ , __ ) and ( __ , __ )`）
  - vector 类型: 20 个（pmatrix 列向量）
  - multiline 类型: 611 个（多变量求解）
  - expression 类型: 83 个（含 or 模式、比例 a:b）
  - table_input 类型: 108 个
- **100% 源文件命中**: 4,107/4,107 题找到对应 QuestionStatement.tex
- **17 个已有手动富化答案全部保留**（merge 策略：非默认值不覆盖）
- **78 个 part 数量不匹配的题目跳过**（安全策略：避免错位赋值）

### 质量报告
- 输出 `scripts/output/enrich-cie-report.json`（含 pattern 分布、mismatch 详情）

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `scripts/enrich-answers-cie.py` | 新增 |
| `scripts/output/enrich-cie-report.json` | 新增 |
| `data/papers-cie.json` | 修改 — answer 对象富化 |

## [4.4.1] - 2026-03-10 — Edexcel Board Key 统一（数据层 `edx`，显示层 `Edexcel`）

### 数据文件
- **重命名**: `syllabus-edexcel.json` → `syllabus-edx.json`、`vocabulary-edexcel.json` → `vocabulary-edx.json`
- **删除**: `knowledge-edexcel.json`（已有 `knowledge-edx.json` 副本）

### JS 数据层统一（~40 处，6 个文件）
- **syllabus.js**: 全局对象 key `edexcel` → `edx`，函数重命名 `loadEdexcelSyllabus` → `loadEdxSyllabus`、`renderEdexcelHome` → `renderEdxHome`，删除 11 处正向桥接 + 2 处反向桥接
- **practice.js**: 删除 3 处 `edexcel→edx` 桥接
- **homework.js**: `<option value>` 改为 `edx`，删除 3 处桥接，添加 3 处旧数据 normalize（`'edexcel'→'edx'`）
- **mastery.js**: 删除 1 处反向桥接，更新函数调用 `renderEdxHome`
- **levels-loader.js**: `_initBoardLevels('edexcel')` → `('edx')`
- **learning-graph.js**: JSDoc 注释更新

### 兼容性
- Supabase `kw_assignments` 历史数据中 `board:'edexcel'` 通过 homework.js 读取时 normalize 兼容
- 显示层所有 "Edexcel" 文本保持不变

### 文件变更
| 文件 | 变更类型 |
|------|---------|
| `data/syllabus-edx.json` | 重命名 |
| `data/vocabulary-edx.json` | 重命名 |
| `data/knowledge-edexcel.json` | 删除 |
| `js/syllabus.js` | ~25 处修改 |
| `js/practice.js` | 3 处修改 |
| `js/homework.js` | ~8 处修改 |
| `js/mastery.js` | 2 处修改 |
| `js/levels-loader.js` | 1 处修改 |
| `js/learning-graph.js` | 1 处修改 |

## [4.4.0-brand] - 2026-03-10 — 品牌升级 ExamHub → Exam Support Hub

### 品牌文案
- **用户可见文案**: 全站 "25Maths ExamHub" → "25Maths Exam Support Hub"
- **域名/仓库名**: 保持 `examhub`（`examhub.25maths.com`、`25maths-examhub`）不变
- **涉及文件**: index.html（title/auth-title/brand-sub）、manifest.json、quiz.js（水印+分享）、ui.js/practice.js/syllabus.js（邮件主题）、sw.js/style.css（注释头）

## [4.4.0] - 2026-03-10 — 真题结构解耦（Block-based + Answer Layout System）

### 数据迁移（scripts/migrate-hierarchical.py）
- **Block-based 内容模型**: `tex` 字符串拆分为 `stem` (Block[]) + `parts[].content` (Block[])
- **Block 类型**: `text`（LaTeX 文本）、`table`（tabular 环境）、`figure`（图片/占位符）
- **Answer Layout System**: `answer` 对象替代 `ansPrefix/ansSuffix/ansTpl`
- **Answer 类型**: number（含 prefix/suffix）、vector、table_input、coordinate、multiline、expression
- **Edexcel 标准化**: 数据层 `{p, m}` → `{label, marks}` 格式统一
- **覆盖**: CIE 4,107 题（1,877/1,886 parts 分割成功）+ Edexcel 1,855 题（742/742）
- **删除字段**: `texHtml`、`ansPrefix`、`ansSuffix`、`ansTpl`（保留 `tex` 供编辑器使用）

### 渲染引擎重写（js/practice.js）
- **`_ppRenderBlocks(blocks, q)`**: Block[] → HTML 渲染（text/table/figure 分发）
- **`_ppRenderTexStr(str)`**: 纯文本渲染（从 `_ppRenderTex` 拆出）
- **`_ppRenderFigureBlock(block, q)`**: 图片 block 渲染（实际图片或占位符）
- **`_ppRenderWithMarksBlocks(q, showAnsLine)`**: 基于 blocks 的新渲染路径
- **`_ppAnswerLine()`**: 支持 answer 对象参数（向后兼容旧 prefix/suffix/tpl 参数）
- **Legacy fallback**: `q.stem` 不存在时自动回退到 `q.tex` 正则分割路径
- **编辑器兼容**: tex 编辑后自动清除 `stem` 强制回退，rollback 同理

### 移除
- **`_ppRenderAnswersModule()`**: 已删除（答题线已内联到每个 part）
- **`ppToggleMS()`**: 已删除
- **`'answers'` 模块**: 从 `_ppDefaultModOrder` 移除（旧 moduleOrder 自动过滤）

### 文件变更
| 文件 | 变更 |
|------|------|
| scripts/migrate-hierarchical.py | **新建** — 数据迁移脚本 |
| data/papers-cie.json | Block-based 层级化 (4,107 题, v3.0) |
| data/papers-edx.json | Block-based 层级化 (1,855 题, v3.0) |
| js/practice.js | 渲染引擎重写 + 移除 answers 模块 |
| js/config.js | APP_VERSION → v4.4.0 |

---

## [4.3.8] - 2026-03-10 — 学生板块锁定 + Year 11→CIE + localStorage 账号隔离

### Part A: 学生板块锁定 + Year 11 映射

#### 学生设置页锁定（js/auth.js）
- **`_isStudentLocked()`**: 已登录 + 非 guest/教师/超管 + 有 classId → 锁定
- **设置页**: 锁定学生隐藏「更换」按钮，显示提示「由学校管理员设定，如需更改请联系老师」

#### Year 11→CIE 映射（js/config.js）
- **`isLevelVisible()`**: `userBoard === '25m-y11'` → 显示 CIE 考纲内容
- **`getVisibleBoards()`**: Y11 用户看到 CIE board

### Part B: localStorage 账号隔离

#### 登出清理（js/auth.js）
- **`doLogout()`**: syncToCloud 后清除 14 个用户数据 key（保留 UI 偏好）
- **清除列表**: wmatch_v3, pp_mastery, pp_wrong_book, pp_exam_history, pp_paper_results, diag_history, wmatch_badges, wmatch_weekly, recovery_schedule, student_profile, 4 个折叠状态

#### 登入清理（js/storage.js）
- **`syncFromCloud()`**: 开头先清除 8 个未同步残留 key，再从云端拉取

#### pp_wrong_book 云同步（js/storage.js）
- **`_doSyncToCloud()`**: 错题本通过 `_ppWrongBook` 桥接字段上传
- **`syncFromCloud()`**: 从云端恢复错题本到 localStorage

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | isLevelVisible + getVisibleBoards Y11→CIE 映射, APP_VERSION → v4.3.8 |
| js/auth.js | _isStudentLocked + 设置页锁定 + doLogout 清除用户数据 |
| js/storage.js | syncFromCloud 登入清理 + pp_wrong_book 云同步桥接 |

---

## [4.3.7] - 2026-03-10 — 首页模块折叠

### 折叠功能（js/mastery.js）
- **`boardCollapsed` 状态**: localStorage 持久化，默认展开
- **`toggleBoard(boardId)`**: 点击 board-header 折叠/展开，带动画
- **四路覆盖**: CIE / Edexcel / HHK 三个考纲板块 + 非考纲通用板块

### CSS（css/style.css）
- `.board-chevron` 箭头（▼ 展开 / ◀ 折叠，旋转动画）
- `.board-body` overflow + opacity transition
- `.board-section.collapsed` 隐藏 body + 收起 header margin
- `.board-header` cursor:pointer + user-select:none

### 文件变更
| 文件 | 变更 |
|------|------|
| js/mastery.js | boardCollapsed + toggleBoard + 4 处 board-header 改造 |
| css/style.css | board 折叠样式 |
| js/config.js | APP_VERSION → v4.3.7 |

---

## [4.3.6] - 2026-03-10 — 修复 texHtml 覆盖编辑内容 bug

### BUG FIX（js/practice.js）
- **texHtml 优先级 bug**: `_ppRenderTex()` 优先用预转换的 `texHtml`，编辑 tex 后旧 texHtml 仍存在导致修改不生效
- **修复**: 编辑 tex 后 `delete q.texHtml`，强制使用新 tex 重新渲染
- **三处修复**: loadPastPaperData merge / submitPPEdit 本地回写 / rollback 回滚

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | 3 处 delete texHtml 修复 |
| js/config.js | APP_VERSION → v4.3.6 |

---

## [4.3.5] - 2026-03-10 — 编辑历史查看 + 回滚

### 版本历史功能（js/practice.js）
- **查看历史**: 编辑器底部「📜 版本历史」按钮，点击从 Supabase 拉取最近 7 个版本
- **预览**: 每个历史版本可预览 tex 内容（显示在预览区，带黄色标识）
- **回滚**: 一键回滚到任意历史版本（confirm 确认 → upsert 覆盖 → 本地即时生效）
- **字段显示**: 每个版本显示时间戳 + 修改过的字段列表

### CSS（css/style.css）
- `.pp-ed-history-list` / `.pp-ed-history-item` / `.pp-ed-history-meta` / `.pp-ed-history-actions` 样式

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | _ppEdToggleHistory + _ppEdPreviewHistory + _ppEdRollback |
| css/style.css | 历史版本列表样式 |
| js/config.js | APP_VERSION → v4.3.5 |

---

## [4.3.4] - 2026-03-10 — 小题编辑器增强

### 小题详情编辑（js/practice.js）
- **题干编辑**: 每个 part 可展开编辑独立题干（LaTeX textarea）
- **表格编辑**: 每个 part 可添加 tabular LaTeX 表格
- **图片编辑**: 每个 part 可设置 figUrl 图片路径
- **答题线**: 每个 part 的 ansPrefix/ansSuffix/ansTpl（沿用 v4.3.3）
- **折叠/展开**: ▼/▲ 按钮切换详情区域，有数据时自动展开

### 渲染扩展（js/practice.js）
- **`_ppInsertPartMarks`**: 每个 part 渲染时追加 part-level tex / table / figure
- **table**: 复用 `_ppConvertTabularRuntime()` 实时转 HTML
- **figure**: 复用 `.pp-fig` 图片样式

### CSS（css/style.css）
- `.pp-ed-part-row` 改为纵向布局（卡片式）
- `.pp-ed-part-head` / `.pp-ed-part-detail` / `.pp-ed-part-field-row` 新增
- `.pp-part-extra-tex` / `.pp-part-extra-table` 渲染样式

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | _ppEdPartRow 重构 + _ppEdTogglePartDetail + _ppEdCollectParts 扩展 + _ppInsertPartMarks 渲染 |
| css/style.css | 小题编辑器卡片式布局 + part 额外内容渲染样式 |
| js/config.js | APP_VERSION → v4.3.4 |

---

## [4.3.3] - 2026-03-10 — 超管题卡模块编辑 + 排序

### 答题线编辑（js/practice.js）
- **Parts 答题线字段**: 每个 part 行新增 ansPrefix / ansSuffix / ansTpl 输入框
- **无 parts 题答题线**: 编辑器中增加题目级 prefix / suffix / template 输入区
- **收集逻辑扩展**: `_ppEdCollectParts()` 收集每个 part 的答题线字段

### 模块排序编辑器（js/practice.js）
- **排序 UI**: 编辑器底部新增 4 行模块排序区（body/answers/vocab/kp），▲/▼ 交换相邻项
- **`_ppEdMoveModule()`**: DOM 层面交换模块行
- **`_ppEdCollectModuleOrder()`**: 读取 DOM 顺序生成模块排列数组

### renderPPCard 模块化重构（js/practice.js）
- **4 个模块渲染函数**: `_ppRenderBodyModule()` / `_ppRenderAnswersModule()` / `_ppRenderVocabModule()` / `_ppRenderKPModule()`
- **按 moduleOrder 循环渲染**: pp-card 内部 4 段代码提取为函数，按 `q.moduleOrder` 排列

### 数据存储扩展（js/practice.js）
- **submitPPEdit**: 收集并保存 ansPrefix / ansSuffix / ansTpl / moduleOrder
- **loadPastPaperData**: merge 扩展支持新字段
- **本地回写**: 编辑后即时更新当前 session 数据

### CSS（css/style.css）
- `.pp-ed-module-list` / `.pp-ed-module-row` 排序编辑器样式
- `.pp-ed-part-ans` 答题线字段行样式

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | 答题线编辑 + 模块排序 UI + submitPPEdit 扩展 + loadPastPaperData merge + renderPPCard 模块化 |
| css/style.css | 排序编辑器 + 答题线字段样式 |
| js/config.js | APP_VERSION → v4.3.3 |

---

## [4.3.2] - 2026-03-10 — 真题展示增强

### 真题布局优化（js/practice.js）
- **BUG FIX**: Edexcel parts 归一化 — `{p:'a', m:1}` → `{label:'(a)', marks:1}`，修复子题渲染崩溃
- **答题线**: practice/browse 模式每个子题（及无子题单体题）末尾追加虚线答题线，模拟真实试卷
- **exam 模式**: 不显示答题线（保持干净考试界面）
- **折叠改名**: Mark Scheme → Answers / 答案（文案更清晰）

### CSS（css/style.css）
- `.pp-answer-line` + `.pp-answer-dots` 答题线样式（flex 布局 + dotted border）
- 暗色模式自动适配（继承 `--c-muted`）

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | parts 归一化 + 答题线渲染 + 答案折叠改名 |
| css/style.css | 答题线样式 |
| js/config.js | APP_VERSION → v4.3.2 |

---

## [4.3.1] - 2026-03-10 — Error Pattern Audit Fix

### 审计发现 & 修复（js/error-patterns.js）
- **BUG FIX**: `secHealth.overall` → `secHealth.score`（.overall 不存在，careless-reading 一直是死代码）
- **规则重构**: method-confusion 从"无知识缺口就触发"改为"无任何信号才触发"（真正的兜底）
- **`diag` 字段利用**: 25m 题目的 diagnostic 标签（calc/concept/vocab/logic）作为弱辅助信号
  - `diag=vocab` → vocab-misunderstanding 0.4 权重（当无 weak vocab 映射时）
  - `diag=concept` → concept-gap 0.4 权重（当无 weak KP 映射时）
  - `diag=calc` → careless-calculation 0.35 权重（当无知识缺口时）
- **置信度校准**: evidence 饱和从 5→8 次，score 饱和从 4→6 分
  - 1-2 次事件 → 始终 low band（不显示强建议）
  - 3 次事件 → MEDIUM（仅显示软建议）
  - 5+ 次事件 → HIGH（可给出确定性建议）
- **method-confusion 权重**: 0.8 → 0.6（降低兜底模式的累计速度）
- **调试工具**: `epDebugTrace()` + `epDebugDumpState()` + `DEBUG_ERROR_PATTERNS` 开关

### 模拟验证（3 类学生 × 999 道错题）
- method-confusion 占比: advanced 45%→22%, mid 33%→21%, new 12%→9%
- 多信号事件: advanced 54%→15%, mid 34%→16%, new 38%→33%
- 置信度红旗: 3 次事件不再达到 HIGH band（0.69→0.50）

---

## [4.3.0] - 2026-03-10 — Confidence Layer & Time Decay

### Error Pattern v2 核心重写（js/error-patterns.js）
- **结构化 v2 状态模型**: `patternStats` 含 persistentScore/recentScore/evidenceCount/confidence/lastSeenAt
- **信号推断**: `inferPatternSignals()` 返回加权信号数组（替代单字符串）
- **更新管线**: `updateErrorPatternState()` — decay → append → stats → recent → confidence 五阶段
- **时间衰退**: `_epApplyDecay()` — 每 7 天 8% 衰减，避免旧数据永久主导
- **置信度计算**: `_epCalculateConfidence()` — 0.45×evidence + 0.40×score + 0.15×recency
- **置信度分带**: `getConfidenceBand()` — high(≥0.65) / medium(≥0.45) / low(<0.45)
- **显示选择器**: `getDisplayPatterns()` → primaryPersistent / secondaryPersistent / recentTrend
- **模式元数据**: `getPatternMeta()` 返回 label + shortHint + solveHabit
- **后向兼容**: `inferErrorPattern()` / `recordErrorPattern()` / `getDominantErrorPatterns()` 包装器保留

### 存储迁移（js/storage.js）
- `_migrateErrorPatternV1toV2()` — v1 global/bySection/recent → v2 patternStats/recentEvents 自动迁移

### 集成升级
- **practice.js**: ppRate 改用 inferPatternSignals → createPatternEvent → updateErrorPatternState 流水线
- **student-profile.js**: 使用 `getDisplayPatterns()` 选择器，显示 persistent + recent trend 两区
- **ai-tutor.js**: Plan Tutor 根据置信带调节语言强度（high=肯定, medium=建议, low=不显示）
- **mistake-coach.js**: Coach 步骤根据置信带切换强/弱措辞 + 新增 concept-gap/method-confusion 步骤
- **worksheet.js**: Print Repair Sheet 置信度门控显示 + solveHabit 输出

### CSS（css/style.css）
- `.ep-high` / `.ep-medium` / `.ep-low` 置信度分带样式 + 暗色适配

### 配置（js/config.js）
- `ERROR_PATTERN_CONFIG` 扩展: recentWindowDays, maxRecentEvents, minEvidenceForDisplay, minConfidenceForStrongAdvice, minConfidenceForWeakAdvice, persistentDecayPer7Days, weights

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +ERROR_PATTERN_CONFIG v2 字段, version→v4.3.0 |
| js/error-patterns.js | 完整重写 v2（362 行） |
| js/storage.js | +v1→v2 迁移 |
| js/practice.js | 信号化记录流 |
| js/student-profile.js | +epDisplay + recent trend |
| js/ai-tutor.js | +epDisplay + 置信带语言 |
| js/mistake-coach.js | +置信带措辞 + 2 新模式 |
| js/worksheet.js | +置信门控 + solveHabit |
| css/style.css | +ep-high/medium/low 样式 |

---

## [4.2.0] - 2026-03-10 — Error Pattern Memory

### Error Pattern 引擎（js/error-patterns.js 新增）
- `inferErrorPattern(q, recovery, meta)` — 5 类错误模式推断规则引擎
  - vocab-misunderstanding（弱词汇明显）
  - concept-gap（弱KP明显）
  - method-confusion（无明显映射/兜底）
  - careless-reading（section 不弱但反复错）
  - careless-calculation（计算信号）
- `recordErrorPattern(q, sectionId, pattern)` — 全局/section 计数 + recent 日志（窗口 20）
- `getDominantErrorPatterns(sectionId)` — 超过阈值(30%)的主要模式 + 按频次排序
- `getErrorPatternLabel/Labels()` — 中英文标签映射
- `renderErrorPatternPills(patterns)` — UI 胶囊标签渲染

### 持久化（js/storage.js）
- `getErrorPatternState()` / `setErrorPatternState()` — 存储在 wmatch_v3.errorPatternMemory

### 集成触点
- **practice.js**: ppRate('needs_work') 时自动推断 + 记录 error pattern
- **student-profile.js**: rebuildStudentProfile 增加 dominantPatterns 字段 + Profile Card 显示
- **ai-tutor.js**: buildTutorContext 增加 errorPatterns + Plan Tutor 根据 dominant pattern 输出针对性建议
- **mistake-coach.js**: Coach 根据 dominant pattern 前置额外步骤（reading/calc/vocab）
- **worksheet.js**: Print Repair Sheet 增加 "Likely Error Pattern" 区块

### CSS（css/style.css）
- `.error-pattern-pills` + `.error-pattern-pill` 胶囊样式 + 暗色适配

### 配置（js/config.js）
- `ERROR_PATTERN_CONFIG` — recentWindow/dominantThreshold/maxPatternTagsOnUI
- `APP_VERSION` → v4.2.0

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +ERROR_PATTERN_CONFIG, version bump |
| js/storage.js | +getErrorPatternState/setErrorPatternState |
| js/error-patterns.js | **新增** ~140 行（推断/记录/查询/渲染） |
| js/practice.js | +ppRate needs_work 时记录 error pattern |
| js/student-profile.js | +dominantPatterns 字段 + Profile Card pills |
| js/ai-tutor.js | +errorPatterns context + pattern-aware tutor |
| js/mistake-coach.js | +pattern-aware step 前置 |
| js/worksheet.js | +Likely Error Pattern 打印区块 |
| css/style.css | +error-pattern-pill 样式 |
| scripts/minify.sh | +error-patterns.js 加入 bundle |
| CLAUDE.md | version + JS load order 30 files |

---

## [4.0.0] - 2026-03-10 — AI Tutor Layer + Mistake Correction Coach

### AI Tutor 规则式引导（js/ai-tutor.js 新增）
- `buildTutorContext()` — 聚合 profile/goals/backlog/streak/trend/weakSections 为统一上下文
- `getPlanTutorMessage()` — Today's Plan 个性化学习建议（趋势/积压/薄弱/连续）
- `getSessionStartTutorMessage(queue)` — 复查开始时显示内容提示 + 激励
- `getSessionEndTutorMessage(results, duration)` — 复查结束时总结 + 目标进度提示
- `getRecoveryPackTutorMessage(q, sectionId, board, recovery)` — Recovery Pack 场景化建议
- `getGoalTutorMessage()` — Goals Card 下方个性化目标行动建议
- `renderTutorBlock(message, scene)` — 统一渲染器，5 种 scene 样式

### Mistake Correction Coach 纠错教练（js/mistake-coach.js 新增）
- `buildMistakeCorrectionCoach(q, sectionId, board)` — 5 条纠错规则引擎
  - Rule 1: vocab-gap（弱词汇 → 复习关键术语）
  - Rule 2: concept-gap（弱KP → 学习核心概念）
  - Rule 3: method-practice（类似题 → 方法巩固）
  - Rule 4: difficulty-note（高分题 → 分步检查）
  - Rule 5: reattempt（复习后重做）
- `renderMistakeCoachBlock(coach)` — Recovery Pack 内纠错步骤 UI（编号圆点 + 图标）
- `renderMistakeCoachForPrint(coach)` — Print Repair Sheet 打印版纠错步骤

### 集成触点
- **Today's Plan** (syllabus.js): Goals Card 后插入 Plan Tutor Block
- **Recovery Session** (recovery-session.js): 开始 toast + 结束延迟 toast
- **Recovery Pack** (practice.js): Tutor Hint + Coach Steps 插入 action buttons 前
- **Print Repair Sheet** (worksheet.js): Coach Steps 插入 Working Area 前
- **Goals Card** (learning-goals.js): Goal Tutor 插入 next hint 前

### CSS（css/style.css）
- `.tutor-block` 系列：紫色主题引导卡片 + pack 场景金色变体 + 暗色适配
- `.mistake-coach-block` 系列：编号圆点 + 步骤布局 + 暗色适配

### 配置（js/config.js）
- `AI_TUTOR_CONFIG` — 4 个场景开关 + maxTutorLines + 图标/标题
- `MISTAKE_COACH_CONFIG` — enabled + maxSteps + coachIcon
- `APP_VERSION` → v4.0.0

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +AI_TUTOR_CONFIG, +MISTAKE_COACH_CONFIG, version bump |
| js/ai-tutor.js | **新增** ~180 行（6 个消息生成器 + 渲染器） |
| js/mistake-coach.js | **新增** ~100 行（5 规则教练 + 2 个渲染器） |
| js/syllabus.js | +Plan Tutor Block 插入 |
| js/recovery-session.js | +session start/end tutor toast |
| js/practice.js | +Recovery Pack tutor hint + coach block |
| js/worksheet.js | +Print coach steps |
| js/learning-goals.js | +Goal Tutor Block 插入 |
| css/style.css | +tutor-block + mistake-coach 样式 |
| scripts/minify.sh | +ai-tutor.js + mistake-coach.js 加入 bundle |
| CLAUDE.md | version + JS load order 29 files |

---

## [3.9.1] - 2026-03-10 — Learning Goals + Goal Explainability & Completion UX

### Learning Goals 系统（js/learning-goals.js 新增）
- `generateDefaultLearningGoals()` — 规则式自动生成 1-2 个 active goals（backlog/section-mastery/streak）
- `computeGoalProgress()` — 计算 backlog/section-mastery/streak 三类目标进度
- `refreshLearningGoals()` — 刷新进度 + 完成检测 + 自动生成替代目标 + 完成 UX
- `applyGoalBias()` — scheduler 轻量偏置（section mastery +6, backlog carry-over +4）
- `renderLearningGoalsCard()` — Goals Card 渲染（title + progress bar + explain + next hint）

### Goal Explainability (v3.9.1)
- `_refreshGoalReasons()` — 每次刷新时更新 goal reasons（含实时数值）
- `getGoalNarrative()` — UI 可直接消费的 goal 描述对象
- Goals Card 每项显示 reasons 解释（为什么是这个目标）
- 新完成目标后显示 "New goal" next hint（24h 内有效）

### Goal Completion UX (v3.9.1)
- `handleGoalCompletion()` — 完成时弹 toast
- Recovery Session 结束后自动触发 `refreshLearningGoals()` 检测完成
- `lastGoalTransition` 记录目标衔接信息

### Scheduler 集成（js/recovery-scheduler.js）
- `buildDailyRecoveryPlan()` 新增 goal bias 步骤（profile bias 之后）

### 持久化（js/storage.js）
- `getLearningGoalsState()` / `setLearningGoalsState()` — 存储在 wmatch_v3.learningGoals

### 配置（js/config.js）
- `LEARNING_GOALS_CONFIG` — 8 个参数（maxActiveGoals/targets/thresholds/UX 开关）
- `APP_VERSION` → v3.9.1

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +LEARNING_GOALS_CONFIG, version bump |
| js/storage.js | +getLearningGoalsState/setLearningGoalsState |
| js/learning-goals.js | **新增** ~230 行（goal 生成/进度/刷新/渲染/bias/completion） |
| js/recovery-scheduler.js | buildDailyRecoveryPlan +goal bias 步骤 |
| js/recovery-session.js | session end 后触发 refreshLearningGoals |
| js/syllabus.js | Today's Plan 插入 Goals Card |
| css/style.css | +learning-goals-card/goal-item/progress/explain + dark mode |
| scripts/minify.sh | +learning-goals.js in bundle |

---

## [3.8.1] - 2026-03-10 — Personalized Explainability

### 结构化解释引擎（js/recovery-scheduler.js）
- `buildPersonalizationReasons(profile, budget, caps)` — 根据实际生效的个性化调整生成因果解释列表
- 6 种 reason key：backlog / skip-rate / improving / strong-recovery / weak-type / weak-section / declining
- plan 输出升级为 `personalization: { note, reasons[] }` 结构
- Debug 日志增加 profile/budget/reasons 输出

### Today's Recovery 解释块（js/syllabus.js）
- 替换单行 personalized note 为结构化 `.plan-card-explain` 块
- 显示 "Why this plan" 标题 + 最多 2 条因果解释
- 保留 v3.8.0 单行 note 作为 fallback

### Session 完成 toast 增强（js/recovery-session.js）
- 优先使用结构化 personalization reasons 替代固定 focus 文案
- 最多 2 条原因拼接到完成 toast

### 配置（js/config.js）
- `RECOVERY_EXPLAINABILITY_CONFIG.maxReasonsOnCard` — 卡片最大显示条数（默认 2）
- `RECOVERY_EXPLAINABILITY_CONFIG.maxReasonsOnSummary` — toast 最大条数（默认 2）
- `APP_VERSION` → v3.8.1

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +RECOVERY_EXPLAINABILITY_CONFIG, version bump |
| js/recovery-scheduler.js | +buildPersonalizationReasons, plan.personalization 结构, debug 增强 |
| js/syllabus.js | Today's Recovery explain block 替换单行 note |
| js/recovery-session.js | session end toast 使用结构化 reasons |
| css/style.css | +plan-card-explain / explain-title / explain-item + dark mode |

---

## [3.8.0] - 2026-03-10 — Personalized Scheduling

### 个性化调度引擎（js/recovery-scheduler.js）
- `getProfileAdjustedBudget(baseBudget, profile)` — 根据 trend/recovery rate/skip rate/backlog 动态调整 maxUnitsPerDay
- `getProfileAdjustedTypeCaps(baseCaps, profile)` — weak type 对应类型配额 +1
- `applyProfileBias(units, profile)` — weak section +8 / weak type +5 优先级偏置
- `_inferPersonalizationNote(budget, caps, profile)` — 生成个性化说明 key
- `_enforceDailyBudget()` 升级支持动态 budget/caps 参数传入
- `buildDailyRecoveryPlan()` 新流程：skip penalty → profile bias → sort → adjusted budget/caps → enforce

### Student Profile Summary（js/student-profile.js）
- `getStudentProfileSummary()` — 输出 scheduler 可直接消费的轻量结构（recoveryRate/skipRate/weakSections/learningTrend/backlogPressure/weakType）
- `inferWeakType(profile)` — 按 vocab/kp/pp mastery 最低者推断弱类型

### 个性化说明 UI（js/syllabus.js）
- Today's Recovery 卡片新增 `.plan-card-personalized` 行
- 3 种文案：lighter-load / weak-type-bias / weak-section-bias

### 配置（js/config.js）
- `RECOVERY_PERSONALIZATION_CONFIG` — 12 个个性化参数（budget 调整幅度/偏置权重/阈值）
- `APP_VERSION` → v3.8.0

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +RECOVERY_PERSONALIZATION_CONFIG, version bump |
| js/recovery-scheduler.js | +4 个性化函数, _enforceDailyBudget 支持动态参数, buildDailyRecoveryPlan 接入 profile |
| js/student-profile.js | +getStudentProfileSummary, +inferWeakType |
| js/syllabus.js | Today's Recovery 增加 personalized note |
| css/style.css | +plan-card-personalized + dark mode |

---

## [3.7.0] - 2026-03-10 — Student Recovery Profile

### Student Profile Card（js/student-profile.js 新增）
- `rebuildStudentProfile()` 主聚合器，5 分钟缓存 TTL + localStorage 持久化
- 4 维指标：Accuracy%（calcSummaryStats）、Mastery%（vocab+KP+PP FLM 计数）、Streak、Recovery%（scheduler history）
- `_computeProfileWeakSections()` 遍历 BOARD_SYLLABUS，getSectionHealth < 40 的 section 标为 weak
- `_computeProfileTrend()` 近 7d vs 前 7d accuracy delta → up/stable/down 趋势判断
- `renderStudentProfileCard()` 渲染到 Today's Plan 区域：header + trend pill + 2×2 metrics + weak pills

### 降级策略
- activeDays=0 且 totalWords=0 → 不渲染卡片
- trend 数据不足（< 3 天活跃）→ 不显示 trend pill
- recovery history 为空 → 第 4 格显示 Active Days 替代 Recovery%
- weak sections 为空 → 不显示 Needs work 行

### Cache Invalidation（5 处触发点）
- study.js: `_finishRefreshScan()` / `_finishKPRefreshScan()` 结束后 reset cache
- practice.js: `ppRate()` / `_finishPPRefreshScan()` 结束后 reset cache
- recovery-session.js: `_endRecoverySession()` 结束后 reset cache

### 配置（js/config.js）
- `STUDENT_PROFILE_CONFIG.cacheTTL` — 缓存有效期（默认 5 分钟）
- `STUDENT_PROFILE_CONFIG.weakThreshold` — weak section 阈值（默认 40）
- `STUDENT_PROFILE_CONFIG.maxWeakSections` — 最多显示 weak 数（默认 3）
- `STUDENT_PROFILE_CONFIG.trendDays` — 趋势对比天数（默认 7）
- `APP_VERSION` → v3.7.0

### 公共 API（js/recovery-scheduler.js）
- `getRecoveryScheduleHistory()` 返回完整 scheduler history 数组

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +STUDENT_PROFILE_CONFIG, version bump |
| js/recovery-scheduler.js | +getRecoveryScheduleHistory() |
| js/student-profile.js | **新增** ~200 行，profile 计算 + 渲染 |
| js/syllabus.js | Today's Plan 插入 Profile Card |
| js/study.js | 2 处 finish 后 invalidate cache |
| js/practice.js | 2 处 finish 后 invalidate cache |
| js/recovery-session.js | session end 后 invalidate cache |
| css/style.css | +student-profile-card/metrics/trend/weak + dark mode |
| scripts/minify.sh | +student-profile.js in bundle |

---

## [3.6.1] - 2026-03-10 — Carry-over UX + Recovery Calendar Lite

### Carry-over 可视化（js/syllabus.js）
- Today's Recovery 卡片新增 fresh/carry-over 拆分行："N new · N carried over"
- `splitTodayPlanItems(plan)` 将计划项分为新鲜 vs 结转两组

### Recovery Calendar Lite（7 天迷你日历）
- `getRecentRecoveryHistory(days)` 返回最近 N 天复查历史（日期/星期/计划/完成/有数据）
- Today's Recovery 卡片底部渲染 7 天圆点日历（done=绿 / partial=黄 / missed=红 / empty=灰）
- CSS：`.recovery-calendar-lite` / `.recovery-day` 4 状态 + 暗色模式

### 历史记录增强（js/recovery-scheduler.js）
- `finalizeRecoverySchedule(completedTypes, meta)` 接受 meta 参数（total/completed/durationSec）
- history 条目新增 `total`, `completed`, `carryOverOut`, `durationSec` 字段

### 配置（js/config.js）
- `RECOVERY_CALENDAR_CONFIG.recentDays` — 日历天数（默认 7）
- `RECOVERY_CALENDAR_CONFIG.showEmptyDays` — 是否显示无数据日（默认 true）
- `APP_VERSION` → v3.6.1

### 文件变更
| 文件 | 变更 |
|------|------|
| js/config.js | +RECOVERY_CALENDAR_CONFIG, version bump |
| js/recovery-scheduler.js | +splitTodayPlanItems, +getRecentRecoveryHistory, finalizeRecoverySchedule enriched |
| js/recovery-session.js | _endRecoverySession passes meta to finalize |
| js/syllabus.js | Today's Recovery card: fresh/carry-over split + Calendar Lite |
| css/style.css | +plan-card-split, +recovery-calendar-lite, +dark mode overrides |

## [3.6.0] - 2026-03-10 — Adaptive Scheduling

### Recovery Scheduler（js/recovery-scheduler.js 新增）
- `buildDailyRecoveryPlan(board)` — 基于 Priority Engine 输出生成受 budget 约束的今日复查计划
- `_enforceDailyBudget(units)` — 按总量(10)/词汇(5)/KP(3)/PP(4)上限截断，溢出进 backlog
- `_mergeWithBacklog(freshUnits, backlog)` — 合并新鲜评分单位与历史 backlog，保留 skippedCount
- `_applySkipPenalty(unit)` — 跳过惩罚：每次跳过 +5 分，越拖优先级越高
- `dailyPlanToSessionQueue(plan)` — 将今日计划转为 Recovery Session queue 格式
- `finalizeRecoverySchedule(completedTypes)` — Session 结束时结算：完成的移除，未完成进 backlog
- `getTodayRecoveryPlan(board)` — 获取今日计划（同日缓存避免抖动）
- `invalidateRecoveryPlanCache()` — 学习活动后失效缓存

### 持久化（localStorage `recovery_schedule`）
- 独立 localStorage key，不侵入 `wmatch_v3` 主存储
- 结构：`{date, backlog[], history[]}`
- backlog 条目保留 `skippedCount` + `carryOver` 标记
- history 保留最近 30 天轻量摘要

### Session 集成（js/recovery-session.js）
- `buildRecoverySession()` — 三层降级：scheduler → smart queue → legacy
- `_endRecoverySession()` — 结束时调用 `finalizeRecoverySchedule()` 结算
- `skipRecoverySession()` — 中途退出时也结算（未完成项进 backlog）

### Today's Plan 升级（js/syllabus.js）
- 卡片标题升级为 "Today's Recovery / 今日复查"
- 显示 scheduler 计划的任务量（而非全部 stale 总量）
- 新增 carry-over 提示行："N 项结转自昨日"
- 新增 backlog 提示行："N 项在待办列表中"
- 保留 Focus 原因行（复用 v3.5.1 explainability）
- 降级安全：scheduler 不可用时回退到原 Start Recovery 卡片

### 可配置参数（js/config.js）
- `RECOVERY_SCHEDULER_CONFIG.maxUnitsPerDay` — 每日总上限（默认 10）
- `RECOVERY_SCHEDULER_CONFIG.maxVocabPerDay` — 词汇上限（默认 5）
- `RECOVERY_SCHEDULER_CONFIG.maxKPPerDay` — KP 上限（默认 3）
- `RECOVERY_SCHEDULER_CONFIG.maxPPPerDay` — PP 上限（默认 4）
- `RECOVERY_SCHEDULER_CONFIG.skipPenaltyStep` — 跳过惩罚步长（默认 5 分/次）
- `RECOVERY_SCHEDULER_CONFIG.maxCarryOverDays` — backlog 最大保留跳过次数（默认 7）

### 样式（css/style.css）
- `.plan-card-carryover` — 12px 警告色，carry-over 提示
- `.plan-card-backlog` — 11px 次要色，backlog 提示
- 暗色模式适配

### 文件变更
| 文件 | 变更 |
|------|------|
| js/recovery-scheduler.js | **新增** — Adaptive Scheduler 8 个核心函数 |
| js/recovery-session.js | 三层降级 + session 结束/跳过时 finalize scheduler |
| js/syllabus.js | Today's Plan 卡片升级为 scheduler-driven + 降级回退 |
| js/config.js | + RECOVERY_SCHEDULER_CONFIG + APP_VERSION → v3.6.0 |
| css/style.css | + .plan-card-carryover / .plan-card-backlog 样式 |
| scripts/minify.sh | + recovery-scheduler.js 加入 bundle |
| CLAUDE.md | JS 文件数 25→26，load order 更新 |

---

## [3.5.1] - 2026-03-10 — Priority Explainability

### Reason 结构升级（js/recovery-priority.js）
- `computeRecoveryPriority()` — reason 从字符串数组升级为结构化对象 `{key, weight, label}`，label 双语
- `getRecoveryReasonLabels(unit)` — 提取 unit 的人类可读理由标签数组
- `summarizeRecoveryReasons(units)` — 汇总多个 unit 的 topReasons（按最大 weight 降序）
- `getLastSmartQueueSummary()` — 获取最近一次 smart queue 构建的理由摘要
- `_lastSmartUnits` — 缓存最近评分后的 units，供 explainability 查询
- Debug logging: `RECOVERY_EXPLAIN_DEBUG = true` 时 console.group 输出前 10 个 unit 的评分明细

### Today's Plan 卡片推荐原因（js/syllabus.js）
- Recovery Session 卡片下方新增 `plan-card-reason` 行：显示前 2 个优先理由
- 渲染前调用 `buildSmartRecoveryQueue()` 预构建缓存，确保理由可用
- 降级安全：smart engine 不可用时不渲染理由行

### Session 完成 Toast 增强（js/recovery-session.js）
- `startRecoverySession()` — 启动时捕获 `summaryReasons`（前 2 条理由标签）
- `_endRecoverySession()` — toast 末尾追加 "Focus: 理由1, 理由2"

### 样式（css/style.css）
- `.plan-card-reason` — 12px 次要文字色，4px 上间距
- 暗色模式 `.plan-card-reason` 使用 `--c-muted`

### 配置（js/config.js）
- `RECOVERY_EXPLAIN_DEBUG` — 调试开关（默认 false），开启后 console 输出评分明细
- `APP_VERSION → v3.5.1`

### 文件变更
| 文件 | 变更 |
|------|------|
| js/recovery-priority.js | reason 结构化 + 3 个 explainability helper + debug log + units 缓存 |
| js/recovery-session.js | summaryReasons 捕获 + end toast 增强 |
| js/syllabus.js | Today's Plan 卡片 reason 预览 + smart queue 预构建 |
| css/style.css | + .plan-card-reason 样式 + 暗色适配 |
| js/config.js | + RECOVERY_EXPLAIN_DEBUG + APP_VERSION → v3.5.1 |

---

## [3.5.0] - 2026-03-10 — Smart Recovery Ordering

### Priority Engine（js/recovery-priority.js 新增）
- `collectRecoveryUnits(board)` — 收集三类过期项（词汇/KP/PP），统一为 RecoveryUnit 结构
- `computeRecoveryPriority(unit)` — 4 维评分：errorWeight(0-45) + decayWeight(0-35) + examWeight(0-20) + healthPenalty(0-15)
- `sortRecoveryUnits(units)` — 按 priorityScore 降序排列，tie-breaker: decayWeight → examWeight
- `groupRecoveryUnitsByType(units, board)` — 按类型聚合为连贯批次，批次顺序由各类最高分决定
- `buildSmartRecoveryQueue(board)` — 主入口：collect → score → sort → group

### 评分数据来源
- Error Weight: vocab 用 ok/fail 错误率，KP 用 kpDone ok/fail，PP 用 cs 代理信号
- Decay Weight: daysSince 减去 REFRESH_INTERVALS 阈值后按 bucket 映射（0/8/16/26/35）
- Exam Weight: ppGetSectionStats().total 题量映射，默认 8 分
- Health Penalty: getSectionHealth().score 按 40/60/80 三档映射（15/10/5/0）

### 可配置参数（js/config.js）
- `RECOVERY_PRIORITY_CONFIG.maxUnits` — 最大评分单位数（默认 30）
- `RECOVERY_PRIORITY_CONFIG.decayBuckets` — 衰退天数→分数映射表
- `RECOVERY_PRIORITY_CONFIG.healthPenalty` — Section 健康度→惩罚分映射表
- `RECOVERY_PRIORITY_CONFIG.defaultExamWeight` — 无法获取题量时的默认考试权重

### Session 集成（js/recovery-session.js）
- `buildRecoverySession()` — 优先走 `buildSmartRecoveryQueue()`，失败自动 fallback 到固定顺序
- `_buildLegacyRecoverySession()` — 原有 vocab→kp→pp 固定顺序逻辑保留为降级方案
- Session 执行层完全不变：step bar、Next/Exit、finish hooks、结果面板

### Explainability（调试用，本版不展示给用户）
- 每个 RecoveryUnit 带 `reason[]` 数组，标注高错误率/长时间衰退/高考试权重/弱章节等原因
- Queue 条目带 `_smart: true` 和 `_score` 字段，便于区分智能排序 vs 降级排序

### 文件变更
| 文件 | 变更 |
|------|------|
| js/recovery-priority.js | **新增** — Priority Engine 10 个函数 |
| js/recovery-session.js | buildRecoverySession 重构为 smart+fallback 双路径 |
| js/config.js | + RECOVERY_PRIORITY_CONFIG 配置对象 + APP_VERSION → v3.5.0 |
| scripts/minify.sh | + recovery-priority.js 加入 bundle（worksheet 之后、recovery-session 之前） |
| CLAUDE.md | JS 文件数 24→25，load order 更新 |

---

## [3.4.1] - 2026-03-10 — Recovery Session UX Polish

### 步骤指示条（recovery-session.js + css/style.css）
- `_renderRecoveryStepBar()` — 生成步骤进度条（Vocabulary › KP › PP），当前高亮，已完成划线
- `_getRecoveryStepLabel(type)` — 类型→双语标签映射
- `.recovery-step-bar` 样式 + 暗色模式适配

### Session-Aware 结果面板按钮（recovery-session.js）
- `_renderRecoveryResultButtons()` — 替换默认按钮为 "Next: X →" / "Finish Recovery" + "Exit Recovery"
- `_recordRecoveryResult(resultType)` — 记录结果但不推进（取代原 _advanceRecoverySession 的双重职责）
- `_advanceRecoverySession()` — 简化为纯推进（由按钮触发，不再自动跳过结果面板）
- `_advanceRecoveryFromResult()` / `_finishRecoveryFromResult()` / `_exitRecoveryFromResult()` — 按钮 handler

### Finish Hook 改造（study.js + practice.js）
- `_finishRefreshScan()` — 不再 return 跳过结果面板，改为正常渲染后替换 .result-actions 为 session 按钮
- `_finishKPRefreshScan()` — 同上
- `_finishPPRefreshScan()` — 同上（practice.js）

### Render 注入步骤条（study.js + practice.js）
- `_renderRefreshCard()` — topbar 后注入 recovery step bar
- `_renderKPRefreshCard()` — 同上
- `_renderPPRefreshCard()` — 同上（practice.js）

### 文件变更
| 文件 | 变更 |
|------|------|
| js/recovery-session.js | + 7 个 UI 辅助函数，_advanceRecoverySession 拆分为记录+推进两阶段 |
| js/study.js | + vocab/KP finish hook 改为结果面板+按钮替换，render 注入步骤条 |
| js/practice.js | + PP finish hook 改为结果面板+按钮替换，render 注入步骤条 |
| css/style.css | + .recovery-step-bar 步骤指示条样式 |
| js/config.js | APP_VERSION → v3.4.1 |

## [3.4.0] - 2026-03-10 — Recovery Session MVP

### Recovery Session 引擎（js/recovery-session.js 新增）
- `buildRecoverySession()` — 检测三类过期项（词汇/KP/PP），构建 queue 带 board 上下文
- `startRecoverySession()` — 启动 session，防重复点击 toast 保护
- `_runCurrentRecoveryItem()` — 按 type 调度到 startRefreshScan / startKPRefreshScan / startPPRefreshScan
- `_advanceRecoverySession(resultType)` — 完成一步后自动推进下一步（RECOVERY_ADVANCE_DELAY 800ms）
- `_endRecoverySession()` — 全部完成后 navTo('plan') + summary toast（N 轮扫描完成 + 用时）
- `isRecoverySessionActive()` / `skipRecoverySession()` — 状态查询 + 静默终止
- 异常安全：start 函数不可用或抛异常时自动 skip 并继续

### Finish Hook（auto-advance，不改原有 UI）
- `_finishRefreshScan()` (study.js) — session active 时跳过结果面板，直接推进
- `_finishKPRefreshScan()` (study.js) — 同上
- `_finishPPRefreshScan()` (practice.js) — 同上
- 非 session 模式下完全不受影响，保持原有结果面板 + 按钮

### Today's Plan 集成（syllabus.js）
- 新增 "Start Recovery / 一键复查" 卡片，显示过期项分类汇总（N 词 + N 知识点 + N 题）
- 条件：typeCount > 1 时才显示（单种过期用独立刷新按钮即可）
- delegation 新增 `data-action="start-recovery"`

### 导航中断检测（ui.js）
- `navTo()` 顶部加 recovery session 终止守卫
- session 进行中用户 nav 到非 scan panel 时自动 skipRecoverySession()

### 样式（css/style.css）
- `.recovery-session-card` — 左边框高亮 + 轻背景色 + 暗色模式适配

### 文件变更
| 文件 | 变更 |
|------|------|
| js/recovery-session.js | **新增** — Session 状态机 8 个函数 |
| js/study.js | + 两个 finish hook（vocab + KP） |
| js/practice.js | + PP finish hook |
| js/syllabus.js | + Start Recovery 卡片 + delegation |
| js/ui.js | + navTo session 中断检测 |
| js/config.js | APP_VERSION → v3.4.0 |
| css/style.css | + .recovery-session-card 样式 |
| scripts/minify.sh | + recovery-session.js 加入 bundle |
| sw.js | CACHE_VERSION → v3.4.0 (auto-sync) |

---

## [3.3.0] - 2026-03-09 — Print Repair Sheet MVP

### 单题打印修复单（js/worksheet.js 新增）
- `buildRepairWorksheet(q, sectionId, board)` — 组装 worksheet model（复用 getRecoveryCandidates + getSectionInfo）
- `renderRepairWorksheet(ws)` — 生成完整 A4 printable HTML（内嵌 CSS + KaTeX CDN）
- `printRepairWorksheet(q, sectionId, board)` — 新窗口打开 → KaTeX 渲染 → window.print()
- `createWorksheetId()` — 本地唯一 ID（WS-YYYYMMDD-HHMMSS-NN）

### 打印页内容结构
- Header（25Maths 品牌 + Worksheet ID + 日期）
- Meta（Question ID、Board、Chapter、Section、Marks、Source）
- Related Vocabulary（词汇 + 释义 + FLM 状态文本）
- Related Knowledge Points（KP 标题 + 中文 + 状态）
- Question（复用 _ppRenderWithMarks + _ppRenderFigures + KaTeX 渲染）
- Working Area（大块留白供纸面演算）
- Error Analysis（7 项复选框：Vocabulary/Concept/Method/Misread/Calculation/Careless/Other）
- Correction Summary（三行：Correct method / My mistake / Next time）
- Footer（ID 回显 + "Use Question ID to find this item in 25Maths" 提示）

### Recovery Pack 集成
- Recovery Pack actions 新增 `Print Repair Sheet` 按钮
- delegation 新增 `recoverPrint` action

### 技术要点
- 新窗口方案，不污染 SPA
- print 样式完全内嵌在打印 HTML 中，不改主站 CSS
- KaTeX onload 后 renderMathInElement → setTimeout 300ms → window.print()
- 弹窗被拦截时 showToast 提示
- questionHtml 兜底：渲染失败时显示 "Question content unavailable"

### 文件变更
| 文件 | 变更 |
|------|------|
| js/worksheet.js | **新增** — 4 个函数 + 完整 A4 打印模板 |
| js/practice.js | + Print 按钮 + recoverPrint delegation |
| js/config.js | APP_VERSION → v3.3.0 |
| scripts/minify.sh | + worksheet.js 加入 bundle |
| CLAUDE.md | JS 文件数 23 + load order 更新 |
| sw.js | CACHE_VERSION → v3.3.0 (auto-sync) |

---

## [3.2.1] - 2026-03-09 — Recovery Pack 交互式修复建议

### Recovery Pack（practice.js）
- `ppRate('needs_work')` 不再自动跳转，改为在当前题下方展开 Recovery Pack 卡片
- `_ppShowRecoveryPack(q)` 渲染三区块：弱词汇（≤5）+ 弱知识点（≤2）+ 类似题目（≤3）
- 每个 item 可点击跳转：`openDeck` / `openKnowledgePoint` / `ppReviewWrongItem`
- `_ppRecoverySkip()` Skip 按钮恢复原自动跳转行为，含防双击保护
- 顶部解释文案：`"这道题被标记为需要加强，系统为你生成了修复建议"`
- FLM 状态同时显示 emoji 徽标 + 文本标签（learning/uncertain/new）
- recoverVocab 按钮携带 `data-word` 字段为后续定位到具体词预留
- 旧 pack 在每次渲染前先 remove，避免连续 needs_work 时 DOM 残留
- `partial` / `mastered` 评分保持原行为（300ms 自动跳转）

### 错题本列表 hint 优化
- recovery-hint 末尾新增 `→ view recovery` / `查看修复建议` 引导文本
- 引导学生进入单题查看完整 Recovery Pack

### 委托事件
- pastpaper panel delegation 新增 4 个 action：recoverVocab / recoverKP / recoverQuestion / recoverSkip

### CSS
- `.recovery-pack` 系列样式（header / why / section / label / item / actions）
- `.recovery-pack-item:focus-visible` 键盘可访问性
- `.recovery-pack-item strong { word-break: break-word }` 防长词溢出
- `.recovery-fs-label` FLM 状态文本标签
- `.recovery-hint-cta` 错题本列表引导文本样式

### 文件变更
| 文件 | 变更 |
|------|------|
| js/practice.js | + ppRate 拦截 + _ppShowRecoveryPack + _ppRecoverySkip + 4 delegation + hint cta |
| css/style.css | + 14 条 Recovery Pack 样式 |
| js/config.js | APP_VERSION → v3.2.1 |
| sw.js | CACHE_VERSION → v3.2.1 (auto-sync) |

---

## [3.2.0] - 2026-03-09 — Learning Graph 查询层 + Recovery Pack Hook

### Learning Graph 查询层（js/learning-graph.js 新增）
- 6 个运行时查询函数，基于 section code 连接 questions ↔ vocabulary ↔ knowledge points
- `getQuestionVocabLevels(qid, sectionId, board)` — 题目→相关词汇级别
- `getQuestionKPs(sectionId, board)` — 题目→相关知识点（含 FLM 状态）
- `getKPQuestions(kpId, board)` — 知识点→相关题目（PP + MCQ）
- `getVocabQuestions(vocabSlug, board)` — 词汇→相关题目
- `getRecoveryCandidates(qid, sectionId, board)` — 错题→弱词汇 + 弱知识点 + 兄弟题
- `getSectionGraph(sectionId, board)` — Section 完整关系概览
- 纯只读层，不写任何状态，所有数据依赖已加载的全局变量

### PP 题详情页 — Related Knowledge Points（practice.js）
- 练习模式 PP 题卡新增 "Related Knowledge Points" 折叠区（复用 pp-ms-toggle 模式）
- 每个 KP 显示 FLM 状态徽标（⚪ new / 🟢 learning / 🟡 uncertain / ✅ mastered）
- `ppToggleKP()` + delegation 注册

### 错题本 — Recovery Hint（practice.js）
- 每个错题项底部显示恢复提示（弱词汇 + 弱知识点名称）
- 数据来自 `getRecoveryCandidates()`，弱词汇≤3 + 弱知识点≤2

### KP 详情页 — Related Questions 统计（syllabus.js）
- ⑤ Related Resources 区域新增题目数量统计（PP 真题 + MCQ 练习题）
- 数据来自 `getKPQuestions()`

### 文件变更
| 文件 | 变更 |
|------|------|
| js/learning-graph.js | **新增** — 6 个查询函数 + 2 个内部 helper |
| js/practice.js | + Related KPs 折叠区 + ppToggleKP + 错题 Recovery Hint |
| js/syllabus.js | + KP 详情页 Related Questions 统计 |
| css/style.css | + .pp-kp-badge, .recovery-hint, .kp-related-qs-info |
| js/config.js | APP_VERSION → v3.2.0 |
| scripts/minify.sh | + learning-graph.js 加入 bundle |
| sw.js | CACHE_VERSION → v3.2.0 (auto-sync) |

---

## [3.1.0] - 2026-03-09 — 统一 Learning Unit API + 质量修复

### PP 云同步（HIGH fix）
- `_doSyncToCloud()` 嵌入 `_ppMastery` 桥接字段到 `vocab_progress.data`
- `syncFromCloud()` 提取并恢复 pp_mastery（防御性 typeof 检查）
- `_ppSetMastery()` + `recordPPRefreshScan()` 新增 `debouncedSync()` + `invalidateCache()`
- **注**：`_ppMastery` 为过渡桥接字段，v3.2+ 统一 unit storage 时迁出

### ppGetWeakGroups 字段修复（MEDIUM fix）
- `qm.m === 'mastered'` → `(qm.fs || qm.m) === 'mastered'`（FLM 字段 + 旧数据 fallback）

### rc 字段上限（MEDIUM fix）
- 新增 `MAX_RC = REFRESH_INTERVALS.length - 1` 常量
- `recordRefreshScan` / `recordKPRefreshScan` / `recordPPRefreshScan` 三处 rc cap

### KP/PP src 追踪（LOW fix）
- `recordKPRefreshScan` fuzzy/unknown → `src: 'reflow'`
- `recordPPRefreshScan` fuzzy/unknown → `src: 'reflow'`
- `_ppSetMastery` 写入 `src: source || prev.src || ''`

### PP 计入每日活动（LOW fix）
- `_ppSetMastery()` + `recordPPRefreshScan()` 调用 `recordDailyHistory(null)` 计入 entry.a++

### 统一 Learning Unit Dispatcher
- `recordUnitAnswer(type, id, verdict)` — 过渡分发器，路由到现有 per-type recorders
- `getStaleUnits(board)` — 聚合 vocab/kp/pp stale 列表 + total 计数

### 文件变更
| 文件 | 变更 |
|------|------|
| config.js | + MAX_RC, APP_VERSION → v3.1.0 |
| storage.js | PP 云同步桥接 + rc cap + KP src/history + recordUnitAnswer + getStaleUnits |
| practice.js | _ppSetMastery 副作用 + recordPPRefreshScan 增强 + ppGetWeakGroups fix |
| sw.js | CACHE_VERSION → v3.1.0 |

---

## [3.0.1] - 2026-03-09 — Refresh Scan UI + Stats 独立展示

### KP Refresh Scan UI
- `startKPRefreshScan()` — 加载 stale KP 列表，复用 Scan 三按钮 UI（study panel）
- `_renderKPRefreshCard()` — 显示 KP 标题 + KaTeX 渲染 + known/fuzzy/unknown 三评
- `_finishKPRefreshScan()` — 三列摘要 + 回流提示
- `recordKPRefreshScan(kpId, verdict)` — storage 层 KP 复查记录

### PP Refresh Scan UI
- `startPPRefreshScan()` — 跨 board 加载 stale PP 题目，practice panel 内展示
- `_renderPPRefreshCard()` — 完整真题渲染（难度标签 + marks + 题目 + 图表 + KaTeX）
- `_ratePPScan()` / `_finishPPRefreshScan()` — 评分 + 摘要页

### Plan & Hero 直达
- Today's Plan KP/PP 卡片新增 "Quick Scan" 按钮（data-action delegation）
- Hero 推荐 kp-refresh / pp-refresh 改为直接启动 Refresh Scan（不再跳 Plan 页）

### Stats 独立 Mastery Stability
- 原"Mastery Stability"改名"Vocabulary Mastery / 词汇掌握度"
- 新增 `_renderKPMasteryStability()` — 知识点掌握度（Mastered / Stale / Stable%）
- 新增 `_renderPPMasteryStability()` — 真题掌握度（同上三卡）

### CSS
- `.pp-scan-card` 样式（min-height 120px, pre-line, left-align）

### 文件变更
| 文件 | 变更 |
|------|------|
| storage.js | + recordKPRefreshScan |
| study.js | + startKPRefreshScan / _renderKPRefreshCard / _finishKPRefreshScan + 路由钩子 |
| practice.js | + startPPRefreshScan / _renderPPRefreshCard / _ratePPScan / _finishPPRefreshScan |
| syllabus.js | Plan KP/PP 卡片 Quick Scan 按钮 + delegation |
| mastery.js | Hero kp-refresh / pp-refresh 直达 + delegation |
| stats.js | + _renderKPMasteryStability + _renderPPMasteryStability + 标题重命名 |
| css/style.css | + .pp-scan-card 样式 |
| config.js | APP_VERSION → v3.0.1 |
| sw.js | CACHE_VERSION → v3.0.1 |

---

## [3.0.0] - 2026-03-09 — 真题接入 FLM（Learning Unit Phase 2）

### 核心功能：PP FLM 集成
- `_ppSetMastery()` 重构为 FLM-aware setter — 新增 `opts.source` 区分 practice/exam 模式
- Practice 模式：手动评分 cs-based 升级（mastered 评分 cs++, cs≥2 → mastered）
- Exam 模式：高置信度直接 mastered（correct → fs=mastered, cs=2）
- 旧数据自动迁移：mastered→mastered(cs=2), partial→uncertain, needs_work→learning
- Auto-resolve wrong book when FLM reaches mastered（集中到 _ppSetMastery）

### PP 衰退检测
- `getStalePPQuestions(board)` + `getStalePPCount(board)` — 30s TTL 缓存
- `recordPPRefreshScan(qid, verdict)` — known/fuzzy/unknown 三档（v3.0.1 UI 预留）
- Today's Plan 新增"真题复查"卡片，显示衰退 PP 数量
- Plan badge 计入 PP stale 数量

### getSectionHealth ppScore 统一
- ppScore 公式从 `(mastered*100+partial*50+needsWork*10)/(total*100)` 改为 FLM 加权
- mastered=1.0, uncertain=0.5, learning=0.2 — 与 vocabScore/knowledgeScore 语义一致

### ppGetSectionStats FLM 化
- 返回值新增 `learning / uncertain / stale` 字段
- 保留 `needsWork / partial` 向后兼容别名
- PP Section Module 标签改为 Learning / Uncertain / Mastered / Stale

### Hero 推荐
- `_getNextAction` 新增 pp-refresh 优先级（stalePP ≥ 3，低于 KP 衰退）
- Hero 渲染 pp-refresh 动作（导航到 Today's Plan）

### 文件变更
| 文件 | 变更 |
|------|------|
| practice.js | _migratePPtoFLM + _ppSetMastery FLM + getStalePP + ppGetSectionStats + recordPPRefreshScan + ppRate/ppFinishMarking source 适配 |
| syllabus.js | getSectionHealth ppScore FLM 加权 + PP section FLM 标签 + Today's Plan PP stale 卡片 |
| mastery.js | _getNextAction pp-refresh + Hero pp-refresh 动作 |
| ui.js | Plan badge +PP stale |
| storage.js | invalidateCache +_stalePPCacheData |
| css/style.css | pp-module-stat learning/uncertain/stale + 暗色模式 |
| config.js | APP_VERSION → v3.0.0 |
| sw.js | CACHE_VERSION → v3.0.0 |
| index.html | cache-bust → v3.0.0 |

## [2.9.0] - 2026-03-09 — 知识点接入 FLM（Learning Unit Phase 1）

### 核心功能：KP Session-Based FLM
- `saveKPResult()` 重构为 FLM session finalizer — 题组提交时统一结算状态转换
- KP FLM 状态：new → learning → uncertain → mastered（与词汇一致的 4 态模型）
- `cs` 语义为"连续成功 session 次数"（准确率 ≥ 85%），区别于词汇的逐题 cs
- 阈值设计：≥85% 成功（cs+1）、50-84% uncertain、<50% 降级（mastered→uncertain）
- 旧数据自动迁移：85%+total≥5 → mastered、≥50% → uncertain、其余 → learning

### getSectionHealth 升级
- KP 维度从 score/total 百分比改为 FLM 加权评分（mastered=1.0, uncertain=0.5, learning=0.2）
- 与 vocabScore 语义一致（都基于 FLM 状态），权重分配更合理

### KP 衰退检测
- `getStaleKPs(board)` 支持按考试局过滤 + 30s TTL 缓存
- Today's Plan 新增"知识点复查"卡片，显示衰退 KP 数量
- Plan badge 计入 KP stale 数量

### KP FLM 状态可视化
- KP 列表：✓/✗ 二值标记替换为 Mastered/Uncertain/Learning/NEW 彩色状态 chip
- KP 测验结果页：显示 FLM 状态标签（含配色）
- 首页 Hero：stale KP ≥ 2 时推荐知识点复查

### 文件变更
| 文件 | 变更 |
|------|------|
| storage.js | saveKPResult FLM session finalizer + _migrateKPtoFLM 保守阈值 + getStaleKPs board 过滤 + 30s 缓存 |
| syllabus.js | getSectionHealth KP 加权评分 + KP 列表 FLM chip + 测验结果 FLM 标签 + Today's Plan KP stale 卡片 |
| mastery.js | _getNextAction KP 衰退感知 + Hero kp-refresh 动作 |
| ui.js | Plan badge 计入 KP stale 数量 |
| css/style.css | kp-row-mastered/uncertain/learning + kp-flm-chip 状态样式 |
| config.js | APP_VERSION → v2.9.0 |
| sw.js | CACHE_VERSION → v2.9.0 |
| index.html | cache-bust → v2.9.0 |

## [2.8.0] - 2026-03-09 — FLM 质量加固 + 数据完整性

### 性能优化
- `getStaleWords()` 新增 30 秒 TTL 缓存，避免 Today's Plan + Hero 重复遍历 2,200 词
- 缓存在 `writeS()` / `invalidateCache()` / `recordRefreshScan()` 时自动失效

### 数据完整性
- `exportProgress()` 导出新增 `rc`（复查次数）、`fmt`（mastered 时间戳）、`src`（来源标识）字段
- 导入后衰退状态完整保留，不再丢失 mastered 衰退进度

### FLM 断点修复
- `recordRefreshScan()` 补全 daily history + streak 逻辑，Refresh Scan 活动正式计入学习记录
- Daily Challenge 优先从 learning/uncertain 词池选题，pool 不足时补 mastered 词

### UX 增强
- 侧栏 + 底栏 Plan 按钮新增红色 badge 显示 stale 词数量
- Deck 详情页新增黄色 "words getting stale" refresh banner + Quick Refresh 按钮
- 统计页新增 "Mastery Stability" 区块：已掌握/正在衰退/稳定率/回流词 四格卡片

### 文件变更
| 文件 | 变更 |
|------|------|
| storage.js | getStaleWords 30s 缓存 + recordRefreshScan 补 history/streak/badge |
| export.js | 导出补 rc/fmt/src 字段 |
| quiz.js | Daily Challenge pool 优先选题 |
| ui.js | updateNav 补 plan badge |
| mastery.js | renderDeck refresh banner + deck-refresh delegation |
| stats.js | +_renderMasteryStability 四格卡片 |
| index.html | 2 个 plan badge span + 版本号 |
| css/style.css | +deck-refresh-banner 样式 |
| config.js | APP_VERSION→v2.8.0 |
| sw.js | CACHE_VERSION→v2.8.0 |

## [2.7.0] - 2026-03-09 — Mastered 衰退复查 + 错题词汇回流

### Feature 1: Mastered 衰退复查
- 新增 `getStaleWords()` / `getStaleCount()` — 检测超过衰退阈值的 mastered 词
- 衰退阈值随复查次数递增：`REFRESH_INTERVALS = [7, 14, 30]` 天（rc=0→7天, rc=1→14天, rc≥2→30天）
- 新增 `recordRefreshScan(key, verdict)` — Refresh Scan 专用记录（known→rc++留mastered, fuzzy→uncertain, unknown→learning）
- 新增 `startRefreshScan()` — 复用 Scan UI 的轻量复查模式（最多 20 词）
- Today's Plan 面板新增 "Refresh Review" 卡片，显示 stale 词数量 + Quick Scan 按钮
- Hero 推荐区：stale ≥ 5 时优先推荐 Refresh Review 动作

### Feature 2: 错题→词汇回流
- `ppAddToWrongBook()` 新增 `sectionId, board` 参数
- 新增 `reflowVocabForSection(sectionId, board)` — 错题新增时自动将该 section 内 mastered(>3天) 词降级为 uncertain
- 错题本词汇区新增 "Reflowed" 标签，标识回流来源的词
- 3 个 ppAddToWrongBook 调用点（诊断/考试/批量评阅）均传入 sectionId + board

### 质量改进
- `_getVocabMistakes()` 条件从 `stars < 3` 改为 `fs !== 'mastered'`（FLM 对齐）
- `recordAnswer()` / `recordScan()` 保留 `rc` 字段
- `getAllWords()` 输出新增 `rc`, `fmt` 字段
- 错题本按钮文字改为 "Re-scan Wrong Words"

### 文件变更
| 文件 | 变更 |
|------|------|
| config.js | +REFRESH_INTERVALS, +REFRESH_CAP, 版本→v2.7.0 |
| storage.js | +getStaleWords, +getStaleCount, +recordRefreshScan, +reflowVocabForSection, rc 字段保留 |
| study.js | +startRefreshScan, +_renderRefreshCard, +_finishRefreshScan, rateScan/finishStudy 分支 |
| mastery.js | _getNextAction +refresh 优先级, _renderHeroAction +refresh 分支, _initHeroDelegation +refresh |
| syllabus.js | renderTodaysPlan +Refresh 卡片+委托, _getVocabMistakes FLM 对齐, renderMistakeBook +reflow 标签 |
| practice.js | ppAddToWrongBook +sectionId/board + reflowVocabForSection, 3 调用点传参 |
| css/style.css | +.plan-refresh, +.reflow-tag, +.study-refresh-label, dark mode |
| sw.js | CACHE_VERSION→v2.7.0 |

## [2.6.0] - 2026-03-09 — FLM 筛选循环词汇学习系统

### 核心变更：SRS → FLM
- **艾宾浩斯 SRS 系统完全替换为 FLM（Filter-Learn-Master）筛选循环系统**
- 4 状态模型：`new` → `learning` → `uncertain` → `mastered`
- 每轮学习后 Learning Pool 自动缩小，直至全部掌握

### Phase A: 数据引擎
- `storage.js` 重写：`recordAnswer()` 改为 FLM 状态转换（连续答对 2 次→mastered，答错降一级）
- 新增 `recordScan(key, verdict, round)` 扫描专用记录
- 新增 `getPoolWords(li)` 获取 learning+uncertain 词池
- 新增 `getChapterRound()` / `setChapterRound()` 章节轮次追踪
- `_migrateSRStoFLM()` 一次性旧数据迁移（基于 lv/stars/ok 映射到 fs）
- `checkBadges()` 改为 `fs='mastered'` 计数
- 云端同步排行榜使用 FLM mastered 计数

### Phase B: Study → Scan 模式
- `study.js` 重写为三按钮扫描筛选：认识(绿) / 模糊(橙) / 不认识(红)
- 点击后显示中文释义 + 视觉反馈，0.6s 自动下一词
- 轮结束显示 Pool 进度条 + 结果摘要
- Round 2+ 仅加载 uncertain + learning 词（Pool 逐轮缩小）
- 全部 mastered → 推荐游戏模式强化
- 键盘快捷键：1=认识, 2=模糊, 3=不认识

### Phase C: 删除 Review 模式
- `review.js` 清空为空壳函数
- 侧栏/底栏/首页删除 Review 入口和 badge
- 学习路径从 Study→Quiz→Review 简化为 Scan→Quiz

### Phase D: UI 改造
- 词条显示：4 星点 + SRS 级别 → FLM 状态标签（New/Learning/Uncertain/Mastered）
- 筛选栏：Hide Mastered → 状态 filter chips（All/New/Learning/Uncertain/Mastered）
- Deck 统计条：三段 Pool 进度条（mastered 绿 + pool 橙 + new 灰）
- 新增 CSS：`.word-status`, `.flm-filter-chips`, `.pool-bar`, `.scan-card`, `.scan-btn`

### Phase E-G: 系统适配
- Game 模式（Quiz/Spell/Match/Battle）：统一 recordAnswer FLM 状态转换
- `syllabus.js`：`getSectionHealth()` 改为 mastered/total 比率
- `stats.js`：删除 review 行
- `export.js`：导出格式改为 flmStatus/round
- `config.js`：新增 `FLM_COLORS`, `FLM_LABELS`, `FLM_LABELS_ZH`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | 重写：recordAnswer/recordScan, 删除 SRS 函数, 迁移, getPoolWords |
| `js/study.js` | 重写：Study → Scan 三按钮筛选循环 |
| `js/review.js` | 清空为空壳函数 |
| `js/mastery.js` | 改造：getDeckStats 新逻辑, 词条 FLM UI, 筛选 chips, Pool 进度条 |
| `js/config.js` | FLM 常量 + 版本号 v2.6.0 |
| `js/ui.js` | 删除 review badge + dueCount |
| `js/syllabus.js` | getSectionHealth 去 SRS |
| `js/stats.js` | 删除 review 行 |
| `js/export.js` | 导出格式适配 FLM |
| `js/app.js` | 键盘快捷键适配 Scan |
| `css/style.css` | 新增 FLM 状态/扫描/进度条样式 |
| `index.html` | 删除 Review 导航 |
| `sw.js` | 版本号 v2.6.0 |

## [2.5.1] - 2026-03-09 — 全面取消路径锁定

### 变更
- **isModeUnlocked()** → 始终返回 true，删除 `_isFirstSectionLevel` 辅助函数
- **isFeatureUnlocked()** → 始终返回 true，删除 `FEATURE_THRESHOLD`、`_cachedStageObj`、`_cachedStageTs`
- **isSectionUnlocked()** → 始终返回 true，删除 `_getForceUnlocked`、`migrateForceUnlock`
- **_handleLockedClick** 事件委托完全删除
- **Test Out 跳级测试** 完全删除（锁定取消后无意义）
- **_applyHomeworkFeatureOverride** 删除（不再需要教师作业解锁 override）
- 所有模式入口门控移除：quiz/review/match/spell/battle/practice/diagnostic/mock
- 知识点列表移除 locked 分支 + 🔒 图标
- mastery.js 模式按钮移除 locked 分支 + 进度条 + 🔒
- `_renderModeDiscovery` / `_renderRefluxRec` 移除 `isFeatureUnlocked` 检查
- storage.js nudge 移除 FEATURE_THRESHOLD 引用，简化为直接推荐
- CSS 清理：`.deck-row.locked`、`.mode-btn-locked`、`.mode-lock`、`.unlock-progress`、`.testout-*` 全部删除

### 保留
- `isModeDone()` / `markModeDone()` — 完成标记 ✓
- `getUserStage()` — 统计/徽章用
- Badge 系统、衰退警告、Guest CTA（diagnostic/mock 的 isGuest 检查）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | isModeUnlocked/isSectionUnlocked → return true, 删除辅助函数, 简化 nudge |
| `js/ui.js` | isFeatureUnlocked → return true, 删除 FEATURE_THRESHOLD + _handleLockedClick |
| `js/mastery.js` | 模式按钮简化 + 删除 Test Out + 推荐逻辑简化 |
| `js/quiz.js` | 移除 isModeUnlocked 门控 |
| `js/review.js` | 移除 isModeUnlocked 门控 |
| `js/match.js` | 移除 isModeUnlocked 门控 |
| `js/spell.js` | 移除 isModeUnlocked + isFeatureUnlocked 门控 |
| `js/battle.js` | 移除 isModeUnlocked + isFeatureUnlocked 门控 |
| `js/practice.js` | 移除 isFeatureUnlocked 门控（practice/diagnostic/mock） |
| `js/syllabus.js` | 移除 section locked 分支 + 🔒 + migrateForceUnlock 调用 |
| `js/homework.js` | 删除 _applyHomeworkFeatureOverride |
| `css/style.css` | 删除 locked/testout 相关样式 |
| `js/config.js` | v2.5.0 → v2.5.1 |
| `sw.js` | v2.5.0 → v2.5.1 |

## [2.5.0] - 2026-03-09 — 解锁系统全面优化

### Phase A: 核心阈值重构
- FEATURE_THRESHOLD 替换 stage-based 门控，精确数值阈值（spell:15, battle:30, diagnostic:20, mock:50）
- Review 与 Quiz 平行解锁（均依赖 Study 完成，不再链式）
- 首 Level Quiz 自动解锁（无需先完成 Study）
- nudge 阈值与 FEATURE_THRESHOLD 同步
- 所有模式门控消息动态化，显示当前进度（已掌握/需要）
- 教师作业 featureOverride 机制（diagnostic/mock 作业自动解锁对应功能）

### Phase B: 锁定 UX 改进
- 锁定按钮增加 data-unlock-mode 属性 + 进度条（底部 3px 彩条）
- Guest 用户点击锁定功能显示注册 CTA
- _handleLockedClick 重写：优先检查 feature gate → 显示进度
- Diagnostic/Mock 入口增加 Guest 检查拦截

### Phase C: 新功能
- **Test Out 跳级测试**: 未完成 Study 的 Level 显示跳级按钮，8 题 MCQ ≥7 正确自动完成 Study+Quiz
- **徽章奖励系统**: hundred_club→数据导出、streak_7→困难每日、all_modes→自定义主题
- **衰退警告**: 进入 Diagnostic/Mock 时若 20+ 词过期自动提醒复习
- **隐藏成就**: Speed Demon（quiz ≥10 正确 ≤60s）、Deep Focus（30 分钟 session）、Full Explorer（15+ 面板）
- **回流推荐**: 首页每日推荐一个已学但未尝试的模式+Level 组合
- isBadgeRewardUnlocked 工具函数

### Phase D: 教师作业解锁
- homework.js 加载作业时自动注入 featureOverride
- isFeatureUnlocked 支持 localStorage override 检查

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | FEATURE_THRESHOLD + _handleLockedClick 重写 + showPanel 面板追踪 |
| `js/storage.js` | isModeUnlocked 重写 + _isFirstSectionLevel + BADGES 扩展(reward+hidden) + checkBadges 上下文 + nudge 阈值 + isBadgeRewardUnlocked |
| `js/mastery.js` | 锁定按钮 data-unlock-mode + 进度条 + Test Out + reflux 推荐 |
| `js/practice.js` | Diagnostic/Mock 动态阈值 + Guest 检查 + 衰退警告 |
| `js/review.js` | 门控消息改为 "Complete Study first" |
| `js/quiz.js` | quiz 计时 + speedDemon localStorage 记录 |
| `js/spell.js` | 门控消息动态化 |
| `js/match.js` | 门控消息动态化 |
| `js/battle.js` | 门控消息动态化 |
| `js/stats.js` | _renderBadgeSection 支持 hidden 徽章 |
| `js/app.js` | session 计时(wmatch_session_start) |
| `js/homework.js` | _applyHomeworkFeatureOverride |
| `css/style.css` | .unlock-progress + .badge-hidden + .testout-link + .reflux-rec |
| `js/config.js` | v2.4.4 → v2.5.0 |

## [2.4.4] - 2026-03-09 — practice.js 5 处 Critical/High Bug 修复

### Fix 1-4: `btn-lg` 语法错误修复（4 处）
- `btn-lg` 被错误写入 `onclick=` 属性值内部，导致按钮缺失大尺寸样式，且 JS 抛出 `ReferenceError: btn is not defined`
- 修复：将 `btn-lg` 移入 `class=` 属性
- 影响按钮：`ppStartExam` / `ppFinishMarking` / `ppStartPaperExam` / `ppStartMockExam`

### Fix 5: 重复 class 属性合并（1 处）
- Mock Exam 按钮有两个 `class=` 属性，第二个 `btn-warning` 被 HTML parser 忽略
- 修复：合并为单个 `class="btn btn-sm btn-warning"`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 4 处 btn-lg 语法修复 + 1 处重复 class 合并 |
| `js/config.js` | v2.4.3 → v2.4.4 |

## [2.4.3] - 2026-03-09 — 真题排版继续优化

### Fix 1: 移除误杀 display math 的 spacing 正则
- `_ppRenderTex` 中 `/\\\\?\[[\d.]+cm\]/g` 正则会匹配 `\[...\]` display math 起始符
- 数据中实测 0 题含此 pattern（spacing 已在提取阶段清除），正则冗余且有误杀风险
- 直接移除该行

### Fix 2: `flex-wrap:wrap` 去除
- `.pp-part-block` 去掉 `flex-wrap:wrap`，marks badge 不再在窄屏上换行脱离内容

### Fix 3: onclick XSS 消除（3 处）
- `ppToggleMS()` / `ppToggleVocab()` / `ppToggleMarkBody(i)` 的 3 处 `onclick=` 内联事件
- 改为 `data-action` 属性 + `panel-pastpaper` 上的事件委托（bind once）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 移除 spacing 正则 + 3 处 onclick→data-action 事件委托 |
| `css/style.css` | `.pp-part-block` 去掉 `flex-wrap:wrap` |
| `js/config.js` | v2.4.2 → v2.4.3 |

## [2.4.2] - 2026-03-09 — 真题排版 3 Critical Bug 修复

### Fix 1: f(x)/g(x) 误切修复（54 题）
- **`_ppInsertPartMarks`** 重写：废弃通用正则 `/(\([a-z]\)|\([ivx]+\))/gi`，改为动态正则只匹配 `partsMap` 中实际存在的 label
- 要求 label 在行首或换行后出现（`(?:^|\n)\s*`），避免 `f(x)` 行内误匹配

### Fix 2: marks=0 不再显示 `[0]`（632 题 / 1,081 parts）
- 数据中 `marks=0` 表示"未提取到分值"，现过滤为空不显示
- 同时修复无 parts 题目的总分值显示

### Fix 3: LaTeX 残留清理
- `_ppRenderTex` 清除 `[leftmargin=...]` 文字残留（8 题）
- `\\[0.3cm]` 间距命令转换为 `<div style="margin-top:8px">` CSS 间距（347 题）

### Fix 4: float→flex 布局
- `.pp-part-block` 从 `overflow:hidden` + `float:right` 改为 `display:flex`
- 新增 `.pp-part-content` 包裹内容区（`flex:1`）
- `.pp-marks-right` 改用 `margin-left:auto` 自然右对齐
- `.pp-part-block` 设 `white-space:normal` 避免与 `.pp-card-body` 的 `pre-line` 冲突

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 重写 `_ppInsertPartMarks`（动态正则）+ `_ppRenderTex` 增加清理 + marks>0 过滤 |
| `css/style.css` | `.pp-part-block` float→flex + `.pp-part-content` 新增 + `.pp-marks-right` 去 float |
| `js/config.js` | v2.4.1 → v2.4.2 |

## [2.4.1] - 2026-03-09 — 真题 PDF 还原排版

### 右对齐分值（PDF 风格）
- **`_ppRenderWithMarks(q)`**：按 part label 分段，每段末尾插入右对齐 `[n]` 分值标记
- **`_insertPartMarks(html, partsMap)`**：解析 `(a)/(b)/(i)/(ii)` 等标记，自动插入对应分值
- 无 parts 的题目在末尾显示总分值 `[marks]`
- 移除旧的 `.pp-parts-bar` 平铺显示，改为内嵌到题目正文

### 表格补全
- **`convert-tables.py`**：移除 `InsertScreenShot` 跳过逻辑，改为剥离 ISS wrapper 后转换 tabular
- **60 题 texHtml 补全**：2025 MayJune 新卷的 tabular 题目全部生成 HTML table（375/375 覆盖率 100%）

### 缺图提示优化
- `hasFigure` 无资产时显示虚线边框占位区 + 🖼️ 图标 + "查看原卷"链接

### 超管编辑器增强
- **工具栏**：插入表格（行列选择 + tabular 模板）、数学公式 `$x$`、加粗按钮
- **实时 tabular 预览**：`_ppConvertTabularRuntime()` JS 运行时转换 LaTeX 表格为 HTML
- **Parts 小题编辑**：可增删的 label + marks 行，保存到 `question_edits.data.parts`
- **数据合并**：`loadPastPaperData` 增加 parts 字段合并

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +195 行：_ppRenderWithMarks + 编辑器工具栏 + parts 编辑 + runtime tabular |
| `css/style.css` | +9 行：pp-marks-right + pp-part-block + pp-figure-placeholder + 编辑器样式 |
| `js/config.js` | v2.4.0 → v2.4.1 |
| `data/papers-cie.json` | 60 题 texHtml 补全 |
| `scripts/convert-tables.py` | InsertScreenShot 剥离逻辑 |

## [2.4.0] - 2026-03-09 — KP 超管编辑 + 真题分值持久化

### KP 超管在线编辑（Phase 4）
- **6 个编辑器**：标题 / 知识讲解（分屏预览+LaTeX）/ 典型考法 / 例题 / 自测 MCQ / 词汇关联
- **数据持久化**：保存到 `section_edits` 表（module='kp'），加载时自动合并覆盖 JSON 基础数据
- **编辑入口**：KP 详情页每个 section header 右侧 ✏️ 按钮（仅超管可见）
- **可增删行**：考法/例题/MCQ 编辑器支持动态增删条目
- **CSS**：编辑按钮 + 表单行样式 + 暗色模式

### 真题分值持久化
- **`submitPPEdit`**：从 `feedback` 日志改为 `question_edits` 表持久化（marks/tex/d/g）
- **`loadPastPaperData`**：加载时合并 `question_edits` 覆盖，分值修改跨会话生效
- **缓存失效**：保存后清除 `_pqEditsCache`，确保下次加载取最新数据

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | +422 行：_mergeKPEdits + 6 编辑器 + _saveKPEdit + 事件委托 + 编辑按钮注入 |
| `js/practice.js` | +35 行：loadPastPaperData 合并 question_edits + submitPPEdit 持久化 |
| `css/style.css` | +20 行：kp-edit-btn + kpe-row 样式 + 暗色模式 |
| `js/config.js` | v2.3.25 → v2.4.0 |

## [2.3.25] - 2026-03-09 — 变式题质量审计 + 自动修复

### 质量修复（48 ERROR → 0）
- **裸 LaTeX 修复**（43 题）：CIE cv1588-1677 + EDX ev0943-0970 解释字段中 `\frac`/`\sqrt`/`\times`/`\div` 命令包裹入 `$...$`
- **混合选项格式修复**（5 题）：CIE cv1696-1700 裸代数选项（`t = S / (2(u+v))`）统一包裹 `$...$`

### 新增工具
- **`scripts/audit-variants.js`**：6 条规则全量审计（UNBALANCED_LATEX / NAKED_LATEX / MIXED_OPTION_FORMAT / DUPLICATE_OPTIONS / ALL_SHORT_OPTIONS / EMPTY_EXPLANATION）
- **`scripts/fix-variant-quality.js`**：自动修复裸 LaTeX + 混合选项，支持 `--dry-run`

### 质量门 + Prompt 加固
- **`fix-variant-json.js`**：写入前增加 unbalanced `$` + 混合选项格式警告
- **`gen-variants.sh`**：添加 3 条 Gemini prompt 规则（LaTeX 闭合 / 选项格式一致 / 货币 `\$`）

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/audit-variants.js` | **新建** ~120 行，6 条审计规则 |
| `scripts/fix-variant-quality.js` | **新建** ~115 行，2 类自动修复 |
| `scripts/fix-variant-json.js` | +15 行质量门警告 |
| `scripts/gen-variants.sh` | +3 行 prompt 规则 |
| `data/questions-cie.json` | 23 题修复（5 MIXED_OPTIONS + 18 NAKED_LATEX） |
| `data/questions-edx.json` | 25 题修复（NAKED_LATEX） |
| `js/config.js` | v2.3.24 → v2.3.25 |

## [2.3.24] - 2026-03-09 — 变式题 ID 去重机制合规化

### 根因消除
- **gen-variants.sh**：移除 MAX_ID 计算 + NEXT_ID 状态，prompt 改为 `Omit the "id" field`（Gemini 不再分配 ID）
- **fix-variant-json.js**：添加 `delete q.id` 安全网，即使 Gemini 忽略指令仍输出 id 也会被剥离
- **merge-variants.js**：持久化计数器（`.next-id-{board}`），确保跨运行 ID 单调递增，彻底杜绝碰撞
- **--clean 选项**：合并成功后可自动删除已处理的 variant 文件，防止重复合并

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/gen-variants.sh` | 删除 ID 计算逻辑（-15 行）+ prompt 改为省略 id |
| `scripts/fix-variant-json.js` | 添加 `delete q.id`（+1 行） |
| `scripts/merge-variants.js` | 持久化计数器读写 + --clean 选项（+25 行） |
| `data/kp-gen/.next-id-*` | 新增 3 个计数器文件（cie=1716, edx=971, 25m=957） |
| `js/config.js` | v2.3.23 → v2.3.24 |

## [2.3.23] - 2026-03-09 — 数据质量修复 + HHK Y9 补全（+168 变式题）

### P0 修复
- **HHK 重复 ID**：18 个碰撞 ID（hv0276-hv0293 跨 Y10/Y7-Y8）重新编号
- **CIE c1505 Schema 错误**：`o` 字段嵌套数组 `[[...]]` → 展平 + 题目文本与解释内容不匹配修正

### P1 补全
- **HHK Y9 全部 12 section + Y8.8/Y8.9**：+168 变式题（14 sections × 12），所有 section 达到 ≥9Q
- HHK 总题数：755 → 923（avg 17Q/section，原 14Q）

### P2 修复
- **4 道 Yes/No 空选项**：Y7.9 的 options[2-3] 空字符串 → 填充 "Not enough information" / "None of the above"

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/questions-25m.json` | +168 变式 + 18 ID 修复 + 4 空选项修复（755→923） |
| `data/questions-cie.json` | c1505 嵌套数组+内容修复 |
| `js/config.js` | v2.3.22 → v2.3.23 |

## [2.3.22] - 2026-03-09 — 变式题生成管线（三考试局 +681 变式题，覆盖率全面提升）

### 新增管线
- **gen-variants.sh** — Gemini 驱动变式题生成器，自动检测薄弱 section（低于阈值），从母题生成 N 个换数/换情境的变式
- **fix-variant-json.js** — JSON 修复 + 选择题 schema 验证（q/o[4]/a/s）
- **merge-variants.js** — 去重合并 + 顺序 ID 分配 + section 排序 + 覆盖统计

### 生成数据
| 考试局 | 新增变式 | 覆盖 sections | 合并后总题数 | 平均题数/section |
|--------|----------|--------------|-------------|-----------------|
| HHK | +480 | 39 sections | 755 | 14Q (原 5Q) |
| CIE | +177 | 23 sections | 1,695 | 24Q |
| EDX | +24 | 3 sections | 960 | 25Q |
| **合计** | **+681** | **65 sections** | **3,410** | — |

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/gen-variants.sh` | 新增：变式题生成脚本 |
| `scripts/fix-variant-json.js` | 新增：JSON 修复 + schema 验证 |
| `scripts/merge-variants.js` | 新增：变式题合并工具 |
| `data/questions-25m.json` | +480 变式题（275→755） |
| `data/questions-cie.json` | +177 变式题（1,518→1,695） |
| `data/questions-edx.json` | +24 变式题（936→960） |
| `js/config.js` | v2.3.21 → v2.3.22 |

## [2.3.21] - 2026-03-09 — 补建 11 个缺失 vocab levels（201/201 KPs 100% 关联词汇）

### 新增 Vocabulary Levels
- **CIE +5 levels**：Using a Calculator / Exponential Growth & Decay / Surds / Sketching Curves / Constructions & Loci
- **Edexcel +6 levels**：Standard Form / Applying Number / Electronic Calculators / Proportion / Measures / Geometrical Reasoning
- 总词汇量：264 → 275 levels（CIE 55 + Edexcel 47 + HHK 173）

### 数据修复
- CIE syllabus 5 个 section 补充 vocabSlugs（原为空数组）
- 11 个 KP vocabLinks 补全（从 0 → 有效 slug）
- **最终状态：201/201 KPs 100% vocabLinks，0 无效 slug**

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/levels.js` | +5 CIE levels + 6 Edexcel levels (275 total) |
| `data/syllabus-cie.json` | 5 sections 补充 vocabSlugs |
| `data/knowledge-cie.json` | 5 KPs vocabLinks 补全 |
| `data/knowledge-edexcel.json` | 6 KPs vocabLinks 补全 |
| `js/config.js` | v2.3.20 → v2.3.21 |

## [2.3.20] - 2026-03-09 — vocabLinks 无效 slug 清除

### 修复
- **CIE**：清除 22 个 Gemini 生成的虚假 slug（如 `"gradient"`, `"vectors"` 等不在 LEVELS 中），保留 99 个有效链接
- **Edexcel**：清除 6 个无效 slug（syllabus 定义了 slug 但 levels.js 无对应条目），保留 59 个有效链接
- 修复前点击这些词汇链接会静默失败（`getLevelIdxBySlug` 返回 -1）

### 最终 vocabLinks 状态
| 考试局 | 有效链接 | 空链接 | 说明 |
|--------|---------|--------|------|
| CIE | 92/97 | 5 | 1.14/1.17/1.18/2.11/4.8 syllabus 无词汇 |
| HHK | 55/55 | 0 | 100% |
| Edexcel | 43/49 | 6 | 6 section 的 vocab level 未创建 |

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | 清除 22 个无效 vocabLinks |
| `data/knowledge-edexcel.json` | 清除 6 个无效 vocabLinks |
| `js/config.js` | v2.3.19 → v2.3.20 |
| `scripts/fix-vocablinks.js` | 新增：vocabLinks 校验/清除脚本 |
| `scripts/check-slugs.js` | 新增：slug 有效性检查脚本 |

## [2.3.19] - 2026-03-09 — KP 跳转原路返回 + openDeck slug 修复

### Bug 修复
- **openDeck slug 参数修复**：`openDeck()` 不支持字符串 slug 参数（仅支持 numeric index），导致 KP 详情页点击"关联词汇"按钮报错。新增 `getLevelIdxBySlug()` 自动转换
- **KP → 词汇/练习原路返回**：新增 `_kpReturnContext` 机制，从 KP 详情页跳转到词汇卡组或练习题后，返回按钮原路返回 KP 详情页而非 section/home
  - Deck 页返回按钮：检测 `_kpReturnContext` → 回到 KP
  - Practice 答题中返回：`_pqSession.kpReturn` → 回到 KP
  - Practice 完成页：结果屏 + "下一步"推荐 → 回到 KP

### 优化
- **词汇链接显示名称**：KP 详情页的关联词汇按钮现在显示 level 标题（如 "Integers"）而非原始 slug（如 "edx-num-integers"）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | `openDeck()` 支持 slug + deck 返回按钮 KP 感知 |
| `js/practice.js` | `_pqSession.kpReturn` + 答题/完成页返回 KP |
| `js/syllabus.js` | vocab/practice link 设置 `_kpReturnContext` + 显示 level 标题 |
| `js/config.js` | v2.3.18 → v2.3.19 |

## [2.3.18] - 2026-03-09 — vocabLinks 补全（三考试局 200/201 KPs 关联词汇）

### 关联词汇补全
- **HHK Y7-11**：55/55 KPs 补全 vocabLinks（从 syllabus vocabSlugs 自动映射）
- **Edexcel 4MA1**：49/49 KPs 补全 vocabLinks
- **CIE 0580**：7 个缺失 KPs 补全，96/97 完成（1.14 "Using a calculator" 无对应词汇属正常）
- KP 详情页"相关资源"区域现在显示关联词汇按钮，点击跳转词汇卡组

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | +7 KPs vocabLinks 补全 |
| `data/knowledge-hhk.json` | +55 KPs vocabLinks 补全 |
| `data/knowledge-edexcel.json` | +49 KPs vocabLinks 补全 |
| `js/config.js` | v2.3.17 → v2.3.18 |

## [2.3.17] - 2026-03-09 — Edexcel 4MA1 知识点全量生成

### Edexcel 4MA1 知识点
- **49 KPs 覆盖 39/39 Edexcel sections (100%)**
- Ch1 Numbers: 11 | Ch2 Equations: 10 | Ch3 Sequences: 7 | Ch4 Geometry: 12 | Ch5 Vectors: 4 | Ch6 Statistics: 5
- 7 个 thin KPs 自动 enrichment 至 2+ quiz + 2+ examples
- `loadKnowledgeData('edexcel')` 启动时自动加载

### 三考试局知识点统计
| 课程 | KPs | Sections | Quiz | Examples |
|------|-----|----------|------|----------|
| CIE 0580 | 97 | 72/72 | 194+ | 194+ |
| HHK Y7-11 | 55 | 55/55 | 110+ | 110+ |
| Edexcel 4MA1 | 49 | 39/39 | 98+ | 98+ |
| **总计** | **201** | **166/166** | **402+** | **402+** |

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-edexcel.json` | 新增：49 KPs（6 章 39 section 全覆盖） |
| `js/syllabus.js` | 添加 `loadKnowledgeData('edexcel')` |
| `js/config.js` | v2.3.16 → v2.3.17 |
| `scripts/gen-kp-edx.sh` | 新增：Edexcel KP 生成脚本 |
| `scripts/merge-kp-edx.js` | 新增：Edexcel KP 合并器 |
| `scripts/enrich-kp-edx.sh` | 新增：Edexcel enrichment 脚本 |
| `scripts/apply-enrich-edx.js` | 新增：Edexcel enrichment 应用器 |

## [2.3.16] - 2026-03-09 — CIE 题目补充 + HHK Y7-11 知识点全量覆盖

### CIE 知识点质量补充
- **97 KPs 全部补充至 2+ quiz + 2+ examples**：+74 道 MCQ + 97 道例题
- Gemini 批量 enrichment 流水线（enrich-kp.sh + fix-enrich-json.js + apply-enrich.js）

### HHK Y7-11 知识点全量生成
- **55 KPs 覆盖 55/55 HHK sections (100%)**
- Y7: 11 KPs | Y8: 9 KPs | Y9: 12 KPs | Y10: 12 KPs | Y11: 11 KPs
- 每个 KP 含 2+ quiz + 2+ examples + 概念卡片 + 考法分析
- `loadKnowledgeData('hhk')` 启动时自动加载

### 数据统计
| 课程 | KPs | Sections | Quiz | Examples |
|------|-----|----------|------|----------|
| CIE 0580 | 97 | 72/72 | 194+ | 194+ |
| HHK Y7-11 | 55 | 55/55 | 110+ | 110+ |
| **总计** | **152** | **127/127** | **304+** | **304+** |

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | +74 quiz + 97 examples 补充 |
| `data/knowledge-hhk.json` | 新增：55 KPs（Y7-11 全覆盖） |
| `js/syllabus.js` | 添加 `loadKnowledgeData('hhk')` |
| `js/config.js` | v2.3.15 → v2.3.16 |
| `scripts/enrich-kp.sh` | 新增：批量补充脚本 |
| `scripts/fix-enrich-json.js` | 新增：enrichment JSON 修复器 |
| `scripts/apply-enrich.js` | 新增：补充数据合并器 |
| `scripts/gen-kp-hhk.sh` | 新增：HHK KP 生成脚本 |
| `scripts/merge-kp-hhk.js` | 新增：HHK KP 合并脚本 |

---

## [2.3.15] - 2026-03-09 — 知识点全量扩充（72/72 sections 100% 覆盖，97 KPs）

### 知识点数据扩充
- **Ch1 Number** 补全 1.9-1.18（+9 KPs，原有 1.1-1.8 共 14 KPs）
- **Ch2 Algebra** 全量覆盖 2.1-2.13（+15 KPs）
- **Ch3 Coordinate Geometry** 全量覆盖 3.1-3.7（+8 KPs）
- **Ch4 Geometry** 全量覆盖 4.1-4.8（+12 KPs）
- **Ch5 Mensuration** 全量覆盖 5.1-5.5（+7 KPs）
- **Ch6 Trigonometry** 全量覆盖 6.1-6.6（+8 KPs）
- **Ch7 Transformations & Vectors** 全量覆盖 7.1-7.4（+5 KPs）
- **Ch8 Probability** 全量覆盖 8.1-8.4（+6 KPs）
- **Ch9 Statistics** 全量覆盖 9.1-9.7（+11 KPs + 2 patch）

### 生成流程
- `scripts/gen-kp.sh` — Gemini CLI 按 chapter 批量生成 KP JSON
- `scripts/fix-kp-json.js` — 自动修复 Gemini 输出中的无效 JSON 转义、断行、拖尾逗号
- `scripts/merge-kp.js` — 合并到 `knowledge-cie.json` 并按 section 排序

### 数据统计
| 指标 | 值 |
|------|-----|
| 总 KP 数 | 97 |
| 覆盖 sections | 72/72 (100%) |
| 每个 KP 含 | explanation + examPatterns + worked examples + MCQ quiz |
| 双语 | 全部 en + zh |

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | 14 → 97 KPs（+83），796 → 5304 行 |
| `js/config.js` | v2.3.14 → v2.3.15 |
| `scripts/gen-kp.sh` | 新增：Gemini 批量生成脚本 |
| `scripts/fix-kp-json.js` | 新增：JSON 修复器 |
| `scripts/merge-kp.js` | 新增：KP 合并脚本 |

---

## [2.3.14] - 2026-03-09 — 知识点详情页 UI 优化（概念卡片拆分 + 例题编号）

### 概念卡片拆分
- **Explanation 段落拆分**: 新增 `_splitExplanation()` 解析器，将长解释文本按 `**术语**` 段落自动拆分为独立概念卡片
- **概念卡片 UI**: 左侧 teal 色边框 + 术语标题 + 正文，每个知识点概念独立成卡（`.kp-concept`）
- **兜底处理**: 无 bold 标题的解释仍渲染为整块文本

### 例题编号
- **Worked Examples 编号**: 每个例题卡片顶部新增 "Example 1/2/3" 编号 + 来源徽标并排显示
- **例题卡片重设计**: 左侧 amber 色边框（与概念卡 teal + 考法卡 purple 形成三色体系）

### 视觉体系
| 卡片类型 | 左边框颜色 | 标题色 |
|---------|-----------|--------|
| 概念卡 `.kp-concept` | teal #14b8a6 | teal |
| 考法卡 `.kp-pattern` | purple (primary) | purple |
| 例题卡 `.kp-example` | amber #f59e0b | amber |

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `_splitExplanation()` + `renderKPDetail()` 概念卡渲染 + 例题编号 |
| `css/style.css` | `.kp-concept` / `.kp-concept-title` / `.kp-concept-body` / `.kp-example-header` / `.kp-example-num` + 暗色模式 + 手机端 |
| `js/config.js` | v2.3.13 → v2.3.14 |

---

## [2.3.13] - 2026-03-09 — 启动 Bug 修复（_xxxDataReady 未声明 + knowledge-edexcel 404）

### Bug 修复
- **`_xxxDataReady` 全局变量声明**: `_cieDataReady` / `_edxDataReady` / `_hhkDataReady` 从未声明，`renderHHKHome()` 等函数引用时抛 ReferenceError 导致首页渲染中断。在 `syllabus.js` 顶部声明 3 变量 + `_setBoardReady()` 同步赋值
- **`knowledge-edexcel.json` 404**: `loadKnowledgeData('edexcel')` 请求不存在的文件，删除该调用

### Chrome DOM 警告修复
- **密码输入框包裹 `<form>`**: `auth-pass` 和 `tr-pass` 不在 `<form>` 内，Chrome 报 DOM 警告且无法触发浏览器密码保存。将登录区和教师注册区分别包裹 `<form>` + `autocomplete` 属性

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | 声明 `_cieDataReady` / `_edxDataReady` / `_hhkDataReady` + `_setBoardReady` 同步赋值 + 删除 `loadKnowledgeData('edexcel')` |
| `js/config.js` | v2.3.12 → v2.3.13 |
| `index.html` | 登录/教师注册区 `<form>` 包裹 + `autocomplete` 属性 |

---

## [2.3.12] - 2026-03-09 — 质量优化批次 4（内联样式清理 4 文件 + 空白页修复）

### 空白页修复（独立 hotfix 已先发布）
- **config.js `typeof` 守卫**: Supabase CDN 加载失败时 `supabase` 未定义不再抛出 ReferenceError 导致整包崩溃
- **app.js 5s 超时**: `getSession()` 使用 `Promise.race` + 5s 超时，Supabase API 无响应时不再挂起
- **index.html 看门狗**: 登录时间戳隐藏窗口 30min→5min，8s 看门狗定时器兜底恢复 auth overlay

### 内联样式→CSS 类（~30 处）
**mastery.js（4 处）**: `ms-modal-center` / `ms-modal-emoji` / `ms-benefits-list` / `ms-preview-actions` — guest lock/signup 弹窗统一用类
**review.js（4 处）**: `rv-empty-pad` / `rv-guide-text` / `mt-16` / `rv-result-grid + rv-result-cell + rv-result-num + rv-result-label` — 复习结果格替换 7 个 inline style
**practice.js（7 处）**: `pq-diag-summary` 清除 inline / `pp-diag-row` / `font-mono-sm` / `pp-cmd-stat-row + pp-q-topic-cell + pp-cmd-stat-score` / `pp-all-clear-title` / `pp-section-h4`（3 处 h4）
**homework.js（11 处）**: `hw-scroll-list`（4 处重复）/ `hw-scroll-list-xl` / `hw-checkbox-label`（2 处）/ `hw-checkbox-heading` / `hw-checkbox-label-indent` / `hw-list-item-wrap`（2 处）/ `hw-section-title mt-20` / `hw-tip-row`

### 新 CSS 工具类（32 个）
`hw-scroll-list` / `hw-scroll-list-xl` / `hw-checkbox-label` / `hw-checkbox-label-indent` / `hw-checkbox-heading` / `hw-tip-row` / `hw-list-item-wrap` / `mb-12` / `mt-20` / `rv-empty-pad` / `rv-guide-text` / `rv-result-grid` / `rv-result-cell` / `rv-result-num` / `rv-result-label` / `ms-modal-center` / `ms-modal-emoji` / `ms-benefits-list` / `ms-preview-actions` / `pq-diag-summary` (CSS 扩展) / `pp-diag-row` / `pp-cmd-stat-row` / `pp-cmd-stat-score` / `pp-all-clear-title` / `pp-section-h4` / `font-mono-sm`

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | ~32 新工具类 |
| `js/mastery.js` | 4 处 inline→class |
| `js/review.js` | 6 处 inline→class |
| `js/practice.js` | 7 处 inline→class |
| `js/homework.js` | 11 处 inline→class |
| `js/config.js` | v2.3.11 → v2.3.12 + typeof 守卫 |
| `js/app.js` | getSession 5s 超时 |
| `index.html` | 看门狗 + 5min 窗口 |

---

## [2.3.11] - 2026-03-08 — 质量优化批次 3（可访问性扩展 + 内联样式清理）

### 可访问性（31 处 role/tabindex）
- **syllabus.js 10 处**: `pp-browse-entry` / `category-header` / `deck-row` / `sec-deck-row-flush` / `sec-module`（vocab + practice）/ `sec-module-expandable`（3 处）/ `we-card-header` / `smart-path-header` / `review-plan-item`
- **practice.js 17 处**: `pp-filter-link`（2 处）/ `pp-ms-toggle`（2 处）/ `diag-section-row` / `diag-rec-item` / `pp-setup-opt`（5 处）/ `pp-mark-header` / `pp-error-chip` / `pp-wrong-item` / `pp-paper-card` / `pp-q-preview`
- **其他文件 4 处**: `mastery.js` deck-row / `ui.js` next-step / `study.js` fc-box / `review.js` fc-box / `export.js` import-drop
- **键盘委托扩展**: syllabus.js keydown + practice.js 新增全局 keydown（Enter/Space 触发）
- **focus-visible 扩展**: 新增 17 个选择器到 `:focus-visible` 焦点环规则

### 内联样式→CSS 类（~23 处）
- **practice.js** ~15 处: `pp-mark-tex` / `pp-filter-link` / `pp-parts-bar` / `pp-ms-placeholder` / `text-muted-sm` / `pp-self-assess-wrap` / `pp-self-assess-hint` / `pp-flag-label` / `pp-error-label` / `pp-wrong-icon` / `pp-wrong-review-count` / `pp-q-topic-cell`
- **syllabus.js** 4 处: 删除冗余 `position:relative` / `sec-kp-icon` / `sec-title-flush` / `font-mono`
- **export.js** 4 处: `import-desc` / `import-sub` / `import-sep` / `style="margin:0"` 删除

### 新 CSS 工具类（25 个）
`pp-mark-tex` / `pp-filter-link` / `pp-wrong-icon` / `pp-wrong-review-count` / `pp-error-label` / `pp-ms-placeholder` / `pp-self-assess-wrap` / `pp-self-assess-hint` / `pp-flag-label` / `pp-parts-bar` / `pp-q-topic-cell` / `text-muted-sm` / `sec-title-flush` / `sec-kp-icon` / `font-mono` / `import-desc` / `import-sub` / `import-sep`

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | 17 focus-visible 新选择器 + 25 新工具类 |
| `js/syllabus.js` | 10 处 role/tabindex + 4 处 inline→class + keydown 扩展 |
| `js/practice.js` | 17 处 role/tabindex + ~15 处 inline→class + 新 keydown 监听器 |
| `js/mastery.js` | 1 处 deck-row role/tabindex |
| `js/ui.js` | 1 处 next-step role/tabindex |
| `js/study.js` | 1 处 fc-box role/tabindex |
| `js/review.js` | 1 处 fc-box role/tabindex |
| `js/export.js` | 1 处 import-drop role/tabindex + 4 处 inline→class |
| `js/config.js` | v2.3.10 → v2.3.11 |

---

## [2.3.10] - 2026-03-08 — 质量优化批次 2（暗色模式补全 + 内联样式 + 可访问性 + 颜色变量化）

### 暗色模式
- **5 处硬编码颜色→变量**: `.star-dot.filled` → `--c-warning`、`.sec-journey-step.done` → `--c-status-green`、`.sec-module-done` → `--c-status-green`、`.plan-streak` → `--c-streak`、`.stt-popup-badge--translate` → `--c-primary-light`
- **Dark 模式 journey done**: 移除硬编码 `#66bb6a` / `#4caf50`，统一使用 `--c-status-green` 变量

### 可访问性
- **category-header / unit-header 键盘支持**: 添加 `role="button"` + `tabindex="0"` + `focus-visible` 焦点环
- **全局键盘委托**: Enter/Space 触发 category/unit 折叠（复用已有 keydown 监听器）

### 代码质量
- **8 处内联样式→CSS 类**: HHK vocab 模块 `sec-module-col/row`、deck-row `sec-deck-row-flush`、syllabus header `sec-flex-gap4`、health bar `sec-health-bar`、MQ type 右列 `mq-type-right`、mini stars `sec-mini-star`、focus areas margin 合并到 CSS
- **5 新 CSS 工具类**: `sec-health-bar` / `sec-flex-gap4` / `mq-type-right` / `sec-mini-star` / `sec-deck-row-flush`
- **`.pp-focus-areas` margin 合并**: `style="margin-top:6px"` → CSS `margin-top: 6px`

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | 5 处颜色→变量 + `.pp-focus-areas` margin 合并 + 5 新 CSS 类 + focus-visible |
| `js/syllabus.js` | 8 处 inline style→class |
| `js/mastery.js` | category/unit-header role+tabindex + 键盘委托 |
| `js/config.js` | v2.3.9 → v2.3.10 |

---

## [2.3.9] - 2026-03-08 — 质量优化批次（性能 + 暗色模式 + 可访问性 + 代码精简）

### 性能优化
- **Knowledge Card 惰性渲染**: 展开前仅存 `data-kc-raw` 属性，展开时才调用 `pqRender()`，减少初始 DOM 体积
- **编辑器预览防抖**: `_pqUpdatePreviewDebounced()` 300ms 防抖，避免逐字触发 KaTeX 渲染
- **Board 数据加载去重**: 6 个独立变量 → `_boardReady` / `_boardLoading` 对象，简化 `_loadBoardSyllabus`

### 暗色模式
- **CSS 状态颜色变量化**: 新增 6 个 `--c-status-*` 变量（red/orange/green 文字 + 背景），`:root` + `[data-theme="dark"]` 双层
- **14 处硬编码颜色替换**: `.pp-diff-core/ext` / `.pp-rate-btn` 三色 / `.pp-timer.danger` / `.pp-dot.done/wrong` / `.pp-results-pct` 三色
- **删除 10 行冗余 dark 覆盖**: 变量化后无需手动覆盖的 `.pp-diff-*` / `.pp-rate-btn.*` / `.pp-dot.*`

### 可访问性
- **focus-visible 补全**: `.quiz-dir-btn` / `.dq-pill` / `.pp-rate-btn` / `.pp-dot` 添加焦点环

### 代码质量
- **13 处内联样式→CSS 类**: 新增 9 个工具类（`sec-module-col/row` / `sec-mod-note/link/label/chips/btn-flex` / `mq-summary-count` / `sec-editor-subtitle`）
- **Unicode 感知截断**: `_truncTitle()` 中文字符占 2 宽度，KP 导航按钮不再溢出

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | +6 状态变量 + 14 处颜色→变量 + 删 10 行冗余 dark + 9 新 CSS 类 + focus-visible |
| `js/syllabus.js` | KC 惰性渲染 + 13 处 inline→class + board 加载去重 + `_truncTitle` |
| `js/practice.js` | 编辑器预览防抖 300ms |
| `js/config.js` | v2.3.8 → v2.3.9 |

---

## [2.3.8] - 2026-03-08 — 数据质量修复（内容审计 + 正则修复 + 13 条 ZH 翻译补全）

### 数据修复
- **Edexcel 6.3 content_zh 错误**: 原内容为知识模块内容，已替换为正确的中文例题翻译
- **13 条 Edexcel 中文考试技巧补全**: 1.1/1.2/1.3/1.5/2.1/2.3/2.4/2.5/2.7/4.3/4.4/4.6/4.7

### 正则修复
- **`_parseWorkedExamples` 正则增强**: 支持无编号 `<b>Worked Example</b>` 格式（影响 20 个 Edexcel 知识点）
- **marks 提取正则**: 支持 `(Higher) [2 marks]` 格式

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | 正则 `Worked Example \d+` → `Worked Example(?:\s+\d+)?` + marks 正则增强 |
| `scripts/seed-section-content.js` | +4 条 Edexcel Ch1 ZH 考试技巧 |
| `scripts/seed-ch2.js` | +5 条 Edexcel Ch2 ZH 考试技巧 |
| `scripts/seed-ch4.js` | +4 条 Edexcel Ch4 ZH 考试技巧 |
| `scripts/seed-ch5-6.js` | Edexcel 6.3 content_zh 修正 |
| `scripts/seed-ch*.sql` | 重新生成 SQL |
| `js/config.js` | v2.3.7 → v2.3.8 |

---

## [2.3.7] - 2026-03-08 — P3 质量优化（硬编码颜色 + 监听器泄漏 + 内联样式清理）

### CSS 新增
- **`.btn-warning` 类**: 统一 warning 按钮样式（`var(--c-warning)` + hover opacity），替代内联 style

### 硬编码颜色修复
- **Exam Mode 按钮**: 内联 `background/border-color/color` → `btn-warning` 类（syllabus.js）
- **Wrong Book 按钮**: 硬编码 `#ef5350` → `btn-danger` 类，暗色模式自适应（syllabus.js）
- **Mock Exam 按钮**: 内联样式 → `btn-warning` 类（practice.js）

### 监听器优化
- **editSectionModule**: `addEventListener` → `oninput`/`onfocus` 赋值式绑定，避免多次打开 modal 累积监听器

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | +2 行 `.btn-warning` |
| `js/syllabus.js` | 2 处 inline style→class + addEventListener→oninput/onfocus |
| `js/practice.js` | 1 处 inline style→class |
| `js/config.js` | v2.3.6 → v2.3.7 |

---

## [2.3.6] - 2026-03-08 — KP 模块 P2 优化（响应式 + 可访问性 + 暗色补全）

### 响应式适配
- **KP 手机端优化**: `@media (max-width:639px)` 缩减 `.kp-*` 组件 padding/font-size，适配小屏

### 可访问性增强
- **KP 行键盘导航**: `.kp-row` 添加 `role="button"` + `tabindex="0"` + `aria-label`
- **键盘事件委托**: Enter/Space 触发 KP 行/导航按钮/解析折叠
- **aria-expanded**: `.kp-example-toggle` 添加展开状态追踪

### 暗色模式补全
- **4 条 dark 规则**: `.kp-quiz-summary`/`.kp-quiz-score`/`.kp-quiz-result`/`.kp-example-solution` 暗色适配

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | +13 行 phone responsive + 4 行 dark mode 补全 |
| `js/syllabus.js` | KP 行 ARIA 属性 + aria-expanded + keydown 委托 |
| `js/config.js` | v2.3.5 → v2.3.6 |

---

## [2.3.5] - 2026-03-08 — Knowledge Card 语言切换 + 手机端优化

### UX 改进
- **Knowledge Card 语言切换**: 根据 `appLang` 选择 EN/ZH 版本显示，不再堆叠双语内容
- **手机端 we-card 优化**: `@media (max-width:639px)` 减小 padding/gap/font-size，适配小屏

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | Knowledge Card 渲染按 appLang 选语言 |
| `css/style.css` | we-card 手机端响应式规则 |
| `js/config.js` | v2.3.4 → v2.3.5 |

---

## [2.3.4] - 2026-03-08 — 质量修复（双击 bug + 语言切换 + 惰性渲染 + 箭头统一）

### Bug 修复
- **CRITICAL: 双击展开 bug**: `toggleSectionContent()` 从 `style.display` 检测改为 `classList.contains('d-none')`，修复所有可展开模块需点两次的问题
- **语言切换不刷新 section**: `toggleLang()` 新增 `'section'` 分支，切换语言后自动重新渲染当前知识点详情页

### 性能优化
- **惰性 pqRender**: 例题 body 存入 `data-we-raw`，首次展开时才 `pqRender()`

### UX 改进
- **箭头方向统一**: we-card 箭头从 ▶/▼ 改为 ▼/▲，与外层模块一致
- **CSS `--c-surface-hover`**: 新增设计 token（亮 `#E8E6FA` / 暗 `#2E2C50`）
- **marks 后多 `<br>` 清理**: regex 贪婪匹配连续 `<br>`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `toggleSectionContent` class 修复 + 惰性渲染 + 箭头统一 + `<br>` regex |
| `js/ui.js` | `toggleLang()` 新增 section 重渲染 |
| `css/style.css` | `--c-surface-hover` 亮/暗色 token |
| `js/config.js` | v2.3.3 → v2.3.4 |

---

## [2.3.3] - 2026-03-08 — 经典例题 UX 优化（手风琴卡片 + 语言切换）

### 例题渲染重构
- **手风琴卡片**: 将 worked examples 从整体展开改为逐条独立卡片，每张卡片可单独展开/收起
- **语言智能切换**: 根据 `appLang` 自动选择 EN/ZH 版本显示（非堆叠），fallback 到另一语言
- **延迟 KaTeX 渲染**: 仅在卡片展开时触发 `loadKaTeX()` + `renderMath()`，减少首次加载开销
- **副标题显示例题数**: "4 examples / 4 道例题" 替代 "Click to expand"

### 知识点精析质量修复（P0 + P1）
- **P0-1 Markdown 渲染引擎**: 新增 `kpMarkdown()` 函数（LaTeX 保护 + `**bold**` + 表格 + 段落），替换 6 处 `pqRender` 调用，修复精析/考法/例题/自测全部格式失效
- **P0-2 双语模式修复**: `getLang()` 函数不存在导致双语静默失败，新增 `_kpIsZh()` 替代
- **P0-3 多考试局变量修复**: `_cieSyllabus` / `_edxSyllabus` / `_hhkSyllabus` 未定义 → 改用 `BOARD_SYLLABUS[board]`
- **P1-4 详情页滚动归顶**: 切换 KP 时 `scrollTop = 0` + `window.scrollTo(0, 0)`
- **P1-5 导航按钮溢出**: 标题截断 25 字符 + CSS `max-width: 45%` + `text-overflow: ellipsis`
- **P1-6 自测完成滚动**: 全部答完后 `scrollIntoView` 到得分汇总
- **P2-7 CSS 清理**: 移除死代码 `.kp-coming` + 新增 `.kp-table` 表格样式 + 暗色模式

### Seed 合并脚本
- **`scripts/seed-all.sh`**: 合并 6 个 seed JS 脚本输出为单文件 SQL（BEGIN/COMMIT 事务包裹）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `_parseWorkedExamples()` + `toggleWeCard()` + `kpMarkdown()` + `_kpIsZh()` + P0/P1 修复（~60 行） |
| `css/style.css` | `.we-card` 样式 + `.kp-table` 表格样式 + 暗色模式 + 导航按钮溢出 |
| `scripts/seed-all.sh` | 新建 — 合并 6 个 seed 脚本 → 单文件 SQL |
| `js/config.js` | v2.3.2 → v2.3.3 |

---

## [2.3.2] - 2026-03-08 — 知识点精析 Chapter 1 内容扩充 + 经典例题 291 道

### 知识点精析 Phase 2.5
- **CIE Chapter 1 KP 数据扩充**: `knowledge-cie.json` 从 4 个 KP 扩充至 **14 个 KP**
  - 覆盖 Chapter 1 全部 8 个 section（1.1-1.8）
  - 新增 10 个 KP：Sets(2) + Index Laws(1) + Directed Numbers(1) + Fractions(2) + BIDMAS(1) + Rounding(2) + Standard Form(1)
  - 每个 KP 含：双语精析 + 2-3 典型考法 + 1-2 真题例题 + 2 道 MCQ 自测
- **Bug Fix**: `tqItem` null guard — 防止无 `testYourself` 数据时点击选项崩溃

### 内容扩充
- **CIE 0580 经典例题**: 72 个知识点的 worked examples 从 92 道扩充至 **291 道**
  - 每个知识点 3-5 道例题，覆盖 Core + Extended 难度层级
  - 格式统一：题目 + `[marks]` + Solution 步骤 + Exam Tip（双语英中）
  - Extended 级例题标记 `[marks — Extended]` / `[分 — 进阶]`
  - 使用 CIE 0580 命令词（calculate, find, show that, determine, explain）
  - LaTeX 数学公式完整（KaTeX 兼容）
- **章节分布**: Ch1 Number (~72) + Ch2 Algebra (~55) + Ch3 Coord Geo (~26) + Ch4 Geometry (~32) + Ch5-6 Mensuration & Trig (~48) + Ch7-9 Transform & Stats (~58)

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/seed-section-content.js` | Ch1 例题扩充（18 sections） |
| `scripts/seed-ch2.js` | Ch2 例题扩充（13 sections） |
| `scripts/seed-ch3.js` | Ch3 例题扩充（7 sections） |
| `scripts/seed-ch4.js` | Ch4 例题扩充（8 sections） |
| `scripts/seed-ch5-6.js` | Ch5-6 例题扩充（11 sections） |
| `scripts/seed-ch7-9.js` | Ch7-9 例题扩充（15 sections） |
| `scripts/seed-ch*.sql` | 6 个 SQL 种子文件（共 252 行 upsert） |
| `data/knowledge-cie.json` | 4→14 KP（+10 KP 覆盖 Ch1 sections 1.2-1.8） |
| `js/syllabus.js` | tqItem null guard 修复（行 2698） |
| `js/config.js` | v2.3.1 → v2.3.2 |

### 部署步骤
1. 运行 6 个 SQL 文件至 Supabase Dashboard SQL Editor
2. `section_edits` 表 72 行 CIE examples 数据更新

---

## [2.3.1] - 2026-03-08 — 知识点 Test Yourself MCQ 引擎 + 进度追踪

### 新功能
- **Test Yourself MCQ 引擎**: KP 详情页 Section ④ 从占位符升级为可交互的内联 MCQ 测试
  - 所有题目一次性展示（每 KP 2-4 题）
  - 点击选项 → 即时判对错 → 正确/错误边框 + 音效 → 展开解析
  - 全部答完 → 显示得分汇总
  - 历史成绩显示 + Retry 重试按钮
- **进度追踪**: `saveKPResult()` / `getKPResult()` / `isKPDone()` — localStorage 持久化 + 云端同步
- **KP 列表状态**: Section 详情页知识点行显示 ✓ 2/2（满分绿色）/ 1/2（部分橙色）/ NEW（未做紫色）
- **Hero 区域分数**: KP 详情页标题下显示历史得分
- **getSectionHealth 集成**: 新增 `knowledgeScore` 维度（3 维权重 0.3/0.4/0.3），纳入推荐逻辑

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | +3 函数 `saveKPResult` / `getKPResult` / `isKPDone` |
| `js/syllabus.js` | ④ 占位符 → MCQ 渲染 + 事件委托 + KP 行状态 + Hero 分数 + getSectionHealth knowledgeScore |
| `css/style.css` | +32 行 `.kp-quiz-*` 样式 + 暗色模式 |
| `js/config.js` | v2.3.0 → v2.3.1 |

---

## [2.3.0] - 2026-03-08 — 知识点精析模块 Phase 1（数据架构 + 展示）

### 新功能
- **知识点精析模块**: 将密集的单块知识卡片拆分为独立知识点模块，每个模块包含 5 个区域：
  - ① 知识点精析 Explanation（双语富文本 + LaTeX）
  - ② 典型考法 Exam Patterns（左侧紫色竖条标识）
  - ③ 典型例题 + 解析 Worked Examples（折叠/展开解答）
  - ④ Test Yourself 自测（Phase 2 占位）
  - ⑤ 相关资源 Related Resources（词汇/练习跳转）
- **知识点列表**: Section 详情页 Knowledge Card 替换为可展开的知识点列表，点击行进入详情页
- **KP 导航**: 详情页底部 Prev/Next 导航 + 顶部返回按钮
- **数据架构**: `data/knowledge-cie.json` 存储知识点数据（JSON 离线可用），4 个示例 KP 覆盖 Section 1.1 + 1.3
- **无知识点数据时回退**: 保留原知识卡片展示或显示 "Coming soon"

### UI 设计（呼吸感 + 亲和力）
- 卡片圆角 16px、内距 24px、区域间距 20px、正文行高 1.8
- 圆形编号（1-5）浅紫背景标识区域
- 考法卡片左侧 3px 紫色竖条
- 例题解答折叠按钮（pill 形状 + 渐变背景）
- 全套暗色模式适配

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/knowledge-cie.json` | **新建** — 4 个知识点（Section 1.1 × 3 + 1.3 × 1）|
| `index.html` | +1 行 `panel-kp`，版本号 → 2.3.0 |
| `css/style.css` | +80 行 `.kp-*` 组件样式（列表/详情/考法/例题/资源/导航 + 暗色模式）|
| `js/syllabus.js` | 替换 Knowledge Card 块 → KP 列表渲染 + 回退逻辑；+170 行 `loadKnowledgeData()` / `getKPsForSection()` / `openKnowledgePoint()` / `renderKPDetail()` + 事件委托 |
| `js/config.js` | v2.2.27 → v2.3.0 |

---

## [2.2.27] - 2026-03-08 — 事件委托 bug 修复 + DOM 查询优化

### 修复
- **practice.js 委托冲突 bug**: `startPracticeReview` 和 `renderPracticeReview` 共用 `_pqReviewDelegated` 标志导致编辑按钮 handler 从未绑定；合并两个委托块到 `renderPracticeReview`，统一处理 edit/filter/topic 三种点击

### 优化
- **quiz.js DOM 查询**: `querySelectorAll` 遍历所有选项找正确答案 → `querySelector('[data-correct="1"]')` 直接定位
- **admin.js 代码抽取**: 两处相同 `querySelectorAll('.action-menu.open')` 关闭逻辑 → 抽取 `_closeAllActionMenus()` 复用

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 合并两个委托块，修复编辑按钮从未绑定的 bug |
| `js/quiz.js` | querySelectorAll→querySelector 优化 |
| `js/admin.js` | 抽取 `_closeAllActionMenus()` |
| `js/config.js` | v2.2.26 → v2.2.27 |

---

## [2.2.26] - 2026-03-08 — 划词翻译第二轮优化

### 增强
- **复制按钮**: 翻译/词典/词库结果均可一键复制（Clipboard API + execCommand 兼容）
- **同文本检测**: 百度返回 dst === src 时视为无翻译，自动降级 Dict API
- **纯数字/符号跳过**: 选中 "123" "+" 等不触发 API 请求
- **网络错误提示**: 翻译失败显示红色"翻译失败"1.5s 后自动消失（不再静默）
- **sessionStorage 持久缓存**: 百度翻译结果页面刷新不丢失
- **展开/收起文本修复**: 收起后恢复原始 "+N more" 文本（`data-stt-more-label`）
- **移除未使用的 `_escAttr` 函数**

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/translate.js` | +`_sttCopyText()` + `_showSTTError()` + `_isTranslatable()` + `_sttPersistBaidu()` + dst===src 检测 |
| `js/config.js` | v2.2.25 → v2.2.26 |

---

## [2.2.25] - 2026-03-08 — 空引用防护 + 性能优化

### 修复
- **showNudge 空引用防护**: `el.querySelector('.guide-nudge-close')` 添加 null check，防止 DOM 异常时崩溃
- **spell.js input 防护**: `E('spell-input')` 添加 null check 后再绑定 keydown 监听器
- **export.js 性能优化**: `getWordData()` 从 `getAllWords().map()` 循环内提取到局部变量，避免 2,200 次冗余函数调用

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | showNudge close 按钮 null check |
| `js/export.js` | getWordData() 缓存到局部变量 |
| `js/spell.js` | input null check |
| `js/config.js` | v2.2.24 → v2.2.25 |

---

## [2.2.24] - 2026-03-08 — 划词翻译质量优化

### 优化
- **ESC 键关闭**: 按 Escape 关闭翻译浮层
- **滚动时关闭**: 页面滚动自动隐藏浮层（capture 监听，含嵌套容器）
- **onclick XSS 消除**: 所有按钮改用 `data-stt-*` 属性 + 事件委托，消除 6 处 inline onclick
- **缓存上限**: `_sttBaiduCache` + `_sttDictCache` 各限 200 条，超出时淘汰最早 50 条
- **打印隐藏**: `.stt-popup` 加入 `@media print` 隐藏列表
- **重复代码抽取**: `_sttReposition()` 统一 3 处 `requestAnimationFrame` 定位逻辑
- **_escHtml 加固**: 增加 `"` → `&quot;` 转义

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/translate.js` | 事件委托重构 + ESC/scroll 监听 + LRU 缓存 + _sttReposition 抽取 |
| `css/style.css` | `.stt-popup` 加入 print 隐藏 |
| `js/config.js` | v2.2.23 → v2.2.24 |

---

## [2.2.23] - 2026-03-08 — 渐进解锁系统质量优化 (Progressive Unlock Quality Fix)

### 修复
- **XSS 消除**: mastery.js 锁定按钮（行 849/874）+ syllabus.js 锁定行（行 490）移除 inline `onclick`，改用 `data-locked-msg` 属性 + 顶层事件委托 `_handleLockedClick()`
- **HHK 解锁 bug**: `isSectionUnlocked` fallback 路径对 HHK board 使用 `_getHHKSectionStats`（多 vocabSlug 聚合），而非 `getDeckStats` 单 level 查询
- **竞态条件**: `migrateForceUnlock()` 移除一次性 `wmatch_forceUnlocked_done` 标记，改为幂等追加；调用时机从 `initApp` 移到每个 `_loadBoardSyllabus` 完成后

### 增强
- **性能优化**: `isFeatureUnlocked()` 缓存 `getUserStage().stage` 结果 5 秒；`_renderSectionRow` 返回 `{html, stats}` 传递 prevStats 给下一行，避免重复 `getDeckStats` 调用
- **可访问性**: 锁定按钮/行添加 `aria-disabled="true"` + `tabindex="-1"` + `title` 说明解锁条件

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | +`_handleLockedClick()` 事件委托 + `isFeatureUnlocked()` stage 缓存 |
| `js/mastery.js` | 锁定按钮 `onclick` → `data-locked-msg` + `aria-disabled` + `tabindex` |
| `js/syllabus.js` | 锁定行 `onclick` → `data-locked-msg` + `_renderSectionRow` 返回 `{html,stats}` + prevStats 传递 + syllabus 加载后调 `migrateForceUnlock` |
| `js/storage.js` | `isSectionUnlocked` +prevStats 参数 + HHK fallback + `migrateForceUnlock` 幂等化 |
| `js/app.js` | 移除 `migrateForceUnlock` 调用（已迁移到 syllabus.js） |
| `js/config.js` | v2.2.22 → v2.2.23 |

---

## [2.2.22] - 2026-03-08 — 百度翻译接入 (Baidu Translate Integration)

### 增强
- **百度翻译 API**: 词库外文字通过 Supabase Edge Function 代理调用百度翻译，实现英↔中双向翻译
- **三层查找链**: 本地词库 → 百度翻译（EN↔ZH）→ Free Dictionary API（英英释义 + 发音）
- **Translation badge**: 翻译结果标注蓝色 "翻译" 徽章 + 方向标识（EN → ZH / ZH → EN）
- **密钥安全**: APP ID + Secret Key 存储在 Supabase 环境变量，前端不暴露

### 文件变更
| 文件 | 变更 |
|------|------|
| `supabase/functions/translate/index.ts` | **新建** — Edge Function 代理百度翻译 API（MD5 签名 + 错误处理） |
| `js/translate.js` | +`_fetchBaiduTranslate()` + `_showBaiduPopup()` + `_sttBaiduCache` + 查找链重构 |
| `css/style.css` | +2 行（.stt-popup-badge--translate + .stt-popup-dir） |
| `js/config.js` | v2.2.21 → v2.2.22 |

---

## [2.2.21] - 2026-03-08 — 渐进解锁系统 (Progressive Unlock)

### 新增
- **模式解锁链**: Study 始终可用 → Quiz 需完成 Study → Review 需完成 Quiz → Spell/Match/Battle 需完成 Study；未解锁按钮显示 🔒 + 低透明度
- **知识点顺序解锁**: 每章首个 section 始终开放，后续需前一个 section learningPct ≥ 80%；老用户已有进度自动 force-unlock（一次性迁移）
- **徽章前置链**: 掌握链（first_word → ten_words → hundred_club → five_hundred）、连续链（streak_3 → streak_7 → streak_30）、弱依赖（quiz_perfect/first_section/srs_master/all_modes → first_word）
- **阶段功能门控**: new(0-10词) 只有 Study/Quiz → active(11-100) 解锁 Review/Spell/Match/Battle/Practice → intermediate(101-500) 解锁 Diagnostic → advanced(501+) 解锁 Mock
- **入口双重防护**: 5 个模式入口函数 + Diagnostic/Mock 均加 unlock + feature 检查，防止绕过 UI 直接调用

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | +`isModeUnlocked()` + `isSectionUnlocked()` + `migrateForceUnlock()` + BADGES `prereq` 字段 + `checkBadges` prereq 检查 |
| `js/mastery.js` | `renderDeck()` 路径模式 + 额外模式按钮 lock 渲染（`mode-btn-locked` + 🔒） |
| `js/syllabus.js` | `_renderSectionRow()` 新增 secIdx/prevSecId 参数 + 锁定渲染 + `openSection()` 防护 |
| `js/ui.js` | +`STAGE_ORDER` + `FEATURE_STAGE` + `isFeatureUnlocked()` |
| `js/practice.js` | `startDiagnostic()` + `ppShowMockSetup()` 入口 feature 防护 |
| `js/quiz.js` | `startQuiz()` 入口 mode + feature 防护 |
| `js/review.js` | `startReview()` 入口 mode + feature 防护 |
| `js/spell.js` | `startSpell()` 入口 mode + feature 防护 |
| `js/match.js` | `startMatch()` 入口 mode + feature 防护 |
| `js/battle.js` | `startBattle()` 入口 mode + feature 防护 |
| `js/app.js` | initApp 调用 `migrateForceUnlock()` |
| `css/style.css` | +`.mode-btn-locked` + `.mode-lock` 样式（含暗色模式） |
| `js/config.js` | v2.2.20 → v2.2.21 |

---

## [2.2.20] - 2026-03-08 — 划词翻译词典回退 (Dictionary API Fallback)

### 增强
- **词典 API 回退**: 词库外的英文词自动调用 Free Dictionary API，显示英文定义 + 音标 + 发音音频
- **发音播放**: 🔊 按钮播放 API 提供的 MP3 发音
- **加载状态**: API 查询期间显示"查询中…"
- **请求管理**: AbortController 取消旧请求 + 内存缓存避免重复调用
- **Dictionary badge**: 词典结果标注紫色 "Dictionary" 徽章，与词库结果区分
- **词性标注**: 每条释义显示 part of speech（noun/verb/adjective…）+ 例句

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/translate.js` | +`_fetchDictAPI()` + `_showDictPopup()` + `_isEnglish()` + `_sttPlayAudio()` + `_sttDictCache` |
| `css/style.css` | +8 行词典样式（phonetic + audio + dict-def + pos + example + loading） |
| `js/config.js` | v2.2.19 → v2.2.20 |

---

## [2.2.19] - 2026-03-08 — 引导流程优化（防抖 + 里程碑 + 连续激励）

### 体验优化
- **Nudge 30 分钟冷却**: 连续完成多个模式不再密集弹 nudge，内存级变量页面刷新自动重置
- **徽章庆祝排队**: 多徽章同时解锁时依次播放（4.5s 间隔），不再叠加 DOM
- **首词引导下一步**: `first_word` 徽章解锁后 5s 弹 nudge 引导尝试测验模式
- **连续学习临中断提醒**: streak ≥1 且 20-48h 未活动时首页提醒做 Daily Challenge
- **阶段升级庆祝**: new→active / active→intermediate / intermediate→advanced 升级弹 nudge 庆祝
- **模式发现重置**: 阶段升级后清除 `wmatch_disc_*` dismissal 记录，发现芯片重新出现

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | +4 行：`_lastNudgeShownAt` 冷却变量 + `showNudge()` 入口 30 分钟防抖 |
| `js/storage.js` | +10 行：徽章 `forEach` 增加 `setTimeout(idx * 4500)` 排队 + `first_word` 引导 nudge |
| `js/mastery.js` | +32 行：`renderHome()` 末尾 streak-at-risk 检查 + 阶段升级庆祝 + 发现重置 |
| `js/config.js` | v2.2.18 → v2.2.19 |

---

## [2.2.18] - 2026-03-08 — 划词翻译 (Select-to-Translate)

### 新功能
- **划词翻译**: 选中页面文字自动匹配词库翻译，弹出浮层显示词义 + 学习状态 + 星级
- **双向查找**: 英→中 / 中→英，支持基础英文词干还原 (-s/-es/-ed/-ing/-ies)
- **操作按钮**: "开始学习"（新词→recordAnswer）+ "打开词组"（→openDeck 跳转）
- **多匹配展开**: 同一词出现在多个 level 时显示 "+N more" 可展开
- **设置开关**: Guest 和登录用户均可在设置中启用/禁用
- **干扰防护**: Battle/Match/Daily 模式 + Modal 弹窗时不触发

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/translate.js` | **新建** — 反向索引 + 浮层弹出 + selectionchange 监听 + 加入复习 |
| `css/style.css` | +18 行 `.stt-popup` 组件样式（fixed 定位 + 暗色模式自动适配） |
| `index.html` | Toast 前新增 `#stt-popup` 容器 |
| `js/auth.js` | Guest + 登录用户设置增加划词翻译 toggle + saveSettings 保存 |
| `js/ui.js` | `showApp()` 调用 `initTranslate()` |
| `js/storage.js` | `invalidateCache()` 清除 `_sttIndex` |
| `scripts/minify.sh` | bundle 列表增加 `js/translate.js` |
| `js/config.js` | v2.2.17 → v2.2.18 |

---

## [2.2.17] - 2026-03-08 — 性能优化第二轮 + 引导系统质量修复

### 性能优化
- **syllabus.js**: `_hhkSlugIdx` slug→idx 索引缓存 — `_getHHKSectionStats` 从 O(264)×36 sections 全量扫描 → O(vocabSlugs.length)×36 索引查找
- **syllabus.js**: `_renderBoardHome` 共享 `wd` — `getWordData()` 从每 section 各调用 1 次 → 全局 1 次共享
- **syllabus.js**: `_renderSectionRow` 加 `_wd` 参数透传，避免重复 `getWordData()`
- **mastery.js**: 非 CIE 分支补充 `var wd = getWordData()` — 修复 `wd` 未声明 BUG（每次 fallback 多余判断）
- **storage.js**: `invalidateCache()` 清除 `_hhkSlugIdx`

### 引导系统质量修复（可访问性 + 响应式 + 健壮性）
- **可访问性**: nudge 关闭按钮 `aria-label="Close"` + 动作按钮 `aria-label` + nudge `role="status"`
- **可访问性**: badge-celebration `role="status"` + `aria-live="polite"` — VoiceOver 可读
- **可访问性**: return-recap `role="status"` + `aria-live="polite"` + 可关闭 × 按钮
- **可访问性**: discover-close `role="button"` + `tabindex="0"` + Enter/Space 键盘支持
- **触摸目标**: nudge-btn / nudge-close / discover-close / recap-close 最小 36px 触摸区域
- **iPhone 安全区**: badge-celebration `padding-top: env(safe-area-inset-top)` 适配刘海
- **响应式**: `@media (max-width:639px)` 断点 — nudge/recap/discover/badge 字号间距收紧
- **focus-visible**: nudge 按钮 + discover close 键盘聚焦样式
- **ESC 键**: nudge 支持 ESC 键关闭
- **打印**: guide-nudge/badge-celebration/return-recap/hero-discover 加入 print 隐藏列表

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `_hhkSlugIdx` 索引 + `_ensureHHKSlugIdx()` + `_getHHKSectionStats` 重写 + `_renderBoardHome` 共享 wd + `_renderSectionRow` 加 `_wd` 参数 |
| `js/mastery.js` | 非 CIE 分支 wd 声明 + return-recap aria-live + 可关闭 + discover keyboard 支持 |
| `js/storage.js` | `invalidateCache()` 清除 `_hhkSlugIdx` |
| `js/ui.js` | nudge aria-label + role + ESC 键 + badge-celebration aria-live |
| `css/style.css` | +35 行：触摸目标 + safe-area + focus-visible + 响应式断点 + print 隐藏 |
| `js/config.js` | v2.2.16 → v2.2.17 |

---

## [2.2.16] - 2026-03-08 — renderHome 性能优化 + 引导系统

### 性能优化
- **mastery.js**: `_catLevelIndex` 分类索引缓存 — LEVELS 2× 全量扫描 O(N) → 1× 建索引 + O(1) 查找
- **mastery.js**: `scheduleRenderHome()` 微任务合并 — 初始化期间 2-3 次重复渲染合并为 1 次
- **admin.js**: `initTeacher` 内 `renderHome()` → `scheduleRenderHome()`
- **syllabus.js**: board data ready 回调 `renderHome()` → `scheduleRenderHome()`
- **storage.js**: `invalidateCache()` 清除 `_catLevelIndex`

### 引导系统
- **ui.js**: Nudge Engine 引导提示 + 徽章庆祝动画 + 模式发现芯片 + 返回回顾 + 计划洞察
- **mastery.js**: Hero Action Card + 模式发现 + 快速统计 + 返回回顾渲染
- **css/style.css**: 引导系统完整样式（nudge/badge-celebration/hero-discover/return-recap/plan-insight + 暗色模式）
- **battle.js/quiz.js/spell.js/study.js**: 学习模式完成后触发引导检查

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | `_catLevelIndex` 索引缓存 + `scheduleRenderHome()` + Hero/Stats/Discovery 渲染 |
| `js/storage.js` | `invalidateCache()` 清除 `_catLevelIndex` |
| `js/admin.js` | `renderHome()` → `scheduleRenderHome()` |
| `js/syllabus.js` | `renderHome()` → `scheduleRenderHome()` |
| `js/ui.js` | Nudge Engine + Badge Celebration + 模式发现 |
| `js/battle.js` | 完成后触发引导检查 |
| `js/quiz.js` | 完成后触发引导检查 |
| `js/spell.js` | 完成后触发引导检查 |
| `js/study.js` | 完成后触发引导检查 |
| `css/style.css` | 引导系统样式 + 暗色模式适配 |
| `js/config.js` | v2.2.15 → v2.2.16 |

---

## [2.2.15] - 2026-03-08 — 超级管理员功能加载优化

### 性能优化
- **auth.js**: `loadAndInitTeacher()` 重写 — teachers 表查询 2 次→1 次（完整字段一次取完）；board/homework/admin 三资源 `Promise.all` 并行加载
- **auth.js**: admin 脚本加载从 3 个串行请求（admin.js → vocab-admin.js → data-admin.js）改为 1 个 minified bundle
- **admin.js**: `initTeacher(prefetchedData)` 接受预取数据参数，有值时跳过 DB 查询；未传参时保留 fallback 查询

### 构建
- **minify.sh**: 新增 admin bundle — `cat admin.js vocab-admin.js data-admin.js | esbuild → admin.bundle.min.js`（66K / 17K gzip）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/auth.js` | `loadAndInitTeacher()` 重写：单次查询 + Promise.all 并行 + bundle 加载 |
| `js/admin.js` | `initTeacher(prefetchedData)` 接受预取数据，跳过重复查询 |
| `scripts/minify.sh` | 新增 admin bundle 构建 + ls/gzip 统计 |
| `js/config.js` | v2.2.14 → v2.2.15 |

---

## [2.2.14] - 2026-03-08 — getSectionInfo O(1) 缓存 + 防御性修复

### 性能优化
- **syllabus.js**: `getSectionInfo()` 增加 `_sectionInfoCache` 哈希缓存，首次查找后 O(1) 命中；board 数据加载时自动失效

### 防御性修复
- **homework.js**: `renderHwProgress` 2 处 + `startHwTest` 1 处 Supabase 调用增加显式 error 检查

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `_sectionInfoCache` + `getSectionInfo()` 缓存逻辑 + board 加载时清缓存 |
| `js/homework.js` | 3 处 Supabase rpc/select 加 error 检查 |
| `js/config.js` | v2.2.13 → v2.2.14 |

---

## [2.2.13] - 2026-03-08 — 性能优化 + 防御性修复

### 防御性修复
- **storage.js**: 2 处 Supabase upsert（vocab_progress / leaderboard）增加 error 检查，失败时立即 return 阻止后续写入

### 性能优化
- **homework.js**: deck_slugs 线性搜索 LEVELS → `getLevelIdxBySlug()` O(1) 查找
- **syllabus.js**: getSectionHealth HHK SRS 聚合从 O(N) 全量 LEVELS 遍历 → O(M) vocabSlugs.forEach + `getLevelIdxBySlug()`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | 2 处 upsert 加 error 检查 |
| `js/homework.js` | L1144 线性搜索 → `getLevelIdxBySlug()` |
| `js/syllabus.js` | L960-972 O(N) → O(M) vocabSlugs 遍历 |
| `js/config.js` | v2.2.12 → v2.2.13 |

---

## [2.2.12] - 2026-03-08 — 暗色模式完备性修复

### 暗色模式硬编码颜色清理
- **PP 模块状态标签**: `needs-work/partial/mastered` 改用 `--c-danger-bg/--c-warning-bg/--c-success-bg` CSS 变量，暗色模式自动适配
- **PP 试卷类型标签**: `pp-type-core/pp-type-ext` 同上改用语义色变量
- **PP 图片背景**: `background: #fff` → `var(--c-bg)`，暗色模式不再白色刺眼

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | 4 处硬编码 `#fff/#ffebee/#fff3e0/#e8f5e9` → CSS 变量 |
| `js/config.js` | v2.2.11 → v2.2.12 |

---

## [2.2.11] - 2026-03-08 — 性能优化 + 防御性修复

### 性能优化
- **O(1) slug→index 查找**: 新增 `getLevelIdxBySlug()`，`_levelSlugMap` 改存 `{level, idx}` 对象
- **syllabus.js**: 5 处 LEVELS 线性搜索（quiz done / level resolve / sub-deck rows / practice done / section health）→ O(1)
- **app.js**: 2 处 URL deep linking 线性搜索 → `getLevelIdxBySlug()` O(1)

### 防御性修复
- **practice.js**: 删除重复 `_pqReviewDelegated` 变量声明；`.upload()` 补 `.catch()` 防静默失败
- **homework.js**: 6 处 Supabase 调用增加 `error` 检查（csRes / res / rRes / upsert×2 / tRes.single()×2）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | `_levelSlugMap` 改存 `{level, idx}` + 新增 `getLevelIdxBySlug()` + v2.2.11 |
| `js/syllabus.js` | 5 处 O(N) → O(1) slug 查找 |
| `js/app.js` | 2 处 O(N) → O(1) slug 查找 |
| `js/practice.js` | 删重复变量 + upload .catch() |
| `js/homework.js` | 6 处 Supabase 错误检查 |

---

## [2.2.10] - 2026-03-08 — 性能优化 + homework.js 重构

### 性能优化
- **O(1) 词库查找**: 新增 `getLevelBySlug()` 懒初始化哈希索引，替代 O(N) 线性遍历
- **homework.js**: 3 处 `LEVELS` 线性搜索重构为 `getLevelBySlug()` 调用（O(N×M) → O(N)）

### homework.js 内联样式清理
- 进一步减少 homework.js 中的内联样式，迁移至 CSS 工具类

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | 新增 `_levelSlugMap` + `getLevelBySlug()` 函数 |
| `js/homework.js` | 3 处线性搜索→O(1) 查找 + 内联样式清理 |

---

## [2.2.9] - 2026-03-08 — CIE/Edexcel 数据一致性修复

### 数据一致性审计 + 修复
- **EDX cat 字段标准化**: `number/algebra/geometry/statistics` → `edx-number/edx-algebra/edx-functions/edx-geometry/edx-mensuration/edx-statistics`（1,855 题全部更新，按 syllabus 章节精确映射 6 个分类）
- **EDX difficulty 标签适配**: `_ppDiffLabel()` 区分 CIE (Core/Extended) 和 EDX (Foundation d1-3/Higher d4-6)，修复 EDX d≥3 误显示为 "Core" 的 bug
- **EDX 编辑对话框**: difficulty 下拉改为 Foundation D1-D6 / Higher D4-D6（原固定 Core/Extended/Advanced 三选项）
- **DQ 规则同步**: 新增 `underline` 规则（JS 30→31 条，与 Python 脚本 28 条对齐）

### 审计发现记录（暂不修复）
- CIE 326 题（7.9%）缺少 section ID `s` 字段，分布在 153 套卷中（需回溯原始数据源）
- EDX 缺少 `topics/cognitive/g/topic` 字段（与 CIE schema 不同，PP 模块不依赖这些字段）
- CIE 278 题缺少 `cognitive` 字段

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/papers-edx.json` | 1,855 题 cat 字段标准化（4→6 分类，加 `edx-` 前缀） |
| `js/practice.js` | `_ppDiffLabel()` 增加 board 参数 + EDX 编辑对话框 difficulty 适配 |
| `js/data-admin.js` | 新增 `underline` DQ 规则（30→31 条） |
| `js/config.js` | v2.2.8 → v2.2.9 |

---

## [2.2.8] - 2026-03-08 — 深度内联样式清理（20 文件 173 处）

### CSS 工具类扩展
- **布局类**: `.page-header` / `.page-header--mb12/20` / `.result-stats` / `.result-stat-val` / `.result-stat-label`
- **字体类**: `.font-display` / `.font-mono` / `.btn-lg` / `.sub-heading`
- **颜色变体**: `.srs-row-dot--primary/danger/warning/success/light`（替代 7 处内联 background）
- **间距**: `.mb-4/16/20` / `.pt-40` / `.pb-40`

### 20 文件全覆盖清理
- **总量**: 436→263 处（消除 173 处静态内联样式）
- **practice.js**: 134→77（-57）
- **homework.js**: 99→73（-26）
- **syllabus.js**: 53→35（-18）
- **app.js**: 20→8（-12）
- **admin.js**: 15→10（-5）
- **battle.js**: 9→4（-5）
- **其他 14 文件**: 合计 -50

### 修复
- admin.js 重复 class 属性修复
- 剩余 263 处均为动态值（width:X% / color:'+var+'）或唯一布局样式

---

## [2.2.7] - 2026-03-08 — 真题数据质量深度修复 + DQ 规则扩展 + 离线构建完善

### 数据质量深度修复（第二轮，2,295 处）
- **EDX \dotfill 清除**: 1,722 题中的 PDF 答题空格标记 → 换行符
- **EDX \item 清除**: 127 题列表标记移除（内容已有 **(a)/(b)** 标号）
- **EDX enumerate/itemize**: 30 题列表环境包装移除
- **CIE \currfiledir**: 14 题不可渲染图片引用 → `[Diagram]` 占位符（含 `\includegraphics` + `\IfFileExists` + `InsertScreenShot` 三种模式）
- **CIE \centering**: 27 题布局命令移除
- **通用修复**: textit(57) → `*italic*` / fbox(11) → 内容 / phantom(9) → 删除 / enumerate(42) / figure(7) / large(4) / bigskip(6) / hfill(3) / mbox(2) / noindent 等
- **修复后验证**: ERROR=0, 残余 250 项均在 `$...$` 数学模式内（quad 65 + text 183 + underline 2）

### DQ 规则扩展（15→30 条）
- **新增 15 条检测+自动修复规则**: dotfill / centering / textit / item / enumerate / figure / fbox / phantom / large / hfill / bigskip / currfiledir / noindent / mbox（含 currfiledir 三模式匹配）
- **总规则数**: 30 条（14 error/warn + 16 info），26 条支持 Auto-Fix

### 离线构建修复
- **`scripts/build-single.py`**: 新增 `_offlinePapersEdx` 数据文件 + fetch override 映射，离线模式支持 Edexcel 真题

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/fix-papers-quality.py` | 新增 15 条修复规则（dotfill/centering/textit/item/enumerate/figure/fbox/phantom/large/noindent/mbox/hfill/bigskip/currfiledir/underline） |
| `js/data-admin.js` | DQ_RULES 15→30 条，新增 15 条检测+Auto-Fix 规则 |
| `scripts/build-single.py` | 新增 papers-edx.json 离线构建支持 |
| `data/papers-cie.json` | 修复 73 题（centering/figure/fbox/phantom/currfiledir/bigskip/textit/large/mbox/enumerate） |
| `data/papers-edx.json` | 修复 1,728 题（dotfill/item/enumerate/textit/fbox/phantom/large/hfill/centering） |
| `js/config.js` | v2.2.5 → v2.2.7 |

---

## [2.2.6] - 2026-03-08 — Admin UI 一致性优化 + CSS 工具类系统

### Admin 面板 UI 统一
- **Header**: flex 布局 + badge 式学校名显示
- **Tabs**: 横向滚动 + 隐藏滚动条 + hover 底色效果
- **Summary Cards**: hover 上浮变换 + 统一尺寸
- **Dark Mode**: 补全 admin 全组件暗色规则（卡片、表格、pills、header）

### CSS 工具类系统（45 个新类）
- **btn-row**: 替代 40+ 处 `style="display:flex;gap:8px;margin-top:Npx"` + `style="flex:1"` 内联样式
- **text-***: text-danger / text-muted / text-sub / text-success / text-warning / text-primary / text-center / text-sm / text-xs
- **mt-***: mt-0 / mt-4 / mt-8 / mt-12 / mt-16 / mt-20 / mt-24 + mb-0 / mb-8 / mb-12
- **flex-***: flex / flex-1 / flex-wrap / flex-col / items-center / justify-between
- **btn-icon-danger**: 统一小型删除按钮（padding + color + hover 效果）

### 6 个 JS 文件内联样式清理
- `admin.js` — 7 处 modal 按钮行 → `.btn-row`
- `auth.js` — 3 处设置/重置/Guest modal → `.btn-row`
- `data-admin.js` — 3 处 DQ modal → `.btn-row`
- `vocab-admin.js` — 4 处 + 删除按钮 → `.btn-icon-danger` + 序号 → `.text-sub`
- `homework.js` — 2 处 + 自定义词行 → `.hw-custom-row` CSS 类 + 删除按钮 → `.btn-icon-danger`

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | +100 行（admin UI 优化 + 45 个工具类 + hw-custom-row） |
| `js/admin.js` | 7 处 inline→class 替换 |
| `js/auth.js` | 3 处 inline→class 替换 |
| `js/data-admin.js` | 3 处 inline→class 替换 |
| `js/vocab-admin.js` | 6 处 inline→class 替换 |
| `js/homework.js` | 4 处 inline→class 替换 + cssText 移除 |

---

## [2.2.5] - 2026-03-08 — CIE/Edexcel 真题数据质量批量修复

### 批量修复 2,901 处 LaTeX 质量问题
- **修复范围**: CIE 709 处 + Edexcel 2,192 处，涉及 2,213 题（CIE 685 + EDX 1,528）
- **13 条修复规则**: spacing/textbf/center/quad/tmarker/degree/pounds/minipage/renewcmd/hspace/subparts/parts/text_cmd
- **自动修复**: `\\[Xcm]` 间距删除、`\textbf{}` → `**bold**`、`\begin{center}` 删除、`\quad` 外 → em-space、`t ` 行首标记删除、`\degree` → °、`\pounds` → £、`\begin{minipage}` 删除、`\renewcommand` 删除、`\hspace/\vspace` 删除
- **结构修复**: `\begin{subparts}` + `\begin{parts}` → `(a)/(b)/(c)` 纯文本标号（48 + 51 题）
- **语义修复**: `\text{}` 在数学模式外 → 移除包装保留内容（234 题原始，修复后仅剩 183 题在 `$...$` 内合法保留）
- **修复后验证**: ERROR=0, 残余 65 `\quad` + 183 `\text{}` 均在 `$...$` 数学模式内（合法保留）

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/fix-papers-quality.py` | 新建 — 批量修复脚本（13 规则 + scan + apply） |
| `data/papers-cie.json` | 修复 685 题中 709 处 LaTeX 问题 |
| `data/papers-edx.json` | 修复 1,528 题中 2,192 处 LaTeX 问题 |
| `js/config.js` | v2.2.4 → v2.2.5 |

---

## [2.2.4] - 2026-03-08 — HHK 练习题扩容 Y8-Y11

### HHK MCQ 扩容（44 sections × 5 = 220 道新增）
- **覆盖范围**: Y8 (9 sections, 45 题) + Y9 (12 sections, 60 题) + Y10 (12 sections, 60 题) + Y11 (11 sections, 55 题)
- **题目编号**: h056-h275，与 Y7 h001-h055 连续
- **题型**: 四选一 MCQ，含 LaTeX 数学公式，4 种诊断类型 (calc/concept/vocab/logic)
- **难度分布**: 每 section d1×2 + d2×2 + d3×1（Y8.1/Y8.2/Y8.6 为 d1×3 + d2×2）
- **答案分布**: a=0 (49), a=1 (65), a=2 (58), a=3 (48)，避免答案集中
- **HHK 总量**: 55→275 道 MCQ，覆盖率 20%→100%（55/55 sections）

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/questions-25m.json` | 55→275 题，追加 220 道 Y8-Y11 MCQ |
| `js/config.js` | v2.2.3→v2.2.4 |

---

## [2.2.3] - 2026-03-08 — HHK 知识卡片 + 经典例题

### HHK 考点精讲内容（55 sections × 2 modules = 110 条）
- **知识卡片 (knowledge)**: 55 张双语富文本卡片，每张包含 Recap / Key Skills / Exam Tip / Watch Out!（中文：知识回顾/关键技能/考试技巧/注意！）
- **经典例题 (examples)**: 55 组双语 Worked Examples，每组 2 道含 [marks] + Solution 步骤 + Exam Tip（中文：经典例题/解答/考试技巧）
- **覆盖范围**: Y7 (11) + Y8 (9) + Y9 (12) + Y10 (12) + Y11 (11) 全部 55 个知识点
- **内容特点**: 难度适配 Harrow Haikou 校本课程（Y7-Y8 基础，Y9-Y11 进阶），LaTeX 公式 KaTeX 渲染
- **数据管道**: `scripts/seed-hhk.js` → `seed-hhk.sql` → Supabase `section_edits` 表 upsert

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/seed-hhk.js` | 新建 — HHK 知识卡片+例题种子脚本 (4,133 行) |
| `scripts/seed-hhk.sql` | 新建 — 110 条 INSERT SQL (115 行) |
| `js/config.js` | v2.2.2→v2.2.3 |

---

## [2.2.2] - 2026-03-08 — 超管数据质量管理面板

### Data Quality Dashboard
- **`js/data-admin.js`**: 新建超管专属数据质量面板（602 行）
- **15 条检测规则**: subparts/textbf/spacing/screenshot/quad/tmarker/text_cmd/center/parts/placeholder/degree/pounds/minipage/renewcmd/hspace
- **3 数据源**: CIE papers / Edexcel papers / CIE pastpapers (legacy)，自动扫描全部题目
- **批量操作**: [Copy JSON for AI] 复制问题题目 → AI 修复 → [Paste Back] 粘贴 → 词级差异预览 → 勾选应用
- **一键修复**: textbf/spacing/center/degree/pounds/minipage/renewcmd/hspace 等规则支持 Auto-Fix
- **JSON 导出**: 保持原格式（v2.0 wrapper / 平面数组），下载 `papers-{board}-fixed-{date}.json`
- **差异预览**: LCS 词级 diff 算法，红色删除 + 绿色新增，分页浏览 + 勾选应用

### 集成
- **`js/admin.js`**: 超管 tab 栏新增 "Data Quality" 选项卡
- **`js/auth.js`**: 动态加载链追加 `data-admin.js`（vocab-admin.js → data-admin.js）
- **`css/style.css`**: 新增 `.dq-*` 系列样式（96 行），含摘要卡片、规则行、差异显示、暗色模式、移动端适配

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/data-admin.js` | 新建 — 检测引擎 + 批量编辑 + 差异预览 + 导出 (602 行) |
| `js/admin.js` | 新增 Data Quality tab + 路由 (+2 行) |
| `js/auth.js` | 动态加载链追加 data-admin.js (+6 行) |
| `js/config.js` | v2.2.1→v2.2.2 |
| `css/style.css` | `.dq-*` 样式 (+96 行) |

---

## [2.2.1] - 2026-03-08 — LaTeX tabular 表格 HTML 渲染

### 表格转换
- **`scripts/convert-tables.py`**: 新建批量转换脚本，将 LaTeX `\begin{tabular}` 转为 HTML `<table>`
- **`texHtml` 字段**: 546 条记录新增（CIE 73+315 + Edexcel 158），保留原 `tex` 不变
- **转换规则**: 解析列规格 (`|l|c|r|`)、`\hline`/`\cline` 边框、`\multicolumn`/`\multirow` 合并；数学公式保留给 KaTeX
- **跳过策略**: `InsertScreenShot` 包裹的 tabular（23 条）不转换
- **单元格清理**: `\textbf`→`<strong>`、`\dots`→`…`、`\pounds`→`£`、`\quad`→em-space、`\phantom`/`\cline` 移除、`\degree`→`°`、`\TableAnswerLine`→`______`

### 前端渲染
- **`_ppRenderTex()` 升级**: 接受 question 对象，优先读 `texHtml`；兼容原有字符串传入
- **调用点更新**: `renderPPCard()` 和 `ppShowMarking()` 传入完整 question 对象
- **`.pp-table` 样式**: 边框折叠、居中、13px 字号、垂直居中；`.pp-table-nb` 无边框变体；KaTeX 字号继承；暗色模式自动继承 CSS 变量

### 构建管道
- **`build-papers-data.py`**: 导入 `convert-tables.py`，重建时自动生成 `texHtml`

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/convert-tables.py` | 新建 — tabular→HTML 批量转换 + 单元格 LaTeX 清理 |
| `data/pastpapers-cie.json` | 73 条记录新增 `texHtml` |
| `data/papers-cie.json` | 315 条记录新增 `texHtml` |
| `data/papers-edx.json` | 158 条记录新增 `texHtml` |
| `js/practice.js` | `_ppRenderTex()` 优先读 `texHtml` + 2 处调用更新 |
| `js/config.js` | v2.2.0→v2.2.1 |
| `css/style.css` | `.pp-table` 系列样式（含 vertical-align / KaTeX 字号） |
| `scripts/build-papers-data.py` | 导入 tabular_to_html + 自动生成 texHtml |

---

## [2.2.0] - 2026-03-07 — 子域名自动检测 + Board 锁定

### 子域名 Board 检测
- **HOST_BOARD_MAP**: 根据 `location.hostname` 自动锁定 board（`cie-0580.25maths.com`→CIE, `edx-4ma1.25maths.com`→Edexcel, `hhk.25maths.com`→HHK）
- **`_hostBoard` + `isSubdomainLocked()`**: 全局检测函数，子站启动即锁定，通用站保持原有逻辑
- **启动加载优化**: `levels-loader.js` boot 阶段优先读 `_hostBoard`，子站无需依赖 localStorage

### 登录 + 选课流程适配
- **`showBoardSelection()` 守卫**: 子站自动跳过选课页，Guest 首次进入直接进对应 board
- **`afterLogin()` 子站分支**: 强制锁定 board，HHK 特殊处理保留 metadata 中的具体年级（如 `25m-y9`）
- **设置页"更换课程"按钮**: 子站隐藏，仅通用站显示（board 名称仍展示）

### PWA 兼容
- **manifest.json**: `start_url` / `scope` 改为相对路径 `./`，支持任意域名部署

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | HOST_BOARD_MAP + _hostBoard + isSubdomainLocked() + v2.1.1→v2.2.0 |
| `js/levels-loader.js` | boot startBoard 优先读 _hostBoard |
| `js/auth.js` | showBoardSelection() 守卫 + afterLogin() 子站分支 + showSettings() 隐藏更换按钮 |
| `manifest.json` | start_url/scope → `./` |

---

## [2.1.1] - 2026-03-07 — 导航动线优化 + 质量修复

### 错题本增强
- **练习错题操作按钮**: 每行新增 [复习] 按钮，点击直接跳转做题；底部新增 [全部复习] 按钮
- **题目反查**: `_findPQInfo()` 跨 board 查找 qid 对应 section（MCQ + Past Paper 双源）
- **Tab 事件委托优化**: `_mistakeTabBound` 标记确保 listener 只绑定一次，消除重复注册

### Badge 系统
- **底栏 Review badge**: `bnav-rv-badge` 显示待复习词数（仅已学习但到期的词，排除未学新词）
- **错题 badge**: 侧栏 `nav-mk-badge` + 底栏 `bnav-mk-badge` 显示待解决错题总数
- **`getStudiedDueCount()`**: 新增函数，只计算已学习过且到期的词（排除 new/mastered）

### 今日计划
- **今日进度卡片**: 显示当日学习活动次数（基于 history 数据）

### 词汇复习
- **文案优化**: 错词复习按钮改为"复习错词（SRS 优先）"，明确表达排序逻辑

### 视觉修复
- **暗色模式**: 补充 `.plan-streak` opacity + `.mistake-row` border-color 规则
- **手机端响应式**: `.mistake-row` flex-wrap + `.mistake-def` 换行显示，防溢出

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | _findPQInfo + reviewMistakeQ + reviewAllMistakeQs + Tab 委托优化 + 今日进度 + 文案优化 |
| `js/ui.js` | updateNav() badge 扩展（Review + Mistakes，双位置同步） |
| `js/storage.js` | getStudiedDueCount() 新增 |
| `index.html` | 底栏 Review/Mistakes badge span + 侧栏 Mistakes badge span |
| `css/style.css` | .bnav-badge + .mistake-review-btn + 暗色模式补全 + 手机端响应式 |
| `js/config.js` | v2.1.0 → v2.1.1 |

---

## [2.1.0] - 2026-03-07 — 侧栏导航重构 + HHK 技能学习系统

### Phase A: 侧栏导航重构
- **侧栏**: 下架 Leaderboard，新增"今日计划"和"错题本"入口
- **底栏**: Home → Plan → Review → Mistakes → Stats（替换 Board）
- **面板容器**: 新增 `panel-plan`、`panel-mistakes`
- **滑动导航**: `_navSeq` 更新为 `['home','plan','review-dash','mistakes','stats']`
- **navTo / toggleLang**: 新增 `plan`、`mistakes` case

### Phase B: 今日计划 + 错题本面板
- **renderTodaysPlan()**: 日期 + 连续天数 + 待复习词汇 + 待解决错题 + Smart Path + Review Plan
- **renderMistakeBook()**: Tab 切换（全部/词汇/练习）+ 词汇错词列表 + 练习错题列表
- **startMistakeReview()**: 跳转复习模式
- **CSS**: 今日计划卡片样式 + 错题本样式 + 暗色模式

### Phase C: HHK 练习引擎解锁
- **data/questions-25m.json**: 55 道 Y7 MCQ 练习题（11 sections 全覆盖）
- **practice.js**: board guard 放行 `25m`（原仅 CIE/Edexcel）
- **syllabus.js**: Journey Bar 不再排除 HHK；qCount 计算包含 HHK
- **getSectionHealth()**: HHK 分支新增 practiceScore 计算

### Phase D: 诊断反馈 + 学习闭环
- **diag 字段**: 每道 HHK 题标注 `vocab`/`concept`/`calc`/`logic` 诊断类型
- **答错诊断**: pickPracticeOpt() 答错后显示诊断提示卡
- **结果诊断**: finishPractice() 结果页按 diag 分组统计
- **错题本联动**: MCQ 答错自动 ppAddToWrongBook → 出现在错题本面板
- **Smart Path**: rec 推荐逻辑增加 practiceScore 判断

### 新增文件
- `data/questions-25m.json` — HHK Y7 练习题（55 题）
- `scripts/generate-hhk-questions.py` — Gemini CLI 批量生成脚本

### 文件变更
| 文件 | 变更 |
|------|------|
| `index.html` | 侧栏/底栏重构 + 新增 panel-plan/panel-mistakes |
| `js/ui.js` | navTo + toggleLang + _navSeq 更新 |
| `js/syllabus.js` | renderTodaysPlan + renderMistakeBook + HHK 练习解锁 + 健康度升级 |
| `js/practice.js` | board guard 放行 25m + 诊断反馈 + 错题本联动 |
| `css/style.css` | 今日计划 + 错题本样式 |
| `js/config.js` | v2.0.4 → v2.1.0 |

## [2.0.4] - 2026-03-07 — HHK 点击修复 + 下架导入功能 + 缓存同步

### Bug 修复
- **syllabus.js:627**: `isZH` 未定义 → `appLang !== 'en'`，修复 HHK 知识点点击无响应（sub_units 渲染抛 ReferenceError 导致 openSection 中断）

### 移除
- **导入功能**: 侧栏 + 底部导航移除 Import/导入入口（panel 容器保留）

### 构建优化
- **minify.sh**: `npm run build` 自动同步 index.html 的 `?v=` 缓存参数（此前需手动更新）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `isZH` → `appLang !== 'en'`（第 627 行） |
| `index.html` | 移除侧栏 + 底栏 Import 按钮；缓存参数自动同步 |
| `scripts/minify.sh` | 新增 cache-bust 自动同步逻辑 |
| `js/config.js` | 版本号 v2.0.3 → v2.0.4 |

## [2.0.3] - 2026-03-07 — 侧栏导航 UI 重设计

### 移除
- **sidebar-decks**: 删除考试局分类手风琴区域（已失效的滚动导航）
- **CSS**: 删除 ~40 行 deck 相关样式（sidebar-decks/deck-label/deck-item/cat-group/cat-toggle/chevron/cat-decks/sub-item/sub-name/sub-pct）

### 新增
- **分组导航**: 7 个 nav-item 分为"学习"（Home/Review）+"工具"（Import/Leaderboard/Stats/Homework/Admin）两组
- **分隔线**: `.sidebar-sep` 分组间视觉分隔（1px border-light）
- **分组标签**: `.sidebar-group-label` "TOOLS / 工具" 大写标签，支持中英切换
- **Active 竖条**: nav-item active 态左侧 3px 主色指示条（`::before` 伪元素）+ 微阴影
- **Hover 动效**: nav-icon hover 微放大 `scale(1.08)` + transition
- **Logo 阴影**: brand-logo 添加 `box-shadow: 0 2px 8px rgba(82,72,201,0.25)`
- **折叠态**: 分隔线和标签在侧栏收缩时自动隐藏

### 文件变更
| 文件 | 变更 |
|------|------|
| `index.html` | 删除 `#sidebar-decks`；nav-item 分两组 + 分隔线 + 标签 |
| `js/ui.js` | 删除 `updateSidebar()` 中 sidebar-decks 渲染块（~22 行） |
| `css/style.css` | 删除 deck 样式 ~40 行；新增 active 竖条 + hover + 分隔线 + 标签 ~15 行 |
| `js/config.js` | 版本号 v2.0.2 → v2.0.3 |

## [2.0.2] - 2026-03-07 — HHK 教学目标全量替换

### 数据替换
- **syllabus-hhk.json**: 55 sections 的 `core_content` 从占位文本替换为真实教学目标（407 条双语 LO）
- **sub_units 新增**: 111 个子单元（含 EN/ZH 标题 + 课时数），来源 teaching-units-all.json

### UI 渲染
- **syllabus.js**: HHK section detail 标题改为"学习目标 / Learning Objectives"
- **syllabus.js**: core_content 渲染为 `<ol>` 有序列表（按 `\n` 分割，去除编号前缀）
- **syllabus.js**: sub_units 渲染为网格卡片（双语标题 + 课时 badge）

### 样式
- **style.css**: 新增 7 条样式（`.sec-lo-list/item` + `.sec-subunit-header/grid/card/title/periods`）
- 暗色模式通过 CSS 变量自动适配，无需额外规则

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/rebuild-hhk-syllabus.py` | 新建：从 teaching-units-all.json 重建 syllabus-hhk.json |
| `data/syllabus-hhk.json` | 重写：core_content→教学目标；新增 sub_units |
| `js/syllabus.js` | HHK 渲染改为学习目标列表 + 子单元网格 |
| `css/style.css` | 新增 7 条学习目标 + 子单元样式 |
| `js/config.js` | 版本号 v2.0.1→v2.0.2 |

## [2.0.1] - 2026-03-07 — 质量优化（onclick XSS + 性能 + 暗色模式）

### P0 — onclick XSS 消除（9 处）
- **mastery.js Hero Card**: 6 处 onclick（openSection/navTo/startDaily/showRankGuide）→ `data-hero-action` + 全局委托
- **mastery.js Quick Stats**: `onclick="navTo('stats')"` → `data-hero-action="stats"` + 委托
- **mastery.js hero-alt-btn**: 2 处 onclick（startDaily/navTo）→ `data-hero-action` + 委托
- **mastery.js hero-reminder**: `onclick="navTo('review-dash')"` → `data-hero-action="review"` + 委托
- **syllabus.js 旅程条**: 3 处 onclick（openDeck/startQuiz/startPracticeBySection）→ `data-journey` + B12 委托

### P1 — 性能优化
- **getDueWords() 3 次→1 次**: _renderHeroAction 开头缓存 dueCount，传入 _getNextAction(dueCount)
- **checkBadges() 10 秒节流**: _lastBadgeCheckAt 时间戳防重复计算

### P2 — Bug 修复
- **statusText 死代码删除**: syllabus.js section detail 中定义但未使用的变量
- **checkSectionMilestone() 缓存失效**: 调用前 _invalidateSectionHealthCache() + invalidateCache()
- **wgPct 死变量删除**: mastery.js hero card 中定义但未使用

### P3 — 暗色模式 + 响应式
- **暗色模式**: journey pulse 动画 + hero-reminder + badge 边框 + sec-dot 颜色 + done-check
- **手机端**: hero-top 字号缩小 + quick-stats gap 紧凑 + badge-grid 2 列

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | onclick→data 委托 9 处 + getDueWords 缓存 + _initHeroDelegation + 删 wgPct |
| `js/syllabus.js` | 旅程条 onclick→data + B12 委托 + 删 statusText + cache invalidate |
| `js/storage.js` | checkBadges 10 秒节流 |
| `css/style.css` | 暗色模式 8 规则 + 手机端 3 规则 |
| `js/config.js` | 版本号 v2.0.0→v2.0.1 |
| `index.html` | 缓存标签 v2.0.1 |

## [2.0.0] - 2026-03-07 — v2.0 结构性重构（5 Phase 全量）

### Phase 1 — HHK 考纲化（架构统一）
- **新增 `scripts/generate-hhk-syllabus.py`**: 从 levels-25m.json 生成考纲结构
- **新增 `data/syllabus-hhk.json`**: 5 章（Y7-Y11）55 个知识点，vocabSlugs 映射 173 个已有 level
- **新增 `data/vocabulary-hhk.json`**: 55 sections 共 1,501 词汇
- **`js/syllabus.js`**: 新增 loadHHKSyllabus / renderHHKHome / _getHHKSectionStats，HHK 多 sub-level 聚合统计
- **`js/levels-loader.js`**: _rebuildLevels 支持 HHK board re-init
- **`js/mastery.js`**: renderHome 25m board 路由切换为 renderHHKHome

### Phase 2 — 首页重设计（3 区聚焦）
- **Zone 1 Hero Action Card**: 渐变卡片 + 每日欢迎语 + 周目标 + 智能推荐（继续/复习/挑战/开始）+ 复习提醒
- **Zone 2 Quick Stats Strip**: 4 个 pill 徽章（连续天数/词汇量/掌握率/段位）
- **_getNextAction()**: 优先级推荐引擎（进行中→到期复习→每日挑战→新知识点→探索）
- **精简移除**: 旧 Stats Row / Rank Hint / Daily Challenge 横幅 / Smart Path / Review Plan（合并入 Hero Card）
- **CSS**: hero-card 渐变动画 + quick-stats pills + 手机端响应式

### Phase 3 — 学习闭环完善
- **交互式旅程条**: Vocab→Quiz→Practice→Papers 四步，可点击跳转，脉冲高亮当前步，锁定未解锁步
- **`_currentSectionContext`**: 全局变量追踪学习上下文，从 section 进入 deck 时设置，返回首页时清除
- **`sectionNextStepHTML()`**: 模式完成后根据上下文推荐下一步（study→quiz / quiz→review / practice→section）
- **`getSectionMilestone()`**: 5 态里程碑（not_started→in_progress→vocab_done→quiz_done→mastered）
- **`checkSectionMilestone()`**: 完成模式后自动检测里程碑变化 → Toast 庆祝 + mastered 时粒子效果

### Phase 4 — 黏性与激励系统
- **成就徽章**: 12 个可解锁徽章（First Word / Ten Down / Hundred Club / 3/7/30-Day Streak / Daily 5 / Perfectionist / First Section / Memory Master / 500 Words / Explorer）
- **徽章检测**: recordAnswer 后 3 秒防抖检测 → 解锁时 Toast 通知
- **统计页徽章展示**: 已解锁/未解锁网格，灰度滤镜区分
- **周目标**: 默认 35 词/周，Hero Card 显示进度，每周一重置
- **每日欢迎**: 首次打开基于连续天数显示不同鼓励语
- **复习提醒**: SRS 到期 ≥5 词且 2+ 天未复习 → Hero Card 温馨提示

### Phase 5 — 去 AI 味 + UI 打磨
- **Smart Path 标签人性化**: start→"Ready to start!" / vocab→"Learn the key words first" / review_words→"Quick refresh needed" / great→"Doing great!"
- **Section Detail 简化**: Health Ring 数字 → 4px 彩条 + 自然语言描述（"You've learned 5 of 8 words"）
- **Section Row 3 态圆点**: 百分比进度条 → 空心/半满/实心圆点 + ✓ 标记
- **Smart Path 卡片**: 环形分数 → 彩色竖条，移除百分比数字
- **Review Plan**: retentionScore 百分比 → "Needs refresh" / "Fading" 自然语言
- **进度标签**: "45% · 3/8 mastered" → "You've learned 5 of 8 words"

### 文件变更
| 文件 | 变更 |
|------|------|
| 新 `scripts/generate-hhk-syllabus.py` | HHK 考纲数据生成脚本 |
| 新 `data/syllabus-hhk.json` | HHK 考纲结构（5 章 55 知识点） |
| 新 `data/vocabulary-hhk.json` | HHK 词汇映射（1,501 词） |
| `js/syllabus.js` | +448 行：HHK 考纲 + 交互旅程条 + 里程碑 + 去 AI 味 |
| `js/mastery.js` | +276 行：3 区首页 + Hero Card + Quick Stats + 每日欢迎 |
| `js/storage.js` | +135 行：徽章系统 + 周目标 + bumpWeeklyGoal |
| `js/ui.js` | +34 行：sectionNextStepHTML + 上下文清除 |
| `js/stats.js` | +19 行：徽章展示区 |
| `js/study.js` | 完成画面上下文感知 + 里程碑检测 |
| `js/quiz.js` | 完成画面上下文感知 + 里程碑检测 |
| `js/practice.js` | 里程碑检测 |
| `js/review.js` | 记录最后复习时间 |
| `js/levels-loader.js` | HHK re-init 支持 |
| `js/config.js` | 版本号 v1.13.2→v2.0.0 |
| `index.html` | 缓存标签 v2.0.0 |
| `css/style.css` | +134 行：Hero Card + Quick Stats + 旅程条脉冲 + 徽章 + 3 态圆点 |

## [1.13.2] - 2026-03-07 — 质量修复（onclick XSS 第三轮消除）

### 修复 — onclick XSS 消除（9 处修复）
- **admin.js showRenameModal 确认按钮**（HIGH）: `onclick="doRenameStudent(userId,classId)"` → `data-action="do-rename"` + `data-uid/cid` + 委托
- **admin.js showResetPasswordModal 确认按钮**（HIGH）: `onclick="doResetPassword(userId)"` → `data-action="do-resetpw"` + `data-uid` + 委托
- **admin.js showMoveClassModal 确认按钮**（HIGH）: `onclick="doMoveStudent(userId,classId)"` → `data-action="do-move"` + `data-uid/cid` + 委托
- **admin.js showMoveClassModal 选项名**（MEDIUM）: `c.name` 未转义 → `escapeHtml(c.name)`
- **admin.js modal Cancel 按钮**: `onclick="hideModal()"` → `data-action="modal-cancel"` + 委托
- **syllabus.js Smart Path 推荐卡片**（HIGH）: 4 种 onclick 分支 → `data-sp-rec/sec/board/li` + 委托
- **homework.js 教师词汇预览切换**: 内联 onclick → `data-toggle-preview`（复用已有 B6 委托）
- **homework.js 学生 GO 按钮**（MEDIUM）: `onclick="startHwPractice/startHwTest(hw.id)"` → `data-action="hw-go"` + `data-hwid/practice` + 委托
- **homework.js 已完成 Retry 按钮**（MEDIUM）: `onclick="startHwPractice/startHwTest(hw.id)"` → `data-action="hw-retry"` + `data-hwid/practice` + 委托
- **app.js 排行榜 Board Scope/Sub Pills**: `onclick="switchBoardScope/switchBoardSub(value)"` → `data-board-scope/data-board-sub` + 委托

### 跳过（LOW 风险，纯硬编码值）
- mastery.js `startStudy(idx)` — idx 纯数字
- ui.js `resultScreenHTML`/`nextStepHTML` — retryId/backId 纯硬编码
- practice.js `ppScoreChange(i, marks)` — 纯数值

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/admin.js` | A1-A4: modal 确认按钮 onclick→data + escapeHtml + 全局委托扩展 |
| `js/syllabus.js` | A5: Smart Path 4 种 onclick→data + B11 委托 |
| `js/homework.js` | A6-A8: 预览/GO/Retry onclick→data + B8-B9 委托 |
| `js/app.js` | A9: Board Scope/Sub Pills onclick→data + 委托 |
| `js/config.js` | 版本号 v1.13.1→v1.13.2 |
| `index.html` | 缓存标签 v1.13.1→v1.13.2 |

## [1.13.1] - 2026-03-07 — 质量修复（监听器泄漏修复 + 残余 onclick XSS 消除）

### 修复 — 监听器泄漏（Part A）
- **spell.js 委托泄漏**: `renderSpellCard()` 内 `panel-spell` click 委托每张卡片叠加 → `_spellDelegated` 标志只绑定一次
- **practice.js 委托泄漏**: `renderPracticeReview()` 内 `panel-practice` click 委托每次过滤叠加 → `_pqReviewDelegated` 标志只绑定一次
- **practice.js pqToolFormula 泄漏**: `inp.addEventListener('input')` 每次打开公式弹窗叠加 → 添加前先 `removeEventListener`
- **homework.js renderHwQuestion 泄漏**: `el.addEventListener('click')` 每题叠加 → `_hwQuestionDelegated` 标志只绑定一次
- **homework.js showNotifications 泄漏**: `modal-card` click/keydown 每次打开通知叠加 → 提取为命名函数 + remove 后 add
- **export.js renderImport 泄漏**: `import-file` change / `import-drop` drag 监听器每次打开面板叠加 → `_importDelegated` 标志只绑定一次

### 修复 — onclick XSS 消除（Part B）
- **admin.js 学生操作按钮**: 3 个 action-item（rename/resetpw/moveclass）从 `onclick` + `safeName` 改为 `data-action` + `data-uid/name/cid` + 全局事件委托
- **admin.js 编辑班级按钮**: `showEditClassModal` onclick 改为 `data-action="editclass"` + 委托
- **homework.js 学生详情按钮**: `showStudentHwDetail` onclick 改为 `data-action="hw-student-detail"` + 委托
- **homework.js 作业操作按钮**: `renderHwProgress`/`deleteHw` onclick 改为 `data-action="hw-detail|hw-delete"` + 委托
- **homework.js 模板选择器**: `hwLoadTemplate` onchange 改为 `data-hw-tpl-cid` + change 委托
- **homework.js 词汇预览切换**: 内联 onclick 改为 `data-toggle-preview` + 委托
- **homework.js 退出确认按钮**: 内联 `onclick="if(confirm(...))"` 改为 `data-action="hw-quit-practice"` + 委托
- **syllabus.js startPastPaper**: 6 处 onclick 改为 `data-pp-start` + `data-sec/board/mode/group/cmd` + 委托
- **syllabus.js toggleMQtypeMastery**: onchange 改为 `data-mq-toggle` + `data-sec/gkey` + change 委托
- **practice.js startPastPaper**: Focus Areas onclick 改为 `data-pp-start` + 委托

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/spell.js` | A1: 委托泄漏修复 |
| `js/practice.js` | A2+A5: 委托泄漏修复 + B10: onclick→data |
| `js/homework.js` | A3+A6: 委托泄漏修复 + B3-B7: onclick→data + 事件委托 |
| `js/export.js` | A4: import 监听器泄漏修复 |
| `js/admin.js` | B1+B2: onclick→data + 事件委托 |
| `js/syllabus.js` | B8+B9: onclick→data + 事件委托 |
| `js/config.js` | 版本号 v1.13.0→v1.13.1 |
| `index.html` | 缓存标签 v1.13.0→v1.13.1 |

## [1.13.0] - 2026-03-07 — 防御性修复（onclick XSS 消除 + 空引用防护）

### 修复
- **spell.js onclick XSS 消除**: speakWord 内联 `onclick` 字符串拼接改为 `data-speak` 属性 + 事件委托，消除单引号/反斜杠转义不完整注入风险
- **spell.js input null check**: `input.focus()` 添加 null 检查，防止 DOM 未就绪时抛异常
- **practice.js topic filter XSS 消除**: topic/difficulty 按钮从 `onclick` 字符串拼接改为 `data-pq-topic` / `data-pq-filter` 属性 + 事件委托
- **homework.js pickHwAnswer XSS 消除**: 答案按钮从 `onclick="pickHwAnswer(this, ...)"` 改为 `data-correct` / `data-answer` 属性 + 事件委托

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/spell.js` | speakWord onclick→data 属性+事件委托 + input null check |
| `js/practice.js` | topic/difficulty filter onclick→data 属性+事件委托 |
| `js/homework.js` | pickHwAnswer onclick→data 属性+事件委托 |
| `js/config.js` | 版本号 v1.12.9→v1.13.0 |
| `index.html` | 缓存标签 v1.12.9→v1.13.0 |

## [1.12.9] - 2026-03-07 — 可靠性修复（Timer 泄漏 + Modal 安全 + XSS 修复）

### 修复
- **showPanel 统一出口清理**: 新增 `_cleanupActiveMode()` 在面板切换时自动清理 Battle/Daily Challenge 定时器和 Review 搜索 timeout，防止泄漏
- **Modal handler 去重**: `showModal()` 添加 handler 前先移除已有的 ESC/Tab handler，防止连续调用 showModal 时 handler 叠加
- **Modal 焦点恢复 isConnected 检查**: `hideModal()` 恢复焦点前检查 `_modalPrevFocus.isConnected`，防止焦点恢复到已分离 DOM 节点
- **通知 onclick XSS 修复**: 通知列表从内联 `onclick` 字符串拼接改为 `data-*` 属性 + 事件委托，彻底消除 DB 值注入风险，同时添加键盘可访问性（Enter/Space）
- **Battle startBattle 防护性 clearInterval**: 在 `G = resetG()` 之前清理旧 `G.timer`，防止旧定时器引用丢失导致泄漏

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | `_cleanupActiveMode()` + Modal handler 去重 + `isConnected` 检查 |
| `js/homework.js` | 通知 onclick→data 属性+事件委托（XSS 修复+键盘可访问） |
| `js/battle.js` | `startBattle()` 防护性 `clearInterval` |
| `js/config.js` | 版本号 v1.12.8→v1.12.9 |
| `index.html` | 缓存标签 v1.12.8→v1.12.9 |

## [1.12.8] - 2026-03-07 — P1 优化（数据安全 + 可访问性 + 缓存标签）

### 修复
- **syncToCloud 并发防护**: 添加 `_syncInProgress` 互斥锁，防止多处调用（debouncedSync/recordActivity/saveCustomLevel）并发写入云端
- **finishDaily 双调用防护**: 添加 `_dailyFinished` 标志，防止定时器到期和答完最后一题同时触发 `saveDailyResult()` 重复写入

### 新增
- **Battle 网格键盘可访问性**: 卡片添加 `role="button"` + `tabindex="0"` + Enter/Space 键盘翻牌
- **Battle HUD 无障碍**: HUD 容器添加 `aria-live="polite"` + `aria-atomic="true"`，计时器添加 `aria-label`
- **Match 列容器 aria-label**: 左右配对列添加 `aria-label`（英文单词/中文释义）

### 优化
- **缓存标签更新**: `style.min.css?v=1.12.6` → `?v=1.12.8`，确保浏览器加载最新样式

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | syncToCloud `_syncInProgress` 并发互斥锁 |
| `js/quiz.js` | finishDaily `_dailyFinished` 双调用防护 |
| `js/battle.js` | 网格 role/tabindex/keydown + HUD aria-live |
| `js/match.js` | 配对列 aria-label |
| `js/config.js` | 版本号 v1.12.7→v1.12.8 |
| `index.html` | CSS 缓存标签 v1.12.6→v1.12.8 |

## [1.12.7] - 2026-03-07 — P0 快速优化（可访问性 + 暗色模式 + 持久化 + 性能）

### 新增
- **Modal 焦点陷阱 + ESC 关闭**: showModal() 保存之前焦点、自动 focus modal-card、ESC 键关闭、Tab 键循环 focusable 元素；hideModal() 恢复之前焦点
- **Quiz 方向偏好持久化**: 测验方向（en2zh/zh2en）保存到 localStorage，重新开始测验时恢复
- **折叠状态持久化**: 首页 catCollapsed / unitCollapsed / cieChapterCollapsed 写入 localStorage，刷新后保留展开/折叠状态

### 修复
- **暗色模式选择器修正**: 28 条 `.dark` CSS 规则修正为 `[data-theme="dark"]`（pp-diff、pp-dot、sec-journey、diag-*、pwa-install-hint 等），此前这些暗色规则完全无效

### 优化
- **getDeckStats 缓存传递**: renderHome() 循环中复用已缓存的 wordData，避免每个 level 重复调用 getWordData()

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | Modal focus trap + ESC + Tab trap + 焦点恢复 |
| `js/quiz.js` | Q.dir localStorage 读写 |
| `js/mastery.js` | getDeckStats 可选 _wd 参数 + 折叠状态 localStorage |
| `js/syllabus.js` | cieChapterCollapsed localStorage 持久化 |
| `css/style.css` | 28 处 `.dark` → `[data-theme="dark"]` |
| `js/config.js` | 版本号 v1.12.6→v1.12.7 |

## [1.12.6] - 2026-03-07 — Edexcel 真题引擎 + 考纲教学流程

### 新增
- **Edexcel 真题数据**: 从 IGCSE_v2 转录 1,855 道真题（76 套卷，20 sessions，2017-2025），生成 `papers-edx.json` v2.0 格式
- **考纲标注修正**: 严格按 Edexcel 4MA1 官方 Specification 标注，修复 32 道 topic 2.9→3.1（Sequences）映射错误，39 个 section 100% 覆盖
- **Edexcel 套卷浏览**: 解除 `syllabus.js` 中 CIE-only 限制，Edexcel 知识点详情页现可显示真题模块（练习/实战/错题本/套卷浏览/模拟卷）
- **SoW 教学流程**: `syllabus-edexcel.json` 添加 65 个教学单元（Foundation 30 + Higher 32），含 spec reference 映射和教学时数
- **Edexcel 纸型标签**: PP_TYPE_LABELS 新增 Foundation/Higher × Calc/Non-Calc 4 种 Edexcel 试卷类型
- **Session 标签扩展**: PP_SESSION_LABELS 新增 June/Jan/Nov/SP 适配 Edexcel 考试时间安排

### LaTeX 清理
- 自定义宏转换: `\StemText{}`/`\InsertScreenShot{}`→内容保留, `\StemFigure{}`→`[Figure]`
- `\AnswerLine`/`\AnswerLineShort`→`\dotfill`, `\Marks{}`/`\WorkingSpace{}`/`\ImplicitPart` 移除
- `\part`→`\textbf{(a)}` 自动编号, `\relincludegraphics`→`[Figure]`
- 注释行移除, 嵌套大括号正确处理

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/papers-edx.json` | 新增 — 1,855 题 76 套卷 1.27MB |
| `data/syllabus-edexcel.json` | +65 teachingUnits (SoW) |
| `js/syllabus.js` | 3 处 CIE-only→支持 Edexcel PP |
| `js/practice.js` | +4 PP_TYPE_LABELS + 4 PP_SESSION_LABELS + sessionOrder 扩展 |
| `js/config.js` | 版本号 v1.12.5→v1.12.6 |
| `index.html` | 缓存标签 v1.12.5→v1.12.6 |
| `package.json` | version 1.12.5→1.12.6 |

## [1.12.5] - 2026-03-07 — 代码质量修复 + 版本同步

### 修复
- **practice.js 错误处理**: 3 处 `.insert()` 调用添加 `.catch()` 网络错误捕获（纠错报告/真题报告/管理员修正）
- **practice.js 事件泄漏**: 编辑器 Modal 的 `addEventListener` 改为 `onX` 属性赋值，避免重复打开累积监听器
- **homework.js 错误检查**: `showStudentHwDetail` 的 `.single()` 查询添加 `res.error` 检查
- **.gitignore**: 添加 `.env*` 规则防止密钥误提交

### 同步
- **index.html**: 缓存标签 `?v=1.8.4` → `?v=1.12.5`（停滞 7 个版本）
- **package.json**: version `1.0.0` → `1.12.5`

### 文档
- **expansion-vision.md**: 从 v1.9.8 更新到 v1.12.5 进度（Layer 4 已完成 70%，7 项 P0-P4 已完成标记）
- **project-audit.md**: 审计建议修复状态更新（7/11 项已修复）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +3 `.catch()` + 2 处 addEventListener→onX |
| `js/homework.js` | +`res.error` 检查 |
| `js/config.js` | 版本号 v1.12.4 -> v1.12.5 |
| `index.html` | 缓存标签 v1.8.4 -> v1.12.5 |
| `package.json` | version 1.0.0 -> 1.12.5 |
| `.gitignore` | +`.env*` |
| `docs/analysis/*.md` | 进度更新 |

## [1.12.4] - 2026-03-07 — 教师端布置练习题作业

### 新增
- **练习题作业类型**: 教师在创建作业 Modal 中新增"练习题"标签页，可选择 CIE/Edexcel 考试局、知识点章节、题目数量(5/10/15/20)、难度(All/Core/Extended)
- **学生练习题答题**: 学生收到练习题作业后点击 GO 进入 MCQ 答题界面，支持 KaTeX 数学公式渲染、答题后显示解析、进度条、800ms 自动跳题
- **结果存储**: 复用 `assignment_results` 表，`wrong_words` 字段存储错题(qid/题干/正确答案)，完全兼容现有 DB Schema（零迁移）
- **教师端适配**: 作业列表显示练习题作业配置摘要(考试局/知识点/难度)，详情页显示练习题配置卡片替代词汇预览
- **数据复用策略**: `custom_vocabulary` 字段存储 `{_type:'practice', board, count, difficulty}`，`deck_slugs` 存储 section IDs

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | +练习题标签页 + `_renderHwSections()` + `startHwPractice()` + `renderHwPracticeCard()` + `pickHwPracticeOpt()` + `finishHwPractice()` + 列表/详情/Banner 适配 |
| `js/config.js` | 版本号 v1.12.3 -> v1.12.4 |

## [1.12.3] - 2026-03-07 — 打印词卡 + 统计导出 + 复习增强

### 新增
- **词卡预览打印** — Preview 页面新增 Print 按钮，打印时隐藏导航、优化卡片布局（避免分页断裂）
- **统计数据导出** `exportStats()` — 统计面板新增 Export 按钮，一键导出 CSV（30 天活动明细 + 汇总 + 模式完成度），UTF-8 BOM 兼容 Excel
- **SRS 等级图例** — 复习仪表盘条形图下方新增三色图例（New / Learning / Mastered）
- **到期词汇排序** — 复习仪表盘待复习词汇按紧急度排序（SRS 等级最低优先 + 最早到期优先）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | Preview 页面 +Print 按钮 |
| `js/stats.js` | +`exportStats()` + 标题栏 Export 按钮 |
| `js/review.js` | +SRS 图例 + dueWords 排序 |
| `css/style.css` | +`.srs-legend` 图例样式 + `@media print` 增强（.no-print / preview-card / back-btn） |
| `js/config.js` | 版本号 v1.12.2 -> v1.12.3 |

## [1.12.2] - 2026-03-07 — 统计分模式细分 + 打印样式

### 新增
- **模式完成度统计** `renderModeBreakdown()`: 在统计面板新增 7 种学习模式（Study/Quiz/Spell/Match/Battle/Review/Practice）的完成卡组数横向条形图，基于 `modeDone` 数据
- **打印友好样式** `@media print`: 隐藏侧栏/导航/按钮/遮罩等非内容元素，保留统计图表色彩打印

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/stats.js` | +`renderModeBreakdown()` + renderStats 调用 |
| `css/style.css` | +`.mode-breakdown` 样式 + `@media print` 打印规则 |
| `js/config.js` | 版本号 v1.12.1 -> v1.12.2 |

## [1.12.1] - 2026-03-07 — 作业模板 + 键盘快捷键

### 新增
- **作业模板系统**: 教师创建作业时可保存当前选中词组为模板，下次一键加载；支持保存/加载/删除操作，数据存储在 localStorage (`hw_templates`)
- **键盘快捷键**: Study 模式 Space/Enter 翻卡 + 1/2/3 评分（Hard/OK/Easy），Quiz/Daily Challenge 模式 1-4 选择答案；自动跳过输入框和 Modal 场景

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | +`_getHwTemplates()` / `hwSaveTemplate()` / `hwLoadTemplate()` / `hwDeleteTemplate()` + 模板选择 UI |
| `js/app.js` | +全局 keydown 监听器，按 appView 分发快捷键 |
| `js/config.js` | 版本号 v1.12.0 -> v1.12.1 |

## [1.12.0] - 2026-03-07 — 4 维掌握度系统 + 复习计划推荐

### 新增
- **4 维掌握度展示**: 知识点详情页的健康度区域升级为 4 根进度条 — 词汇 (Vocab) / 练习 (Practice) / 真题 (Papers) / 记忆 (Retention)，取代原文本摘要
- **记忆保留度指标** `retentionScore`: 基于 SRS 等级均值（0-7 → 0-100%）× 时间衰减系数，衡量长期记忆强度
- **练习完成度指标** `practiceScore`: 基于 `isModeDone(li, 'practice')` 追踪 MCQ 练习是否完成
- **首页复习计划** `renderReviewPlan()`: 自动筛选已学但记忆衰退的知识点（retentionScore < 70% 且 recency < 0.95），按遗忘程度排序，最多显示 3 个推荐复习项
- 复习计划卡片显示知识点编号、标题和记忆保留度，点击直达知识点详情页

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | `getSectionHealth()` +retentionScore/practiceScore + `_masteryBar()` + `renderReviewPlan()` + 详情页 4 维 mastery bars |
| `js/mastery.js` | `renderHome()` +复习计划区域 |
| `css/style.css` | +`.sec-mastery-*` 4 维进度条 + `.review-plan-*` 复习计划样式 |
| `js/config.js` | 版本号 v1.11.4 -> v1.12.0 |

## [1.11.4] - 2026-03-07 — Anki 格式导出

### 新增
- **Anki TSV 导出** `exportAnki()`: 导出全部词汇为 Anki 兼容的 TSV 文件（front/back/tag），可直接导入 Anki 桌面端
- 导入界面提示文案更新，明确支持 Anki TSV 格式文件

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/export.js` | +`exportAnki()` + Anki 导出按钮 + 导入提示更新 |
| `js/config.js` | 版本号 v1.11.3 -> v1.11.4 |

## [1.11.3] - 2026-03-07 — 作业统计导出 CSV

### 新增
- **作业成绩 CSV 导出** `exportHwCSV()`: 教师在作业详情页点击 "Export CSV" 按钮，导出所有学生的成绩数据（姓名/状态/得分/正确率/尝试次数/错词/完成时间）
- 文件名自动生成：`homework_<作业名>_<日期>.csv`，UTF-8 BOM 编码兼容 Excel 中文

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | +`exportHwCSV()` 导出函数 + 作业详情页导出按钮 |
| `js/config.js` | 版本号 v1.11.2 -> v1.11.3 |

## [1.11.2] - 2026-03-07 — 离线单文件构建器重构

### 重构
- **build-single.py 全面重写**: 适配新架构（18 核心 JS + 分拆数据 JSON + 懒加载模块）
- **数据预注入**: 12 个 data/*.json 文件内联为 JS 变量 + `fetch()` 拦截层，离线时零网络请求
- **JS 文件清单更新**: 新增 syllabus.js + practice.js（Phase 10C/10F 新增文件）
- **动态模块内联**: homework.js + admin.js + vocab-admin.js 全部内联（教师离线可用）
- **PWA 构件移除**: 单文件构建自动去除 manifest / SW 注册（避免冲突）
- **输出**: `dist/word-match-pro.html`（~6 MB，含全部 3 考试局词汇 + 2,424 练习题 + 4,107 真题）

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/build-single.py` | 全面重写：18 JS + 12 数据 JSON 内联 + fetch 拦截 + PWA 移除 |
| `js/config.js` | 版本号 v1.11.1 -> v1.11.2 |

## [1.11.1] - 2026-03-07 — 质量优化：SW 版本同步 + 暗色 theme-color + 成绩趋势图

### 修复
- **SW 版本同步**: `scripts/minify.sh` 构建时自动从 `config.js` 提取 `APP_VERSION` 注入 `sw.js` 的 `CACHE_VERSION`，消除手动同步遗漏
- **暗色模式 theme-color**: 切换深色模式时动态更新 `<meta name="theme-color">`（深色 `#0F0E1A` / 浅色 `#5248C9`），PWA 和移动浏览器地址栏颜色同步

### 新增
- **诊断/模拟卷成绩趋势图**: 结果页展示历史得分柱状图（绿/黄/红三色，最多 10 次），需 >=2 次记录时显示；`diag_history` 新增 `isMock` 字段区分测试类型

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/minify.sh` | +SW 版本自动同步（sed 注入 APP_VERSION） |
| `sw.js` | CACHE_VERSION v1.10.3 -> v1.11.1（由构建脚本管理） |
| `js/ui.js` | `applyDark()` +theme-color meta 动态更新 |
| `js/practice.js` | `_diagShowResults()` +成绩趋势图 + diagResult.isMock 字段 |
| `css/style.css` | +`.diag-trend-*` 趋势图样式 |
| `js/config.js` | 版本号 v1.11.0 -> v1.11.1 |

## [1.11.0] - 2026-03-07 — PWA 离线支持：Service Worker + 安装提示 + 离线检测

### 新增
- **Web App Manifest**: 应用名、图标（3 个 SVG）、standalone 模式、紫色主题色
- **Service Worker** (`sw.js`): 三层缓存策略 — App Shell 缓存优先（HTML/JS/CSS），数据文件网络优先+缓存兜底（JSON），CDN 缓存优先（字体/Supabase SDK）；离线时导航回退到 index.html
- **安装提示**: 首页搜索栏上方显示 "Install app for offline access" 横条（仅在浏览器支持且未安装时显示），点击触发原生安装对话框
- **离线检测**: `online`/`offline` 事件监听 + Toast 提示 + 首页 stats 区域 "Offline" 标记
- **Apple 适配**: `apple-mobile-web-app-capable` + `apple-touch-icon` + `black-translucent` 状态栏
- **图标**: 3 个 SVG 图标（192px/512px/maskable），紫色背景 + "25 MATHS" 白色文字

### 文件变更
| 文件 | 变更 |
|------|------|
| `manifest.json` | 新建：PWA manifest |
| `sw.js` | 新建：Service Worker（shell/data/cdn 三层缓存） |
| `icons/icon-192.svg` | 新建 |
| `icons/icon-512.svg` | 新建 |
| `icons/icon-maskable.svg` | 新建 |
| `index.html` | +manifest link +theme-color +apple meta +favicon +SW 注册脚本 |
| `js/app.js` | +install prompt 捕获 +`pwaInstall()` +offline/online 事件 |
| `js/mastery.js` | +PWA 安装提示横条 |
| `css/style.css` | +`.pwa-install-*` + `.is-offline` 样式 |
| `js/config.js` | 版本号 v1.10.3 → v1.11.0 |

## [1.10.3] - 2026-03-07 — 模拟卷生成器：按考试局格式自动组题

### 新增
- **模拟卷生成器** `ppShowMockSetup()`: 设置界面选择目标分数（40/70/100）+ 侧重模式（均衡/薄弱项/随机）+ 自动计算时限
- **智能组卷算法** `ppStartMockExam()`: 按知识点轮询选题，确保覆盖面最大化；薄弱项模式按健康度 4x/2x/1x 加权；题目按难度排序（简→难，模拟真实考卷）；mark 总量贴近目标（±5 分容差）
- **模拟卷答题体验**: 顶部显示橙色 "Mock Exam · XX marks" 标题 + 考试计时器 + 退出确认
- **模拟卷结果页**: 复用诊断结果的知识点逐项分析视图 + "New Mock" 重新生成按钮
- **入口**: 套卷浏览页右上角 "Mock Exam" 按钮 + 诊断结果页 "Mock Exam" 链接
- **退出路由**: 模拟卷退出返回首页（非空白 section 面板）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`ppShowMockSetup()` 设置界面 + `ppMockSetOpt()` + `ppStartMockExam()` 组卷算法 + renderPPCard mock header + ppForceBack mock 路由 + ppFinishMarking mock 分流 + 诊断结果 mock 适配 |
| `js/config.js` | 版本号 v1.10.2 → v1.10.3 |

## [1.10.2] - 2026-03-07 — 质量修复：诊断测试 UX + 学习闭环 Bug 修复

### 修复
- **Bug**: `finishPractice()` PP 数据检查使用错误的 board key（'edexcel' vs 'edx'），修正为统一转换
- **Bug**: 诊断测试首页入口硬编码 'cie' board，改为根据用户选择的考试局自动适配
- **Bug**: 诊断测试退出时跳转到 section 面板（空白），修正为返回首页

### 优化
- **诊断测试标题**: 答题界面顶部显示 "Diagnostic Test" 紫色标题，区分普通 PP 练习
- **诊断结果进度条**: 每个知识点行新增彩色进度条（绿/黄/红），视觉反馈更直观
- **诊断结果 KaTeX**: 结果页调用 `renderMath()` 确保数学公式正确渲染
- **旅程条适配**: Edexcel 等无真题 board 的 section 详情页隐藏 Papers 步骤（仅显示 Vocab → Practice）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | PP board key 修复 + 诊断标题 + ppForceBack 诊断路由 + 结果进度条 + renderMath |
| `js/mastery.js` | 诊断入口 board 自适应 |
| `js/syllabus.js` | 旅程条 Papers 步条件渲染 |
| `css/style.css` | +`.diag-label-col` `.diag-bar` `.diag-bar-fill` 进度条样式 |
| `js/config.js` | 版本号 v1.10.1 → v1.10.2 |

## [1.10.1] - 2026-03-07 — 诊断测试：跨知识点薄弱点定位

### 新增
- **诊断测试** `startDiagnostic(board)`: 从全部知识点自动选取 20 道真题，按健康度加权采样（弱项 3x/中等 2x/强项 0.5x），确保每知识点最多 3 题、覆盖面最大化
- **专属结果页** `_diagShowResults()`: 按知识点逐项显示得分 + 百分比（绿/黄/红三色指示），弱项排在前面，<50% 知识点自动归入"建议重点复习"推荐区
- **首页入口**: Smart Path 下方新增诊断测试卡片（"20 题跨知识点测试 · 发现薄弱环节"），点击直接开始
- **结果持久化**: 诊断结果保存到 `diag_history` localStorage（最多保留 10 次），支持未来趋势分析
- **复用 PP 基础设施**: 诊断测试复用现有 PP 出题/答题/评分流程，`isDiagnostic` 标志区分结果展示

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`startDiagnostic()` 加权选题 + `_diagShowResults()` 专属结果页 + `ppFinishMarking` 诊断分流 |
| `js/mastery.js` | `renderHome()` +诊断测试入口卡片 |
| `css/style.css` | +`.diag-*` 首页入口/结果行/推荐区样式 + 暗色模式 |
| `js/config.js` | 版本号 v1.10.0 → v1.10.1 |

## [1.10.0] - 2026-03-07 — 练习推荐引擎：薄弱题型检测 + 精准练习

### 新增
- **薄弱题型分析** `ppGetWeakGroups()`: 按真题 question group 统计掌握率，返回 mastery<60% 的弱项（按弱到强排序）
- **Section 详情页 Focus Areas**: PP 模块内显示最弱 3 个题型芯片，一键进入针对性练习（红色高亮 + 掌握率%）
- **PP 结果页 Focus Areas**: 得分<80% 时显示薄弱题型，支持点击即刻重练特定题型
- **Smart Path 弱项标注**: 首页推荐卡片新增 "Focus: [题型名]" 标签，显示该知识点最弱的题型
- **三层关联显性化**: `getSectionHealth()` 返回 `weakGroup` 字段，统一 Vocab-Practice-Papers 跨层分析

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`ppGetWeakGroups()` + PP 结果页 Focus Areas chips |
| `js/syllabus.js` | +`_renderPPSectionModule()` Focus Areas 行 + `getSectionHealth()` weakGroup + Smart Path weak 标签 |
| `css/style.css` | +`.pp-focus-*` 芯片样式 + `.smart-path-weak` + 暗色模式 |
| `js/config.js` | 版本号 v1.9.9 → v1.10.0 |

## [1.9.9] - 2026-03-07 — 完整学习闭环：Vocab → Practice → Papers → Review

### 新增
- **学习旅程条**: Section 详情页新增 3 步水平进度条（Vocab → Practice → Papers），实时显示每步完成/进行中/未开始状态
- **Module 完成标记**: Vocabulary（learningPct>=80%）/ Practice（isModeDone）/ Past Papers（mastered>=50%）三个模块卡片右上角绿色 ✓
- **Practice 智能下一步**: 从 section 进入 Practice 完成后，推荐 "Try Past Papers"（有真题时）或 "Back to Section"（无真题时），非 section 来源保持原有 "Back to Study"
- **Past Papers 智能下一步**: 根据得分推荐不同行动 — <50% "Review Vocabulary" / 50-79% "Review Wrong Questions" / >=80% "Next Topic"
- **Section 完成里程碑**: 三模块全部完成时弹出一次性 Toast，localStorage 防重复
- **辅助函数**: `_getSectionLevelIdx()` + `_getNextSection()` 支持跨章节导航

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`_capturedSection/Board` 上下文捕获 + `_pqSession.sectionId/sectionBoard` + `finishPractice()` 智能下一步 + `ppShowResults()` 分数引导 + `_getSectionLevelIdx()` + `_getNextSection()` |
| `js/syllabus.js` | +学习旅程条 HTML + Vocab/Practice 完成 ✓ + PP 完成 ✓ + journey bar 异步更新 + 里程碑检测 |
| `css/style.css` | +`.sec-journey*` 旅程条 + `.sec-module-done` 完成标记 + 暗色模式适配 |
| `js/config.js` | 版本号 v1.9.8 → v1.9.9 |

## [1.9.8] - 2026-03-07 — 智能学习路径：薄弱点检测 + 学习推荐

### 新增
- **知识点健康度评分** `getSectionHealth()`: 融合词汇 SRS 星级（40%权重）和真题掌握度（60%权重），计算 0-100 综合分数，附带活跃度衰减因子（recency 0.7-1.0）
- **薄弱知识点排序** `getWeakestSections()`: 遍历全部考纲章节，按健康度升序排列，识别最需要加强的知识点
- **首页推荐学习区域** `renderSmartPath()`: 合并 CIE + Edexcel 最弱 5 个知识点，每张卡片含环形分数 + 知识点名 + 推荐操作 + Vocab%/Papers% + 考试局标签
- **6 种智能推荐**: start（未开始）/ vocab（词汇薄弱）/ past_papers（真题薄弱）/ review_words（错误率高）/ practice（继续练习）/ great（已掌握）
- **折叠/展开持久化**: `toggleSmartPath()` + localStorage 保存折叠状态
- **知识点详情页健康度**: 进度条下方显示环形分数 + 分项明细（Vocab% · Papers% · Fail rate%）
- **PP 数据预加载**: 首页渲染时 fire-and-forget 加载真题数据，确保下次访问包含真题维度

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | +`_sectionHealthCache` +`getSectionHealth()` +`getWeakestSections()` +`renderSmartPath()` +`_spRecLabel()` + 详情页健康度区域 |
| `js/mastery.js` | `renderHome()` +Smart Path 插入 +`toggleSmartPath()` + PP 预加载 |
| `css/style.css` | +`.smart-path-*` +`.sp-score-ring` +`.sec-health-*` |
| `js/config.js` | 版本号 v1.9.7 → v1.9.8 |

## [1.9.7] - 2026-03-07 — 词汇联动：真题关联词汇

### 新增
- **真题题卡"相关词汇"折叠区**: 练习模式下，已标注知识点的题卡自动显示关联词汇列表（词 + 释义 + 星级/new 状态）
- **词汇查找函数** `_ppGetSectionVocab()`: 通过 `question.s` → `_boardSectionLevelMap` → `LEVELS` 映射链获取知识点对应词汇及学习状态
- **折叠交互** `ppToggleVocab()`: 复用 Mark Scheme 的 `.pp-ms-content.show` 交互模式
- **"学习词汇"按钮**: 折叠区底部一键跳转到对应词汇卡组详情页（`openDeck()`）
- **知识点详情页词汇进度**: `_renderPPSectionModule()` 新增 "📝 词汇: X/Y 已学 · 去学习" 摘要行

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`_ppGetSectionVocab()` +vocab toggle 区域 +`ppToggleVocab()` |
| `js/syllabus.js` | `_renderPPSectionModule()` +词汇进度摘要行 |
| `css/style.css` | +`.pp-vocab-row/word/def/stars/new` |
| `js/config.js` | 版本号 v1.9.6 → v1.9.7 |

## [1.9.6] - 2026-03-07 — 题型归纳：按指令动词分类真题

### 新增
- **Command Word 分类引擎**: 12 条优先级排序正则规则（show/explain/describe/draw/sketch/complete/simplify/solve/rearrange/calculate/find/write），对全部 4,107 题自动标注 `cmd` 字段
- **知识点详情页 cmd chips**: "按指令动词"分类行，点击即可筛选指定类型题目（如"所有 Calculate 计算题"）
- **练习模式 cmdFilter**: `startPastPaper()` 新增第 5 参数 `cmdFilter`，header 显示 filter chip + "Show all" 清除
- **题卡 cmd badge**: 每道题卡 header 显示指令动词标签（`.pp-cmd-badge`）
- **套卷详情页 cmd 分布**: Topic chips 下方新增 Command Words 分布 chips

### 数据统计
- calculate: 1,167 (28.4%) | find: 803 (19.6%) | draw: 370 (9.0%) | complete: 362 (8.8%)
- write: 350 (8.5%) | simplify: 306 (7.5%) | show: 206 (5.0%) | solve: 151 (3.7%)
- describe: 138 (3.4%) | explain: 84 (2.0%) | rearrange: 39 (0.9%) | sketch: 35 (0.9%)
- other: 96 (2.3%) — 远低于 5% 目标

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/build-papers-data.py` | +`CMD_RULES` +`classify_cmd()` +entry `cmd` 字段 + cmd 统计输出 |
| `data/papers-cie.json` | 重新生成（+4,107 个 `cmd` 字段） |
| `js/syllabus.js` | +`PP_CMD_LABELS` +`PP_CMD_ORDER` + `_renderPPSectionModule()` cmd chips |
| `js/practice.js` | `startPastPaper()` +cmdFilter + `_ppCmdLabel()` + `ppClearCmdFilter()` + cmd badge + 套卷 cmd 分布 |
| `css/style.css` | +`.pp-cmd-badge` |
| `js/config.js` | 版本号 v1.9.5 → v1.9.6 |

## [1.9.5] - 2026-03-07 — 知识卡片 Edexcel + 剩余 ZH 补全

### 修复
- **Edexcel 30 张 ZH 补全**: 通过 Gemini CLI 批量翻译全部 Edexcel 4MA1 知识卡片低质量中文内容
- **剩余 32 张 ZH 补全**: CIE 21 + Edexcel 11 张 35-40% 区间卡片中文翻译
- **重复条目清理**: 移除 Edexcel 4.1 examples 中有错误解题过程的旧版本

### 数据统计
- 修复前 (v1.9.3 后): 33 张 < 40%，平均 51.4%
- 修复后: 2 张 < 40%（CIE 1.14 知识 39%, Edexcel 6.3 知识 39%），平均 54.8%
- 翻译补全: 62 张卡片（Edexcel 30 + 剩余 CIE/Edexcel 32）

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/seed-section-content.js` | 11 张 ZH 补全（CIE Ch1 + Edexcel Ch1） |
| `scripts/seed-ch2.js` | 3 张 ZH 补全 |
| `scripts/seed-ch3.js` | 6 张 ZH 补全 |
| `scripts/seed-ch4.js` | 7 张 ZH 补全 + 移除 4.1 examples 重复 |
| `scripts/seed-ch5-6.js` | 4 张 ZH 补全 |
| `scripts/seed-ch7-9.js` | 1 张 ZH 补全 |
| `js/config.js` | 版本号 v1.9.3 → v1.9.5 |

## [1.9.4] - 2026-03-07 — Keywords 表重命名 kw_ 前缀

### 变更
- **表重命名**: `classes` → `kw_classes`、`class_students` → `kw_class_students`、`assignments` → `kw_assignments`，避免与 25maths-website B2B 表名冲突
- **Supabase 迁移**: 新增 `20260307100000_rename_kw_tables.sql`，包含表重命名、索引重命名、RLS 策略重建、RPC 函数更新、视图重建
- **Edge Functions**: 3 个函数（create-students / update-student / reset-student-password）更新表引用
- **前端 JS**: admin.js（7处）、homework.js（1处）、app.js（1处）更新 `.from()` 调用

### 文件变更
| 文件 | 变更 |
|------|------|
| `supabase/migrations/20260307100000_rename_kw_tables.sql` | 新建：ALTER TABLE RENAME + 索引/策略/函数/视图更新 |
| `supabase/functions/create-students/index.ts` | `classes` → `kw_classes`、`class_students` → `kw_class_students` |
| `supabase/functions/update-student/index.ts` | `class_students` → `kw_class_students`、`classes!inner` → `kw_classes!inner` |
| `supabase/functions/reset-student-password/index.ts` | 同 update-student |
| `js/admin.js` | 4处 `classes` + 3处 `class_students` → kw_ 前缀 |
| `js/homework.js` | 1处 `class_students` → `kw_class_students` |
| `js/app.js` | 1处 `classes` → `kw_classes` |
| `CLAUDE.md` | 更新 Supabase tables 列表 |

## [1.9.3] - 2026-03-07 — 考点精讲知识卡片内容质量审核

### 修复
- **Markdown 表格转换**: 6.3 三角函数精确值表格 + 9.3 分组频率表格，从 markdown 管道格式转为 pqSanitize 兼容的列表格式
- **60 张卡片 ZH 内容补全**: 通过 Gemini CLI 批量翻译，覆盖 CIE Ch1-Ch9 全部低质量中文内容

### 数据统计
- 修复前: 122 张卡片 ZH/EN ratio < 40%（最低 16.8%，平均 28.5%）
- 修复后: 仅 21 张 < 40%（最低 35.0%，平均 52.3%），0 张 < 30%
- Markdown 表格: 2 → 0
- 翻译补全: 60 张 CIE 卡片（知识卡 + 经典例题），覆盖全部 72 知识点

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/seed-section-content.js` | 2 张卡片 ZH 补全（Ch1） |
| `scripts/seed-ch2.js` | 10 张卡片 ZH 补全 |
| `scripts/seed-ch3.js` | 5 张卡片 ZH 补全 |
| `scripts/seed-ch4.js` | 8 张卡片 ZH 补全 |
| `scripts/seed-ch5-6.js` | 13 张卡片 ZH 补全 + 6.3 表格修复 |
| `scripts/seed-ch7-9.js` | 22 张卡片 ZH 补全 + 9.3 表格修复 |

## [1.9.2] - 2026-03-06 — 全量 Subtopic 标注 Phase B

### 新增功能
- **7 Topic 批量标注**: 对 Coordinate geometry / Geometry / Mensuration / Trigonometry / Transformations & vectors / Probability / Statistics 共 3,494 道题完成 subtopic 标注
- **规则引擎标注器**: `tag_subtopics_auto.py` 基于关键词规则的高速标注器，替代 Gemini CLI 批量标注（秒级完成 vs 小时级）
- **泛化标注管道**: `run_subtopic_tagging.sh` 改为 config-driven，支持 `--config configs/xxx.json`
- **7 个 Topic Config**: 新建 coord / geometry / mensuration / trigonometry / vectors / probability / statistics 配置文件
- **build-papers-data 扩展**: `load_tagged_data()` 从 2 个数据源扩展到 9 个，覆盖全部 CIE 0580 考纲章节

### 数据统计
- 标注覆盖率: 2,174 → 3,781 题（92%，+1,607 题）
- 覆盖 66 个 sections（共 72 个）
- 未标注 326 题（原 algebra/number 遗留空标注）
- 新增标注分布: Geometry 764 / Coord 308 / Statistics 173 / Mensuration 150 / Probability 124 / Vectors 69 / Trigonometry 19

### 文件变更
| 文件 | 变更 |
|------|------|
| `CIE analysis/scripts/run_subtopic_tagging.sh` | 泛化为 config-driven（--config 参数） |
| `CIE analysis/scripts/tag_subtopics_auto.py` | 新建：规则引擎标注器 |
| `CIE analysis/configs/{7个}.json` | 新建 7 个 topic config |
| `scripts/build-papers-data.py` | load_tagged_data() 扩展到 9 个数据源 |
| `data/papers-cie.json` | 重新生成（3,781 题有 subtopic） |
| `js/config.js` | v1.9.2 |

## [1.9.1] - 2026-03-06 — 套卷系统 UX 优化

### 改进
- **倒计时器**: 全卷考试使用真实时限倒计时（60/90/120/150 min），剩余 ≤10min 黄色警告，≤5min 红色警告，倒计时归零自动交卷
- **考试确认屏**: exam 模式新增确认页面，显示 Paper 信息（类型/年份/总分/时限/题数），确认后才开始计时
- **Header 试卷标识**: 练习/考试进行中 header 显示当前试卷 "Paper 42 · 2024 O/N"
- **退出确认**: 考试模式中途退出弹出确认对话框，防止误操作丢失进度
- **结果页时间对比**: 全卷考试结果页显示 "用时 XX:XX / 时限 YY:XX"
- **过滤废题**: `build-papers-data.py` 跳过 marks=0 题目（3 道被移除），总题数 4,110→4,107
- **暗色模式补全**: 入口卡片、Paper 卡片、详情页、题目预览列表暗色适配

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 计时器重构 + `ppShowPaperExamSetup()` + `ppStartPaperExam()` + `ppForceBack()` + header 试卷信息 + 结果页时限对比 |
| `scripts/build-papers-data.py` | +marks=0 过滤 |
| `data/papers-cie.json` | 重新生成（4,107 题） |
| `css/style.css` | +7 条暗色模式规则 |
| `js/config.js` | v1.9.1 |

## [1.9.0] - 2026-03-06 — 套卷系统 Phase 1+2（Paper-Centric Architecture）

### 新增功能
- **统一数据管道**: `build-papers-data.py` 从 TikzVault catalog 提取全部 4,110 道 CIE 0580 真题，生成 `papers-cie.json`（含 228 套卷元数据 + 2,175 道已标注题 + 1,935 道大类标注题）
- **套卷浏览入口**: CIE 考试局首页新增"套卷练习"入口卡片，进入年份→考期→Paper 三级浏览
- **Paper 详情页**: 显示试卷类型（Core/Extended + Calc/Non-Calc）、总分、时间、题数、知识点分布、最高分记录、题目列表预览
- **练习模式**: 选择任意套卷 → 按原卷顺序逐题浏览 → 自评打分（Needs Work / Partial / Mastered）
- **考试模式**: 选择套卷 → 全卷计时答题（150min/90min/60min 按卷型推断）→ 交卷 → 逐题批改 → 总分统计
- **Paper 成绩持久化**: localStorage 存储每套卷最高分，浏览页面显示完成状态
- **错题联动**: 考试模式批改后错题自动进入错题本（复用现有 `_ppWrongBook` 系统）
- **向后兼容**: 现有专题视图（按 syllabus section 过滤）功能完全保持，数据源切换为统一 JSON

### 数据统计
- 4,110 道题 · 228 套卷 · 2018-2025 全覆盖
- Core: 2,015 题 · Extended: 2,095 题
- 含图题: 1,107 道
- 已标注 subtopic: 2,175 道（Algebra 803 + Number 1,372）
- 9 大知识领域: Number(1,700) Algebra(803) Geometry(762) Coord(308) Statistics(173) Mensuration(151) Probability(124) Vectors(69) Trigonometry(20)

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/build-papers-data.py` | 重写：统一数据管道，全量 4,110 题 + paperMeta |
| `data/papers-cie.json` | 新建 ~2.9MB 统一数据文件 |
| `js/practice.js` | +`getPPByPaper()` `getPaperList()` `getPaperMeta()` `_ppSavePaperResult()` `ppShowPaperBrowse()` `ppShowPaperDetail()` `ppStartFullPaper()` + 数据层适配 v2.0 格式 |
| `js/syllabus.js` | +CIE 首页"套卷练习"入口卡片 |
| `js/config.js` | v1.9.0 |
| `css/style.css` | +套卷浏览 UI 样式（年份标签、Paper 卡片、详情页、题目预览） |
| `index.html` | +`panel-papers` |

## [1.8.4] - 2026-03-06 — TikZ→SVG 图表渲染试点

### 新增功能
- **TikZ→SVG 编译管道**: `build-figures.py` 脚本，从 CIE 源码自动提取 TikZ 图表，pdflatex+pdf2svg 编译为 SVG
- **图表内联渲染**: Section 2.5 七道含图真题直接显示 SVG/PNG 图表，替代"请参考原卷"提示
- **暗色模式**: SVG 自动反色（`invert(1) hue-rotate(180deg)`），黑底白线，彩色标注保持原色调
- **PNG 兜底**: 无 TikZ 源码的题目自动拷贝 PNG 截图作为备选
- **manifest 解耦**: `data/figures/manifest.json` 独立映射，无需重新生成 pastpapers-cie.json
- **批改视图**: 实战模式批改页面同步显示题目图表

### 数据统计
- Section 2.5 共 7 道图表题：5 题 TikZ→SVG（7 个 SVG 文件）+ 2 题 PNG 兜底
- SVG 平均 ~16KB，编译成功率 100%

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/build-figures.py` | 新建 TikZ→SVG 编译脚本 |
| `data/figures/*.svg` | 7 个 SVG 图表文件 |
| `data/figures/*.png` | 2 个 PNG 兜底文件 |
| `data/figures/manifest.json` | qid→figure 映射 |
| `js/practice.js` | +`_ppRenderFigures()` + manifest 加载 + 批改视图集成 |
| `css/style.css` | +`.pp-figures` `.pp-fig` + 暗色模式反色 |
| `js/config.js` | v1.8.4 |
| `index.html` | 缓存版本号更新 |

## [1.8.3] - 2026-03-06 — 真题纠错模块

### 新增功能
- **真题纠错按钮**: 练习模式和实战模式每道题下方显示 🚩 报告错误按钮（全用户可用）
- **超管编辑器**: 超级管理员可点击 ✏️ 编辑按钮，修改题目文本(LaTeX)、分值、难度、题型分类
- **实时预览**: 编辑器内 LaTeX 实时预览渲染
- **批改视图纠错**: 实战模式批改页面每题也有报告/编辑入口
- **错误分类**: 6 种错误类型（题目文本/LaTeX渲染/分值/题型分类/来源信息/其他）
- **本地即时生效**: 超管修正提交后本地立即应用，无需刷新
- **Guest 邮件回退**: 未登录用户通过 mailto 提交报告

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | +`reportPastPaperQ()` `submitPPReport()` `editPastPaperQ()` `submitPPEdit()` `_ppUpdateEditPreview()` |
| `js/config.js` | v1.8.3 |
| `index.html` | 缓存版本号更新 |

## [1.8.2] - 2026-03-06 — 代数全章真题扩展（127→793 题）

### 数据扩展
- **代数全章 13 个 section**: 从仅 2.5 扩展到 2.1-2.13，共 793 道真题
- **Section 分布**: 化简(2.1:9) · 公式变形(2.2:172) · 指数(2.3:29) · 代数分式(2.4:72) · 方程(2.5:127) · 不等式(2.6:45) · 数列(2.7:111) · 比例(2.8:37) · 实际图像(2.9:9) · 函数图像(2.10:99) · 微分(2.11:13) · 函数记号(2.12:25) · 函数(2.13:45)
- **15 种题型分组**: 化简/因式、二次方程、函数、数列、图像、联立一次/非线性、公式变形、代数分式、一次方程、不等式、比例、指数、代入、综合

### Bug 修复
- **Tab 字符**: 数据管道清除 tab 字符（避免 KaTeX 渲染异常）

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/pastpapers-cie.json` | 127→793 题（85KB→546KB） |
| `scripts/build-pastpaper-data.py` | 全章处理 + tab 清除 + section→topic 映射 + 15 种 qtype 分类 |
| `js/practice.js` | 15 种 `_ppGroupLabels` |
| `js/syllabus.js` | 15 种 `PP_GROUP_LABELS` + `PP_GROUP_ORDER` |
| `js/config.js` | v1.8.2 |
| `index.html` | 缓存版本号更新 |

## [1.8.1] - 2026-03-06 — 筛选标注 + LaTeX 缓存修复

### Bug 修复
- **缓存破坏**: JS/CSS/JSON 引用添加版本号查询参数，解决浏览器缓存旧版导致 LaTeX 不渲染的问题

### 新增功能
- **母题总结面板**: 知识点页面展示 6 大题型总结，勾选已掌握题型，「只练未掌握」一键筛选
- **单词筛选标注**: Deck 详情页新增「选择模式」+「隐藏已掌握」，勾选单词自由组合学习
- **自定义学习**: 学习和测验模式均支持 subset 参数，只练选中的单词

### 文件变更
| 文件 | 变更 |
|------|------|
| `index.html` | JS/CSS 引用添加 `?v=1.8.1` |
| `js/config.js` | APP_VERSION → v1.8.1 |
| `js/practice.js` | 数据 fetch 缓存破坏 + mqtype 存储函数 |
| `js/syllabus.js` | 母题总结渲染 `_renderMasterQSummary` + 交互 |
| `js/mastery.js` | 筛选工具栏 + 选择模式 + 操作函数 |
| `js/quiz.js` | `startQuiz` 支持 subset 参数 |
| `css/style.css` | `.mq-*` + `.deck-filter-*` + `.word-check` 样式 |

## [1.8.0] - 2026-03-06 — Past Paper 真题引擎 · 试点（Phase A）

### 新增功能
- **真题题库**: 127 道 CIE 0580 Section 2.5 Equations 历年真题（2018-2025），LaTeX→KaTeX 网页渲染
- **练习模式**: 逐题浏览 + 分值信息 + 三级自评（Needs Work / Partial / Mastered）+ 自由翻题
- **实战模式**: 限时考试 + 题量选择（10/20/All）+ 标记不确定 + 题号导航 + 自动计时
- **批改系统**: 逐题自评 + 得分输入 + 错因标注（6 类：概念不清/方法错误/计算错误/粗心/不完整/超时）+ 题型分析
- **错题本**: 自动收集（练习🔴 + 实战🔴🟡）+ 错因备注 + 复习计数 + 一键再练 + resolved 标记
- **首页提醒**: 错题超过 3 天未复习 → Toast 提醒
- **知识点集成**: Section 详情页 Past Papers 模块（题量 + 掌握度统计 + 练习/实战/复习三入口）

### 数据管道
- `scripts/build-pastpaper-data.py`: 从 IGCSE_v2 tagged JSON 提取 + LaTeX 清洗 + KaTeX 兼容处理
- 清洗: 去除 `\begin{question}`/`\AnswerLine`/`\Marks`/`\vgap`/`\begin{center}` + `\textdollar`→`\$` + `\textbf`→`**bold**` + parts 解析
- 零 marks 修复: 从 `\begin{question}{N}` wrapper 提取分值

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/pastpapers-cie.json` | 新增 — 127 道真题（85 KB，LaTeX + 元数据） |
| `js/practice.js` | +910 行 — Past Paper 模块（数据加载/练习/实战/批改/错题本） |
| `js/syllabus.js` | +35 行 — Past Papers 入口模块（掌握度统计 + 三入口按钮） |
| `js/app.js` | +3 行 — 错题本复习提醒 |
| `css/style.css` | +156 行 — `.pp-*` 系列样式（卡片/计时器/导航点/错因标签/暗色模式） |
| `index.html` | +1 行 — `panel-pastpaper` 面板 |
| `scripts/build-pastpaper-data.py` | 新增 — 数据管道脚本 |

## [1.7.4] - 2026-03-06 — CIE + Edexcel 练习题质量审计与修复

### Phase A — 题目搬迁（改 `s` 字段）
- **CIE 55 题搬迁**：修正错配 section
  - 1.4→1.1: 15 题（place value/ordering 非有向数题）
  - 2.1→2.2/2.3: 3 题（rearranging/factorising）
  - 2.3→2.2: 2 题（make subject）
  - 2.8→1.12/4.3: 3 题（ratio/scale drawing）
  - 2.11→3.2: 4 题（linear graph 题）
  - 3.1→3.4/7.1: 13 题（midpoint/reflection/translation）
  - 3.5→3.7: 3 题（perpendicular line）
  - 4.6→4.7: 1 题（cyclic quadrilateral）
  - 5.2→5.3: 3 题（circle area/circumference/sector）
  - 6.4→6.2: 6 题（right-triangle trig）
  - 9.4→9.7: 2 题（histogram/frequency density）
- **Edexcel 78 题搬迁**：
  - 2.4→2.5/2.6: 24 题（proportion + simultaneous equations）
  - 3.1→3.2/3.3: 36 题（function notation + graph-of-sequence）
  - 4.9→4.10: 6 题（3D mensuration）
  - 5.1→5.2: 12 题（transformation geometry）

### Phase B — 去重 + 质量修复
- **CIE 11 题隐藏**（精确重复）：1.3×7, 1.10×2, 1.12×1, 4.5×1
- **Edexcel 4 题隐藏**（精确重复）：e842/e351/e210/e160
- **Edexcel 6 题隐藏**（超纲）：3.4 积分/二阶导×4, 5.2 shear×1, 4.7 非推理×1
- **5 道链式依赖题修复**：移除 "previous question" 引用，改为独立题干
- **5 道 LaTeX 渲染错误修复**：1.10 除法表达式断裂分数修正
- **Edexcel 4.11 topic 规范化**：22 题 "Geometry"→"Similarity"

### Phase D3 — 层级异常修复
- **32 题 d=1→d=2**：Extended-only section（1.11/2.11/4.7）中错标为 Core 的题目

### 代码变更
- `practice.js`：新增 JSON `status: "hidden"` 过滤支持

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/questions-cie.json` | 55 题改 s + 11 题 hidden + 5 链式修复 + 5 LaTeX 修复 + 32 题 d 修正 |
| `data/questions-edx.json` | 78 题改 s + 10 题 hidden + 22 题 topic 修正 |
| `js/practice.js` | 增加 JSON status=hidden 过滤 |
| `scripts/fix-questions-audit.py` | 审计修复脚本（一次性） |

## [1.7.3-dedup4] - 2026-03-06 — CIE 跨 section 重复词深度优化（27→13）

### 优化
- **14 个跨 section 重复词替换**为更精准的专属词汇，保留 13 个两侧都不可替代的核心术语：
  - 1.3: Square root → nth root（1.18 Surds 更需要 square root）
  - 1.5: Decimal place → Terminating decimal（1.7 Bounds 更需要 decimal place）
  - 1.17: Multiplier → Growth factor（1.13 Percentages 定义 multiplier）
  - 2.10: y-intercept → Minimum point（3.6 Parallel lines 更需要 y-intercept）
  - 2.11: Reciprocal → Hyperbola（1.1 Types of number 定义 reciprocal）
  - 3.3: Parallel → Equal gradients（4.1 Geometrical terms 定义 parallel）
  - 4.4: Corresponding angles → Similar triangles + Enlargement → Proportional sides
  - 6.3: Exact value → Trigonometric ratio（1.18 Surds 定义 exact value）
  - 7.1: Clockwise → Anticlockwise + Mirror line → Axis of reflection
  - 7.3: Length → Direction（5.1 Units 定义 length）
  - 9.6: Median → Cumulative frequency curve + Upper quartile → Five-number summary
- **保留 13 个核心重复词**：Arc / Asymptote / Constant / Factorise / Perpendicular bisector / Quartile / Rate of change / Region / Scale / Semicircle / Variable / x-intercept / y = mx + c

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/vocabulary-cie.json` | 14 处词汇替换（594 词总数不变） |

## [1.7.3-dedup3] - 2026-03-06 — 修复 4 个新增跨 section 重复词

### 修复
- **4 个替换词本身存在于其他 section**，再次替换为真正唯一的词：
  - 1.6: Expression→Left to right（BIDMAS 同优先级运算方向）
  - 1.10: Order of magnitude→Rough estimate（估算核心概念）
  - 4.2: Midpoint→Pair of compasses（作图必备工具）
  - 9.7: Modal class→Upper boundary（直方图组距上界）
- 跨 section 重复词从 31 降至 **27**

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/vocabulary-cie.json` | 4 处词汇替换（594 词总数不变） |

## [1.7.3-dedup2] - 2026-03-06 — CIE 跨 section 重复词分级处理

### 修复
- **10 个跨 section 重复词替换**为更精准的专属词汇：
  - 1.6: Exponent→Indices, Simplify→Expression
  - 1.10: Accuracy→Order of magnitude
  - 2.6: Number line→Open circle
  - 3.2: Origin→Axes
  - 4.2: Perpendicular→Midpoint
  - 4.5: Congruent→Tessellation
  - 7.3: Scalar→Component
  - 8.2: Frequency→Bias
  - 9.7: Frequency table→Modal class
- 跨 section 重复词从 37 降至 31（剩余为不同语境下的有价值重复）

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/vocabulary-cie.json` | 10 处词汇替换（594 词总数不变） |

## [1.7.3-dedup] - 2026-03-06 — CIE 词汇审核去重

### 修复
- **9.6 section 内去重**：删除重复 "Percentile"（id=8），替换同义 "Box plot" 为 "Upper quartile"
- **4.2 vs 4.8 高重叠拆分**（71% → 0%）：4.2 重写为 Protractor / Bisect / Perpendicular / Straight edge / Set square / Measure / Accurate drawing
- **15 个跨 section 重复词替换**为更精准的同领域词汇（涉及 1.10/1.18/2.2/2.4/2.8/3.2/3.6/3.7/4.5/7.3/8.2/9.7）

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/vocabulary-cie.json` | 9.6 去重 + 4.2 重写 + 15 处替换（595→594 词） |

## [1.7.3] - 2026-03-06 — 核心词汇关联性审核与重组

### 修复
- **Edexcel 7 个 section 词汇重写**：1.9/1.10/1.11/2.5/2.6/4.4/4.7 原先因 vocabSlugs 重复导致词汇错配，全部替换为与知识点匹配的专属词汇
- **vocabSlugs 一致性修复**：syllabus-edexcel.json 中 7 个 section 的 vocabSlugs 更新为唯一标识（edx-num-standard / edx-num-applying / edx-num-calculator / edx-alg-proportion / edx-geo-measures / edx-geo-reasoning）

### 补充
- **CIE 22 个薄弱 section 词汇扩容**：为词汇量 ≤5 的 section 各补充 2-4 个关键词（1.6/1.8/1.10/1.11/1.14/1.17/1.18/2.2/2.4/2.8/2.11/3.2/3.3/3.6/3.7/4.5/4.8/6.3/7.3/8.2/9.6/9.7）
- CIE 最小词汇量从 4 提升到 6，总词数 517→595

### 文件变更
| 文件 | 变更 |
|------|------|
| `data/vocabulary-edexcel.json` | 7 section 词汇重写（385→387 词） |
| `data/vocabulary-cie.json` | 22 section 补充词汇（517→595 词） |
| `data/syllabus-edexcel.json` | 7 section vocabSlugs 更新 |
| `js/config.js` | APP_VERSION → v1.7.3 |

## [1.7.2-data] - 2026-03-06 — 全量知识卡片+经典例题内容填充

### 数据
- **111 个知识点 × 2 模块 = 222 条内容**：为 CIE 0580 全 9 章 72 个知识点 + Edexcel 4MA1 全 6 章 39 个知识点填充「知识卡片」和「经典例题」
- **内容格式**：Exam Success 风格 — Recap → Key Skills → Exam Tip → Watch Out! → Worked Examples（含分值和逐步解答）
- **双语**：每条内容包含 English + 中文版本，数学公式用 `$...$` KaTeX 渲染
- **覆盖范围**：Ch1 (58行) + Ch2 (42行) + Ch3 (22行) + Ch4 (38行) + Ch5-6 (32行) + Ch7-9 (30行)

### 种子脚本
| 文件 | 覆盖范围 | 行数 |
|------|----------|------|
| `scripts/seed-section-content.js` | CIE 1.1-1.18 + Edexcel 1.1-1.11 | 58 |
| `scripts/seed-ch2.js` | CIE 2.1-2.13 + Edexcel 2.1-2.8 | 42 |
| `scripts/seed-ch3.js` | CIE 3.1-3.7 + Edexcel 3.1-3.4 | 22 |
| `scripts/seed-ch4.js` | CIE 4.1-4.8 + Edexcel 4.1-4.11 | 38 |
| `scripts/seed-ch5-6.js` | CIE 5.1-6.6 + Edexcel 5.1-6.3 | 32 |
| `scripts/seed-ch7-9.js` | CIE 7.1-9.7 | 30 |

## [1.7.2] - 2026-03-06 — 超管知识点模块内联编辑

### 新功能
- **知识点模块内联编辑**：超级管理员可在知识点详情页直接编辑「考纲要求」「知识卡片」「经典例题」三类模块内容
- **section_edits 表**：新建 Supabase `section_edits` 表，支持按 (board, section_id, module) 覆盖模块内容
- **富文本编辑器**：复用 practice.js 编辑器基础设施（工具栏 + KaTeX 公式插入 + 实时预览）
- **内容覆盖渲染**：编辑后的内容自动覆盖 JSON 原始数据，知识卡片/经典例题从 "Coming soon" 变为实际内容
- **可展开模块**：有内容的知识卡片/经典例题变为可点击展开的模块，支持 KaTeX 渲染
- **5 个编辑入口**：每个模块右上角显示 ✏️ 按钮（仅超管可见），分别跳转到对应编辑器或功能页

### 文件变更
| 文件 | 变更 |
|------|------|
| `supabase/migrations/20260306000000_section_edits.sql` | 新建 section_edits 表 + RLS 策略 |
| `js/syllabus.js` | `loadSectionEdits()` / `editSectionModule()` / `saveSectionEdit()` / `toggleSectionContent()` + 编辑按钮 + 覆盖渲染 |
| `css/style.css` | `.sec-module-edit` / `.sec-module-expandable` / `.sec-module-content` 样式 |
| `js/config.js` | APP_VERSION → v1.7.2 |

## [1.7.1] - 2026-03-06 — 考纲内容支持 LaTeX 数学公式渲染

### 新功能
- **考纲数学公式渲染**：知识点详情页「考纲要求」区域支持 KaTeX 数学公式渲染，`$...$` 行内公式自动渲染为数学排版
- **复用 pqRender 安全渲染**：考纲内容从 `escapeHtml()` 切换为 `pqRender()` 白名单消毒 + KaTeX 渲染，支持富文本 + 数学公式

### 数据文件
| 文件 | 说明 |
|------|------|
| `data/syllabus-cie.json` | 14 处数学表达式改为 `$...$` LaTeX 格式（幂与根、标准式、代数、函数、三角、概率等） |
| `data/syllabus-edexcel.json` | 11 处数学表达式改为 `$...$` LaTeX 格式（幂与根、二次式、函数变换、三角面积、概率公式等） |

### JS 变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | 4 处 `escapeHtml()` → `pqRender()` + 末尾添加 `loadKaTeX().then(renderMath)` |
| `js/config.js` | APP_VERSION → v1.7.1 |

### LaTeX 转换示例
- `a^(1/2) = √a` → $a^{\frac{1}{2}} = \sqrt{a}$
- `A × 10^n` → $A \times 10^n$
- `ax² + bx + c` → $ax^2 + bx + c$
- `f(x) = 3x − 5` → $f(x) = 3x - 5$
- `½ab sin C` → $\frac{1}{2}ab\sin C$
- `P(A and B) = P(A) × P(B)` → $P(A \text{ and } B) = P(A) \times P(B)$

## [1.7.0] - 2026-03-06 — Edexcel 4MA1 考纲驱动重构

### 新功能
- **Edexcel 考纲驱动结构**：Edexcel 板块从"41 扁平 levels"重构为"6 章 × 39 知识点"，严格对齐 Edexcel 4MA1 Specification A
- **多考试局架构泛化**：`syllabus.js` 从 CIE 专用重构为通用多考试局架构（`BOARD_SYLLABUS` / `BOARD_VOCAB` / `_boardSectionLevelMap`）
- **Edexcel 章节首页**：6 章手风琴布局，每章展开显示知识点列表 + 词汇/练习统计
- **Edexcel 知识点详情页**：复用 `panel-section`，显示 Foundation / Higher 考纲原文
- **Foundation / Higher 层级标签**：Higher-only 知识点（2.5, 3.2, 3.4, 5.1）显示紫色 "H" 标签
- **Edexcel 按知识点练习**：Practice 支持按单个知识点或整章筛选
- **SoW 教学序列**：`syllabus-edexcel.json` 包含 Foundation 30 单元 + Higher 32 单元 SoW 映射

### 数据文件
| 文件 | 说明 |
|------|------|
| `data/syllabus-edexcel.json` | **新增** 考纲骨架（6 章 39 节，含考纲原文 + vocabSlugs + questionTopics + SoW） |
| `data/vocabulary-edexcel.json` | **新增** 39 节词汇数据（从 41 levels 迁移重组 = 385 词，100% 覆盖） |
| `data/questions-edx.json` | **修改** 936 题添加 `s` 字段映射到 39 个知识点 |

### JS 变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | **重写** ~500 行：泛化为多考试局架构 — `_loadBoardSyllabus()` / `_initBoardLevels()` / `renderEdexcelHome()` / `renderSectionDetail()` 支持 board 参数 |
| `js/config.js` | `isLevelVisible()` 新增 `_edxOld` 隐藏标记；APP_VERSION → v1.7.0 |
| `js/mastery.js` | `renderHome()` Edexcel 委托给 `renderEdexcelHome()`；deck 返回键传 board 参数 |
| `js/practice.js` | `startPractice()` 支持 Edexcel section/chapter 过滤（通过 `_practiceBoard` 全局变量） |
| `js/levels-loader.js` | `_rebuildLevels()` 触发 Edexcel 虚拟 levels 重建 |
| `css/style.css` | 新增 `.tier-higher` / `.tier-foundation` 标签样式（含 dark mode） |

### 架构说明
- **虚拟 LEVELS 模式**：Edexcel 同 CIE 一样，从 JSON 数据动态创建 LEVELS 条目（`_isSection: true, _board: 'edexcel'`），复用全部 7 种学习模式
- **`_edxOld` 标记**：旧 41 Edexcel levels 标记为隐藏，不影响数据、仅从首页隐藏
- **`BOARD_SYLLABUS` / `BOARD_VOCAB`**：通用数据存储，支持后续扩展更多考试局

## [1.6.1] - 2026-03-06 — 知识点详情页模块纠错按钮

### 新功能
- **模块纠错按钮**：知识点详情页全部 5 个模块均可纠错 — Vocabulary / Practice / Knowledge Card / Worked Examples / Syllabus Requirements
- **纠错 Modal**：点击 🚩 弹出纠错表单，含知识点信息预览 + 错误类型选择 + 描述输入
- **双路径提交**：登录用户提交到 Supabase `feedback` 表（`type='section'`）；Guest 用户 mailto 降级
- **5 套错误类型**：每个模块独立错误类型（Vocabulary 4 类 / Practice 4 类 / Knowledge 4 类 / Examples 4 类 / Syllabus 4 类）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | 模块卡片添加 🚩 按钮 + `reportSectionModule()` + `submitSectionReport()` + `_sectionReportTypes` |
| `css/style.css` | `.sec-module-report` 按钮样式（hover 变橙） |
| `js/config.js` | APP_VERSION → v1.6.1 |

## [1.6.0] - 2026-03-06 — CIE 考纲驱动重构（Phase A）

### 新功能
- **考纲驱动结构**：CIE 板块从"8 分类 × 50 词组"重构为"9 章 × 72 知识点"，严格对齐 CIE 0580 (2025-2027) 考纲
- **知识点详情页**：每个知识点独立详情页，显示 4 个学习模块入口（Knowledge / Vocabulary / Examples / Practice）+ 考纲原文（Core + Extended）
- **章节折叠首页**：CIE 首页显示 9 个章节手风琴，每章展开显示知识点列表 + 词汇/练习统计
- **词汇扩容**：CIE 词汇从 390 词扩展到 517 词（72 节全覆盖，新增 ~127 词）
- **按知识点练习**：Practice 支持按单个知识点或整章筛选（新增 `getPracticeBySection` / `getPracticeByChapter`）
- **考纲层级标签**：知识点显示 Core / Extended / Core+Ext 层级标签

### 数据文件
| 文件 | 说明 |
|------|------|
| `data/syllabus-cie.json` | **新增** 考纲骨架（9 章 72 节，含考纲原文 + vocabSlugs + questionTopics） |
| `data/vocabulary-cie.json` | **新增** 72 节词汇数据（从 levels.js 迁移 390 词 + 新增 ~127 词 = 517 词） |
| `data/questions-cie.json` | **修改** 1,488 题添加 `s` 字段映射到 72 个知识点 |

### JS 变更
| 文件 | 变更 |
|------|------|
| `js/syllabus.js` | **新增** ~300 行：考纲加载 + 虚拟 LEVELS 生成 + CIE 首页渲染 + 知识点详情页 |
| `js/config.js` | `isLevelVisible()` 隐藏旧 CIE levels；APP_VERSION → v1.6.0 |
| `js/mastery.js` | `renderHome()` CIE 委托给 `renderCIEHome()`；`renderDeck()` section 返回键适配 |
| `js/practice.js` | 新增 `getPracticeBySection()` / `getPracticeByChapter()`；`startPractice()` 支持 section/chapter 模式 |
| `js/levels-loader.js` | `_rebuildLevels()` 触发 CIE 虚拟 levels 重建 |
| `js/ui.js` | section panel 路由注释 |
| `index.html` | 新增 `panel-section` div |
| `scripts/minify.sh` | 添加 syllabus.js 到 bundle |
| `css/style.css` | ~60 行新样式（tier-badge / sec-hero / sec-modules / sec-syllabus 等） |

### 架构说明
- **虚拟 LEVELS 模式**：syllabus.js 从 JSON 数据动态创建 LEVELS 条目（`_isSection: true`），复用全部 7 种学习模式
- **`_cieOld` 标记**：旧 CIE 50 级 levels 标记为隐藏，不影响数据、仅从首页隐藏
- **幂等初始化**：`_initCIELevels()` 每次清理再重建，支持 `_rebuildLevels()` 反复调用
- **向后兼容**：Edexcel / 25m 板块完全不受影响

## [1.5.4] - 2026-03-06 — Practice 入口从词卡组移到专题分类

### 改进
- **Practice 入口上移**：Practice 和 Review All 按钮从 deck 详情页移到首页分类（category）层级，在展开的 CIE/Edexcel 分类词卡组列表上方显示，产品结构更清晰
- **deck 详情页精简**：移除 Exam Practice 区块，deck 详情页只保留 6 个学习模式（Study/Quiz/Review/Spell/Match/Battle）
- **25m 板块不受影响**：Harrow Haikou 板块无 Practice 题库，不显示 Practice 行

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | `renderHome()` 分类 body 开头插入 pq-cat-actions 行；`renderDeck()` 删除 Exam Practice 区块 |
| `css/style.css` | +1 行：`.pq-cat-actions` 样式 |
| `js/config.js` | APP_VERSION → v1.5.4 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.5.3] - 2026-03-05 — Review All 二级 Topic 筛选

### 新功能
- **Topic 过滤**：Review All 新增二级 Topic 筛选栏，在难度过滤下方显示该分类所有 topic pill（如 Types Of Number、Sets），点击即可聚焦到单个专题
- **级联过滤**：难度行 → Topic 行级联联动，切换难度时 topic 计数实时更新并重置为 All Topics
- **pill 自动换行**：topic 数较多时（如 Number 19 个 topic）pill 自动 flex-wrap 换行，手机端友好

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 新增 `_pqReviewTopicFilter` + 级联过滤逻辑 + `setPqReviewTopic()` + 难度切换时重置 topic |
| `css/style.css` | `.pq-review-filter` 加 `flex-wrap: wrap` |
| `js/config.js` | APP_VERSION → v1.5.3 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.5.2] - 2026-03-05 — Review All 四项优化

### 改进
- **事件委托**：编辑按钮改用 `data-qid` + `panel-practice` 上单次事件委托，消除 `onclick` 内联字符串拼接（XSS 隐患）
- **滚动恢复**：编辑保存后重新渲染列表时恢复原滚动位置，不再跳回顶部
- **Core/Extended 过滤**：顶栏下方新增 `All · Core · Extended` 过滤 pill，复用 `.sort-btn` 样式，切换后序号重新编号、题数实时更新
- **题号序号**：每张卡片 `pq-meta` 最前面显示过滤后序号（`1.` `2.` ...）

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/practice.js` | 新增 `_pqReviewState` / `_pqReviewFilter` / `_pqReviewDelegated` 模块变量；重写 `startPracticeReview()`（返回 Promise + 事件委托）+ `renderPracticeReview()`（无参数 + 过滤 + 序号）+ 新增 `setPqReviewFilter()` |
| `css/style.css` | +2 行：`.pq-review-filter` 过滤栏样式 |
| `js/config.js` | APP_VERSION → v1.5.2 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.5.1] - 2026-03-05 — 超管整套题总览模式

### 新功能
- **Review All 总览全部**：超管在 deck 详情页 Exam Practice 区看到 "📋 总览全部" 按钮，点击后加载该分类全部题目（不限 10 题、不 shuffle），以可滚动列表展示
- **逐题信息**：每张卡片显示 qid、topic 标签、difficulty 标签、题干（富文本 + KaTeX）、4 个选项（正确答案绿色加粗 ✓）、解析
- **一键编辑**：每题旁边保留 ✏️ 编辑按钮，点击打开编辑器 modal，保存后自动刷新列表
- **编辑器重构**：提取 `_openEditor(q, board, onSaveCb)` 公共函数，练习页编辑 + 总览页编辑两入口复用

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | Exam Practice 区追加超管 "Review All" 按钮（+6 行） |
| `js/practice.js` | 新增 `startPracticeReview()` + `renderPracticeReview()` + `_pqFindQ()` + 重构 `_openEditor()`（+85 行） |
| `css/style.css` | +12 行：`.pq-review-list/card/opts/opt/exp` 总览列表样式 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.5.0] - 2026-03-05 — 题目纠错 + 管理员富文本编辑器

### 新功能
- **题目纠错报告**：练习中每道题显示"🚩报告错误"按钮，自动提取题目 ID + 数据，已登录用户直接存入 feedback 表（type='question'），Guest 走 mailto 降级
- **管理员富文本编辑器**：超管可直接在练习页点击"✏️编辑"打开宽屏 modal，左侧 6 个 textarea（题干/4 选项/解析）+ 右侧实时预览
- **富文本支持**：题干、选项、解析均支持排版（加粗/斜体/上下标）+ 插入图片 + KaTeX 公式，白名单 HTML sanitizer 保障安全
- **公式插入工具**：编辑器工具栏 ∑ 按钮打开浮层，输入 LaTeX 实时渲染预览，Insert 后自动插入 `$...$` 定界符
- **图片上传**：支持上传图片到 Supabase Storage `question-images` 桶，自动插入 `<img>` 标签
- **数据覆盖合并**：`question_edits` 表存储编辑后数据，加载练习时自动合并覆盖静态 JSON
- **题目隐藏**：编辑器可将题目 status 设为 hidden，该题不再出现在练习中
- **响应式编辑器**：桌面端左右分栏，手机端上下堆叠
- **暗色模式**：编辑器 modal 通过 CSS 变量自动继承主题

### 技术细节
- `pqSanitize()` 白名单 HTML sanitizer：仅允许 `<b>/<i>/<em>/<strong>/<br>/<sub>/<sup>/<img>/<u>` 标签
- `pqRender()` 替代 `escapeHtml()` 用于题干/选项/解析渲染
- `loadQuestionEdits(board)` 从 Supabase 加载编辑覆盖数据
- 编辑器工具栏：Bold / Italic / Sub / Sup / Formula / Image 6 个操作
- Supabase Storage 策略：所有人可读图片，仅超管可上传/删除

### 文件变更
| 文件 | 变更 |
|------|------|
| `supabase/migrations/20260305940000_question_edits.sql` | **新建** — question_edits 表 + RLS + Storage 桶 |
| `js/practice.js` | 重构：pqSanitize/pqRender + 数据合并 + 报告 + 编辑器（268→565 行，+297 行） |
| `css/style.css` | +80 行：报告按钮 + 编辑器 modal 样式 + 响应式 |
| `js/config.js` | APP_VERSION → v1.5.0 |
| `CLAUDE.md` | 版本号 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.4.0] - 2026-03-05 — 选择题练习模式（Phase 10B: Exam Practice）

### 新功能
- **Exam Practice 模式**：从 25maths-website 导入 2,424 道真题风格选择题（CIE 1,488 + Edexcel 936），全部含 KaTeX 数学渲染
- **KaTeX 懒加载**：首次进入 Practice 模式时按需加载 KaTeX CSS + JS + auto-render（~28KB gzip）
- **Python 提取脚本**：`scripts/extract-questions.py` 提取全部题目，保留 `$...$` LaTeX 定界符
- **按分类筛选**：每次练习从当前词组对应分类随机抽取 10 题
- **答题交互**：选项即时反馈（绿色/红色）+ 正确答案高亮 + 解析展示 + 手动 Next
- **结果页**：分数/百分比 + 错题回顾列表 + 重试/返回
- **进度追踪**：`localStorage wmatch_practice` 独立存储 + `markModeDone` 完成标记 ✓
- **Deck 详情页**：CIE/Edexcel 词组显示独立 "Exam Practice / 真题练习" 分区；25m 不显示
- **双语**：所有按钮/标签/结果页随 appLang 切换中英文
- **暗色模式**：解析区通过 CSS 变量自动继承主题

### 数据覆盖
| Board | 分类数 | 题目数 |
|-------|--------|--------|
| CIE 0580 | 8 | 1,488 |
| Edexcel 4MA1 | 6 | 936 |
| **合计** | **14** | **2,424** |

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/extract-questions.py` | **新建** — 提取脚本（~80 行） |
| `data/questions-cie.json` | **新建** — CIE 练习题 1,488 题 |
| `data/questions-edx.json` | **新建** — Edexcel 练习题 936 题 |
| `js/practice.js` | **新建** — 练习模式逻辑（~180 行） |
| `index.html` | +1 行 panel-practice |
| `js/mastery.js` | +12 行 Practice 按钮（CIE/Edexcel only） |
| `css/style.css` | +33 行 practice 样式 |
| `scripts/minify.sh` | practice.js 加入 bundle |
| `js/config.js` | APP_VERSION → v1.4.0 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.3.5] - 2026-03-05 — 首次使用引导 Tour（步骤 Tooltip）

### 新功能
- **5 步引导 Tour**：首次使用自动触发，逐步介绍统计卡片、每日挑战、词卡列表、导航栏、段位系统
- **Spotlight + Tooltip**：全屏半透明遮罩 + 目标元素高亮"洞" + 白色浮窗卡片
- **响应式导航引导**：Step 4 桌面端指向侧栏，手机端指向底部导航
- **双语支持**：标题/描述/按钮随 appLang 自动切换中英文
- **可跳过**：Skip 按钮或点击遮罩暗区即可关闭，不再显示
- **自动位置**：tooltip 在目标上方/下方自适应，水平 clamp 到视口内
- **暗色模式**：通过 CSS 变量自动继承暗色主题

### 触发条件
- `localStorage.wmatch_tour_done` 不存在时自动触发
- Guest 和已登录用户均触发
- 完成或跳过后写入 `localStorage.wmatch_tour_done = '1'`，二次访问不再显示

### 文件变更
| 文件 | 变更 |
|------|------|
| `css/style.css` | 追加 13 行 tour 样式（overlay / spotlight / tooltip / dots / buttons） |
| `js/ui.js` | showApp() +1 行 setTimeout + 末尾追加 ~80 行 tour 逻辑 |
| `js/config.js` | APP_VERSION → v1.3.5 |
| `css/style.min.css` | 重新生成 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.3.4] - 2026-03-05 — 首屏加载优化（资源提示 + 字体优化 + homework 拆包）

### 性能优化
- **资源提示**：4 个 preconnect/dns-prefetch（Google Fonts / gstatic / jsDelivr / Supabase），冷启动节省 100-300ms DNS
- **字体精简**：移除 Noto Sans SC（改为 config.js 条件加载，EN 用户省 ~30KB）和 JetBrains Mono 500 字重
- **Supabase SDK 延迟加载**：从 `<head>` 移到 `</body>` 前，不再阻塞 HTML 解析（省 ~200ms）
- **homework.js 拆包**：从 bundle 拆出独立 `homework.min.js`（11KB gzip），Guest 和无班级学生不加载

### 功能改进
- **CJK 字体条件加载**：`loadCJKFont()` 公共函数，启动时按 appLang 判断，语言切换时动态加载
- **homework 按需加载**：`loadHomeworkModule()` 公共函数，有班级学生 afterLogin 时加载，教师 loadAndInitTeacher 时加载
- 离线构建（build-single.py）不受影响：homework.js 仍在 CORE_JS_FILES 中内联

### 文件变更
| 文件 | 变更 |
|------|------|
| `index.html` | preconnect 4 行 + 字体精简 + Supabase 移到 body |
| `js/config.js` | loadCJKFont() + loadHomeworkModule() + APP_VERSION → v1.3.4 |
| `js/auth.js` | toggleAuthLang 加 loadCJKFont + afterLogin 加 loadHomeworkModule + loadAndInitTeacher 加 loadHomeworkModule |
| `scripts/minify.sh` | homework.js 独立 minify |
| `js/homework.min.js` | **新建** — homework 独立 minified |
| `js/app.bundle.min.js` | 重新生成（不含 homework） |

## [1.3.3] - 2026-03-05 — 按 board 懒加载 JSON

### 性能优化
- **按 board 懒加载 JSON**：启动时仅加载当前 board 的 JSON（CIE ~8KB / EDX ~6KB / 25m ~26KB），首次访问或教师加载全部 3 个（~40KB gzip）
- 首屏 gzip 从 ~98KB 降至 ~66-72KB（CIE 学生仅 ~58KB）

### 功能改进
- **深链支持 slug**：`?level=num-types` 按 slug 匹配，向后兼容 `?level=0` 索引
- **iOS share 恢复改 slug**：sessionStorage 保存 slug 替代 index，跨 board 加载后仍可恢复
- **跨 board 作业守卫**：学生查看/开始作业时自动加载全部 board 数据
- **导出全量守卫**：exportProgress 改 async，确保包含全部 board 数据

### 架构变更
- `levels-loader.js` 重写：board 感知加载 + `ensureBoardLoaded()` / `ensureAllBoardsLoaded()` 公共 API
- `_loadedData` / `_fetchPromises` 去重机制，`_rebuildLevels()` 始终按 CIE→EDX→25m 顺序拼接

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/levels-loader.js` | **重写** — board 感知懒加载 + ensureBoardLoaded/ensureAllBoardsLoaded API |
| `js/auth.js` | 3 处插入 ensureBoardLoaded/ensureAllBoardsLoaded 调用 |
| `js/homework.js` | 2 处加 ensureAllBoardsLoaded 守卫 |
| `js/export.js` | exportProgress 改 async + ensureAllBoardsLoaded |
| `js/app.js` | 深链改 slug 匹配 + iOS recovery 改 slug |
| `js/quiz.js` | share 保存 slug 替代 index |
| `js/config.js` | APP_VERSION → v1.3.3 |
| `js/app.bundle.min.js` | 重新生成 |

## [1.3.2] - 2026-03-05 — esbuild Minify + 首屏优化

### 性能优化
- **JS 单文件 bundle**：17 个核心 JS 合并为 `app.bundle.min.js`（esbuild minify），gzip 字典效率大幅提升
- **CSS minify**：`style.css` → `style.min.css`（esbuild minify）
- 单文件 bundle 减少 HTTP 请求数（17 → 1），提升首屏加载速度

### 构建系统
- `package.json` 新建，esbuild devDependency
- `scripts/minify.sh` 一键构建脚本（拼接 → minify → 输出 gzip 大小）
- `npm run build` 标准构建命令，`npm run dev` 本地开发服务器

### 架构变更
- `index.html`：17 个 `<script>` → 单个 `app.bundle.min.js`；`style.css` → `style.min.css`
- `build-single.py`：遇到 `app.bundle.min.js` 自动展开为 17 个源文件内联（保持离线版可调试 + levels.js sync shim）
- admin.js / vocab-admin.js 动态加载路径不变（教师专用，不影响首屏）

### 文件变更
| 文件 | 变更 |
|------|------|
| `package.json` | **新建** — esbuild devDependency + build/dev scripts |
| `scripts/minify.sh` | **新建** — 一键 minify 脚本 |
| `js/app.bundle.min.js` | **新建** — 17 JS 合并 minified |
| `css/style.min.css` | **新建** — CSS minified |
| `index.html` | 17 script → 1 bundle; style.css → style.min.css |
| `scripts/build-single.py` | 适配 bundle 展开逻辑 |
| `js/config.js` | APP_VERSION → v1.3.2 |
| `CLAUDE.md` | 工作流新增 build 步骤 + Conventions 更新 |

## [1.3.1] - 2026-03-05 — 数据层优化（levels 拆分 + 角色按需加载）

### 性能优化
- **levels.js 拆分**：274KB 单文件 → 3 个 JSON 并行加载（CIE 45KB + EDX 35KB + 25m 184KB），索引完全兼容
- **角色按需加载**：学生不加载 admin.js + vocab-admin.js（省 55KB），教师登录后动态注入
- **降级回退**：JSON 加载失败自动降级加载原 levels.js

### 架构变更
- `isTeacherUser` / `isTeacher()` / `callEdgeFunction()` 从 admin.js 迁移至 config.js（解除循环依赖）
- `loadAndInitTeacher()` 新增于 auth.js（快速角色检查 → 动态加载 admin 模块）
- `onLevelsReady()` 回调机制确保 initApp 等待数据就绪
- `vocabAdminBtns` / `vocabAdminAddBtn` / `renderAdmin` 加 typeof 守卫（兼容未加载状态）
- `build-single.py` 适配：离线构建仍内联全部 JS + 同步 shim

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/split-levels.js` | **新建** — Node 脚本，levels.js → 3 JSON |
| `data/levels-cie.json` | **新建** — CIE 50 levels (45KB) |
| `data/levels-edx.json` | **新建** — Edexcel 41 levels (35KB) |
| `data/levels-25m.json` | **新建** — 25m 173 levels (184KB) |
| `js/levels-loader.js` | **新建** — 异步并行加载器 + 降级回退 |
| `js/config.js` | 添加 isTeacherUser/isTeacher/callEdgeFunction + v1.3.1 |
| `js/admin.js` | 移除 3 个已迁移项 |
| `js/auth.js` | 新增 loadAndInitTeacher() 替代 initTeacher() |
| `js/app.js` | initApp 包裹 onLevelsReady() |
| `js/mastery.js` | vocabAdminBtns/vocabAdminAddBtn 加 typeof 守卫 |
| `js/ui.js` | renderAdmin 加 typeof 守卫 |
| `index.html` | levels.js→levels-loader.js; 移除 admin/vocab-admin script 标签 |
| `scripts/build-single.py` | 适配 levels-loader + 重注入 admin 脚本 |

## [1.3.0-docs] - 2026-03-05 — 架构分析文档 + 扩展路线规划

### 文档新增
- **扩展愿景 v1** (`docs/analysis/2026-03-05-expansion-vision.md`) — 四层扩展模型：词汇→概念→练习→评估
- **模块审计** (`docs/analysis/2026-03-05-module-audit.md`) — v1.3.0 全模块一致性审计报告
- **架构评审 v1** (`docs/analysis/2026-03-05-architecture-review.md`) — 五大架构约束 + 可行性初评
- **架构评审 v2** (`docs/analysis/2026-03-05-architecture-review-v2.md`) — 深度技术审计，修正 v1 多项误判：
  - 全局变量 73 个（非 200），分类清晰无冲突
  - `getPairs()` 天然可扩展（`type` 字段是扩展点）
  - levels.js 数据完美分段（CIE/Edx/25m 按行切割）
  - 10/16 Panel 可低成本懒加载
  - 800 道纯文本练习题可直接复用 Quiz UI

### ROADMAP 更新
- 新增 Phase 10A-10E 平台扩展路线（数据优化→练习题→概念卡→智能路径→评估）
- PWA 移至 Phase 11

### 文件变更
| 文件 | 变更 |
|------|------|
| `docs/analysis/` | 新增 4 份分析文档 + README 索引 |
| `ROADMAP.md` | 新增 Phase 10A-10E + Phase 11 |
| `CHANGELOG.md` | 本条目 |

## [1.3.0] - 2026-03-05 — 学习路径进度标记 + 错词即时复习

### 功能变更
- **进度标记**：完成任意模式后，卡组详情页对应按钮右上角显示 ✓ 绿色徽章（6 个模式均支持）
- **错词复习**：Quiz/Spell/Match 结果页有错词时显示"📖 只学错的词"按钮，点击用错词子集启动 Study
  - Quiz/Spell：精确追踪每道错题的词对
  - Match：从当前卡组筛选 `fail > 0` 的词
- **Review 进度标记**：仅卡组入口的 Review 完成后标记 ✓，仪表盘跨卡组复习不标记

### 技术实现
- `localStorage.modeDone` 对象存储 `{ "slug:mode": true }` 格式
- `markModeDone(li, mode)` / `isModeDone(li, mode)` 两个 storage API
- Review 模块新增 `RV.lvl` 字段区分卡组入口 vs 仪表盘入口

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | 新增 `markModeDone()` / `isModeDone()` |
| `js/mastery.js` | renderDeck() mode 按钮添加 ✓ 徽章 |
| `js/study.js` | finishStudy() 调用 markModeDone |
| `js/quiz.js` | Q.wrongPairs 追踪 + `studyWrongQuiz()` + finishQuiz() 错词按钮 + markModeDone |
| `js/spell.js` | SP.wrongPairs 追踪 + `studyWrongSpell()` + finishSpell() 错词按钮 + markModeDone |
| `js/match.js` | `studyWrongMatch()` + finishMatch() 错词按钮 + markModeDone |
| `js/battle.js` | endBattle() won 时调用 markModeDone |
| `js/review.js` | RV.lvl 字段 + startReview/startReviewSession 设置 + finishReview 条件 markModeDone |
| `css/style.css` | `.mode-done` 徽章样式（绝对定位绿色圆形 ✓） |
| `js/config.js` | 版本号 → v1.3.0 |

## [1.2.9] - 2026-03-05 — 学习路径两层布局 + 结果页"下一步"推荐

### 功能变更
- **学习路径布局**：卡组详情页 7 按钮平铺 → 主线三步（📖学习→❓测验→🧠复习）+ 辅助三模式（⌨拼写/🔗配对/⚔实战），路径带箭头引导
- **预览入口**：从模式按钮移到排序栏上方的文字链接（👁 预览全部词汇 →）
- **下一步推荐卡片**：完成模式后推荐下一步操作
  - Study → "下一步：测验检验学习效果"
  - Quiz/Spell → "下一步：复习巩固记忆"
  - Match → "下一步：测验检验效果"
- **Study 结果页重构**：移除 Battle 主按钮，改为 next-step Quiz 卡片 + Study again 按钮
- **三端响应式**：Phone 端主线/辅助按钮缩小适配

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | renderDeck() 模式网格 → 两层布局（mode-path + mode-extra）+ preview 文字链接 |
| `css/style.css` | 替换 mode-grid → mode-path/extra 样式 + next-step 卡片样式 + phone 响应式 |
| `js/ui.js` | 新增 `nextStepHTML()` 辅助函数 |
| `js/study.js` | finishStudy() → next-step Quiz + 重构 action 按钮 |
| `js/quiz.js` | finishQuiz() → 注入 next-step Review |
| `js/spell.js` | finishSpell() → 注入 next-step Review |
| `js/match.js` | finishMatch() → 插入 next-step Quiz |
| `js/config.js` | 版本号 → v1.2.9 |

## [1.2.8] - 2026-03-05 — 优化访客访问体验

### 功能变更
- **欢迎横幅**：GUEST_FULL_ACCESS 时试用横幅 → 绿色注册引导横幅（点击弹出好处列表弹窗）
- **注册引导弹窗**：新增 `showGuestSignupPrompt()`，展示跨设备同步/排行榜/学习历史 3 大好处
- **排行榜只读**：Guest 可查看 Top 10 真实排名 + 底部注册 CTA（替代完全锁定）
- **访客设置**：Guest 可更换课程，昵称/密码/云同步显示"登录后可解锁"
- **登录入口优化**：Guest 侧栏/顶栏退出按钮 → 🔑"登录/注册"
- **回滚**：`GUEST_FULL_ACCESS = false` 时所有分支自动回退原始行为

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | 横幅条件渲染 + `showGuestSignupPrompt()` 新函数 |
| `js/app.js` | `renderBoard()` Guest 分支 → 只读 Top 10 + 注册 CTA |
| `js/auth.js` | `showSettings()` Guest 有限设置分支（课程可换 + 锁定提示） |
| `js/ui.js` | `updateSidebar()` + `showApp()` Guest 登录入口 |
| `css/style.css` | `.guest-welcome` 绿色渐变横幅 + `.sf-login-cta` 强调样式 |
| `js/config.js` | 版本号 → v1.2.8 |

## [1.2.7] - 2026-03-05 — 访客开放哈罗海口全部词汇

### 功能变更 (config.js / auth.js)
- **GUEST_FULL_ACCESS 开关**：新增全局开关（`true`），Guest 访客可访问 25m board 全部词汇
- **GUEST_FREE_LIMIT 动态化**：开关开启时 `Infinity`，关闭时恢复 `3`
- **isLevelVisible() 放行**：Guest + 开关开启时不再隐藏 25m 级别
- **getVisibleBoards() 放行**：Guest + 开关开启时包含 25m board
- **getPublicBoardOptions() 放行**：开关开启时返回全部选课选项（含 25m-y7~y11）
- **Guest skip handler 放行**：开关开启时允许恢复 `25m-*` userBoard
- **回滚方式**：`GUEST_FULL_ACCESS = true` → `false`，5 处逻辑自动恢复

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | +`GUEST_FULL_ACCESS` 开关；`GUEST_FREE_LIMIT` 动态化；`isLevelVisible` / `getVisibleBoards` / `getPublicBoardOptions` 放行 Guest 25m |
| `js/auth.js` | Guest skip handler 允许恢复 25m board |

## [1.2.6] - 2026-03-05 — 排行榜积分与排名说明 Modal

### 新功能 (app.js)
- **积分说明按钮**：排行榜标题旁新增 ❓ 帮助按钮（复用 `btn-help` 样式）
- **积分说明 Modal**：点击弹出 4 段说明内容
  - ⭐ 星级评定：0-4 星机制 + 正确率封顶规则
  - 📊 积分计算：学习进度 / 排行榜积分 / 精通率公式
  - 🏅 段位门槛：遍历 RANKS 数组，当前段位高亮
  - 💡 小贴士：提升积分的实用建议
- **双语支持**：全文 `t(en, zh)` 双语
- **Guest 隔离**：Guest 锁定页面不显示帮助按钮

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/app.js` | line 110/191 标题添加 ❓ 按钮；line 259 新增 `showScoreGuide()` 函数（~50 行） |

## [1.2.5] - 2026-03-05 — 分享成就图片加入用户名

### 功能优化 (quiz.js)
- **用户名显示**：分享成就卡片底部（URL 下方）居中显示用户名，增强个人辨识度
- **字体风格**：22px 加粗 Bricolage Grotesque，与整体品牌一致
- **多场景适配**：昵称用户显示昵称，无昵称显示邮箱前缀，Guest 显示 "Guest"/"访客"

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/quiz.js` | `drawShareCard()` 末尾新增 4 行用户名绘制代码（div2Y + 96 位置） |

## [1.2.4] - 2026-03-05 — 班级列表按年级分组 + 默认折叠

### 功能优化 (admin.js)
- **按年级分组**：Classes Tab 班级卡片从扁平网格改为按年级（Year 7 → Year 11）分组显示
- **默认折叠**：每个年级分组默认折叠，点击 header 展开/收起，复用 mastery.js 折叠模式
- **分组 header**：显示年级名称 + 班级数 + 学生总数统计
- **空年级隐藏**：无班级的年级不显示分组

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/admin.js` | 新增 `_gradeListCollapsed` 状态 + `toggleGradeList()` 函数 + 重写 `renderClassList()` 按年级分组 |
| `css/style.css` | 新增 `.grade-list-section` 折叠样式（header / chevron / body / meta） |

## [1.2.3] - 2026-03-05 — 修复班级编辑保存后数据未实际更新

### Bug 修复 (admin.js + Supabase RPC)
- **根因**：`doEditClass()` 使用 `.update().eq()` 直接操作，Supabase JS v2 不带 `.select()` 时无论更新 0 行还是 1 行均返回 `{ data: null, error: null }`；若 RLS UPDATE USING 条件不匹配，更新静默失败但前端认为成功
- **修复**：新建 `update_class` SECURITY DEFINER RPC，验证教师身份 + 同校归属后直接执行 UPDATE，与 `create_assignment` 模式一致
- **效果**：编辑班级名称/年级后数据立即生效，年级概览/全校概览同步显示新数据

### 文件变更
| 文件 | 变更 |
|------|------|
| `supabase/migrations/20260305930000_update_class_rpc.sql` | 新建：`update_class` RPC 函数（SECURITY DEFINER） |
| `js/admin.js` | `doEditClass()` 改用 `sb.rpc('update_class', {...})` 替代直接 `.update()` |

## [1.2.2] - 2026-03-05 — 学生错词保存为自定义学习卡组

### 功能新增 (homework.js)
- **错词保存按钮**：作业结果页错词区新增「保存为学习卡组」按钮（≥2 错词时显示）
- **一键创建卡组**：点击按钮将错词转为自定义词卡组，即时加入 LEVELS 数组
- **持久化存储**：通过 `saveCustomLevel()` 存入 localStorage + syncToCloud 云端同步
- **防重复保存**：保存后按钮变灰显示「已保存 ✓」，`_pendingWrongWords` 置空

### 数据流
```
finishHwTest() → 暂存错词到 _pendingWrongWords
             → 渲染「保存为学习卡组」按钮
用户点击 → saveWrongWordsAsDeck()
         → 构建 vocabulary → LEVELS.push() + saveCustomLevel()
学生回首页 → 看到新卡组 → 可进入 Study/Quiz/Spell/Match/Battle/Review
```

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | +44 行：`_pendingWrongWords` 全局变量 + `finishHwTest` 按钮注入 + `saveWrongWordsAsDeck()` 新函数 |

## [1.2.1] - 2026-03-05 — 创建作业支持自定义词汇输入

### 功能新增 (homework.js)
- **模式切换 Tab**：创建作业弹窗新增「选择词组」/「自定义词汇」双 Tab 切换
- **逐条输入**：自定义词汇模式提供 word + definition 双输入行，初始 3 行，最多 20 行，支持单行删除
- **批量粘贴**：textarea 粘贴 `word - definition` 格式文本，点击「解析」自动填入逐条列表
- **验证规则**：至少 2 词、最多 20 词、空行自动跳过、超限截断提示
- **RPC 调用**：自定义模式传 `p_custom_vocabulary` JSONB（`[{id, type, content}]`），deck 模式不受影响

### 辅助函数
- `hwSwitchTab(mode)` — Tab 高亮切换 + 区域显示/隐藏
- `hwAddRow()` — 追加双 input 行（含 ✕ 删除按钮）
- `hwParseBatch()` — 按 ` - ` / ` – ` / ` — ` / `\t` 分割每行，填入逐条列表

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | +110 行：3 辅助函数 + showCreateHwModal Tab UI + doCreateHw 双模式分支 |

## [1.2.0] - 2026-03-05 — 星级计分系统重构：统一模式计分 + 双指标（学习进度 + 精通率）

### 核心引擎 (storage.js)
- **computeStars(ok, fail)**：纯函数，根据正确/错误次数计算 0-4 星（含 accuracy 阶梯封顶：<50%→2★, <60%→3★, ≥60%→4★）
- **recordAnswer(key, mode, isCorrect)**：统一计分入口，替代 setWordStatus 作为所有模式的公共接口
  - Study Easy：首次 ok=1（防刷），之后不变
  - Study Okay：仅记录翻卡，不计分
  - Study Hard：fail+1
  - Spell：正确 ok+2（拼写双倍奖励），错误 fail+1
  - Quiz/Daily/Review/Match/Battle：正确 ok+1，错误 fail+1
  - Review 模式保留特殊 SRS interval 逻辑（iv×2.5 / iv×1.2）
- **getAllWords()**：新增 `stars` 字段，status 由 stars 派生（零迁移：旧数据实时计算）
- **_doSyncToCloud()**：score = learningPct × 20（基于星级加权），mastery_pct = masteryPct（4★占比）

### 模式调用替换
- study.js：3 处 setWordStatus → recordAnswer（study-easy / study-okay / study-hard）
- quiz.js：4 处替换（quiz 正确/错误 + daily 正确/错误）
- spell.js：2 处替换（spell 正确/错误）
- match.js：1 处替换 + 新增 mismatch 时对两个选中词记录 fail
- review.js：3 处替换（review easy/ok/hard）

### UI 更新 (mastery.js + CSS)
- **getGlobalStats()**：返回 { total, mastered, learningPct, masteryPct }，getMasteryPct() 保留为兼容 wrapper
- **getDeckStats()**：双指标（learningPct 星级加权 + masteryPct 4★占比 + started 已学词数）
- **首页统计卡片**：Total / 学习进度% / 精通率% / Streak（替代原 Total / Mastered / Due / Streak）
- **卡组行**：词数显示改为 started/total（如 6/10），进度条使用 learningPct
- **卡组详情**：每词旁显示 4 圆点星级指示器（filled = 金色）
- **段位计算**：基于 masteryPct（精通率），确保段位反映真实掌握水平
- **排行榜**：score 改为 learningPct × 20，mastery_pct 独立字段

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/storage.js` | 新增 computeStars + recordAnswer + SRS_INTERVALS，更新 getAllWords + _doSyncToCloud |
| `js/study.js` | 3 处 setWordStatus → recordAnswer |
| `js/quiz.js` | 4 处 setWordStatus → recordAnswer |
| `js/spell.js` | 2 处 setWordStatus → recordAnswer |
| `js/match.js` | 1 处替换 + 新增 mismatch fail 记录 |
| `js/review.js` | 3 处 setWordStatus → recordAnswer |
| `js/mastery.js` | getGlobalStats + getDeckStats 双指标 + renderDeckRow/Home/Deck 星级 UI |
| `css/style.css` | .word-stars / .star-dot 星级指示样式 |
| `js/config.js` | APP_VERSION v1.2.0 |

## [1.1.10] - 2026-03-05 — 25m 卡组前缀改为 Y{n}.{unitNum} 编号 + 年级中文名修正

### UX 增强
- **卡组前缀**：25m 板块 deck-row 前缀从年级 emoji（⓻⓼⓽⓾⓫）改为 `Y7.1` 格式编号标签，同时标识年级和单元编号
  - 例：`⓻ Multiplication of Fractions (1)` → `Y7.1 · Multiplication of Fractions (1)`
  - 详情页标题同步更新为 `Y7.1 · lvTitle(lv)` 格式
  - CIE / Edexcel 板块不受影响，保持原有 emoji 前缀
- **年级中文名修正**：英制 Year 对应中国年级下调一级（Y7→六年级、Y8→七年级、Y9→八年级、Y10→九年级、Y11→十年级）
- **APP_VERSION**：`v1.1.9` → `v1.1.10`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/mastery.js` | `renderDeckRow()` 25m 前缀改为 `deck-row-tag`；`renderDeck()` 详情页标题同步 |
| `css/style.css` | 新增 `.deck-row-tag` 样式（mono 字体、primary 色、固定宽度） |
| `js/config.js` | 版本号 v1.1.10 |

## [1.1.9] - 2026-03-05 — Y7-Y11 词卡按单元分组（二级折叠）

### UX 增强
- **单元分组**：25m 板块（Y7-Y11）在年级和卡组之间新增"单元"分组层，默认折叠，点击展开显示该单元下的卡组
  - 结构：Board → Year Category → Unit（折叠）→ deck-row
  - 年级标题显示单元数（如 "11 units"）而非组数
  - 搜索时 Unit 自动展开（与 Category 展开逻辑一致）
  - CIE / Edexcel 板块不受影响，保持原有扁平渲染
- **数据层**：每个 25m level 新增 `unitNum` / `unitTitle` / `unitTitleZh` 字段
- **APP_VERSION**：`v1.1.8` → `v1.1.9`

### 文件变更
| 文件 | 变更 |
|------|------|
| `scripts/gen-25m-levels.py` | `format_level()` 输出 unitNum / unitTitle / unitTitleZh |
| `js/levels.js` | 重新生成，173 个 25m level 含新字段 |
| `js/mastery.js` | `unitCollapsed` 状态 + `toggleUnit()` + `renderDeckRow()` 提取 + 分组渲染 |
| `css/style.css` | `.unit-section` / `.unit-header` / `.unit-body` 样式 + 折叠动画 |
| `js/config.js` | 版本号 v1.1.9 |

## [1.1.8] - 2026-03-05 — Y7-Y11 词卡按课纲教学顺序重排

### 内容修正
- **教学顺序重排**：Y7-Y11 共 55 个单元从字母排序改为课纲教学顺序（如 Y7 从 Circle 开头 → Multiplication of Fractions 开头）
  - 源 JSON 按 `unit_id` 编号重排，保留 .docx 课纲原始单元顺序
  - `gen-25m-levels.py` 新增 `src_order` 字段，排序 key 从 `slug`（字母序）改为 `src_order`（教学序）
  - 173 个 level、1502 个词汇总数不变
- **APP_VERSION**：`v1.1.7` → `v1.1.8`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/levels.js` | 25m 部分 173 级按教学顺序重排 |
| `js/config.js` | 版本号 v1.1.8 |
| `scripts/gen-25m-levels.py` | `src_order` 字段 + 排序 key 修改 |
| `y7-y11-unit-vocabulary.json` (Dashboard) | units 数组按教学顺序重排 |

## [1.1.7] - 2026-03-05 — 记住用户语言偏好

### UX 增强
- **语言偏好持久化**：用户切换语言后刷新页面不再重置为英文，偏好保存在 localStorage（`wmatch_lang`）
  - `appLang` 初始化从 localStorage 读取，仅接受 `'bilingual'`，其他值回退 `'en'`
  - `toggleLang()`（应用内）和 `toggleAuthLang()`（登录页）切换后写入 localStorage
  - `initApp()` 开头调用 `updateAuthLang()` 确保登录页 DOM 立即应用已保存的语言
- **APP_VERSION**：`v1.1.6` → `v1.1.7`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | `appLang` 从 localStorage 初始化 + 版本号 |
| `js/ui.js` | `toggleLang()` 写 localStorage |
| `js/auth.js` | `toggleAuthLang()` 写 localStorage |
| `js/app.js` | `initApp()` 调用 `updateAuthLang()` 应用已保存语言 |

## [1.1.6] - 2026-03-05 — 修复刷新页面闪现登录页

### UX 修复
- **登录页闪现消除**：登录成功后 30 分钟内刷新页面，不再闪现登录页面，直接进入应用
  - `<head>` 内联脚本检查 `wmatch_login_ts` 时间戳，30 分钟内注入 CSS 隐藏 auth overlay
  - `afterLogin()` 写入时间戳，`doLogout()` 清除时间戳
  - `initApp()` session 恢复成功刷新时间戳，失败时清除时间戳并移除注入样式
- **APP_VERSION**：`v1.1.5` → `v1.1.6`

### 文件变更
| 文件 | 变更 |
|------|------|
| `index.html` | `<head>` 新增内联脚本检查登录时间戳 |
| `js/auth.js` | `afterLogin()` 写时间戳 + `doLogout()` 清时间戳 |
| `js/app.js` | session 成功刷新时间戳 + 失败清除时间戳并移除样式 |
| `js/config.js` | 版本号 |

## [1.1.5] - 2026-03-05 — 考试局/课程显示顺序调整

### UI 调整
- **BOARDS 数组顺序调整**：`[cie, edx, 25m]` → `[25m, cie, edx]`，首页和侧栏板块显示顺序变为：哈罗海口 → 剑桥CIE → 爱德思Edexcel
  - js/config.js ×1（BOARDS 数组元素顺序）
- **APP_VERSION**：`v1.1.4` → `v1.1.5`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | BOARDS 数组顺序 + 版本号 |

## [1.1.4] - 2026-03-05 — 全面加固：残余 XSS + onclick 注入 + 错误处理 + syncToCloud 节流 + 可访问性 + 代码清理

### 安全修复
- **残余 XSS 清除（22 处）**：study/review/mastery/match/export 词汇渲染、app.js 排行榜班级名、homework.js 作业标题/错误消息、admin.js 学校名、vocab-admin.js 反馈错误消息全量 `escapeHtml()` 转义
  - study.js ×3, review.js ×5, mastery.js ×4, match.js ×2, export.js ×2, app.js ×1, homework.js ×2, admin.js ×1, vocab-admin.js ×1
- **onclick 注入修复（4 处）**：`safeName`/`safeCName` onclick 字符串插值增加 `.replace(/\\/g, '\\\\')`，防止反斜杠逃逸注入
  - admin.js ×2 (safeCName, safeName), homework.js ×1 (safeName), spell.js ×1 (speakWord onclick)

### 健壮性
- **异步错误处理（8 个函数 try/catch）**：renderClassList / loadActivityData / doCreateClass / doBatchCreate / doResetPassword / saveSettings / updateFeedbackStatus / saveFeedbackNotes
  - admin.js ×5, auth.js ×1, vocab-admin.js ×2

### 性能优化
- **syncToCloud 节流**：新增 `debouncedSync()`（2s trailing debounce），`setWordStatus()` 改用 debouncedSync 代替直接 syncToCloud，减少学习期间网络请求

### 可访问性
- **`<html lang="en">`**：默认语言从 `zh-CN` 改为 `en`
- **Toast ARIA**：`#toast-el` 添加 `role="alert" aria-live="polite"`
- **用户菜单 ARIA**：sf-trigger 添加 `aria-expanded="false" aria-haspopup="menu"`，sf-menu 添加 `role="menu"`，6 个 sf-menu-item 添加 `role="menuitem"`
- **toggleUserMenu**：切换时动态更新 `aria-expanded`
- **Header 按钮 aria-label**：5 个 btn-icon 添加 `aria-label`
- **Auth 表单 aria-label**：4 个登录输入 + 4 个教师注册输入添加 `aria-label`

### 代码清理
- **移除死代码**：mastery.js `sidebarCIEOpen`/`toggleCIESidebar`、`browseIdx`/`browsePairs`；ui.js `setLang()`
- **APP_VERSION 常量**：config.js 新增 `var APP_VERSION = 'v1.1.4'`
- **版本号统一**：ui.js showBugReport 两处硬编码版本号改用 `APP_VERSION`
- **缓存清理**：storage.js `invalidateCache()` 增加 `_quizCache` 清理

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | +APP_VERSION 常量 |
| `js/study.js` | escapeHtml×3 |
| `js/review.js` | escapeHtml×5 |
| `js/mastery.js` | escapeHtml×4, 移除死代码×4 |
| `js/match.js` | escapeHtml×2 |
| `js/export.js` | escapeHtml×2 |
| `js/app.js` | escapeHtml×1 |
| `js/spell.js` | onclick 反斜杠转义 |
| `js/admin.js` | escapeHtml×1, 反斜杠×2, try/catch×5 |
| `js/homework.js` | escapeHtml×2, 反斜杠×1 |
| `js/vocab-admin.js` | escapeHtml×1, try/catch×2 |
| `js/auth.js` | try/catch×1 |
| `js/storage.js` | debouncedSync, _quizCache 清理 |
| `js/ui.js` | 移除 setLang, APP_VERSION×2, aria-expanded |
| `index.html` | lang="en", toast ARIA, menu ARIA, aria-label×13 |

## [1.1.3] - 2026-03-05 — 深度加固：残余 XSS + 错误处理 + 批量通知 + 可访问性 + 品牌更名

### 安全修复
- **学习模式 XSS 清除**：quiz/spell/battle/homework 测试界面中 14 处词汇数据（questionText / opt / prompt / p.def / item.content / t_.title）统一 `escapeHtml()` 转义
  - homework.js ×3, quiz.js ×4, spell.js ×1, battle.js ×1
- **教师面板 XSS 清除**：renderClassList / expandGrade 班级名称、renderSchoolOverview Top10 学生名+班级名 `escapeHtml()` 转义
  - admin.js ×4
- **侧栏用户菜单 XSS**：updateSidebar `menuHeader.innerHTML` 中 currentUser.email 逐行 `escapeHtml()` 转义
  - ui.js ×1

### 健壮性
- **callEdgeFunction try/catch**：包装整个函数体，网络异常/JSON 解析异常返回 `{ error: message }`，避免未捕获异常冒泡
- **通知批量 INSERT**：`doCreateHw()` 从 for 循环逐个 `await sendNotification` 改为 `sb.from('notifications').insert([...])` 单次批量插入

### 可访问性
- **focus-visible 补全**：新增 quiz-opt / match-item / sort-btn / mode-btn / search-input / admin-tab / board-sub-pill / sf-trigger / sf-menu-item 焦点轮廓
- **prefers-reduced-motion**：全局 `@media (prefers-reduced-motion: reduce)` 规则，禁用动画/过渡
- **Modal ARIA**：`#modal-overlay` 添加 `role="dialog" aria-modal="true"`，`showModal()` 自动设置 `aria-labelledby` 指向首个 `.section-title`
- **Canvas aria-hidden**：`<canvas id="fx">` 添加 `aria-hidden="true"`

### 品牌更名
- **BOARD_OPTIONS**：`'AISL Harrow Haikou Year N'` → `'Harrow Haikou Year N'`（简洁形式）
- **BOARDS**：`name: 'AISL Harrow Haikou'` → `name: 'Harrow Haikou Upper School Mathematics Curriculum'`，`nameZh: '哈罗海口'` → `nameZh: '哈罗海口高年级数学课程'`

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | escapeHtml×3, 通知批量 INSERT |
| `js/admin.js` | escapeHtml×4, callEdgeFunction try/catch |
| `js/ui.js` | escapeHtml×1, showModal ARIA labelledby |
| `js/spell.js` | escapeHtml×1 |
| `js/quiz.js` | escapeHtml×4 |
| `js/battle.js` | escapeHtml×1 |
| `css/style.css` | focus-visible×3 规则, prefers-reduced-motion |
| `index.html` | Modal role/aria-modal, canvas aria-hidden |
| `js/config.js` | 品牌更名 AISL → Harrow Haikou Upper School |

## [1.1.2] - 2026-03-05 — 残余 XSS + N+1 查询 + 健壮性 + 可访问性

### 安全修复
- **残余 XSS 全量清除**：14 处 innerHTML 中用户数据（hw.title / student_name / word / def / description / user_email / row.name）统一 `escapeHtml()` 转义
  - homework.js ×8, admin.js ×3, vocab-admin.js ×2, app.js ×1

### 性能优化
- **N+1 查询消除**：`renderClassHwList()` 从 N 次逐条 `assignment_results` 查询改为 1 次 `.in()` 批量查询 + 内存分组
- **串行→并行**：`cascadeGradeUpdate()` 学生 metadata 更新从 for 循环串行改为 `Promise.all` 并行

### 健壮性
- **try/catch 补全**：`markNotifRead()` / `markAllNotifsRead()` 添加 try/catch，避免 DB 错误冒泡

### 可访问性
- **键盘焦点指示器**：所有交互元素（btn / input / textarea / nav / hw-option）添加 `focus-visible` 轮廓

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/homework.js` | escapeHtml×8, N+1 批量查询, try/catch×2 |
| `js/admin.js` | escapeHtml×3, Promise.all 并行化 |
| `js/vocab-admin.js` | escapeHtml×2 |
| `js/app.js` | escapeHtml×1 |
| `css/style.css` | focus-visible 键盘焦点指示器 4 条规则 |

## [1.1.1] - 2026-03-05 — 项目健康修复（XSS/竞态/深色模式/RLS/响应式）

### 安全修复
- **XSS 防护**：新增 `escapeHtml()` helper，通知标题/内容、反馈详情用户输入、错词作业 checkbox 数据全量转义
- **inline JSON 注入**：showStudentHwDetail 错词作业按钮改用全局缓存 `_pendingCustomHwData`，避免 onclick 内嵌 JSON
- **RLS 增强**：assignments INSERT 加班级归属检查，新增 UPDATE 策略

### Bug 修复
- **异步 sendNotification**：3 处漏掉的 `await` 补全（doCreateHw / doCreateCustomHw / finishHwTest）
- **showFeedbackDetail 异步**：改为 `async/await` + try/catch 错误处理（原 `.then()` 无错误处理）
- **finishHwTest 竞态**：`.single()` 改 `.maybeSingle()` + `upsert` on conflict，消除并发重复记录
- **软删除作业**：deleteHw 改 `.update({ is_deleted: true })`，保留学生成绩记录
- **自定义词汇校验**：添加最多 10 词上限校验

### UI 增强
- **学生作业导航**：侧栏 + 底栏新增📝作业入口（已登录非教师学生可见）
- **深色模式补全**：通知未读、作业正错、横幅、反馈列表、词库编辑输入框、作业卡片 8 条规则
- **硬编码颜色修复**：`.hw-option.correct/wrong` 改 rgba（原 `#22C55E15` 无效 8 位 hex）
- **手机端响应式**：通知/反馈/横幅/词库表格/进度网格/学生行 8 条移动端适配规则

### Supabase 迁移
- `20260305200000_health_fixes.sql`：RLS 策略增强 + 6 个缺失索引 + `is_deleted` 软删除列

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | +`escapeHtml()` helper, navTo homework 路由, showApp 作业导航显示 |
| `js/homework.js` | XSS 转义×3, +await×3, upsert 竞态修复, 软删除×3, 词汇校验, _pendingCustomHwData 缓存 |
| `js/vocab-admin.js` | showFeedbackDetail 改 async/await + escapeHtml×5 |
| `css/style.css` | 深色模式 8 条 + rgba 颜色修复 + 移动端 8 条 |
| `index.html` | 侧栏 + 底栏📝作业导航按钮 |
| `supabase/migrations/20260305200000_health_fixes.sql` | **新建** RLS + 索引 + is_deleted |

## [1.1.0] - 2026-03-05 — 树状词卡 + 超管词库 CRUD + 作业系统 + 站内信 + 反馈 DB

### 新功能
- **树状条形词卡组**：首页词卡组从卡片网格改为条状行显示（`deck-row`），保持树状层级一致性
- **超级管理员词库 CRUD**：超管（zhuxingda86@hotmail.com）可在线编辑/添加/删除词组，同步 Supabase `vocab_levels` 表
- **作业系统（教师端）**：布置作业（选词组 + 截止日期）、查看作业完成率、学生逐人钻取（完成度/正确率/错词/尝试次数）
- **作业系统（学生端）**：待完成/已完成作业分区展示，四选一测试界面，完成后显示正确率 + 学习建议
- **自定义错词作业**：教师从学生错词中创建针对性词组作业（最多 10 词/组），实现个性化学习路径
- **站内信通知**：小铃铛图标 + 红点徽章，教师布置作业/学生完成作业时自动推送通知
- **反馈收集 DB 存储**：已登录用户反馈直接存 Supabase `feedback` 表（替代 mailto），超管面板可查看/管理反馈
- **超管反馈面板**：管理面板新增 Feedback tab，支持状态管理（new/in_progress/done/dismissed）+ 管理员备注

### Supabase 迁移
- `20260305000000_vocab_hw_feedback.sql`：新建 `vocab_levels` / `feedback` 表，扩展 `assignments` / `assignment_results` 表
- `20260305100000_notifications_and_extensions.sql`：新建 `notifications` 表，添加 `wrong_words` / `custom_vocabulary` 列

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/config.js` | +`SUPER_ADMIN_EMAIL` + `isSuperAdmin()` |
| `js/storage.js` | +`loadDbVocabLevels()` + `mergeVocabLevels()` |
| `js/auth.js` | afterLogin() 集成 DB 词库合并 |
| `js/mastery.js` | renderHome() 改为 deck-row + 超管按钮 + 作业横幅 |
| `js/ui.js` | showApp() 通知初始化 + submitBugReport() 改 DB + navTo homework |
| `js/admin.js` | Feedback tab + 班级详情作业区 |
| `js/vocab-admin.js` | **新建** ~300行，词库 CRUD UI + 反馈管理面板 |
| `js/homework.js` | **新建** ~450行，作业全流程 + 通知系统 + 错词追踪 |
| `css/style.css` | deck-row 样式 + 通知样式 + 作业样式 + 反馈样式 + vocab-admin 样式 |
| `index.html` | +bell icon + homework panel + 2 script tags |

## [1.0.9] - 2026-03-05 — 编辑班级 + 单个/批量/导入学生

### 新功能
- **编辑班级信息**：班级详情页标题栏新增 ✏ 编辑按钮，弹窗预填名称/年级，支持修改保存
- **年级级联更新**：修改班级年级时自动更新 leaderboard.board + 每位学生的 auth metadata.board
- **单个添加学生**：添加学生弹窗默认 1 行（原 5 行），新增 `+ 1行` / `+ 5行` 并排按钮
- **CSV 导入学生**：📋 导入按钮 → 折叠 textarea → 粘贴 CSV（支持逗号/Tab/分号分隔）→ 解析填入表格

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/admin.js` | +5 新函数（showEditClassModal, doEditClass, cascadeGradeUpdate, toggleImportArea, parseImportData），2 处修改（renderClassDetail header + showBatchCreateModal） |

## [1.0.8] - 2026-03-05 — 桌面侧栏常驻展开 + 登录弹窗溢出修复

### 修复
- **桌面端侧栏常驻展开**：移除 click-outside 收缩逻辑（仅桌面），侧栏始终保持 260px 展开
- **登录页教师注册弹窗溢出**：`.auth-card` 添加 `max-height: 90vh; overflow-y: auto`，教师注册表单展开后可滚动

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | click-outside collapse 守卫 `appBP === 'desktop'` |
| `css/style.css` | `.auth-card` 加 max-height + overflow-y |

## [1.0.7] - 2026-03-04 — 教师账号隐藏段位 + 侧栏默认展开

### 教师账号段位隐藏
- **侧栏/顶栏**：教师显示 🏫 替代段位 emoji，顶栏移除 onclick 段位路线弹窗
- **弹出菜单**：教师显示"教师账号"替代"段位名 · 掌握率%"
- **首页 rank hint**：教师显示静态"🏫 教师账号"行（不可点击）
- **段位路线弹窗**：教师调用 `showRankGuide()` 直接 return
- **排行榜**：教师跳过 leaderboard upsert，不出现在排行榜中
- **教师初始化**：`initTeacher()` 确认身份后立即刷新 sidebar + home

### 侧栏默认展开
- 桌面端 `showApp()` 自动调用 `expandSidebar()`，默认 260px 展开
- 平板/手机端不受影响

### 文件变更
| 文件 | 变更 |
|------|------|
| `js/ui.js` | updateSidebar() 教师条件分支 + showApp() 桌面端自动展开 |
| `js/mastery.js` | renderHome() rank hint 教师静态行 |
| `js/auth.js` | showRankGuide() 教师守卫 |
| `js/storage.js` | _doSyncToCloud() 教师跳过排行榜 upsert |
| `js/app.js` | renderBoard() 教师不加入本地 fallback / hasMe |
| `js/admin.js` | initTeacher() 确认后刷新 UI |

## [1.0.6] - 2026-03-04 — 架构优化 + Bug Report 功能

### 架构优化（Part A — 0 功能变更）
- **loadS() 内存缓存**：`_sCache` 变量消除 95% JSON.parse 调用（renderHome 从 ~70 次降为 0-1 次）
- **getAllWords() / getWordData() 缓存**：`_cacheDirty` 标记，writeS() 时自动失效
- **isGuestLocked() O(1)**：`_guestVisCache` 缓存可见索引，仅在 board/user 变化时重建
- **renderHome() 去重**：顶部一次 getAllWords + getWordData，board 循环内预计算 stats，消除重复 isGuestLocked/getDeckStats 调用
- **公共 helper 提取**：`isGuest()` / `isLoggedIn()` / `getDisplayName()` / `getPublicBoardOptions()` 替代散落 11+ 处的重复模式
- **showRankGuide() 去重**：getAllWords() 2 次 → 1 次
- **setWordStatus() 合并读写**：recordDailyHistory + recordActivity 内联，3 次 loadS+writeS → 1+1
- **命名冲突修复**：`ui.js` 的 `sb` → `sidebarEl`（避免与 Supabase client 冲突），`review.js` 的 `searchTimer` → `_rvSearchTimer`

### 新增（Part B）
- **Bug Report 功能**：侧栏菜单新增 🐛 Report Bug 入口，点击弹出 Modal 表单
  - 选择问题类型（UI / Data / Crash / Feature / Other）
  - 填写描述 + 复现步骤（选填）
  - 自动收集 App 版本、Board、用户类型、浏览器、语言
  - 提交时构造 mailto:support@25maths.com 链接，无需后端
  - 中英文支持，跟随全局 appLang

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/config.js` | 修改 | +isGuestLocked O(1) 缓存 + 4 个公共 helper |
| `js/storage.js` | 修改 | +loadS 内存缓存 + getAllWords/getWordData 缓存 + setWordStatus 合并读写 |
| `js/mastery.js` | 修改 | renderHome 去重（预计算 stats + 复用 wd）|
| `js/auth.js` | 修改 | helper 替换 + showRankGuide 去重 + cache invalidation 调用 |
| `js/app.js` | 修改 | helper 替换（isGuest/isLoggedIn/getDisplayName/getPublicBoardOptions）|
| `js/ui.js` | 修改 | sb→sidebarEl 重命名 + helper 替换 + showBugReport() + submitBugReport() |
| `js/review.js` | 修改 | searchTimer → _rvSearchTimer |
| `js/admin.js` | 修改 | isLoggedIn() 替换 |
| `index.html` | 修改 | sf-menu 加 Bug Report 菜单项 |
| `css/style.css` | 修改 | +bug-select / bug-textarea / bug-auto 样式 |

## [1.0.5] - 2026-03-04 — 访客模式限制 + 25m 内容权限控制 + 年级图标统一

### 新增
- **25m 内容仅限哈罗用户**：只有 `userSchoolId` 存在的用户才能看到 25m board（首页、侧栏、选课、排行榜均过滤）
- **访客只能学习 3 个词组**：其余词组显示但加锁（🔒），点击弹出登录提示 Modal
- **访客排行榜不可用**：显示"仅注册会员可用"提示 + 登录按钮
- **非哈罗注册用户**：排行榜可用但 sub-pills 过滤掉 25m-y* 选项
- **访客试用横幅**：首页显示"免费试用：3 个词组 · 登录解锁全部 X 个词组"引导注册
- **localStorage 残留 25m-y* board 的访客**：自动重置，不会卡在空首页

### 优化
- **年级图标统一为 Negative Circled Numbers**：Y7-Y11 全部改用 ⓻⓼⓽⓾⓫，替代原来混搭的 7️⃣8️⃣9️⃣🔟1️⃣1️⃣，视觉风格一致

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/config.js` | 修改 | +`GUEST_FREE_LIMIT` 常量 + `isLevelVisible` 25m 守卫 + `getVisibleBoards` 25m 过滤 + `isGuestLocked()` 函数 + Y7-Y11 emoji 统一为 ⓻⓼⓽⓾⓫ |
| `js/auth.js` | 修改 | 选课页过滤 25m-y* 选项 + 访客 board 恢复时跳过 25m-* |
| `js/storage.js` | 修改 | `getAllWords` 排除锁定词组 |
| `js/mastery.js` | 修改 | 锁定 UI + `openDeck` 守卫 + `showGuestLockPrompt()` Modal + 试用横幅 + board stats 排除锁定 |
| `js/app.js` | 修改 | 排行榜访客拦截 + 课程 sub-pills 过滤 25m-y* |
| `css/style.css` | 修改 | +31 行（锁定卡片、试用横幅、排行榜锁定提示样式）|

## [1.0.4] - 2026-03-04 — 登录页默认英文 + 语言切换按钮

### 新增
- **登录页语言切换按钮**：右上角 `中文 / EN` 切换按钮，点击即时切换登录界面语言
- **登录页默认英文**：所有文字（标题、按钮、placeholder、错误消息）默认英文显示
- **i18n 全覆盖**：auth overlay 中所有硬编码中文改为 `t(en, zh)` 动态切换
- **translateAuthError 英文模式**：英文模式直接返回 Supabase 原始错误消息
- **语言状态同步**：登录页切换语言后，进入 app 内语言保持一致；app 内切换也同步登录页按钮

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/config.js` | 修改 | 默认语言 `bilingual` → `en` |
| `index.html` | 修改 | auth-card 加 `auth-lang-toggle` 按钮 + 所有文字元素加 `data-en`/`data-zh` + placeholder 改英文 |
| `css/style.css` | 修改 | +10 行（`.auth-card { position: relative }` + `.auth-lang-toggle` 样式 + hover 效果）|
| `js/auth.js` | 修改 | +27 行（`toggleAuthLang()` + `updateAuthLang()` + placeholder 动态切换 + 全部硬编码中文改 `t()` 调用）|
| `js/ui.js` | 修改 | +2 行（`toggleLang` 同步 auth-lang-toggle 按钮 + label 修正 `中文/EN`）|

## [1.0.3] - 2026-03-04 — 学生管理：操作下拉菜单（改名 / 重置密码 / 移动班级）

### 新增
- **操作下拉菜单**：班级详情页 Action 列替换为"操作 ▾"下拉按钮，包含 3 项操作
  - ✏️ 改名：修改学生姓名（同步 class_students + leaderboard + auth user_metadata）
  - 🔑 重置密码：保持原有逻辑，入口移至下拉菜单
  - ↗️ 移动班级：将学生移至同校其他班级（同步 class_students + leaderboard + auth user_metadata）
- **Edge Function `update-student`**：更新学生 auth user_metadata（nickname / class_id / board），含教师身份 + 同校校验

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/admin.js` | 修改 | +142 行（action dropdown HTML + toggleActionMenu + showRenameModal + doRenameStudent + showMoveClassModal + doMoveStudent + 全局 click 关闭）|
| `css/style.css` | 修改 | +22 行（.action-dropdown / .action-menu / .action-item 样式 + 暗色模式适配）|
| `supabase/functions/update-student/index.ts` | 新增 | ~96 行（教师验证 + 同校校验 + user_metadata 更新）|

## [1.0.2] - 2026-03-04 — 排行榜 Sub Pills：维度内选择具体项目

### 新增
- **Sub Pills 选择器**：每个排行榜维度下可选择具体项目
  - 课程 tab → BOARD_OPTIONS 胶囊按钮（8 个课程任意切换）
  - 班级 tab → 从 `classes` 表加载该校所有班级列表（30s 缓存）
  - 年级 tab → GRADE_OPTIONS 胶囊按钮（Y7-Y11）
  - 全校 tab → 无 sub pills，直接展示全校排名
- **智能默认选中**：课程默认选 `userBoard`，班级默认选 `userClassId`，年级默认选当前年级
- **班级 tab 教师+学生均可见**：移除原有 `userClassId` 限制，所有有学校信息的用户都能看到 4 个 tabs
- 切换维度自动重置 sub pill 为默认值

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/app.js` | 修改 | ~130 行（+`_boardSubKey`/`_boardClassList` 状态 + `_loadBoardClasses()` + `switchBoardSub()` + sub pills 渲染）|
| `css/style.css` | 修改 | +21 行（`.board-sub-pills` + `.board-sub-pill` 胶囊按钮样式）|

## [1.0.1] - 2026-03-04 — 排行榜多维度：课程 / 班级 / 年级 / 全校

### 新增
- **排行榜 Scope Tabs**：有学校信息的用户可在 4 个维度切换排行（课程 / 班级 / 年级 / 全校）
  - 课程：原有逻辑，按 `board` 过滤
  - 班级：按 `class_id` 过滤（仅学生可见）
  - 年级：按 `board` + `school_id` 过滤
  - 全校：按 `school_id` 过滤
- Tab 样式复用 `.admin-tabs` / `.admin-tab`，手机端可横滑
- 无学校信息的用户/访客保持原有排行榜逻辑

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `js/config.js` | 修改 | +2 行（`userClassId` / `userSchoolId` 全局变量）|
| `js/auth.js` | 修改 | +4 行（`afterLogin()` 提取 metadata）|
| `js/app.js` | 修改 | ~45 行（session 恢复 + `renderBoard()` 重写 + `switchBoardScope()`）|
| `css/style.css` | 修改 | +3 行（`.board-scope-tabs` 间距）|

## [1.0.0] - 2026-03-04 — 教师管理系统：班级 + 学生账户 + 活跃度仪表盘

### 新增
- **教师注册**：登录页新增"教师注册"入口，通过学校注册码（如 HARROW2026）创建教师账号
- **班级管理**：教师可创建班级（指定年级），查看班级卡片网格（学生数 + 平均掌握率）
- **批量创建学生**：弹窗表格输入邮箱/密码/姓名，一键创建最多 30 个学生账号
- **学生自动选课**：学生登录后自动选中所在年级 board，跳过选课页，仍可在设置中手动切换
- **班级详情**：学生表格（姓名/最后活跃/掌握率进度条/已掌握词数/段位/重置密码）
- **重置学生密码**：教师可为同校学生重置密码
- **年级概览**：按年级分组展示班级数/学生数/活跃学生/平均掌握率
- **全校概览**：汇总卡片（年级/班级/学生/活跃/掌握率）+ 年级汇总表 + Top 10 学生
- **Admin 导航**：侧栏 + 底部导航新增"管理"入口（仅教师可见）

### 数据库
- 4 张新表：`schools`、`teachers`、`classes`、`class_students`
- 1 个视图：`student_activity_view`（教师仪表盘聚合查询）
- `leaderboard` 扩展 `school_id` / `class_id` 列
- RLS 策略：同校教师可查看，学生可查看自己

### Edge Functions（3 个）
- `register-teacher` — 校验注册码 + 创建教师用户
- `create-students` — 批量创建学生账户 + 初始化排行榜
- `reset-student-password` — 教师重置学生密码

### 文件变更
| 文件 | 类型 | 变更 |
|------|------|------|
| `supabase/migrations/20260304_create_admin_tables.sql` | 新增 | ~100 行 |
| `supabase/functions/register-teacher/index.ts` | 新增 | ~80 行 |
| `supabase/functions/create-students/index.ts` | 新增 | ~120 行 |
| `supabase/functions/reset-student-password/index.ts` | 新增 | ~85 行 |
| `js/admin.js` | 新增 | ~450 行 |
| `index.html` | 修改 | +18 行 |
| `css/style.css` | 修改 | +215 行 |
| `js/auth.js` | 修改 | +79 行 |
| `js/config.js` | 修改 | +6 行 |
| `js/storage.js` | 修改 | +12 行 |
| `js/ui.js` | 修改 | +4 行 |

---

## [0.9.9] - 2026-03-04 — 侧栏默认收缩 + 点击展开

### 新增
- **侧栏默认收缩**：桌面端侧栏默认 60px 窄条（仅 logo + 图标 + 头像），腾出更多内容空间
- **点击展开**：点击侧栏任意非头像区域 → 平滑展开至 260px，点击侧栏外 → 平滑收缩
- **导航 tooltip**：收缩态 hover 图标时，右侧弹出面板名称标签
- **弹出菜单方向**：收缩态头像菜单改为从右侧弹出（220px），展开态保持向上弹出
- **内容区联动**：`margin-left` 跟随侧栏宽度平滑过渡
- **移动端无影响**：`<1080px` 侧栏仍为 `display: none`

### 文件变更
- `css/style.css` — 新增 `--sidebar-w-col` 变量 + `.sidebar.expanded` + 收缩态隐藏/居中/tooltip/菜单方向规则（+69 行）
- `js/ui.js` — 新增 `expandSidebar()` / `collapseSidebar()` + 侧栏点击展开 + 外部点击收缩监听（+37 行）

---

## [0.9.8] - 2026-03-04 — 侧栏底部改为 Claude 风格弹出菜单

### 重构
- **侧栏底部弹出菜单**：替换平铺的用户信息 + 5 个按钮为紧凑触发器（头像 + 用户名），点击弹出浮层菜单
- **菜单内容**：邮箱 + 段位信息 header → 设置/深色/音效/语言 4 项 → 同步状态 → 退出登录
- **外部点击关闭**：点击菜单外部自动收起
- **深色模式适配**：菜单背景 + 阴影 + hover 色跟随主题

### 设计决策
- 交互模式参考 Claude 网页端侧栏底部：用户名入口 + 向上弹出菜单
- 保留所有原有 ID（`sb-rank`/`sb-name`/`dark-toggle-sb` 等），最小化 JS 改动
- `applyDark()` / `updateSoundBtn()` 改为仅更新 `.sf-icon` span，避免覆盖菜单项结构

### 文件变更
- `index.html` — 替换 sidebar-footer HTML（~30 行新结构替换 ~16 行旧结构）
- `css/style.css` — 替换 sidebar-footer 样式 + 新增弹出菜单样式（~65 行替换 ~15 行）
- `js/ui.js` — 新增 `toggleUserMenu()` + 外部点击关闭 + 修改 `updateSidebar()`/`applyDark()`/`updateSoundBtn()`

---

## [0.9.7] - 2026-03-04 — 三项性能与体验优化

### 新增
- **底部导航 5 项适配**：Phone 断点（<640px）下仅显示 icon，隐藏文字标签，padding 紧凑化
- **滚动自动隐藏底栏**：向下滚动 >10px 底部导航隐藏（`translateY(100%)`），向上滚动恢复
- **左右滑动切换面板**：水平滑动 >50px 在 5 个主面板（首页/复习/导入/排行/统计）间切换
- **Quiz 干扰项缓存**：新增 `getQuizCache()` 预建去重词库，替换 4 处遍历全部 264 级的循环，每道题从 O(2640) 降为 O(n) filter
- **同步状态指示器**：全局 `_syncStatus` 跟踪同步状态（idle/syncing/ok/error），侧栏底部实时显示 ✓已同步 / ↻同步中 / ⚠离线
- **同步失败自动重试**：指数退避重试（2s/5s/10s），静默重试不弹 Toast
- **设置 Modal 同步区域**：显示"上次同步: x 分钟前" + 手动同步按钮
- **深色模式适配**：同步状态颜色跟随主题变量

### 设计决策
- **缓存策略**：`_quizCache` 首次调用时构建，会话内复用，无需失效（词库为静态数据）
- **滑动手势**：仅在水平位移 > 垂直位移时触发，避免与纵向滚动冲突
- **重试逻辑**：3 次指数退避后停止，避免无限重试；`manualSync()` 重置重试计数器

### 文件变更
- `css/style.css` — Phone icon-only + `.nav-hidden` transition + `.sync-status` 样式（~20 行）
- `js/ui.js` — 滚动/滑动监听 + 同步状态侧栏渲染（~57 行）
- `js/quiz.js` — `_quizCache` + `getQuizCache()` + 替换 4 处循环（+15 行, −45 行）
- `js/storage.js` — `_syncStatus` + `_lastSyncOkAt` + `_doSyncToCloud()` + 重试逻辑（~25 行重构）
- `js/auth.js` — `showSettings()` 同步区域 + `manualSync()` 函数（~27 行）

---

## [0.9.6a] - 2026-03-04 — 补齐 Battle + Study 分享按钮

### 新增
- **实战模式分享**：Battle 结果 Modal 新增绿色"📤 分享"按钮，分享卡片包含配对数/用时/最大连击
- **学习模式分享**：Study 结果页新增"📤 分享"按钮，分享卡片显示掌握数/总数

### 文件变更
- `js/battle.js` — `endBattle()` 设置 `_lastShareOpts` + 插入分享按钮（~3 行）
- `js/study.js` — `finishStudy()` 设置 `_lastShareOpts` + 插入分享按钮（~3 行）

---

## [0.9.6] - 2026-03-04 — 学习数据可视化 (Learning Analytics)

### 新增
- **学习数据面板**：新增 📊 Stats 导航入口（侧栏 + 底部导航），独立统计面板
- **汇总统计卡片**：总练习次数、正确率、活跃天数、连续天数（Streak）四项核心指标
- **GitHub 风格日历热力图**：近 90 天活动记录，紫色深浅四分位分级（0-4 级），显示每日练习量
- **每日活动趋势柱状图**：近 30 天柱状图，紫色渐变，每 7 天标注日期刻度
- **历史数据层**：`s.history[]` 每日汇总数组（date/activities/correct/fail/mastered），自动增量记录
- **Bootstrap 历史数据**：首次打开统计页自动从 `lr` 时间戳重建历史记录
- **深色模式适配**：热力图在深色模式下使用半透明紫色渐变
- **手机端适配**：汇总卡片 2×2 堆叠，热力格 10px，趋势图高度缩小

### 设计决策
- **历史数据放 storage.js**：避免 script 加载顺序问题，`s.history` 随 `syncToCloud()` 自动同步
- **Bootstrap 一次性**：仅首次无历史时从 `lr` 时间戳重建，之后增量记录
- **上限 365 条**：每条约 50 bytes，365 条 ≈ 18KB，远低于 5MB localStorage 限制
- **纯 CSS 图表**：零外部依赖，复用 SRS 柱状图模式
- **5 个底部导航**：标准移动端导航模式（首页/复习/导入/排行/统计）

### 文件变更
- `js/storage.js` — 新增 `getHistory()` / `recordDailyHistory()` / `bootstrapHistory()` 三个函数 + `setWordStatus()` / `saveBest()` 插入历史钩子（~57 行）
- `js/stats.js` — **新建**：`calcSummaryStats()` / `getHeatmapData()` / `getTrendData()` / `renderStats()` / `renderCalendarHeatmap()` / `renderTrendChart()` 六个函数（~160 行）
- `index.html` — 新增 `panel-stats` + 侧栏/底部导航 📊 Stats 按钮 + `<script src="js/stats.js">`（~6 行）
- `js/ui.js` — `navTo()` + `toggleLang()` 新增 stats 分支（~2 行）
- `css/style.css` — 热力图网格 + 紫色强度等级 + 深色模式覆盖 + 趋势柱状图 + 手机断点（~100 行）

---

## [0.9.5] - 2026-03-04 — 分享结果卡片 (Share Result Card)

### 新增
- **分享结果卡片**：所有结果页（Daily / Quiz / Spell / Match）新增绿色"📤 分享"按钮
- **Canvas 2D 品牌卡片**：400×560 紫色渐变卡片（2x 视网膜），含得分/用时/streak/段位/日期/URL
- **Web Share API**：移动端调用系统分享面板（支持分享 PNG 图片到微信/WhatsApp 等）
- **桌面回退下载**：不支持 Web Share 的浏览器自动下载 PNG 文件
- **固定紫色主题**：卡片始终使用品牌紫色渐变（#5248C9 → #3D35A0），不随深色模式变化

### 设计决策
- **零外部依赖**：Canvas 2D 原生绘制，无需 html2canvas 等库
- **不新建 JS 文件**：`drawShareCard()` / `shareResult()` 追加到 `quiz.js`，复用已有架构
- **全局 `_lastShareOpts`**：各结果页写入共享选项对象，分享按钮统一读取

### 文件变更
- `js/quiz.js` — 新增 `drawShareCard()` + `roundRect()` + `shareResult()` 三个函数 + `finishDaily()` 设置分享选项并插入分享按钮（~120 行）
- `js/ui.js` — 新增 `_lastShareOpts` 全局变量 + `resultScreenHTML()` 设置分享选项并插入分享按钮（~6 行）
- `js/match.js` — `finishMatch()` 设置 `_lastShareOpts` 并插入分享按钮（~6 行）
- `js/spell.js` — `finishSpell()` 传递 mode 参数给 `resultScreenHTML()`（~1 行）
- `css/style.css` — `.btn-share` 绿色渐变按钮样式（~10 行）

---

## [0.9.4] - 2026-03-04 — 每日挑战模式 (Daily Challenge)

### 新增
- **每日挑战**：每天一组 10 词四选一限时挑战（60 秒），同日同用户同组题（日期种子伪随机）
- **首页 Banner**：Rank 行下方新增橙色渐变入口，未完成显示 "GO →"，已完成显示得分 "8/10 ✓"
- **混合方向**：每题随机 EN→ZH 或 ZH→EN（基于种子+题号，确定性）
- **最佳记录**：每日可多次挑战，仅保留最高分和最佳用时
- **进度圆点**：HUD 下方 10 个圆点实时指示答题进度
- **自动结算**：倒计时归零或中途退出均自动结算当前进度
- **SRS 联动**：答对/答错自动更新 SRS 状态，触发 streak 钩子

### 设计决策
- **纯前端实现**：挑战数据存在 `wmatch_v3.daily` 键内，通过 `vocab_progress` 自动云同步
- **不新建 JS 文件**：逻辑追加到 `quiz.js` 底部，复用 quiz 基础设施（选项生成、样式、音效）
- **LCG 伪随机**：`seededShuffle()` 使用线性同余生成器（乘数 1664525），确保同日同序

### 文件变更
- `js/quiz.js` — 新增 `DC` 状态 + 8 个函数：`getDailySeed` / `seededShuffle` / `getDailyData` / `saveDailyResult` / `startDaily` / `renderDailyCard` / `pickDailyOpt` / `endDailyEarly` / `finishDaily`（~160 行）
- `js/mastery.js` — `renderHome()` Rank 行后插入每日挑战 banner（~10 行）
- `index.html` — 新增 `panel-daily`（+1 行）
- `css/style.css` — `.dc-home-banner` / `.dc-badge` / `.dc-hud` / `.dc-timebar` / `.dc-progress` / `.dc-dot` 样式（~30 行）

---

## [0.9.3] - 2026-03-04 — 学习连续天数 (Streak)

### 新增
- **学习打卡 Streak**：每日首次学习自动记录，首页展示当前连续天数（🔥 火焰图标）
- **Streak Toast 提示**：当日首次学习完成后弹出"🔥 N-day streak!"双语 Toast
- **历史最长连续**：`streak.max` 记录历史最长连续天数（为后续成就系统预留）
- **Streak 卡片**：首页统计栏新增第 4 张卡片（橙色主题 `--c-streak: #FF6B35`）
- **深色模式适配**：Streak 卡片在深色模式下使用 `#FF8C5A` + 半透明背景

### 设计决策
- **纯前端实现**：streak 数据存在 `wmatch_v3` localStorage blob 的 `streak` 键内，通过 `vocab_progress` 自动云同步，无需 Supabase 迁移
- **同日去重**：`today === last` 时 `recordActivity()` 返回 false，不弹 Toast
- **本地时区**：`toLocaleDateString('en-CA')` 取浏览器本地日期
- **`saveBest` 参数重命名**：`t` → `tm` 避免遮蔽全局 `t()` i18n 函数

### 文件变更
- `js/storage.js` — 新增 `getStreak()` / `getStreakCount()` / `recordActivity()` 三个函数 + `setWordStatus()` / `saveBest()` 插入 streak 钩子（~25 行）
- `js/mastery.js` — `renderHome()` 统计栏新增 streak 卡片（+2 行）
- `css/style.css` — `--c-streak` / `--c-streak-bg` 设计 token + `.stat-card-streak` 样式（~5 行）

---

## [0.9.2] - 2026-03-04 — 响应式修补 + 移动体验

### 新增
- **iPhone 刘海适配**：viewport 加 `viewport-fit=cover`，`.header-bar` 加 `padding-top: env(safe-area-inset-top)`，Tablet/Phone `.main-pad` 顶部内边距加 safe-area 偏移
- **触控热区 ≥ 44px**：Phone 断点下 `.btn-icon` / `.btn` / `.rate-btn` 最小高度 44px，`.btn-sm` 36px；`.bnav-item` padding 全局调大
- **实战模式网格响应式**：`calcCols()` 接入 `detectBP()` 断点——Phone 2-3 列 / Tablet 3-4 列 / Desktop 4-5 列
- **闪卡宽度自适应**：Tablet `min(320px, 85vw)`、Phone `min(300px, 90vw)`，窄屏不溢出
- **排版字号缩放**：Phone 下 `.section-title` 16px、`.auth-title` 20px、`.result-title` 18px、`.result-score` 40px
- **Toast 位置适配底部导航**：Tablet/Phone Toast 上移至底部导航上方，含 safe-area 偏移
- **连击弹窗手机端缩小**：Phone `.combo-pop` 字号 22px

### 文件变更
- `index.html` — viewport 加 `viewport-fit=cover`（~1 行）
- `css/style.css` — safe-area + 触控热区 + 字号缩放 + toast/combo 位置（~25 行）
- `js/ui.js` — `calcCols()` 响应式断点逻辑（~5 行）

---

## [0.9.1] - 2026-03-04 — 密码重置 / 同步时间戳 / 同步失败提示

### 新增
- **密码重置**：登录页新增"忘记密码？Forgot password?"链接，点击弹出 Modal，输入邮箱发送重置链接（Supabase `resetPasswordForEmail`）
- **密码恢复回调**：用户点击邮件中的重置链接跳回页面后，`onAuthStateChange('PASSWORD_RECOVERY')` 自动弹出设置 Modal + Toast 提示"请设置新密码"
- **同步失败 Toast 提示**：`syncToCloud()` / `syncFromCloud()` 失败时显示"同步失败，请检查网络"Toast（5s 防抖，不重复弹）

### 变更
- **同步冲突改用时间戳**：`syncFromCloud()` 改用 DB `updated_at` 字段 vs 本地 `wmatch_last_sync` 时间戳比较，替代原来的 key 数量比较
- **同步成功写时间戳**：`syncToCloud()` upsert 成功后写 `localStorage('wmatch_last_sync')`

### 文件变更
- `index.html` — 登录页新增"忘记密码"链接（+1 行）
- `css/style.css` — 新增 `.auth-forgot` + `:hover` 样式（+5 行）
- `js/auth.js` — 新增 `showPasswordReset()` + `sendPasswordReset()` 两个函数（+37 行）
- `js/app.js` — `initApp()` 新增 `onAuthStateChange('PASSWORD_RECOVERY')` 监听（+7 行）
- `js/storage.js` — `syncToCloud()` 加时间戳写入 + Toast 防抖；`syncFromCloud()` 改时间戳比较 + Toast 防抖（+20 行）

---

## [0.9.0] - 2026-03-04 — 深色模式 + 游戏增强（测验双向 / 拼写语音 / 音效）

### 新增
- **深色模式**：🌙/☀️ 切换按钮（侧栏 + 顶栏），CSS 变量覆盖全部配色；首次访问自动跟随系统偏好，`localStorage` 持久化，`<head>` 内联脚本防白闪
- **音效系统**：🔊/🔇 切换按钮，Web Audio API 实现 4 种音效 — `playCorrect()` 正确（440→880Hz sine）、`playWrong()` 错误（300→200Hz square）、`playCombo()` 连击（C5-E5-G5 琶音）、`playTick()` 倒计时（800Hz 短促），AudioContext 懒创建遵守 autoplay 策略
- **测验双向模式**：方向切换栏（EN→中 / 中→EN），切方向不重置进度，选项去重
- **拼写语音朗读**：Web Speech Synthesis 🔊 按钮 + 加载后自动发音（`rate=0.85, lang=en-US`），不支持 speechSynthesis 的浏览器自动隐藏按钮
- **全局音效集成**：实战模式（配对成功 + 连击≥3 + 倒计时≤5s）、配对模式、学习模式、复习模式均接入音效

### 设计决策
- `appDark` + `appSound` 全局状态，统一控制深色/音效+语音
- `[data-theme="dark"]` 覆盖全部 CSS 自定义属性，无 class 侵入
- AudioContext 懒创建 + resume：首次用户交互才初始化，兼容 Chrome/Safari autoplay 限制
- Quiz `setQuizDir()` 只重渲当前卡，保留 `Q.idx` / `Q.correct` 进度

### 文件变更
- `js/config.js` — `appDark` + `appSound` 全局状态（localStorage + 系统偏好降级）
- `css/style.css` — `[data-theme="dark"]` 变量覆盖 + header/nav/overlay/input 暗色适配 + `.quiz-dir-bar` / `.btn-speak` 样式
- `index.html` — `<head>` 防闪烁内联脚本 + 侧栏/顶栏 dark + sound 切换按钮
- `js/ui.js` — `applyDark()` / `toggleDark()` / `toggleSound()` / Web Audio 引擎（`playTone` / `playCorrect` / `playWrong` / `playCombo` / `playTick`）/ `canSpeak()` / `speakWord()`
- `js/quiz.js` — `Q.dir` 双向模式 + `setQuizDir()` + 方向切换 UI + 选项去重 + 音效
- `js/spell.js` — 🔊 发音按钮 + 自动发音 + 答对/答错音效
- `js/battle.js` — 配对成功/失败/连击/倒计时音效
- `js/match.js` — 配对成功/失败音效
- `js/study.js` — 掌握/不熟音效
- `js/review.js` — 搞定/不熟音效

---

## [0.8.2] - 2026-03-04 — 首页搜索 + 复习过滤

### 新增
- **首页搜索框**：支持按词组标题（英/中）和词汇内容搜索，200ms 防抖
- **搜索自动展开**：搜索时匹配的 category 自动展开，不匹配的 board/category/card 隐藏
- **复习仪表盘搜索**：过滤待复习词汇列表，显示匹配数/总数
- **搜索状态共享**：首页与复习面板共享 `appSearch` 状态，切换面板搜索词保留
- **空结果提示**：搜索无匹配时显示"无匹配结果"
- **清除搜索**：点击 × 按钮或清空输入恢复原始折叠状态

### 文件变更
- `js/config.js` — 新增 `appSearch` 全局变量 + `matchLevel()` + `matchWord()` 搜索函数
- `js/mastery.js` — `renderHome()` 加搜索框 + catLevels 过滤 + `onHomeSearch()` / `clearHomeSearch()` 防抖函数
- `js/review.js` — `renderReviewDash()` 加搜索框 + dueWords 过滤 + `onReviewSearch()` / `clearReviewSearch()`
- `css/style.css` — 新增 `.search-bar` / `.search-input` / `.search-clear` / `.search-count` 样式

---

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
- 修复注册后重定向到主站的问题：`signUp()` 添加 `emailRedirectTo` 参数，确认邮件链接回 examhub.25maths.com
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
- Supabase Dashboard → Authentication → URL Configuration 需添加 `https://examhub.25maths.com/`

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
- GitHub Pages: https://git25math.github.io/25maths-examhub/
- Repository: https://github.com/git25math/25maths-examhub
