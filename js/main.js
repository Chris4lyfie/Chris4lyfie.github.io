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
// 2. A decorative trace network in the left margin gutter only:
//    hand-authored clusters of lines entering from the left page
//    edge, Y-merging into the trunk through 45-degree diagonals,
//    with filled-dot / hollow-pad terminals. Every junction in
//    the whole layer is a Y (45-degree fork) — no perpendicular
//    T connectors and no 90-degree corners anywhere. Placement
//    is deterministic (seeded PRNG) so it doesn't reshuffle on
//    every resize.
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

  /** Vertical twin of treeBus — twigs run south, parallel to the bus. */
  function treeBusV(x, y0, y1, specs) {
    const lines = [];
    let lastY = y0;
    const lastEnd = { '-1': -Infinity, '1': -Infinity };
    for (const t of specs || []) {
      const ty  = Math.round(y0 + (y1 - y0) * t.at);
      const len = Math.round(t.len);
      if (ty < lastY + 8 || ty + FORK > y1 - 10 || len < 22) continue;
      if (ty < lastEnd[t.side] + 14) continue; // same-side lane still occupied
      lastY = ty + FORK;
      lastEnd[t.side] = ty + FORK + len;
      const ax  = x + t.side * FORK;
      const sub = treeBusV(ax, ty + FORK, ty + FORK + len, t.nest);
      lines.push({
        d: `M ${x} ${ty} L ${ax} ${ty + FORK} ${sub.d}`,
        ex: ax, ey: ty + FORK + len, hollow: !!t.hollow,
      });
      sub.lines.forEach(l => lines.push(l));
    }
    return { d: `M ${x} ${y0} V ${y1}`, lines };
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
    const W       = container.clientWidth;
    const pf      = document.querySelector('.profile-pic-frame');
    const contentTop = Math.min(pf ? absPos(pf).y : p1.y, p1.y - 20) - 16;

    // The top band tree departs the PORTRAIT'S OWN LEAD, immediately
    // after the portrait (user request) — a Y-split on the lead's
    // vertical run, fanning right into the whitespace above the
    // masthead. Its Y sits in the content-free band between the
    // crossing and the top of the content.
    const fkA = (contentTop - crossY > 96 && W - 70 - (p0.x + FORK) > 220)
      ? Math.round(crossY + (contentTop - crossY) * 0.55)
      : null;

    // Portrait lead — up from the "+" terminal (through the fkA
    // Y-split when present), across the page at a fixed Y inside
    // Home's top padding (above all content), then a 45-degree corner
    // down into the trunk. The crossing Y is absolute, not a
    // midpoint, so it can never land at content height.
    const leadPieces = [`M ${p0.x} ${p0.y}`];
    if (fkA !== null) {
      leadPieces.push(
        `V ${fkA + FORK}`,
        `L ${p0.x + FORK} ${fkA}`, // Y-split apex — the tree bus departs east
        `L ${p0.x} ${fkA - FORK}`,
      );
    }
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

    // Decorative fork Ys (v6 wiring): band clusters in the whitespace
    // bands between the tiles plus tall gutter trees beside Home and
    // Experience that fill most of the free vertical space (the top
    // tree lives on the portrait lead — see fkA above). Registered in
    // top-to-bottom order; each is only forked off the trunk if its
    // cluster has real room, so the trunk never carries a stub fork
    // with no arm. Arms are drawn by buildNetwork from decoForks.
    const expSec = secs.find(s => s.id === 'experience');
    const armX0  = trunkX + FORK; // every trunk arm starts at its fork's apex

    const fkB = homeSec.bottom - 24;
    const fkC = projectsTop - 36;
    const fkD = fkB - p1.y > 320 ? p1.y + 90 : null;   // Home gutter — spans down to the fkB band
    const fkE = fkC - p2.y > 380 ? p2.y + 110 : null;  // Experience gutter — spans down to the fkC band

    // Twig specs for the U-branch buses — the tag connections are part
    // of the tree too: one clean departing twig when the branch is
    // long enough, a second only on genuinely long runs (treeBus
    // drops any twig that can't fit).
    const twigLines = [];
    const branchTwigs = (len, flip) => {
      const specs = [];
      if (len >= 150) specs.push({ at: 0.40, side: flip ? 1 : -1, len: len * 0.30 });
      if (len >= 260) specs.push({ at: 0.68, side: flip ? -1 : 1, len: len * 0.18, hollow: true });
      return specs;
    };

    if (fkA !== null) {
      // Lead-attached tree: bus starts at the Y-split apex on the
      // portrait lead (drawn with leadIn) and fans right.
      decoForks.push({ kind: 'band', y: fkA, x0: p0.x + FORK, limit: W - 70, variant: 'A', busRing: true });
    }

    runTo(p1.y - FORK);
    const len1  = p1.x - 6 - armX0;
    const tree1 = treeBus(armX0, p1.y, p1.x - 6, branchTwigs(len1, false));
    const routeU1 = `${chain.join(' ')} L ${armX0} ${p1.y} ${tree1.d}`;
    tapAt(p1.y, tree1.d);
    tree1.lines.forEach(l => twigLines.push({ ...l, dark: false }));

    // Gutter trees sit on BOTH sides of the trunk for variety: the
    // Home one hangs in the left margin when there's room (falls back
    // to the right), the Experience one prefers the right gutter.
    if (fkD !== null) {
      const dirD = trunkX >= 56 ? -1 : (homeSec.contentLeft - 24 - armX0 > 96 ? 1 : 0);
      if (dirD !== 0) {
        runTo(fkD);
        decoForks.push({ kind: 'gutter', y: fkD, dir: dirD, stemLen: fkB - 70 - fkD });
      }
    }

    runTo(fkB - FORK);
    tapAt(fkB, null);
    decoForks.push({ kind: 'band', y: fkB, limit: W - 70, variant: 'B', busRing: false });

    runTo(p2.y - FORK);
    const len2  = p2.x - 6 - armX0;
    const tree2 = treeBus(armX0, p2.y, p2.x - 6, branchTwigs(len2, true));
    const routeU2 = `${chain.join(' ')} L ${armX0} ${p2.y} ${tree2.d}`;
    tapAt(p2.y, tree2.d);
    tree2.lines.forEach(l => twigLines.push({ ...l, dark: false }));

    if (fkE !== null) {
      const dirE = expSec.contentLeft - 24 - armX0 > 96 ? 1 : (trunkX >= 56 ? -1 : 0);
      if (dirE !== 0) {
        runTo(fkE);
        decoForks.push({ kind: 'gutter', y: fkE, dir: dirE, stemLen: fkC - 70 - fkE });
      }
    }

    runTo(fkC - FORK);
    tapAt(fkC, null);
    decoForks.push({ kind: 'band', y: fkC, limit: W - 70, variant: 'C', busRing: true });

    runTo(projectsTop);

    // U3 finish: straight drop inside the dark band, then a terminal
    // 45-degree bend into the branch — the trunk ends here, so this is
    // a corner, not a fork, and stays exempt from the split rule. The
    // branch bus is a tree limb like U1/U2's (white twigs, drawn by
    // buildNetwork from twigLines).
    const bend   = 10;
    const runEnd = p3.y - bend;
    runs.push({ x: trunkX, y1: projectsTop, y2: runEnd });
    const len3  = p3.x - 6 - (trunkX + bend);
    const tree3 = treeBus(trunkX + bend, p3.y, p3.x - 6,
      len3 < 90 ? [] : [{ at: 0.45, side: 1, len: len3 * 0.3 }]);
    const trunkBelow = `M ${trunkX} ${projectsTop} V ${runEnd} L ${trunkX + bend} ${p3.y} ${tree3.d}`;
    tree3.lines.forEach(l => twigLines.push({ ...l, dark: true }));
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

    return { decoForks, twigLines };
  }

  // ---- Decorative network (v6) --------------------------------------

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

  // Tree terminals get the reference image's fatter dots.
  const TREE_DOT  = 4.2;
  const TREE_RING = 4.6;

  /**
   * Twig specs per band-cluster variant, given the bus length L —
   * hand-tuned to echo the reference image's staircase fans (nested
   * twigs step the same direction; opposite-side singles for balance).
   * Sides are chosen so nothing pokes past the whitespace band each
   * cluster lives in.
   */
  function bandTreeSpecs(variant, L) {
    if (variant === 'A') return [
      { at: 0.26, side: -1, len: L * 0.50, nest: [{ at: 0.25, side: -1, len: L * 0.30 }] },
      { at: 0.60, side: 1,  len: L * 0.30, hollow: true },
    ];
    if (variant === 'B') return [
      { at: 0.20, side: 1,  len: L * 0.42, nest: [{ at: 0.30, side: 1, len: L * 0.22 }] },
      { at: 0.50, side: -1, len: L * 0.34 },
      { at: 0.72, side: 1,  len: L * 0.20, hollow: true },
    ];
    return [ // 'C' — sits just above the dark boundary; nested fan goes down (still light)
      { at: 0.24, side: 1,  len: L * 0.42, nest: [{ at: 0.30, side: 1, len: L * 0.20 }] },
      { at: 0.56, side: -1, len: L * 0.30, hollow: true },
    ];
  }

  /**
   * Band cluster: a trace tree fanning into the whitespace band. The
   * root trace departs the trunk on a 45-degree diagonal (the trunk
   * runs straight through — reference-style junction, no notch, no
   * junction dot) and the twigs run long and parallel with fat
   * terminal dots, like the reference image.
   */
  function drawBandTree(frag, fk, x0) {
    const L  = Math.round((fk.limit - x0) * 0.8);
    const x1 = x0 + L;
    const bus = treeBus(x0, fk.y, x1, bandTreeSpecs(fk.variant, L));
    // Bus starts at the trunk tap's apex — the Y-split junction
    // itself is drawn with the main trace (tapAt).
    frag.appendChild(netLine(bus.d, false));
    frag.appendChild(netPad(x1, fk.y, fk.busRing, false, fk.busRing ? TREE_RING : TREE_DOT));
    for (const tw of bus.lines) {
      frag.appendChild(netLine(tw.d, false));
      frag.appendChild(netPad(tw.ex, tw.ey, tw.hollow, false, tw.hollow ? TREE_RING : TREE_DOT));
    }
  }

  /**
   * Gutter cluster: a VERTICAL tree, now as substantial as the
   * horizontal band trees. The root trace departs the trunk at 45
   * degrees (to `fk.dir`: -1 = into the left margin, +1 = right
   * gutter) and runs straight down parallel to it; two twigs
   * staircase further outward, also vertical, ending in fat dots —
   * the reference image rotated a quarter turn.
   */
  function drawGutterTree(frag, fk) {
    const dir   = fk.dir;
    const stem  = fk.stemLen;
    const rootX = trunkX + dir * FORK;
    const vTop  = fk.y + FORK;
    const vBot  = fk.y + stem;
    // Twig spans are sized/spaced so same-side runs can never touch
    // (treeBusV enforces it as a hard guarantee regardless).
    const specs = stem > 120
      ? [
          { at: 0.16, side: dir, len: Math.min(stem * 0.34, 420), hollow: true,
            nest: stem > 200 ? [{ at: 0.30, side: dir, len: Math.min(stem * 0.18, 200) }] : undefined },
          { at: 0.62, side: dir, len: Math.min(stem * 0.26, 340) },
        ]
      : stem > 70 ? [{ at: 0.30, side: dir, len: stem * 0.45, hollow: true }] : [];
    const vbus = treeBusV(rootX, vTop, vBot, specs);
    frag.appendChild(netLine(`M ${trunkX} ${fk.y} L ${rootX} ${vTop} ${vbus.d}`, false));
    frag.appendChild(netPad(rootX, vBot, false, false, TREE_DOT));
    for (const tw of vbus.lines) {
      frag.appendChild(netLine(tw.d, false));
      frag.appendChild(netPad(tw.ex, tw.ey, tw.hollow, false, tw.hollow ? TREE_RING : TREE_DOT));
    }
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

  /**
   * v6 decorative wiring — sparse trace trees contained inside the
   * page: band trees fanning through the whitespace between the
   * tiles, gutter trees with vertical buses beside Home/Experience,
   * the twig lines belonging to the U1/U2/U3 branch buses, and the
   * ground symbol under the portrait's negative terminal. Every
   * cluster grows out of a rotated symmetric Y-fork on the trunk (the
   * fork itself is drawn with the main trace; arms start at its apex).
   */
  function buildNetwork(net) {
    netGroup.replaceChildren();
    const frag = document.createDocumentFragment();
    const x0 = trunkX + FORK; // every fork's apex X

    for (const fk of net.decoForks) {
      // Band trees usually root on the trunk; the fkA tree roots on
      // the portrait lead instead and carries its own x0.
      if (fk.kind === 'band') drawBandTree(frag, fk, fk.x0 || x0);
      else drawGutterTree(frag, fk);
    }

    // Twigs departing the U1/U2/U3 branch buses (the buses themselves
    // are part of the main trace paths).
    for (const tw of net.twigLines) {
      frag.appendChild(netLine(tw.d, tw.dark));
      frag.appendChild(netPad(tw.ex, tw.ey, tw.hollow, tw.dark, tw.hollow ? TREE_RING : TREE_DOT));
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
    requestAnimationFrame(pulseTick);
  }

  // ---- Rebuild wiring ----------------------------------------------

  function rebuildAll() {
    if (window.innerWidth < 1300) { // matches CSS hide breakpoint
      netGroup.replaceChildren();
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
    'projects/Home-Infrastructure.html',
    null  // EnkiNotes — in progress
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