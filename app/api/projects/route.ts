import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CommitmentLevel, Prisma, ProjectStage } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isValidEmail } from "@/lib/utils";


export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
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
            );
        }

        const {
            title,
            shortDesc,
            detailedDesc,
            extraNote,
            stage,
            skillStack = [],
            tags = [],
            commitment,
            githubURL,
            contactPhone,
            contactEmail,
            ownerLinkedInURL,
            ownerId,
            ownerName,
        } = body;

        const missingFields: string[] = [];

        if (!title) missingFields.push("title");
        if (!shortDesc) missingFields.push("shortDesc");
        if (!detailedDesc) missingFields.push("detailedDesc");
        if (!stage) missingFields.push("stage");
        if (!commitment) missingFields.push("commitment");

        if (!contactEmail) missingFields.push("contactEmail");

        if (!ownerLinkedInURL) missingFields.push("ownerLinkedInURL");
        if (!ownerId) missingFields.push("ownerId");
        if (!ownerName) missingFields.push("ownerName");

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields",
                    fields: missingFields,
                },
                { status: 400 }
            );
        }

        if (!isValidEmail(contactEmail)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid contact email format",
                    fields: ["contactEmail"],
                },
                { status: 400 }
            );
        }

        if (!Array.isArray(tags) || tags.length === 0) {
            return NextResponse.json(
                { success: false, error: "At least one project tag is required", fields: ["tags"] },
                { status: 400 }
            );
        }

        if (!Array.isArray(skillStack) || skillStack.length === 0) {
            return NextResponse.json(
                { success: false, error: "At least one skill is required", fields: ["skillStack"] },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                title,
                shortDesc,
                detailedDesc,
                extraNote: extraNote || null,
                stage,
                skillStack,
                tags,
                commitment,
                githubURL: githubURL || null,
                contactPhone: contactPhone || null,
                contactEmail,
                ownerLinkedInURL,
                ownerId: userId,
                currentMembers: 1,

                members: {
                    create: {
                        userId,
                        role: "OWNER",
                        name: uname,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return NextResponse.json(
            { success: true, project },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE_PROJECT_ERROR:", error);

        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
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

        const scope = searchParams.get("scope") ?? "ALL";
        const projectCommitmentModeParam = searchParams.get("commitment");
        const projectStageParam = searchParams.get("stage");
        const skills = searchParams
            .get("skills")
            ?.split(",")
            .map(skill => skill.toLowerCase().trim());

        const projectCommitment = Object.values(CommitmentLevel).includes(projectCommitmentModeParam as CommitmentLevel)
            ? (projectCommitmentModeParam as CommitmentLevel)
            : undefined;

        const projectStage = Object.values(ProjectStage).includes(projectStageParam as ProjectStage)
            ? (projectStageParam as ProjectStage)
            : undefined;

        console.log({
            scope,
            projectCommitment,
            projectStage,
            skills
        });

        const whereClause: Prisma.ProjectWhereInput = {
            ...(projectCommitment && { commitment: projectCommitment }),
            ...(projectStage && { stage: projectStage }),

            ...(skills && skills.length > 0 && {
                skillStack: {
                    hasSome: skills
                }
            }),

            projectStatus: "OPEN"
        };

        switch (scope) {
            case "MY_PROJECT":
                whereClause.ownerId = userId;
                break;

            case "REQUESTED":
                whereClause.requests = {
                    some: {
                        senderId: userId,
                        status: "PENDING"
                    }
                }
                break;

            case "CONTRIBUTING_IN":
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

        const projects = await prisma.project.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                shortDesc: true,
                stage: true,
                skillStack: true,
                tags: true,
                commitment: true,
                currentMembers: true
            },
        });

        return NextResponse.json(
            { success: true, projects },
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

