# CrowAgent Website — Debug & Code Review Report
**Date:** 5 April 2026
**Scope:** Full-site audit across all HTML, CSS, and JS files

---

## CRITICAL BUGS FOUND

### BUG 1: Language/Mode Selector Opens Behind Content (z-index)
**Files:** styles.css, all HTML files
**Root cause:** The locale dropdown has `z-index: 300` but the dropdown panel renders inside the nav container which clips overflow. On some viewports, the dropdown appears behind page content because the nav's stacking context constrains it.
**Fix:** Ensure the locale-dropdown has `z-index: 9998` and the nav element allows overflow.

### BUG 2: "Get Started" Button Overflows Screen on Laptop
**Files:** styles.css (`.nav-actions`)
**Root cause:** `.nav-actions` uses `display:flex` with no `flex-shrink` or overflow handling. Between 1024px–1280px, the nav items + locale selector + price hint + buttons exceed viewport width.
**Fix:** Add `flex-shrink: 0` to critical buttons, hide `.nav-price-hint` earlier (at 1200px), and add `overflow: hidden` safeguards.

### BUG 3: "GB EN | £ GBP" Button Overlaps "About" Link
**Files:** styles.css, nav structure in all HTML files
**Root cause:** No gap/margin between the last nav-link ("About") and the `.nav-actions` group. At tablet widths, these compress into each other.
**Fix:** Add `margin-left: auto` on `.nav-actions` and ensure minimum gap between nav-links and actions.

### BUG 4: Mobile Footer Section Too Long
**Files:** All HTML files (footer), styles.css
**Root cause:** Two different footer grid systems exist (`.footer-grid` AND `.ca-footer-grid`) with inconsistent mobile breakpoints. Footer columns stack vertically at 640px but have excessive spacing and no accordion/collapse behaviour.
**Fix:** Consolidate to single footer grid system, reduce mobile padding, collapse sections.

### BUG 5: CrowMark Nav Price Shows Wrong Amount
**Files:** crowmark.html line 97, products/crowmark.html line 87
**Root cause:** Nav shows "From £149/mo" but CrowMark starts at £49/mo. Copy-paste error from CrowAgent Core page.
**Fix:** Change to "From £49/mo".

---

## CONTENT ISSUES

### ISSUE 1: Offensive Quote — "UK property compliance is still done by…"
**File:** index.html, lines 1133-1137
**Content:** "UK property compliance is still done by expensive consultants, outdated spreadsheets, and guesswork."
**Problem:** Dismissive of industry professionals; frames consultants as a problem rather than positioning CrowAgent as complementary.
**Fix:** Remove this entire blockquote section per your request.

### ISSUE 2: "Our Vision" — Inaccurate/Unwanted
**Files:** index.html (lines 1145-1150), about.html (lines 157-164)
**Content:** "To become the compliance intelligence layer for every building, contract, and company…" — CA-00 Company Master Strategy v1.1
**Problem:** You've confirmed this is not correct. It also references an internal strategy doc number which shouldn't be public-facing.
**Fix:** Remove "Our Vision" from both pages per your request.

### ISSUE 3: About Page Content — AI-Sounding, Bad Alignment
**File:** about.html
**Problems:**
- Text uses `text-align: center` on long paragraphs — causes ragged line breaks
- Founder bios read like AI-generated resumes ("Recognised as a Global Sustainability Leader Scholar", "trained in quantum computing through Oxford's National Quantum Computing Centre programme")
- Vision quote references internal doc numbers (CA-00 Company Master Strategy v1.1)
- Words spill over line boundaries due to `hyphens: auto` CSS plus centered text
**Fix:** Left-align body text, rewrite bios in natural language, remove internal references.

### ISSUE 4: AI-Written Language Across Site
**Problem patterns across all pages:**
- "Autonomous Sustainability Intelligence" repeated 10+ times — generic buzzword
- "compliance intelligence layer" — jargon
- "deterministic mission mapping" — overly technical
- "investment-grade numbers for board packs" — sales speak
- "act with confidence" — cliché
**Fix:** Humanize language throughout; use plain English.

---

## DUPLICATE CODE & CONTENT

### DUPLICATE 1: Pricing Shown in 5+ Places (Different Formats)
| Location | File | Format |
|----------|------|--------|
| Meta title | index.html line 7 | "From £49/mo" text |
| Nav bar | ALL pages (~line 97) | `nav-price-hint` class |
| Product cards | index.html lines 719, 780 | `product-price-hint` class |
| Pricing teaser | index.html lines 1016-1029 | Heading + link |
| Pricing page | pricing.html lines 167-321 | Full cards + comparison tables |
| Product pages | crowagent-core.html, crowmark.html | `product-price-hint` class |
| Schema JSON-LD | index.html, product pages | Structured data |

**Fix:** Keep pricing ONLY in: (a) pricing.html (full detail), (b) nav-price-hint (teaser), (c) Schema JSON-LD. Remove from product cards in index.html. Use a single source of truth.

### DUPLICATE 2: Cookie Banner — 31 Identical Copies
**Every HTML file** contains the same inline-styled cookie banner (50+ lines each).
**Fix:** Extract to a shared `cookie-banner.js` that injects the HTML at runtime.

### DUPLICATE 3: Navigation + Footer — Copied Across 30+ Files
Every HTML file has identical nav (~100 lines) and footer (~80 lines).
**Fix:** For a static site, use a build step (e.g., includes) or JS injection. Short-term: ensure all copies are identical and fix bugs in one template.

### DUPLICATE 4: "Our Vision" — Appears in Both index.html AND about.html
Identical content duplicated.
**Fix:** Remove from both (per your request).

### DUPLICATE 5: Product Pages Duplicated at Two URL Paths
- `/crowagent-core.html` AND `/products/crowagent-core.html` — near-identical
- `/crowmark.html` AND `/products/crowmark.html` — near-identical
**Fix:** Keep one path, redirect the other.

### DUPLICATE 6: FAQ Sections in Multiple Pages
- index.html has FAQ (lines 1063-1095)
- pricing.html has FAQ (lines 325-349)
- Different questions, same styling — confusing for users.
**Fix:** Consolidate to one FAQ page or keep only pricing-specific FAQ on pricing.html.

### DUPLICATE 7: Theme Toggle Logic — Dual localStorage Keys
Scripts store theme in BOTH `ca_theme` AND `ca-theme` for backwards compatibility.
**Fix:** Migrate to single key `ca_theme`, remove fallback.

---

## PAGE LENGTH / BLOAT ANALYSIS

**index.html: 1,447 lines — TOO LONG**

Sections that can be removed or consolidated:
1. Mission statement with offensive quote (lines 1129-1151) — **REMOVE**
2. Vision section (lines 1145-1150) — **REMOVE**
3. Pricing teaser section (lines 1016-1029) — **MERGE** into CTA
4. Shipping updates (lines 1099-1126) — **MOVE** to blog/changelog
5. Duplicate stats (lines 608-625 repeat hero stats) — **REMOVE ONE**
6. FAQ in index (lines 1063-1095) — **MOVE** to dedicated page

**Estimated line reduction: ~200+ lines (14%)**

---

## FIX PLAN (Priority Order)

| # | Fix | Priority | Est. Impact |
|---|-----|----------|-------------|
| 1 | Remove offensive quote + Our Vision from index.html | P0 | Content |
| 2 | Remove Our Vision from about.html | P0 | Content |
| 3 | Fix locale dropdown z-index so mode selector works | P0 | UI Bug |
| 4 | Fix Get Started button overflow on laptop | P0 | UI Bug |
| 5 | Fix GB EN button overlap with About | P0 | UI Bug |
| 6 | Fix CrowMark nav price (£149 → £49) | P0 | Data Bug |
| 7 | Fix About page text alignment (center → left) | P1 | UX |
| 8 | Humanize About page content | P1 | Content |
| 9 | Reduce index.html page length (remove duplicates) | P1 | UX |
| 10 | Consolidate pricing display formats | P2 | Code Quality |
| 11 | Fix mobile footer spacing | P2 | Mobile UX |
| 12 | Humanize language site-wide | P2 | Content |
| 13 | Remove duplicate product page paths | P3 | Architecture |
| 14 | Extract cookie banner to shared JS | P3 | Code Quality |
