import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const userId = session.user.id;

        const profileUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                email: true,

                headline: true,
                about: true,
                organization: true,
                skills: true,

                locationCity: true,
                locationCountry: true,

                linkedinUrl: true,
                githubUrl: true,
                XUrl: true,
                portfolioUrl: true,

                education: {
                    select: {
                        id: true,
                        institution: true,
                        degree: true,
                        fieldOfStudy: true,
                        startYear: true,
                        endYear: true,
                        grade: true,
                        description: true
                    }
                },

                achievements: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        issuer: true,
                        category: true,
                        proofUrl: true
                    }
                }
            },
        });

        if (!profileUser) {
            return NextResponse.json(
                { success: false, error: "Profile not found" },
                { status: 404 }
            );
        }

        const credentialsAccount = await prisma.account.findFirst({
            where: {
                userId,
                providerId: "credential",
            },
            select: { id: true },
        });

        const hasPassword = Boolean(credentialsAccount);

        return NextResponse.json(
            {
                success: true,
                profile: profileUser,
                hasPassword
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PROFILE /me GET error:", error);

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

export async function PATCH(req: Request) {
    try {
        /* ---------- Auth ---------- */
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const userId = session.user.id;

        /* ---------- Body ---------- */
        const body = await req.json();

        const {
            name,
            headline,
            organization,
            locationCity,
            locationCountry,
            about,
            linkedinUrl,
            githubUrl,
            portfolioUrl,
            XUrl,
            skills,
            education,
            achievements,
        } = body;

        /* ---------- Build Update Object (Partial Safe) ---------- */
        const updateData: Prisma.UserUpdateInput = {};

        if (typeof name === "string") updateData.name = name;
        if (headline !== undefined) updateData.headline = headline;
        if (organization !== undefined) updateData.organization = organization;
        if (locationCity !== undefined) updateData.locationCity = locationCity;
        if (locationCountry !== undefined) updateData.locationCountry = locationCountry;
        if (about !== undefined) updateData.about = about;

        if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
        if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
        if (XUrl !== undefined) updateData.XUrl = XUrl;

        if (Array.isArray(skills)) {
            updateData.skills = skills;
        }

        /* ---------- Update User Fields ---------- */
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        /* ---------- Replace Education ---------- */
        if (Array.isArray(education)) {
            // Remove old entries
            await prisma.education.deleteMany({
                where: { userId },
            });

            // Add new ones (ignore empty institutions)
            const cleanedEducation = education.filter(
                (edu) => edu.institution?.trim() !== ""
            );

            if (cleanedEducation.length > 0) {
                await prisma.education.createMany({
                    data: cleanedEducation.map((edu) => ({
                        userId,
                        institution: edu.institution,
                        degree: edu.degree || null,
                        fieldOfStudy: edu.fieldOfStudy || null,
                        grade: edu.grade || null,
                        startYear: edu.startYear || null,
                        endYear: edu.endYear || null,
                        description: edu.description || null,
                    })),
                });
            }
        }

        /* ---------- Replace Achievements ---------- */
        if (Array.isArray(achievements)) {
            // Remove old entries
            await prisma.achievement.deleteMany({
                where: { userId },
            });

            // Add new ones (ignore empty titles)
            const cleanedAchievements = achievements.filter(
                (ach) => ach.title?.trim() !== ""
            );

            if (cleanedAchievements.length > 0) {
                await prisma.achievement.createMany({
                    data: cleanedAchievements.map((a) => ({
                        userId,
                        title: a.title,
                        description: a.description || null,
                        issuer: a.issuer || null,
                        category: a.category || null,
                        proofUrl: a.proofUrl || null,
                    })),
                });
            }
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("PROFILE PATCH error:", error);

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