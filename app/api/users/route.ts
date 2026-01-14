import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
        return NextResponse.json(
            { error: "Name and email are required" },
            { status: 400 }
        );
    }

    const user = await prisma.user.create({
        data: {
            name,
            email
        }
    });

    return NextResponse.json(
        { message: "User created successfully!" },
        { status: 201 }
    );
}
