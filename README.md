# Painel de Clientes

<!-- deploy trigger -->

Dashboard de acompanhamento de resultados por cliente (contas de anúncio Meta): vendas,
conversão, ROI, ranking de eficiência e feedback automático — construído com React + TypeScript
+ Vite, Tailwind CSS, Recharts, Framer Motion (`motion`).

Sem login (uso pessoal), sem IA — o Feedback Hub usa regras simples em código, não LLM.
Sem Firebase por enquanto: os dados lançados ficam salvos no **localStorage do navegador**
(veja a seção abaixo).

## Stack

- React 19 + TypeScript, Vite 6, Tailwind CSS 4
- Recharts (gráficos), lucide-react (ícones), motion (animações)
- Graph API do Meta (Facebook/Instagram Ads) para métricas de anúncio

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- (Opcional) um token de acesso da [Graph API do Meta](https://developers.facebook.com/) com
  permissão `ads_read`, para a aba "Meta Ads" funcionar

## Configurar e rodar

```bash
npm install
cp .env.example .env.local   # opcional — só necessário para a aba Meta Ads
npm run dev
```
Acesse http://localhost:3000

## Onde ficam os dados (sem Firebase)

O histórico mensal (vendas, conversão, ticket médio, verba) e as anotações de feedback lançados
pela tela **"Lançar Resultado"** ficam salvos no **localStorage do navegador** — funcionam sem
nenhuma configuração, mas:

- ficam presos a um navegador/dispositivo (não sincronizam entre computadores ou pessoas);
- limpar os dados do navegador apaga o que foi lançado.

Isso é intencional para colocar o dashboard no ar rapidamente, sem precisar configurar um banco de
dados agora. A lógica está isolada em [src/services/localStore.ts](src/services/localStore.ts) —
quando você quiser dados compartilhados/em tempo real (ex: Firebase Firestore de novo, ou outro
banco), é só reimplementar esse arquivo mantendo as mesmas funções; nenhuma view precisa mudar.

## Clientes cadastrados

Os 24 clientes (nome, cor, conta de anúncio Meta) estão em
[src/data/clients.ts](src/data/clients.ts). Cada cliente tem um `fee` (mensalidade de gestão)
usado no cálculo de ROI — **está zerado para todos, ajuste com os valores reais**.

Ficou pendente um cliente ("Menina Bonita Magazine") cujo ID do Meta veio incorreto na lista
original — o arquivo já tem um modelo comentado no final mostrando como adicioná-lo.

## Meta Ads (Graph API) — opcional

A aba "Meta Ads" (global e dentro do detalhe de cada cliente) busca gasto, mensagens, alcance e
campanhas diretamente da Graph API do Meta, usando o `metaAccountId` de cada cliente em
`clients.ts` e o token em `VITE_META_ACCESS_TOKEN`. Sem o token configurado, o resto do dashboard
funciona normalmente — só essa aba mostra erro.

**Importante:** esse token fica exposto no bundle do navegador (chamada é feita direto do
frontend). Funciona para uso pessoal, mas antes de expor a outras pessoas o recomendado é mover
essas chamadas para um backend (função serverless) que guarda o token no servidor, faz cache das
respostas e evita rate-limit/bloqueio da conta no Meta.

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
    localStore.ts          histórico mensal + anotações (localStorage do navegador)
    metaService.ts         chamadas à Graph API do Meta
  hooks/
    useClients.ts          combina clients.ts + histórico salvo localmente
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

O build (`dist/`) é estático e não precisa de nenhuma variável de ambiente para rodar (a não ser
que você queira a aba Meta Ads funcionando — nesse caso configure `VITE_META_ACCESS_TOKEN` em
Vercel → Settings → Environment Variables).
