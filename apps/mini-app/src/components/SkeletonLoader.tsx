export default function SkeletonLoader({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.08] rounded-xl ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.08] rounded-xl ${className}`} />;
}

export function ScoreSkeleton() {
  return (
    <div className="flex flex-col items-center py-6 space-y-4">
      <div className="w-44 h-44 rounded-full animate-pulse bg-white/[0.08]" />
      <div className="h-5 w-36 animate-pulse bg-white/[0.08] rounded-xl" />
      <div className="h-4 w-20 animate-pulse bg-white/[0.06] rounded-xl" />
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-white/[0.06] space-y-4">
      <div className="h-4 w-36 animate-pulse bg-white/[0.08] rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-3 w-28 animate-pulse bg-white/[0.08] rounded-md" />
            <div className="h-3 w-20 animate-pulse bg-white/[0.06] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
