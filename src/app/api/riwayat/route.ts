import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { invoice_no: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.tb_transactions.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          user: { select: { username: true } },
          _count: { select: { tb_transaction_details: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.tb_transactions.count({ where }),
    ]);

    const serialized = data.map((t) => ({
      ...t,
      total: Number(t.total),
      payment_amount: Number(t.payment_amount),
      date: t.date.toISOString(),
      created_at: t.created_at?.toISOString() ?? null,
    }));

    return NextResponse.json({ data: serialized, total, page, limit });
  } catch (error) {
    console.error("[RIWAYAT_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil data riwayat" }, { status: 500 });
  }
}
