import type { ReactNode } from 'react';
import { DollarSign, Percent, Store as StoreIcon, Target } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SummaryCardsProps {
  totalRevenue: number;
  totalGoal: number;
  achievement: number;
  storeCount: number;
}

function Card({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-slate-100 p-3 text-slate-700">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function SummaryCards({ totalRevenue, totalGoal, achievement, storeCount }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={<DollarSign size={20} />} label="Faturamento total" value={formatCurrency(totalRevenue)} />
      <Card icon={<Target size={20} />} label="Meta total" value={formatCurrency(totalGoal)} />
      <Card
        icon={<Percent size={20} />}
        label="Atingimento da meta"
        value={`${achievement.toFixed(1)}%`}
      />
      <Card icon={<StoreIcon size={20} />} label="Lojas ativas" value={String(storeCount)} />
    </div>
  );
}
