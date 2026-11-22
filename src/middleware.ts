import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function isLiveClerkSecretConfigured(): boolean {
  const secret = process.env.CLERK_SECRET_KEY || "";
  return (
    secret.length > 25 &&
    !secret.includes("demo_secret_key") &&
    !secret.includes("…") &&
    !secret.includes("...") &&
    (secret.startsWith("sk_test_") || secret.startsWith("sk_live_"))
  );
}

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/admin(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: any) {
  // Direct authentication shortcuts
  if (req.nextUrl.pathname === "/logout" || req.nextUrl.pathname === "/sign-out") {
    return NextResponse.redirect(new URL("/api/auth/logout", req.url));
  }
  if (req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const atHandle = req.nextUrl.pathname.match(/^\/(?:@|%40)([^/]+)\/?$/i);
  if (atHandle) {
    const url = req.nextUrl.clone();
    url.pathname = `/${decodeURIComponent(atHandle[1]).replace(/^@/, "")}`;
    return NextResponse.redirect(url);
  }

  const host = req.headers.get("host")?.toLowerCase() || "";
  const hostname = host.split(":")[0];

  const isPlatformHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app") ||
    hostname === "biospace.com" ||
    hostname === "www.biospace.com" ||
    hostname.endsWith(".biospace.com");

  // Multi-tenant Custom Domain Routing (Phase 05)
  if (
    !isPlatformHost &&
    !req.nextUrl.pathname.startsWith("/api") &&
    !req.nextUrl.pathname.startsWith("/_next") &&
    !req.nextUrl.pathname.startsWith("/trpc")
  ) {
    if (req.nextUrl.pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${hostname}`;
      return NextResponse.rewrite(url);
    }
  }

  // If live Clerk secret key is configured, let official clerkHandler protect routes
  if (isLiveClerkSecretConfigured()) {
    return clerkHandler(req, event);
  }

  // When live secret key is not configured, enforce mandatory authentication via session cookie
  if (isProtectedRoute(req)) {
    const hasClerkSession = Boolean(req.cookies.get("__session")?.value);
    const hasDirectSession = Boolean(req.cookies.get("biospace_session")?.value);

    if (!hasClerkSession && !hasDirectSession) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
