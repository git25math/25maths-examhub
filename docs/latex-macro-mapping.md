# CIE 0580 LaTeX 宏 → JSON Block 完整映射表

> **来源**: `CIE-0580-Master-Style.sty` → 加载 6 个子模块
> **创建**: 2026-03-11
> **用途**: 确保 JSON ↔ LaTeX 双向转换的高保真

---

## 1. 结构环境（Structure Environments）

| LaTeX 宏 | 定义来源 | JSON 映射 | 备注 |
|-----------|---------|-----------|------|
| `\begin{question}{N}...\end{question}` | QuestionStyle:72 | 顶层 question 对象 `{marks: N}` | N = 总分 |
| `\begin{parts}...\end{parts}` | QuestionStyle:244 | `parts[]` 数组 | enumitem list, label=(a)(b)... |
| `\begin{subparts}...\end{subparts}` | QuestionStyle:272 | `parts[].subparts[]` | label=(i)(ii)... |
| `\begin{subsubparts}...\end{subsubparts}` | QuestionStyle:283 | `parts[].subparts[].subsubparts[]` | label=(a)(b)... |
| `\item` | parts 环境内 | 分隔 parts/subparts/subsubparts | 等同于 `\part` / `\subpart` / `\subsubpart` |

## 2. 答案线命令（Answer Line Commands）

| LaTeX 宏 | 定义来源 | 参数 | JSON answer 映射 |
|-----------|---------|------|-----------------|
| `\AnswerLine[pfx][sfx]` | QuestionStyle:136 | 2个可选`[]` | `{type:"number", prefix:"pfx", suffix:"sfx"}` |
| `\AnswerLineShort[pfx][sfx]` | QuestionStyle:164 | 2个可选`[]` | 用于 coordinate/expression/inline |
| `\AnswerCoordinate[label]` | QuestionStyle:193 | `s`星号+1个可选`[]` | `{type:"coordinate", fields:2, prefix:"label"}` |
| `\AnswerVector[label]` | QuestionStyle:218 | `s`星号+1个可选`[]` | `{type:"vector", fields:2, prefix:"label"}` |
| `\AnswerReason[pfx][sfx]` | QuestionStyle:132 | 2个可选`[]` | 特殊：结果+because+dotfill |
| `\answerlines[n]` | QuestionStyle:324 | 1个可选`[]`默认3 | `{type:"multiline", lines:n}` |
| `\dotfill` | LaTeX 原生 | 无 | 用于描述题，`{type:"multiline", style:"dotfill"}` |
| `\RatioLine{n}` | QuestionStyle:337 | 1个必需`{}` | `{type:"expression", template:"____:____:..."}` |
| `\TableAnswerLine` | QuestionStyle:162 | 用于 tabular 内 | `{type:"table_input"}` |
| `\BlankInText` | QuestionStyle:344 | 无 | 内嵌填空，保留在 text block 中 |
| `\DotLine{n}` | QuestionStyle:127 | 1个必需`{}` | 底层点线，n=点数 |

### 答案线参数保真规则

**关键**: prefix/suffix 必须保留原始 LaTeX，不做任何清理！

| 原始 LaTeX | ✅ 正确存储 | ❌ 错误存储 |
|-----------|------------|-----------|
| `\AnswerLine[$G = $][]` | `prefix: "$G = $"` | `prefix: "G ="` |
| `\AnswerLine[$x = $][]` | `prefix: "$x = $"` | `prefix: "x ="` |
| `\AnswerLine[$EF = $][cm]` | `prefix: "$EF = $", suffix: "cm"` | `prefix: "EF =", suffix: "cm"` |
| `\AnswerLine[][\%]` | `suffix: "\\%"` | `suffix: "%"` |
| `\AnswerLine[][years]` | `suffix: "years"` | — |
| `\AnswerLine[][]` | 无 prefix/suffix | — |
| `\AnswerLine[$g^{-1}(x) = $][]` | `prefix: "$g^{-1}(x) = $"` | `prefix: "g⁻¹(x) ="` |

## 3. 间距命令（Spacing Commands）

| LaTeX 宏 | 定义来源 | 参数 | JSON 映射 | 默认值 |
|-----------|---------|------|-----------|--------|
| `\vgap` | QuestionStyle:356 | `[h]` 可选 | `{type:"space", height:"0.8em"}` | 0.8em |
| `\vgap[2cm]` | QuestionStyle:356 | | `{type:"space", height:"2cm"}` | — |
| `\vspace{h}` | LaTeX 原生 | `{h}` 必需 | `{type:"space", height:"h"}` | — |
| `\\[h]` | LaTeX 原生 | 行内换行+间距 | `{type:"space", height:"h"}` | — |
| `\SmallBreak` | QuestionStyle:350 | 无 | `{type:"space", height:"0.3cm"}` | 0.3cm |
| `\MediumBreak` | QuestionStyle:351 | 无 | `{type:"space", height:"0.5cm"}` | 0.5cm |
| `\LargeBreak` | QuestionStyle:352 | 无 | `{type:"space", height:"1cm"}` | 1cm |
| `\LineBreak[h]` | QuestionStyle:349 | `[h]` 可选 | `{type:"space", height:"h"}` | 0.5cm |

### 间距在 LaTeX 中的实际定义

```latex
\newcommand{\vgap}[1][0.8em]{\par\vspace{#1}}
% 本质上 \vgap 就是 \par\vspace{0.8em}
```

## 4. 答题空间命令（Answer Space Commands）

| LaTeX 宏 | 定义来源 | 参数 | JSON 映射 |
|-----------|---------|------|-----------|
| `\WorkingSpace[h]` | QuestionTypes:47 | `[h]` 可选,默认5cm | `answer.space: {type:"working", height:"h"}` |
| `\Answerspace[h]` | QuestionStyle:323 | `[h]` 可选,默认3cm | `answer.space: {type:"drawing", height:"h"}` |
| `\AnswerBreak` | QuestionStyle:353 | 无 | = `\par\vspace{3cm}` |
| `\GridWorkingSpace[grid]{h}` | QuestionTypes:52 | 网格 | 特殊工作区 |
| `\answerbox[w]{h}` | QuestionStyle:331 | 宽高 | 答案框 |
| `\AnswerBox[w]` | QuestionTypes:18 | 可选宽度 | 带框答案区 |

### 答题空间 vs 间距的区别

| 类型 | 用途 | 典型高度 | 存储位置 |
|------|------|---------|---------|
| `\vgap` | 段落间微调 | 0.8em (~3mm) | content Block[] 中 |
| `\vspace` | 自定义间距 | 0.3-1cm | content Block[] 中 |
| `\WorkingSpace` | 计算空间 | 3-8cm | answer.space |
| `\Answerspace` | 画图/作答空间 | 3-10cm | answer.space |

## 5. 内容容器（Content Containers）

| LaTeX 宏 | 定义来源 | JSON 映射 |
|-----------|---------|-----------|
| `\begin{InsertScreenShot}...\end{InsertScreenShot}` | QuestionStyle:109 | `{type:"table", content:"全文"}` |
| `\relinput{Figures/X.tex}` | RelInput:14 | `{type:"figure", src:"Figures/X.tex"}` |
| `\relincludegraphics[opts]{path}` | RelInput:19 | 不直接用于 QS.tex |
| `\CenteredFigure[w]{path}` | QuestionTypes:351 | 很少用于 QS.tex |
| `\begin{tabular}...\end{tabular}` | LaTeX 原生 | `{type:"table", content:"全文"}` |
| `\begin{center}...\end{center}` | LaTeX 原生 | 保留在 text block 中 |
| `\begin{align*}...\end{align*}` | amsmath | 保留在 text block 中 |
| `$$...$$` | LaTeX 原生 | 保留在 text block 中 |
| `\begin{itemize}...\end{itemize}` | LaTeX 原生 | `{type:"list", style:"bullet"}` |

### InsertScreenShot 的实际定义

```latex
\newenvironment{InsertScreenShot}{%
    \par\vspace{0.3cm}%
    \noindent\begin{minipage}{\linewidth}\centering
}{%
    \end{minipage}\par\vspace{0.3cm}%
}
```

→ 本质是一个居中的 minipage，用于包裹表格/图片截图

## 6. 分值命令（Marks Command）

| LaTeX 宏 | 定义来源 | JSON 映射 |
|-----------|---------|-----------|
| `\Marks{n}` | QuestionStyle:237 | `marks: n` (part/subpart 级别) |

### 定义

```latex
\newcommand{\Marks}[1]{\par\noindent\hfill[#1]\par}
% 渲染为右对齐的 [n]
```

## 7. 文本格式命令（Text Formatting）

| LaTeX 宏 | JSON 处理方式 |
|-----------|-------------|
| `\textbf{word}` | **保留原样**在 text block 中 |
| `\textit{word}` | **保留原样**在 text block 中 |
| `$inline math$` | **保留原样**在 text block 中 |
| `$$display math$$` | **保留原样**在 text block 中 |
| `\text{word}` | **保留原样**在 text block 中 |
| `\mathrm{word}` | **保留原样**在 text block 中 |
| `\overrightarrow{AB}` | **保留原样**在 text block 中 |
| `\mathbf{m}` | **保留原样**在 text block 中 |
| `\frac{a}{b}` | **保留原样**在 text block 中 |
| `\qquad` | **保留原样**在 text block 中 |
| `~` | **保留原样**（不换行空格） |
| `\,` | **保留原样**（小空格） |
| `\hfill` | **保留原样**（如果在内容中） |
| `\quad` | **保留原样** |
| `\NotToScale` | **保留原样**（= `\textbf{NOT TO SCALE}`） |

### 关键原则：text block 保留原始 LaTeX

**不做任何清理！** 以下转换是 **错误** 的：

| ❌ 错误做法 | ✅ 正确做法 |
|-----------|-----------|
| `\textbf{single}` → `**single**` | 保留 `\textbf{single}` |
| `$n$` → `n` | 保留 `$n$` |
| `\text{ of }` → ` of ` | 保留 `\text{ of }` |
| `cm$^2$` → `cm²` | 保留 `cm$^2$` |
| `\overrightarrow{AB}` → `AB` | 保留 `\overrightarrow{AB}` |
| `45$°$` → `45°` | 保留 `45$°$` |

## 8. 题型语义宏（Semantic Commands）— QuestionTypes.sty

这些宏**不出现在** QuestionStatement.tex 中（它们在教学材料中使用），但列出以备参考：

| 宏 | 展开为 |
|----|--------|
| `\CalculationQuestion{expr}` | `\textbf{Work out} expr` |
| `\SimplifyExpression{expr}` | `\textbf{Simplify} $expr$` |
| `\Factorise{expr}` | `\textbf{Factorise} $expr$` |
| `\SolveEquation{expr}` | `\textbf{Solve} $expr$` |
| `\FindAngle{name}` | `\textbf{Find the size of angle} $name$` |
| `\ShowWorking` | `\textit{You must show all your working.}` |
| `\DecimalPlaces{n}` | `\textit{Give your answer correct to n decimal places.}` |
| `\GiveReasons` | `\textit{Give reasons for your answer.}` |

## 9. 路径系统

```
CIE_ROOT/
├── CommonAssets/
│   └── PaperSettings/
│       ├── CIE-0580-Master-Style.sty    ← 主入口，加载以下 6 个
│       ├── PaperSettings-RelInput.sty    ← \relinput, \relincludegraphics
│       ├── PaperSettings-PathConfig.sty  ← 路径变量
│       ├── PaperSettings-QuestionStyle.sty ← 核心：question/parts/answer/spacing
│       ├── PaperSettings-QuestionTypes.sty ← 语义宏 + WorkingSpace
│       ├── PaperSettings-CoverPage.sty   ← 封面
│       └── PaperSettings-PageLayout.sty  ← 页面布局
└── PastPapers/{session}/{paper}/Questions/{Qnn}/
    ├── QuestionStatement.tex             ← 题目内容
    └── Figures/
        ├── Qnn-desc.tex                  ← 中间层（\relinput 引用）
        ├── Qnn-desc.png                  ← 截图版
        ├── Qnn-desc.tikz                 ← TikZ 源码（可选）
        └── Qnn-desc-Standalone.tex       ← 独立编译
```

### \relinput 的工作机制

```latex
\newcommand{\relinput}[1]{\input{\currfiledir #1}}
```

在 QuestionStatement.tex 中：
```latex
\relinput{Figures/Q07-transformations.tex}
```
展开为：
```latex
\input{/path/to/Questions/Q07/Figures/Q07-transformations.tex}
```

## 10. 完整 Block 类型定义

### Block 类型枚举

```typescript
type Block =
  | { type: "text",   content: string }     // 原始 LaTeX 文本
  | { type: "table",  content: string }     // 表格（含 InsertScreenShot 包装）
  | { type: "figure", src: string }         // 图片引用 \relinput{src}
  | { type: "space",  height: string }      // 间距 \vgap / \vspace
  | { type: "list",   style: "bullet"|"number", items: string[] }
```

### Answer 类型枚举

```typescript
type Answer = {
  type: "number" | "vector" | "coordinate" | "expression"
      | "multiline" | "table_input" | "none"
  prefix?: string      // 原始 LaTeX，如 "$G = $"
  suffix?: string      // 原始 LaTeX，如 "cm" 或 "\\%"
  fields?: number      // coordinate/vector/expression 的字段数
  lines?: number       // multiline 行数
  style?: "dotfill"    // dotfill 描述题（\dotfill 代替 \AnswerLine）
  template?: string    // 模板字符串，____ 代表填空
  space?: {
    type: "working" | "drawing"
    height: string     // 如 "5cm", "3cm"
  }
  _rawAnswer?: string  // 特殊格式的原始 LaTeX（如 Q08 expression）
}
```

## 11. Paper43 实例验证

### Q01 — 标准 parts + AnswerLine

```latex
\begin{question}{2}
The $n$th term of a sequence is $5 - 2n$.
\begin{parts}
\item Find the 6th term of this sequence.
\vgap
\AnswerLine[][]
\Marks{1}
\item Find the greatest number in this sequence.
\vgap
\AnswerLine[][]
\Marks{1}
\end{parts}
\end{question}
```

→ JSON:
```json
{
  "stem": [{"type":"text","content":"The $n$th term of a sequence is $5 - 2n$."}],
  "parts": [
    {
      "label":"(a)", "marks":1,
      "content":[
        {"type":"text","content":"Find the 6th term of this sequence."},
        {"type":"space","height":"0.8em"}
      ],
      "answer":{"type":"number"}
    },
    {
      "label":"(b)", "marks":1,
      "content":[
        {"type":"text","content":"Find the greatest number in this sequence."},
        {"type":"space","height":"0.8em"}
      ],
      "answer":{"type":"number"}
    }
  ]
}
```

### Q03 — 无 parts + prefix 带 $

```latex
\AnswerLine[$G = $][]
```

→ `answer: {type:"number", prefix:"$G = $"}`

### Q07 — dotfill 答案 + \textbf

```latex
\item Describe fully the \textbf{single} transformation...
\vgap
\dotfill
\vgap
\dotfill
\Marks{2}
```

→ content 保留 `\textbf{single}`
→ answer: `{type:"multiline", lines:2, style:"dotfill"}`

### Q08 — expression (AnswerLineShort)

```latex
\hfill \AnswerLineShort[][], \AnswerLineShort[][], \AnswerLineShort[][], \AnswerLineShort[][]
\hfill \textit{smallest} \hspace{8cm}
```

→ answer: `{type:"expression", fields:4, _rawAnswer:"原始文本"}`

### Q10 — multiline (2× AnswerLine)

```latex
\AnswerLine[$x = $][]
\vgap
\AnswerLine[$y = $][]
\Marks{2}
```

→ answer: `{type:"multiline", lines:2, template:"$x = $ ____\\n$y = $ ____"}`

### Q23 — InsertScreenShot 表格

```latex
\begin{InsertScreenShot}
\begin{tabular}{|c|c|c|c|c|}
\hline
Mass ($m$ grams) & ... \\
\hline
\end{tabular}
\end{InsertScreenShot}
```

→ `{type:"table", content:"\\begin{InsertScreenShot}...\\end{InsertScreenShot}"}`
