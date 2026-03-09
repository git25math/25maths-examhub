/* ==============================================================
   levels.js -- Mathematics Vocabulary
   CIE 0580 (55 levels) + Edexcel 4MA1 (47 levels) + 25Maths Y7-11 (173 levels)
   ============================================================== */

var LEVELS = [

/* ═══════════════════════════════════════════════════════════
   NUMBER (9 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 1: Number Types (10 words)
{
  board: 'cie', slug: 'num-types', category: 'number', title: 'Number Types', titleZh: '\u6570\u7684\u7c7b\u578b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Natural number"},{id:"0",type:"def",content:"\u81ea\u7136\u6570"},
    {id:"1",type:"word",content:"Integer"},{id:"1",type:"def",content:"\u6574\u6570"},
    {id:"2",type:"word",content:"Prime number"},{id:"2",type:"def",content:"\u8d28\u6570"},
    {id:"3",type:"word",content:"Square number"},{id:"3",type:"def",content:"\u5e73\u65b9\u6570"},
    {id:"4",type:"word",content:"Cube number"},{id:"4",type:"def",content:"\u7acb\u65b9\u6570"},
    {id:"5",type:"word",content:"Rational number"},{id:"5",type:"def",content:"\u6709\u7406\u6570"},
    {id:"6",type:"word",content:"Irrational number"},{id:"6",type:"def",content:"\u65e0\u7406\u6570"},
    {id:"7",type:"word",content:"Reciprocal"},{id:"7",type:"def",content:"\u5012\u6570"},
    {id:"8",type:"word",content:"Factor"},{id:"8",type:"def",content:"\u56e0\u6570"},
    {id:"9",type:"word",content:"Multiple"},{id:"9",type:"def",content:"\u500d\u6570"}
  ]
},

// Level 2: Factors & Multiples (7 words)
{
  board: 'cie', slug: 'num-factors', category: 'number', title: 'Factors & Multiples', titleZh: '\u56e0\u6570\u4e0e\u500d\u6570', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"HCF"},{id:"0",type:"def",content:"\u6700\u5927\u516c\u56e0\u6570"},
    {id:"1",type:"word",content:"LCM"},{id:"1",type:"def",content:"\u6700\u5c0f\u516c\u500d\u6570"},
    {id:"2",type:"word",content:"Common factor"},{id:"2",type:"def",content:"\u516c\u56e0\u6570"},
    {id:"3",type:"word",content:"Common multiple"},{id:"3",type:"def",content:"\u516c\u500d\u6570"},
    {id:"4",type:"word",content:"Prime factor"},{id:"4",type:"def",content:"\u8d28\u56e0\u6570"},
    {id:"5",type:"word",content:"Prime factorisation"},{id:"5",type:"def",content:"\u8d28\u56e0\u6570\u5206\u89e3"},
    {id:"6",type:"word",content:"Divisible"},{id:"6",type:"def",content:"\u53ef\u6574\u9664"}
  ]
},

// Level 3: Sets (7 words)
{
  board: 'cie', slug: 'num-sets', category: 'number', title: 'Sets', titleZh: '\u96c6\u5408', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Set"},{id:"0",type:"def",content:"\u96c6\u5408"},
    {id:"1",type:"word",content:"Universal set"},{id:"1",type:"def",content:"\u5168\u96c6"},
    {id:"2",type:"word",content:"Intersection"},{id:"2",type:"def",content:"\u4ea4\u96c6"},
    {id:"3",type:"word",content:"Union"},{id:"3",type:"def",content:"\u5e76\u96c6"},
    {id:"4",type:"word",content:"Complement"},{id:"4",type:"def",content:"\u8865\u96c6"},
    {id:"5",type:"word",content:"Subset"},{id:"5",type:"def",content:"\u5b50\u96c6"},
    {id:"6",type:"word",content:"Venn diagram"},{id:"6",type:"def",content:"\u97e6\u6069\u56fe"}
  ]
},

// Level 4: Powers, Roots & Standard Form (8 words)
{
  board: 'cie', slug: 'num-powers', category: 'number', title: 'Powers, Roots & Standard Form', titleZh: '\u5e42\u3001\u6839\u4e0e\u6807\u51c6\u5f0f', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Square root"},{id:"0",type:"def",content:"\u5e73\u65b9\u6839"},
    {id:"1",type:"word",content:"Cube root"},{id:"1",type:"def",content:"\u7acb\u65b9\u6839"},
    {id:"2",type:"word",content:"Index (Power)"},{id:"2",type:"def",content:"\u5e42"},
    {id:"3",type:"word",content:"Standard form"},{id:"3",type:"def",content:"\u6807\u51c6\u5f0f"},
    {id:"4",type:"word",content:"Base"},{id:"4",type:"def",content:"\u5e95\u6570"},
    {id:"5",type:"word",content:"Exponent"},{id:"5",type:"def",content:"\u6307\u6570"},
    {id:"6",type:"word",content:"Negative index"},{id:"6",type:"def",content:"\u8d1f\u6307\u6570"},
    {id:"7",type:"word",content:"Fractional index"},{id:"7",type:"def",content:"\u5206\u6570\u6307\u6570"}
  ]
},

// Level 5: Fractions, Decimals & Percentages (9 words)
{
  board: 'cie', slug: 'num-fractions', category: 'number', title: 'Fractions, Decimals & Percentages', titleZh: '\u5206\u6570\u3001\u5c0f\u6570\u4e0e\u767e\u5206\u6570', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Numerator"},{id:"0",type:"def",content:"\u5206\u5b50"},
    {id:"1",type:"word",content:"Denominator"},{id:"1",type:"def",content:"\u5206\u6bcd"},
    {id:"2",type:"word",content:"Proper fraction"},{id:"2",type:"def",content:"\u771f\u5206\u6570"},
    {id:"3",type:"word",content:"Improper fraction"},{id:"3",type:"def",content:"\u5047\u5206\u6570"},
    {id:"4",type:"word",content:"Mixed number"},{id:"4",type:"def",content:"\u5e26\u5206\u6570"},
    {id:"5",type:"word",content:"Recurring decimal"},{id:"5",type:"def",content:"\u5faa\u73af\u5c0f\u6570"},
    {id:"6",type:"word",content:"Percentage"},{id:"6",type:"def",content:"\u767e\u5206\u6570"},
    {id:"7",type:"word",content:"Equivalent fraction"},{id:"7",type:"def",content:"\u7b49\u503c\u5206\u6570"},
    {id:"8",type:"word",content:"Decimal place"},{id:"8",type:"def",content:"\u5c0f\u6570\u4f4d"}
  ]
},

// Level 6: Operations & Ordering (10 words)
{
  board: 'cie', slug: 'num-ops', category: 'number', title: 'Operations & Ordering', titleZh: '\u8fd0\u7b97\u4e0e\u6392\u5e8f', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Sum"},{id:"0",type:"def",content:"\u548c"},
    {id:"1",type:"word",content:"Difference"},{id:"1",type:"def",content:"\u5dee"},
    {id:"2",type:"word",content:"Product"},{id:"2",type:"def",content:"\u79ef"},
    {id:"3",type:"word",content:"Quotient"},{id:"3",type:"def",content:"\u5546"},
    {id:"4",type:"word",content:"BIDMAS"},{id:"4",type:"def",content:"\u8fd0\u7b97\u987a\u5e8f"},
    {id:"5",type:"word",content:"Negative number"},{id:"5",type:"def",content:"\u8d1f\u6570"},
    {id:"6",type:"word",content:"Absolute value"},{id:"6",type:"def",content:"\u7edd\u5bf9\u503c"},
    {id:"7",type:"word",content:"Ordering"},{id:"7",type:"def",content:"\u6392\u5e8f"},
    {id:"8",type:"word",content:"Greater than"},{id:"8",type:"def",content:"\u5927\u4e8e"},
    {id:"9",type:"word",content:"Less than"},{id:"9",type:"def",content:"\u5c0f\u4e8e"}
  ]
},

// Level 7: Estimation & Accuracy (7 words)
{
  board: 'cie', slug: 'num-accuracy', category: 'number', title: 'Estimation & Accuracy', titleZh: '\u4f30\u7b97\u4e0e\u7cbe\u786e\u5ea6', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Significant figure"},{id:"0",type:"def",content:"\u6709\u6548\u6570\u5b57"},
    {id:"1",type:"word",content:"Estimation"},{id:"1",type:"def",content:"\u4f30\u7b97"},
    {id:"2",type:"word",content:"Upper bound"},{id:"2",type:"def",content:"\u4e0a\u754c"},
    {id:"3",type:"word",content:"Lower bound"},{id:"3",type:"def",content:"\u4e0b\u754c"},
    {id:"4",type:"word",content:"Rounding"},{id:"4",type:"def",content:"\u56db\u820d\u4e94\u5165"},
    {id:"5",type:"word",content:"Truncation"},{id:"5",type:"def",content:"\u622a\u65ad"},
    {id:"6",type:"word",content:"Accuracy"},{id:"6",type:"def",content:"\u7cbe\u786e\u5ea6"}
  ]
},

// Level 8: Ratio, Proportion & Percentage (9 words)
{
  board: 'cie', slug: 'num-ratio', category: 'number', title: 'Ratio, Proportion & Percentage', titleZh: '\u6bd4\u3001\u6bd4\u4f8b\u4e0e\u767e\u5206\u6bd4', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Ratio"},{id:"0",type:"def",content:"\u6bd4"},
    {id:"1",type:"word",content:"Proportion"},{id:"1",type:"def",content:"\u6bd4\u4f8b"},
    {id:"2",type:"word",content:"Simple interest"},{id:"2",type:"def",content:"\u5355\u5229"},
    {id:"3",type:"word",content:"Compound interest"},{id:"3",type:"def",content:"\u590d\u5229"},
    {id:"4",type:"word",content:"Reverse percentage"},{id:"4",type:"def",content:"\u9006\u5411\u767e\u5206\u6bd4"},
    {id:"5",type:"word",content:"Percentage change"},{id:"5",type:"def",content:"\u767e\u5206\u6bd4\u53d8\u5316"},
    {id:"6",type:"word",content:"Profit"},{id:"6",type:"def",content:"\u5229\u6da6"},
    {id:"7",type:"word",content:"Loss"},{id:"7",type:"def",content:"\u4e8f\u635f"},
    {id:"8",type:"word",content:"Discount"},{id:"8",type:"def",content:"\u6298\u6263"}
  ]
},

// Level 9: Rates, Money & Time (7 words)
{
  board: 'cie', slug: 'num-rates', category: 'number', title: 'Rates, Money & Time', titleZh: '\u7387\u3001\u8d27\u5e01\u4e0e\u65f6\u95f4', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Rate"},{id:"0",type:"def",content:"\u6bd4\u7387"},
    {id:"1",type:"word",content:"Speed"},{id:"1",type:"def",content:"\u901f\u5ea6"},
    {id:"2",type:"word",content:"Density"},{id:"2",type:"def",content:"\u5bc6\u5ea6"},
    {id:"3",type:"word",content:"Exponential growth"},{id:"3",type:"def",content:"\u6307\u6570\u589e\u957f"},
    {id:"4",type:"word",content:"Surd"},{id:"4",type:"def",content:"\u6839\u5f0f"},
    {id:"5",type:"word",content:"Exchange rate"},{id:"5",type:"def",content:"\u6c47\u7387"},
    {id:"6",type:"word",content:"Depreciation"},{id:"6",type:"def",content:"\u6298\u65e7"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   ALGEBRA (7 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 10: Algebraic Expressions (10 words)
{
  board: 'cie', slug: 'alg-expr', category: 'algebra', title: 'Algebraic Expressions', titleZh: '\u4ee3\u6570\u8868\u8fbe\u5f0f', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Variable"},{id:"0",type:"def",content:"\u53d8\u91cf"},
    {id:"1",type:"word",content:"Constant"},{id:"1",type:"def",content:"\u5e38\u91cf"},
    {id:"2",type:"word",content:"Coefficient"},{id:"2",type:"def",content:"\u7cfb\u6570"},
    {id:"3",type:"word",content:"Expression"},{id:"3",type:"def",content:"\u8868\u8fbe\u5f0f"},
    {id:"4",type:"word",content:"Term"},{id:"4",type:"def",content:"\u9879"},
    {id:"5",type:"word",content:"Like terms"},{id:"5",type:"def",content:"\u540c\u7c7b\u9879"},
    {id:"6",type:"word",content:"Formula"},{id:"6",type:"def",content:"\u516c\u5f0f"},
    {id:"7",type:"word",content:"Substitution"},{id:"7",type:"def",content:"\u4ee3\u5165"},
    {id:"8",type:"word",content:"Polynomial"},{id:"8",type:"def",content:"\u591a\u9879\u5f0f"},
    {id:"9",type:"word",content:"Binomial"},{id:"9",type:"def",content:"\u4e8c\u9879\u5f0f"}
  ]
},

// Level 11: Algebraic Manipulation (8 words)
{
  board: 'cie', slug: 'alg-manip', category: 'algebra', title: 'Algebraic Manipulation', titleZh: '\u4ee3\u6570\u8fd0\u7b97', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Simplify"},{id:"0",type:"def",content:"\u5316\u7b80"},
    {id:"1",type:"word",content:"Expand"},{id:"1",type:"def",content:"\u5c55\u5f00"},
    {id:"2",type:"word",content:"Factorise"},{id:"2",type:"def",content:"\u56e0\u5f0f\u5206\u89e3"},
    {id:"3",type:"word",content:"Common factor (algebra)"},{id:"3",type:"def",content:"\u516c\u56e0\u5f0f"},
    {id:"4",type:"word",content:"Difference of squares"},{id:"4",type:"def",content:"\u5e73\u65b9\u5dee"},
    {id:"5",type:"word",content:"Complete the square"},{id:"5",type:"def",content:"\u914d\u65b9"},
    {id:"6",type:"word",content:"Rearrange"},{id:"6",type:"def",content:"\u79fb\u9879"},
    {id:"7",type:"word",content:"Cross-multiply"},{id:"7",type:"def",content:"\u4ea4\u53c9\u76f8\u4e58"}
  ]
},

// Level 12: Equations (9 words)
{
  board: 'cie', slug: 'alg-eq', category: 'algebra', title: 'Equations', titleZh: '\u65b9\u7a0b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Index (indices)"},{id:"0",type:"def",content:"\u6307\u6570"},
    {id:"1",type:"word",content:"Linear equation"},{id:"1",type:"def",content:"\u4e00\u6b21\u65b9\u7a0b"},
    {id:"2",type:"word",content:"Quadratic equation"},{id:"2",type:"def",content:"\u4e8c\u6b21\u65b9\u7a0b"},
    {id:"3",type:"word",content:"Simultaneous equations"},{id:"3",type:"def",content:"\u8054\u7acb\u65b9\u7a0b"},
    {id:"4",type:"word",content:"Subject of a formula"},{id:"4",type:"def",content:"\u516c\u5f0f\u4e3b\u9879"},
    {id:"5",type:"word",content:"Quadratic formula"},{id:"5",type:"def",content:"\u6c42\u6839\u516c\u5f0f"},
    {id:"6",type:"word",content:"Root (Solution)"},{id:"6",type:"def",content:"\u6839"},
    {id:"7",type:"word",content:"Fractional equation"},{id:"7",type:"def",content:"\u5206\u5f0f\u65b9\u7a0b"},
    {id:"8",type:"word",content:"Identity"},{id:"8",type:"def",content:"\u6052\u7b49\u5f0f"}
  ]
},

// Level 13: Inequalities & Sequences (8 words)
{
  board: 'cie', slug: 'alg-ineq', category: 'algebra', title: 'Inequalities & Sequences', titleZh: '\u4e0d\u7b49\u5f0f\u4e0e\u6570\u5217', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Inequality"},{id:"0",type:"def",content:"\u4e0d\u7b49\u5f0f"},
    {id:"1",type:"word",content:"Number line"},{id:"1",type:"def",content:"\u6570\u8f74"},
    {id:"2",type:"word",content:"Region"},{id:"2",type:"def",content:"\u533a\u57df"},
    {id:"3",type:"word",content:"Sequence"},{id:"3",type:"def",content:"\u6570\u5217"},
    {id:"4",type:"word",content:"nth term"},{id:"4",type:"def",content:"\u901a\u9879\u516c\u5f0f"},
    {id:"5",type:"word",content:"Linear sequence"},{id:"5",type:"def",content:"\u7b49\u5dee\u6570\u5217"},
    {id:"6",type:"word",content:"Quadratic sequence"},{id:"6",type:"def",content:"\u4e8c\u6b21\u6570\u5217"},
    {id:"7",type:"word",content:"Integer values"},{id:"7",type:"def",content:"\u6574\u6570\u89e3"}
  ]
},

// Level 14: Graphs (8 words)
{
  board: 'cie', slug: 'alg-graphs', category: 'algebra', title: 'Graphs', titleZh: '\u56fe\u50cf', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Gradient (Slope)"},{id:"0",type:"def",content:"\u659c\u7387"},
    {id:"1",type:"word",content:"y-intercept"},{id:"1",type:"def",content:"y\u8f74\u622a\u8ddd"},
    {id:"2",type:"word",content:"Travel graph"},{id:"2",type:"def",content:"\u884c\u7a0b\u56fe"},
    {id:"3",type:"word",content:"Tangent (to curve)"},{id:"3",type:"def",content:"\u66f2\u7ebf\u5207\u7ebf"},
    {id:"4",type:"word",content:"Asymptote"},{id:"4",type:"def",content:"\u6e10\u8fd1\u7ebf"},
    {id:"5",type:"word",content:"Turning point"},{id:"5",type:"def",content:"\u6781\u503c\u70b9"},
    {id:"6",type:"word",content:"Sketch"},{id:"6",type:"def",content:"\u8349\u56fe"},
    {id:"7",type:"word",content:"Intercept"},{id:"7",type:"def",content:"\u622a\u8ddd"}
  ]
},

// Level 15: Functions (7 words)
{
  board: 'cie', slug: 'alg-func', category: 'algebra', title: 'Functions', titleZh: '\u51fd\u6570', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Function"},{id:"0",type:"def",content:"\u51fd\u6570"},
    {id:"1",type:"word",content:"Domain"},{id:"1",type:"def",content:"\u5b9a\u4e49\u57df"},
    {id:"2",type:"word",content:"Range"},{id:"2",type:"def",content:"\u503c\u57df"},
    {id:"3",type:"word",content:"Inverse function"},{id:"3",type:"def",content:"\u53cd\u51fd\u6570"},
    {id:"4",type:"word",content:"Composite function"},{id:"4",type:"def",content:"\u590d\u5408\u51fd\u6570"},
    {id:"5",type:"word",content:"Maximum"},{id:"5",type:"def",content:"\u6700\u5927\u503c"},
    {id:"6",type:"word",content:"Minimum"},{id:"6",type:"def",content:"\u6700\u5c0f\u503c"}
  ]
},

// Level 16: Proportion & Calculus (6 words)
{
  board: 'cie', slug: 'alg-prop', category: 'algebra', title: 'Proportion & Calculus', titleZh: '\u6bd4\u4f8b\u4e0e\u5fae\u79ef\u5206', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Direct proportion"},{id:"0",type:"def",content:"\u6b63\u6bd4\u4f8b"},
    {id:"1",type:"word",content:"Inverse proportion"},{id:"1",type:"def",content:"\u53cd\u6bd4\u4f8b"},
    {id:"2",type:"word",content:"Algebraic fraction"},{id:"2",type:"def",content:"\u4ee3\u6570\u5206\u5f0f"},
    {id:"3",type:"word",content:"Derivative"},{id:"3",type:"def",content:"\u5bfc\u6570"},
    {id:"4",type:"word",content:"Stationary point"},{id:"4",type:"def",content:"\u9a7b\u70b9"},
    {id:"5",type:"word",content:"Rate of change"},{id:"5",type:"def",content:"\u53d8\u5316\u7387"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   COORDINATE GEOMETRY (5 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 17: Coordinate System (8 words)
{
  board: 'cie', slug: 'coord-system', category: 'coord', title: 'Coordinate System', titleZh: '\u5750\u6807\u7cfb', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Cartesian coordinates"},{id:"0",type:"def",content:"\u7b1b\u5361\u5c14\u5750\u6807"},
    {id:"1",type:"word",content:"x-axis"},{id:"1",type:"def",content:"x\u8f74"},
    {id:"2",type:"word",content:"y-axis"},{id:"2",type:"def",content:"y\u8f74"},
    {id:"3",type:"word",content:"Origin"},{id:"3",type:"def",content:"\u539f\u70b9"},
    {id:"4",type:"word",content:"Quadrant"},{id:"4",type:"def",content:"\u8c61\u9650"},
    {id:"5",type:"word",content:"Ordered pair"},{id:"5",type:"def",content:"\u6709\u5e8f\u5bf9"},
    {id:"6",type:"word",content:"Coordinate plane"},{id:"6",type:"def",content:"\u5750\u6807\u5e73\u9762"},
    {id:"7",type:"word",content:"Plot"},{id:"7",type:"def",content:"\u63cf\u70b9"}
  ]
},

// Level 18: Linear Graphs & Gradient (8 words)
{
  board: 'cie', slug: 'coord-linear', category: 'coord', title: 'Linear Graphs & Gradient', titleZh: '\u7ebf\u6027\u56fe\u50cf\u4e0e\u659c\u7387', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Linear function"},{id:"0",type:"def",content:"\u4e00\u6b21\u51fd\u6570"},
    {id:"1",type:"word",content:"Straight-line graph"},{id:"1",type:"def",content:"\u76f4\u7ebf\u56fe"},
    {id:"2",type:"word",content:"Table of values"},{id:"2",type:"def",content:"\u6570\u503c\u8868"},
    {id:"3",type:"word",content:"Graph"},{id:"3",type:"def",content:"\u56fe\u50cf"},
    {id:"4",type:"word",content:"Positive gradient"},{id:"4",type:"def",content:"\u6b63\u659c\u7387"},
    {id:"5",type:"word",content:"Negative gradient"},{id:"5",type:"def",content:"\u8d1f\u659c\u7387"},
    {id:"6",type:"word",content:"Zero gradient"},{id:"6",type:"def",content:"\u96f6\u659c\u7387"},
    {id:"7",type:"word",content:"Gradient formula"},{id:"7",type:"def",content:"\u659c\u7387\u516c\u5f0f"}
  ]
},

// Level 19: Line Equations (7 words)
{
  board: 'cie', slug: 'coord-line-eq', category: 'coord', title: 'Line Equations', titleZh: '\u76f4\u7ebf\u65b9\u7a0b', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"x-intercept"},{id:"0",type:"def",content:"x\u8f74\u622a\u8ddd"},
    {id:"1",type:"word",content:"Slope-intercept form"},{id:"1",type:"def",content:"\u659c\u622a\u5f0f"},
    {id:"2",type:"word",content:"General form"},{id:"2",type:"def",content:"\u4e00\u822c\u5f0f"},
    {id:"3",type:"word",content:"Equation of a line"},{id:"3",type:"def",content:"\u76f4\u7ebf\u65b9\u7a0b"},
    {id:"4",type:"word",content:"Intersection point"},{id:"4",type:"def",content:"\u4ea4\u70b9"},
    {id:"5",type:"word",content:"Point-slope form"},{id:"5",type:"def",content:"\u70b9\u659c\u5f0f"},
    {id:"6",type:"word",content:"Graphical solution"},{id:"6",type:"def",content:"\u56fe\u89e3\u6cd5"}
  ]
},

// Level 20: Parallel & Perpendicular Lines (7 words)
{
  board: 'cie', slug: 'coord-parallel', category: 'coord', title: 'Parallel & Perpendicular Lines', titleZh: '\u5e73\u884c\u4e0e\u5782\u76f4', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Parallel lines"},{id:"0",type:"def",content:"\u5e73\u884c\u7ebf"},
    {id:"1",type:"word",content:"Perpendicular lines"},{id:"1",type:"def",content:"\u5782\u76f4\u7ebf"},
    {id:"2",type:"word",content:"Negative reciprocal"},{id:"2",type:"def",content:"\u8d1f\u5012\u6570"},
    {id:"3",type:"word",content:"Horizontal line"},{id:"3",type:"def",content:"\u6c34\u5e73\u7ebf"},
    {id:"4",type:"word",content:"Vertical line"},{id:"4",type:"def",content:"\u7ad6\u76f4\u7ebf"},
    {id:"5",type:"word",content:"Collinear"},{id:"5",type:"def",content:"\u5171\u7ebf"},
    {id:"6",type:"word",content:"Normal"},{id:"6",type:"def",content:"\u6cd5\u7ebf"}
  ]
},

// Level 21: Distance & Midpoint (6 words)
{
  board: 'cie', slug: 'coord-distance', category: 'coord', title: 'Distance & Midpoint', titleZh: '\u8ddd\u79bb\u4e0e\u4e2d\u70b9', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Distance formula"},{id:"0",type:"def",content:"\u8ddd\u79bb\u516c\u5f0f"},
    {id:"1",type:"word",content:"Length of line segment"},{id:"1",type:"def",content:"\u7ebf\u6bb5\u957f\u5ea6"},
    {id:"2",type:"word",content:"Midpoint"},{id:"2",type:"def",content:"\u4e2d\u70b9"},
    {id:"3",type:"word",content:"Midpoint formula"},{id:"3",type:"def",content:"\u4e2d\u70b9\u516c\u5f0f"},
    {id:"4",type:"word",content:"Perpendicular bisector"},{id:"4",type:"def",content:"\u5782\u76f4\u5e73\u5206\u7ebf"},
    {id:"5",type:"word",content:"Line segment"},{id:"5",type:"def",content:"\u7ebf\u6bb5"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   GEOMETRY (7 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 22: Angles (9 words)
{
  board: 'cie', slug: 'geom-angles-basic', category: 'geometry', title: 'Angles', titleZh: '\u89d2', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Acute angle"},{id:"0",type:"def",content:"\u9510\u89d2"},
    {id:"1",type:"word",content:"Right angle"},{id:"1",type:"def",content:"\u76f4\u89d2"},
    {id:"2",type:"word",content:"Obtuse angle"},{id:"2",type:"def",content:"\u949d\u89d2"},
    {id:"3",type:"word",content:"Reflex angle"},{id:"3",type:"def",content:"\u4f18\u89d2"},
    {id:"4",type:"word",content:"Straight angle"},{id:"4",type:"def",content:"\u5e73\u89d2"},
    {id:"5",type:"word",content:"Vertically opposite angles"},{id:"5",type:"def",content:"\u5bf9\u9876\u89d2"},
    {id:"6",type:"word",content:"Supplementary angles"},{id:"6",type:"def",content:"\u4e92\u8865\u89d2"},
    {id:"7",type:"word",content:"Complementary angles"},{id:"7",type:"def",content:"\u4e92\u4f59\u89d2"},
    {id:"8",type:"word",content:"Angle bisector"},{id:"8",type:"def",content:"\u89d2\u5e73\u5206\u7ebf"}
  ]
},

// Level 23: Shapes & Triangles (9 words)
{
  board: 'cie', slug: 'geom-triangles', category: 'geometry', title: 'Shapes & Triangles', titleZh: '\u56fe\u5f62\u4e0e\u4e09\u89d2\u5f62', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Point"},{id:"0",type:"def",content:"\u70b9"},
    {id:"1",type:"word",content:"Angle"},{id:"1",type:"def",content:"\u89d2"},
    {id:"2",type:"word",content:"Parallel"},{id:"2",type:"def",content:"\u5e73\u884c"},
    {id:"3",type:"word",content:"Perpendicular"},{id:"3",type:"def",content:"\u5782\u76f4"},
    {id:"4",type:"word",content:"Triangle"},{id:"4",type:"def",content:"\u4e09\u89d2\u5f62"},
    {id:"5",type:"word",content:"Equilateral triangle"},{id:"5",type:"def",content:"\u7b49\u8fb9\u4e09\u89d2\u5f62"},
    {id:"6",type:"word",content:"Isosceles triangle"},{id:"6",type:"def",content:"\u7b49\u8170\u4e09\u89d2\u5f62"},
    {id:"7",type:"word",content:"Right-angled triangle"},{id:"7",type:"def",content:"\u76f4\u89d2\u4e09\u89d2\u5f62"},
    {id:"8",type:"word",content:"Scalene triangle"},{id:"8",type:"def",content:"\u4e0d\u7b49\u8fb9\u4e09\u89d2\u5f62"}
  ]
},

// Level 24: Quadrilaterals & Polygons (9 words)
{
  board: 'cie', slug: 'geom-polygons', category: 'geometry', title: 'Quadrilaterals & Polygons', titleZh: '\u56db\u8fb9\u5f62\u4e0e\u591a\u8fb9\u5f62', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Quadrilateral"},{id:"0",type:"def",content:"\u56db\u8fb9\u5f62"},
    {id:"1",type:"word",content:"Parallelogram"},{id:"1",type:"def",content:"\u5e73\u884c\u56db\u8fb9\u5f62"},
    {id:"2",type:"word",content:"Trapezium"},{id:"2",type:"def",content:"\u68af\u5f62"},
    {id:"3",type:"word",content:"Rhombus"},{id:"3",type:"def",content:"\u83f1\u5f62"},
    {id:"4",type:"word",content:"Kite"},{id:"4",type:"def",content:"\u9e22\u5f62"},
    {id:"5",type:"word",content:"Polygon"},{id:"5",type:"def",content:"\u591a\u8fb9\u5f62"},
    {id:"6",type:"word",content:"Regular polygon"},{id:"6",type:"def",content:"\u6b63\u591a\u8fb9\u5f62"},
    {id:"7",type:"word",content:"Vertex (vertices)"},{id:"7",type:"def",content:"\u9876\u70b9"},
    {id:"8",type:"word",content:"Diagonal"},{id:"8",type:"def",content:"\u5bf9\u89d2\u7ebf"}
  ]
},

// Level 25: Circle Parts (10 words)
{
  board: 'cie', slug: 'geom-circles', category: 'geometry', title: 'Circle Parts', titleZh: '\u5706\u7684\u90e8\u5206', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Circle"},{id:"0",type:"def",content:"\u5706"},
    {id:"1",type:"word",content:"Radius"},{id:"1",type:"def",content:"\u534a\u5f84"},
    {id:"2",type:"word",content:"Diameter"},{id:"2",type:"def",content:"\u76f4\u5f84"},
    {id:"3",type:"word",content:"Circumference"},{id:"3",type:"def",content:"\u5706\u5468"},
    {id:"4",type:"word",content:"Chord"},{id:"4",type:"def",content:"\u5f26"},
    {id:"5",type:"word",content:"Arc"},{id:"5",type:"def",content:"\u5f27"},
    {id:"6",type:"word",content:"Sector"},{id:"6",type:"def",content:"\u6247\u5f62"},
    {id:"7",type:"word",content:"Tangent (to circle)"},{id:"7",type:"def",content:"\u5706\u7684\u5207\u7ebf"},
    {id:"8",type:"word",content:"Major arc"},{id:"8",type:"def",content:"\u4f18\u5f27"},
    {id:"9",type:"word",content:"Minor arc"},{id:"9",type:"def",content:"\u52a3\u5f27"}
  ]
},

// Level 26: Solids & Constructions (10 words)
{
  board: 'cie', slug: 'geom-solids', category: 'geometry', title: 'Solids & Constructions', titleZh: '\u7acb\u4f53\u4e0e\u4f5c\u56fe', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Net"},{id:"0",type:"def",content:"\u5c55\u5f00\u56fe"},
    {id:"1",type:"word",content:"Prism"},{id:"1",type:"def",content:"\u68f1\u67f1"},
    {id:"2",type:"word",content:"Pyramid"},{id:"2",type:"def",content:"\u68f1\u9525"},
    {id:"3",type:"word",content:"Cylinder"},{id:"3",type:"def",content:"\u5706\u67f1"},
    {id:"4",type:"word",content:"Cone"},{id:"4",type:"def",content:"\u5706\u9525"},
    {id:"5",type:"word",content:"Sphere"},{id:"5",type:"def",content:"\u7403"},
    {id:"6",type:"word",content:"Bearing"},{id:"6",type:"def",content:"\u65b9\u4f4d\u89d2"},
    {id:"7",type:"word",content:"Scale drawing"},{id:"7",type:"def",content:"\u6bd4\u4f8b\u5c3a\u56fe"},
    {id:"8",type:"word",content:"Locus (Loci)"},{id:"8",type:"def",content:"\u8f68\u8ff9"},
    {id:"9",type:"word",content:"Cross-section"},{id:"9",type:"def",content:"\u622a\u9762"}
  ]
},

// Level 27: Similarity, Symmetry & Congruence (6 words)
{
  board: 'cie', slug: 'geom-similarity', category: 'geometry', title: 'Similarity, Symmetry & Congruence', titleZh: '\u76f8\u4f3c\u3001\u5bf9\u79f0\u4e0e\u5168\u7b49', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Similar"},{id:"0",type:"def",content:"\u76f8\u4f3c"},
    {id:"1",type:"word",content:"Congruent"},{id:"1",type:"def",content:"\u5168\u7b49"},
    {id:"2",type:"word",content:"Scale factor"},{id:"2",type:"def",content:"\u6bd4\u4f8b\u56e0\u6570"},
    {id:"3",type:"word",content:"Line symmetry"},{id:"3",type:"def",content:"\u7ebf\u5bf9\u79f0"},
    {id:"4",type:"word",content:"Rotational symmetry"},{id:"4",type:"def",content:"\u65cb\u8f6c\u5bf9\u79f0"},
    {id:"5",type:"word",content:"Order of symmetry"},{id:"5",type:"def",content:"\u5bf9\u79f0\u9636\u6570"}
  ]
},

// Level 28: Angle Properties & Circle Theorems (7 words)
{
  board: 'cie', slug: 'geom-circle-thm', category: 'geometry', title: 'Angle Properties & Circle Theorems', titleZh: '\u89d2\u7684\u6027\u8d28\u4e0e\u5706\u5b9a\u7406', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Interior angle"},{id:"0",type:"def",content:"\u5185\u89d2"},
    {id:"1",type:"word",content:"Exterior angle"},{id:"1",type:"def",content:"\u5916\u89d2"},
    {id:"2",type:"word",content:"Corresponding angles"},{id:"2",type:"def",content:"\u540c\u4f4d\u89d2"},
    {id:"3",type:"word",content:"Alternate angles"},{id:"3",type:"def",content:"\u5185\u9519\u89d2"},
    {id:"4",type:"word",content:"Co-interior angles"},{id:"4",type:"def",content:"\u540c\u65c1\u5185\u89d2"},
    {id:"5",type:"word",content:"Cyclic quadrilateral"},{id:"5",type:"def",content:"\u5706\u5185\u63a5\u56db\u8fb9\u5f62"},
    {id:"6",type:"word",content:"Alternate segment theorem"},{id:"6",type:"def",content:"\u5f27\u5207\u89d2\u5b9a\u7406"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   MENSURATION (5 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 29: Units & Measurement (7 words)
{
  board: 'cie', slug: 'mens-units', category: 'mensuration', title: 'Units & Measurement', titleZh: '\u5355\u4f4d\u4e0e\u6d4b\u91cf', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Metric unit"},{id:"0",type:"def",content:"\u516c\u5236\u5355\u4f4d"},
    {id:"1",type:"word",content:"Convert"},{id:"1",type:"def",content:"\u6362\u7b97"},
    {id:"2",type:"word",content:"Length"},{id:"2",type:"def",content:"\u957f\u5ea6"},
    {id:"3",type:"word",content:"Mass"},{id:"3",type:"def",content:"\u8d28\u91cf"},
    {id:"4",type:"word",content:"Capacity"},{id:"4",type:"def",content:"\u5bb9\u91cf"},
    {id:"5",type:"word",content:"Area (unit)"},{id:"5",type:"def",content:"\u9762\u79ef\u5355\u4f4d"},
    {id:"6",type:"word",content:"Volume (unit)"},{id:"6",type:"def",content:"\u4f53\u79ef\u5355\u4f4d"}
  ]
},

// Level 30: Area & Perimeter (8 words)
{
  board: 'cie', slug: 'mens-area', category: 'mensuration', title: 'Area & Perimeter', titleZh: '\u9762\u79ef\u4e0e\u5468\u957f', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Perimeter"},{id:"0",type:"def",content:"\u5468\u957f"},
    {id:"1",type:"word",content:"Area"},{id:"1",type:"def",content:"\u9762\u79ef"},
    {id:"2",type:"word",content:"Base (of shape)"},{id:"2",type:"def",content:"\u5e95"},
    {id:"3",type:"word",content:"Height"},{id:"3",type:"def",content:"\u9ad8"},
    {id:"4",type:"word",content:"Rectangle"},{id:"4",type:"def",content:"\u957f\u65b9\u5f62"},
    {id:"5",type:"word",content:"Square"},{id:"5",type:"def",content:"\u6b63\u65b9\u5f62"},
    {id:"6",type:"word",content:"Width"},{id:"6",type:"def",content:"\u5bbd\u5ea6"},
    {id:"7",type:"word",content:"Composite area"},{id:"7",type:"def",content:"\u7ec4\u5408\u9762\u79ef"}
  ]
},

// Level 31: Circles, Arcs & Sectors (7 words)
{
  board: 'cie', slug: 'mens-circles', category: 'mensuration', title: 'Circles, Arcs & Sectors', titleZh: '\u5706\u3001\u5f27\u4e0e\u6247\u5f62', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Circumference (formula)"},{id:"0",type:"def",content:"\u5706\u5468\u957f\u516c\u5f0f"},
    {id:"1",type:"word",content:"Pi (\u03c0)"},{id:"1",type:"def",content:"\u5706\u5468\u7387"},
    {id:"2",type:"word",content:"Area of circle"},{id:"2",type:"def",content:"\u5706\u9762\u79ef"},
    {id:"3",type:"word",content:"Arc length"},{id:"3",type:"def",content:"\u5f27\u957f"},
    {id:"4",type:"word",content:"Sector area"},{id:"4",type:"def",content:"\u6247\u5f62\u9762\u79ef"},
    {id:"5",type:"word",content:"Semicircle"},{id:"5",type:"def",content:"\u534a\u5706"},
    {id:"6",type:"word",content:"Segment"},{id:"6",type:"def",content:"\u5f13\u5f62"}
  ]
},

// Level 32: Surface Area & Volume (8 words)
{
  board: 'cie', slug: 'mens-surface', category: 'mensuration', title: 'Surface Area & Volume', titleZh: '\u8868\u9762\u79ef\u4e0e\u4f53\u79ef', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Surface area"},{id:"0",type:"def",content:"\u8868\u9762\u79ef"},
    {id:"1",type:"word",content:"Volume"},{id:"1",type:"def",content:"\u4f53\u79ef"},
    {id:"2",type:"word",content:"Cuboid"},{id:"2",type:"def",content:"\u957f\u65b9\u4f53"},
    {id:"3",type:"word",content:"Curved surface area"},{id:"3",type:"def",content:"\u66f2\u9762\u9762\u79ef"},
    {id:"4",type:"word",content:"Slant height"},{id:"4",type:"def",content:"\u659c\u9ad8"},
    {id:"5",type:"word",content:"Lateral face"},{id:"5",type:"def",content:"\u4fa7\u9762"},
    {id:"6",type:"word",content:"Perpendicular height"},{id:"6",type:"def",content:"\u5782\u76f4\u9ad8\u5ea6"},
    {id:"7",type:"word",content:"Total surface area"},{id:"7",type:"def",content:"\u603b\u8868\u9762\u79ef"}
  ]
},

// Level 33: 3D Solids & Compound Shapes (8 words)
{
  board: 'cie', slug: 'mens-3d', category: 'mensuration', title: '3D Solids & Compound Shapes', titleZh: '\u4e09\u7ef4\u7acb\u4f53\u4e0e\u7ec4\u5408\u56fe\u5f62', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Hemisphere"},{id:"0",type:"def",content:"\u534a\u7403"},
    {id:"1",type:"word",content:"Frustum"},{id:"1",type:"def",content:"\u68f1\u53f0"},
    {id:"2",type:"word",content:"Compound shape"},{id:"2",type:"def",content:"\u7ec4\u5408\u56fe\u5f62"},
    {id:"3",type:"word",content:"Compound solid"},{id:"3",type:"def",content:"\u7ec4\u5408\u4f53"},
    {id:"4",type:"word",content:"Dimension"},{id:"4",type:"def",content:"\u7ef4\u5ea6"},
    {id:"5",type:"word",content:"Similar solids"},{id:"5",type:"def",content:"\u76f8\u4f3c\u4f53"},
    {id:"6",type:"word",content:"Volume scale factor"},{id:"6",type:"def",content:"\u4f53\u79ef\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"7",type:"word",content:"Area scale factor"},{id:"7",type:"def",content:"\u9762\u79ef\u6bd4\u4f8b\u56e0\u5b50"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   TRIGONOMETRY (5 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 34: Pythagoras' Theorem (7 words)
{
  board: 'cie', slug: 'trig-pythag', category: 'trigonometry', title: "Pythagoras' Theorem", titleZh: '\u52fe\u80a1\u5b9a\u7406', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Pythagoras' theorem"},{id:"0",type:"def",content:"\u52fe\u80a1\u5b9a\u7406"},
    {id:"1",type:"word",content:"Hypotenuse"},{id:"1",type:"def",content:"\u659c\u8fb9"},
    {id:"2",type:"word",content:"Opposite (side)"},{id:"2",type:"def",content:"\u5bf9\u8fb9"},
    {id:"3",type:"word",content:"Adjacent (side)"},{id:"3",type:"def",content:"\u90bb\u8fb9"},
    {id:"4",type:"word",content:"Pythagorean triple"},{id:"4",type:"def",content:"\u52fe\u80a1\u6570"},
    {id:"5",type:"word",content:"Perpendicular sides"},{id:"5",type:"def",content:"\u76f4\u89d2\u8fb9"},
    {id:"6",type:"word",content:"Exact length"},{id:"6",type:"def",content:"\u7cbe\u786e\u957f\u5ea6"}
  ]
},

// Level 35: Trigonometric Ratios (7 words)
{
  board: 'cie', slug: 'trig-ratios', category: 'trigonometry', title: 'Trigonometric Ratios', titleZh: '\u4e09\u89d2\u6bd4', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Sine (sin)"},{id:"0",type:"def",content:"\u6b63\u5f26"},
    {id:"1",type:"word",content:"Cosine (cos)"},{id:"1",type:"def",content:"\u4f59\u5f26"},
    {id:"2",type:"word",content:"Tangent (tan)"},{id:"2",type:"def",content:"\u6b63\u5207"},
    {id:"3",type:"word",content:"SOHCAHTOA"},{id:"3",type:"def",content:"\u4e09\u89d2\u6bd4\u53e3\u8bc0"},
    {id:"4",type:"word",content:"Inverse trig function"},{id:"4",type:"def",content:"\u53cd\u4e09\u89d2\u51fd\u6570"},
    {id:"5",type:"word",content:"Angle of elevation"},{id:"5",type:"def",content:"\u4ef0\u89d2"},
    {id:"6",type:"word",content:"Angle of depression"},{id:"6",type:"def",content:"\u4fef\u89d2"}
  ]
},

// Level 36: Trig Graphs & Exact Values (8 words)
{
  board: 'cie', slug: 'trig-graphs', category: 'trigonometry', title: 'Trig Graphs & Exact Values', titleZh: '\u4e09\u89d2\u56fe\u50cf\u4e0e\u7cbe\u786e\u503c', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Exact value"},{id:"0",type:"def",content:"\u7cbe\u786e\u503c"},
    {id:"1",type:"word",content:"Trigonometric graph"},{id:"1",type:"def",content:"\u4e09\u89d2\u51fd\u6570\u56fe\u50cf"},
    {id:"2",type:"word",content:"Period"},{id:"2",type:"def",content:"\u5468\u671f"},
    {id:"3",type:"word",content:"Amplitude"},{id:"3",type:"def",content:"\u632f\u5e45"},
    {id:"4",type:"word",content:"Symmetry (of graph)"},{id:"4",type:"def",content:"\u56fe\u5f62\u5bf9\u79f0\u6027"},
    {id:"5",type:"word",content:"Trigonometric equation"},{id:"5",type:"def",content:"\u4e09\u89d2\u65b9\u7a0b"},
    {id:"6",type:"word",content:"Horizontal"},{id:"6",type:"def",content:"\u6c34\u5e73\u7684"},
    {id:"7",type:"word",content:"Line of sight"},{id:"7",type:"def",content:"\u89c6\u7ebf"}
  ]
},

// Level 37: Non-Right-Angled Triangles (7 words)
{
  board: 'cie', slug: 'trig-non-right', category: 'trigonometry', title: 'Non-Right-Angled Triangles', titleZh: '\u975e\u76f4\u89d2\u4e09\u89d2\u5f62', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Sine rule"},{id:"0",type:"def",content:"\u6b63\u5f26\u5b9a\u7406"},
    {id:"1",type:"word",content:"Cosine rule"},{id:"1",type:"def",content:"\u4f59\u5f26\u5b9a\u7406"},
    {id:"2",type:"word",content:"Included angle"},{id:"2",type:"def",content:"\u5939\u89d2"},
    {id:"3",type:"word",content:"Area formula (\u00bdab sin C)"},{id:"3",type:"def",content:"\u9762\u79ef\u516c\u5f0f"},
    {id:"4",type:"word",content:"Ambiguous case"},{id:"4",type:"def",content:"\u4e8c\u89e3\u60c5\u51b5"},
    {id:"5",type:"word",content:"Obtuse triangle"},{id:"5",type:"def",content:"\u949d\u89d2\u4e09\u89d2\u5f62"},
    {id:"6",type:"word",content:"Acute triangle"},{id:"6",type:"def",content:"\u9510\u89d2\u4e09\u89d2\u5f62"}
  ]
},

// Level 38: 3D Trigonometry (6 words)
{
  board: 'cie', slug: 'trig-3d', category: 'trigonometry', title: '3D Trigonometry', titleZh: '\u4e09\u7ef4\u4e09\u89d2', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"3D problem"},{id:"0",type:"def",content:"\u4e09\u7ef4\u95ee\u9898"},
    {id:"1",type:"word",content:"Angle between line and plane"},{id:"1",type:"def",content:"\u7ebf\u9762\u89d2"},
    {id:"2",type:"word",content:"Plane"},{id:"2",type:"def",content:"\u5e73\u9762"},
    {id:"3",type:"word",content:"Space diagonal"},{id:"3",type:"def",content:"\u4f53\u5bf9\u89d2\u7ebf"},
    {id:"4",type:"word",content:"Perpendicular distance"},{id:"4",type:"def",content:"\u5782\u76f4\u8ddd\u79bb"},
    {id:"5",type:"word",content:"Vertical height"},{id:"5",type:"def",content:"\u5782\u76f4\u9ad8"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   VECTORS & TRANSFORMATIONS (5 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 39: Transformations (9 words)
{
  board: 'cie', slug: 'vec-transform', category: 'vectors', title: 'Transformations', titleZh: '\u53d8\u6362', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Transformation"},{id:"0",type:"def",content:"\u53d8\u6362"},
    {id:"1",type:"word",content:"Image"},{id:"1",type:"def",content:"\u50cf"},
    {id:"2",type:"word",content:"Object"},{id:"2",type:"def",content:"\u539f\u50cf"},
    {id:"3",type:"word",content:"Reflection"},{id:"3",type:"def",content:"\u53cd\u5c04"},
    {id:"4",type:"word",content:"Mirror line"},{id:"4",type:"def",content:"\u5bf9\u79f0\u8f74"},
    {id:"5",type:"word",content:"Translation"},{id:"5",type:"def",content:"\u5e73\u79fb"},
    {id:"6",type:"word",content:"Translation vector"},{id:"6",type:"def",content:"\u5e73\u79fb\u5411\u91cf"},
    {id:"7",type:"word",content:"Invariant point"},{id:"7",type:"def",content:"\u4e0d\u53d8\u70b9"},
    {id:"8",type:"word",content:"Combined transformation"},{id:"8",type:"def",content:"\u590d\u5408\u53d8\u6362"}
  ]
},

// Level 40: Rotation & Enlargement (8 words)
{
  board: 'cie', slug: 'vec-rotation', category: 'vectors', title: 'Rotation & Enlargement', titleZh: '\u65cb\u8f6c\u4e0e\u653e\u5927', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Rotation"},{id:"0",type:"def",content:"\u65cb\u8f6c"},
    {id:"1",type:"word",content:"Centre of rotation"},{id:"1",type:"def",content:"\u65cb\u8f6c\u4e2d\u5fc3"},
    {id:"2",type:"word",content:"Angle of rotation"},{id:"2",type:"def",content:"\u65cb\u8f6c\u89d2"},
    {id:"3",type:"word",content:"Enlargement"},{id:"3",type:"def",content:"\u653e\u5927"},
    {id:"4",type:"word",content:"Centre of enlargement"},{id:"4",type:"def",content:"\u653e\u5927\u4e2d\u5fc3"},
    {id:"5",type:"word",content:"Fractional scale factor"},{id:"5",type:"def",content:"\u5206\u6570\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"6",type:"word",content:"Negative scale factor"},{id:"6",type:"def",content:"\u8d1f\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"7",type:"word",content:"Clockwise"},{id:"7",type:"def",content:"\u987a\u65f6\u9488"}
  ]
},

// Level 41: Vector Basics (7 words)
{
  board: 'cie', slug: 'vec-basics', category: 'vectors', title: 'Vector Basics', titleZh: '\u5411\u91cf\u57fa\u7840', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Vector"},{id:"0",type:"def",content:"\u5411\u91cf"},
    {id:"1",type:"word",content:"Column vector"},{id:"1",type:"def",content:"\u5217\u5411\u91cf"},
    {id:"2",type:"word",content:"Displacement"},{id:"2",type:"def",content:"\u4f4d\u79fb"},
    {id:"3",type:"word",content:"Scalar"},{id:"3",type:"def",content:"\u6807\u91cf"},
    {id:"4",type:"word",content:"Scalar multiplication"},{id:"4",type:"def",content:"\u6807\u91cf\u4e58\u6cd5"},
    {id:"5",type:"word",content:"Vector addition"},{id:"5",type:"def",content:"\u5411\u91cf\u52a0\u6cd5"},
    {id:"6",type:"word",content:"Vector subtraction"},{id:"6",type:"def",content:"\u5411\u91cf\u51cf\u6cd5"}
  ]
},

// Level 42: Magnitude & Special Vectors (5 words)
{
  board: 'cie', slug: 'vec-magnitude', category: 'vectors', title: 'Magnitude & Special Vectors', titleZh: '\u6a21\u4e0e\u7279\u6b8a\u5411\u91cf', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Magnitude"},{id:"0",type:"def",content:"\u6a21"},
    {id:"1",type:"word",content:"Unit vector"},{id:"1",type:"def",content:"\u5355\u4f4d\u5411\u91cf"},
    {id:"2",type:"word",content:"Position vector"},{id:"2",type:"def",content:"\u4f4d\u7f6e\u5411\u91cf"},
    {id:"3",type:"word",content:"Directed line segment"},{id:"3",type:"def",content:"\u6709\u5411\u7ebf\u6bb5"},
    {id:"4",type:"word",content:"Zero vector"},{id:"4",type:"def",content:"\u96f6\u5411\u91cf"}
  ]
},

// Level 43: Vector Relationships (6 words)
{
  board: 'cie', slug: 'vec-relations', category: 'vectors', title: 'Vector Relationships', titleZh: '\u5411\u91cf\u5173\u7cfb', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Parallel vectors"},{id:"0",type:"def",content:"\u5e73\u884c\u5411\u91cf"},
    {id:"1",type:"word",content:"Equal vectors"},{id:"1",type:"def",content:"\u76f8\u7b49\u5411\u91cf"},
    {id:"2",type:"word",content:"Resultant vector"},{id:"2",type:"def",content:"\u5408\u5411\u91cf"},
    {id:"3",type:"word",content:"Midpoint vector"},{id:"3",type:"def",content:"\u4e2d\u70b9\u5411\u91cf"},
    {id:"4",type:"word",content:"Ratio (vectors)"},{id:"4",type:"def",content:"\u5411\u91cf\u6bd4"},
    {id:"5",type:"word",content:"Proof (vectors)"},{id:"5",type:"def",content:"\u5411\u91cf\u8bc1\u660e"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   STATISTICS & PROBABILITY (7 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 44: Data Classification (9 words)
{
  board: 'cie', slug: 'stat-data', category: 'statistics', title: 'Data Classification', titleZh: '\u6570\u636e\u5206\u7c7b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Data"},{id:"0",type:"def",content:"\u6570\u636e"},
    {id:"1",type:"word",content:"Discrete data"},{id:"1",type:"def",content:"\u79bb\u6563\u6570\u636e"},
    {id:"2",type:"word",content:"Continuous data"},{id:"2",type:"def",content:"\u8fde\u7eed\u6570\u636e"},
    {id:"3",type:"word",content:"Frequency"},{id:"3",type:"def",content:"\u9891\u6570"},
    {id:"4",type:"word",content:"Tally"},{id:"4",type:"def",content:"\u8ba1\u6570\u7b26\u53f7"},
    {id:"5",type:"word",content:"Two-way table"},{id:"5",type:"def",content:"\u53cc\u5411\u8868"},
    {id:"6",type:"word",content:"Class interval"},{id:"6",type:"def",content:"\u7ec4\u8ddd"},
    {id:"7",type:"word",content:"Grouped data"},{id:"7",type:"def",content:"\u5206\u7ec4\u6570\u636e"},
    {id:"8",type:"word",content:"Frequency table"},{id:"8",type:"def",content:"\u9891\u6570\u8868"}
  ]
},

// Level 45: Averages & Spread (10 words)
{
  board: 'cie', slug: 'stat-averages', category: 'statistics', title: 'Averages & Spread', titleZh: '\u5e73\u5747\u6570\u4e0e\u79bb\u6563\u5ea6', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Mean"},{id:"0",type:"def",content:"\u5e73\u5747\u6570"},
    {id:"1",type:"word",content:"Median"},{id:"1",type:"def",content:"\u4e2d\u4f4d\u6570"},
    {id:"2",type:"word",content:"Mode"},{id:"2",type:"def",content:"\u4f17\u6570"},
    {id:"3",type:"word",content:"Range (statistics)"},{id:"3",type:"def",content:"\u5168\u8ddd"},
    {id:"4",type:"word",content:"Quartile"},{id:"4",type:"def",content:"\u56db\u5206\u4f4d\u6570"},
    {id:"5",type:"word",content:"Interquartile range"},{id:"5",type:"def",content:"\u56db\u5206\u4f4d\u8ddd"},
    {id:"6",type:"word",content:"Modal class"},{id:"6",type:"def",content:"\u4f17\u6570\u7ec4"},
    {id:"7",type:"word",content:"Estimated mean"},{id:"7",type:"def",content:"\u4f30\u8ba1\u5e73\u5747\u6570"},
    {id:"8",type:"word",content:"Lower quartile"},{id:"8",type:"def",content:"\u4e0b\u56db\u5206\u4f4d\u6570"},
    {id:"9",type:"word",content:"Upper quartile"},{id:"9",type:"def",content:"\u4e0a\u56db\u5206\u4f4d\u6570"}
  ]
},

// Level 46: Charts & Diagrams (9 words)
{
  board: 'cie', slug: 'stat-charts', category: 'statistics', title: 'Charts & Diagrams', titleZh: '\u56fe\u8868', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Bar chart"},{id:"0",type:"def",content:"\u6761\u5f62\u56fe"},
    {id:"1",type:"word",content:"Pie chart"},{id:"1",type:"def",content:"\u997c\u56fe"},
    {id:"2",type:"word",content:"Pictogram"},{id:"2",type:"def",content:"\u8c61\u5f62\u56fe"},
    {id:"3",type:"word",content:"Stem-and-leaf diagram"},{id:"3",type:"def",content:"\u8308\u53f6\u56fe"},
    {id:"4",type:"word",content:"Scatter diagram"},{id:"4",type:"def",content:"\u6563\u70b9\u56fe"},
    {id:"5",type:"word",content:"Correlation"},{id:"5",type:"def",content:"\u76f8\u5173\u6027"},
    {id:"6",type:"word",content:"Line of best fit"},{id:"6",type:"def",content:"\u6700\u4f73\u62df\u5408\u7ebf"},
    {id:"7",type:"word",content:"Frequency polygon"},{id:"7",type:"def",content:"\u9891\u7387\u6298\u7ebf\u56fe"},
    {id:"8",type:"word",content:"Dual bar chart"},{id:"8",type:"def",content:"\u53cc\u6761\u5f62\u56fe"}
  ]
},

// Level 47: Advanced Statistics (8 words)
{
  board: 'cie', slug: 'stat-advanced', category: 'statistics', title: 'Advanced Statistics', titleZh: '\u9ad8\u7ea7\u7edf\u8ba1', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Cumulative frequency"},{id:"0",type:"def",content:"\u7d2f\u79ef\u9891\u7387"},
    {id:"1",type:"word",content:"Cumulative frequency diagram"},{id:"1",type:"def",content:"\u7d2f\u79ef\u9891\u7387\u56fe"},
    {id:"2",type:"word",content:"Percentile"},{id:"2",type:"def",content:"\u767e\u5206\u4f4d\u6570"},
    {id:"3",type:"word",content:"Histogram"},{id:"3",type:"def",content:"\u76f4\u65b9\u56fe"},
    {id:"4",type:"word",content:"Frequency density"},{id:"4",type:"def",content:"\u9891\u7387\u5bc6\u5ea6"},
    {id:"5",type:"word",content:"Outlier"},{id:"5",type:"def",content:"\u79bb\u7fa4\u503c"},
    {id:"6",type:"word",content:"Box-and-whisker plot"},{id:"6",type:"def",content:"\u7bb1\u7ebf\u56fe"},
    {id:"7",type:"word",content:"Interpercentile range"},{id:"7",type:"def",content:"\u767e\u5206\u4f4d\u8ddd"}
  ]
},

// Level 48: Basic Probability (8 words)
{
  board: 'cie', slug: 'stat-prob', category: 'statistics', title: 'Basic Probability', titleZh: '\u57fa\u7840\u6982\u7387', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Probability"},{id:"0",type:"def",content:"\u6982\u7387"},
    {id:"1",type:"word",content:"Event"},{id:"1",type:"def",content:"\u4e8b\u4ef6"},
    {id:"2",type:"word",content:"Outcome"},{id:"2",type:"def",content:"\u7ed3\u679c"},
    {id:"3",type:"word",content:"Sample space"},{id:"3",type:"def",content:"\u6837\u672c\u7a7a\u95f4"},
    {id:"4",type:"word",content:"Relative frequency"},{id:"4",type:"def",content:"\u76f8\u5bf9\u9891\u7387"},
    {id:"5",type:"word",content:"Expected frequency"},{id:"5",type:"def",content:"\u671f\u671b\u9891\u6570"},
    {id:"6",type:"word",content:"Fair (Biased)"},{id:"6",type:"def",content:"\u516c\u5e73\uff08\u6709\u504f\uff09"},
    {id:"7",type:"word",content:"Theoretical probability"},{id:"7",type:"def",content:"\u7406\u8bba\u6982\u7387"}
  ]
},

// Level 49: Combined Probability (6 words)
{
  board: 'cie', slug: 'stat-prob-comb', category: 'statistics', title: 'Combined Probability', titleZh: '\u7ec4\u5408\u6982\u7387', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Independent events"},{id:"0",type:"def",content:"\u72ec\u7acb\u4e8b\u4ef6"},
    {id:"1",type:"word",content:"Dependent events"},{id:"1",type:"def",content:"\u76f8\u4f9d\u4e8b\u4ef6"},
    {id:"2",type:"word",content:"Tree diagram"},{id:"2",type:"def",content:"\u6811\u5f62\u56fe"},
    {id:"3",type:"word",content:"With replacement"},{id:"3",type:"def",content:"\u6709\u653e\u56de"},
    {id:"4",type:"word",content:"Without replacement"},{id:"4",type:"def",content:"\u65e0\u653e\u56de"},
    {id:"5",type:"word",content:"Mutually exclusive"},{id:"5",type:"def",content:"\u4e92\u65a5\u4e8b\u4ef6"}
  ]
},

// Level 50: Conditional Probability & Sets (6 words)
{
  board: 'cie', slug: 'stat-prob-cond', category: 'statistics', title: 'Conditional Probability & Sets', titleZh: '\u6761\u4ef6\u6982\u7387\u4e0e\u96c6\u5408', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Conditional probability"},{id:"0",type:"def",content:"\u6761\u4ef6\u6982\u7387"},
    {id:"1",type:"word",content:"Sample space diagram"},{id:"1",type:"def",content:"\u6837\u672c\u7a7a\u95f4\u56fe"},
    {id:"2",type:"word",content:"Certain"},{id:"2",type:"def",content:"\u5fc5\u7136"},
    {id:"3",type:"word",content:"Impossible"},{id:"3",type:"def",content:"\u4e0d\u53ef\u80fd"},
    {id:"4",type:"word",content:"Exhaustive events"},{id:"4",type:"def",content:"\u7a77\u4e3e\u4e8b\u4ef6"},
    {id:"5",type:"word",content:"Complement (probability)"},{id:"5",type:"def",content:"\u8865\u4e8b\u4ef6"}
  ]
},

/* ── CIE Additional Levels ── */

// Using a Calculator (§1.14)
{
  board: 'cie', slug: 'num-calculator', category: 'number', title: 'Using a Calculator', titleZh: '计算器使用', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scientific calculator"},{id:"0",type:"def",content:"科学计算器"},
    {id:"1",type:"word",content:"Display"},{id:"1",type:"def",content:"显示屏"},
    {id:"2",type:"word",content:"Order of operations"},{id:"2",type:"def",content:"运算顺序"},
    {id:"3",type:"word",content:"Brackets"},{id:"3",type:"def",content:"括号"},
    {id:"4",type:"word",content:"Memory key"},{id:"4",type:"def",content:"记忆键"},
    {id:"5",type:"word",content:"Estimation"},{id:"5",type:"def",content:"估算"}
  ]
},

// Exponential Growth & Decay (§1.17)
{
  board: 'cie', slug: 'num-growth-decay', category: 'number', title: 'Exponential Growth & Decay', titleZh: '指数增长与衰减', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Exponential growth"},{id:"0",type:"def",content:"指数增长"},
    {id:"1",type:"word",content:"Exponential decay"},{id:"1",type:"def",content:"指数衰减"},
    {id:"2",type:"word",content:"Growth factor"},{id:"2",type:"def",content:"增长因子"},
    {id:"3",type:"word",content:"Decay factor"},{id:"3",type:"def",content:"衰减因子"},
    {id:"4",type:"word",content:"Half-life"},{id:"4",type:"def",content:"半衰期"},
    {id:"5",type:"word",content:"Compound interest"},{id:"5",type:"def",content:"复利"},
    {id:"6",type:"word",content:"Depreciation"},{id:"6",type:"def",content:"折旧"}
  ]
},

// Surds (§1.18)
{
  board: 'cie', slug: 'num-surds', category: 'number', title: 'Surds', titleZh: '根式', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Surd"},{id:"0",type:"def",content:"根式（无理根）"},
    {id:"1",type:"word",content:"Simplify a surd"},{id:"1",type:"def",content:"化简根式"},
    {id:"2",type:"word",content:"Rationalise the denominator"},{id:"2",type:"def",content:"分母有理化"},
    {id:"3",type:"word",content:"Conjugate"},{id:"3",type:"def",content:"共轭"},
    {id:"4",type:"word",content:"Irrational number"},{id:"4",type:"def",content:"无理数"},
    {id:"5",type:"word",content:"Radical"},{id:"5",type:"def",content:"根号"}
  ]
},

// Sketching Curves (§2.11)
{
  board: 'cie', slug: 'alg-sketching', category: 'algebra', title: 'Sketching Curves', titleZh: '曲线草图', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Sketch"},{id:"0",type:"def",content:"草图"},
    {id:"1",type:"word",content:"Cubic curve"},{id:"1",type:"def",content:"三次曲线"},
    {id:"2",type:"word",content:"Reciprocal graph"},{id:"2",type:"def",content:"倒数图像"},
    {id:"3",type:"word",content:"Exponential curve"},{id:"3",type:"def",content:"指数曲线"},
    {id:"4",type:"word",content:"Asymptote"},{id:"4",type:"def",content:"渐近线"},
    {id:"5",type:"word",content:"Turning point"},{id:"5",type:"def",content:"转折点"},
    {id:"6",type:"word",content:"Intercept"},{id:"6",type:"def",content:"截距"}
  ]
},

// Constructions & Loci (§4.8)
{
  board: 'cie', slug: 'geom-loci', category: 'geometry', title: 'Constructions & Loci', titleZh: '作图与轨迹', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Locus"},{id:"0",type:"def",content:"轨迹"},
    {id:"1",type:"word",content:"Loci"},{id:"1",type:"def",content:"轨迹（复数）"},
    {id:"2",type:"word",content:"Perpendicular bisector"},{id:"2",type:"def",content:"垂直平分线"},
    {id:"3",type:"word",content:"Angle bisector"},{id:"3",type:"def",content:"角平分线"},
    {id:"4",type:"word",content:"Equidistant"},{id:"4",type:"def",content:"等距的"},
    {id:"5",type:"word",content:"Arc (construction)"},{id:"5",type:"def",content:"弧（作图用）"},
    {id:"6",type:"word",content:"Compass"},{id:"6",type:"def",content:"圆规"}
  ]
},

/* ═══════════════════════════════════════════════════════════
   EDEXCEL IGCSE 4MA1 (47 levels)
   ═══════════════════════════════════════════════════════════ */

/* ── Numbers & Number System (8 groups) ── */

// Level 51: Integers & Place Value (8 words)
{
  board: 'edx', slug: 'edx-num-integers', category: 'edx-number', title: 'Integers & Place Value', titleZh: '\u6574\u6570\u4e0e\u4f4d\u503c', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Integer"},{id:"0",type:"def",content:"\u6574\u6570"},
    {id:"1",type:"word",content:"Place value"},{id:"1",type:"def",content:"\u4f4d\u503c"},
    {id:"2",type:"word",content:"Directed number"},{id:"2",type:"def",content:"\u6709\u5411\u6570"},
    {id:"3",type:"word",content:"Odd number"},{id:"3",type:"def",content:"\u5947\u6570"},
    {id:"4",type:"word",content:"Even number"},{id:"4",type:"def",content:"\u5076\u6570"},
    {id:"5",type:"word",content:"BODMAS"},{id:"5",type:"def",content:"\u8fd0\u7b97\u987a\u5e8f"},
    {id:"6",type:"word",content:"Negative number"},{id:"6",type:"def",content:"\u8d1f\u6570"},
    {id:"7",type:"word",content:"Absolute value"},{id:"7",type:"def",content:"\u7edd\u5bf9\u503c"}
  ]
},

// Level 52: Fractions (8 words)
{
  board: 'edx', slug: 'edx-num-fractions', category: 'edx-number', title: 'Fractions', titleZh: '\u5206\u6570', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Numerator"},{id:"0",type:"def",content:"\u5206\u5b50"},
    {id:"1",type:"word",content:"Denominator"},{id:"1",type:"def",content:"\u5206\u6bcd"},
    {id:"2",type:"word",content:"Equivalent fraction"},{id:"2",type:"def",content:"\u7b49\u503c\u5206\u6570"},
    {id:"3",type:"word",content:"Proper fraction"},{id:"3",type:"def",content:"\u771f\u5206\u6570"},
    {id:"4",type:"word",content:"Improper fraction"},{id:"4",type:"def",content:"\u5047\u5206\u6570"},
    {id:"5",type:"word",content:"Mixed number"},{id:"5",type:"def",content:"\u5e26\u5206\u6570"},
    {id:"6",type:"word",content:"Vulgar fraction"},{id:"6",type:"def",content:"\u666e\u901a\u5206\u6570"},
    {id:"7",type:"word",content:"Common denominator"},{id:"7",type:"def",content:"\u516c\u5206\u6bcd"}
  ]
},

// Level 53: Decimals & Conversions (7 words)
{
  board: 'edx', slug: 'edx-num-decimals', category: 'edx-number', title: 'Decimals & Conversions', titleZh: '\u5c0f\u6570\u4e0e\u6362\u7b97', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Decimal"},{id:"0",type:"def",content:"\u5c0f\u6570"},
    {id:"1",type:"word",content:"Recurring decimal"},{id:"1",type:"def",content:"\u5faa\u73af\u5c0f\u6570"},
    {id:"2",type:"word",content:"Terminating decimal"},{id:"2",type:"def",content:"\u6709\u9650\u5c0f\u6570"},
    {id:"3",type:"word",content:"Decimal place"},{id:"3",type:"def",content:"\u5c0f\u6570\u4f4d"},
    {id:"4",type:"word",content:"Convert"},{id:"4",type:"def",content:"\u6362\u7b97"},
    {id:"5",type:"word",content:"Percentage"},{id:"5",type:"def",content:"\u767e\u5206\u6570"},
    {id:"6",type:"word",content:"Fraction-decimal conversion"},{id:"6",type:"def",content:"\u5206\u6570\u5c0f\u6570\u8f6c\u6362"}
  ]
},

// Level 54: Powers & Roots (8 words)
{
  board: 'edx', slug: 'edx-num-powers', category: 'edx-number', title: 'Powers & Roots', titleZh: '\u5e42\u4e0e\u6839', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Square number"},{id:"0",type:"def",content:"\u5e73\u65b9\u6570"},
    {id:"1",type:"word",content:"Cube number"},{id:"1",type:"def",content:"\u7acb\u65b9\u6570"},
    {id:"2",type:"word",content:"Square root"},{id:"2",type:"def",content:"\u5e73\u65b9\u6839"},
    {id:"3",type:"word",content:"Cube root"},{id:"3",type:"def",content:"\u7acb\u65b9\u6839"},
    {id:"4",type:"word",content:"Index (Power)"},{id:"4",type:"def",content:"\u6307\u6570"},
    {id:"5",type:"word",content:"Standard form"},{id:"5",type:"def",content:"\u6807\u51c6\u5f0f"},
    {id:"6",type:"word",content:"Surd"},{id:"6",type:"def",content:"\u6839\u5f0f"},
    {id:"7",type:"word",content:"Negative index"},{id:"7",type:"def",content:"\u8d1f\u6307\u6570"}
  ]
},

// Level 55: Set Language (9 words)
{
  board: 'edx', slug: 'edx-num-sets', category: 'edx-number', title: 'Set Language', titleZh: '\u96c6\u5408\u8bed\u8a00', timer: 80, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Set"},{id:"0",type:"def",content:"\u96c6\u5408"},
    {id:"1",type:"word",content:"Element"},{id:"1",type:"def",content:"\u5143\u7d20"},
    {id:"2",type:"word",content:"Union"},{id:"2",type:"def",content:"\u5e76\u96c6"},
    {id:"3",type:"word",content:"Intersection"},{id:"3",type:"def",content:"\u4ea4\u96c6"},
    {id:"4",type:"word",content:"Complement"},{id:"4",type:"def",content:"\u8865\u96c6"},
    {id:"5",type:"word",content:"Subset"},{id:"5",type:"def",content:"\u5b50\u96c6"},
    {id:"6",type:"word",content:"Universal set"},{id:"6",type:"def",content:"\u5168\u96c6"},
    {id:"7",type:"word",content:"Empty set"},{id:"7",type:"def",content:"\u7a7a\u96c6"},
    {id:"8",type:"word",content:"Venn diagram"},{id:"8",type:"def",content:"\u97e6\u6069\u56fe"}
  ]
},

// Level 56: Percentages (8 words)
{
  board: 'edx', slug: 'edx-num-pct', category: 'edx-number', title: 'Percentages', titleZh: '\u767e\u5206\u6570', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Percentage increase"},{id:"0",type:"def",content:"\u767e\u5206\u6bd4\u589e\u957f"},
    {id:"1",type:"word",content:"Percentage decrease"},{id:"1",type:"def",content:"\u767e\u5206\u6bd4\u51cf\u5c11"},
    {id:"2",type:"word",content:"Reverse percentage"},{id:"2",type:"def",content:"\u9006\u5411\u767e\u5206\u6bd4"},
    {id:"3",type:"word",content:"Simple interest"},{id:"3",type:"def",content:"\u5355\u5229"},
    {id:"4",type:"word",content:"Compound interest"},{id:"4",type:"def",content:"\u590d\u5229"},
    {id:"5",type:"word",content:"Profit"},{id:"5",type:"def",content:"\u5229\u6da6"},
    {id:"6",type:"word",content:"Loss"},{id:"6",type:"def",content:"\u4e8f\u635f"},
    {id:"7",type:"word",content:"Discount"},{id:"7",type:"def",content:"\u6298\u6263"}
  ]
},

// Level 57: Ratio & Proportion (7 words)
{
  board: 'edx', slug: 'edx-num-ratio', category: 'edx-number', title: 'Ratio & Proportion', titleZh: '\u6bd4\u4e0e\u6bd4\u4f8b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Ratio"},{id:"0",type:"def",content:"\u6bd4"},
    {id:"1",type:"word",content:"Proportion"},{id:"1",type:"def",content:"\u6bd4\u4f8b"},
    {id:"2",type:"word",content:"Simplify ratio"},{id:"2",type:"def",content:"\u5316\u7b80\u6bd4"},
    {id:"3",type:"word",content:"Divide in ratio"},{id:"3",type:"def",content:"\u6309\u6bd4\u5206\u914d"},
    {id:"4",type:"word",content:"Map scale"},{id:"4",type:"def",content:"\u5730\u56fe\u6bd4\u4f8b\u5c3a"},
    {id:"5",type:"word",content:"Unit ratio"},{id:"5",type:"def",content:"\u5355\u4f4d\u6bd4"},
    {id:"6",type:"word",content:"Best buy"},{id:"6",type:"def",content:"\u6700\u4f73\u8d2d\u4e70"}
  ]
},

// Level 58: Accuracy & Estimation (7 words)
{
  board: 'edx', slug: 'edx-num-accuracy', category: 'edx-number', title: 'Accuracy & Estimation', titleZh: '\u7cbe\u786e\u5ea6\u4e0e\u4f30\u7b97', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Significant figure"},{id:"0",type:"def",content:"\u6709\u6548\u6570\u5b57"},
    {id:"1",type:"word",content:"Rounding"},{id:"1",type:"def",content:"\u56db\u820d\u4e94\u5165"},
    {id:"2",type:"word",content:"Estimation"},{id:"2",type:"def",content:"\u4f30\u7b97"},
    {id:"3",type:"word",content:"Upper bound"},{id:"3",type:"def",content:"\u4e0a\u754c"},
    {id:"4",type:"word",content:"Lower bound"},{id:"4",type:"def",content:"\u4e0b\u754c"},
    {id:"5",type:"word",content:"Error interval"},{id:"5",type:"def",content:"\u8bef\u5dee\u533a\u95f4"},
    {id:"6",type:"word",content:"Truncation"},{id:"6",type:"def",content:"\u622a\u65ad"}
  ]
},

/* ── Equations, Formulae & Identities (6 groups) ── */

// Level 59: Algebraic Expressions (8 words)
{
  board: 'edx', slug: 'edx-alg-expr', category: 'edx-algebra', title: 'Algebraic Expressions', titleZh: '\u4ee3\u6570\u8868\u8fbe\u5f0f', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Variable"},{id:"0",type:"def",content:"\u53d8\u91cf"},
    {id:"1",type:"word",content:"Constant"},{id:"1",type:"def",content:"\u5e38\u91cf"},
    {id:"2",type:"word",content:"Coefficient"},{id:"2",type:"def",content:"\u7cfb\u6570"},
    {id:"3",type:"word",content:"Expression"},{id:"3",type:"def",content:"\u8868\u8fbe\u5f0f"},
    {id:"4",type:"word",content:"Term"},{id:"4",type:"def",content:"\u9879"},
    {id:"5",type:"word",content:"Like terms"},{id:"5",type:"def",content:"\u540c\u7c7b\u9879"},
    {id:"6",type:"word",content:"Substitution"},{id:"6",type:"def",content:"\u4ee3\u5165"},
    {id:"7",type:"word",content:"Index notation"},{id:"7",type:"def",content:"\u6307\u6570\u8bb0\u6cd5"}
  ]
},

// Level 60: Algebraic Manipulation (8 words)
{
  board: 'edx', slug: 'edx-alg-manip', category: 'edx-algebra', title: 'Algebraic Manipulation', titleZh: '\u4ee3\u6570\u8fd0\u7b97', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Simplify"},{id:"0",type:"def",content:"\u5316\u7b80"},
    {id:"1",type:"word",content:"Expand"},{id:"1",type:"def",content:"\u5c55\u5f00"},
    {id:"2",type:"word",content:"Factorise"},{id:"2",type:"def",content:"\u56e0\u5f0f\u5206\u89e3"},
    {id:"3",type:"word",content:"Common factor"},{id:"3",type:"def",content:"\u516c\u56e0\u5f0f"},
    {id:"4",type:"word",content:"Difference of squares"},{id:"4",type:"def",content:"\u5e73\u65b9\u5dee"},
    {id:"5",type:"word",content:"Complete the square"},{id:"5",type:"def",content:"\u914d\u65b9"},
    {id:"6",type:"word",content:"Rearrange"},{id:"6",type:"def",content:"\u79fb\u9879"},
    {id:"7",type:"word",content:"Cross-multiply"},{id:"7",type:"def",content:"\u4ea4\u53c9\u76f8\u4e58"}
  ]
},

// Level 61: Linear Equations (7 words)
{
  board: 'edx', slug: 'edx-alg-linear', category: 'edx-algebra', title: 'Linear Equations', titleZh: '\u4e00\u6b21\u65b9\u7a0b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Linear equation"},{id:"0",type:"def",content:"\u4e00\u6b21\u65b9\u7a0b"},
    {id:"1",type:"word",content:"Solution"},{id:"1",type:"def",content:"\u89e3"},
    {id:"2",type:"word",content:"Subject of formula"},{id:"2",type:"def",content:"\u516c\u5f0f\u4e3b\u9879"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"\u65b9\u7a0b"},
    {id:"4",type:"word",content:"Identity"},{id:"4",type:"def",content:"\u6052\u7b49\u5f0f"},
    {id:"5",type:"word",content:"Formula"},{id:"5",type:"def",content:"\u516c\u5f0f"},
    {id:"6",type:"word",content:"Forming equations"},{id:"6",type:"def",content:"\u5efa\u7acb\u65b9\u7a0b"}
  ]
},

// Level 62: Quadratic Equations (7 words)
{
  board: 'edx', slug: 'edx-alg-quadratic', category: 'edx-algebra', title: 'Quadratic Equations', titleZh: '\u4e8c\u6b21\u65b9\u7a0b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Quadratic equation"},{id:"0",type:"def",content:"\u4e8c\u6b21\u65b9\u7a0b"},
    {id:"1",type:"word",content:"Quadratic formula"},{id:"1",type:"def",content:"\u6c42\u6839\u516c\u5f0f"},
    {id:"2",type:"word",content:"Root"},{id:"2",type:"def",content:"\u6839"},
    {id:"3",type:"word",content:"Completing the square"},{id:"3",type:"def",content:"\u914d\u65b9\u6cd5"},
    {id:"4",type:"word",content:"Discriminant"},{id:"4",type:"def",content:"\u5224\u522b\u5f0f"},
    {id:"5",type:"word",content:"Parabola"},{id:"5",type:"def",content:"\u629b\u7269\u7ebf"},
    {id:"6",type:"word",content:"Factorise quadratic"},{id:"6",type:"def",content:"\u4e8c\u6b21\u56e0\u5f0f\u5206\u89e3"}
  ]
},

// Level 63: Simultaneous Equations & Proportion (7 words)
{
  board: 'edx', slug: 'edx-alg-simul', category: 'edx-algebra', title: 'Simultaneous Equations & Proportion', titleZh: '\u8054\u7acb\u65b9\u7a0b\u4e0e\u6bd4\u4f8b', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Simultaneous equations"},{id:"0",type:"def",content:"\u8054\u7acb\u65b9\u7a0b"},
    {id:"1",type:"word",content:"Elimination"},{id:"1",type:"def",content:"\u6d88\u5143\u6cd5"},
    {id:"2",type:"word",content:"Substitution method"},{id:"2",type:"def",content:"\u4ee3\u5165\u6cd5"},
    {id:"3",type:"word",content:"Direct proportion"},{id:"3",type:"def",content:"\u6b63\u6bd4\u4f8b"},
    {id:"4",type:"word",content:"Inverse proportion"},{id:"4",type:"def",content:"\u53cd\u6bd4\u4f8b"},
    {id:"5",type:"word",content:"Proportion constant"},{id:"5",type:"def",content:"\u6bd4\u4f8b\u5e38\u6570"},
    {id:"6",type:"word",content:"Variation"},{id:"6",type:"def",content:"\u53d8\u5316"}
  ]
},

// Level 64: Inequalities (7 words)
{
  board: 'edx', slug: 'edx-alg-ineq', category: 'edx-algebra', title: 'Inequalities', titleZh: '\u4e0d\u7b49\u5f0f', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Inequality"},{id:"0",type:"def",content:"\u4e0d\u7b49\u5f0f"},
    {id:"1",type:"word",content:"Number line"},{id:"1",type:"def",content:"\u6570\u8f74"},
    {id:"2",type:"word",content:"Region"},{id:"2",type:"def",content:"\u533a\u57df"},
    {id:"3",type:"word",content:"Integer values"},{id:"3",type:"def",content:"\u6574\u6570\u89e3"},
    {id:"4",type:"word",content:"Quadratic inequality"},{id:"4",type:"def",content:"\u4e8c\u6b21\u4e0d\u7b49\u5f0f"},
    {id:"5",type:"word",content:"Solution set"},{id:"5",type:"def",content:"\u89e3\u96c6"},
    {id:"6",type:"word",content:"Solve inequality"},{id:"6",type:"def",content:"\u89e3\u4e0d\u7b49\u5f0f"}
  ]
},

/* ── Sequences, Functions & Graphs (6 groups) ── */

// Level 65: Sequences (7 words)
{
  board: 'edx', slug: 'edx-fn-seq', category: 'edx-functions', title: 'Sequences', titleZh: '\u6570\u5217', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Sequence"},{id:"0",type:"def",content:"\u6570\u5217"},
    {id:"1",type:"word",content:"Term"},{id:"1",type:"def",content:"\u9879"},
    {id:"2",type:"word",content:"nth term"},{id:"2",type:"def",content:"\u901a\u9879\u516c\u5f0f"},
    {id:"3",type:"word",content:"Linear sequence"},{id:"3",type:"def",content:"\u7b49\u5dee\u6570\u5217"},
    {id:"4",type:"word",content:"Quadratic sequence"},{id:"4",type:"def",content:"\u4e8c\u6b21\u6570\u5217"},
    {id:"5",type:"word",content:"Arithmetic sequence"},{id:"5",type:"def",content:"\u7b97\u672f\u6570\u5217"},
    {id:"6",type:"word",content:"Common difference"},{id:"6",type:"def",content:"\u516c\u5dee"}
  ]
},

// Level 66: Function Notation (7 words)
{
  board: 'edx', slug: 'edx-fn-notation', category: 'edx-functions', title: 'Function Notation', titleZh: '\u51fd\u6570\u8bb0\u6cd5', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Function"},{id:"0",type:"def",content:"\u51fd\u6570"},
    {id:"1",type:"word",content:"Domain"},{id:"1",type:"def",content:"\u5b9a\u4e49\u57df"},
    {id:"2",type:"word",content:"Range"},{id:"2",type:"def",content:"\u503c\u57df"},
    {id:"3",type:"word",content:"Inverse function"},{id:"3",type:"def",content:"\u53cd\u51fd\u6570"},
    {id:"4",type:"word",content:"Composite function"},{id:"4",type:"def",content:"\u590d\u5408\u51fd\u6570"},
    {id:"5",type:"word",content:"Mapping"},{id:"5",type:"def",content:"\u6620\u5c04"},
    {id:"6",type:"word",content:"f(x) notation"},{id:"6",type:"def",content:"f(x)\u8bb0\u6cd5"}
  ]
},

// Level 67: Linear Graphs (8 words)
{
  board: 'edx', slug: 'edx-fn-linear', category: 'edx-functions', title: 'Linear Graphs', titleZh: '\u76f4\u7ebf\u56fe\u50cf', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Gradient"},{id:"0",type:"def",content:"\u659c\u7387"},
    {id:"1",type:"word",content:"y-intercept"},{id:"1",type:"def",content:"y\u8f74\u622a\u8ddd"},
    {id:"2",type:"word",content:"Straight-line graph"},{id:"2",type:"def",content:"\u76f4\u7ebf\u56fe"},
    {id:"3",type:"word",content:"Equation of line"},{id:"3",type:"def",content:"\u76f4\u7ebf\u65b9\u7a0b"},
    {id:"4",type:"word",content:"Parallel lines"},{id:"4",type:"def",content:"\u5e73\u884c\u7ebf"},
    {id:"5",type:"word",content:"Perpendicular lines"},{id:"5",type:"def",content:"\u5782\u76f4\u7ebf"},
    {id:"6",type:"word",content:"Midpoint"},{id:"6",type:"def",content:"\u4e2d\u70b9"},
    {id:"7",type:"word",content:"Distance formula"},{id:"7",type:"def",content:"\u8ddd\u79bb\u516c\u5f0f"}
  ]
},

// Level 68: Non-linear Graphs (8 words)
{
  board: 'edx', slug: 'edx-fn-nonlinear', category: 'edx-functions', title: 'Non-linear Graphs', titleZh: '\u975e\u7ebf\u6027\u56fe\u50cf', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Quadratic graph"},{id:"0",type:"def",content:"\u4e8c\u6b21\u51fd\u6570\u56fe\u50cf"},
    {id:"1",type:"word",content:"Cubic graph"},{id:"1",type:"def",content:"\u4e09\u6b21\u51fd\u6570\u56fe\u50cf"},
    {id:"2",type:"word",content:"Reciprocal graph"},{id:"2",type:"def",content:"\u53cd\u6bd4\u4f8b\u56fe\u50cf"},
    {id:"3",type:"word",content:"Exponential graph"},{id:"3",type:"def",content:"\u6307\u6570\u51fd\u6570\u56fe\u50cf"},
    {id:"4",type:"word",content:"Parabola"},{id:"4",type:"def",content:"\u629b\u7269\u7ebf"},
    {id:"5",type:"word",content:"Turning point"},{id:"5",type:"def",content:"\u6781\u503c\u70b9"},
    {id:"6",type:"word",content:"Roots of graph"},{id:"6",type:"def",content:"\u56fe\u50cf\u7684\u6839"},
    {id:"7",type:"word",content:"Sketch"},{id:"7",type:"def",content:"\u8349\u56fe"}
  ]
},

// Level 69: Graph Transformations (6 words)
{
  board: 'edx', slug: 'edx-fn-transform', category: 'edx-functions', title: 'Graph Transformations', titleZh: '\u56fe\u50cf\u53d8\u6362', timer: 60, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Translation"},{id:"0",type:"def",content:"\u5e73\u79fb"},
    {id:"1",type:"word",content:"Reflection"},{id:"1",type:"def",content:"\u53cd\u5c04"},
    {id:"2",type:"word",content:"Stretch"},{id:"2",type:"def",content:"\u62c9\u4f38"},
    {id:"3",type:"word",content:"f(x)+a"},{id:"3",type:"def",content:"\u4e0a\u4e0b\u5e73\u79fb"},
    {id:"4",type:"word",content:"f(x+a)"},{id:"4",type:"def",content:"\u5de6\u53f3\u5e73\u79fb"},
    {id:"5",type:"word",content:"af(x)"},{id:"5",type:"def",content:"\u7eb5\u5411\u62c9\u4f38"}
  ]
},

// Level 70: Calculus Introduction (6 words)
{
  board: 'edx', slug: 'edx-fn-calculus', category: 'edx-functions', title: 'Calculus Introduction', titleZh: '\u5fae\u79ef\u5206\u5165\u95e8', timer: 60, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Differentiation"},{id:"0",type:"def",content:"\u5fae\u5206"},
    {id:"1",type:"word",content:"Derivative"},{id:"1",type:"def",content:"\u5bfc\u6570"},
    {id:"2",type:"word",content:"Gradient of curve"},{id:"2",type:"def",content:"\u66f2\u7ebf\u659c\u7387"},
    {id:"3",type:"word",content:"Stationary point"},{id:"3",type:"def",content:"\u9a7b\u70b9"},
    {id:"4",type:"word",content:"Maximum point"},{id:"4",type:"def",content:"\u6781\u5927\u503c\u70b9"},
    {id:"5",type:"word",content:"Minimum point"},{id:"5",type:"def",content:"\u6781\u5c0f\u503c\u70b9"}
  ]
},

/* ── Geometry & Trigonometry (8 groups) ── */

// Level 71: Angles & Lines (8 words)
{
  board: 'edx', slug: 'edx-geo-angles', category: 'edx-geometry', title: 'Angles & Lines', titleZh: '\u89d2\u4e0e\u7ebf', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Acute angle"},{id:"0",type:"def",content:"\u9510\u89d2"},
    {id:"1",type:"word",content:"Right angle"},{id:"1",type:"def",content:"\u76f4\u89d2"},
    {id:"2",type:"word",content:"Obtuse angle"},{id:"2",type:"def",content:"\u949d\u89d2"},
    {id:"3",type:"word",content:"Reflex angle"},{id:"3",type:"def",content:"\u4f18\u89d2"},
    {id:"4",type:"word",content:"Straight angle"},{id:"4",type:"def",content:"\u5e73\u89d2"},
    {id:"5",type:"word",content:"Vertically opposite"},{id:"5",type:"def",content:"\u5bf9\u9876\u89d2"},
    {id:"6",type:"word",content:"Supplementary"},{id:"6",type:"def",content:"\u4e92\u8865\u89d2"},
    {id:"7",type:"word",content:"Complementary"},{id:"7",type:"def",content:"\u4e92\u4f59\u89d2"}
  ]
},

// Level 72: Parallel Lines & Angles (7 words)
{
  board: 'edx', slug: 'edx-geo-parallel', category: 'edx-geometry', title: 'Parallel Lines & Angles', titleZh: '\u5e73\u884c\u7ebf\u4e0e\u89d2', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Parallel lines"},{id:"0",type:"def",content:"\u5e73\u884c\u7ebf"},
    {id:"1",type:"word",content:"Transversal"},{id:"1",type:"def",content:"\u622a\u7ebf"},
    {id:"2",type:"word",content:"Corresponding angles"},{id:"2",type:"def",content:"\u540c\u4f4d\u89d2"},
    {id:"3",type:"word",content:"Alternate angles"},{id:"3",type:"def",content:"\u5185\u9519\u89d2"},
    {id:"4",type:"word",content:"Co-interior angles"},{id:"4",type:"def",content:"\u540c\u65c1\u5185\u89d2"},
    {id:"5",type:"word",content:"Interior angle"},{id:"5",type:"def",content:"\u5185\u89d2"},
    {id:"6",type:"word",content:"Exterior angle"},{id:"6",type:"def",content:"\u5916\u89d2"}
  ]
},

// Level 73: Triangles & Quadrilaterals (9 words)
{
  board: 'edx', slug: 'edx-geo-shapes', category: 'edx-geometry', title: 'Triangles & Quadrilaterals', titleZh: '\u4e09\u89d2\u5f62\u4e0e\u56db\u8fb9\u5f62', timer: 80, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Triangle"},{id:"0",type:"def",content:"\u4e09\u89d2\u5f62"},
    {id:"1",type:"word",content:"Equilateral"},{id:"1",type:"def",content:"\u7b49\u8fb9\u4e09\u89d2\u5f62"},
    {id:"2",type:"word",content:"Isosceles"},{id:"2",type:"def",content:"\u7b49\u8170\u4e09\u89d2\u5f62"},
    {id:"3",type:"word",content:"Scalene"},{id:"3",type:"def",content:"\u4e0d\u7b49\u8fb9\u4e09\u89d2\u5f62"},
    {id:"4",type:"word",content:"Right-angled triangle"},{id:"4",type:"def",content:"\u76f4\u89d2\u4e09\u89d2\u5f62"},
    {id:"5",type:"word",content:"Parallelogram"},{id:"5",type:"def",content:"\u5e73\u884c\u56db\u8fb9\u5f62"},
    {id:"6",type:"word",content:"Trapezium"},{id:"6",type:"def",content:"\u68af\u5f62"},
    {id:"7",type:"word",content:"Rhombus"},{id:"7",type:"def",content:"\u83f1\u5f62"},
    {id:"8",type:"word",content:"Kite"},{id:"8",type:"def",content:"\u9e22\u5f62"}
  ]
},

// Level 74: Polygons & Symmetry (8 words)
{
  board: 'edx', slug: 'edx-geo-polygons', category: 'edx-geometry', title: 'Polygons & Symmetry', titleZh: '\u591a\u8fb9\u5f62\u4e0e\u5bf9\u79f0', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Polygon"},{id:"0",type:"def",content:"\u591a\u8fb9\u5f62"},
    {id:"1",type:"word",content:"Regular polygon"},{id:"1",type:"def",content:"\u6b63\u591a\u8fb9\u5f62"},
    {id:"2",type:"word",content:"Pentagon"},{id:"2",type:"def",content:"\u4e94\u8fb9\u5f62"},
    {id:"3",type:"word",content:"Hexagon"},{id:"3",type:"def",content:"\u516d\u8fb9\u5f62"},
    {id:"4",type:"word",content:"Interior angle sum"},{id:"4",type:"def",content:"\u5185\u89d2\u548c"},
    {id:"5",type:"word",content:"Exterior angle sum"},{id:"5",type:"def",content:"\u5916\u89d2\u548c"},
    {id:"6",type:"word",content:"Line symmetry"},{id:"6",type:"def",content:"\u7ebf\u5bf9\u79f0"},
    {id:"7",type:"word",content:"Rotational symmetry"},{id:"7",type:"def",content:"\u65cb\u8f6c\u5bf9\u79f0"}
  ]
},

// Level 75: Circle Properties (9 words)
{
  board: 'edx', slug: 'edx-geo-circles', category: 'edx-geometry', title: 'Circle Properties', titleZh: '\u5706\u7684\u6027\u8d28', timer: 80, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Circle"},{id:"0",type:"def",content:"\u5706"},
    {id:"1",type:"word",content:"Radius"},{id:"1",type:"def",content:"\u534a\u5f84"},
    {id:"2",type:"word",content:"Diameter"},{id:"2",type:"def",content:"\u76f4\u5f84"},
    {id:"3",type:"word",content:"Circumference"},{id:"3",type:"def",content:"\u5706\u5468"},
    {id:"4",type:"word",content:"Chord"},{id:"4",type:"def",content:"\u5f26"},
    {id:"5",type:"word",content:"Arc"},{id:"5",type:"def",content:"\u5f27"},
    {id:"6",type:"word",content:"Sector"},{id:"6",type:"def",content:"\u6247\u5f62"},
    {id:"7",type:"word",content:"Tangent"},{id:"7",type:"def",content:"\u5207\u7ebf"},
    {id:"8",type:"word",content:"Segment"},{id:"8",type:"def",content:"\u5f13\u5f62"}
  ]
},

// Level 76: Circle Theorems (7 words)
{
  board: 'edx', slug: 'edx-geo-circle-thm', category: 'edx-geometry', title: 'Circle Theorems', titleZh: '\u5706\u5b9a\u7406', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle at centre"},{id:"0",type:"def",content:"\u5706\u5fc3\u89d2"},
    {id:"1",type:"word",content:"Angle in semicircle"},{id:"1",type:"def",content:"\u534a\u5706\u4e0a\u7684\u89d2"},
    {id:"2",type:"word",content:"Cyclic quadrilateral"},{id:"2",type:"def",content:"\u5706\u5185\u63a5\u56db\u8fb9\u5f62"},
    {id:"3",type:"word",content:"Tangent-radius"},{id:"3",type:"def",content:"\u5207\u7ebf\u4e0e\u534a\u5f84"},
    {id:"4",type:"word",content:"Alternate segment"},{id:"4",type:"def",content:"\u5f27\u5207\u89d2"},
    {id:"5",type:"word",content:"Angles same arc"},{id:"5",type:"def",content:"\u540c\u5f27\u4e0a\u7684\u89d2"},
    {id:"6",type:"word",content:"Perpendicular bisector"},{id:"6",type:"def",content:"\u5782\u76f4\u5e73\u5206\u7ebf"}
  ]
},

// Level 77: Constructions & Bearings (7 words)
{
  board: 'edx', slug: 'edx-geo-construct', category: 'edx-geometry', title: 'Constructions & Bearings', titleZh: '\u4f5c\u56fe\u4e0e\u65b9\u4f4d\u89d2', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Bearing"},{id:"0",type:"def",content:"\u65b9\u4f4d\u89d2"},
    {id:"1",type:"word",content:"Scale drawing"},{id:"1",type:"def",content:"\u6bd4\u4f8b\u5c3a\u56fe"},
    {id:"2",type:"word",content:"Construction"},{id:"2",type:"def",content:"\u4f5c\u56fe"},
    {id:"3",type:"word",content:"Locus"},{id:"3",type:"def",content:"\u8f68\u8ff9"},
    {id:"4",type:"word",content:"Perpendicular bisector"},{id:"4",type:"def",content:"\u5782\u76f4\u5e73\u5206\u7ebf"},
    {id:"5",type:"word",content:"Angle bisector"},{id:"5",type:"def",content:"\u89d2\u5e73\u5206\u7ebf"},
    {id:"6",type:"word",content:"Compass"},{id:"6",type:"def",content:"\u5706\u89c4"}
  ]
},

// Level 78: Pythagoras & Trigonometry (8 words)
{
  board: 'edx', slug: 'edx-geo-trig', category: 'edx-geometry', title: 'Pythagoras & Trigonometry', titleZh: '\u52fe\u80a1\u5b9a\u7406\u4e0e\u4e09\u89d2', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Pythagoras' theorem"},{id:"0",type:"def",content:"\u52fe\u80a1\u5b9a\u7406"},
    {id:"1",type:"word",content:"Hypotenuse"},{id:"1",type:"def",content:"\u659c\u8fb9"},
    {id:"2",type:"word",content:"Sine"},{id:"2",type:"def",content:"\u6b63\u5f26"},
    {id:"3",type:"word",content:"Cosine"},{id:"3",type:"def",content:"\u4f59\u5f26"},
    {id:"4",type:"word",content:"Tangent (ratio)"},{id:"4",type:"def",content:"\u6b63\u5207"},
    {id:"5",type:"word",content:"SOHCAHTOA"},{id:"5",type:"def",content:"\u4e09\u89d2\u6bd4\u53e3\u8bc0"},
    {id:"6",type:"word",content:"Angle of elevation"},{id:"6",type:"def",content:"\u4ef0\u89d2"},
    {id:"7",type:"word",content:"Angle of depression"},{id:"7",type:"def",content:"\u4fd1\u89d2"}
  ]
},

/* ── Mensuration (4 groups) ── */

// Level 79: Area & Perimeter (8 words)
{
  board: 'edx', slug: 'edx-mens-area', category: 'edx-mensuration', title: 'Area & Perimeter', titleZh: '\u9762\u79ef\u4e0e\u5468\u957f', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Perimeter"},{id:"0",type:"def",content:"\u5468\u957f"},
    {id:"1",type:"word",content:"Area"},{id:"1",type:"def",content:"\u9762\u79ef"},
    {id:"2",type:"word",content:"Rectangle"},{id:"2",type:"def",content:"\u957f\u65b9\u5f62"},
    {id:"3",type:"word",content:"Triangle"},{id:"3",type:"def",content:"\u4e09\u89d2\u5f62"},
    {id:"4",type:"word",content:"Parallelogram"},{id:"4",type:"def",content:"\u5e73\u884c\u56db\u8fb9\u5f62"},
    {id:"5",type:"word",content:"Trapezium"},{id:"5",type:"def",content:"\u68af\u5f62"},
    {id:"6",type:"word",content:"Compound shape"},{id:"6",type:"def",content:"\u7ec4\u5408\u56fe\u5f62"},
    {id:"7",type:"word",content:"Base \u00d7 Height"},{id:"7",type:"def",content:"\u5e95\u00d7\u9ad8"}
  ]
},

// Level 80: Circles & Sectors (7 words)
{
  board: 'edx', slug: 'edx-mens-circles', category: 'edx-mensuration', title: 'Circles & Sectors', titleZh: '\u5706\u4e0e\u6247\u5f62', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Circumference"},{id:"0",type:"def",content:"\u5706\u5468\u957f"},
    {id:"1",type:"word",content:"Pi (\u03c0)"},{id:"1",type:"def",content:"\u5706\u5468\u7387"},
    {id:"2",type:"word",content:"Area of circle"},{id:"2",type:"def",content:"\u5706\u9762\u79ef"},
    {id:"3",type:"word",content:"Arc length"},{id:"3",type:"def",content:"\u5f27\u957f"},
    {id:"4",type:"word",content:"Sector area"},{id:"4",type:"def",content:"\u6247\u5f62\u9762\u79ef"},
    {id:"5",type:"word",content:"Semicircle"},{id:"5",type:"def",content:"\u534a\u5706"},
    {id:"6",type:"word",content:"Annulus"},{id:"6",type:"def",content:"\u73af\u5f62"}
  ]
},

// Level 81: Surface Area & Volume (8 words)
{
  board: 'edx', slug: 'edx-mens-volume', category: 'edx-mensuration', title: 'Surface Area & Volume', titleZh: '\u8868\u9762\u79ef\u4e0e\u4f53\u79ef', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Surface area"},{id:"0",type:"def",content:"\u8868\u9762\u79ef"},
    {id:"1",type:"word",content:"Volume"},{id:"1",type:"def",content:"\u4f53\u79ef"},
    {id:"2",type:"word",content:"Cuboid"},{id:"2",type:"def",content:"\u957f\u65b9\u4f53"},
    {id:"3",type:"word",content:"Prism"},{id:"3",type:"def",content:"\u68f1\u67f1"},
    {id:"4",type:"word",content:"Cylinder"},{id:"4",type:"def",content:"\u5706\u67f1"},
    {id:"5",type:"word",content:"Cone"},{id:"5",type:"def",content:"\u5706\u9525"},
    {id:"6",type:"word",content:"Sphere"},{id:"6",type:"def",content:"\u7403"},
    {id:"7",type:"word",content:"Pyramid"},{id:"7",type:"def",content:"\u68f1\u9525"}
  ]
},

// Level 82: Similarity & 3D (7 words)
{
  board: 'edx', slug: 'edx-mens-similarity', category: 'edx-mensuration', title: 'Similarity & 3D', titleZh: '\u76f8\u4f3c\u4e0e\u7acb\u4f53', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Similar shapes"},{id:"0",type:"def",content:"\u76f8\u4f3c\u56fe\u5f62"},
    {id:"1",type:"word",content:"Scale factor"},{id:"1",type:"def",content:"\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"2",type:"word",content:"Area scale factor"},{id:"2",type:"def",content:"\u9762\u79ef\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"3",type:"word",content:"Volume scale factor"},{id:"3",type:"def",content:"\u4f53\u79ef\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"4",type:"word",content:"Frustum"},{id:"4",type:"def",content:"\u68f1\u53f0"},
    {id:"5",type:"word",content:"Hemisphere"},{id:"5",type:"def",content:"\u534a\u7403"},
    {id:"6",type:"word",content:"Compound solid"},{id:"6",type:"def",content:"\u7ec4\u5408\u4f53"}
  ]
},

/* ── Vectors & Transformations (4 groups) ── */

// Level 83: Transformations (8 words)
{
  board: 'edx', slug: 'edx-vec-transform', category: 'edx-vectors', title: 'Transformations', titleZh: '\u53d8\u6362', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Transformation"},{id:"0",type:"def",content:"\u53d8\u6362"},
    {id:"1",type:"word",content:"Reflection"},{id:"1",type:"def",content:"\u53cd\u5c04"},
    {id:"2",type:"word",content:"Rotation"},{id:"2",type:"def",content:"\u65cb\u8f6c"},
    {id:"3",type:"word",content:"Translation"},{id:"3",type:"def",content:"\u5e73\u79fb"},
    {id:"4",type:"word",content:"Enlargement"},{id:"4",type:"def",content:"\u653e\u5927"},
    {id:"5",type:"word",content:"Mirror line"},{id:"5",type:"def",content:"\u5bf9\u79f0\u8f74"},
    {id:"6",type:"word",content:"Centre of rotation"},{id:"6",type:"def",content:"\u65cb\u8f6c\u4e2d\u5fc3"},
    {id:"7",type:"word",content:"Scale factor"},{id:"7",type:"def",content:"\u6bd4\u4f8b\u56e0\u5b50"}
  ]
},

// Level 84: Combined Transformations (6 words)
{
  board: 'edx', slug: 'edx-vec-combined', category: 'edx-vectors', title: 'Combined Transformations', titleZh: '\u590d\u5408\u53d8\u6362', timer: 60, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Image"},{id:"0",type:"def",content:"\u50cf"},
    {id:"1",type:"word",content:"Object"},{id:"1",type:"def",content:"\u539f\u50cf"},
    {id:"2",type:"word",content:"Invariant point"},{id:"2",type:"def",content:"\u4e0d\u53d8\u70b9"},
    {id:"3",type:"word",content:"Combined transformation"},{id:"3",type:"def",content:"\u590d\u5408\u53d8\u6362"},
    {id:"4",type:"word",content:"Negative scale factor"},{id:"4",type:"def",content:"\u8d1f\u6bd4\u4f8b\u56e0\u5b50"},
    {id:"5",type:"word",content:"Fractional scale factor"},{id:"5",type:"def",content:"\u5206\u6570\u6bd4\u4f8b\u56e0\u5b50"}
  ]
},

// Level 85: Vector Basics (7 words)
{
  board: 'edx', slug: 'edx-vec-basics', category: 'edx-vectors', title: 'Vector Basics', titleZh: '\u5411\u91cf\u57fa\u7840', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Vector"},{id:"0",type:"def",content:"\u5411\u91cf"},
    {id:"1",type:"word",content:"Column vector"},{id:"1",type:"def",content:"\u5217\u5411\u91cf"},
    {id:"2",type:"word",content:"Scalar"},{id:"2",type:"def",content:"\u6807\u91cf"},
    {id:"3",type:"word",content:"Magnitude"},{id:"3",type:"def",content:"\u6a21"},
    {id:"4",type:"word",content:"Position vector"},{id:"4",type:"def",content:"\u4f4d\u7f6e\u5411\u91cf"},
    {id:"5",type:"word",content:"Displacement"},{id:"5",type:"def",content:"\u4f4d\u79fb"},
    {id:"6",type:"word",content:"Resultant"},{id:"6",type:"def",content:"\u5408\u5411\u91cf"}
  ]
},

// Level 86: Vector Operations (7 words)
{
  board: 'edx', slug: 'edx-vec-ops', category: 'edx-vectors', title: 'Vector Operations', titleZh: '\u5411\u91cf\u8fd0\u7b97', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Vector addition"},{id:"0",type:"def",content:"\u5411\u91cf\u52a0\u6cd5"},
    {id:"1",type:"word",content:"Vector subtraction"},{id:"1",type:"def",content:"\u5411\u91cf\u51cf\u6cd5"},
    {id:"2",type:"word",content:"Scalar multiplication"},{id:"2",type:"def",content:"\u6807\u91cf\u4e58\u6cd5"},
    {id:"3",type:"word",content:"Parallel vectors"},{id:"3",type:"def",content:"\u5e73\u884c\u5411\u91cf"},
    {id:"4",type:"word",content:"Collinear"},{id:"4",type:"def",content:"\u5171\u7ebf"},
    {id:"5",type:"word",content:"Midpoint vector"},{id:"5",type:"def",content:"\u4e2d\u70b9\u5411\u91cf"},
    {id:"6",type:"word",content:"Proof"},{id:"6",type:"def",content:"\u8bc1\u660e"}
  ]
},

/* ── Statistics & Probability (5 groups) ── */

// Level 87: Data & Charts (8 words)
{
  board: 'edx', slug: 'edx-stat-data', category: 'edx-statistics', title: 'Data & Charts', titleZh: '\u6570\u636e\u4e0e\u56fe\u8868', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Data"},{id:"0",type:"def",content:"\u6570\u636e"},
    {id:"1",type:"word",content:"Discrete data"},{id:"1",type:"def",content:"\u79bb\u6563\u6570\u636e"},
    {id:"2",type:"word",content:"Continuous data"},{id:"2",type:"def",content:"\u8fde\u7eed\u6570\u636e"},
    {id:"3",type:"word",content:"Frequency"},{id:"3",type:"def",content:"\u9891\u6570"},
    {id:"4",type:"word",content:"Tally"},{id:"4",type:"def",content:"\u8ba1\u6570\u7b26\u53f7"},
    {id:"5",type:"word",content:"Bar chart"},{id:"5",type:"def",content:"\u6761\u5f62\u56fe"},
    {id:"6",type:"word",content:"Pie chart"},{id:"6",type:"def",content:"\u997c\u56fe"},
    {id:"7",type:"word",content:"Pictogram"},{id:"7",type:"def",content:"\u8c61\u5f62\u56fe"}
  ]
},

// Level 88: Statistical Diagrams (8 words)
{
  board: 'edx', slug: 'edx-stat-diagrams', category: 'edx-statistics', title: 'Statistical Diagrams', titleZh: '\u7edf\u8ba1\u56fe\u8868', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scatter diagram"},{id:"0",type:"def",content:"\u6563\u70b9\u56fe"},
    {id:"1",type:"word",content:"Correlation"},{id:"1",type:"def",content:"\u76f8\u5173\u6027"},
    {id:"2",type:"word",content:"Line of best fit"},{id:"2",type:"def",content:"\u6700\u4f73\u62df\u5408\u7ebf"},
    {id:"3",type:"word",content:"Stem-and-leaf"},{id:"3",type:"def",content:"\u8308\u53f6\u56fe"},
    {id:"4",type:"word",content:"Frequency polygon"},{id:"4",type:"def",content:"\u9891\u7387\u6298\u7ebf\u56fe"},
    {id:"5",type:"word",content:"Histogram"},{id:"5",type:"def",content:"\u76f4\u65b9\u56fe"},
    {id:"6",type:"word",content:"Frequency density"},{id:"6",type:"def",content:"\u9891\u7387\u5bc6\u5ea6"},
    {id:"7",type:"word",content:"Cumulative frequency"},{id:"7",type:"def",content:"\u7d2f\u79ef\u9891\u7387"}
  ]
},

// Level 89: Averages & Spread (8 words)
{
  board: 'edx', slug: 'edx-stat-averages', category: 'edx-statistics', title: 'Averages & Spread', titleZh: '\u5e73\u5747\u6570\u4e0e\u79bb\u6563\u5ea6', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Mean"},{id:"0",type:"def",content:"\u5e73\u5747\u6570"},
    {id:"1",type:"word",content:"Median"},{id:"1",type:"def",content:"\u4e2d\u4f4d\u6570"},
    {id:"2",type:"word",content:"Mode"},{id:"2",type:"def",content:"\u4f17\u6570"},
    {id:"3",type:"word",content:"Range"},{id:"3",type:"def",content:"\u5168\u8ddd"},
    {id:"4",type:"word",content:"Quartile"},{id:"4",type:"def",content:"\u56db\u5206\u4f4d\u6570"},
    {id:"5",type:"word",content:"Interquartile range"},{id:"5",type:"def",content:"\u56db\u5206\u4f4d\u8ddd"},
    {id:"6",type:"word",content:"Estimated mean"},{id:"6",type:"def",content:"\u4f30\u8ba1\u5e73\u5747\u6570"},
    {id:"7",type:"word",content:"Modal class"},{id:"7",type:"def",content:"\u4f17\u6570\u7ec4"}
  ]
},

// Level 90: Basic Probability (8 words)
{
  board: 'edx', slug: 'edx-stat-prob', category: 'edx-statistics', title: 'Basic Probability', titleZh: '\u57fa\u7840\u6982\u7387', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Probability"},{id:"0",type:"def",content:"\u6982\u7387"},
    {id:"1",type:"word",content:"Event"},{id:"1",type:"def",content:"\u4e8b\u4ef6"},
    {id:"2",type:"word",content:"Outcome"},{id:"2",type:"def",content:"\u7ed3\u679c"},
    {id:"3",type:"word",content:"Sample space"},{id:"3",type:"def",content:"\u6837\u672c\u7a7a\u95f4"},
    {id:"4",type:"word",content:"Relative frequency"},{id:"4",type:"def",content:"\u76f8\u5bf9\u9891\u7387"},
    {id:"5",type:"word",content:"Expected frequency"},{id:"5",type:"def",content:"\u671f\u671b\u9891\u6570"},
    {id:"6",type:"word",content:"Fair"},{id:"6",type:"def",content:"\u516c\u5e73"},
    {id:"7",type:"word",content:"Biased"},{id:"7",type:"def",content:"\u6709\u504f"}
  ]
},

// Level 91: Combined Probability (7 words)
{
  board: 'edx', slug: 'edx-stat-prob-comb', category: 'edx-statistics', title: 'Combined Probability', titleZh: '\u7ec4\u5408\u6982\u7387', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Independent events"},{id:"0",type:"def",content:"\u72ec\u7acb\u4e8b\u4ef6"},
    {id:"1",type:"word",content:"Dependent events"},{id:"1",type:"def",content:"\u76f8\u4f9d\u4e8b\u4ef6"},
    {id:"2",type:"word",content:"Tree diagram"},{id:"2",type:"def",content:"\u6811\u5f62\u56fe"},
    {id:"3",type:"word",content:"Mutually exclusive"},{id:"3",type:"def",content:"\u4e92\u65a5\u4e8b\u4ef6"},
    {id:"4",type:"word",content:"Conditional probability"},{id:"4",type:"def",content:"\u6761\u4ef6\u6982\u7387"},
    {id:"5",type:"word",content:"With replacement"},{id:"5",type:"def",content:"\u6709\u653e\u56de"},
    {id:"6",type:"word",content:"Without replacement"},{id:"6",type:"def",content:"\u65e0\u653e\u56de"}
  ]
},

/* ── Edexcel Additional Levels ── */

// Standard Form (§1.9)
{
  board: 'edx', slug: 'edx-num-standard', category: 'edx-number', title: 'Standard Form', titleZh: '标准式', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Standard form"},{id:"0",type:"def",content:"标准式（科学记数法）"},
    {id:"1",type:"word",content:"Power of 10"},{id:"1",type:"def",content:"10 的幂"},
    {id:"2",type:"word",content:"Significant figure"},{id:"2",type:"def",content:"有效数字"},
    {id:"3",type:"word",content:"Order of magnitude"},{id:"3",type:"def",content:"数量级"},
    {id:"4",type:"word",content:"Ordinary number"},{id:"4",type:"def",content:"普通数"},
    {id:"5",type:"word",content:"Coefficient"},{id:"5",type:"def",content:"系数"}
  ]
},

// Applying Number (§1.10)
{
  board: 'edx', slug: 'edx-num-applying', category: 'edx-number', title: 'Applying Number', titleZh: '数的应用', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Metric unit"},{id:"0",type:"def",content:"公制单位"},
    {id:"1",type:"word",content:"Imperial unit"},{id:"1",type:"def",content:"英制单位"},
    {id:"2",type:"word",content:"Conversion"},{id:"2",type:"def",content:"换算"},
    {id:"3",type:"word",content:"Exchange rate"},{id:"3",type:"def",content:"汇率"},
    {id:"4",type:"word",content:"Profit"},{id:"4",type:"def",content:"利润"},
    {id:"5",type:"word",content:"Loss"},{id:"5",type:"def",content:"亏损"},
    {id:"6",type:"word",content:"VAT"},{id:"6",type:"def",content:"增值税"}
  ]
},

// Electronic Calculators (§1.11)
{
  board: 'edx', slug: 'edx-num-calculator', category: 'edx-number', title: 'Electronic Calculators', titleZh: '计算器使用', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Reciprocal key"},{id:"0",type:"def",content:"倒数键"},
    {id:"1",type:"word",content:"Square root key"},{id:"1",type:"def",content:"平方根键"},
    {id:"2",type:"word",content:"Power key"},{id:"2",type:"def",content:"幂键"},
    {id:"3",type:"word",content:"Fraction key"},{id:"3",type:"def",content:"分数键"},
    {id:"4",type:"word",content:"Brackets"},{id:"4",type:"def",content:"括号"},
    {id:"5",type:"word",content:"Standard form key"},{id:"5",type:"def",content:"标准式键"}
  ]
},

// Proportion (§2.5)
{
  board: 'edx', slug: 'edx-alg-proportion', category: 'edx-algebra', title: 'Proportion', titleZh: '比例', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Direct proportion"},{id:"0",type:"def",content:"正比例"},
    {id:"1",type:"word",content:"Inverse proportion"},{id:"1",type:"def",content:"反比例"},
    {id:"2",type:"word",content:"Constant of proportionality"},{id:"2",type:"def",content:"比例常数"},
    {id:"3",type:"word",content:"Proportional to"},{id:"3",type:"def",content:"与……成比例"},
    {id:"4",type:"word",content:"Unitary method"},{id:"4",type:"def",content:"单位法"},
    {id:"5",type:"word",content:"Scale factor"},{id:"5",type:"def",content:"比例因子"}
  ]
},

// Measures (§4.4)
{
  board: 'edx', slug: 'edx-geo-measures', category: 'edx-geometry', title: 'Measures', titleZh: '测量', timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scale"},{id:"0",type:"def",content:"比例尺"},
    {id:"1",type:"word",content:"Upper bound"},{id:"1",type:"def",content:"上界"},
    {id:"2",type:"word",content:"Lower bound"},{id:"2",type:"def",content:"下界"},
    {id:"3",type:"word",content:"Compound measure"},{id:"3",type:"def",content:"复合量"},
    {id:"4",type:"word",content:"Speed"},{id:"4",type:"def",content:"速度"},
    {id:"5",type:"word",content:"Density"},{id:"5",type:"def",content:"密度"},
    {id:"6",type:"word",content:"Pressure"},{id:"6",type:"def",content:"压强"}
  ]
},

// Geometrical Reasoning (§4.7)
{
  board: 'edx', slug: 'edx-geo-reasoning', category: 'edx-geometry', title: 'Geometrical Reasoning', titleZh: '几何推理', timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Proof"},{id:"0",type:"def",content:"证明"},
    {id:"1",type:"word",content:"Vertically opposite angles"},{id:"1",type:"def",content:"对顶角"},
    {id:"2",type:"word",content:"Alternate angles"},{id:"2",type:"def",content:"内错角"},
    {id:"3",type:"word",content:"Co-interior angles"},{id:"3",type:"def",content:"同旁内角"},
    {id:"4",type:"word",content:"Exterior angle of a triangle"},{id:"4",type:"def",content:"三角形外角"},
    {id:"5",type:"word",content:"Angle sum of a polygon"},{id:"5",type:"def",content:"多边形内角和"},
    {id:"6",type:"word",content:"Congruent triangles"},{id:"6",type:"def",content:"全等三角形"}
  ]
},


/* ══════════════════════════════════════════════════════════════
   25MATHS CURRICULUM Y7-Y11 (173 levels, 1502 words)
   ══════════════════════════════════════════════════════════════ */


/* ═══ Year 7 (31 levels, 257 words) ═══ */

{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-1', category: '25m-y7', title: 'Multiplication of Fractions (1)', titleZh: '分数的乘法 (1)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Addition"},{id:"0",type:"def",content:"加法"},
    {id:"1",type:"word",content:"Area"},{id:"1",type:"def",content:"面积"},
    {id:"2",type:"word",content:"BIDMAS / PEMDAS"},{id:"2",type:"def",content:"运算顺序 (BIDMAS / PEMDAS)"},
    {id:"3",type:"word",content:"Common denominator"},{id:"3",type:"def",content:"公分母"},
    {id:"4",type:"word",content:"Common factor"},{id:"4",type:"def",content:"公因数"},
    {id:"5",type:"word",content:"Decimal"},{id:"5",type:"def",content:"小数"},
    {id:"6",type:"word",content:"Decimal places"},{id:"6",type:"def",content:"小数位数"},
    {id:"7",type:"word",content:"Denominator"},{id:"7",type:"def",content:"分母"},
    {id:"8",type:"word",content:"Equation"},{id:"8",type:"def",content:"方程"},
    {id:"9",type:"word",content:"Equivalent fractions"},{id:"9",type:"def",content:"等价分数"}
  ]
},

{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-2', category: '25m-y7', title: 'Multiplication of Fractions (2)', titleZh: '分数的乘法 (2)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Expression"},{id:"0",type:"def",content:"表达式"},
    {id:"1",type:"word",content:"Fraction"},{id:"1",type:"def",content:"分数"},
    {id:"2",type:"word",content:"Improper fraction"},{id:"2",type:"def",content:"假分数"},
    {id:"3",type:"word",content:"Mixed number"},{id:"3",type:"def",content:"带分数"},
    {id:"4",type:"word",content:"Multiplication"},{id:"4",type:"def",content:"乘法"},
    {id:"5",type:"word",content:"Numerator"},{id:"5",type:"def",content:"分子"},
    {id:"6",type:"word",content:"Of (implies multiplication)"},{id:"6",type:"def",content:"的 (表示乘法)"},
    {id:"7",type:"word",content:"Order of operations"},{id:"7",type:"def",content:"运算顺序"},
    {id:"8",type:"word",content:"Pre-cancelling"},{id:"8",type:"def",content:"预先约分"},
    {id:"9",type:"word",content:"Problem solving"},{id:"9",type:"def",content:"解决问题"}
  ]
},

{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-3', category: '25m-y7', title: 'Multiplication of Fractions (3)', titleZh: '分数的乘法 (3)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Product"},{id:"0",type:"def",content:"乘积"},
    {id:"1",type:"word",content:"Reciprocal"},{id:"1",type:"def",content:"倒数"},
    {id:"2",type:"word",content:"Rounding"},{id:"2",type:"def",content:"四舍五入"},
    {id:"3",type:"word",content:"Significant figures"},{id:"3",type:"def",content:"有效数字"},
    {id:"4",type:"word",content:"Simplest form"},{id:"4",type:"def",content:"最简形式"},
    {id:"5",type:"word",content:"Subtraction"},{id:"5",type:"def",content:"减法"},
    {id:"6",type:"word",content:"Volume"},{id:"6",type:"def",content:"体积"},
    {id:"7",type:"word",content:"Word problem"},{id:"7",type:"def",content:"应用题"}
  ]
},

{
  board: '25m', slug: '25m-y7-division-of-fraction-1', category: '25m-y7', title: 'Division of Fraction (1)', titleZh: '分数的除法 (1)', unitNum: 2, unitTitle: 'Division of Fraction', unitTitleZh: '分数的除法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Brackets"},{id:"0",type:"def",content:"括号"},
    {id:"1",type:"word",content:"Denominator"},{id:"1",type:"def",content:"分母"},
    {id:"2",type:"word",content:"Division"},{id:"2",type:"def",content:"除法"},
    {id:"3",type:"word",content:"Fraction"},{id:"3",type:"def",content:"分数"},
    {id:"4",type:"word",content:"Improper Fraction"},{id:"4",type:"def",content:"假分数"},
    {id:"5",type:"word",content:"Integer"},{id:"5",type:"def",content:"整数"},
    {id:"6",type:"word",content:"Mixed Number"},{id:"6",type:"def",content:"带分数"},
    {id:"7",type:"word",content:"Multiplicative Inverse"},{id:"7",type:"def",content:"乘法逆元"},
    {id:"8",type:"word",content:"Numerator"},{id:"8",type:"def",content:"分子"},
    {id:"9",type:"word",content:"Order of Operations"},{id:"9",type:"def",content:"运算顺序"}
  ]
},

{
  board: '25m', slug: '25m-y7-division-of-fraction-2', category: '25m-y7', title: 'Division of Fraction (2)', titleZh: '分数的除法 (2)', unitNum: 2, unitTitle: 'Division of Fraction', unitTitleZh: '分数的除法',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Reciprocal"},{id:"0",type:"def",content:"倒数"},
    {id:"1",type:"word",content:"Simplify"},{id:"1",type:"def",content:"化简"},
    {id:"2",type:"word",content:"Word Problem"},{id:"2",type:"def",content:"应用题"}
  ]
},

{
  board: '25m', slug: '25m-y7-negative-number-1', category: '25m-y7', title: 'Negative Number (1)', titleZh: '负数 (1)', unitNum: 3, unitTitle: 'Negative Number', unitTitleZh: '负数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Absolute value"},{id:"0",type:"def",content:"绝对值"},
    {id:"1",type:"word",content:"Addition"},{id:"1",type:"def",content:"加法"},
    {id:"2",type:"word",content:"Division"},{id:"2",type:"def",content:"除法"},
    {id:"3",type:"word",content:"Greater than"},{id:"3",type:"def",content:"大于"},
    {id:"4",type:"word",content:"Integer"},{id:"4",type:"def",content:"整数"},
    {id:"5",type:"word",content:"Less than"},{id:"5",type:"def",content:"小于"},
    {id:"6",type:"word",content:"Multiplication"},{id:"6",type:"def",content:"乘法"},
    {id:"7",type:"word",content:"Negative number"},{id:"7",type:"def",content:"负数"},
    {id:"8",type:"word",content:"Number line"},{id:"8",type:"def",content:"数轴"},
    {id:"9",type:"word",content:"Opposite number"},{id:"9",type:"def",content:"相反数"}
  ]
},

{
  board: '25m', slug: '25m-y7-negative-number-2', category: '25m-y7', title: 'Negative Number (2)', titleZh: '负数 (2)', unitNum: 3, unitTitle: 'Negative Number', unitTitleZh: '负数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Positive number"},{id:"0",type:"def",content:"正数"},
    {id:"1",type:"word",content:"Sea level"},{id:"1",type:"def",content:"海平面"},
    {id:"2",type:"word",content:"Subtraction"},{id:"2",type:"def",content:"减法"},
    {id:"3",type:"word",content:"Temperature"},{id:"3",type:"def",content:"温度"},
    {id:"4",type:"word",content:"Zero"},{id:"4",type:"def",content:"零"}
  ]
},

{
  board: '25m', slug: '25m-y7-position-and-direction-1', category: '25m-y7', title: 'Position and Direction (1)', titleZh: '位置和方向 (1)', unitNum: 4, unitTitle: 'Position and Direction', unitTitleZh: '位置和方向',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Bearing"},{id:"0",type:"def",content:"方位角"},
    {id:"1",type:"word",content:"Clockwise"},{id:"1",type:"def",content:"顺时针"},
    {id:"2",type:"word",content:"Compass"},{id:"2",type:"def",content:"指南针"},
    {id:"3",type:"word",content:"Coordinate"},{id:"3",type:"def",content:"坐标"},
    {id:"4",type:"word",content:"Horizontal"},{id:"4",type:"def",content:"水平的"},
    {id:"5",type:"word",content:"Length"},{id:"5",type:"def",content:"长度"},
    {id:"6",type:"word",content:"Line segment"},{id:"6",type:"def",content:"线段"},
    {id:"7",type:"word",content:"Midpoint"},{id:"7",type:"def",content:"中点"},
    {id:"8",type:"word",content:"Ordered pair"},{id:"8",type:"def",content:"有序对"},
    {id:"9",type:"word",content:"Origin"},{id:"9",type:"def",content:"原点"}
  ]
},

{
  board: '25m', slug: '25m-y7-position-and-direction-2', category: '25m-y7', title: 'Position and Direction (2)', titleZh: '位置和方向 (2)', unitNum: 4, unitTitle: 'Position and Direction', unitTitleZh: '位置和方向',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Plot"},{id:"0",type:"def",content:"描点/绘制"},
    {id:"1",type:"word",content:"Quadrant"},{id:"1",type:"def",content:"象限"},
    {id:"2",type:"word",content:"Vertical"},{id:"2",type:"def",content:"垂直的"},
    {id:"3",type:"word",content:"X-axis"},{id:"3",type:"def",content:"X轴"},
    {id:"4",type:"word",content:"Y-axis"},{id:"4",type:"def",content:"Y轴"}
  ]
},

{
  board: '25m', slug: '25m-y7-ratio-and-proportion-1', category: '25m-y7', title: 'Ratio and Proportion (1)', titleZh: '比率和比例 (1)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Colon"},{id:"0",type:"def",content:"冒号"},
    {id:"1",type:"word",content:"Constant of proportionality"},{id:"1",type:"def",content:"比例常数"},
    {id:"2",type:"word",content:"Corresponding"},{id:"2",type:"def",content:"对应的"},
    {id:"3",type:"word",content:"Direct proportion"},{id:"3",type:"def",content:"正比例"},
    {id:"4",type:"word",content:"Division"},{id:"4",type:"def",content:"除法"},
    {id:"5",type:"word",content:"Equivalent"},{id:"5",type:"def",content:"等价的"},
    {id:"6",type:"word",content:"Equivalent ratio"},{id:"6",type:"def",content:"等价比率"},
    {id:"7",type:"word",content:"Estimate"},{id:"7",type:"def",content:"估计"},
    {id:"8",type:"word",content:"Fraction"},{id:"8",type:"def",content:"分数"},
    {id:"9",type:"word",content:"Graph"},{id:"9",type:"def",content:"图表"}
  ]
},

{
  board: '25m', slug: '25m-y7-ratio-and-proportion-2', category: '25m-y7', title: 'Ratio and Proportion (2)', titleZh: '比率和比例 (2)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Map"},{id:"0",type:"def",content:"地图"},
    {id:"1",type:"word",content:"Part"},{id:"1",type:"def",content:"部分"},
    {id:"2",type:"word",content:"Proportion"},{id:"2",type:"def",content:"比例"},
    {id:"3",type:"word",content:"Proportional relationship"},{id:"3",type:"def",content:"比例关系"},
    {id:"4",type:"word",content:"Quantity"},{id:"4",type:"def",content:"数量"},
    {id:"5",type:"word",content:"Rate"},{id:"5",type:"def",content:"比率/速率"},
    {id:"6",type:"word",content:"Ratio"},{id:"6",type:"def",content:"比率"},
    {id:"7",type:"word",content:"Scale"},{id:"7",type:"def",content:"比例尺"},
    {id:"8",type:"word",content:"Share"},{id:"8",type:"def",content:"分享"},
    {id:"9",type:"word",content:"Simplest form"},{id:"9",type:"def",content:"最简形式"}
  ]
},

{
  board: '25m', slug: '25m-y7-ratio-and-proportion-3', category: '25m-y7', title: 'Ratio and Proportion (3)', titleZh: '比率和比例 (3)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Simplify"},{id:"0",type:"def",content:"简化"},
    {id:"1",type:"word",content:"Term"},{id:"1",type:"def",content:"项"},
    {id:"2",type:"word",content:"Total"},{id:"2",type:"def",content:"总数"},
    {id:"3",type:"word",content:"Unitary method"},{id:"3",type:"def",content:"单位法"},
    {id:"4",type:"word",content:"Units"},{id:"4",type:"def",content:"单位"},
    {id:"5",type:"word",content:"Variable"},{id:"5",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y7-percentage-1', category: '25m-y7', title: 'Percentage (1)', titleZh: '百分比 (1)', unitNum: 6, unitTitle: 'Percentage', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Convert"},{id:"0",type:"def",content:"转换"},
    {id:"1",type:"word",content:"Decimal"},{id:"1",type:"def",content:"小数"},
    {id:"2",type:"word",content:"Decrease"},{id:"2",type:"def",content:"减少"},
    {id:"3",type:"word",content:"Discount"},{id:"3",type:"def",content:"折扣"},
    {id:"4",type:"word",content:"Equivalent"},{id:"4",type:"def",content:"等价的"},
    {id:"5",type:"word",content:"Fraction"},{id:"5",type:"def",content:"分数"},
    {id:"6",type:"word",content:"Increase"},{id:"6",type:"def",content:"增加"},
    {id:"7",type:"word",content:"Interest"},{id:"7",type:"def",content:"利息"},
    {id:"8",type:"word",content:"Loss"},{id:"8",type:"def",content:"亏损"},
    {id:"9",type:"word",content:"Per cent"},{id:"9",type:"def",content:"百分之"}
  ]
},

{
  board: '25m', slug: '25m-y7-percentage-2', category: '25m-y7', title: 'Percentage (2)', titleZh: '百分比 (2)', unitNum: 6, unitTitle: 'Percentage', unitTitleZh: '百分比',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Percentage"},{id:"0",type:"def",content:"百分比"},
    {id:"1",type:"word",content:"Profit"},{id:"1",type:"def",content:"利润"},
    {id:"2",type:"word",content:"Quantity"},{id:"2",type:"def",content:"数量"},
    {id:"3",type:"word",content:"Tax"},{id:"3",type:"def",content:"税"},
    {id:"4",type:"word",content:"Whole"},{id:"4",type:"def",content:"整体"}
  ]
},

{
  board: '25m', slug: '25m-y7-circle-1', category: '25m-y7', title: 'Circle (1)', titleZh: '圆 (1)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle"},{id:"0",type:"def",content:"角度"},
    {id:"1",type:"word",content:"Arc"},{id:"1",type:"def",content:"弧"},
    {id:"2",type:"word",content:"Area"},{id:"2",type:"def",content:"面积"},
    {id:"3",type:"word",content:"Axis"},{id:"3",type:"def",content:"坐标轴"},
    {id:"4",type:"word",content:"Bar Chart"},{id:"4",type:"def",content:"条形图"},
    {id:"5",type:"word",content:"Bias"},{id:"5",type:"def",content:"偏差"},
    {id:"6",type:"word",content:"Category"},{id:"6",type:"def",content:"类别"},
    {id:"7",type:"word",content:"Centre"},{id:"7",type:"def",content:"圆心"},
    {id:"8",type:"word",content:"Chart"},{id:"8",type:"def",content:"图表"},
    {id:"9",type:"word",content:"Chord"},{id:"9",type:"def",content:"弦"}
  ]
},

{
  board: '25m', slug: '25m-y7-circle-2', category: '25m-y7', title: 'Circle (2)', titleZh: '圆 (2)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Circle"},{id:"0",type:"def",content:"圆"},
    {id:"1",type:"word",content:"Circumference"},{id:"1",type:"def",content:"周长"},
    {id:"2",type:"word",content:"Class Interval"},{id:"2",type:"def",content:"组距"},
    {id:"3",type:"word",content:"Collection"},{id:"3",type:"def",content:"收集"},
    {id:"4",type:"word",content:"Compass"},{id:"4",type:"def",content:"圆规"},
    {id:"5",type:"word",content:"Continuous Data"},{id:"5",type:"def",content:"连续数据"},
    {id:"6",type:"word",content:"Data"},{id:"6",type:"def",content:"数据"},
    {id:"7",type:"word",content:"Data Representation"},{id:"7",type:"def",content:"数据表示"},
    {id:"8",type:"word",content:"Degrees"},{id:"8",type:"def",content:"度数"},
    {id:"9",type:"word",content:"Diameter"},{id:"9",type:"def",content:"直径"}
  ]
},

{
  board: '25m', slug: '25m-y7-circle-3', category: '25m-y7', title: 'Circle (3)', titleZh: '圆 (3)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Discrete Data"},{id:"0",type:"def",content:"离散数据"},
    {id:"1",type:"word",content:"Formula"},{id:"1",type:"def",content:"公式"},
    {id:"2",type:"word",content:"Fraction"},{id:"2",type:"def",content:"分数"},
    {id:"3",type:"word",content:"Frequency"},{id:"3",type:"def",content:"频率"},
    {id:"4",type:"word",content:"Frequency Table"},{id:"4",type:"def",content:"频率表"},
    {id:"5",type:"word",content:"Interpretation"},{id:"5",type:"def",content:"解释"},
    {id:"6",type:"word",content:"Key"},{id:"6",type:"def",content:"图例"},
    {id:"7",type:"word",content:"Line Chart"},{id:"7",type:"def",content:"折线图"},
    {id:"8",type:"word",content:"Misleading"},{id:"8",type:"def",content:"误导性"},
    {id:"9",type:"word",content:"Organise"},{id:"9",type:"def",content:"组织"}
  ]
},

{
  board: '25m', slug: '25m-y7-circle-4', category: '25m-y7', title: 'Circle (4)', titleZh: '圆 (4)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Percentage"},{id:"0",type:"def",content:"百分比"},
    {id:"1",type:"word",content:"Pi (π)"},{id:"1",type:"def",content:"圆周率"},
    {id:"2",type:"word",content:"Pictogram"},{id:"2",type:"def",content:"象形图"},
    {id:"3",type:"word",content:"Pie Chart"},{id:"3",type:"def",content:"饼图"},
    {id:"4",type:"word",content:"Proportion"},{id:"4",type:"def",content:"比例"},
    {id:"5",type:"word",content:"Qualitative Data"},{id:"5",type:"def",content:"定性数据"},
    {id:"6",type:"word",content:"Quantitative Data"},{id:"6",type:"def",content:"定量数据"},
    {id:"7",type:"word",content:"Questionnaire"},{id:"7",type:"def",content:"问卷"},
    {id:"8",type:"word",content:"Radius"},{id:"8",type:"def",content:"半径"},
    {id:"9",type:"word",content:"Raw Data"},{id:"9",type:"def",content:"原始数据"}
  ]
},

{
  board: '25m', slug: '25m-y7-circle-5', category: '25m-y7', title: 'Circle (5)', titleZh: '圆 (5)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Represent"},{id:"0",type:"def",content:"表示"},
    {id:"1",type:"word",content:"Scale"},{id:"1",type:"def",content:"刻度"},
    {id:"2",type:"word",content:"Sector"},{id:"2",type:"def",content:"扇形"},
    {id:"3",type:"word",content:"Segment"},{id:"3",type:"def",content:"弓形"},
    {id:"4",type:"word",content:"Survey"},{id:"4",type:"def",content:"调查"},
    {id:"5",type:"word",content:"Tally Mark"},{id:"5",type:"def",content:"正字标记"},
    {id:"6",type:"word",content:"Tangent"},{id:"6",type:"def",content:"切线"},
    {id:"7",type:"word",content:"Title"},{id:"7",type:"def",content:"标题"},
    {id:"8",type:"word",content:"Total"},{id:"8",type:"def",content:"总数"}
  ]
},

{
  board: '25m', slug: '25m-y7-cylinders-and-cones-1', category: '25m-y7', title: 'Cylinders and Cones (1)', titleZh: '圆柱和圆锥 (1)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Apex"},{id:"0",type:"def",content:"顶点"},
    {id:"1",type:"word",content:"Arc"},{id:"1",type:"def",content:"弧"},
    {id:"2",type:"word",content:"Area"},{id:"2",type:"def",content:"面积"},
    {id:"3",type:"word",content:"Base"},{id:"3",type:"def",content:"底面"},
    {id:"4",type:"word",content:"Calculate"},{id:"4",type:"def",content:"计算"},
    {id:"5",type:"word",content:"Capacity"},{id:"5",type:"def",content:"容量"},
    {id:"6",type:"word",content:"Centre"},{id:"6",type:"def",content:"圆心"},
    {id:"7",type:"word",content:"Chord"},{id:"7",type:"def",content:"弦"},
    {id:"8",type:"word",content:"Circle"},{id:"8",type:"def",content:"圆"},
    {id:"9",type:"word",content:"Circumference"},{id:"9",type:"def",content:"周长"}
  ]
},

{
  board: '25m', slug: '25m-y7-cylinders-and-cones-2', category: '25m-y7', title: 'Cylinders and Cones (2)', titleZh: '圆柱和圆锥 (2)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Cone"},{id:"0",type:"def",content:"圆锥"},
    {id:"1",type:"word",content:"Convert"},{id:"1",type:"def",content:"转换"},
    {id:"2",type:"word",content:"Cubic centimetre (cm³)"},{id:"2",type:"def",content:"立方厘米"},
    {id:"3",type:"word",content:"Cubic metre (m³)"},{id:"3",type:"def",content:"立方米"},
    {id:"4",type:"word",content:"Cubic unit"},{id:"4",type:"def",content:"立方单位"},
    {id:"5",type:"word",content:"Curved surface"},{id:"5",type:"def",content:"曲面"},
    {id:"6",type:"word",content:"Cylinder"},{id:"6",type:"def",content:"圆柱"},
    {id:"7",type:"word",content:"Deduction"},{id:"7",type:"def",content:"推导"},
    {id:"8",type:"word",content:"Diameter"},{id:"8",type:"def",content:"直径"},
    {id:"9",type:"word",content:"Estimate"},{id:"9",type:"def",content:"估算"}
  ]
},

{
  board: '25m', slug: '25m-y7-cylinders-and-cones-3', category: '25m-y7', title: 'Cylinders and Cones (3)', titleZh: '圆柱和圆锥 (3)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Flat surface"},{id:"0",type:"def",content:"平面"},
    {id:"1",type:"word",content:"Formula"},{id:"1",type:"def",content:"公式"},
    {id:"2",type:"word",content:"Height"},{id:"2",type:"def",content:"高"},
    {id:"3",type:"word",content:"Lateral surface area"},{id:"3",type:"def",content:"侧面积"},
    {id:"4",type:"word",content:"Litre (L)"},{id:"4",type:"def",content:"升"},
    {id:"5",type:"word",content:"Metric units"},{id:"5",type:"def",content:"公制单位"},
    {id:"6",type:"word",content:"Millilitre (ml)"},{id:"6",type:"def",content:"毫升"},
    {id:"7",type:"word",content:"Model"},{id:"7",type:"def",content:"模型"},
    {id:"8",type:"word",content:"Net"},{id:"8",type:"def",content:"展开图"},
    {id:"9",type:"word",content:"Perimeter"},{id:"9",type:"def",content:"周长"}
  ]
},

{
  board: '25m', slug: '25m-y7-cylinders-and-cones-4', category: '25m-y7', title: 'Cylinders and Cones (4)', titleZh: '圆柱和圆锥 (4)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Pi (π)"},{id:"0",type:"def",content:"圆周率"},
    {id:"1",type:"word",content:"Problem-solving"},{id:"1",type:"def",content:"解决问题"},
    {id:"2",type:"word",content:"Radius"},{id:"2",type:"def",content:"半径"},
    {id:"3",type:"word",content:"Sector"},{id:"3",type:"def",content:"扇形"},
    {id:"4",type:"word",content:"Segment"},{id:"4",type:"def",content:"弓形"},
    {id:"5",type:"word",content:"Slant height"},{id:"5",type:"def",content:"斜高"},
    {id:"6",type:"word",content:"Solid"},{id:"6",type:"def",content:"立体图形"},
    {id:"7",type:"word",content:"Square unit"},{id:"7",type:"def",content:"平方单位"},
    {id:"8",type:"word",content:"Surface area"},{id:"8",type:"def",content:"表面积"},
    {id:"9",type:"word",content:"Three-dimensional (3D)"},{id:"9",type:"def",content:"三维"}
  ]
},

{
  board: '25m', slug: '25m-y7-cylinders-and-cones-5', category: '25m-y7', title: 'Cylinders and Cones (5)', titleZh: '圆柱和圆锥 (5)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Two-dimensional (2D)"},{id:"0",type:"def",content:"二维"},
    {id:"1",type:"word",content:"Volume"},{id:"1",type:"def",content:"体积"}
  ]
},

{
  board: '25m', slug: '25m-y7-linear-sequences-1', category: '25m-y7', title: 'Linear Sequences (1)', titleZh: '等差序列 (1)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Arithmetic sequence"},{id:"0",type:"def",content:"算术序列"},
    {id:"1",type:"word",content:"Common difference"},{id:"1",type:"def",content:"公差"},
    {id:"2",type:"word",content:"Derive"},{id:"2",type:"def",content:"推导"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"方程"},
    {id:"4",type:"word",content:"Expression"},{id:"4",type:"def",content:"表达式"},
    {id:"5",type:"word",content:"First term"},{id:"5",type:"def",content:"首项"},
    {id:"6",type:"word",content:"Formula"},{id:"6",type:"def",content:"公式"},
    {id:"7",type:"word",content:"General form"},{id:"7",type:"def",content:"一般形式"},
    {id:"8",type:"word",content:"Generate"},{id:"8",type:"def",content:"生成"},
    {id:"9",type:"word",content:"Integer"},{id:"9",type:"def",content:"整数"}
  ]
},

{
  board: '25m', slug: '25m-y7-linear-sequences-2', category: '25m-y7', title: 'Linear Sequences (2)', titleZh: '等差序列 (2)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Linear sequence"},{id:"0",type:"def",content:"等差序列"},
    {id:"1",type:"word",content:"nth term"},{id:"1",type:"def",content:"第n项"},
    {id:"2",type:"word",content:"nth term formula"},{id:"2",type:"def",content:"第n项公式"},
    {id:"3",type:"word",content:"Pattern"},{id:"3",type:"def",content:"模式"},
    {id:"4",type:"word",content:"Position"},{id:"4",type:"def",content:"项数"},
    {id:"5",type:"word",content:"Position-to-term rule"},{id:"5",type:"def",content:"项数与项规则"},
    {id:"6",type:"word",content:"Sequence"},{id:"6",type:"def",content:"序列"},
    {id:"7",type:"word",content:"Solution"},{id:"7",type:"def",content:"解"},
    {id:"8",type:"word",content:"Spatial pattern"},{id:"8",type:"def",content:"空间模式"},
    {id:"9",type:"word",content:"Substitute"},{id:"9",type:"def",content:"代入"}
  ]
},

{
  board: '25m', slug: '25m-y7-linear-sequences-3', category: '25m-y7', title: 'Linear Sequences (3)', titleZh: '等差序列 (3)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Term"},{id:"0",type:"def",content:"项"},
    {id:"1",type:"word",content:"Term number"},{id:"1",type:"def",content:"项数"},
    {id:"2",type:"word",content:"Term-to-term rule"},{id:"2",type:"def",content:"项与项规律"},
    {id:"3",type:"word",content:"Verify"},{id:"3",type:"def",content:"验证"}
  ]
},

{
  board: '25m', slug: '25m-y7-probability-1', category: '25m-y7', title: 'Probability (1)', titleZh: '概率 (1)', unitNum: 10, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Certain Event"},{id:"0",type:"def",content:"必然事件"},
    {id:"1",type:"word",content:"Event"},{id:"1",type:"def",content:"事件"},
    {id:"2",type:"word",content:"Experimental Probability"},{id:"2",type:"def",content:"实验概率"},
    {id:"3",type:"word",content:"Fair"},{id:"3",type:"def",content:"公平的"},
    {id:"4",type:"word",content:"Frequency"},{id:"4",type:"def",content:"频率"},
    {id:"5",type:"word",content:"Impossible Event"},{id:"5",type:"def",content:"不可能事件"},
    {id:"6",type:"word",content:"Likely"},{id:"6",type:"def",content:"可能的"},
    {id:"7",type:"word",content:"Mutually Exclusive Events"},{id:"7",type:"def",content:"互斥事件"},
    {id:"8",type:"word",content:"Outcome"},{id:"8",type:"def",content:"结果"},
    {id:"9",type:"word",content:"Probability"},{id:"9",type:"def",content:"概率"}
  ]
},

{
  board: '25m', slug: '25m-y7-probability-2', category: '25m-y7', title: 'Probability (2)', titleZh: '概率 (2)', unitNum: 10, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Random"},{id:"0",type:"def",content:"随机的"},
    {id:"1",type:"word",content:"Sample Space"},{id:"1",type:"def",content:"样本空间"},
    {id:"2",type:"word",content:"Theoretical Probability"},{id:"2",type:"def",content:"理论概率"},
    {id:"3",type:"word",content:"Trial"},{id:"3",type:"def",content:"试验"},
    {id:"4",type:"word",content:"Unlikely"},{id:"4",type:"def",content:"不太可能的"}
  ]
},

{
  board: '25m', slug: '25m-y7-constructions-1', category: '25m-y7', title: 'Constructions (1)', titleZh: '作图 (1)', unitNum: 11, unitTitle: 'Constructions', unitTitleZh: '作图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle"},{id:"0",type:"def",content:"角"},
    {id:"1",type:"word",content:"Angle bisector"},{id:"1",type:"def",content:"角平分线"},
    {id:"2",type:"word",content:"Arc"},{id:"2",type:"def",content:"弧"},
    {id:"3",type:"word",content:"Circle"},{id:"3",type:"def",content:"圆"},
    {id:"4",type:"word",content:"Compasses"},{id:"4",type:"def",content:"圆规"},
    {id:"5",type:"word",content:"Construction"},{id:"5",type:"def",content:"作图"},
    {id:"6",type:"word",content:"Equilateral triangle"},{id:"6",type:"def",content:"等边三角形"},
    {id:"7",type:"word",content:"Inscribe"},{id:"7",type:"def",content:"内接"},
    {id:"8",type:"word",content:"Line segment"},{id:"8",type:"def",content:"线段"},
    {id:"9",type:"word",content:"Locus"},{id:"9",type:"def",content:"轨迹"}
  ]
},

{
  board: '25m', slug: '25m-y7-constructions-2', category: '25m-y7', title: 'Constructions (2)', titleZh: '作图 (2)', unitNum: 11, unitTitle: 'Constructions', unitTitleZh: '作图',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Midpoint"},{id:"0",type:"def",content:"中点"},
    {id:"1",type:"word",content:"Perpendicular"},{id:"1",type:"def",content:"垂线/垂直的"},
    {id:"2",type:"word",content:"Perpendicular bisector"},{id:"2",type:"def",content:"垂直平分线"},
    {id:"3",type:"word",content:"Regular polygon"},{id:"3",type:"def",content:"正多边形"},
    {id:"4",type:"word",content:"Straight edge"},{id:"4",type:"def",content:"直尺"}
  ]
},


/* ═══ Year 8 (31 levels, 278 words) ═══ */

{
  board: '25m', slug: '25m-y8-review-of-numbers-1', category: '25m-y8', title: 'Review of Numbers (1)', titleZh: '数的复习 (1)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Absolute Value"},{id:"0",type:"def",content:"绝对值"},
    {id:"1",type:"word",content:"Addition"},{id:"1",type:"def",content:"加法"},
    {id:"2",type:"word",content:"Approximation"},{id:"2",type:"def",content:"近似值"},
    {id:"3",type:"word",content:"Ascending Order"},{id:"3",type:"def",content:"升序"},
    {id:"4",type:"word",content:"Cancel"},{id:"4",type:"def",content:"约分"},
    {id:"5",type:"word",content:"Common Denominator"},{id:"5",type:"def",content:"公分母"},
    {id:"6",type:"word",content:"Common Factor"},{id:"6",type:"def",content:"公因数"},
    {id:"7",type:"word",content:"Decimal"},{id:"7",type:"def",content:"小数"},
    {id:"8",type:"word",content:"Decimal Place"},{id:"8",type:"def",content:"小数位"},
    {id:"9",type:"word",content:"Decimal Place (dp)"},{id:"9",type:"def",content:"小数位"}
  ]
},

{
  board: '25m', slug: '25m-y8-review-of-numbers-2', category: '25m-y8', title: 'Review of Numbers (2)', titleZh: '数的复习 (2)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Decimal Point"},{id:"0",type:"def",content:"小数点"},
    {id:"1",type:"word",content:"Denominator"},{id:"1",type:"def",content:"分母"},
    {id:"2",type:"word",content:"Descending Order"},{id:"2",type:"def",content:"降序"},
    {id:"3",type:"word",content:"Directed Number"},{id:"3",type:"def",content:"有方向的数"},
    {id:"4",type:"word",content:"Division"},{id:"4",type:"def",content:"除法"},
    {id:"5",type:"word",content:"Equivalent Calculation"},{id:"5",type:"def",content:"等效计算"},
    {id:"6",type:"word",content:"Equivalent Fraction"},{id:"6",type:"def",content:"等价分数"},
    {id:"7",type:"word",content:"Estimate"},{id:"7",type:"def",content:"估计"},
    {id:"8",type:"word",content:"Fraction"},{id:"8",type:"def",content:"分数"},
    {id:"9",type:"word",content:"Greater Than"},{id:"9",type:"def",content:"大于"}
  ]
},

{
  board: '25m', slug: '25m-y8-review-of-numbers-3', category: '25m-y8', title: 'Review of Numbers (3)', titleZh: '数的复习 (3)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Hundred"},{id:"0",type:"def",content:"百"},
    {id:"1",type:"word",content:"Hundredth"},{id:"1",type:"def",content:"百分位"},
    {id:"2",type:"word",content:"Hundredths"},{id:"2",type:"def",content:"百分位"},
    {id:"3",type:"word",content:"Improper Fraction"},{id:"3",type:"def",content:"假分数"},
    {id:"4",type:"word",content:"Integer"},{id:"4",type:"def",content:"整数"},
    {id:"5",type:"word",content:"Least Common Multiple (LCM)"},{id:"5",type:"def",content:"最小公倍数"},
    {id:"6",type:"word",content:"Less Than"},{id:"6",type:"def",content:"小于"},
    {id:"7",type:"word",content:"Magnitude"},{id:"7",type:"def",content:"大小/模"},
    {id:"8",type:"word",content:"Mixed Number"},{id:"8",type:"def",content:"带分数"},
    {id:"9",type:"word",content:"Multiplication"},{id:"9",type:"def",content:"乘法"}
  ]
},

{
  board: '25m', slug: '25m-y8-review-of-numbers-4', category: '25m-y8', title: 'Review of Numbers (4)', titleZh: '数的复习 (4)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Nearest"},{id:"0",type:"def",content:"最接近的"},
    {id:"1",type:"word",content:"Negative Number"},{id:"1",type:"def",content:"负数"},
    {id:"2",type:"word",content:"Number Line"},{id:"2",type:"def",content:"数轴"},
    {id:"3",type:"word",content:"Numerator"},{id:"3",type:"def",content:"分子"},
    {id:"4",type:"word",content:"Opposite Number"},{id:"4",type:"def",content:"相反数"},
    {id:"5",type:"word",content:"Origin"},{id:"5",type:"def",content:"原点"},
    {id:"6",type:"word",content:"Positive Number"},{id:"6",type:"def",content:"正数"},
    {id:"7",type:"word",content:"Power of 10"},{id:"7",type:"def",content:"10的幂"},
    {id:"8",type:"word",content:"Product"},{id:"8",type:"def",content:"积"},
    {id:"9",type:"word",content:"Proper Fraction"},{id:"9",type:"def",content:"真分数"}
  ]
},

{
  board: '25m', slug: '25m-y8-review-of-numbers-5', category: '25m-y8', title: 'Review of Numbers (5)', titleZh: '数的复习 (5)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Quotient"},{id:"0",type:"def",content:"商"},
    {id:"1",type:"word",content:"Reciprocal"},{id:"1",type:"def",content:"倒数"},
    {id:"2",type:"word",content:"Rounding"},{id:"2",type:"def",content:"四舍五入"},
    {id:"3",type:"word",content:"Significant Figure (sf)"},{id:"3",type:"def",content:"有效数字"},
    {id:"4",type:"word",content:"Simplest Form"},{id:"4",type:"def",content:"最简分数"},
    {id:"5",type:"word",content:"Subtraction"},{id:"5",type:"def",content:"减法"},
    {id:"6",type:"word",content:"Tenth"},{id:"6",type:"def",content:"十分位"},
    {id:"7",type:"word",content:"Tenths"},{id:"7",type:"def",content:"十分位"},
    {id:"8",type:"word",content:"Thousand"},{id:"8",type:"def",content:"千"},
    {id:"9",type:"word",content:"Thousandths"},{id:"9",type:"def",content:"千分位"}
  ]
},

{
  board: '25m', slug: '25m-y8-review-of-numbers-6', category: '25m-y8', title: 'Review of Numbers (6)', titleZh: '数的复习 (6)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Truncation"},{id:"0",type:"def",content:"截断法"},
    {id:"1",type:"word",content:"Whole Number"},{id:"1",type:"def",content:"整数"}
  ]
},

{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-1', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (1)', titleZh: '有理数、因数和质数 (1)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Associative law"},{id:"0",type:"def",content:"结合律"},
    {id:"1",type:"word",content:"Base"},{id:"1",type:"def",content:"底数"},
    {id:"2",type:"word",content:"Commutative law"},{id:"2",type:"def",content:"交换律"},
    {id:"3",type:"word",content:"Composite number"},{id:"3",type:"def",content:"合数"},
    {id:"4",type:"word",content:"Cube root"},{id:"4",type:"def",content:"立方根"},
    {id:"5",type:"word",content:"Decimal"},{id:"5",type:"def",content:"小数"},
    {id:"6",type:"word",content:"Denominator"},{id:"6",type:"def",content:"分母"},
    {id:"7",type:"word",content:"Distributive law"},{id:"7",type:"def",content:"分配律"},
    {id:"8",type:"word",content:"Divisible"},{id:"8",type:"def",content:"可整除的"},
    {id:"9",type:"word",content:"Exponentiation"},{id:"9",type:"def",content:"乘方"}
  ]
},

{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-2', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (2)', titleZh: '有理数、因数和质数 (2)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Factor"},{id:"0",type:"def",content:"因数"},
    {id:"1",type:"word",content:"Fraction"},{id:"1",type:"def",content:"分数"},
    {id:"2",type:"word",content:"Greatest Common Factor (GCF) / Highest Common Factor (HCF)"},{id:"2",type:"def",content:"最大公因数"},
    {id:"3",type:"word",content:"Index (Indices)"},{id:"3",type:"def",content:"指数"},
    {id:"4",type:"word",content:"Integer"},{id:"4",type:"def",content:"整数"},
    {id:"5",type:"word",content:"Irrational number"},{id:"5",type:"def",content:"无理数"},
    {id:"6",type:"word",content:"Least Common Multiple (LCM)"},{id:"6",type:"def",content:"最小公倍数"},
    {id:"7",type:"word",content:"Mixed operations"},{id:"7",type:"def",content:"混合运算"},
    {id:"8",type:"word",content:"Multiple"},{id:"8",type:"def",content:"倍数"},
    {id:"9",type:"word",content:"Negative number"},{id:"9",type:"def",content:"负数"}
  ]
},

{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-3', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (3)', titleZh: '有理数、因数和质数 (3)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Number line"},{id:"0",type:"def",content:"数轴"},
    {id:"1",type:"word",content:"Numerator"},{id:"1",type:"def",content:"分子"},
    {id:"2",type:"word",content:"Prime factorization"},{id:"2",type:"def",content:"质因数分解"},
    {id:"3",type:"word",content:"Prime number"},{id:"3",type:"def",content:"质数 (素数)"},
    {id:"4",type:"word",content:"Rational number"},{id:"4",type:"def",content:"有理数"},
    {id:"5",type:"word",content:"Real number"},{id:"5",type:"def",content:"实数"},
    {id:"6",type:"word",content:"Root"},{id:"6",type:"def",content:"根"},
    {id:"7",type:"word",content:"Sieve of Eratosthenes"},{id:"7",type:"def",content:"埃拉托色尼筛法"},
    {id:"8",type:"word",content:"Square root"},{id:"8",type:"def",content:"平方根"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-1', category: '25m-y8', title: 'Algebraic Formula (1)', titleZh: '代数公式 (1)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Algebraic"},{id:"0",type:"def",content:"代数的"},
    {id:"1",type:"word",content:"Algebraic factor"},{id:"1",type:"def",content:"代数因数"},
    {id:"2",type:"word",content:"Analyse"},{id:"2",type:"def",content:"分析"},
    {id:"3",type:"word",content:"Area"},{id:"3",type:"def",content:"面积"},
    {id:"4",type:"word",content:"Balance"},{id:"4",type:"def",content:"平衡"},
    {id:"5",type:"word",content:"Base"},{id:"5",type:"def",content:"底数"},
    {id:"6",type:"word",content:"Bracket"},{id:"6",type:"def",content:"括号"},
    {id:"7",type:"word",content:"Coefficient"},{id:"7",type:"def",content:"系数"},
    {id:"8",type:"word",content:"Common factor"},{id:"8",type:"def",content:"公因数"},
    {id:"9",type:"word",content:"Constant"},{id:"9",type:"def",content:"常数"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-2', category: '25m-y8', title: 'Algebraic Formula (2)', titleZh: '代数公式 (2)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Conversion"},{id:"0",type:"def",content:"转换"},
    {id:"1",type:"word",content:"Denominator"},{id:"1",type:"def",content:"分母"},
    {id:"2",type:"word",content:"Distance"},{id:"2",type:"def",content:"距离"},
    {id:"3",type:"word",content:"Distributive law"},{id:"3",type:"def",content:"分配律"},
    {id:"4",type:"word",content:"Equation"},{id:"4",type:"def",content:"方程"},
    {id:"5",type:"word",content:"Expand"},{id:"5",type:"def",content:"展开"},
    {id:"6",type:"word",content:"Expression"},{id:"6",type:"def",content:"表达式"},
    {id:"7",type:"word",content:"Factor"},{id:"7",type:"def",content:"因数"},
    {id:"8",type:"word",content:"Factorise"},{id:"8",type:"def",content:"因式分解"},
    {id:"9",type:"word",content:"Formula"},{id:"9",type:"def",content:"公式"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-3', category: '25m-y8', title: 'Algebraic Formula (3)', titleZh: '代数公式 (3)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Formulate"},{id:"0",type:"def",content:"建立/制定"},
    {id:"1",type:"word",content:"Fraction"},{id:"1",type:"def",content:"分数"},
    {id:"2",type:"word",content:"Highest Common Factor (HCF)"},{id:"2",type:"def",content:"最大公因数"},
    {id:"3",type:"word",content:"Index / Power"},{id:"3",type:"def",content:"指数 / 幂"},
    {id:"4",type:"word",content:"Integer"},{id:"4",type:"def",content:"整数"},
    {id:"5",type:"word",content:"Interpret"},{id:"5",type:"def",content:"解释"},
    {id:"6",type:"word",content:"Inverse operation"},{id:"6",type:"def",content:"逆运算"},
    {id:"7",type:"word",content:"Isolate"},{id:"7",type:"def",content:"分离"},
    {id:"8",type:"word",content:"Known"},{id:"8",type:"def",content:"已知数"},
    {id:"9",type:"word",content:"Like terms"},{id:"9",type:"def",content:"同类项"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-4', category: '25m-y8', title: 'Algebraic Formula (4)', titleZh: '代数公式 (4)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Linear expression"},{id:"0",type:"def",content:"线性表达式"},
    {id:"1",type:"word",content:"Mathematical model"},{id:"1",type:"def",content:"数学模型"},
    {id:"2",type:"word",content:"Negative integer"},{id:"2",type:"def",content:"负整数"},
    {id:"3",type:"word",content:"Non-integer"},{id:"3",type:"def",content:"非整数"},
    {id:"4",type:"word",content:"Numerator"},{id:"4",type:"def",content:"分子"},
    {id:"5",type:"word",content:"Order of operations"},{id:"5",type:"def",content:"运算顺序"},
    {id:"6",type:"word",content:"Perimeter"},{id:"6",type:"def",content:"周长"},
    {id:"7",type:"word",content:"Positive integer"},{id:"7",type:"def",content:"正整数"},
    {id:"8",type:"word",content:"Prime factor"},{id:"8",type:"def",content:"质因数"},
    {id:"9",type:"word",content:"Problem solving"},{id:"9",type:"def",content:"问题解决"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-5', category: '25m-y8', title: 'Algebraic Formula (5)', titleZh: '代数公式 (5)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Real-life situation"},{id:"0",type:"def",content:"现实生活情境"},
    {id:"1",type:"word",content:"Relationship"},{id:"1",type:"def",content:"关系"},
    {id:"2",type:"word",content:"Simplify"},{id:"2",type:"def",content:"简化"},
    {id:"3",type:"word",content:"Solution"},{id:"3",type:"def",content:"解"},
    {id:"4",type:"word",content:"Solve"},{id:"4",type:"def",content:"解"},
    {id:"5",type:"word",content:"Speed"},{id:"5",type:"def",content:"速度"},
    {id:"6",type:"word",content:"Strategy"},{id:"6",type:"def",content:"策略"},
    {id:"7",type:"word",content:"Substitute"},{id:"7",type:"def",content:"代入"},
    {id:"8",type:"word",content:"Temperature"},{id:"8",type:"def",content:"温度"},
    {id:"9",type:"word",content:"Term"},{id:"9",type:"def",content:"项"}
  ]
},

{
  board: '25m', slug: '25m-y8-algebraic-formula-6', category: '25m-y8', title: 'Algebraic Formula (6)', titleZh: '代数公式 (6)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Time"},{id:"0",type:"def",content:"时间"},
    {id:"1",type:"word",content:"Unknown"},{id:"1",type:"def",content:"未知数"},
    {id:"2",type:"word",content:"Value"},{id:"2",type:"def",content:"值"},
    {id:"3",type:"word",content:"Variable"},{id:"3",type:"def",content:"变量"},
    {id:"4",type:"word",content:"Volume"},{id:"4",type:"def",content:"体积"}
  ]
},

{
  board: '25m', slug: '25m-y8-inequalities-and-inequations-1', category: '25m-y8', title: 'Inequalities and Inequations (1)', titleZh: '不等式和不等式方程 (1)', unitNum: 4, unitTitle: 'Inequalities and Inequations', unitTitleZh: '不等式和不等式方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Greater than"},{id:"0",type:"def",content:"大于"},
    {id:"1",type:"word",content:"Greater than or equal to"},{id:"1",type:"def",content:"大于或等于"},
    {id:"2",type:"word",content:"Inequality"},{id:"2",type:"def",content:"不等式"},
    {id:"3",type:"word",content:"Inequation"},{id:"3",type:"def",content:"不等式方程"},
    {id:"4",type:"word",content:"Integer"},{id:"4",type:"def",content:"整数"},
    {id:"5",type:"word",content:"Less than"},{id:"5",type:"def",content:"小于"},
    {id:"6",type:"word",content:"Less than or equal to"},{id:"6",type:"def",content:"小于或等于"},
    {id:"7",type:"word",content:"Negative number"},{id:"7",type:"def",content:"负数"},
    {id:"8",type:"word",content:"Number line"},{id:"8",type:"def",content:"数轴"},
    {id:"9",type:"word",content:"Positive number"},{id:"9",type:"def",content:"正数"}
  ]
},

{
  board: '25m', slug: '25m-y8-inequalities-and-inequations-2', category: '25m-y8', title: 'Inequalities and Inequations (2)', titleZh: '不等式和不等式方程 (2)', unitNum: 4, unitTitle: 'Inequalities and Inequations', unitTitleZh: '不等式和不等式方程',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"范围"},
    {id:"1",type:"word",content:"Solution set"},{id:"1",type:"def",content:"解集"},
    {id:"2",type:"word",content:"Solve"},{id:"2",type:"def",content:"求解"},
    {id:"3",type:"word",content:"Symbol"},{id:"3",type:"def",content:"符号"},
    {id:"4",type:"word",content:"Variable"},{id:"4",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y8-introduction-to-pythagoras-the-1', category: '25m-y8', title: 'Introduction to Pythagoras\' Theorem (1)', titleZh: '勾股定理简介 (1)', unitNum: 5, unitTitle: 'Introduction to Pythagoras\' Theorem', unitTitleZh: '勾股定理简介',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Ancient China"},{id:"0",type:"def",content:"中国古代"},
    {id:"1",type:"word",content:"Ancient Greece"},{id:"1",type:"def",content:"古希腊"},
    {id:"2",type:"word",content:"Area"},{id:"2",type:"def",content:"面积"},
    {id:"3",type:"word",content:"Diagonal"},{id:"3",type:"def",content:"对角线"},
    {id:"4",type:"word",content:"Hypotenuse"},{id:"4",type:"def",content:"斜边"},
    {id:"5",type:"word",content:"Leg (of a right triangle)"},{id:"5",type:"def",content:"直角边"},
    {id:"6",type:"word",content:"Perimeter"},{id:"6",type:"def",content:"周长"},
    {id:"7",type:"word",content:"Proof"},{id:"7",type:"def",content:"证明"},
    {id:"8",type:"word",content:"Pythagoras\' Theorem"},{id:"8",type:"def",content:"勾股定理"},
    {id:"9",type:"word",content:"Pythagorean triple"},{id:"9",type:"def",content:"勾股数"}
  ]
},

{
  board: '25m', slug: '25m-y8-introduction-to-pythagoras-the-2', category: '25m-y8', title: 'Introduction to Pythagoras\' Theorem (2)', titleZh: '勾股定理简介 (2)', unitNum: 5, unitTitle: 'Introduction to Pythagoras\' Theorem', unitTitleZh: '勾股定理简介',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Right-angled triangle"},{id:"0",type:"def",content:"直角三角形"},
    {id:"1",type:"word",content:"Square"},{id:"1",type:"def",content:"平方"},
    {id:"2",type:"word",content:"Square root"},{id:"2",type:"def",content:"平方根"},
    {id:"3",type:"word",content:"Theorem"},{id:"3",type:"def",content:"定理"},
    {id:"4",type:"word",content:"Two-dimensional"},{id:"4",type:"def",content:"二维"}
  ]
},

{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-1', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (1)', titleZh: '相交线和平行线 (1)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Adjacent angles"},{id:"0",type:"def",content:"邻角"},
    {id:"1",type:"word",content:"Alternate interior angles"},{id:"1",type:"def",content:"内错角"},
    {id:"2",type:"word",content:"Angle"},{id:"2",type:"def",content:"角"},
    {id:"3",type:"word",content:"Angle rules"},{id:"3",type:"def",content:"角度规则"},
    {id:"4",type:"word",content:"Co-interior angles"},{id:"4",type:"def",content:"同旁内角"},
    {id:"5",type:"word",content:"Congruent"},{id:"5",type:"def",content:"全等"},
    {id:"6",type:"word",content:"Corresponding angles"},{id:"6",type:"def",content:"同位角"},
    {id:"7",type:"word",content:"Degree"},{id:"7",type:"def",content:"度"},
    {id:"8",type:"word",content:"Diagram"},{id:"8",type:"def",content:"图表"},
    {id:"9",type:"word",content:"Exterior angles"},{id:"9",type:"def",content:"外角"}
  ]
},

{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-2', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (2)', titleZh: '相交线和平行线 (2)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Interior angles"},{id:"0",type:"def",content:"内角"},
    {id:"1",type:"word",content:"Intersecting lines"},{id:"1",type:"def",content:"相交线"},
    {id:"2",type:"word",content:"Parallel lines"},{id:"2",type:"def",content:"平行线"},
    {id:"3",type:"word",content:"Perpendicular lines"},{id:"3",type:"def",content:"垂线"},
    {id:"4",type:"word",content:"Point"},{id:"4",type:"def",content:"点"},
    {id:"5",type:"word",content:"Proof"},{id:"5",type:"def",content:"证明"},
    {id:"6",type:"word",content:"Quadrilateral"},{id:"6",type:"def",content:"四边形"},
    {id:"7",type:"word",content:"Reasoning"},{id:"7",type:"def",content:"推理"},
    {id:"8",type:"word",content:"Straight line"},{id:"8",type:"def",content:"直线"},
    {id:"9",type:"word",content:"Sum"},{id:"9",type:"def",content:"和"}
  ]
},

{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-3', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (3)', titleZh: '相交线和平行线 (3)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Supplementary"},{id:"0",type:"def",content:"互补的"},
    {id:"1",type:"word",content:"Supplementary angles"},{id:"1",type:"def",content:"补角"},
    {id:"2",type:"word",content:"Transversal"},{id:"2",type:"def",content:"截线"},
    {id:"3",type:"word",content:"Triangle"},{id:"3",type:"def",content:"三角形"},
    {id:"4",type:"word",content:"Vertex"},{id:"4",type:"def",content:"顶点"},
    {id:"5",type:"word",content:"Vertically opposite angles"},{id:"5",type:"def",content:"对顶角"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-algebra-1', category: '25m-y8', title: 'Further Algebra (1)', titleZh: '进一步的代数 (1)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Coefficient"},{id:"0",type:"def",content:"系数"},
    {id:"1",type:"word",content:"Constant"},{id:"1",type:"def",content:"常数"},
    {id:"2",type:"word",content:"Coordinate"},{id:"2",type:"def",content:"坐标"},
    {id:"3",type:"word",content:"Derive"},{id:"3",type:"def",content:"推导"},
    {id:"4",type:"word",content:"Elimination method"},{id:"4",type:"def",content:"消元法"},
    {id:"5",type:"word",content:"Equation"},{id:"5",type:"def",content:"方程"},
    {id:"6",type:"word",content:"Expression"},{id:"6",type:"def",content:"表达式"},
    {id:"7",type:"word",content:"Formula"},{id:"7",type:"def",content:"公式"},
    {id:"8",type:"word",content:"Graph"},{id:"8",type:"def",content:"图表"},
    {id:"9",type:"word",content:"Intersection point"},{id:"9",type:"def",content:"交点"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-algebra-2', category: '25m-y8', title: 'Further Algebra (2)', titleZh: '进一步的代数 (2)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Like terms"},{id:"0",type:"def",content:"同类项"},
    {id:"1",type:"word",content:"Linear equation"},{id:"1",type:"def",content:"线性方程"},
    {id:"2",type:"word",content:"Linear equations"},{id:"2",type:"def",content:"线性方程"},
    {id:"3",type:"word",content:"Practical problem"},{id:"3",type:"def",content:"实际问题"},
    {id:"4",type:"word",content:"Rearrange"},{id:"4",type:"def",content:"重排"},
    {id:"5",type:"word",content:"Scaling"},{id:"5",type:"def",content:"缩放"},
    {id:"6",type:"word",content:"Simplify"},{id:"6",type:"def",content:"简化"},
    {id:"7",type:"word",content:"Simultaneous equations"},{id:"7",type:"def",content:"联立方程组"},
    {id:"8",type:"word",content:"Solution"},{id:"8",type:"def",content:"解"},
    {id:"9",type:"word",content:"Solve"},{id:"9",type:"def",content:"求解"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-algebra-3', category: '25m-y8', title: 'Further Algebra (3)', titleZh: '进一步的代数 (3)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Subject of a formula"},{id:"0",type:"def",content:"公式的主体"},
    {id:"1",type:"word",content:"Substitute"},{id:"1",type:"def",content:"代入"},
    {id:"2",type:"word",content:"Substitution method"},{id:"2",type:"def",content:"代入法"},
    {id:"3",type:"word",content:"System of equations"},{id:"3",type:"def",content:"方程组"},
    {id:"4",type:"word",content:"Term"},{id:"4",type:"def",content:"项"},
    {id:"5",type:"word",content:"Unknown"},{id:"5",type:"def",content:"未知数"},
    {id:"6",type:"word",content:"Variable"},{id:"6",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-1', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (1)', titleZh: '坐标和绘制线性图表 (1)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Cartesian coordinates"},{id:"0",type:"def",content:"笛卡尔坐标"},
    {id:"1",type:"word",content:"Coordinate pair"},{id:"1",type:"def",content:"坐标对"},
    {id:"2",type:"word",content:"Distance"},{id:"2",type:"def",content:"距离"},
    {id:"3",type:"word",content:"Explicit form"},{id:"3",type:"def",content:"显式形式"},
    {id:"4",type:"word",content:"Function"},{id:"4",type:"def",content:"函数"},
    {id:"5",type:"word",content:"Gradient"},{id:"5",type:"def",content:"斜率"},
    {id:"6",type:"word",content:"Horizontal"},{id:"6",type:"def",content:"水平的"},
    {id:"7",type:"word",content:"Implicit form"},{id:"7",type:"def",content:"隐式形式"},
    {id:"8",type:"word",content:"Intercept"},{id:"8",type:"def",content:"截距"},
    {id:"9",type:"word",content:"Interpretation"},{id:"9",type:"def",content:"解释"}
  ]
},

{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-2', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (2)', titleZh: '坐标和绘制线性图表 (2)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Linear equation"},{id:"0",type:"def",content:"线性方程"},
    {id:"1",type:"word",content:"Linear graph"},{id:"1",type:"def",content:"线性图表"},
    {id:"2",type:"word",content:"Midpoint"},{id:"2",type:"def",content:"中点"},
    {id:"3",type:"word",content:"Origin"},{id:"3",type:"def",content:"原点"},
    {id:"4",type:"word",content:"Parallel lines"},{id:"4",type:"def",content:"平行线"},
    {id:"5",type:"word",content:"Plot"},{id:"5",type:"def",content:"绘制"},
    {id:"6",type:"word",content:"Point"},{id:"6",type:"def",content:"点"},
    {id:"7",type:"word",content:"Quadrant"},{id:"7",type:"def",content:"象限"},
    {id:"8",type:"word",content:"Real-life problem"},{id:"8",type:"def",content:"实际问题"},
    {id:"9",type:"word",content:"Reflection"},{id:"9",type:"def",content:"反射"}
  ]
},

{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-3', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (3)', titleZh: '坐标和绘制线性图表 (3)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Solution"},{id:"0",type:"def",content:"解"},
    {id:"1",type:"word",content:"Straight line"},{id:"1",type:"def",content:"直线"},
    {id:"2",type:"word",content:"Table of values"},{id:"2",type:"def",content:"数值表"},
    {id:"3",type:"word",content:"Translation"},{id:"3",type:"def",content:"平移"},
    {id:"4",type:"word",content:"Vertical"},{id:"4",type:"def",content:"垂直的"},
    {id:"5",type:"word",content:"x-axis"},{id:"5",type:"def",content:"x轴"},
    {id:"6",type:"word",content:"x-intercept"},{id:"6",type:"def",content:"x截距"},
    {id:"7",type:"word",content:"y-axis"},{id:"7",type:"def",content:"y轴"},
    {id:"8",type:"word",content:"y-intercept"},{id:"8",type:"def",content:"y截距"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-statistics-1', category: '25m-y8', title: 'Further Statistics (1)', titleZh: '更多的统计 (1)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Back-to-back stem-and-leaf diagram"},{id:"0",type:"def",content:"背对背茎叶图"},
    {id:"1",type:"word",content:"Class interval"},{id:"1",type:"def",content:"类间隔"},
    {id:"2",type:"word",content:"Comprehensive survey"},{id:"2",type:"def",content:"全面调查"},
    {id:"3",type:"word",content:"Conclusion"},{id:"3",type:"def",content:"结论"},
    {id:"4",type:"word",content:"Continuous data"},{id:"4",type:"def",content:"连续数据"},
    {id:"5",type:"word",content:"Data collection"},{id:"5",type:"def",content:"数据收集"},
    {id:"6",type:"word",content:"Data interpretation"},{id:"6",type:"def",content:"数据解释"},
    {id:"7",type:"word",content:"Discrete data"},{id:"7",type:"def",content:"离散数据"},
    {id:"8",type:"word",content:"Frequency"},{id:"8",type:"def",content:"频率"},
    {id:"9",type:"word",content:"Frequency diagram"},{id:"9",type:"def",content:"频率图"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-statistics-2', category: '25m-y8', title: 'Further Statistics (2)', titleZh: '更多的统计 (2)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Frequency polygon"},{id:"0",type:"def",content:"频率多边形"},
    {id:"1",type:"word",content:"Frequency tree diagram"},{id:"1",type:"def",content:"频率树图"},
    {id:"2",type:"word",content:"Interpretation"},{id:"2",type:"def",content:"解释"},
    {id:"3",type:"word",content:"Line graph"},{id:"3",type:"def",content:"线图"},
    {id:"4",type:"word",content:"Mean"},{id:"4",type:"def",content:"平均数"},
    {id:"5",type:"word",content:"Median"},{id:"5",type:"def",content:"中位数"},
    {id:"6",type:"word",content:"Mode"},{id:"6",type:"def",content:"众数"},
    {id:"7",type:"word",content:"Pie chart"},{id:"7",type:"def",content:"饼图"},
    {id:"8",type:"word",content:"Primary data"},{id:"8",type:"def",content:"初级数据"},
    {id:"9",type:"word",content:"Proportion"},{id:"9",type:"def",content:"比例"}
  ]
},

{
  board: '25m', slug: '25m-y8-further-statistics-3', category: '25m-y8', title: 'Further Statistics (3)', titleZh: '更多的统计 (3)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"极差"},
    {id:"1",type:"word",content:"Raw data"},{id:"1",type:"def",content:"原始数据"},
    {id:"2",type:"word",content:"Sampling survey"},{id:"2",type:"def",content:"抽样调查"},
    {id:"3",type:"word",content:"Secondary data"},{id:"3",type:"def",content:"次级数据"},
    {id:"4",type:"word",content:"Statistics"},{id:"4",type:"def",content:"统计数据"},
    {id:"5",type:"word",content:"Stem-and-leaf diagram"},{id:"5",type:"def",content:"茎叶图"},
    {id:"6",type:"word",content:"Survey"},{id:"6",type:"def",content:"调查"},
    {id:"7",type:"word",content:"Tabulation"},{id:"7",type:"def",content:"制表"},
    {id:"8",type:"word",content:"Time series"},{id:"8",type:"def",content:"时间序列"},
    {id:"9",type:"word",content:"Two-way table"},{id:"9",type:"def",content:"双向表"}
  ]
},


/* ═══ Year 9 (49 levels, 424 words) ═══ */

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-1', category: '25m-y9', title: 'Working with Irrational Numbers (1)', titleZh: '理数的运算 (1)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Absolute value"},{id:"0",type:"def",content:"绝对值"},
    {id:"1",type:"word",content:"Approximation"},{id:"1",type:"def",content:"近似值"},
    {id:"2",type:"word",content:"Arithmetic square root"},{id:"2",type:"def",content:"算术平方根"},
    {id:"3",type:"word",content:"Calculator"},{id:"3",type:"def",content:"计算器"},
    {id:"4",type:"word",content:"Conjugate surds"},{id:"4",type:"def",content:"共轭根式"},
    {id:"5",type:"word",content:"Consecutive integers"},{id:"5",type:"def",content:"连续整数"},
    {id:"6",type:"word",content:"Cube root"},{id:"6",type:"def",content:"立方根"},
    {id:"7",type:"word",content:"Decimal"},{id:"7",type:"def",content:"小数"},
    {id:"8",type:"word",content:"Decimal places"},{id:"8",type:"def",content:"小数位数"},
    {id:"9",type:"word",content:"Denominator"},{id:"9",type:"def",content:"分母"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-2', category: '25m-y9', title: 'Working with Irrational Numbers (2)', titleZh: '理数的运算 (2)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Estimation"},{id:"0",type:"def",content:"估算"},
    {id:"1",type:"word",content:"Fraction"},{id:"1",type:"def",content:"分数"},
    {id:"2",type:"word",content:"Index"},{id:"2",type:"def",content:"根指数"},
    {id:"3",type:"word",content:"Integer"},{id:"3",type:"def",content:"整数"},
    {id:"4",type:"word",content:"Inverse operation"},{id:"4",type:"def",content:"逆运算"},
    {id:"5",type:"word",content:"Irrational number"},{id:"5",type:"def",content:"无理数"},
    {id:"6",type:"word",content:"Irrational numbers"},{id:"6",type:"def",content:"无理数"},
    {id:"7",type:"word",content:"Like surds"},{id:"7",type:"def",content:"同类二次根式"},
    {id:"8",type:"word",content:"Lower bound"},{id:"8",type:"def",content:"下界"},
    {id:"9",type:"word",content:"Natural numbers"},{id:"9",type:"def",content:"自然数"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-3', category: '25m-y9', title: 'Working with Irrational Numbers (3)', titleZh: '理数的运算 (3)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Negative numbers"},{id:"0",type:"def",content:"负数"},
    {id:"1",type:"word",content:"Negative square root"},{id:"1",type:"def",content:"负平方根"},
    {id:"2",type:"word",content:"Non-terminating non-repeating decimal"},{id:"2",type:"def",content:"无限不循环小数"},
    {id:"3",type:"word",content:"Non-terminating repeating decimal"},{id:"3",type:"def",content:"无限循环小数"},
    {id:"4",type:"word",content:"Number line"},{id:"4",type:"def",content:"数轴"},
    {id:"5",type:"word",content:"Operation"},{id:"5",type:"def",content:"运算"},
    {id:"6",type:"word",content:"Opposite number"},{id:"6",type:"def",content:"相反数"},
    {id:"7",type:"word",content:"Perfect cube"},{id:"7",type:"def",content:"完全立方数"},
    {id:"8",type:"word",content:"Perfect square"},{id:"8",type:"def",content:"完全平方数"},
    {id:"9",type:"word",content:"Positive numbers"},{id:"9",type:"def",content:"正数"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-4', category: '25m-y9', title: 'Working with Irrational Numbers (4)', titleZh: '理数的运算 (4)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Positive square root"},{id:"0",type:"def",content:"正平方根"},
    {id:"1",type:"word",content:"Power"},{id:"1",type:"def",content:"幂"},
    {id:"2",type:"word",content:"Precision"},{id:"2",type:"def",content:"精确度"},
    {id:"3",type:"word",content:"Product property of surds"},{id:"3",type:"def",content:"根式的乘法性质"},
    {id:"4",type:"word",content:"Quadratic Surd"},{id:"4",type:"def",content:"二次根式"},
    {id:"5",type:"word",content:"Quotient property of surds"},{id:"5",type:"def",content:"根式的除法性质"},
    {id:"6",type:"word",content:"Radical sign"},{id:"6",type:"def",content:"根号"},
    {id:"7",type:"word",content:"Radicand"},{id:"7",type:"def",content:"被开方数"},
    {id:"8",type:"word",content:"Range"},{id:"8",type:"def",content:"范围"},
    {id:"9",type:"word",content:"Rational number"},{id:"9",type:"def",content:"有理数"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-5', category: '25m-y9', title: 'Working with Irrational Numbers (5)', titleZh: '理数的运算 (5)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Rational numbers"},{id:"0",type:"def",content:"有理数"},
    {id:"1",type:"word",content:"Rationalize the denominator"},{id:"1",type:"def",content:"分母有理化"},
    {id:"2",type:"word",content:"Real numbers"},{id:"2",type:"def",content:"实数"},
    {id:"3",type:"word",content:"Root notation"},{id:"3",type:"def",content:"根号表示法"},
    {id:"4",type:"word",content:"Rounding"},{id:"4",type:"def",content:"四舍五入"},
    {id:"5",type:"word",content:"Simplest surd form"},{id:"5",type:"def",content:"最简二次根式"},
    {id:"6",type:"word",content:"Simplification"},{id:"6",type:"def",content:"化简"},
    {id:"7",type:"word",content:"Square root"},{id:"7",type:"def",content:"平方根"},
    {id:"8",type:"word",content:"Square root of a product"},{id:"8",type:"def",content:"积的平方根"},
    {id:"9",type:"word",content:"Square root of a quotient"},{id:"9",type:"def",content:"商的平方根"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-irrational-number-6', category: '25m-y9', title: 'Working with Irrational Numbers (6)', titleZh: '理数的运算 (6)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Terminating decimal"},{id:"0",type:"def",content:"有限小数"},
    {id:"1",type:"word",content:"Unlike surds"},{id:"1",type:"def",content:"非同类二次根式"},
    {id:"2",type:"word",content:"Upper bound"},{id:"2",type:"def",content:"上界"},
    {id:"3",type:"word",content:"Whole numbers"},{id:"3",type:"def",content:"非负整数"},
    {id:"4",type:"word",content:"Zero"},{id:"4",type:"def",content:"零"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-1', category: '25m-y9', title: 'Working with Expressions (1)', titleZh: '表达式的运算 (1)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Algebraic expression"},{id:"0",type:"def",content:"代数表达式"},
    {id:"1",type:"word",content:"Base"},{id:"1",type:"def",content:"底数"},
    {id:"2",type:"word",content:"Binomial"},{id:"2",type:"def",content:"二项式"},
    {id:"3",type:"word",content:"Bracket"},{id:"3",type:"def",content:"括号"},
    {id:"4",type:"word",content:"Calculation"},{id:"4",type:"def",content:"计算"},
    {id:"5",type:"word",content:"Coefficient"},{id:"5",type:"def",content:"系数"},
    {id:"6",type:"word",content:"Common factor"},{id:"6",type:"def",content:"公因数"},
    {id:"7",type:"word",content:"Constant"},{id:"7",type:"def",content:"常数"},
    {id:"8",type:"word",content:"Convert"},{id:"8",type:"def",content:"转换"},
    {id:"9",type:"word",content:"Decimal point"},{id:"9",type:"def",content:"小数点"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-2', category: '25m-y9', title: 'Working with Expressions (2)', titleZh: '表达式的运算 (2)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Difference of squares"},{id:"0",type:"def",content:"平方差"},
    {id:"1",type:"word",content:"Distributive law"},{id:"1",type:"def",content:"分配律"},
    {id:"2",type:"word",content:"Evaluate"},{id:"2",type:"def",content:"求值"},
    {id:"3",type:"word",content:"Expand"},{id:"3",type:"def",content:"展开"},
    {id:"4",type:"word",content:"Exponent"},{id:"4",type:"def",content:"指数"},
    {id:"5",type:"word",content:"Expression"},{id:"5",type:"def",content:"表达式"},
    {id:"6",type:"word",content:"Factor"},{id:"6",type:"def",content:"因数"},
    {id:"7",type:"word",content:"Factorize"},{id:"7",type:"def",content:"因式分解"},
    {id:"8",type:"word",content:"FOIL method"},{id:"8",type:"def",content:"FOIL法则"},
    {id:"9",type:"word",content:"Formula"},{id:"9",type:"def",content:"公式"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-3', category: '25m-y9', title: 'Working with Expressions (3)', titleZh: '表达式的运算 (3)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Highest common factor (HCF)"},{id:"0",type:"def",content:"最大公因数"},
    {id:"1",type:"word",content:"Identity"},{id:"1",type:"def",content:"恒等式"},
    {id:"2",type:"word",content:"Index / Exponent"},{id:"2",type:"def",content:"指数"},
    {id:"3",type:"word",content:"Index / Power"},{id:"3",type:"def",content:"指数"},
    {id:"4",type:"word",content:"Index laws"},{id:"4",type:"def",content:"指数定律"},
    {id:"5",type:"word",content:"Large number"},{id:"5",type:"def",content:"大数"},
    {id:"6",type:"word",content:"Like terms"},{id:"6",type:"def",content:"同类项"},
    {id:"7",type:"word",content:"Linear expression"},{id:"7",type:"def",content:"线性表达式"},
    {id:"8",type:"word",content:"Multiplication formula"},{id:"8",type:"def",content:"乘法公式"},
    {id:"9",type:"word",content:"Negative index"},{id:"9",type:"def",content:"负指数"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-4', category: '25m-y9', title: 'Working with Expressions (4)', titleZh: '表达式的运算 (4)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Order of magnitude"},{id:"0",type:"def",content:"数量级"},
    {id:"1",type:"word",content:"Perfect square"},{id:"1",type:"def",content:"完全平方"},
    {id:"2",type:"word",content:"Power of a power rule"},{id:"2",type:"def",content:"幂的乘方法则"},
    {id:"3",type:"word",content:"Power of ten"},{id:"3",type:"def",content:"10的幂"},
    {id:"4",type:"word",content:"Prime factor decomposition"},{id:"4",type:"def",content:"质因数分解"},
    {id:"5",type:"word",content:"Product"},{id:"5",type:"def",content:"乘积"},
    {id:"6",type:"word",content:"Product rule"},{id:"6",type:"def",content:"乘法法则"},
    {id:"7",type:"word",content:"Quadratic expression"},{id:"7",type:"def",content:"二次表达式"},
    {id:"8",type:"word",content:"Quotient rule"},{id:"8",type:"def",content:"除法法则"},
    {id:"9",type:"word",content:"Reciprocal"},{id:"9",type:"def",content:"倒数"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-5', category: '25m-y9', title: 'Working with Expressions (5)', titleZh: '表达式的运算 (5)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scientific notation"},{id:"0",type:"def",content:"科学记数法"},
    {id:"1",type:"word",content:"Significant figures"},{id:"1",type:"def",content:"有效数字"},
    {id:"2",type:"word",content:"Simplify"},{id:"2",type:"def",content:"简化"},
    {id:"3",type:"word",content:"Small number"},{id:"3",type:"def",content:"小数"},
    {id:"4",type:"word",content:"Square"},{id:"4",type:"def",content:"平方"},
    {id:"5",type:"word",content:"Standard form"},{id:"5",type:"def",content:"科学计数法"},
    {id:"6",type:"word",content:"Substitute"},{id:"6",type:"def",content:"代入"},
    {id:"7",type:"word",content:"Term"},{id:"7",type:"def",content:"项"},
    {id:"8",type:"word",content:"Trinomial"},{id:"8",type:"def",content:"三项式"},
    {id:"9",type:"word",content:"Variable"},{id:"9",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y9-working-with-expressions-6', category: '25m-y9', title: 'Working with Expressions (6)', titleZh: '表达式的运算 (6)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Zero index"},{id:"0",type:"def",content:"零指数"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-1', category: '25m-y9', title: 'Algebraic Functions (1)', titleZh: '代数函数 (1)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"$f(x)$"},{id:"0",type:"def",content:"f(x)"},
    {id:"1",type:"word",content:"Acceleration"},{id:"1",type:"def",content:"加速度"},
    {id:"2",type:"word",content:"Algebraic representation"},{id:"2",type:"def",content:"代数表示"},
    {id:"3",type:"word",content:"Area under graph"},{id:"3",type:"def",content:"图下面积"},
    {id:"4",type:"word",content:"Average speed"},{id:"4",type:"def",content:"平均速度"},
    {id:"5",type:"word",content:"Bisector"},{id:"5",type:"def",content:"平分线"},
    {id:"6",type:"word",content:"Constant"},{id:"6",type:"def",content:"常数"},
    {id:"7",type:"word",content:"Constant of proportionality"},{id:"7",type:"def",content:"比例常数"},
    {id:"8",type:"word",content:"Constant speed"},{id:"8",type:"def",content:"匀速"},
    {id:"9",type:"word",content:"Coordinates"},{id:"9",type:"def",content:"坐标"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-2', category: '25m-y9', title: 'Algebraic Functions (2)', titleZh: '代数函数 (2)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Cross-curricular"},{id:"0",type:"def",content:"跨学科"},
    {id:"1",type:"word",content:"Cubic function"},{id:"1",type:"def",content:"三次函数"},
    {id:"2",type:"word",content:"Currency conversion"},{id:"2",type:"def",content:"货币换算"},
    {id:"3",type:"word",content:"Data"},{id:"3",type:"def",content:"数据"},
    {id:"4",type:"word",content:"Deceleration"},{id:"4",type:"def",content:"减速度"},
    {id:"5",type:"word",content:"Dependent variable"},{id:"5",type:"def",content:"因变量"},
    {id:"6",type:"word",content:"Direct proportion"},{id:"6",type:"def",content:"正比例"},
    {id:"7",type:"word",content:"Displacement"},{id:"7",type:"def",content:"位移"},
    {id:"8",type:"word",content:"Distance formula"},{id:"8",type:"def",content:"距离公式"},
    {id:"9",type:"word",content:"Distance-time graph"},{id:"9",type:"def",content:"距离-时间图"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-3', category: '25m-y9', title: 'Algebraic Functions (3)', titleZh: '代数函数 (3)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Domain"},{id:"0",type:"def",content:"定义域"},
    {id:"1",type:"word",content:"Endpoint"},{id:"1",type:"def",content:"端点"},
    {id:"2",type:"word",content:"Equation"},{id:"2",type:"def",content:"方程"},
    {id:"3",type:"word",content:"Equation of a line"},{id:"3",type:"def",content:"直线方程"},
    {id:"4",type:"word",content:"Function"},{id:"4",type:"def",content:"函数"},
    {id:"5",type:"word",content:"Function notation"},{id:"5",type:"def",content:"函数符号"},
    {id:"6",type:"word",content:"Gradient"},{id:"6",type:"def",content:"斜率"},
    {id:"7",type:"word",content:"Graph"},{id:"7",type:"def",content:"图表"},
    {id:"8",type:"word",content:"Graphical representation"},{id:"8",type:"def",content:"图形表示"},
    {id:"9",type:"word",content:"Independent variable"},{id:"9",type:"def",content:"自变量"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-4', category: '25m-y9', title: 'Algebraic Functions (4)', titleZh: '代数函数 (4)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Input"},{id:"0",type:"def",content:"输入"},
    {id:"1",type:"word",content:"Intercept"},{id:"1",type:"def",content:"截距"},
    {id:"2",type:"word",content:"Intersection"},{id:"2",type:"def",content:"交点"},
    {id:"3",type:"word",content:"Inverse proportion"},{id:"3",type:"def",content:"反比例"},
    {id:"4",type:"word",content:"Inversely proportional to"},{id:"4",type:"def",content:"与...成反比"},
    {id:"5",type:"word",content:"Kinematics"},{id:"5",type:"def",content:"运动学"},
    {id:"6",type:"word",content:"Line segment"},{id:"6",type:"def",content:"线段"},
    {id:"7",type:"word",content:"Linear graph"},{id:"7",type:"def",content:"线性图像"},
    {id:"8",type:"word",content:"Mapping"},{id:"8",type:"def",content:"映射"},
    {id:"9",type:"word",content:"Midpoint"},{id:"9",type:"def",content:"中点"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-5', category: '25m-y9', title: 'Algebraic Functions (5)', titleZh: '代数函数 (5)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Negative reciprocal"},{id:"0",type:"def",content:"负倒数"},
    {id:"1",type:"word",content:"Numerical representation"},{id:"1",type:"def",content:"数值表示"},
    {id:"2",type:"word",content:"Origin"},{id:"2",type:"def",content:"原点"},
    {id:"3",type:"word",content:"Output"},{id:"3",type:"def",content:"输出"},
    {id:"4",type:"word",content:"Parallel lines"},{id:"4",type:"def",content:"平行线"},
    {id:"5",type:"word",content:"Perpendicular lines"},{id:"5",type:"def",content:"垂直线"},
    {id:"6",type:"word",content:"Plot"},{id:"6",type:"def",content:"描点"},
    {id:"7",type:"word",content:"Product"},{id:"7",type:"def",content:"乘积"},
    {id:"8",type:"word",content:"Proportional to"},{id:"8",type:"def",content:"与...成比例"},
    {id:"9",type:"word",content:"Quadratic function"},{id:"9",type:"def",content:"二次函数"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-6', category: '25m-y9', title: 'Algebraic Functions (6)', titleZh: '代数函数 (6)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"值域"},
    {id:"1",type:"word",content:"Rate of change"},{id:"1",type:"def",content:"变化率"},
    {id:"2",type:"word",content:"Ratio"},{id:"2",type:"def",content:"比率"},
    {id:"3",type:"word",content:"Real-life application"},{id:"3",type:"def",content:"实际应用"},
    {id:"4",type:"word",content:"Reciprocal function"},{id:"4",type:"def",content:"倒数函数"},
    {id:"5",type:"word",content:"Relationship"},{id:"5",type:"def",content:"关系"},
    {id:"6",type:"word",content:"Slope"},{id:"6",type:"def",content:"坡度"},
    {id:"7",type:"word",content:"Speed"},{id:"7",type:"def",content:"速度"},
    {id:"8",type:"word",content:"Speed-time graph"},{id:"8",type:"def",content:"速度-时间图"},
    {id:"9",type:"word",content:"Stationary"},{id:"9",type:"def",content:"静止"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-functions-7', category: '25m-y9', title: 'Algebraic Functions (7)', titleZh: '代数函数 (7)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Uniform motion"},{id:"0",type:"def",content:"匀速运动"},
    {id:"1",type:"word",content:"Variable"},{id:"1",type:"def",content:"变量"},
    {id:"2",type:"word",content:"Velocity"},{id:"2",type:"def",content:"速率/速度"},
    {id:"3",type:"word",content:"X-intercept"},{id:"3",type:"def",content:"X轴截距"},
    {id:"4",type:"word",content:"Y-intercept"},{id:"4",type:"def",content:"Y轴截距"}
  ]
},

{
  board: '25m', slug: '25m-y9-mastery-of-angles-1', category: '25m-y9', title: 'Mastery of Angles (1)', titleZh: '掌握角度 (1)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Acute angle"},{id:"0",type:"def",content:"锐角"},
    {id:"1",type:"word",content:"Alternate interior angles"},{id:"1",type:"def",content:"内错角"},
    {id:"2",type:"word",content:"Angle"},{id:"2",type:"def",content:"角度"},
    {id:"3",type:"word",content:"Around a point"},{id:"3",type:"def",content:"绕一点"},
    {id:"4",type:"word",content:"Auxiliary line"},{id:"4",type:"def",content:"辅助线"},
    {id:"5",type:"word",content:"Corresponding angles"},{id:"5",type:"def",content:"同位角"},
    {id:"6",type:"word",content:"Decagon"},{id:"6",type:"def",content:"十边形"},
    {id:"7",type:"word",content:"Equilateral triangle"},{id:"7",type:"def",content:"等边三角形"},
    {id:"8",type:"word",content:"Exterior angle"},{id:"8",type:"def",content:"外角"},
    {id:"9",type:"word",content:"Formula"},{id:"9",type:"def",content:"公式"}
  ]
},

{
  board: '25m', slug: '25m-y9-mastery-of-angles-2', category: '25m-y9', title: 'Mastery of Angles (2)', titleZh: '掌握角度 (2)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Heptagon"},{id:"0",type:"def",content:"七边形"},
    {id:"1",type:"word",content:"Hexagon"},{id:"1",type:"def",content:"六边形"},
    {id:"2",type:"word",content:"Interior angle"},{id:"2",type:"def",content:"内角"},
    {id:"3",type:"word",content:"Interior angles"},{id:"3",type:"def",content:"内角"},
    {id:"4",type:"word",content:"Irregular polygon"},{id:"4",type:"def",content:"不规则多边形"},
    {id:"5",type:"word",content:"Isosceles triangle"},{id:"5",type:"def",content:"等腰三角形"},
    {id:"6",type:"word",content:"Nonagon"},{id:"6",type:"def",content:"九边形"},
    {id:"7",type:"word",content:"Number of sides"},{id:"7",type:"def",content:"边数"},
    {id:"8",type:"word",content:"Obtuse angle"},{id:"8",type:"def",content:"钝角"},
    {id:"9",type:"word",content:"Octagon"},{id:"9",type:"def",content:"八边形"}
  ]
},

{
  board: '25m', slug: '25m-y9-mastery-of-angles-3', category: '25m-y9', title: 'Mastery of Angles (3)', titleZh: '掌握角度 (3)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Opposite interior angles"},{id:"0",type:"def",content:"相对内角"},
    {id:"1",type:"word",content:"Parallel lines"},{id:"1",type:"def",content:"平行线"},
    {id:"2",type:"word",content:"Pentagon"},{id:"2",type:"def",content:"五边形"},
    {id:"3",type:"word",content:"Polygon"},{id:"3",type:"def",content:"多边形"},
    {id:"4",type:"word",content:"Proof"},{id:"4",type:"def",content:"证明"},
    {id:"5",type:"word",content:"Quadrilateral"},{id:"5",type:"def",content:"四边形"},
    {id:"6",type:"word",content:"Reason"},{id:"6",type:"def",content:"理由"},
    {id:"7",type:"word",content:"Reflex angle"},{id:"7",type:"def",content:"优角"},
    {id:"8",type:"word",content:"Regular polygon"},{id:"8",type:"def",content:"正多边形"},
    {id:"9",type:"word",content:"Right-angled triangle"},{id:"9",type:"def",content:"直角三角形"}
  ]
},

{
  board: '25m', slug: '25m-y9-mastery-of-angles-4', category: '25m-y9', title: 'Mastery of Angles (4)', titleZh: '掌握角度 (4)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scalene triangle"},{id:"0",type:"def",content:"不等边三角形"},
    {id:"1",type:"word",content:"Statement"},{id:"1",type:"def",content:"陈述"},
    {id:"2",type:"word",content:"Straight line"},{id:"2",type:"def",content:"直线"},
    {id:"3",type:"word",content:"Sum"},{id:"3",type:"def",content:"和"},
    {id:"4",type:"word",content:"Sum of angles"},{id:"4",type:"def",content:"角度和"},
    {id:"5",type:"word",content:"Sum of exterior angles"},{id:"5",type:"def",content:"外角和"},
    {id:"6",type:"word",content:"Sum of interior angles"},{id:"6",type:"def",content:"内角和"},
    {id:"7",type:"word",content:"Theorem"},{id:"7",type:"def",content:"定理"},
    {id:"8",type:"word",content:"Transversal"},{id:"8",type:"def",content:"截线"},
    {id:"9",type:"word",content:"Triangle"},{id:"9",type:"def",content:"三角形"}
  ]
},

{
  board: '25m', slug: '25m-y9-mastery-of-angles-5', category: '25m-y9', title: 'Mastery of Angles (5)', titleZh: '掌握角度 (5)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Vertex"},{id:"0",type:"def",content:"顶点"},
    {id:"1",type:"word",content:"Vertically opposite angles"},{id:"1",type:"def",content:"对顶角"}
  ]
},

{
  board: '25m', slug: '25m-y9-pythagoras-theorem-1', category: '25m-y9', title: 'Pythagoras Theorem (1)', titleZh: '勾股定理 (1)', unitNum: 5, unitTitle: 'Pythagoras Theorem', unitTitleZh: '勾股定理',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Area"},{id:"0",type:"def",content:"面积"},
    {id:"1",type:"word",content:"Converse proposition"},{id:"1",type:"def",content:"逆命题"},
    {id:"2",type:"word",content:"Converse theorem"},{id:"2",type:"def",content:"逆定理"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"方程"},
    {id:"4",type:"word",content:"Hypotenuse"},{id:"4",type:"def",content:"斜边"},
    {id:"5",type:"word",content:"Legs (of a right triangle)"},{id:"5",type:"def",content:"直角边"},
    {id:"6",type:"word",content:"Perimeter"},{id:"6",type:"def",content:"周长"},
    {id:"7",type:"word",content:"Proof"},{id:"7",type:"def",content:"证明"},
    {id:"8",type:"word",content:"Pythagoras\' Theorem"},{id:"8",type:"def",content:"勾股定理"},
    {id:"9",type:"word",content:"Pythagorean triple"},{id:"9",type:"def",content:"勾股数"}
  ]
},

{
  board: '25m', slug: '25m-y9-pythagoras-theorem-2', category: '25m-y9', title: 'Pythagoras Theorem (2)', titleZh: '勾股定理 (2)', unitNum: 5, unitTitle: 'Pythagoras Theorem', unitTitleZh: '勾股定理',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Right-angled triangle"},{id:"0",type:"def",content:"直角三角形"},
    {id:"1",type:"word",content:"Solve"},{id:"1",type:"def",content:"求解"},
    {id:"2",type:"word",content:"Square"},{id:"2",type:"def",content:"平方"},
    {id:"3",type:"word",content:"Square root"},{id:"3",type:"def",content:"平方根"},
    {id:"4",type:"word",content:"Two-dimensional"},{id:"4",type:"def",content:"二维"}
  ]
},

{
  board: '25m', slug: '25m-y9-2d-shape-1', category: '25m-y9', title: '2D Shape (1)', titleZh: '二维图形 (1)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle"},{id:"0",type:"def",content:"角"},
    {id:"1",type:"word",content:"Area"},{id:"1",type:"def",content:"面积"},
    {id:"2",type:"word",content:"Compound Shape"},{id:"2",type:"def",content:"复合图形"},
    {id:"3",type:"word",content:"Congruent"},{id:"3",type:"def",content:"全等"},
    {id:"4",type:"word",content:"Diagonal"},{id:"4",type:"def",content:"对角线"},
    {id:"5",type:"word",content:"Formula"},{id:"5",type:"def",content:"公式"},
    {id:"6",type:"word",content:"Gap"},{id:"6",type:"def",content:"间隙"},
    {id:"7",type:"word",content:"Geometric Pattern"},{id:"7",type:"def",content:"几何图案"},
    {id:"8",type:"word",content:"Interior Angle"},{id:"8",type:"def",content:"内角"},
    {id:"9",type:"word",content:"Irregular Polygon"},{id:"9",type:"def",content:"不规则多边形"}
  ]
},

{
  board: '25m', slug: '25m-y9-2d-shape-2', category: '25m-y9', title: '2D Shape (2)', titleZh: '二维图形 (2)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Kite"},{id:"0",type:"def",content:"风筝形"},
    {id:"1",type:"word",content:"Line of Symmetry"},{id:"1",type:"def",content:"对称轴"},
    {id:"2",type:"word",content:"Median Line"},{id:"2",type:"def",content:"中位线"},
    {id:"3",type:"word",content:"Minimal Distance"},{id:"3",type:"def",content:"最短距离"},
    {id:"4",type:"word",content:"Order of Rotational Symmetry"},{id:"4",type:"def",content:"旋转对称阶数"},
    {id:"5",type:"word",content:"Overlap"},{id:"5",type:"def",content:"重叠"},
    {id:"6",type:"word",content:"Parallel"},{id:"6",type:"def",content:"平行"},
    {id:"7",type:"word",content:"Parallel Lines"},{id:"7",type:"def",content:"平行线"},
    {id:"8",type:"word",content:"Parallelogram"},{id:"8",type:"def",content:"平行四边形"},
    {id:"9",type:"word",content:"Pattern"},{id:"9",type:"def",content:"图案"}
  ]
},

{
  board: '25m', slug: '25m-y9-2d-shape-3', category: '25m-y9', title: '2D Shape (3)', titleZh: '二维图形 (3)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Perimeter"},{id:"0",type:"def",content:"周长"},
    {id:"1",type:"word",content:"Perpendicular"},{id:"1",type:"def",content:"垂直"},
    {id:"2",type:"word",content:"Perpendicular Bisector"},{id:"2",type:"def",content:"垂直平分线"},
    {id:"3",type:"word",content:"Property"},{id:"3",type:"def",content:"性质"},
    {id:"4",type:"word",content:"Quadrilateral"},{id:"4",type:"def",content:"四边形"},
    {id:"5",type:"word",content:"Rectangle"},{id:"5",type:"def",content:"长方形"},
    {id:"6",type:"word",content:"Reflection"},{id:"6",type:"def",content:"反射/翻转"},
    {id:"7",type:"word",content:"Regular Polygon"},{id:"7",type:"def",content:"正多边形"},
    {id:"8",type:"word",content:"Repeating Pattern"},{id:"8",type:"def",content:"重复图案"},
    {id:"9",type:"word",content:"Rhombus"},{id:"9",type:"def",content:"菱形"}
  ]
},

{
  board: '25m', slug: '25m-y9-2d-shape-4', category: '25m-y9', title: '2D Shape (4)', titleZh: '二维图形 (4)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Rotation"},{id:"0",type:"def",content:"旋转"},
    {id:"1",type:"word",content:"Rotational Symmetry"},{id:"1",type:"def",content:"旋转对称"},
    {id:"2",type:"word",content:"Side"},{id:"2",type:"def",content:"边"},
    {id:"3",type:"word",content:"Similar"},{id:"3",type:"def",content:"相似"},
    {id:"4",type:"word",content:"Square"},{id:"4",type:"def",content:"正方形"},
    {id:"5",type:"word",content:"Symmetry"},{id:"5",type:"def",content:"对称"},
    {id:"6",type:"word",content:"Tessellation"},{id:"6",type:"def",content:"镶嵌"},
    {id:"7",type:"word",content:"Tiling"},{id:"7",type:"def",content:"铺设"},
    {id:"8",type:"word",content:"Transformation"},{id:"8",type:"def",content:"变换"},
    {id:"9",type:"word",content:"Translation"},{id:"9",type:"def",content:"平移"}
  ]
},

{
  board: '25m', slug: '25m-y9-2d-shape-5', category: '25m-y9', title: '2D Shape (5)', titleZh: '二维图形 (5)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Trapezium"},{id:"0",type:"def",content:"梯形"},
    {id:"1",type:"word",content:"Vertex"},{id:"1",type:"def",content:"顶点"}
  ]
},

{
  board: '25m', slug: '25m-y9-percentages-1', category: '25m-y9', title: 'Percentages (1)', titleZh: '百分比 (1)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Compound interest"},{id:"0",type:"def",content:"复利"},
    {id:"1",type:"word",content:"Convert"},{id:"1",type:"def",content:"转换"},
    {id:"2",type:"word",content:"Credit card"},{id:"2",type:"def",content:"信用卡"},
    {id:"3",type:"word",content:"Data analysis"},{id:"3",type:"def",content:"数据分析"},
    {id:"4",type:"word",content:"Decimal"},{id:"4",type:"def",content:"小数"},
    {id:"5",type:"word",content:"Decrease"},{id:"5",type:"def",content:"减少"},
    {id:"6",type:"word",content:"Denominator"},{id:"6",type:"def",content:"分母"},
    {id:"7",type:"word",content:"Discount"},{id:"7",type:"def",content:"折扣"},
    {id:"8",type:"word",content:"Equivalent"},{id:"8",type:"def",content:"等价的"},
    {id:"9",type:"word",content:"Exponential decay"},{id:"9",type:"def",content:"指数衰减"}
  ]
},

{
  board: '25m', slug: '25m-y9-percentages-2', category: '25m-y9', title: 'Percentages (2)', titleZh: '百分比 (2)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Exponential growth"},{id:"0",type:"def",content:"指数增长"},
    {id:"1",type:"word",content:"Fraction"},{id:"1",type:"def",content:"分数"},
    {id:"2",type:"word",content:"Increase"},{id:"2",type:"def",content:"增加"},
    {id:"3",type:"word",content:"Interest rate"},{id:"3",type:"def",content:"利率"},
    {id:"4",type:"word",content:"Loan"},{id:"4",type:"def",content:"贷款"},
    {id:"5",type:"word",content:"Loss"},{id:"5",type:"def",content:"亏损"},
    {id:"6",type:"word",content:"Mortgage"},{id:"6",type:"def",content:"抵押贷款"},
    {id:"7",type:"word",content:"Numerator"},{id:"7",type:"def",content:"分子"},
    {id:"8",type:"word",content:"Original amount"},{id:"8",type:"def",content:"原始数量"},
    {id:"9",type:"word",content:"Percentage"},{id:"9",type:"def",content:"百分比"}
  ]
},

{
  board: '25m', slug: '25m-y9-percentages-3', category: '25m-y9', title: 'Percentages (3)', titleZh: '百分比 (3)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Principal"},{id:"0",type:"def",content:"本金"},
    {id:"1",type:"word",content:"Profit"},{id:"1",type:"def",content:"利润"},
    {id:"2",type:"word",content:"Proportion"},{id:"2",type:"def",content:"比例"},
    {id:"3",type:"word",content:"Quantity"},{id:"3",type:"def",content:"数量"},
    {id:"4",type:"word",content:"Reverse percentage"},{id:"4",type:"def",content:"反向百分比"},
    {id:"5",type:"word",content:"Savings"},{id:"5",type:"def",content:"储蓄"},
    {id:"6",type:"word",content:"Simple interest"},{id:"6",type:"def",content:"单利"},
    {id:"7",type:"word",content:"Tax"},{id:"7",type:"def",content:"税"},
    {id:"8",type:"word",content:"Time period"},{id:"8",type:"def",content:"时间周期"}
  ]
},

{
  board: '25m', slug: '25m-y9-statistical-sampling-1', category: '25m-y9', title: 'Statistical Sampling (1)', titleZh: '统计抽样 (1)', unitNum: 8, unitTitle: 'Statistical Sampling', unitTitleZh: '统计抽样',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Bias"},{id:"0",type:"def",content:"偏差/偏倚"},
    {id:"1",type:"word",content:"Census"},{id:"1",type:"def",content:"普查"},
    {id:"2",type:"word",content:"Continuous Data"},{id:"2",type:"def",content:"连续数据"},
    {id:"3",type:"word",content:"Data Set"},{id:"3",type:"def",content:"数据集"},
    {id:"4",type:"word",content:"Discrete Data"},{id:"4",type:"def",content:"离散数据"},
    {id:"5",type:"word",content:"Mean"},{id:"5",type:"def",content:"平均数"},
    {id:"6",type:"word",content:"Median"},{id:"6",type:"def",content:"中位数"},
    {id:"7",type:"word",content:"Mode"},{id:"7",type:"def",content:"众数"},
    {id:"8",type:"word",content:"Population"},{id:"8",type:"def",content:"总体"},
    {id:"9",type:"word",content:"Random Sampling"},{id:"9",type:"def",content:"随机抽样"}
  ]
},

{
  board: '25m', slug: '25m-y9-statistical-sampling-2', category: '25m-y9', title: 'Statistical Sampling (2)', titleZh: '统计抽样 (2)', unitNum: 8, unitTitle: 'Statistical Sampling', unitTitleZh: '统计抽样',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"极差"},
    {id:"1",type:"word",content:"Representative Sample"},{id:"1",type:"def",content:"代表性样本"},
    {id:"2",type:"word",content:"Sample"},{id:"2",type:"def",content:"样本"},
    {id:"3",type:"word",content:"Sampling"},{id:"3",type:"def",content:"抽样"},
    {id:"4",type:"word",content:"Survey"},{id:"4",type:"def",content:"调查"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-1', category: '25m-y9', title: 'Graphical Representation of Statistical Data (1)', titleZh: '统计数据的图形表示 (1)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Area (of bar)"},{id:"0",type:"def",content:"面积 (条形)"},
    {id:"1",type:"word",content:"Bar chart"},{id:"1",type:"def",content:"条形图"},
    {id:"2",type:"word",content:"Bivariate data"},{id:"2",type:"def",content:"二元数据"},
    {id:"3",type:"word",content:"Causation"},{id:"3",type:"def",content:"因果关系"},
    {id:"4",type:"word",content:"Class interval"},{id:"4",type:"def",content:"组距"},
    {id:"5",type:"word",content:"Class width"},{id:"5",type:"def",content:"组宽"},
    {id:"6",type:"word",content:"Continuous data"},{id:"6",type:"def",content:"连续数据"},
    {id:"7",type:"word",content:"Correlation"},{id:"7",type:"def",content:"相关性"},
    {id:"8",type:"word",content:"Cumulative frequency"},{id:"8",type:"def",content:"累积频率"},
    {id:"9",type:"word",content:"Cumulative frequency graph"},{id:"9",type:"def",content:"累积频率图"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-2', category: '25m-y9', title: 'Graphical Representation of Statistical Data (2)', titleZh: '统计数据的图形表示 (2)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Data"},{id:"0",type:"def",content:"数据"},
    {id:"1",type:"word",content:"Data dispersion"},{id:"1",type:"def",content:"数据离散度"},
    {id:"2",type:"word",content:"Dependent variable"},{id:"2",type:"def",content:"因变量"},
    {id:"3",type:"word",content:"Distribution"},{id:"3",type:"def",content:"分布"},
    {id:"4",type:"word",content:"Equal intervals"},{id:"4",type:"def",content:"等距间隔"},
    {id:"5",type:"word",content:"Estimate"},{id:"5",type:"def",content:"估计"},
    {id:"6",type:"word",content:"Estimated mean"},{id:"6",type:"def",content:"估计平均数"},
    {id:"7",type:"word",content:"Extrapolation"},{id:"7",type:"def",content:"外推"},
    {id:"8",type:"word",content:"Frequency"},{id:"8",type:"def",content:"频率"},
    {id:"9",type:"word",content:"Frequency density"},{id:"9",type:"def",content:"频率密度"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-3', category: '25m-y9', title: 'Graphical Representation of Statistical Data (3)', titleZh: '统计数据的图形表示 (3)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Frequency table"},{id:"0",type:"def",content:"频率表"},
    {id:"1",type:"word",content:"Group frequency table"},{id:"1",type:"def",content:"分组频率表"},
    {id:"2",type:"word",content:"Grouped data"},{id:"2",type:"def",content:"分组数据"},
    {id:"3",type:"word",content:"Histogram"},{id:"3",type:"def",content:"直方图"},
    {id:"4",type:"word",content:"Independent variable"},{id:"4",type:"def",content:"自变量"},
    {id:"5",type:"word",content:"Inference"},{id:"5",type:"def",content:"推论"},
    {id:"6",type:"word",content:"Interpolation"},{id:"6",type:"def",content:"内插"},
    {id:"7",type:"word",content:"Interpretation"},{id:"7",type:"def",content:"解释"},
    {id:"8",type:"word",content:"Interquartile range (IQR)"},{id:"8",type:"def",content:"四分位距 (IQR)"},
    {id:"9",type:"word",content:"Line of best fit"},{id:"9",type:"def",content:"最佳拟合线"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-4', category: '25m-y9', title: 'Graphical Representation of Statistical Data (4)', titleZh: '统计数据的图形表示 (4)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Lower quartile (Q1)"},{id:"0",type:"def",content:"下四分位数 (Q1)"},
    {id:"1",type:"word",content:"Mean"},{id:"1",type:"def",content:"平均数"},
    {id:"2",type:"word",content:"Median"},{id:"2",type:"def",content:"中位数"},
    {id:"3",type:"word",content:"Median (from graph)"},{id:"3",type:"def",content:"中位数 (从图中)"},
    {id:"4",type:"word",content:"Mid-point"},{id:"4",type:"def",content:"中点值"},
    {id:"5",type:"word",content:"Modal class"},{id:"5",type:"def",content:"众数类"},
    {id:"6",type:"word",content:"Mode"},{id:"6",type:"def",content:"众数"},
    {id:"7",type:"word",content:"Negative correlation"},{id:"7",type:"def",content:"负相关"},
    {id:"8",type:"word",content:"No correlation"},{id:"8",type:"def",content:"无相关"},
    {id:"9",type:"word",content:"Outlier"},{id:"9",type:"def",content:"离群点"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-5', category: '25m-y9', title: 'Graphical Representation of Statistical Data (5)', titleZh: '统计数据的图形表示 (5)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Pictogram"},{id:"0",type:"def",content:"象形图"},
    {id:"1",type:"word",content:"Pie chart"},{id:"1",type:"def",content:"饼图"},
    {id:"2",type:"word",content:"Positive correlation"},{id:"2",type:"def",content:"正相关"},
    {id:"3",type:"word",content:"Quartile"},{id:"3",type:"def",content:"四分位数"},
    {id:"4",type:"word",content:"Range"},{id:"4",type:"def",content:"极差"},
    {id:"5",type:"word",content:"Scatter graph"},{id:"5",type:"def",content:"散点图"},
    {id:"6",type:"word",content:"Skewness"},{id:"6",type:"def",content:"偏度"},
    {id:"7",type:"word",content:"Statistical data"},{id:"7",type:"def",content:"统计数据"},
    {id:"8",type:"word",content:"Stem-and-leaf diagram"},{id:"8",type:"def",content:"茎叶图"},
    {id:"9",type:"word",content:"Trend"},{id:"9",type:"def",content:"趋势"}
  ]
},

{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-6', category: '25m-y9', title: 'Graphical Representation of Statistical Data (6)', titleZh: '统计数据的图形表示 (6)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Unequal intervals"},{id:"0",type:"def",content:"不等距间隔"},
    {id:"1",type:"word",content:"Upper quartile (Q3)"},{id:"1",type:"def",content:"上四分位数 (Q3)"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-fractions-1', category: '25m-y9', title: 'Algebraic Fractions (1)', titleZh: '代数分数 (1)', unitNum: 10, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Algebraic Fraction"},{id:"0",type:"def",content:"代数分数"},
    {id:"1",type:"word",content:"Common Factor"},{id:"1",type:"def",content:"公因数"},
    {id:"2",type:"word",content:"Denominator"},{id:"2",type:"def",content:"分母"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"方程"},
    {id:"4",type:"word",content:"Expression"},{id:"4",type:"def",content:"表达式"},
    {id:"5",type:"word",content:"Factorise"},{id:"5",type:"def",content:"因式分解"},
    {id:"6",type:"word",content:"Formula"},{id:"6",type:"def",content:"公式"},
    {id:"7",type:"word",content:"Linear Equation"},{id:"7",type:"def",content:"线性方程"},
    {id:"8",type:"word",content:"Numerator"},{id:"8",type:"def",content:"分子"},
    {id:"9",type:"word",content:"Quadratic Expression"},{id:"9",type:"def",content:"二次表达式"}
  ]
},

{
  board: '25m', slug: '25m-y9-algebraic-fractions-2', category: '25m-y9', title: 'Algebraic Fractions (2)', titleZh: '代数分数 (2)', unitNum: 10, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Rational Expression"},{id:"0",type:"def",content:"有理表达式"},
    {id:"1",type:"word",content:"Rearrange"},{id:"1",type:"def",content:"重排"},
    {id:"2",type:"word",content:"Simplify"},{id:"2",type:"def",content:"简化"},
    {id:"3",type:"word",content:"Subject"},{id:"3",type:"def",content:"主项"},
    {id:"4",type:"word",content:"Variable"},{id:"4",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y9-practice-with-constructions-1', category: '25m-y9', title: 'Practice with Constructions (1)', titleZh: '构造练习 (1)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle"},{id:"0",type:"def",content:"角"},
    {id:"1",type:"word",content:"Angle bisector"},{id:"1",type:"def",content:"角平分线"},
    {id:"2",type:"word",content:"ASA (Angle-Side-Angle)"},{id:"2",type:"def",content:"角边角"},
    {id:"3",type:"word",content:"Bisector"},{id:"3",type:"def",content:"平分线"},
    {id:"4",type:"word",content:"Centroid"},{id:"4",type:"def",content:"重心"},
    {id:"5",type:"word",content:"Circumcenter"},{id:"5",type:"def",content:"外心"},
    {id:"6",type:"word",content:"Circumscribed circle"},{id:"6",type:"def",content:"外接圆"},
    {id:"7",type:"word",content:"Compass"},{id:"7",type:"def",content:"圆规"},
    {id:"8",type:"word",content:"Construction"},{id:"8",type:"def",content:"构造"},
    {id:"9",type:"word",content:"Equidistant"},{id:"9",type:"def",content:"等距的"}
  ]
},

{
  board: '25m', slug: '25m-y9-practice-with-constructions-2', category: '25m-y9', title: 'Practice with Constructions (2)', titleZh: '构造练习 (2)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Equilateral triangle"},{id:"0",type:"def",content:"等边三角形"},
    {id:"1",type:"word",content:"Inscribed circle"},{id:"1",type:"def",content:"内切圆"},
    {id:"2",type:"word",content:"Intersection"},{id:"2",type:"def",content:"交点"},
    {id:"3",type:"word",content:"Isosceles triangle"},{id:"3",type:"def",content:"等腰三角形"},
    {id:"4",type:"word",content:"Line"},{id:"4",type:"def",content:"线"},
    {id:"5",type:"word",content:"Line segment"},{id:"5",type:"def",content:"线段"},
    {id:"6",type:"word",content:"Locus"},{id:"6",type:"def",content:"轨迹"},
    {id:"7",type:"word",content:"Median"},{id:"7",type:"def",content:"中线"},
    {id:"8",type:"word",content:"Perpendicular"},{id:"8",type:"def",content:"垂直的"},
    {id:"9",type:"word",content:"Perpendicular bisector"},{id:"9",type:"def",content:"垂直平分线"}
  ]
},

{
  board: '25m', slug: '25m-y9-practice-with-constructions-3', category: '25m-y9', title: 'Practice with Constructions (3)', titleZh: '构造练习 (3)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Point"},{id:"0",type:"def",content:"点"},
    {id:"1",type:"word",content:"Quadrilateral"},{id:"1",type:"def",content:"四边形"},
    {id:"2",type:"word",content:"Rhombus"},{id:"2",type:"def",content:"菱形"},
    {id:"3",type:"word",content:"RHS (Right-angle-Hypotenuse-Side)"},{id:"3",type:"def",content:"直角斜边边"},
    {id:"4",type:"word",content:"Right angle"},{id:"4",type:"def",content:"直角"},
    {id:"5",type:"word",content:"SAS (Side-Angle-Side)"},{id:"5",type:"def",content:"边角边"},
    {id:"6",type:"word",content:"Square"},{id:"6",type:"def",content:"正方形"},
    {id:"7",type:"word",content:"SSS (Side-Side-Side)"},{id:"7",type:"def",content:"边边边"},
    {id:"8",type:"word",content:"Straightedge"},{id:"8",type:"def",content:"直尺"}
  ]
},

{
  board: '25m', slug: '25m-y9-congruence-and-similarity-1', category: '25m-y9', title: 'Congruence and Similarity (1)', titleZh: '全等和相似 (1)', unitNum: 12, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle-Side-Angle (ASA)"},{id:"0",type:"def",content:"角-边-角 (ASA)"},
    {id:"1",type:"word",content:"Congruence"},{id:"1",type:"def",content:"全等"},
    {id:"2",type:"word",content:"Corresponding angles"},{id:"2",type:"def",content:"对应角"},
    {id:"3",type:"word",content:"Corresponding sides"},{id:"3",type:"def",content:"对应边"},
    {id:"4",type:"word",content:"Enlargement"},{id:"4",type:"def",content:"放大"},
    {id:"5",type:"word",content:"Hypotenuse"},{id:"5",type:"def",content:"斜边"},
    {id:"6",type:"word",content:"Proof"},{id:"6",type:"def",content:"证明"},
    {id:"7",type:"word",content:"Ratio"},{id:"7",type:"def",content:"比例"},
    {id:"8",type:"word",content:"Right-angle-Hypotenuse-Side (RHS)"},{id:"8",type:"def",content:"直角-斜边-边 (RHS)"},
    {id:"9",type:"word",content:"Scale factor"},{id:"9",type:"def",content:"比例因子"}
  ]
},

{
  board: '25m', slug: '25m-y9-congruence-and-similarity-2', category: '25m-y9', title: 'Congruence and Similarity (2)', titleZh: '全等和相似 (2)', unitNum: 12, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Side-Angle-Side (SAS)"},{id:"0",type:"def",content:"边-角-边 (SAS)"},
    {id:"1",type:"word",content:"Side-Side-Side (SSS)"},{id:"1",type:"def",content:"边-边-边 (SSS)"},
    {id:"2",type:"word",content:"Similarity"},{id:"2",type:"def",content:"相似"},
    {id:"3",type:"word",content:"Triangle"},{id:"3",type:"def",content:"三角形"}
  ]
},


/* ═══ Year 10 (36 levels, 327 words) ═══ */

{
  board: '25m', slug: '25m-y10-real-numbers-1', category: '25m-y10', title: 'Real Numbers (1)', titleZh: '实数 (1)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Approximate"},{id:"0",type:"def",content:"近似"},
    {id:"1",type:"word",content:"Conjugate Surds"},{id:"1",type:"def",content:"共轭根式"},
    {id:"2",type:"word",content:"Cube Root"},{id:"2",type:"def",content:"立方根"},
    {id:"3",type:"word",content:"Decimal"},{id:"3",type:"def",content:"小数"},
    {id:"4",type:"word",content:"Denominator"},{id:"4",type:"def",content:"分母"},
    {id:"5",type:"word",content:"Difference of Squares"},{id:"5",type:"def",content:"平方差"},
    {id:"6",type:"word",content:"Estimate"},{id:"6",type:"def",content:"估算"},
    {id:"7",type:"word",content:"Expand Brackets"},{id:"7",type:"def",content:"展开括号"},
    {id:"8",type:"word",content:"Fraction"},{id:"8",type:"def",content:"分数"},
    {id:"9",type:"word",content:"Index"},{id:"9",type:"def",content:"根指数"}
  ]
},

{
  board: '25m', slug: '25m-y10-real-numbers-2', category: '25m-y10', title: 'Real Numbers (2)', titleZh: '实数 (2)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Integer"},{id:"0",type:"def",content:"整数"},
    {id:"1",type:"word",content:"Irrational Numbers"},{id:"1",type:"def",content:"无理数"},
    {id:"2",type:"word",content:"Like Surds"},{id:"2",type:"def",content:"同类根式"},
    {id:"3",type:"word",content:"Natural Numbers"},{id:"3",type:"def",content:"自然数"},
    {id:"4",type:"word",content:"Non-terminating, Non-recurring Decimal"},{id:"4",type:"def",content:"无限不循环小数"},
    {id:"5",type:"word",content:"Numerator"},{id:"5",type:"def",content:"分子"},
    {id:"6",type:"word",content:"Quadratic Surd"},{id:"6",type:"def",content:"二次根式"},
    {id:"7",type:"word",content:"Radical"},{id:"7",type:"def",content:"根式"},
    {id:"8",type:"word",content:"Radicand"},{id:"8",type:"def",content:"被开方数"},
    {id:"9",type:"word",content:"Rational Numbers"},{id:"9",type:"def",content:"有理数"}
  ]
},

{
  board: '25m', slug: '25m-y10-real-numbers-3', category: '25m-y10', title: 'Real Numbers (3)', titleZh: '实数 (3)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Rationalize the Denominator"},{id:"0",type:"def",content:"有理化分母"},
    {id:"1",type:"word",content:"Real Numbers"},{id:"1",type:"def",content:"实数"},
    {id:"2",type:"word",content:"Recurring Decimal"},{id:"2",type:"def",content:"循环小数"},
    {id:"3",type:"word",content:"Simplest Form"},{id:"3",type:"def",content:"最简形式"},
    {id:"4",type:"word",content:"Square Root"},{id:"4",type:"def",content:"平方根"},
    {id:"5",type:"word",content:"Surd"},{id:"5",type:"def",content:"根式"},
    {id:"6",type:"word",content:"Terminating Decimal"},{id:"6",type:"def",content:"有限小数"},
    {id:"7",type:"word",content:"Unlike Surds"},{id:"7",type:"def",content:"非同类根式"},
    {id:"8",type:"word",content:"Whole Numbers"},{id:"8",type:"def",content:"非负整数"}
  ]
},

{
  board: '25m', slug: '25m-y10-algebraic-fractions-1', category: '25m-y10', title: 'Algebraic Fractions (1)', titleZh: '代数分数 (1)', unitNum: 2, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Algebraic Fraction"},{id:"0",type:"def",content:"代数分数"},
    {id:"1",type:"word",content:"Common Denominator"},{id:"1",type:"def",content:"公分母"},
    {id:"2",type:"word",content:"Denominator"},{id:"2",type:"def",content:"分母"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"方程"},
    {id:"4",type:"word",content:"Expression"},{id:"4",type:"def",content:"表达式"},
    {id:"5",type:"word",content:"Factorise"},{id:"5",type:"def",content:"因式分解"},
    {id:"6",type:"word",content:"Formula"},{id:"6",type:"def",content:"公式"},
    {id:"7",type:"word",content:"Linear Equation"},{id:"7",type:"def",content:"线性方程"},
    {id:"8",type:"word",content:"Numerator"},{id:"8",type:"def",content:"分子"},
    {id:"9",type:"word",content:"Quadratic Expression"},{id:"9",type:"def",content:"二次表达式"}
  ]
},

{
  board: '25m', slug: '25m-y10-algebraic-fractions-2', category: '25m-y10', title: 'Algebraic Fractions (2)', titleZh: '代数分数 (2)', unitNum: 2, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Rational Expression"},{id:"0",type:"def",content:"有理表达式"},
    {id:"1",type:"word",content:"Rearrange"},{id:"1",type:"def",content:"重排"},
    {id:"2",type:"word",content:"Simplify"},{id:"2",type:"def",content:"简化"},
    {id:"3",type:"word",content:"Subject"},{id:"3",type:"def",content:"主项"},
    {id:"4",type:"word",content:"Variable"},{id:"4",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y10-quadratic-equations-1', category: '25m-y10', title: 'Quadratic Equations (1)', titleZh: '二次方程 (1)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Axis of symmetry"},{id:"0",type:"def",content:"对称轴"},
    {id:"1",type:"word",content:"Coefficient"},{id:"1",type:"def",content:"系数"},
    {id:"2",type:"word",content:"Completing the square"},{id:"2",type:"def",content:"配方法 / 完全平方法"},
    {id:"3",type:"word",content:"Constant"},{id:"3",type:"def",content:"常数"},
    {id:"4",type:"word",content:"Cubic equation"},{id:"4",type:"def",content:"立方方程"},
    {id:"5",type:"word",content:"Difference of two squares"},{id:"5",type:"def",content:"平方差"},
    {id:"6",type:"word",content:"Discriminant"},{id:"6",type:"def",content:"判别式"},
    {id:"7",type:"word",content:"Elimination method"},{id:"7",type:"def",content:"消元法"},
    {id:"8",type:"word",content:"Equation"},{id:"8",type:"def",content:"方程"},
    {id:"9",type:"word",content:"Expand"},{id:"9",type:"def",content:"展开"}
  ]
},

{
  board: '25m', slug: '25m-y10-quadratic-equations-2', category: '25m-y10', title: 'Quadratic Equations (2)', titleZh: '二次方程 (2)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Factorisation"},{id:"0",type:"def",content:"因式分解"},
    {id:"1",type:"word",content:"Graph"},{id:"1",type:"def",content:"图 / 图形"},
    {id:"2",type:"word",content:"Intercept"},{id:"2",type:"def",content:"截距"},
    {id:"3",type:"word",content:"Linear equation"},{id:"3",type:"def",content:"线性方程"},
    {id:"4",type:"word",content:"Maximum point"},{id:"4",type:"def",content:"最大值点"},
    {id:"5",type:"word",content:"Minimum point"},{id:"5",type:"def",content:"最小值点"},
    {id:"6",type:"word",content:"Parabola"},{id:"6",type:"def",content:"抛物线"},
    {id:"7",type:"word",content:"Quadratic equation"},{id:"7",type:"def",content:"一元二次方程"},
    {id:"8",type:"word",content:"Quadratic formula"},{id:"8",type:"def",content:"二次公式"},
    {id:"9",type:"word",content:"Real roots"},{id:"9",type:"def",content:"实根"}
  ]
},

{
  board: '25m', slug: '25m-y10-quadratic-equations-3', category: '25m-y10', title: 'Quadratic Equations (3)', titleZh: '二次方程 (3)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Root / Solution"},{id:"0",type:"def",content:"根 / 解"},
    {id:"1",type:"word",content:"Roots"},{id:"1",type:"def",content:"根"},
    {id:"2",type:"word",content:"Simplify"},{id:"2",type:"def",content:"化简"},
    {id:"3",type:"word",content:"Simultaneous equations"},{id:"3",type:"def",content:"联立方程"},
    {id:"4",type:"word",content:"Sketch"},{id:"4",type:"def",content:"草图"},
    {id:"5",type:"word",content:"Table of values"},{id:"5",type:"def",content:"数值表"},
    {id:"6",type:"word",content:"Term"},{id:"6",type:"def",content:"项"},
    {id:"7",type:"word",content:"Turning point / Vertex"},{id:"7",type:"def",content:"转折点 / 顶点"},
    {id:"8",type:"word",content:"Variable"},{id:"8",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y10-simultaneous-equations-1', category: '25m-y10', title: 'Simultaneous Equations (1)', titleZh: '联立方程组 (1)', unitNum: 4, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Coefficient"},{id:"0",type:"def",content:"系数"},
    {id:"1",type:"word",content:"Constant"},{id:"1",type:"def",content:"常数"},
    {id:"2",type:"word",content:"Eliminate"},{id:"2",type:"def",content:"消去"},
    {id:"3",type:"word",content:"Expression"},{id:"3",type:"def",content:"表达式"},
    {id:"4",type:"word",content:"Isolate"},{id:"4",type:"def",content:"隔离"},
    {id:"5",type:"word",content:"Linear Equation"},{id:"5",type:"def",content:"线性方程"},
    {id:"6",type:"word",content:"Quadratic Equation"},{id:"6",type:"def",content:"二次方程"},
    {id:"7",type:"word",content:"Simultaneous Equations"},{id:"7",type:"def",content:"联立方程组"},
    {id:"8",type:"word",content:"Solution"},{id:"8",type:"def",content:"解"},
    {id:"9",type:"word",content:"Substitution Method"},{id:"9",type:"def",content:"代入法"}
  ]
},

{
  board: '25m', slug: '25m-y10-simultaneous-equations-2', category: '25m-y10', title: 'Simultaneous Equations (2)', titleZh: '联立方程组 (2)', unitNum: 4, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"System of Equations"},{id:"0",type:"def",content:"方程组"},
    {id:"1",type:"word",content:"Three Unknowns"},{id:"1",type:"def",content:"三个未知数"},
    {id:"2",type:"word",content:"Two Unknowns"},{id:"2",type:"def",content:"两个未知数"},
    {id:"3",type:"word",content:"Unknown"},{id:"3",type:"def",content:"未知数"},
    {id:"4",type:"word",content:"Variable"},{id:"4",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y10-functions-1', category: '25m-y10', title: 'Functions (1)', titleZh: '函数 (1)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Asymptote"},{id:"0",type:"def",content:"渐近线"},
    {id:"1",type:"word",content:"Axis of symmetry"},{id:"1",type:"def",content:"对称轴"},
    {id:"2",type:"word",content:"Completing the square"},{id:"2",type:"def",content:"配方法"},
    {id:"3",type:"word",content:"Concave up/down"},{id:"3",type:"def",content:"开口向上/向下"},
    {id:"4",type:"word",content:"Constant of proportionality"},{id:"4",type:"def",content:"比例常数"},
    {id:"5",type:"word",content:"Coordinate"},{id:"5",type:"def",content:"坐标"},
    {id:"6",type:"word",content:"Domain"},{id:"6",type:"def",content:"定义域"},
    {id:"7",type:"word",content:"Extremum"},{id:"7",type:"def",content:"极值"},
    {id:"8",type:"word",content:"General form"},{id:"8",type:"def",content:"一般式"},
    {id:"9",type:"word",content:"Graph"},{id:"9",type:"def",content:"图像"}
  ]
},

{
  board: '25m', slug: '25m-y10-functions-2', category: '25m-y10', title: 'Functions (2)', titleZh: '函数 (2)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Hyperbola"},{id:"0",type:"def",content:"双曲线"},
    {id:"1",type:"word",content:"Intercept"},{id:"1",type:"def",content:"截距"},
    {id:"2",type:"word",content:"Intercept form"},{id:"2",type:"def",content:"截距式"},
    {id:"3",type:"word",content:"Inverse proportional function"},{id:"3",type:"def",content:"反比例函数"},
    {id:"4",type:"word",content:"Maximum value"},{id:"4",type:"def",content:"最大值"},
    {id:"5",type:"word",content:"Minimum value"},{id:"5",type:"def",content:"最小值"},
    {id:"6",type:"word",content:"Monotonicity"},{id:"6",type:"def",content:"单调性"},
    {id:"7",type:"word",content:"Origin"},{id:"7",type:"def",content:"原点"},
    {id:"8",type:"word",content:"Parabola"},{id:"8",type:"def",content:"抛物线"},
    {id:"9",type:"word",content:"Quadrant"},{id:"9",type:"def",content:"象限"}
  ]
},

{
  board: '25m', slug: '25m-y10-functions-3', category: '25m-y10', title: 'Functions (3)', titleZh: '函数 (3)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Quadratic function"},{id:"0",type:"def",content:"二次函数"},
    {id:"1",type:"word",content:"Range"},{id:"1",type:"def",content:"值域"},
    {id:"2",type:"word",content:"Reciprocal"},{id:"2",type:"def",content:"倒数"},
    {id:"3",type:"word",content:"Symmetry"},{id:"3",type:"def",content:"对称性"},
    {id:"4",type:"word",content:"Vertex"},{id:"4",type:"def",content:"顶点"},
    {id:"5",type:"word",content:"Vertex form"},{id:"5",type:"def",content:"顶点式"},
    {id:"6",type:"word",content:"X-intercept"},{id:"6",type:"def",content:"x 截距"},
    {id:"7",type:"word",content:"Y-intercept"},{id:"7",type:"def",content:"y 截距"}
  ]
},

{
  board: '25m', slug: '25m-y10-further-trigonometry-1', category: '25m-y10', title: 'Further Trigonometry (1)', titleZh: '进阶三角学 (1)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Adjacent side"},{id:"0",type:"def",content:"邻边"},
    {id:"1",type:"word",content:"Alternate angles"},{id:"1",type:"def",content:"内错角"},
    {id:"2",type:"word",content:"Angle of depression"},{id:"2",type:"def",content:"俯角"},
    {id:"3",type:"word",content:"Angle of elevation"},{id:"3",type:"def",content:"仰角"},
    {id:"4",type:"word",content:"Area"},{id:"4",type:"def",content:"面积"},
    {id:"5",type:"word",content:"Back bearing"},{id:"5",type:"def",content:"反方位角"},
    {id:"6",type:"word",content:"Bearing"},{id:"6",type:"def",content:"方位角"},
    {id:"7",type:"word",content:"Clockwise"},{id:"7",type:"def",content:"顺时针"},
    {id:"8",type:"word",content:"Congruence"},{id:"8",type:"def",content:"全等"},
    {id:"9",type:"word",content:"Corresponding angles"},{id:"9",type:"def",content:"对应角"}
  ]
},

{
  board: '25m', slug: '25m-y10-further-trigonometry-2', category: '25m-y10', title: 'Further Trigonometry (2)', titleZh: '进阶三角学 (2)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Corresponding angles"},{id:"0",type:"def",content:"同位角"},
    {id:"1",type:"word",content:"Corresponding sides"},{id:"1",type:"def",content:"对应边"},
    {id:"2",type:"word",content:"Cosine"},{id:"2",type:"def",content:"余弦"},
    {id:"3",type:"word",content:"Cosine Rule"},{id:"3",type:"def",content:"余弦定理"},
    {id:"4",type:"word",content:"Displacement"},{id:"4",type:"def",content:"位移"},
    {id:"5",type:"word",content:"Distance"},{id:"5",type:"def",content:"距离"},
    {id:"6",type:"word",content:"Exact value"},{id:"6",type:"def",content:"精确值"},
    {id:"7",type:"word",content:"Hypotenuse"},{id:"7",type:"def",content:"斜边"},
    {id:"8",type:"word",content:"Interior angles"},{id:"8",type:"def",content:"同旁内角"},
    {id:"9",type:"word",content:"Irrational number"},{id:"9",type:"def",content:"无理数"}
  ]
},

{
  board: '25m', slug: '25m-y10-further-trigonometry-3', category: '25m-y10', title: 'Further Trigonometry (3)', titleZh: '进阶三角学 (3)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Line and plane angle"},{id:"0",type:"def",content:"线与平面夹角"},
    {id:"1",type:"word",content:"Navigation"},{id:"1",type:"def",content:"导航"},
    {id:"2",type:"word",content:"North"},{id:"2",type:"def",content:"正北"},
    {id:"3",type:"word",content:"Opposite side"},{id:"3",type:"def",content:"对边"},
    {id:"4",type:"word",content:"Perimeter"},{id:"4",type:"def",content:"周长"},
    {id:"5",type:"word",content:"Perpendicular distance"},{id:"5",type:"def",content:"垂直距离"},
    {id:"6",type:"word",content:"Position"},{id:"6",type:"def",content:"位置"},
    {id:"7",type:"word",content:"Proportion"},{id:"7",type:"def",content:"比例关系"},
    {id:"8",type:"word",content:"Protractor"},{id:"8",type:"def",content:"量角器"},
    {id:"9",type:"word",content:"Pythagoras\' Theorem"},{id:"9",type:"def",content:"勾股定理"}
  ]
},

{
  board: '25m', slug: '25m-y10-further-trigonometry-4', category: '25m-y10', title: 'Further Trigonometry (4)', titleZh: '进阶三角学 (4)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Ratio"},{id:"0",type:"def",content:"比例"},
    {id:"1",type:"word",content:"Right-angled triangle"},{id:"1",type:"def",content:"直角三角形"},
    {id:"2",type:"word",content:"Scale factor"},{id:"2",type:"def",content:"比例因子"},
    {id:"3",type:"word",content:"Similarity"},{id:"3",type:"def",content:"相似性"},
    {id:"4",type:"word",content:"Sine"},{id:"4",type:"def",content:"正弦"},
    {id:"5",type:"word",content:"Sine Rule"},{id:"5",type:"def",content:"正弦定理"},
    {id:"6",type:"word",content:"SOH CAH TOA"},{id:"6",type:"def",content:"正弦对斜、余弦邻斜、正切对邻"},
    {id:"7",type:"word",content:"Surd"},{id:"7",type:"def",content:"根式"},
    {id:"8",type:"word",content:"Tangent"},{id:"8",type:"def",content:"正切"},
    {id:"9",type:"word",content:"Three-digit bearing"},{id:"9",type:"def",content:"三位数方位角"}
  ]
},

{
  board: '25m', slug: '25m-y10-further-trigonometry-5', category: '25m-y10', title: 'Further Trigonometry (5)', titleZh: '进阶三角学 (5)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Three-figure bearing"},{id:"0",type:"def",content:"三位数方位角"},
    {id:"1",type:"word",content:"Trigonometric ratio"},{id:"1",type:"def",content:"三角函数比率"},
    {id:"2",type:"word",content:"Trigonometry"},{id:"2",type:"def",content:"三角学"}
  ]
},

{
  board: '25m', slug: '25m-y10-unit-6-circles-1', category: '25m-y10', title: 'Unit 6 Circles (1)', titleZh: '圆 (1)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Alternate segment theorem"},{id:"0",type:"def",content:"弦切角定理"},
    {id:"1",type:"word",content:"Angle at centre"},{id:"1",type:"def",content:"圆心角"},
    {id:"2",type:"word",content:"Angle at circumference"},{id:"2",type:"def",content:"圆周角"},
    {id:"3",type:"word",content:"Arc"},{id:"3",type:"def",content:"圆弧"},
    {id:"4",type:"word",content:"Arc length"},{id:"4",type:"def",content:"弧长"},
    {id:"5",type:"word",content:"Area"},{id:"5",type:"def",content:"面积"},
    {id:"6",type:"word",content:"Area of sector"},{id:"6",type:"def",content:"扇形面积"},
    {id:"7",type:"word",content:"Central angle"},{id:"7",type:"def",content:"圆心角"},
    {id:"8",type:"word",content:"Chord"},{id:"8",type:"def",content:"弦"},
    {id:"9",type:"word",content:"Circle"},{id:"9",type:"def",content:"圆"}
  ]
},

{
  board: '25m', slug: '25m-y10-unit-6-circles-2', category: '25m-y10', title: 'Unit 6 Circles (2)', titleZh: '圆 (2)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Circle theorem"},{id:"0",type:"def",content:"圆定理"},
    {id:"1",type:"word",content:"Circumference"},{id:"1",type:"def",content:"周长"},
    {id:"2",type:"word",content:"Circumscribed circle"},{id:"2",type:"def",content:"外接圆"},
    {id:"3",type:"word",content:"Compound shape"},{id:"3",type:"def",content:"复合形状"},
    {id:"4",type:"word",content:"Cyclic quadrilateral"},{id:"4",type:"def",content:"圆内接四边形"},
    {id:"5",type:"word",content:"Diameter"},{id:"5",type:"def",content:"直径"},
    {id:"6",type:"word",content:"Exterior angle"},{id:"6",type:"def",content:"外角"},
    {id:"7",type:"word",content:"Inscribed circle"},{id:"7",type:"def",content:"内切圆"},
    {id:"8",type:"word",content:"Inscribed polygon"},{id:"8",type:"def",content:"内接多边形"},
    {id:"9",type:"word",content:"Interior angle"},{id:"9",type:"def",content:"内角"}
  ]
},

{
  board: '25m', slug: '25m-y10-unit-6-circles-3', category: '25m-y10', title: 'Unit 6 Circles (3)', titleZh: '圆 (3)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Isosceles triangle"},{id:"0",type:"def",content:"等腰三角形"},
    {id:"1",type:"word",content:"Major arc"},{id:"1",type:"def",content:"优弧"},
    {id:"2",type:"word",content:"Major sector"},{id:"2",type:"def",content:"优扇形"},
    {id:"3",type:"word",content:"Minor arc"},{id:"3",type:"def",content:"劣弧"},
    {id:"4",type:"word",content:"Minor sector"},{id:"4",type:"def",content:"劣扇形"},
    {id:"5",type:"word",content:"Perimeter"},{id:"5",type:"def",content:"周长"},
    {id:"6",type:"word",content:"Perpendicular bisector"},{id:"6",type:"def",content:"垂直平分线"},
    {id:"7",type:"word",content:"Pi"},{id:"7",type:"def",content:"圆周率"},
    {id:"8",type:"word",content:"Point of tangency"},{id:"8",type:"def",content:"切点"},
    {id:"9",type:"word",content:"Polygon"},{id:"9",type:"def",content:"多边形"}
  ]
},

{
  board: '25m', slug: '25m-y10-unit-6-circles-4', category: '25m-y10', title: 'Unit 6 Circles (4)', titleZh: '圆 (4)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Radius"},{id:"0",type:"def",content:"半径"},
    {id:"1",type:"word",content:"Regular polygon"},{id:"1",type:"def",content:"正多边形"},
    {id:"2",type:"word",content:"Secant"},{id:"2",type:"def",content:"割线"},
    {id:"3",type:"word",content:"Sector"},{id:"3",type:"def",content:"扇形"},
    {id:"4",type:"word",content:"Segment"},{id:"4",type:"def",content:"弓形"},
    {id:"5",type:"word",content:"Subtend"},{id:"5",type:"def",content:"对（角）"},
    {id:"6",type:"word",content:"Tangent"},{id:"6",type:"def",content:"切线"},
    {id:"7",type:"word",content:"Vertex"},{id:"7",type:"def",content:"顶点"}
  ]
},

{
  board: '25m', slug: '25m-y10-practice-with-constructions-1', category: '25m-y10', title: 'Practice with Constructions (1)', titleZh: '构造练习 (1)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle bisector"},{id:"0",type:"def",content:"角平分线"},
    {id:"1",type:"word",content:"Arc"},{id:"1",type:"def",content:"弧"},
    {id:"2",type:"word",content:"ASA (Angle-Side-Angle)"},{id:"2",type:"def",content:"角边角"},
    {id:"3",type:"word",content:"Bisect"},{id:"3",type:"def",content:"平分"},
    {id:"4",type:"word",content:"Centroid"},{id:"4",type:"def",content:"重心"},
    {id:"5",type:"word",content:"Circumcenter"},{id:"5",type:"def",content:"外心"},
    {id:"6",type:"word",content:"Circumscribed circle"},{id:"6",type:"def",content:"外接圆"},
    {id:"7",type:"word",content:"Compass"},{id:"7",type:"def",content:"圆规"},
    {id:"8",type:"word",content:"Congruent triangles"},{id:"8",type:"def",content:"全等三角形"},
    {id:"9",type:"word",content:"Construction"},{id:"9",type:"def",content:"构造"}
  ]
},

{
  board: '25m', slug: '25m-y10-practice-with-constructions-2', category: '25m-y10', title: 'Practice with Constructions (2)', titleZh: '构造练习 (2)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Equidistant"},{id:"0",type:"def",content:"等距的"},
    {id:"1",type:"word",content:"Equilateral triangle"},{id:"1",type:"def",content:"等边三角形"},
    {id:"2",type:"word",content:"Incenter"},{id:"2",type:"def",content:"内心"},
    {id:"3",type:"word",content:"Inscribed circle"},{id:"3",type:"def",content:"内切圆"},
    {id:"4",type:"word",content:"Intersection"},{id:"4",type:"def",content:"交点"},
    {id:"5",type:"word",content:"Isosceles triangle"},{id:"5",type:"def",content:"等腰三角形"},
    {id:"6",type:"word",content:"Line"},{id:"6",type:"def",content:"线"},
    {id:"7",type:"word",content:"Line segment"},{id:"7",type:"def",content:"线段"},
    {id:"8",type:"word",content:"Locus"},{id:"8",type:"def",content:"轨迹"},
    {id:"9",type:"word",content:"Median"},{id:"9",type:"def",content:"中线"}
  ]
},

{
  board: '25m', slug: '25m-y10-practice-with-constructions-3', category: '25m-y10', title: 'Practice with Constructions (3)', titleZh: '构造练习 (3)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Perpendicular"},{id:"0",type:"def",content:"垂直的"},
    {id:"1",type:"word",content:"Perpendicular bisector"},{id:"1",type:"def",content:"垂直平分线"},
    {id:"2",type:"word",content:"Point"},{id:"2",type:"def",content:"点"},
    {id:"3",type:"word",content:"Quadrilateral"},{id:"3",type:"def",content:"四边形"},
    {id:"4",type:"word",content:"RHS (Right-angle-Hypotenuse-Side)"},{id:"4",type:"def",content:"直角、斜边、边"},
    {id:"5",type:"word",content:"Right angle"},{id:"5",type:"def",content:"直角"},
    {id:"6",type:"word",content:"SAS (Side-Angle-Side)"},{id:"6",type:"def",content:"边角边"},
    {id:"7",type:"word",content:"SSS (Side-Side-Side)"},{id:"7",type:"def",content:"边边边"},
    {id:"8",type:"word",content:"Straightedge"},{id:"8",type:"def",content:"直尺"}
  ]
},

{
  board: '25m', slug: '25m-y10-congruence-and-similarity-1', category: '25m-y10', title: 'Congruence and Similarity (1)', titleZh: '全等和相似 (1)', unitNum: 9, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle-Side-Angle (ASA)"},{id:"0",type:"def",content:"角-边-角 (ASA)"},
    {id:"1",type:"word",content:"Congruence"},{id:"1",type:"def",content:"全等"},
    {id:"2",type:"word",content:"Corresponding angles"},{id:"2",type:"def",content:"对应角"},
    {id:"3",type:"word",content:"Corresponding sides"},{id:"3",type:"def",content:"对应边"},
    {id:"4",type:"word",content:"Hypotenuse"},{id:"4",type:"def",content:"斜边"},
    {id:"5",type:"word",content:"Proof"},{id:"5",type:"def",content:"证明"},
    {id:"6",type:"word",content:"Proportion"},{id:"6",type:"def",content:"比例式"},
    {id:"7",type:"word",content:"Ratio"},{id:"7",type:"def",content:"比例"},
    {id:"8",type:"word",content:"Right-angle-Hypotenuse-Side (RHS)"},{id:"8",type:"def",content:"直角-斜边-边 (RHS)"},
    {id:"9",type:"word",content:"Scale factor"},{id:"9",type:"def",content:"比例因子"}
  ]
},

{
  board: '25m', slug: '25m-y10-congruence-and-similarity-2', category: '25m-y10', title: 'Congruence and Similarity (2)', titleZh: '全等和相似 (2)', unitNum: 9, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Side-Angle-Side (SAS)"},{id:"0",type:"def",content:"边-角-边 (SAS)"},
    {id:"1",type:"word",content:"Side-Side-Side (SSS)"},{id:"1",type:"def",content:"边-边-边 (SSS)"},
    {id:"2",type:"word",content:"Similarity"},{id:"2",type:"def",content:"相似"},
    {id:"3",type:"word",content:"Triangle"},{id:"3",type:"def",content:"三角形"},
    {id:"4",type:"word",content:"Vertex"},{id:"4",type:"def",content:"顶点"}
  ]
},

{
  board: '25m', slug: '25m-y10-transformations-1', category: '25m-y10', title: 'Transformations (1)', titleZh: '图形变换 (1)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Angle of rotation"},{id:"0",type:"def",content:"旋转角度"},
    {id:"1",type:"word",content:"Centre of enlargement"},{id:"1",type:"def",content:"放缩中心"},
    {id:"2",type:"word",content:"Centre of rotation"},{id:"2",type:"def",content:"旋转中心"},
    {id:"3",type:"word",content:"Combined transformation"},{id:"3",type:"def",content:"组合变换"},
    {id:"4",type:"word",content:"Congruent"},{id:"4",type:"def",content:"全等"},
    {id:"5",type:"word",content:"Coordinate"},{id:"5",type:"def",content:"坐标"},
    {id:"6",type:"word",content:"Coordinate system"},{id:"6",type:"def",content:"坐标系"},
    {id:"7",type:"word",content:"Enlargement"},{id:"7",type:"def",content:"放缩"},
    {id:"8",type:"word",content:"Equation of a line"},{id:"8",type:"def",content:"直线方程"},
    {id:"9",type:"word",content:"Horizontal line"},{id:"9",type:"def",content:"水平线"}
  ]
},

{
  board: '25m', slug: '25m-y10-transformations-2', category: '25m-y10', title: 'Transformations (2)', titleZh: '图形变换 (2)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Image"},{id:"0",type:"def",content:"像"},
    {id:"1",type:"word",content:"Intercept"},{id:"1",type:"def",content:"截距"},
    {id:"2",type:"word",content:"Line of reflection"},{id:"2",type:"def",content:"翻折线"},
    {id:"3",type:"word",content:"Object"},{id:"3",type:"def",content:"原像"},
    {id:"4",type:"word",content:"Origin"},{id:"4",type:"def",content:"原点"},
    {id:"5",type:"word",content:"Proportion"},{id:"5",type:"def",content:"比例"},
    {id:"6",type:"word",content:"Quadrant"},{id:"6",type:"def",content:"象限"},
    {id:"7",type:"word",content:"Ratio"},{id:"7",type:"def",content:"比率"},
    {id:"8",type:"word",content:"Reflection"},{id:"8",type:"def",content:"翻折"},
    {id:"9",type:"word",content:"Rotation"},{id:"9",type:"def",content:"旋转"}
  ]
},

{
  board: '25m', slug: '25m-y10-transformations-3', category: '25m-y10', title: 'Transformations (3)', titleZh: '图形变换 (3)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Scale factor"},{id:"0",type:"def",content:"比例因子"},
    {id:"1",type:"word",content:"Similar figures"},{id:"1",type:"def",content:"相似图形"},
    {id:"2",type:"word",content:"Slope"},{id:"2",type:"def",content:"斜率"},
    {id:"3",type:"word",content:"Transformation"},{id:"3",type:"def",content:"变换"},
    {id:"4",type:"word",content:"Translation"},{id:"4",type:"def",content:"平移"},
    {id:"5",type:"word",content:"Vector"},{id:"5",type:"def",content:"向量"},
    {id:"6",type:"word",content:"Vertical line"},{id:"6",type:"def",content:"垂直线"},
    {id:"7",type:"word",content:"X-axis"},{id:"7",type:"def",content:"X轴"},
    {id:"8",type:"word",content:"Y-axis"},{id:"8",type:"def",content:"Y轴"}
  ]
},

{
  board: '25m', slug: '25m-y10-probability-1', category: '25m-y10', title: 'Probability (1)', titleZh: '概率 (1)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"At Least"},{id:"0",type:"def",content:"至少"},
    {id:"1",type:"word",content:"Certain"},{id:"1",type:"def",content:"必然"},
    {id:"2",type:"word",content:"Combined Probability"},{id:"2",type:"def",content:"联合概率"},
    {id:"3",type:"word",content:"Complementary Event"},{id:"3",type:"def",content:"补事件"},
    {id:"4",type:"word",content:"Conditional Probability"},{id:"4",type:"def",content:"条件概率"},
    {id:"5",type:"word",content:"Dependent Events"},{id:"5",type:"def",content:"相关事件 / 依赖事件"},
    {id:"6",type:"word",content:"Event"},{id:"6",type:"def",content:"事件"},
    {id:"7",type:"word",content:"Exactly"},{id:"7",type:"def",content:"恰好"},
    {id:"8",type:"word",content:"Failure"},{id:"8",type:"def",content:"失败"},
    {id:"9",type:"word",content:"Favorable Outcome"},{id:"9",type:"def",content:"有利结果"}
  ]
},

{
  board: '25m', slug: '25m-y10-probability-2', category: '25m-y10', title: 'Probability (2)', titleZh: '概率 (2)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Frequency"},{id:"0",type:"def",content:"频率"},
    {id:"1",type:"word",content:"Impossible"},{id:"1",type:"def",content:"不可能"},
    {id:"2",type:"word",content:"Independent Events"},{id:"2",type:"def",content:"独立事件"},
    {id:"3",type:"word",content:"Intersection"},{id:"3",type:"def",content:"交集"},
    {id:"4",type:"word",content:"Likely"},{id:"4",type:"def",content:"可能"},
    {id:"5",type:"word",content:"Mutually Exclusive"},{id:"5",type:"def",content:"互斥事件"},
    {id:"6",type:"word",content:"Not Mutually Exclusive"},{id:"6",type:"def",content:"非互斥事件"},
    {id:"7",type:"word",content:"Outcome"},{id:"7",type:"def",content:"结果"},
    {id:"8",type:"word",content:"Probability"},{id:"8",type:"def",content:"概率"},
    {id:"9",type:"word",content:"Product Rule"},{id:"9",type:"def",content:"乘法法则"}
  ]
},

{
  board: '25m', slug: '25m-y10-probability-3', category: '25m-y10', title: 'Probability (3)', titleZh: '概率 (3)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Random Event"},{id:"0",type:"def",content:"随机事件"},
    {id:"1",type:"word",content:"Relative Frequency"},{id:"1",type:"def",content:"相对频率"},
    {id:"2",type:"word",content:"Sample Space"},{id:"2",type:"def",content:"样本空间"},
    {id:"3",type:"word",content:"Success"},{id:"3",type:"def",content:"成功"},
    {id:"4",type:"word",content:"Sum Rule"},{id:"4",type:"def",content:"加法法则"},
    {id:"5",type:"word",content:"Theoretical Probability"},{id:"5",type:"def",content:"理论概率"},
    {id:"6",type:"word",content:"Tree Diagram"},{id:"6",type:"def",content:"树状图"},
    {id:"7",type:"word",content:"Unlikely"},{id:"7",type:"def",content:"不太可能"},
    {id:"8",type:"word",content:"With Replacement"},{id:"8",type:"def",content:"有放回"},
    {id:"9",type:"word",content:"Without Replacement"},{id:"9",type:"def",content:"无放回"}
  ]
},

{
  board: '25m', slug: '25m-y10-3d-geometry-1', category: '25m-y10', title: '3D Geometry (1)', titleZh: '立体几何 (1)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"3D solid"},{id:"0",type:"def",content:"三维立体"},
    {id:"1",type:"word",content:"Apex"},{id:"1",type:"def",content:"顶点"},
    {id:"2",type:"word",content:"Axis"},{id:"2",type:"def",content:"轴"},
    {id:"3",type:"word",content:"Compound shape"},{id:"3",type:"def",content:"复合形状"},
    {id:"4",type:"word",content:"Cone"},{id:"4",type:"def",content:"圆锥体"},
    {id:"5",type:"word",content:"Cross-section"},{id:"5",type:"def",content:"横截面"},
    {id:"6",type:"word",content:"Cube"},{id:"6",type:"def",content:"立方体"},
    {id:"7",type:"word",content:"Cuboid"},{id:"7",type:"def",content:"长方体"},
    {id:"8",type:"word",content:"Cylinder"},{id:"8",type:"def",content:"圆柱体"},
    {id:"9",type:"word",content:"Density"},{id:"9",type:"def",content:"密度"}
  ]
},

{
  board: '25m', slug: '25m-y10-3d-geometry-2', category: '25m-y10', title: '3D Geometry (2)', titleZh: '立体几何 (2)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Dimension"},{id:"0",type:"def",content:"尺寸"},
    {id:"1",type:"word",content:"Elevation"},{id:"1",type:"def",content:"立面图"},
    {id:"2",type:"word",content:"Front elevation"},{id:"2",type:"def",content:"正立面图"},
    {id:"3",type:"word",content:"Isometric drawing"},{id:"3",type:"def",content:"等轴测图"},
    {id:"4",type:"word",content:"Mass"},{id:"4",type:"def",content:"质量"},
    {id:"5",type:"word",content:"Net"},{id:"5",type:"def",content:"展开图"},
    {id:"6",type:"word",content:"Orthographic projection"},{id:"6",type:"def",content:"正交投影"},
    {id:"7",type:"word",content:"Plan view"},{id:"7",type:"def",content:"平面图"},
    {id:"8",type:"word",content:"Prism"},{id:"8",type:"def",content:"棱柱体"},
    {id:"9",type:"word",content:"Pyramid"},{id:"9",type:"def",content:"棱锥体"}
  ]
},

{
  board: '25m', slug: '25m-y10-3d-geometry-3', category: '25m-y10', title: '3D Geometry (3)', titleZh: '立体几何 (3)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Side elevation"},{id:"0",type:"def",content:"侧立面图"},
    {id:"1",type:"word",content:"Sphere"},{id:"1",type:"def",content:"球体"},
    {id:"2",type:"word",content:"Surface area"},{id:"2",type:"def",content:"表面积"},
    {id:"3",type:"word",content:"Top view"},{id:"3",type:"def",content:"俯视图"},
    {id:"4",type:"word",content:"Unit conversion"},{id:"4",type:"def",content:"单位换算"},
    {id:"5",type:"word",content:"Viewpoint"},{id:"5",type:"def",content:"视点"},
    {id:"6",type:"word",content:"Volume"},{id:"6",type:"def",content:"体积"}
  ]
},


/* ═══ Year 11 (26 levels, 216 words) ═══ */

{
  board: '25m', slug: '25m-y11-estimation-bounds-1', category: '25m-y11', title: 'Estimation & Bounds (1)', titleZh: '估算与界限 (1)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Approximate"},{id:"0",type:"def",content:"近似"},
    {id:"1",type:"word",content:"Base"},{id:"1",type:"def",content:"底数"},
    {id:"2",type:"word",content:"Bounds"},{id:"2",type:"def",content:"界限"},
    {id:"3",type:"word",content:"Decimal places"},{id:"3",type:"def",content:"小数位数"},
    {id:"4",type:"word",content:"Degree of accuracy"},{id:"4",type:"def",content:"精确度"},
    {id:"5",type:"word",content:"Error"},{id:"5",type:"def",content:"误差"},
    {id:"6",type:"word",content:"Estimate"},{id:"6",type:"def",content:"估计"},
    {id:"7",type:"word",content:"Estimation"},{id:"7",type:"def",content:"估计"},
    {id:"8",type:"word",content:"Exponent"},{id:"8",type:"def",content:"指数"},
    {id:"9",type:"word",content:"Inequality"},{id:"9",type:"def",content:"不等式"}
  ]
},

{
  board: '25m', slug: '25m-y11-estimation-bounds-2', category: '25m-y11', title: 'Estimation & Bounds (2)', titleZh: '估算与界限 (2)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Integer"},{id:"0",type:"def",content:"整数"},
    {id:"1",type:"word",content:"Interval"},{id:"1",type:"def",content:"区间"},
    {id:"2",type:"word",content:"Lower bound"},{id:"2",type:"def",content:"下限"},
    {id:"3",type:"word",content:"Magnitude"},{id:"3",type:"def",content:"数量级"},
    {id:"4",type:"word",content:"Maximum possible value"},{id:"4",type:"def",content:"最大可能值"},
    {id:"5",type:"word",content:"Measurement"},{id:"5",type:"def",content:"测量"},
    {id:"6",type:"word",content:"Minimum possible value"},{id:"6",type:"def",content:"最小可能值"},
    {id:"7",type:"word",content:"Non-zero digit"},{id:"7",type:"def",content:"非零数字"},
    {id:"8",type:"word",content:"Order of magnitude"},{id:"8",type:"def",content:"数量级"},
    {id:"9",type:"word",content:"Precision"},{id:"9",type:"def",content:"精确度"}
  ]
},

{
  board: '25m', slug: '25m-y11-estimation-bounds-3', category: '25m-y11', title: 'Estimation & Bounds (3)', titleZh: '估算与界限 (3)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"范围"},
    {id:"1",type:"word",content:"Rounding"},{id:"1",type:"def",content:"四舍五入"},
    {id:"2",type:"word",content:"Scientific notation"},{id:"2",type:"def",content:"科学计数法"},
    {id:"3",type:"word",content:"Significant figures"},{id:"3",type:"def",content:"有效数字"},
    {id:"4",type:"word",content:"Standard form"},{id:"4",type:"def",content:"标准形式 / 科学计数法"},
    {id:"5",type:"word",content:"Truncate"},{id:"5",type:"def",content:"截断"},
    {id:"6",type:"word",content:"Upper bound"},{id:"6",type:"def",content:"上限"}
  ]
},

{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-1', category: '25m-y11', title: 'Set Notation & Venn Diagrams (1)', titleZh: '集合符号与韦恩图 (1)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Belongs to"},{id:"0",type:"def",content:"属于"},
    {id:"1",type:"word",content:"Cardinality"},{id:"1",type:"def",content:"基数 / 集合的元素个数"},
    {id:"2",type:"word",content:"Certain"},{id:"2",type:"def",content:"确定"},
    {id:"3",type:"word",content:"Complement of a Set"},{id:"3",type:"def",content:"补集"},
    {id:"4",type:"word",content:"Decimal"},{id:"4",type:"def",content:"小数"},
    {id:"5",type:"word",content:"Denominator"},{id:"5",type:"def",content:"分母"},
    {id:"6",type:"word",content:"Disjoint Sets"},{id:"6",type:"def",content:"不相交集合"},
    {id:"7",type:"word",content:"Does not belong to"},{id:"7",type:"def",content:"不属于"},
    {id:"8",type:"word",content:"Element"},{id:"8",type:"def",content:"元素"},
    {id:"9",type:"word",content:"Empty Set / Null Set"},{id:"9",type:"def",content:"空集"}
  ]
},

{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-2', category: '25m-y11', title: 'Set Notation & Venn Diagrams (2)', titleZh: '集合符号与韦恩图 (2)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Event"},{id:"0",type:"def",content:"事件"},
    {id:"1",type:"word",content:"Fair"},{id:"1",type:"def",content:"公平的"},
    {id:"2",type:"word",content:"Fraction"},{id:"2",type:"def",content:"分数"},
    {id:"3",type:"word",content:"Impossible"},{id:"3",type:"def",content:"不可能"},
    {id:"4",type:"word",content:"Intersection"},{id:"4",type:"def",content:"交集"},
    {id:"5",type:"word",content:"Likely"},{id:"5",type:"def",content:"可能"},
    {id:"6",type:"word",content:"Numerator"},{id:"6",type:"def",content:"分子"},
    {id:"7",type:"word",content:"Outcome"},{id:"7",type:"def",content:"结果"},
    {id:"8",type:"word",content:"Percentage"},{id:"8",type:"def",content:"百分比"},
    {id:"9",type:"word",content:"Probability"},{id:"9",type:"def",content:"概率"}
  ]
},

{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-3', category: '25m-y11', title: 'Set Notation & Venn Diagrams (3)', titleZh: '集合符号与韦恩图 (3)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Proper Subset"},{id:"0",type:"def",content:"真子集"},
    {id:"1",type:"word",content:"Random"},{id:"1",type:"def",content:"随机"},
    {id:"2",type:"word",content:"Ratio"},{id:"2",type:"def",content:"比率"},
    {id:"3",type:"word",content:"Sample Space"},{id:"3",type:"def",content:"样本空间"},
    {id:"4",type:"word",content:"Set"},{id:"4",type:"def",content:"集合"},
    {id:"5",type:"word",content:"Set-builder notation"},{id:"5",type:"def",content:"集合构造式表示法"},
    {id:"6",type:"word",content:"Subset"},{id:"6",type:"def",content:"子集"},
    {id:"7",type:"word",content:"Union"},{id:"7",type:"def",content:"并集"},
    {id:"8",type:"word",content:"Universal Set"},{id:"8",type:"def",content:"全集"},
    {id:"9",type:"word",content:"Venn Diagram"},{id:"9",type:"def",content:"维恩图"}
  ]
},

{
  board: '25m', slug: '25m-y11-simultaneous-equations-1', category: '25m-y11', title: 'Simultaneous Equations (1)', titleZh: '联立方程组 (1)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Coefficient"},{id:"0",type:"def",content:"系数"},
    {id:"1",type:"word",content:"Consistent system"},{id:"1",type:"def",content:"相容系统"},
    {id:"2",type:"word",content:"Constant"},{id:"2",type:"def",content:"常数"},
    {id:"3",type:"word",content:"Discriminant"},{id:"3",type:"def",content:"判别式"},
    {id:"4",type:"word",content:"Elimination method"},{id:"4",type:"def",content:"消元法"},
    {id:"5",type:"word",content:"Equation"},{id:"5",type:"def",content:"方程"},
    {id:"6",type:"word",content:"Expression"},{id:"6",type:"def",content:"表达式"},
    {id:"7",type:"word",content:"Formula"},{id:"7",type:"def",content:"公式"},
    {id:"8",type:"word",content:"Inconsistent system"},{id:"8",type:"def",content:"不相容系统"},
    {id:"9",type:"word",content:"Infinite solutions"},{id:"9",type:"def",content:"无数解"}
  ]
},

{
  board: '25m', slug: '25m-y11-simultaneous-equations-2', category: '25m-y11', title: 'Simultaneous Equations (2)', titleZh: '联立方程组 (2)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Intersection point"},{id:"0",type:"def",content:"交点"},
    {id:"1",type:"word",content:"Isolate"},{id:"1",type:"def",content:"分离"},
    {id:"2",type:"word",content:"Linear equation"},{id:"2",type:"def",content:"线性方程"},
    {id:"3",type:"word",content:"No solution"},{id:"3",type:"def",content:"无解"},
    {id:"4",type:"word",content:"Parabola"},{id:"4",type:"def",content:"抛物线"},
    {id:"5",type:"word",content:"Practical problem"},{id:"5",type:"def",content:"实际问题"},
    {id:"6",type:"word",content:"Quadratic equation"},{id:"6",type:"def",content:"二次方程"},
    {id:"7",type:"word",content:"Rearrange"},{id:"7",type:"def",content:"重新排列/移项"},
    {id:"8",type:"word",content:"Simplify"},{id:"8",type:"def",content:"简化"},
    {id:"9",type:"word",content:"Simultaneous equations"},{id:"9",type:"def",content:"联立方程组"}
  ]
},

{
  board: '25m', slug: '25m-y11-simultaneous-equations-3', category: '25m-y11', title: 'Simultaneous Equations (3)', titleZh: '联立方程组 (3)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Solution"},{id:"0",type:"def",content:"解"},
    {id:"1",type:"word",content:"Solve"},{id:"1",type:"def",content:"求解"},
    {id:"2",type:"word",content:"Substitution method"},{id:"2",type:"def",content:"代入法"},
    {id:"3",type:"word",content:"System of equations"},{id:"3",type:"def",content:"方程组"},
    {id:"4",type:"word",content:"Term"},{id:"4",type:"def",content:"项"},
    {id:"5",type:"word",content:"Three unknowns"},{id:"5",type:"def",content:"三个未知数"},
    {id:"6",type:"word",content:"Unique solution"},{id:"6",type:"def",content:"唯一解"},
    {id:"7",type:"word",content:"Unknown"},{id:"7",type:"def",content:"未知数"},
    {id:"8",type:"word",content:"Variable"},{id:"8",type:"def",content:"变量"}
  ]
},

{
  board: '25m', slug: '25m-y11-quadratic-sequences-1', category: '25m-y11', title: 'Quadratic Sequences (1)', titleZh: '二次数列 (1)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Arithmetic progression"},{id:"0",type:"def",content:"等差数列"},
    {id:"1",type:"word",content:"Coefficient"},{id:"1",type:"def",content:"系数"},
    {id:"2",type:"word",content:"Common difference"},{id:"2",type:"def",content:"公差"},
    {id:"3",type:"word",content:"Common ratio"},{id:"3",type:"def",content:"公比"},
    {id:"4",type:"word",content:"Constant second difference"},{id:"4",type:"def",content:"常数二阶差分"},
    {id:"5",type:"word",content:"Cubic sequence"},{id:"5",type:"def",content:"三次数列"},
    {id:"6",type:"word",content:"Degree"},{id:"6",type:"def",content:"次数"},
    {id:"7",type:"word",content:"Exponential sequence"},{id:"7",type:"def",content:"指数数列"},
    {id:"8",type:"word",content:"First difference"},{id:"8",type:"def",content:"一阶差分"},
    {id:"9",type:"word",content:"Formula"},{id:"9",type:"def",content:"公式"}
  ]
},

{
  board: '25m', slug: '25m-y11-quadratic-sequences-2', category: '25m-y11', title: 'Quadratic Sequences (2)', titleZh: '二次数列 (2)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"General form"},{id:"0",type:"def",content:"一般形式"},
    {id:"1",type:"word",content:"Geometric sequence"},{id:"1",type:"def",content:"几何数列 / 等比数列"},
    {id:"2",type:"word",content:"Identify"},{id:"2",type:"def",content:"识别"},
    {id:"3",type:"word",content:"Linear sequence"},{id:"3",type:"def",content:"线性数列 / 等差数列"},
    {id:"4",type:"word",content:"nth term"},{id:"4",type:"def",content:"第n项"},
    {id:"5",type:"word",content:"nth term formula"},{id:"5",type:"def",content:"第n项公式"},
    {id:"6",type:"word",content:"Pattern"},{id:"6",type:"def",content:"模式 / 规律"},
    {id:"7",type:"word",content:"Position"},{id:"7",type:"def",content:"位置"},
    {id:"8",type:"word",content:"Practical problem"},{id:"8",type:"def",content:"实际问题"},
    {id:"9",type:"word",content:"Quadratic sequence"},{id:"9",type:"def",content:"二次数列"}
  ]
},

{
  board: '25m', slug: '25m-y11-quadratic-sequences-3', category: '25m-y11', title: 'Quadratic Sequences (3)', titleZh: '二次数列 (3)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Second difference"},{id:"0",type:"def",content:"二阶差分"},
    {id:"1",type:"word",content:"Sequence"},{id:"1",type:"def",content:"数列"},
    {id:"2",type:"word",content:"Simultaneous equations"},{id:"2",type:"def",content:"联立方程"},
    {id:"3",type:"word",content:"Substitute"},{id:"3",type:"def",content:"代入"},
    {id:"4",type:"word",content:"Term"},{id:"4",type:"def",content:"项"},
    {id:"5",type:"word",content:"Value"},{id:"5",type:"def",content:"值"}
  ]
},

{
  board: '25m', slug: '25m-y11-functions-1', category: '25m-y11', title: 'Functions (1)', titleZh: '函数 (1)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Composite Function"},{id:"0",type:"def",content:"复合函数"},
    {id:"1",type:"word",content:"Cubic Function"},{id:"1",type:"def",content:"三次函数"},
    {id:"2",type:"word",content:"Domain"},{id:"2",type:"def",content:"定义域"},
    {id:"3",type:"word",content:"Equation"},{id:"3",type:"def",content:"方程"},
    {id:"4",type:"word",content:"Exponential Function"},{id:"4",type:"def",content:"指数函数"},
    {id:"5",type:"word",content:"Function"},{id:"5",type:"def",content:"函数"},
    {id:"6",type:"word",content:"Function Notation"},{id:"6",type:"def",content:"函数符号"},
    {id:"7",type:"word",content:"Graph"},{id:"7",type:"def",content:"图像"},
    {id:"8",type:"word",content:"Independent Variable"},{id:"8",type:"def",content:"自变量"},
    {id:"9",type:"word",content:"Inverse Function"},{id:"9",type:"def",content:"反函数"}
  ]
},

{
  board: '25m', slug: '25m-y11-functions-2', category: '25m-y11', title: 'Functions (2)', titleZh: '函数 (2)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Linear Function"},{id:"0",type:"def",content:"线性函数"},
    {id:"1",type:"word",content:"Quadratic Function"},{id:"1",type:"def",content:"二次函数"},
    {id:"2",type:"word",content:"Range"},{id:"2",type:"def",content:"值域"},
    {id:"3",type:"word",content:"Reciprocal Function"},{id:"3",type:"def",content:"倒数函数"},
    {id:"4",type:"word",content:"Solution"},{id:"4",type:"def",content:"解"}
  ]
},

{
  board: '25m', slug: '25m-y11-differentiation-1', category: '25m-y11', title: 'Differentiation (1)', titleZh: '微分 (1)', unitNum: 6, unitTitle: 'Differentiation', unitTitleZh: '微分',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Curve"},{id:"0",type:"def",content:"曲线"},
    {id:"1",type:"word",content:"Derivative"},{id:"1",type:"def",content:"导数"},
    {id:"2",type:"word",content:"Derived function"},{id:"2",type:"def",content:"导函数"},
    {id:"3",type:"word",content:"Differentiation"},{id:"3",type:"def",content:"微分"},
    {id:"4",type:"word",content:"Function"},{id:"4",type:"def",content:"函数"},
    {id:"5",type:"word",content:"Gradient"},{id:"5",type:"def",content:"梯度 / 斜率"},
    {id:"6",type:"word",content:"Maximum point"},{id:"6",type:"def",content:"最大值点"},
    {id:"7",type:"word",content:"Minimum point"},{id:"7",type:"def",content:"最小值点"},
    {id:"8",type:"word",content:"Power rule"},{id:"8",type:"def",content:"幂法则"},
    {id:"9",type:"word",content:"Rate of change"},{id:"9",type:"def",content:"变化率"}
  ]
},

{
  board: '25m', slug: '25m-y11-differentiation-2', category: '25m-y11', title: 'Differentiation (2)', titleZh: '微分 (2)', unitNum: 6, unitTitle: 'Differentiation', unitTitleZh: '微分',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Second derivative"},{id:"0",type:"def",content:"二阶导数"},
    {id:"1",type:"word",content:"Stationary point"},{id:"1",type:"def",content:"驻点"},
    {id:"2",type:"word",content:"Tangent"},{id:"2",type:"def",content:"切线"},
    {id:"3",type:"word",content:"Turning point"},{id:"3",type:"def",content:"转折点 / 驻点"}
  ]
},

{
  board: '25m', slug: '25m-y11-further-trigonometry-1', category: '25m-y11', title: 'Further Trigonometry (1)', titleZh: '进阶三角学 (1)', unitNum: 7, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Acute angle"},{id:"0",type:"def",content:"锐角"},
    {id:"1",type:"word",content:"Altitude"},{id:"1",type:"def",content:"高"},
    {id:"2",type:"word",content:"Angle between a line and a plane"},{id:"2",type:"def",content:"直线与平面夹角"},
    {id:"3",type:"word",content:"Area of a triangle"},{id:"3",type:"def",content:"三角形面积"},
    {id:"4",type:"word",content:"Bearing"},{id:"4",type:"def",content:"方位角"},
    {id:"5",type:"word",content:"Cosine Rule"},{id:"5",type:"def",content:"余弦定理"},
    {id:"6",type:"word",content:"Included angle"},{id:"6",type:"def",content:"夹角"},
    {id:"7",type:"word",content:"Line and plane"},{id:"7",type:"def",content:"直线与平面"},
    {id:"8",type:"word",content:"Non-right-angled triangle"},{id:"8",type:"def",content:"任意三角形 / 非直角三角形"},
    {id:"9",type:"word",content:"Obtuse angle"},{id:"9",type:"def",content:"钝角"}
  ]
},

{
  board: '25m', slug: '25m-y11-further-trigonometry-2', category: '25m-y11', title: 'Further Trigonometry (2)', titleZh: '进阶三角学 (2)', unitNum: 7, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Projection"},{id:"0",type:"def",content:"投影"},
    {id:"1",type:"word",content:"Side length"},{id:"1",type:"def",content:"边长"},
    {id:"2",type:"word",content:"Sine Rule"},{id:"2",type:"def",content:"正弦定理"},
    {id:"3",type:"word",content:"Three-dimensional"},{id:"3",type:"def",content:"三维"},
    {id:"4",type:"word",content:"Vertex"},{id:"4",type:"def",content:"顶点"}
  ]
},

{
  board: '25m', slug: '25m-y11-graphs-of-trigonometric-functi-1', category: '25m-y11', title: 'Graphs of Trigonometric Functions (1)', titleZh: '三角函数图像 (1)', unitNum: 8, unitTitle: 'Graphs of Trigonometric Functions', unitTitleZh: '三角函数图像',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Amplitude"},{id:"0",type:"def",content:"振幅"},
    {id:"1",type:"word",content:"Asymptote"},{id:"1",type:"def",content:"渐近线"},
    {id:"2",type:"word",content:"Cosine function"},{id:"2",type:"def",content:"余弦函数"},
    {id:"3",type:"word",content:"Domain"},{id:"3",type:"def",content:"定义域"},
    {id:"4",type:"word",content:"Equilibrium position"},{id:"4",type:"def",content:"平衡位置"},
    {id:"5",type:"word",content:"Intercept"},{id:"5",type:"def",content:"截距"},
    {id:"6",type:"word",content:"Maximum value"},{id:"6",type:"def",content:"最大值"},
    {id:"7",type:"word",content:"Minimum value"},{id:"7",type:"def",content:"最小值"},
    {id:"8",type:"word",content:"Period"},{id:"8",type:"def",content:"周期"},
    {id:"9",type:"word",content:"Phase shift"},{id:"9",type:"def",content:"相位移"}
  ]
},

{
  board: '25m', slug: '25m-y11-graphs-of-trigonometric-functi-2', category: '25m-y11', title: 'Graphs of Trigonometric Functions (2)', titleZh: '三角函数图像 (2)', unitNum: 8, unitTitle: 'Graphs of Trigonometric Functions', unitTitleZh: '三角函数图像',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Range"},{id:"0",type:"def",content:"值域"},
    {id:"1",type:"word",content:"Sine function"},{id:"1",type:"def",content:"正弦函数"},
    {id:"2",type:"word",content:"Tangent function"},{id:"2",type:"def",content:"正切函数"},
    {id:"3",type:"word",content:"Trigonometric function"},{id:"3",type:"def",content:"三角函数"},
    {id:"4",type:"word",content:"Vertical shift"},{id:"4",type:"def",content:"垂直平移"}
  ]
},

{
  board: '25m', slug: '25m-y11-regions-inequalities-1', category: '25m-y11', title: 'Regions & Inequalities (1)', titleZh: '区域与不等式 (1)', unitNum: 9, unitTitle: 'Regions & Inequalities', unitTitleZh: '区域与不等式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Boundary Line"},{id:"0",type:"def",content:"边界线"},
    {id:"1",type:"word",content:"Bounded Region"},{id:"1",type:"def",content:"有界区域"},
    {id:"2",type:"word",content:"Coordinate Plane"},{id:"2",type:"def",content:"坐标平面"},
    {id:"3",type:"word",content:"Feasible Region"},{id:"3",type:"def",content:"可行域"},
    {id:"4",type:"word",content:"Inequality"},{id:"4",type:"def",content:"不等式"},
    {id:"5",type:"word",content:"Intersection"},{id:"5",type:"def",content:"交点/交集"},
    {id:"6",type:"word",content:"Linear Inequality"},{id:"6",type:"def",content:"线性不等式"},
    {id:"7",type:"word",content:"Maximum Value"},{id:"7",type:"def",content:"最大值"},
    {id:"8",type:"word",content:"Minimum Value"},{id:"8",type:"def",content:"最小值"},
    {id:"9",type:"word",content:"Objective Function"},{id:"9",type:"def",content:"目标函数"}
  ]
},

{
  board: '25m', slug: '25m-y11-regions-inequalities-2', category: '25m-y11', title: 'Regions & Inequalities (2)', titleZh: '区域与不等式 (2)', unitNum: 9, unitTitle: 'Regions & Inequalities', unitTitleZh: '区域与不等式',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Region"},{id:"0",type:"def",content:"区域"},
    {id:"1",type:"word",content:"Shaded Region"},{id:"1",type:"def",content:"阴影区域"},
    {id:"2",type:"word",content:"Solution Set"},{id:"2",type:"def",content:"解集"},
    {id:"3",type:"word",content:"System of Inequalities"},{id:"3",type:"def",content:"不等式组"},
    {id:"4",type:"word",content:"Vertices"},{id:"4",type:"def",content:"顶点"}
  ]
},

{
  board: '25m', slug: '25m-y11-vectors-1', category: '25m-y11', title: 'Vectors (1)', titleZh: '向量 (1)', unitNum: 10, unitTitle: 'Vectors', unitTitleZh: '向量',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Column vector"},{id:"0",type:"def",content:"列向量"},
    {id:"1",type:"word",content:"Components"},{id:"1",type:"def",content:"分量"},
    {id:"2",type:"word",content:"Coplanar vectors"},{id:"2",type:"def",content:"共面向量"},
    {id:"3",type:"word",content:"Directed line segment"},{id:"3",type:"def",content:"有向线段"},
    {id:"4",type:"word",content:"Direction"},{id:"4",type:"def",content:"方向"},
    {id:"5",type:"word",content:"Magnitude"},{id:"5",type:"def",content:"大小/模"},
    {id:"6",type:"word",content:"Origin"},{id:"6",type:"def",content:"原点"},
    {id:"7",type:"word",content:"Parallel vectors"},{id:"7",type:"def",content:"平行向量"},
    {id:"8",type:"word",content:"Position vector"},{id:"8",type:"def",content:"位置向量"},
    {id:"9",type:"word",content:"Resultant vector"},{id:"9",type:"def",content:"合向量"}
  ]
},

{
  board: '25m', slug: '25m-y11-vectors-2', category: '25m-y11', title: 'Vectors (2)', titleZh: '向量 (2)', unitNum: 10, unitTitle: 'Vectors', unitTitleZh: '向量',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Scalar"},{id:"0",type:"def",content:"标量"},
    {id:"1",type:"word",content:"Translation"},{id:"1",type:"def",content:"平移"},
    {id:"2",type:"word",content:"Unit vector"},{id:"2",type:"def",content:"单位向量"},
    {id:"3",type:"word",content:"Vector"},{id:"3",type:"def",content:"向量"},
    {id:"4",type:"word",content:"Zero vector"},{id:"4",type:"def",content:"零向量"}
  ]
},

{
  board: '25m', slug: '25m-y11-statistics-and-probability-1', category: '25m-y11', title: 'Statistics and Probability (1)', titleZh: '统计与概率 (1)', unitNum: 11, unitTitle: 'Statistics and Probability', unitTitleZh: '统计与概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"0",type:"word",content:"Bivariate data"},{id:"0",type:"def",content:"双变量数据"},
    {id:"1",type:"word",content:"Correlation"},{id:"1",type:"def",content:"相关性"},
    {id:"2",type:"word",content:"Cumulative frequency"},{id:"2",type:"def",content:"累积频率"},
    {id:"3",type:"word",content:"Cumulative frequency curve"},{id:"3",type:"def",content:"累积频率曲线"},
    {id:"4",type:"word",content:"Interquartile range (IQR)"},{id:"4",type:"def",content:"四分位距"},
    {id:"5",type:"word",content:"Line of best fit"},{id:"5",type:"def",content:"最佳拟合线"},
    {id:"6",type:"word",content:"Lower quartile"},{id:"6",type:"def",content:"下四分位数"},
    {id:"7",type:"word",content:"Median"},{id:"7",type:"def",content:"中位数"},
    {id:"8",type:"word",content:"Negative correlation"},{id:"8",type:"def",content:"负相关"},
    {id:"9",type:"word",content:"No correlation"},{id:"9",type:"def",content:"无相关"}
  ]
},

{
  board: '25m', slug: '25m-y11-statistics-and-probability-2', category: '25m-y11', title: 'Statistics and Probability (2)', titleZh: '统计与概率 (2)', unitNum: 11, unitTitle: 'Statistics and Probability', unitTitleZh: '统计与概率',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Outlier"},{id:"0",type:"def",content:"异常值"},
    {id:"1",type:"word",content:"Percentile"},{id:"1",type:"def",content:"百分位数"},
    {id:"2",type:"word",content:"Positive correlation"},{id:"2",type:"def",content:"正相关"},
    {id:"3",type:"word",content:"Scatter diagram"},{id:"3",type:"def",content:"散点图"},
    {id:"4",type:"word",content:"Upper quartile"},{id:"4",type:"def",content:"上四分位数"}
  ]
}



];
