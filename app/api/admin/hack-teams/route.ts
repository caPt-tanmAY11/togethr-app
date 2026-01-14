import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { requireAdmin } from "@/lib/admin-auth"; // optional admin auth

export async function GET(request: Request) {
    try {
        // 🔐 OPTIONAL: Admin authentication
        // await requireAdmin();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Optional search by team name or hackathon name
        const search = searchParams.get("search") || "";

        // Fetch hack teams with pagination and search
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
