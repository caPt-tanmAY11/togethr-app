"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function CTASectionClient() {
  const { data: session } = authClient.useSession();

  return (
    <section
      id="contact"
      className="pb-16 sm:pb-24 md:pb-32 flex flex-col gap-10 items-center text-center px-4 sm:px-6 md:px-12 my-20"
    >
      <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
        Ready to build togethr?
      </h2>

      <Link
        href={session?.user ? "/main/hacks-teamup" : "/auth/signin"}
        className="auth-form-main-btn text-white rounded-4xl py-4 px-7 font-medium transition-all duration-300
                    cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(68,156,141,0.6)] active:scale-95"
      >
        Get Started Now
      </Link>
    </section>
  );
}
