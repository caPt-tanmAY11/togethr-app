"use client";

import { motion } from "framer-motion";

export default function OnboardingStep1Skeleton() {
  return (
    <div className="flex justify-center items-center my-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          w-[95vw]
          max-w-md sm:max-w-lg lg:max-w-xl
          backdrop-blur-2xl
          bg-linear-to-br from-white/10 via-white/5 to-transparent
          border border-white/10
          rounded-2xl
          p-6 sm:p-8 md:p-10
          text-white
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* STEP HEADER */}
        <div className="mb-5 sm:mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-teal-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-5 sm:mb-6 space-y-2">
          <div className="h-6 sm:h-7 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-64 bg-white/5 rounded animate-pulse" />
        </div>

        {/* FORM SKELETON */}
        <div className="space-y-4 sm:space-y-5">
          {/* Headline */}
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-md animate-pulse" />
          </div>

          {/* About */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-24 w-full bg-white/5 rounded-lg animate-pulse" />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-md animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse mt-2" />
        </div>
      </motion.div>
    </div>
  );
}
