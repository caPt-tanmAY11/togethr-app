import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const rating = searchParams.get("rating");
        const hasUser = searchParams.get("hasUser");

        const where: any = {};

        if (rating) where.rating = parseInt(rating);
        if (hasUser === "true") where.userId = { not: null };
        if (hasUser === "false") where.userId = null;

        const [feedbacks, totalFeedbacks] = await Promise.all([
            prisma.feedback.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            }),

            prisma.feedback.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                feedbacks,
                meta: {
                    total: totalFeedbacks,
                    page,
                    limit,
                    totalPages: Math.ceil(totalFeedbacks / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_FEEDBACK_ERROR", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch feedback",
            },
            { status: 500 }
        );
    }
}
