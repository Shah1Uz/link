# BioSpace — kod bazasini o'rganish: umumiy hisobot

**Sana:** 2026-11-09 · **Rejim:** faqat o'qish (source fayllar o'zgartirilmagan; faqat `docs/analysis/` ga hisobotlar yozildi)
**Tekshirilgan holat:** ishchi daraxt (working tree), HEAD `80d5095` + commit qilinmagan 34 ta o'zgartirilgan va 34 ta yangi fayl.

Bu hujjat 4 ta chuqur auditni birlashtiradi:

| Hisobot | Qamrov | Fayl |
|---|---|---|
| 01 | API layer + auth/xavfsizlik (57 route, 92 handler) | `docs/analysis/01-api-security.md` |
| 02 | Dashboard / creator studio UI (16 sahifa, 45 fayl) | `docs/analysis/02-dashboard-ui.md` |
| 03 | Marketing sayt, public profil, admin panel, i18n | `docs/analysis/03-public-admin-ui.md` |
| 04 | Biznes-logika (AI, to'lov, booking, domen, email), Prisma modeli | `docs/analysis/04-business-data.md` |
| 05 | tsc / test-suite / lint natijalari va DB holati | `docs/analysis/05-verification.md` |

---

## 1. Loyiha nima?

**BioSpace** — "link-in-bio" SaaS platformasi (Linktree uslubida): creator o'zining bir sahifali profilini yaratadi, havolalar, do'kon, newsletter, bron qilish va analitika oladi. Ichida admin panel ham bor.

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind 3.4 · Prisma 6 · SQLite (dev) / PostgreSQL (prod, da'vo) · Clerk auth · Stripe · Gemini/OpenAI · Recharts · qrcode.
- **Hajm:** `src` + `prisma` = **174 fayl, ~28 500 satr**. 34 ta sahifa, 57 ta `route.ts` (92 HTTP handler), **47 ta Prisma model** (601 field, 80 indeks, 28 unique).
- **Git holati:** oxirgi commitdan keyin juda ko'p o'zgarish commit qilinmagan — loyiha "ishlab bo'lingan, lekin yig'ilmagan" holatda.

### Arxitektura xaritasi

```
src/
├── middleware.ts        multi-tenant host routing + Clerk (fail-open!)
├── app/
│   ├── page.tsx, about, features, pricing, faq, templates, contact…   marketing
│   ├── [username]/          public profil (RSC + Prisma)
│   ├── dashboard/           creator studio (16 sahifa, aksariyati client)
│   ├── admin/               mission control (11 bo'lim, real DB)
│   ├── api/                 57 route / 92 handler
│   ├── sign-in, sign-up, onboarding
│   └── layout.tsx           ClerkProvider + ThemeProvider + I18nProvider
├── components/  marketing · layout · dashboard · profile · ui · shared
├── context/     dashboard-context (yagona shared store)
└── lib/         auth, rbac, prisma, utils, validations,
                 ai/ store/ booking/ domain/ email/ validations/
prisma/          schema.prisma (47 model) · schema.postgresql.prisma (eskirgan)
scripts/         test-suite.js (1694 satr, "202/202 PASS")
```

---

## 2. Nima haqiqatan ishlaydi (kuchli tomonlar)

1. **Public profil** `/username` — server-side render, real Prisma ma'lumotlari bilan; 404/unpublished holatlar to'g'ri ishlangan.
2. **Dashboard CRUD** — links, collections, theme, profile, products, bookings, domains: har bir mutatsiyada **Zod validatsiya** va **egalik tekshiruvi** bor. Klassik IDOR topilmadi.
3. **Admin panel — mock emas.** 11 bo'limning barchasi real Prisma ma'lumotiga ulangan (Math.random / hardcode array yo'q). Faqat 3 ta "sun'iy" joy bor (§7).
4. **Ma'lumot modeli** kuchli: 47 model, 80 indeks, 28 unique, kaskadlar belgilangan; AI/booking/domain oqimlari `$transaction` ichida.
5. **Xavfsizlik bo'yicha ijobiy:** SQL injection yo'q (100% Prisma, raw SQL ishlatilmaydi), `dangerouslySetInnerHTML` yo'q, parollar scrypt + timingsafe, havolalar `javascript:`/`data:` sxemalariga qarshi tekshiriladi, faqat `NEXT_PUBLIC_*` clientga chiqadi.
6. **Typecheck toza:** `npx tsc --noEmit` — **0 xato** (mustaqil ikki marta tasdiqlandi).
7. **Kod yaxshi tuzilgan:** UI kit, validatsiya qatlami, `lib/` bo'linishi toza; `strict` rejim; `asChild`/Modal/EmptyState kabi primitivlar qayta ishlatilgan.

---

## 3. KRITIK xavfsizlik muammolari (birinchi navbatda tuzatilishi kerak)

### C-1. Har qanday userni o'zlashtirib olish (account takeover) — eng xavfli
- `biospace_session` cookie'si **imzosiz** va ichida **raw `User.id`** turadi; server uni hech qanday tekshiruvsiz `prisma.user.findUnique({ where: { id: cookie } })` ga beradi — `src/lib/auth.ts:122-134`, cookie `src/app/api/auth/login/route.ts:37-43` da shunday yoziladi.
- Public profil sahifasi esa butun `Profile` obyektini clientga uzatadi, ya'ni **`userId` har bir tashrifchiga ko'rinadi** — `src/app/[username]/page.tsx:72-88,122-129`, `src/components/profile/public-profile-view.tsx:27-41`.
- **Hujum:** istalgan profilni oching → page payload'dan `userId` ni oling → brauzerda `biospace_session=<userId>` cookie qo'ying → o'sha user sifatida dashboard/API'ga to'liq kirasiz. Parol, email, 2FA kerak emas.
- **Yechim:** imzolangan/opaque session token + serverdagi `Session` jadvali; public payload'da `select` bilan faqat public maydonlar.

### C-2. Ro'yxatdan o'tish orqali o'zini ADMIN qilish
- `POST /api/auth/register` allowlist'dagi emailga avtomatik `role: "ADMIN"` beradi — `src/app/api/auth/register/route.ts:50,60`; email tasdiqlash umuman yo'q.
- Allowlist git'da tracked `.env` ichida: `admin@biospace.com,founder@biospace.com` (`.env:22`). `founder@biospace.com` seed'da yo'q → uni ro'yxatdan o'tkazish = admin.
- **Yechim:** register/login'dan rol berishni olib tashlash, allowlist'ni real email tasdiqlash + TOTP bilan bog'lash, `.env`ni git'dan chiqarish.

### C-3. Soxta Clerk `__session` JWT'ga ishonish
- `getAuthenticatedUser()` `__session` cookie'sini bo'laklarga ajratib, **imzosini tekshirmasdan** `payload.sub` va `payload.email` ga ishonadi — `src/lib/auth.ts:177-231`.
- **Hujum:** o'zingiz yasagan `header.<base64({"sub":"user_...","email":"founder@biospace.com"})>.x` cookie bilan admin bo'lish yoki ixtiyoriy identity yaratish.
- **Yechim:** bu "fallback" yo'lini butunlay o'chirish yoki Clerk JWKS bilan `verifyToken` qilish.

### C-4. Stripe webhook imzosiz qabul qilinadi → buyurtmani "to'langan" qilish
- `src/lib/store/payment.ts:232-246`: agar `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` bo'lmasa (hozir `.env:25-26` da bo'sh), raw JSON parse qilinadi.
- **Hujum:** `POST /api/store/webhook` ga `{"id":"evt_1","type":"checkout.session.completed","data":{"object":{"client_reference_id":"<orderId>"}}}` yuborib istalgan buyurtmani COMPLETED holatiga o'tkazish; `payment_status`, summa, valyuta tekshirilmaydi.
- **Yechim:** fail-closed (secret bo'lmasa 400/500), summa/valyuta/payment_status tekshiruvi, idempotentlik yozuvi birinchi bo'lib.

### C-5. Demo-user fallback — hamma "avtomatik login" bo'ladi
- `src/lib/auth.ts:233-241`: session bo'lmasa `alex@creator.dev` useri qaytariladi (NODE_ENV tekshirilmaydi, seed'da bu user PRO).
- Natijada `if (!user) return 401` guard'lari **hech qachon ishlamaydi**: anonim tashrifchi demo akkauntning linklari, do'koni, subscriberlarini boshqaradi. Hozirgi `.env`dagi demo Clerk kalit bilan bu holat aynan yoqilgan.
- **Yechim:** credential bo'lmasa `null`; demo rejim faqat `NODE_ENV === "development" && ALLOW_DEMO_AUTH === "true"` bilan.

> Bu 5 ta muammo bir-birini kuchaytiradi: C-5 hozirgi muhitda deyarli hamma narsani ochiq qiladi, C-1 esa production'da ham ishlaydigan to'liq ATO.

---

## 4. Yuqori darajadagi muammolar (High)

| # | Muammo | Dalil |
|---|---|---|
| H-1 | **Paywall yo'q**: public `GET /api/products/[id]` to'liq product'ni, jumladan `fileUrl`ni qaytaradi; to'langan fayl manzili public profil payload'ida ham bor. Stripe sozlanmagan "preview" checkout esa `success: true` + yuklab olish havolasini beradi. | `api/products/[id]/route.ts:4-34`; `payment.ts:110-134`; `public-store-section.tsx:163-175` |
| H-2 | **`/api/upload` auth tekshirmaydi**, SVG qabul qiladi va `public/uploads` ga yozadi → anonim foydalanuvchi app origin'ida stored XSS host qiladi; fayl yozilmasa base64 data-URL DB'ga tushadi. | `api/upload/route.ts:6-12,17-19,52-78` |
| H-3 | **RBAC faqat 3/8 admin route'da** qo'llanilgan: `SUPPORT`/`MODERATOR` userlarni o'chirishi, domenlarni suspend qilishi, platform sozlamalarini yozishi, hatto o'zini `SUPER_ADMIN` qilishi mumkin. | `api/admin/users/route.ts:50-121`; `api/admin/domains`, `settings`, `templates`, `moderation`; `lib/rbac.ts:31-94` |
| H-4 | **Rate limiting umuman yo'q** (butun `src` bo'ylab 0 ta moslik): login brute-force, register spam, email bombing (`/api/subscribers`), AI quota burn, DB to'ldirish. | grep: `rate.?limit` → 0 |
| H-5 | **Middleware fail-open**: Clerk kaliti "live" bo'lmasa barcha yo'llar ochiq; `biospace_session` bo'lsa Clerk umuman ishlamaydi; `auth.protect()` xatolari yutiladi. | `middleware.ts:19-33,62-70` |
| H-6 | Email havolalari attacker boshqaradigan `Origin` header'dan quriladi → token o'g'irlash/phishing. | `api/subscribers/route.ts:180-188`; `lib/email/service.ts:107-108,170-172` |
| H-7 | Admin endpoint'larda **mass assignment**: settings/templates'ga body to'g'ridan-to'g'ri Prisma'ga ketadi; `role` erkin string. | `api/admin/settings/route.ts:28-34`; `api/admin/templates/route.ts:53-61` |
| H-8 | **Booking**: istalgan vaqtga (o'tmishga ham) bron qilish mumkin; paid booking hech qachon to'lanmaydi (`isPaid` teskari); double-booking himoyasi DB darajasida yo'q (PostgreSQL'da race). | `lib/booking/service.ts:193-266` |
| H-9 | **DNS verification bypass**: nomida `test`/`demo` bo'lgan har qanday domen avtomatik "verified" bo'ladi; TXT **yoki** CNAME yetarli; SSL esa umuman berilmaydi (status shunchaki ACTIVE). | `lib/domain/service.ts:196-206,250-298` |
| H-10 | **Email simulyatsiya**: Resend kaliti bo'lmasa "yuborildi" deb yoziladi, double opt-in xati yetib bormaydi → subscriber hech qachon ACTIVE bo'lmaydi. Newsletter/campaign yuborish funksiyasi umuman yo'q. | `lib/email/service.ts:78-93`; `api/audience/route.ts` |
| H-11 | **Subscription billing yo'q**: `mode:"subscription"` hech qayerda yo'q, `Subscription` jadvaliga hech kim yozmaydi; PRO faqat admin qo'lda beradi. | grep: 0 |
| H-12 | Audit log "immutable" emas: `AdminAuditLog.adminId` → `onDelete: Cascade`, admin o'chirilsa audit ham o'chadi; ba'zi admin amallarda audit hiç yozilmaydi. | `schema.prisma:337-341`; `api/admin/domains/route.ts:142-159` |

---

## 5. Dashboard / creator studio muammolari

1. **Store tarifi har doim FREE** — `api/products` tarifni `prisma.subscription` dan o'qiydi, lekin bu jadvalga **hech qanday kod yozmaydi** (faqat o'qish). Natijada PRO mijoz ham 3 ta product limitida qoladi va 9% komissiya ko'rsatiladi, upgrade sahifasi esa PRO deydi. (`api/products/route.ts:26-40`; grep bilan tasdiqlandi)
2. **Overview KPI'lari noto'g'ri/sun'iy**: "Total Profile Views" faqat oxirgi 100 eventni sanaydi, CTR all-time click / 100 event bo'lgani uchun 100% dan oshishi mumkin; chart bo'sh bo'lsa `Math.random()` bilan "Real-time" grafik chiziladi (`overview-charts.tsx:26-40`).
3. **Saqlanmaydigan toggle'lar**: Verified badge, notification switch'lar, header layout tanlovi faqat React context'ni o'zgartiradi — "success" toast, reload'dan keyin yo'q. Header kartidagi "Save" esa boshqa inputda yozilgan Display Name'ni eski qiymat bilan bosib ketadi.
4. **Links sahifasi**: enable/pin/reorder amallari `res.ok` ni tekshirmaydi (401/500 da ham "success"), rollback yo'q; reorder server qaytargan pinned-first tartibni inkor qiladi; schedule vaqtlari har saqlashda browser UTC offset'iga siljiydi (`links/page.tsx:107-108,187-188`; Toshkent +05:00 da 5 soat).
5. **Preview ≠ jonli sahifa**: preview scheduled linklarni, collection guruhlarini, branding'ni, newsletter/booking/store bloklarini ko'rsatmaydi; footer'da hatto **"Get your own Linktree"** yozuvi qolgan (`phone-mockup.tsx:414`).
6. **I18n faqat bezak**: `lib/i18n.ts` da uz/ru/en lug'atlar to'liq, lekin `t` ni **birorta ham komponent ishlatmaydi**; `<html lang="en">` hech qachon o'zgarmaydi; interfeysda ingliz+o'zbek aralash hardcode matnlar bor.
7. **Boshqa aniq bug'lar**: contact forma 800 ms `setTimeout` bilan "yuborildi" deydi (API'ga hech narsa ketmaydi); upgrade sahifasi Stripe'ga ulanmaydi; `/@username` URL 404 beradi (faqat `/username` ishlaydi); admin/settings 403 da abadiy spinner; admin/support GET bo'sh bo'lsa 3 ta soxta ticket yaratadi; admin/subscriptions MRR = `proUsers * 10` (sun'iy).
8. **Kod sifati:** 115 ta ishlatilmagan symbol (tsc `TS6133`), 63 ta `any`, 6 fayl >500 satr (`store` ~1400, `bookings` ~1300), 145 ta mavjud bo'lmagan Tailwind klass (`animate-in`, `shadow-xs` va h.k. — animatsiyalar umuman ishlamaydi), modal'da `role="dialog"`/focus trap yo'q, ikonka tugmalarda `aria-label` yo'q.

---

## 6. Ma'lumotlar bazasi va biznes-logika

- **Model:** 47 model, 601 field, 80 indeks, 28 unique, 46 Cascade / 6 SetNull / 1 Restrict. Enum ishlatilmagan — barcha status/role/tier erkin `String`.
- **Xavfli kaskadlar:** `Order.product`/`Order.profile` Cascade → product yoki profil o'chirilsa **moliyaviy tarix ham o'chadi**; `AdminAuditLog.admin` Cascade → audit o'chadi.
- **O'lik model'lar (9 ta):** `ProfileView`, `LinkClick`, `DailyStatistics`, `ModerationAction`, `TemplateReview`, `Notification`, `TeamMember`, `APIKey`, `WebhookEndpoint` — "enterprise" deb sotilgan funksiyalar faqat sxemada, kodda yo'q.
- **`schema.postgresql.prisma` eskirgan:** 32 model (47 o'rniga) va 31 ta field yo'q. PostgreSQL'ga o'tsangiz AI, store, newsletter, booking, domain kodi `PrismaClientValidationError` bilan yiqiladi.
- **Seed ma'lumotlari sun'iy:** product'larda `salesCount: 142` va 88 (order yo'q), `ACTIVE` custom domain tekshiruvsiz, QR `downloadCount: 42`; re-run'da dublikatlar yaratadi.
- **`/api/audience`** bo'sh bo'lsa 3 ta uydirma subscriber qaytaradi (haqiqiy PII'ga o'xshash email bilan).

### Real vs simulyatsiya jadvali

| Funksiya | Holat |
|---|---|
| AI bio/headline/content (5 ta) | Kalit bo'lsa real Gemini/OpenAI; hozir **shablon matn** + uydirma token/cost |
| AI theme/audit/CTA (3 ta) | **Hech qachon model chaqirmaydi** (statik ro'yxat) |
| AI quota | Ishlaydi, lekin oy almashganda reset bo'lmaydi + race |
| Product checkout / webhook / refund | Stripe kaliti bo'lsa real; hozir **preview** (fake order), webhook imzosiz |
| Subscription billing, fee, payout | **Umuman yo'q** |
| Booking slotlar / timezone | Faqat UTC, timezone parametri e'tiborsiz; Google Meet linki uydirma; emaillar yuborilmaydi; paid booking to'lanmaydi |
| Custom domen DNS | Real lookup, lekin bypass bor; **SSL simulyatsiya** |
| Email (Resend) | Kalit bo'lmasa "SIMULATED" + success; SMTP yo'q |
| Newsletter yuborish | **Yo'q** (faqat transactional xatlar) |
| Analytics | Real event yoziladi, lekin geo/browser **hardcode** (`United States`/`Chrome`), click referrer o'z URL'i, har kim yozishi mumkin |
| Upload | Real, lekin auth yo'q, SVG xavfli, serverless'da DB'ga base64 |

---

## 7. Verifikatsiya natijalari (05-hisobot)

| Tekshiruv | Natija | Izoh |
|---|---|---|
| `npx tsc --noEmit` | **0 xato** (2 marta, inkremental o'chirilgan holda ham) | Type-darajada toza; runtime xatolarini ko'rmaydi |
| `node scripts/test-suite.js` | **202/202 PASS** | Lekin test **o'z nusxasini** tekshiradi: `src/lib` import qilinmaydi, logic qayta yozilgan; HTTP/auth/webhook/DNS real sinovlari yo'q; `prisma/dev.db` ni o'zgartiradi (`AIUsage` 24→25) |
| `npm run lint` | **exit 0, lekin lint yo'q** | ESLint config ham, dependency ham yo'q; `next lint` interactive prompt'da to'xtaydi — soxta "yashil" |
| CI | **Yo'q** | `.github/` ham, test/typecheck gate ham yo'q |
| DB ↔ schema | 47/47 jadval mos | `schema.postgresql.prisma` esa eskirgan (§6) |
| README | 196/196 assertion deydi | Aslida 202; `test-suite.js` 1694 satr |

---

## 8. Tavsiyalar (prioritet bo'yicha)

### P0 — darhol (1–2 kun, launch'dan oldin albatta)
1. **Session'ni imzolash**: opaque random token + `Session` jadval; `biospace_session`ni almashtirish; public profil payload'idan `userId`ni olib tashlash (`select`). → C-1.
2. **Register/login/Clerk-sync'dan rol berishni olib tashlash**; `.env`ni git'dan chiqarish va kalitlarni rotatsiya qilish. → C-2.
3. **Demo-user fallback va imzosiz `__session` yo'lini o'chirish**; bitta `requireUser()`/`requireAdmin()` helper. → C-3/C-5.
4. **Stripe webhook fail-closed**, imzo + `payment_status` + summa/valyuta tekshiruvi. → C-4.
5. **Upload**: auth talab qilish, SVG'ni olib tashlash (yoki rasterizatsiya), magic-byte tekshirish, `public/`dan tashqarida saqlash. → H-2.
6. **Admin RBAC**: har bir handler'da `userHasPermission`, `role` uchun Zod enum, o'zini ko'tarishni taqiqlash, auditni tranzaksiyada yozish. → H-3/H-7.
7. **Rate limit**: auth, upload, AI, subscribe/resend, barcha public POST'larga. → H-4.
8. **Paywall**: `fileUrl`/`externalUrl`ni public javob va payload'dan olib tashlash; yuklab olishni order tekshiruvi orqali berish. → H-1.

### P1 — keyingi qadam (1–2 hafta)
9. **Bitta tarif manbai**: `getEffectiveTier()` (user.subscriptionTier) hamma joyda; product limiti, AI quota, domen, template; yoki real billing yozadigan qilish. → store bug.
10. **Booking tuzatish**: availability/past/buffer validatsiyasi, DB darajasida conflict constraint, timezone konvertatsiyasi, paid booking'ni to'lash yoki olib tashlash.
11. **Domen verifying**: `test`/`demo` substring bypass'ini o'chirish, faqat TXT talab qilish, SSL'ni halol "pending" qilish.
12. **Email**: kalit bo'lmasa xato berish (success emas), escaping, `List-Unsubscribe`, real newsletter yuborish yoki marketing da'volarini olib tashlash.
13. **Analytics**: autentifikatsiya/rate limit, o'z-o'zini va botlarni filtrash, real country/browser, dedupe, consent.
14. **Admin**: support auto-seed'ni olib tashlash, MRR'ni `Subscription`dan hisoblash, draft template'lar endpoint'i, pagination, error state.
15. **Middleware fail-closed** qilish, `Origin`dan URL qurishni to'xtatish.

### P2 — sifat va uzoq muddat
16. Dashboard bug'lari: KPI formulalari, `Math.random()` fallback o'chirish, `res.ok` tekshiruvlari, timezone round-trip, preview'ni real sahifaga moslash, context-only toggle'larni yo'qotish.
17. I18n'ni yo yoqish (lug'atni kengaytirish + `t` ni ulash + `<html lang>`), yo butunlay olib tashlash; hardcode "Linktree" matnlarini BioSpace'ga almashtirish.
18. `test-suite.js`ni haqiqiy modullarni import qiladigan qilish; ESLint + CI (tsc/test) qo'shish; 115 unused symbol va 145 o'lik Tailwind klassni tozalash.
19. `schema.postgresql.prisma`ni qayta generatsiya qilish; `Float` pul o'rniga `Decimal`; enumlar; o'lik model'larni olib tashlash yoki implement qilish.
20. Order/audit cascade'larini `Restrict`/`SetNull`ga o'zgartirish — moliyaviy tarix va audit yo'qolmasin.

---

## 9. Qanday ishga tushirish (qisqacha)

```bash
npm install
# .env: DATABASE_URL, Clerk kalitlari (real!), ADMIN_EMAIL_ALLOWLIST, Stripe, AI kalitlari
npx prisma generate
npx prisma db push
node prisma/seed.js      # 20 template + admin@biospace.com + alex@creator.dev
npm run dev              # http://localhost:3000
```

Muhim: hozirgi `.env`da Clerk kaliti demo, Stripe/AI/Resend kalitlari bo'sh → auth fallback (C-5) yoqilgan, to'lov/AI/email simulyatsiyada. Production'ga chiqishdan oldin §8 dagi P0 bandlari bajarilishi shart.

---

## 10. Xulosa

Loyiha **chiroyli UI va keng qamrovli funksiyalar demo'si**, lekin **production-ready emas**:

- Arxitektura va tip xavfsizligi yaxshi; sahifalar va admin panel real ma'lumot bilan ishlaydi.
- Lekin **auth modeli buzilgan** (imzosiz session, demo fallback, allowlist orqali admin), **asosiy monetizatsiya simulyatsiyada** (Stripe preview, subscription billing yo'q, paywall ochiq), **bir qancha "AI" funksiyalar model chaqirmaydi**, **email/newsletter yetkazilmaydi**, **booking va domen mantiqida jiddiy bo'shliqlar** bor.
- Testlar "yashil" ko'rinadi, lekin ular haqiqiy kodni tekshirmaydi — bu eng xavfli signal.

Birinchi navbatda §8 dagi **P0 (1–8)** bandlari bajarilsa, loyiha xavfsiz demo/pilot darajasiga chiqadi; qolgan P1 bandlar biznes-funksiyalarni haqiqiy ishlaydigan holatga keltiradi.
