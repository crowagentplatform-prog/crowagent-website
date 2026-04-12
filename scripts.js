var APP_VERSION = '49';

// ── SCROLL LOCK SAFETY RESET — WP-WEB-HOTFIX-002 ──
// Clears any stale scroll-lock state on every page load
(function() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.height = '';
}());

// ── SCROLL-TRIGGERED SECTION REVEAL ──
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
    document.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
  document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });
})();

// ── NAV SCROLL — Smart Sticky: hide on scroll-down, show on scroll-up with frosted glass ──
(function() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var lastY = 0;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    // Don't hide nav when mobile menu is open
    var mobOpen = document.querySelector('.mob-menu.open');
    if (y > 60) {
      nav.classList.add('nav-frosted');
      if (y > lastY && y > 120 && !mobOpen) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
    } else {
      nav.classList.remove('nav-frosted');
      nav.classList.remove('nav-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// ── CLOSE MOBILE NAV ON SCROLL ──
(function() {
  var mobMenu = document.querySelector('.mob-menu');
  if (!mobMenu) return;
  window.addEventListener('scroll', function() {
    if (mobMenu.classList.contains('open')) {
      closeMob();
    }
  }, { passive: true });
})();

// ── NAV SCROLL-SPY — WP-WEB-003 ──
(function() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href*="#"]');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;
  var spy = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(link) { link.classList.remove('active'); link.classList.remove('nav-link-active'); });
        var id = entry.target.getAttribute('id');
        var active = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (active) { active.classList.add('active'); active.classList.add('nav-link-active'); }
      }
    });
  }, { threshold: 0.35, rootMargin: '-72px 0px 0px 0px' });
  sections.forEach(function(s) { spy.observe(s); });
})();

// ── NAV READY HANDLER ──
(function() {
  function onNavReady() {
    // NAV GLASSMORPHISM — handled by Smart Sticky scroll handler above

    // PRODUCTS MEGA MENU — hover + click toggle
    (function() {
      var dropdown = document.querySelector('.nav-dropdown');
      if (!dropdown) return;
      var trigger = dropdown.querySelector('.nav-dropdown-trigger');
      var mega = dropdown.querySelector('.nav-mega');
      var closeTimer = null;
      function open() { clearTimeout(closeTimer); dropdown.setAttribute('data-open', 'true'); trigger.setAttribute('aria-expanded', 'true'); }
      function close() { dropdown.setAttribute('data-open', 'false'); trigger.setAttribute('aria-expanded', 'false'); }
      function delayClose() { closeTimer = setTimeout(close, 200); }
      dropdown.addEventListener('mouseenter', open);
      dropdown.addEventListener('mouseleave', delayClose);
      trigger.addEventListener('click', function(e) { e.preventDefault(); dropdown.getAttribute('data-open') === 'true' ? close() : open(); });
      // Close on Escape
      dropdown.addEventListener('keydown', function(e) { if (e.key === 'Escape') { close(); trigger.focus(); } });
      // Close when clicking outside
      document.addEventListener('click', function(e) { if (!dropdown.contains(e.target)) close(); });
    })();

    // MOB-MENU CLOSE-ON-CLICK — moved here (fix: ran before nav-inject injected nav)
    document.querySelectorAll('.mob-menu a').forEach(function(a) {
      a.addEventListener('click', function() {
        closeMob();
      });
    });

    // WP-RESP-FIX-001: Bind hamburger click here (after nav-inject has injected .ham)
    // Inline onclick removed from nav-inject.js to prevent double-fire on Android
    (function() {
      var ham = document.querySelector('.ham');
      if (ham) {
        ham.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleMob();
        });
      }
    })();

    // STATUS CHECK — moved here from raw IIFE (fix: ran before nav-inject injected footer)
    (function() {
      var dot = document.getElementById('status-dot');
      var label = document.getElementById('status-label');
      if (!dot || !label) return;
      fetch('https://crowagent-platform-production.up.railway.app/api/v1/health', {
        method: 'GET',
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
      })
      .then(function(r) {
        if (r.ok) { dot.className = 'footer-status-dot online'; label.textContent = 'All systems operational'; }
        else { dot.className = 'footer-status-dot degraded'; label.textContent = 'Degraded performance'; }
      })
      .catch(function() { dot.className = 'footer-status-dot degraded'; label.textContent = 'Unable to check status'; });
    })();

    // BACK-TO-TOP BUTTON — WP-WEB-TRANSFORM-001
    (function() {
      var btn = document.getElementById('back-to-top');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        btn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();

    // SHADOW ONBOARDING — decorate signup links after nav/footer injection
    if (typeof window.caDecorateSignupLinks === 'function') {
      window.caDecorateSignupLinks();
    }
  }
  /* Fire immediately if nav already injected (race condition guard) */
  var navEl = document.querySelector('nav[role="navigation"]');
  if (navEl && navEl.hasChildNodes()) {
    onNavReady();
  } else {
    document.addEventListener('ca-nav-ready', onNavReady, { once: true });
  }
})();

// ── TOUCH SWIPE: Close mobile menu on swipe-left ──
(function() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  var startX = 0;
  menu.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  menu.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (dx < -80) closeMob();
  }, { passive: true });
})();

// ── ANNOUNCE BAR DISMISS ──
function dismissBar() {
  var bar = document.getElementById('announce-bar');
  if (bar) bar.style.display = 'none';
  try { localStorage.setItem('ca_bar_dismissed', '1'); } catch(e) {}
  // Recalculate mob-menu top if open (announce bar height changed)
  var menu = document.querySelector('.mob-menu');
  var nav = document.querySelector('nav');
  if (menu && nav && menu.classList.contains('open')) {
    menu.style.top = nav.getBoundingClientRect().bottom + 'px';
  }
}
(function() {
  try { if (localStorage.getItem('ca_bar_dismissed')) {
    var b = document.getElementById('announce-bar');
    if (b) b.style.display = 'none';
  }} catch(e) {}
})();

// ── MOBILE HAMBURGER — WP-WEB-011 (scroll lock via .no-scroll class) ──
var _mobScrollY = 0;
function openMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  // Dynamically position mob-menu below nav + announce bar
  var nav = document.querySelector('nav');
  if (nav) {
    menu.style.top = nav.getBoundingClientRect().bottom + 'px';
  }
  _mobScrollY = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('no-scroll');
  document.body.style.top = '-' + _mobScrollY + 'px';
  menu.classList.add('open');
  var firstLink = menu.querySelector('a');
  if (firstLink) firstLink.focus();
  var ham = document.querySelector('.ham');
  if (ham) ham.setAttribute('aria-expanded', 'true');
}
function closeMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  document.body.classList.remove('no-scroll');
  document.body.style.top = '';
  menu.classList.remove('open');
  window.scrollTo(0, _mobScrollY);
  var ham = document.querySelector('.ham');
  if (ham) ham.setAttribute('aria-expanded', 'false');
}
function toggleMob() {
  var menu = document.querySelector('.mob-menu');
  if (menu && menu.classList.contains('open')) { closeMob(); } else { openMob(); }
}
// Auto-close mobile menu on internal link click
// (Moved into onNavReady to ensure .mob-menu exists after nav-inject)

// ── WP-RESP-FIX-001: (Moved into onNavReady — see above) ──
// Inline onclick removed from nav-inject.js; single programmatic listener
// now lives inside onNavReady() to prevent double-fire on Android.

// ── WP-RESP-FIX-002: Escape key closes mobile menu ──
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var menu = document.querySelector('.mob-menu');
    if (menu && menu.classList.contains('open')) {
      closeMob();
      var ham = document.querySelector('.ham');
      if (ham) ham.focus();
    }
  }
});

// ── WP-RESP-FIX-003: Focus trap inside mobile menu ──
(function() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var menu = document.querySelector('.mob-menu');
    if (!menu || !menu.classList.contains('open')) return;
    var focusable = menu.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ── PRICING PRODUCT TAB SWITCHER ──
function switchPTab(product, btn) {
  document.querySelectorAll('.ptab').forEach(function(t) { t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById('core-p').style.display = product === 'core' ? 'grid' : 'none';
  document.getElementById('mark-p').style.display = product === 'mark' ? 'grid' : 'none';
  // Toggle comparison tables with tabs
  var coreCompare = document.getElementById('core-compare');
  var markCompare = document.getElementById('mark-compare');
  if (coreCompare) coreCompare.style.display = (product === 'core') ? '' : 'none';
  if (markCompare) markCompare.style.display = (product === 'mark') ? '' : 'none';
}

// ── PLAN LINK UPDATER (monthly/annual URL params) ──
var PLAN_LINKS = {
  starter: { monthly: 'starter', annual: 'starter_annual' },
  pro: { monthly: 'pro', annual: 'pro_annual' },
  portfolio: { monthly: 'portfolio', annual: 'portfolio_annual' },
  solo: { monthly: 'crowmark_solo', annual: 'crowmark_solo_annual' },
  team: { monthly: 'crowmark_team', annual: 'crowmark_team_annual' },
  agency: { monthly: 'crowmark_agency', annual: 'crowmark_agency_annual' }
};
function updatePlanLinks() {
  var isAnnual = !!(document.getElementById('ttoggle') && document.getElementById('ttoggle').classList.contains('ann'));
  document.querySelectorAll('[data-plan-tier]').forEach(function(el) {
    var tier = el.getAttribute('data-plan-tier');
    var config = PLAN_LINKS[tier];
    if (!config || !el.href) return;
    var url = new URL(el.href, window.location.origin);
    url.searchParams.set('plan', isAnnual ? config.annual : config.monthly);
    el.href = url.toString();
  });
}
window.caUpdatePlanLinks = updatePlanLinks;

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
  if (typeof window.caUpdatePlanLinks === 'function') window.caUpdatePlanLinks();
}

// ── MEES COUNTDOWN — removed dead days-counter IIFE (WP-WEB-TRANSFORM-001) ──
// Live countdown uses #mees-days (below) and inline script in index.html

// ── MEES 2028 COUNTDOWN — WP-WEB-003 (hero countdown pill) ──
(function() {
  var el = document.getElementById('mees-days');
  if (!el) return;
  var target = new Date('2028-04-01T00:00:00Z');
  function update() {
    var now = new Date();
    var diff = target - now;
    if (diff <= 0) { el.textContent = '0'; return; }
    el.textContent = Math.floor(diff / 86400000).toLocaleString('en-GB');
  }
  update();
  setInterval(update, 60000);
})();

// ── ANIMATED PRODUCT DEMO ──
(function() {
  var screens = ['.ds-1', '.ds-2', '.ds-3'];
  var dots = ['#dd0', '#dd1', '#dd2'];
  var current = 0;
  var interval;

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
    var target = 42000;
    var step = 1000;
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

  showScreen(0);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    interval = setInterval(advance, 7000);
  }

  dots.forEach(function(d, i) {
    var el = document.querySelector(d);
    if (el) el.addEventListener('click', function() {
      clearInterval(interval);
      current = i;
      showScreen(current);
      interval = setInterval(advance, 7000);
    });
  });
})();

// ── CSRD FORM SUBMISSION ──
async function submitCSRD(e) {
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.btn-form');
  var orig = btn.innerHTML;
  btn.innerHTML = 'Sending\u2026 <span>\u27F3</span>';
  btn.disabled = true;

  var inputs = form.querySelectorAll('input');
  var selects = form.querySelectorAll('select');
  var data = {
    company: inputs[0] ? inputs[0].value : '',
    email: inputs[1] ? inputs[1].value : '',
    employees: selects[0] ? selects[0].value : '',
    turnover: selects[1] ? selects[1].value : ''
  };

  try {
    var res = await fetch(
      'https://crowagent-platform-production.up.railway.app/api/v1/csrd/check',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
    );
    if (res.ok) {
      btn.innerHTML = '\u2713 Report sent \u2014 check your email';
      btn.style.background = 'var(--success)';
    } else {
      throw new Error('API error ' + res.status);
    }
  } catch (err) {
    btn.innerHTML = orig;
    btn.disabled = false;
    btn.style.borderColor = 'var(--err)';
    console.error('CSRD form error:', err);
    var errBox = form.querySelector('.csrd-form-error');
    if (!errBox) {
      errBox = document.createElement('div');
      errBox.className = 'csrd-form-error';
      errBox.setAttribute('role', 'alert');
      errBox.className = 'csrd-form-error ca-alert ca-alert-error';
      errBox.style.marginTop = '12px';
      form.appendChild(errBox);
    }
    errBox.textContent = 'Something went wrong. Please email hello@crowagent.ai with your company details.';
    errBox.style.display = 'block';
  }
}

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

// ══════════════════════════════════════════════════════════════
//  ANCHOR SCROLL SYSTEM — WP-WEB-NEXT-004
//  Complete replacement — smoothScrollTo with nav offset
// ══════════════════════════════════════════════════════════════
(function() {
  'use strict';
  function getNavOffset() {
    var nav = document.querySelector('nav');
    if (!nav) return 80;
    return nav.getBoundingClientRect().bottom + 8;
  }
  function smoothScrollTo(el) {
    if (!el) return;
    var offset = getNavOffset();
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
  // 1. Same-page anchor clicks (#how) — not cross-page (/#how)
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href[0] !== '#') return;
    var el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    smoothScrollTo(el);
    if (history.pushState) history.pushState(null, '', href);
  }, false);
  // 2. Hash-on-load (navigated from /#how on another page)
  var hash = window.location.hash;
  if (hash && hash !== '#' && hash[0] === '#') {
    function tryScroll() {
      var el = document.querySelector(hash);
      if (el) { smoothScrollTo(el); return; }
      setTimeout(function() {
        var el2 = document.querySelector(hash);
        if (el2) smoothScrollTo(el2);
      }, 400);
    }
    if (document.readyState === 'complete') {
      requestAnimationFrame(tryScroll);
    } else {
      window.addEventListener('load', function() {
        requestAnimationFrame(tryScroll);
      }, { once: true });
    }
  }
})();

// ── OUTSIDE CLICK: Close mobile menu ──
document.addEventListener('click', function(e) {
  var menu = document.querySelector('.mob-menu');
  var ham = document.querySelector('.ham');
  if (menu && ham && menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) {
    closeMob();
  }
});

// ── CSRD INLINE FORM — removed (WP-WEB-TRANSFORM-001: IDs never existed in HTML) ──

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
  } catch(e) {}
  var notifyForm = wrap.querySelector('.ca-notify-form');
  if (notifyForm) notifyForm.style.display = 'none';
  if (successEl) successEl.style.display = 'block';
}

// ── CSRD INLINE EMAIL BLUR VALIDATION — removed (WP-WEB-TRANSFORM-001: csrd-i-email never existed) ──

// ── CSRD WIZARD EMAIL BLUR VALIDATION (Task 2.5) ──
(function() {
  var el = document.getElementById('csrd-email');
  if (!el) return;
  el.addEventListener('blur', function() {
    var val = el.value.trim();
    var err = document.getElementById('csrd-email-err');
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      if (!err) {
        err = document.createElement('span');
        err.id = 'csrd-email-err';
        err.setAttribute('role', 'alert');
        err.style.cssText = 'display:block;font-size:12px;color:var(--err);margin-top:4px;';
        el.parentNode.appendChild(err);
      }
      err.textContent = 'Please enter a valid email address.';
      err.style.display = 'block';
      el.classList.add('input-error');
    } else {
      if (err) err.style.display = 'none';
      el.classList.remove('input-error');
    }
  });
})();

// ── CSRD FULL WIZARD (csrd.html) ──
var csrdState = { employees: null, turnover: null, sector: null, step: 1 };
function csrdSelect(field, value) {
  csrdState[field] = value;
  document.querySelectorAll('[data-csrd-step="' + csrdState.step + '"] .csrd-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  if (event && event.currentTarget) event.currentTarget.classList.add('selected');
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
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
    // Focus management for accessibility (Task 3.5)
    var focusTarget = target.querySelector('h2, h3, input, button, [tabindex]');
    if (focusTarget) {
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: false });
    }
  }
  // Update progress indicators
  document.querySelectorAll('.csrd-progress-step').forEach(function(el) {
    var step = parseInt(el.dataset.step);
    el.classList.remove('csrd-progress-active', 'csrd-progress-done');
    if (step === n) el.classList.add('csrd-progress-active');
    else if (step < n) el.classList.add('csrd-progress-done');
  });
  csrdState.step = n;
  if (n === 1) { csrdState.employees = null; }
  if (n <= 2) { csrdState.turnover = null; }
  // WP-QA-001 BUG #10/11: Show verdict immediately on step 3 (no email gate)
  if (n === 3) { csrdRenderVerdict(); }
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
// WP-QA-001 BUG #10/11: Render verdict immediately (no email gate)
function csrdRenderVerdict() {
  var resultDiv = document.getElementById('csrd-result');
  if (!resultDiv) return;
  var scope = csrdGetResult();
  var html = '';
  if (scope === 'mandatory') {
    html = '<div style="background:rgba(12,201,168,.1);border:1px solid var(--teal);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--teal);font-size:16px">Your organisation is likely IN SCOPE for CSRD</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Both thresholds exceeded: &gt;1,000 employees and &gt;&euro;450M turnover. Per Directive (EU) 2026/470.</p></div>';
  } else if (scope === 'watchlist') {
    html = '<div style="background:rgba(245,158,11,.1);border:1px solid var(--warn);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--warn);font-size:16px">Watch list &mdash; thresholds may change</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">One threshold exceeded. Monitor regulatory updates as scope criteria may evolve.</p></div>';
  } else {
    html = '<div style="background:rgba(138,157,184,.08);border:1px solid var(--steel);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--cloud);font-size:16px">Your organisation is likely OUT OF SCOPE</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Neither threshold exceeded under current Omnibus I criteria.</p></div>';
  }
  resultDiv.innerHTML = html;
  if (typeof window.showCsrdShare === 'function') window.showCsrdShare();
}
async function csrdSubmit() {
  var email = document.getElementById('csrd-email');
  if (!email) return;
  var val = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
  var submitBtn = document.querySelector('#csrd-email-form .btn[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
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
    if (submitBtn) { submitBtn.textContent = 'Sent \u2713'; submitBtn.style.color = 'var(--teal)'; }
  } catch(e) {
    console.error('CSRD email error:', e);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send to my email'; }
  }
}

// ── CONTACT FORM SUBMISSION — removed (WP-WEB-TRANSFORM-001: contactForm ID never existed, contact.html uses contactPageForm) ──

// ── CSRD SHARE MECHANIC — WP-WEB-TRANSFORM-001 ──
(function() {
  window.showCsrdShare = function() {
    var panel = document.getElementById('csrdShare');
    if (panel) panel.style.display = 'block';
  };
  var liBtn = document.getElementById('csrdLinkedInShare');
  if (liBtn) {
    liBtn.addEventListener('click', function() {
      var text = encodeURIComponent('I just checked our CSRD reporting eligibility with CrowAgent. Find out if your organisation qualifies: ');
      var url = encodeURIComponent('https://crowagent.ai/csrd');
      window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url + '&summary=' + text, '_blank', 'noopener,width=600,height=500');
    });
  }
  var copyBtn = document.getElementById('csrdCopyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText('https://crowagent.ai/csrd').then(function() {
        copyBtn.textContent = '\u2713 Copied';
        setTimeout(function() { copyBtn.textContent = 'Copy link'; }, 2000);
      }).catch(function() {
        copyBtn.textContent = 'crowagent.ai/csrd';
      });
    });
  }
})();

// ── ANIMATED NUMBER COUNTERS (Task 11A) ──
(function() {
  var counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;
  var animated = new Set();
  var cObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !animated.has(entry.target)) {
        animated.add(entry.target);
        animateStatCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(el) { cObserver.observe(el); });
  function animateStatCounter(el) {
    var target = parseFloat(el.dataset.target);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var duration = 1800;
    var start = performance.now();
    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      var display = current >= 1000 ? current.toLocaleString('en-GB') : current;
      el.textContent = prefix + display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();

// ── PRODUCT TAB DEMO — WP-WEB-003 ──
(function() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.dataset.tab;
      tabBtns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanels.forEach(function(p) { p.classList.remove('active'); p.setAttribute('hidden', ''); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('tab-' + target);
      if (panel) { panel.classList.add('active'); panel.removeAttribute('hidden'); }
    });
    btn.addEventListener('keydown', function(e) {
      var idx = Array.from(tabBtns).indexOf(btn);
      if (e.key === 'ArrowRight') { e.preventDefault(); var next = tabBtns[idx + 1] || tabBtns[0]; next.click(); next.focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); var prev = tabBtns[idx - 1] || tabBtns[tabBtns.length - 1]; prev.click(); prev.focus(); }
    });
  });
})();

// ── FAQ ACCORDION — WP-WEB-003 ──
(function() {
  var faqBtns = document.querySelectorAll('.faq-q');
  faqBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', !expanded);
      if (expanded) { answer.setAttribute('hidden', ''); }
      else { answer.removeAttribute('hidden'); }
    });
  });
})();

// ── METHODOLOGY ACCORDION ON MOBILE (Task 11C) ──
(function() {
  if (window.innerWidth > 768) return;
  var methodCards = document.querySelectorAll('[style*="border-left:3px solid"]');
  methodCards.forEach(function(card, i) {
    var title = card.querySelector('[style*="font-weight:700"][style*="font-size:14px"]');
    var body = card.querySelector('p');
    if (!title || !body) return;
    body.style.display = i === 0 ? 'block' : 'none';
    title.style.cursor = 'pointer';
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    title.addEventListener('click', function() {
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      title.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });
})();

// ── BLOG FILTER TABS (WP-SUPP-002 Task 2.6) ──
(function() {
  var filters = document.querySelectorAll('.blog-filter');
  var articles = document.querySelectorAll('.blog-articles-grid article[data-category]');
  if (!filters.length || !articles.length) return;
  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var filter = btn.dataset.filter;
      filters.forEach(function(b) { b.classList.remove('blog-filter-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('blog-filter-active'); btn.setAttribute('aria-pressed', 'true');
      articles.forEach(function(art) {
        art.style.display = (filter === 'all' || art.dataset.category === filter) ? '' : 'none';
      });
    });
  });
})();

// ── NOTIFY-ME FORMS (Formspree) ──
(function() {
  document.querySelectorAll('.notify-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      var btn = form.querySelector('.notify-btn');
      var success = form.querySelector('.notify-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Adding...'; }
      fetch('https://formspree.io/f/xbdpkaol', {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      }).then(function(r) {
        if (r.ok) {
          if (success) success.style.display = 'block';
          if (btn) btn.style.display = 'none';
          var emailInput = form.querySelector('input[type="email"]');
          if (emailInput) emailInput.style.display = 'none';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = 'Notify me \u2192'; }
        }
      }).catch(function() {
        if (btn) { btn.disabled = false; btn.textContent = 'Notify me \u2192'; }
      });
    });
  });
})();

// ── CONTACT PAGE FORM (WP-SUPP-002 Task 2.2) ──
(function() {
  var form = document.getElementById('contactPageForm');
  if (!form) return;
  function showErr(id, msg) { var el = document.getElementById(id); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function clearErr(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('cp-name').value.trim();
    var email = document.getElementById('cp-email').value.trim();
    var btn = document.getElementById('cpSubmitBtn');
    var success = document.getElementById('cpFormSuccess');
    var error = document.getElementById('cpFormError');
    var valid = true;
    clearErr('cp-name-err'); clearErr('cp-email-err');
    if (!name) { showErr('cp-name-err', 'Please enter your name.'); valid = false; }
    if (!email || !email.includes('@') || !email.includes('.')) { showErr('cp-email-err', 'Please enter a valid email address.'); valid = false; }
    if (!valid) return;
    btn.disabled = true; btn.textContent = 'Sending...';
    success.style.display = 'none'; error.style.display = 'none';
    fetch('https://formspree.io/f/xbdpkaol', { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
    .then(function(r) { if (r.ok) { form.reset(); success.style.display = 'block'; btn.textContent = 'Message sent'; } else { throw new Error(); } })
    .catch(function() { error.style.display = 'block'; btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();

// ── COOKIE CONSENT — GRANULAR — WP-WEB-NEXT-001 ──
(function() {
  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var OLD_KEY = 'ca-cookie-ok';
  var banner = document.getElementById('ca-cookie');
  var simpleActions = document.getElementById('ca-cookie-simple');
  var detailPanel = document.getElementById('ca-cookie-detail');
  var analyticsChk = document.getElementById('ca-cookie-analytics');
  var marketingChk = document.getElementById('ca-cookie-marketing');
  var reopenBtn = document.getElementById('ca-cookie-reopen');
  if (!banner) return;

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch(e) { return null; }
  }
  function saveConsent(analytics, marketing) {
    var consent = { necessary: true, analytics: !!analytics, marketing: !!marketing, ts: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    localStorage.removeItem(OLD_KEY);
    hideBanner();
  }
  function showBanner() {
    banner.style.display = 'block';
    var stored = getConsent();
    if (stored && analyticsChk) analyticsChk.checked = !!stored.analytics;
    if (stored && marketingChk) marketingChk.checked = !!stored.marketing;
  }
  function hideBanner() { banner.style.display = 'none'; }
  function showDetail() {
    if (simpleActions) simpleActions.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'flex';
  }

  // Check existing consent
  var stored = getConsent();
  if (stored) {
    hideBanner();
  } else if (localStorage.getItem(OLD_KEY)) {
    // Migrate v1 consent
    var wasAccepted = localStorage.getItem(OLD_KEY) === '1';
    saveConsent(wasAccepted, false);
  } else {
    setTimeout(function() { showBanner(); }, 800);
  }

  // Simple action buttons
  var acceptBtn = document.getElementById('ca-cookie-accept');
  var rejectBtn = document.getElementById('ca-cookie-reject');
  var manageBtn = document.getElementById('ca-cookie-manage');
  var saveBtn = document.getElementById('ca-cookie-save');
  var acceptAllBtn = document.getElementById('ca-cookie-accept-all');

  if (acceptBtn) acceptBtn.addEventListener('click', function() { saveConsent(true, true); });
  if (rejectBtn) rejectBtn.addEventListener('click', function() { saveConsent(false, false); });
  if (manageBtn) manageBtn.addEventListener('click', function() { showDetail(); });
  if (saveBtn) saveBtn.addEventListener('click', function() {
    saveConsent(analyticsChk ? analyticsChk.checked : false, marketingChk ? marketingChk.checked : false);
  });
  if (acceptAllBtn) acceptAllBtn.addEventListener('click', function() { saveConsent(true, true); });
  if (reopenBtn) reopenBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (simpleActions) simpleActions.style.display = 'flex';
    if (detailPanel) detailPanel.style.display = 'none';
    showBanner();
  });
})();

// ── CSRD STEP MICRO-INTERACTIONS — WP-WEB-003-SUP ──
(function() {
  document.addEventListener('change', function(e) {
    var step = e.target.closest('.csrd-step, .csrd-option');
    if (!step) return;
    step.classList.add('answered', 'step-complete');
    setTimeout(function() { step.classList.remove('step-complete'); }, 450);
  });
})();

// ── FOOTER SYSTEM STATUS — moved into ca-nav-ready listener (WP-WEB-FIX-001) ──

// ── PRICING CARD ENTRANCE — WP-WEB-003-SUP ──
(function() {
  var featured = document.querySelector('.pgc-pop');
  if (!featured || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { setTimeout(function() { featured.classList.add('animate-in'); }, 150); obs.disconnect(); }
    });
  }, { threshold: 0.4 });
  obs.observe(featured);
})();

// ── HERO SEGMENT SELECTOR — WP-WEB-004 ──
(function() {
  var btns = document.querySelectorAll('.seg-btn');
  if (!btns.length) return;
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var seg = btn.dataset.seg;
      btns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      document.querySelectorAll('.seg-text').forEach(function(el) { el.hidden = (el.dataset.for !== seg); });
    });
  });
})();


// ── ROADMAP TIMELINE — WP-WEB-004 ──
(function() {
  var milestones = document.querySelectorAll('.roadmap-milestone');
  if (!milestones.length || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  milestones.forEach(function(m) { obs.observe(m); });
})();

// ── TOOLTIP DISMISS ON CLICK/ESCAPE — WP-QA-001 BUG #3 ──
(function() {
  document.addEventListener('click', function(e) {
    var term = e.target.closest('.term');
    document.querySelectorAll('.term.active').forEach(function(el) {
      if (el !== term) el.classList.remove('active');
    });
    if (term) term.classList.toggle('active');
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.term.active').forEach(function(el) {
        el.classList.remove('active');
      });
    }
  });
})();

// ── CONTACT PAGE FORM BLUR VALIDATION — WP-QA-001 BUG #29 ──
(function() {
  var form = document.getElementById('contactPageForm');
  if (!form) return;
  form.querySelectorAll('.form-input[required]').forEach(function(input) {
    input.setAttribute('data-touched', 'false');
    input.addEventListener('blur', function() {
      this.setAttribute('data-touched', 'true');
      var errId = this.id + '-err';
      var errEl = document.getElementById(errId);
      if (!errEl) return;
      if (this.type === 'email') {
        var val = this.value.trim();
        if (!val || !val.includes('@') || !val.includes('.')) {
          errEl.style.display = 'block';
        } else {
          errEl.style.display = 'none';
        }
      } else {
        if (!this.value.trim()) {
          errEl.style.display = 'block';
        } else {
          errEl.style.display = 'none';
        }
      }
    });
  });
})();

// ── Module exports (for testing) ─────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    dismissBar: dismissBar,
    toggleMob: toggleMob,
    switchPTab: switchPTab,
    toggleBilling: toggleBilling,
    submitCSRD: submitCSRD,
    caToggleNotify: caToggleNotify,
    caSubmitNotify: caSubmitNotify,
    csrdSelect: csrdSelect,
    csrdShowStep: csrdShowStep,
    csrdMapEmployees: typeof csrdMapEmployees !== 'undefined' ? csrdMapEmployees : null,
    csrdMapTurnover: typeof csrdMapTurnover !== 'undefined' ? csrdMapTurnover : null,
    csrdGetResult: typeof csrdGetResult !== 'undefined' ? csrdGetResult : null,
    get csrdState() { return csrdState; },
    set csrdState(v) { csrdState = v; }
  };
}

/* ── SPOTLIGHT CARD HOVER MODULE — WP-WEB-008 FIX-H ── */
(function () {
  'use strict';
  var cards = document.querySelectorAll('.uc, .hw, .sector, .tc, .pgc, .resource-card, .pc:not(.pc-locked):not(.pc-p3)');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    }, { passive: true });
    card.addEventListener('mouseleave', function () {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    }, { passive: true });
  });
}());

// WP-WEB-006: Sliding tab pill
(function() {
  function positionTabPill() {
    var active = document.querySelector('.tab-btn.active');
    var pill = document.getElementById('tab-pill');
    if (!active || !pill) return;
    var nav = active.closest('.tab-nav');
    if (!nav) return;
    var nr = nav.getBoundingClientRect();
    var br = active.getBoundingClientRect();
    pill.style.width = br.width + 'px';
    pill.style.transform = 'translateX(' + (br.left - nr.left - 4) + 'px)';
  }
  document.addEventListener('DOMContentLoaded', function() {
    positionTabPill();
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setTimeout(positionTabPill, 10); });
    });
  });
  window.addEventListener('resize', positionTabPill, { passive: true });
})();

// ── HERO MOCK COUNTER ANIMATION ──
(function() {
  var counters = document.querySelectorAll('.hero-counter');
  if (!counters.length) return;
  var animated = false;
  function animateCounters() {
    if (animated) return;
    animated = true;
    counters.forEach(function(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var duration = 1800;
      var start = performance.now();
      function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-GB');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { setTimeout(animateCounters, 1000); obs.disconnect(); } });
    }, { threshold: 0.3 });
    counters.forEach(function(c) { obs.observe(c); });
  } else {
    setTimeout(animateCounters, 1000);
  }
})();

// ── SCROLL-TO-TOP ──────────────────────────────────────────────
(function() {
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── PLATFORM CAROUSEL — WP-WEB-003 ──
(function() {
  var screens = document.querySelectorAll('.pc-screen');
  var dots = document.querySelectorAll('button.pc-dot');
  var current = 0;
  var timer;
  if (!screens.length) return;
  window.pcSwitch = function(idx) {
    screens[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = idx;
    screens[current].classList.add('active');
    dots[current].classList.add('active');
    clearInterval(timer);
    timer = setInterval(function() {
      window.pcSwitch((current + 1) % screens.length);
    }, 4000);
  };
  timer = setInterval(function() {
    window.pcSwitch((current + 1) % screens.length);
  }, 4000);
})();

// ── PARTICLE CANVAS — WP-WEB-003 ──
(function() {
  var cv = document.getElementById('ca-particles');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W, H, pts = [];
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W; cv.height = H;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  for (var i = 0; i < 60; i++) {
    pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    });
  }
  var running = false;
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
      if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
      if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(12,201,168,' + (0.1 * (1 - d / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(12,201,168,0.3)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  function start() { if (!running) { running = true; draw(); } }
  function stop() { running = false; }
  if (document.visibilityState === 'visible') start();
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') { start(); } else { stop(); }
  });
})();


// ═══════════════════════════════════════════════════════════════
// PHASE 4: MICRO-INTERACTIONS
// ═══════════════════════════════════════════════════════════════

// ── FADE-IN-UP OBSERVER — staggered card animations ──
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-in-up').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Auto-apply fade-in-up to grid children (cards, sectors, trust items)
  var grids = document.querySelectorAll('.sector-grid, .tc-grid, .hw-grid, .u-grid-3, .methodology-4col, .stats-grid');
  grids.forEach(function(grid) {
    var children = grid.children;
    for (var i = 0; i < children.length; i++) {
      if (!children[i].classList.contains('fade-in-up')) {
        children[i].classList.add('fade-in-up');
        if (i < 6) children[i].classList.add('delay-' + Math.min(i + 1, 4));
      }
      observer.observe(children[i]);
    }
  });

  // Also observe any manually-placed .fade-in-up elements
  document.querySelectorAll('.fade-in-up').forEach(function(el) {
    observer.observe(el);
  });
})();

// ── SWIPE HINT — inject into pricing comparison tables on mobile ──
(function() {
  if (window.innerWidth > 768) return;
  var tables = document.querySelectorAll('.table-scroll-wrapper');
  tables.forEach(function(wrapper) {
    if (wrapper.querySelector('.swipe-hint')) return;
    var hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = 'Swipe to compare <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    wrapper.parentNode.insertBefore(hint, wrapper);
    // Hide hint after first scroll
    var comp = wrapper.closest('.ca-comparison');
    if (comp) {
      comp.addEventListener('scroll', function() {
        hint.style.opacity = '0';
        setTimeout(function() { hint.style.display = 'none'; }, 300);
      }, { once: true, passive: true });
    }
  });
})();


// ═══════════════════════════════════════════════════════════════
// PHASE 5: SHADOW ONBOARDING — Global Intent Capture
// Captures demo postcode and decorates ALL signup links site-wide
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';
  var STORAGE_KEY = 'ca_intent_postcode';

  // Save intent — called from inline runLiveDemo() in index.html
  window.caSaveIntent = function(postcode) {
    if (postcode && typeof postcode === 'string' && postcode.trim()) {
      try { sessionStorage.setItem(STORAGE_KEY, postcode.trim().toUpperCase()); } catch(e) {}
      window.caDecorateSignupLinks();
    }
  };

  // Decorate all signup links with the captured postcode
  window.caDecorateSignupLinks = function() {
    var postcode;
    try { postcode = sessionStorage.getItem(STORAGE_KEY); } catch(e) { return; }
    if (!postcode) return;

    var links = document.querySelectorAll('a[href*="app.crowagent.ai/signup"]');
    links.forEach(function(link) {
      try {
        var url = new URL(link.href);
        if (!url.searchParams.has('postcode')) {
          url.searchParams.set('postcode', postcode);
          link.href = url.toString();
        }
      } catch(e) {}
    });
  };

  // Run on page load if intent already exists (cross-page persistence)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.caDecorateSignupLinks();
    });
  } else {
    window.caDecorateSignupLinks();
  }
})();


// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS — Tabbed product workflow selector
// Generic handler: works with data-hw-tab attributes + .hw-panel
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';
  var tabs = document.querySelectorAll('.how-tab[data-hw-tab]');
  var panels = document.querySelectorAll('.hw-panel');
  var pill = document.querySelector('.how-tab-pill');
  if (!tabs.length || !panels.length) return;

  function positionPill(tab) {
    if (!pill) return;
    pill.style.left = tab.offsetLeft + 'px';
    pill.style.width = tab.offsetWidth + 'px';
  }

  function activate(tabKey) {
    tabs.forEach(function(t) {
      var isActive = t.getAttribute('data-hw-tab') === tabKey;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) positionPill(t);
    });
    panels.forEach(function(p) {
      var isActive = p.id === 'hw-panel-' + tabKey;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });
  }

  // Click handler
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      activate(tab.getAttribute('data-hw-tab'));
    });
  });

  // Keyboard: arrow keys to switch tabs (WAI-ARIA pattern)
  var tabList = document.querySelector('.how-tabs');
  if (tabList) {
    tabList.addEventListener('keydown', function(e) {
      var tabArr = Array.from(tabs);
      var idx = tabArr.indexOf(document.activeElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var next = tabArr[(idx + 1) % tabArr.length];
        next.focus();
        activate(next.getAttribute('data-hw-tab'));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = tabArr[(idx - 1 + tabArr.length) % tabArr.length];
        prev.focus();
        activate(prev.getAttribute('data-hw-tab'));
      }
    });
  }

  // Position pill on load
  var activeTab = document.querySelector('.how-tab.active');
  if (activeTab) positionPill(activeTab);

  // Reposition pill on resize
  window.addEventListener('resize', function() {
    var active = document.querySelector('.how-tab.active');
    if (active) positionPill(active);
  }, { passive: true });
})();
