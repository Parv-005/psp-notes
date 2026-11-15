/* common.js — TOC, theme toggle, KaTeX rendering, solutions toggle, print mode */
(function () {
  const root = document.documentElement;
  const PRINT = location.hash === '#print' || /[?&]print/.test(location.search);

  // theme (remembered per browser)
  try { const t = localStorage.getItem('psp-theme'); if (t) root.dataset.theme = t; } catch (e) {}
  if (PRINT) { root.dataset.theme = 'light'; root.classList.add('print'); }

  function buildTOC() {
    const toc = document.getElementById('toc');
    if (!toc) return;
    const list = toc.querySelector('ol');
    let n2 = 0;
    document.querySelectorAll('main h2, main h3').forEach(h => {
      if (h.classList.contains('no-toc')) return;
      if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
      const li = document.createElement('li');
      li.className = h.tagName === 'H2' ? 'l2' : 'l3';
      if (h.tagName === 'H3' && h.dataset.toc === 'skip') return;
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.dataset.short || h.textContent.replace(/Beyond class notes/i, '').trim();
      li.appendChild(a); list.appendChild(li);
    });
    // active highlighting
    const links = [...list.querySelectorAll('a')];
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const obs = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); const a = map.get(e.target.id); if (a) a.classList.add('active'); } });
    }, { rootMargin: '0px 0px -75% 0px' });
    document.querySelectorAll('main h2, main h3').forEach(h => obs.observe(h));
    list.addEventListener('click', e => { if (e.target.tagName === 'A') document.body.classList.remove('toc-open'); });
  }

  function tools() {
    const box = document.querySelector('#toc .toc-tools');
    if (!box) return;
    const mk = (label, fn) => { const b = document.createElement('button'); b.className = 'tool'; b.textContent = label; b.onclick = fn; box.appendChild(b); return b; };
    mk('◐ Theme', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('psp-theme', root.dataset.theme); } catch (e) {}
    });
    mk('Open all solutions', () => document.querySelectorAll('details.sol').forEach(d => d.open = true));
    mk('Close all', () => document.querySelectorAll('details.sol').forEach(d => d.open = false));
    const tb = document.getElementById('tocbtn');
    if (tb) tb.onclick = () => document.body.classList.toggle('toc-open');
  }

  function math() {
    if (!window.renderMathInElement) return;
    renderMathInElement(document.body, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\[', right: '\\]', display: true }, { left: '$', right: '$', display: false }, { left: '\\(', right: '\\)', display: false }],
      throwOnError: false,
      macros: { '\\P': '\\mathbb{P}', '\\E': '\\mathbb{E}', '\\R': '\\mathbb{R}', '\\Z': '\\mathbb{Z}', '\\comp': '^{c}', '\\given': '\\,|\\,', '\\Var': '\\operatorname{Var}', '\\Cov': '\\operatorname{Cov}', '\\why': '\\qquad\\textcolor{gray}{\\small\\text{#1}}' },
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'svg']
    });
  }

  // shrink display equations that are wider than their container
  function fitMath() {
    document.querySelectorAll('.katex-display').forEach(d => {
      d.style.fontSize = '';
      const k = d.querySelector('.katex');
      if (!k) return;
      const avail = d.clientWidth, need = k.scrollWidth;
      if (avail > 0 && need > avail + 1) d.style.fontSize = (Math.max(0.6, (avail - 2) / need) * 100).toFixed(1) + '%';
    });
  }
  let fitT;
  window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitMath, 150); });
  window.addEventListener('beforeprint', fitMath);
  window.addEventListener('load', fitMath);
  if (document.fonts) document.fonts.ready.then(fitMath);

  document.addEventListener('DOMContentLoaded', () => {
    if (window.renderPlots) renderPlots();
    math();
    buildTOC();
    tools();
    if (PRINT) document.querySelectorAll('details').forEach(d => d.open = true);
    fitMath();
    document.addEventListener('toggle', e => { if (e.target.tagName === 'DETAILS' && e.target.open) fitMath(); }, true);
    window.addEventListener('beforeprint', () => document.querySelectorAll('details').forEach(d => d.open = true));
    document.body.dataset.ready = '1';
  });
})();
