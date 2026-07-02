import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClientData } from '../../types';
import { StatCard } from '../ui/StatCard';
import { ChartCard, ChartTooltip } from '../ui/ChartCard';
import { HealthBadge } from '../ui/HealthBadge';
import { ProjecaoCard } from '../ui/ProjecaoCard';
import { RoiPanel } from '../ui/RoiPanel';
import { MonthFilter } from '../ui/MonthFilter';
import { DollarSign, Percent, MessageSquare, TrendingUp, BarChart2, Calendar, Target, RefreshCw, Eye, MousePointer, ThumbsUp, AlertCircle, Users, Info } from 'lucide-react';
import { formatBRL, calcRoi, ultimoMes } from '../../utils';
import { DatePreset, MetaInsights, MetaDailyInsight, MetaCampaign, getAccountInsights, getAccountTimeSeries, getCampaigns } from '../../services/metaService';
import { updateClientNote } from '../../services/localStore';

interface Props {
  client: ClientData;
  note: string;
}

type Tab = 'visao' | 'meta-ads';

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Últimos 7 dias', value: 'last_7d' },
  { label: 'Últimos 30 dias', value: 'last_30d' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10', PAUSED: 'text-yellow-400 bg-yellow-400/10', ARCHIVED: 'text-gray-500 bg-gray-500/10',
};
const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Ativo', PAUSED: 'Pausada', ARCHIVED: 'Arquivada' };
const fmtN = (n: number) => n.toLocaleString('pt-BR');

export function ClientDetailView({ client, note }: Props) {
  const [tab, setTab] = useState<Tab>('visao');
  const [showFilter, setShowFilter] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);

  useEffect(() => setNoteDraft(note), [note, client.id]);

  const canSeeMetaAds = !!client.metaAccountId;

  const [metaDatePreset, setMetaDatePreset] = useState<DatePreset>('last_30d');
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaInsights, setMetaInsights] = useState<MetaInsights | null>(null);
  const [metaTimeSeries, setMetaTimeSeries] = useState<MetaDailyInsight[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);

  const loadMeta = () => {
    if (!client.metaAccountId) return;
    setMetaLoading(true);
    setMetaError(null);
    Promise.all([
      getAccountInsights(client.metaAccountId, metaDatePreset),
      getAccountTimeSeries(client.metaAccountId, metaDatePreset),
      getCampaigns(client.metaAccountId, metaDatePreset),
    ])
      .then(([ins, ts, camps]) => {
        setMetaInsights(ins);
        setMetaTimeSeries(ts);
        setMetaCampaigns(camps.sort((a, b) => b.spend - a.spend));
      })
      .catch(err => setMetaError(err.message))
      .finally(() => setMetaLoading(false));
  };

  useEffect(() => { if (tab === 'meta-ads') loadMeta(); }, [tab, metaDatePreset, client.id]);

  const allChaves = client.historico.map(m => m.chave);
  const allLabels = client.historico.map(m => m.mes);
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set(allChaves));

  useEffect(() => { setSelectedMonths(new Set(allChaves)); }, [allChaves.join(',')]);

  const filtered = useMemo(() => client.historico.filter(m => selectedMonths.has(m.chave)), [client, selectedMonths]);

  const roi = calcRoi(client, client.fee);
  const comVendas = client.historico.filter(m => m.vendas > 0);
  const ultimo = ultimoMes(client);
  const penultimo = comVendas.length >= 2 ? comVendas[comVendas.length - 2] : null;

  const hasConversao = client.historico.some(m => m.conversao > 0);
  const hasMensagens = client.historico.some(m => m.mensagens > 0);
  const hasFaturamento = client.historico.some(m => m.faturamentoLoja > 0);
  const hasVerba = client.historico.some(m => m.verba > 0);

  const change = (cur: number, prev: number | null) => {
    if (!prev || prev === 0) return undefined;
    const pct = ((cur - prev) / prev) * 100;
    return { value: `${Math.abs(pct).toFixed(1)}%`, isPositive: pct >= 0 };
  };

  const chartData = filtered.map(m => ({ name: m.mes, vendas: m.vendas, conversao: m.conversao, mensagens: m.mensagens }));
  const clientFiltered: ClientData = { ...client, historico: filtered };

  if (client.historico.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: client.color }}>{client.name}</h1>
        <div className="bg-brand-medium border border-brand-light rounded-xl p-8 text-center text-sm text-gray-500">
          Nenhum resultado lançado ainda para este cliente. Use "Lançar Resultado" para começar.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1" style={{ color: client.color }}>{client.name}</h1>
            <p className="text-xs text-gray-500">
              {client.historico[0].mes} — {client.historico[client.historico.length - 1].mes}
              {!hasFaturamento && <span className="ml-2 text-amber-700">· Sem faturamento informado</span>}
              {!hasMensagens && <span className="ml-2 text-amber-700">· Sem dados de mensagens</span>}
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">ROI acumulado</p>
            <p className="text-xl font-bold" style={{ color: roi.status === 'positivo' ? '#22c55e' : '#ef4444' }}>{formatBRL(roi.roiTotal)}</p>
            <p className="text-[9px] text-gray-600">{roi.mesesPositivos}/{roi.meses.length} meses pagos</p>
          </div>
        </div>
        <HealthBadge client={client} />

        <div className="mt-3 p-3 rounded-xl bg-brand-medium border border-brand-light/50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3 h-3 text-brand-purple" />
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">Entenda a classificação do resultado</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-green-500 uppercase">Saudável (60+ pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Vendas em crescimento, conversão acima de 5% e boa relação investimento/faturamento.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-amber-500 uppercase">Atenção (30-59 pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Performance estável ou com sinais de queda na eficiência.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-red-500 uppercase">Crítico (&lt; 30 pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Mesmo com ROI positivo, o cliente apresenta queda real de vendas ou conversão muito baixa.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
          <button onClick={() => setTab('visao')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'visao' ? 'bg-brand-light text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <BarChart2 className="w-3.5 h-3.5" />Resultados
          </button>
          {canSeeMetaAds && (
            <button onClick={() => setTab('meta-ads')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'meta-ads' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Target className="w-3.5 h-3.5" />Meta Ads
            </button>
          )}
        </div>

        {tab === 'visao' && (
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showFilter ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20' : 'bg-brand-light border-brand-light text-[var(--text-secondary)] hover:border-[var(--text-muted)]'}`}>
            <Calendar className="w-3.5 h-3.5" />{showFilter ? 'Ocultar' : 'Filtrar'}
          </button>
        )}
      </div>

      {tab === 'visao' && (
        <div className="space-y-5 w-full">
          {showFilter && (
            <div className="bg-brand-medium border border-brand-light rounded-2xl px-5 py-4 mb-5">
              <MonthFilter allMonths={allChaves} monthLabels={allLabels} selected={selectedMonths} onChange={setSelectedMonths} />
            </div>
          )}

          {selectedMonths.size < allChaves.length && (
            <div className="px-3 py-2 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-between">
              <p className="text-[10px] text-brand-purple2">Exibindo {selectedMonths.size} de {allChaves.length} meses</p>
              <button onClick={() => setSelectedMonths(new Set(allChaves))} className="text-[10px] text-brand-purple2 underline">Ver todos</button>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Faturamento Total" value={ultimo.faturamentoLoja > 0 ? formatBRL(ultimo.faturamentoLoja) : '—'} subtext={ultimo.mes} icon={DollarSign} />
            <StatCard label="Venda Atribuída" value={formatBRL(ultimo.vendas)} change={change(ultimo.vendas, penultimo?.vendas ?? null)} icon={TrendingUp} />
            {hasConversao
              ? <StatCard label={`Conversão (${ultimo.mes})`} value={`${ultimo.conversao.toFixed(1)}%`} change={change(ultimo.conversao, penultimo?.conversao ?? null)} icon={Percent} />
              : <StatCard label="Meses ROI +" value={`${roi.mesesPositivos} / ${roi.meses.length}`} subtext="no período" icon={Percent} />}
            {hasMensagens
              ? <StatCard label="Contatos" value={ultimo.mensagens} subtext={`Ticket: ${formatBRL(ultimo.ticketMedio)}`} icon={MessageSquare} />
              : <StatCard label="ROI Período" value={formatBRL(roi.roiTotal)} subtext={roi.status === 'positivo' ? 'Positivo ✓' : 'Negativo'} icon={MessageSquare} />}
          </div>

          <div className={`grid grid-cols-1 ${hasConversao ? 'lg:grid-cols-2' : ''} gap-4`}>
            <ChartCard title="Evolução de vendas (R$)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={client.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={client.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="vendas" name="Vendas (R$)" stroke={client.color} strokeWidth={2} fill={`url(#g-${client.id})`} dot={{ r: 3, fill: client.color }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {hasConversao && (
              <ChartCard title="Conversão mensal (%)">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="conversao" name="Conversão (%)" fill={client.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ProjecaoCard client={client} />
            <div className="lg:col-span-2"><RoiPanel client={clientFiltered} fee={client.fee} /></div>
          </div>

          <div className="bg-brand-medium border border-brand-light rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-purple" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Feedback da Operação</h3>
            </div>
            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              onBlur={() => { if (noteDraft !== note) updateClientNote(client.id, noteDraft); }}
              placeholder="Escreva um feedback estratégico sobre a operação deste cliente (ex: novos criativos em andamento, ajustes de segmentação, etc.)"
              className="w-full min-h-[100px] bg-brand-dark/50 border border-brand-light/70 rounded-xl p-3.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-brand-purple transition-all resize-y leading-relaxed"
            />
            <p className="text-[9px] text-gray-500">Salvo automaticamente ao sair do campo</p>
          </div>

          <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
            <div className="p-4 border-b border-brand-light flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico</h3>
              {selectedMonths.size < allChaves.length && (
                <span className="text-[9px] text-brand-purple2 bg-brand-purple/10 px-2 py-0.5 rounded">{selectedMonths.size} meses filtrados</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: hasMensagens ? 640 : 420 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Mês</th>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Vendas</th>
                    {hasFaturamento && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Fat.</th>}
                    {hasMensagens && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Msgs</th>}
                    {hasConversao && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Conv.</th>}
                    {hasMensagens && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Ticket</th>}
                    {hasVerba && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Verba</th>}
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Custo</th>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light">
                  {filtered.map((m, i) => {
                    const custo = client.fee + m.verba;
                    const roiMes = m.vendas - custo;
                    return (
                      <tr key={i} className="hover:bg-brand-light/20 transition-colors">
                        <td className="px-3 py-3 text-xs font-semibold text-gray-300 whitespace-nowrap">{m.mes}</td>
                        <td className="px-3 py-3 text-xs font-bold whitespace-nowrap" style={{ color: m.vendas > 0 ? '#fff' : '#374151' }}>{formatBRL(m.vendas)}</td>
                        {hasFaturamento && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.faturamentoLoja > 0 ? formatBRL(m.faturamentoLoja) : '—'}</td>}
                        {hasMensagens && <td className="px-3 py-3 text-xs text-gray-500">{m.mensagens || '—'}</td>}
                        {hasConversao && <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: m.conversao >= 10 ? '#22c55e' : m.conversao >= 3 ? '#f59e0b' : '#6b7280' }}>{m.conversao > 0 ? `${m.conversao.toFixed(1)}%` : '—'}</td>}
                        {hasMensagens && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.ticketMedio > 0 ? formatBRL(m.ticketMedio) : '—'}</td>}
                        {hasVerba && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.verba > 0 ? formatBRL(m.verba) : '—'}</td>}
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatBRL(custo)}</td>
                        <td className="px-3 py-3 text-xs font-bold whitespace-nowrap" style={{ color: roiMes >= 0 ? '#22c55e' : '#ef4444' }}>{formatBRL(roiMes)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'meta-ads' && canSeeMetaAds && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
              {DATE_PRESETS.map(p => (
                <button key={p.value} onClick={() => setMetaDatePreset(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${metaDatePreset === p.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={loadMeta} disabled={metaLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-brand-light rounded-lg px-3 py-2 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${metaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {metaError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />{metaError}
            </div>
          )}

          {metaLoading && !metaInsights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(7)].map((_, i) => <div key={i} className="bg-brand-medium border border-brand-light rounded-2xl p-4 animate-pulse h-20" />)}
            </div>
          )}

          {metaInsights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Valor Gasto', value: formatBRL(metaInsights.spend), icon: DollarSign, color: 'text-brand-purple2' },
                { label: 'Mensagens', value: fmtN(metaInsights.mensagens), icon: MessageSquare, color: 'text-green-400' },
                { label: 'Custo / Mensagem', value: metaInsights.custoMensagem > 0 ? formatBRL(metaInsights.custoMensagem) : '—', icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Alcance', value: fmtN(metaInsights.reach), icon: Users, color: 'text-amber-400' },
                { label: 'Impressões', value: fmtN(metaInsights.impressions), icon: Eye, color: 'text-cyan-400' },
                { label: 'Cliques', value: fmtN(metaInsights.clicks), icon: MousePointer, color: 'text-pink-400' },
                { label: 'Curtidas / Seguid.', value: fmtN(metaInsights.likes), icon: ThumbsUp, color: 'text-orange-400' },
              ].map(card => (
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

          {metaCampaigns.length > 0 && (
            <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-brand-light">
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
                    {metaCampaigns.map((c, i) => (
                      <tr key={c.id} className={`border-b border-brand-light/50 hover:bg-brand-light/20 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                        <td className="px-4 py-3 text-xs font-medium text-white max-w-[180px] truncate">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{STATUS_LABELS[c.status] ?? c.status}</span>
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
        </div>
      )}
    </div>
  );
}
