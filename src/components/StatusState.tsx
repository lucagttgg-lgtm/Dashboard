import { AlertTriangle, Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">Carregando dados das lojas...</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center text-slate-500">
      <AlertTriangle className="text-rose-500" size={28} />
      <p className="text-sm font-medium text-slate-700">Não foi possível carregar os dados</p>
      <p className="max-w-md text-xs text-slate-500">{message}</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center text-slate-500">
      <p className="text-sm font-medium text-slate-700">Nenhum dado encontrado ainda</p>
      <p className="max-w-md text-xs text-slate-500">
        Cadastre lojas e resultados de vendas nas coleções "stores" e "salesResults" do Firestore, ou rode{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5">npm run seed</code> para carregar dados de exemplo.
      </p>
    </div>
  );
}
