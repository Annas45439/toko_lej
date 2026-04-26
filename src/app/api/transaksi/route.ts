import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { format } from "date-fns";

const transactionSchema = z.object({
  customer_id: z.number().optional().nullable(),
  subtotal: z.number().min(0),
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  total: z.number().min(0),
  points_earned: z.number().min(0).default(0),
  payment_method: z.enum(["tunai", "kartu", "qris"]),
  payment_amount: z.number().min(0),
  change_amount: z.number().default(0),
  items: z.array(
    z.object({
      product_id: z.number().min(1),
      qty: z.number().min(1),
      price: z.number().min(0),
    })
  ).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const data = await prisma.tb_transactions.findMany({
      where: {
        status: status || undefined,
        date: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo + "T23:59:59") : undefined,
        },
      },
      include: {
        customer: true,
        user: { select: { id: true, username: true } },
        tb_transaction_details: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      data.map((t) => ({
        ...t,
        subtotal: Number(t.subtotal),
        discount_amount: Number(t.discount_amount),
        tax_amount: Number(t.tax_amount),
        total: Number(t.total),
        payment_amount: Number(t.payment_amount),
        change_amount: Number(t.change_amount),
        date: t.date.toISOString(),
        tb_transaction_details: t.tb_transaction_details.map((d) => ({
          ...d,
          price: Number(d.price),
          subtotal: Number(d.subtotal),
        })),
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
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { 
      customer_id, subtotal, discount_amount, tax_amount, 
      total, points_earned, payment_method, payment_amount, 
      change_amount, items 
    } = parsed.data;
    const userId = Number((session.user as any).id);

    // Validate stock
    for (const item of items) {
      const product = await prisma.tb_products.findUnique({ where: { id: item.product_id } });
      if (!product || product.stock < item.qty) {
        return NextResponse.json(
          { error: `Stok produk ID ${item.product_id} tidak mencukupi` },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const invoiceNo = `INV${format(now, "yyyyMMddHHmmss")}`;

    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const trx = await tx.tb_transactions.create({
        data: {
          invoice_no: invoiceNo,
          customer_id: customer_id ?? null,
          user_id: userId,
          subtotal,
          discount_amount,
          tax_amount,
          total,
          points_earned,
          payment_method,
          payment_amount,
          change_amount,
          status: "selesai",
          date: now,
          tb_transaction_details: {
            create: items.map((i) => ({
              product_id: i.product_id,
              qty: i.qty,
              price: i.price,
              subtotal: i.price * i.qty,
            })),
          },
        },
        include: {
          customer: true,
          user: { select: { id: true, username: true } },
          tb_transaction_details: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
      });

      // Update customer points
      if (customer_id && points_earned > 0) {
        await tx.tb_customers.update({
          where: { id: customer_id },
          data: { points: { increment: points_earned } },
        });
      }

      // Update stock and sales_monthly
      for (const item of items) {
        await tx.tb_products.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.qty } },
        });

        const yr = now.getFullYear();
        const mo = now.getMonth() + 1;
        const maxPeriod = await tx.tb_sales_monthly.findFirst({
          where: { product_id: item.product_id },
          orderBy: { period_x: "desc" },
        });

        const existing = await tx.tb_sales_monthly.findFirst({
          where: { product_id: item.product_id, year: yr, month: mo },
        });

        if (existing) {
          await tx.tb_sales_monthly.update({
            where: { id: existing.id },
            data: {
              total_qty: { increment: item.qty },
              total_revenue: { increment: item.price * item.qty },
            },
          });
        } else {
          await tx.tb_sales_monthly.create({
            data: {
              product_id: item.product_id,
              year: yr,
              month: mo,
              total_qty: item.qty,
              total_revenue: item.price * item.qty,
              period_x: (maxPeriod?.period_x ?? 0) + 1,
            },
          });
        }
      }

      return trx;
    });

    return NextResponse.json({
      ...transaction,
      subtotal: Number(transaction.subtotal),
      discount_amount: Number(transaction.discount_amount),
      tax_amount: Number(transaction.tax_amount),
      total: Number(transaction.total),
      payment_amount: Number(transaction.payment_amount),
      change_amount: Number(transaction.change_amount),
      date: transaction.date.toISOString(),
      tb_transaction_details: transaction.tb_transaction_details.map((d) => ({
        ...d,
        price: Number(d.price),
        subtotal: Number(d.subtotal),
      })),
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
