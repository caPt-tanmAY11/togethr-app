export default function ProfileSettingsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 my-20 animate-pulse">
      <SkeletonSection>
        <SkeletonTitle />

        <SkeletonInput />
        <SkeletonInput />
        <SkeletonInput />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonInput />
          <SkeletonInput />
        </div>

        <SkeletonTextarea />
      </SkeletonSection>

      <SkeletonSection>
        <SkeletonTitle />
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonInput />
      </SkeletonSection>

      <SkeletonSection>
        <SkeletonTitle />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-white/10" />
          ))}
        </div>
      </SkeletonSection>

      <div className="h-12 w-full rounded-xl bg-white/10" />

      <SkeletonSection>
        <SkeletonTitle />
        <div className="h-4 w-40 bg-white/10 rounded" />
      </SkeletonSection>
    </div>
  );
}


function SkeletonSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6">
      {children}
    </div>
  );
}

function SkeletonTitle() {
  return <div className="h-5 w-32 bg-white/10 rounded" />;
}

function SkeletonInput() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-white/10 rounded" />
      <div className="h-10 w-full bg-white/10 rounded-md" />
    </div>
  );
}

function SkeletonTextarea() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-white/10 rounded" />
      <div className="h-28 w-full bg-white/10 rounded-md" />
    </div>
  );
}
