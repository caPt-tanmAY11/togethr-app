"use client";

import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  const { data: session } = authClient.useSession();

  return (
    <div className="relative min-h-screen bg-[#090a15] text-white font-inter overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 h-72 w-72 sm:h-105 sm:w-105 rounded-full blur-[120px] sm:blur-[160px] opacity-70"
          style={{ backgroundColor: "#2b9f9f" }}
        />
        <div
          className="absolute top-24 -right-28 h-64 w-64 sm:h-95 sm:w-95 rounded-full blur-[100px] sm:blur-[140px] opacity-60"
          style={{ backgroundColor: "#19b4b4" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="
            w-full max-w-xl
            backdrop-blur-2xl
            bg-gradient-to-br from-white/10 via-white/5 to-transparent
            border border-white/10
            rounded-3xl
            p-8 sm:p-12
            text-center
          "
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-[#2f8787]"
          >
            404
          </motion.h1>

          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
            Page not found
          </h2>

          <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed">
            The page you’re trying to access doesn’t exist or may have been
            moved. Let’s get you back on track.
          </p>

          <motion.div className="mt-8">
            <Link
              href={session?.user ? "/main/hacks-teamup" : "/auth/signin"}
              className="
    inline-block
    auth-form-glass-btn
    text-white
    rounded-lg
    py-4 px-7
    font-medium
    transition-all duration-300
    cursor-pointer
    active:scale-95
  "
            >
              Go back to main page
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
