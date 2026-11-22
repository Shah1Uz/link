export interface FontItem {
  id: string; // Exact CSS font-family name
  name: string;
  category: "funky" | "display" | "sans" | "serif" | "handwriting";
  tag: string;
  description: string;
  isPopular?: boolean;
  fallback: "cursive" | "sans-serif" | "serif" | "monospace";
}

export const FONT_CATEGORIES = [
  { id: "all", label: "Barchasi (All)", icon: "✨" },
  { id: "funky", label: "Funky & Bubbly (Kreativ)", icon: "🎨" },
  { id: "display", label: "Display & Brutalist", icon: "⚡" },
  { id: "sans", label: "Zamonaviy Sans", icon: "💎" },
  { id: "serif", label: "Hashamatli Serif", icon: "👑" },
  { id: "handwriting", label: "Qo'lyozma Script", icon: "✍️" },
] as const;

export const FONTS_CATALOG: FontItem[] = [
  // 1. Funky, Bubbly & Groovy (Matches user's reference!)
  {
    id: "Rubik Bubbles",
    name: "Rubik Bubbles",
    category: "funky",
    tag: "Bubbly 3D",
    description: "Yumaloq pufaksimon, suyuq hajmga ega zamonaviy ko'cha uslubi",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Modak",
    name: "Modak",
    category: "funky",
    tag: "Ultra Fat Bubble",
    description: "Qalin, to'la va o'ta shirin pufak harflar",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Shrikhand",
    name: "Shrikhand",
    category: "funky",
    tag: "Retro Groovy 70s",
    description: "70-yillar retro uslubidagi to'lqinsimon qalin shrift",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Righteous",
    name: "Righteous",
    category: "funky",
    tag: "Modern Curved",
    description: "Silliq egri chiziqli, zamonaviy retro-futuristik display",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Bungee",
    name: "Bungee",
    category: "funky",
    tag: "Heavy Pop Art",
    description: "Shahar devoriy yozuvlari va vertikal pop-art dinamikasi",
    fallback: "cursive",
  },
  {
    id: "Fugaz One",
    name: "Fugaz One",
    category: "funky",
    tag: "Speed Italic Pop",
    description: "Yeldek tez, qiya va qalin baquvvat harflar",
    fallback: "cursive",
  },
  {
    id: "Permanent Marker",
    name: "Permanent Marker",
    category: "funky",
    tag: "Street Graffiti",
    description: "Haqiqiy marker bilan chizilgan ko'cha graffitisi ruhi",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Press Start 2P",
    name: "Press Start 2P",
    category: "funky",
    tag: "8-Bit Arcade",
    description: "Klassik retro o'yinlar va pikselli nostalgiya",
    fallback: "cursive",
  },
  {
    id: "Creepster",
    name: "Creepster",
    category: "funky",
    tag: "Crazy Funky",
    description: "O'zgacha, qiziqarli va erkin erib oqayotgan shrift",
    fallback: "cursive",
  },

  // 2. Display & Brutalist / Modern Tech
  {
    id: "Bebas Neue",
    name: "Bebas Neue",
    category: "display",
    tag: "Streetwear Caps",
    description: "Uzun bo'yli, jiddiy va monolit bosh harflar (Streetwear)",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Syne",
    name: "Syne",
    category: "display",
    tag: "Brutalist Fashion",
    description: "Zamonaviy art-direction va brutalist dizayn yulduzi",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Syncopate",
    name: "Syncopate",
    category: "display",
    tag: "Ultra-Wide Runway",
    description: "Keng yoyilgan, moda haftaligi poyandozi va avangard",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Audiowide",
    name: "Audiowide",
    category: "display",
    tag: "Cyberpunk Techno",
    description: "Kiberpank, neon va futuristik robototexnika",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Orbitron",
    name: "Orbitron",
    category: "display",
    tag: "Sci-Fi Geometric",
    description: "Ilmiy-fantastik koinot va fazoviy geometriya",
    fallback: "sans-serif",
  },
  {
    id: "Michroma",
    name: "Michroma",
    category: "display",
    tag: "Retro Mech",
    description: "Keng burchakli, 60-yillar mikro-elektronika uslubi",
    fallback: "sans-serif",
  },
  {
    id: "Chakra Petch",
    name: "Chakra Petch",
    category: "display",
    tag: "Esports Gaming",
    description: "Kibersport va geymerlar profili uchun burchakli shrift",
    fallback: "sans-serif",
  },
  {
    id: "Space Grotesk",
    name: "Space Grotesk",
    category: "display",
    tag: "Geek Chic Tech",
    description: "Texnologik startaplar va zamonaviy veb-ishlab chiquvchilar",
    isPopular: true,
    fallback: "sans-serif",
  },

  // 3. Clean & Modern Sans
  {
    id: "Inter",
    name: "Inter",
    category: "sans",
    tag: "Clean Swiss Sans",
    description: "Mukammal muvozanatli, o'qish juda oson shveytsarcha sans",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Plus Jakarta Sans",
    name: "Plus Jakarta Sans",
    category: "sans",
    tag: "Modern Geometric",
    description: "Iliq, professional va zamonaviy SaaS ilovalar standarti",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Poppins",
    name: "Poppins",
    category: "sans",
    tag: "Friendly Circles",
    description: "Yumaloq geometriya, samimiy va xushfe'l ko'rinish",
    isPopular: true,
    fallback: "sans-serif",
  },
  {
    id: "Outfit",
    name: "Outfit",
    category: "sans",
    tag: "Digital Brand",
    description: "Yangi avlod brendlari uchun nafis va tiniq sans",
    fallback: "sans-serif",
  },
  {
    id: "Manrope",
    name: "Manrope",
    category: "sans",
    tag: "Semi-Condensed",
    description: "Yarim siqilgan, jiddiy va aniq piksellar",
    fallback: "sans-serif",
  },
  {
    id: "Montserrat",
    name: "Montserrat",
    category: "sans",
    tag: "Urban Classic",
    description: "Shahar plakatlari va afishalaridan ilhomlangan",
    fallback: "sans-serif",
  },
  {
    id: "DM Sans",
    name: "DM Sans",
    category: "sans",
    tag: "Minimal Sans",
    description: "Kamtarona, jiddiy va nozik muvozanat",
    fallback: "sans-serif",
  },

  // 4. Luxury & Editorial Serif
  {
    id: "Playfair Display",
    name: "Playfair Display",
    category: "serif",
    tag: "Vogue Editorial",
    description: "Yuqori moda, jurnallar va hashamatli go'zallik",
    isPopular: true,
    fallback: "serif",
  },
  {
    id: "Cinzel",
    name: "Cinzel",
    category: "serif",
    tag: "Imperial Roman",
    description: "Rim imperiyasi tosh yozuvlari va qat'iy ulug'vorlik",
    isPopular: true,
    fallback: "serif",
  },
  {
    id: "Cinzel Decorative",
    name: "Cinzel Decorative",
    category: "serif",
    tag: "Royal Luxury",
    description: "Qirollik ramzlari va bezakli naqshinkor bosh harflar",
    fallback: "serif",
  },
  {
    id: "Bodoni Moda",
    name: "Bodoni Moda",
    category: "serif",
    tag: "Italian Couture",
    description: "Italiya kuturyesi, yuqori kontrast va moddiy joziba",
    isPopular: true,
    fallback: "serif",
  },
  {
    id: "Cormorant Garamond",
    name: "Cormorant Garamond",
    category: "serif",
    tag: "Renaissance Classic",
    description: "Uyg'onish davri kitob san'ati va nozik qadimiylik",
    fallback: "serif",
  },
  {
    id: "DM Serif Display",
    name: "DM Serif Display",
    category: "serif",
    tag: "Punchy Serif",
    description: "Qalin, zarbdor va zamonaviy sarlavhalar serifi",
    fallback: "serif",
  },
  {
    id: "Corben",
    name: "Corben",
    category: "serif",
    tag: "Vintage Serif",
    description: "Yumaloq vintage burchaklar va nostalgiya",
    fallback: "serif",
  },

  // 5. Handwritten & Signature Script
  {
    id: "Pacifico",
    name: "Pacifico",
    category: "handwriting",
    tag: "California Surf",
    description: "Kaliforniya syorfing madaniyati va quvnoq cho'tka yozuvi",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Caveat",
    name: "Caveat",
    category: "handwriting",
    tag: "Casual Signature",
    description: "Erkin, tezkor va tabiiy kundalik qo'lyozma",
    isPopular: true,
    fallback: "cursive",
  },
  {
    id: "Dancing Script",
    name: "Dancing Script",
    category: "handwriting",
    tag: "Bouncy Cursive",
    description: "Raqsga tushayotgan jo'shqin va ritmik xattotlik",
    fallback: "cursive",
  },
  {
    id: "Great Vibes",
    name: "Great Vibes",
    category: "handwriting",
    tag: "Formal Calligraphy",
    description: "Rasmiy tantanali imzolar va nozik buralishlar",
    fallback: "cursive",
  },
  {
    id: "Satisfy",
    name: "Satisfy",
    category: "handwriting",
    tag: "Retro Brush",
    description: "Klassik retro cho'tka bilan bitilgan nafis xat",
    fallback: "cursive",
  },
];

/** Return CSS font-family string with safe fallback */
export function getFontFamilyCss(fontId?: string | null): string {
  if (!fontId) return "'Inter', sans-serif";
  const found = FONTS_CATALOG.find((f) => f.id.toLowerCase() === fontId.toLowerCase());
  if (found) {
    return `'${found.id}', ${found.fallback}`;
  }
  return `'${fontId}', sans-serif`;
}
