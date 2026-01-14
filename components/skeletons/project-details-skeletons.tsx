"use client";

export default function ProjectDetailsSkeleton() {
  return (
    <div className="mx-auto my-30 w-[90%] max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 font-inter animate-pulse">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-8">
        {/* Project Card */}
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="flex flex-col items-center gap-5">
            <div className="h-8 w-48 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded mt-3" />
            <div className="h-4 w-[80%] bg-white/10 rounded" />
          </div>
        </div>

        {/* Contributors */}
        <div className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="h-5 w-40 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-white/10 rounded" />
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="h-5 w-32 bg-white/10 rounded mb-3" />
          <div className="h-4 w-40 bg-white/10 rounded mb-4" />

          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-8">
        {/* Details */}
        <div className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-[90%] bg-white/10 rounded" />
            <div className="h-4 w-[70%] bg-white/10 rounded" />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Contact / Actions */}
        <div className="p-7 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
          <div className="h-5 w-28 bg-white/10 rounded mb-4" />

          <div className="space-y-3">
            <div className="h-4 w-52 bg-white/10 rounded" />
            <div className="h-4 w-40 bg-white/10 rounded" />
          </div>

          <div className="h-10 w-full bg-white/10 rounded-lg mt-6" />
        </div>
      </div>
    </div>
  );
}
