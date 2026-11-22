# Report 03 — Marketing Site, Public Profile, Admin Panel & Auth UI

**Project:** BioSpace — Next.js 15 + React 19 link-in-bio SaaS
**Auditor:** `public-auditor` (delegated teammate, read-only scope)
**Date:** 2026-11-08
**Scope audited:** `src/app/page.tsx`; `src/app/{about,features,faq,pricing,privacy,terms,templates,contact}/page.tsx`; `src/app/not-found.tsx`; `src/app/[username]/page.tsx`; `src/app/admin/**`; `src/app/sign-in/**`, `src/app/sign-up/**`; `src/app/layout.tsx`; `src/app/globals.css`; `src/components/{marketing,layout,profile}/**`; `src/components/i18n-provider.tsx`; `src/components/language-toggle.tsx`; theme providers/toggles; `src/lib/i18n.ts`; plus the admin/Analytics/domain API routes those pages call.
**Method:** static reading of every file in scope + read-only queries against `prisma/dev.db` (row counts, distinct values). No source file was modified; this report is the only write.

---

## 0. Verdict at a glance

| Question | Verdict |
|---|---|
| Is the public profile server-rendered with real DB data? | **Yes** — async RSC page, Prisma, `notFound()` on missing/unpublished. But it queries the DB **twice per request**, has weak SEO, and its analytics pipeline is client-trusted. |
| Is the public profile URL `/@username`? | **No.** The app serves `/username`; `/@username` falls through to the same dynamic segment and 404s. All UI copy still prints `@username`, which is confusing. |
| Is analytics tracking correct and privacy-safe? | **No.** Unauthenticated client POSTs, no bot/self-view filtering, fabricated `country`/`browser`, click referrer = the profile itself, no consent, persistent localStorage ID. |
| Is the admin panel real or mock? | **Real.** Every admin section below (11 entries; 2 are alias re-exports) reads/writes real Prisma data through guarded APIs. No `Math.random`, no hardcoded arrays. Three *pockets* of synthetic data exist (auto-seeded support tickets, `proUsers × $10` MRR, hardcoded labels) — detailed in §2.2. |
| Is admin authorization enforced server-side? | **Yes, but leaky.** Server layout guard + per-route `verifyAdminSession()` exist. However the RBAC permission matrix is only used by 3 of 8 admin route files, so `SUPPORT`/`MODERATOR` can delete users/domains and rewrite platform settings. |
| Is i18n functional (uz/ru/en)? | **No — it is decorative.** Dictionaries exist, the provider works, but `t` is consumed by **zero** components. Every visible string in the marketing/admin/public UI is hardcoded English. |
| Is there a stored-XSS path from creator bio/links/theme? | **No direct XSS** (no `dangerouslySetInnerHTML` anywhere; React escapes text). Residual: unvalidated theme values → CSS `url()` injection, and a YouTube-link label spoofing vector. |
| Does the site have baseline SEO hygiene? | **No.** No sitemap, no robots, no favicon (`public/` is empty), no per-page metadata on 8 marketing routes, no canonical, no JSON-LD, OG image = raw avatar. |

**Top 5 findings:** (1) unauthenticated analytics writes + fabricated geo/browser data (§1.5), (2) RBAC matrix bypassed on users/domains/settings/moderation/templates APIs (§2.3), (3) auth fallback that auto-authenticates a demo user and a Clerk bypass in middleware (§2.3), (4) i18n completely unwired (§3), (5) fake contact form + three marketing CTAs whose query params are never consumed (§4.1, §4.3).

---

## 1. Public creator profile — `src/app/[username]/page.tsx`

### 1.1 Rendering model and data flow

- The route is an **async React Server Component** with `params: Promise<{username: string}>` (Next 15 convention): `src/app/[username]/page.tsx:8-10`, `:64-66`.
- Data is fetched **directly through Prisma inside the page** — not through an API route: `src/app/[username]/page.tsx:72-88` (`prisma.profile.findUnique` with `theme`, enabled `links`, `collections`, enabled `products`).
- The visual layer is a single client island `PublicProfileView` (`"use client"`, `src/components/profile/public-profile-view.tsx:1`) receiving serialized props (`src/app/[username]/page.tsx:122-130`). So: **HTML is server-rendered, interactions/analytics are client-side.**
- No `generateStaticParams`, no `revalidate`, no `export const dynamic` on this route (compare `src/app/templates/page.tsx:10`), so every visit is a fresh dynamic render with **no caching**.
- **Duplicate DB work:** `generateMetadata()` re-runs the same lookup (`src/app/[username]/page.tsx:20-36`) that the page then repeats (`:72-116`). Every profile hit costs 2–4 queries instead of ~1. `cache()`/`unstable_cache` or a single shared loader is missing.
- The second lookup is a `findFirst` over `customDomains` (`:26-35` and `:92-115`) — duplicated logic that also exists in `src/lib/domain/service.ts` (`resolveDomainProfile`), which the page does not call.

### 1.2 URL shape: `/username`, not `/@username`

The brief describes `/@username`; the code only supports `/username`:

- All generated links are `/${username}` — `src/components/layout/dashboard-sidebar.tsx:53,77`, `src/components/layout/dashboard-header.tsx:64`, `src/app/dashboard/qr-code/page.tsx:26-27`, `src/app/admin/users/page.tsx:216`, `src/lib/email/service.ts:172`.
- `src/app/[username]/page.tsx:66` lower-cases the raw segment and does an exact `username` lookup. A request to `/@shahuztech` therefore looks up the literal string `"@shahuztech"`, misses, misses the custom-domain branch, and 404s (`:118-120`). No rewrite for a leading `@` exists in `src/middleware.ts`.
- Meanwhile the page prints `@{profile.username}` (`src/components/profile/public-profile-view.tsx:296-298`), which trains users to type a URL that does not work.

**Impact:** broken shared links (`biospace.com/@handle` is a very common convention) and inconsistent canonical form.

### 1.3 Custom-domain support

- Middleware rewrites **only the exact root path** of a non-platform host: `src/middleware.ts:47-59` (`if (req.nextUrl.pathname === "/") url.pathname = "/" + hostname`).
- Consequence: on `links.creator.com`, only `/` works. Any deep path (`/about`, a shared `/pricing` link, or any future profile sub-route) is looked up as a username and 404s.
- Platform-host detection is a hardcoded host list + `.vercel.app`/`.biospace.com` allowlist (`src/middleware.ts:39-45`). Any other hostname (preview deploy, custom staging domain) is treated as a tenant, which breaks local/staging access.
- **Tenant-host branding leak:** the profile footer renders `<a href="/">Get your own Linktree</a>` (`src/components/profile/public-profile-view.tsx:537-544`). On a custom domain `/` is the *creator's own page*, not the platform — the CTA loops back to itself.
- `/api/domains/resolve` (`src/app/api/domains/resolve/route.ts:7-32`) has **no consumer anywhere in `src/`** (verified by search) — dead public endpoint that duplicates the page's inline domain lookup.
- Admin-side domain operations are real and DB-backed (`src/app/api/admin/domains/route.ts:36-75`), including metrics computed over all rows (`:62-73`).

### 1.4 SEO / OpenGraph / crawlability

Per-profile metadata exists (`src/app/[username]/page.tsx:12-62`) and is reasonable in intent, but:

1. **`generateMetadata` never checks `isPublished`** (`:38-61`) while the page body 404s for unpublished profiles (`:118-120`). Metadata resolution is independent of the page body, so a 404 response for an unpublished profile can still carry the creator's `displayName`, `bio` and `avatarUrl` in `<head>`/RSC payload instead of a "Not Found" title — an existence/privacy leak and an inconsistency (the metadata path has no `notFound()` fallback of its own).
2. **OG images = raw avatar** (`:53`, `:59`). No 1200×630 card, no `width`/`height`/`alt`; when `avatarUrl` is null the arrays are empty → `og:image` and `twitter:image` are absent while the card is declared `summary_large_image` (`:55-60`), which renders a broken/empty large card.
3. No `alternates.canonical`, no `openGraph.type: "profile"`, no `robots`, no JSON-LD (`Person`/`ProfilePage`), no `siteName` override for tenant domains.
4. Root metadata is inherited by **all 8 marketing routes** — only two files in the whole app export metadata (`src/app/layout.tsx:20`, `src/app/[username]/page.tsx:12`; verified by search). `/about`, `/pricing`, `/features`, `/faq`, `/templates`, `/privacy`, `/terms`, `/contact` therefore all share the same `<title>` and description.
5. Root metadata is internally inconsistent: `metadataBase` comes from env (`src/app/layout.tsx:24`) while `openGraph.url` is hardcoded `https://biospace.com` (`:28`); no `twitter.site`.
6. **No `sitemap.ts`, `robots.ts`, `manifest.ts`, or `opengraph-image` anywhere** (verified by glob), and `public/` is **empty** — there is no favicon, no apple-touch-icon, no logo asset (while `src/app/admin/settings/page.tsx:125` uses `placeholder="/logo.svg"`).
7. `src/app/templates/page.tsx:10` forces `force-dynamic` for a catalog that changes rarely — no ISR, and the templates page claims "20+ Handcrafted Themes" (`:43`) while the DB currently holds exactly 20 published templates.

### 1.5 Analytics: correctness, privacy, abuse

Tracking is entirely client-side, fire-and-forget:

```ts
// src/components/profile/public-profile-view.tsx:50-69
useEffect(() => {
  const visitorId = localStorage.getItem("biospace_visitor_id") ||
    `vis_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem("biospace_visitor_id", visitorId);
  const device = window.innerWidth < 768 ? "Mobile" : ...;
  fetch("/api/analytics", { method: "POST", body: JSON.stringify({
    profileId: profile.id, type: "VIEW", visitorId,
    referrer: document.referrer || "direct", device }) }).catch(() => {});
}, [profile.id]);
```

Correctness defects:

- **Every mount emits a VIEW.** `router.refresh()`, back/forward navigation, or remounting the island re-fires the effect (`:50-69`). No session/daily dedupe, so "unique visitors" is only ever correct because it is computed as `new Set(visitorId)` (`src/app/api/analytics/route.ts:49`) while totals inflate.
- **Creator self-views are counted.** Nothing compares the visitor to the profile owner.
- **No bot/crawler filtering.** Any hit, including link unfurlers and headless browsers, becomes a VIEW.
- **Fabricated dimensions.** The client never sends `browser`, and never sends `country`, so the API stamps defaults: `browser: browser || "Chrome"`, `country: country || "United States"` (`src/app/api/analytics/route.ts:149-151`). Dashboard "Geo distribution" / "Device & Browser" charts are therefore fiction for all live traffic (the 122 seeded events do contain varied values — see Appendix — which masks the bug in a demo).
- **Click referrer is wrong.** Click tracking sends `referrer: window.location.href` (`src/components/profile/public-profile-view.tsx:85`) — i.e. the profile's own URL, not the traffic source. Those rows are then bucketed as "Direct / Other" (`src/app/api/analytics/route.ts:86-96`). This bug is already visible in the seeded data (referrers `http://localhost:3000/shahzod`).
- **Click-then-navigate loses events.** `window.open(...)` is called immediately after the `fetch` (`src/components/profile/public-profile-view.tsx:77-92`); a popup-blocked or slow request silently drops the CLICK.
- **`linkId` is not validated against `profileId`.** `prisma.link.update` increments `clicksCount` for whatever `linkId` the body contains (`src/app/api/analytics/route.ts:156-161`), so a caller can inflate any link's counter.

Privacy defects:

- A persistent, non-expiring visitor identifier is written to `localStorage` with **no consent gate** (`src/components/profile/public-profile-view.tsx:52-53`), and `document.referrer` + device class are logged server-side (`src/app/api/analytics/route.ts:142-153`). The privacy policy claims "privacy-compliant … we do not sell your personal data" (`src/app/privacy/page.tsx:18-21`), but there is no consent banner and the profile's "Cookie Preferences · Report · Privacy" footer is non-interactive text (§4.1 item 5).
- `POST /api/analytics` is fully **unauthenticated, un-rate-limited and un-CSRF-protected** (`src/app/api/analytics/route.ts:133-167`). Anyone can inflate any profile's views/clicks (metric poisoning / competitive abuse) or flood the DB with junk rows. This is the single most exploitable issue in the public surface.

### 1.6 Untrusted content: XSS / CSS injection / URL handling

**No `dangerouslySetInnerHTML` anywhere in `src/`** (verified by search) — good. Bio and display name are rendered as React text nodes (`src/components/profile/public-profile-view.tsx:284-305`), so stored HTML/script cannot execute.

Residual risks:

1. **Theme values are unvalidated strings** injected into inline styles: `themeSchema` accepts plain `z.string()` for every colour/gradient/font field (`src/lib/validations.ts:116-129`) and `PublicProfileView` interpolates them into `style` objects (`src/components/profile/public-profile-view.tsx:131-146`, `:190-192`, `:388-393`). React applies these through CSSOM so arbitrary declaration break-out is blocked, but `background: url(https://attacker/track?u=...)` is honoured → a creator can make every visitor of their profile hit a third-party endpoint (tracking/pixel injection) and can spoof/spoil UI. Recommendation: strict hex/rgb/linear-gradient allowlist.
2. **Client-side URL formatting is not a validator.** `formatUrlForHref` (`src/lib/utils.ts:87-111`) does case-sensitive `startsWith` checks and otherwise prepends `https://`; it never re-checks for `javascript:`/`data:`. Write-time validation does exist (`src/lib/validations.ts:89-96` → `isValidSecureUrl`, which lowercases and blocks `javascript:`/`data:`/`vbscript:`/`file:`), so new links are safe — but any row written by a non-validated path (seeds, imports, future routes) is only "safe by accident".
3. **YouTube "watch" link can point off-site.** `link.thumbnail` is not URL-validated (`src/lib/validations.ts:99`) and is parsed as a JSON array of extra videos (`src/lib/utils.ts:211-234`). Any URL containing `youtu.be/<11 chars>` is accepted as a video, and `YouTubeEmbed` renders `<a href={formatUrlForHref(currentVideo.url)}>` labelled "YouTube" (`src/components/shared/youtube-embed.tsx:216-229`). Example: `https://evil.example/youtu.be/abcdefghijk` becomes a trusted-looking YouTube button → phishing/open-redirect vector. The iframe itself is safe (uses only the extracted 11-char id, `:132-133`).
4. Avatar/banner URLs are unvalidated strings (`src/lib/validations.ts:62-63`) rendered into `<img src>` — no script execution, but arbitrary third-party image requests.
5. `next.config.mjs:4-11` sets `remotePatterns: [{ hostname: "**" }]` — `next/image` is allowed to proxy **any** remote host, a known SSRF-ish/perf footgun.

### 1.7 Error / 404 handling

- `notFound()` on unknown username and on `!profile.isPublished` (`src/app/[username]/page.tsx:68-70`, `:118-120`), rendering the app-level `src/app/not-found.tsx:4-33`. Correct HTTP semantics.
- The 404 page is generic — no "this handle may be available" CTA, and its second button "Explore Creators" points at `/templates` (a template gallery, not a creator directory) (`src/app/not-found.tsx:24-30`).
- Reserved usernames are rejected both in metadata and in the body (`:16-18`, `:68-70` → `isReservedUsername`, `src/lib/validations.ts:45-47`), and the reserved list covers the marketing/admin routes (`:6-43`) — good.
- Client-side data fetching inside blocks (store/booking/newsletter) has no error boundaries (`src/components/profile/public-store-section.tsx:121-137`, `src/components/profile/public-booking-section.tsx:95-113`) — a failed `/api/bookings/types` just logs to console and leaves a blank block.

### 1.8 Embedded blocks (newsletter / booking / store)

- **Newsletter block ignores the theme.** It declares `theme` in props (`src/components/profile/public-newsletter-block.tsx:25`) and never reads it; every variant hardcodes white-on-transparent/emerald (`:99-100`, `:126`, `:151-152`, `:202-203`, `:215`). On a light-themed profile the block is invisible. It also renders inside the "links" tab only — gated by `newsletterEnabled` (`:34-36`).
- **Booking date strip is computed during render** with `new Date()` + `toISOString()` (UTC) + `toLocaleDateString("en-US")` (`src/components/profile/public-booking-section.tsx:82-92`). Two real bugs: (a) UTC date extraction shifts "today" for any UTC+ offset (in Asia/Tashkent, 00:00–05:00 local yields *yesterday's* UTC date as the first bookable day); (b) SSR computes it in the server timezone while hydration computes it in the browser → **potential hydration mismatch** for the 14 date buttons. Also hardcodes the `en-US` locale into an i18n-aware product.
- **Store section fabricates merchandising imagery:** when products have no image, the mosaic is filled with fixed Unsplash stock photos (`src/components/profile/public-store-section.tsx:64-71`, `:100-111`) — buyers see stock apparel that is not for sale.
- Store/booking sections and the shop tab are only reachable through client state (`activeProfileTab`, `src/components/profile/public-profile-view.tsx:47`, `:328-357`) → the shop is not linkable/shareable (no URL state), and all products are in the DOM only after a click.

---

## 2. Admin panel — is it real or mock?

### 2.1 Per-page verdict (all real DB data)

| Page | Data source | Real? | Evidence |
|---|---|---|---|
| `/admin` overview | Server RSC, 10 parallel Prisma aggregates (`user.count`, `profile.count`, `link.count`, `template.count`, `analyticsEvent.count` ×2, `report.count`, `adminAuditLog.findMany`) | **Real** | `src/app/admin/page.tsx:22-52` |
| `/admin/users` | `GET/PATCH/DELETE /api/admin/users` → Prisma `user.findMany`/`update`/`delete` | **Real** | `src/app/admin/users/page.tsx:57-126`; `src/app/api/admin/users/route.ts:26-41,69-72,103-105` |
| `/admin/domains` | `GET/POST /api/admin/domains` → `customDomain.findMany` + metrics | **Real** | `src/app/admin/domains/page.tsx:71-118`; `src/app/api/admin/domains/route.ts:36-75` |
| `/admin/reports` | Alias re-export of moderation page | **Real** | `src/app/admin/reports/page.tsx:1-3` |
| `/admin/moderation` | `GET/PATCH /api/admin/moderation` → `report.findMany` / `report.update` + audit log | **Real** | `src/app/admin/moderation/page.tsx:35-70`; `src/app/api/admin/moderation/route.ts:10-18,31-48` |
| `/admin/templates` | Read `GET /api/templates` (public), write `/api/admin/templates` | **Real** | `src/app/admin/templates/page.tsx:60-73,127-171`; `src/app/api/admin/templates/route.ts:17-29,58-61` |
| `/admin/subscriptions` | Server RSC, Prisma counts + `user.findMany({ subscriptionTier: "PRO" })` with `subscription` | **Real data, one derived fake metric** | `src/app/admin/subscriptions/page.tsx:11-23` |
| `/admin/settings` | `GET/PUT /api/admin/settings`, `GET/PUT /api/admin/feature-flags` | **Real** | `src/app/admin/settings/page.tsx:19-79`; `src/app/api/admin/settings/route.ts:10-47`; `src/app/api/admin/feature-flags/route.ts:13-50` |
| `/admin/audit-logs` | Alias re-export of logs page; server RSC `adminAuditLog.findMany` | **Real** | `src/app/admin/audit-logs/page.tsx:1-3`; `src/app/admin/logs/page.tsx:11-14` |
| `/admin/marketplace` | `GET/PUT /api/admin/marketplace` → `template.findMany` + `templatePurchase` counts/aggregate | **Real** | `src/app/admin/marketplace/page.tsx:40-96`; `src/app/api/admin/marketplace/route.ts:13-47,69-76` |
| `/admin/support` | `GET/PUT /api/admin/support` → `supportTicket.findMany/update` | **Real, but self-seeds fake rows** | `src/app/admin/support/page.tsx:53-116`; `src/app/api/admin/support/route.ts:13-25,99-107` |

**No `Math.random` and no hardcoded record arrays exist in any admin page.** Verified: `Math.random` appears in `src/` only for visitor-ID / upload-filename / order-number generation and one dashboard chart fallback (`src/components/dashboard/overview-charts.tsx:28-36`) — none under `src/app/admin/**`, and no admin page renders a literal array of rows. The admin panel is genuinely wired end-to-end.

### 2.2 Where synthetic data *does* exist

1. **Support tickets are auto-seeded on first read.** If the table is empty, `GET /api/admin/support` inserts three fabricated tickets attributed to the first user in the DB:

   ```ts
   // src/app/api/admin/support/route.ts:27-60
   if (tickets.length === 0) {
     const demoUser = await prisma.user.findFirst();
     if (demoUser) {
       await prisma.supportTicket.createMany({ data: [
         { subject: "Custom domain DNS CNAME configuration inquiry", status: "OPEN", ... },
         { subject: "Invoice for annual PRO subscription receipt", status: "IN_PROGRESS", ... },
         { subject: "Feature request: TikTok direct pixel integration", status: "RESOLVED", ... }
       ]});
   ```

   These are **persisted** (not transient), so they appear in counts on the admin dashboard, can be "resolved" by an admin (writing audit-log rows), and email the wrong user if a reply flow is later added. This is mock data masquerading as production data.
2. **MRR is fabricated:** `const estimatedMRR = proUsers * 10;` (`src/app/admin/subscriptions/page.tsx:23`) — ignores the actual `Subscription` rows, the $8/mo annual price (`src/components/marketing/pricing-section.tsx:120-124`), and refunds. Displayed as a real KPI (`:59-68`).
3. **Stripe linkage is faked in the UI:** `{u.subscription?.stripeCustomerId || "manual_seed_grant"}` (`src/app/admin/subscriptions/page.tsx:109-111`) — a literal demo string in a "Stripe customer linkages" table.
4. **Hardcoded catalogue claims:** "Across 10 categories" (`src/app/admin/page.tsx:116-117`), category/layout option lists duplicated by hand (`src/app/admin/templates/page.tsx:392-423`).
5. **Dashboard counts include demo seed rows.** The DB currently contains 3 users / 2 profiles / 4 links / 1 report / 122 analytics events / 20 templates (§Appendix A), so admin KPIs look populated but are seed data.

### 2.3 Authorization: layered, but leaky

Good parts:

- **Server-side layout guard**: `src/app/admin/layout.tsx:13-17` calls `verifyAdminSession()` and `redirect("/sign-in?admin=required")` — the admin UI is not merely hidden by CSS.
- Every admin API route re-checks `verifyAdminSession()` (a guard in each of the 8 files under `src/app/api/admin/*`, per handler).
- Admin mutations write `AdminAuditLog` rows (`src/app/api/admin/users/route.ts:74-84`, `domains/route.ts:149-159`, `moderation/route.ts:39-48`, `settings/route.ts:36-45`, `rbac.logAdminAction` at `src/lib/rbac.ts:116-149`).

Leaks:

1. **The RBAC matrix is mostly unused.** `src/lib/rbac.ts:31-94` defines least-privilege per role (`SUPPORT` has `users:read` only, no `users:write`/`users:delete`; `MODERATOR` has no `settings:*`). But only **3 of 8** admin route files apply `userHasPermission` (`feature-flags`, `marketplace`, `support`). The rest accept **any** role that `verifyAdminSession` admits — which includes `MODERATOR` and `SUPPORT` (`src/lib/auth.ts:254-269`). Concretely:
   - `DELETE /api/admin/users` → `SUPPORT` can permanently delete any user (and cascade-delete their profile/links/analytics): `src/app/api/admin/users/route.ts:94-105`.
   - `PATCH /api/admin/users` → `SUPPORT` can change `role`/`subscriptionTier`/ban state (privilege escalation to ADMIN): `src/app/api/admin/users/route.ts:52-72`.
   - `POST /api/admin/domains` → `SUPPORT` can DELETE or suspend any tenant domain: `src/app/api/admin/domains/route.ts:87-147`.
   - `PUT /api/admin/settings` → `MODERATOR`/`SUPPORT` can rewrite platform settings (mass assignment, no validation): `src/app/api/admin/settings/route.ts:25-34`.
   - `PATCH/DELETE /api/admin/templates` → mass assignment via `data: updates`: `src/app/api/admin/templates/route.ts:54-61`.
   - `PATCH /api/admin/moderation` accepts any `status` string with no schema validation: `src/app/api/admin/moderation/route.ts:29-37`.
2. **"Immutable" audit log is deletable.** `AdminAuditLog.adminId` → `User` uses `onDelete: Cascade` (`prisma/schema.prisma:337-341`). Deleting an admin account wipes their audit trail, and any role that can call `DELETE /api/admin/users` can do it — directly contradicting the page's "Tamper-evident record" claim (`src/app/admin/logs/page.tsx:19-20`) and the marketing claim "immutable admin audit logging" (`src/components/marketing/features-showcase.tsx:54-57`). `AdminAuditLog.ipAddress` exists in the schema but no `logAdminAction` caller ever passes it (`src/lib/rbac.ts:116-149`), so every audit row has `null` IP.
3. **Authentication is weaker than the admin guard assumes.**
   - `getAuthenticatedUser()` falls back to returning the demo creator account **with no session at all**: `src/lib/auth.ts:233-241` (`findFirst({ email: "alex@creator.dev" })`). Today that account is `USER` (`prisma/seed.js:608-619`), so `verifyAdminSession` still rejects it — but this means *every anonymous visitor is authenticated as a real user* for all non-admin areas, and the admin guard now depends on a single seeded row's role value.
   - `biospace_session` is an **unsigned** cookie holding the raw user id, trusted directly: `src/lib/auth.ts:121-134`, set by `src/app/api/auth/login/route.ts:36-43`. Anyone who learns an admin's `User.id` (cuid) can mint that cookie. Note these local-auth endpoints have **no UI consumer** (`/api/auth/login` and `/api/auth/register` are referenced nowhere in `src/`) — they are dead-but-live attack surface.
   - `middleware.ts:66-70` returns `NextResponse.next()` for **all** routes when Clerk keys look non-live. With the shipped `.env` (`CLERK_SECRET_KEY` contains `demo_secret_key`, so `isLiveClerkKeyConfigured()` is false at `src/lib/auth.ts:52-65` / `src/middleware.ts:4-17`), middleware protection is a no-op and admin safety rests entirely on the layout guard.
   - Admin role grant is driven by an env email allowlist (`ADMIN_EMAIL_ALLOWLIST`, `src/lib/auth.ts:43-50`, also applied at registration: `src/app/api/auth/register/route.ts:50,60`). Fine as a bootstrap, but it means registration with an allowlisted email silently becomes ADMIN.
4. **UI does not reflect roles.** The sidebar is a static list (`src/components/layout/admin-sidebar.tsx:25-36`) with no role filtering, so a `SUPPORT` user sees (and can click) Users/Templates/Settings/Moderation even where the API would 403 — inconsistent access errors across pages.
5. `?admin=required` is passed by the layout (`src/app/admin/layout.tsx:16`) but the sign-in page ignores search params entirely (`src/app/sign-in/[[...sign-in]]/page.tsx:7-45`) → users bounced from admin land on a generic Clerk form with no explanation.

### 2.4 Admin routing, layout, responsiveness

- **Duplicate alias routes:** `src/app/admin/reports/page.tsx:1-3` re-exports moderation and `src/app/admin/audit-logs/page.tsx:1-3` re-exports logs, while the canonical pages (`/admin/moderation`, `/admin/logs`) are not in the sidebar. The dashboard's "Full Log" link points at `/admin/logs` (`src/app/admin/page.tsx:195`) while the sidebar points at `/admin/audit-logs` (`admin-sidebar.tsx:35`) — two URLs for one screen, and `pathname === item.href` exact-match highlighting (`admin-sidebar.tsx:61`) means the aliases light up only on the exact alias.
- **Sidebar is not responsive:** fixed `w-64 … h-screen sticky` with no drawer/breakpoint (`src/components/layout/admin-sidebar.tsx:42`); the layout gives the content `flex-1` and no mobile treatment (`src/app/admin/layout.tsx:20-26`). On a 390 px viewport the sidebar consumes 256 px and the tables are unusable.
- **Two admin pages have no header and no page padding.** `/admin/marketplace` and `/admin/support` render a bare `<div className="space-y-6">` (`src/app/admin/marketplace/page.tsx:104-114`, `src/app/admin/support/page.tsx:118-127`) instead of `<AdminHeader>` + `p-6 sm:p-8` used everywhere else (`src/app/admin/users/page.tsx:128-135`). Result: content is flush against the sidebar edge, no theme toggle, inconsistent page chrome. (Their `text-text-secondary`/`bg-surface` tokens *do* exist in `tailwind.config.ts:25-58` — this is a layout bug, not a missing-token bug.)
- **Search-as-you-type with no debounce/abort:** `useEffect(() => { loadDomains(); }, [statusFilter, search])` (`src/app/admin/domains/page.tsx:88-90`) fires one request per keystroke; responses can arrive out of order and overwrite newer results.
- **No pagination anywhere:** `/api/admin/users` returns *all* users (`src/app/api/admin/users/route.ts:26-41`), moderation returns all reports (`:10-16`), audit logs are capped at 50 with no pager (`src/app/admin/logs/page.tsx:11-14`).
- **Settings page can spin forever:** `if (loading || !settings)` returns a loader (`src/app/admin/settings/page.tsx:81-90`); on a 403/network failure `settings` stays `null` and `loading` is `false`, so the condition is permanently true — no error state, no retry.
- **Support reply modal is a bespoke overlay** instead of the shared `Modal` (`src/app/admin/support/page.tsx:294-373`), so it lacks Escape-to-close and body-scroll locking that `src/components/ui/modal.tsx:24-46` provides; the reply textarea is `required` (`:342-349`), so an admin cannot save a status/priority change without typing text.
- **Settings save is mass-assignment:** the page PUTs its whole state object including `id` and `updatedAt` (`src/app/admin/settings/page.tsx:62-79`) and the route forwards the body straight to Prisma (`src/app/api/admin/settings/route.ts:28-34`) with no schema — any future column becomes client-writable.
- **Template admin cannot manage drafts:** the list is loaded from the *public* endpoint that filters `isPublished: true` (`src/app/admin/templates/page.tsx:63-66`; `src/app/api/templates/route.ts:6-7`). Unpublishing a template removes it from the admin table after reload, so it can never be re-published from the UI.
- **Unused imports everywhere** (no linter configured): e.g. `src/app/admin/users/page.tsx:13-20` (`Filter`, `Shield`, `Ban`, `CheckCircle2`, `AlertTriangle`), `src/app/admin/domains/page.tsx:4-22` (11 unused icon/card imports), `src/app/admin/page.tsx:7-18` (`TrendingUp`, `ArrowRight`).

---

## 3. i18n (uz / ru / en)

**State: implemented as data, not as behaviour.**

- `src/lib/i18n.ts:1-234` defines three complete dictionaries (`en`, `ru`, `uz`) with 6 sections each — `nav`, `hero`, `dashboard`, `audience`, `store`, `common` — and a typed `getDictionary()` with fallback (`:242-245`).
- `src/components/i18n-provider.tsx:14-36` stores the locale in state, defaults to `"en"` (`src/lib/i18n.ts:3`), hydrates from `localStorage("biospace-locale")` in an effect (`:17-22`), and exposes `{ locale, setLocale, t }`.
- **`t` is consumed by zero components.** A repository-wide search for `useI18n`/`t.` usage returns only the provider, the language toggle, and one unrelated use of `locale` in `src/components/shared/avatar-uploader.tsx:39`. Every translatable string in the app is a hardcoded literal:
  - marketing: `src/components/marketing/interactive-hero.tsx:84-147`, `features-showcase.tsx:15-64`, `how-it-works.tsx:6-25`, `pricing-section.tsx:16-160`, `testimonials-faq.tsx:7-59`, `src/components/layout/marketing-navbar.tsx:26-40`, `marketing-footer.tsx:39-65`;
  - marketing pages: `src/app/about/page.tsx:14-51`, `src/app/features/page.tsx:14-23`, `src/app/contact/page.tsx:33-77`, `src/app/not-found.tsx:12-29`;
  - public profile + blocks: `src/components/profile/public-profile-view.tsx:341/353/414/543/549/552`, `public-newsletter-block.tsx:38-44`, `public-booking-section.tsx:89-90`;
  - all of `src/app/admin/**` (English titles at `src/app/admin/page.tsx:58-60`, `admin/users/page.tsx:130-133`, etc.).
- **The dictionaries do not even cover the marketing pages.** There are no keys for pricing tiers, FAQ text, feature cards, footer, admin panel, profile UI, auth pages or error pages — so wiring the existing `t` would not translate the site; the dictionaries would need to grow first.
- **`<html lang>` is static and never updated:** `<html lang="en" suppressHydrationWarning>` (`src/app/layout.tsx:59`). Switching the toggle to `ru`/`uz` changes React state only — no `document.documentElement.lang`, no `dir`, no `?lang=` routing, no cookie, no `Accept-Language` negotiation. Screen readers and translation engines keep seeing English; there is no `hreflang`/localised URL for SEO.
- **Hydration/UX:** because the provider starts at `"en"` and only reads `localStorage` after mount (`src/components/i18n-provider.tsx:15-22`), SSR HTML is always English. Today this produces no mismatch (nothing renders `t`), but the moment strings are wired, every saved-locale user will see an English flash and later a re-render; a locale cookie read server-side is required.
- **Language mixing inside the English UI:** the YouTube embed ships Uzbek UI strings — `title="Oldingi video"`, `"Keyingi video"`, `"YouTube platformasida tomosha qilish"`, `"Videoni ko'rish uchun bosing"` (`src/components/shared/youtube-embed.tsx:197,208,225,269`), and the carousel badge "10s Karusel" (`:296`), while the rest of the component is English ("Click to play", "Featured").
- The toggle itself works (`src/components/language-toggle.tsx:13-17,42-57`), but it only swaps the `locale` state — its `aria-label="Change language"` and language names are hardcoded English (`:34`), and it is mounted in the **admin/dashboard headers too** (`admin-header.tsx:36`, `dashboard-header.tsx:75`) where it currently changes nothing visible outside the toggle's own `EN` badge.

---

## 4. Marketing pages, auth pages, shared layout/chrome

### 4.1 Non-functional forms and CTAs

1. **The contact form is fake.** `handleSubmit` never calls an API — it waits 800 ms and shows a success state:

   ```ts
   // src/app/contact/page.tsx:17-25
   const handleSubmit = (e) => { e.preventDefault(); setLoading(true);
     setTimeout(() => { setLoading(false); setSubmitted(true);
       toast.success("Message sent! Our support team will get back to you shortly."); }, 800); };
   ```

   No persistence, no email, no ticket — while an admin "Support Tickets" panel awaits real tickets (`src/app/admin/support/page.tsx`). The form inputs are also uncontrolled with no `name` attributes (`src/app/contact/page.tsx:56-78`), so nothing could be submitted even if wired.
2. **Three marketing CTAs collect input that is then discarded.** The hero "Claim URL" form navigates to `/sign-up?username=...` (`src/components/marketing/interactive-hero.tsx:104-112`), the pricing CTA to `/sign-up?plan=pro` (`src/components/marketing/pricing-section.tsx:158`), and the template gallery to `/sign-up?template=<slug>` (`src/app/templates/page.tsx:132`). The sign-up page declares **no `searchParams` prop at all** (`src/app/sign-up/[[...sign-up]]/page.tsx:7-45`), and Clerk's `<SignUp>` is not fed any of these values → the claimed username/plan/template is silently lost. (The register API does accept `username`: `src/app/api/auth/register/route.ts:34-46`, but that endpoint is never called from the UI.)
3. **Marketing footer social icons point at domain roots** — `https://twitter.com`, `https://github.com`, `https://youtube.com`, `https://instagram.com` (`src/components/layout/marketing-footer.tsx:22-33`) — not brand accounts.
4. **Public footer exposes the admin portal** in the Legal column: `<Link href="/admin">Admin Portal</Link>` (`src/components/layout/marketing-footer.tsx:64`).
5. **Dead text controls on the public profile:** "Cookie Preferences · Report · Privacy" is a plain `<p>` (`src/components/profile/public-profile-view.tsx:547-550`) and "More from Linktree" is a plain `<p>` with a hover style (`:551-553`) — neither is clickable, yet the page ships a working `ReportModal` (`:558-564`) and a real privacy page.
6. **Wrong-brand copy shipped to production:** "Get your own Linktree" (`src/components/profile/public-profile-view.tsx:543`, and the hero mockup `src/components/marketing/phone-mockup.tsx:414`) and "More from Linktree" (`:552`, `phone-mockup.tsx:424`) — competitor branding on the product surface.
7. **Templates page has an unused category filter.** The `categories` array is declared and never rendered (`src/app/templates/page.tsx:18-30`); there is no filtering UI even though the array implies one.

### 4.2 Marketing claims contradicted by the code

| Claim | Where | Contradiction |
|---|---|---|
| "privacy-friendly insights … geo distribution" | `src/components/marketing/features-showcase.tsx:29-33` | Geo/browser are hardcoded to `United States`/`Chrome` (§1.5) |
| "immutable admin audit logging" | `src/components/marketing/features-showcase.tsx:54-57` | Audit rows cascade-delete with the admin user (`prisma/schema.prisma:340`) |
| "Bank-grade security … server-side authentication, role-based controls" | same | RBAC applied to 3/8 admin routes; demo-user auth fallback (§2.3) |
| "privacy-compliant … we do not sell your personal data" | `src/app/privacy/page.tsx:18-21` | Tracking with persistent ID and zero consent UI (§1.5) |
| "20+ Handcrafted Themes" | `src/app/templates/page.tsx:43` | DB has exactly 20 published templates (Appendix A) |
| "250,000+ creators" / "250k+" | `src/components/marketing/interactive-hero.tsx:99`, `src/app/about/page.tsx:29` | DB has 3 users |

These are marketing-vs-reality gaps; the privacy and audit-log ones are the ones with legal/compliance weight.

### 4.3 Auth pages

- Both pages are static RSCs wrapping Clerk components with a dark-only shell (`bg-zinc-950`) — they ignore the app theme (`src/app/sign-in/[[...sign-in]]/page.tsx:9`, `src/app/sign-up/[[...sign-up]]/page.tsx:9`).
- Clerk is configured twice: root `ClerkProvider` appearance (`src/app/layout.tsx:45-58`) and per-page `appearance` (`sign-in/.../page.tsx:25-36`) — duplicated tokens that will drift.
- With the shipped `.env` the Clerk secret key is a demo string, so `isLiveClerkKeyConfigured()` is false (`src/lib/auth.ts:52-65`); whether `<SignIn>` can actually complete a login in this environment is doubtful, while the working local credential endpoints (`/api/auth/login`) are unreachable from any UI. Net effect: **the auth pages and the session model disagree.**
- No `?admin=required`/`?username=`/`?plan=`/`?template=` handling on either page (§4.1, §2.3).

### 4.4 Theme system / global shell

- Two `ThemeToggle` implementations exist; `src/components/theme-toggle.tsx` (32 lines) is **never imported** — all consumers use `src/components/shared/theme-toggle.tsx` (`marketing-navbar.tsx:7`, `dashboard-header.tsx:7`, `admin-header.tsx:5`). Dead duplicate.
- **Theme flash (FOUC):** `ThemeProvider` starts at `"system"` and only applies `.dark`/`.light` inside `useEffect` (`src/components/theme-provider.tsx:16-40`). There is no blocking inline script in `<head>` (`src/app/layout.tsx:59-68`), so system-dark users get a white flash on every hard navigation.
- `src/app/globals.css` is coherent (HSL tokens for light/dark incl. `--surface`, `--text-secondary`, `:62-70`) and the Tailwind mapping is complete (`tailwind.config.ts:19-77`); the custom Clerk overrides at `globals.css:93-184` use `!important` on Clerk class names, which will break silently on Clerk upgrades.
- **No security headers / CSP** are configured (`next.config.mjs:1-17` has only images + serverActions). The public profile renders third-party iframes (`src/components/shared/youtube-embed.tsx:249-255`) and arbitrary creator avatars — a CSP with `frame-src`/`img-src` allowlists is absent.

### 4.5 Hydration / React-error candidates (concrete)

| # | Where | Why |
|---|---|---|
| H1 | `src/components/profile/public-booking-section.tsx:82-92` | `new Date()` + `toISOString()` + `toLocaleDateString("en-US")` computed during render → server/client TZ & locale divergence; also a real UTC-vs-local off-by-one day bug |
| H2 | `src/components/profile/public-profile-view.tsx:119-126` | `const now = new Date()` filtered during render; a link whose `scheduledStart/End` crosses the render/hydration boundary renders differently on server vs client |
| H3 | `src/components/theme-provider.tsx:16-40` | Class applied post-mount → theme flash (not a mismatch, but a visible repaint) |
| H4 | `src/components/i18n-provider.tsx:15-22` | Locale read post-mount; latent flash as soon as `t` is wired |
| H5 | `src/components/profile/public-profile-view.tsx:50-69` | View effect re-fires on every mount; under `reactStrictMode: true` (`next.config.mjs:3`) dev double-counts |

---

## 5. Prioritized recommendations

| # | Recommendation | Files | Impact |
|---|---|---|---|
| **R1** | **Make analytics trustworthy and private.** Move event ingestion to a rate-limited, origin-checked route (`429` after N/min per IP+profile), drop client-supplied `profileId` in favour of a signed profile token, dedupe views per `visitorId`+profile per session/day, exclude the profile owner (cookie/JWT), drop known bots via UA, and collect real `country` (edge header like `x-vercel-ip-country`), `browser`, `os` instead of defaults. Fix CLICK referrer to `document.referrer`. Add a consent/opt-out path and a retention window. | `src/app/api/analytics/route.ts:133-167`, `src/components/profile/public-profile-view.tsx:50-93` | **Critical** — every creator-facing metric and the admin overview are currently inflatable by anyone and partly fabricated |
| **R2** | **Apply RBAC on every admin API; stop accepting "any admin-ish role".** Add `userHasPermission(admin, "users:delete" / "users:write" / "users:ban" / "settings:write" / "templates:delete" / "reports:moderate")` to the users/domains/settings/moderation/templates routes; restrict template/settings writes to `SUPER_ADMIN`/`ADMIN`; validate request bodies with Zod (no `data: updates` mass assignment); filter the sidebar by role. | `src/app/api/admin/users/route.ts:52,94`, `domains/route.ts:87`, `settings/route.ts:25-34`, `templates/route.ts:54-61`, `moderation/route.ts:26-37`; `src/lib/rbac.ts:31-94`; `src/components/layout/admin-sidebar.tsx:25-36` | **Critical** — `SUPPORT` accounts can currently delete users/domains and rewrite platform settings |
| **R3** | **Harden the auth boundary around admin.** Remove/limit the demo-user fallback in `getAuthenticatedUser` to non-production and explicit test flags; sign the `biospace_session` cookie (HMAC/JWT) or delete the unused local-auth endpoints entirely; make middleware protection real instead of `NextResponse.next()` when Clerk is unconfigured; restrict `verifyAdminSession` to `SUPER_ADMIN`/`ADMIN` for the admin layout and handle `?admin=required` with a visible message; move `AdminAuditLog.adminId` to `onDelete: Restrict`/`SetNull` so logs stay immutable, and record `ipAddress`. | `src/lib/auth.ts:121-134,233-241,254-269`, `src/middleware.ts:66-70`, `src/app/admin/layout.tsx:13-17`, `prisma/schema.prisma:337-347`, `src/app/sign-in/[[...sign-in]]/page.tsx:7-45` | **High** — closes an auth bypass class and restores the audit trail the product advertises |
| **R4** | **Make i18n real or remove it.** Wire `useI18n().t` into the marketing pages, footer/navbar, profile blocks, admin chrome and auth pages; extend the dictionaries to cover those namespaces (uz/ru/en); set `<html lang>`/`dir` from a server-read locale cookie; expose `?lang=` + `hreflang`/canonical per locale; localise the hardcoded `en-US` date formatting and the Uzbek strings in `youtube-embed`. If the budget is not there, delete the provider and dictionaries rather than shipping a non-functional selector. | `src/lib/i18n.ts:5-234`, `src/components/i18n-provider.tsx:14-36`, `src/app/layout.tsx:59`, `src/components/shared/youtube-embed.tsx:197-296`, `src/components/profile/public-booking-section.tsx:89-90` | **High** — the language switcher is the single most visible broken control on the site |
| **R5** | **SEO/perf baseline for marketing + profile.** Add `export const metadata` to every marketing page (unique title/description), a `Person`/`ProfilePage` JSON-LD + `alternates.canonical` on the profile, a 1200×630 generated OG image (not the avatar) with `width/height/alt`, `src/app/sitemap.ts` + `robots.ts`, a favicon/apple-touch-icon in `public/`, and `openGraph.url` from `metadataBase`. Cache the profile lookup once per request (`React.cache`) and add `revalidate`/ISR instead of two uncached Prisma round-trips. Do not emit metadata for unpublished profiles. | `src/app/[username]/page.tsx:12-62,72-116`, `src/app/layout.tsx:20-37`, all `src/app/{about,...}/page.tsx`, `public/` (empty), `next.config.mjs:4-11` | **High** — every marketing page currently shares one title; profiles have no rich social card |
| **R6** | **Fix custom-domain routing and tenant-safe links.** Rewrite the full path (or add a dedicated tenant route) instead of only `/` in middleware; resolve the domain through the existing `resolveDomainProfile` service instead of duplicating a `findFirst` in the page; make "Get your own BioSpace" an absolute platform URL so it does not loop on tenant domains; remove or wire `/api/domains/resolve`. | `src/middleware.ts:39-59`, `src/app/[username]/page.tsx:24-36,90-115`, `src/components/profile/public-profile-view.tsx:533-556`, `src/app/api/domains/resolve/route.ts`, `src/lib/domain/service.ts` | **High** — paid custom-domain feature only works for the bare root URL |
| **R7** | **Fix the hydration/timezone bugs.** Compute the bookable-date strip on the server (or in an effect) using the profile's `bookingTimezone`, pass it as props, format with `Intl.DateTimeFormat` + the active locale, and use local-date components (not `toISOString()`) — this fixes both the hydration risk and the off-by-one-day bug for UTC+ users. Move the scheduled-link window filter server-side. | `src/components/profile/public-booking-section.tsx:82-113`, `src/components/profile/public-profile-view.tsx:119-126` | **Medium-High** — booking is a monetized feature; date bugs are user-visible and reported as hydration warnings |
| **R8** | **Replace fake conversion paths.** Implement a real contact endpoint (persist as `SupportTicket` + notification/email) and controlled inputs; consume `?username=`/`?plan=`/`?template=` on sign-up (or drop the params from the CTAs); make the profile footer's Report/Privacy/Cookie controls real links; place a working `ReportModal` trigger per link (state already exists but is never set: `selectedReportLinkId` is only ever `undefined`); replace "Linktree" copy with BioSpace; remove the `/admin` link from the public footer. | `src/app/contact/page.tsx:17-78`, `src/components/marketing/interactive-hero.tsx:104-112`, `src/components/marketing/pricing-section.tsx:158`, `src/app/sign-up/[[...sign-up]]/page.tsx:23-41`, `src/components/profile/public-profile-view.tsx:148-168,537-556`, `src/components/layout/marketing-footer.tsx:64` | **High** — three revenue/acquisition paths currently do nothing and the public surface carries competitor branding |
| **R9** | **Clean up admin data integrity + admin UX.** Delete the auto-seeding of support tickets and seed demo tickets in `prisma/seed.js` instead; compute MRR from `Subscription` rows; load the admin template list from a new admin endpoint (include drafts) so unpublish is reversible; add error states (no infinite spinner on `/admin/settings`); add `AdminHeader`+padding to marketplace/support; debounce domain search with `AbortController`; add pagination to users/moderation/audit logs; use the shared `Modal` for support replies and drop the `required` reply text. | `src/app/api/admin/support/route.ts:27-76`, `src/app/admin/subscriptions/page.tsx:23,109-111`, `src/app/admin/templates/page.tsx:63-66`, `src/app/api/templates/route.ts:6-7`, `src/app/admin/settings/page.tsx:81-90`, `src/app/admin/domains/page.tsx:88-90`, `src/app/admin/marketplace/page.tsx:104-114`, `src/app/admin/support/page.tsx:118-127,294-373` | **Medium** — removes production mock data and day-to-day admin friction |
| **R10** | **Hardening + hygiene.** Add CSP/`frame-ancestors`/`X-Content-Type-Options`/`Referrer-Policy` headers and restrict `images.remotePatterns`; validate theme colours/lengths against an allowlist and re-validate link URLs at render (`formatUrlForHref` should reject unsafe schemes case-insensitively) and validate `link.thumbnail` JSON; add an ESLint config (currently `npm run lint` cannot work — no config file and no `eslint` devDependency) and remove dead code (unused `Image`/`isHero`/`isYouTubeUrl` in `phone-mockup.tsx`; unused `Sparkles`/`Copy`/`ShoppingBag`/`CreditCard`/`Modal`/`isHero`/`selectedProduct` in `public-profile-view.tsx`; unused `categories` in `templates/page.tsx`; duplicate `src/components/theme-toggle.tsx`); replace raw `<img>` with `next/image` (or add `width/height`/`loading="lazy"`) for avatars, banners and testimonial photos. | `next.config.mjs:1-17`, `src/lib/validations.ts:99,116-129`, `src/lib/utils.ts:60-111`, `src/components/shared/youtube-embed.tsx:216-229`, `src/components/marketing/phone-mockup.tsx:4,13,110`, `src/components/profile/public-profile-view.tsx:8-16,46,131`, `src/app/templates/page.tsx:18-30`, `src/components/theme-toggle.tsx` | **Medium** — closes CSS/URL injection, phishing label abuse and layout shift; enables catching the ~15 unused-import issues automatically |

---

## Appendix A — read-only DB snapshot (`prisma/dev.db`)

Queried with the project's own Prisma client (read-only):

```
templates: 20   publishedTemplates: 20   templateCategories: 10 (per seed)
users: 3        profiles: 2              publishedProfiles: 2
links: 4        themes: 2                subscribers: 2
reports: 1      supportTickets: 1        customDomains: 2
analyticsEvents: 122                    adminAuditLogs: 3
featureFlags: 2 platformSettings: 1     admins: 1   (admin@biospace.com, PRO)
```

Seeded analytics dimensions (`groupBy` over `AnalyticsEvent`): `country` = US/UK/Japan/India/Germany/France/Canada/Brazil; `browser` = Chrome/Edge/Firefox/Safari; `device` = Desktop/Mobile/Tablet; referrers include `http://localhost:3000/shahzod` — i.e. **the click-referrer bug (§1.5) is already visible in the seeded data**, while live traffic will only ever be `United States`/`Chrome`/`Direct / Other`.

Users in DB: `admin@biospace.com` (ADMIN, PRO), `alex@creator.dev` (USER, PRO — the demo fallback account), plus one Clerk-signed-up `@clerk.user` account (USER, FREE).

## Appendix B — method and limitations

- **Verified by reading:** every file in the declared scope plus `src/app/api/{analytics,admin/*,templates,theme,profile,auth/*,domains/resolve,report}`, `prisma/schema.prisma`, `prisma/seed.js`, `tailwind.config.ts`, `next.config.mjs`, `tsconfig.json`, `package.json`.
- **Verified by search (not assumed):** `dangerouslySetInnerHTML` → 0 hits; `useI18n`/`t` consumers → only provider + toggle + one `locale` use; `Math.random` → none in admin/ marketing; `theme-toggle` imports → `shared/theme-toggle` only; `/api/auth/login|register` callers → none; `domains/resolve` callers → none; `export const metadata` → 2 files.
- **Not executed:** no `next build`, `tsc`, or test run was performed against this checkout; the sandbox shell became unavailable mid-audit (sandbox runner error), so claims are static-analysis + DB-snapshot based. `npm run lint` is expected to fail regardless, because no ESLint config exists and `eslint` is absent from `package.json:34-45`.
- All line references are against the working tree as read at audit time; no source file was modified.
