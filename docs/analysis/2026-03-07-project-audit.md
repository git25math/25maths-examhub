# 25Maths-ExamHub 项目严格审查报告

**版本**: v1.9.8 | **审查日期**: 2026-03-07 | **规模**: 21 JS 文件 / 16,523 行 / 13 JSON 数据文件

---

## 一、总体评价

| 维度 | 评分 | 说明 |
|------|------|------|
| **功能完成度** | 4/5 | 11 个 Phase 大部分完成，ROADMAP 执行力强 |
| **代码质量** | 3/5 | 架构清晰，但错误处理有系统性缺陷 |
| **数据完整性** | 4/5 | 111 个 section 全覆盖，3 处缺口 + 计数不一致 |
| **构建部署** | 3/5 | 流水线可用但版本号同步断裂 |
| **安全性** | 4/5 | XSS 已清除，但 .gitignore 缺 .env 规则 |

---

## 二、关键问题清单（按严重度排序）

### CRITICAL — 必须立即修复

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| C1 | Supabase `.insert()` 无 `.catch()` | `practice.js:459, 1942, 2075` | 纠错报告静默丢失，用户无反馈 |
| C2 | `.single()` 查询不检查 `res.error` | `homework.js:603` | 网络错误时 UI 静默失败 |
| C3 | `.forEach()` 前未校验 `data` | `homework.js:287` | `csRes.data` 为 undefined 时抛异常白屏 |
| C4 | `.gitignore` 缺 `.env*` 规则 | `.gitignore` | Supabase 密钥有被误提交风险 |

### HIGH — 尽快处理

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| H1 | `index.html` 缓存标签停在 `?v=1.8.4` | `index.html` | 用户浏览器可能加载旧版本缓存 |
| H2 | `package.json` 版本停在 `1.0.0` | `package.json` | 与实际 v1.9.8 不符，影响版本追踪 |
| H3 | `pastpapers-cie.json` 与 `papers-cie.json` 有 793 条重复 | `data/` | 若两文件同时加载，用户看到重复真题 |
| H4 | 事件监听器内存泄漏 | `practice.js:2036` | 编辑器 modal 反复打开累积 `input` 监听 |
| H5 | 词汇数声称 2,597 vs 实际 levels 文件合计 2,200 | CLAUDE.md / MEMORY | 差异 397，计数口径需澄清 |
| H6 | CIE 3 个 section 无练习题 | `1.6, 1.7, 4.8` | 知识点详情页练习区为空 |

### MEDIUM — 计划修复

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| M1 | 练习题声称 2,403 vs 实际 2,424（差 21） | 文档 | 21 题被标 hidden 但仍计入 JSON |
| M2 | SRS 历史跟踪代码重复 ~70 行 | `storage.js:126-240` | 修 bug 需同步两处 |
| M3 | Supabase 表重命名迁移（kw_）是否已在生产执行 | `supabase/migrations/` | 未确认则线上可能报错 |
| M4 | `AGENTS.md` 未跟踪 | 项目根目录 | 应 commit 或加入 .gitignore |

---

## 三、代码质量详情

### 做得好的地方

- 全部使用 `===` 比较，零 `==` 使用
- 全局变量用 `_` 前缀管理，无隐式全局
- `escapeHtml()` 覆盖所有 innerHTML 输出（XSS 防护到位）
- `debouncedSync` 防止同步风暴
- localStorage 配额溢出有优雅降级
- 跨浏览器兼容（无箭头函数、统一 `var`）

### 文件健康度

| 文件 | 行数 | 评分 | 主要问题 |
|------|------|------|----------|
| `config.js` | 386 | **A** | 无 |
| `auth.js` | 635 | **A** | 无 |
| `ui.js` | 749 | **A** | 无 |
| `mastery.js` | 778 | **A** | 无 |
| `storage.js` | 579 | **B+** | SRS 代码重复 |
| `admin.js` | 897 | **B+** | 1 处查询未检查 error |
| `app.js` | 366 | **B+** | renderBoard >100 行 |
| `practice.js` | 2,722 | **B** | 3 处无 catch + 事件泄漏 + 大函数 |
| `homework.js` | 1,069 | **B** | 3 处 error 未检查 |
| `syllabus.js` | 1,475 | **B+** | 多个大渲染函数 |

### 全局变量分布（~73 个）

| 文件 | 数量 | 代表性变量 |
|------|------|-----------|
| `config.js` | 25+ | `SUPABASE_URL`, `sb`, `currentUser`, `APP_VERSION`, `BOARDS` |
| `practice.js` | 11 | `_pqData`, `_pqSession`, `_katexReady`, `_pqEditsCache` |
| `storage.js` | 10 | `_sCache`, `_cacheDirty`, `_allWordsCache`, `_debounceSyncTimer` |
| `auth.js` | 9 | `AUTH_COOLDOWN_MS`, `authAttempts`, `authLockUntil` |
| `mastery.js` | 6 | `_deckSelectMode`, `catCollapsed`, `unitCollapsed` |
| `admin.js` | 6 | `_teacherData`, `_schoolData`, `_adminTab` |
| `homework.js` | 6 | `_notifCache`, `_hwMode`, `_hwTest` |

---

## 四、数据完整性详情

### 验证通过

- 全部 13 个 JSON 文件语法有效
- 111 个 section（72 CIE + 39 Edexcel）100% 有词汇覆盖
- 无孤儿题目（所有 question 引用的 section 都存在）
- CIE/Edexcel 数据无交叉污染
- 词汇无重复、练习题无跨考试局重复

### 数量核实

| 数据类型 | 声称 | 实际 | 差异 |
|----------|------|------|------|
| 词汇总量 | 2,597 | 2,200（levels 文件）/ 981（vocabulary JSON） | 需澄清口径 |
| 练习题 | 2,403 | 2,424 | +21（含 hidden） |
| 真题 | 4,107 | 4,107（papers-cie.json） | 匹配 |
| 考纲 section | 111 | 111 | 匹配 |

### 数据覆盖缺口

| Section | 词汇 | 练习题 | 真题 | 说明 |
|---------|------|--------|------|------|
| CIE 1.6 | 有 | 无 | 无 | Order of operations |
| CIE 1.7 | 有 | 无 | 无 | Bounds and rounding |
| CIE 4.8 | 有 | 无 | 无 | Constructions and loci |

### 重复数据

- `pastpapers-cie.json`（793 题）已被 `papers-cie.json`（4,107 题）完全包含
- 属遗留文件，应考虑废弃

---

## 五、构建与部署详情

### 构建系统 (9/10)

- esbuild v0.27.3 最新版
- `npm run build` -> 16 JS 合并为 `app.bundle.min.js`（~88KB gzip）+ `homework.min.js`（~11KB）+ `style.min.css`（~18KB）
- 构建产物时间戳 09:17，晚于源码最后修改 08:55 — 最新

### 版本同步断裂 (4/10)

| 位置 | 版本 | 状态 |
|------|------|------|
| `config.js` APP_VERSION | 1.9.8 | 正确 |
| `CHANGELOG.md` | [1.9.8] | 正确 |
| `package.json` | 1.0.0 | 停滞 |
| `index.html` ?v= | 1.8.4 | 停滞 6 个版本 |

### 部署配置

- CNAME: `examhub.25maths.com`
- GitHub Pages 自动部署（push main 触发）
- Supabase 迁移 20 个，时间戳正确排序
- `.gitignore` 覆盖 node_modules / .DS_Store / __pycache__ 等，但缺 `.env*`

---

## 六、ROADMAP 进度总览（v1.12.5 更新）

| Phase | 状态 | 完成度 |
|-------|------|--------|
| Phase 1-7（核心功能） | 全部完成 | 100% |
| Phase 8（社交+云端） | 基本完成 | 除"与网站会员系统对接"外完成 |
| Phase 8.1-8.8（教师+管理） | 全部完成 | 100% |
| Phase 9（星级计分） | 全部完成 | 100% |
| Phase 10A（数据层优化） | 全部完成 | 100% |
| Phase 10B（选择题练习） | 全部完成 | 100% |
| Phase 10C（考纲重构） | Phase A+D 完成 | B/C 待做 |
| Phase 10D（智能路径） | A/B/C 全部完成 | 100% |
| Phase 10E（评估层） | 诊断+模拟卷完成 | 70% |
| Phase 10F（真题引擎） | 全部完成 | 100% |
| Phase 11（PWA+离线） | 全部完成 | 100% |
| Phase 12（质量优化） | v1.12.0-v1.12.5 | 进行中 |

### 未完成关键项

- 知识卡片富文本编辑（10C Phase B/C）
- IB / AQA 考试局扩展
- 成绩预测 + 服务端评分
- Edexcel 真题数据

---

## 七、建议修复优先级

### ~~本周必做~~ ✅ v1.12.5 已全部修复

1. ~~给 `practice.js` 3 处 `.insert()` 加 `.catch()` 错误处理~~ ✅
2. ~~给 `homework.js` 加 `res.error` 检查~~ ✅
3. ~~`.gitignore` 加 `.env*` 规则~~ ✅
4. ~~`index.html` 缓存标签更新~~ ✅
5. ~~`package.json` 版本号同步~~ ✅

### ~~两周内~~ 部分已修复

6. `pastpapers-cie.json` — 保留（build-single.py 依赖），标记为遗留
7. ~~修复 `practice.js` 事件监听器泄漏~~ ✅ v1.12.5（改用 onX 属性赋值）
8. 核实 Supabase 生产环境 kw_ 表重命名迁移是否已执行（需手动）
9. 澄清词汇数 2,597 vs 2,200 的统计口径（需手动）

### 持续改进

10. 提取 Supabase 错误处理为工具函数，消除重复模式
11. 补充 CIE 1.6/1.7/4.8 三个 section 的练习题
12. 建立版本号自动同步流水线（build 时注入 config.js -> index.html -> package.json）
