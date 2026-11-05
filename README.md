# Tech Exactly - MERN Stack Assignment Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com)
[![Tests Coverage](https://img.shields.io/badge/Jest%20Tests-15%20Passed-blue)](https://jestjs.io)
[![Stack](https://img.shields.io/badge/MERN-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-indigo)](https://react.dev)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%26%20Modular-violet)](https://expressjs.com)

**Tech Exactly Assignment Platform** is a high-performance, modular full-stack blog platform built with MongoDB, Express.js, React.js, and Node.js. It features **Role-Based Access Control (RBAC)**, **dual JWT access and refresh token authentication**, **soft deletion with admin recovery**, **database-backed activity logging & Winston error logging**, **centralized error handling**, **Zod request validation**, **MongoDB query indexing and pagination**, and **real-time Socket.io notifications & admin broadcast controls**.

---

## Architecture Overview

The system follows Clean Architecture principles with strict separation of concerns:

```
[ React 18 Frontend + Vite + Tailwind CSS ]
                    │
                    ▼  (REST API + Socket.io)
[ Security & Middleware Layer ]
   ├── Helmet & CORS Whitelisting
   ├── Global & Auth Rate Limiting (express-rate-limit)
   ├── Unique Request ID Tracking (UUIDv4)
   ├── Bearer JWT Access & Refresh Token Validation
   ├── Role-Based Access Control (RBAC: Admin vs Regular User)
   ├── Reusable User Activity Logger (Winston + MongoDB ActivityLog)
   └── Centralized Error Handling & DB Error Logger
                    │
                    ▼
[ Controllers Layer ]  (Express Request Parsing & ApiResponse Serialization)
                    │
                    ▼
[ Service Layer ]      (Business Logic, Domain Validation, Slug Generation, Socket Broadcasts)
                    │
                    ▼
[ Mongoose Models / ODM ]  (Compound Indexes, Virtuals, Pre-hooks)
                    │
                    ▼
[ MongoDB Database ]
```

---

## Key Features & Assignment Compliance

### 1. User Authentication & Security
- **JWT Dual-Token Mechanism**: Issues short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days) for secure session rotation.
- **Refresh Token Rotation**: Dedicated `/api/v1/auth/refresh-token` endpoint with database tracking and revocation upon logout.
- **Brute-Force Rate Limiting**: Dedicated `authLimiter` middleware guards login and registration against credential stuffing.
- **Bcrypt Hashing**: Passwords salted and hashed with 12 rounds before persisting.
- **Social Login Support (OAuth 2.0 via Libraries)**: Implemented using industry-standard libraries: **Passport.js** (`passport-google-oauth20`, `passport-facebook`), **Google Auth Library** (`google-auth-library`), and **React OAuth** (`@react-oauth/google`). Features full authorization code exchange, callback redirect handling, token verification, and automated profile syncing.
- **Secure Secret Storage**: All secrets loaded from environment variables (`.env`).

### 2. User Roles & Role-Based Access Control (RBAC)
- **Two User Roles**: `admin` and `user`.
- **API-Level RBAC Enforcement**: Implemented using modular `authorizeRoles('admin')` and `checkPostOwnershipOrAdmin` middlewares.
- **Regular Users**: Can view publications, create posts, and edit/delete **only** their own articles and comments.
- **Administrators**:
  - Full access to manage all users (promote/demote roles, activate/suspend accounts, delete users).
  - Full moderation over all posts (view soft-deleted posts, restore them, or perform permanent hard deletes).
  - Moderation over all comments.

### 3. Post Management & Soft Deletes
- **Full CRUD**: Create, Read, Update, Delete.
- **Automated Slug Generation**: Generates clean, URL-friendly slugs (e.g. `/posts/mastering-modern-mern-stack`) with automatic collision resolution.
- **Soft Delete Implementation**: Uses `isDeleted: Boolean` and `deletedAt: Date`.
  - Normal users and public queries only return active posts (`isDeleted: false`).
  - Administrators and original authors can view their soft-deleted posts with an alert banner and restore them with one click.
  - Permanent hard deletion is available strictly to administrators.
- **Zod Request Validation**: Strict payload validation for titles, content, categories, and tags.

### 4. Comments & Post Associations
- **Full CRUD for Comments**: Users can comment on any active article.
- **Mongoose Reference Relationships**: Comments reference `Post` and `User` using MongoDB ObjectIds, populated with lean selections.
- **Ownership Restrictions**: Regular users can edit and delete only their own comments. Administrators can delete any comment.
- **Real-Time Comment Stream**: When a user leaves a comment, Socket.io pushes it instantaneously to everyone viewing that post.

### 5. Dedicated Admin Panel (React UI)
- Accessible only to users with the `admin` role (`<AdminRoute>`).
- **Dashboard Metric Cards**:
  - Total registered users.
  - Total posts (with active vs soft-deleted breakdown).
  - Total comments.
  - Soft-deleted articles counter.
- **User Management Tab**: Searchable table with instant role switching (`Make Admin` / `Make User`), status toggle (`Suspend` / `Activate`), and user deletion.
- **Post Moderation Tab**: Filter by `All`, `Active`, or `Soft Deleted`. Features quick view, soft delete, one-click restore, and permanent hard delete.
- **Audit Activity Log Tab**: Live stream of user actions across the entire platform.

### 6. Centralized Error Handling & Logging
- **Custom `ApiError` Class**: Standardized operational error class with status codes and machine-readable error codes (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, etc.).
- **Global Error Handler**: Catches all sync and async exceptions, MongoDB CastErrors (invalid ObjectIds), duplicate key errors (E11000), validation failures, and JWT expirations.
- **Winston Daily Rotate**:
  - `logs/error-%DATE%.log`: Rotated error logs with stack traces.
  - `logs/combined-%DATE%.log`: Combined HTTP and server logs.
  - `logs/activity-%DATE%.log`: Audit trail for compliance.
- **MongoDB ErrorLog Collection**: 5xx internal server errors are automatically recorded in MongoDB with request parameters, IP, and stack frames for administrative inspection.

### 7. Performance Optimization
- **Compound Database Indexing**:
  - `{ slug: 1 }` (unique)
  - `{ isDeleted: 1, createdAt: -1 }` (optimized post feed sorting)
  - `{ author: 1, isDeleted: 1 }` (user post filtering)
  - `{ post: 1, createdAt: -1 }` (fast comment retrieval)
  - Text search index on `{ title: 'text', content: 'text' }`
- **Pagination**: Paginated endpoints returning `docs`, `totalDocs`, `totalPages`, `currentPage`, `hasNextPage`, and `hasPrevPage`.
- **Lean Queries**: Uses `.lean()` and targeted field projections (`.select()`) to avoid unnecessary overhead and prevent leaking sensitive password hashes.

### 8. Real-Time Notifications (Socket.io)
- **Room-Based Architecture**:
  - `user_<userId>`: Targeted real-time alerts when someone comments on their post.
  - `post_<postId>`: Live comment stream on open articles.
  - `admin_room`: Instant activity stream for the admin console.
- **Toast Notification System**: Animated bottom-right toasts for publication updates, comment notifications, and system events.

### 9. Comprehensive Testing (Jest + Supertest)
- **15 Integration Tests** verifying:
  - User registration, login, token refresh, duplicate prevention.
  - Post CRUD, slug generation, soft delete exclusion.
  - Comment creation, retrieval, and editing.
  - Role-based authorization restrictions and admin post restoration.

---

## Directory Structure

```
mern_assignment/
├── backend/
│   ├── src/
│   │   ├── config/             # DB, Winston logger, environment variables
│   │   ├── controllers/        # Request handlers & response formatters
│   │   ├── services/           # Core business logic & database queries
│   │   ├── models/             # Mongoose schemas & compound indexes
│   │   ├── routes/             # Express API routers (v1)
│   │   ├── middleware/         # Auth, RBAC, RateLimit, ActivityLogger, ErrorHandler
│   │   ├── validations/        # Zod request validation schemas
│   │   ├── utils/              # ApiError, ApiResponse, Slugify, AsyncHandler
│   │   ├── sockets/            # Socket.io connection & rooms
│   │   ├── seeds/              # Database seeder with demo accounts & posts
│   │   ├── app.js              # Express app setup & middleware pipeline
│   │   └── server.js           # HTTP + Socket.io server entry point
│   ├── tests/                  # Jest + Supertest integration test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, PostCard, CommentSection, ProtectedRoute, etc.
│   │   ├── context/            # AuthContext (JWT state), NotificationContext (Socket.io)
│   │   ├── pages/              # Home, PostDetails, CreatePost, EditPost, MyPosts, AdminDashboard
│   │   ├── services/           # Axios instance with 401 token refresh queue
│   │   ├── routes/             # AppRoutes configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json                # Root concurrent scripts
├── COMMANDS.md                 # Complete setup commands reference
└── README.md
```

---

## Quickstart & Installation Guide

Follow these step-by-step command line instructions to set up, install, seed, test, and run the project locally.

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd mern_assignment
```

### 2. Install Dependencies

You can install all dependencies across root, backend, and frontend with a single command:
```bash
npm run install:all
```

Or install them manually step-by-step:
```bash
# 1. Install root workspace dependencies
npm install

# 2. Install backend dependencies (Express, Mongoose, Passport, Socket.io, Winston, etc.)
cd backend
npm install
cd ..

# 3. Install frontend dependencies (React 18, Vite, Tailwind CSS, Lucide, Vitest, etc.)
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the provided example environment configuration to create `backend/.env`:

**On Linux / macOS:**
```bash
cp backend/.env.example backend/.env
```

**On Windows (PowerShell):**
```powershell
Copy-Item backend/.env.example backend/.env
```

**On Windows (Command Prompt - CMD):**
```cmd
copy backend\.env.example backend\.env
```

Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/mern_blog_db`) or replace `MONGODB_URI` with your MongoDB Atlas connection string:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mern_blog_db
JWT_ACCESS_SECRET=access_secret_super_secure_key_123456789!
JWT_REFRESH_SECRET=refresh_secret_super_secure_key_987654321!
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### 4. Seed the Database
Pre-populates sample administrators (`admin@example.com`), regular users (`alex@example.com`, `sophia@example.com`), categorized articles, soft-deleted posts, and comments:
```bash
npm run seed
```

### 5. Run Automated Tests
```bash
# Run the full automated test suite (Backend Jest + Frontend Vitest - 44 tests total):
npm run test:all

# Run backend integration tests individually (15 tests passed across 4 test suites):
npm run test:backend

# Run frontend component tests individually (29 tests passed across 8 test suites):
npm run test:frontend
```

### 6. Start Development Servers
Runs backend API (`http://localhost:5000`) and frontend client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Alternatively, you can run the backend and frontend in separate terminals:
```bash
# Terminal 1 (Backend API):
cd backend
npm run dev

# Terminal 2 (Frontend Client):
cd frontend
npm run dev
```

### 7. Build for Production
```bash
# Build optimized frontend bundle
cd frontend
npm run build

# Start backend production server
cd ../backend
node src/server.js
```

### 8. Run Automated Verification Scripts
```bash
# Verify OAuth 2.0 Google & Facebook token exchange flows:
node scripts/test_oauth_flow.js

# Verify Tech Exactly branding, Notification Center, and Socket.io broadcasts:
node scripts/test_techexactly_features.js
```

---

## Demo Credentials

You can sign in using the **One-Click Quick Demo Sign-In** buttons on the Login page or with these credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `AdminPassword123!` | Access Admin Dashboard, manage all users, restore soft-deleted posts, hard delete, manage all comments |
| **Regular User** | `alex@example.com` | `UserPassword123!` | Create, edit, and soft-delete own posts and comments |
| **Regular User** | `sophia@example.com` | `UserPassword123!` | Create, edit, and soft-delete own posts and comments |

---

## RESTful API Endpoints Reference

All endpoints are versioned under `/api/v1`.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public (Rate Limited) | Register a new user |
| `POST` | `/login` | Public (Rate Limited) | Authenticate user & return JWT tokens |
| `POST` | `/refresh-token` | Public | Rotate and issue new access & refresh tokens |
| `POST` | `/social` | Public | Google / Facebook OAuth sign-in |
| `POST` | `/logout` | Authenticated | Revoke refresh token & log out |
| `GET` | `/me` | Authenticated | Get current authenticated user profile |

### Blog Posts (`/api/v1/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Paginated list of active posts with search & category filters |
| `GET` | `/:slug` | Public | Get post details by URL slug and increment view counter |
| `GET` | `/id/:id` | Public | Get post by ObjectId |
| `POST` | `/` | Authenticated | Create a new blog post (auto slug generated) |
| `PUT` | `/:id` | Author / Admin | Update post title, content, tags, or category |
| `DELETE` | `/:id` | Author / Admin | Soft delete a post (`isDeleted: true`) |
| `PATCH` | `/:id/restore` | Author / Admin | Restore a soft-deleted post |
| `DELETE` | `/:id/permanent`| Admin Only | Permanently delete post and all associated comments |

### Comments (`/api/v1/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/post/:postId` | Public | List all comments for an article |
| `POST` | `/post/:postId` | Authenticated | Post a comment (triggers real-time notification) |
| `PUT` | `/:id` | Comment Author | Edit comment content |
| `DELETE` | `/:id` | Author / Admin | Delete comment |

### Admin Console (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin Only | Global metrics: users, posts, comments, deleted items |
| `GET` | `/users` | Admin Only | Searchable, paginated user list |
| `PATCH`| `/users/:id/role` | Admin Only | Toggle user role (`user` <-> `admin`) |
| `PATCH`| `/users/:id/status`| Admin Only | Suspend or activate user account |
| `DELETE`| `/users/:id` | Admin Only | Delete user and their associated content |
| `GET` | `/posts` | Admin Only | List all posts including soft-deleted ones |
| `GET` | `/logs/activity` | Admin Only | Full audit log stream of user actions |
| `GET` | `/logs/error` | Admin Only | System error logs |

---

## Evaluation Criteria Mapping

| Evaluation Criteria | Implementation Details |
| :--- | :--- |
| **Code Quality & Best Practices** | Clean ES6+ modules, strict ESLint standards, Zod schema validation, async handlers, structured responses. |
| **Proper Use of MERN Stack** | Express 4, Mongoose 8 ODM with compound indexes, React 18 functional components with Hooks & Context API, Node.js v23. |
| **Clean Architecture & Modularity**| Strict layer decoupling: `Controllers -> Services -> Models`. Independent reusable middlewares for auth, RBAC, logging, rate limiting. |
| **Security & Optimization** | Bcrypt hashing (12 rounds), dual JWT token rotation, Helmet security headers, rate limiting, XSS sanitization, compound indexes, lean queries. |
| **Documentation & Reusability** | Detailed `COMMANDS.md` for replication, thorough `README.md`, pre-configured seeder script, and 15 Jest tests. |

---

## Video Walkthrough & Presentation Script

An automated high-definition walkthrough demonstrating all core features, branding, OAuth 2.0 social logins, real-time notification hub, and admin broadcast controls has been generated:

- **Recorded Video File**: [`demo_video/tech_exactly_mern_assignment_walkthrough.webm`](file:///d:/nodereact/mern_assignment/demo_video/tech_exactly_mern_assignment_walkthrough.webm)
- **Alternate Mirror**: [`demo_video/devsphere_mern_demo_walkthrough.webm`](file:///d:/nodereact/mern_assignment/demo_video/devsphere_mern_demo_walkthrough.webm)
- **Video Duration**: **~6.2 minutes (380 seconds)** — Fully compliant with the **5–10 minute demo video** assignment deliverable requirement.
- **Video Resolution**: 1280x720 (HD 720p, 60fps)
- **Step-by-Step Script**: [`DEMO_SCRIPT.md`](file:///d:/nodereact/mern_assignment/DEMO_SCRIPT.md) (12 scenes with on-screen HUD descriptions)


