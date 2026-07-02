import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SalesResult, Store } from '../types';

export function subscribeToStores(
  onData: (stores: Store[]) => void,
  onError: (error: Error) => void,
) {
  const storesQuery = query(collection(db, 'stores'));
  return onSnapshot(
    storesQuery,
    (snapshot) => {
      const stores = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Store, 'id'>),
      }));
      onData(stores);
    },
    onError,
  );
}

export function subscribeToSalesResults(
  onData: (results: SalesResult[]) => void,
  onError: (error: Error) => void,
) {
  const resultsQuery = query(collection(db, 'salesResults'));
  return onSnapshot(
    resultsQuery,
    (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<SalesResult, 'id'>),
      }));
      onData(results);
    },
    onError,
  );
}
