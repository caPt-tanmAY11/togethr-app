import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive", // case-insensitive search
                },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                headline: true,
            },
            take: 10, // limit results
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json(
            { error: "Failed to search users" },
            { status: 500 }
        );
    }
}
