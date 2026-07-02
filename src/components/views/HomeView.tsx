import { ArrowRight, AlertTriangle, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { ClientData, ActiveView } from '../../types';
import { totalVendas, calcRoi, formatBRL } from '../../utils';
import { HealthBadge } from '../ui/HealthBadge';

interface Props {
  clients: ClientData[];
  onNavigate: (view: ActiveView) => void;
}

const thoughts = [
  { icon: Target, text: 'O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local.' },
  { icon: Lightbulb, text: 'Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada.' },
  { icon: TrendingUp, text: 'O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto "na mão" ou a fachada da loja.' },
  { icon: Lightbulb, text: 'Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço.' },
];

export function HomeView({ clients, onNavigate }: Props) {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const totalGlobal = clients.reduce((a, c) => a + totalVendas(c), 0);
  const totalClientes = clients.length;
  const roiPositivos = clients.filter(c => calcRoi(c, c.fee).status === 'positivo').length;

  const alertas = clients.filter(c => {
    const hist = c.historico.filter(m => m.vendas >= 0).slice(-3);
    return hist.length >= 3 && hist.every((m, i, a) => i === 0 || m.vendas <= a[i - 1].vendas);
  });

  return (
    <div className="space-y-8 py-4">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">{saudacao}</h1>
        <p className="text-sm text-gray-500">Resumo de todos os clientes · atualizado agora</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total acumulado', value: formatBRL(totalGlobal), color: '#7c3aed' },
          { label: 'Clientes ativos', value: totalClientes, color: '#22c55e' },
          { label: 'ROI positivo', value: `${roiPositivos}/${totalClientes}`, color: '#f59e0b' },
          { label: 'Precisam de atenção', value: alertas.length, color: '#ec4899' },
        ].map((k, i) => (
          <div key={i} className="bg-brand-medium border border-brand-light rounded-xl p-4 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full mb-3" style={{ background: k.color }} />
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-xl font-bold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="mb-8 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {alertas.length} {alertas.length === 1 ? 'cliente precisa de atenção' : 'clientes precisam de atenção'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map(c => (
              <button
                key={c.id}
                onClick={() => onNavigate({ type: 'client', clientId: c.id })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-900/30 text-xs text-amber-600 hover:bg-amber-900/40 transition-all cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                {c.name} <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clientes</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Visão rápida de cada conta com acesso ao detalhe</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => onNavigate({ type: 'client', clientId: client.id })}
              className="text-left p-4 rounded-xl border border-brand-light bg-brand-medium hover:border-gray-500 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: client.color }} />
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: client.color }} />
                <p className="text-xs font-bold text-[var(--text-primary)] truncate flex-1">{client.name}</p>
                <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
              </div>
              <p className="text-sm font-bold text-white mb-2">{formatBRL(totalVendas(client))}</p>
              {client.historico.length > 0 ? (
                <HealthBadge client={client} />
              ) : (
                <p className="text-[10px] text-gray-700">Sem dados lançados ainda</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pt-4">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Dicas de Sucesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thoughts.map((t, i) => (
            <div key={i} className="group p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform shrink-0">
                  <t.icon className="w-5 h-5" />
                </div>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-relaxed transition-colors">
                  {t.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
