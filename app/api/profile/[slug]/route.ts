import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const profileUser = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        headline: true,
        about: true,
        locationCity: true,
        locationCountry: true,
        organization: true,
        skills: true,
        email: true,

        linkedinUrl: true,
        githubUrl: true,
        XUrl: true,
        portfolioUrl: true,

        trustPoints: true,

        education: {
          orderBy: { startYear: "desc" },
          select: {
            institution: true,
            degree: true,
            fieldOfStudy: true,
            startYear: true,
            endYear: true,
            grade: true,
            description: true,
          },
        },

        _count: {
          select: {
            followers: true,
            following: true
          }
        },

        achievements: {
          select: {
            title: true,
            description: true,
            issuer: true,
            category: true,
            proofUrl: true,
          },
        },
      },
    });

    if (!profileUser) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    const {
      _count,
      ...rest
    } = profileUser;

    const normalizedProfile = {
      ...rest,
      followersCount: _count.followers,
      followingCount: _count.following,
    };

    const isOwner = session?.user?.id === profileUser.id;

    let isFollowing = false;

    if (!isOwner) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: profileUser.id
          }
        }
      });

      isFollowing = !!follow;
    }

    return NextResponse.json(
      {
        success: true,
        profile: normalizedProfile,
        isOwner,
        isFollowing
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile GET error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, error: "Database query failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    if (existingUser.id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name,
        headline: body.headline,
        about: body.about,
        locationCity: body.locationCity,
        locationCountry: body.locationCountry,
        organization: body.organization,
        skills: body.skills,
        linkedinUrl: body.linkedinUrl,
        githubUrl: body.githubUrl,
        XUrl: body.XUrl,
        portfolioUrl: body.portfolioUrl,
      },
    });

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
