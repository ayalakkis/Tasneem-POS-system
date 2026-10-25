import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: t.errors.nameRequired }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json(
        { error: t.errors.categoryExists },
        { status: 409 }
      );
    }
    throw e;
  }
}
