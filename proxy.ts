// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { auth } from "@/lib/auth";

// export async function proxy(req: NextRequest) {
//     const session = await auth.api.getSession({
//         headers: req.headers,
//     });

//     const { pathname } = req.nextUrl;

//     if (!session) {
//         const loginUrl = new URL("/auth/signin", req.url);
//         loginUrl.searchParams.set("returnTo", pathname);
//         loginUrl.searchParams.set("reason", "auth-required");
//         return NextResponse.redirect(loginUrl);
//     }

//     const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
//     const isAdmin = session.user.email === adminEmail;

//     if (pathname.startsWith("/admin")) {
//         if (!isAdmin) {
//             return NextResponse.redirect(new URL("/", req.url));
//         }

//         return NextResponse.next();
//     }

//     if (isAdmin) {
//         if (
//             pathname.startsWith("/onboarding") ||
//             pathname.startsWith("/main")
//         ) {
//             return NextResponse.redirect(
//                 new URL("/admin", req.url)
//             );
//         }

//         return NextResponse.next();
//     }

//     const onboardingCompleted =
//         session.user.onboardingStatus === "COMPLETED";

//     const isOnboardingRoute = pathname.startsWith("/onboarding");

//     if (!onboardingCompleted) {
//         if (isOnboardingRoute) return NextResponse.next();

//         return NextResponse.redirect(
//             new URL("/onboarding/step-1", req.url)
//         );
//     }

//     if (onboardingCompleted && isOnboardingRoute) {
//         return NextResponse.redirect(
//             new URL("/main/hacks-teamup", req.url)
//         );
//     }

//     return NextResponse.next();
// }

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const session = await auth.api.getSession({
        headers: req.headers,
    });

    const isAuthenticated = !!session;
    const isAdmin =
        session?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    /* ---------------------------------
       ROUTE GROUPS
    ----------------------------------*/

    const isPublicViewRoute =
        pathname === "/main/hacks-teamup" ||
        pathname === "/main/projects";

    const isProtectedCreateRoute =
        pathname.startsWith("/main/hacks-teamup/create") ||
        pathname.startsWith("/main/projects/create");

    const isProtectedDynamicRoute =
        pathname.startsWith("/main/hacks-teamup/") ||
        pathname.startsWith("/main/projects/");

    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const isAdminRoute = pathname.startsWith("/admin");

    /* ---------------------------------
       ADMIN GUARD
    ----------------------------------*/
    if (isAdminRoute) {
        if (!isAuthenticated) {
            return redirectToLogin(req);
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    /* ---------------------------------
       PUBLIC VIEW (NO AUTH REQUIRED)
    ----------------------------------*/
    if (isPublicViewRoute && !isAuthenticated) {
        return NextResponse.next();
    }

    /* ---------------------------------
       PROTECTED ROUTES (AUTH REQUIRED)
    ----------------------------------*/
    if (
        isProtectedCreateRoute ||
        (isProtectedDynamicRoute && !isPublicViewRoute)
    ) {
        if (!isAuthenticated) {
            return redirectToLogin(req);
        }
    }

    /* ---------------------------------
       ONBOARDING / EMAIL VERIFICATION
    ----------------------------------*/
    if (isAuthenticated) {
        const emailVerified = session.user.emailVerified;
        const onboardingCompleted =
            session.user.onboardingStatus === "COMPLETED";

        // Force onboarding if email not verified
        if (!emailVerified && !isOnboardingRoute) {
            return NextResponse.redirect(
                new URL("/onboarding", req.url)
            );
        }

        // Force onboarding steps
        if (!onboardingCompleted && !isOnboardingRoute) {
            return NextResponse.redirect(
                new URL("/onboarding/step-1", req.url)
            );
        }

        // Prevent going back to onboarding
        if (onboardingCompleted && isOnboardingRoute) {
            return NextResponse.redirect(
                new URL("/main/hacks-teamup", req.url)
            );
        }
    }

    return NextResponse.next();
}

/* ---------------------------------
   HELPERS
----------------------------------*/
function redirectToLogin(req: NextRequest) {
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("returnTo", req.nextUrl.pathname);
    loginUrl.searchParams.set("reason", "auth-required");
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        "/main/:path*",
        "/onboarding/:path*",
        "/admin/:path*",
    ],
};
