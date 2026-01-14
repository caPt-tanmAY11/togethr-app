"use client";

export default function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-2 animate-pulse space-y-6">
      <div className="mx-auto max-w-7xl px-4 py-10 my-10 font-inter">
        <div className="h-10 w-40 rounded-lg bg-white/10 mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 grid gap-6">
            <div className="relative z-10 w-full rounded-2xl border border-white/10 
              bg-linear-to-br from-white/10 via-white/5 to-transparent 
              backdrop-blur-2xl p-8 sm:p-10 text-white flex flex-col items-center gap-4">
              <div className="rounded-full bg-white/10 h-32 w-32 sm:h-44 sm:w-44" />

              <div className="h-6 w-48 bg-white/10 rounded mt-4" />
              <div className="h-4 w-32 bg-white/10 rounded mt-2" />
              <div className="h-4 w-24 bg-white/10 rounded mt-1" />

              <div className="flex gap-3 mt-2">
                <div className="h-4 w-16 bg-white/10 rounded" />
                <div className="h-4 w-16 bg-white/10 rounded" />
              </div>

              <div className="h-10 w-3/4 rounded-lg bg-white/10 mt-3" />
            </div>

            <div className="relative z-10 w-full rounded-2xl border border-white/10 
              bg-linear-to-br from-white/10 via-white/5 to-transparent 
              backdrop-blur-2xl p-8 sm:p-10 text-white space-y-4">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-4 w-48 bg-white/10 rounded" />

              <div className="h-4 w-32 bg-white/10 rounded mt-2" />
              <div className="h-4 w-48 bg-white/10 rounded" />

              <div className="flex gap-3 mt-3">
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="h-8 w-8 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid gap-6">
            <div className="relative z-10 w-full rounded-2xl border border-white/10 
              bg-linear-to-br from-white/10 via-white/5 to-transparent 
              backdrop-blur-2xl p-8 sm:p-10 text-white space-y-4">
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="h-20 w-full bg-white/10 rounded-md mt-2" />

              <div className="h-5 w-24 bg-white/10 rounded mt-4" />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 rounded-full bg-white/10" />
                ))}
              </div>
            </div>

            <div className="relative z-10 w-full rounded-2xl border border-white/10 
              bg-linear-to-br from-white/10 via-white/5 to-transparent 
              backdrop-blur-2xl p-8 sm:p-10 text-white space-y-4">
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="h-10 w-40 rounded-lg bg-white/10" />

              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border-l border-white/20 pl-3 space-y-1">
                  <div className="h-4 w-32 bg-white/10 rounded mt-2" />
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="h-3 w-28 bg-white/10 rounded mt-1" />
                </div>
              ))}
            </div>

            <div className="relative z-10 w-full rounded-2xl border border-white/10 
              bg-linear-to-br from-white/10 via-white/5 to-transparent 
              backdrop-blur-2xl p-8 sm:p-10 text-white space-y-4">
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="h-10 w-40 rounded-lg bg-white/10" />

              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
