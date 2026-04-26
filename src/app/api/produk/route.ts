import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  price: z.number().min(0),
  buy_price: z.number().min(0),
  stock: z.number().min(0),
  min_stock: z.number().min(0),
  category_id: z.number().min(1),
  unit_id: z.number().min(1),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id");

    const products = await prisma.tb_products.findMany({
      where: {
        name: search ? { contains: search } : undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        buy_price: Number(p.buy_price),
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
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const product = await prisma.tb_products.create({
      data: parsed.data,
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      buy_price: Number(product.buy_price),
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
