import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skills, achievements } = await req.json();

    if (!Array.isArray(skills)) {
        return NextResponse.json(
            { error: "Skills must be an array" },
            { status: 400 }
        );
    }

    if (!Array.isArray(achievements)) {
        return NextResponse.json(
            { error: "Achievements must be an array" },
            { status: 400 }
        );
    }

    /* ---------- VALIDATE ACHIEVEMENTS ---------- */
    const missingTitle = achievements.find((a) => !a.title?.trim());
    if (missingTitle) {
        return NextResponse.json(
            { error: "Achievement title is required", field: "title" },
            { status: 400 }
        );
    }

    /* -------------------- UPDATE SKILLS -------------------- */
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            skills,
            onboardingStatus: "IN_PROGRESS",
        },
    });

    /* -------------------- REPLACE ACHIEVEMENTS -------------------- */
    if (achievements.length > 0) {
        // Delete existing achievements first
        await prisma.achievement.deleteMany({
            where: { userId: session.user.id },
        });

        // Insert new achievements
        await prisma.achievement.createMany({
            data: achievements.map((a) => ({
                userId: session.user.id,
                title: a.title,
                description: a.description,
                issuer: a.issuer,
                category: a.category,
                proofUrl: a.proofUrl,
            })),
        });
    }

    return NextResponse.json({ success: true });
}
