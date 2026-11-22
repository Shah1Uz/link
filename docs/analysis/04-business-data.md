# BioSpace — Business Logic & Data Model Audit

**Report ID:** 04 · **Area:** business-logic libraries (`src/lib/{ai,store,booking,domain,email,validations}`) + Prisma data layer
**Auditor:** data-auditor · **Date:** 2026-11-08
**Status:** Final (read-only audit; only this report file and `05-verification.md` were written)
**Companion reports:** `01-api-security.md` (auth/API-security findings are cross-referenced, not duplicated), `05-verification.md` (tooling evidence).

---

## 0. Scope, method, and key numbers

| Item | Value |
|---|---|
| Files read in full | `src/lib/ai/config.ts` (77 L), `src/lib/ai/provider.ts` (994 L), `src/lib/ai/usage.ts` (147 L), `src/lib/store/config.ts` (113 L), `src/lib/store/payment.ts` (418 L), `src/lib/booking/service.ts` (433 L), `src/lib/domain/service.ts` (387 L), `src/lib/email/service.ts` (287 L), `src/lib/validations/{ai,booking,domain,product,subscriber}.ts` (141/108/82/81/41 L) — **3,309 lines** |
| Data layer read | `prisma/schema.prisma` (934 L), `prisma/schema.postgresql.prisma` (590 L), `prisma/seed.js` (813 L), `scripts/test-suite.js` (1,694 L), `src/lib/prisma.ts`, `src/lib/auth.ts` (for tier semantics), `src/middleware.ts`, `src/app/[username]/page.tsx` |
| Call-sites traced | 8 AI generators → `/api/ai/generate`; store checkout/webhook/refund routes; booking slots/create/cancel/reschedule routes; domain connect/verify/resolve routes; subscriber confirm/unsubscribe routes; product/link/tier gates |
| Method | Full read of every file in scope; executed read-only verification commands plus 4 purpose-written Node scripts against the live SQLite DB and Prisma runtime (schema-vs-schema diff, schema-vs-DB diff, model-usage census, before/after DB state). No source, config, or Prisma client was modified. |
| Model inventory | **47 models, 601 fields** (scalar + relation), **55 relations**, **80 `@@index` declarations**, **28 unique constraints**, `onDelete`: **46 Cascade / 6 SetNull / 1 Restrict** |
| Data-shape smells | **14 `String` JSON blobs**, **9 models with zero runtime references in `src/`**, **4 dangling in-model FK columns** (no `@relation`), **15 models / 31 scalar fields missing from the PostgreSQL schema** |

Severity legend (same as report 01): **critical** = unauthenticated takeover / money loss · **high** = trust boundary or paid feature actually broken · **medium** = real defect under specific conditions · **low** = correctness/hygiene.

### Executive summary

This is a **demo-grade product with a genuine UI and a mostly simulated backend**. The code compiles and the database is coherent, but most of the monetized value propositions are not implemented end-to-end:

- **AI:** 5 of 8 generators *can* call Gemini/OpenAI; 3 (theme recommendation, profile audit, CTA) never call any model and are static template pickers. With the shipped `.env` (all AI keys empty) **all 8 return deterministic canned text** while still recording fabricated token counts, costs and model names in the database. Monthly quota rolls over incorrectly and is subject to a check-then-increment race.
- **Payments:** real Stripe code exists for one-time product checkout, but there is **no subscription billing at all** (no `mode:"subscription"` call anywhere), no platform fee/payout code, and `Subscription.plan` — the value that gates the store — is **never written by any code path**. Without `STRIPE_SECRET_KEY` (the shipped state) paid checkouts create a `PENDING` order and return `success: true` — a fake order. The webhook verifies signatures only when a webhook secret exists; otherwise it **accepts unsigned JSON** (also raised in 01).
- **Booking:** slot generation is **UTC-only** — the `viewerTimezone` argument, `AvailabilityRule.timezone` and `Profile.bookingTimezone` are ignored, so display is wrong for every non-UTC creator/visitor. Double-booking protection is a read-then-insert check with no DB constraint; it happens to be OK on SQLite (serialized writes) but is **not safe on the PostgreSQL target**. Google Meet links are fabricated random strings; booking e-mails are rows in a table marked `SENT` but never sent; paid appointment types are never charged (`isPaid` semantics inverted).
- **Custom domains:** DNS lookups are real (`dns/promises`), but **verification can be bypassed by any domain whose hostname contains `"test"` or `"demo"`** (e.g. `latest.com`, `testimonial.io`) or by the `SIMULATE_DNS_VERIFICATION` env flag; TLS/SSL is **entirely simulated** (status set to `ACTIVE` with no certificate issued), and the `REMOVED` audit event is cascade-deleted by the same transaction that deletes the domain.
- **E-mail:** only Resend (or a simulation that writes `SIMULATED` rows and returns success). With no `RESEND_API_KEY` — the shipped state — **double opt-in confirmation e-mails are never delivered**, so no subscriber can ever become `ACTIVE`; there is **no newsletter/campaign sending feature at all**, only transactional confirmation/welcome e-mails. Booking e-mails use a different, non-functional path (`BookingNotification` rows only).
- **Data layer:** the SQLite schema is coherent and the generated client/DB are in sync. But `prisma/schema.postgresql.prisma` is a **stale Phase-01-era snapshot**: 32 vs 47 models and 31 missing scalar fields — running the app against PostgreSQL would break AI, store, newsletter, booking and domain verification with `PrismaClientValidationError`. Seed data is partly fabricated (`salesCount: 142` with zero orders) and `/api/audience` **invents realistic-looking subscribers whenever the real list is empty**.
- **Actual size of the gap:** 47 models are declared, but **9 are never read or written by application code** and 3 more are only used by `seed.js`; "Enterprise" (teams, API keys, webhooks), marketplace reviews, in-app notifications and moderation actions are schema-only.

Verification status (details in 05): `npx tsc --noEmit` → **exit 0, 0 errors** (confirmed twice, including a forced non-incremental run); `node scripts/test-suite.js` → **exit 0, 202/202 assertions pass**; `npm run lint` → **exit 0 but no linting is performed** (no ESLint config/dependency; `next lint` blocks on an interactive setup prompt). The test suite is **self-referential** — it re-implements the schemas/logic it tests instead of importing `src/lib` — so the 202 green assertions do **not** validate the defects in this report.

---

## 1. What is real vs simulated/mock

This is the key table for judging the product. "Live in this workspace" reflects the repository `.env` (AI keys empty, Stripe keys empty, no Resend key, `SIMULATE_DNS_VERIFICATION` unset).

| Capability | Advertised / expected | What the code actually does | Live in this workspace? | Evidence |
|---|---|---|---|---|
| AI text generation (bio/headline/description/link-title/content) | LLM calls to Gemini/OpenAI | Calls an LLM **only if** `GEMINI_API_KEY`/`OPENAI_API_KEY` present; otherwise deterministic hard-coded synthesizers; output labelled `provider: "biospace-neural-engine", model: "creator-v2.1"` | **Simulated** (no API keys) → template text | `src/lib/ai/provider.ts:51-68, 161-190, 181-189` |
| AI theme recommendation / profile audit / CTA generator | "AI Design Studio", "AI audit" | **Never calls any model.** Pure static arrays / rule heuristics, but labels the result with the *configured* provider/model if a key exists | **Simulated always** | `src/lib/ai/provider.ts:402-412, 431-441, 446-457` |
| AI token & cost accounting | Real usage from provider billing metadata | **Hard-coded token counts** (e.g. 280, 240, 220…) and cost from a static price table; provider `usage`/`usageMetadata` ignored | **Fake numbers persisted** | `src/lib/ai/provider.ts:169-170, 217-218, 264-265`; `src/lib/ai/config.ts:65-69` |
| AI monthly quota | 10 / 200 / 1000 per FREE/PRO/BUSINESS | Check-then-generate-then-increment (TOCTOU); month rollover increments without reset; only `/api/ai/generate` consumes quota | **Enforced but buggy** | `src/lib/ai/usage.ts:16-43, 80-97`; `src/app/api/ai/generate/route.ts:47-57` |
| Stripe one-time product checkout | Real card charge, order fulfilment | Real `stripe.checkout.sessions.create` **only when** `STRIPE_SECRET_KEY` exists; free products auto-`COMPLETED`; otherwise creates `PENDING` "preview" order and returns `success: true` | **Simulated/offline** (keys empty) | `src/lib/store/payment.ts:68-103, 110-134, 137-204` |
| Stripe webhook | Signature-verified idempotent fulfilment | Signed if `STRIPE_WEBHOOK_SECRET` set; **else parses raw JSON with no signature**; idempotent via unique `PaymentEvent.stripeEventId`; no `payment_status`/amount reconciliation | **Not exercised** (no key); insecure fallback | `src/lib/store/payment.ts:223-259, 262-311, 349-359` |
| Refunds | Real Stripe refund + ledger | Calls `stripe.refunds.create` when configured & `paymentIntentId` exists; otherwise just flips status to `REFUNDED` in DB (fake refund), including for `PENDING`/free orders | **Simulated** | `src/lib/store/payment.ts:365-417` |
| Subscription billing (PRO/BUSINESS) | Stripe subscriptions, upgrade/downgrade, invoices | **No subscription checkout, no webhook subscription events, no `Subscription` writer.** Tier comes from `User.subscriptionTier`, set only by admin PATCH or seed | **Fake** — plan exists as a DB column only | `src/app/api/admin/users/route.ts:56-67` (only writer found); no `mode:"subscription"` anywhere |
| Platform fee / payouts | 9 % / 4 % / 0 % platform fee, creator payouts | `STORE_SUBSCRIPTION_LIMITS.feePercent` is declared and **never read** outside `config.ts`; no payout/transfer code | **Not implemented** | `src/lib/store/config.ts:73-92` (no other references) |
| Product limits per tier | 3 / 25 / 1000 products | Gate reads `Subscription.plan` (table never populated) → **everyone is capped at 3**; `allowFeatured` not enforced | **Broken** (and wrong source of truth) | `src/app/api/products/route.ts:26-30, 55-59, 98, 148` |
| Booking slot generation & timezones | Creator timezone + viewer timezone conversion | `viewerTimezone` parameter ignored; rules' `timezone` ignored; all math in `Date.UTC`; slot label hard-coded `"UTC"` | **UTC-only fake conversion** | `src/lib/booking/service.ts:71-76, 90-93, 149-185` |
| Double-booking protection | Atomic/unique reservation | Read-then-insert inside an interactive transaction; **no unique constraint, no `SELECT … FOR UPDATE`, no exclusion constraint** | OK on SQLite, **unsafe on PostgreSQL** | `src/lib/booking/service.ts:40-65, 209-235`; `prisma/schema.prisma:880-916` |
| Google Meet auto-provisioning | Real Google Calendar/Meet event | Random fabricated `https://meet.google.com/<hex>-<hex>-<hex>` URL; `GOOGLE_MEET_AUTO_PROVISION` never read | **Fake link** | `src/lib/booking/service.ts:242-245` |
| Booking e-mails | Confirmation/e-mail to attendee & creator | Only `BookingNotification` rows with `status: "SENT"`; no `sendEmail` call from booking code | **Never sent** | `src/lib/booking/service.ts:277-299` |
| Paid appointment types | Charge for paid bookings | `isPaid: appointmentType.price === 0` (inverted); no checkout for bookings; `paymentReference` never written; dashboard "revenue" can only ever be 0 | **Not implemented** | `src/lib/booking/service.ts:253-266`; `src/app/api/bookings/route.ts:85-87` |
| Custom-domain DNS ownership check | TXT/CNAME proof of control | **Real DNS lookups** (`dns/promises`), but auto-pass if hostname contains `"test"`/`"demo"` or `forceVerify`, and success = `TXT **OR** CNAME/A` | **Real lookups, bypassable** | `src/lib/domain/service.ts:196-206, 208-250` |
| SSL/TLS provisioning | ACME / Vercel certificate issuance | Sets `status: ACTIVE, sslStatus: ACTIVE` immediately; comment admits "Simulate/Call Provider SSL issuance" | **Simulated** | `src/lib/domain/service.ts:252-298` |
| Custom-domain routing | Host-based multi-tenancy | Middleware rewrites `/` → `/{hostname}`; profile page resolves `CustomDomain.status=ACTIVE`; only works for the root path | **Real (limited)**; seed domain is `ACTIVE` without verification | `src/middleware.ts:47-59`; `src/app/[username]/page.tsx:24-36, 90-116` |
| Transactional e-mail delivery | Resend / SMTP | Resend REST call if key present; otherwise writes `EmailDeliveryLog.status="SIMULATED"` and **returns success**; no SMTP implementation | **Simulated** (no key) | `src/lib/email/service.ts:11-13, 24-93` |
| Newsletter / campaign sending | "Email Marketing & Newsletter Delivery" | **No broadcast/campaign code exists.** Only double opt-in confirmation, welcome, unsubscribe and creator-notification e-mails | **Not implemented** | `src/lib/email/service.ts` (4 templates); `src/app/api/audience/route.ts` is GET-only |
| Audience list | Real subscribers | Built from `Order` e-mails + `AnalyticsEvent(type=NEWSLETTER_SIGNUP)`, not from `Subscriber`; returns **3 fabricated subscribers with real-looking e-mail addresses** when empty | **Partly fake** | `src/app/api/audience/route.ts:13-52, 54-82` |
| Analytics | View/click time-series | `AnalyticsEvent` is the only live source; `ProfileView`, `LinkClick`, `DailyStatistics` models are **never used** | **Real (single source), dead duplicates** | model-usage census (§9.3) |
| File upload | Managed media storage | Writes to `public/uploads` (not durable on serverless) or **falls back to base64 data-URL persisted in DB columns**; anonymous uploads allowed (user variable unused); SVG accepted | **Real but unsafe/leaky** | `src/app/api/upload/route.ts:6-12, 18-19, 52-78` |
| Teams / API keys / webhooks / marketplace reviews / notifications / moderation actions | "Enterprise" features | Schema exists; **zero runtime references** (seed-only for Team/ActivityLog/SocialAccount) | **Schema-only** | §9.3; `prisma/schema.prisma:613-701` |

---

## 2. AI subsystem (`src/lib/ai/*`)

### 2.1 Configuration and provider selection

- Model catalogue: `gemini-2.5-flash` and `gpt-4o-mini` with token prices (`src/lib/ai/config.ts:12-29`); `${DEFAULT_AI_CONFIG}` at `:31`. `AIProvider` type includes `"anthropic"` (`:1`) but **no anthropic branch exists** anywhere — dead type, dead config.
- `getActiveAIProvider()` (`src/lib/ai/provider.ts:51-68`): honours `AI_PROVIDER` only for OpenAI; falls back to Gemini when its key is non-empty; requires key length > 10. It never validates the key, so placeholder keys from `.env.example` (`"sk_live_..."`) would pass the check and produce live API calls that fail.
- In the shipped environment `GEMINI_API_KEY` and `OPENAI_API_KEY` are empty, so **every AI request takes the fallback path**.

### 2.2 Execution, retries, fallbacks

- `fetchWithRetry()` (`provider.ts:31-46`): retries network errors and HTTP ≥ 500 only, 2 retries with 1 s/2 s backoff. **No handling of 429 (rate limit), no timeout/`AbortSignal`** — a hung provider request hangs the route until the platform timeout.
- `executeLLMPrompt()` (`provider.ts:74-138`): Gemini (`:79-105`) and OpenAI (`:106-131`) JSON-mode calls; all non-OK responses silently become `null`, so 400/401/403 misconfiguration is indistinguishable from "no key" and always degrades to templates.
- 5 generators try the LLM first and fall back to deterministic synthesizers: bio `:161-189`, headline `:209-236`, description `:256-283`, link title `:302-329`, content improver `:346-377`.
- 3 generators **never call the LLM**: `recommendAIThemes` `:402-412`, `auditAndOptimizeProfile` `:431-441`, `generateAICTAs` `:446-457`. When a key is present they still return `provider: getActiveAIProvider()?.provider` (`:409-410, 438-439, 454-455`), i.e. the DB records "gemini" for a request that never touched Gemini. When no key exists they record the invented provider/model `"biospace-neural-engine" / "creator-v2.1"` (`:186-187, 233-234, 280-281, 326-327, 373-374`).
- Prompt construction interpolates user-controlled fields (name, profession, bio, URL, text) with no delimiting/sanitisation (`:147-157, 199-207, 246-254, 293-300, 338-344`). Injection risk is contained (parsed as JSON, missing shapes fall back), but there is no moderation/defence layer.

### 2.3 Quota, accounting and known bugs

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| AI-1 | **high** | **Month-rollover quota never resets.** `recordAIGeneration` upserts `{ period: current, generationCount: { increment: 1 } }` even when the stored row belongs to a previous period. `checkUserAILimit` treats a stale period as `used = 0`, so the first generation of a new month adds to *last* month's count. A user who used their full PRO quota in October is immediately over quota in November (blocked for the whole month); a light user carries a stale count forever. | `src/lib/ai/usage.ts:26-33, 80-97` |
| AI-2 | **high** | **Quota race (TOCTOU).** Route checks the limit, generates, then increments; N concurrent requests all pass the check. There is no atomic counter, reservation, or negative-balance guard. | `src/app/api/ai/generate/route.ts:47-57, 107-119`; `src/lib/ai/usage.ts:16-43, 48-100` |
| AI-3 | medium | **Fabricated token/cost accounting** (hard-coded constants; provider usage metadata ignored) — dashboards and future billing are based on fiction. | `provider.ts:169-170` etc.; `config.ts:65-69` |
| AI-4 | medium | **Misattributed provider/modelfor 3 generators** (recorded as configured provider although no call is made); invented provider/model names recorded for fallbacks. | `provider.ts:405-411, 434-440, 449-455, 181-189` |
| AI-5 | medium | **Settings ignored.** `AISettings.preferredTone/defaultProvider/preferredLanguage` are only displayed by `getAIUsageStats` (`usage.ts:116-131`); generation always uses the request payload + env config. The "custom brand voice" promise is not wired. | `usage.ts:105-132` (no generator reads settings) |
| AI-6 | medium | **Failures are never recorded.** The API catch-all returns 500 and writes no `AIGeneration(status:"FAILED")` row, so failure analytics/audit are impossible; Zod validation errors also become 500 instead of 400. | `src/app/api/ai/generate/route.ts:62-105, 137-143` |
| AI-7 | low | `getAIUsageStats.totalGenerationsCount` counts all-time rows while the quota is period-scoped — the UI mixes incompatible numbers. | `usage.ts:105-118` |
| AI-8 | low | `fetchWithRetry` retries POSTs on network error (idempotency unsafe for metered providers) and has no timeout. | `provider.ts:31-46` |

`/api/ai/apply` (`src/app/api/ai/apply/route.ts:12-124`) applies arbitrary client-supplied `payload` without schema validation and consumes no quota; `generationId` ownership is checked only in a `.catch(() => {})` silent update (`:109-114`).

---

## 3. Digital store / payments (`src/lib/store/*`)

### 3.1 Checkout flow as implemented

1. Load product + profile (`payment.ts:43-60`), reject disabled products (`:54-60`).
2. **Free product** (`totalPrice === 0`, `:68-103`): creates an order already `COMPLETED`, an `OrderItem`, increments `Product.salesCount`, returns download URL. No `PaymentEvent`, no Stripe.
3. **Paid + no Stripe** (`:110-134`): creates a `PENDING` order with `metadata: {"mode":"preview_unconfigured_gateway"}` and returns `success: true, configured: false` + warning. The order is fake; the UI may treat it as a successful checkout (it receives `success: true`).
4. **Paid + Stripe** (`:137-204`): creates `PENDING` order → creates a `mode:"payment"` Checkout Session (`:159-187`) → stores `stripeSessionId`. On Stripe error the order is marked `FAILED` (`:205-217`).
5. **Webhook** (`:223-360`): optional signature verification; idempotency via unique `PaymentEvent.stripeEventId`; on `checkout.session.completed` flips the order to `COMPLETED`, increments sales, creates an `OrderItem`, writes a `PaymentEvent` (`:262-311`).
6. **Refund API** (`:365-417`): creator-only via order→profile→userId ownership (`:373-383`), rejects already-refunded (`:385-387`), calls Stripe when possible (`:390-401`), then updates the DB.

### 3.2 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| PAY-1 | **critical** | **Unsigned webhook accepted.** `if (stripe && webhookSecret) verify else JSON.parse(rawBody)`. With `STRIPE_SECRET_KEY` set but `STRIPE_WEBHOOK_SECRET` missing (a common partial-config), any anonymous `POST /api/store/webhook` with `{"id":"evt_x","type":"checkout.session.completed","data":{"object":{"client_reference_id":"<order id>","amount_total":0}}}` marks an order `COMPLETED` and increments sales, with no payment. Also raised in 01 (C-level). Shipped `.env` has **both** keys empty, in which case the store is in preview mode (fake orders) rather than exploitable — but the code path is one env var away from a free-goods hole. | `src/lib/store/payment.ts:232-246, 262-311`; `src/app/api/store/webhook/route.ts:4-11` |
| PAY-2 | **high** | **No Stripe idempotency key** on `checkout.sessions.create` and no dedupe of repeated checkout submissions → double orders/sessions on double-click, retry or network replay; `orderNumber` collision (`ORD-<6>-<4>`) returns an unhandled 500. | `payment.ts:65, 137-149, 159-187` |
| PAY-3 | **high** | **Redirect URLs derived from request `origin`/client `successUrl`/`cancelUrl`** → host-header/origin injection: after paying, Stripe redirects the customer to an attacker-controlled URL. | `payment.ts:107, 151-156`; `src/app/api/store/checkout/route.ts:11`; `src/lib/validations/product.ts:68-69` |
| PAY-4 | **high** | **No `session.payment_status`/amount/currency reconciliation.** Completion is keyed only on `client_reference_id`; a session created for a different amount, or an unpaid session (async methods), still completes the order. | `payment.ts:262-311` |
| PAY-5 | medium | **Preview orders + fake refunds.** Unconfigured Stripe writes `PENDING` orders (can be shown in "orders"); `refundStoreOrder` marks any order (including `PENDING`/`FAILED`) `REFUNDED` without a Stripe refund when there is no `paymentIntentId`, with no idempotency key/refund record. | `payment.ts:110-134, 385-410` |
| PAY-6 | medium | **Quantity under-recorded.** Checkout uses `quantity` for the line item, but the webhook creates `OrderItem.quantity: 1` and increments `salesCount` by 1 regardless; free-product path increments by `quantity`. Revenue/sales counters are inconsistent for quantity > 1. | `payment.ts:173-176, 282-296, 90-93` |
| PAY-7 | medium | **Platform fee never charged; no payouts.** `feePercent` 9/4/0 (`store/config.ts:80-90`) has zero references outside the config file; no Stripe `application_fee`/`transfer` code. The monetization model is marketing-only. | `src/lib/store/config.ts:73-92` |
| PAY-8 | **high** | **Wrong tier source in the store.** `GET/POST /api/products` read `Subscription.plan` (`products/route.ts:26-30, 55-59`) but **no code ever creates/updates `Subscription`** (census: 2 references, both `findUnique`). Result: every creator is treated as FREE (max 3 products) even when `User.subscriptionTier = PRO`; PRO users cannot use the 25-product limit they paid for, while the rest of the app gates on `user.subscriptionTier`. Additionally `allowFeatured=false` for FREE is never enforced (`:98, :148`). | `src/app/api/products/route.ts:26-30, 55-59, 98, 148`; `src/lib/store/config.ts:73-92` |
| PAY-9 | low | Order metrics double-subtract refunds: `grossRevenue` only sums `COMPLETED`, then `netRevenue = gross - totalRefunded` where refunded orders are already excluded from gross. | `src/app/api/store/orders/route.ts:29-44` |
| PAY-10 | low | `charge.refunded` sets the whole order `REFUNDED` even for partial refunds (no `partially_refunded` state) and never decrements `salesCount`; multiple partial refunds overwrite `refundedAmount`. | `payment.ts:313-347` |
| PAY-11 | low | `isStripeConfigured` accepts any `sk_` prefix (including example placeholders) and Stripe API version is pinned to `"2024-12-18.acacia"` behind `as any` (`stripe@23`); both are upgrade/runtime traps. | `payment.ts:4-13` |

---

## 4. Booking system (`src/lib/booking/service.ts`)

### 4.1 Slot generation — timezone is a lie

- Signature accepts `viewerTimezone` (`service.ts:75`) and the public route forwards `?timezone=` (`src/app/api/bookings/slots/route.ts:13, 30`) — **the value is never read**.
- Availability rules are fetched ignoring `AvailabilityRule.timezone` (`:96-103`); rule start/end strings are applied directly with `Date.UTC` (`:149-154`); the target date is parsed as UTC midnight (`:90-93`) and the day window is UTC (`:134-135`).
- `formattedTime` is **hard-coded** to `" HH:MM - HH:MM UTC"` (`:169-179`).
- Default rules (when a creator has none at all, Mon–Fri) copy `profile.bookingTimezone` into the synthetic rule (`:105-123`) but the loop never converts it.
- **Consequence:** a creator in `America/New_York` with "09:00–17:00" publishes 09:00–17:00 **UTC** slots; a visitor in `Asia/Tashkent` sees UTC labels. DST is ignored. The advertised per-creator timezone is decorative. The test suite stores a non-UTC timezone but never converts any slot (`scripts/test-suite.js:1378-1382`), so this is untested.

### 4.2 Conflict protection and booking lifecycle

- `checkBookingConflict` (`:40-65`) reads overlapping `CONFIRMED`/`RESCHEDULED` bookings inside the caller's transaction.
- `createBooking` (`:193-303`) runs it in an interactive `$transaction` and then inserts. On SQLite writes are serialized, so the demo behaviour is correct; on PostgreSQL (the declared production target) **two concurrent transactions under READ COMMITTED both see no conflict and both insert** — no `SELECT … FOR UPDATE`, no serializable isolation, no DB exclusion/unique constraint (`prisma/schema.prisma:880-916` has only single-column indexes). This is the classic double-booking race and the code's claim of "strict transaction locking" is overstated.
- **No availability validation on create:** `startTime` is accepted whenever it parses (`:204-207`); there is no check that it is in the future, inside a rule window, aligned to the slot grid, or not within buffer. A public client can book 03:00 on a Sunday in the past.
- **Buffer ignored on write:** `stepMs = duration + buffer` only controls candidate spacing (`:129-131, 183`); `endTime` is `startTime + duration` (`:232`) and conflict checks never expand by buffer, so off-grid bookings can violate the configured buffer.
- Reschedule (`:367-432`) re-checks conflicts excluding itself but has the same missing constraints and adds no availability/past checks; it sets `status:"RESCHEDULED"` and never touches `rescheduledFromId` (declared at `schema.prisma:903`, no relation, never written).
- Cancel (`:308-362`) compares the token with `!==` (not constant-time, minor) and allows cancelling past/`COMPLETED` bookings.

### 4.3 Fakes in the booking domain

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| BK-1 | **high** | **Viewer/creator timezone ignored** — every slot is UTC; `AvailabilityRule.timezone` and `Profile.bookingTimezone` have no effect. Paid "scheduling in your timezone" promise is broken. | `service.ts:71-76, 96-103, 134-179`; route `bookings/slots/route.ts:13, 30` |
| BK-2 | **high** | **Double-booking protection is not DB-enforced** and does not hold on PostgreSQL (target production DB). `schema.postgresql.prisma` has no Booking model at all; SQLite schema has no constraint. | `service.ts:40-65, 209-235`; `prisma/schema.prisma:880-916` |
| BK-3 | medium | **Google Meet links are fabricated** random hex strings; `GOOGLE_MEET_AUTO_PROVISION` is dead env config. Attendees get a non-functional URL. | `service.ts:242-245`; `.env.example` (`GOOGLE_MEET_AUTO_PROVISION`) has no reader |
| BK-4 | medium | **Booking e-mails are never sent.** Only `BookingNotification` rows with `status:"SENT"`; the email service is not imported by booking code. | `service.ts:277-299` |
| BK-5 | medium | **Paid bookings are never charged, and `isPaid` is inverted:** `isPaid: appointmentType.price === 0` (free = paid, paid = unpaid), no payment step exists, `paymentReference` never written; dashboard revenue logic can therefore never report paid-session income. | `service.ts:253-266`; `src/app/api/bookings/route.ts:85-87`; `schema.prisma:897-898` |
| BK-6 | medium | **No booking-window/availability validation on create/reschedule**; public API accepts arbitrary times (past, out-of-hours, off-grid). | `service.ts:204-235, 370-406`; `src/app/api/bookings/route.ts:108-128` |
| BK-7 | low | Booking is not gated by plan at all (appointment types can be created by FREE users in unlimited numbers) while other premium features are gated; inconsistent monetization. | `src/app/api/bookings/types/route.ts:66-117` (no tier check) |
| BK-8 | low | `bookingTimezone` accepted as arbitrary string (no IANA validation) and `Profile.bookingEnabled=false` is not checked by `generateAvailableSlots` (only the booking POST route checks it). | `src/lib/validations/booking.ts:95-100`; `service.ts:71-84`; `src/app/api/bookings/route.ts:123-125` |

---

## 5. Custom domains & DNS (`src/lib/domain/service.ts`)

### 5.1 Lifecycle as implemented

1. `connectCustomDomain` (`:76-148`): requires `userTier ∈ {PRO, BUSINESS}` (`:82-86`), normalises/validates the hostname, rejects a domain already registered to another profile (`:91-106`), generates a `biospace-verify-<32 hex>` token, and creates `CustomDomain(PENDING)`, a `DomainVerification` challenge (72 h expiry) and a `DomainEvent(CREATED)` in one transaction (`:112-147`).
2. `verifyCustomDomainDNS` (`:153-327`): sets `VERIFYING` + `retryCount++` (`:183-190`); either **simulates success** (`:196-206`) or performs real DNS lookups: TXT at `_biospace.<domain>` (`:208-222`) and CNAME for subdomains / A record for apexes (`:224-247`).
3. `isVerified = txtFound || cnameFound` (`:250`). On success the code sets `PROVISIONING_SSL` (`:254-263`) and then immediately `ACTIVE` + `sslStatus: "ACTIVE"` (`:276-290`) — **no certificate is ever issued**; the comment on `:274-275` admits this is simulation.
4. `resolveDomainProfile` (`:365-387`) maps `ACTIVE` domains to the profile for middleware/profile-page routing.

### 5.2 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| DOM-1 | **high** | **Verification bypass by hostname substring.** `isSimulation = forceVerify \|\| SIMULATE_DNS_VERIFICATION==="true" \|\| domain.includes("test") \|\| domain.includes("demo")`. Any domain whose name contains those substrings (e.g. `testimonial.io`, `latest.com`, `demo-hub.dev`) is marked TXT+CNAME verified **without any DNS lookup**, goes `ACTIVE`, and permanently occupies the globally-unique `CustomDomain.domain`. Anyone can therefore claim domains they do not control and deny them to the real owner. | `src/lib/domain/service.ts:196-206` |
| DOM-2 | **high** | **Ownership proof is `TXT OR CNAME/A`.** A CNAME whose target merely contains `"biospace.com"` (`:225-236`) or an apex A record equal to the platform IP (`:238-243`) suffices; a domain previously pointed at BioSpace infrastructure (former tenant, agency, wildcard) can be claimed without the TXT token. There is no re-verification after activation and no periodic re-check. | `service.ts:208-250` |
| DOM-3 | medium | **SSL is simulated.** Status jumps to `ACTIVE`/`sslStatus: ACTIVE` with no ACME/Vercel call; the UI will claim a certificate is live while none exists. | `service.ts:252-298` |
| DOM-4 | medium | **`REMOVED` audit event is cascade-deleted.** `removeCustomDomain` transacts `create DomainEvent(REMOVED)` + `delete CustomDomain`; `DomainEvent.domain` has `onDelete: Cascade` (`schema.prisma:254`), so the audit row disappears with the domain — removal history is unrecorded. | `service.ts:332-360`; `prisma/schema.prisma:251-262` |
| DOM-5 | medium | **Verification challenge is never consumed/updated.** `expiresAt` is stored but never checked; `DomainVerification.status` stays `PENDING` forever (only created at `:126-135`); `retryCount` is unbounded, with no rate limiting or backoff. | `service.ts:126-135, 183-190, 208-250` |
| DOM-6 | medium | **Admin `FORCE_VERIFY` bypasses DNS entirely** (`verifyCustomDomainDNS(id, undefined, true)`) — an admin action instantly activates any domain, with only the generic admin audit row; risky capability (no ownership proof, no domain-event trail). | `src/app/api/admin/domains/route.ts:140`; `service.ts:196-206` |
| DOM-7 | medium | **`VERIFIED` state never persisted** although it is listed in the enum and UI (PENDING→VERIFYING→PROVISIONING_SSL→ACTIVE); monitoring/queries on `VERIFIED` will never match. | `service.ts:252-290`; `src/lib/validations/domain.ts:3-11`; `src/app/dashboard/domains/page.tsx:189-196` |
| DOM-8 | low | **`isApexDomain` = "exactly 2 labels"** misclassifies multi-label public suffixes (`example.co.uk` → treated as apex, asked for an A record, verification likely fails). No count limit on domains per profile (unbounded `CustomDomain[]`). | `src/lib/validations/domain.ts:49-52`; `schema.prisma:86, 209-233` |
| DOM-9 | low | Suspended/banned creators still serve their public profile: `[username]/page.tsx` checks `isPublished` only (`:118-120`), not `User.isSuspended/isBanned`; domain resolution likewise only checks domain status + `isPublished`. | `src/app/[username]/page.tsx:118-120`; `service.ts:382-386` |
| DOM-10 | low | `resolveDomainProfile` route is public and enumerates which domains exist (`404` vs `200`), an information leak; accepts arbitrary `?domain=` without rate limiting. | `src/app/api/domains/resolve/route.ts:5-38` |

In this workspace `SIMULATE_DNS_VERIFICATION` is unset, so **real DNS lookups are performed** (the feature is not globally mocked) — but SSL, activation and the test/demo bypass are simulated.

---

## 6. E-mail subsystem (`src/lib/email/service.ts`)

### 6.1 Provider abstraction

- `sendEmail` (`:19-93`) has exactly two transports:
  1. **Resend REST API** when `RESEND_API_KEY` is truthy (`:25-76`), logging `EmailDeliveryLog(provider:"resend", status:"DELIVERED"|"FAILED")` (`:47-57, 62-72`);
  2. **Built-in simulation** otherwise (`:78-93`): writes `provider:"biospace_mail", status:"SIMULATED"` with a fake `messageId` and **returns `success: true`**.
- `isEmailProviderConfigured()` requires the key to start with `re_` (`:11-13`), but `sendEmail` checks only truthiness (`:25`) — inconsistent; any non-empty key attempts the live API. The `provider` column comment lists `smtp` (`schema.prisma:823`) but **no SMTP implementation exists**.
- The four templates (confirmation `:98-156`, welcome `:161-216`, unsubscribe `:221-249`, creator notification `:254-286`) are HTML-only, inline-styled, synchronous, with **no retries, no timeouts, no plain-text alternative, and no `List-Unsubscribe`/one-click (RFC 8058) headers**; the only unsubscribe affordance is a body link (`:200`).

### 6.2 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| EM-1 | **high** | **Simulated delivery reports success.** With the shipped `.env` (no `RESEND_API_KEY`) every e-mail is "sent" with `success:true` + fake message ID; the double opt-in link in that e-mail is therefore never delivered, so **no subscriber can ever reach `ACTIVE`** and the newsletter feature is dead in practice. | `email/service.ts:78-93`; `src/app/api/subscribers/route.ts:181-190` |
| EM-2 | **high** | **No newsletter/campaign sending at all.** Only transactional flows exist; `/api/audience` is GET-only and its list is not the `Subscriber` table. "Email Marketing & Newsletter Delivery" (schema §12, dashboard Audience page) has no send path. | `src/app/api/audience/route.ts:5-87` (GET only); `src/lib/email/service.ts` (4 transactional templates only) |
| EM-3 | medium | **Booker/creator booking e-mails never use this service** (see BK-4); e-mail is wired only into subscriber flows. | `service.ts` booking; `email/service.ts` import graph |
| EM-4 | medium | **No rate limiting / token hygiene on public subscribe.** Every POST creates a new `EmailVerificationToken` (24 h) and triggers a confirmation e-mail; previous tokens are not invalidated and there is no resend throttle → arbitrary e-mail address can be bombed; confirmation endpoint does not check `usedAt` (token replay within 24 h). | `src/app/api/subscribers/route.ts:150-190`; `src/app/api/subscribers/confirm/route.ts:18-75` |
| EM-5 | medium | **E-mail body injection.** Creator-controlled `displayName`/`username` and subscriber e-mail are interpolated into raw HTML without escaping (`:124-127, 235, 273`); confirmation-result page echoes DB values into raw HTML (`confirm/route.ts:126-131`). Allows HTML/phishing content in signed-adjacent e-mails. | `email/service.ts:110-147, 174-207, 262-278` |
| EM-6 | low | `appUrl` for links is taken from the request `Origin` header (`subscribers/route.ts:180`, `confirm/route.ts:78`, `subscribers/[id]/resend/route.ts:44`) → attacker-controlled `Origin` yields confirmation links on an attacker domain (token theft). | routes above |
| EM-7 | low | No bounce/complaint handling: `Subscriber.status` supports `BOUNCED` (`validations/subscriber.ts:3-8`) but nothing ever sets it; `EmailDeliveryLog.status` default is `"SENT"` while code writes `DELIVERED/FAILED/SIMULATED`. | `schema.prisma:816-832`; `email/service.ts:53-87` |

---

## 7. Validation schemas (`src/lib/validations/*`)

| File | What it covers | Gaps relevant to business behaviour |
|---|---|---|
| `ai.ts` (141 L) | 8 generator input schemas, tone/language/type enums, master request (`:127-130`) | Only shape validation; `data` is `z.record(z.any())` at the envelope level and is re-parsed per type. Counts capped 1–5. No moderation/output schema. `ProfileOptimizeInput.username` required although not used (`:98`). |
| `booking.ts` (108 L) | appointment type (duration 5–480, buffer 0–60, price ≥ 0, currency 3 chars, colour regex) `:26-49`; availability rules `:51-58`; weekly availability `:60-70`; create/cancel/reschedule; settings | `timezone` is a free string (no IANA check) `:57, 80, 99`; no validation that slot time is future/available (service-side gap); `customerEmail` is the only identity (no verification). |
| `domain.ts` (82 L) | normalisation (strips scheme/path/port) `:29-35`; RFC-1035 hostname + reserved list `:37-47`; connect/verify/remove/admin schemas; `DOMAIN_STATUSES` `:3-11` | `isApexDomain` naive `:49-52`; reserved list blocks `vercel.app` subdomains but not e.g. `pages.dev`/`netlify.app`; no DNS-target allowlist enforcement. |
| `product.ts` (81 L) | product CRUD (title 2–100, description ≤2500, price ≥0, URL-or-path refines) `:22-57`; checkout `:63-70`; refund `:72-75` | `successUrl`/`cancelUrl` accepted from the client and later used for Stripe redirects (`:68-69`) → open redirect; `imageUrl`/`fileUrl` accept arbitrary `data:` URLs → DB bloat; `externalUrl` accepts any string containing a dot. |
| `subscriber.ts` (41 L) | subscribe (email, consent text ≥5) `:10-19`; confirm/unsubscribe tokens; newsletter settings `:29-37` | No rate limit/honeypot fields; `consentText` defaulted, so clients can omit it and still get the default consent recorded — weak consent evidence. |
| `src/lib/validations.ts` (not in this scope but used by links) | link schema incl. URL sanitisation | Enforced only at creation/update; no DB-time guarantee. |

---

## 8. Cross-subsystem business-rule matrix

The same plan is consulted from three different places with three different results. **`user.subscriptionTier` is the only value that is actually maintained** (admin PATCH `src/app/api/admin/users/route.ts:56-67`, seed, defaults). `Subscription` (Stripe billing table) is **never written**; `getProductLimitByTier` consumes it anyway.

| Feature | Gate exists? | Source of truth used | Effective behaviour | Evidence |
|---|---|---|---|---|
| Links per plan | yes (FREE cap only) | `user.subscriptionTier` + `PlatformSettings.maxFreeLinks` | FREE capped at 10; PRO unlimited — `PlatformSettings.maxProLinks` has **zero references** in the codebase (dead config) | `src/app/api/links/route.ts:41-49` |
| Products per plan | yes (wrong source) | `Subscription.plan` (never populated) | **Everyone capped at 3** (=FREE), PRO customers too | `src/app/api/products/route.ts:26-30, 55-59` |
| Featured product | declared (`allowFeatured`) | — | **Not enforced**; FREE users can set `isFeatured=true` | `store/config.ts:73-92`; `products/route.ts:98, 148` |
| AI quota | yes | `user.subscriptionTier` | FREE 10 / PRO 200 / BUSINESS 1000, with rollover + race bugs | `ai/usage.ts:16-43, 80-97` |
| Custom domains | yes | `user.subscriptionTier` | PRO/BUSINESS only (server-side), unlimited count | `domain/service.ts:81-86` |
| PRO templates | yes | `user.subscriptionTier` | `isPro` templates require PRO; no purchase flow exists at all — `TemplatePurchase` is only read for admin stats (`src/app/api/admin/marketplace/route.ts:35-38`) and never created | `src/app/api/templates/apply/route.ts:20-24` |
| Booking | **no** | — | Any tier can create unlimited appointment types | `src/app/api/bookings/types/route.ts:66-117` |
| Platform fee | **no** | — | Declared 9/4/0 %, never charged | `store/config.ts:73-92` |
| Subscription billing | **no** | — | No checkout/subscription webhook; PRO granted only by admin | no `mode:"subscription"` anywhere |
| Effective demo identity | — | `getAuthenticatedUser` demo fallback | Unauthenticated requests act as seeded **PRO** user `alex@creator.dev`, so every PRO gate above is silently passed in this environment (see report 01) | `src/lib/auth.ts:233-241`; `prisma/seed.js:608-619` |

---

## 9. Data model audit (`prisma/schema.prisma`)

### 9.1 Inventory

47 models grouped as follows (SQLite schema, 934 lines):

| Domain | Models |
|---|---|
| Identity | `User`, `ActivityLog` |
| Profile | `Profile`, `Link`, `Collection`, `Theme`, `QRCode`, `SocialAccount`, `CustomDomain`, `DomainVerification`, `DomainEvent` |
| Analytics | `ProfileView`, `LinkClick`, `DailyStatistics`, `AnalyticsEvent` |
| Admin/moderation | `AdminAuditLog`, `Report`, `ModerationAction`, `PlatformSettings` |
| Marketplace | `TemplateCategory`, `Template`, `TemplatePurchase`, `TemplateReview` |
| Commerce | `ProductCategory`, `Product`, `Order`, `OrderItem`, `PaymentEvent`, `Subscription` |
| Enterprise | `Notification`, `SupportTicket`, `FeatureFlag`, `Team`, `TeamMember`, `APIKey`, `WebhookEndpoint` |
| AI | `AIUsage`, `AIGeneration`, `AISettings` |
| Newsletter | `Subscriber`, `SubscriptionConsent`, `EmailVerificationToken`, `EmailDeliveryLog` |
| Booking | `AppointmentType`, `AvailabilityRule`, `Booking`, `BookingNotification` |

**No Prisma `enum` is used anywhere** — all state machines (`status`, `role`, `subscriptionTier`, `type`, `locationType`, `template`) are free-form `String` columns. There are no `CHECK` constraints. Invalid states are always representable; the only protection is Zod on the way in, and several writers bypass it (seed, webhook, direct service calls).

### 9.2 Indexes, uniques, cascades

- **80 `@@index` declarations** and **28 unique constraints** (field-level `@unique` + `@@unique` blocks). Highlighted uniques: `User.email/clerkId`, `Profile.username/userId`, `CustomDomain.domain`, `PaymentEvent.stripeEventId`, `Booking.cancelToken/rescheduleToken`, `Subscriber.unsubscribeToken`, `DailyStatistics(profileId,date)`, `AvailabilityRule(profileId,dayOfWeek,startTime,endTime)`, `Team.slug`, `TeamMember(teamId,userId)`, `TemplatePurchase(userId,templateId)`.
- **`onDelete` policy** (53 owning relations): **46 `Cascade`, 6 `SetNull`, 1 `Restrict`**. There is no soft-delete pattern.
- **Cascade risks (data-loss / audit integrity):**
  - `Order.product` **Cascade** (`:527`) and `Order.profile` **Cascade** (`:525`): deleting a product or profile **erases financial order history**. `OrderItem.product` Cascade (`:553`) erases line items when a product is deleted. There is no `RESTRICT`/soft-delete guard on products with orders — `DELETE /api/products?id=` happily removes orders.
  - `AdminAuditLog.admin` Cascade (`:340`), `ModerationAction.admin` Cascade (`:375`): deleting an admin **deletes their audit trail**.
  - `Report.profile` Cascade (`:356`): removing a profile removes the abuse reports against it.
  - `DomainEvent.domain` Cascade (`:254`): the domain-removal audit entry is deleted by its own delete (DOM-4).
  - `Booking.appointmentType` **Restrict** (`:885`) is the only protective rule; the application compensates by deactivating (not deleting) appointment types that have bookings (`src/app/api/bookings/types/route.ts` DELETE handler), so `Restrict` is effectively a safety net rather than a user-facing failure.
- **Missing constraints (integrity gaps):**
  - No constraint preventing overlapping bookings (`Booking` has separate indexes on `startTime`/`endTime`, `:909-916`) — see BK-2.
  - `PaymentEvent.orderId` (`:571`), `Booking.rescheduledFromId` (`:903`), `AdminAuditLog.targetId` (`:344`), `ModerationAction.targetId` (`:380`) are **plain strings with no `@relation`/FK** → dangling references possible.
  - `SocialAccount` (`:197-207`) has no `@@unique([profileId, platform])` → duplicate accounts (seed re-runs prove it).
  - `Subscription.stripeCustomerId/stripeSubscriptionId` (`:582-583`) not unique; `Order.stripeSessionId` only indexed not unique.
  - `Booking` has no check that `endTime > startTime`; `Price/amount` are `Float` (no Decimal) → money stored as binary floats.
  - `User.role` / `subscriptionTier` / all statuses are unconstrained strings (see 9.1).
- **Dead/duplicated analytics design:** `ProfileView`, `LinkClick` and `DailyStatistics` duplicate what `AnalyticsEvent` already records; only `AnalyticsEvent` is used, the other three have zero references and `DailyStatistics` (unique per day, `:309`) is never written — any dashboard query using it would return empty.

### 9.3 JSON blobs instead of structured columns (`String`-typed, 14 fields)

| Field | Location | Use |
|---|---|---|
| `Template.stylesJson` | `schema.prisma:429` | theme style payload |
| `Product.galleryUrls` | `:496` | JSON array of image URLs |
| `Order.metadata` | `:536` | quantity / "preview_unconfigured_gateway" |
| `PaymentEvent.payload` | `:569` | full Stripe object (up to tens of KB each) |
| `CustomDomain.dnsRecords` | `:223` | cached verification log |
| `DomainEvent.metadata` | `:257` | verification log |
| `FeatureFlag.rules` | `:637` | targeting rules |
| `APIKey.scopes` | `:679` | comma string |
| `WebhookEndpoint.events` | `:694` | comma string |
| `AIGeneration.inputJson/outputJson` | `:729-730` | prompts/results |
| `ActivityLog.details`, `AdminAuditLog.details`, `Report.details` | `:52, :345, :361` | free-form details |

No JSON validation, no size limits (base64 data-URL uploads can be stored in `Profile.avatarUrl`/`Product.imageUrl`, see §1), and none of these map to PostgreSQL `jsonb` even in the PostgreSQL schema — they stay `String`. Queryability (e.g. "orders by quantity" or "domain verification failures") is lost.

### 9.4 Model usage census (static analysis of `src/**` + `prisma/seed.js`)

| Usage | Models |
|---|---|
| **Zero references** (schema-only) | `ProfileView`, `LinkClick`, `DailyStatistics`, `ModerationAction`, `TemplateReview`, `Notification`, `TeamMember`, `APIKey`, `WebhookEndpoint` |
| Seed/service only | `ActivityLog` (seed), `SocialAccount` (seed), `Team` (seed), `DomainVerification` (domain service only — never updated) |
| 2–4 references | `SubscriptionConsent`, `TemplateCategory`, `TemplatePurchase`, `Subscription`, `AISettings`, `ProductCategory`, `AIUsage`, `EmailDeliveryLog`, `BookingNotification`, `QRCode` |

Consequences: "enterprise" API keys/webhooks/teams, template reviews, in-app notifications and moderation-action records are **not implemented** despite schema and marketing pages; the `Notification` model means admin/moderation actions produce no user-visible notification; `ModerationAction` means suspensions/bans have no structured audit beyond `AdminAuditLog`.

### 9.5 Schema ↔ code spot-checks

| Schema element | Code reality | Verdict |
|---|---|---|
| `Subscription` (`:578-592`) | No create/update anywhere; read once for a product limit (`products/route.ts:26-30`) | **Dead table used as a wrong gate** |
| `Booking.paymentReference` (`:898`) | Never written; no booking payment flow | Dead field |
| `Booking.rescheduledFromId` (`:903`) | Never written; no relation | Dead field |
| `Order.orderNumber` (`:523`) | Generated `ORD-…` (`payment.ts:65`), unique; no collision retry | Used, fragile |
| `Order.metadata` (`:536`) | `JSON.stringify({quantity})` / preview marker | Used as blob |
| `PaymentEvent.orderId` (`:571`) | Set by webhook (`payment.ts:305`) | Used, no FK |
| `CustomDomain.verificationTxt` (`:217`) | Generated (`domain/service.ts:109`) | Used |
| `DomainVerification.status` (`:242`) | Only `PENDING` ever written | **Stale by design** |
| `EmailDeliveryLog` (`:816-832`) | Statuses `DELIVERED/FAILED/SIMULATED`, provider `resend/biospace_mail` | Used; default `SENT` never used |
| `AIUsage.period` (`:711`) | "YYYY-MM" from server-local time (`config.ts:71-76`) | Used; rollover bug AI-1 |
| `Profile.newsletter*/booking*` (`:96-112`) | Written by settings routes; defaults changed from `true`→`false` in schema after client generation (verified runtime DMMF = `false`, DB default = `false`) | Consistent; seeded rows still carry `true` from an older default |
| `User.passwordHash` (`:20`) | Added for direct auth; present in DB and runtime client | Used by direct auth (report 01) |

### 9.6 Seed data (`prisma/seed.js`)

- Creates 10 template categories (`:5-16`) and 20 templates (`:18-538`) — real, useful catalogue.
- Creates demo users: `admin@biospace.com` (role `ADMIN`, tier `PRO`, `:594-605`) and `alex@creator.dev` (tier `PRO`, `:608-619`), and defines profile `shahuztech` (`:621-635`) with social accounts, an **`ACTIVE` custom domain `links.shahuztech.com` with no verification records** (`:647-657`), two products **with fabricated `salesCount: 142` and `: 88`** and no orders (`:660-685`), QR `downloadCount: 42` (`:711-720`), support ticket, team, feature flags.
- The live `prisma/dev.db` is **not** a pristine output of this seed: its profiles are `shahzod` / `777` (display name "Shahzod Roziqulov", bio `"Test\n"`), not `shahuztech`; this is manual/demo data layered on top, which is also why the test suite's `findFirst`-based assertions still pass. Seed re-runs would create `shahuztech` alongside them.
- **Non-idempotent despite `upsert`:** `product.createMany` has no uniqueness → every re-run duplicates products; `socialAccount.createMany` duplicates; `activityLog.create`/`adminAuditLog.create` append a new row on every run (`:638-644, :660-685, :723-741`). Demo metrics diverge from the real order ledger immediately.
- The seeded `ACTIVE` domain bypasses the verification lifecycle and is what makes custom-domain routing look "live" in demos; `User` rows get fake `clerkId`s (`:598, :612`) that cannot correspond to a real Clerk tenant.

---

## 10. SQLite vs PostgreSQL drift

`prisma/schema.postgresql.prisma` is a hand-maintained 590-line file (32 models, 383 fields, 37 index attrs, 18 uniques, 36 owning relations: 32 Cascade / 4 SetNull, no `Restrict`). It is **not** a faithful mirror; it is an earlier snapshot of the project.

| Drift | Detail |
|---|---|
| Entire models missing (15) | `AIUsage`, `AIGeneration`, `AISettings`, `AppointmentType`, `AvailabilityRule`, `Booking`, `BookingNotification`, `DomainVerification`, `DomainEvent`, `Subscriber`, `SubscriptionConsent`, `EmailVerificationToken`, `EmailDeliveryLog`, `OrderItem`, `ProductCategory` |
| Scalar fields missing (31) | `User.passwordHash` (1); `Profile` newsletter/booking fields (11); `Product` `galleryUrls,type,category,categoryId,isFeatured,viewsCount,clicksCount` (7); `Order` `orderNumber,refundedAmount,paymentIntentId,metadata` (4); `PaymentEvent.orderId` (1); `CustomDomain` verification fields `cnameTarget,verificationTxt,verifiedAt,lastCheckedAt,errorMessage,retryCount,isApex` (7) |
| Behavioral deltas | No `Booking.appointmentType` `Restrict`; no `WebhookEndpoint` fields? (present); `Order`/`Product` have no `OrderItem`; no `DailyStatistics`/`AnalyticsEvent` changes; `CustomDomain` has no verification lifecycle at all |
| Counts | 47 vs 32 models; 601 vs 383 fields; 80 vs 37 `@@index`; 28 vs 18 uniques; 53 vs 36 owning `onDelete` rules |

**Impact:** switching `DATABASE_URL` to PostgreSQL and `prisma db push`-ing this schema would silently drop the tables/columns needed by AI, the store (order items, refunds, metadata, webhook idempotency `orderId`), newsletters, booking and domain verification. `payment.ts`, `booking/service.ts`, `domain/service.ts`, `email/service.ts` and `ai/usage.ts` would all throw `PrismaClientValidationError` at runtime (the generated client is built from `schema.prisma`, the SQLite one). The PostgreSQL file should be treated as **stale and unusable** until regenerated/migrated and reconciled.

*(Verified in the other direction: the live `prisma/dev.db` contains a column for every scalar field in `schema.prisma` — 47/47 tables match; the four `Order` columns added later are simply appended at the end of the physical table. The generated client's runtime DMMF also matches `schema.prisma` including `User.passwordHash` and the `Profile` flag defaults. Only the saved copy `node_modules/.prisma/client/schema.prisma` is stale (05-Nov), which is cosmetic.)*

---

## 11. Consolidated bug register

| ID | Severity | Area | Summary | Evidence |
|---|---|---|---|---|
| PAY-1 | critical | payments | Unsigned Stripe webhook accepted when webhook secret missing → free order fulfilment | `payment.ts:232-246, 262-311` |
| AI-1 | high | AI | Quota never resets across months; carries old counts forever | `ai/usage.ts:26-33, 80-97` |
| AI-2 | high | AI | Quota TOCTOU race (check → generate → increment) | `ai/generate/route.ts:47-57, 107-119` |
| PAY-2 | high | payments | No Stripe idempotency key / duplicate checkouts; weak order number | `payment.ts:65, 137-187` |
| PAY-3 | high | payments | Stripe redirect URLs from `Origin`/client input (open redirect) | `payment.ts:107, 151-156`; `store/checkout/route.ts:11` |
| PAY-4 | high | payments | No payment-status/amount reconciliation on completion | `payment.ts:262-311` |
| PAY-8 | high | store | Product limits read dead `Subscription.plan` → everyone FREE (3 products) | `products/route.ts:26-30, 55-59` |
| BK-1 | high | booking | Timezones ignored entirely; slots are UTC-only | `booking/service.ts:71-76, 96-179` |
| BK-2 | high | booking | No DB-level double-booking protection (unsafe on PostgreSQL) | `booking/service.ts:40-65, 209-235`; `schema.prisma:880-916` |
| DOM-1 | high | domains | DNS verification bypass for any hostname containing `test`/`demo` | `domain/service.ts:196-206` |
| DOM-2 | high | domains | Ownership = TXT **or** CNAME/A; claim without token | `domain/service.ts:208-250` |
| EM-1 | high | e-mail | Simulated delivery returns success; opt-in e-mails never sent | `email/service.ts:78-93` |
| EM-2 | high | e-mail | No newsletter/campaign sending implemented | `api/audience/route.ts:5-87` |
| DOM-3 | medium | domains | SSL status faked; no certificate provisioning | `domain/service.ts:252-298` |
| DOM-4 | medium | domains | Removal audit event cascade-deleted | `domain/service.ts:332-360`; `schema.prisma:254` |
| DOM-5 | medium | domains | Challenge expiry/status never enforced or updated | `domain/service.ts:126-135, 183-190` |
| DOM-6 | medium | domains | Admin FORCE_VERIFY bypasses DNS | `api/admin/domains/route.ts:140` |
| BK-3 | medium | booking | Fake Google Meet URLs; env flag unused | `booking/service.ts:242-245` |
| BK-4 | medium | booking | Booking e-mails never sent (`SENT` is a lie) | `booking/service.ts:277-299` |
| BK-5 | medium | booking | Paid bookings never charged; `isPaid` inverted | `booking/service.ts:253-266` |
| BK-6 | medium | booking | No availability/past validation on create/reschedule | `booking/service.ts:204-235, 370-406` |
| AI-3 | medium | AI | Fabricated tokens/costs persisted | `provider.ts:169-170` etc. |
| AI-4 | medium | AI | Provider misattribution; invented provider names | `provider.ts:181-189, 405-411` |
| AI-5 | medium | AI | AISettings ignored by generators | `ai/usage.ts:105-132` |
| AI-6 | medium | AI | Failures not recorded; validation errors become 500 | `ai/generate/route.ts:62-105, 137-143` |
| PAY-5 | medium | payments | Fake refunds; refund of PENDING/FAILED orders | `payment.ts:385-410` |
| PAY-6 | medium | payments | Quantity not recorded in webhook path | `payment.ts:173-176, 282-296` |
| PAY-7 | medium | store | Platform fees/payouts not implemented (config dead) | `store/config.ts:73-92` |
| EM-4 | medium | e-mail | Token spam/replay on public subscribe | `subscribers/route.ts:150-190`; `confirm/route.ts:18-75` |
| EM-5 | medium | e-mail | HTML injection in e-mail bodies/confirm page | `email/service.ts:124-127, 235, 273` |
| DAT-1 | medium | data | PostgreSQL schema unusable (15 models / 31 fields missing) | `schema.postgresql.prisma` |
| DAT-2 | medium | data | Financial records cascade-deleted with Product/Profile | `schema.prisma:525-527, 553` |
| DAT-3 | medium | data | 9 schema-only models; 3 seed-only (features advertised as real) | §9.3 |
| DAT-4 | medium | data | Seed fabricates sales/download metrics; non-idempotent | `seed.js:660-720` |
| DAT-5 | medium | data | `/api/audience` fabricates realistic subscriber PII | `api/audience/route.ts:54-82` |
| DAT-6 | medium | data | No enums/CHECK constraints; all state machines strings | §9.1 |
| LOW | low | various | PAY-9, PAY-10, PAY-11, AI-7, AI-8, BK-7, BK-8, DOM-7..DOM-10, EM-6, EM-7, DAT-7 (`Float` money, JSON blobs, dangling FK strings, missing `SocialAccount` unique), upload storage abuse | see sections above |

Upload-specific note (data layer): `src/app/api/upload/route.ts:18-19` declares `user` but never rejects anonymous callers; `:52-78` writes to local `public/uploads` and, on failure, returns a **base64 data URL** which later gets persisted in `Profile.avatarUrl`, `Product.imageUrl`, etc. (no media table, no size cap beyond 5 MB per file). On serverless hosting this silently moves binary data into the primary database.

---

## 12. Recommendations (prioritised, minimal-change)

1. **Payments:** require `STRIPE_WEBHOOK_SECRET` (fail closed, return 5xx) and verify `payment_status`/amount/currency; add an idempotency key to `checkout.sessions.create`; stop deriving redirect URLs from `Origin`/client input; add a refund ledger table with idempotency; implement or delete `feePercent`.
2. **Store tiering:** introduce one `getEffectiveTier()` helper reading `user.subscriptionTier` everywhere (or start writing `Subscription` from real billing) and use it for products, links, AI, domains, templates; enforce `allowFeatured`.
3. **AI:** atomic quota counter (`UPDATE … SET count = count + 1 WHERE period = ?` / transaction with row lock) + reset on period change; record real provider usage; never label template fallbacks as a provider; add 429 handling/timeouts.
4. **Booking:** either implement IANA timezone conversion (Store UTC instants, convert display per rule/profile timezone) or remove the timezone fields from UI/API; enforce availability/buffer/past checks in `createBooking`; add a DB-level conflict guard (`@@unique([appointmentTypeId, startTime])` at minimum, or serializable transaction + `SELECT … FOR UPDATE` on PostgreSQL); wire `sendEmail` for booking notifications and charge paid types via Stripe (or remove the price field).
5. **Domains:** remove the `test`/`demo` substring bypass and `forceVerify` from the verification evaluator (keep an explicit admin-only tool); require TXT proof (drop CNAME/A as ownership proof), persist `VERIFIED`, enforce challenge expiry/attempt caps; implement real TLS automation or label the feature "pending"; move the `REMOVED` event to a separate transaction or stop cascading domain events.
6. **E-mail:** make `sendEmail` fail loudly when unconfigured (or clearly mark demo mode in UI); add a real campaign/broadcast path or remove newsletter marketing claims; add `List-Unsubscribe`, escaping, text parts, retries; unify `Subscriber` as the audience source.
7. **Data layer:** regenerate and reconcile `schema.postgresql.prisma` against `schema.prisma` (or delete it and generate one schema per environment from a single source), add enums/check constraints/`Decimal` for money, remove or implement dead models, make seed idempotent and stop inventing sales metrics, add page limits to `/api/audience`, `/api/store/orders` and analytics queries.

---

*All findings above are from static reading of the cited files plus read-only inspection of `prisma/dev.db` (via Prisma) and both schema files. No source, configuration, Prisma client, or database content was modified by this audit; see `05-verification.md` for the exact commands, exit codes and DB-mutation evidence (the project's own test suite did mutate `prisma/dev.db`).*
