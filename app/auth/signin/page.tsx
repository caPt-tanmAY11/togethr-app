import { Suspense } from "react";
import SigninClient from "./sign-in-client"

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninClient />
    </Suspense>
  );
}
