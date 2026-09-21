# 🏗️ CostBase

> **O CostBase não é um Excel na web. É a fonte histórica confiável dos custos da construtora.**

Plataforma SaaS de Inteligência Histórica de Custos para Construção Civil. Primeiro cliente: Plano & Plano.
Primeiro caso de uso: Cesta Básica + cálculo do índice próprio **ICPP-SP** + comparação com INCC · ICC-SP · IPCA.

---

## 📐 Princípios não-negociáveis

1. **Identidade permanente** — cada material/serviço recebe um ID canônico único. Descrições mudam; a identidade nunca muda.
2. **3 camadas de dados (sem exceção):**
   - **Raw / Bronze** — arquivos e células preservados exatamente como vieram do Excel (`raw_row_json`, `hash_arquivo`).
   - **Canonical** — itens canônicos, aliases históricos, preços mês-a-mês.
   - **Calculated** — pesos versionados, Cesta, ICPP, resultados congelados por competência.
3. **Multiempresa desde o dia 0.** Toda tabela tem `company_id`; todo `UNIQUE` e todo índice inclui `company_id`.
4. **Metodologia versionada.** Nenhuma fórmula do ICPP-SP é hardcoded. Toda regra fica em `icpp_methodologies.regras_* JSONB` e pode mudar no futuro sem quebrar o passado.
5. **Auditoria total.** Toda alteração sensível vira linha em `audit_logs` (usuário · data · ação · antes · depois).
6. **Nenhuma heurística sem validação.** PV1–PV10 são as 10 perguntas do dono do processo; antes de respondidas, o motor de cálculo fica como placeholder.

---

## 🧩 Estrutura do monorepo

```
cesta basica app/
├── apps/
│   ├── backend/                       NestJS 10 + Prisma ORM + PostgreSQL 16
│   │   ├── prisma/
│   │   │   ├── schema.prisma          3 camadas + RLS multiempresa
│   │   │   └── seed.ts                Plano&Plano + Alex demo
│   │   └── src/
│   │       ├── auth/                  JWT · Auth guard · CompanyContext
│   │       ├── prisma/                PrismaService.scoped(companyId)
│   │       ├── common/middleware/     CompanyContextMiddleware
│   │       ├── audit/                 AuditService global
│   │       └── (items | periods | imports | methodology | indexes | icpp)
│   │
│   └── frontend/                      Next.js 14 · App Router · Tailwind + shadcn/ui
│       └── src/
│           ├── app/                   Páginas do menu (Início, Competências, …)
│           ├── components/
│           │   ├── layout/            AppLayout · AppNav · AppLogo
│           │   ├── providers/         Theme · Auth
│           │   ├── auth/              LoginPage
│           │   └── ui/                shadcn (button, card, input, badge…)
│           └── lib/                   utils.ts (fmtBRL, fmtPct, fmtPP, varClass)
│
├── packages/
│   └── shared/src/index.ts            Tipos + enums PV1–PV10 compartilhados
│
├── docker-compose.yml                 PostgreSQL 16 + volume persistente
├── .env.example                       Copiar → .env antes de rodar
└── package.json                       Workspaces + scripts root
```

---

## 🗄️ Banco de dados — 3 camadas

| Camada      | Tabelas principais                                                                 |
|-------------|-------------------------------------------------------------------------------------|
| **Raw**     | `imports` · `import_rows` (com `raw_row_json` completo) · `matching_reviews`          |
| **Canonical** | `companies` · `users` · `categories` · `families` · `canonical_items` · `item_aliases` · `periods` · `item_prices` |
| **Calculated** | `icpp_methodologies` · `basket_weights` · `icpp_results` · `category_results` · `external_indexes` · `external_index_values` |
| Audit       | `audit_logs` captura tudo.                                                          |

**Índice do Prisma:** [apps/backend/prisma/schema.prisma](file:///C:/Users/alex.simonis/Documents/cesta%20basica%20app/apps/backend/prisma/schema.prisma)

---

## 🚀 Primeira execução local (5 passos)

Requisitos: **Node ≥ 20**, **Docker** (para o Postgres).

```bash
# 1. Instalar dependências do monorepo
npm install

# 2. Copiar env (não commitar o .env!)
cp .env.example .env

# 3. Subir o PostgreSQL via Docker
npm run db:up       # alias: docker compose up -d
# Aguarde ~5 s; o container tem healthcheck.

# 4. Gerar client Prisma + criar banco + rodar migrations + seed
npm run prisma:generate
npm run prisma:migrate
npm run seed
#
#  Login demo pronto:   alex@planoaplano.com.br  /  demo1234

# 5. Subir backend + frontend em paralelo
npm run dev
#
#   Frontend: http://localhost:3000     (Next.js 14)
#   Backend:  http://localhost:3001/api (NestJS)
#   Swagger:  http://localhost:3001/api/docs
#   Prisma Studio (opcional): npm run prisma:studio
```

Para desligar tudo:
```bash
# Ctrl+C no terminal do npm run dev
npm run db:down
```

---

## 🧪 Dados carregados pelo `seed.ts`

- 🏢 Empresa **Plano & Plano** (`comp_plano_plano_001`)
- 👤 Usuário **Alex Simonis** (OWNER) — senha demo `demo1234`
- 📦 **16 categorias** + **24 famílias** da Cesta Básica (Bloco, Concreto, Aço, Instalações, MO Alvenaria, Elevadores, Esquadrias Alumínio, …)
- 📈 **3 índices** externos (INCC · ICC-SP · IPCA)
- 📅 **15 competências** (AGO/25 → OUT/26) — status placeholder
- 📐 **Metodologia V1** → ⚠️ todos os campos `regras_* = null` (intencional)
- 🧱 **2 itens canônicos exemplo** com aliases históricos:
  - `MAT-ESQ-0038` — Janela de correr alumínio 2F 1,50 × 1,21 (7 aliases)
  - `MAT-CON-0012` — Concreto usinado fck = 30 MPa (4 aliases)
- 📜 `audit_logs` com a criação da Metodologia V1 e status PV1–PV10.

---

## ✅ Critério principal de aceite

> O CostBase precisa reproduzir os resultados oficiais do Excel, competência por competência,
> dentro da tolerância definida, antes de considerarmos o motor do ICPP-SP validado.

**Como validar no futuro:**

1. Você me fornece **2 competências consecutivas** (ex.: AGO/26 + SET/26) **+** as 10 respostas PV1–PV10.
2. Configuramos `icpp_methodologies.regras_*` com as regras validadas.
3. Importamos os 2 meses → rodamos matching → fechamos SET/26.
4. Rodamos cálculo do ICPP → comparamos `icpp_results.numero_indice`, `variacao_mensal`, `acumulado_12m`, `acumulado_24m` e `category_results.*` linha-a-linha com o Excel.
5. Tudo dentro da tolerância = motor validado. Senão = ajustes na engine até fechar.

---

## ❓ PV1–PV10 · Pendências de validação com o dono do processo

| # | Questão | Estado no banco |
|---|---|---|
| **PV1** | Mês-base `t₀` de definição dos pesos (orçamento original? jan/25?) | `regra_pesos_json.periodo_base_competencia` = null |
| **PV2** | Peso usa Preço Total Global OU Quantidade × Preço Unitário? | `regra_pesos_json.fonte` = null |
| **PV3** | Item sem preço no mês: mantém igual / exclui / interpola? | `regra_variacao_item_json.tratar_sem_preco` = null |
| **PV4** | Item entra ou sai da cesta: como redistribuir pesos? | `regra_itens_novos_json / regra_itens_saida_json` = null |
| **PV5** | Δ(i,t) usa Preço Unitário ou Preço Total Global? | `regra_variacao_item_json.preco_referencia` = null |
| **PV6** | Número índice `I(t_base) = 100` em qual competência? | `regra_mes_base_num_indice_json.competencia_base` = null |
| **PV7** | Coluna "NÃO UTILIZAR": itens são excluídos do denominador? | `regra_pesos_json.itens_coluna_nao_utilizar_sao_excluidos` = null |
| **PV8** | Diferença entre Var. acumulada item × acumulada custo total (col F vs G) | `regra_variacao_item_json.coluna_delta_acum_item / custo_total` = null |
| **PV9** | MO ALV + ESTRUTURAL / INSTALAÇÕES + barramento + cabos: categorias fixas ou agregação? | Modelagem de `categories` + `families` |
| **PV10** | Pesos recalculados anualmente ou fixos por metodologia? | `regra_pesos_json.recalcular_ano_a_ano` = null |

**Regra de ouro:** Nenhuma lógica de cálculo do ICPP-SP é implementada antes que as respostas acima sejam validadas e documentadas. A única exceção é o motor de cálculo genérico que consome `icpp_methodologies.regras_*` e grava resultados congelados com `hash_calculo` + `versao_motor`.

---

## 🧠 Arquitetura do Matching de Itens (Sprints 4–5)

3 estágios, conservadores (evitar falsos positivos):

| Estágio | Método | Confiança | Ação |
|---------|--------|-----------|------|
| **1** | Match exato por `item_aliases.alias_hash` (descrição normalizada) | 100% | Auto-match |
| **2** | TF-IDF + similaridade cosseno + características parseadas (dimensões, material, modelo) | 95–100% / 75–94% / <75% | Auto / Revisão / Provável novo |
| **3** | Embeddings BERTimbau ou text-embedding-3-small + decomposição da descrição em `caracteristicas_json` | Melhora casos limites | Reduz revisões humanas |

Limiares padrão (configuráveis): **≥95% auto · 75–94% revisão humana · <75% item novo**.

---

## 🗺️ Backlog das próximas Sprints (ordem 49 do prompt)

| Sprint | Módulo | O que entrega |
|---|---|---|
| ✅ **Sprint 0** | Fundação | Monorepo · Postgres · Prisma · Nest + JWT · Multiempresa · 3 camadas · Auditoria · Metodologia V1 placeholder · 9 telas skeleton · Seed Plano&Plano |
| ⏭️ **Sprint 1** | Competências | CRUD de períodos + workflow status (DRAFT → CLOSED) + fechamento com auditoria |
| ⏭️ **Sprint 2** | Hierarquia | Categorias · Famílias · Itens Canônicos · Aliases CRUD + busca inteligente por aliases |
| ⏭️ **Sprint 3** | Importação | Upload XLSX/CSV + preview + mapeamento dinâmico de colunas |
| ⏭️ **Sprint 4–5** | Matching | Estágios 1 + 2 (hash + TF-IDF) + tela Revisão (Confirmar / Buscar outro / Criar novo / Ignorar) |
| ⏭️ **Sprint 6** | Histórico | `item_prices` populado + Página individual do Item Canônico (KPIs + gráfico + descrições mês-a-mês) |
| ⏭️ **Sprint 7** | Índices | CRUD de valores mensais de INCC · ICC-SP · IPCA |
| ⏭️ **Sprint 8** | Metodologia | Tela de configuração da V1 + Basket Weights + persistência das PV1–PV10 |
| ⏭️ **Sprint 9** | Motor ICPP | Engine que lê regras JSONB e gera `icpp_results` · `category_results` + hash_calculo · versao_motor |
| ⏭️ **Sprint 10** | 🔐 **Validação Excel** | Rodar AGO/26 + SET/26 e fechar exato com Excel. Critério principal de aceite. |
| ⏭️ **Sprint 11–13** | Dashboard + Drill-down + Exportação | Cards · Gráficos · "Entender composição" · API Power BI · XLSX/CSV · Auditoria UI |

---

## 🔌 Futuro (já preparado arquiteturalmente)

- API REST + OpenAPI · consumo Power BI: `GET /items`, `/items/{id}/history`, `/icpp`, `/icpp/{period}`, `/categories/{id}/history`
- Matching estágio 3 como microserviço Python separado (fila BullMQ/Redis)
- Curva ABC de Categorias · Materiais
- Alertas de preço subindo rápido / anomalias / Benchmark entre obras
- Simulações ("Se aço aumentar 8%, qual impacto no ICPP?")
- Previsão de tendência

---

## 👮 Segurança

- **Todas as rotas são protegidas por padrão** (`APP_GUARD = JwtAuthGuard` no Nest).
- Apenas `/auth/login`, `/auth/register`, `/api/docs`, `/health` são públicas.
- `CompanyContextMiddleware` anexa `req.companyId` de cada request autenticada.
- `PrismaService.scoped(companyId)` estende automaticamente `WHERE company_id = X` em findMany/findFirst/count/aggregate.
- Resultados do ICPP são imutáveis: competência fechada = dados congelados. Reabrir exige role ADMIN + log de auditoria.

---

## 🐛 Encontrou algo?

Registre na coluna de observações da reunião de validação PV1–PV10. Tudo que for confirmado vira `icpp_methodologies.regras_* JSONB` e a engine passa a respeitar.

---

*CostBase © 2026 · Primeiro build: Sprint 0 concluído.*
