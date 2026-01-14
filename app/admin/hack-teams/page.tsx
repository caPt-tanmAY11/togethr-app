import { Suspense } from "react";
import HackTeamsPageClient from "./hack-teams-client"

export default function HackTeamsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HackTeamsPageClient />
    </Suspense>
  );
}
