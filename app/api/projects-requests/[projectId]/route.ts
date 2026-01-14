import { auth } from "@/lib/auth";
import { projectCollaborationRequestEmail } from "@/lib/email-templates/project-collaboration-request-email";
import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/send-email";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {

        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const senderId = session.user.id;

        const { projectId } = await params;

        const body = await req.json();
        const { message, githubUrl, linkedinUrl } = body;

        if (!message || !githubUrl || !linkedinUrl) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                ownerId: true,
                title: true,
                contactEmail: true,
                owner: {
                    select: {
                        name: true
                    }
                }
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        if (project.id === senderId) {
            return NextResponse.json(
                { error: "You cannot join your own project" },
                { status: 400 }
            );
        }

        const existingRequest = await prisma.projectRequest.findFirst({
            where: {
                senderId,
                projectId: projectId,
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

        const joinRequest = await prisma.projectRequest.create({
            data: {
                type: "JOIN",
                senderId,
                receiverId: project.ownerId,
                projectId: projectId,
                message,
                githubUrl,
                linkedinUrl,
            },
        });

        await sendEmail({
            to: project.contactEmail,
            subject: "New collaboration request for your project",
            html: projectCollaborationRequestEmail({
                ownerName: project.owner.name,
                requesterName: session.user.name,
                projectTitle: project.title,
                projectUrl: `${process.env.APP_URL}/main/projects/${project.id}`,
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

