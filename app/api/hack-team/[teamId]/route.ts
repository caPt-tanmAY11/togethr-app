import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ teamId: string }> }) {

    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { teamId } = await params;

        if (!teamId || typeof teamId !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid team ID" },
                { status: 400 }
            )
        }

        const team = await prisma.hackTeam.findUnique({
            where: { teamId },
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
                                slug: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                Request: {
                    select: {
                        id: true,
                        status: true,
                        message: true,
                        type: true,
                        githubURL: true,
                        linkedinURL: true,
                        sender: {
                            select: {
                                name: true,
                                id: true,
                                phone: true,
                                email: true,
                                image: true,
                                trustPoints: true,
                                slug: true
                            }
                        }
                    }
                }
            },
        });

        if (!team) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Hack team not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                team,
            },
            { status: 200 }
        );
    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error:", error.code);

            switch (error.code) {
                case "P2023":
                    return NextResponse.json(
                        { success: false, error: "Invalid team ID format" },
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