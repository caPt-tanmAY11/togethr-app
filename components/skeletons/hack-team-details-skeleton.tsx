export default function HackTeamDetailsSkeleton() {
  return (
    <div className="mx-auto my-16 w-full max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 animate-pulse">
      {/* LEFT */}
      <div className="flex flex-col gap-8">
        {/* Team image + name */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[220px] aspect-square rounded-xl bg-white/10" />
            <div className="space-y-2 w-full text-center">
              <div className="h-6 w-2/3 mx-auto bg-white/10 rounded" />
              <div className="h-4 w-1/3 mx-auto bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Overview card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white/5 border border-white/10 space-y-6">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />

          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-5/6 bg-white/10 rounded" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-28 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-8">
        <div className="p-6 sm:p-7 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="h-4 w-60 bg-white/10 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-11/12 bg-white/10 rounded" />
            <div className="h-4 w-10/12 bg-white/10 rounded" />
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="h-12 w-full bg-white/10 rounded-lg" />
          <div className="h-4 w-48 bg-white/10 rounded" />
          <div className="h-4 w-56 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}
