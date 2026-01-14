import { Suspense } from "react";
import UsersPageClient from "./users-client"

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersPageClient />
    </Suspense>
  );
}
