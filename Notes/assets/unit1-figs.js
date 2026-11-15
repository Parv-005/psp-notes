/* Unit 1 figures */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function svg(w, h, inner, cls) {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="${NS}" class="${cls || ''}">${inner}</svg>`;
  }
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--fg)"/></marker></defs>`;

  /* ---------- Venn diagrams ---------- */
  let vid = 0;
  function venn(label, regions, opts = {}) {
    // regions: subset of ['a','b','ab','out']  (a = A only, b = B only, ab = both, out = outside)
    const id = 'v' + (vid++);
    const W = 190, H = 130, cA = [72, 66], cB = opts.disjoint ? [140, 66] : [118, 66], r = opts.disjoint ? 30 : 40;
    const sh = 'var(--g1)';
    let s = `<defs>
      <clipPath id="${id}A"><circle cx="${cA[0]}" cy="${cA[1]}" r="${r}"/></clipPath>
      <clipPath id="${id}B"><circle cx="${cB[0]}" cy="${cB[1]}" r="${r}"/></clipPath>
      <mask id="${id}notB"><rect x="0" y="0" width="${W}" height="${H}" fill="white"/><circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="black"/></mask>
      <mask id="${id}notA"><rect x="0" y="0" width="${W}" height="${H}" fill="white"/><circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="black"/></mask>
      <mask id="${id}out"><rect x="0" y="0" width="${W}" height="${H}" fill="white"/><circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="black"/><circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="black"/></mask>
    </defs>`;
    const op = 0.45;
    if (regions.includes('out')) s += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="${sh}" fill-opacity="${op}" mask="url(#${id}out)"/>`;
    if (regions.includes('a')) s += `<circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="${sh}" fill-opacity="${op}" mask="url(#${id}notB)"/>`;
    if (regions.includes('b')) s += `<circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="${sh}" fill-opacity="${op}" mask="url(#${id}notA)"/>`;
    if (regions.includes('ab')) s += `<circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="${sh}" fill-opacity="${op}" clip-path="url(#${id}B)"/>`;
    s += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="var(--fg)" stroke-width="1.3" rx="4"/>
      <circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="none" stroke="var(--fg)" stroke-width="1.3"/>
      <circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="none" stroke="var(--fg)" stroke-width="1.3"/>
      <text x="${cA[0] - r + 6}" y="${cA[1] - r + 10}" font-size="14" font-style="italic">A</text>
      <text x="${cB[0] + r - 14}" y="${cB[1] - r + 10}" font-size="14" font-style="italic">B</text>
      <text x="${W - 22}" y="${H - 12}" font-size="13">Ω</text>`;
    return `<figure class="diagram">${svg(W, H, s)}<figcaption>${label}</figcaption></figure>`;
  }

  /* ---------- concept map ---------- */
  function conceptMap() {
    const boxes = [
      ['Random experiment', 10, 20], ['Sample space Ω', 180, 20], ['Events & σ-field', 350, 20], ['Axioms of P', 520, 20],
      ['Rules: complement,\naddition, De Morgan', 520, 110], ['Counting\n(equally likely Ω)', 350, 110], ['Conditional\nprobability', 180, 110],
      ['Independence', 10, 200], ['Multiplication\nrule', 180, 200], ['Total probability', 350, 200], ['Bayes rule', 520, 200]
    ];
    const W = 680, H = 270, bw = 150, bh = 48;
    const centre = i => [boxes[i][1] + bw / 2, boxes[i][2] + bh / 2];
    let s = arrowDefs('mapArr');
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 7], [6, 8], [8, 9], [9, 10], [5, 6]];
    edges.forEach(([a, b]) => {
      let [x1, y1] = centre(a), [x2, y2] = centre(b);
      // shorten to box edges
      const dx = x2 - x1, dy = y2 - y1;
      const sx = Math.abs(dx) > 1 ? (bw / 2) / Math.abs(dx) : Infinity, sy = Math.abs(dy) > 1 ? (bh / 2) / Math.abs(dy) : Infinity;
      const t = Math.min(sx, sy);
      x1 += dx * t; y1 += dy * t; x2 -= dx * t; y2 -= dy * t;
      if (a === 3 && b === 6) { s += `<path d="M${boxes[3][1]},${boxes[3][2] + bh} C 420,90 330,95 ${boxes[6][1] + bw},${boxes[6][2] + 6}" fill="none" stroke="var(--fg)" stroke-width="1.3" marker-end="url(#mapArr)" opacity=".75"/>`; return; }
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.3" marker-end="url(#mapArr)" opacity=".75"/>`;
    });
    boxes.forEach(([t, x, y], i) => {
      const fill = i >= 6 ? 'var(--thm-bg)' : (i >= 3 ? 'var(--key-bg)' : 'var(--def-bg)');
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="${fill}" stroke="var(--fg)" stroke-width="1"/>`;
      const lines = t.split('\n');
      lines.forEach((ln, k) => { s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 5 + (k - (lines.length - 1) / 2) * 16}" text-anchor="middle" font-size="13.5">${ln}</text>`; });
    });
    return svg(W, H, s);
  }

  /* ---------- conditional probability picture ---------- */
  function condFig() {
    const W = 560, H = 170;
    let s = arrowDefs('cArr');
    // left: full omega
    s += `<rect x="10" y="20" width="220" height="130" rx="6" fill="none" stroke="var(--fg)"/>
      <circle cx="95" cy="85" r="48" fill="var(--g2)" fill-opacity=".18" stroke="var(--g2)" stroke-width="1.5"/>
      <circle cx="150" cy="85" r="48" fill="var(--g1)" fill-opacity=".18" stroke="var(--g1)" stroke-width="1.5"/>
      <text x="62" y="60" font-style="italic" font-size="15" fill="var(--g2)">A</text><text x="178" y="60" font-style="italic" font-size="15" fill="var(--g1)">B</text>
      <text x="205" y="142" font-size="13">Ω</text>
      <text x="120" y="14" text-anchor="middle" font-size="13">before: the whole Ω counts</text>`;
    s += `<line x1="248" y1="85" x2="318" y2="85" stroke="var(--fg)" stroke-width="1.5" marker-end="url(#cArr)"/>
      <text x="283" y="74" text-anchor="middle" font-size="12.5">told "B occurred"</text>`;
    // right: only B
    s += `<defs><clipPath id="cBclip"><circle cx="440" cy="85" r="60"/></clipPath></defs>
      <circle cx="440" cy="85" r="60" fill="var(--g1)" fill-opacity=".12" stroke="var(--g1)" stroke-width="2"/>
      <circle cx="372" cy="85" r="60" fill="var(--g2)" fill-opacity=".45" clip-path="url(#cBclip)"/>
      <text x="470" y="44" font-style="italic" font-size="15" fill="var(--g1)">B = new Ω</text>
      <text x="408" y="90" font-size="13" text-anchor="middle">A∩B</text>
      <text x="440" y="164" text-anchor="middle" font-size="13">P(A|B) = area(A∩B) / area(B)</text>`;
    return `<figure class="diagram">${svg(W, H + 6, s)}<figcaption>Conditioning on B shrinks the sample space to B and rescales by P(B)</figcaption></figure>`;
  }

  /* ---------- series / parallel ---------- */
  function sysFig() {
    const W = 600, H = 120;
    const comp = (x, y, t) => `<rect x="${x}" y="${y - 14}" width="44" height="28" rx="4" fill="var(--bg)" stroke="var(--fg)"/><text x="${x + 22}" y="${y + 5}" text-anchor="middle" font-size="13">${t}</text>`;
    let s = '';
    // series
    s += `<text x="120" y="16" text-anchor="middle" font-size="13" font-weight="600">Series</text>
      <line x1="10" y1="60" x2="250" y2="60" stroke="var(--fg)"/>` + comp(40, 60, '1') + comp(108, 60, '2') + comp(176, 60, '3');
    // parallel
    s += `<text x="440" y="16" text-anchor="middle" font-size="13" font-weight="600">Parallel</text>
      <line x1="320" y1="60" x2="360" y2="60" stroke="var(--fg)"/><line x1="520" y1="60" x2="560" y2="60" stroke="var(--fg)"/>
      <line x1="360" y1="32" x2="360" y2="96" stroke="var(--fg)"/><line x1="520" y1="32" x2="520" y2="96" stroke="var(--fg)"/>`;
    [32, 64, 96].forEach((y, i) => { s += `<line x1="360" y1="${y}" x2="520" y2="${y}" stroke="var(--fg)"/>` + comp(418, y, String(i + 1)); });
    return svg(W, H, s);
  }

  /* ---------- partition picture ---------- */
  function partitionFig() {
    const W = 520, H = 190;
    let s = `<rect x="20" y="20" width="480" height="150" rx="6" fill="none" stroke="var(--fg)" stroke-width="1.3"/>`;
    const xs = [20, 120, 250, 360, 500];
    const lbl = ['A₁', 'A₂', 'A₃', 'A₄'];
    for (let i = 1; i < 4; i++) s += `<line x1="${xs[i]}" y1="20" x2="${xs[i] + (i % 2 ? 15 : -10)}" y2="170" stroke="var(--fg)" stroke-width="1.2"/>`;
    lbl.forEach((t, i) => s += `<text x="${(xs[i] + xs[i + 1]) / 2}" y="42" text-anchor="middle" font-size="15" font-style="italic">${t}</text>`);
    s += `<defs><clipPath id="pB"><ellipse cx="260" cy="110" rx="190" ry="42"/></clipPath></defs>
      <ellipse cx="260" cy="110" rx="190" ry="42" fill="var(--g2)" fill-opacity=".22" stroke="var(--g2)" stroke-width="2"/>
      <text x="460" y="80" font-size="15" font-style="italic" fill="var(--g2)">B</text>`;
    ['B∩A₁', 'B∩A₂', 'B∩A₃', 'B∩A₄'].forEach((t, i) => s += `<text x="${(xs[i] + xs[i + 1]) / 2 + (i === 0 ? 18 : i === 3 ? -18 : 0)}" y="115" text-anchor="middle" font-size="12.5">${t}</text>`);
    s += `<text x="485" y="162" font-size="13">Ω</text>`;
    return `<figure class="diagram">${svg(W, H, s)}<figcaption>A partition A₁…A₄ cuts B into disjoint pieces B∩Aᵢ, and P(B) is the sum of their probabilities</figcaption></figure>`;
  }

  /* ---------- tree diagram (smokers) ---------- */
  function treeFig() {
    const W = 560, H = 210;
    let s = '';
    const L = (x1, y1, x2, y2, t, tx, ty) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--fg)" stroke-width="1.3"/><text x="${tx}" y="${ty}" font-size="13" text-anchor="middle" fill="var(--g1)">${t}</text>`;
    const N = (x, y, t) => `<circle cx="${x}" cy="${y}" r="15" fill="var(--bg)" stroke="var(--fg)"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="600">${t}</text>`;
    s += L(30, 105, 170, 55, '0.55', 92, 68) + L(30, 105, 170, 155, '0.45', 92, 148);
    s += L(185, 55, 330, 25, '0.7', 255, 30) + L(185, 55, 330, 80, '0.3', 255, 80);
    s += L(185, 155, 330, 130, '0.1', 255, 132) + L(185, 155, 330, 185, '0.9', 255, 185);
    s += `<circle cx="30" cy="105" r="5" fill="var(--fg)"/>` + N(170, 55, 'M') + N(170, 155, 'F');
    s += N(345, 25, 'S') + N(345, 80, 'S̄') + N(345, 130, 'S') + N(345, 185, 'S̄');
    s += `<text x="372" y="29" font-size="13">0.55×0.7 = <tspan font-weight="700" fill="var(--g2)">0.385</tspan></text>
      <text x="372" y="84" font-size="13" fill="var(--muted)">0.55×0.3 = 0.165</text>
      <text x="372" y="134" font-size="13">0.45×0.1 = <tspan font-weight="700" fill="var(--g2)">0.045</tspan></text>
      <text x="372" y="189" font-size="13" fill="var(--muted)">0.45×0.9 = 0.405</text>`;
    return `<figure class="diagram">${svg(W, H, s)}<figcaption>Tree: multiply along paths. P(S) = 0.385 + 0.045 = 0.43, and P(M|S) = 0.385/0.43</figcaption></figure>`;
  }

  /* ---------- binary channel ---------- */
  function channelFig() {
    const W = 420, H = 170;
    let s = arrowDefs('chArr');
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="var(--fg)"/>`;
    s += dot(90, 40) + dot(90, 130) + dot(330, 40) + dot(330, 130);
    s += `<text x="20" y="45" font-size="13">1  (0.6)</text><text x="20" y="135" font-size="13">0  (0.4)</text>
      <text x="345" y="45" font-size="13">1</text><text x="345" y="135" font-size="13">0</text>
      <text x="90" y="16" text-anchor="middle" font-size="12.5" fill="var(--muted)">sent</text><text x="330" y="16" text-anchor="middle" font-size="12.5" fill="var(--muted)">received</text>`;
    const A = (x1, y1, x2, y2, t, tx, ty, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.6" marker-end="url(#chArr)"/><text x="${tx}" y="${ty}" font-size="13" text-anchor="middle" fill="${c}">${t}</text>`;
    s += A(96, 40, 322, 40, '0.9', 210, 32, 'var(--g3)') + A(96, 130, 322, 130, '0.9', 210, 150, 'var(--g3)');
    s += A(96, 44, 322, 126, '0.1', 150, 75, 'var(--g2)') + A(96, 126, 322, 44, '0.1', 150, 112, 'var(--g2)');
    return `<figure class="diagram">${svg(W, H, s)}<figcaption>Binary channel. Red = error paths.</figcaption></figure>`;
  }

  /* ---------- plots ---------- */
  PLOTS.relfreq = function () {
    const r = plotRng(20241114);
    const pts = []; let k = 0;
    for (let n = 1; n <= 600; n++) { if (Math.floor(r() * 6) === 5) k++; pts.push([n, k / n]); }
    return {
      w: 560, h: 240, x: [0, 620], y: [0, 0.5], xlabel: 'n (number of throws)', ylabel: 'n_A / n',
      xticks: [100, 200, 300, 400, 500, 600], yticks: [0.1, { v: 1 / 6, l: '1/6' }, 0.3, 0.4, 0.5],
      items: [{ hline: 1 / 6, color: 'c2', dash: '6 4', width: 1.5 }, { pts, color: 'c1', width: 1.6 },
        { text: 'true value 1/6', at: [470, 1 / 6], dy: -8, color: 'c2' }],
      caption: 'Relative frequency of a "six" in 600 simulated throws. It settles toward 1/6 (statistical regularity).'
    };
  };

  PLOTS.meet = {
    w: 330, h: 300, x: [0, 66], y: [0, 66], xlabel: 'X (min)', ylabel: 'Y (min)', margin: { l: 40, r: 30, t: 26, b: 34 },
    xticks: [10, 30, 50, 60], yticks: [10, 30, 50, 60],
    items: [
      { pts: [[0, 0], [60, 0], [60, 60], [0, 60]], close: true, color: 'ax', width: 1.2 },
      { pts: [[10, 0], [60, 0], [60, 50]], close: true, fill: 'c2', color: 'c2', opacity: .35, width: 1 },
      { pts: [[0, 10], [0, 60], [50, 60]], close: true, fill: 'c2', color: 'c2', opacity: .35, width: 1 },
      { pts: [[0, 10], [50, 60]], color: 'c1', width: 1.3, dash: true }, { pts: [[10, 0], [60, 50]], color: 'c1', width: 1.3, dash: true },
      { text: 'Y−X > 10', at: [15, 50], color: 'c2' }, { text: 'X−Y > 10', at: [47, 12], color: 'c2' },
      { text: '|X−Y| ≤ 10', at: [33, 33], color: 'c1', size: 12 }
    ],
    caption: 'Shaded triangles: first arrival waits more than 10 min'
  };

  /* ---------- mount ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('fig-map'); if (m) m.innerHTML = conceptMap();
    const vr = document.getElementById('venn-row');
    if (vr) vr.innerHTML = [
      venn('A ∪ B (at least one)', ['a', 'b', 'ab']), venn('A ∩ B (both)', ['ab']), venn('Aᶜ (not A)', ['b', 'out']),
      venn('A ∩ Bᶜ = A − B', ['a']), venn('A △ B (exactly one)', ['a', 'b']), venn('(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ', ['out']),
      venn('A, B mutually exclusive', [], { disjoint: true })
    ].join('');
    const c = document.getElementById('fig-cond'); if (c) c.innerHTML = condFig();
    const sy = document.getElementById('fig-sys'); if (sy) sy.innerHTML = `<figure class="diagram">${sysFig()}</figure>`;
    const p = document.getElementById('fig-partition'); if (p) p.innerHTML = partitionFig();
    const t = document.getElementById('fig-tree'); if (t) t.innerHTML = treeFig();
    const ch = document.getElementById('fig-channel'); if (ch) ch.innerHTML = channelFig();
  });
})();
