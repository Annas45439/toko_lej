import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await prisma.tb_units.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { tb_products: true } } },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    const data = await prisma.tb_units.create({ data: { name } });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
