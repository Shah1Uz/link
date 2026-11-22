const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  const colNames = cols.map((c) => c.name);
  console.log("Current Theme columns:", colNames);

  const newCols = [
    { name: "stickersEnabled", type: "INTEGER DEFAULT 0" },
    { name: "stickerId", type: "TEXT" },
    { name: "stickerUrl", type: "TEXT" },
    { name: "stickerText", type: "TEXT" },
    { name: "stickerPosition", type: "TEXT DEFAULT 'top-right'" },
    { name: "stickerAnimation", type: "TEXT DEFAULT 'float'" },
    { name: "stickerSize", type: "TEXT DEFAULT 'medium'" },
    { name: "stickerRotation", type: "TEXT DEFAULT '-6deg'" },
    { name: "stickerLink", type: "TEXT" },
  ];

  for (const col of newCols) {
    if (!colNames.includes(col.name)) {
      console.log(`Adding column ${col.name} to Theme...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Theme" ADD COLUMN "${col.name}" ${col.type}`);
    }
  }

  const updatedCols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  console.log("Updated Theme columns:", updatedCols.map((c) => c.name));
  await prisma.$disconnect();
}

main().catch(console.error);
