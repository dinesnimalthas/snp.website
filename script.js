/* ── Reveal on scroll ── */
const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px'
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 50, 250)}ms`;
  revealObserver.observe(item);
});

/* Fallback: reveal anything in the viewport even if IntersectionObserver
   never fires (e.g. background/inactive tab). Guarantees content is never
   stuck invisible. */
function revealInView() {
  revealItems.forEach((item) => {
    if (item.classList.contains('show')) return;
    const r = item.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
      item.classList.add('show');
    }
  });
}
window.addEventListener('load', revealInView);
window.addEventListener('scroll', revealInView, { passive: true });
revealInView();

/* ── Scroll progress bar ── */
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ── Header scroll style ── */
const header = document.querySelector('.site-header');
function updateHeader() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateHeader, { passive: true });

/* ── Cursor glow (desktop only) ── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function animateCursor() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('.site-header nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // Close nav on link click
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
      document.body.style.overflow = '';
    });
  });
}

/* ── Footer year ── */
const year = document.getElementById('year');
if (year) year.textContent = `\u00a9 ${new Date().getFullYear()} SNP Performance`;

/* \u2500\u2500 Animated stat counters \u2500\u2500 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const statValues = document.querySelectorAll('.stat-value');

function animateCount(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = match[2];
  if (prefersReducedMotion || target === 0) { el.textContent = target + suffix; return; }

  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

statValues.forEach((el) => statObserver.observe(el));

/* \u2500\u2500 Scroll spy (active nav link) \u2500\u2500 */
const navLinks = Array.from(document.querySelectorAll('.site-header nav a'));
const spySections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (spySections.length) {
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) =>
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
        );
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  spySections.forEach((section) => spyObserver.observe(section));
}

/* \u2500\u2500 Back to top \u2500\u2500 */
const toTop = document.getElementById('toTop');
if (toTop) {
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* \u2500\u2500 Lightbox \u2500\u2500 */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const zoomables = document.querySelectorAll('.media-card.zoomable');

if (lightbox && lightboxImg) {
  let lastFocused = null;

  const openLightbox = (src, alt) => {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.removeAttribute('src');
    }, 300);
    if (lastFocused) lastFocused.focus();
  };

  zoomables.forEach((card) => {
    const full = card.getAttribute('data-full');
    const img = card.querySelector('img');
    card.addEventListener('click', () => openLightbox(full, img ? img.alt : ''));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

/* ── Premium interaction FX (desktop / fine pointer only) ── */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer && !prefersReducedMotion) {
  // Cursor-follow glow on spotlight + gallery cards
  document.querySelectorAll('.spotlight, .media-card.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });

  // 3D tilt
  document.querySelectorAll('.tilt').forEach((el) => {
    const max = parseFloat(el.dataset.tiltMax) || 6;
    let raf = null;
    el.addEventListener('mouseenter', () => el.classList.add('tilting'));
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(1.02)`;
      });
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      el.classList.remove('tilting');
      el.style.transform = '';
    });
  });

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.classList.add('magnetic-active');
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      el.classList.remove('magnetic-active');
      el.style.transform = '';
    });
  });
}

