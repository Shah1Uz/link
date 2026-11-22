const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  const colNames = cols.map((c) => c.name);
  console.log("Current Theme columns:", colNames);

  const neededCols = [
    { name: "wallpaperEffect", type: "TEXT DEFAULT 'blur'" },
    { name: "wallpaperTint", type: "REAL DEFAULT 20" },
    { name: "wallpaperNoise", type: "INTEGER DEFAULT 0" },
  ];

  for (const col of neededCols) {
    if (!colNames.includes(col.name)) {
      console.log(`Adding ${col.name} to Theme...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Theme" ADD COLUMN "${col.name}" ${col.type}`);
    } else {
      console.log(`Column ${col.name} already exists.`);
    }
  }

  const updatedCols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  console.log("Updated Theme columns:", updatedCols.map((c) => c.name));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
