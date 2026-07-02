import type { StoreSummary } from '../types';
import { formatCurrency } from '../utils';

interface StoreRankingTableProps {
  storeSummaries: StoreSummary[];
}

function achievementColor(achievement: number): string {
  if (achievement >= 100) return 'bg-emerald-500';
  if (achievement >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function StoreRankingTable({ storeSummaries }: StoreRankingTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Ranking de lojas</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Loja</th>
              <th className="py-2 pr-4 font-medium">Região</th>
              <th className="py-2 pr-4 font-medium">Faturamento</th>
              <th className="py-2 pr-4 font-medium">Meta</th>
              <th className="py-2 pr-4 font-medium">Atingimento</th>
            </tr>
          </thead>
          <tbody>
            {storeSummaries.map((store, index) => (
              <tr key={store.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 text-slate-500">{index + 1}</td>
                <td className="py-3 pr-4 font-medium text-slate-900">{store.name}</td>
                <td className="py-3 pr-4 text-slate-500">{store.region}</td>
                <td className="py-3 pr-4 text-slate-700">{formatCurrency(store.revenue)}</td>
                <td className="py-3 pr-4 text-slate-500">{formatCurrency(store.monthlyGoal)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${achievementColor(store.achievement)}`}
                        style={{ width: `${Math.min(store.achievement, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{store.achievement.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {storeSummaries.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  Nenhum dado para o período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
