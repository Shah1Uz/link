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

AI Creator Assistant
 ├── AIUsage
 ├── AIGeneration
 └── AISettings

Audience & Email Marketing (Phase 03)
 ├── Subscriber
 ├── SubscriptionConsent
 ├── EmailVerificationToken
 └── EmailDeliveryLog

Appointment Booking System (Phase 04)
 ├── AppointmentType
 ├── AvailabilityRule
 ├── Booking
 └── BookingNotification
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

### 4. AI Creator Assistant (`/dashboard/ai`)
- **Multi-Provider AI Architecture**: Native Google Gemini (`gemini-2.5-flash`) & OpenAI (`gpt-4o-mini`) integration with resilient retry, token tracking, and creator-tailored neural synthesis fallback.
- **AI Bio Generator**: Generates 3–5 tailored bio variations with profession, interests, tone (*Professional, Playful, Bold, Minimalist, Tech Leader, Energetic*), and multi-lingual output (*English, O'zbekcha, Русский, Español, etc.*). Includes copy, in-place edit, and one-click direct application to profile.
- **AI Headline Generator**: High-impact memorable taglines formatted for creator subheadings and display handles.
- **AI Theme & Design Assistant**: Analyzes creator niche and recommends coordinated backgrounds (color/gradient), button geometries, font pairs, accent colors, and layouts (*Classic, Hero, Banner, Cutout, Shape*) with instant one-click live theme application.
- **AI Link Optimizer**: Grounded in actual link clicks and positions without fabricating analytics data. Suggests high-CTR button titles, action verbs, and clear CTAs with one-click link updating.
- **AI Profile Optimization & Audit**: Computes a 0–100 conversion readiness score, evaluates avatar quality, bio sweet-spot length, link count balance, and generates prioritized fix recommendations.
- **AI Content Enhancer**: Rewrites existing copy for clarity, conversion impact, punchiness, or brevity with side-by-side comparison.
- **AI CTA Generator**: High-converting button action copy for newsletters, stores, bookings, portfolios, courses, and social channels.
- **Strict Server-Side Quotas**: Free tier (10 generations/month) vs Pro tier (200 generations/month) with real-time usage meters and database audit logging.

### 5. Digital Storefront & Creator Shop (`/dashboard/store`)
- **Multi-Type Product Catalog**: Supports 6 distinct product formats:
  - `DIGITAL_DOWNLOAD`: Downloadable files, design templates, software presets, ZIP archives.
  - `EBOOK`: PDF guides, written manuals, and digital blueprints.
  - `COURSE`: Masterclasses, interactive learning modules, and video tutorials.
  - `SERVICE`: 1-on-1 consultations, coaching sessions, and commissioned services.
  - `PHYSICAL`: Tangible goods, apparel, branded merchandise, and shipping.
  - `EXTERNAL`: Affiliate items, partner tools, and external marketplace links.
- **Storefront Management**:
  - Image upload directly from user's device (`/api/upload`) or external URL.
  - Multi-image gallery carousel support.
  - Category tagging (`Development`, `Design`, `Business`, `Productivity`, `Lifestyle`, etc.).
  - Feature on Profile toggle with prominent badge.
  - Publish / Unpublish instant switch.
  - Position drag-and-drop & up/down reordering (`/api/products/reorder`).
- **Public Profile Store**:
  - Responsive product cards with thumbnails, badges, prices, and direct CTA buttons.
  - Category filter pills for smooth catalog exploration.
  - Interactive Product Details & Checkout modal preview with seller verified card.
- **Payment & Checkout Architecture**:
  - Stripe Checkout Session creation (`POST /api/store/checkout`) with line items and customer metadata.
  - Instant fulfillment for $0 free products (immediate receipt and access).
  - Webhook verification (`POST /api/store/webhook`) with raw payload signature checking and **idempotency protection** via `PaymentEvent`.
  - Never marks orders as paid without verified provider webhook.
  - Refund-ready seller tools with ownership authorization (`POST /api/store/orders/refund`).
  - Clear preview notice when Stripe credentials are not yet configured in environment.
- **Configurable Subscription Limits**:
  - `FREE`: Maximum 3 products (9% platform fee).
  - `PRO`: Maximum 25 products (4% platform fee).
  - `BUSINESS`: Unlimited products (0% platform fee).
- **Seller Analytics**:
  - Verified Net Revenue tracking from completed transactions.
  - Real-time product impressions (views) and checkout clicks (CTR).
  - Comprehensive Orders & Transactions ledger.

### 6. Email Marketing & Subscriber Management (`/dashboard/audience`)
- **Public Subscription Forms**: Customizable newsletter block embedded on public profiles with 4 distinct layouts (*Card, Minimal, Inline, Hero*), custom CTA text, description, and success messages.
- **Double Opt-In Email Verification**:
  - Secure 24-hour verification token dispatch (`EmailVerificationToken`).
  - Automated transition from `PENDING` to `ACTIVE` upon confirmation (`GET /api/subscribers/confirm`).
  - Automated welcome email with creator links and verified deliverability.
- **GDPR & CAN-SPAM Compliance**:
  - Immutable consent logging (`SubscriptionConsent`) storing timestamp, consent statement, anonymized IP, and user-agent.
  - RFC-compliant 1-click unsubscribe links (`GET /api/subscribers/unsubscribe`).
  - Right to be forgotten: permanent cascade deletion of subscriber records (`DELETE /api/subscribers/[id]`).
- **Audience Dashboard**:
  - Real-time KPI metrics: Total, Active Verified, Pending Confirmation, Unsubscribed, and New This Month.
  - Directory search and status filtering.
  - One-click CSV Export (`GET /api/subscribers/export`).
  - Resend confirmation email action for pending subscribers.
- **Multi-Provider Email Engine**: Configurable provider architecture supporting Resend API (`RESEND_API_KEY`), SMTP, and development delivery simulation with audit logging in `EmailDeliveryLog`.

### 7. Appointment Booking System (`/dashboard/bookings`)
- **Appointment Types**: Free and paid sessions (Consultations, Coaching, 1-on-1s, Portfolio Reviews, Custom Meetings).
- **Availability Engine**: Weekly recurring schedules with custom working hours and buffer times (5-60 min) to avoid burnout.
- **Timezone Awareness**: Real-time slot calculations supporting international clients across all standard IANA timezones.
- **Double Booking Protection**: Database transactions prevent race conditions and overlapping slot bookings.
- **Client Experience**: Public "Book Now" profile block, dynamic calendar picker, slot selection, and one-click Google Meet/Zoom link provisioning.
- **Lifecycle Management**: Secure token-based cancellation and rescheduling with automated email notification dispatches.
- **Creator Dashboard**: Upcoming appointments schedule, cancellation tracking, and verified booking revenue calculations.

### 8. Custom Domain Management (`/dashboard/domains` — PRO / Business)
- **Domain Connection**: Normalizes FQDNs, strips protocols/paths, and blocks reserved platform hostnames.
- **DNS Setup Instructions**: Generates tailored CNAME instructions (`cname.biospace.com`) or Apex A records (`76.76.21.21`), plus unique `_biospace` TXT ownership challenge tokens.
- **Status Workflow**: Live status badges tracking `PENDING` ➔ `VERIFYING` ➔ `VERIFIED` ➔ `PROVISIONING_SSL` ➔ `ACTIVE` (with error diagnostics and `FAILED` states).
- **Multi-Tenant Edge Routing**: Next.js middleware and dynamic profile resolver map incoming custom domains to the correct creator profile without cross-user leakage.
- **Admin Domain Control**: `/admin/domains` panel for auditing all connected domains, inspecting verification challenges, force-verifying, and instantly suspending abusive domains.

### 9. Public Profile Pages (`/[username]`)
- Mobile-first, responsive, and SEO-optimized with dynamic OpenGraph metadata
- Non-blocking privacy-friendly analytics view and click tracking
- Email newsletter collection block with Double Opt-In
- Digital product store checkout modal for creator commerce
- Book Now appointment scheduling block
- Merch mosaic card & "Links | Shop" interactive pill switcher
- Verified creator blue badge support
- Report inappropriate content modal with admin queue integration

### 10. Admin Mission Control (`/admin`)
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

**Verified Test Assertions (196/196 Passing):**
- URL scheme security check (blocking `javascript:`, `data:`, `vbscript:`, allowing `https:`, `mailto:`, `tel:`)
- Username regex and length constraints
- Server-side Admin email allowlist verification
- Database User and Profile relations
- Link CRUD operations (create, update, position index, delete)
- Template catalog integrity (>= 20 templates across 10 categories)
- Privacy-friendly analytics event logging
- YouTube video embedding & dynamic auto-sliding carousels
- **Phase 01 — AI Creator Assistant**: Zod validations, quota limits, token costs, database persistence, theme recommendations, direct profile bio application
- **Phase 02 — Digital Storefront & Creator Shop**: 6 product types, Stripe Checkout integration, webhook verification & idempotency, order fulfillment & refunds, seller analytics
- **Phase 03 — Email Marketing & Subscriber Management**: Public newsletter blocks, double opt-in verification, GDPR consent logging, 1-click unsubscribe, CSV export, permanent deletion
- **Phase 04 — Appointment Booking System**: Appointment types (consultations, coaching, meetings), weekly availability rules & timezones, real-time slot generation, strict database transaction double booking protection, public "Book Now" profile block, reschedule and cancellation workflows, creator calendar dashboard metrics
- **Phase 05 — Custom Domain Management**: Domain normalization & RFC hostname validation, PRO/Business subscription gating, dynamic CNAME / Apex A instructions, unique TXT challenge token generation (`_biospace`), DNS resolution lifecycle (`PENDING` ➔ `VERIFYING` ➔ `VERIFIED` ➔ `PROVISIONING_SSL` ➔ `ACTIVE`), multi-tenant edge routing, takeover prevention, and admin controls (`/admin/domains`)

---

## 🌐 Custom Domain & Hosting Infrastructure (Vercel & Cloudflare)

BioSpace supports multi-tenant custom domains for PRO and Business creators. To enable automated routing and SSL in production:

### 1. Vercel Configuration
1. In your **Vercel Project Dashboard** ➔ **Settings** ➔ **Domains**:
   - Add your root domain `biospace.com` and wildcard `*.biospace.com`
   - Point your DNS records:
     - `CNAME` for subdomains pointing to `cname.vercel-dns.com` (or platform target `cname.biospace.com`)
     - `A` Record for root apex domains pointing to `76.76.21.21`
2. **Environment Variables on Vercel**:
   ```env
   CUSTOM_DOMAIN_CNAME_TARGET="cname.biospace.com"
   CUSTOM_DOMAIN_A_RECORD="76.76.21.21"
   SIMULATE_DNS_VERIFICATION="false"
   ```

### 2. Creator DNS Configuration
When creators connect their own custom domain (e.g. `links.creator.com` or `creatorbrand.com`):
1. **Subdomains** (`links.creator.com`):
   - Record Type: `CNAME`
   - Host / Name: `links`
   - Value: `cname.biospace.com`
2. **Apex Domains** (`creatorbrand.com`):
   - Record Type: `A`
   - Host / Name: `@`
   - Value: `76.76.21.21`
3. **Domain Ownership Verification**:
   - Record Type: `TXT`
   - Host / Name: `_biospace` (or `_biospace.links`)
   - Value: Generated challenge token (e.g. `biospace-verify-abcdef123456...`)

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
