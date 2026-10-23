import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { hashPassword, USERNAME_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export async function GET() {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-30 characters: letters, numbers, dots, underscores, or hyphens" },
      { status: 400 }
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, username, passwordHash, role: "EMPLOYEE" },
    });
    return NextResponse.json(
      { id: user.id, name: user.name, username: user.username, role: user.role },
      { status: 201 }
    );
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    throw e;
  }
}
