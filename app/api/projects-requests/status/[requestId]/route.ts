import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { sendEmail } from "@/lib/send-email";
import { collaborationAcceptedEmail } from "@/lib/email-templates/project-collaboration-accepted-email";
import { projectRequestRejectedEmail } from "@/lib/email-templates/project-request-rejected-email";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ requestId: string }> }
) {

    const { requestId } = await params;

    try {
        const body = await req.json();
        const { status } = body;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "Invalid status. Must be 'ACCEPTED' or 'REJECTED'." },
                { status: 400 }
            );
        }

        const request = await prisma.projectRequest.findUnique({
            where: { id: requestId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    },
                },
            },
        });

        if (!request) {
            return NextResponse.json(
                { success: false, error: "Request not found" },
                { status: 404 }
            );
        }

        if (!request.id || !request.project) {
            return NextResponse.json(
                { success: false, error: "Request is not linked to a valid team" },
                { status: 400 }
            );
        }

        if (request.status !== "PENDING") {
            return NextResponse.json(
                { success: false, error: "Request has already been processed" },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.projectRequest.update({
            where: { id: requestId },
            data: { status },
        });

        if (status === "ACCEPTED") {
            const existingMember = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        userId: request.senderId,
                        projectId: request.projectId,
                    },
                },
            });

            if (existingMember) {
                return NextResponse.json(
                    { success: false, error: "User is already a team member" },
                    { status: 409 }
                );
            }

            await prisma.projectMember.create({
                data: {
                    userId: request.senderId,
                    projectId: request.projectId,
                    role: "CONTRIBUTOR",
                    name: request.sender.name,
                },
            });

            await prisma.user.update({
                where: { id: request.senderId },
                data: {
                    trustPoints: { increment: 4 }
                }
            })

            await prisma.project.update({
                where: { id: request.projectId },
                data: {
                    currentMembers: { increment: 1 }
                }
            })

            await sendEmail({
                to: request.sender.email,
                subject: "Collaboration request accepted!",
                html: collaborationAcceptedEmail({
                    recipientName: request.sender.name,
                    projectTitle: request.project.title,
                    projectUrl: `${process.env.APP_URL}/main/projects/${request.project.id}`,
                }),
            });
        }

        if (status === "REJECTED") {
            await sendEmail({
                to: request.sender.email,
                subject: "Your project collaboration request was not approved",
                html: projectRequestRejectedEmail({
                    recipientName: request.sender.name,
                    projectName: request.project.title,
                    projectUrl: `${process.env.APP_URL}/main/projects`,
                }),
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: `Request ${status.toLowerCase()} successfully`,
                request: updatedRequest,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("[PRISMA_ERROR]", error.code, error.message);
            return NextResponse.json(
                { success: false, error: "Database query failed" },
                { status: 500 }
            );
        }

        if (error instanceof Error) {
            console.error("[SERVER_ERROR]", error.message);
            return NextResponse.json(
                { success: false, error: "Something went wrong" },
                { status: 500 }
            );
        }

        console.error("[UNKNOWN_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
