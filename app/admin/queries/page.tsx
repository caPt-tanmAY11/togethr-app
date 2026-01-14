
import { Suspense } from "react";
import QueriesPageClient from "./queries-client"

export default function QueriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueriesPageClient />
    </Suspense>
  );
}
