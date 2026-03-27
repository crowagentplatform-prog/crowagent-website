# CLAUDE.md — CrowAgent Complete Context Document
## Read this ENTIRE file before responding to ANY request
## Version 2.0 | Updated: 21 March 2026

---

## ⚠️ MANDATORY READING PROTOCOL

Before responding to any request in this repository:
1. Read this entire file (CLAUDE.md)
2. Read docs/INFRASTRUCTURE_REGISTRY.md
3. Only then respond

If you skip either file, you will make incorrect assumptions about the stack,
duplicate existing configuration, or break things that are already working.
This is not optional.

---

## 1. WHO WE ARE

**Company:** CrowAgent Ltd
**Registration:** England & Wales, Company No. 17076461
**Founder:** Bhavesh Parihar (bhavesh.parihar@gmail.com)
**Contact:** hello@crowagent.ai
**Website:** crowagent.ai
**Platform:** app.crowagent.ai
**Internal portal:** portal.crowagent.ai
**Tagline:** Autonomous Sustainability Intelligence (this exact phrase — no variations)

CrowAgent converts mandatory UK/EU sustainability regulations into self-serve SaaS
tools that deliver compliance outputs in under 10 minutes at a fraction of
consultancy cost.

---

## 2. THE THREE LIVE APPLICATIONS

### 2.1 crowagent-platform (main product)
- **Frontend:** Next.js 14 TypeScript → deployed on Vercel Pro
- **Backend:** FastAPI Python 3.12 → deployed on Railway Pro
- **URL:** app.crowagent.ai (platform) + crowagent.ai (marketing site built-in)
- **Repo:** github.com/crowagent/crowagent-platform
- **Local path:** C:\Users\bhave\Crowagent Repo\crowagent-platform
- **Structure:**
  - web/ → Next.js frontend (all pages, components, lib)
  - api/ → FastAPI backend (routers, services, models, tests)
  - supabase/ → migrations
- **Tests:** 825 passing (py -3.13 -m pytest api/tests/ -q)
- **Routes:** 64 compiled
- **Current branch:** main (staging synced to main)

### 2.2 crowagent-website (marketing site)
- **Stack:** Static HTML/CSS/JS
- **URL:** crowagent.ai
- **Repo:** github.com/crowagent/crowagent-website
- **Local path:** C:\Users\bhave\Crowagent Repo\crowagent-website
- **Deployed:** Vercel (crowagent-website project)

### 2.3 crowagent-internal (founders portal)
- **Stack:** Next.js 14 TypeScript
- **URL:** portal.crowagent.ai
- **Repo:** github.com/crowagent/crowagent-internal
- **Local path:** C:\Users\bhave\Crowagent Repo\crowagent-internal
- **Purpose:** Founders-only mission control — MRR dashboard, HITL approval queue,
  risk register, R&D log, sales pipeline, infra subscriptions, ops calendar
- **Auth:** Google SSO + mandatory TOTP MFA (founder emails allowlist in FOUNDER_EMAILS env var)
- **Deployed:** Vercel (crowagent-internal project)

---

## 3. PRODUCTS

### 3.1 CrowAgent Core (LIVE — v1.0)
**What it does:** MEES compliance intelligence for UK commercial landlords
**Regulatory driver:** SI 2015/962 — EPC Band C by April 2028 (proposed target)
**Target customer:** Commercial landlords, 1–100 properties rated D/E/F
**Core workflow:**
1. Postcode → EPC Open Data Communities API lookup
2. MEES gap analysis (current band vs Band C 2028)
3. Penalty exposure per SI 2015/962 reg 39 (rateable-value formula — NOT flat £30K)
4. 3 retrofit scenarios (Low Cost / Balanced / Premium)
5. NPV financial model (3.5% HM Treasury Green Book + 2% Ofgem escalation)
6. Branded PDF report (30s SLA)

**Pricing:** Free / Starter £149 / Pro £299 / Portfolio £599 / Agency (custom)
**Key API:** api/app/routers/core.py + api/app/services/mees_engine.py
**Key pages:** web/app/(dashboard)/dashboard/core/ + web/app/(dashboard)/epc-mees/

**⚠️ REGULATORY CRITICAL — never get these wrong:**
- Band C 2028 = PROPOSED target, subject to legislative confirmation — NEVER say it's current law
- Penalty formula: breach <3mo = RV×10% min £5K max £50K; ≥3mo = RV×20% min £10K max £150K
- NEVER use flat £30,000 penalty — this is wrong and legally misleading
- NPV rate: 3.5% HM Treasury Green Book (2022) — not editable, always cited

### 3.2 CrowMark (LIVE — v1.0)
**What it does:** PPN 002 social value platform for UK public sector suppliers
**Regulatory driver:** PPN 002 mandatory minimum 10% social value weighting
**Target customer:** SME suppliers bidding for UK public sector contracts
**Core workflow:**
1. Contract profile (sector, value, geography, duration)
2. Deterministic PPN 002 mission mapping (NOT AI — rules-based)
3. TOMs measures selection with Oxford SVB 2023-24 proxy values (stored in DB)
4. AI narrative generation via Gemini (server-side only — NEVER client-side)
5. Evidence tracker + monthly email reminders
6. PDF export

**Pricing:** Free / Starter £49 / Professional £149 / Agency £399
**Key API:** api/app/routers/crowmark.py
**Key pages:** web/app/(dashboard)/crowmark/ + web/app/(dashboard)/dashboard/social-value/

**⚠️ REGULATORY CRITICAL:**
- Oxford SVB proxy values MUST be stored in DB (toms_measures_library table) — NEVER hardcoded
- PPN 002 (Feb 2025) AND PPN 06/20 (Jan 2021) both supported — framework depends on contract date
- Gemini API key is Railway env var ONLY — NEVER in frontend, NEVER NEXT_PUBLIC_

### 3.3 CSRD Checker (LIVE — Free tool)
**What it does:** CSRD applicability assessment post-Omnibus I
**Regulatory driver:** Directive (EU) 2026/470 (Omnibus I) — in force 18 March 2026
**Key thresholds (POST-OMNIBUS I):**
- >1,000 employees AND >€450M turnover — BOTH required (not either/or)
- OLD thresholds (250/€40M) are SUPERSEDED — never use them
**Three-layer engine:** Layer 1 mandatory scope / Layer 2 forward risk / Layer 3 value chain
**Key page:** web/app/(dashboard)/csrd/page.tsx + web/app/api/csrd/check/route.ts

### 3.4 Phase 2 Products (not built — placeholders only)
- CrowSight: BNG compliance → /crowsight
- CrowBuild: Housing retrofit → /crowbuild
- CrowNest: NHS Green Plan → /crownest
- CrowTrace: ESG reporting → /crowtrace
- Regulatory Monitor → /regulatory-monitor

---

## 4. TECHNOLOGY STACK

```
Frontend:          Next.js 14 (TypeScript) — Vercel Pro
Backend:           FastAPI Python 3.12 — Railway Pro
Database:          PostgreSQL + Row Level Security — Supabase
Auth:              Supabase Auth (email/password + Google OAuth + TOTP MFA)
AI (narrative):    Google Gemini 1.5 Flash — Railway env var only, NEVER client-side
AI (reasoning):    Anthropic Claude — internal portal only
Payments:          Stripe (live mode)
Email:             Resend (hello@crowagent.ai) — near free tier limit (2820/3000)
Analytics:         PostHog EU instance
Error monitoring:  Sentry (free tier — 8100/10000 errors/month)
EPC data:          EPC Open Data Communities API (MHCLG)
Storage:           Supabase Storage (reports + evidence buckets)
CDN/DNS:           Cloudflare (DDoS, Bot Fight Mode, SSL Full Strict, AI Labyrinth)
Charts:            Chart.js
Onboarding UX:     driver.js
Testing:           pytest (api) + Playwright E2E
```

---

## 5. DATABASE

**Production Supabase:** gujtuecjzfiqsdnzgyvo (eu-west-1)
**Staging Supabase:** yxyuqssqgdkcygnenfjh (eu-west-1)

**Migrations applied (prod + staging):** 20260319000001 through 20260320200009

**Key tables:**
- organisations, profiles (users)
- assets (commercial properties + EPC data)
- compliance_results (immutable — no updated_at)
- property_scenario_models (NPV calculations — immutable)
- reports (PDF report metadata + storage paths)
- contracts (CrowMark contract profiles)
- toms_measures_library (Oxford SVB proxy values — DB not hardcoded)
- ppn_missions_library (PPN 002 + 06/20 missions)
- contract_selected_measures, contract_narratives, evidence_log
- csrd_assessments
- user_onboarding, product_waitlist
- partner_enquiries
- beta_invites (whitelist — currently NOT enforced on signup)
- approval_queue, founder_sessions, rd_log, risk_register (internal portal tables)
- mrr_snapshots, sales_pipeline, calendar_events, infra_subscriptions (internal portal)

**RLS:** Enforced on all tables. All queries go through authenticated Supabase client.
**Service role key:** Railway env only — NEVER in frontend or NEXT_PUBLIC_ vars.

---

## 6. AUTHENTICATION & MFA

### Platform (app.crowagent.ai)
- Email + password signup
- Google OAuth available
- **MFA:** Mandatory TOTP for Owner/Admin roles on first login
- **MFA:** Optional (encouraged) for Member role
- No SMS MFA — never
- Session management: Supabase Auth JWT

### Internal Portal (portal.crowagent.ai)
- **Google SSO as primary** login method
- Email/password as secondary (for fallback)
- **MFA:** Mandatory TOTP for ALL portal users — no exceptions
- Device trust: 30-day mfa_verified cookie
- Access restricted to FOUNDER_EMAILS env var list
- Founders: bhavesh.parihar@gmail.com, crowagent.platform@gmail.com + others

### Supabase Auth settings
- TOTP MFA: Enabled
- SMS MFA: Disabled
- Google OAuth: Enabled (credentials in Supabase dashboard)
- Redirect URLs: app.crowagent.ai/**, portal.crowagent.ai/auth/callback,
  localhost 3000/3001/3002 /auth/callback

### Future MFA (not built yet)
- Passkeys (Windows Hello, Touch ID): Phase 2 Month 2
- Enterprise SSO/SAML via Auth0: Phase 3 Month 6

---

## 7. ENVIRONMENT VARIABLES

### What goes where (CRITICAL — never mix these up)
```
Railway (backend secrets — NEVER in frontend):
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
  GEMINI_API_KEY, RESEND_API_KEY, EPC_API_EMAIL, EPC_API_KEY
  STRIPE_SECRET_KEY

Vercel server env (route handlers only — NOT NEXT_PUBLIC_):
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

Vercel public env (safe to expose):
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_POSTHOG_KEY

crowagent-internal Vercel env:
  All of the above + ANTHROPIC_API_KEY, RAILWAY_API_TOKEN,
  RAILWAY_PROJECT_IDS, VERCEL_TOKEN, VERCEL_TEAM_ID,
  GITHUB_TOKEN, SENTRY_AUTH_TOKEN, FOUNDER_EMAILS
  INTERNAL_APP_URL=https://portal.crowagent.ai
```

**GOLDEN RULE:** If it's a secret key, it goes in Railway. If it starts with
NEXT_PUBLIC_, it's safe to expose. GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY
must NEVER appear in any frontend file or NEXT_PUBLIC_ variable.

---

## 8. ROUTING & URL STRUCTURE

### app.crowagent.ai routes
```
/                          → redirects to /dashboard
/dashboard                 → main dashboard (overview)
/dashboard/core            → portfolio page
/epc-mees                  → unified EPC lookup + MEES check
/csrd                      → CSRD checker
/monitoring                → monitoring dashboard
/crowmark                  → CrowMark hub
/dashboard/social-value/   → CrowMark sub-pages (query, score)
/crowmark/contracts/       → contract management
/analytics                 → analytics dashboard
/command-centre            → Command Centre (Pro+ tier gated)
/settings                  → user settings
/dashboard/admin/invites   → beta invite management (admin only)
/login, /signup            → auth pages
/mfa/setup, /mfa/verify    → MFA enrollment and verification
/onboarding                → new user onboarding wizard
/reports                   → reports history
/coming-soon routes:       /crowsight, /crowbuild, /crownest, /crowtrace, /regulatory-monitor
```

### crowagent.ai routes (marketing)
```
/                          → homepage
/products/crowagent-core   → Core product page
/products/crowmark         → CrowMark product page  
/products                  → products hub
/pricing                   → pricing page
/blog                      → blog index
/blog/csrd-omnibus-i-2026  → CSRD Omnibus I article
/blog/mees-band-c-2028     → MEES Band C article
/partners                  → partners page
/privacy, /terms, /cookies → legal pages
```

### Redirects (app → marketing site)
- app.crowagent.ai/pricing → crowagent.ai/pricing
- app.crowagent.ai/products/* → crowagent.ai/products/*
- app.crowagent.ai/blog/* → crowagent.ai/blog/*

---

## 9. FEATURE GATING (Stripe tiers)

```
Free:      0 properties, CSRD checker only
Starter:   5 properties, Core only
Pro:       25 properties, Core + Command Centre
Portfolio: 100 properties, Core + Command Centre
Agency:    Unlimited, all features + white-label
```

**CrowMark tiers:** Free / Starter (£49) / Professional (£149) / Agency (£399)
**Command Centre:** Pro/Portfolio/Agency/Professional/Growth/Enterprise = full access
**Feature gates file:** web/lib/feature-gates.ts

---

## 10. BRAND & DESIGN SYSTEM

### Colours (CSS variables — always use these, never hardcode hex)
```css
--ca-bg-page:        #05101E  /* Obsidian — page background */
--ca-bg-card:        #0A1F3A  /* Navy — cards, nav, modals */
--ca-teal:           #0CC9A8  /* Primary action, CTAs, active */
--ca-text-primary:   #E4ECF7  /* Cloud — headings, body */
--ca-text-secondary: #8A9DB8  /* Steel — descriptions, meta */
--ca-warning:        #F59E0B  /* Amber — at-risk ONLY, never revenue */
--ca-error:          #F04438  /* Red — non-compliant, errors */
```

### Typography
- **Display/headings/buttons/nav:** Syne (400/600/700/800)
- **Body/inputs/descriptions:** DM Sans (300/400/500/600)
- Never use Arial, Helvetica, system-ui — brand violation

### Logo rules
- Nav: 38px height, as-is (never invert in nav)
- Footer: 32px, filter: brightness(0) saturate(100%) invert(100%) opacity 0.95
- Minimum size: 32px — never below
- Never stretch or distort (always height + width: auto)

### Product colours
```
CrowAgent Core:  #0CC9A8 (Teal)
CrowMark:        #A78BFA (Purple)
CrowSight:       #5BC8FF (Sky)
CrowBuild:       #C2FF57 (Lime)
CrowTrace:       #FB923C (Orange)
CrowNest:        #F472B6 (Pink)
```

---

## Brand Tokens
Canonical CSS brand tokens are at: crowagent-brand-tokens.css (repo root or web/app/)
Always read this file before any CSS or styling work.
Never hardcode hex values. Never construct tokens from memory.

---

## 11. TESTING & QUALITY

### Running tests
```powershell
# API tests
cd api
py -3.13 -m pytest tests/ -q

# Frontend build check
cd web
npm run build
# Must show 0 TypeScript errors

# Website tests
cd crowagent-website
npm test
```

### Current test count
- API: 825 tests passing
- Website: 31 tests passing

### CI/CD
- GitHub Actions: ci.yml (test + SAST + secrets scan)
- Railway: auto-deploys on push to main (backend)
- Vercel: auto-deploys on push to main (frontend)
- Branch protection: main branch protected on crowagent-platform

---

## 12. SUPABASE MIGRATION RULES

**Never reuse a timestamp.** Currently applied through: 20260320200009

**Next available timestamp:** 20260320200010 (increment by 1)

**Always apply to BOTH prod and staging:**
```powershell
npx supabase link --project-ref gujtuecjzfiqsdnzgyvo
npx supabase db push --linked --yes
npx supabase link --project-ref yxyuqssqgdkcygnenfjh
npx supabase db push --linked --yes
```

**Migration rules:**
- Additive only — no destructive changes in Phase 1
- Always use IF NOT EXISTS on CREATE TABLE
- Always use DROP POLICY IF EXISTS before CREATE POLICY
- Test on staging before production

---

## 13. CURRENT BUILD STATE (as of 21 March 2026)

### What's working
- app.crowagent.ai — LIVE, all 64 routes
- crowagent.ai — LIVE, marketing site
- portal.crowagent.ai — LIVE, founders portal
- All Sprints 0-5 merged and deployed
- 825 API tests passing
- 9 Supabase migrations applied to prod + staging
- MFA implemented on both platform and portal
- Brand remediation (prompts 1-6) in progress

### Known pending work
1. Google OAuth end-to-end test on portal.crowagent.ai
2. Brand Master Verification report (after prompts 1-6 complete)
3. 20 beta testers to invite via /dashboard/admin/invites
4. LinkedIn article post (03_Social_Media_Launch_Pack.docx)
5. Resend upgrade (2820/3000 emails — near limit)
6. crowagent-internal GitHub → Vercel auto-deploy not yet connected
7. 5 dependency vulnerabilities on crowagent-internal (npm audit needed)
8. Internal portal long-term strategy (waitlist management, beta tracking, ops)
9. Pre-launch waitlist system (get early access → CTA on crowagent.ai)
10. Staging branch on crowagent-platform: delete protection + remove stale branch

### Railway token
- Renewed March 2026
- GitHub Secret RAILWAY_TOKEN updated

---

## 14. COMMON COMMANDS

```powershell
# Platform — run tests
cd "C:\Users\bhave\Crowagent Repo\crowagent-platform\api"
py -3.13 -m pytest tests/ -q

# Platform — build frontend
cd "C:\Users\bhave\Crowagent Repo\crowagent-platform\web"
npm run build

# Platform — dev server
cd "C:\Users\bhave\Crowagent Repo\crowagent-platform\web"
npm run dev

# API — dev server
cd "C:\Users\bhave\Crowagent Repo\crowagent-platform\api"
uvicorn app.main:app --reload --port 8000

# Internal portal — dev server
cd "C:\Users\bhave\Crowagent Repo\crowagent-internal"
npm run dev

# Internal portal — deploy
cd "C:\Users\bhave\Crowagent Repo\crowagent-internal"
npx vercel --prod

# Apply Supabase migrations
cd "C:\Users\bhave\Crowagent Repo\crowagent-platform"
npx supabase link --project-ref gujtuecjzfiqsdnzgyvo
npx supabase db push --linked --yes

# Check all remote branches
git branch -r

# Sync staging to main
git push origin main:staging
```

---

## 15. WHAT NOT TO DO (learned the hard way)

- **Never use flat £30,000 MEES penalty** — use SI 2015/962 reg 39 formula
- **Never hardcode Oxford SVB proxy values** — always read from toms_measures_library table
- **Never put GEMINI_API_KEY in frontend** — Railway only
- **Never put SUPABASE_SERVICE_ROLE_KEY in frontend** — Railway only
- **Never reuse a Supabase migration timestamp** — always increment
- **Never merge without running tests** — 825 must stay green
- **Never use two redirects() functions in next.config.mjs** — JS silently drops the first
- **Never use CREATE POLICY without DROP POLICY IF EXISTS** — causes migration errors
- **Never say Band C 2028 is current law** — it's a PROPOSED target
- **Never use old CSRD thresholds (250 employees / €40M)** — superseded by Omnibus I
- **Never apply filter: invert() to nav logo** — footer only
- **Never use amber (#F59E0B) for positive revenue metrics** — warning states only
- **Never fake testimonials** — UK Consumer Protection Regulations 2008 violation
- **Never use SMS MFA** — SIM swapping risk, not planned
- **Never deploy to production without tests passing**

---

## 16. REGULATORY CONSTANTS (never change without legal review)

```python
# MEES Penalty (SI 2015/962 reg 39)
SHORT_BREACH_RATE = 0.10      # < 3 months: 10% of rateable value
SHORT_BREACH_MIN = 5_000      # £5,000 minimum
SHORT_BREACH_MAX = 50_000     # £50,000 maximum
LONG_BREACH_RATE = 0.20       # ≥ 3 months: 20% of rateable value
LONG_BREACH_MIN = 10_000      # £10,000 minimum
LONG_BREACH_MAX = 150_000     # £150,000 maximum

# NPV Model
DISCOUNT_RATE = 0.035         # 3.5% HM Treasury Green Book (2022)
ENERGY_ESCALATION = 0.020     # 2.0% Ofgem SME rate

# MEES Deadline
MEES_BAND_C_DATE = "2028-04-01"    # PROPOSED — not yet enacted law
MEES_BAND_C_STATUS = "proposed regulatory target, subject to legislative confirmation"

# CSRD Omnibus I (Directive EU 2026/470 — in force 18 March 2026)
CSRD_EMPLOYEES_THRESHOLD = 1_000   # > 1,000 employees AND
CSRD_TURNOVER_THRESHOLD = 450_000_000  # > €450M turnover (BOTH required)
```

---

---

## 17. DOMAIN PROTECTION — NON-NEGOTIABLE (added 24 Mar 2026)

**This incident has occurred 3+ times. Any deviation is a P0 incident.**

NEVER run `vercel --prod` or `vercel deploy --prod` from the `crowagent-platform`
or `crowagent-internal` repo directories. Those repos must NEVER deploy to crowagent.ai.

**SAFE deploy commands by repo:**
```
crowagent-website:   cd "C:\Users\bhave\Crowagent Repo\crowagent-website" && .\deploy.ps1
crowagent-platform:  Vercel auto-deploys on main push. NEVER run vercel CLI manually.
crowagent-internal:  Vercel auto-deploys on main push. NEVER run vercel CLI manually.
```

**Domain ownership (LOCKED — never reassign):**
```
crowagent.ai         → Vercel project: crowagent-website        (prj_9gLYGCDjxHjoFeg6nRD5iXAguXfO)
app.crowagent.ai     → Vercel project: crowagent-platform-web   (prj_vc6pLJ1Fza05yno17iJtOKWerXDI)
portal.crowagent.ai  → Vercel project: crowagent-internal       (prj_33fwSvlhEWoYZo2qfSegL1MKIKu5)
```

**Root cause of recurring incident:**
Running `vercel --prod` from `crowagent-platform` without a locked `.vercel/project.json`
redeploys the Next.js platform app to crowagent.ai. The platform's root `/` redirects
to `/dashboard`, which redirects unauthenticated users to `/login`.

**If crowagent.ai redirects to /login — IMMEDIATE FIX:**
```powershell
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"
.\deploy.ps1
```

**vercel.json WARNING:**
The `vercel.json` in this repo MUST NOT contain a redirect for `"source": "/"`.
Any redirect from `/` will break the marketing homepage. Before adding any redirect
rule here, verify the source path does NOT affect the root URL.

---

*CLAUDE.md · CrowAgent Ltd · Company No. 17076461*
*Last updated: 21 March 2026 · crowagent.ai · hello@crowagent.ai*
*Read docs/INFRASTRUCTURE_REGISTRY.md alongside this file*
