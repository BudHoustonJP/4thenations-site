/* ==========================================================================
   PEOPLE GROUP SEARCH, shared by Where Is the Work? and the People Segment
   calculator. Names and figures come from js/people-groups.js, a Joshua
   Project export stored on this site. Nothing a visitor types is sent anywhere.

   Use on a page:
     <script src="js/people-search.js"></script>
     CNPeople.attach({ input: el, list: ul, onChoose: function (p) { ... } });
   p = { name, id (PeopleID3), c: { name, rog }, pop, adh, ev }
   pop, adh (% Christian) and ev (% Evangelical) are null when Joshua Project
   has no figure.
   ========================================================================== */
window.CNPeople = (function () {
  var me = document.currentScript;
  var DATA = me && me.src ? me.src.replace(/people-search\.js(\?.*)?$/, 'people-groups.js') : 'js/people-groups.js';
  var PG = null, loading = false, waiters = [];

  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function numOrNull(x) { return x === '' || x == null ? null : +x; }

  /* Load the list once. cb runs when it is ready. Safe to call many times. */
  function load(cb) {
    cb = cb || function () {};
    if (PG) { cb(); return; }
    waiters.push(cb);
    if (loading) return;
    loading = true;
    var s = document.createElement('script');
    s.src = DATA; s.async = true;
    s.onload = function () {
      var d = window.CN_PEOPLES;
      if (!d) { loading = false; waiters = []; return; }
      var ctry = d.c.map(function (x) { var a = x.split('|'); return { name: a[0], rog: a[1], n: norm(a[0]) }; });
      PG = d.p.split('\n').map(function (line) {
        var a = line.split('|');
        return { name: a[0], n: norm(a[0]), c: ctry[+a[1]], id: a[2], w: +a[3], pop: numOrNull(a[4]), adh: numOrNull(a[5]), ev: numOrNull(a[6]) };
      });
      waiters.splice(0).forEach(function (f) { f(); });
    };
    s.onerror = function () { loading = false; waiters = []; };   /* search is optional: typing still works */
    document.head.appendChild(s);
  }

  /* How well one typed word matches a name: start of name, start of a word, or inside a word. */
  function wordScore(t, hay) {
    if (hay.indexOf(t) === 0) return 15;
    if ((' ' + hay).indexOf(' ' + t) > -1) return 10;
    if (t.length >= 3 && hay.indexOf(t) > -1) return 4;
    return 0;
  }
  /* Edit distance, stopping early once it passes max. Catches typing mistakes. */
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j, rowMin;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; rowMin = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function typoScore(t, hay) {
    var max = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
    if (!max) return 0;
    var best = max + 1, words = hay.split(' '), i, w, d;
    for (i = 0; i < words.length; i++) {
      w = words[i];
      d = Math.min(dist(t, w.slice(0, t.length), max), dist(t, w.slice(0, t.length + 1), max));
      if (d < best) best = d;
    }
    return best <= max ? 6 - best * 2 : 0;
  }

  /* Best matches for what was typed. place (optional) lifts groups in that country. */
  function search(q, place, limit) {
    var nq = norm(q);
    if (!PG || nq.length < 2) return [];
    var toks = nq.split(' '), np = norm(place || '');
    function run(typos) {
      var out = [], i, k, p, s, t, score, ok;
      for (i = 0; i < PG.length; i++) {
        p = PG[i]; score = 0; ok = true;
        for (k = 0; k < toks.length; k++) {
          t = toks[k];
          s = wordScore(t, p.n);
          if (!s) s = wordScore(t, p.c.n) / 2;               /* a country name narrows the list */
          if (!s && typos) s = typoScore(t, p.n);
          if (!s) { ok = false; break; }
          score += s;
        }
        if (!ok) continue;
        if (p.n === nq) score += 40; else if (p.n.indexOf(nq) === 0) score += 20;
        if (np && (p.c.n === np || p.c.n.indexOf(np) === 0)) score += 15;
        out.push({ p: p, s: score + p.w / 2 });               /* larger groups first when tied */
      }
      return out;
    }
    var hits = run(false);
    if (hits.length < (limit || 8)) {                          /* add near misses, ranked below exact matches */
      var seen = {};
      hits.forEach(function (h) { seen[h.p.id + h.p.c.rog] = 1; });
      run(true).forEach(function (h) { if (!seen[h.p.id + h.p.c.rog]) hits.push(h); });
    }
    hits.sort(function (a, b) { return b.s - a.s || (a.p.name < b.p.name ? -1 : 1); });
    return hits.slice(0, limit || 8).map(function (h) { return h.p; });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Turn a text input into a search box.
     opts: input, list (an empty <ul>), place (optional input), status (optional element for screen readers),
           statusText(n), onChoose(p), onType() */
  function attach(opts) {
    var input = opts.input, list = opts.list, place = opts.place || null, status = opts.status || null;
    if (!input || !list) return;
    var items = [], active = -1, timer = 0, uid = list.id || 'cn-pg';
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-expanded', 'false'); if (list.id) input.setAttribute('aria-controls', list.id);
    list.setAttribute('role', 'listbox');
    function close() { list.hidden = true; list.innerHTML = ''; items = []; active = -1; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function mark() {
      Array.prototype.forEach.call(list.children, function (li, i) { li.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
      if (active > -1) { input.setAttribute('aria-activedescendant', uid + '-' + active); list.children[active].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function choose(p) { close(); if (opts.onChoose) opts.onChoose(p); }
    function show() {
      items = search(input.value, place ? place.value : '');
      if (!items.length) { close(); if (status) status.textContent = ''; return; }
      list.innerHTML = items.map(function (p, i) {
        return '<li role="option" id="' + uid + '-' + i + '" aria-selected="false"><span>' + esc(p.name) + '</span><span class="pg-c">' + esc(p.c.name) + '</span></li>';
      }).join('');
      list.hidden = false; active = -1; input.setAttribute('aria-expanded', 'true');
      if (status) status.textContent = opts.statusText ? opts.statusText(items.length) : items.length + ' people groups found. Use the arrow keys to choose one.';
    }
    input.addEventListener('input', function () {
      if (opts.onType) opts.onType();
      clearTimeout(timer);
      if (norm(input.value).length < 2) { close(); return; }
      timer = setTimeout(function () { load(function () { if (document.activeElement === input) show(); }); }, 90);
    });
    input.addEventListener('focus', function () { load(); });
    input.addEventListener('keydown', function (e) {
      if (list.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = active <= 0 ? items.length - 1 : active - 1; mark(); }
      else if (e.key === 'Enter' && active > -1) { e.preventDefault(); choose(items[active]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    input.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== input) close(); }, 150); });
    list.addEventListener('mousedown', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      e.preventDefault(); choose(items[Array.prototype.indexOf.call(list.children, li)]);
    });
  }

  function profileUrl(p) { return 'https://joshuaproject.net/people_groups/' + p.id + '/' + p.c.rog; }

  return { load: load, search: search, attach: attach, profileUrl: profileUrl, norm: norm };
})();
