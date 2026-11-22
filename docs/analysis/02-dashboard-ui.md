# BioSpace — Creator Dashboard / Studio UI Audit

**Area:** `src/app/dashboard/**`, `src/components/dashboard/**`, `src/components/ui/**`, `src/components/shared/**`, `src/context/dashboard-context.tsx`, `src/app/onboarding/page.tsx`
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.7 (`strict: true`) · Tailwind 3.4 · Prisma 6
**Provenance:** working tree (HEAD `80d5095`, *with pre-existing uncommitted modifications* to several audited files — e.g. `dashboard/page.tsx`, `links/page.tsx`, `store/page.tsx` mtime 02–08 Nov 2026). All findings described the working tree as it exists on disk, not HEAD.
**Method:** full manual read of all 45 in-scope `.ts/.tsx` files; cross-check of 20 API route handlers against their client callers; `tsc --noEmit --noUnusedLocals` run over the repo; grep census for `any`, `fetch(`, `useEffect`, `toast`, `localStorage`, hard-coded URLs/colors, a11y attributes, i18n usage.
**Out of scope but referenced where it explains a UI defect:** `src/app/api/**`, `src/lib/**`, `src/components/layout/**`, `src/components/marketing/phone-mockup.tsx`, `src/components/profile/public-newsletter-block.tsx`.
**Read-only audit — no source, package, or database file was modified.**

---

## 0. Executive summary

The dashboard is a large, largely self-consistent client-side SPA layered on a small server shell. The **server side is the strong part** (Zod on every mutation, ownership checks on every `PATCH/DELETE`, clean `tsc` under `strict`). The **client side carries the defects**, and they cluster into five themes:

1. **Metrics that are wrong or fabricated.** The Overview KPIs mix a 100-event sample with all-time counters (`src/app/dashboard/page.tsx:35-45`) and the performance chart *invents random data* when the API returns nothing (`src/components/dashboard/overview-charts.tsx:26-40`), then labels it "Real-time track".
2. **Preview ≠ published page.** The "Live Interactive Preview" ignores link scheduling, collections, branding, newsletter, bookings and store (`src/components/dashboard/dashboard-preview-panel.tsx:18,66-75`), and even shows a hard-coded *"Get your own Linktree"* button (`src/components/marketing/phone-mockup.tsx:414`).
3. **Silent persistence failures.** Several toggles/settings mutate *only* the React context, never the server: Verified badge (`src/app/dashboard/bio/page.tsx:216-222`), notification switches (`src/app/dashboard/settings/page.tsx:33-35,223-236`), header layout selection (`src/components/dashboard/header-layout-card.tsx:158-164`). Users see success and lose the value on reload.
4. **Optimistic writes without `res.ok` checks.** `links` (toggle/pin/mode/reorder) treats every HTTP response as success and never rolls back (`src/app/dashboard/links/page.tsx:234-311`); the same class of bug appears in settings' account deletion (`src/app/dashboard/settings/page.tsx:101-115`).
5. **No shared data layer.** There is one React context, no query cache, no debounce, no abort controller, no `router.refresh()`. Seven pages duplicate hand-rolled `useEffect + fetch + loading` blocks; the bookings search box fires one request per keystroke (`bookings/page.tsx:221-223`) and the audience page re-fetches (overwriting the unsaved customizer) on every filter change (`audience/page.tsx:125-127`).

Plus two **cross-cutting infrastructure problems** that visibly break dashboard features:

- `Subscription` table is **read but never written** → every user is treated as FREE by the store (`src/app/api/products/route.ts:26-29,55-59`; no `prisma.subscription.create/update` exists anywhere in `src`).
- The API error contract is inconsistent: profile/links routes return raw `ZodError.message` (a JSON blob) which the dashboard prints verbatim in a toast (`src/app/api/profile/route.ts:54-57`, `src/app/api/links/[id]/route.ts:48-50`).

**Health snapshot**

| Signal | Value |
|---|---|
| In-scope files | 45 (`.ts/.tsx`) |
| Pages/components > 500 lines | 6 (`store` 1425, `bookings` 1286, `links` 817, `audience` 709, `header-layout-card` 673, `onboarding` 612) |
| `tsc --strict` errors | 0 (clean typecheck) |
| Unused symbols in scope (`TS6133`) | **115** (79 in dashboard pages, 26 in `components/dashboard`) |
| `any` occurrences in scope | 63 across 25 files |
| `fetch(` call-sites (dashboard pages + onboarding) | 51 |
| Dashboard pages using `useI18n` | 1 of 16 (`shared/avatar-uploader.tsx` only) — dictionary exists in `src/lib/i18n.ts:28-45` |
| `localStorage` / `sessionStorage` in scope | 0 |
| `router.refresh()` in the whole dashboard | 0 |

---

## 1. Page-by-page map

### 1.1 Server vs client components

Only **two** in-scope routes are server components; the rest are fully client-rendered (`"use client"` at line 1):

| Route | Type | Notes |
|---|---|---|
| `src/app/dashboard/layout.tsx` | **Server** (`force-dynamic`) | Auth + Prisma read of profile/theme/links/collections, seeds a default profile+theme on first visit, mounts `DashboardProvider` |
| `src/app/dashboard/page.tsx` | **Server** (`force-dynamic`) | Overview KPIs, direct Prisma queries, no `fetch` |
| every other `dashboard/*/page.tsx` | **Client** | Read context on mount, `fetch` REST endpoints, local `useState` |
| `src/app/dashboard/ai/page.tsx` | Client | Orchestrates 7 AI tab components |
| `src/app/dashboard/qr/page.tsx` | Server (2-line re-export) | Alias of `qr-code/page.tsx` — duplicate public route |

### 1.2 Endpoint map

| Page | Purpose | Endpoints called | Cross-check |
|---|---|---|---|
| `/dashboard` (`page.tsx`) | KPI overview, top links, quick actions | none (Prisma in RSC) + `OverviewCharts` → `GET /api/analytics?range=14d` | ⚠️ `14d` is **not** a supported range (`src/app/api/analytics/route.ts:16-30` falls through to 30d) |
| `/dashboard/bio` | Display name, bio, category, layout, publish flag, verified badge | `PUT /api/profile`; `PUT /api/upload` and `PUT /api/profile` via `HeaderLayoutCard` | ⚠️ `verified` is not accepted by `profileUpdateSchema` |
| `/dashboard/links` | Link CRUD, ordering, pin, enable, YouTube embed carousel | `GET/POST/PUT /api/links`, `PATCH/DELETE /api/links/{id}` | ⚠️ 4 of 5 call-sites ignore `res.ok` |
| `/dashboard/collections` | Collection CRUD + link counts | `GET/POST /api/collections`, `PATCH/DELETE /api/collections/{id}` | ✅ contract matches (`{collection}`) |
| `/dashboard/appearance` | Theme studio + header layout | `PUT /api/theme`, `PUT /api/profile`, `POST /api/upload` | ⚠️ `fontBody` never persisted |
| `/dashboard/templates` | Template gallery / apply | `GET /api/templates`, `POST /api/templates/apply` | ⚠️ re-parses `stylesJson` client-side after server already applied it |
| `/dashboard/analytics` | Range KPIs, charts, referrers, devices, geo | `GET /api/analytics?range={today|7d|30d|90d|all}` | ✅ shape matches; ⚠️ no plan gating, no abort |
| `/dashboard/qr-code` + `/dashboard/qr` | Client-side QR PNG/SVG studio | none (`qrcode` lib) — `src/app/api/qr-code/route.ts` is **never called** by any client | ⚠️ hydrate mismatch on URL |
| `/dashboard/settings` | Username change, avatar, notifications, export, delete | `GET /api/profile/check-username`, `PUT/DELETE /api/profile`, `POST /api/upload` | ⚠️ delete ignores response status |
| `/dashboard/upgrade` | Pricing / Stripe CTA | **none** — `handleCheckout` only fires `setTimeout` + toast | ⚠️ upgrade does nothing |
| `/dashboard/ai` | 7 AI generators | `GET /api/ai/usage`, `POST /api/ai/generate`, `POST /api/ai/apply` | ✅ all 7 `type` strings match the server switch (`src/app/api/ai/generate/route.ts:57-98`) |
| `/dashboard/store` | Products, orders, refunds, payment panel | `GET /api/products`, `POST/PUT/DELETE /api/products`, `POST /api/products/reorder`, `GET /api/store/orders`, `POST /api/store/orders/refund`, `POST /api/upload` | ⚠️ tier read from `Subscription` table that nothing writes |
| `/dashboard/audience` | Subscriber list, newsletter form customizer, privacy info | `GET /api/subscribers`, `PUT /api/profile/newsletter`, `POST /api/subscribers/{id}/resend`, `DELETE /api/subscribers/{id}`, `GET /api/subscribers/export`; **`POST /api/subscribers`** from the "live preview" | ✅ newsletter contract matches; ⚠️ preview performs real writes |
| `/dashboard/bookings` | Bookings, appointment types, availability, settings | `GET /api/bookings`, `/api/bookings/types`, `/api/bookings/availability`, `/api/bookings/settings`; `PUT/POST/DELETE` types; `PUT` availability; `PATCH` settings; `POST /api/bookings/cancel`, `POST /api/bookings/reschedule` | ✅ params match; ⚠️ UTC handling |
| `/dashboard/domains` | Custom domain connect / verify / remove | `GET/POST/DELETE /api/domains`, `POST /api/domains/verify` | ✅ contract matches |
| `/onboarding` | 8-step wizard → publish | `GET /api/profile/check-username`, `POST /api/onboarding`, `POST /api/upload` | ⚠️ re-runnable, duplicates links |

### 1.3 Auth & plan plumbing (how the UI learns the plan)

```
getAuthenticatedUser()            src/lib/auth.ts:111
  └─ returns user.subscriptionTier: "FREE" | "PRO" | "BUSINESS"      auth.ts:14
        └─ DashboardLayout  initialTier={user.subscriptionTier as "FREE" | "PRO"}   layout.tsx:93
              └─ DashboardContext subscriptionTier state (read-only setter)          context:75,107
                    └─ bio / appearance / links / templates / domains / upgrade / ai
```

The cast at `src/app/dashboard/layout.tsx:93` **narrows away `BUSINESS`**: a BUSINESS user is rendered with FREE-tier gates everywhere in the dashboard (and `src/app/dashboard/domains/page.tsx:66` has to work around it with `(subscriptionTier as string) === "BUSINESS"`). Meanwhile the store reads a *different* table (`prisma.subscription.plan`) — see §3.1.

---

## 2. State & data flow

### 2.1 The one shared store: `DashboardContext`

`src/context/dashboard-context.tsx:70-84` exposes `profile`, `theme`, `links`, `collections`, `subscriptionTier`, mobile-preview flag, `updateProfile`, `updateTheme`, `setLinks`, `setCollections`, `refreshData`, and a **duplicate alias** `refreshDashboardData` (`:83`, `:148`) whose only consumer is `link-optimizer-tab.tsx:27,101`.

Design properties:

- **Single source of truth for the preview, not for the server.** Mutators are pure `setState` (`:110-116`); nothing marks data dirty, so "context updated" and "persisted" are indistinguishable to callers. This is the root cause of most bugs in §3.2.
- **`refreshData` (`:118-131`) is a full refetch** of `/api/profile` and replaces all four slices. Its only call-site refetches *everything* after applying a single AI link title (`link-optimizer-tab.tsx:101`). No dedupe, no `AbortController`, no error surface (`catch` logs to console only, `:129`).
- **`subscriptionTier` has a setter that is destructured away** (`const [subscriptionTier] = useState(...)`, `:107`) — plan changes never propagate to an already-open dashboard (e.g. after an upgrade you must hard-reload).
- **Unused import `useEffect`** (`:3`) — flagged by tsc.
- Context is initialized **once per layout render**; `initialLinks` are pre-sorted by the server (`[{isPinned: desc},{position: asc}]`, `layout.tsx:28`) but the client then mutates that array in place by appending (`links/page.tsx:222`), so client order can diverge from the server's sort (see §3.2-D).

### 2.2 How the "live phone preview" actually updates

```
server edit forms ──setState──► context.profile/theme/links ──► DashboardPreviewPanel ──► PhoneMockup
        │                                                             (client, layout-level)
        └── explicit Save (PUT) ──► DB ──► server data (only read on full navigation)
```

Mechanics and gaps:

- The preview panel is mounted **once in the dashboard layout** (`layout.tsx:104-106`) and re-renders on every context change — layout is genuinely live for name/bio/avatar/banner/theme/links order (`dashboard-preview-panel.tsx:10-34`).
- **It does not filter scheduled links.** It maps `links.filter(l => l.isEnabled)` (`:18`, `:66-75`), while the public page hides future/expired links (`src/components/profile/public-profile-view.tsx:123`). A creator who schedules a link for next week sees it live in the preview but not on their page.
- **It does not model collections.** Public profile groups links under collection headings (`public-profile-view.tsx:423-428`); preview renders a flat list.
- **It does not respect `showBranding`.** Public page conditionally renders branding (`public-profile-view.tsx:534`); preview always renders a hard-coded footer — including the wrong brand: *"Get your own Linktree"* and *"Cookie Preferences · Report · Privacy"* (`src/components/marketing/phone-mockup.tsx:408-421`).
- **It omits newsletter, bookings and store** entirely, so "exactly what your visitors see" claims in copy are inaccurate (`appearance:109`, `audience:601`).
- **`interactive={true}` click** shows an "Opening Link…" overlay for 1 s and never navigates (`phone-mockup.tsx:359-363,394-398`) — a misleading affordance.
- Link mapping is duplicated verbatim for the desktop and mobile-drawer variants (`dashboard-preview-panel.tsx:57-77` vs `:92-112`).

### 2.3 Optimistic-update patterns — three inconsistent flavours

| Pattern | Where | Correctness |
|---|---|---|
| Optimistic **with rollback** | `store/page.tsx:331-351` (publish), `:353-372` (feature), `:400-423` (reorder) — `if (!res.ok) throw` then `fetchProducts()` | ✅ good |
| Optimistic **without rollback, no status check** | `links/page.tsx:234-251,253-269,271-290,292-311` | ❌ silent divergence |
| No optimism; `setState` **before** request resolves and never re-synced | `bio/page.tsx:106-109,127-130` (typing pushes into context), `header-layout-card.tsx:158-164` | ⚠️ stale context if save fails |

### 2.4 Caching & refresh

- **No data cache.** Every page re-fetches on mount (`useEffect(..., [])`) — e.g. `templates/page.tsx:45-60`, `analytics/page.tsx:42-58`, `audience/page.tsx:125-127`, `store/page.tsx:191-194`, `domains/page.tsx:97-99`, `bookings/page.tsx:225-229`.
- **No `router.refresh()` anywhere in the dashboard** (verified by grep). Consequences:
  - Server-rendered overview KPIs (`dashboard/page.tsx`) are only as fresh as the last navigation (`force-dynamic` makes that usually acceptable).
  - Mutations performed in a client page don't invalidate the RSC payload for that same page; e.g. changing username in Settings updates context but the server-rendered layout keeps the old username until a reload.
- **Race conditions on read paths:** every fetch-in-effect is fired without `AbortController` or a request-id guard, so the last response to *arrive* wins, not the last request: `analytics/page.tsx:42-58` (range buttons), `audience/page.tsx:97-123` (filter/search), `bookings/page.tsx:157-174` (search), `templates` etc.
- **Undebounced search:** `bookings/page.tsx:221-223` calls `loadBookings()` on `[filter, search]`, i.e. one HTTP request + a DB query *and* a full metrics recompute (`api/bookings/route.ts:65-88`) per keystroke. `audience` re-fetches on explicit submit but also on every status-filter click (`:125-127`); `store` filters client-side (`:455-468`); `links` doesn't search server-side at all.

### 2.5 Error/loading-state inventory (what the user actually sees)

| Page | Loading | Error | Empty | Verdict |
|---|---|---|---|---|
| overview | RSC (none needed), chart spinner | ❌ fabricated fallback data | n/a | **misleading** |
| links | ❌ none (list renders instantly from context) | toast on throw only | `EmptyState` | partial |
| collections | ❌ none | toast | `EmptyState` | partial |
| templates | spinner `:123-126` | toast only in apply; **load errors swallowed** `:53-55` | ❌ blank grid | weak |
| analytics | spinner in chart only | ❌ data stays `null` → zeros rendered as if real | "No referrer data" only | **misleading** |
| store | text "Loading products…" | `if (res.ok)` else silently keeps empty → **empty-state shown on 500** `:159-165` | good | weak |
| audience | text "Loading subscribers…" | toast | good | ok |
| bookings | text | loaders only `console.error` `:168-171,185-189,201-203,216-218` | good | weak |
| domains | text | `if (res.ok)` only, no else → **error renders as "No custom domains connected"** `:83-88` | good | **misleading** |
| settings | n/a | toast | n/a | ok |
| qr-code | "Generating QR…" | `console.error` only `:58-60` | n/a | weak |

---

## 3. Correctness bugs

Severity: **P0** = wrong data shown / data loss / cannot use feature · **P1** = silently unsaved or wrong value in a real scenario · **P2** = UX/a11y/code-quality with user impact.

### 3.1 P0 — Store quotas are always FREE (PRO/BUSINESS users are downgraded)

`src/app/api/products/route.ts:26-29` and `:55-59` read the plan from `prisma.subscription` (`plan` default `"FREE"`, `prisma/schema.prisma:578-593`). A repo-wide grep finds **no writer**: the only `prisma.subscription*` calls are reads in this file (plus `prisma.subscriptionConsent` unrelated). There is no Stripe-subscription upsert, no seed row (`prisma/seed.js:603,617` set only `user.subscriptionTier: "PRO"`), no admin path.

Result: for **every** account `tier` is `"FREE"`, so
- the quota card renders "FREE Plan Storefront Quota" (`store/page.tsx:503-542`),
- PRO accounts are capped at **3 products** (`lib/store/config.ts:80-96`: FREE 3 / PRO 25),
- the Gateway panel reports a **9 %** platform fee for paying customers (`store/page.tsx:1042-1049`),

while `/dashboard/upgrade` and every other page read `user.subscriptionTier` and correctly show PRO. Two conflicting answers to "what plan am I on?" on adjacent pages.

### 3.2 P0 — Unsaved-but-successful toggles and settings (context-only mutations)

| Feature | Code | What happens |
|---|---|---|
| **Verified badge** | `bio/page.tsx:216-222` → `updateProfile({ verified: val })` | Only context. `profileUpdateSchema` (`lib/validations.ts:58-88`) has no `verified` field, `PUT /api/profile` can't persist it, and no creator-facing endpoint sets it (only `src/app/api/admin/users/route.ts:34`). The PRO gate at `:206-210` is client-only. The badge appears in the live preview (`dashboard-preview-panel.tsx:64`) and disappears on reload. |
| **Notification preferences** | `settings/page.tsx:33-35`, rendered `:223`, `:235` | `emailAlerts` / `weeklyDigest` are local state; there is no request. Reload resets to `true`. `marketingNews` (`:35`) is dead state — no UI at all. |
| **Header layout choice** | `header-layout-card.tsx:158-164` | `setCurrentLayout` + `updateProfile` + toast **"Layout switched to…"** — no `PUT`. Saved only if the user separately clicks this card's Save (`:237-269`) or the page's Save. In `appearance/page.tsx:127-136` the same handler *does* persist (and `catch {}` swallows failures) — the same component behaves differently on two pages (copy/paste drift). |

### 3.3 P0 — Layout "Save" clobbers a concurrently edited display name

`HeaderLayoutCard` copies its `title` prop into local state **once**, on mount (`header-layout-card.tsx:105-112`) and has no effect re-syncing it from `title` (contrast `:133-143` which sync the layout and avatar). `bio/page.tsx` renders *both* the card's Title field (`:98-110`) and a separate "Display Name" input (`:124-131`).

Repro: type "New Name" in **Display Name** → click **Save** in the Header card → `handleSave` sends `displayName: currentTitle` (the stale value, `header-layout-card.tsx:243-248`) → the newer name is overwritten in the DB. Symmetrically, the parent's own Save (`bio/page.tsx:51-86`) does not send `bannerUrl`, while the card's Save does not send `bio/category/isPublished` — two save buttons with partial, overlapping payloads.

### 3.4 P0 — Overview KPIs are arithmetically incompatible, and CTR can exceed 100 %

`src/app/dashboard/page.tsx:35-45`:

```
analyticsEvents: { take: 100, orderBy: { createdAt: "desc" } }        // :35-38
totalViews  = events.filter(VIEW).length                              // :42  → ≤ 100
totalClicks = links.reduce(acc + l.clicksCount)                       // :43  → all-time
ctr         = totalClicks / totalViews * 100                          // :45
```

- "**Total Profile Views**" (`:95-104`) is capped at 100 — it is *not* a total.
- CTR divides all-time clicks by a 100-event window of views, so an established profile with >100 views of history shows a nonsense ratio (easily >100 %).
- The Analytics page computes the same four metrics correctly from one event window (`src/app/api/analytics/route.ts:44-50`) — so two dashboard pages disagree about the same numbers.

### 3.5 P0 — The performance chart fabricates data

`src/components/dashboard/overview-charts.tsx:25-40`: if `timeSeries` is empty (new account, API error, or 401), the component generates **`Math.random()`** view/click series and `setData(sample)`; the card then renders it under the heading *"Real-time track of views and unique link clicks"* (`:56-60`). There is no `if (!res.ok)` guard (`:23-24`). Additional mismatch: the request asks for `range=14d` (`:23`) which the API does not support (silently becomes 30 days, `api/analytics/route.ts:27-30`), while the fallback draws 7 days (`:29-38`), under a "Last 14 Days" title (`:56`).

### 3.6 P1 — Links: every mutation reports success without checking the response

`links/page.tsx:234-311`:

```ts
await fetch(`/api/links/${link.id}`, { method: "PATCH", ... });   // :242
toast.success(newStatus ? "Link enabled" : "Link hidden");        // :247
```

`fetch` does not reject on 4xx/5xx. A 401/403/500 therefore shows a success toast, keeps the optimistic state, and never rolls back — for enable (`:234-251`), pin (`:253-269`), embed-mode (`:271-290`) and reorder (`:292-311`). The reorder call also **ignores the server's canonical ordering** (`PUT /api/links` returns `{links}` sorted `isPinned desc, position asc`, `api/links/route.ts:117-122`): moving an unpinned link above a pinned one looks correct until reload, when pinned links snap back to the top. For contrast, the store page implements this pattern correctly (`store/page.tsx:331-351`).

Second ordering bug in the same file: a newly created link is appended to the client array (`:222`), while the server assigns `position = max+1` and sorts pinned-first (`api/links/route.ts:56-75`), so a new pinned link appears last in the dashboard and first on the public page.

### 3.7 P1 — Scheduling round-trips shift times by the browser's UTC offset

`links/page.tsx:107-108` loads `scheduledStart` (an ISO UTC string) via `.slice(0, 16)` into a `datetime-local` input. `:187-188` sends it back as `new Date(formScheduledStart).toISOString()`. A `datetime-local` value without an offset is parsed as **local** time (ECMA-262), so each open→save cycle moves the schedule by `-utcOffset`. In `Asia/Tashkent (+05:00)` a 10:00Z schedule becomes 05:00Z after one edit-and-save, and drifts 5 h on every subsequent save. Same class of bug in bookings (§3.8), and no timezone is ever shown or converted next to the picker.

### 3.8 P1 — Bookings: timezone-naive reschedule, undebounced search, defaults that vanish

- **Reschedule** builds `\`${date}T${time}:00.000Z\`` (`bookings/page.tsx:408`) and labels the field "New Time (UTC)" (`:1252`). The creator's configured timezone (`timezone` state, `:134`, persisted via `/api/bookings/settings`) is never applied, so a Tashkent host picking 14:00 books 19:00 local. The attendee-notification copy ("Save & Notify Attendee", `:1279`) makes the silent shift worse.
- **Search fires per keystroke**: `useEffect(() => { loadBookings(); }, [filter, search])` (`:221-223`), with the input updating `search` on every `onChange` (`:618-621`). No debounce, no abort, and the API does a `contains` query + a full metrics recompute on each call (`src/app/api/bookings/route.ts:18-101`).
- **Displayed availability defaults are not in state.** For a day with no DB rule the UI renders a synthetic Mon–Fri 09:00–17:00 entry (`:882-887`), but `weeklyRules` stays empty; pressing "Save Availability" without toggling anything sends `rules: []` (`:322-337`) and persists "no availability", silently discarding what was on screen.
- **Revenue KPI hard-codes `$`**: `\`$${metrics.totalRevenue.toFixed(2)}\`` (`:465`) regardless of booking currency; per-booking prices are rendered unformatted (`{b.price} {b.currency}`, `:668-671`) instead of via `formatCurrency`.
- **Stale modal state**: `cancelReason` / `rescheduleDate` / `rescheduleTime` are only cleared on success and not when opening the modal for a different booking (`:374-430`, `:729-743`) → the previous customer's cancellation reason is pre-filled for the next one.
- `profile` is destructured but unused (`:99`), `loadingTypes` is set but never rendered (`:117`).

### 3.9 P1 — Audience: the "live preview" writes real subscribers, and filter changes erase unsaved settings

- The customizer's preview panel renders the **real** `PublicNewsletterBlock` (`audience/page.tsx:616-628`), which POSTs to `/api/subscribers` using the creator's **real `profile.id`** (`public-newsletter-block.tsx:60-70`). Typing a test address in "Interactive Live Preview" creates a real `PENDING` subscriber row, a consent record and an outbound double-opt-in email (`src/app/api/subscribers/route.ts:135-204`). A preview widget must not mutate data.
- `fetchSubscribers` writes the newsletter settings into form state on **every** call (`audience/page.tsx:102-116`), and the effect re-runs whenever `statusFilter` changes (`:125-127`) or the user submits a search (`:129-132`). Switching filters while editing the customizer silently reverts unsaved edits.
- Export is optimistic and undetectable: `window.open("/api/subscribers/export")` + unconditional success toast (`:134-137`); popup blockers silently swallow it, and a 401/500 still says "Downloading…".
- `handleDeleteSubscriber` decrements only `metrics.total` (`:160-163`), leaving `active`/`pending`/`unsubscribed` stale, and uses a native `confirm()` (`:151`) inconsistent with the app's own `ConfirmModal`.
- **Backend search is case-sensitive** for `name` (`api/subscribers/route.ts:31-36` has no `mode: "insensitive"` and lowercases the query only), so searching "Alex" finds nothing if the stored name is "Alex"… and searching "alex" fails too, because `contains` compares against the raw column. Same pattern in `api/bookings/route.ts:40-47`.

### 3.10 P1 — Settings: account deletion always "succeeds"

`settings/page.tsx:101-115`:

```ts
const res = await fetch("/api/profile", { method: "DELETE" });
toast.success("Account successfully scheduled for deletion.");
window.location.href = "/";
```

`res` is never checked (`tsc` confirms it is unused), so a 401/500 still toasts success and redirects. Additionally the action deletes only the **Profile row** (`api/profile/route.ts:60-77`) — the `User`, Clerk identity, links in other tables, AI usage and audit data remain, while the UI copy says "Permanently delete your BioSpace profile, published links, and analytics history" (`:263-265`) and the modal says "Yes, Delete Everything" (`:287`). That is a GDPR-affecting mismatch.

### 3.11 P1 — Upgrade is a stub; PRO is unreachable from the UI

`upgrade/page.tsx:24-38`: `handleCheckout` toasts "Connecting to Stripe Secure Checkout…", waits 1.2 s, then toasts an *engineering note* ("Configure STRIPE_SECRET_KEY in .env…"). No endpoint is called. `isYearly` exists but has no control (`:21`, `tsc`: `setIsYearly` unused) so the price is permanently "$8 / month (annual)". "Manage Billing in Stripe" has no `onClick` (`:66`). Combined with §3.1, there is no path for a user to become PRO from the UI.

### 3.12 P1 — Preview desync (cross-cutting)

See §2.2. Highest-value instance: scheduled links. `dashboard-preview-panel.tsx:18` filters only on `isEnabled`, public page filters on schedule (`public-profile-view.tsx:123`). Also the preview passes the raw `displayName || @username` (`:58`) and ignores `newsletterEnabled`/`bookingEnabled`/store.

### 3.13 P2 — Template apply: client re-parses after the server already committed

`templates/page.tsx:70-84`: the POST `/api/templates/apply` **applies the theme server-side and returns `{success, theme, layout}`** (`src/app/api/templates/apply/route.ts:13-58`). The client then ignores that payload and does `JSON.parse(template.stylesJson)` (`:80`) to update the local preview. If the stored `stylesJson` is malformed (or missing), `JSON.parse` throws *after* the DB write → the user sees "Failed to apply template" on a successful apply. The gallery cards also `JSON.parse` without validation into `any` (`:130-133`), and the returned authoritative `theme` is discarded, so server-applied defaults (e.g. `buttonStyle`, `fontBody`, `buttonRadius` merged by the route) may differ from what the preview shows.

### 3.14 P2 — Appearance: `fontBody` is edited in the preview but never saved

Font selection calls `updateTheme({ fontHeading: f, fontBody: f })` (`appearance/page.tsx:368-371`) but the save payload (`:79-93`) omits `fontBody` (and `backgroundImage`). `themeSchema` accepts both, the DB stores `fontBody`, the public page only uses `fontHeading` (`public-profile-view.tsx:145`) — so the field is a dead column end-to-end and the preview's body-font promise is unfulfilled. Also the component's initial fallback `theme?.buttonStyle || "filled"` (`:61`) is not one of the seven `buttonStyles` ids (`:35-43`), so a profile with the layout default `"filled"` (`layout.tsx:66`) shows **no selected style card** until the user clicks one.

### 3.15 P2 — QR page: hydration mismatch and download race

`qr-code/page.tsx:25-27` computes `publicUrl` from `window.location.origin` during render, with an SSR fallback of `https://biospace.com/...`. Server HTML and first client render therefore disagree on the rendered URL text (`:120`) → React 19 hydration error / flash. The same effect regenerates the 800 px PNG **and** the SVG on every colour keystroke (`:34-63`) with no debounce and no stale-response guard, so a slow earlier generation can overwrite a newer colour. `handleDownloadSVG` revokes the object URL immediately after `a.click()` (`:77-82`), which cancels the download in some browsers.

### 3.16 P2 — Bio: unsaved counters and raw validation errors

`bio/page.tsx:139-150` shows "`{bio.length} / 250 characters`" but the `Textarea` has no `maxLength`; saving a 400-char bio hits Zod and the toast prints the server's `ZodError.message` — the JSON issue array — because `api/profile/route.ts:54-57` returns `error.message` verbatim (identical pattern in `api/links/route.ts:82-85`, `api/links/[id]/route.ts:48-50`). Compare `api/profile/newsletter/route.ts:52-56`, which correctly returns `error.errors[0].message` — i.e. the codebase already knows the right pattern, it's just not applied consistently.

### 3.17 P2 — Onboarding: race in the availability check, re-runnable publish, stock avatar

- The debounced check (`onboarding/page.tsx:90-116`) has no request-id guard: typing `alex`→`alex2` quickly can let the `alex` response land last and mark `alex2` "unavailable"/"available" wrongly. (The 400 ms debounce itself is correctly cleaned up at `:115`.)
- `POST /api/onboarding` **upserts** the profile (`api/onboarding/route.ts:39-58`) and **appends** every supplied social link (`:100-117`). Visiting `/onboarding` again after finishing (nothing redirects away) re-runs it and duplicates all links.
- The default avatar is a stock Unsplash photo used as the user's published avatar before any consent/choice (`:56-61`, `:76`), and step 8 falls back to a developer handle: `biospace.com/{username || "shahuztech"}` (`:551,557`).

### 3.18 P2 — Domains page hides backend failures as an empty state

`domains/page.tsx:80-95`: `const data = await res.json(); if (res.ok) { … }` — on 401/500 the catch never fires, `domains` stays `[]`, `loading` becomes false, and the page renders "No custom domains connected" (`:319-326`). The user is told they have no domains when the request actually failed.

### 3.19 P2 — Store: reorder breaks under any active filter; placeholder data is saved as real content

- `filteredProducts.map((p, index) => … handleMovePosition(index, …))` (`store/page.tsx:776-798`) passes the **filtered** index into a function that swaps entries in the **unfiltered** `products` array (`:400-410`). With a search term or type filter active, the up/down chevrons move the wrong product. The disabled condition also compares against `products.length` instead of the filtered length (`:798`).
- "Create Product" pre-fills a live Unsplash URL as the cover and `https://example.com/assets/download-package.zip` as the deliverable (`:217-219`). A creator who fills only title+price publishes a product that delivers a dead `example.com` link to paying customers.
- `parseFloat(price) || 0` (`:295`) silently converts garbage/empty input to `0` (a free product), and the `<Input type="number" min="0">` does not prevent negative values from being typed in all browsers (server schema is the only guard).

### 3.20 P2 — Analytics page fetches, then ignores a metric it pays for

`analytics/page.tsx:62` computes `topLinks` from the API response and never renders it (tsc: unused). The API builds the whole top-links aggregation (`api/analytics/route.ts:65-75`) on every request. Dead feature, wasted payload. Additionally the page exposes `90d`/`all` to every plan even though `/dashboard/upgrade:100-105` sells "Basic 7-day analytics" for FREE and "Full 90-day analytics" for PRO — there is no gating client- or server-side.

---

## 4. API contract cross-check (client ⇄ route handler)

| # | Client expectation | Server reality | Verdict |
|---|---|---|---|
| 1 | `GET /api/profile` → `{profile, theme, links, collections}` (`context:120-126`) | returns exactly that (`api/profile/route.ts:26-31`) | ✅ |
| 2 | Verified-badge toggle mutates only the client context (`bio:216-222`) | no creator-facing endpoint sets `verified`; `profileUpdateSchema` has no such field (only `api/admin/users/route.ts:34`) | ❌ silent no-op |
| 3 | `PUT /api/theme` accepts all appearance fields (`appearance:79-93`) | `themeSchema.partial()`; `fontBody` supported but never sent | ⚠️ partial |
| 4 | `PATCH /api/links/{id}` `{isEnabled}` / `{isPinned}` / `{displayMode}` (`links:245,263,280`) | `linkSchema.partial()` accepts all three | ✅ |
| 5 | `PUT /api/links` `{linkIds}` and use returned order (`links:306`) | accepts, returns re-sorted `{links}`, client ignores | ⚠️ |
| 6 | `POST /api/links` → `{link}` appended to state (`links:222`) | `{link}` 201, server assigns `position`, sort is pinned-first | ✅ shape / ⚠️ order |
| 7 | `GET /api/templates` → `data.templates` with `stylesJson` (`templates:48-52,80`) | `{templates}` full rows (`api/templates/route.ts:6-11`) | ✅ |
| 8 | `POST /api/templates/apply` `{templateSlug}` (`templates:70-74`) | applies + returns `{theme, layout}`; client ignores response | ⚠️ |
| 9 | `GET /api/analytics?range=14d` (`overview-charts:23`) | unknown range → 30 d | ❌ unsupported value |
| 10 | `GET /api/analytics?range=…` shape (`analytics:60-65`) | `{summary{ctr:string},timeSeries,deviceBreakdown,referrerBreakdown,countryBreakdown}` | ✅ |
| 11 | `GET /api/subscribers` → `{subscribers, metrics, newsletterSettings}` (`audience:99-116`) | exact match (`api/subscribers/route.ts:63-81`) | ✅ |
| 12 | `PUT /api/profile/newsletter` with 7 fields (`audience:176-184`) | `newsletterSettingsSchema` accepts all 7 (`api/profile/newsletter/route.ts:20-33`) | ✅ |
| 13 | `GET /api/ai/usage` → `json.stats.quota` (`ai/page.tsx:52-54`) | `{stats:{…quota}}` (`api/ai/usage/route.ts:15-18, lib/ai/usage.ts:105-121`) | ✅ |
| 14 | `POST /api/ai/generate` `type` strings ×7 | all 7 present in server switch (`api/ai/generate/route.ts:57-98`) | ✅ (good) |
| 15 | `POST /api/ai/apply` `{target,generationId,payload}` | schema matches; but `theme` target fills missing fields with hard-coded defaults (`api/ai/apply/route.ts:59-90`) — a partial AI theme resets unrelated user colours | ⚠️ data-loss risk |
| 16 | `GET /api/products` → `{products, subscription{tier,maxProducts,currentCount,canAddMore}}` (`store:158-165`) | shape matches, but `tier` from unpopulated `Subscription` table (`api/products/route.ts:26-40`) | ❌ wrong tier |
| 17 | `PUT /api/products` with `id` in body (`store:307-311`) | requires `validated.id` (`api/products/route.ts:113-155`) | ✅ |
| 18 | `DELETE /api/products?id=` (`store:380`) | reads `searchParams.get("id")` (`:172-177`) | ✅ |
| 19 | `POST /api/products/reorder` `{items:[{id,position}]}` (`store:409-417`) | matches schema (`api/products/reorder/route.ts:6-13`) | ✅ |
| 20 | `GET /api/bookings?filter=&search=` and `{bookings, metrics}` (`bookings:160-167`) | matches (`api/bookings/route.ts:18-101`) | ✅ |
| 21 | `POST /api/bookings/reschedule` `{bookingId,newStartTime}` (`bookings:410-417`) | ISO accepted, but client constructs a fake-UTC string | ⚠️ value wrong |
| 22 | `DELETE /api/domains?id=` (`domains:163`) | `searchParams.get("id")` (`api/domains/route.ts:104-111`) | ✅ |
| 23 | `GET /api/domains` → `{domains,isPro}` (`domains:84-88`) | exact (`api/domains/route.ts:38-42`) | ✅ |
| 24 | `POST /api/onboarding` `{username,displayName,category,bio,avatarUrl,socialLinks,templateSlug}` (`onboarding:138-150`) | validates `usernameRegex` only; silently accepts everything else, upserts, appends links | ✅ shape / ⚠️ semantics |
| 25 | `POST /api/upload` from 4 different components | **no auth gate** despite calling `getAuthenticatedUser()` (`api/upload/route.ts:17-18`); allows `image/svg+xml` (`:6-12`) served from `/public/uploads` → stored-XSS vector on the app origin | ❌ (security) |

---

## 5. Code quality

### 5.1 Size / duplication

- **Six files > 500 lines** (§0). `store/page.tsx` (1425) and `bookings/page.tsx` (1286) each implement 3–4 tabs of unrelated CRUD + modals inside one component with 30–50 `useState` hooks. Extract per-tab components + one form hook.
- **Answer duplication:** every page re-implements `useState(loading) + useEffect(fetch) + if(!res.ok) toast`. An `useApiResource`/SWR-style hook would delete ~400 lines and fix the seven loading/error inconsistencies in §2.5.
- **Seven AI tabs are near-identical copies** (`components/dashboard/ai/*-tab.tsx`, 208–453 lines each): same generate/apply/copy/edit skeleton, same `quota: any` callback, same `setTimeout(…, 2000)` copy-reset. One generic `AIGeneratorPanel` with per-type renderers would remove ~1 200 lines.
- **Preview link mapping duplicated** (`dashboard-preview-panel.tsx:57-77` vs `:92-112`).
- **`DashboardHeader` has two parallel prop APIs** — `title|description|action` and `heading|text|children` (`components/layout/dashboard-header.tsx:12-33`); 12 pages use the first form, `audience` (`:199-202`) and `store` (`:472-475`) use the second. Normalize to one.
- **Two confirm-dialog idioms:** `ConfirmModal` (links/collections/settings) vs `window.confirm` (`bookings:310`, `store:375`, `audience:151`).

### 5.2 Dead code — 115 unused symbols (tsc `TS6133`)

Most consequential (full list reproducible with the command in §8):

| Location | Symbol | Why it matters |
|---|---|---|
| `bio/page.tsx:27-38` | `layouts` (10 entries) | Dead duplicate of `LAYOUT_OPTIONS` (`header-layout-card.tsx:30-61`, only 5 entries). The UI therefore cannot select `minimal/gradient/modern/glass/creator` although the schema and public renderer support them — **feature gap hidden as dead code** |
| `bio/page.tsx:69` | `json` | response parsed then dropped |
| `analytics/page.tsx:62` | `topLinks` | fetched, computed, never shown |
| `upgrade/page.tsx:21` | `setIsYearly` | no billing toggle exists |
| `settings/page.tsx:35` | `marketingNews` | dead preference |
| `settings/page.tsx:104` | `res` | **the delete-response that should be checked** |
| `bookings/page.tsx:99,117` | `profile`, `loadingTypes` | no loading state in Types tab |
| `ai-usage-meter.tsx:22` | `totalGenerationsCount`, `totalTokens` | props advertised, never rendered; `onRefresh` (`ai/page.tsx:80`) is wired to nothing |
| `dashboard-context.tsx:3` | `useEffect` | unused import |
| `overview-charts.tsx:4` | `CardHeader/CardTitle/CardContent` | unused imports |
| `qr-code/page.tsx:3,11-17` | `useRef`, `QrCode`, `Share2`, `ExternalLink`, `Copy`, `Check` | unused |
| ~20 more | misc. lucide icons | 79 in pages, 26 in `components/dashboard` |

Also dead/duplicated routes & endpoints: `/dashboard/qr` re-exports `/dashboard/qr-code` (`qr/page.tsx:1-3`), and `src/app/api/qr-code/route.ts` has **zero client callers**.

### 5.3 `any` (63 occurrences / 25 files)

- `analytics/page.tsx:39` `useState<any>` then `(r:any)`, `(d:any)`, `(c:any)` in three render maps (`:243,285,304,327`) — the response shape is known and stable, define one `AnalyticsResponse` type.
- `bookings/page.tsx` (6): `catch (err: any)` ×5, `where: any` server-side.
- `layout.tsx:89-93` four `as any` casts to feed the context — evidence the Prisma model and `ProfileData`/`ThemeData` interfaces have drifted; derive the context types with `Prisma.ProfileGetPayload`.
- All `onSuccessGeneration?: (quota: any)` props (7 AI tabs + `ai/page.tsx:63`).
- **Positive note:** the API layer mostly uses `z.infer` and real interfaces; `strict` passes. The `any` debt is concentrated in the client.

### 5.4 Styling: three design systems and ~145 dead Tailwind class occurrences

The dashboard simultaneously uses:
1. semantic tokens from `globals.css` (`bg-surface`, `text-secondary`, `border-border`, `text-text-primary` — e.g. `avatar-uploader.tsx:199,260,284`, `theme-toggle.tsx:22`, `links/page.tsx:468`),
2. raw `zinc-*`/`emerald-*` palettes (the vast majority of pages),
3. ad-hoc hex (`bg-[#7839ee]` + `hover:bg-[#6d28d9]` in **10 places** — `dashboard/page.tsx:69,84`, all seven AI tabs, `header-layout-card.tsx:406`; `bg-[#e11d48]` ×3 in `header-layout-card.tsx:454,470,505`).

Brand colour is also literal per-page: AI = purple, bookings = violet-600, store = emerald→teal, dashboard CTA = `#7839ee`, links YouTube = red. No `brand` token use despite `tailwind.config.ts:59-71` defining one.

**Silently dead utilities** (Tailwind 3.4 has no such keys; the JIT drops them with no warning — verified against `tailwindcss/defaultTheme`):

| Class | Count | Effect |
|---|---|---|
| `animate-in` / `fade-in` / `zoom-in-95` / `slide-in` | 36 / 32 / 6 / 5 | `tailwindcss-animate` is **not installed** (`package.json` has no such dep) and `tailwind.config.ts:104` has `plugins: []` — **every entry animation in the dashboard is a no-op** |
| `shadow-xs` | 32 | not in v3.4 scale (`sm|DEFAULT|md|lg|xl|2xl`) — intended soft shadows absent |
| `shadow-2xs` | 17 | same |
| `scale-115`, `active:scale-98` | 2 / 4 | not in scale (…105,110,125…) |
| `h-13`, `w-13` | 3 / 1 | 13 is not in the spacing scale |
| `backdrop-blur-xs` | 3 | not a v3.4 key |
| `scrollbar-none` | 3 | needs a plugin |
| `dark:hover:bg-zinc-850` | 1 (`ui/button.tsx:44`) | no 850 shade |

**Typography/state inconsistency:** font sizes are ad-hoc across the same kind of control (`text-[10px]`, `text-[11px]`, `text-xs`), and the same “primary save” action is `rounded-xl`, `rounded-2xl`, or `rounded-full` depending on the page.

### 5.5 Accessibility basics

- **Modals** (`ui/modal.tsx:40-77`): no `role="dialog"`, no `aria-modal`, no `aria-labelledby`, **no focus trap**, no initial focus, focus not restored on close. ESC and backdrop-click work (`:24-36,43-46`); the close button *does* have `sr-only` text (`:55-61`). Every dashboard dialog (10+) inherits this.
- **Icon-only buttons without accessible names:** `links/page.tsx:491-508` (edit/delete), `:388-403` (reorder), `collections/page.tsx:164-179`, `bookings/page.tsx:821-836`, `domains/page.tsx:387-397`, `header-layout-card.tsx:371-390` (undo/redo use `title` only). `title` ≠ accessible name in several AT/browser combos.
- **Clickable `div`s (not keyboard-reachable, no role):** layout cards (`header-layout-card.tsx:431-440`), category chips (`bio:160-176`), gradient swatches (`appearance:189-205`), button-style cards (`appearance:250-269`), template cards (`templates:464-473`), onboarding category/template cards (`onboarding:291-299,464-472`), newsletter layout cards (`audience:511-522`), product-type cards (`store:1126-1140`), avatar/banner upload triggers (`header-layout-card.tsx:546-571,607-630`).
- **Invalid nesting:** `<Link><Button/></Link>` (interactive inside anchor) in `dashboard/page.tsx:56-62,83-88` and `<a><Button/></a>` in `onboarding/page.tsx:556-566` — while other pages correctly use the `Button asChild` API (`audience:205-215`, `store:478-489`, `domains:262-270`). So the component supports the right pattern, it's just applied inconsistently.
- **`Button asChild` is a hand-rolled `cloneElement`** (`ui/button.tsx:62-67`) that drops the `ref` and merges one level of props — fragile; `@radix-ui/react-slot`-style handling is the standard fix.
- **Images:** decorative `alt=""` is used correctly for avatars (`dashboard-header.tsx:86`, `avatar-uploader.tsx:300`) but `AvatarUploader`'s preset `<button>`s are unlabeled (`:289-302`), and `next/image` is not used for user content in most places (raw `<img>` with arbitrary URLs).
- **Colour-only state**: active filters/tabs are conveyed by background/border only with no `aria-pressed`/`aria-selected` — `audience:352-363`, `bookings:601-613`, `bio:158-176`, `analytics:81-93`.

### 5.6 i18n coverage in the dashboard: effectively 0 %

`src/lib/i18n.ts` defines full `en/ru/uz` dictionaries **including a `dashboard` section** (`:28-45`) and the header exposes a `LanguageToggle`. In the whole audited area **only one component consumes it** (`shared/avatar-uploader.tsx:17,39`), and even there the strings are partly hard-coded: the file-error toasts only handle `uz` vs English (`:101-105` — Russian users get English), the save button says the Uzbek `"Saqlash"` inside an otherwise English UI (`:277`), and the drop hint mixes English and metric limits.

Everywhere else strings are hard-coded in a **three-way mix of English and Uzbek**, often in the same component:
- English UI + Uzbek toasts: `header-layout-card.tsx:191,213,234,263,305,347`; `links/page.tsx:284,288,470`; labels `:581,624,651,659`.
- `settings/page.tsx:129` "Profile Photo / Profil Rasmi"; `onboarding/page.tsx:340` "Profile Avatar / Profil Rasmi".

With `<html lang>` presumably `en` (root layout), the language toggle is a dead control for the entire dashboard.

Also locale-dependent formatting is hard-coded rather than localized: `toLocaleDateString()`/`toLocaleString("en-US", …)` in `audience:422,427`, `bookings:678-681`, `store:985`, `domains:355`, and `$`-only currency formatting (§3.8).

---

## 6. Prioritized fixes (10)

Effort: S < 1 h, M ≈ half day, L ≈ 1–2 days. "Impact" = user-visible value/risk removed.

| # | Fix | Where | Effort | Impact |
|---|---|---|---|---|
| 1 | **Stop the store from reading a never-written `Subscription` plan.** Either write `Subscription` on tier change (webhook/admin) or make `api/products` use `user.subscriptionTier` like the rest of the app; add a seed row for PRO demo users. | `api/products/route.ts:26-40,55-60`; `prisma/schema.prisma:578` | S | PRO/BUSINESS stop being capped at 3 products and quoted a 9 % fee. Fixes the two-answers-to-one-question bug. |
| 2 | **Remove fabricated analytics / fix the overview KPIs.** Delete the `Math.random` fallback and render an honest empty state with a "no data yet" message; compute views/clicks/CTR from one Prisma `groupBy` over a real window (or reuse `/api/analytics`). | `overview-charts.tsx:23,26-40`; `dashboard/page.tsx:35-45` | S–M | Eliminates false data shown as "real-time"; CTR stops exceeding 100 %. |
| 3 | **Make preview match the published page.** Filter scheduled links (`isEnabled && schedule window`), group by collection, honour `showBranding`, render newsletter/booking sections, and replace "Get your own Linktree" with BioSpace. Extract the map to one component. | `dashboard-preview-panel.tsx:18,57-112`; `phone-mockup.tsx:408-421` | M–L | Kills the "my page doesn't look like the preview" class of support tickets, incl. the competitor-brand string. |
| 4 | **Persist or remove context-only mutations.** Wire Verified badge to a real endpoint (or hide it), persist notification switches (new preferences endpoint), and persist layout on selection. Until then every one of these is a lie. | `bio:216-222`; `settings:33-35,223-236`; `header-layout-card.tsx:158-164`; `layout.tsx:93` (BUSINESS cast) | M | 3 features stop silently reverting; BUSINESS users regain their gates. |
| 5 | **Add a `fetchJson` helper that throws on `!res.ok` and surfaces `errors[0].message`,** and adopt it in the 12 mutation call-sites that currently toast success unconditionally. Roll back optimistic state in `links` like `store` already does. | `links:234-311`; `settings:101-115`; `domains:80-95`; `bookings:157-229`; `audience:90-137`; server: `api/profile/route.ts:54-57`, `api/links/*` | M | Turns silent divergence into visible errors; removes JSON-blob toasts. |
| 6 | **Fix timezone round-trips.** Store/emit UTC ISO end-to-end, convert for display with the profile/booking timezone, and send `new Date(y,m,d,h,min)` → `toISOString()` instead of `"…Z"` literals. | `links:107-108,187-188`; `bookings:408,1252` | S–M | Scheduled posts and reschedules stop shifting by the host's UTC offset. |
| 7 | **Fix display-name split-brain between the Header card and the Bio form.** Single controlled source: lift `displayName` into one state, pass it down, remove the card's internal `currentTitle` copy (or add a sync effect), and dedupe the two save buttons into one payload. | `header-layout-card.tsx:105-112,166-171,237-269`; `bio/page.tsx:51-110` | S | Stops silent overwrite of a just-typed display name. |
| 8 | **Debounce + abort list/search fetches; add a data hook.** One `useApiResource`/debounce(300 ms) + `AbortController` for `bookings` search, audience filter/search, analytics range, templates, products. | `bookings:221-223`; `audience:125-132`; `analytics:42-58` | M | Removes 1-request-per-keystroke DB load and all out-of-order response bugs. |
| 9 | **Delete the 115 unused symbols and wire up (or delete) the dead features:** `topLinks` (render the "Top Performing Links" card the analytics API already computes), `setIsYearly` (add the monthly/annual toggle), `layouts` in bio (drive `LAYOUT_OPTIONS` from the schema's 10 values), dead AI-usage-meter props. | §5.2 table | S–M | ~115 lint errors gone; 3 half-built features completed instead of hidden. |
| 10 | **Make the design system real:** install/configure `tailwindcss-animate` (or delete 79 `animate-*` classes), define the missing shadow/scale/spacing steps in `tailwind.config.ts` (or replace the ~62 invalid shadow/scale/size classes), collapse the 3 palettes onto `brand`/semantic tokens, and add `role="dialog"` + focus trap + shared `aria-label`s in `Modal`/icon buttons. | `tailwind.config.ts:96-104`; `ui/modal.tsx:40-77`; `ui/button.tsx:44,62-67`; 20 icon buttons | M | All entry animations and soft shadows start working; keyboard/screen-reader users can operate the studio. |

### Recommended ordering

1 → 2 → 5 (correctness/trust) · 3 → 4 → 7 (product truth) then 6 → 8 (data hygiene), 9 → 10 (maintainability). Also do the security item **S1** below before any public launch.

---

## 7. Cross-scope findings for the Lead / other auditors (found while cross-checking dashboard callers)

These are outside my file scope but are **directly reachable from the dashboard**, so I'm reporting them rather than silently dropping them:

- **S1 (critical) — unauthenticated, same-origin SVG upload.** `POST /api/upload` calls `getAuthenticatedUser()` but never checks the result (`src/app/api/upload/route.ts:17-18`) and allows `image/svg+xml` (`:6-12`) written into `public/uploads` (`:43-55`). Any anonymous visitor can host attacker-controlled SVG/HTML on the app origin (stored XSS). Called from `avatar-uploader.tsx:129`, `header-layout-card.tsx:285,327`, `store/page.tsx:265`.
- **S2 (critical) — demo-user auth fallback.** If Clerk keys aren't "live-configured" and no session cookie exists, `getAuthenticatedUser()` returns `alex@creator.dev` (`src/lib/auth.ts:233-243`). A visitor with no session then renders that creator's dashboard (`layout.tsx:16-20` sees a non-null user). Combined with `isLiveClerkKeyConfigured()` (`:52-65`) this is a full auth bypass in any deployment without properly formed Clerk keys.
- **S3 — `Subscription` model has no writer** (§3.1) — likely also breaks any billing/fee logic elsewhere that reads it.
- **S4 — API error contract inconsistency:** `ZodError.message` leaked in `api/profile`, `api/links`, `api/links/[id]`; `api/ai/apply` returns `error.message` from Prisma (can reveal schema/constraint text). Reference pattern that does it right: `api/profile/newsletter/route.ts:52-56`, `api/products/route.ts:105-107`.
- **S5 — `force-dynamic` + profile creation in the layout** (`layout.tsx:37-85`) is a non-idempotent write during render; two concurrent first-loads can both create → unique constraint → 500, plus an orphan Theme write when the second `findUnique` re-fetch races. Move to a server action/`after()` or `upsert`.

---

## 8. What is good (deliberately noted)

- **Server-side validation is thorough and consistent**: `profileUpdateSchema`, `linkSchema`, `themeSchema`, `collectionSchema` (`src/lib/validations.ts`), `connectDomainSchema`, product/booking/subscriber schemas; `isValidSecureUrl` blocks `javascript:`/`data:`/`vbscript:`/`file:` (`lib/utils.ts:60-85`).
- **Ownership is verified on every mutation** I cross-checked (`api/links/[id]`, `api/collections/[id]`, `api/products` PUT/DELETE/PATCH, `api/domains` DELETE via `removeCustomDomain`, AI apply by `userId`). No IDOR found in the dashboard's reachable endpoints.
- **Type safety discipline at the API boundary:** `strict` compiles with zero real type errors; `tsc` finds only unused symbols.
- **No client-side secret storage:** zero `localStorage`/`sessionStorage`/cookie writes in the dashboard; no `dangerouslySetInnerHTML`.
- **PR quality on several pages:** `collections` (clean CRUD + `ConfirmModal`), `store` publish/feature toggles (optimistic **with** rollback), `ai` type dispatch (all 7 client `type` tokens match the server switch), audience newsletter settings (client fields exactly match `newsletterSettingsSchema`), domains (loading/empty/error-present UI, copy buttons, DNS table is genuinely useful).
- **Design tokens exist** and are used in the newer components (`shared/*`, `ui/*`, `avatar-uploader`) even though most pages bypass them — a migration path exists.
- The `Modal`/`ConfirmModal`/`EmptyState`/`CopyButton`/`Button` primitives are well-factored and consistently reused; the duplication is in the pages, not in the UI kit.

---

## 9. Reproduction appendix

```bash
# unused symbols (this report's §5.2 counts)
node node_modules/typescript/bin/tsc --noEmit --noUnusedLocals --noUnusedParameters
#   → 115 TS6133 in the audited scope (79 dashboard pages, 26 components/dashboard,
#     6 shared, 3 onboarding, 1 context)

# verify the dead Tailwind utilities are not generated
node -e "const d=require('tailwindcss/defaultTheme'); \
  console.log(Object.keys(d.boxShadow)); /* no xs/2xs */ \
  console.log(Object.keys(d.scale));   /* no 115/98 */"
grep -n "tailwindcss-animate" package.json tailwind.config.ts   # no output

# verify the Subscription table is never written
grep -rn "prisma\.subscription\." src | grep -v Consent   # only reads in api/products

# verify no refresh pattern in the dashboard
grep -rn "router\.refresh" src/app/dashboard src/components/dashboard   # no output

# verify preview ignores scheduling
grep -n "scheduledStart" src/components/dashboard/dashboard-preview-panel.tsx  # no output
grep -n "scheduledStart" src/components/profile/public-profile-view.tsx         # L123
```

*End of report.*
