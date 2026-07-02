import { ClientData } from './types';

// ─── FORMATAÇÃO ──────────────────────────────────────────────────────────────
export const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPct = (v: number) => `${v.toFixed(1)}%`;

export const ultimoMes = (client: ClientData) => {
  if (!client.historico || client.historico.length === 0) {
    return {
      chave: '', mes: '', vendas: 0, faturamentoLoja: 0,
      verba: 0, mensagens: 0, qtdVendas: 0,
      conversao: 0, ticketMedio: 0, pctAureFat: 0,
    };
  }
  return [...client.historico].reverse().find(m => m.vendas > 0) ?? client.historico[client.historico.length - 1];
};

export const totalVendas = (client: ClientData) =>
  client.historico.reduce((a, m) => a + m.vendas, 0);

// ─── 1. SCORE DE SAÚDE ───────────────────────────────────────────────────────
export type HealthStatus = 'saudavel' | 'atencao' | 'critico';

export interface HealthScore {
  status: HealthStatus;
  label: string;
  color: string;
  bg: string;
  score: number;
  detalhes: { criterio: string; valor: string; pontos: number; maxPontos: number }[];
}

export function calcHealthScore(client: ClientData): HealthScore {
  const ultimos = [...client.historico].slice(-3);
  if (!ultimos.length)
    return { status: 'critico', label: 'Sem dados', color: '#ef4444', bg: 'rgba(239,68,68,.1)', score: 0, detalhes: [] };

  const convMedia = ultimos.reduce((a, m) => a + m.conversao, 0) / ultimos.length;
  const pontosConv = convMedia >= 10 ? 40 : convMedia >= 5 ? 28 : convMedia >= 2 ? 16 : 0;

  const comVendas = ultimos.filter(m => m.vendas > 0);
  let pontosCrescimento = 20;
  if (comVendas.length >= 2) {
    const delta = ((comVendas[comVendas.length - 1].vendas - comVendas[0].vendas) / comVendas[0].vendas) * 100;
    pontosCrescimento = delta >= 10 ? 35 : delta >= 0 ? 20 : 0;
  }

  const comFat = ultimos.filter(m => m.faturamentoLoja > 0);
  const pctMedia = comFat.length ? comFat.reduce((a, m) => a + m.pctAureFat, 0) / comFat.length : 0;
  const temFat = comFat.length > 0;
  let pontosPct = 0;
  if (temFat) {
    pontosPct = pctMedia >= 5 ? 25 : pctMedia >= 2 ? 15 : pctMedia >= 1 ? 8 : 0;
  } else {
    pontosPct = pontosCrescimento >= 35 ? 25 : pontosCrescimento >= 20 ? 15 : 0;
  }

  const total = pontosConv + pontosCrescimento + pontosPct;
  const status: HealthStatus = total >= 60 ? 'saudavel' : total >= 30 ? 'atencao' : 'critico';
  const label = status === 'saudavel' ? 'Saudável' : status === 'atencao' ? 'Atenção' : 'Crítico';
  const color = status === 'saudavel' ? '#22c55e' : status === 'atencao' ? '#f59e0b' : '#ef4444';
  const bg = status === 'saudavel' ? 'rgba(34,197,94,.1)' : status === 'atencao' ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';

  const crescDelta = comVendas.length >= 2
    ? `${(((comVendas[comVendas.length - 1].vendas - comVendas[0].vendas) / comVendas[0].vendas) * 100).toFixed(0)}%`
    : 'N/A';

  return {
    status, label, color, bg, score: total,
    detalhes: [
      { criterio: 'Conversão média', valor: `${convMedia.toFixed(1)}%`, pontos: pontosConv, maxPontos: 40 },
      { criterio: 'Crescimento vendas', valor: crescDelta, pontos: pontosCrescimento, maxPontos: 35 },
      { criterio: temFat ? '% Canal/Fat.' : 'Tendência vendas', valor: temFat ? `${pctMedia.toFixed(1)}%` : crescDelta, pontos: pontosPct, maxPontos: 25 },
    ],
  };
}

// ─── 2. PROJEÇÃO ─────────────────────────────────────────────────────────────
export interface Projecao {
  valor: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  variacao: number;
  baseadoEm: number;
  label: string;
}

export function calcProjecao(client: ClientData): Projecao {
  const comVendas = client.historico.filter(m => m.vendas > 0).slice(-3);
  if (!comVendas.length)
    return { valor: 0, tendencia: 'estavel', variacao: 0, baseadoEm: 0, label: 'Próx. mês' };

  const pesos = [1, 2, 3].slice(-comVendas.length);
  const somaPesos = pesos.reduce((a, p) => a + p, 0);
  const mediaSimples = comVendas.reduce((a, m) => a + m.vendas, 0) / comVendas.length;
  const mediaPonderada = comVendas.reduce((acc, m, i) => acc + m.vendas * pesos[i], 0) / somaPesos;
  const variacao = ((mediaPonderada - mediaSimples) / mediaSimples) * 100;
  const tendencia: 'alta' | 'baixa' | 'estavel' = variacao > 5 ? 'alta' : variacao < -5 ? 'baixa' : 'estavel';

  const ult = client.historico[client.historico.length - 1].chave;
  const [ano, mes] = ult.split('-').map(Number);
  const proxMes = mes === 12 ? 1 : mes + 1;
  const proxAno = mes === 12 ? ano + 1 : ano;
  const nomes = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return {
    valor: Math.round(mediaPonderada),
    tendencia, variacao,
    baseadoEm: comVendas.length,
    label: `${nomes[proxMes]}/${String(proxAno).slice(2)}`,
  };
}

// ─── 3. ROI ──────────────────────────────────────────────────────────────────
export interface RoiMesData {
  mesLabel: string;
  vendas: number;
  fee: number;
  verba: number;
  custoTotal: number;
  roi: number;
  roiPct: number;
  positivo: boolean;
}

export interface RoiSummary {
  meses: RoiMesData[];
  totalVendas: number;
  totalFee: number;
  totalVerba: number;
  totalCusto: number;
  roiTotal: number;
  roiTotalPct: number;
  mesesPositivos: number;
  mesesNegativos: number;
  status: 'positivo' | 'negativo' | 'neutro';
  temVerba: boolean;
}

export function calcRoi(client: ClientData, fee: number): RoiSummary {
  const temVerba = client.historico.some(m => m.verba > 0);
  const meses: RoiMesData[] = client.historico.map(m => {
    const custoTotal = fee + m.verba;
    const roi = m.vendas - custoTotal;
    const roiPct = custoTotal > 0 ? ((m.vendas / custoTotal) - 1) * 100 : 0;
    return { mesLabel: m.mes, vendas: m.vendas, fee, verba: m.verba, custoTotal, roi, roiPct, positivo: roi >= 0 };
  });

  const totalVendasCalc = meses.reduce((a, m) => a + m.vendas, 0);
  const totalFee = fee * meses.length;
  const totalVerba = meses.reduce((a, m) => a + m.verba, 0);
  const totalCusto = totalFee + totalVerba;
  const roiTotal = totalVendasCalc - totalCusto;
  const roiTotalPct = totalCusto > 0 ? ((totalVendasCalc / totalCusto) - 1) * 100 : 0;
  const mesesPositivos = meses.filter(m => m.positivo).length;

  return {
    meses, totalVendas: totalVendasCalc, totalFee, totalVerba, totalCusto,
    roiTotal, roiTotalPct,
    mesesPositivos, mesesNegativos: meses.length - mesesPositivos,
    status: roiTotal > 0 ? 'positivo' : roiTotal < 0 ? 'negativo' : 'neutro',
    temVerba,
  };
}

// ─── 4. RANKING ──────────────────────────────────────────────────────────────
export interface RankingItem {
  clientId: string;
  clientName: string;
  color: string;
  mensagens: number;
  conversao: number;
  vendas: number;
  eficiencia: number;
  quadrante: 'eficiente' | 'volume' | 'potencial' | 'revisar' | 'sem-dados';
}

function mediana(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function calcRanking(clients: ClientData[]): RankingItem[] {
  const items = clients.map(client => {
    const comDados = client.historico.filter(m => m.mensagens > 0);
    const ultimo = comDados[comDados.length - 1];
    if (!ultimo) {
      const comVendas = client.historico.filter(m => m.vendas > 0);
      const ult = comVendas[comVendas.length - 1];
      return {
        clientId: client.id, clientName: client.name, color: client.color,
        mensagens: 0, conversao: 0, vendas: ult?.vendas ?? 0, eficiencia: 0,
        semDados: true,
      };
    }
    return {
      clientId: client.id, clientName: client.name, color: client.color,
      mensagens: ultimo.mensagens, conversao: ultimo.conversao, vendas: ultimo.vendas,
      eficiencia: ultimo.mensagens > 0 ? ultimo.vendas / ultimo.mensagens : 0,
      semDados: false,
    };
  });

  const comDados = items.filter(i => !i.semDados);
  const medMsg = comDados.length ? mediana(comDados.map(i => i.mensagens)) : 0;
  const medConv = comDados.length ? mediana(comDados.map(i => i.conversao)) : 0;

  return items.map(item => ({
    clientId: item.clientId, clientName: item.clientName, color: item.color,
    mensagens: item.mensagens, conversao: item.conversao, vendas: item.vendas, eficiencia: item.eficiencia,
    quadrante: item.semDados ? 'sem-dados' :
      item.mensagens <= medMsg && item.conversao >= medConv ? 'eficiente' :
      item.mensagens > medMsg && item.conversao >= medConv ? 'volume' :
      item.mensagens <= medMsg && item.conversao < medConv ? 'potencial' :
      'revisar',
  } as RankingItem)).sort((a, b) => b.eficiencia - a.eficiencia);
}
