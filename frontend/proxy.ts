import { NextResponse, type NextRequest } from "next/server";

// The same names as in backend/app/utils/proxy_secret.py.
const SECRET_HEADER = "x-planit-proxy-secret";
const CLIENT_IP_HEADER = "x-planit-client-ip";

/**
 * Browser calls to /api/* are forwarded to the Flask API by the rewrite in next.config.ts. On the way, this adds
 * the shared secret the hosted API requires (API_PROXY_SECRET) and the visitor's IP, which the API uses for rate
 * limits and the captcha check. Anything a visitor sends in those two headers is dropped first.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(SECRET_HEADER);
  headers.delete(CLIENT_IP_HEADER);

  const secret = process.env.API_PROXY_SECRET;
  if (secret) {
    headers.set(SECRET_HEADER, secret);
    // Vercel sets X-Forwarded-For itself, replacing any value the visitor sent.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) headers.set(CLIENT_IP_HEADER, ip);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/:path*" };
