// ── Mobile menu toggle ───────────────────────────────────────────
  function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    const isOpen = navLinks.classList.toggle('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  // ── Keyboard activation for hamburger ────────────────────────────
  const hamburgerEl = document.getElementById('hamburger');
  if (hamburgerEl) {
    hamburgerEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
    });
  }

  // ── Close menu on Escape key ─────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const navLinks = document.getElementById('navLinks');
      const hamburger = document.getElementById('hamburger');
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ── Scroll-triggered fade-in animations ─────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── Stagger children of fade-in elements ────────────────────────
  const staggerCards = document.querySelectorAll('.steps-grid .step-card, .products-grid .product-card, .sectors-grid .sector-card, .trust-grid .trust-card');
  staggerCards.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── Smooth nav close on link click (mobile) ──────────────────────
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      const hamburger = document.getElementById('hamburger');
      if (navLinks) navLinks.classList.remove('open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Service worker registration (with auto-unregister on version bump) ─────────────────────────────────
  const APP_VERSION = '6'; // bump this when deploying new updates

  function ensureLatestServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    const stored = sessionStorage.getItem('crowagentAppVersion');
    if (stored && stored !== APP_VERSION) {
      // New version detected: clear the service worker and force reload.
      sessionStorage.setItem('crowagentAppVersion', APP_VERSION);
      navigator.serviceWorker.getRegistrations().then(regs => {
        return Promise.all(regs.map(r => r.unregister()));
      }).then(() => {
        console.log('Old service workers unregistered; reloading to get latest assets.');
        window.location.reload(true);
      });
      return;
    }

    sessionStorage.setItem('crowagentAppVersion', APP_VERSION);

    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }

  ensureLatestServiceWorker();
