import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "./server/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  if (pathname === "/") {
    const response = await authMiddleware(request);
    if (response) return response;
  }

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify")
  ) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/verify"],
};
