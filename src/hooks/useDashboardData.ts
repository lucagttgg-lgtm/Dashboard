import { useEffect, useMemo, useState } from 'react';
import { subscribeToSalesResults, subscribeToStores } from '../services/storesService';
import type { MonthlyTotal, SalesResult, Store, StoreSummary } from '../types';

interface DashboardData {
  loading: boolean;
  error: string | null;
  months: string[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  storeSummaries: StoreSummary[];
  monthlyTotals: MonthlyTotal[];
  totalRevenue: number;
  totalGoal: number;
  achievement: number;
}

export function useDashboardData(): DashboardData {
  const [stores, setStores] = useState<Store[]>([]);
  const [results, setResults] = useState<SalesResult[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const unsubscribeStores = subscribeToStores(
      (data) => {
        setStores(data);
        setLoadingStores(false);
      },
      (err) => {
        setError(err.message);
        setLoadingStores(false);
      },
    );
    const unsubscribeResults = subscribeToSalesResults(
      (data) => {
        setResults(data);
        setLoadingResults(false);
      },
      (err) => {
        setError(err.message);
        setLoadingResults(false);
      },
    );
    return () => {
      unsubscribeStores();
      unsubscribeResults();
    };
  }, []);

  const months = useMemo(() => {
    const unique = new Set(results.map((r) => r.month));
    return Array.from(unique).sort();
  }, [results]);

  useEffect(() => {
    if (!selectedMonth && months.length > 0) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [months, selectedMonth]);

  const storeSummaries = useMemo<StoreSummary[]>(() => {
    return stores
      .map((store) => {
        const revenue = results
          .filter((r) => r.storeId === store.id && r.month === selectedMonth)
          .reduce((sum, r) => sum + r.revenue, 0);
        const achievement = store.monthlyGoal > 0 ? (revenue / store.monthlyGoal) * 100 : 0;
        return { ...store, revenue, achievement };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [stores, results, selectedMonth]);

  const monthlyTotals = useMemo<MonthlyTotal[]>(() => {
    const totalGoalAllStores = stores.reduce((sum, s) => sum + s.monthlyGoal, 0);
    return months.map((month) => ({
      month,
      revenue: results.filter((r) => r.month === month).reduce((sum, r) => sum + r.revenue, 0),
      goal: totalGoalAllStores,
    }));
  }, [months, results, stores]);

  const totalRevenue = useMemo(
    () => storeSummaries.reduce((sum, s) => sum + s.revenue, 0),
    [storeSummaries],
  );
  const totalGoal = useMemo(() => stores.reduce((sum, s) => sum + s.monthlyGoal, 0), [stores]);
  const achievement = totalGoal > 0 ? (totalRevenue / totalGoal) * 100 : 0;

  return {
    loading: loadingStores || loadingResults,
    error,
    months,
    selectedMonth,
    setSelectedMonth,
    storeSummaries,
    monthlyTotals,
    totalRevenue,
    totalGoal,
    achievement,
  };
}
