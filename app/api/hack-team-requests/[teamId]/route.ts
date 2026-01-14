import { auth } from "@/lib/auth";
import { teamJoinRequestEmail } from "@/lib/email-templates/team-join-request-email";
import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/send-email";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {

        const session = await auth.api.getSession({
            headers: await headers()
        })

        console.log(session);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const senderId = session.user.id;

        const { teamId } = await params;

        const body = await req.json();
        const { message, githubURL, linkedinURL } = body;

        if (!message || !githubURL || !linkedinURL) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const team = await prisma.hackTeam.findUnique({
            where: { teamId },
            select: {
                teamId: true,
                createdById: true,
                teamLeadEmail: true,
                name: true
            },
        });

        if (!team) {
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 }
            );
        }

        if (team.createdById === senderId) {
            return NextResponse.json(
                { error: "You cannot join your own team" },
                { status: 400 }
            );
        }

        const existingRequest = await prisma.request.findFirst({
            where: {
                senderId,
                hackTeamId: teamId,
                type: "JOIN",
                status: "PENDING",
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "Join request already sent" },
                { status: 409 }
            );
        }

        const joinRequest = await prisma.request.create({
            data: {
                type: "JOIN",
                senderId,
                receiverId: team.createdById,
                hackTeamId: teamId,
                message,
                githubURL,
                linkedinURL,
            },
        });

        await sendEmail({
            to: team.teamLeadEmail,
            subject: "New join request for your team",
            html: teamJoinRequestEmail({
                userName: session.user.name,
                teamName: team.name,
                pageUrl: `${process.env.APP_URL}/main/hacks-teamup/${teamId}`,
            }),
        });

        return NextResponse.json(
            { success: true, message: "Join request sent successfully", request: joinRequest },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma error:", error.code, error.message);
            return NextResponse.json(
                { success: false, error: "Database operation failed" },
                { status: 500 }
            );
        }

        if (error instanceof Error) {
            console.error("Server error:", error.message);
            return NextResponse.json(
                { success: false, error: "Something went wrong" },
                { status: 500 }
            );
        }

        console.error("Unknown error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

