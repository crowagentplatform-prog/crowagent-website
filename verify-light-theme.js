/**
 * Light Theme Verification Script
 * Run this in browser console on any crowagent.ai page to verify light theme
 */

(function() {
  console.log('🎨 CrowAgent Light Theme Verification\n');
  
  // Switch to light theme
  document.documentElement.setAttribute('data-theme', 'light');
  
  // Get computed styles
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  
  // Expected values from Master Brand Pack v2.0
  const expected = {
    '--bg': 'rgb(242, 247, 255)',        // #F2F7FF
    '--surf': 'rgb(255, 255, 255)',      // #FFFFFF
    '--teal': 'rgb(10, 168, 140)',       // #0AA88C
    '--cloud': 'rgb(4, 14, 26)',         // #040E1A
    '--steel': 'rgb(30, 58, 88)',        // #1E3A58
    '--border': 'rgb(216, 232, 245)',    // #D8E8F5
    '--border2': 'rgb(184, 204, 224)',   // #B8CCE0
  };
  
  let passed = 0;
  let failed = 0;
  
  console.log('Checking CSS Variables:\n');
  
  for (const [variable, expectedValue] of Object.entries(expected)) {
    const actualValue = styles.getPropertyValue(variable).trim();
    const matches = actualValue === expectedValue;
    
    if (matches) {
      console.log(`✅ ${variable}: ${actualValue}`);
      passed++;
    } else {
      console.error(`❌ ${variable}: Expected ${expectedValue}, got ${actualValue}`);
      failed++;
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ Passed: ${passed}/${passed + failed}`);
  console.log(`❌ Failed: ${failed}/${passed + failed}`);
  
  // Check contrast ratios
  console.log('\n🔍 Checking Contrast Ratios:');
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  const contrastTests = [
    { name: 'Headings (--cloud) on background', fg: '#040E1A', bg: '#F2F7FF', min: 7.0, level: 'AAA' },
    { name: 'Body text (--steel) on background', fg: '#1E3A58', bg: '#F2F7FF', min: 4.5, level: 'AA' },
    { name: 'Teal on white', fg: '#0AA88C', bg: '#FFFFFF', min: 4.5, level: 'AA' },
    { name: 'Secondary text (--mist) on background', fg: '#3D6080', bg: '#F2F7FF', min: 4.5, level: 'AA' },
  ];
  
  contrastTests.forEach(test => {
    const ratio = getContrastRatio(test.fg, test.bg);
    const passes = ratio >= test.min;
    const icon = passes ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${ratio.toFixed(2)}:1 (${test.level} ${passes ? 'PASS' : 'FAIL'})`);
  });
  
  // Check logo
  console.log('\n🎯 Checking Logo:');
  const logoBox = document.querySelector('.logo-box, .logo-mark-wrap');
  if (logoBox) {
    const logoStyles = getComputedStyle(logoBox);
    const hasBorder = logoStyles.borderWidth !== '0px' && logoStyles.borderStyle !== 'none';
    console.log(hasBorder ? '✅ Logo has border on light background' : '❌ Logo missing border');
  } else {
    console.log('⚠️  Logo element not found on this page');
  }
  
  // Check theme attribute
  console.log('\n🔧 Theme Status:');
  const themeAttr = document.documentElement.getAttribute('data-theme');
  console.log(`Current theme: ${themeAttr || 'not set (using default)'}`);
  console.log(`localStorage.ca_theme: ${localStorage.getItem('ca_theme')}`);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (failed === 0) {
    console.log('✅ All checks passed! Light theme is correctly implemented.');
  } else {
    console.log('❌ Some checks failed. Review the errors above.');
  }
  console.log('='.repeat(50));
  
  // Instructions
  console.log('\n📝 To test manually:');
  console.log('1. Toggle theme using the switcher in navigation');
  console.log('2. Reload the page - theme should persist');
  console.log('3. Check text readability on all sections');
  console.log('4. Verify borders are visible on cards');
  console.log('5. Test on mobile devices');
  
})();
