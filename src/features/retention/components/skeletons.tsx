function Bar({ className = "" }: { className?: string }) {
  return <div className={`shimmer animate-pulse bg-muted rounded-md ${className}`} />;
}

export function ChartSkeleton({ height = 256 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Bar className="h-4 w-40 mb-2" />
      <Bar className="h-3 w-24 mb-4" />
      <div className="bg-muted/40 animate-pulse rounded-md" style={{ height }} />
    </div>
  );
}

export function AtRiskAccountsTableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border space-y-2">
        <Bar className="h-4 w-40" />
        <Bar className="h-3 w-64" />
      </div>
      <div className="p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Bar className="h-4 flex-1" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RetentionDashboardSkeleton() {
  return (
    <div className="px-8 py-7 max-w-[1440px] mx-auto">
      <Bar className="h-8 w-64 mb-2" />
      <Bar className="h-4 w-96 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px rounded-xl border border-border bg-border overflow-hidden mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-card animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <div className="grid md:grid-cols-2 gap-6">
            <ChartSkeleton height={200} />
            <ChartSkeleton height={200} />
          </div>
          <AtRiskAccountsTableSkeleton />
        </div>
        <aside className="space-y-6">
          <ChartSkeleton height={300} />
          <ChartSkeleton height={200} />
        </aside>
      </div>
    </div>
  );
}
