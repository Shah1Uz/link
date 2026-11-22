# BioSpace — Verification Report

**Report ID:** 05 · **Area:** typecheck / test-suite / lint execution + database state after verification
**Auditor:** data-auditor · **Date:** 2026-11-09
**Status:** Final (read-only audit; only `docs/analysis/04-business-data.md` and this file were written)
**Companion:** `04-business-data.md` contains the defect analysis these commands do **not** catch.

---

## 1. Environment

| Item | Value |
|---|---|
| Workspace | `C:\Users\user\Desktop\Новая папка (7)` (Next.js 15 + Prisma 6 + SQLite) |
| OS / shell | Windows, PowerShell 7 (`pwsh`), commands launched through `cmd /c` (see §6) |
| Node.js | **v24.21.0** |
| npm | **11.19.0** |
| TypeScript (installed) | **5.9.3** (`package.json` asks `^5.7.3`) |
| Next.js (installed) | **15.5.28** (`package.json` asks `^15.1.4`) |
| Prisma / `@prisma/client` (installed) | **6.19.3** (`package.json` asks `^6.2.1`) |
| Zod (installed) | **3.25.76** (`package.json` asks `^3.24.1`) |
| Database | `prisma/dev.db` — SQLite, **942,080 bytes** at start of audit |
| Prisma schema ↔ DB | 47/47 tables present, every scalar field of `prisma/schema.prisma` exists as a column; generated client runtime DMMF matches schema (verified via `Prisma.dmmf`, incl. `User.passwordHash` and `Profile.newsletterEnabled/bookingEnabled` defaults = `false`) |
| Git state | Not clean: HEAD `80d5095` (2026-11-01) vs working tree **34 modified tracked files + 34 untracked entries** (incl. `prisma/dev.db`, `prisma/schema.prisma`, `package.json`, `scripts/test-suite.js`, `src/app/api/**`). This audit describes the **working tree**, not HEAD. |
| CI | No `.github/` directory, no CI workflow, no lint/typecheck/test gate in `package.json` scripts besides `next lint`/`next build`. |
| Env keys present (masked) | `DATABASE_URL=file:./dev.db`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, Clerk keys (test-shaped placeholders), `ADMIN_EMAIL_ALLOWLIST`, `AI_PROVIDER` |
| Env keys **empty/missing** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Stripe price IDs, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CUSTOM_DOMAIN_CNAME_TARGET`, `CUSTOM_DOMAIN_A_RECORD`, `SIMULATE_DNS_VERIFICATION`, `DEFAULT_BOOKING_TIMEZONE`, `GOOGLE_MEET_AUTO_PROVISION` — this is why most paid/integrated features are in simulated mode (`04-business-data.md` §1). |

> Note: the workspace was already dirty **before** this audit (e.g. seeded demo profile had `bio = "Test\n"`, `layout = "shape"`, and `prisma/dev.db` was 942,080 bytes with test residue). Results below describe that state; they are not reproducible from a fresh `git clone` without seeding.

---

## 2. Command results (headline)

| # | Command (as executed) | Exit code | Result | Time / notes |
|---|---|---|---|---|
| 1 | `cmd /c "npx tsc --noEmit"` | **0** | **0 errors, 0 output lines** | Completed well inside the 15-min background timeout |
| 2 | `cmd /c "npx tsc --noEmit --incremental false"` | **0** | **0 errors, 0 output lines** — full, non-incremental check | Forced to rule out stale `tsconfig.tsbuildinfo` (`incremental: true` in `tsconfig.json:22`) |
| 3 | `cmd /c "node scripts/test-suite.js"` | **0** | **202 assertions: 202 PASS / 0 FAIL**, 48 numbered sections | Requires the seeded `prisma/dev.db`; **mutated the DB** (see §5) |
| 4 | `cmd /c "npm run lint"` | **0** (misleading) | **No linting performed** — `next lint` stopped at the interactive "How would you like to configure ESLint?" prompt | Repeated with `CI=1` → identical prompt; exit 0 is a false positive |
| 5 | `cmd /c "git status --porcelain"` | 0 | 68 changed entries (34 modified, 34 untracked) | See §1 |

**Distinct project errors produced by the three verification commands: 0.**
Consequently there are no "first 10 errors with file:line" to list from tsc/test/lint — the tooling is green. The defects documented in `04-business-data.md` are invisible to these commands (they are runtime/business-logic/security gaps, not type or syntax errors). Only environment-level diagnostics occurred; they are listed separately in §6.

---

## 3. Typecheck — `npx tsc --noEmit` (PASS, with blind spots)

**Evidence**

```
Command: cmd /c "npx tsc --noEmit > %TEMP%\bio-tsc.txt 2>&1 & echo TSC_EXIT=%ERRORLEVEL%"
Stdout/stderr file size: 0 lines
TSC_EXIT=0

Command: cmd /c "npx tsc --noEmit --incremental false > %TEMP%\bio-tsc2.txt 2>&1 & echo TSC2_EXIT=%ERRORLEVEL%"
Stdout/stderr file size: 0 lines
TSC2_EXIT=0
```

**Interpretation.** The TypeScript program under `tsconfig.json` (strict mode, `noEmit`, `skipLibCheck: true`, `include: ["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"]`) compiles cleanly. Both the incremental and the forced full check return zero diagnostics, so this is not an artefact of a stale build cache.

**What `tsc` proves:** all `.ts/.tsx` imports resolve; Prisma-generated types match every Prisma call in `src/**`; Zod schemas type-check; no type-level regressions.

**What it does not prove**

1. **`allowJs: true` without `checkJs`** (`tsconfig.json:4`) — `prisma/seed.js` and `scripts/test-suite.js` (the two scripts used to populate and "verify" the project) are **not type-checked**.
2. `skipLibCheck: true` skips third-party type errors.
3. It cannot see runtime failures: `PrismaClientValidationError` against the stale PostgreSQL schema, fake/simulated integrations, transaction races, quota math, DNS bypass, unsigned webhooks, etc.
4. Dependencies are resolved from a `package-lock.json` that diverges from `package.json` ranges (installed Next 15.5.28 vs `^15.1.4`, Prisma 6.19.3 vs `^6.2.1`, TS 5.9.3 vs `^5.7.3`), so a fresh `npm ci` may type-check differently from this workspace.

---

## 4. Test suite — `node scripts/test-suite.js` (PASS, but self-referential)

### 4.1 Result

```
=================================================
Tests Completed: 202
Passed: 202
Failed: 0
=================================================
exit code: 0
```

Counted independently from the captured log: **202 `[PASS]` lines, 0 `[FAIL]` lines**; 48 numbered sections (`grep "Testing "`), script length **1,694 lines**.

Section coverage (summary): URL sanitisation, username rules, admin allowlist, DB profile/theme/links/collections, link CRUD, template catalogue (≥20 templates, 10 categories), analytics events, commerce domain, reserved usernames, RBAC, feature flags, support tickets, teams, YouTube embeds, AI validation schemas, AI tier limits, token/cost math, AI models persistence, AI apply, product CRUD + all 6 product types, storefront Zod, subscription limits, checkout/orders, "idempotent webhook", seller refunds, product views/clicks, subscriber creation + consent, double opt-in, duplicate e-mail, unsubscribe, search/CSV, GDPR erasure, newsletter settings, appointment types, weekly availability, slot math, booking creation/double-booking, reschedule, cancel, dashboard metrics, domain validation, PRO gate, domain connect/instructions, duplicate domain, "DNS verification lifecycle + SSL", profile resolution, admin domain controls, direct auth password hashing.

### 4.2 Why green does not mean working

The script is a standalone CommonJS file; the only external modules it requires are `@prisma/client` (`scripts/test-suite.js:1`), `zod` (`:215`) and `crypto` (`:1127`). It **never imports `src/lib/**` or any API route** (it cannot — they are TypeScript). Instead it **re-implements the logic under test** and then asserts against the copy:

| "Tested" behaviour | Reality |
|---|---|
| AI request schemas (§15) | Local `z.object` copies at `scripts/test-suite.js:217-254`, not `src/lib/validations/ai.ts`. |
| AI quota & cost (§16–17) | Local constants/`evaluateQuota`/`calculateCost` helpers at `:258-290`, not `src/lib/ai/usage.ts`/`config.ts` — so the month-rollover bug (AI-1) and TOCTOU race (AI-2) can never fail here. |
| Storefront Zod (§21) | Local schema copies at `:462-485` (and they differ from `src/lib/validations/product.ts`: the test copy uses `z.string().url()` for `imageUrl`; production accepts relative paths/data URLs). |
| Time-slot generation (§36) | Inline arithmetic loop at `:1095-1123`, not `generateAvailableSlots` — so the ignored timezone parameter (BK-1) is untested. |
| Double-booking (§37) | Hand-written transaction at `:1134-1192` that re-implements `createBooking`; asserts only the sequential case, no concurrency. |
| "Idempotent webhook" (§24) | Local helper `testProcessWebhook()` at `:619-...` that mimics the webhook; `processStripeWebhookEvent` is never called, no signature path, no real Stripe event. |
| "DNS verification lifecycle & SSL" (§45) | Direct `prisma.customDomain.update()` calls setting `VERIFYING → PROVISIONING_SSL → ACTIVE` (`:1504-1537`); `verifyCustomDomainDNS` is never invoked, no DNS is queried, no bypass is exercised. |
| Password security (§48) | Local `hashPasswordTest`/`verifyPasswordTest` copied from `src/lib/password.ts` (`:1620-1635`) instead of importing it. |
| HTTP/API behaviour | Not tested at all — no routes, middleware, auth cookies, rate limits, CSRF, or error-response assertions. |

**What the suite *does* prove (still useful):** the Prisma client works against `prisma/dev.db`; the mounted dataset satisfies the suite's data preconditions — §4 takes `findFirst` profile and requires `verified === true`, a theme, links and collections (`scripts/test-suite.js:71-84`; in our run this was profile `shahzod` with 4 links / 2 collections), §6 requires ≥20 published templates and exactly 10 categories (`:111-115`), and §18 hard-codes user `alex@creator.dev` (`:294`); the main models are writable/readable; several unique constraints reject duplicates (duplicate e-mail `:1657-1669`, duplicate domain `:1484-1500`, duplicate event id `:607-686`); database-level cascade behaviour works. It is effectively an integration/smoke test of the **database**, not of the business logic described in `04-business-data.md`.

### 4.3 Cleanup and residual mutation of `prisma/dev.db`

The suite deletes most of what it creates: links (`:105, :211`), analytics event (`:129`), AI generation (`:375`), orders/order items/payment events/products (`:735-744`), subscribers/tokens/consents/delivery logs (`:960-1001`), availability rules (`:1057, :1391`), bookings/notifications/appointment types (`:1385-1394`), domains/verifications/events (`:1604-1612`), direct-auth user (`:1672`); profile `bio`/`layout` are restored (`:370-374`).

**Not restored:** `AIUsage` counters and `AISettings` are upserted in §18 (`:318-349`) without cleanup, so the demo user's quota and settings are permanently modified on every run.

### 4.4 Measured DB mutation (before/after)

A byte-copy of `prisma/dev.db` was made immediately before the test run, and the live file was compared after.

| Measurement | Before | After |
|---|---|---|
| SHA-256 (copied file, live file is locked by other processes) | `23E08631CB5A8FF19205018951597B57A4B723452C1D64698A3E90ED7079D394` | `0AE1AA78059A4CB5C9044F6FD9DE345A6C1D33FE3348B02135EE3BE6B39E055B` |
| File mtime | `2026-11-08 23:39:42` | `2026-11-08 23:52:20` |
| Size | 942,080 B | 942,080 B (SQLite reuses pages; content changed) |
| `AIUsage` (`alex@creator.dev`) | `generationCount: 24`, `tokenCount: 3120`, `estimatedCost: 0.000102` | `generationCount: 25`, `tokenCount: 3240`, `estimatedCost: 0.000102` |
| `AISettings.preferredTone` / `updatedAt` | `tech_leader` / old | `tech_leader` / **updated** (row rewritten) |
| `AnalyticsEvent` count | 122 | 123 (+1; a concurrent process also had the DB open, so this delta is not solely attributable to this run) |
| All other table counts (User, Profile, Link, Template, Product, Order, PaymentEvent, Subscriber, Booking, AppointmentType, AvailabilityRule, CustomDomain, DomainEvent, AIGeneration, EmailDeliveryLog, EmailVerificationToken, SubscriptionConsent, OrderItem, …) | see 04 §9 | **identical after the run** (suite cleanup worked) |

**Conclusion: yes, `prisma/dev.db` was mutated by the test suite.** The durable, guaranteed mutation is the `AIUsage`/`AISettings` update on `alex@creator.dev`; the file hash and mtime changed; other rows were restored. During the audit the DB file was also concurrently locked by other processes (`Get-FileHash` returned *"the file is used by another process"* both before and immediately after the run), which is why hashes were taken on copies.

> Restore recommendation: keep a copy of `prisma/dev.db` before running `node scripts/test-suite.js` (or re-run `npm run prisma:seed` afterwards). The suite is safe for the *schema* but not byte-for-byte idempotent for AI counters/settings.

### 4.5 Test-suite limitations summarised

- No HTTP/route/middleware coverage; no real Stripe, Resend, DNS, Google Meet, TLS, or AI provider calls.
- Re-implements instead of imports → cannot detect regressions in `src/lib/**` (the entire 03/04/05 business logic).
- Single-threaded → cannot detect the double-booking race, quota race, or webhook concurrency.
- Hard-coded seeded-data expectations → fails on an empty DB; it cannot run in CI without seeding.
- No negative/security tests for the actual security findings in report 01 (unsigned cookie, unsigned webhook) or the DNS bypass DOM-1.

---

## 5. Lint — `npm run lint` (exit 0, but **nothing was linted**)

**Executed:** `cmd /c "npm run lint"` and again `cmd /c "set CI=1&& npm run lint"`.

**Observed output (identical both times):**

```
> biospace-saas@1.0.0 lint
> next lint

`next lint` is deprecated and will be removed in Next.js 16.
...
? How would you like to configure ESLint? https://nextjs.org/docs/app/api-reference/config/eslint
  Strict (recommended)
  Base
  Cancel  If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin.
```

**Exit code:** `0` (the process terminates after the prompt without linting).

**Why:** this project has **no ESLint configuration and no ESLint dependency at all**:

- `package.json` has `"lint": "next lint"` (package.json:9) but `eslint` and `eslint-config-next` are **not** in `devDependencies`; `node_modules/eslint` does not exist.
- No `.eslintrc*` and no `eslint.config.*` in the repo root.
- Next.js 15.5 detects the missing config and opens an interactive setup prompt; non-interactive execution ends without running any rule.

**Consequence:** the "lint passed" signal is a **false positive**. Zero lint rules executed, so React hooks violations, unused variables, `no-explicit-any`, accessibility rules, server/client boundary mistakes, etc. are unchecked. If `next lint` is invoked in an environment where stdin is a TTY (developer terminal), it will attempt to modify the project by installing ESLint — undesirable in an audit/CI context. Recommended: add `eslint@9` + `eslint-config-next` and a flat config, set `"lint": "eslint ."`.

---

## 6. Diagnostics observed (environment, not project errors)

The three project commands produced **no errors**. The following environment-level issues occurred while preparing them and were worked around; they do not indicate project defects:

1. PowerShell execution policy blocks `npx.ps1`: `npx : Невозможно загрузить файл C:\Program Files\nodejs\npx.ps1, так как выполнение сценариев отключено в этой системе` → all commands were executed via `cmd /c "npx …"`.
2. Sandbox denial writing outside the workspace: `Access is denied.` when redirecting tsc output to `..\tsc-out.txt` → output captured under `%TEMP%` instead.
3. SQLite file lock: `Get-FileHash : … файл используется другим процессом` before and after the test run → comparisons were done on `Copy-Item` snapshots; a concurrent process (another audit/test run) also had `prisma/dev.db` open.
4. Lead-reported harness issue `windows-acl-run: --temp is not an existing directory` affected some other runs in this session; the commands in this report nonetheless produced the captured outputs above, and the typecheck was re-run after the temp directory was repaired (`--incremental false`) with the same clean result.

No `prisma generate` and no `prisma db push` were executed (per audit constraints). The generated client was checked read-only instead: runtime `Prisma.dmmf` matches `prisma/schema.prisma`; only the saved copy `node_modules/.prisma/client/schema.prisma` (31,309 B, dated 2026-11-05 20:29) is stale versus the source (31,763 B, 2026-11-07 10:51) — cosmetic, since the runtime DMMF and the SQLite columns are correct.

---

## 7. What could not be verified in this environment

| Area | Why not verifiable here | Mitigation / what was done instead |
|---|---|---|
| Live Stripe checkout, webhooks, refunds | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs empty | Static control-flow audit in 04 §3; webhook signature/unsigned-fallback logic read directly |
| Subscription billing | No subscription checkout code exists at all | Grep-proven absence of `mode:"subscription"` / `stripe.subscriptions.*` |
| Real AI provider calls / retries / cost | `GEMINI_API_KEY`/`OPENAI_API_KEY` empty | Static audit of `provider.ts`; behaviour when keys present deduced from code |
| Real e-mail delivery (Resend) | No `RESEND_API_KEY` | Static audit; simulation branch traced |
| Real DNS verification + TLS | No domain under the audited host; no TLS automation exists | `dns/promises` code read; bypass logic proven statically; real lookups are what the code runs in this env (simulation flag unset) |
| Google Meet provisioning | No Google API integration exists | Grep-proven absence of `GOOGLE_MEET_AUTO_PROVISION` reader; fabricated URL code read |
| PostgreSQL behaviour / the PostgreSQL schema | No PostgreSQL server; its schema is stale | Schema-to-schema programmatic diff (32 vs 47 models, 31 missing fields) — conclusion is structural, not runtime |
| Browser/UI E2E, accessibility, visual regressions | Out of scope; no browser automation in this session | Covered by companion reports 02/03 |
| Concurrency (double booking, quota race, webhook race) | Single-process tooling; would require load harness against a running server | Reasoning from isolation levels + absence of unique constraints/locks documented as risk, not observed failure |

---

## 8. Reproduce (exact commands)

```powershell
cd "C:\Users\user\Desktop\Новая папка (7)"      # or the current workspace root

# 1. Typecheck (full, ignore stale incremental cache)
cmd /c "npx tsc --noEmit --incremental false"   # exit 0, no output

# 2. Test suite (requires seeded SQLite DB; mutates AIUsage/AISettings — back up dev.db first)
Copy-Item prisma\dev.db "$env:TEMP\dev.db.bak" -Force
cmd /c "node scripts/test-suite.js"             # exit 0, "Passed: 202 / Failed: 0"

# 3. Lint (currently a no-op / interactive prompt; not a real gate)
cmd /c "npm run lint"

# 4. Working-tree state used for this audit
cmd /c "git status --porcelain"
```

---

## 9. Verification verdict

| Dimension | Verdict |
|---|---|
| Type safety | **Green** — 0 TypeScript errors in two independent runs; but JS scripts and runtime behaviour are unchecked. |
| Automated tests | **Green on paper, weak in value** — 202/202 pass, yet the suite tests re-implemented copies of the logic and the database only; it cannot detect any of the high-severity business-logic/security defects in 04. |
| Lint | **Not enforced** — command exits 0 without running ESLint; no config and no dependency. |
| Build/test gate in CI | **Absent** — no `.github/`, no script besides `lint`/`build`; nothing prevents shipping broken commits. |
| Database | Coherent with `schema.prisma` (47/47 tables, all scalar columns, runtime DMMF in sync); `prisma/dev.db` **was mutated** by the test suite (hash + `AIUsage` 24→25 / `tokenCount` 3120→3240); it was already dirty before the audit. |
| Overall project health signal | Compiles and "tests green", but those signals are misleading: the product is a demo-grade implementation with simulated payments/AI/e-mail/TLS, dead enterprise schema, and a stale PostgreSQL schema. See `04-business-data.md` §§1–11 for the evidence. |

*All commands above were strictly read-only toward the project except the project's own test suite, which writes to `prisma/dev.db`; no source, config, Prisma client, or schema file was modified by this audit.*
