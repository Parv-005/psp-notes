/* Unit 5 figures: Markov chains (DT & CT), birth–death processes, M/M/1 and M/M/1/N queues */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="${NS}">${inner}</svg>`;
  let mk = 0;
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--fg)"/></marker></defs>`;
  const RNG = seed => { const r = plotRng((seed * 2654435761) >>> 0 || 1); for (let i = 0; i < 30; i++) r(); return r; };
  const lbl = (x, y, t, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central" font-size="${o.size || 13.5}" ${o.italic ? 'font-style="italic"' : ''} fill="${o.color || 'var(--fg)'}" stroke="var(--bg)" stroke-width="4" paint-order="stroke" ${o.bold ? 'font-weight="600"' : ''}>${t}</text>`;

  /* ---------- generic state-transition diagram ----------
     nodes: {id: [x, y, label, fill]}
     edges: [a, b, label, bend(px, + = bulge to the left of a→b), labelOffset]
     loops: [node, label, angleDeg (0 = right, 90 = up)]                        */
  function chain(o) {
    const r = o.r || 19, id = 'm5_' + (mk++);
    let s = arrowDefs(id);
    const N = o.nodes;
    (o.edges || []).forEach(([a, b, t, bend = 0, lo = 12, dash]) => {
      const [x1, y1] = N[a], [x2, y2] = N[b];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const nx = dy / L, ny = -dx / L;              // left normal (screen coords, y down)
      const cx = mx + nx * bend * 2, cy = my + ny * bend * 2;
      const u1 = Math.hypot(cx - x1, cy - y1), u2 = Math.hypot(cx - x2, cy - y2);
      const sx = x1 + (cx - x1) / u1 * r, sy = y1 + (cy - y1) / u1 * r;
      const ex = x2 + (cx - x2) / u2 * (r + 1), ey = y2 + (cy - y2) / u2 * (r + 1);
      s += `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="var(--fg)" stroke-width="1.4" ${dash ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#${id})"/>`;
      if (t !== undefined && t !== '') {
        const px = 0.25 * x1 + 0.5 * cx + 0.25 * x2, py = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        const sg = bend >= 0 ? 1 : -1;
        s += lbl(px + nx * lo * sg, py + ny * lo * sg, t, { color: 'var(--g1)' });
      }
    });
    (o.loops || []).forEach(([n, t, ang = 90]) => {
      const [x, y] = N[n], A = ang * Math.PI / 180;
      const P = (a, d) => [x + Math.cos(a) * d, y - Math.sin(a) * d];
      const [sx, sy] = P(A + 0.5, r), [ex, ey] = P(A - 0.5, r + 1);
      const [c1x, c1y] = P(A + 0.95, r + 52), [c2x, c2y] = P(A - 0.95, r + 52);
      s += `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="var(--fg)" stroke-width="1.4" marker-end="url(#${id})"/>`;
      const [lx, ly] = P(A, r + 37);
      s += lbl(lx, ly, t, { color: 'var(--g2)' });
    });
    Object.values(N).forEach(([x, y, t, f]) => {
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || 'var(--bg2)'}" stroke="var(--fg)" stroke-width="1.5"/>`;
      s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="14.5" font-weight="600" fill="var(--fg)">${t}</text>`;
    });
    (o.extra || []).forEach(e => { s += e; });
    return svg(o.w, o.h, s);
  }
  const T = (x, y, t, o) => lbl(x, y, t, o);

  /* ---------- concept map ---------- */
  function conceptMap() {
    const B = [
      ['Markov property\nfuture ⟂ past | present', 10, 10, 'def'], ['Joint PMF = initial ×\nproduct of transitions', 190, 10, 'key'], ['Transition matrix P\n& state diagram', 370, 10, 'def'], ['n-step: Chapman–\nKolmogorov, P(n)=Pⁿ', 550, 10, 'key'],
      ['State PMF\np(n) = p(0)Pⁿ', 550, 105, 'key'], ['Classification\nclasses, recurrent, period', 370, 105, 'thm'], ['Stationary π: πP = π\nlimit & ergodicity', 190, 105, 'key'], ['Long-run fraction\nof time = πⱼ', 10, 105, 'thm'],
      ['Continuous-time MC\nexp. holding, rates Q', 10, 200, 'def'], ['Steady state πQ = 0\nflow in = flow out', 190, 200, 'key'], ['Birth–death process\nλₙ up, μₙ down', 370, 200, 'def'], ['Poisson process\n= pure birth', 550, 200, 'def'],
      ['Queues A/B/s/K\nL, Lq, W, Wq, Little', 550, 295, 'def'], ['M/M/1\npₙ = (1−ρ)ρⁿ', 370, 295, 'key'], ['M/M/1/N\nfinite room, blocking', 190, 295, 'key'], ['Numericals:\nshops, banks, servers', 10, 295, 'thm']
    ];
    const W = 710, H = 350, bw = 150, bh = 46;
    const c = i => [B[i][1] + bw / 2, B[i][2] + bh / 2];
    const E = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [4, 6], [6, 7], [0, 8], [8, 9], [6, 9], [8, 10], [10, 11], [9, 10], [10, 13], [12, 13], [13, 14], [14, 15], [13, 15]];
    let s = arrowDefs('m5map');
    E.forEach(([a, b]) => {
      let [x1, y1] = c(a), [x2, y2] = c(b);
      const dx = x2 - x1, dy = y2 - y1;
      const t = Math.min(Math.abs(dx) > 1 ? (bw / 2) / Math.abs(dx) : 9, Math.abs(dy) > 1 ? (bh / 2) / Math.abs(dy) : 9);
      x1 += dx * t; y1 += dy * t; x2 -= dx * t; y2 -= dy * t;
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.2" marker-end="url(#m5map)" opacity=".7"/>`;
    });
    B.forEach(([t, x, y, k]) => {
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="var(--${k}-bg)" stroke="var(--fg)" stroke-width="1"/>`;
      const L = t.split('\n');
      L.forEach((ln, j) => { s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 5 + (j - (L.length - 1) / 2) * 16}" text-anchor="middle" font-size="12.5" fill="var(--fg)">${ln}</text>`; });
    });
    return svg(W, H, s);
  }

  /* ---------- queue picture ---------- */
  function queuePic(cap) {
    const id = 'm5q' + (mk++);
    let s = arrowDefs(id);
    s += `<line x1="20" y1="70" x2="120" y2="70" stroke="var(--fg)" stroke-width="1.6" marker-end="url(#${id})"/>`;
    s += T(70, 50, 'arrivals', { size: 13 }) + T(70, 30, 'Poisson, rate λ', { size: 12.5, color: 'var(--g1)' });
    // queue buffer
    s += `<path d="M130,48 H330 V92 H130" fill="none" stroke="var(--fg)" stroke-width="1.6"/>`;
    for (let i = 0; i < 4; i++) s += `<circle cx="${310 - i * 32}" cy="70" r="11" fill="var(--g1)" fill-opacity=".55" stroke="var(--fg)"/>`;
    for (let i = 4; i < 6; i++) s += `<circle cx="${310 - i * 32}" cy="70" r="11" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>`;
    s += T(230, 30, cap ? 'waiting room: at most N − 1 wait' : 'waiting line, unlimited', { size: 12.5 });
    s += T(230, 112, 'queue: Lq, Wq', { size: 12, color: 'var(--muted)' });
    s += `<line x1="330" y1="70" x2="372" y2="70" stroke="var(--fg)" stroke-width="1.6" marker-end="url(#${id})"/>`;
    s += `<circle cx="405" cy="70" r="30" fill="var(--key-bg)" stroke="var(--fg)" stroke-width="1.6"/><circle cx="405" cy="70" r="11" fill="var(--g2)" fill-opacity=".7" stroke="var(--fg)"/>`;
    s += T(405, 26, 'server', { size: 13 }) + T(405, 116, 'Exp(μ) service', { size: 12.5, color: 'var(--g2)' });
    s += `<line x1="437" y1="70" x2="540" y2="70" stroke="var(--fg)" stroke-width="1.6" marker-end="url(#${id})"/>`;
    s += T(490, 50, 'departures', { size: 13 });
    s += `<rect x="124" y="8" width="326" height="140" rx="10" fill="none" stroke="var(--g3)" stroke-dasharray="6 4"/>`;
    s += T(287, 138, 'the "system": L = mean number inside, W = mean time inside', { size: 12, color: 'var(--g3)' });
    if (cap) s += `<path d="M60,72 Q66,100 46,118" fill="none" stroke="var(--g2)" stroke-width="1.4" marker-end="url(#${id})"/>` + T(56, 134, 'blocked if full', { size: 12, color: 'var(--g2)', anchor: 'middle' });
    return svg(560, 155, s);
  }

  /* ---------- birth–death diagrams ---------- */
  function bdChain(kind) {
    const W = 680, H = 150, y = 75, xs = [50, 150, 250, 380, 480, 610];
    let nodes, edges = [], extra = [];
    if (kind === 'general') {
      nodes = { a: [xs[0], y, '0'], b: [xs[1], y, '1'], c: [xs[2], y, '2'], d: [xs[3], y, 'n'], e: [xs[4], y, 'n+1'] };
      const up = ['λ₀', 'λ₁', '', 'λₙ'], dn = ['μ₁', 'μ₂', '', 'μₙ₊₁'];
      [['a', 'b'], ['b', 'c'], ['d', 'e']].forEach(([p, q], i) => { const k = i === 2 ? 3 : i; edges.push([p, q, up[k], 14], [q, p, dn[k], 14]); });
      extra.push(T(315, y, '⋯', { size: 22 }), T(560, y, '⋯', { size: 22 }));
      return chain({ w: 600, h: H, nodes, edges, extra });
    }
    if (kind === 'mm1') {
      nodes = { a: [xs[0], y, '0'], b: [xs[1], y, '1'], c: [xs[2], y, '2'], d: [xs[3], y, 'n'], e: [xs[4], y, 'n+1'] };
      [['a', 'b'], ['b', 'c'], ['d', 'e']].forEach(([p, q]) => edges.push([p, q, 'λ', 14], [q, p, 'μ', 14]));
      extra.push(T(315, y, '⋯', { size: 22 }), T(560, y, '⋯', { size: 22 }));
      return chain({ w: 600, h: H, nodes, edges, extra });
    }
    if (kind === 'mm1n') {
      nodes = { a: [xs[0], y, '0'], b: [xs[1], y, '1'], c: [xs[2], y, '2'], d: [xs[3], y, 'N−1'], e: [xs[4], y, 'N', 'var(--warn-bg)'] };
      [['a', 'b'], ['b', 'c'], ['d', 'e']].forEach(([p, q]) => edges.push([p, q, 'λ', 14], [q, p, 'μ', 14]));
      extra.push(T(315, y, '⋯', { size: 22 }), T(560, y - 10, 'full: arrivals', { size: 12, color: 'var(--g2)', anchor: 'middle' }), T(560, y + 8, 'turned away', { size: 12, color: 'var(--g2)' }));
      return chain({ w: 610, h: H, nodes, edges, extra });
    }
    if (kind === 'cut') {
      nodes = { a: [xs[0], y, 'n−1'], b: [xs[1] + 20, y, 'n'], c: [xs[2] + 60, y, 'n+1'], d: [xs[3] + 60, y, 'n+2'] };
      edges.push(['a', 'b', 'λₙ₋₁', 14], ['b', 'a', 'μₙ', 14], ['b', 'c', 'λₙ pₙ', 16], ['c', 'b', 'μₙ₊₁ pₙ₊₁', 16], ['c', 'd', 'λₙ₊₁', 14], ['d', 'c', 'μₙ₊₂', 14]);
      extra.push(`<line x1="${(xs[1] + 20 + xs[2] + 60) / 2}" y1="8" x2="${(xs[1] + 20 + xs[2] + 60) / 2}" y2="142" stroke="var(--g2)" stroke-width="2" stroke-dasharray="6 4"/>`,
        T((xs[1] + 20 + xs[2] + 60) / 2 + 6, 14, 'cut', { anchor: 'start', color: 'var(--g2)', size: 13 }));
      return chain({ w: 500, h: H, nodes, edges, extra });
    }
    if (kind === 'pois') {
      nodes = { a: [xs[0], y, '0'], b: [xs[1], y, '1'], c: [xs[2], y, '2'], d: [xs[3] - 20, y, '3'] };
      edges.push(['a', 'b', 'λ', 0, 14], ['b', 'c', 'λ', 0, 14], ['c', 'd', 'λ', 0, 14]);
      extra.push(T(xs[3] + 30, y, '⋯', { size: 22 }));
      return chain({ w: 440, h: 110, nodes: Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, [v[0], 55, v[2]]])), edges });
    }
  }

  function ckFan() {
    const nodes = { i: [60, 120, 'i'], k1: [250, 35, 'k=0'], k2: [250, 95, 'k=1'], k3: [250, 205, 'k=m'], j: [440, 120, 'j'] };
    const edges = [['i', 'k1', 'pᵢ₀', 0, 14], ['i', 'k2', 'pᵢ₁', 0, 12], ['i', 'k3', 'pᵢₘ', 0, -14], ['k1', 'j', 'p₀ⱼ', 0, 14], ['k2', 'j', 'p₁ⱼ', 0, 12], ['k3', 'j', 'pₘⱼ', 0, -14]];
    const extra = [T(250, 150, '⋮', { size: 20 }), T(60, 160, 'time 0', { size: 12, color: 'var(--muted)' }), T(250, 245, 'time 1 (any state)', { size: 12, color: 'var(--muted)' }), T(440, 160, 'time 2', { size: 12, color: 'var(--muted)' })];
    return chain({ w: 500, h: 255, r: 20, nodes, edges, extra });
  }

  /* ---------- plots ---------- */
  // two-state chain (a = P(0→1), b = P(1→0)): P(X_n = 1) from both starts
  PLOTS.twoConv = (() => {
    const a = 0.1, b = 0.2, pi1 = a / (a + b), from0 = [], from1 = [];
    for (let n = 0; n <= 20; n++) { const r = Math.pow(1 - a - b, n); from0.push([n, pi1 - pi1 * r]); from1.push([n, pi1 + (1 - pi1) * r]); }
    return { w: 520, h: 240, x: [0, 20.5], y: [0, 1.05], xlabel: 'n', ylabel: 'P(X_{n}=1)', xticks: [0, 5, 10, 15, 20], yticks: [{ v: 1 / 3, l: '1/3' }, 0.5, 1],
      items: [{ hline: 1 / 3, dash: true }, { pts: from0, color: 'c1', width: 1.3 }, { scatter: from0, r: 3, color: 'c1', opacity: 1 }, { pts: from1, color: 'c2', width: 1.3 }, { scatter: from1, r: 3, color: 'c2', opacity: 1 },
        { text: 'start in 1', at: [3.2, 0.78], color: 'c2', anchor: 'start' }, { text: 'start in 0', at: [3.2, 0.12], color: 'c1', anchor: 'start' }, { text: 'π₁ = a/(a+b) = 1/3', at: [19.8, 0.4], anchor: 'end', color: 'mu' }],
      caption: 'Two-state chain with a = 0.1, b = 0.2. Whatever the start, P(X_{n}=1) → 1/3; the gap shrinks by the factor (1−a−b) = 0.7 every step' };
  })();
  // simulated path and running fraction of time in state 1
  const sim2 = (() => {
    const a = 0.1, b = 0.3, r = RNG(7), n = 400, xs = [0];
    for (let k = 1; k <= n; k++) { const x = xs[k - 1]; xs.push(x === 0 ? (r() < a ? 1 : 0) : (r() < b ? 0 : 1)); }
    return xs;
  })();
  PLOTS.twoPath = (() => {
    const st = []; for (let k = 1; k <= 80; k++) if (sim2[k] !== sim2[k - 1]) st.push([k, sim2[k]]);
    return { w: 360, h: 190, x: [0, 80], y: [-0.25, 1.35], xlabel: 'n', ylabel: 'x_{n}', xticks: [0, 20, 40, 60, 80], yticks: [0, 1],
      items: [{ stairs: st, start: 0, color: 'c1', width: 1.6, nodots: true }], caption: 'One sample path (α = 0.1, β = 0.3): long runs in each state' };
  })();
  PLOTS.twoFrac = (() => {
    const pts = []; let s = 0; for (let k = 1; k < sim2.length; k++) { s += sim2[k]; pts.push([k, s / k]); }
    return { w: 360, h: 190, x: [0, 400], y: [0, 0.6], xlabel: 'n', ylabel: 'fraction of time in 1', xticks: [0, 100, 200, 300, 400], yticks: [0.25, 0.5],
      items: [{ hline: 0.25, dash: true }, { pts, color: 'c2', width: 1.6 }, { text: 'π₁ = 0.25', at: [395, 0.3], anchor: 'end', color: 'mu' }],
      caption: 'Running time-average of the same path → π₁ = α/(α+β) = 0.25 (ergodicity)' };
  })();
  // gambler chain (PYQ ES 2026) : P(win game n)
  PLOTS.gambler = (() => {
    const pts = []; let w = 0.5; for (let n = 1; n <= 10; n++) { pts.push([n, w]); w = 0.6 * w + 0.3 * (1 - w); }
    return { w: 400, h: 210, x: [0.5, 10.5], y: [0.38, 0.52], xlabel: 'game n', ylabel: 'P(win game n)', xticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yticks: [{ v: 3 / 7, l: '3/7' }, 0.45, 0.5],
      items: [{ hline: 3 / 7, dash: true }, { stems: pts.map(p => [p[0], p[1]]), color: 'c1', base: 0.38 }],
      caption: 'P(win) = 0.5, 0.45, 0.435, 0.4305, … → 3/7 ≈ 0.4286 (gap × 0.3 each game)' };
  })();
  // CTMC two-state transient
  PLOTS.ctmc2 = (() => {
    const al = 1, be = 0.5, p1 = be / (al + be);
    return { w: 480, h: 220, x: [0, 4], y: [0, 1.05], xlabel: 't', ylabel: 'P(X(t)=0)', xticks: [1, 2, 3, 4], yticks: [{ v: p1, l: '1/3' }, 1],
      items: [{ hline: p1, dash: true }, { fn: t => p1 + (1 - p1) * Math.exp(-(al + be) * t), color: 'c2' }, { fn: t => p1 - p1 * Math.exp(-(al + be) * t), color: 'c1' },
        { text: 'start in 0', at: [0.35, 0.86], color: 'c2', anchor: 'start' }, { text: 'start in 1', at: [0.35, 0.08], color: 'c1', anchor: 'start' }, { text: 'β/(α+β)', at: [3.95, 0.4], anchor: 'end', color: 'mu' }],
      caption: 'Two-state CTMC, α = 1 (0→1), β = 0.5 (1→0): P(X(t)=0) relaxes exponentially, with rate α+β, to β/(α+β)' };
  })();
  // M/M/1 stationary PMF
  const geo = rho => Array.from({ length: 13 }, (_, n) => [n, (1 - rho) * Math.pow(rho, n)]);
  PLOTS.mm1pmf5 = { w: 330, h: 200, x: [-0.6, 12.6], y: [0, 0.55], xlabel: 'n', ylabel: 'p_{n}', xticks: [0, 2, 4, 6, 8, 10, 12], yticks: [0.25, 0.5], items: [{ stems: geo(0.5), color: 'c1' }], caption: 'ρ = 0.5: L = 1, system often empty (p₀ = 0.5)' };
  PLOTS.mm1pmf8 = { w: 330, h: 200, x: [-0.6, 12.6], y: [0, 0.55], xlabel: 'n', ylabel: 'p_{n}', xticks: [0, 2, 4, 6, 8, 10, 12], yticks: [0.25, 0.5], items: [{ stems: geo(0.8), color: 'c2' }], caption: 'ρ = 0.8: L = 4, a long flat tail' };
  PLOTS.mm1L = {
    w: 460, h: 250, x: [0, 1], y: [0, 10], xlabel: 'ρ = λ/μ', ylabel: 'mean number', xticks: [0.2, 0.4, 0.6, 0.8, 1], yticks: [2, 4, 6, 8, 10],
    items: [{ vline: 1, dash: true }, { fn: r => r / (1 - r), from: 0, to: 0.91, color: 'c1' }, { fn: r => r * r / (1 - r), from: 0, to: 0.955, color: 'c2' },
      { text: 'L = ρ/(1−ρ)', at: [0.66, 4.6], color: 'c1', anchor: 'end' }, { text: 'Lq = ρ²/(1−ρ)', at: [0.86, 2.4], color: 'c2', anchor: 'start' }],
    caption: 'M/M/1: queues explode as ρ → 1. Going from ρ = 0.8 to 0.9 doubles L (4 → 9)'
  };
  // simulated M/M/1 path
  PLOTS.mm1Path = (() => {
    const lam = 0.8, mu = 1, r = RNG(11), st = []; let t = 0, n = 0, area = 0;
    const E = rate => -Math.log(Math.max(r(), 1e-12)) / rate;
    while (t < 60) {
      const rate = lam + (n > 0 ? mu : 0), dt = E(rate);
      area += n * Math.min(dt, 60 - t); t += dt; if (t > 60) break;
      n += (r() < lam / rate) ? 1 : -1; st.push([t, n]);
    }
    return { w: 560, h: 220, x: [0, 60], y: [0, 9], xlabel: 't', ylabel: 'N(t)', xticks: [10, 20, 30, 40, 50, 60], yticks: [2, 4, 6, 8],
      items: [{ stairs: st, start: 0, color: 'c1', width: 1.5, nodots: true }, { hline: 4, dash: true }, { text: 'L = 4', at: [59, 4.5], anchor: 'end', color: 'mu' }],
      caption: 'A simulated M/M/1 queue (λ = 0.8, μ = 1): up-steps are arrivals, down-steps are departures. It is a birth–death CTMC' };
  })();
  // M/M/1/N PMFs, N = 5
  const finite = (rho, N) => { const w = Array.from({ length: N + 1 }, (_, n) => Math.pow(rho, n)), s = w.reduce((a, b) => a + b, 0); return w.map((v, n) => [n, v / s]); };
  PLOTS.mm1n05 = { w: 220, h: 190, x: [-0.6, 5.6], y: [0, 0.6], xlabel: 'n', ylabel: 'p_{n}', xticks: [0, 1, 2, 3, 4, 5], yticks: [0.2, 0.4], items: [{ stems: finite(0.5, 5), color: 'c1' }], caption: 'ρ = 0.5: decreasing' };
  PLOTS.mm1n1 = { w: 220, h: 190, x: [-0.6, 5.6], y: [0, 0.6], xlabel: 'n', ylabel: 'p_{n}', xticks: [0, 1, 2, 3, 4, 5], yticks: [0.2, 0.4], items: [{ stems: finite(1, 5), color: 'c3' }], caption: 'ρ = 1: uniform, 1/(N+1)' };
  PLOTS.mm1n2 = { w: 220, h: 190, x: [-0.6, 5.6], y: [0, 0.6], xlabel: 'n', ylabel: 'p_{n}', xticks: [0, 1, 2, 3, 4, 5], yticks: [0.2, 0.4], items: [{ stems: finite(2, 5), color: 'c2' }], caption: 'ρ = 2: increasing, mostly full' };
  // drive-in bank PYQ: P(N ≥ 5) vs mu
  PLOTS.bank = {
    w: 440, h: 230, x: [2, 8], y: [0, 0.4], xlabel: 'service rate μ (per min)', ylabel: 'P(N ≥ 5) = ρ^{5}', xticks: [2, 3, 4, 5, 6, 7, 8], yticks: [0.01, 0.1, 0.2, 0.3],
    items: [{ fn: m => Math.pow(2 / m, 5), from: 2.01, to: 8, color: 'c1' }, { hline: 0.01, dash: true }, { vline: 5.024, dash: true }, { dot: [5.024, 0.01], color: 'c2' }, { text: 'μ = 5.024', at: [5.15, 0.06], anchor: 'start', color: 'c2' }],
    caption: 'λ = 2/min. The tail probability ρ⁵ drops below 1% only once μ ≥ 5.024 per minute'
  };

  document.addEventListener('DOMContentLoaded', () => {
    const put = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
    put('fig-map5', conceptMap());
    put('fig-queue', queuePic(false));
    put('fig-queueN', queuePic(true));
    put('fig-bd', bdChain('general'));
    put('fig-mm1', bdChain('mm1'));
    put('fig-mm1n', bdChain('mm1n'));
    put('fig-cut', bdChain('cut'));
    put('fig-pois', bdChain('pois'));
    put('fig-ck', ckFan());
    const two = (a, b, la, lb, l0, l1, n0 = '0', n1 = '1', w = 340) => chain({ w, h: 120, nodes: { a: [100, 62, n0], b: [w - 100, 62, n1] }, edges: [['a', 'b', la, 14], ['b', 'a', lb, 14]], loops: [['a', l0, 180], ['b', l1, 0]] });
    put('fig-speech', two(0, 0, 'α', 'β', '1−α', '1−β', '0', '1', 360));
    put('fig-two', two(0, 0, 'a', 'b', '1−a', '1−b', '0', '1', 360));
    put('fig-iid', two(0, 0, 'p', '1−p', '1−p', 'p', '0', '1', 360));
    put('fig-smoke', two(0, 0, '0.2', '0.3', '0.8', '0.7', 'F', 'N', 360));
    put('fig-gamble', two(0, 0, '0.4', '0.3', '0.6', '0.7', 'W', 'L', 360));
    put('fig-es26', two(0, 0, '1/2', '3/4', '1/2', '1/4', '1', '2', 360));
    put('fig-es25', two(0, 0, 'p', 'q', '1−p', '1−q', '0', '1', 360));
    put('fig-ctmc2', chain({ w: 360, h: 110, nodes: { a: [100, 55, '0'], b: [260, 55, '1'] }, edges: [['a', 'b', 'α (rate)', 14], ['b', 'a', 'β (rate)', 14]] }));
    put('fig-binom', chain({ w: 620, h: 130, nodes: { a: [50, 45, '0'], b: [170, 45, '1'], c: [290, 45, '2'], d: [410, 45, '3'], e: [530, 45, '4'] },
      edges: [['a', 'b', 'p', 0, 12], ['b', 'c', 'p', 0, 12], ['c', 'd', 'p', 0, 12], ['d', 'e', 'p', 0, 12]],
      loops: [['a', '1−p', 270], ['b', '1−p', 270], ['c', '1−p', 270], ['d', '1−p', 270], ['e', '1−p', 270]], extra: [T(590, 45, '⋯', { size: 22 })] }));
    put('fig-walk', chain({ w: 640, h: 120, nodes: { a: [80, 60, '−2'], b: [200, 60, '−1'], c: [320, 60, '0'], d: [440, 60, '1'], e: [560, 60, '2'] },
      edges: [['a', 'b', 'p', 12], ['b', 'c', 'p', 12], ['c', 'd', 'p', 12], ['d', 'e', 'p', 12], ['b', 'a', '1−p', 12], ['c', 'b', '1−p', 12], ['d', 'c', '1−p', 12], ['e', 'd', '1−p', 12]],
      extra: [T(22, 60, '⋯', { size: 22 }), T(618, 60, '⋯', { size: 22 })] }));
    put('fig-bulb', chain({ w: 420, h: 125, nodes: { c: [80, 70, '2'], b: [210, 70, '1'], a: [340, 70, '0'] },
      edges: [['c', 'b', 'p', 0, 12], ['b', 'a', 'p', 0, 12]], loops: [['c', 'q', 90], ['b', 'q', 90], ['a', '1', 90]] }));
    put('fig-classA', chain({ w: 300, h: 230, nodes: { a: [70, 150, '0'], b: [230, 150, '1'], c: [150, 50, '2'] },
      edges: [['a', 'b', '1', -12], ['b', 'a', '½', -12], ['b', 'c', '½', 0, -12], ['c', 'a', '1', 0, -12]] }));
    put('fig-classB', chain({ w: 300, h: 230, nodes: { a: [70, 150, '0'], b: [230, 150, '1'], c: [150, 50, '2'] },
      edges: [['a', 'b', '1', 0, -12], ['b', 'c', '1', 0, -12], ['c', 'a', '1', 0, -12]] }));
    put('fig-classC', chain({ w: 560, h: 210, nodes: { a: [70, 70, '0', 'var(--warn-bg)'], b: [70, 170, '1', 'var(--warn-bg)'], c: [280, 70, '2', 'var(--key-bg)'], d: [440, 70, '3', 'var(--key-bg)'], e: [280, 170, '4', 'var(--def-bg)'] },
      edges: [['a', 'b', '½', -12], ['b', 'a', '½', -12], ['a', 'c', '½', 0, 12], ['b', 'e', '½', 0, -12], ['c', 'd', '1', 12], ['d', 'c', '½', 12]],
      loops: [['d', '½', 0], ['e', '1', 0]],
      extra: [T(70, 20, 'transient class', { size: 12, color: 'var(--g2)' }), T(360, 20, 'closed recurrent class', { size: 12, color: 'var(--g3)' }), T(280, 207, 'absorbing', { size: 12, color: 'var(--g1)' })] }));
    put('fig-es22', chain({ w: 380, h: 270, nodes: { a: [80, 180, '1'], b: [300, 180, '2'], c: [190, 60, '3'] },
      edges: [['a', 'b', '1/4', -12], ['b', 'a', '1/3', -12], ['a', 'c', '1/4', 10], ['c', 'a', '1/2', 10], ['b', 'c', '2/3', -10], ['c', 'b', '1/2', -10]],
      loops: [['a', '1/2', 225]] }));
    put('fig-nd24', chain({ w: 380, h: 270, nodes: { a: [80, 70, '1'], b: [300, 70, '2'], c: [190, 195, '3'] },
      edges: [['a', 'b', '1/2', 12], ['b', 'a', '1/3', 12], ['a', 'c', '1/4', 10], ['c', 'a', '1/2', 10], ['b', 'c', '2/3', 0, -12]],
      loops: [['a', '1/4', 135], ['c', '1/2', 270]] }));
    put('fig-cls3', chain({ w: 420, h: 150, nodes: { a: [70, 85, '0'], b: [210, 85, '1'], c: [350, 85, '2'] },
      edges: [['a', 'b', '1', 12], ['b', 'a', '½', 12], ['b', 'c', '½', 12], ['c', 'b', '1', 12]] }));
    // copies of figures used twice (PYQ section)
    document.querySelectorAll('[data-dup]').forEach(e => { const src = document.getElementById(e.dataset.dup); if (src) e.innerHTML = src.innerHTML; });
  });
})();
