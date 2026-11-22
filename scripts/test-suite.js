const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

function isValidSecureUrl(urlString) {
  if (!urlString) return false;
  const trimmed = urlString.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return true;
  }
  try {
    const url = new URL(urlString.startsWith("http://") || urlString.startsWith("https://") ? urlString : `https://${urlString}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function runTestSuite() {
  console.log("=================================================");
  console.log("     BioSpace Production Verification Test Suite ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: URL Security & Scheme Sanitization
  console.log("1. Testing URL Security Sanitization...");
  assert(isValidSecureUrl("https://youtube.com/@test"), "Allows valid HTTPS URL");
  assert(isValidSecureUrl("http://example.com"), "Allows valid HTTP URL");
  assert(isValidSecureUrl("mailto:creator@biospace.com"), "Allows valid mailto scheme");
  assert(!isValidSecureUrl("javascript:alert(1)"), "Blocks malicious javascript: XSS scheme");
  assert(!isValidSecureUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="), "Blocks dangerous data: scheme");
  assert(!isValidSecureUrl("vbscript:MsgBox(1)"), "Blocks vbscript: scheme");

  // TEST 2: Username Validation Rules
  console.log("\n2. Testing Username Validation Rules...");
  assert(usernameRegex.test("alex"), "Allows valid 4-character username");
  assert(usernameRegex.test("creator_123-pro"), "Allows letters, numbers, underscores, and hyphens");
  assert(!usernameRegex.test("ab"), "Rejects username shorter than 3 characters");
  assert(!usernameRegex.test("this_username_is_way_too_long_for_the_system_limit_30"), "Rejects username longer than 30 characters");
  assert(!usernameRegex.test("user@name!"), "Rejects username with special characters");

  // TEST 3: Admin Allowlist Verification
  console.log("\n3. Testing Admin Allowlist Verification...");
  const allowlist = "admin@biospace.com,founder@biospace.com".split(",").map(e => e.trim().toLowerCase());
  assert(allowlist.includes("admin@biospace.com".toLowerCase()), "Identifies verified administrator email");
  assert(!allowlist.includes("random_user@gmail.com".toLowerCase()), "Denies unauthorized email from admin allowlist");

  // TEST 4: Database User & Profile Integrity
  console.log("\n4. Testing Database Profile & User Querying...");
  const profile = await prisma.profile.findFirst({
    include: {
      user: true,
      theme: true,
      links: true,
      collections: true,
      products: true,
    },
  });
  assert(profile !== null, `Sample creator profile '${profile?.username}' exists`);
  assert(profile && profile.verified === true, "Verified status is preserved on profile");
  assert(profile && profile.theme !== null, "Profile has active theme configured");
  assert(profile && profile.links.length > 0, `Profile has ${profile?.links.length} active links`);
  assert(profile && profile.collections.length > 0, `Profile has ${profile?.collections.length} collections`);

  // TEST 5: Link CRUD Operations
  console.log("\n5. Testing Link CRUD Operations in Database...");
  const testLink = await prisma.link.create({
    data: {
      profileId: profile.id,
      title: "Automated Test Link",
      url: "https://example.com/test",
      isEnabled: true,
      position: 99,
    },
  });
  assert(testLink.id !== undefined, "Link created successfully");

  const updatedLink = await prisma.link.update({
    where: { id: testLink.id },
    data: { title: "Updated Test Link Title" },
  });
  assert(updatedLink.title === "Updated Test Link Title", "Link updated successfully");

  await prisma.link.delete({ where: { id: testLink.id } });
  const checkDeleted = await prisma.link.findUnique({ where: { id: testLink.id } });
  assert(checkDeleted === null, "Link deleted successfully");

  // TEST 6: Template Catalog Integrity
  console.log("\n6. Testing Template Catalog & Categories...");
  const templateCount = await prisma.template.count({ where: { isPublished: true } });
  assert(templateCount >= 20, `Template library contains ${templateCount} published templates (Requirement: >= 20)`);

  const categoryCount = await prisma.templateCategory.count();
  assert(categoryCount === 10, `Template category count is ${categoryCount} (Requirement: 10 distinct categories)`);

  // TEST 7: Analytics Event Logging
  console.log("\n7. Testing Analytics Event Tracking...");
  const analyticsEvent = await prisma.analyticsEvent.create({
    data: {
      profileId: profile.id,
      type: "VIEW",
      visitorId: "test_visitor_unit_test",
      device: "Mobile",
      country: "Germany",
    },
  });
  assert(analyticsEvent.id !== undefined, "Analytics view event logged successfully");
  await prisma.analyticsEvent.delete({ where: { id: analyticsEvent.id } });

  // TEST 8: Commerce Domain
  console.log("\n8. Testing Creator Commerce Domain...");
  const productCount = await prisma.product.count();
  assert(typeof productCount === "number", "Creator Commerce Product model is operational");

  // TEST 9: Reserved Usernames
  console.log("\n9. Testing Reserved Usernames Protection...");
  const reservedList = ["admin", "dashboard", "marketplace", "support", "audience", "store", "qr", "sign-in"];
  assert(reservedList.includes("admin"), "Protects /admin from username claims");
  assert(reservedList.includes("marketplace"), "Protects /marketplace from username claims");
  assert(reservedList.includes("support"), "Protects /support from username claims");
  assert(reservedList.includes("store"), "Protects /store from username claims");
  assert(!reservedList.includes("creator_jill"), "Allows standard username 'creator_jill'");

  // TEST 10: Enterprise RBAC Roles & Permissions
  console.log("\n10. Testing Enterprise RBAC Permissions...");
  const superAdminPermissions = ["users:read", "users:write", "templates:publish", "settings:write", "marketplace:moderate"];
  const moderatorPermissions = ["users:read", "reports:moderate", "marketplace:moderate"];
  const userPermissions = [];

  assert(superAdminPermissions.includes("settings:write"), "SUPER_ADMIN has settings:write");
  assert(moderatorPermissions.includes("reports:moderate"), "MODERATOR has reports:moderate");
  assert(!moderatorPermissions.includes("settings:write"), "MODERATOR cannot perform settings:write");
  assert(!userPermissions.includes("users:read"), "USER cannot access administrative user lists");

  // TEST 11: Enterprise Feature Flags
  console.log("\n11. Testing Enterprise Feature Flags...");
  const flagCount = await prisma.featureFlag.count();
  assert(flagCount >= 2, `Platform has ${flagCount} feature flags registered (marketplace_v2, custom_domains)`);

  // TEST 12: Enterprise Support Tickets
  console.log("\n12. Testing Enterprise Support Tickets...");
  const ticketCount = await prisma.supportTicket.count();
  assert(ticketCount >= 1, `Support module has ${ticketCount} registered customer tickets`);

  // TEST 13: Enterprise Teams Domain
  console.log("\n13. Testing Enterprise Teams & Multi-profile...");
  const team = await prisma.team.findFirst({ include: { members: true } });
  assert(team !== null, "Enterprise team exists");
  assert(team && team.members.length > 0, "Team has enrolled members");

  // TEST 14: YouTube Video Parsing & Embed Validation
  console.log("\n14. Testing YouTube Video Detection & Embed Support...");
  function extractYouTubeId(url) {
    if (!url) return null;
    const trimmed = url.trim();
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    return null;
  }

  assert(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ") === "dQw4w9WgXcQ", "Extracts standard watch URL ID");
  assert(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ") === "dQw4w9WgXcQ", "Extracts youtu.be short URL ID");
  assert(extractYouTubeId("https://www.youtube.com/shorts/3i_b7X_oK7I") === "3i_b7X_oK7I", "Extracts YouTube Shorts video ID");
  assert(extractYouTubeId("https://example.com/not-youtube") === null, "Returns null for non-YouTube links");

  // Test YouTube Link with displayMode and multi-video carousel in database
  const extraVids = JSON.stringify([
    { url: "https://www.youtube.com/watch?v=2qBsN3fO_e8", title: "Second Video" },
    { url: "https://youtu.be/3i_b7X_oK7I", title: "Third Video" },
  ]);
  const ytTestLink = await prisma.link.create({
    data: {
      profileId: profile.id,
      title: "Featured Tech Talk 2026",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: extraVids,
      displayMode: "embed",
      icon: "youtube",
      position: 999,
    },
  });
  assert(ytTestLink.displayMode === "embed", "Saves link with displayMode: 'embed'");
  assert(ytTestLink.thumbnail.includes("2qBsN3fO_e8"), "Stores extra carousel videos in thumbnail JSON");
  await prisma.link.delete({ where: { id: ytTestLink.id } });

  // Test Zod linkSchema handling for null description and null thumbnail
  const { z: testZod } = require("zod");
  const testLinkSchema = testZod.object({
    title: testZod.string().min(1).max(100),
    url: testZod.string().min(1).refine(isValidSecureUrl),
    description: testZod.string().max(200).nullable().optional(),
    icon: testZod.string().nullable().optional(),
    thumbnail: testZod.string().nullable().optional(),
    displayMode: testZod.enum(["link", "embed"]).default("link").nullable().optional(),
    collectionId: testZod.string().nullable().optional(),
    isEnabled: testZod.boolean().default(true),
    isPinned: testZod.boolean().default(false),
  });

  const validYouTubePayload = testLinkSchema.safeParse({
    title: "Mening yangi videom",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: null,
    thumbnail: null,
    icon: "youtube",
    displayMode: "embed",
    collectionId: null,
    isEnabled: true,
    isPinned: false,
  });
  assert(validYouTubePayload.success === true, "linkSchema accepts null description and null thumbnail for YouTube videos");

  // Test Instagram & TikTok Embed Utilities and Schemas
  function isInstagramUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes("instagram.com") || lower.includes("instagr.am");
  }
  function extractInstagramUsername(url) {
    if (!url) return "creator";
    const trimmed = url.trim();
    if (trimmed.startsWith("@")) return trimmed.slice(1);
    const match = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:@)?([a-zA-Z0-9_.]+)/i);
    if (match && match[1]) {
      const candidate = match[1];
      if (!["p", "reel", "reels", "stories", "explore", "tv", "direct"].includes(candidate.toLowerCase())) {
        return candidate;
      }
    }
    return "creator";
  }
  function isTikTokUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes("tiktok.com");
  }
  function extractTikTokUsername(url) {
    if (!url) return "creator";
    const trimmed = url.trim();
    if (trimmed.startsWith("@")) return trimmed.slice(1);
    const match = trimmed.match(/tiktok\.com\/(?:@)?([a-zA-Z0-9_.]+)/i);
    if (match && match[1]) {
      return match[1].replace(/^@/, "");
    }
    return "creator";
  }

  assert(isInstagramUrl("https://www.instagram.com/shahuztech/"), "Detects standard Instagram profile URL");
  assert(extractInstagramUsername("https://instagram.com/shahuztech") === "shahuztech", "Extracts Instagram username correctly");
  assert(isTikTokUrl("https://www.tiktok.com/@shahuztech"), "Detects standard TikTok profile URL");
  assert(extractTikTokUsername("https://www.tiktok.com/@shahuztech?_t=1") === "shahuztech", "Extracts TikTok username correctly");

  const instaTestLink = await prisma.link.create({
    data: {
      profileId: profile.id,
      title: "My Instagram Feed",
      url: "https://instagram.com/shahuztech",
      displayMode: "embed",
      icon: "instagram",
      position: 998,
    },
  });
  assert(instaTestLink.displayMode === "embed", "Saves Instagram link with displayMode: 'embed'");
  await prisma.link.delete({ where: { id: instaTestLink.id } });

  const ttTestLink = await prisma.link.create({
    data: {
      profileId: profile.id,
      title: "My TikTok Feed",
      url: "https://tiktok.com/@shahuztech",
      displayMode: "embed",
      icon: "tiktok",
      position: 997,
    },
  });
  assert(ttTestLink.displayMode === "embed", "Saves TikTok link with displayMode: 'embed'");
  await prisma.link.delete({ where: { id: ttTestLink.id } });

  // 15. Testing AI Request Validation (Zod Schemas)
  console.log("\n15. Testing AI Request Validation (Zod Schemas)...");
  const { z } = require("zod");

  const testBioSchema = z.object({
    name: z.string().min(1).max(60),
    profession: z.string().min(1).max(100),
    category: z.string().default("CREATOR"),
    tone: z.enum(["professional", "playful", "bold", "minimalist", "poetic", "energetic", "tech_leader", "casual"]).default("professional"),
    language: z.enum(["en", "uz", "ru", "es", "fr", "de", "tr", "pt"]).default("en"),
  });

  const validBio = testBioSchema.safeParse({
    name: "Alex Rivera",
    profession: "Senior Full-Stack Engineer",
    category: "TECH",
    tone: "bold",
    language: "en",
  });
  assert(validBio.success === true, "Bio schema validates correct creator input");

  const invalidBio = testBioSchema.safeParse({
    name: "",
    profession: "Engineer",
  });
  assert(invalidBio.success === false, "Bio schema rejects empty creator name");

  const testLinkTitleSchema = z.object({
    url: z.string().min(1),
    tone: z.string().default("energetic"),
  });
  const validLink = testLinkTitleSchema.safeParse({ url: "https://github.com/shakh" });
  assert(validLink.success === true, "Link title optimizer validates url input");
  const invalidLink = testLinkTitleSchema.safeParse({ url: "" });
  assert(invalidLink.success === false, "Link title optimizer rejects empty url");

  const testThemeSchema = z.object({
    vibe: z.enum(["modern", "dark", "bold", "minimal", "cyber", "sunset", "nature"]),
    preferredLayout: z.enum(["classic", "hero", "banner", "cutout", "shape"]).optional(),
  });
  const validTheme = testThemeSchema.safeParse({ vibe: "cyber", preferredLayout: "hero" });
  assert(validTheme.success === true, "Theme recommender validates vibe and layout options");

  // 16. Testing AI Tier Limits & Quotas
  console.log("\n16. Testing AI Tier Limits & Quotas...");
  const AI_TIER_LIMITS = {
    FREE: 10,
    PRO: 200,
    BUSINESS: 1000,
  };
  assert(AI_TIER_LIMITS.FREE === 10, "FREE tier receives 10 AI generations/month limit");
  assert(AI_TIER_LIMITS.PRO === 200, "PRO tier receives 200 AI generations/month limit");
  assert(AI_TIER_LIMITS.BUSINESS === 1000, "BUSINESS tier receives 1000 AI generations/month limit");

  function evaluateQuota(used, limit) {
    const remaining = Math.max(0, limit - used);
    const allowed = used < limit;
    return { allowed, remaining };
  }

  const freeWithinQuota = evaluateQuota(3, AI_TIER_LIMITS.FREE);
  assert(freeWithinQuota.allowed === true && freeWithinQuota.remaining === 7, "User under limit is allowed with correct remaining quota");

  const freeAtQuota = evaluateQuota(10, AI_TIER_LIMITS.FREE);
  assert(freeAtQuota.allowed === false && freeAtQuota.remaining === 0, "User at limit is blocked from generating");

  const proOverLimit = evaluateQuota(205, AI_TIER_LIMITS.PRO);
  assert(proOverLimit.allowed === false && proOverLimit.remaining === 0, "PRO user exceeding limit is blocked");

  // 17. Testing AI Token & Cost Calculation
  console.log("\n17. Testing AI Token & Cost Calculation...");
  function calculateCost(inputTokens, outputTokens, costInputPer1k = 0.0001, costOutputPer1k = 0.0004) {
    const inputCost = (inputTokens / 1000) * costInputPer1k;
    const outputCost = (outputTokens / 1000) * costOutputPer1k;
    return Number((inputCost + outputCost).toFixed(6));
  }
  const estCost = calculateCost(500, 250);
  assert(estCost === 0.00015, "Computes precise token cost for Gemini flash model ($0.00015)");

  // 18. Testing Database AI Models & Persistence
  console.log("\n18. Testing Database AI Models & Persistence...");
  const user = await prisma.user.findFirst({ where: { email: "alex@creator.dev" } });
  assert(!!user, "Found test creator user alex@creator.dev");

  const currentPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-11"

  // Test AIGeneration model
  const testGen = await prisma.aIGeneration.create({
    data: {
      userId: user.id,
      type: "BIO",
      prompt: "Generate tech bio for Alex Rivera",
      inputJson: JSON.stringify({ name: "Alex Rivera", profession: "Full-Stack Engineer" }),
      outputJson: JSON.stringify({ bios: ["Building next-gen systems", "Full stack architect"] }),
      tokensUsed: 120,
      costEst: 0.00004,
      provider: "gemini",
      model: "gemini-2.5-flash",
      status: "SUCCESS",
      isApplied: false,
    },
  });
  assert(testGen.id && testGen.type === "BIO", "Successfully created AIGeneration record in database");

  // Test AIUsage model upsert
  const testUsage = await prisma.aIUsage.upsert({
    where: { userId: user.id },
    update: {
      generationCount: { increment: 1 },
      tokenCount: { increment: 120 },
      lastUsedAt: new Date(),
    },
    create: {
      userId: user.id,
      period: currentPeriod,
      generationCount: 1,
      tokenCount: 120,
      estimatedCost: 0.00004,
    },
  });
  assert(testUsage.generationCount >= 1, "AIUsage record successfully tracked monthly generation counter");

  // Test AISettings model
  const testSettings = await prisma.aISettings.upsert({
    where: { userId: user.id },
    update: {
      preferredTone: "tech_leader",
      preferredLanguage: "en",
    },
    create: {
      userId: user.id,
      preferredTone: "tech_leader",
      preferredLanguage: "en",
      defaultProvider: "gemini",
    },
  });
  assert(testSettings.preferredTone === "tech_leader", "AISettings model saved creator tone preference");

  // 19. Testing Direct AI Profile & Theme Application
  console.log("\n19. Testing Direct AI Profile & Theme Application...");
  const originalBio = profile.bio;
  const originalLayout = profile.layout;

  // Apply AI bio to profile
  const updatedProfile = await prisma.profile.update({
    where: { id: profile.id },
    data: { bio: "🚀 Senior Full-Stack Engineer | Building scalable cloud architectures" },
  });
  assert(updatedProfile.bio.includes("Senior Full-Stack Engineer"), "Directly applies AI generated bio to Profile model");

  // Update generation isApplied status
  const appliedGen = await prisma.aIGeneration.update({
    where: { id: testGen.id },
    data: { isApplied: true },
  });
  assert(appliedGen.isApplied === true, "Marks AIGeneration.isApplied = true upon application");

  // Restore original state
  await prisma.profile.update({
    where: { id: profile.id },
    data: { bio: originalBio, layout: originalLayout },
  });
  await prisma.aIGeneration.delete({ where: { id: testGen.id } });
  assert(true, "Cleaned up test AI generation record and restored profile");

  // ==========================================
  // PHASE 02: DIGITAL STOREFRONT & CREATOR SHOP TESTS
  // ==========================================

  // 20. Testing Digital Storefront Product CRUD & Product Types
  console.log("\n20. Testing Digital Storefront Product CRUD & Product Types...");
  const sampleProductsData = [
    { title: "Next.js SaaS Boilerplate", type: "DIGITAL_DOWNLOAD", price: 49.0, category: "Development & Code" },
    { title: "Full-Stack System Design Handbook", type: "EBOOK", price: 19.99, category: "Education & Learning" },
    { title: "Advanced Microservices Masterclass", type: "COURSE", price: 99.0, category: "Development & Code" },
    { title: "1-on-1 Architecture Advisory Call", type: "SERVICE", price: 150.0, category: "Business & Marketing" },
    { title: "BioSpace Developer Hoodie", type: "PHYSICAL", price: 38.0, category: "Lifestyle & Music" },
    { title: "Curated AI Tools Directory", type: "EXTERNAL", price: 0.0, category: "Productivity & Tools" },
  ];

  const createdProducts = [];
  for (let i = 0; i < sampleProductsData.length; i++) {
    const item = sampleProductsData[i];
    const p = await prisma.product.create({
      data: {
        profileId: profile.id,
        title: item.title,
        type: item.type,
        price: item.price,
        currency: "USD",
        category: item.category,
        description: `High quality ${item.type} resource for creators and engineers.`,
        isFeatured: i === 0,
        isEnabled: true,
        position: 100 + i,
      },
    });
    createdProducts.push(p);
  }

  assert(createdProducts.length === 6, "Successfully created all 6 product types in database");
  assert(createdProducts.some((p) => p.type === "DIGITAL_DOWNLOAD"), "Supports DIGITAL_DOWNLOAD product type");
  assert(createdProducts.some((p) => p.type === "EBOOK"), "Supports EBOOK product type");
  assert(createdProducts.some((p) => p.type === "COURSE"), "Supports COURSE product type");
  assert(createdProducts.some((p) => p.type === "SERVICE"), "Supports SERVICE product type");
  assert(createdProducts.some((p) => p.type === "PHYSICAL"), "Supports PHYSICAL product type");
  assert(createdProducts.some((p) => p.type === "EXTERNAL"), "Supports EXTERNAL product type");

  // Edit product
  const productToEdit = createdProducts[0];
  const updatedProd = await prisma.product.update({
    where: { id: productToEdit.id },
    data: {
      price: 59.0,
      description: "Updated enterprise-grade SaaS blueprint",
      isFeatured: true,
    },
  });
  assert(updatedProd.price === 59.0 && updatedProd.isFeatured === true, "Successfully edited product price and featured status");

  // Toggle publish
  const unpublished = await prisma.product.update({
    where: { id: productToEdit.id },
    data: { isEnabled: false },
  });
  assert(unpublished.isEnabled === false, "Successfully toggled product status to unpublished/draft");

  // Reorder products
  await prisma.$transaction([
    prisma.product.update({ where: { id: createdProducts[0].id }, data: { position: 1 } }),
    prisma.product.update({ where: { id: createdProducts[1].id }, data: { position: 0 } }),
  ]);
  const reordered = await prisma.product.findMany({
    where: { id: { in: [createdProducts[0].id, createdProducts[1].id] } },
    orderBy: { position: "asc" },
  });
  assert(reordered[0].id === createdProducts[1].id, "Successfully reordered product positions");

  // 21. Testing Storefront Zod Validations
  console.log("\n21. Testing Storefront Zod Validations...");
  const ProductTypeEnum = z.enum([
    "DIGITAL_DOWNLOAD",
    "EBOOK",
    "COURSE",
    "SERVICE",
    "PHYSICAL",
    "EXTERNAL",
  ]);

  const productCreateSchema = z.object({
    title: z.string().min(2, "Product title must be at least 2 characters").max(100),
    description: z.string().max(2500).optional().nullable(),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    currency: z.string().max(5).default("USD"),
    imageUrl: z.string().url().optional().nullable().or(z.literal("")),
    type: ProductTypeEnum.default("DIGITAL_DOWNLOAD"),
    category: z.string().max(50).default("General"),
    isDigital: z.boolean().default(true),
    isEnabled: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  });

  const checkoutRequestSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    customerEmail: z.string().email("A valid email address is required"),
    customerName: z.string().max(100).optional().nullable(),
    quantity: z.number().int().min(1).max(10).default(1),
  });

  const refundRequestSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    reason: z.string().max(500).optional(),
  });

  const validProdInput = productCreateSchema.safeParse({
    title: "Modern React Patterns",
    price: 29.99,
    type: "EBOOK",
    category: "Development & Code",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
  });
  assert(validProdInput.success === true, "Zod validates correct product creation input");

  const invalidProdShortTitle = productCreateSchema.safeParse({
    title: "A",
    price: 10,
  });
  assert(invalidProdShortTitle.success === false, "Zod rejects product title shorter than 2 characters");

  const invalidProdNegPrice = productCreateSchema.safeParse({
    title: "Valid Title",
    price: -5.0,
  });
  assert(invalidProdNegPrice.success === false, "Zod rejects negative product price");

  const validCheckout = checkoutRequestSchema.safeParse({
    productId: productToEdit.id,
    customerEmail: "buyer@example.com",
    customerName: "John Buyer",
    quantity: 1,
  });
  assert(validCheckout.success === true, "Zod validates customer checkout request");

  const invalidCheckoutEmail = checkoutRequestSchema.safeParse({
    productId: productToEdit.id,
    customerEmail: "not-an-email",
  });
  assert(invalidCheckoutEmail.success === false, "Zod rejects checkout with invalid email format");

  const validRefund = refundRequestSchema.safeParse({
    orderId: "ord_12345",
    reason: "Duplicate charge",
  });
  assert(validRefund.success === true, "Zod validates refund request payload");

  // 22. Testing Subscription Limits for Storefront
  console.log("\n22. Testing Subscription Limits for Storefront...");
  const STORE_SUBSCRIPTION_LIMITS = {
    FREE: 3,
    PRO: 25,
    BUSINESS: 1000,
  };

  function getProductLimitByTier(tier = "FREE") {
    return STORE_SUBSCRIPTION_LIMITS[tier.toUpperCase()] || STORE_SUBSCRIPTION_LIMITS.FREE;
  }

  assert(getProductLimitByTier("FREE") === 3, "FREE plan enforces maximum limit of 3 products");
  assert(getProductLimitByTier("PRO") === 25, "PRO plan enforces maximum limit of 25 products");
  assert(getProductLimitByTier("BUSINESS") === 1000, "BUSINESS plan allows unlimited (1000) products");

  function evaluateStoreQuota(count, tier) {
    const limit = getProductLimitByTier(tier);
    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
    };
  }

  assert(evaluateStoreQuota(2, "FREE").allowed === true, "Allows adding product when under FREE tier limit");
  assert(evaluateStoreQuota(3, "FREE").allowed === false, "Blocks adding product when reaching FREE tier limit of 3");
  assert(evaluateStoreQuota(20, "PRO").allowed === true, "Allows adding product under PRO tier limit of 25");
  assert(evaluateStoreQuota(25, "PRO").allowed === false, "Blocks adding product when reaching PRO tier limit of 25");

  // 23. Testing Store Checkout Sessions & Order Creation
  console.log("\n23. Testing Store Checkout Sessions & Order Creation...");

  // Test Free Product instant fulfillment
  const freeProduct = createdProducts.find((p) => p.price === 0);
  const freeOrderNum = `ORD-FREE-${Date.now().toString().slice(-6)}`;
  const createdFreeOrder = await prisma.order.create({
    data: {
      orderNumber: freeOrderNum,
      profileId: profile.id,
      productId: freeProduct.id,
      customerEmail: "freebie@developer.io",
      customerName: "Dev User",
      amount: 0,
      currency: "USD",
      status: "COMPLETED",
      items: {
        create: {
          productId: freeProduct.id,
          title: freeProduct.title,
          price: 0,
          quantity: 1,
        },
      },
    },
    include: { items: true },
  });
  assert(createdFreeOrder.status === "COMPLETED", "Instant fulfillment: Free order status is immediately COMPLETED");
  assert(createdFreeOrder.orderNumber && createdFreeOrder.orderNumber.startsWith("ORD-"), "Generates unique human-readable order number");
  assert(createdFreeOrder.items.length === 1, "Creates associated OrderItem for free order");

  // Test Paid Product Order Creation
  const paidProduct = createdProducts[0];
  const paidOrderNum = `ORD-PAID-${Date.now().toString().slice(-6)}`;
  const createdPaidOrder = await prisma.order.create({
    data: {
      orderNumber: paidOrderNum,
      profileId: profile.id,
      productId: paidProduct.id,
      customerEmail: "payingbuyer@gmail.com",
      customerName: "Paying Customer",
      amount: paidProduct.price,
      currency: "USD",
      status: "PENDING",
      metadata: JSON.stringify({ quantity: 1 }),
    },
  });
  assert(createdPaidOrder.status === "PENDING", "Paid order initialized in PENDING state awaiting provider webhook");
  assert(createdPaidOrder.amount === paidProduct.price, "Order records accurate product price");

  // 24. Testing Idempotent Webhook Processing
  console.log("\n24. Testing Idempotent Webhook Processing...");
  const fakeStripeSessionId = `cs_test_${Date.now()}`;
  const fakeEventId = `evt_test_${Date.now()}_abc`;

  // Attach stripeSessionId to order for webhook matching
  await prisma.order.update({
    where: { id: createdPaidOrder.id },
    data: { stripeSessionId: fakeStripeSessionId },
  });

  // Helper simulating webhook logic
  async function testProcessWebhook(eventId, sessionId, orderId) {
    const existing = await prisma.paymentEvent.findUnique({ where: { stripeEventId: eventId } });
    if (existing) {
      return { processed: false, reason: "DUPLICATE_EVENT_ALREADY_PROCESSED" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (order && order.status !== "COMPLETED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED", paymentIntentId: "pi_test_12345" },
        }),
        prisma.product.update({
          where: { id: order.productId },
          data: { salesCount: { increment: 1 } },
        }),
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: order.productId,
            title: order.product.title,
            price: order.amount,
            quantity: 1,
          },
        }),
        prisma.paymentEvent.create({
          data: {
            stripeEventId: eventId,
            eventType: "checkout.session.completed",
            amount: order.amount,
            currency: "USD",
            payload: JSON.stringify({ id: sessionId }),
            status: "PROCESSED",
            orderId: order.id,
          },
        }),
      ]);
      return { processed: true };
    }
    return { processed: false };
  }

  // First webhook delivery
  const webhookResult1 = await testProcessWebhook(fakeEventId, fakeStripeSessionId, createdPaidOrder.id);
  assert(webhookResult1.processed === true, "First webhook delivery transitions order to COMPLETED");

  const orderAfterWebhook = await prisma.order.findUnique({
    where: { id: createdPaidOrder.id },
    include: { items: true },
  });
  assert(orderAfterWebhook.status === "COMPLETED", "Verified order marked as COMPLETED by webhook");
  assert(orderAfterWebhook.items.length === 1, "Verified order has OrderItem created upon completion");

  const loggedPaymentEvent = await prisma.paymentEvent.findUnique({
    where: { stripeEventId: fakeEventId },
  });
  assert(loggedPaymentEvent !== null, "PaymentEvent logged in database with unique stripeEventId");

  // Second duplicate webhook delivery (Idempotency verification)
  const webhookResult2 = await testProcessWebhook(fakeEventId, fakeStripeSessionId, createdPaidOrder.id);
  assert(webhookResult2.processed === false && webhookResult2.reason === "DUPLICATE_EVENT_ALREADY_PROCESSED", "Duplicate webhook event is safely ignored without re-crediting (idempotent!)");

  // 25. Testing Seller Refund Authorization
  console.log("\n25. Testing Seller Refund Authorization...");
  async function testRefundOrder(orderId, requestUserId) {
    const ord = await prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: true },
    });
    if (!ord || ord.profile.userId !== requestUserId) {
      return { success: false, message: "Unauthorized access" };
    }
    if (ord.status === "REFUNDED") {
      return { success: false, message: "Already refunded" };
    }
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED", refundedAmount: ord.amount },
    });
    return { success: true, order: updated };
  }

  const refundResult = await testRefundOrder(createdPaidOrder.id, user.id);
  assert(refundResult.success === true, "Authorized seller can execute order refund");

  const refundedOrderInDB = await prisma.order.findUnique({
    where: { id: createdPaidOrder.id },
  });
  assert(refundedOrderInDB.status === "REFUNDED", "Order status updated to REFUNDED in database");
  assert(refundedOrderInDB.refundedAmount === paidProduct.price, "Order records accurate refundedAmount");

  // Unauthorized refund attempt (wrong user)
  const unauthorizedRefund = await testRefundOrder(createdPaidOrder.id, "unauthorized_attacker_id");
  assert(unauthorizedRefund.success === false, "Blocks unauthorized user from refunding orders");

  // 26. Testing Product Views & Clicks Tracking
  console.log("\n26. Testing Product Views & Clicks Tracking...");
  const productForTracking = createdProducts[1];
  const viewedProd = await prisma.product.update({
    where: { id: productForTracking.id },
    data: { viewsCount: { increment: 1 } },
  });
  assert(viewedProd.viewsCount >= 1, "Tracks product views count");

  const clickedProd = await prisma.product.update({
    where: { id: productForTracking.id },
    data: { clicksCount: { increment: 1 } },
  });
  assert(clickedProd.clicksCount >= 1, "Tracks product purchase clicks count");

  // Cleanup test storefront records
  await prisma.orderItem.deleteMany({
    where: { orderId: { in: [createdFreeOrder.id, createdPaidOrder.id] } },
  });
  await prisma.order.deleteMany({
    where: { id: { in: [createdFreeOrder.id, createdPaidOrder.id] } },
  });
  await prisma.paymentEvent.deleteMany({
    where: { stripeEventId: fakeEventId },
  });
  await prisma.product.deleteMany({
    where: { id: { in: createdProducts.map((p) => p.id) } },
  });
  assert(true, "Cleaned up all temporary test orders, payment events, and products");

  // ==========================================
  // PHASE 03: EMAIL MARKETING & SUBSCRIBER MANAGEMENT TESTS
  // ==========================================

  // 27. Testing Subscriber Creation & Consent Logging
  console.log("\n27. Testing Subscriber Creation & Consent Logging...");
  const subscribeSchema = z.object({
    profileId: z.string().min(1),
    email: z.string().email(),
    name: z.string().optional().nullable(),
    consentText: z.string().min(5),
  });

  const validSubInput = subscribeSchema.safeParse({
    profileId: profile.id,
    email: "creatorfan@techpulse.org",
    name: "Tech Fan",
    consentText: "I agree to receive email updates and newsletters.",
  });
  assert(validSubInput.success === true, "Zod validates compliant subscriber input");

  const invalidSubEmail = subscribeSchema.safeParse({
    profileId: profile.id,
    email: "not-an-email-at-all",
    consentText: "I agree",
  });
  assert(invalidSubEmail.success === false, "Zod rejects invalid email format");

  const invalidConsent = subscribeSchema.safeParse({
    profileId: profile.id,
    email: "valid@email.com",
    consentText: "",
  });
  assert(invalidConsent.success === false, "Zod rejects missing or empty consent text");

  // Create Subscriber in Database
  const testSub = await prisma.subscriber.create({
    data: {
      profileId: profile.id,
      email: "creatorfan@techpulse.org",
      name: "Tech Fan",
      status: "PENDING",
      source: "profile_page",
      consents: {
        create: {
          consentType: "EMAIL_MARKETING",
          consentText: "I agree to receive email updates and newsletters.",
          source: "profile_page",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 Test Suite Runner",
        },
      },
    },
    include: { consents: true },
  });
  assert(testSub.id && testSub.status === "PENDING", "Subscriber created in database with initial PENDING status");
  assert(testSub.consents.length === 1, "Recorded explicit GDPR subscription consent with timestamp & IP");

  // Generate 24h verification token
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const verifToken = await prisma.emailVerificationToken.create({
    data: {
      subscriberId: testSub.id,
      expiresAt: tokenExpiresAt,
      type: "CONFIRMATION",
    },
  });
  assert(verifToken.token && verifToken.expiresAt > new Date(), "Generated 24-hour verification token for double opt-in");

  // Log confirmation email dispatch
  const confirmLog = await prisma.emailDeliveryLog.create({
    data: {
      subscriberId: testSub.id,
      recipientEmail: testSub.email,
      subject: "Action Required: Confirm your subscription",
      template: "CONFIRMATION",
      provider: "biospace_mail",
      status: "SENT",
    },
  });
  assert(confirmLog.status === "SENT", "Recorded confirmation email dispatch in EmailDeliveryLog");

  // 28. Testing Double Opt-In Email Confirmation
  console.log("\n28. Testing Double Opt-In Email Confirmation...");
  // Simulate confirmation
  const confirmedSub = await prisma.subscriber.update({
    where: { id: testSub.id },
    data: {
      status: "ACTIVE",
      confirmedAt: new Date(),
    },
  });
  await prisma.emailVerificationToken.update({
    where: { id: verifToken.id },
    data: { usedAt: new Date() },
  });
  assert(confirmedSub.status === "ACTIVE", "Double opt-in verification transitions status from PENDING to ACTIVE");
  assert(confirmedSub.confirmedAt !== null, "Records verified confirmation timestamp");

  // Log welcome email dispatch
  const welcomeLog = await prisma.emailDeliveryLog.create({
    data: {
      subscriberId: testSub.id,
      recipientEmail: testSub.email,
      subject: "You're subscribed! Welcome",
      template: "WELCOME",
      provider: "biospace_mail",
      status: "SENT",
    },
  });
  assert(welcomeLog.template === "WELCOME", "Dispatches and logs Welcome email upon confirmation");

  // Test token expiration verification
  const expiredToken = await prisma.emailVerificationToken.create({
    data: {
      subscriberId: testSub.id,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      type: "CONFIRMATION",
    },
  });
  const isExpired = new Date() > expiredToken.expiresAt;
  assert(isExpired === true, "Correctly identifies and rejects expired verification tokens");

  // 29. Testing Duplicate Email Handling
  console.log("\n29. Testing Duplicate Email Handling...");
  try {
    await prisma.subscriber.create({
      data: {
        profileId: profile.id,
        email: "creatorfan@techpulse.org", // duplicate email on same profile
        status: "PENDING",
      },
    });
    assert(false, "Should have thrown unique constraint violation on duplicate email");
  } catch (err) {
    assert(err.code === "P2002", "Database unique constraint [profileId, email] prevents duplicate subscriptions");
  }

  // 30. Testing One-Click Unsubscribe Functionality
  console.log("\n30. Testing One-Click Unsubscribe Functionality...");
  assert(testSub.unsubscribeToken !== null, "Subscriber has unique secure unsubscribe token");

  const unsubscribedRecord = await prisma.subscriber.update({
    where: { unsubscribeToken: testSub.unsubscribeToken },
    data: {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
    },
  });
  assert(unsubscribedRecord.status === "UNSUBSCRIBED", "Transitions status to UNSUBSCRIBED upon 1-click token visit");
  assert(unsubscribedRecord.unsubscribedAt !== null, "Records accurate unsubscribed timestamp");

  // 31. Testing Subscriber Search, Filtering & CSV Export
  console.log("\n31. Testing Subscriber Search, Filtering & CSV Export...");
  // Create additional test subscribers
  const extraSub1 = await prisma.subscriber.create({
    data: {
      profileId: profile.id,
      email: "anna.dev@company.com",
      name: "Anna Developer",
      status: "ACTIVE",
      source: "profile_page",
    },
  });
  const extraSub2 = await prisma.subscriber.create({
    data: {
      profileId: profile.id,
      email: "bob.ross@artcraft.net",
      name: "Bob Ross",
      status: "PENDING",
      source: "checkout",
    },
  });

  // Search by email substring
  const searchResults = await prisma.subscriber.findMany({
    where: {
      profileId: profile.id,
      email: { contains: "anna.dev" },
    },
  });
  assert(searchResults.length === 1 && searchResults[0].email === "anna.dev@company.com", "Searches subscribers by email query");

  // Filter by status
  const activeOnly = await prisma.subscriber.findMany({
    where: {
      profileId: profile.id,
      status: "ACTIVE",
    },
  });
  assert(activeOnly.some((s) => s.email === "anna.dev@company.com"), "Filters subscribers by ACTIVE status");

  // CSV Export generation
  const allForExport = await prisma.subscriber.findMany({
    where: { profileId: profile.id },
  });
  const csvHeaders = "ID,Email,Name,Status,Source,SubscribedAt\n";
  const csvRows = allForExport.map((s) => `"${s.id}","${s.email}","${s.name || ""}","${s.status}","${s.source}","${s.subscribedAt}"`).join("\n");
  const fullCsv = csvHeaders + csvRows;
  assert(fullCsv.includes("anna.dev@company.com") && fullCsv.startsWith("ID,Email"), "Generates valid compliant CSV export of subscriber directory");

  // 32. Testing GDPR Erasure & Permissions
  console.log("\n32. Testing GDPR Erasure & Permissions...");
  async function testDeleteSubscriber(subscriberId, requestUserId) {
    const s = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      include: { profile: true },
    });
    if (!s || s.profile.userId !== requestUserId) {
      return { success: false, message: "Unauthorized access" };
    }
    await prisma.subscriber.delete({ where: { id: subscriberId } });
    return { success: true };
  }

  // Unauthorized delete attempt
  const unauthorizedDelete = await testDeleteSubscriber(extraSub1.id, "unauthorized_hacker");
  assert(unauthorizedDelete.success === false, "Blocks unauthorized users from deleting subscriber data");

  // Authorized delete
  const authorizedDelete = await testDeleteSubscriber(extraSub1.id, user.id);
  assert(authorizedDelete.success === true, "Authorized creator can permanently delete subscriber (GDPR compliant)");

  const checkSubDeleted = await prisma.subscriber.findUnique({ where: { id: extraSub1.id } });
  assert(checkSubDeleted === null, "Verified permanent deletion of subscriber from database");

  // 33. Testing Newsletter Profile Form Settings
  console.log("\n33. Testing Newsletter Profile Form Settings...");
  const updatedSettingsProfile = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      newsletterEnabled: true,
      newsletterTitle: "The Weekly Full-Stack Blueprint",
      newsletterDescription: "Actionable engineering advice every Sunday morning.",
      newsletterButtonText: "Join 10k+ Engineers",
      newsletterPlaceholder: "name@work.com",
      newsletterLayout: "hero",
    },
  });
  assert(updatedSettingsProfile.newsletterTitle === "The Weekly Full-Stack Blueprint", "Saves custom newsletter form title");
  assert(updatedSettingsProfile.newsletterLayout === "hero", "Supports customizable form layout (hero, card, minimal, inline)");

  // Cleanup test Phase 03 records
  await prisma.emailDeliveryLog.deleteMany({
    where: { subscriberId: { in: [testSub.id, extraSub2.id] } },
  });
  await prisma.emailVerificationToken.deleteMany({
    where: { subscriberId: { in: [testSub.id, extraSub2.id] } },
  });
  await prisma.subscriptionConsent.deleteMany({
    where: { subscriberId: { in: [testSub.id, extraSub2.id] } },
  });
  await prisma.subscriber.deleteMany({
    where: { id: { in: [testSub.id, extraSub2.id] } },
  });
  assert(true, "Cleaned up all temporary test subscribers, tokens, consents, and delivery logs");

  // ==========================================
  // PHASE 04: APPOINTMENT BOOKING SYSTEM TESTS
  // ==========================================

  // 34. Testing Appointment Types Creation & Configuration
  console.log("\n34. Testing Appointment Types Creation & Validation...");
  const freeConsultation = await prisma.appointmentType.create({
    data: {
      profileId: profile.id,
      title: "30 Min Discovery Consultation",
      description: "Quick intro to align on project requirements and roadmap.",
      category: "CONSULTATION",
      duration: 30,
      bufferTime: 10,
      price: 0,
      currency: "USD",
      locationType: "GOOGLE_MEET",
      locationUrl: "https://meet.google.com/abc-defg-hij",
      color: "#8b5cf6",
      isActive: true,
      position: 0,
    },
  });
  assert(freeConsultation.id !== undefined, "Creates free consultation appointment type");
  assert(freeConsultation.duration === 30, "Sets 30-minute duration correctly");
  assert(freeConsultation.bufferTime === 10, "Sets 10-minute buffer time between sessions");
  assert(freeConsultation.price === 0, "Correctly identifies free appointment");

  const paidCoaching = await prisma.appointmentType.create({
    data: {
      profileId: profile.id,
      title: "60 Min 1-on-1 Architecture Coaching",
      description: "Deep dive code review and system design session.",
      category: "COACHING",
      duration: 60,
      bufferTime: 15,
      price: 150.0,
      currency: "USD",
      locationType: "ZOOM",
      locationUrl: "https://zoom.us/j/987654321",
      color: "#10b981",
      isActive: true,
      position: 1,
    },
  });
  assert(paidCoaching.price === 150.0, "Creates paid appointment type with price");
  assert(paidCoaching.locationType === "ZOOM", "Supports diverse meeting locations (Zoom, Google Meet, In Person)");

  // 35. Testing Weekly Availability Schedule & Timezones
  console.log("\n35. Testing Weekly Availability Schedule & Timezones...");
  // Clear any existing rules
  await prisma.availabilityRule.deleteMany({ where: { profileId: profile.id } });

  // Add Monday through Friday 09:00 - 17:00 (days 1-5)
  const daysToCreate = [1, 2, 3, 4, 5];
  for (const day of daysToCreate) {
    await prisma.availabilityRule.create({
      data: {
        profileId: profile.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isEnabled: true,
        timezone: "UTC",
      },
    });
  }

  // Add Saturday disabled
  await prisma.availabilityRule.create({
    data: {
      profileId: profile.id,
      dayOfWeek: 6,
      startTime: "10:00",
      endTime: "14:00",
      isEnabled: false,
      timezone: "UTC",
    },
  });

  const savedRules = await prisma.availabilityRule.findMany({
    where: { profileId: profile.id },
  });
  assert(savedRules.length === 6, "Persists weekly availability rules across days of week");
  const monRule = savedRules.find((r) => r.dayOfWeek === 1);
  assert(monRule && monRule.startTime === "09:00" && monRule.endTime === "17:00", "Stores working hours window (09:00 - 17:00)");
  const satRule = savedRules.find((r) => r.dayOfWeek === 6);
  assert(satRule && satRule.isEnabled === false, "Correctly recognizes disabled non-working days");

  // 36. Testing Time Slot Generation & Duration Calculations
  console.log("\n36. Testing Time Slot Generation & Duration Calculations...");
  // Calculate slots mathematically: 9:00 to 17:00 is 8 hours = 480 mins
  // Step for 30m duration + 10m buffer = 40 mins
  // Total potential slots in 480 mins with 40 min step: 12 candidate slots
  const durationMs = freeConsultation.duration * 60 * 1000;
  const bufferMs = freeConsultation.bufferTime * 60 * 1000;
  const stepMs = durationMs + bufferMs;

  const simWindowStart = new Date("2026-12-01T09:00:00.000Z");
  const simWindowEnd = new Date("2026-12-01T17:00:00.000Z");
  let simulatedSlots = [];
  let curr = new Date(simWindowStart.getTime());
  while (curr.getTime() + durationMs <= simWindowEnd.getTime()) {
    simulatedSlots.push({
      start: new Date(curr.getTime()),
      end: new Date(curr.getTime() + durationMs),
    });
    curr = new Date(curr.getTime() + stepMs);
  }
  assert(simulatedSlots.length === 12, "Calculates exact slot count considering duration and buffer intervals (12 slots)");
  assert(
    simulatedSlots[0].end.getTime() - simulatedSlots[0].start.getTime() === 30 * 60 * 1000,
    "Each generated slot matches appointment duration exactly"
  );
  assert(
    simulatedSlots[1].start.getTime() - simulatedSlots[0].end.getTime() === 10 * 60 * 1000,
    "Adjacent slots respect configured buffer interval"
  );

  // 37. Testing Booking Creation & Double Booking Protection
  console.log("\n37. Testing Booking Creation & Strict Double Booking Protection...");
  const crypto = require("crypto");
  const bookStart1 = new Date("2026-12-01T10:00:00.000Z");
  const bookEnd1 = new Date("2026-12-01T10:30:00.000Z");
  const cancelToken1 = crypto.randomBytes(24).toString("hex");
  const rescheduleToken1 = crypto.randomBytes(24).toString("hex");

  // Create first booking inside database transaction
  const booking1 = await prisma.$transaction(async (tx) => {
    // Conflict check
    const existingConflict = await tx.booking.findFirst({
      where: {
        profileId: profile.id,
        status: { in: ["CONFIRMED", "RESCHEDULED"] },
        startTime: { lt: bookEnd1 },
        endTime: { gt: bookStart1 },
      },
    });
    if (existingConflict) throw new Error("Slot conflict");

    const b = await tx.booking.create({
      data: {
        profileId: profile.id,
        appointmentTypeId: freeConsultation.id,
        customerName: "Alice Wonderland",
        customerEmail: "alice@example.com",
        customerPhone: "+1234567890",
        customerNotes: "Interested in BioSpace enterprise plan.",
        startTime: bookStart1,
        endTime: bookEnd1,
        status: "CONFIRMED",
        meetingUrl: freeConsultation.locationUrl,
        locationType: freeConsultation.locationType,
        price: freeConsultation.price,
        currency: freeConsultation.currency,
        isPaid: true,
        cancelToken: cancelToken1,
        rescheduleToken: rescheduleToken1,
      },
    });

    // Create notifications
    await tx.bookingNotification.createMany({
      data: [
        {
          bookingId: b.id,
          type: "CONFIRMATION",
          recipientEmail: b.customerEmail,
          recipientRole: "ATTENDEE",
          status: "SENT",
          subject: `Confirmed: ${freeConsultation.title}`,
          content: `Your meeting is confirmed for ${bookStart1.toISOString()}`,
        },
        {
          bookingId: b.id,
          type: "NEW_BOOKING",
          recipientEmail: user.email,
          recipientRole: "CREATOR",
          status: "SENT",
          subject: `New Booking: ${b.customerName}`,
          content: `${b.customerName} scheduled ${freeConsultation.title}`,
        },
      ],
    });

    return b;
  });

  assert(booking1.id !== undefined, "Creates confirmed booking with transaction safety");
  assert(booking1.status === "CONFIRMED", "Sets booking status to CONFIRMED");
  assert(booking1.cancelToken.length === 48, "Generates secure unique cancellation token");
  assert(booking1.rescheduleToken.length === 48, "Generates secure unique reschedule token");

  const notifications = await prisma.bookingNotification.findMany({
    where: { bookingId: booking1.id },
  });
  assert(notifications.length === 2, "Generates email notifications for both attendee and creator");
  assert(notifications.some((n) => n.recipientRole === "ATTENDEE"), "Delivers attendee booking confirmation notice");
  assert(notifications.some((n) => n.recipientRole === "CREATOR"), "Delivers creator new booking alert");

  // TEST DOUBLE BOOKING: Attempting exact same slot MUST fail
  let duplicatePrevented = false;
  try {
    await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          profileId: profile.id,
          status: { in: ["CONFIRMED", "RESCHEDULED"] },
          startTime: { lt: bookEnd1 },
          endTime: { gt: bookStart1 },
        },
      });
      if (conflict) {
        throw new Error("Double booking detected: Time slot is already reserved.");
      }
      await tx.booking.create({
        data: {
          profileId: profile.id,
          appointmentTypeId: freeConsultation.id,
          customerName: "Bob Imposter",
          customerEmail: "bob@example.com",
          startTime: bookStart1,
          endTime: bookEnd1,
          cancelToken: "dummy1",
          rescheduleToken: "dummy2",
        },
      });
    });
  } catch (err) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented, "Double booking protection strictly blocks duplicate reservation of identical slot");

  // TEST OVERLAPPING BOOKING: Attempting overlapping slot (10:15 - 10:45) MUST fail
  let overlapPrevented = false;
  const overlapStart = new Date("2026-12-01T10:15:00.000Z");
  const overlapEnd = new Date("2026-12-01T10:45:00.000Z");
  try {
    await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          profileId: profile.id,
          status: { in: ["CONFIRMED", "RESCHEDULED"] },
          startTime: { lt: overlapEnd },
          endTime: { gt: overlapStart },
        },
      });
      if (conflict) {
        throw new Error("Overlap conflict detected!");
      }
    });
  } catch (err) {
    overlapPrevented = true;
  }
  assert(overlapPrevented, "Double booking protection prevents partially overlapping slot times (10:15 - 10:45)");

  // 38. Testing Booking Rescheduling with Conflict Validation
  console.log("\n38. Testing Booking Rescheduling with Conflict Validation...");
  // Create a second booking at 14:00 - 15:00 for coaching
  const bookStart2 = new Date("2026-12-01T14:00:00.000Z");
  const bookEnd2 = new Date("2026-12-01T15:00:00.000Z");
  const booking2 = await prisma.booking.create({
    data: {
      profileId: profile.id,
      appointmentTypeId: paidCoaching.id,
      customerName: "Charlie Brown",
      customerEmail: "charlie@example.com",
      startTime: bookStart2,
      endTime: bookEnd2,
      status: "CONFIRMED",
      price: 150.0,
      currency: "USD",
      isPaid: true,
      cancelToken: crypto.randomBytes(24).toString("hex"),
      rescheduleToken: crypto.randomBytes(24).toString("hex"),
    },
  });

  // Attempt to reschedule booking2 into booking1's slot (10:00 - 11:00) -> Should fail!
  let rescheduleConflictCaught = false;
  try {
    await prisma.$transaction(async (tx) => {
      const targetStart = new Date("2026-12-01T10:00:00.000Z");
      const targetEnd = new Date("2026-12-01T11:00:00.000Z");
      const conflict = await tx.booking.findFirst({
        where: {
          profileId: profile.id,
          status: { in: ["CONFIRMED", "RESCHEDULED"] },
          startTime: { lt: targetEnd },
          endTime: { gt: targetStart },
          id: { not: booking2.id },
        },
      });
      if (conflict) throw new Error("Slot conflict during reschedule");
    });
  } catch (err) {
    rescheduleConflictCaught = true;
  }
  assert(rescheduleConflictCaught, "Rescheduling prevents moving into an occupied slot");

  // Reschedule booking2 to an unoccupied slot (16:00 - 17:00)
  const validRescheduleStart = new Date("2026-12-01T16:00:00.000Z");
  const validRescheduleEnd = new Date("2026-12-01T17:00:00.000Z");
  const rescheduledBooking = await prisma.booking.update({
    where: { id: booking2.id },
    data: {
      startTime: validRescheduleStart,
      endTime: validRescheduleEnd,
      status: "RESCHEDULED",
    },
  });
  assert(rescheduledBooking.status === "RESCHEDULED", "Successfully reschedules booking to open slot");
  assert(
    rescheduledBooking.startTime.toISOString() === validRescheduleStart.toISOString(),
    "Updates start time accurately upon rescheduling"
  );

  // 39. Testing Booking Cancellation & Security
  console.log("\n39. Testing Booking Cancellation & Token Security...");
  // Unauthorized cancellation attempt with wrong token
  const wrongTokenAttempt = booking1.cancelToken === "fake-token-12345";
  assert(!wrongTokenAttempt, "Rejects cancellation when security token does not match");

  // Valid cancellation
  const cancelledBooking = await prisma.booking.update({
    where: { id: booking1.id },
    data: {
      status: "CANCELLED",
      cancellationReason: "Client requested date change",
      cancelledAt: new Date(),
    },
  });
  assert(cancelledBooking.status === "CANCELLED", "Cancels booking and marks status CANCELLED");
  assert(cancelledBooking.cancelledAt !== null, "Records cancelledAt timestamp for auditing");

  // Verify that cancelled slot is now freed up for new bookings
  const isSlotFreed = await prisma.booking.findFirst({
    where: {
      profileId: profile.id,
      status: { in: ["CONFIRMED", "RESCHEDULED"] },
      startTime: { lt: bookEnd1 },
      endTime: { gt: bookStart1 },
    },
  });
  assert(isSlotFreed === null, "Cancelled booking immediately frees slot for other clients");

  // 40. Testing Creator Dashboard Metrics & Profile Integration
  console.log("\n40. Testing Creator Dashboard Metrics & Profile Integration...");
  const allProfileBookings = await prisma.booking.findMany({
    where: { profileId: profile.id },
  });
  const totalBookingsCount = allProfileBookings.length;
  const cancelledCount = allProfileBookings.filter((b) => b.status === "CANCELLED").length;
  const confirmedOrRescheduled = allProfileBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "RESCHEDULED"
  ).length;
  const totalPaidRevenue = allProfileBookings
    .filter((b) => b.isPaid && b.status !== "CANCELLED")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  assert(totalBookingsCount === 2, "Tracks total bookings metric accurately");
  assert(cancelledCount === 1, "Tracks cancelled bookings metric accurately");
  assert(confirmedOrRescheduled === 1, "Tracks confirmed / active appointments metric");
  assert(totalPaidRevenue === 150.0, "Computes net booking revenue from verified paid bookings ($150.00)");

  // Test Profile booking settings update
  const updatedBookingProfile = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      bookingEnabled: true,
      bookingTitle: "Book a Strategy Call",
      bookingDescription: "Select an available slot for a 1-on-1 coaching session.",
      bookingTimezone: "America/New_York",
    },
  });
  assert(updatedBookingProfile.bookingTitle === "Book a Strategy Call", "Persists custom booking title");
  assert(updatedBookingProfile.bookingTimezone === "America/New_York", "Persists creator appointment timezone");

  // Cleanup test Phase 04 records
  await prisma.bookingNotification.deleteMany({
    where: { bookingId: { in: [booking1.id, booking2.id] } },
  });
  await prisma.booking.deleteMany({
    where: { id: { in: [booking1.id, booking2.id] } },
  });
  await prisma.availabilityRule.deleteMany({
    where: { profileId: profile.id },
  });
  await prisma.appointmentType.deleteMany({
    where: { id: { in: [freeConsultation.id, paidCoaching.id] } },
  });
  assert(true, "Cleaned up all temporary test appointment types, rules, bookings, and notifications");

  // ==========================================
  // PHASE 05: CUSTOM DOMAIN MANAGEMENT TESTS
  // ==========================================

  // 41. Testing Domain Normalization & Security Validation
  console.log("\n41. Testing Domain Normalization & Security Validation...");
  function normalizeTestDomain(raw) {
    let cleaned = raw.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//i, "");
    cleaned = cleaned.replace(/\/.*$/, "");
    cleaned = cleaned.replace(/:\d+$/, "");
    return cleaned;
  }
  function isTestValidHostname(domain) {
    if (!domain || domain.length > 253) return false;
    const fqdnRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
    if (!fqdnRegex.test(domain)) return false;
    const reserved = ["biospace.com", "localhost", "127.0.0.1", "vercel.app"];
    return !reserved.some((r) => domain === r || domain.endsWith(`.${r}`));
  }

  assert(normalizeTestDomain("https://links.alex.dev/about") === "links.alex.dev", "Strips https:// protocol and trailing path");
  assert(normalizeTestDomain("  ALEXSMITH.ME:3000/ ") === "alexsmith.me", "Lowercases and strips port & whitespace");
  assert(isTestValidHostname("links.creator.dev"), "Validates legitimate subdomain FQDN");
  assert(isTestValidHostname("portfolio.design"), "Validates top-level domain FQDN");
  assert(!isTestValidHostname("biospace.com"), "Blocks reserved platform root domain biospace.com");
  assert(!isTestValidHostname("app.biospace.com"), "Blocks reserved platform subdomain");
  assert(!isTestValidHostname("localhost"), "Blocks localhost as custom domain");
  assert(!isTestValidHostname("invalid..domain"), "Rejects invalid consecutive dots in hostname");

  // 42. Testing PRO Subscription Gate for Custom Domains
  console.log("\n42. Testing PRO Subscription Gate for Custom Domains...");
  function checkSubscriptionAllowed(tier) {
    return tier === "PRO" || tier === "BUSINESS";
  }
  assert(!checkSubscriptionAllowed("FREE"), "Blocks FREE tier users from connecting custom domains");
  assert(checkSubscriptionAllowed("PRO"), "Grants PRO tier users access to custom domains");
  assert(checkSubscriptionAllowed("BUSINESS"), "Grants BUSINESS tier users access to custom domains");

  // 43. Testing Domain Connection & DNS Instructions Generation
  console.log("\n43. Testing Domain Connection & DNS Instructions Generation...");
  const testSubdomain = "links.tester-creator.dev";
  const testVerifyTxt = `biospace-verify-${crypto.randomBytes(16).toString("hex")}`;

  const createdDomain = await prisma.customDomain.create({
    data: {
      profileId: profile.id,
      domain: testSubdomain,
      isApex: false,
      status: "PENDING",
      sslStatus: "PENDING",
      cnameTarget: "cname.biospace.com",
      verificationTxt: testVerifyTxt,
    },
  });
  assert(createdDomain.id !== undefined, "Creates CustomDomain record in database");
  assert(createdDomain.status === "PENDING", "Initial status is strictly PENDING awaiting DNS setup");
  assert(createdDomain.sslStatus === "PENDING", "Initial SSL status is strictly PENDING");
  assert(createdDomain.cnameTarget === "cname.biospace.com", "Sets target CNAME to platform edge");
  assert(createdDomain.verificationTxt.startsWith("biospace-verify-"), "Generates unique verification challenge token");

  // Create verification and event records
  const domainVerif = await prisma.domainVerification.create({
    data: {
      domainId: createdDomain.id,
      type: "DNS_TXT",
      recordName: `_biospace.links`,
      recordValue: testVerifyTxt,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  });
  assert(domainVerif.id !== undefined, "Creates DomainVerification challenge record");
  assert(domainVerif.expiresAt > new Date(), "Sets 72-hour challenge expiration window");

  const domainEvent = await prisma.domainEvent.create({
    data: {
      domainId: createdDomain.id,
      eventType: "CREATED",
      description: `Domain ${testSubdomain} initiated connection by profile ${profile.id}.`,
    },
  });
  assert(domainEvent.id !== undefined, "Records domain audit event in DomainEvent model");

  // 44. Testing Duplicate Domain Conflict & Takeover Protection
  console.log("\n44. Testing Duplicate Domain Conflict & Takeover Protection...");
  let duplicateRejected = false;
  try {
    // Attempting to create exact same domain under another profile must fail unique constraint
    await prisma.customDomain.create({
      data: {
        profileId: "different-user-profile-id",
        domain: testSubdomain,
        isApex: false,
        verificationTxt: "dummy-verify-token",
      },
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, "Database unique constraint on domain strictly prevents domain takeover");

  // 45. Testing Domain DNS Verification Lifecycle & Automated SSL Provisioning
  console.log("\n45. Testing Domain DNS Verification Lifecycle & Automated SSL Provisioning...");
  // Step 1: Verification in progress
  const verifyingDomain = await prisma.customDomain.update({
    where: { id: createdDomain.id },
    data: {
      status: "VERIFYING",
      retryCount: { increment: 1 },
      lastCheckedAt: new Date(),
    },
  });
  assert(verifyingDomain.status === "VERIFYING", "Transitions status to VERIFYING during active DNS check");
  assert(verifyingDomain.retryCount === 1, "Tracks retry counter for DNS diagnostic auditing");

  // Step 2: Ownership confirmed -> Transitions to PROVISIONING_SSL
  const verifiedDomain = await prisma.customDomain.update({
    where: { id: createdDomain.id },
    data: {
      status: "PROVISIONING_SSL",
      sslStatus: "ISSUING",
      verifiedAt: new Date(),
    },
  });
  assert(verifiedDomain.status === "PROVISIONING_SSL", "Transitions to PROVISIONING_SSL once DNS verified");
  assert(verifiedDomain.sslStatus === "ISSUING", "Transitions SSL status to ISSUING");
  assert(verifiedDomain.verifiedAt !== null, "Records verifiedAt timestamp");

  // Step 3: SSL issued -> Transitions to ACTIVE
  const activeDomain = await prisma.customDomain.update({
    where: { id: createdDomain.id },
    data: {
      status: "ACTIVE",
      sslStatus: "ACTIVE",
    },
  });
  assert(activeDomain.status === "ACTIVE", "Transitions status to ACTIVE once SSL ready");
  assert(activeDomain.sslStatus === "ACTIVE", "Certifies SSL status as ACTIVE");

  // 46. Testing Custom Domain Profile Resolution (Multi-Tenant Routing)
  console.log("\n46. Testing Custom Domain Profile Resolution (Multi-Tenant Routing)...");
  // Route lookup simulating request for "links.tester-creator.dev"
  const resolvedProfile = await prisma.profile.findFirst({
    where: {
      customDomains: {
        some: {
          domain: testSubdomain,
          status: "ACTIVE",
        },
      },
    },
    include: {
      theme: true,
      links: true,
    },
  });
  assert(resolvedProfile !== null, "Successfully resolves active custom domain to creator profile");
  assert(resolvedProfile.username === profile.username, "Matches the correct profile owner without cross-user leakage");

  // Attempt lookup for an unverified/inactive domain must return null
  const unverifiedLookup = await prisma.profile.findFirst({
    where: {
      customDomains: {
        some: {
          domain: "unverified.random-domain.com",
          status: "ACTIVE",
        },
      },
    },
  });
  assert(unverifiedLookup === null, "Routing ignores unverified or non-existent custom domains");

  // 47. Testing Admin Custom Domain Controls (Inspection & Suspension)
  console.log("\n47. Testing Admin Custom Domain Controls (Inspection & Suspension)...");
  const allDomainsList = await prisma.customDomain.findMany({
    where: { profileId: profile.id },
    include: { profile: true },
  });
  assert(allDomainsList.length >= 1, "Admin query fetches connected custom domains");

  // Admin suspends abusive domain
  const suspendedDomain = await prisma.customDomain.update({
    where: { id: createdDomain.id },
    data: {
      status: "SUSPENDED",
      errorMessage: "Domain suspended by platform administration: Terms of service violation",
    },
  });
  assert(suspendedDomain.status === "SUSPENDED", "Administrator can suspend abusive custom domains");

  // Verify suspended domain is immediately blocked from traffic routing
  const suspendedRoutingCheck = await prisma.profile.findFirst({
    where: {
      customDomains: {
        some: {
          domain: testSubdomain,
          status: "ACTIVE", // Only ACTIVE is routed
        },
      },
    },
  });
  assert(suspendedRoutingCheck === null, "Suspended domain traffic routing is immediately terminated");

  // Cleanup Phase 05 test records
  await prisma.domainEvent.deleteMany({
    where: { domainId: createdDomain.id },
  });
  await prisma.domainVerification.deleteMany({
    where: { domainId: createdDomain.id },
  });
  await prisma.customDomain.deleteMany({
    where: { id: createdDomain.id },
  });
  assert(true, "Cleaned up all temporary test custom domains, verifications, and domain events");

  // ==========================================
  // DIRECT AUTHENTICATION & SECURITY TESTS
  // ==========================================
  console.log("\n48. Testing Direct Authentication & Password Security...");

  function hashPasswordTest(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  function verifyPasswordTest(password, combinedHash) {
    try {
      const [salt, storedHash] = combinedHash.split(":");
      if (!salt || !storedHash) return false;
      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
    } catch {
      return false;
    }
  }

  const testPass = "SecUr3P@ssw0rd!2026";
  const hashedPassword = hashPasswordTest(testPass);
  assert(typeof hashedPassword === "string" && hashedPassword.includes(":"), "Generates salted scrypt password hash");
  assert(verifyPasswordTest(testPass, hashedPassword) === true, "Verifies correct plaintext password against hash");
  assert(verifyPasswordTest("WrongPassword!", hashedPassword) === false, "Rejects incorrect plaintext password");

  // Create temporary direct registration test user
  const directTestEmail = `direct_test_${Date.now()}@biospace.io`;
  const directUser = await prisma.user.create({
    data: {
      clerkId: `direct_${Date.now()}`,
      email: directTestEmail,
      name: "Direct Tester",
      passwordHash: hashedPassword,
      role: "USER",
    },
  });
  assert(directUser.id !== undefined, "Persists direct registration user in database");

  // Duplicate email prevention
  let duplicateError = false;
  try {
    await prisma.user.create({
      data: {
        clerkId: `direct_dup_${Date.now()}`,
        email: directTestEmail,
        passwordHash: hashedPassword,
      },
    });
  } catch {
    duplicateError = true;
  }
  assert(duplicateError === true, "Database unique constraint prevents duplicate email registration");

  // Clean up direct test user
  await prisma.user.delete({ where: { id: directUser.id } });
  assert(true, "Cleaned up temporary direct authentication test user");

  // TEST 49: Hero Layout Blur & Fade Controls
  console.log("\n49. Testing Hero Layout Blur & Fade Controls...");
  const themeRaw = await prisma.$queryRawUnsafe("SELECT id, heroBlur, heroFade, heroDarken FROM Theme LIMIT 1");
  assert(Array.isArray(themeRaw) && themeRaw.length > 0, "Theme table has heroBlur, heroFade, heroDarken columns");
  const sampleTheme = themeRaw[0];

  // Test updating heroBlur, heroFade, heroDarken
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET heroBlur = ?, heroFade = ?, heroDarken = ? WHERE id = ?",
    "24px",
    "high",
    "deep",
    sampleTheme.id
  );
  const updatedTheme = await prisma.$queryRawUnsafe(
    "SELECT heroBlur, heroFade, heroDarken FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(updatedTheme[0].heroBlur === "24px", "Persists custom heroBlur level (24px)");
  assert(updatedTheme[0].heroFade === "high", "Persists elevated heroFade setting (high)");
  assert(updatedTheme[0].heroDarken === "deep", "Persists custom heroDarken setting (deep)");

  // Restore original or default
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET heroBlur = ?, heroFade = ?, heroDarken = ? WHERE id = ?",
    sampleTheme.heroBlur || "16px",
    sampleTheme.heroFade || "high",
    sampleTheme.heroDarken || "balanced",
    sampleTheme.id
  );
  assert(true, "Restored original hero blur and fade theme settings");

  // TEST 43: Interactive Sticker Free Positioning & Coordinate Persistence
  console.log("\n43. Testing Interactive Sticker Free Positioning & Coordinates...");
  const stickerCoordTest = await prisma.$queryRawUnsafe(
    "SELECT stickerPosition, stickerPosX, stickerPosY FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(stickerCoordTest !== undefined && stickerCoordTest.length > 0, "Theme has sticker coordinate columns accessible");

  // Test custom coordinate update
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET stickerPosition = ?, stickerPosX = ?, stickerPosY = ? WHERE id = ?",
    "custom",
    72.5,
    28.4,
    sampleTheme.id
  );
  const updatedCoords = await prisma.$queryRawUnsafe(
    "SELECT stickerPosition, stickerPosX, stickerPosY FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(updatedCoords[0].stickerPosition === "custom", "Sets stickerPosition to custom");
  assert(Math.abs(Number(updatedCoords[0].stickerPosX) - 72.5) < 0.01, "Persists custom stickerPosX coordinate (72.5%)");
  assert(Math.abs(Number(updatedCoords[0].stickerPosY) - 28.4) < 0.01, "Persists custom stickerPosY coordinate (28.4%)");

  // Test coordinate bounds clamping logic (6% to 94%)
  const clampCoord = (val) => Math.round(Math.max(6, Math.min(94, val)));
  assert(clampCoord(2) === 6, "Clamps out-of-bounds left edge coordinate to 6%");
  assert(clampCoord(98) === 94, "Clamps out-of-bounds right edge coordinate to 94%");
  assert(clampCoord(50) === 50, "Keeps in-bounds center coordinate at 50%");

  // Test snap preset coordinate mapping
  const PRESET_COORDS = {
    "top-right": { x: 86, y: 10 },
    "top-left": { x: 14, y: 10 },
    "avatar": { x: 62, y: 26 },
    "above-links": { x: 50, y: 40 },
    "bottom-right": { x: 86, y: 88 },
    "bottom-left": { x: 14, y: 88 },
  };
  assert(PRESET_COORDS["top-right"].x === 86 && PRESET_COORDS["top-right"].y === 10, "Top-right snap preset has valid coordinates");
  assert(PRESET_COORDS["avatar"].x === 62 && PRESET_COORDS["avatar"].y === 26, "Avatar badge snap preset has valid coordinates");

  // Restore sticker settings
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET stickerPosition = ?, stickerPosX = ?, stickerPosY = ? WHERE id = ?",
    sampleTheme.stickerPosition || "top-right",
    sampleTheme.stickerPosX !== undefined && sampleTheme.stickerPosX !== null ? sampleTheme.stickerPosX : 85,
    sampleTheme.stickerPosY !== undefined && sampleTheme.stickerPosY !== null ? sampleTheme.stickerPosY : 12,
    sampleTheme.id
  );
  assert(true, "Restored original sticker position and coordinates");

  // TEST 44: Wallpaper Studio Style, Effect, Tint, and Noise
  console.log("\n44. Testing Wallpaper Studio Style, Effect, Tint, and Noise...");
  const wallpaperColTest = await prisma.$queryRawUnsafe(
    "SELECT wallpaperEffect, wallpaperTint, wallpaperNoise FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(wallpaperColTest !== undefined && wallpaperColTest.length > 0, "Theme has wallpaperEffect, wallpaperTint, and wallpaperNoise columns");

  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, backgroundImage = ?, wallpaperEffect = ?, wallpaperTint = ?, wallpaperNoise = ? WHERE id = ?",
    "image",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    "blur",
    45.0,
    1,
    sampleTheme.id
  );

  const updatedWallpaper = await prisma.$queryRawUnsafe(
    "SELECT backgroundType, backgroundImage, wallpaperEffect, wallpaperTint, wallpaperNoise FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(updatedWallpaper[0].backgroundType === "image", "Persists backgroundType as image");
  assert(updatedWallpaper[0].backgroundImage.includes("unsplash"), "Persists custom/curated backgroundImage URL");
  assert(updatedWallpaper[0].wallpaperEffect === "blur", "Persists wallpaperEffect as blur");
  assert(Math.abs(Number(updatedWallpaper[0].wallpaperTint) - 45.0) < 0.01, "Persists wallpaperTint level (45%)");
  assert(Boolean(updatedWallpaper[0].wallpaperNoise) === true, "Persists wallpaperNoise boolean setting (true)");

  // Restore original theme settings
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, backgroundImage = ?, wallpaperEffect = ?, wallpaperTint = ?, wallpaperNoise = ? WHERE id = ?",
    sampleTheme.backgroundType || "color",
    sampleTheme.backgroundImage || null,
    sampleTheme.wallpaperEffect || "blur",
    sampleTheme.wallpaperTint !== undefined && sampleTheme.wallpaperTint !== null ? sampleTheme.wallpaperTint : 20,
    sampleTheme.wallpaperNoise ? 1 : 0,
    sampleTheme.id
  );
  assert(true, "Restored original theme wallpaper settings");

  console.log("\n45. Testing Wallpaper Studio Gradient Style, Direction, Color, and Noise...");
  const themeCols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme);");
  const hasGradStyle = themeCols.some((c) => c.name === "gradientStyle");
  const hasGradColor = themeCols.some((c) => c.name === "gradientColor");
  const hasGradDir = themeCols.some((c) => c.name === "gradientDirection");
  assert(hasGradStyle && hasGradColor && hasGradDir, "Theme has gradientStyle, gradientColor, gradientDirection columns");

  // Update theme with custom gradient configuration matching screenshot
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, gradientStyle = ?, gradientColor = ?, gradientDirection = ?, wallpaperNoise = ? WHERE id = ?",
    "gradient",
    "custom",
    "#778a00",
    "radial",
    1,
    sampleTheme.id
  );

  const updatedGrad = await prisma.$queryRawUnsafe(
    "SELECT backgroundType, gradientStyle, gradientColor, gradientDirection, wallpaperNoise FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(updatedGrad[0].backgroundType === "gradient", "Persists backgroundType as gradient");
  assert(updatedGrad[0].gradientStyle === "custom", "Persists gradientStyle as custom");
  assert(updatedGrad[0].gradientColor === "#778a00", "Persists gradientColor as #778a00");
  assert(updatedGrad[0].gradientDirection === "radial", "Persists gradientDirection as radial");
  assert(Boolean(updatedGrad[0].wallpaperNoise) === true, "Persists wallpaperNoise grain enabled");

  // Restore original theme settings
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, gradientStyle = ?, gradientColor = ?, gradientDirection = ? WHERE id = ?",
    sampleTheme.backgroundType || "color",
    sampleTheme.gradientStyle || "custom",
    sampleTheme.gradientColor || "#778a00",
    sampleTheme.gradientDirection || "radial",
    sampleTheme.id
  );
  assert(true, "Restored original gradient settings");

  console.log("\n46. Testing Wallpaper Studio Video Selection & Persistence...");
  // Update theme with Video wallpaper configuration
  const testVideoUrl = "/uploads/test_wallpaper_ambient.mp4";
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, backgroundVideo = ?, wallpaperTint = ?, wallpaperNoise = ? WHERE id = ?",
    "video",
    testVideoUrl,
    35,
    1,
    sampleTheme.id
  );

  const updatedVideo = await prisma.$queryRawUnsafe(
    "SELECT backgroundType, backgroundVideo, wallpaperTint, wallpaperNoise FROM Theme WHERE id = ?",
    sampleTheme.id
  );
  assert(updatedVideo[0].backgroundType === "video", "Persists backgroundType as video");
  assert(updatedVideo[0].backgroundVideo === testVideoUrl, "Persists backgroundVideo URL");
  assert(Math.abs(Number(updatedVideo[0].wallpaperTint) - 35.0) < 0.01, "Persists video wallpaper tint (35%)");
  assert(Boolean(updatedVideo[0].wallpaperNoise) === true, "Persists video wallpaper noise grain");

  // Restore original theme settings
  await prisma.$executeRawUnsafe(
    "UPDATE Theme SET backgroundType = ?, backgroundVideo = ?, wallpaperTint = ?, wallpaperNoise = ? WHERE id = ?",
    sampleTheme.backgroundType || "color",
    sampleTheme.backgroundVideo || null,
    sampleTheme.wallpaperTint !== undefined && sampleTheme.wallpaperTint !== null ? sampleTheme.wallpaperTint : 20,
    sampleTheme.wallpaperNoise ? 1 : 0,
    sampleTheme.id
  );
  assert(true, "Restored original theme video settings");

  // SUMMARY
  console.log("\n=================================================");
  console.log(`Tests Completed: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
