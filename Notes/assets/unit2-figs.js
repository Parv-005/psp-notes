/* Unit 2 figures: random variables, distributions, MGF */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="${NS}">${inner}</svg>`;
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--fg)"/></marker></defs>`;

  /* ---------- maths helpers ---------- */
  function erfc(x) { // Numerical Recipes erfcc, fractional error < 1.2e-7
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Q = x => 0.5 * erfc(x / Math.SQRT2);
  const Phi = x => 1 - Q(x);
  const gauss = (m, s) => x => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const binom = (n, k) => fact(n) / (fact(k) * fact(n - k));
  const binPmf = (n, p) => k => binom(n, k) * p ** k * (1 - p) ** (n - k);
  const poiPmf = l => k => Math.exp(-l) * l ** k / fact(k);
  window.U2 = { Q, Phi, erfc };

  /* ---------- concept map ---------- */
  function conceptMap() {
    const B = [
      ['Random experiment\n(Ω, events, P)', 10, 15, 'def'], ['Random variable\nX : Ω → ℝ', 190, 15, 'def'], ['CDF  F(α)\n= P(X ≤ α)', 370, 15, 'def'],
      ['PMF (discrete)\njumps of CDF', 550, 0, 'key'], ['PDF (continuous)\nslope of CDF', 550, 62, 'key'], ['Mixed RV\nPDF + impulses', 550, 124, 'key'],
      ['Expectation,\nvariance, moments', 370, 124, 'key'], ['MGF / char. fn\nM(s) = E[eˢˣ]', 190, 124, 'thm'], ['Inequalities\nMarkov, Chebyshev', 10, 124, 'thm'],
      ['Discrete families\nBernoulli → Binomial', 10, 220, 'thm'], ['Poisson\n(limit of binomial)', 190, 220, 'thm'], ['Continuous families\nUniform, Exponential', 370, 220, 'thm'],
      ['Gaussian N(m,σ²)\nand the Q-function', 550, 220, 'thm'], ['Conditional CDF / PDF\nF(α | B)', 370, 300, 'def']
    ];
    const W = 710, H = 360, bw = 150, bh = 46;
    const c = i => [B[i][1] + bw / 2, B[i][2] + bh / 2];
    const E = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [4, 6], [6, 7], [6, 8], [3, 9], [9, 10], [4, 11], [4, 12], [2, 13], [6, 12]];
    let s = arrowDefs('m2a');
    E.forEach(([a, b]) => {
      let [x1, y1] = c(a), [x2, y2] = c(b);
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.min(Math.abs(dx) > 1 ? (bw / 2) / Math.abs(dx) : 9, Math.abs(dy) > 1 ? (bh / 2) / Math.abs(dy) : 9);
      x1 += dx * t; y1 += dy * t; x2 -= dx * t; y2 -= dy * t;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.2" marker-end="url(#m2a)" opacity=".7"/>`;
    });
    B.forEach(([t, x, y, k]) => {
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="var(--${k}-bg)" stroke="var(--fg)" stroke-width="1"/>`;
      const L = t.split('\n');
      L.forEach((ln, j) => { s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 5 + (j - (L.length - 1) / 2) * 16}" text-anchor="middle" font-size="12.5">${ln}</text>`; });
    });
    return svg(W, H, s);
  }

  /* ---------- X as a mapping ---------- */
  function rvMap() {
    const W = 600, H = 230;
    let s = arrowDefs('rvA');
    s += `<ellipse cx="120" cy="115" rx="95" ry="90" fill="var(--def-bg)" stroke="var(--fg)" stroke-width="1.3"/>
      <text x="40" y="38" font-size="15" font-style="italic">Ω</text>`;
    const outs = [['HH', 70], ['HT', 100], ['TH', 130], ['TT', 160]];
    const vals = { HH: 0, HT: 1, TH: 1, TT: 2 };
    const lineX = v => 380 + v * 80;
    s += `<line x1="330" y1="115" x2="590" y2="115" stroke="var(--axis)" stroke-width="1.3" marker-end="url(#rvA)"/>
      <text x="585" y="105" font-size="14" font-style="italic" text-anchor="end">ℝ</text>`;
    [0, 1, 2].forEach(v => { s += `<line x1="${lineX(v)}" y1="110" x2="${lineX(v)}" y2="120" stroke="var(--axis)"/><text x="${lineX(v)}" y="138" text-anchor="middle" font-size="13">${v}</text><circle cx="${lineX(v)}" cy="115" r="4" fill="var(--g2)"/>`; });
    outs.forEach(([o, y]) => {
      const col = vals[o] <= 1 ? 'var(--g1)' : 'var(--muted)';
      s += `<circle cx="120" cy="${y}" r="3.5" fill="${col}"/><text x="105" y="${y + 5}" font-size="13" text-anchor="end">${o}</text>`;
      s += `<path d="M126,${y} C 250,${y} 280,${115 - 22} ${lineX(vals[o]) - 2},${111}" fill="none" stroke="${col}" stroke-width="1.3" marker-end="url(#rvA)" opacity=".85"/>`;
    });
    s += `<text x="460" y="185" text-anchor="middle" font-size="13" fill="var(--g1)">blue outcomes = the event {X ≤ 1} = {HH, HT, TH}</text>
      <text x="460" y="205" text-anchor="middle" font-size="12.5" fill="var(--muted)">X = number of tails;  P(X ≤ 1) = P({HH,HT,TH}) = 3/4</text>
      <text x="270" y="40" text-anchor="middle" font-size="13">X(ζ)</text>`;
    return svg(W, H, s);
  }

  /* ---------- plots ---------- */
  const k6 = [1, 2, 3, 4, 5, 6].map(k => ({ v: k / 6, l: k + '/6' }));
  PLOTS.cdfDie = {
    w: 400, h: 240, x: [-0.6, 7.5], y: [0, 1.12], xlabel: 'α', ylabel: 'F_X(α)', xticks: [1, 2, 3, 4, 5, 6], yticks: k6,
    items: [{ stairs: [[1, 1 / 6], [2, 2 / 6], [3, 3 / 6], [4, 4 / 6], [5, 5 / 6], [6, 1]], from: -0.6, to: 7.5 }],
    caption: 'CDF of a fair die: a staircase. Each step is 1/6 high; the filled dot shows the value AT the jump.'
  };
  PLOTS.pdfDie = {
    w: 400, h: 240, x: [-0.6, 7.5], y: [0, 0.3], xlabel: 'α', ylabel: 'f_X(α)', xticks: [1, 2, 3, 4, 5, 6], yticks: [],
    items: [{ impulses: [[1, .2, '1/6'], [2, .2, '1/6'], [3, .2, '1/6'], [4, .2, '1/6'], [5, .2, '1/6'], [6, .2, '1/6']] }],
    caption: 'PDF of the die = six impulses (Dirac deltas), each of weight 1/6.'
  };
  PLOTS.cdfMixedLect = {
    w: 440, h: 250, x: [-2.5, 4.6], y: [0, 1.15], xlabel: 'α', ylabel: 'F_X(α)', xticks: [-1, 1, 2, 3], yticks: [{ v: 1 / 3, l: '1/3' }, { v: 2 / 3, l: '2/3' }, 1],
    items: [
      { pts: [[-2.5, 0], [-1, 0], [1, 1 / 3], [2, 1 / 3]] },
      { vline: 2, from: 1 / 3, to: 2 / 3 }, { dot: [2, 1 / 3], open: true }, { dot: [2, 2 / 3] },
      { pts: [[2, 2 / 3], [3, 2 / 3]] }, { vline: 3, from: 2 / 3, to: 1 }, { dot: [3, 2 / 3], open: true }, { dot: [3, 1] },
      { pts: [[3, 1], [4.6, 1]] }, { hline: 1 / 3, to: 1, from: -2.5 }, { hline: 2 / 3, to: 2, from: -2.5 },
      { text: 'ramp: continuous part', at: [-0.5, 0.33], color: 'c3', anchor: 'end' },
      { text: 'jump 1/3', at: [2.08, 0.5], anchor: 'start', color: 'c2' }, { text: 'jump 1/3', at: [3.08, 0.83], anchor: 'start', color: 'c2' }
    ],
    caption: 'Lecturer\'s example: a ramp (continuous part) from −1 to 1, then jumps at 2 and 3. This is a <b>mixed</b> random variable.'
  };
  PLOTS.cdfGeneric = {
    w: 400, h: 220, x: [-4, 4], y: [0, 1.15], xlabel: 'α', ylabel: 'F_X(α)', xticks: [], yticks: [1],
    items: [{ fn: x => 1 / (1 + Math.exp(-1.6 * x)) }, { hline: 1 },
      { text: '→ 0 as α → −∞', at: [-3.9, 0.12], anchor: 'start', color: 'mu' }, { text: '→ 1 as α → +∞', at: [3.9, 0.88], anchor: 'end', color: 'mu' }],
    caption: 'A typical continuous CDF: it never goes down, starts at 0, ends at 1.'
  };
  PLOTS.cdfDiscGen = {
    w: 400, h: 230, x: [0, 10], y: [0, 1.1], xlabel: 'α', ylabel: 'F_X(α)', xticks: [{ v: 2, l: 'α_1' }, { v: 4, l: 'α_2' }, { v: 6, l: 'α_3' }, { v: 8, l: 'α_4' }], yticks: [1],
    items: [{ stairs: [[2, .2], [4, .45], [6, .75], [8, 1]] },
      { text: 'p_1', at: [2.2, .1], anchor: 'start', color: 'c2' }, { text: 'p_2', at: [4.2, .33], anchor: 'start', color: 'c2' },
      { text: 'p_3', at: [6.2, .6], anchor: 'start', color: 'c2' }, { text: 'p_4', at: [8.2, .88], anchor: 'start', color: 'c2' }],
    caption: 'F_X(α) = Σ p_k u(α − α_k): the jump at α_k has height p_k = P(X = α_k).'
  };
  PLOTS.pmf2 = {
    w: 300, h: 220, x: [-0.8, 2.8], y: [0, 0.62], xlabel: 'x', ylabel: 'P(X=x)', xticks: [0, 1, 2], yticks: [{ v: .25, l: '1/4' }, { v: .5, l: '1/2' }],
    items: [{ stems: [[0, .25, '1/4'], [1, .5, '1/2'], [2, .25, '1/4']] }], caption: 'PMF: X = number of tails in 2 tosses'
  };
  PLOTS.cdf2 = {
    w: 300, h: 220, x: [-0.8, 3], y: [0, 1.12], xlabel: 'α', ylabel: 'F_X(α)', xticks: [0, 1, 2], yticks: [{ v: .25, l: '1/4' }, { v: .75, l: '3/4' }, 1],
    items: [{ stairs: [[0, .25], [1, .75], [2, 1]] }], caption: 'Its CDF: jumps of 1/4, 1/2, 1/4'
  };
  PLOTS.pmf3 = {
    w: 300, h: 220, x: [-0.8, 3.8], y: [0, 0.48], xlabel: 'x', ylabel: 'P(X=x)', xticks: [0, 1, 2, 3], yticks: [{ v: .125, l: '1/8' }, { v: .375, l: '3/8' }],
    items: [{ stems: [[0, .125, '1/8'], [1, .375, '3/8'], [2, .375, '3/8'], [3, .125, '1/8']] }], caption: 'PMF: number of tails in 3 tosses'
  };
  PLOTS.stepU = {
    w: 300, h: 180, x: [-4, 14], y: [0, 1.3], xlabel: 't', ylabel: 'u(t)', xticks: [0, 10], yticks: [{ v: .5, l: '1/2' }, 1],
    items: [{ pts: [[-4, 0], [0, 0]] }, { pts: [[0, 1], [14, 1]] }, { dot: [0, .5] }, { dot: [0, 0], open: true }, { dot: [0, 1], open: true }],
    caption: 'Unit step u(t) (lecturer takes u(0) = 1/2)'
  };
  PLOTS.stepU10 = {
    w: 300, h: 180, x: [-4, 14], y: [0, 1.3], xlabel: 't', ylabel: 'u(t−10)', xticks: [0, 10], yticks: [1],
    items: [{ pts: [[-4, 0], [10, 0]] }, { pts: [[10, 1], [14, 1]] }, { vline: 10, from: 0, to: 1 }],
    caption: 'Shifted step u(t − 10): switches on at t = 10'
  };
  PLOTS.delta = {
    w: 300, h: 180, x: [-3, 3], y: [0, 1.3], xlabel: 't', ylabel: '', xticks: [-1, 0, 1], yticks: [],
    items: [{ pts: [[-3, 0], [-0.25, 0], [-0.25, 1], [0.25, 1], [0.25, 0], [3, 0]], color: 'c3', width: 1.6, dash: true },
      { impulses: [[0, 1.1, 'δ(t)', 14]], color: 'c2' }, { text: 'width ε, height 1/ε', at: [0.35, 0.8], anchor: 'start', color: 'c3' }],
    caption: 'δ(t): limit of a tall thin pulse of area 1'
  };
  PLOTS.pdfStrip = function () {
    const f = x => 0.5 * x * x * Math.exp(-x);
    return {
      w: 380, h: 220, x: [0, 9], y: [0, 0.32], xlabel: 'x', ylabel: 'f_X(x)', xticks: [{ v: 2.5, l: 'x' }, { v: 2.9, l: 'x+δ', dx: 10 }], yticks: [],
      items: [{ area: { fn: f, from: 2.5, to: 2.9 }, color: 'c2', opacity: .55 }, { fn: f }, { text: 'area ≈ f_X(x)·δ', at: [3.2, 0.27], anchor: 'start', color: 'c2' }],
      caption: 'f_X(x)·δ ≈ P(x &lt; X ≤ x+δ): density × width = probability'
    };
  };
  PLOTS.pdfArea = function () {
    const f = x => 0.5 * x * x * Math.exp(-x);
    return {
      w: 380, h: 220, x: [0, 9], y: [0, 0.32], xlabel: 'x', ylabel: 'f_X(x)', xticks: [{ v: 1.4, l: 'x_1' }, { v: 4, l: 'x_2' }], yticks: [],
      items: [{ area: { fn: f, from: 1.4, to: 4 }, color: 'c1', opacity: .35, hatch: true }, { fn: f }, { text: 'P(x_1 < X ≤ x_2)', at: [4.3, 0.2], anchor: 'start', color: 'c1' }],
      caption: 'Probability = area under the PDF = F_X(x_2) − F_X(x_1)'
    };
  };
  PLOTS.mixedPdfLect = function () {
    const f = x => 0.5 * gauss(50, 10)(x); // = (1/20)/√(2π)·e^{−(x−50)²/200}
    return {
      w: 460, h: 240, x: [-8, 105], y: [0, 0.03], xlabel: 'α', ylabel: 'f_X(α)', xticks: [0, 40, 50, 100], yticks: [{ v: 0.05 / Math.sqrt(2 * Math.PI), l: 'a/√2π' }],
      items: [{ fn: f, from: -8, to: 105 }, { impulses: [[0, 0.026, '5/16'], [40, 0.016, '3/16']], color: 'c2' }, { vline: 50, to: f(50) }],
      caption: 'Mixed PDF: Gaussian bump (area 1/2) + impulses of weight 5/16 at 0 and 3/16 at 40. (Arrow heights show weights, not to scale.)'
    };
  };
  PLOTS.mixedCdfLect = function () {
    const F = x => (x >= 0 ? 5 / 16 : 0) + (x >= 40 ? 3 / 16 : 0) + 0.5 * Phi((x - 50) / 10);
    const seg = (a, b) => ({ fn: F, from: a, to: b });
    return {
      w: 460, h: 240, x: [-8, 105], y: [0, 1.1], xlabel: 'α', ylabel: 'F_X(α)', xticks: [0, 40, 50, 100], yticks: [{ v: 5 / 16, l: '5/16' }, { v: 1, l: '1' }],
      items: [seg(-8, -0.01), seg(0, 39.99), seg(40, 105), { dot: [0, 0], open: true }, { dot: [0, 5 / 16] }, { dot: [40, F(39.99)], open: true }, { dot: [40, F(40)] },
        { vline: 0, from: 0, to: 5 / 16 }, { vline: 40, from: F(39.99), to: F(40) }, { text: 'jump 3/16', at: [38, 0.55], anchor: 'end', color: 'c2' }, { text: 'jump 5/16', at: [3, 0.2], anchor: 'start', color: 'c2' }],
      caption: 'Its CDF: smooth rise from the Gaussian part, with jumps where the impulses are.'
    };
  };
  PLOTS.uniPdf = {
    w: 320, h: 200, x: [0, 8], y: [0, 0.38], xlabel: 'x', ylabel: 'f_X(x)', xticks: [{ v: 2, l: 'a' }, { v: 6, l: 'b' }], yticks: [{ v: .25, l: '1/(b−a)' }],
    items: [{ pts: [[0, 0], [2, 0]] }, { pts: [[2, .25], [6, .25]] }, { pts: [[6, 0], [8, 0]] }, { vline: 2, to: .25 }, { vline: 6, to: .25 }, { area: { pts: [[2, .25], [6, .25]] }, color: 'c1', opacity: .15 }],
    caption: 'Uniform(a, b) PDF: flat, total area 1'
  };
  PLOTS.uniCdf = {
    w: 320, h: 200, x: [0, 8], y: [0, 1.15], xlabel: 'x', ylabel: 'F_X(x)', xticks: [{ v: 2, l: 'a' }, { v: 6, l: 'b' }], yticks: [1],
    items: [{ pts: [[0, 0], [2, 0], [6, 1], [8, 1]] }, { text: '(x−a)/(b−a)', at: [4.2, .5], anchor: 'end', color: 'c1' }, { hline: 1, to: 6 }],
    caption: 'Uniform(a, b) CDF: a straight ramp'
  };
  PLOTS.expPdf = {
    w: 320, h: 210, x: [0, 5], y: [0, 2.2], xlabel: 'x', ylabel: 'f_X(x)', xticks: [1, 2, 3, 4], yticks: [1, 2],
    items: [{ fn: x => Math.exp(-x) }, { fn: x => 2 * Math.exp(-2 * x), color: 'c2', dash: true }, { text: 'λ = 1', at: [1.3, .45], anchor: 'start' }, { text: 'λ = 2', at: [.35, 1.4], anchor: 'start', color: 'c2' }],
    caption: 'Exponential PDF λe^{−λx}: starts at height λ'
  };
  PLOTS.expCdf = {
    w: 320, h: 210, x: [0, 5], y: [0, 1.15], xlabel: 'x', ylabel: 'F_X(x)', xticks: [1, 2, 3, 4], yticks: [{ v: 1 - Math.exp(-1), l: '0.632' }, 1],
    items: [{ fn: x => 1 - Math.exp(-x) }, { fn: x => 1 - Math.exp(-2 * x), color: 'c2', dash: true }, { hline: 1 }, { hline: 1 - Math.exp(-1), to: 1 }, { vline: 1, to: 1 - Math.exp(-1) }],
    caption: 'CDF 1 − e^{−λx}: at x = mean = 1/λ it is already 63.2%'
  };
  PLOTS.gaussSig = {
    w: 420, h: 230, x: [-5, 5], y: [0, 0.85], xlabel: 'x', ylabel: 'f_X(x)', xticks: [-4, -2, 0, 2, 4], yticks: [0.2, 0.4, 0.6, 0.8],
    items: [{ fn: gauss(0, 0.5), color: 'c2' }, { fn: gauss(0, 1) }, { fn: gauss(0, 2), color: 'c3' },
      { text: 'σ = 0.5', at: [0.55, 0.72], anchor: 'start', color: 'c2' }, { text: 'σ = 1', at: [1.2, 0.3], anchor: 'start', color: 'c1' }, { text: 'σ = 2', at: [3, 0.13], anchor: 'start', color: 'c3' }],
    caption: 'Same mean, different σ: small σ = tall and narrow, large σ = low and wide (area always 1)'
  };
  PLOTS.gaussMean = {
    w: 420, h: 200, x: [-4, 6], y: [0, 0.5], xlabel: 'x', ylabel: 'f_X(x)', xticks: [-2, 0, 2, 4], yticks: [{ v: 0.3989, l: '1/√2π' }],
    items: [{ fn: gauss(0, 1) }, { fn: gauss(2, 1), color: 'c2', dash: true }, { vline: 0, to: 0.3989 }, { vline: 2, to: 0.3989 },
      { text: 'm = 0', at: [-1.2, 0.3], anchor: 'end' }, { text: 'm = 2', at: [3.2, 0.3], anchor: 'start', color: 'c2' }],
    caption: 'Changing the mean slides the bell sideways without changing its shape'
  };
  PLOTS.qTail = {
    w: 420, h: 220, x: [-4, 4], y: [0, 0.48], xlabel: 'α', ylabel: 'N(0,1)', xticks: [0, { v: 1.2, l: 'u' }], yticks: [],
    items: [{ area: { fn: gauss(0, 1), from: 1.2, to: 4 }, color: 'c2', opacity: .45, hatch: true }, { fn: gauss(0, 1) }, { text: 'Q(u) = tail area', at: [1.9, 0.17], anchor: 'start', color: 'c2' },
      { text: '1 − Q(u) = Φ(u)', at: [-0.6, 0.15], anchor: 'middle', color: 'c1' }],
    caption: 'Q(u) = P(X > u) for X ~ N(0,1): the area to the RIGHT of u'
  };
  PLOTS.qSym = {
    w: 420, h: 220, x: [-4, 4], y: [0, 0.48], xlabel: 'α', ylabel: 'N(0,1)', xticks: [{ v: -1.2, l: '−u' }, 0, { v: 1.2, l: 'u' }], yticks: [],
    items: [{ area: { fn: gauss(0, 1), from: 1.2, to: 4 }, color: 'c2', opacity: .45 }, { area: { fn: gauss(0, 1), from: -4, to: -1.2 }, color: 'c3', opacity: .45 }, { fn: gauss(0, 1) },
      { text: 'Q(u)', at: [2.2, 0.08], color: 'c2' }, { text: '1 − Q(−u)', at: [-2.4, 0.08], color: 'c3' }],
    caption: 'By symmetry the two tails are equal: Q(u) = 1 − Q(−u), i.e. Q(−u) = 1 − Q(u)'
  };
  PLOTS.rule689 = function () {
    const g = gauss(0, 1);
    return {
      w: 460, h: 240, x: [-4, 4], y: [0, 0.48], xlabel: 'x', ylabel: '', xticks: [{ v: -3, l: 'm−3σ' }, { v: -2, l: 'm−2σ' }, { v: -1, l: 'm−σ' }, { v: 0, l: 'm' }, { v: 1, l: 'm+σ' }, { v: 2, l: 'm+2σ' }, { v: 3, l: 'm+3σ' }], yticks: [],
      items: [{ area: { fn: g, from: -3, to: 3 }, color: 'c3', opacity: .15 }, { area: { fn: g, from: -2, to: 2 }, color: 'c3', opacity: .2 }, { area: { fn: g, from: -1, to: 1 }, color: 'c3', opacity: .3 }, { fn: g },
        { text: '68.3%', at: [0, 0.2] }, { text: '95.4%', at: [0, 0.07] }, { text: '99.7% within ±3σ', at: [2.6, 0.12], anchor: 'start', size: 12 }],
      caption: 'The 68–95–99.7 rule: P(|X − m| ≤ kσ) = 1 − 2Q(k)'
    };
  };
  PLOTS.bernPmf = {
    w: 280, h: 200, x: [-0.8, 1.8], y: [0, 0.9], xlabel: 'x', ylabel: 'P(X=x)', xticks: [0, 1], yticks: [{ v: .3, l: '1−p' }, { v: .7, l: 'p' }],
    items: [{ stems: [[0, .3], [1, .7]] }], caption: 'Bernoulli(p) PMF (drawn for p = 0.7)'
  };
  PLOTS.bernCdf = {
    w: 280, h: 200, x: [-0.8, 2], y: [0, 1.15], xlabel: 'α', ylabel: 'F_X(α)', xticks: [0, 1], yticks: [{ v: .3, l: '1−p' }, 1],
    items: [{ stairs: [[0, .3], [1, 1]] }], caption: 'Bernoulli(p) CDF'
  };
  const binPlot = (p, col) => () => {
    const f = binPmf(10, p), st = [];
    for (let k = 0; k <= 10; k++) st.push([k, f(k)]);
    return { w: 260, h: 200, x: [-0.8, 10.8], y: [0, 0.42], xlabel: 'k', ylabel: '', xticks: [0, 2, 4, 6, 8, 10], yticks: [0.1, 0.2, 0.3, 0.4], items: [{ stems: st, color: col, width: 1.8 }], caption: `Binomial(10, ${p}): mean ${10 * p}` };
  };
  PLOTS.bin02 = binPlot(0.2, 'c1'); PLOTS.bin05 = binPlot(0.5, 'c3'); PLOTS.bin08 = binPlot(0.8, 'c2');
  const poiPlot = (l, col) => () => {
    const f = poiPmf(l), st = [];
    for (let k = 0; k <= 16; k++) st.push([k, f(k)]);
    return { w: 260, h: 200, x: [-0.8, 16.8], y: [0, 0.4], xlabel: 'k', ylabel: '', xticks: [0, 4, 8, 12, 16], yticks: [0.1, 0.2, 0.3], items: [{ stems: st, color: col, width: 1.6 }], caption: `Poisson(λ = ${l})` };
  };
  PLOTS.poi1 = poiPlot(1, 'c1'); PLOTS.poi4 = poiPlot(4, 'c3'); PLOTS.poi8 = poiPlot(8, 'c2');
  PLOTS.poiCdf = function () {
    const f = poiPmf(2), st = []; let c = 0;
    for (let k = 0; k <= 7; k++) { c += f(k); st.push([k, c]); }
    return { w: 360, h: 210, x: [-1, 8.5], y: [0, 1.1], xlabel: 'α', ylabel: 'F_X(α)', xticks: [0, 1, 2, 3, 4, 5, 6, 7], yticks: [0.5, 1], items: [{ stairs: st }], caption: 'Poisson(2) CDF: a staircase with infinitely many (ever smaller) steps' };
  };
  PLOTS.poiApprox = function () {
    const b = binPmf(20, 0.1), q = poiPmf(2), s1 = [], s2 = [];
    for (let k = 0; k <= 8; k++) { s1.push([k - 0.13, b(k)]); s2.push([k + 0.13, q(k)]); }
    return {
      w: 440, h: 230, x: [-0.8, 8.8], y: [0, 0.34], xlabel: 'k', ylabel: 'P(X=k)', xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], yticks: [0.1, 0.2, 0.3],
      items: [{ stems: s1, color: 'c1', width: 2 }, { stems: s2, color: 'c2', width: 2 }, { text: '● Binomial(20, 0.1)', at: [4.5, 0.29], anchor: 'start', color: 'c1' }, { text: '● Poisson(2)', at: [4.5, 0.25], anchor: 'start', color: 'c2' }],
      caption: 'Poisson approximation: with n = 20, p = 0.1 the two PMFs are already very close'
    };
  };
  PLOTS.cheb = function () {
    const g = gauss(0, 1);
    return {
      w: 440, h: 220, x: [-4, 4], y: [0, 0.48], xlabel: 'α', ylabel: 'f_X(α)', xticks: [{ v: -1.8, l: 'm_X−ε' }, { v: 0, l: 'm_X' }, { v: 1.8, l: 'm_X+ε' }], yticks: [],
      items: [{ area: { fn: g, from: 1.8, to: 4 }, color: 'c2', opacity: .5, hatch: true }, { area: { fn: g, from: -4, to: -1.8 }, color: 'c2', opacity: .5, hatch: true }, { fn: g },
        { text: 'P(|X−m_X| ≥ ε) ≤ σ²/ε²', at: [0, 0.44], color: 'c2' }],
      caption: 'Chebyshev bounds the two shaded tails together, whatever the shape of the PDF'
    };
  };
  PLOTS.markov = {
    w: 400, h: 220, x: [0, 6], y: [0, 1.1], xlabel: 'α', ylabel: 'f_X(α)', xticks: [{ v: 1, l: 'm_X' }, { v: 2.6, l: 'δ' }], yticks: [],
    items: [{ area: { fn: x => Math.exp(-x), from: 2.6, to: 6 }, color: 'c2', opacity: .5, hatch: true }, { fn: x => Math.exp(-x) }, { text: 'P(X ≥ δ) ≤ m_X/δ', at: [3, 0.3], anchor: 'start', color: 'c2' }],
    caption: 'Markov: for X ≥ 0 only, the tail beyond δ is at most mean/δ'
  };
  PLOTS.chebCompare = {
    w: 420, h: 230, x: [0.8, 4.2], y: [0, 1.05], xlabel: 'k', ylabel: 'P(|X−m| ≥ kσ)', xticks: [1, 2, 3, 4], yticks: [0.25, 0.5, 0.75, 1],
    items: [{ fn: k => 1 / (k * k), from: 1, to: 4.2, color: 'c2' }, { fn: k => 2 * Q(k), from: 1, to: 4.2 }, { text: 'Chebyshev bound 1/k²', at: [1.9, 0.38], anchor: 'start', color: 'c2' }, { text: 'exact for Gaussian 2Q(k)', at: [1.55, 0.08], anchor: 'start', color: 'c1' }],
    caption: 'The bound is always true but loose: at k = 2 it says ≤ 25%; a Gaussian actually has 4.6%'
  };
  PLOTS.condUni = {
    w: 400, h: 220, x: [0, 11], y: [0, 0.42], xlabel: 'α', ylabel: '', xticks: [1, 2, 5, 10], yticks: [{ v: .125, l: '1/8' }, { v: 1 / 3, l: '1/3' }],
    items: [{ pts: [[0, 0], [2, 0], [2, .125], [10, .125], [10, 0], [11, 0]], color: 'mu', dash: true, width: 1.6 },
      { pts: [[0, 0], [2, 0], [2, 1 / 3], [5, 1 / 3], [5, 0], [11, 0]], color: 'c2' }, { area: { pts: [[2, 1 / 3], [5, 1 / 3]] }, color: 'c2', opacity: .18 },
      { text: 'f_X (dashed)', at: [7.5, .16], color: 'mu' }, { text: 'f_{X|B}', at: [3.5, .37], color: 'c2' }],
    caption: 'Conditioning on B = {1 < X ≤ 5}: keep the part of f_X inside B (here 2 to 5) and rescale it so its area is 1'
  };
  PLOTS.condNorm = function () {
    const g = gauss(0, 1), c = Q(1) - Q(5);
    return {
      w: 420, h: 230, x: [-3.5, 5.5], y: [0, 1.65], xlabel: 'α', ylabel: '', xticks: [0, 1, 5], yticks: [0.4, 1.5],
      items: [{ fn: g, color: 'mu', dash: true, width: 1.5 }, { area: { fn: x => g(x) / c, from: 1, to: 5 }, color: 'c2', opacity: .2 }, { fn: x => g(x) / c, from: 1, to: 5, color: 'c2' }, { vline: 1, to: g(1) / c, color: 'c2', dash: false, width: 2.2 },
        { text: 'f_{X|B} = f_X /(Q(1) − Q(5))', at: [1.3, 1.45], anchor: 'start', color: 'c2' }, { text: 'f_X', at: [-1.4, 0.32], color: 'mu' }],
      caption: 'N(0,1) conditioned on 1 < X ≤ 5: the tail piece, scaled up by 1/0.1587 ≈ 6.3'
    };
  };
  PLOTS.mixGauss = function () {
    const p = 0.4, a = gauss(2, 0.8), b = gauss(-2, 0.8);
    return {
      w: 440, h: 220, x: [-5, 5], y: [0, 0.36], xlabel: 'y', ylabel: 'f_Y(y)', xticks: [{ v: -2, l: '−v' }, 0, { v: 2, l: '+v' }], yticks: [],
      items: [{ fn: x => p * a(x) + (1 - p) * b(x) }, { fn: x => p * a(x), color: 'c2', dash: true, width: 1.4 }, { fn: x => (1 - p) * b(x), color: 'c3', dash: true, width: 1.4 },
        { text: '(1−p)·N(−v, σ²)', at: [-2, 0.33], color: 'c3' }, { text: 'p·N(v, σ²)', at: [2, 0.25], color: 'c2' }],
      caption: 'Received signal Y = X + N: a weighted mixture of two Gaussians (drawn for p = 0.4)'
    };
  };
  PLOTS.cdfES22 = {
    w: 420, h: 220, x: [-6.5, 6.5], y: [0, 1.15], xlabel: 'u', ylabel: 'F_U(u)', xticks: [-5, -3, 3, 5], yticks: [{ v: .25, l: '1/4' }, 1],
    items: [{ pts: [[-6.5, 0], [-5, 0], [-3, .25], [3, .25], [5, 1], [6.5, 1]] }, { hline: .25, to: -3 }, { hline: 1, to: 5 }, { text: 'slope 1/8', at: [-4.2, .3], anchor: 'end', color: 'c2' }, { text: 'slope 3/8', at: [4.2, .45], anchor: 'start', color: 'c2' }],
    caption: 'ES 2022 Q2b: the CDF has no jumps, so U is continuous with a piecewise-flat PDF'
  };
  PLOTS.pdfES22 = {
    w: 420, h: 200, x: [-6.5, 6.5], y: [0, 0.48], xlabel: 'u', ylabel: 'f_U(u)', xticks: [-5, -3, 3, 5], yticks: [{ v: .125, l: '1/8' }, { v: .375, l: '3/8' }],
    items: [{ pts: [[-6.5, 0], [-5, 0], [-5, .125], [-3, .125], [-3, 0], [3, 0], [3, .375], [5, .375], [5, 0], [6.5, 0]] }, { area: { pts: [[-5, .125], [-3, .125]] }, opacity: .2 }, { area: { pts: [[3, .375], [5, .375]] }, opacity: .2 }],
    caption: 'Its PDF (the slope of the CDF): areas 1/4 and 3/4'
  };
  PLOTS.cdfES21 = {
    w: 360, h: 210, x: [-1, 2], y: [0, 1.15], xlabel: 'x', ylabel: 'F_X(x)', xticks: [0, 1], yticks: [{ v: .5, l: '1/2' }, 1],
    items: [{ pts: [[-1, 0], [0, 0]] }, { dot: [0, 0], open: true }, { vline: 0, from: 0, to: .5 }, { dot: [0, .5] }, { pts: [[0, .5], [1, 1], [2, 1]] }, { text: 'jump 1/2 ⇒ P(X=0) = 1/2', at: [0.08, .25], anchor: 'start', color: 'c2' }],
    caption: 'ES 2021 Q2a: a jump at 0 then a ramp: mixed RV'
  };
  PLOTS.cdfES25 = {
    w: 360, h: 210, x: [-0.5, 1.2], y: [0, 1.15], xlabel: 'x', ylabel: 'F(x)', xticks: [0, { v: .25, l: '1/4' }, { v: .5, l: '1/2' }, 1], yticks: [{ v: .5, l: '1/2' }, { v: .75, l: '3/4' }, 1],
    items: [{ pts: [[-0.5, 0], [0, 0]] }, { dot: [0, 0], open: true }, { vline: 0, from: 0, to: .5 }, { dot: [0, .5] }, { pts: [[0, .5], [.5, 1], [1.2, 1]] }, { hline: .75, to: .25 }, { vline: .25, to: .75 }],
    caption: 'ES 2025 Q2a: F jumps by 1/2 at x = 0, then rises linearly to 1 at x = 1/2'
  };
  PLOTS.cdfMS24 = {
    w: 380, h: 210, x: [-5, 9], y: [0, 1.15], xlabel: 'x', ylabel: 'F_X(x)', xticks: [-3, 5, 7], yticks: [0.4, 0.8, 1],
    items: [{ stairs: [[-3, .4], [5, .8], [7, 1]] }], caption: 'MS 2024 Q2b: jumps of 0.4, 0.4, 0.2'
  };
  PLOTS.laplaceAbs = {
    w: 400, h: 210, x: [-6, 6], y: [0, 0.25], xlabel: 'x', ylabel: 'p_X(x)', xticks: [-2, -1, 1, 2, 4], yticks: [{ v: 0.5 / Math.E, l: '0.184' }],
    items: [{ area: { fn: x => 0.5 * Math.abs(x) * Math.exp(-Math.abs(x)), from: -1, to: 2 }, color: 'c3', opacity: .3 }, { fn: x => 0.5 * Math.abs(x) * Math.exp(-Math.abs(x)) }],
    caption: 'MS 2021 Q1b: p_X(x) = 0.5|x|e^{−|x|} (two humps, zero at the origin). Shaded: P(−1 &lt; X ≤ 2)'
  };
  PLOTS.target = {
    w: 420, h: 220, x: [0, 3], y: [0, 0.7], xlabel: 'r', ylabel: 'f_R(r)', xticks: [{ v: 1 / Math.sqrt(3), l: '1/√3' }, 1, { v: Math.sqrt(3), l: '√3' }], yticks: [{ v: 2 / Math.PI, l: '2/π' }],
    items: [{ area: { fn: r => 2 / (Math.PI * (1 + r * r)), from: 0, to: 1 / Math.sqrt(3) }, color: 'c3', opacity: .35 }, { area: { fn: r => 2 / (Math.PI * (1 + r * r)), from: 1 / Math.sqrt(3), to: 1 }, color: 'c1', opacity: .35 },
      { area: { fn: r => 2 / (Math.PI * (1 + r * r)), from: 1, to: Math.sqrt(3) }, color: 'c5', opacity: .35 }, { fn: r => 2 / (Math.PI * (1 + r * r)) },
      { text: '4 pts', at: [0.3, 0.25] }, { text: '3', at: [0.79, 0.2] }, { text: '2', at: [1.35, 0.13] }, { text: '0 pts', at: [2.3, 0.15] }],
    caption: 'MS 2025 Q2a: f_R(r) = 2/(π(1+r²)); each ring\'s probability is the area over it'
  };
  PLOTS.vc1 = { w: 230, h: 170, x: [-1, 8], y: [0, 1.2], xlabel: 'x', ylabel: '', xticks: [2, 4, 6], yticks: [1], items: [{ pts: [[-1, 0], [0, 0]] }, { fn: x => 1 - Math.exp(-x / 2), from: 0, to: 8 }, { hline: 1 }], caption: '(i) 1 − e^{−x/2}: valid' };
  PLOTS.vc2 = { w: 230, h: 170, x: [-1, 3], y: [0, 1.2], xlabel: 'x', ylabel: '', xticks: [1, 2], yticks: [.5, 1], items: [{ pts: [[-1, 0], [0, 0]] }, { fn: x => 0.5 + 0.5 * Math.sin(Math.PI * (x - 1) / 2), from: 0, to: 2 }, { pts: [[2, 1], [3, 1]] }], caption: '(ii) 0.5 + 0.5 sin: valid' };
  PLOTS.vc3 = { w: 230, h: 170, x: [-0.5, 3], y: [0, 2.2], xlabel: 'x', ylabel: '', xticks: [{ v: 1, l: 'a' }, { v: 2, l: '2a' }], yticks: [1, 2], items: [{ pts: [[-0.5, 0], [1, 0]] }, { dot: [1, 0], open: true }, { pts: [[1, 1], [2, 2]], color: 'c2' }, { dot: [1, 1], color: 'c2' }, { dot: [2, 2], open: true, color: 'c2' }, { pts: [[2, 0], [3, 0]] }, { hline: 1, color: 'mu' }], caption: '(iii) exceeds 1, then drops: invalid' };
  PLOTS.expMedian = {
    w: 380, h: 210, x: [0, 4], y: [0, 1.1], xlabel: 'x', ylabel: 'f_X(x)', xticks: [{ v: Math.LN2, l: 'ln2/λ' }, { v: 1, l: '1/λ', dx: 6 }], yticks: [{ v: 1, l: 'λ' }],
    items: [{ area: { fn: x => Math.exp(-x), from: 0, to: Math.LN2 }, color: 'c3', opacity: .35 }, { fn: x => Math.exp(-x) }, { vline: 1, to: Math.exp(-1) }, { text: 'area 1/2', at: [0.33, 0.25], color: 'c3', size: 12 }, { text: 'mode = 0 (highest point)', at: [0.15, 1.03], anchor: 'start', color: 'c2' }],
    caption: 'Exponential: mode 0 < median ln2/λ < mean 1/λ (the long right tail pulls the mean out)'
  };
  PLOTS.memoryless = {
    w: 420, h: 210, x: [0, 5], y: [0, 1.1], xlabel: 'x', ylabel: 'P(X > x)', xticks: [1, { v: 2, l: 'a' }, 3, 4], yticks: [1],
    items: [{ fn: x => Math.exp(-x) }, { fn: x => Math.exp(-(x - 2)), from: 2, to: 5, color: 'c2', dash: true }, { vline: 2, to: 1 },
      { text: 'restarted at a: P(X > a+x | X > a)', at: [2.15, 0.85], anchor: 'start', color: 'c2', size: 12 }],
    caption: 'Memoryless: the survival curve seen from time a onward (rescaled) is the same curve again'
  };
  PLOTS.gammaShapes = {
    w: 330, h: 210, x: [0, 8], y: [0, 1.05], xlabel: 'x', ylabel: '', xticks: [2, 4, 6], yticks: [0.5, 1],
    items: [{ fn: x => Math.exp(-x) }, { fn: x => x * Math.exp(-x), color: 'c2' }, { fn: x => x * x * Math.exp(-x) / 2, color: 'c3' },
      { text: 'n=1 (exponential)', at: [0.5, 0.8], anchor: 'start' }, { text: 'n=2', at: [1.4, 0.4], anchor: 'start', color: 'c2' }, { text: 'n=3', at: [3.3, 0.25], anchor: 'start', color: 'c3' }],
    caption: 'Erlang / Gamma(n, λ = 1)'
  };
  PLOTS.rayleigh = {
    w: 330, h: 210, x: [0, 4], y: [0, 0.75], xlabel: 'r', ylabel: '', xticks: [1, 2, 3], yticks: [0.6],
    items: [{ fn: r => r * Math.exp(-r * r / 2) }, { vline: 1, to: Math.exp(-0.5) }],
    caption: 'Rayleigh (σ = 1): peak at r = σ'
  };
  PLOTS.cauchy = {
    w: 330, h: 210, x: [-5, 5], y: [0, 0.45], xlabel: 'x', ylabel: '', xticks: [-4, -2, 0, 2, 4], yticks: [],
    items: [{ fn: gauss(0, 1), color: 'mu', dash: true, width: 1.5 }, { fn: x => 1 / (Math.PI * (1 + x * x)), color: 'c2' }, { text: 'Cauchy', at: [2.2, 0.1], anchor: 'start', color: 'c2' }, { text: 'N(0,1)', at: [0.9, 0.36], anchor: 'start', color: 'mu' }],
    caption: 'Cauchy 1/(π(1+x²)): heavy tails, no mean, no MGF'
  };
  PLOTS.laplace = {
    w: 330, h: 210, x: [-5, 5], y: [0, 0.6], xlabel: 'x', ylabel: '', xticks: [-4, -2, 0, 2, 4], yticks: [0.5],
    items: [{ fn: x => 0.5 * Math.exp(-Math.abs(x)) }],
    caption: 'Laplace ½e^{−|x|}: a two-sided exponential'
  };

  /* ---------- Q table (generated) ---------- */
  function qTable() {
    let h = '<table class="qtab"><tr><th>u</th>';
    for (let c = 0; c < 10; c++) h += `<th>.0${c}</th>`;
    h += '</tr>';
    for (let r = 0; r <= 35; r++) {
      const base = r / 10;
      h += `<tr><th>${base.toFixed(1)}</th>`;
      for (let c = 0; c < 10; c++) {
        const q = Q(base + c / 100);
        h += `<td>${q >= 0.001 ? q.toFixed(4) : q.toExponential(2).replace('e-', '×10<sup>−') + '</sup>'}</td>`;
      }
      h += '</tr>';
    }
    return h + '</table>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const put = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
    put('fig-map2', conceptMap());
    put('fig-rvmap', `<figure class="diagram">${rvMap()}<figcaption>A random variable is a rule that attaches a number to every outcome</figcaption></figure>`);
    put('qtable', qTable());
  });
})();
