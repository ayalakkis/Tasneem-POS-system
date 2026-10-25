import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { t } = await getI18n();
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: t.errors.credentialsRequired },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: t.errors.invalidCredentials },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role;
  await session.save();

  return NextResponse.json({ role: user.role });
}
