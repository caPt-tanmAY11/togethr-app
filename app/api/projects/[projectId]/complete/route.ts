import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
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
        const { projectId } = await params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        if (project.ownerId !== userId) {
            return NextResponse.json(
                { success: false, error: "Only team leader can complete the team" },
                { status: 403 }
            );
        }

        if (project.projectStatus !== "OPEN") {
            return NextResponse.json(
                { success: false, error: "Team is already closed" },
                { status: 400 }
            );
        }

        await prisma.project.update({
            where: { id: projectId },
            data: {
                projectStatus: "COMPLETED",
            },
        });

        if (project.members.length > 0) {
            await prisma.user.updateMany({
                where: {
                    id: {
                        in: project.members.map((m) => m.userId),
                    },
                },
                data: {
                    trustPoints: { increment: 10 },
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Project completed successfully",
        });
    } catch (error) {
        console.error("[COMPLETE_TEAM_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
