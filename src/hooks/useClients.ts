import { useEffect, useState } from 'react';
import { CLIENTS_CONFIG } from '../data/clients';
import { subscribeToHistorico } from '../services/localStore';
import { ClientData, MonthData } from '../types';

export function useClients() {
  const [historico, setHistorico] = useState<Record<string, MonthData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToHistorico(data => {
      setHistorico(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const clients: ClientData[] = CLIENTS_CONFIG.map(config => ({
    ...config,
    historico: historico[config.id] ?? [],
  }));

  return { clients, loading, error: null as string | null };
}
