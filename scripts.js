var APP_VERSION = '32';

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
})();

// ── NAV SCROLL OPACITY ──
(function() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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

// ── LOCALE SELECTOR (Language & Currency) ──
(function() {
  var RATES = { GBP: 1, EUR: 1.16, USD: 1.27 };
  var SYMBOLS = { GBP: '\u00A3', EUR: '\u20AC', USD: '$' };
  var LANG_LABELS = { en: 'EN', fr: 'FR', de: 'DE', es: 'ES', cy: 'CY' };
  var MIN_PLAN_PRICE_GBP = 49;
  var PLAN_LINKS = {
    starter: { monthly: 'starter', annual: 'starter_annual' },
    pro: { monthly: 'pro', annual: 'pro_annual' },
    portfolio: { monthly: 'portfolio', annual: 'portfolio_annual' },
    solo: { monthly: 'crowmark_solo', annual: 'crowmark_solo_annual' },
    team: { monthly: 'crowmark_team', annual: 'crowmark_team_annual' },
    agency: { monthly: 'crowmark_agency', annual: 'crowmark_agency_annual' }
  };

  var currentLang = 'en';
  var currentCurrency = 'GBP';
  var currentTheme = 'dark';

  function loadPrefs() {
    try {
      var lang = localStorage.getItem('ca_lang');
      var curr = localStorage.getItem('ca_currency');
      var theme = localStorage.getItem('ca_theme') || localStorage.getItem('ca-theme');
      if (lang && LANG_LABELS[lang]) currentLang = lang;
      if (curr && RATES[curr] !== undefined) currentCurrency = curr;
      if (theme === 'light' || theme === 'dark') {
        currentTheme = theme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        currentTheme = 'light';
      }
    } catch(e) {}
  }

  function savePrefs() {
    try {
      localStorage.setItem('ca_lang', currentLang);
      localStorage.setItem('ca_currency', currentCurrency);
      localStorage.setItem('ca_theme', currentTheme);
      localStorage.setItem('ca-theme', currentTheme);
    } catch(e) {}
  }

  function setTheme(theme) {
    currentTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  function updateThemeButtons() {
    document.querySelectorAll('[data-theme-choice]').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme-choice') === currentTheme);
    });
  }

  function updateTriggerDisplay() {
    var flagEl = document.getElementById('locale-flag');
    var langEl = document.getElementById('locale-lang');
    var currEl = document.getElementById('locale-curr');
    if (!flagEl || !langEl || !currEl) return;

    // Find the active language option to get the flag
    var langOpts = document.querySelectorAll('.locale-opt[data-lang]');
    langOpts.forEach(function(opt) {
      if (opt.getAttribute('data-lang') === currentLang) {
        flagEl.textContent = opt.getAttribute('data-flag');
      }
      opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
    });
    langEl.textContent = LANG_LABELS[currentLang] || 'EN';

    var currOpts = document.querySelectorAll('.locale-opt[data-currency]');
    currOpts.forEach(function(opt) {
      opt.classList.toggle('active', opt.getAttribute('data-currency') === currentCurrency);
    });
    currEl.textContent = SYMBOLS[currentCurrency] + ' ' + currentCurrency;

    // Show language tooltip for non-English selections
    var tooltip = document.getElementById('lang-tooltip');
    if (tooltip) {
      if (currentLang !== 'en') {
        var langNames = { fr: 'French', de: 'German', es: 'Spanish', cy: 'Welsh' };
        tooltip.textContent = 'Full ' + (langNames[currentLang] || '') + ' translation coming Q3 2026.';
        tooltip.style.display = 'block';
        setTimeout(function() { tooltip.style.display = 'none'; }, 3000);
      } else {
        tooltip.style.display = 'none';
      }
    }
    updateThemeButtons();
  }

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

  function convertPrices() {
    var rate = RATES[currentCurrency] || 1;
    var symbol = SYMBOLS[currentCurrency] || '\u00A3';

    // Convert .pv elements (pricing page price values with data-m and data-a)
    document.querySelectorAll('.pv').forEach(function(el) {
      var baseM = parseFloat(el.getAttribute('data-m'));
      var baseA = parseFloat(el.getAttribute('data-a'));
      if (isNaN(baseM)) return;
      var convertedM = Math.round(baseM * rate);
      var convertedA = Math.round(baseA * rate);
      // Store original GBP values if not already stored
      if (!el.getAttribute('data-m-gbp')) {
        el.setAttribute('data-m-gbp', baseM);
        el.setAttribute('data-a-gbp', baseA);
      }
      el.setAttribute('data-m', convertedM);
      el.setAttribute('data-a', convertedA);
      // Update displayed value based on billing toggle state
      var isAnnual = document.getElementById('ttoggle') && document.getElementById('ttoggle').classList.contains('ann');
      el.textContent = isAnnual ? convertedA : convertedM;
    });

    // Update currency symbol before price
    document.querySelectorAll('.pgc-price').forEach(function(el) {
      var first = el.firstChild;
      if (first && first.nodeType === 3) {
        first.textContent = symbol;
      }
    });

    // Update nav price hint — uses first .pv element's monthly price (Starter base price)
    var hint = document.querySelector('.nav-price-hint');
    if (hint) {
      var basePrice = Math.round(MIN_PLAN_PRICE_GBP * rate);
      hint.textContent = 'From ' + symbol + basePrice + '/mo';
    }
  }

  function resetPricesToGBP() {
    // Restore original GBP values before converting
    document.querySelectorAll('.pv').forEach(function(el) {
      var gbpM = el.getAttribute('data-m-gbp');
      var gbpA = el.getAttribute('data-a-gbp');
      if (gbpM) el.setAttribute('data-m', gbpM);
      if (gbpA) el.setAttribute('data-a', gbpA);
    });
  }

  function applyLocale() {
    setTheme(currentTheme);
    updateTriggerDisplay();
    resetPricesToGBP();
    convertPrices();
    updatePlanLinks();
    savePrefs();
  }

  function initLocale() {
    loadPrefs();
    window.caUpdatePlanLinks = updatePlanLinks;

    var trigger = document.getElementById('locale-trigger');
    var dropdown = document.getElementById('locale-dropdown');
    if (trigger && dropdown) {
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('open');
        dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', !isOpen);
      });

      document.addEventListener('click', function(e) {
        var selector = document.getElementById('locale-selector');
        if (selector && !selector.contains(e.target)) {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Language options
    document.querySelectorAll('.locale-opt[data-lang]').forEach(function(opt) {
      opt.addEventListener('click', function() {
        currentLang = opt.getAttribute('data-lang');
        applyLocale();
      });
    });

    // Currency options
    document.querySelectorAll('.locale-opt[data-currency]').forEach(function(opt) {
      opt.addEventListener('click', function() {
        currentCurrency = opt.getAttribute('data-currency');
        applyLocale();
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });

    // Keyboard navigation for locale dropdown
    if (dropdown && trigger) {
      dropdown.addEventListener('keydown', function(e) {
        var opts = Array.from(dropdown.querySelectorAll('.locale-opt'));
        var idx = opts.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          opts[(idx + 1) % opts.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          opts[(idx - 1 + opts.length) % opts.length].focus();
        } else if (e.key === 'Escape') {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    }

    // Mobile locale picker (inside mob-menu)
    document.querySelectorAll('#mob-lang-row .mob-locale-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentLang = btn.getAttribute('data-lang');
        document.querySelectorAll('#mob-lang-row .mob-locale-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyLocale();
      });
    });
    document.querySelectorAll('#mob-curr-row .mob-locale-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentCurrency = btn.getAttribute('data-currency');
        document.querySelectorAll('#mob-curr-row .mob-locale-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyLocale();
      });
    });

    document.querySelectorAll('[data-theme-choice]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentTheme = btn.getAttribute('data-theme-choice') === 'light' ? 'light' : 'dark';
        applyLocale();
      });
    });

    applyLocale();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocale);
  } else {
    initLocale();
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
}
(function() {
  try { if (localStorage.getItem('ca_bar_dismissed')) {
    var b = document.getElementById('announce-bar');
    if (b) b.style.display = 'none';
  }} catch(e) {}
})();

// ── MOBILE HAMBURGER — WP-WEB-HOTFIX-002 ──
var _mobScrollY = 0;
function openMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  _mobScrollY = window.pageYOffset || document.documentElement.scrollTop;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + _mobScrollY + 'px';
  document.body.style.width = '100%';
  menu.classList.add('open');
  var firstLink = menu.querySelector('a');
  if (firstLink) firstLink.focus();
  var ham = document.querySelector('.ham');
  if (ham) ham.setAttribute('aria-expanded', 'true');
}
function closeMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.height = '';
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
document.querySelectorAll('.mob-menu a').forEach(function(a) {
  a.addEventListener('click', function() {
    closeMob();
  });
});

// ── PRICING PRODUCT TAB SWITCHER ──
function switchPTab(product, btn) {
  document.querySelectorAll('.ptab').forEach(function(t) { t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById('core-p').style.display = product === 'core' ? 'block' : 'none';
  document.getElementById('mark-p').style.display = product === 'mark' ? 'block' : 'none';
}

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

// ── MEES COUNTDOWN ──
(function() {
  var el = document.getElementById('days-counter');
  if (!el) return;
  var deadline = new Date('2028-04-01T00:00:00Z');
  var now = new Date();
  var days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  el.textContent = days.toLocaleString('en-GB');
})();

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
  }).catch(function(){}).finally(function(){
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
  } catch(e) {}
  var notifyForm = wrap.querySelector('.ca-notify-form');
  if (notifyForm) notifyForm.style.display = 'none';
  if (successEl) successEl.style.display = 'block';
}

// ── CSRD INLINE EMAIL BLUR VALIDATION ──
(function() {
  var el = document.getElementById('csrd-i-email');
  if (!el) return;
  el.addEventListener('blur', function() {
    var err = document.getElementById('csrd-email-err');
    var val = el.value.trim();
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      if (err) err.style.display = 'block';
    } else {
      if (err) err.style.display = 'none';
    }
  });
  el.addEventListener('input', function() {
    var err = document.getElementById('csrd-email-err');
    if (err) err.style.display = 'none';
  });
})();

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
        err.style.cssText = 'display:block;font-size:12px;color:#EF4444;margin-top:4px;';
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
      html = '<div style="background:rgba(245,158,11,.1);border:1px solid var(--warn);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--warn);font-size:16px">Watch list &mdash; thresholds may change</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">One threshold exceeded. Monitor regulatory updates as scope criteria may evolve.</p></div>';
    } else {
      html = '<div style="background:rgba(138,157,184,.08);border:1px solid var(--steel);border-radius:10px;padding:20px;text-align:center"><strong style="color:var(--cloud);font-size:16px">Your organisation is likely OUT OF SCOPE</strong><p style="color:var(--steel);font-size:13px;margin:8px 0 0">Neither threshold exceeded under current Omnibus I criteria.</p></div>';
    }
    if (resultDiv) resultDiv.innerHTML = html;
    if (submitBtn) { submitBtn.textContent = 'Result ready'; submitBtn.style.background = 'var(--teal)'; }
  } catch(e) {
    console.error('CSRD form error:', e);
    if (resultDiv) resultDiv.innerHTML = '<div style="background:rgba(240,68,56,.1);border:1px solid var(--err);border-radius:10px;padding:16px;text-align:center;color:var(--err)">Unable to get result. Please try again.</div>';
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Get my result'; }
  }
}

// ── CONTACT FORM SUBMISSION ──
(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var submitBtn = document.getElementById('contactSubmit');
    var successMsg = document.getElementById('formSuccess');
    var errorMsg = document.getElementById('formError');

    var name = document.getElementById('contact-name').value.trim();
    var email = document.getElementById('contact-email').value.trim();

    if (!name || !email || !email.includes('@')) {
      document.getElementById('contact-name').classList.toggle('input-error', !name);
      document.getElementById('contact-email').classList.toggle('input-error', !email.includes('@'));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    var formData = new FormData(form);
    var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdpkaol';

    if (FORMSPREE_ENDPOINT.includes('REPLACE_WITH_FORM_ID')) {
      var subject = encodeURIComponent('CrowAgent enquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nOrg: ' + formData.get('organisation') + '\nProduct: ' + formData.get('product') + '\nMessage: ' + formData.get('message'));
      window.location.href = 'mailto:hello@crowagent.ai?subject=' + subject + '&body=' + body;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
      return;
    }

    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(response) {
      if (response.ok) {
        form.reset();
        successMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(function() {
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    });
  });
})();

// ── CSRD SHARE MECHANIC ──
(function() {
  window.showCsrdShare = function(isInScope, companyName) {
    var shareDiv = document.getElementById('csrdShare');
    var linkedinLink = document.getElementById('csrdLinkedInShare');
    var copyBtn = document.getElementById('csrdCopyLink');

    if (!shareDiv) return;

    var shareText = isInScope
      ? (companyName || 'This company') + ' is in scope of CSRD Omnibus I reporting requirements. Check your company at crowagent.ai'
      : (companyName || 'This company') + ' is currently out of scope of CSRD Omnibus I. Check your company at crowagent.ai';

    var linkedinUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://crowagent.ai/#csrd') + '&summary=' + encodeURIComponent(shareText);

    linkedinLink.href = linkedinUrl;
    shareDiv.style.display = 'block';

    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText('https://crowagent.ai/#csrd').then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy link'; }, 2000);
      }).catch(function() {
        copyBtn.textContent = 'crowagent.ai/#csrd';
      });
    });
  };
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

// ── FOOTER SYSTEM STATUS — WP-WEB-003-SUP ──
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
  .catch(function() { dot.className = 'footer-status-dot offline'; label.textContent = 'Status unavailable'; });
})();

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

// ── CUSTOM CURSOR — WP-WEB-004 ──
(function() {
  if (!matchMedia('(pointer: fine)').matches) return;
  var cur = document.getElementById('cursor');
  var dot = document.getElementById('cursor-dot');
  if (!cur || !dot) return;
  var mx=0,my=0,cx=0,cy=0;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
  },{passive:true});
  (function loop(){
    cx+=(mx-cx)*0.12; cy+=(my-cy)*0.12;
    cur.style.left=Math.round(cx)+'px'; cur.style.top=Math.round(cy)+'px';
    requestAnimationFrame(loop);
  })();
  var hoverEls = document.querySelectorAll('a,button,[role="button"],.tab-btn,.faq-q,.term');
  hoverEls.forEach(function(el){
    el.addEventListener('mouseenter',function(){ cur.classList.add('hover'); },{passive:true});
    el.addEventListener('mouseleave',function(){ cur.classList.remove('hover'); },{passive:true});
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

// ── Module exports (for testing) ─────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    dismissBar: dismissBar,
    toggleMob: toggleMob,
    switchPTab: switchPTab,
    toggleBilling: toggleBilling,
    submitCSRDInline: submitCSRDInline,
    caToggleNotify: caToggleNotify,
    csrdSelect: csrdSelect,
    csrdShowStep: csrdShowStep,
    csrdMapEmployees: csrdMapEmployees,
    csrdMapTurnover: csrdMapTurnover,
    csrdGetResult: csrdGetResult,
    get csrdState() { return csrdState; },
    set csrdState(v) { csrdState = v; }
  };
}
