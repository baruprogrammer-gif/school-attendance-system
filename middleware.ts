import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthenticated = Boolean(token);
  const isAuthPage = pathname === "/login";

  if (isPublicPath(pathname)) {
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    const callbackTarget = req.nextUrl.clone();
    callbackTarget.searchParams.delete("callbackUrl");
    const callbackUrl = `${callbackTarget.pathname}${callbackTarget.search}`;
    loginUrl.searchParams.set("callbackUrl", callbackUrl.startsWith("/login") ? "/dashboard" : callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
