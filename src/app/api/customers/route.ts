import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;

  const phone = request.nextUrl.searchParams.get("phone")?.trim();

  const customers = await prisma.customer.findMany({
    where: phone ? { phone: { contains: phone } } : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole("ADMIN", "EMPLOYEE");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const customer = await prisma.customer.create({ data: { name, phone } });
  return NextResponse.json(customer, { status: 201 });
}
