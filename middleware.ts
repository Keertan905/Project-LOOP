import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // 1. Apply Rate Limiting for API routes
    if (path.startsWith("/api/")) {
      const isAuthRoute = path.startsWith("/api/auth") || path.startsWith("/api/signup");
      const isAIRoute = path.startsWith("/api/insights") || path.startsWith("/api/reports");
      
      const limitConfig = isAuthRoute
        ? { limit: 10, windowMs: 60_000 }      // Auth: 10 req / min
        : isAIRoute
        ? { limit: 20, windowMs: 60_000 }      // AI Insights: 20 req / min
        : { limit: 100, windowMs: 60_000 };    // General API: 100 req / min

      const rateLimitKey = `${ip}:${path}`;
      const rlResult = rateLimit(rateLimitKey, limitConfig);

      if (!rlResult.success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": rlResult.limit.toString(),
              "X-RateLimit-Remaining": rlResult.remaining.toString(),
              "X-RateLimit-Reset": Math.ceil(rlResult.resetAt / 1000).toString(),
              "Retry-After": Math.ceil((rlResult.resetAt - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }

    // 2. Restrict team member management to ADMIN role only
    if (path.startsWith("/dashboard/members") && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    const response = NextResponse.next();

    // 3. Inject Security Headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocate=()");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public API routes or login/signup without token check in auth callback
        if (path.startsWith("/api/health") || path.startsWith("/api/signup")) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};