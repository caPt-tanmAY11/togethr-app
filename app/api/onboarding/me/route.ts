import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        /* -------------------- AUTH -------------------- */
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
        /* -------------------- FETCH USER -------------------- */
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                /* onboarding meta */
                onboardingStatus: true,

                /* step 1 */
                headline: true,
                about: true,
                locationCity: true,
                locationCountry: true,

                /* step2 */
                organization: true,
                linkedinUrl: true,
                portfolioUrl: true,
                githubUrl: true,
                XUrl: true,

                /* step3 */
                education: {
                    select: {
                        institution: true,
                        degree: true,
                        fieldOfStudy: true,
                        startYear: true,
                        endYear: true,
                        description: true,
                        grade: true
                    }
                },

                /* step 4 */
                skills: true,
                achievements: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        issuer: true,
                        category: true,
                        proofUrl: true,
                    }
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        /* -------------------- RESPONSE -------------------- */
        return NextResponse.json(user);
    } catch (error) {
        console.error("GET /api/onboarding/me error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
