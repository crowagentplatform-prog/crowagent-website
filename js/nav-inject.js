/**
 * nav-inject.js — CrowAgent shared nav + footer injector
 * Pattern: same as cookie-banner.js. Writes HTML to placeholder divs.
 * Single source of truth for nav and footer across all pages.
 *
 * CONSTANTS (never change without CTO confirmation):
 *   Annual discount = 10%
 *   FAQ appears in footer Resources only (removed from nav in WP-WEB-003)
 *   Footer Company column = no FAQ link (FAQ is in Resources only)
 *   Footer copyright = "Sustainability Compliance Software" on all pages
 */
(function () {
  'use strict';

  var path = window.location.pathname.replace(/\/$/, '') || '/';

  function isActive(href) {
    var h = href.replace(/\/$/, '') || '/';
    return path === h || (h !== '/' && path.startsWith(h));
  }

  /* ── SOCIAL SVG PATHS ── */
  var SOCIALS = [
    { href: 'https://www.linkedin.com/company/crowagent-ltd/', label: 'LinkedIn',
      d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { href: 'https://x.com/CrowAgentLtd', label: 'X',
      d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.31l7.73-8.835L2.601 2.25h6.63l4.81 6.375 5.413-6.375zM17.15 18.75h1.829L5.293 3.786H3.35L17.15 18.75z' },
    { href: 'https://www.youtube.com/@CrowAgentUK', label: 'YouTube',
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { href: 'https://medium.com/@crowagent.platform', label: 'Medium',
      d: 'M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 2.84-.46 5.15-1.04 5.15-.57 0-1.04-2.31-1.04-5.15s.47-5.15 1.04-5.15C23.54 6.85 24 9.16 24 12z' },
    { href: 'https://www.instagram.com/crowagent.ai/', label: 'Instagram',
      d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { href: 'https://www.producthunt.com/@crow_agent', label: 'Product Hunt',
      d: 'M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 000-3.6zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 010 8.4z' }
  ];

  var socialHTML = SOCIALS.map(function(s) {
    return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--steel)" aria-hidden="true"><path d="' + s.d + '"/></svg></a>';
  }).join('\n          ');

  /* ── LOGO MARKUP (reused in nav + footer) ── */
  function logoHTML(href) {
    return '<a href="' + href + '" class="logo" aria-label="CrowAgent home">'
      + '<div class="logo-mark-wrap" aria-hidden="true">'
      + '<div class="b b1"></div><div class="b b2"></div>'
      + '<div class="b b3"></div><div class="b b4"></div>'
      + '</div>'
      + '<div class="logo-text">'
      + '<div class="logo-wordmark">Crow<span>Agent</span></div>'
      + '<div class="logo-tag">Sustainability Intelligence</div>'
      + '</div></a>';
  }

  /* ── NAV HTML ── */
  var NAV_HTML = [
    '<nav role="navigation" aria-label="Main navigation">',
    '  <div class="wrap">',
    '    ' + logoHTML('/'),
    '    <div class="nav-links">',
    '      <a href="/#how"' + (isActive('/#how') ? ' aria-current="page"' : '') + '>How it works</a>',
    '      <a href="/products"' + (isActive('/products') ? ' aria-current="page"' : '') + '>Products</a>',
    '      <a href="/#sectors">Sectors</a>',
    '      <a href="/pricing"' + (isActive('/pricing') ? ' aria-current="page"' : '') + '>Pricing</a>',
    '      <a href="/csrd"' + (isActive('/csrd') ? ' aria-current="page"' : '') + '>CSRD Checker</a>',
    '      <a href="/blog"' + (isActive('/blog') ? ' aria-current="page"' : '') + '>Blog</a>',
    '
    '      <a href="/about"' + (isActive('/about') ? ' aria-current="page"' : '') + '>About</a>',
    '    </div>',
    '    <div class="nav-actions">',
    '      <div class="locale-selector" id="locale-selector">',
    '        <button class="locale-trigger" id="locale-trigger" aria-haspopup="true" aria-expanded="false">',
    '          <span id="locale-flag">&#x1F1EC;&#x1F1E7;</span>',
    '          <span id="locale-lang">EN</span>',
    '          <span class="locale-sep">|</span>',
    '          <span id="locale-curr">&pound; GBP</span>',
    '          <span class="locale-chevron">&#x25BE;</span>',
    '        </button>',
    '        <div class="locale-dropdown" id="locale-dropdown" role="menu">',
    '          <div class="locale-section-label">Language</div>',
    '          <button class="locale-opt" role="menuitem" data-lang="en" data-flag="&#x1F1EC;&#x1F1E7;">&#x1F1EC;&#x1F1E7; English</button>',
    '          <button class="locale-opt" role="menuitem" data-lang="fr" data-flag="&#x1F1EB;&#x1F1F7;">&#x1F1EB;&#x1F1F7; Fran&ccedil;ais</button>',
    '          <button class="locale-opt" role="menuitem" data-lang="de" data-flag="&#x1F1E9;&#x1F1EA;">&#x1F1E9;&#x1F1EA; Deutsch</button>',
    '          <button class="locale-opt" role="menuitem" data-lang="es" data-flag="&#x1F1EA;&#x1F1F8;">&#x1F1EA;&#x1F1F8; Espa&ntilde;ol</button>',
    '          <button class="locale-opt" role="menuitem" data-lang="cy" data-flag="&#x1F3F4;">&#x1F3F4; Cymraeg</button>',
    '          <div class="locale-section-label" style="margin-top:6px">Currency</div>',
    '          <button class="locale-opt" role="menuitem" data-currency="GBP" data-symbol="&pound;">&pound; GBP</button>',
    '          <button class="locale-opt" role="menuitem" data-currency="EUR" data-symbol="&euro;">&euro; EUR</button>',
    '          <button class="locale-opt" role="menuitem" data-currency="USD" data-symbol="$">$ USD</button>',
    '          <div id="lang-tooltip" style="display:none;" role="status" aria-live="polite"></div>',
    '          <div class="locale-section-label" style="margin-top:6px">Theme</div>',
    '          <div class="theme-toggle-row">',
    '            <button class="theme-opt active" type="button" data-theme-choice="dark">Dark</button>',
    '            <button class="theme-opt" type="button" data-theme-choice="light">Light</button>',
    '          </div>',
    '        </div>',
    '      </div>',
    '
    '      <a class="btn-ghost-sm nav-login" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '      <a class="btn-teal-sm nav-cta" href="https://app.crowagent.ai/signup" style="flex-shrink:0;white-space:nowrap;">Get started</a>',
    '    </div>',
    '    <button class="ham" onclick="toggleMob()" aria-label="Toggle menu" aria-expanded="false">',
    '      <span></span><span></span><span></span>',
    '    </button>',
    '  </div>',
    '</nav>',
    '<div class="mob-menu" id="mob-menu">',
    '  <a href="/#how">How it works</a>',
    '  <a href="/products">Products</a>',
    '  <a href="/products/crowagent-core" style="padding-left:20px;font-size:14px;opacity:.85">CrowAgent Core</a>',
    '  <a href="/products/crowmark" style="padding-left:20px;font-size:14px;opacity:.85">CrowMark</a>',
    '  <a href="/csrd" style="padding-left:20px;font-size:14px;opacity:.85">CSRD Checker</a>',
    '  <a href="/#sectors">Sectors</a>',
    '  <a href="/pricing">Pricing</a>',
    '  <a href="/blog">Blog</a>',
    '
    '  <a href="/about">About</a>',
    '  <a class="btn-ghost-sm" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '  <a class="btn-teal-sm" href="https://app.crowagent.ai/signup">Get started</a>',
    '  <div class="mob-locale">',
    '    <div class="mob-locale-label">Language</div>',
    '    <div class="mob-locale-row" id="mob-lang-row">',
    '      <button class="mob-locale-btn active" data-lang="en">&#x1F1EC;&#x1F1E7; EN</button>',
    '      <button class="mob-locale-btn" data-lang="fr">&#x1F1EB;&#x1F1F7; FR</button>',
    '      <button class="mob-locale-btn" data-lang="de">&#x1F1E9;&#x1F1EA; DE</button>',
    '      <button class="mob-locale-btn" data-lang="es">&#x1F1EA;&#x1F1F8; ES</button>',
    '      <button class="mob-locale-btn" data-lang="cy">&#x1F3F4; CY</button>',
    '    </div>',
    '    <div class="mob-locale-label" style="margin-top:10px">Currency</div>',
    '    <div class="mob-locale-row" id="mob-curr-row">',
    '      <button class="mob-locale-btn active" data-currency="GBP">&pound; GBP</button>',
    '      <button class="mob-locale-btn" data-currency="EUR">&euro; EUR</button>',
    '      <button class="mob-locale-btn" data-currency="USD">$ USD</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  /* ── FOOTER HTML ── */
  var FOOTER_HTML = [
    '<footer class="ca-footer" role="contentinfo">',
    '  <div class="wrap container-standard">',
    '    <div class="footer-grid">',
    '      <div class="footer-col footer-col-brand">',
    '        ' + logoHTML('/'),
    '        <p class="footer-tagline">Sustainability Compliance Software for UK organisations navigating MEES, PPN 002, CSRD, and the full regulatory agenda.</p>',
    '        <p class="footer-company">CrowAgent Ltd &middot; Company No. 17076461<br>Registered in England &amp; Wales &middot; ICO registered</p>',
    '        <div class="footer-status">',
    '          <span class="footer-status-dot" id="status-dot"></span>',
    '          <span class="footer-status-label" id="status-label">Checking status...</span>',
    '        </div>',
    '        <div class="foot-social">',
    '          ' + socialHTML,
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4 class="footer-col-title">Products</h4>',
    '        <div class="footer-links">',
    '          <a href="/products/crowagent-core">CrowAgent Core</a>',
    '          <a href="/products/crowmark">CrowMark</a>',
    '          <a href="/csrd">CSRD Checker</a>',
    '          <a href="/pricing">Pricing</a>',
    '          <a href="https://app.crowagent.ai/signup">Start free trial</a>',
    '          <a href="https://app.crowagent.ai/login">Log in</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4 class="footer-col-title">Resources</h4>',
    '        <div class="footer-links">',
    '          <a href="/blog">All articles</a>',
    '          <a href="/faq">FAQ</a>',
    '          <a href="/blog/mees-band-c-2028">MEES guides</a>',
    '          <a href="/blog">PPN 002 guides</a>',
    '          <a href="/blog/csrd-omnibus-i-2026">CSRD guides</a>',
    '          <a href="https://app.crowagent.ai">Platform</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4 class="footer-col-title">Company</h4>',
    '        <div class="footer-links">',
    '          <a href="/about">About</a>',
    '          <a href="/demo">Book a demo</a>',
    '          <a href="/roadmap">Roadmap</a>',
    '          <a href="/contact">Contact</a>',
    '          <a href="https://status.crowagent.ai" target="_blank" rel="noopener noreferrer">System status</a>',
    '          <a href="https://www.linkedin.com/company/crowagent-ltd/" target="_blank" rel="noopener noreferrer">LinkedIn</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h4 class="footer-col-title">Legal</h4>',
    '        <div class="footer-links">',
    '          <a href="/privacy">Privacy</a>',
    '          <a href="/terms">Terms</a>',
    '          <a href="/cookies">Cookies</a>',
    '          <a href="/security">Security</a>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="footer-bottom">',
    '      <p class="footer-copyright">&copy; 2026 CrowAgent Ltd. All rights reserved. Sustainability Compliance Software.</p>',
    '      <p class="footer-infra">Built on Railway &middot; Vercel &middot; Cloudflare &middot; Supabase</p>',
    '      <a href="#" id="ca-cookie-reopen" class="cookie-reopen-link">Cookie preferences</a>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('\n');

  /* ── INJECT ── */
  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  function run() {
    inject('ca-nav', NAV_HTML);
    inject('ca-footer', FOOTER_HTML);
    // Signal nav injection complete so scripts.js can rebind locale/theme handlers
    // setTimeout(0) defers dispatch to next tick — ensures all defer scripts have registered listeners
    setTimeout(function() {
      document.dispatchEvent(new CustomEvent('ca-nav-ready'));
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
