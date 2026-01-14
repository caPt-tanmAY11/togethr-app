import { Suspense } from "react";
import FeedbackPageClient from "./feedback-client";

export default function HackTeamsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackPageClient />
    </Suspense>
  );
}
