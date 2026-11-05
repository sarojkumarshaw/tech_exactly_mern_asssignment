# Tech Exactly MERN Stack Assignment - Video Demo Script & Walkthrough

This document outlines the step-by-step presentation script corresponding to the automated video walkthrough recorded in:
- `demo_video/tech_exactly_mern_assignment_walkthrough.webm` (also mirrored at `demo_video/devsphere_mern_demo_walkthrough.webm`)

The video features on-screen step-by-step HUD badges guiding the evaluator through every single feature required by the assignment specification.

---

## Video Outline & Time Allocation (10 Key Scenes)

| Scene | HUD Badge Title | Key Assignment Requirements Demonstrated |
| :---: | :--- | :--- |
| **Scene 1** | **Tech Exactly Branding & Public Feed** | Monogram logo, custom favicon, header branding, responsive glassmorphic hero, 6 architecture spec badges, category filtering & debounced search. |
| **Scene 2** | **Authentication & OAuth 2.0** | Email/Password login with bcrypt (12 salt rounds), dual JWT token authentication, and **OAuth 2.0 Social Sign-In buttons (Google & Facebook)** via Passport.js. |
| **Scene 3** | **User Journey & Post Creation** | Authenticated user session, post creation with automated URL slug collision incrementing, tags, and live tabbed markdown preview. |
| **Scene 4** | **Interactive Comments & Socket.io** | Discussion thread with relational Mongoose author mapping and live comment synchronization via WebSockets. |
| **Scene 5** | **Soft Delete & Feed Exclusion** | Safe post deletion preserving database records (`isDeleted: true`, `deletedAt`), exclusion from public feed queries. |
| **Scene 6** | **Dedicated Notification Hub** | `/notifications` hub with **Socket.io live latency ping**, filter tabs (All, Unread, Broadcasts), test simulation triggers, and navbar bell with unread badge. |
| **Scene 7** | **Admin Command Center & User Management** | Privileged RBAC access, real-time KPI metrics cards (Users, Posts, Comments, Views), user role toggling (`user` ↔ `admin`), and account suspension. |
| **Scene 8** | **Posts Moderation & Recovery** | Filtering deleted posts and 1-click restoration via `PATCH /api/v1/posts/:id/restore`. |
| **Scene 9** | **Socket.io Broadcast Transmitter** | Dedicated Admin broadcast composer to push real-time WebSocket announcements to all active users with dispatch history logging. |
| **Scene 10** | **Audit Activity Logs & Security Trail** | Centralized activity tracking logging all authentication, CRUD, and moderation actions to MongoDB. |

---

## Detailed Step-by-Step Evaluator Script

### Scene 1: Tech Exactly Branding & Public Article Feed
- **Visuals**: Browser opens to `http://localhost:5173`.
- **Narration**:
  > *"Welcome to the Tech Exactly Full-Stack MERN Blog Platform assessment demo. The application features a custom Tech Exactly precision monogram logo, full responsiveness, and an architectural hero banner highlighting our core stack: Dual JWT rotation, Passport.js OAuth 2.0, Role-Based Access Control, Soft Deletion, Winston centralized logging, and Socket.io real-time streaming."*
- **Actions Observed**:
  1. Instant category pill filtering (`Database`, `WebSockets`, `All`).
  2. Live debounced search across indexed fields.
  3. Clicking into an article to demonstrate clean, SEO-optimized URL slug routing (`/posts/:slug`) backed by compound MongoDB indexes.

---

### Scene 2: Authentication & OAuth 2.0 Social Logins
- **Visuals**: Navigates to `http://localhost:5173/login`.
- **Narration**:
  > *"Authentication is hardened with 12 salt rounds of bcrypt password hashing, 20 requests per 15-minute rate limiting, and dual JWT tokens (15-minute access token in memory/headers and 7-day refresh token in HTTP-only cookies). Below the credentials form, we integrate official OAuth 2.0 Social Sign-In for Google and Facebook via standard passport libraries."*
- **Actions Observed**:
  1. Highlight of Google and Facebook OAuth buttons wired to backend passport routes.
  2. Quick demo one-click credentials for evaluators.

---

### Scene 3: Regular User Journey & Post Creation (Auto-Slug)
- **Visuals**: Signs in as Demo User (`alex@example.com`), navigates to `http://localhost:5173/create-post`.
- **Narration**:
  > *"Once authenticated as a standard user, the client receives their JWT session. Navigating to the post editor, our backend automatically generates a URL slug from the title, intelligently incrementing suffixes if collisions occur. Authors can assign categories, comma-separated tags, and toggle the tabbed live markdown preview before publishing."*
- **Actions Observed**:
  1. Auto-slug creation as title is entered.
  2. Live markdown preview toggle.
  3. Publishing article and redirecting with instant success feedback.

---

### Scene 4: Comments System with Socket.io
- **Visuals**: Viewing published article, scrolling to the Discussion section.
- **Narration**:
  > *"Comments maintain normalized Mongoose relationships to posts and authors. New comments are pushed immediately to all connected clients through Socket.io without requiring a page reload."*
- **Actions Observed**:
  1. Submitting a new comment.
  2. Instant appearance in the discussion feed.

---

### Scene 5: Soft Delete & Feed Exclusion
- **Visuals**: Navigates to `http://localhost:5173/my-posts`.
- **Narration**:
  > *"Per the specification, delete operations execute a soft delete. The document remains in MongoDB with `isDeleted: true` and `deletedAt` timestamped. When we navigate back to the public Explore feed, compound indexes ensure the soft-deleted article is completely excluded from public queries."*
- **Actions Observed**:
  1. Clicking Soft Delete button on the article.
  2. Checking Home page feed to confirm immediate exclusion.

---

### Scene 6: Dedicated Real-Time Notification Center (`/notifications`)
- **Visuals**: Navigates to `http://localhost:5173/notifications`.
- **Narration**:
  > *"Our bonus real-time notification system includes a dedicated Notification Hub. Evaluators can measure live Socket.io latency with a single click, filter notifications by category (All, Unread, Broadcasts), and trigger simulation events to observe real-time toast alerts and navbar unread counter increments."*
- **Actions Observed**:
  1. "Measure Ping Latency" button clicked (live 2–5ms ping displayed).
  2. "Simulate Like Event" button clicked (live notification received).
  3. Navbar bell clicked showing dropdown with unread badge counter.

---

### Scene 7: Tech Exactly Admin Command Center & RBAC
- **Visuals**: Signs in as Administrator (`admin@example.com`), navigates to `http://localhost:5173/admin`.
- **Narration**:
  > *"Only users with the `admin` role can access the golden Admin Panel. The dashboard presents real-time KPI metrics for total users, posts, comments, and views. Under Users Management, administrators can toggle user roles between 'user' and 'admin', or suspend/activate user accounts."*
- **Actions Observed**:
  1. Admin dashboard overview with 4 KPI summary cards.
  2. Switching to "Users Management" tab showing registered accounts and role toggles.

---

### Scene 8: Post Moderation & 1-Click Restoration
- **Visuals**: Switches to "Posts Moderation" tab in the Admin Panel.
- **Narration**:
  > *"Administrators have full moderation rights over all posts. Admins can filter posts by status (Active, Deleted, All). Clicking 'Restore' triggers `PATCH /api/v1/posts/:id/restore`, bringing soft-deleted content back into the active public feed."*
- **Actions Observed**:
  1. Filtering by "deleted" posts to locate the soft-deleted article.
  2. Clicking "Restore" to reactivate the post immediately.

---

### Scene 9: Admin Real-Time Broadcast Transmitter
- **Visuals**: Switches to "Send Notifications & Broadcast" tab.
- **Narration**:
  > *"The admin notification console allows administrators to broadcast platform-wide announcements. Admins can select event categories (Announcement, Alert, Maintenance), choose preset templates, and transmit the broadcast to all connected WebSocket clients in real time, with full dispatch logging."*
- **Actions Observed**:
  1. Selecting the preset: 'Tech Exactly Assignment Review'.
  2. Clicking "Emit Real-Time Broadcast".
  3. Green broadcast toast pops up across the client, and the broadcast log records the event.

---

### Scene 10: Audit Activity Logs & Security Trail
- **Visuals**: Switches to "Audit Activity Logs" tab, returns to Home page.
- **Narration**:
  > *"Every critical action—user logins, post creations, comments, restorations, and admin broadcasts—is logged to MongoDB with IP address, user agent, HTTP method, and timestamp for a complete enterprise audit trail. This completes the full-stack MERN specification."*
- **Actions Observed**:
  1. Scrolling through the live audit log feed.
  2. Returning to the branded Home page for the conclusion.

---

## Video File Locations

- **Primary Walkthrough**: [`demo_video/tech_exactly_mern_assignment_walkthrough.webm`](file:///d:/nodereact/mern_assignment/demo_video/tech_exactly_mern_assignment_walkthrough.webm)
- **Mirror Walkthrough**: [`demo_video/devsphere_mern_demo_walkthrough.webm`](file:///d:/nodereact/mern_assignment/demo_video/devsphere_mern_demo_walkthrough.webm)
- **Video Resolution**: 1280x720 (HD 720p, 60fps)
- **File Size**: ~14.08 MB
- **Player Compatibility**: Plays natively in Google Chrome, Microsoft Edge, Firefox, or VLC Media Player.
