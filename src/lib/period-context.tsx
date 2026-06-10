import { createContext, useContext, useState, type ReactNode } from "react";

export type PeriodKey = "90d" | "30d" | "7d" | "custom";

export interface PeriodState {
  key: PeriodKey;
  days: number;
  label: string;
  range?: { from: Date; to: Date };
}

interface Ctx {
  period: PeriodState;
  setPeriod: (p: PeriodState) => void;
}

const PeriodContext = createContext<Ctx | null>(null);

export const DEFAULT_PERIOD: PeriodState = {
  key: "90d",
  days: 90,
  label: "Last 90 days",
};

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodState>(DEFAULT_PERIOD);
  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
