import { NextRequest, NextResponse } from "next/server";
import { getI18n } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { t } = await getI18n();
  const auth = await requireApiRole("ADMIN");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      salesInvoices: {
        orderBy: { date: "desc" },
        include: { items: true },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: t.errors.customerNotFound }, { status: 404 });
  return NextResponse.json(customer);
}
