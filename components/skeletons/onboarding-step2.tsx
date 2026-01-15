"use client";

import { motion } from "framer-motion";

export default function OnboardingStep2Skeleton() {
  return (
    <div className="flex justify-center items-center my-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          relative z-10
          w-[95vw] max-w-md sm:max-w-lg lg:max-w-xl
          backdrop-blur-2xl
          bg-linear-to-br from-white/10 via-white/5 to-transparent
          border border-white/10 rounded-2xl
          p-6 sm:p-8 md:p-10
          text-white
        "
      >
        <div className="mb-5 sm:mb-6 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/4 bg-teal-400 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="mb-5 sm:mb-6 space-y-2">
          <div className="h-6 sm:h-7 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-3 sm:h-3 w-64 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="space-y-4 sm:space-y-5">
          {["organization", "linkedinUrl", "githubUrl", "XUrl", "portfolioUrl"].map(
            (_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
              </div>
            )
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-2">
            <div className="h-10 w-full sm:w-1/2 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 w-full sm:w-1/2 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
