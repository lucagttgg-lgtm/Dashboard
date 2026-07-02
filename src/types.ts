export interface Store {
  id: string;
  name: string;
  region: string;
  monthlyGoal: number;
}

export interface SalesResult {
  id: string;
  storeId: string;
  /** Formato "YYYY-MM", ex: "2026-07" */
  month: string;
  revenue: number;
}

export interface StoreSummary extends Store {
  revenue: number;
  achievement: number;
}

export interface MonthlyTotal {
  month: string;
  revenue: number;
  goal: number;
}
