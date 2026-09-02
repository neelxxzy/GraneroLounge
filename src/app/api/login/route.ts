export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  checkCredentials,
  getExpectedSessionToken,
} from "@/lib/auth";

// POST /api/login — checks the submitted username/password against the
// fixed staff credentials in .env and, if they match, sets the session cookie.
export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username = "", password = "" } = body;

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  const token = await getExpectedSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
