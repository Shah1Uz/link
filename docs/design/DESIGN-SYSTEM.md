# BioSpace — "Aurora" dizayn tizimi (v2)

Bu hujjat butun jamoaga majburiy. Dizaynni yangilashda **faqat shu tizimdagi tokenlar va utilitalar** ishlatiladi.
Maqsad: sayt "premium, zamonaviy SaaS" ko'rinishiga chiqishi — Linktree'dan emas, Linear / Vercel / Framer darajasidagi mahsulotdan ilhomlangan.

---

## 1. Poydevor (Lead tomonidan tayyorlangan, QAYTA YOZILMAYDI)

Quyidagi fayllar **Lead egaligida** — teammate'lar ularni o'zgartirmaydi:

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/ui/**`
- `src/components/shared/**`
- `src/app/layout.tsx`

Ularda allaqachon quyidagilar bor.

### 1.1 Ranglar (semantic tokenlar — `bg-*`, `text-*`, `border-*` orqali)

| Token | Vazifasi |
|---|---|
| `background` | sahifa foni (light: iliq qog'oz `#FBFAF6`, dark: siyoh `#07080C`) |
| `surface` | kartadan biroz farqli panel foni |
| `foreground` / `text-primary` | asosiy matn |
| `text-secondary` | ikkilamchi matn |
| `border` | hairline chegaralar |
| `card` / `card-foreground` | karta |
| `primary` (+ `primary-foreground`) | brend yashil (emerald) |
| `destructive` | xato / o'chirish |

Qo'shimcha aksentlar Tailwind'da tayyor: `emerald-*`, `teal-*`, `cyan-*`, `violet-*`, `rose-*`, `amber-*`.
Aurora triadasi: **emerald → teal → cyan** (asosiy gradient), **violet** faqat aksent sifatida (juda kam).

❌ **Yangi hex/rgb rang yozmang** (`bg-[#7839ee]`, `text-[#0a0a0a]` kabi). Faqat tokenlar yoki Tailwind palitrasi.
❌ `bg-black`, `bg-white` ni katta sirtlar uchun ishlatmang — `bg-background`, `bg-card`, `bg-white/[0.03]` (dark) ishlatilsin.

### 1.2 Tipik ko'rinish qoidalari

- **Radius:** katta kartalar `rounded-3xl`, ichki elementlar `rounded-xl`/`rounded-2xl`, tugmalar `rounded-xl`, pill `rounded-full`.
- **Chegara:** light `border-zinc-200/80`, dark `dark:border-white/[0.08]`.
- **Soya:** `shadow-soft` (karta), `shadow-lift` (hover), `shadow-glow` (asosiy CTA), mayda `shadow-xs` / `shadow-2xs`.
- **Shrift:** sarlavhalar avtomatik `font-heading` + `tracking-[-0.03em]`; matn `text-[15px] leading-relaxed`.
- **Matn ierarxiyasi:** `text-[11px] uppercase tracking-[0.16em]` — eyebrow; `text-3xl sm:text-4xl lg:text-5xl font-extrabold` — section sarlavha.
- **Bo'shliq:** section `section-pad` (`py-24 sm:py-32`) yoki `py-20 sm:py-28`; container `container mx-auto px-4 sm:px-6`.
- **Dark mode majburiy:** har bir o'zgarish ikkala temada ham tekshiriladi.

### 1.3 Tayyor utilitalar (globals.css)

| Class | Nima qiladi |
|---|---|
| `.aurora` | yumshoq rangli glow blob. **Faqat** `relative isolate overflow-hidden` konteyner ichida, birinchi child sifatida ishlatiladi |
| `.aurora-tight` | sarlavha orqasidagi tor glow (hero uchun) |
| `.glass` | frosted shisha panel |
| `.panel` | premium karta sirti (radius + chegara + soya) |
| `.card-lift` | hover'da ko'tarilish + soya |
| `.eyebrow` | kichik uppercase kicker badge |
| `.text-gradient` / `.text-gradient-ink` | gradient matn (dark/light variantlari) |
| `.section-pad` | section vertikal ritmi |
| `.grid-pattern` / `.dot-pattern` | nozik fon to'ri / nuqtalari (mask bilan) |
| `.noise` | juda nozik film grain (pseudo-element, `relative` kerak) |
| `.glint` | element tepasida 1px gradient yorug'lik chizig'i |
| `.border-gradient` | gradient chegara (mask usuli) |
| `.shimmer` | skeleton / highlight sweep |
| `.scrollbar-none` | scrollbar yashirish |
| `.mask-fade-b`, `.mask-fade-x` | chetlarni yumshatish |
| `.animate-in` + `.fade-in` / `.zoom-in-95` / `.slide-in-from-top` / `.slide-in-from-left-6` / `.slide-in-from-right-6` | kirish animatsiyalari (plagin o'rniga qo'lda yozilgan, endi haqiqatan ishlaydi) |
| Tailwind animatsiyalar | `animate-fade-up`, `animate-fade-in`, `animate-zoom-in-soft`, `animate-slide-up`, `animate-float`, `animate-glow`, `animate-aurora`, `animate-shimmer`, `animate-marquee`, `animate-spin-slow` |
| `ease-out-expo` / `ease-out-soft` | transition timing funksiyalari |

### 1.4 UI kit (o'zgarmagan API, yangi ko'rinish)

`Button` (default = yashil gradient, `outline`, `ghost`, `secondary`, `neon`, `glass`, `destructive`; `size` `sm|default|lg|icon`),
`Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`,
`Input` (`leftIcon`/`rightIcon`/`error`), `Textarea`, `Label`, `Badge` (`pro`, `verified`, `success`…), `Switch`, `Modal` (endi `role="dialog"`, `aria-modal`, focus).

➡️ **Imkon qadar mavjud UI kit komponentlarini ishlating** — o'zingiz yangi tugma/karta yasamang. Agar biror variant yetmasa, Lead'ga ayting.

---

## 2. Har bir sahifa uchun sifat talablari

1. **Birinchi ekran (above the fold)** — kuchli: katta tipografiya, gradient aksent, glow, aniq CTA ierarxiyasi.
2. **Section ritmi** — bir xil `section-pad`, `container`, sarlavha + tavsif + kontent tuzilishi.
3. **Karta hover** — `card-lift` yoki ekvivalent transition; bosiladigan elementlarda `active:scale-[0.98]`.
4. **Dark mode** — barcha yangi class'lar `dark:` variantiga ega bo'lishi shart.
5. **Mobil** — `sm:`/`md:`/`lg:` breakpointlar; 390px kenglikda hech narsa kesilmasin.
6. **A11y** — `aria-label` ikonka tugmalarda, `alt` rasmlarda, focus ko'rinadigan.
7. **Funksiya o'zgarmaydi** — handlerlar, `onClick`, `fetch`, `useState`, proplar, matn mazmuni (mazmunni yaxshilash mumkin, lekin funksiya buzilmaydi).
8. **Yangi dependency yo'q**, yangi route yo'q, DB/API o'zgarmaydi.
9. **Linktree brendi yo'q** — barcha "Linktree" matnlari **BioSpace** ga almashtiriladi.
10. Har bir fayl `node node_modules/typescript/bin/tsc --noEmit` bilan tekshiriladi (0 xato).

---

## 3. Fayl egaligi (write scope)

| Egasi | Fayllar |
|---|---|
| **Lead** | `globals.css`, `tailwind.config.ts`, `src/components/ui/**`, `src/components/shared/**`, `src/app/layout.tsx`, `docs/design/**` |
| **design-marketing** | `src/app/page.tsx`, `src/app/{about,features,pricing,faq,templates,contact,not-found}/page.tsx`, `src/components/marketing/**`, `src/components/layout/marketing-navbar.tsx`, `marketing-footer.tsx` |
| **design-dashboard** | `src/app/dashboard/**`, `src/app/onboarding/page.tsx`, `src/components/dashboard/**`, `src/components/layout/dashboard-sidebar.tsx`, `dashboard-header.tsx` |
| **design-profile** | `src/app/[username]/page.tsx`, `src/components/profile/**` |
| **design-admin-auth** | `src/app/admin/**`, `src/components/layout/admin-sidebar.tsx`, `admin-header.tsx`, `src/app/sign-in/**`, `src/app/sign-up/**` |

Boshqa scope'dagi faylni o'zgartirish kerak bo'lsa — Lead'ga xabar bering, o'zingiz tegmang.

---

## 4. Tekshirish

```powershell
node node_modules/typescript/bin/tsc --noEmit    # 0 xato bo'lishi shart
```

Agar tsc boshqa agentning vaqtinchalik xatosi tufayli yiqilsa — qayta urinib ko'ring; o'z fayllaringizdagi xatoni tuzating.
Yakunda Lead dev-serverni ishga tushirib, sahifalarni smoke-test qiladi.
