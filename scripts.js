// ── Mobile menu toggle ───────────────────────────────────────────
  function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
  }

  // ── Scroll-triggered fade-in animations ─────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── Stagger children of fade-in elements ────────────────────────
  document.querySelectorAll('.steps-grid .step-card, .products-grid .product-card, .sectors-grid .sector-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── Smooth nav close on link click (mobile) ──────────────────────
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  // ── Service worker registration (with auto-unregister on version bump) ─────────────────────────────────
  const APP_VERSION = '2'; // bump this when deploying new updates

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
