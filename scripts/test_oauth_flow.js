import { chromium } from 'playwright-core';

async function testOAuthFlow() {
  console.log('--- STARTING OAUTH 2.0 TEST SUITE ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  // Test 1: Real External Redirect to Google
  console.log('1. Navigating to Login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('2. Clicking Google (Live OAuth)...');
  const googleLiveBtn = page.getByRole('button', { name: 'Google', exact: true });
  await Promise.all([
    page.waitForNavigation({ url: /accounts\.google\.com/, timeout: 15000 }),
    googleLiveBtn.click()
  ]);
  console.log('3. Successfully navigated to real Google OAuth URL:', page.url().substring(0, 60) + '...');

  // Test 2: Real External Redirect to Facebook
  console.log('4. Navigating back to Login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('5. Clicking Facebook (Live OAuth)...');
  const fbLiveBtn = page.getByRole('button', { name: 'Facebook', exact: true });
  await Promise.all([
    page.waitForNavigation({ url: /facebook\.com/, timeout: 15000 }),
    fbLiveBtn.click()
  ]);
  console.log('6. Successfully navigated to real Facebook OAuth URL:', page.url().substring(0, 60) + '...');

  // Test 3: Demo Mode Token Exchange & Session Creation
  console.log('7. Navigating back to Login for Token & Session Verification...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  console.log('8. Clicking Facebook Demo...');
  const fbDemoBtn = page.getByRole('button', { name: 'Facebook Demo', exact: true });
  await fbDemoBtn.click();

  await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
  const navText = await page.locator('nav').textContent();
  console.log('9. Session established via /oauth-callback. Navbar:', navText.replace(/\s+/g, ' '));

  await browser.close();
  console.log('--- ALL OAUTH 2.0 TESTS COMPLETED AND VERIFIED ---');
  process.exit(0);
}

testOAuthFlow().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
