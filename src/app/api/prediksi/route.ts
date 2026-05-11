import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const d of data) {
    sumX += d.x; sumY += d.y;
    sumXY += d.x * d.y; sumX2 += d.x * d.x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R²
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const d of data) {
    const pred = intercept + slope * d.x;
    ssTot += (d.y - yMean) ** 2;
    ssRes += (d.y - pred) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  // MAPE
  let mapeSum = 0, mapeCount = 0;
  for (const d of data) {
    if (d.y !== 0) {
      mapeSum += Math.abs((d.y - (intercept + slope * d.x)) / d.y) * 100;
      mapeCount++;
    }
  }
  const mape = mapeCount > 0 ? mapeSum / mapeCount : 0;

  return { slope, intercept, r2, mape };
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const periods = Math.min(12, Math.max(1, parseInt(searchParams.get("periods") ?? "3")));

    // Ambil semua data monthly sales dikelompokkan per produk
    const allMonthly = await prisma.tb_sales_monthly.groupBy({
      by: ["year", "month"],
      _sum: { total_revenue: true, total_qty: true },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    if (allMonthly.length < 3) {
      return NextResponse.json({
        error: "Data historis kurang. Minimal 3 bulan data untuk prediksi.",
        historical: [],
        predictions: [],
        slope: 0,
        intercept: 0,
        r2: 0,
        mape: 0,
        trend: "stabil",
      }, { status: 200 });
    }

    // Siapkan data regresi (revenue total semua produk per bulan)
    const regrData = allMonthly.map((m, i) => ({
      x: i + 1,
      y: Number(m._sum.total_revenue ?? 0),
      year: m.year,
      month: m.month,
    }));

    const reg = linearRegression(regrData.map((d) => ({ x: d.x, y: d.y })));
    if (!reg) {
      return NextResponse.json({ error: "Tidak dapat menghitung regresi" }, { status: 500 });
    }

    const { slope, intercept, r2, mape } = reg;

    // Historical data untuk chart
    const historical = regrData.map((d) => ({
      month: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
      total: d.y,
    }));

    // Prediksi bulan ke depan
    const lastEntry = regrData[regrData.length - 1];
    const predictions = [];
    let curYear = lastEntry.year;
    let curMonth = lastEntry.month;
    const lastX = lastEntry.x;

    for (let i = 1; i <= periods; i++) {
      curMonth++;
      if (curMonth > 12) { curMonth = 1; curYear++; }
      const x = lastX + i;
      const predicted = Math.max(0, intercept + slope * x);
      const lower = Math.max(0, predicted * 0.85);
      const upper = predicted * 1.15;
      predictions.push({
        month: `${MONTH_NAMES[curMonth - 1]} ${curYear}`,
        predicted: Math.round(predicted),
        lower: Math.round(lower),
        upper: Math.round(upper),
      });
    }

    const trend: "naik" | "turun" | "stabil" =
      slope > 50000 ? "naik" : slope < -50000 ? "turun" : "stabil";

    return NextResponse.json({
      historical,
      predictions,
      slope: Math.round(slope),
      intercept: Math.round(intercept),
      r2: Math.round(r2 * 10000) / 10000,
      mape: Math.round(mape * 100) / 100,
      trend,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
