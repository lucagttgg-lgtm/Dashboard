import { useEffect, useState } from 'react';
import { subscribeToClientNotes } from '../services/localStore';

export function useClientNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = subscribeToClientNotes(setNotes);
    return unsubscribe;
  }, []);

  return notes;
}
