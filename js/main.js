// Content replacement functions
function loadExternalContent(url) {
  const portfolioSections = document.getElementById('portfolioSections');
  const externalContent = document.getElementById('externalContent');
  const contentFrame = document.getElementById('contentFrame');
  const backButton = document.getElementById('backButton');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  const mainContent = document.querySelector('.main-content');
  
  portfolioSections.classList.add('hidden');
  externalContent.classList.add('active');
  backButton.classList.add('active');
  mainContent.classList.add('viewing-external');
  
  contentFrame.src = url;
  
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  if (url.includes('resume.html')) {
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
  
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

function goBackToPortfolio() {
  const portfolioSections = document.getElementById('portfolioSections');
  const externalContent = document.getElementById('externalContent');
  const contentFrame = document.getElementById('contentFrame');
  const backButton = document.getElementById('backButton');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  const mainContent = document.querySelector('.main-content');
  
  const returnSection = backButton.getAttribute('data-return-section') || 'home';
  
  portfolioSections.classList.remove('hidden');
  externalContent.classList.remove('active');
  backButton.classList.remove('active');
  downloadResumeBtn.classList.remove('active');
  mainContent.classList.remove('viewing-external');
  
  contentFrame.src = '';
  
  const targetSection = document.getElementById(returnSection);
  if (targetSection) {
    setTimeout(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  } else {
    window.scrollTo(0, 0);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

// Update active nav link on scroll
const sections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  const externalContent = document.getElementById('externalContent');
  if (externalContent.classList.contains('active')) {
    return;
  }
  
  let current = '';
  const scrollPosition = pageYOffset + 200;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      current = section.getAttribute('id');
    }
  });

  if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
    current = sections[sections.length - 1].getAttribute('id');
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    const linkHref = link.getAttribute('href');
    if (linkHref && linkHref.substring(1) === current) {
      link.classList.add('active');
    }
  });

  updateTimelineProgress();
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.mobile-menu-toggle');
  
  if (window.innerWidth <= 768 && 
      !sidebar.contains(e.target) && 
      !toggle.contains(e.target) && 
      sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }
});

// Close sidebar when clicking nav links on mobile
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes('loadExternalContent')) {
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
      }
      return;
    }
    
    const externalContent = document.getElementById('externalContent');
    if (externalContent.classList.contains('active')) {
      e.preventDefault();
      
      const href = link.getAttribute('href');
      const targetSection = href ? href.substring(1) : 'home';
      
      goBackToPortfolio();
      
      setTimeout(() => {
        const section = document.getElementById(targetSection);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
    
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('active');
    }
  });
});

// Timeline functions
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineLineWrapper = document.querySelector('.timeline-line-wrapper');
const startEndpoint = document.querySelector('.timeline-endpoint.start');
const endEndpoint = document.querySelector('.timeline-endpoint.end');

function createTimelineSegments() {
  if (!timelineLineWrapper || timelineItems.length === 0) return;
  
  const wrapperRect = timelineLineWrapper.getBoundingClientRect();
  const startRect = startEndpoint.getBoundingClientRect();
  const startPos = startRect.left - wrapperRect.left + (startRect.width / 2);
  const endRect = endEndpoint.getBoundingClientRect();
  const endPos = endRect.left - wrapperRect.left + (endRect.width / 2);
  
  const dots = [];
  timelineItems.forEach((item) => {
    const dot = item.querySelector('.timeline-dot');
    if (dot) {
      const rect = dot.getBoundingClientRect();
      dots.push({
        left: rect.left - wrapperRect.left + (rect.width / 2)
      });
    }
  });
  
  if (dots.length > 0) {
    const segment = document.createElement('div');
    segment.className = 'timeline-segment timeline-segment-start';
    segment.setAttribute('data-segment', 'start');
    segment.style.left = startPos + 'px';
    segment.style.maxWidth = (dots[0].left - startPos) + 'px';
    timelineLineWrapper.appendChild(segment);
  }
  
  for (let i = 0; i < dots.length - 1; i++) {
    const segment = document.createElement('div');
    segment.className = `timeline-segment timeline-segment-${i}`;
    segment.setAttribute('data-segment', i);
    segment.style.left = dots[i].left + 'px';
    segment.style.maxWidth = (dots[i + 1].left - dots[i].left) + 'px';
    timelineLineWrapper.appendChild(segment);
  }
  
  if (dots.length > 0) {
    const segment = document.createElement('div');
    segment.className = 'timeline-segment timeline-segment-end';
    segment.setAttribute('data-segment', 'end');
    segment.style.left = dots[dots.length - 1].left + 'px';
    segment.style.maxWidth = (endPos - dots[dots.length - 1].left) + 'px';
    timelineLineWrapper.appendChild(segment);
  }
}

function updateTimelineProgress() {
  // Placeholder for consistency
}

function checkTimelineItems() {
  timelineItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    if (rect.top < windowHeight * 0.5) {
      setTimeout(() => {
        item.classList.add('visible');
        
        if (index === 0) {
          const segment = document.querySelector('.timeline-segment-start');
          if (segment) {
            segment.style.width = segment.style.maxWidth;
          }
        } else {
          const segment = document.querySelector(`.timeline-segment-${index - 1}`);
          if (segment) {
            segment.style.width = segment.style.maxWidth;
          }
        }
        
        if (index === timelineItems.length - 1) {
          setTimeout(() => {
            const endSegment = document.querySelector('.timeline-segment-end');
            if (endSegment) {
              endSegment.style.width = endSegment.style.maxWidth;
            }
          }, 500);
        }
      }, index * 500);
    }
  });
}

// Initialize on load
window.addEventListener('load', () => {
  createTimelineSegments();
  checkTimelineItems();
});

window.addEventListener('scroll', checkTimelineItems);
window.addEventListener('load', () => {
  checkTimelineItems();
  updateTimelineProgress();
});

checkTimelineItems();
updateTimelineProgress();

// Animate sections on scroll
const contentSections = document.querySelectorAll('.content-section:not(#home)');

function checkSections() {
  contentSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    if (rect.top < windowHeight * 0.8) {
      section.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', checkSections);
window.addEventListener('load', checkSections);
checkSections();

// Animate skill bars when they come into view
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const skillBars = entry.target.querySelectorAll('.skill-tag-bar');
      skillBars.forEach((bar, index) => {
        setTimeout(() => {
          bar.classList.add('animated');
        }, index * 100);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(category => {
  skillObserver.observe(category);
});
