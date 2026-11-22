# BioSpace — API & Authentication Security Audit

**Report ID:** 01 · **Area:** API route handlers + auth/security core
**Auditor:** api-auditor · **Date:** 2026-11-08
**Status:** Final (read-only audit; no source files modified)

---

## 0. Scope, method, and key numbers

| Item | Value |
|---|---|
| Files in scope | `src/app/api/**` (57 × `route.ts`), `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/lib/password.ts`, `src/lib/prisma.ts`, `src/lib/utils.ts`, `src/lib/validations.ts` |
| Route files actually present | **57** (task brief estimated ~73; there is no `src/pages/api` and no additional API dir — 57 is the complete count) |
| HTTP handlers | **92** (`GET`/`POST`/`PUT`/`PATCH`/`DELETE` exports) |
| Supporting files read for behaviour | `src/lib/store/payment.ts`, `src/lib/booking/service.ts`, `src/lib/domain/service.ts`, `src/lib/email/service.ts`, `src/lib/ai/{provider,usage,config}.ts`, `src/lib/validations/{ai,booking,domain,product,subscriber}.ts`, `src/app/[username]/page.tsx`, `src/components/profile/public-profile-view.tsx`, `src/components/profile/public-store-section.tsx`, `prisma/schema.prisma`, `prisma/seed.js`, `.env`, `.env.example`, `.gitignore`, `next.config.mjs` |
| Method | Read every route file in full; cross-checked with `grep` for `getAuthenticatedUser`, `verifyAdminSession`, `hasPermission`, `z.object`/`ZodError`, `error.message`, `console.error`, `fetch(`, `jsx href`; verified data-flow for session token, `userId` exposure, and payment/booking state machines. |

Severity legend: **critical** = unauthenticated takeover / full admin / money loss with no preconditions · **high** = privilege or trust boundary broken, exploitable with low effort · **medium** = real weakness requiring specific conditions · **low** = hardening / correctness / hygiene.

### Executive summary

The API surface is broad and large parts of it are well structured (Zod coverage in store/bookings/subscribers/AI, ownership checks in most `[id]` routes, real transactions in booking and domain flows). However, the **authentication core is fundamentally unsound and fail-open**, and three of its flaws chain into unauthenticated account takeover and unauthenticated admin access:

1. `biospace_session` is an **unsigned cookie containing a raw `User.id`**, trusted verbatim (`src/lib/auth.ts:123-133`), while the public profile page serialises `profile.userId` to every visitor (`src/app/[username]/page.tsx:72-88,122-129`). Set a cookie → become any creator. **Critical.**
2. `POST /api/auth/register` grants `ADMIN` to any email on `ADMIN_EMAIL_ALLOWLIST` with **no email verification** (`src/app/api/auth/register/route.ts:50,60`), and the allowlist is committed to git (`.env:22`, tracked despite `.gitignore:26`). `founder@biospace.com` is allowlisted but not seeded → **register it and you are admin**. **Critical.**
3. `getAuthenticatedUser()` ends with a **demo-user fallback** (`src/lib/auth.ts:233-241`): every request without a session silently becomes `alex@creator.dev`. Routes that "check `if (!user)`" therefore never return 401. The middleware additionally bypasses Clerk whenever the cookie exists or Clerk is mis-configured (`src/middleware.ts:62-70`), and the shipped `.env` makes `isLiveClerkKeyConfigured()` return `false` (`src/lib/auth.ts:52-65`, `.env:13`), disabling Clerk entirely.

Additional critical money/trust breaks: the Stripe webhook accepts **unsigned JSON** whenever `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are absent (they are empty in `.env:25-26`), so any anonymous client can mark orders `COMPLETED` (`src/lib/store/payment.ts:227-246,262-312`); and paid digital-product download URLs are returned by a public GET and embedded in the public profile payload (`src/app/api/products/[id]/route.ts:10-29`, `src/app/[username]/page.tsx:83-86,128`).

Counts: **5 critical, 9 high, 16 medium, 13 low** findings. No rate limiting exists anywhere in the codebase (verified by grep).

---

## 1. Authentication & authorization model as implemented

### 1.1 Identity resolution — `getAuthenticatedUser()` (`src/lib/auth.ts:111-248`)

Four identity paths are tried **in order**; the first one that yields a user wins. There is no signed token, no JWT verification, and no expiry check in the custom path.

| # | Path | Code | Verified? | Notes |
|---|---|---|---|---|
| 1 | Cookie `biospace_session` | `src/lib/auth.ts:122-134` | **No** | Value is used directly as `User.id` in `prisma.user.findUnique({where:{id: value}})`. Set by login/register (`auth/login/route.ts:37-43`, `auth/register/route.ts:102-108`) but never signed, never hashed, no server-side session table, no expiry check beyond cookie `maxAge`. |
| 2 | Clerk server SDK | `src/lib/auth.ts:136-175` | Only if `isLiveClerkKeyConfigured()` | Real Clerk `auth()`/`currentUser()`. Upserts the local user by `clerkId`; **promotes to `ADMIN` on every login if the email is allowlisted** (`:151-166`). |
| 3 | Raw `__session` JWT payload | `src/lib/auth.ts:177-231` | **No signature check** | Splits the JWT and `JSON.parse(Buffer.from(parts[1],"base64"))`, then trusts `payload.sub` and `payload.email` (`:182-200`). Any 3-part base64 string with `sub: "user_..."` is accepted. May call a **hard-coded Clerk tenant** `https://live-halibut-6305.clerk.accounts.dev/v1/client` with the cookie (`:78-84`). |
| 4 | Demo-user fallback | `src/lib/auth.ts:233-241` | n/a | `prisma.user.findFirst({where:{email:"alex@creator.dev"}})` is returned **for every unauthenticated request**, in any `NODE_ENV`. |

`verifyAdminSession()` (`src/lib/auth.ts:254-268`) = `getAuthenticatedUser()` + role in `{SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT}` **or** email in allowlist. It does not check `isSuspended`/`isBanned` (banned is only checked on paths 1 and 3), and it collapses four very different roles into "admin".

### 1.2 Middleware — `src/middleware.ts`

- Protected route matcher: `/dashboard`, `/onboarding`, `/admin` (`:19-23`).
- `auth.protect()` errors are **swallowed** (`:27-31`).
- If a `biospace_session` cookie exists, middleware returns `NextResponse.next()` **before Clerk runs** (`:62-64`) — no validation of the cookie at all.
- If Clerk keys are not "live", middleware **allows everything** (`:66-70`): *"allow seamless access so developers and reviewers are not blocked"*.
- Multi-tenant rewrite: any non-platform `Host` rewrites `/` to `/<hostname>` (`:36-59`), with the host list hard-coded.
- The matcher (`:74-78`) *does* include `/api`, but the middleware performs **no authorization** for API routes; all API auth is per-handler.

**Consequence:** in the current configuration (`.env:13` demo Clerk key → detection false) Clerk never runs and `/admin` UI protection rests solely on `src/app/admin/layout.tsx:13-16` calling `verifyAdminSession()`; API protection rests solely on each handler.

### 1.3 Effective posture

- There is exactly **one real credential**: the password hash (scrypt, `src/lib/password.ts`) and the resulting unsigned cookie.
- **There is no email verification, no password reset, no account lockout, and no CSRF token anywhere.** Login (`auth/login/route.ts`) issues the cookie immediately after password compare.
- Admin-ness is derived from `User.role` **and** from `ADMIN_EMAIL_ALLOWLIST`, and the allowlist assignment happens at login, at registration, and on Clerk sync — it is never revoked.

---

## 2. Findings

### 2.1 Critical

#### C-1 — Account takeover of any creator via unsigned `biospace_session` + publicly leaked `userId`
**Evidence**
- `src/lib/auth.ts:122-134` — `const directUserId = cookieStore.get("biospace_session")?.value; ... prisma.user.findUnique({where:{id: directUserId}})`; returns that user with no signature, no HMAC, no session store, no expiry check.
- `src/app/api/auth/login/route.ts:37-43` / `src/app/api/auth/register/route.ts:102-108` — the cookie value **is** `user.id` (`cookieStore.set("biospace_session", user.id, ...)`).
- `src/middleware.ts:62-64` — presence of *any* value for this cookie short-circuits Clerk.
- `src/app/[username]/page.tsx:72-88,122-129` — the public profile page loads the **whole** `Profile` row and passes `profile={profile}` to a client component whose prop is `profile: any` (`src/components/profile/public-profile-view.tsx:27-41`). `Profile.userId` (schema: `prisma/schema.prisma` `model Profile`) is therefore serialised into the RSC payload of every public profile page.

**Impact:** visit `/<any-username>`, read `userId` from the page payload, set cookie `biospace_session=<userId>`, and you are that user on every API route — full read/write of their profile, links, products, orders, subscribers, emails, domains. No password, no email, no second factor. This is the single most dangerous issue in the codebase.
**Fix:** replace the raw id cookie with a signed, expiring, server-verified session (opaque random token stored in `Session` table, or a signed JWT with `jti`), never expose `userId` in public payloads (`select` only public fields), and stop accepting unknown cookies in middleware as proof of anything.

#### C-2 — Unauthenticated admin creation by registering an allowlisted email
**Evidence**
- `src/app/api/auth/register/route.ts:50,54-63` — `const isAdmin = isEmailInAdminAllowlist(cleanEmail);` → `role: isAdmin ? "ADMIN" : "USER"` on `prisma.user.create`.
- `src/lib/auth.ts:43-50` — allowlist is a comma-separated env var; `:159,166` and `:200-215` also grant `ADMIN` at login/Clerk-sync.
- `.env:22` — `ADMIN_EMAIL_ALLOWLIST` contains `admin@biospace.com,founder@biospace.com`; `.env` **is tracked in git** (`.gitignore:26` only ignores `.env*.local`; `git ls-files` shows `.env`).
- `prisma/seed.js:595-616` seeds `admin@biospace.com` but **not** `founder@biospace.com`.
- Registration performs **no email verification** (no token, no email sent) and enforces only `password.length >= 6` (`register:17`).

**Impact:** `POST /api/auth/register {"email":"founder@biospace.com","password":"..."}` → response `role: "ADMIN"`, session cookie set, full admin APIs (`/api/admin/*`) available. The allowlist is public via the repo, and even without the repo the admin address is guessable.
**Fix:** remove role assignment from the registration/login path entirely; grant admin out-of-band (seeded/migrated, or a separate authenticated bootstrap flow with email verification + TOTP). At minimum, require verified email ownership before any allowlist role is applied, and rotate the allowlist.

#### C-3 — Forged Clerk `__session` JWT is trusted (unverified payload parse) → identity/admin forgery
**Evidence**
- `src/lib/auth.ts:177-231` — splits `__session` into 3 parts, `JSON.parse(Buffer.from(parts[1],"base64"))`, then `const clerkId = payload.sub` and `payload.email`; if the clerkId is not in the DB it is **upserted** with `role: isAdmin ? "ADMIN" : "USER"` (`:200-218`) using the unverified email.
- `src/lib/auth.ts:149-175` — the same allowlist→ADMIN promotion exists on the trusted Clerk path.

**Impact:** a client can mint `header.<base64({"sub":"user_eviltwin","email":"founder@biospace.com"})>.sig` — no signature is ever checked — and obtain a persisted account with `ADMIN` role. Even without an allowlisted email, this creates arbitrary identities and bypasses the "user must sign up" boundary.
**Fix:** delete path 3. If a fallback is ever required, verify the JWT with Clerk's JWKS (`jose`/`@clerk/backend` `verifyToken`) including `iss`, `azp`, `exp`; never derive identity or role from an unverified payload.

#### C-4 — Stripe webhook accepts unsigned JSON → anyone can mark orders paid
**Evidence**
- `src/app/api/store/webhook/route.ts:4-11` — no auth, no rate limit, forwards raw body + `stripe-signature` header to `processStripeWebhookEvent`.
- `src/lib/store/payment.ts:227-246` — `if (stripe && webhookSecret) { constructEvent(...) } else { event = JSON.parse(rawBody) }` — **signature verification is skipped whenever either is missing**; failures in the verified branch throw, but the unverified branch succeeds.
- `.env:25-26` — `STRIPE_SECRET_KEY=""`, `STRIPE_WEBHOOK_SECRET=""` → `isStripeConfigured()` false → `stripe === null` → the unverified branch is the **active** path in this checkout.
- `src/lib/store/payment.ts:262-312` — `checkout.session.completed` sets `status: "COMPLETED"`, increments `salesCount`, creates `orderItem`, writes `paymentEvent`, with **no check of `session.payment_status`, `amount_total` vs `order.amount`, currency, or `client_reference_id` ownership**.

**Impact:** `POST /api/store/webhook {"id":"evt_1","type":"checkout.session.completed","data":{"object":{"client_reference_id":"<orderId>","payment_intent":"pi_x","amount_total":0}}}` completes any pending order and inflates sales/revenue dashboards. Order ids are guessable/observable (`ORD-…`, returned by checkout).
**Fix:** fail closed — reject the request with 400 if `STRIPE_WEBHOOK_SECRET`/client are missing; verify `payment_status === "paid"`, `amount_total === round(order.amount*100)`, and currency; deduplicate using the signature-verified event id; keep the unique `stripeEventId` insert and handle `P2002` as success.

#### C-5 — Fail-open demo identity: every unauthenticated request is authenticated as `alex@creator.dev`
**Evidence**
- `src/lib/auth.ts:233-241` — unconditional fallback (`NODE_ENV` not checked; comment says "local development" but the code runs everywhere).
- `prisma/seed.js:609-616` — the demo user exists with `role: "USER"` and a published profile.
- Consequence in handlers: the standard guard `if (!user) return 401` (`links/route.ts:10-11,33`, `collections/route.ts:8-9`, `analytics/route.ts:7-8`, `audience`, `products`, `ai/*`, `qr-code`, `profile`, `theme`, `subscribers`, `bookings`, `domains`, `store/orders`, `templates/apply`, `onboarding`, `upload` …) can never fire.

**Impact:** anonymous users get full read/write of the demo account: create/reorder/delete links, change the profile and theme, upload files, export the demo profile's subscriber list (`subscribers/export`), read its orders and AI history, consume its AI quota, create domains. It also means "protected" routes cannot be distinguished from public ones, and any future promotion of the demo user (or re-pointing of the seed) becomes a silent privilege escalation for everyone. It also defeats ban enforcement: a banned user's cookie returns `null` at `:222` and then falls through to the demo user.
**Fix:** return `null` when no credential is presented; gate any dev bypass behind `process.env.NODE_ENV === "development" && process.env.ALLOW_DEMO_AUTH === "true"` and a non-empty explicit flag; add a single `requireUser()` helper that throws 401.

### 2.2 High

#### H-1 — Paid digital products: download URL exposed publicly (paywall bypass), and "preview checkout" hands out downloads without payment
**Evidence**
- `src/app/api/products/[id]/route.ts:4-34` — **unauthenticated** `GET`; `prisma.product.findUnique` with no `select`, so `fileUrl` (and `externalUrl`, `galleryUrls`) are returned for any enabled product id.
- `src/app/[username]/page.tsx:83-86,110-113,128` — public profile includes `products` (all columns) and passes them to `PublicProfileView` → `public-store-section.tsx:39` (`fileUrl: string | null`) → serialised in the page payload for every visitor.
- `src/lib/store/payment.ts:110-134` — when Stripe is unconfigured, checkout creates a `PENDING` "preview" order and returns `success: true` **with no checkout URL**.
- `src/components/profile/public-store-section.tsx:163-175` — on such a response the UI builds a receipt with `downloadUrl: data.downloadUrl || selectedProduct.fileUrl` and shows the download link (`:530-535`).

**Impact:** in the shipped configuration (no Stripe key) a "purchase" of a paid product yields the file without payment. Even with Stripe configured, the RSC payload and `/api/products/[id]` leak the paid file URL, so the paywall is decorative.
**Fix:** never return `fileUrl`/`externalUrl` from public endpoints or public page payloads; serve downloads via an authenticated, order-scoped endpoint that checks a `COMPLETED` order + product ownership; treat unconfigured Stripe as an error (501), not a success.

#### H-2 — `/api/upload`: no authentication enforced, SVG allowed, MIME trusted from the client
**Evidence**
- `src/app/api/upload/route.ts:18-19` — `const user = await getAuthenticatedUser();` result **unused**, and there is no `if (!user) return 401`; comment says "Allow uploads for authenticated or onboarding users".
- `:6-12` — `image/svg+xml` is in `ALLOWED_MIME_TYPES`; `:29` validates only `file.type` (attacker-controlled form field).
- `:48-56` — filename/extension are generated safely (no traversal), but content is not sniffed.
- `:66-77` — on filesystem failure it returns a base64 `data:` URL, which callers store in the DB.

**Impact:** unauthenticated arbitrary file writes into `public/uploads` (disk abuse, content hosting) and **stored XSS**: an SVG containing `<script>` served same-origin from `/uploads/...svg` executes when a victim navigates to the URL directly (which is how the URL is distributed). MIME spoofing also permits polyglot files.
**Fix:** require an authenticated user (401 otherwise); drop SVG or rasterise it server-side; sniff magic bytes; cap per-user storage/rate; store uploads outside `public/` and serve via a route with `Content-Type`/`Content-Disposition` and `X-Content-Type-Options: nosniff`.

#### H-3 — Admin authorization is one coarse gate; any MODERATOR/SUPPORT can promote themselves to SUPER_ADMIN and ban/delete admins
**Evidence**
- `src/lib/auth.ts:254-268` — `verifyAdminSession` accepts `MODERATOR` and `SUPPORT` as "admin".
- `src/app/api/admin/users/route.ts:50-89` — `PATCH` requires only `verifyAdminSession()`, then `const { userId, role, isSuspended, isBanned, subscriptionTier } = body;` and `if (role !== undefined) updateData.role = role;` — **no `hasPermission(user, "users:write")` check, no role enum validation, no protection of other admins, no "cannot escalate above your own role" rule**. `GET` (`:5-48`) returns every user's email/role/tier with no pagination.
- `:92-121` — `DELETE` requires only `verifyAdminSession()`; only self-deletion is blocked, so any MODERATOR can delete any other user/admin.
- Contrast the *correct* pattern in `src/app/api/admin/feature-flags/route.ts:8-11,61-63` and `admin/marketplace:9,58`, `admin/support:9,88` which do call `userHasPermission`.

**Impact:** a SUPPORT (or compromised support account, or the C-2 self-registered ADMIN) sends `PATCH /api/admin/users {"userId":"<self>","role":"SUPER_ADMIN"}` → full platform control; or sets `isBanned:true` on every admin; or deletes users. `role` also accepts arbitrary strings (`"ADMIN "`, `"root"`), which later silently fail-open in `hasPermission` (`src/lib/rbac.ts:99-103`) because unknown roles map to an empty permission list rather than to `USER`.
**Fix:** enforce per-action permissions from `rbac.ts` in every admin handler; validate `role` with `z.enum([...])`; forbid modifying `SUPER_ADMIN`/self-escalation; soft-delete instead of hard delete; audit inside the same transaction.

#### H-4 — No rate limiting or abuse protection anywhere
**Evidence:** grep for `rate.?limit|RateLimit|429` across `src/` → **0 matches**; no middleware limiter, no per-IP counter, no CAPTCHA. Combined with the routes below:
- `src/app/api/auth/login/route.ts:6-33` — unlimited password guesses, no lockout, no delay, distinct response for banned users (`:26-28`).
- `src/app/api/auth/register/route.ts` — unlimited account creation; email enumeration (`:29-31` says "account exists").
- `src/app/api/subscribers/route.ts:91-198` and `subscribers/[id]/resend/route.ts:34-52` — unauthenticated, sends real email per call → **email bombing**, potential Resend cost/domain reputation damage.
- `src/app/api/ai/generate/route.ts:26-58` — quota is monthly only (`src/lib/ai/usage.ts:16-43`); a burst can exhaust it in seconds and burn provider money (race, see M-6).
- `src/app/api/analytics/route.ts:133-162`, `report/route.ts`, `bookings/route.ts:108-151`, `store/checkout/route.ts`, `products/[id]/{click,view}`, `upload` — unauthenticated write endpoints, all unlimited (DB bloat, metric pollution, disk filling).

**Fix:** add a limiter (Upstash/Redis or `@vercel/firewall`) at minimum for auth, upload, AI, subscribe/resend, public POSTs; per-IP + per-account; fail closed on auth endpoints.

#### H-5 — Middleware fails open / swallows protection errors
**Evidence**
- `src/middleware.ts:66-70` — when `isLiveClerkKeyConfigured()` is false, `return NextResponse.next()` for **all** paths; `.env:13` contains a demo secret, so this is the active path (the `demo_secret_key` substring check at `src/lib/auth.ts:58` returns false by design).
- `:62-64` — presence of the *unsigned* cookie bypasses Clerk for `/admin`, `/dashboard`.
- `:27-31` — `try { await auth.protect(); } catch { /* let pass */ }` — any Clerk failure is ignored.
- `src/lib/auth.ts:52-65` — configuration detection is heuristic string matching, not a real health check.

**Impact:** UI/API guards silently degrade. `/admin` and `/dashboard` are protected only by the layouts (`src/app/admin/layout.tsx:13-16`, `src/app/dashboard/layout.tsx:16-19`), and any future page/route that forgets an explicit check is public.
**Fix:** fail closed (`redirect`/401 when auth cannot be verified); do not treat configuration heuristics as security decisions; use one shared `requireAuth`/`requireAdmin` for both pages and APIs.

#### H-6 — Emails built from attacker-controlled `Origin` header (phishing + token leakage)
**Evidence**
- `src/app/api/subscribers/route.ts:180-188` — `const appUrl = req.headers.get("origin") || undefined; sendConfirmationEmail({..., appUrl})`.
- `src/app/api/subscribers/[id]/resend/route.ts:44-52` — same.
- `src/lib/email/service.ts:107-108` — `const baseUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL ...; const confirmUrl = \`${baseUrl}/api/subscribers/confirm?token=...\``; `:170-172` same for unsubscribe.
- `src/app/api/subscribers/confirm/route.ts:78-86` — same pattern on confirm.

**Impact:** anyone can subscribe a victim's address with `Origin: https://evil.example`; the platform sends a legitimate-looking email from its own domain whose confirmation link points at the attacker with the victim's token (token can be harvested, subscription forged, or the victim phished). Also poisons links when `NEXT_PUBLIC_APP_URL` is unset (local default).
**Fix:** never derive absolute URLs from request headers; use `NEXT_PUBLIC_APP_URL` (allowlist-validated) or a relative link in emails.

#### H-7 — Mass assignment on admin settings/templates
**Evidence**
- `src/app/api/admin/settings/route.ts:28-34` — `prisma.platformSettings.upsert({ where:{id:"default"}, update: body, create: { id:"default", ...body } })` — the entire request body is written; `id` can be overridden in `create`; no Zod.
- `src/app/api/admin/templates/route.ts:53-61` — `const { id, ...updates } = body; prisma.template.update({ where:{id}, data: updates })` — every column (`isPublished`, `price`, `isPro`, `slug`, …) is client-writable without validation; `POST` (`:10-29`) validates manually only `name/slug/category/description` presence.
- `src/app/api/admin/users/route.ts:63-72` — the four-field whitelist is fine, but values are unvalidated (see H-3).
- `src/app/api/admin/moderation/route.ts:29-37` — `status` written unvalidated; `reportId` unchecked.
- `src/app/api/admin/support/route.ts:99-107` — `status`, `priority`, `response` written unvalidated.

**Impact:** an attacker with any admin-level token can flip platform settings/billing/feature state, rewrite or republish arbitrary templates, or corrupt report/support records; malformed values produce 400/500 with Prisma messages.
**Fix:** dedicated Zod schema per admin endpoint with explicit field allowlists and enums.

#### H-8 — Booking integrity: clients can book arbitrary times and "paid" bookings are never charged
**Evidence**
- `src/lib/booking/service.ts:193-266` — `createBooking` only checks that the appointment type is active/belongs to the profile (`:223-229`) and that there is **no overlap** (`:235`); it never verifies the requested `startTime` falls inside an availability rule, is in the future, or matches a generated slot.
- `src/app/api/bookings/route.ts:108-151` — public POST with Zod (good), but the schema (`src/lib/validations/booking.ts:72-81`) accepts any ISO datetime.
- `src/lib/booking/service.ts:263` — `isPaid: appointmentType.price === 0` — i.e. any priced booking is created unpaid, and there is no payment step anywhere in the booking flow; `totalRevenue` metrics (`bookings/route.ts:85-87`) therefore count nothing.
- `src/lib/booking/service.ts:40-65` — conflict check is `findFirst` inside a transaction while the project runs on SQLite (`DATABASE_URL="file:./dev.db"`, `.env:4`); there is no unique constraint on `(profileId, startTime)`, so the claimed "transaction locking" does not actually prevent races.
- `src/lib/booking/service.ts:75,177` — `viewerTimezone` parameter is accepted and ignored; slots are always labelled `UTC`.

**Impact:** bookings can be created at 03:00 or in the past, outside availability; double-booking races are possible under concurrency; paid appointments never collect money yet remain `CONFIRMED`; timezone display is wrong for non-UTC creators (a correctness bug for a scheduling product).
**Fix:** validate `startTime` against generated availability in `createBooking` (reuse `generateAvailableSlots`), reject past times, add a DB unique constraint or `SELECT … FOR UPDATE`-equivalent, and add a payment step or explicitly disable priced bookings.

#### H-9 — Admin user deletion is unaudited/over-privileged; audit log write is not transactional
**Evidence**
- `src/app/api/admin/users/route.ts:92-121` — hard `prisma.user.delete` for any user (only self-deletion blocked), then audit log insert after the fact; if the log insert fails the destructive action is already done.
- `src/app/api/admin/users/route.ts:74-84`, `admin/templates:31-40,63-72,92-100`, `admin/moderation:39-48`, `admin/settings:36-45` — all follow "mutate, then log" without a transaction; `src/lib/rbac.ts:116-149` `logAdminAction` swallows errors (`catch → return null`).
- `src/app/api/admin/domains/route.ts:142-147` — `DELETE` returns **before** the audit log block at `:150-159`, so domain deletion is never logged.

**Impact:** destructive admin actions can be performed without a durable audit trail (compliance failure), and a moderator can delete users outright.
**Fix:** perform mutation + audit insert in one `prisma.$transaction`; block hard deletes for users (soft-ban/delete with retention); never `return` before the audit step.

### 2.3 Medium

#### M-1 — Internal error messages returned to clients
**Evidence:** `catch (error: any) { return NextResponse.json({ error: error.message ... }) }` in:
`auth/login:56-58`, `auth/register:121-123`, `auth/logout:11-12,23-24`, `profile:54-56`, `links/route.ts:82-84`, `links/[id]:48-50`, `collections/route.ts:54-56`, `collections/[id]:32-34`, `theme:43-45`, `qr-code:60-62`, `report:22-24`, `onboarding:131-133`, `domains:85-91`, `domains/verify:35-41`, `admin/users:87-89`, `admin/moderation:51-53`, `admin/settings:48-50`, `admin/templates:43-45,75-77`, `admin/domains:162-167`, `bookings:152-166`, `bookings/cancel:28-33`, `bookings/reschedule:28-36`, `bookings/slots:33-38`, `bookings/types:99-105,151-157,204-206`, `bookings/availability:105-111`, `bookings/settings:64-70`, `ai/generate:137-142`, `ai/apply:121-124`, `ai/usage:19-22,51-54`, `ai/history:22-25`, `templates/apply:59-61`, `store/orders/refund` (via `payment.ts:399`).
**Impact:** leaks Prisma/ORM internals, table/column names, constraint names, and in `ai/generate` potentially provider errors (which can include request detail); aids targeted exploitation.
**Fix:** log full error server-side, return a stable code + generic message (`{"error":"INTERNAL"}`), map known domain errors to 4xx explicitly.

#### M-2 — Input validation gaps on non-admin endpoints
| Endpoint | Gap | Evidence |
|---|---|---|
| `POST /api/onboarding` | **No Zod at all**; `socialLinks[].url` only truthy-checked → stored with no scheme validation | `onboarding/route.ts:13-22,100-117` |
| `PUT /api/ai/usage` | No Zod; `preferredLanguage/preferredTone/defaultProvider` arbitrary | `ai/usage/route.ts:32-48` |
| `POST /api/ai/apply` | `payload: z.record(z.any())`; `theme` fields used unvalidated; `layout` written raw | `ai/apply/route.ts:6-10,47-90` |
| `PUT /api/qr-code` | No Zod; colors/logoUrl arbitrary | `qr-code/route.ts:41-57` |
| `POST /api/analytics` | No auth, no Zod: arbitrary `profileId`, `linkId`, `type`, `visitorId`, `country` | `analytics/route.ts:133-162` |
| `POST /api/templates/apply` | `templateSlug` not validated as a string | `templates/apply/route.ts:13-16` |
| `POST /api/auth/login` | Manual checks only; email format not validated | `auth/login/route.ts:8-15` |
| `POST /api/auth/register` | Email check is only `includes("@")`; name/bio unbounded | `auth/register/route.ts:13-22` |
| `PUT /api/profile` | Schema lacks URL validation for `avatarUrl`/`bannerUrl` | `src/lib/validations.ts:62-63` |
| `POST /api/links` | `icon` and `thumbnail` unconstrained strings; `collectionId` not verified to belong to caller | `src/lib/validations.ts:98-101`, `links/route.ts:63-79` |
| `POST /api/report` | `profileId`/`linkId` not verified to exist; both optional | `report/route.ts:8-19` |
| `PUT /api/theme` | Colors/gradients/fonts are free strings | `src/lib/validations.ts:116-132` |
**Fix:** one shared validation layer; `.strict()` schemas with explicit lengths, enums, and URL/scheme checks; verify referenced ids belong to the actor.

#### M-3 — Stored CSS/URL injection in public profile surface
**Evidence:** `avatarUrl`, `bannerUrl` (`validations.ts:62-63`), `backgroundColor`, `backgroundGradient`, `backgroundImage`, `buttonColor`, `fontHeading` (`validations.ts:116-132`), `qr-code` colors/`logoUrl` (`qr-code:41-57`), `ai/apply` theme (`ai/apply:58-90`), `templates/apply` stylesJson spread (`templates/apply:29-44`), `onboarding` styles (`onboarding:65-98`). All are rendered into profile/theme styles. There is **no `dangerouslySetInnerHTML` in the codebase** (verified by grep), so this is CSS/URL injection rather than script XSS; `backgroundImage` accepts `url(...)`-style payloads and arbitrary remote URLs, enabling layout defacement and third-party tracking of every profile visitor.
**Mitigation observed (good):** external navigation uses `formatUrlForHref` (`src/lib/utils.ts:87-111`) with `window.open(..., "noopener,noreferrer")` (`public-profile-view.tsx:92`), and link URLs are scheme-validated by `isValidSecureUrl` (`utils.ts:60-85`). The gap is that **onboarding bypasses `linkSchema`** (see M-2), so `javascript:` links can still be persisted.
**Fix:** validate color/font/URL fields with regexes and an allowlisted image host policy; sanitise template `stylesJson`; run link-url validation in all creation paths (including onboarding and social-links import).

#### M-4 — Custom-domain ownership verification can be bypassed
**Evidence**
- `src/lib/domain/service.ts:196-206` — `isSimulation = forceVerify || process.env.SIMULATE_DNS_VERIFICATION === "true" || domain.includes("test") || domain.includes("demo")`; when true, TXT and CNAME are treated as found.
- `:249-250` — `const isVerified = txtFound || cnameFound;` — a matching CNAME/A record alone (no TXT ownership token) is accepted, so anyone who can point a hostname at the platform (e.g. an unused subdomain of a service that allows arbitrary CNAME) gets `ACTIVE` status.
- `:252-298` — on success the domain goes straight to `ACTIVE`/`sslStatus: ACTIVE` with a simulated "SSL provisioning" comment (`:274-276`).
- `.env.example:49` — `SIMULATE_DNS_VERIFICATION="false"` (documented switch that turns verification into a no-op).
**Impact:** domain claim/hijack of `*demo*` / `*test*` hostnames, and "verified" status for domains the user does not own (phishing on a trusted-looking domain routed to the attacker's profile via `resolveDomainProfile`, `:365-387`).
**Fix:** require the TXT token (not OR), remove substring-based simulation entirely (or gate behind an explicit dev flag that cannot be set in production), and perform real TLS provisioning verification before marking `ACTIVE`.

#### M-5 — Admin domain actions lack permission checks; destructive DELETE is unaudited
**Evidence:** `src/app/api/admin/domains/route.ts:85-93` gates on `verifyAdminSession()` only (so SUPPORT/MODERATOR can suspend/delete customer domains); `:142-147` deletes and `return`s before the audit log at `:150-159`; `FORCE_VERIFY` calls `verifyCustomDomainDNS(id, undefined, true)` with `forceVerify=true` (`:140`), i.e. bypasses verification whenever an admin clicks it.
**Fix:** `userHasPermission("settings:write" | "marketplace:moderate")`-style gates; audit before/with the destructive action.

#### M-6 — AI quota: check-then-act race and month-rollover counter bug
**Evidence:** `src/app/api/ai/generate/route.ts:47-57` checks the quota, then `:107-119` records usage afterwards — concurrent requests can all pass the check. `src/lib/ai/usage.ts:16-43` treats a previous-period row as `used = 0`, but `recordAIGeneration` (`:80-97`) updates with `{ period, generationCount: { increment: 1 } }`, so at month rollover the previous month's **total is kept** and the user is locked out early. Also no per-minute limiter (H-4).
**Fix:** atomic conditional update (`updateMany where generationCount < limit`) or a DB constraint; reset the counter on period change.

#### M-7 — Open redirect / header-poisoned return URLs in checkout
**Evidence:** `src/app/api/store/checkout/route.ts:11-21` passes `origin: req.headers.get("origin") || req.headers.get("referer")` into checkout; `src/lib/store/payment.ts:107,151-156` uses it as `baseUrl` for `success_url`/`cancel_url`. `checkoutRequestSchema` (`src/lib/validations/product.ts:68-69`) accepts **any** `.url()` for `successUrl`/`cancelUrl`, including attacker domains. `src/app/api/ai/...`/admin routes not affected.
**Impact:** after a real payment the buyer is redirected to an attacker-controlled "receipt" page (phishing), and Stripe sessions can be minted pointing anywhere.
**Fix:** ignore `Origin/Referer` for return URLs; build from `NEXT_PUBLIC_APP_URL`; validate `successUrl/cancelUrl` against an allowlist of own hosts.

#### M-8 — Webhook idempotency is racy; no amount/currency reconciliation
**Evidence:** `src/lib/store/payment.ts:249-259` — `findUnique` then later `paymentEvent.create` (see C-4 for the unverified path). Two concurrent deliveries both see no event; the guarded read-then-write is only saved from double-processing by the `stripeEventId` unique constraint aborting one transaction (`:273-308`), which surfaces as a 400 to Stripe (retry). `checkout.session.completed` never compares `amount_total`/`currency` with `order.amount`, and `charge.refunded` (`:313-347`) matches orders only by `paymentIntentId`.
**Fix:** insert the `paymentEvent` **first** (unique id = signature-verified event id) inside the same transaction, treat duplicates as 200, and reconcile amount/currency.

#### M-9 — CSV formula injection in subscriber export
**Evidence:** `src/app/api/subscribers/export/route.ts:24-35` — `name` and `consentText` are quote-escaped but not formula-escaped; they come from the public subscribe form (`subscribers/route.ts:141`). A subscriber name like `=HYPERLINK("http://evil","click")` executes in the creator's spreadsheet. No `Content-Type`/`X-Content-Type-Options` hardening beyond the CSV mime.
**Fix:** prefix values beginning with `=`, `+`, `-`, `@`, tab, CR with `'`; export with UTF-8 BOM and `nosniff`.

#### M-10 — Suspended users are never blocked; banned users degrade to the demo identity
**Evidence:** `isSuspended` is written by `admin/users:56-67` but **read nowhere** in the API code (grep); `getAuthenticatedUser` only tests `isBanned` (`auth.ts:130,222`); a banned user then falls through to the demo-user fallback (`:233-241`), so banning does not remove API access.
**Fix:** a single session validation that rejects `isBanned || isSuspended` with 403 on every authenticated route.

#### M-11 — Unauthenticated metric/report integrity writes
**Evidence:** `analytics/route.ts:133-162` — anyone can POST `{profileId, linkId, type:"CLICK"}` for any profile and also increment `Link.clicksCount` (`:156-161`), corrupting analytics and top-link rankings; `report/route.ts:5-24` — unlimited anonymous reports (moderation queue flooding) and no existence checks. `products/[id]/{click,view}` — same, plus `catch{}` returns 404 on error.
**Fix:** derive `profileId` from the public profile route, use edge-side dedup/cookie-based visitor ids, rate limit, and verify `linkId` belongs to the profile before incrementing counters.

#### M-12 — No security headers; Next image optimiser allows any remote host
**Evidence:** `next.config.mjs:4-11` — `images.remotePatterns: [{ protocol:"https", hostname:"**" }]` allows `/_next/image?url=https://any-host` (open image proxy → SSRF-flavoured abuse, bandwidth, IP exposure) and there are no `headers()` entries. `src/middleware.ts` sets no CSP/HSTS/X-Frame-Options/Referrer-Policy. Auth cookie is `httpOnly` + `secure` in prod + `sameSite: "lax"` (`login:37-43`) which is reasonable, but there is no `__Host-` prefix and no CSRF token.
**Fix:** restrict `remotePatterns` to known hosts; add CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame protection via `headers()`.

#### M-13 — Secrets hygiene: `.env` committed; hard-coded third-party Clerk tenant for token forwarding
**Evidence:** `.gitignore:26` ignores only `.env*.local`, so `.env` is tracked (`git ls-files` → `.env`), and `HEAD:.env` contains `ADMIN_EMAIL_ALLOWLIST=…` and a demo Clerk secret; current `.env` is modified but still tracked. `src/lib/auth.ts:78` — the session cookie is forwarded to a hard-coded `https://live-halibut-6305.clerk.accounts.dev/v1/client` with a `Cookie: __session=…` header (`:79-84`), i.e. a production-adjacent credential is shipped to a fixed external tenant chosen in code.
**Impact:** allowlist disclosure enables C-2; the hard-coded tenant both leaks session JWTs to a fixed third party and breaks if the tenant rotates. (The values currently committed are demo/fake, so this is medium, but the pattern is what matters.)
**Fix:** untrack `.env`, add `.env` to `.gitignore`, rotate everything, move the Clerk instance host into configuration and verify tokens locally via JWKS instead of forwarding cookies.

#### M-14 — State-changing GETs and GET side effects
**Evidence:** `subscribers/confirm/route.ts:5-102` mutates subscriber state and mints welcome emails on GET (token reusable: `usedAt` is written at `:69-74` but **never checked**, so a link works until `expiresAt`, including after unsubscribe → re-activation); `subscribers/unsubscribe:5-70` unsubscribes via GET; `auth/logout:16-26` logs out via GET and redirects. Seeding side effects on GET: `admin/support/route.ts:27-76` creates 3 fake tickets on first read; `admin/settings:10-15` creates settings; `store/categories:11-28` upserts categories; `admin/feature-flags:17-50` creates flags.
**Impact:** CSRF-able state changes (link-prefetchers, chat clients, email link checkers can unsubscribe/confirm), unreproducible first-request writes from a GET, and demo data inserted into production DBs.
**Fix:** POST + token for confirm/unsubscribe, single-use tokens (check `usedAt`), and move seeding to `prisma/seed`.

#### M-15 — Store: refund state machine and audit gaps
**Evidence:** `src/lib/store/payment.ts:365-417` — ownership check is correct (`order.profile.userId !== userId`, `:381`), but refunds are allowed for orders that are not `COMPLETED` (only `REFUNDED` is rejected, `:385-387`); the Stripe refund is skipped silently if `paymentIntentId` is null (`:391`) while the DB is still marked `REFUNDED`; no `paymentEvent`/audit row is written; `:399` returns the raw Stripe error message to the client; `src/app/api/store/orders/refund/route.ts:17-21` passes `user.id` (correct) but no role/plan check and no rate limit.
**Fix:** require `status === "COMPLETED"` and an existing payment intent, record a refund audit row, and never surface provider errors.

#### M-16 — Subscription source-of-truth mismatch and PRO gating bugs
**Evidence:** domains gate on `user.subscriptionTier` (`src/lib/domain/service.ts:82`), products gate on `prisma.subscription.plan` (`src/app/api/products/route.ts:26-30,55-59`), AI gates on `user.subscriptionTier` (`ai/generate:47`), and `templates/apply/route.ts:22` checks `subscriptionTier !== "PRO"` so **BUSINESS users are denied PRO templates**. Nothing ever writes a `Subscription` row or upgrades `subscriptionTier` (no billing webhook/endpoint exists), so the two fields will drift as soon as one is edited by an admin (`admin/users:56-67` can set `subscriptionTier` but not `Subscription.plan`).
**Fix:** one canonical entitlement source, cascaded limits, and a `BUSINESS ⊇ PRO` comparison helper.

### 2.4 Low

- **L-1 — `console.error` noise / object logging.** 40+ handlers log full error objects (e.g. `bookings:100`, `products:42`, `analytics:127`, `admin/support:80`). In development Prisma logs queries (`src/lib/prisma.ts:10`), and `console.error("Clerk session cookie parsing error:", err)` (`auth.ts:228`) can echo JWT contents into logs. No `console.log` was found in API routes (good).
- **L-2 — Inconsistent response contracts.** Zod errors: `{error: message}` (`products:106`) vs `{error:"Validation failed", details: err.errors}` (`bookings:156`) vs `{error:"Invalid request format", details: flattened}` (`ai/generate:39`); `analytics` POST returns `{success:false}` with HTTP **200** (`:166`); `logout` returns 500 with `error.message`; `store/orders/refund` returns 400 for authorization failures (`payment.ts:382` maps "not found or unauthorized" to 400, not 404/403).
- **L-3 — Placeholder/demo data inside production code paths.** `audience/route.ts:54-82` fabricates three subscribers with revenue when the real list is empty; `admin/support:27-76` seeds fake tickets; `admin/feature-flags:17-50`, `store/categories:11-28` seed defaults; `src/lib/store/payment.ts:110-134` "preview mode" checkout that pretends to succeed; `SIMULATE_DNS_VERIFICATION` (M-4).
- **L-4 — Dead/unused code.** `removeDomainSchema` imported but never used (`domains/route.ts:4`; schema at `validations/domain.ts:69-71`); `getAuthenticatedUser()` result unused (`upload:18`); `viewerTimezone` unused (`booking/service.ts:75,177`); `displayMode: "video"` is checked at `utils.ts:284` but not allowed by `linkSchema` (`validations.ts:100`); `formatUrlForHref`'s final `https://${trimmed}` fallback (`utils.ts:110`) can produce malformed URLs; booking notifications are created with `status: "SENT"` (`booking/service.ts:278-299,348-358,418-428`) although `src/lib/email/service.ts` exposes no booking-email function — the "sent" state is DB fiction.
- **L-5 — Duplicated logic.** Theme application is implemented three times with different validation: `onboarding:82-98`, `templates/apply:29-44`, `ai/apply:47-90`; profile-card icon mapping and CSV building duplicated; `getAuthenticatedUser`-style guards copy-pasted in ~40 handlers.
- **L-6 — No CSRF protection layer.** Relies entirely on `sameSite: "lax"`; state-changing GETs (M-14) are reachable cross-site; no origin check on POST APIs; logout GET.
- **L-7 — Trusting client headers.** `x-forwarded-for`/`x-real-ip` are trusted for consent IPs (`subscribers/route.ts:96`); `Origin`/`Referer` used for URLs (M-7, H-6); `Host` used for tenant rewrite (`middleware.ts:36-59`).
- **L-8 — Weak password policy.** Min 6 chars, no complexity/breach check (`register:17`); scrypt defaults with no per-user cost parameter and synchronous `scryptSync` (`password.ts:6-9,19`) blocking the event loop (low, functional DoS lever under H-4).
- **L-9 — Upload fallback to base64 data URLs** stored in the DB (`upload:66-77`) → row bloat and enormous payloads in subsequent queries.
- **L-10 — Missing pagination.** `admin/users` GET returns every user (`:26-41`), `admin/moderation` every report, `admin/domains` every domain; `analytics` GET loads all events in range into memory (`:33-42`) — DoS/perf risk at scale.
- **L-11 — Unvalidated free-text endpoints.** `report.reason` min 3 chars (`validations.ts:138`), no profanity/abuse control; `bookings.slots` accepts arbitrary `timezone` passed to service (unused, but an invalid value would throw → 400).
- **L-12 — Enum validation missing for stored roles/statuses.** Free-string `role` (H-3), report `status` (`admin/moderation:29-37`), ticket `status/priority` (`admin/support:99-107`), `ai/usage.defaultProvider` (`ai/usage:33-47`).
- **L-13 — `passwordHash`/PII exposure risk in admin responses.** `admin/users` GET returns full `User` rows including `passwordHash` (the `findMany` has no `select`, only `Profile.select`) — hash exposure to any MODERATOR/SUPPORT (`admin/users:26-43`).

---

## 3. Endpoint inventory

Legend — **Auth**: `—` public, `U` any authenticated user (subject to C-5!), `P` profile owner, `A` admin-ish (`verifyAdminSession`), `T` token (booker/subscriber token). "Who allowed" notes the *intent*; effective behaviour is weakened by C-1/C-2/C-5.

### 3.1 Auth & account

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/auth/register` | POST | — | public | manual (email `includes("@")`, pwd ≥6) | **C-2** allowlist→ADMIN; no email verification; sets unsigned cookie; enumeration |
| `/api/auth/login` | POST | — | public | manual | no rate limit/lockout (H-4); unsigned cookie; distinct banned message; leaks `error.message` |
| `/api/auth/logout` | POST, GET | — | public | none | GET logs out + redirects (CSRF-ish); no session invalidation server-side (cookie-only) |
| `/api/profile` | GET/PUT/DELETE | U | owner | Zod `profileUpdateSchema` | GET returns full profile + links + collections; PUT allows unvalidated avatar/banner URLs (M-2); DELETE removes profile but not user (orphan) and cascades; no confirmation |
| `/api/profile/check-username` | GET | — | public | regex + reserved list | username enumeration; no rate limit |
| `/api/profile/newsletter` | PUT | U | owner | Zod `newsletterSettingsSchema` | fine |
| `/api/onboarding` | POST | U | owner | **manual/partial** | **M-2**: `socialLinks[].url` unvalidated → `javascript:` links possible; bio unbounded; template slug unvalidated; upsert + theme + links, no transaction |

### 3.2 Profile content (links / collections / theme / QR / templates)

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/links` | GET/POST/PUT | U | owner | POST/PUT: Zod `linkSchema`; PUT reorder: none | POST enforces FREE link cap; reorder scoped by `profileId` (good); no rate limit |
| `/api/links/[id]` | PATCH/DELETE | U | owner (checked `findFirst` incl. `profileId`) | Zod `.partial()` | **good ownership**; `error.message` leak; `icon/thumbnail/collectionId` loosely validated |
| `/api/collections` | GET/POST | U | owner | Zod `collectionSchema` | good |
| `/api/collections/[id]` | PATCH/DELETE | U | owner (checked) | Zod `.partial()` | good ownership |
| `/api/theme` | GET/PUT | U | owner | Zod `themeSchema.partial()` | **M-3** arbitrary colors/gradients/background image stored → public profile CSS injection |
| `/api/qr-code` | GET/PUT | U | owner | **none** | M-2/M-3 colors + `logoUrl` unvalidated; GET creates a row |
| `/api/templates` | GET | — | public | n/a | returns published templates incl. `stylesJson`; fine |
| `/api/templates/apply` | POST | U | owner | `templateSlug` unvalidated | M-16 BUSINESS blocked from PRO; `stylesJson` spread raw into theme; no transaction |

### 3.3 Upload

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/upload` | POST | **none enforced** | intended auth | MIME allowlist incl. **SVG**, 5 MB cap | **H-2** unauthenticated storage write + stored XSS via SVG; filename server-generated (no traversal); base64 data-URL fallback |

### 3.4 Subscribers / newsletter

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/subscribers` | GET/POST | GET: U; POST: — | owner / public | POST: Zod `subscribeRequestSchema` | POST sends real email (no rate limit → bombing, H-4); **H-6** `Origin`-built confirm link; double opt-in token 24 h |
| `/api/subscribers/[id]` | DELETE | U | owner (checked) | none | good; GDPR hard delete |
| `/api/subscribers/[id]/resend` | POST | U | owner (checked) | none | H-6 origin poisoning; no throttle (mail abuse by creator) |
| `/api/subscribers/confirm` | GET | T | token holder | token lookup | **state change on GET**; `usedAt` written but never enforced; HTML page interpolates `subscriber.email` (Zod email only → low HTML-injection risk); same `Origin` pattern |
| `/api/subscribers/unsubscribe` | GET, POST | T | token holder | POST: manual token check | GET mutates; POST returns full subscriber record |
| `/api/subscribers/export` | GET | U | owner | n/a | **M-9** CSV formula injection; fine otherwise |

### 3.5 Bookings

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/bookings` | GET/POST | GET: U; POST: — | owner / public | Zod `bookingCreateSchema` | **H-8** arbitrary/past times, no availability check, paid bookings never charged; returns cancel/reschedule tokens (intended) |
| `/api/bookings/cancel` | POST | U **or** token | creator or booker | Zod `bookingCancelSchema` | authorization correct (`service.ts:332-336`); `error.message`; allows cancelling completed bookings |
| `/api/bookings/reschedule` | POST | U or token | creator or booker | Zod `bookingRescheduleSchema` | authorization correct; double-booking check; past times allowed |
| `/api/bookings/slots` | GET | — | public | date regex; ids unvalidated | timezone ignored (L-4); availability leak is intentional |
| `/api/bookings/availability` | GET/PUT | U | owner | Zod `weeklyAvailabilitySchema` | transaction delete+create (good); no overlap validation inside a day (start < end unchecked) |
| `/api/bookings/settings` | GET/PATCH | U | owner | Zod `bookingSettingsSchema` | PATCH requires all required fields (not patchable); fine |
| `/api/bookings/types` | GET/POST/PUT/DELETE | GET public with ids; writes U | owner | Zod `appointmentTypeSchema` | ownership checks correct (`:123-129,177-188`); DELETE deactivates when bookings exist (good) |

### 3.6 Custom domains

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/domains` | GET/POST/DELETE | U | owner | Zod `connectDomainSchema` (FQDN + reserved list) | PRO gate; DELETE `removeCustomDomain(id, user.id)` ownership correct; GET creates nothing |
| `/api/domains/verify` | POST | U | owner (`service.ts:174-176`) | Zod `verifyDomainSchema` | **M-4** verification bypass; no rate limit on DNS lookups (cheap DoS/amplification) |
| `/api/domains/resolve` | GET | — | public | `domain` non-empty | returns `username` + `profileId` for active domains only (intended for public store/booking) |
| `/api/admin/domains` | GET/POST | A (coarse) | admin-ish | Zod `adminDomainActionSchema` | **M-5** no per-action permission; DELETE unaudited; FORCE_VERIFY bypasses ownership proof |

### 3.7 Store / payments

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/products` | GET/POST/PUT/DELETE | U | owner (checked in PUT/DELETE) | Zod product schemas | tier caps via `Subscription.plan` (M-16); price unbounded; fine ownership |
| `/api/products/[id]` | GET | — | public | id | **H-1** exposes `fileUrl`/`externalUrl` of paid products |
| `/api/products/[id]/click` | POST | — | public | none | counter inflation; 404 on any error |
| `/api/products/[id]/view` | POST | — | public | none | same |
| `/api/products/reorder` | POST | U | owner (scoped updateMany) | Zod | good |
| `/api/store/categories` | GET | — | public | n/a | seeds DB on GET (M-14) |
| `/api/store/checkout` | POST | — | public | Zod `checkoutRequestSchema` | public by design; **C-4/H-1/M-7** unconfigured-Stripe "success", return-URL poisoning; no rate limit (order spam) |
| `/api/store/orders` | GET | U | owner | n/a | scoped by `profile.id`; revenue math on floats; fine |
| `/api/store/orders/refund` | POST | U | order owner (verified in service) | Zod `refundRequestSchema` | M-15 state-machine/audit gaps; Stripe error text leaked |
| `/api/store/webhook` | POST | **none / unverified** | Stripe | **none when unconfigured** | **C-4** signature skipped; idempotency race (M-8) |

### 3.8 AI assistant

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/ai/generate` | POST | U* | any user | master + per-type Zod (strict enums, lengths) | quota check (race M-6); `error.message` may contain provider details; no rate limit; *effectively public via C-5* |
| `/api/ai/apply` | POST | U | owner | `payload: z.record(z.any())` | link update scoped by `profileId` (good); theme fields unvalidated (M-3); `generationId` optional |
| `/api/ai/history` | GET | U | owner | `limit` int, `take` capped at 50 | fine |
| `/api/ai/usage` | GET/PUT | U | owner | **PUT: none** | M-2 arbitrary settings values |

### 3.9 Analytics / audience / reports

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/analytics` | GET/POST | GET: U; POST: **—** | owner / public | **POST: none** | **M-11** arbitrary `profileId`/`linkId` writes, `clicksCount` inflation; GET loads full event range |
| `/api/audience` | GET | U | owner | n/a | **L-3** fabricates subscribers/revenue when empty; newsletter "subscribers" derived from analytics `visitorId` |
| `/api/report` | POST | — | public | Zod `reportSchema` | no existence checks; no rate limit; `error.message` |

### 3.10 Admin

| Endpoint | Methods | Auth | Who | Validation | Notes |
|---|---|---|---|---|---|
| `/api/admin/users` | GET/PATCH/DELETE | A | admin-ish | **none** | **H-3/H-9/L-13** arbitrary `role`, SUPPORT can escalate, hard deletes, exposes `passwordHash`, audit outside transaction |
| `/api/admin/settings` | GET/PUT | A | admin-ish | **PUT: none (mass assignment)** | **H-7**; GET creates row |
| `/api/admin/templates` | POST/PATCH/DELETE | A | admin-ish | manual presence checks | **H-7** mass assignment on PATCH |
| `/api/admin/moderation` | GET/PATCH | A | admin-ish | **none** | unvalidated `status`; no `reports:moderate` permission |
| `/api/admin/marketplace` | GET/PUT | A + permission ✅ | admin-ish | manual type checks | one of the **few correct** permission-gated endpoints |
| `/api/admin/support` | GET/PUT | A + permission ✅ | admin-ish | **none** on values | seeds fake tickets on GET (M-14) |
| `/api/admin/feature-flags` | GET/PUT | A + permission ✅ | admin-ish | manual boolean check | correct pattern; GET seeds flags |
| `/api/admin/domains` | GET/POST | A (coarse) | admin-ish | Zod action enum | **M-5** permission/audit gaps |

---

## 4. Validation coverage summary

- **Zod fully used** (good): `store/checkout`, `store/orders/refund`, `bookings/*` (except slots GET), `subscribers` POST, `ai/generate` (+ per-type schemas), `products` (create/update/reorder), `domains/connect`, `admin/domains` actions, `links`/`collections`/`theme`/`profile` update, `profile/newsletter`, `report`.
- **Zod partial / manual only**: `auth/register`, `auth/login`, `onboarding`, `ai/apply`, `admin/templates`, `admin/users`, `admin/settings`, `admin/moderation`, `admin/support`, `qr-code`, `ai/usage`, `templates/apply`, `analytics` POST, `upload`.
- **No validation needed / none conceivable**: `templates` GET, `store/categories`, `logout`, `products/[id]/{click,view}` (but they do need existence/ownership checks).
- Request-body handling never uses `any` casts on the body itself; instead some routes cast the *parsed* result or pass `body` straight to Prisma (`admin/settings:32-33`, `admin/templates:54-60`, `onboarding`).
- URL safety: `isValidSecureUrl` (`utils.ts:60-85`) blocks `javascript:/data:/vbscript:/file:` and allows http/https/mailto/tel — sound, and used by `linkSchema`. It is **bypassed by `onboarding`** and by `thumbnail/icon/avatarUrl/bannerUrl/backgroundImage/fileUrl` fields which are not scheme-checked anywhere.

---

## 5. Cross-cutting controls

| Control | Status | Evidence |
|---|---|---|
| Password hashing | ✅ scrypt + per-password salt + timing-safe compare | `src/lib/password.ts:6-24` (no cost tuning; sync API) |
| Session integrity | ❌ unsigned cookie = raw user id | C-1 |
| Session revocation | ❌ none (no server session store; logout only clears cookie) | `auth/logout` |
| CSRF | ⚠️ relies on `SameSite=Lax`; no tokens; state-changing GETs | M-14, L-6 |
| Rate limiting | ❌ absent everywhere | H-4 |
| Webhook verification | ❌ fail-open when unconfigured | C-4 |
| Idempotency | ⚠️ unique constraint saves the happy path; racy read | M-8 |
| Transactions | ✅ booking create/cancel/reschedule, availability PUT, domain connect, checkout webhook; ❌ admin audit writes, onboarding, preview checkout | see findings |
| Ownership checks (`[id]` and id-in-body routes) | ✅ every route that addresses a record verifies `profileId`/`token`/owner — **no classic IDOR found** | `links/[id]:22-26,68-72`, `collections/[id]:18-21,49-52`, `subscribers/[id]:18-27`, `subscribers/[id]/resend:18-28`, `products:124-130,179-185`, `bookings/types:123-129,177-188`, `domains/verify` + `domain/service.ts:174-176`, `domain/service.ts:342-344`, `store/orders` (profile-scoped), `bookings cancel/reschedule` (`booking/service.ts:332-336,396-400`) |
| Secrets in client bundles | ✅ only `NEXT_PUBLIC_*` used client-side; `GEMINI/OPENAI/STRIPE/RESEND` server-only | `ai/provider.ts:51-65`, `store/payment.ts:4-13`, `email/service.ts:12` |
| Secrets in VCS | ❌ `.env` tracked | M-13 |
| Error hygiene | ❌ `error.message` returned in ~30 handlers | M-1 |
| Security headers | ❌ none configured | M-12 |
| PII minimisation | ⚠️ public profile payload contains full profile row + all product columns | C-1, H-1 |

---

## 6. Dead / placeholder / duplicated code

1. **Fabricated data**: `audience/route.ts:54-82` (three invented subscribers with spend), `admin/support:31-60` (three invented tickets inserted on GET).
2. **Simulation switches in production paths**: `domain/service.ts:196-206` (`*test*`/`*demo*` hostnames auto-verify), `.env.example:49` `SIMULATE_DNS_VERIFICATION`.
3. **Pretend-success checkout**: `store/payment.ts:110-134` (`mode: "preview_unconfigured_gateway"`) returns `success: true` with no payment (drives H-1).
4. **Dead imports/params**: `removeDomainSchema` unused (`domains/route.ts:4`), `user` unused (`upload:18`), `viewerTimezone` unused (`booking/service.ts:75,177`), `displayMode:"video"` unreachable (`utils.ts:284` vs `validations.ts:100`).
5. **Duplicated theme logic**: `onboarding:82-98`, `templates/apply:29-44`, `ai/apply:47-90`.
6. **Notifications marked `SENT` without sending**: `booking/service.ts:278-299,348-358,418-428` create booking notifications with `status: "SENT"`, but `src/lib/email/service.ts` has no booking-email function, so nothing is dispatched.
7. **Response contract drift**: see L-2.

---

## 7. Prioritised remediation (top 10)

1. **Kill the unsigned session** (C-1): signed/opaque session tokens in a `Session` table; rotate `biospace_session`; stop serialising `userId` to public pages (`select` public profile fields). *This is the one that must ship first.*
2. **Remove role assignment from register/login/Clerk-sync** (C-2): admin roles only via a separate, verified bootstrap; add email verification before any allowlist effect; untrack/rotate `.env`.
3. **Delete the unverified `__session` JWT path and the demo-user fallback** (C-3/C-5); add a single `requireUser()`/`requireAdmin()` that returns 401/403 and never falls back.
4. **Make the Stripe webhook fail closed** (C-4): 400 without a valid signature, verify `payment_status`/amount/currency, idempotency row first.
5. **Fix the paywall** (H-1): strip `fileUrl`/`externalUrl` from public responses and RSC props; serve downloads only through an order-scoped route; error out when Stripe is unconfigured.
6. **Harden uploads** (H-2): require auth, drop SVG, sniff magic bytes, move out of `public/`.
7. **Add per-action admin permissions & validated role enum** (H-3/H-7/H-9): use `rbac.ts` in every handler, transactional audit, no self-escalation, soft-delete.
8. **Add rate limiting** (H-4) on auth, upload, AI, subscribe/resend, and all public POSTs, plus account lockout and generic auth errors.
9. **Fix the middleware/auth fail-open posture** (H-5) and stop deriving URLs from `Origin` (H-6).
10. **Booking correctness** (H-8): validate against availability + future time, DB-level conflict constraint, payment step or disable priced bookings; fix M-4 domain verification; add Zod to the remaining admin endpoints (M-2).

---

## 8. Appendix

### A. Controls that are implemented correctly (do not regress)
- Ownership/authorization on all parameterised routes listed in §5 (no classic IDOR).
- Zod coverage of the store, bookings, subscribers, products, AI-generate, domain-connect and content-update payloads.
- Stripe refund ownership verification (`store/payment.ts:372-383`) and Stripe session price computed **server-side from the DB** (`payment.ts:62-63,173`), so the client cannot set the charged amount.
- `paymentEvent.stripeEventId` unique constraint (`prisma/schema.prisma` `model PaymentEvent`) providing a last-line idempotency guard.
- Booking create/cancel/reschedule and domain connect run in `prisma.$transaction`; availability PUT replaces rules atomically.
- `isValidSecureUrl` blocks dangerous schemes for links; public link navigation uses `formatUrlForHref` + `noopener,noreferrer`.
- No `dangerouslySetInnerHTML`, no raw SQL (`$queryRaw`/`$executeRaw` absent), Prisma parameterisation throughout — **no SQL injection surface found**.
- Nothing beyond `NEXT_PUBLIC_*` reaches the client bundle; password hashing is scrypt + timing-safe.
- `admin/marketplace`, `admin/support`, `admin/feature-flags` demonstrate the correct `verifyAdminSession` + `userHasPermission` + `logAdminAction` pattern.

### B. Files reviewed (in full)
API (57): `admin/{domains,feature-flags,marketplace,moderation,settings,support,templates,users}`, `ai/{apply,generate,history,usage}`, `analytics`, `audience`, `auth/{login,logout,register}`, `bookings/{availability,cancel,reschedule,route,settings,slots,types}`, `collections/{[id],route}`, `domains/{resolve,route,verify}`, `links/{[id],route}`, `onboarding`, `products/{[id],route,reorder,[id]/{click,view}}`, `profile/{route,check-username,newsletter}`, `qr-code`, `report`, `store/{categories,checkout,orders,orders/refund,webhook}`, `subscribers/{route,[id],[id]/resend,confirm,export,unsubscribe}`, `templates/{route,apply}`, `theme`, `upload`.
Core: `src/middleware.ts`, `src/lib/{auth,rbac,password,prisma,utils,validations}.ts`, plus supporting services/validations, schema, seed, env and config files listed in §0.

### C. Method/handler matrix
`GET` 34 · `POST` 30 · `PUT` 13 · `PATCH` 6 · `DELETE` 9 = **92 handlers** across 57 route files. All handlers are wrapped in `try/catch`; none use `dangerouslySetInnerHTML`; no `console.log` present.
