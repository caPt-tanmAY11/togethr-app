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

    if (!Array.isArray(skills) || skills.length === 0) {
        return NextResponse.json(
            { error: "At least one skill is required" },
            { status: 400 }
        );
    }

    if (!Array.isArray(achievements)) {
        return NextResponse.json(
            { error: "Achievements must be an array" },
            { status: 400 }
        );
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            skills,
            onboardingStatus: "IN_PROGRESS",
        },
    });

    if (achievements.length > 0) {
        await prisma.achievement.deleteMany({
            where: { userId: session.user.id },
        });

        await prisma.achievement.createMany({
            data: achievements.map((a) => ({
                userId: session.user.id,
                title: a.title ?? null,
                description: a.description ?? null,
                issuer: a.issuer ?? null,
                category:
                    a.category && a.category !== ""
                        ? a.category
                        : undefined,
                proofUrl: a.proofUrl ?? null,
            })),
        });
    }

    return NextResponse.json({ success: true });
}
