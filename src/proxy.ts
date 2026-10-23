import { NextResponse, type NextRequest } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    nextProxyCookies(request, response),
    sessionOptions
  );

  const isAuthed = Boolean(session.userId);
  const homePath = session.role === "ADMIN" ? "/admin" : "/pos";

  if (pathname === "/") {
    return NextResponse.redirect(new URL(isAuthed ? homePath : "/login", request.url));
  }

  if (pathname.startsWith("/login")) {
    if (isAuthed) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }
    return response;
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/pos", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/pos/:path*", "/invoices/:path*"],
};
