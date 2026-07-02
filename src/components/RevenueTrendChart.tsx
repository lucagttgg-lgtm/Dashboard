import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyTotal } from '../types';
import { formatCurrency, formatMonth } from '../utils';

interface RevenueTrendChartProps {
  monthlyTotals: MonthlyTotal[];
}

export function RevenueTrendChart({ monthlyTotals }: RevenueTrendChartProps) {
  const data = monthlyTotals.map((item) => ({ ...item, label: formatMonth(item.month) }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Evolução mensal</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} width={90} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="goal"
            name="Meta"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
