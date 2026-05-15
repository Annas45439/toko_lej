import { NextRequest, NextResponse } from "next/server";

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const loginAttempts = new Map<
  string,
  {
    count: number;
    blockedUntil?: number;
  }
>();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkRateLimit(req: NextRequest) {
  const ip = getClientIp(req);
  const entry = loginAttempts.get(ip);
  const now = Date.now();

  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      success: false,
      response: NextResponse.json({ error: "Too many login attempts. Please try again after 15 minutes." }, { status: 429 })
    };
  }

  return { success: true, ip };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  const nextCount = (current?.count ?? 0) + 1;
  const updated = { count: nextCount } as { count: number; blockedUntil?: number };
  if (nextCount >= MAX_FAILED_ATTEMPTS) {
    updated.blockedUntil = now + BLOCK_DURATION_MS;
  }
  loginAttempts.set(ip, updated);
}

export function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}
