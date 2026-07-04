// =============================================================
// SUB-PAGE CIRCUIT — resume + project pages
// The main page's trace language, scaled down for content pages:
// a vertical trunk in the left margin (with held 45-degree jogs)
// starting below the dark page header, vertical gutter trees
// departing to both sides where room allows, a terminal via, and
// a train of three amber pulses riding the trunk. All geometry is
// confined to the margins (measured from the page's real content
// box) so it can never cross text. Uses the shared trace classes
// from styles.css, so it follows the dark/light theme; the saved
// theme itself is applied by the inline snippet in each page's
// <head> (and by the parent page when embedded in the iframe).
// Junction rules match the main page: only 45-degree direction
// changes; tree roots and twigs depart their parent, which runs
// straight through.
// =============================================================
(function () {
  var NS   = 'http://www.w3.org/2000/svg';
  var FORK = 12;

  // ---- Theme wiring -------------------------------------------------
  // Standalone visits get their own PWR/RST panel (injected into the
  // page's nav, which the iframe view hides anyway); embedded visits
  // additionally receive `siteTheme` postMessages from the parent —
  // this is the reliable path when direct frame-DOM access is blocked.
  var fadeTimer = null;
  function applyTheme(dark, fade) {
    var root = document.documentElement;
    if (fade) {
      root.classList.add('theme-fade');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () { root.classList.remove('theme-fade'); }, 650);
    }
    root.classList.toggle('dark', dark);
    try { localStorage.setItem('siteTheme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'siteTheme') applyTheme(!!e.data.dark, true);
  });

  var actions = document.querySelector('.site-nav-actions');
  if (actions && !document.getElementById('powerToggle')) {
    var group = document.createElement('div');
    group.className = 'panel-buttons';
    group.innerHTML =
      '<button class="panel-btn" id="powerToggle" aria-label="Toggle dark mode" title="PWR — dark/light mode">' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          '<path d="M12 3v8"/><path d="M6.3 6.6a8 8 0 1 0 11.4 0"/></svg></button>' +
      '<button class="panel-btn" id="resetButton" aria-label="Reboot" title="RST — reboot">' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M18 2v4.5h-4.5"/></svg></button>';
    actions.insertBefore(group, actions.firstChild);
    group.querySelector('#powerToggle').addEventListener('click', function () {
      applyTheme(!document.documentElement.classList.contains('dark'), true);
    });
    group.querySelector('#resetButton').addEventListener('click', function () {
      window.scrollTo(0, 0);
      location.reload();
    });
  }

  // ---- Decorative circuit -------------------------------------------
  var contentEl = document.querySelector('.resume-content, .main-content .content');
  var headerEl  = document.querySelector('.page-header, .resume-header');
  if (!contentEl) return;

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'subpage-circuit');
  svg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(svg);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var trunkPath = null;
  var pulses = [];

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }
  function line(d) {
    return el('path', { d: d, 'class': 'trace-net-line trace-net-line--black' });
  }
  function dot(x, y, hollow, r) {
    return el('circle', {
      cx: x, cy: y, r: r,
      'class': hollow ? 'trace-net-pad--hollow-black' : 'trace-net-pad--filled-black',
    });
  }

  /**
   * Vertical tree bus with twigs staircasing outward (dir ±1). Twigs
   * on the same side share a parallel lane, so the next may only
   * depart after the previous one's run ends — a hard no-overlap
   * guarantee, matching the main page's treeBusV.
   */
  function treeV(x, y0, y1, specs) {
    var lines = [];
    var lastY = y0;
    var lastEnd = { '-1': -Infinity, '1': -Infinity };
    for (var i = 0; i < specs.length; i++) {
      var t   = specs[i];
      var ty  = Math.round(y0 + (y1 - y0) * t.at);
      var len = Math.round(t.len);
      if (ty < lastY + 8 || ty + FORK > y1 - 10 || len < 22) continue;
      if (ty < lastEnd[t.side] + 14) continue; // same-side lane still occupied
      lastY = ty + FORK;
      lastEnd[t.side] = ty + FORK + len;
      var ax  = x + t.side * FORK;
      var sub = treeV(ax, ty + FORK, ty + FORK + len, t.nest || []);
      lines.push({ d: 'M ' + x + ' ' + ty + ' L ' + ax + ' ' + (ty + FORK) + ' ' + sub.d,
                   ex: ax, ey: ty + FORK + len, hollow: !!t.hollow });
      for (var j = 0; j < sub.lines.length; j++) lines.push(sub.lines[j]);
    }
    return { d: 'M ' + x + ' ' + y0 + ' V ' + y1, lines: lines };
  }

  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    trunkPath = null;
    pulses = [];

    if (window.innerWidth < 1300) return;

    var docH = document.documentElement.scrollHeight;
    var rect = contentEl.getBoundingClientRect();
    var contentLeft = Math.round(rect.left + window.scrollX) + 20;
    var trunkX = Math.max(16, Math.round(contentLeft / 2));
    if (contentLeft < 90) return; // no real margin to draw in

    var startY = 28;
    if (headerEl) {
      var hr = headerEl.getBoundingClientRect();
      startY = Math.round(hr.bottom + window.scrollY) + 30;
    }
    var endY = docH - 60;
    if (endY - startY < 260) return;

    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', docH);
    svg.style.height = docH + 'px';

    // Trunk: straight runs with held 45-degree jogs, segmented at the
    // tree roots so every departure lands on a straight stretch.
    var span   = endY - startY;
    var nTrees = Math.max(1, Math.min(3, Math.floor(span / 480)));
    var taps   = [];
    for (var i = 1; i <= nTrees; i++) {
      taps.push(Math.round(startY + (span * i) / (nTrees + 1)));
    }

    var jog = Math.max(6, Math.min(12, trunkX - 8));
    var d = 'M ' + trunkX + ' ' + startY;
    var prev = startY;
    var dir = 1;
    var segEnds = taps.concat([endY]);
    for (var s = 0; s < segEnds.length; s++) {
      var to = segEnds[s];
      var dy = to - prev;
      if (dy > 4 * jog + 140) {
        var a = Math.round(prev + dy * 0.3);
        var b = Math.round(to - dy * 0.3) - jog;
        d += ' V ' + a + ' L ' + (trunkX + dir * jog) + ' ' + (a + jog) +
             ' V ' + b + ' L ' + trunkX + ' ' + (b + jog);
        dir = -dir;
      }
      d += ' V ' + to;
      prev = to;
    }
    trunkPath = line(d);
    svg.appendChild(trunkPath);
    svg.appendChild(dot(trunkX, endY, false, 4.2)); // terminal via

    // Vertical gutter trees departing the trunk, alternating sides.
    for (var k = 0; k < taps.length; k++) {
      var ty2  = taps[k];
      var side = (k % 2 === 0 && trunkX >= 56) ? -1 : 1;
      if (side === 1 && contentLeft - trunkX < 72) continue;
      // Fill most of the gap down to the next tap (or the trunk end).
      var stem = Math.round(span / (nTrees + 1)) - 90;
      if (ty2 + stem > endY - 40) stem = endY - 40 - ty2;
      if (stem < 80) continue;

      var rootX = trunkX + side * FORK;
      var specs = stem > 120
        ? [{ at: 0.16, side: side, len: Math.min(stem * 0.34, 420), hollow: true,
             nest: stem > 200 ? [{ at: 0.3, side: side, len: Math.min(stem * 0.18, 200) }] : [] },
           { at: 0.62, side: side, len: Math.min(stem * 0.26, 340) }]
        : [{ at: 0.3, side: side, len: stem * 0.45, hollow: true }];
      var bus = treeV(rootX, ty2 + FORK, ty2 + stem, specs);
      svg.appendChild(line('M ' + trunkX + ' ' + ty2 + ' L ' + rootX + ' ' + (ty2 + FORK) + ' ' + bus.d));
      svg.appendChild(dot(rootX, ty2 + stem, false, 4.2));
      for (var m = 0; m < bus.lines.length; m++) {
        var tw = bus.lines[m];
        svg.appendChild(line(tw.d));
        svg.appendChild(dot(tw.ex, tw.ey, tw.hollow, tw.hollow ? 4.6 : 4.2));
      }
    }

    // A train of three pulses looping the trunk.
    if (!reduceMotion) {
      for (var p = 0; p < 3; p++) {
        var c = el('circle', { r: 5, 'class': 'section-trace-pulse' });
        svg.appendChild(c);
        pulses.push(c);
      }
    }
  }

  function tick(ts) {
    if (trunkPath && pulses.length) {
      var len = trunkPath.getTotalLength();
      for (var i = 0; i < pulses.length; i++) {
        var dist = ((ts / 1000) * 340 + i * 90) % len;
        var pt = trunkPath.getPointAtLength(dist);
        pulses[i].setAttribute('cx', pt.x);
        pulses[i].setAttribute('cy', pt.y);
        pulses[i].style.opacity = '1';
      }
    }
    requestAnimationFrame(tick);
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });
  if ('ResizeObserver' in window) {
    var roTimer = null;
    new ResizeObserver(function () {
      clearTimeout(roTimer);
      roTimer = setTimeout(build, 150);
    }).observe(document.body);
  }

  window.addEventListener('load', build);
  build();
  if (!reduceMotion) requestAnimationFrame(tick);
})();
