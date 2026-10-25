import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import {
  isUniqueConstraintError,
  isForeignKeyConstraintError,
  isNotFoundError,
} from "@/lib/prisma-errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: t.errors.nameRequired }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id }, data: { name } });
    return NextResponse.json(category);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json(
        { error: t.errors.categoryExists },
        { status: 409 }
      );
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: t.errors.categoryNotFound }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      return NextResponse.json(
        {
          error:
            t.errors.categoryHasItems,
        },
        { status: 409 }
      );
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: t.errors.categoryNotFound }, { status: 404 });
    }
    throw e;
  }
}
