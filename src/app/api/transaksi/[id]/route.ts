import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const t = await prisma.tb_transactions.findUnique({
      where: { id: Number(params.id) },
      include: {
        customer: true,
        user: { select: { id: true, username: true } },
        tb_transaction_details: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...t,
      total: Number(t.total),
      payment_amount: Number(t.payment_amount),
      change_amount: Number(t.change_amount),
      date: t.date.toISOString(),
      tb_transaction_details: t.tb_transaction_details.map((d) => ({
        ...d,
        price: Number(d.price),
        subtotal: Number(d.subtotal),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status } = await req.json();
    const t = await prisma.tb_transactions.update({
      where: { id: Number(params.id) },
      data: { status },
    });

    return NextResponse.json({ ...t, total: Number(t.total), payment_amount: Number(t.payment_amount) });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
