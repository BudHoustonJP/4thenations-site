/* ==========================================================================
   DOT MAP for the tool pages. Same grid and look as the homepage night map,
   with every dot assigned to a country (data: js/map-cells.js).

   Use on a page:
     <script src="js/map-cells.js"></script>
     <script src="js/dotmap.js"></script>
     var map = CNDotMap(canvasEl, {
       level: function (iso) { return 0..1 or null },   // 0 or null = unlit land dot
       label: function (iso) { return 'Tooltip text' },
       onPick: function (iso) { ... }                     // click or tap on a country
     });
     map.draw();            // after the data behind level() changes
     map.select('IRN');     // ring one country; null clears
   ========================================================================== */
window.CNDotMap = function (canvas, opts) {
  var D = window.CN_MAPCELLS, COLS = D.cols, ROWS = D.rows, STEP = D.step, TOP = D.latTop;
  var ctx = canvas.getContext('2d');
  var css = getComputedStyle(document.documentElement);
  var C = {
    land: css.getPropertyValue('--land').trim() || '#2F4358',
    line: css.getPropertyValue('--line').trim() || '#22303F',
    muted: css.getPropertyValue('--muted').trim() || '#94A1AF',
    paper: css.getPropertyValue('--paper').trim() || '#EEE9DD'
  };
  var dots = [];
  for (var i = 0; i < D.dots.length; i += 2) {
    var cell = D.dots[i];
    dots.push({ c: cell % COLS, r: Math.floor(cell / COLS), iso: D.iso[D.dots[i + 1]] });
  }
  var byCell = {};
  dots.forEach(function (d) { byCell[d.r * COLS + d.c] = d; });

  var w = 0, h = 0, cell = 0, dpr = 1, selected = null;
  var tip = document.createElement('div');
  tip.className = 'map-tip'; tip.setAttribute('role', 'status'); tip.hidden = true;
  canvas.parentNode.appendChild(tip);

  function size() {
    w = canvas.clientWidth; if (!w) return false;
    cell = w / COLS; h = Math.round(cell * ROWS); dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';
    return true;
  }

  function draw() {
    if (!size()) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    /* The 10/40 Window lines, as on the homepage. */
    ctx.font = '500 ' + Math.max(9, Math.min(11, cell * 1.3)) + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    [[40, '40°N'], [10, '10°N']].forEach(function (p) {
      var y = Math.round((TOP - p[0]) / STEP * cell) + 0.5;
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.fillText(p[1], w - 6, y - 3);
    });
    var base = Math.max(0.9, cell * 0.27), lit = Math.max(1.1, cell * 0.31);
    dots.forEach(function (d) {
      var x = (d.c + 0.5) * cell, y = (d.r + 0.5) * cell, v = opts.level ? opts.level(d.iso) : 0;
      if (v > 0) {
        ctx.globalAlpha = 0.07 * v; ctx.fillStyle = '#F5B83D';
        ctx.beginPath(); ctx.arc(x, y, lit * 2.2, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 0.25 + 0.75 * v;
        ctx.beginPath(); ctx.arc(x, y, lit, 0, 6.283); ctx.fill();
      } else {
        ctx.globalAlpha = 1; ctx.fillStyle = C.land;
        ctx.beginPath(); ctx.arc(x, y, base, 0, 6.283); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    if (selected) {
      ctx.strokeStyle = C.paper; ctx.lineWidth = Math.max(1, cell * 0.14);
      dots.forEach(function (d) {
        if (d.iso !== selected) return;
        ctx.beginPath(); ctx.arc((d.c + 0.5) * cell, (d.r + 0.5) * cell, lit * 1.7, 0, 6.283); ctx.stroke();
      });
    }
  }

  function isoAt(ev) {
    var b = canvas.getBoundingClientRect();
    var c = Math.floor((ev.clientX - b.left) / cell), r = Math.floor((ev.clientY - b.top) / cell);
    for (var rad = 0; rad <= 1; rad++)
      for (var dr = -rad; dr <= rad; dr++)
        for (var dc = -rad; dc <= rad; dc++) {
          var d = byCell[(r + dr) * COLS + (c + dc)];
          if (d) return { iso: d.iso, x: ev.clientX - b.left, y: ev.clientY - b.top };
        }
    return null;
  }
  function showTip(hit) {
    if (!hit || !opts.label) { tip.hidden = true; canvas.style.cursor = ''; return; }
    tip.textContent = opts.label(hit.iso);
    tip.hidden = false;
    var left = Math.min(Math.max(hit.x + 14, 4), w - tip.offsetWidth - 4);
    tip.style.left = left + 'px'; tip.style.top = Math.max(hit.y - tip.offsetHeight - 10, 4) + 'px';
    canvas.style.cursor = opts.onPick ? 'pointer' : '';
  }
  canvas.addEventListener('mousemove', function (e) { showTip(isoAt(e)); });
  canvas.addEventListener('mouseleave', function () { tip.hidden = true; });
  canvas.addEventListener('click', function (e) {
    var hit = isoAt(e); showTip(hit);
    if (hit && opts.onPick) opts.onPick(hit.iso);
  });

  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(draw, 120); });
  return {
    draw: draw,
    select: function (iso) { selected = iso; draw(); },
    has: function (iso) { return dots.some(function (d) { return d.iso === iso; }); }
  };
};
