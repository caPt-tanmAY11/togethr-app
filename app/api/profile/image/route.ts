import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 }
            );
        }

        // Convert to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `profile-imgs/${userId}`,
                    public_id: "profile",
                    overwrite: true,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });

        // Update user image in DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: uploadResult.secure_url,
            },
        });

        return NextResponse.json({
            success: true,
            imageUrl: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("PROFILE IMAGE PATCH ERROR:", error);
        return NextResponse.json(
            { error: "Failed to update profile image" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                image: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PROFILE IMAGE DELETE ERROR:", error);
        return NextResponse.json(
            { error: "Failed to remove profile image" },
            { status: 500 }
        );
    }
}
