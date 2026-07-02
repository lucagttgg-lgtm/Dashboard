import { useState, useEffect } from 'react';
import { ActiveView } from './types';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ClientDetailView } from './components/views/ClientDetailView';
import { RankingView } from './components/views/RankingView';
import { FeedbackView } from './components/views/FeedbackView';
import { MetaAdsView } from './components/views/MetaAdsView';
import { DataEntryView } from './components/views/DataEntryView';
import { useClients } from './hooks/useClients';
import { useClientNotes } from './hooks/useClientNotes';

const THEME_KEY = 'dashboard_theme';

export default function App() {
  const { clients, loading, error } = useClients();
  const notes = useClientNotes();

  const [activeView, setActiveView] = useState<ActiveView>({ type: 'home' });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem(THEME_KEY) as 'dark' | 'light') ?? 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const activeClient = activeView.type === 'client' ? clients.find(c => c.id === activeView.clientId) : undefined;

  const pageLabel =
    activeView.type === 'home' ? 'Home'
    : activeView.type === 'ranking' ? 'Ranking'
    : activeView.type === 'feedback' ? 'Feedback Hub'
    : activeView.type === 'meta-ads' ? 'Meta Ads'
    : activeView.type === 'data-entry' ? 'Lançar Resultado'
    : activeClient?.name ?? '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-brand-dark text-white ${theme}`}>
      <div className="hidden lg:block">
        <Sidebar clients={clients} activeView={activeView} onViewChange={setActiveView} theme={theme} onToggleTheme={toggleTheme} />
      </div>

      <main className="flex-1 lg:ml-72 pb-24 lg:pb-0 min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-brand-medium/95 backdrop-blur border-b border-brand-light px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-brand-purple">Painel de Clientes</span>
          <span className="text-[10px] text-gray-500 bg-brand-light px-2 py-1 rounded border border-brand-light truncate max-w-[140px]">{pageLabel}</span>
        </header>

        <div className="px-4 py-6 lg:p-10">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
              Erro ao carregar dados: {error}
            </div>
          )}

          {activeView.type === 'home' && <HomeView clients={clients} onNavigate={setActiveView} />}
          {activeView.type === 'ranking' && <RankingView clients={clients} />}
          {activeView.type === 'feedback' && <FeedbackView clients={clients} onClientClick={id => setActiveView({ type: 'client', clientId: id })} />}
          {activeView.type === 'meta-ads' && <MetaAdsView clients={clients} />}
          {activeView.type === 'data-entry' && <DataEntryView clients={clients} />}
          {activeView.type === 'client' && activeClient && (
            <ClientDetailView client={activeClient} note={notes[activeClient.id] ?? ''} />
          )}

          <footer className="mt-16 pt-6 border-t border-brand-light flex justify-between items-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
            <span>Painel de Clientes</span>
          </footer>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav activeView={activeView} onViewChange={setActiveView} />
      </div>
    </div>
  );
}
