# Changelog

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
