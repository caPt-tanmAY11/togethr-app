import { auth } from "@/lib/auth";
import { HackMode, Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const userId = session.user.id;
        const uname = session.user.name ?? "Unknown";

        let body;
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json(
                { success: false, error: "Invalid JSON body" },
                { status: 400 }
            )
        }

        const {
            name,
            origin,
            size,
            skillStack,
            hackDetails,
            teamLeadPhone,
            teamLeadEmail,
            teamDesc,
            image,
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, error: "Team name is required", fields: ["name"] },
                { status: 400 }
            );
        }

        if (!origin?.city?.trim()) {
            return NextResponse.json(
                { success: false, error: "Team city is required", fields: ["origin.city"] },
                { status: 400 }
            );
        }

        if (!origin?.country?.trim()) {
            return NextResponse.json(
                { success: false, error: "Team country is required", fields: ["origin.country"] },
                { status: 400 }
            );
        }

        if (!size || typeof size !== "number") {
            return NextResponse.json(
                { success: false, error: "Team size is required", fields: ["size"] },
                { status: 400 }
            );
        }

        if (!Array.isArray(skillStack)) {
            return NextResponse.json(
                { success: false, error: "Skill stack must be an array", fields: ["skillStack"] },
                { status: 400 }
            );
        }

        if (skillStack.length === 0) {
            return NextResponse.json(
                { success: false, error: "At least one skill is required", fields: ["skillStack"] },
                { status: 400 }
            );
        }

        if (!hackDetails?.name?.trim()) {
            return NextResponse.json(
                { success: false, error: "Hackathon name is required", fields: ["hackDetails.name"] },
                { status: 400 }
            );
        }

        if (!hackDetails?.startTime) {
            return NextResponse.json(
                { success: false, error: "Hackathon start time is required", fields: ["hackDetails.startTime"] },
                { status: 400 }
            );
        }

        if (!hackDetails?.endTime) {
            return NextResponse.json(
                { success: false, error: "Hackathon end time is required", fields: ["hackDetails.endTime"] },
                { status: 400 }
            );
        }

        if (!hackDetails?.location?.trim()) {
            return NextResponse.json(
                { success: false, error: "Hackathon location is required", fields: ["hackDetails.location"] },
                { status: 400 }
            );
        }

        if (!hackDetails?.mode?.trim()) {
            return NextResponse.json(
                { success: false, error: "Hackathon mode is required", fields: ["hackDetails.mode"] },
                { status: 400 }
            );
        }

        if (!teamLeadEmail?.trim()) {
            return NextResponse.json(
                { success: false, error: "Team lead email is required", fields: ["teamLeadEmail"] },
                { status: 400 }
            );
        }

        if (!isValidEmail(teamLeadEmail)) {
            return NextResponse.json(
                { success: false, error: "Invalid team lead email format", fields: ["teamLeadEmail"] },
                { status: 400 }
            );
        }

        if (Number.isNaN(size) || size < 1) {
            return NextResponse.json(
                { success: false, error: "Invalid team size", fields: ["size"] },
                { status: 400 }
            );
        }


        const hackTeam = await prisma.hackTeam.create({
            data: {
                name,
                origin: `${origin.city}, ${origin.country}`,
                teamDesc: teamDesc || null,
                image: image || null,
                size: size,
                spotsLeft: size - 1,
                skillStack: skillStack.map(skill => skill.toLowerCase().trim()),

                hackName: hackDetails.name,
                hackDesc: hackDetails.description || null,
                hackBegins: new Date(hackDetails.startTime),
                hackEnds: new Date(hackDetails.endTime),
                hackLink: hackDetails.link || null,
                hackLocation: hackDetails.location,
                hackMode: hackDetails.mode,

                teamLeadPhoneNo: teamLeadPhone,
                teamLeadEmail,

                createdByName: uname,
                createdById: userId,

                members: {
                    create: {
                        userId,
                        role: "TEAM_LEAD",
                        name: uname,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                hackTeam,
            },
            { status: 201 }
        );

    } catch (error: unknown) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error:", error.code);

            switch (error.code) {
                case "P2002":
                    return NextResponse.json(
                        { success: false, error: "Team already exists" },
                        { status: 409 }
                    );
                case "P2003":
                    return NextResponse.json(
                        { success: false, error: "Invalid relation reference" },
                        { status: 400 }
                    );
                default:
                    return NextResponse.json(
                        { success: false, error: "Database error" },
                        { status: 500 }
                    );
            }
        }

        console.error("Server Error:", error);

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        const userId = session?.user.id;

        const { searchParams } = req.nextUrl;

        const modeParam = searchParams.get("mode");

        const mode = Object.values(HackMode).includes(modeParam as HackMode)
            ? (modeParam as HackMode)
            : undefined;

        const scope = searchParams.get("scope") ?? "ALL";

        const teamSize = searchParams.get("teamSize");
        const location = searchParams.get("location");

        const hackName = searchParams.get("hackname");

        const skills = searchParams
            .get("skills")
            ?.split(",")
            .map(s => s.toLowerCase().trim())
            .filter(Boolean);

        const requiresAuthScopes = ["MY_TEAM", "REQUESTED", "JOINED_IN"];

        if (requiresAuthScopes.includes(scope) && !userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Authentication required",
                },
                { status: 401 }
            );
        }


        const whereClause: Prisma.HackTeamWhereInput = {
            ...(mode && { hackMode: mode }),
            ...(teamSize && { size: Number(teamSize) }),

            ...(location && {
                hackLocation: {
                    contains: location,
                    mode: "insensitive"
                }
            }),

            ...(hackName && {
                hackName: {
                    contains: hackName,
                    mode: "insensitive"
                }
            }),

            ...(skills && skills.length > 0 && {
                skillStack: {
                    hasSome: skills
                }
            }),

            teamStatus: "OPEN"
        };

        switch (scope) {
            case "MY_TEAM":
                whereClause.createdById = userId;
                break;

            case "REQUESTED":
                whereClause.Request = {
                    some: {
                        senderId: userId,
                        status: "PENDING"
                    }
                }
                break;

            case "JOINED_IN":
                whereClause.members = {
                    some: {
                        userId
                    }
                }
                break;

            case "ALL":
            default:
                break;
        }

        const teams = await prisma.hackTeam.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                teamId: true,
                name: true,
                origin: true,
                image: true,
                size: true,
                spotsLeft: true,
                skillStack: true,
                hackName: true,
                hackMode: true,
                createdAt: true,
                hackBegins: true,
                hackEnds: true,
                hackLocation: true,
            },
        });

        return NextResponse.json(
            { success: true, teams },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma error:", error.code, error.message);

            return NextResponse.json(
                {
                    success: false,
                    error: "Database request failed",
                },
                { status: 500 }
            );
        }

        if (error instanceof Error) {
            console.error("Unexpected error:", error.message);

            return NextResponse.json(
                {
                    success: false,
                    error: "Something went wrong",
                },
                { status: 500 }
            );
        }

        console.error("Unknown error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

