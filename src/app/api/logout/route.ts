import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

// POST /api/logout — clears the session cookie.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
