import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { requireAdmin } from "@/lib/admin-auth"; // optional admin auth

export async function GET(request: Request) {
    try {
        // 🔐 OPTIONAL: Admin authentication
        // await requireAdmin();

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Optional filters
        const status = searchParams.get("status"); // PENDING | ACCEPTED | REJECTED | CANCELLED
        const type = searchParams.get("type"); // JOIN | INVITE
        const projectId = searchParams.get("projectId"); // specific project

        const where: any = {};

        if (status) where.status = status;
        if (type) where.type = type;
        if (projectId) where.projectId = projectId;

        const [requests, totalRequests] = await Promise.all([
            prisma.projectRequest.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    project: {
                        select: {
                            id: true,
                            title: true,
                            projectStatus: true,
                            stage: true,
                            isOpen: true,
                            ownerId: true,
                        },
                    },
                },
            }),

            prisma.projectRequest.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                requests,
                meta: {
                    total: totalRequests,
                    page,
                    limit,
                    totalPages: Math.ceil(totalRequests / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_PROJECT_REQUESTS_ERROR", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch project requests",
            },
            { status: 500 }
        );
    }
}
