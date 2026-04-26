import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  buy_price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  min_stock: z.number().min(0).optional(),
  category_id: z.number().min(1).optional(),
  unit_id: z.number().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await prisma.tb_products.findUnique({
      where: { id: Number(params.id) },
      include: {
        category: true,
        unit: true,
      },
    });

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      buy_price: Number(product.buy_price),
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

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const product = await prisma.tb_products.update({
      where: { id: Number(params.id) },
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
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.tb_products.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ message: "Produk dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
