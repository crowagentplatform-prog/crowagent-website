/**
 * crowagent.test.js — CrowAgent Website Comprehensive Test Suite
 * Run: npx jest crowagent.test.js
 */

// ── Global mocks ──────────────────────────────────────────────────────────────

global.IntersectionObserver = class {
  constructor(cb) { this._cb = cb; }
  observe(el) { this._cb([{ isIntersecting: true, target: el }]); }
  unobserve() {}
  disconnect() {}
};

global.requestAnimationFrame = (() => {
  let t = 0;
  return (cb) => { t += 1000; setTimeout(() => cb(t), 0); return 1; };
})();

global.performance = global.performance || { now: () => Date.now() };

window.matchMedia = window.matchMedia || function (query) {
  return {
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; },
  };
};

const _lsMock = (() => {
  let s = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(s, k) ? s[k] : null,
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
    clear: () => { s = {}; },
  };
})();
Object.defineProperty(global, 'localStorage',  { value: _lsMock, writable: true });
Object.defineProperty(global, 'sessionStorage', { value: _lsMock, writable: true });

// ── Helpers ───────────────────────────────────────────────────────────────────
const el  = id  => document.getElementById(id);
const qs  = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(()  => console.error.mockRestore());
beforeEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-theme');
  _lsMock.clear();
  jest.clearAllMocks();
});

// ── 1. MODULE EXPORTS ─────────────────────────────────────────────────────────
describe('Module exports', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('dismissBar',       () => expect(typeof m.dismissBar).toBe('function'));
  test('toggleMob',        () => expect(typeof m.toggleMob).toBe('function'));
  test('toggleBilling',    () => expect(typeof m.toggleBilling).toBe('function'));
  test('csrdGetResult',    () => expect(typeof m.csrdGetResult).toBe('function'));
  test('csrdMapEmployees', () => expect(typeof m.csrdMapEmployees).toBe('function'));
  test('csrdMapTurnover',  () => expect(typeof m.csrdMapTurnover).toBe('function'));
  test('csrdState',        () => expect(typeof m.csrdState).toBe('object'));
  test('switchPTab',       () => expect(typeof m.switchPTab).toBe('function'));
  test('caToggleNotify',   () => expect(typeof m.caToggleNotify).toBe('function'));
  test('caSubmitNotify',   () => expect(typeof m.caSubmitNotify).toBe('function'));
});

// ── 2. ANNOUNCE BAR ───────────────────────────────────────────────────────────
describe('dismissBar()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('hides bar element', () => {
    document.body.innerHTML = '<div id="announce-bar" style="display:block"></div>';
    m.dismissBar();
    expect(el('announce-bar').style.display).toBe('none');
  });
  test('persists to localStorage', () => {
    document.body.innerHTML = '<div id="announce-bar"></div>';
    m.dismissBar();
    expect(_lsMock.getItem('ca_bar_dismissed')).toBe('1');
  });
  test('no throw when bar absent', () => {
    document.body.innerHTML = '';
    expect(() => m.dismissBar()).not.toThrow();
  });
});

// ── 3. MOBILE MENU ────────────────────────────────────────────────────────────
describe('toggleMob()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = () => { document.body.innerHTML = '<button class="ham" aria-expanded="false"></button><nav class="mob-menu"><a href="#">L</a></nav>'; };
  test('opens menu',                    () => { setup(); m.toggleMob(); expect(qs('.mob-menu').classList.contains('open')).toBe(true); });
  test('closes open menu',              () => { setup(); m.toggleMob(); m.toggleMob(); expect(qs('.mob-menu').classList.contains('open')).toBe(false); });
  test('aria-expanded true on open',    () => { setup(); m.toggleMob(); expect(qs('.ham').getAttribute('aria-expanded')).toBe('true'); });
  test('aria-expanded false on close',  () => { setup(); m.toggleMob(); m.toggleMob(); expect(qs('.ham').getAttribute('aria-expanded')).toBe('false'); });
  test('adds no-scroll on open',        () => { setup(); m.toggleMob(); expect(document.body.classList.contains('no-scroll')).toBe(true); });
  test('removes no-scroll on close',    () => { setup(); m.toggleMob(); m.toggleMob(); expect(document.body.classList.contains('no-scroll')).toBe(false); });
  test('no throw when menu absent',     () => { document.body.innerHTML = ''; expect(() => m.toggleMob()).not.toThrow(); });
});

// ── 4. BILLING TOGGLE ─────────────────────────────────────────────────────────
// toggleBilling uses a module-level isAnn flag — reset module each test
describe('toggleBilling()', () => {
  const setup = () => {
    jest.resetModules();
    document.body.innerHTML = '<div id="ttoggle"></div><span id="lbl-m">M</span><span id="lbl-a">A</span><span class="pv" data-m="149" data-a="119">149</span><span class="pp">/mo</span>';
    return require('./scripts.js');
  };
  test('adds .ann on first toggle',       () => { const m = setup(); m.toggleBilling(); expect(el('ttoggle').classList.contains('ann')).toBe(true); });
  test('removes .ann on second toggle',   () => { const m = setup(); m.toggleBilling(); m.toggleBilling(); expect(el('ttoggle').classList.contains('ann')).toBe(false); });
  test('shows annual price after toggle', () => { const m = setup(); m.toggleBilling(); expect(qs('.pv').textContent).toBe('119'); });
  test('reverts to monthly price',        () => { const m = setup(); m.toggleBilling(); m.toggleBilling(); expect(qs('.pv').textContent).toBe('149'); });
  test('.pp shows annually when annual',  () => { const m = setup(); m.toggleBilling(); expect(qs('.pp').textContent).toContain('annually'); });
  test('.pp reverts to /mo',              () => { const m = setup(); m.toggleBilling(); m.toggleBilling(); expect(qs('.pp').textContent).toBe('/mo'); });
});

// ── 5. PRICING TAB SWITCHER ───────────────────────────────────────────────────
describe('switchPTab()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = () => { document.body.innerHTML = '<button class="ptab on" id="btn-core">Core</button><button class="ptab" id="btn-mark">Mark</button><div id="core-p" style="display:grid"></div><div id="mark-p" style="display:none"></div><div id="core-compare"></div><div id="mark-compare" style="display:none"></div>'; };
  test('hides core when switching to mark',   () => { setup(); m.switchPTab('mark', el('btn-mark')); expect(el('core-p').style.display).toBe('none'); });
  test('shows mark panel',                    () => { setup(); m.switchPTab('mark', el('btn-mark')); expect(el('mark-p').style.display).toBe('grid'); });
  test('adds .on to mark button',             () => { setup(); m.switchPTab('mark', el('btn-mark')); expect(el('btn-mark').classList.contains('on')).toBe(true); });
  test('removes .on from core button',        () => { setup(); m.switchPTab('mark', el('btn-mark')); expect(el('btn-core').classList.contains('on')).toBe(false); });
  test('shows core-compare on switch back',   () => { setup(); m.switchPTab('mark', el('btn-mark')); m.switchPTab('core', el('btn-core')); expect(el('core-compare').style.display).not.toBe('none'); });
});

// ── 6. CSRD MAPPING HELPERS ───────────────────────────────────────────────────
describe('csrdMapEmployees()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('1000+ returns >1000',           () => expect(m.csrdMapEmployees('1000+')).toBeGreaterThan(1000));
  test('250-999 returns 250-999 range', () => { const v = m.csrdMapEmployees('250-999'); expect(v).toBeGreaterThanOrEqual(250); expect(v).toBeLessThan(1000); });
  test('unknown returns <250',          () => expect(m.csrdMapEmployees('other')).toBeLessThan(250));
  test('always returns a number',       () => ['1000+','250-999','other','',null,undefined].forEach(v => expect(typeof m.csrdMapEmployees(v)).toBe('number')));
});

describe('csrdMapTurnover()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('450m+ returns >450M',               () => expect(m.csrdMapTurnover('450m+')).toBeGreaterThan(450000000));
  test('150m-450m returns 150M-450M range', () => { const v = m.csrdMapTurnover('150m-450m'); expect(v).toBeGreaterThanOrEqual(150000000); expect(v).toBeLessThan(450000000); });
  test('unknown returns <150M',             () => expect(m.csrdMapTurnover('other')).toBeLessThan(150000000));
  test('always returns a number',           () => ['450m+','150m-450m','other','',null,undefined].forEach(v => expect(typeof m.csrdMapTurnover(v)).toBe('number')));
});

// ── 7. CSRD GET RESULT ────────────────────────────────────────────────────────
describe('csrdGetResult()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('mandatory when both thresholds exceeded',  () => { m.csrdState = { employees: '1000+', turnover: '450m+',     sector: null, step: 3 }; expect(m.csrdGetResult()).toBe('mandatory'); });
  test('watchlist when only employees exceeded',   () => { m.csrdState = { employees: '1000+', turnover: '150m-450m', sector: null, step: 3 }; expect(m.csrdGetResult()).toBe('watchlist'); });
  test('watchlist when only turnover exceeded',    () => { m.csrdState = { employees: '250-999', turnover: '450m+',   sector: null, step: 3 }; expect(m.csrdGetResult()).toBe('watchlist'); });
  test('not_required when neither exceeded',       () => { m.csrdState = { employees: '250-999', turnover: '150m-450m', sector: null, step: 3 }; expect(m.csrdGetResult()).toBe('not_required'); });
  test('no throw on null state',                   () => { m.csrdState = { employees: null, turnover: null, sector: null, step: 1 }; expect(() => m.csrdGetResult()).not.toThrow(); });
});

// ── 8. CSRD SHOW STEP ─────────────────────────────────────────────────────────
describe('csrdShowStep()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = () => {
    document.body.innerHTML = `
      <div class="csrd-step" data-csrd-step="1" style="display:block"><h2>S1</h2><div class="csrd-option">A</div></div>
      <div class="csrd-step" data-csrd-step="2" style="display:none"><h2>S2</h2></div>
      <div class="csrd-step" data-csrd-step="3" style="display:none"><h2>S3</h2><div id="csrd-result"></div></div>
      <div class="csrd-progress-step" data-step="1"></div>
      <div class="csrd-progress-step" data-step="2"></div>
      <div class="csrd-progress-step" data-step="3"></div>`;
  };
  test('shows target step',                     () => { setup(); m.csrdShowStep(2); expect(qs('[data-csrd-step="2"]').style.display).toBe('block'); });
  test('hides other steps',                     () => { setup(); m.csrdShowStep(2); expect(qs('[data-csrd-step="1"]').style.display).toBe('none'); });
  test('marks target step active',              () => { setup(); m.csrdShowStep(2); expect(qs('[data-csrd-step="2"]').classList.contains('active')).toBe(true); });
  test('marks progress step active',            () => { setup(); m.csrdShowStep(2); expect(qs('.csrd-progress-step[data-step="2"]').classList.contains('csrd-progress-active')).toBe(true); });
  test('marks prior progress steps done',       () => { setup(); m.csrdShowStep(3); expect(qs('.csrd-progress-step[data-step="1"]').classList.contains('csrd-progress-done')).toBe(true); });
  test('renders verdict on step 3',             () => { setup(); m.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 2 }; m.csrdShowStep(3); expect(el('csrd-result').innerHTML).not.toBe(''); });
  test('resets employees when back to step 1',  () => { setup(); m.csrdState = { employees: '1000+', turnover: '450m+', sector: null, step: 3 }; m.csrdShowStep(1); expect(m.csrdState.employees).toBeNull(); });
});

// ── 9. CSRD FORM SUBMISSION ───────────────────────────────────────────────────
describe('submitCSRD()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = () => {
    document.body.innerHTML = `<form id="csrd-form">
      <input type="text" value="Acme Ltd" /><input type="email" value="test@example.com" />
      <select><option value="250-999" selected>250-999</option></select>
      <select><option value="150m-450m" selected>150m-450m</option></select>
      <button class="btn-form">Submit</button></form>`;
  };
  test('calls preventDefault',                () => { setup(); global.fetch = jest.fn().mockResolvedValue({ ok: true }); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; return m.submitCSRD(e).then(() => expect(e.preventDefault).toHaveBeenCalled()); });
  test('disables button during request',       () => { setup(); let res; global.fetch = jest.fn().mockReturnValue(new Promise(r => { res = r; })); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; const p = m.submitCSRD(e); expect(qs('.btn-form').disabled).toBe(true); res({ ok: true }); return p; });
  test('shows success text on 200',            () => { setup(); global.fetch = jest.fn().mockResolvedValue({ ok: true }); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; return m.submitCSRD(e).then(() => expect(qs('.btn-form').innerHTML).toContain('sent')); });
  test('re-enables button on network failure', () => { setup(); global.fetch = jest.fn().mockRejectedValue(new Error('fail')); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; return m.submitCSRD(e).then(() => expect(qs('.btn-form').disabled).toBe(false)); });
  test('shows error message on failure',       () => { setup(); global.fetch = jest.fn().mockRejectedValue(new Error('fail')); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; return m.submitCSRD(e).then(() => expect(qs('.csrd-form-error').textContent).toContain('hello@crowagent.ai')); });
  test('posts to correct API endpoint',        () => { setup(); global.fetch = jest.fn().mockResolvedValue({ ok: true }); const e = { preventDefault: jest.fn(), target: el('csrd-form') }; return m.submitCSRD(e).then(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/csrd/check'), expect.objectContaining({ method: 'POST' }))); });
});

// ── 10. NOTIFY-ME ─────────────────────────────────────────────────────────────
describe('caToggleNotify()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = () => { document.body.innerHTML = '<div class="ca-notify-wrap" data-product="x"><button class="ca-notify-trigger">Notify</button><div class="ca-notify-form" style="display:none"><input class="ca-notify-input" type="email"/><button class="ca-notify-submit">Go</button></div><div class="ca-notify-error" style="display:none"></div><div class="ca-notify-success" style="display:none"></div></div>'; };
  test('hides trigger button',         () => { setup(); m.caToggleNotify(qs('.ca-notify-trigger')); expect(qs('.ca-notify-trigger').style.display).toBe('none'); });
  test('shows notify form',            () => { setup(); m.caToggleNotify(qs('.ca-notify-trigger')); expect(qs('.ca-notify-form').style.display).toBe('flex'); });
  test('no throw when wrap missing',   () => { document.body.innerHTML = '<button class="x">X</button>'; expect(() => m.caToggleNotify(qs('.x'))).not.toThrow(); });
});

describe('caSubmitNotify()', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  const setup = (email = '') => { document.body.innerHTML = `<div class="ca-notify-wrap" data-product="x"><div class="ca-notify-form" style="display:flex"><input class="ca-notify-input" type="email" value="${email}"/><button class="ca-notify-submit">Go</button></div><div class="ca-notify-error" style="display:none"></div><div class="ca-notify-success" style="display:none"></div></div>`; };
  test('shows error for invalid email',                     () => { setup('bad'); return m.caSubmitNotify(qs('.ca-notify-submit')).then(() => expect(qs('.ca-notify-error').style.display).toBe('block')); });
  test('no fetch for invalid email',                        () => { setup('bad'); global.fetch = jest.fn(); return m.caSubmitNotify(qs('.ca-notify-submit')).then(() => expect(global.fetch).not.toHaveBeenCalled()); });
  test('shows success on valid email + ok fetch',           () => { setup('u@e.com'); global.fetch = jest.fn().mockResolvedValue({ ok: true }); return m.caSubmitNotify(qs('.ca-notify-submit')).then(() => expect(qs('.ca-notify-success').style.display).toBe('block')); });
  test('hides form after success',                          () => { setup('u@e.com'); global.fetch = jest.fn().mockResolvedValue({ ok: true }); return m.caSubmitNotify(qs('.ca-notify-submit')).then(() => expect(qs('.ca-notify-form').style.display).toBe('none')); });
  test('shows success even when fetch throws (fire+forget)',() => { setup('u@e.com'); global.fetch = jest.fn().mockRejectedValue(new Error('net')); return m.caSubmitNotify(qs('.ca-notify-submit')).then(() => expect(qs('.ca-notify-success').style.display).toBe('block')); });
});

// ── 11. COOKIE CONSENT ────────────────────────────────────────────────────────
describe('Cookie consent', () => {
  const KEY = 'ca_cookie_consent_v2';
  const setup = () => { document.body.innerHTML = '<div id="ca-cookie" style="display:none"><div id="ca-cookie-simple" style="display:flex"><button id="ca-cookie-accept">Accept</button><button id="ca-cookie-reject">Reject</button><button id="ca-cookie-manage">Manage</button></div><div id="ca-cookie-detail" style="display:none"><input type="checkbox" id="ca-cookie-analytics"/><input type="checkbox" id="ca-cookie-marketing"/><button id="ca-cookie-save">Save</button><button id="ca-cookie-accept-all">All</button></div></div><a id="ca-cookie-reopen" href="#">Reopen</a>'; };

  test('banner hidden when valid consent stored', () => {
    _lsMock.setItem(KEY, JSON.stringify({ necessary: true, analytics: true, marketing: false, ts: Date.now() }));
    setup(); jest.resetModules(); require('./scripts.js');
    expect(el('ca-cookie').style.display).toBe('none');
  });
  test('accept-all saves analytics=true marketing=true', () => {
    setup(); jest.resetModules(); require('./scripts.js');
    el('ca-cookie-accept').click();
    const s = JSON.parse(_lsMock.getItem(KEY));
    expect(s.analytics).toBe(true); expect(s.marketing).toBe(true);
  });
  test('reject saves analytics=false marketing=false', () => {
    setup(); jest.resetModules(); require('./scripts.js');
    el('ca-cookie-reject').click();
    const s = JSON.parse(_lsMock.getItem(KEY));
    expect(s.analytics).toBe(false); expect(s.marketing).toBe(false);
  });
  test('manage shows detail panel', () => {
    setup(); jest.resetModules(); require('./scripts.js');
    el('ca-cookie-manage').click();
    expect(el('ca-cookie-detail').style.display).toBe('flex');
  });
  test('save persists checkbox state', () => {
    setup(); jest.resetModules(); require('./scripts.js');
    el('ca-cookie-analytics').checked = true; el('ca-cookie-marketing').checked = false;
    el('ca-cookie-save').click();
    const s = JSON.parse(_lsMock.getItem(KEY));
    expect(s.analytics).toBe(true); expect(s.marketing).toBe(false);
  });
  test('necessary is always true', () => {
    setup(); jest.resetModules(); require('./scripts.js');
    el('ca-cookie-reject').click();
    expect(JSON.parse(_lsMock.getItem(KEY)).necessary).toBe(true);
  });
  test('v1 consent migrated to v2', () => {
    _lsMock.setItem('ca-cookie-ok', '1');
    setup(); jest.resetModules(); require('./scripts.js');
    expect(JSON.parse(_lsMock.getItem(KEY))).not.toBeNull();
  });
});

// ── 12. LOCALE / CURRENCY ─────────────────────────────────────────────────────
describe('Locale & currency', () => {
  const setup = () => { document.body.innerHTML = '<div id="locale-selector"><button id="locale-trigger" aria-expanded="false"><span id="locale-flag">🇬🇧</span><span id="locale-lang">EN</span><span id="locale-curr">£ GBP</span></button><div id="locale-dropdown"><button class="locale-opt" data-lang="en" data-flag="🇬🇧">EN</button><button class="locale-opt" data-lang="fr" data-flag="🇫🇷">FR</button><button class="locale-opt" data-currency="GBP">GBP</button><button class="locale-opt" data-currency="EUR">EUR</button><button class="locale-opt" data-currency="USD">USD</button></div></div><div id="lang-tooltip" style="display:none"></div><span class="pv" data-m="149" data-a="119">149</span><div id="ttoggle"></div><span id="lbl-m">M</span><span id="lbl-a">A</span>'; };

  test('trigger opens dropdown',              () => { setup(); jest.resetModules(); require('./scripts.js'); el('locale-trigger').click(); expect(el('locale-dropdown').classList.contains('open')).toBe(true); });
  test('trigger sets aria-expanded=true',     () => { setup(); jest.resetModules(); require('./scripts.js'); el('locale-trigger').click(); expect(el('locale-trigger').getAttribute('aria-expanded')).toBe('true'); });
  test('outside click closes dropdown',       () => { setup(); jest.resetModules(); require('./scripts.js'); el('locale-trigger').click(); document.body.click(); expect(el('locale-dropdown').classList.contains('open')).toBe(false); });
  test('EUR updates locale-curr display',     () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.locale-opt[data-currency="EUR"]').click(); expect(el('locale-curr').textContent).toContain('EUR'); });
  test('EUR converts prices upward',          () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.locale-opt[data-currency="EUR"]').click(); expect(parseInt(qs('.pv').textContent, 10)).toBeGreaterThan(149); });
  test('USD converts prices upward',          () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.locale-opt[data-currency="USD"]').click(); expect(parseInt(qs('.pv').textContent, 10)).toBeGreaterThan(149); });
  test('FR shows tooltip',                    () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.locale-opt[data-lang="fr"]').click(); expect(el('lang-tooltip').style.display).toBe('block'); });
  test('currency saved to localStorage',      () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.locale-opt[data-currency="USD"]').click(); expect(_lsMock.getItem('ca_currency')).toBe('USD'); });
  test('saved currency applied on init',      () => { _lsMock.setItem('ca_currency', 'EUR'); setup(); jest.resetModules(); require('./scripts.js'); expect(el('locale-curr').textContent).toContain('EUR'); });
});

// ── 13. THEME TOGGLE ──────────────────────────────────────────────────────────
describe('Theme toggle', () => {
  const setup = () => { document.body.innerHTML = '<div id="locale-selector"><button id="locale-trigger" aria-expanded="false"><span id="locale-flag">🇬🇧</span><span id="locale-lang">EN</span><span id="locale-curr">£ GBP</span></button><div id="locale-dropdown"><button class="locale-opt" data-lang="en" data-flag="🇬🇧">EN</button><button class="locale-opt" data-currency="GBP">GBP</button></div></div><div id="lang-tooltip" style="display:none"></div><button data-theme-choice="light">Light</button><button data-theme-choice="dark">Dark</button><div id="ttoggle"></div><span id="lbl-m">M</span><span id="lbl-a">A</span>'; };

  test('light sets data-theme=light',   () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-theme-choice="light"]').click(); expect(document.documentElement.getAttribute('data-theme')).toBe('light'); });
  test('dark sets data-theme=dark',     () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-theme-choice="light"]').click(); qs('[data-theme-choice="dark"]').click(); expect(document.documentElement.getAttribute('data-theme')).toBe('dark'); });
  test('theme saved to localStorage',   () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-theme-choice="light"]').click(); expect(_lsMock.getItem('ca_theme')).toBe('light'); });
  test('saved theme applied on init',   () => { _lsMock.setItem('ca_theme', 'light'); setup(); jest.resetModules(); require('./scripts.js'); expect(document.documentElement.getAttribute('data-theme')).toBe('light'); });
});

// ── 14. CONTACT FORM ──────────────────────────────────────────────────────────
describe('Contact page form', () => {
  const setup = () => { document.body.innerHTML = '<form id="contactPageForm"><input id="cp-name" class="form-input" type="text" required value=""/><span id="cp-name-err" style="display:none">Err</span><input id="cp-email" class="form-input" type="email" required value=""/><span id="cp-email-err" style="display:none">Err</span><button id="cpSubmitBtn" type="submit">Send</button><div id="cpFormSuccess" style="display:none">OK</div><div id="cpFormError" style="display:none">Fail</div></form>'; };

  test('shows name error when name empty',    () => { setup(); jest.resetModules(); require('./scripts.js'); el('cp-email').value = 'a@b.com'; el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); expect(el('cp-name-err').style.display).toBe('block'); });
  test('shows email error when email invalid',() => { setup(); jest.resetModules(); require('./scripts.js'); el('cp-name').value = 'Alice'; el('cp-email').value = 'bad'; el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); expect(el('cp-email-err').style.display).toBe('block'); });
  test('no fetch when validation fails',      () => { setup(); jest.resetModules(); require('./scripts.js'); global.fetch = jest.fn(); el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); expect(global.fetch).not.toHaveBeenCalled(); });
  test('calls Formspree on valid submit',     async () => { setup(); jest.resetModules(); require('./scripts.js'); global.fetch = jest.fn().mockResolvedValue({ ok: true }); el('cp-name').value = 'Alice'; el('cp-email').value = 'alice@example.com'; el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 0)); expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('formspree.io'), expect.any(Object)); });
  test('shows success on ok response',        async () => { setup(); jest.resetModules(); require('./scripts.js'); global.fetch = jest.fn().mockResolvedValue({ ok: true }); el('cp-name').value = 'Alice'; el('cp-email').value = 'alice@example.com'; el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 0)); expect(el('cpFormSuccess').style.display).toBe('block'); });
  test('shows error on failed response',      async () => { setup(); jest.resetModules(); require('./scripts.js'); global.fetch = jest.fn().mockResolvedValue({ ok: false }); el('cp-name').value = 'Alice'; el('cp-email').value = 'alice@example.com'; el('contactPageForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 0)); expect(el('cpFormError').style.display).toBe('block'); });
});

// ── 15. HERO SEGMENT SELECTOR ─────────────────────────────────────────────────
describe('Hero segment selector', () => {
  const setup = () => { document.body.innerHTML = '<button class="seg-btn active" data-seg="landlord" aria-pressed="true">L</button><button class="seg-btn" data-seg="supplier" aria-pressed="false">S</button><button class="seg-btn" data-seg="csrd" aria-pressed="false">C</button><span class="seg-text" data-for="landlord">L</span><span class="seg-text" data-for="supplier" hidden>S</span><span class="seg-text" data-for="csrd" hidden>C</span>'; };
  test('clicking supplier marks it active',           () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-seg="supplier"]').click(); expect(qs('[data-seg="supplier"]').classList.contains('active')).toBe(true); });
  test('removes active from landlord',                () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-seg="supplier"]').click(); expect(qs('[data-seg="landlord"]').classList.contains('active')).toBe(false); });
  test('shows supplier seg-text',                     () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-seg="supplier"]').click(); expect(qs('.seg-text[data-for="supplier"]').hidden).toBe(false); });
  test('hides landlord seg-text',                     () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-seg="supplier"]').click(); expect(qs('.seg-text[data-for="landlord"]').hidden).toBe(true); });
  test('aria-pressed updated correctly',              () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-seg="csrd"]').click(); expect(qs('[data-seg="csrd"]').getAttribute('aria-pressed')).toBe('true'); expect(qs('[data-seg="landlord"]').getAttribute('aria-pressed')).toBe('false'); });
});

// ── 16. FAQ ACCORDION ─────────────────────────────────────────────────────────
describe('FAQ accordion', () => {
  const setup = () => { document.body.innerHTML = '<button class="faq-q" aria-expanded="false">Q1</button><div class="faq-a" hidden>A1</div><button class="faq-q" aria-expanded="false">Q2</button><div class="faq-a" hidden>A2</div>'; };
  test('click expands answer',           () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.faq-q').click(); expect(qs('.faq-a').hasAttribute('hidden')).toBe(false); });
  test('second click collapses answer',  () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.faq-q').click(); qs('.faq-q').click(); expect(qs('.faq-a').hasAttribute('hidden')).toBe(true); });
  test('aria-expanded=true when open',   () => { setup(); jest.resetModules(); require('./scripts.js'); qs('.faq-q').click(); expect(qs('.faq-q').getAttribute('aria-expanded')).toBe('true'); });
  test('aria-expanded=false when closed',() => { setup(); jest.resetModules(); require('./scripts.js'); qs('.faq-q').click(); qs('.faq-q').click(); expect(qs('.faq-q').getAttribute('aria-expanded')).toBe('false'); });
});

// ── 17. PRODUCT TAB DEMO ──────────────────────────────────────────────────────
describe('Product tab demo', () => {
  const setup = () => { document.body.innerHTML = '<div class="tab-nav"><button class="tab-btn active" data-tab="mees" aria-selected="true">MEES</button><button class="tab-btn" data-tab="ppn" aria-selected="false">PPN</button><button class="tab-btn" data-tab="csrd" aria-selected="false">CSRD</button></div><div class="tab-panel active" id="tab-mees">M</div><div class="tab-panel" id="tab-ppn" hidden>P</div><div class="tab-panel" id="tab-csrd" hidden>C</div>'; };
  test('clicking tab makes it active',       () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-tab="ppn"]').click(); expect(qs('[data-tab="ppn"]').classList.contains('active')).toBe(true); });
  test('clicking tab shows its panel',       () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-tab="ppn"]').click(); expect(el('tab-ppn').classList.contains('active')).toBe(true); });
  test('clicking tab hides other panels',    () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-tab="ppn"]').click(); expect(el('tab-mees').hasAttribute('hidden')).toBe(true); });
  test('ArrowRight moves focus to next tab', () => { setup(); jest.resetModules(); require('./scripts.js'); const [t1, t2] = qsa('.tab-btn'); t1.focus(); t1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); expect(document.activeElement).toBe(t2); });
  test('ArrowLeft moves focus to prev tab',  () => { setup(); jest.resetModules(); require('./scripts.js'); const [t1, t2] = qsa('.tab-btn'); t2.focus(); t2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); expect(document.activeElement).toBe(t1); });
});

// ── 18. BLOG FILTER TABS ──────────────────────────────────────────────────────
describe('Blog filter tabs', () => {
  const setup = () => { document.body.innerHTML = '<button class="blog-filter blog-filter-active" data-filter="all" aria-pressed="true">All</button><button class="blog-filter" data-filter="mees" aria-pressed="false">MEES</button><button class="blog-filter" data-filter="ppn" aria-pressed="false">PPN</button><div class="blog-articles-grid"><article data-category="mees">M1</article><article data-category="ppn">P1</article><article data-category="mees">M2</article></div>'; };
  test('filter mees hides ppn',          () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-filter="mees"]').click(); expect(qs('article[data-category="ppn"]').style.display).toBe('none'); });
  test('filter mees shows mees',         () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-filter="mees"]').click(); expect(qs('article[data-category="mees"]').style.display).not.toBe('none'); });
  test('filter all shows all',           () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-filter="mees"]').click(); qs('[data-filter="all"]').click(); qsa('article[data-category]').forEach(a => expect(a.style.display).not.toBe('none')); });
  test('active filter gets active class',() => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-filter="ppn"]').click(); expect(qs('[data-filter="ppn"]').classList.contains('blog-filter-active')).toBe(true); });
  test('aria-pressed updated',           () => { setup(); jest.resetModules(); require('./scripts.js'); qs('[data-filter="mees"]').click(); expect(qs('[data-filter="mees"]').getAttribute('aria-pressed')).toBe('true'); expect(qs('[data-filter="all"]').getAttribute('aria-pressed')).toBe('false'); });
});

// ── 19. TOOLTIP SYSTEM ────────────────────────────────────────────────────────
// The handler lives on document.addEventListener('click') — it toggles .active
// on the closest .term. Single click = active ON, second click = active OFF.
describe('Tooltip system (.term)', () => {
  // Each test gets a fresh document clone to avoid stale listeners from prior requires
  const setup = () => {
    jest.resetModules();
    document.body.innerHTML = '<span class="term" data-tip="MEES" tabindex="0">MEES</span><span class="term" data-tip="EPC" tabindex="0">EPC</span>';
    require('./scripts.js');
  };
  test('single click toggles .active on', () => {
    setup();
    const [t1] = qsa('.term');
    t1.click(); // on
    expect(t1.classList.contains('active')).toBe(true);
  });
  test('second click on same term toggles .active off', () => {
    setup();
    const [t1] = qsa('.term');
    t1.click(); t1.click();
    expect(t1.classList.contains('active')).toBe(false);
  });
  test('clicking second term removes active from first', () => {
    setup();
    const [t1, t2] = qsa('.term');
    t1.click(); // t1 active
    t2.click(); // t2 active, t1 cleared
    expect(t1.classList.contains('active')).toBe(false);
  });
  test('Escape removes all active terms', () => {
    setup();
    const [t1] = qsa('.term');
    t1.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(t1.classList.contains('active')).toBe(false);
  });
});

// ── 20. SCROLL LOCK SAFETY RESET ─────────────────────────────────────────────
describe('Scroll lock safety reset', () => {
  test('clears body overflow on load',  () => { document.body.style.overflow = 'hidden'; jest.resetModules(); require('./scripts.js'); expect(document.body.style.overflow).toBe(''); });
  test('clears body position on load',  () => { document.body.style.position = 'fixed';  jest.resetModules(); require('./scripts.js'); expect(document.body.style.position).toBe(''); });
  test('clears html overflow on load',  () => { document.documentElement.style.overflow = 'hidden'; jest.resetModules(); require('./scripts.js'); expect(document.documentElement.style.overflow).toBe(''); });
});

// ── 21. REVEAL ON SCROLL ──────────────────────────────────────────────────────
describe('Scroll-triggered reveal', () => {
  test('adds .visible to .reveal elements', () => {
    document.body.innerHTML = '<div class="reveal"></div><div class="reveal"></div>';
    jest.resetModules(); require('./scripts.js');
    qsa('.reveal').forEach(e => expect(e.classList.contains('visible')).toBe(true));
  });
});

// ── 22. CSRD SHARE MECHANIC ───────────────────────────────────────────────────
describe('CSRD share mechanic', () => {
  test('showCsrdShare reveals share panel', () => {
    document.body.innerHTML = '<div id="csrdShare" style="display:none"></div>';
    jest.resetModules(); require('./scripts.js');
    window.showCsrdShare();
    expect(el('csrdShare').style.display).toBe('block');
  });
  test('copy link button changes text to Copied', async () => {
    document.body.innerHTML = '<div id="csrdShare"><button id="csrdCopyLink">Copy link</button></div>';
    jest.resetModules(); require('./scripts.js');
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    el('csrdCopyLink').click();
    await Promise.resolve();
    expect(el('csrdCopyLink').textContent).toContain('Copied');
  });
});

// ── 23. NOTIFY FORM (Formspree) ───────────────────────────────────────────────
describe('Notify form (Formspree)', () => {
  const setup = () => { document.body.innerHTML = '<form class="notify-form"><input type="email" name="email" value="user@example.com"/><button class="notify-btn" type="submit">Notify</button><div class="notify-success" style="display:none">Done!</div></form>'; };
  test('shows success on ok response',     async () => { setup(); jest.resetModules(); global.fetch = jest.fn().mockResolvedValue({ ok: true }); require('./scripts.js'); qs('.notify-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 0)); expect(qs('.notify-success').style.display).toBe('block'); });
  test('re-enables button on fail',        async () => { setup(); jest.resetModules(); global.fetch = jest.fn().mockResolvedValue({ ok: false }); require('./scripts.js'); qs('.notify-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 0)); expect(qs('.notify-btn').disabled).toBe(false); });
  test('disables button during submit',    () => { setup(); jest.resetModules(); let res; global.fetch = jest.fn().mockReturnValue(new Promise(r => { res = r; })); require('./scripts.js'); qs('.notify-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); expect(qs('.notify-btn').disabled).toBe(true); res({ ok: true }); });
});

// ── 24. ACCESSIBILITY ─────────────────────────────────────────────────────────
describe('Accessibility — keyboard', () => {
  test('Escape closes mobile menu', () => {
    document.body.innerHTML = '<button class="ham" aria-expanded="true"></button><nav class="mob-menu open"><a href="#">L</a></nav>';
    jest.resetModules(); require('./scripts.js');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(qs('.mob-menu').classList.contains('open')).toBe(false);
  });
  test('locale dropdown ArrowDown moves focus', () => {
    document.body.innerHTML = '<div id="locale-selector"><button id="locale-trigger" aria-expanded="false"><span id="locale-flag">🇬🇧</span><span id="locale-lang">EN</span><span id="locale-curr">£ GBP</span></button><div id="locale-dropdown"><button class="locale-opt" data-lang="en" data-flag="🇬🇧">EN</button><button class="locale-opt" data-lang="fr" data-flag="🇫🇷">FR</button></div></div><div id="lang-tooltip" style="display:none"></div><div id="ttoggle"></div><span id="lbl-m">M</span><span id="lbl-a">A</span>';
    jest.resetModules(); require('./scripts.js');
    const opts = qsa('.locale-opt'); opts[0].focus();
    el('locale-dropdown').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(opts[1]);
  });
  test('locale dropdown Escape closes it', () => {
    document.body.innerHTML = '<div id="locale-selector"><button id="locale-trigger" aria-expanded="true"><span id="locale-flag">🇬🇧</span><span id="locale-lang">EN</span><span id="locale-curr">£ GBP</span></button><div id="locale-dropdown" class="open"><button class="locale-opt" data-lang="en" data-flag="🇬🇧">EN</button></div></div><div id="lang-tooltip" style="display:none"></div><div id="ttoggle"></div><span id="lbl-m">M</span><span id="lbl-a">A</span>';
    jest.resetModules(); require('./scripts.js');
    el('locale-dropdown').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el('locale-dropdown').classList.contains('open')).toBe(false);
  });
});

// ── 25. REGRESSION GUARDS ─────────────────────────────────────────────────────
describe('Regression guards', () => {
  let m;
  beforeAll(() => { jest.resetModules(); m = require('./scripts.js'); });
  test('dismissBar no throw when localStorage throws', () => {
    const orig = global.localStorage;
    Object.defineProperty(global, 'localStorage', { value: { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } }, writable: true });
    document.body.innerHTML = '<div id="announce-bar"></div>';
    expect(() => m.dismissBar()).not.toThrow();
    Object.defineProperty(global, 'localStorage', { value: orig, writable: true });
  });
  test('caToggleNotify no throw when wrap missing', () => { document.body.innerHTML = '<button id="x">X</button>'; expect(() => m.caToggleNotify(el('x'))).not.toThrow(); });
  test('csrdMapEmployees always returns number',    () => { ['1000+','250-999','other','',null,undefined].forEach(v => expect(typeof m.csrdMapEmployees(v)).toBe('number')); });
  test('csrdMapTurnover always returns number',     () => { ['450m+','150m-450m','other','',null,undefined].forEach(v => expect(typeof m.csrdMapTurnover(v)).toBe('number')); });
  test('csrdGetResult no throw on null state',      () => { m.csrdState = { employees: null, turnover: null, sector: null, step: 1 }; expect(() => m.csrdGetResult()).not.toThrow(); });
  test('toggleMob no throw when menu absent',       () => { document.body.innerHTML = ''; expect(() => m.toggleMob()).not.toThrow(); });
});
