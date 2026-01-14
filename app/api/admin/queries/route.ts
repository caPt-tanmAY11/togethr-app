import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

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
