import type { ElementType } from 'react';
import { Home, BarChart2, MessageSquare, Target, PlusCircle, Send } from 'lucide-react';
import { ActiveView } from '../types';

interface Props {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export function BottomNav({ activeView, onViewChange }: Props) {
  const items: { label: string; view: ActiveView; Icon: ElementType }[] = [
    { label: 'Home', view: { type: 'home' }, Icon: Home },
    { label: 'Ranking', view: { type: 'ranking' }, Icon: BarChart2 },
    { label: 'Feedback', view: { type: 'feedback' }, Icon: MessageSquare },
    { label: 'Meta Ads', view: { type: 'meta-ads' }, Icon: Target },
    { label: 'Feedback Meta', view: { type: 'meta-feedback' }, Icon: Send },
    { label: 'Lançar', view: { type: 'data-entry' }, Icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-medium/95 backdrop-blur border-t border-brand-light flex items-center justify-around py-2 px-1 overflow-x-auto no-scrollbar">
      {items.map(item => {
        const active = activeView.type === item.view.type;
        return (
          <button
            key={item.label}
            onClick={() => onViewChange(item.view)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all shrink-0 ${active ? 'text-brand-purple' : 'text-gray-500'}`}
          >
            <item.Icon className="w-4 h-4" />
            <span className="text-[9px] font-bold whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
