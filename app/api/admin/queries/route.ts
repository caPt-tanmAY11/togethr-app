import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
// import { requireAdmin } from "@/lib/admin-auth"; // optional admin auth

export async function GET(request: Request) {
    try {
        // 🔐 OPTIONAL: Admin authentication
        // await requireAdmin();

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Optional search
        const search = searchParams.get("search") || "";

        const where: Prisma.ContactMessageWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { message: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }
            : {};

        const [queries, totalQueries] = await Promise.all([
            prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),

            prisma.contactMessage.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                queries,
                meta: {
                    total: totalQueries,
                    page,
                    limit,
                    totalPages: Math.ceil(totalQueries / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_QUERIES_ERROR", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch contact queries",
            },
            { status: 500 }
        );
    }
}
