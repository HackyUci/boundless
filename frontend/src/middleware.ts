import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  user_id: string;
  email: string;
}

export function middleware(request: NextRequest) {
  const publicPaths = ["/"];
  const authPaths = ["/login", "/register"];
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get("authToken")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      isAuthenticated = Date.now() < decoded.exp * 1000;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isAuthenticated && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (authPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'],
};

