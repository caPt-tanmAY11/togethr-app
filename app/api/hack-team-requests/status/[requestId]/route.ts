import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { sendEmail } from "@/lib/send-email";
import { teamRequestApprovedEmail } from "@/lib/email-templates/team-request-approved-email";
import { hackTeamRequestRejectedEmail } from "@/lib/email-templates/team-request-rejected-email";

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

        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
                hackTeam: {
                    select: {
                        teamId: true,
                        spotsLeft: true,
                        name: true
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

        if (!request.hackTeamId || !request.hackTeam) {
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

        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status },
        });

        if (status === "ACCEPTED") {
            const existingMember = await prisma.hackTeamMember.findUnique({
                where: {
                    userId_teamId: {
                        userId: request.senderId,
                        teamId: request.hackTeamId,
                    },
                },
            });

            if (existingMember) {
                return NextResponse.json(
                    { success: false, error: "User is already a team member" },
                    { status: 409 }
                );
            }

            if (request.hackTeam.spotsLeft <= 0) {
                return NextResponse.json(
                    { success: false, error: "No spots left in the team" },
                    { status: 400 }
                );
            }

            await prisma.hackTeamMember.create({
                data: {
                    userId: request.senderId,
                    teamId: request.hackTeamId,
                    role: "MEMBER",
                    name: request.sender.name,
                },
            });

            await prisma.user.update({
                where: { id: request.senderId },
                data: {
                    trustPoints: { increment: 3 }
                }
            })

            await prisma.hackTeam.update({
                where: { teamId: request.hackTeamId },
                data: { spotsLeft: { decrement: 1 } },
            });

            await sendEmail({
                to: request.sender.email,
                subject: "Your request has been approved!",
                html: teamRequestApprovedEmail({
                    userName: request.sender.name,
                    teamName: request.hackTeam.name,
                    teamUrl: `${process.env.APP_URL}/main/hacks-teamup/${request.hackTeam.teamId}`,
                }),
            });
        }

        if (status === "REJECTED") {
            await sendEmail({
                to: request.sender.email,
                subject: "Your team request was not approved",
                html: hackTeamRequestRejectedEmail({
                    recipientName: request.sender.name,
                    teamName: request.hackTeam.name,
                    teamUrl: `${process.env.APP_URL}/main/hacks-teamup`,
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
