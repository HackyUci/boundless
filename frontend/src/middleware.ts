import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  uid: string;
  email: string;
}

export function middleware(request: NextRequest) {
  const publicPaths = ["/", "/login", "/register"];
  const pathname = request.nextUrl.pathname;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (Date.now() >= decoded.exp * 1000) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next(); 
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
