import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    phone: true,
                    headline: true,
                    locationCity: true,
                    locationCountry: true,
                    skills: true,
                    trustPoints: true,
                    onboardingStatus: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                users,
                meta: {
                    total: totalUsers,
                    page,
                    limit,
                    totalPages: Math.ceil(totalUsers / limit),
                },
            },
        });
    } catch (error) {
        console.error("ADMIN_USERS_ERROR", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
