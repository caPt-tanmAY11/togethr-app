"use client";

import { motion } from "framer-motion";

export default function LandingHeaderSkeleton() {
  return (
    <header className="relative w-full border-b border-white/10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-4 sm:px-6 md:px-12 py-4 flex items-center justify-between"
      >
        <div className="h-7 sm:h-8 w-28 bg-white/10 rounded-lg animate-pulse" />

        <div className="hidden md:flex items-center gap-6">
          <div className="h-5 w-16 bg-white/10 rounded-md animate-pulse" />
          <div className="h-5 w-20 bg-white/10 rounded-md animate-pulse" />
        </div>

        <div className="hidden sm:flex">
          <div className="h-8 w-24 bg-white/10 rounded-2xl animate-pulse" />
        </div>

        <div className="md:hidden h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
      </motion.div>
    </header>
  );
}
