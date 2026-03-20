// ── Mobile menu toggle ───────────────────────────────────────────
  function toggleMenu() {
    const nav = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    if (!nav || !hamburger) return;
    const isOpen = nav.classList.contains('open');
    nav.classList.toggle('open', !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
  }

  // ── Keyboard activation for hamburger ────────────────────────────
  const hamburgerEl = document.getElementById('hamburger');
  if (hamburgerEl) {
    hamburgerEl.addEventListener('click', toggleMenu);
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

  // ── Products mega-menu toggle (mobile + keyboard) ──────────────
  (function() {
    var trigger = document.querySelector('.nav-dropdown-trigger');
    var menu = document.getElementById('productsMegaMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', function(e) {
        if (window.innerWidth < 900) {
          e.preventDefault();
          menu.classList.toggle('mega-menu--open');
        }
      });
      document.addEventListener('click', function(e) {
        if (menu && !menu.parentElement.contains(e.target)) {
          menu.classList.remove('mega-menu--open');
        }
      });
    }
  })();

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

  // ── Scroll-spy nav (no URL hash updates — active class only) ────
  const spySections = document.querySelectorAll('section[id]');
  const spyLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const spyVisible = new Set();
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        spyVisible.add(entry.target);
      } else {
        spyVisible.delete(entry.target);
      }
    });
    // Pick the topmost visible section (closest to nav) to avoid wrong highlights
    let topSection = null;
    let topY = Infinity;
    spyVisible.forEach(s => {
      const y = s.getBoundingClientRect().top;
      if (y < topY) { topY = y; topSection = s; }
    });
    if (topSection) {
      spyLinks.forEach(a => a.classList.remove('nav-active'));
      const active = document.querySelector(`.nav-links a[href="#${topSection.id}"]`);
      if (active) active.classList.add('nav-active');
    }
  }, { threshold: 0, rootMargin: '-72px 0px -45% 0px' });
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

  // ── Hero segment toggle ──────────────────────────────────────────────
  const SEGMENT_SUBTEXTS = {
    landlord: 'CrowAgent Core analyses your commercial property against the 2028 MEES Band C requirement — EPC gap analysis, retrofit scenarios, and PDF reports in 10 minutes.',
    supplier: 'CrowMark maps your contract to PPN 002 missions, calculates Oxford Social Value Bank scores, and generates a compliant bid narrative in 10 minutes.'
  };

  function setHeroSegment(segment) {
    const pills = document.querySelectorAll('.segment-pill');
    const sub = document.getElementById('heroSubText');
    pills.forEach(pill => {
      const selected = pill.dataset.segment === segment;
      pill.classList.toggle('segment-pill--selected', selected);
      pill.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    if (sub && SEGMENT_SUBTEXTS[segment]) sub.textContent = SEGMENT_SUBTEXTS[segment];
  }

  const segmentPills = document.querySelectorAll('.segment-pill');
  if (segmentPills.length) {
    segmentPills.forEach(pill => {
      pill.addEventListener('click', () => setHeroSegment(pill.dataset.segment));
      pill.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHeroSegment(pill.dataset.segment); }
      });
    });
    setHeroSegment('landlord');
  }

  // ── Scroll to product section ──────────────────────────────────────
  function scrollToProduct(productId) {
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  // Make available globally for onclick handlers
  window.scrollToProduct = scrollToProduct;

  // ── Service worker registration (with auto-unregister on version bump) ─────────────────────────────────
  const APP_VERSION = '11'; // bump this when deploying new updates

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
