import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { fill } from "@/i18n/plural";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { hashPassword, USERNAME_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/password";
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
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) {
    return NextResponse.json({ error: t.errors.nameRequired }, { status: 400 });
  }
  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: t.errors.usernameInvalid },
      { status: 400 }
    );
  }
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: fill(t.errors.passwordTooShort, { n: MIN_PASSWORD_LENGTH }) },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id } },
  });
  if (existing) {
    return NextResponse.json({ error: t.errors.usernameTaken }, { status: 409 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        username,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    return NextResponse.json({ id: user.id, name: user.name, username: user.username, role: user.role });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json({ error: t.errors.usernameTaken }, { status: 409 });
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: t.errors.userNotFound }, { status: 404 });
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

  if (id === auth.session.userId) {
    return NextResponse.json({ error: t.errors.cantDeleteSelf }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: t.errors.userNotFound }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: t.errors.lastAdmin },
        { status: 400 }
      );
    }
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      return NextResponse.json(
        { error: t.errors.userHasHistory },
        { status: 409 }
      );
    }
    if (isNotFoundError(e)) {
      return NextResponse.json({ error: t.errors.userNotFound }, { status: 404 });
    }
    throw e;
  }
}
