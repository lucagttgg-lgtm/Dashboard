import type { ElementType } from 'react';
import { TrendingUp, BarChart2, Home, MessageSquare, PlusCircle, Target, Send } from 'lucide-react';
import { ClientData, ActiveView } from '../types';

interface Props {
  clients: ClientData[];
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Sidebar({ clients, activeView, onViewChange, theme, onToggleTheme }: Props) {
  const isActive = (view: ActiveView) => {
    if (activeView.type !== view.type) return false;
    if (view.type === 'client' && activeView.type === 'client') return activeView.clientId === view.clientId;
    return true;
  };

  const navBtn = (label: string, view: ActiveView, Icon: ElementType) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
        isActive(view) ? 'bg-brand-light text-white border-l-2 border-brand-purple' : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm font-bold">{label}</span>
    </button>
  );

  return (
    <aside className="w-72 bg-brand-medium border-r border-brand-light p-5 flex flex-col fixed h-screen left-0 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 bg-brand-purple/20 border border-brand-purple/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand-purple" />
          </div>
          <span className="text-base font-bold text-white">Painel de Clientes</span>
        </div>
        <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest pl-9">Resultados & Meta Ads</p>
      </div>

      <nav className="flex-1 space-y-4">
        <div className="space-y-0.5">
          {navBtn('Home', { type: 'home' }, Home)}
          {navBtn('Ranking', { type: 'ranking' }, BarChart2)}
          {navBtn('Feedback Hub', { type: 'feedback' }, MessageSquare)}
          {navBtn('Meta Ads', { type: 'meta-ads' }, Target)}
          {navBtn('Feedback Meta (7 dias)', { type: 'meta-feedback' }, Send)}
          {navBtn('Lançar Resultado', { type: 'data-entry' }, PlusCircle)}
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">Clientes</p>
          <div className="space-y-0.5">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => onViewChange({ type: 'client', clientId: client.id })}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive({ type: 'client', clientId: client.id }) ? 'bg-brand-light text-white border-l-2 -ml-px' : 'text-gray-500 hover:text-gray-300 hover:bg-brand-light/40'
                }`}
                style={isActive({ type: 'client', clientId: client.id }) ? { borderLeftColor: client.color } : {}}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: client.color }} />
                <span className="font-medium truncate">{client.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-brand-light">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Sistema ativo</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-1 rounded bg-brand-light hover:bg-brand-light/90 border border-white/5 hover:border-brand-purple/40 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
