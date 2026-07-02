import { useCallback, useState } from 'react';
import { Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { ClientData } from '../../types';
import { FeedbackData, getAccountFeedbackData } from '../../services/metaService';

interface Props {
  clients: ClientData[];
}

type ClientState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: FeedbackData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

function buildMessage(data: FeedbackData): string {
  const dateRange = `(${fmtDate(data.dateStart)} a ${fmtDate(data.dateStop)})`;
  const lines: string[] = [
    'Olá! Passando para mostrar os investimentos e resultados desses últimos 7 dias.',
    dateRange,
    '🔵No Meta🔵',
    `Total Investido: R$ ${fmtBRL(data.totalSpend)}`,
  ];

  if (data.mensagem) {
    lines.push(`💵 Investimento Mensagem: R$ ${fmtBRL(data.mensagem.spend)}`);
    lines.push(`🎯 Mensagens: ${fmtNumber(data.mensagem.mensagens)}`);
    lines.push(`💲 Custo por mensagem: R$ ${fmtBRL(data.mensagem.custoMensagem)}`);
  }

  if (data.secundaria) {
    const sec = data.secundaria;
    if (sec.tipo === 'impulsionamento') {
      lines.push(`💵 Investimento Impulsionamento: R$ ${fmtBRL(sec.spend)}`);
      lines.push(`👀 Visitas ao Perfil: ${fmtNumber(sec.visitasPerfil)}`);
      lines.push(`💲 Custo por Visita: R$ ${fmtBRL(sec.custoVisita)}`);
    } else {
      lines.push(`💵 Investimento Reconhecimento: R$ ${fmtBRL(sec.spend)}`);
      lines.push(`👀 Pessoas Alcançadas: ${fmtNumber(sec.pessoasAlcancadas)}`);
    }
  }

  return lines.join('\n');
}

export function MetaFeedbackView({ clients }: Props) {
  const clientOptions = clients.filter(c => !!c.metaAccountId);

  const [states, setStates] = useState<Record<string, ClientState>>(() =>
    Object.fromEntries(clientOptions.map(c => [c.id, { status: 'idle' }])),
  );
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);

  const setClientState = useCallback((id: string, state: ClientState) => {
    setStates(prev => ({ ...prev, [id]: state }));
  }, []);

  const fetchAll = useCallback(async () => {
    setRunning(true);
    setStates(Object.fromEntries(clientOptions.map(c => [c.id, { status: 'loading' }])));

    await Promise.all(
      clientOptions.map(async client => {
        try {
          const data = await getAccountFeedbackData(client.metaAccountId!);
          setClientState(client.id, data ? { status: 'done', data } : { status: 'empty' });
        } catch (err) {
          setClientState(client.id, { status: 'error', message: err instanceof Error ? err.message : 'Erro desconhecido' });
        }
      }),
    );

    setRunning(false);
  }, [setClientState, clientOptions]);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
  };

  const doneCount = clientOptions.filter(c => states[c.id]?.status === 'done').length;
  const emptyCount = clientOptions.filter(c => states[c.id]?.status === 'empty').length;
  const errorCount = clientOptions.filter(c => states[c.id]?.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedback Meta (últimos 7 dias)</h1>
          <p className="text-sm text-gray-500 mt-1">Gera as mensagens de resultado dos últimos 7 dias para todos os clientes, prontas para copiar e enviar.</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Buscando…' : 'Gerar Feedbacks'}
        </button>
      </div>

      {!running && doneCount > 0 && (
        <div className="flex gap-4 text-xs">
          <span className="text-green-400 font-bold">{doneCount} gerados</span>
          {emptyCount > 0 && <span className="text-gray-500 font-bold">{emptyCount} sem gasto</span>}
          {errorCount > 0 && <span className="text-red-400 font-bold">{errorCount} com erro</span>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {clientOptions.map(client => {
          const state = states[client.id] ?? { status: 'idle' as const };
          const message = state.status === 'done' ? buildMessage(state.data) : '';

          return (
            <div key={client.id} className="bg-brand-medium border border-brand-light rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: client.color }} />
                  <MessageSquare className="w-4 h-4 text-brand-purple shrink-0" />
                  <span className="text-sm font-bold text-white truncate">{client.name}</span>
                </div>
                {state.status === 'done' && (
                  <button
                    onClick={() => copyText(client.id, message)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-light hover:bg-brand-light/80 text-xs font-bold transition-all shrink-0"
                  >
                    {copied[client.id]
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copiado!</span></>
                      : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-300">Copiar</span></>}
                  </button>
                )}
              </div>

              {state.status === 'idle' && <p className="text-xs text-gray-600 italic">Clique em "Gerar Feedbacks" para buscar.</p>}
              {state.status === 'loading' && (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 bg-brand-light rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
                  ))}
                </div>
              )}
              {state.status === 'empty' && <p className="text-xs text-gray-500 italic">Sem gasto nos últimos 7 dias.</p>}
              {state.status === 'error' && <p className="text-xs text-red-400">Erro: {state.message}</p>}
              {state.status === 'done' && (
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-brand-dark/50 rounded-lg p-3 border border-brand-light">
                  {message}
                </pre>
              )}
            </div>
          );
        })}

        {clientOptions.length === 0 && <p className="text-sm text-gray-600">Nenhum cliente com conta de anúncio cadastrada.</p>}
      </div>
    </div>
  );
}
