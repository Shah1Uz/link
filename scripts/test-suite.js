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
  const profile = await prisma.profile.findUnique({
    where: { username: "shahuztech" },
    include: {
      user: true,
      theme: true,
      links: true,
      collections: true,
      products: true,
    },
  });
  assert(profile !== null, "Sample creator profile 'shahuztech' exists");
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
  const products = await prisma.product.findMany({ where: { profileId: profile.id } });
  assert(products.length >= 2, `Profile has ${products.length} digital products seeded`);

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
