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
  const staggerCards = document.querySelectorAll('.trust-grid > *, .products-grid > *, .sectors-grid > *, .steps-grid > *');
  staggerCards.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── Scroll-spy nav ──────────────────────────────────────────────
  const spySections = document.querySelectorAll('section[id]');
  const spyLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        spyLinks.forEach(a => a.classList.remove('nav-active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('nav-active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-72px 0px -40% 0px' });
  spySections.forEach(s => spyObserver.observe(s));

  // ── Stats count-up ──────────────────────────────────────────────
  function countUp(el) {
    if (!el.dataset.count) el.dataset.count = el.textContent.trim();
    const raw = el.dataset.count;
    const prefix = raw.match(/^[£]/) ? raw[0] : '';
    const suffix = raw.replace(/^[£]/, '').replace(/[0-9.]+/, '');
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const duration = 1800;
    let start = null;
    function easeOutQuad(t) { return t * (2 - t); }
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const val = easeOutQuad(progress) * num;
      el.textContent = prefix + (Number.isInteger(num) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-val').forEach(countUp);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

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
  const APP_VERSION = '9'; // bump this when deploying new updates

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

  // ── Cookie consent banner ────────────────────────────────────────
  (function() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    const consent = localStorage.getItem('ca_cookie_consent');
    if (!consent) {
      setTimeout(function() { banner.hidden = false; }, 1500);
    }
    var acceptBtn = document.getElementById('cookieAccept');
    var declineBtn = document.getElementById('cookieDecline');
    if (acceptBtn) acceptBtn.addEventListener('click', function() {
      localStorage.setItem('ca_cookie_consent', 'accepted');
      banner.hidden = true;
    });
    if (declineBtn) declineBtn.addEventListener('click', function() {
      localStorage.setItem('ca_cookie_consent', 'declined');
      banner.hidden = true;
    });
  })();

  // ── CSRD Checker form submit ──────────────────────────────────────
  const csrdForm = document.getElementById('csrdForm');
  const csrdThankYou = document.getElementById('csrdThankYou');

  if (csrdForm) {
    csrdForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const company   = csrdForm.querySelector('#csrd-company').value.trim();
      const email     = csrdForm.querySelector('#csrd-email').value.trim();
      const employees = csrdForm.querySelector('#csrd-employees').value;
      const turnover  = csrdForm.querySelector('#csrd-turnover').value;

      if (!company || !email || !employees || !turnover) {
        const firstEmpty = csrdForm.querySelector('.form-control:invalid, .form-control[value=""]');
        if (firstEmpty) firstEmpty.focus();
        return;
      }

      // Build mailto fallback so submissions reach the team even without a backend
      const subject  = encodeURIComponent('CSRD Assessment Request — ' + company);
      const body     = encodeURIComponent(
        'Company: ' + company + '\n' +
        'Email: ' + email + '\n' +
        'Employees: ' + employees + '\n' +
        'Turnover: ' + turnover
      );
      const mailtoHref = 'mailto:hello@crowagent.ai?subject=' + subject + '&body=' + body;

      // Fire mailto silently (opens mail client in background)
      const link = document.createElement('a');
      link.href = mailtoHref;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show thank-you state
      csrdForm.hidden = true;
      if (csrdThankYou) csrdThankYou.hidden = false;
    });
  }
