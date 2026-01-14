
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type ConnectionType = "FOLLOWERS" | "FOLLOWING";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = req.nextUrl;

        const type = searchParams.get("type") as ConnectionType | null;
        const slug = searchParams.get("slug");

        if (!type || !slug) {
            return NextResponse.json(
                { error: "type and slug are required" },
                { status: 400 }
            );
        }

        if (type !== "FOLLOWERS" && type !== "FOLLOWING") {
            return NextResponse.json(
                { error: "Invalid connection type" },
                { status: 400 }
            );
        }

        // 🔥 Find profile owner
        const profileUser = await prisma.user.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!profileUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const profileUserId = profileUser.id;

        // 👥 FETCH FOLLOWERS
        if (type === "FOLLOWERS") {
            const followers = await prisma.follow.findMany({
                where: {
                    followingId: profileUserId,
                },
                select: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                            headline: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                users: followers.map((f) => f.follower),
            });
        }

        // 👥 FETCH FOLLOWING
        if (type === "FOLLOWING") {
            const following = await prisma.follow.findMany({
                where: {
                    followerId: profileUserId,
                },
                select: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                            headline: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                users: following.map((f) => f.following),
            });
        }
    } catch (error) {
        console.error("GET_CONNECTIONS_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "unauthorized" }, { status: 403 })
        }

        const { userToFollowId } = await req.json();

        if (!userToFollowId) {
            return NextResponse.json(
                { error: "User ID required" },
                { status: 400 }
            );
        }

        if (session.user.id === userToFollowId) {
            return NextResponse.json(
                { error: "You cannot follow yourself" },
                { status: 400 }
            );
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: userToFollowId,
                },
            },
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: "Already following this user" },
                { status: 409 }
            );
        }

        await prisma.follow.create({
            data: {
                followerId: session.user.id,
                followingId: userToFollowId,
            },
        });

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (error) {
        console.error("FOLLOW_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "unauthorized" }, { status: 403 })
        }

        const { userToUnfollowId } = await req.json();

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: userToUnfollowId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("UNFOLLOW_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
