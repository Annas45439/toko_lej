import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { md5 } from "@/lib/md5";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  level: z.enum(["admin", "kasir"]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await prisma.tb_users.findMany({
      orderBy: { username: "asc" },
      select: { id: true, username: true, level: true, password: true },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    if (!parsed.data.password) return NextResponse.json({ error: "Password wajib" }, { status: 400 });

    const existing = await prisma.tb_users.findFirst({ where: { username: parsed.data.username } });
    if (existing) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });

    const data = await prisma.tb_users.create({
      data: {
        username: parsed.data.username,
        password: md5(parsed.data.password),
        level: parsed.data.level,
      },
      select: { id: true, username: true, level: true },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
