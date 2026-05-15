import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { userCreateInputSchema } from "@/lib/input-security";

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
  } catch {
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
    const parsed = userCreateInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const existing = await prisma.tb_users.findFirst({ where: { username: parsed.data.username } });
    if (existing) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });

    const data = await prisma.tb_users.create({
      data: {
        username: parsed.data.username,
        password: await hashPassword(parsed.data.password),
        level: parsed.data.level,
      },
      select: { id: true, username: true, level: true },
    });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
