import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { education } = await req.json();

  if (!Array.isArray(education)) {
    return NextResponse.json(
      { error: "Invalid education data" },
      { status: 400 }
    );
  }

  for (let i = 0; i < education.length; i++) {
    const edu = education[i];

    if (!edu?.institution || !edu.institution.trim()) {
      return NextResponse.json(
        {
          error: "Institution is required",
          field: "institution",
          index: i, // helpful for frontend if needed later
        },
        { status: 400 }
      );
    }
  }

  // ---------------- DELETE OLD EDUCATION ----------------
  await prisma.education.deleteMany({
    where: { userId: session.user.id },
  });

  // ---------------- CREATE NEW EDUCATION ----------------
  if (education.length > 0) {
    await prisma.education.createMany({
      data: education.map((edu) => ({
        userId: session.user.id,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startYear: edu.startYear,
        endYear: edu.endYear,
        grade: edu.grade,
        description: edu.description,
      })),
    });
  }

  // ---------------- UPDATE ONBOARDING STATUS ----------------
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingStatus: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ success: true });
}
