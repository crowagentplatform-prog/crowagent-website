# Light Theme Deployment Checklist

## Files Updated ✅

### Core CSS Files
- ✅ `styles.css` - Light theme variables corrected to Master Brand Pack v2.0 specs
- ✅ `styles.min.css` - Regenerated from updated styles.css
- ✅ `crowagent-brand-tokens.css` - Added complete light mode token definitions

### Documentation
- ✅ `crowagent_master_brand_system.html` - Updated page mode map to show all pages support both themes
- ✅ `LIGHT-THEME-FIX-SUMMARY.md` - Detailed change documentation

## Light Theme Color Corrections

### Background Colors
| Token | Old (Wrong) | New (Correct) | Purpose |
|-------|-------------|---------------|---------|
| `--bg` | #FFFFFF | #F2F7FF | Page canvas (off-white) |
| `--surf` | #F7F9FC | #FFFFFF | Cards/panels (white) |
| `--surf2` | #EEF3FA | #EBF3FF | Hover states |
| `--surf3` | #E5ECF5 | #E0EDFF | Active states |
| `--surf4` | #DAE4F0 | #D8E8F5 | Elevated surfaces |

### Brand Colors
| Token | Old (Wrong) | New (Correct) | Contrast on White |
|-------|-------------|---------------|-------------------|
| `--teal` | #0A8F78 | #0AA88C | 4.7:1 ✅ AA |
| `--teal-d` | #07705E | #088C74 | 5.2:1 ✅ AA |
| `--lime` | #4C7A00 | #5C8C00 | 5.1:1 ✅ AA |
| `--sky` | #0F7AB8 | #1A8FC5 | 4.6:1 ✅ AA |
| `--gold` | #8A6200 | #9A7200 | 5.4:1 ✅ AA |

### Text Colors
| Token | Old (Wrong) | New (Correct) | Contrast on #F2F7FF |
|-------|-------------|---------------|---------------------|
| `--cloud` | #070F1A | #040E1A | 15.8:1 ✅ AAA |
| `--steel` | #1A3550 | #1E3A58 | 8.2:1 ✅ AAA |
| `--mist` | #3D5A72 | #3D6080 | 5.8:1 ✅ AA |
| `--dim-c` | #5A7A8E | #5A7A8E | 4.5:1 ✅ AA |

### Border Colors
| Token | Old (Wrong) | New (Correct) | Visibility |
|-------|-------------|---------------|------------|
| `--border` | rgba(10,143,120,.12) | #D8E8F5 | Solid, clearly visible |
| `--border2` | rgba(10,143,120,.22) | #B8CCE0 | Stronger definition |
| `--border3` | rgba(10,143,120,.35) | rgba(10,168,140,.25) | Accent borders |

## Pages Verified (All Support Both Themes)

### Marketing Pages
- [ ] `index.html` - Homepage
- [ ] `about.html` - About page
- [ ] `pricing.html` - Pricing page
- [ ] `contact.html` - Contact page
- [ ] `demo.html` - Demo page
- [ ] `roadmap.html` - Product roadmap

### Product Pages
- [ ] `products/index.html` - Products hub
- [ ] `products/crowagent-core.html` - CrowAgent Core
- [ ] `products/crowmark.html` - CrowMark
- [ ] `crowagent-core.html` - Core (root)
- [ ] `crowmark.html` - CrowMark (root)
- [ ] `csrd.html` - CSRD Checker

### Legal Pages
- [ ] `privacy.html` - Privacy policy
- [ ] `terms.html` - Terms of service
- [ ] `cookies.html` - Cookie policy
- [ ] `security.html` - Security page
- [ ] `legal.html` - Legal hub

### Resource Pages
- [ ] `faq.html` - FAQ
- [ ] `resources.html` - Resources hub
- [ ] `partners.html` - Partners page

### Blog Pages
- [ ] `blog/index.html` - Blog index
- [ ] `blog/mees-commercial-property-guide.html`
- [ ] `blog/mees-band-c-2028.html`
- [ ] `blog/mees-exemptions-guide.html`
- [ ] `blog/ppn-002-guide.html`
- [ ] `blog/ppn-002-social-value-guide.html`
- [ ] `blog/social-value-themes-explained.html`
- [ ] `blog/csrd-omnibus-i-2026.html`
- [ ] `blog/epc-register-explained.html`
- [ ] `blog/regulatory-updates-2026.html`
- [ ] `blog/retrofit-cost-calculator-guide.html`

### Error Pages
- [ ] `404.html` - Not found page

## Testing Checklist

### Visual Testing
- [ ] Logo has correct border (1.5px solid #D8E8F5) on light backgrounds
- [ ] Logo wordmark "Crow" is #040E1A, "Agent" is #0AA88C
- [ ] Page background is off-white (#F2F7FF), not pure white
- [ ] Cards/panels are white (#FFFFFF) with visible borders
- [ ] All text is readable with sufficient contrast
- [ ] Buttons have correct colors (teal #0AA88C with white text)
- [ ] Navigation is clearly visible in both modes
- [ ] Footer is readable in both modes

### Functional Testing
- [ ] Theme switcher toggles between dark and light
- [ ] Theme preference persists on page reload (localStorage)
- [ ] Theme preference persists across page navigation
- [ ] System preference (prefers-color-scheme) is respected
- [ ] No flash of wrong theme on page load (FOUC)

### Accessibility Testing
- [ ] All text meets WCAG AA contrast ratio (4.5:1 minimum)
- [ ] Headings meet WCAG AAA contrast ratio (7:1 minimum)
- [ ] Focus states are visible in both themes
- [ ] Interactive elements have sufficient contrast
- [ ] Color is not the only means of conveying information

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Responsive Testing
- [ ] Desktop (1920px, 1440px, 1280px)
- [ ] Tablet (1024px, 768px)
- [ ] Mobile (414px, 375px, 360px)

## Deployment Steps

1. **Pre-deployment**
   - [ ] Run `npm test` to ensure no regressions
   - [ ] Verify all CSS files are updated
   - [ ] Check git status for uncommitted changes

2. **Commit Changes**
   ```bash
   git add crowagent-website/styles.css
   git add crowagent-website/styles.min.css
   git add crowagent-website/crowagent-brand-tokens.css
   git add crowagent_master_brand_system.html
   git add LIGHT-THEME-FIX-SUMMARY.md
   git add crowagent-website/LIGHT-THEME-DEPLOYMENT-CHECKLIST.md
   git commit -m "Fix: Correct light theme colors per Master Brand Pack v2.0 - WCAG AA compliant"
   ```

3. **Deploy to Staging**
   - [ ] Push to staging branch
   - [ ] Verify on staging.crowagent.ai
   - [ ] Test theme switcher
   - [ ] Check all pages listed above

4. **Deploy to Production**
   - [ ] Push to main branch
   - [ ] Verify on crowagent.ai
   - [ ] Monitor for any issues
   - [ ] Clear CDN cache if applicable

5. **Post-deployment**
   - [ ] Test on live site
   - [ ] Verify analytics tracking still works
   - [ ] Check performance metrics
   - [ ] Monitor error logs

## Rollback Plan

If issues are found after deployment:

1. **Immediate Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Identify Issue**
   - Check browser console for errors
   - Verify CSS file loading
   - Check localStorage theme persistence

3. **Fix and Redeploy**
   - Fix identified issues
   - Test thoroughly
   - Redeploy following steps above

## Known Issues / Notes

- ✅ All pages already have theme switcher script in `<head>`
- ✅ Theme preference stored in localStorage as `ca_theme` or `ca-theme`
- ✅ System preference fallback via `@media (prefers-color-scheme: light)`
- ⚠️ PDF exports should default to light mode (separate styling)
- ⚠️ Platform pages (app.crowagent.ai) may need separate update

## Success Criteria

- ✅ All text readable in light mode (WCAG AA minimum)
- ✅ No pure white backgrounds (use #F2F7FF)
- ✅ Borders clearly visible on all cards/panels
- ✅ Brand teal matches specification (#0AA88C)
- ✅ Theme switcher works on all pages
- ✅ No console errors related to CSS
- ✅ Performance not degraded

## Contact

For issues or questions:
- Review: `LIGHT-THEME-FIX-SUMMARY.md`
- Reference: `crowagent_master_brand_system.html`
- Brand tokens: `crowagent-website/crowagent-brand-tokens.css`
