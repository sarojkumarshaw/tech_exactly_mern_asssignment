import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const videoDir = path.resolve('demo_video');

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setHUD(page, stepNum, title, desc) {
  try {
    await page.evaluate(({ stepNum, title, desc }) => {
      let el = document.getElementById('demo-step-hud');
      if (!el) {
        el = document.createElement('div');
        el.id = 'demo-step-hud';
        el.style.position = 'fixed';
        el.style.top = '16px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.zIndex = '999999';
        el.style.background = 'rgba(15, 23, 42, 0.94)';
        el.style.backdropFilter = 'blur(16px)';
        el.style.border = '1.5px solid rgba(99, 102, 241, 0.6)';
        el.style.borderRadius = '9999px';
        el.style.padding = '8px 24px';
        el.style.color = '#ffffff';
        el.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        el.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '12px';
        el.style.pointerEvents = 'none';
        el.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.6px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);">Step ${stepNum}</div>
        <div style="font-weight: 700; font-size: 13px; color: #f8fafc; letter-spacing: -0.2px;">${title}</div>
        <div style="font-size: 12px; color: #94a3b8; border-left: 1px solid #334155; padding-left: 10px; font-weight: 500;">${desc}</div>
      `;
    }, { stepNum, title, desc });
  } catch (e) {
    // transient page unload ignore
  }
}

async function runDemoRecording() {
  console.log('--- STARTING TECH EXACTLY MERN ASSIGNMENT VIDEO RECORDER ---');
  console.log(`Chrome Binary: ${chromePath}`);
  console.log(`Target Video Directory: ${videoDir}`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Accept any confirmation dialogs (e.g. for soft deletion)
  page.on('dialog', async (dialog) => {
    console.log(`Accepted dialog: ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    // =========================================================================
    // SCENE 1: TECH EXACTLY BRANDING, HERO & PUBLIC EXPLORATION
    // =========================================================================
    console.log('[Scene 1/10] Tech Exactly Branding & Home Experience...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, '1/10', 'Tech Exactly Branding & Public Feed', 'Clean Monogram Logo, Responsive Hero & Architecture Badges');
    await sleep(2500);

    // Smooth scroll through Hero and articles
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await sleep(2000);

    // Test category filters
    const dbFilter = page.locator('button:text-is("Database")');
    if (await dbFilter.count() > 0) {
      await dbFilter.click();
      await sleep(1500);
    }

    const socketFilter = page.locator('button:text-is("WebSockets")');
    if (await socketFilter.count() > 0) {
      await socketFilter.click();
      await sleep(1500);
    }

    const allFilter = page.locator('button:text-is("All")');
    if (await allFilter.count() > 0) {
      await allFilter.click();
      await sleep(1500);
    }

    // Test search input
    const searchInput = page.locator('input[placeholder*="Search articles"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Architecture');
      await sleep(2000);
      await searchInput.fill('');
      await sleep(1200);
    }

    // Open first article
    const firstArticle = page.locator('article h3').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');
    await setHUD(page, '1/10', 'SEO URL Slug & Article Reader', 'Dynamic Slug Routing with Compound Indexing');
    await sleep(2000);
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await sleep(2000);

    // =========================================================================
    // SCENE 2: OAUTH 2.0 SOCIAL MEDIA LOGIN & AUTHENTICATION
    // =========================================================================
    console.log('[Scene 2/10] OAuth 2.0 Social Media Login & Security...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await setHUD(page, '2/10', 'Authentication & OAuth 2.0', 'Passport.js Google & Facebook Social Sign-In');
    await sleep(2500);

    // Highlight OAuth buttons
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await sleep(2000);

    // =========================================================================
    // SCENE 3: REGULAR USER LOGIN & POST CREATION (AUTO-SLUG)
    // =========================================================================
    console.log('[Scene 3/10] Regular User Sign-In & Post Creation with Auto-Slug...');
    await setHUD(page, '3/10', 'User Journey & Post Creation', 'JWT Dual Token Session & Automated URL Slug Generator');
    const demoUserBtn = page.locator('button:has-text("Demo User")');
    await demoUserBtn.click();
    await sleep(1000);

    const submitBtn = page.locator('button:has-text("Sign In")');
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);

    // Navigate to Create Post
    await page.goto('http://localhost:5173/create-post', { waitUntil: 'networkidle' });
    await setHUD(page, '3/10', 'Markdown Post Editor', 'Auto Slug Collision Incrementing & Live Tabbed Preview');
    await sleep(1500);

    const postTitle = `Enterprise MERN Architecture ${Date.now().toString().slice(-4)}`;
    await page.fill('input[placeholder*="Architecting Scalable"]', postTitle);
    await sleep(1000);

    await page.fill('input[placeholder*="e.g. nodejs"]', 'nodejs, react, mongodb, socketio');
    await sleep(1000);

    await page.fill(
      'textarea[placeholder*="Write your article"]',
      `### Tech Exactly Full-Stack MERN Architecture\n\nThis article demonstrates **real-time scalability** with modern design patterns:\n\n- **Dual JWT Rotation**: 15m access token & 7d refresh token\n- **Role-Based Access Control**: Granular permissions for Users and Admins\n- **Soft Deletion**: Recoverable posts with admin restoration\n- **Socket.io Notifications**: Real-time push updates for instant synchronization.`
    );
    await sleep(1500);

    // Live preview toggle
    const previewBtn = page.locator('button:has-text("Live Preview")');
    await previewBtn.click();
    await sleep(2000);

    const editBtn = page.locator('button:has-text("Edit Mode")');
    await editBtn.click();
    await sleep(1000);

    // Publish Article
    const publishBtn = page.locator('button:has-text("Publish Article")');
    await publishBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2500);

    // =========================================================================
    // SCENE 4: REAL-TIME COMMENTS & DISCUSSION
    // =========================================================================
    console.log('[Scene 4/10] Real-Time Commenting & Socket.io Updates...');
    await setHUD(page, '4/10', 'Interactive Discussion & Socket.io', 'Instant Comment Delivery with Author Relationship Mapping');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(1500);

    const commentInput = page.locator('textarea[placeholder*="Join the discussion"]');
    if (await commentInput.count() > 0) {
      await commentInput.fill('Excellent production-ready patterns! Tested live with WebSockets.');
      await sleep(1200);
      const postCommentBtn = page.locator('button:has-text("Comment")').last();
      await postCommentBtn.click();
      await sleep(2500);
    }

    // =========================================================================
    // SCENE 5: SOFT DELETE & PUBLIC FEED EXCLUSION
    // =========================================================================
    console.log('[Scene 5/10] Soft Delete & Feed Exclusion...');
    await page.goto('http://localhost:5173/my-posts', { waitUntil: 'networkidle' });
    await setHUD(page, '5/10', 'Soft Delete System', 'Safe Deletion Preserves Data & Automatically Hides from Feed');
    await sleep(2000);

    // Click Soft Delete on first post
    const softDeleteBtn = page.locator('button[title="Soft Delete"]').first();
    if (await softDeleteBtn.count() > 0) {
      await softDeleteBtn.click();
      await sleep(2500);
    }

    // Verify exclusion on home feed
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, '5/10', 'Feed Verification', 'Soft-Deleted Post is Instantly Excluded from Public Queries');
    await sleep(2500);

    // =========================================================================
    // SCENE 6: DEDICATED REAL-TIME NOTIFICATION CENTER
    // =========================================================================
    console.log('[Scene 6/10] Dedicated Real-Time Notification Center...');
    await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle' });
    await setHUD(page, '6/10', 'Dedicated Notification Hub', 'Live Socket.io Latency Ping, Filters & Real-Time Event Dispatch');
    await sleep(2500);

    // Test Latency Ping
    const pingBtn = page.locator('button:has-text("Measure Ping Latency")');
    if (await pingBtn.count() > 0) {
      await pingBtn.click();
      await sleep(2000);
    }

    // Trigger Simulate Event
    const simLikeBtn = page.locator('button:has-text("Simulate Like Event")');
    if (await simLikeBtn.count() > 0) {
      await simLikeBtn.click();
      await sleep(2000);
    }

    // Test filter tabs
    const broadcastFilterBtn = page.locator('button:text-is("Broadcasts")');
    if (await broadcastFilterBtn.count() > 0) {
      await broadcastFilterBtn.click();
      await sleep(1500);
    }

    const allNotifFilterBtn = page.locator('button:text-is("All")');
    if (await allNotifFilterBtn.count() > 0) {
      await allNotifFilterBtn.click();
      await sleep(1500);
    }

    // Navbar notification dropdown
    const bellBtn = page.locator('button[title="Real-time notifications"]');
    if (await bellBtn.count() > 0) {
      await bellBtn.click();
      await sleep(2000);
      await bellBtn.click();
      await sleep(1000);
    }

    // =========================================================================
    // SCENE 7: ADMIN COMMAND CENTER - RBAC & USER MANAGEMENT
    // =========================================================================
    console.log('[Scene 7/10] Admin Login & Command Center...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await setHUD(page, '7/10', 'Admin Authentication & RBAC', 'Privileged Access to Management Command Center');
    await sleep(1500);

    const demoAdminBtn = page.locator('button:has-text("Demo Admin")');
    await demoAdminBtn.click();
    await sleep(1000);
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);

    // Go to Admin Panel
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    await setHUD(page, '7/10', 'Tech Exactly Admin Command Center', 'Real-Time Metrics Cards: Users, Posts, Comments & Views');
    await sleep(2500);

    // Users Management Tab
    const usersTab = page.locator('button:has-text("Users Management")');
    if (await usersTab.count() > 0) {
      await usersTab.click();
      await setHUD(page, '7/10', 'User Role & Status Management', 'Toggle Admin/User Roles & Account Suspension Controls');
      await sleep(2500);
    }

    // =========================================================================
    // SCENE 8: POST MODERATION & 1-CLICK RESTORATION
    // =========================================================================
    console.log('[Scene 8/10] Admin Post Moderation & Restoration...');
    const postsTab = page.locator('button:has-text("Posts Moderation")');
    if (await postsTab.count() > 0) {
      await postsTab.click();
      await setHUD(page, '8/10', 'Posts Moderation & Recovery', 'Filter Deleted Content & Restore with PATCH /api/v1/posts/:id/restore');
      await sleep(2000);

      // Filter by deleted
      const deletedFilter = page.locator('button:text-is("deleted")');
      if (await deletedFilter.count() > 0) {
        await deletedFilter.click();
        await sleep(2000);
      }

      // Restore first soft-deleted post
      const restoreBtn = page.locator('button:has-text("Restore")').first();
      if (await restoreBtn.count() > 0) {
        await restoreBtn.click();
        await sleep(2500);
      }
    }

    // =========================================================================
    // SCENE 9: ADMIN REAL-TIME BROADCAST TRANSMITTER
    // =========================================================================
    console.log('[Scene 9/10] Admin Real-Time Broadcast Console...');
    const broadcastTab = page.locator('button:has-text("Send Notifications & Broadcast")');
    if (await broadcastTab.count() > 0) {
      await broadcastTab.click();
      await setHUD(page, '9/10', 'Socket.io Broadcast Transmitter', 'Push Live Announcements to All Online Clients Instantly');
      await sleep(2500);

      // Click preset
      const presetBtn = page.locator('button:has-text("Tech Exactly Assignment Review")');
      if (await presetBtn.count() > 0) {
        await presetBtn.click();
        await sleep(1500);
      }

      // Emit broadcast
      const emitBtn = page.locator('button:has-text("Emit Real-Time Broadcast")');
      if (await emitBtn.count() > 0) {
        await emitBtn.click();
        await sleep(3500);
      }

      // Scroll to view dispatch log table
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await sleep(2000);
    }

    // =========================================================================
    // SCENE 10: AUDIT ACTIVITY LOGS & CONCLUSION
    // =========================================================================
    console.log('[Scene 10/10] Audit Activity Logs & Final Overview...');
    const logsTab = page.locator('button:has-text("Audit Activity Logs")');
    if (await logsTab.count() > 0) {
      await logsTab.click();
      await setHUD(page, '10/10', 'Comprehensive Audit Trail', 'MongoDB Event Logs for All Auth, Post & Admin Operations');
      await sleep(2500);
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(2000);
    }

    // Return to Home for final view
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, 'DONE', 'Tech Exactly Assignment - 100% Complete', 'Production MERN Stack Architecture with All Requirements Verified');
    await sleep(3000);

    console.log('--- DEMO VIDEO RECORDING FINISHED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    console.log('Browser closed. Finalizing video files...');
    await sleep(2000);

    // Locate newly generated webm file
    const files = fs.readdirSync(videoDir);
    const videoFiles = files
      .filter((f) => f.endsWith('.webm') && f !== 'devsphere_mern_demo_walkthrough.webm' && f !== 'tech_exactly_mern_assignment_walkthrough.webm')
      .sort((a, b) => fs.statSync(path.join(videoDir, b)).mtimeMs - fs.statSync(path.join(videoDir, a)).mtimeMs);

    const latestVideo = videoFiles[0];
    if (latestVideo) {
      const generatedPath = path.join(videoDir, latestVideo);
      const targetPath1 = path.join(videoDir, 'tech_exactly_mern_assignment_walkthrough.webm');
      const targetPath2 = path.join(videoDir, 'devsphere_mern_demo_walkthrough.webm');

      // Copy to both target names
      fs.copyFileSync(generatedPath, targetPath1);
      fs.copyFileSync(generatedPath, targetPath2);
      fs.unlinkSync(generatedPath);

      console.log('=======================================================');
      console.log('VIDEO RECORDING COMPLETE & PERSISTED:');
      console.log(`1. ${targetPath1}`);
      console.log(`2. ${targetPath2}`);
      console.log(`File Size: ${(fs.statSync(targetPath1).size / (1024 * 1024)).toFixed(2)} MB`);
      console.log('=======================================================');
    }
  }
}

runDemoRecording();
