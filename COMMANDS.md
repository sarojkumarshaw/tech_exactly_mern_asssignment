# Tech Exactly MERN Stack Assignment - Setup & Command Guide

This document contains all shell commands and step-by-step procedures required to scaffold, configure, install, seed, test, and run the Tech Exactly MERN stack assignment project from scratch.

---

## 1. Prerequisites Check

Before starting, ensure that **Node.js** (v18+) and **MongoDB** (v6+) are installed and running on your system.

```powershell
# Check Node.js and NPM versions
node -v
npm.cmd -v

# Check MongoDB service status on Windows
Get-Service -Name *mongo*

# If MongoDB service is stopped, start it
Start-Service MongoDB
```

---

## 2. Directory Scaffolding

To recreate the folder architecture from scratch:

```powershell
# Create project root directory
mkdir mern_assignment
cd mern_assignment

# Scaffold Backend directory structure
mkdir -p backend/src/config
mkdir -p backend/src/controllers
mkdir -p backend/src/services
mkdir -p backend/src/models
mkdir -p backend/src/routes
mkdir -p backend/src/middleware
mkdir -p backend/src/validations
mkdir -p backend/src/utils
mkdir -p backend/src/sockets
mkdir -p backend/src/seeds
mkdir -p backend/src/logs
mkdir -p backend/tests

# Scaffold Frontend directory structure
mkdir -p frontend/src/components
mkdir -p frontend/src/context
mkdir -p frontend/src/pages
mkdir -p frontend/src/services
mkdir -p frontend/src/routes
mkdir -p frontend/public
```

---

## 3. Dependency Installation

### A. Root Workspace Dependencies
```powershell
# In project root (mern_assignment)
npm.cmd install concurrently --save-dev
```

### B. Backend Dependencies
```powershell
cd backend

# Production dependencies (including Passport.js and OAuth 2.0 SDKs)
npm.cmd install express mongoose dotenv cors helmet express-rate-limit bcryptjs jsonwebtoken zod winston winston-daily-rotate-file morgan uuid socket.io slugify sanitize-html cookie-parser nodemailer passport passport-google-oauth20 passport-facebook google-auth-library

# Development & Testing dependencies
npm.cmd install nodemon jest supertest cross-env --save-dev

cd ..
```

### C. Frontend Dependencies (Vite + React + Tailwind + React OAuth)
```powershell
cd frontend

# Production dependencies
npm.cmd install react react-dom react-router-dom axios lucide-react socket.io-client @react-oauth/google

# Development & Styling dependencies
npm.cmd install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer

cd ..
```

---

## 4. Environment Configuration

Create the `.env` file in `backend/.env`:

```powershell
# In backend directory:
# Copy example configuration
Copy-Item .env.example .env
```

Contents of `backend/.env`:
```env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/mern_blog_db

# Security & JWT Tokens
JWT_ACCESS_SECRET=access_secret_super_secure_key_123456789!
JWT_REFRESH_SECRET=refresh_secret_super_secure_key_987654321!
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_MAX=20

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_DB=true

# OAuth 2.0 Credentials (Passport.js & Google Auth Library)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback
```

---

## 5. Database Seeding

Populate the database with sample administrators, test users, rich blog articles, soft-deleted posts, and comments:

```powershell
# From project root:
npm.cmd run seed

# OR directly inside the backend folder:
cd backend
node src/seeds/seed.js
```

### Default Seed Credentials:
- **Administrator**: `admin@example.com` / `AdminPassword123!`
- **Regular User 1**: `alex@example.com` / `UserPassword123!`
- **Regular User 2**: `sophia@example.com` / `UserPassword123!`

---

## 6. Running Integration Tests (Jest)

Execute the 15-test integration suite covering Auth, Posts CRUD, Soft Deletion, Comments, and RBAC:

```powershell
# From project root:
npm.cmd test

# OR inside the backend folder:
cd backend
npm.cmd test
```

---

## 7. Running Development Servers

### Option A: Run Both Together (Recommended)
From project root:
```powershell
npm.cmd run dev
```

### Option B: Run in Separate Terminals

**Terminal 1 (Backend API):**
```powershell
cd backend
npm.cmd run dev
# Backend runs at: http://localhost:5000
# API Health: http://localhost:5000/api/v1/health
```

**Terminal 2 (Frontend Client):**
```powershell
cd frontend
npm.cmd run dev
# Frontend runs at: http://localhost:5173
```

---

## 8. Building for Production

```powershell
# Build frontend bundle
cd frontend
npm.cmd run build

# Start backend in production
cd ../backend
$env:NODE_ENV="production"; node src/server.js
```

---

## 9. Verifying OAuth 2.0 Social Media Login

To test the complete automated OAuth 2.0 library flow in headless Chrome:

```powershell
# In project root:
node scripts/test_oauth_flow.js
```

This automated suite tests:
1. Google OAuth 2.0 initiation via `/api/v1/auth/google`.
2. Token exchange and callback redirection to `/oauth-callback`.
3. React session initialization and navbar profile synchronization.
4. Clean user logout.
5. Facebook OAuth 2.0 initiation via `/api/v1/auth/facebook`.
6. Profile verification and session termination.

---

## 10. Verifying Real-Time Notifications & Admin Broadcasts

To test the Tech Exactly branding, Notification Center (`/notifications`), and Admin WebSocket broadcasting:

```powershell
# In project root:
node scripts/test_techexactly_features.js
```

This automated suite tests:
1. Tech Exactly branding, title ("Tech Exactly - MERN Stack Assignment"), and custom SVG logo.
2. Direct navigation to the Notification Center (`/notifications`).
3. Real-time Socket.io latency verification and event subscription.
4. Admin authentication and navigation to the **"Send Notifications & Broadcast"** tab.
5. Emitting global announcements via WebSockets and logging to the dispatch history.

