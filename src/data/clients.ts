import { ClientData } from '../types';

// Identidade dos clientes (nome, cor, fee de gestão, conta de anúncio Meta).
// O histórico mensal (vendas, conversão, verba etc.) NÃO fica aqui — é lançado
// pela tela "Lançar Resultado" e vive no localStorage do navegador (veja
// services/localStore.ts). Trocar para um banco real (Firebase, etc.) depois
// é só reimplementar esse arquivo mantendo a mesma assinatura de funções.
//
// fee: valor mensal cobrado do cliente pela gestão (usado no cálculo de ROI).
//      Está como 0 para todos — ajuste cada um abaixo com o valor real.
//
// Para adicionar um novo cliente, copie o modelo comentado no final do arquivo.

export const CLIENTS_CONFIG: Omit<ClientData, 'historico'>[] = [
  { id: 'carinha-de-anjo',        name: 'CA - Carinha de Anjo',                          color: '#7c3aed', fee: 0, metaAccountId: 'act_3790847197724661' },
  { id: 'usaflex-plaza-sul',      name: 'CA01 - Usaflex Plaza Sul',                       color: '#3b82f6', fee: 0, metaAccountId: 'act_2143069829819848' },
  { id: 'rockpoint',              name: 'CA02 - RockPoint',                               color: '#10b981', fee: 0, metaAccountId: 'act_2010622213141951' },
  { id: 'uza-shoes-cascavel',     name: 'CA - Uza Shoes Cascavel',                         color: '#ef4444', fee: 0, metaAccountId: 'act_1497602305263041' },
  { id: 'love-shoes',             name: 'CA - LOVE SHOES',                                 color: '#f59e0b', fee: 0, metaAccountId: 'act_327368019132662'  },
  { id: 'rockpoint-ads-on',       name: '[ON] RockPoint Ads',                              color: '#ec4899', fee: 0, metaAccountId: 'act_514835263002254'  },
  { id: 'rockpoint-ads-off-bck',  name: '[OFF] ADS RockPoint Bck (sem método de pagamento)', color: '#06b6d4', fee: 0, metaAccountId: 'act_310335547366802'  },
  { id: 'marina-moulin',          name: 'CA01 - Marina Moulin',                            color: '#8b5cf6', fee: 0, metaAccountId: 'act_693664311822663'  },
  { id: 'love-shoes-kids',        name: 'Love Shoes Kids',                                 color: '#84cc16', fee: 0, metaAccountId: 'act_1302116720445122' },
  { id: 'clube-melissa',          name: 'CA - Clube Melissa',                              color: '#f97316', fee: 0, metaAccountId: 'act_943395840538554'  },
  { id: 'clube-melissa-shopping', name: 'Clube Melissa SHOPPING',                          color: '#6366f1', fee: 0, metaAccountId: 'act_545485038045979'  },
  { id: 'clube-melissa-ipa',      name: 'Clube Melissa IPA (MCP não habilitado ainda)',    color: '#14b8a6', fee: 0, metaAccountId: 'act_897413265614825'  },
  { id: 'mahana-sandalhas',       name: 'CA - MAHANA SANDALHAS',                          color: '#a78bfa', fee: 0, metaAccountId: 'act_8832559756796958' },
  { id: 'clube-melissa-teo',      name: 'Clube Melissa TEO',                               color: '#fb7185', fee: 0, metaAccountId: 'act_872077818230517'  },
  { id: 'urbana',                 name: 'CA - Urbana',                                     color: '#22c55e', fee: 0, metaAccountId: 'act_1231918308487819' },
  { id: 'anacapri-es',            name: 'CA01 - Anacapri ES Vitória & Vila Velha',         color: '#eab308', fee: 0, metaAccountId: 'act_747512548198128'  },
  { id: 'melissa-joao-cachoeira', name: 'CA01 - Melissa João Cachoeira',                   color: '#0ea5e9', fee: 0, metaAccountId: 'act_731368023341850'  },
  { id: 'patricia-costa-calcados',name: 'CA - Patrícia Costa Calçados CL',                 color: '#d946ef', fee: 0, metaAccountId: 'act_1275679377741222' },
  { id: 'usaflex-mineiros',       name: 'CA - Usaflex Mineiros',                          color: '#2dd4bf', fee: 0, metaAccountId: 'act_1639815984011278' },
  { id: 'renatha-barbosa',        name: 'CA - Renatha Barbosa C.',                         color: '#fb923c', fee: 0, metaAccountId: 'act_2180868542717263' },
  { id: 'bottero-passeio-aguas',  name: 'CA01 - Bottero Passeio das Aguas',                color: '#4ade80', fee: 0, metaAccountId: 'act_2379872029146176' },
  { id: 'luxxx-calcados',         name: 'CA01 - LUXXX Calçados (Loja física)',            color: '#c084fc', fee: 0, metaAccountId: 'act_959713943220905'  },
  { id: 'conta-sem-nome',         name: '(sem nome, sem método de pagamento)',            color: '#94a3b8', fee: 0, metaAccountId: 'act_819307427528858'  },
  { id: 'rz-sapataria',           name: 'CA01 - RZ Sapataria',                             color: '#f472b6', fee: 0, metaAccountId: 'act_1197899912321006' },

  // Modelo para adicionar um novo cliente (ex: o que ficou pendente de confirmação):
  // { id: 'menina-bonita-magazine', name: 'CA - Menina Bonita Magazine', color: '#60a5fa', fee: 0, metaAccountId: 'act_XXXXXXXXXXXXXXX' },
];
