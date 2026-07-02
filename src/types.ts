export interface MonthData {
  mes: string;
  chave: string;
  vendas: number;
  faturamentoLoja: number;
  conversao: number;
  mensagens: number;
  qtdVendas: number;
  ticketMedio: number;
  pctAureFat: number;
  verba: number;
}

export interface ClientData {
  id: string;
  name: string;
  color: string;
  fee: number;
  metaAccountId?: string;
  historico: MonthData[];
}

export type ActiveView =
  | { type: 'home' }
  | { type: 'ranking' }
  | { type: 'feedback' }
  | { type: 'meta-ads' }
  | { type: 'data-entry' }
  | { type: 'client'; clientId: string };

export const EMPTY_MONTH: MonthData = {
  mes: '',
  chave: '',
  vendas: 0,
  faturamentoLoja: 0,
  conversao: 0,
  mensagens: 0,
  qtdVendas: 0,
  ticketMedio: 0,
  pctAureFat: 0,
  verba: 0,
};
