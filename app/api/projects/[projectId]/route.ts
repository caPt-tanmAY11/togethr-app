import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    select: {
                        role: true,
                        name: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                slug: true
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                requests: {
                    select: {
                        id: true,
                        status: true,
                        message: true,
                        type: true,
                        githubUrl: true,
                        linkedinUrl: true,
                        sender: {
                            select: {
                                name: true,
                                id: true,
                                phone: true,
                                email: true,
                                image: true,
                                slug: true,
                                trustPoints: true
                            }
                        }
                    }
                }
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                project,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(
                "Prisma error:",
                error.code,
                error.message
            );

            return NextResponse.json(
                {
                    success: false,
                    error: "Database query failed",
                },
                { status: 500 }
            );
        }

        if (error instanceof Error) {
            console.error("Server error:", error.message);

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
