#!/usr/bin/env node
// Generates SQL for HHK section_edits content seeding (knowledge cards + worked examples)
// Usage: node scripts/seed-hhk.js > scripts/seed-hhk.sql
// Then run output in Supabase Dashboard SQL Editor

var edits = [];

function add(board, id, module, data) {
  edits.push({ board: board, section_id: id, module: module, data: data });
}


/* ══════════════════════════════════════════════════
   HHK Y7
   ══════════════════════════════════════════════════ */

add('hhk', 'Y7.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A fraction is in <b>simplest form</b> when the numerator and denominator have no common factor other than 1. Divide both by their HCF.<br>' +
    '• A <b>mixed number</b> has a whole part and a fraction part, e.g. $2\\frac{3}{4}$.<br>' +
    '• An <b>improper fraction</b> has numerator $\\geq$ denominator, e.g. $\\frac{11}{4}$.<br>' +
    '• To convert mixed $\\to$ improper: $2\\frac{3}{4} = \\frac{2 \\times 4 + 3}{4} = \\frac{11}{4}$.<br>' +
    '• To convert improper $\\to$ mixed: divide numerator by denominator; quotient = whole part, remainder = new numerator.<br>' +
    '• To <b>add or subtract</b> fractions, find a common denominator first.<br>' +
    '• <b>Rounding</b>: to 2 d.p. means two digits after the decimal point; to 3 s.f. means three significant figures (count from the first non-zero digit).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Multiply a fraction by an integer</b>: $\\frac{2}{5} \\times 3 = \\frac{2 \\times 3}{5} = \\frac{6}{5} = 1\\frac{1}{5}$.<br>' +
    '• <b>Multiply two fractions</b>: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$. Simplify before multiplying (cross-cancel) to keep numbers small.<br>' +
    '• <b>Pre-cancelling</b>: cancel any numerator with any denominator before multiplying. E.g. $\\frac{3}{8} \\times \\frac{4}{9}$: cancel 3 with 9 and 4 with 8 to get $\\frac{1}{2} \\times \\frac{1}{3} = \\frac{1}{6}$.<br>' +
    '• For mixed numbers, convert to improper fractions first, then multiply.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always simplify your answer. If the question gives mixed numbers, convert to improper fractions before multiplying, then convert back to a mixed number at the end.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do NOT multiply the whole-number parts separately. $2\\frac{1}{3} \\times 1\\frac{1}{2} \\neq 2 \\times 1 + \\frac{1}{3} \\times \\frac{1}{2}$. You must convert to improper fractions first.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 分数的<b>最简形式</b>：分子和分母除了 1 以外没有公因数。两者同除以最大公因数即可化简。<br>' +
    '• <b>带分数</b>：整数部分加分数部分，如 $2\\frac{3}{4}$。<br>' +
    '• <b>假分数</b>：分子 $\\geq$ 分母，如 $\\frac{11}{4}$。<br>' +
    '• 带分数 $\\to$ 假分数：$2\\frac{3}{4} = \\frac{2 \\times 4 + 3}{4} = \\frac{11}{4}$。<br>' +
    '• 假分数 $\\to$ 带分数：分子除以分母，商为整数部分，余数为新分子。<br>' +
    '• <b>加减分数</b>：先通分（找公分母），再加减分子。<br>' +
    '• <b>四舍五入</b>：保留 2 位小数 = 小数点后两位；保留 3 位有效数字 = 从第一个非零数字起数三位。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>分数乘整数</b>：$\\frac{2}{5} \\times 3 = \\frac{2 \\times 3}{5} = \\frac{6}{5} = 1\\frac{1}{5}$。<br>' +
    '• <b>分数乘分数</b>：$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$。先约分再乘，数字更小。<br>' +
    '• <b>交叉约分</b>：任意分子和任意分母之间可以约分。如 $\\frac{3}{8} \\times \\frac{4}{9}$：3 与 9 约、4 与 8 约，得 $\\frac{1}{2} \\times \\frac{1}{3} = \\frac{1}{6}$。<br>' +
    '• 遇到带分数时，先转换成假分数再相乘。<br><br>' +
    '<b>考试技巧</b><br>' +
    '答案一定要化简。如果题目给的是带分数，先转成假分数再乘，最后再转回带分数。<br><br>' +
    '<b>注意！</b><br>' +
    '不要把整数部分和分数部分分开乘。$2\\frac{1}{3} \\times 1\\frac{1}{2} \\neq 2 \\times 1 + \\frac{1}{3} \\times \\frac{1}{2}$，必须先转成假分数。'
});

add('hhk', 'Y7.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Calculate $\\frac{3}{4} \\times \\frac{2}{5}$. Give your answer in its simplest form.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply numerators: $3 \\times 2 = 6$<br>' +
    'Multiply denominators: $4 \\times 5 = 20$<br>' +
    '$\\frac{3}{4} \\times \\frac{2}{5} = \\frac{6}{20} = \\frac{3}{10}$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Calculate $2\\frac{1}{3} \\times 1\\frac{2}{5}$. Give your answer as a mixed number.<br><br>' +
    '<b>Solution:</b><br>' +
    'Convert to improper fractions:<br>' +
    '$2\\frac{1}{3} = \\frac{7}{3}$, $\\quad 1\\frac{2}{5} = \\frac{7}{5}$<br>' +
    '$\\frac{7}{3} \\times \\frac{7}{5} = \\frac{49}{15}$<br>' +
    '$= 3\\frac{4}{15}$<br><br>' +
    '<b>Exam Tip:</b> Convert mixed numbers to improper fractions before multiplying. Check whether you can pre-cancel before you multiply — it keeps the numbers smaller.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '计算 $\\frac{3}{4} \\times \\frac{2}{5}$，将答案化简为最简分数。<br><br>' +
    '<b>解答：</b><br>' +
    '分子相乘：$3 \\times 2 = 6$<br>' +
    '分母相乘：$4 \\times 5 = 20$<br>' +
    '$\\frac{3}{4} \\times \\frac{2}{5} = \\frac{6}{20} = \\frac{3}{10}$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '计算 $2\\frac{1}{3} \\times 1\\frac{2}{5}$，将答案写成带分数。<br><br>' +
    '<b>解答：</b><br>' +
    '转换为假分数：<br>' +
    '$2\\frac{1}{3} = \\frac{7}{3}$，$\\quad 1\\frac{2}{5} = \\frac{7}{5}$<br>' +
    '$\\frac{7}{3} \\times \\frac{7}{5} = \\frac{49}{15}$<br>' +
    '$= 3\\frac{4}{15}$<br><br>' +
    '<b>考试技巧：</b>先将带分数转换为假分数再相乘。计算前检查能否交叉约分，这样可以让数字更小。'
});

add('hhk', 'Y7.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• The <b>reciprocal</b> of a fraction $\\frac{a}{b}$ is $\\frac{b}{a}$. The reciprocal of 5 is $\\frac{1}{5}$.<br>' +
    '• Dividing by a number is the same as multiplying by its reciprocal.<br>' +
    '• <b>Order of operations (BIDMAS)</b>: Brackets, Indices, Division/Multiplication (left to right), Addition/Subtraction (left to right).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Divide an integer by a fraction</b>: $6 \\div \\frac{2}{3} = 6 \\times \\frac{3}{2} = \\frac{18}{2} = 9$.<br>' +
    '• <b>Divide a fraction by a fraction</b>: Keep the first fraction, Flip the second, Multiply. $\\frac{3}{4} \\div \\frac{5}{8} = \\frac{3}{4} \\times \\frac{8}{5} = \\frac{24}{20} = \\frac{6}{5}$.<br>' +
    '• For mixed numbers, convert to improper fractions first, then apply KFC (Keep, Flip, Change).<br>' +
    '• When a calculation has multiple operations, follow BIDMAS. Do brackets first, then multiplication/division before addition/subtraction.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Remember KFC: Keep the first fraction, Flip the second fraction, Change $\\div$ to $\\times$. Then simplify as normal.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do NOT flip the first fraction — only flip the one you are dividing by. $\\frac{3}{4} \\div \\frac{2}{5}$: keep $\\frac{3}{4}$, flip $\\frac{2}{5}$ to $\\frac{5}{2}$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 分数 $\\frac{a}{b}$ 的<b>倒数</b>是 $\\frac{b}{a}$。5 的倒数是 $\\frac{1}{5}$。<br>' +
    '• 除以一个数等于乘以它的倒数。<br>' +
    '• <b>运算顺序 (BIDMAS)</b>：括号、指数、乘除（从左到右）、加减（从左到右）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>整数除以分数</b>：$6 \\div \\frac{2}{3} = 6 \\times \\frac{3}{2} = \\frac{18}{2} = 9$。<br>' +
    '• <b>分数除以分数</b>：保持第一个分数不变，翻转第二个分数，改除为乘。$\\frac{3}{4} \\div \\frac{5}{8} = \\frac{3}{4} \\times \\frac{8}{5} = \\frac{24}{20} = \\frac{6}{5}$。<br>' +
    '• 遇到带分数，先转成假分数，再用 KFC 法则（保持、翻转、改号）。<br>' +
    '• 多步运算时，遵循 BIDMAS。先算括号，再算乘除，最后算加减。<br><br>' +
    '<b>考试技巧</b><br>' +
    '记住 KFC 法则：保持（Keep）第一个分数、翻转（Flip）第二个分数、改号（Change）除变乘。然后正常化简。<br><br>' +
    '<b>注意！</b><br>' +
    '不要翻转第一个分数——只翻转除数。$\\frac{3}{4} \\div \\frac{2}{5}$：保持 $\\frac{3}{4}$，翻转 $\\frac{2}{5}$ 变成 $\\frac{5}{2}$。'
});

add('hhk', 'Y7.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Calculate $8 \\div \\frac{4}{5}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Keep 8, flip $\\frac{4}{5}$ to $\\frac{5}{4}$, change $\\div$ to $\\times$:<br>' +
    '$8 \\times \\frac{5}{4} = \\frac{40}{4} = 10$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Calculate $\\frac{2}{3} \\div \\frac{4}{9} + \\frac{1}{2}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Do the division first (BIDMAS):<br>' +
    '$\\frac{2}{3} \\div \\frac{4}{9} = \\frac{2}{3} \\times \\frac{9}{4} = \\frac{18}{12} = \\frac{3}{2}$<br>' +
    'Now add: $\\frac{3}{2} + \\frac{1}{2} = \\frac{4}{2} = 2$<br><br>' +
    '<b>Exam Tip:</b> In multi-step fraction problems, follow BIDMAS — do multiplication and division before addition and subtraction.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '计算 $8 \\div \\frac{4}{5}$。<br><br>' +
    '<b>解答：</b><br>' +
    '保持 8，翻转 $\\frac{4}{5}$ 为 $\\frac{5}{4}$，除法变乘法：<br>' +
    '$8 \\times \\frac{5}{4} = \\frac{40}{4} = 10$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '计算 $\\frac{2}{3} \\div \\frac{4}{9} + \\frac{1}{2}$。<br><br>' +
    '<b>解答：</b><br>' +
    '先做除法（BIDMAS）：<br>' +
    '$\\frac{2}{3} \\div \\frac{4}{9} = \\frac{2}{3} \\times \\frac{9}{4} = \\frac{18}{12} = \\frac{3}{2}$<br>' +
    '再做加法：$\\frac{3}{2} + \\frac{1}{2} = \\frac{4}{2} = 2$<br><br>' +
    '<b>考试技巧：</b>多步分数运算中，遵循 BIDMAS——先乘除后加减。'
});

add('hhk', 'Y7.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Numbers can be positive or negative. They can be placed on a <b>number line</b>.<br>' +
    '• Numbers to the right are larger. $-3 < -1 < 0 < 2 < 5$.<br>' +
    '• <b>Adding a positive</b> number moves right on the number line.<br>' +
    '• <b>Adding a negative</b> number moves left (same as subtracting the positive).<br>' +
    '• <b>Subtracting a negative</b> moves right (same as adding the positive): $5 - (-3) = 5 + 3 = 8$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Adding/subtracting</b>: use a number line or rules. Two signs together: $+(+) = +$, $+(-) = -$, $-(+) = -$, $-(-) = +$.<br>' +
    '• <b>Multiplying/dividing</b>: same signs give a <b>positive</b> answer, different signs give a <b>negative</b> answer.<br>' +
    '• $(-3) \\times (-4) = +12$ (same signs $\\to$ positive)<br>' +
    '• $(-3) \\times 4 = -12$ (different signs $\\to$ negative)<br>' +
    '• $(-12) \\div (-3) = +4$ (same signs $\\to$ positive)<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Count the number of negative signs: an even number of negatives gives a positive answer, an odd number gives a negative answer.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$-3^2 = -9$ (only the 3 is squared), but $(-3)^2 = 9$ (the whole bracket is squared). The brackets make a big difference!',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 数可以是正数或负数，可以标在<b>数轴</b>上。<br>' +
    '• 越往右越大。$-3 < -1 < 0 < 2 < 5$。<br>' +
    '• <b>加正数</b>：在数轴上向右移动。<br>' +
    '• <b>加负数</b>：向左移动（等于减去对应正数）。<br>' +
    '• <b>减负数</b>：向右移动（等于加上对应正数）：$5 - (-3) = 5 + 3 = 8$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>加减法</b>：用数轴或符号规则。两个符号相邻时：$+(+) = +$，$+(-) = -$，$-(+) = -$，$-(-) = +$。<br>' +
    '• <b>乘除法</b>：同号得<b>正</b>，异号得<b>负</b>。<br>' +
    '• $(-3) \\times (-4) = +12$（同号 $\\to$ 正）<br>' +
    '• $(-3) \\times 4 = -12$（异号 $\\to$ 负）<br>' +
    '• $(-12) \\div (-3) = +4$（同号 $\\to$ 正）<br><br>' +
    '<b>考试技巧</b><br>' +
    '数负号个数：偶数个负号得正，奇数个负号得负。<br><br>' +
    '<b>注意！</b><br>' +
    '$-3^2 = -9$（只有 3 被平方），但 $(-3)^2 = 9$（整个括号被平方）。括号非常重要！'
});

add('hhk', 'Y7.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Calculate $-8 + 3 - (-5)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$-8 + 3 - (-5)$<br>' +
    '$= -8 + 3 + 5$ (subtracting a negative = adding)<br>' +
    '$= -5 + 5$<br>' +
    '$= 0$<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'Calculate $(-6) \\times 4 \\div (-8)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$(-6) \\times 4 = -24$ (different signs $\\to$ negative)<br>' +
    '$(-24) \\div (-8) = 3$ (same signs $\\to$ positive)<br><br>' +
    '<b>Exam Tip:</b> Deal with one operation at a time, working left to right. Write down each step clearly to avoid sign errors.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '计算 $-8 + 3 - (-5)$。<br><br>' +
    '<b>解答：</b><br>' +
    '$-8 + 3 - (-5)$<br>' +
    '$= -8 + 3 + 5$（减负数 = 加正数）<br>' +
    '$= -5 + 5$<br>' +
    '$= 0$<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '计算 $(-6) \\times 4 \\div (-8)$。<br><br>' +
    '<b>解答：</b><br>' +
    '$(-6) \\times 4 = -24$（异号 $\\to$ 负）<br>' +
    '$(-24) \\div (-8) = 3$（同号 $\\to$ 正）<br><br>' +
    '<b>考试技巧：</b>每次只处理一步运算，从左到右依次计算。写清每一步，避免符号出错。'
});

add('hhk', 'Y7.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Coordinates are written as $(x, y)$. The $x$-axis goes left/right, the $y$-axis goes up/down.<br>' +
    '• The <b>origin</b> is $(0, 0)$, where the axes cross.<br>' +
    '• There are <b>four quadrants</b>: top-right $(+, +)$, top-left $(-, +)$, bottom-left $(-, -)$, bottom-right $(+, -)$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Plotting coordinates</b>: go along the $x$-axis first, then up or down the $y$-axis. Remember: "along the corridor, then up the stairs".<br>' +
    '• <b>Translation</b> means sliding a shape without rotating or flipping it. Described using a column vector $\\binom{a}{b}$ where $a$ = horizontal movement (right +, left $-$) and $b$ = vertical movement (up +, down $-$).<br>' +
    '• <b>Reflection</b> flips a shape over a mirror line. Every point is the same distance from the mirror line on both sides.<br>' +
    '• Common mirror lines: $x$-axis (horizontal), $y$-axis (vertical), $y = x$, $y = -x$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When reflecting, count squares from each point to the mirror line, then count the same number on the other side. Use tracing paper if allowed.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do not mix up the $x$ and $y$ coordinates. $x$ always comes first. The point $(3, 5)$ is different from $(5, 3)$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 坐标写作 $(x, y)$。$x$ 轴是水平方向，$y$ 轴是竖直方向。<br>' +
    '• <b>原点</b>是 $(0, 0)$，即两轴交点。<br>' +
    '• <b>四个象限</b>：右上 $(+, +)$、左上 $(-, +)$、左下 $(-, -)$、右下 $(+, -)$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>描点</b>：先沿 $x$ 轴移动，再沿 $y$ 轴移动。口诀："先走廊，再上楼"。<br>' +
    '• <b>平移</b>：整个图形滑动，不旋转不翻转。用列向量 $\\binom{a}{b}$ 表示，$a$ = 水平移动（右为正，左为负），$b$ = 竖直移动（上为正，下为负）。<br>' +
    '• <b>反射（轴对称）</b>：沿镜面线翻转图形。每个点到镜面线的距离在两侧相等。<br>' +
    '• 常见镜面线：$x$ 轴（水平）、$y$ 轴（竖直）、$y = x$、$y = -x$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '做反射时，从每个点数到镜面线的格数，再在另一侧数相同格数。如果允许，可以用描图纸辅助。<br><br>' +
    '<b>注意！</b><br>' +
    '不要混淆 $x$ 和 $y$ 坐标。$x$ 永远写在前面。$(3, 5)$ 和 $(5, 3)$ 是不同的点。'
});

add('hhk', 'Y7.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Point $A$ is at $(2, 3)$. $A$ is translated by $\\binom{-4}{1}$. Find the coordinates of the image of $A$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$x$-coordinate: $2 + (-4) = -2$<br>' +
    '$y$-coordinate: $3 + 1 = 4$<br>' +
    'The image of $A$ is at $(-2, 4)$.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'Point $B$ is at $(3, -1)$. Reflect $B$ in the $y$-axis. Find the coordinates of the image.<br><br>' +
    '<b>Solution:</b><br>' +
    'Reflecting in the $y$-axis changes the sign of the $x$-coordinate.<br>' +
    'The $y$-coordinate stays the same.<br>' +
    'Image of $B$ is at $(-3, -1)$.<br><br>' +
    '<b>Exam Tip:</b> For reflections in the $x$-axis, change the sign of $y$. For reflections in the $y$-axis, change the sign of $x$. Check by counting squares on a grid.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '点 $A$ 在 $(2, 3)$。$A$ 按 $\\binom{-4}{1}$ 平移。求 $A$ 像的坐标。<br><br>' +
    '<b>解答：</b><br>' +
    '$x$ 坐标：$2 + (-4) = -2$<br>' +
    '$y$ 坐标：$3 + 1 = 4$<br>' +
    '$A$ 的像在 $(-2, 4)$。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '点 $B$ 在 $(3, -1)$。将 $B$ 关于 $y$ 轴做反射。求像的坐标。<br><br>' +
    '<b>解答：</b><br>' +
    '关于 $y$ 轴反射时，$x$ 坐标变号。<br>' +
    '$y$ 坐标不变。<br>' +
    '$B$ 的像在 $(-3, -1)$。<br><br>' +
    '<b>考试技巧：</b>关于 $x$ 轴反射改变 $y$ 的符号，关于 $y$ 轴反射改变 $x$ 的符号。可以在网格上数格子验证。'
});

add('hhk', 'Y7.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>ratio</b> compares two or more quantities. Written with a colon, e.g. $3 : 5$.<br>' +
    '• A <b>proportion</b> compares a part to the whole. It can be written as a fraction, decimal or percentage.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Simplify ratios</b>: divide all parts by their HCF. E.g. $12 : 8 = 3 : 2$ (divide both by 4).<br>' +
    '• <b>Ratios with different units</b>: convert to the same unit first. E.g. 2 kg : 500 g = 2000 g : 500 g = $4 : 1$.<br>' +
    '• <b>Ratio to proportion</b>: if the ratio is $3 : 5$, the total parts = $3 + 5 = 8$. The first part is $\\frac{3}{8}$ of the whole.<br>' +
    '• <b>Sharing in a ratio</b>: find the total parts, work out the value of one part, multiply for each share.<br>' +
    '• <b>Proportion problems</b>: if 4 pens cost $\\$6$, then 1 pen costs $\\$1.50$, so 7 pens cost $7 \\times \\$1.50 = \\$10.50$ (unitary method).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Show the total number of parts clearly. If sharing $\\$60$ in the ratio $2 : 3$, write: total = $2 + 3 = 5$ parts, one part = $\\$60 \\div 5 = \\$12$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Make sure units match before simplifying. $20$ cm $: 1$ m $\\neq 20 : 1$. Convert: $20$ cm $: 100$ cm $= 1 : 5$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>比</b>用于比较两个或多个量，用冒号表示，如 $3 : 5$。<br>' +
    '• <b>比例</b>比较部分与整体，可以用分数、小数或百分数表示。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>化简比</b>：各部分同除以最大公因数。如 $12 : 8 = 3 : 2$（同除以 4）。<br>' +
    '• <b>不同单位的比</b>：先统一单位。如 2 kg : 500 g = 2000 g : 500 g = $4 : 1$。<br>' +
    '• <b>比与比例的关系</b>：比为 $3 : 5$ 时，总份数 = $3 + 5 = 8$，第一部分占整体的 $\\frac{3}{8}$。<br>' +
    '• <b>按比分配</b>：求总份数 $\\to$ 求每份的值 $\\to$ 乘以各自份数。<br>' +
    '• <b>正比例问题</b>：4 支笔 $\\$6$，则 1 支 $\\$1.50$，7 支 $= 7 \\times \\$1.50 = \\$10.50$（单位量法）。<br><br>' +
    '<b>考试技巧</b><br>' +
    '清楚写出总份数。如将 $\\$60$ 按 $2 : 3$ 分配：总 = $2 + 3 = 5$ 份，每份 = $\\$60 \\div 5 = \\$12$。<br><br>' +
    '<b>注意！</b><br>' +
    '化简前要确保单位一致。$20$ cm $: 1$ m $\\neq 20 : 1$。应转换：$20$ cm $: 100$ cm $= 1 : 5$。'
});

add('hhk', 'Y7.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Share $\\$45$ between Ali and Ben in the ratio $2 : 7$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total parts = $2 + 7 = 9$<br>' +
    'One part = $\\$45 \\div 9 = \\$5$<br>' +
    'Ali gets $2 \\times \\$5 = \\$10$<br>' +
    'Ben gets $7 \\times \\$5 = \\$35$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    '5 notebooks cost $\\$8$. How much do 12 notebooks cost?<br><br>' +
    '<b>Solution:</b><br>' +
    'Cost of 1 notebook = $\\$8 \\div 5 = \\$1.60$<br>' +
    'Cost of 12 notebooks = $12 \\times \\$1.60 = \\$19.20$<br><br>' +
    '<b>Exam Tip:</b> For proportion problems, always find the value of 1 unit first (the unitary method). Check your answer makes sense — 12 notebooks should cost more than 5.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '将 $\\$45$ 按 $2 : 7$ 分给 Ali 和 Ben。<br><br>' +
    '<b>解答：</b><br>' +
    '总份数 = $2 + 7 = 9$<br>' +
    '每份 = $\\$45 \\div 9 = \\$5$<br>' +
    'Ali 得 $2 \\times \\$5 = \\$10$<br>' +
    'Ben 得 $7 \\times \\$5 = \\$35$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '5 本笔记本 $\\$8$，12 本多少钱？<br><br>' +
    '<b>解答：</b><br>' +
    '1 本的价格 = $\\$8 \\div 5 = \\$1.60$<br>' +
    '12 本的价格 = $12 \\times \\$1.60 = \\$19.20$<br><br>' +
    '<b>考试技巧：</b>做比例题时，先求出 1 个单位的值（单位量法）。检查答案是否合理——12 本应该比 5 本贵。'
});

add('hhk', 'Y7.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Percent</b> means "out of 100". $25\\% = \\frac{25}{100} = 0.25$.<br>' +
    '• Common conversions: $50\\% = \\frac{1}{2}$, $25\\% = \\frac{1}{4}$, $10\\% = \\frac{1}{10}$, $1\\% = \\frac{1}{100}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Fraction $\\to$ percentage</b>: $\\frac{3}{5} = \\frac{3}{5} \\times 100\\% = 60\\%$.<br>' +
    '• <b>Decimal $\\to$ percentage</b>: multiply by 100. $0.35 = 35\\%$.<br>' +
    '• <b>Percentage $\\to$ decimal</b>: divide by 100. $45\\% = 0.45$.<br>' +
    '• <b>Percentage of a quantity</b>: $15\\%$ of $80 = 0.15 \\times 80 = 12$. Or find $10\\%$ and $5\\%$ by halving.<br>' +
    '• <b>One quantity as a percentage of another</b>: $\\frac{\\text{part}}{\\text{whole}} \\times 100\\%$. E.g. 18 out of 30 = $\\frac{18}{30} \\times 100\\% = 60\\%$.<br>' +
    '• <b>Percentage increase</b>: new amount = original $\\times (1 + \\frac{\\%}{100})$. E.g. increase 60 by 20% = $60 \\times 1.2 = 72$.<br>' +
    '• <b>Percentage decrease</b>: new amount = original $\\times (1 - \\frac{\\%}{100})$. E.g. decrease 80 by 15% = $80 \\times 0.85 = 68$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Use the multiplier method: for a 30% increase, multiply by 1.3. For a 30% decrease, multiply by 0.7. This is quicker and avoids errors.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A percentage increase followed by the same percentage decrease does NOT return to the original value. E.g. $100 \\xrightarrow{+10\\%} 110 \\xrightarrow{-10\\%} 99$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>百分数</b>表示"每 100 中有多少"。$25\\% = \\frac{25}{100} = 0.25$。<br>' +
    '• 常用转换：$50\\% = \\frac{1}{2}$，$25\\% = \\frac{1}{4}$，$10\\% = \\frac{1}{10}$，$1\\% = \\frac{1}{100}$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>分数 $\\to$ 百分数</b>：$\\frac{3}{5} = \\frac{3}{5} \\times 100\\% = 60\\%$。<br>' +
    '• <b>小数 $\\to$ 百分数</b>：乘以 100。$0.35 = 35\\%$。<br>' +
    '• <b>百分数 $\\to$ 小数</b>：除以 100。$45\\% = 0.45$。<br>' +
    '• <b>求一个数的百分之几</b>：$80$ 的 $15\\% = 0.15 \\times 80 = 12$。也可先求 $10\\%$，再求 $5\\%$。<br>' +
    '• <b>一个量是另一个量的百分之几</b>：$\\frac{\\text{部分}}{\\text{整体}} \\times 100\\%$。如 30 中的 18 = $\\frac{18}{30} \\times 100\\% = 60\\%$。<br>' +
    '• <b>百分数增加</b>：新值 = 原值 $\\times (1 + \\frac{\\%}{100})$。如 60 增加 20% = $60 \\times 1.2 = 72$。<br>' +
    '• <b>百分数减少</b>：新值 = 原值 $\\times (1 - \\frac{\\%}{100})$。如 80 减少 15% = $80 \\times 0.85 = 68$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '用乘数法：增加 30% 就乘 1.3，减少 30% 就乘 0.7。这样更快，不容易出错。<br><br>' +
    '<b>注意！</b><br>' +
    '先增加再减少相同百分数，结果不等于原值。如 $100 \\xrightarrow{+10\\%} 110 \\xrightarrow{-10\\%} 99$。'
});

add('hhk', 'Y7.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Calculate 35% of 240.<br><br>' +
    '<b>Solution:</b><br>' +
    '$35\\%$ of $240 = 0.35 \\times 240 = 84$<br>' +
    'Or: $10\\% = 24$, $30\\% = 72$, $5\\% = 12$, so $35\\% = 72 + 12 = 84$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A jacket costs $\\$80$. It is reduced by 15% in a sale. What is the sale price?<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiplier for 15% decrease = $1 - 0.15 = 0.85$<br>' +
    'Sale price = $80 \\times 0.85 = \\$68$<br><br>' +
    '<b>Exam Tip:</b> Use the multiplier method for percentage changes. For a decrease, subtract the percentage from 1. Always show the multiplier clearly for full marks.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '计算 240 的 35%。<br><br>' +
    '<b>解答：</b><br>' +
    '$240$ 的 $35\\% = 0.35 \\times 240 = 84$<br>' +
    '或：$10\\% = 24$，$30\\% = 72$，$5\\% = 12$，所以 $35\\% = 72 + 12 = 84$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一件夹克 $\\$80$，打折 15%。求打折后价格。<br><br>' +
    '<b>解答：</b><br>' +
    '减少 15% 的乘数 = $1 - 0.15 = 0.85$<br>' +
    '折后价 = $80 \\times 0.85 = \\$68$<br><br>' +
    '<b>考试技巧：</b>百分数变化用乘数法。减少时，用 1 减去百分数。要清楚写出乘数才能得满分。'
});

add('hhk', 'Y7.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>circle</b> is the set of all points a fixed distance from the centre.<br>' +
    '• <b>Radius</b> ($r$): distance from centre to edge. <b>Diameter</b> ($d$): distance across through the centre. $d = 2r$.<br>' +
    '• <b>Circumference</b>: the perimeter of a circle. <b>Chord</b>: a straight line joining two points on the circle. <b>Tangent</b>: a line that touches the circle at one point.<br>' +
    '• <b>Arc</b>: a part of the circumference. <b>Sector</b>: a "pizza slice" (region between two radii and an arc). <b>Segment</b>: region between a chord and an arc.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Circumference</b> = $\\pi d = 2\\pi r$.<br>' +
    '• <b>Area</b> = $\\pi r^2$. Always use the radius, not the diameter.<br>' +
    '• <b>Arc length</b> = $\\frac{\\theta}{360} \\times 2\\pi r$ where $\\theta$ is the angle at the centre.<br>' +
    '• <b>Sector area</b> = $\\frac{\\theta}{360} \\times \\pi r^2$.<br>' +
    '• <b>Cylinder surface area</b> = $2\\pi r^2 + 2\\pi rh$ (two circles + curved surface).<br>' +
    '• <b>Cylinder volume</b> = $\\pi r^2 h$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'If the question says "leave your answer in terms of $\\pi$", do NOT use a calculator to evaluate $\\pi$. Just leave $\\pi$ as a symbol in your answer.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'If you are given the diameter, halve it to get the radius before using $\\pi r^2$. A very common mistake is to use the diameter in the area formula.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>圆</b>是到圆心距离相等的所有点的集合。<br>' +
    '• <b>半径</b>（$r$）：圆心到圆周的距离。<b>直径</b>（$d$）：经过圆心的弦。$d = 2r$。<br>' +
    '• <b>周长</b>：圆的边界长度。<b>弦</b>：连接圆上两点的线段。<b>切线</b>：与圆只有一个交点的直线。<br>' +
    '• <b>弧</b>：圆周的一部分。<b>扇形</b>：两条半径与弧围成的区域（"披萨片"形状）。<b>弓形</b>：弦与弧围成的区域。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>周长</b> = $\\pi d = 2\\pi r$。<br>' +
    '• <b>面积</b> = $\\pi r^2$。一定用半径，不是直径。<br>' +
    '• <b>弧长</b> = $\\frac{\\theta}{360} \\times 2\\pi r$，其中 $\\theta$ 是圆心角。<br>' +
    '• <b>扇形面积</b> = $\\frac{\\theta}{360} \\times \\pi r^2$。<br>' +
    '• <b>圆柱表面积</b> = $2\\pi r^2 + 2\\pi rh$（两个圆面 + 侧面）。<br>' +
    '• <b>圆柱体积</b> = $\\pi r^2 h$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '如果题目说"用 $\\pi$ 表示答案"，就不要用计算器算出 $\\pi$ 的值，直接保留 $\\pi$ 符号。<br><br>' +
    '<b>注意！</b><br>' +
    '如果给的是直径，先除以 2 得到半径再代入 $\\pi r^2$。用直径代入面积公式是最常见的错误。'
});

add('hhk', 'Y7.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A circle has radius 7 cm. Calculate its circumference and area. Give your answers to 1 decimal place.<br><br>' +
    '<b>Solution:</b><br>' +
    'Circumference = $2\\pi r = 2 \\times \\pi \\times 7 = 14\\pi = 44.0$ cm (1 d.p.)<br>' +
    'Area = $\\pi r^2 = \\pi \\times 7^2 = 49\\pi = 153.9$ cm$^2$ (1 d.p.)<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A sector has radius 10 cm and angle $72°$. Find the arc length and sector area. Leave your answer in terms of $\\pi$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Arc length = $\\frac{72}{360} \\times 2\\pi \\times 10 = \\frac{1}{5} \\times 20\\pi = 4\\pi$ cm<br>' +
    'Sector area = $\\frac{72}{360} \\times \\pi \\times 10^2 = \\frac{1}{5} \\times 100\\pi = 20\\pi$ cm$^2$<br><br>' +
    '<b>Exam Tip:</b> Simplify the fraction $\\frac{\\theta}{360}$ first — it often cancels nicely. This reduces calculation errors.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个圆的半径为 7 cm。计算其周长和面积，保留 1 位小数。<br><br>' +
    '<b>解答：</b><br>' +
    '周长 = $2\\pi r = 2 \\times \\pi \\times 7 = 14\\pi = 44.0$ cm（1 位小数）<br>' +
    '面积 = $\\pi r^2 = \\pi \\times 7^2 = 49\\pi = 153.9$ cm$^2$（1 位小数）<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个扇形半径 10 cm，圆心角 $72°$。求弧长和扇形面积，用 $\\pi$ 表示。<br><br>' +
    '<b>解答：</b><br>' +
    '弧长 = $\\frac{72}{360} \\times 2\\pi \\times 10 = \\frac{1}{5} \\times 20\\pi = 4\\pi$ cm<br>' +
    '扇形面积 = $\\frac{72}{360} \\times \\pi \\times 10^2 = \\frac{1}{5} \\times 100\\pi = 20\\pi$ cm$^2$<br><br>' +
    '<b>考试技巧：</b>先化简分数 $\\frac{\\theta}{360}$——通常可以约分。这能减少计算错误。'
});

add('hhk', 'Y7.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>cylinder</b> has two parallel circular faces and a curved surface.<br>' +
    '• A <b>cone</b> has one circular base and a curved surface that tapers to a point (apex).<br>' +
    '• The <b>slant height</b> ($l$) of a cone is the distance from the apex to the edge of the base. It is NOT the same as the vertical height ($h$).<br>' +
    '• By Pythagoras: $l = \\sqrt{r^2 + h^2}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Circumference</b> = $2\\pi r$, <b>Area of circle</b> = $\\pi r^2$.<br>' +
    '• <b>Volume of cylinder</b> = $\\pi r^2 h$ (area of cross-section $\\times$ height).<br>' +
    '• <b>Volume of cone</b> = $\\frac{1}{3}\\pi r^2 h$ (one-third of the cylinder volume).<br>' +
    '• <b>Curved surface area of cylinder</b> = $2\\pi rh$ (imagine unrolling it into a rectangle).<br>' +
    '• <b>Total surface area of cylinder</b> = $2\\pi rh + 2\\pi r^2$.<br>' +
    '• <b>Curved surface area of cone</b> = $\\pi rl$ (where $l$ is the slant height).<br>' +
    '• <b>Total surface area of cone</b> = $\\pi rl + \\pi r^2$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Read carefully: does the question ask for volume or surface area? Does it want the curved surface area only, or the total (including the base)? These give very different answers.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'The cone volume formula uses the <b>vertical height</b> $h$, not the slant height $l$. If you are given $l$, use Pythagoras to find $h$ first: $h = \\sqrt{l^2 - r^2}$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>圆柱体</b>有两个平行的圆面和一个侧面。<br>' +
    '• <b>圆锥体</b>有一个圆形底面，侧面从底边收到顶点。<br>' +
    '• 圆锥的<b>斜高</b>（$l$）是从顶点到底边的距离，不同于垂直高度（$h$）。<br>' +
    '• 由勾股定理：$l = \\sqrt{r^2 + h^2}$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>周长</b> = $2\\pi r$，<b>圆面积</b> = $\\pi r^2$。<br>' +
    '• <b>圆柱体积</b> = $\\pi r^2 h$（截面积 $\\times$ 高）。<br>' +
    '• <b>圆锥体积</b> = $\\frac{1}{3}\\pi r^2 h$（圆柱体积的三分之一）。<br>' +
    '• <b>圆柱侧面积</b> = $2\\pi rh$（可以想象展开成长方形）。<br>' +
    '• <b>圆柱全面积</b> = $2\\pi rh + 2\\pi r^2$。<br>' +
    '• <b>圆锥侧面积</b> = $\\pi rl$（$l$ 为斜高）。<br>' +
    '• <b>圆锥全面积</b> = $\\pi rl + \\pi r^2$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '仔细审题：要求的是体积还是表面积？是仅侧面积还是全面积（含底面）？结果差别很大。<br><br>' +
    '<b>注意！</b><br>' +
    '圆锥体积公式用的是<b>垂直高度</b> $h$，不是斜高 $l$。如果给的是 $l$，先用勾股定理求 $h$：$h = \\sqrt{l^2 - r^2}$。'
});

add('hhk', 'Y7.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A cylinder has radius 5 cm and height 12 cm. Calculate its volume and total surface area. Give your answers to 3 significant figures.<br><br>' +
    '<b>Solution:</b><br>' +
    'Volume = $\\pi r^2 h = \\pi \\times 5^2 \\times 12 = 300\\pi = 942$ cm$^3$ (3 s.f.)<br>' +
    'Total SA = $2\\pi r^2 + 2\\pi rh = 2\\pi(25) + 2\\pi(5)(12) = 50\\pi + 120\\pi = 170\\pi = 534$ cm$^2$ (3 s.f.)<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A cone has radius 6 cm and slant height 10 cm. Find its volume to 1 decimal place.<br><br>' +
    '<b>Solution:</b><br>' +
    'First find the vertical height using Pythagoras:<br>' +
    '$h = \\sqrt{l^2 - r^2} = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8$ cm<br>' +
    'Volume = $\\frac{1}{3}\\pi r^2 h = \\frac{1}{3} \\times \\pi \\times 6^2 \\times 8 = \\frac{288\\pi}{3} = 96\\pi = 301.6$ cm$^3$ (1 d.p.)<br><br>' +
    '<b>Exam Tip:</b> If a cone question gives you the slant height, you almost certainly need Pythagoras to find the vertical height first. Show this step clearly.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个圆柱体半径 5 cm，高 12 cm。计算体积和全面积，保留 3 位有效数字。<br><br>' +
    '<b>解答：</b><br>' +
    '体积 = $\\pi r^2 h = \\pi \\times 5^2 \\times 12 = 300\\pi = 942$ cm$^3$（3 位有效数字）<br>' +
    '全面积 = $2\\pi r^2 + 2\\pi rh = 2\\pi(25) + 2\\pi(5)(12) = 50\\pi + 120\\pi = 170\\pi = 534$ cm$^2$（3 位有效数字）<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个圆锥半径 6 cm，斜高 10 cm。求体积，保留 1 位小数。<br><br>' +
    '<b>解答：</b><br>' +
    '先用勾股定理求垂直高度：<br>' +
    '$h = \\sqrt{l^2 - r^2} = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8$ cm<br>' +
    '体积 = $\\frac{1}{3}\\pi r^2 h = \\frac{1}{3} \\times \\pi \\times 6^2 \\times 8 = \\frac{288\\pi}{3} = 96\\pi = 301.6$ cm$^3$（1 位小数）<br><br>' +
    '<b>考试技巧：</b>如果圆锥题给的是斜高，几乎一定要先用勾股定理求垂直高度。这一步要写清楚。'
});

add('hhk', 'Y7.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>sequence</b> is an ordered list of numbers following a pattern.<br>' +
    '• Each number in a sequence is called a <b>term</b>.<br>' +
    '• A <b>linear sequence</b> has a constant difference between consecutive terms (the common difference).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Term-to-term rule</b>: describes how to get from one term to the next. E.g. "add 3 each time".<br>' +
    '• <b>Position-to-term rule</b>: links the position number ($n$) to the term value. E.g. "multiply the position by 3 then add 1".<br>' +
    '• <b>The $n$th term</b> of a linear sequence has the form $an + b$, where:<br>' +
    '  - $a$ = common difference<br>' +
    '  - $b$ = zero term (the term before the first term, i.e. the value when $n = 0$)<br>' +
    '• To find $b$: subtract the common difference from the first term. $b = \\text{first term} - a$.<br>' +
    '• <b>Using the $n$th term</b>: substitute any value of $n$ to find that term. E.g. if $n$th term = $3n + 1$, then the 20th term = $3(20) + 1 = 61$.<br>' +
    '• To check if a value is in the sequence, set $an + b = \\text{value}$ and solve for $n$. If $n$ is a positive whole number, the value is in the sequence.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always check your $n$th term formula by substituting $n = 1$ and $n = 2$ to see if you get the correct first two terms.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'The common difference is $a$, not $b$. In the sequence 5, 8, 11, 14, ... the common difference is 3, so $a = 3$, and $b = 5 - 3 = 2$. The $n$th term is $3n + 2$, NOT $5n + 3$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>数列</b>是按规律排列的一组数。<br>' +
    '• 数列中的每个数叫做一个<b>项</b>。<br>' +
    '• <b>等差数列</b>（线性数列）：相邻两项之差恒定（公差）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>递推规则</b>：描述如何从一项得到下一项。如"每次加 3"。<br>' +
    '• <b>通项规则</b>：将位置号（$n$）与项值联系起来。如"位置号乘 3 再加 1"。<br>' +
    '• <b>第 $n$ 项公式</b>形如 $an + b$，其中：<br>' +
    '  - $a$ = 公差<br>' +
    '  - $b$ = 零项（第一项前面的项，即 $n = 0$ 时的值）<br>' +
    '• 求 $b$：用第一项减去公差。$b = \\text{首项} - a$。<br>' +
    '• <b>使用第 $n$ 项公式</b>：代入 $n$ 的值求该项。如第 $n$ 项 = $3n + 1$，则第 20 项 = $3(20) + 1 = 61$。<br>' +
    '• 判断某值是否在数列中：令 $an + b = \\text{该值}$，解出 $n$。若 $n$ 为正整数，则该值在数列中。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求出第 $n$ 项公式后，代入 $n = 1$ 和 $n = 2$ 验证是否得到正确的前两项。<br><br>' +
    '<b>注意！</b><br>' +
    '公差是 $a$，不是 $b$。数列 5, 8, 11, 14, ... 公差为 3，所以 $a = 3$，$b = 5 - 3 = 2$。第 $n$ 项是 $3n + 2$，不是 $5n + 3$。'
});

add('hhk', 'Y7.9', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Find the $n$th term of the sequence: 7, 11, 15, 19, ...<br><br>' +
    '<b>Solution:</b><br>' +
    'Common difference: $11 - 7 = 4$, so $a = 4$.<br>' +
    '$b = \\text{first term} - a = 7 - 4 = 3$.<br>' +
    '$n$th term = $4n + 3$.<br>' +
    'Check: $n = 1$: $4(1) + 3 = 7$ ✓, $n = 2$: $4(2) + 3 = 11$ ✓<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'The $n$th term of a sequence is $5n - 2$.<br>' +
    '(a) Find the 50th term.<br>' +
    '(b) Is 143 a term in this sequence?<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) 50th term = $5(50) - 2 = 250 - 2 = 248$<br>' +
    '(b) Set $5n - 2 = 143$<br>' +
    '$5n = 145$<br>' +
    '$n = 29$<br>' +
    'Since $n = 29$ is a positive integer, yes, 143 is the 29th term.<br><br>' +
    '<b>Exam Tip:</b> To check whether a number belongs to the sequence, solve $an + b = \\text{number}$. If $n$ is a whole positive number, it is in the sequence.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '求数列 7, 11, 15, 19, ... 的第 $n$ 项公式。<br><br>' +
    '<b>解答：</b><br>' +
    '公差：$11 - 7 = 4$，所以 $a = 4$。<br>' +
    '$b = \\text{首项} - a = 7 - 4 = 3$。<br>' +
    '第 $n$ 项 = $4n + 3$。<br>' +
    '验证：$n = 1$：$4(1) + 3 = 7$ ✓，$n = 2$：$4(2) + 3 = 11$ ✓<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个数列的第 $n$ 项为 $5n - 2$。<br>' +
    '(a) 求第 50 项。<br>' +
    '(b) 143 是否在这个数列中？<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 第 50 项 = $5(50) - 2 = 250 - 2 = 248$<br>' +
    '(b) 令 $5n - 2 = 143$<br>' +
    '$5n = 145$<br>' +
    '$n = 29$<br>' +
    '因为 $n = 29$ 是正整数，所以 143 是第 29 项，属于该数列。<br><br>' +
    '<b>考试技巧：</b>判断某数是否在数列中，令 $an + b = \\text{该数}$，解出 $n$。若 $n$ 为正整数则属于数列。'
});

add('hhk', 'Y7.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Probability measures how likely an event is. It ranges from 0 (impossible) to 1 (certain).<br>' +
    '• $P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$.<br>' +
    '• Probabilities can be written as fractions, decimals, or percentages.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Complement rule</b>: $P(\\text{not } A) = 1 - P(A)$. E.g. if $P(\\text{rain}) = 0.3$, then $P(\\text{no rain}) = 0.7$.<br>' +
    '• <b>Theoretical probability</b>: calculated from equally likely outcomes (e.g. rolling a fair die).<br>' +
    '• <b>Experimental probability (relative frequency)</b>: $\\frac{\\text{number of times event occurs}}{\\text{total number of trials}}$. The more trials, the closer it gets to the theoretical probability.<br>' +
    '• <b>Two-way tables</b>: read across rows and down columns. The totals help you find probabilities.<br>' +
    '• <b>Venn diagrams</b>: show overlapping sets. The intersection shows items in both sets. To find $P(A \\text{ or } B)$, add all regions inside the circles.<br>' +
    '• All probabilities in a sample space must add up to 1.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always simplify probability fractions. If the question asks for a probability, make sure your answer is between 0 and 1 (or 0% and 100%).<br><br>' +
    '<b>Watch Out!</b><br>' +
    'In a Venn diagram, the intersection is NOT added twice when finding $P(A \\text{ or } B)$. Count each item only once.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 概率衡量事件发生的可能性，范围从 0（不可能）到 1（一定发生）。<br>' +
    '• $P(\\text{事件}) = \\frac{\\text{有利结果数}}{\\text{总结果数}}$。<br>' +
    '• 概率可以用分数、小数或百分数表示。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>互补规则</b>：$P(\\text{非 } A) = 1 - P(A)$。如 $P(\\text{下雨}) = 0.3$，则 $P(\\text{不下雨}) = 0.7$。<br>' +
    '• <b>理论概率</b>：基于等可能结果计算（如掷公平骰子）。<br>' +
    '• <b>实验概率（相对频率）</b>：$\\frac{\\text{事件发生次数}}{\\text{总试验次数}}$。试验次数越多，实验概率越接近理论概率。<br>' +
    '• <b>双向表</b>：横读行、纵读列，合计栏帮助计算概率。<br>' +
    '• <b>韦恩图</b>：展示集合的交叉关系。交集区域表示同时属于两个集合。求 $P(A \\text{ 或 } B)$，加上圆内所有区域。<br>' +
    '• 样本空间中所有概率之和 = 1。<br><br>' +
    '<b>考试技巧</b><br>' +
    '概率分数要化简。答案必须在 0 到 1（或 0% 到 100%）之间。<br><br>' +
    '<b>注意！</b><br>' +
    '韦恩图中求 $P(A \\text{ 或 } B)$ 时，交集部分不能重复加。每个元素只计一次。'
});

add('hhk', 'Y7.10', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'A bag contains 3 red, 5 blue and 2 green balls. A ball is picked at random. Find the probability it is NOT blue.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total balls = $3 + 5 + 2 = 10$<br>' +
    '$P(\\text{blue}) = \\frac{5}{10} = \\frac{1}{2}$<br>' +
    '$P(\\text{not blue}) = 1 - \\frac{1}{2} = \\frac{1}{2}$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A spinner is spun 200 times. It lands on red 72 times.<br>' +
    '(a) Find the relative frequency of red.<br>' +
    '(b) The theoretical probability of red is $\\frac{1}{3}$. Compare the results.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Relative frequency = $\\frac{72}{200} = \\frac{9}{25} = 0.36$<br>' +
    '(b) Theoretical probability = $\\frac{1}{3} \\approx 0.333$<br>' +
    'The experimental probability (0.36) is close to, but slightly higher than, the theoretical probability (0.333). With more trials, we would expect the relative frequency to get closer to $\\frac{1}{3}$.<br><br>' +
    '<b>Exam Tip:</b> When comparing theoretical and experimental probabilities, explain that more trials give a better estimate. Use the word "relative frequency" for experimental probability.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '一个袋子里有 3 个红球、5 个蓝球和 2 个绿球。随机取一个球，求不是蓝球的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '总球数 = $3 + 5 + 2 = 10$<br>' +
    '$P(\\text{蓝}) = \\frac{5}{10} = \\frac{1}{2}$<br>' +
    '$P(\\text{非蓝}) = 1 - \\frac{1}{2} = \\frac{1}{2}$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个转盘转了 200 次，落在红色 72 次。<br>' +
    '(a) 求红色的相对频率。<br>' +
    '(b) 红色的理论概率为 $\\frac{1}{3}$，比较结果。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 相对频率 = $\\frac{72}{200} = \\frac{9}{25} = 0.36$<br>' +
    '(b) 理论概率 = $\\frac{1}{3} \\approx 0.333$<br>' +
    '实验概率 (0.36) 接近但略高于理论概率 (0.333)。试验次数越多，相对频率会越接近 $\\frac{1}{3}$。<br><br>' +
    '<b>考试技巧：</b>比较理论概率和实验概率时，要说明增加试验次数能得到更好的估计。实验概率要用"相对频率"这个术语。'
});

add('hhk', 'Y7.11', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Constructions</b> are accurate drawings made using only a straight edge (ruler) and compasses. No protractor is used.<br>' +
    '• You must leave all your construction arcs visible — do NOT rub them out. They show your method.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Perpendicular bisector</b> of a line segment:<br>' +
    '  1. Open compasses to more than half the length of the line.<br>' +
    '  2. Place the point on one end, draw arcs above and below the line.<br>' +
    '  3. Repeat from the other end (same compass width).<br>' +
    '  4. Draw a straight line through the two intersection points. This line is at right angles to the original and passes through its midpoint.<br>' +
    '• <b>Angle bisector</b>:<br>' +
    '  1. Place compasses on the vertex, draw an arc that crosses both arms of the angle.<br>' +
    '  2. From each intersection point, draw arcs of equal radius that cross each other.<br>' +
    '  3. Draw a line from the vertex through the crossing point. This line splits the angle exactly in half.<br>' +
    '• <b>Drawing circles and arcs</b>: set the compass width to the required radius. Place the point on the centre and draw.<br>' +
    '• These constructions are the basis for <b>loci</b> problems (the set of all points following a rule).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always leave your construction arcs showing. If the question says "using ruler and compasses only", you will lose marks for using a protractor.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Make sure your compass width does NOT change while you draw an arc. Hold the compasses at the top and turn smoothly.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>尺规作图</b>只用直尺和圆规完成，不用量角器。<br>' +
    '• 必须保留所有作图弧线——不要擦掉，它们展示你的方法。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>线段的垂直平分线</b>：<br>' +
    '  1. 圆规张开到超过线段长度的一半。<br>' +
    '  2. 将圆规针脚放在一端，在线段上下各画弧。<br>' +
    '  3. 圆规宽度不变，在另一端重复操作。<br>' +
    '  4. 过两个交点画直线。这条线垂直于原线段并过其中点。<br>' +
    '• <b>角平分线</b>：<br>' +
    '  1. 将圆规放在角的顶点，画弧与角的两边相交。<br>' +
    '  2. 分别以两个交点为圆心，用相同半径画弧使其相交。<br>' +
    '  3. 从顶点过交叉点画直线，这条线将角精确地一分为二。<br>' +
    '• <b>画圆和弧</b>：将圆规张开到所需半径，把针脚放在圆心上画。<br>' +
    '• 这些作图方法是<b>轨迹</b>（满足某条件的所有点的集合）问题的基础。<br><br>' +
    '<b>考试技巧</b><br>' +
    '一定要保留作图弧线。如果题目说"仅用直尺和圆规"，使用量角器会扣分。<br><br>' +
    '<b>注意！</b><br>' +
    '画弧时圆规宽度不能变。握住圆规顶端，平稳转动。'
});

add('hhk', 'Y7.11', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Construct the perpendicular bisector of a line segment $AB$ of length 8 cm.<br><br>' +
    '<b>Solution:</b><br>' +
    '1. Draw line $AB = 8$ cm.<br>' +
    '2. Set compass width to more than 4 cm (say 5 cm).<br>' +
    '3. With centre $A$, draw arcs above and below $AB$.<br>' +
    '4. With centre $B$ (same width), draw arcs above and below $AB$.<br>' +
    '5. Mark the two points where the arcs cross. Join them with a straight line.<br>' +
    'This line is the perpendicular bisector. It passes through the midpoint of $AB$ at $90°$.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'Construct the bisector of angle $PQR$ which is $60°$.<br><br>' +
    '<b>Solution:</b><br>' +
    '1. With centre $Q$, draw an arc crossing $QP$ at $X$ and $QR$ at $Y$.<br>' +
    '2. With centre $X$, draw an arc between the arms.<br>' +
    '3. With centre $Y$ (same radius), draw an arc to cross the first arc at $Z$.<br>' +
    '4. Draw ray $QZ$. This bisects angle $PQR$ into two $30°$ angles.<br><br>' +
    '<b>Exam Tip:</b> Keep your pencil sharp for accurate constructions. Always use the same compass width for paired arcs. Leave all arcs visible for full marks.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '作线段 $AB$（长 8 cm）的垂直平分线。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 画线段 $AB = 8$ cm。<br>' +
    '2. 圆规张开到大于 4 cm（如 5 cm）。<br>' +
    '3. 以 $A$ 为圆心，在 $AB$ 上下各画弧。<br>' +
    '4. 以 $B$ 为圆心（宽度不变），在 $AB$ 上下各画弧。<br>' +
    '5. 标出弧线的两个交点，用直线连接。<br>' +
    '这条线就是垂直平分线，过 $AB$ 中点且与 $AB$ 成 $90°$。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '作 $60°$ 角 $PQR$ 的角平分线。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 以 $Q$ 为圆心画弧，分别交 $QP$ 于 $X$、交 $QR$ 于 $Y$。<br>' +
    '2. 以 $X$ 为圆心画弧（在角的内部）。<br>' +
    '3. 以 $Y$ 为圆心（相同半径）画弧，与上一步的弧交于 $Z$。<br>' +
    '4. 画射线 $QZ$，它将角 $PQR$ 平分为两个 $30°$ 角。<br><br>' +
    '<b>考试技巧：</b>铅笔要削尖以确保精确。配对的弧必须用相同圆规宽度。保留所有弧线才能得满分。'
});


/* ══════════════════════════════════════════════════
   HHK Y8
   ══════════════════════════════════════════════════ */

add('hhk', 'Y8.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Directed numbers</b> include positive and negative numbers. They can be shown on a <b>number line</b>.<br>' +
    '• Numbers to the right are greater; numbers to the left are smaller. E.g. $-3 < -1 < 0 < 2$.<br>' +
    '• The <b>absolute value</b> (modulus) of a number is its distance from zero: $|{-5}| = 5$, $|3| = 3$.<br>' +
    '• <b>Opposite numbers</b> are the same distance from zero on each side: $3$ and $-3$ are opposites.<br>' +
    '• To <b>compare fractions</b>, convert to the same denominator or to decimals.<br>' +
    '• Equivalent forms: $\\frac{1}{4} = 0.25 = 25\\%$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Add / subtract negative numbers: $5 + (-3) = 5 - 3 = 2$; $-4 - (-2) = -4 + 2 = -2$.<br>' +
    '• Multiply / divide signs: <i>same signs</i> $\\to$ positive; <i>different signs</i> $\\to$ negative.<br>' +
    '• Order fractions, decimals and percentages by converting to the same form.<br>' +
    '• Round to decimal places (d.p.) or significant figures (s.f.).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When ordering negative numbers, draw a number line to avoid mistakes. The further left, the smaller the value.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$-(-3) = +3$, not $-3$. Subtracting a negative is the same as adding a positive.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>有向数</b>包括正数和负数，可以用<b>数轴</b>表示。<br>' +
    '• 数轴上越靠右数越大，越靠左越小。例如 $-3 < -1 < 0 < 2$。<br>' +
    '• 一个数的<b>绝对值</b>（模）是它到零的距离：$|{-5}| = 5$，$|3| = 3$。<br>' +
    '• <b>相反数</b>到零的距离相同但方向相反：$3$ 和 $-3$ 互为相反数。<br>' +
    '• <b>比较分数</b>大小时，可通分或转化为小数。<br>' +
    '• 等价形式：$\\frac{1}{4} = 0.25 = 25\\%$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 负数加减：$5 + (-3) = 5 - 3 = 2$；$-4 - (-2) = -4 + 2 = -2$。<br>' +
    '• 乘除符号法则：<i>同号</i> $\\to$ 正；<i>异号</i> $\\to$ 负。<br>' +
    '• 将分数、小数和百分数转化为同一形式后排序。<br>' +
    '• 按小数位数（d.p.）或有效数字（s.f.）四舍五入。<br><br>' +
    '<b>考试技巧</b><br>' +
    '排序负数时画数轴，避免出错。越靠左数值越小。<br><br>' +
    '<b>注意！</b><br>' +
    '$-(-3) = +3$，不是 $-3$。减去一个负数等于加上一个正数。'
});

add('hhk', 'Y8.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Put these numbers in order from smallest to largest: $0.3$, $\\frac{1}{4}$, $-0.5$, $\\frac{2}{5}$, $-\\frac{3}{4}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Convert to decimals:<br>' +
    '$\\frac{1}{4} = 0.25$, $\\frac{2}{5} = 0.4$, $-\\frac{3}{4} = -0.75$<br>' +
    'Order: $-0.75 < -0.5 < 0.25 < 0.3 < 0.4$<br>' +
    'So: $-\\frac{3}{4}$, $-0.5$, $\\frac{1}{4}$, $0.3$, $\\frac{2}{5}$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Calculate $(-4) \\times 3 + (-2) \\times (-5)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$(-4) \\times 3 = -12$ (different signs $\\to$ negative)<br>' +
    '$(-2) \\times (-5) = 10$ (same signs $\\to$ positive)<br>' +
    '$-12 + 10 = -2$<br><br>' +
    '<b>Exam Tip:</b> Deal with each multiplication separately first, then combine. Always check the sign rules: same signs give positive, different signs give negative.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '将以下数从小到大排列：$0.3$，$\\frac{1}{4}$，$-0.5$，$\\frac{2}{5}$，$-\\frac{3}{4}$。<br><br>' +
    '<b>解答：</b><br>' +
    '转化为小数：<br>' +
    '$\\frac{1}{4} = 0.25$，$\\frac{2}{5} = 0.4$，$-\\frac{3}{4} = -0.75$<br>' +
    '排序：$-0.75 < -0.5 < 0.25 < 0.3 < 0.4$<br>' +
    '所以：$-\\frac{3}{4}$，$-0.5$，$\\frac{1}{4}$，$0.3$，$\\frac{2}{5}$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '计算 $(-4) \\times 3 + (-2) \\times (-5)$。<br><br>' +
    '<b>解答：</b><br>' +
    '$(-4) \\times 3 = -12$（异号 $\\to$ 负）<br>' +
    '$(-2) \\times (-5) = 10$（同号 $\\to$ 正）<br>' +
    '$-12 + 10 = -2$<br><br>' +
    '<b>考试技巧：</b>先分别算每个乘法，再合并结果。务必检查符号法则：同号得正，异号得负。'
});

add('hhk', 'Y8.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>rational number</b> can be written as $\\frac{p}{q}$ where $p, q$ are integers and $q \\neq 0$. All terminating and recurring decimals are rational.<br>' +
    '• An <b>irrational number</b> cannot be written as a fraction, e.g. $\\pi$, $\\sqrt{2}$.<br>' +
    '• <b>Real numbers</b> = rational numbers + irrational numbers. Every real number corresponds to a point on the number line.<br>' +
    '• A <b>factor</b> of a number divides into it exactly. E.g. factors of 12: 1, 2, 3, 4, 6, 12.<br>' +
    '• A <b>prime number</b> has exactly two factors: 1 and itself. Note: 1 is NOT prime.<br>' +
    '• <b>Prime factorisation</b>: writing a number as a product of prime factors, e.g. $60 = 2^2 \\times 3 \\times 5$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Use a factor tree or repeated division to find the <b>prime factorisation</b>.<br>' +
    '• <b>HCF</b> (Highest Common Factor): multiply the <i>common</i> primes with the <i>lowest</i> powers.<br>' +
    '• <b>LCM</b> (Lowest Common Multiple): multiply <i>all</i> primes with the <i>highest</i> powers.<br>' +
    '• Convert between fractions and decimals to compare values on a number line.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Write both numbers as products of prime factors before finding HCF or LCM. Use index notation in your final answer.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '1 is NOT a prime number. $0.\\overline{3} = \\frac{1}{3}$ is rational even though the decimal goes on forever (it repeats).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>有理数</b>可以写成 $\\frac{p}{q}$（$p, q$ 为整数，$q \\neq 0$）。所有有限小数和循环小数都是有理数。<br>' +
    '• <b>无理数</b>不能写成分数，如 $\\pi$，$\\sqrt{2}$。<br>' +
    '• <b>实数</b> = 有理数 + 无理数。每个实数对应数轴上一个点。<br>' +
    '• 一个数的<b>因数</b>能整除该数。例如 12 的因数：1, 2, 3, 4, 6, 12。<br>' +
    '• <b>质数</b>恰好有两个因数：1 和本身。注意：1 不是质数。<br>' +
    '• <b>质因数分解</b>：把一个数写成质因数的乘积，如 $60 = 2^2 \\times 3 \\times 5$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 用因数树或短除法进行<b>质因数分解</b>。<br>' +
    '• <b>HCF</b>（最大公因数）：取<i>公共</i>质因数的<i>最小</i>幂次之积。<br>' +
    '• <b>LCM</b>（最小公倍数）：取<i>所有</i>质因数的<i>最大</i>幂次之积。<br>' +
    '• 分数和小数互化，以便在数轴上比较大小。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求 HCF 或 LCM 之前，先将两个数写成质因数乘积。答案用指数记法。<br><br>' +
    '<b>注意！</b><br>' +
    '1 不是质数。$0.\\overline{3} = \\frac{1}{3}$ 虽然小数无限，但因为循环所以是有理数。'
});

add('hhk', 'Y8.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Write 180 as a product of its prime factors.<br><br>' +
    '<b>Solution:</b><br>' +
    '$180 \\div 2 = 90$<br>' +
    '$90 \\div 2 = 45$<br>' +
    '$45 \\div 3 = 15$<br>' +
    '$15 \\div 3 = 5$<br>' +
    '$\\therefore 180 = 2^2 \\times 3^2 \\times 5$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Find the HCF and LCM of 36 and 60.<br><br>' +
    '<b>Solution:</b><br>' +
    '$36 = 2^2 \\times 3^2$<br>' +
    '$60 = 2^2 \\times 3 \\times 5$<br><br>' +
    'HCF = common primes, lowest powers:<br>' +
    '$\\text{HCF} = 2^2 \\times 3 = 12$<br><br>' +
    'LCM = all primes, highest powers:<br>' +
    '$\\text{LCM} = 2^2 \\times 3^2 \\times 5 = 180$<br><br>' +
    '<b>Exam Tip:</b> You can check your answer: $\\text{HCF} \\times \\text{LCM} = 12 \\times 180 = 2160 = 36 \\times 60$. This always works for two numbers.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '将 180 写成质因数的乘积。<br><br>' +
    '<b>解答：</b><br>' +
    '$180 \\div 2 = 90$<br>' +
    '$90 \\div 2 = 45$<br>' +
    '$45 \\div 3 = 15$<br>' +
    '$15 \\div 3 = 5$<br>' +
    '$\\therefore 180 = 2^2 \\times 3^2 \\times 5$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '求 36 和 60 的 HCF 和 LCM。<br><br>' +
    '<b>解答：</b><br>' +
    '$36 = 2^2 \\times 3^2$<br>' +
    '$60 = 2^2 \\times 3 \\times 5$<br><br>' +
    'HCF = 公共质因数取最小幂：<br>' +
    '$\\text{HCF} = 2^2 \\times 3 = 12$<br><br>' +
    'LCM = 所有质因数取最大幂：<br>' +
    '$\\text{LCM} = 2^2 \\times 3^2 \\times 5 = 180$<br><br>' +
    '<b>考试技巧：</b>可以验算：$\\text{HCF} \\times \\text{LCM} = 12 \\times 180 = 2160 = 36 \\times 60$。两个数始终成立。'
});

add('hhk', 'Y8.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>term</b> is a single number or variable, or numbers and variables multiplied together, e.g. $3x$, $5y^2$.<br>' +
    '• An <b>expression</b> is a collection of terms, e.g. $2x + 3y - 1$. It has no equals sign.<br>' +
    '• An <b>equation</b> has an equals sign, e.g. $2x + 3 = 11$.<br>' +
    '• <b>Like terms</b> have the same variable(s) raised to the same power: $3x$ and $5x$ are like terms; $3x$ and $3x^2$ are NOT.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Collect like terms</b>: $4x + 2y - x + 5y = 3x + 7y$.<br>' +
    '• <b>Expand brackets</b>: $3(2x - 4) = 6x - 12$.<br>' +
    '• <b>Factorise</b> by taking out the common factor: $6x + 15 = 3(2x + 5)$; $4x^2 - 10x = 2x(2x - 5)$.<br>' +
    '• <b>Substitute</b> values into expressions: if $x = 3$ and $y = -2$, then $2x - y = 2(3) - (-2) = 8$.<br>' +
    '• Substitute into formulae such as area, perimeter, speed = distance $\\div$ time.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Show each step when expanding or factorising. When substituting, replace the letter with brackets around the value to avoid sign errors.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$2(x + 3) = 2x + 6$, NOT $2x + 3$. You must multiply every term inside the bracket.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>项</b>是单独的数、变量或它们的乘积，如 $3x$，$5y^2$。<br>' +
    '• <b>表达式</b>是项的组合，如 $2x + 3y - 1$，没有等号。<br>' +
    '• <b>方程</b>有等号，如 $2x + 3 = 11$。<br>' +
    '• <b>同类项</b>具有相同的变量和幂次：$3x$ 和 $5x$ 是同类项；$3x$ 和 $3x^2$ 不是。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>合并同类项</b>：$4x + 2y - x + 5y = 3x + 7y$。<br>' +
    '• <b>展开括号</b>：$3(2x - 4) = 6x - 12$。<br>' +
    '• <b>因式分解</b>——提取公因数：$6x + 15 = 3(2x + 5)$；$4x^2 - 10x = 2x(2x - 5)$。<br>' +
    '• <b>代入</b>：若 $x = 3$，$y = -2$，则 $2x - y = 2(3) - (-2) = 8$。<br>' +
    '• 将数值代入面积、周长、速度 = 路程 $\\div$ 时间等公式。<br><br>' +
    '<b>考试技巧</b><br>' +
    '展开或因式分解时逐步书写。代入时用括号包裹数值，避免符号错误。<br><br>' +
    '<b>注意！</b><br>' +
    '$2(x + 3) = 2x + 6$，不是 $2x + 3$。必须将括号内每一项都乘上。'
});

add('hhk', 'Y8.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Expand and simplify $3(2x + 1) - 2(x - 4)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$3(2x + 1) = 6x + 3$<br>' +
    '$-2(x - 4) = -2x + 8$<br>' +
    '$6x + 3 - 2x + 8 = 4x + 11$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'The formula for the area of a trapezium is $A = \\frac{1}{2}(a + b)h$.<br>' +
    'Find $A$ when $a = 5$, $b = 9$ and $h = 4$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = \\frac{1}{2}(5 + 9) \\times 4$<br>' +
    '$A = \\frac{1}{2} \\times 14 \\times 4$<br>' +
    '$A = 28$<br><br>' +
    '<b>Exam Tip:</b> Replace each letter with brackets around the value: $A = \\frac{1}{2}((5) + (9))(4)$. This avoids errors with negative numbers.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '展开并化简 $3(2x + 1) - 2(x - 4)$。<br><br>' +
    '<b>解答：</b><br>' +
    '$3(2x + 1) = 6x + 3$<br>' +
    '$-2(x - 4) = -2x + 8$<br>' +
    '$6x + 3 - 2x + 8 = 4x + 11$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '梯形面积公式为 $A = \\frac{1}{2}(a + b)h$。<br>' +
    '当 $a = 5$，$b = 9$，$h = 4$ 时，求 $A$。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = \\frac{1}{2}(5 + 9) \\times 4$<br>' +
    '$A = \\frac{1}{2} \\times 14 \\times 4$<br>' +
    '$A = 28$<br><br>' +
    '<b>考试技巧：</b>代入时给每个数值加上括号：$A = \\frac{1}{2}((5) + (9))(4)$，可避免负数带来的符号错误。'
});

add('hhk', 'Y8.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Inequality symbols: $<$ (less than), $>$ (greater than), $\\leq$ (less than or equal to), $\\geq$ (greater than or equal to).<br>' +
    '• On a number line: use an <b>open circle</b> $\\circ$ for $<$ or $>$ (value NOT included), and a <b>filled circle</b> $\\bullet$ for $\\leq$ or $\\geq$ (value IS included).<br>' +
    '• An inequality can have a range of solutions, unlike an equation which usually has one answer.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• List <b>integer solutions</b>: for $-2 < x \\leq 3$, the integers are $-1, 0, 1, 2, 3$.<br>' +
    '• <b>Solve linear inequalities</b> using the same steps as equations:<br>' +
    '&nbsp;&nbsp;$2x + 3 < 11 \\Rightarrow 2x < 8 \\Rightarrow x < 4$.<br>' +
    '• <b>Double inequalities</b>: $-1 \\leq 2x + 3 < 9$. Subtract 3 from all parts, then divide all parts by 2:<br>' +
    '&nbsp;&nbsp;$-4 \\leq 2x < 6 \\Rightarrow -2 \\leq x < 3$.<br>' +
    '• When you <b>multiply or divide by a negative number</b>, you must <b>reverse</b> the inequality sign.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Solve an inequality exactly like an equation, but remember to flip the sign if you multiply or divide by a negative.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'If $-x > 5$, then $x < -5$ (not $x > -5$). Dividing by $-1$ flips the inequality.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 不等号：$<$（小于），$>$（大于），$\\leq$（小于等于），$\\geq$（大于等于）。<br>' +
    '• 数轴表示：$<$ 或 $>$ 用<b>空心圆</b> $\\circ$（不包含该值），$\\leq$ 或 $\\geq$ 用<b>实心圆</b> $\\bullet$（包含该值）。<br>' +
    '• 不等式通常有一组解，而方程通常只有一个解。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 列<b>整数解</b>：$-2 < x \\leq 3$ 的整数解为 $-1, 0, 1, 2, 3$。<br>' +
    '• <b>解一次不等式</b>，步骤与解方程相同：<br>' +
    '&nbsp;&nbsp;$2x + 3 < 11 \\Rightarrow 2x < 8 \\Rightarrow x < 4$。<br>' +
    '• <b>双重不等式</b>：$-1 \\leq 2x + 3 < 9$。三部分同时减 3，再同除以 2：<br>' +
    '&nbsp;&nbsp;$-4 \\leq 2x < 6 \\Rightarrow -2 \\leq x < 3$。<br>' +
    '• <b>乘以或除以负数</b>时，不等号方向必须<b>反转</b>。<br><br>' +
    '<b>考试技巧</b><br>' +
    '解不等式的方法与解方程相同，但乘除负数时务必翻转不等号方向。<br><br>' +
    '<b>注意！</b><br>' +
    '若 $-x > 5$，则 $x < -5$（不是 $x > -5$）。除以 $-1$ 要翻转不等号。'
});

add('hhk', 'Y8.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Solve $5x - 7 \\geq 13$ and show the solution on a number line.<br><br>' +
    '<b>Solution:</b><br>' +
    '$5x - 7 \\geq 13$<br>' +
    '$5x \\geq 20$<br>' +
    '$x \\geq 4$<br>' +
    'On the number line: filled circle at 4, arrow pointing right.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Solve $-3 < 2x + 1 \\leq 9$ and list the integer solutions.<br><br>' +
    '<b>Solution:</b><br>' +
    'Subtract 1 from all three parts:<br>' +
    '$-3 - 1 < 2x \\leq 9 - 1$<br>' +
    '$-4 < 2x \\leq 8$<br>' +
    'Divide all parts by 2:<br>' +
    '$-2 < x \\leq 4$<br>' +
    'Integer solutions: $-1, 0, 1, 2, 3, 4$<br><br>' +
    '<b>Exam Tip:</b> For double inequalities, perform the same operation on all three parts at once. Do not split it into two separate inequalities.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '解不等式 $5x - 7 \\geq 13$ 并在数轴上表示解集。<br><br>' +
    '<b>解答：</b><br>' +
    '$5x - 7 \\geq 13$<br>' +
    '$5x \\geq 20$<br>' +
    '$x \\geq 4$<br>' +
    '在数轴上：4 处画实心圆，箭头指向右方。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '解不等式 $-3 < 2x + 1 \\leq 9$ 并列出整数解。<br><br>' +
    '<b>解答：</b><br>' +
    '三部分同时减 1：<br>' +
    '$-3 - 1 < 2x \\leq 9 - 1$<br>' +
    '$-4 < 2x \\leq 8$<br>' +
    '三部分同时除以 2：<br>' +
    '$-2 < x \\leq 4$<br>' +
    '整数解：$-1, 0, 1, 2, 3, 4$<br><br>' +
    '<b>考试技巧：</b>双重不等式对三部分同时操作，不要拆成两个不等式分别解。'
});

add('hhk', 'Y8.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• In a right-angled triangle, the longest side (opposite the right angle) is called the <b>hypotenuse</b>.<br>' +
    '• <b>Pythagoras\' Theorem</b>: $a^2 + b^2 = c^2$, where $c$ is the hypotenuse and $a$, $b$ are the other two sides.<br>' +
    '• The theorem was known in ancient China (the Gougu Theorem, 勾股定理, ~1100 BC) and in ancient Greece (Pythagoras, ~500 BC).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Find the hypotenuse</b>: $c = \\sqrt{a^2 + b^2}$.<br>' +
    '&nbsp;&nbsp;E.g. if $a = 3, b = 4$: $c = \\sqrt{9 + 16} = \\sqrt{25} = 5$.<br>' +
    '• <b>Find a shorter side</b>: $a = \\sqrt{c^2 - b^2}$.<br>' +
    '&nbsp;&nbsp;E.g. if $c = 13, b = 5$: $a = \\sqrt{169 - 25} = \\sqrt{144} = 12$.<br>' +
    '• <b>Test for a right angle</b>: if $a^2 + b^2 = c^2$ then the triangle is right-angled.<br>' +
    '&nbsp;&nbsp;E.g. $5, 12, 13$: $25 + 144 = 169 = 13^2$<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always identify the hypotenuse first. If you are finding the hypotenuse, add the squares. If you are finding a shorter side, subtract.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\sqrt{a^2 + b^2} \\neq a + b$. You must square first, add, then square root.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 直角三角形中，直角对面最长的边叫<b>斜边</b>（hypotenuse）。<br>' +
    '• <b>勾股定理</b>（毕达哥拉斯定理）：$a^2 + b^2 = c^2$，其中 $c$ 为斜边，$a$、$b$ 为另外两条边。<br>' +
    '• 该定理在中国古代称为"勾股定理"（约公元前 1100 年），在古希腊由毕达哥拉斯提出（约公元前 500 年）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>求斜边</b>：$c = \\sqrt{a^2 + b^2}$。<br>' +
    '&nbsp;&nbsp;例如 $a = 3, b = 4$：$c = \\sqrt{9 + 16} = \\sqrt{25} = 5$。<br>' +
    '• <b>求短边</b>：$a = \\sqrt{c^2 - b^2}$。<br>' +
    '&nbsp;&nbsp;例如 $c = 13, b = 5$：$a = \\sqrt{169 - 25} = \\sqrt{144} = 12$。<br>' +
    '• <b>判断直角三角形</b>：若 $a^2 + b^2 = c^2$，则为直角三角形。<br>' +
    '&nbsp;&nbsp;例如 $5, 12, 13$：$25 + 144 = 169 = 13^2$<br><br>' +
    '<b>考试技巧</b><br>' +
    '先确认哪条边是斜边。求斜边时用加法，求短边时用减法。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\sqrt{a^2 + b^2} \\neq a + b$。必须先平方、再相加、最后开方。'
});

add('hhk', 'Y8.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A right-angled triangle has short sides of length 6 cm and 8 cm. Find the hypotenuse.<br><br>' +
    '<b>Solution:</b><br>' +
    '$c^2 = a^2 + b^2$<br>' +
    '$c^2 = 6^2 + 8^2 = 36 + 64 = 100$<br>' +
    '$c = \\sqrt{100} = 10$ cm<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A right-angled triangle has a hypotenuse of 15 cm and one side of 9 cm. Find the other side.<br><br>' +
    '<b>Solution:</b><br>' +
    '$a^2 = c^2 - b^2$<br>' +
    '$a^2 = 15^2 - 9^2 = 225 - 81 = 144$<br>' +
    '$a = \\sqrt{144} = 12$ cm<br><br>' +
    '<b>Exam Tip:</b> If the answer is not a whole number, leave it in surd form (e.g. $\\sqrt{52}$) or round to the required number of decimal places or significant figures.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个直角三角形的两条直角边分别为 6 cm 和 8 cm，求斜边长度。<br><br>' +
    '<b>解答：</b><br>' +
    '$c^2 = a^2 + b^2$<br>' +
    '$c^2 = 6^2 + 8^2 = 36 + 64 = 100$<br>' +
    '$c = \\sqrt{100} = 10$ cm<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个直角三角形的斜边为 15 cm，一条直角边为 9 cm，求另一条边。<br><br>' +
    '<b>解答：</b><br>' +
    '$a^2 = c^2 - b^2$<br>' +
    '$a^2 = 15^2 - 9^2 = 225 - 81 = 144$<br>' +
    '$a = \\sqrt{144} = 12$ cm<br><br>' +
    '<b>考试技巧：</b>如果答案不是整数，保留根号形式（如 $\\sqrt{52}$），或按要求四舍五入到指定的小数位数或有效数字。'
});

add('hhk', 'Y8.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Angles at a point</b> add up to $360°$.<br>' +
    '• <b>Angles on a straight line</b> add up to $180°$.<br>' +
    '• <b>Angles in a triangle</b> add up to $180°$.<br>' +
    '• <b>Vertically opposite angles</b> are equal. They are formed when two straight lines cross.<br>' +
    '• The <b>exterior angle</b> of a triangle equals the sum of the two interior opposite angles.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• When a <b>transversal</b> crosses two parallel lines, the following angle pairs are formed:<br>' +
    '&nbsp;&nbsp;– <b>Alternate angles</b> (Z-angles): equal.<br>' +
    '&nbsp;&nbsp;– <b>Corresponding angles</b> (F-angles): equal.<br>' +
    '&nbsp;&nbsp;– <b>Co-interior angles</b> (C-angles / allied angles): add up to $180°$.<br>' +
    '• Use these properties to find missing angles and to <b>prove</b> that lines are parallel.<br>' +
    '• Angles in a quadrilateral add up to $360°$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always state the angle reason in your working, e.g. "alternate angles" or "angles on a straight line". You will lose marks for just writing the answer.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Co-interior angles are NOT equal — they add up to $180°$. Do not confuse them with alternate or corresponding angles.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>周角</b>（一点的角）加起来等于 $360°$。<br>' +
    '• <b>平角</b>（直线上的角）加起来等于 $180°$。<br>' +
    '• <b>三角形内角和</b>等于 $180°$。<br>' +
    '• <b>对顶角</b>相等，由两条直线相交产生。<br>' +
    '• 三角形的<b>外角</b>等于两个不相邻内角之和。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 当<b>截线</b>穿过两条平行线时，产生以下角的关系：<br>' +
    '&nbsp;&nbsp;– <b>内错角</b>（Z 角）：相等。<br>' +
    '&nbsp;&nbsp;– <b>同位角</b>（F 角）：相等。<br>' +
    '&nbsp;&nbsp;– <b>同旁内角</b>（C 角）：和为 $180°$。<br>' +
    '• 利用这些性质求角度，并<b>证明</b>两直线平行。<br>' +
    '• 四边形内角和为 $360°$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '解题时务必写出角度关系的理由，如"内错角"或"直线上的角"。只写答案不写理由会扣分。<br><br>' +
    '<b>注意！</b><br>' +
    '同旁内角不是相等的——它们之和为 $180°$。不要和内错角或同位角混淆。'
});

add('hhk', 'Y8.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Two parallel lines are cut by a transversal. One of the angles formed is $72°$. Find the co-interior angle.<br><br>' +
    '<b>Solution:</b><br>' +
    'Co-interior angles add up to $180°$.<br>' +
    'Co-interior angle $= 180° - 72° = 108°$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'In the diagram, $AB$ is parallel to $CD$. Angle $ABE = 55°$ and angle $BEC = 90°$. Find angle $DCE$.<br><br>' +
    '<b>Solution:</b><br>' +
    'In triangle $BEC$:<br>' +
    'Angle $BCE = 180° - 55° - 90° = 35°$ (angles in a triangle)<br>' +
    'Angle $DCE = $ angle $BCE = 35°$ (alternate angles, $AB \\parallel CD$).<br><br>' +
    '<b>Exam Tip:</b> Label all the angles you find on the diagram as you go. Give reasons for each step — "alternate angles", "co-interior angles", "angles in a triangle", etc.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '两条平行线被一条截线所截，其中一个角为 $72°$。求同旁内角。<br><br>' +
    '<b>解答：</b><br>' +
    '同旁内角之和为 $180°$。<br>' +
    '同旁内角 $= 180° - 72° = 108°$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '如图，$AB$ 平行于 $CD$。角 $ABE = 55°$，角 $BEC = 90°$。求角 $DCE$。<br><br>' +
    '<b>解答：</b><br>' +
    '在三角形 $BEC$ 中：<br>' +
    '角 $BCE = 180° - 55° - 90° = 35°$（三角形内角和）<br>' +
    '角 $DCE = $ 角 $BCE = 35°$（内错角，$AB \\parallel CD$）。<br><br>' +
    '<b>考试技巧：</b>在图上标注每一步求得的角度，逐步给出理由——"内错角"、"同旁内角"、"三角形内角和"等。'
});

add('hhk', 'Y8.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Expressions</b> contain variables but no equals sign: $3x + 2y$.<br>' +
    '• <b>Equations</b> have an equals sign and can be solved: $2x + 1 = 7$.<br>' +
    '• <b>Formulae</b> show the relationship between variables: $v = u + at$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Rearrange a formula</b> to change the subject (the variable appears once):<br>' +
    '&nbsp;&nbsp;Make $t$ the subject of $v = u + at$:<br>' +
    '&nbsp;&nbsp;$v - u = at \\Rightarrow t = \\frac{v - u}{a}$.<br>' +
    '• <b>Solve equations with unknowns on both sides</b>:<br>' +
    '&nbsp;&nbsp;$5x + 3 = 2x + 15$<br>' +
    '&nbsp;&nbsp;$3x = 12 \\Rightarrow x = 4$.<br>' +
    '• <b>Equations with brackets</b>: expand first, then solve.<br>' +
    '&nbsp;&nbsp;$3(x + 2) = x + 14 \\Rightarrow 3x + 6 = x + 14 \\Rightarrow 2x = 8 \\Rightarrow x = 4$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When solving equations with unknowns on both sides, move the smaller $x$-term to the other side first to keep $x$ positive.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When rearranging, whatever you do to one side you MUST do to the other side. Do not forget to reverse the operation.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>表达式</b>含变量但无等号：$3x + 2y$。<br>' +
    '• <b>方程</b>有等号，可以求解：$2x + 1 = 7$。<br>' +
    '• <b>公式</b>表示变量间的关系：$v = u + at$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>变换公式主语</b>（变量只出现一次）：<br>' +
    '&nbsp;&nbsp;将 $v = u + at$ 变换为以 $t$ 为主语：<br>' +
    '&nbsp;&nbsp;$v - u = at \\Rightarrow t = \\frac{v - u}{a}$。<br>' +
    '• <b>解含未知数在两边的方程</b>：<br>' +
    '&nbsp;&nbsp;$5x + 3 = 2x + 15$<br>' +
    '&nbsp;&nbsp;$3x = 12 \\Rightarrow x = 4$。<br>' +
    '• <b>含括号的方程</b>：先展开，再解。<br>' +
    '&nbsp;&nbsp;$3(x + 2) = x + 14 \\Rightarrow 3x + 6 = x + 14 \\Rightarrow 2x = 8 \\Rightarrow x = 4$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '当未知数出现在等号两边时，先把较小的 $x$ 项移到另一边，保持 $x$ 为正。<br><br>' +
    '<b>注意！</b><br>' +
    '变换公式时，对一边做的运算必须对另一边也做，不要忘记逆运算。'
});

add('hhk', 'Y8.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Make $r$ the subject of the formula $A = \\pi r^2$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = \\pi r^2$<br>' +
    '$\\frac{A}{\\pi} = r^2$<br>' +
    '$r = \\sqrt{\\frac{A}{\\pi}}$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Solve $4(x - 1) = 2x + 10$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Expand the bracket:<br>' +
    '$4x - 4 = 2x + 10$<br>' +
    'Subtract $2x$ from both sides:<br>' +
    '$2x - 4 = 10$<br>' +
    'Add 4 to both sides:<br>' +
    '$2x = 14$<br>' +
    '$x = 7$<br><br>' +
    '<b>Exam Tip:</b> Always check your answer by substituting it back into both sides. Here: $4(7-1) = 24$ and $2(7)+10 = 24$. Both sides match.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '将公式 $A = \\pi r^2$ 变换为以 $r$ 为主语。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = \\pi r^2$<br>' +
    '$\\frac{A}{\\pi} = r^2$<br>' +
    '$r = \\sqrt{\\frac{A}{\\pi}}$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '解方程 $4(x - 1) = 2x + 10$。<br><br>' +
    '<b>解答：</b><br>' +
    '展开括号：<br>' +
    '$4x - 4 = 2x + 10$<br>' +
    '两边减 $2x$：<br>' +
    '$2x - 4 = 10$<br>' +
    '两边加 4：<br>' +
    '$2x = 14$<br>' +
    '$x = 7$<br><br>' +
    '<b>考试技巧：</b>解完后代入检验。此处：$4(7-1) = 24$，$2(7)+10 = 24$，两边相等。'
});

add('hhk', 'Y8.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• The <b>Cartesian coordinate system</b> has a horizontal $x$-axis and a vertical $y$-axis, meeting at the <b>origin</b> $(0, 0)$.<br>' +
    '• Points are written as $(x, y)$. The four <b>quadrants</b> are numbered anticlockwise from the top-right.<br>' +
    '• A <b>linear equation</b> in the form $y = mx + c$ produces a straight-line graph.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Plot coordinates</b> in all four quadrants: go along the $x$-axis first, then up/down the $y$-axis.<br>' +
    '• Draw a linear graph by making a <b>table of values</b>:<br>' +
    '&nbsp;&nbsp;E.g. for $y = 2x - 1$: when $x = 0$, $y = -1$; when $x = 1$, $y = 1$; when $x = 2$, $y = 3$. Plot and join with a straight line.<br>' +
    '• The <b>gradient</b> $m$ measures steepness: $m = \\frac{\\text{rise}}{\\text{run}} = \\frac{y_2 - y_1}{x_2 - x_1}$.<br>' +
    '• The <b>$y$-intercept</b> $c$ is where the line crosses the $y$-axis (i.e. when $x = 0$).<br>' +
    '• Lines parallel to the $x$-axis have equation $y = c$; lines parallel to the $y$-axis have equation $x = k$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Use at least 3 points when drawing a straight line (the third point is a check). Use a ruler and extend the line to the edges of the grid.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A negative gradient slopes downwards from left to right. Do not mix up $(x, y)$ — $x$ always comes first.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>笛卡尔坐标系</b>有水平的 $x$ 轴和竖直的 $y$ 轴，交于<b>原点</b> $(0, 0)$。<br>' +
    '• 点记作 $(x, y)$。四个<b>象限</b>从右上方起逆时针编号。<br>' +
    '• $y = mx + c$ 形式的<b>一次方程</b>对应一条直线。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>描点</b>：先沿 $x$ 轴走，再沿 $y$ 轴走。可在四个象限中描点。<br>' +
    '• 用<b>列表法</b>画直线：<br>' +
    '&nbsp;&nbsp;例如 $y = 2x - 1$：$x = 0$ 时 $y = -1$；$x = 1$ 时 $y = 1$；$x = 2$ 时 $y = 3$。描点后用直尺连线。<br>' +
    '• <b>斜率</b> $m$ 表示倾斜程度：$m = \\frac{\\text{上升}}{\\text{水平距离}} = \\frac{y_2 - y_1}{x_2 - x_1}$。<br>' +
    '• <b>$y$ 截距</b> $c$ 是直线与 $y$ 轴的交点（即 $x = 0$ 时的 $y$ 值）。<br>' +
    '• 平行于 $x$ 轴的直线方程为 $y = c$；平行于 $y$ 轴的直线方程为 $x = k$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '画直线至少取 3 个点（第三个点用于验证）。用尺子画线，并延伸到网格边缘。<br><br>' +
    '<b>注意！</b><br>' +
    '负斜率的直线从左到右向下倾斜。不要把 $(x, y)$ 的顺序搞反——$x$ 永远在前。'
});

add('hhk', 'Y8.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Draw the graph of $y = 3x - 2$ for $x$ from $-1$ to $3$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Table of values:<br>' +
    '$x = -1$: $y = 3(-1) - 2 = -5$<br>' +
    '$x = 0$: $y = 3(0) - 2 = -2$<br>' +
    '$x = 1$: $y = 3(1) - 2 = 1$<br>' +
    '$x = 2$: $y = 3(2) - 2 = 4$<br>' +
    '$x = 3$: $y = 3(3) - 2 = 7$<br>' +
    'Plot the points $(-1, -5)$, $(0, -2)$, $(1, 1)$, $(2, 4)$, $(3, 7)$ and join with a straight line.<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A straight line passes through $(1, 3)$ and $(4, 9)$. Find the equation in the form $y = mx + c$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Gradient: $m = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$<br>' +
    'Using point $(1, 3)$: $3 = 2(1) + c \\Rightarrow c = 1$<br>' +
    'Equation: $y = 2x + 1$<br><br>' +
    '<b>Exam Tip:</b> To find the gradient, pick two points that are easy to read from the graph. Avoid points that are between grid lines.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '画出 $y = 3x - 2$ 在 $x$ 从 $-1$ 到 $3$ 范围内的图像。<br><br>' +
    '<b>解答：</b><br>' +
    '列表：<br>' +
    '$x = -1$：$y = 3(-1) - 2 = -5$<br>' +
    '$x = 0$：$y = 3(0) - 2 = -2$<br>' +
    '$x = 1$：$y = 3(1) - 2 = 1$<br>' +
    '$x = 2$：$y = 3(2) - 2 = 4$<br>' +
    '$x = 3$：$y = 3(3) - 2 = 7$<br>' +
    '描点 $(-1, -5)$、$(0, -2)$、$(1, 1)$、$(2, 4)$、$(3, 7)$ 并用直尺连成直线。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一条直线过点 $(1, 3)$ 和 $(4, 9)$，求 $y = mx + c$ 形式的方程。<br><br>' +
    '<b>解答：</b><br>' +
    '斜率：$m = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$<br>' +
    '代入点 $(1, 3)$：$3 = 2(1) + c \\Rightarrow c = 1$<br>' +
    '方程：$y = 2x + 1$<br><br>' +
    '<b>考试技巧：</b>求斜率时选取图上容易读取的两个点，避免选取在格线之间的点。'
});

add('hhk', 'Y8.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Primary data</b> is collected by yourself (surveys, experiments). <b>Secondary data</b> comes from another source (internet, books).<br>' +
    '• <b>Discrete data</b> can only take specific values (e.g. shoe size, number of pets). <b>Continuous data</b> can take any value in a range (e.g. height, weight).<br>' +
    '• The three <b>averages</b>:<br>' +
    '&nbsp;&nbsp;– <b>Mean</b> $= \\frac{\\text{total of all values}}{\\text{number of values}}$<br>' +
    '&nbsp;&nbsp;– <b>Median</b> = the middle value when data is in order.<br>' +
    '&nbsp;&nbsp;– <b>Mode</b> = the most frequent value.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Choose the appropriate average: mean uses all data but is affected by outliers; median is not affected by outliers; mode is useful for categorical data.<br>' +
    '• <b>Mean from a frequency table</b>: $\\text{Mean} = \\frac{\\sum (x \\times f)}{\\sum f}$<br>' +
    '&nbsp;&nbsp;Multiply each value by its frequency, add them up, then divide by the total frequency.<br>' +
    '• Find the median from a frequency table by finding the position: $\\frac{n + 1}{2}$ where $n = \\sum f$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Add an extra column to your frequency table for $x \\times f$ to make calculating the mean easier. Always show your working.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When finding the mean from a frequency table, divide by the total frequency $\\sum f$, NOT by the number of rows in the table.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>原始数据</b>（一手数据）由自己收集（问卷、实验）。<b>二手数据</b>来自其他来源（网络、书籍）。<br>' +
    '• <b>离散数据</b>只能取特定值（如鞋码、宠物数量）。<b>连续数据</b>可以取某范围内的任意值（如身高、体重）。<br>' +
    '• 三种<b>平均数</b>：<br>' +
    '&nbsp;&nbsp;– <b>平均值（Mean）</b> $= \\frac{\\text{所有数据之和}}{\\text{数据个数}}$<br>' +
    '&nbsp;&nbsp;– <b>中位数（Median）</b> = 数据从小到大排列后的中间值。<br>' +
    '&nbsp;&nbsp;– <b>众数（Mode）</b> = 出现次数最多的值。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 选择合适的平均数：平均值使用所有数据但受极端值影响；中位数不受极端值影响；众数适用于分类数据。<br>' +
    '• <b>频率表求平均值</b>：$\\text{Mean} = \\frac{\\sum (x \\times f)}{\\sum f}$<br>' +
    '&nbsp;&nbsp;每个值乘以频率，求和后除以总频率。<br>' +
    '• 频率表求中位数：位置 $= \\frac{n + 1}{2}$，其中 $n = \\sum f$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '在频率表中添加一列 $x \\times f$，方便计算平均值。务必展示计算过程。<br><br>' +
    '<b>注意！</b><br>' +
    '频率表求平均值时，除以的是总频率 $\\sum f$，不是表格的行数。'
});

add('hhk', 'Y8.9', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'The ages of 7 students are: 12, 14, 13, 15, 12, 13, 12. Find the mean, median and mode.<br><br>' +
    '<b>Solution:</b><br>' +
    'Mean $= \\frac{12 + 14 + 13 + 15 + 12 + 13 + 12}{7} = \\frac{91}{7} = 13$<br>' +
    'In order: 12, 12, 12, 13, 13, 14, 15<br>' +
    'Median = 4th value = $13$<br>' +
    'Mode = $12$ (appears 3 times)<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'The table shows the number of goals scored per match:<br>' +
    'Goals ($x$): 0, 1, 2, 3, 4<br>' +
    'Frequency ($f$): 5, 8, 4, 2, 1<br>' +
    'Find the mean number of goals per match.<br><br>' +
    '<b>Solution:</b><br>' +
    '$x \\times f$: $0, 8, 8, 6, 4$<br>' +
    '$\\sum (x \\times f) = 0 + 8 + 8 + 6 + 4 = 26$<br>' +
    '$\\sum f = 5 + 8 + 4 + 2 + 1 = 20$<br>' +
    'Mean $= \\frac{26}{20} = 1.3$ goals per match<br><br>' +
    '<b>Exam Tip:</b> Add a third column to the table for $x \\times f$. This makes it much easier to calculate $\\sum (x \\times f)$ without errors.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '7 名学生的年龄为：12, 14, 13, 15, 12, 13, 12。求平均值、中位数和众数。<br><br>' +
    '<b>解答：</b><br>' +
    '平均值 $= \\frac{12 + 14 + 13 + 15 + 12 + 13 + 12}{7} = \\frac{91}{7} = 13$<br>' +
    '排序：12, 12, 12, 13, 13, 14, 15<br>' +
    '中位数 = 第 4 个值 = $13$<br>' +
    '众数 = $12$（出现 3 次）<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '下表为每场比赛的进球数：<br>' +
    '进球数（$x$）：0, 1, 2, 3, 4<br>' +
    '频率（$f$）：5, 8, 4, 2, 1<br>' +
    '求每场比赛的平均进球数。<br><br>' +
    '<b>解答：</b><br>' +
    '$x \\times f$：$0, 8, 8, 6, 4$<br>' +
    '$\\sum (x \\times f) = 0 + 8 + 8 + 6 + 4 = 26$<br>' +
    '$\\sum f = 5 + 8 + 4 + 2 + 1 = 20$<br>' +
    '平均值 $= \\frac{26}{20} = 1.3$ 个进球/场<br><br>' +
    '<b>考试技巧：</b>在频率表中增加 $x \\times f$ 一列，方便计算 $\\sum (x \\times f)$，减少出错。'
});


/* ══════════════════════════════════════════════════
   HHK Y9
   ══════════════════════════════════════════════════ */

add('hhk', 'Y9.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>rational number</b> can be written as $\\frac{p}{q}$ where $p, q$ are integers and $q \\neq 0$. This includes all terminating and recurring decimals.<br>' +
    '• An <b>irrational number</b> cannot be written as a fraction, e.g. $\\pi$, $\\sqrt{2}$, $\\sqrt{5}$.<br>' +
    '• <b>Real numbers</b> = all rational + irrational numbers.<br>' +
    '• A <b>surd</b> is an irrational root, e.g. $\\sqrt{3}$, $\\sqrt[3]{5}$. Note: $\\sqrt{4} = 2$ is NOT a surd because it simplifies to a rational number.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Simplify surds</b>: find the largest square factor, e.g. $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$.<br>' +
    '• <b>Add/subtract surds</b>: simplify first, then collect like terms. $\\sqrt{50} + \\sqrt{18} = 5\\sqrt{2} + 3\\sqrt{2} = 8\\sqrt{2}$.<br>' +
    '• <b>Multiply surds</b>: $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$. Also expand brackets: $(2 + \\sqrt{3})(4 - \\sqrt{3}) = 8 - 2\\sqrt{3} + 4\\sqrt{3} - 3 = 5 + 2\\sqrt{3}$.<br>' +
    '• <b>Rationalise the denominator</b>: multiply top and bottom by the surd. $\\frac{5}{\\sqrt{3}} = \\frac{5\\sqrt{3}}{3}$. For $(a + \\sqrt{b})$ in the denominator, multiply by $(a - \\sqrt{b})$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always simplify surds fully. Look for the largest perfect square factor (4, 9, 16, 25, 36, ...) to save steps.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$. For example $\\sqrt{9 + 16} = \\sqrt{25} = 5$, but $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>有理数</b>可写成 $\\frac{p}{q}$（$p, q$ 为整数，$q \\neq 0$），包括所有有限小数和循环小数。<br>' +
    '• <b>无理数</b>不能写成分数，例如 $\\pi$, $\\sqrt{2}$, $\\sqrt{5}$。<br>' +
    '• <b>实数</b> = 有理数 + 无理数。<br>' +
    '• <b>根式（surd）</b>是无理数的根号表达，如 $\\sqrt{3}$, $\\sqrt[3]{5}$。注意：$\\sqrt{4} = 2$ 不是根式，因为它可以化简为有理数。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>化简根式</b>：找最大的完全平方因子，如 $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$。<br>' +
    '• <b>根式加减</b>：先化简，再合并同类项。$\\sqrt{50} + \\sqrt{18} = 5\\sqrt{2} + 3\\sqrt{2} = 8\\sqrt{2}$。<br>' +
    '• <b>根式相乘</b>：$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$。展开括号：$(2 + \\sqrt{3})(4 - \\sqrt{3}) = 8 - 2\\sqrt{3} + 4\\sqrt{3} - 3 = 5 + 2\\sqrt{3}$。<br>' +
    '• <b>有理化分母</b>：上下同乘根式。$\\frac{5}{\\sqrt{3}} = \\frac{5\\sqrt{3}}{3}$。分母含 $(a + \\sqrt{b})$ 时，乘以 $(a - \\sqrt{b})$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '根式必须完全化简。优先找最大的完全平方因子（4, 9, 16, 25, 36, ...），减少步骤。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$。例如 $\\sqrt{9 + 16} = \\sqrt{25} = 5$，但 $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$。'
});

add('hhk', 'Y9.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Simplify $\\sqrt{128} - 3\\sqrt{2}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\sqrt{128} = \\sqrt{64 \\times 2} = 8\\sqrt{2}$<br>' +
    '$8\\sqrt{2} - 3\\sqrt{2} = 5\\sqrt{2}$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Rationalise and simplify $\\frac{6}{3 + \\sqrt{3}}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply numerator and denominator by $(3 - \\sqrt{3})$:<br>' +
    '$\\frac{6}{3 + \\sqrt{3}} \\times \\frac{3 - \\sqrt{3}}{3 - \\sqrt{3}} = \\frac{6(3 - \\sqrt{3})}{9 - 3} = \\frac{6(3 - \\sqrt{3})}{6}$<br>' +
    '$= 3 - \\sqrt{3}$<br><br>' +
    '<b>Exam Tip:</b> When rationalising with a binomial denominator, use the conjugate: change the sign between the two terms. The denominator becomes a difference of two squares.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '化简 $\\sqrt{128} - 3\\sqrt{2}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\sqrt{128} = \\sqrt{64 \\times 2} = 8\\sqrt{2}$<br>' +
    '$8\\sqrt{2} - 3\\sqrt{2} = 5\\sqrt{2}$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '有理化并化简 $\\frac{6}{3 + \\sqrt{3}}$。<br><br>' +
    '<b>解答：</b><br>' +
    '上下同乘 $(3 - \\sqrt{3})$：<br>' +
    '$\\frac{6}{3 + \\sqrt{3}} \\times \\frac{3 - \\sqrt{3}}{3 - \\sqrt{3}} = \\frac{6(3 - \\sqrt{3})}{9 - 3} = \\frac{6(3 - \\sqrt{3})}{6}$<br>' +
    '$= 3 - \\sqrt{3}$<br><br>' +
    '<b>考试技巧：</b>有理化含二项式的分母时，乘以其共轭式（改变两项之间的符号）。分母变为平方差公式。'
});

add('hhk', 'Y9.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Like terms</b> have the same variable and power, e.g. $3x^2$ and $-5x^2$ are like terms.<br>' +
    '• <b>Collecting like terms</b>: combine coefficients. $4a + 3b - 2a + 5b = 2a + 8b$.<br>' +
    '• <b>Substitution</b>: replace letters with values and evaluate. If $a = 3, b = -2$, then $2a^2 - 3b = 2(9) - 3(-2) = 18 + 6 = 24$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Expand single brackets</b>: $3(2x - 5) = 6x - 15$.<br>' +
    '• <b>Expand double brackets</b>: $(x + 3)(x - 7) = x^2 - 7x + 3x - 21 = x^2 - 4x - 21$.<br>' +
    '• <b>Factorise (common factor)</b>: $6x^2 + 9x = 3x(2x + 3)$.<br>' +
    '• <b>Difference of two squares</b>: $a^2 - b^2 = (a + b)(a - b)$. E.g. $x^2 - 49 = (x + 7)(x - 7)$.<br>' +
    '• <b>Factorise quadratic trinomials</b>: $x^2 + 5x + 6 = (x + 2)(x + 3)$. Find two numbers that multiply to give $+6$ and add to give $+5$.<br>' +
    '• <b>Algebraic fractions</b>: simplify by factorising and cancelling. Add/subtract by finding a common denominator.<br>' +
    '• <b>Change the subject</b>: rearrange a formula to isolate a different variable.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When factorising a quadratic $x^2 + bx + c$, find two numbers that multiply to $c$ and add to $b$. Always check by expanding your answer.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$-3(x - 4) = -3x + 12$, not $-3x - 12$. Be careful with the sign when multiplying a negative by a negative.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>同类项</b>的变量和次数相同，如 $3x^2$ 与 $-5x^2$ 是同类项。<br>' +
    '• <b>合并同类项</b>：合并系数。$4a + 3b - 2a + 5b = 2a + 8b$。<br>' +
    '• <b>代入求值</b>：将字母替换为数值。若 $a = 3, b = -2$，则 $2a^2 - 3b = 2(9) - 3(-2) = 18 + 6 = 24$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>展开单括号</b>：$3(2x - 5) = 6x - 15$。<br>' +
    '• <b>展开双括号</b>：$(x + 3)(x - 7) = x^2 - 7x + 3x - 21 = x^2 - 4x - 21$。<br>' +
    '• <b>提公因子</b>：$6x^2 + 9x = 3x(2x + 3)$。<br>' +
    '• <b>平方差公式</b>：$a^2 - b^2 = (a + b)(a - b)$。如 $x^2 - 49 = (x + 7)(x - 7)$。<br>' +
    '• <b>二次三项式因式分解</b>：$x^2 + 5x + 6 = (x + 2)(x + 3)$。找两个数，乘积为 $+6$，和为 $+5$。<br>' +
    '• <b>分式化简</b>：先因式分解再约分。加减法需通分。<br>' +
    '• <b>变换公式主项</b>：将公式变形使另一个变量单独在一边。<br><br>' +
    '<b>考试技巧</b><br>' +
    '因式分解 $x^2 + bx + c$ 时，找两个数乘积为 $c$、和为 $b$。分解后一定展开验算。<br><br>' +
    '<b>注意！</b><br>' +
    '$-3(x - 4) = -3x + 12$，不是 $-3x - 12$。负数乘以负数时注意符号。'
});

add('hhk', 'Y9.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Factorise $x^2 - 3x - 28$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Find two numbers that multiply to $-28$ and add to $-3$.<br>' +
    'The numbers are $-7$ and $+4$.<br>' +
    '$x^2 - 3x - 28 = (x - 7)(x + 4)$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Simplify $\\frac{x^2 - 9}{x^2 + 5x + 6}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Factorise numerator (difference of two squares):<br>' +
    '$x^2 - 9 = (x + 3)(x - 3)$<br>' +
    'Factorise denominator (quadratic trinomial):<br>' +
    '$x^2 + 5x + 6 = (x + 2)(x + 3)$<br>' +
    '$\\frac{(x + 3)(x - 3)}{(x + 2)(x + 3)} = \\frac{x - 3}{x + 2}$<br><br>' +
    '<b>Exam Tip:</b> Never cancel individual terms in a fraction. You can only cancel common <i>factors</i>. Always factorise first.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '因式分解 $x^2 - 3x - 28$。<br><br>' +
    '<b>解答：</b><br>' +
    '找两个数，乘积为 $-28$，和为 $-3$。<br>' +
    '这两个数是 $-7$ 和 $+4$。<br>' +
    '$x^2 - 3x - 28 = (x - 7)(x + 4)$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '化简 $\\frac{x^2 - 9}{x^2 + 5x + 6}$。<br><br>' +
    '<b>解答：</b><br>' +
    '分子因式分解（平方差公式）：<br>' +
    '$x^2 - 9 = (x + 3)(x - 3)$<br>' +
    '分母因式分解（二次三项式）：<br>' +
    '$x^2 + 5x + 6 = (x + 2)(x + 3)$<br>' +
    '$\\frac{(x + 3)(x - 3)}{(x + 2)(x + 3)} = \\frac{x - 3}{x + 2}$<br><br>' +
    '<b>考试技巧：</b>不能直接约去分数中的单项。只有公因式才能约分，必须先因式分解。'
});

add('hhk', 'Y9.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>linear graph</b> has equation $y = mx + c$, where $m$ is the gradient and $c$ is the $y$-intercept.<br>' +
    '• The <b>gradient</b> measures steepness: $m = \\frac{\\text{rise}}{\\text{run}} = \\frac{y_2 - y_1}{x_2 - x_1}$.<br>' +
    '• Positive gradient slopes upward left to right; negative gradient slopes downward.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Draw linear graphs</b> by plotting at least 3 points from a table of values, or using gradient and intercept.<br>' +
    '• <b>Find the equation</b> of a line given the gradient and a point, or two points.<br>' +
    '• <b>Parallel lines</b> have the <i>same</i> gradient. $y = 3x + 1$ is parallel to $y = 3x - 5$.<br>' +
    '• <b>Perpendicular lines</b> have gradients that multiply to $-1$. If one gradient is $m$, the perpendicular gradient is $-\\frac{1}{m}$.<br>' +
    '• <b>Quadratic graphs</b> ($y = ax^2 + bx + c$) are U-shaped (when $a > 0$) or n-shaped (when $a < 0$).<br>' +
    '• <b>Real-life graphs</b>: interpret gradient as rate of change and intercept as starting value.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'To find the equation of a line through two points: (1) find the gradient, (2) substitute one point into $y = mx + c$ to find $c$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A horizontal line has gradient 0 (equation $y = c$). A vertical line has undefined gradient (equation $x = k$).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>直线方程</b>为 $y = mx + c$，其中 $m$ 是斜率，$c$ 是 $y$ 轴截距。<br>' +
    '• <b>斜率</b>衡量陡峭程度：$m = \\frac{\\text{rise}}{\\text{run}} = \\frac{y_2 - y_1}{x_2 - x_1}$。<br>' +
    '• 正斜率从左到右上升；负斜率从左到右下降。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 通过描点（至少 3 个）或利用斜率和截距<b>画直线图</b>。<br>' +
    '• 已知斜率和一点（或两点），<b>求直线方程</b>。<br>' +
    '• <b>平行线</b>斜率<i>相同</i>。$y = 3x + 1$ 平行于 $y = 3x - 5$。<br>' +
    '• <b>垂直线</b>斜率之积为 $-1$。若一条线斜率为 $m$，垂直线斜率为 $-\\frac{1}{m}$。<br>' +
    '• <b>二次函数图</b>（$y = ax^2 + bx + c$）：$a > 0$ 开口向上，$a < 0$ 开口向下。<br>' +
    '• <b>实际问题图</b>：斜率代表变化率，截距代表初始值。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求过两点的直线方程：(1) 求斜率，(2) 将一个点代入 $y = mx + c$ 求 $c$。<br><br>' +
    '<b>注意！</b><br>' +
    '水平线斜率为 0（方程 $y = c$）。竖直线斜率不存在（方程 $x = k$）。'
});

add('hhk', 'Y9.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Find the equation of the line passing through $(1, 5)$ and $(3, 11)$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Gradient: $m = \\frac{11 - 5}{3 - 1} = \\frac{6}{2} = 3$<br>' +
    'Substitute $(1, 5)$ into $y = 3x + c$:<br>' +
    '$5 = 3(1) + c$<br>' +
    '$c = 2$<br>' +
    'Equation: $y = 3x + 2$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Find the equation of the line perpendicular to $y = 2x - 1$ that passes through $(4, 3)$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Gradient of given line: $m = 2$<br>' +
    'Perpendicular gradient: $m_{\\perp} = -\\frac{1}{2}$<br>' +
    'Substitute $(4, 3)$ into $y = -\\frac{1}{2}x + c$:<br>' +
    '$3 = -\\frac{1}{2}(4) + c = -2 + c$<br>' +
    '$c = 5$<br>' +
    'Equation: $y = -\\frac{1}{2}x + 5$<br><br>' +
    '<b>Exam Tip:</b> For perpendicular gradients, flip the fraction and change the sign. The perpendicular gradient of $\\frac{2}{3}$ is $-\\frac{3}{2}$.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '求过点 $(1, 5)$ 和 $(3, 11)$ 的直线方程。<br><br>' +
    '<b>解答：</b><br>' +
    '斜率：$m = \\frac{11 - 5}{3 - 1} = \\frac{6}{2} = 3$<br>' +
    '将 $(1, 5)$ 代入 $y = 3x + c$：<br>' +
    '$5 = 3(1) + c$<br>' +
    '$c = 2$<br>' +
    '方程：$y = 3x + 2$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '求与 $y = 2x - 1$ 垂直且过点 $(4, 3)$ 的直线方程。<br><br>' +
    '<b>解答：</b><br>' +
    '已知直线斜率：$m = 2$<br>' +
    '垂直斜率：$m_{\\perp} = -\\frac{1}{2}$<br>' +
    '将 $(4, 3)$ 代入 $y = -\\frac{1}{2}x + c$：<br>' +
    '$3 = -\\frac{1}{2}(4) + c = -2 + c$<br>' +
    '$c = 5$<br>' +
    '方程：$y = -\\frac{1}{2}x + 5$<br><br>' +
    '<b>考试技巧：</b>求垂直斜率时，将分数翻转并变号。$\\frac{2}{3}$ 的垂直斜率为 $-\\frac{3}{2}$。'
});

add('hhk', 'Y9.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Angles in a <b>triangle</b> add up to $180°$.<br>' +
    '• Angles in a <b>quadrilateral</b> add up to $360°$.<br>' +
    '• Angles on a <b>straight line</b> add up to $180°$.<br>' +
    '• Angles at a <b>point</b> add up to $360°$.<br>' +
    '• <b>Vertically opposite</b> angles are equal.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Interior angle sum</b> of an $n$-sided polygon: $(n - 2) \\times 180°$.<br>' +
    '• Each interior angle of a <b>regular</b> $n$-sided polygon: $\\frac{(n - 2) \\times 180°}{n}$.<br>' +
    '• <b>Exterior angles</b> of any polygon sum to $360°$. Each exterior angle of a regular polygon: $\\frac{360°}{n}$.<br>' +
    '• Interior angle + exterior angle = $180°$.<br>' +
    '• <b>Bearings</b>: measured clockwise from North, always written as 3 digits (e.g. $045°$, $210°$).<br>' +
    '• Back bearing = bearing $\\pm 180°$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When asked "how many sides does a polygon have", set up an equation using the angle sum formula and solve for $n$. If the exterior angle is $40°$, then $n = \\frac{360°}{40°} = 9$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Bearings must always be 3 digits. $45°$ must be written as $045°$. Always measure from North and always go clockwise.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>三角形</b>内角和为 $180°$。<br>' +
    '• <b>四边形</b>内角和为 $360°$。<br>' +
    '• <b>平角</b>（一条直线上的角）之和为 $180°$。<br>' +
    '• <b>周角</b>（一点周围的角）之和为 $360°$。<br>' +
    '• <b>对顶角</b>相等。<br><br>' +
    '<b>关键技能</b><br>' +
    '• $n$ 边形的<b>内角和</b>：$(n - 2) \\times 180°$。<br>' +
    '• <b>正</b> $n$ 边形的每个内角：$\\frac{(n - 2) \\times 180°}{n}$。<br>' +
    '• 任何多边形的<b>外角和</b>为 $360°$。正多边形每个外角：$\\frac{360°}{n}$。<br>' +
    '• 内角 + 外角 = $180°$。<br>' +
    '• <b>方位角</b>：从正北方向顺时针测量，始终用 3 位数表示（如 $045°$, $210°$）。<br>' +
    '• 反方位角 = 方位角 $\\pm 180°$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '问"多边形有几条边"时，用角度和公式列方程求 $n$。若外角为 $40°$，则 $n = \\frac{360°}{40°} = 9$。<br><br>' +
    '<b>注意！</b><br>' +
    '方位角必须写 3 位数，$45°$ 应写为 $045°$。始终从北方开始，顺时针测量。'
});

add('hhk', 'Y9.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'The interior angle of a regular polygon is $156°$. How many sides does it have?<br><br>' +
    '<b>Solution:</b><br>' +
    'Exterior angle $= 180° - 156° = 24°$<br>' +
    'Number of sides $= \\frac{360°}{24°} = 15$<br>' +
    'The polygon has 15 sides.<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'The bearing of B from A is $125°$. Find the bearing of A from B.<br><br>' +
    '<b>Solution:</b><br>' +
    'Back bearing $= 125° + 180° = 305°$<br>' +
    'The bearing of A from B is $305°$.<br><br>' +
    '<b>Exam Tip:</b> For back bearings: if the original bearing is less than $180°$, add $180°$. If it is $180°$ or more, subtract $180°$.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个正多边形的内角为 $156°$，求它有几条边。<br><br>' +
    '<b>解答：</b><br>' +
    '外角 $= 180° - 156° = 24°$<br>' +
    '边数 $= \\frac{360°}{24°} = 15$<br>' +
    '该多边形有 15 条边。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    'B 相对 A 的方位角为 $125°$，求 A 相对 B 的方位角。<br><br>' +
    '<b>解答：</b><br>' +
    '反方位角 $= 125° + 180° = 305°$<br>' +
    'A 相对 B 的方位角为 $305°$。<br><br>' +
    '<b>考试技巧：</b>求反方位角：原方位角小于 $180°$ 则加 $180°$；大于等于 $180°$ 则减 $180°$。'
});

add('hhk', 'Y9.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• In a right-angled triangle, the <b>hypotenuse</b> is the longest side, opposite the right angle.<br>' +
    '• <b>Pythagoras\' Theorem</b>: $a^2 + b^2 = c^2$, where $c$ is the hypotenuse.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Find the hypotenuse</b>: $c = \\sqrt{a^2 + b^2}$. E.g. if $a = 5, b = 12$, then $c = \\sqrt{25 + 144} = \\sqrt{169} = 13$.<br>' +
    '• <b>Find a shorter side</b>: $a = \\sqrt{c^2 - b^2}$. E.g. if $c = 10, b = 6$, then $a = \\sqrt{100 - 36} = \\sqrt{64} = 8$.<br>' +
    '• <b>Distance between two points</b> $(x_1, y_1)$ and $(x_2, y_2)$: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.<br>' +
    '• <b>3D Pythagoras</b>: for a cuboid with sides $a, b, c$, the space diagonal $= \\sqrt{a^2 + b^2 + c^2}$. Apply Pythagoras twice: first on the base, then on the resulting triangle.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always identify the hypotenuse first (it is opposite the right angle and the longest side). If finding the hypotenuse, ADD the squares. If finding a shorter side, SUBTRACT.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do not round intermediate answers. Keep the exact value under the square root until the final step.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 直角三角形中，<b>斜边</b>是最长边，位于直角对面。<br>' +
    '• <b>勾股定理</b>：$a^2 + b^2 = c^2$，$c$ 为斜边。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>求斜边</b>：$c = \\sqrt{a^2 + b^2}$。如 $a = 5, b = 12$，则 $c = \\sqrt{25 + 144} = \\sqrt{169} = 13$。<br>' +
    '• <b>求短边</b>：$a = \\sqrt{c^2 - b^2}$。如 $c = 10, b = 6$，则 $a = \\sqrt{100 - 36} = \\sqrt{64} = 8$。<br>' +
    '• <b>两点间距离</b>：$(x_1, y_1)$ 到 $(x_2, y_2)$ 的距离 $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$。<br>' +
    '• <b>三维勾股定理</b>：长方体边长 $a, b, c$，体对角线 $= \\sqrt{a^2 + b^2 + c^2}$。分两步：先算底面对角线，再与高组成直角三角形。<br><br>' +
    '<b>考试技巧</b><br>' +
    '先找出斜边（最长边，直角对面）。求斜边用加法，求短边用减法。<br><br>' +
    '<b>注意！</b><br>' +
    '中间计算不要四舍五入。保留根号下的精确值，到最后一步再取近似。'
});

add('hhk', 'Y9.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A right-angled triangle has shorter sides of $7$ cm and $24$ cm. Find the hypotenuse.<br><br>' +
    '<b>Solution:</b><br>' +
    '$c^2 = 7^2 + 24^2 = 49 + 576 = 625$<br>' +
    '$c = \\sqrt{625} = 25$ cm<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A cuboid measures $3$ cm by $4$ cm by $12$ cm. Find the length of the space diagonal.<br><br>' +
    '<b>Solution:</b><br>' +
    'Step 1: base diagonal $= \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$ cm<br>' +
    'Step 2: space diagonal $= \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$ cm<br>' +
    'Or directly: $\\sqrt{3^2 + 4^2 + 12^2} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13$ cm<br><br>' +
    '<b>Exam Tip:</b> In 3D problems, sketch the right-angled triangles you are using. This helps you identify which lengths to use.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个直角三角形的两条短边分别为 $7$ cm 和 $24$ cm，求斜边。<br><br>' +
    '<b>解答：</b><br>' +
    '$c^2 = 7^2 + 24^2 = 49 + 576 = 625$<br>' +
    '$c = \\sqrt{625} = 25$ cm<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '一个长方体的长、宽、高分别为 $3$ cm、$4$ cm、$12$ cm，求体对角线的长度。<br><br>' +
    '<b>解答：</b><br>' +
    '第一步：底面对角线 $= \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$ cm<br>' +
    '第二步：体对角线 $= \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$ cm<br>' +
    '或直接：$\\sqrt{3^2 + 4^2 + 12^2} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13$ cm<br><br>' +
    '<b>考试技巧：</b>三维问题中，画出你用到的直角三角形。这有助于确定使用哪些边长。'
});

add('hhk', 'Y9.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Quadrilateral</b> properties:<br>' +
    '  - <b>Square</b>: 4 equal sides, 4 right angles, diagonals bisect at $90°$.<br>' +
    '  - <b>Rectangle</b>: opposite sides equal, 4 right angles, diagonals bisect each other.<br>' +
    '  - <b>Parallelogram</b>: opposite sides equal and parallel, opposite angles equal, diagonals bisect each other.<br>' +
    '  - <b>Rhombus</b>: 4 equal sides, opposite angles equal, diagonals bisect at $90°$.<br>' +
    '  - <b>Trapezium</b>: exactly one pair of parallel sides.<br>' +
    '  - <b>Kite</b>: 2 pairs of adjacent equal sides, 1 pair of opposite angles equal, diagonals cross at $90°$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Use quadrilateral properties to find missing angles and prove results.<br>' +
    '• <b>Area of a triangle</b>: $A = \\frac{1}{2} \\times b \\times h$.<br>' +
    '• <b>Area of a parallelogram</b>: $A = b \\times h$ (perpendicular height, not slant).<br>' +
    '• <b>Area of a trapezium</b>: $A = \\frac{1}{2}(a + b) \\times h$, where $a$ and $b$ are the parallel sides.<br>' +
    '• <b>Compound shapes</b>: split into simpler shapes, calculate each area, then add (or subtract).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For compound shapes, draw dashed lines to show how you split the shape. Label each part with its dimensions. Always show your working for each sub-shape.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'The height in area formulas must be <i>perpendicular</i> to the base, not the slant height.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>四边形</b>性质：<br>' +
    '  - <b>正方形</b>：4 条边相等，4 个直角，对角线互相垂直平分。<br>' +
    '  - <b>长方形</b>：对边相等，4 个直角，对角线互相平分。<br>' +
    '  - <b>平行四边形</b>：对边平行且相等，对角相等，对角线互相平分。<br>' +
    '  - <b>菱形</b>：4 条边相等，对角相等，对角线互相垂直平分。<br>' +
    '  - <b>梯形</b>：恰好有一组平行边。<br>' +
    '  - <b>风筝形</b>：两组相邻的边相等，一组对角相等，对角线垂直。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 利用四边形性质求缺失角度和证明结论。<br>' +
    '• <b>三角形面积</b>：$A = \\frac{1}{2} \\times b \\times h$。<br>' +
    '• <b>平行四边形面积</b>：$A = b \\times h$（垂直高，非斜高）。<br>' +
    '• <b>梯形面积</b>：$A = \\frac{1}{2}(a + b) \\times h$，$a, b$ 为平行边。<br>' +
    '• <b>组合图形</b>：分割成简单图形，分别计算面积后相加（或相减）。<br><br>' +
    '<b>考试技巧</b><br>' +
    '处理组合图形时，用虚线标出分割方式，标注每部分的尺寸，逐步展示每个子图形的计算过程。<br><br>' +
    '<b>注意！</b><br>' +
    '面积公式中的"高"必须是<i>垂直于底边</i>的高，不是斜边的长。'
});

add('hhk', 'Y9.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A trapezium has parallel sides of $8$ cm and $14$ cm, and a perpendicular height of $6$ cm. Find its area.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = \\frac{1}{2}(a + b) \\times h$<br>' +
    '$A = \\frac{1}{2}(8 + 14) \\times 6$<br>' +
    '$A = \\frac{1}{2} \\times 22 \\times 6 = 66$ cm$^2$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A compound shape is made from a rectangle $12$ cm by $5$ cm with a right-angled triangle removed. The triangle has base $4$ cm and height $5$ cm. Find the shaded area.<br><br>' +
    '<b>Solution:</b><br>' +
    'Area of rectangle $= 12 \\times 5 = 60$ cm$^2$<br>' +
    'Area of triangle $= \\frac{1}{2} \\times 4 \\times 5 = 10$ cm$^2$<br>' +
    'Shaded area $= 60 - 10 = 50$ cm$^2$<br><br>' +
    '<b>Exam Tip:</b> Always include units in your answer. For area use cm$^2$ or m$^2$; for perimeter use cm or m.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '梯形的两条平行边分别为 $8$ cm 和 $14$ cm，垂直高为 $6$ cm，求其面积。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = \\frac{1}{2}(a + b) \\times h$<br>' +
    '$A = \\frac{1}{2}(8 + 14) \\times 6$<br>' +
    '$A = \\frac{1}{2} \\times 22 \\times 6 = 66$ cm$^2$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '一个组合图形由 $12$ cm $\\times$ $5$ cm 的长方形去掉一个直角三角形构成。三角形底 $4$ cm、高 $5$ cm，求阴影部分面积。<br><br>' +
    '<b>解答：</b><br>' +
    '长方形面积 $= 12 \\times 5 = 60$ cm$^2$<br>' +
    '三角形面积 $= \\frac{1}{2} \\times 4 \\times 5 = 10$ cm$^2$<br>' +
    '阴影面积 $= 60 - 10 = 50$ cm$^2$<br><br>' +
    '<b>考试技巧：</b>答案一定要带单位。面积用 cm$^2$ 或 m$^2$；周长用 cm 或 m。'
});

add('hhk', 'Y9.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• To convert a fraction to a percentage: multiply by 100. $\\frac{3}{8} = \\frac{3}{8} \\times 100 = 37.5\\%$.<br>' +
    '• To convert a percentage to a decimal: divide by 100. $45\\% = 0.45$.<br>' +
    '• To convert a decimal to a percentage: multiply by 100. $0.72 = 72\\%$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Percentage of a quantity</b>: $15\\%$ of $240 = 0.15 \\times 240 = 36$.<br>' +
    '• <b>Percentage increase</b>: multiply by $(1 + \\frac{r}{100})$. A $20\\%$ increase: multiply by $1.2$.<br>' +
    '• <b>Percentage decrease</b>: multiply by $(1 - \\frac{r}{100})$. A $15\\%$ decrease: multiply by $0.85$.<br>' +
    '• <b>Percentage change</b>: $\\frac{\\text{change}}{\\text{original}} \\times 100\\%$.<br>' +
    '• <b>Reverse percentages</b>: find the original value before a percentage change. If a price after a $20\\%$ increase is $\\pounds 60$, then $1.2 \\times \\text{original} = 60$, so original $= \\frac{60}{1.2} = \\pounds 50$.<br>' +
    '• <b>Simple interest</b>: $I = \\frac{PRT}{100}$, where $P$ = principal, $R$ = rate per year, $T$ = time in years.<br>' +
    '• <b>Compound interest</b>: $A = P\\left(1 + \\frac{r}{100}\\right)^n$, where $n$ = number of years.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For compound interest, use a multiplier. For $3\\%$ growth over $5$ years: $A = P \\times 1.03^5$. Do NOT calculate year by year.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'In reverse percentage problems, the percentage change is based on the ORIGINAL value, not the new value. Do not divide by the new percentage.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 分数化百分数：乘以 100。$\\frac{3}{8} = \\frac{3}{8} \\times 100 = 37.5\\%$。<br>' +
    '• 百分数化小数：除以 100。$45\\% = 0.45$。<br>' +
    '• 小数化百分数：乘以 100。$0.72 = 72\\%$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>求百分比</b>：$240$ 的 $15\\% = 0.15 \\times 240 = 36$。<br>' +
    '• <b>百分比增加</b>：乘以 $(1 + \\frac{r}{100})$。增加 $20\\%$ 则乘以 $1.2$。<br>' +
    '• <b>百分比减少</b>：乘以 $(1 - \\frac{r}{100})$。减少 $15\\%$ 则乘以 $0.85$。<br>' +
    '• <b>百分比变化</b>：$\\frac{\\text{变化量}}{\\text{原值}} \\times 100\\%$。<br>' +
    '• <b>逆向百分比</b>：已知变化后的值求原值。若涨 $20\\%$ 后价格为 $\\pounds 60$，则 $1.2 \\times \\text{原价} = 60$，原价 $= \\frac{60}{1.2} = \\pounds 50$。<br>' +
    '• <b>单利</b>：$I = \\frac{PRT}{100}$，$P$ = 本金，$R$ = 年利率，$T$ = 年数。<br>' +
    '• <b>复利</b>：$A = P\\left(1 + \\frac{r}{100}\\right)^n$，$n$ = 年数。<br><br>' +
    '<b>考试技巧</b><br>' +
    '复利计算用乘数法。$3\\%$ 增长 $5$ 年：$A = P \\times 1.03^5$。不要逐年计算。<br><br>' +
    '<b>注意！</b><br>' +
    '逆向百分比中，百分比变化是基于原值，不是新值。不要除以变化后的百分比。'
});

add('hhk', 'Y9.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A shirt costs $\\pounds 45$ after a $25\\%$ discount. Find the original price.<br><br>' +
    '<b>Solution:</b><br>' +
    'After a $25\\%$ decrease, the multiplier is $1 - 0.25 = 0.75$.<br>' +
    '$0.75 \\times \\text{original} = 45$<br>' +
    '$\\text{original} = \\frac{45}{0.75} = \\pounds 60$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    '$\\pounds 2000$ is invested at $4\\%$ compound interest per year. Find the value after $3$ years.<br><br>' +
    '<b>Solution:</b><br>' +
    '$A = P\\left(1 + \\frac{r}{100}\\right)^n$<br>' +
    '$A = 2000 \\times 1.04^3$<br>' +
    '$A = 2000 \\times 1.124864$<br>' +
    '$A = \\pounds 2249.73$ (to the nearest penny)<br><br>' +
    '<b>Exam Tip:</b> Always re-read the question — does it ask for the final amount or the interest earned? If interest: subtract the original from the final amount.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一件衬衫打 $75$ 折后售价 $\\pounds 45$，求原价。<br><br>' +
    '<b>解答：</b><br>' +
    '减少 $25\\%$ 后的乘数为 $1 - 0.25 = 0.75$。<br>' +
    '$0.75 \\times \\text{原价} = 45$<br>' +
    '$\\text{原价} = \\frac{45}{0.75} = \\pounds 60$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '$\\pounds 2000$ 按年利率 $4\\%$ 复利投资，求 $3$ 年后的金额。<br><br>' +
    '<b>解答：</b><br>' +
    '$A = P\\left(1 + \\frac{r}{100}\\right)^n$<br>' +
    '$A = 2000 \\times 1.04^3$<br>' +
    '$A = 2000 \\times 1.124864$<br>' +
    '$A = \\pounds 2249.73$（精确到分）<br><br>' +
    '<b>考试技巧：</b>仔细审题——问的是最终金额还是利息？若问利息：用最终金额减去本金。'
});

add('hhk', 'Y9.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>population</b> is the entire group you want to find information about.<br>' +
    '• A <b>sample</b> is a smaller part of the population that is studied.<br>' +
    '• Sampling is used because it is often impractical, too costly, or too time-consuming to survey the whole population.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Random sampling</b>: every member of the population has an equal chance of being selected (e.g. names from a hat, random number generator). Advantage: unbiased. Disadvantage: may not be representative if sample is small.<br>' +
    '• <b>Systematic sampling</b>: select every $k$th member from a list (e.g. every 10th person). Advantage: simple and quick. Disadvantage: can introduce bias if there is a hidden pattern in the list.<br>' +
    '• <b>Stratified sampling</b>: divide the population into groups (strata) and sample proportionally from each group.<br>' +
    '• Stratified sample size from a group: $\\frac{\\text{group size}}{\\text{population size}} \\times \\text{total sample size}$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'In stratified sampling questions, always show your proportion calculation. The sample from each stratum must be rounded to the nearest whole number, and the total must match the required sample size.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A biased sample does not represent the population fairly. Sampling only from one subgroup (e.g. only Year 9 students) to draw conclusions about the whole school is biased.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>总体</b>是你想了解的整个群体。<br>' +
    '• <b>样本</b>是从总体中抽取的一小部分。<br>' +
    '• 抽样的原因：调查整个总体往往不切实际、成本过高或耗时过长。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>随机抽样</b>：每个成员被选中的概率相等（如抽签、随机数生成器）。优点：无偏。缺点：样本小时可能不具代表性。<br>' +
    '• <b>系统抽样</b>：从列表中每隔 $k$ 个选一个（如每第 10 个人）。优点：简单快捷。缺点：列表有隐藏规律时可能产生偏差。<br>' +
    '• <b>分层抽样</b>：按类别分组，从每组按比例抽样。<br>' +
    '• 每层的样本量：$\\frac{\\text{该层人数}}{\\text{总体人数}} \\times \\text{样本总量}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '分层抽样题中务必展示比例计算过程。每层样本四舍五入到整数，总和必须等于要求的样本量。<br><br>' +
    '<b>注意！</b><br>' +
    '有偏样本不能公正地代表总体。只从一个子群（如仅 Year 9 学生）抽样来推断全校情况是有偏的。'
});

add('hhk', 'Y9.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Give one advantage and one disadvantage of using a sample rather than a census.<br><br>' +
    '<b>Solution:</b><br>' +
    'Advantage: A sample is quicker and cheaper to collect than surveying the entire population.<br>' +
    'Disadvantage: A sample may not be representative of the whole population, leading to inaccurate conclusions.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A school has 120 students in Year 7, 150 in Year 8, and 130 in Year 9. A stratified sample of 80 students is needed. How many should be chosen from each year?<br><br>' +
    '<b>Solution:</b><br>' +
    'Total population $= 120 + 150 + 130 = 400$<br>' +
    'Year 7: $\\frac{120}{400} \\times 80 = 24$ students<br>' +
    'Year 8: $\\frac{150}{400} \\times 80 = 30$ students<br>' +
    'Year 9: $\\frac{130}{400} \\times 80 = 26$ students<br>' +
    'Check: $24 + 30 + 26 = 80$ &#10003;<br><br>' +
    '<b>Exam Tip:</b> Always check that your stratified samples add up to the total required sample size.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '说出用样本而非普查的一个优点和一个缺点。<br><br>' +
    '<b>解答：</b><br>' +
    '优点：样本比调查整个总体更快、更省钱。<br>' +
    '缺点：样本可能不能代表整个总体，导致结论不准确。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '某校 Year 7 有 120 人，Year 8 有 150 人，Year 9 有 130 人。需要一个 80 人的分层样本，每个年级应选多少人？<br><br>' +
    '<b>解答：</b><br>' +
    '总体 $= 120 + 150 + 130 = 400$<br>' +
    'Year 7：$\\frac{120}{400} \\times 80 = 24$ 人<br>' +
    'Year 8：$\\frac{150}{400} \\times 80 = 30$ 人<br>' +
    'Year 9：$\\frac{130}{400} \\times 80 = 26$ 人<br>' +
    '验证：$24 + 30 + 26 = 80$ &#10003;<br><br>' +
    '<b>考试技巧：</b>一定要验证各层样本之和等于要求的样本总量。'
});

add('hhk', 'Y9.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Bar charts</b>: bars represent frequencies; gaps between bars; bars can be horizontal or vertical.<br>' +
    '• <b>Pie charts</b>: the angle for each category $= \\frac{\\text{frequency}}{\\text{total}} \\times 360°$.<br>' +
    '• <b>Pictograms</b>: use symbols to represent data; a key shows the value of each symbol.<br>' +
    '• <b>Stem-and-leaf diagrams</b>: split data into stem (tens) and leaf (units). Data must be in order. Always include a key.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Frequency polygons</b>: plot frequency against the midpoint of each class interval, then join with straight lines.<br>' +
    '• <b>Scatter diagrams</b>: plot pairs of data on a grid. Describe the <b>correlation</b>:<br>' +
    '  - <b>Positive</b>: as one increases, the other increases.<br>' +
    '  - <b>Negative</b>: as one increases, the other decreases.<br>' +
    '  - <b>No correlation</b>: no clear pattern.<br>' +
    '• <b>Line of best fit</b>: a straight line through the data that passes through $(\\bar{x}, \\bar{y})$ with roughly equal points above and below.<br>' +
    '• <b>Time series</b>: data plotted against time; used to identify trends and seasonal patterns.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When drawing a line of best fit, use a ruler and make sure the line passes through the mean point $(\\bar{x}, \\bar{y})$. Use the line to make predictions (interpolation is more reliable than extrapolation).<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Correlation does not mean causation. Two variables having a positive correlation does not mean one causes the other.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>条形图</b>：用条形高度表示频率；条形之间有间隔；可垂直或水平。<br>' +
    '• <b>饼图</b>：每类的角度 $= \\frac{\\text{频率}}{\\text{总数}} \\times 360°$。<br>' +
    '• <b>象形图</b>：用符号表示数据，图例说明每个符号代表的值。<br>' +
    '• <b>茎叶图</b>：将数据分为茎（十位）和叶（个位），数据必须有序，必须附图例。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>频率多边形</b>：在每个组的组中值处标点表示频率，再用直线连接。<br>' +
    '• <b>散点图</b>：将成对数据描在坐标格上。描述<b>相关性</b>：<br>' +
    '  - <b>正相关</b>：一个增大，另一个也增大。<br>' +
    '  - <b>负相关</b>：一个增大，另一个减小。<br>' +
    '  - <b>无相关</b>：没有明显规律。<br>' +
    '• <b>最佳拟合线</b>：通过 $(\\bar{x}, \\bar{y})$ 的直线，上下两侧点数大致相等。<br>' +
    '• <b>时间序列</b>：数据随时间绘制，用于识别趋势和季节性规律。<br><br>' +
    '<b>考试技巧</b><br>' +
    '画最佳拟合线时用尺子，确保通过均值点 $(\\bar{x}, \\bar{y})$。用拟合线做预测（内插比外推更可靠）。<br><br>' +
    '<b>注意！</b><br>' +
    '相关性不等于因果关系。两个变量正相关不代表一个导致另一个。'
});

add('hhk', 'Y9.9', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'In a survey, 90 students chose their favourite sport: Football 35, Tennis 20, Swimming 25, Other 10. Find the angle for each category in a pie chart.<br><br>' +
    '<b>Solution:</b><br>' +
    'Football: $\\frac{35}{90} \\times 360° = 140°$<br>' +
    'Tennis: $\\frac{20}{90} \\times 360° = 80°$<br>' +
    'Swimming: $\\frac{25}{90} \\times 360° = 100°$<br>' +
    'Other: $\\frac{10}{90} \\times 360° = 40°$<br>' +
    'Check: $140° + 80° + 100° + 40° = 360°$ &#10003;<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A scatter diagram shows a negative correlation between hours of TV watched and test scores. The line of best fit passes through $(2, 75)$ and $(6, 55)$. Estimate the test score for a student who watches $4$ hours of TV.<br><br>' +
    '<b>Solution:</b><br>' +
    'Gradient $= \\frac{55 - 75}{6 - 2} = \\frac{-20}{4} = -5$<br>' +
    '$y = -5x + c$; using $(2, 75)$: $75 = -10 + c$, so $c = 85$.<br>' +
    'When $x = 4$: $y = -5(4) + 85 = 65$<br>' +
    'Estimated test score $= 65$.<br><br>' +
    '<b>Exam Tip:</b> Only use the line of best fit for values within the range of data (interpolation). Predictions outside the range (extrapolation) are unreliable.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '调查中 90 名学生选择最喜欢的运动：足球 35 人、网球 20 人、游泳 25 人、其他 10 人。求饼图中每类的角度。<br><br>' +
    '<b>解答：</b><br>' +
    '足球：$\\frac{35}{90} \\times 360° = 140°$<br>' +
    '网球：$\\frac{20}{90} \\times 360° = 80°$<br>' +
    '游泳：$\\frac{25}{90} \\times 360° = 100°$<br>' +
    '其他：$\\frac{10}{90} \\times 360° = 40°$<br>' +
    '验证：$140° + 80° + 100° + 40° = 360°$ &#10003;<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '散点图显示看电视时间与考试成绩呈负相关。最佳拟合线过 $(2, 75)$ 和 $(6, 55)$。估计看 $4$ 小时电视的学生的考试成绩。<br><br>' +
    '<b>解答：</b><br>' +
    '斜率 $= \\frac{55 - 75}{6 - 2} = \\frac{-20}{4} = -5$<br>' +
    '$y = -5x + c$；代入 $(2, 75)$：$75 = -10 + c$，$c = 85$。<br>' +
    '当 $x = 4$：$y = -5(4) + 85 = 65$<br>' +
    '预估考试成绩为 $65$ 分。<br><br>' +
    '<b>考试技巧：</b>只在数据范围内使用拟合线预测（内插法）。超出范围的预测（外推法）不可靠。'
});

add('hhk', 'Y9.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• An <b>algebraic fraction</b> has a variable in the numerator and/or denominator, e.g. $\\frac{3x}{x + 2}$.<br>' +
    '• To simplify, factorise numerator and denominator, then cancel common factors.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Change the subject</b> when the subject appears <b>twice</b>: collect all terms with the subject on one side, factorise, then divide.<br>' +
    '  Example: Make $x$ the subject of $y = \\frac{3x + 1}{x - 2}$:<br>' +
    '  $y(x - 2) = 3x + 1$ $\\Rightarrow$ $yx - 2y = 3x + 1$ $\\Rightarrow$ $yx - 3x = 2y + 1$ $\\Rightarrow$ $x(y - 3) = 2y + 1$ $\\Rightarrow$ $x = \\frac{2y + 1}{y - 3}$.<br>' +
    '• <b>Simplify algebraic fractions</b>: $\\frac{x^2 - 4}{x + 2} = \\frac{(x+2)(x-2)}{x+2} = x - 2$.<br>' +
    '• <b>Add/subtract algebraic fractions</b>: find a common denominator.<br>' +
    '  $\\frac{2}{x+1} + \\frac{3}{x-1} = \\frac{2(x-1) + 3(x+1)}{(x+1)(x-1)} = \\frac{5x + 1}{x^2 - 1}$.<br>' +
    '• <b>Solve equations with algebraic fractions</b>: multiply both sides by the common denominator, then solve the resulting equation.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When the subject appears twice, group all terms with that variable on one side, then factorise it out. This is the key technique for harder rearrangement questions.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'You cannot cancel terms across a $+$ or $-$ sign. $\\frac{x + 3}{x + 5} \\neq \\frac{3}{5}$. You can only cancel common <i>factors</i>.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>代数分式</b>的分子和/或分母含有变量，如 $\\frac{3x}{x + 2}$。<br>' +
    '• 化简时先因式分解，再约去公因式。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 当主项<b>出现两次</b>时<b>变换主项</b>：把含主项的项移到一边，提公因子，再除。<br>' +
    '  例：将 $y = \\frac{3x + 1}{x - 2}$ 变形为以 $x$ 为主项：<br>' +
    '  $y(x - 2) = 3x + 1$ $\\Rightarrow$ $yx - 2y = 3x + 1$ $\\Rightarrow$ $yx - 3x = 2y + 1$ $\\Rightarrow$ $x(y - 3) = 2y + 1$ $\\Rightarrow$ $x = \\frac{2y + 1}{y - 3}$。<br>' +
    '• <b>化简代数分式</b>：$\\frac{x^2 - 4}{x + 2} = \\frac{(x+2)(x-2)}{x+2} = x - 2$。<br>' +
    '• <b>代数分式加减</b>：找公分母。<br>' +
    '  $\\frac{2}{x+1} + \\frac{3}{x-1} = \\frac{2(x-1) + 3(x+1)}{(x+1)(x-1)} = \\frac{5x + 1}{x^2 - 1}$。<br>' +
    '• <b>解含代数分式的方程</b>：两边同乘公分母，化为整式方程求解。<br><br>' +
    '<b>考试技巧</b><br>' +
    '主项出现两次时，将含该变量的项归到一边，提公因子。这是难题的核心技巧。<br><br>' +
    '<b>注意！</b><br>' +
    '不能在加号或减号两侧约分。$\\frac{x + 3}{x + 5} \\neq \\frac{3}{5}$。只有公<i>因式</i>才能约去。'
});

add('hhk', 'Y9.10', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'Make $x$ the subject of $y = \\frac{5x}{2x + 1}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$y(2x + 1) = 5x$<br>' +
    '$2xy + y = 5x$<br>' +
    '$2xy - 5x = -y$<br>' +
    '$x(2y - 5) = -y$<br>' +
    '$x = \\frac{-y}{2y - 5}$ or equivalently $x = \\frac{y}{5 - 2y}$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Solve $\\frac{4}{x - 3} - \\frac{2}{x + 1} = 1$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply through by $(x - 3)(x + 1)$:<br>' +
    '$4(x + 1) - 2(x - 3) = (x - 3)(x + 1)$<br>' +
    '$4x + 4 - 2x + 6 = x^2 - 2x - 3$<br>' +
    '$2x + 10 = x^2 - 2x - 3$<br>' +
    '$0 = x^2 - 4x - 13$<br>' +
    '$x = \\frac{4 \\pm \\sqrt{16 + 52}}{2} = \\frac{4 \\pm \\sqrt{68}}{2} = 2 \\pm \\sqrt{17}$<br><br>' +
    '<b>Exam Tip:</b> Always check your solutions by substituting back into the original equation. Make sure no solution makes a denominator equal to zero.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '将 $y = \\frac{5x}{2x + 1}$ 变形为以 $x$ 为主项。<br><br>' +
    '<b>解答：</b><br>' +
    '$y(2x + 1) = 5x$<br>' +
    '$2xy + y = 5x$<br>' +
    '$2xy - 5x = -y$<br>' +
    '$x(2y - 5) = -y$<br>' +
    '$x = \\frac{-y}{2y - 5}$，即 $x = \\frac{y}{5 - 2y}$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '解方程 $\\frac{4}{x - 3} - \\frac{2}{x + 1} = 1$。<br><br>' +
    '<b>解答：</b><br>' +
    '两边同乘 $(x - 3)(x + 1)$：<br>' +
    '$4(x + 1) - 2(x - 3) = (x - 3)(x + 1)$<br>' +
    '$4x + 4 - 2x + 6 = x^2 - 2x - 3$<br>' +
    '$2x + 10 = x^2 - 2x - 3$<br>' +
    '$0 = x^2 - 4x - 13$<br>' +
    '$x = \\frac{4 \\pm \\sqrt{16 + 52}}{2} = \\frac{4 \\pm \\sqrt{68}}{2} = 2 \\pm \\sqrt{17}$<br><br>' +
    '<b>考试技巧：</b>将解代回原方程验算。确保解不会使分母为零。'
});

add('hhk', 'Y9.11', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Constructions</b> use only a compass and a straight edge (ruler). No measuring of angles.<br>' +
    '• A <b>locus</b> is a set of points that satisfy a given condition.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Perpendicular bisector</b> of a line segment: open compass to more than half the line length, draw arcs from both ends, join the intersection points. This line is the locus of points equidistant from both ends.<br>' +
    '• <b>Angle bisector</b>: from the vertex, draw an arc crossing both arms. From these crossing points, draw two more arcs that intersect. Join the vertex to this intersection. This is the locus of points equidistant from both arms.<br>' +
    '• <b>Locus of points</b> a fixed distance from a point: circle. A fixed distance from a line: parallel lines with semicircular ends.<br>' +
    '• <b>Construct a triangle</b> given SSS, SAS, or ASA using ruler, protractor, and compass.<br>' +
    '• <b>Scale drawings</b>: use a given scale to draw real-life situations accurately. Convert real lengths using the scale factor.<br>' +
    '• <b>Bearings on scale drawings</b>: measure angles clockwise from North using a protractor.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Leave all construction arcs visible — the examiner needs to see them. Use a sharp pencil for accuracy. For scale drawings, state the scale clearly and measure carefully.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When constructing a perpendicular bisector, the compass width must be more than half the line segment. If it is too small, the arcs will not intersect.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>尺规作图</b>只使用圆规和直尺，不测量角度。<br>' +
    '• <b>轨迹</b>是满足特定条件的所有点的集合。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>线段的垂直平分线</b>：圆规张开超过线段一半，从两端画弧，连接交点。该线是到两端点等距的点的轨迹。<br>' +
    '• <b>角平分线</b>：从顶点画弧交两边，再从交点分别画弧使其相交，连接顶点和交点。该线是到两边等距的点的轨迹。<br>' +
    '• <b>轨迹</b>：到定点等距的轨迹是圆；到定线等距的轨迹是平行线加半圆端。<br>' +
    '• 已知 SSS、SAS 或 ASA <b>构造三角形</b>，使用尺、量角器和圆规。<br>' +
    '• <b>比例图</b>：用给定比例尺准确绘制实际情境。用比例因子换算实际长度。<br>' +
    '• <b>比例图上的方位角</b>：用量角器从北方向顺时针测量。<br><br>' +
    '<b>考试技巧</b><br>' +
    '保留所有作图弧线——考官需要看到它们。使用削尖的铅笔以确保准确。比例图要注明比例尺并仔细测量。<br><br>' +
    '<b>注意！</b><br>' +
    '画垂直平分线时，圆规张开宽度必须超过线段的一半。否则弧线不会相交。'
});

add('hhk', 'Y9.11', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Describe how to construct the perpendicular bisector of a line segment AB of length $8$ cm.<br><br>' +
    '<b>Solution:</b><br>' +
    '1. Set the compass to a radius greater than $4$ cm (more than half of AB).<br>' +
    '2. Place the compass point at A and draw arcs above and below the line.<br>' +
    '3. Without changing the compass width, place it at B and draw arcs to cross the first pair.<br>' +
    '4. Join the two intersection points with a straight line.<br>' +
    'This line is the perpendicular bisector of AB.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A map uses a scale of $1 : 25\\,000$. Two towns are $6$ cm apart on the map. Find the actual distance in kilometres. A park has an actual area of $2$ km$^2$. Find its area on the map in cm$^2$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Distance: $6 \\times 25\\,000 = 150\\,000$ cm $= 1.5$ km.<br>' +
    'Area: scale factor for area $= 25\\,000^2 = 625\\,000\\,000$.<br>' +
    '$2$ km$^2$ $= 2 \\times 10^{10}$ cm$^2$.<br>' +
    'Map area $= \\frac{2 \\times 10^{10}}{625\\,000\\,000} = 32$ cm$^2$.<br><br>' +
    '<b>Exam Tip:</b> For scale drawing areas, square the scale factor. For volumes, cube the scale factor.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '描述如何作长 $8$ cm 的线段 AB 的垂直平分线。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 圆规张开半径大于 $4$ cm（超过 AB 的一半）。<br>' +
    '2. 圆规尖放在 A 点，在线段上下各画一段弧。<br>' +
    '3. 不改变圆规宽度，尖放在 B 点，画弧与前两段弧相交。<br>' +
    '4. 用直线连接两个交点。<br>' +
    '该直线即为 AB 的垂直平分线。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '地图比例尺为 $1 : 25\\,000$。地图上两镇相距 $6$ cm，求实际距离（千米）。公园实际面积 $2$ km$^2$，求地图上的面积（cm$^2$）。<br><br>' +
    '<b>解答：</b><br>' +
    '距离：$6 \\times 25\\,000 = 150\\,000$ cm $= 1.5$ km。<br>' +
    '面积：面积比例因子 $= 25\\,000^2 = 625\\,000\\,000$。<br>' +
    '$2$ km$^2$ $= 2 \\times 10^{10}$ cm$^2$。<br>' +
    '地图面积 $= \\frac{2 \\times 10^{10}}{625\\,000\\,000} = 32$ cm$^2$。<br><br>' +
    '<b>考试技巧：</b>比例图中求面积要将比例因子平方，求体积要立方。'
});

add('hhk', 'Y9.12', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Congruent</b> shapes are identical — same shape and same size. All corresponding sides and angles are equal.<br>' +
    '• <b>Similar</b> shapes have the same shape but different sizes. All corresponding angles are equal and corresponding sides are in the same ratio.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Conditions for congruent triangles</b>:<br>' +
    '  - <b>SSS</b>: three sides are equal.<br>' +
    '  - <b>SAS</b>: two sides and the included angle are equal.<br>' +
    '  - <b>ASA</b> (or AAS): two angles and a corresponding side are equal.<br>' +
    '  - <b>RHS</b>: right angle, hypotenuse, and one other side are equal.<br>' +
    '• <b>Proving congruence</b>: identify matching sides/angles in the diagram, state the condition, and conclude.<br>' +
    '• <b>Scale factor</b> of similar shapes: $k = \\frac{\\text{new length}}{\\text{original length}}$.<br>' +
    '• If the linear scale factor is $k$, then:<br>' +
    '  - <b>Area ratio</b> $= k^2$.<br>' +
    '  - <b>Volume ratio</b> $= k^3$.<br>' +
    '• To find a missing side in similar shapes, set up a ratio equation.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When proving congruence, always clearly state which sides/angles you are comparing and the congruence condition. Write the conclusion: "Therefore triangle ABC is congruent to triangle DEF (SAS)."<br><br>' +
    '<b>Watch Out!</b><br>' +
    'For SAS, the angle must be <i>between</i> the two known sides (the included angle). Two sides and a non-included angle (SSA) is NOT sufficient for congruence.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>全等</b>图形完全相同——形状和大小都相同。对应边和对应角都相等。<br>' +
    '• <b>相似</b>图形形状相同但大小不同。对应角相等，对应边成比例。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>三角形全等条件</b>：<br>' +
    '  - <b>SSS</b>：三边相等。<br>' +
    '  - <b>SAS</b>：两边及其夹角相等。<br>' +
    '  - <b>ASA</b>（或 AAS）：两角及对应边相等。<br>' +
    '  - <b>RHS</b>：直角、斜边和另一条边相等。<br>' +
    '• <b>证明全等</b>：在图中找出对应的边和角，说明条件，得出结论。<br>' +
    '• 相似图形的<b>比例因子</b>：$k = \\frac{\\text{新长度}}{\\text{原长度}}$。<br>' +
    '• 若线性比例因子为 $k$，则：<br>' +
    '  - <b>面积比</b> $= k^2$。<br>' +
    '  - <b>体积比</b> $= k^3$。<br>' +
    '• 求相似图形的缺失边：列比例方程。<br><br>' +
    '<b>考试技巧</b><br>' +
    '证明全等时，必须明确说明比较的是哪些边和角，指出全等条件，写出结论："因此三角形 ABC 全等于三角形 DEF（SAS）。"<br><br>' +
    '<b>注意！</b><br>' +
    'SAS 条件中，角必须是两条已知边的<i>夹角</i>。两边和非夹角（SSA）不能证明全等。'
});

add('hhk', 'Y9.12', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Triangles PQR and XYZ have: $PQ = XY = 7$ cm, $QR = YZ = 10$ cm, $\\angle PQR = \\angle XYZ = 55°$. Prove that the triangles are congruent.<br><br>' +
    '<b>Solution:</b><br>' +
    '$PQ = XY = 7$ cm (given)<br>' +
    '$QR = YZ = 10$ cm (given)<br>' +
    '$\\angle PQR = \\angle XYZ = 55°$ (given, included angle)<br>' +
    'Therefore $\\triangle PQR \\cong \\triangle XYZ$ (SAS).<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Two similar cylinders have heights $6$ cm and $15$ cm. The smaller cylinder has a surface area of $80$ cm$^2$ and a volume of $72$ cm$^3$. Find the surface area and volume of the larger cylinder.<br><br>' +
    '<b>Solution:</b><br>' +
    'Linear scale factor: $k = \\frac{15}{6} = 2.5$<br>' +
    'Area scale factor: $k^2 = 2.5^2 = 6.25$<br>' +
    'Surface area of larger $= 80 \\times 6.25 = 500$ cm$^2$<br>' +
    'Volume scale factor: $k^3 = 2.5^3 = 15.625$<br>' +
    'Volume of larger $= 72 \\times 15.625 = 1125$ cm$^3$<br><br>' +
    '<b>Exam Tip:</b> Always find the linear scale factor first. Then square it for areas and cube it for volumes. Never mix up area and volume scale factors.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '三角形 PQR 和 XYZ 满足：$PQ = XY = 7$ cm，$QR = YZ = 10$ cm，$\\angle PQR = \\angle XYZ = 55°$。证明两个三角形全等。<br><br>' +
    '<b>解答：</b><br>' +
    '$PQ = XY = 7$ cm（已知）<br>' +
    '$QR = YZ = 10$ cm（已知）<br>' +
    '$\\angle PQR = \\angle XYZ = 55°$（已知，夹角）<br>' +
    '因此 $\\triangle PQR \\cong \\triangle XYZ$（SAS）。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '两个相似的圆柱体高分别为 $6$ cm 和 $15$ cm。较小的圆柱体表面积 $80$ cm$^2$，体积 $72$ cm$^3$，求较大圆柱体的表面积和体积。<br><br>' +
    '<b>解答：</b><br>' +
    '线性比例因子：$k = \\frac{15}{6} = 2.5$<br>' +
    '面积比例因子：$k^2 = 2.5^2 = 6.25$<br>' +
    '大圆柱体表面积 $= 80 \\times 6.25 = 500$ cm$^2$<br>' +
    '体积比例因子：$k^3 = 2.5^3 = 15.625$<br>' +
    '大圆柱体体积 $= 72 \\times 15.625 = 1125$ cm$^3$<br><br>' +
    '<b>考试技巧：</b>先求线性比例因子，面积用平方，体积用立方。不要混淆面积和体积的比例因子。'
});


/* ══════════════════════════════════════════════════
   HHK Y10
   ══════════════════════════════════════════════════ */

add('hhk', 'Y10.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>rational number</b> can be written as $\\frac{p}{q}$ where $p, q$ are integers and $q \\neq 0$. All terminating and recurring decimals are rational.<br>' +
    '• An <b>irrational number</b> cannot be written as a fraction, e.g. $\\pi$, $\\sqrt{2}$, $\\sqrt{5}$.<br>' +
    '• <b>Real numbers</b> = all rational + irrational numbers on the number line.<br>' +
    '• To <b>estimate</b> an irrational number, find two consecutive integers it lies between: $2^2 = 4$ and $3^2 = 9$, so $2 < \\sqrt{5} < 3$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Standard form</b>: $a \\times 10^n$ where $1 \\leq a < 10$. E.g. $45\\,000 = 4.5 \\times 10^4$, $0.0032 = 3.2 \\times 10^{-3}$.<br>' +
    '• <b>Surds</b>: $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$, $\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$.<br>' +
    '• <b>Simplify surds</b>: $\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$.<br>' +
    '• <b>Expand brackets</b>: $(2 + \\sqrt{3})(4 - \\sqrt{3}) = 8 - 2\\sqrt{3} + 4\\sqrt{3} - 3 = 5 + 2\\sqrt{3}$.<br>' +
    '• <b>Conjugate surds</b>: $a + \\sqrt{b}$ and $a - \\sqrt{b}$ are conjugates; their product is $a^2 - b$ (difference of two squares).<br>' +
    '• <b>Rationalise the denominator</b>: multiply top and bottom by the conjugate. E.g. $\\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$; $\\frac{2}{3 + \\sqrt{5}} = \\frac{2(3 - \\sqrt{5})}{9 - 5} = \\frac{3 - \\sqrt{5}}{2}$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always simplify surds as far as possible. Look for the largest square factor inside the root. When rationalising, multiply by the conjugate, not just the surd.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$. E.g. $\\sqrt{9 + 16} = \\sqrt{25} = 5$, but $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>有理数</b>可以写成 $\\frac{p}{q}$（$p, q$ 为整数，$q \\neq 0$）。所有有限小数和循环小数都是有理数。<br>' +
    '• <b>无理数</b>不能写成分数，如 $\\pi$, $\\sqrt{2}$, $\\sqrt{5}$。<br>' +
    '• <b>实数</b> = 有理数 + 无理数，覆盖数轴上所有点。<br>' +
    '• <b>估算</b>无理数：找出它所在的两个连续整数之间。$2^2 = 4$，$3^2 = 9$，所以 $2 < \\sqrt{5} < 3$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>标准式</b>：$a \\times 10^n$，其中 $1 \\leq a < 10$。例如 $45\\,000 = 4.5 \\times 10^4$，$0.0032 = 3.2 \\times 10^{-3}$。<br>' +
    '• <b>根式</b>运算：$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$，$\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$。<br>' +
    '• <b>化简根式</b>：$\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$。<br>' +
    '• <b>展开括号</b>：$(2 + \\sqrt{3})(4 - \\sqrt{3}) = 8 - 2\\sqrt{3} + 4\\sqrt{3} - 3 = 5 + 2\\sqrt{3}$。<br>' +
    '• <b>共轭根式</b>：$a + \\sqrt{b}$ 与 $a - \\sqrt{b}$ 互为共轭；乘积为 $a^2 - b$（平方差）。<br>' +
    '• <b>有理化分母</b>：上下同乘共轭。如 $\\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$；$\\frac{2}{3 + \\sqrt{5}} = \\frac{2(3 - \\sqrt{5})}{9 - 5} = \\frac{3 - \\sqrt{5}}{2}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '根式一定要化到最简，找根号内最大的完全平方因子。有理化分母时，乘以共轭式而非单纯的根号。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$。例如 $\\sqrt{9 + 16} = \\sqrt{25} = 5$，但 $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$。'
});

add('hhk', 'Y10.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Simplify $\\frac{\\sqrt{72}}{\\sqrt{2}}$ and express your answer in its simplest surd form.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\frac{\\sqrt{72}}{\\sqrt{2}} = \\sqrt{\\frac{72}{2}} = \\sqrt{36} = 6$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Rationalise the denominator and simplify: $\\frac{6}{2 + \\sqrt{3}}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply numerator and denominator by the conjugate $(2 - \\sqrt{3})$:<br>' +
    '$\\frac{6}{2 + \\sqrt{3}} \\times \\frac{2 - \\sqrt{3}}{2 - \\sqrt{3}} = \\frac{6(2 - \\sqrt{3})}{(2)^2 - (\\sqrt{3})^2}$<br>' +
    '$= \\frac{12 - 6\\sqrt{3}}{4 - 3} = \\frac{12 - 6\\sqrt{3}}{1} = 12 - 6\\sqrt{3}$<br><br>' +
    '<b>Exam Tip:</b> Always multiply by the conjugate to rationalise. The denominator becomes the difference of two squares, eliminating the surd.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '化简 $\\frac{\\sqrt{72}}{\\sqrt{2}}$，用最简根式表示。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\frac{\\sqrt{72}}{\\sqrt{2}} = \\sqrt{\\frac{72}{2}} = \\sqrt{36} = 6$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '有理化分母并化简：$\\frac{6}{2 + \\sqrt{3}}$。<br><br>' +
    '<b>解答：</b><br>' +
    '上下同乘共轭 $(2 - \\sqrt{3})$：<br>' +
    '$\\frac{6}{2 + \\sqrt{3}} \\times \\frac{2 - \\sqrt{3}}{2 - \\sqrt{3}} = \\frac{6(2 - \\sqrt{3})}{4 - 3}$<br>' +
    '$= \\frac{12 - 6\\sqrt{3}}{1} = 12 - 6\\sqrt{3}$<br><br>' +
    '<b>考试技巧：</b>有理化分母时，始终乘以共轭式。分母变为平方差公式，根号被消除。'
});

add('hhk', 'Y10.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• An <b>algebraic fraction</b> has variables in the numerator and/or denominator, e.g. $\\frac{2x}{x+1}$.<br>' +
    '• To <b>simplify</b>, factorise numerator and denominator, then cancel common factors.<br>' +
    '• <b>Rearranging formulae</b>: when the subject appears <i>twice</i>, collect all terms containing the subject on one side, then factorise. E.g. make $x$ the subject of $y = \\frac{x+1}{x-2}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Simplify</b>: $\\frac{x^2 - 4}{x + 2} = \\frac{(x+2)(x-2)}{x+2} = x - 2$<br>' +
    '• <b>Add/Subtract</b>: find a common denominator: $\\frac{2}{x+1} + \\frac{3}{x-1} = \\frac{2(x-1) + 3(x+1)}{(x+1)(x-1)} = \\frac{5x+1}{x^2-1}$<br>' +
    '• <b>Multiply</b>: factorise first, then cancel: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$<br>' +
    '• <b>Divide</b>: multiply by the reciprocal: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$<br>' +
    '• <b>Subject appears twice</b>: $y = \\frac{3x+1}{x-2}$ $\\Rightarrow$ $y(x-2) = 3x+1$ $\\Rightarrow$ $xy - 2y = 3x + 1$ $\\Rightarrow$ $xy - 3x = 2y + 1$ $\\Rightarrow$ $x(y-3) = 2y+1$ $\\Rightarrow$ $x = \\frac{2y+1}{y-3}$<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always factorise before cancelling. Never cancel terms across a + or $-$ sign, only factors.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\frac{x+3}{x+5} \\neq \\frac{3}{5}$. You cannot cancel the $x$ because $x$ is a term, not a factor.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>代数分数</b>在分子和/或分母中含有变量，如 $\\frac{2x}{x+1}$。<br>' +
    '• <b>化简</b>：先分解因式，再约去公因子。<br>' +
    '• <b>变换公式</b>：当主语出现<i>两次</i>时，把含主语的项集中到一侧，提取公因子。如将 $y = \\frac{x+1}{x-2}$ 中 $x$ 作为主语。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>化简</b>：$\\frac{x^2 - 4}{x + 2} = \\frac{(x+2)(x-2)}{x+2} = x - 2$<br>' +
    '• <b>加减</b>：找公分母：$\\frac{2}{x+1} + \\frac{3}{x-1} = \\frac{2(x-1) + 3(x+1)}{(x+1)(x-1)} = \\frac{5x+1}{x^2-1}$<br>' +
    '• <b>乘法</b>：先因式分解再约分：$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$<br>' +
    '• <b>除法</b>：乘以倒数：$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$<br>' +
    '• <b>主语出现两次</b>：$y = \\frac{3x+1}{x-2}$ $\\Rightarrow$ $y(x-2) = 3x+1$ $\\Rightarrow$ $xy - 3x = 2y + 1$ $\\Rightarrow$ $x(y-3) = 2y+1$ $\\Rightarrow$ $x = \\frac{2y+1}{y-3}$<br><br>' +
    '<b>考试技巧</b><br>' +
    '约分之前一定先因式分解。不能在加号或减号之间约分，只能约因子。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\frac{x+3}{x+5} \\neq \\frac{3}{5}$。不能约去 $x$，因为 $x$ 是项而不是因子。'
});

add('hhk', 'Y10.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Simplify $\\frac{x^2 - 9}{x^2 + 5x + 6}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Factorise numerator: $x^2 - 9 = (x+3)(x-3)$<br>' +
    'Factorise denominator: $x^2 + 5x + 6 = (x+2)(x+3)$<br>' +
    '$\\frac{(x+3)(x-3)}{(x+2)(x+3)} = \\frac{x-3}{x+2}$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Make $x$ the subject of $y = \\frac{5x + 2}{x - 3}$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply both sides by $(x - 3)$:<br>' +
    '$y(x - 3) = 5x + 2$<br>' +
    '$xy - 3y = 5x + 2$<br>' +
    'Collect $x$ terms: $xy - 5x = 3y + 2$<br>' +
    'Factorise: $x(y - 5) = 3y + 2$<br>' +
    '$x = \\frac{3y + 2}{y - 5}$<br><br>' +
    '<b>Exam Tip:</b> When the subject appears on both sides, multiply out, collect, then factorise. This is a common 4-mark question.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '化简 $\\frac{x^2 - 9}{x^2 + 5x + 6}$。<br><br>' +
    '<b>解答：</b><br>' +
    '分子因式分解：$x^2 - 9 = (x+3)(x-3)$<br>' +
    '分母因式分解：$x^2 + 5x + 6 = (x+2)(x+3)$<br>' +
    '$\\frac{(x+3)(x-3)}{(x+2)(x+3)} = \\frac{x-3}{x+2}$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '将 $y = \\frac{5x + 2}{x - 3}$ 中 $x$ 作为主语。<br><br>' +
    '<b>解答：</b><br>' +
    '两边同乘 $(x - 3)$：<br>' +
    '$y(x - 3) = 5x + 2$<br>' +
    '$xy - 3y = 5x + 2$<br>' +
    '含 $x$ 的项集中：$xy - 5x = 3y + 2$<br>' +
    '提取公因子：$x(y - 5) = 3y + 2$<br>' +
    '$x = \\frac{3y + 2}{y - 5}$<br><br>' +
    '<b>考试技巧：</b>当主语在等式两边都出现时：展开→集中→提取。这是常见的 4 分题。'
});

add('hhk', 'Y10.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>quadratic equation</b> has the form $ax^2 + bx + c = 0$ where $a \\neq 0$.<br>' +
    '• <b>Factorising</b>: find two numbers that multiply to give $ac$ and add to give $b$.<br>' +
    '• For $x^2 + bx + c = 0$: $(x + p)(x + q) = 0$ where $pq = c$ and $p + q = b$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Difference of two squares</b>: $a^2 - b^2 = (a + b)(a - b)$. E.g. $x^2 - 25 = (x+5)(x-5)$.<br>' +
    '• <b>Factorising when $a > 1$</b>: $6x^2 + x - 2 = (2x - 1)(3x + 2)$.<br>' +
    '• <b>Completing the square</b>: $x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\frac{b^2}{4} + c$.<br>' +
    '  This gives the turning point at $\\left(-\\frac{b}{2},\\; c - \\frac{b^2}{4}\\right)$.<br>' +
    '• <b>Quadratic formula</b>: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.<br>' +
    '• <b>Discriminant</b> $\\Delta = b^2 - 4ac$: if $\\Delta > 0$ two real roots; $\\Delta = 0$ one repeated root; $\\Delta < 0$ no real roots.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Try factorising first as it is quicker. Use the quadratic formula when factorising is not straightforward. If the question says "give your answer to 2 d.p.", it usually requires the formula.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do not forget to rearrange to $= 0$ before factorising or applying the formula. If $ab = 0$ then $a = 0$ or $b = 0$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>二次方程</b>的形式为 $ax^2 + bx + c = 0$，其中 $a \\neq 0$。<br>' +
    '• <b>因式分解</b>：找到两个数，乘积为 $ac$，和为 $b$。<br>' +
    '• 对于 $x^2 + bx + c = 0$：$(x + p)(x + q) = 0$，其中 $pq = c$，$p + q = b$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>平方差</b>：$a^2 - b^2 = (a + b)(a - b)$。如 $x^2 - 25 = (x+5)(x-5)$。<br>' +
    '• <b>$a > 1$ 时的因式分解</b>：$6x^2 + x - 2 = (2x - 1)(3x + 2)$。<br>' +
    '• <b>配方法</b>：$x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\frac{b^2}{4} + c$。<br>' +
    '  由此得到顶点为 $\\left(-\\frac{b}{2},\\; c - \\frac{b^2}{4}\\right)$。<br>' +
    '• <b>求根公式</b>：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$。<br>' +
    '• <b>判别式</b> $\\Delta = b^2 - 4ac$：$\\Delta > 0$ 两个实根；$\\Delta = 0$ 一个重根；$\\Delta < 0$ 无实根。<br><br>' +
    '<b>考试技巧</b><br>' +
    '先尝试因式分解，速度更快。无法因式分解时用求根公式。题目要求"保留 2 位小数"通常需要用公式。<br><br>' +
    '<b>注意！</b><br>' +
    '因式分解或代入公式前，必须先移项使等式右边 $= 0$。若 $ab = 0$，则 $a = 0$ 或 $b = 0$。'
});

add('hhk', 'Y10.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Solve $x^2 - 5x + 6 = 0$ by factorising.<br><br>' +
    '<b>Solution:</b><br>' +
    'Find two numbers that multiply to $6$ and add to $-5$: $-2$ and $-3$.<br>' +
    '$(x - 2)(x - 3) = 0$<br>' +
    '$x = 2$ or $x = 3$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Solve $2x^2 + 3x - 5 = 0$ using the quadratic formula. Give your answers to 2 d.p.<br><br>' +
    '<b>Solution:</b><br>' +
    '$a = 2$, $b = 3$, $c = -5$<br>' +
    '$x = \\frac{-3 \\pm \\sqrt{3^2 - 4(2)(-5)}}{2(2)} = \\frac{-3 \\pm \\sqrt{9 + 40}}{4} = \\frac{-3 \\pm \\sqrt{49}}{4} = \\frac{-3 \\pm 7}{4}$<br>' +
    '$x = \\frac{-3 + 7}{4} = 1$ or $x = \\frac{-3 - 7}{4} = -2.5$<br><br>' +
    '<b>Exam Tip:</b> Write down the values of $a$, $b$, and $c$ before substituting into the formula. This avoids sign errors, especially with negative coefficients.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '用因式分解法解 $x^2 - 5x + 6 = 0$。<br><br>' +
    '<b>解答：</b><br>' +
    '找乘积为 $6$、和为 $-5$ 的两个数：$-2$ 和 $-3$。<br>' +
    '$(x - 2)(x - 3) = 0$<br>' +
    '$x = 2$ 或 $x = 3$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '用求根公式解 $2x^2 + 3x - 5 = 0$，结果保留 2 位小数。<br><br>' +
    '<b>解答：</b><br>' +
    '$a = 2$，$b = 3$，$c = -5$<br>' +
    '$x = \\frac{-3 \\pm \\sqrt{9 + 40}}{4} = \\frac{-3 \\pm \\sqrt{49}}{4} = \\frac{-3 \\pm 7}{4}$<br>' +
    '$x = \\frac{-3 + 7}{4} = 1$ 或 $x = \\frac{-3 - 7}{4} = -2.5$<br><br>' +
    '<b>考试技巧：</b>代入公式前先写出 $a$、$b$、$c$ 的值，避免符号出错，尤其是系数为负时。'
});

add('hhk', 'Y10.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Simultaneous equations</b> are two or more equations that share the same unknowns.<br>' +
    '• <b>Elimination method</b>: add or subtract equations to eliminate one variable.<br>' +
    '• <b>Substitution method</b>: rearrange one equation for a variable and substitute into the other.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Three unknowns</b>: use substitution to reduce from 3 equations to 2, then from 2 to 1. Solve systematically.<br>' +
    '  Example system: $x + y + z = 6$, $2x - y + z = 3$, $x + 2y - z = 5$.<br>' +
    '• <b>One linear + one non-linear</b>: rearrange the linear equation for one variable, substitute into the quadratic.<br>' +
    '  E.g. $y = x + 1$ and $x^2 + y^2 = 13$. Substitute: $x^2 + (x+1)^2 = 13$.<br>' +
    '  Expand and solve the resulting quadratic.<br>' +
    '• After finding $x$, substitute back to find corresponding $y$ values.<br>' +
    '• Present answers as <b>pairs</b>: $(x_1, y_1)$ and $(x_2, y_2)$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For linear + quadratic pairs, always rearrange the <i>linear</i> equation first. This is simpler and avoids introducing square roots early.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Each $x$ value has a corresponding $y$ value. Do not mix them up. Write your answer as coordinate pairs.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>联立方程组</b>是含有相同未知数的两个或多个方程。<br>' +
    '• <b>消元法</b>：通过加减方程消去一个未知数。<br>' +
    '• <b>代入法</b>：将一个方程变形后代入另一个方程。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>三个未知数</b>：用代入法从 3 个方程化简为 2 个，再从 2 个化简为 1 个，逐步求解。<br>' +
    '  例：$x + y + z = 6$，$2x - y + z = 3$，$x + 2y - z = 5$。<br>' +
    '• <b>一个线性 + 一个非线性</b>：将线性方程变形，代入二次方程。<br>' +
    '  如 $y = x + 1$ 和 $x^2 + y^2 = 13$，代入得 $x^2 + (x+1)^2 = 13$。<br>' +
    '  展开后解二次方程。<br>' +
    '• 求出 $x$ 后，代回求对应的 $y$ 值。<br>' +
    '• 答案写成<b>坐标对</b>：$(x_1, y_1)$ 和 $(x_2, y_2)$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '线性 + 二次联立时，先变形<i>线性</i>方程。这样更简单，避免过早引入根号。<br><br>' +
    '<b>注意！</b><br>' +
    '每个 $x$ 值都有对应的 $y$ 值，不要弄混。答案要写成坐标对。'
});

add('hhk', 'Y10.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'Solve the simultaneous equations: $y = x + 1$ and $x^2 + y^2 = 13$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Substitute the linear equation into the quadratic:<br>' +
    '$x^2 + (x + 1)^2 = 13$<br>' +
    '$x^2 + x^2 + 2x + 1 = 13$<br>' +
    '$2x^2 + 2x - 12 = 0$<br>' +
    '$x^2 + x - 6 = 0$<br>' +
    '$(x + 3)(x - 2) = 0$<br>' +
    '$x = -3$ or $x = 2$<br>' +
    'When $x = -3$: $y = -3 + 1 = -2$<br>' +
    'When $x = 2$: $y = 2 + 1 = 3$<br>' +
    'Solutions: $(-3, -2)$ and $(2, 3)$<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    'Solve: $x + y + z = 10$, $2x - y + z = 7$, $x + 3y - z = 12$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Add equations (1) and (3): $2x + 4y = 22 \\Rightarrow x + 2y = 11$ ... (A)<br>' +
    'Add equations (2) and (3): $3x + 2y = 19$ ... (B)<br>' +
    'From (A): $x = 11 - 2y$. Substitute into (B): $3(11 - 2y) + 2y = 19$<br>' +
    '$33 - 6y + 2y = 19$, so $-4y = -14$, $y = 3.5$<br>' +
    '$x = 11 - 7 = 4$<br>' +
    'From (1): $z = 10 - 4 - 3.5 = 2.5$<br>' +
    'Solution: $x = 4$, $y = 3.5$, $z = 2.5$<br><br>' +
    '<b>Exam Tip:</b> For 3-unknown systems, eliminate the same variable from two different pairs of equations to get two equations in two unknowns.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '解联立方程组：$y = x + 1$，$x^2 + y^2 = 13$<br><br>' +
    '<b>解答：</b><br>' +
    '将线性方程代入二次方程：<br>' +
    '$x^2 + (x+1)^2 = 13$<br>' +
    '$x^2 + x^2 + 2x + 1 = 13$<br>' +
    '$2x^2 + 2x - 12 = 0$<br>' +
    '$x^2 + x - 6 = 0$<br>' +
    '$(x + 3)(x - 2) = 0$<br>' +
    '$x = -3$ 或 $x = 2$<br>' +
    '当 $x = -3$ 时：$y = -3 + 1 = -2$<br>' +
    '当 $x = 2$ 时：$y = 2 + 1 = 3$<br>' +
    '解：$(-3, -2)$ 和 $(2, 3)$<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '解：$x + y + z = 10$，$2x - y + z = 7$，$x + 3y - z = 12$。<br><br>' +
    '<b>解答：</b><br>' +
    '(1)+(3)：$2x + 4y = 22 \\Rightarrow x + 2y = 11$ ... (A)<br>' +
    '(2)+(3)：$3x + 2y = 19$ ... (B)<br>' +
    '由 (A)：$x = 11 - 2y$，代入 (B)：$3(11 - 2y) + 2y = 19$<br>' +
    '$33 - 4y = 19$，$y = 3.5$<br>' +
    '$x = 11 - 7 = 4$，$z = 10 - 4 - 3.5 = 2.5$<br>' +
    '解：$x = 4$，$y = 3.5$，$z = 2.5$<br><br>' +
    '<b>考试技巧：</b>三元方程组要从两对方程中消去同一个变量，得到两个二元方程再求解。'
});

add('hhk', 'Y10.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Direct proportion</b>: $y = kx$ — the graph is a straight line through the origin.<br>' +
    '• <b>Inverse proportion</b>: $y = \\frac{k}{x}$ — as $x$ increases, $y$ decreases. The product $xy = k$ is constant.<br>' +
    '• A <b>function</b> maps each input to exactly one output.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Inverse proportion</b> $y = \\frac{k}{x}$: the graph is a <b>rectangular hyperbola</b> with asymptotes along the $x$-axis and $y$-axis.<br>' +
    '  If $k > 0$, the curve lies in quadrants 1 and 3. If $k < 0$, it lies in quadrants 2 and 4.<br>' +
    '• Find $k$ from a given point: if $(3, 4)$ lies on $y = \\frac{k}{x}$, then $k = 3 \\times 4 = 12$.<br>' +
    '• <b>Reciprocal graph</b> $y = \\frac{a}{x}$: never crosses the axes (asymptotes).<br>' +
    '• <b>Quadratic graph</b> $y = ax^2 + bx + c$: U-shape if $a > 0$, inverted U if $a < 0$. Vertex by completing the square.<br>' +
    '• <b>Cubic graph</b> $y = ax^3$: S-shaped curve through the origin.<br>' +
    '• <b>Exponential graph</b> $y = a^x$ (where $a > 0$, $a \\neq 1$): passes through $(0, 1)$, always above the $x$-axis. Growth if $a > 1$, decay if $0 < a < 1$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'To sketch a graph, find key features: intercepts, asymptotes, turning points. Use a table of values to plot at least 5 points for curves.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$y = \\frac{k}{x}$ is undefined at $x = 0$. The curve gets very close to the axes but never touches them.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>正比例</b>：$y = kx$ — 图像是过原点的直线。<br>' +
    '• <b>反比例</b>：$y = \\frac{k}{x}$ — $x$ 增大时 $y$ 减小，乘积 $xy = k$ 为常数。<br>' +
    '• <b>函数</b>将每个输入映射到唯一的输出。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>反比例</b> $y = \\frac{k}{x}$：图像是<b>双曲线</b>，渐近线沿 $x$ 轴和 $y$ 轴。<br>' +
    '  若 $k > 0$，曲线在第一、三象限；若 $k < 0$，在第二、四象限。<br>' +
    '• 已知一点求 $k$：若 $(3, 4)$ 在 $y = \\frac{k}{x}$ 上，则 $k = 3 \\times 4 = 12$。<br>' +
    '• <b>倒数函数图</b> $y = \\frac{a}{x}$：不与坐标轴相交（渐近线）。<br>' +
    '• <b>二次函数图</b> $y = ax^2 + bx + c$：$a > 0$ 开口向上，$a < 0$ 开口向下。用配方法求顶点。<br>' +
    '• <b>三次函数图</b> $y = ax^3$：S 形曲线过原点。<br>' +
    '• <b>指数函数图</b> $y = a^x$（$a > 0$，$a \\neq 1$）：过 $(0, 1)$，始终在 $x$ 轴上方。$a > 1$ 增长，$0 < a < 1$ 衰减。<br><br>' +
    '<b>考试技巧</b><br>' +
    '画图时先找关键特征：截距、渐近线、转折点。曲线至少取 5 个点列表描点。<br><br>' +
    '<b>注意！</b><br>' +
    '$y = \\frac{k}{x}$ 在 $x = 0$ 处无定义。曲线无限接近坐标轴但永不相交。'
});

add('hhk', 'Y10.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    '$y$ is inversely proportional to $x$. When $x = 4$, $y = 6$. Find $y$ when $x = 8$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$y = \\frac{k}{x}$<br>' +
    'When $x = 4$, $y = 6$: $6 = \\frac{k}{4}$, so $k = 24$.<br>' +
    'When $x = 8$: $y = \\frac{24}{8} = 3$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Sketch the graph of $y = 2^x$ for $-2 \\leq x \\leq 3$. State the $y$-intercept and describe the behaviour as $x \\to -\\infty$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Table of values:<br>' +
    '$x = -2$: $y = 2^{-2} = \\frac{1}{4} = 0.25$<br>' +
    '$x = -1$: $y = 2^{-1} = 0.5$<br>' +
    '$x = 0$: $y = 2^0 = 1$<br>' +
    '$x = 1$: $y = 2$<br>' +
    '$x = 2$: $y = 4$<br>' +
    '$x = 3$: $y = 8$<br>' +
    'The $y$-intercept is $(0, 1)$.<br>' +
    'As $x \\to -\\infty$, $y \\to 0$ (the $x$-axis is an asymptote).<br><br>' +
    '<b>Exam Tip:</b> For exponential graphs, always note that the curve passes through $(0, 1)$ and never touches the $x$-axis.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '$y$ 与 $x$ 成反比。当 $x = 4$ 时，$y = 6$。求 $x = 8$ 时 $y$ 的值。<br><br>' +
    '<b>解答：</b><br>' +
    '$y = \\frac{k}{x}$<br>' +
    '当 $x = 4$，$y = 6$：$6 = \\frac{k}{4}$，所以 $k = 24$。<br>' +
    '当 $x = 8$：$y = \\frac{24}{8} = 3$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '画出 $y = 2^x$（$-2 \\leq x \\leq 3$）的图像。写出 $y$ 轴截距，描述 $x \\to -\\infty$ 时的趋势。<br><br>' +
    '<b>解答：</b><br>' +
    '数值表：<br>' +
    '$x = -2$：$y = 0.25$；$x = -1$：$y = 0.5$；$x = 0$：$y = 1$<br>' +
    '$x = 1$：$y = 2$；$x = 2$：$y = 4$；$x = 3$：$y = 8$<br>' +
    '$y$ 轴截距为 $(0, 1)$。<br>' +
    '当 $x \\to -\\infty$ 时，$y \\to 0$（$x$ 轴是渐近线）。<br><br>' +
    '<b>考试技巧：</b>指数函数图像始终过 $(0, 1)$，永不与 $x$ 轴相交。'
});

add('hhk', 'Y10.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Similar triangles</b> have the same shape but different sizes. Corresponding angles are equal, corresponding sides are in the same ratio.<br>' +
    '• <b>Pythagoras\' Theorem</b>: $a^2 + b^2 = c^2$ where $c$ is the hypotenuse.<br>' +
    '• <b>SOH-CAH-TOA</b>: $\\sin\\theta = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$, $\\cos\\theta = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$, $\\tan\\theta = \\frac{\\text{Opposite}}{\\text{Adjacent}}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Use <b>similarity ratios</b> to find missing sides: if triangles are similar with scale factor $k$, then corresponding sides differ by factor $k$.<br>' +
    '• <b>Exact trigonometric values</b>:<br>' +
    '  $\\sin 30° = \\frac{1}{2}$, $\\cos 30° = \\frac{\\sqrt{3}}{2}$, $\\tan 30° = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$<br>' +
    '  $\\sin 45° = \\cos 45° = \\frac{\\sqrt{2}}{2}$, $\\tan 45° = 1$<br>' +
    '  $\\sin 60° = \\frac{\\sqrt{3}}{2}$, $\\cos 60° = \\frac{1}{2}$, $\\tan 60° = \\sqrt{3}$<br>' +
    '  $\\sin 0° = 0$, $\\cos 0° = 1$, $\\sin 90° = 1$, $\\cos 90° = 0$<br>' +
    '• <b>Solve trig equations</b>: use inverse functions ($\\sin^{-1}$, $\\cos^{-1}$, $\\tan^{-1}$).<br>' +
    '• <b>Bearings</b>: measured clockwise from North, always given as three digits (e.g. $045°$).<br>' +
    '• <b>Angles of elevation and depression</b>: measured from the horizontal.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Label the sides O, A, H relative to the angle you are working with. Choose the correct ratio based on which two sides are involved.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Make sure your calculator is in degree mode. For exact values, leave answers as surds, e.g. $\\frac{\\sqrt{3}}{2}$ not $0.866...$',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>相似三角形</b>形状相同但大小不同，对应角相等，对应边成比例。<br>' +
    '• <b>勾股定理</b>：$a^2 + b^2 = c^2$，其中 $c$ 为斜边。<br>' +
    '• <b>SOH-CAH-TOA</b>：$\\sin\\theta = \\frac{\\text{对边}}{\\text{斜边}}$，$\\cos\\theta = \\frac{\\text{邻边}}{\\text{斜边}}$，$\\tan\\theta = \\frac{\\text{对边}}{\\text{邻边}}$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 用<b>相似比</b>求缺失边：若相似比为 $k$，则对应边相差 $k$ 倍。<br>' +
    '• <b>特殊角的三角函数精确值</b>：<br>' +
    '  $\\sin 30° = \\frac{1}{2}$，$\\cos 30° = \\frac{\\sqrt{3}}{2}$，$\\tan 30° = \\frac{\\sqrt{3}}{3}$<br>' +
    '  $\\sin 45° = \\cos 45° = \\frac{\\sqrt{2}}{2}$，$\\tan 45° = 1$<br>' +
    '  $\\sin 60° = \\frac{\\sqrt{3}}{2}$，$\\cos 60° = \\frac{1}{2}$，$\\tan 60° = \\sqrt{3}$<br>' +
    '  $\\sin 0° = 0$，$\\cos 0° = 1$，$\\sin 90° = 1$，$\\cos 90° = 0$<br>' +
    '• <b>解三角方程</b>：用反三角函数（$\\sin^{-1}$、$\\cos^{-1}$、$\\tan^{-1}$）。<br>' +
    '• <b>方位角</b>：从正北顺时针测量，始终用三位数表示（如 $045°$）。<br>' +
    '• <b>仰角和俯角</b>：从水平线测量。<br><br>' +
    '<b>考试技巧</b><br>' +
    '根据所求角标注三条边为 O（对边）、A（邻边）、H（斜边），根据涉及的两条边选择正确的比率。<br><br>' +
    '<b>注意！</b><br>' +
    '确保计算器在角度模式（DEG）。求精确值时用根式表示，如 $\\frac{\\sqrt{3}}{2}$ 而非 $0.866...$。'
});

add('hhk', 'Y10.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A right-angled triangle has a hypotenuse of 10 cm and an angle of $30°$. Find the length of the side opposite to the $30°$ angle. Give an exact answer.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\sin 30° = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} = \\frac{x}{10}$<br>' +
    '$\\frac{1}{2} = \\frac{x}{10}$<br>' +
    '$x = 5$ cm<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A boat sails 12 km due East, then 9 km due North. Find the bearing of the boat from its starting point. Give your answer to 1 d.p.<br><br>' +
    '<b>Solution:</b><br>' +
    'From the starting point, the boat is 12 km East and 9 km North.<br>' +
    'Bearing is measured clockwise from North: $\\tan \\alpha = \\frac{12}{9}$ where $\\alpha$ is the angle from North.<br>' +
    '$\\alpha = \\tan^{-1}\\left(\\frac{12}{9}\\right) = \\tan^{-1}(1.333...) = 53.1°$<br>' +
    'Bearing = $053.1°$<br><br>' +
    '<b>Exam Tip:</b> Draw a clear diagram with North marked. Bearings are always measured clockwise from North and given as three-figure numbers.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个直角三角形斜边为 10 cm，一个角为 $30°$。求 $30°$ 角的对边长度，给出精确值。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\sin 30° = \\frac{\\text{对边}}{\\text{斜边}} = \\frac{x}{10}$<br>' +
    '$\\frac{1}{2} = \\frac{x}{10}$<br>' +
    '$x = 5$ cm<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '一艘船先向正东航行 12 km，再向正北航行 9 km。求船相对于出发点的方位角，保留 1 位小数。<br><br>' +
    '<b>解答：</b><br>' +
    '从出发点看，船在正东 12 km、正北 9 km 处。<br>' +
    '方位角从正北顺时针测量：$\\tan \\alpha = \\frac{12}{9}$<br>' +
    '$\\alpha = \\tan^{-1}\\left(\\frac{4}{3}\\right) = 53.1°$<br>' +
    '方位角 = $053.1°$<br><br>' +
    '<b>考试技巧：</b>画清晰的图并标注正北方向。方位角始终从正北顺时针测量，用三位数表示。'
});

add('hhk', 'Y10.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Circle vocabulary</b>:<br>' +
    '  <b>Radius</b> (半径) — distance from centre to circumference.<br>' +
    '  <b>Diameter</b> (直径) — a straight line through the centre, $d = 2r$.<br>' +
    '  <b>Circumference</b> (周长) — the perimeter of the circle, $C = \\pi d = 2\\pi r$.<br>' +
    '  <b>Chord</b> (弦) — a line segment joining two points on the circumference.<br>' +
    '  <b>Arc</b> (弧) — a part of the circumference.<br>' +
    '  <b>Sector</b> (扇形) — the region between two radii and an arc.<br>' +
    '  <b>Segment</b> (弓形) — the region between a chord and an arc.<br>' +
    '  <b>Tangent</b> (切线) — a line that touches the circle at exactly one point.<br>' +
    '  <b>Secant</b> (割线) — a line that cuts through the circle at two points.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Area of a circle</b>: $A = \\pi r^2$.<br>' +
    '• <b>Arc length</b>: $l = \\frac{\\theta}{360°} \\times 2\\pi r$.<br>' +
    '• <b>Sector area</b>: $A = \\frac{\\theta}{360°} \\times \\pi r^2$.<br>' +
    '• <b>Circle Theorems</b>:<br>' +
    '  1. The angle at the centre is twice the angle at the circumference.<br>' +
    '  2. Angles in the same segment are equal.<br>' +
    '  3. The angle in a semicircle is $90°$.<br>' +
    '  4. Opposite angles in a cyclic quadrilateral sum to $180°$.<br>' +
    '  5. A tangent to a circle is perpendicular to the radius at the point of contact.<br>' +
    '  6. Two tangents from an external point are equal in length.<br>' +
    '  7. The perpendicular from the centre to a chord bisects the chord.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always state the circle theorem you are using. Questions often say "give a reason" — name the theorem explicitly.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Sector perimeter includes two radii plus the arc length, not just the arc. Do not confuse sector (pie slice) with segment (region between chord and arc).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>圆的词汇</b>：<br>' +
    '  <b>Radius</b>（半径）— 圆心到圆周的距离。<br>' +
    '  <b>Diameter</b>（直径）— 过圆心的线段，$d = 2r$。<br>' +
    '  <b>Circumference</b>（周长）— 圆的周长，$C = \\pi d = 2\\pi r$。<br>' +
    '  <b>Chord</b>（弦）— 连接圆周上两点的线段。<br>' +
    '  <b>Arc</b>（弧）— 圆周的一部分。<br>' +
    '  <b>Sector</b>（扇形）— 两条半径与弧之间的区域。<br>' +
    '  <b>Segment</b>（弓形）— 弦与弧之间的区域。<br>' +
    '  <b>Tangent</b>（切线）— 与圆只有一个交点的直线。<br>' +
    '  <b>Secant</b>（割线）— 与圆有两个交点的直线。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>圆的面积</b>：$A = \\pi r^2$。<br>' +
    '• <b>弧长</b>：$l = \\frac{\\theta}{360°} \\times 2\\pi r$。<br>' +
    '• <b>扇形面积</b>：$A = \\frac{\\theta}{360°} \\times \\pi r^2$。<br>' +
    '• <b>圆的定理</b>：<br>' +
    '  1. 圆心角是同弧圆周角的两倍。<br>' +
    '  2. 同弧上的圆周角相等。<br>' +
    '  3. 半圆上的圆周角为 $90°$。<br>' +
    '  4. 圆内接四边形对角互补（和为 $180°$）。<br>' +
    '  5. 切线与切点处的半径垂直。<br>' +
    '  6. 从外部一点引两条切线，长度相等。<br>' +
    '  7. 圆心到弦的垂线平分该弦。<br><br>' +
    '<b>考试技巧</b><br>' +
    '一定要写出所用的圆的定理名称。题目要求"给出理由"时，必须明确说明定理。<br><br>' +
    '<b>注意！</b><br>' +
    '扇形周长包括两条半径加弧长，不只是弧。不要混淆扇形（饼形）和弓形（弦与弧之间的区域）。'
});

add('hhk', 'Y10.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A sector of a circle has radius 8 cm and angle $45°$. Find the arc length and sector area. Leave your answers in terms of $\\pi$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Arc length $= \\frac{45}{360} \\times 2\\pi(8) = \\frac{1}{8} \\times 16\\pi = 2\\pi$ cm<br>' +
    'Sector area $= \\frac{45}{360} \\times \\pi(8)^2 = \\frac{1}{8} \\times 64\\pi = 8\\pi$ cm$^2$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Points $A$, $B$ and $C$ lie on a circle with centre $O$. Angle $AOB = 104°$. Find angle $ACB$, giving a reason for your answer.<br><br>' +
    '<b>Solution:</b><br>' +
    'Angle $ACB$ is at the circumference, angle $AOB$ is at the centre, both subtended by arc $AB$.<br>' +
    'By the circle theorem: the angle at the centre is twice the angle at the circumference.<br>' +
    '$\\angle ACB = \\frac{104°}{2} = 52°$<br><br>' +
    '<b>Exam Tip:</b> Always identify which angles are at the centre and which are at the circumference. State the theorem clearly for full marks.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个扇形半径为 8 cm，圆心角为 $45°$。求弧长和扇形面积，答案用 $\\pi$ 表示。<br><br>' +
    '<b>解答：</b><br>' +
    '弧长 $= \\frac{45}{360} \\times 2\\pi(8) = \\frac{1}{8} \\times 16\\pi = 2\\pi$ cm<br>' +
    '扇形面积 $= \\frac{45}{360} \\times \\pi(8)^2 = \\frac{1}{8} \\times 64\\pi = 8\\pi$ cm$^2$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '点 $A$、$B$、$C$ 在以 $O$ 为圆心的圆上。$\\angle AOB = 104°$。求 $\\angle ACB$，并给出理由。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\angle ACB$ 是圆周角，$\\angle AOB$ 是圆心角，均对应弧 $AB$。<br>' +
    '由圆的定理：圆心角是同弧圆周角的两倍。<br>' +
    '$\\angle ACB = \\frac{104°}{2} = 52°$<br><br>' +
    '<b>考试技巧：</b>分清哪些角在圆心、哪些在圆周上，写清楚定理名称才能拿满分。'
});

add('hhk', 'Y10.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Perpendicular bisector</b>: the line that cuts a line segment in half at right angles. Every point on it is equidistant from the two endpoints.<br>' +
    '• <b>Angle bisector</b>: the line that divides an angle exactly in half. Every point on it is equidistant from the two arms of the angle.<br>' +
    '• <b>Locus</b>: the set of all points satisfying a given rule.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Construct a perpendicular bisector</b>: open compass to more than half the line length, draw arcs from both endpoints, join the intersection points.<br>' +
    '• <b>Construct an angle bisector</b>: from the vertex, draw an arc crossing both arms. From each crossing point draw equal arcs. Join the vertex to the intersection of these arcs.<br>' +
    '• <b>Common loci</b>:<br>' +
    '  Equidistant from two points → perpendicular bisector.<br>' +
    '  Equidistant from two lines → angle bisector.<br>' +
    '  Fixed distance from a point → circle.<br>' +
    '  Fixed distance from a line → parallel lines.<br>' +
    '• <b>Construct triangles</b>:<br>' +
    '  <b>SSS</b>: draw base, set compass to each remaining side, draw arcs to find the third vertex.<br>' +
    '  <b>SAS</b>: draw base, construct the included angle, measure the second side along the angle.<br>' +
    '  <b>ASA</b>: draw base, construct both base angles, sides meet at the third vertex.<br>' +
    '• <b>Scale drawings</b>: use a given scale (e.g. 1 cm : 5 m) to represent real distances on paper.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Leave all construction arcs visible. Do not erase them — the examiner needs to see your method. Use a sharp pencil and compass.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A freehand drawing is NOT a construction. You must use a compass and straight edge. Check measurements are accurate to within 1 mm and 1°.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>垂直平分线</b>：在线段中点处与线段垂直的直线。线上每点到两端点的距离相等。<br>' +
    '• <b>角平分线</b>：将一个角精确分成两半的射线。线上每点到角的两条边距离相等。<br>' +
    '• <b>轨迹</b>：满足给定条件的所有点的集合。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>作垂直平分线</b>：圆规开口大于线段一半，分别以两端点为圆心画弧，连接交点。<br>' +
    '• <b>作角平分线</b>：以顶点为圆心画弧交两边，再以交点为圆心画等弧，连接顶点与弧的交点。<br>' +
    '• <b>常见轨迹</b>：<br>' +
    '  到两点等距 → 垂直平分线。<br>' +
    '  到两条线等距 → 角平分线。<br>' +
    '  到一点定距 → 圆。<br>' +
    '  到一条线定距 → 平行线。<br>' +
    '• <b>构造三角形</b>：<br>' +
    '  <b>SSS</b>（三边）：画底边，以两端点为圆心画弧，弧的交点即为第三顶点。<br>' +
    '  <b>SAS</b>（两边一夹角）：画底边，在一端作已知角，沿角量出另一边。<br>' +
    '  <b>ASA</b>（两角一夹边）：画底边，在两端分别作已知角，两边交于第三顶点。<br>' +
    '• <b>比例图</b>：按给定比例（如 1 cm : 5 m）在纸上表示实际距离。<br><br>' +
    '<b>考试技巧</b><br>' +
    '保留所有作图弧线，不要擦掉——考官需要看到你的方法。使用锐利的铅笔和圆规。<br><br>' +
    '<b>注意！</b><br>' +
    '徒手画不算作图。必须使用圆规和直尺。测量精度要求在 1 mm 和 1° 以内。'
});

add('hhk', 'Y10.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Construct the perpendicular bisector of a line segment $AB$ where $AB = 8$ cm.<br><br>' +
    '<b>Solution:</b><br>' +
    '1. Draw line segment $AB = 8$ cm.<br>' +
    '2. Open compass to more than 4 cm (e.g. 5 cm).<br>' +
    '3. Place compass at $A$, draw arcs above and below the line.<br>' +
    '4. Without changing compass width, place at $B$ and draw arcs to intersect the first pair.<br>' +
    '5. Join the two intersection points with a straight line. This is the perpendicular bisector.<br>' +
    'It passes through the midpoint $M$ (4 cm from each end) at $90°$.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Construct triangle $ABC$ where $AB = 7$ cm, $BC = 5$ cm and $AC = 6$ cm (SSS).<br><br>' +
    '<b>Solution:</b><br>' +
    '1. Draw base $AB = 7$ cm.<br>' +
    '2. Set compass to 5 cm, place at $B$ and draw an arc.<br>' +
    '3. Set compass to 6 cm, place at $A$ and draw an arc.<br>' +
    '4. The arcs intersect at point $C$.<br>' +
    '5. Join $AC$ and $BC$ to complete the triangle.<br><br>' +
    '<b>Exam Tip:</b> Keep construction arcs clearly visible. Marks are awarded for the method shown by the arcs, not just the final shape.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '作线段 $AB$（$AB = 8$ cm）的垂直平分线。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 画线段 $AB = 8$ cm。<br>' +
    '2. 圆规开口大于 4 cm（如 5 cm）。<br>' +
    '3. 以 $A$ 为圆心，在线段上下各画弧。<br>' +
    '4. 不改变圆规开口，以 $B$ 为圆心画弧，与前两弧相交。<br>' +
    '5. 连接两个交点，即为垂直平分线。<br>' +
    '它过中点 $M$（距两端各 4 cm），与 $AB$ 成 $90°$。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '构造三角形 $ABC$，其中 $AB = 7$ cm，$BC = 5$ cm，$AC = 6$ cm（SSS）。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 画底边 $AB = 7$ cm。<br>' +
    '2. 圆规开口 5 cm，以 $B$ 为圆心画弧。<br>' +
    '3. 圆规开口 6 cm，以 $A$ 为圆心画弧。<br>' +
    '4. 两弧交于点 $C$。<br>' +
    '5. 连 $AC$ 和 $BC$，完成三角形。<br><br>' +
    '<b>考试技巧：</b>作图弧线要清晰保留。分数是根据弧线所示的方法给分，而非最终图形。'
});

add('hhk', 'Y10.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Congruent</b> shapes are identical in shape AND size. They can be mapped onto each other by a combination of reflections, rotations and translations.<br>' +
    '• <b>Similar</b> shapes have the same shape but different sizes. Corresponding angles are equal; corresponding sides are in the same ratio (scale factor).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Congruence conditions for triangles</b>:<br>' +
    '  <b>SSS</b>: three sides equal.<br>' +
    '  <b>SAS</b>: two sides and the included angle equal.<br>' +
    '  <b>ASA</b> (or AAS): two angles and a corresponding side equal.<br>' +
    '  <b>RHS</b>: right angle, hypotenuse and one other side equal.<br>' +
    '• To <b>prove congruence</b>, identify which condition applies and state the matching parts clearly.<br>' +
    '• <b>Similarity scale factor</b>: if corresponding sides are in ratio $k$, then:<br>' +
    '  Linear dimensions scale by $k$.<br>' +
    '  <b>Areas</b> scale by $k^2$.<br>' +
    '  <b>Volumes</b> scale by $k^3$.<br>' +
    '• E.g. if two similar solids have length ratio $2:3$, their area ratio is $4:9$ and volume ratio is $8:27$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For similarity, always find the scale factor first by matching a pair of known corresponding sides. Then apply it to find unknowns.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'SSA (two sides and a non-included angle) is NOT a valid congruence condition — it can give two different triangles (the ambiguous case).',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>全等</b>图形的形状和大小完全相同。可通过翻折、旋转、平移使之重合。<br>' +
    '• <b>相似</b>图形形状相同但大小不同。对应角相等，对应边成比例（比例因子）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>三角形全等条件</b>：<br>' +
    '  <b>SSS</b>：三边对应相等。<br>' +
    '  <b>SAS</b>：两边及其夹角对应相等。<br>' +
    '  <b>ASA</b>（或 AAS）：两角及一对应边相等。<br>' +
    '  <b>RHS</b>：直角、斜边及另一边相等。<br>' +
    '• <b>证明全等</b>时，指出适用的条件，并明确列出匹配的部分。<br>' +
    '• <b>相似比例因子</b>：若对应边比为 $k$，则：<br>' +
    '  线性尺寸比为 $k$。<br>' +
    '  <b>面积</b>比为 $k^2$。<br>' +
    '  <b>体积</b>比为 $k^3$。<br>' +
    '• 例：两个相似体的边长比为 $2:3$，面积比为 $4:9$，体积比为 $8:27$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求相似问题时，先用一对已知对应边求比例因子，再应用于未知边。<br><br>' +
    '<b>注意！</b><br>' +
    'SSA（两边和一个非夹角）不是有效的全等条件——可能产生两个不同的三角形（二义性情况）。'
});

add('hhk', 'Y10.9', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Triangles $PQR$ and $XYZ$ have $PQ = XY = 5$ cm, $QR = YZ = 7$ cm, and $\\angle PQR = \\angle XYZ = 60°$. Prove they are congruent.<br><br>' +
    '<b>Solution:</b><br>' +
    '$PQ = XY = 5$ cm (given)<br>' +
    '$QR = YZ = 7$ cm (given)<br>' +
    '$\\angle PQR = \\angle XYZ = 60°$ (given, included angle)<br>' +
    '$\\therefore \\triangle PQR \\cong \\triangle XYZ$ (SAS)<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Two similar cylinders have heights 6 cm and 9 cm. The smaller cylinder has a surface area of $80\\pi$ cm$^2$. Find the surface area of the larger cylinder.<br><br>' +
    '<b>Solution:</b><br>' +
    'Scale factor $k = \\frac{9}{6} = \\frac{3}{2}$<br>' +
    'Area scale factor $= k^2 = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}$<br>' +
    'Surface area of larger $= 80\\pi \\times \\frac{9}{4} = 180\\pi$ cm$^2$<br><br>' +
    '<b>Exam Tip:</b> For area ratios, square the linear scale factor. For volume ratios, cube it. Many students forget this step.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '三角形 $PQR$ 和 $XYZ$ 中，$PQ = XY = 5$ cm，$QR = YZ = 7$ cm，$\\angle PQR = \\angle XYZ = 60°$。证明它们全等。<br><br>' +
    '<b>解答：</b><br>' +
    '$PQ = XY = 5$ cm（已知）<br>' +
    '$QR = YZ = 7$ cm（已知）<br>' +
    '$\\angle PQR = \\angle XYZ = 60°$（已知，夹角）<br>' +
    '$\\therefore \\triangle PQR \\cong \\triangle XYZ$（SAS）<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '两个相似圆柱的高分别为 6 cm 和 9 cm。较小圆柱的表面积为 $80\\pi$ cm$^2$。求较大圆柱的表面积。<br><br>' +
    '<b>解答：</b><br>' +
    '比例因子 $k = \\frac{9}{6} = \\frac{3}{2}$<br>' +
    '面积比 $= k^2 = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}$<br>' +
    '较大圆柱表面积 $= 80\\pi \\times \\frac{9}{4} = 180\\pi$ cm$^2$<br><br>' +
    '<b>考试技巧：</b>面积比等于线性比的平方，体积比等于线性比的立方。很多学生忘记这一步。'
});

add('hhk', 'Y10.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• The <b>coordinate system</b> uses $(x, y)$ to locate points in four quadrants.<br>' +
    '• Key <b>equations of lines</b>: $x = a$ (vertical), $y = b$ (horizontal), $y = x$ (diagonal), $y = -x$ (anti-diagonal).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Reflection</b>: flip a shape over a mirror line. Describe by stating the mirror line (e.g. "reflection in the line $y = x$").<br>' +
    '• <b>Rotation</b>: turn a shape around a fixed point. Describe by stating the centre, angle and direction (clockwise/anticlockwise). E.g. "rotation $90°$ clockwise about $(0, 0)$".<br>' +
    '• <b>Translation</b>: slide a shape without turning. Describe using a column vector $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ where $a$ = horizontal shift, $b$ = vertical shift.<br>' +
    '• <b>Enlargement</b>: resize a shape from a centre of enlargement with scale factor $k$.<br>' +
    '  If $k > 1$: shape gets bigger. If $0 < k < 1$: shape gets smaller.<br>' +
    '  If $k < 0$: shape is enlarged and inverted through the centre.<br>' +
    '• <b>Describe a single transformation</b>: identify the type and give ALL required details (centre, angle, direction, scale factor, or vector).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When describing a transformation, you MUST include all details. For rotation: centre + angle + direction. For enlargement: centre + scale factor. Missing any detail loses marks.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '"Describe a single transformation" means ONE transformation only, not a combination. Do not say "a reflection then a rotation".',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>坐标系</b>用 $(x, y)$ 在四个象限中定位点。<br>' +
    '• 关键<b>直线方程</b>：$x = a$（竖直线），$y = b$（水平线），$y = x$（对角线），$y = -x$（反对角线）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>翻折（反射）</b>：沿镜面线翻转图形。描述时需说明镜面线（如"关于直线 $y = x$ 的翻折"）。<br>' +
    '• <b>旋转</b>：围绕固定点转动图形。描述时需说明旋转中心、角度和方向（顺时针/逆时针）。如"以 $(0, 0)$ 为中心，顺时针旋转 $90°$"。<br>' +
    '• <b>平移</b>：不旋转地滑动图形。用列向量 $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ 描述，$a$ = 水平位移，$b$ = 竖直位移。<br>' +
    '• <b>放缩（位似）</b>：以放缩中心为基准，按比例因子 $k$ 缩放图形。<br>' +
    '  $k > 1$：放大；$0 < k < 1$：缩小。<br>' +
    '  $k < 0$：放缩并翻转（通过中心）。<br>' +
    '• <b>描述单一变换</b>：确定类型并给出所有必要细节（中心、角度、方向、比例因子或向量）。<br><br>' +
    '<b>考试技巧</b><br>' +
    '描述变换时必须包含所有细节。旋转：中心 + 角度 + 方向。放缩：中心 + 比例因子。缺少任何细节都会扣分。<br><br>' +
    '<b>注意！</b><br>' +
    '"描述单一变换"意味着只能写一个变换，不能写"先翻折再旋转"。'
});

add('hhk', 'Y10.10', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Triangle $A$ has vertices $(1, 2)$, $(3, 2)$, $(1, 5)$. Triangle $B$ has vertices $(-1, 2)$, $(-3, 2)$, $(-1, 5)$. Describe the single transformation that maps $A$ to $B$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Each point has the same $y$-coordinate but the $x$-coordinate changes sign: $(x, y) \\to (-x, y)$.<br>' +
    'This is a <b>reflection in the $y$-axis</b> (i.e. the line $x = 0$).<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'Triangle $P$ has vertices $(2, 1)$, $(4, 1)$, $(2, 3)$. It is enlarged by scale factor $-2$ with centre of enlargement $(0, 0)$. Find the vertices of the image.<br><br>' +
    '<b>Solution:</b><br>' +
    'For scale factor $k = -2$ from origin, multiply each coordinate by $-2$:<br>' +
    '$(2, 1) \\to (-4, -2)$<br>' +
    '$(4, 1) \\to (-8, -2)$<br>' +
    '$(2, 3) \\to (-4, -6)$<br>' +
    'The image is inverted and twice as large.<br><br>' +
    '<b>Exam Tip:</b> For negative scale factors, the image appears on the opposite side of the centre. Each image point is $|k|$ times further from the centre than the object point.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '三角形 $A$ 的顶点为 $(1, 2)$、$(3, 2)$、$(1, 5)$。三角形 $B$ 的顶点为 $(-1, 2)$、$(-3, 2)$、$(-1, 5)$。描述将 $A$ 变换为 $B$ 的单一变换。<br><br>' +
    '<b>解答：</b><br>' +
    '每个点的 $y$ 坐标不变，$x$ 坐标变为相反数：$(x, y) \\to (-x, y)$。<br>' +
    '这是<b>关于 $y$ 轴（即直线 $x = 0$）的翻折</b>。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '三角形 $P$ 的顶点为 $(2, 1)$、$(4, 1)$、$(2, 3)$。以 $(0, 0)$ 为中心、比例因子 $-2$ 进行放缩。求像的顶点。<br><br>' +
    '<b>解答：</b><br>' +
    '比例因子 $k = -2$，以原点为中心，每个坐标乘以 $-2$：<br>' +
    '$(2, 1) \\to (-4, -2)$<br>' +
    '$(4, 1) \\to (-8, -2)$<br>' +
    '$(2, 3) \\to (-4, -6)$<br>' +
    '像被翻转且放大为原来的两倍。<br><br>' +
    '<b>考试技巧：</b>负比例因子时，像出现在中心的另一侧。每个像点到中心的距离是原点到中心距离的 $|k|$ 倍。'
});

add('hhk', 'Y10.11', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Probability</b> measures the likelihood of an event: $P(A) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$.<br>' +
    '• $0 \\leq P(A) \\leq 1$. $P(\\text{impossible}) = 0$, $P(\\text{certain}) = 1$.<br>' +
    '• $P(A\') = 1 - P(A)$ where $A\'$ is the complement (event NOT happening).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Listing outcomes</b>: use sample space diagrams (grids) or systematic lists to show all possible results.<br>' +
    '• <b>Mutually exclusive events</b>: cannot happen at the same time. $P(A \\text{ or } B) = P(A) + P(B)$.<br>' +
    '• <b>Independent events</b>: one does not affect the other. $P(A \\text{ and } B) = P(A) \\times P(B)$.<br>' +
    '• <b>Tree diagrams</b>:<br>' +
    '  Branches show all options at each stage.<br>' +
    '  Multiply along branches to find $P(\\text{and})$.<br>' +
    '  Add between branches to find $P(\\text{or})$.<br>' +
    '  Probabilities on each set of branches sum to 1.<br>' +
    '• <b>With replacement</b> (independent): probabilities stay the same on each branch.<br>' +
    '• <b>Without replacement</b> (dependent): probabilities change. E.g. bag with 5 red and 3 blue: first pick $P(R) = \\frac{5}{8}$, if red drawn, second pick $P(R) = \\frac{4}{7}$.<br>' +
    '• <b>Conditional probability</b>: $P(A | B) = \\frac{P(A \\cap B)}{P(B)}$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Draw tree diagrams neatly with probabilities on each branch. Check that branches from each node sum to 1.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'In "without replacement" problems the second set of probabilities changes. Always recalculate the total and favourable outcomes after the first event.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>概率</b>衡量事件发生的可能性：$P(A) = \\frac{\\text{有利结果数}}{\\text{总结果数}}$。<br>' +
    '• $0 \\leq P(A) \\leq 1$。$P(\\text{不可能}) = 0$，$P(\\text{必然}) = 1$。<br>' +
    '• $P(A\') = 1 - P(A)$，$A\'$ 为补事件（事件不发生）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>列举结果</b>：用样本空间图（网格）或系统列表展示所有可能结果。<br>' +
    '• <b>互斥事件</b>：不能同时发生。$P(A \\text{ 或 } B) = P(A) + P(B)$。<br>' +
    '• <b>独立事件</b>：互不影响。$P(A \\text{ 且 } B) = P(A) \\times P(B)$。<br>' +
    '• <b>树状图</b>：<br>' +
    '  分支展示每步的所有选项。<br>' +
    '  沿分支相乘求"且"的概率。<br>' +
    '  各分支之间相加求"或"的概率。<br>' +
    '  每组分支的概率和为 1。<br>' +
    '• <b>有放回</b>（独立）：每次概率不变。<br>' +
    '• <b>无放回</b>（相关）：概率改变。如袋中 5 红 3 蓝，第一次 $P(R) = \\frac{5}{8}$，取出红后第二次 $P(R) = \\frac{4}{7}$。<br>' +
    '• <b>条件概率</b>：$P(A | B) = \\frac{P(A \\cap B)}{P(B)}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '树状图要画整齐，每个分支上标注概率，检查每组分支之和为 1。<br><br>' +
    '<b>注意！</b><br>' +
    '无放回问题中，第二次的概率会改变。必须重新计算总数和有利结果数。'
});

add('hhk', 'Y10.11', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A bag contains 4 red balls and 6 blue balls. Two balls are drawn at random <b>without replacement</b>. Find the probability that both balls are red.<br><br>' +
    '<b>Solution:</b><br>' +
    '$P(\\text{1st red}) = \\frac{4}{10} = \\frac{2}{5}$<br>' +
    '$P(\\text{2nd red} | \\text{1st red}) = \\frac{3}{9} = \\frac{1}{3}$<br>' +
    '$P(\\text{both red}) = \\frac{2}{5} \\times \\frac{1}{3} = \\frac{2}{15}$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A spinner has sections numbered 1, 2 and 3 with probabilities $\\frac{1}{2}$, $\\frac{1}{3}$ and $\\frac{1}{6}$. The spinner is spun twice. Find the probability of getting a total of 4.<br><br>' +
    '<b>Solution:</b><br>' +
    'Ways to get total 4: $(1, 3)$, $(2, 2)$, $(3, 1)$.<br>' +
    '$P(1, 3) = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$<br>' +
    '$P(2, 2) = \\frac{1}{3} \\times \\frac{1}{3} = \\frac{1}{9}$<br>' +
    '$P(3, 1) = \\frac{1}{6} \\times \\frac{1}{2} = \\frac{1}{12}$<br>' +
    '$P(\\text{total } 4) = \\frac{1}{12} + \\frac{1}{9} + \\frac{1}{12} = \\frac{3}{36} + \\frac{4}{36} + \\frac{3}{36} = \\frac{10}{36} = \\frac{5}{18}$<br><br>' +
    '<b>Exam Tip:</b> List all combinations that give the desired total. Remember that $(1, 3)$ and $(3, 1)$ are different outcomes.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '袋中有 4 个红球和 6 个蓝球。<b>无放回</b>地随机取出 2 个球。求两个都是红球的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '$P(\\text{第一个红}) = \\frac{4}{10} = \\frac{2}{5}$<br>' +
    '$P(\\text{第二个红} | \\text{第一个红}) = \\frac{3}{9} = \\frac{1}{3}$<br>' +
    '$P(\\text{都是红}) = \\frac{2}{5} \\times \\frac{1}{3} = \\frac{2}{15}$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '转盘分为 1、2、3 三区，概率分别为 $\\frac{1}{2}$、$\\frac{1}{3}$ 和 $\\frac{1}{6}$。转两次，求总和为 4 的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '总和为 4 的组合：$(1, 3)$、$(2, 2)$、$(3, 1)$。<br>' +
    '$P(1, 3) = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$<br>' +
    '$P(2, 2) = \\frac{1}{3} \\times \\frac{1}{3} = \\frac{1}{9}$<br>' +
    '$P(3, 1) = \\frac{1}{6} \\times \\frac{1}{2} = \\frac{1}{12}$<br>' +
    '$P(\\text{总和 4}) = \\frac{1}{12} + \\frac{1}{9} + \\frac{1}{12} = \\frac{3 + 4 + 3}{36} = \\frac{10}{36} = \\frac{5}{18}$<br><br>' +
    '<b>考试技巧：</b>列出所有满足条件的组合。$(1, 3)$ 和 $(3, 1)$ 是不同的结果，要分别计算。'
});

add('hhk', 'Y10.12', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>3D solids terminology</b>:<br>' +
    '  <b>Face</b> (面) — a flat surface of a solid.<br>' +
    '  <b>Edge</b> (棱) — a line where two faces meet.<br>' +
    '  <b>Vertex</b> (顶点) — a point where edges meet.<br>' +
    '  <b>Cross-section</b> (横截面) — the shape formed by cutting through a solid.<br>' +
    '  <b>Net</b> (展开图) — a 2D shape that folds to make a 3D solid.<br>' +
    '• Euler\'s formula: $F + V - E = 2$ for any convex polyhedron.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Prism</b>: $V = A_{\\text{cross-section}} \\times l$, $SA = 2A_{\\text{cross-section}} + P \\times l$.<br>' +
    '• <b>Cylinder</b>: $V = \\pi r^2 h$, $SA = 2\\pi r^2 + 2\\pi r h$.<br>' +
    '• <b>Cone</b>: $V = \\frac{1}{3}\\pi r^2 h$, curved $SA = \\pi r l$ (where $l$ = slant height), total $SA = \\pi r l + \\pi r^2$.<br>' +
    '• <b>Sphere</b>: $V = \\frac{4}{3}\\pi r^3$, $SA = 4\\pi r^2$.<br>' +
    '• <b>Pyramid</b>: $V = \\frac{1}{3} \\times A_{\\text{base}} \\times h$.<br>' +
    '• <b>Unit conversion</b>: $1$ m$^2 = 10\\,000$ cm$^2$, $1$ m$^3 = 1\\,000\\,000$ cm$^3$. $1$ litre $= 1000$ cm$^3$.<br>' +
    '• <b>Density</b>: $\\rho = \\frac{m}{V}$ (mass = density $\\times$ volume).<br>' +
    '• <b>Plans and elevations</b>:<br>' +
    '  <b>Plan</b> (俯视图) — view from above.<br>' +
    '  <b>Front elevation</b> (正视图) — view from the front.<br>' +
    '  <b>Side elevation</b> (侧视图) — view from the side.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Write the formula first, then substitute values. For compound shapes, split into known solids, calculate separately, then add or subtract.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Do not confuse slant height $l$ with perpendicular height $h$ in cones and pyramids. Use Pythagoras to convert: $l^2 = r^2 + h^2$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>立体几何术语</b>：<br>' +
    '  <b>Face</b>（面）— 立体的平面。<br>' +
    '  <b>Edge</b>（棱）— 两个面相交的线。<br>' +
    '  <b>Vertex</b>（顶点）— 棱相交的点。<br>' +
    '  <b>Cross-section</b>（横截面）— 切割立体得到的形状。<br>' +
    '  <b>Net</b>（展开图）— 折叠后形成立体的二维图形。<br>' +
    '• 欧拉公式：$F + V - E = 2$（凸多面体）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>棱柱</b>：$V = A_{\\text{截面}} \\times l$，$SA = 2A_{\\text{截面}} + P \\times l$。<br>' +
    '• <b>圆柱</b>：$V = \\pi r^2 h$，$SA = 2\\pi r^2 + 2\\pi r h$。<br>' +
    '• <b>圆锥</b>：$V = \\frac{1}{3}\\pi r^2 h$，侧面积 $= \\pi r l$（$l$ 为母线长），全面积 $= \\pi r l + \\pi r^2$。<br>' +
    '• <b>球</b>：$V = \\frac{4}{3}\\pi r^3$，$SA = 4\\pi r^2$。<br>' +
    '• <b>棱锥</b>：$V = \\frac{1}{3} \\times A_{\\text{底面}} \\times h$。<br>' +
    '• <b>单位换算</b>：$1$ m$^2 = 10\\,000$ cm$^2$，$1$ m$^3 = 1\\,000\\,000$ cm$^3$。$1$ 升 $= 1000$ cm$^3$。<br>' +
    '• <b>密度</b>：$\\rho = \\frac{m}{V}$（质量 = 密度 $\\times$ 体积）。<br>' +
    '• <b>三视图</b>：<br>' +
    '  <b>Plan</b>（俯视图）— 从上方看。<br>' +
    '  <b>Front elevation</b>（正视图）— 从正前方看。<br>' +
    '  <b>Side elevation</b>（侧视图）— 从侧面看。<br><br>' +
    '<b>考试技巧</b><br>' +
    '先写公式再代入数值。复合立体要拆分成基本体，分别计算后相加或相减。<br><br>' +
    '<b>注意！</b><br>' +
    '不要混淆圆锥和棱锥的母线长 $l$ 和垂直高 $h$。用勾股定理转换：$l^2 = r^2 + h^2$。'
});

add('hhk', 'Y10.12', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'A cone has radius 6 cm and perpendicular height 8 cm. Find the volume and total surface area. Give your answers in terms of $\\pi$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Volume $= \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(6)^2(8) = \\frac{1}{3}\\pi(288) = 96\\pi$ cm$^3$<br><br>' +
    'Slant height: $l = \\sqrt{r^2 + h^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$ cm<br>' +
    'Curved SA $= \\pi r l = \\pi(6)(10) = 60\\pi$ cm$^2$<br>' +
    'Base area $= \\pi r^2 = 36\\pi$ cm$^2$<br>' +
    'Total SA $= 60\\pi + 36\\pi = 96\\pi$ cm$^2$<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A sphere has a surface area of $100\\pi$ cm$^2$. Find its volume in terms of $\\pi$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$SA = 4\\pi r^2 = 100\\pi$<br>' +
    '$r^2 = 25$, so $r = 5$ cm<br>' +
    '$V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(125) = \\frac{500\\pi}{3}$ cm$^3$<br><br>' +
    '<b>Exam Tip:</b> When a question says "in terms of $\\pi$", do NOT use a calculator to get a decimal. Leave $\\pi$ as a symbol in your final answer.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '圆锥的底面半径为 6 cm，垂直高为 8 cm。求体积和全面积，答案用 $\\pi$ 表示。<br><br>' +
    '<b>解答：</b><br>' +
    '体积 $= \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(6)^2(8) = \\frac{288\\pi}{3} = 96\\pi$ cm$^3$<br><br>' +
    '母线长：$l = \\sqrt{r^2 + h^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$ cm<br>' +
    '侧面积 $= \\pi r l = 60\\pi$ cm$^2$<br>' +
    '底面积 $= \\pi r^2 = 36\\pi$ cm$^2$<br>' +
    '全面积 $= 60\\pi + 36\\pi = 96\\pi$ cm$^2$<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '球的表面积为 $100\\pi$ cm$^2$，求体积（用 $\\pi$ 表示）。<br><br>' +
    '<b>解答：</b><br>' +
    '$SA = 4\\pi r^2 = 100\\pi$<br>' +
    '$r^2 = 25$，所以 $r = 5$ cm<br>' +
    '$V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(125) = \\frac{500\\pi}{3}$ cm$^3$<br><br>' +
    '<b>考试技巧：</b>题目要求"用 $\\pi$ 表示"时，不要用计算器算成小数，最终答案保留 $\\pi$ 符号。'
});


/* ══════════════════════════════════════════════════
   HHK Y11
   ══════════════════════════════════════════════════ */

add('hhk', 'Y11.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Decimal places (dp)</b>: count digits after the decimal point. E.g. $3.1416$ rounded to 2 dp is $3.14$.<br>' +
    '• <b>Significant figures (sf)</b>: count from the first non-zero digit. E.g. $0.004073$ to 2 sf is $0.0041$.<br>' +
    '• <b>Standard form</b>: $a \\times 10^n$ where $1 \\leq a < 10$ and $n$ is an integer. E.g. $4\\,560\\,000 = 4.56 \\times 10^6$.<br>' +
    '• <b>Upper bound (UB)</b>: the greatest value a rounded number could be.<br>' +
    '• <b>Lower bound (LB)</b>: the smallest value a rounded number could be.<br>' +
    '• If a value is rounded to the nearest $k$, the error is $\\pm \\frac{k}{2}$.<br>' +
    '• <b>Error interval</b>: $\\text{LB} \\leq x < \\text{UB}$. E.g. $7.3$ rounded to 1 dp: $7.25 \\leq x < 7.35$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Round values to a given number of dp or sf.<br>' +
    '• Write numbers in standard form and convert back.<br>' +
    '• Find upper and lower bounds for a rounded measurement.<br>' +
    '• Use bounds in calculations: to maximise $\\frac{a}{b}$, use $\\frac{\\text{UB of } a}{\\text{LB of } b}$; to minimise, do the opposite.<br>' +
    '• For $a + b$: max $= \\text{UB}(a) + \\text{UB}(b)$, min $= \\text{LB}(a) + \\text{LB}(b)$.<br>' +
    '• For $a - b$: max $= \\text{UB}(a) - \\text{LB}(b)$, min $= \\text{LB}(a) - \\text{UB}(b)$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always write the error interval with $\\leq$ on the left and $<$ on the right. The upper bound is NOT included.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When a question says "correct to 2 significant figures", the step size depends on the number. $4300$ to 2 sf means $\\pm 50$, so $4250 \\leq x < 4350$. Do not confuse sf with dp.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>小数位数 (dp)</b>：小数点后的位数。例如 $3.1416$ 保留 2 位小数为 $3.14$。<br>' +
    '• <b>有效数字 (sf)</b>：从第一个非零数字开始计数。例如 $0.004073$ 保留 2 位有效数字为 $0.0041$。<br>' +
    '• <b>标准式</b>：$a \\times 10^n$，其中 $1 \\leq a < 10$，$n$ 为整数。例如 $4\\,560\\,000 = 4.56 \\times 10^6$。<br>' +
    '• <b>上界 (UB)</b>：四舍五入后数值可能的最大值。<br>' +
    '• <b>下界 (LB)</b>：四舍五入后数值可能的最小值。<br>' +
    '• 若数值四舍五入到最近的 $k$，误差为 $\\pm \\frac{k}{2}$。<br>' +
    '• <b>误差区间</b>：$\\text{LB} \\leq x < \\text{UB}$。例如 $7.3$ 保留 1 位小数：$7.25 \\leq x < 7.35$。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 按给定的小数位数或有效数字进行四舍五入。<br>' +
    '• 用标准式表示数，并能互相转换。<br>' +
    '• 求四舍五入后的上界和下界。<br>' +
    '• 在计算中使用界：要使 $\\frac{a}{b}$ 最大，用 $\\frac{\\text{UB}(a)}{\\text{LB}(b)}$；要最小则反过来。<br>' +
    '• $a + b$：最大值 $= \\text{UB}(a) + \\text{UB}(b)$，最小值 $= \\text{LB}(a) + \\text{LB}(b)$。<br>' +
    '• $a - b$：最大值 $= \\text{UB}(a) - \\text{LB}(b)$，最小值 $= \\text{LB}(a) - \\text{UB}(b)$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '误差区间左边用 $\\leq$，右边用 $<$。上界不包含在内。<br><br>' +
    '<b>注意！</b><br>' +
    '题目说"保留 2 位有效数字"时，步长取决于数值本身。$4300$ 保留 2 sf 意味着 $\\pm 50$，即 $4250 \\leq x < 4350$。不要把有效数字和小数位数混淆。'
});

add('hhk', 'Y11.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A rectangle has length $12.4$ cm and width $5.3$ cm, both measured to 1 decimal place. Calculate the lower bound of the area.<br><br>' +
    '<b>Solution:</b><br>' +
    'Lower bound of length: $12.35$ cm<br>' +
    'Lower bound of width: $5.25$ cm<br>' +
    'Lower bound of area $= 12.35 \\times 5.25 = 64.8375$ cm$^2$<br>' +
    '$= 64.8$ cm$^2$ (3 sf)<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A car travels $250$ km, correct to the nearest $10$ km, in $3.5$ hours, correct to the nearest $0.1$ hour. Find the upper bound of the speed.<br><br>' +
    '<b>Solution:</b><br>' +
    'To maximise speed $= \\frac{\\text{distance}}{\\text{time}}$, use UB of distance and LB of time.<br>' +
    'UB of distance $= 255$ km<br>' +
    'LB of time $= 3.45$ hours<br>' +
    'Upper bound of speed $= \\frac{255}{3.45} = 73.9$ km/h (3 sf)<br><br>' +
    '<b>Exam Tip:</b> For maximum of a fraction, make the numerator as large as possible and the denominator as small as possible.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一个长方形的长为 $12.4$ cm，宽为 $5.3$ cm，均保留 1 位小数。计算面积的下界。<br><br>' +
    '<b>解答：</b><br>' +
    '长的下界：$12.35$ cm<br>' +
    '宽的下界：$5.25$ cm<br>' +
    '面积下界 $= 12.35 \\times 5.25 = 64.8375$ cm$^2$<br>' +
    '$= 64.8$ cm$^2$（保留 3 位有效数字）<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '一辆汽车行驶了 $250$ km（精确到最近的 $10$ km），用时 $3.5$ 小时（精确到最近的 $0.1$ 小时）。求速度的上界。<br><br>' +
    '<b>解答：</b><br>' +
    '要使速度 $= \\frac{\\text{距离}}{\\text{时间}}$ 最大，用距离的上界和时间的下界。<br>' +
    '距离上界 $= 255$ km<br>' +
    '时间下界 $= 3.45$ 小时<br>' +
    '速度上界 $= \\frac{255}{3.45} = 73.9$ km/h（保留 3 位有效数字）<br><br>' +
    '<b>考试技巧：</b>要使分数最大，分子取最大值，分母取最小值。'
});

add('hhk', 'Y11.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Probability</b> measures how likely an event is: $0 \\leq P(A) \\leq 1$. Impossible $= 0$, certain $= 1$.<br>' +
    '• $P(A) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$<br>' +
    '• $P(A\') = 1 - P(A)$ — the probability of event $A$ NOT happening.<br>' +
    '• A <b>set</b> is a collection of elements: $A = \\{1, 3, 5, 7\\}$.<br>' +
    '• $\\mathcal{E}$ = <b>universal set</b>, $\\varnothing$ = <b>empty set</b>.<br>' +
    '• $\\in$ means "is an element of", $\\notin$ means "is not an element of".<br>' +
    '• $A \\subset B$ means $A$ is a proper subset of $B$.<br>' +
    '• $A \\cap B$ = <b>intersection</b> (in both $A$ and $B$).<br>' +
    '• $A \\cup B$ = <b>union</b> (in $A$ or $B$ or both).<br>' +
    '• $A\'$ = <b>complement</b> (not in $A$).<br>' +
    '• $n(A)$ = number of elements in set $A$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Draw and label <b>Venn diagrams</b> for 2 sets and 3 sets.<br>' +
    '• Shade correct regions for expressions like $A \\cap B\'$, $(A \\cup B)\'$, $A \\cap B \\cap C$.<br>' +
    '• Use the addition formula: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.<br>' +
    '• Calculate probabilities from Venn diagrams: $P(A) = \\frac{n(A)}{n(\\mathcal{E})}$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always fill the Venn diagram starting from the innermost region (intersection of all sets) and work outwards.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$A \\cup B$ is NOT the same as $A \\cap B$. Union includes everything in either set; intersection includes only what they share.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>概率</b>衡量事件发生的可能性：$0 \\leq P(A) \\leq 1$。不可能 $= 0$，必然 $= 1$。<br>' +
    '• $P(A) = \\frac{\\text{有利结果数}}{\\text{总结果数}}$<br>' +
    '• $P(A\') = 1 - P(A)$ — 事件 $A$ 不发生的概率。<br>' +
    '• <b>集合</b>是元素的集体：$A = \\{1, 3, 5, 7\\}$。<br>' +
    '• $\\mathcal{E}$ = <b>全集</b>，$\\varnothing$ = <b>空集</b>。<br>' +
    '• $\\in$ 表示"属于"，$\\notin$ 表示"不属于"。<br>' +
    '• $A \\subset B$ 表示 $A$ 是 $B$ 的真子集。<br>' +
    '• $A \\cap B$ = <b>交集</b>（同时在 $A$ 和 $B$ 中）。<br>' +
    '• $A \\cup B$ = <b>并集</b>（在 $A$ 或 $B$ 中）。<br>' +
    '• $A\'$ = <b>补集</b>（不在 $A$ 中）。<br>' +
    '• $n(A)$ = 集合 $A$ 的元素个数。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 画并标注 2 圈和 3 圈的<b>韦恩图</b>。<br>' +
    '• 正确涂色如 $A \\cap B\'$、$(A \\cup B)\'$、$A \\cap B \\cap C$ 的区域。<br>' +
    '• 使用加法公式：$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$。<br>' +
    '• 从韦恩图计算概率：$P(A) = \\frac{n(A)}{n(\\mathcal{E})}$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '填韦恩图时，先从最内层区域（所有集合的交集）开始，再向外填写。<br><br>' +
    '<b>注意！</b><br>' +
    '$A \\cup B$ 和 $A \\cap B$ 不同。并集包含任一集合中的所有元素；交集只包含两个集合共有的元素。'
});

add('hhk', 'Y11.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'In a class of 30 students, 18 play football ($F$), 14 play basketball ($B$), and 6 play both. Find the probability that a randomly chosen student plays neither sport.<br><br>' +
    '<b>Solution:</b><br>' +
    '$n(F \\cap B) = 6$<br>' +
    'Only football: $18 - 6 = 12$<br>' +
    'Only basketball: $14 - 6 = 8$<br>' +
    'Neither: $30 - (12 + 6 + 8) = 4$<br>' +
    '$P(\\text{neither}) = \\frac{4}{30} = \\frac{2}{15}$<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    'In a group of 40 people, set $A$ represents those who like apples and set $B$ represents those who like bananas. $n(A) = 22$, $n(B) = 25$, $n(A \\cup B)\' = 3$. Find $n(A \\cap B)$ and $P(A \\cap B\')$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$n(A \\cup B) = 40 - 3 = 37$<br>' +
    '$n(A \\cap B) = n(A) + n(B) - n(A \\cup B) = 22 + 25 - 37 = 10$<br>' +
    '$n(A \\cap B\') = n(A) - n(A \\cap B) = 22 - 10 = 12$<br>' +
    '$P(A \\cap B\') = \\frac{12}{40} = \\frac{3}{10}$<br><br>' +
    '<b>Exam Tip:</b> Use the formula $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$ to find the intersection when given the union.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '一个班有 30 名学生，18 人踢足球（$F$），14 人打篮球（$B$），6 人两项都参加。求随机选一名学生两项都不参加的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '$n(F \\cap B) = 6$<br>' +
    '只踢足球：$18 - 6 = 12$<br>' +
    '只打篮球：$14 - 6 = 8$<br>' +
    '两项都不参加：$30 - (12 + 6 + 8) = 4$<br>' +
    '$P(\\text{两项都不参加}) = \\frac{4}{30} = \\frac{2}{15}$<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '在 40 人的群体中，集合 $A$ 代表喜欢苹果的人，集合 $B$ 代表喜欢香蕉的人。$n(A) = 22$，$n(B) = 25$，$n(A \\cup B)\' = 3$。求 $n(A \\cap B)$ 和 $P(A \\cap B\')$。<br><br>' +
    '<b>解答：</b><br>' +
    '$n(A \\cup B) = 40 - 3 = 37$<br>' +
    '$n(A \\cap B) = n(A) + n(B) - n(A \\cup B) = 22 + 25 - 37 = 10$<br>' +
    '$n(A \\cap B\') = n(A) - n(A \\cap B) = 22 - 10 = 12$<br>' +
    '$P(A \\cap B\') = \\frac{12}{40} = \\frac{3}{10}$<br><br>' +
    '<b>考试技巧：</b>当已知并集时，用公式 $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$ 求交集。'
});

add('hhk', 'Y11.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>simultaneous equation</b> is a set of two or more equations with two or more unknowns that must be solved together.<br>' +
    '• The solution is the values of the variables that satisfy ALL equations at the same time.<br>' +
    '• Graphically, the solution is where the lines (or curves) <b>intersect</b>.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Elimination method</b>: Multiply one or both equations so that the coefficients of one variable match, then add or subtract to eliminate it.<br>' +
    '  E.g. $2x + 3y = 12$ and $5x - 3y = 9$ — add to eliminate $y$: $7x = 21$, so $x = 3$.<br>' +
    '• <b>Substitution method</b>: Rearrange one equation to make one variable the subject, then substitute into the other equation.<br>' +
    '  Essential when one equation is linear and the other is quadratic, e.g. $y = x + 1$ and $x^2 + y^2 = 25$.<br>' +
    '• <b>Graphical method</b>: Plot both equations on the same axes; the intersection point(s) give the solution.<br>' +
    '• Rearrange complex equations into standard form before solving.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For two linear equations, elimination is usually faster. For one linear and one quadratic, you MUST use substitution.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'When subtracting equations, be careful with signs: subtracting a negative becomes adding. Always check your answer by substituting back into BOTH original equations.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>联立方程</b>是含有两个或多个未知数的方程组，需要同时求解。<br>' +
    '• 解是同时满足所有方程的变量值。<br>' +
    '• 在图形上，解就是直线（或曲线）的<b>交点</b>。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>消元法</b>：将一个或两个方程乘以适当数，使某个变量的系数相同，然后相加或相减消去该变量。<br>' +
    '  例如 $2x + 3y = 12$ 和 $5x - 3y = 9$ — 相加消去 $y$：$7x = 21$，所以 $x = 3$。<br>' +
    '• <b>代入法</b>：将一个方程改写使某个变量成为主项，然后代入另一个方程。<br>' +
    '  当一个方程是线性、另一个是二次时必须使用代入法，如 $y = x + 1$ 和 $x^2 + y^2 = 25$。<br>' +
    '• <b>图形法</b>：在同一坐标轴上画出两个方程的图像；交点就是解。<br>' +
    '• 求解前先将复杂方程整理为标准形式。<br><br>' +
    '<b>考试技巧</b><br>' +
    '两个线性方程通常用消元法更快。一个线性一个二次时，必须用代入法。<br><br>' +
    '<b>注意！</b><br>' +
    '方程相减时注意符号：减去负数变成加法。一定要将答案代回两个原方程验算。'
});

add('hhk', 'Y11.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'Solve the simultaneous equations:<br>' +
    '$3x + 2y = 16$<br>' +
    '$5x - 2y = 24$<br><br>' +
    '<b>Solution:</b><br>' +
    'Add the two equations (coefficients of $y$ are $+2$ and $-2$):<br>' +
    '$8x = 40$<br>' +
    '$x = 5$<br>' +
    'Substitute into equation 1: $3(5) + 2y = 16$<br>' +
    '$15 + 2y = 16$<br>' +
    '$2y = 1$<br>' +
    '$y = 0.5$<br>' +
    'Solution: $x = 5$, $y = 0.5$<br><br>' +
    '<b>Worked Example 2</b> [6 marks]<br>' +
    'Solve the simultaneous equations:<br>' +
    '$y = 2x + 1$<br>' +
    '$x^2 + y^2 = 10$<br><br>' +
    '<b>Solution:</b><br>' +
    'Substitute $y = 2x + 1$ into the second equation:<br>' +
    '$x^2 + (2x + 1)^2 = 10$<br>' +
    '$x^2 + 4x^2 + 4x + 1 = 10$<br>' +
    '$5x^2 + 4x - 9 = 0$<br>' +
    '$(5x + 9)(x - 1) = 0$<br>' +
    '$x = -\\frac{9}{5}$ or $x = 1$<br>' +
    'When $x = 1$: $y = 2(1) + 1 = 3$<br>' +
    'When $x = -\\frac{9}{5}$: $y = 2(-\\frac{9}{5}) + 1 = -\\frac{13}{5}$<br><br>' +
    '<b>Exam Tip:</b> When substituting into a quadratic, expand the bracket fully and collect all terms on one side before factorising.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '解联立方程：<br>' +
    '$3x + 2y = 16$<br>' +
    '$5x - 2y = 24$<br><br>' +
    '<b>解答：</b><br>' +
    '两个方程相加（$y$ 的系数为 $+2$ 和 $-2$）：<br>' +
    '$8x = 40$<br>' +
    '$x = 5$<br>' +
    '代入方程 1：$3(5) + 2y = 16$<br>' +
    '$15 + 2y = 16$<br>' +
    '$2y = 1$<br>' +
    '$y = 0.5$<br>' +
    '解：$x = 5$，$y = 0.5$<br><br>' +
    '<b>经典例题 2</b> [6 分]<br>' +
    '解联立方程：<br>' +
    '$y = 2x + 1$<br>' +
    '$x^2 + y^2 = 10$<br><br>' +
    '<b>解答：</b><br>' +
    '将 $y = 2x + 1$ 代入第二个方程：<br>' +
    '$x^2 + (2x + 1)^2 = 10$<br>' +
    '$x^2 + 4x^2 + 4x + 1 = 10$<br>' +
    '$5x^2 + 4x - 9 = 0$<br>' +
    '$(5x + 9)(x - 1) = 0$<br>' +
    '$x = -\\frac{9}{5}$ 或 $x = 1$<br>' +
    '当 $x = 1$：$y = 2(1) + 1 = 3$<br>' +
    '当 $x = -\\frac{9}{5}$：$y = 2(-\\frac{9}{5}) + 1 = -\\frac{13}{5}$<br><br>' +
    '<b>考试技巧：</b>代入二次方程时，先完全展开括号，将所有项移到一边，再进行因式分解。'
});

add('hhk', 'Y11.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>linear sequence</b> has a constant first difference. The $n$th term is $an + b$, where $a$ is the common difference.<br>' +
    '  E.g. $3, 7, 11, 15, ...$ has first difference $4$, so $n$th term $= 4n - 1$.<br>' +
    '• To check if a value $V$ is in a sequence, set $an + b = V$ and solve for $n$. If $n$ is a positive integer, $V$ is in the sequence.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• A <b>quadratic sequence</b> has a constant <b>second difference</b>.<br>' +
    '• If the second difference is $2a$, the $n$th term has the form $an^2 + bn + c$.<br>' +
    '• Method to find the $n$th term of a quadratic sequence:<br>' +
    '  1. Find first differences, then second differences.<br>' +
    '  2. Second difference $= 2a$, so $a = \\frac{\\text{2nd diff}}{2}$.<br>' +
    '  3. Subtract $an^2$ from each term to get a linear sequence.<br>' +
    '  4. Find the $n$th term of that linear sequence to get $bn + c$.<br>' +
    '  5. Combine: $n$th term $= an^2 + bn + c$.<br>' +
    '• Example: $2, 6, 12, 20, 30, ...$<br>' +
    '  First diff: $4, 6, 8, 10$ — Second diff: $2, 2, 2$ — so $a = 1$.<br>' +
    '  Subtract $n^2$: $1, 2, 3, 4, 5$ — this is just $n$.<br>' +
    '  $n$th term $= n^2 + n$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always check your formula by substituting $n = 1, 2, 3$ back into it to verify you get the original sequence.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'The second difference equals $2a$, NOT $a$. If the second difference is $6$, then $a = 3$ and the $n^2$ coefficient is $3$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>线性数列</b>的一阶差为常数。第 $n$ 项为 $an + b$，其中 $a$ 是公差。<br>' +
    '  例如 $3, 7, 11, 15, ...$ 的一阶差为 $4$，所以第 $n$ 项 $= 4n - 1$。<br>' +
    '• 要判断值 $V$ 是否在数列中，令 $an + b = V$ 解出 $n$。若 $n$ 是正整数，则 $V$ 在数列中。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>二次数列</b>的<b>二阶差</b>为常数。<br>' +
    '• 若二阶差为 $2a$，第 $n$ 项的形式为 $an^2 + bn + c$。<br>' +
    '• 求二次数列第 $n$ 项的方法：<br>' +
    '  1. 先求一阶差，再求二阶差。<br>' +
    '  2. 二阶差 $= 2a$，所以 $a = \\frac{\\text{二阶差}}{2}$。<br>' +
    '  3. 从每一项中减去 $an^2$，得到一个线性数列。<br>' +
    '  4. 求该线性数列的第 $n$ 项得到 $bn + c$。<br>' +
    '  5. 合并：第 $n$ 项 $= an^2 + bn + c$。<br>' +
    '• 例如：$2, 6, 12, 20, 30, ...$<br>' +
    '  一阶差：$4, 6, 8, 10$ — 二阶差：$2, 2, 2$ — 所以 $a = 1$。<br>' +
    '  减去 $n^2$：$1, 2, 3, 4, 5$ — 即 $n$。<br>' +
    '  第 $n$ 项 $= n^2 + n$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '一定要用 $n = 1, 2, 3$ 代入公式验算，确认能得到原数列。<br><br>' +
    '<b>注意！</b><br>' +
    '二阶差等于 $2a$，不是 $a$。若二阶差为 $6$，则 $a = 3$，$n^2$ 的系数是 $3$。'
});

add('hhk', 'Y11.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'The $n$th term of a sequence is $3n + 7$. Is $58$ a term in this sequence?<br><br>' +
    '<b>Solution:</b><br>' +
    '$3n + 7 = 58$<br>' +
    '$3n = 51$<br>' +
    '$n = 17$<br>' +
    'Since $n = 17$ is a positive integer, $58$ IS the 17th term of the sequence.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Find the $n$th term of the sequence $5, 12, 23, 38, 57, ...$<br><br>' +
    '<b>Solution:</b><br>' +
    'First differences: $7, 11, 15, 19$<br>' +
    'Second differences: $4, 4, 4$<br>' +
    'Second difference $= 4$, so $a = 2$.<br>' +
    'Subtract $2n^2$ from each term:<br>' +
    '$5 - 2 = 3$, $12 - 8 = 4$, $23 - 18 = 5$, $38 - 32 = 6$, $57 - 50 = 7$<br>' +
    'Linear sequence: $3, 4, 5, 6, 7$ which is $n + 2$.<br>' +
    '$n$th term $= 2n^2 + n + 2$<br>' +
    'Check: $n = 1$: $2 + 1 + 2 = 5$ &#10003;<br><br>' +
    '<b>Exam Tip:</b> Write out your differences table clearly. Show the subtraction of $an^2$ as a separate row — examiners award method marks for this working.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '数列的第 $n$ 项为 $3n + 7$。$58$ 是否是此数列中的项？<br><br>' +
    '<b>解答：</b><br>' +
    '$3n + 7 = 58$<br>' +
    '$3n = 51$<br>' +
    '$n = 17$<br>' +
    '因为 $n = 17$ 是正整数，所以 $58$ 是此数列的第 17 项。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '求数列 $5, 12, 23, 38, 57, ...$ 的第 $n$ 项公式。<br><br>' +
    '<b>解答：</b><br>' +
    '一阶差：$7, 11, 15, 19$<br>' +
    '二阶差：$4, 4, 4$<br>' +
    '二阶差 $= 4$，所以 $a = 2$。<br>' +
    '从每项中减去 $2n^2$：<br>' +
    '$5 - 2 = 3$，$12 - 8 = 4$，$23 - 18 = 5$，$38 - 32 = 6$，$57 - 50 = 7$<br>' +
    '线性数列：$3, 4, 5, 6, 7$，即 $n + 2$。<br>' +
    '第 $n$ 项 $= 2n^2 + n + 2$<br>' +
    '验算：$n = 1$：$2 + 1 + 2 = 5$ &#10003;<br><br>' +
    '<b>考试技巧：</b>差分表要写清楚。减去 $an^2$ 的过程单独列一行——考官会为这个步骤给方法分。'
});

add('hhk', 'Y11.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Function notation</b>: $f(x)$ names the function. E.g. $f(x) = 2x + 3$ means "double $x$ then add 3".<br>' +
    '• $f(5) = 2(5) + 3 = 13$ — substitute $x = 5$ into the function.<br>' +
    '• The <b>domain</b> is the set of allowed input values ($x$-values).<br>' +
    '• The <b>range</b> is the set of possible output values ($y$-values).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Inverse function</b> $f^{-1}(x)$: reverse the operations. Method: write $y = f(x)$, swap $x$ and $y$, then rearrange for $y$.<br>' +
    '  E.g. $f(x) = 3x - 1 \\Rightarrow y = 3x - 1 \\Rightarrow x = 3y - 1 \\Rightarrow y = \\frac{x + 1}{3}$, so $f^{-1}(x) = \\frac{x + 1}{3}$.<br>' +
    '• <b>Composite function</b> $fg(x)$: apply $g$ first, then $f$. $fg(x) = f(g(x))$.<br>' +
    '  E.g. $f(x) = x^2$, $g(x) = x + 1$: $fg(3) = f(g(3)) = f(4) = 16$.<br>' +
    '• <b>Graph types</b>:<br>' +
    '  — <b>Linear</b>: $y = mx + c$ (straight line)<br>' +
    '  — <b>Quadratic</b>: $y = ax^2 + bx + c$ (U-shape or n-shape parabola)<br>' +
    '  — <b>Cubic</b>: $y = ax^3 + ...$ (S-shape curve)<br>' +
    '  — <b>Reciprocal</b>: $y = \\frac{a}{x}$ (two branches in opposite quadrants)<br>' +
    '  — <b>Exponential</b>: $y = a^x$ (rapid growth or decay curve)<br><br>' +
    '<b>Exam Tip</b><br>' +
    'For composite functions, always work from the inside out: in $fg(x)$, find $g(x)$ first, then apply $f$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$fg(x) \\neq gf(x)$ in general! The order matters. Also, the domain of $f^{-1}$ equals the range of $f$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>函数表示法</b>：$f(x)$ 命名函数。例如 $f(x) = 2x + 3$ 表示"将 $x$ 乘以 2 再加 3"。<br>' +
    '• $f(5) = 2(5) + 3 = 13$ — 将 $x = 5$ 代入函数。<br>' +
    '• <b>定义域</b>是允许的输入值集合（$x$ 值）。<br>' +
    '• <b>值域</b>是可能的输出值集合（$y$ 值）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>反函数</b> $f^{-1}(x)$：逆转运算。方法：令 $y = f(x)$，交换 $x$ 和 $y$，再整理出 $y$。<br>' +
    '  例如 $f(x) = 3x - 1 \\Rightarrow y = 3x - 1 \\Rightarrow x = 3y - 1 \\Rightarrow y = \\frac{x + 1}{3}$，所以 $f^{-1}(x) = \\frac{x + 1}{3}$。<br>' +
    '• <b>复合函数</b> $fg(x)$：先应用 $g$，再应用 $f$。$fg(x) = f(g(x))$。<br>' +
    '  例如 $f(x) = x^2$，$g(x) = x + 1$：$fg(3) = f(g(3)) = f(4) = 16$。<br>' +
    '• <b>图像类型</b>：<br>' +
    '  — <b>线性</b>：$y = mx + c$（直线）<br>' +
    '  — <b>二次</b>：$y = ax^2 + bx + c$（U 形或 n 形抛物线）<br>' +
    '  — <b>三次</b>：$y = ax^3 + ...$（S 形曲线）<br>' +
    '  — <b>反比例</b>：$y = \\frac{a}{x}$（对角象限中的两支曲线）<br>' +
    '  — <b>指数</b>：$y = a^x$（快速增长或衰减曲线）<br><br>' +
    '<b>考试技巧</b><br>' +
    '求复合函数时，从内向外计算：$fg(x)$ 先求 $g(x)$，再代入 $f$。<br><br>' +
    '<b>注意！</b><br>' +
    '通常 $fg(x) \\neq gf(x)$！顺序很重要。另外，$f^{-1}$ 的定义域等于 $f$ 的值域。'
});

add('hhk', 'Y11.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    '$f(x) = \\frac{2x + 5}{3}$. Find $f^{-1}(x)$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Let $y = \\frac{2x + 5}{3}$<br>' +
    'Swap $x$ and $y$: $x = \\frac{2y + 5}{3}$<br>' +
    '$3x = 2y + 5$<br>' +
    '$2y = 3x - 5$<br>' +
    '$y = \\frac{3x - 5}{2}$<br>' +
    '$f^{-1}(x) = \\frac{3x - 5}{2}$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    '$f(x) = 3x + 1$ and $g(x) = x^2 - 4$. Find $fg(x)$ and solve $gf(x) = 0$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$fg(x) = f(g(x)) = f(x^2 - 4) = 3(x^2 - 4) + 1 = 3x^2 - 11$<br><br>' +
    '$gf(x) = g(f(x)) = g(3x + 1) = (3x + 1)^2 - 4$<br>' +
    'Set $= 0$: $(3x + 1)^2 = 4$<br>' +
    '$3x + 1 = \\pm 2$<br>' +
    '$3x = 1$ or $3x = -3$<br>' +
    '$x = \\frac{1}{3}$ or $x = -1$<br><br>' +
    '<b>Exam Tip:</b> To find the inverse, always use the "swap $x$ and $y$" method — it works for every function type.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '$f(x) = \\frac{2x + 5}{3}$。求 $f^{-1}(x)$。<br><br>' +
    '<b>解答：</b><br>' +
    '令 $y = \\frac{2x + 5}{3}$<br>' +
    '交换 $x$ 和 $y$：$x = \\frac{2y + 5}{3}$<br>' +
    '$3x = 2y + 5$<br>' +
    '$2y = 3x - 5$<br>' +
    '$y = \\frac{3x - 5}{2}$<br>' +
    '$f^{-1}(x) = \\frac{3x - 5}{2}$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '$f(x) = 3x + 1$，$g(x) = x^2 - 4$。求 $fg(x)$，并解 $gf(x) = 0$。<br><br>' +
    '<b>解答：</b><br>' +
    '$fg(x) = f(g(x)) = f(x^2 - 4) = 3(x^2 - 4) + 1 = 3x^2 - 11$<br><br>' +
    '$gf(x) = g(f(x)) = g(3x + 1) = (3x + 1)^2 - 4$<br>' +
    '令 $= 0$：$(3x + 1)^2 = 4$<br>' +
    '$3x + 1 = \\pm 2$<br>' +
    '$3x = 1$ 或 $3x = -3$<br>' +
    '$x = \\frac{1}{3}$ 或 $x = -1$<br><br>' +
    '<b>考试技巧：</b>求反函数时，始终使用"交换 $x$ 和 $y$"的方法——适用于所有函数类型。'
});

add('hhk', 'Y11.6', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• The <b>gradient</b> of a curve at a point is the gradient of the <b>tangent line</b> at that point.<br>' +
    '• You can estimate the gradient by drawing a tangent and calculating $\\frac{\\text{rise}}{\\text{run}}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• The <b>derived function</b> (derivative) gives a formula for the gradient at any point.<br>' +
    '• Differentiation rule: if $y = ax^n$, then $\\frac{dy}{dx} = anx^{n-1}$.<br>' +
    '  E.g. $y = 5x^3 \\Rightarrow \\frac{dy}{dx} = 15x^2$.<br>' +
    '• For a sum: differentiate each term separately.<br>' +
    '  E.g. $y = 3x^2 - 4x + 7 \\Rightarrow \\frac{dy}{dx} = 6x - 4$.<br>' +
    '• A constant differentiates to zero: $\\frac{d}{dx}(7) = 0$.<br>' +
    '• <b>Gradient at a point</b>: substitute the $x$-value into $\\frac{dy}{dx}$.<br>' +
    '• <b>Tangent equation</b>: use $y - y_1 = m(x - x_1)$ where $m = \\frac{dy}{dx}$ at the point.<br>' +
    '• <b>Turning points</b> (stationary points): set $\\frac{dy}{dx} = 0$ and solve for $x$.<br>' +
    '  — If $\\frac{d^2y}{dx^2} > 0$: minimum. If $\\frac{d^2y}{dx^2} < 0$: maximum.<br>' +
    '  — Or check the sign of $\\frac{dy}{dx}$ either side of the turning point.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Before differentiating, rewrite terms so they are in the form $ax^n$. E.g. $\\frac{3}{x^2} = 3x^{-2}$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\frac{dy}{dx} = 0$ gives turning points, NOT the $y$-value. You must substitute $x$ back into the ORIGINAL equation to find $y$.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 曲线在某点的<b>梯度</b>就是该点<b>切线</b>的斜率。<br>' +
    '• 可以通过画切线并计算 $\\frac{\\text{纵向变化}}{\\text{横向变化}}$ 来估计梯度。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>导函数</b>（导数）给出任意点的梯度公式。<br>' +
    '• 求导法则：若 $y = ax^n$，则 $\\frac{dy}{dx} = anx^{n-1}$。<br>' +
    '  例如 $y = 5x^3 \\Rightarrow \\frac{dy}{dx} = 15x^2$。<br>' +
    '• 多项式：各项分别求导。<br>' +
    '  例如 $y = 3x^2 - 4x + 7 \\Rightarrow \\frac{dy}{dx} = 6x - 4$。<br>' +
    '• 常数的导数为零：$\\frac{d}{dx}(7) = 0$。<br>' +
    '• <b>某点的梯度</b>：将 $x$ 值代入 $\\frac{dy}{dx}$。<br>' +
    '• <b>切线方程</b>：用 $y - y_1 = m(x - x_1)$，其中 $m = \\frac{dy}{dx}$ 在该点的值。<br>' +
    '• <b>驻点</b>（极值点）：令 $\\frac{dy}{dx} = 0$，解出 $x$。<br>' +
    '  — 若 $\\frac{d^2y}{dx^2} > 0$：极小值。若 $\\frac{d^2y}{dx^2} < 0$：极大值。<br>' +
    '  — 或检查驻点两侧 $\\frac{dy}{dx}$ 的符号变化。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求导前，先将各项改写为 $ax^n$ 的形式。例如 $\\frac{3}{x^2} = 3x^{-2}$。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\frac{dy}{dx} = 0$ 求出的是驻点的 $x$ 值，不是 $y$ 值。必须将 $x$ 代回原方程求 $y$。'
});

add('hhk', 'Y11.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'Find the gradient of the curve $y = 2x^3 - 5x + 1$ at the point where $x = 2$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\frac{dy}{dx} = 6x^2 - 5$<br>' +
    'At $x = 2$: $\\frac{dy}{dx} = 6(4) - 5 = 19$<br>' +
    'The gradient at $x = 2$ is $19$.<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    'Find the coordinates and nature of the turning points of $y = x^3 - 6x^2 + 9x + 2$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\frac{dy}{dx} = 3x^2 - 12x + 9$<br>' +
    'Set $\\frac{dy}{dx} = 0$: $3x^2 - 12x + 9 = 0$<br>' +
    '$x^2 - 4x + 3 = 0$<br>' +
    '$(x - 1)(x - 3) = 0$<br>' +
    '$x = 1$ or $x = 3$<br><br>' +
    '$\\frac{d^2y}{dx^2} = 6x - 12$<br>' +
    'At $x = 1$: $6(1) - 12 = -6 < 0$ — maximum<br>' +
    '$y = 1 - 6 + 9 + 2 = 6$ — maximum at $(1, 6)$<br>' +
    'At $x = 3$: $6(3) - 12 = 6 > 0$ — minimum<br>' +
    '$y = 27 - 54 + 27 + 2 = 2$ — minimum at $(3, 2)$<br><br>' +
    '<b>Exam Tip:</b> Always find $\\frac{d^2y}{dx^2}$ to determine whether each turning point is a max or min — this is often worth an extra mark.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '求曲线 $y = 2x^3 - 5x + 1$ 在 $x = 2$ 处的梯度。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\frac{dy}{dx} = 6x^2 - 5$<br>' +
    '当 $x = 2$：$\\frac{dy}{dx} = 6(4) - 5 = 19$<br>' +
    '在 $x = 2$ 处的梯度为 $19$。<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '求 $y = x^3 - 6x^2 + 9x + 2$ 的驻点坐标及类型。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\frac{dy}{dx} = 3x^2 - 12x + 9$<br>' +
    '令 $\\frac{dy}{dx} = 0$：$3x^2 - 12x + 9 = 0$<br>' +
    '$x^2 - 4x + 3 = 0$<br>' +
    '$(x - 1)(x - 3) = 0$<br>' +
    '$x = 1$ 或 $x = 3$<br><br>' +
    '$\\frac{d^2y}{dx^2} = 6x - 12$<br>' +
    '当 $x = 1$：$6(1) - 12 = -6 < 0$ — 极大值<br>' +
    '$y = 1 - 6 + 9 + 2 = 6$ — 极大值点 $(1, 6)$<br>' +
    '当 $x = 3$：$6(3) - 12 = 6 > 0$ — 极小值<br>' +
    '$y = 27 - 54 + 27 + 2 = 2$ — 极小值点 $(3, 2)$<br><br>' +
    '<b>考试技巧：</b>一定要求 $\\frac{d^2y}{dx^2}$ 来判断驻点是极大值还是极小值——这通常额外给分。'
});

add('hhk', 'Y11.7', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>SOHCAHTOA</b> only works for right-angled triangles.<br>' +
    '• For any triangle, label sides $a, b, c$ opposite angles $A, B, C$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Sine rule</b>: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$<br>' +
    '  Use when you have a side and its opposite angle, plus one more piece of information.<br>' +
    '  Flip to $\\frac{\\sin A}{a} = \\frac{\\sin B}{b}$ when finding an angle.<br>' +
    '• <b>Cosine rule</b> (finding a side): $a^2 = b^2 + c^2 - 2bc \\cos A$<br>' +
    '  Use when you have two sides and the included angle (SAS).<br>' +
    '• <b>Cosine rule</b> (finding an angle): $\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$<br>' +
    '  Use when you have all three sides (SSS).<br>' +
    '• <b>Area of a triangle</b>: $\\text{Area} = \\frac{1}{2}ab \\sin C$<br>' +
    '  Use when you have two sides and the included angle.<br>' +
    '• <b>3D trigonometry</b>: identify right-angled triangles within 3D shapes, then apply SOHCAHTOA or the sine/cosine rules.<br>' +
    '• <b>Angle between a line and a plane</b>: drop a perpendicular from the point to the plane, then find the angle in the right-angled triangle formed.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always draw and label your triangle clearly. Decide which rule to use: sine rule needs a pair (side + opposite angle); cosine rule needs SAS or SSS.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>SOHCAHTOA</b> 仅适用于直角三角形。<br>' +
    '• 对于任意三角形，将边 $a, b, c$ 标记在对角 $A, B, C$ 的对面。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>正弦定理</b>：$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$<br>' +
    '  已知一边及其对角加另一条信息时使用。求角时翻转为 $\\frac{\\sin A}{a}$。<br>' +
    '• <b>余弦定理</b>（求边）：$a^2 = b^2 + c^2 - 2bc \\cos A$（SAS 时使用）<br>' +
    '• <b>余弦定理</b>（求角）：$\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$（SSS 时使用）<br>' +
    '• <b>三角形面积</b>：$\\text{Area} = \\frac{1}{2}ab \\sin C$（已知两边及夹角时使用）<br>' +
    '• <b>3D 三角学</b>：在立体图形中找出直角三角形，再用 SOHCAHTOA 或正弦/余弦定理。<br>' +
    '• <b>直线与平面的夹角</b>：从点向平面作垂线，在所形成的直角三角形中求角。<br><br>' +
    '<b>考试技巧</b><br>' +
    '画好三角形并清晰标注。判断用哪条定理：正弦定理需要一对（边+对角）；余弦定理需要 SAS 或 SSS。'
});

add('hhk', 'Y11.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'In triangle $ABC$, $a = 8$ cm, $b = 11$ cm and angle $C = 37°$. Find the area of the triangle.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\text{Area} = \\frac{1}{2}ab \\sin C$<br>' +
    '$= \\frac{1}{2} \\times 8 \\times 11 \\times \\sin 37°$<br>' +
    '$= 44 \\times 0.6018...$<br>' +
    '$= 26.5$ cm$^2$ (3 sf)<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    'In triangle $PQR$, $PQ = 9$ cm, $QR = 12$ cm, and $PR = 7$ cm. Find angle $Q$.<br><br>' +
    '<b>Solution:</b><br>' +
    'We have all three sides (SSS), so use the cosine rule to find angle $Q$.<br>' +
    'Side opposite $Q$ is $PR = 7$ cm, so $q = 7$, $p = 12$, $r = 9$.<br>' +
    '$\\cos Q = \\frac{p^2 + r^2 - q^2}{2pr}$<br>' +
    '$= \\frac{144 + 81 - 49}{2 \\times 12 \\times 9}$<br>' +
    '$= \\frac{176}{216} = 0.8148...$<br>' +
    '$Q = \\cos^{-1}(0.8148) = 35.4°$ (1 dp)<br><br>' +
    '<b>Exam Tip:</b> For SSS problems, always use the cosine rule. Label the side opposite the angle you want to find as the "odd one out" in the formula.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '在三角形 $ABC$ 中，$a = 8$ cm，$b = 11$ cm，角 $C = 37°$。求三角形面积。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\text{面积} = \\frac{1}{2}ab \\sin C$<br>' +
    '$= \\frac{1}{2} \\times 8 \\times 11 \\times \\sin 37°$<br>' +
    '$= 44 \\times 0.6018...$<br>' +
    '$= 26.5$ cm$^2$（保留 3 位有效数字）<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '在三角形 $PQR$ 中，$PQ = 9$ cm，$QR = 12$ cm，$PR = 7$ cm。求角 $Q$。<br><br>' +
    '<b>解答：</b><br>' +
    '已知三边（SSS），用余弦定律求角 $Q$。<br>' +
    '$Q$ 的对边是 $PR = 7$ cm，所以 $q = 7$，$p = 12$，$r = 9$。<br>' +
    '$\\cos Q = \\frac{p^2 + r^2 - q^2}{2pr}$<br>' +
    '$= \\frac{144 + 81 - 49}{2 \\times 12 \\times 9}$<br>' +
    '$= \\frac{176}{216} = 0.8148...$<br>' +
    '$Q = \\cos^{-1}(0.8148) = 35.4°$（保留 1 位小数）<br><br>' +
    '<b>考试技巧：</b>SSS 问题一定用余弦定律。把要求的角的对边作为公式中的"目标边"来标注。'
});

add('hhk', 'Y11.8', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• $\\sin$, $\\cos$, and $\\tan$ are trigonometric functions that can be graphed for all angles.<br>' +
    '• Angles are measured in degrees (this section covers $0°$ to $360°$).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>$y = \\sin x$</b>: wave shape, passes through $(0°, 0)$, max $= 1$ at $90°$, min $= -1$ at $270°$, period $= 360°$, amplitude $= 1$.<br>' +
    '• <b>$y = \\cos x$</b>: same wave shape as $\\sin x$ but shifted left by $90°$. Passes through $(0°, 1)$, max $= 1$ at $0°$ and $360°$, min $= -1$ at $180°$, period $= 360°$, amplitude $= 1$.<br>' +
    '• <b>$y = \\tan x$</b>: repeating curve with vertical asymptotes at $90°$ and $270°$. Period $= 180°$. No amplitude (range is all real numbers). Passes through $(0°, 0)$ and $(180°, 0)$.<br>' +
    '• <b>Period</b>: the horizontal length of one complete cycle.<br>' +
    '• <b>Amplitude</b>: half the distance between the max and min values (for sin and cos only).<br>' +
    '• For $y = a \\sin(bx) + c$: amplitude $= |a|$, period $= \\frac{360°}{b}$, vertical shift $= c$.<br>' +
    '• <b>Solving trig equations</b> for $0° \\leq x \\leq 360°$:<br>' +
    '  Use the graph or CAST diagram to find all solutions in the given range.<br>' +
    '  $\\sin x = k$: solutions at $x$ and $180° - x$.<br>' +
    '  $\\cos x = k$: solutions at $x$ and $360° - x$.<br>' +
    '  $\\tan x = k$: solutions at $x$ and $x + 180°$.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Sketch the graph to check how many solutions there are. Most trig equations have 2 solutions in $0°$-$360°$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\tan x$ has no amplitude and is undefined at $90°$ and $270°$. Never include these values as solutions.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• $\\sin$、$\\cos$、$\\tan$ 是三角函数，可以对所有角度画图。<br>' +
    '• 角度以度为单位（本节涵盖 $0°$ 到 $360°$）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>$y = \\sin x$</b>：波浪形，过 $(0°, 0)$，最大值 $= 1$（在 $90°$），最小值 $= -1$（在 $270°$），周期 $= 360°$，振幅 $= 1$。<br>' +
    '• <b>$y = \\cos x$</b>：与 $\\sin x$ 相同的波形但左移 $90°$。过 $(0°, 1)$，最大值 $= 1$（在 $0°$ 和 $360°$），最小值 $= -1$（在 $180°$），周期 $= 360°$，振幅 $= 1$。<br>' +
    '• <b>$y = \\tan x$</b>：重复曲线，在 $90°$ 和 $270°$ 有垂直渐近线。周期 $= 180°$。无振幅（值域为全体实数）。过 $(0°, 0)$ 和 $(180°, 0)$。<br>' +
    '• <b>周期</b>：一个完整循环的水平长度。<br>' +
    '• <b>振幅</b>：最大值与最小值之差的一半（仅适用于 sin 和 cos）。<br>' +
    '• 对于 $y = a \\sin(bx) + c$：振幅 $= |a|$，周期 $= \\frac{360°}{b}$，垂直平移 $= c$。<br>' +
    '• 在 $0° \\leq x \\leq 360°$ 范围内<b>解三角方程</b>：<br>' +
    '  用图像或 CAST 图找出所有解。<br>' +
    '  $\\sin x = k$：解为 $x$ 和 $180° - x$。<br>' +
    '  $\\cos x = k$：解为 $x$ 和 $360° - x$。<br>' +
    '  $\\tan x = k$：解为 $x$ 和 $x + 180°$。<br><br>' +
    '<b>考试技巧</b><br>' +
    '画草图确认有多少个解。大多数三角方程在 $0°$-$360°$ 范围内有 2 个解。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\tan x$ 没有振幅，在 $90°$ 和 $270°$ 处无定义。不要将这些值作为解。'
});

add('hhk', 'Y11.8', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Solve $\\sin x = 0.5$ for $0° \\leq x \\leq 360°$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$x = \\sin^{-1}(0.5) = 30°$<br>' +
    'Sine is also positive in the second quadrant:<br>' +
    '$x = 180° - 30° = 150°$<br>' +
    'Solutions: $x = 30°$ and $x = 150°$<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Solve $2\\cos x + 1 = 0$ for $0° \\leq x \\leq 360°$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$2\\cos x = -1$<br>' +
    '$\\cos x = -0.5$<br>' +
    '$x = \\cos^{-1}(-0.5) = 120°$<br>' +
    'Cosine is also negative in the third quadrant:<br>' +
    '$x = 360° - 120° = 240°$<br>' +
    'Solutions: $x = 120°$ and $x = 240°$<br><br>' +
    '<b>Exam Tip:</b> Use the CAST diagram: All trig functions are positive in Q1, only Sin in Q2, only Tan in Q3, only Cos in Q4.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '在 $0° \\leq x \\leq 360°$ 范围内解 $\\sin x = 0.5$。<br><br>' +
    '<b>解答：</b><br>' +
    '$x = \\sin^{-1}(0.5) = 30°$<br>' +
    '正弦在第二象限也为正：<br>' +
    '$x = 180° - 30° = 150°$<br>' +
    '解：$x = 30°$ 和 $x = 150°$<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '在 $0° \\leq x \\leq 360°$ 范围内解 $2\\cos x + 1 = 0$。<br><br>' +
    '<b>解答：</b><br>' +
    '$2\\cos x = -1$<br>' +
    '$\\cos x = -0.5$<br>' +
    '$x = \\cos^{-1}(-0.5) = 120°$<br>' +
    '余弦在第三象限也为负：<br>' +
    '$x = 360° - 120° = 240°$<br>' +
    '解：$x = 120°$ 和 $x = 240°$<br><br>' +
    '<b>考试技巧：</b>使用 CAST 图：第一象限所有三角函数为正，第二象限仅 Sin 为正，第三象限仅 Tan 为正，第四象限仅 Cos 为正。'
});

add('hhk', 'Y11.9', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Inequalities use $<$, $>$, $\\leq$, $\\geq$ instead of $=$.<br>' +
    '• A linear inequality in two variables, e.g. $y < 2x + 1$, represents a half-plane on a graph.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Graphing an inequality</b>:<br>' +
    '  1. Draw the boundary line $y = 2x + 1$.<br>' +
    '  2. Use a <b>solid line</b> for $\\leq$ or $\\geq$; a <b>dashed line</b> for $<$ or $>$.<br>' +
    '  3. Test a point (e.g. $(0, 0)$) to decide which side to shade.<br>' +
    '  4. Shade the <b>unwanted</b> region (the required region is left unshaded).<br>' +
    '• <b>Identifying regions</b>: the feasible region satisfies ALL inequalities simultaneously. It is the unshaded area where all conditions overlap.<br>' +
    '• <b>Multiple inequalities</b>: graph each boundary line, shade the unwanted side of each. The remaining unshaded region is the solution set.<br>' +
    '• <b>Linear programming</b>: find the maximum or minimum value of an expression (objective function) subject to constraints. The optimal value occurs at a <b>vertex</b> of the feasible region. Test all vertices.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always shade the region you do NOT want. Label the required region with the letter $R$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'A dashed line means points ON the line are NOT included. Be careful to match the correct line style to the inequality sign.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 不等式使用 $<$、$>$、$\\leq$、$\\geq$ 而非 $=$。<br>' +
    '• 含两个变量的线性不等式（如 $y < 2x + 1$）在图上表示一个半平面。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>画不等式</b>：<br>' +
    '  1. 画出边界线 $y = 2x + 1$。<br>' +
    '  2. $\\leq$ 或 $\\geq$ 用<b>实线</b>；$<$ 或 $>$ 用<b>虚线</b>。<br>' +
    '  3. 代入测试点（如 $(0, 0)$）判断涂哪一侧。<br>' +
    '  4. 涂掉<b>不需要</b>的区域（所求区域保持空白）。<br>' +
    '• <b>识别区域</b>：可行域同时满足所有不等式。它是所有条件重叠后的未涂色区域。<br>' +
    '• <b>多个不等式</b>：画出每条边界线，涂掉每条线不需要的一侧。剩下的未涂色区域就是解集。<br>' +
    '• <b>线性规划</b>：在约束条件下，求表达式（目标函数）的最大值或最小值。最优值出现在可行域的<b>顶点</b>处。逐个检验所有顶点。<br><br>' +
    '<b>考试技巧</b><br>' +
    '始终涂掉不需要的区域。用字母 $R$ 标注所求区域。<br><br>' +
    '<b>注意！</b><br>' +
    '虚线表示线上的点不包含在内。注意线型与不等号的对应关系。'
});

add('hhk', 'Y11.9', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'On a graph, show the region satisfying $x \\geq 1$, $y \\geq 0$, and $y \\leq 4 - x$.<br><br>' +
    '<b>Solution:</b><br>' +
    '1. Draw $x = 1$ as a solid vertical line. Shade left (unwanted).<br>' +
    '2. Draw $y = 0$ (the $x$-axis) as a solid line. Shade below (unwanted).<br>' +
    '3. Draw $y = 4 - x$ as a solid line through $(0, 4)$ and $(4, 0)$. Shade above (unwanted).<br>' +
    '4. The unshaded triangular region with vertices $(1, 0)$, $(4, 0)$, $(1, 3)$ is the solution. Label it $R$.<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'A shop sells chairs ($x$) and tables ($y$). Constraints: $x + y \\leq 20$, $x \\geq 4$, $y \\geq 2$. Profit $= 30x + 50y$. Find the maximum profit.<br><br>' +
    '<b>Solution:</b><br>' +
    'Vertices of the feasible region:<br>' +
    '$(4, 2)$: Profit $= 120 + 100 = 220$<br>' +
    '$(18, 2)$: Profit $= 540 + 100 = 640$<br>' +
    '$(4, 16)$: Profit $= 120 + 800 = 920$<br>' +
    'Maximum profit $= 920$ at $(4, 16)$: 4 chairs and 16 tables.<br><br>' +
    '<b>Exam Tip:</b> In linear programming, always list ALL vertices and test each one. The maximum or minimum MUST occur at a vertex.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '在图上画出满足 $x \\geq 1$、$y \\geq 0$、$y \\leq 4 - x$ 的区域。<br><br>' +
    '<b>解答：</b><br>' +
    '1. 画 $x = 1$ 为实线竖线。涂掉左侧（不需要的区域）。<br>' +
    '2. 画 $y = 0$（$x$ 轴）为实线。涂掉下方。<br>' +
    '3. 画 $y = 4 - x$ 为实线，过 $(0, 4)$ 和 $(4, 0)$。涂掉上方。<br>' +
    '4. 未涂色的三角形区域，顶点为 $(1, 0)$、$(4, 0)$、$(1, 3)$，即为所求区域。标注 $R$。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '一家店销售椅子（$x$）和桌子（$y$）。约束条件：$x + y \\leq 20$，$x \\geq 4$，$y \\geq 2$。利润 $= 30x + 50y$。求最大利润。<br><br>' +
    '<b>解答：</b><br>' +
    '可行域的顶点：<br>' +
    '$(4, 2)$：利润 $= 120 + 100 = 220$<br>' +
    '$(18, 2)$：利润 $= 540 + 100 = 640$<br>' +
    '$(4, 16)$：利润 $= 120 + 800 = 920$<br>' +
    '最大利润 $= 920$，在 $(4, 16)$ 处取得：4 把椅子和 16 张桌子。<br><br>' +
    '<b>考试技巧：</b>线性规划中，必须列出所有顶点并逐一检验。最大值或最小值一定出现在顶点处。'
});

add('hhk', 'Y11.10', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>vector</b> has both magnitude (size) and direction.<br>' +
    '• Column vector: $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ means move $x$ units right and $y$ units up.<br>' +
    '• Vectors are written as $\\mathbf{a}$ (bold) or $\\overrightarrow{AB}$ (from $A$ to $B$).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• <b>Translation</b>: a vector $\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ translates every point 3 right and 2 down.<br>' +
    '• <b>Addition</b>: $\\begin{pmatrix} a \\\\ b \\end{pmatrix} + \\begin{pmatrix} c \\\\ d \\end{pmatrix} = \\begin{pmatrix} a+c \\\\ b+d \\end{pmatrix}$. Geometrically: go along the first vector, then the second (nose-to-tail).<br>' +
    '• <b>Subtraction</b>: $\\mathbf{a} - \\mathbf{b} = \\mathbf{a} + (-\\mathbf{b})$.<br>' +
    '• <b>Scalar multiplication</b>: $k\\begin{pmatrix} a \\\\ b \\end{pmatrix} = \\begin{pmatrix} ka \\\\ kb \\end{pmatrix}$. If $k > 0$: same direction, scaled by $k$. If $k < 0$: reversed direction.<br>' +
    '• <b>Magnitude</b>: $|\\mathbf{a}| = \\sqrt{x^2 + y^2}$ for $\\mathbf{a} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$.<br>' +
    '• <b>Directed line segments</b>: $\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a}$ where $\\mathbf{a}$ and $\\mathbf{b}$ are position vectors of $A$ and $B$.<br>' +
    '• <b>Parallel vectors</b>: $\\mathbf{p}$ is parallel to $\\mathbf{q}$ if $\\mathbf{p} = k\\mathbf{q}$ for some scalar $k$.<br>' +
    '• <b>Vector geometry proofs</b>: express vectors in terms of $\\mathbf{a}$ and $\\mathbf{b}$, then show two vectors are parallel (one is a scalar multiple of the other) or that points are collinear.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'To find $\\overrightarrow{AB}$, always go: $-\\mathbf{a} + \\mathbf{b}$ (go backwards from $A$ to the origin, then forwards to $B$).<br><br>' +
    '<b>Watch Out!</b><br>' +
    '$\\overrightarrow{AB} = -\\overrightarrow{BA}$. Direction matters! Also, showing vectors are parallel does NOT prove collinearity — you must show they share a common point.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>向量</b>同时具有大小和方向。<br>' +
    '• 列向量：$\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ 表示向右移 $x$ 个单位，向上移 $y$ 个单位。<br>' +
    '• 向量写作 $\\mathbf{a}$（粗体）或 $\\overrightarrow{AB}$（从 $A$ 到 $B$）。<br><br>' +
    '<b>关键技能</b><br>' +
    '• <b>平移</b>：向量 $\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ 将每个点向右移 3、向下移 2。<br>' +
    '• <b>加法</b>：$\\begin{pmatrix} a \\\\ b \\end{pmatrix} + \\begin{pmatrix} c \\\\ d \\end{pmatrix} = \\begin{pmatrix} a+c \\\\ b+d \\end{pmatrix}$。几何意义：沿第一个向量走，再沿第二个走（首尾相连）。<br>' +
    '• <b>减法</b>：$\\mathbf{a} - \\mathbf{b} = \\mathbf{a} + (-\\mathbf{b})$。<br>' +
    '• <b>数乘</b>：$k\\begin{pmatrix} a \\\\ b \\end{pmatrix} = \\begin{pmatrix} ka \\\\ kb \\end{pmatrix}$。$k > 0$ 同向放缩；$k < 0$ 反向。<br>' +
    '• <b>模</b>：$|\\mathbf{a}| = \\sqrt{x^2 + y^2}$，其中 $\\mathbf{a} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$。<br>' +
    '• <b>有向线段</b>：$\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a}$，其中 $\\mathbf{a}$、$\\mathbf{b}$ 是 $A$、$B$ 的位置向量。<br>' +
    '• <b>平行向量</b>：若 $\\mathbf{p} = k\\mathbf{q}$（$k$ 为标量），则 $\\mathbf{p}$ 与 $\\mathbf{q}$ 平行。<br>' +
    '• <b>向量几何证明</b>：用 $\\mathbf{a}$ 和 $\\mathbf{b}$ 表示向量，再证明两个向量平行（一个是另一个的标量倍数）或三点共线。<br><br>' +
    '<b>考试技巧</b><br>' +
    '求 $\\overrightarrow{AB}$ 时，总是走：$-\\mathbf{a} + \\mathbf{b}$（从 $A$ 回到原点，再到 $B$）。<br><br>' +
    '<b>注意！</b><br>' +
    '$\\overrightarrow{AB} = -\\overrightarrow{BA}$，方向很重要！另外，证明向量平行并不能证明共线——还必须证明它们有公共点。'
});

add('hhk', 'Y11.10', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    '$\\mathbf{a} = \\begin{pmatrix} 3 \\\\ -1 \\end{pmatrix}$ and $\\mathbf{b} = \\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix}$. Find $2\\mathbf{a} + \\mathbf{b}$ and $|2\\mathbf{a} + \\mathbf{b}|$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$2\\mathbf{a} = \\begin{pmatrix} 6 \\\\ -2 \\end{pmatrix}$<br>' +
    '$2\\mathbf{a} + \\mathbf{b} = \\begin{pmatrix} 6 + (-2) \\\\ -2 + 5 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}$<br>' +
    '$|2\\mathbf{a} + \\mathbf{b}| = \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5$<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    '$OABC$ is a parallelogram. $\\overrightarrow{OA} = \\mathbf{a}$ and $\\overrightarrow{OC} = \\mathbf{c}$. $M$ is the midpoint of $AB$. Find $\\overrightarrow{OM}$ in terms of $\\mathbf{a}$ and $\\mathbf{c}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\overrightarrow{OB} = \\overrightarrow{OA} + \\overrightarrow{AB} = \\mathbf{a} + \\mathbf{c}$ (since $\\overrightarrow{AB} = \\overrightarrow{OC} = \\mathbf{c}$)<br>' +
    '$M$ is the midpoint of $AB$, so $\\overrightarrow{AM} = \\frac{1}{2}\\overrightarrow{AB} = \\frac{1}{2}\\mathbf{c}$<br>' +
    '$\\overrightarrow{OM} = \\overrightarrow{OA} + \\overrightarrow{AM} = \\mathbf{a} + \\frac{1}{2}\\mathbf{c}$<br><br>' +
    '<b>Exam Tip:</b> Always build a route from one point to another using known vectors. For parallelograms, opposite sides are equal vectors.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '$\\mathbf{a} = \\begin{pmatrix} 3 \\\\ -1 \\end{pmatrix}$，$\\mathbf{b} = \\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix}$。求 $2\\mathbf{a} + \\mathbf{b}$ 和 $|2\\mathbf{a} + \\mathbf{b}|$。<br><br>' +
    '<b>解答：</b><br>' +
    '$2\\mathbf{a} = \\begin{pmatrix} 6 \\\\ -2 \\end{pmatrix}$<br>' +
    '$2\\mathbf{a} + \\mathbf{b} = \\begin{pmatrix} 6 + (-2) \\\\ -2 + 5 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}$<br>' +
    '$|2\\mathbf{a} + \\mathbf{b}| = \\sqrt{4^2 + 3^2} = \\sqrt{25} = 5$<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '$OABC$ 是平行四边形。$\\overrightarrow{OA} = \\mathbf{a}$，$\\overrightarrow{OC} = \\mathbf{c}$。$M$ 是 $AB$ 的中点。用 $\\mathbf{a}$ 和 $\\mathbf{c}$ 表示 $\\overrightarrow{OM}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\overrightarrow{OB} = \\overrightarrow{OA} + \\overrightarrow{AB} = \\mathbf{a} + \\mathbf{c}$（因为 $\\overrightarrow{AB} = \\overrightarrow{OC} = \\mathbf{c}$）<br>' +
    '$M$ 是 $AB$ 的中点，所以 $\\overrightarrow{AM} = \\frac{1}{2}\\overrightarrow{AB} = \\frac{1}{2}\\mathbf{c}$<br>' +
    '$\\overrightarrow{OM} = \\overrightarrow{OA} + \\overrightarrow{AM} = \\mathbf{a} + \\frac{1}{2}\\mathbf{c}$<br><br>' +
    '<b>考试技巧：</b>始终用已知向量构建从一点到另一点的路径。平行四边形中，对边是相等的向量。'
});

add('hhk', 'Y11.11', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>scatter diagram</b> plots pairs of data values as points on a graph to look for a relationship.<br>' +
    '• <b>Correlation</b> describes the relationship: positive (both increase), negative (one increases, the other decreases), or none (no pattern).<br>' +
    '• A <b>line of best fit</b> is a straight line drawn through the middle of the data that follows the trend.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Draw and interpret scatter diagrams. Identify <b>outliers</b> (points far from the trend).<br>' +
    '• Use the line of best fit to <b>interpolate</b> (estimate within the data range) — reliable.<br>' +
    '• <b>Extrapolation</b> (estimating beyond the data range) is unreliable.<br>' +
    '• <b>Correlation does not imply causation</b>.<br>' +
    '• <b>Cumulative frequency</b>: a running total of frequencies. Plot the upper boundary of each class against the cumulative frequency.<br>' +
    '• From a cumulative frequency graph, read off:<br>' +
    '  — <b>Median</b>: at $\\frac{n}{2}$ on the $y$-axis.<br>' +
    '  — <b>Lower quartile (Q1)</b>: at $\\frac{n}{4}$.<br>' +
    '  — <b>Upper quartile (Q3)</b>: at $\\frac{3n}{4}$.<br>' +
    '  — <b>Interquartile range (IQR)</b> $= Q3 - Q1$.<br>' +
    '• <b>Box plot</b> (box-and-whisker diagram): shows min, Q1, median, Q3, max. The box covers the IQR.<br>' +
    '• IQR measures the spread of the middle 50% of the data. A smaller IQR means more consistent data.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When comparing two data sets, always compare a measure of average (e.g. median) AND a measure of spread (e.g. IQR). Use the data to explain which is "better".<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Cumulative frequency is always plotted at the <b>upper boundary</b> of each class interval, not the midpoint.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>散点图</b>将成对数据值画成图上的点，观察它们之间的关系。<br>' +
    '• <b>相关性</b>描述关系：正相关（同增）、负相关（一增一减）、无相关（无规律）。<br>' +
    '• <b>最佳拟合线</b>是穿过数据中间、跟随趋势的直线。<br><br>' +
    '<b>关键技能</b><br>' +
    '• 画和解读散点图。识别<b>离群值</b>（远离趋势的点）。<br>' +
    '• 用最佳拟合线进行<b>内插</b>（在数据范围内估算）——可靠。<br>' +
    '• <b>外推</b>（超出数据范围的估算）不可靠。<br>' +
    '• <b>相关不等于因果</b>。<br>' +
    '• <b>累积频率</b>：频率的累加总和。将每组的上界对应累积频率画点。<br>' +
    '• 从累积频率图中读取：<br>' +
    '  — <b>中位数</b>：$y$ 轴上 $\\frac{n}{2}$ 处。<br>' +
    '  — <b>下四分位数 (Q1)</b>：$\\frac{n}{4}$ 处。<br>' +
    '  — <b>上四分位数 (Q3)</b>：$\\frac{3n}{4}$ 处。<br>' +
    '  — <b>四分位距 (IQR)</b> $= Q3 - Q1$。<br>' +
    '• <b>箱线图</b>：显示最小值、Q1、中位数、Q3、最大值。箱体覆盖 IQR。<br>' +
    '• IQR 衡量中间 50% 数据的离散程度。IQR 越小，数据越一致。<br><br>' +
    '<b>考试技巧</b><br>' +
    '比较两组数据时，一定要同时比较一个平均值指标（如中位数）和一个离散程度指标（如 IQR）。用数据来解释哪个"更好"。<br><br>' +
    '<b>注意！</b><br>' +
    '累积频率始终画在每组的<b>上界</b>处，而不是中值处。'
});

add('hhk', 'Y11.11', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A scatter diagram shows hours of revision vs exam score. The data shows a positive correlation. A student revises for 5 hours and the line of best fit gives a score of 64. Another student claims that revising for 20 hours guarantees a score of 100. Comment on this claim.<br><br>' +
    '<b>Solution:</b><br>' +
    'The data range for revision hours is 1-8 hours. Predicting a score for 20 hours is <b>extrapolation</b> — this is unreliable because we do not know if the trend continues beyond the data range. The claim cannot be justified.<br><br>' +
    '<b>Worked Example 2</b> [5 marks]<br>' +
    'The cumulative frequency curve for 80 students\' test marks gives: Q1 $= 42$, Median $= 56$, Q3 $= 67$. Draw a box plot and find the IQR. The minimum mark is 15 and the maximum is 92.<br><br>' +
    '<b>Solution:</b><br>' +
    'IQR $= Q3 - Q1 = 67 - 42 = 25$<br><br>' +
    'Box plot: draw a number line from 0 to 100.<br>' +
    '• Left whisker from $15$ to $42$ (min to Q1).<br>' +
    '• Box from $42$ to $67$ (Q1 to Q3).<br>' +
    '• Line inside the box at $56$ (median).<br>' +
    '• Right whisker from $67$ to $92$ (Q3 to max).<br><br>' +
    'Interpretation: the middle 50% of students scored between 42 and 67. The median score was 56.<br><br>' +
    '<b>Exam Tip:</b> When reading values from a cumulative frequency graph, draw horizontal lines from the $y$-axis and read down to the $x$-axis. Show your working lines on the graph.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '散点图显示复习时长与考试成绩的关系。数据显示正相关。一名学生复习了 5 小时，最佳拟合线给出分数为 64。另一名学生声称复习 20 小时一定能考 100 分。评论这一说法。<br><br>' +
    '<b>解答：</b><br>' +
    '复习时长的数据范围是 1-8 小时。预测 20 小时的成绩属于<b>外推</b>——这是不可靠的，因为我们不知道趋势在数据范围之外是否继续成立。该说法无法成立。<br><br>' +
    '<b>经典例题 2</b> [5 分]<br>' +
    '80 名学生考试成绩的累积频率曲线显示：Q1 $= 42$，中位数 $= 56$，Q3 $= 67$。画箱线图并求 IQR。最低分 15，最高分 92。<br><br>' +
    '<b>解答：</b><br>' +
    'IQR $= Q3 - Q1 = 67 - 42 = 25$<br><br>' +
    '箱线图：画一条 0 到 100 的数轴。<br>' +
    '• 左须线从 $15$ 到 $42$（最小值到 Q1）。<br>' +
    '• 箱体从 $42$ 到 $67$（Q1 到 Q3）。<br>' +
    '• 箱体内在 $56$ 处画线（中位数）。<br>' +
    '• 右须线从 $67$ 到 $92$（Q3 到最大值）。<br><br>' +
    '解读：中间 50% 的学生得分在 42 到 67 之间。中位数为 56 分。<br><br>' +
    '<b>考试技巧：</b>从累积频率图读数时，从 $y$ 轴画水平线，向下读到 $x$ 轴。在图上画出辅助线来展示过程。'
});


/* ══════════════════════════════════════════════════
   OUTPUT SQL
   ══════════════════════════════════════════════════ */
console.log('-- HHK section content seed: Y7-Y11 knowledge cards + worked examples');
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
