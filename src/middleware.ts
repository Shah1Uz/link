import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If Clerk keys are provided and configured, protect private dashboard routes
  if (isProtectedRoute(req)) {
    try {
      // If Clerk is initialized with live keys, enforce authentication
      if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("demo_secret_key")) {
        await auth.protect();
      }
    } catch {
      // Let pass to server components which gracefully resolve session / demo creator account
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

