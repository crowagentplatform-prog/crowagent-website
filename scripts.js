var APP_VERSION = '15';

// ── LOCALE SELECTOR (Language & Currency) ──
(function() {
  var RATES = { GBP: 1, EUR: 1.16, USD: 1.27 };
  var SYMBOLS = { GBP: '\u00A3', EUR: '\u20AC', USD: '$' };
  var LANG_LABELS = { en: 'EN', fr: 'FR', de: 'DE', es: 'ES', cy: 'CY' };

  var currentLang = 'en';
  var currentCurrency = 'GBP';

  function loadPrefs() {
    try {
      var lang = localStorage.getItem('ca_lang');
      var curr = localStorage.getItem('ca_currency');
      if (lang && LANG_LABELS[lang]) currentLang = lang;
      if (curr && RATES[curr] !== undefined) currentCurrency = curr;
    } catch(e) {}
  }

  function savePrefs() {
    try {
      localStorage.setItem('ca_lang', currentLang);
      localStorage.setItem('ca_currency', currentCurrency);
    } catch(e) {}
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

    // Show/hide translation note
    var note = document.getElementById('locale-note');
    if (note) note.style.display = currentLang !== 'en' ? 'block' : 'none';
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
      var firstPv = document.querySelector('.pv[data-m]');
      var basePrice = firstPv ? Math.round(parseInt(firstPv.getAttribute('data-m'), 10) * rate) : Math.round(49 * rate);
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
    updateTriggerDisplay();
    resetPricesToGBP();
    convertPrices();
    savePrefs();
  }

  function initLocale() {
    loadPrefs();

    var trigger = document.getElementById('locale-trigger');
    var dropdown = document.getElementById('locale-dropdown');
    if (!trigger || !dropdown) return;

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

    applyLocale();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocale);
  } else {
    initLocale();
  }
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

// ── MOBILE HAMBURGER ──
function toggleMob() {
  var menu = document.querySelector('.mob-menu');
  menu.classList.toggle('open');
  if (menu.classList.contains('open')) {
    var firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}
// Auto-close mobile menu on internal link click
document.querySelectorAll('.mob-menu a').forEach(function(a) {
  a.addEventListener('click', function() {
    document.querySelector('.mob-menu').classList.remove('open');
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
      errBox.style.cssText = 'background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px 14px;margin-top:12px;color:var(--err);font-size:13px;font-family:Inter,sans-serif';
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

// ── SMOOTH SCROLL for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
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
