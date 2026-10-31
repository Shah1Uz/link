const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoryDefinitions = [
  { name: "Minimal", slug: "minimal", description: "Ultra-clean monochrome and typography-driven profiles", icon: "Square" },
  { name: "Creator", slug: "creator", description: "Vibrant neon, video streams, and digital creator layouts", icon: "Video" },
  { name: "Influencer", slug: "influencer", description: "Warm lifestyle palettes, photography cards, and social highlights", icon: "Compass" },
  { name: "Business", slug: "business", description: "Authoritative corporate navies, SaaS enterprise themes, and founder links", icon: "Briefcase" },
  { name: "Music", slug: "music", description: "Dark club vibes, soundwave gradients, and release countdowns", icon: "Music" },
  { name: "Gaming", slug: "gaming", description: "Esports, streamer neon, and high-octane twitch integration", icon: "Gamepad" },
  { name: "Photography", slug: "photography", description: "Editorial photo galleries, 35mm darkroom, and visual portfolios", icon: "Camera" },
  { name: "Portfolio", slug: "portfolio", description: "Developer terminal monospace, product architect, and engineering showcase", icon: "Code" },
  { name: "Fashion", slug: "fashion", description: "Editorial luxury, runway typography, and lookbook links", icon: "Sparkles" },
  { name: "Personal Brand", slug: "personal-brand", description: "Thought leaders, speakers, coaches, and authors", icon: "User" },
];

const templates = [
  // 1. Minimal
  {
    name: "Obsidian Minimal",
    slug: "obsidian-minimal",
    category: "Minimal",
    description: "Ultra-clean monochrome aesthetic with sharp contrast and subtle micro-borders.",
    layout: "minimal",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#09090b",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "outlined",
      buttonColor: "transparent",
      buttonTextColor: "#ffffff",
      buttonBorderColor: "#27272a",
      buttonRadius: "8px",
      fontHeading: "Inter",
      fontBody: "Inter",
      textColor: "#ffffff",
      accentColor: "#ffffff",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Pure Paper",
    slug: "pure-paper",
    category: "Minimal",
    description: "Serene warm-white layout inspired by editorial publishing and Swiss typography.",
    layout: "classic",
    isPro: false,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#faf9f6",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "shadow",
      buttonColor: "#ffffff",
      buttonTextColor: "#18181b",
      buttonBorderColor: "#e4e4e7",
      buttonRadius: "12px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#18181b",
      accentColor: "#18181b",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 2. Creator
  {
    name: "Creator Horizon",
    slug: "creator-horizon",
    category: "Creator",
    description: "Vibrant emerald neon accents on midnight obsidian. Perfect for modern content builders.",
    layout: "modern",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#0d1117",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
      buttonStyle: "filled",
      buttonColor: "#10b981",
      buttonTextColor: "#042f2e",
      buttonBorderColor: "#34d399",
      buttonRadius: "16px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#f0fdf4",
      accentColor: "#10b981",
      animationsEnabled: true,
      showBranding: true,
    }),
  },
  {
    name: "Cyber Stream",
    slug: "cyber-stream",
    category: "Creator",
    description: "Futuristic violet glow with pill-shaped frosted glass buttons for video and digital creators.",
    layout: "glass",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#0b0b14",
      backgroundType: "gradient",
      backgroundGradient: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)",
      buttonStyle: "glass",
      buttonColor: "rgba(255, 255, 255, 0.08)",
      buttonTextColor: "#ffffff",
      buttonBorderColor: "rgba(168, 85, 247, 0.3)",
      buttonRadius: "9999px",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      textColor: "#f3e8ff",
      accentColor: "#a855f7",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 3. Influencer
  {
    name: "Golden Hour",
    slug: "golden-hour",
    category: "Influencer",
    description: "Warm sunset peach and amber hues designed for lifestyle influencers and vloggers.",
    layout: "hero",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#fff7ed",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #ffedd5 0%, #fff7ed 60%, #fed7aa 100%)",
      buttonStyle: "shadow",
      buttonColor: "#ffffff",
      buttonTextColor: "#7c2d12",
      buttonBorderColor: "#fed7aa",
      buttonRadius: "24px",
      fontHeading: "Poppins",
      fontBody: "Poppins",
      textColor: "#431407",
      accentColor: "#f97316",
      animationsEnabled: true,
      showBranding: true,
    }),
  },
  {
    name: "Rose Velvet",
    slug: "rose-velvet",
    category: "Influencer",
    description: "Soft blush rose palette with elevated card drop shadows and luxurious typography.",
    layout: "banner",
    isPro: true,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#fff1f2",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
      buttonStyle: "rounded",
      buttonColor: "#ffffff",
      buttonTextColor: "#881337",
      buttonBorderColor: "#fda4af",
      buttonRadius: "16px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#4c0519",
      accentColor: "#f43f5e",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 4. Business
  {
    name: "Executive Navy",
    slug: "executive-navy",
    category: "Business",
    description: "Authoritative deep corporate navy with crisp ice-blue accents for founders & startups.",
    layout: "modern",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#0a192f",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #0a192f 0%, #020c1b 100%)",
      buttonStyle: "rounded",
      buttonColor: "#172a45",
      buttonTextColor: "#64ffda",
      buttonBorderColor: "#233554",
      buttonRadius: "8px",
      fontHeading: "Inter",
      fontBody: "Inter",
      textColor: "#ccd6f6",
      accentColor: "#64ffda",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "SaaS Enterprise",
    slug: "saas-enterprise",
    category: "Business",
    description: "Clean modern tech aesthetic with subtle royal blue gradients and structured badges.",
    layout: "classic",
    isPro: true,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#f8fafc",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "filled",
      buttonColor: "#2563eb",
      buttonTextColor: "#ffffff",
      buttonBorderColor: "#1d4ed8",
      buttonRadius: "10px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#0f172a",
      accentColor: "#2563eb",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 5. Music
  {
    name: "Electric Soundwave",
    slug: "electric-soundwave",
    category: "Music",
    description: "Dark club vibes featuring neon cyan and hot magenta neon highlights for DJs and producers.",
    layout: "cutout",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#050505",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #180026 0%, #050505 50%, #001f3f 100%)",
      buttonStyle: "neon",
      buttonColor: "rgba(236, 72, 153, 0.15)",
      buttonTextColor: "#f472b6",
      buttonBorderColor: "#ec4899",
      buttonRadius: "9999px",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      textColor: "#ffffff",
      accentColor: "#06b6d4",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Vinyl Soul",
    slug: "vinyl-soul",
    category: "Music",
    description: "Retro acoustic warmth with amber vinyl tones and vintage serif headings.",
    layout: "classic",
    isPro: false,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#1c1917",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "rounded",
      buttonColor: "#292524",
      buttonTextColor: "#f59e0b",
      buttonBorderColor: "#44403c",
      buttonRadius: "12px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#e7e5e4",
      accentColor: "#d97706",
      animationsEnabled: true,
      showBranding: true,
    }),
  },

  // 6. Gaming
  {
    name: "Arcade Cyberpunk",
    slug: "arcade-cyberpunk",
    category: "Gaming",
    description: "High-octane neon yellow and pitch black with angled corners for esports and streamers.",
    layout: "creator",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#09090b",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
      buttonStyle: "square",
      buttonColor: "#facc15",
      buttonTextColor: "#000000",
      buttonBorderColor: "#eab308",
      buttonRadius: "4px",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      textColor: "#fef08a",
      accentColor: "#facc15",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Shadow Realm",
    slug: "shadow-realm",
    category: "Gaming",
    description: "Deep stealth charcoal with crimson accents for competitive FPS players.",
    layout: "modern",
    isPro: false,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#0c0a09",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "outlined",
      buttonColor: "#1c1917",
      buttonTextColor: "#f87171",
      buttonBorderColor: "#dc2626",
      buttonRadius: "6px",
      fontHeading: "Inter",
      fontBody: "Inter",
      textColor: "#fafaf9",
      accentColor: "#ef4444",
      animationsEnabled: true,
      showBranding: true,
    }),
  },

  // 7. Photography
  {
    name: "Darkroom Studio",
    slug: "darkroom-studio",
    category: "Photography",
    description: "Cinematic 35mm film photography theme with gallery spacing and silver typography.",
    layout: "hero",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#121212",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "glass",
      buttonColor: "rgba(255, 255, 255, 0.05)",
      buttonTextColor: "#e5e5e5",
      buttonBorderColor: "rgba(255, 255, 255, 0.15)",
      buttonRadius: "12px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#ffffff",
      accentColor: "#e5e5e5",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Lumiere White",
    slug: "lumiere-white",
    category: "Photography",
    description: "High-key gallery aesthetic emphasizing visual portfolio links with airy breathing room.",
    layout: "shape",
    isPro: true,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#ffffff",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "shadow",
      buttonColor: "#fcfcfc",
      buttonTextColor: "#171717",
      buttonBorderColor: "#e5e5e5",
      buttonRadius: "16px",
      fontHeading: "Inter",
      fontBody: "Inter",
      textColor: "#171717",
      accentColor: "#0a0a0a",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 8. Portfolio
  {
    name: "Developer Terminal",
    slug: "developer-terminal",
    category: "Portfolio",
    description: "Monospace CLI aesthetic with matrix emerald cursor effects and code card styling.",
    layout: "modern",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#0d1117",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "square",
      buttonColor: "#161b22",
      buttonTextColor: "#58a6ff",
      buttonBorderColor: "#30363d",
      buttonRadius: "6px",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      textColor: "#c9d1d9",
      accentColor: "#58a6ff",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Product Architect",
    slug: "product-architect",
    category: "Portfolio",
    description: "Linear-inspired hyper-polished workspace feel with subtle zinc borders and glow badges.",
    layout: "glass",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#090d16",
      backgroundType: "gradient",
      backgroundGradient: "radial-gradient(ellipse at 50% 0%, #1e293b 0%, #090d16 80%)",
      buttonStyle: "glass",
      buttonColor: "rgba(30, 41, 59, 0.4)",
      buttonTextColor: "#f1f5f9",
      buttonBorderColor: "rgba(148, 163, 184, 0.2)",
      buttonRadius: "12px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#f8fafc",
      accentColor: "#38bdf8",
      animationsEnabled: true,
      showBranding: false,
    }),
  },

  // 9. Fashion
  {
    name: "Haute Couture",
    slug: "haute-couture",
    category: "Fashion",
    description: "Vogue-inspired editorial luxury with champagne gold accents and high-fashion serifs.",
    layout: "cutout",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#18181b",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
      buttonStyle: "outlined",
      buttonColor: "transparent",
      buttonTextColor: "#fef08a",
      buttonBorderColor: "#ca8a04",
      buttonRadius: "9999px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#fef9c3",
      accentColor: "#eab308",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Atelier Paris",
    slug: "atelier-paris",
    category: "Fashion",
    description: "Delicate Parisian beige with understated minimalism and fine hairline borders.",
    layout: "classic",
    isPro: false,
    isFeatured: false,
    stylesJson: JSON.stringify({
      backgroundColor: "#f5f5f4",
      backgroundType: "color",
      backgroundGradient: "",
      buttonStyle: "pill",
      buttonColor: "#ffffff",
      buttonTextColor: "#292524",
      buttonBorderColor: "#d6d3d1",
      buttonRadius: "9999px",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      textColor: "#1c1917",
      accentColor: "#78716c",
      animationsEnabled: true,
      showBranding: true,
    }),
  },

  // 10. Personal Brand
  {
    name: "Modern Thought Leader",
    slug: "modern-thought-leader",
    category: "Personal Brand",
    description: "Crisp white cards, rich slate backgrounds, and verified badge highlight for authors & speakers.",
    layout: "hero",
    isPro: false,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#0f172a",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      buttonStyle: "shadow",
      buttonColor: "#ffffff",
      buttonTextColor: "#0f172a",
      buttonBorderColor: "#ffffff",
      buttonRadius: "14px",
      fontHeading: "Poppins",
      fontBody: "Inter",
      textColor: "#f8fafc",
      accentColor: "#38bdf8",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
  {
    name: "Vibrant Catalyst",
    slug: "vibrant-catalyst",
    category: "Personal Brand",
    description: "Energetic multi-color sunset gradient with floating cards for coaches and creative leads.",
    layout: "gradient",
    isPro: true,
    isFeatured: true,
    stylesJson: JSON.stringify({
      backgroundColor: "#4f46e5",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
      buttonStyle: "glass",
      buttonColor: "rgba(255, 255, 255, 0.2)",
      buttonTextColor: "#ffffff",
      buttonBorderColor: "rgba(255, 255, 255, 0.4)",
      buttonRadius: "16px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#ffffff",
      accentColor: "#ffffff",
      animationsEnabled: true,
      showBranding: false,
    }),
  },
];

async function main() {
  console.log("Seeding BioSpace expanded database...");

  // 1. Platform Settings
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "BioSpace",
      siteDescription: "Everything you are, in one link. The premium Link-in-Bio platform for creators and businesses.",
      logoUrl: "/logo.svg",
      defaultTheme: "creator-horizon",
      registrationEnabled: true,
      maintenanceMode: false,
      maxFreeLinks: 10,
      maxProLinks: 100,
      customDomainEnabled: true,
      announcementText: "Welcome to BioSpace v1.0! Experience next-gen creator profile tools.",
      announcementActive: true,
    },
  });
  console.log("✔ Platform settings initialized");

  // 2. Template Categories
  const categoryMap = {};
  for (let i = 0; i < categoryDefinitions.length; i++) {
    const c = categoryDefinitions[i];
    const cat = await prisma.templateCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, position: i },
      create: { name: c.name, slug: c.slug, description: c.description, icon: c.icon, position: i },
    });
    categoryMap[c.name] = cat.id;
  }
  console.log(`✔ Seeded ${categoryDefinitions.length} template categories`);

  // 3. Templates (20 templates)
  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {
        ...t,
        categoryId: categoryMap[t.category] || null,
      },
      create: {
        ...t,
        categoryId: categoryMap[t.category] || null,
      },
    });
  }
  console.log(`✔ Seeded ${templates.length} distinct templates across 10 categories`);

  // 4. Demo Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@biospace.com" },
    update: {},
    create: {
      clerkId: "user_admin_demo_clerk_id",
      email: "admin@biospace.com",
      name: "BioSpace Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      role: "ADMIN",
      subscriptionTier: "PRO",
    },
  });

  // 5. Demo Creator Profile: "shahuztech"
  const creatorUser = await prisma.user.upsert({
    where: { email: "alex@creator.dev" },
    update: {},
    create: {
      clerkId: "user_creator_demo_clerk_id",
      email: "alex@creator.dev",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      role: "USER",
      subscriptionTier: "PRO",
    },
  });

  const profile = await prisma.profile.upsert({
    where: { username: "shahuztech" },
    update: {},
    create: {
      userId: creatorUser.id,
      username: "shahuztech",
      displayName: "Alex Rivera (ShahuzTech)",
      bio: "Tech entrepreneur, full-stack engineer & YouTuber building high-scale digital products. 🚀",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      category: "CREATOR",
      verified: true,
      isPublished: true,
      layout: "modern",
    },
  });

  // Social accounts
  await prisma.socialAccount.createMany({
    data: [
      { profileId: profile.id, platform: "youtube", username: "shahuztech", profileUrl: "https://youtube.com/@shahuztech" },
      { profileId: profile.id, platform: "github", username: "shahuztech", profileUrl: "https://github.com/shahuztech" },
      { profileId: profile.id, platform: "twitter", username: "shahuztech", profileUrl: "https://x.com/shahuztech" },
    ],
  }).catch(() => {});

  // Custom Domain
  await prisma.customDomain.upsert({
    where: { domain: "links.shahuztech.com" },
    update: {},
    create: {
      profileId: profile.id,
      domain: "links.shahuztech.com",
      status: "ACTIVE",
      sslStatus: "ACTIVE",
      dnsRecords: "CNAME @ -> cname.biospace.com",
    },
  });

  // Creator Products (Commerce domain)
  await prisma.product.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Full-Stack Next.js 15 Masterclass (eBook & Starter)",
        description: "Everything you need to ship production SaaS apps in 2026.",
        price: 29.0,
        currency: "USD",
        isDigital: true,
        isEnabled: true,
        position: 0,
        salesCount: 142,
      },
      {
        profileId: profile.id,
        title: "Creator Operating System (Notion Template)",
        description: "Manage content schedules, sponsorships, and revenue.",
        price: 15.0,
        currency: "USD",
        isDigital: true,
        isEnabled: true,
        position: 1,
        salesCount: 88,
      },
    ],
  }).catch(() => {});

  // Theme for profile
  await prisma.theme.upsert({
    where: { profileId: profile.id },
    update: {},
    create: {
      profileId: profile.id,
      backgroundColor: "#0d1117",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
      buttonStyle: "filled",
      buttonColor: "#10b981",
      buttonTextColor: "#042f2e",
      buttonBorderColor: "#34d399",
      buttonRadius: "16px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#f0fdf4",
      accentColor: "#10b981",
      animationsEnabled: true,
      showBranding: false,
    },
  });

  // QR Code for profile
  await prisma.qRCode.upsert({
    where: { profileId: profile.id },
    update: {},
    create: {
      profileId: profile.id,
      foregroundColor: "#042f2e",
      backgroundColor: "#10b981",
      downloadCount: 42,
    },
  });

  // User Activity Log
  await prisma.activityLog.create({
    data: {
      userId: creatorUser.id,
      action: "PROFILE_UPDATED",
      resource: "PROFILE",
      details: "Updated bio and added new digital products",
    },
  });

  // Admin Audit Log
  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action: "SYSTEM_BOOTSTRAP",
      targetResource: "SYSTEM",
      details: "Platform initialized with 20 templates and sample creator store",
    },
  });

  // Enterprise: Feature Flags
  await prisma.featureFlag.upsert({
    where: { key: "marketplace_v2" },
    update: {},
    create: {
      key: "marketplace_v2",
      name: "Community Template Marketplace",
      description: "Allows verified creators to publish and sell custom themes on the marketplace.",
      isEnabled: true,
    },
  });
  await prisma.featureFlag.upsert({
    where: { key: "custom_domains" },
    update: {},
    create: {
      key: "custom_domains",
      name: "Automated Custom Domain SSL Provisioning",
      description: "Enables CNAME verification and automated Let's Encrypt certificates for PRO users.",
      isEnabled: true,
    },
  });

  // Enterprise: Support Ticket
  const existingTicket = await prisma.supportTicket.findFirst({
    where: { userId: creatorUser.id },
  });
  if (!existingTicket) {
    await prisma.supportTicket.create({
      data: {
        userId: creatorUser.id,
        subject: "Custom domain CNAME DNS setup assistance",
        message: "Hello team, I have pointed links.shahuz.dev to your edge IP. Can you verify if SSL auto-issuance is queued?",
        status: "RESOLVED",
        priority: "HIGH",
        category: "TECHNICAL",
        response: "Your custom domain certificate has been verified and issued by Let's Encrypt.",
        assignedTo: adminUser.email,
      },
    });
  }

  // Enterprise: Team
  await prisma.team.upsert({
    where: { slug: "shahuz-studios" },
    update: {},
    create: {
      name: "Shahuz Creative Studios",
      slug: "shahuz-studios",
      ownerId: creatorUser.id,
      members: {
        create: {
          userId: creatorUser.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log("✔ Sample profile 'shahuztech' seeded with social accounts, custom domain, products, and analytics!");
  console.log("✔ Enterprise feature flags, support tickets, and team models successfully seeded!");
  console.log("✔ BioSpace expanded database successfully seeded.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
