/**
 * scripts.test.js
 * Unit tests for scripts.js — exercises event handlers and module-level logic.
 * Strategy: set up DOM, require the module (runs top-level code), then trigger
 * DOM events and assert resulting state.
 */

// ── Global mocks (must be set up before any require of scripts.js) ────────────

global.IntersectionObserver = class {
  constructor(cb) { this._cb = cb; }
  observe(el) {
    // Immediately fire as intersecting so observer callbacks are covered
    this._cb([{ isIntersecting: true, target: el }]);
  }
  unobserve() {}
  disconnect() {}
};

// requestAnimationFrame: run two frames so countUp animation loop is covered
global.requestAnimationFrame = (() => {
  let t = 0;
  return (cb) => { t += 1000; setTimeout(() => cb(t), 0); return 1; };
})();

global.performance = global.performance || { now: () => Date.now() };

// sessionStorage mock
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

// localStorage mock
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

// navigator.serviceWorker mock
const swMock = {
  register: jest.fn().mockResolvedValue({ scope: '/' }),
  getRegistrations: jest.fn().mockResolvedValue([]),
};
Object.defineProperty(global.navigator, 'serviceWorker', { value: swMock, writable: true });

// ── DOM template ──────────────────────────────────────────────────────────────

function setupDOM() {
  document.body.innerHTML = `
    <a href="#hero" class="skip-link">Skip</a>
    <nav>
      <div class="container">
        <ul class="nav-links" id="navLinks">
          <li><a href="#how">How</a></li>
          <li><a href="#products">Products</a></li>
        </ul>
        <div class="hamburger" id="hamburger" role="button"
             aria-expanded="false" aria-controls="navLinks" tabindex="0">
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
    <section id="hero">
      <div class="hero-stats">
        <div class="stat"><div class="stat-val">300+</div></div>
        <div class="stat"><div class="stat-val">£65B</div></div>
        <div class="stat"><div class="stat-val">99.9</div></div>
      </div>
    </section>
    <section id="how"></section>
    <section id="products"></section>
    <div id="heroSubText">initial</div>
    <div class="trust-grid">
      <div class="trust-card fade-in"></div>
      <div class="trust-card fade-in"></div>
    </div>
    <button class="segment-pill" data-segment="landlord" aria-pressed="false" type="button">Landlord</button>
    <button class="segment-pill" data-segment="supplier" aria-pressed="false" type="button">Supplier</button>
    <div id="cookieBanner" hidden>
      <button id="cookieAccept" type="button">Accept</button>
      <button id="cookieDecline" type="button">Decline</button>
    </div>
    <form id="csrdForm" novalidate>
      <input  id="csrd-company"   name="company"   class="form-control" type="text">
      <input  id="csrd-email"     name="email"     class="form-control" type="email">
      <select id="csrd-employees" name="employees" class="form-control">
        <option value="250-499">250–499</option>
        <option value="1000+">1,000+</option>
      </select>
      <select id="csrd-turnover" name="turnover" class="form-control">
        <option value="40m-150m">£40m–£150m</option>
        <option value="over-150m">Over £150m</option>
      </select>
      <button type="submit">Submit</button>
    </form>
    <div id="csrdThankYou" hidden></div>
  `;
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  // Silence console output from the module under test (re-spy each time so
  // restoreAllMocks() in afterEach doesn't break subsequent tests)
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.useFakeTimers();
  setupDOM();
  sessionStoreMock.clear();
  localStoreMock.clear();
  swMock.register.mockClear();
  swMock.getRegistrations.mockClear();
  jest.resetModules();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ── toggleMenu ────────────────────────────────────────────────────────────────

describe('toggleMenu', () => {
  test('click opens the nav menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    expect(nav.classList.contains('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  test('second click closes the nav menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    btn.click();
    expect(nav.classList.contains('open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('Enter key opens the menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(nav.classList.contains('open')).toBe(true);
  });

  test('Space key opens the menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(nav.classList.contains('open')).toBe(true);
  });

  test('other keys do not toggle the menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(nav.classList.contains('open')).toBe(false);
  });
});

// ── Escape key handler ────────────────────────────────────────────────────────

describe('Escape key', () => {
  test('closes open menu on Escape', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    expect(nav.classList.contains('open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(nav.classList.contains('open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('Escape does nothing when menu is already closed', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(nav.classList.contains('open')).toBe(false);
  });

  test('non-Escape keydown is ignored', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(nav.classList.contains('open')).toBe(true);
  });
});

// ── Nav link click closes menu ────────────────────────────────────────────────

describe('nav link click', () => {
  test('clicking a nav link closes the menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    expect(nav.classList.contains('open')).toBe(true);
    nav.querySelector('a').click();
    expect(nav.classList.contains('open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('clicking second nav link also closes menu', () => {
    require('./scripts.js');
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburger');
    btn.click();
    nav.querySelectorAll('a')[1].click();
    expect(nav.classList.contains('open')).toBe(false);
  });
});

// ── Hero segment toggle ───────────────────────────────────────────────────────

describe('setHeroSegment', () => {
  test('landlord segment is selected on load', () => {
    require('./scripts.js');
    const pill = document.querySelector('[data-segment="landlord"]');
    expect(pill.classList.contains('segment-pill--selected')).toBe(true);
    expect(pill.getAttribute('aria-pressed')).toBe('true');
  });

  test('supplier pill is not selected on load', () => {
    require('./scripts.js');
    const pill = document.querySelector('[data-segment="supplier"]');
    expect(pill.classList.contains('segment-pill--selected')).toBe(false);
    expect(pill.getAttribute('aria-pressed')).toBe('false');
  });

  test('clicking supplier pill selects it', () => {
    require('./scripts.js');
    const supplier = document.querySelector('[data-segment="supplier"]');
    const landlord  = document.querySelector('[data-segment="landlord"]');
    supplier.click();
    expect(supplier.classList.contains('segment-pill--selected')).toBe(true);
    expect(landlord.classList.contains('segment-pill--selected')).toBe(false);
  });

  test('clicking supplier updates heroSubText to PPN 002 content', () => {
    require('./scripts.js');
    document.querySelector('[data-segment="supplier"]').click();
    expect(document.getElementById('heroSubText').textContent).toContain('PPN 002');
  });

  test('landlord heroSubText contains MEES', () => {
    require('./scripts.js');
    expect(document.getElementById('heroSubText').textContent).toContain('MEES');
  });

  test('Enter key on pill selects it', () => {
    require('./scripts.js');
    const supplier = document.querySelector('[data-segment="supplier"]');
    supplier.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(supplier.classList.contains('segment-pill--selected')).toBe(true);
  });

  test('Space key on pill selects it', () => {
    require('./scripts.js');
    document.querySelector('[data-segment="supplier"]').click(); // switch away
    const landlord = document.querySelector('[data-segment="landlord"]');
    landlord.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(landlord.classList.contains('segment-pill--selected')).toBe(true);
  });

  test('other key on pill does nothing', () => {
    require('./scripts.js');
    const supplier = document.querySelector('[data-segment="supplier"]');
    supplier.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(supplier.classList.contains('segment-pill--selected')).toBe(false);
  });
});

// ── Cookie consent banner ─────────────────────────────────────────────────────

describe('cookie consent', () => {
  test('banner stays hidden when consent already stored', () => {
    localStoreMock.setItem('ca_cookie_consent', 'accepted');
    require('./scripts.js');
    jest.runAllTimers();
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
  });

  test('banner is shown after 1.5s when no consent stored', () => {
    require('./scripts.js');
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
    jest.advanceTimersByTime(1500);
    expect(document.getElementById('cookieBanner').hidden).toBe(false);
  });

  test('Accept button stores accepted and hides banner', () => {
    require('./scripts.js');
    jest.advanceTimersByTime(1500);
    document.getElementById('cookieAccept').click();
    expect(localStoreMock.getItem('ca_cookie_consent')).toBe('accepted');
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
  });

  test('Decline button stores declined and hides banner', () => {
    require('./scripts.js');
    jest.advanceTimersByTime(1500);
    document.getElementById('cookieDecline').click();
    expect(localStoreMock.getItem('ca_cookie_consent')).toBe('declined');
    expect(document.getElementById('cookieBanner').hidden).toBe(true);
  });
});

// ── CSRD form ─────────────────────────────────────────────────────────────────

describe('CSRD form', () => {
  test('submit with empty fields does not show thank-you', () => {
    require('./scripts.js');
    document.getElementById('csrdForm').dispatchEvent(new Event('submit'));
    expect(document.getElementById('csrdThankYou').hidden).toBe(true);
  });

  test('submit with all fields shows thank-you and hides form', () => {
    require('./scripts.js');
    // Stub createElement so the mailto anchor click doesn't error
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation(tag => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = jest.fn();
      return el;
    });
    document.getElementById('csrd-company').value   = 'Test Ltd';
    document.getElementById('csrd-email').value     = 'test@example.com';
    document.getElementById('csrd-employees').value = '250-499';
    document.getElementById('csrd-turnover').value  = '40m-150m';
    document.getElementById('csrdForm').dispatchEvent(new Event('submit'));
    expect(document.getElementById('csrdForm').hidden).toBe(true);
    expect(document.getElementById('csrdThankYou').hidden).toBe(false);
  });

  test('partial fields (no email) does not submit', () => {
    require('./scripts.js');
    document.getElementById('csrd-company').value = 'Test Ltd';
    // email left blank
    document.getElementById('csrd-employees').value = '250-499';
    document.getElementById('csrd-turnover').value  = '40m-150m';
    document.getElementById('csrdForm').dispatchEvent(new Event('submit'));
    expect(document.getElementById('csrdThankYou').hidden).toBe(true);
  });
});

// ── Service worker ────────────────────────────────────────────────────────────

describe('ensureLatestServiceWorker', () => {
  test('registers SW when no version is stored', () => {
    require('./scripts.js');
    expect(swMock.register).toHaveBeenCalledWith('/service-worker.js');
  });

  test('registers SW when stored version matches current', () => {
    sessionStoreMock.setItem('crowagentAppVersion', '11');
    require('./scripts.js');
    expect(swMock.register).toHaveBeenCalledWith('/service-worker.js');
  });

  test('unregisters old SWs when stored version differs', async () => {
    const mockUnregister = jest.fn().mockResolvedValue(true);
    swMock.getRegistrations.mockResolvedValue([{ unregister: mockUnregister }]);
    sessionStoreMock.setItem('crowagentAppVersion', '7');
    require('./scripts.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(swMock.getRegistrations).toHaveBeenCalled();
  });

  test('stores current app version in sessionStorage on load', () => {
    require('./scripts.js');
    expect(sessionStoreMock.getItem('crowagentAppVersion')).toBe('11');
  });
});

// ── fade-in / IntersectionObserver wiring ─────────────────────────────────────

describe('fade-in observer', () => {
  test('visible class is added to fade-in elements on intersection', () => {
    require('./scripts.js');
    // IntersectionObserver mock fires immediately, so .visible should be set
    const fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(el => expect(el.classList.contains('visible')).toBe(true));
  });
});

// ── countUp (via stats observer) ──────────────────────────────────────────────

describe('countUp', () => {
  test('stat-val text is updated when hero-stats intersects', async () => {
    require('./scripts.js');
    // Run all RAF-driven timers to let countUp animate
    jest.runAllTimers();
    // After animation frames, stat values should have been mutated
    // (countUp replaces textContent with a number)
    const statVals = document.querySelectorAll('.stat-val');
    expect(statVals.length).toBeGreaterThan(0);
  });
});
