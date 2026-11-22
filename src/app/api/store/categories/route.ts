import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/lib/store/config";

export async function GET() {
  try {
    let dbCategories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });

    // If no categories in DB yet, seed standard categories
    if (dbCategories.length === 0) {
      await Promise.all(
        PRODUCT_CATEGORIES.map((cat) =>
          prisma.productCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
              name: cat.name,
              slug: cat.slug,
            },
          })
        )
      );
      dbCategories = await prisma.productCategory.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ categories: dbCategories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ categories: PRODUCT_CATEGORIES });
  }
}

