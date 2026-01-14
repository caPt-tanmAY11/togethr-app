export default function HackTeamupCardSkeleton() {
  return (
    <div className="relative py-3 bg-black/40 backdrop-blur-md border border-white/10 min-h-80 w-full rounded-2xl animate-pulse">
      <div className="flex flex-col gap-5 p-6 pb-16">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-4 w-28 bg-white/10 rounded" />
          </div>
        </div>

        <div className="bg-white/5 flex flex-col gap-2 py-4 px-4 rounded-lg border border-white/10">
          <div className="h-4 w-44 bg-white/10 rounded" />
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-4 w-56 bg-white/10 rounded" />
        </div>

        <div className="space-y-3 px-1">
          <div className="h-4 w-28 bg-white/10 rounded" />

          <div className="flex flex-wrap gap-2 mt-2 max-w-64">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 h-9 w-28 bg-white/10 rounded-md" />
    </div>
  );
}
