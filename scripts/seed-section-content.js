#!/usr/bin/env node
// Generates SQL for section_edits content seeding
// Usage: node scripts/seed-section-content.js > seed.sql
// Then run output in Supabase Dashboard SQL Editor

var edits = [];

function add(board, id, module, data) {
  edits.push({ board: board, section_id: id, module: module, data: data });
}

/* ══════════════════════════════════════════════════
   CIE 0580 — Chapter 1: Number (1.1 – 1.18)
   ══════════════════════════════════════════════════ */

// ── 1.1 Types of number ──
add('cie', '1.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Natural numbers</b> are counting numbers: 1, 2, 3, 4, ...<br>' +
    '• <b>Integers</b> are whole numbers (positive, negative or zero): ..., $-2, -1, 0, 1, 2$, ...<br>' +
    '• <b>Prime numbers</b> have exactly two factors (1 and itself): 2, 3, 5, 7, 11, 13, ... Note: 1 is NOT a prime number.<br>' +
    '• <b>Square numbers</b>: $1, 4, 9, 16, 25, 36, ...$ (i.e. $n^2$)<br>' +
    '• <b>Cube numbers</b>: $1, 8, 27, 64, 125, ...$ (i.e. $n^3$)<br>' +
    '• <b>Triangular numbers</b>: $1, 3, 6, 10, 15, 21, ...$ (add 2, 3, 4, 5, ...)<br>' +
    '• A <b>rational number</b> can be written as $\\frac{p}{q}$ where $p, q$ are integers and $q \\neq 0$. All terminating and recurring decimals are rational.<br>' +
    '• An <b>irrational number</b> cannot be written as a fraction. E.g. $\\pi$, $\\sqrt{2}$, $\\sqrt[3]{7}$.<br>' +
    '• <b>Real numbers</b> = all rational + irrational numbers.<br>' +
    '• The <b>reciprocal</b> of $n$ is $\\frac{1}{n}$. The reciprocal of $\\frac{a}{b}$ is $\\frac{b}{a}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Write any integer as a <b>product of prime factors</b> using a factor tree. Give your answer in index notation, e.g. $504 = 2^3 \\times 3^2 \\times 7$.<br>' +
    '• Find the <b>HCF</b> (Highest Common Factor): product of the <i>lowest</i> powers of primes <i>common</i> to both numbers.<br>' +
    '• Find the <b>LCM</b> (Lowest Common Multiple): product of the <i>highest</i> powers of all primes in either number.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Use a factor tree to find prime factors. Always give your answer using index notation. Write both numbers as products of prime factors first before finding HCF and LCM.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '1 is NOT a prime number. $\\sqrt{\\frac{9}{4}} = \\frac{3}{2}$ looks irrational but is actually rational.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>自然数</b>：用于计数的数：1, 2, 3, 4, ...<br>' +
    '• <b>整数</b>：正整数、负整数和零：..., $-2, -1, 0, 1, 2$, ...<br>' +
    '• <b>质数</b>：恰好有两个因数（1和本身）：2, 3, 5, 7, 11, 13, ... 注意：1 不是质数。<br>' +
    '• <b>平方数</b>：$1, 4, 9, 16, 25, 36, ...$（即 $n^2$）<br>' +
    '• <b>立方数</b>：$1, 8, 27, 64, 125, ...$（即 $n^3$）<br>' +
    '• <b>三角数</b>：$1, 3, 6, 10, 15, 21, ...$（依次加 2, 3, 4, 5, ...）<br>' +
    '• <b>有理数</b>：可写成 $\\frac{p}{q}$（$p, q$ 为整数，$q \\neq 0$）。所有有限小数和循环小数都是有理数。<br>' +
    '• <b>无理数</b>：不能写成分数。如 $\\pi$, $\\sqrt{2}$, $\\sqrt[3]{7}$。<br>' +
    '• <b>实数</b> = 有理数 + 无理数。<br>' +
    '• $n$ 的<b>倒数</b>是 $\\frac{1}{n}$；$\\frac{a}{b}$ 的倒数是 $\\frac{b}{a}$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 用因数树将整数写成<b>质因数乘积</b>，用指数表示，如 $504 = 2^3 \\times 3^2 \\times 7$。<br>' +
    '• <b>HCF</b>（最大公因数）：取公共质因数的最小幂次之积。<br>' +
    '• <b>LCM</b>（最小公倍数）：取所有质因数的最大幂次之积。<br><br>' +
    '<b>考试技巧</b><br>' +
    '用因数树分解质因数，答案用指数记法。求 HCF 和 LCM 前，先把两个数都写成质因数乘积。<br><br>' +
    '<b>注意！</b><br>' +
    '1 不是质数。$\\sqrt{\\frac{9}{4}} = \\frac{3}{2}$，看起来像无理数但其实是有理数。'
});

add('cie', '1.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Express 504 as the product of prime factors.<br><br>' +
    '<b>Solution:</b><br>' +
    'Divide by the smallest prime repeatedly:<br>' +
    '$504 \\div 2 = 252$<br>' +
    '$252 \\div 2 = 126$<br>' +
    '$126 \\div 2 = 63$<br>' +
    '$63 \\div 3 = 21$<br>' +
    '$21 \\div 3 = 7$<br>' +
    '$\\therefore 504 = 2^3 \\times 3^2 \\times 7$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Find the HCF and LCM of 60 and 504.<br><br>' +
    '<b>Solution:</b><br>' +
    '$60 = 2^2 \\times 3 \\times 5$<br>' +
    '$504 = 2^3 \\times 3^2 \\times 7$<br><br>' +
    'HCF = product of common primes with lowest powers:<br>' +
    '$\\text{HCF} = 2^2 \\times 3 = 12$<br><br>' +
    'LCM = product of all primes with highest powers:<br>' +
    '$\\text{LCM} = 2^3 \\times 3^2 \\times 5 \\times 7 = 2520$<br><br>' +
    '<b>Exam Tip:</b> Write both numbers as products of prime factors first. For HCF take the <i>lowest</i> powers of <i>common</i> primes. For LCM take the <i>highest</i> powers of <i>all</i> primes.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '将 504 表示为质因数的乘积。<br><br>' +
    '<b>解答：</b><br>' +
    '依次除以最小质数：<br>' +
    '$504 \\div 2 = 252$<br>' +
    '$252 \\div 2 = 126$<br>' +
    '$126 \\div 2 = 63$<br>' +
    '$63 \\div 3 = 21$<br>' +
    '$21 \\div 3 = 7$<br>' +
    '$\\therefore 504 = 2^3 \\times 3^2 \\times 7$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '求 60 和 504 的 HCF 和 LCM。<br><br>' +
    '<b>解答：</b><br>' +
    '$60 = 2^2 \\times 3 \\times 5$<br>' +
    '$504 = 2^3 \\times 3^2 \\times 7$<br><br>' +
    'HCF = 公共质因数取最小幂：<br>' +
    '$\\text{HCF} = 2^2 \\times 3 = 12$<br><br>' +
    'LCM = 所有质因数取最大幂：<br>' +
    '$\\text{LCM} = 2^3 \\times 3^2 \\times 5 \\times 7 = 2520$<br><br>' +
    '<b>考试技巧：</b>先把两个数写成质因数乘积。HCF 取<i>公共</i>质因数的<i>最小</i>幂，LCM 取<i>所有</i>质因数的<i>最大</i>幂。'
});

// ── 1.2 Sets and Venn diagrams ──
add('cie', '1.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>set</b> is a collection of items. Use curly brackets: $P = \\{2, 3, 5, 7\\}$.<br>' +
    '• $n(A)$ = number of elements in set $A$.<br>' +
    '• $\\in$ means "is an element of"; $\\notin$ means "is not an element of".<br>' +
    '• $\\varnothing$ or $\\{\\}$ = the <b>empty set</b> (no elements).<br>' +
    '• $\\mathcal{E}$ = the <b>universal set</b> (all elements under consideration).<br>' +
    '• $A \\subset B$ means "$A$ is a proper subset of $B$" ($A$ is inside $B$, but $A \\neq B$).<br>' +
    '• $A \\cap B$ = <b>intersection</b> (elements in <i>both</i> $A$ and $B$).<br>' +
    '• $A \\cup B$ = <b>union</b> (elements in $A$ <i>or</i> $B$ or both).<br>' +
    '• $A\'$ = <b>complement</b> of $A$ (elements NOT in $A$).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Draw and interpret <b>Venn diagrams</b> with 2 sets (Core) and 3 sets (Extended).<br>' +
    '• Shade regions representing unions, intersections, and complements.<br>' +
    '• Use the formula: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When filling a Venn diagram, always start with the <b>intersection</b> first. Then fill the remaining parts of each circle. Finally, calculate the number outside both circles.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$A \\cup B$ includes elements in the intersection. Do not double count when adding $n(A) + n(B)$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>集合</b>是一组元素的总体，用花括号表示：$P = \\{2, 3, 5, 7\\}$。<br>' +
    '• $n(A)$ = 集合 $A$ 的元素个数。<br>' +
    '• $\\in$ 表示"属于"；$\\notin$ 表示"不属于"。<br>' +
    '• $\\varnothing$ 或 $\\{\\}$ = <b>空集</b>。<br>' +
    '• $\\mathcal{E}$ = <b>全集</b>（讨论范围内所有元素）。<br>' +
    '• $A \\subset B$ 表示"$A$ 是 $B$ 的真子集"。<br>' +
    '• $A \\cap B$ = <b>交集</b>（同时属于 $A$ 和 $B$ 的元素）。<br>' +
    '• $A \\cup B$ = <b>并集</b>（属于 $A$ 或 $B$ 的所有元素）。<br>' +
    '• $A\'$ = $A$ 的<b>补集</b>（不属于 $A$ 的元素）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 画和解读 2 圈（Core）和 3 圈（Extended）<b>韦恩图</b>。<br>' +
    '• 给并集、交集、补集区域涂色。<br>' +
    '• 公式：$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '填韦恩图时，先填<b>交集</b>部分，再填各圆其余部分，最后算圈外的数。<br><br>' +
    '<b>注意！</b><br>' +
    '$A \\cup B$ 包含交集部分，$n(A) + n(B)$ 会重复计算交集，必须减去 $n(A \\cap B)$。'
});

add('cie', '1.2', 'examples', {
  content:
    '<b>Worked Example</b> [4 marks]<br>' +
    'In a class of 33 students, 20 like chess, 12 like draughts and 5 like neither.<br>' +
    '(a) Represent this information in a Venn diagram.<br>' +
    '(b) How many students like only one of chess or draughts?<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Students who like at least one = $33 - 5 = 28$<br>' +
    'Let $n(C \\cap D) = x$<br>' +
    '$n(C) + n(D) - n(C \\cap D) = 28$<br>' +
    '$20 + 12 - x = 28$<br>' +
    '$x = 4$<br><br>' +
    'Chess only: $20 - 4 = 16$<br>' +
    'Draughts only: $12 - 4 = 8$<br>' +
    'Intersection: $4$, Outside: $5$<br><br>' +
    '(b) Only one = $16 + 8 = 24$<br><br>' +
    '<b>Exam Tip:</b> Draw a Venn diagram with two overlapping circles. Add the "neither" group outside. Always start by finding the intersection.',
  content_zh:
    '<b>经典例题</b> [4 分]<br>' +
    '一个班 33 名学生中，20 人喜欢国际象棋，12 人喜欢跳棋，5 人两者都不喜欢。<br>' +
    '(a) 用韦恩图表示。<br>' +
    '(b) 只喜欢其中一项的有多少人？<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 至少喜欢一项的 = $33 - 5 = 28$<br>' +
    '设 $n(C \\cap D) = x$<br>' +
    '$20 + 12 - x = 28$<br>' +
    '$x = 4$<br><br>' +
    '只喜欢象棋：$20 - 4 = 16$<br>' +
    '只喜欢跳棋：$12 - 4 = 8$<br>' +
    '交集：$4$，圈外：$5$<br><br>' +
    '(b) 只喜欢一项 = $16 + 8 = 24$<br><br>' +
    '<b>考试技巧：</b>画两个重叠的圆，把"两者都不喜欢"放在圈外。从交集开始填。'
});

// ── 1.3 Powers and roots ──
add('cie', '1.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• $a^n$ means "$a$ multiplied by itself $n$ times".<br>' +
    '• $\\sqrt{a}$ = square root, $\\sqrt[3]{a}$ = cube root.<br><br>' +
    '<b>Index Laws</b><br>' +
    '• $a^m \\times a^n = a^{m+n}$<br>' +
    '• $a^m \\div a^n = a^{m-n}$<br>' +
    '• $(a^m)^n = a^{mn}$<br>' +
    '• $a^0 = 1$ (any non-zero number to the power 0 is 1)<br>' +
    '• $a^1 = a$<br><br>' +
    '<b>Extended Only</b><br>' +
    '• $a^{-n} = \\frac{1}{a^n}$ (negative index = reciprocal)<br>' +
    '• $a^{\\frac{1}{n}} = \\sqrt[n]{a}$ (fractional index = root)<br>' +
    '• $a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m = \\sqrt[n]{a^m}$<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Simplify expressions using index laws.<br>' +
    '• Evaluate negative and fractional indices without a calculator.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$2^3 = 8$, not $6$. A negative index does NOT make the number negative: $2^{-3} = \\frac{1}{8}$, not $-8$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• $a^n$ 表示"$a$ 自乘 $n$ 次"。<br>' +
    '• $\\sqrt{a}$ = 平方根，$\\sqrt[3]{a}$ = 立方根。<br><br>' +
    '<b>指数法则</b><br>' +
    '• $a^m \\times a^n = a^{m+n}$（同底相乘，指数相加）<br>' +
    '• $a^m \\div a^n = a^{m-n}$（同底相除，指数相减）<br>' +
    '• $(a^m)^n = a^{mn}$（幂的幂，指数相乘）<br>' +
    '• $a^0 = 1$（任何非零数的零次方等于 1）<br><br>' +
    '<b>Extended 扩展内容</b><br>' +
    '• $a^{-n} = \\frac{1}{a^n}$（负指数 = 倒数）<br>' +
    '• $a^{\\frac{1}{n}} = \\sqrt[n]{a}$（分数指数 = 根号）<br>' +
    '• $a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m$<br><br>' +
    '<b>注意！</b><br>' +
    '$2^3 = 8$，不是 $6$。负指数不代表负数：$2^{-3} = \\frac{1}{8}$，不是 $-8$。'
});

add('cie', '1.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Simplify $\\frac{6x^5 \\times 2x^3}{4x^2}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$= \\frac{12x^{5+3}}{4x^2} = \\frac{12x^8}{4x^2} = 3x^{8-2} = 3x^6$<br><br>' +
    '<b>Worked Example 2</b> (Extended) [3 marks]<br>' +
    'Evaluate without a calculator:<br>' +
    '(a) $27^{\\frac{2}{3}}$ &nbsp;&nbsp; (b) $16^{-\\frac{3}{4}}$<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9$<br><br>' +
    '(b) $16^{-\\frac{3}{4}} = \\frac{1}{16^{\\frac{3}{4}}} = \\frac{1}{(\\sqrt[4]{16})^3} = \\frac{1}{2^3} = \\frac{1}{8}$<br><br>' +
    '<b>Exam Tip:</b> For fractional indices, find the root FIRST (denominator), then raise to the power (numerator). This keeps the numbers small.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '化简 $\\frac{6x^5 \\times 2x^3}{4x^2}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$= \\frac{12x^{8}}{4x^2} = 3x^{6}$<br><br>' +
    '<b>经典例题 2</b>（Extended）[3 分]<br>' +
    '不用计算器求值：<br>' +
    '(a) $27^{\\frac{2}{3}}$ &nbsp;&nbsp; (b) $16^{-\\frac{3}{4}}$<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9$<br><br>' +
    '(b) $16^{-\\frac{3}{4}} = \\frac{1}{(\\sqrt[4]{16})^3} = \\frac{1}{2^3} = \\frac{1}{8}$<br><br>' +
    '<b>考试技巧：</b>分数指数先开根（分母），再乘方（分子），数字更小更好算。'
});

// ── 1.4 Directed numbers ──
add('cie', '1.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Directed numbers</b> include positive and negative numbers, used for temperature, altitude, debt, etc.<br>' +
    '• On a number line, numbers increase to the right: $-3 < -1 < 0 < 2 < 5$.<br><br>' +
    '<b>Rules for Operations</b><br>' +
    '• Adding a negative = subtracting: $5 + (-3) = 5 - 3 = 2$<br>' +
    '• Subtracting a negative = adding: $5 - (-3) = 5 + 3 = 8$<br>' +
    '• Multiplying/dividing same signs = positive: $(-4) \\times (-3) = +12$<br>' +
    '• Multiplying/dividing different signs = negative: $(-4) \\times 3 = -12$<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Two signs next to each other: same signs → positive, different signs → negative.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>有向数</b>包括正数和负数，用于温度、海拔、债务等。<br>' +
    '• 数轴上从左到右递增：$-3 < -1 < 0 < 2 < 5$。<br><br>' +
    '<b>运算规则</b><br>' +
    '• 加负数 = 减：$5 + (-3) = 2$<br>' +
    '• 减负数 = 加：$5 - (-3) = 8$<br>' +
    '• 同号相乘/除 = 正：$(-4) \\times (-3) = +12$<br>' +
    '• 异号相乘/除 = 负：$(-4) \\times 3 = -12$<br><br>' +
    '<b>考试技巧</b><br>' +
    '两个符号相邻：同号得正，异号得负。'
});

add('cie', '1.4', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'The temperature at midnight is $-5°C$. By 6am it has dropped by $3°C$. By noon it has risen by $11°C$. Find the temperature at noon.<br><br>' +
    '<b>Solution:</b><br>' +
    'At 6am: $-5 - 3 = -8°C$<br>' +
    'At noon: $-8 + 11 = 3°C$<br><br>' +
    '<b>Exam Tip:</b> Use a number line if you find directed number calculations confusing. "Drop by" means subtract, "rise by" means add.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '午夜温度为 $-5°C$，到早上6点下降了 $3°C$，到中午又上升了 $11°C$。求中午温度。<br><br>' +
    '<b>解答：</b><br>' +
    '早上6点：$-5 - 3 = -8°C$<br>' +
    '中午：$-8 + 11 = 3°C$<br><br>' +
    '<b>考试技巧：</b>"下降"用减法，"上升"用加法。可以借助数轴来思考。'
});

// ── 1.5 Fractions, decimals and percentages ──
add('cie', '1.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>proper fraction</b> has numerator < denominator: $\\frac{3}{5}$.<br>' +
    '• An <b>improper fraction</b> has numerator ≥ denominator: $\\frac{7}{4}$.<br>' +
    '• A <b>mixed number</b> combines an integer and a proper fraction: $1\\frac{3}{4}$.<br>' +
    '• To convert between: $1\\frac{3}{4} = \\frac{4 \\times 1 + 3}{4} = \\frac{7}{4}$.<br><br>' +
    '<b>Conversions</b><br>' +
    '• Fraction → Decimal: divide numerator by denominator.<br>' +
    '• Decimal → Percentage: multiply by 100.<br>' +
    '• Fraction → Percentage: $\\frac{a}{b} \\times 100\\%$.<br><br>' +
    '<b>Extended Only</b><br>' +
    '• Converting <b>recurring decimals</b> to fractions:<br>' +
    'Let $x = 0.\\dot{3} = 0.333...$<br>' +
    '$10x = 3.333...$<br>' +
    '$10x - x = 3$, so $9x = 3$, hence $x = \\frac{1}{3}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Add/subtract fractions: find a common denominator.<br>' +
    '• Multiply fractions: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$ (simplify first if possible).<br>' +
    '• Divide fractions: multiply by the reciprocal: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When adding fractions, do NOT add the denominators. Find a common denominator first.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>真分数</b>：分子 < 分母，如 $\\frac{3}{5}$。<br>' +
    '• <b>假分数</b>：分子 ≥ 分母，如 $\\frac{7}{4}$。<br>' +
    '• <b>带分数</b>：整数+真分数，如 $1\\frac{3}{4}$。<br>' +
    '• 互化：$1\\frac{3}{4} = \\frac{7}{4}$。<br><br>' +
    '<b>相互转换</b><br>' +
    '• 分数→小数：分子÷分母。<br>' +
    '• 小数→百分数：×100。<br>' +
    '• 分数→百分数：$\\frac{a}{b} \\times 100\\%$。<br><br>' +
    '<b>Extended 扩展</b><br>' +
    '• <b>循环小数</b>转分数：<br>' +
    '设 $x = 0.\\dot{3}$，则 $10x = 3.\\dot{3}$，$9x = 3$，$x = \\frac{1}{3}$。<br><br>' +
    '<b>注意！</b><br>' +
    '分数相加时不能直接加分母，必须先通分。'
});

add('cie', '1.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Calculate $2\\frac{1}{3} \\times 1\\frac{2}{5}$. Give your answer as a mixed number.<br><br>' +
    '<b>Solution:</b><br>' +
    'Convert to improper fractions: $\\frac{7}{3} \\times \\frac{7}{5} = \\frac{49}{15} = 3\\frac{4}{15}$<br><br>' +
    '<b>Worked Example 2</b> (Extended) [3 marks]<br>' +
    'Convert $0.1\\dot{5}\\dot{4}$ to a fraction.<br><br>' +
    '<b>Solution:</b><br>' +
    'Let $x = 0.1545454...$<br>' +
    '$10x = 1.545454...$<br>' +
    '$1000x = 154.5454...$<br>' +
    '$1000x - 10x = 153$<br>' +
    '$990x = 153$<br>' +
    '$x = \\frac{153}{990} = \\frac{17}{110}$<br><br>' +
    '<b>Exam Tip:</b> For recurring decimals, multiply by powers of 10 so that the recurring parts align, then subtract to eliminate the repeating digits.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '计算 $2\\frac{1}{3} \\times 1\\frac{2}{5}$，用带分数表示。<br><br>' +
    '<b>解答：</b><br>' +
    '化为假分数：$\\frac{7}{3} \\times \\frac{7}{5} = \\frac{49}{15} = 3\\frac{4}{15}$<br><br>' +
    '<b>经典例题 2</b>（Extended）[3 分]<br>' +
    '将 $0.1\\dot{5}\\dot{4}$ 化为分数。<br><br>' +
    '<b>解答：</b><br>' +
    '设 $x = 0.1545454...$<br>' +
    '$10x = 1.545454...$<br>' +
    '$1000x = 154.5454...$<br>' +
    '$990x = 153$<br>' +
    '$x = \\frac{153}{990} = \\frac{17}{110}$<br><br>' +
    '<b>考试技巧：</b>循环小数转分数时，乘以合适的 10 的幂使循环部分对齐，然后相减消去循环部分。'
});

// ── 1.6 Order of operations ──
add('cie', '1.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    'The standard order of operations is <b>BIDMAS</b> (or BODMAS):<br>' +
    '1. <b>B</b>rackets<br>' +
    '2. <b>I</b>ndices (powers and roots)<br>' +
    '3. <b>D</b>ivision and <b>M</b>ultiplication (equal priority, left to right)<br>' +
    '4. <b>A</b>ddition and <b>S</b>ubtraction (equal priority, left to right)<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Always work out brackets first.<br>' +
    '• Multiplication and division have EQUAL priority — work left to right.<br>' +
    '• Addition and subtraction have EQUAL priority — work left to right.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$6 \\div 2(1+2) = 6 \\div 2 \\times 3 = 9$, not $1$. After brackets, division and multiplication are done left to right.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '运算顺序 <b>BIDMAS</b>：<br>' +
    '1. <b>B</b>rackets（括号）<br>' +
    '2. <b>I</b>ndices（指数）<br>' +
    '3. <b>D</b>ivision / <b>M</b>ultiplication（乘除，优先级相同，从左到右）<br>' +
    '4. <b>A</b>ddition / <b>S</b>ubtraction（加减，优先级相同，从左到右）<br><br>' +
    '<b>注意！</b><br>' +
    '乘和除优先级相同，从左到右计算；加和减同理。'
});

add('cie', '1.6', 'examples', {
  content:
    '<b>Worked Example</b> [2 marks]<br>' +
    'Calculate $3 + 4 \\times (8 - 2)^2 \\div 9$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Brackets: $8 - 2 = 6$<br>' +
    'Indices: $6^2 = 36$<br>' +
    'Multiply: $4 \\times 36 = 144$<br>' +
    'Divide: $144 \\div 9 = 16$<br>' +
    'Add: $3 + 16 = 19$<br><br>' +
    '<b>Exam Tip:</b> Show each step clearly. Examiners award marks for correct working even if the final answer is wrong.',
  content_zh:
    '<b>经典例题</b> [2 分]<br>' +
    '计算 $3 + 4 \\times (8 - 2)^2 \\div 9$。<br><br>' +
    '<b>解答：</b><br>' +
    '括号：$8 - 2 = 6$<br>' +
    '指数：$6^2 = 36$<br>' +
    '乘法：$4 \\times 36 = 144$<br>' +
    '除法：$144 \\div 9 = 16$<br>' +
    '加法：$3 + 16 = 19$<br><br>' +
    '<b>考试技巧：</b>每一步都写清楚，即使最终答案错了也能拿步骤分。'
});

// ── 1.7 Bounds and rounding ──
add('cie', '1.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Decimal places (d.p.)</b>: count digits after the decimal point. $3.146 \\approx 3.15$ (2 d.p.).<br>' +
    '• <b>Significant figures (s.f.)</b>: count from the first non-zero digit. $0.003047 \\approx 0.00305$ (3 s.f.).<br>' +
    '• When rounding, look at the next digit: if 5 or more, round up; otherwise, round down.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Round to a specified number of decimal places or significant figures.<br>' +
    '• Understand trailing zeros: $2.30$ (2 d.p.) is not the same accuracy as $2.3$ (1 d.p.).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For significant figures, zeros at the start are NOT significant: $0.00304$ has 3 s.f. Zeros in the middle ARE significant: $3004$ has 4 s.f.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>小数位(d.p.)</b>：小数点后的位数。$3.146 \\approx 3.15$（2 d.p.）。<br>' +
    '• <b>有效数字(s.f.)</b>：从第一个非零数字开始计数。$0.003047 \\approx 0.00305$（3 s.f.）。<br>' +
    '• 四舍五入：看下一位，≥5 则进位。<br><br>' +
    '<b>考试技巧</b><br>' +
    '有效数字中，开头的零不算：$0.00304$ 是 3 个有效数字。中间的零要算：$3004$ 是 4 个有效数字。'
});

add('cie', '1.7', 'examples', {
  content:
    '<b>Worked Example</b> [2 marks]<br>' +
    'Write 0.06372 correct to (a) 2 decimal places, (b) 2 significant figures.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) 2 d.p.: look at the 3rd decimal digit (3), which is < 5, so round down: $0.06$<br>' +
    '(b) 2 s.f.: first significant digit is 6, second is 3. Next digit is 7 ≥ 5, round up: $0.064$<br><br>' +
    '<b>Exam Tip:</b> Always write down what degree of accuracy you\'re rounding to when asked for "a reasonable degree of accuracy".',
  content_zh:
    '<b>经典例题</b> [2 分]<br>' +
    '将 0.06372 分别精确到 (a) 2 位小数，(b) 2 位有效数字。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 2 d.p.：第3位小数是 3 < 5，舍去：$0.06$<br>' +
    '(b) 2 s.f.：第1个有效数字是 6，第2个是 3，下一位 7 ≥ 5，进位：$0.064$'
});

// ── 1.8 Standard form ──
add('cie', '1.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '<b>Standard form</b> is $A \\times 10^n$ where $1 \\leq A < 10$ and $n$ is an integer.<br>' +
    '• Large numbers: $n$ is positive. E.g. $345000 = 3.45 \\times 10^5$.<br>' +
    '• Small numbers: $n$ is negative. E.g. $0.0023 = 2.3 \\times 10^{-3}$.<br><br>' +
    '<b>Calculating in Standard Form</b><br>' +
    '• Multiply: multiply the $A$ values and add the powers. $(3 \\times 10^4) \\times (2 \\times 10^3) = 6 \\times 10^7$.<br>' +
    '• Divide: divide the $A$ values and subtract the powers.<br>' +
    '• Add/Subtract: convert to the same power of 10 first, or convert to ordinary numbers.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'If $A \\geq 10$ after calculation, adjust: $12 \\times 10^3 = 1.2 \\times 10^4$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '<b>标准式</b>：$A \\times 10^n$，其中 $1 \\leq A < 10$，$n$ 为整数。<br>' +
    '• 大数：$n$ 为正。如 $345000 = 3.45 \\times 10^5$。<br>' +
    '• 小数：$n$ 为负。如 $0.0023 = 2.3 \\times 10^{-3}$。<br><br>' +
    '<b>标准式运算</b><br>' +
    '• 乘法：$A$ 相乘，指数相加。<br>' +
    '• 除法：$A$ 相除，指数相减。<br>' +
    '• 加减法：先统一为相同的 $10^n$。<br><br>' +
    '<b>注意！</b><br>' +
    '计算后若 $A \\geq 10$，需调整：$12 \\times 10^3 = 1.2 \\times 10^4$。'
});

add('cie', '1.8', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'Calculate $\\frac{3.6 \\times 10^5}{4.5 \\times 10^{-2}}$. Give your answer in standard form.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\frac{3.6}{4.5} = 0.8$<br>' +
    '$10^{5-(-2)} = 10^7$<br>' +
    '$0.8 \\times 10^7 = 8 \\times 10^6$<br><br>' +
    '<b>Exam Tip:</b> Remember to adjust if $A < 1$ or $A \\geq 10$. Here $0.8$ became $8$ and the power decreased by 1.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '计算 $\\frac{3.6 \\times 10^5}{4.5 \\times 10^{-2}}$，用标准式表示。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\frac{3.6}{4.5} = 0.8$<br>' +
    '$10^{5-(-2)} = 10^7$<br>' +
    '$0.8 \\times 10^7 = 8 \\times 10^6$<br><br>' +
    '<b>考试技巧：</b>若 $A < 1$ 或 $A \\geq 10$，需调整。这里 $0.8$ 变为 $8$，幂次减 1。'
});

// ── 1.9 Four operations ──
add('cie', '1.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    'The four operations are <b>addition, subtraction, multiplication and division</b>, applied to integers, fractions and decimals.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Follow BIDMAS when multiple operations appear.<br>' +
    '• Converting mixed numbers to improper fractions before multiplying/dividing.<br>' +
    '• Long multiplication and division without a calculator.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Show all working. In non-calculator questions, you must demonstrate the method clearly.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '四则运算：<b>加、减、乘、除</b>，适用于整数、分数和小数。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 多种运算混合时遵循 BIDMAS。<br>' +
    '• 分数乘除前先化为假分数。<br>' +
    '• 不用计算器时要会竖式计算。<br><br>' +
    '<b>考试技巧</b><br>' +
    '写出所有步骤。非计算器题必须展示方法。'
});

add('cie', '1.9', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'Without a calculator, work out $2\\frac{3}{4} \\div 1\\frac{1}{3}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Convert: $\\frac{11}{4} \\div \\frac{4}{3}$<br>' +
    'Multiply by reciprocal: $\\frac{11}{4} \\times \\frac{3}{4} = \\frac{33}{16} = 2\\frac{1}{16}$<br><br>' +
    '<b>Exam Tip:</b> To divide fractions, flip the second fraction and multiply. Always simplify your answer.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '不用计算器，计算 $2\\frac{3}{4} \\div 1\\frac{1}{3}$。<br><br>' +
    '<b>解答：</b><br>' +
    '化为假分数：$\\frac{11}{4} \\div \\frac{4}{3}$<br>' +
    '乘倒数：$\\frac{11}{4} \\times \\frac{3}{4} = \\frac{33}{16} = 2\\frac{1}{16}$<br><br>' +
    '<b>考试技巧：</b>分数除法 = 乘以倒数。结果要化简。'
});

// ── 1.10 Estimation ──
add('cie', '1.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Estimation</b> means rounding numbers to make a calculation easier (usually to 1 significant figure).<br>' +
    '• Use ≈ to show an approximate answer.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Round each number in the calculation to 1 s.f., then calculate.<br>' +
    '• Use estimation to check if your calculator answer is sensible.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'The question will say "by rounding each number to 1 significant figure" or "estimate the value of". You MUST show the rounded values, not just the answer.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>估算</b>：将数字取整（通常取 1 位有效数字）使计算更简单。<br>' +
    '• 用 ≈ 表示近似值。<br><br>' +
    '<b>考试技巧</b><br>' +
    '题目说"估算"时，必须写出取整后的数值，不能只写最终答案。'
});

add('cie', '1.10', 'examples', {
  content:
    '<b>Worked Example</b> [2 marks]<br>' +
    'By rounding each number to 1 significant figure, estimate $\\frac{4.87 \\times 21.3}{0.509}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\approx \\frac{5 \\times 20}{0.5} = \\frac{100}{0.5} = 200$<br><br>' +
    '<b>Exam Tip:</b> Show the rounded values clearly. The actual answer is about 203.9, so the estimate of 200 is reasonable.',
  content_zh:
    '<b>经典例题</b> [2 分]<br>' +
    '将每个数取 1 位有效数字，估算 $\\frac{4.87 \\times 21.3}{0.509}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\approx \\frac{5 \\times 20}{0.5} = \\frac{100}{0.5} = 200$<br><br>' +
    '<b>考试技巧：</b>要清楚写出取整后的数。精确值约 203.9，估算值 200 合理。'
});

// ── 1.11 Limits of accuracy (Extended only) ──
add('cie', '1.11', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• When a value is rounded, the true value lies within a range called the <b>bounds</b>.<br>' +
    '• <b>Lower bound (LB)</b> = smallest possible value. <b>Upper bound (UB)</b> = largest possible value.<br>' +
    '• For a value rounded to the nearest unit, the error is ±0.5 units.<br><br>' +
    '<b>Rules</b><br>' +
    '• $x = 4.5$ (1 d.p.) → LB = $4.45$, UB = $4.55$<br>' +
    '• $x = 300$ (nearest 100) → LB = $250$, UB = $350$<br><br>' +
    '<b>Bounds in Calculations</b><br>' +
    '• Maximum of $a + b$: use UB of both.<br>' +
    '• Minimum of $a + b$: use LB of both.<br>' +
    '• Maximum of $a - b$: UB of $a$, LB of $b$.<br>' +
    '• Maximum of $a \\times b$: UB of both.<br>' +
    '• Maximum of $\\frac{a}{b}$: UB of $a$, LB of $b$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'The upper bound is NOT included. We write: $4.45 \\leq x < 4.55$.',
  content_zh:
    '<b>仅 Extended</b><br><br>' +
    '<b>知识回顾</b><br>' +
    '• 数值取整后，真值在一个范围内，称为<b>界限</b>。<br>' +
    '• <b>下界(LB)</b> = 最小可能值，<b>上界(UB)</b> = 最大可能值。<br>' +
    '• 四舍五入到最近整数时，误差为 ±0.5。<br><br>' +
    '<b>计算中的界限</b><br>' +
    '• $a + b$ 的最大值：两者都取上界。<br>' +
    '• $a - b$ 的最大值：$a$ 取上界，$b$ 取下界。<br>' +
    '• $\\frac{a}{b}$ 的最大值：$a$ 取上界，$b$ 取下界。<br><br>' +
    '<b>注意！</b><br>' +
    '上界不包含在内。写法：$4.45 \\leq x < 4.55$。'
});

add('cie', '1.11', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    '$p = 4.3$ correct to 1 decimal place. $q = 0.72$ correct to 2 decimal places.<br>' +
    'Calculate the upper bound of $\\frac{p}{q}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$p$: LB = $4.25$, UB = $4.35$<br>' +
    '$q$: LB = $0.715$, UB = $0.725$<br><br>' +
    'Upper bound of $\\frac{p}{q}$ = $\\frac{\\text{UB of } p}{\\text{LB of } q} = \\frac{4.35}{0.715} = 6.08...$<br><br>' +
    '<b>Exam Tip:</b> For maximum of a fraction, make the top as BIG as possible and the bottom as SMALL as possible.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '$p = 4.3$（精确到 1 位小数），$q = 0.72$（精确到 2 位小数）。<br>' +
    '求 $\\frac{p}{q}$ 的上界。<br><br>' +
    '<b>解答：</b><br>' +
    '$p$: 下界 = $4.25$, 上界 = $4.35$<br>' +
    '$q$: 下界 = $0.715$, 上界 = $0.725$<br><br>' +
    '$\\frac{p}{q}$ 的上界 = $\\frac{4.35}{0.715} = 6.08...$<br><br>' +
    '<b>考试技巧：</b>分数要最大→分子取上界，分母取下界。'
});

// ── 1.12 Ratio and proportion ──
add('cie', '1.12', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>ratio</b> compares quantities: $a : b$. Simplify by dividing by common factors.<br>' +
    '• To <b>divide a quantity in a ratio</b> $a : b$: total parts = $a + b$, each part = total ÷ (a+b).<br><br>' +
    '<b>Direct Proportion</b><br>' +
    '• When $y$ is directly proportional to $x$: as $x$ increases, $y$ increases at the same rate.<br>' +
    '• Use the <b>unitary method</b>: find the value of 1 unit first.<br><br>' +
    '<b>Extended Only</b><br>' +
    '• Increase a quantity by ratio $m : n$: multiply by $\\frac{m}{n}$.<br>' +
    '• Decrease a quantity by ratio $n : m$ (where $n < m$): multiply by $\\frac{n}{m}$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always check your answer: the parts should add up to the total. Ratios should be in whole numbers.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>比</b>：$a : b$，除以公因数化简。<br>' +
    '• <b>按比分配</b>：总份数 = $a + b$，每份 = 总量 ÷ 总份数。<br><br>' +
    '<b>正比例</b><br>' +
    '• $y$ 与 $x$ 正比：$x$ 增大，$y$ 同比例增大。<br>' +
    '• 用<b>单位量法</b>：先求1单位的值。<br><br>' +
    '<b>Extended 扩展</b><br>' +
    '• 按比 $m : n$ 增大：乘以 $\\frac{m}{n}$。<br>' +
    '• 按比 $n : m$（$n < m$）减小：乘以 $\\frac{n}{m}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '检查答案：各部分之和应等于总量。比要化为整数。'
});

add('cie', '1.12', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'Divide $\\$480$ in the ratio $3 : 5$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total parts = $3 + 5 = 8$<br>' +
    'One part = $480 \\div 8 = \\$60$<br>' +
    'First share = $3 \\times 60 = \\$180$<br>' +
    'Second share = $5 \\times 60 = \\$300$<br>' +
    'Check: $180 + 300 = 480$ ✓<br><br>' +
    '<b>Exam Tip:</b> Always verify that your parts add up to the original total.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '将 $\\$480$ 按 $3 : 5$ 分配。<br><br>' +
    '<b>解答：</b><br>' +
    '总份数 = $3 + 5 = 8$<br>' +
    '每份 = $480 \\div 8 = \\$60$<br>' +
    '第一份 = $3 \\times 60 = \\$180$<br>' +
    '第二份 = $5 \\times 60 = \\$300$<br>' +
    '验证：$180 + 300 = 480$ ✓'
});

// ── 1.13 Percentages ──
add('cie', '1.13', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Percentage of a quantity: $\\frac{\\text{percentage}}{100} \\times \\text{quantity}$.<br>' +
    '• One quantity as a percentage of another: $\\frac{\\text{part}}{\\text{whole}} \\times 100\\%$.<br>' +
    '• <b>Percentage increase</b>: multiply by $(1 + \\frac{r}{100})$, e.g. increase by 15%: $\\times 1.15$.<br>' +
    '• <b>Percentage decrease</b>: multiply by $(1 - \\frac{r}{100})$, e.g. decrease by 20%: $\\times 0.8$.<br><br>' +
    '<b>Simple Interest</b>: $I = \\frac{PRT}{100}$ (same interest each year).<br>' +
    '<b>Compound Interest</b>: $A = P(1 + \\frac{r}{100})^n$ (interest on interest).<br><br>' +
    '<b>Extended Only</b><br>' +
    '• <b>Reverse percentage</b>: if a price after 20% increase is $\\$144$, the original = $\\frac{144}{1.2} = \\$120$.<br>' +
    '• <b>Repeated percentage change</b>: use $(1 \\pm \\frac{r}{100})^n$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'For reverse percentage, do NOT calculate the percentage of the new amount. Divide by the multiplier instead.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 求百分比：$\\frac{\\text{百分数}}{100} \\times \\text{数量}$。<br>' +
    '• <b>百分比增加</b>：乘以 $(1 + \\frac{r}{100})$，如增加 15%：$\\times 1.15$。<br>' +
    '• <b>百分比减少</b>：乘以 $(1 - \\frac{r}{100})$，如减少 20%：$\\times 0.8$。<br><br>' +
    '<b>单利</b>：$I = \\frac{PRT}{100}$。<br>' +
    '<b>复利</b>：$A = P(1 + \\frac{r}{100})^n$。<br><br>' +
    '<b>Extended 扩展</b><br>' +
    '• <b>逆百分比</b>：涨价 20% 后为 $\\$144$，原价 = $\\frac{144}{1.2} = \\$120$。<br>' +
    '• <b>重复百分比变化</b>：$(1 \\pm \\frac{r}{100})^n$。<br><br>' +
    '<b>注意！</b><br>' +
    '逆百分比不是算新金额的百分比，而是除以乘数。'
});

add('cie', '1.13', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'A laptop costs $\\$850$. It is reduced by 15%. Find the sale price.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiplier = $1 - 0.15 = 0.85$<br>' +
    'Sale price = $850 \\times 0.85 = \\$722.50$<br><br>' +
    '<b>Worked Example 2</b> (Extended) [3 marks]<br>' +
    '$\\$5000$ is invested at 3% compound interest per year. Find the value after 4 years.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = 5000 \\times (1.03)^4 = 5000 \\times 1.1255... = \\$5627.54$<br><br>' +
    '<b>Exam Tip:</b> Use the multiplier method for percentage changes — it\'s faster and less error-prone than calculating the percentage separately.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '一台笔记本原价 $\\$850$，打 85 折（降价 15%）。求售价。<br><br>' +
    '<b>解答：</b><br>' +
    '乘数 = $1 - 0.15 = 0.85$<br>' +
    '售价 = $850 \\times 0.85 = \\$722.50$<br><br>' +
    '<b>经典例题 2</b>（Extended）[3 分]<br>' +
    '$\\$5000$ 以年利率 3% 复利投资。求 4 年后的价值。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = 5000 \\times (1.03)^4 = \\$5627.54$<br><br>' +
    '<b>考试技巧：</b>用乘数法处理百分比变化，比分步计算更快更准。'
});

// ── 1.14 Using a calculator (Core only) ──
add('cie', '1.14', 'knowledge', {
  content:
    '<b>Core Only</b><br><br>' +
    '<b>Key Skills</b><br>' +
    '• Use a scientific calculator efficiently for complex calculations.<br>' +
    '• Use brackets on the calculator to ensure correct order of operations.<br>' +
    '• Use the fraction button to enter and convert fractions.<br>' +
    '• Check answers by estimation or inverse operations.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When using a calculator, always write down intermediate steps. If you just write the final answer and it\'s wrong, you get zero marks.',
  content_zh:
    '<b>仅 Core</b><br><br>' +
    '<b>关键技能</b><br>' +
    '• 熟练使用科学计算器。<br>' +
    '• 用括号确保运算顺序正确。<br>' +
    '• 用分数键输入和转换分数。<br>' +
    '• 用估算或逆运算检查答案。<br><br>' +
    '<b>考试技巧</b><br>' +
    '使用计算器时也要写中间步骤，只写最终答案可能得零分。'
});

add('cie', '1.14', 'examples', {
  content:
    '<b>Worked Example</b> [2 marks]<br>' +
    'Use a calculator to find $\\frac{3.7^2 + \\sqrt{19.6}}{2.1 - 0.84}$. Give your answer correct to 3 significant figures.<br><br>' +
    '<b>Solution:</b><br>' +
    'Numerator: $3.7^2 + \\sqrt{19.6} = 13.69 + 4.427... = 18.117...$<br>' +
    'Denominator: $2.1 - 0.84 = 1.26$<br>' +
    '$\\frac{18.117...}{1.26} = 14.379... \\approx 14.4$ (3 s.f.)<br><br>' +
    '<b>Exam Tip:</b> Use brackets around the numerator and denominator when entering into your calculator: $(3.7^2 + \\sqrt{19.6}) \\div (2.1 - 0.84)$.',
  content_zh:
    '<b>经典例题</b> [2 分]<br>' +
    '用计算器求 $\\frac{3.7^2 + \\sqrt{19.6}}{2.1 - 0.84}$，精确到 3 位有效数字。<br><br>' +
    '<b>解答：</b><br>' +
    '分子：$3.7^2 + \\sqrt{19.6} = 18.117...$<br>' +
    '分母：$2.1 - 0.84 = 1.26$<br>' +
    '$\\frac{18.117...}{1.26} \\approx 14.4$（3 s.f.）<br><br>' +
    '<b>考试技巧：</b>输入计算器时给分子和分母加括号。'
});

// ── 1.15 Time, speed and rates ──
add('cie', '1.15', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Speed</b> = $\\frac{\\text{distance}}{\\text{time}}$, <b>Distance</b> = speed × time, <b>Time</b> = $\\frac{\\text{distance}}{\\text{speed}}$.<br>' +
    '• <b>Average speed</b> = $\\frac{\\text{total distance}}{\\text{total time}}$ (NOT the average of two speeds).<br>' +
    '• Convert between 12-hour and 24-hour clock. E.g. 2:30 pm = 14:30.<br><br>' +
    '<b>Extended Only</b><br>' +
    '• <b>Compound measures</b>: speed (km/h), density ($\\text{g/cm}^3$), pressure ($\\text{N/m}^2$), population density (people/km²).<br>' +
    '• Density = $\\frac{\\text{mass}}{\\text{volume}}$, Pressure = $\\frac{\\text{force}}{\\text{area}}$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Average speed is NOT the mean of two speeds. You must use total distance ÷ total time.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>速度</b> = $\\frac{\\text{路程}}{\\text{时间}}$。<br>' +
    '• <b>平均速度</b> = $\\frac{\\text{总路程}}{\\text{总时间}}$（不是两个速度的平均值）。<br>' +
    '• 12/24 小时制转换：下午 2:30 = 14:30。<br><br>' +
    '<b>Extended 扩展</b><br>' +
    '• 密度 = $\\frac{\\text{质量}}{\\text{体积}}$，压强 = $\\frac{\\text{力}}{\\text{面积}}$。<br><br>' +
    '<b>注意！</b><br>' +
    '平均速度 ≠ 两个速度的算术平均值，必须用总路程÷总时间。'
});

add('cie', '1.15', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'A train travels 50 km at 40 km/h, then 60 km at 30 km/h. Find the average speed for the whole journey, to 3 s.f.<br><br>' +
    '<b>Solution:</b><br>' +
    'Time 1 = $\\frac{50}{40} = 1.25$ hours<br>' +
    'Time 2 = $\\frac{60}{30} = 2$ hours<br>' +
    'Total distance = $50 + 60 = 110$ km<br>' +
    'Total time = $1.25 + 2 = 3.25$ hours<br>' +
    'Average speed = $\\frac{110}{3.25} = 33.8$ km/h (3 s.f.)<br><br>' +
    '<b>Exam Tip:</b> Find each time separately, then use total distance ÷ total time.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '火车先以 40 km/h 走了 50 km，再以 30 km/h 走了 60 km。求全程平均速度（3 s.f.）。<br><br>' +
    '<b>解答：</b><br>' +
    '第1段时间 = $\\frac{50}{40} = 1.25$ 小时<br>' +
    '第2段时间 = $\\frac{60}{30} = 2$ 小时<br>' +
    '总路程 = $110$ km，总时间 = $3.25$ 小时<br>' +
    '平均速度 = $\\frac{110}{3.25} = 33.8$ km/h'
});

// ── 1.16 Money and finance ──
add('cie', '1.16', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Currency conversion</b>: multiply or divide by the exchange rate.<br>' +
    '• <b>Profit</b> = selling price − cost price. <b>Loss</b> = cost price − selling price.<br>' +
    '• <b>Discount</b>: reduction from the original price (use percentage decrease).<br>' +
    '• <b>Simple interest</b>: $I = \\frac{PRT}{100}$ (P = principal, R = rate%, T = time in years).<br>' +
    '• <b>Compound interest</b>: $A = P(1 + \\frac{r}{100})^n$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Read currency questions carefully — check which direction you are converting (multiply or divide by the rate).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>汇率换算</b>：乘以或除以汇率。<br>' +
    '• <b>利润</b> = 售价 − 成本。<b>亏损</b> = 成本 − 售价。<br>' +
    '• <b>折扣</b>：从原价降价（用百分比减少法）。<br>' +
    '• <b>单利</b>：$I = \\frac{PRT}{100}$。<br>' +
    '• <b>复利</b>：$A = P(1 + \\frac{r}{100})^n$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '汇率题要看清转换方向（乘还是除）。'
});

add('cie', '1.16', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'A shop buys a coat for $\\$40$ and sells it for $\\$52$. Calculate the percentage profit.<br><br>' +
    '<b>Solution:</b><br>' +
    'Profit = $52 - 40 = \\$12$<br>' +
    'Percentage profit = $\\frac{12}{40} \\times 100 = 30\\%$<br><br>' +
    '<b>Exam Tip:</b> Percentage profit/loss is always calculated as a percentage of the COST price, not the selling price.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '商店以 $\\$40$ 进货，$\\$52$ 出售。求利润百分比。<br><br>' +
    '<b>解答：</b><br>' +
    '利润 = $52 - 40 = \\$12$<br>' +
    '利润率 = $\\frac{12}{40} \\times 100 = 30\\%$<br><br>' +
    '<b>考试技巧：</b>利润率以成本价为基准，不是售价。'
});

// ── 1.17 Exponential growth and decay (Extended only) ──
add('cie', '1.17', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• <b>Exponential growth</b>: quantity increases by a fixed percentage each time period.<br>' +
    'Formula: $y = A(1 + \\frac{r}{100})^t$<br>' +
    '• <b>Exponential decay</b>: quantity decreases by a fixed percentage each time period.<br>' +
    'Formula: $y = A(1 - \\frac{r}{100})^t$<br><br>' +
    'Where $A$ = initial amount, $r$ = rate (%), $t$ = number of time periods.<br><br>' +
    '<b>Applications</b><br>' +
    '• Population growth, compound interest, bacterial growth (growth).<br>' +
    '• Depreciation, radioactive decay, cooling (decay).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Set up the correct growth/decay formula from a word problem.<br>' +
    '• Calculate the value after $t$ periods.<br>' +
    '• Find the number of periods to reach a target value (trial and improvement).',
  content_zh:
    '<b>仅 Extended</b><br><br>' +
    '<b>知识回顾</b><br>' +
    '• <b>指数增长</b>：每个周期增长固定百分比。<br>' +
    '公式：$y = A(1 + \\frac{r}{100})^t$<br>' +
    '• <b>指数衰减</b>：每个周期减少固定百分比。<br>' +
    '公式：$y = A(1 - \\frac{r}{100})^t$<br><br>' +
    '其中 $A$ = 初始值，$r$ = 百分比，$t$ = 周期数。<br><br>' +
    '<b>应用</b><br>' +
    '• 增长：人口增长、复利、细菌繁殖。<br>' +
    '• 衰减：折旧、放射性衰变、冷却。'
});

add('cie', '1.17', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'A car costs $\\$24\\,000$ and depreciates by 12% each year. Find its value after 3 years.<br><br>' +
    '<b>Solution:</b><br>' +
    '$V = 24000 \\times (1 - 0.12)^3$<br>' +
    '$= 24000 \\times 0.88^3$<br>' +
    '$= 24000 \\times 0.681472$<br>' +
    '$= \\$16\\,355.33$<br><br>' +
    '<b>Exam Tip:</b> Depreciation is exponential DECAY — use $(1 - \\frac{r}{100})$, not $(1 + \\frac{r}{100})$.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '一辆车售价 $\\$24\\,000$，每年折旧 12%。求 3 年后的价值。<br><br>' +
    '<b>解答：</b><br>' +
    '$V = 24000 \\times 0.88^3 = \\$16\\,355.33$<br><br>' +
    '<b>考试技巧：</b>折旧是指数衰减，用 $(1 - \\frac{r}{100})$。'
});

// ── 1.18 Surds (Extended only) ──
add('cie', '1.18', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• A <b>surd</b> is a root that cannot be simplified to a rational number, e.g. $\\sqrt{2}$, $\\sqrt{5}$.<br>' +
    '• $\\sqrt{4} = 2$ is NOT a surd (it\'s rational).<br><br>' +
    '<b>Surd Rules</b><br>' +
    '• $\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b}$<br>' +
    '• $\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$<br>' +
    '• $\\sqrt{a} \\times \\sqrt{a} = a$<br><br>' +
    '<b>Simplifying Surds</b><br>' +
    '• $\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$<br>' +
    '• $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$<br><br>' +
    '<b>Rationalising the Denominator</b><br>' +
    '• $\\frac{1}{\\sqrt{a}}$: multiply top and bottom by $\\sqrt{a}$ → $\\frac{\\sqrt{a}}{a}$.<br>' +
    '• $\\frac{1}{a + \\sqrt{b}}$: multiply by $\\frac{a - \\sqrt{b}}{a - \\sqrt{b}}$ (difference of two squares).<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$. For example, $\\sqrt{9 + 16} = 5$, but $\\sqrt{9} + \\sqrt{16} = 7$.',
  content_zh:
    '<b>仅 Extended</b><br><br>' +
    '<b>知识回顾</b><br>' +
    '• <b>根式(surd)</b>：不能化为有理数的根号，如 $\\sqrt{2}$, $\\sqrt{5}$。<br><br>' +
    '<b>根式法则</b><br>' +
    '• $\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b}$<br>' +
    '• $\\sqrt{a} \\times \\sqrt{a} = a$<br><br>' +
    '<b>化简根式</b><br>' +
    '• $\\sqrt{50} = 5\\sqrt{2}$，$\\sqrt{72} = 6\\sqrt{2}$<br><br>' +
    '<b>有理化分母</b><br>' +
    '• $\\frac{1}{\\sqrt{a}}$：分子分母同乘 $\\sqrt{a}$。<br>' +
    '• $\\frac{1}{a + \\sqrt{b}}$：乘以 $\\frac{a - \\sqrt{b}}{a - \\sqrt{b}}$（平方差公式）。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$。'
});

add('cie', '1.18', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Simplify $\\sqrt{48} + \\sqrt{27}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$<br>' +
    '$\\sqrt{27} = \\sqrt{9 \\times 3} = 3\\sqrt{3}$<br>' +
    '$4\\sqrt{3} + 3\\sqrt{3} = 7\\sqrt{3}$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Rationalise the denominator: $\\frac{6}{3 + \\sqrt{3}}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$= \\frac{6(3 - \\sqrt{3})}{(3 + \\sqrt{3})(3 - \\sqrt{3})} = \\frac{18 - 6\\sqrt{3}}{9 - 3} = \\frac{18 - 6\\sqrt{3}}{6} = 3 - \\sqrt{3}$<br><br>' +
    '<b>Exam Tip:</b> To rationalise $\\frac{a}{b + \\sqrt{c}}$, multiply by $\\frac{b - \\sqrt{c}}{b - \\sqrt{c}}$. This uses the difference of two squares to eliminate the surd from the denominator.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '化简 $\\sqrt{48} + \\sqrt{27}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\sqrt{48} = 4\\sqrt{3}$，$\\sqrt{27} = 3\\sqrt{3}$<br>' +
    '$4\\sqrt{3} + 3\\sqrt{3} = 7\\sqrt{3}$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '有理化分母：$\\frac{6}{3 + \\sqrt{3}}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$= \\frac{6(3 - \\sqrt{3})}{(3)^2 - (\\sqrt{3})^2} = \\frac{18 - 6\\sqrt{3}}{6} = 3 - \\sqrt{3}$<br><br>' +
    '<b>考试技巧：</b>有理化 $\\frac{a}{b + \\sqrt{c}}$ 时，乘以 $\\frac{b - \\sqrt{c}}{b - \\sqrt{c}}$，利用平方差消去根号。'
});

/* ══════════════════════════════════════════════════
   EDEXCEL 4MA1 — Chapter 1: Numbers and the number system (1.1 – 1.11)
   ══════════════════════════════════════════════════ */

// ── Edexcel 1.1 Integers ──
add('edexcel', '1.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Integers</b> are whole numbers: ..., $-3, -2, -1, 0, 1, 2, 3$, ...<br>' +
    '• <b>Place value</b>: each digit\'s position determines its value (thousands, hundreds, tens, units).<br>' +
    '• <b>Directed numbers</b>: positive and negative numbers used in context (temperature, altitude, finance).<br><br>' +
    '<b>Types of Number</b><br>' +
    '• <b>Even numbers</b>: divisible by 2 (0, 2, 4, 6, ...).<br>' +
    '• <b>Odd numbers</b>: not divisible by 2 (1, 3, 5, 7, ...).<br>' +
    '• <b>Prime numbers</b>: exactly 2 factors (2, 3, 5, 7, 11, ...). Note: 1 is NOT prime.<br>' +
    '• <b>Factors</b> of $n$: numbers that divide exactly into $n$.<br>' +
    '• <b>Multiples</b> of $n$: the times table of $n$.<br>' +
    '• <b>HCF</b>: largest factor common to two numbers.<br>' +
    '• <b>LCM</b>: smallest multiple common to two numbers.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Express a number as a <b>product of prime factors</b>.<br>' +
    '• Use prime factorisation to find HCF and LCM.<br>' +
    '• Apply BIDMAS/BODMAS for order of operations.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '2 is the only even prime number. 1 is neither prime nor composite.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>整数</b>：..., $-3, -2, -1, 0, 1, 2, 3$, ...<br>' +
    '• <b>位值</b>：每位数字的位置决定其值。<br>' +
    '• <b>有向数</b>：正数和负数。<br><br>' +
    '<b>数的类型</b><br>' +
    '• <b>偶数</b>：能被 2 整除。<b>奇数</b>：不能被 2 整除。<br>' +
    '• <b>质数</b>：恰好有 2 个因数。1 不是质数。<br>' +
    '• <b>因数</b>：能整除该数的数。<b>倍数</b>：该数的乘法表。<br>' +
    '• <b>HCF</b>：最大公因数。<b>LCM</b>：最小公倍数。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 质因数分解 → 求 HCF 和 LCM。<br>' +
    '• 遵循 BIDMAS 运算顺序。'
});

add('edexcel', '1.1', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'Find the HCF and LCM of 36 and 90.<br><br>' +
    '<b>Solution:</b><br>' +
    '$36 = 2^2 \\times 3^2$<br>' +
    '$90 = 2 \\times 3^2 \\times 5$<br><br>' +
    'HCF = $2 \\times 3^2 = 18$ (common primes, lowest powers)<br>' +
    'LCM = $2^2 \\times 3^2 \\times 5 = 180$ (all primes, highest powers)<br><br>' +
    '<b>Exam Tip:</b> Always write both numbers as products of prime factors first. Use a factor tree or repeated division.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '求 36 和 90 的 HCF 和 LCM。<br><br>' +
    '<b>解答：</b><br>' +
    '$36 = 2^2 \\times 3^2$<br>' +
    '$90 = 2 \\times 3^2 \\times 5$<br>' +
    'HCF = $2 \\times 3^2 = 18$<br>' +
    'LCM = $2^2 \\times 3^2 \\times 5 = 180$'
});

// ── Edexcel 1.2 Fractions ──
add('edexcel', '1.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Equivalent fractions</b>: $\\frac{2}{4} = \\frac{1}{2}$. Simplify by dividing by common factors.<br>' +
    '• <b>Adding/subtracting</b>: find a common denominator.<br>' +
    '• <b>Multiplying</b>: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$. Simplify before multiplying if possible.<br>' +
    '• <b>Dividing</b>: multiply by the reciprocal: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$.<br>' +
    '• <b>Mixed numbers</b>: convert to improper fractions before multiplying or dividing.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Convert between fractions, decimals and percentages.<br>' +
    '• Order fractions by converting to a common denominator.<br>' +
    '• Understand unit fractions as multiplicative inverses: $\\frac{1}{n} \\times n = 1$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'To order fractions, convert them all to the same denominator, then compare numerators.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>等值分数</b>：$\\frac{2}{4} = \\frac{1}{2}$，约分。<br>' +
    '• <b>加减</b>：先通分。<br>' +
    '• <b>乘法</b>：$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$。<br>' +
    '• <b>除法</b>：乘以倒数。<br>' +
    '• <b>带分数</b>：乘除前先化为假分数。<br><br>' +
    '<b>考试技巧</b><br>' +
    '比较分数大小时，通分后比较分子。'
});

add('edexcel', '1.2', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'Calculate $3\\frac{1}{2} \\div 2\\frac{1}{3}$. Give your answer as a fraction in its simplest form.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\frac{7}{2} \\div \\frac{7}{3} = \\frac{7}{2} \\times \\frac{3}{7} = \\frac{21}{14} = \\frac{3}{2} = 1\\frac{1}{2}$<br><br>' +
    '<b>Exam Tip:</b> Convert mixed numbers to improper fractions. To divide, flip the second fraction and multiply. Always simplify your final answer.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '计算 $3\\frac{1}{2} \\div 2\\frac{1}{3}$，用最简分数表示。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\frac{7}{2} \\div \\frac{7}{3} = \\frac{7}{2} \\times \\frac{3}{7} = \\frac{3}{2} = 1\\frac{1}{2}$'
});

// ── Edexcel 1.3 Decimals ──
add('edexcel', '1.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Understand <b>place value</b> in decimals: tenths, hundredths, thousandths.<br>' +
    '• <b>Terminating decimals</b> end: $0.625 = \\frac{5}{8}$. <b>Recurring decimals</b> repeat: $0.333... = \\frac{1}{3}$.<br>' +
    '• Order decimals by comparing digit by digit from left to right.<br><br>' +
    '<b>Higher Only</b><br>' +
    '• Convert <b>recurring decimals to fractions</b>:<br>' +
    'Let $x = 0.\\dot{7}$, then $10x = 7.\\dot{7}$, so $9x = 7$, giving $x = \\frac{7}{9}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Add, subtract, multiply and divide decimals.<br>' +
    '• Convert fluently between fractions, decimals and percentages.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 小数<b>位值</b>：十分位、百分位、千分位。<br>' +
    '• <b>有限小数</b>会终止：$0.625 = \\frac{5}{8}$。<b>循环小数</b>会重复：$0.333... = \\frac{1}{3}$。<br><br>' +
    '<b>仅 Higher</b><br>' +
    '• <b>循环小数转分数</b>：设 $x = 0.\\dot{7}$，则 $10x = 7.\\dot{7}$，$9x = 7$，$x = \\frac{7}{9}$。'
});

add('edexcel', '1.3', 'examples', {
  content:
    '<b>Worked Example</b> (Higher) [3 marks]<br>' +
    'Convert $0.\\dot{2}\\dot{7}$ to a fraction in its simplest form.<br><br>' +
    '<b>Solution:</b><br>' +
    'Let $x = 0.272727...$<br>' +
    '$100x = 27.2727...$<br>' +
    '$100x - x = 27$<br>' +
    '$99x = 27$<br>' +
    '$x = \\frac{27}{99} = \\frac{3}{11}$<br><br>' +
    '<b>Exam Tip:</b> Multiply by $10^n$ where $n$ is the number of recurring digits, then subtract to eliminate the recurring part.',
  content_zh:
    '<b>经典例题</b>（Higher）[3 分]<br>' +
    '将 $0.\\dot{2}\\dot{7}$ 化为最简分数。<br><br>' +
    '<b>解答：</b><br>' +
    '设 $x = 0.272727...$<br>' +
    '$100x = 27.2727...$<br>' +
    '$99x = 27$，$x = \\frac{27}{99} = \\frac{3}{11}$'
});

// ── Edexcel 1.4 Powers and roots ──
add('edexcel', '1.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Square numbers</b>: $1, 4, 9, 16, 25, ...$<br>' +
    '• <b>Cube numbers</b>: $1, 8, 27, 64, 125, ...$<br>' +
    '• <b>Triangular numbers</b>: $1, 3, 6, 10, 15, ...$<br><br>' +
    '<b>Index Laws</b><br>' +
    '• $a^m \\times a^n = a^{m+n}$<br>' +
    '• $a^m \\div a^n = a^{m-n}$<br>' +
    '• $(a^m)^n = a^{mn}$<br>' +
    '• $a^0 = 1$<br><br>' +
    '<b>Higher Only</b><br>' +
    '• <b>Surds</b>: $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$. Simplify: $\\sqrt{50} = 5\\sqrt{2}$.<br>' +
    '• <b>Rationalise</b>: $\\frac{1}{\\sqrt{a}} = \\frac{\\sqrt{a}}{a}$.<br>' +
    '• <b>Fractional indices</b>: $a^{\\frac{1}{n}} = \\sqrt[n]{a}$, $a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m$.<br>' +
    '• <b>Negative indices</b>: $a^{-n} = \\frac{1}{a^n}$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$(-3)^2 = 9$ but $-3^2 = -9$. The brackets make a difference!',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 平方数、立方数、三角数。<br><br>' +
    '<b>指数法则</b><br>' +
    '• $a^m \\times a^n = a^{m+n}$，$a^m \\div a^n = a^{m-n}$，$(a^m)^n = a^{mn}$，$a^0 = 1$<br><br>' +
    '<b>仅 Higher</b><br>' +
    '• <b>根式</b>：$\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b}$，化简：$\\sqrt{50} = 5\\sqrt{2}$。<br>' +
    '• <b>有理化分母</b>：$\\frac{1}{\\sqrt{a}} = \\frac{\\sqrt{a}}{a}$。<br>' +
    '• <b>分数指数</b>：$a^{\\frac{1}{n}} = \\sqrt[n]{a}$。<b>负指数</b>：$a^{-n} = \\frac{1}{a^n}$。<br><br>' +
    '<b>注意！</b><br>' +
    '$(-3)^2 = 9$，但 $-3^2 = -9$，括号很重要！'
});

add('edexcel', '1.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Simplify $\\frac{12a^3 b^5}{4a b^2}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$= 3a^{3-1}b^{5-2} = 3a^2b^3$<br><br>' +
    '<b>Worked Example 2</b> (Higher) [2 marks]<br>' +
    'Simplify $\\sqrt{75} - \\sqrt{12}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\sqrt{75} = \\sqrt{25 \\times 3} = 5\\sqrt{3}$<br>' +
    '$\\sqrt{12} = \\sqrt{4 \\times 3} = 2\\sqrt{3}$<br>' +
    '$5\\sqrt{3} - 2\\sqrt{3} = 3\\sqrt{3}$',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '化简 $\\frac{12a^3 b^5}{4a b^2}$。<br><br>' +
    '<b>解答：</b>$= 3a^2b^3$<br><br>' +
    '<b>经典例题 2</b>（Higher）[2 分]<br>' +
    '化简 $\\sqrt{75} - \\sqrt{12}$。<br><br>' +
    '<b>解答：</b>$5\\sqrt{3} - 2\\sqrt{3} = 3\\sqrt{3}$'
});

// ── Edexcel 1.5 Set language and notation ──
add('edexcel', '1.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>set</b> is a collection of objects. $\\in$ = element of, $\\notin$ = not element of.<br>' +
    '• $\\varnothing$ = empty set, $\\mathcal{E}$ = universal set.<br>' +
    '• $A \\cap B$ = intersection, $A \\cup B$ = union, $A\'$ = complement.<br>' +
    '• <b>Venn diagrams</b> visualise set relationships.<br><br>' +
    '<b>Higher Only</b><br>' +
    '• Sets defined algebraically: $A = \\{x : x > 3, x \\in \\mathbb{Z}\\}$.<br>' +
    '• Calculate $n(A)$, $n(A \\cup B)$, $n(A \\cap B)$.<br>' +
    '• <b>Product rule for counting</b>: if event A has $m$ outcomes and event B has $n$ outcomes, total = $m \\times n$.<br>' +
    '• Work with <b>3-set Venn diagrams</b>.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'In Venn diagram problems, always start filling from the intersection (centre) outwards.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>集合</b>：$\\in$ = 属于，$\\notin$ = 不属于，$\\varnothing$ = 空集。<br>' +
    '• $A \\cap B$ = 交集，$A \\cup B$ = 并集，$A\'$ = 补集。<br><br>' +
    '<b>仅 Higher</b><br>' +
    '• 代数定义集合：$A = \\{x : x > 3, x \\in \\mathbb{Z}\\}$。<br>' +
    '• <b>计数乘法原理</b>：$m$ 种选择 × $n$ 种选择 = $m \\times n$ 种结果。<br>' +
    '• 三圈韦恩图。<br><br>' +
    '<b>考试技巧</b><br>' +
    '韦恩图从交集（中心）往外填。'
});

add('edexcel', '1.5', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    '$\\mathcal{E}$ = {integers from 1 to 20}, $A$ = {multiples of 3}, $B$ = {multiples of 4}.<br>' +
    '(a) List $A \\cap B$. (b) Find $n(A \\cup B)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = \\{3,6,9,12,15,18\\}$, $B = \\{4,8,12,16,20\\}$<br>' +
    '(a) $A \\cap B = \\{12\\}$ (multiples of both 3 and 4 = multiples of 12)<br>' +
    '(b) $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = 6 + 5 - 1 = 10$<br><br>' +
    '<b>Exam Tip:</b> $A \\cap B$ for multiples of 3 AND 4 = multiples of LCM(3,4) = 12.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '$\\mathcal{E}$ = {1到20的整数}，$A$ = {3的倍数}，$B$ = {4的倍数}。<br>' +
    '(a) 列出 $A \\cap B$。(b) 求 $n(A \\cup B)$。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = \\{3,6,9,12,15,18\\}$，$B = \\{4,8,12,16,20\\}$<br>' +
    '(a) $A \\cap B = \\{12\\}$<br>' +
    '(b) $n(A \\cup B) = 6 + 5 - 1 = 10$'
});

// ── Edexcel 1.6 Percentages ──
add('edexcel', '1.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Percentage of a quantity: $\\frac{p}{100} \\times Q$.<br>' +
    '• One as percentage of another: $\\frac{\\text{part}}{\\text{whole}} \\times 100\\%$.<br>' +
    '• <b>Percentage increase</b>: new = original $\\times (1 + \\frac{r}{100})$, multiplier > 1.<br>' +
    '• <b>Percentage decrease</b>: new = original $\\times (1 - \\frac{r}{100})$, multiplier < 1.<br>' +
    '• <b>Reverse percentage</b>: original = $\\frac{\\text{new amount}}{\\text{multiplier}}$.<br><br>' +
    '<b>Higher Only</b><br>' +
    '• <b>Compound interest</b>: $A = P(1 + \\frac{r}{100})^n$.<br>' +
    '• <b>Depreciation</b>: $A = P(1 - \\frac{r}{100})^n$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Reverse percentage: if something costs $\\$72$ after a 10% decrease, the original is $\\frac{72}{0.9} = \\$80$, NOT $72 \\times 1.1 = \\$79.20$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 百分比增加：$\\times (1 + \\frac{r}{100})$。减少：$\\times (1 - \\frac{r}{100})$。<br>' +
    '• <b>逆百分比</b>：原价 = $\\frac{\\text{现价}}{\\text{乘数}}$。<br><br>' +
    '<b>仅 Higher</b><br>' +
    '• <b>复利</b>：$A = P(1 + \\frac{r}{100})^n$。<br>' +
    '• <b>折旧</b>：$A = P(1 - \\frac{r}{100})^n$。<br><br>' +
    '<b>注意！</b><br>' +
    '逆百分比：降价 10% 后为 $\\$72$，原价 = $\\frac{72}{0.9} = \\$80$，不是 $72 \\times 1.1$。'
});

add('edexcel', '1.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'In a sale, prices are reduced by 15%. A jacket now costs $\\$68$. Find the original price.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiplier for 15% decrease = $0.85$<br>' +
    'Original price = $\\frac{68}{0.85} = \\$80$<br><br>' +
    '<b>Worked Example 2</b> (Higher) [3 marks]<br>' +
    'A car valued at $\\$18\\,000$ depreciates by 8% per year. Find its value after 5 years.<br><br>' +
    '<b>Solution:</b><br>' +
    '$V = 18000 \\times (0.92)^5 = 18000 \\times 0.6591 = \\$11\\,863.28$<br><br>' +
    '<b>Exam Tip:</b> For reverse percentage, always divide by the multiplier. For compound changes, use $(\\text{multiplier})^n$.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '打 85 折后一件夹克 $\\$68$，求原价。<br><br>' +
    '<b>解答：</b>原价 = $\\frac{68}{0.85} = \\$80$<br><br>' +
    '<b>经典例题 2</b>（Higher）[3 分]<br>' +
    '一辆 $\\$18\\,000$ 的车每年折旧 8%，求 5 年后的价值。<br><br>' +
    '<b>解答：</b>$V = 18000 \\times 0.92^5 = \\$11\\,863.28$'
});

// ── Edexcel 1.7 Ratio and proportion ──
add('edexcel', '1.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>ratio</b> compares parts: $a : b$. Simplify by dividing by common factors.<br>' +
    '• <b>Divide in a ratio</b>: total parts = $a + b$, share = $\\frac{\\text{part}}{\\text{total parts}} \\times \\text{quantity}$.<br>' +
    '• <b>Direct proportion</b>: as one quantity increases, the other increases at the same rate. Use the <b>unitary method</b>.<br>' +
    '• <b>Inverse proportion</b>: as one increases, the other decreases. If 4 workers take 6 hours, 8 workers take 3 hours.<br>' +
    '• <b>Map scales</b>: e.g. $1 : 25\\,000$ means 1 cm on map = 25,000 cm = 250 m in reality.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For proportion problems, always find the value of ONE unit first (unitary method), then scale up or down.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>比</b>：$a : b$，约分。<b>按比分配</b>：总份数 = $a + b$。<br>' +
    '• <b>正比例</b>：一个量增大，另一个同比例增大。用<b>单位量法</b>。<br>' +
    '• <b>反比例</b>：一个增大，另一个减小。<br>' +
    '• <b>地图比例尺</b>：$1 : 25\\,000$ 表示图上 1cm = 实际 250m。<br><br>' +
    '<b>考试技巧</b><br>' +
    '比例问题先求一个单位的值，再按需要缩放。'
});

add('edexcel', '1.7', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    '5 workers can build a wall in 12 days. How many days would 8 workers take?<br><br>' +
    '<b>Solution:</b><br>' +
    'This is inverse proportion (more workers = less time).<br>' +
    'Total worker-days = $5 \\times 12 = 60$<br>' +
    'Time for 8 workers = $\\frac{60}{8} = 7.5$ days<br><br>' +
    '<b>Exam Tip:</b> Check: is it direct or inverse proportion? More workers → less time = inverse.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '5 个工人 12 天建完一面墙。8 个工人需要几天？<br><br>' +
    '<b>解答：</b><br>' +
    '反比例：总工作量 = $5 \\times 12 = 60$ 人天<br>' +
    '8 个工人：$\\frac{60}{8} = 7.5$ 天'
});

// ── Edexcel 1.8 Degree of accuracy ──
add('edexcel', '1.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Decimal places (d.p.)</b>: count digits after the decimal point.<br>' +
    '• <b>Significant figures (s.f.)</b>: count from the first non-zero digit.<br>' +
    '• <b>Upper and lower bounds</b>: if $x = 3.7$ (1 d.p.), then $3.65 \\leq x < 3.75$.<br>' +
    '• <b>Estimation</b>: round each number to 1 s.f. to approximate a calculation.<br><br>' +
    '<b>Higher Only</b><br>' +
    '• Calculate <b>bounds of expressions</b>:<br>' +
    '&nbsp;&nbsp;Max of $a + b$: UB + UB<br>' +
    '&nbsp;&nbsp;Max of $a - b$: UB of $a$ − LB of $b$<br>' +
    '&nbsp;&nbsp;Max of $\\frac{a}{b}$: UB of $a$ ÷ LB of $b$<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For estimation, show the rounded values before calculating. This is where the marks are.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>小数位</b>和<b>有效数字</b>。<br>' +
    '• <b>上下界</b>：$x = 3.7$（1 d.p.），则 $3.65 \\leq x < 3.75$。<br>' +
    '• <b>估算</b>：取 1 s.f. 近似计算。<br><br>' +
    '<b>仅 Higher</b><br>' +
    '• 表达式的界限计算：最大 $\\frac{a}{b}$ = $\\frac{a\\text{的上界}}{b\\text{的下界}}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '估算题要写出取整后的值再算，这才是得分点。'
});

add('edexcel', '1.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Estimate $\\frac{6.8 \\times 31.2}{0.52}$ by rounding to 1 significant figure.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\approx \\frac{7 \\times 30}{0.5} = \\frac{210}{0.5} = 420$<br><br>' +
    '<b>Worked Example 2</b> (Higher) [3 marks]<br>' +
    '$a = 5.4$ (1 d.p.), $b = 0.8$ (1 d.p.). Find the upper bound of $\\frac{a}{b}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$a$: UB = $5.45$, $b$: LB = $0.75$<br>' +
    'Upper bound = $\\frac{5.45}{0.75} = 7.2\\dot{6}$',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '取 1 s.f. 估算 $\\frac{6.8 \\times 31.2}{0.52}$。<br><br>' +
    '<b>解答：</b>$\\approx \\frac{7 \\times 30}{0.5} = 420$<br><br>' +
    '<b>经典例题 2</b>（Higher）[3 分]<br>' +
    '$a = 5.4$（1 d.p.），$b = 0.8$（1 d.p.）。求 $\\frac{a}{b}$ 的上界。<br><br>' +
    '<b>解答：</b>$\\frac{5.45}{0.75} = 7.2\\dot{6}$'
});

// ── Edexcel 1.9 Standard form ──
add('edexcel', '1.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '<b>Standard form</b>: $A \\times 10^n$ where $1 \\leq A < 10$.<br>' +
    '• Large: $3\\,400\\,000 = 3.4 \\times 10^6$.<br>' +
    '• Small: $0.00056 = 5.6 \\times 10^{-4}$.<br><br>' +
    '<b>Calculations</b><br>' +
    '• Multiply: multiply $A$ values, add powers.<br>' +
    '• Divide: divide $A$ values, subtract powers.<br>' +
    '• Add/Subtract: convert to same power of 10, or to ordinary numbers.<br><br>' +
    '<b>Higher Only</b><br>' +
    '• Solve problems involving standard form in context (e.g. astronomy, atoms).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '<b>标准式</b>：$A \\times 10^n$（$1 \\leq A < 10$）。<br>' +
    '• 大数：$3\\,400\\,000 = 3.4 \\times 10^6$。<br>' +
    '• 小数：$0.00056 = 5.6 \\times 10^{-4}$。<br><br>' +
    '<b>运算</b><br>' +
    '• 乘法：$A$ 相乘，指数相加。除法：$A$ 相除，指数相减。<br>' +
    '• 加减法：先统一 $10$ 的幂次。'
});

add('edexcel', '1.9', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'The distance from the Earth to the Sun is $1.5 \\times 10^8$ km. Light travels at $3 \\times 10^5$ km/s. How long does it take light to reach Earth from the Sun?<br><br>' +
    '<b>Solution:</b><br>' +
    'Time = $\\frac{\\text{distance}}{\\text{speed}} = \\frac{1.5 \\times 10^8}{3 \\times 10^5}$<br>' +
    '$= \\frac{1.5}{3} \\times 10^{8-5} = 0.5 \\times 10^3 = 500$ seconds<br>' +
    '$= 8$ minutes $20$ seconds<br><br>' +
    '<b>Exam Tip:</b> Divide $A$ values and subtract powers separately. If $A < 1$, adjust by multiplying by 10 and reducing the power by 1.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '日地距离 $1.5 \\times 10^8$ km，光速 $3 \\times 10^5$ km/s。光从太阳到地球要多久？<br><br>' +
    '<b>解答：</b><br>' +
    '时间 = $\\frac{1.5 \\times 10^8}{3 \\times 10^5} = 0.5 \\times 10^3 = 500$ 秒 = 8 分 20 秒'
});

// ── Edexcel 1.10 Applying number ──
add('edexcel', '1.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Apply four operations in practical contexts: money, time, mass, length.<br>' +
    '• <b>Metric units</b>: mm, cm, m, km (length); g, kg (mass); ml, l (capacity); cm², m² (area); cm³, m³ (volume).<br>' +
    '• <b>Metric conversions</b>: $1\\text{ km} = 1000\\text{ m}$, $1\\text{ kg} = 1000\\text{ g}$, $1\\text{ l} = 1000\\text{ ml}$.<br>' +
    '• <b>Common imperial ↔ metric</b>: 1 inch ≈ 2.5 cm, 1 mile ≈ 1.6 km, 1 kg ≈ 2.2 pounds, 1 gallon ≈ 4.5 litres.<br><br>' +
    '<b>Compound Measures</b><br>' +
    '• Speed = $\\frac{\\text{distance}}{\\text{time}}$<br>' +
    '• Density = $\\frac{\\text{mass}}{\\text{volume}}$<br>' +
    '• Pressure = $\\frac{\\text{force}}{\\text{area}}$',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 四则运算的实际应用：货币、时间、质量、长度。<br>' +
    '• <b>公制单位转换</b>：$1\\text{ km} = 1000\\text{ m}$，$1\\text{ kg} = 1000\\text{ g}$。<br>' +
    '• <b>英制↔公制</b>：1 英寸 ≈ 2.5 cm，1 英里 ≈ 1.6 km。<br><br>' +
    '<b>复合量</b><br>' +
    '• 速度 = 路程÷时间，密度 = 质量÷体积，压强 = 力÷面积。'
});

add('edexcel', '1.10', 'examples', {
  content:
    '<b>Worked Example</b> [3 marks]<br>' +
    'A gold bar has a mass of 965 g and a volume of 50 cm³. Calculate the density of gold.<br><br>' +
    '<b>Solution:</b><br>' +
    'Density = $\\frac{\\text{mass}}{\\text{volume}} = \\frac{965}{50} = 19.3$ g/cm³<br><br>' +
    '<b>Exam Tip:</b> Remember the units! Density is usually g/cm³ or kg/m³. Always include the correct units in your answer.',
  content_zh:
    '<b>经典例题</b> [3 分]<br>' +
    '一块金条质量 965 g，体积 50 cm³。求金的密度。<br><br>' +
    '<b>解答：</b>密度 = $\\frac{965}{50} = 19.3$ g/cm³<br><br>' +
    '<b>考试技巧：</b>别忘了单位！密度通常用 g/cm³ 或 kg/m³。'
});

// ── Edexcel 1.11 Electronic calculators ──
add('edexcel', '1.11', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Use a scientific calculator efficiently for multi-step calculations.<br>' +
    '• Use brackets to ensure correct order of operations: enter $\\frac{a+b}{c-d}$ as $(a+b) \\div (c-d)$.<br>' +
    '• Use function keys: $x^2$, $\\sqrt{}$, $x^y$, $\\frac{a}{b}$ (fraction), $\\times 10^x$ (standard form).<br>' +
    '• Know how to enter recurring decimals and convert between forms.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Interpret the display: $3.5\\text{E}6 = 3.5 \\times 10^6$.<br>' +
    '• Use the ANS key to chain calculations.<br>' +
    '• Check answers using estimation or inverse operations.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Even when using a calculator, always show working and write down at least one intermediate step.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 熟练使用科学计算器。<br>' +
    '• 用括号确保运算顺序正确。<br>' +
    '• 常用功能键：$x^2$, $\\sqrt{}$, $x^y$, 分数键, 标准式键。<br>' +
    '• 解读显示：$3.5\\text{E}6 = 3.5 \\times 10^6$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '即使用计算器也要写步骤和中间结果。'
});

add('edexcel', '1.11', 'examples', {
  content:
    '<b>Worked Example</b> [2 marks]<br>' +
    'Use your calculator to find $\\frac{\\sqrt{5.7^2 + 3.2^2}}{1.8}$. Give your answer to 3 significant figures.<br><br>' +
    '<b>Solution:</b><br>' +
    'Enter: $\\sqrt{(5.7^2 + 3.2^2)} \\div 1.8$<br>' +
    '$= \\sqrt{32.49 + 10.24} \\div 1.8$<br>' +
    '$= \\sqrt{42.73} \\div 1.8$<br>' +
    '$= 6.537... \\div 1.8$<br>' +
    '$= 3.631... \\approx 3.63$ (3 s.f.)<br><br>' +
    '<b>Exam Tip:</b> Show the intermediate value before dividing. Use brackets around the entire expression under the square root.',
  content_zh:
    '<b>经典例题</b> [2 分]<br>' +
    '用计算器求 $\\frac{\\sqrt{5.7^2 + 3.2^2}}{1.8}$，精确到 3 s.f。<br><br>' +
    '<b>解答：</b><br>' +
    '$= \\frac{\\sqrt{42.73}}{1.8} = \\frac{6.537...}{1.8} = 3.63$（3 s.f.）'
});

/* ══════════════════════════════════════════════════
   OUTPUT SQL
   ══════════════════════════════════════════════════ */
console.log('-- Section content seed: CIE Ch1 + Edexcel Ch1');
console.log('-- Generated ' + edits.length + ' rows');
console.log('');

edits.forEach(function(e) {
  var json = JSON.stringify(e.data).replace(/'/g, "''");
  console.log(
    "INSERT INTO section_edits (board, section_id, module, data) VALUES ('" +
    e.board + "', '" + e.section_id + "', '" + e.module + "', '" +
    json + "'::jsonb) ON CONFLICT (board, section_id, module) DO UPDATE SET data = EXCLUDED.data, updated_at = now();"
  );
});

console.log('');
console.log('-- Done: ' + edits.length + ' rows upserted');
