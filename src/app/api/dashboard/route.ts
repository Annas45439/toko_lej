import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format, startOfDay, endOfDay, subMonths } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    // Count stats
    const [totalProducts, todayTransactions, totalCustomers] = await Promise.all([
      prisma.tb_products.count(),
      prisma.tb_transactions.count({
        where: {
          date: { gte: startToday, lte: endToday },
          status: "selesai",
        },
      }),
      prisma.tb_customers.count(),
    ]);

    // Low stock: produk dengan stock <= min_stock
    const realLowStock = await prisma.$queryRaw<
      { id: number; name: string; stock: number; min_stock: number }[]
    >`SELECT id, name, stock, min_stock FROM tb_products WHERE stock <= min_stock ORDER BY stock ASC LIMIT 10`;

    // Recent transactions (tanpa relation — manual join)
    const recentTransactionsRaw = await prisma.tb_transactions.findMany({
      take: 5,
      orderBy: { date: "desc" },
    });

    // Ambil customer untuk transaksi yang ada customer_id
    const customerIds = recentTransactionsRaw
      .filter((t) => t.customer_id)
      .map((t) => t.customer_id as number);
    const customers = customerIds.length > 0
      ? await prisma.tb_customers.findMany({ where: { id: { in: customerIds } } })
      : [];
    const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

    const recentTransactions = recentTransactionsRaw.map((t) => ({
      id: t.id,
      invoice_no: t.invoice_no,
      customer_id: t.customer_id,
      user_id: t.user_id,
      total: Number(t.total),
      payment_method: t.payment_method,
      payment_amount: Number(t.payment_amount),
      status: t.status,
      date: t.date.toISOString(),
      customer: t.customer_id ? (customerMap[t.customer_id] ?? null) : null,
    }));

    // Sales chart: 6 bulan terakhir
    const salesChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const agg = await prisma.tb_sales_monthly.aggregate({
        where: { year: y, month: m },
        _sum: { total_revenue: true },
      });
      salesChart.push({
        month: format(d, "MMM yy"),
        total: Number(agg._sum.total_revenue ?? 0),
      });
    }

    // Top 5 produk bulan ini berdasarkan qty
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1;
    const topProductsRaw = await prisma.tb_sales_monthly.findMany({
      where: { year: thisYear, month: thisMonth },
      orderBy: { total_qty: "desc" },
      take: 5,
    });

    // Ambil nama produk untuk top products
    const prodIds = topProductsRaw.map((tp) => tp.product_id);
    const products = prodIds.length > 0
      ? await prisma.tb_products.findMany({ where: { id: { in: prodIds } }, select: { id: true, name: true } })
      : [];
    const prodMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const topProducts = topProductsRaw.map((tp) => ({
      name: prodMap[tp.product_id]?.name ?? `Produk #${tp.product_id}`,
      total_qty: tp.total_qty,
    }));

    return NextResponse.json({
      totalProducts,
      todayTransactions,
      lowStockCount: realLowStock.length,
      totalCustomers,
      salesChart,
      topProducts,
      recentTransactions,
      lowStockProducts: realLowStock,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
