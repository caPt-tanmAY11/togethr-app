import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // const session = await auth.api.getSession({
    //   headers: await headers()
    // });

    // if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const [
      totalUsers,
      verifiedUsers,
      completedOnboardingUsers,
      newUsers,

      totalHackTeams,
      openHackTeams,
      completedHackTeams,
      cancelledHackTeams,
      totalHackTeamMembers,

      totalProjects,
      openProjects,
      completedProjects,
      cancelledProjects,
      totalProjectMembers,

      totalFeedbacks,
      avgFeedbackRating,

      totalContactQueries,

      pendingHackRequests,
      pendingProjectRequests,
    ] = await Promise.all([
      // ---------------- USERS ----------------
      prisma.user.count(),

      prisma.user.count({
        where: { emailVerified: true },
      }),

      prisma.user.count({
        where: { onboardingStatus: "COMPLETED" },
      }),

      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // ---------------- HACK TEAMS ----------------
      prisma.hackTeam.count(),

      prisma.hackTeam.count({
        where: { teamStatus: "OPEN" },
      }),

      prisma.hackTeam.count({
        where: { teamStatus: "COMPLETED" },
      }),

      prisma.hackTeam.count({
        where: { teamStatus: "CANCELLED" },
      }),

      prisma.hackTeamMember.count(),

      // ---------------- PROJECTS ----------------
      prisma.project.count(),

      prisma.project.count({
        where: { projectStatus: "OPEN" },
      }),

      prisma.project.count({
        where: { projectStatus: "COMPLETED" },
      }),

      prisma.project.count({
        where: { projectStatus: "CANCELLED" },
      }),

      prisma.projectMember.count(),

      // ---------------- FEEDBACK ----------------
      prisma.feedback.count(),

      prisma.feedback.aggregate({
        _avg: {
          rating: true,
        },
      }),

      // ---------------- CONTACT QUERIES ----------------
      prisma.contactMessage.count(),

      // ---------------- REQUESTS ----------------
      prisma.request.count({
        where: { status: "PENDING" },
      }),

      prisma.projectRequest.count({
        where: { status: "PENDING" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          onboardingCompleted: completedOnboardingUsers,
          newLast7Days: newUsers,
        },

        hackTeams: {
          total: totalHackTeams,
          open: openHackTeams,
          completed: completedHackTeams,
          cancelled: cancelledHackTeams,
          totalMembers: totalHackTeamMembers,
        },

        projects: {
          total: totalProjects,
          open: openProjects,
          completed: completedProjects,
          cancelled: cancelledProjects,
          totalMembers: totalProjectMembers,
        },

        engagement: {
          feedbacks: totalFeedbacks,
          averageRating: avgFeedbackRating._avg.rating ?? 0,
          contactQueries: totalContactQueries,
        },

        requests: {
          pendingHackTeamRequests: pendingHackRequests,
          pendingProjectRequests: pendingProjectRequests,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN_OVERVIEW_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load admin overview",
      },
      { status: 500 }
    );
  }
}
