
import ProjectsClient from "./projects-client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const filters = await searchParams;

  return <ProjectsClient initialFilters={filters} />;
}
