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

    const {
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        XUrl,
        organization,
    } = await req.json();

    if (!organization) {
        const missingFields = [];

        if (!organization) missingFields.push("organization");

        return NextResponse.json(
            {
                success: false,
                error: "Missing or invalid required fields",
                fields: missingFields,
            },
            { status: 400 }
        );
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            linkedinUrl,
            githubUrl,
            portfolioUrl,
            XUrl,
            organization,
            onboardingStatus: "IN_PROGRESS",
        },
    });

    return NextResponse.json({ success: true });
}
