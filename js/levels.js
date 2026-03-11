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

/* ═══ Year 7 (31 levels, 257 words) ═══ */,
{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-1', category: '25m-y7', title: 'Multiplication of Fractions (1)', titleZh: '分数的乘法 (1)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"addition",type:"word",content:"Addition"},    {id:"addition",type:"def",content:"加法"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"bidmas-pemdas",type:"word",content:"BIDMAS / PEMDAS"},    {id:"bidmas-pemdas",type:"def",content:"运算顺序 (BIDMAS / PEMDAS)"},    {id:"common-denominator",type:"word",content:"Common denominator"},    {id:"common-denominator",type:"def",content:"公分母"},    {id:"common-factor",type:"word",content:"Common factor"},    {id:"common-factor",type:"def",content:"公因数"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"decimal-places",type:"word",content:"Decimal places"},    {id:"decimal-places",type:"def",content:"小数位数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"equivalent-fractions",type:"word",content:"Equivalent fractions"},    {id:"equivalent-fractions",type:"def",content:"等价分数"}
  ]
},
{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-2', category: '25m-y7', title: 'Multiplication of Fractions (2)', titleZh: '分数的乘法 (2)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"improper-fraction",type:"word",content:"Improper fraction"},    {id:"improper-fraction",type:"def",content:"假分数"},    {id:"mixed-number",type:"word",content:"Mixed number"},    {id:"mixed-number",type:"def",content:"带分数"},    {id:"multiplication",type:"word",content:"Multiplication"},    {id:"multiplication",type:"def",content:"乘法"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"of-implies-multiplication",type:"word",content:"Of (implies multiplication)"},    {id:"of-implies-multiplication",type:"def",content:"的 (表示乘法)"},    {id:"order-of-operations",type:"word",content:"Order of operations"},    {id:"order-of-operations",type:"def",content:"运算顺序"},    {id:"pre-cancelling",type:"word",content:"Pre-cancelling"},    {id:"pre-cancelling",type:"def",content:"预先约分"},    {id:"problem-solving",type:"word",content:"Problem solving"},    {id:"problem-solving",type:"def",content:"解决问题"}
  ]
},
{
  board: '25m', slug: '25m-y7-multiplication-of-fractions-3', category: '25m-y7', title: 'Multiplication of Fractions (3)', titleZh: '分数的乘法 (3)', unitNum: 1, unitTitle: 'Multiplication of Fractions', unitTitleZh: '分数的乘法',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"product",type:"word",content:"Product"},    {id:"product",type:"def",content:"乘积"},    {id:"reciprocal",type:"word",content:"Reciprocal"},    {id:"reciprocal",type:"def",content:"倒数"},    {id:"rounding",type:"word",content:"Rounding"},    {id:"rounding",type:"def",content:"四舍五入"},    {id:"significant-figures",type:"word",content:"Significant figures"},    {id:"significant-figures",type:"def",content:"有效数字"},    {id:"simplest-form",type:"word",content:"Simplest form"},    {id:"simplest-form",type:"def",content:"最简形式"},    {id:"subtraction",type:"word",content:"Subtraction"},    {id:"subtraction",type:"def",content:"减法"},    {id:"volume",type:"word",content:"Volume"},    {id:"volume",type:"def",content:"体积"},    {id:"word-problem",type:"word",content:"Word problem"},    {id:"word-problem",type:"def",content:"应用题"}
  ]
},
{
  board: '25m', slug: '25m-y7-division-of-fraction-1', category: '25m-y7', title: 'Division of Fraction (1)', titleZh: '分数的除法 (1)', unitNum: 2, unitTitle: 'Division of Fraction', unitTitleZh: '分数的除法',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"brackets",type:"word",content:"Brackets"},    {id:"brackets",type:"def",content:"括号"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"division",type:"word",content:"Division"},    {id:"division",type:"def",content:"除法"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"improper-fraction",type:"word",content:"Improper Fraction"},    {id:"improper-fraction",type:"def",content:"假分数"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"mixed-number",type:"word",content:"Mixed Number"},    {id:"mixed-number",type:"def",content:"带分数"},    {id:"multiplicative-inverse",type:"word",content:"Multiplicative Inverse"},    {id:"multiplicative-inverse",type:"def",content:"乘法逆元"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"order-of-operations",type:"word",content:"Order of Operations"},    {id:"order-of-operations",type:"def",content:"运算顺序"}
  ]
},
{
  board: '25m', slug: '25m-y7-division-of-fraction-2', category: '25m-y7', title: 'Division of Fraction (2)', titleZh: '分数的除法 (2)', unitNum: 2, unitTitle: 'Division of Fraction', unitTitleZh: '分数的除法',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"reciprocal",type:"word",content:"Reciprocal"},    {id:"reciprocal",type:"def",content:"倒数"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"化简"},    {id:"word-problem",type:"word",content:"Word Problem"},    {id:"word-problem",type:"def",content:"应用题"}
  ]
},
{
  board: '25m', slug: '25m-y7-negative-number-1', category: '25m-y7', title: 'Negative Number (1)', titleZh: '负数 (1)', unitNum: 3, unitTitle: 'Negative Number', unitTitleZh: '负数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"absolute-value",type:"word",content:"Absolute value"},    {id:"absolute-value",type:"def",content:"绝对值"},    {id:"addition",type:"word",content:"Addition"},    {id:"addition",type:"def",content:"加法"},    {id:"division",type:"word",content:"Division"},    {id:"division",type:"def",content:"除法"},    {id:"greater-than",type:"word",content:"Greater than"},    {id:"greater-than",type:"def",content:"大于"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"less-than",type:"word",content:"Less than"},    {id:"less-than",type:"def",content:"小于"},    {id:"multiplication",type:"word",content:"Multiplication"},    {id:"multiplication",type:"def",content:"乘法"},    {id:"negative-number",type:"word",content:"Negative number"},    {id:"negative-number",type:"def",content:"负数"},    {id:"number-line",type:"word",content:"Number line"},    {id:"number-line",type:"def",content:"数轴"},    {id:"opposite-number",type:"word",content:"Opposite number"},    {id:"opposite-number",type:"def",content:"相反数"}
  ]
},
{
  board: '25m', slug: '25m-y7-negative-number-2', category: '25m-y7', title: 'Negative Number (2)', titleZh: '负数 (2)', unitNum: 3, unitTitle: 'Negative Number', unitTitleZh: '负数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"positive-number",type:"word",content:"Positive number"},    {id:"positive-number",type:"def",content:"正数"},    {id:"sea-level",type:"word",content:"Sea level"},    {id:"sea-level",type:"def",content:"海平面"},    {id:"subtraction",type:"word",content:"Subtraction"},    {id:"subtraction",type:"def",content:"减法"},    {id:"temperature",type:"word",content:"Temperature"},    {id:"temperature",type:"def",content:"温度"},    {id:"zero",type:"word",content:"Zero"},    {id:"zero",type:"def",content:"零"}
  ]
},
{
  board: '25m', slug: '25m-y7-position-and-direction-1', category: '25m-y7', title: 'Position and Direction (1)', titleZh: '位置和方向 (1)', unitNum: 4, unitTitle: 'Position and Direction', unitTitleZh: '位置和方向',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"bearing",type:"word",content:"Bearing"},    {id:"bearing",type:"def",content:"方位角"},    {id:"clockwise",type:"word",content:"Clockwise"},    {id:"clockwise",type:"def",content:"顺时针"},    {id:"compass",type:"word",content:"Compass"},    {id:"compass",type:"def",content:"指南针"},    {id:"coordinate",type:"word",content:"Coordinate"},    {id:"coordinate",type:"def",content:"坐标"},    {id:"horizontal",type:"word",content:"Horizontal"},    {id:"horizontal",type:"def",content:"水平的"},    {id:"length",type:"word",content:"Length"},    {id:"length",type:"def",content:"长度"},    {id:"line-segment",type:"word",content:"Line segment"},    {id:"line-segment",type:"def",content:"线段"},    {id:"midpoint",type:"word",content:"Midpoint"},    {id:"midpoint",type:"def",content:"中点"},    {id:"ordered-pair",type:"word",content:"Ordered pair"},    {id:"ordered-pair",type:"def",content:"有序对"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"}
  ]
},
{
  board: '25m', slug: '25m-y7-position-and-direction-2', category: '25m-y7', title: 'Position and Direction (2)', titleZh: '位置和方向 (2)', unitNum: 4, unitTitle: 'Position and Direction', unitTitleZh: '位置和方向',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"plot",type:"word",content:"Plot"},    {id:"plot",type:"def",content:"描点/绘制"},    {id:"quadrant",type:"word",content:"Quadrant"},    {id:"quadrant",type:"def",content:"象限"},    {id:"vertical",type:"word",content:"Vertical"},    {id:"vertical",type:"def",content:"垂直的"},    {id:"x-axis",type:"word",content:"X-axis"},    {id:"x-axis",type:"def",content:"X轴"},    {id:"y-axis",type:"word",content:"Y-axis"},    {id:"y-axis",type:"def",content:"Y轴"}
  ]
},
{
  board: '25m', slug: '25m-y7-ratio-and-proportion-1', category: '25m-y7', title: 'Ratio and Proportion (1)', titleZh: '比率和比例 (1)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"colon",type:"word",content:"Colon"},    {id:"colon",type:"def",content:"冒号"},    {id:"constant-of-proportionality",type:"word",content:"Constant of proportionality"},    {id:"constant-of-proportionality",type:"def",content:"比例常数"},    {id:"corresponding",type:"word",content:"Corresponding"},    {id:"corresponding",type:"def",content:"对应的"},    {id:"direct-proportion",type:"word",content:"Direct proportion"},    {id:"direct-proportion",type:"def",content:"正比例"},    {id:"division",type:"word",content:"Division"},    {id:"division",type:"def",content:"除法"},    {id:"equivalent",type:"word",content:"Equivalent"},    {id:"equivalent",type:"def",content:"等价的"},    {id:"equivalent-ratio",type:"word",content:"Equivalent ratio"},    {id:"equivalent-ratio",type:"def",content:"等价比率"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估计"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图表"}
  ]
},
{
  board: '25m', slug: '25m-y7-ratio-and-proportion-2', category: '25m-y7', title: 'Ratio and Proportion (2)', titleZh: '比率和比例 (2)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"map",type:"word",content:"Map"},    {id:"map",type:"def",content:"地图"},    {id:"part",type:"word",content:"Part"},    {id:"part",type:"def",content:"部分"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例"},    {id:"proportional-relationship",type:"word",content:"Proportional relationship"},    {id:"proportional-relationship",type:"def",content:"比例关系"},    {id:"quantity",type:"word",content:"Quantity"},    {id:"quantity",type:"def",content:"数量"},    {id:"rate",type:"word",content:"Rate"},    {id:"rate",type:"def",content:"比率/速率"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比率"},    {id:"scale-ratio",type:"word",content:"Scale"},    {id:"scale-ratio",type:"def",content:"比例尺"},    {id:"share",type:"word",content:"Share"},    {id:"share",type:"def",content:"分享"},    {id:"simplest-form",type:"word",content:"Simplest form"},    {id:"simplest-form",type:"def",content:"最简形式"}
  ]
},
{
  board: '25m', slug: '25m-y7-ratio-and-proportion-3', category: '25m-y7', title: 'Ratio and Proportion (3)', titleZh: '比率和比例 (3)', unitNum: 5, unitTitle: 'Ratio and Proportion', unitTitleZh: '比率和比例',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"total",type:"word",content:"Total"},    {id:"total",type:"def",content:"总数"},    {id:"unitary-method",type:"word",content:"Unitary method"},    {id:"unitary-method",type:"def",content:"单位法"},    {id:"units",type:"word",content:"Units"},    {id:"units",type:"def",content:"单位"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y7-percentage-1', category: '25m-y7', title: 'Percentage (1)', titleZh: '百分比 (1)', unitNum: 6, unitTitle: 'Percentage', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"convert",type:"word",content:"Convert"},    {id:"convert",type:"def",content:"转换"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"decrease",type:"word",content:"Decrease"},    {id:"decrease",type:"def",content:"减少"},    {id:"discount",type:"word",content:"Discount"},    {id:"discount",type:"def",content:"折扣"},    {id:"equivalent",type:"word",content:"Equivalent"},    {id:"equivalent",type:"def",content:"等价的"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"increase",type:"word",content:"Increase"},    {id:"increase",type:"def",content:"增加"},    {id:"interest",type:"word",content:"Interest"},    {id:"interest",type:"def",content:"利息"},    {id:"loss",type:"word",content:"Loss"},    {id:"loss",type:"def",content:"亏损"},    {id:"per-cent",type:"word",content:"Per cent"},    {id:"per-cent",type:"def",content:"百分之"}
  ]
},
{
  board: '25m', slug: '25m-y7-percentage-2', category: '25m-y7', title: 'Percentage (2)', titleZh: '百分比 (2)', unitNum: 6, unitTitle: 'Percentage', unitTitleZh: '百分比',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"percentage",type:"word",content:"Percentage"},    {id:"percentage",type:"def",content:"百分比"},    {id:"profit",type:"word",content:"Profit"},    {id:"profit",type:"def",content:"利润"},    {id:"quantity",type:"word",content:"Quantity"},    {id:"quantity",type:"def",content:"数量"},    {id:"tax",type:"word",content:"Tax"},    {id:"tax",type:"def",content:"税"},    {id:"whole",type:"word",content:"Whole"},    {id:"whole",type:"def",content:"整体"}
  ]
},
{
  board: '25m', slug: '25m-y7-circle-1', category: '25m-y7', title: 'Circle (1)', titleZh: '圆 (1)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角度"},    {id:"arc",type:"word",content:"Arc"},    {id:"arc",type:"def",content:"弧"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"axis",type:"word",content:"Axis"},    {id:"axis",type:"def",content:"坐标轴"},    {id:"bar-chart",type:"word",content:"Bar Chart"},    {id:"bar-chart",type:"def",content:"条形图"},    {id:"bias",type:"word",content:"Bias"},    {id:"bias",type:"def",content:"偏差"},    {id:"category",type:"word",content:"Category"},    {id:"category",type:"def",content:"类别"},    {id:"centre",type:"word",content:"Centre"},    {id:"centre",type:"def",content:"圆心"},    {id:"chart",type:"word",content:"Chart"},    {id:"chart",type:"def",content:"图表"},    {id:"chord",type:"word",content:"Chord"},    {id:"chord",type:"def",content:"弦"}
  ]
},
{
  board: '25m', slug: '25m-y7-circle-2', category: '25m-y7', title: 'Circle (2)', titleZh: '圆 (2)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"circle",type:"word",content:"Circle"},    {id:"circle",type:"def",content:"圆"},    {id:"circumference",type:"word",content:"Circumference"},    {id:"circumference",type:"def",content:"周长"},    {id:"class-interval",type:"word",content:"Class Interval"},    {id:"class-interval",type:"def",content:"组距"},    {id:"collection",type:"word",content:"Collection"},    {id:"collection",type:"def",content:"收集"},    {id:"compass",type:"word",content:"Compass"},    {id:"compass",type:"def",content:"圆规"},    {id:"continuous-data",type:"word",content:"Continuous Data"},    {id:"continuous-data",type:"def",content:"连续数据"},    {id:"data",type:"word",content:"Data"},    {id:"data",type:"def",content:"数据"},    {id:"data-representation",type:"word",content:"Data Representation"},    {id:"data-representation",type:"def",content:"数据表示"},    {id:"degrees",type:"word",content:"Degrees"},    {id:"degrees",type:"def",content:"度数"},    {id:"diameter",type:"word",content:"Diameter"},    {id:"diameter",type:"def",content:"直径"}
  ]
},
{
  board: '25m', slug: '25m-y7-circle-3', category: '25m-y7', title: 'Circle (3)', titleZh: '圆 (3)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"discrete-data",type:"word",content:"Discrete Data"},    {id:"discrete-data",type:"def",content:"离散数据"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"frequency",type:"word",content:"Frequency"},    {id:"frequency",type:"def",content:"频率"},    {id:"frequency-table",type:"word",content:"Frequency Table"},    {id:"frequency-table",type:"def",content:"频率表"},    {id:"interpretation",type:"word",content:"Interpretation"},    {id:"interpretation",type:"def",content:"解释"},    {id:"key",type:"word",content:"Key"},    {id:"key",type:"def",content:"图例"},    {id:"line-chart",type:"word",content:"Line Chart"},    {id:"line-chart",type:"def",content:"折线图"},    {id:"misleading",type:"word",content:"Misleading"},    {id:"misleading",type:"def",content:"误导性"},    {id:"organise",type:"word",content:"Organise"},    {id:"organise",type:"def",content:"组织"}
  ]
},
{
  board: '25m', slug: '25m-y7-circle-4', category: '25m-y7', title: 'Circle (4)', titleZh: '圆 (4)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"percentage",type:"word",content:"Percentage"},    {id:"percentage",type:"def",content:"百分比"},    {id:"pi",type:"word",content:"Pi (π)"},    {id:"pi",type:"def",content:"圆周率"},    {id:"pictogram",type:"word",content:"Pictogram"},    {id:"pictogram",type:"def",content:"象形图"},    {id:"pie-chart",type:"word",content:"Pie Chart"},    {id:"pie-chart",type:"def",content:"饼图"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例"},    {id:"qualitative-data",type:"word",content:"Qualitative Data"},    {id:"qualitative-data",type:"def",content:"定性数据"},    {id:"quantitative-data",type:"word",content:"Quantitative Data"},    {id:"quantitative-data",type:"def",content:"定量数据"},    {id:"questionnaire",type:"word",content:"Questionnaire"},    {id:"questionnaire",type:"def",content:"问卷"},    {id:"radius",type:"word",content:"Radius"},    {id:"radius",type:"def",content:"半径"},    {id:"raw-data",type:"word",content:"Raw Data"},    {id:"raw-data",type:"def",content:"原始数据"}
  ]
},
{
  board: '25m', slug: '25m-y7-circle-5', category: '25m-y7', title: 'Circle (5)', titleZh: '圆 (5)', unitNum: 7, unitTitle: 'Circle', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"represent",type:"word",content:"Represent"},    {id:"represent",type:"def",content:"表示"},    {id:"scale-reading",type:"word",content:"Scale"},    {id:"scale-reading",type:"def",content:"刻度"},    {id:"sector",type:"word",content:"Sector"},    {id:"sector",type:"def",content:"扇形"},    {id:"segment",type:"word",content:"Segment"},    {id:"segment",type:"def",content:"弓形"},    {id:"survey",type:"word",content:"Survey"},    {id:"survey",type:"def",content:"调查"},    {id:"tally-mark",type:"word",content:"Tally Mark"},    {id:"tally-mark",type:"def",content:"正字标记"},    {id:"tangent-line",type:"word",content:"Tangent"},    {id:"tangent-line",type:"def",content:"切线"},    {id:"title",type:"word",content:"Title"},    {id:"title",type:"def",content:"标题"},    {id:"total",type:"word",content:"Total"},    {id:"total",type:"def",content:"总数"}
  ]
},
{
  board: '25m', slug: '25m-y7-cylinders-and-cones-1', category: '25m-y7', title: 'Cylinders and Cones (1)', titleZh: '圆柱和圆锥 (1)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"apex",type:"word",content:"Apex"},    {id:"apex",type:"def",content:"顶点"},    {id:"arc",type:"word",content:"Arc"},    {id:"arc",type:"def",content:"弧"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"base-face",type:"word",content:"Base"},    {id:"base-face",type:"def",content:"底面"},    {id:"calculate",type:"word",content:"Calculate"},    {id:"calculate",type:"def",content:"计算"},    {id:"capacity",type:"word",content:"Capacity"},    {id:"capacity",type:"def",content:"容量"},    {id:"centre",type:"word",content:"Centre"},    {id:"centre",type:"def",content:"圆心"},    {id:"chord",type:"word",content:"Chord"},    {id:"chord",type:"def",content:"弦"},    {id:"circle",type:"word",content:"Circle"},    {id:"circle",type:"def",content:"圆"},    {id:"circumference",type:"word",content:"Circumference"},    {id:"circumference",type:"def",content:"周长"}
  ]
},
{
  board: '25m', slug: '25m-y7-cylinders-and-cones-2', category: '25m-y7', title: 'Cylinders and Cones (2)', titleZh: '圆柱和圆锥 (2)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"cone",type:"word",content:"Cone"},    {id:"cone",type:"def",content:"圆锥"},    {id:"convert",type:"word",content:"Convert"},    {id:"convert",type:"def",content:"转换"},    {id:"cubic-centimetre-cm",type:"word",content:"Cubic centimetre (cm³)"},    {id:"cubic-centimetre-cm",type:"def",content:"立方厘米"},    {id:"cubic-metre-m",type:"word",content:"Cubic metre (m³)"},    {id:"cubic-metre-m",type:"def",content:"立方米"},    {id:"cubic-unit",type:"word",content:"Cubic unit"},    {id:"cubic-unit",type:"def",content:"立方单位"},    {id:"curved-surface",type:"word",content:"Curved surface"},    {id:"curved-surface",type:"def",content:"曲面"},    {id:"cylinder",type:"word",content:"Cylinder"},    {id:"cylinder",type:"def",content:"圆柱"},    {id:"deduction",type:"word",content:"Deduction"},    {id:"deduction",type:"def",content:"推导"},    {id:"diameter",type:"word",content:"Diameter"},    {id:"diameter",type:"def",content:"直径"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估算"}
  ]
},
{
  board: '25m', slug: '25m-y7-cylinders-and-cones-3', category: '25m-y7', title: 'Cylinders and Cones (3)', titleZh: '圆柱和圆锥 (3)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"flat-surface",type:"word",content:"Flat surface"},    {id:"flat-surface",type:"def",content:"平面"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"height",type:"word",content:"Height"},    {id:"height",type:"def",content:"高"},    {id:"lateral-surface-area",type:"word",content:"Lateral surface area"},    {id:"lateral-surface-area",type:"def",content:"侧面积"},    {id:"litre-l",type:"word",content:"Litre (L)"},    {id:"litre-l",type:"def",content:"升"},    {id:"metric-units",type:"word",content:"Metric units"},    {id:"metric-units",type:"def",content:"公制单位"},    {id:"millilitre-ml",type:"word",content:"Millilitre (ml)"},    {id:"millilitre-ml",type:"def",content:"毫升"},    {id:"model",type:"word",content:"Model"},    {id:"model",type:"def",content:"模型"},    {id:"net",type:"word",content:"Net"},    {id:"net",type:"def",content:"展开图"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"}
  ]
},
{
  board: '25m', slug: '25m-y7-cylinders-and-cones-4', category: '25m-y7', title: 'Cylinders and Cones (4)', titleZh: '圆柱和圆锥 (4)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"pi",type:"word",content:"Pi (π)"},    {id:"pi",type:"def",content:"圆周率"},    {id:"problem-solving",type:"word",content:"Problem-solving"},    {id:"problem-solving",type:"def",content:"解决问题"},    {id:"radius",type:"word",content:"Radius"},    {id:"radius",type:"def",content:"半径"},    {id:"sector",type:"word",content:"Sector"},    {id:"sector",type:"def",content:"扇形"},    {id:"segment",type:"word",content:"Segment"},    {id:"segment",type:"def",content:"弓形"},    {id:"slant-height",type:"word",content:"Slant height"},    {id:"slant-height",type:"def",content:"斜高"},    {id:"solid",type:"word",content:"Solid"},    {id:"solid",type:"def",content:"立体图形"},    {id:"square-unit",type:"word",content:"Square unit"},    {id:"square-unit",type:"def",content:"平方单位"},    {id:"surface-area",type:"word",content:"Surface area"},    {id:"surface-area",type:"def",content:"表面积"},    {id:"three-dimensional-3d",type:"word",content:"Three-dimensional (3D)"},    {id:"three-dimensional-3d",type:"def",content:"三维"}
  ]
},
{
  board: '25m', slug: '25m-y7-cylinders-and-cones-5', category: '25m-y7', title: 'Cylinders and Cones (5)', titleZh: '圆柱和圆锥 (5)', unitNum: 8, unitTitle: 'Cylinders and Cones', unitTitleZh: '圆柱和圆锥',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"two-dimensional-2d",type:"word",content:"Two-dimensional (2D)"},    {id:"two-dimensional-2d",type:"def",content:"二维"},    {id:"volume",type:"word",content:"Volume"},    {id:"volume",type:"def",content:"体积"}
  ]
},
{
  board: '25m', slug: '25m-y7-linear-sequences-1', category: '25m-y7', title: 'Linear Sequences (1)', titleZh: '等差序列 (1)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"arithmetic-sequence",type:"word",content:"Arithmetic sequence"},    {id:"arithmetic-sequence",type:"def",content:"算术序列"},    {id:"common-difference",type:"word",content:"Common difference"},    {id:"common-difference",type:"def",content:"公差"},    {id:"derive",type:"word",content:"Derive"},    {id:"derive",type:"def",content:"推导"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"first-term",type:"word",content:"First term"},    {id:"first-term",type:"def",content:"首项"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"general-form",type:"word",content:"General form"},    {id:"general-form",type:"def",content:"一般形式"},    {id:"generate",type:"word",content:"Generate"},    {id:"generate",type:"def",content:"生成"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"}
  ]
},
{
  board: '25m', slug: '25m-y7-linear-sequences-2', category: '25m-y7', title: 'Linear Sequences (2)', titleZh: '等差序列 (2)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"linear-sequence",type:"word",content:"Linear sequence"},    {id:"linear-sequence",type:"def",content:"等差序列"},    {id:"nth-term",type:"word",content:"nth term"},    {id:"nth-term",type:"def",content:"第n项"},    {id:"nth-term-formula",type:"word",content:"nth term formula"},    {id:"nth-term-formula",type:"def",content:"第n项公式"},    {id:"pattern",type:"word",content:"Pattern"},    {id:"pattern",type:"def",content:"模式"},    {id:"position-term",type:"word",content:"Position"},    {id:"position-term",type:"def",content:"项数"},    {id:"position-to-term-rule",type:"word",content:"Position-to-term rule"},    {id:"position-to-term-rule",type:"def",content:"项数与项规则"},    {id:"sequence",type:"word",content:"Sequence"},    {id:"sequence",type:"def",content:"序列"},    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"spatial-pattern",type:"word",content:"Spatial pattern"},    {id:"spatial-pattern",type:"def",content:"空间模式"},    {id:"substitute",type:"word",content:"Substitute"},    {id:"substitute",type:"def",content:"代入"}
  ]
},
{
  board: '25m', slug: '25m-y7-linear-sequences-3', category: '25m-y7', title: 'Linear Sequences (3)', titleZh: '等差序列 (3)', unitNum: 9, unitTitle: 'Linear Sequences', unitTitleZh: '等差序列',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"term-number",type:"word",content:"Term number"},    {id:"term-number",type:"def",content:"项数"},    {id:"term-to-term-rule",type:"word",content:"Term-to-term rule"},    {id:"term-to-term-rule",type:"def",content:"项与项规律"},    {id:"verify",type:"word",content:"Verify"},    {id:"verify",type:"def",content:"验证"}
  ]
},
{
  board: '25m', slug: '25m-y7-probability-1', category: '25m-y7', title: 'Probability (1)', titleZh: '概率 (1)', unitNum: 10, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"certain-event",type:"word",content:"Certain Event"},    {id:"certain-event",type:"def",content:"必然事件"},    {id:"event",type:"word",content:"Event"},    {id:"event",type:"def",content:"事件"},    {id:"experimental-probability",type:"word",content:"Experimental Probability"},    {id:"experimental-probability",type:"def",content:"实验概率"},    {id:"fair",type:"word",content:"Fair"},    {id:"fair",type:"def",content:"公平的"},    {id:"frequency",type:"word",content:"Frequency"},    {id:"frequency",type:"def",content:"频率"},    {id:"impossible-event",type:"word",content:"Impossible Event"},    {id:"impossible-event",type:"def",content:"不可能事件"},    {id:"likely",type:"word",content:"Likely"},    {id:"likely",type:"def",content:"可能的"},    {id:"mutually-exclusive-events",type:"word",content:"Mutually Exclusive Events"},    {id:"mutually-exclusive-events",type:"def",content:"互斥事件"},    {id:"outcome",type:"word",content:"Outcome"},    {id:"outcome",type:"def",content:"结果"},    {id:"probability",type:"word",content:"Probability"},    {id:"probability",type:"def",content:"概率"}
  ]
},
{
  board: '25m', slug: '25m-y7-probability-2', category: '25m-y7', title: 'Probability (2)', titleZh: '概率 (2)', unitNum: 10, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"random",type:"word",content:"Random"},    {id:"random",type:"def",content:"随机的"},    {id:"sample-space",type:"word",content:"Sample Space"},    {id:"sample-space",type:"def",content:"样本空间"},    {id:"theoretical-probability",type:"word",content:"Theoretical Probability"},    {id:"theoretical-probability",type:"def",content:"理论概率"},    {id:"trial",type:"word",content:"Trial"},    {id:"trial",type:"def",content:"试验"},    {id:"unlikely",type:"word",content:"Unlikely"},    {id:"unlikely",type:"def",content:"不太可能的"}
  ]
},
{
  board: '25m', slug: '25m-y7-constructions-1', category: '25m-y7', title: 'Constructions (1)', titleZh: '作图 (1)', unitNum: 11, unitTitle: 'Constructions', unitTitleZh: '作图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角"},    {id:"angle-bisector",type:"word",content:"Angle bisector"},    {id:"angle-bisector",type:"def",content:"角平分线"},    {id:"arc",type:"word",content:"Arc"},    {id:"arc",type:"def",content:"弧"},    {id:"circle",type:"word",content:"Circle"},    {id:"circle",type:"def",content:"圆"},    {id:"compasses",type:"word",content:"Compasses"},    {id:"compasses",type:"def",content:"圆规"},    {id:"construction",type:"word",content:"Construction"},    {id:"construction",type:"def",content:"作图"},    {id:"equilateral-triangle",type:"word",content:"Equilateral triangle"},    {id:"equilateral-triangle",type:"def",content:"等边三角形"},    {id:"inscribe",type:"word",content:"Inscribe"},    {id:"inscribe",type:"def",content:"内接"},    {id:"line-segment",type:"word",content:"Line segment"},    {id:"line-segment",type:"def",content:"线段"},    {id:"locus",type:"word",content:"Locus"},    {id:"locus",type:"def",content:"轨迹"}
  ]
},
{
  board: '25m', slug: '25m-y7-constructions-2', category: '25m-y7', title: 'Constructions (2)', titleZh: '作图 (2)', unitNum: 11, unitTitle: 'Constructions', unitTitleZh: '作图',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"midpoint",type:"word",content:"Midpoint"},    {id:"midpoint",type:"def",content:"中点"},    {id:"perpendicular",type:"word",content:"Perpendicular"},    {id:"perpendicular",type:"def",content:"垂线/垂直的"},    {id:"perpendicular-bisector",type:"word",content:"Perpendicular bisector"},    {id:"perpendicular-bisector",type:"def",content:"垂直平分线"},    {id:"regular-polygon",type:"word",content:"Regular polygon"},    {id:"regular-polygon",type:"def",content:"正多边形"},    {id:"straight-edge",type:"word",content:"Straight edge"},    {id:"straight-edge",type:"def",content:"直尺"}
  ]
},

/* ═══ Year 8 (31 levels, 278 words) ═══ */,
{
  board: '25m', slug: '25m-y8-review-of-numbers-1', category: '25m-y8', title: 'Review of Numbers (1)', titleZh: '数的复习 (1)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"absolute-value",type:"word",content:"Absolute Value"},    {id:"absolute-value",type:"def",content:"绝对值"},    {id:"addition",type:"word",content:"Addition"},    {id:"addition",type:"def",content:"加法"},    {id:"approximation",type:"word",content:"Approximation"},    {id:"approximation",type:"def",content:"近似值"},    {id:"ascending-order",type:"word",content:"Ascending Order"},    {id:"ascending-order",type:"def",content:"升序"},    {id:"cancel",type:"word",content:"Cancel"},    {id:"cancel",type:"def",content:"约分"},    {id:"common-denominator",type:"word",content:"Common Denominator"},    {id:"common-denominator",type:"def",content:"公分母"},    {id:"common-factor",type:"word",content:"Common Factor"},    {id:"common-factor",type:"def",content:"公因数"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"decimal-place",type:"word",content:"Decimal Place"},    {id:"decimal-place",type:"def",content:"小数位"},    {id:"decimal-place-dp",type:"word",content:"Decimal Place (dp)"},    {id:"decimal-place-dp",type:"def",content:"小数位"}
  ]
},
{
  board: '25m', slug: '25m-y8-review-of-numbers-2', category: '25m-y8', title: 'Review of Numbers (2)', titleZh: '数的复习 (2)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"decimal-point",type:"word",content:"Decimal Point"},    {id:"decimal-point",type:"def",content:"小数点"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"descending-order",type:"word",content:"Descending Order"},    {id:"descending-order",type:"def",content:"降序"},    {id:"directed-number",type:"word",content:"Directed Number"},    {id:"directed-number",type:"def",content:"有方向的数"},    {id:"division",type:"word",content:"Division"},    {id:"division",type:"def",content:"除法"},    {id:"equivalent-calculation",type:"word",content:"Equivalent Calculation"},    {id:"equivalent-calculation",type:"def",content:"等效计算"},    {id:"equivalent-fraction",type:"word",content:"Equivalent Fraction"},    {id:"equivalent-fraction",type:"def",content:"等价分数"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估计"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"greater-than",type:"word",content:"Greater Than"},    {id:"greater-than",type:"def",content:"大于"}
  ]
},
{
  board: '25m', slug: '25m-y8-review-of-numbers-3', category: '25m-y8', title: 'Review of Numbers (3)', titleZh: '数的复习 (3)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"hundred",type:"word",content:"Hundred"},    {id:"hundred",type:"def",content:"百"},    {id:"hundredth",type:"word",content:"Hundredth"},    {id:"hundredth",type:"def",content:"百分位"},    {id:"hundredths",type:"word",content:"Hundredths"},    {id:"hundredths",type:"def",content:"百分位"},    {id:"improper-fraction",type:"word",content:"Improper Fraction"},    {id:"improper-fraction",type:"def",content:"假分数"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"least-common-multiple-lcm",type:"word",content:"Least Common Multiple (LCM)"},    {id:"least-common-multiple-lcm",type:"def",content:"最小公倍数"},    {id:"less-than",type:"word",content:"Less Than"},    {id:"less-than",type:"def",content:"小于"},    {id:"magnitude",type:"word",content:"Magnitude"},    {id:"magnitude",type:"def",content:"大小/模"},    {id:"mixed-number",type:"word",content:"Mixed Number"},    {id:"mixed-number",type:"def",content:"带分数"},    {id:"multiplication",type:"word",content:"Multiplication"},    {id:"multiplication",type:"def",content:"乘法"}
  ]
},
{
  board: '25m', slug: '25m-y8-review-of-numbers-4', category: '25m-y8', title: 'Review of Numbers (4)', titleZh: '数的复习 (4)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"nearest",type:"word",content:"Nearest"},    {id:"nearest",type:"def",content:"最接近的"},    {id:"negative-number",type:"word",content:"Negative Number"},    {id:"negative-number",type:"def",content:"负数"},    {id:"number-line",type:"word",content:"Number Line"},    {id:"number-line",type:"def",content:"数轴"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"opposite-number",type:"word",content:"Opposite Number"},    {id:"opposite-number",type:"def",content:"相反数"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"positive-number",type:"word",content:"Positive Number"},    {id:"positive-number",type:"def",content:"正数"},    {id:"power-of-10",type:"word",content:"Power of 10"},    {id:"power-of-10",type:"def",content:"10的幂"},    {id:"product",type:"word",content:"Product"},    {id:"product",type:"def",content:"积"},    {id:"proper-fraction",type:"word",content:"Proper Fraction"},    {id:"proper-fraction",type:"def",content:"真分数"}
  ]
},
{
  board: '25m', slug: '25m-y8-review-of-numbers-5', category: '25m-y8', title: 'Review of Numbers (5)', titleZh: '数的复习 (5)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"quotient",type:"word",content:"Quotient"},    {id:"quotient",type:"def",content:"商"},    {id:"reciprocal",type:"word",content:"Reciprocal"},    {id:"reciprocal",type:"def",content:"倒数"},    {id:"rounding",type:"word",content:"Rounding"},    {id:"rounding",type:"def",content:"四舍五入"},    {id:"significant-figure-sf",type:"word",content:"Significant Figure (sf)"},    {id:"significant-figure-sf",type:"def",content:"有效数字"},    {id:"simplest-form",type:"word",content:"Simplest Form"},    {id:"simplest-form",type:"def",content:"最简分数"},    {id:"subtraction",type:"word",content:"Subtraction"},    {id:"subtraction",type:"def",content:"减法"},    {id:"tenth",type:"word",content:"Tenth"},    {id:"tenth",type:"def",content:"十分位"},    {id:"tenths",type:"word",content:"Tenths"},    {id:"tenths",type:"def",content:"十分位"},    {id:"thousand",type:"word",content:"Thousand"},    {id:"thousand",type:"def",content:"千"},    {id:"thousandths",type:"word",content:"Thousandths"},    {id:"thousandths",type:"def",content:"千分位"}
  ]
},
{
  board: '25m', slug: '25m-y8-review-of-numbers-6', category: '25m-y8', title: 'Review of Numbers (6)', titleZh: '数的复习 (6)', unitNum: 1, unitTitle: 'Review of Numbers', unitTitleZh: '数的复习',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"truncation",type:"word",content:"Truncation"},    {id:"truncation",type:"def",content:"截断法"},    {id:"whole-number",type:"word",content:"Whole Number"},    {id:"whole-number",type:"def",content:"整数"}
  ]
},
{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-1', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (1)', titleZh: '有理数、因数和质数 (1)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"associative-law",type:"word",content:"Associative law"},    {id:"associative-law",type:"def",content:"结合律"},    {id:"base-exponent",type:"word",content:"Base"},    {id:"base-exponent",type:"def",content:"底数"},    {id:"commutative-law",type:"word",content:"Commutative law"},    {id:"commutative-law",type:"def",content:"交换律"},    {id:"composite-number",type:"word",content:"Composite number"},    {id:"composite-number",type:"def",content:"合数"},    {id:"cube-root",type:"word",content:"Cube root"},    {id:"cube-root",type:"def",content:"立方根"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"distributive-law",type:"word",content:"Distributive law"},    {id:"distributive-law",type:"def",content:"分配律"},    {id:"divisible",type:"word",content:"Divisible"},    {id:"divisible",type:"def",content:"可整除的"},    {id:"exponentiation",type:"word",content:"Exponentiation"},    {id:"exponentiation",type:"def",content:"乘方"}
  ]
},
{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-2', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (2)', titleZh: '有理数、因数和质数 (2)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"factor",type:"word",content:"Factor"},    {id:"factor",type:"def",content:"因数"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"greatest-common-factor-gcf-highest-common-factor-hcf",type:"word",content:"Greatest Common Factor (GCF) / Highest Common Factor (HCF)"},    {id:"greatest-common-factor-gcf-highest-common-factor-hcf",type:"def",content:"最大公因数"},    {id:"index-indices",type:"word",content:"Index (Indices)"},    {id:"index-indices",type:"def",content:"指数"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"irrational-number",type:"word",content:"Irrational number"},    {id:"irrational-number",type:"def",content:"无理数"},    {id:"least-common-multiple-lcm",type:"word",content:"Least Common Multiple (LCM)"},    {id:"least-common-multiple-lcm",type:"def",content:"最小公倍数"},    {id:"mixed-operations",type:"word",content:"Mixed operations"},    {id:"mixed-operations",type:"def",content:"混合运算"},    {id:"multiple",type:"word",content:"Multiple"},    {id:"multiple",type:"def",content:"倍数"},    {id:"negative-number",type:"word",content:"Negative number"},    {id:"negative-number",type:"def",content:"负数"}
  ]
},
{
  board: '25m', slug: '25m-y8-rational-numbers-factors-and-p-3', category: '25m-y8', title: 'Rational Numbers, Factors and Primes (3)', titleZh: '有理数、因数和质数 (3)', unitNum: 2, unitTitle: 'Rational Numbers, Factors and Primes', unitTitleZh: '有理数、因数和质数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"number-line",type:"word",content:"Number line"},    {id:"number-line",type:"def",content:"数轴"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"prime-factorization",type:"word",content:"Prime factorization"},    {id:"prime-factorization",type:"def",content:"质因数分解"},    {id:"prime-number",type:"word",content:"Prime number"},    {id:"prime-number",type:"def",content:"质数 (素数)"},    {id:"rational-number",type:"word",content:"Rational number"},    {id:"rational-number",type:"def",content:"有理数"},    {id:"real-number",type:"word",content:"Real number"},    {id:"real-number",type:"def",content:"实数"},    {id:"root",type:"word",content:"Root"},    {id:"root",type:"def",content:"根"},    {id:"sieve-of-eratosthenes",type:"word",content:"Sieve of Eratosthenes"},    {id:"sieve-of-eratosthenes",type:"def",content:"埃拉托色尼筛法"},    {id:"square-root",type:"word",content:"Square root"},    {id:"square-root",type:"def",content:"平方根"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-1', category: '25m-y8', title: 'Algebraic Formula (1)', titleZh: '代数公式 (1)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"algebraic",type:"word",content:"Algebraic"},    {id:"algebraic",type:"def",content:"代数的"},    {id:"algebraic-factor",type:"word",content:"Algebraic factor"},    {id:"algebraic-factor",type:"def",content:"代数因数"},    {id:"analyse",type:"word",content:"Analyse"},    {id:"analyse",type:"def",content:"分析"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"balance",type:"word",content:"Balance"},    {id:"balance",type:"def",content:"平衡"},    {id:"base-exponent",type:"word",content:"Base"},    {id:"base-exponent",type:"def",content:"底数"},    {id:"bracket",type:"word",content:"Bracket"},    {id:"bracket",type:"def",content:"括号"},    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"common-factor",type:"word",content:"Common factor"},    {id:"common-factor",type:"def",content:"公因数"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-2', category: '25m-y8', title: 'Algebraic Formula (2)', titleZh: '代数公式 (2)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"conversion",type:"word",content:"Conversion"},    {id:"conversion",type:"def",content:"转换"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"distance",type:"word",content:"Distance"},    {id:"distance",type:"def",content:"距离"},    {id:"distributive-law",type:"word",content:"Distributive law"},    {id:"distributive-law",type:"def",content:"分配律"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expand",type:"word",content:"Expand"},    {id:"expand",type:"def",content:"展开"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"factor",type:"word",content:"Factor"},    {id:"factor",type:"def",content:"因数"},    {id:"factorise",type:"word",content:"Factorise"},    {id:"factorise",type:"def",content:"因式分解"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-3', category: '25m-y8', title: 'Algebraic Formula (3)', titleZh: '代数公式 (3)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"formulate",type:"word",content:"Formulate"},    {id:"formulate",type:"def",content:"建立/制定"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"highest-common-factor-hcf",type:"word",content:"Highest Common Factor (HCF)"},    {id:"highest-common-factor-hcf",type:"def",content:"最大公因数"},    {id:"index-power",type:"word",content:"Index / Power"},    {id:"index-power",type:"def",content:"指数 / 幂"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"interpret",type:"word",content:"Interpret"},    {id:"interpret",type:"def",content:"解释"},    {id:"inverse-operation",type:"word",content:"Inverse operation"},    {id:"inverse-operation",type:"def",content:"逆运算"},    {id:"isolate",type:"word",content:"Isolate"},    {id:"isolate",type:"def",content:"分离"},    {id:"known",type:"word",content:"Known"},    {id:"known",type:"def",content:"已知数"},    {id:"like-terms",type:"word",content:"Like terms"},    {id:"like-terms",type:"def",content:"同类项"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-4', category: '25m-y8', title: 'Algebraic Formula (4)', titleZh: '代数公式 (4)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"linear-expression",type:"word",content:"Linear expression"},    {id:"linear-expression",type:"def",content:"线性表达式"},    {id:"mathematical-model",type:"word",content:"Mathematical model"},    {id:"mathematical-model",type:"def",content:"数学模型"},    {id:"negative-integer",type:"word",content:"Negative integer"},    {id:"negative-integer",type:"def",content:"负整数"},    {id:"non-integer",type:"word",content:"Non-integer"},    {id:"non-integer",type:"def",content:"非整数"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"order-of-operations",type:"word",content:"Order of operations"},    {id:"order-of-operations",type:"def",content:"运算顺序"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"positive-integer",type:"word",content:"Positive integer"},    {id:"positive-integer",type:"def",content:"正整数"},    {id:"prime-factor",type:"word",content:"Prime factor"},    {id:"prime-factor",type:"def",content:"质因数"},    {id:"problem-solving",type:"word",content:"Problem solving"},    {id:"problem-solving",type:"def",content:"问题解决"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-5', category: '25m-y8', title: 'Algebraic Formula (5)', titleZh: '代数公式 (5)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"real-life-situation",type:"word",content:"Real-life situation"},    {id:"real-life-situation",type:"def",content:"现实生活情境"},    {id:"relationship",type:"word",content:"Relationship"},    {id:"relationship",type:"def",content:"关系"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"solve",type:"word",content:"Solve"},    {id:"solve",type:"def",content:"解"},    {id:"speed",type:"word",content:"Speed"},    {id:"speed",type:"def",content:"速度"},    {id:"strategy",type:"word",content:"Strategy"},    {id:"strategy",type:"def",content:"策略"},    {id:"substitute",type:"word",content:"Substitute"},    {id:"substitute",type:"def",content:"代入"},    {id:"temperature",type:"word",content:"Temperature"},    {id:"temperature",type:"def",content:"温度"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"}
  ]
},
{
  board: '25m', slug: '25m-y8-algebraic-formula-6', category: '25m-y8', title: 'Algebraic Formula (6)', titleZh: '代数公式 (6)', unitNum: 3, unitTitle: 'Algebraic Formula', unitTitleZh: '代数公式',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"time",type:"word",content:"Time"},    {id:"time",type:"def",content:"时间"},    {id:"unknown",type:"word",content:"Unknown"},    {id:"unknown",type:"def",content:"未知数"},    {id:"value",type:"word",content:"Value"},    {id:"value",type:"def",content:"值"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"},    {id:"volume",type:"word",content:"Volume"},    {id:"volume",type:"def",content:"体积"}
  ]
},
{
  board: '25m', slug: '25m-y8-inequalities-and-inequations-1', category: '25m-y8', title: 'Inequalities and Inequations (1)', titleZh: '不等式和不等式方程 (1)', unitNum: 4, unitTitle: 'Inequalities and Inequations', unitTitleZh: '不等式和不等式方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"greater-than",type:"word",content:"Greater than"},    {id:"greater-than",type:"def",content:"大于"},    {id:"greater-than-or-equal-to",type:"word",content:"Greater than or equal to"},    {id:"greater-than-or-equal-to",type:"def",content:"大于或等于"},    {id:"inequality",type:"word",content:"Inequality"},    {id:"inequality",type:"def",content:"不等式"},    {id:"inequation",type:"word",content:"Inequation"},    {id:"inequation",type:"def",content:"不等式方程"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"less-than",type:"word",content:"Less than"},    {id:"less-than",type:"def",content:"小于"},    {id:"less-than-or-equal-to",type:"word",content:"Less than or equal to"},    {id:"less-than-or-equal-to",type:"def",content:"小于或等于"},    {id:"negative-number",type:"word",content:"Negative number"},    {id:"negative-number",type:"def",content:"负数"},    {id:"number-line",type:"word",content:"Number line"},    {id:"number-line",type:"def",content:"数轴"},    {id:"positive-number",type:"word",content:"Positive number"},    {id:"positive-number",type:"def",content:"正数"}
  ]
},
{
  board: '25m', slug: '25m-y8-inequalities-and-inequations-2', category: '25m-y8', title: 'Inequalities and Inequations (2)', titleZh: '不等式和不等式方程 (2)', unitNum: 4, unitTitle: 'Inequalities and Inequations', unitTitleZh: '不等式和不等式方程',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"range-general",type:"word",content:"Range"},    {id:"range-general",type:"def",content:"范围"},    {id:"solution-set",type:"word",content:"Solution set"},    {id:"solution-set",type:"def",content:"解集"},    {id:"solve",type:"word",content:"Solve"},    {id:"solve",type:"def",content:"求解"},    {id:"symbol",type:"word",content:"Symbol"},    {id:"symbol",type:"def",content:"符号"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y8-introduction-to-pythagoras-the-1', category: '25m-y8', title: 'Introduction to Pythagoras\' Theorem (1)', titleZh: '勾股定理简介 (1)', unitNum: 5, unitTitle: 'Introduction to Pythagoras\' Theorem', unitTitleZh: '勾股定理简介',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"ancient-china",type:"word",content:"Ancient China"},    {id:"ancient-china",type:"def",content:"中国古代"},    {id:"ancient-greece",type:"word",content:"Ancient Greece"},    {id:"ancient-greece",type:"def",content:"古希腊"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"diagonal",type:"word",content:"Diagonal"},    {id:"diagonal",type:"def",content:"对角线"},    {id:"hypotenuse",type:"word",content:"Hypotenuse"},    {id:"hypotenuse",type:"def",content:"斜边"},    {id:"leg-of-a-right-triangle",type:"word",content:"Leg (of a right triangle)"},    {id:"leg-of-a-right-triangle",type:"def",content:"直角边"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"pythagoras-theorem",type:"word",content:"Pythagoras\' Theorem"},    {id:"pythagoras-theorem",type:"def",content:"勾股定理"},    {id:"pythagorean-triple",type:"word",content:"Pythagorean triple"},    {id:"pythagorean-triple",type:"def",content:"勾股数"}
  ]
},
{
  board: '25m', slug: '25m-y8-introduction-to-pythagoras-the-2', category: '25m-y8', title: 'Introduction to Pythagoras\' Theorem (2)', titleZh: '勾股定理简介 (2)', unitNum: 5, unitTitle: 'Introduction to Pythagoras\' Theorem', unitTitleZh: '勾股定理简介',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"right-angled-triangle",type:"word",content:"Right-angled triangle"},    {id:"right-angled-triangle",type:"def",content:"直角三角形"},    {id:"square-power",type:"word",content:"Square"},    {id:"square-power",type:"def",content:"平方"},    {id:"square-root",type:"word",content:"Square root"},    {id:"square-root",type:"def",content:"平方根"},    {id:"theorem",type:"word",content:"Theorem"},    {id:"theorem",type:"def",content:"定理"},    {id:"two-dimensional",type:"word",content:"Two-dimensional"},    {id:"two-dimensional",type:"def",content:"二维"}
  ]
},
{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-1', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (1)', titleZh: '相交线和平行线 (1)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"adjacent-angles",type:"word",content:"Adjacent angles"},    {id:"adjacent-angles",type:"def",content:"邻角"},    {id:"alternate-interior-angles",type:"word",content:"Alternate interior angles"},    {id:"alternate-interior-angles",type:"def",content:"内错角"},    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角"},    {id:"angle-rules",type:"word",content:"Angle rules"},    {id:"angle-rules",type:"def",content:"角度规则"},    {id:"co-interior-angles",type:"word",content:"Co-interior angles"},    {id:"co-interior-angles",type:"def",content:"同旁内角"},    {id:"congruent",type:"word",content:"Congruent"},    {id:"congruent",type:"def",content:"全等"},    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"同位角"},    {id:"degree-angle",type:"word",content:"Degree"},    {id:"degree-angle",type:"def",content:"度"},    {id:"diagram",type:"word",content:"Diagram"},    {id:"diagram",type:"def",content:"图表"},    {id:"exterior-angles",type:"word",content:"Exterior angles"},    {id:"exterior-angles",type:"def",content:"外角"}
  ]
},
{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-2', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (2)', titleZh: '相交线和平行线 (2)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"interior-angles",type:"word",content:"Interior angles"},    {id:"interior-angles",type:"def",content:"内角"},    {id:"intersecting-lines",type:"word",content:"Intersecting lines"},    {id:"intersecting-lines",type:"def",content:"相交线"},    {id:"parallel-lines",type:"word",content:"Parallel lines"},    {id:"parallel-lines",type:"def",content:"平行线"},    {id:"perpendicular-lines",type:"word",content:"Perpendicular lines"},    {id:"perpendicular-lines",type:"def",content:"垂线"},    {id:"point",type:"word",content:"Point"},    {id:"point",type:"def",content:"点"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"quadrilateral",type:"word",content:"Quadrilateral"},    {id:"quadrilateral",type:"def",content:"四边形"},    {id:"reasoning",type:"word",content:"Reasoning"},    {id:"reasoning",type:"def",content:"推理"},    {id:"straight-line",type:"word",content:"Straight line"},    {id:"straight-line",type:"def",content:"直线"},    {id:"sum",type:"word",content:"Sum"},    {id:"sum",type:"def",content:"和"}
  ]
},
{
  board: '25m', slug: '25m-y8-intersecting-lines-and-paralle-3', category: '25m-y8', title: 'Intersecting Lines and Parallel Lines (3)', titleZh: '相交线和平行线 (3)', unitNum: 6, unitTitle: 'Intersecting Lines and Parallel Lines', unitTitleZh: '相交线和平行线',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"supplementary",type:"word",content:"Supplementary"},    {id:"supplementary",type:"def",content:"互补的"},    {id:"supplementary-angles",type:"word",content:"Supplementary angles"},    {id:"supplementary-angles",type:"def",content:"补角"},    {id:"transversal",type:"word",content:"Transversal"},    {id:"transversal",type:"def",content:"截线"},    {id:"triangle",type:"word",content:"Triangle"},    {id:"triangle",type:"def",content:"三角形"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"},    {id:"vertically-opposite-angles",type:"word",content:"Vertically opposite angles"},    {id:"vertically-opposite-angles",type:"def",content:"对顶角"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-algebra-1', category: '25m-y8', title: 'Further Algebra (1)', titleZh: '进一步的代数 (1)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"coordinate",type:"word",content:"Coordinate"},    {id:"coordinate",type:"def",content:"坐标"},    {id:"derive",type:"word",content:"Derive"},    {id:"derive",type:"def",content:"推导"},    {id:"elimination-method",type:"word",content:"Elimination method"},    {id:"elimination-method",type:"def",content:"消元法"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图表"},    {id:"intersection-point",type:"word",content:"Intersection point"},    {id:"intersection-point",type:"def",content:"交点"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-algebra-2', category: '25m-y8', title: 'Further Algebra (2)', titleZh: '进一步的代数 (2)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"like-terms",type:"word",content:"Like terms"},    {id:"like-terms",type:"def",content:"同类项"},    {id:"linear-equation",type:"word",content:"Linear equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"linear-equations",type:"word",content:"Linear equations"},    {id:"linear-equations",type:"def",content:"线性方程"},    {id:"practical-problem",type:"word",content:"Practical problem"},    {id:"practical-problem",type:"def",content:"实际问题"},    {id:"rearrange",type:"word",content:"Rearrange"},    {id:"rearrange",type:"def",content:"重排"},    {id:"scaling",type:"word",content:"Scaling"},    {id:"scaling",type:"def",content:"缩放"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"simultaneous-equations",type:"word",content:"Simultaneous equations"},    {id:"simultaneous-equations",type:"def",content:"联立方程组"},    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"solve",type:"word",content:"Solve"},    {id:"solve",type:"def",content:"求解"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-algebra-3', category: '25m-y8', title: 'Further Algebra (3)', titleZh: '进一步的代数 (3)', unitNum: 7, unitTitle: 'Further Algebra', unitTitleZh: '进一步的代数',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"subject-of-a-formula",type:"word",content:"Subject of a formula"},    {id:"subject-of-a-formula",type:"def",content:"公式的主体"},    {id:"substitute",type:"word",content:"Substitute"},    {id:"substitute",type:"def",content:"代入"},    {id:"substitution-method",type:"word",content:"Substitution method"},    {id:"substitution-method",type:"def",content:"代入法"},    {id:"system-of-equations",type:"word",content:"System of equations"},    {id:"system-of-equations",type:"def",content:"方程组"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"unknown",type:"word",content:"Unknown"},    {id:"unknown",type:"def",content:"未知数"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-1', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (1)', titleZh: '坐标和绘制线性图表 (1)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"cartesian-coordinates",type:"word",content:"Cartesian coordinates"},    {id:"cartesian-coordinates",type:"def",content:"笛卡尔坐标"},    {id:"coordinate-pair",type:"word",content:"Coordinate pair"},    {id:"coordinate-pair",type:"def",content:"坐标对"},    {id:"distance",type:"word",content:"Distance"},    {id:"distance",type:"def",content:"距离"},    {id:"explicit-form",type:"word",content:"Explicit form"},    {id:"explicit-form",type:"def",content:"显式形式"},    {id:"function",type:"word",content:"Function"},    {id:"function",type:"def",content:"函数"},    {id:"gradient",type:"word",content:"Gradient"},    {id:"gradient",type:"def",content:"斜率"},    {id:"horizontal",type:"word",content:"Horizontal"},    {id:"horizontal",type:"def",content:"水平的"},    {id:"implicit-form",type:"word",content:"Implicit form"},    {id:"implicit-form",type:"def",content:"隐式形式"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"interpretation",type:"word",content:"Interpretation"},    {id:"interpretation",type:"def",content:"解释"}
  ]
},
{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-2', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (2)', titleZh: '坐标和绘制线性图表 (2)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"linear-equation",type:"word",content:"Linear equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"linear-graph",type:"word",content:"Linear graph"},    {id:"linear-graph",type:"def",content:"线性图表"},    {id:"midpoint",type:"word",content:"Midpoint"},    {id:"midpoint",type:"def",content:"中点"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"parallel-lines",type:"word",content:"Parallel lines"},    {id:"parallel-lines",type:"def",content:"平行线"},    {id:"plot",type:"word",content:"Plot"},    {id:"plot",type:"def",content:"绘制"},    {id:"point",type:"word",content:"Point"},    {id:"point",type:"def",content:"点"},    {id:"quadrant",type:"word",content:"Quadrant"},    {id:"quadrant",type:"def",content:"象限"},    {id:"real-life-problem",type:"word",content:"Real-life problem"},    {id:"real-life-problem",type:"def",content:"实际问题"},    {id:"reflection",type:"word",content:"Reflection"},    {id:"reflection",type:"def",content:"反射"}
  ]
},
{
  board: '25m', slug: '25m-y8-co-ordinates-and-plotting-line-3', category: '25m-y8', title: 'Co-ordinates and Plotting Linear Graphs (3)', titleZh: '坐标和绘制线性图表 (3)', unitNum: 8, unitTitle: 'Co-ordinates and Plotting Linear Graphs', unitTitleZh: '坐标和绘制线性图表',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"straight-line",type:"word",content:"Straight line"},    {id:"straight-line",type:"def",content:"直线"},    {id:"table-of-values",type:"word",content:"Table of values"},    {id:"table-of-values",type:"def",content:"数值表"},    {id:"translation",type:"word",content:"Translation"},    {id:"translation",type:"def",content:"平移"},    {id:"vertical",type:"word",content:"Vertical"},    {id:"vertical",type:"def",content:"垂直的"},    {id:"x-axis",type:"word",content:"x-axis"},    {id:"x-axis",type:"def",content:"x轴"},    {id:"x-intercept",type:"word",content:"x-intercept"},    {id:"x-intercept",type:"def",content:"x截距"},    {id:"y-axis",type:"word",content:"y-axis"},    {id:"y-axis",type:"def",content:"y轴"},    {id:"y-intercept",type:"word",content:"y-intercept"},    {id:"y-intercept",type:"def",content:"y截距"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-statistics-1', category: '25m-y8', title: 'Further Statistics (1)', titleZh: '更多的统计 (1)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"back-to-back-stem-and-leaf-diagram",type:"word",content:"Back-to-back stem-and-leaf diagram"},    {id:"back-to-back-stem-and-leaf-diagram",type:"def",content:"背对背茎叶图"},    {id:"class-interval",type:"word",content:"Class interval"},    {id:"class-interval",type:"def",content:"类间隔"},    {id:"comprehensive-survey",type:"word",content:"Comprehensive survey"},    {id:"comprehensive-survey",type:"def",content:"全面调查"},    {id:"conclusion",type:"word",content:"Conclusion"},    {id:"conclusion",type:"def",content:"结论"},    {id:"continuous-data",type:"word",content:"Continuous data"},    {id:"continuous-data",type:"def",content:"连续数据"},    {id:"data-collection",type:"word",content:"Data collection"},    {id:"data-collection",type:"def",content:"数据收集"},    {id:"data-interpretation",type:"word",content:"Data interpretation"},    {id:"data-interpretation",type:"def",content:"数据解释"},    {id:"discrete-data",type:"word",content:"Discrete data"},    {id:"discrete-data",type:"def",content:"离散数据"},    {id:"frequency",type:"word",content:"Frequency"},    {id:"frequency",type:"def",content:"频率"},    {id:"frequency-diagram",type:"word",content:"Frequency diagram"},    {id:"frequency-diagram",type:"def",content:"频率图"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-statistics-2', category: '25m-y8', title: 'Further Statistics (2)', titleZh: '更多的统计 (2)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"frequency-polygon",type:"word",content:"Frequency polygon"},    {id:"frequency-polygon",type:"def",content:"频率多边形"},    {id:"frequency-tree-diagram",type:"word",content:"Frequency tree diagram"},    {id:"frequency-tree-diagram",type:"def",content:"频率树图"},    {id:"interpretation",type:"word",content:"Interpretation"},    {id:"interpretation",type:"def",content:"解释"},    {id:"line-graph",type:"word",content:"Line graph"},    {id:"line-graph",type:"def",content:"线图"},    {id:"mean",type:"word",content:"Mean"},    {id:"mean",type:"def",content:"平均数"},    {id:"median-value",type:"word",content:"Median"},    {id:"median-value",type:"def",content:"中位数"},    {id:"mode",type:"word",content:"Mode"},    {id:"mode",type:"def",content:"众数"},    {id:"pie-chart",type:"word",content:"Pie chart"},    {id:"pie-chart",type:"def",content:"饼图"},    {id:"primary-data",type:"word",content:"Primary data"},    {id:"primary-data",type:"def",content:"初级数据"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例"}
  ]
},
{
  board: '25m', slug: '25m-y8-further-statistics-3', category: '25m-y8', title: 'Further Statistics (3)', titleZh: '更多的统计 (3)', unitNum: 9, unitTitle: 'Further Statistics', unitTitleZh: '更多的统计',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"range-statistics",type:"word",content:"Range"},    {id:"range-statistics",type:"def",content:"极差"},    {id:"raw-data",type:"word",content:"Raw data"},    {id:"raw-data",type:"def",content:"原始数据"},    {id:"sampling-survey",type:"word",content:"Sampling survey"},    {id:"sampling-survey",type:"def",content:"抽样调查"},    {id:"secondary-data",type:"word",content:"Secondary data"},    {id:"secondary-data",type:"def",content:"次级数据"},    {id:"statistics",type:"word",content:"Statistics"},    {id:"statistics",type:"def",content:"统计数据"},    {id:"stem-and-leaf-diagram",type:"word",content:"Stem-and-leaf diagram"},    {id:"stem-and-leaf-diagram",type:"def",content:"茎叶图"},    {id:"survey",type:"word",content:"Survey"},    {id:"survey",type:"def",content:"调查"},    {id:"tabulation",type:"word",content:"Tabulation"},    {id:"tabulation",type:"def",content:"制表"},    {id:"time-series",type:"word",content:"Time series"},    {id:"time-series",type:"def",content:"时间序列"},    {id:"two-way-table",type:"word",content:"Two-way table"},    {id:"two-way-table",type:"def",content:"双向表"}
  ]
},

/* ═══ Year 9 (49 levels, 424 words) ═══ */,
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-1', category: '25m-y9', title: 'Working with Irrational Numbers (1)', titleZh: '理数的运算 (1)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"absolute-value",type:"word",content:"Absolute value"},    {id:"absolute-value",type:"def",content:"绝对值"},    {id:"approximation",type:"word",content:"Approximation"},    {id:"approximation",type:"def",content:"近似值"},    {id:"arithmetic-square-root",type:"word",content:"Arithmetic square root"},    {id:"arithmetic-square-root",type:"def",content:"算术平方根"},    {id:"calculator",type:"word",content:"Calculator"},    {id:"calculator",type:"def",content:"计算器"},    {id:"conjugate-surds",type:"word",content:"Conjugate surds"},    {id:"conjugate-surds",type:"def",content:"共轭根式"},    {id:"consecutive-integers",type:"word",content:"Consecutive integers"},    {id:"consecutive-integers",type:"def",content:"连续整数"},    {id:"cube-root",type:"word",content:"Cube root"},    {id:"cube-root",type:"def",content:"立方根"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"decimal-places",type:"word",content:"Decimal places"},    {id:"decimal-places",type:"def",content:"小数位数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-2', category: '25m-y9', title: 'Working with Irrational Numbers (2)', titleZh: '理数的运算 (2)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"estimation",type:"word",content:"Estimation"},    {id:"estimation",type:"def",content:"估算"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"index",type:"word",content:"Index"},    {id:"index",type:"def",content:"根指数"},    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"inverse-operation",type:"word",content:"Inverse operation"},    {id:"inverse-operation",type:"def",content:"逆运算"},    {id:"irrational-number",type:"word",content:"Irrational number"},    {id:"irrational-number",type:"def",content:"无理数"},    {id:"irrational-numbers",type:"word",content:"Irrational numbers"},    {id:"irrational-numbers",type:"def",content:"无理数"},    {id:"like-surds",type:"word",content:"Like surds"},    {id:"like-surds",type:"def",content:"同类二次根式"},    {id:"lower-bound",type:"word",content:"Lower bound"},    {id:"lower-bound",type:"def",content:"下界"},    {id:"natural-numbers",type:"word",content:"Natural numbers"},    {id:"natural-numbers",type:"def",content:"自然数"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-3', category: '25m-y9', title: 'Working with Irrational Numbers (3)', titleZh: '理数的运算 (3)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"negative-numbers",type:"word",content:"Negative numbers"},    {id:"negative-numbers",type:"def",content:"负数"},    {id:"negative-square-root",type:"word",content:"Negative square root"},    {id:"negative-square-root",type:"def",content:"负平方根"},    {id:"non-terminating-non-repeating-decimal",type:"word",content:"Non-terminating non-repeating decimal"},    {id:"non-terminating-non-repeating-decimal",type:"def",content:"无限不循环小数"},    {id:"non-terminating-repeating-decimal",type:"word",content:"Non-terminating repeating decimal"},    {id:"non-terminating-repeating-decimal",type:"def",content:"无限循环小数"},    {id:"number-line",type:"word",content:"Number line"},    {id:"number-line",type:"def",content:"数轴"},    {id:"operation",type:"word",content:"Operation"},    {id:"operation",type:"def",content:"运算"},    {id:"opposite-number",type:"word",content:"Opposite number"},    {id:"opposite-number",type:"def",content:"相反数"},    {id:"perfect-cube",type:"word",content:"Perfect cube"},    {id:"perfect-cube",type:"def",content:"完全立方数"},    {id:"perfect-square",type:"word",content:"Perfect square"},    {id:"perfect-square",type:"def",content:"完全平方数"},    {id:"positive-numbers",type:"word",content:"Positive numbers"},    {id:"positive-numbers",type:"def",content:"正数"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-4', category: '25m-y9', title: 'Working with Irrational Numbers (4)', titleZh: '理数的运算 (4)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"positive-square-root",type:"word",content:"Positive square root"},    {id:"positive-square-root",type:"def",content:"正平方根"},    {id:"power",type:"word",content:"Power"},    {id:"power",type:"def",content:"幂"},    {id:"precision",type:"word",content:"Precision"},    {id:"precision",type:"def",content:"精确度"},    {id:"product-property-of-surds",type:"word",content:"Product property of surds"},    {id:"product-property-of-surds",type:"def",content:"根式的乘法性质"},    {id:"quadratic-surd",type:"word",content:"Quadratic Surd"},    {id:"quadratic-surd",type:"def",content:"二次根式"},    {id:"quotient-property-of-surds",type:"word",content:"Quotient property of surds"},    {id:"quotient-property-of-surds",type:"def",content:"根式的除法性质"},    {id:"radical-sign",type:"word",content:"Radical sign"},    {id:"radical-sign",type:"def",content:"根号"},    {id:"radicand",type:"word",content:"Radicand"},    {id:"radicand",type:"def",content:"被开方数"},    {id:"range-general",type:"word",content:"Range"},    {id:"range-general",type:"def",content:"范围"},    {id:"rational-number",type:"word",content:"Rational number"},    {id:"rational-number",type:"def",content:"有理数"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-5', category: '25m-y9', title: 'Working with Irrational Numbers (5)', titleZh: '理数的运算 (5)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"rational-numbers",type:"word",content:"Rational numbers"},    {id:"rational-numbers",type:"def",content:"有理数"},    {id:"rationalize-the-denominator",type:"word",content:"Rationalize the denominator"},    {id:"rationalize-the-denominator",type:"def",content:"分母有理化"},    {id:"real-numbers",type:"word",content:"Real numbers"},    {id:"real-numbers",type:"def",content:"实数"},    {id:"root-notation",type:"word",content:"Root notation"},    {id:"root-notation",type:"def",content:"根号表示法"},    {id:"rounding",type:"word",content:"Rounding"},    {id:"rounding",type:"def",content:"四舍五入"},    {id:"simplest-surd-form",type:"word",content:"Simplest surd form"},    {id:"simplest-surd-form",type:"def",content:"最简二次根式"},    {id:"simplification",type:"word",content:"Simplification"},    {id:"simplification",type:"def",content:"化简"},    {id:"square-root",type:"word",content:"Square root"},    {id:"square-root",type:"def",content:"平方根"},    {id:"square-root-of-a-product",type:"word",content:"Square root of a product"},    {id:"square-root-of-a-product",type:"def",content:"积的平方根"},    {id:"square-root-of-a-quotient",type:"word",content:"Square root of a quotient"},    {id:"square-root-of-a-quotient",type:"def",content:"商的平方根"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-irrational-number-6', category: '25m-y9', title: 'Working with Irrational Numbers (6)', titleZh: '理数的运算 (6)', unitNum: 1, unitTitle: 'Working with Irrational Numbers', unitTitleZh: '理数的运算',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"terminating-decimal",type:"word",content:"Terminating decimal"},    {id:"terminating-decimal",type:"def",content:"有限小数"},    {id:"unlike-surds",type:"word",content:"Unlike surds"},    {id:"unlike-surds",type:"def",content:"非同类二次根式"},    {id:"upper-bound",type:"word",content:"Upper bound"},    {id:"upper-bound",type:"def",content:"上界"},    {id:"whole-numbers",type:"word",content:"Whole numbers"},    {id:"whole-numbers",type:"def",content:"非负整数"},    {id:"zero",type:"word",content:"Zero"},    {id:"zero",type:"def",content:"零"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-1', category: '25m-y9', title: 'Working with Expressions (1)', titleZh: '表达式的运算 (1)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"algebraic-expression",type:"word",content:"Algebraic expression"},    {id:"algebraic-expression",type:"def",content:"代数表达式"},    {id:"base-exponent",type:"word",content:"Base"},    {id:"base-exponent",type:"def",content:"底数"},    {id:"binomial",type:"word",content:"Binomial"},    {id:"binomial",type:"def",content:"二项式"},    {id:"bracket",type:"word",content:"Bracket"},    {id:"bracket",type:"def",content:"括号"},    {id:"calculation",type:"word",content:"Calculation"},    {id:"calculation",type:"def",content:"计算"},    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"common-factor",type:"word",content:"Common factor"},    {id:"common-factor",type:"def",content:"公因数"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"convert",type:"word",content:"Convert"},    {id:"convert",type:"def",content:"转换"},    {id:"decimal-point",type:"word",content:"Decimal point"},    {id:"decimal-point",type:"def",content:"小数点"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-2', category: '25m-y9', title: 'Working with Expressions (2)', titleZh: '表达式的运算 (2)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"difference-of-squares",type:"word",content:"Difference of squares"},    {id:"difference-of-squares",type:"def",content:"平方差"},    {id:"distributive-law",type:"word",content:"Distributive law"},    {id:"distributive-law",type:"def",content:"分配律"},    {id:"evaluate",type:"word",content:"Evaluate"},    {id:"evaluate",type:"def",content:"求值"},    {id:"expand",type:"word",content:"Expand"},    {id:"expand",type:"def",content:"展开"},    {id:"exponent",type:"word",content:"Exponent"},    {id:"exponent",type:"def",content:"指数"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"factor",type:"word",content:"Factor"},    {id:"factor",type:"def",content:"因数"},    {id:"factorize",type:"word",content:"Factorize"},    {id:"factorize",type:"def",content:"因式分解"},    {id:"foil-method",type:"word",content:"FOIL method"},    {id:"foil-method",type:"def",content:"FOIL法则"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-3', category: '25m-y9', title: 'Working with Expressions (3)', titleZh: '表达式的运算 (3)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"highest-common-factor-hcf",type:"word",content:"Highest common factor (HCF)"},    {id:"highest-common-factor-hcf",type:"def",content:"最大公因数"},    {id:"identity",type:"word",content:"Identity"},    {id:"identity",type:"def",content:"恒等式"},    {id:"index-exponent",type:"word",content:"Index / Exponent"},    {id:"index-exponent",type:"def",content:"指数"},    {id:"index-power",type:"word",content:"Index / Power"},    {id:"index-power",type:"def",content:"指数"},    {id:"index-laws",type:"word",content:"Index laws"},    {id:"index-laws",type:"def",content:"指数定律"},    {id:"large-number",type:"word",content:"Large number"},    {id:"large-number",type:"def",content:"大数"},    {id:"like-terms",type:"word",content:"Like terms"},    {id:"like-terms",type:"def",content:"同类项"},    {id:"linear-expression",type:"word",content:"Linear expression"},    {id:"linear-expression",type:"def",content:"线性表达式"},    {id:"multiplication-formula",type:"word",content:"Multiplication formula"},    {id:"multiplication-formula",type:"def",content:"乘法公式"},    {id:"negative-index",type:"word",content:"Negative index"},    {id:"negative-index",type:"def",content:"负指数"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-4', category: '25m-y9', title: 'Working with Expressions (4)', titleZh: '表达式的运算 (4)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"order-of-magnitude",type:"word",content:"Order of magnitude"},    {id:"order-of-magnitude",type:"def",content:"数量级"},    {id:"perfect-square",type:"word",content:"Perfect square"},    {id:"perfect-square",type:"def",content:"完全平方"},    {id:"power-of-a-power-rule",type:"word",content:"Power of a power rule"},    {id:"power-of-a-power-rule",type:"def",content:"幂的乘方法则"},    {id:"power-of-ten",type:"word",content:"Power of ten"},    {id:"power-of-ten",type:"def",content:"10的幂"},    {id:"prime-factor-decomposition",type:"word",content:"Prime factor decomposition"},    {id:"prime-factor-decomposition",type:"def",content:"质因数分解"},    {id:"product",type:"word",content:"Product"},    {id:"product",type:"def",content:"乘积"},    {id:"product-rule",type:"word",content:"Product rule"},    {id:"product-rule",type:"def",content:"乘法法则"},    {id:"quadratic-expression",type:"word",content:"Quadratic expression"},    {id:"quadratic-expression",type:"def",content:"二次表达式"},    {id:"quotient-rule",type:"word",content:"Quotient rule"},    {id:"quotient-rule",type:"def",content:"除法法则"},    {id:"reciprocal",type:"word",content:"Reciprocal"},    {id:"reciprocal",type:"def",content:"倒数"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-5', category: '25m-y9', title: 'Working with Expressions (5)', titleZh: '表达式的运算 (5)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"scientific-notation",type:"word",content:"Scientific notation"},    {id:"scientific-notation",type:"def",content:"科学记数法"},    {id:"significant-figures",type:"word",content:"Significant figures"},    {id:"significant-figures",type:"def",content:"有效数字"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"small-number",type:"word",content:"Small number"},    {id:"small-number",type:"def",content:"小数"},    {id:"square-power",type:"word",content:"Square"},    {id:"square-power",type:"def",content:"平方"},    {id:"standard-form",type:"word",content:"Standard form"},    {id:"standard-form",type:"def",content:"科学计数法"},    {id:"substitute",type:"word",content:"Substitute"},    {id:"substitute",type:"def",content:"代入"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"trinomial",type:"word",content:"Trinomial"},    {id:"trinomial",type:"def",content:"三项式"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y9-working-with-expressions-6', category: '25m-y9', title: 'Working with Expressions (6)', titleZh: '表达式的运算 (6)', unitNum: 2, unitTitle: 'Working with Expressions', unitTitleZh: '表达式的运算',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"zero-index",type:"word",content:"Zero index"},    {id:"zero-index",type:"def",content:"零指数"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-1', category: '25m-y9', title: 'Algebraic Functions (1)', titleZh: '代数函数 (1)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"fx",type:"word",content:"$f(x)$"},    {id:"fx",type:"def",content:"f(x)"},    {id:"acceleration",type:"word",content:"Acceleration"},    {id:"acceleration",type:"def",content:"加速度"},    {id:"algebraic-representation",type:"word",content:"Algebraic representation"},    {id:"algebraic-representation",type:"def",content:"代数表示"},    {id:"area-under-graph",type:"word",content:"Area under graph"},    {id:"area-under-graph",type:"def",content:"图下面积"},    {id:"average-speed",type:"word",content:"Average speed"},    {id:"average-speed",type:"def",content:"平均速度"},    {id:"bisector",type:"word",content:"Bisector"},    {id:"bisector",type:"def",content:"平分线"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"constant-of-proportionality",type:"word",content:"Constant of proportionality"},    {id:"constant-of-proportionality",type:"def",content:"比例常数"},    {id:"constant-speed",type:"word",content:"Constant speed"},    {id:"constant-speed",type:"def",content:"匀速"},    {id:"coordinates",type:"word",content:"Coordinates"},    {id:"coordinates",type:"def",content:"坐标"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-2', category: '25m-y9', title: 'Algebraic Functions (2)', titleZh: '代数函数 (2)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"cross-curricular",type:"word",content:"Cross-curricular"},    {id:"cross-curricular",type:"def",content:"跨学科"},    {id:"cubic-function",type:"word",content:"Cubic function"},    {id:"cubic-function",type:"def",content:"三次函数"},    {id:"currency-conversion",type:"word",content:"Currency conversion"},    {id:"currency-conversion",type:"def",content:"货币换算"},    {id:"data",type:"word",content:"Data"},    {id:"data",type:"def",content:"数据"},    {id:"deceleration",type:"word",content:"Deceleration"},    {id:"deceleration",type:"def",content:"减速度"},    {id:"dependent-variable",type:"word",content:"Dependent variable"},    {id:"dependent-variable",type:"def",content:"因变量"},    {id:"direct-proportion",type:"word",content:"Direct proportion"},    {id:"direct-proportion",type:"def",content:"正比例"},    {id:"displacement",type:"word",content:"Displacement"},    {id:"displacement",type:"def",content:"位移"},    {id:"distance-formula",type:"word",content:"Distance formula"},    {id:"distance-formula",type:"def",content:"距离公式"},    {id:"distance-time-graph",type:"word",content:"Distance-time graph"},    {id:"distance-time-graph",type:"def",content:"距离-时间图"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-3', category: '25m-y9', title: 'Algebraic Functions (3)', titleZh: '代数函数 (3)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"domain",type:"word",content:"Domain"},    {id:"domain",type:"def",content:"定义域"},    {id:"endpoint",type:"word",content:"Endpoint"},    {id:"endpoint",type:"def",content:"端点"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"equation-of-a-line",type:"word",content:"Equation of a line"},    {id:"equation-of-a-line",type:"def",content:"直线方程"},    {id:"function",type:"word",content:"Function"},    {id:"function",type:"def",content:"函数"},    {id:"function-notation",type:"word",content:"Function notation"},    {id:"function-notation",type:"def",content:"函数符号"},    {id:"gradient",type:"word",content:"Gradient"},    {id:"gradient",type:"def",content:"斜率"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图表"},    {id:"graphical-representation",type:"word",content:"Graphical representation"},    {id:"graphical-representation",type:"def",content:"图形表示"},    {id:"independent-variable",type:"word",content:"Independent variable"},    {id:"independent-variable",type:"def",content:"自变量"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-4', category: '25m-y9', title: 'Algebraic Functions (4)', titleZh: '代数函数 (4)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"input",type:"word",content:"Input"},    {id:"input",type:"def",content:"输入"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"intersection-point",type:"word",content:"Intersection"},    {id:"intersection-point",type:"def",content:"交点"},    {id:"inverse-proportion",type:"word",content:"Inverse proportion"},    {id:"inverse-proportion",type:"def",content:"反比例"},    {id:"inversely-proportional-to",type:"word",content:"Inversely proportional to"},    {id:"inversely-proportional-to",type:"def",content:"与...成反比"},    {id:"kinematics",type:"word",content:"Kinematics"},    {id:"kinematics",type:"def",content:"运动学"},    {id:"line-segment",type:"word",content:"Line segment"},    {id:"line-segment",type:"def",content:"线段"},    {id:"linear-graph",type:"word",content:"Linear graph"},    {id:"linear-graph",type:"def",content:"线性图像"},    {id:"mapping",type:"word",content:"Mapping"},    {id:"mapping",type:"def",content:"映射"},    {id:"midpoint",type:"word",content:"Midpoint"},    {id:"midpoint",type:"def",content:"中点"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-5', category: '25m-y9', title: 'Algebraic Functions (5)', titleZh: '代数函数 (5)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"negative-reciprocal",type:"word",content:"Negative reciprocal"},    {id:"negative-reciprocal",type:"def",content:"负倒数"},    {id:"numerical-representation",type:"word",content:"Numerical representation"},    {id:"numerical-representation",type:"def",content:"数值表示"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"output",type:"word",content:"Output"},    {id:"output",type:"def",content:"输出"},    {id:"parallel-lines",type:"word",content:"Parallel lines"},    {id:"parallel-lines",type:"def",content:"平行线"},    {id:"perpendicular-lines",type:"word",content:"Perpendicular lines"},    {id:"perpendicular-lines",type:"def",content:"垂直线"},    {id:"plot",type:"word",content:"Plot"},    {id:"plot",type:"def",content:"描点"},    {id:"product",type:"word",content:"Product"},    {id:"product",type:"def",content:"乘积"},    {id:"proportional-to",type:"word",content:"Proportional to"},    {id:"proportional-to",type:"def",content:"与...成比例"},    {id:"quadratic-function",type:"word",content:"Quadratic function"},    {id:"quadratic-function",type:"def",content:"二次函数"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-6', category: '25m-y9', title: 'Algebraic Functions (6)', titleZh: '代数函数 (6)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"range-function",type:"word",content:"Range"},    {id:"range-function",type:"def",content:"值域"},    {id:"rate-of-change",type:"word",content:"Rate of change"},    {id:"rate-of-change",type:"def",content:"变化率"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比率"},    {id:"real-life-application",type:"word",content:"Real-life application"},    {id:"real-life-application",type:"def",content:"实际应用"},    {id:"reciprocal-function",type:"word",content:"Reciprocal function"},    {id:"reciprocal-function",type:"def",content:"倒数函数"},    {id:"relationship",type:"word",content:"Relationship"},    {id:"relationship",type:"def",content:"关系"},    {id:"slope",type:"word",content:"Slope"},    {id:"slope",type:"def",content:"坡度"},    {id:"speed",type:"word",content:"Speed"},    {id:"speed",type:"def",content:"速度"},    {id:"speed-time-graph",type:"word",content:"Speed-time graph"},    {id:"speed-time-graph",type:"def",content:"速度-时间图"},    {id:"stationary",type:"word",content:"Stationary"},    {id:"stationary",type:"def",content:"静止"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-functions-7', category: '25m-y9', title: 'Algebraic Functions (7)', titleZh: '代数函数 (7)', unitNum: 3, unitTitle: 'Algebraic Functions', unitTitleZh: '代数函数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"uniform-motion",type:"word",content:"Uniform motion"},    {id:"uniform-motion",type:"def",content:"匀速运动"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"},    {id:"velocity",type:"word",content:"Velocity"},    {id:"velocity",type:"def",content:"速率/速度"},    {id:"x-intercept",type:"word",content:"X-intercept"},    {id:"x-intercept",type:"def",content:"X轴截距"},    {id:"y-intercept",type:"word",content:"Y-intercept"},    {id:"y-intercept",type:"def",content:"Y轴截距"}
  ]
},
{
  board: '25m', slug: '25m-y9-mastery-of-angles-1', category: '25m-y9', title: 'Mastery of Angles (1)', titleZh: '掌握角度 (1)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"acute-angle",type:"word",content:"Acute angle"},    {id:"acute-angle",type:"def",content:"锐角"},    {id:"alternate-interior-angles",type:"word",content:"Alternate interior angles"},    {id:"alternate-interior-angles",type:"def",content:"内错角"},    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角度"},    {id:"around-a-point",type:"word",content:"Around a point"},    {id:"around-a-point",type:"def",content:"绕一点"},    {id:"auxiliary-line",type:"word",content:"Auxiliary line"},    {id:"auxiliary-line",type:"def",content:"辅助线"},    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"同位角"},    {id:"decagon",type:"word",content:"Decagon"},    {id:"decagon",type:"def",content:"十边形"},    {id:"equilateral-triangle",type:"word",content:"Equilateral triangle"},    {id:"equilateral-triangle",type:"def",content:"等边三角形"},    {id:"exterior-angle",type:"word",content:"Exterior angle"},    {id:"exterior-angle",type:"def",content:"外角"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"}
  ]
},
{
  board: '25m', slug: '25m-y9-mastery-of-angles-2', category: '25m-y9', title: 'Mastery of Angles (2)', titleZh: '掌握角度 (2)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"heptagon",type:"word",content:"Heptagon"},    {id:"heptagon",type:"def",content:"七边形"},    {id:"hexagon",type:"word",content:"Hexagon"},    {id:"hexagon",type:"def",content:"六边形"},    {id:"interior-angle",type:"word",content:"Interior angle"},    {id:"interior-angle",type:"def",content:"内角"},    {id:"interior-angles",type:"word",content:"Interior angles"},    {id:"interior-angles",type:"def",content:"内角"},    {id:"irregular-polygon",type:"word",content:"Irregular polygon"},    {id:"irregular-polygon",type:"def",content:"不规则多边形"},    {id:"isosceles-triangle",type:"word",content:"Isosceles triangle"},    {id:"isosceles-triangle",type:"def",content:"等腰三角形"},    {id:"nonagon",type:"word",content:"Nonagon"},    {id:"nonagon",type:"def",content:"九边形"},    {id:"number-of-sides",type:"word",content:"Number of sides"},    {id:"number-of-sides",type:"def",content:"边数"},    {id:"obtuse-angle",type:"word",content:"Obtuse angle"},    {id:"obtuse-angle",type:"def",content:"钝角"},    {id:"octagon",type:"word",content:"Octagon"},    {id:"octagon",type:"def",content:"八边形"}
  ]
},
{
  board: '25m', slug: '25m-y9-mastery-of-angles-3', category: '25m-y9', title: 'Mastery of Angles (3)', titleZh: '掌握角度 (3)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"opposite-interior-angles",type:"word",content:"Opposite interior angles"},    {id:"opposite-interior-angles",type:"def",content:"相对内角"},    {id:"parallel-lines",type:"word",content:"Parallel lines"},    {id:"parallel-lines",type:"def",content:"平行线"},    {id:"pentagon",type:"word",content:"Pentagon"},    {id:"pentagon",type:"def",content:"五边形"},    {id:"polygon",type:"word",content:"Polygon"},    {id:"polygon",type:"def",content:"多边形"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"quadrilateral",type:"word",content:"Quadrilateral"},    {id:"quadrilateral",type:"def",content:"四边形"},    {id:"reason",type:"word",content:"Reason"},    {id:"reason",type:"def",content:"理由"},    {id:"reflex-angle",type:"word",content:"Reflex angle"},    {id:"reflex-angle",type:"def",content:"优角"},    {id:"regular-polygon",type:"word",content:"Regular polygon"},    {id:"regular-polygon",type:"def",content:"正多边形"},    {id:"right-angled-triangle",type:"word",content:"Right-angled triangle"},    {id:"right-angled-triangle",type:"def",content:"直角三角形"}
  ]
},
{
  board: '25m', slug: '25m-y9-mastery-of-angles-4', category: '25m-y9', title: 'Mastery of Angles (4)', titleZh: '掌握角度 (4)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"scalene-triangle",type:"word",content:"Scalene triangle"},    {id:"scalene-triangle",type:"def",content:"不等边三角形"},    {id:"statement",type:"word",content:"Statement"},    {id:"statement",type:"def",content:"陈述"},    {id:"straight-line",type:"word",content:"Straight line"},    {id:"straight-line",type:"def",content:"直线"},    {id:"sum",type:"word",content:"Sum"},    {id:"sum",type:"def",content:"和"},    {id:"sum-of-angles",type:"word",content:"Sum of angles"},    {id:"sum-of-angles",type:"def",content:"角度和"},    {id:"sum-of-exterior-angles",type:"word",content:"Sum of exterior angles"},    {id:"sum-of-exterior-angles",type:"def",content:"外角和"},    {id:"sum-of-interior-angles",type:"word",content:"Sum of interior angles"},    {id:"sum-of-interior-angles",type:"def",content:"内角和"},    {id:"theorem",type:"word",content:"Theorem"},    {id:"theorem",type:"def",content:"定理"},    {id:"transversal",type:"word",content:"Transversal"},    {id:"transversal",type:"def",content:"截线"},    {id:"triangle",type:"word",content:"Triangle"},    {id:"triangle",type:"def",content:"三角形"}
  ]
},
{
  board: '25m', slug: '25m-y9-mastery-of-angles-5', category: '25m-y9', title: 'Mastery of Angles (5)', titleZh: '掌握角度 (5)', unitNum: 4, unitTitle: 'Mastery of Angles', unitTitleZh: '掌握角度',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"},    {id:"vertically-opposite-angles",type:"word",content:"Vertically opposite angles"},    {id:"vertically-opposite-angles",type:"def",content:"对顶角"}
  ]
},
{
  board: '25m', slug: '25m-y9-pythagoras-theorem-1', category: '25m-y9', title: 'Pythagoras Theorem (1)', titleZh: '勾股定理 (1)', unitNum: 5, unitTitle: 'Pythagoras Theorem', unitTitleZh: '勾股定理',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"converse-proposition",type:"word",content:"Converse proposition"},    {id:"converse-proposition",type:"def",content:"逆命题"},    {id:"converse-theorem",type:"word",content:"Converse theorem"},    {id:"converse-theorem",type:"def",content:"逆定理"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"hypotenuse",type:"word",content:"Hypotenuse"},    {id:"hypotenuse",type:"def",content:"斜边"},    {id:"legs-of-a-right-triangle",type:"word",content:"Legs (of a right triangle)"},    {id:"legs-of-a-right-triangle",type:"def",content:"直角边"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"pythagoras-theorem",type:"word",content:"Pythagoras\' Theorem"},    {id:"pythagoras-theorem",type:"def",content:"勾股定理"},    {id:"pythagorean-triple",type:"word",content:"Pythagorean triple"},    {id:"pythagorean-triple",type:"def",content:"勾股数"}
  ]
},
{
  board: '25m', slug: '25m-y9-pythagoras-theorem-2', category: '25m-y9', title: 'Pythagoras Theorem (2)', titleZh: '勾股定理 (2)', unitNum: 5, unitTitle: 'Pythagoras Theorem', unitTitleZh: '勾股定理',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"right-angled-triangle",type:"word",content:"Right-angled triangle"},    {id:"right-angled-triangle",type:"def",content:"直角三角形"},    {id:"solve",type:"word",content:"Solve"},    {id:"solve",type:"def",content:"求解"},    {id:"square-power",type:"word",content:"Square"},    {id:"square-power",type:"def",content:"平方"},    {id:"square-root",type:"word",content:"Square root"},    {id:"square-root",type:"def",content:"平方根"},    {id:"two-dimensional",type:"word",content:"Two-dimensional"},    {id:"two-dimensional",type:"def",content:"二维"}
  ]
},
{
  board: '25m', slug: '25m-y9-2d-shape-1', category: '25m-y9', title: '2D Shape (1)', titleZh: '二维图形 (1)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"compound-shape",type:"word",content:"Compound Shape"},    {id:"compound-shape",type:"def",content:"复合图形"},    {id:"congruent",type:"word",content:"Congruent"},    {id:"congruent",type:"def",content:"全等"},    {id:"diagonal",type:"word",content:"Diagonal"},    {id:"diagonal",type:"def",content:"对角线"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"gap",type:"word",content:"Gap"},    {id:"gap",type:"def",content:"间隙"},    {id:"geometric-pattern",type:"word",content:"Geometric Pattern"},    {id:"geometric-pattern",type:"def",content:"几何图案"},    {id:"interior-angle",type:"word",content:"Interior Angle"},    {id:"interior-angle",type:"def",content:"内角"},    {id:"irregular-polygon",type:"word",content:"Irregular Polygon"},    {id:"irregular-polygon",type:"def",content:"不规则多边形"}
  ]
},
{
  board: '25m', slug: '25m-y9-2d-shape-2', category: '25m-y9', title: '2D Shape (2)', titleZh: '二维图形 (2)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"kite",type:"word",content:"Kite"},    {id:"kite",type:"def",content:"风筝形"},    {id:"line-of-symmetry",type:"word",content:"Line of Symmetry"},    {id:"line-of-symmetry",type:"def",content:"对称轴"},    {id:"median-line",type:"word",content:"Median Line"},    {id:"median-line",type:"def",content:"中位线"},    {id:"minimal-distance",type:"word",content:"Minimal Distance"},    {id:"minimal-distance",type:"def",content:"最短距离"},    {id:"order-of-rotational-symmetry",type:"word",content:"Order of Rotational Symmetry"},    {id:"order-of-rotational-symmetry",type:"def",content:"旋转对称阶数"},    {id:"overlap",type:"word",content:"Overlap"},    {id:"overlap",type:"def",content:"重叠"},    {id:"parallel",type:"word",content:"Parallel"},    {id:"parallel",type:"def",content:"平行"},    {id:"parallel-lines",type:"word",content:"Parallel Lines"},    {id:"parallel-lines",type:"def",content:"平行线"},    {id:"parallelogram",type:"word",content:"Parallelogram"},    {id:"parallelogram",type:"def",content:"平行四边形"},    {id:"pattern",type:"word",content:"Pattern"},    {id:"pattern",type:"def",content:"图案"}
  ]
},
{
  board: '25m', slug: '25m-y9-2d-shape-3', category: '25m-y9', title: '2D Shape (3)', titleZh: '二维图形 (3)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"perpendicular",type:"word",content:"Perpendicular"},    {id:"perpendicular",type:"def",content:"垂直"},    {id:"perpendicular-bisector",type:"word",content:"Perpendicular Bisector"},    {id:"perpendicular-bisector",type:"def",content:"垂直平分线"},    {id:"property",type:"word",content:"Property"},    {id:"property",type:"def",content:"性质"},    {id:"quadrilateral",type:"word",content:"Quadrilateral"},    {id:"quadrilateral",type:"def",content:"四边形"},    {id:"rectangle",type:"word",content:"Rectangle"},    {id:"rectangle",type:"def",content:"长方形"},    {id:"reflection",type:"word",content:"Reflection"},    {id:"reflection",type:"def",content:"反射/翻转"},    {id:"regular-polygon",type:"word",content:"Regular Polygon"},    {id:"regular-polygon",type:"def",content:"正多边形"},    {id:"repeating-pattern",type:"word",content:"Repeating Pattern"},    {id:"repeating-pattern",type:"def",content:"重复图案"},    {id:"rhombus",type:"word",content:"Rhombus"},    {id:"rhombus",type:"def",content:"菱形"}
  ]
},
{
  board: '25m', slug: '25m-y9-2d-shape-4', category: '25m-y9', title: '2D Shape (4)', titleZh: '二维图形 (4)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"rotation",type:"word",content:"Rotation"},    {id:"rotation",type:"def",content:"旋转"},    {id:"rotational-symmetry",type:"word",content:"Rotational Symmetry"},    {id:"rotational-symmetry",type:"def",content:"旋转对称"},    {id:"side",type:"word",content:"Side"},    {id:"side",type:"def",content:"边"},    {id:"similar",type:"word",content:"Similar"},    {id:"similar",type:"def",content:"相似"},    {id:"square-shape",type:"word",content:"Square"},    {id:"square-shape",type:"def",content:"正方形"},    {id:"symmetry",type:"word",content:"Symmetry"},    {id:"symmetry",type:"def",content:"对称"},    {id:"tessellation",type:"word",content:"Tessellation"},    {id:"tessellation",type:"def",content:"镶嵌"},    {id:"tiling",type:"word",content:"Tiling"},    {id:"tiling",type:"def",content:"铺设"},    {id:"transformation",type:"word",content:"Transformation"},    {id:"transformation",type:"def",content:"变换"},    {id:"translation",type:"word",content:"Translation"},    {id:"translation",type:"def",content:"平移"}
  ]
},
{
  board: '25m', slug: '25m-y9-2d-shape-5', category: '25m-y9', title: '2D Shape (5)', titleZh: '二维图形 (5)', unitNum: 6, unitTitle: '2D Shape', unitTitleZh: '二维图形',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"trapezium",type:"word",content:"Trapezium"},    {id:"trapezium",type:"def",content:"梯形"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"}
  ]
},
{
  board: '25m', slug: '25m-y9-percentages-1', category: '25m-y9', title: 'Percentages (1)', titleZh: '百分比 (1)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"compound-interest",type:"word",content:"Compound interest"},    {id:"compound-interest",type:"def",content:"复利"},    {id:"convert",type:"word",content:"Convert"},    {id:"convert",type:"def",content:"转换"},    {id:"credit-card",type:"word",content:"Credit card"},    {id:"credit-card",type:"def",content:"信用卡"},    {id:"data-analysis",type:"word",content:"Data analysis"},    {id:"data-analysis",type:"def",content:"数据分析"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"decrease",type:"word",content:"Decrease"},    {id:"decrease",type:"def",content:"减少"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"discount",type:"word",content:"Discount"},    {id:"discount",type:"def",content:"折扣"},    {id:"equivalent",type:"word",content:"Equivalent"},    {id:"equivalent",type:"def",content:"等价的"},    {id:"exponential-decay",type:"word",content:"Exponential decay"},    {id:"exponential-decay",type:"def",content:"指数衰减"}
  ]
},
{
  board: '25m', slug: '25m-y9-percentages-2', category: '25m-y9', title: 'Percentages (2)', titleZh: '百分比 (2)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"exponential-growth",type:"word",content:"Exponential growth"},    {id:"exponential-growth",type:"def",content:"指数增长"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"increase",type:"word",content:"Increase"},    {id:"increase",type:"def",content:"增加"},    {id:"interest-rate",type:"word",content:"Interest rate"},    {id:"interest-rate",type:"def",content:"利率"},    {id:"loan",type:"word",content:"Loan"},    {id:"loan",type:"def",content:"贷款"},    {id:"loss",type:"word",content:"Loss"},    {id:"loss",type:"def",content:"亏损"},    {id:"mortgage",type:"word",content:"Mortgage"},    {id:"mortgage",type:"def",content:"抵押贷款"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"original-amount",type:"word",content:"Original amount"},    {id:"original-amount",type:"def",content:"原始数量"},    {id:"percentage",type:"word",content:"Percentage"},    {id:"percentage",type:"def",content:"百分比"}
  ]
},
{
  board: '25m', slug: '25m-y9-percentages-3', category: '25m-y9', title: 'Percentages (3)', titleZh: '百分比 (3)', unitNum: 7, unitTitle: 'Percentages', unitTitleZh: '百分比',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"principal",type:"word",content:"Principal"},    {id:"principal",type:"def",content:"本金"},    {id:"profit",type:"word",content:"Profit"},    {id:"profit",type:"def",content:"利润"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例"},    {id:"quantity",type:"word",content:"Quantity"},    {id:"quantity",type:"def",content:"数量"},    {id:"reverse-percentage",type:"word",content:"Reverse percentage"},    {id:"reverse-percentage",type:"def",content:"反向百分比"},    {id:"savings",type:"word",content:"Savings"},    {id:"savings",type:"def",content:"储蓄"},    {id:"simple-interest",type:"word",content:"Simple interest"},    {id:"simple-interest",type:"def",content:"单利"},    {id:"tax",type:"word",content:"Tax"},    {id:"tax",type:"def",content:"税"},    {id:"time-period",type:"word",content:"Time period"},    {id:"time-period",type:"def",content:"时间周期"}
  ]
},
{
  board: '25m', slug: '25m-y9-statistical-sampling-1', category: '25m-y9', title: 'Statistical Sampling (1)', titleZh: '统计抽样 (1)', unitNum: 8, unitTitle: 'Statistical Sampling', unitTitleZh: '统计抽样',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"bias",type:"word",content:"Bias"},    {id:"bias",type:"def",content:"偏差/偏倚"},    {id:"census",type:"word",content:"Census"},    {id:"census",type:"def",content:"普查"},    {id:"continuous-data",type:"word",content:"Continuous Data"},    {id:"continuous-data",type:"def",content:"连续数据"},    {id:"data-set",type:"word",content:"Data Set"},    {id:"data-set",type:"def",content:"数据集"},    {id:"discrete-data",type:"word",content:"Discrete Data"},    {id:"discrete-data",type:"def",content:"离散数据"},    {id:"mean",type:"word",content:"Mean"},    {id:"mean",type:"def",content:"平均数"},    {id:"median-value",type:"word",content:"Median"},    {id:"median-value",type:"def",content:"中位数"},    {id:"mode",type:"word",content:"Mode"},    {id:"mode",type:"def",content:"众数"},    {id:"population",type:"word",content:"Population"},    {id:"population",type:"def",content:"总体"},    {id:"random-sampling",type:"word",content:"Random Sampling"},    {id:"random-sampling",type:"def",content:"随机抽样"}
  ]
},
{
  board: '25m', slug: '25m-y9-statistical-sampling-2', category: '25m-y9', title: 'Statistical Sampling (2)', titleZh: '统计抽样 (2)', unitNum: 8, unitTitle: 'Statistical Sampling', unitTitleZh: '统计抽样',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"range-statistics",type:"word",content:"Range"},    {id:"range-statistics",type:"def",content:"极差"},    {id:"representative-sample",type:"word",content:"Representative Sample"},    {id:"representative-sample",type:"def",content:"代表性样本"},    {id:"sample",type:"word",content:"Sample"},    {id:"sample",type:"def",content:"样本"},    {id:"sampling",type:"word",content:"Sampling"},    {id:"sampling",type:"def",content:"抽样"},    {id:"survey",type:"word",content:"Survey"},    {id:"survey",type:"def",content:"调查"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-1', category: '25m-y9', title: 'Graphical Representation of Statistical Data (1)', titleZh: '统计数据的图形表示 (1)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"area-of-bar",type:"word",content:"Area (of bar)"},    {id:"area-of-bar",type:"def",content:"面积 (条形)"},    {id:"bar-chart",type:"word",content:"Bar chart"},    {id:"bar-chart",type:"def",content:"条形图"},    {id:"bivariate-data",type:"word",content:"Bivariate data"},    {id:"bivariate-data",type:"def",content:"二元数据"},    {id:"causation",type:"word",content:"Causation"},    {id:"causation",type:"def",content:"因果关系"},    {id:"class-interval",type:"word",content:"Class interval"},    {id:"class-interval",type:"def",content:"组距"},    {id:"class-width",type:"word",content:"Class width"},    {id:"class-width",type:"def",content:"组宽"},    {id:"continuous-data",type:"word",content:"Continuous data"},    {id:"continuous-data",type:"def",content:"连续数据"},    {id:"correlation",type:"word",content:"Correlation"},    {id:"correlation",type:"def",content:"相关性"},    {id:"cumulative-frequency",type:"word",content:"Cumulative frequency"},    {id:"cumulative-frequency",type:"def",content:"累积频率"},    {id:"cumulative-frequency-graph",type:"word",content:"Cumulative frequency graph"},    {id:"cumulative-frequency-graph",type:"def",content:"累积频率图"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-2', category: '25m-y9', title: 'Graphical Representation of Statistical Data (2)', titleZh: '统计数据的图形表示 (2)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"data",type:"word",content:"Data"},    {id:"data",type:"def",content:"数据"},    {id:"data-dispersion",type:"word",content:"Data dispersion"},    {id:"data-dispersion",type:"def",content:"数据离散度"},    {id:"dependent-variable",type:"word",content:"Dependent variable"},    {id:"dependent-variable",type:"def",content:"因变量"},    {id:"distribution",type:"word",content:"Distribution"},    {id:"distribution",type:"def",content:"分布"},    {id:"equal-intervals",type:"word",content:"Equal intervals"},    {id:"equal-intervals",type:"def",content:"等距间隔"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估计"},    {id:"estimated-mean",type:"word",content:"Estimated mean"},    {id:"estimated-mean",type:"def",content:"估计平均数"},    {id:"extrapolation",type:"word",content:"Extrapolation"},    {id:"extrapolation",type:"def",content:"外推"},    {id:"frequency",type:"word",content:"Frequency"},    {id:"frequency",type:"def",content:"频率"},    {id:"frequency-density",type:"word",content:"Frequency density"},    {id:"frequency-density",type:"def",content:"频率密度"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-3', category: '25m-y9', title: 'Graphical Representation of Statistical Data (3)', titleZh: '统计数据的图形表示 (3)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"frequency-table",type:"word",content:"Frequency table"},    {id:"frequency-table",type:"def",content:"频率表"},    {id:"group-frequency-table",type:"word",content:"Group frequency table"},    {id:"group-frequency-table",type:"def",content:"分组频率表"},    {id:"grouped-data",type:"word",content:"Grouped data"},    {id:"grouped-data",type:"def",content:"分组数据"},    {id:"histogram",type:"word",content:"Histogram"},    {id:"histogram",type:"def",content:"直方图"},    {id:"independent-variable",type:"word",content:"Independent variable"},    {id:"independent-variable",type:"def",content:"自变量"},    {id:"inference",type:"word",content:"Inference"},    {id:"inference",type:"def",content:"推论"},    {id:"interpolation",type:"word",content:"Interpolation"},    {id:"interpolation",type:"def",content:"内插"},    {id:"interpretation",type:"word",content:"Interpretation"},    {id:"interpretation",type:"def",content:"解释"},    {id:"interquartile-range-iqr",type:"word",content:"Interquartile range (IQR)"},    {id:"interquartile-range-iqr",type:"def",content:"四分位距 (IQR)"},    {id:"line-of-best-fit",type:"word",content:"Line of best fit"},    {id:"line-of-best-fit",type:"def",content:"最佳拟合线"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-4', category: '25m-y9', title: 'Graphical Representation of Statistical Data (4)', titleZh: '统计数据的图形表示 (4)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"lower-quartile-q1",type:"word",content:"Lower quartile (Q1)"},    {id:"lower-quartile-q1",type:"def",content:"下四分位数 (Q1)"},    {id:"mean",type:"word",content:"Mean"},    {id:"mean",type:"def",content:"平均数"},    {id:"median-value",type:"word",content:"Median"},    {id:"median-value",type:"def",content:"中位数"},    {id:"median-from-graph",type:"word",content:"Median (from graph)"},    {id:"median-from-graph",type:"def",content:"中位数 (从图中)"},    {id:"mid-point",type:"word",content:"Mid-point"},    {id:"mid-point",type:"def",content:"中点值"},    {id:"modal-class",type:"word",content:"Modal class"},    {id:"modal-class",type:"def",content:"众数类"},    {id:"mode",type:"word",content:"Mode"},    {id:"mode",type:"def",content:"众数"},    {id:"negative-correlation",type:"word",content:"Negative correlation"},    {id:"negative-correlation",type:"def",content:"负相关"},    {id:"no-correlation",type:"word",content:"No correlation"},    {id:"no-correlation",type:"def",content:"无相关"},    {id:"outlier",type:"word",content:"Outlier"},    {id:"outlier",type:"def",content:"离群点"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-5', category: '25m-y9', title: 'Graphical Representation of Statistical Data (5)', titleZh: '统计数据的图形表示 (5)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"pictogram",type:"word",content:"Pictogram"},    {id:"pictogram",type:"def",content:"象形图"},    {id:"pie-chart",type:"word",content:"Pie chart"},    {id:"pie-chart",type:"def",content:"饼图"},    {id:"positive-correlation",type:"word",content:"Positive correlation"},    {id:"positive-correlation",type:"def",content:"正相关"},    {id:"quartile",type:"word",content:"Quartile"},    {id:"quartile",type:"def",content:"四分位数"},    {id:"range-statistics",type:"word",content:"Range"},    {id:"range-statistics",type:"def",content:"极差"},    {id:"scatter-graph",type:"word",content:"Scatter graph"},    {id:"scatter-graph",type:"def",content:"散点图"},    {id:"skewness",type:"word",content:"Skewness"},    {id:"skewness",type:"def",content:"偏度"},    {id:"statistical-data",type:"word",content:"Statistical data"},    {id:"statistical-data",type:"def",content:"统计数据"},    {id:"stem-and-leaf-diagram",type:"word",content:"Stem-and-leaf diagram"},    {id:"stem-and-leaf-diagram",type:"def",content:"茎叶图"},    {id:"trend",type:"word",content:"Trend"},    {id:"trend",type:"def",content:"趋势"}
  ]
},
{
  board: '25m', slug: '25m-y9-graphical-representation-of-st-6', category: '25m-y9', title: 'Graphical Representation of Statistical Data (6)', titleZh: '统计数据的图形表示 (6)', unitNum: 9, unitTitle: 'Graphical Representation of Statistical Data', unitTitleZh: '统计数据的图形表示',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"unequal-intervals",type:"word",content:"Unequal intervals"},    {id:"unequal-intervals",type:"def",content:"不等距间隔"},    {id:"upper-quartile-q3",type:"word",content:"Upper quartile (Q3)"},    {id:"upper-quartile-q3",type:"def",content:"上四分位数 (Q3)"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-fractions-1', category: '25m-y9', title: 'Algebraic Fractions (1)', titleZh: '代数分数 (1)', unitNum: 10, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"algebraic-fraction",type:"word",content:"Algebraic Fraction"},    {id:"algebraic-fraction",type:"def",content:"代数分数"},    {id:"common-factor",type:"word",content:"Common Factor"},    {id:"common-factor",type:"def",content:"公因数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"factorise",type:"word",content:"Factorise"},    {id:"factorise",type:"def",content:"因式分解"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"linear-equation",type:"word",content:"Linear Equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"quadratic-expression",type:"word",content:"Quadratic Expression"},    {id:"quadratic-expression",type:"def",content:"二次表达式"}
  ]
},
{
  board: '25m', slug: '25m-y9-algebraic-fractions-2', category: '25m-y9', title: 'Algebraic Fractions (2)', titleZh: '代数分数 (2)', unitNum: 10, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"rational-expression",type:"word",content:"Rational Expression"},    {id:"rational-expression",type:"def",content:"有理表达式"},    {id:"rearrange",type:"word",content:"Rearrange"},    {id:"rearrange",type:"def",content:"重排"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"subject",type:"word",content:"Subject"},    {id:"subject",type:"def",content:"主项"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y9-practice-with-constructions-1', category: '25m-y9', title: 'Practice with Constructions (1)', titleZh: '构造练习 (1)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle",type:"word",content:"Angle"},    {id:"angle",type:"def",content:"角"},    {id:"angle-bisector",type:"word",content:"Angle bisector"},    {id:"angle-bisector",type:"def",content:"角平分线"},    {id:"asa-angle-side-angle",type:"word",content:"ASA (Angle-Side-Angle)"},    {id:"asa-angle-side-angle",type:"def",content:"角边角"},    {id:"bisector",type:"word",content:"Bisector"},    {id:"bisector",type:"def",content:"平分线"},    {id:"centroid",type:"word",content:"Centroid"},    {id:"centroid",type:"def",content:"重心"},    {id:"circumcenter",type:"word",content:"Circumcenter"},    {id:"circumcenter",type:"def",content:"外心"},    {id:"circumscribed-circle",type:"word",content:"Circumscribed circle"},    {id:"circumscribed-circle",type:"def",content:"外接圆"},    {id:"compass",type:"word",content:"Compass"},    {id:"compass",type:"def",content:"圆规"},    {id:"construction",type:"word",content:"Construction"},    {id:"construction",type:"def",content:"构造"},    {id:"equidistant",type:"word",content:"Equidistant"},    {id:"equidistant",type:"def",content:"等距的"}
  ]
},
{
  board: '25m', slug: '25m-y9-practice-with-constructions-2', category: '25m-y9', title: 'Practice with Constructions (2)', titleZh: '构造练习 (2)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"equilateral-triangle",type:"word",content:"Equilateral triangle"},    {id:"equilateral-triangle",type:"def",content:"等边三角形"},    {id:"inscribed-circle",type:"word",content:"Inscribed circle"},    {id:"inscribed-circle",type:"def",content:"内切圆"},    {id:"intersection-point",type:"word",content:"Intersection"},    {id:"intersection-point",type:"def",content:"交点"},    {id:"isosceles-triangle",type:"word",content:"Isosceles triangle"},    {id:"isosceles-triangle",type:"def",content:"等腰三角形"},    {id:"line",type:"word",content:"Line"},    {id:"line",type:"def",content:"线"},    {id:"line-segment",type:"word",content:"Line segment"},    {id:"line-segment",type:"def",content:"线段"},    {id:"locus",type:"word",content:"Locus"},    {id:"locus",type:"def",content:"轨迹"},    {id:"median-line",type:"word",content:"Median"},    {id:"median-line",type:"def",content:"中线"},    {id:"perpendicular",type:"word",content:"Perpendicular"},    {id:"perpendicular",type:"def",content:"垂直的"},    {id:"perpendicular-bisector",type:"word",content:"Perpendicular bisector"},    {id:"perpendicular-bisector",type:"def",content:"垂直平分线"}
  ]
},
{
  board: '25m', slug: '25m-y9-practice-with-constructions-3', category: '25m-y9', title: 'Practice with Constructions (3)', titleZh: '构造练习 (3)', unitNum: 11, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"point",type:"word",content:"Point"},    {id:"point",type:"def",content:"点"},    {id:"quadrilateral",type:"word",content:"Quadrilateral"},    {id:"quadrilateral",type:"def",content:"四边形"},    {id:"rhombus",type:"word",content:"Rhombus"},    {id:"rhombus",type:"def",content:"菱形"},    {id:"rhs-right-angle-hypotenuse-side",type:"word",content:"RHS (Right-angle-Hypotenuse-Side)"},    {id:"rhs-right-angle-hypotenuse-side",type:"def",content:"直角斜边边"},    {id:"right-angle",type:"word",content:"Right angle"},    {id:"right-angle",type:"def",content:"直角"},    {id:"sas-side-angle-side",type:"word",content:"SAS (Side-Angle-Side)"},    {id:"sas-side-angle-side",type:"def",content:"边角边"},    {id:"square-shape",type:"word",content:"Square"},    {id:"square-shape",type:"def",content:"正方形"},    {id:"sss-side-side-side",type:"word",content:"SSS (Side-Side-Side)"},    {id:"sss-side-side-side",type:"def",content:"边边边"},    {id:"straightedge",type:"word",content:"Straightedge"},    {id:"straightedge",type:"def",content:"直尺"}
  ]
},
{
  board: '25m', slug: '25m-y9-congruence-and-similarity-1', category: '25m-y9', title: 'Congruence and Similarity (1)', titleZh: '全等和相似 (1)', unitNum: 12, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle-side-angle-asa",type:"word",content:"Angle-Side-Angle (ASA)"},    {id:"angle-side-angle-asa",type:"def",content:"角-边-角 (ASA)"},    {id:"congruence",type:"word",content:"Congruence"},    {id:"congruence",type:"def",content:"全等"},    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"对应角"},    {id:"corresponding-sides",type:"word",content:"Corresponding sides"},    {id:"corresponding-sides",type:"def",content:"对应边"},    {id:"enlargement",type:"word",content:"Enlargement"},    {id:"enlargement",type:"def",content:"放大"},    {id:"hypotenuse",type:"word",content:"Hypotenuse"},    {id:"hypotenuse",type:"def",content:"斜边"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比例"},    {id:"right-angle-hypotenuse-side-rhs",type:"word",content:"Right-angle-Hypotenuse-Side (RHS)"},    {id:"right-angle-hypotenuse-side-rhs",type:"def",content:"直角-斜边-边 (RHS)"},    {id:"scale-factor",type:"word",content:"Scale factor"},    {id:"scale-factor",type:"def",content:"比例因子"}
  ]
},
{
  board: '25m', slug: '25m-y9-congruence-and-similarity-2', category: '25m-y9', title: 'Congruence and Similarity (2)', titleZh: '全等和相似 (2)', unitNum: 12, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"side-angle-side-sas",type:"word",content:"Side-Angle-Side (SAS)"},    {id:"side-angle-side-sas",type:"def",content:"边-角-边 (SAS)"},    {id:"side-side-side-sss",type:"word",content:"Side-Side-Side (SSS)"},    {id:"side-side-side-sss",type:"def",content:"边-边-边 (SSS)"},    {id:"similarity",type:"word",content:"Similarity"},    {id:"similarity",type:"def",content:"相似"},    {id:"triangle",type:"word",content:"Triangle"},    {id:"triangle",type:"def",content:"三角形"}
  ]
},

/* ═══ Year 10 (36 levels, 327 words) ═══ */,
{
  board: '25m', slug: '25m-y10-real-numbers-1', category: '25m-y10', title: 'Real Numbers (1)', titleZh: '实数 (1)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"approximate",type:"word",content:"Approximate"},    {id:"approximate",type:"def",content:"近似"},    {id:"conjugate-surds",type:"word",content:"Conjugate Surds"},    {id:"conjugate-surds",type:"def",content:"共轭根式"},    {id:"cube-root",type:"word",content:"Cube Root"},    {id:"cube-root",type:"def",content:"立方根"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"difference-of-squares",type:"word",content:"Difference of Squares"},    {id:"difference-of-squares",type:"def",content:"平方差"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估算"},    {id:"expand-brackets",type:"word",content:"Expand Brackets"},    {id:"expand-brackets",type:"def",content:"展开括号"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"index",type:"word",content:"Index"},    {id:"index",type:"def",content:"根指数"}
  ]
},
{
  board: '25m', slug: '25m-y10-real-numbers-2', category: '25m-y10', title: 'Real Numbers (2)', titleZh: '实数 (2)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"irrational-numbers",type:"word",content:"Irrational Numbers"},    {id:"irrational-numbers",type:"def",content:"无理数"},    {id:"like-surds",type:"word",content:"Like Surds"},    {id:"like-surds",type:"def",content:"同类根式"},    {id:"natural-numbers",type:"word",content:"Natural Numbers"},    {id:"natural-numbers",type:"def",content:"自然数"},    {id:"non-terminating-non-recurring-decimal",type:"word",content:"Non-terminating, Non-recurring Decimal"},    {id:"non-terminating-non-recurring-decimal",type:"def",content:"无限不循环小数"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"quadratic-surd",type:"word",content:"Quadratic Surd"},    {id:"quadratic-surd",type:"def",content:"二次根式"},    {id:"radical",type:"word",content:"Radical"},    {id:"radical",type:"def",content:"根式"},    {id:"radicand",type:"word",content:"Radicand"},    {id:"radicand",type:"def",content:"被开方数"},    {id:"rational-numbers",type:"word",content:"Rational Numbers"},    {id:"rational-numbers",type:"def",content:"有理数"}
  ]
},
{
  board: '25m', slug: '25m-y10-real-numbers-3', category: '25m-y10', title: 'Real Numbers (3)', titleZh: '实数 (3)', unitNum: 1, unitTitle: 'Real Numbers', unitTitleZh: '实数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"rationalize-the-denominator",type:"word",content:"Rationalize the Denominator"},    {id:"rationalize-the-denominator",type:"def",content:"有理化分母"},    {id:"real-numbers",type:"word",content:"Real Numbers"},    {id:"real-numbers",type:"def",content:"实数"},    {id:"recurring-decimal",type:"word",content:"Recurring Decimal"},    {id:"recurring-decimal",type:"def",content:"循环小数"},    {id:"simplest-form",type:"word",content:"Simplest Form"},    {id:"simplest-form",type:"def",content:"最简形式"},    {id:"square-root",type:"word",content:"Square Root"},    {id:"square-root",type:"def",content:"平方根"},    {id:"surd",type:"word",content:"Surd"},    {id:"surd",type:"def",content:"根式"},    {id:"terminating-decimal",type:"word",content:"Terminating Decimal"},    {id:"terminating-decimal",type:"def",content:"有限小数"},    {id:"unlike-surds",type:"word",content:"Unlike Surds"},    {id:"unlike-surds",type:"def",content:"非同类根式"},    {id:"whole-numbers",type:"word",content:"Whole Numbers"},    {id:"whole-numbers",type:"def",content:"非负整数"}
  ]
},
{
  board: '25m', slug: '25m-y10-algebraic-fractions-1', category: '25m-y10', title: 'Algebraic Fractions (1)', titleZh: '代数分数 (1)', unitNum: 2, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"algebraic-fraction",type:"word",content:"Algebraic Fraction"},    {id:"algebraic-fraction",type:"def",content:"代数分数"},    {id:"common-denominator",type:"word",content:"Common Denominator"},    {id:"common-denominator",type:"def",content:"公分母"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"factorise",type:"word",content:"Factorise"},    {id:"factorise",type:"def",content:"因式分解"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"linear-equation",type:"word",content:"Linear Equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"quadratic-expression",type:"word",content:"Quadratic Expression"},    {id:"quadratic-expression",type:"def",content:"二次表达式"}
  ]
},
{
  board: '25m', slug: '25m-y10-algebraic-fractions-2', category: '25m-y10', title: 'Algebraic Fractions (2)', titleZh: '代数分数 (2)', unitNum: 2, unitTitle: 'Algebraic Fractions', unitTitleZh: '代数分数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"rational-expression",type:"word",content:"Rational Expression"},    {id:"rational-expression",type:"def",content:"有理表达式"},    {id:"rearrange",type:"word",content:"Rearrange"},    {id:"rearrange",type:"def",content:"重排"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"subject",type:"word",content:"Subject"},    {id:"subject",type:"def",content:"主项"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y10-quadratic-equations-1', category: '25m-y10', title: 'Quadratic Equations (1)', titleZh: '二次方程 (1)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"axis-of-symmetry",type:"word",content:"Axis of symmetry"},    {id:"axis-of-symmetry",type:"def",content:"对称轴"},    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"completing-the-square",type:"word",content:"Completing the square"},    {id:"completing-the-square",type:"def",content:"配方法 / 完全平方法"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"cubic-equation",type:"word",content:"Cubic equation"},    {id:"cubic-equation",type:"def",content:"立方方程"},    {id:"difference-of-two-squares",type:"word",content:"Difference of two squares"},    {id:"difference-of-two-squares",type:"def",content:"平方差"},    {id:"discriminant",type:"word",content:"Discriminant"},    {id:"discriminant",type:"def",content:"判别式"},    {id:"elimination-method",type:"word",content:"Elimination method"},    {id:"elimination-method",type:"def",content:"消元法"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expand",type:"word",content:"Expand"},    {id:"expand",type:"def",content:"展开"}
  ]
},
{
  board: '25m', slug: '25m-y10-quadratic-equations-2', category: '25m-y10', title: 'Quadratic Equations (2)', titleZh: '二次方程 (2)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"factorisation",type:"word",content:"Factorisation"},    {id:"factorisation",type:"def",content:"因式分解"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图 / 图形"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"linear-equation",type:"word",content:"Linear equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"maximum-point",type:"word",content:"Maximum point"},    {id:"maximum-point",type:"def",content:"最大值点"},    {id:"minimum-point",type:"word",content:"Minimum point"},    {id:"minimum-point",type:"def",content:"最小值点"},    {id:"parabola",type:"word",content:"Parabola"},    {id:"parabola",type:"def",content:"抛物线"},    {id:"quadratic-equation",type:"word",content:"Quadratic equation"},    {id:"quadratic-equation",type:"def",content:"一元二次方程"},    {id:"quadratic-formula",type:"word",content:"Quadratic formula"},    {id:"quadratic-formula",type:"def",content:"二次公式"},    {id:"real-roots",type:"word",content:"Real roots"},    {id:"real-roots",type:"def",content:"实根"}
  ]
},
{
  board: '25m', slug: '25m-y10-quadratic-equations-3', category: '25m-y10', title: 'Quadratic Equations (3)', titleZh: '二次方程 (3)', unitNum: 3, unitTitle: 'Quadratic Equations', unitTitleZh: '二次方程',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"root-solution",type:"word",content:"Root / Solution"},    {id:"root-solution",type:"def",content:"根 / 解"},    {id:"roots",type:"word",content:"Roots"},    {id:"roots",type:"def",content:"根"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"化简"},    {id:"simultaneous-equations",type:"word",content:"Simultaneous equations"},    {id:"simultaneous-equations",type:"def",content:"联立方程"},    {id:"sketch",type:"word",content:"Sketch"},    {id:"sketch",type:"def",content:"草图"},    {id:"table-of-values",type:"word",content:"Table of values"},    {id:"table-of-values",type:"def",content:"数值表"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"turning-point-vertex",type:"word",content:"Turning point / Vertex"},    {id:"turning-point-vertex",type:"def",content:"转折点 / 顶点"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y10-simultaneous-equations-1', category: '25m-y10', title: 'Simultaneous Equations (1)', titleZh: '联立方程组 (1)', unitNum: 4, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"eliminate",type:"word",content:"Eliminate"},    {id:"eliminate",type:"def",content:"消去"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"isolate",type:"word",content:"Isolate"},    {id:"isolate",type:"def",content:"隔离"},    {id:"linear-equation",type:"word",content:"Linear Equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"quadratic-equation",type:"word",content:"Quadratic Equation"},    {id:"quadratic-equation",type:"def",content:"二次方程"},    {id:"simultaneous-equations",type:"word",content:"Simultaneous Equations"},    {id:"simultaneous-equations",type:"def",content:"联立方程组"},    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"substitution-method",type:"word",content:"Substitution Method"},    {id:"substitution-method",type:"def",content:"代入法"}
  ]
},
{
  board: '25m', slug: '25m-y10-simultaneous-equations-2', category: '25m-y10', title: 'Simultaneous Equations (2)', titleZh: '联立方程组 (2)', unitNum: 4, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"system-of-equations",type:"word",content:"System of Equations"},    {id:"system-of-equations",type:"def",content:"方程组"},    {id:"three-unknowns",type:"word",content:"Three Unknowns"},    {id:"three-unknowns",type:"def",content:"三个未知数"},    {id:"two-unknowns",type:"word",content:"Two Unknowns"},    {id:"two-unknowns",type:"def",content:"两个未知数"},    {id:"unknown",type:"word",content:"Unknown"},    {id:"unknown",type:"def",content:"未知数"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y10-functions-1', category: '25m-y10', title: 'Functions (1)', titleZh: '函数 (1)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"asymptote",type:"word",content:"Asymptote"},    {id:"asymptote",type:"def",content:"渐近线"},    {id:"axis-of-symmetry",type:"word",content:"Axis of symmetry"},    {id:"axis-of-symmetry",type:"def",content:"对称轴"},    {id:"completing-the-square",type:"word",content:"Completing the square"},    {id:"completing-the-square",type:"def",content:"配方法"},    {id:"concave-updown",type:"word",content:"Concave up/down"},    {id:"concave-updown",type:"def",content:"开口向上/向下"},    {id:"constant-of-proportionality",type:"word",content:"Constant of proportionality"},    {id:"constant-of-proportionality",type:"def",content:"比例常数"},    {id:"coordinate",type:"word",content:"Coordinate"},    {id:"coordinate",type:"def",content:"坐标"},    {id:"domain",type:"word",content:"Domain"},    {id:"domain",type:"def",content:"定义域"},    {id:"extremum",type:"word",content:"Extremum"},    {id:"extremum",type:"def",content:"极值"},    {id:"general-form",type:"word",content:"General form"},    {id:"general-form",type:"def",content:"一般式"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图像"}
  ]
},
{
  board: '25m', slug: '25m-y10-functions-2', category: '25m-y10', title: 'Functions (2)', titleZh: '函数 (2)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"hyperbola",type:"word",content:"Hyperbola"},    {id:"hyperbola",type:"def",content:"双曲线"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"intercept-form",type:"word",content:"Intercept form"},    {id:"intercept-form",type:"def",content:"截距式"},    {id:"inverse-proportional-function",type:"word",content:"Inverse proportional function"},    {id:"inverse-proportional-function",type:"def",content:"反比例函数"},    {id:"maximum-value",type:"word",content:"Maximum value"},    {id:"maximum-value",type:"def",content:"最大值"},    {id:"minimum-value",type:"word",content:"Minimum value"},    {id:"minimum-value",type:"def",content:"最小值"},    {id:"monotonicity",type:"word",content:"Monotonicity"},    {id:"monotonicity",type:"def",content:"单调性"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"parabola",type:"word",content:"Parabola"},    {id:"parabola",type:"def",content:"抛物线"},    {id:"quadrant",type:"word",content:"Quadrant"},    {id:"quadrant",type:"def",content:"象限"}
  ]
},
{
  board: '25m', slug: '25m-y10-functions-3', category: '25m-y10', title: 'Functions (3)', titleZh: '函数 (3)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"quadratic-function",type:"word",content:"Quadratic function"},    {id:"quadratic-function",type:"def",content:"二次函数"},    {id:"range-function",type:"word",content:"Range"},    {id:"range-function",type:"def",content:"值域"},    {id:"reciprocal",type:"word",content:"Reciprocal"},    {id:"reciprocal",type:"def",content:"倒数"},    {id:"symmetry",type:"word",content:"Symmetry"},    {id:"symmetry",type:"def",content:"对称性"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"},    {id:"vertex-form",type:"word",content:"Vertex form"},    {id:"vertex-form",type:"def",content:"顶点式"},    {id:"x-intercept",type:"word",content:"X-intercept"},    {id:"x-intercept",type:"def",content:"x 截距"},    {id:"y-intercept",type:"word",content:"Y-intercept"},    {id:"y-intercept",type:"def",content:"y 截距"}
  ]
},
{
  board: '25m', slug: '25m-y10-further-trigonometry-1', category: '25m-y10', title: 'Further Trigonometry (1)', titleZh: '进阶三角学 (1)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"adjacent-side",type:"word",content:"Adjacent side"},    {id:"adjacent-side",type:"def",content:"邻边"},    {id:"alternate-angles",type:"word",content:"Alternate angles"},    {id:"alternate-angles",type:"def",content:"内错角"},    {id:"angle-of-depression",type:"word",content:"Angle of depression"},    {id:"angle-of-depression",type:"def",content:"俯角"},    {id:"angle-of-elevation",type:"word",content:"Angle of elevation"},    {id:"angle-of-elevation",type:"def",content:"仰角"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"back-bearing",type:"word",content:"Back bearing"},    {id:"back-bearing",type:"def",content:"反方位角"},    {id:"bearing",type:"word",content:"Bearing"},    {id:"bearing",type:"def",content:"方位角"},    {id:"clockwise",type:"word",content:"Clockwise"},    {id:"clockwise",type:"def",content:"顺时针"},    {id:"congruence",type:"word",content:"Congruence"},    {id:"congruence",type:"def",content:"全等"},    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"对应角"}
  ]
},
{
  board: '25m', slug: '25m-y10-further-trigonometry-2', category: '25m-y10', title: 'Further Trigonometry (2)', titleZh: '进阶三角学 (2)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"同位角"},    {id:"corresponding-sides",type:"word",content:"Corresponding sides"},    {id:"corresponding-sides",type:"def",content:"对应边"},    {id:"cosine",type:"word",content:"Cosine"},    {id:"cosine",type:"def",content:"余弦"},    {id:"cosine-rule",type:"word",content:"Cosine Rule"},    {id:"cosine-rule",type:"def",content:"余弦定理"},    {id:"displacement",type:"word",content:"Displacement"},    {id:"displacement",type:"def",content:"位移"},    {id:"distance",type:"word",content:"Distance"},    {id:"distance",type:"def",content:"距离"},    {id:"exact-value",type:"word",content:"Exact value"},    {id:"exact-value",type:"def",content:"精确值"},    {id:"hypotenuse",type:"word",content:"Hypotenuse"},    {id:"hypotenuse",type:"def",content:"斜边"},    {id:"interior-angles",type:"word",content:"Interior angles"},    {id:"interior-angles",type:"def",content:"同旁内角"},    {id:"irrational-number",type:"word",content:"Irrational number"},    {id:"irrational-number",type:"def",content:"无理数"}
  ]
},
{
  board: '25m', slug: '25m-y10-further-trigonometry-3', category: '25m-y10', title: 'Further Trigonometry (3)', titleZh: '进阶三角学 (3)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"line-and-plane-angle",type:"word",content:"Line and plane angle"},    {id:"line-and-plane-angle",type:"def",content:"线与平面夹角"},    {id:"navigation",type:"word",content:"Navigation"},    {id:"navigation",type:"def",content:"导航"},    {id:"north",type:"word",content:"North"},    {id:"north",type:"def",content:"正北"},    {id:"opposite-side",type:"word",content:"Opposite side"},    {id:"opposite-side",type:"def",content:"对边"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"perpendicular-distance",type:"word",content:"Perpendicular distance"},    {id:"perpendicular-distance",type:"def",content:"垂直距离"},    {id:"position-location",type:"word",content:"Position"},    {id:"position-location",type:"def",content:"位置"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例关系"},    {id:"protractor",type:"word",content:"Protractor"},    {id:"protractor",type:"def",content:"量角器"},    {id:"pythagoras-theorem",type:"word",content:"Pythagoras\' Theorem"},    {id:"pythagoras-theorem",type:"def",content:"勾股定理"}
  ]
},
{
  board: '25m', slug: '25m-y10-further-trigonometry-4', category: '25m-y10', title: 'Further Trigonometry (4)', titleZh: '进阶三角学 (4)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比例"},    {id:"right-angled-triangle",type:"word",content:"Right-angled triangle"},    {id:"right-angled-triangle",type:"def",content:"直角三角形"},    {id:"scale-factor",type:"word",content:"Scale factor"},    {id:"scale-factor",type:"def",content:"比例因子"},    {id:"similarity",type:"word",content:"Similarity"},    {id:"similarity",type:"def",content:"相似性"},    {id:"sine",type:"word",content:"Sine"},    {id:"sine",type:"def",content:"正弦"},    {id:"sine-rule",type:"word",content:"Sine Rule"},    {id:"sine-rule",type:"def",content:"正弦定理"},    {id:"soh-cah-toa",type:"word",content:"SOH CAH TOA"},    {id:"soh-cah-toa",type:"def",content:"正弦对斜、余弦邻斜、正切对邻"},    {id:"surd",type:"word",content:"Surd"},    {id:"surd",type:"def",content:"根式"},    {id:"tangent-ratio",type:"word",content:"Tangent"},    {id:"tangent-ratio",type:"def",content:"正切"},    {id:"three-digit-bearing",type:"word",content:"Three-digit bearing"},    {id:"three-digit-bearing",type:"def",content:"三位数方位角"}
  ]
},
{
  board: '25m', slug: '25m-y10-further-trigonometry-5', category: '25m-y10', title: 'Further Trigonometry (5)', titleZh: '进阶三角学 (5)', unitNum: 6, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"three-figure-bearing",type:"word",content:"Three-figure bearing"},    {id:"three-figure-bearing",type:"def",content:"三位数方位角"},    {id:"trigonometric-ratio",type:"word",content:"Trigonometric ratio"},    {id:"trigonometric-ratio",type:"def",content:"三角函数比率"},    {id:"trigonometry",type:"word",content:"Trigonometry"},    {id:"trigonometry",type:"def",content:"三角学"}
  ]
},
{
  board: '25m', slug: '25m-y10-unit-6-circles-1', category: '25m-y10', title: 'Unit 6 Circles (1)', titleZh: '圆 (1)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"alternate-segment-theorem",type:"word",content:"Alternate segment theorem"},    {id:"alternate-segment-theorem",type:"def",content:"弦切角定理"},    {id:"angle-at-centre",type:"word",content:"Angle at centre"},    {id:"angle-at-centre",type:"def",content:"圆心角"},    {id:"angle-at-circumference",type:"word",content:"Angle at circumference"},    {id:"angle-at-circumference",type:"def",content:"圆周角"},    {id:"arc",type:"word",content:"Arc"},    {id:"arc",type:"def",content:"圆弧"},    {id:"arc-length",type:"word",content:"Arc length"},    {id:"arc-length",type:"def",content:"弧长"},    {id:"area",type:"word",content:"Area"},    {id:"area",type:"def",content:"面积"},    {id:"area-of-sector",type:"word",content:"Area of sector"},    {id:"area-of-sector",type:"def",content:"扇形面积"},    {id:"central-angle",type:"word",content:"Central angle"},    {id:"central-angle",type:"def",content:"圆心角"},    {id:"chord",type:"word",content:"Chord"},    {id:"chord",type:"def",content:"弦"},    {id:"circle",type:"word",content:"Circle"},    {id:"circle",type:"def",content:"圆"}
  ]
},
{
  board: '25m', slug: '25m-y10-unit-6-circles-2', category: '25m-y10', title: 'Unit 6 Circles (2)', titleZh: '圆 (2)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"circle-theorem",type:"word",content:"Circle theorem"},    {id:"circle-theorem",type:"def",content:"圆定理"},    {id:"circumference",type:"word",content:"Circumference"},    {id:"circumference",type:"def",content:"周长"},    {id:"circumscribed-circle",type:"word",content:"Circumscribed circle"},    {id:"circumscribed-circle",type:"def",content:"外接圆"},    {id:"compound-shape",type:"word",content:"Compound shape"},    {id:"compound-shape",type:"def",content:"复合形状"},    {id:"cyclic-quadrilateral",type:"word",content:"Cyclic quadrilateral"},    {id:"cyclic-quadrilateral",type:"def",content:"圆内接四边形"},    {id:"diameter",type:"word",content:"Diameter"},    {id:"diameter",type:"def",content:"直径"},    {id:"exterior-angle",type:"word",content:"Exterior angle"},    {id:"exterior-angle",type:"def",content:"外角"},    {id:"inscribed-circle",type:"word",content:"Inscribed circle"},    {id:"inscribed-circle",type:"def",content:"内切圆"},    {id:"inscribed-polygon",type:"word",content:"Inscribed polygon"},    {id:"inscribed-polygon",type:"def",content:"内接多边形"},    {id:"interior-angle",type:"word",content:"Interior angle"},    {id:"interior-angle",type:"def",content:"内角"}
  ]
},
{
  board: '25m', slug: '25m-y10-unit-6-circles-3', category: '25m-y10', title: 'Unit 6 Circles (3)', titleZh: '圆 (3)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"isosceles-triangle",type:"word",content:"Isosceles triangle"},    {id:"isosceles-triangle",type:"def",content:"等腰三角形"},    {id:"major-arc",type:"word",content:"Major arc"},    {id:"major-arc",type:"def",content:"优弧"},    {id:"major-sector",type:"word",content:"Major sector"},    {id:"major-sector",type:"def",content:"优扇形"},    {id:"minor-arc",type:"word",content:"Minor arc"},    {id:"minor-arc",type:"def",content:"劣弧"},    {id:"minor-sector",type:"word",content:"Minor sector"},    {id:"minor-sector",type:"def",content:"劣扇形"},    {id:"perimeter",type:"word",content:"Perimeter"},    {id:"perimeter",type:"def",content:"周长"},    {id:"perpendicular-bisector",type:"word",content:"Perpendicular bisector"},    {id:"perpendicular-bisector",type:"def",content:"垂直平分线"},    {id:"pi",type:"word",content:"Pi"},    {id:"pi",type:"def",content:"圆周率"},    {id:"point-of-tangency",type:"word",content:"Point of tangency"},    {id:"point-of-tangency",type:"def",content:"切点"},    {id:"polygon",type:"word",content:"Polygon"},    {id:"polygon",type:"def",content:"多边形"}
  ]
},
{
  board: '25m', slug: '25m-y10-unit-6-circles-4', category: '25m-y10', title: 'Unit 6 Circles (4)', titleZh: '圆 (4)', unitNum: 7, unitTitle: 'Unit 6 Circles', unitTitleZh: '圆',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"radius",type:"word",content:"Radius"},    {id:"radius",type:"def",content:"半径"},    {id:"regular-polygon",type:"word",content:"Regular polygon"},    {id:"regular-polygon",type:"def",content:"正多边形"},    {id:"secant",type:"word",content:"Secant"},    {id:"secant",type:"def",content:"割线"},    {id:"sector",type:"word",content:"Sector"},    {id:"sector",type:"def",content:"扇形"},    {id:"segment",type:"word",content:"Segment"},    {id:"segment",type:"def",content:"弓形"},    {id:"subtend",type:"word",content:"Subtend"},    {id:"subtend",type:"def",content:"对（角）"},    {id:"tangent-line",type:"word",content:"Tangent"},    {id:"tangent-line",type:"def",content:"切线"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"}
  ]
},
{
  board: '25m', slug: '25m-y10-practice-with-constructions-1', category: '25m-y10', title: 'Practice with Constructions (1)', titleZh: '构造练习 (1)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle-bisector",type:"word",content:"Angle bisector"},    {id:"angle-bisector",type:"def",content:"角平分线"},    {id:"arc",type:"word",content:"Arc"},    {id:"arc",type:"def",content:"弧"},    {id:"asa-angle-side-angle",type:"word",content:"ASA (Angle-Side-Angle)"},    {id:"asa-angle-side-angle",type:"def",content:"角边角"},    {id:"bisect",type:"word",content:"Bisect"},    {id:"bisect",type:"def",content:"平分"},    {id:"centroid",type:"word",content:"Centroid"},    {id:"centroid",type:"def",content:"重心"},    {id:"circumcenter",type:"word",content:"Circumcenter"},    {id:"circumcenter",type:"def",content:"外心"},    {id:"circumscribed-circle",type:"word",content:"Circumscribed circle"},    {id:"circumscribed-circle",type:"def",content:"外接圆"},    {id:"compass",type:"word",content:"Compass"},    {id:"compass",type:"def",content:"圆规"},    {id:"congruent-triangles",type:"word",content:"Congruent triangles"},    {id:"congruent-triangles",type:"def",content:"全等三角形"},    {id:"construction",type:"word",content:"Construction"},    {id:"construction",type:"def",content:"构造"}
  ]
},
{
  board: '25m', slug: '25m-y10-practice-with-constructions-2', category: '25m-y10', title: 'Practice with Constructions (2)', titleZh: '构造练习 (2)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"equidistant",type:"word",content:"Equidistant"},    {id:"equidistant",type:"def",content:"等距的"},    {id:"equilateral-triangle",type:"word",content:"Equilateral triangle"},    {id:"equilateral-triangle",type:"def",content:"等边三角形"},    {id:"incenter",type:"word",content:"Incenter"},    {id:"incenter",type:"def",content:"内心"},    {id:"inscribed-circle",type:"word",content:"Inscribed circle"},    {id:"inscribed-circle",type:"def",content:"内切圆"},    {id:"intersection-point",type:"word",content:"Intersection"},    {id:"intersection-point",type:"def",content:"交点"},    {id:"isosceles-triangle",type:"word",content:"Isosceles triangle"},    {id:"isosceles-triangle",type:"def",content:"等腰三角形"},    {id:"line",type:"word",content:"Line"},    {id:"line",type:"def",content:"线"},    {id:"line-segment",type:"word",content:"Line segment"},    {id:"line-segment",type:"def",content:"线段"},    {id:"locus",type:"word",content:"Locus"},    {id:"locus",type:"def",content:"轨迹"},    {id:"median-line",type:"word",content:"Median"},    {id:"median-line",type:"def",content:"中线"}
  ]
},
{
  board: '25m', slug: '25m-y10-practice-with-constructions-3', category: '25m-y10', title: 'Practice with Constructions (3)', titleZh: '构造练习 (3)', unitNum: 8, unitTitle: 'Practice with Constructions', unitTitleZh: '构造练习',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"perpendicular",type:"word",content:"Perpendicular"},    {id:"perpendicular",type:"def",content:"垂直的"},    {id:"perpendicular-bisector",type:"word",content:"Perpendicular bisector"},    {id:"perpendicular-bisector",type:"def",content:"垂直平分线"},    {id:"point",type:"word",content:"Point"},    {id:"point",type:"def",content:"点"},    {id:"quadrilateral",type:"word",content:"Quadrilateral"},    {id:"quadrilateral",type:"def",content:"四边形"},    {id:"rhs-right-angle-hypotenuse-side",type:"word",content:"RHS (Right-angle-Hypotenuse-Side)"},    {id:"rhs-right-angle-hypotenuse-side",type:"def",content:"直角、斜边、边"},    {id:"right-angle",type:"word",content:"Right angle"},    {id:"right-angle",type:"def",content:"直角"},    {id:"sas-side-angle-side",type:"word",content:"SAS (Side-Angle-Side)"},    {id:"sas-side-angle-side",type:"def",content:"边角边"},    {id:"sss-side-side-side",type:"word",content:"SSS (Side-Side-Side)"},    {id:"sss-side-side-side",type:"def",content:"边边边"},    {id:"straightedge",type:"word",content:"Straightedge"},    {id:"straightedge",type:"def",content:"直尺"}
  ]
},
{
  board: '25m', slug: '25m-y10-congruence-and-similarity-1', category: '25m-y10', title: 'Congruence and Similarity (1)', titleZh: '全等和相似 (1)', unitNum: 9, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle-side-angle-asa",type:"word",content:"Angle-Side-Angle (ASA)"},    {id:"angle-side-angle-asa",type:"def",content:"角-边-角 (ASA)"},    {id:"congruence",type:"word",content:"Congruence"},    {id:"congruence",type:"def",content:"全等"},    {id:"corresponding-angles",type:"word",content:"Corresponding angles"},    {id:"corresponding-angles",type:"def",content:"对应角"},    {id:"corresponding-sides",type:"word",content:"Corresponding sides"},    {id:"corresponding-sides",type:"def",content:"对应边"},    {id:"hypotenuse",type:"word",content:"Hypotenuse"},    {id:"hypotenuse",type:"def",content:"斜边"},    {id:"proof",type:"word",content:"Proof"},    {id:"proof",type:"def",content:"证明"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例式"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比例"},    {id:"right-angle-hypotenuse-side-rhs",type:"word",content:"Right-angle-Hypotenuse-Side (RHS)"},    {id:"right-angle-hypotenuse-side-rhs",type:"def",content:"直角-斜边-边 (RHS)"},    {id:"scale-factor",type:"word",content:"Scale factor"},    {id:"scale-factor",type:"def",content:"比例因子"}
  ]
},
{
  board: '25m', slug: '25m-y10-congruence-and-similarity-2', category: '25m-y10', title: 'Congruence and Similarity (2)', titleZh: '全等和相似 (2)', unitNum: 9, unitTitle: 'Congruence and Similarity', unitTitleZh: '全等和相似',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"side-angle-side-sas",type:"word",content:"Side-Angle-Side (SAS)"},    {id:"side-angle-side-sas",type:"def",content:"边-角-边 (SAS)"},    {id:"side-side-side-sss",type:"word",content:"Side-Side-Side (SSS)"},    {id:"side-side-side-sss",type:"def",content:"边-边-边 (SSS)"},    {id:"similarity",type:"word",content:"Similarity"},    {id:"similarity",type:"def",content:"相似"},    {id:"triangle",type:"word",content:"Triangle"},    {id:"triangle",type:"def",content:"三角形"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"}
  ]
},
{
  board: '25m', slug: '25m-y10-transformations-1', category: '25m-y10', title: 'Transformations (1)', titleZh: '图形变换 (1)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"angle-of-rotation",type:"word",content:"Angle of rotation"},    {id:"angle-of-rotation",type:"def",content:"旋转角度"},    {id:"centre-of-enlargement",type:"word",content:"Centre of enlargement"},    {id:"centre-of-enlargement",type:"def",content:"放缩中心"},    {id:"centre-of-rotation",type:"word",content:"Centre of rotation"},    {id:"centre-of-rotation",type:"def",content:"旋转中心"},    {id:"combined-transformation",type:"word",content:"Combined transformation"},    {id:"combined-transformation",type:"def",content:"组合变换"},    {id:"congruent",type:"word",content:"Congruent"},    {id:"congruent",type:"def",content:"全等"},    {id:"coordinate",type:"word",content:"Coordinate"},    {id:"coordinate",type:"def",content:"坐标"},    {id:"coordinate-system",type:"word",content:"Coordinate system"},    {id:"coordinate-system",type:"def",content:"坐标系"},    {id:"enlargement",type:"word",content:"Enlargement"},    {id:"enlargement",type:"def",content:"放缩"},    {id:"equation-of-a-line",type:"word",content:"Equation of a line"},    {id:"equation-of-a-line",type:"def",content:"直线方程"},    {id:"horizontal-line",type:"word",content:"Horizontal line"},    {id:"horizontal-line",type:"def",content:"水平线"}
  ]
},
{
  board: '25m', slug: '25m-y10-transformations-2', category: '25m-y10', title: 'Transformations (2)', titleZh: '图形变换 (2)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"image",type:"word",content:"Image"},    {id:"image",type:"def",content:"像"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"line-of-reflection",type:"word",content:"Line of reflection"},    {id:"line-of-reflection",type:"def",content:"翻折线"},    {id:"object",type:"word",content:"Object"},    {id:"object",type:"def",content:"原像"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"proportion",type:"word",content:"Proportion"},    {id:"proportion",type:"def",content:"比例"},    {id:"quadrant",type:"word",content:"Quadrant"},    {id:"quadrant",type:"def",content:"象限"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比率"},    {id:"reflection",type:"word",content:"Reflection"},    {id:"reflection",type:"def",content:"翻折"},    {id:"rotation",type:"word",content:"Rotation"},    {id:"rotation",type:"def",content:"旋转"}
  ]
},
{
  board: '25m', slug: '25m-y10-transformations-3', category: '25m-y10', title: 'Transformations (3)', titleZh: '图形变换 (3)', unitNum: 10, unitTitle: 'Transformations', unitTitleZh: '图形变换',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"scale-factor",type:"word",content:"Scale factor"},    {id:"scale-factor",type:"def",content:"比例因子"},    {id:"similar-figures",type:"word",content:"Similar figures"},    {id:"similar-figures",type:"def",content:"相似图形"},    {id:"slope",type:"word",content:"Slope"},    {id:"slope",type:"def",content:"斜率"},    {id:"transformation",type:"word",content:"Transformation"},    {id:"transformation",type:"def",content:"变换"},    {id:"translation",type:"word",content:"Translation"},    {id:"translation",type:"def",content:"平移"},    {id:"vector",type:"word",content:"Vector"},    {id:"vector",type:"def",content:"向量"},    {id:"vertical-line",type:"word",content:"Vertical line"},    {id:"vertical-line",type:"def",content:"垂直线"},    {id:"x-axis",type:"word",content:"X-axis"},    {id:"x-axis",type:"def",content:"X轴"},    {id:"y-axis",type:"word",content:"Y-axis"},    {id:"y-axis",type:"def",content:"Y轴"}
  ]
},
{
  board: '25m', slug: '25m-y10-probability-1', category: '25m-y10', title: 'Probability (1)', titleZh: '概率 (1)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"at-least",type:"word",content:"At Least"},    {id:"at-least",type:"def",content:"至少"},    {id:"certain",type:"word",content:"Certain"},    {id:"certain",type:"def",content:"必然"},    {id:"combined-probability",type:"word",content:"Combined Probability"},    {id:"combined-probability",type:"def",content:"联合概率"},    {id:"complementary-event",type:"word",content:"Complementary Event"},    {id:"complementary-event",type:"def",content:"补事件"},    {id:"conditional-probability",type:"word",content:"Conditional Probability"},    {id:"conditional-probability",type:"def",content:"条件概率"},    {id:"dependent-events",type:"word",content:"Dependent Events"},    {id:"dependent-events",type:"def",content:"相关事件 / 依赖事件"},    {id:"event",type:"word",content:"Event"},    {id:"event",type:"def",content:"事件"},    {id:"exactly",type:"word",content:"Exactly"},    {id:"exactly",type:"def",content:"恰好"},    {id:"failure",type:"word",content:"Failure"},    {id:"failure",type:"def",content:"失败"},    {id:"favorable-outcome",type:"word",content:"Favorable Outcome"},    {id:"favorable-outcome",type:"def",content:"有利结果"}
  ]
},
{
  board: '25m', slug: '25m-y10-probability-2', category: '25m-y10', title: 'Probability (2)', titleZh: '概率 (2)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"frequency",type:"word",content:"Frequency"},    {id:"frequency",type:"def",content:"频率"},    {id:"impossible",type:"word",content:"Impossible"},    {id:"impossible",type:"def",content:"不可能"},    {id:"independent-events",type:"word",content:"Independent Events"},    {id:"independent-events",type:"def",content:"独立事件"},    {id:"intersection-set",type:"word",content:"Intersection"},    {id:"intersection-set",type:"def",content:"交集"},    {id:"likely",type:"word",content:"Likely"},    {id:"likely",type:"def",content:"可能"},    {id:"mutually-exclusive",type:"word",content:"Mutually Exclusive"},    {id:"mutually-exclusive",type:"def",content:"互斥事件"},    {id:"not-mutually-exclusive",type:"word",content:"Not Mutually Exclusive"},    {id:"not-mutually-exclusive",type:"def",content:"非互斥事件"},    {id:"outcome",type:"word",content:"Outcome"},    {id:"outcome",type:"def",content:"结果"},    {id:"probability",type:"word",content:"Probability"},    {id:"probability",type:"def",content:"概率"},    {id:"product-rule",type:"word",content:"Product Rule"},    {id:"product-rule",type:"def",content:"乘法法则"}
  ]
},
{
  board: '25m', slug: '25m-y10-probability-3', category: '25m-y10', title: 'Probability (3)', titleZh: '概率 (3)', unitNum: 11, unitTitle: 'Probability', unitTitleZh: '概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"random-event",type:"word",content:"Random Event"},    {id:"random-event",type:"def",content:"随机事件"},    {id:"relative-frequency",type:"word",content:"Relative Frequency"},    {id:"relative-frequency",type:"def",content:"相对频率"},    {id:"sample-space",type:"word",content:"Sample Space"},    {id:"sample-space",type:"def",content:"样本空间"},    {id:"success",type:"word",content:"Success"},    {id:"success",type:"def",content:"成功"},    {id:"sum-rule",type:"word",content:"Sum Rule"},    {id:"sum-rule",type:"def",content:"加法法则"},    {id:"theoretical-probability",type:"word",content:"Theoretical Probability"},    {id:"theoretical-probability",type:"def",content:"理论概率"},    {id:"tree-diagram",type:"word",content:"Tree Diagram"},    {id:"tree-diagram",type:"def",content:"树状图"},    {id:"unlikely",type:"word",content:"Unlikely"},    {id:"unlikely",type:"def",content:"不太可能"},    {id:"with-replacement",type:"word",content:"With Replacement"},    {id:"with-replacement",type:"def",content:"有放回"},    {id:"without-replacement",type:"word",content:"Without Replacement"},    {id:"without-replacement",type:"def",content:"无放回"}
  ]
},
{
  board: '25m', slug: '25m-y10-3d-geometry-1', category: '25m-y10', title: '3D Geometry (1)', titleZh: '立体几何 (1)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"3d-solid",type:"word",content:"3D solid"},    {id:"3d-solid",type:"def",content:"三维立体"},    {id:"apex",type:"word",content:"Apex"},    {id:"apex",type:"def",content:"顶点"},    {id:"axis",type:"word",content:"Axis"},    {id:"axis",type:"def",content:"轴"},    {id:"compound-shape",type:"word",content:"Compound shape"},    {id:"compound-shape",type:"def",content:"复合形状"},    {id:"cone",type:"word",content:"Cone"},    {id:"cone",type:"def",content:"圆锥体"},    {id:"cross-section",type:"word",content:"Cross-section"},    {id:"cross-section",type:"def",content:"横截面"},    {id:"cube",type:"word",content:"Cube"},    {id:"cube",type:"def",content:"立方体"},    {id:"cuboid",type:"word",content:"Cuboid"},    {id:"cuboid",type:"def",content:"长方体"},    {id:"cylinder",type:"word",content:"Cylinder"},    {id:"cylinder",type:"def",content:"圆柱体"},    {id:"density",type:"word",content:"Density"},    {id:"density",type:"def",content:"密度"}
  ]
},
{
  board: '25m', slug: '25m-y10-3d-geometry-2', category: '25m-y10', title: '3D Geometry (2)', titleZh: '立体几何 (2)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"dimension",type:"word",content:"Dimension"},    {id:"dimension",type:"def",content:"尺寸"},    {id:"elevation",type:"word",content:"Elevation"},    {id:"elevation",type:"def",content:"立面图"},    {id:"front-elevation",type:"word",content:"Front elevation"},    {id:"front-elevation",type:"def",content:"正立面图"},    {id:"isometric-drawing",type:"word",content:"Isometric drawing"},    {id:"isometric-drawing",type:"def",content:"等轴测图"},    {id:"mass",type:"word",content:"Mass"},    {id:"mass",type:"def",content:"质量"},    {id:"net",type:"word",content:"Net"},    {id:"net",type:"def",content:"展开图"},    {id:"orthographic-projection",type:"word",content:"Orthographic projection"},    {id:"orthographic-projection",type:"def",content:"正交投影"},    {id:"plan-view",type:"word",content:"Plan view"},    {id:"plan-view",type:"def",content:"平面图"},    {id:"prism",type:"word",content:"Prism"},    {id:"prism",type:"def",content:"棱柱体"},    {id:"pyramid",type:"word",content:"Pyramid"},    {id:"pyramid",type:"def",content:"棱锥体"}
  ]
},
{
  board: '25m', slug: '25m-y10-3d-geometry-3', category: '25m-y10', title: '3D Geometry (3)', titleZh: '立体几何 (3)', unitNum: 12, unitTitle: '3D Geometry', unitTitleZh: '立体几何',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"side-elevation",type:"word",content:"Side elevation"},    {id:"side-elevation",type:"def",content:"侧立面图"},    {id:"sphere",type:"word",content:"Sphere"},    {id:"sphere",type:"def",content:"球体"},    {id:"surface-area",type:"word",content:"Surface area"},    {id:"surface-area",type:"def",content:"表面积"},    {id:"top-view",type:"word",content:"Top view"},    {id:"top-view",type:"def",content:"俯视图"},    {id:"unit-conversion",type:"word",content:"Unit conversion"},    {id:"unit-conversion",type:"def",content:"单位换算"},    {id:"viewpoint",type:"word",content:"Viewpoint"},    {id:"viewpoint",type:"def",content:"视点"},    {id:"volume",type:"word",content:"Volume"},    {id:"volume",type:"def",content:"体积"}
  ]
},

/* ═══ Year 11 (26 levels, 216 words) ═══ */,
{
  board: '25m', slug: '25m-y11-estimation-bounds-1', category: '25m-y11', title: 'Estimation & Bounds (1)', titleZh: '估算与界限 (1)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"approximate",type:"word",content:"Approximate"},    {id:"approximate",type:"def",content:"近似"},    {id:"base-exponent",type:"word",content:"Base"},    {id:"base-exponent",type:"def",content:"底数"},    {id:"bounds",type:"word",content:"Bounds"},    {id:"bounds",type:"def",content:"界限"},    {id:"decimal-places",type:"word",content:"Decimal places"},    {id:"decimal-places",type:"def",content:"小数位数"},    {id:"degree-of-accuracy",type:"word",content:"Degree of accuracy"},    {id:"degree-of-accuracy",type:"def",content:"精确度"},    {id:"error",type:"word",content:"Error"},    {id:"error",type:"def",content:"误差"},    {id:"estimate",type:"word",content:"Estimate"},    {id:"estimate",type:"def",content:"估计"},    {id:"estimation",type:"word",content:"Estimation"},    {id:"estimation",type:"def",content:"估计"},    {id:"exponent",type:"word",content:"Exponent"},    {id:"exponent",type:"def",content:"指数"},    {id:"inequality",type:"word",content:"Inequality"},    {id:"inequality",type:"def",content:"不等式"}
  ]
},
{
  board: '25m', slug: '25m-y11-estimation-bounds-2', category: '25m-y11', title: 'Estimation & Bounds (2)', titleZh: '估算与界限 (2)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"integer",type:"word",content:"Integer"},    {id:"integer",type:"def",content:"整数"},    {id:"interval",type:"word",content:"Interval"},    {id:"interval",type:"def",content:"区间"},    {id:"lower-bound",type:"word",content:"Lower bound"},    {id:"lower-bound",type:"def",content:"下限"},    {id:"magnitude",type:"word",content:"Magnitude"},    {id:"magnitude",type:"def",content:"数量级"},    {id:"maximum-possible-value",type:"word",content:"Maximum possible value"},    {id:"maximum-possible-value",type:"def",content:"最大可能值"},    {id:"measurement",type:"word",content:"Measurement"},    {id:"measurement",type:"def",content:"测量"},    {id:"minimum-possible-value",type:"word",content:"Minimum possible value"},    {id:"minimum-possible-value",type:"def",content:"最小可能值"},    {id:"non-zero-digit",type:"word",content:"Non-zero digit"},    {id:"non-zero-digit",type:"def",content:"非零数字"},    {id:"order-of-magnitude",type:"word",content:"Order of magnitude"},    {id:"order-of-magnitude",type:"def",content:"数量级"},    {id:"precision",type:"word",content:"Precision"},    {id:"precision",type:"def",content:"精确度"}
  ]
},
{
  board: '25m', slug: '25m-y11-estimation-bounds-3', category: '25m-y11', title: 'Estimation & Bounds (3)', titleZh: '估算与界限 (3)', unitNum: 1, unitTitle: 'Estimation & Bounds', unitTitleZh: '估算与界限',
  timer: 80, comboBonus: 3,
  vocabulary: [
    {id:"range-general",type:"word",content:"Range"},    {id:"range-general",type:"def",content:"范围"},    {id:"rounding",type:"word",content:"Rounding"},    {id:"rounding",type:"def",content:"四舍五入"},    {id:"scientific-notation",type:"word",content:"Scientific notation"},    {id:"scientific-notation",type:"def",content:"科学计数法"},    {id:"significant-figures",type:"word",content:"Significant figures"},    {id:"significant-figures",type:"def",content:"有效数字"},    {id:"standard-form",type:"word",content:"Standard form"},    {id:"standard-form",type:"def",content:"标准形式 / 科学计数法"},    {id:"truncate",type:"word",content:"Truncate"},    {id:"truncate",type:"def",content:"截断"},    {id:"upper-bound",type:"word",content:"Upper bound"},    {id:"upper-bound",type:"def",content:"上限"}
  ]
},
{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-1', category: '25m-y11', title: 'Set Notation & Venn Diagrams (1)', titleZh: '集合符号与韦恩图 (1)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"belongs-to",type:"word",content:"Belongs to"},    {id:"belongs-to",type:"def",content:"属于"},    {id:"cardinality",type:"word",content:"Cardinality"},    {id:"cardinality",type:"def",content:"基数 / 集合的元素个数"},    {id:"certain",type:"word",content:"Certain"},    {id:"certain",type:"def",content:"确定"},    {id:"complement-of-a-set",type:"word",content:"Complement of a Set"},    {id:"complement-of-a-set",type:"def",content:"补集"},    {id:"decimal",type:"word",content:"Decimal"},    {id:"decimal",type:"def",content:"小数"},    {id:"denominator",type:"word",content:"Denominator"},    {id:"denominator",type:"def",content:"分母"},    {id:"disjoint-sets",type:"word",content:"Disjoint Sets"},    {id:"disjoint-sets",type:"def",content:"不相交集合"},    {id:"does-not-belong-to",type:"word",content:"Does not belong to"},    {id:"does-not-belong-to",type:"def",content:"不属于"},    {id:"element",type:"word",content:"Element"},    {id:"element",type:"def",content:"元素"},    {id:"empty-set-null-set",type:"word",content:"Empty Set / Null Set"},    {id:"empty-set-null-set",type:"def",content:"空集"}
  ]
},
{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-2', category: '25m-y11', title: 'Set Notation & Venn Diagrams (2)', titleZh: '集合符号与韦恩图 (2)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"event",type:"word",content:"Event"},    {id:"event",type:"def",content:"事件"},    {id:"fair",type:"word",content:"Fair"},    {id:"fair",type:"def",content:"公平的"},    {id:"fraction",type:"word",content:"Fraction"},    {id:"fraction",type:"def",content:"分数"},    {id:"impossible",type:"word",content:"Impossible"},    {id:"impossible",type:"def",content:"不可能"},    {id:"intersection-set",type:"word",content:"Intersection"},    {id:"intersection-set",type:"def",content:"交集"},    {id:"likely",type:"word",content:"Likely"},    {id:"likely",type:"def",content:"可能"},    {id:"numerator",type:"word",content:"Numerator"},    {id:"numerator",type:"def",content:"分子"},    {id:"outcome",type:"word",content:"Outcome"},    {id:"outcome",type:"def",content:"结果"},    {id:"percentage",type:"word",content:"Percentage"},    {id:"percentage",type:"def",content:"百分比"},    {id:"probability",type:"word",content:"Probability"},    {id:"probability",type:"def",content:"概率"}
  ]
},
{
  board: '25m', slug: '25m-y11-set-notation-venn-diagrams-3', category: '25m-y11', title: 'Set Notation & Venn Diagrams (3)', titleZh: '集合符号与韦恩图 (3)', unitNum: 2, unitTitle: 'Set Notation & Venn Diagrams', unitTitleZh: '集合符号与韦恩图',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"proper-subset",type:"word",content:"Proper Subset"},    {id:"proper-subset",type:"def",content:"真子集"},    {id:"random",type:"word",content:"Random"},    {id:"random",type:"def",content:"随机"},    {id:"ratio",type:"word",content:"Ratio"},    {id:"ratio",type:"def",content:"比率"},    {id:"sample-space",type:"word",content:"Sample Space"},    {id:"sample-space",type:"def",content:"样本空间"},    {id:"set",type:"word",content:"Set"},    {id:"set",type:"def",content:"集合"},    {id:"set-builder-notation",type:"word",content:"Set-builder notation"},    {id:"set-builder-notation",type:"def",content:"集合构造式表示法"},    {id:"subset",type:"word",content:"Subset"},    {id:"subset",type:"def",content:"子集"},    {id:"union",type:"word",content:"Union"},    {id:"union",type:"def",content:"并集"},    {id:"universal-set",type:"word",content:"Universal Set"},    {id:"universal-set",type:"def",content:"全集"},    {id:"venn-diagram",type:"word",content:"Venn Diagram"},    {id:"venn-diagram",type:"def",content:"维恩图"}
  ]
},
{
  board: '25m', slug: '25m-y11-simultaneous-equations-1', category: '25m-y11', title: 'Simultaneous Equations (1)', titleZh: '联立方程组 (1)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"consistent-system",type:"word",content:"Consistent system"},    {id:"consistent-system",type:"def",content:"相容系统"},    {id:"constant",type:"word",content:"Constant"},    {id:"constant",type:"def",content:"常数"},    {id:"discriminant",type:"word",content:"Discriminant"},    {id:"discriminant",type:"def",content:"判别式"},    {id:"elimination-method",type:"word",content:"Elimination method"},    {id:"elimination-method",type:"def",content:"消元法"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"expression",type:"word",content:"Expression"},    {id:"expression",type:"def",content:"表达式"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"},    {id:"inconsistent-system",type:"word",content:"Inconsistent system"},    {id:"inconsistent-system",type:"def",content:"不相容系统"},    {id:"infinite-solutions",type:"word",content:"Infinite solutions"},    {id:"infinite-solutions",type:"def",content:"无数解"}
  ]
},
{
  board: '25m', slug: '25m-y11-simultaneous-equations-2', category: '25m-y11', title: 'Simultaneous Equations (2)', titleZh: '联立方程组 (2)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"intersection-point",type:"word",content:"Intersection point"},    {id:"intersection-point",type:"def",content:"交点"},    {id:"isolate",type:"word",content:"Isolate"},    {id:"isolate",type:"def",content:"分离"},    {id:"linear-equation",type:"word",content:"Linear equation"},    {id:"linear-equation",type:"def",content:"线性方程"},    {id:"no-solution",type:"word",content:"No solution"},    {id:"no-solution",type:"def",content:"无解"},    {id:"parabola",type:"word",content:"Parabola"},    {id:"parabola",type:"def",content:"抛物线"},    {id:"practical-problem",type:"word",content:"Practical problem"},    {id:"practical-problem",type:"def",content:"实际问题"},    {id:"quadratic-equation",type:"word",content:"Quadratic equation"},    {id:"quadratic-equation",type:"def",content:"二次方程"},    {id:"rearrange",type:"word",content:"Rearrange"},    {id:"rearrange",type:"def",content:"重新排列/移项"},    {id:"simplify",type:"word",content:"Simplify"},    {id:"simplify",type:"def",content:"简化"},    {id:"simultaneous-equations",type:"word",content:"Simultaneous equations"},    {id:"simultaneous-equations",type:"def",content:"联立方程组"}
  ]
},
{
  board: '25m', slug: '25m-y11-simultaneous-equations-3', category: '25m-y11', title: 'Simultaneous Equations (3)', titleZh: '联立方程组 (3)', unitNum: 3, unitTitle: 'Simultaneous Equations', unitTitleZh: '联立方程组',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"},    {id:"solve",type:"word",content:"Solve"},    {id:"solve",type:"def",content:"求解"},    {id:"substitution-method",type:"word",content:"Substitution method"},    {id:"substitution-method",type:"def",content:"代入法"},    {id:"system-of-equations",type:"word",content:"System of equations"},    {id:"system-of-equations",type:"def",content:"方程组"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"three-unknowns",type:"word",content:"Three unknowns"},    {id:"three-unknowns",type:"def",content:"三个未知数"},    {id:"unique-solution",type:"word",content:"Unique solution"},    {id:"unique-solution",type:"def",content:"唯一解"},    {id:"unknown",type:"word",content:"Unknown"},    {id:"unknown",type:"def",content:"未知数"},    {id:"variable",type:"word",content:"Variable"},    {id:"variable",type:"def",content:"变量"}
  ]
},
{
  board: '25m', slug: '25m-y11-quadratic-sequences-1', category: '25m-y11', title: 'Quadratic Sequences (1)', titleZh: '二次数列 (1)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"arithmetic-progression",type:"word",content:"Arithmetic progression"},    {id:"arithmetic-progression",type:"def",content:"等差数列"},    {id:"coefficient",type:"word",content:"Coefficient"},    {id:"coefficient",type:"def",content:"系数"},    {id:"common-difference",type:"word",content:"Common difference"},    {id:"common-difference",type:"def",content:"公差"},    {id:"common-ratio",type:"word",content:"Common ratio"},    {id:"common-ratio",type:"def",content:"公比"},    {id:"constant-second-difference",type:"word",content:"Constant second difference"},    {id:"constant-second-difference",type:"def",content:"常数二阶差分"},    {id:"cubic-sequence",type:"word",content:"Cubic sequence"},    {id:"cubic-sequence",type:"def",content:"三次数列"},    {id:"degree-polynomial",type:"word",content:"Degree"},    {id:"degree-polynomial",type:"def",content:"次数"},    {id:"exponential-sequence",type:"word",content:"Exponential sequence"},    {id:"exponential-sequence",type:"def",content:"指数数列"},    {id:"first-difference",type:"word",content:"First difference"},    {id:"first-difference",type:"def",content:"一阶差分"},    {id:"formula",type:"word",content:"Formula"},    {id:"formula",type:"def",content:"公式"}
  ]
},
{
  board: '25m', slug: '25m-y11-quadratic-sequences-2', category: '25m-y11', title: 'Quadratic Sequences (2)', titleZh: '二次数列 (2)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"general-form",type:"word",content:"General form"},    {id:"general-form",type:"def",content:"一般形式"},    {id:"geometric-sequence",type:"word",content:"Geometric sequence"},    {id:"geometric-sequence",type:"def",content:"几何数列 / 等比数列"},    {id:"identify",type:"word",content:"Identify"},    {id:"identify",type:"def",content:"识别"},    {id:"linear-sequence",type:"word",content:"Linear sequence"},    {id:"linear-sequence",type:"def",content:"线性数列 / 等差数列"},    {id:"nth-term",type:"word",content:"nth term"},    {id:"nth-term",type:"def",content:"第n项"},    {id:"nth-term-formula",type:"word",content:"nth term formula"},    {id:"nth-term-formula",type:"def",content:"第n项公式"},    {id:"pattern",type:"word",content:"Pattern"},    {id:"pattern",type:"def",content:"模式 / 规律"},    {id:"position-location",type:"word",content:"Position"},    {id:"position-location",type:"def",content:"位置"},    {id:"practical-problem",type:"word",content:"Practical problem"},    {id:"practical-problem",type:"def",content:"实际问题"},    {id:"quadratic-sequence",type:"word",content:"Quadratic sequence"},    {id:"quadratic-sequence",type:"def",content:"二次数列"}
  ]
},
{
  board: '25m', slug: '25m-y11-quadratic-sequences-3', category: '25m-y11', title: 'Quadratic Sequences (3)', titleZh: '二次数列 (3)', unitNum: 4, unitTitle: 'Quadratic Sequences', unitTitleZh: '二次数列',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"second-difference",type:"word",content:"Second difference"},    {id:"second-difference",type:"def",content:"二阶差分"},    {id:"sequence",type:"word",content:"Sequence"},    {id:"sequence",type:"def",content:"数列"},    {id:"simultaneous-equations",type:"word",content:"Simultaneous equations"},    {id:"simultaneous-equations",type:"def",content:"联立方程"},    {id:"substitute",type:"word",content:"Substitute"},    {id:"substitute",type:"def",content:"代入"},    {id:"term",type:"word",content:"Term"},    {id:"term",type:"def",content:"项"},    {id:"value",type:"word",content:"Value"},    {id:"value",type:"def",content:"值"}
  ]
},
{
  board: '25m', slug: '25m-y11-functions-1', category: '25m-y11', title: 'Functions (1)', titleZh: '函数 (1)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"composite-function",type:"word",content:"Composite Function"},    {id:"composite-function",type:"def",content:"复合函数"},    {id:"cubic-function",type:"word",content:"Cubic Function"},    {id:"cubic-function",type:"def",content:"三次函数"},    {id:"domain",type:"word",content:"Domain"},    {id:"domain",type:"def",content:"定义域"},    {id:"equation",type:"word",content:"Equation"},    {id:"equation",type:"def",content:"方程"},    {id:"exponential-function",type:"word",content:"Exponential Function"},    {id:"exponential-function",type:"def",content:"指数函数"},    {id:"function",type:"word",content:"Function"},    {id:"function",type:"def",content:"函数"},    {id:"function-notation",type:"word",content:"Function Notation"},    {id:"function-notation",type:"def",content:"函数符号"},    {id:"graph",type:"word",content:"Graph"},    {id:"graph",type:"def",content:"图像"},    {id:"independent-variable",type:"word",content:"Independent Variable"},    {id:"independent-variable",type:"def",content:"自变量"},    {id:"inverse-function",type:"word",content:"Inverse Function"},    {id:"inverse-function",type:"def",content:"反函数"}
  ]
},
{
  board: '25m', slug: '25m-y11-functions-2', category: '25m-y11', title: 'Functions (2)', titleZh: '函数 (2)', unitNum: 5, unitTitle: 'Functions', unitTitleZh: '函数',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"linear-function",type:"word",content:"Linear Function"},    {id:"linear-function",type:"def",content:"线性函数"},    {id:"quadratic-function",type:"word",content:"Quadratic Function"},    {id:"quadratic-function",type:"def",content:"二次函数"},    {id:"range-function",type:"word",content:"Range"},    {id:"range-function",type:"def",content:"值域"},    {id:"reciprocal-function",type:"word",content:"Reciprocal Function"},    {id:"reciprocal-function",type:"def",content:"倒数函数"},    {id:"solution",type:"word",content:"Solution"},    {id:"solution",type:"def",content:"解"}
  ]
},
{
  board: '25m', slug: '25m-y11-differentiation-1', category: '25m-y11', title: 'Differentiation (1)', titleZh: '微分 (1)', unitNum: 6, unitTitle: 'Differentiation', unitTitleZh: '微分',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"curve",type:"word",content:"Curve"},    {id:"curve",type:"def",content:"曲线"},    {id:"derivative",type:"word",content:"Derivative"},    {id:"derivative",type:"def",content:"导数"},    {id:"derived-function",type:"word",content:"Derived function"},    {id:"derived-function",type:"def",content:"导函数"},    {id:"differentiation",type:"word",content:"Differentiation"},    {id:"differentiation",type:"def",content:"微分"},    {id:"function",type:"word",content:"Function"},    {id:"function",type:"def",content:"函数"},    {id:"gradient",type:"word",content:"Gradient"},    {id:"gradient",type:"def",content:"梯度 / 斜率"},    {id:"maximum-point",type:"word",content:"Maximum point"},    {id:"maximum-point",type:"def",content:"最大值点"},    {id:"minimum-point",type:"word",content:"Minimum point"},    {id:"minimum-point",type:"def",content:"最小值点"},    {id:"power-rule",type:"word",content:"Power rule"},    {id:"power-rule",type:"def",content:"幂法则"},    {id:"rate-of-change",type:"word",content:"Rate of change"},    {id:"rate-of-change",type:"def",content:"变化率"}
  ]
},
{
  board: '25m', slug: '25m-y11-differentiation-2', category: '25m-y11', title: 'Differentiation (2)', titleZh: '微分 (2)', unitNum: 6, unitTitle: 'Differentiation', unitTitleZh: '微分',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"second-derivative",type:"word",content:"Second derivative"},    {id:"second-derivative",type:"def",content:"二阶导数"},    {id:"stationary-point",type:"word",content:"Stationary point"},    {id:"stationary-point",type:"def",content:"驻点"},    {id:"tangent-line",type:"word",content:"Tangent"},    {id:"tangent-line",type:"def",content:"切线"},    {id:"turning-point",type:"word",content:"Turning point"},    {id:"turning-point",type:"def",content:"转折点 / 驻点"}
  ]
},
{
  board: '25m', slug: '25m-y11-further-trigonometry-1', category: '25m-y11', title: 'Further Trigonometry (1)', titleZh: '进阶三角学 (1)', unitNum: 7, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"acute-angle",type:"word",content:"Acute angle"},    {id:"acute-angle",type:"def",content:"锐角"},    {id:"altitude",type:"word",content:"Altitude"},    {id:"altitude",type:"def",content:"高"},    {id:"angle-between-a-line-and-a-plane",type:"word",content:"Angle between a line and a plane"},    {id:"angle-between-a-line-and-a-plane",type:"def",content:"直线与平面夹角"},    {id:"area-of-a-triangle",type:"word",content:"Area of a triangle"},    {id:"area-of-a-triangle",type:"def",content:"三角形面积"},    {id:"bearing",type:"word",content:"Bearing"},    {id:"bearing",type:"def",content:"方位角"},    {id:"cosine-rule",type:"word",content:"Cosine Rule"},    {id:"cosine-rule",type:"def",content:"余弦定理"},    {id:"included-angle",type:"word",content:"Included angle"},    {id:"included-angle",type:"def",content:"夹角"},    {id:"line-and-plane",type:"word",content:"Line and plane"},    {id:"line-and-plane",type:"def",content:"直线与平面"},    {id:"non-right-angled-triangle",type:"word",content:"Non-right-angled triangle"},    {id:"non-right-angled-triangle",type:"def",content:"任意三角形 / 非直角三角形"},    {id:"obtuse-angle",type:"word",content:"Obtuse angle"},    {id:"obtuse-angle",type:"def",content:"钝角"}
  ]
},
{
  board: '25m', slug: '25m-y11-further-trigonometry-2', category: '25m-y11', title: 'Further Trigonometry (2)', titleZh: '进阶三角学 (2)', unitNum: 7, unitTitle: 'Further Trigonometry', unitTitleZh: '进阶三角学',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"projection",type:"word",content:"Projection"},    {id:"projection",type:"def",content:"投影"},    {id:"side-length",type:"word",content:"Side length"},    {id:"side-length",type:"def",content:"边长"},    {id:"sine-rule",type:"word",content:"Sine Rule"},    {id:"sine-rule",type:"def",content:"正弦定理"},    {id:"three-dimensional",type:"word",content:"Three-dimensional"},    {id:"three-dimensional",type:"def",content:"三维"},    {id:"vertex",type:"word",content:"Vertex"},    {id:"vertex",type:"def",content:"顶点"}
  ]
},
{
  board: '25m', slug: '25m-y11-graphs-of-trigonometric-functi-1', category: '25m-y11', title: 'Graphs of Trigonometric Functions (1)', titleZh: '三角函数图像 (1)', unitNum: 8, unitTitle: 'Graphs of Trigonometric Functions', unitTitleZh: '三角函数图像',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"amplitude",type:"word",content:"Amplitude"},    {id:"amplitude",type:"def",content:"振幅"},    {id:"asymptote",type:"word",content:"Asymptote"},    {id:"asymptote",type:"def",content:"渐近线"},    {id:"cosine-function",type:"word",content:"Cosine function"},    {id:"cosine-function",type:"def",content:"余弦函数"},    {id:"domain",type:"word",content:"Domain"},    {id:"domain",type:"def",content:"定义域"},    {id:"equilibrium-position",type:"word",content:"Equilibrium position"},    {id:"equilibrium-position",type:"def",content:"平衡位置"},    {id:"intercept",type:"word",content:"Intercept"},    {id:"intercept",type:"def",content:"截距"},    {id:"maximum-value",type:"word",content:"Maximum value"},    {id:"maximum-value",type:"def",content:"最大值"},    {id:"minimum-value",type:"word",content:"Minimum value"},    {id:"minimum-value",type:"def",content:"最小值"},    {id:"period",type:"word",content:"Period"},    {id:"period",type:"def",content:"周期"},    {id:"phase-shift",type:"word",content:"Phase shift"},    {id:"phase-shift",type:"def",content:"相位移"}
  ]
},
{
  board: '25m', slug: '25m-y11-graphs-of-trigonometric-functi-2', category: '25m-y11', title: 'Graphs of Trigonometric Functions (2)', titleZh: '三角函数图像 (2)', unitNum: 8, unitTitle: 'Graphs of Trigonometric Functions', unitTitleZh: '三角函数图像',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"range-function",type:"word",content:"Range"},    {id:"range-function",type:"def",content:"值域"},    {id:"sine-function",type:"word",content:"Sine function"},    {id:"sine-function",type:"def",content:"正弦函数"},    {id:"tangent-function",type:"word",content:"Tangent function"},    {id:"tangent-function",type:"def",content:"正切函数"},    {id:"trigonometric-function",type:"word",content:"Trigonometric function"},    {id:"trigonometric-function",type:"def",content:"三角函数"},    {id:"vertical-shift",type:"word",content:"Vertical shift"},    {id:"vertical-shift",type:"def",content:"垂直平移"}
  ]
},
{
  board: '25m', slug: '25m-y11-regions-inequalities-1', category: '25m-y11', title: 'Regions & Inequalities (1)', titleZh: '区域与不等式 (1)', unitNum: 9, unitTitle: 'Regions & Inequalities', unitTitleZh: '区域与不等式',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"boundary-line",type:"word",content:"Boundary Line"},    {id:"boundary-line",type:"def",content:"边界线"},    {id:"bounded-region",type:"word",content:"Bounded Region"},    {id:"bounded-region",type:"def",content:"有界区域"},    {id:"coordinate-plane",type:"word",content:"Coordinate Plane"},    {id:"coordinate-plane",type:"def",content:"坐标平面"},    {id:"feasible-region",type:"word",content:"Feasible Region"},    {id:"feasible-region",type:"def",content:"可行域"},    {id:"inequality",type:"word",content:"Inequality"},    {id:"inequality",type:"def",content:"不等式"},    {id:"intersection-point",type:"word",content:"Intersection"},    {id:"intersection-point",type:"def",content:"交点/交集"},    {id:"linear-inequality",type:"word",content:"Linear Inequality"},    {id:"linear-inequality",type:"def",content:"线性不等式"},    {id:"maximum-value",type:"word",content:"Maximum Value"},    {id:"maximum-value",type:"def",content:"最大值"},    {id:"minimum-value",type:"word",content:"Minimum Value"},    {id:"minimum-value",type:"def",content:"最小值"},    {id:"objective-function",type:"word",content:"Objective Function"},    {id:"objective-function",type:"def",content:"目标函数"}
  ]
},
{
  board: '25m', slug: '25m-y11-regions-inequalities-2', category: '25m-y11', title: 'Regions & Inequalities (2)', titleZh: '区域与不等式 (2)', unitNum: 9, unitTitle: 'Regions & Inequalities', unitTitleZh: '区域与不等式',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"region",type:"word",content:"Region"},    {id:"region",type:"def",content:"区域"},    {id:"shaded-region",type:"word",content:"Shaded Region"},    {id:"shaded-region",type:"def",content:"阴影区域"},    {id:"solution-set",type:"word",content:"Solution Set"},    {id:"solution-set",type:"def",content:"解集"},    {id:"system-of-inequalities",type:"word",content:"System of Inequalities"},    {id:"system-of-inequalities",type:"def",content:"不等式组"},    {id:"vertices",type:"word",content:"Vertices"},    {id:"vertices",type:"def",content:"顶点"}
  ]
},
{
  board: '25m', slug: '25m-y11-vectors-1', category: '25m-y11', title: 'Vectors (1)', titleZh: '向量 (1)', unitNum: 10, unitTitle: 'Vectors', unitTitleZh: '向量',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"column-vector",type:"word",content:"Column vector"},    {id:"column-vector",type:"def",content:"列向量"},    {id:"components",type:"word",content:"Components"},    {id:"components",type:"def",content:"分量"},    {id:"coplanar-vectors",type:"word",content:"Coplanar vectors"},    {id:"coplanar-vectors",type:"def",content:"共面向量"},    {id:"directed-line-segment",type:"word",content:"Directed line segment"},    {id:"directed-line-segment",type:"def",content:"有向线段"},    {id:"direction",type:"word",content:"Direction"},    {id:"direction",type:"def",content:"方向"},    {id:"magnitude",type:"word",content:"Magnitude"},    {id:"magnitude",type:"def",content:"大小/模"},    {id:"origin",type:"word",content:"Origin"},    {id:"origin",type:"def",content:"原点"},    {id:"parallel-vectors",type:"word",content:"Parallel vectors"},    {id:"parallel-vectors",type:"def",content:"平行向量"},    {id:"position-vector",type:"word",content:"Position vector"},    {id:"position-vector",type:"def",content:"位置向量"},    {id:"resultant-vector",type:"word",content:"Resultant vector"},    {id:"resultant-vector",type:"def",content:"合向量"}
  ]
},
{
  board: '25m', slug: '25m-y11-vectors-2', category: '25m-y11', title: 'Vectors (2)', titleZh: '向量 (2)', unitNum: 10, unitTitle: 'Vectors', unitTitleZh: '向量',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"scalar",type:"word",content:"Scalar"},    {id:"scalar",type:"def",content:"标量"},    {id:"translation",type:"word",content:"Translation"},    {id:"translation",type:"def",content:"平移"},    {id:"unit-vector",type:"word",content:"Unit vector"},    {id:"unit-vector",type:"def",content:"单位向量"},    {id:"vector",type:"word",content:"Vector"},    {id:"vector",type:"def",content:"向量"},    {id:"zero-vector",type:"word",content:"Zero vector"},    {id:"zero-vector",type:"def",content:"零向量"}
  ]
},
{
  board: '25m', slug: '25m-y11-statistics-and-probability-1', category: '25m-y11', title: 'Statistics and Probability (1)', titleZh: '统计与概率 (1)', unitNum: 11, unitTitle: 'Statistics and Probability', unitTitleZh: '统计与概率',
  timer: 70, comboBonus: 2,
  vocabulary: [
    {id:"bivariate-data",type:"word",content:"Bivariate data"},    {id:"bivariate-data",type:"def",content:"双变量数据"},    {id:"correlation",type:"word",content:"Correlation"},    {id:"correlation",type:"def",content:"相关性"},    {id:"cumulative-frequency",type:"word",content:"Cumulative frequency"},    {id:"cumulative-frequency",type:"def",content:"累积频率"},    {id:"cumulative-frequency-curve",type:"word",content:"Cumulative frequency curve"},    {id:"cumulative-frequency-curve",type:"def",content:"累积频率曲线"},    {id:"interquartile-range-iqr",type:"word",content:"Interquartile range (IQR)"},    {id:"interquartile-range-iqr",type:"def",content:"四分位距"},    {id:"line-of-best-fit",type:"word",content:"Line of best fit"},    {id:"line-of-best-fit",type:"def",content:"最佳拟合线"},    {id:"lower-quartile",type:"word",content:"Lower quartile"},    {id:"lower-quartile",type:"def",content:"下四分位数"},    {id:"median-value",type:"word",content:"Median"},    {id:"median-value",type:"def",content:"中位数"},    {id:"negative-correlation",type:"word",content:"Negative correlation"},    {id:"negative-correlation",type:"def",content:"负相关"},    {id:"no-correlation",type:"word",content:"No correlation"},    {id:"no-correlation",type:"def",content:"无相关"}
  ]
},
{
  board: '25m', slug: '25m-y11-statistics-and-probability-2', category: '25m-y11', title: 'Statistics and Probability (2)', titleZh: '统计与概率 (2)', unitNum: 11, unitTitle: 'Statistics and Probability', unitTitleZh: '统计与概率',
  timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"outlier",type:"word",content:"Outlier"},    {id:"outlier",type:"def",content:"异常值"},    {id:"percentile",type:"word",content:"Percentile"},    {id:"percentile",type:"def",content:"百分位数"},    {id:"positive-correlation",type:"word",content:"Positive correlation"},    {id:"positive-correlation",type:"def",content:"正相关"},    {id:"scatter-diagram",type:"word",content:"Scatter diagram"},    {id:"scatter-diagram",type:"def",content:"散点图"},    {id:"upper-quartile",type:"word",content:"Upper quartile"},    {id:"upper-quartile",type:"def",content:"上四分位数"}
  ]
}
];
