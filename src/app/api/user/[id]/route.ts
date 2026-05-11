import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import md5 from "md5";
import { userUpdateInputSchema } from "@/lib/input-security";
import { z } from "zod";

type UserUpdateInput = z.infer<typeof userUpdateInputSchema>;

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
    const body = await req.json();
    const parsed = userUpdateInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const updateData: Pick<UserUpdateInput, "username" | "level"> & { password?: string } = {
      username: parsed.data.username,
      level: parsed.data.level,
    };
    if (parsed.data.password) updateData.password = md5(parsed.data.password);

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
