# CrowAgent.ai — Comprehensive E2E Audit Report
**Date:** 8 April 2026  
**Scope:** All pages, all journeys, all environments  
**Method:** Static source analysis across all HTML, CSS, JS, config files

---

## SUMMARY

| Severity | Count |
|----------|-------|
| 🔴 Critical | 8 |
| 🟠 High | 12 |
| 🟡 Medium | 14 |
| 🟢 Low | 9 |
| **Total** | **43** |

---

## 🔴 CRITICAL

### C-01 — www vs non-www canonical mismatch (SEO split)
**Files:** sitemap.xml, all HTML pages  
**Issue:** Every canonical tag uses `https://crowagent.ai/...` (no www). The sitemap uses `https://www.crowagent.ai/...` (with www). Google treats these as two different domains. This splits PageRank and can cause indexing confusion.  
**Evidence:**
- `sitemap.xml` line 5: `<loc>https://www.crowagent.ai/</loc>`
- `index.html` line 22: `<link rel="canonical" href="https://crowagent.ai">`
- `404.html` line 11: `<link rel="canonical" href="https://www.crowagent.ai/404">` (also inconsistent with other 404 pages)
**Fix:** Pick one — `crowagent.ai` (no www) is preferred. Update all sitemap `<loc>` entries to remove `www`. Add a Vercel redirect from `www` to non-www.

---

### C-02 — CSP uses `unsafe-inline` for scripts (XSS risk)
**File:** vercel.json  
**Issue:** `script-src 'self' 'unsafe-inline'` allows any inline script to execute. This completely negates XSS protection from the CSP. An attacker who can inject HTML (e.g. via a reflected parameter) can run arbitrary JS.  
**Evidence:** vercel.json line 55: `script-src 'self' 'unsafe-inline' https://assets.calendly.com https://eu.posthog.com`  
**Fix:** Replace `unsafe-inline` with a nonce-based or hash-based CSP. Move all inline scripts to external files. This is a significant refactor but is the correct fix.

---

### C-03 — `role="main"` missing on 8 pages
**Files:** security.html, crowmark.html, crowagent-core.html, contact.html, about.html, demo.html, blog/mees-commercial-property-guide.html, products/crowagent-core.html  
**Issue:** These pages have `<main id="main-content">` without `role="main"`. Screen readers rely on landmark roles to navigate. WCAG 2.1 SC 1.3.6 (Identify Purpose) requires landmark regions.  
**Fix:** Add `role="main"` to all `<main>` elements.

---

### C-04 — Dual localStorage theme keys written on every save
**File:** scripts.js lines 110–111  
**Issue:** Every theme/locale save writes BOTH `ca_theme` AND `ca-theme`. This is a backwards-compat hack that was never cleaned up. It doubles localStorage writes and creates confusion about which key is authoritative. If a user clears one key manually, behaviour becomes unpredictable.  
**Evidence:** `localStorage.setItem('ca_theme', currentTheme); localStorage.setItem('ca-theme', currentTheme);`  
**Fix:** Migrate fully to `ca_theme`. Remove the `ca-theme` write. Keep the read fallback for one release cycle, then remove it.

---

### C-05 — `robots` meta missing on 12 pages
**Files:** index.html, contact.html, csrd.html, demo.html, privacy.html, terms.html, cookies.html, legal.html, all blog posts  
**Issue:** Pages without `<meta name="robots">` rely entirely on robots.txt for crawl control. If a page is linked from a disallowed path or a crawler ignores robots.txt, there's no page-level fallback. Legal pages in particular should have explicit `noindex` or `index,follow` declarations.  
**Fix:** Add `<meta name="robots" content="index,follow">` to all public pages. Add `noindex,nofollow` to legal/privacy/terms if preferred.

---

### C-06 — `twitter:image` missing on 8 pages
**Files:** index.html has it, but: about.html, pricing.html, faq.html, crowmark.html, crowagent-core.html, contact.html, csrd.html, security.html  
**Issue:** Without `twitter:image`, Twitter/X card previews show no image when these pages are shared. This directly impacts social sharing click-through rates.  
**Fix:** Add `<meta name="twitter:image" content="https://crowagent.ai/Assets/og-image.png">` to all pages missing it.

---

### C-07 — Sitemap contains `.html` extension URLs (non-canonical)
**File:** sitemap.xml  
**Issue:** Three sitemap entries use `.html` extensions:
- `https://www.crowagent.ai/resources.html`
- `https://www.crowagent.ai/blog/mees-commercial-property-guide.html`
- `https://www.crowagent.ai/blog/ppn-002-social-value-guide.html`

Vercel rewrites serve these at clean URLs (no `.html`). The canonical tags on those pages also use clean URLs. Submitting `.html` URLs to Google creates duplicate content signals.  
**Fix:** Update sitemap entries to use clean URLs: `/resources`, `/blog/mees-commercial-property-guide`, `/blog/ppn-002-social-value-guide`.

---

### C-08 — `products/crowagent-core` and `products/crowmark` in sitemap despite 301 redirects
**File:** sitemap.xml, vercel.json  
**Issue:** The sitemap lists `https://www.crowagent.ai/products/crowagent-core` and `https://www.crowagent.ai/products/crowmark` as indexable URLs. Vercel has 301 redirects from these to `/crowagent-core` and `/crowmark`. Google should not be submitted redirect sources in sitemaps — only the canonical destination.  
**Fix:** Remove the `/products/crowagent-core` and `/products/crowmark` entries from sitemap.xml.

---

## 🟠 HIGH

### H-01 — `og:image` uses wrong path on privacy, legal, cookies pages
**Files:** privacy.html, legal.html, cookies.html  
**Issue:** OG image points to `https://www.crowagent.ai/og-image.png` (root, with www). All other pages use `https://crowagent.ai/Assets/og-image.png` (Assets folder, no www). The root path likely 404s.  
**Evidence:** `privacy.html` line 12: `<meta property="og:image" content="https://www.crowagent.ai/og-image.png">`  
**Fix:** Change to `https://crowagent.ai/Assets/og-image.png` on all three pages.

---

### H-02 — Cache-Control conflict: HTML pages have two contradictory rules
**File:** vercel.json  
**Issue:** The first header rule (`/(.*\.html|[^.]*)`) sets `no-store, no-cache` for HTML. A later rule (`/(.*).html`) sets `public, max-age=0, s-maxage=300`. These conflict. The last matching rule wins in Vercel, meaning `.html` files get the 300s CDN cache — but the intent of the first rule was no caching at all.  
**Fix:** Remove the conflicting `/(.*).html` rule or consolidate into a single rule with the intended behaviour.

---

### H-03 — `contact.html` loads `crowagent-brand-tokens.css` separately (double load)
**File:** contact.html  
**Issue:** contact.html has both `<link rel="stylesheet" href="/crowagent-brand-tokens.css">` AND `<link rel="stylesheet" href="/styles.min.css?v=49">`. The brand tokens CSS is already imported at the top of `styles.css` via `@import`. This causes the tokens file to load twice, adding an extra HTTP request and potential style override conflicts.  
**Fix:** Remove the separate `crowagent-brand-tokens.css` link from contact.html.

---

### H-04 — `legal.html` is a rewrite alias for `privacy.html` but has its own canonical
**File:** vercel.json, legal.html  
**Issue:** vercel.json rewrites `/legal` → `/privacy.html`. But `legal.html` has `<link rel="canonical" href="https://crowagent.ai/legal">`. This means `/legal` serves the privacy policy content but tells Google its canonical is `/legal`, not `/privacy`. The sitemap also lists `/legal` as a separate URL. This creates a duplicate content issue.  
**Fix:** Either give `/legal` its own page, or redirect `/legal` → `/privacy` (301) and remove `/legal` from the sitemap.

---

### H-05 — `blog/ppn-002-social-value-guide.html` and `blog/mees-commercial-property-guide.html` canonical URLs include `.html`
**Files:** blog/ppn-002-social-value-guide.html, blog/mees-commercial-property-guide.html  
**Issue:** These two blog posts have canonical tags pointing to `.html` URLs:
- `<link rel="canonical" href="https://crowagent.ai/blog/ppn-002-social-value-guide.html">`
- `<link rel="canonical" href="https://crowagent.ai/blog/mees-commercial-property-guide.html">`

All other blog posts use clean URLs. Vercel serves these at clean URLs. The canonical should match the served URL.  
**Fix:** Update both canonicals to remove `.html` extension.

---

### H-06 — PostHog API key exposed in HTML source
**File:** index.html  
**Issue:** The PostHog project API key `phc_xSAG4k5waw16WeO0iasQUdcOkvxTKqAi8GeYyP4Brjx` is visible in the page source. While PostHog client keys are designed to be public (they're write-only for event capture), this key is hardcoded in the HTML with no environment variable abstraction. If the key needs rotating, it requires a code change and deploy.  
**Fix:** Low risk but worth noting. Consider moving to an environment variable injected at build time. Ensure the PostHog project has domain restrictions configured so the key can only capture from `crowagent.ai`.

---

### H-07 — No `Permissions-Policy` for `interest-cohort` (FLoC opt-out)
**File:** vercel.json  
**Issue:** The Permissions-Policy header disables camera, microphone, geolocation — but does not include `interest-cohort=()` to opt out of Google's FLoC/Topics API. This is a privacy best practice for GDPR-compliant sites.  
**Fix:** Add `interest-cohort=()` to the Permissions-Policy value.

---

### H-08 — `faq.html` uses `<details>/<summary>` pattern but `scripts.js` FAQ accordion uses `.faq-q` buttons
**File:** faq.html, scripts.js  
**Issue:** faq.html uses native HTML `<details>/<summary>` elements. The scripts.js FAQ accordion code targets `.faq-q` class buttons with `aria-expanded`. These are two completely different implementations. The `<details>` pattern on faq.html gets no JS enhancement, while the `.faq-q` pattern on other pages (pricing.html) gets JS. This means keyboard behaviour, animation, and ARIA state differ between pages.  
**Fix:** Standardise on one pattern. The `<details>/<summary>` approach is more accessible by default and requires no JS. Migrate pricing.html FAQ to use `<details>/<summary>` and remove the `.faq-q` JS handler.

---

### H-09 — `HSTS` header missing `preload` directive
**File:** vercel.json  
**Issue:** HSTS is set to `max-age=31536000; includeSubDomains` but lacks the `preload` directive. Without `preload`, the site is not eligible for the HSTS preload list, meaning first-time visitors can still be downgraded to HTTP before the HSTS header is received.  
**Fix:** Add `; preload` to the HSTS value and submit to hstspreload.org.

---

### H-10 — `X-XSS-Protection: 1; mode=block` is deprecated
**File:** vercel.json  
**Issue:** `X-XSS-Protection` was deprecated by all major browsers and removed from Chrome/Edge. It can actually introduce vulnerabilities in some edge cases. Modern browsers rely on CSP for XSS protection.  
**Fix:** Remove `X-XSS-Protection` header entirely. Rely on CSP.

---

### H-11 — `og:site_name` missing on 6 pages
**Files:** index.html, contact.html, csrd.html, demo.html, 404.html, all blog posts  
**Issue:** `og:site_name` is missing from these pages. When shared on Facebook/LinkedIn, the site name won't appear in the card preview.  
**Fix:** Add `<meta property="og:site_name" content="CrowAgent">` to all pages missing it.

---

### H-12 — `manifest.json` not linked from all pages
**File:** manifest.json exists but only index.html links it  
**Issue:** The PWA manifest (`manifest.json`) is only referenced from the homepage. Other pages don't have `<link rel="manifest" href="/manifest.json">`. This means the "Add to Home Screen" prompt only works from the homepage.  
**Fix:** Add `<link rel="manifest" href="/manifest.json">` to all pages via nav-inject.js or a shared `<head>` template.

---

## 🟡 MEDIUM

### M-01 — `resources.html` canonical uses `.html` extension
**File:** resources.html  
**Issue:** `<link rel="canonical" href="https://crowagent.ai/resources.html">` — should be `/resources` to match the clean URL served by Vercel.

---

### M-02 — `blog/retrofit-cost-calculator-guide.html` missing `robots` meta and `og:site_name`
**File:** blog/retrofit-cost-calculator-guide.html  
**Issue:** No `<meta name="robots">` and no `<meta property="og:site_name">`.

---

### M-03 — `demo.html` missing `og:site_name` and `robots` meta
**File:** demo.html  
**Issue:** No `<meta name="robots" content="index,follow">` and no `og:site_name`.

---

### M-04 — `404.html` canonical points to `www.crowagent.ai/404`
**File:** 404.html  
**Issue:** `<link rel="canonical" href="https://www.crowagent.ai/404">` — uses www while all other pages use non-www. 404 pages should have `<meta name="robots" content="noindex">` and no canonical (or self-referential non-www canonical).

---

### M-05 — `privacy.html` and `legal.html` OG image uses wrong domain
Already covered in H-01 but also affects `cookies.html`.

---

### M-06 — `theme-color` meta missing from most pages
**Files:** index.html, pricing.html, about.html, contact.html, csrd.html, crowmark.html, crowagent-core.html, faq.html  
**Issue:** `<meta name="theme-color">` is present on product pages and blog posts but missing from main marketing pages. This controls the browser chrome colour on mobile.  
**Fix:** Add `<meta name="theme-color" content="#040E1A">` to all pages via nav-inject.js.

---

### M-07 — `lang` attribute only set to `en` — no dynamic update when language changes
**File:** All HTML pages, scripts.js  
**Issue:** All pages have `<html lang="en">`. The locale selector allows switching to FR, DE, ES, CY — but the `lang` attribute on `<html>` is never updated. Screen readers use `lang` to select the correct pronunciation engine. Showing French content with `lang="en"` causes incorrect pronunciation.  
**Fix:** In the locale `applyLocale()` function, add `document.documentElement.setAttribute('lang', currentLang)`.

---

### M-08 — `aria-current="page"` logic in nav-inject.js is path-based and breaks on hash URLs
**File:** js/nav-inject.js  
**Issue:** The `isActive()` function checks `path.startsWith(h)`. The "How it works" link is `/#how` and "Sectors" is `/#sectors`. These are hash links, not path links. `isActive('/#how')` will never match because `window.location.pathname` doesn't include the hash. These nav items will never get `aria-current="page"`.  
**Fix:** For hash-only links, either remove `aria-current` logic entirely (they're anchor links, not pages) or use `window.location.hash` comparison.

---

### M-09 — `service-worker.js` exists but is not registered anywhere
**File:** service-worker.js  
**Issue:** A service worker file exists but no page registers it with `navigator.serviceWorker.register()`. The PWA manifest references it implicitly, but without registration the service worker never activates. Offline support and caching don't work.  
**Fix:** Either register the service worker in scripts.js or remove the file if it's not intended to be used.

---

### M-10 — `blog/ppn-002-social-value-guide.html` and `blog/mees-commercial-property-guide.html` missing `og:site_name` and `robots`
**Files:** Both new blog posts  
**Issue:** These two newer blog posts are missing `og:site_name`, `robots` meta, and `twitter:site` tags that all other blog posts have.

---

### M-11 — `crowmark.html` Schema.org price is `"49"` but page shows Solo at £99
**File:** crowmark.html  
**Issue:** JSON-LD structured data: `"offers": {"@type": "Offer", "price": "49", "priceCurrency": "GBP"}`. The page itself shows Solo at £99, Team at £149, Agency at £399. The schema price of £49 doesn't match any displayed price. This will cause Google Rich Results to show incorrect pricing.  
**Fix:** Update schema to match actual pricing, or use an array of offers like the pricing.html schema does.

---

### M-12 — `crowagent-core.html` Schema.org price is `"149"` (single offer, no array)
**File:** crowagent-core.html  
**Issue:** Schema shows a single offer at £149 but the product has three tiers (£149, £299, £599). Incomplete structured data.  
**Fix:** Use an array of offers matching the pricing.html schema pattern.

---

### M-13 — `index.html` Schema.org `url` for CrowAgent Core points to `/products/crowagent-core` (redirected path)
**File:** index.html  
**Issue:** `"url": "https://crowagent.ai/products/crowagent-core"` — this is the redirect source, not the canonical destination. Schema should point to the canonical URL `/crowagent-core`.  
**Fix:** Update to `"url": "https://crowagent.ai/crowagent-core"`.

---

### M-14 — `faq.html` missing `FAQPage` Schema.org markup
**File:** faq.html  
**Issue:** pricing.html has `FAQPage` JSON-LD structured data. faq.html — the dedicated FAQ page — has no structured data at all. This is a missed opportunity for Google FAQ rich results on the most relevant page.  
**Fix:** Add `FAQPage` JSON-LD to faq.html with all Q&A pairs.

---

## 🟢 LOW

### L-01 — `blog/retrofit-cost-calculator-guide.html` missing `og:url`
**File:** blog/retrofit-cost-calculator-guide.html  
**Issue:** No `<meta property="og:url">` tag.

---

### L-02 — `blog/ppn-002-social-value-guide.html` missing `og:url`
**File:** blog/ppn-002-social-value-guide.html  
**Issue:** No `<meta property="og:url">` tag.

---

### L-03 — `blog/mees-commercial-property-guide.html` missing `og:url`
**File:** blog/mees-commercial-property-guide.html  
**Issue:** No `<meta property="og:url">` tag.

---

### L-04 — `faq.html` missing `twitter:title` and `twitter:description`
**File:** faq.html  
**Issue:** Has `og:title` and `og:description` but no Twitter-specific equivalents. Twitter falls back to OG tags but explicit tags are preferred.

---

### L-05 — `csrd.html` missing `og:site_name` and `robots` meta
**File:** csrd.html  
**Issue:** Missing both tags. The CSRD checker is a high-traffic free tool and should be fully optimised for search.

---

### L-06 — `about.html` missing `twitter:image`
**File:** about.html  
**Issue:** Has OG image but no `twitter:image`. Twitter won't show an image when this page is shared.

---

### L-07 — `contact.html` missing `twitter:image`
**File:** contact.html  
**Issue:** Same as L-06.

---

### L-08 — `pricing.html` missing `twitter:image`
**File:** pricing.html  
**Issue:** Same as L-06. Pricing is a high-intent page — social sharing should show the OG image.

---

### L-09 — `faq.html` missing `twitter:image`
**File:** faq.html  
**Issue:** Same as L-06.

---

## ISSUES NOT YET FIXED (from previous audits)

These were identified in the April 5 and April 8 debug reports and remain open:

| ID | Issue | Source |
|----|-------|--------|
| OLD-01 | Heading hierarchy violations — multiple H1s, skipped levels | April 5 report A11Y-01/02 |
| OLD-02 | Light mode teal text contrast fails WCAG AA on white | April 5 report UI-07 |
| OLD-03 | Homepage 21 sections with duplicate content | April 5 report UX-06 |
| OLD-04 | 23+ competing CTAs on homepage | April 5 report UX-07 |
| OLD-05 | Planned products mixed with live products | April 5 report UX-08 |
| OLD-06 | Blog posts have no breadcrumb navigation | April 5 report UX-04 |
| OLD-07 | Font mismatch: static site vs app (Syne/DM Sans vs Plus Jakarta Sans/Inter) | April 5 report UI-03 |
| OLD-08 | 7+ button variants need consolidation | April 5 report UI-09 |
| OLD-09 | CrowMark inline style fallback hex colors | April 5 report UI-06 |
| OLD-10 | `--mist` text contrast marginal in light mode | April 5 report UI-08 |

---

## FIX PRIORITY ORDER

| Priority | ID | Fix | Effort |
|----------|----|-----|--------|
| P0 | C-01 | Fix www/non-www canonical mismatch in sitemap | XS |
| P0 | C-07 | Remove .html extensions from sitemap | XS |
| P0 | C-08 | Remove redirect sources from sitemap | XS |
| P0 | H-01 | Fix OG image path on privacy/legal/cookies | XS |
| P0 | H-05 | Fix canonical .html extensions on 2 blog posts | XS |
| P0 | C-06 | Add twitter:image to 8 pages | XS |
| P0 | H-11 | Add og:site_name to 6 pages | XS |
| P0 | M-11 | Fix crowmark.html Schema price (£49 → correct array) | XS |
| P0 | M-13 | Fix index.html Schema URL for CrowAgent Core | XS |
| P1 | C-03 | Add role="main" to 8 pages | XS |
| P1 | C-05 | Add robots meta to 12 pages | XS |
| P1 | H-03 | Remove duplicate CSS load on contact.html | XS |
| P1 | H-04 | Fix legal.html redirect/canonical conflict | S |
| P1 | H-02 | Fix Cache-Control conflict in vercel.json | XS |
| P1 | H-07 | Add interest-cohort to Permissions-Policy | XS |
| P1 | H-10 | Remove deprecated X-XSS-Protection header | XS |
| P1 | H-09 | Add HSTS preload directive | XS |
| P1 | M-01 | Fix resources.html canonical | XS |
| P1 | M-04 | Fix 404.html canonical (www → non-www) | XS |
| P1 | M-06 | Add theme-color meta to all pages | S |
| P1 | M-07 | Update html lang attribute on locale change | XS |
| P1 | M-08 | Fix aria-current logic for hash links | XS |
| P1 | M-09 | Register or remove service-worker.js | S |
| P1 | M-14 | Add FAQPage schema to faq.html | S |
| P2 | C-04 | Remove dual localStorage theme key writes | XS |
| P2 | H-08 | Standardise FAQ pattern (details/summary) | M |
| P2 | H-12 | Add manifest link to all pages | XS |
| P2 | M-12 | Fix crowagent-core.html Schema (single → array) | XS |
| P3 | C-02 | Replace unsafe-inline CSP with nonce-based | L |
| P3 | H-06 | Move PostHog key to env var | M |
| P3 | L-01–09 | Missing OG/Twitter tags on blog posts | XS each |
