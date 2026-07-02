import { collection, doc, onSnapshot, query, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MonthData } from '../types';

interface HistoricoDoc extends MonthData {
  clientId: string;
}

const COLLECTION = 'clientHistorico';

export function subscribeToHistorico(
  onData: (byClient: Record<string, MonthData[]>) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, COLLECTION)),
    snapshot => {
      const byClient: Record<string, MonthData[]> = {};
      snapshot.docs.forEach(d => {
        const data = d.data() as HistoricoDoc;
        const { clientId, ...month } = data;
        if (!byClient[clientId]) byClient[clientId] = [];
        byClient[clientId].push(month);
      });
      Object.values(byClient).forEach(months => months.sort((a, b) => a.chave.localeCompare(b.chave)));
      onData(byClient);
    },
    onError,
  );
}

export async function addOrUpdateMonthData(clientId: string, data: MonthData): Promise<void> {
  const docId = `${clientId}_${data.chave}`;
  await setDoc(doc(db, COLLECTION, docId), { clientId, ...data });
}

const NOTES_COLLECTION = 'clientNotes';

export function subscribeToClientNotes(
  onData: (byClient: Record<string, string>) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, NOTES_COLLECTION)),
    snapshot => {
      const byClient: Record<string, string> = {};
      snapshot.docs.forEach(d => {
        byClient[d.id] = (d.data().feedback as string) ?? '';
      });
      onData(byClient);
    },
    onError,
  );
}

export async function updateClientNote(clientId: string, feedback: string): Promise<void> {
  await setDoc(doc(db, NOTES_COLLECTION, clientId), { feedback });
}
