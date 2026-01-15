import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, rating } = body;

        if (rating && (rating < 1 || rating > 5)) {
            return NextResponse.json(
                { success: false, error: "Invalid rating" },
                { status: 400 }
            );
        }

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const feedback = await prisma.feedback.create({
            data: {
                message: message.trim(),
                rating: rating ?? null,
                userId: session?.user?.id || null,
                name: session?.user?.name || null,
                email: session?.user?.email || null,
            },
        });

        return NextResponse.json({ success: true, feedback });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to submit feedback" },
            { status: 500 }
        );
    }
}
