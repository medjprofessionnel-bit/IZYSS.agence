import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // /client est accessible sans session (portail client via token)
  const isProtected =
    pathname.startsWith("/agence") ||
    pathname.startsWith("/portail")

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Racine et /login sans session → /login
  if (!session && (pathname === "/" || pathname === "/login")) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Si déjà connecté et sur /login ou /, redirige vers dashboard
  if (session && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/agence/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/agence/:path*",
    "/portail/:path*",
  ],
}
