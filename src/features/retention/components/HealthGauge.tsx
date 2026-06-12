export function HealthGauge({ score }: { score: number }) {
  const color = score < 40 ? "var(--risk-high)" : score < 70 ? "var(--risk-medium)" : "var(--risk-low)";
  const circumference = 2 * Math.PI * 42;
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums">{score}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Health</div>
        </div>
      </div>
    </div>
  );
}
