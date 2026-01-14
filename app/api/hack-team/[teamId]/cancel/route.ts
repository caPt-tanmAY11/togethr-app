import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
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

        const userId = session.user.id;
        const { teamId } = await params;

        if (!teamId || typeof teamId !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid team ID" },
                { status: 400 }
            );
        }

        const team = await prisma.hackTeam.findUnique({
            where: { teamId },
        });

        if (!team) {
            return NextResponse.json(
                { success: false, error: "Team not found" },
                { status: 404 }
            );
        }

        if (team.createdById !== userId) {
            return NextResponse.json(
                { success: false, error: "Only team leader can cancel the team" },
                { status: 403 }
            );
        }

        if (team.teamStatus !== "OPEN") {
            return NextResponse.json(
                { success: false, error: "Team is already closed" },
                { status: 400 }
            );
        }

        await prisma.hackTeam.update({
            where: { teamId },
            data: {
                teamStatus: "CANCELLED",
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Team cancelled successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error:", error.code);

            return NextResponse.json(
                { success: false, error: "Database error" },
                { status: 500 }
            );
        }

        console.error("[CANCEL_TEAM_ERROR]", error);

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}