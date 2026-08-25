export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto w-full" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}

export function ScreenContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>;
}

export function ScreenBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 px-5 py-5 flex flex-col gap-5 ${className}`}>{children}</div>;
}

export function BottomCTA({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 pt-3.5 pb-5 sticky bottom-0"
      style={{ background: "linear-gradient(180deg, transparent, var(--bg) 30%)" }}
    >
      {children}
    </div>
  );
}
