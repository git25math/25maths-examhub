/* ==============================================================
   levels.js -- Vocabulary data (CIE 0580 Algebra)
   ============================================================== */

var LEVELS = [
  {
    title: "代数表达式",
    timer: 80,
    comboBonus: 3,
    vocabulary: [
      { id: 1, type: "word", content: "Variable" },      { id: 1, type: "def", content: "变量" },
      { id: 2, type: "word", content: "Constant" },      { id: 2, type: "def", content: "常量" },
      { id: 3, type: "word", content: "Coefficient" },   { id: 3, type: "def", content: "系数" },
      { id: 4, type: "word", content: "Expression" },    { id: 4, type: "def", content: "表达式" },
      { id: 5, type: "word", content: "Term" },          { id: 5, type: "def", content: "项" },
      { id: 6, type: "word", content: "Like terms" },    { id: 6, type: "def", content: "同类项" },
      { id: 7, type: "word", content: "Formula" },       { id: 7, type: "def", content: "公式" },
      { id: 8, type: "word", content: "Substitution" },  { id: 8, type: "def", content: "代入" }
    ]
  },
  {
    title: "指数与方程",
    timer: 80,
    comboBonus: 3,
    vocabulary: [
      { id: 1, type: "word", content: "Index" },                    { id: 1, type: "def", content: "指数" },
      { id: 2, type: "word", content: "Linear equation" },          { id: 2, type: "def", content: "一次方程" },
      { id: 3, type: "word", content: "Quadratic equation" },       { id: 3, type: "def", content: "二次方程" },
      { id: 4, type: "word", content: "Simultaneous equations" },   { id: 4, type: "def", content: "联立方程" },
      { id: 5, type: "word", content: "Subject of a formula" },     { id: 5, type: "def", content: "公式的主项" },
      { id: 6, type: "word", content: "Quadratic formula" },        { id: 6, type: "def", content: "求根公式" },
      { id: 7, type: "word", content: "Root / Solution" },          { id: 7, type: "def", content: "根/解" }
    ]
  },
  {
    title: "图形与函数",
    timer: 90,
    comboBonus: 3,
    vocabulary: [
      { id: 1, type: "word", content: "Gradient" },     { id: 1, type: "def", content: "斜率" },
      { id: 2, type: "word", content: "y-intercept" },  { id: 2, type: "def", content: "y轴截距" },
      { id: 3, type: "word", content: "Tangent" },      { id: 3, type: "def", content: "切线" },
      { id: 4, type: "word", content: "Asymptote" },    { id: 4, type: "def", content: "渐近线" },
      { id: 5, type: "word", content: "Turning point" },{ id: 5, type: "def", content: "极值点" },
      { id: 6, type: "word", content: "Function" },     { id: 6, type: "def", content: "函数" }
    ]
  }
];
