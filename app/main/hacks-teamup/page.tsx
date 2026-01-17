
import HackTeamUpClient from "./hack-teams-client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const filters = await searchParams;

  return <HackTeamUpClient initialFilters={filters} />;
}
