import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import md5 from "md5";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await prisma.tb_users.findUnique({
      where: { id: Number(params.id) },
      select: { id: true, username: true, level: true },
    });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { username, password, level } = await req.json();

    const updateData: any = { username, level };
    if (password) updateData.password = md5(password);

    const data = await prisma.tb_users.update({
      where: { id: Number(params.id) },
      data: updateData,
      select: { id: true, username: true, level: true },
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const currentUserId = (session.user as any).id;
    if (Number(params.id) === Number(currentUserId)) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }
    await prisma.tb_users.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "User dihapus" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
