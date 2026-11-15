/* plot.js — tiny exact SVG plotter for the PSP notes.
   Usage:  <div class="plot" data-plot="name"></div>  +  PLOTS.name = {spec}
   or      Plot(element, spec)
   Spec:
     w,h            pixel size (default 460x240)
     x:[a,b] y:[c,d] data ranges
     xlabel, ylabel  axis labels (mini markup: F_X(α), x^2, _{..}, ^{..})
     xticks / yticks arrays of numbers or {v, l} objects  (l = label text)
     grid:true       light guide lines at ticks
     items: list of
       {fn, from, to, n, color, dash, width}      curve y=fn(x)
       {pts:[[x,y],...], color, dash, width, close, fill}   polyline / polygon
       {area:{fn|pts, from,to, base}, color, opacity}       shaded region under fn
       {stems:[[x,h,label?],...], color}          PMF stems with filled circle
       {impulses:[[x,h,label?],...], color}       Dirac impulses (arrows), label = weight
       {stairs:[[x,y],...], color, last}          right-continuous step CDF from jump list
       {dot:[x,y], open:true, color}
       {scatter:[[x,y],...], r, opacity, color}   small dots (scatter plot)
       {vline:x, dash, color, from, to}   {hline:y, dash, color, from, to}
       {text:'str', at:[x,y], color, anchor:'start|middle|end', dx, dy, size}
       {arrow:[[x1,y1],[x2,y2]], color}
       {brace or anything else ignored}
     caption: string under the plot
*/
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = { c1: 'var(--g1)', c2: 'var(--g2)', c3: 'var(--g3)', c4: 'var(--g4)', c5: 'var(--g5)', ax: 'var(--axis)', mu: 'var(--muted)' };
  const col = c => COLORS[c] || c || COLORS.c1;

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // mini markup -> tspans.  a_b, a_{bc}, a^2, a^{bc}
  function rich(textEl, s) {
    s = String(s);
    let i = 0, buf = '';
    const flush = (shift) => {
      if (!buf) return;
      const t = el('tspan', {}, textEl);
      if (shift) { t.setAttribute('baseline-shift', shift); t.setAttribute('font-size', '75%'); }
      t.textContent = buf; buf = '';
    };
    while (i < s.length) {
      const ch = s[i];
      if ((ch === '_' || ch === '^') && i + 1 < s.length) {
        flush();
        let grp;
        if (s[i + 1] === '{') { const j = s.indexOf('}', i + 2); grp = s.slice(i + 2, j); i = j + 1; }
        else { grp = s[i + 1]; i += 2; }
        buf = grp; flush(ch === '_' ? 'sub' : 'super');
      } else { buf += ch; i++; }
    }
    flush();
  }

  function fmt(v) {
    if (typeof v !== 'number') return v;
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    return String(+v.toFixed(3));
  }

  function Plot(host, S) {
    const W = S.w || 460, H = S.h || 240;
    const m = Object.assign({ l: 44, r: 26, t: 22, b: 34 }, S.margin || {});
    const [x0, x1] = S.x, [y0, y1] = S.y;
    const X = v => m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r);
    const Y = v => H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'plot-svg', role: 'img' });
    if (S.title) el('title', {}, svg).textContent = S.title;
    const defs = el('defs', {}, svg);
    const uid = 'p' + Math.random().toString(36).slice(2, 8);
    const mk = (id, c) => {
      const mm = el('marker', { id: uid + id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }, mm);
    };
    mk('ax', COLORS.ax);
    const markerFor = {};
    const arrowMarker = c => { const k = c.replace(/[^a-z0-9]/gi, ''); if (!markerFor[k]) { mk(k, c); markerFor[k] = uid + k; } return `url(#${markerFor[k]})`; };

    const cp = el('clipPath', { id: uid + 'clip' }, defs);
    el('rect', { x: m.l - 4, y: m.t - 4, width: W - m.l - m.r + 8, height: H - m.t - m.b + 8 }, cp);
    const gGrid = el('g', {}, svg), gArea = el('g', { 'clip-path': `url(#${uid}clip)` }, svg), gAx = el('g', {}, svg), gData = el('g', { 'clip-path': S.noClip ? null : `url(#${uid}clip)` }, svg), gTxt = el('g', {}, svg);

    // axes position: x-axis at y=0 if in range else bottom; y-axis at x=0 if in range else left
    const ya = (y0 <= 0 && y1 >= 0) ? Y(0) : Y(y0);
    const xa = (x0 <= 0 && x1 >= 0) ? X(0) : X(x0);
    const axX = S.xaxisAt !== undefined ? Y(S.xaxisAt) : ya;
    const axY = S.yaxisAt !== undefined ? X(S.yaxisAt) : xa;
    el('line', { x1: m.l - 6, y1: axX, x2: W - m.r + 12, y2: axX, stroke: COLORS.ax, 'stroke-width': 1.2, 'marker-end': `url(#${uid}ax)` }, gAx);
    if (!S.noYaxis) el('line', { x1: axY, y1: H - m.b + 6, x2: axY, y2: m.t - 12, stroke: COLORS.ax, 'stroke-width': 1.2, 'marker-end': `url(#${uid}ax)` }, gAx);
    if (S.xlabel) { const t = el('text', { x: W - m.r + 16, y: axX - 7, 'text-anchor': 'end', class: 'plot-lbl' }, gTxt); rich(t, S.xlabel); }
    if (S.ylabel && !S.noYaxis) { const t = el('text', { x: axY + 6, y: m.t - 6, 'text-anchor': 'start', class: 'plot-lbl' }, gTxt); rich(t, S.ylabel); }

    const tick = t => (typeof t === 'object' ? t : { v: t, l: fmt(t) });
    (S.xticks || []).map(tick).forEach(t => {
      const px = X(t.v);
      el('line', { x1: px, y1: axX - 3, x2: px, y2: axX + 3, stroke: COLORS.ax }, gAx);
      if (S.grid) el('line', { x1: px, y1: Y(y0), x2: px, y2: Y(y1), class: 'plot-grid' }, gGrid);
      if (t.l !== '') { const tt = el('text', { x: px + (t.dx || 0), y: axX + 15 + (t.dy || 0), 'text-anchor': 'middle', class: 'plot-tick' }, gTxt); rich(tt, t.l); }
    });
    (S.yticks || []).map(tick).forEach(t => {
      const py = Y(t.v);
      el('line', { x1: axY - 3, y1: py, x2: axY + 3, y2: py, stroke: COLORS.ax }, gAx);
      if (S.grid) el('line', { x1: X(x0), y1: py, x2: X(x1), y2: py, class: 'plot-grid' }, gGrid);
      if (t.l !== '') { const tt = el('text', { x: axY - 6 + (t.dx || 0), y: py + 4 + (t.dy || 0), 'text-anchor': 'end', class: 'plot-tick' }, gTxt); rich(tt, t.l); }
    });

    const path = pts => pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(2) + ',' + Y(p[1]).toFixed(2)).join(' ');
    const sample = (fn, a, b, n) => {
      const out = []; n = n || 400;
      for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; const y = fn(x); if (isFinite(y)) out.push([x, Math.max(Math.min(y, y1 + (y1 - y0)), y0 - (y1 - y0))]); }
      return out;
    };
    const dot = (x, y, c, open, layer) => el('circle', { cx: X(x), cy: Y(y), r: 3.6, fill: open ? 'var(--bg)' : c, stroke: c, 'stroke-width': 1.6 }, layer || gData);

    (S.items || []).forEach(it => {
      const c = col(it.color);
      const sw = it.width || 2.2;
      const dash = it.dash ? (it.dash === true ? '5 4' : it.dash) : null;
      if (it.fn) {
        el('path', { d: path(sample(it.fn, it.from ?? x0, it.to ?? x1, it.n)), fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-dasharray': dash, 'stroke-linejoin': 'round' }, gData);
      } else if (it.pts) {
        el('path', { d: path(it.pts) + (it.close ? ' Z' : ''), fill: it.fill ? col(it.fill) : 'none', 'fill-opacity': it.opacity ?? (it.fill ? 0.25 : null), stroke: it.noStroke ? 'none' : c, 'stroke-width': sw, 'stroke-dasharray': dash, 'stroke-linejoin': 'round' }, it.fill ? gArea : gData);
      } else if (it.area) {
        const A = it.area, base = A.base ?? 0;
        const top = A.pts ? A.pts : sample(A.fn, A.from, A.to, A.n || 200);
        const poly = [[top[0][0], base], ...top, [top[top.length - 1][0], base]];
        el('path', { d: path(poly) + ' Z', fill: c, 'fill-opacity': it.opacity ?? 0.28, stroke: 'none' }, gArea);
        if (it.hatch) { /* simple hatch: vertical lines */
          const a = top[0][0], b = top[top.length - 1][0];
          for (let k = 1; k < 14; k++) { const xx = a + (b - a) * k / 14; const yy = A.fn ? A.fn(xx) : null; if (yy !== null) el('line', { x1: X(xx), y1: Y(base), x2: X(xx), y2: Y(yy), stroke: c, 'stroke-width': .8, opacity: .7 }, gArea); }
        }
      } else if (it.stems) {
        it.stems.forEach(s => {
          el('line', { x1: X(s[0]), y1: Y(it.base ?? 0), x2: X(s[0]), y2: Y(s[1]), stroke: c, 'stroke-width': sw }, gData);
          dot(s[0], s[1], c, false);
          if (s[2] !== undefined) { const t = el('text', { x: X(s[0]), y: Y(s[1]) - 8, 'text-anchor': 'middle', class: 'plot-note', fill: c }, gTxt); rich(t, s[2]); }
        });
      } else if (it.impulses) {
        it.impulses.forEach(s => {
          el('line', { x1: X(s[0]), y1: Y(0), x2: X(s[0]), y2: Y(s[1]) + 2, stroke: c, 'stroke-width': sw, 'marker-end': arrowMarker(c) }, gData);
          if (s[2] !== undefined) { const t = el('text', { x: X(s[0]) + (s[3] || 0), y: Y(s[1]) - 8, 'text-anchor': 'middle', class: 'plot-note', fill: c }, gTxt); rich(t, s[2]); }
        });
      } else if (it.stairs) {
        // it.stairs: [[x_jump, newLevel], ...] sorted; start level = it.start ?? 0 from x0
        let level = it.start ?? 0, prevX = it.from ?? x0;
        const jumps = it.stairs;
        jumps.forEach(([xj, yNew]) => {
          el('line', { x1: X(prevX), y1: Y(level), x2: X(xj), y2: Y(level), stroke: c, 'stroke-width': sw }, gData);
          if (it.nodots) el('line', { x1: X(xj), y1: Y(level), x2: X(xj), y2: Y(yNew), stroke: c, 'stroke-width': sw }, gData);
          else {
            el('line', { x1: X(xj), y1: Y(level), x2: X(xj), y2: Y(yNew), stroke: c, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .8 }, gData);
            dot(xj, level, c, true); dot(xj, yNew, c, false);
          }
          level = yNew; prevX = xj;
        });
        el('line', { x1: X(prevX), y1: Y(level), x2: X(it.to ?? x1), y2: Y(level), stroke: c, 'stroke-width': sw }, gData);
      } else if (it.scatter) {
        it.scatter.forEach(p => el('circle', { cx: X(p[0]), cy: Y(p[1]), r: it.r || 1.7, fill: c, 'fill-opacity': it.opacity ?? 0.6 }, gData));
      } else if (it.dot) {
        dot(it.dot[0], it.dot[1], c, it.open);
      } else if (it.vline !== undefined) {
        el('line', { x1: X(it.vline), y1: Y(it.from ?? y0), x2: X(it.vline), y2: Y(it.to ?? y1), stroke: it.color ? c : COLORS.mu, 'stroke-width': it.width || 1, 'stroke-dasharray': it.dash === false ? null : (dash || '4 3') }, gData);
      } else if (it.hline !== undefined) {
        el('line', { x1: X(it.from ?? x0), y1: Y(it.hline), x2: X(it.to ?? x1), y2: Y(it.hline), stroke: it.color ? c : COLORS.mu, 'stroke-width': it.width || 1, 'stroke-dasharray': it.dash === false ? null : (dash || '4 3') }, gData);
      } else if (it.text !== undefined) {
        const t = el('text', { x: X(it.at[0]) + (it.dx || 0), y: Y(it.at[1]) + (it.dy || 0), 'text-anchor': it.anchor || 'middle', class: 'plot-note', fill: it.color ? c : 'var(--fg)', 'font-size': it.size }, gTxt);
        rich(t, it.text);
      } else if (it.arrow) {
        const [[ax, ay], [bx, by]] = it.arrow;
        el('line', { x1: X(ax), y1: Y(ay), x2: X(bx), y2: Y(by), stroke: c, 'stroke-width': it.width || 1.4, 'marker-end': arrowMarker(c), 'stroke-dasharray': dash }, gData);
      }
    });

    host.innerHTML = '';
    const fig = document.createElement('figure');
    fig.className = 'plot-fig';
    fig.appendChild(svg);
    if (S.caption) {
      const fc = document.createElement('figcaption');
      fc.innerHTML = String(S.caption).replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
        .replace(/_([A-Za-z0-9α-ω])/g, '<sub>$1</sub>');
      fig.appendChild(fc);
    }
    host.appendChild(fig);
    return svg;
  }

  // seeded PRNG for reproducible "simulations"
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  window.Plot = Plot;
  window.PLOTS = window.PLOTS || {};
  window.plotRng = rng;
  window.renderPlots = function () {
    document.querySelectorAll('[data-plot]').forEach(d => {
      const spec = window.PLOTS[d.dataset.plot];
      if (!spec) { d.textContent = '[missing plot ' + d.dataset.plot + ']'; return; }
      try { Plot(d, typeof spec === 'function' ? spec() : spec); } catch (e) { d.textContent = 'plot error: ' + e.message; console.error(e); }
    });
  };
})();
