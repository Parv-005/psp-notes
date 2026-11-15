/* Unit 3 figures: joint distributions, functions of RVs, CLT */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="${NS}">${inner}</svg>`;
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--fg)"/></marker></defs>`;

  /* ---------- helpers ---------- */
  const gauss = (m, s) => x => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const C = (n, k) => fact(n) / (fact(k) * fact(n - k));
  const circ = (r, cx = 0, cy = 0, n = 120) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
  const curvePts = (fn, a, b, n = 120) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, fn(x)]; });
  const third = { v: 1 / 3, l: '1/3' }, sixth = { v: 1 / 6, l: '1/6' }, quarter = { v: 0.25, l: '1/4' }, half = { v: 0.5, l: '1/2' };
  // Box–Muller with the seeded generator from plot.js
  function gaussPairs(n, rho, seed) {
    const r = plotRng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(r(), 1e-9), u2 = r();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2), z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      out.push([z1, rho * z1 + Math.sqrt(1 - rho * rho) * z2]);
    }
    return out;
  }
  // ellipse  (x²−2ρxy+y²)/(1−ρ²) = c   (unit variances)
  function ellipse(rho, c, n = 120) {
    return Array.from({ length: n + 1 }, (_, i) => {
      const t = 2 * Math.PI * i / n, a = Math.sqrt(c * (1 + rho)) * Math.cos(t), b = Math.sqrt(c * (1 - rho)) * Math.sin(t);
      return [(a + b) / Math.SQRT2, (a - b) / Math.SQRT2];
    });
  }
  // Irwin–Hall pdf (sum of n U(0,1))
  function irwin(n) {
    return x => {
      if (x < 0 || x > n) return 0;
      let s = 0;
      for (let k = 0; k <= Math.floor(x); k++) s += (k % 2 ? -1 : 1) * C(n, k) * Math.pow(x - k, n - 1);
      return s / fact(n - 1);
    };
  }

  /* ---------- concept map ---------- */
  function conceptMap() {
    const B = [
      ['Two RVs on one\nexperiment (X, Y)', 10, 10, 'def'], ['Joint CDF\nF(α,β)=P(X≤α,Y≤β)', 190, 10, 'def'], ['Joint PDF / PMF\nf = ∂²F/∂α∂β', 370, 10, 'def'], ['Marginals\nintegrate other out', 550, 10, 'key'],
      ['Independence\nf_XY = f_X · f_Y', 10, 105, 'key'], ['Conditional PDF\nf(y|x) = f_XY / f_X', 190, 105, 'def'], ['Joint moments\nE[XY], Cov, ρ', 370, 105, 'key'], ['Jointly Gaussian\nN(μ, K)', 550, 105, 'thm'],
      ['Y = g(X)\nCDF method, |g′|', 10, 200, 'key'], ['Z = g(X, Y)\nX+Y → convolution', 190, 200, 'key'], ['max / min, XY,\nRayleigh, χ²', 370, 200, 'thm'], ['Joint MGF\nsums of RVs', 550, 200, 'thm'],
      ['Law of large numbers\nX̄ → mean', 190, 295, 'thm'], ['Central limit theorem\nsum → Gaussian', 370, 295, 'thm']
    ];
    const W = 710, H = 350, bw = 150, bh = 46;
    const c = i => [B[i][1] + bw / 2, B[i][2] + bh / 2];
    const E = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [2, 6], [6, 7], [3, 5], [4, 6], [0, 8], [8, 9], [9, 10], [6, 11], [9, 11], [9, 12], [9, 13], [11, 13], [7, 11]];
    let s = arrowDefs('m3a');
    E.forEach(([a, b]) => {
      let [x1, y1] = c(a), [x2, y2] = c(b);
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.min(Math.abs(dx) > 1 ? (bw / 2) / Math.abs(dx) : 9, Math.abs(dy) > 1 ? (bh / 2) / Math.abs(dy) : 9);
      x1 += dx * t; y1 += dy * t; x2 -= dx * t; y2 -= dy * t;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.2" marker-end="url(#m3a)" opacity=".7"/>`;
    });
    B.forEach(([t, x, y, k]) => {
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="var(--${k}-bg)" stroke="var(--fg)" stroke-width="1"/>`;
      const L = t.split('\n');
      L.forEach((ln, j) => { s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 5 + (j - (L.length - 1) / 2) * 16}" text-anchor="middle" font-size="12.5">${ln}</text>`; });
    });
    return svg(W, H, s);
  }

  /* ================= §0 warm-up ================= */
  PLOTS.stripsV = {
    w: 300, h: 250, x: [-0.3, 1.4], y: [-0.3, 1.3], xlabel: 'α', ylabel: 'β', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1' },
      { pts: [[0.6, 0], [0.6, 0.6]], color: 'c2', width: 3 }, { text: 'vertical strip at α:', at: [0.62, 1.2], size: 12 }, { text: 'β from 0 to α', at: [0.62, 1.08], size: 12 },
      { pts: [[-0.2, -0.2], [1.25, 1.25]], color: 'mu', dash: true, width: 1 }, { text: 'β = α', at: [1.2, 1.28], anchor: 'end', color: 'mu' }],
    caption: 'Integrate β first (inner), then α from 0 to 1'
  };
  PLOTS.stripsH = {
    w: 300, h: 250, x: [-0.3, 1.4], y: [-0.3, 1.3], xlabel: 'α', ylabel: 'β', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1' },
      { pts: [[0.35, 0.35], [1, 0.35]], color: 'c3', width: 3 }, { text: 'horizontal strip at β:', at: [0.62, 1.2], size: 12 }, { text: 'α from β to 1', at: [0.62, 1.08], size: 12 },
      { pts: [[-0.2, -0.2], [1.25, 1.25]], color: 'mu', dash: true, width: 1 }],
    caption: 'Integrate α first (inner), then β from 0 to 1'
  };

  /* ================= §1 joint CDF ================= */
  PLOTS.jcdfQuad = {
    w: 320, h: 260, x: [-3, 3], y: [-3, 3], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: 1, l: 'α' }], yticks: [{ v: 1.2, l: 'β' }],
    items: [{ pts: [[-3, -3], [1, -3], [1, 1.2], [-3, 1.2]], close: true, fill: 'c1', noStroke: true },
      { pts: [[-3, 1.2], [1, 1.2], [1, -3]], color: 'c1', width: 2 }, { dot: [1, 1.2] }, { text: '(α, β)', at: [1.15, 1.45], anchor: 'start' },
      { text: '{X ≤ α, Y ≤ β}', at: [-1.2, -1.2] }],
    caption: 'F_{XY}(α,β) = probability that (X,Y) lands in the shaded quadrant (south-west of the point)'
  };
  PLOTS.jcdfRect = {
    w: 340, h: 270, x: [-0.6, 3], y: [-0.6, 3], xlabel: 'α', ylabel: 'β',
    xticks: [{ v: 1, l: 'α₂' }, { v: 2.2, l: 'α₁' }], yticks: [{ v: 0.9, l: 'β₂' }, { v: 2.1, l: 'β₁' }],
    items: [{ pts: [[1, 0.9], [2.2, 0.9], [2.2, 2.1], [1, 2.1]], close: true, fill: 'c2' },
      { pts: [[-0.6, 0.9], [2.2, 0.9]], color: 'mu', dash: true, width: 1 }, { pts: [[-0.6, 2.1], [2.2, 2.1]], color: 'mu', dash: true, width: 1 },
      { pts: [[1, -0.6], [1, 2.1]], color: 'mu', dash: true, width: 1 }, { pts: [[2.2, -0.6], [2.2, 2.1]], color: 'mu', dash: true, width: 1 },
      { text: '①', at: [0.2, 0.15], size: 16 }, { text: '②', at: [0.2, 1.45], size: 16 }, { text: '③', at: [1.6, 0.15], size: 16 }, { text: '④', at: [1.6, 1.45], size: 16, color: 'c2' }],
    caption: 'Quadrant at (α₁,β₁) = ① ∪ ② ∪ ③ ∪ ④; region ④ is the rectangle'
  };

  /* ================= §2 joint PMF ================= */
  PLOTS.pmf2d = {
    w: 340, h: 250, x: [-0.6, 2.8], y: [-0.6, 3.6], xlabel: 'x (red)', ylabel: 'y (white)', xticks: [0, 1, 2], yticks: [0, 1, 2, 3],
    items: [
      ...[[0, 0, 4], [0, 1, 18], [0, 2, 12], [0, 3, 1], [1, 0, 12], [1, 1, 24], [1, 2, 6], [2, 0, 4], [2, 1, 3]].map(([x, y, n]) => ({ dot: [x, y], color: 'c1' })),
      ...[[0, 0, 4], [0, 1, 18], [0, 2, 12], [0, 3, 1], [1, 0, 12], [1, 1, 24], [1, 2, 6], [2, 0, 4], [2, 1, 3]].map(([x, y, n]) => ({ text: n + '/84', at: [x, y], dx: 18, dy: -6, anchor: 'start', size: 11.5 })),
      { pts: [[-0.3, 3.3], [2.6, 0.4]], color: 'mu', dash: true, width: 1 }, { text: 'x + y ≤ 3', at: [2.2, 1.3], color: 'mu' }],
    caption: 'Joint PMF as dots in the plane (urn example): each dot carries a probability'
  };

  /* ================= §3 joint PDF ================= */
  PLOTS.regionTri = {
    w: 320, h: 260, x: [-0.5, 1.6], y: [-1.3, 1.4], xlabel: 'α', ylabel: 'β', xticks: [1], yticks: [-1, 1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1' },
      { pts: [[0, 0], [1, -1]], color: 'mu', dash: true, width: 1 }, { pts: [[0, 0], [1.4, 1.4]], color: 'mu', dash: true, width: 1 },
      { vline: 1, from: -1.3, to: 1.4 }, { text: 'β = α', at: [1.35, 1.2], anchor: 'end', color: 'mu' }, { text: 'β = −α', at: [1.05, -1.1], anchor: 'start', color: 'mu' },
      { text: 'f = 0 here (β < 0)', at: [0.55, -0.45], color: 'mu', size: 11.5 }, { text: 'C', at: [0.72, 0.3], size: 15 }],
    caption: '{X ≤ 1, |Y| ≤ X} meets the support α, β ≥ 0 only in the blue triangle'
  };
  PLOTS.discA = {
    w: 280, h: 250, x: [-1.6, 1.6], y: [-1.4, 1.4], xlabel: 'α', ylabel: 'β', xticks: [{ v: -1, l: '−a' }, { v: 1, l: 'a' }], yticks: [],
    items: [{ pts: circ(1), close: true, fill: 'c1' }, { arrow: [[0, 0], [0.707, 0.707]], color: 'c2' }, { text: 'r', at: [0.3, 0.45], color: 'c2' }],
    caption: 'α² + β² ≤ a²: polar coordinates make this easy'
  };
  PLOTS.unifDiscMarg = {
    w: 320, h: 210, x: [-1.4, 1.4], y: [0, 0.8], xlabel: 'α', ylabel: 'f_X(α)', xticks: [{ v: -1, l: '−R' }, { v: 1, l: 'R' }], yticks: [{ v: 2 / Math.PI, l: '2/πR' }],
    items: [{ fn: x => Math.abs(x) <= 1 ? 2 * Math.sqrt(1 - x * x) / Math.PI : 0, n: 600 }],
    caption: 'Marginal of a point uniform on a disc: a semicircle, NOT uniform'
  };
  PLOTS.discStrip = {
    w: 280, h: 250, x: [-1.6, 1.6], y: [-1.4, 1.4], xlabel: 'α', ylabel: 'β', xticks: [{ v: 0.5, l: 'α' }], yticks: [],
    items: [{ pts: circ(1), color: 'c1' }, { pts: [[0.5, -Math.sqrt(0.75)], [0.5, Math.sqrt(0.75)]], color: 'c2', width: 3 },
      { text: '+√(R²−α²)', at: [0.55, 0.95], anchor: 'start', size: 11.5, color: 'c2' }, { text: '−√(R²−α²)', at: [0.55, -1.05], anchor: 'start', size: 11.5, color: 'c2' }],
    caption: 'For fixed α, β runs over the chord'
  };
  PLOTS.triSupport = {
    w: 280, h: 240, x: [-0.3, 1.4], y: [-0.3, 1.3], xlabel: 'x', ylabel: 'y', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [0, 1]], close: true, fill: 'c1' }, { text: 'x + y = 1', at: [0.62, 0.55], anchor: 'start' }, { pts: [[0.3, 0], [0.3, 0.7]], color: 'c2', width: 2.5 }],
    caption: 'Support x, y > 0, x + y ≤ 1; for fixed x, y runs from 0 to 1 − x'
  };

  /* ================= §6 correlation ================= */
  [[0, 'rho0', 'ρ = 0'], [0.8, 'rhoP', 'ρ = +0.8'], [-0.8, 'rhoN', 'ρ = −0.8']].forEach(([r, name, lbl], i) => {
    PLOTS[name] = {
      w: 230, h: 210, x: [-3.2, 3.2], y: [-3.2, 3.2], xlabel: 'x', ylabel: 'y', xticks: [], yticks: [],
      items: [{ scatter: gaussPairs(320, r, 11 + i), r: 1.6 }], caption: lbl
    };
  });
  PLOTS.uncorrNotIndep = {
    w: 260, h: 220, x: [-1.4, 1.4], y: [-1.4, 1.4], xlabel: 'Y = cos Θ', ylabel: 'Z = sin Θ', xticks: [-1, 1], yticks: [-1, 1],
    items: [{ pts: circ(1), color: 'c1', width: 2.5 }],
    caption: 'All mass on the unit circle: ρ = 0, yet Z is fixed (up to sign) once Y is known'
  };

  /* ================= §7 jointly Gaussian ================= */
  [[0, 'gc0', 'ρ = 0: circles'], [0.6, 'gcP', 'ρ = 0.6: tilted along y = x'], [-0.6, 'gcN', 'ρ = −0.6: tilted along y = −x']].forEach(([r, name, lbl]) => {
    PLOTS[name] = {
      w: 230, h: 210, x: [-3.2, 3.2], y: [-3.2, 3.2], xlabel: 'α', ylabel: 'β', xticks: [], yticks: [],
      items: [0.6, 2, 4].map((c, j) => ({ pts: ellipse(r, c), color: ['c1', 'c4', 'c2'][j], width: 1.8 })), caption: lbl
    };
  });

  /* ================= §9 functions of one RV ================= */
  PLOTS.linX = {
    w: 300, h: 190, x: [-0.5, 10], y: [0, 0.7], xlabel: 'α', ylabel: 'f_X', xticks: [1, 3, 5, 9], yticks: [quarter, half],
    items: [{ pts: [[1, 0], [1, 0.5], [3, 0.5], [3, 0]], close: true, fill: 'c1' }], caption: 'X ~ U[1,3]'
  };
  PLOTS.linY = {
    w: 300, h: 190, x: [-0.5, 10], y: [0, 0.7], xlabel: 'β', ylabel: 'f_Y', xticks: [1, 3, 5, 9], yticks: [quarter, half],
    items: [{ pts: [[5, 0], [5, 0.25], [9, 0.25], [9, 0]], close: true, fill: 'c2', color: 'c2' }], caption: 'Y = 2X + 3 ~ U[5,9]: shifted, stretched ×2, height ÷2'
  };
  PLOTS.linMap = {
    w: 300, h: 250, x: [-3, 3], y: [-3, 4.5], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: 0.6, l: '(β−3)/2' }], yticks: [{ v: 4.2, l: 'β' }],
    items: [{ fn: x => 2 * x + 3, color: 'c1' }, { area: { pts: [[-3, -3], [0.6, -3]], base: -3 }, color: 'c2' },
      { pts: [[-3, -3], [0.6, -3]], color: 'c2', width: 5 }, { hline: 4.2, to: 0.6 }, { vline: 0.6, to: 4.2 }, { text: 'Y ≤ β ⇔ X ≤ (β−3)/2', at: [0.9, -1.6], anchor: 'start', size: 12 }],
    caption: 'Increasing g: the event {Y ≤ β} is a half-line of X'
  };
  PLOTS.sqMap = {
    w: 300, h: 250, x: [-2.5, 2.5], y: [-0.6, 4.5], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: -1.5, l: '−√β' }, { v: 1.5, l: '√β' }], yticks: [{ v: 2.25, l: 'β' }],
    items: [{ fn: x => x * x, color: 'c1' }, { hline: 2.25, from: -1.5, to: 1.5 }, { vline: -1.5, to: 2.25, from: 0 }, { vline: 1.5, to: 2.25, from: 0 },
      { pts: [[-1.5, 0], [1.5, 0]], color: 'c2', width: 5 }, { text: '{Y ≤ β} = {−√β ≤ X ≤ √β}', at: [0, 3.9], size: 12 }],
    caption: 'Y = X²: two roots, so f_Y gets two terms'
  };
  const sqPdf = (name, f, top, cap, ticksY) => PLOTS[name] = {
    w: 260, h: 200, x: [-0.4, 4.6], y: [0, top], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [1, 4], yticks: ticksY,
    items: [{ fn: f, from: 0.012, to: 4, n: 500, color: 'c2' }, { vline: 4, to: f(4), color: 'c2', dash: false }], caption: cap
  };
  sqPdf('sqA', b => b > 0 && b <= 4 ? 1 / (4 * Math.sqrt(b)) : 0, 1.3, 'X ~ U[0,2] or U[−2,2]: 1/(4√β), 0 < β < 4', [quarter]);
  sqPdf('sqD', b => b > 0 && b < 1 ? 1 / (3 * Math.sqrt(b)) : (b >= 1 && b <= 4 ? 1 / (6 * Math.sqrt(b)) : 0), 1.3, 'X ~ U[−1,2]: 1/(3√β) on (0,1), 1/(6√β) on (1,4)', [sixth, third]);
  PLOTS.chi2 = {
    w: 300, h: 200, x: [-0.3, 6], y: [0, 1.3], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [1, 2, 3, 4, 5], yticks: [0.5, 1],
    items: [{ fn: b => b > 0 ? Math.exp(-b / 2) / Math.sqrt(2 * Math.PI * b) : 0, from: 0.01, n: 500, color: 'c2' }],
    caption: 'Y = X², X ~ N(0,1): chi-square with 1 degree of freedom'
  };
  PLOTS.absMap = {
    w: 260, h: 220, x: [-2.2, 2.2], y: [-0.5, 2.3], xlabel: 'α', ylabel: 'β', xticks: [{ v: -1.2, l: '−β' }, { v: 1.2, l: 'β' }], yticks: [{ v: 1.2, l: 'β' }],
    items: [{ fn: x => Math.abs(x), color: 'c1' }, { hline: 1.2, from: -1.2, to: 1.2 }, { pts: [[-1.2, 0], [1.2, 0]], color: 'c2', width: 5 }],
    caption: 'Y = |X|: {Y ≤ β} = {−β ≤ X ≤ β}'
  };
  PLOTS.absPdf = {
    w: 260, h: 200, x: [-1.5, 2.6], y: [0, 0.85], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [-1, 1, 2], yticks: [third, { v: 2 / 3, l: '2/3' }],
    items: [{ pts: [[-1, 0], [-1, 1 / 3], [2, 1 / 3], [2, 0]], color: 'mu', dash: true, width: 1.3 }, { pts: [[0, 0], [0, 2 / 3], [1, 2 / 3], [1, 1 / 3], [2, 1 / 3], [2, 0]], color: 'c2' }, { text: 'f_X (dashed)', at: [1.15, 0.45], anchor: 'start', color: 'mu', size: 11.5 }],
    caption: 'Y = |X|, X ~ U[−1,2]: the negative part folds onto (0,1)'
  };
  PLOTS.hwMap = {
    w: 260, h: 220, x: [-2.2, 2.4], y: [-1, 2.3], xlabel: 'α', ylabel: 'β', xticks: [-1, 2], yticks: [2],
    items: [{ pts: [[-2.2, 0], [0, 0], [2.3, 2.3]], color: 'c1' }, { text: 'all X ≤ 0 ↦ Y = 0', at: [-1.1, 0.35], size: 11.5, color: 'c2' }],
    caption: 'Half-wave rectifier Y = ½(X + |X|)'
  };
  PLOTS.hwCdf = {
    w: 260, h: 200, x: [-1.4, 2.8], y: [0, 1.2], xlabel: 'β', ylabel: 'F_Y(β)', xticks: [-1, 2], yticks: [third, 1],
    items: [{ pts: [[-1, 0], [2, 1]], color: 'mu', dash: true, width: 1.3 }, { pts: [[-1.4, 0], [0, 0]], color: 'c2' }, { pts: [[0, 1 / 3], [2, 1], [2.8, 1]], color: 'c2' }, { dot: [0, 0], open: true, color: 'c2' }, { dot: [0, 1 / 3], color: 'c2' }, { text: 'F_X (dashed)', at: [1.1, 0.3], anchor: 'start', color: 'mu', size: 11.5 }],
    caption: 'F_Y: zero for β < 0, jumps to F_X(0) = 1/3 at 0'
  };
  PLOTS.hwPdf = {
    w: 260, h: 200, x: [-1.4, 2.8], y: [0, 0.75], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [2], yticks: [third],
    items: [{ impulses: [[0, 0.62, '(1/3)δ(β)']], color: 'c2' }, { pts: [[0, 1 / 3], [2, 1 / 3], [2, 0]], color: 'c2' }],
    caption: 'Mixed RV: impulse of area 1/3 at 0 plus density 1/3 on (0,2]'
  };
  PLOTS.dzMap = {
    w: 270, h: 230, x: [-3, 3], y: [-2.3, 2.3], xlabel: 'α', ylabel: 'β', xticks: [{ v: -1, l: '−c' }, { v: 1, l: 'c' }], yticks: [],
    items: [{ pts: [[-3, -2], [-1, 0], [1, 0], [3, 2]], color: 'c1' }, { text: 'X − c', at: [2.1, 1.6], anchor: 'end' }, { text: 'X + c', at: [-2.1, -1.6], anchor: 'start' }],
    caption: 'Dead-zone: Y = 0 for |X| ≤ c, else X ∓ c'
  };
  PLOTS.dzPdf = {
    w: 270, h: 200, x: [-2.4, 2.4], y: [0, 0.75], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [-1, 1], yticks: [quarter],
    items: [{ pts: [[-1, 0], [-1, 0.25], [1, 0.25], [1, 0]], color: 'c2' }, { impulses: [[0, 0.62, '½δ(β)']], color: 'c2' }],
    caption: 'X ~ U[−2,2], c = 1: impulse ½ at 0 + density ¼ on [−1,1]'
  };
  PLOTS.dzCdf = {
    w: 270, h: 200, x: [-2.4, 2.4], y: [0, 1.2], xlabel: 'β', ylabel: 'F_Y(β)', xticks: [-1, 1], yticks: [quarter, { v: 0.75, l: '3/4' }, 1],
    items: [{ pts: [[-2.4, 0], [-1, 0], [0, 0.25]], color: 'c2' }, { pts: [[0, 0.75], [1, 1], [2.4, 1]], color: 'c2' }, { dot: [0, 0.25], open: true, color: 'c2' }, { dot: [0, 0.75], color: 'c2' }],
    caption: 'Its CDF: ramps with a jump of ½ at β = 0'
  };
  PLOTS.limMap = {
    w: 270, h: 230, x: [-3.2, 3.2], y: [-2.3, 2.3], xlabel: 'α', ylabel: 'β', xticks: [{ v: -1.5, l: '−c' }, { v: 1.5, l: 'c' }], yticks: [{ v: 1.5, l: 'c' }, { v: -1.5, l: '−c' }],
    items: [{ pts: [[-3.2, -1.5], [-1.5, -1.5], [1.5, 1.5], [3.2, 1.5]], color: 'c1' }],
    caption: 'Limiter / clipper: Y = X for |X| ≤ c, else ±c'
  };
  PLOTS.limPdf = {
    w: 270, h: 200, x: [-2.6, 2.6], y: [0, 0.6], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [-1.5, 1.5], yticks: [sixth],
    items: [{ pts: [[-1.5, 0], [-1.5, 1 / 6], [1.5, 1 / 6], [1.5, 0]], color: 'c2' }, { impulses: [[-1.5, 0.45, '¼δ'], [1.5, 0.45, '¼δ']], color: 'c2' }],
    caption: 'X ~ U[−3,3], c = 1.5: impulses ¼ at ±1.5, density 1/6 between'
  };
  PLOTS.limCdf = {
    w: 270, h: 200, x: [-2.6, 2.6], y: [0, 1.2], xlabel: 'β', ylabel: 'F_Y(β)', xticks: [-1.5, 1.5], yticks: [quarter, { v: 0.75, l: '3/4' }, 1],
    items: [{ pts: [[-2.6, 0], [-1.5, 0]], color: 'c2' }, { pts: [[-1.5, 0.25], [1.5, 0.75]], color: 'c2' }, { pts: [[1.5, 1], [2.6, 1]], color: 'c2' },
      { dot: [-1.5, 0], open: true, color: 'c2' }, { dot: [-1.5, 0.25], color: 'c2' }, { dot: [1.5, 0.75], open: true, color: 'c2' }, { dot: [1.5, 1], color: 'c2' }],
    caption: 'Its CDF: jumps of ¼ at both clipping levels'
  };
  PLOTS.quantMap = {
    w: 300, h: 260, x: [-4.6, 4.6], y: [-8.8, 8.8], xlabel: 'α', ylabel: 'β', xticks: [-4, -3, -2, -1, 1, 2, 3, 4], yticks: [-8, -4, 4, 8],
    items: [{ pts: [[-1, 0], [1, 0]], color: 'c1', width: 3 }, ...[1, 2, 3].map(k => ({ pts: [[k, 2 * k], [k + 1, 2 * k]], color: 'c1', width: 3 })), ...[1, 2, 3].map(k => ({ pts: [[-k - 1, -2 * k], [-k, -2 * k]], color: 'c1', width: 3 })),
      { pts: [[4, 8], [4.6, 8]], color: 'c1', width: 3 }, { pts: [[-4.6, -8], [-4, -8]], color: 'c1', width: 3 }],
    caption: 'Quantizer: Y takes only the levels 0, ±2, ±4, … ⇒ Y is discrete'
  };
  PLOTS.invCdf = {
    w: 320, h: 230, x: [-0.3, 4.2], y: [0, 1.15], xlabel: 'x', ylabel: 'F_X(x)', xticks: [{ v: -Math.log(0.3), l: 'x = F⁻¹(z)' }], yticks: [{ v: 0.7, l: 'z' }, 1],
    items: [{ fn: x => x >= 0 ? 1 - Math.exp(-x) : 0, color: 'c1' }, { arrow: [[0, 0.7], [-Math.log(0.3) - 0.03, 0.7]], color: 'c2' }, { arrow: [[-Math.log(0.3), 0.7], [-Math.log(0.3), 0.03]], color: 'c2' }, { hline: 1 }],
    caption: 'Inverse-CDF method: pick z ~ U(0,1) on the vertical axis, read off x'
  };
  PLOTS.arcsine = {
    w: 280, h: 200, x: [-1.4, 1.4], y: [0, 1.6], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [-1, 1], yticks: [{ v: 1 / Math.PI, l: '1/π' }, 1],
    items: [{ fn: b => Math.abs(b) < 1 ? 1 / (Math.PI * Math.sqrt(1 - b * b)) : 0, from: -0.996, to: 0.996, n: 600, color: 'c2' }, { vline: -1 }, { vline: 1 }],
    caption: 'Y = sin X, X ~ U[−π, π]: arcsine density 1/(π√(1−β²))'
  };
  PLOTS.tanMap = {
    w: 260, h: 230, x: [-1.8, 1.8], y: [-4, 4], xlabel: 'α', ylabel: 'β', xticks: [{ v: -Math.PI / 2, l: '−π/2' }, { v: Math.PI / 2, l: 'π/2' }], yticks: [],
    items: [{ fn: Math.tan, from: -1.33, to: 1.33, color: 'c1' }, { vline: -Math.PI / 2 }, { vline: Math.PI / 2 }],
    caption: 'Y = tan X: one root, monotone on (−π/2, π/2)'
  };
  PLOTS.cauchy = {
    w: 280, h: 200, x: [-5, 5], y: [0, 0.45], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [-4, -2, 0, 2, 4], yticks: [{ v: 1 / Math.PI, l: '1/π' }],
    items: [{ fn: gauss(0, 1), color: 'mu', dash: true, width: 1.4 }, { fn: x => 1 / (Math.PI * (1 + x * x)), color: 'c2' }, { text: 'Cauchy', at: [2, 0.12], anchor: 'start', color: 'c2' }],
    caption: 'Result: Cauchy 1/[π(1+β²)] (dashed: N(0,1) for comparison)'
  };
  PLOTS.expY = {
    w: 300, h: 200, x: [-0.2, 3], y: [0, 5.5], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [{ v: Math.exp(-3), l: 'e⁻³' }, 1, 2, { v: Math.E, l: 'e' }], yticks: [1, 5],
    items: [{ fn: y => 1 / (4 * y), from: Math.exp(-3), to: Math.E, color: 'c2' }, { vline: Math.exp(-3), to: 1 / (4 * Math.exp(-3)), color: 'c2', dash: false }, { vline: Math.E, to: 1 / (4 * Math.E), color: 'c2', dash: false }],
    caption: 'f_Y(β) = 1/(4β) on (e⁻³, e)'
  };
  PLOTS.lognormal = {
    w: 300, h: 200, x: [-0.2, 5], y: [0, 0.75], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [1, 2, 3, 4], yticks: [0.5],
    items: [{ fn: y => y > 0 ? Math.exp(-(Math.log(y) ** 2) / 2) / (y * Math.sqrt(2 * Math.PI)) : 0, from: 0.005, n: 600, color: 'c2' }],
    caption: 'Y = e^{X}, X ~ N(0,1): log-normal (skewed right)'
  };
  PLOTS.laplaceSq = {
    w: 300, h: 200, x: [-0.2, 6], y: [0, 1.5], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [1, 2, 3, 4, 5], yticks: [0.5, 1],
    items: [{ fn: y => y > 0 ? Math.exp(-Math.sqrt(y)) / (2 * Math.sqrt(y)) : 0, from: 0.01, n: 600, color: 'c2' }],
    caption: 'Y = X² for Laplace X: e^{−√β}/(2√β)'
  };
  PLOTS.jumpG = {
    w: 260, h: 230, x: [-2.5, 2.5], y: [-3.2, 3.2], xlabel: 'x', ylabel: 'g(x)', xticks: [], yticks: [{ v: 1, l: 'c' }, { v: -1, l: '−c' }],
    items: [{ pts: [[0, 1], [2.2, 3.2]], color: 'c1' }, { pts: [[-2.2, -3.2], [0, -1]], color: 'c1' }, { dot: [0, 1], color: 'c1' }, { dot: [0, -1], open: true, color: 'c1' }],
    caption: 'g jumps over (−c, c): Y never lands there'
  };
  const FXlog = x => 1 / (1 + Math.exp(-1.4 * x));
  PLOTS.jumpFY = {
    w: 300, h: 230, x: [-4, 4], y: [0, 1.15], xlabel: 'y', ylabel: 'F_Y(y)', xticks: [{ v: -1, l: '−c' }, { v: 1, l: 'c' }], yticks: [{ v: 0.5, l: 'F_X(0)' }, 1],
    items: [{ fn: FXlog, color: 'mu', dash: true, width: 1.3 }, { fn: y => FXlog(y + 1), to: -1, color: 'c2' }, { pts: [[-1, 0.5], [1, 0.5]], color: 'c2' }, { fn: y => FXlog(y - 1), from: 1, color: 'c2' }, { text: 'F_X (dashed)', at: [-3.8, 0.55], anchor: 'start', color: 'mu', size: 11.5 }],
    caption: 'F_Y = F_X shifted left by c (y < −c), flat at F_X(0) on [−c, c), shifted right by c (y ≥ c)'
  };

  /* ================= §10 functions of two RVs ================= */
  PLOTS.sumRegion = {
    w: 300, h: 250, x: [-2.5, 3], y: [-2.5, 3], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: 1.5, l: 'θ' }], yticks: [{ v: 1.5, l: 'θ' }],
    items: [{ pts: [[-2.5, -2.5], [3, -2.5], [3, -1.5], [-2.5, 4]], close: true, fill: 'c1', noStroke: true }, { pts: [[-1, 2.5], [3, -1.5]], color: 'c1' }, { text: 'α + β = θ', at: [1.7, 0.4], anchor: 'start' }, { text: '{X + Y ≤ θ}', at: [-1.2, -1.3] },
      { pts: [[-2.5, 0.8], [0.7, 0.8]], color: 'c2', width: 3 }, { text: 'α < θ − β', at: [-2.3, 1.05], anchor: 'start', color: 'c2', size: 12 }],
    caption: 'Z = X + Y: integrate f_XY below the line α + β = θ'
  };
  PLOTS.convSlide = {
    w: 340, h: 200, x: [-1.4, 2], y: [0, 1.5], xlabel: 'α', ylabel: '', xticks: [{ v: -0.4, l: 'θ−1' }, 0, { v: 0.6, l: 'θ' }, 1], yticks: [1],
    items: [{ pts: [[0, 0], [0, 1], [1, 1], [1, 0]], color: 'c1' }, { pts: [[-0.4, 0], [-0.4, 1.12], [0.6, 1.12], [0.6, 0]], color: 'c2', dash: true }, { area: { pts: [[0, 1], [0.6, 1]] }, color: 'c4', opacity: 0.35 },
      { text: 'f_X(α)', at: [1.05, 1.08], anchor: 'start', color: 'c1' }, { text: 'f_Y(θ−α)', at: [-0.4, 1.25], anchor: 'start', color: 'c2' }, { text: 'overlap = θ', at: [0.3, 0.5], size: 12 }],
    caption: 'Convolution: flip f_Y, slide it to θ, integrate the product (0 ≤ θ ≤ 1 shown)'
  };
  PLOTS.convSlide2 = {
    w: 340, h: 200, x: [-0.4, 2.4], y: [0, 1.5], xlabel: 'α', ylabel: '', xticks: [0, { v: 0.5, l: 'θ−1' }, 1, { v: 1.5, l: 'θ' }], yticks: [1],
    items: [{ pts: [[0, 0], [0, 1], [1, 1], [1, 0]], color: 'c1' }, { pts: [[0.5, 0], [0.5, 1.12], [1.5, 1.12], [1.5, 0]], color: 'c2', dash: true }, { area: { pts: [[0.5, 1], [1, 1]] }, color: 'c4', opacity: 0.35 },
      { text: 'f_X(α)', at: [0.05, 1.25], anchor: 'start', color: 'c1' }, { text: 'f_Y(θ−α)', at: [1.05, 1.25], anchor: 'start', color: 'c2' }, { text: 'overlap = 2−θ', at: [0.75, 0.5], size: 12 }],
    caption: '1 ≤ θ ≤ 2: the sliding box has started to leave; overlap is [θ−1, 1]'
  };
  PLOTS.triangle = {
    w: 300, h: 200, x: [-0.5, 2.6], y: [0, 1.25], xlabel: 'θ', ylabel: 'f_Z(θ)', xticks: [1, 2], yticks: [1],
    items: [{ pts: [[-0.5, 0], [0, 0], [1, 1], [2, 0], [2.6, 0]], color: 'c2' }],
    caption: 'Sum of two independent U[0,1]: triangular on [0,2]'
  };
  PLOTS.triangleAB = {
    w: 300, h: 200, x: [-2.6, 2.6], y: [0, 1.25], xlabel: 'θ', ylabel: 'f_Z(θ)', xticks: [{ v: -2, l: '2a' }, { v: 0, l: 'a+b' }, { v: 2, l: '2b' }], yticks: [{ v: 1, l: '1/(b−a)' }],
    items: [{ pts: [[-2.6, 0], [-2, 0], [0, 1], [2, 0], [2.6, 0]], color: 'c2' }],
    caption: 'General: X, Y iid U[a,b] ⇒ triangle on [2a, 2b], peak 1/(b−a)'
  };
  PLOTS.erlang2 = {
    w: 300, h: 200, x: [-0.2, 6], y: [0, 1.05], xlabel: 'θ', ylabel: '', xticks: [1, 2, 3, 4, 5], yticks: [1],
    items: [{ fn: z => z >= 0 ? Math.exp(-z) : 0, color: 'mu', dash: true, width: 1.4 }, { fn: z => z >= 0 ? z * Math.exp(-z) : 0, color: 'c2' }, { text: 'f_X = e^{−θ}', at: [0.3, 0.85], anchor: 'start', color: 'mu' }, { text: 'f_Z = θe^{−θ}', at: [2.1, 0.3], anchor: 'start', color: 'c2' }],
    caption: 'X + Y for iid Exp(1): Erlang-2 (gamma), peak at θ = 1/λ'
  };
  const hyp = t => x => t / x;
  PLOTS.xyRegion = {
    w: 300, h: 260, x: [-3, 3], y: [-3, 3], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [], yticks: [],
    items: [
      { pts: [[0, 0], [0, 3], ...curvePts(hyp(1), 1 / 3, 3).map(p => p), [3, 0]], close: true, fill: 'c1', noStroke: true },
      { pts: [[0, 0], [0, -3], ...curvePts(hyp(1), -1 / 3, -3), [-3, 0]], close: true, fill: 'c1', noStroke: true },
      { pts: [[0, 0], [-3, 0], [-3, 3], [0, 3]], close: true, fill: 'c1', noStroke: true }, { pts: [[0, 0], [3, 0], [3, -3], [0, -3]], close: true, fill: 'c1', noStroke: true },
      { fn: hyp(1), from: 1 / 3, to: 3, color: 'c2' }, { fn: hyp(1), from: -3, to: -1 / 3, color: 'c2' }, { text: 'αβ = θ', at: [1.3, 1.6], anchor: 'start', color: 'c2' }],
    caption: 'Z = XY, θ > 0: {XY ≤ θ} is everything except the two shaded-out corners beyond the hyperbola'
  };
  PLOTS.negLn = {
    w: 280, h: 200, x: [-0.15, 1.2], y: [0, 4.3], xlabel: 'θ', ylabel: 'f_Z(θ)', xticks: [0.5, 1], yticks: [1, 2, 3, 4],
    items: [{ fn: z => z > 0 && z <= 1 ? -Math.log(z) : 0, from: 0.015, to: 1, n: 500, color: 'c2' }],
    caption: 'Z = XY for iid U(0,1): f_Z(θ) = −ln θ, 0 < θ < 1'
  };
  PLOTS.maxRegion = {
    w: 280, h: 250, x: [-2.5, 2.5], y: [-2.5, 2.5], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: 1, l: 'z' }], yticks: [{ v: 1, l: 'z' }],
    items: [{ pts: [[-2.5, -2.5], [1, -2.5], [1, 1], [-2.5, 1]], close: true, fill: 'c1', noStroke: true }, { pts: [[-2.5, 1], [1, 1], [1, -2.5]], color: 'c1' }, { pts: [[-2.5, -2.5], [2.5, 2.5]], color: 'mu', dash: true, width: 1 }, { text: '{max ≤ z} = {X ≤ z, Y ≤ z}', at: [-0.7, -1.6], size: 12 }],
    caption: 'max(X,Y) ≤ z ⇔ both ≤ z: a quadrant ⇒ F_Z(z) = F_XY(z,z)'
  };
  PLOTS.minRegion = {
    w: 280, h: 250, x: [-2.5, 2.5], y: [-2.5, 2.5], xlabel: 'α (X)', ylabel: 'β (Y)', xticks: [{ v: 0.6, l: 'z' }], yticks: [{ v: 0.6, l: 'z' }],
    items: [{ pts: [[-2.5, -2.5], [2.5, -2.5], [2.5, 0.6], [0.6, 0.6], [0.6, 2.5], [-2.5, 2.5]], close: true, fill: 'c1', noStroke: true }, { pts: [[2.5, 0.6], [0.6, 0.6], [0.6, 2.5]], color: 'c1' }, { text: 'X > z, Y > z', at: [1.55, 1.6], size: 12 }, { text: '{min ≤ z}', at: [-1, -1.2], size: 12 }],
    caption: 'min(X,Y) ≤ z ⇔ at least one ≤ z: complement of the NE quadrant'
  };
  PLOTS.maxU = {
    w: 260, h: 200, x: [-1.5, 1.5], y: [0, 1.25], xlabel: 'α', ylabel: 'f_Z(α)', xticks: [-1, 1], yticks: [half, 1],
    items: [{ pts: [[-1, 0], [-1, 0.5], [1, 0.5], [1, 0]], color: 'mu', dash: true, width: 1.3 }, { pts: [[-1.5, 0], [-1, 0], [1, 1], [1, 0], [1.5, 0]], color: 'c2' }],
    caption: 'Z = max of two iid U[−1,1]: (α+1)/2 — leans right'
  };
  PLOTS.minU = {
    w: 260, h: 200, x: [-2.6, 2.6], y: [0, 0.65], xlabel: 'z', ylabel: 'f_Z(z)', xticks: [-2, 2], yticks: [quarter, half],
    items: [{ pts: [[-2, 0], [-2, 0.25], [2, 0.25], [2, 0]], color: 'mu', dash: true, width: 1.3 }, { pts: [[-2.6, 0], [-2, 0], [-2, 0.5], [2, 0], [2.6, 0]], color: 'c2' }],
    caption: 'Z = min of two iid U[−2,2]: (2−z)/8 — leans left'
  };
  PLOTS.negMax = {
    w: 260, h: 200, x: [-1.5, 1.5], y: [0, 1.25], xlabel: 'α', ylabel: 'f_W(α)', xticks: [-1, 1], yticks: [1],
    items: [{ pts: [[-1.5, 0], [-1, 0], [-1, 1], [1, 0], [1.5, 0]], color: 'c2' }],
    caption: 'Wanted: W = −max(X,Y), X,Y iid U[−1,1]'
  };
  PLOTS.rayleigh = {
    w: 300, h: 200, x: [0, 4.2], y: [0, 1.05], xlabel: 'z', ylabel: '', xticks: [1, 2, 3, 4], yticks: [0.5, 1],
    items: [{ fn: z => z * Math.exp(-z * z / 2), color: 'c2' }, { fn: z => 0.5 * Math.exp(-z / 2), color: 'c1', dash: true }, { text: 'Rayleigh √(X²+Y²)', at: [1.3, 0.66], anchor: 'start', color: 'c2' }, { text: 'exponential X²+Y²', at: [2.2, 0.27], anchor: 'start', color: 'c1' }],
    caption: 'X, Y iid N(0,1): R = √(X²+Y²) is Rayleigh; R² is exponential (mean 2σ²)'
  };
  PLOTS.laplace = {
    w: 280, h: 200, x: [-4.5, 4.5], y: [0, 0.6], xlabel: 'z', ylabel: 'f_Z(z)', xticks: [-4, -2, 0, 2, 4], yticks: [half],
    items: [{ fn: z => 0.5 * Math.exp(-Math.abs(z)), color: 'c2' }], caption: 'Z = X − Y, iid Exp(1): Laplace ½e^{−|z|}'
  };

  /* ================= §11 CLT ================= */
  [[1, 'clt1'], [2, 'clt2'], [3, 'clt3'], [12, 'clt12']].forEach(([n, name]) => {
    const m = n / 2, s = Math.sqrt(n / 12), f = irwin(n);
    PLOTS[name] = {
      w: 220, h: 170, x: [-3.5, 3.5], y: [0, 0.62], xlabel: 'z', ylabel: '', xticks: [-2, 0, 2], yticks: [],
      items: [{ fn: gauss(0, 1), color: 'mu', dash: true, width: 1.4 }, { fn: z => s * f(m + s * z), color: 'c2', n: 600 }],
      caption: `n = ${n}`
    };
  });
  PLOTS.cltBinom = (() => {
    const n = 30, p = 0.3, q = 1 - p, st = [];
    for (let k = 0; k <= 20; k++) st.push([k, C(n, k) * p ** k * q ** (n - k)]);
    return {
      w: 360, h: 200, x: [-0.8, 20.5], y: [0, 0.18], xlabel: 'k', ylabel: '', xticks: [0, 5, 9, 15, 20], yticks: [0.1],
      items: [{ stems: st, color: 'c1', width: 2 }, { fn: gauss(9, Math.sqrt(n * p * q)), color: 'c2', dash: true }],
      caption: 'Binomial(30, 0.3) (stems) vs N(9, 6.3) (dashed): a sum of 30 Bernoullis is already nearly Gaussian'
    };
  })();

  /* ================= PYQ figures ================= */
  PLOTS.ms24A = {
    w: 230, h: 220, x: [-12, 14], y: [-12, 14], xlabel: 'x', ylabel: 'y', xticks: [10], yticks: [10],
    items: [{ pts: [[-12, -12], [14, -12], [14, -4], [-4, 14], [-12, 14]], close: true, fill: 'c1', noStroke: true }, { pts: [[-4, 14], [14, -4]], color: 'c1' }], caption: 'A: x + y ≤ 10'
  };
  PLOTS.ms24B = {
    w: 230, h: 220, x: [-12, 14], y: [-12, 14], xlabel: 'x', ylabel: 'y', xticks: [5], yticks: [5],
    items: [{ pts: [[-12, -12], [14, -12], [14, 5], [5, 5], [5, 14], [-12, 14]], close: true, fill: 'c1', noStroke: true }, { pts: [[14, 5], [5, 5], [5, 14]], color: 'c1' }], caption: 'B: min(x,y) ≤ 5'
  };
  PLOTS.ms24C = {
    w: 230, h: 220, x: [-12, 14], y: [-12, 14], xlabel: 'x', ylabel: 'y', xticks: [10], yticks: [10],
    items: [{ pts: circ(10), close: true, fill: 'c1' }], caption: 'C: x² + y² ≤ 100'
  };
  PLOTS.ms23Region = {
    w: 260, h: 230, x: [-0.4, 3], y: [-0.4, 3], xlabel: 'α', ylabel: 'β', xticks: [], yticks: [],
    items: [{ pts: [[0, 0], [3, 0], [3, 3]], close: true, fill: 'c1' }, { text: 'β = α', at: [2.2, 2.6], anchor: 'end', color: 'mu' }, { pts: [[1.6, 0], [1.6, 1.6]], color: 'c2', width: 2.5 }, { text: 'X > Y', at: [2.2, 0.7] }],
    caption: '{X > Y}: below the diagonal; for fixed α, β ∈ (0, α)'
  };
  PLOTS.ms25Sq1 = {
    w: 240, h: 220, x: [-0.2, 1.3], y: [-0.2, 1.3], xlabel: 'x', ylabel: 'y', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1], [0, 1]], close: true, color: 'mu', width: 1 }, { pts: [[0, 0], ...curvePts(x => x * x, 0, 1), [1, 0]], close: true, fill: 'c1' }, { text: 'y = x²', at: [0.55, 0.5], anchor: 'end', color: 'c1' }],
    caption: '{Y < X²}'
  };
  PLOTS.ms25Sq2 = {
    w: 240, h: 220, x: [-0.2, 1.3], y: [-0.2, 1.3], xlabel: 'x', ylabel: 'y', xticks: [0.5, 1], yticks: [0.5, 1],
    items: [{ pts: [[0.5, 0], [1, 0], [1, 1], [0, 1], [0, 0.5]], close: true, fill: 'c1' }, { pts: [[0, 0], [0.5, 0], [0, 0.5]], close: true, fill: 'c2' }, { text: 'x+y ≤ ½', at: [0.08, 0.1], anchor: 'start', size: 10.5 }],
    caption: '{X + Y > 0.5} = square minus small triangle'
  };
  PLOTS.es25Rect = {
    w: 260, h: 240, x: [-0.3, 2.6], y: [-0.3, 3.4], xlabel: 'x', ylabel: 'y', xticks: [1, 2], yticks: [1, 2, 3],
    items: [{ pts: [[0, 0], [2, 0], [2, 3], [0, 3]], close: true, color: 'mu', width: 1 }, { pts: [[0, 0], [2, 2], [2, 3], [0, 3]], close: true, fill: 'c1' }, { text: 'y = x', at: [1.6, 1.25], color: 'mu' }],
    caption: '{X < Y} inside the rectangle (0,2)×(0,3)'
  };
  PLOTS.ms25Abs = {
    w: 260, h: 240, x: [-3, 3], y: [-3, 3], xlabel: 'x', ylabel: 'y', xticks: [{ v: -1.2, l: '−β' }, { v: 1.2, l: 'β' }], yticks: [{ v: -1, l: '−α' }, { v: 1, l: 'α' }],
    items: [[1.2, 1], [-1.2, 1], [1.2, -1], [-1.2, -1]].map(([sx, sy]) => ({ pts: [[sx, sy], [3 * Math.sign(sx), sy], [3 * Math.sign(sx), 3 * Math.sign(sy)], [sx, 3 * Math.sign(sy)]], close: true, fill: 'c1' })),
    caption: '{|X| > β, |Y| > α}: four corner regions'
  };
  PLOTS.unitSqCdf = {
    w: 300, h: 260, x: [-0.6, 1.8], y: [-0.6, 1.8], xlabel: 'x', ylabel: 'y', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1], [0, 1]], close: true, fill: 'c1' }, { pts: [[1, 0], [1, 1.8]], color: 'mu', dash: true, width: 1 }, { pts: [[0, 1], [1.8, 1]], color: 'mu', dash: true, width: 1 },
      { text: 'xy', at: [0.5, 0.45] }, { text: 'x', at: [0.5, 1.4] }, { text: 'y', at: [1.4, 0.45] }, { text: '1', at: [1.4, 1.4] }, { text: '0', at: [-0.35, 0.6], color: 'mu' }, { text: '0', at: [0.6, -0.35], color: 'mu' }],
    caption: 'Value of F_XY(x,y) in each region of the plane'
  };

  /* ================= on-ramp figures (added 2026-11-16) ================= */
  const RNG3 = seed => { const r = plotRng((seed * 2654435761) >>> 0 || 1); for (let i = 0; i < 30; i++) r(); return r; };
  const triCloud = (n, seed) => { const r = RNG3(seed), o = []; for (let i = 0; i < n; i++) { const a = r(), b = r(); o.push([Math.max(a, b), Math.min(a, b)]); } return o; };
  const sqCloud = (n, seed) => { const r = RNG3(seed), o = []; for (let i = 0; i < n; i++) o.push([r(), r()]); return o; };
  const TRI = triCloud(1400, 5), SQ = sqCloud(1400, 9);
  const triEdge = { pts: [[0, 0], [1, 0], [1, 1], [0, 0]], color: 'mu', width: 1 };
  const sqEdge = { pts: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], color: 'mu', width: 1 };
  const unitAx = { w: 260, h: 240, x: [-0.12, 1.15], y: [-0.12, 1.15], xlabel: 'x', ylabel: 'y', xticks: [0.5, 1], yticks: [0.5, 1] };
  PLOTS.tourCloud = { ...unitAx, items: [{ scatter: TRI, r: 1.3, opacity: 0.55, color: 'c1' }, triEdge],
    caption: '1400 throws of the "dart" (X, Y) with f = 2 on the triangle 0 < y < x < 1. The joint PDF is how crowded the dots are' };
  PLOTS.tourMarg = (() => {
    const bins = 10, cnt = Array(bins).fill(0); TRI.forEach(([x]) => cnt[Math.min(bins - 1, Math.floor(x * bins))]++);
    const pts = [[0, 0]]; cnt.forEach((c, i) => { const h = c / TRI.length * bins; pts.push([i / bins, h], [(i + 1) / bins, h]); }); pts.push([1, 0]);
    return { w: 260, h: 240, x: [-0.05, 1.1], y: [0, 2.3], xlabel: 'x', ylabel: 'f_X(x)', xticks: [0.5, 1], yticks: [1, 2],
      items: [{ pts, color: 'c1', fill: 'c1', opacity: 0.25 }, { fn: x => 2 * x, from: 0, to: 1, color: 'c2' }, { text: 'f_X = 2x', at: [0.45, 1.35], color: 'c2' }],
      caption: 'Ignore y and histogram the x-values: the marginal f_X(x) = 2x. More dots on the right because the triangle is taller there' };
  })();
  PLOTS.tourSlice = { ...unitAx, items: [{ scatter: TRI.filter(p => Math.abs(p[0] - 0.7) > 0.025), r: 1.2, opacity: 0.25, color: 'mu' }, { scatter: TRI.filter(p => Math.abs(p[0] - 0.7) <= 0.025), r: 2, opacity: 0.95, color: 'c2' }, triEdge, { text: 'X ≈ 0.7', at: [0.7, 1.08], color: 'c2' }],
    caption: 'Keep only the throws with X ≈ 0.7: their y-values spread evenly over (0, 0.7). That is the conditional PDF f_{Y|X}(y | 0.7)' };
  const band = (cloud, c) => cloud.filter(p => Math.abs(p[0] - c) <= 0.03);
  PLOTS.tourIndepSq = { ...unitAx, items: [{ scatter: SQ, r: 1.1, opacity: 0.25, color: 'mu' }, { scatter: band(SQ, 0.2), r: 2, opacity: 1, color: 'c3' }, { scatter: band(SQ, 0.8), r: 2, opacity: 1, color: 'c2' }, sqEdge],
    caption: 'Uniform on the square: the slice at x = 0.2 and the slice at x = 0.8 look the same. Knowing X tells you nothing about Y: independent' };
  PLOTS.tourIndepTri = { ...unitAx, items: [{ scatter: TRI, r: 1.1, opacity: 0.25, color: 'mu' }, { scatter: band(TRI, 0.2), r: 2, opacity: 1, color: 'c3' }, { scatter: band(TRI, 0.8), r: 2, opacity: 1, color: 'c2' }, triEdge],
    caption: 'Uniform on the triangle: at x = 0.2, Y is squeezed below 0.2; at x = 0.8 it can go up to 0.8. Knowing X changes Y: dependent' };
  PLOTS.tourFunc = { ...unitAx, items: [{ scatter: SQ.filter(p => p[0] + p[1] <= 1.2), r: 1.2, opacity: 0.6, color: 'c1' }, { scatter: SQ.filter(p => p[0] + p[1] > 1.2), r: 1.2, opacity: 0.35, color: 'c4' }, sqEdge, { pts: [[0.2, 1], [1, 0.2]], color: 'c2', width: 2 }, { text: 'x + y = 1.2', at: [0.98, 0.32], anchor: 'end', color: 'c2' }],
    caption: 'Z = X + Y: F_Z(1.2) is the fraction of dots below the line x + y = 1.2 (about 68%; exactly 1 − 0.8²/2 = 0.68)' };
  PLOTS.covQuad = (() => { const P = gaussPairs(600, 0.6, 2654435); return { w: 300, h: 270, x: [-3, 3], y: [-3, 3], xlabel: 'x − m_X', ylabel: 'y − m_Y', xticks: [-2, 2], yticks: [-2, 2],
    items: [{ scatter: P.filter(([a, b]) => a * b >= 0), r: 1.5, opacity: 0.6, color: 'c1' }, { scatter: P.filter(([a, b]) => a * b < 0), r: 1.5, opacity: 0.7, color: 'c2' }, { vline: 0 }, { hline: 0 },
      { text: '+ (both above)', at: [1.5, 2.6], color: 'c1', size: 12 }, { text: '+ (both below)', at: [-1.5, -2.6], color: 'c1', size: 12 }, { text: '− (x below, y above)', at: [-1.5, 2.6], color: 'c2', size: 12 }, { text: '− (x above, y below)', at: [1.5, -2.6], color: 'c2', size: 12 }],
    caption: 'Each dot contributes (x − m_X)(y − m_Y): blue dots positive, orange negative. Blue wins here, so Cov > 0 (ρ = 0.6)' }; })();
  // region gallery
  const G = (items, cap) => ({ w: 230, h: 210, x: [-0.15, 1.25], y: [-0.15, 1.25], xlabel: 'x', ylabel: 'y', xticks: [1], yticks: [1], items: [sqEdge, ...items], caption: cap });
  PLOTS.gR1 = G([{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1' }, { text: 'y < x', at: [0.72, 0.25] }], '① {Y < X}');
  PLOTS.gR2 = G([{ pts: [[0, 0], [1, 0], [0, 1]], close: true, fill: 'c1' }, { text: 'x + y ≤ 1', at: [0.33, 0.3], size: 12 }], '② {X + Y ≤ 1}');
  PLOTS.gR3 = G([{ pts: [[0, 0], [1, 0], [1, 0.4], [0.4, 1], [0, 1]], close: true, fill: 'c1' }, { pts: [[0.4, 1], [1, 0.4]], color: 'c2' }, { text: 'cut corner', at: [0.86, 0.9], size: 11, color: 'c2' }], '③ {X + Y ≤ θ}, θ = 1.4');
  PLOTS.gR4 = G([{ pts: [[0.3, 0], [1, 0], [1, 0.7]], close: true, fill: 'c1' }, { pts: [[0, 0.3], [0, 1], [0.7, 1]], close: true, fill: 'c1' }], '④ {|X − Y| > c}, c = 0.3');
  PLOTS.gR5 = G([{ pts: [...curvePts(x => x * x, 0, 1, 60), [0, 1]], close: true, fill: 'c1' }, { text: 'y = x²', at: [0.8, 0.45], size: 12, color: 'c2' }], '⑤ {Y > X²}');
  PLOTS.gR6 = G([{ pts: [...curvePts(x => 0.3 / x, 0.3, 1, 60), [1, 1], [0.3, 1]], close: true, fill: 'c1' }, { text: 'xy = θ', at: [0.45, 0.35], size: 12, color: 'c2' }], '⑥ {XY > θ}, θ = 0.3');
  PLOTS.gR7 = G([{ pts: [[0, 0], [0.6, 0], [0.6, 0.6], [0, 0.6]], close: true, fill: 'c1' }, { pts: [[0.6, 0.6], [1, 0.6], [1, 1], [0.6, 1]], close: true, fill: 'c2' }, { text: 'max ≤ z', at: [0.3, 0.3], size: 11.5 }, { text: 'min > z', at: [0.8, 0.8], size: 11, color: 'c2' }], '⑦ max ≤ z and min > z (z = 0.6)');
  PLOTS.gR8 = { w: 230, h: 210, x: [-0.3, 3.2], y: [-0.3, 3.2], xlabel: 'x', ylabel: 'y', xticks: [1, 2], yticks: [1, 2],
    items: [{ pts: [[0, 0], [3.2, 0], [3.2, 3.2]], close: true, fill: 'c1' }, { text: 'y < x', at: [2.3, 0.8] }, { text: '→ ∞', at: [2.9, 2.2], size: 12, color: 'mu' }], caption: '⑧ {0 < Y < X} on the quadrant' };
  PLOTS.jcdfZones = {
    w: 330, h: 290, x: [-0.6, 1.7], y: [-0.6, 1.7], xlabel: 'α', ylabel: 'β', xticks: [1], yticks: [1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1' }, { pts: [[0, 0], [1.6, 1.6]], color: 'mu', dash: true, width: 1 }, { vline: 1 }, { hline: 1, from: 0 }, { vline: 0 }, { hline: 0 },
      { text: 'A: 0', at: [-0.32, 0.6], color: 'mu' }, { text: '2αβ − β²', at: [0.72, 0.22], size: 12 }, { text: 'B', at: [0.82, 0.5], size: 12 }, { text: 'C: α²', at: [0.35, 0.95], size: 12 }, { text: 'D: 2β − β²', at: [1.38, 0.5], size: 11.5 }, { text: 'E: 1', at: [1.38, 1.4] }],
    caption: 'F_XY(α, β) for f = 2 on the triangle: a different formula in each zone' };
  PLOTS.drillRegion = {
    w: 300, h: 260, x: [-0.12, 1.2], y: [-0.12, 1.15], xlabel: 'x', ylabel: 'y', xticks: [0.5, 1], yticks: [0.5, 1],
    items: [{ pts: [[0, 0], [1, 0], [1, 1]], close: true, fill: 'c1', opacity: 0.15 }, { pts: [[0, 0], [1, 0], [0.5, 0.5]], close: true, fill: 'c1', opacity: 0.45 }, { pts: [[0, 1], [1, 0]], color: 'c2', dash: true, width: 1.3 }, { text: 'x + y = 1', at: [0.15, 0.95], anchor: 'start', color: 'c2', size: 12 },
      { pts: [[0.2, 0.2], [0.8, 0.2]], color: 'c3', width: 3 }, { text: 'x from y to 1 − y', at: [0.5, 0.1], color: 'c3', size: 11.5 }, { text: 'y = x', at: [0.95, 1.05], anchor: 'end', color: 'mu', size: 12 }],
    caption: 'Running example: support (light) and the event X + Y < 1 (dark). A horizontal strip needs no splitting' };
  PLOTS.minMap = {
    w: 300, h: 230, x: [0, 3], y: [0, 1.4], xlabel: 'α (value of X)', ylabel: 'β = min(α, 1)', xticks: [1, 2, 3], yticks: [0.5, 1],
    items: [{ pts: [[0, 0], [1, 1], [3, 1]], color: 'c1' }, { pts: [[1, 1], [3, 1]], color: 'c2', width: 4 }, { text: 'flat: every α > 1 gives β = 1', at: [2, 1.2], color: 'c2', size: 12 }, { hline: 0.6, dash: true, to: 3 }, { pts: [[0, 0.02], [0.6, 0.02]], color: 'c3', width: 5 }, { text: 'C_β = [0, β]', at: [0.35, 0.12], color: 'c3', size: 12, anchor: 'start' }],
    caption: 'Y = min(X, 1): for β < 1 the inputs giving Y ≤ β are α ≤ β (green); the flat part piles mass on β = 1' };
  PLOTS.minPdf = {
    w: 300, h: 230, x: [-0.2, 1.6], y: [0, 1.1], xlabel: 'β', ylabel: 'f_Y(β)', xticks: [1], yticks: [{ v: Math.exp(-1), l: 'e^{−1}' }, 1],
    items: [{ fn: b => Math.exp(-b), from: 0, to: 1, color: 'c1' }, { area: { fn: b => Math.exp(-b), from: 0, to: 1 }, color: 'c1', opacity: 0.18 }, { impulses: [[1, 0.75, 'e^{−1} = 0.368']], color: 'c2' }],
    caption: 'Mixed RV: density e^{−β} on (0, 1) plus an impulse of weight e^{−1} at 1 (area 1 − e^{−1} + e^{−1} = 1)' };
  const sqLine = th => { const pts = th <= 1 ? [[0, 0], [th, 0], [0, th]] : [[0, 0], [1, 0], [1, th - 1], [th - 1, 1], [0, 1]]; return pts; };
  PLOTS.sumGeoA = { ...unitAx, w: 240, h: 220, items: [sqEdge, { pts: sqLine(0.6), close: true, fill: 'c1' }, { text: 'area θ²/2', at: [0.18, 0.15], size: 11.5 }], caption: 'θ = 0.6 ≤ 1: a small triangle, F_Z = θ²/2' };
  PLOTS.sumGeoB = { ...unitAx, w: 240, h: 220, items: [sqEdge, { pts: sqLine(1.4), close: true, fill: 'c1' }, { text: 'missing corner (2−θ)²/2', at: [0.62, 1.07], size: 11, color: 'c2' }], caption: 'θ = 1.4 > 1: square minus a corner, F_Z = 1 − (2−θ)²/2' };
  PLOTS.trap = { w: 340, h: 200, x: [-0.4, 3.4], y: [0, 0.7], xlabel: 'θ', ylabel: 'f_Z(θ)', xticks: [0, 1, 2, 3], yticks: [0.25, 0.5],
    items: [{ pts: [[-0.4, 0], [0, 0], [1, 0.5], [2, 0.5], [3, 0], [3.4, 0]], color: 'c1' }, { area: { pts: [[0, 0], [1, 0.5], [2, 0.5], [3, 0]] }, color: 'c1', opacity: 0.18 }],
    caption: 'U(0,1) + U(0,2): a trapezoid (unequal widths ⇒ flat top)' };

  document.addEventListener('DOMContentLoaded', () => {
    const put = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
    put('fig-map3', conceptMap());
  });
})();
