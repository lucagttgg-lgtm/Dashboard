import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { StoreSummary } from '../types';
import { formatCurrency } from '../utils';

interface RevenueByStoreChartProps {
  storeSummaries: StoreSummary[];
}

export function RevenueByStoreChart({ storeSummaries }: RevenueByStoreChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Faturamento por loja</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={storeSummaries} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} width={90} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="revenue" name="Faturamento" fill="#0f172a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
