/* Unit 4 figures: random processes, stationarity, ergodicity, PSD, Bernoulli / binomial / random walk / Poisson / Wiener */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="${NS}">${inner}</svg>`;
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--fg)"/></marker></defs>`;

  /* ---------- helpers ---------- */
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const C = (n, k) => fact(n) / (fact(k) * fact(n - k));
  const PI = Math.PI;
  // plotRng with small seeds starts with tiny values: scramble the seed and discard a warm-up
  const RNG = seed => { const r = plotRng((seed * 2654435761) >>> 0 || 1); for (let i = 0; i < 30; i++) r(); return r; };
  function normals(n, seed) {
    const r = RNG(seed), out = [];
    while (out.length < n) {
      const u1 = Math.max(r(), 1e-9), u2 = r();
      const R = Math.sqrt(-2 * Math.log(u1));
      out.push(R * Math.cos(2 * PI * u2), R * Math.sin(2 * PI * u2));
    }
    return out.slice(0, n);
  }
  // Gauss–Markov (Ornstein–Uhlenbeck) path with R(τ)=s2·e^{-a|τ|}
  function ouPath(s2, a, T, dt, seed) {
    const z = normals(Math.ceil(T / dt) + 2, seed), rho = Math.exp(-a * dt), pts = [];
    let x = Math.sqrt(s2) * z[0];
    for (let i = 0; i * dt <= T + 1e-9; i++) { pts.push([i * dt, x]); x = rho * x + Math.sqrt(s2 * (1 - rho * rho)) * z[i + 1]; }
    return pts;
  }
  // ±1 random walk as a continuous-looking polyline (for Wiener) : step h every δ
  function walkPts(n, seed, p = 0.5, scaleT = 1, scaleX = 1, stairs = false) {
    const r = RNG(seed), pts = [[0, 0]];
    let w = 0;
    for (let k = 1; k <= n; k++) {
      const s = r() < p ? 1 : -1;
      if (stairs) pts.push([k * scaleT, w * scaleX]);
      w += s; pts.push([k * scaleT, w * scaleX]);
    }
    return pts;
  }
  function bern(n, p, seed) { const r = RNG(seed); return Array.from({ length: n }, () => (r() < p ? 1 : 0)); }
  // Poisson arrival times on [0,T]
  function arrivals(lam, T, seed) {
    const r = RNG(seed), out = [];
    let t = 0;
    for (;;) { t += -Math.log(Math.max(r(), 1e-12)) / lam; if (t > T) break; out.push(t); }
    return out;
  }

  /* ---------- concept map ---------- */
  function conceptMap() {
    const B = [
      ['Random process X(t,ξ)\nfamily of RVs', 10, 10, 'def'], ['Exact description\nnth-order PDFs', 190, 10, 'def'], ['Average description\nm(t), R(t₁,t₂), K(t₁,t₂)', 370, 10, 'def'], ['Independent / uncorr. /\northogonal processes', 550, 10, 'def'],
      ['SSS\nall PDFs shift-invariant', 10, 105, 'thm'], ['WSS\nm const, R(τ) only', 190, 105, 'key'], ['ACF properties\neven, R(0) max, power', 370, 105, 'key'], ['Ergodicity\ntime avg = ensemble avg', 550, 105, 'thm'],
      ['Gaussian process\nm & K say it all', 10, 200, 'thm'], ['Power spectral density\nS(ω) = F{R(τ)}', 190, 200, 'key'], ['Bernoulli process\niid 0/1', 370, 200, 'def'], ['Sum processes\nindep. increments', 550, 200, 'def'],
      ['Binomial counting\nS[n] ~ B(n,p)', 370, 295, 'key'], ['Random walk\nW[n] = Σ ±1', 550, 295, 'key'], ['Poisson process\nN(t) ~ P(λt)', 190, 295, 'key'], ['Wiener process\nlimit of walk', 10, 295, 'key']
    ];
    const W = 710, H = 350, bw = 150, bh = 46;
    const c = i => [B[i][1] + bw / 2, B[i][2] + bh / 2];
    const E = [[0, 1], [1, 2], [2, 3], [1, 4], [2, 5], [4, 5], [5, 6], [5, 7], [4, 8], [5, 8], [6, 9], [0, 10], [10, 11], [11, 12], [11, 13], [12, 14], [13, 15], [8, 15]];
    let s = arrowDefs('m4a');
    E.forEach(([a, b]) => {
      let [x1, y1] = c(a), [x2, y2] = c(b);
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.min(Math.abs(dx) > 1 ? (bw / 2) / Math.abs(dx) : 9, Math.abs(dy) > 1 ? (bh / 2) / Math.abs(dy) : 9);
      x1 += dx * t; y1 += dy * t; x2 -= dx * t; y2 -= dy * t;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.2" marker-end="url(#m4a)" opacity=".7"/>`;
    });
    B.forEach(([t, x, y, k]) => {
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="var(--${k}-bg)" stroke="var(--fg)" stroke-width="1"/>`;
      const L = t.split('\n');
      L.forEach((ln, j) => { s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 5 + (j - (L.length - 1) / 2) * 16}" text-anchor="middle" font-size="12.5">${ln}</text>`; });
    });
    return svg(W, H, s);
  }

  /* ---------- the two views of X(t, ξ) ---------- */
  function twoViews() {
    const W = 640, H = 300;
    let s = arrowDefs('m4b');
    const rows = [[60, 0.3, 1.0], [150, 1.4, 0.7], [240, 2.6, 1.2]];
    const x0 = 90, x1 = 600, tc = 380;
    rows.forEach(([yc, ph, amp], i) => {
      let d = '';
      for (let k = 0; k <= 200; k++) {
        const t = k / 200, x = x0 + (x1 - x0) * t;
        const y = yc - 26 * amp * Math.sin(2 * PI * 2.2 * t + ph) * (0.75 + 0.25 * Math.cos(2 * PI * 0.9 * t + i));
        d += (k ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      }
      s += `<line x1="${x0}" y1="${yc}" x2="${x1}" y2="${yc}" stroke="var(--axis)" stroke-width=".8" opacity=".6"/>`;
      s += `<path d="${d}" fill="none" stroke="var(--g${i + 1})" stroke-width="2"/>`;
      s += `<text x="12" y="${yc + 5}" font-size="13">ξ${['₁', '₂', '₃'][i]} →</text>`;
      s += `<text x="${x1 + 4}" y="${yc - 30}" font-size="12" text-anchor="end" fill="var(--g${i + 1})">x(t, ξ${['₁', '₂', '₃'][i]})</text>`;
      const tt = (tc - x0) / (x1 - x0);
      const yv = yc - 26 * amp * Math.sin(2 * PI * 2.2 * tt + ph) * (0.75 + 0.25 * Math.cos(2 * PI * 0.9 * tt + i));
      s += `<circle cx="${tc}" cy="${yv}" r="4.5" fill="var(--g${i + 1})"/>`;
    });
    s += `<line x1="${tc}" y1="20" x2="${tc}" y2="285" stroke="var(--fg)" stroke-dasharray="5 4"/>`;
    s += `<text x="${tc + 6}" y="292" font-size="13">t = t₀ : the dots form the random variable X(t₀)</text>`;
    s += `<text x="${x0}" y="292" font-size="13" fill="var(--muted)">each row = one sample function</text>`;
    return svg(W, H + 10, s);
  }

  /* ================= §1 dice example ================= */
  const t0 = 0.15, s0 = Math.sin(2 * PI * t0);
  PLOTS.diceX = {
    w: 330, h: 230, x: [0, 1], y: [-1.3, 1.3], xlabel: 't', ylabel: 'x(t, ξ_k)', xticks: [0.5, 1], yticks: [-1, 1],
    items: [{ fn: t => Math.sin(2 * PI * t), color: 'c1' }, { fn: t => Math.sin(2 * PI * 2 * t), color: 'c2', width: 1.6 }, { fn: t => Math.sin(2 * PI * 6 * t), color: 'c3', width: 1.1 },
      { text: 'k=1', at: [0.25, 1.15], color: 'c1' }, { text: 'k=2', at: [0.62, 1.15], color: 'c2' }, { text: 'k=6', at: [0.92, -1.2], color: 'c3' }],
    caption: 'X(t,ξ_k) = sin(2πk f_0 t): the die picks the frequency (f_0 = 1)'
  };
  PLOTS.diceY = {
    w: 330, h: 230, x: [0, 1], y: [-6.6, 6.6], xlabel: 't', ylabel: 'y(t, ξ_k)', xticks: [{ v: t0, l: 't₀' }, 0.5, 1], yticks: [-6, 6],
    items: [...[1, 2, 3, 4, 5, 6].map(k => ({ fn: t => k * Math.sin(2 * PI * t), color: ['c1', 'c2', 'c3', 'c4', 'c5', 'c1'][k - 1], width: 1.5 })),
      { vline: t0, color: 'var(--fg)', dash: true }, ...[1, 2, 3, 4, 5, 6].map(k => ({ dot: [t0, k * s0], color: 'var(--fg)' }))],
    caption: 'Y(t,ξ_k) = k·sin(2πf_0t): the die picks the amplitude. At t₀ there are six possible values'
  };
  PLOTS.diceCdf = {
    w: 330, h: 230, x: [-0.5, 6], y: [0, 1.15], xlabel: 'α', ylabel: 'F_Y(α; t₀)', xticks: [{ v: s0, l: 's' }, { v: 2 * s0, l: '2s' }, { v: 3 * s0, l: '3s' }, { v: 6 * s0, l: '6s' }], yticks: [{ v: 1 / 6, l: '1/6' }, { v: 0.5, l: '1/2' }, 1],
    items: [{ stairs: [1, 2, 3, 4, 5, 6].map(k => [k * s0, k / 6]), color: 'c1' }],
    caption: 'CDF of the RV Y(t₀): six equal jumps of 1/6 at s, 2s, …, 6s, where s = sin(2πf_0t₀)'
  };

  /* ================= four classes ================= */
  PLOTS.clsCtcv = (() => ({
    w: 300, h: 190, x: [0, 10], y: [-3.2, 3.2], xlabel: 't', ylabel: 'x(t)', xticks: [], yticks: [],
    items: [{ pts: ouPath(1.5, 0.9, 10, 0.02, 11), color: 'c1', width: 1.6 }], caption: 'CT, continuous-valued (noise voltage)'
  }))();
  PLOTS.clsCtdv = (() => {
    const a = arrivals(0.7, 10, 5); let lvl = 1; const st = a.map(t => { lvl = -lvl; return [t, lvl]; });
    return { w: 300, h: 190, x: [0, 10], y: [-1.6, 1.6], xlabel: 't', ylabel: 'x(t)', xticks: [], yticks: [-1, 1], items: [{ stairs: st, start: 1, color: 'c2', width: 2 }], caption: 'CT, discrete-valued (±1 telegraph signal)' };
  })();
  PLOTS.clsDtcv = (() => {
    const z = normals(20, 7);
    return { w: 300, h: 190, x: [-0.5, 19.5], y: [-2.8, 2.8], xlabel: 'n', ylabel: 'x[n]', xticks: [0, 5, 10, 15], yticks: [], items: [{ stems: z.map((v, i) => [i, v]), color: 'c3', width: 1.5 }], caption: 'DT, continuous-valued (samples of noise)' };
  })();
  PLOTS.clsDtdv = (() => ({
    w: 300, h: 190, x: [-0.5, 19.5], y: [-0.2, 1.4], xlabel: 'n', ylabel: 'x[n]', xticks: [0, 5, 10, 15], yticks: [0, 1],
    items: [{ stems: bern(20, 0.5, 3).map((v, i) => [i, v]), color: 'c4', width: 1.5 }], caption: 'DT, discrete-valued (Bernoulli bits)'
  }))();

  /* ================= §2 line process ================= */
  PLOTS.lineProc = {
    w: 320, h: 250, x: [0, 1.15], y: [0, 1.15], xlabel: 't', ylabel: 'x(t, ξ) = a·t', xticks: [{ v: 0.6, l: 't₀' }, { v: 1, l: 'T' }], yticks: [{ v: 0.6, l: 't₀' }, { v: 1, l: 'T' }],
    items: [...[0.15, 0.35, 0.55, 0.8, 1].map((a, i) => ({ fn: t => a * t, from: 0, to: 1, color: ['c1', 'c2', 'c3', 'c4', 'c5'][i], width: 1.7 })),
      { vline: 0.6, from: 0, to: 0.6, color: 'var(--fg)' }, { pts: [[0.6, 0], [0.6, 0.6]], color: 'c2', width: 4, opacity: .5 }, { text: 'A = 1 (steepest)', at: [0.62, 0.8], anchor: 'end', size: 11.5 },
      { text: 'X(t₀) ∈ [0, t₀]', at: [0.64, 0.3], anchor: 'start', size: 12 }],
    caption: 'Line process X(t) = At, A ~ U[0,1]: every sample function is a straight line through the origin'
  };
  PLOTS.linePdf = {
    w: 300, h: 230, x: [-0.2, 1.1], y: [0, 2.2], xlabel: 'α', ylabel: 'f_X(α; t₀)', xticks: [{ v: 0.6, l: 't₀' }], yticks: [{ v: 1 / 0.6, l: '1/t₀' }],
    items: [{ pts: [[-0.2, 0], [0, 0], [0, 1 / 0.6], [0.6, 1 / 0.6], [0.6, 0], [1.1, 0]], color: 'c1' }, { area: { pts: [[0, 1 / 0.6], [0.6, 1 / 0.6]] }, color: 'c1' }],
    caption: 'X(t₀) = At₀ is uniform on [0, t₀]: height 1/t₀. The PDF changes with t₀'
  };

  /* ================= §4 random-phase sinusoid ================= */
  PLOTS.phaseEns = {
    w: 330, h: 230, x: [0, 2], y: [-1.4, 1.4], xlabel: 't', ylabel: 'x(t)', xticks: [1, 2], yticks: [-1, 1],
    items: [0.3, 1.6, 3.1, 4.7].map((th, i) => ({ fn: t => Math.cos(2 * PI * t + th), color: ['c1', 'c2', 'c3', 'c4'][i], width: 1.5 })),
    caption: 'cos(ω₀t + Θ), Θ ~ U[0,2π]: same shape, random starting point. No instant is special'
  };
  PLOTS.phaseAcf = {
    w: 330, h: 230, x: [-2, 2], y: [-0.7, 0.7], xlabel: 'τ', ylabel: 'R_X(τ)', xticks: [-1, 1], yticks: [{ v: -0.5, l: '−½' }, { v: 0.5, l: '½' }],
    items: [{ fn: t => 0.5 * Math.cos(2 * PI * t), color: 'c1' }],
    caption: 'R_X(τ) = ½cos(ω₀τ): even, largest at τ = 0, and periodic like the signal'
  };

  /* ================= §5 ACF shapes ================= */
  PLOTS.acfExp = { w: 230, h: 180, x: [-3, 3], y: [0, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-2, 2], yticks: [1],
    items: [{ fn: t => Math.exp(-Math.abs(t)), color: 'c1' }], caption: 'e^{−a|τ|}: memory fades' };
  PLOTS.acfTri = { w: 230, h: 180, x: [-3, 3], y: [0, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-1, 1], yticks: [1],
    items: [{ fn: t => Math.max(0, 1 - Math.abs(t)), color: 'c2' }], caption: 'triangle: zero beyond |τ| = T' };
  PLOTS.acfCos = { w: 230, h: 180, x: [-3, 3], y: [-1.2, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-2, 2], yticks: [-1, 1],
    items: [{ fn: t => Math.cos(PI * t), color: 'c3' }], caption: 'cos ω₀τ: periodic, never fades' };
  PLOTS.acfMean = {
    w: 360, h: 230, x: [-3, 3], y: [0, 32], xlabel: 'τ', ylabel: 'R_X(τ)', xticks: [-2, -1, 1, 2], yticks: [{ v: 25, l: '25 = m²' }, { v: 29, l: '29' }],
    items: [{ fn: t => 25 + 4 / (1 + 6 * t * t), color: 'c1' }, { hline: 25, color: 'c2', dash: true }, { text: 'variance = 29 − 25 = 4', at: [1.2, 28.5], anchor: 'start', size: 12 }],
    caption: 'R(0) = E[X²] = 29 (total power); the floor R(∞) = m² = 25 (DC power). The gap is the variance'
  };
  PLOTS.acfBad = {
    w: 300, h: 210, x: [-3, 3], y: [-0.4, 1.4], xlabel: 'τ', ylabel: 'g(τ)', xticks: [-1, 1], yticks: [1],
    items: [{ pts: [[-3, 0], [-1, 0], [-1, 1], [1, 1], [1, 0], [3, 0]], color: 'c2' }],
    caption: 'A rectangle is even and peaks at 0, yet is NOT a valid ACF: its Fourier transform 2sin ω/ω goes negative'
  };

  /* ================= §6 Gaussian process ================= */
  PLOTS.gaussPaths = (() => ({
    w: 520, h: 250, x: [0, 6], y: [-6.5, 6.5], xlabel: 't', ylabel: 'x(t)', xticks: [1, 2, 3, 4, 5], yticks: [{ v: -4, l: '−2σ' }, { v: 4, l: '2σ' }],
    items: [{ hline: 4, dash: true }, { hline: -4, dash: true },
      { pts: ouPath(4, 2, 6, 0.01, 21), color: 'c1', width: 1.4 }, { pts: ouPath(4, 2, 6, 0.01, 22), color: 'c2', width: 1.4 }, { pts: ouPath(4, 2, 6, 0.01, 23), color: 'c3', width: 1.4 }],
    caption: 'Three sample functions of a zero-mean Gaussian WSS process with R(τ) = 4e^{−2|τ|} (σ = 2). About 95% of the time each path stays inside ±2σ'
  }))();

  /* ================= §7 ergodicity ================= */
  PLOTS.ergConst = {
    w: 300, h: 220, x: [0, 10], y: [-1.5, 1.5], xlabel: 't', ylabel: 'x(t) = a', xticks: [], yticks: [-1, 1],
    items: [0.9, 0.35, -0.2, -0.75].map((a, i) => ({ hline: a, color: ['c1', 'c2', 'c3', 'c4'][i], dash: false, width: 2.2 })).concat([{ hline: 0, color: 'mu', dash: true }, { text: 'ensemble mean 0', at: [9.8, 0.12], anchor: 'end', color: 'mu', size: 11.5 }]),
    caption: 'X(t) = A (random constant): stationary but NOT ergodic. Watching one path forever only shows you a'
  };
  PLOTS.ergRun = {
    w: 300, h: 220, x: [0, 40], y: [-0.5, 1.05], xlabel: 'T', ylabel: 'time average', xticks: [10, 20, 30, 40], yticks: [0, 1],
    items: [{ fn: T => T < 0.05 ? Math.cos(0.4) : (Math.sin(T + 0.4) - Math.sin(0.4)) / T, from: 0, to: 40, n: 800, color: 'c1' }, { hline: 0, color: 'c2', dash: true }],
    caption: 'Running average (1/T)∫₀ᵀcos(t + θ)dt → 0 = ensemble mean, for every θ: ergodic in the mean'
  };

  /* ================= §8 PSD pairs ================= */
  PLOTS.psdExpR = { w: 250, h: 180, x: [-3, 3], y: [0, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-2, 2], yticks: [1], items: [{ fn: t => Math.exp(-Math.abs(t)), color: 'c1' }], caption: 'R(τ) = e^{−a|τ|} (a = 1)' };
  PLOTS.psdExpS = { w: 250, h: 180, x: [-5, 5], y: [0, 2.4], xlabel: 'ω', ylabel: 'S(ω)', xticks: [-4, 4], yticks: [{ v: 2, l: '2/a' }], items: [{ fn: w => 2 / (1 + w * w), color: 'c2' }], caption: 'S(ω) = 2a/(a² + ω²) (Lorentzian)' };
  PLOTS.psdTriR = { w: 250, h: 180, x: [-3, 3], y: [0, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-1, 1], yticks: [1], items: [{ fn: t => Math.max(0, 1 - Math.abs(t)), color: 'c1' }], caption: 'triangle, half-width T = 1' };
  PLOTS.psdTriS = { w: 250, h: 180, x: [-14, 14], y: [0, 1.2], xlabel: 'ω', ylabel: 'S(ω)', xticks: [{ v: -2 * PI, l: '−2π/T' }, { v: 2 * PI, l: '2π/T' }], yticks: [{ v: 1, l: 'T' }],
    items: [{ fn: w => Math.abs(w) < 1e-6 ? 1 : Math.pow(Math.sin(w / 2) / (w / 2), 2), n: 600, color: 'c2' }], caption: 'S(ω) = T·sinc²: never negative ✓' };
  PLOTS.psdCosR = { w: 250, h: 180, x: [-3, 3], y: [-1.2, 1.2], xlabel: 'τ', ylabel: 'R(τ)', xticks: [-2, 2], yticks: [-1, 1], items: [{ fn: t => Math.cos(PI * t), color: 'c1' }], caption: 'R(τ) = cos ω₀τ' };
  PLOTS.psdCosS = { w: 250, h: 180, x: [-6, 6], y: [0, 1.4], xlabel: 'ω', ylabel: 'S(ω)', xticks: [{ v: -PI, l: '−ω₀' }, { v: PI, l: 'ω₀' }], yticks: [],
    items: [{ impulses: [[-PI, 1, 'π'], [PI, 1, 'π']], color: 'c2' }], caption: 'S(ω) = π[δ(ω−ω₀) + δ(ω+ω₀)]' };
  PLOTS.psdWhiteR = { w: 250, h: 180, x: [-3, 3], y: [0, 1.4], xlabel: 'τ', ylabel: 'R(τ)', xticks: [], yticks: [], items: [{ impulses: [[0, 1, 'N₀/2']], color: 'c1' }], caption: 'white noise: R(τ) = (N₀/2)δ(τ)' };
  PLOTS.psdWhiteS = { w: 250, h: 180, x: [-5, 5], y: [0, 1.4], xlabel: 'ω', ylabel: 'S(ω)', xticks: [], yticks: [{ v: 0.8, l: 'N₀/2' }], items: [{ hline: 0.8, color: 'c2', dash: false, width: 2.2 }], caption: 'flat at N₀/2 for all ω' };

  /* ================= §9 discrete-time processes ================= */
  const bits = bern(24, 0.5, 9);
  PLOTS.bernPath = { w: 330, h: 190, x: [-0.5, 24], y: [-0.2, 1.4], xlabel: 'n', ylabel: 'x[n]', xticks: [0, 5, 10, 15, 20], yticks: [0, 1], items: [{ stems: bits.map((v, i) => [i + 1, v]), color: 'c1', width: 1.5 }], caption: 'Bernoulli process X[n] (p = ½): iid 0/1 values' };
  PLOTS.updownPath = { w: 330, h: 190, x: [-0.5, 24], y: [-1.4, 1.4], xlabel: 'n', ylabel: 'y[n]', xticks: [0, 5, 10, 15, 20], yticks: [-1, 1], items: [{ stems: bits.map((v, i) => [i + 1, 2 * v - 1]), color: 'c2', width: 1.5 }], caption: 'Y[n] = 2X[n] − 1: the same bits mapped to ±1' };
  PLOTS.binCount = (() => {
    let s = 0; const st = []; bits.forEach((v, i) => { if (v) { s++; st.push([i + 1, s]); } });
    return { w: 330, h: 210, x: [0, 24], y: [0, 15], xlabel: 'n', ylabel: 's[n]', xticks: [5, 10, 15, 20], yticks: [5, 10],
      items: [{ fn: n => n / 2, color: 'mu', dash: true, width: 1.2 }, { stairs: st, color: 'c3', width: 2 }, { text: 'mean np', at: [22, 12.6], color: 'mu', size: 11.5 }],
      caption: 'Binomial counting process S[n] = number of 1s so far: climbs by 0 or 1 each step' };
  })();
  PLOTS.walkPaths = (() => ({
    w: 520, h: 260, x: [0, 60], y: [-16, 16], xlabel: 'n', ylabel: 'w[n]', xticks: [10, 20, 30, 40, 50, 60], yticks: [-10, 10],
    items: [{ fn: n => 2 * Math.sqrt(n), color: 'mu', dash: true, width: 1.2 }, { fn: n => -2 * Math.sqrt(n), color: 'mu', dash: true, width: 1.2 },
      { pts: walkPts(60, 31), color: 'c1', width: 1.5 }, { pts: walkPts(60, 32), color: 'c2', width: 1.5 }, { pts: walkPts(60, 47), color: 'c3', width: 1.5 },
      { text: '±2√n', at: [57, 12.5], color: 'mu', size: 12 }],
    caption: 'Three symmetric random walks (p = ½). Mean stays 0, but the spread grows like √n: the process is not stationary'
  }))();
  PLOTS.walkPmf = (() => {
    const n = 6, st = [];
    for (let k = 0; k <= n; k++) st.push([2 * k - n, C(n, k) / 64, C(n, k) + '/64']);
    return { w: 340, h: 220, x: [-7, 7], y: [0, 0.4], xlabel: 'j', ylabel: 'P[W_6 = j]', xticks: [-6, -4, -2, 0, 2, 4, 6], yticks: [],
      items: [{ stems: st, color: 'c1' }], caption: 'PMF of W_6 (p = ½): only even values are possible after an even number of steps' };
  })();

  /* ================= §12 Poisson ================= */
  const arr = arrivals(0.8, 10, 26);
  PLOTS.poissonPath = {
    w: 520, h: 240, x: [0, 10], y: [0, arr.length + 1.5], xlabel: 't', ylabel: 'N(t)', xticks: arr.slice(0, 4).map((t, i) => ({ v: t, l: 'T' + '₁₂₃₄'[i] })), yticks: [1, 2, 3, 4, 5, 6, 7, 8].filter(v => v <= arr.length),
    items: [{ stairs: arr.map((t, i) => [t, i + 1]), color: 'c1', width: 2 }, { fn: t => 0.8 * t, color: 'mu', dash: true, width: 1.2 }, { text: 'E[N(t)] = λt', at: [9.6, 0.8 * 9.6 + 0.9], anchor: 'end', color: 'mu', size: 12 },
      { arrow: [[0, 0.45], [arr[0], 0.45]], color: 'c2' }, { text: 'τ₁', at: [arr[0] / 2, 0.75], color: 'c2', size: 12 }, { arrow: [[arr[0], 1.45], [arr[1], 1.45]], color: 'c2' }, { text: 'τ₂', at: [(arr[0] + arr[1]) / 2, 1.75], color: 'c2', size: 12 }],
    caption: 'One sample function of a Poisson process (λ = 0.8): a staircase that jumps by 1 at each arrival time T_k. The gaps τ_k are iid Exp(λ)'
  };
  const erl = n => t => t < 0 ? 0 : Math.pow(t, n - 1) * Math.exp(-t) / fact(n - 1);
  PLOTS.erlangPdfs = {
    w: 360, h: 230, x: [0, 10], y: [0, 1.05], xlabel: 'α', ylabel: 'f_{T_n}(α)', xticks: [2, 4, 6, 8], yticks: [1],
    items: [{ fn: erl(1), color: 'c1' }, { fn: erl(2), color: 'c2' }, { fn: erl(3), color: 'c3' }, { fn: erl(5), color: 'c4' },
      { text: 'n=1 (Exp)', at: [0.9, 0.85], anchor: 'start', color: 'c1', size: 12 }, { text: 'n=2', at: [1.6, 0.42], color: 'c2', size: 12 }, { text: 'n=3', at: [3.2, 0.3], color: 'c3', size: 12 }, { text: 'n=5', at: [5.6, 0.22], color: 'c4', size: 12 }],
    caption: 'Erlang PDFs of the n-th arrival time T_n (λ = 1). Mean n/λ: later arrivals are later and more spread out'
  };
  PLOTS.poisPmf6 = (() => {
    const st = []; for (let k = 0; k <= 14; k++) st.push([k, Math.exp(-6) * Math.pow(6, k) / fact(k)]);
    return { w: 360, h: 220, x: [-0.7, 14.5], y: [0, 0.2], xlabel: 'k', ylabel: 'P[N(60) = k]', xticks: [0, 2, 4, 6, 8, 10, 12, 14], yticks: [0.1],
      items: [{ stems: st.slice(0, 3), color: 'c2' }, { stems: st.slice(3), color: 'c1' }, { text: 'k ≤ 2: total 0.062', at: [1, 0.12], color: 'c2', size: 12 }],
      caption: 'N(60) ~ Poisson(6). "Nobody admitted in the first hour" = the red stems (fewer than 3 arrivals)' };
  })();
  PLOTS.condUnif = {
    w: 300, h: 210, x: [-0.3, 1.4], y: [0, 1.25], xlabel: 'x', ylabel: 'P[T_1 ≤ x | N(t)=1]', xticks: [{ v: 1, l: 't' }], yticks: [1],
    items: [{ pts: [[-0.3, 0], [0, 0], [1, 1], [1.4, 1]], color: 'c1' }, { vline: 1, from: 0, to: 1 }],
    caption: 'Given exactly one arrival in [0, t], its time is uniform on [0, t]: the CDF is x/t'
  };

  /* ================= §13 Wiener ================= */
  PLOTS.walkToWiener = (() => ({
    w: 520, h: 240, x: [0, 1], y: [-1.6, 1.6], xlabel: 't', ylabel: 'w_δ(t)', xticks: [0.25, 0.5, 0.75, 1], yticks: [-1, 1],
    items: [{ pts: walkPts(10, 5, 0.5, 0.1, Math.sqrt(0.1), true), color: 'c2', width: 1.8 }, { pts: walkPts(400, 5, 0.5, 1 / 400, Math.sqrt(1 / 400)), color: 'c1', width: 1.1 },
      { text: 'δ = 0.1, h = √δ', at: [0.02, 1.4], anchor: 'start', color: 'c2', size: 12 }, { text: 'δ = 1/400, h = √δ', at: [0.02, 1.15], anchor: 'start', color: 'c1', size: 12 }],
    caption: 'Shrinking the walk: steps of size h every δ seconds with h² = αδ (α = 1 here). As δ → 0 the staircase becomes a continuous but very rough curve: the Wiener process'
  }))();
  PLOTS.wienerPaths = (() => ({
    w: 520, h: 250, x: [0, 1], y: [-2.4, 2.4], xlabel: 't', ylabel: 'w(t)', xticks: [0.25, 0.5, 0.75, 1], yticks: [-2, -1, 1, 2],
    items: [{ fn: t => 2 * Math.sqrt(t), color: 'mu', dash: true, width: 1.2 }, { fn: t => -2 * Math.sqrt(t), color: 'mu', dash: true, width: 1.2 },
      ...[61, 62, 63].map((sd, i) => ({ pts: walkPts(1000, sd, 0.5, 1 / 1000, Math.sqrt(1 / 1000)), color: ['c1', 'c2', 'c3'][i], width: 1 })),
      { text: '±2√(αt)', at: [0.95, 2.15], anchor: 'end', color: 'mu', size: 12 }],
    caption: 'Three Wiener sample paths (α = 1). Each W(t) ~ N(0, αt): the envelope grows like √t'
  }))();

  /* ================= PYQ figures ================= */
  PLOTS.pyqAeBt = {
    w: 360, h: 230, x: [-1.3, 1.3], y: [0, 1.1], xlabel: 'x', ylabel: 'f_X(x; t=1)', xticks: [{ v: -1, l: '−1' }, { v: -Math.exp(-1), l: '−e^{−t}' }, { v: Math.exp(-1), l: 'e^{−t}' }, { v: 1, l: '1' }], yticks: [{ v: (Math.E - 1) / 2, l: '(e^{t}−1)/2t' }],
    items: [{ fn: x => { const a = Math.abs(x); if (a > 1) return 0; if (a <= Math.exp(-1)) return (Math.E - 1) / 2; return (1 / a - 1) / 2; }, n: 800, color: 'c1' },
      { area: { fn: x => { const a = Math.abs(x); if (a > 1) return 0; if (a <= Math.exp(-1)) return (Math.E - 1) / 2; return (1 / a - 1) / 2; }, from: -1, to: 1, n: 400 }, color: 'c1', opacity: 0.18 }],
    caption: 'First-order PDF of X(t) = Ae^{−Bt} at t = 1: flat in the middle, then (1/|x| − 1)/2t out to ±1'
  };
  PLOTS.es22c = (() => {
    const j = 6, r = 0.6, st = [];
    for (let k = 0; k <= j; k++) st.push([k, C(j, k) * Math.pow(r, k) * Math.pow(1 - r, j - k)]);
    return { w: 340, h: 210, x: [-0.6, 6.6], y: [0, 0.38], xlabel: 'k', ylabel: 'P[N(t−d)=k | N(t)=6]', xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0.1, 0.2, 0.3],
      items: [{ stems: st, color: 'c1' }], caption: 'Example: j = 6 arrivals by time t, (t−d)/t = 0.6 → Binomial(6, 0.6)' };
  })();

  document.addEventListener('DOMContentLoaded', () => {
    const put = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
    put('fig-map4', conceptMap());
    put('fig-views', twoViews());
  });
})();
