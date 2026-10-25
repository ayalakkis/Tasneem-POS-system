import { redirect } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { NextResponse } from "next/server";
import { getSession, type SessionData } from "./session";

type Role = SessionData["role"];

export async function requirePageUser(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  return session as SessionData;
}

export async function requirePageRole(...roles: Role[]): Promise<SessionData> {
  const session = await requirePageUser();
  if (!roles.includes(session.role)) redirect("/login");
  return session;
}

export async function requireApiUser() {
  const session = await getSession();
  if (!session.userId) {
    const { t } = await getI18n();
    return {
      error: NextResponse.json({ error: t.errors.notAuthenticated }, { status: 401 }),
    } as const;
  }
  return { session: session as SessionData } as const;
}

export async function requireApiRole(...roles: Role[]) {
  const result = await requireApiUser();
  if ("error" in result) return result;
  if (!roles.includes(result.session.role)) {
    const { t } = await getI18n();
    return {
      error: NextResponse.json({ error: t.errors.forbidden }, { status: 403 }),
    } as const;
  }
  return result;
}
