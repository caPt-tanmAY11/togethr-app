"use client";

import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSectionClient() {
  const { data: session } = authClient.useSession();

  return (
    <section className="flex flex-col justify-center items-center text-center mt-24 sm:mt-32 md:mt-44 px-4 sm:px-6 md:px-12">
      <motion.div
        className="flex flex-col items-center text-[white] sm:items-start text-4xl sm:text-5xl md:text-7xl font-bold leading-snug sm:leading-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>Create Hack Teams.</h1>
        <h1>Collaborate on Projects.</h1>
        <h1>
          Build{" "}
          <span className="text-[#ffffff]">
            togethr<span className="text-[#39aaaa]">.</span>
          </span>
        </h1>
      </motion.div>

      <motion.div className="my-8 sm:my-10 flex flex-col sm:flex-row gap-4 sm:gap-10">
        <Link
          href={session?.user ? "/main/hacks-teamup" : "/auth/signin"}
          className="auth-form-main-btn text-white rounded-lg py-4 px-7 font-medium transition-all duration-300
                    cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(68,156,141,0.6)] active:scale-95"
        >
          Explore hack-teams
        </Link>
        <Link
          href={session?.user ? "/main/projects" : "/auth/signin"}
          className="auth-form-glass-btn text-white rounded-lg py-4 px-7 font-medium transition-all duration-300
                    cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(68,156,141,0.6)] active:scale-95"
        >
          View projects
        </Link>
      </motion.div>

      <motion.p
        className="max-w-3xl mt-4 sm:mt-6 text-white/70 text-base sm:text-lg md:text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A platform where students, developers, and builders form trusted
        hackathon teams and collaborate on real-world projects.
      </motion.p>
    </section>
  );
}
