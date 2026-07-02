# Painel de Clientes

Dashboard de acompanhamento de resultados por cliente (contas de anúncio Meta): vendas,
conversão, ROI, ranking de eficiência e feedback automático — construído com React + TypeScript
+ Vite, Tailwind CSS, Recharts, Framer Motion (`motion`) e Firebase (Firestore).

Sem login (uso pessoal), sem IA — o Feedback Hub usa regras simples em código, não LLM.

## Stack

- React 19 + TypeScript, Vite 6, Tailwind CSS 4
- Recharts (gráficos), lucide-react (ícones), motion (animações)
- Firebase Firestore (histórico mensal e anotações em tempo real)
- Graph API do Meta (Facebook/Instagram Ads) para métricas de anúncio

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- Conta no [Firebase](https://console.firebase.google.com/)
- Um token de acesso da [Graph API do Meta](https://developers.facebook.com/) com permissão `ads_read`

## 1. Configurar o Firebase

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2. Em **Compilação > Firestore Database**, crie o banco (modo produção).
3. Publique as regras do arquivo [firestore.rules](firestore.rules) na aba **Regras**.
   ⚠️ Essas regras ficam abertas (sem autenticação) — ok para uso pessoal; adicione Firebase Auth
   antes de compartilhar o link com terceiros.
4. Em **Configurações do projeto > Seus apps**, adicione um app Web e copie as credenciais.

## 2. Configurar localmente

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com:
- `VITE_FIREBASE_*`: credenciais do app Web do Firebase
- `VITE_META_ACCESS_TOKEN`: token da Graph API do Meta (ver seção abaixo)

## 3. Rodar

```bash
npm run dev
```
Acesse http://localhost:3000

## Clientes cadastrados

Os 24 clientes (nome, cor, conta de anúncio Meta) estão em
[src/data/clients.ts](src/data/clients.ts). Cada cliente tem um `fee` (mensalidade de gestão)
usado no cálculo de ROI — **está zerado para todos, ajuste com os valores reais**.

Ficou pendente um cliente ("Menina Bonita Magazine") cujo ID do Meta veio incorreto na lista
original — o arquivo já tem um modelo comentado no final mostrando como adicioná-lo.

Para adicionar/editar um cliente, edite o array `CLIENTS_CONFIG` — não precisa mexer em mais
nada, o resto do app lê esse arquivo automaticamente.

## Lançando resultados mensais

O ROI, Health Score, Ranking e Feedback Hub usam dados **lançados manualmente todo mês** (vendas,
conversão, ticket médio, verba investida) — não vêm do Meta Ads. Use a tela **"Lançar Resultado"**
no menu para registrar o mês de cada cliente; os dados ficam salvos no Firestore
(coleção `clientHistorico`) e atualizam o dashboard em tempo real.

## Meta Ads (Graph API)

A aba "Meta Ads" (global e dentro do detalhe de cada cliente) busca gasto, mensagens, alcance e
campanhas diretamente da Graph API do Meta, usando o `metaAccountId` de cada cliente em
`clients.ts` e o token em `VITE_META_ACCESS_TOKEN`.

**Importante:** esse token fica exposto no bundle do navegador (chamada é feita direto do
frontend, igual ao protótipo original). Funciona para uso pessoal, mas antes de expor a outras
pessoas o recomendado é mover essas chamadas para um backend (função serverless) que:
- guarda o token no servidor (nunca no cliente);
- faz cache das respostas por alguns minutos;
- evita rate-limit/bloqueio da conta do Meta por chamadas repetidas.

Isso é o próximo passo natural para "garantir 100% os resultados corretos sem risco de bloqueio".

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — serve o build localmente
- `npm run lint` — checagem de tipos (`tsc --noEmit`)

## Estrutura

```
src/
  data/clients.ts          identidade dos clientes (nome, cor, fee, conta Meta)
  services/
    clientDataService.ts   histórico mensal + anotações no Firestore
    metaService.ts         chamadas à Graph API do Meta
  hooks/
    useClients.ts          combina clients.ts + histórico do Firestore
    useClientNotes.ts       anotações de feedback por cliente
  components/
    ui/                    StatCard, ChartCard, HealthBadge, MonthFilter, ProjecaoCard, RoiPanel
    views/
      HomeView             KPIs globais, alertas, lista de clientes
      ClientDetailView     resultados + ROI + Meta Ads por cliente
      RankingView          quadrantes de eficiência (mensagens x conversão)
      FeedbackView         Feedback Hub (regras automáticas, sem IA)
      MetaAdsView          Meta Ads global (seleciona qualquer cliente)
      DataEntryView        lançamento mensal de vendas/conversão/verba
```

## Deploy (Vercel)

O build (`dist/`) é estático. Configure as variáveis de ambiente (`VITE_FIREBASE_*`,
`VITE_META_ACCESS_TOKEN`) em Vercel → Settings → Environment Variables, senão o dashboard carrega
em branco/com erro.
