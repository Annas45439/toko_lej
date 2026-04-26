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
    }) as any;

    return NextResponse.json(
      data.map((t: any) => ({
        ...t,
        subtotal: Number(t.subtotal),
        discount_amount: Number(t.discount_amount),
        tax_amount: Number(t.tax_amount),
        total: Number(t.total),
        payment_amount: Number(t.payment_amount),
        change_amount: Number(t.change_amount),
        date: t.date.toISOString(),
        tb_transaction_details: t.tb_transaction_details.map((d: any) => ({
          ...d,
          price: Number(d.price),
          subtotal: Number(d.subtotal),
        })),
      }))
    );
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
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
    
    // Safety check for userId from session
    const userId = (session.user as any)?.id ? Number((session.user as any).id) : null;
    if (!userId) {
      return NextResponse.json({ error: "User ID tidak valid dalam sesi" }, { status: 401 });
    }

    // Validate customer exists if provided
    if (customer_id) {
      const customer = await prisma.tb_customers.findUnique({
        where: { id: customer_id },
      });
      if (!customer) {
        return NextResponse.json({ error: `Pelanggan ID ${customer_id} tidak ditemukan` }, { status: 404 });
      }
    }

    // Validate all products first
    const productIds = items.map((i: any) => i.product_id);
    const dbProducts = await prisma.tb_products.findMany({
      where: { id: { in: productIds } }
    });

    for (const item of items) {
      const p = dbProducts.find(prod => prod.id === item.product_id);
      if (!p) return NextResponse.json({ error: `Produk ID ${item.product_id} tidak ditemukan` }, { status: 404 });
      if (p.stock < item.qty) return NextResponse.json({ error: `Stok ${p.name} tidak mencukupi (Tersisa: ${p.stock})` }, { status: 400 });
    }

    const now = new Date();
    const invoiceNo = `INV${format(now, "yyyyMMddHHmmss")}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction Header & Details
      const trx = await tx.tb_transactions.create({
        data: {
          invoice_no: invoiceNo,
          customer_id: customer_id || null,
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
            create: items.map((i: any) => ({
              product_id: i.product_id,
              qty: i.qty,
              price: i.price,
              subtotal: i.price * i.qty,
            })),
          },
        } as any,
        include: {
          customer: true,
          user: { select: { id: true, username: true } },
          tb_transaction_details: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
      });

      // 2. Update Customer Points if applicable
      if (customer_id && points_earned > 0) {
        await tx.tb_customers.update({
          where: { id: customer_id },
          data: { points: { increment: points_earned } } as any,
        });
      }

      // 3. Process each item (Stock & Sales Monthly)
      for (const item of items) {
        // Update Stock
        await tx.tb_products.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.qty } },
        });

        // Sales Monthly Record
        const yr = now.getFullYear();
        const mo = now.getMonth() + 1;
        
        const existingSales = await tx.tb_sales_monthly.findFirst({
          where: { product_id: item.product_id, year: yr, month: mo },
        });

        if (existingSales) {
          await tx.tb_sales_monthly.update({
            where: { id: existingSales.id },
            data: {
              total_qty: { increment: item.qty },
              total_revenue: { increment: item.price * item.qty },
            },
          });
        } else {
          // Get max period_x for this product to keep trend consistent
          const lastSale = await tx.tb_sales_monthly.findFirst({
            where: { product_id: item.product_id },
            orderBy: { period_x: "desc" }
          });
          
          await tx.tb_sales_monthly.create({
            data: {
              product_id: item.product_id,
              year: yr,
              month: mo,
              total_qty: item.qty,
              total_revenue: item.price * item.qty,
              period_x: (lastSale?.period_x ?? 0) + 1,
            },
          });
        }
      }

      return trx;
    }) as any;

    // Final response with proper number casting
    return NextResponse.json({
      ...result,
      subtotal: Number(result.subtotal),
      discount_amount: Number(result.discount_amount),
      tax_amount: Number(result.tax_amount),
      total: Number(result.total),
      payment_amount: Number(result.payment_amount),
      change_amount: Number(result.change_amount),
      date: result.date.toISOString(),
      tb_transaction_details: result.tb_transaction_details.map((d: any) => ({
        ...d,
        price: Number(d.price),
        subtotal: Number(d.subtotal),
      })),
    }, { status: 201 });

  } catch (error) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi di server" }, { status: 500 });
  }
}
