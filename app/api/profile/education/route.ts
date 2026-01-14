import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            institution,
            degree,
            fieldOfStudy,
            startYear,
            endYear,
            grade,
            description,
        } = body;

        /* ---------- Validation (order matters) ---------- */

        if (!institution || typeof institution !== "string" || !institution.trim()) {
            return NextResponse.json(
                { error: "Institution is required" },
                { status: 400 }
            );
        }

        if (!startYear) {
            return NextResponse.json(
                { error: "Start year is required" },
                { status: 400 }
            );
        }

        if (!endYear) {
            return NextResponse.json(
                { error: "End year is required" },
                { status: 400 }
            );
        }

        /* ---------- Create Education ---------- */

        const education = await prisma.education.create({
            data: {
                userId: session.user.id,
                institution: institution.trim(),
                degree,
                fieldOfStudy,
                startYear,
                endYear,
                grade,
                description,
            },
        });

        return NextResponse.json(
            { success: true, education },
            { status: 201 }
        );
    } catch (error) {
        console.error("ADD_EDUCATION_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
