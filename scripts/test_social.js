import { chromium } from 'playwright-core';

async function testSocialButtons() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  console.log('1. Navigating to http://localhost:5173/login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  // 1. Test Google button
  console.log('2. Clicking Google Social Button...');
  const googleBtn = page.locator('button:has-text("Google")');
  await googleBtn.click();
  await page.waitForTimeout(2000);

  console.log('3. URL after Google click:', page.url());
  let loggedInUser = await page.locator('nav').textContent();
  console.log('4. Navbar contains "Google Explorer"?', loggedInUser.includes('Google Explorer'));

  // Log out
  const logoutBtn = page.locator('button[title="Log out"]');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    console.log('5. Logged out successfully.');
    await page.waitForTimeout(1000);
  }

  // 2. Test Facebook button
  console.log('6. Navigating to login again...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  
  console.log('7. Clicking Facebook Social Button...');
  const fbBtn = page.locator('button:has-text("Facebook")');
  await fbBtn.click();
  await page.waitForTimeout(2000);

  console.log('8. URL after Facebook click:', page.url());
  loggedInUser = await page.locator('nav').textContent();
  console.log('9. Navbar contains "Facebook Explorer"?', loggedInUser.includes('Facebook Explorer'));

  await browser.close();
  console.log('Social login test finished.');
}

testSocialButtons().catch(console.error);
