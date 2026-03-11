---
render_with_liquid: false
---
# Supabase ↔ JSON ↔ LaTeX 双向同步调研报告

> 日期: 2026-03-11 | 版本: v1.0

## 1. 当前数据流（单向）

```
QuestionStatement.tex ──(migrate-v4.py)──▶ papers-cie.json ──(app load)──▶ 内存
                                                                              │ merge
                                                             question_edits ◀─┘ (编辑器 upsert)
                                                             (Supabase)
```

**问题**: Supabase 编辑不回流到 LaTeX 源，重新 build JSON 会覆盖编辑。

## 2. 目标数据流（双向）

```
                    ┌─────────────────────────────────────────┐
                    │          Supabase question_edits        │
                    │          (主数据源 — 所有编辑存此)       │
                    └──────────┬──────────────┬───────────────┘
                               │              │
                    bake-edits.py        export-latex.py
                               │              │
                               ▼              ▼
                     papers-cie.json    QuestionStatement.tex
                     (静态 JSON)         (备份旧文件 → 写入新文件)
```

## 3. 文件结构对照

### 3.1 CIE 目录结构

```
CIE/IGCSE_v2/PastPapers/{SESSION}/{PAPER}/Questions/Q{NN}/
├── QuestionInfo.tex         ← 元数据 + \input QuestionStatement
├── QuestionStatement.tex    ← 题目内容（export 目标）
├── QuestionStandalone.tex   ← 独立编译（不需修改）
└── Figures/
    ├── Q{NN}-Desc.tex       ← 图片 wrapper（控制 PNG vs TikZ）
    ├── Q{NN}-Desc.png       ← 原题截图
    ├── Q{NN}-Desc.tikz      ← TikZ 源码（可选）
    └── Q{NN}-Desc-Standalone.tex
```

### 3.2 Edexcel 目录结构

```
Edexcel/IGCSE_v2/PastPapers/{SESSION}/{PAPER}/Questions/Q{N}/
├── QuestionInfo.tex
├── QuestionStatement.tex
├── metadata.json            ← JSON 元数据（Edexcel 独有）
└── Figures/
```

### 3.3 Question ID → 目录映射

| JSON `id` | LaTeX 目录 |
|---|---|
| `0580-2025March-Paper32-Q20` | `CIE/.../PastPapers/2025March/Paper32/Questions/Q20/` |
| `4MA1-2024Nov-Paper1F-Q01` | `Edexcel/.../PastPapers/2024Nov/Paper1F/Questions/Q1/` |

**解析规则**:
- CIE: `0580-{session}-{paper}-Q{nn}` → Q 号保留前导零（Q01, Q20）
- Edexcel: `4MA1-{session}-{paper}-Q{nn}` → Q 号无前导零（Q1, Q23）

## 4. Block JSON → LaTeX 映射（正向）

### 4.1 Block 类型映射

| Block JSON | LaTeX 输出 | 备注 |
|---|---|---|
| `{type:"text", content:"..."}` | 直接输出文本 | 内嵌 `$...$` 数学公式保留 |
| `{type:"table", content:"\\begin{tabular}..."}` | 直接输出 tabular | 已是 LaTeX 格式 |
| `{type:"figure", hasFigure:true}` | `\relinput{Figures/Q{NN}.tex}` | 图片 wrapper 不动，只引用 |
| `{type:"list", style:"bullet", items:[...]}` | `\begin{itemize}\item...\end{itemize}` | number→enumerate |

### 4.2 Answer 类型映射

| Answer JSON | LaTeX 输出 |
|---|---|
| `{type:"number"}` | `\AnswerLine[][]` |
| `{type:"number", prefix:"x ="}` | `\AnswerLine[x =][]` |
| `{type:"number", suffix:"cm"}` | `\AnswerLine[][cm]` |
| `{type:"number", prefix:"x =", suffix:"cm"}` | `\AnswerLine[x =][cm]` |
| `{type:"vector", fields:2}` | `\AnswerVector[]` |
| `{type:"vector", fields:2, prefix:"\\overrightarrow{AB} ="}` | `\AnswerVector[\overrightarrow{AB}]` |
| `{type:"coordinate"}` | `\AnswerCoordinate[]` |
| `{type:"coordinate", prefix:"A"}` | `\AnswerCoordinate[A]` |
| `{type:"coordinate", fields:4, template:"(...) and (...)"}` | 手写模板 |
| `{type:"expression", template:"x = ____ or x = ____"}` | 手写模板替换 `____` → `\DotLine{13}` |
| `{type:"multiline", lines:2}` | `\answerlines[2]` |
| `{type:"multiline", lines:3}` | `\answerlines[3]` |
| `{type:"table_input"}` | 保留原 tabular（含 `\TableAnswerLine`） |
| `null` (无 answer) | 不输出答题线 |

### 4.3 层级结构映射

```
JSON                                    LaTeX
────────────────────────────────────    ────────────────────────────────────
{                                       \begin{question}{marks}
  stem: [blocks]                          [stem blocks rendered]
  marks: N
  answer: {...}                           \AnswerLine[...]...\Marks{N}
}                                       \end{question}

{                                       \begin{question}{marks}
  stem: [blocks]                          [stem blocks rendered]
  parts: [                                \begin{parts}
    {                                       \item [part content]
      label:"(a)",                            \AnswerLine[...]
      content:[blocks],                       \Marks{N}
      marks:N,
      answer:{...}
    },
    {                                       \item [part content]
      label:"(b)",                            \begin{subparts}
      content:[blocks],                         \subpart [sp content]
      subparts: [                                 \AnswerLine[...]
        {                                         \Marks{N}
          label:"(i)",                            \subpart [sp content]
          content:[blocks],                         \AnswerLine[...]
          marks:N,                                  \Marks{N}
          answer:{...}                          \end{subparts}
        }
      ]
    }
  ]                                       \end{parts}
}                                       \end{question}
```

### 4.4 Subsubpart 映射（v4.6.0 新增）

```
JSON                                    LaTeX
────────────────────────────────────    ────────────────────────────────────
subparts: [{                              \begin{subparts}
  label:"(i)",                              \subpart [content]
  content:[blocks],                           \begin{subsubparts}
  subsubparts: [{                               \subsubpart [content]
    label:"(p)",                                  \AnswerLine[...]
    content:[blocks],                             \Marks{N}
    marks:N,                                  \end{subsubparts}
    answer:{...}
  }]
}]
```

## 5. LaTeX 宏定义汇总

### 5.1 共用宏（CIE + Edexcel 相同）

| 宏 | 定义位置 | 参数 |
|---|---|---|
| `\begin{question}{marks}` | QuestionStyle.sty:72/83 | 必需: 总分 |
| `\StemText{content}` | QuestionStyle.sty:116 | 必需: 题干文本 |
| `\ImplicitPart` | QuestionStyle.sty | 空命令，标记无小题 |
| `\begin{parts}` | QuestionStyle.sty:244 | enumitem list, label=(a) |
| `\begin{subparts}` | QuestionStyle.sty:272 | enumitem list, label=(i) |
| `\begin{subsubparts}` | QuestionStyle.sty:283 | enumitem list, label=(a) |
| `\part` | `\let\part\item` | parts 环境内 |
| `\subpart` | `\let\subpart\item` | subparts 环境内 |
| `\subsubpart` | `\let\subsubpart\item` | subsubparts 环境内 |
| `\AnswerLine[pfx][sfx]` | QuestionStyle.sty:136 | 两个可选参数 |
| `\AnswerLineShort[pfx][sfx]` | QuestionStyle.sty:164 | 两个可选参数 |
| `\Marks{n}` | QuestionStyle.sty | 必需: 分值 |
| `\answerlines[n]` | QuestionStyle.sty:324 | 可选: 行数(默认3) |
| `\relinput{path}` | RelInput.sty | 相对路径 input |
| `\relincludegraphics[opts]{path}` | RelInput.sty | 相对路径图片 |
| `\vgap[len]` | QuestionStyle.sty | 可选: 间距(默认0.8em) |
| `\Answerspace[len]` | QuestionStyle.sty:323 | 可选: 间距(默认3cm) |

### 5.2 CIE 独有宏

| 宏 | 用途 |
|---|---|
| `\AnswerCoordinate[label]` | 坐标答题空间 (___,___) |
| `\AnswerCoordinate*[label]` | 非居中版 |
| `\AnswerVector[\vec{AB}]` | 列向量答题空间 |
| `\AnswerVector*[\vec{AB}]` | 非居中版 |
| `\AnswerReason[pfx][unit]` | 答案+原因 |
| `\RatioLine{n}` | 比例答题空间 a:b:c |
| `\TableAnswerLine` | 表格内答题线(15点) |
| `\WorkingSpace[len]` | 工作空间(默认5cm) |
| `\PartLabel{a}` | 手动小题标签 |
| `\BlankInText` | 行内填空(25点) |

### 5.3 CIE vs Edexcel 差异

| 项目 | CIE | Edexcel |
|---|---|---|
| 题号显示 | 自动打印粗体题号 | v4.0 不打印 |
| `\Marks{n}` 格式 | `[n]` | `[n]` |
| 图片容器 | `\relinput{Figures/Q.tex}` | `\InsertScreenShot{\relincludegraphics{...}}` 或 `\relinput` |
| 元数据 | QuestionInfo.tex (`\def`) | QuestionInfo.tex + metadata.json |
| 图片缺失 | 直接报错 | 显示占位框 |
| CJK 字体 | Songti SC | STKaiti |

## 6. 图片处理策略

**关键原则**: export-latex.py 不动 Figures/ 目录，只输出 `\relinput{Figures/Qnn.tex}` 引用。

Figure block 在 JSON 中只存 `{"type":"figure","hasFigure":true}`，不含文件名。
export 时需要:
1. 检查 `Figures/` 目录下有哪些 `.tex` wrapper
2. 按 QuestionStatement.tex 原文中的 `\relinput` 顺序还原引用
3. 如果 JSON 有 figure block 但目录无文件 → 输出 `%% [FIGURE PLACEHOLDER]` 注释

**fallback**: 保留原 QuestionStatement.tex 的 `\relinput` 行不变（只要 figure block 位置匹配）。

## 7. 边界情况

### 7.1 `tex` vs `stem` 字段

- **4,107 题中 3,570 有 stem** (Block[])，**全部 4,107 有 tex** (raw LaTeX)
- 有 stem 的题 → 从 stem blocks 生成
- 只有 tex 的题 → 直接使用 tex 字段（无需转换）
- Supabase 编辑保存 stem 后 → 删除 tex → export 从 stem 生成

### 7.2 特殊格式保留

有些 LaTeX 特性在 JSON 中无对应:
- `\vgap` / `\Answerspace[2cm]` → JSON 不存，export 默认不加
- `\WorkingSpace[5cm]` → JSON 不存
- `\PartLabel{b}` (手动标签) → JSON `label:"(b)"`
- `\StemText{}` 包裹 → CIE 有时省略，Edexcel 始终用
- `[leftmargin=1.8cm, label=(\alph*)]` 自定义 parts 参数 → JSON 不存

**策略**: export 使用标准格式（`\StemText` 始终包裹，标准 parts margin），不保留非标准间距。可编译，但格式可能略有差异。

### 7.3 \part vs \item

- `parts` 环境内 `\part` = `\item`（通过 `\let\part\item` 定义）
- export 统一输出 `\part`（可读性更好）

## 8. export-latex.py 转换规则

### 输入
```python
question = {
    "id": "0580-2025March-Paper32-Q20",
    "marks": 9,
    "stem": [blocks],
    "parts": [parts],
    "answer": answer_or_null,
    "tex": "raw latex fallback"
}
```

### 输出模板

```latex
\begin{question}{TOTAL_MARKS}
[STEM_BLOCKS]
[IF no parts AND has answer:]
  [ANSWER_LINE]
  \Marks{MARKS}
[IF has parts:]
\begin{parts}
  \part [PART_CONTENT_BLOCKS]
  [IF part has subparts:]
    \begin{subparts}
      \subpart [SUBPART_CONTENT_BLOCKS]
      [IF subpart has subsubparts:]
        \begin{subsubparts}
          \subsubpart [SUBSUBPART_CONTENT_BLOCKS]
          [ANSWER_LINE]
          \Marks{N}
        \end{subsubparts}
      [ELSE:]
        [ANSWER_LINE]
        \Marks{N}
      [END IF]
    \end{subparts}
  [ELSE:]
    [ANSWER_LINE]
    \Marks{N}
  [END IF]
\end{parts}
[END IF]
\end{question}
```

### Block 渲染函数

```python
def render_block(block, q_id):
    if block["type"] == "text":
        return block["content"]
    elif block["type"] == "table":
        return block["content"]  # 已是 LaTeX
    elif block["type"] == "figure":
        # 查找 Figures/ 目录下的 .tex wrapper
        return f"\\relinput{{Figures/{figure_name}.tex}}"
    elif block["type"] == "list":
        tag = "enumerate" if block.get("style") == "number" else "itemize"
        items = "\n".join(f"\\item {it}" for it in block["items"])
        return f"\\begin{{{tag}}}\n{items}\n\\end{{{tag}}}"
```

### Answer 渲染函数

```python
def render_answer(answer):
    if answer is None:
        return ""
    t = answer["type"]
    pfx = answer.get("prefix", "")
    sfx = answer.get("suffix", "")
    if t == "number":
        return f"\\AnswerLine[{pfx}][{sfx}]"
    elif t == "vector":
        vec_pfx = f"\\{pfx}" if pfx else ""
        return f"\\AnswerVector[{vec_pfx}]"
    elif t == "coordinate":
        return f"\\AnswerCoordinate[{pfx}]"
    elif t == "multiline":
        lines = answer.get("lines", 3)
        return f"\\answerlines[{lines}]"
    elif t == "expression":
        tpl = answer.get("template", "")
        if tpl:
            # ____ → \DotLine{13}
            latex_tpl = tpl.replace("____", "\\DotLine{13}")
            return f"\\par\\noindent\\hfill {pfx}{latex_tpl} {sfx}\\par"
        return f"\\AnswerLine[{pfx}][{sfx}]"
    elif t == "table_input":
        return ""  # table_input 的答题线在表格内部
    return ""
```

## 9. 备份策略

**export 前必须备份原文件**:
```python
import shutil, datetime

def backup_file(filepath):
    """重命名备份: QuestionStatement.tex → QuestionStatement.bak.YYYYMMDD.tex"""
    if os.path.exists(filepath):
        ts = datetime.datetime.now().strftime("%Y%m%d")
        bak = filepath.replace(".tex", f".bak.{ts}.tex")
        # 如果同天已有备份，加序号
        i = 1
        while os.path.exists(bak):
            bak = filepath.replace(".tex", f".bak.{ts}.{i}.tex")
            i += 1
        shutil.copy2(filepath, bak)
        return bak
    return None
```

备份文件留在同级目录:
```
Questions/Q20/
├── QuestionStatement.tex            ← 新生成
├── QuestionStatement.bak.20260311.tex  ← 原文件备份
├── QuestionInfo.tex
└── Figures/
```

## 10. 一致性验证

export 后应能验证:
1. `xelatex QuestionStandalone.tex` 编译成功（无错误）
2. 生成 PDF 与原 PDF 内容一致（视觉 diff 或文本 diff）
3. 重新 `migrate-v4.py` 解析新 LaTeX → 与 JSON 一致（闭环测试）

验证命令:
```bash
TEXINPUTS=".:CIE_ROOT//:" xelatex -interaction=nonstopmode QuestionStandalone.tex
```

## 11. 实施步骤

1. **`scripts/bake-edits.py`** — 从 Supabase 拉取 question_edits → 合并到 papers-cie.json
2. **`scripts/export-latex.py`** — 从 papers-cie.json → 生成 QuestionStatement.tex（含备份）
3. **`scripts/verify-export.py`** — 编译验证 + 闭环 JSON 对比
4. 先对 5-10 题手动验证，再批量执行
