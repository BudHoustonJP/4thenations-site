/* ==========================================================================
   SHARED HEADER AND FOOTER for every page on 4thenations.com.
   This one file holds the site navigation. Change a link here and it
   changes on every page.

   Each page needs three lines:
     In <head>:               <link rel="stylesheet" href="css/shell.css">
     Right after <body>:      <script src="js/shell.js" data-part="header"></script>
     Right before </body>:    <script src="js/shell.js" data-part="footer"></script>
   ========================================================================== */
(function () {
  /* GIVE: change false to true when the giving page (give.html) is live.
     That shows the Give button in the header, the mobile menu, and the
     partner band on the homepage. */
  var GIVE_LIVE = false;

  var SUBSCRIBE = 'https://clarity4thenations.substack.com/subscribe';
  var ARTICLES = 'articles.html';

  var TOOLS = [
    ['brutal-facts-calculator-cities.html', 'City Brutal Facts', 'How many people in a city likely have no relationship with Jesus.'],
    ['brutal-facts-calculator-segments.html', 'People Segment Brutal Facts', 'Size the lostness of a people segment and what it would take to reach it.'],
    ['where-is-the-work.html', 'Where Is the Work?', 'Find the phase of the work among one people and the part you play.'],
    ['access-finder.html', 'Access Finder', 'See where a passport opens short-term entry, and the Frontier peoples there.'],
    ['digital-readiness.html', 'Digital Readiness', 'How a country connects and reads, and what that means for media and oral strategy.']
  ];
  var brand = '<span class="cn-dot" aria-hidden="true"></span><span class="cn-name">Clarity <span>for the</span> Nations</span>';

  var HEADER =
    '<div class="cn-shell cn-head" role="banner">' +
      '<a class="cn-skip" href="#main">Skip to content</a>' +
      '<div class="cn-wrap cn-row">' +
        '<a class="cn-brand" href="index.html" aria-label="Clarity for the Nations, home">' + brand + '</a>' +
        '<div class="cn-nav" role="navigation" aria-label="Main">' +
          '<a href="' + ARTICLES + '">Articles</a>' +
          '<div class="cn-has-menu">' +
            '<button type="button" class="cn-menu-btn" aria-haspopup="true" aria-expanded="false">Mission Tools<span class="cn-caret" aria-hidden="true">&#9660;</span></button>' +
            '<div class="cn-menu">' +
              TOOLS.map(function (t) { return '<a href="' + t[0] + '"><span class="cn-mt">' + t[1] + '</span><span class="cn-ms">' + t[2] + '</span></a>'; }).join('') +
              '<a class="cn-menu-all" href="tools.html">All mission tools &rarr;</a>' +
            '</div>' +
          '</div>' +
          '<a href="frontier-trail.html">Frontier Trail</a>' +
          '<a href="work-with-me.html">Work with Me</a>' +
          '<a href="about.html">About</a>' +
        '</div>' +
        '<div class="cn-cta">' +
          '<a class="cn-btn cn-btn-solid" href="' + SUBSCRIBE + '">Subscribe</a>' +
          '<a class="cn-btn cn-btn-line" href="give.html" data-give>Give</a>' +
        '</div>' +
        '<details class="cn-mobile"><summary>Menu</summary><div class="cn-panel">' +
          '<a href="' + ARTICLES + '">Articles</a>' +
          '<a href="tools.html">Mission Tools</a>' +
          TOOLS.map(function (t) { return '<a class="cn-sub" href="' + t[0] + '">' + t[1] + '</a>'; }).join('') +
          '<a href="frontier-trail.html">Frontier Trail</a>' +
          '<a href="pray.html">Pray</a>' +
          '<a href="work-with-me.html">Work with Me</a>' +
          '<a href="about.html">About</a>' +
          '<a class="cn-give" href="give.html" data-give>Give</a>' +
        '</div></details>' +
      '</div>' +
    '</div>';

  var FOOTER =
    '<div class="cn-shell cn-foot" role="contentinfo">' +
      '<div class="cn-wrap cn-foot-grid">' +
        '<div><a class="cn-brand" href="index.html">' + brand + '</a>' +
          '<div class="cn-foot-by">by Bud Houston &middot; Director of People Group Data, Joshua Project</div></div>' +
        '<div><div class="cn-foot-h">Read and play</div><div class="cn-foot-list">' +
          '<a href="' + ARTICLES + '">All articles</a>' +
          '<a href="frontier-trail.html">Frontier Trail</a>' +
          '<a href="pray.html">Pray for frontier peoples</a>' +
        '</div></div>' +
        '<div><div class="cn-foot-h">Mission tools</div><div class="cn-foot-list">' +
          TOOLS.map(function (t) { return '<a href="' + t[0] + '">' + t[1] + '</a>'; }).join('') +
        '</div></div>' +
        '<div><div class="cn-foot-h">More</div><div class="cn-foot-list">' +
          '<a href="work-with-me.html">Work with Me</a>' +
          '<a href="about.html">About</a>' +
          '<a href="https://clarity4thenations.substack.com">Articles on Substack</a>' +
          '<a href="https://joshuaproject.net">Explore missions data</a>' +
        '</div></div>' +
      '</div>' +
      '<div class="cn-wrap cn-foot-base">Clarity for the Nations</div>' +
    '</div>';

  /* Browser tab icon. favicon.ico at the site root also covers any page
     that does not load this file. */
  if (!document.querySelector('link[rel~="icon"]')) {
    [['icon', 'favicon.ico', { sizes: '32x32' }], ['icon', 'favicon.svg', { type: 'image/svg+xml' }], ['apple-touch-icon', 'apple-touch-icon.png', {}]].forEach(function (i) {
      var l = document.createElement('link'); l.rel = i[0]; l.href = i[1];
      Object.keys(i[2]).forEach(function (k) { l.setAttribute(k, i[2][k]); });
      document.head.appendChild(l);
    });
  }

  var here = document.currentScript;
  var part = here && here.getAttribute('data-part');
  if (GIVE_LIVE) document.documentElement.classList.add('give-live');

  if (part === 'footer') { here.insertAdjacentHTML('afterend', FOOTER); return; }
  if (part !== 'header') return;

  here.insertAdjacentHTML('afterend', HEADER);
  var head = here.nextElementSibling;
  /* data-static on the script tag keeps the header from sticking to the top. */
  if (here.hasAttribute('data-static')) head.classList.add('cn-static');

  /* Mark the current page in the nav. */
  var file = location.pathname.split('/').pop() || 'index.html';
  head.querySelectorAll('.cn-nav > a').forEach(function (a) {
    if (a.getAttribute('href') === file) a.setAttribute('aria-current', 'page');
  });

  /* Mission Tools dropdown: click support for touch screens. */
  var box = head.querySelector('.cn-has-menu'), btn = head.querySelector('.cn-menu-btn');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = box.classList.toggle('cn-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!box.contains(e.target)) { box.classList.remove('cn-open'); btn.setAttribute('aria-expanded', 'false'); }
  });

  /* Skip link: jump to the page's main content, whatever its id. */
  head.querySelector('.cn-skip').addEventListener('click', function (e) {
    var main = document.querySelector('main');
    if (!main) return;
    e.preventDefault(); main.setAttribute('tabindex', '-1'); main.focus(); main.scrollIntoView();
  });
})();
