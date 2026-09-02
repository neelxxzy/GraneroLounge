/**
 * Fixed-credential staff login — no user table, no accounts. Everyone on
 * shift shares one username/password (set in .env), and a successful
 * login just drops a signed cookie proving "this browser knows the
 * password", checked by middleware.ts on every request.
 *
 * Uses the Web Crypto API (globalThis.crypto.subtle) so the same code
 * works both in the Node.js API routes and in the Edge middleware.
 */

export const SESSION_COOKIE_NAME = "lounger_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — add it to your .env file.");
  }
  return secret;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The one valid session token, derived from SESSION_SECRET. */
export async function getExpectedSessionToken(): Promise<string> {
  return sha256Hex(`lounger-dashboard-session:${getSecret()}`);
}

/** Checks a set of submitted credentials against ADMIN_USERNAME / ADMIN_PASSWORD in .env. */
export function checkCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  return username === expectedUsername && password === expectedPassword;
}

/** Verifies a cookie value against the expected session token. */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await getExpectedSessionToken();
  return token === expected;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
