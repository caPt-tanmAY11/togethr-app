"use client";

import { authClient } from "@/lib/auth-client";
import LandingHeader from "@/components/landing-header";

export default function LandingHeaderClient() {
  const { data: session, isPending } = authClient.useSession();
  return <LandingHeader session={session} isPending={isPending} />;
}
