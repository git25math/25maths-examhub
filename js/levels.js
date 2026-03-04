/* ==============================================================
   levels.js -- CIE 0580 IGCSE Mathematics Vocabulary (50 levels)
   Hand-crafted for Core + Extended syllabus coverage
   ============================================================== */

var LEVELS = [

/* ═══════════════════════════════════════════════════════════
   NUMBER (9 levels)
   ═══════════════════════════════════════════════════════════ */

// Level 1: Number Types (10 words)
{
  slug: 'num-types', category: 'number', title: 'Number Types', timer: 70, comboBonus: 2,
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
  slug: 'num-factors', category: 'number', title: 'Factors & Multiples', timer: 80, comboBonus: 3,
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
  slug: 'num-sets', category: 'number', title: 'Sets', timer: 80, comboBonus: 3,
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
  slug: 'num-powers', category: 'number', title: 'Powers, Roots & Standard Form', timer: 80, comboBonus: 3,
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
  slug: 'num-fractions', category: 'number', title: 'Fractions, Decimals & Percentages', timer: 70, comboBonus: 2,
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
  slug: 'num-ops', category: 'number', title: 'Operations & Ordering', timer: 70, comboBonus: 2,
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
  slug: 'num-accuracy', category: 'number', title: 'Estimation & Accuracy', timer: 80, comboBonus: 3,
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
  slug: 'num-ratio', category: 'number', title: 'Ratio, Proportion & Percentage', timer: 70, comboBonus: 2,
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
  slug: 'num-rates', category: 'number', title: 'Rates, Money & Time', timer: 80, comboBonus: 3,
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
  slug: 'alg-expr', category: 'algebra', title: 'Algebraic Expressions', timer: 70, comboBonus: 2,
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
  slug: 'alg-manip', category: 'algebra', title: 'Algebraic Manipulation', timer: 80, comboBonus: 3,
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
  slug: 'alg-eq', category: 'algebra', title: 'Equations', timer: 70, comboBonus: 2,
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
  slug: 'alg-ineq', category: 'algebra', title: 'Inequalities & Sequences', timer: 80, comboBonus: 3,
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
  slug: 'alg-graphs', category: 'algebra', title: 'Graphs', timer: 80, comboBonus: 3,
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
  slug: 'alg-func', category: 'algebra', title: 'Functions', timer: 80, comboBonus: 3,
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
  slug: 'alg-prop', category: 'algebra', title: 'Proportion & Calculus', timer: 90, comboBonus: 3,
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
  slug: 'coord-system', category: 'coord', title: 'Coordinate System', timer: 80, comboBonus: 3,
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
  slug: 'coord-linear', category: 'coord', title: 'Linear Graphs & Gradient', timer: 80, comboBonus: 3,
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
  slug: 'coord-line-eq', category: 'coord', title: 'Line Equations', timer: 80, comboBonus: 3,
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
  slug: 'coord-parallel', category: 'coord', title: 'Parallel & Perpendicular Lines', timer: 80, comboBonus: 3,
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
  slug: 'coord-distance', category: 'coord', title: 'Distance & Midpoint', timer: 90, comboBonus: 3,
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
  slug: 'geom-angles-basic', category: 'geometry', title: 'Angles', timer: 70, comboBonus: 2,
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
  slug: 'geom-triangles', category: 'geometry', title: 'Shapes & Triangles', timer: 70, comboBonus: 2,
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
  slug: 'geom-polygons', category: 'geometry', title: 'Quadrilaterals & Polygons', timer: 70, comboBonus: 2,
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
  slug: 'geom-circles', category: 'geometry', title: 'Circle Parts', timer: 70, comboBonus: 2,
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
  slug: 'geom-solids', category: 'geometry', title: 'Solids & Constructions', timer: 70, comboBonus: 2,
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
  slug: 'geom-similarity', category: 'geometry', title: 'Similarity, Symmetry & Congruence', timer: 90, comboBonus: 3,
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
  slug: 'geom-circle-thm', category: 'geometry', title: 'Angle Properties & Circle Theorems', timer: 80, comboBonus: 3,
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
  slug: 'mens-units', category: 'mensuration', title: 'Units & Measurement', timer: 80, comboBonus: 3,
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
  slug: 'mens-area', category: 'mensuration', title: 'Area & Perimeter', timer: 80, comboBonus: 3,
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
  slug: 'mens-circles', category: 'mensuration', title: 'Circles, Arcs & Sectors', timer: 80, comboBonus: 3,
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
  slug: 'mens-surface', category: 'mensuration', title: 'Surface Area & Volume', timer: 80, comboBonus: 3,
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
  slug: 'mens-3d', category: 'mensuration', title: '3D Solids & Compound Shapes', timer: 80, comboBonus: 3,
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
  slug: 'trig-pythag', category: 'trigonometry', title: "Pythagoras' Theorem", timer: 80, comboBonus: 3,
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
  slug: 'trig-ratios', category: 'trigonometry', title: 'Trigonometric Ratios', timer: 80, comboBonus: 3,
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
  slug: 'trig-graphs', category: 'trigonometry', title: 'Trig Graphs & Exact Values', timer: 80, comboBonus: 3,
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
  slug: 'trig-non-right', category: 'trigonometry', title: 'Non-Right-Angled Triangles', timer: 80, comboBonus: 3,
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
  slug: 'trig-3d', category: 'trigonometry', title: '3D Trigonometry', timer: 90, comboBonus: 3,
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
  slug: 'vec-transform', category: 'vectors', title: 'Transformations', timer: 70, comboBonus: 2,
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
  slug: 'vec-rotation', category: 'vectors', title: 'Rotation & Enlargement', timer: 80, comboBonus: 3,
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
  slug: 'vec-basics', category: 'vectors', title: 'Vector Basics', timer: 80, comboBonus: 3,
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
  slug: 'vec-magnitude', category: 'vectors', title: 'Magnitude & Special Vectors', timer: 90, comboBonus: 3,
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
  slug: 'vec-relations', category: 'vectors', title: 'Vector Relationships', timer: 90, comboBonus: 3,
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
  slug: 'stat-data', category: 'statistics', title: 'Data Classification', timer: 70, comboBonus: 2,
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
  slug: 'stat-averages', category: 'statistics', title: 'Averages & Spread', timer: 70, comboBonus: 2,
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
  slug: 'stat-charts', category: 'statistics', title: 'Charts & Diagrams', timer: 70, comboBonus: 2,
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
  slug: 'stat-advanced', category: 'statistics', title: 'Advanced Statistics', timer: 80, comboBonus: 3,
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
  slug: 'stat-prob', category: 'statistics', title: 'Basic Probability', timer: 80, comboBonus: 3,
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
  slug: 'stat-prob-comb', category: 'statistics', title: 'Combined Probability', timer: 90, comboBonus: 3,
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
  slug: 'stat-prob-cond', category: 'statistics', title: 'Conditional Probability & Sets', timer: 90, comboBonus: 3,
  vocabulary: [
    {id:"0",type:"word",content:"Conditional probability"},{id:"0",type:"def",content:"\u6761\u4ef6\u6982\u7387"},
    {id:"1",type:"word",content:"Sample space diagram"},{id:"1",type:"def",content:"\u6837\u672c\u7a7a\u95f4\u56fe"},
    {id:"2",type:"word",content:"Certain"},{id:"2",type:"def",content:"\u5fc5\u7136"},
    {id:"3",type:"word",content:"Impossible"},{id:"3",type:"def",content:"\u4e0d\u53ef\u80fd"},
    {id:"4",type:"word",content:"Exhaustive events"},{id:"4",type:"def",content:"\u7a77\u4e3e\u4e8b\u4ef6"},
    {id:"5",type:"word",content:"Complement (probability)"},{id:"5",type:"def",content:"\u8865\u4e8b\u4ef6"}
  ]
}

];
