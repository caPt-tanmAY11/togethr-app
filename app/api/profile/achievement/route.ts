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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const {
            title,
            issuer,
            category,
            proofUrl,
            description,
        } = body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return NextResponse.json(
                { error: "Achievement title is required" },
                { status: 400 }
            );
        }

        const achievement = await prisma.achievement.create({
            data: {
                userId: session.user.id,
                title,
                issuer,
                category,
                proofUrl,
                description,
            },
        });

        return NextResponse.json(
            { success: true, achievement },
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
