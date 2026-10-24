import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  const result = await verifyAdminRequest(req);
  if (!result.authorized) {
    return NextResponse.json(
      { authorized: false, error: result.error || "Not authorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authorized: true,
    user: result.user,
  });
}
