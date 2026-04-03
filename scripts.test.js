/**
 * scripts.test.js
 * Tests for scripts.js — covers global functions and DOM event handlers.
 * DOM is set up BEFORE require() so IIFEs run with elements present.
 */

// ── Global mocks (must be before require) ────────────────────────────────────

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

// matchMedia mock (jsdom doesn't provide it)
window.matchMedia = window.matchMedia || function(query) {
  return {
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; },
  };
};

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

global.fetch = jest.fn();
global.alert = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// ── Full DOM template ────────────────────────────────────────────────────────

function setupFullDOM() {
  document.body.innerHTML = `
    <div id="announce-bar" style="display:block">Announce</div>
    <nav role="navigation" aria-label="Main navigation">
      <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;height:64px">
        <div class="nav-links" id="navLinks">
          <a href="#how">How</a>
          <a href="#products">Products</a>
        </div>
        <div class="nav-actions">
          <div class="locale-selector" id="locale-selector">
            <button class="locale-trigger" id="locale-trigger" aria-haspopup="true" aria-expanded="false">
              <span id="locale-flag">GB</span>
              <span id="locale-lang">EN</span>
              <span id="locale-curr">&pound; GBP</span>
            </button>
            <div class="locale-dropdown" id="locale-dropdown" role="menu">
              <button class="locale-opt" role="menuitem" data-lang="en" data-flag="GB">EN</button>
              <button class="locale-opt" role="menuitem" data-lang="fr" data-flag="FR">FR</button>
              <button class="locale-opt" role="menuitem" data-currency="GBP" data-symbol="£">£ GBP</button>
              <button class="locale-opt" role="menuitem" data-currency="EUR" data-symbol="€">€ EUR</button>
              <button class="theme-opt active" role="menuitem" data-theme-choice="dark">Dark</button>
              <button class="theme-opt" role="menuitem" data-theme-choice="light">Light</button>
              <div class="locale-note" id="locale-note" style="display:none">Translation coming soon</div>
            </div>
          </div>
          <span class="nav-price-hint">From £149/mo</span>
        </div>
        <div class="ham hamburger" id="hamburger" role="button" aria-expanded="false" tabindex="0">
          <span></span><span></span><span></span>
        </div>
        <div class="mob-theme-row">
          <button class="mob-theme-btn active" data-theme-choice="dark">Dark</button>
          <button class="mob-theme-btn" data-theme-choice="light">Light</button>
        </div>
      </div>
    </nav>
    <div class="mob-menu">
      <a href="#how">How</a>
      <a href="#products">Products</a>
      <div class="mob-locale">
        <div id="mob-lang-row">
          <button class="mob-locale-btn active" data-lang="en">EN</button>
          <button class="mob-locale-btn" data-lang="fr">FR</button>
        </div>
        <div id="mob-curr-row">
          <button class="mob-locale-btn active" data-currency="GBP">GBP</button>
          <button class="mob-locale-btn" data-currency="EUR">EUR</button>
        </div>
      </div>
    </div>
    <main id="main-content" role="main">
      <section id="hero">
        <div class="hero-stats">
          <div class="stat"><div class="stat-val">300+</div></div>
        </div>
      </section>
      <section id="how"></section>
      <section id="products"></section>
      <div id="heroSubText">initial</div>
      <button class="segment-pill" data-segment="landlord" aria-pressed="false">Landlord</button>
      <button class="segment-pill" data-segment="supplier" aria-pressed="false">Supplier</button>
      <div id="days-counter"></div>
      <div id="ttoggle"></div>
      <span id="lbl-m">Monthly</span>
      <span id="lbl-a">Annual</span>
      <div class="pv" data-m="149" data-a="119">149</div>
      <div class="pp">/mo</div>
      <div id="core-p" style="display:block">Core</div>
      <div id="mark-p" style="display:none">Mark</div>
      <a id="starter-link" data-plan-tier="starter" href="https://app.crowagent.ai/signup?plan=starter">Starter</a>
      <a id="solo-link" data-plan-tier="solo" href="https://app.crowagent.ai/signup?plan=crowmark_solo">Solo</a>
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
      <div class="sc">Card</div>
      <div class="hw">How</div>

      <!-- Test elements for CSRD / forms / notify -->
      <form id="csrd-inline-form">
        <input type="email" id="csrd-i-email" value="test@test.com" />
        <select id="csrd-i-employees"><option value="<250">&lt;250</option></select>
        <select id="csrd-i-turnover"><option value="<150m">&lt;150m</option></select>
        <button class="btn-form" type="button">Test</button>
        <span id="csrd-email-err" style="display:none">Error</span>
      </form>
      <div id="csrd-inline-success" style="display:none">Success</div>

      <div class="ca-notify-wrap" data-product="mees">
        <button class="btn">Notify Me</button>
        <div class="ca-notify-form" style="display:none">
          <input class="ca-notify-input" value="test@test.com" />
          <button class="btn ca-notify-submit">Submit</button>
          <span class="ca-notify-error" style="display:none">Err</span>
        </div>
        <span class="ca-notify-success" style="display:none">Success</span>
      </div>
    </main>
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
  localStoreMock.clear();
  sessionStoreMock.clear();
  fetch.mockReset();
  alert.mockReset();
  jest.resetModules();
  mod = require('./scripts.js');
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ── dismissBar ──────────────────────────────────────────────────────────────

describe('dismissBar', () => {
  test('hides announce bar and stores localStorage key', () => {
    const bar = document.getElementById('announce-bar');
    mod.dismissBar();
    expect(bar.style.display).toBe('none');
    expect(localStoreMock.getItem('ca_bar_dismissed')).toBe('1');
  });

  test('handles missing announce bar gracefully', () => {
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

// ── toggleMob ───────────────────────────────────────────────────────────────

describe('toggleMob', () => {
  test('opens the mobile menu', () => {
    const menu = document.querySelector('.mob-menu');
    mod.toggleMob();
    expect(menu.classList.contains('open')).toBe(true);
  });

  test('second call closes the mobile menu', () => {
    const menu = document.querySelector('.mob-menu');
    mod.toggleMob();
    mod.toggleMob();
    expect(menu.classList.contains('open')).toBe(false);
  });

  test('focuses first link when opened', () => {
    const menu = document.querySelector('.mob-menu');
    const firstLink = menu.querySelector('a');
    mod.toggleMob();
    expect(document.activeElement).toBe(firstLink);
  });
});

// ── Mobile menu auto-close ──────────────────────────────────────────────────

describe('mob-menu link click', () => {
  test('clicking a mob-menu link closes the menu', () => {
    const menu = document.querySelector('.mob-menu');
    mod.toggleMob();
    expect(menu.classList.contains('open')).toBe(true);
    menu.querySelector('a').click();
    expect(menu.classList.contains('open')).toBe(false);
  });
});

// ── switchPTab ──────────────────────────────────────────────────────────────

describe('switchPTab', () => {
  test('switches to mark product tab', () => {
    const tabs = document.querySelectorAll('.ptab');
    mod.switchPTab('mark', tabs[1]);
    expect(document.getElementById('core-p').style.display).toBe('none');
    expect(document.getElementById('mark-p').style.display).toBe('block');
    expect(tabs[1].classList.contains('on')).toBe(true);
    expect(tabs[0].classList.contains('on')).toBe(false);
  });

  test('switches back to core product tab', () => {
    const tabs = document.querySelectorAll('.ptab');
    mod.switchPTab('mark', tabs[1]);
    mod.switchPTab('core', tabs[0]);
    expect(document.getElementById('core-p').style.display).toBe('block');
    expect(document.getElementById('mark-p').style.display).toBe('none');
  });
});

// ── toggleBilling ───────────────────────────────────────────────────────────

describe('toggleBilling', () => {
  test('toggles to annual pricing', () => {
    mod.toggleBilling();
    const toggle = document.getElementById('ttoggle');
    expect(toggle.classList.contains('ann')).toBe(true);
    const pv = document.querySelector('.pv');
    expect(pv.textContent).toBe('119');
    expect(document.querySelector('.pp').textContent).toBe('/mo (billed annually)');
  });

  test('toggles back to monthly', () => {
    mod.toggleBilling();
    mod.toggleBilling();
    const toggle = document.getElementById('ttoggle');
    expect(toggle.classList.contains('ann')).toBe(false);
    const pv = document.querySelector('.pv');
    expect(pv.textContent).toBe('149');
    expect(document.querySelector('.pp').textContent).toBe('/mo');
  });

  test('updates signup plan params when billing cadence changes', () => {
    mod.toggleBilling();
    expect(document.getElementById('starter-link').href).toContain('plan=starter_annual');
    expect(document.getElementById('solo-link').href).toContain('plan=crowmark_solo_annual');

    mod.toggleBilling();
    expect(document.getElementById('starter-link').href).toContain('plan=starter');
    expect(document.getElementById('solo-link').href).toContain('plan=crowmark_solo');
  });
});

// ── Locale selector ─────────────────────────────────────────────────────────

describe('locale selector', () => {
  test('saves language preference to localStorage', () => {
    const frBtn = document.querySelector('.locale-opt[data-lang="fr"]');
    frBtn.click();
    expect(localStoreMock.getItem('ca_lang')).toBe('fr');
  });

  test('saves currency preference to localStorage', () => {
    const eurBtn = document.querySelector('.locale-opt[data-currency="EUR"]');
    eurBtn.click();
    expect(localStoreMock.getItem('ca_currency')).toBe('EUR');
  });

  test('trigger click opens dropdown', () => {
    const trigger = document.getElementById('locale-trigger');
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  test('second trigger click closes dropdown', () => {
    const trigger = document.getElementById('locale-trigger');
    trigger.click();
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  test('theme buttons persist and apply the selected theme', () => {
    const lightBtn = document.querySelector('.theme-opt[data-theme-choice="light"]');
    lightBtn.click();
    expect(localStoreMock.getItem('ca_theme')).toBe('light');
    expect(localStoreMock.getItem('ca-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(lightBtn.classList.contains('active')).toBe(true);
  });
});

// ── Mobile locale picker ────────────────────────────────────────────────────

describe('mobile locale picker', () => {
  test('clicking FR button saves language', () => {
    const frBtn = document.querySelector('#mob-lang-row .mob-locale-btn:not(.active)');
    frBtn.click();
    expect(localStoreMock.getItem('ca_lang')).toBe('fr');
  });

  test('clicking EUR button saves currency', () => {
    const eurBtn = document.querySelector('#mob-curr-row .mob-locale-btn:not(.active)');
    eurBtn.click();
    expect(localStoreMock.getItem('ca_currency')).toBe('EUR');
  });
});

// ── Days counter ────────────────────────────────────────────────────────────

describe('days counter', () => {
  test('days-counter element is populated on load', () => {
    const el = document.getElementById('days-counter');
    expect(el.textContent).not.toBe('');
  });
});

// ── Intersection Observer animations ────────────────────────────────────────

describe('intersection observer animations', () => {
  test('.sc elements get opacity set to 1 on intersection', () => {
    jest.advanceTimersByTime(500);
    const sc = document.querySelector('.sc');
    expect(sc.style.opacity).toBe('1');
  });

  test('.hw elements get opacity set to 1 on intersection', () => {
    jest.advanceTimersByTime(500);
    const hw = document.querySelector('.hw');
    expect(hw.style.opacity).toBe('1');
  });
});

// ── APP_VERSION ─────────────────────────────────────────────────────────────

describe('APP_VERSION', () => {
  test('APP_VERSION is exported or mod is valid', () => {
    expect(typeof mod).toBe('object');
  });
});

// ── Submit Notify ────────────────────────────────────────────────────────
describe('notify / waitlist functions', () => {
  beforeEach(() => { jest.useRealTimers(); });
  afterEach(() => { jest.useFakeTimers(); });
  
  test('caToggleNotify reveals form', () => {
    const wrap = document.querySelector('.ca-notify-wrap');
    const btn = wrap.querySelector('.btn');
    const form = wrap.querySelector('.ca-notify-form');
    
    // Simulate onclick
    mod.caToggleNotify(btn);
    expect(btn.style.display).toBe('none');
    expect(form.style.display).toBe('flex');
  });

  test('caSubmitNotify triggers fetch and shows success', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    
    const wrap = document.querySelector('.ca-notify-wrap');
    const submitBtn = wrap.querySelector('.ca-notify-submit');
    
    await mod.caSubmitNotify(submitBtn);
    
    expect(fetch).toHaveBeenCalled();
    expect(submitBtn.disabled).toBe(true);
    expect(wrap.querySelector('.ca-notify-form').style.display).toBe('none');
    expect(wrap.querySelector('.ca-notify-success').style.display).toBe('block');
  });
});

// ── CSRD Inline ──────────────────────────────────────────────────────────
describe('csrd inline forms', () => {
  beforeEach(() => { jest.useRealTimers(); });
  afterEach(() => { jest.useFakeTimers(); });

  test('submitCSRDInline calls fetch with mapped inputs', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    
    // Add mock global functions for mapping
    global.csrdMapEmployees = (val) => val;
    global.csrdMapTurnover = (val) => val;
    
    await mod.submitCSRDInline();
    
    expect(fetch).toHaveBeenCalled();
    // Allow Promise chain to settle
    await Promise.resolve();
    await Promise.resolve();
    
    const form = document.getElementById('csrd-inline-form');
    const success = document.getElementById('csrd-inline-success');
    expect(form.style.display).toBe('none');
    // success block is changed synchronously? No, inside finally()
    expect(success.style.display).toBe('block');
  });
});

describe('submitCSRD', () => {
  beforeEach(() => { jest.useRealTimers(); });
  afterEach(() => { jest.useFakeTimers(); });

  test('handles form submission successfully', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    document.body.innerHTML = `
      <form id="csrd-main-form">
        <input type="text" value="Acme" />
        <input type="email" value="test@acme.com" />
        <select><option value="1">1</option></select>
        <select><option value="2">2</option></select>
        <button class="btn-form">Submit</button>
      </form>
    `;
    const form = document.getElementById('csrd-main-form');
    await mod.submitCSRD({ preventDefault: jest.fn(), target: form });
    
    expect(fetch).toHaveBeenCalled();
    const btn = form.querySelector('.btn-form');
    expect(btn.innerHTML).toContain('Report sent');
  });
});
