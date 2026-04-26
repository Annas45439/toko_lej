import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  product_id: z.number().min(1),
  supplier_id: z.number().min(1),
  qty: z.number().min(1),
  buy_price: z.number().min(0),
  date: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const products = await prisma.tb_products.findMany({
      select: {
        id: true,
      },
    });
    const productIds = products.map((p) => p.id);

    const data = await prisma.tb_stock_in.findMany({
      where: {
        product_id: {
          in: productId ? [Number(productId)] : productIds,
        },
        date: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      },
      include: {
        product: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        user: { select: { id: true, username: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      data.map((d) => ({
        ...d,
        buy_price: Number(d.buy_price),
        date: d.date.toISOString().split("T")[0],
        total: Number(d.buy_price) * d.qty,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const userId = (session.user as any)?.id ? Number((session.user as any).id) : null;
    if (!userId) {
      return NextResponse.json({ error: "User ID tidak valid dalam sesi" }, { status: 401 });
    }
    const { product_id, supplier_id, qty, buy_price, date } = parsed.data;

    // Create stock in record + update product stock in transaction
    const [stockIn] = await prisma.$transaction([
      prisma.tb_stock_in.create({
        data: {
          product_id,
          supplier_id,
          user_id: userId,
          qty,
          buy_price,
          date: new Date(date),
        },
        include: {
          product: true,
          supplier: true,
          user: { select: { id: true, username: true } },
        },
      }),
      prisma.tb_products.update({
        where: { id: product_id },
        data: { stock: { increment: qty } },
      }),
    ]);

    return NextResponse.json({
      ...stockIn,
      buy_price: Number(stockIn.buy_price),
      date: stockIn.date.toISOString().split("T")[0],
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
