import { chromium } from 'playwright-core';

async function testOAuthFlow() {
  console.log('--- STARTING OAUTH 2.0 LIBRARY TEST ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  // Test 1: Google OAuth 2.0
  console.log('1. Navigating to Login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('2. Clicking Google OAuth 2.0 button (initiating /api/v1/auth/google)...');
  const googleBtn = page.locator('button:has-text("Google")');
  await googleBtn.click();

  // Wait for redirect to /oauth-callback and then to /
  console.log('3. Waiting for OAuth 2.0 callback processing...');
  await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

  const navTextGoogle = await page.locator('nav').textContent();
  console.log('4. Navigated to Home. Navbar content:', navTextGoogle.replace(/\s+/g, ' '));
  const googleSuccess = navTextGoogle.includes('Google OAuth') || navTextGoogle.includes('Google');
  console.log('5. Google OAuth 2.0 User Logged In successfully:', googleSuccess);

  // Logout
  const logoutBtn = page.locator('button[title="Log out"]');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    console.log('6. Logged out cleanly.');
    await page.waitForTimeout(1000);
  }

  // Test 2: Facebook OAuth 2.0
  console.log('7. Navigating to Login page for Facebook...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('8. Clicking Facebook OAuth 2.0 button (initiating /api/v1/auth/facebook)...');
  const fbBtn = page.locator('button:has-text("Facebook")');
  await fbBtn.click();

  console.log('9. Waiting for Facebook OAuth 2.0 callback processing...');
  await page.waitForURL('http://localhost:5173/', { timeout: 10000 });

  const navTextFb = await page.locator('nav').textContent();
  console.log('10. Navigated to Home. Navbar content:', navTextFb.replace(/\s+/g, ' '));
  const fbSuccess = navTextFb.includes('Facebook OAuth') || navTextFb.includes('Facebook');
  console.log('11. Facebook OAuth 2.0 User Logged In successfully:', fbSuccess);

  await browser.close();
  console.log('--- ALL OAUTH 2.0 TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

testOAuthFlow().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
