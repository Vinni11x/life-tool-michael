import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { response, user, konfiguriert } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Solange kein Supabase-Projekt hinterlegt ist, bleibt die App offen,
  // damit die Einrichtungshinweise sichtbar sind.
  if (!konfiguriert) return response;

  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/heute", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
