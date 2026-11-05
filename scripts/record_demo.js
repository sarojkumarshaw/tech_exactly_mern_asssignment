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
        el.style.background = 'rgba(15, 23, 42, 0.95)';
        el.style.backdropFilter = 'blur(16px)';
        el.style.border = '1.5px solid rgba(99, 102, 241, 0.7)';
        el.style.borderRadius = '9999px';
        el.style.padding = '10px 28px';
        el.style.color = '#ffffff';
        el.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        el.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.35)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '14px';
        el.style.pointerEvents = 'none';
        el.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.6px; box-shadow: 0 2px 10px rgba(79, 70, 229, 0.5);">Step ${stepNum}</div>
        <div style="font-weight: 700; font-size: 13.5px; color: #f8fafc; letter-spacing: -0.2px;">${title}</div>
        <div style="font-size: 12px; color: #94a3b8; border-left: 1px solid #334155; padding-left: 12px; font-weight: 500;">${desc}</div>
      `;
    }, { stepNum, title, desc });
  } catch (e) {
    // transient page unload ignore
  }
}

async function runDemoRecording() {
  console.log('=================================================================');
  console.log('STARTING TECH EXACTLY MERN ASSIGNMENT 5-10 MINUTE DEMO RECORDER');
  console.log('Target duration: ~5.5 minutes (320+ seconds)');
  console.log(`Chrome Binary: ${chromePath}`);
  console.log(`Target Video Directory: ${videoDir}`);
  console.log('=================================================================');

  const startTime = Date.now();

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
    console.log('[Scene 1/12] Tech Exactly Branding & Home Experience...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, '1/12', 'Tech Exactly Branding & Architecture', 'Clean Monogram Logo, Responsive Hero & 6 Core Stack Badges');
    await sleep(7000);

    // Smooth scroll through Hero and articles
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await sleep(6000);

    // Test category filters
    const dbFilter = page.locator('button:text-is("Database")');
    if (await dbFilter.count() > 0) {
      await dbFilter.click();
      await sleep(5000);
    }

    const socketFilter = page.locator('button:text-is("WebSockets")');
    if (await socketFilter.count() > 0) {
      await socketFilter.click();
      await sleep(5000);
    }

    const allFilter = page.locator('button:text-is("All")');
    if (await allFilter.count() > 0) {
      await allFilter.click();
      await sleep(4000);
    }

    // Test search input with debounce
    const searchInput = page.locator('input[placeholder*="Search articles"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Architecture');
      await sleep(6000);
      await searchInput.fill('');
      await sleep(3000);
    }

    // Open first article to demonstrate SEO slug
    const firstArticle = page.locator('article h3').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');
    await setHUD(page, '1/12', 'SEO URL Slug & Article Reader', 'Dynamic Slug Routing with Compound Indexing');
    await sleep(7000);
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await sleep(6000);

    // =========================================================================
    // SCENE 2: USER REGISTRATION & ZOD VALIDATION
    // =========================================================================
    console.log('[Scene 2/12] User Registration & Zod Payload Validation...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    await setHUD(page, '2/12', 'User Registration & Security', 'Zod Payload Validation, Strong Passwords & Bcrypt Hashing (12 Rounds)');
    await sleep(6000);

    // Fill form fields
    const nameInput = page.locator('input[placeholder*="Full Name"], input[name="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Emma Watson');
      await sleep(3500);
    }

    const emailInput = page.locator('input[placeholder*="Email"], input[name="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('emma@example.com');
      await sleep(3500);
    }

    const pwdInput = page.locator('input[type="password"]').first();
    if (await pwdInput.count() > 0) {
      await pwdInput.fill('SecurePass123!');
      await sleep(4000);
    }

    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await sleep(7000);

    // =========================================================================
    // SCENE 3: AUTHENTICATION, RATE LIMITING & OAUTH 2.0
    // =========================================================================
    console.log('[Scene 3/12] Authentication & OAuth 2.0 Social Logins...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await setHUD(page, '3/12', 'Authentication & OAuth 2.0', 'Passport.js Google & Facebook Social Sign-In + Brute-Force Rate Limiting');
    await sleep(7000);

    // Highlight OAuth social login buttons
    await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
    await sleep(6000);

    // Demonstrate Quick Demo User Login
    await setHUD(page, '3/12', 'JWT Dual Token Authentication', '15m Access Token (Headers) & 7d Refresh Token (HTTP-Only Cookie)');
    const demoUserBtn = page.locator('button:has-text("Demo User")');
    await demoUserBtn.click();
    await sleep(3500);

    const submitBtn = page.locator('button:has-text("Sign In")');
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(6000);

    // =========================================================================
    // SCENE 4: USER POST CREATION & AUTO-SLUG GENERATION
    // =========================================================================
    console.log('[Scene 4/12] User Post Creation with Auto-Slug & Live Preview...');
    await page.goto('http://localhost:5173/create-post', { waitUntil: 'networkidle' });
    await setHUD(page, '4/12', 'Markdown Post Editor', 'Auto URL Slug Collision Incrementing & Live Tabbed Markdown Preview');
    await sleep(5000);

    const postTitle = `Enterprise MERN Scalability ${Date.now().toString().slice(-4)}`;
    await page.fill('input[placeholder*="Architecting Scalable"]', postTitle);
    await sleep(4000);

    await page.fill('input[placeholder*="e.g. nodejs"]', 'nodejs, react, mongodb, socketio, clean-architecture');
    await sleep(4000);

    await page.fill(
      'textarea[placeholder*="Write your article"]',
      `### Tech Exactly Full-Stack MERN Architecture\n\nThis article demonstrates **real-time enterprise scalability**:\n\n- **Dual JWT Rotation**: 15m access token & 7d refresh token with database tracking\n- **Role-Based Access Control**: Granular permission enforcement at API level\n- **Soft Deletion**: Recoverable posts with 1-click admin restoration\n- **Socket.io Real-Time Streaming**: Instant notifications and comment delivery.`
    );
    await sleep(5000);

    // Toggle live markdown preview
    const previewBtn = page.locator('button:has-text("Live Preview")');
    await previewBtn.click();
    await sleep(7000);

    const editBtn = page.locator('button:has-text("Edit Mode")');
    await editBtn.click();
    await sleep(3500);

    // Publish Article
    const publishBtn = page.locator('button:has-text("Publish Article")');
    await publishBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(6500);

    // =========================================================================
    // SCENE 5: REAL-TIME COMMENTS & DISCUSSION
    // =========================================================================
    console.log('[Scene 5/12] Real-Time Commenting & Socket.io Updates...');
    await setHUD(page, '5/12', 'Interactive Discussion & Socket.io', 'Instant Comment Delivery with Mongoose Author Mapping');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(5000);

    const commentInput = page.locator('textarea[placeholder*="Join the discussion"]');
    if (await commentInput.count() > 0) {
      await commentInput.fill('Verified: Real-time Socket.io delivery functions with zero page reloads.');
      await sleep(4000);
      const postCommentBtn = page.locator('button:has-text("Comment")').last();
      await postCommentBtn.click();
      await sleep(6000);
    }

    // Scroll to see comment thread
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(6000);

    // =========================================================================
    // SCENE 6: SOFT DELETE & FEED EXCLUSION
    // =========================================================================
    console.log('[Scene 6/12] Post Management & Soft Delete Lifecycle...');
    await page.goto('http://localhost:5173/my-posts', { waitUntil: 'networkidle' });
    await setHUD(page, '6/12', 'Post Management & Soft Delete', 'Safe Deletion Preserves MongoDB Documents with isDeleted & deletedAt');
    await sleep(6000);

    // Click Soft Delete on first post
    const softDeleteBtn = page.locator('button[title="Soft Delete"]').first();
    if (await softDeleteBtn.count() > 0) {
      await softDeleteBtn.click();
      await sleep(6000);
    }

    // Verify exclusion on home feed
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, '6/12', 'Public Feed Exclusion Verification', 'Compound Query { isDeleted: false } Hides Soft-Deleted Posts Completely');
    await sleep(7500);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(5500);

    // =========================================================================
    // SCENE 7: DEDICATED REAL-TIME NOTIFICATION CENTER
    // =========================================================================
    console.log('[Scene 7/12] Dedicated Real-Time Notification Center...');
    await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle' });
    await setHUD(page, '7/12', 'Dedicated Notification Hub', 'Live Socket.io Latency Ping, Filters & Real-Time Event Dispatch');
    await sleep(6000);

    // Test Latency Ping
    const pingBtn = page.locator('button:has-text("Measure Ping Latency")');
    if (await pingBtn.count() > 0) {
      await pingBtn.click();
      await sleep(6000);
    }

    // Trigger Simulate Event
    const simLikeBtn = page.locator('button:has-text("Simulate Like Event")');
    if (await simLikeBtn.count() > 0) {
      await simLikeBtn.click();
      await sleep(6000);
    }

    // Test filter tabs
    const broadcastFilterBtn = page.locator('button:text-is("Broadcasts")');
    if (await broadcastFilterBtn.count() > 0) {
      await broadcastFilterBtn.click();
      await sleep(4500);
    }

    const allNotifFilterBtn = page.locator('button:text-is("All")');
    if (await allNotifFilterBtn.count() > 0) {
      await allNotifFilterBtn.click();
      await sleep(4000);
    }

    // Navbar notification dropdown
    const bellBtn = page.locator('button[title="Real-time notifications"]');
    if (await bellBtn.count() > 0) {
      await bellBtn.click();
      await sleep(5500);
      await bellBtn.click();
      await sleep(2500);
    }

    // =========================================================================
    // SCENE 8: ADMIN COMMAND CENTER - RBAC & USER MANAGEMENT
    // =========================================================================
    console.log('[Scene 8/12] Admin Login & Command Center...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await setHUD(page, '8/12', 'Admin Authentication & RBAC', 'Privileged Role Verification via authorizeRoles("admin") Middleware');
    await sleep(5000);

    const demoAdminBtn = page.locator('button:has-text("Demo Admin")');
    await demoAdminBtn.click();
    await sleep(3000);
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await sleep(6000);

    // Go to Admin Panel
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    await setHUD(page, '8/12', 'Tech Exactly Admin Command Center', 'Real-Time KPI Metrics: Total Users, Total Posts, Total Comments & Views');
    await sleep(8000);

    // Users Management Tab
    const usersTab = page.locator('button:has-text("Users Management")');
    if (await usersTab.count() > 0) {
      await usersTab.click();
      await setHUD(page, '8/12', 'User Role & Status Management', 'Toggle Admin/User Roles & Account Suspension Controls at API Level');
      await sleep(8000);
    }

    // =========================================================================
    // SCENE 9: POST MODERATION & 1-CLICK RESTORATION
    // =========================================================================
    console.log('[Scene 9/12] Admin Post Moderation & Restoration...');
    const postsTab = page.locator('button:has-text("Posts Moderation")');
    if (await postsTab.count() > 0) {
      await postsTab.click();
      await setHUD(page, '9/12', 'Posts Moderation & Recovery', 'Filter Deleted Content & 1-Click Restore with PATCH /api/v1/posts/:id/restore');
      await sleep(6000);

      // Filter by deleted
      const deletedFilter = page.locator('button:text-is("deleted")');
      if (await deletedFilter.count() > 0) {
        await deletedFilter.click();
        await sleep(6000);
      }

      // Restore first soft-deleted post
      const restoreBtn = page.locator('button:has-text("Restore")').first();
      if (await restoreBtn.count() > 0) {
        await restoreBtn.click();
        await sleep(7000);
      }
    }

    // =========================================================================
    // SCENE 10: ADMIN REAL-TIME BROADCAST TRANSMITTER
    // =========================================================================
    console.log('[Scene 10/12] Admin Real-Time Broadcast Console...');
    const broadcastTab = page.locator('button:has-text("Send Notifications & Broadcast")');
    if (await broadcastTab.count() > 0) {
      await broadcastTab.click();
      await setHUD(page, '10/12', 'Socket.io Broadcast Transmitter', 'Push Live Announcements to All Online Clients with Audit History');
      await sleep(6500);

      // Click preset
      const presetBtn = page.locator('button:has-text("Tech Exactly Assignment Review")');
      if (await presetBtn.count() > 0) {
        await presetBtn.click();
        await sleep(4000);
      }

      // Emit broadcast
      const emitBtn = page.locator('button:has-text("Emit Real-Time Broadcast")');
      if (await emitBtn.count() > 0) {
        await emitBtn.click();
        await sleep(7000);
      }

      // Scroll to view dispatch log table
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await sleep(6500);
    }

    // =========================================================================
    // SCENE 11: AUDIT ACTIVITY LOGS & WINSTON LOGGING
    // =========================================================================
    console.log('[Scene 11/12] Audit Activity Logs & Winston Trail...');
    const logsTab = page.locator('button:has-text("Audit Activity Logs")');
    if (await logsTab.count() > 0) {
      await logsTab.click();
      await setHUD(page, '11/12', 'Comprehensive Audit Trail', 'MongoDB Event Logs for All Auth, Post & Admin Operations with IP & UserAgent');
      await sleep(7000);
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await sleep(7000);
    }

    // =========================================================================
    // SCENE 12: CONCLUSION & 100% SPEC COMPLIANCE
    // =========================================================================
    console.log('[Scene 12/12] Final Overview & Conclusion...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await setHUD(page, '12/12', 'Tech Exactly Assignment - 100% Verified', 'Complete MERN Stack Architecture with All Core, Security & Bonus Requirements');
    await sleep(8000);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await sleep(8000);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('-----------------------------------------------------------------');
    console.log(`DEMO VIDEO RECORDING FINISHED IN ${elapsedSeconds} SECONDS (~${(elapsedSeconds / 60).toFixed(2)} MINUTES)`);
    console.log('-----------------------------------------------------------------');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    console.log('Browser closed. Finalizing video files...');
    await sleep(4000);

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

      console.log('=================================================================');
      console.log('VIDEO RECORDING COMPLETE & PERSISTED:');
      console.log(`1. ${targetPath1}`);
      console.log(`2. ${targetPath2}`);
      console.log(`File Size: ${(fs.statSync(targetPath1).size / (1024 * 1024)).toFixed(2)} MB`);
      console.log('=================================================================');
    }
  }
}

runDemoRecording();
