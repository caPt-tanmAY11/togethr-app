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

        const search = searchParams.get("search") || "";

        const [teams, totalTeams] = await Promise.all([
            prisma.hackTeam.findMany({
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { hackName: { contains: search, mode: "insensitive" } },
                    ],
                },
                select: {
                    teamId: true,
                    name: true,
                    origin: true,
                    teamDesc: true,
                    image: true,
                    size: true,
                    spotsLeft: true,
                    teamStatus: true,
                    skillStack: true,
                    hackName: true,
                    hackDesc: true,
                    hackBegins: true,
                    hackEnds: true,
                    hackLink: true,
                    hackLocation: true,
                    hackMode: true,
                    teamLeadEmail: true,
                    teamLeadPhoneNo: true,
                    createdAt: true,
                    createdByName: true,
                    createdById: true,
                    members: {
                        select: {
                            userId: true,
                            name: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.hackTeam.count({
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { hackName: { contains: search, mode: "insensitive" } },
                    ],
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                hackTeams: teams,
                meta: {
                    total: totalTeams,
                    page,
                    limit,
                    totalPages: Math.ceil(totalTeams / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_HACK_TEAMS_ERROR", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch hack teams" },
            { status: 500 }
        );
    }
}
