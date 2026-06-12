function Bar({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

export function AccountDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <Bar className="h-4 w-40" />

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-wrap items-start gap-6">
        <div className="shimmer size-32 rounded-full" />
        <div className="flex-1 min-w-[260px] space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Bar className="h-6 w-40" />
            <Bar className="h-5 w-20 rounded-full" />
            <Bar className="h-4 w-48" />
          </div>
          <Bar className="h-14 w-full" />
        </div>
        <div className="flex flex-col gap-2 min-w-[180px]">
          <Bar className="h-10 w-full" />
          <Bar className="h-10 w-full" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <Bar className="h-3 w-20" />
                <Bar className="h-7 w-16" />
                <Bar className="h-3 w-28" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Bar className="h-4 w-40" />
                <Bar className="h-3 w-24" />
              </div>
              <Bar className="h-3 w-20" />
            </div>
            <Bar className="h-2 w-full" />
            <div className="space-y-2 pt-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="shimmer size-4 rounded-full" />
                  <Bar className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Bar className="h-4 w-56" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="shimmer size-5 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Bar className="h-3 w-1/3" />
                  <Bar className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Bar className="h-4 w-40" />
            <Bar className="h-3 w-3/4" />
            <Bar className="h-10 w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Bar className="h-4 w-40" />
            <Bar className="h-3 w-3/4" />
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-12 w-full" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
