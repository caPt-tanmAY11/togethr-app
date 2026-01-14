import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, email, message } = body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email address" },
                { status: 400 }
            );
        }

        if (!message || typeof message !== "string" || message.trim().length < 10) {
            return NextResponse.json(
                { success: false, error: "Message must be at least 10 characters" },
                { status: 400 }
            );
        }

        await prisma.contactMessage.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim(),
            },
        });

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (error) {
        console.error("CONTACT_API_ERROR:", error);

        return NextResponse.json(
            { success: false, error: "Something went wrong" },
            { status: 500 }
        );
    }
}
