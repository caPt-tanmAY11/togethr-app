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

        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const teamId = searchParams.get("teamId");

        const where: any = {
            hackTeamId: { not: null },
        };

        if (status) where.status = status;
        if (type) where.type = type;
        if (teamId) where.hackTeamId = teamId;

        const [requests, totalRequests] = await Promise.all([
            prisma.request.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    hackTeam: {
                        select: {
                            teamId: true,
                            name: true,
                            hackName: true,
                            teamStatus: true,
                            createdByName: true,
                        },
                    },
                },
            }),

            prisma.request.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                requests,
                meta: {
                    total: totalRequests,
                    page,
                    limit,
                    totalPages: Math.ceil(totalRequests / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_HACK_TEAM_REQUESTS_ERROR", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch hack team requests",
            },
            { status: 500 }
        );
    }
}
