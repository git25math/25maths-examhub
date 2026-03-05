# Changelog

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
