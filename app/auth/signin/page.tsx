import { Suspense } from "react";
import SigninClient from "./sign-in-client"
import SigninPageSkeleton from "@/components/skeletons/signin-page-skeleton";

export default function SigninPage() {
  return (
    <Suspense fallback={<SigninPageSkeleton />}>
      <SigninClient />
    </Suspense>
  );
}
