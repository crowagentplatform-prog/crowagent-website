# CSS Audit Report — `crowagent-website/styles.css`

**Generated:** CSS audit across 4,960 lines of styles.css and 39 HTML files  
**Scope:** crowagent-website/, crowagent-website/blog/, crowagent-website/products/

---

## 1. MISSING CSS CLASS DEFINITIONS

Classes referenced in HTML `class=""` attributes but with **no definition** in styles.css:

| # | Missing Class | Used In | Suggested Fix |
|---|--------------|---------|---------------|
| 1 | `.callout` | 14 blog articles | Add `.callout` rule (likely a blockquote-style highlight box) |
| 2 | `.callout-warn` | blog/regulatory-updates-2026.html | Add warning variant of `.callout` |
| 3 | `.card-badge` | blog/index.html | Add base badge style for blog cards (only `card-badge-ppn` and `card-badge-reg` exist) |
| 4 | `.card-meta` | blog/index.html | Add card metadata style (date, read time) |
| 5 | `.card-title` | blog/index.html | Add card title style |
| 6 | `.card-preview` | blog/index.html | Add card preview/excerpt style |
| 7 | `.ca-roadmap-date` | roadmap.html | Add roadmap date style |
| 8 | `.ca-roadmap-date--warn` | roadmap.html | Add warning variant for overdue dates |
| 9 | `.citations` | blog/csrd-omnibus-i-2026.html | Add citations section style |
| 10 | `.contact-form` | contact.html | Add contact form container style |
| 11 | `.contact-page-info` | contact.html | Add info panel style |
| 12 | `.cost-table` | blog/retrofit-cost-calculator-guide.html | Add cost comparison table style |
| 13 | `.csrd-dot` | csrd.html | Add CSRD wizard progress dot style |
| 14 | `.cta-actions` | products/index.html | Add CTA actions container style |
| 15 | `.divider` | partners.html, products/index.html, 11 blog articles | Add horizontal divider/separator style |
| 16 | `.ds-1`, `.ds-2`, `.ds-3` | index.html | Add demo screen step identifiers |
| 17 | `.ds-typed` | index.html | Add typing animation style for demo |
| 18 | `.error-content` | 404.html | Add error page content wrapper |
| 19 | `.error-label` | 404.html | Add error label style |
| 20 | `.error-page` | 404.html | Add error page wrapper |
| 21 | `.fade-in` | partners.html, products/index.html | Add fade-in animation class |
| 22 | `.founder-bio` | about.html | Add founder biography text style |
| 23 | `.founder-link` | about.html | Add founder social/website link style |
| 24 | `.founder-name` | about.html | Add founder name heading style |
| 25 | `.founder-tagline` | about.html | Add founder tagline/role style |
| 26 | `.founder-title` | about.html | Add founder title style |
| 27 | `.new` / `.old` | blog/csrd-omnibus-i-2026.html | Add comparison highlight classes |
| 28 | `.product-hub-badge` | products/index.html | Add product hub badge base style |
| 29 | `.product-hub-badge--active` | products/index.html | Add active badge variant |
| 30 | `.product-hub-badge--coming` | products/index.html | Add coming-soon badge variant |
| 31 | `.product-hub-badge--future` | products/index.html | Add future badge variant |
| 32 | `.product-hub-badge--pro` | products/index.html | Add pro badge variant |
| 33 | `.product-hub-card--disabled` | products/index.html | Add disabled card style |
| 34 | `.product-hub-card-link` | products/index.html | Add card link style |
| 35 | `.product-hub-card-link--disabled` | products/index.html | Add disabled link style |
| 36 | `.reg-table` | blog/regulatory-updates-2026.html | Add regulatory table style |
| 37 | `.sec-card` | security.html | Add security card style |
| 38 | `.section` | index.html, resources.html | Add generic section wrapper |
| 39 | `.section-alt` | index.html | Add alternate section background |
| 40 | `.sector-card` | crowmark.html, products/crowmark.html | Add sector card style (distinct from `.sector`) |
| 41 | `.status-enacted` | blog/regulatory-updates-2026.html | Add enacted status badge |
| 42 | `.status-ongoing` | blog/regulatory-updates-2026.html | Add ongoing status badge |
| 43 | `.status-proposed` | blog/regulatory-updates-2026.html | Add proposed status badge |
| 44 | `.tl` | pricing.html | Add toggle label style |
| 45 | `.updated` | cookies.html, terms.html | Add "last updated" date style |
| 46 | `.warning-box` | terms.html | Add warning box style |
| 47 | `.worked-example` | blog/ppn-002-social-value-guide.html | Add worked example container style |

**Total: 47 missing classes** — these elements render with no custom styling.

---

## 2. `!important` DECLARATIONS AUDIT

### Unnecessary `!important` (can be removed by increasing specificity or reordering):

| Line | Rule | Why Unnecessary | Fix |
|------|------|-----------------|-----|
| 76 | `html,body{background:var(--bg)!important;background-color:var(--bg)!important}` | No competing rule overrides this — it's the base reset | Remove both `!important`; move after any theme overrides |
| 339 | `.pb-sm,.section-compact{padding-bottom:var(--section-pad-compact)!important}` | Utility class — use higher specificity instead | Use `.section.pb-sm` or place after section rules |
| 1570 | `.csrd-caveat{...color:var(--mist)!important;font-size:12px!important}` | No competing rule | Remove `!important` |
| 3297-3326 | `text-align: left !important` (WP-WEB-012 asymmetry) | These override `.sh{text-align:center}` — better to use a modifier class | Use `.sh.align-left{text-align:left}` instead |
| 3601-3628 | Button color `!important` (WP-WEB-REORG-001) | Fights earlier button rules — consolidate into single rule | Merge all `.btn-hero` rules into one; remove `!important` |
| 3672-3900 | `.pgc-badge` — 18 `!important` declarations | Fights itself across 5 duplicate definitions | Consolidate into single `.pgc-badge` rule |
| 3922-3928 | `.how .sh .btn-primary` — 7 `!important` | Overly specific; no competing rule | Remove `!important`; specificity is already high |
| 3933-3934 | `.hw-num` color/font-size `!important` | Overrides own earlier rule at line 644 | Delete line 644 rule; keep line 3933 without `!important` |
| 3940-3942 | `nav .btn-teal-sm` flex-shrink `!important` | No competing rule | Remove `!important` |
| 3947 | `.nav-price-hint{display:none!important}` | Already hidden by line 257-258 rules | Remove; redundant with existing `@media` rules |
| 3955-3965 | Card `display:flex!important` and `.pgrid` overrides | Fights earlier rules — consolidate | Merge all `.pgrid` rules (defined 8 times!) |
| 4104 | `.triple-cta-section.cta-band{padding:...!important}` | No competing rule at this specificity | Remove `!important` |
| 4109-4126 | `#back-to-top` — 15 `!important` declarations | Already defined at line 3843 without `!important` | Delete duplicate; keep one definition |
| 4134-4167 | About/founders grid `!important` overrides | Fights earlier `.founders-grid` at line 1908 | Consolidate into single rule |

### Justified `!important` (needed for correct behavior):

| Line | Rule | Why Needed |
|------|------|------------|
| 1014-1015 | `.steps-grid-3` responsive overrides | Overrides auto-fit in parent; media query specificity issue |
| 1351, 2308, 3524, 4746-4756 | `prefers-reduced-motion: reduce` | Accessibility requirement — must override all animations |
| 4696-4713 | `.skip-link:focus` | Accessibility — must override `clip:rect(0)` hidden state |
| 4723-4724 | `a:focus-visible` outline | Accessibility — WCAG 2.4.7 compliance |
| 4739-4740 | Touch target `min-width/min-height: 44px` | Accessibility — WCAG 2.5.8 compliance |
| 4761-4769 | `forced-colors: active` | High contrast mode — must override theme colors |
| 4819-4823 | `.crowmark-accent`, `.btn-mark` | Product-specific color override |
| 3911-3915 | `div#core-p.pgrid` 3-col override | High specificity needed to override auto-fit |

---

## 3. HARDCODED FONT-FAMILY STRINGS

The brand tokens define `--font-display`, `--font-body`, and `--font-mono` but **~180+ rules** use hardcoded strings instead.

### Pattern: `'Plus Jakarta Sans', sans-serif` → should be `var(--font-display)`

| Lines (sample) | Selectors | Fix |
|----------------|-----------|-----|
| 200-201 | `.ab-text`, `.ab-cta` | Replace with `font-family: var(--font-display)` |
| 245-247 | `.logo-wordmark`, `.logo-tag` | Replace with `var(--font-display)` |
| 250, 256 | `.nav-links a`, `.nav-price-hint` | Replace with `var(--font-display)` |
| 260-264 | `.btn-ghost-sm`, `.btn-teal-sm`, `.btn-primary` | Replace with `var(--font-display)` |
| 306, 362, 456-462 | Hero eyebrow, headline, buttons | Replace with `var(--font-display)` |
| 532-570 | All `.ds-*` demo labels/buttons | Replace with `var(--font-display)` |
| 593, 608, 644-646 | `.sc-num`, `.sh h2`, `.hw-num`, `.hw h3` | Replace with `var(--font-display)` |
| 663-690 | `.phase-label`, `.pc-badge`, `.pc h3`, `.pc-cta` | Replace with `var(--font-display)` |
| 700-718 | `.tab-btn`, `.tab-badge`, `.tab-heading`, `.tab-screen-*` | Replace with `var(--font-display)` |
| 736-746 | `.sector-stat`, `.sector h3`, `.tc h3` | Replace with `var(--font-display)` |
| 758-775 | `.ptab`, `.pgc-badge`, `.pgc-name`, `.pgc-price`, `.pgc-cta` | Replace with `var(--font-display)` |
| 788-805 | `.csrd-copy h2`, `.btn-form`, `.cta-band h2` | Replace with `var(--font-display)` |
| 812-895 | Footer, pricing teaser, about, roadmap headings | Replace with `var(--font-display)` |
| 2461-2976 | WP-WEB-010 utility classes | Replace with `var(--font-display)` |

### Pattern: `'Inter', sans-serif` → should be `var(--font-body)`

| Lines (sample) | Selectors | Fix |
|----------------|-----------|-----|
| 77-78 | `html`, `body` | Replace with `var(--font-body)` |
| 460, 473 | `.hero-sub`, `.ht-item` | Replace with `var(--font-body)` |
| 527, 536, 569 | `.demo-url-bar`, `.ds-finput`, `.ds-report-cite` | Replace with `var(--font-body)` |
| 792, 841-845 | `.csrd-field input/select`, `.ca-notify-*` | Replace with `var(--font-body)` |
| 850-855 | `.ca-pricing-teaser`, `.ca-price-desc` | Replace with `var(--font-body)` |
| 887-964 | Footer links, CSRD wizard, about section, FAQ | Replace with `var(--font-body)` |
| 1098-1298 | Section padding text, contact, form inputs | Replace with `var(--font-body)` |

### Pattern: `'JetBrains Mono', monospace` → should be `var(--font-mono)`

| Lines | Selectors | Fix |
|-------|-----------|-----|
| 962 | `.ca-faq summary::after` | Replace with `var(--font-mono)` |
| 1680 | `.article-body code` | Replace with `var(--font-mono)` |

**Total: ~180 hardcoded font-family declarations** that should use CSS custom properties.

---

## 4. RESPONSIVE BREAKPOINT GAPS

### Breakpoints used (sorted):

| Breakpoint | Type | Count |
|------------|------|-------|
| 375px | max-width | 3 |
| 479px | max-width | 2 |
| 480px | max-width | 16 |
| 600px | max-width | 4 |
| 639px | max-width | 5 |
| 640px | max-width/min-width | 5 |
| 700px | max-width | 2 |
| 767px | max-width | 3 |
| 768px | max-width/min-width | 14 |
| 900px | max-width/min-width | 4 |
| 1023px | max-width | 1 |
| 1024px | max-width/min-width | 9 |
| 1100px | max-width | 1 |
| 1150px | max-width | 1 |
| 1180px | max-width | 1 |
| 1200px | max-width | 1 |
| 1280px | max-width | 2 |
| 1440px | min-width | 3 |
| 1600px | min-width | 1 |
| 1920px | min-width | 1 |

### Gaps identified:

| Section | Desktop Rule | Missing Mobile Breakpoint | Impact |
|---------|-------------|--------------------------|--------|
| `.cm-features-grid` (line 1753) | `grid-template-columns: repeat(3,1fr)` | Has 768px but no 480px breakpoint | 3-col → 1-col jump; no 2-col intermediate on tablets |
| `.cm-steps-grid` (line 1754) | `grid-template-columns: repeat(4,1fr)` | Has 1024px→2col, 768px→1col but no 480px | OK but could use 600px for small phones |
| `.trust-grid` (line 3968) | `grid-template-columns: repeat(2,1fr)` | Only has 768px→1col | No intermediate for 480-767px range |
| `.methodology-4col` (line 3781) | `grid-template-columns: repeat(4,1fr)` | Has 1024px→2col, 600px→1col | Gap at 768px — jumps from 4→2 at 1024px |
| `.triple-cta-grid` (line 3797) | `grid-template-columns: 1fr 1.2fr 1fr` | Only 900px→1col | No 2-col intermediate for tablets |
| `.csrd-inner` (line 789) | `grid-template-columns: 1fr 1fr` | Only 768px→1col | No intermediate |
| `.tab-panel-inner` (line 705) | Only has 1024px min-width for 2-col | No mobile-specific adjustments | Content may be cramped at 768-1023px |
| **Inconsistent breakpoints** | `.nav-price-hint` hidden at both 1200px AND 1024px (lines 257-258) | Redundant — 1200px already covers 1024px | Remove line 258 |
| **Breakpoint chaos** | 479px vs 480px used interchangeably | Lines 4594 uses 479px, line 4645 uses 480px | Standardize to 480px |

---

## 5. DUPLICATE CSS RULES (Same Selector, Conflicting Values)

### Critical duplicates (conflicting properties):

| Selector | Lines | Conflict | Fix |
|----------|-------|----------|-----|
| `.pgrid` | 762, 781, 2500, 3648, 3756, 3765, 3961, 4525 | **8 definitions!** — `grid-template-columns` varies between `1fr`, `repeat(3,1fr)`, `repeat(auto-fit,...)`, `masonry` | Consolidate into single rule + media queries |
| `.pgc-badge` | 766, 1792, 1794, 3672, 3882 | **5 definitions** — `position`, `display`, `width`, `font-size` all conflict | Consolidate into single rule |
| `.pgc-pop` | 765, 1999, 3397, 3902 | **4 definitions** — `padding-top`, `box-shadow`, `animation` conflict | Merge into one |
| `.btn-hero` | 462, 2653 | `font-size: 15px` vs `font-size: 16px`; `padding: 14px 32px` vs `padding: 16px 32px`; `border-radius: 8px` vs `12px` | Keep line 2653 (newer); delete line 462 |
| `.btn-hero-out` | 470, 2685, 3722 | `font-size: 15px` vs `16px`; `border-radius: 8px` vs `12px` | Keep line 2685; delete others |
| `.btn-primary` | 264, 3341, 3596, 3734 | `min-height: 44px` vs `40px`; `padding` varies | Consolidate into single rule |
| `.hero-btns` | 387, 461, 503, 1607, 1732, 2028, 3649 | **7 definitions** — `gap`, `flex-direction`, `justify-content` conflict | Consolidate |
| `.hero-trust` | 395, 472, 1396, 1608, 1833, 1835, 1839, 1865, 2029 | **9 definitions** — `display`, `gap`, `flex-wrap` conflict | Consolidate |
| `.hero-sub` | 460, 1599, 1606, 2026, 4898 | **5 definitions** — `font-size`, `max-width`, `margin` conflict | Consolidate |
| `.sh` | 2602, 2607, 3711 | `text-align: center` vs `text-align: left` (at 768px+) vs `text-align: center` again | Consolidate; use modifier class for alignment |
| `.stats-grid` | 591, 3703 | `repeat(auto-fit,minmax(280px,1fr))` vs `repeat(3,1fr)` | Keep one; the later rule wins but intent is unclear |
| `.csrd-wizard` | 654, 898, 1697, 1801 | **4 definitions** — `padding`, `max-width` repeated identically | Delete duplicates; keep one |
| `.csrd-options` | 904, 1798, 2908 | **3 definitions** — `gap: 10px` vs `gap: 12px` | Consolidate; pick one gap value |
| `.reveal` | 1105, 1355, 2303, 2717, 3370, 4754 | **6 definitions** — `transition-duration` varies: `0.7s`, `0.8s`, `none` | Consolidate; `0.8s` is latest intent |
| `.hw` | 642, 658 | `padding: 28px 24px` vs `padding: 20px 16px` (at 600px) — OK, but line 642 is overridden by card surface rules at 2519 | Remove line 642 background/border (overridden) |
| `.footer-grid` | 1218, 3646, 3656, 4510 | **4 definitions** — `grid-template-columns` conflicts | Consolidate |
| `.footer-bottom` | 881, 1226, 3577, 3652 | **4 definitions** | Consolidate |
| `.ptab` | 758, 1788, 4854 | `border-radius: 100px` vs `8px`; `padding` varies | Keep line 4854 (latest); delete others |
| `.ttrack` / `.tthumb` | 753/755 and 3490/3491 | `transform: translateX(18px)` vs `translateX(22px)` | Pick one value; delete duplicate |
| `.contact-card` | 2525, 2782 | `padding: 24px` defined twice | Delete one |
| `.demo-section` | 520, 1881 | `padding` defined twice with different values | Keep line 1881 (uses fluid tokens) |
| `.ca-about-section` | 925, 1878 | `padding` defined twice | Keep line 1878 |

### Non-conflicting duplicates (identical or additive — still should consolidate):

`.csrd-reassure` (lines 799, 917), `.csrd-submit-btn` (lines 915, 1802), `.footer-col-title` (lines 1219, 3574), `.footer-links` (lines 1220, 3569, 4626), `.form-error` (lines 1298, 4774), `.locale-selector` (lines 1018, 3852, 4305)

---

## Summary

| Category | Count |
|----------|-------|
| Missing CSS classes | 47 |
| `!important` declarations | ~120 (est. 80+ unnecessary) |
| Hardcoded font-family strings | ~180 |
| Breakpoint gaps | 8 sections missing intermediate breakpoints |
| Duplicate selectors (conflicting) | 20+ selectors with conflicting values |
| Duplicate selectors (total) | 80+ selectors defined multiple times |

### Priority Fixes:
1. **`.pgrid`** — 8 conflicting definitions is the worst offender
2. **`.pgc-badge`** — 5 definitions with 18 `!important` flags
3. **Hardcoded fonts** — global find/replace `'Plus Jakarta Sans',sans-serif` → `var(--font-display)` and `'Inter',sans-serif` → `var(--font-body)`
4. **47 missing classes** — blog cards, product hub, 404 page, and regulatory tables have zero styling
5. **`!important` cleanup** — ~80 unnecessary declarations making the cascade unpredictable
