export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.15)]" />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-center px-6">
           <div className="w-10 h-10 rounded-full bg-cyan-500/20 mb-3" />
           <div className="h-4 w-1/2 bg-cyan-500/20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-64 rounded-2xl bg-gradient-to-b from-cyan-900/10 to-purple-900/10 border border-cyan-500/30 animate-pulse flex items-end justify-around p-6 gap-3 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
      {[60, 80, 45, 90, 70, 55].map((h, i) => (
        <div key={i} className="bg-gradient-to-t from-cyan-500/40 to-purple-500/40 border-t border-x border-cyan-400/50 rounded-t-lg flex-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-white/5" />
      <CardSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <LoadingSkeleton rows={5} />
    </div>
  );
}
