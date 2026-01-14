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
        headline,
        about,
        locationCity,
        locationCountry,
    } = await req.json();

    if (!headline || !about || !locationCity || !locationCountry) {
        const missingFields = [];

        if (!headline) missingFields.push("headline");
        if (!about) missingFields.push("about");
        if (!locationCity) missingFields.push("locationCity");
        if (!locationCountry) missingFields.push("locationCountry");

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
            headline,
            about,
            locationCity,
            locationCountry,
            onboardingStatus: "IN_PROGRESS",
        },
    });

    return NextResponse.json({ success: true });
}
