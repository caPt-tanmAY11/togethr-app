"use client";

export default function ProjectCardSkeleton() {
  return (
    <div
      className="
        relative
        py-3
        w-full
        max-w-sm
        min-h-[520px]
        rounded-2xl
        bg-black/40
        backdrop-blur-md
        border border-white/10
        animate-pulse
      "
    >
      <div className="p-6 flex flex-col gap-4">
        <div className="h-6 w-3/4 bg-white/10 rounded" />

        <div className="h-4 w-24 bg-white/10 rounded" />

        <div className="space-y-2 mt-3">
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-[90%] bg-white/10 rounded" />
          <div className="h-3 w-[70%] bg-white/10 rounded" />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-20 bg-white/10 rounded-lg" />
          ))}
        </div>

        <div className="mt-auto space-y-3">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-10 w-full bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
