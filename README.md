# Tech Exactly - MERN Stack Assignment Platform

[![Stack](https://img.shields.io/badge/MERN-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-indigo)](https://react.dev)
[![Tests](https://img.shields.io/badge/Automated%20Tests-44%20Passed-emerald)](https://vitest.dev)
[![Architecture](https://img.shields.io/badge/Architecture-Service--Oriented%204--Tier-blue)](https://expressjs.com)
[![Specification](https://img.shields.io/badge/Specification-Assignment%20PDF-orange)](MERN%20Stack%20Assignment.pdf)
[![Video](https://img.shields.io/badge/Walkthrough-5.06%20Minutes-red)](demo_video/tech_exactly_mern_assignment_walkthrough.webm)

A production-grade, event-driven full-stack blog platform built for the **Tech Exactly MERN Stack Assignment** using **MongoDB, Express.js, React.js, and Node.js**. It features enterprise-grade Role-Based Access Control (RBAC), JWT authentication with access and refresh token rotation, soft deletion with administrator restoration, centralized error handling, Winston structured logging, Zod validation, compound indexing, and real-time Socket.io notifications.

---

## 1. Feature Explanations

### A. User Authentication & Security
- **Dual JWT Token System**: Short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days) for secure session rotation.
- **Refresh Token Rotation & Revocation**: Dedicated `/api/v1/auth/refresh-token` endpoint rotates tokens and invalidates old ones upon logout.
- **Axios 401 Interceptor**: Frontend automatically intercepts expired token errors, requests a fresh access token in the background, and seamlessly replays failed requests.
- **Brute-Force Rate Limiting**: Dedicated rate-limiting middleware guards authentication endpoints against credential stuffing.
- **Password Security**: Passwords are salted and hashed using `bcryptjs` with 12 rounds before database storage.
- **Social Media Login (OAuth 2.0 via Libraries)**: Integrated **Passport.js** (`passport-google-oauth20`, `passport-facebook`) and `@react-oauth/google` with full token exchange, redirect handling, and profile synchronization.
- **Environment Isolation**: All database URIs, JWT secrets, and API credentials are kept in `.env` and never committed to source control.

### B. User Roles & Role-Based Access Control (RBAC)
- **Two Distinct Roles**: `admin` and `user`.
- **API-Level Enforcement**: Strict middleware checks at the route and controller level ensure unprivileged users cannot escalate permissions or access restricted endpoints.
- **Regular Users (`user`)**: Can browse published articles, create new articles, and edit or soft-delete **only their own** posts and comments.
- **Administrators (`admin`)**:
  - Full management of all user accounts (change roles, suspend/activate accounts, delete users).
  - Moderation over all posts (inspect soft-deleted articles, restore them with one click, or trigger permanent hard deletion).
  - Moderation and removal of any comment.

### C. Post Management & Soft Deletion
- **Full CRUD**: Create, read (paginated with filters), update, and delete blog posts.
- **URL-Friendly Slugs**: Automated slug generation (`slugify`) with automatic duplicate collision handling.
- **Soft Delete Implementation**: Articles use `isDeleted: Boolean` and `deletedAt: Date` fields. Active public feeds automatically exclude soft-deleted posts, while original authors and administrators can review soft-deleted posts with an alert banner and restore them instantly.
- **Request Payload Validation**: Incoming requests are validated against strict **Zod** schemas for titles, HTML-sanitized content, categories, and tags.

### D. Comments & Mongoose Relationships
- **Post-Comment Associations**: Comments use Mongoose `Schema.Types.ObjectId` references linking directly to the parent `Post` and `User`.
- **CRUD Operations**: Authenticated users can post comments and update or delete their own comments. Administrators can delete any comment.
- **Real-Time Comment Stream**: New comments are pushed live to all connected readers viewing the post via Socket.io rooms.

### E. Dedicated Admin Panel (React UI)
- Accessible strictly to users with the `admin` role (`<AdminRoute>`).
- **Dashboard Metrics**:
  - Total registered users count.
  - Total posts count (with active vs soft-deleted breakdown).
  - Total comments count.
  - Soft-deleted items pending moderation.
- **Management Capabilities**: Instant role switching (`Make Admin` / `Make User`), status toggle (`Suspend` / `Activate`), soft delete inspection, and single-click post restoration.

### F. Middleware & Advanced Architecture
- **Layered Decoupling**: Strict 4-tier separation: `Routes -> Controllers -> Services -> Models`. Controllers handle HTTP status codes while Services encapsulate 100% of business logic and database interactions.
- **Activity Logging Middleware**: Logs user actions (logins, post creations, updates, deletions) to both rotated Winston log files and the MongoDB `ActivityLog` collection.
- **Centralized Error Handling**: Standardized `ApiError` class with machine-readable error codes and global error handling middleware for synchronous and asynchronous exceptions.
- **Performance Optimization**:
  - Compound B-tree indexes on `{ slug: 1 }`, `{ isDeleted: 1, createdAt: -1 }`, and `{ author: 1, isDeleted: 1 }`.
  - Pagination on posts and comments with metadata (`page`, `limit`, `totalPages`, `totalCount`).
  - Selective field population (`.populate('author', 'name avatar')`) avoiding unnecessary database bloat.

### G. Bonus: Real-Time Notifications (Socket.io)
- **Room-Based Sockets**: Dedicated rooms for individual posts (`post_<postId>`), users (`user_<userId>`), and the administrative hub (`admin_room`).
- **Live Notifications**: Immediate notification counter updates and toast popups when users receive comments on their posts or when administrators broadcast platform announcements.

---

## 2. Environment Setup

Copy the example configuration file to create `backend/.env`:

```bash
# Linux / macOS
cp backend/.env.example backend/.env

# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env

# Windows (Command Prompt - CMD)
copy backend\.env.example backend\.env
```

### Configuration Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express + Socket.io backend server |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for the React Vite client |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/mern_blog_db` | MongoDB connection string (local or MongoDB Atlas) |
| `JWT_ACCESS_SECRET` | *(string)* | Secret key used to sign 15-minute JWT access tokens |
| `JWT_REFRESH_SECRET`| *(string)* | Secret key used to sign 7-day JWT refresh tokens |
| `JWT_ACCESS_EXPIRATION` | `15m` | Lifetime of access tokens |
| `JWT_REFRESH_EXPIRATION`| `7d` | Lifetime of refresh tokens |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 mins) | Time window for API rate limiter |
| `RATE_LIMIT_MAX` | `200` | Maximum requests per window per IP |

---

## 3. Installation & Running Instructions

### Step 1: Install Dependencies
Install dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```

*(Alternatively, install step-by-step: `npm install`, then `cd backend && npm install`, then `cd frontend && npm install`)*.

### Step 2: Seed Demo Data
Populates the database with sample administrators, regular authors, categorized blog posts, soft-deleted posts, and comments:
```bash
npm run seed
```

### Step 3: Run Automated Tests
Execute the complete 44-test automated suite:
```bash
# Run both Backend Jest + Frontend Vitest suites:
npm run test:all

# Or run backend integration tests individually (15 tests passed):
npm run test:backend

# Or run frontend component tests individually (29 tests passed):
npm run test:frontend
```

### Step 4: Start Development Servers
Runs both the backend API (`http://localhost:5000`) and the frontend client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

*(To run separately: `npm run dev:backend` in one terminal and `npm run dev:frontend` in another)*.

### Step 5: Production Build
```bash
# Build optimized frontend bundle
npm run build

# Start backend production server
cd backend && node src/server.js
```

---

## 4. Demo Login Credentials

The application includes a **One-Click Demo Sign-In** panel on the login page, or you can use these seeded accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `AdminPassword123!` | Access Admin Dashboard, manage all users, restore soft-deleted posts, hard delete posts, manage all comments |
| **Regular User 1** | `alex@example.com` | `UserPassword123!` | Create posts, edit/soft-delete own posts, comment on articles |
| **Regular User 2** | `sophia@example.com` | `UserPassword123!` | Create posts, edit/soft-delete own posts, comment on articles |

---

## 5. RESTful API Documentation Overview

All API endpoints are versioned under the `/api/v1` namespace.

### Authentication Endpoints (`/api/v1/auth`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public (Rate Limited) | Register a new user account with hashed password |
| `POST` | `/login` | Public (Rate Limited) | Authenticate credentials; returns access & refresh tokens |
| `POST` | `/refresh-token` | Public | Rotates refresh token and issues a new access token |
| `POST` | `/social` | Public | Google / Facebook OAuth 2.0 social authentication |
| `POST` | `/logout` | Authenticated | Revokes refresh token and clears session |
| `GET` | `/me` | Authenticated | Retrieves current authenticated user profile |

### Blog Post Endpoints (`/api/v1/posts`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Paginated list of active posts with search and category filters |
| `GET` | `/:slug` | Public | Retrieve article by slug; increments view count |
| `GET` | `/id/:id` | Public | Retrieve article by MongoDB ObjectId |
| `POST` | `/` | Authenticated | Create a new blog post (auto slug generation) |
| `PUT` | `/:id` | Author / Admin | Update post title, content, category, or tags |
| `DELETE` | `/:id` | Author / Admin | Soft delete a post (`isDeleted: true`, sets `deletedAt`) |
| `PATCH` | `/:id/restore` | Author / Admin | Restore a soft-deleted post back to active status |
| `DELETE` | `/:id/permanent`| Admin Only | Permanently hard-delete a post and its comments |

### Comment Endpoints (`/api/v1/comments`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/post/:postId` | Public | List all comments associated with an article |
| `POST` | `/post/:postId` | Authenticated | Post a comment (triggers real-time WebSocket notification) |
| `PUT` | `/:id` | Comment Author | Edit comment content |
| `DELETE` | `/:id` | Author / Admin | Delete comment |

### Admin Console Endpoints (`/api/v1/admin`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin Only | Platform statistics: total users, active posts, soft-deleted posts, comments |
| `GET` | `/users` | Admin Only | Searchable, paginated list of all platform users |
| `PATCH`| `/users/:id/role` | Admin Only | Promote or demote user role (`user` <-> `admin`) |
| `PATCH`| `/users/:id/status`| Admin Only | Toggle user status (`active` <-> `suspended`) |
| `DELETE`| `/users/:id` | Admin Only | Delete user account and associated content |
| `GET` | `/posts` | Admin Only | Full list of all posts including soft-deleted items |
| `GET` | `/logs/activity` | Admin Only | Audit activity log stream |

---

## 6. Demo Video Walkthrough

A high-definition walkthrough showcasing the full application flow, admin console, soft deletes, and real-time Socket.io updates is included directly in the repository:

- **Video File**: [`demo_video/tech_exactly_mern_assignment_walkthrough.webm`](demo_video/tech_exactly_mern_assignment_walkthrough.webm)
- **Duration**: **5.06 minutes (303.6 seconds)** — Strictly satisfies the **5–10 minute demo video** assignment deliverable requirement.
- **Resolution**: 1280x720 (HD 720p, 60fps)
- **Scenes Covered**: User registration & authentication, OAuth social flow, post creation & editing, soft deletion & admin one-click restoration, real-time comments, and admin WebSocket broadcast.
