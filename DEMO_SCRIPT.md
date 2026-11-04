# DevSphere MERN Blog - 5-10 Minute Video Demo Script

This script provides a step-by-step walkthrough to record an impressive 5–10 minute video demonstration meeting all criteria specified in the assignment PDF.

---

## Video Outline & Time Allocation

| Section | Target Duration | Key Points to Cover |
| :--- | :--- | :--- |
| **1. Introduction & Overview** | ~1 min | Mention MERN stack, Clean Architecture, RBAC, Soft Deletion, Security, Winston Logging. |
| **2. Public Exploration** | ~1.5 min | Public article feed, category filtering, search debounce, slug routing (`/posts/:slug`). |
| **3. Authentication & RBAC** | ~1.5 min | One-click demo logins, JWT access/refresh token rotation, rate limiting on auth endpoints. |
| **4. Post Management & Soft Delete** | ~2 min | Writing post with auto slug generator, edit post, soft delete & verify exclusion from feed. |
| **5. Real-Time Comments & Sockets** | ~1.5 min | Comment CRUD, real-time live comment push via Socket.io, author notifications. |
| **6. Dedicated Admin Panel** | ~2 min | Admin metrics, User management (Role/Status toggle), Post moderation (Restore post), Audit logs. |
| **7. Code Quality & Test Suite** | ~0.5 min | Service layer separation, Winston error logging, running `npm test` (15 passing tests). |

---

## Step-by-Step Recording Walkthrough

### 1. Introduction (0:00 - 1:00)
- **Screen**: Start with the terminal and browser open side-by-side or full-screen on `http://localhost:5173`.
- **Script**:
  > *"Hello! Today I am presenting DevSphere, a production-grade full-stack MERN blog system. It implements clean architecture with separation of concerns, dual JWT token rotation, role-based access control, soft deletion with admin recovery, Mongoose compound indexing, Winston error logging, and real-time Socket.io notifications."*

---

### 2. Public Article Feed & Slug Routing (1:00 - 2:30)
- **Screen**: Navigate to `http://localhost:5173`.
- **Actions**:
  1. Show the **Hero section** with search bar and category filter pills (`Engineering`, `Database`, `WebSockets`).
  2. Click on a category pill like `Database` to show instant query filtering.
  3. Type into the search input (e.g. `architecture`) to demonstrate the debounced search.
  4. Click on an article card (e.g. *"Mastering Modern MERN Stack Architecture"*).
  5. **Highlight the URL**: Notice the clean, SEO-friendly slug: `/posts/mastering-modern-mern-stack-architecture`.
  6. Point out the author info badge, published date, reading time, and view count incrementing.

---

### 3. Authentication & Security (2:30 - 4:00)
- **Screen**: Click **Log In** in the top navigation.
- **Actions**:
  1. Show the Login form with email, password, and password visibility toggle.
  2. Point out the **Quick Demo Sign-In** buttons (`Demo Admin` and `Demo User`) and the Google/Facebook OAuth buttons.
  3. Click **Demo User** (`alex@example.com`) and click **Sign In**.
  4. Show successful login toast notification.
  5. Open Chrome DevTools (`F12` -> **Application** -> **Local Storage**):
     - Show `accessToken` (15m expiration) and `refreshToken` (7d expiration).
     - Explain that the Axios interceptor automatically catches 401s and issues refresh requests seamlessly without logging the user out.
  6. Mention backend rate-limiting (`authLimiter`) protecting auth endpoints from brute force.

---

### 4. Post Management & Soft Delete (4:00 - 6:00)
- **Screen**: While logged in as `Alex Johnson`:
  1. Click **+ Write Post** in the navbar.
  2. Fill in:
     - **Title**: `Building Resilient Microservices with Express`
     - Notice the **Generated Slug**: `/posts/building-resilient-microservices-with-express`.
     - **Category**: `Engineering`.
     - **Tags**: `microservices, express, resilience`.
     - **Content**: Write a quick markdown paragraph.
  3. Toggle **Live Preview** to showcase the tabbed markdown reader view.
  4. Click **Publish Article**.
  5. Show the published post page and live toast notification.
  6. Now go to **My Posts** from the navbar.
  7. Click **Soft Delete** on the newly created post.
  8. Point out the status badge changing to **Soft Deleted**.
  9. Click **Explore Articles** (Home): Show that the soft-deleted article is **completely excluded** from the public feed!
  10. Return to **My Posts** and click **Restore** to bring it back.

---

### 5. Comments & Real-Time Socket.io Updates (6:00 - 7:30)
- **Screen**: Open an article and scroll to the **Discussion** section.
- **Actions**:
  1. Point out the **Live Real-time** indicator badge.
  2. Leave a comment: *"This architecture pattern saves so much debugging time!"*
  3. Show the immediate comment appearance.
  4. Edit the comment inline to demonstrate comment update.
  5. Open an incognito browser window or second browser:
     - Show that new comments push to all viewers in real-time via Socket.io without page reload.
     - Show that the post author receives a targeted notification toast in the top right.

---

### 6. Dedicated Admin Panel (7:30 - 9:30)
- **Screen**: Log in as **Administrator** (`admin@example.com` / `AdminPassword123!`).
- **Actions**:
  1. Notice the golden **Admin Panel** button in the navbar (hidden for regular users).
  2. Click **Admin Panel** (`/admin`).
  3. **Metrics Cards**:
     - Point out **Total Users**, **Total Posts** (Active vs Soft-deleted), **Total Comments**, and **Soft Deleted counter**.
  4. **User Management Tab**:
     - Show the registered users list.
     - Click **Make Admin** on a user to promote them, then toggle back.
     - Show the **Suspend / Activate** button.
  5. **Post Moderation Tab**:
     - Filter by **Deleted** posts to see the soft-deleted draft post seeded in the DB (`Legacy API Migration Guide`).
     - Click **Restore** to unarchive it live!
     - Show that admins have the exclusive ability to perform a permanent **Hard Delete**.
  6. **Audit Activity Logs Tab**:
     - Show the real-time activity audit stream capturing actions (`USER_LOGIN`, `POST_CREATE`, `POST_SOFT_DELETE`, `POST_RESTORE`, `USER_ROLE_CHANGE`).

---

### 7. Code Quality, Architecture & Jest Tests (9:30 - 10:00)
- **Screen**: Switch to VS Code / Terminal.
- **Actions**:
  1. Briefly show the folder tree:
     - `backend/src/controllers` (thin HTTP layer)
     - `backend/src/services` (reusable business logic)
     - `backend/src/models` (indexes on `slug`, `isDeleted`, text search)
     - `backend/src/middleware` (RBAC, activity logger, centralized error handler)
  2. Open terminal and run:
     ```powershell
     npm.cmd test
     ```
  3. Show all **15 integration tests passing**:
     - `auth.test.js` (5 tests)
     - `post.test.js` (4 tests)
     - `comment.test.js` (2 tests)
     - `rbac.test.js` (4 tests)
  4. End the video with a brief thank you.

