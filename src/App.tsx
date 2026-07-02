import { Header } from './components/Header';
import { RevenueByStoreChart } from './components/RevenueByStoreChart';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { StoreRankingTable } from './components/StoreRankingTable';
import { SummaryCards } from './components/SummaryCards';
import { EmptyState, ErrorState, LoadingState } from './components/StatusState';
import { useDashboardData } from './hooks/useDashboardData';

export default function App() {
  const {
    loading,
    error,
    months,
    selectedMonth,
    setSelectedMonth,
    storeSummaries,
    monthlyTotals,
    totalRevenue,
    totalGoal,
    achievement,
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Header months={months} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        <main className="mt-8 flex flex-col gap-6">
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && months.length === 0 && <EmptyState />}
          {!loading && !error && months.length > 0 && (
            <>
              <SummaryCards
                totalRevenue={totalRevenue}
                totalGoal={totalGoal}
                achievement={achievement}
                storeCount={storeSummaries.length}
              />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RevenueByStoreChart storeSummaries={storeSummaries} />
                <RevenueTrendChart monthlyTotals={monthlyTotals} />
              </div>
              <StoreRankingTable storeSummaries={storeSummaries} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
