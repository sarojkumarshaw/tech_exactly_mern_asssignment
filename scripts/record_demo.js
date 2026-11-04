import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const videoDir = path.resolve('demo_video');

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemoRecording() {
  console.log('Starting Automated Video Demo Recorder...');
  console.log(`Using Chrome binary: ${chromePath}`);
  console.log(`Video output directory: ${videoDir}`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true // runs cleanly in background
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  try {
    // 1. Visit Home Page
    console.log('[1/9] Opening Home Page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(2000);

    // Scroll through articles
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(1500);

    // Filter by Database
    console.log('[2/9] Testing Category Filtering & Search...');
    const dbFilter = page.locator('button:text-is("Database")');
    if (await dbFilter.count() > 0) {
      await dbFilter.click();
      await sleep(1500);
    }

    // Filter by All
    const allFilter = page.locator('button:text-is("All")');
    if (await allFilter.count() > 0) {
      await allFilter.click();
      await sleep(1500);
    }

    // Search bar
    const searchInput = page.locator('input[placeholder*="Search articles"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Architecture');
      await sleep(2000);
      await searchInput.fill('');
      await sleep(1500);
    }

    // 2. Open an article
    console.log('[3/9] Opening Article by Slug...');
    const firstArticle = page.locator('article h3').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);

    // Scroll article content
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await sleep(2000);

    // 3. Log In as Regular User
    console.log('[4/9] Logging in as Regular User (Alex)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await sleep(1500);

    // Click quick demo button
    const demoUserBtn = page.locator('button:has-text("Demo User")');
    await demoUserBtn.click();
    await sleep(1000);

    const submitBtn = page.locator('button:has-text("Sign In")');
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2500);

    // 4. Create a New Post
    console.log('[5/9] Creating a New Blog Post with Auto-Slug...');
    await page.goto('http://localhost:5173/create-post', { waitUntil: 'networkidle' });
    await sleep(1500);

    await page.fill('input[placeholder*="Architecting Scalable"]', 'High-Performance Node.js with Event Streams');
    await sleep(1000);

    await page.fill('input[placeholder*="e.g. nodejs"]', 'nodejs, performance, architecture');
    await sleep(800);

    await page.fill('textarea[placeholder*="Write your article"]', `
### High Performance Backend Design

Modern enterprise applications require careful consideration of event-driven backends.

1. **Non-blocking I/O**: Keep the event loop unburdened.
2. **Indexing**: Mongoose compound indexes drastically reduce database query duration.
3. **WebSockets**: Real-time push reduces polling overhead.
    `.trim());
    await sleep(1500);

    // Toggle Preview
    const previewBtn = page.locator('button:has-text("Live Preview")');
    await previewBtn.click();
    await sleep(2000);

    const editBtn = page.locator('button:has-text("Edit Mode")');
    await editBtn.click();
    await sleep(1000);

    // Publish
    const publishBtn = page.locator('button:has-text("Publish Article")');
    await publishBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2500);

    // Leave a comment
    console.log('[6/9] Testing Discussion & Live Commenting...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(1500);

    const commentInput = page.locator('textarea[placeholder*="Join the discussion"]');
    if (await commentInput.count() > 0) {
      await commentInput.fill('Excellent architecture guidelines! Tested with real-time socket events.');
      await sleep(1000);
      const postCommentBtn = page.locator('button:has-text("Comment")').last();
      await postCommentBtn.click();
      await sleep(2500);
    }

    // 5. Test Soft Delete in My Posts
    console.log('[7/9] Testing Soft Delete & Feed Exclusion...');
    await page.goto('http://localhost:5173/my-posts', { waitUntil: 'networkidle' });
    await sleep(2000);

    // Click soft delete on the first article
    page.on('dialog', async (dialog) => {
      console.log(`Accepted dialog: ${dialog.message()}`);
      await dialog.accept();
    });

    const softDeleteBtn = page.locator('button[title="Soft Delete"]').first();
    if (await softDeleteBtn.count() > 0) {
      await softDeleteBtn.click();
      await sleep(2500);
    }

    // 6. Log in as Administrator
    console.log('[8/9] Logging in as Administrator...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await sleep(1500);

    const demoAdminBtn = page.locator('button:has-text("Demo Admin")');
    await demoAdminBtn.click();
    await sleep(1000);
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2500);

    // 7. Admin Dashboard & Sockets
    console.log('[9/9] Navigating to Admin Dashboard & Testing Real-Time Console...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    await sleep(2500);

    // Measure Ping
    const measurePingBtn = page.locator('button:has-text("Measure Ping Latency")');
    if (await measurePingBtn.count() > 0) {
      await measurePingBtn.click();
      await sleep(2000);
    }

    // Broadcast Announcement
    const broadcastBtn = page.locator('button:has-text("Emit Broadcast to All Users")');
    if (await broadcastBtn.count() > 0) {
      await broadcastBtn.click();
      await sleep(3500);
    }

    // Open Socket Studio Inspector Modal
    const socketStudioBtn = page.locator('button:has-text("Open Live Event Inspector")').first();
    if (await socketStudioBtn.count() > 0) {
      await socketStudioBtn.click();
      await sleep(2500);

      const pingModalBtn = page.locator('button:text-is("Measure Ping")');
      if (await pingModalBtn.count() > 0) {
        await pingModalBtn.click();
        await sleep(2000);
      }

      const closeInspectorBtn = page.locator('button:has-text("Close Inspector")');
      if (await closeInspectorBtn.count() > 0) {
        await closeInspectorBtn.click();
        await sleep(1500);
      }
    }

    // Switch to Posts Moderation Tab
    const postsTab = page.locator('button:has-text("Posts Moderation")');
    if (await postsTab.count() > 0) {
      await postsTab.click();
      await sleep(2000);

      // Restore post
      const restoreBtn = page.locator('button:has-text("Restore")').first();
      if (await restoreBtn.count() > 0) {
        await restoreBtn.click();
        await sleep(2500);
      }
    }

    // Switch to Audit Activity Logs tab
    const logsTab = page.locator('button:has-text("Audit Activity Logs")');
    if (await logsTab.count() > 0) {
      await logsTab.click();
      await sleep(3000);
    }

    console.log('Automated walkthrough completed successfully!');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    // Close page and context to finish video
    await page.close();
    await context.close();
    await browser.close();

    console.log('Browser closed. Finalizing video...');
    await sleep(2000);

    // Find and rename video file
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find((f) => f.endsWith('.webm'));
    if (videoFile) {
      const oldPath = path.join(videoDir, videoFile);
      const newPath = path.join(videoDir, 'devsphere_mern_demo_walkthrough.webm');
      if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
      fs.renameSync(oldPath, newPath);
      console.log(`=======================================================`);
      console.log(`Video Recording Saved Successfully:`);
      console.log(`Path: ${newPath}`);
      console.log(`Size: ${(fs.statSync(newPath).size / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`=======================================================`);
    }
  }
}

runDemoRecording();
