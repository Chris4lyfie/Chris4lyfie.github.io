// =============================================================
// PORTFOLIO — main.js
// Handles: iframe content loading, navigation state,
//          sidebar toggle, timeline animation, skill bar
//          animation, and the project coverflow carousel.
// =============================================================


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

  contentFrame.src = url;

  // Clear existing active nav state
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  if (url.includes('resume.html')) {
    // Resume view: highlight Resume nav link, show download button
    const resumeLink = document.querySelector('a[onclick*="resume.html"]');
    if (resumeLink) resumeLink.classList.add('active');

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
    const projectsLink = document.querySelector('a[href="#projects"]');
    if (projectsLink) projectsLink.classList.add('active');

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

  // Close sidebar on mobile when navigating
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
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

/** Toggle the mobile sidebar open/closed. */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
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

// Close sidebar when clicking outside of it on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.querySelector('.mobile-menu-toggle');

  if (
    window.innerWidth <= 768 &&
    !sidebar.contains(e.target) &&
    !toggle.contains(e.target) &&
    sidebar.classList.contains('active')
  ) {
    sidebar.classList.remove('active');
  }
});

// Close sidebar and handle back-navigation when clicking nav links on mobile
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // Inline onclick links (Resume, home CTA) are handled by their own handler
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes('loadExternalContent')) {
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
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
      document.getElementById('sidebar').classList.remove('active');
    }
  });
});


// =============================================================
// EXPERIENCE TIMELINE
// Animates timeline items and the connecting line segments
// as they scroll into view.
// =============================================================

const timelineItems       = document.querySelectorAll('.timeline-item');
const timelineLineWrapper = document.querySelector('.timeline-line-wrapper');
const startEndpoint       = document.querySelector('.timeline-endpoint.start');
const endEndpoint         = document.querySelector('.timeline-endpoint.end');

/**
 * Build animated line segments between each timeline dot.
 * Called once on load (and on resize) after the layout is known.
 */
function createTimelineSegments() {
  if (!timelineLineWrapper || timelineItems.length === 0) return;

  const wrapperRect = timelineLineWrapper.getBoundingClientRect();

  // Helper: get the horizontal center of an element relative to the wrapper
  const centerX = el => {
    const r = el.getBoundingClientRect();
    return r.left - wrapperRect.left + r.width / 2;
  };

  const startPos = centerX(startEndpoint);
  const endPos   = centerX(endEndpoint);

  // Collect dot positions
  const dots = Array.from(timelineItems).map(item => ({
    left: centerX(item.querySelector('.timeline-dot'))
  }));

  // Helper: create and append one segment div
  const addSegment = (key, left, maxWidth) => {
    const seg = document.createElement('div');
    seg.className = `timeline-segment timeline-segment-${key}`;
    seg.setAttribute('data-segment', key);
    seg.style.left     = left + 'px';
    seg.style.maxWidth = maxWidth + 'px';
    timelineLineWrapper.appendChild(seg);
  };

  // Segment from the start endpoint to the first dot
  if (dots.length > 0) {
    addSegment('start', startPos, dots[0].left - startPos);
  }

  // Segments between consecutive dots
  for (let i = 0; i < dots.length - 1; i++) {
    addSegment(i, dots[i].left, dots[i + 1].left - dots[i].left);
  }

  // Segment from the last dot to the end endpoint
  if (dots.length > 0) {
    addSegment('end', dots[dots.length - 1].left, endPos - dots[dots.length - 1].left);
  }
}

/**
 * Trigger the visible animation on timeline items as they
 * scroll into the viewport, and extend the connecting line segments.
 */
function checkTimelineItems() {
  timelineItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.5) {
      setTimeout(() => {
        item.classList.add('visible');

        // Animate the line segment leading up to this dot
        const segKey = index === 0 ? 'start' : index - 1;
        const seg    = document.querySelector(`.timeline-segment-${segKey}`);
        if (seg) seg.style.width = seg.style.maxWidth;

        // After the last item, extend the trailing end segment
        if (index === timelineItems.length - 1) {
          setTimeout(() => {
            const endSeg = document.querySelector('.timeline-segment-end');
            if (endSeg) endSeg.style.width = endSeg.style.maxWidth;
          }, 500);
        }
      }, index * 500);
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
      entry.target.querySelectorAll('.skill-tag-bar').forEach((bar, index) => {
        setTimeout(() => bar.classList.add('animated'), index * 100);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));


// =============================================================
// PROJECT COVERFLOW CAROUSEL
// 3-card coverflow with auto-advance, dot navigation,
// and a synced detail panel on the right.
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

  // Coverflow perspective constants
  const FLANK_Z       = -200;  // translateZ for non-active cards (px)
  const FLANK_ROT     = 40;    // rotateY for non-active cards (deg)
  const FLANK_SCALE   = 0.80;  // scale for non-active cards
  const FLANK_OPACITY = 0.5;   // opacity for non-active cards

  let current   = 0;
  let autoTimer = null;

  // Helpers
  const cardW  = () => cards[0].offsetWidth;
  const cardH  = () => cards[0].offsetHeight;
  const flankX = () => cardW() * 0.68; // horizontal offset for flanking cards

  /**
   * Set absolute centering via marginTop/marginLeft.
   * Cards use top:50% + negative margin so translateY is never
   * needed during rotation transitions (prevents vertical jumps).
   */
  function initPositions() {
    cards.forEach(card => {
      card.style.top        = '50%';
      card.style.left       = '50%';
      card.style.marginTop  = `-${cardH() / 2}px`;
      card.style.marginLeft = `-${cardW() / 2}px`;
    });
  }

  /** Apply transform/opacity/zIndex to every card based on current index. */
  function render() {
    // Re-sync margins in case card dimensions changed (e.g. on resize)
    cards.forEach(card => {
      card.style.marginTop  = `-${cardH() / 2}px`;
      card.style.marginLeft = `-${cardW() / 2}px`;
    });

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
      } else if (rel < 0) {
        // Left flanking card
        tx = -flankX(); tz = FLANK_Z; ry = FLANK_ROT;
        scale = FLANK_SCALE; opacity = FLANK_OPACITY; zIndex = 5;
        card.classList.remove('is-active');
      } else {
        // Right flanking card
        tx = flankX(); tz = FLANK_Z; ry = -FLANK_ROT;
        scale = FLANK_SCALE; opacity = FLANK_OPACITY; zIndex = 5;
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
    'projects/QxQ.html',
    'projects/Home-Infrastructure.html',
    null  // EnkiNotes — in progress
  ];

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== current) {
        // Non-active card clicked: bring it to center
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

  // Initialize once fonts/images are loaded so cardH() is accurate
  window.addEventListener('load', () => {
    initPositions();
    goTo(0);
    startAuto();
  });

  window.addEventListener('resize', () => {
    initPositions();
    render();
  });

  // Also initialize the timeline alongside the carousel
  window.addEventListener('load', () => {
    createTimelineSegments();
    checkTimelineItems();
  });
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