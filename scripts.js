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
  document.querySelector('.mob-menu').classList.toggle('open');
}

// ── PRICING PRODUCT TAB SWITCHER ──
function switchPTab(product, btn) {
  document.querySelectorAll('.ptab').forEach(function(t) { t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById('core-p').style.display = product === 'core' ? 'grid' : 'none';
  document.getElementById('mark-p').style.display = product === 'mark' ? 'grid' : 'none';
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
})();

// ── CSRD FORM SUBMISSION ──
async function submitCSRD(e) {
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.btn-form');
  var orig = btn.innerHTML;

  // Client-side email validation (Fix 10)
  var inputs = form.querySelectorAll('input');
  var emailInput = inputs[1];
  var errorEl = form.querySelector('.form-error');
  var emailVal = emailInput ? emailInput.value.trim() : '';
  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Please enter a valid email address'; }
    return;
  }
  if (errorEl) errorEl.style.display = 'none';

  btn.innerHTML = 'Sending\u2026 <span>\u27F3</span>';
  btn.disabled = true;

  var selects = form.querySelectorAll('select');
  var data = {
    company: inputs[0] ? inputs[0].value : '',
    email: emailVal,
    employees: selects[0] ? selects[0].value : '',
    turnover: selects[1] ? selects[1].value : ''
  };

  try {
    var res = await fetch(
      'https://crowagent-platform-production.up.railway.app/api/v1/csrd/assess',
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
    alert('Sorry \u2014 please email hello@crowagent.ai directly with your company details.');
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

// ── COOKIE CONSENT BANNER (Fix 11) ──
(function() {
  var e = document.getElementById('cookieBanner');
  if (!e) return;
  if (!localStorage.getItem('ca_cookie_consent')) {
    setTimeout(function() { e.hidden = false; }, 1500);
  }
  var accept = document.getElementById('cookieAccept');
  var decline = document.getElementById('cookieDecline');
  if (accept) accept.addEventListener('click', function() {
    localStorage.setItem('ca_cookie_consent', 'accepted');
    e.hidden = true;
  });
  if (decline) decline.addEventListener('click', function() {
    localStorage.setItem('ca_cookie_consent', 'declined');
    e.hidden = true;
  });
})();

// ── NOTIFY-ME INLINE EMAIL CAPTURE (Fix 13) ──
function toggleNotifyMe(btn) {
  var wrapper = btn.closest('.notify-me-wrapper');
  btn.style.display = 'none';
  wrapper.querySelector('.notify-me-form').style.display = 'flex';
  wrapper.querySelector('.notify-email-input').focus();
}

async function submitNotify(btn) {
  var wrapper = btn.closest('.notify-me-wrapper');
  var emailInput = wrapper.querySelector('.notify-email-input');
  var email = emailInput.value.trim();
  var product = wrapper.dataset.product;
  var errorEl = wrapper.querySelector('.notify-error');
  var successEl = wrapper.querySelector('.notify-success');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorEl.style.display = 'block';
    return;
  }
  errorEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    await fetch(
      'https://crowagent-platform-production' +
      '.up.railway.app/api/v1/waitlist/notify',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ product: product, email: email })
      }
    );
  } catch (e) {
    // Fail silently — show success anyway to avoid frustrating users
  }
  wrapper.querySelector('.notify-me-form').style.display = 'none';
  successEl.style.display = 'block';
}
