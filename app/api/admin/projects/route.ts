import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { requireAdmin } from "@/lib/admin-auth"; // optional

export async function GET(request: Request) {
    try {
        // 🔐 OPTIONAL: Admin auth
        // await requireAdmin();

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Optional filters
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status"); // OPEN | COMPLETED | CANCELLED
        const stage = searchParams.get("stage"); // IDEA | BUILDING | MVP | LIVE
        const isOpen = searchParams.get("isOpen"); // true | false

        const where: any = {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { shortDesc: { contains: search, mode: "insensitive" } },
            ],
        };

        if (status) where.projectStatus = status;
        if (stage) where.stage = stage;
        if (isOpen !== null && isOpen !== undefined) {
            where.isOpen = isOpen === "true";
        }

        const [projects, totalProjects] = await Promise.all([
            prisma.project.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    members: {
                        select: {
                            userId: true,
                            name: true,
                            role: true,
                            joinedAt: true,
                        },
                    },
                    _count: {
                        select: {
                            members: true,
                            requests: true,
                        },
                    },
                },
            }),

            prisma.project.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                projects,
                meta: {
                    total: totalProjects,
                    page,
                    limit,
                    totalPages: Math.ceil(totalProjects / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_PROJECTS_ERROR", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch projects",
            },
            { status: 500 }
        );
    }
}
