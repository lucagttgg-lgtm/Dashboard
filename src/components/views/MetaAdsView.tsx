import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, MessageSquare, DollarSign, Users, Eye, MousePointer, ThumbsUp, RefreshCw, AlertCircle } from 'lucide-react';
import { ClientData } from '../../types';
import { DatePreset, MetaInsights, MetaDailyInsight, MetaCampaign, getAccountInsights, getAccountTimeSeries, getCampaigns } from '../../services/metaService';
import { formatBRL } from '../../utils';

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Últimos 7 dias', value: 'last_7d' },
  { label: 'Últimos 30 dias', value: 'last_30d' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10',
  PAUSED: 'text-yellow-400 bg-yellow-400/10',
  ARCHIVED: 'text-gray-500 bg-gray-500/10',
};
const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Ativo', PAUSED: 'Pausada', ARCHIVED: 'Arquivada' };
const fmtN = (n: number) => n.toLocaleString('pt-BR');

interface Props { clients: ClientData[] }

export function MetaAdsView({ clients }: Props) {
  const clientOptions = clients.filter(c => !!c.metaAccountId);
  const [selectedClientId, setSelectedClientId] = useState(clientOptions[0]?.id ?? '');
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<MetaInsights | null>(null);
  const [timeSeries, setTimeSeries] = useState<MetaDailyInsight[]>([]);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);

  const selectedClient = clientOptions.find(c => c.id === selectedClientId);
  const adAccountId = selectedClient?.metaAccountId;

  const load = () => {
    if (!adAccountId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getAccountInsights(adAccountId, datePreset),
      getAccountTimeSeries(adAccountId, datePreset),
      getCampaigns(adAccountId, datePreset),
    ])
      .then(([ins, ts, camps]) => {
        setInsights(ins);
        setTimeSeries(ts);
        setCampaigns(camps.sort((a, b) => b.spend - a.spend));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedClientId, datePreset]);

  const metricCards = insights ? [
    { label: 'Valor Gasto', value: formatBRL(insights.spend), icon: DollarSign, color: 'text-brand-purple2' },
    { label: 'Mensagens Geradas', value: fmtN(insights.mensagens), icon: MessageSquare, color: 'text-green-400' },
    { label: 'Custo / Mensagem', value: insights.custoMensagem > 0 ? formatBRL(insights.custoMensagem) : '—', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Alcance', value: fmtN(insights.reach), icon: Users, color: 'text-amber-400' },
    { label: 'Impressões', value: fmtN(insights.impressions), icon: Eye, color: 'text-cyan-400' },
    { label: 'Cliques', value: fmtN(insights.clicks), icon: MousePointer, color: 'text-pink-400' },
    { label: 'Seguidores / Curtidas', value: fmtN(insights.likes), icon: ThumbsUp, color: 'text-orange-400' },
  ] : [];

  const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Meta Ads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resultados de anúncios em tempo real</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white border border-brand-light rounded-lg px-3 py-2 hover:bg-brand-light/50 transition-all disabled:opacity-40">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className={labelCls}>Cliente</p>
          <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full bg-brand-medium border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
            {clientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <p className={labelCls}>Período</p>
          <select value={datePreset} onChange={e => setDatePreset(e.target.value as DatePreset)} className="w-full bg-brand-medium border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
            {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading && !insights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(7)].map((_, i) => <div key={i} className="bg-brand-medium border border-brand-light rounded-2xl p-4 animate-pulse h-20" />)}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metricCards.map(card => (
            <div key={card.label} className="bg-brand-medium border border-brand-light rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 shrink-0 ${card.color}`} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-tight">{card.label}</p>
              </div>
              <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {timeSeries.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Gasto diário (R$)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={timeSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, fontSize: 12 }} labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')} formatter={(v: number) => [formatBRL(v), 'Gasto']} />
                <Bar dataKey="spend" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mensagens geradas</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timeSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, fontSize: 12 }} labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#6b7280' }} />
                <Line dataKey="mensagens" stroke="#22c55e" strokeWidth={2} dot={false} name="Mensagens" />
                <Line dataKey="reach" stroke="#60a5fa" strokeWidth={2} dot={false} name="Alcance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-light">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campanhas</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-light">
                  {['Campanha', 'Status', 'Gasto', 'Alcance', 'Impressões', 'Mensagens', 'Custo/Msg'].map(h => (
                    <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id} className={`border-b border-brand-light/50 hover:bg-brand-light/20 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3 text-xs font-medium text-white max-w-[200px] truncate">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'text-gray-400 bg-gray-400/10'}`}>
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{c.spend > 0 ? formatBRL(c.spend) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.reach > 0 ? fmtN(c.reach) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.impressions > 0 ? fmtN(c.impressions) : '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-green-400">{c.mensagens > 0 ? fmtN(c.mensagens) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.custoMensagem > 0 ? formatBRL(c.custoMensagem) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && !insights && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      )}
    </div>
  );
}
