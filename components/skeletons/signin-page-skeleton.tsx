"use client";

import { motion } from "framer-motion";

export default function SigninPageSkeleton() {
  return (
    <div className="relative flex justify-center items-center min-h-screen px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md sm:max-w-lg
        rounded-2xl border border-white/10
        bg-linear-to-br from-white/10 via-white/5 to-transparent
        backdrop-blur-2xl p-8 sm:p-10 text-white"
      >
        <div className="text-center mb-10 space-y-3">
          <div className="mx-auto h-7 sm:h-8 w-40 sm:w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="mx-auto h-4 w-56 rounded-md bg-white/5 animate-pulse" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
            <div className="h-11 w-full rounded-lg bg-white/5 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
            <div className="h-11 w-full rounded-lg bg-white/5 animate-pulse" />
          </div>

          <div className="h-11 w-full rounded-lg bg-white/10 animate-pulse mt-2" />
        </div>

        <div className="flex flex-col gap-4 my-8">
          <div className="h-11 w-full rounded-lg bg-white/5 animate-pulse" />
          <div className="h-11 w-full rounded-lg bg-white/5 animate-pulse" />
        </div>

        <div className="flex justify-center">
          <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
