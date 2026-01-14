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
      { error: "Education must be an array" },
      { status: 400 }
    );
  }

  await prisma.education.deleteMany({
    where: { userId: session.user.id },
  });

  if (education.length > 0) {
    await prisma.education.createMany({
      data: education.map((edu) => ({
        userId: session.user.id,
        institution: edu.institution ?? null,
        degree: edu.degree ?? null,
        fieldOfStudy: edu.fieldOfStudy ?? null,
        startYear: edu.startYear ?? null,
        endYear: edu.endYear ?? null,
        grade: edu.grade ?? null,
        description: edu.description ?? null,
      })),
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingStatus: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ success: true });
}
