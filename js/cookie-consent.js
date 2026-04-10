(function() {
  var consent = localStorage.getItem('ca_cookie_consent');
  if (consent) { if (consent === 'accepted') initAnalytics(); return; }

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<p>We use analytics cookies to improve CrowAgent. <a href="/privacy-policy" style="color:#00E5A0;text-decoration:underline">Learn more</a></p>' +
    '<div style="display:flex;gap:8px">' +
    '<button onclick="acceptCookies()" style="background:#00E5A0;color:#0A1F3A;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600">Accept</button>' +
    '<button onclick="declineCookies()" style="background:transparent;color:#E4ECF7;border:1px solid #E4ECF7;padding:8px 16px;border-radius:6px;cursor:pointer">Decline</button>' +
    '</div>';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0A1F3A;color:#E4ECF7;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;z-index:9999;gap:16px;flex-wrap:wrap;font-family:Inter,system-ui,sans-serif;font-size:14px';
  document.body.appendChild(banner);
})();

function acceptCookies() {
  localStorage.setItem('ca_cookie_consent', 'accepted');
  document.getElementById('cookie-banner').remove();
  initAnalytics();
}
function declineCookies() {
  localStorage.setItem('ca_cookie_consent', 'declined');
  document.getElementById('cookie-banner').remove();
}
function initAnalytics() {
  var key = document.querySelector('meta[name="posthog-key"]');
  if (key && key.content && window.posthog) {
    posthog.init(key.content, { api_host: 'https://eu.posthog.com' });
  }
}
