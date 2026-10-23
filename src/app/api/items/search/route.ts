import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json([]);

  const items = await prisma.item.findMany({
    where: {
      OR: [{ name: { contains: q } }, { barcode: { contains: q } }],
    },
    select: {
      id: true,
      name: true,
      barcode: true,
      sellingPrice: true,
      quantityInStock: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(items);
}
