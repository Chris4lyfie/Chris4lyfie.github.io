// =============================================================
// PORTFOLIO — main.js
// Handles: boot sequence, iframe content loading, navigation
//          state, sidebar toggle, timeline animation, skill bar
//          animation, image parallax, and the project coverflow
//          carousel.
// =============================================================


// =============================================================
// BOOT SEQUENCE
// A BIOS/POST-style intro that plays once per browser tab
// session before the site is revealed. Click/keypress skips it
// instantly; prefers-reduced-motion skips it automatically.
// =============================================================
(function () {
  const screen = document.getElementById('bootScreen');
  if (!screen) return; // Guard: only run on pages that include the overlay

  const log    = document.getElementById('bootLog');
  const hint   = screen.querySelector('.boot-hint');
  const cursor = document.createElement('span');
  cursor.className = 'boot-cursor';
  log.appendChild(cursor);

  const LINES = [
    { text: 'christian-os v1.0' },
    { text: '' },
    { text: 'initializing kernel',          ok: true },
    { text: 'mounting /home/experience',    ok: true },
    { text: 'loading skills.so',            ok: true },
    { text: 'linking projects.bin',         ok: true },
    { text: 'establishing display output',  ok: true },
    { text: '' },
    { text: 'boot complete — welcome' },
  ];

  function finish() {
    document.documentElement.classList.remove('boot-lock');
    screen.classList.add('boot-done');
    document.removeEventListener('keydown', finish);
    screen.removeEventListener('click', finish);
    setTimeout(() => screen.remove(), 650);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }

  document.documentElement.classList.add('boot-lock');
  document.addEventListener('keydown', finish);
  screen.addEventListener('click', finish);

  // Circuit motif behind the boot log — the same trace language as
  // the page (45-degree tree fans, fat dot/ring terminals) in muted
  // strokes so the log stays readable, with amber pulses running
  // along the buses while the screen is up. Placed in the top,
  // bottom, and right regions, clear of the centered log text.
  (function buildBootCircuit() {
    const NS  = 'http://www.w3.org/2000/svg';
    const F   = 12;
    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'boot-circuit');
    svg.setAttribute('aria-hidden', 'true');
    screen.insertBefore(svg, screen.firstChild);

    const mkPath = (d) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'boot-trace');
      svg.appendChild(p);
      return p;
    };
    const mkDot = (x, y, hollow) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', hollow ? 4.6 : 4.2);
      c.setAttribute('class', hollow ? 'boot-pad--ring' : 'boot-pad--dot');
      svg.appendChild(c);
    };

    const buses = [];

    // Top bus: in from the left edge, two departing twigs, dot end.
    const y1 = Math.round(H * 0.13);
    const e1 = Math.round(W * 0.66);
    buses.push(mkPath(`M -2 ${y1} H ${e1}`));
    mkDot(e1, y1, false);
    const t1 = Math.round(W * 0.22);
    mkPath(`M ${t1} ${y1} L ${t1 + F} ${y1 - F} H ${t1 + F + Math.round(W * 0.18)}`);
    mkDot(t1 + F + Math.round(W * 0.18), y1 - F, true);
    const t2 = Math.round(W * 0.38);
    mkPath(`M ${t2} ${y1} L ${t2 + F} ${y1 + F} H ${t2 + F + Math.round(W * 0.12)}`);
    mkDot(t2 + F + Math.round(W * 0.12), y1 + F, false);

    // Bottom bus: in from the right edge, one twig, dot end.
    const y2 = Math.round(H * 0.87);
    const e2 = Math.round(W * 0.30);
    buses.push(mkPath(`M ${W + 2} ${y2} H ${e2}`));
    mkDot(e2, y2, false);
    const t3 = Math.round(W * 0.60);
    mkPath(`M ${t3} ${y2} L ${t3 - F} ${y2 - F} H ${t3 - F - Math.round(W * 0.14)}`);
    mkDot(t3 - F - Math.round(W * 0.14), y2 - F, true);

    // Right vertical bus with a parallel vertical twig.
    const x3 = Math.round(W * 0.88);
    const v1 = Math.round(H * 0.70);
    buses.push(mkPath(`M ${x3} -2 V ${v1}`));
    mkDot(x3, v1, false);
    const tv = Math.round(H * 0.34);
    mkPath(`M ${x3} ${tv} L ${x3 + F} ${tv + F} V ${tv + F + Math.round(H * 0.16)}`);
    mkDot(x3 + F, tv + F + Math.round(H * 0.16), true);

    // Amber pulses riding each bus at staggered phases, until the
    // boot screen is removed from the DOM.
    const pulses = buses.map(() => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', 5);
      c.setAttribute('class', 'boot-pulse');
      svg.appendChild(c);
      return c;
    });
    const lens = buses.map(p => p.getTotalLength());

    function tick(ts) {
      if (!document.body.contains(screen)) return; // boot done — stop
      buses.forEach((p, i) => {
        const dist = ((ts / 1000) * 480 + lens[i] * i * 0.37) % lens[i];
        const pt = p.getPointAtLength(dist);
        pulses[i].setAttribute('cx', pt.x);
        pulses[i].setAttribute('cy', pt.y);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  const LINE_GAP = 220; // ms between each line appearing
  const OK_GAP   = 160; // ms after a line before its [ OK ] tag lights up
  let delay = 0;

  LINES.forEach(line => {
    const el = document.createElement('div');
    el.className = 'boot-line';
    el.innerHTML = line.text
      ? (line.ok ? `${line.text} <span class="boot-ok">[ OK ]</span>` : line.text)
      : '&nbsp;';
    log.insertBefore(el, cursor);

    setTimeout(() => el.classList.add('boot-line-visible'), delay);
    if (line.ok) setTimeout(() => el.classList.add('boot-ok-visible'), delay + OK_GAP);
    delay += LINE_GAP;
  });

  setTimeout(() => hint.classList.add('boot-hint-visible'), 300);
  setTimeout(finish, delay + 600);
})();


// =============================================================
// PCB TRACE LAYER
// Two parts, drawn into the same absolutely-positioned SVG:
//
// 1. The U1 -> U2 -> U3 connecting trace: a vertical trunk at a
//    fixed X in the left margin gutter (comfortably inside every
//    section's own padding, so it can never reach real content).
//    Long straight runs with held 45-degree jogs; always back on
//    exactly the trunk X at each tag's Y so the junction dots and
//    branch stubs line up vertically across sections. The lead
//    from the portrait's "+" terminal crosses the page at a fixed
//    Y inside Home's top padding — above all content.
//
// 2. Decorative wiring (v7, "two-layer board"), only in the two
//    gaps between sections. Top-layer traces are solid; bottom-
//    layer traces are drawn faint and pass under the trunk and
//    the top layer; vias mark layer changes. Traces that lead to
//    another page end in an off-page via + flag naming that page
//    (clickable); hovering the page's real link sends a pulse
//    that drops through the via. Only 45-degree direction
//    changes, Y-splits where traces leave the trunk, and nothing
//    crosses content.
//
// All measurement uses offsetLeft/offsetTop chains, NOT
// getBoundingClientRect: the sections animate in with a
// translateY + scale transform, and rect-based measurement taken
// before/while that animation runs bakes the transform into the
// geometry (this was the "misaligned nodes" bug).
// =============================================================
(function () {
  const container = document.getElementById('portfolioSections');
  const blackPath  = document.getElementById('sectionTraceBlack');
  const whitePath  = document.getElementById('sectionTraceWhite');
  const dotU1      = document.getElementById('sectionTraceDotU1');
  const dotU2      = document.getElementById('sectionTraceDotU2');
  const dotU3      = document.getElementById('sectionTraceDotU3');
  const refPath    = document.getElementById('sectionTracePath');
  const refU1      = document.getElementById('sectionTracePathU1');
  const refU2      = document.getElementById('sectionTracePathU2');
  const pulseLayer = document.getElementById('tracePulseLayer');
  const netGroup   = document.getElementById('traceNetwork');
  if (!container || !blackPath || !whitePath || !dotU1 || !dotU2 || !dotU3 ||
      !refPath || !refU1 || !refU2 || !pulseLayer || !netGroup) return;

  const SVG_NS    = 'http://www.w3.org/2000/svg';
  const DOT_R     = 3.2; // filled via-dot radius
  const PAD_R     = 4;   // hollow pad radius
  const FORK      = 12;  // 45-degree leg run of a symmetric Y-fork

  // Trunk geometry — recomputed per rebuild. The trunk sits centered
  // between the page's left edge and the leftmost section content box,
  // so the wall->trunk and trunk->node gaps read roughly even.
  let trunkX = 80;
  let jogAmp = 12; // horizontal amplitude of the trunk's held jogs

  /** Position of `el` relative to the container, immune to CSS transforms. */
  function absPos(el) {
    let x = 0, y = 0, n = el;
    while (n && n !== container) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y };
  }

  function centerOf(el) {
    const p = absPos(el);
    return { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2 };
  }

  /** Per-section vertical range + real content box edges (for safe routing). */
  function measureSections() {
    const out = [];
    for (const id of ['home', 'experience', 'projects']) {
      const sec = document.getElementById(id);
      const inner = sec && sec.querySelector('.section-inner');
      if (!sec || !inner) return null;
      const sp = absPos(sec);
      const ip = absPos(inner);
      const pad = 32; // .section-inner side padding
      out.push({
        id,
        top: sp.y,
        bottom: sp.y + sec.offsetHeight,
        contentLeft: ip.x + pad,
        contentRight: ip.x + inner.offsetWidth - pad,
        dark: id === 'projects',
      });
    }
    return out;
  }

  /**
   * Vertical run at trunkX with one *held* 45-degree jog — straight,
   * jog out, run parallel, jog back — like a real routed trace rather
   * than a nervous zigzag. Starts and ends exactly on trunkX. Every
   * straight vertical piece is recorded in `runs` so the decorative
   * network can attach branch junctions exactly on the trunk (and
   * never on one of its diagonals).
   */
  function trunkRun(y1, y2, dir, runs) {
    const dy = y2 - y1;
    if (dy < 4 * jogAmp + 120) {
      runs.push({ x: trunkX, y1, y2 });
      return `M ${trunkX} ${y1} V ${y2}`;
    }
    const off = dir * jogAmp;
    const a = Math.round(y1 + dy * 0.3);
    const b = Math.round(y2 - dy * 0.3) - jogAmp;
    runs.push({ x: trunkX, y1, y2: a });
    runs.push({ x: trunkX + off, y1: a + jogAmp, y2: b });
    runs.push({ x: trunkX, y1: b + jogAmp, y2 });
    return `M ${trunkX} ${y1} V ${a} L ${trunkX + off} ${a + jogAmp} V ${b} L ${trunkX} ${b + jogAmp} V ${y2}`;
  }


  /**
   * Trace tree (user's PCB reference image): a straight horizontal
   * bus from (x0, y) to (x1, y) with twigs departing along the way.
   * Reference-style junctions: the bus runs STRAIGHT THROUGH — each
   * twig simply departs at 45 degrees and levels out parallel to the
   * bus at a ±FORK offset before ending in a dot. Twigs can nest
   * (`nest` spec) for the staircase fans in the reference. Only
   * 45-degree direction changes anywhere. Returns the bus path plus
   * every twig line (departure diagonal included) with its end point;
   * specs must be in ascending `at` order.
   */
  function treeBus(x0, y, x1, specs) {
    const lines = [];
    let lastX = x0;
    const lastEnd = { '-1': -Infinity, '1': -Infinity }; // per-side occupied span
    for (const t of specs || []) {
      const tx  = Math.round(x0 + (x1 - x0) * t.at);
      const len = Math.round(t.len);
      if (tx < lastX + 8 || tx + FORK > x1 - 10 || len < 22) continue;
      // HARD no-overlap guarantee: two twigs on the same side share
      // the same parallel lane — the next may only depart after the
      // previous one's run has ended.
      if (tx < lastEnd[t.side] + 14) continue;
      lastX = tx + FORK;
      lastEnd[t.side] = tx + FORK + len;
      const ay  = y + t.side * FORK;
      const sub = treeBus(tx + FORK, ay, tx + FORK + len, t.nest);
      lines.push({
        d: `M ${tx} ${y} L ${tx + FORK} ${ay} ${sub.d}`,
        ex: tx + FORK + len, ey: ay, hollow: !!t.hollow,
      });
      sub.lines.forEach(l => lines.push(l));
    }
    return { d: `M ${x0} ${y} H ${x1}`, lines };
  }

  function updateSectionTrace(secs) {
    const battery = document.getElementById('batteryPositive');
    const u1 = document.querySelector('#home .home-skills-strip-label');
    const u2 = document.querySelector('#experience .section-tag');
    const u3 = document.querySelector('#projects .section-tag');
    if (!battery || !u1 || !u2 || !u3) return null;

    const p0 = centerOf(battery);
    const tagPoint = (el) => {
      const p = absPos(el);
      return { x: p.x, y: Math.round(p.y + el.offsetHeight / 2) };
    };
    const p1 = tagPoint(u1);
    const p2 = tagPoint(u2);
    const p3 = tagPoint(u3);
    const projectsTop = secs.find(s => s.id === 'projects').top;

    const homeSec = secs.find(s => s.id === 'home');
    const crossY  = homeSec.top + 26;
    const c       = 10; // 45-degree corner size
    // Portrait lead — up from the "+" terminal, across the page at a
    // fixed Y inside Home's top padding (above all content), then a
    // 45-degree corner down into the trunk. The crossing Y is
    // absolute, not a midpoint, so it can never land at content height.
    const leadPieces = [`M ${p0.x} ${p0.y}`];
    leadPieces.push(
      `V ${crossY + c}`,
      `L ${p0.x - c} ${crossY}`,
      `H ${trunkX + c}`,
      `L ${trunkX} ${crossY + c}`,
    );
    const leadIn = leadPieces.join(' ');

    // ---- Trunk assembly with symmetric λ-forks ----------------------
    // HARD RULE (user reference image): every fork is a symmetric
    // split. The incoming vertical ENDS at the fork apex and BOTH
    // continuations leave at 45 degrees — the branch down-right, the
    // trunk itself down-left, holding the offset briefly before a
    // 45-degree jog returns it to trunkX. Nothing ever passes straight
    // through a junction; nothing meets a line at 90 degrees.
    const runs      = [];
    const chain     = [leadIn]; // continuous route (follows every left leg)
    const black     = [leadIn]; // everything drawn above the dark band
    const decoForks = [];
    let cursorY = crossY + c;
    let dir     = 1;

    const runTo = (y2) => {
      const d = trunkRun(cursorY, y2, dir, runs);
      dir = -dir;
      chain.push(d);
      black.push(d);
      cursorY = y2;
    };

    // Trunk-to-horizontal junction: the rotated symmetric Y-split
    // (user: "only for these types of junctions" — everything else
    // keeps the straight-through reference style). The trunk dog-legs
    // RIGHT into the apex at (trunkX + FORK, fy); the branch bus
    // continues east out of the apex; the trunk leaves the apex
    // down-left, back to trunkX. Used for the U1/U2 taps and the
    // decorative band-tree roots (`branchD` null for those — their
    // buses are drawn from the apex by buildNetwork). Tree twigs and
    // the gutter-tree roots stay plain 45-degree departures.
    const tapAt = (fy, branchD) => {
      const seg = `M ${trunkX} ${fy - FORK} L ${trunkX + FORK} ${fy} L ${trunkX} ${fy + FORK}`;
      black.push(seg);
      if (branchD) black.push(branchD);
      chain.push(seg);
      cursorY = fy + FORK;
    };

    // Decorative wiring (v7) lives only in the two gaps between
    // sections: each gap gets a trunk Y-split whose arm is drawn by
    // buildNetwork (the Y-split itself is part of the main trace).
    const armX0 = trunkX + FORK;          // every trunk arm starts at its fork's apex
    const fkB   = homeSec.bottom - 24;    // Home -> Experience gap
    const fkC   = projectsTop - 36;       // Experience -> Projects gap

    // Wide gutters (>= 90px between trunk and content) also get one
    // top-layer gutter tree per section. Its root leaves the trunk at
    // 45 degrees (the trunk runs straight through) on a straight piece.
    const expSec = secs.find(s => s.id === 'experience');
    const fkD = homeSec.contentLeft - trunkX >= 90 && fkB - p1.y > 360 ? p1.y + 90 : null;
    const fkE = expSec.contentLeft - trunkX >= 90 && fkC - p2.y > 420 ? p2.y + 110 : null;

    runTo(p1.y - FORK);
    const tree1 = treeBus(armX0, p1.y, p1.x - 6, []);
    const routeU1 = `${chain.join(' ')} L ${armX0} ${p1.y} ${tree1.d}`;
    tapAt(p1.y, tree1.d);

    if (fkD !== null) {
      runTo(fkD);
      decoForks.push({ kind: 'gutterTree', y: fkD, stemEnd: fkB - 80, contentLeft: homeSec.contentLeft });
      dir = -1; // the next run jogs away from the tree's root
    }

    runTo(fkB - FORK);
    tapAt(fkB, null);
    decoForks.push({ kind: 'resume', y: fkB });

    runTo(p2.y - FORK);
    const tree2 = treeBus(armX0, p2.y, p2.x - 6, []);
    const routeU2 = `${chain.join(' ')} L ${armX0} ${p2.y} ${tree2.d}`;
    tapAt(p2.y, tree2.d);

    if (fkE !== null) {
      runTo(fkE);
      decoForks.push({ kind: 'gutterTree', y: fkE, stemEnd: fkC - 130, contentLeft: expSec.contentLeft });
      dir = -1;
    }

    runTo(fkC - FORK);
    tapAt(fkC, null);
    decoForks.push({ kind: 'projects', y: fkC });

    runTo(projectsTop);

    // U3 finish: straight drop inside the dark band, then a terminal
    // 45-degree bend into the branch — the trunk ends here, so this is
    // a corner, not a fork, and stays exempt from the split rule.
    const bend   = 10;
    const runEnd = p3.y - bend;
    runs.push({ x: trunkX, y1: projectsTop, y2: runEnd });
    const tree3 = treeBus(trunkX + bend, p3.y, p3.x - 6, []);
    const trunkBelow = `M ${trunkX} ${projectsTop} V ${runEnd} L ${trunkX + bend} ${p3.y} ${tree3.d}`;
    chain.push(trunkBelow);

    blackPath.setAttribute('d', black.join(' '));
    whitePath.setAttribute('d', trunkBelow);

    dotU1.setAttribute('cx', trunkX + FORK);
    dotU1.setAttribute('cy', p1.y);
    dotU2.setAttribute('cx', trunkX + FORK);
    dotU2.setAttribute('cy', p2.y);
    dotU3.setAttribute('cx', trunkX);
    dotU3.setAttribute('cy', p3.y - 26);

    // Pulse routes: the full run to U3, plus two routes identical up
    // to the U1/U2 fork apexes where they take the right leg into the
    // branch instead — that shared prefix is what makes the pulses
    // visibly split at each junction.
    refPath.setAttribute('d', chain.join(' '));
    refU1.setAttribute('d', routeU1);
    refU2.setAttribute('d', routeU2);

    return {
      decoForks,
      geo: { crossY, fkB, fkC, homeCL: homeSec.contentLeft, expCL: expSec.contentLeft },
    };
  }

  // ---- Decorative network (v7: two-layer board) ----------------------

  function svgEl(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function netLine(d, dark) {
    return svgEl('path', { d, class: `trace-net-line trace-net-line--${dark ? 'white' : 'black'}` });
  }

  function netPad(x, y, hollow, dark, r) {
    const tone = dark ? 'white' : 'black';
    return hollow
      ? svgEl('circle', { cx: x, cy: y, r: r || PAD_R, class: `trace-net-pad--hollow-${tone}` })
      : svgEl('circle', { cx: x, cy: y, r: r || DOT_R, class: `trace-net-pad--filled-${tone}` });
  }

  const TREE_DOT = 4.2; // terminal pad radius

  // Pages the off-page vias lead to (order matches the carousel).
  const LINK_PAGES = {
    resume:  { label: 'RESUME',  url: 'resume.html' },
    argus:   { label: 'ARGUS',   url: 'projects/Project-Argus.html' },
    qxq:     { label: 'QXQ',     url: 'projects/QxQ.html' },
    homelab: { label: 'HOMELAB', url: 'projects/Home-Infrastructure.html' },
  };
  const LINK_VIA_R = 6;
  let linkRoutes = {}; // key -> { path, x, y, group }; rebuilt with the wiring

  const flagWidth = (label) => Math.round(20 + label.length * 6.1);

  /** Bottom-layer trace: faint, drawn first so it passes UNDER the top layer. */
  function bottomLine(d) {
    return svgEl('path', { d, class: 'trace-net-line trace-net-line--bottom' });
  }

  /** Via: copper ring with an open center, where a trace changes layers. */
  function layerVia(x, y, r) {
    return svgEl('circle', { cx: x, cy: y, r: r || 4.2, class: 'trace-via' });
  }

  /**
   * Off-page connector: a via plus a schematic off-page flag naming
   * the page the trace leads to. Clicking opens that page (a mouse
   * extra; the buttons and cards stay the main way in); hovering it
   * sends a pulse. `routeD` is the invisible path a hover pulse rides,
   * from the trunk's Y-split apex to the via.
   */
  function offPage(frag, key, x, y, routeD) {
    const page = LINK_PAGES[key];
    const w  = flagWidth(page.label);
    const fx = x + LINK_VIA_R + 6;
    const g  = svgEl('g', { class: 'offpage', 'data-link': key });
    g.appendChild(svgEl('circle', { cx: x, cy: y, r: LINK_VIA_R, class: 'trace-via trace-via--link' }));
    g.appendChild(svgEl('path', {
      d: `M ${fx} ${y - 7.5} H ${fx + w - 8} L ${fx + w} ${y} L ${fx + w - 8} ${y + 7.5} H ${fx} Z`,
      class: 'offpage-flag',
    }));
    const label = svgEl('text', { x: fx + 6, y: y + 3.4, class: 'offpage-label' });
    label.textContent = page.label;
    g.appendChild(label);
    g.addEventListener('click', () => loadExternalContent(page.url));
    g.addEventListener('mouseenter', () => sendLinkPulse(key));
    const route = svgEl('path', { d: routeD, class: 'trace-route' });
    frag.appendChild(route);
    frag.appendChild(g);
    linkRoutes[key] = { path: route, x, y, group: g };
  }

  /**
   * Home -> Experience gap. Top layer: the trunk's Y-split feeds the
   * RESUME link, which ends just right of the View Resume button.
   * Bottom layer: a faint three-lane bus enters from the page edge
   * (passing under the trunk), bends down with concentric 45-degree
   * corners under the RESUME trace, then each lane surfaces through
   * a via and finishes on the top layer in a pad.
   */
  function drawResumeBand(frag, fk, home) {
    const x0 = trunkX + FORK, y = fk.y;
    const W = container.clientWidth;
    const flagW = flagWidth(LINK_PAGES.resume.label);
    const btn = document.querySelector('.home-cta-secondary');
    const cta = document.querySelector('.home-cta-buttons');
    const skills = document.querySelector('.home-split-skills');

    let rx = btn ? Math.round(absPos(btn).x + btn.offsetWidth + 22) : Math.round(W * 0.69);
    rx = Math.min(rx, W - 24 - LINK_VIA_R - 6 - flagW);

    // The first run stays left of the buttons and below the Skills
    // column; if the layout leaves no room, the bus runs straight in.
    const ctaX = cta ? absPos(cta).x : W;
    const skillsBottom = skills ? absPos(skills).y + skills.offsetHeight : 0;
    const bendX = Math.min(ctaX - 70, Math.max(x0 + 110, Math.round(W * 0.28)));
    const canBend = bendX >= x0 + 110 && y - 50 > skillsBottom + 10;
    // Concentric 45-degree chamfers keep the lane spacing constant
    // through every bend: each lane further inside cuts (2 - sqrt 2) * pitch less.
    const PITCH = home ? home.p : 10;
    const K  = (2 - Math.SQRT2) * PITCH;
    const d1 = [24, 24 - K, 24 - 2 * K];   // bend-1 chamfers (lane 0 is the outside)
    const e2 = [24 - 2 * K, 24 - K, 24];   // bend-2 chamfers (lane 2 is the outside)
    const c3 = [20, 20 - K, 20 - 2 * K];   // gutter turn (leftmost gutter lane is the outside)

    for (let i = 0; i < 3; i++) {
      const y2 = y + 22 + i * PITCH;
      const vx = bendX + 120 + (2 - i) * 80;     // lowest lane surfaces first
      const px = Math.min(vx + 280, rx - 40);    // its pad on the top layer
      const y1 = y - 42 + i * PITCH;
      // Where the lane comes from: down the Home gutter (lane k = 2 - i;
      // the leftmost gutter lane ends up lowest after the turn east),
      // or in from the page edge when there is no gutter bus.
      const k  = 2 - i;
      const yTurn = canBend ? y1 : y2;
      const head = home
        ? `M ${home.xs[k]} ${home.yStart[k]} V ${yTurn - c3[k]} L ${home.xs[k] + c3[k]} ${yTurn}`
        : `M 0 ${yTurn}`;
      let d;
      if (canBend) {
        const xv = bendX + (2 - i) * PITCH;
        d = `${head} H ${xv - d1[i]} L ${xv} ${y1 + d1[i]} V ${y2 - e2[i]} ` +
            `L ${xv + e2[i]} ${y2} H ${vx - 4.2}`;
      } else {
        d = `${head} H ${vx - 4.2}`;
      }
      frag.appendChild(bottomLine(d));
      if (home) frag.appendChild(layerVia(home.xs[k], home.yStart[k], 3.8));
      frag.appendChild(layerVia(vx, y2));
      if (px - 4.2 > vx + 4.2) {
        frag.appendChild(netLine(`M ${vx + 4.2} ${y2} H ${px - 4.2}`, false));
        frag.appendChild(netPad(px, y2, false, false, TREE_DOT));
      }
    }

    frag.appendChild(netLine(`M ${x0} ${y} H ${rx - LINK_VIA_R}`, false));
    offPage(frag, 'resume', rx, y, `M ${x0} ${y} H ${rx}`);
  }

  /**
   * Experience -> Projects gap. Top layer: one trace per project page
   * (ARGUS, QXQ, HOMELAB in carousel order) — the bus feeds QXQ, the
   * other two depart it at 45 degrees into lanes above and below.
   * Bottom layer: two faint jumpers pass under the links, each
   * surfacing through a via into a short top-layer stub and pad.
   */
  function drawProjectsBand(frag, fk) {
    const x0 = trunkX + FORK, y = fk.y;
    const W = container.clientWidth;
    const L = 16; // lane offset of the up/down legs (45 degrees)
    const upX   = Math.max(x0 + 24, Math.round(W * 0.139));
    const downX = Math.max(upX + 60, Math.round(W * 0.229));
    const ax = Math.round(W * 0.333), qx = Math.round(W * 0.528), hx = Math.round(W * 0.722);

    const jumpers = [[Math.round(W * 0.43), 76], [Math.round(W * 0.625), -56]];
    for (const [jx] of jumpers) frag.appendChild(bottomLine(`M ${jx} ${y - 30} V ${y + 24}`));
    for (const [jx, stub] of jumpers) {
      const dir = Math.sign(stub);
      frag.appendChild(layerVia(jx, y - 30, 3.8));
      frag.appendChild(layerVia(jx, y + 24, 3.8));
      frag.appendChild(netLine(`M ${jx + dir * 3.8} ${y - 30} H ${jx + stub - dir * 4.2}`, false));
      frag.appendChild(netPad(jx + stub, y - 30, false, false, TREE_DOT));
    }

    frag.appendChild(netLine(`M ${x0} ${y} H ${qx - LINK_VIA_R}`, false));
    frag.appendChild(netLine(`M ${upX} ${y} L ${upX + L} ${y - L} H ${ax - LINK_VIA_R}`, false));
    frag.appendChild(netLine(`M ${downX} ${y} L ${downX + L} ${y + L} H ${hx - LINK_VIA_R}`, false));
    offPage(frag, 'argus',   ax, y - L, `M ${x0} ${y} H ${upX} L ${upX + L} ${y - L} H ${ax}`);
    offPage(frag, 'qxq',     qx, y,     `M ${x0} ${y} H ${qx}`);
    offPage(frag, 'homelab', hx, y + L, `M ${x0} ${y} H ${downX} L ${downX + L} ${y + L} H ${hx}`);
  }

  /**
   * The portrait is drawn as a voltage source, so its "−" terminal
   * gets a proper return path: a short lead dropping from the badge
   * into a small three-bar ground symbol.
   */
  function buildGround(frag) {
    const minus = document.querySelector('.battery-terminal--minus');
    if (!minus) return;
    const p   = absPos(minus);
    const cx  = Math.round(p.x + minus.offsetWidth / 2);
    const top = p.y + minus.offsetHeight + 2;
    frag.appendChild(netLine(`M ${cx} ${top} V ${top + 12}`, false));
    frag.appendChild(netLine(`M ${cx - 9} ${top + 12} H ${cx + 9}`, false));
    frag.appendChild(netLine(`M ${cx - 5.5} ${top + 16} H ${cx + 5.5}`, false));
    frag.appendChild(netLine(`M ${cx - 2} ${top + 20} H ${cx + 2}`, false));
  }

  // ---- Vertical wiring beside the trunk -------------------------------

  /**
   * Lane positions for a faint bus in the gutter between the trunk and
   * a section's content: clear of the trunk's jogs on the left and at
   * least 16px from the content on the right. Null when it can't fit.
   */
  function gutterBus(contentLeft, maxLanes) {
    const G = contentLeft - trunkX;
    if (G < 44) return null;
    const p  = G >= 90 ? 10 : 8;
    const x0 = trunkX + jogAmp + 14;
    let n = Math.min(maxLanes, G >= 170 ? 4 : 3);
    while (n >= 2 && x0 + (n - 1) * p > contentLeft - 16) n--;
    if (n < 2) return null;
    return { p, xs: Array.from({ length: n }, (_, k) => x0 + k * p) };
  }

  /**
   * Experience gutter: a faint bus that surfaces from staggered vias
   * just below the Home gap, passes under the U2 branch and runs down
   * beside the timeline. Its outer lane takes a break halfway (down
   * through one via, back up through the next); lanes end in vias.
   */
  function drawExperienceBus(frag, bus, g) {
    const n = bus.xs.length;
    const yTop = g.fkB + 60, yBot = g.fkC - 90;
    if (yBot - yTop < 240) return;
    const vias = [];
    bus.xs.forEach((x, k) => {
      const y0 = yTop + (k % 2) * 10;
      const y1 = yBot - (n - 1 - k) * 14;
      if (k === n - 1 && n >= 3) {
        const a = Math.round(y0 + (y1 - y0) * 0.42);
        const b = Math.round(y0 + (y1 - y0) * 0.56);
        frag.appendChild(bottomLine(`M ${x} ${y0} V ${a}`));
        frag.appendChild(bottomLine(`M ${x} ${b} V ${y1}`));
        vias.push([x, a], [x, b]);
      } else {
        frag.appendChild(bottomLine(`M ${x} ${y0} V ${y1}`));
      }
      vias.push([x, y0], [x, y1]);
    });
    for (const [x, y] of vias) frag.appendChild(layerVia(x, y, 3.8));
  }

  /**
   * Far-left margin (very wide screens only): a faint pair running down
   * through Home and Experience with two held 45-degree jogs.
   */
  function drawMarginPair(frag, g) {
    const room = trunkX - jogAmp;          // free strip left of the trunk's jogs
    if (room < 52) return;
    const m = Math.round(room / 2) - 5;
    const yA = g.crossY + 40, yB = g.fkC - 60;
    const span = yB - yA;
    if (span < 400) return;
    const j1 = Math.round(yA + span * 0.32), j2 = Math.round(yA + span * 0.68);
    [m - 5, m + 5].forEach((x, k) => {
      const a = yA + k * 10, b = yB - k * 10;
      frag.appendChild(bottomLine(`M ${x} ${a} V ${j1} L ${x + 10} ${j1 + 10} V ${j2} L ${x} ${j2 + 10} V ${b}`));
      frag.appendChild(layerVia(x, a, 3.8));
      frag.appendChild(layerVia(x, b, 3.8));
    });
  }

  /**
   * Gutter tree (wide gutters): a top-layer root leaves the trunk at 45
   * degrees and runs straight down beside it; two twigs cross OVER the
   * faint gutter bus at 45 degrees into lanes beyond it. The first
   * twig dives through a via and carries on, faint, on the bottom
   * layer; the second ends in a pad. Twig runs never share a lane.
   */
  function drawGutterTree(frag, fk, bus) {
    const rootX = trunkX + FORK;
    const stem  = fk.stemEnd - fk.y;
    if (stem < 160) return;
    frag.appendChild(netLine(`M ${trunkX} ${fk.y} L ${rootX} ${fk.y + FORK} V ${fk.stemEnd}`, false));
    frag.appendChild(netPad(rootX, fk.stemEnd, false, false, TREE_DOT));

    const base  = (bus ? bus.xs[bus.xs.length - 1] : rootX) + 18;
    const lanes = [base, base + 14];
    const ty = [Math.round(fk.y + stem * 0.16), Math.round(fk.y + stem * 0.58)];
    // twig 1 must leave lane 0 before twig 2's diagonal sweeps across it
    const cross2 = ty[1] + (lanes[0] - rootX);
    const twigs = [
      { lx: lanes[0], ty: ty[0], end: Math.min(ty[0] + (lanes[0] - rootX) + Math.min(stem * 0.34, 380), cross2 - 18), dive: true },
      { lx: lanes[1], ty: ty[1], end: Math.min(ty[1] + (lanes[1] - rootX) + Math.min(stem * 0.26, 300), fk.stemEnd - 10), dive: false },
    ];
    for (const t of twigs) {
      if (t.lx + 10 > fk.contentLeft - 14) continue;
      const y1 = t.ty + (t.lx - rootX);   // after the 45-degree run
      if (t.end - y1 < 30) continue;
      frag.appendChild(netLine(`M ${rootX} ${t.ty} L ${t.lx} ${y1} V ${t.end}`, false));
      if (t.dive) {
        const tail = Math.min(70, fk.stemEnd - t.end);
        if (tail > 24) {
          frag.appendChild(bottomLine(`M ${t.lx} ${t.end} V ${t.end + tail}`));
          frag.appendChild(layerVia(t.lx, t.end + tail, 3.8));
        }
        frag.appendChild(layerVia(t.lx, t.end));
      } else {
        frag.appendChild(netPad(t.lx, t.end, false, false, TREE_DOT));
      }
    }
  }

  /**
   * v7 decorative wiring: faint buses beside the trunk, the two gap
   * bands, gutter trees on wide screens, and the portrait's ground
   * symbol. Bottom-layer pieces go in first so every top-layer trace
   * (including the trunk, drawn after this group) passes over them.
   */
  function buildNetwork(net) {
    netGroup.replaceChildren();
    linkRoutes = {};
    const frag = document.createDocumentFragment();
    const g = net.geo;

    const homeBus = gutterBus(g.homeCL, 3); // feeds band B, which has 3 lanes
    const expBus  = gutterBus(g.expCL, 4);
    const home = homeBus && homeBus.xs.length === 3
      ? { ...homeBus, yStart: homeBus.xs.map((_, k) => g.crossY + 20 + (k % 2) * 10) }
      : null;

    drawMarginPair(frag, g);
    if (expBus) drawExperienceBus(frag, expBus, g);
    for (const fk of net.decoForks) {
      if (fk.kind === 'resume') drawResumeBand(frag, fk, home);
      else if (fk.kind === 'projects') drawProjectsBand(frag, fk);
    }
    for (const fk of net.decoForks) {
      if (fk.kind === 'gutterTree') drawGutterTree(frag, fk, fk.y < g.fkB ? homeBus : expBus);
    }
    buildGround(frag);
    netGroup.appendChild(frag);
  }

  // ---- Pulse driver -------------------------------------------------
  //
  // Three amber pulses leave the portrait together: one rides the full
  // route to U3, the other two ride routes that are geometrically
  // identical up to the U1/U2 fork apexes, where they take the right
  // leg into the branch instead — so a single pulse visibly splits at
  // each junction. Driven by rAF + getPointAtLength at constant speed
  // (SMIL can't split); each pulse fades where its route ends, and the
  // matching U-header text lights up with a wave as it arrives.
  // Clicking the portrait restarts the cycle immediately.

  const PULSE_SPEED  = 340; // px per second
  const PULSE_REST   = 2.2; // idle seconds between automatic pulse trains
  const PULSE_GROUP  = 3;   // automatic pulses arrive as a train of three
  const MAX_PULSES   = 8;   // 3 auto + 5 manual — uncapped spamming lagged the page
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pulseRoutes  = null; // the three routes (full, →U1, →U2)
  const livePulses = [];   // in-flight pulses, each with its own circles
  let nextAutoAt   = 0;

  function initPulseRoutes() {
    pulseRoutes = [
      { path: refPath, len: refPath.getTotalLength(),
        span: document.querySelector('#projects .section-tag span') },
      { path: refU1, len: refU1.getTotalLength(),
        span: document.querySelector('#home .home-skills-strip-label span') },
      { path: refU2, len: refU2.getTotalLength(),
        span: document.querySelector('#experience .section-tag span') },
    ];
  }

  function igniteTag(span) {
    if (!span) return;
    span.classList.remove('tag-pulse-wave');
    void span.offsetWidth; // restart the CSS animation from the top
    span.classList.add('tag-pulse-wave');
    span.addEventListener('animationend', () => span.classList.remove('tag-pulse-wave'), { once: true });
  }

  // Each pulse is independent — clicking the portrait ADDS one to the
  // wire without disturbing pulses already in flight. `t0` may be in
  // the future (auto trains schedule staggered departures; the pulse
  // stays hidden until its time comes).
  function spawnPulse(t0) {
    if (!pulseRoutes || pulseRoutes[0].len === 0 || livePulses.length >= MAX_PULSES) return;
    const circles = pulseRoutes.map(() => {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', 6);
      c.setAttribute('class', 'section-trace-pulse');
      pulseLayer.appendChild(c);
      return c;
    });
    livePulses.push({ t0, circles, lit: [false, false, false] });
  }

  function pulseTick(now) {
    if (pulseRoutes && pulseRoutes[0].len > 0) {
      if (now >= nextAutoAt) {
        // Automatic pulses arrive as a little train of three.
        for (let g = 0; g < PULSE_GROUP; g++) spawnPulse(now + g * 300);
        nextAutoAt = now + (pulseRoutes[0].len / PULSE_SPEED + PULSE_REST) * 1000;
      }

      for (let i = livePulses.length - 1; i >= 0; i--) {
        const p = livePulses[i];
        const dist = ((now - p.t0) / 1000) * PULSE_SPEED;

        if (dist < 0) { // scheduled but not yet departed
          p.circles.forEach(c => { c.style.opacity = '0'; });
          continue;
        }

        if (dist > pulseRoutes[0].len + 4) {
          p.circles.forEach(c => c.remove());
          livePulses.splice(i, 1);
          continue;
        }

        pulseRoutes.forEach((r, j) => {
          const c = p.circles[j];
          if (dist <= r.len) {
            const pt = r.path.getPointAtLength(dist);
            c.setAttribute('cx', pt.x);
            c.setAttribute('cy', pt.y);
            c.style.opacity = '1';
            if (!p.lit[j] && dist > r.len - 14) {
              p.lit[j] = true;
              igniteTag(r.span);
            }
          } else {
            c.style.opacity = '0';
          }
        });
      }
    }

    // Hover pulses heading for an off-page via
    for (let i = linkPulses.length - 1; i >= 0; i--) {
      const lp = linkPulses[i];
      const alive = lp.r.path.isConnected;
      const dist = ((now - lp.t0) / 1000) * LINK_SPEED;
      if (!alive || dist >= lp.len) {
        lp.c.remove();
        linkPulses.splice(i, 1);
        if (alive) dropThrough(lp.r);
        continue;
      }
      const pt = lp.r.path.getPointAtLength(dist);
      lp.c.setAttribute('cx', pt.x);
      lp.c.setAttribute('cy', pt.y);
      lp.c.style.opacity = '1';
    }
    requestAnimationFrame(pulseTick);
  }

  // ---- Link pulses -------------------------------------------------
  // Hovering a link to another page (View Resume, a project card, or
  // the off-page flag itself) sends one quick pulse from the trunk's
  // Y-split along that page's trace; it drops through the via with a
  // flash and a ripple, as if the signal continued on the next page.

  const LINK_SPEED = 620; // px per second — snappier than the trunk trains
  const linkPulses = [];
  const lastLinkPulse = {};

  function sendLinkPulse(key) {
    if (reduceMotion) return;
    const r = linkRoutes[key];
    if (!r || !r.path.isConnected) return;
    const now = performance.now();
    if (now - (lastLinkPulse[key] || 0) < 700) return; // one per hover
    lastLinkPulse[key] = now;
    const len = r.path.getTotalLength();
    if (!len) return;
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('r', 6);
    c.setAttribute('class', 'section-trace-pulse');
    pulseLayer.appendChild(c);
    linkPulses.push({ r, len, t0: now, c });
  }

  function dropThrough(r) {
    const via = r.group.querySelector('.trace-via--link');
    if (via) {
      via.classList.remove('is-hit');
      void via.getBoundingClientRect(); // restart the flash
      via.classList.add('is-hit');
    }
    for (const delay of [0, 160]) {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('cx', r.x);
      ring.setAttribute('cy', r.y);
      ring.setAttribute('r', LINK_VIA_R);
      ring.setAttribute('class', 'trace-ripple');
      ring.style.animationDelay = delay + 'ms';
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
      pulseLayer.appendChild(ring);
    }
  }

  // ---- Rebuild wiring ----------------------------------------------

  function rebuildAll() {
    if (window.innerWidth < 1300) { // matches CSS hide breakpoint
      netGroup.replaceChildren();
      linkRoutes = {};
      return;
    }
    const secs = measureSections();
    if (!secs) return;

    // Center the trunk between the wall and the leftmost content box;
    // cap the jog so even the jogged-out stretch stays in the gutter.
    const minContentLeft = Math.min(...secs.map(s => s.contentLeft));
    trunkX = Math.max(16, Math.round(minContentLeft / 2));
    jogAmp = Math.max(6, Math.min(12, minContentLeft - trunkX - 8));

    const net = updateSectionTrace(secs);
    if (net) {
      buildNetwork(net);
      initPulseRoutes();
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildAll, 150);
  });

  // Re-measure whenever the container's laid-out size changes (images
  // loading, fonts settling) — the safety net the old load/timeout
  // combo was missing. The SVG overlay is inset:0 so redrawing it can
  // never itself resize the container (no feedback loop).
  if ('ResizeObserver' in window) {
    let roTimer = null;
    new ResizeObserver(() => {
      clearTimeout(roTimer);
      roTimer = setTimeout(rebuildAll, 120);
    }).observe(container);
  }

  window.addEventListener('load', rebuildAll);
  rebuildAll();
  setTimeout(rebuildAll, 500); // belt-and-braces after fonts/images settle

  if (!reduceMotion) requestAnimationFrame(pulseTick);

  // The portrait is the circuit's power source — each click sends one
  // more pulse down the wire, additive with whatever is already in
  // flight (it never resets running pulses).
  const portraitFrame = document.querySelector('.profile-pic-frame');
  if (portraitFrame && !reduceMotion) {
    portraitFrame.classList.add('pulse-clickable');
    portraitFrame.title = 'Send a pulse through the circuit';
    portraitFrame.addEventListener('click', () => spawnPulse(performance.now()));
  }

  // Real links to other pages send a pulse to their off-page via.
  document.querySelectorAll('a[onclick*="resume.html"]').forEach((a) => {
    a.addEventListener('mouseenter', () => sendLinkPulse('resume'));
  });
  const CARD_LINKS = ['argus', 'qxq', 'homelab']; // carousel order
  document.querySelectorAll('.wheel-card').forEach((card) => {
    const key = CARD_LINKS[Number(card.dataset.index)];
    if (key) card.addEventListener('mouseenter', () => sendLinkPulse(key));
  });
})();


// =============================================================
// IMAGE PARALLAX
// Subtle scroll-linked drift on timeline photos, updated from a
// single rAF-throttled scroll handler.
// =============================================================

const parallaxImages  = Array.from(document.querySelectorAll('[data-parallax]'));
let   scrollFxTicking = false;

function updateScrollFx() {
  // Drift each photo within its fixed-size frame based on
  // how far its center is from the viewport center. The frame is 30% taller
  // than its box (see .doctimeline-thumb CSS) so this never reveals empty edges.
  const viewportCenter = window.innerHeight / 2;
  parallaxImages.forEach(img => {
    const rect = img.parentElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return; // skip offscreen images
    const elCenter = rect.top + rect.height / 2;
    const delta = (elCenter - viewportCenter) * 0.08;
    const clamped = Math.max(-22, Math.min(22, delta));
    img.style.transform = `translateY(${clamped}px)`;
  });

  scrollFxTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollFxTicking) {
    requestAnimationFrame(updateScrollFx);
    scrollFxTicking = true;
  }
});
window.addEventListener('load', updateScrollFx);
updateScrollFx();


// =============================================================
// IFRAME CONTENT SWITCHER
// Replaces the portfolio sections with an iframe showing
// resume.html or a project page, and restores them on back.
// =============================================================

/**
 * Load an external HTML page into the content iframe,
 * hiding the portfolio sections and showing the back button.
 * @param {string} url - Relative URL to load (e.g. 'resume.html')
 */
function loadExternalContent(url) {
  const portfolioSections = document.getElementById('portfolioSections');
  const externalContent   = document.getElementById('externalContent');
  const contentFrame      = document.getElementById('contentFrame');
  const backButton        = document.getElementById('backButton');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  const mainContent       = document.querySelector('.main-content');

  // Swap visibility
  portfolioSections.classList.add('hidden');
  externalContent.classList.add('active');
  backButton.classList.add('active');
  mainContent.classList.add('viewing-external');

  // Reset any height set for the previous page — the subpage's
  // min-height:100vh tracks the frame, so a stale tall frame would
  // ratchet every following page to the tallest one ever viewed.
  contentFrame.style.height = '';
  contentFrame.src = url;

  // Clear existing active nav state
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  if (url.includes('resume.html')) {
    // Resume view: highlight Resume nav link, show download button
    document.querySelectorAll('a[onclick*="resume.html"]').forEach(link => link.classList.add('active'));

    backButton.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
      Back to Portfolio
    `;
    backButton.setAttribute('data-return-section', 'home');
    downloadResumeBtn.classList.add('active');

  } else if (url.includes('projects/')) {
    // Project page view: highlight Projects nav link, hide download button
    document.querySelectorAll('a[href="#projects"]').forEach(link => link.classList.add('active'));

    backButton.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
      Return to Projects
    `;
    backButton.setAttribute('data-return-section', 'projects');
    downloadResumeBtn.classList.remove('active');
  }

  window.scrollTo(0, 0);

  // Close mobile nav when navigating
  if (window.innerWidth <= 768) {
    document.getElementById('mobileNav').classList.remove('active');
  }
}

/**
 * Dismiss the iframe view and return to the portfolio,
 * scrolling to the section the user came from.
 */
function goBackToPortfolio() {
  const portfolioSections = document.getElementById('portfolioSections');
  const externalContent   = document.getElementById('externalContent');
  const contentFrame      = document.getElementById('contentFrame');
  const backButton        = document.getElementById('backButton');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  const mainContent       = document.querySelector('.main-content');

  const returnSection = backButton.getAttribute('data-return-section') || 'home';

  // Restore portfolio view
  portfolioSections.classList.remove('hidden');
  externalContent.classList.remove('active');
  backButton.classList.remove('active');
  downloadResumeBtn.classList.remove('active');
  mainContent.classList.remove('viewing-external');

  // Clear iframe src to stop any ongoing load
  contentFrame.src = '';

  // Scroll to the originating section after the DOM has re-painted
  setTimeout(() => {
    const target = document.getElementById(returnSection);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, 100);
}

/** Toggle the mobile nav panel open/closed. */
function toggleSidebar() {
  document.getElementById('mobileNav').classList.toggle('active');
}

/**
 * Brand link in the top nav: acts as "return to portfolio + scroll home"
 * while an external page is open, otherwise behaves as a normal #home anchor.
 */
function handleBrandClick(event) {
  if (document.getElementById('externalContent').classList.contains('active')) {
    event.preventDefault();
    goBackToPortfolio();
  }
}


// =============================================================
// ACTIVE NAV LINK ON SCROLL
// Highlights the nav link that corresponds to the section
// currently in view. Skipped when iframe content is active.
// =============================================================

const sections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  // Don't update nav when an iframe page is open
  if (document.getElementById('externalContent').classList.contains('active')) return;

  let current = '';
  const scrollPosition = pageYOffset + 200;

  sections.forEach(section => {
    const sectionTop    = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      current = section.getAttribute('id');
    }
  });

  // Snap to last section when scrolled to the very bottom
  if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
    current = sections[sections.length - 1].getAttribute('id');
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href.substring(1) === current) {
      link.classList.add('active');
    }
  });

  checkTimelineItems();
});

// Close mobile nav when clicking outside of it
document.addEventListener('click', (e) => {
  const mobileNav = document.getElementById('mobileNav');
  const toggle    = document.querySelector('.mobile-menu-toggle');

  if (
    window.innerWidth <= 768 &&
    mobileNav &&
    !mobileNav.contains(e.target) &&
    !toggle.contains(e.target) &&
    mobileNav.classList.contains('active')
  ) {
    mobileNav.classList.remove('active');
  }
});

// Close mobile nav and handle back-navigation when clicking nav links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // Inline onclick links (Resume, home CTA) are handled by their own handler
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes('loadExternalContent')) {
      if (window.innerWidth <= 768) {
        document.getElementById('mobileNav').classList.remove('active');
      }
      return;
    }

    // If an iframe page is open, clicking a nav link returns to portfolio first
    if (document.getElementById('externalContent').classList.contains('active')) {
      e.preventDefault();
      const href          = link.getAttribute('href');
      const targetSection = href ? href.substring(1) : 'home';

      goBackToPortfolio();

      setTimeout(() => {
        const section = document.getElementById(targetSection);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }

    if (window.innerWidth <= 768) {
      document.getElementById('mobileNav').classList.remove('active');
    }
  });
});


// =============================================================
// EXPERIENCE TIMELINE
// Two-column document-style list: each row fades in and its rule
// lights up (via the .visible class) as it scrolls into view.
// =============================================================

const timelineItems = document.querySelectorAll('.doctimeline-item');

/** Mark timeline items visible as they scroll into the viewport. */
function checkTimelineItems() {
  timelineItems.forEach(item => {
    if (item.classList.contains('visible')) return;
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.75) {
      item.classList.add('visible');
    }
  });
}


// =============================================================
// SECTION SCROLL ANIMATIONS
// Fades content sections in as they enter the viewport.
// =============================================================

const contentSections = document.querySelectorAll('.content-section:not(#home)');

function checkSections() {
  contentSections.forEach(section => {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.8) {
      section.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', checkSections);
window.addEventListener('load', checkSections);
checkSections();


// =============================================================
// SKILL BAR ANIMATIONS
// Extends the progress fill bar when a skill category
// scrolls into view (runs once per category via IntersectionObserver).
// =============================================================

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-row').forEach((bar, index) => {
        setTimeout(() => bar.classList.add('animated'), index * 100);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));


// =============================================================
// PROJECT COVERFLOW CAROUSEL
// Flanking cards are visible peeking beside the active one (bold
// 3D depth + rotation), auto-advance, dot navigation, and a synced
// detail panel on the right. The scene clips at its own column
// edge (see .wheel-scene overflow:hidden in CSS), so a flanking
// card can never bleed into the detail panel — the carousel column
// is also given more relative width (see .proj-layout) for room.
// =============================================================
(function () {
  const stage = document.getElementById('wheelStage');
  if (!stage) return; // Guard: only run on pages with the carousel

  const cards   = Array.from(stage.querySelectorAll('.wheel-card'));
  const details = Array.from(document.querySelectorAll('.proj-detail'));
  const dots    = Array.from(document.querySelectorAll('.proj-dot'));
  const btnPrev = document.getElementById('projPrev');
  const btnNext = document.getElementById('projNext');
  const scene   = document.getElementById('wheelScene');

  const TOTAL      = cards.length;
  const AUTO_DELAY = 3500; // ms between auto-advances

  // Coverflow depth constants — bolder than a subtle carousel on purpose
  const FLANK_Z       = -260;  // translateZ for non-active cards (px)
  const FLANK_ROT     = 52;    // rotateY for non-active cards (deg)
  const FLANK_SCALE   = 0.8;   // scale for non-active cards
  const FLANK_OPACITY = 0.62;  // opacity for non-active cards — visible, not washed out
  const BACK_OPACITY  = 0;     // cards further back are fully hidden

  let current   = 0;
  let autoTimer = null;

  const flankX = () => cards[0].offsetWidth * 0.68; // horizontal offset for flanking cards

  /** Apply transform/opacity/zIndex to every card based on current index. */
  function render() {

    cards.forEach((card, i) => {
      // Relative position: 0 = active, negative = left, positive = right
      let rel = i - current;
      if (rel >  Math.floor(TOTAL / 2)) rel -= TOTAL;
      if (rel < -Math.floor(TOTAL / 2)) rel += TOTAL;

      let tx, tz, ry, scale, opacity, zIndex;

      if (rel === 0) {
        // Active card — front and center
        tx = 0; tz = 0; ry = 0;
        scale = 1; opacity = 1; zIndex = 10;
        card.classList.add('is-active');
      } else if (rel === -1) {
        // Left flanking card
        tx = -flankX(); tz = FLANK_Z; ry = FLANK_ROT;
        scale = FLANK_SCALE; opacity = FLANK_OPACITY; zIndex = 5;
        card.classList.remove('is-active');
      } else if (rel === 1) {
        // Right flanking card
        tx = flankX(); tz = FLANK_Z; ry = -FLANK_ROT;
        scale = FLANK_SCALE; opacity = FLANK_OPACITY; zIndex = 5;
        card.classList.remove('is-active');
      } else {
        // Back card — hidden behind the active card
        tx = 0; tz = FLANK_Z * 2; ry = 0;
        scale = 0.6; opacity = BACK_OPACITY; zIndex = 1;
        card.classList.remove('is-active');
      }

      card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
      card.style.opacity   = opacity;
      card.style.zIndex    = zIndex;
    });

    // Sync dot indicators
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Show matching detail panel
    details.forEach(d => {
      d.classList.toggle('is-visible', +d.dataset.detail === current);
    });
  }

  /** Navigate to a specific card index (wraps around). */
  function goTo(index) {
    current = ((index % TOTAL) + TOTAL) % TOTAL;
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Arrow and dot click handlers — restart auto-advance after manual interaction
  btnNext.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
  btnPrev.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
  dots.forEach(d => d.addEventListener('click', () => {
    goTo(+d.dataset.index); stopAuto(); startAuto();
  }));

  /**
   * URLs for each project card, index-matched.
   * Use null for cards that don't yet have a page (e.g. WIP).
   */
  const PROJECT_URLS = [
    'projects/Project-Argus.html',
    'projects/QxQ.html',
    'projects/Home-Infrastructure.html'
  ];

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== current) {
        // Flanking card clicked: bring it to center
        goTo(i); stopAuto(); startAuto();
      } else {
        // Active card clicked: navigate to project page if available
        const url = PROJECT_URLS[i];
        if (url) loadExternalContent(url);
      }
    });
  });

  // Pause auto-advance while hovering the carousel
  scene.addEventListener('mouseenter', stopAuto);
  scene.addEventListener('mouseleave', startAuto);

  // Initialize once fonts/images are loaded so flankX() is accurate
  window.addEventListener('load', () => {
    goTo(0);
    startAuto();
  });

  window.addEventListener('resize', () => {
    render();
  });

  // Also initialize the timeline alongside the carousel
  window.addEventListener('load', checkTimelineItems);
  window.addEventListener('scroll', checkTimelineItems);
})();


// =============================================================
// IFRAME AUTO-RESIZE
// Listens for postMessage height reports from pages loaded
// in the content iframe and resizes the frame to fit.
// =============================================================
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'iframeHeight') {
    const frame = document.getElementById('contentFrame');
    if (frame) frame.style.height = e.data.height + 'px';
  }
});


// =============================================================
// POWER TOGGLE (theme)
// The nav's power button toggles html.dark, which flips the whole
// stone color ramp in CSS — a real theme swap, NOT a filter
// inversion, so images are never altered. A transient .theme-fade
// class makes the swap ease instead of hard-cutting. The theme is
// mirrored into the content iframe (same-origin) so external pages
// like the resume follow along. Persisted per browser.
// =============================================================
(function () {
  const btn = document.getElementById('powerToggle');
  if (!btn) return;

  const KEY  = 'siteTheme';
  const root = document.documentElement;

  function syncFrame() {
    const frame = document.getElementById('contentFrame');
    if (!frame) return;
    const dark = root.classList.contains('dark');
    try {
      if (frame.contentDocument) {
        frame.contentDocument.documentElement.classList.toggle('dark', dark);
      }
    } catch (e) { /* cross-origin frame — postMessage below covers it */ }
    try {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'siteTheme', dark }, '*');
      }
    } catch (e) { /* frame not ready */ }
  }

  if (localStorage.getItem(KEY) === 'dark') root.classList.add('dark');

  const frame = document.getElementById('contentFrame');
  if (frame) frame.addEventListener('load', syncFrame);

  let fadeTimer = null;
  btn.addEventListener('click', () => {
    root.classList.add('theme-fade');
    const dark = root.classList.toggle('dark');
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
    syncFrame();
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 650);
  });

  // RST — reboot: back to the top and reload, which replays the BIOS
  // boot sequence (it runs on every load).
  const rst = document.getElementById('resetButton');
  if (rst) {
    rst.addEventListener('click', () => {
      window.scrollTo(0, 0);
      location.reload();
    });
  }
})();


// =============================================================
// FOOTER TITLE BLOCK — REV
// Shows the page's last-modified month (GitHub Pages sends it
// with each deploy), so the revision updates itself. Keeps the
// hardcoded fallback if the date can't be read.
// =============================================================
(function setTitleBlockRev() {
  const el = document.getElementById('titleBlockRev');
  if (!el) return;
  const d = new Date(document.lastModified);
  if (isNaN(d)) return;
  el.textContent = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0');
})();
