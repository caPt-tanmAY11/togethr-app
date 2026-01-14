import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type UploadType = "user" | "hack-team";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: Object.fromEntries(req.headers),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();

        const file = formData.get("file") as File | null;
        const type = formData.get("type") as UploadType;
        const entityId = formData.get("entityId") as string;

        if (!file || !type || !entityId) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        let folder = "";
        let updateDb: () => Promise<void>;

        if (type === "user") {
            if (entityId !== session.user.id) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }

            folder = `users/${entityId}`;
            updateDb = async () => {
                await prisma.user.update({
                    where: { id: entityId },
                    data: { image: uploadResult.secure_url },
                });
            };
        } else if (type === "hack-team") {
            const team = await prisma.hackTeam.findUnique({
                where: { teamId: entityId },
            });

            if (!team || team.createdById !== session.user.id) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }

            folder = `hack-teams/${entityId}`;
            updateDb = async () => {
                await prisma.hackTeam.update({
                    where: { teamId: entityId },
                    data: { image: uploadResult.secure_url },
                });
            };
        } else {
            return NextResponse.json(
                { error: "Invalid upload type" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: "image",
                    overwrite: true,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });

        await updateDb();

        return NextResponse.json({
            success: true,
            imageUrl: uploadResult.secure_url,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Image upload failed" },
            { status: 500 }
        );
    }
}
