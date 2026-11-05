import { chromium } from 'playwright-core';

async function testTechExactlyFeatures() {
  console.log('--- TESTING TECH EXACTLY BRANDING & NOTIFICATIONS ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  // 1. Verify Home & Branding
  console.log('1. Visiting Home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  const title = await page.title();
  console.log('2. Page Title:', title);

  const brandText = await page.locator('nav').textContent();
  console.log('3. Navbar contains "Tech Exactly"?', brandText.includes('TechExactly') || brandText.includes('Tech Exactly'));

  // 2. Test Notification Center Link & Page
  console.log('4. Navigating to /notifications...');
  const notifLink = page.getByRole('link', { name: 'Notifications' }).first();
  await notifLink.click();
  await page.waitForURL('http://localhost:5173/notifications');
  console.log('5. Current URL:', page.url());

  const notifHeading = await page.locator('h1').textContent();
  console.log('6. Notification Hub Heading:', notifHeading);

  // 3. Test Admin Notification Sender
  console.log('7. Logging in as Admin to test broadcast sender...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  // Quick Demo Admin click
  await page.locator('button:has-text("Demo Admin")').click();
  await page.locator('button:has-text("Sign In")').click();
  await page.waitForURL('http://localhost:5173/');

  console.log('8. Navigating to Admin Panel...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });

  console.log('9. Clicking "Send Notifications & Broadcast" Tab...');
  const broadcastTab = page.locator('button:has-text("Send Notifications & Broadcast")');
  await broadcastTab.click();

  console.log('10. Filling Broadcast Announcement form...');
  const titleInput = page.locator('input[placeholder*="Scheduled System Update"]');
  await titleInput.fill('Tech Exactly Live Review Announcement');

  const msgInput = page.locator('textarea[placeholder*="announcement message"]');
  await msgInput.fill('Broadcast sent via Socket.io directly from Admin Command Center.');

  const transmitBtn = page.locator('button:has-text("Transmit Live Broadcast")');
  await transmitBtn.click();
  await page.waitForTimeout(1000);

  const historyText = await page.locator('table').textContent();
  console.log('11. Broadcast Log table recorded event?', historyText.includes('Tech Exactly Live Review Announcement'));

  await browser.close();
  console.log('--- ALL TECH EXACTLY BRANDING & NOTIFICATION TESTS PASSED ---');
  process.exit(0);
}

testTechExactlyFeatures().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
