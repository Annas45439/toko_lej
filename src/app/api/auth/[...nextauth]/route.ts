import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const rateLimitResult = checkRateLimit(req);
  
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  const response = await handlers.POST(req);

  if (response.status === 401) {
    if (rateLimitResult.ip) {
      recordFailedAttempt(rateLimitResult.ip);
    }
  } else if (response.status >= 200 && response.status < 300) {
    if (rateLimitResult.ip) {
      clearRateLimit(rateLimitResult.ip);
    }
  }

  return response;
}
