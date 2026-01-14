import { Suspense } from "react";
import ProjectsPageClient from "./projects-client"

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPageClient />
    </Suspense>
  );
}
