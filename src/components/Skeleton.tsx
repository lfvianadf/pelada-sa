export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "var(--bg2)" }}
    />
  );
}

export function ScreenSkeleton() {
  return (
    <div className="flex flex-col h-dvh max-w-[480px] mx-auto w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex-1 px-5 py-5 flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="px-2 pt-2 pb-4 flex gap-1" style={{ borderTop: "1px solid var(--hairline)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] flex-1" />
        ))}
      </div>
    </div>
  );
}
