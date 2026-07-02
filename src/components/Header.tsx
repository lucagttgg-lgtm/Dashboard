import { Store as StoreIcon } from 'lucide-react';
import { formatMonth } from '../utils';

interface HeaderProps {
  months: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function Header({ months, selectedMonth, onMonthChange }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-900 p-2.5 text-white">
          <StoreIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Resultado das Lojas</h1>
          <p className="text-sm text-slate-500">Acompanhamento de vendas por unidade</p>
        </div>
      </div>
      {months.length > 0 && (
        <select
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      )}
    </header>
  );
}
