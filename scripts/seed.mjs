// Popula o Firestore com dados de exemplo para testar o dashboard.
//
// Antes de rodar:
// 1. No Console do Firebase > Configuracoes do projeto > Contas de servico,
//    gere uma chave privada e salve como "serviceAccountKey.json" na raiz do projeto.
// 2. Rode: npm run seed

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch {
  console.error(
    `Nao encontrei "serviceAccountKey.json" na raiz do projeto.\n` +
      'Gere uma chave em: Console do Firebase > Configuracoes do projeto > Contas de servico > Gerar nova chave privada.',
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const stores = [
  { id: 'loja-centro', name: 'Loja Centro', region: 'Sudeste', monthlyGoal: 80000 },
  { id: 'loja-norte', name: 'Loja Norte', region: 'Norte', monthlyGoal: 50000 },
  { id: 'loja-sul', name: 'Loja Sul', region: 'Sul', monthlyGoal: 65000 },
  { id: 'loja-leste', name: 'Loja Leste', region: 'Sudeste', monthlyGoal: 45000 },
  { id: 'loja-oeste', name: 'Loja Oeste', region: 'Centro-Oeste', monthlyGoal: 55000 },
];

const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];

function randomRevenue(goal) {
  const factor = 0.6 + Math.random() * 0.6;
  return Math.round(goal * factor);
}

async function seed() {
  const batch = db.batch();

  for (const store of stores) {
    const { id, ...data } = store;
    batch.set(db.collection('stores').doc(id), data);
  }

  for (const store of stores) {
    for (const month of months) {
      const resultId = `${store.id}_${month}`;
      batch.set(db.collection('salesResults').doc(resultId), {
        storeId: store.id,
        month,
        revenue: randomRevenue(store.monthlyGoal),
      });
    }
  }

  await batch.commit();
  console.log(`Seed concluido: ${stores.length} lojas e ${stores.length * months.length} resultados de vendas.`);
}

seed().catch((error) => {
  console.error('Falha ao popular o Firestore:', error);
  process.exit(1);
});
