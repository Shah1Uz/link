const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  const colNames = cols.map((c) => c.name);
  console.log("Existing columns:", colNames);

  const needed = [
    { name: "gradientStyle", type: "TEXT DEFAULT 'custom'" },
    { name: "gradientColor", type: "TEXT DEFAULT '#778a00'" },
    { name: "gradientDirection", type: "TEXT DEFAULT 'radial'" },
  ];

  for (const col of needed) {
    if (!colNames.includes(col.name)) {
      console.log(`Adding ${col.name} to Theme...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Theme" ADD COLUMN "${col.name}" ${col.type}`);
    } else {
      console.log(`${col.name} already exists.`);
    }
  }

  const updated = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  console.log("Updated columns:", updated.map((c) => c.name));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
