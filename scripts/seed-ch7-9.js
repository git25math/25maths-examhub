#!/usr/bin/env node
// Seed: CIE Ch7 (Transformations & Vectors) + Ch8 (Probability) + Ch9 (Statistics)
// Usage: node scripts/seed-ch7-9.js > scripts/seed-ch7-9.sql

var edits = [];
function add(board, id, module, data) {
  edits.push({ board: board, section_id: id, module: module, data: data });
}

/* ══════════════════════════════════════════════════
   CIE 0580 — Chapter 7: Transformations and vectors (7.1 – 7.4)
   ══════════════════════════════════════════════════ */

// ── 7.1 Transformations ──
add('cie', '7.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Translation</b>: every point moves by the same vector $\\binom{a}{b}$. Shape and size unchanged.<br>' +
    '• <b>Reflection</b>: mirror image in a line. Give the <b>equation</b> of the mirror line (e.g. $y = x$, $x = 3$).<br>' +
    '• <b>Rotation</b>: turn about a fixed point. Give <b>centre</b>, <b>angle</b>, and <b>direction</b> (clockwise/anticlockwise).<br>' +
    '• <b>Enlargement</b>: scale from a centre. Give <b>centre</b> and <b>scale factor</b> $k$.<br>' +
    '&nbsp;&nbsp;$k > 1$: larger. $0 < k < 1$: smaller. $k < 0$: inverted (Extended).<br><br>' +
    '<b>Extended Only</b><br>' +
    '• <b>Shear</b>: shape distorted parallel to an invariant line. Shear factor $= \\frac{\\text{displacement}}{\\text{distance from invariant line}}$.<br>' +
    '• <b>Stretch</b>: enlargement in one direction only. Perpendicular to an invariant line. Stretch factor $= \\frac{\\text{new distance}}{\\text{original distance}}$.<br>' +
    '• <b>Transformation matrices</b> (2×2): rotation, reflection, enlargement, shear, stretch.<br><br>' +
    '<b>Exam Tip</b><br>' +
    '"Describe fully" = name + all details. Miss the centre of rotation = lose a mark.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>平移</b>：每个点都移动相同的向量 $\\binom{a}{b}$。形状和大小保持不变。<br>' +
    '• <b>反射</b>：关于一条线的镜像。给出反射轴的<b>方程</b>（例如 $y = x$，$x = 3$）。<br>' +
    '• <b>旋转</b>：绕固定点旋转。给出<b>中心</b>、<b>角度</b>和<b>方向</b>（顺时针/逆时针）。<br>' +
    '• <b>位似（放大/缩小）</b>：从一个中心按比例缩放。给出<b>中心</b>和<b>比例因子</b> $k$。<br>' +
    '&nbsp;&nbsp;$k > 1$：放大。$0 < k < 1$：缩小。$k < 0$：倒置（仅限进阶）。<br>' +
    '<br>' +
    '<b>仅限进阶 (Extended Only)</b><br>' +
    '• <b>剪切</b>：形状平行于不变线发生扭曲。剪切因子 $= \\frac{\\text{位移}}{\\text{到不变线的距离}}$。<br>' +
    '• <b>拉伸</b>：仅在一个方向上位似。垂直于一条不变线。拉伸因子 $= \\frac{\\text{新距离}}{\\text{原距离}}$。<br>' +
    '• <b>变换矩阵</b> (2×2)：旋转、反射、位似、剪切、拉伸。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '"完整描述" = 名称 + 所有细节。遗漏旋转中心 = 扣一分。'
});

add('cie', '7.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Describe fully the single transformation that maps $A(1,2)$, $B(3,2)$, $C(3,4)$ to $A\'(-2,1)$, $B\'(-2,3)$, $C\'(-4,3)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$(x,y) \\rightarrow (-y, x)$: this is a <b>rotation</b>, $90°$ <b>anticlockwise</b>, centre <b>$(0,0)$</b>.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'Triangle $P$ is reflected in the line $y = -x$ to give triangle $Q$. Describe the single transformation from $P$ to $Q$.<br><br>' +
    '<b>Solution:</b><br>' +
    '<b>Reflection</b> in the line $y = -x$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'Triangle $A$ has vertices $(2,1)$, $(4,1)$, $(4,3)$. It is enlarged by scale factor $\\frac{1}{2}$, centre $(0,0)$. Find the vertices of the image.<br><br>' +
    '<b>Solution:</b><br>' +
    'Multiply each coordinate by $\\frac{1}{2}$:<br>' +
    '$(2,1) \\rightarrow (1, 0.5)$, $(4,1) \\rightarrow (2, 0.5)$, $(4,3) \\rightarrow (2, 1.5)$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    'Shape $S$ is translated by vector $\\binom{-3}{4}$ to give shape $T$. Vertex $P$ of $S$ is at $(5,2)$. Find the position of $P$ on $T$, and describe fully the single transformation that maps $T$ back to $S$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$P\' = (5 + (-3),\\; 2 + 4) = (2, 6)$.<br>' +
    'Reverse: <b>Translation</b> by vector $\\binom{3}{-4}$.<br><br>' +
    '<b>Exam Tip:</b> "Describe fully" means name the transformation AND give all required details — miss one detail and you lose a mark.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '完整描述将 $A(1,2)$，$B(3,2)$，$C(3,4)$ 映射到 $A\'(-2,1)$，$B\'(-2,3)$，$C\'(-4,3)$ 的单一变换。<br><br>' +
    '<b>解答：</b><br>' +
    '$(x,y) \\rightarrow (-y, x)$：这是一个<b>旋转</b>，<b>逆时针</b> $90°$，中心为 <b>$(0,0)$</b>。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '三角形 $P$ 关于直线 $y = -x$ 对称得到三角形 $Q$。描述从 $P$ 到 $Q$ 的单一变换。<br><br>' +
    '<b>解答：</b><br>' +
    '关于直线 $y = -x$ 的<b>反射</b>。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '三角形 $A$ 的顶点为 $(2,1)$、$(4,1)$、$(4,3)$。以 $(0,0)$ 为中心，比例因子 $\\frac{1}{2}$ 进行位似变换。求像的顶点。<br><br>' +
    '<b>解答：</b><br>' +
    '每个坐标乘以 $\\frac{1}{2}$：<br>' +
    '$(2,1) \\rightarrow (1, 0.5)$，$(4,1) \\rightarrow (2, 0.5)$，$(4,3) \\rightarrow (2, 1.5)$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '图形 $S$ 通过向量 $\\binom{-3}{4}$ 平移得到图形 $T$。$S$ 的顶点 $P$ 在 $(5,2)$。求 $P$ 在 $T$ 上的位置，并完整描述将 $T$ 映射回 $S$ 的单一变换。<br><br>' +
    '<b>解答：</b><br>' +
    '$P\' = (5 + (-3),\\; 2 + 4) = (2, 6)$。<br>' +
    '逆变换：通过向量 $\\binom{3}{-4}$ 的<b>平移</b>。<br><br>' +
    '<b>考试技巧：</b>"完整描述"意味着说出变换名称并给出所有必需的细节——漏掉一个细节就扣一分。'
});

// ── 7.2 Vectors in 2D ──
add('cie', '7.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>vector</b> has magnitude and direction: $\\vec{AB}$, $\\mathbf{a}$, or $\\binom{x}{y}$.<br>' +
    '• <b>Column vector</b> $\\binom{3}{-2}$: 3 right, 2 down.<br>' +
    '• <b>Addition</b>: $\\binom{a}{b} + \\binom{c}{d} = \\binom{a+c}{b+d}$. <b>Subtraction</b>: $\\mathbf{a} - \\mathbf{b} = \\mathbf{a} + (-\\mathbf{b})$.<br>' +
    '• <b>Scalar multiplication</b>: $k\\binom{a}{b} = \\binom{ka}{kb}$.<br>' +
    '• $-\\mathbf{a}$ reverses direction. $\\vec{BA} = -\\vec{AB}$.<br>' +
    '• <b>Equal vectors</b>: same magnitude AND direction (same column vector).<br>' +
    '• <b>Parallel vectors</b>: one is a scalar multiple of the other.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Vectors are not the same as coordinates! $\\binom{3}{4}$ is a movement, not a position.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>向量</b>（矢量）具有大小和方向：$\\vec{AB}$，$\\mathbf{a}$，或 $\\binom{x}{y}$。<br>' +
    '• <b>列向量</b> $\\binom{3}{-2}$：向右 3，向下 2。<br>' +
    '• <b>加法</b>：$\\binom{a}{b} + \\binom{c}{d} = \\binom{a+c}{b+d}$。<b>减法</b>：$\\mathbf{a} - \\mathbf{b} = \\mathbf{a} + (-\\mathbf{b})$。<br>' +
    '• <b>数乘</b>：$k\\binom{a}{b} = \\binom{ka}{kb}$。<br>' +
    '• $-\\mathbf{a}$ 反转方向。$\\vec{BA} = -\\vec{AB}$。<br>' +
    '• <b>相等向量</b>：大小和方向均相同（列向量相同）。<br>' +
    '• <b>平行向量</b>：一个向量是另一个向量的倍数（数乘）。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '向量与坐标不同！$\\binom{3}{4}$ 表示一种移动，而不是一个位置。'
});

add('cie', '7.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    '$\\mathbf{p} = \\binom{4}{-3}$, $\\mathbf{q} = \\binom{-1}{5}$. Find (a) $\\mathbf{p} + 2\\mathbf{q}$, (b) show that $\\mathbf{p}$ and $\\binom{-8}{6}$ are parallel.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $\\mathbf{p} + 2\\mathbf{q} = \\binom{4}{-3} + \\binom{-2}{10} = \\binom{2}{7}$<br>' +
    '(b) $\\binom{-8}{6} = -2\\binom{4}{-3} = -2\\mathbf{p}$, so they are parallel (scalar multiple).<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    '$A = (1, 3)$ and $B = (5, 1)$. Find $\\vec{AB}$ as a column vector.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{AB} = \\binom{5-1}{1-3} = \\binom{4}{-2}$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    '$\\mathbf{a} = \\binom{2}{5}$ and $\\mathbf{b} = \\binom{-3}{1}$. Find the vector $3\\mathbf{a} - 2\\mathbf{b}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$3\\mathbf{a} = \\binom{6}{15}$, $2\\mathbf{b} = \\binom{-6}{2}$.<br>' +
    '$3\\mathbf{a} - 2\\mathbf{b} = \\binom{6-(-6)}{15-2} = \\binom{12}{13}$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    '$\\vec{PQ} = \\binom{6}{-8}$ and $\\vec{QR} = \\binom{-2}{3}$. Find $\\vec{PR}$ and determine whether $\\vec{PR}$ is parallel to $\\binom{2}{-2.5}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{PR} = \\vec{PQ} + \\vec{QR} = \\binom{6}{-8} + \\binom{-2}{3} = \\binom{4}{-5}$.<br>' +
    'Check: $\\binom{4}{-5} = 2\\binom{2}{-2.5}$. Yes, scalar multiple, so they are <b>parallel</b>.<br><br>' +
    '<b>Exam Tip:</b> To show vectors are parallel, find the scalar $k$ such that one vector $= k \\times$ the other. Both components must give the same $k$.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '$\\mathbf{p} = \\binom{4}{-3}$，$\\mathbf{q} = \\binom{-1}{5}$。求 (a) $\\mathbf{p} + 2\\mathbf{q}$，(b) 证明 $\\mathbf{p}$ 与 $\\binom{-8}{6}$ 平行。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $\\mathbf{p} + 2\\mathbf{q} = \\binom{4}{-3} + \\binom{-2}{10} = \\binom{2}{7}$<br>' +
    '(b) $\\binom{-8}{6} = -2\\binom{4}{-3} = -2\\mathbf{p}$，故平行（数乘关系）。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '$A = (1, 3)$，$B = (5, 1)$。将 $\\vec{AB}$ 表示为列向量。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{AB} = \\binom{5-1}{1-3} = \\binom{4}{-2}$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '$\\mathbf{a} = \\binom{2}{5}$，$\\mathbf{b} = \\binom{-3}{1}$。求向量 $3\\mathbf{a} - 2\\mathbf{b}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$3\\mathbf{a} = \\binom{6}{15}$，$2\\mathbf{b} = \\binom{-6}{2}$。<br>' +
    '$3\\mathbf{a} - 2\\mathbf{b} = \\binom{6-(-6)}{15-2} = \\binom{12}{13}$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '$\\vec{PQ} = \\binom{6}{-8}$，$\\vec{QR} = \\binom{-2}{3}$。求 $\\vec{PR}$，并判断 $\\vec{PR}$ 是否与 $\\binom{2}{-2.5}$ 平行。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{PR} = \\vec{PQ} + \\vec{QR} = \\binom{6}{-8} + \\binom{-2}{3} = \\binom{4}{-5}$。<br>' +
    '验证：$\\binom{4}{-5} = 2\\binom{2}{-2.5}$。是数乘关系，故<b>平行</b>。<br><br>' +
    '<b>考试技巧：</b>要证明向量平行，需找到标量 $k$ 使得一个向量 $= k \\times$ 另一个向量。两个分量必须得到相同的 $k$。'
});

// ── 7.3 Magnitude of a vector ──
add('cie', '7.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• The <b>magnitude</b> (modulus) of $\\mathbf{a} = \\binom{x}{y}$ is $|\\mathbf{a}| = \\sqrt{x^2 + y^2}$.<br>' +
    '• A <b>unit vector</b> has magnitude 1: $\\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Calculate the magnitude of a vector.<br>' +
    '• Find the distance between two points using $|\\vec{AB}|$.<br>' +
    '• Compare vector magnitudes to determine which is longer.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'The magnitude is always positive. $|\\mathbf{a}|$ is just Pythagoras applied to the components.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• $\\mathbf{a} = \\binom{x}{y}$ 的<b>模</b>（长度）为 $|\\mathbf{a}| = \\sqrt{x^2 + y^2}$。<br>' +
    '• <b>单位向量</b>的模为 1：$\\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}$。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 计算向量的模。<br>' +
    '• 使用 $|\\vec{AB}|$ 计算两点间的距离。<br>' +
    '• 比较向量的模以确定哪个更长。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '模总是正数。$|\\mathbf{a}|$ 只是对分量应用勾股定理。'
});

add('cie', '7.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    '$\\vec{AB} = \\binom{5}{-12}$. Find $|\\vec{AB}|$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$|\\vec{AB}| = \\sqrt{5^2 + (-12)^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    '$\\mathbf{v} = \\binom{3}{4}$. Find the unit vector in the direction of $\\mathbf{v}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$|\\mathbf{v}| = \\sqrt{9+16} = 5$. Unit vector $= \\frac{1}{5}\\binom{3}{4} = \\binom{0.6}{0.8}$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    '$P = (1, 4)$ and $Q = (7, -4)$. Calculate the distance $PQ$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{PQ} = \\binom{7-1}{-4-4} = \\binom{6}{-8}$.<br>' +
    '$|\\vec{PQ}| = \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    '$\\mathbf{a} = \\binom{-7}{24}$ and $\\mathbf{b} = \\binom{20}{15}$. Which vector has the greater magnitude?<br><br>' +
    '<b>Solution:</b><br>' +
    '$|\\mathbf{a}| = \\sqrt{(-7)^2 + 24^2} = \\sqrt{49 + 576} = \\sqrt{625} = 25$.<br>' +
    '$|\\mathbf{b}| = \\sqrt{20^2 + 15^2} = \\sqrt{400 + 225} = \\sqrt{625} = 25$.<br>' +
    'They have <b>equal</b> magnitude ($= 25$).<br><br>' +
    '<b>Exam Tip:</b> Magnitude is always positive. Use Pythagoras: $|\\mathbf{v}| = \\sqrt{x^2 + y^2}$. Don\'t forget to square negative components — the signs vanish.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '$\\vec{AB} = \\binom{5}{-12}$，求 $|\\vec{AB}|$。<br><br>' +
    '<b>解答：</b><br>' +
    '$|\\vec{AB}| = \\sqrt{5^2 + (-12)^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '$\\mathbf{v} = \\binom{3}{4}$，求 $\\mathbf{v}$ 方向上的单位向量。<br><br>' +
    '<b>解答：</b><br>' +
    '$|\\mathbf{v}| = \\sqrt{9+16} = 5$。单位向量 $= \\frac{1}{5}\\binom{3}{4} = \\binom{0.6}{0.8}$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '$P = (1, 4)$，$Q = (7, -4)$。计算距离 $PQ$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{PQ} = \\binom{7-1}{-4-4} = \\binom{6}{-8}$。<br>' +
    '$|\\vec{PQ}| = \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '$\\mathbf{a} = \\binom{-7}{24}$，$\\mathbf{b} = \\binom{20}{15}$。哪个向量的模更大？<br><br>' +
    '<b>解答：</b><br>' +
    '$|\\mathbf{a}| = \\sqrt{(-7)^2 + 24^2} = \\sqrt{49 + 576} = \\sqrt{625} = 25$。<br>' +
    '$|\\mathbf{b}| = \\sqrt{20^2 + 15^2} = \\sqrt{400 + 225} = \\sqrt{625} = 25$。<br>' +
    '两者的模<b>相等</b>（$= 25$）。<br><br>' +
    '<b>考试技巧：</b>模总是正数。用勾股定理：$|\\mathbf{v}| = \\sqrt{x^2 + y^2}$。不要忘记对负分量求平方——符号会消失。'
});

// ── 7.4 Vector geometry ──
add('cie', '7.4', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• Express position vectors and path vectors in terms of given vectors $\\mathbf{a}$ and $\\mathbf{b}$.<br>' +
    '• <b>Route finding</b>: $\\vec{AC} = \\vec{AB} + \\vec{BC}$ (go via known points).<br>' +
    '• <b>Midpoint</b>: $\\vec{OM} = \\frac{1}{2}(\\vec{OA} + \\vec{OB})$.<br>' +
    '• A point dividing $AB$ in ratio $m:n$: $\\vec{OP} = \\frac{n\\vec{OA} + m\\vec{OB}}{m+n}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Prove <b>collinearity</b>: show $\\vec{XY} = k\\vec{XZ}$ (one vector is scalar multiple of the other, sharing point $X$).<br>' +
    '• Prove <b>parallel lines</b>: show $\\vec{PQ} = k\\vec{RS}$ (scalar multiple, no shared point).<br>' +
    '• Prove a quadrilateral is a parallelogram: show opposite sides are equal vectors.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Work systematically: define $\\vec{OA} = \\mathbf{a}$, $\\vec{OB} = \\mathbf{b}$, then express everything in terms of $\\mathbf{a}$ and $\\mathbf{b}$.',
  content_zh:
    '<b>仅限拓展教材 (Extended Only)</b><br>' +
    '<br>' +
    '<b>知识回顾</b><br>' +
    '• 用给定的向量 $\\mathbf{a}$ 和 $\\mathbf{b}$ 表示位置向量和路径向量。<br>' +
    '• <b>寻找路径</b>：$\\vec{AC} = \\vec{AB} + \\vec{BC}$（通过已知点）。<br>' +
    '• <b>中点</b>：$\\vec{OM} = \\frac{1}{2}(\\vec{OA} + \\vec{OB})$。<br>' +
    '• 以比例 $m:n$ 分割 $AB$ 的点：$\\vec{OP} = \\frac{n\\vec{OA} + m\\vec{OB}}{m+n}$。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 证明<b>共线</b>：证明 $\\vec{XY} = k\\vec{XZ}$（其中一个向量是另一个向量的倍数，且共享点 $X$）。<br>' +
    '• 证明<b>平行线</b>：证明 $\\vec{PQ} = k\\vec{RS}$（倍数关系，无共享点）。<br>' +
    '• 证明一个四边形是平行四边形：证明对边是相等的向量。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '有系统地进行：定义 $\\vec{OA} = \\mathbf{a}$，$\\vec{OB} = \\mathbf{b}$，然后用 $\\mathbf{a}$ 和 $\\mathbf{b}$ 表示所有内容。'
});

add('cie', '7.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks — Extended]<br>' +
    '$\\vec{OA} = \\mathbf{a}$, $\\vec{OB} = \\mathbf{b}$. $M$ is the midpoint of $OA$, $N$ is the midpoint of $OB$. Show that $MN$ is parallel to $AB$ and $MN = \\frac{1}{2}AB$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{OM} = \\frac{1}{2}\\mathbf{a}$, $\\vec{ON} = \\frac{1}{2}\\mathbf{b}$.<br>' +
    '$\\vec{MN} = \\vec{MO} + \\vec{ON} = -\\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b} = \\frac{1}{2}(\\mathbf{b} - \\mathbf{a})$.<br>' +
    '$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$.<br>' +
    '$\\vec{MN} = \\frac{1}{2}\\vec{AB}$.<br>' +
    'Since $\\vec{MN}$ is a scalar multiple of $\\vec{AB}$, they are <b>parallel</b>. Since the scalar is $\\frac{1}{2}$, $MN = \\frac{1}{2}AB$. QED.<br><br>' +
    '<b>Worked Example 2</b> [4 marks — Extended]<br>' +
    '$\\vec{OA} = \\mathbf{a}$, $\\vec{OB} = \\mathbf{b}$. Point $P$ divides $AB$ in the ratio $1:3$. Find $\\vec{OP}$ in terms of $\\mathbf{a}$ and $\\mathbf{b}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$.<br>' +
    '$\\vec{AP} = \\frac{1}{4}\\vec{AB} = \\frac{1}{4}(\\mathbf{b} - \\mathbf{a})$.<br>' +
    '$\\vec{OP} = \\vec{OA} + \\vec{AP} = \\mathbf{a} + \\frac{1}{4}(\\mathbf{b} - \\mathbf{a}) = \\frac{3}{4}\\mathbf{a} + \\frac{1}{4}\\mathbf{b}$.<br><br>' +
    '<b>Worked Example 3</b> [5 marks — Extended]<br>' +
    '$\\vec{OA} = \\mathbf{a}$, $\\vec{OB} = \\mathbf{b}$, $\\vec{OC} = 3\\mathbf{b} - 2\\mathbf{a}$. Show that $A$, $B$, and $C$ are collinear.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{AB} = \\vec{OB} - \\vec{OA} = \\mathbf{b} - \\mathbf{a}$.<br>' +
    '$\\vec{AC} = \\vec{OC} - \\vec{OA} = 3\\mathbf{b} - 2\\mathbf{a} - \\mathbf{a} = 3\\mathbf{b} - 3\\mathbf{a} = 3(\\mathbf{b} - \\mathbf{a})$.<br>' +
    '$\\vec{AC} = 3\\vec{AB}$.<br>' +
    'Since $\\vec{AC}$ is a scalar multiple of $\\vec{AB}$ and they share point $A$, the points $A$, $B$, $C$ are <b>collinear</b>.<br><br>' +
    '<b>Worked Example 4</b> [4 marks — Extended]<br>' +
    'In parallelogram $OABC$, $\\vec{OA} = \\mathbf{a}$ and $\\vec{OC} = \\mathbf{c}$. $M$ is the midpoint of $AB$. Find $\\vec{OM}$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{OB} = \\vec{OA} + \\vec{AB} = \\mathbf{a} + \\mathbf{c}$ (since $\\vec{AB} = \\vec{OC} = \\mathbf{c}$).<br>' +
    '$M$ is the midpoint of $AB$, so $\\vec{AM} = \\frac{1}{2}\\vec{AB} = \\frac{1}{2}\\mathbf{c}$.<br>' +
    '$\\vec{OM} = \\vec{OA} + \\vec{AM} = \\mathbf{a} + \\frac{1}{2}\\mathbf{c}$.<br><br>' +
    '<b>Worked Example 5</b> [6 marks — Extended]<br>' +
    'In triangle $OAB$, $\\vec{OA} = \\mathbf{a}$ and $\\vec{OB} = \\mathbf{b}$. $P$ is the midpoint of $OA$ and $Q$ is the midpoint of $AB$. Find $\\vec{PQ}$ and show that $PQ$ is parallel to $OB$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\vec{OP} = \\frac{1}{2}\\mathbf{a}$.<br>' +
    '$\\vec{OQ} = \\vec{OA} + \\frac{1}{2}\\vec{AB} = \\mathbf{a} + \\frac{1}{2}(\\mathbf{b} - \\mathbf{a}) = \\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b}$.<br>' +
    '$\\vec{PQ} = \\vec{OQ} - \\vec{OP} = \\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b} - \\frac{1}{2}\\mathbf{a} = \\frac{1}{2}\\mathbf{b}$.<br>' +
    'Since $\\vec{PQ} = \\frac{1}{2}\\vec{OB}$, $\\vec{PQ}$ is a scalar multiple of $\\vec{OB}$, so $PQ$ is <b>parallel</b> to $OB$. Also $PQ = \\frac{1}{2}OB$. QED.<br><br>' +
    '<b>Exam Tip:</b> Always express your answer fully in terms of $\\mathbf{a}$ and $\\mathbf{b}$. To prove parallel, show one vector is a scalar multiple of the other. To prove collinear, you also need a shared point.',
  content_zh:
    '<b>经典例题 1</b> [4 分 — 进阶]<br>' +
    '$\\vec{OA} = \\mathbf{a}$，$\\vec{OB} = \\mathbf{b}$。$M$ 为 $OA$ 中点，$N$ 为 $OB$ 中点。证明 $MN \\parallel AB$ 且 $MN = \\frac{1}{2}AB$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{OM} = \\frac{1}{2}\\mathbf{a}$，$\\vec{ON} = \\frac{1}{2}\\mathbf{b}$。<br>' +
    '$\\vec{MN} = -\\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b} = \\frac{1}{2}(\\mathbf{b} - \\mathbf{a}) = \\frac{1}{2}\\vec{AB}$。<br>' +
    '标量倍数关系 → 平行，系数 $\\frac{1}{2}$ → 长度为一半。<br><br>' +
    '<b>经典例题 2</b> [4 分 — 进阶]<br>' +
    '$\\vec{OA} = \\mathbf{a}$，$\\vec{OB} = \\mathbf{b}$。点 $P$ 将 $AB$ 分成 $1:3$ 的比例。用 $\\mathbf{a}$ 和 $\\mathbf{b}$ 表示 $\\vec{OP}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$。<br>' +
    '$\\vec{AP} = \\frac{1}{4}\\vec{AB} = \\frac{1}{4}(\\mathbf{b} - \\mathbf{a})$。<br>' +
    '$\\vec{OP} = \\mathbf{a} + \\frac{1}{4}(\\mathbf{b} - \\mathbf{a}) = \\frac{3}{4}\\mathbf{a} + \\frac{1}{4}\\mathbf{b}$。<br><br>' +
    '<b>经典例题 3</b> [5 分 — 进阶]<br>' +
    '$\\vec{OA} = \\mathbf{a}$，$\\vec{OB} = \\mathbf{b}$，$\\vec{OC} = 3\\mathbf{b} - 2\\mathbf{a}$。证明 $A$、$B$、$C$ 三点共线。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$。<br>' +
    '$\\vec{AC} = 3\\mathbf{b} - 2\\mathbf{a} - \\mathbf{a} = 3\\mathbf{b} - 3\\mathbf{a} = 3(\\mathbf{b} - \\mathbf{a}) = 3\\vec{AB}$。<br>' +
    '由于 $\\vec{AC}$ 是 $\\vec{AB}$ 的数乘倍数，且共享点 $A$，故 $A$、$B$、$C$ <b>共线</b>。<br><br>' +
    '<b>经典例题 4</b> [4 分 — 进阶]<br>' +
    '平行四边形 $OABC$ 中，$\\vec{OA} = \\mathbf{a}$，$\\vec{OC} = \\mathbf{c}$。$M$ 为 $AB$ 的中点。求 $\\vec{OM}$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{AB} = \\vec{OC} = \\mathbf{c}$（平行四边形性质）。<br>' +
    '$\\vec{AM} = \\frac{1}{2}\\mathbf{c}$。<br>' +
    '$\\vec{OM} = \\vec{OA} + \\vec{AM} = \\mathbf{a} + \\frac{1}{2}\\mathbf{c}$。<br><br>' +
    '<b>经典例题 5</b> [6 分 — 进阶]<br>' +
    '在三角形 $OAB$ 中，$\\vec{OA} = \\mathbf{a}$，$\\vec{OB} = \\mathbf{b}$。$P$ 是 $OA$ 的中点，$Q$ 是 $AB$ 的中点。求 $\\vec{PQ}$ 并证明 $PQ \\parallel OB$。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\vec{OP} = \\frac{1}{2}\\mathbf{a}$。<br>' +
    '$\\vec{OQ} = \\mathbf{a} + \\frac{1}{2}(\\mathbf{b} - \\mathbf{a}) = \\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b}$。<br>' +
    '$\\vec{PQ} = \\vec{OQ} - \\vec{OP} = \\frac{1}{2}\\mathbf{a} + \\frac{1}{2}\\mathbf{b} - \\frac{1}{2}\\mathbf{a} = \\frac{1}{2}\\mathbf{b}$。<br>' +
    '由于 $\\vec{PQ} = \\frac{1}{2}\\vec{OB}$，是 $\\vec{OB}$ 的数乘倍数，故 $PQ$ <b>平行</b>于 $OB$。且 $PQ = \\frac{1}{2}OB$。证毕。<br><br>' +
    '<b>考试技巧：</b>始终用 $\\mathbf{a}$ 和 $\\mathbf{b}$ 完整表示答案。证明平行需证明一个向量是另一个向量的数乘倍数；证明共线还需要一个共享点。'
});

/* ══════════════════════════════════════════════════
   CIE 0580 — Chapter 8: Probability (8.1 – 8.4)
   ══════════════════════════════════════════════════ */

// ── 8.1 Introduction to probability ──
add('cie', '8.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• Probability measures how likely an event is: $0 \\leq P \\leq 1$.<br>' +
    '• $P = 0$: impossible. $P = 1$: certain.<br>' +
    '• $P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of equally likely outcomes}}$.<br>' +
    '• $P(A\') = 1 - P(A)$ where $A\'$ means "not $A$".<br><br>' +
    '<b>Key Skills</b><br>' +
    '• List outcomes systematically (sample space diagrams, two-way tables).<br>' +
    '• Find probabilities from frequency tables.<br>' +
    '• Express probability as fractions, decimals, or percentages.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Always simplify fractions in your final answer unless told otherwise.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• 概率衡量事件发生的可能性：$0 \\leq P \\leq 1$。<br>' +
    '• $P = 0$：不可能。$P = 1$：必然。<br>' +
    '• $P(\\text{事件}) = \\frac{\\text{有利结果的数量}}{\\text{等可能结果的总数}}$。<br>' +
    '• $P(A\') = 1 - P(A)$，其中 $A\'$ 表示"非 $A$"。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 有系统地列出结果（样本空间图、双向表）。<br>' +
    '• 从频数表中寻找概率。<br>' +
    '• 将概率表示为分数、小数或百分比。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '除非另有说明，否则请始终在最终答案中化简分数。'
});

add('cie', '8.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A bag contains 4 red, 3 blue, and 5 green balls. A ball is picked at random. Find the probability it is (a) blue, (b) not green.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total $= 4 + 3 + 5 = 12$.<br>' +
    '(a) $P(\\text{blue}) = \\frac{3}{12} = \\frac{1}{4}$.<br>' +
    '(b) $P(\\text{not green}) = 1 - \\frac{5}{12} = \\frac{7}{12}$.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'A fair six-sided die is rolled. Find the probability of getting (a) an even number, (b) a number greater than 4.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Even numbers: 2, 4, 6. $P(\\text{even}) = \\frac{3}{6} = \\frac{1}{2}$.<br>' +
    '(b) Greater than 4: 5, 6. $P(>4) = \\frac{2}{6} = \\frac{1}{3}$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'The letters of the word STATISTICS are written on separate cards. One card is chosen at random. Find $P$(the letter is S) and $P$(the letter is a vowel).<br><br>' +
    '<b>Solution:</b><br>' +
    'STATISTICS has 10 letters: S, T, A, T, I, S, T, I, C, S.<br>' +
    '$P(S) = \\frac{3}{10}$. Vowels (A, I, I): $P(\\text{vowel}) = \\frac{3}{10}$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    'The probability that it rains on any day in June is $0.35$. Find the probability that it does not rain. If June has 30 days, calculate the expected number of rainy days.<br><br>' +
    '<b>Solution:</b><br>' +
    '$P(\\text{no rain}) = 1 - 0.35 = 0.65$.<br>' +
    'Expected rainy days $= 0.35 \\times 30 = 10.5$.<br><br>' +
    '<b>Exam Tip:</b> Always check your probabilities add up to 1. If they don\'t, you\'ve made an error.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '袋中有 4 红 3 蓝 5 绿球，随机取一个。求 (a) 蓝色 (b) 不是绿色的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '总数 $= 4 + 3 + 5 = 12$。<br>' +
    '(a) $P(\\text{蓝}) = \\frac{3}{12} = \\frac{1}{4}$。<br>' +
    '(b) $P(\\text{非绿}) = 1 - \\frac{5}{12} = \\frac{7}{12}$。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '掷一个公正的六面骰子。求 (a) 偶数 (b) 大于 4 的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 偶数：2, 4, 6。$P(\\text{偶数}) = \\frac{3}{6} = \\frac{1}{2}$。<br>' +
    '(b) 大于 4：5, 6。$P(>4) = \\frac{2}{6} = \\frac{1}{3}$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '将 STATISTICS 的字母分别写在卡片上，随机抽取一张。求 $P$(字母为 S) 和 $P$(字母为元音)。<br><br>' +
    '<b>解答：</b><br>' +
    'STATISTICS 共 10 个字母：S, T, A, T, I, S, T, I, C, S。<br>' +
    '$P(S) = \\frac{3}{10}$。元音 (A, I, I)：$P(\\text{元音}) = \\frac{3}{10}$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '六月任意一天下雨的概率为 $0.35$。求不下雨的概率。六月有 30 天，计算预期下雨天数。<br><br>' +
    '<b>解答：</b><br>' +
    '$P(\\text{不下雨}) = 1 - 0.35 = 0.65$。<br>' +
    '预期下雨天数 $= 0.35 \\times 30 = 10.5$。<br><br>' +
    '<b>考试技巧：</b>始终检查你的概率之和等于 1。如果不等于 1，说明有错误。'
});

// ── 8.2 Relative and expected frequencies ──
add('cie', '8.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Relative frequency</b> $= \\frac{\\text{number of times event occurs}}{\\text{total number of trials}}$.<br>' +
    '• As the number of trials increases, relative frequency approaches the <b>theoretical probability</b>.<br>' +
    '• <b>Expected frequency</b> $= P(\\text{event}) \\times \\text{number of trials}$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Estimate probability from experimental data.<br>' +
    '• Compare experimental and theoretical probabilities.<br>' +
    '• Calculate expected number of occurrences.<br><br>' +
    '<b>Exam Tip</b><br>' +
    '"Estimate the probability" = use relative frequency. "Calculate the probability" = use equally likely outcomes.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>相对频数</b> $= \\frac{\\text{事件发生的次数}}{\\text{试验总次数}}$。<br>' +
    '• 随着试验次数的增加，相对频数会接近<b>理论概率</b>。<br>' +
    '• <b>期望频数</b> $= P(\\text{事件}) \\times \\text{试验次数}$。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 从实验数据中估计概率。<br>' +
    '• 比较实验概率与理论概率。<br>' +
    '• 计算预期的发生次数。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '"估计概率" = 使用相对频数。"计算概率" = 使用等可能结果。'
});

add('cie', '8.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A biased coin is flipped 200 times and lands heads 118 times. (a) Estimate the probability of heads. (b) If flipped 500 times, how many heads are expected?<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $P(H) \\approx \\frac{118}{200} = 0.59$.<br>' +
    '(b) Expected heads $= 0.59 \\times 500 = 295$.<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A spinner has 4 equal sections coloured red, blue, green, yellow. It is spun 80 times. Red appears 25 times. (a) Find the relative frequency of red. (b) Compare with the theoretical probability.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Relative frequency of red $= \\frac{25}{80} = 0.3125$.<br>' +
    '(b) Theoretical $P(\\text{red}) = \\frac{1}{4} = 0.25$. The relative frequency is higher than the theoretical value, but with more trials it should get closer to $0.25$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'A bag contains red and blue counters. A counter is drawn, its colour noted, and replaced. After 150 trials, red appeared 60 times. (a) Estimate $P$(red). (b) There are 20 counters in the bag. Estimate the number of red counters.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $P(\\text{red}) \\approx \\frac{60}{150} = 0.4$.<br>' +
    '(b) Estimated red counters $= 0.4 \\times 20 = 8$.<br><br>' +
    '<b>Exam Tip:</b> "Estimate the probability" means use relative frequency from the experiment. The more trials, the more reliable the estimate.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '有偏硬币抛 200 次，正面出现 118 次。(a) 估计正面概率。(b) 抛 500 次预计几次正面？<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $P(H) \\approx \\frac{118}{200} = 0.59$。<br>' +
    '(b) 预期正面次数 $= 0.59 \\times 500 = 295$。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '一个转盘有 4 个相等的区域（红、蓝、绿、黄），转了 80 次，红色出现 25 次。(a) 求红色的相对频数。(b) 与理论概率比较。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 红色的相对频数 $= \\frac{25}{80} = 0.3125$。<br>' +
    '(b) 理论 $P(\\text{红}) = \\frac{1}{4} = 0.25$。相对频数高于理论值，但随着试验次数增加，会越来越接近 $0.25$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '一个袋中有红色和蓝色计数器。取出一个记录颜色后放回。150 次试验后，红色出现 60 次。(a) 估计 $P$(红色)。(b) 袋中共有 20 个计数器，估计红色计数器的数量。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $P(\\text{红}) \\approx \\frac{60}{150} = 0.4$。<br>' +
    '(b) 估计红色计数器数量 $= 0.4 \\times 20 = 8$。<br><br>' +
    '<b>考试技巧：</b>"估计概率"意味着使用实验中的相对频数。试验次数越多，估计越可靠。'
});

// ── 8.3 Combined events ──
add('cie', '8.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>AND rule</b> (independent events): $P(A \\text{ and } B) = P(A) \\times P(B)$.<br>' +
    '• <b>OR rule</b> (mutually exclusive): $P(A \\text{ or } B) = P(A) + P(B)$.<br>' +
    '• <b>Tree diagrams</b>: multiply along branches (AND), add between branches (OR).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Draw and use tree diagrams for two or more successive events.<br>' +
    '• "With replacement" vs "without replacement": probabilities change in the second case.<br>' +
    '• "At least one" = $1 - P(\\text{none})$.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Check whether the events are "with replacement" or "without replacement". Without replacement means the second probability changes.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>与规则 (AND rule)</b>（独立事件）：$P(A \\text{ and } B) = P(A) \\times P(B)$。<br>' +
    '• <b>或规则 (OR rule)</b>（互斥事件）：$P(A \\text{ or } B) = P(A) + P(B)$。<br>' +
    '• <b>树状图</b>：沿分支相乘（与），分支之间相加（或）。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 绘制并使用树状图来处理两个或多个连续事件。<br>' +
    '• "放回"与"不放回"：在第二种情况下概率会发生变化。<br>' +
    '• "至少一个" = $1 - P(\\text{一个都没有})$。<br>' +
    '<br>' +
    '<b>注意！</b><br>' +
    '检查事件是"放回"还是"不放回"。不放回意味着第二次抽取的概率会改变。'
});

add('cie', '8.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks]<br>' +
    'A bag has 6 red and 4 blue balls. Two are picked <b>without replacement</b>. Find $P$(both different colours).<br><br>' +
    '<b>Solution:</b><br>' +
    '$P(\\text{RB}) = \\frac{6}{10} \\times \\frac{4}{9} = \\frac{24}{90}$.<br>' +
    '$P(\\text{BR}) = \\frac{4}{10} \\times \\frac{6}{9} = \\frac{24}{90}$.<br>' +
    '$P(\\text{different}) = \\frac{24}{90} + \\frac{24}{90} = \\frac{48}{90} = \\frac{8}{15}$.<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A fair coin is tossed 3 times. Find the probability of getting (a) 3 heads, (b) exactly 2 heads.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $P(\\text{HHH}) = \\frac{1}{2} \\times \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{8}$.<br>' +
    '(b) Exactly 2 heads: HHT, HTH, THH (3 outcomes).<br>' +
    '$P(\\text{exactly 2H}) = 3 \\times \\frac{1}{8} = \\frac{3}{8}$.<br><br>' +
    '<b>Worked Example 3</b> [4 marks]<br>' +
    'The probability that Ali passes a test is $0.7$ and that Ben passes is $0.6$. The events are independent. Find $P$(at least one passes).<br><br>' +
    '<b>Solution:</b><br>' +
    '$P(\\text{neither passes}) = (1 - 0.7) \\times (1 - 0.6) = 0.3 \\times 0.4 = 0.12$.<br>' +
    '$P(\\text{at least one}) = 1 - 0.12 = 0.88$.<br><br>' +
    '<b>Worked Example 4</b> [4 marks]<br>' +
    'A box contains 5 red and 3 white marbles. Two are drawn <b>without replacement</b>. Find $P$(both red) and $P$(at least one white).<br><br>' +
    '<b>Solution:</b><br>' +
    '$P(\\text{both red}) = \\frac{5}{8} \\times \\frac{4}{7} = \\frac{20}{56} = \\frac{5}{14}$.<br>' +
    '$P(\\text{at least one white}) = 1 - P(\\text{both red}) = 1 - \\frac{5}{14} = \\frac{9}{14}$.<br><br>' +
    '<b>Exam Tip:</b> "At least one" is best solved as $1 - P(\\text{none})$. It avoids listing every possible case.',
  content_zh:
    '<b>经典例题 1</b> [4 分]<br>' +
    '袋中有 6 红 4 蓝球，<b>不放回地</b>取两个。求 $P$(两球颜色不同)。<br><br>' +
    '<b>解答：</b><br>' +
    '$P(\\text{红蓝}) = \\frac{6}{10} \\times \\frac{4}{9} = \\frac{24}{90}$。<br>' +
    '$P(\\text{蓝红}) = \\frac{4}{10} \\times \\frac{6}{9} = \\frac{24}{90}$。<br>' +
    '$P(\\text{不同}) = \\frac{48}{90} = \\frac{8}{15}$。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '公正硬币抛 3 次。求 (a) 3 次正面 (b) 恰好 2 次正面的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $P(\\text{HHH}) = \\frac{1}{2} \\times \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{8}$。<br>' +
    '(b) 恰好 2 次正面：HHT, HTH, THH（3 种情况）。<br>' +
    '$P(\\text{恰好2正}) = 3 \\times \\frac{1}{8} = \\frac{3}{8}$。<br><br>' +
    '<b>经典例题 3</b> [4 分]<br>' +
    'Ali 通过考试的概率为 $0.7$，Ben 通过的概率为 $0.6$，两人独立。求 $P$(至少一人通过)。<br><br>' +
    '<b>解答：</b><br>' +
    '$P(\\text{都没通过}) = 0.3 \\times 0.4 = 0.12$。<br>' +
    '$P(\\text{至少一人}) = 1 - 0.12 = 0.88$。<br><br>' +
    '<b>经典例题 4</b> [4 分]<br>' +
    '盒中有 5 红 3 白弹珠，<b>不放回地</b>取两个。求 $P$(都是红色) 和 $P$(至少一个白色)。<br><br>' +
    '<b>解答：</b><br>' +
    '$P(\\text{都红}) = \\frac{5}{8} \\times \\frac{4}{7} = \\frac{20}{56} = \\frac{5}{14}$。<br>' +
    '$P(\\text{至少一白}) = 1 - \\frac{5}{14} = \\frac{9}{14}$。<br><br>' +
    '<b>考试技巧：</b>"至少一个"最好用 $1 - P(\\text{一个都没有})$ 来解。这样可以避免列举所有可能情况。'
});

// ── 8.4 Conditional probability ──
add('cie', '8.4', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• <b>Conditional probability</b>: $P(A | B)$ = probability of $A$ given that $B$ has occurred.<br>' +
    '• $P(A | B) = \\frac{P(A \\cap B)}{P(B)}$.<br>' +
    '• In tree diagrams: "without replacement" naturally gives conditional probabilities (second branch changes).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Use two-way tables or Venn diagrams to find conditional probabilities.<br>' +
    '• <b>Venn diagrams</b>: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.<br>' +
    '• Read $P(A | B)$ from a Venn diagram: focus on the $B$ circle, find the $A \\cap B$ portion.<br><br>' +
    '<b>Exam Tip</b><br>' +
    '"Given that" always means conditional probability. The denominator is the "given" group.',
  content_zh:
    '<b>仅限 Extended 课程内容</b><br>' +
    '<br>' +
    '<b>知识回顾</b><br>' +
    '• <b>条件概率</b>：$P(A | B)$ = 在 $B$ 发生的条件下 $A$ 发生的概率。<br>' +
    '• $P(A | B) = \\frac{P(A \\cap B)}{P(B)}$。<br>' +
    '• 在树状图中："不放回"自然会产生条件概率（第二个分支的概率会改变）。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 使用列联表或维恩图来计算条件概率。<br>' +
    '• <b>维恩图</b>：$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$。<br>' +
    '• 从维恩图中读取 $P(A | B)$：关注 $B$ 圆圈，找到其中 $A \\cap B$ 的部分。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '"已知 (Given that)"总是意味着条件概率。分母是"已知"的那个群体。'
});

add('cie', '8.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks — Extended]<br>' +
    'In a class of 30: 18 play football, 12 play tennis, 5 play both. A student is chosen at random. Find (a) $P$(football or tennis), (b) $P$(tennis | football).<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $P(F \\cup T) = \\frac{18 + 12 - 5}{30} = \\frac{25}{30} = \\frac{5}{6}$.<br>' +
    '(b) $P(T | F) = \\frac{P(T \\cap F)}{P(F)} = \\frac{5/30}{18/30} = \\frac{5}{18}$.<br><br>' +
    '<b>Worked Example 2</b> [4 marks — Extended]<br>' +
    'A two-way table shows 100 students: 40 boys and 60 girls. 25 boys like Maths, 30 girls like Maths. A student who likes Maths is chosen at random. Find the probability that this student is a girl.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total who like Maths $= 25 + 30 = 55$.<br>' +
    '$P(\\text{girl} | \\text{Maths}) = \\frac{30}{55} = \\frac{6}{11}$.<br><br>' +
    '<b>Worked Example 3</b> [5 marks — Extended]<br>' +
    'A bag has 8 red and 5 blue balls. Two are drawn without replacement. Find $P$(second is red | first is blue).<br><br>' +
    '<b>Solution:</b><br>' +
    'Given the first ball is blue, there are now 8 red and 4 blue left (12 total).<br>' +
    '$P(\\text{2nd red} | \\text{1st blue}) = \\frac{8}{12} = \\frac{2}{3}$.<br><br>' +
    '<b>Worked Example 4</b> [5 marks — Extended]<br>' +
    'In a survey of 80 people: $P(A) = 0.6$, $P(B) = 0.5$, $P(A \\cap B) = 0.2$. Find (a) $P(A \\cup B)$, (b) $P(A | B)$, (c) Are $A$ and $B$ independent?<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $P(A \\cup B) = 0.6 + 0.5 - 0.2 = 0.9$.<br>' +
    '(b) $P(A | B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.2}{0.5} = 0.4$.<br>' +
    '(c) If independent, $P(A \\cap B) = P(A) \\times P(B) = 0.6 \\times 0.5 = 0.3$. But $P(A \\cap B) = 0.2 \\neq 0.3$. So $A$ and $B$ are <b>not independent</b>.<br><br>' +
    '<b>Worked Example 5</b> [5 marks — Extended]<br>' +
    '150 students were asked about sport. 90 like swimming, 70 like running, 40 like both, and the rest like neither. Find (a) the number who like neither, (b) $P$(swimming | not running).<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) $n(S \\cup R) = 90 + 70 - 40 = 120$. Neither $= 150 - 120 = 30$.<br>' +
    '(b) Not running $= 150 - 70 = 80$. Swimming only (not running) $= 90 - 40 = 50$.<br>' +
    '$P(S | R\') = \\frac{50}{80} = \\frac{5}{8}$.<br><br>' +
    '<b>Exam Tip:</b> "Given that" always means conditional probability — the denominator is the "given" group. With Venn diagrams, fill in the intersection FIRST, then work outwards.',
  content_zh:
    '<b>经典例题 1</b> [4 分 — 进阶]<br>' +
    '30 人的班级中：18 人踢足球，12 人打网球，5 人两者都参加。随机选一名学生。求 (a) $P$(足球或网球)，(b) $P$(网球 | 足球)。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $P(F \\cup T) = \\frac{18 + 12 - 5}{30} = \\frac{25}{30} = \\frac{5}{6}$。<br>' +
    '(b) $P(T | F) = \\frac{P(T \\cap F)}{P(F)} = \\frac{5/30}{18/30} = \\frac{5}{18}$。<br><br>' +
    '<b>经典例题 2</b> [4 分 — 进阶]<br>' +
    '双向表中 100 名学生：40 男 60 女。25 名男生喜欢数学，30 名女生喜欢数学。从喜欢数学的学生中随机选一人，求该生是女生的概率。<br><br>' +
    '<b>解答：</b><br>' +
    '喜欢数学的总人数 $= 25 + 30 = 55$。<br>' +
    '$P(\\text{女} | \\text{数学}) = \\frac{30}{55} = \\frac{6}{11}$。<br><br>' +
    '<b>经典例题 3</b> [5 分 — 进阶]<br>' +
    '袋中有 8 红 5 蓝球，不放回取两个。求 $P$(第二个是红色 | 第一个是蓝色)。<br><br>' +
    '<b>解答：</b><br>' +
    '已知第一个是蓝色，剩余 8 红 4 蓝（共 12 个）。<br>' +
    '$P(\\text{第2红} | \\text{第1蓝}) = \\frac{8}{12} = \\frac{2}{3}$。<br><br>' +
    '<b>经典例题 4</b> [5 分 — 进阶]<br>' +
    '80 人的调查中：$P(A) = 0.6$，$P(B) = 0.5$，$P(A \\cap B) = 0.2$。求 (a) $P(A \\cup B)$，(b) $P(A | B)$，(c) $A$ 和 $B$ 是否独立？<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $P(A \\cup B) = 0.6 + 0.5 - 0.2 = 0.9$。<br>' +
    '(b) $P(A | B) = \\frac{0.2}{0.5} = 0.4$。<br>' +
    '(c) 若独立，则 $P(A \\cap B) = 0.6 \\times 0.5 = 0.3$。但 $P(A \\cap B) = 0.2 \\neq 0.3$，故 $A$、$B$ <b>不独立</b>。<br><br>' +
    '<b>经典例题 5</b> [5 分 — 进阶]<br>' +
    '150 名学生接受运动调查：90 人喜欢游泳，70 人喜欢跑步，40 人两者都喜欢，其余都不喜欢。求 (a) 都不喜欢的人数，(b) $P$(游泳 | 不跑步)。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) $n(S \\cup R) = 90 + 70 - 40 = 120$。都不喜欢 $= 150 - 120 = 30$。<br>' +
    '(b) 不跑步 $= 150 - 70 = 80$。仅游泳（不跑步）$= 90 - 40 = 50$。<br>' +
    '$P(S | R\') = \\frac{50}{80} = \\frac{5}{8}$。<br><br>' +
    '<b>考试技巧：</b>"已知 (Given that)"总是意味着条件概率——分母是"已知"的那个群体。使用维恩图时，先填交集，再向外扩展。'
});

/* ══════════════════════════════════════════════════
   CIE 0580 — Chapter 9: Statistics (9.1 – 9.7)
   ══════════════════════════════════════════════════ */

// ── 9.1 Classifying and tabulating data ──
add('cie', '9.1', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Qualitative data</b>: non-numerical (colour, type). <b>Quantitative data</b>: numerical.<br>' +
    '• <b>Discrete</b>: counted, specific values (number of siblings). <b>Continuous</b>: measured, any value in a range (height).<br>' +
    '• <b>Frequency table</b>: tally marks → frequency column.<br>' +
    '• <b>Grouped frequency table</b>: data sorted into class intervals. Use $\\leq$ or $<$ for boundaries.<br>' +
    '• <b>Two-way table</b>: organises data by two categories.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Choose appropriate class intervals (equal width, no gaps, no overlaps).<br>' +
    '• Read and construct two-way tables.<br>' +
    '• Find totals and missing values in frequency tables.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>定性数据</b>：非数值型（颜色、类型）。<b>定量数据</b>：数值型。<br>' +
    '• <b>离散型</b>：计数的，特定值（兄弟姐妹的人数）。<b>连续型</b>：测量的，范围内的任何值（身高）。<br>' +
    '• <b>频数表</b>：计数符号 → 频数列。<br>' +
    '• <b>分组频数表</b>：数据被分类到组区间。使用 $\\leq$ 或 $<$ 作为边界。<br>' +
    '• <b>双向表</b>：按两个类别组织数据。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 选择合适的组区间（等宽、无间隙、无重叠）。<br>' +
    '• 读取和构建双向表。<br>' +
    '• 查找频数表中的总计和缺失值。'
});

add('cie', '9.1', 'examples', {
  content:
    '<b>Worked Example 1</b> [2 marks]<br>' +
    'Classify each as discrete or continuous: (a) Number of pets, (b) Temperature, (c) Shoe size, (d) Time taken.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Discrete (counted).<br>' +
    '(b) Continuous (measured).<br>' +
    '(c) Discrete (specific values: 5, 5.5, 6, ...).<br>' +
    '(d) Continuous (measured).<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'A two-way table shows students and their favourite subject. Boys: Maths 12, English 8, Science 15. Girls: Maths 10, English 14, Science 11. Find the total number of students and the number of girls who chose English.<br><br>' +
    '<b>Solution:</b><br>' +
    'Total $= 12 + 8 + 15 + 10 + 14 + 11 = 70$ students.<br>' +
    'Girls who chose English $= 14$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'A student wants to group the ages (in years) of 50 people. Suggest suitable class intervals and explain why overlapping classes like $10$–$20$, $20$–$30$ are not appropriate.<br><br>' +
    '<b>Solution:</b><br>' +
    'Suitable classes: $10 \\leq a < 20$, $20 \\leq a < 30$, $30 \\leq a < 40$, etc.<br>' +
    'Overlapping classes $10$–$20$, $20$–$30$ are wrong because a person aged exactly 20 could be placed in either class. Use $<$ or $\\leq$ boundaries to avoid gaps and overlaps.<br><br>' +
    '<b>Exam Tip:</b> Class intervals must have no gaps and no overlaps. Use inequalities ($\\leq$, $<$) to define boundaries clearly.',
  content_zh:
    '<b>经典例题 1</b> [2 分]<br>' +
    '将以下各项分类为离散型或连续型：(a) 宠物数量，(b) 温度，(c) 鞋码，(d) 所用时间。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 离散型（计数得出）。<br>' +
    '(b) 连续型（测量得出）。<br>' +
    '(c) 离散型（特定数值：5, 5.5, 6, ...）。<br>' +
    '(d) 连续型（测量得出）。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '双向表显示学生和他们最喜欢的科目。男生：数学 12，英语 8，科学 15。女生：数学 10，英语 14，科学 11。求总人数和选择英语的女生人数。<br><br>' +
    '<b>解答：</b><br>' +
    '总数 $= 12 + 8 + 15 + 10 + 14 + 11 = 70$ 名学生。<br>' +
    '选择英语的女生 $= 14$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '一名学生想将 50 人的年龄（岁）分组。建议合适的组区间，并解释为什么 $10$–$20$、$20$–$30$ 这样的重叠分组不合适。<br><br>' +
    '<b>解答：</b><br>' +
    '合适的分组：$10 \\leq a < 20$，$20 \\leq a < 30$，$30 \\leq a < 40$ 等。<br>' +
    '重叠分组 $10$–$20$、$20$–$30$ 有误，因为恰好 20 岁的人可以被放入两个组中。使用 $<$ 或 $\\leq$ 边界来避免间隙和重叠。<br><br>' +
    '<b>考试技巧：</b>组区间必须没有间隙、没有重叠。使用不等式（$\\leq$、$<$）来清晰地定义边界。'
});

// ── 9.2 Interpreting statistical data ──
add('cie', '9.2', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Bar charts</b>: compare frequencies of categories. Gaps between bars.<br>' +
    '• <b>Pie charts</b>: angle $= \\frac{\\text{frequency}}{\\text{total}} \\times 360°$. Show proportion, not frequency.<br>' +
    '• <b>Pictograms</b>: symbols represent data. Key shows how many each symbol means.<br>' +
    '• <b>Line graphs</b>: show trends over time. Join points with straight lines.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Read values from charts and graphs.<br>' +
    '• Compare data shown in different formats.<br>' +
    '• Critique misleading graphs (broken scales, unequal intervals, etc.).<br><br>' +
    '<b>Exam Tip</b><br>' +
    'When reading pie charts, find the total first. Then angle ÷ 360 × total = frequency.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>条形图</b>：比较不同类别的频数。条形之间有间隙。<br>' +
    '• <b>饼图</b>：圆心角 $= \\frac{\\text{频数}}{\\text{总计}} \\times 360°$。显示比例，而非频数。<br>' +
    '• <b>象形图</b>：用符号表示数据。图例显示每个符号代表的数量。<br>' +
    '• <b>折线图</b>：显示随时间变化的趋势。用直线连接各点。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 从图表中读取数值。<br>' +
    '• 比较以不同格式显示的数据。<br>' +
    '• 评论误导性的图表（刻度断裂、区间不等，等等）。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '读取饼图时，先找到总计。然后 圆心角 ÷ 360 × 总计 = 频数。'
});

add('cie', '9.2', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A pie chart represents 120 students. The "Maths" sector has angle $90°$. How many students chose Maths? If 30 students chose Science, find the angle for Science.<br><br>' +
    '<b>Solution:</b><br>' +
    'Maths: $\\frac{90}{360} \\times 120 = 30$ students.<br>' +
    'Science: $\\frac{30}{120} \\times 360° = 90°$.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'A bar chart shows the number of books read by students in one month: 0 books (5 students), 1 book (12), 2 books (8), 3 books (3), 4 books (2). Find the modal number of books and the total number of students.<br><br>' +
    '<b>Solution:</b><br>' +
    'Mode $= 1$ book (highest frequency: 12).<br>' +
    'Total students $= 5 + 12 + 8 + 3 + 2 = 30$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'A pie chart has 4 sectors. Three sectors have angles $120°$, $80°$, and $60°$. Find the angle of the fourth sector. If the chart represents 90 people, find the frequency of the sector with angle $120°$.<br><br>' +
    '<b>Solution:</b><br>' +
    'Fourth angle $= 360° - 120° - 80° - 60° = 100°$.<br>' +
    'Frequency $= \\frac{120}{360} \\times 90 = 30$ people.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    'A pictogram uses one symbol to represent 4 cars sold. Monday shows 3.5 symbols. How many cars were sold on Monday? If 22 cars were sold on Tuesday, how many symbols should be drawn?<br><br>' +
    '<b>Solution:</b><br>' +
    'Monday: $3.5 \\times 4 = 14$ cars.<br>' +
    'Tuesday: $\\frac{22}{4} = 5.5$ symbols (5 full symbols and one half symbol).<br><br>' +
    '<b>Exam Tip:</b> For pie charts, always find the total first. Then use: angle $= \\frac{\\text{frequency}}{\\text{total}} \\times 360°$ or frequency $= \\frac{\\text{angle}}{360°} \\times \\text{total}$.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '饼图代表 120 名学生，"数学"扇形角 $90°$。多少人选了数学？30 人选了科学，求科学的角度。<br><br>' +
    '<b>解答：</b><br>' +
    '数学：$\\frac{90}{360} \\times 120 = 30$ 人。<br>' +
    '科学：$\\frac{30}{120} \\times 360° = 90°$。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '条形图显示学生一个月内的阅读量：0 本（5 人），1 本（12 人），2 本（8 人），3 本（3 人），4 本（2 人）。求众数和学生总数。<br><br>' +
    '<b>解答：</b><br>' +
    '众数 $= 1$ 本（频数最高：12）。<br>' +
    '学生总数 $= 5 + 12 + 8 + 3 + 2 = 30$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '饼图有 4 个扇形，其中三个角度分别为 $120°$、$80°$、$60°$。求第四个扇形的角度。若饼图代表 90 人，求 $120°$ 扇形的频数。<br><br>' +
    '<b>解答：</b><br>' +
    '第四个角度 $= 360° - 120° - 80° - 60° = 100°$。<br>' +
    '频数 $= \\frac{120}{360} \\times 90 = 30$ 人。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '象形图中一个符号代表 4 辆汽车。周一显示 3.5 个符号。周一卖了多少辆车？周二卖了 22 辆，应画多少个符号？<br><br>' +
    '<b>解答：</b><br>' +
    '周一：$3.5 \\times 4 = 14$ 辆。<br>' +
    '周二：$\\frac{22}{4} = 5.5$ 个符号（5 个完整符号和 1 个半符号）。<br><br>' +
    '<b>考试技巧：</b>对于饼图，先求总数。然后用：角度 $= \\frac{\\text{频数}}{\\text{总数}} \\times 360°$ 或 频数 $= \\frac{\\text{角度}}{360°} \\times \\text{总数}$。'
});

// ── 9.3 Averages and measures of spread ──
add('cie', '9.3', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Mean</b> $= \\frac{\\sum x}{n}$. For frequency table: $\\bar{x} = \\frac{\\sum fx}{\\sum f}$.<br>' +
    '• <b>Median</b>: middle value of ordered data. Position $= \\frac{n+1}{2}$. For grouped data, use interpolation or cumulative frequency.<br>' +
    '• <b>Mode</b>: most frequent value. <b>Modal class</b>: class with highest frequency.<br>' +
    '• <b>Range</b> $=$ max $-$ min.<br><br>' +
    '<b>Extended Only</b><br>' +
    '• For grouped data, mean uses <b>midpoints</b> and gives an <b>estimate</b>.<br>' +
    '• <b>Interquartile range</b> $= Q_3 - Q_1$. Less affected by outliers than range.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'The mean is affected by extreme values (outliers). The median is more robust.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>平均数</b> $= \\frac{\\sum x}{n}$。对于频数表：$\\bar{x} = \\frac{\\sum fx}{\\sum f}$。<br>' +
    '• <b>中位数</b>：有序数据的中间值。位置 $= \\frac{n+1}{2}$。对于分组数据，使用插值法或累积频数。<br>' +
    '• <b>众数</b>：出现次数最多的数值。<b>众数组</b>：频数最高的组。<br>' +
    '• <b>极差</b> $=$ 最大值 $-$ 最小值。<br>' +
    '<br>' +
    '<b>仅限进阶</b><br>' +
    '• 对于分组数据，平均数使用<b>中点</b>计算，并给出一个<b>估计值</b>。<br>' +
    '• <b>四分位距</b> $= Q_3 - Q_1$。与极差相比，受异常值的影响更小。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '平均数受极端值（异常值）的影响。中位数更为稳健。'
});

add('cie', '9.3', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Find the mean, median, and mode of: 3, 5, 7, 7, 8, 10, 12.<br><br>' +
    '<b>Solution:</b><br>' +
    'Mean $= \\frac{3+5+7+7+8+10+12}{7} = \\frac{52}{7} = 7.43$ (3 s.f.).<br>' +
    'Median: 7 values, middle is the 4th $= 7$.<br>' +
    'Mode $= 7$ (appears twice).<br><br>' +
    '<b>Worked Example 2</b> [4 marks]<br>' +
    'Grouped frequency table:<br>' +
    'Score: 0–9 (freq 3), 10–19 (freq 8), 20–29 (freq 12), 30–39 (freq 7). Estimate the mean.<br><br>' +
    '<b>Solution:</b><br>' +
    'Midpoints: 4.5, 14.5, 24.5, 34.5.<br>' +
    '$\\sum fx = 3(4.5) + 8(14.5) + 12(24.5) + 7(34.5)$<br>' +
    '$= 13.5 + 116 + 294 + 241.5 = 665$.<br>' +
    '$\\sum f = 30$.<br>' +
    'Estimated mean $= \\frac{665}{30} = 22.2$.<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'A frequency table shows the number of goals scored per match: 0 goals (freq 4), 1 goal (freq 7), 2 goals (freq 5), 3 goals (freq 3), 4 goals (freq 1). Find the mean number of goals.<br><br>' +
    '<b>Solution:</b><br>' +
    '$\\sum fx = 0(4) + 1(7) + 2(5) + 3(3) + 4(1) = 0 + 7 + 10 + 9 + 4 = 30$.<br>' +
    '$\\sum f = 4 + 7 + 5 + 3 + 1 = 20$.<br>' +
    'Mean $= \\frac{30}{20} = 1.5$ goals.<br><br>' +
    '<b>Worked Example 4</b> [4 marks]<br>' +
    'The mean of 5 numbers is 8. Four of the numbers are 6, 7, 9, 10. Find the fifth number. If the number 15 is added to the set, find the new mean.<br><br>' +
    '<b>Solution:</b><br>' +
    'Sum $= 5 \\times 8 = 40$. Fifth number $= 40 - (6+7+9+10) = 40 - 32 = 8$.<br>' +
    'New sum $= 40 + 15 = 55$. New mean $= \\frac{55}{6} = 9.17$ (3 s.f.).<br><br>' +
    '<b>Exam Tip:</b> For grouped data, you can only <b>estimate</b> the mean (use midpoints). The word "estimate" in the question is your clue to use midpoints.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '求以下数据的平均数、中位数和众数：3, 5, 7, 7, 8, 10, 12。<br><br>' +
    '<b>解答：</b><br>' +
    '平均数 $= \\frac{3+5+7+7+8+10+12}{7} = \\frac{52}{7} = 7.43$（三位有效数字）。<br>' +
    '中位数：7 个值，中间是第 4 个 $= 7$。<br>' +
    '众数 $= 7$（出现两次）。<br><br>' +
    '<b>经典例题 2</b> [4 分]<br>' +
    '分组频数表：分数 0–9（频数 3），10–19（频数 8），20–29（频数 12），30–39（频数 7）。估算平均值。<br><br>' +
    '<b>解答：</b><br>' +
    '组中值：4.5, 14.5, 24.5, 34.5。<br>' +
    '$\\sum fx = 3(4.5) + 8(14.5) + 12(24.5) + 7(34.5) = 665$。<br>' +
    '$\\sum f = 30$。<br>' +
    '估算平均值 $= \\frac{665}{30} = 22.2$。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '频数表显示每场比赛的进球数：0 球（频数 4），1 球（频数 7），2 球（频数 5），3 球（频数 3），4 球（频数 1）。求平均进球数。<br><br>' +
    '<b>解答：</b><br>' +
    '$\\sum fx = 0(4) + 1(7) + 2(5) + 3(3) + 4(1) = 30$。<br>' +
    '$\\sum f = 20$。<br>' +
    '平均数 $= \\frac{30}{20} = 1.5$ 个进球。<br><br>' +
    '<b>经典例题 4</b> [4 分]<br>' +
    '5 个数的平均值为 8。其中四个是 6, 7, 9, 10。求第五个数。若再加入数 15，求新平均值。<br><br>' +
    '<b>解答：</b><br>' +
    '总和 $= 5 \\times 8 = 40$。第五个数 $= 40 - (6+7+9+10) = 40 - 32 = 8$。<br>' +
    '新总和 $= 40 + 15 = 55$。新平均值 $= \\frac{55}{6} = 9.17$（三位有效数字）。<br><br>' +
    '<b>考试技巧：</b>对于分组数据，只能<b>估算</b>平均值（使用组中值）。题目中出现"估算"一词就是使用组中值的提示。'
});

// ── 9.4 Statistical charts and diagrams ──
add('cie', '9.4', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• <b>Stem-and-leaf diagram</b>: organises raw data. Must be ordered with a key. E.g. $3 | 2$ means 32.<br>' +
    '• <b>Back-to-back</b> stem-and-leaf: compares two data sets on the same stem.<br>' +
    '• <b>Frequency polygon</b>: plot midpoints of class intervals, join with straight lines.<br>' +
    '• Can read median, quartiles, and range from an ordered stem-and-leaf diagram.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Construct an ordered stem-and-leaf diagram.<br>' +
    '• Find the median from a stem-and-leaf diagram.<br>' +
    '• Draw and interpret frequency polygons.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Remember: stems go on the left, leaves on the right, and leaves must be in order.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>茎叶图</b>：组织原始数据。必须有序且带有图例。例如 $3 | 2$ 表示 32。<br>' +
    '• <b>背对背</b>茎叶图：在同一根茎上比较两组数据集。<br>' +
    '• <b>频数多边形</b>：绘制组区间的组中点，并用直线连接。<br>' +
    '• 可以从有序茎叶图中读取中位数、四分位数和极差。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 构建有序茎叶图。<br>' +
    '• 从茎叶图中求中位数。<br>' +
    '• 绘制并解读频数多边形。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '记住：茎在左侧，叶在右侧，且叶子必须有序排列。'
});

add('cie', '9.4', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'Data: 23, 31, 18, 27, 35, 22, 29, 31, 24, 38, 19, 26. Draw a stem-and-leaf diagram and find the median.<br><br>' +
    '<b>Solution:</b><br>' +
    'Key: $1|8$ means 18.<br>' +
    '$1 \\;|\\; 8 \\; 9$<br>' +
    '$2 \\;|\\; 2 \\; 3 \\; 4 \\; 6 \\; 7 \\; 9$<br>' +
    '$3 \\;|\\; 1 \\; 1 \\; 5 \\; 8$<br>' +
    '12 values → median = average of 6th and 7th: $\\frac{26 + 27}{2} = 26.5$.<br><br>' +
    '<b>Worked Example 2</b> [3 marks]<br>' +
    'From the stem-and-leaf diagram above, find (a) the range, (b) the mode.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Range $= 38 - 18 = 20$.<br>' +
    '(b) Mode $= 31$ (appears twice; all other values appear once).<br><br>' +
    '<b>Worked Example 3</b> [4 marks]<br>' +
    'A frequency polygon is drawn for grouped data. The midpoints and frequencies are: $(5, 3)$, $(15, 8)$, $(25, 12)$, $(35, 7)$, $(45, 2)$. Find the modal class and estimate the range.<br><br>' +
    '<b>Solution:</b><br>' +
    'Modal class: $20$–$30$ (highest frequency $= 12$).<br>' +
    'The smallest class starts at $0$ (lower boundary of midpoint $5$), the largest ends at $50$ (upper boundary of midpoint $45$).<br>' +
    'Estimated range $= 50 - 0 = 50$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    'A back-to-back stem-and-leaf diagram compares test scores of two classes. Class A: $4|5$ means 45. Class B: $5|6$ means 56. Class A median is 52, Class B median is 61. Compare the two distributions.<br><br>' +
    '<b>Solution:</b><br>' +
    'Class B has a higher median ($61 > 52$), so on average Class B scored higher.<br>' +
    'Compare the ranges and spreads of both classes to give a fuller comparison.<br><br>' +
    '<b>Exam Tip:</b> Always include a key for stem-and-leaf diagrams. Leaves must be in order (smallest to largest). For back-to-back diagrams, Class A leaves go right-to-left.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '数据：23, 31, 18, 27, 35, 22, 29, 31, 24, 38, 19, 26。绘制茎叶图并求中位数。<br><br>' +
    '<b>解答：</b><br>' +
    '图例：$1|8$ 表示 18。<br>' +
    '$1 \\;|\\; 8 \\; 9$<br>' +
    '$2 \\;|\\; 2 \\; 3 \\; 4 \\; 6 \\; 7 \\; 9$<br>' +
    '$3 \\;|\\; 1 \\; 1 \\; 5 \\; 8$<br>' +
    '12 个值 → 中位数 = 第 6 和第 7 个值的平均数：$\\frac{26 + 27}{2} = 26.5$。<br><br>' +
    '<b>经典例题 2</b> [3 分]<br>' +
    '根据上面的茎叶图，求 (a) 极差，(b) 众数。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 极差 $= 38 - 18 = 20$。<br>' +
    '(b) 众数 $= 31$（出现两次；其他值均只出现一次）。<br><br>' +
    '<b>经典例题 3</b> [4 分]<br>' +
    '为分组数据绘制频数多边形。组中值和频数为：$(5, 3)$、$(15, 8)$、$(25, 12)$、$(35, 7)$、$(45, 2)$。求众数组并估算极差。<br><br>' +
    '<b>解答：</b><br>' +
    '众数组：$20$–$30$（最高频数 $= 12$）。<br>' +
    '最小组起始于 $0$（组中值 $5$ 的下界），最大组终止于 $50$（组中值 $45$ 的上界）。<br>' +
    '估算极差 $= 50 - 0 = 50$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '背对背茎叶图比较两个班的考试成绩。A 班：$4|5$ 表示 45。B 班：$5|6$ 表示 56。A 班中位数 52，B 班中位数 61。比较两个分布。<br><br>' +
    '<b>解答：</b><br>' +
    'B 班中位数更高（$61 > 52$），因此平均而言 B 班成绩更好。<br>' +
    '比较两个班的极差和分散程度可以给出更全面的比较。<br><br>' +
    '<b>考试技巧：</b>茎叶图必须附图例。叶子必须按顺序排列（从小到大）。背对背茎叶图中，一边的叶子从右到左排列。'
});

// ── 9.5 Scatter diagrams and correlation ──
add('cie', '9.5', 'knowledge', {
  content:
    '<b>Recap</b><br>' +
    '• A <b>scatter diagram</b> shows the relationship between two variables.<br>' +
    '• <b>Positive correlation</b>: as one increases, the other increases (points go up-right).<br>' +
    '• <b>Negative correlation</b>: as one increases, the other decreases (points go down-right).<br>' +
    '• <b>No correlation</b>: no clear pattern.<br>' +
    '• <b>Line of best fit</b>: straight line through the data that best represents the trend. Should pass near the <b>mean point</b> $(\\bar{x}, \\bar{y})$.<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Plot scatter diagrams and draw a line of best fit by eye.<br>' +
    '• Describe the type and strength of correlation.<br>' +
    '• Use the line of best fit to make predictions (interpolation is more reliable than extrapolation).<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Correlation does NOT mean causation. Two correlated variables may both be caused by a third factor.',
  content_zh:
    '<b>知识回顾</b><br>' +
    '• <b>散点图</b>显示了两个变量之间的关系。<br>' +
    '• <b>正相关</b>：随着一个变量增加，另一个也增加（点向右上延伸）。<br>' +
    '• <b>负相关</b>：随着一个变量增加，另一个减少（点向右下延伸）。<br>' +
    '• <b>无相关</b>：没有明显的模式。<br>' +
    '• <b>最佳拟合线</b>：穿过数据且最能代表趋势的直线。应经过<b>平均点</b> $(\\bar{x}, \\bar{y})$ 附近。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 绘制散点图并目测画出最佳拟合线。<br>' +
    '• 描述相关性的类型和强度。<br>' +
    '• 使用最佳拟合线进行预测（内插法比外推法更可靠）。<br>' +
    '<br>' +
    '<b>注意！</b><br>' +
    '相关性并不意味着因果关系。两个相关的变量可能都受第三个因素的影响。'
});

add('cie', '9.5', 'examples', {
  content:
    '<b>Worked Example 1</b> [3 marks]<br>' +
    'A student plots temperature against ice cream sales. The points show a clear upward trend. (a) Describe the correlation. (b) Estimate sales at 25°C if the line of best fit passes through $(20, 150)$ and $(30, 250)$.<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) <b>Strong positive correlation</b>: as temperature increases, sales increase.<br>' +
    '(b) Gradient $= \\frac{250-150}{30-20} = 10$ sales per °C.<br>' +
    'At 25°C: $150 + 5 \\times 10 = 200$ sales.<br><br>' +
    '<b>Worked Example 2</b> [2 marks]<br>' +
    'A scatter diagram shows the age of a car (years) against its value (\\$). Describe the type of correlation you would expect and give a reason.<br><br>' +
    '<b>Solution:</b><br>' +
    '<b>Negative correlation</b>: as the age of the car increases, its value decreases (cars depreciate over time).<br><br>' +
    '<b>Worked Example 3</b> [3 marks]<br>' +
    'The mean point of a data set is $(\\bar{x}, \\bar{y}) = (35, 72)$. The line of best fit passes through this point and has gradient $-1.2$. Estimate $y$ when $x = 40$.<br><br>' +
    '<b>Solution:</b><br>' +
    '$y - 72 = -1.2(x - 35)$.<br>' +
    'When $x = 40$: $y = 72 + (-1.2)(40 - 35) = 72 - 6 = 66$.<br><br>' +
    '<b>Worked Example 4</b> [3 marks]<br>' +
    'A student uses their line of best fit (valid for $x$ values $10$ to $50$) to predict a value when $x = 80$. Explain why this prediction may be unreliable.<br><br>' +
    '<b>Solution:</b><br>' +
    'This is <b>extrapolation</b> — predicting outside the range of the data. The trend may not continue beyond the observed values, so the prediction is unreliable.<br><br>' +
    '<b>Exam Tip:</b> Interpolation (within the data range) is reliable. Extrapolation (outside the data range) is unreliable — always say why if asked.',
  content_zh:
    '<b>经典例题 1</b> [3 分]<br>' +
    '一名学生绘制了气温与冰淇淋销量的散点图，散点呈明显上升趋势。(a) 描述相关性。(b) 若最佳拟合线经过 $(20, 150)$ 和 $(30, 250)$，估算 25°C 时的销量。<br><br>' +
    '<b>解答：</b><br>' +
    '(a) <b>强正相关</b>：气温升高，销量增加。<br>' +
    '(b) 斜率 $= \\frac{250-150}{30-20} = 10$ 销量/°C。在 25°C 时：$150 + 5 \\times 10 = 200$ 销量。<br><br>' +
    '<b>经典例题 2</b> [2 分]<br>' +
    '散点图显示汽车车龄（年）与价值（\\$）。描述你预期的相关性类型并说明原因。<br><br>' +
    '<b>解答：</b><br>' +
    '<b>负相关</b>：随着车龄增大，价值下降（汽车随时间贬值）。<br><br>' +
    '<b>经典例题 3</b> [3 分]<br>' +
    '数据集的平均点为 $(\\bar{x}, \\bar{y}) = (35, 72)$，最佳拟合线经过此点，斜率为 $-1.2$。估算 $x = 40$ 时的 $y$ 值。<br><br>' +
    '<b>解答：</b><br>' +
    '$y - 72 = -1.2(x - 35)$。<br>' +
    '当 $x = 40$ 时：$y = 72 + (-1.2)(40 - 35) = 72 - 6 = 66$。<br><br>' +
    '<b>经典例题 4</b> [3 分]<br>' +
    '一名学生用最佳拟合线（适用于 $x$ 值 $10$ 到 $50$）来预测 $x = 80$ 时的值。解释为什么这个预测可能不可靠。<br><br>' +
    '<b>解答：</b><br>' +
    '这是<b>外推法</b>——在数据范围之外进行预测。趋势可能不会延续到观测值之外，因此预测不可靠。<br><br>' +
    '<b>考试技巧：</b>内插法（数据范围内）可靠。外推法（数据范围外）不可靠——如果被问到，务必说明原因。'
});

// ── 9.6 Cumulative frequency ──
add('cie', '9.6', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• <b>Cumulative frequency</b> = running total of frequencies.<br>' +
    '• Plot cumulative frequency at the <b>upper class boundary</b> of each class.<br>' +
    '• The curve is always S-shaped (increasing, never decreases).<br><br>' +
    '<b>Reading from the curve</b><br>' +
    '• Median: read at $\\frac{n}{2}$.<br>' +
    '• Lower quartile ($Q_1$): at $\\frac{n}{4}$. Upper quartile ($Q_3$): at $\\frac{3n}{4}$.<br>' +
    '• IQR $= Q_3 - Q_1$.<br>' +
    '• Percentiles: e.g. 10th percentile at $\\frac{10}{100} \\times n$.<br><br>' +
    '<b>Box-and-whisker plot</b><br>' +
    '• Shows: minimum, $Q_1$, median, $Q_3$, maximum.<br>' +
    '• Useful for comparing distributions side by side.<br><br>' +
    '<b>Exam Tip</b><br>' +
    'Plot points at the upper boundary, not the midpoint. Join with a smooth S-curve, not straight lines.',
  content_zh:
    '<b>仅限拓展 (Extended Only)</b><br>' +
    '<br>' +
    '<b>知识回顾</b><br>' +
    '• <b>累积频数</b> = 频数的连续总计。<br>' +
    '• 在每个组的<b>上组界 (upper class boundary)</b>处绘制累积频数。<br>' +
    '• 曲线总是呈 S 形（递增，从不减少）。<br>' +
    '<br>' +
    '<b>从曲线读取数据</b><br>' +
    '• 中位数：在 $\\frac{n}{2}$ 处读取。<br>' +
    '• 下四分位数 ($Q_1$)：在 $\\frac{n}{4}$ 处。上四分位数 ($Q_3$)：在 $\\frac{3n}{4}$ 处。<br>' +
    '• 四分位距 IQR $= Q_3 - Q_1$。<br>' +
    '• 百分位数：例如，第 10 百分位数在 $\\frac{10}{100} \\times n$ 处。<br>' +
    '<br>' +
    '<b>箱线图 (Box-and-whisker plot)</b><br>' +
    '• 显示：最小值、$Q_1$、中位数、$Q_3$、最大值。<br>' +
    '• 适用于并排比较分布。<br>' +
    '<br>' +
    '<b>考试技巧</b><br>' +
    '在边界上限描点，而不是中点。用平滑的 S 形曲线连接，不要用直线。'
});

add('cie', '9.6', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks — Extended]<br>' +
    'From a cumulative frequency graph with $n = 60$:<br>' +
    '(a) Find the median, $Q_1$, $Q_3$, and IQR.<br>' +
    '(b) How many scored more than 70?<br><br>' +
    '<b>Solution:</b><br>' +
    '(a) Median at $\\frac{60}{2} = 30$th → read across: median $= 55$.<br>' +
    '$Q_1$ at 15th $= 42$. $Q_3$ at 45th $= 68$.<br>' +
    'IQR $= 68 - 42 = 26$.<br>' +
    '(b) CF at 70 $= 48$. More than 70 $= 60 - 48 = 12$ students.<br><br>' +
    '<b>Worked Example 2</b> [4 marks — Extended]<br>' +
    'A grouped frequency table shows the times (in seconds) for 80 athletes:<br>' +
    '$10$–$14$ (freq 6), $15$–$19$ (freq 14), $20$–$24$ (freq 25), $25$–$29$ (freq 20), $30$–$34$ (freq 15).<br>' +
    'Complete the cumulative frequency table and find the upper class boundaries.<br><br>' +
    '<b>Solution:</b><br>' +
    'Upper boundaries: 14.5, 19.5, 24.5, 29.5, 34.5.<br>' +
    'Cumulative frequencies: 6, 20, 45, 65, 80.<br>' +
    'Plot at $(14.5, 6)$, $(19.5, 20)$, $(24.5, 45)$, $(29.5, 65)$, $(34.5, 80)$.<br><br>' +
    '<b>Worked Example 3</b> [4 marks — Extended]<br>' +
    'From a cumulative frequency curve with $n = 100$, the median is 48, $Q_1 = 35$, $Q_3 = 62$. Draw a box-and-whisker plot given that the minimum is 12 and the maximum is 85.<br><br>' +
    '<b>Solution:</b><br>' +
    'The five values for the box plot are:<br>' +
    'Min $= 12$, $Q_1 = 35$, Median $= 48$, $Q_3 = 62$, Max $= 85$.<br>' +
    'Draw a number line, mark these 5 points, draw the box from $Q_1$ to $Q_3$ with a line at the median, and whiskers to min and max.<br><br>' +
    '<b>Worked Example 4</b> [5 marks — Extended]<br>' +
    'Two classes take the same test ($n = 40$ each). Class A: median 55, IQR 20. Class B: median 62, IQR 35. Compare the two distributions.<br><br>' +
    '<b>Solution:</b><br>' +
    'Class B has a higher median ($62 > 55$), so on average Class B performed better.<br>' +
    'Class A has a smaller IQR ($20 < 35$), so Class A\'s results are more consistent (less spread).<br>' +
    'Class B has a wider spread of marks, meaning more variation in performance.<br><br>' +
    '<b>Exam Tip:</b> When comparing distributions, always mention a measure of average (median) AND a measure of spread (IQR or range). Use "in context" language — don\'t just say "higher", say what it means.',
  content_zh:
    '<b>经典例题 1</b> [4 分 — 进阶]<br>' +
    '已知累积频数图，$n = 60$：(a) 求中位数、$Q_1$、$Q_3$ 和 IQR。(b) 多少人得分超过 70？<br><br>' +
    '<b>解答：</b><br>' +
    '(a) 中位数在第 $\\frac{60}{2} = 30$ 项 → 读取：中位数 $= 55$。<br>' +
    '$Q_1$ 在第 15 项 $= 42$。$Q_3$ 在第 45 项 $= 68$。<br>' +
    'IQR $= 68 - 42 = 26$。<br>' +
    '(b) 70 处 CF $= 48$。超过 70 的人数 $= 60 - 48 = 12$。<br><br>' +
    '<b>经典例题 2</b> [4 分 — 进阶]<br>' +
    '分组频数表显示 80 名运动员的时间（秒）：$10$–$14$（频数 6），$15$–$19$（频数 14），$20$–$24$（频数 25），$25$–$29$（频数 20），$30$–$34$（频数 15）。完成累积频数表并求上组界。<br><br>' +
    '<b>解答：</b><br>' +
    '上组界：14.5, 19.5, 24.5, 29.5, 34.5。<br>' +
    '累积频数：6, 20, 45, 65, 80。<br>' +
    '描点：$(14.5, 6)$、$(19.5, 20)$、$(24.5, 45)$、$(29.5, 65)$、$(34.5, 80)$。<br><br>' +
    '<b>经典例题 3</b> [4 分 — 进阶]<br>' +
    '累积频数曲线中 $n = 100$，中位数 48，$Q_1 = 35$，$Q_3 = 62$。已知最小值 12，最大值 85，绘制箱线图。<br><br>' +
    '<b>解答：</b><br>' +
    '箱线图的五个数值：<br>' +
    '最小值 $= 12$，$Q_1 = 35$，中位数 $= 48$，$Q_3 = 62$，最大值 $= 85$。<br>' +
    '画数轴，标出这 5 个点，从 $Q_1$ 到 $Q_3$ 画箱体，中位数处画线，须延伸到最小值和最大值。<br><br>' +
    '<b>经典例题 4</b> [5 分 — 进阶]<br>' +
    '两个班参加同一考试（各 $n = 40$）。A 班：中位数 55，IQR 20。B 班：中位数 62，IQR 35。比较两个分布。<br><br>' +
    '<b>解答：</b><br>' +
    'B 班中位数更高（$62 > 55$），因此平均成绩更好。<br>' +
    'A 班 IQR 更小（$20 < 35$），因此 A 班成绩更一致（分散程度更小）。<br>' +
    'B 班分数分布更广，说明表现差异更大。<br><br>' +
    '<b>考试技巧：</b>比较分布时，务必提及一个集中趋势指标（中位数）和一个离散程度指标（IQR 或极差）。使用"结合情境"的语言——不要只说"更高"，要说明它意味着什么。'
});

// ── 9.7 Histograms ──
add('cie', '9.7', 'knowledge', {
  content:
    '<b>Extended Only</b><br><br>' +
    '<b>Recap</b><br>' +
    '• A <b>histogram</b> displays continuous grouped data. <b>No gaps</b> between bars.<br>' +
    '• The vertical axis is <b>frequency density</b>, NOT frequency.<br>' +
    '• $\\text{Frequency density} = \\frac{\\text{frequency}}{\\text{class width}}$.<br>' +
    '• The <b>area</b> of each bar = frequency (height × width).<br><br>' +
    '<b>Key Skills</b><br>' +
    '• Draw a histogram from a grouped frequency table with <b>unequal</b> class widths.<br>' +
    '• Read frequencies from a histogram: frequency $=$ area of bar $=$ frequency density $\\times$ width.<br>' +
    '• Estimate the mean or median class from a histogram.<br><br>' +
    '<b>Watch Out!</b><br>' +
    'Bar charts have equal widths and use frequency. Histograms may have unequal widths and use frequency density.',
  content_zh:
    '<b>仅限拓展 (Extended Only)</b><br>' +
    '<br>' +
    '<b>知识回顾</b><br>' +
    '• <b>直方图</b>显示连续的分组数据。条形之间<b>没有间隙</b>。<br>' +
    '• 纵轴是<b>频数密度</b>，而不是频数。<br>' +
    '• $\\text{频数密度} = \\frac{\\text{频数}}{\\text{组距}}$。<br>' +
    '• 每个条形的<b>面积</b> = 频数（高度 × 宽度）。<br>' +
    '<br>' +
    '<b>关键技能</b><br>' +
    '• 根据组距<b>不相等</b>的分组频数表绘制直方图。<br>' +
    '• 从直方图中读取频数：频数 $=$ 条形面积 $=$ 频数密度 $\\times$ 组距。<br>' +
    '• 从直方图估算平均数或中位数所在组。<br>' +
    '<br>' +
    '<b>注意！</b><br>' +
    '条形图（柱状图）组距相等并使用频数. 直方图的组距可能不等，并使用频数密度。'
});

add('cie', '9.7', 'examples', {
  content:
    '<b>Worked Example 1</b> [4 marks — Extended]<br>' +
    'A histogram shows a bar for $20 \\leq t < 35$ with frequency density 2.4. Find the frequency for this class. Another class $35 \\leq t < 40$ has frequency 15. Find its frequency density.<br><br>' +
    '<b>Solution:</b><br>' +
    'Class $20 \\leq t < 35$: width $= 15$.<br>' +
    'Frequency $= 2.4 \\times 15 = 36$.<br>' +
    'Class $35 \\leq t < 40$: width $= 5$.<br>' +
    'Frequency density $= \\frac{15}{5} = 3$.<br><br>' +
    '<b>Worked Example 2</b> [4 marks — Extended]<br>' +
    'Complete the frequency density column for this table:<br>' +
    '$0 \\leq x < 10$ (freq 20), $10 \\leq x < 25$ (freq 30), $25 \\leq x < 30$ (freq 15), $30 \\leq x < 50$ (freq 40).<br><br>' +
    '<b>Solution:</b><br>' +
    '$0 \\leq x < 10$: width 10, FD $= \\frac{20}{10} = 2$.<br>' +
    '$10 \\leq x < 25$: width 15, FD $= \\frac{30}{15} = 2$.<br>' +
    '$25 \\leq x < 30$: width 5, FD $= \\frac{15}{5} = 3$.<br>' +
    '$30 \\leq x < 50$: width 20, FD $= \\frac{40}{20} = 2$.<br><br>' +
    '<b>Worked Example 3</b> [4 marks — Extended]<br>' +
    'A histogram has bars with these areas: 12, 20, 35, 18, 15. The total frequency is 100. One bar ($25 \\leq x < 40$) has frequency density 1.4. Find the frequency and verify using the area.<br><br>' +
    '<b>Solution:</b><br>' +
    'Width $= 40 - 25 = 15$.<br>' +
    'Frequency $= 1.4 \\times 15 = 21$.<br>' +
    'Check: area $= \\text{FD} \\times \\text{width} = 1.4 \\times 15 = 21$. ✓<br><br>' +
    '<b>Worked Example 4</b> [5 marks — Extended]<br>' +
    'A histogram shows the masses (kg) of 200 parcels. Given:<br>' +
    '$0 \\leq m < 5$ (FD = 4), $5 \\leq m < 10$ (FD = 8), $10 \\leq m < 20$ (FD = 6), $20 \\leq m < 40$ (FD = 2).<br>' +
    'Find the frequency for each class and determine the modal class.<br><br>' +
    '<b>Solution:</b><br>' +
    '$0 \\leq m < 5$: freq $= 4 \\times 5 = 20$.<br>' +
    '$5 \\leq m < 10$: freq $= 8 \\times 5 = 40$.<br>' +
    '$10 \\leq m < 20$: freq $= 6 \\times 10 = 60$.<br>' +
    '$20 \\leq m < 40$: freq $= 2 \\times 20 = 40$.<br>' +
    'Total $= 20 + 40 + 60 + 40 = 160$.<br>' +
    'The <b>modal class</b> is $5 \\leq m < 10$ (highest frequency density $= 8$, NOT highest frequency).<br><br>' +
    '<b>Exam Tip:</b> In a histogram, the modal class has the tallest bar (highest frequency density), NOT necessarily the highest frequency. Frequency $=$ density $\\times$ width.',
  content_zh:
    '<b>经典例题 1</b> [4 分 — 进阶]<br>' +
    '直方图中 $20 \\leq t < 35$ 组的频数密度为 2.4。求该组频数。另一组 $35 \\leq t < 40$ 的频数为 15，求其频数密度。<br><br>' +
    '<b>解答：</b><br>' +
    '组 $20 \\leq t < 35$：组距 $= 15$。频数 $= 2.4 \\times 15 = 36$。<br>' +
    '组 $35 \\leq t < 40$：组距 $= 5$。频数密度 $= \\frac{15}{5} = 3$。<br><br>' +
    '<b>经典例题 2</b> [4 分 — 进阶]<br>' +
    '完成以下表格的频数密度列：<br>' +
    '$0 \\leq x < 10$（频数 20），$10 \\leq x < 25$（频数 30），$25 \\leq x < 30$（频数 15），$30 \\leq x < 50$（频数 40）。<br><br>' +
    '<b>解答：</b><br>' +
    '$0 \\leq x < 10$：组距 10，FD $= \\frac{20}{10} = 2$。<br>' +
    '$10 \\leq x < 25$：组距 15，FD $= \\frac{30}{15} = 2$。<br>' +
    '$25 \\leq x < 30$：组距 5，FD $= \\frac{15}{5} = 3$。<br>' +
    '$30 \\leq x < 50$：组距 20，FD $= \\frac{40}{20} = 2$。<br><br>' +
    '<b>经典例题 3</b> [4 分 — 进阶]<br>' +
    '直方图各条形的面积分别为 12, 20, 35, 18, 15，总频数 100。其中 $25 \\leq x < 40$ 组的频数密度为 1.4，求频数并用面积验证。<br><br>' +
    '<b>解答：</b><br>' +
    '组距 $= 40 - 25 = 15$。<br>' +
    '频数 $= 1.4 \\times 15 = 21$。<br>' +
    '验证：面积 $= \\text{FD} \\times \\text{组距} = 1.4 \\times 15 = 21$。正确。<br><br>' +
    '<b>经典例题 4</b> [5 分 — 进阶]<br>' +
    '直方图显示 200 个包裹的质量（kg）：<br>' +
    '$0 \\leq m < 5$（FD = 4），$5 \\leq m < 10$（FD = 8），$10 \\leq m < 20$（FD = 6），$20 \\leq m < 40$（FD = 2）。<br>' +
    '求各组频数并确定众数组。<br><br>' +
    '<b>解答：</b><br>' +
    '$0 \\leq m < 5$：频数 $= 4 \\times 5 = 20$。<br>' +
    '$5 \\leq m < 10$：频数 $= 8 \\times 5 = 40$。<br>' +
    '$10 \\leq m < 20$：频数 $= 6 \\times 10 = 60$。<br>' +
    '$20 \\leq m < 40$：频数 $= 2 \\times 20 = 40$。<br>' +
    '总计 $= 20 + 40 + 60 + 40 = 160$。<br>' +
    '<b>众数组</b>是 $5 \\leq m < 10$（最高频数密度 $= 8$，而非最高频数）。<br><br>' +
    '<b>考试技巧：</b>在直方图中，众数组是最高条形（最高频数密度），而不一定是最高频数。频数 $=$ 密度 $\\times$ 组距。'
});

/* ══════════════════════════════════════════════════
   OUTPUT SQL
   ══════════════════════════════════════════════════ */
console.log('-- Section content seed: CIE Ch7-9');
console.log('-- Generated ' + edits.length + ' rows');
console.log('');
edits.forEach(function(e) {
  var j = JSON.stringify(e.data).replace(/'/g, "''");
  console.log(
    "INSERT INTO section_edits (board, section_id, module, data) VALUES ('" +
    e.board + "', '" + e.section_id + "', '" + e.module + "', '" +
    j + "'::jsonb) ON CONFLICT (board, section_id, module) DO UPDATE SET data = EXCLUDED.data, updated_at = now();"
  );
});
console.log('');
console.log('-- Done: ' + edits.length + ' rows upserted');
