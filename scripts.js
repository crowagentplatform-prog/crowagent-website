var APP_VERSION = '15';

// ── ANNOUNCE BAR DISMISS ──
function dismissBar() {
  var bar = document.getElementById('announce-bar');
  if (bar) bar.style.display = 'none';
  try { localStorage.setItem('ca_bar_dismissed', '1'); } catch(e) { console.warn('localStorage unavailable:', e); }
}
(function() {
  try { if (localStorage.getItem('ca_bar_dismissed')) {
    var b = document.getElementById('announce-bar');
    if (b) b.style.display = 'none';
  }} catch(e) { console.warn('localStorage unavailable:', e); }
})();

// ── NAVIGATION MENU TOGGLE ──
function toggleMenu() {
  var nav = document.getElementById('navLinks');
  var btn = document.getElementById('hamburger');
  if (nav) nav.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', nav && nav.classList.contains('open') ? 'true' : 'false');
}

// ── MOBILE HAMBURGER (legacy name, uses toggleMenu) ──
function toggleMob() {
  toggleMenu();
}

// ── NAV MENU KEYBOARD SUPPORT ──
(function() {
  function setupMenuHandlers() {
    var btn = document.getElementById('hamburger');
    if (btn && !btn._menuHandlersAdded) {
      btn._menuHandlersAdded = true;
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMenu();
        }
      });
      btn.addEventListener('click', toggleMenu);
    }

    // Close menu when nav link is clicked
    var navLinks = document.getElementById('navLinks');
    if (navLinks && !navLinks._linkHandlersAdded) {
      navLinks._linkHandlersAdded = true;
      navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navLinks.classList.remove('open');
          var btn = document.getElementById('hamburger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  setupMenuHandlers();

  // Listen for DOM changes to set up handlers on dynamically added content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMenuHandlers);
  }
})();

// Close menu on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var nav = document.getElementById('navLinks');
    var btn = document.getElementById('hamburger');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }
});

// ── HERO SEGMENT TOGGLE ──
(function() {
  function setupSegments() {
    var segments = document.querySelectorAll('.segment-pill');
    if (segments.length === 0) return;

    function setHeroSegment(segment) {
      segments.forEach(function(s) {
        s.classList.remove('segment-pill--selected');
        s.setAttribute('aria-pressed', 'false');
      });
      var pill = document.querySelector('[data-segment="' + segment + '"]');
      if (pill) {
        pill.classList.add('segment-pill--selected');
        pill.setAttribute('aria-pressed', 'true');
        var textEl = document.getElementById('heroSubText');
        if (textEl) {
          if (segment === 'supplier') {
            textEl.textContent = 'PPN 002 Compliance Check';
          } else {
            textEl.textContent = 'MEES Regulation Compliance';
          }
        }
      }
    }

    // Initialize with landlord
    setHeroSegment('landlord');

    // Add click handlers
    segments.forEach(function(pill) {
      if (!pill._segmentHandlersAdded) {
        pill._segmentHandlersAdded = true;
        pill.addEventListener('click', function() {
          setHeroSegment(this.getAttribute('data-segment'));
        });
        // Keyboard support
        pill.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setHeroSegment(this.getAttribute('data-segment'));
          }
        });
      }
    });
  }

  setupSegments();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSegments);
  }
})();

// ── PRICING PRODUCT TAB SWITCHER ──
function switchPTab(product, btn) {
  document.querySelectorAll('.ptab').forEach(function(t) { t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById('core-p').style.display = product === 'core' ? 'block' : 'none';
  document.getElementById('mark-p').style.display = product === 'mark' ? 'block' : 'none';
}

// ── COOKIE CONSENT BANNER ──
(function() {
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;

  var consentKey = 'ca_cookie_consent';
  var hasConsent = localStorage.getItem(consentKey);

  if (hasConsent) {
    banner.hidden = true;
  } else {
    setTimeout(function() {
      banner.hidden = false;
    }, 1500);
  }

  var acceptBtn = document.getElementById('cookieAccept');
  var declineBtn = document.getElementById('cookieDecline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem(consentKey, 'accepted');
      banner.hidden = true;
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      localStorage.setItem(consentKey, 'declined');
      banner.hidden = true;
    });
  }
})();

// ── BILLING TOGGLE (monthly/annual) ──
var isAnn = false;
function toggleBilling() {
  isAnn = !isAnn;
  document.getElementById('ttoggle').classList.toggle('ann', isAnn);
  document.getElementById('lbl-m').style.color = isAnn ? 'var(--steel)' : 'var(--cloud)';
  document.getElementById('lbl-a').style.color = isAnn ? 'var(--cloud)' : 'var(--steel)';
  document.querySelectorAll('.pv').forEach(function(el) {
    el.textContent = isAnn ? el.getAttribute('data-a') : el.getAttribute('data-m');
  });
  document.querySelectorAll('.pp').forEach(function(el) {
    el.textContent = isAnn ? '/mo (billed annually)' : '/mo';
  });
}

// ── MEES COUNTDOWN ──
(function() {
  var el = document.getElementById('days-counter');
  if (!el) return;
  var deadline = new Date('2028-04-01T00:00:00Z');
  var now = new Date();
  var days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  el.textContent = days.toLocaleString('en-GB');
})();

// ── ANIMATED PRODUCT DEMO ──
(function() {
  // Check if demo elements exist
  var demoEls = document.querySelectorAll('.ds-1, .ds-2, .ds-3');
  if (demoEls.length === 0) return;

  var screens = ['.ds-1', '.ds-2', '.ds-3'];
  var dots = ['#dd0', '#dd1', '#dd2'];
  var current = 0;
  var interval;
  var initialized = false;

  var postcode = 'SW1A 2AA';
  var typed = document.querySelector('.ds-typed');
  var charIdx = 0;
  function typeNext() {
    if (!typed) return;
    if (charIdx < postcode.length) {
      typed.textContent += postcode[charIdx++];
      setTimeout(typeNext, 120);
    }
  }

  function animateCounter() {
    var el = document.querySelector('.ds-count');
    if (!el) return;
    var target = 18750;
    var step = 450;
    var val = 0;
    var t = setInterval(function() {
      val = Math.min(val + step, target);
      el.textContent = val.toLocaleString('en-GB');
      if (val >= target) clearInterval(t);
    }, 40);
  }

  function animateGaps() {
    document.querySelectorAll('.ds-gap-item').forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-8px)';
      setTimeout(function() {
        el.style.transition = 'opacity .4s ease, transform .4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      }, i * 200);
    });
  }

  function showScreen(idx) {
    screens.forEach(function(s, i) {
      var el = document.querySelector(s);
      if (el) el.style.display = i === idx ? 'block' : 'none';
    });
    dots.forEach(function(d, i) {
      var el = document.querySelector(d);
      if (el) el.classList.toggle('active', i === idx);
    });
    if (idx === 0) { charIdx = 0; if (typed) typed.textContent = ''; setTimeout(typeNext, 600); }
    if (idx === 1) { setTimeout(animateCounter, 400); animateGaps(); }
  }

  function advance() {
    current = (current + 1) % screens.length;
    showScreen(current);
  }

  if (!initialized) {
    initialized = true;
    showScreen(0);
    interval = setInterval(advance, 7000);

    dots.forEach(function(d, i) {
      var el = document.querySelector(d);
      if (el) el.addEventListener('click', function() {
        clearInterval(interval);
        current = i;
        showScreen(current);
        interval = setInterval(advance, 7000);
      });
    });
  }
})();

// ── CSRD FORM SUBMISSION ──
async function submitCSRD(e) {
  e.preventDefault();
  var form = e.target;

  // Check if all required fields are filled
  var company = document.getElementById('csrd-company');
  var email = document.getElementById('csrd-email');
  var employees = document.getElementById('csrd-employees');
  var turnover = document.getElementById('csrd-turnover');

  if (!company || !email || !employees || !turnover ||
      !company.value.trim() || !email.value.trim() ||
      !employees.value || !turnover.value) {
    return;
  }

  var btn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-form');
  var orig = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = 'Sending\u2026 <span>\u27F3</span>';
    btn.disabled = true;
  }

  var data = {
    company: company.value,
    email: email.value,
    employees: employees.value,
    turnover: turnover.value
  };

  try {
    var res = await fetch(
      'https://crowagent-platform-production.up.railway.app/api/v1/csrd/check',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
    );
    if (res.ok) {
      form.hidden = true;
      var thankYou = document.getElementById('csrdThankYou');
      if (thankYou) thankYou.hidden = false;
    } else {
      throw new Error('API error ' + res.status);
    }
  } catch (err) {
    btn.innerHTML = orig;
    btn.disabled = false;
    btn.style.borderColor = 'var(--err)';
    console.error('CSRD form error:', err);
    alert('Sorry \u2014 please email hello@crowagent.ai directly with your company details.');
  }
}

// ── CSRD FORM EVENT LISTENER ──
(function() {
  var form = document.getElementById('csrdForm');
  if (form) {
    form.addEventListener('submit', submitCSRD);
  }
})();

// ── INTERSECTION OBSERVER: Stagger animations ──
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function() {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.sc, .hw, .pc, .sector, .tc, .uc').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// ── FADE-IN OBSERVER ──
var fadeObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(function(el) {
  fadeObserver.observe(el);
});

// ── COUNT-UP ANIMATION ──
var countObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var statVals = entry.target.querySelectorAll('.stat-val');
      statVals.forEach(function(el) {
        var text = el.textContent;
        var num = parseInt(text.replace(/[^\d]/g, ''));
        if (!isNaN(num)) {
          var step = Math.ceil(num / 50);
          var current = 0;
          var interval = setInterval(function() {
            current = Math.min(current + step, num);
            el.textContent = current.toLocaleString('en-GB');
            if (current >= num) clearInterval(interval);
          }, 50);
        }
      });
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

var heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  countObserver.observe(heroStats);
}

// ── SMOOTH SCROLL for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target && target.scrollIntoView) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── OUTSIDE CLICK: Close mobile menu ──
document.addEventListener('click', function(e) {
  var menu = document.querySelector('.mob-menu');
  var ham = document.querySelector('.ham');
  if (menu && ham && !menu.contains(e.target) && !ham.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ── CSRD INLINE FORM (homepage) ──
function submitCSRDInline() {
  var email = document.getElementById('csrd-i-email');
  var err = document.getElementById('csrd-email-err');
  if (!email) return;
  var val = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    if (err) err.style.display = 'block';
    return;
  }
  if (err) err.style.display = 'none';
  var employees = document.getElementById('csrd-i-employees');
  var turnover = document.getElementById('csrd-i-turnover');
  var btn = document.querySelector('#csrd-inline-form .btn-form');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  fetch('https://crowagent-platform-production.up.railway.app/api/v1/csrd/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      company_name: 'Website visitor (homepage)',
      email: val,
      employee_count: csrdMapEmployees(employees ? employees.value : '<250'),
      annual_turnover_eur: csrdMapTurnover(turnover ? turnover.value : '<150m'),
      is_listed: false
    })
  }).catch(function(err){
    console.error('CSRD inline form submission error:', err);
  }).finally(function(){
    var form = document.getElementById('csrd-inline-form');
    var success = document.getElementById('csrd-inline-success');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
  });
}

// ── PHASE 2 NOTIFY-ME ──
function caToggleNotify(btn) {
  var wrap = btn.closest('.ca-notify-wrap');
  if (!wrap) return;
  btn.style.display = 'none';
  var form = wrap.querySelector('.ca-notify-form');
  if (form) form.style.display = 'flex';
  var input = wrap.querySelector('.ca-notify-input');
  if (input) input.focus();
}
async function caSubmitNotify(btn) {
  var wrap = btn.closest('.ca-notify-wrap');
  if (!wrap) return;
  var input = wrap.querySelector('.ca-notify-input');
  if (!input) return;
  var email = input.value.trim();
  var product = wrap.dataset.product || 'unknown';
  var errEl = wrap.querySelector('.ca-notify-error');
  var successEl = wrap.querySelector('.ca-notify-success');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    await fetch('https://crowagent-platform-production.up.railway.app/api/v1/waitlist/notify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ product: product, email: email })
    });
  } catch(e) {
    console.error('Waitlist form error:', e);
  }
  var notifyForm = wrap.querySelector('.ca-notify-form');
  if (notifyForm) notifyForm.style.display = 'none';
  if (successEl) successEl.style.display = 'block';
}

// ── CSRD FULL WIZARD (csrd.html) ──
var csrdState = { employees: null, turnover: null, sector: null, step: 1 };
function csrdSelect(field, value, evt) {
  csrdState[field] = value;
  document.querySelectorAll('[data-csrd-step="' + csrdState.step + '"] .csrd-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  if (evt && evt.currentTarget) evt.currentTarget.classList.add('selected');
  var nextStep = csrdState.step + 1;
  setTimeout(function() { csrdShowStep(nextStep); }, 280);
  csrdState.step = nextStep;
}
function csrdShowStep(n) {
  document.querySelectorAll('.csrd-step').forEach(function(el) {
    el.style.display = 'none';
    el.classList.remove('active');
  });
  var target = document.querySelector('[data-csrd-step="' + n + '"]');
  if (target) { target.style.display = 'block'; target.classList.add('active'); }
  csrdState.step = n;
  if (n === 1) { csrdState.employees = null; }
  if (n <= 2) { csrdState.turnover = null; }
}
function csrdMapEmployees(val) {
  if (val === '1000+') return 1001;
  if (val === '250-999') return 500;
  return 100;
}
function csrdMapTurnover(val) {
  if (val === '450m+') return 451000000;
  if (val === '150m-450m') return 200000000;
  return 10000000;
}
function csrdGetResult() {
  var mandatory = csrdState.employees === '1000+' && csrdState.turnover === '450m+';
  var watchlist = csrdState.employees === '1000+' || csrdState.turnover === '450m+';
  return mandatory ? 'mandatory' : watchlist ? 'watchlist' : 'not_required';
}
async function csrdSubmit() {
  var email = document.getElementById('csrd-email');
  if (!email) return;
  var val = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
  var resultDiv = document.getElementById('csrd-result');
  var submitBtn = document.querySelector('[data-csrd-step="3"] .btn-teal-sm[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Checking...'; }
  try {
    var res = await fetch('https://crowagent-platform-production.up.railway.app/api/v1/csrd/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        company_name: 'Website visitor',
        email: val,
        employee_count: csrdMapEmployees(csrdState.employees),
        annual_turnover_eur: csrdMapTurnover(csrdState.turnover),
        is_listed: false
      })
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    var data = await res.json();
    var scope = csrdGetResult();
    var html = '';
    if (scope === 'mandatory') {
      html = '<div style="background:rgba(12,201,168,.1);border:1px solid var(--teal);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--teal);font-size:16px">Your organisation is likely IN SCOPE for CSRD</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Both thresholds exceeded: &gt;1,000 employees and &gt;&euro;450M turnover. Per Directive (EU) 2026/470.</p></div>';
    } else if (scope === 'watchlist') {
      html = '<div style="background:rgba(245,158,11,.1);border:1px solid #F59E0B;border-radius:10px;padding:20px;text-align:center"><strong style="color:#F59E0B;font-size:16px">Watch list &mdash; thresholds may change</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">One threshold exceeded. Monitor regulatory updates as scope criteria may evolve.</p></div>';
    } else {
      html = '<div style="background:rgba(138,157,184,.08);border:1px solid var(--steel);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--cloud);font-size:16px">Your organisation is likely OUT OF SCOPE</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Neither threshold exceeded under current Omnibus I criteria.</p></div>';
    }
    // SAFE: HTML is fully template-controlled, no user input is included
    if (resultDiv) resultDiv.innerHTML = html;
    if (submitBtn) { submitBtn.textContent = 'Result ready'; submitBtn.style.background = 'var(--teal)'; }
  } catch(e) {
    console.error('CSRD form error:', e);
    // SAFE: HTML is fully template-controlled error message, no user input is included
    if (resultDiv) resultDiv.innerHTML = '<div style="background:rgba(240,68,56,.1);border:1px solid var(--err);border-radius:10px;padding:16px;text-align:center;color:var(--err)">Unable to get result. Please try again.</div>';
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Get my result'; }
  }
}

// ── SERVICE WORKER REGISTRATION ──
(function() {
  if ('serviceWorker' in navigator) {
    var currentVersion = APP_VERSION;
    var storedVersion = sessionStorage.getItem('crowagentAppVersion');

    // Always register the new service worker
    navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
      console.warn('Service worker registration failed:', err);
    });

    // If version differs, unregister old ones
    if (storedVersion && storedVersion !== currentVersion) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(reg) {
          reg.unregister();
        });
      });
    }

    sessionStorage.setItem('crowagentAppVersion', currentVersion);
  }
})();

// ── Expose functions for testing (CommonJS) ──
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    dismissBar: dismissBar,
    toggleMenu: toggleMenu,
    toggleMob: toggleMob,
    switchPTab: switchPTab,
    toggleBilling: toggleBilling,
    submitCSRD: submitCSRD,
    submitCSRDInline: submitCSRDInline,
    caToggleNotify: caToggleNotify,
    caSubmitNotify: caSubmitNotify,
    csrdSelect: csrdSelect,
    csrdShowStep: csrdShowStep,
    csrdMapEmployees: csrdMapEmployees,
    csrdMapTurnover: csrdMapTurnover,
    csrdGetResult: csrdGetResult,
    csrdSubmit: csrdSubmit,
    get csrdState() { return csrdState; },
    set csrdState(v) { csrdState = v; }
  };
}
