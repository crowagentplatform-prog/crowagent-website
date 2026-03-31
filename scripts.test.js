/**
 * scripts.test.js
 * Comprehensive tests for scripts.js — exercises event handlers, IIFEs, and all
 * exported functions. DOM is set up BEFORE require() so IIFEs run with elements present.
 */

// ── Global mocks ─────────────────────────────────────────────────────────────

global.IntersectionObserver = class {
  constructor(cb) { this._cb = cb; }
  observe(el) {
    this._cb([{ isIntersecting: true, target: el }]);
  }
  unobserve() {}
  disconnect() {}
};

global.requestAnimationFrame = (() => {
  let t = 0;
  return (cb) => { t += 1000; setTimeout(() => cb(t), 0); return 1; };
})();

global.performance = global.performance || { now: () => Date.now() };

const sessionStoreMock = (() => {
  let store = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'sessionStorage', { value: sessionStoreMock, writable: true });

const localStoreMock = (() => {
  let store = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStoreMock, writable: true });

const swMock = {
  register: jest.fn().mockResolvedValue({ scope: '/' }),
  getRegistrations: jest.fn().mockResolvedValue([]),
};
Object.defineProperty(global.navigator, 'serviceWorker', { value: swMock, writable: true });

global.fetch = jest.fn();
global.alert = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// ── Full DOM template ────────────────────────────────────────────────────────

function setupFullDOM() {
  document.body.innerHTML = `
    <div id="announce-bar" style="display:block">Announce</div>
    <nav>
      <div class="container">
        <ul class="nav-links" id="navLinks">
          <li><a href="#how">How</a></li>
          <li><a href="#products">Products</a></li>
        </ul>
        <div class="hamburger ham" id="hamburger" role="button"
             aria-expanded="false" aria-controls="navLinks" tabindex="0">
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
    <div class="mob-menu"><a href="#">Link</a></div>
    <section id="hero">
      <div class="hero-stats">
        <div class="stat"><div class="stat-val">300</div></div>
      </div>
    </section>
    <section id="how"></section>
    <section id="products"></section>
    <div id="heroSubText">initial</div>
    <div class="trust-card fade-in"></div>
    <div class="trust-card fade-in"></div>
    <button class="segment-pill" data-segment="landlord" aria-pressed="false">Landlord</button>
    <button class="segment-pill" data-segment="supplier" aria-pressed="false">Supplier</button>
    <div id="cookieBanner" hidden>
      <button id="cookieAccept">Accept</button>
      <button id="cookieDecline">Decline</button>
    </div>
    <div id="days-counter"></div>
    <div id="ttoggle"></div>
    <span id="lbl-m">Monthly</span>
    <span id="lbl-a">Annual</span>
    <div class="pv" data-m="49" data-a="39">49</div>
    <div class="pp">/mo</div>
    <div id="core-p" style="display:block">Core</div>
    <div id="mark-p" style="display:none">Mark</div>
    <button class="ptab on">Core</button>
    <button class="ptab">Mark</button>
    <div class="ds-1" style="display:block"><span class="ds-typed"></span></div>
    <div class="ds-2" style="display:none">
      <span class="ds-count">0</span>
      <div class="ds-gap-item" style="opacity:0">Gap 1</div>
    </div>
    <div class="ds-3" style="display:none">Screen 3</div>
    <div id="dd0" class="active"></div>
    <div id="dd1"></div>
    <div id="dd2"></div>
    <form id="csrdForm" novalidate>
      <input id="csrd-company" type="text">
      <input id="csrd-email" type="email">
      <select id="csrd-employees"><option value="250-499">250</option><option value="1000+">1000+</option></select>
      <select id="csrd-turnover"><option value="40m-150m">40m</option></select>
      <button type="submit">Submit</button>
    </form>
    <div id="csrdThankYou" hidden></div>
    <div id="csrd-inline-form">
      <input id="csrd-i-email" type="email">
      <select id="csrd-i-employees"><option value="<250">lt250</option></select>
      <select id="csrd-i-turnover"><option value="<150m">lt150m</option></select>
      <button class="btn-form">Check</button>
    </div>
    <div id="csrd-inline-success" style="display:none">Done</div>
    <div id="csrd-email-err" style="display:none">Error</div>
    <div class="ca-notify-wrap" data-product="crowmark">
      <button class="ca-notify-btn">Notify me</button>
      <div class="ca-notify-form" style="display:none">
        <input class="ca-notify-input" type="email">
        <button class="ca-notify-submit">Submit</button>
      </div>
      <div class="ca-notify-error" style="display:none">Invalid</div>
      <div class="ca-notify-success" style="display:none">Subscribed</div>
    </div>
    <div class="csrd-step" data-csrd-step="1" style="display:block">
      <button class="csrd-option">1000+</button>
      <button class="csrd-option">lt250</button>
    </div>
    <div class="csrd-step" data-csrd-step="2" style="display:none">
      <button class="csrd-option">450m+</button>
    </div>
    <div class="csrd-step" data-csrd-step="3" style="display:none">
      <button class="btn-teal-sm" type="submit">Get result</button>
      <div id="csrd-result"></div>
    </div>
    <div class="sc">Card</div>
    <div class="hw">How</div>
    <a href="#how">Jump</a>
  `;
}

// ── Setup / teardown ─────────────────────────────────────────────────────────

let mod;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.useFakeTimers();
  setupFullDOM();
  sessionStoreMock.clear();
  localStoreMock.clear();
  swMock.register.mockClear();
  swMock.getRegistrations.mockClear();
  fetch.mockReset();
  alert.mockReset();
  jest.resetModules();
  mod = require('./scripts.js');
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ── dismissBar ───────────────────────────────────────────────────────────────

describe('dismissBar', () => {
  test('hides announce bar and stores localStorage key', () => {
    const bar = document.getElementById('announce-bar');
    mod.dismissBar();
    expect(bar.style.display).toBe('none');
    expect(localStoreMock.getItem('ca_bar_dismissed')).toBe('1');
  });

  test('handles missing announce bar', () => {
    document.getElementById('announce-bar').remove();
    expect(() => mod.dismissBar()).not.toThrow();
  });
});

describe('announce bar auto-hide', () => {
  test('hides bar on load when ca_bar_dismissed is set', () => {
    setupFullDOM();
    localStoreMock.setItem('ca_bar_dismissed', '1');
    jest.resetModules();
    require('./scripts.js');
    expect(document.getElementById('announce-bar').style.display).toBe('none');
  });
});

// ── toggleMenu ───────────────────────────────────────────────────────────────

describe('toggleMenu', () => {
  test('click opens nav menu', () => {
    const btn = document.getElementById('hamburger');
    btn.click();
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  test('second click closes nav menu', () => {
    const btn = document.getElementById('hamburger');
    btn.click();
    btn.click();
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
  });

  test('Enter key opens menu', () => {
    const btn = document.getElementById('hamburger');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
  });

  test('Space key opens menu', () => {
    const btn = document.getElementById('hamburger');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
  });

  test('Tab key does not toggle', () => {
    document.getElementById('hamburger').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
  });
});

// ── toggleMob ────────────────────────────────────────────────────────────────

describe('toggleMob', () => {
  test('delegates to toggleMenu', () => {
    mod.toggleMob();
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
  });
});

// ── Escape key ───────────────────────────────────────────────────────────────

describe('Escape key', () => {
  test('closes open menu', () => {
    document.getElementById('hamburger').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
  });

  test('does nothing when menu already closed', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
  });
});

// ── Nav link click ───────────────────────────────────────────────────────────

describe('nav link click', () => {
  test('closes menu when nav link clicked', () => {
    document.getElementById('hamburger').click();
    document.querySelector('#navLinks a').click();
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
  });
});

// ── Hero segment ─────────────────────────────────────────────────────────────

describe('hero segment', () => {
  test('landlord selected on load', () => {
    expect(document.querySelector('[data-segment="landlord"]').classList.contains('segment-pill--selected')).toBe(true);
  });

  test('supplier not selected on load', () => {
    expect(document.querySelector('[data-segment="supplier"]').classList.contains('segment-pill--selected')).toBe(false);
  });

  test('clicking supplier selects it', () => {
    document.querySelector('[data-segment="supplier"]').click();
    expect(document.querySelector('[data-segment="supplier"]').classList.contains('segment-pill--selected')).toBe(true);
    expect(document.querySelector('[data-segment="landlord"]').classList.contains('segment-pill--selected')).toBe(false);
  });

  test('supplier sets PPN 002 text', () => {
    document.querySelector('[data-segment="supplier"]').click();
    expect(document.getElementById('heroSubText').textContent).toContain('PPN 002');
  });

  test('landlord sets MEES text', () => {
    expect(document.getElementById('heroSubText').textContent).toContain('MEES');
  });

  test('Enter key selects pill', () => {
    const s = document.querySelector('[data-segment="supplier"]');
    s.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(s.classList.contains('segment-pill--selected')).toBe(true);
  });

  test('Space key selects pill', () => {
    document.querySelector('[data-segment="supplier"]').click();
    const l = document.querySelector('[data-segment="landlord"]');
    l.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(l.classList.contains('segment-pill--selected')).toBe(true);
  });

  test('Tab key does nothing', () => {
    const s = document.querySelector('[data-segment="supplier"]');
    s.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(s.classList.contains('segment-pill--selected')).toBe(false);
  });
});

// ── switchPTab ───────────────────────────────────────────────────────────────

describe('switchPTab', () => {
  test('switches to mark tab', () => {
    const btn = document.querySelectorAll('.ptab')[1];
    mod.switchPTab('mark', btn);
    expect(document.getElementById('core-p').style.display).toBe('none');
    expect(document.getElementById('mark-p').style.display).toBe('block');
    expect(btn.classList.contains('on')).toBe(true);
  });

  test('switches back to core tab', () => {
    const btn = document.querySelectorAll('.ptab')[0];
    mod.switchPTab('core', btn);
    expect(document.getElementById('core-p').style.display).toBe('block');
    expect(document.getElementById('mark-p').style.display).toBe('none');
  });
});

// ── toggleBilling ────────────────────────────────────────────────────────────

describe('toggleBilling', () => {
  test('switches to annual pricing', () => {
    mod.toggleBilling();
    expect(document.getElementById('ttoggle').classList.contains('ann')).toBe(true);
    expect(document.querySelector('.pv').textContent).toBe('39');
    expect(document.querySelector('.pp').textContent).toBe('/mo (billed annually)');
  });

  test('switches back to monthly pricing', () => {
    mod.toggleBilling();
    mod.toggleBilling();
    expect(document.getElementById('ttoggle').classList.contains('ann')).toBe(false);
    expect(document.querySelector('.pv').textContent).toBe('49');
    expect(document.querySelector('.pp').textContent).toBe('/mo');
  });
});

// ── MEES countdown ───────────────────────────────────────────────────────────

describe('MEES countdown', () => {
  test('sets counter text to a positive number', () => {
    const counter = document.getElementById('days-counter');
    expect(counter.textContent).not.toBe('');
    expect(parseInt(counter.textContent.replace(/,/g, ''))).toBeGreaterThan(0);
  });
});

// ── Cookie consent ───────────────────────────────────────────────────────────

describe('cookie consent', () => {
  test('banner hidden when consent stored', () => {
    setupFullDOM();
    localStoreMock.setItem('ca_cookie_consent', 'accepted');
    jest.resetModules();
    require('./scripts.js');
    jest.advanceTimersByTime(2000);
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
  });

  test('banner shown after 1.5s with no consent', () => {
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
    jest.advanceTimersByTime(1500);
    expect(document.getElementById('cookieBanner').hidden).toBe(false);
  });

  test('Accept stores consent', () => {
    jest.advanceTimersByTime(1500);
    document.getElementById('cookieAccept').click();
    expect(localStoreMock.getItem('ca_cookie_consent')).toBe('accepted');
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
  });

  test('Decline stores declined', () => {
    jest.advanceTimersByTime(1500);
    document.getElementById('cookieDecline').click();
    expect(localStoreMock.getItem('ca_cookie_consent')).toBe('declined');
  });
});

// ── Product demo ─────────────────────────────────────────────────────────────

describe('product demo', () => {
  test('screen 1 visible on load', () => {
    expect(document.querySelector('.ds-1').style.display).toBe('block');
    expect(document.querySelector('.ds-2').style.display).toBe('none');
  });

  test('typing starts on screen 1', () => {
    jest.advanceTimersByTime(2000);
    expect(document.querySelector('.ds-typed').textContent.length).toBeGreaterThan(0);
  });

  test('advances to screen 2 after 7s', () => {
    jest.advanceTimersByTime(7500);
    expect(document.querySelector('.ds-2').style.display).toBe('block');
  });

  test('dot click changes screen', () => {
    document.querySelector('#dd2').click();
    expect(document.querySelector('.ds-3').style.display).toBe('block');
  });
});

// ── submitCSRD ───────────────────────────────────────────────────────────────

describe('submitCSRD', () => {
  test('does nothing with empty fields', () => {
    const e = new Event('submit');
    e.preventDefault = jest.fn();
    mod.submitCSRD(e);
    expect(document.getElementById('csrdThankYou').hidden).toBe(true);
  });

  test('shows thank you on successful submit', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const form = document.getElementById('csrdForm');
    document.getElementById('csrd-company').value = 'Test Ltd';
    document.getElementById('csrd-email').value = 'test@example.com';
    document.getElementById('csrd-employees').value = '1000+';
    document.getElementById('csrd-turnover').value = '40m-150m';
    const e = new Event('submit', { bubbles: true });
    e.preventDefault = jest.fn();
    Object.defineProperty(e, 'target', { value: form });
    await mod.submitCSRD(e);
    expect(fetch).toHaveBeenCalled();
    expect(form.hidden).toBe(true);
    expect(document.getElementById('csrdThankYou').hidden).toBe(false);
  });

  test('handles API error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const form = document.getElementById('csrdForm');
    document.getElementById('csrd-company').value = 'Test';
    document.getElementById('csrd-email').value = 'a@b.com';
    document.getElementById('csrd-employees').value = '250-499';
    document.getElementById('csrd-turnover').value = '40m-150m';
    const e = new Event('submit', { bubbles: true });
    e.preventDefault = jest.fn();
    Object.defineProperty(e, 'target', { value: form });
    await mod.submitCSRD(e);
    expect(alert).toHaveBeenCalled();
  });

  test('handles network error', async () => {
    fetch.mockRejectedValueOnce(new Error('fail'));
    const form = document.getElementById('csrdForm');
    document.getElementById('csrd-company').value = 'Test';
    document.getElementById('csrd-email').value = 'a@b.com';
    document.getElementById('csrd-employees').value = '250-499';
    document.getElementById('csrd-turnover').value = '40m-150m';
    const e = new Event('submit', { bubbles: true });
    e.preventDefault = jest.fn();
    Object.defineProperty(e, 'target', { value: form });
    await mod.submitCSRD(e);
    expect(alert).toHaveBeenCalled();
  });
});

// ── submitCSRDInline ─────────────────────────────────────────────────────────

describe('submitCSRDInline', () => {
  test('shows error on invalid email', () => {
    document.getElementById('csrd-i-email').value = 'bad';
    mod.submitCSRDInline();
    expect(document.getElementById('csrd-email-err').style.display).toBe('block');
  });

  test('submits valid email', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    document.getElementById('csrd-i-email').value = 'user@example.com';
    mod.submitCSRDInline();
    await Promise.resolve();
    await Promise.resolve();
  });

  test('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('fail'));
    document.getElementById('csrd-i-email').value = 'user@example.com';
    mod.submitCSRDInline();
    await Promise.resolve();
    await Promise.resolve();
  });

  test('does nothing without email element', () => {
    document.getElementById('csrd-i-email').remove();
    expect(() => mod.submitCSRDInline()).not.toThrow();
  });
});

// ── caToggleNotify ───────────────────────────────────────────────────────────

describe('caToggleNotify', () => {
  test('hides button and shows form', () => {
    const btn = document.querySelector('.ca-notify-btn');
    mod.caToggleNotify(btn);
    expect(btn.style.display).toBe('none');
    expect(document.querySelector('.ca-notify-form').style.display).toBe('flex');
  });

  test('focuses input', () => {
    const btn = document.querySelector('.ca-notify-btn');
    const spy = jest.spyOn(document.querySelector('.ca-notify-input'), 'focus');
    mod.caToggleNotify(btn);
    expect(spy).toHaveBeenCalled();
  });
});

// ── caSubmitNotify ───────────────────────────────────────────────────────────

describe('caSubmitNotify', () => {
  test('shows error on invalid email', () => {
    const btn = document.querySelector('.ca-notify-submit');
    document.querySelector('.ca-notify-input').value = 'bad';
    mod.caSubmitNotify(btn);
    expect(document.querySelector('.ca-notify-error').style.display).toBe('block');
  });

  test('submits valid email and shows success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const btn = document.querySelector('.ca-notify-submit');
    document.querySelector('.ca-notify-input').value = 'a@b.com';
    await mod.caSubmitNotify(btn);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/waitlist/notify'), expect.anything());
    expect(document.querySelector('.ca-notify-success').style.display).toBe('block');
  });

  test('handles error and still shows success', async () => {
    fetch.mockRejectedValueOnce(new Error('net'));
    const btn = document.querySelector('.ca-notify-submit');
    document.querySelector('.ca-notify-input').value = 'a@b.com';
    await mod.caSubmitNotify(btn);
    expect(document.querySelector('.ca-notify-success').style.display).toBe('block');
  });
});

// ── CSRD wizard ──────────────────────────────────────────────────────────────

describe('csrdMapEmployees', () => {
  test('1000+ returns 1001', () => { expect(mod.csrdMapEmployees('1000+')).toBe(1001); });
  test('250-999 returns 500', () => { expect(mod.csrdMapEmployees('250-999')).toBe(500); });
  test('other returns 100', () => { expect(mod.csrdMapEmployees('<250')).toBe(100); });
});

describe('csrdMapTurnover', () => {
  test('450m+ returns 451000000', () => { expect(mod.csrdMapTurnover('450m+')).toBe(451000000); });
  test('150m-450m returns 200000000', () => { expect(mod.csrdMapTurnover('150m-450m')).toBe(200000000); });
  test('other returns 10000000', () => { expect(mod.csrdMapTurnover('<150m')).toBe(10000000); });
});

describe('csrdGetResult', () => {
  test('mandatory when both exceeded', () => {
    mod.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 };
    expect(mod.csrdGetResult()).toBe('mandatory');
  });

  test('watchlist when employees only exceeded', () => {
    mod.csrdState = { employees: '1000+', turnover: '<150m', sector: null, step: 3 };
    expect(mod.csrdGetResult()).toBe('watchlist');
  });

  test('watchlist when turnover only exceeded', () => {
    mod.csrdState = { employees: '<250', turnover: '450m+', sector: null, step: 3 };
    expect(mod.csrdGetResult()).toBe('watchlist');
  });

  test('not_required when neither exceeded', () => {
    mod.csrdState = { employees: '<250', turnover: '<150m', sector: null, step: 3 };
    expect(mod.csrdGetResult()).toBe('not_required');
  });
});

describe('csrdSelect', () => {
  test('updates state and advances step', () => {
    mod.csrdState = { employees: null, turnover: null, sector: null, step: 1 };
    const evt = { currentTarget: document.querySelector('.csrd-option') };
    mod.csrdSelect('employees', '1000+', evt);
    expect(mod.csrdState.employees).toBe('1000+');
    expect(evt.currentTarget.classList.contains('selected')).toBe(true);
  });

  test('works without event', () => {
    mod.csrdState = { employees: null, turnover: null, sector: null, step: 1 };
    mod.csrdSelect('employees', '1000+');
    expect(mod.csrdState.employees).toBe('1000+');
  });
});

describe('csrdShowStep', () => {
  test('shows target step', () => {
    mod.csrdShowStep(1);
    expect(document.querySelector('[data-csrd-step="1"]').style.display).toBe('block');
  });

  test('resets employees at step 1', () => {
    mod.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 };
    mod.csrdShowStep(1);
    expect(mod.csrdState.employees).toBeNull();
  });

  test('resets turnover at step 2', () => {
    mod.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 };
    mod.csrdShowStep(2);
    expect(mod.csrdState.turnover).toBeNull();
  });
});

describe('csrdSubmit', () => {
  test('does nothing without email element', async () => {
    document.querySelectorAll('#csrd-email').forEach(el => el.remove());
    await mod.csrdSubmit();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('does nothing with invalid email', async () => {
    document.querySelectorAll('#csrd-email').forEach(el => { el.value = 'bad'; });
    await mod.csrdSubmit();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('submits and shows mandatory result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    mod.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 };
    document.querySelectorAll('#csrd-email').forEach(el => { el.value = 'a@b.com'; });
    await mod.csrdSubmit();
    expect(fetch).toHaveBeenCalled();
    const r = document.getElementById('csrd-result');
    if (r) expect(r.innerHTML).toContain('IN SCOPE');
  });

  test('shows watchlist result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    mod.csrdState = { employees: '1000+', turnover: '<150m', sector: null, step: 3 };
    document.querySelectorAll('#csrd-email').forEach(el => { el.value = 'a@b.com'; });
    await mod.csrdSubmit();
    const r = document.getElementById('csrd-result');
    if (r) expect(r.innerHTML).toContain('Watch list');
  });

  test('shows not_required result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    mod.csrdState = { employees: '<250', turnover: '<150m', sector: null, step: 3 };
    document.querySelectorAll('#csrd-email').forEach(el => { el.value = 'a@b.com'; });
    await mod.csrdSubmit();
    const r = document.getElementById('csrd-result');
    if (r) expect(r.innerHTML).toContain('OUT OF SCOPE');
  });

  test('handles API error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mod.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 };
    document.querySelectorAll('#csrd-email').forEach(el => { el.value = 'a@b.com'; });
    await mod.csrdSubmit();
    const r = document.getElementById('csrd-result');
    if (r) expect(r.innerHTML).toContain('Unable to get result');
  });
});

// ── Outside click ────────────────────────────────────────────────────────────

describe('outside click', () => {
  test('closes mob-menu on outside click', () => {
    const menu = document.querySelector('.mob-menu');
    menu.classList.add('open');
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menu.classList.contains('open')).toBe(false);
  });
});

// ── Smooth scroll ────────────────────────────────────────────────────────────

describe('smooth scroll', () => {
  test('anchor click calls scrollIntoView', () => {
    const link = document.querySelector('a[href="#how"]');
    const target = document.getElementById('how');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});

// ── Observers ────────────────────────────────────────────────────────────────

describe('observers', () => {
  test('fade-in elements get visible class', () => {
    document.querySelectorAll('.fade-in').forEach(el => {
      expect(el.classList.contains('visible')).toBe(true);
    });
  });

  test('stagger elements have transition set', () => {
    document.querySelectorAll('.sc, .hw').forEach(el => {
      expect(el.style.transition).toContain('opacity');
    });
  });
});

// ── Service worker ───────────────────────────────────────────────────────────

describe('service worker', () => {
  test('registers SW', () => {
    expect(swMock.register).toHaveBeenCalledWith('/service-worker.js');
  });

  test('stores version', () => {
    expect(sessionStoreMock.getItem('crowagentAppVersion')).toBe('15');
  });

  test('unregisters old SW when version differs', async () => {
    setupFullDOM();
    const mockUnregister = jest.fn().mockResolvedValue(true);
    swMock.getRegistrations.mockResolvedValue([{ unregister: mockUnregister }]);
    sessionStoreMock.setItem('crowagentAppVersion', '7');
    jest.resetModules();
    require('./scripts.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(swMock.getRegistrations).toHaveBeenCalled();
  });

  test('does not unregister when version matches', () => {
    setupFullDOM();
    sessionStoreMock.setItem('crowagentAppVersion', '15');
    swMock.getRegistrations.mockClear();
    jest.resetModules();
    require('./scripts.js');
    expect(swMock.getRegistrations).not.toHaveBeenCalled();
  });
});
