import { NextRequest, NextResponse } from "next/server";

/**
 * Vercel Cron's recommended pattern: verify the Authorization header against
 * CRON_SECRET so these routes can't be triggered by an arbitrary public
 * request. Vercel automatically attaches this header when it invokes a
 * scheduled function (see vercel.json), so this only needs to be supplied
 * manually when triggering a route by hand for local testing.
 */
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    throw new Error("CRON_SECRET is not set");
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
