# Dashboard de Lojas

Dashboard de resultados de vendas por loja: faturamento, metas e evolução mensal.
Construído com React + TypeScript + Vite, Tailwind CSS, Recharts e Firebase (Firestore).

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Recharts (gráficos)
- Firebase Firestore (dados em tempo real)
- lucide-react (ícones)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior instalado
- Uma conta no [Firebase](https://console.firebase.google.com/)

## 1. Criar o projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2. Em **Compilação > Firestore Database**, clique em "Criar banco de dados" (modo produção).
3. Em **Configurações do projeto > Seus apps**, adicione um app Web e copie as credenciais.
4. Publique as regras do arquivo [firestore.rules](firestore.rules) (aba **Regras** do Firestore).

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do seu app Web do Firebase (`VITE_FIREBASE_*`).

## 3. Popular dados de exemplo (opcional)

1. Em **Configurações do projeto > Contas de serviço**, clique em "Gerar nova chave privada" e salve o
   arquivo como `serviceAccountKey.json` na raiz do projeto (já está no `.gitignore`, não será commitado).
2. Rode:

```bash
npm run seed
```

Isso cria 5 lojas de exemplo e 6 meses de resultados de vendas nas coleções `stores` e `salesResults`.

Estrutura dos documentos:

```
stores/{storeId}
  name: string
  region: string
  monthlyGoal: number

salesResults/{resultId}
  storeId: string   // referencia o id do documento em "stores"
  month: string      // formato "YYYY-MM"
  revenue: number
```

Você também pode cadastrar esses dados manualmente pelo Console do Firebase.

## 4. Rodar o dashboard

```bash
npm run dev
```

Acesse http://localhost:3000

## Scripts disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — build de produção (pasta `dist`)
- `npm run preview` — serve o build de produção localmente
- `npm run lint` — checagem de tipos (`tsc --noEmit`)
- `npm run seed` — popula o Firestore com dados de exemplo

## Estrutura do projeto

```
src/
  components/   componentes de UI (cards, gráficos, tabela, estados)
  config/       inicialização do Firebase
  hooks/        useDashboardData: busca e agrega os dados do Firestore
  services/       assinaturas (onSnapshot) das coleções do Firestore
  types.ts      tipos de domínio (Store, SalesResult, StoreSummary...)
  utils.ts      formatação de moeda e datas
```

## Deploy

O build gerado em `dist/` é estático e pode ser publicado em qualquer host (Vercel, Netlify, Firebase
Hosting etc.). Lembre-se de configurar as variáveis `VITE_FIREBASE_*` também no ambiente de produção.
