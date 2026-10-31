# BioSpace — Premium Link-in-Bio SaaS Platform

BioSpace is a modern, production-ready Link-in-Bio SaaS platform built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Clerk Authentication**, and **Recharts**.

Inspired by Linktree and Linear, BioSpace provides creators, influencers, and brands with high-converting, mobile-first public profile pages (`biospace.com/username`), real-time live preview editing, link scheduling, customizable QR codes, privacy-friendly analytics, creator commerce, and a full-featured admin mission control.

---

## 🏗️ Architecture & Domain Models

BioSpace follows a scalable multi-domain architecture matching modern SaaS best practices:

```
           User
 ├── Profile
 ├── Subscription
 ├── Notification
 └── ActivityLog

Profile
 ├── Link
 ├── Collection
 ├── Theme
 ├── QRCode
 ├── SocialAccount
 └── CustomDomain

Analytics
 ├── ProfileView
 ├── LinkClick
 └── DailyStatistics

Admin
 ├── AdminAuditLog
 ├── Report
 ├── ModerationAction
 └── PlatformSettings

Marketplace
 ├── Template
 ├── TemplateCategory
 ├── TemplatePurchase
 └── TemplateReview

Commerce
 ├── Product
 ├── Order
 ├── PaymentEvent
 └── Subscription
```

---

## ⚡ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & custom design system variables
- **Database & ORM**: PostgreSQL & SQLite dual-mode with Prisma ORM 6
- **Authentication**: Clerk Authentication (`@clerk/nextjs`) with server-side RBAC
- **Analytics Visuals**: Recharts (Area charts, Pie charts, Bar charts)
- **Icons**: Lucide React & custom SVG platform icons
- **QR Code Studio**: `qrcode` (High-res 800px PNG and vector SVG exports)
- **Validation**: Zod & React Hook Form
- **Toasts & Feedback**: Sonner & Canvas Confetti

---

## 🚀 Key Features

### 1. Public Marketing Website
- High-converting landing page with hero headline: *"Everything you are, in one link."*
- Interactive phone mockup with real-time template switching presets
- Features showcase, How It Works, Pricing comparison, Testimonials, and FAQ
- Dedicated pages for Features, Templates, Pricing, About, Contact, FAQ, Privacy, and Terms of Service

### 2. Multi-Step Onboarding Flow (`/onboarding`)
- **Step 1**: Welcome greeting and onboarding walkthrough
- **Step 2**: Unique username selection with real-time database availability check
- **Step 3**: Category selection (Creator, Influencer, Developer, Business, Artist, Photographer, Blogger, Other)
- **Step 4**: Avatar selection and biography
- **Step 5**: Quick social link inputs (YouTube, Instagram, Twitter/X, GitHub, Telegram)
- **Step 6**: Design template picker
- **Step 7**: Live interactive phone preview
- **Step 8**: Celebration, confetti, and instant public profile deployment

### 3. User Dashboard & Creator Studio
- **Two-Column Desktop Layout**: Left-side configuration panel + right-side sticky interactive smartphone mockup updating live with zero page reloads
- **Overview (`/dashboard`)**: Total views, unique visitors, total link clicks, CTR, 14-day performance area chart, top-performing links, and quick actions
- **My Bio Page (`/dashboard/bio`)**: Profile avatar, display name, handle, bio, and 10 profile layouts (Classic, Hero, Banner, Cutout, Shape, Minimal, Gradient, Modern, Glass, Creator)
- **Link Management (`/dashboard/links`)**: Unlimited links, reordering (up/down and position indexing), pin-to-top, platform auto-detection (YouTube, TikTok, Instagram, Twitter, GitHub, Spotify, etc.), start/end scheduled dates, and individual click tracking
- **Collections (`/dashboard/collections`)**: Group related links into collapsible sections (e.g. *Featured Channels*, *Products*, *Portfolio*)
- **Appearance Studio (`/dashboard/appearance`)**: Custom gradients, solid colors, button styles (rounded, square, pill, outlined, filled, shadow, glass, neon), typography fonts, color hex pickers, and branding removal switch
- **Template Library (`/dashboard/templates`)**: 20+ distinct templates across 10 categories with one-click instant application preserving all existing creator links
- **Analytics Studio (`/dashboard/analytics`)**: Views and clicks over time, device breakdown, top referrer sources, and country distribution with custom date range filters (Today, 7d, 30d, 90d, All)
- **QR Code Studio (`/dashboard/qr-code`)**: Dynamic QR code generator with live color pickers, downloadable in 800px PNG and scalable vector SVG
- **Account Settings (`/dashboard/settings`)**: Username updater, notification toggles, data export (`.json`), and danger zone account deletion
- **Plan Upgrade (`/dashboard/upgrade`)**: Starter Free vs Creator PRO comparison and Stripe billing integration architecture

### 4. Public Profile Pages (`/[username]`)
- Mobile-first, responsive, and SEO-optimized with dynamic OpenGraph metadata
- Non-blocking privacy-friendly analytics view and click tracking
- Digital product store checkout modal for creator commerce
- Verified creator blue badge support
- Report inappropriate content modal with admin queue integration

### 5. Admin Mission Control (`/admin`)
- Strictly enforced server-side authentication with email allowlist bootstrap (`ADMIN_EMAIL_ALLOWLIST`)
- **Overview**: Global platform KPIs, registrations, active profiles, and system audit logs
- **User Management**: Search, filter by role/tier, view profile stats, suspend/reactivate, ban abusive users, and delete accounts
- **Template Management**: Create, edit, publish/unpublish, delete, and set featured templates
- **Content Moderation**: Review user reports, inspect flagged URLs, resolve or dismiss flags
- **Subscription Intelligence**: View Free vs Pro breakdown, MRR run-rate estimates, and Stripe customer mappings
- **Platform Settings**: Sitewide name, description, maintenance mode toggle, registration availability, and announcement banners
- **Audit Logs**: Immutable audit log recording administrative actions, admin email, target resource, and timestamps

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x, 20.x, or 24.x
- npm or pnpm

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Variables Configuration
Copy the provided `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```env
# Database (Default: SQLite for local zero-config testing; switch to PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk Authentication (Get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Admin Bootstrap Allowlist (Comma separated verified administrator emails)
ADMIN_EMAIL_ALLOWLIST="admin@biospace.com,founder@biospace.com"

# Stripe Billing (Optional / Production)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=""
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=""
```

### 3. Database Initialization & Seeding
Push the Prisma schema to create the database tables and seed the initial 20 templates and demo creator profile:
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

BioSpace includes an automated verification test suite checking security, URL sanitization, database CRUD, and subscription gates:
```bash
node scripts/test-suite.js
```

**Verified Test Assertions (25/25 Passing):**
- URL scheme security check (blocking `javascript:`, `data:`, `vbscript:`, allowing `https:`, `mailto:`, `tel:`)
- Username regex and length constraints
- Server-side Admin email allowlist verification
- Database User and Profile relations
- Link CRUD operations (create, update, position index, delete)
- Template catalog integrity (>= 20 templates across 10 categories)
- Privacy-friendly analytics event logging
- Creator digital product commerce models

---

## 🗄️ Switching to PostgreSQL in Production

BioSpace includes both SQLite (local zero-config) and PostgreSQL schemas. To deploy to Supabase, Neon, Railway, or AWS RDS:

1. Update `datasource db` in `prisma/schema.prisma` (or replace with `prisma/schema.postgresql.prisma`):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/biospace?schema=public&sslmode=require"
   ```
3. Run migrations and seed:
   ```bash
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```

---

## 🔐 Security Standards

- **Server-Side Authorization**: Administrative routes under `/admin` and API mutations strictly verify role and email allowlist server-side.
- **URL Sanitization**: Input validation strictly blocks dangerous URI schemes like `javascript:` and base64 `data:` payloads to prevent stored XSS.
- **Ownership Verification**: All link and collection mutations verify profile ownership against the authenticated user ID before executing updates.
- **Immutable Audit Logging**: Administrative updates generate tamper-evident audit records in `AdminAuditLog`.

---

## 📄 License
MIT License. Crafted with precision for creators worldwide.
