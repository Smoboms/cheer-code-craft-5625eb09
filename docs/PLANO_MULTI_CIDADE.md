# 🏙️ RELATÓRIO DE VIABILIDADE — ARQUITETURA MULTI-CIDADE (RARQUES)

> **Modo:** Planejamento e documentação. **Nenhuma alteração** foi feita em código, banco, RLS, rotas ou telas.
> Base atual: operação single-city (Uruaçu-GO), tabela `cities` já existe (usada como catálogo), mas **nenhuma tabela de domínio possui `city_id`**.
> Data: Julho / 2026.

---

## 1. Tabelas que precisariam receber `city_id`

Classificação por criticidade. Todas as FKs apontariam para `public.cities(id)`.

### 🔴 Crítico — segmentação de negócio direta
| Tabela | Justificativa |
|---|---|
| **`partners`** | Cada empresa parceira opera em uma cidade específica. Hoje há coluna `city` (texto livre) — precisa virar `city_id` normalizado. É o coração do multi-city. |
| **`marketplace_products`** | Produtos são vendidos/retirados localmente. Cliente de outra cidade não deve ver estoque de Uruaçu. |
| **`professionals`** | Diretório de profissionais é intrinsecamente local (advogado, médico, corretor). |
| **`lugares`** (Locais) | Pontos turísticos, restaurantes, comércios do Portal Uruaçu — 100% local. |
| **`journal_articles`** | Notícias regionais. Um artigo de Uruaçu não interessa a Anápolis. Precisa filtro por cidade (com opção `city_id NULL` = artigo nacional). |
| **`public_home_banner`** | Banner da Home Pública é cidade-dependente. |
| **`atalhos_da_casa`** | Atalhos do Portal são cidade-dependentes. |
| **`home_carousel_slides`** | Idem. |
| **`talents`** | Vitrine de talentos locais. |

### 🟡 Médio — dependem de contexto
| Tabela | Justificativa |
|---|---|
| **`profiles`** | Adicionar `home_city_id` (cidade padrão do associado). Não filtra dados, mas define contexto inicial. |
| **`pilar_conteudos`, `pilar_cronograma`, `pilar_empresas`, `pilar_galeria`, `pilar_palestrantes`** | Eventos dos pilares (Nexus/Elas/Magna) acontecem em cidades específicas. Pode ser `city_id NULL` = evento nacional. |
| **`partner_benefits`** | Herda de `partners` — na prática o filtro vem via JOIN, mas indexar `city_id` desnormalizado acelera. |

### 🟢 Baixo — não precisam de `city_id`
- `coupons`, `purchases`, `client_cashback_balances`, `favorites`, `ratings` → derivam de `partners` via JOIN.
- `user_roles`, `achievements`, `analytics_events`, `payments`, `revenue_streams`, `platform_goals`, `system_settings` → escopo global.
- `partner_categories`, `market_categories`, `market_subcategories`, `professional_categories`, `article_categories` → taxonomia global compartilhada.
- `cities` (obviamente).

**Total afetado: ~13 tabelas de domínio + `profiles`.**

---

## 2. Impacto estimado (hooks, RPCs, rotas)

| Tabela | Hooks / Componentes | RPCs | Rotas afetadas |
|---|---|---|---|
| `partners` | `usePartners`, `useAsync` em AdminEmpresas, MinhaEmpresa, BenefitsPage, CompanyProfile | `issue_coupon`, `lookup_client_for_partner` (revisar filtro) | `/beneficios`, `/empresa/:slug`, `/admin/empresas`, `/app/minha-empresa`, `/public/companies` |
| `marketplace_products` | `MyProductsPage`, `MyProductsSection`, `PublicMarket`, `AdminMercado` | trigger `protect_marketplace_product_curation_fields` | `/mercado`, `/admin/mercado`, `/app/meus-produtos` |
| `professionals` | `useProfessionals`, `AdminProfissionais`, `PublicProfessionals` | — | `/profissionais`, `/admin/profissionais` |
| `lugares` | `AdminLocals`, `PublicLocais` | — | `/locais`, `/admin/locais` |
| `journal_articles` | `useJournalArticles`, `AdminJournal`, `PublicJournal`, `PublicJournalArticle` | — | `/journal`, `/journal/:slug`, `/admin/journal` |
| Banners/Atalhos/Carousel | `PublicHome`, `AdminBanners`, `AdminHomeAtalhos` | — | `/`, `/admin/banners`, `/admin/atalhos` |
| Pilares (5 tabelas) | `PilarView`, `NexusPage`, `ElasPage`, `MagnaPage`, `AdminPilares` | — | `/pilares/*`, `/admin/pilares` |
| `profiles` | `AuthContext`, `ProfilePage`, `OnboardingPage` | `handle_new_user`, `create_secondary_profile` | Onboarding + Perfil |

**Estimativa quantitativa consolidada:**
- **~35 arquivos** de hooks/páginas com queries a ajustar.
- **~10 rotas públicas** e **~9 rotas ADM** afetadas.
- **3 RPCs** a revisar (`issue_coupon`, `lookup_client_for_partner`, `handle_new_user`) — nenhuma precisa mudar de assinatura, apenas validar consistência de cidade em runtime.
- **~40 policies RLS** a revisar (não necessariamente reescrever — a maioria continua válida; só as de leitura pública precisam do filtro por cidade quando aplicável).

---

## 3. Estratégia de migração sem downtime

Fluxo em **6 fases**, sem janela de indisponibilidade. Dado que 100% dos registros atuais são de Uruaçu:

### Fase A — Preparação (não-destrutiva, 0 downtime)
1. Garantir seed de `cities` com Uruaçu-GO ativo e obter o `id_uruacu`.
2. Em cada tabela alvo: `ALTER TABLE ... ADD COLUMN city_id uuid REFERENCES public.cities(id)` **sem `NOT NULL`**.
3. Criar índices `CONCURRENTLY` (ver seção 4).

### Fase B — Backfill (0 downtime)
4. `UPDATE ... SET city_id = id_uruacu WHERE city_id IS NULL` em lotes de 5-10k linhas (`LIMIT` + `ORDER BY id`) para evitar lock longo.
5. Verificar contagem: `SELECT COUNT(*) FILTER (WHERE city_id IS NULL)` deve ser 0 antes de avançar.

### Fase C — Dual-write (0 downtime, retrocompatível)
6. Deploy do frontend com `CityContext` **opcional** — se ausente, assume Uruaçu (fallback).
7. Todos os `INSERT`s passam a gravar `city_id` explicitamente; o frontend antigo (cache Vite) continua funcionando porque a coluna aceita NULL e triggers preenchem default.
8. Adicionar trigger temporário `BEFORE INSERT` que faz `NEW.city_id = COALESCE(NEW.city_id, id_uruacu)`.

### Fase D — Enforce (0 downtime)
9. `ALTER TABLE ... ALTER COLUMN city_id SET NOT NULL` (só depois que backfill = 100% e trigger garante default).
10. Atualizar RLS policies para incluir filtro por cidade onde aplicável (ver seção 5).

### Fase E — Ativar seletor (feature flag)
11. Liberar `CityContext` real no frontend com seletor de cidade no header público e no onboarding.
12. Feature flag em `system_settings` (`multi_city_enabled`) permite rollback instantâneo.

### Fase F — Cleanup
13. Remover trigger de default (opcional — pode manter como safety net).
14. Remover coluna `partners.city` (texto livre) após confirmar que nada a lê.

**Risco de downtime: zero.** Cada fase é reversível independentemente. O ponto mais delicado é o `SET NOT NULL` (Fase D), que exige lock breve — usar `ALTER TABLE ... ADD CONSTRAINT ... NOT VALID` + `VALIDATE CONSTRAINT` para evitar lock pesado.

---

## 4. Índices compostos recomendados

Priorizar queries mais frequentes (listagem pública por cidade + status):

```sql
-- Empresas: listagem pública por cidade + aprovadas
CREATE INDEX CONCURRENTLY idx_partners_city_status
  ON public.partners (city_id, status) WHERE status = 'approved';

-- Marketplace: cidade + status + destaque
CREATE INDEX CONCURRENTLY idx_products_city_status_featured
  ON public.marketplace_products (city_id, status, is_featured DESC, created_at DESC);

-- Profissionais: cidade + categoria + ativos
CREATE INDEX CONCURRENTLY idx_professionals_city_cat
  ON public.professionals (city_id, category_id) WHERE is_active = true;

-- Locais: cidade + categoria
CREATE INDEX CONCURRENTLY idx_lugares_city_cat
  ON public.lugares (city_id, categoria);

-- Journal: cidade + publicado + data
CREATE INDEX CONCURRENTLY idx_journal_city_pub
  ON public.journal_articles (city_id, published_at DESC) WHERE is_published = true;

-- Home dinâmica (banners/atalhos/slides): cidade + ativo + ordem
CREATE INDEX CONCURRENTLY idx_atalhos_city_order
  ON public.atalhos_da_casa (city_id, is_active, sort_order);
```

Todos com `CONCURRENTLY` para não travar escrita durante criação.

---

## 5. Pontos de atenção em RLS

### 5.1 Regra geral
Cada policy de `SELECT` pública que hoje faz `WHERE status = 'approved'` precisará ganhar cláusula de cidade **apenas quando o produto de negócio exigir isolamento**. Alguns casos:

| Cenário | Comportamento esperado |
|---|---|
| Cliente logado em Uruaçu | Vê apenas parceiros/produtos/profissionais de Uruaçu |
| Cliente logado navegando outra cidade (feature futura) | Contexto vem do `CityContext` frontend → passa cidade via filtro na query, **RLS não bloqueia** (permite qualquer cidade aprovada) |
| Empresa (parceiro) | Só edita registros da própria cidade (`city_id = own_partner.city_id`) |
| ADM | Vê todas as cidades (sem filtro) |

### 5.2 Cuidados críticos
1. **Não colocar `city_id` em coluna do usuário** para filtrar RLS automaticamente — isso engessa a experiência (usuário viajando não veria conteúdo local do destino). O filtro deve ser **de query, não de policy**, exceto para escrita.
2. **Escrita:** policy `INSERT/UPDATE` de empresa deve validar `city_id = (SELECT city_id FROM partners WHERE created_by = auth.uid())` para evitar que um parceiro cadastre produto em cidade alheia.
3. **RPC `issue_coupon`:** validar que `partner.city_id = client.home_city_id` **NÃO** deve ser regra — o cliente pode comprar em qualquer cidade. Não bloquear.
4. **`lookup_client_for_partner`:** manter como está (busca por CPF/card_code é global, cross-city).
5. **Vazamento cross-city:** revisar 100 policies em pente-fino; especialmente as com `USING (true)` (leitura pública) que precisam ganhar filtro de cidade no frontend, não no backend.
6. **Storage:** buckets continuam globais. Nomear paths com `city_slug/...` ajuda organização mas não é obrigatório.

---

## 6. Estimativa de esforço

| Frente | Complexidade | Duração estimada (1 dev sênior) |
|---|---|---|
| Migrations SQL + backfill (Fases A-D) | Média | **3-4 dias** |
| Revisão e ajuste de ~40 policies RLS | Alta (auditoria minuciosa) | **2-3 dias** |
| `CityContext` no frontend + persistência no perfil | Média | **2 dias** |
| Ajuste de ~35 hooks/páginas para passar `city_id` nas queries | Média-repetitiva | **4-5 dias** |
| Seletor de cidade (header público + onboarding + admin) | Média | **2 dias** |
| Admin: filtro de cidade em todas as listagens ADM | Baixa | **1-2 dias** |
| Testes ponta-a-ponta (e2e) multi-cidade | Alta | **3 dias** |
| Documentação, runbook, feature flag, rollback plan | Baixa | **1 dia** |
| **Total** | — | **~18-22 dias úteis (≈ 4-5 semanas)** |

Com 2 devs em paralelo: **~2.5-3 semanas**. Com QA dedicado: adicionar +1 semana de hardening.

**Custo de infra adicional:** desprezível. Índices adicionam ~10-15% ao storage do banco. Nenhum upgrade de compute é necessário até 25k DAU (ver `INFRA_AUDIT_RARQUES.md`).

---

## 7. Recomendação — momento ideal para executar

### 🚦 Gatilhos objetivos (executar quando **QUALQUER** dos abaixo for atingido)
1. **Segunda cidade contratada comercialmente** — existe um cliente/prefeitura/franqueado pagando pela operação de outra cidade. Este é o gatilho **primário**.
2. **≥ 200 empresas parceiras aprovadas em Uruaçu** — massa crítica que valida o produto single-city e justifica investir em escalar.
3. **≥ 5.000 associados ativos** — indica tração forte e demanda de expansão orgânica.
4. **Solicitação recorrente de expansão** — ≥ 3 leads qualificados de cidades diferentes em 30 dias.

### 🚫 Não executar se
- Uruaçu ainda tem <100 parceiros ativos (produto não validado).
- Time de dev < 2 pessoas (risco de introduzir bugs sem cobertura).
- Não há budget de QA para 1 sprint dedicada.
- Foco atual do roadmap são features monetização (cupons/cashback/pagamentos).

### 🎯 Recomendação estratégica
**Não executar agora.** A plataforma está pronta para o lançamento comercial de Uruaçu e cada dia de operação single-city gera dados que **melhoram o desenho multi-cidade** (padrões de uso, categorias mais buscadas, comportamento cross-cidade real vs. hipotético).

**Executar quando:** (a) houver contrato assinado de segunda cidade OU (b) Uruaçu ultrapassar 200 parceiros + 5k associados — o que ocorrer primeiro.

Enquanto isso, manter este documento como **contrato técnico** e evitar decisões de schema que dificultem a migração futura (ex: não criar novas colunas de texto livre para "cidade", não fazer joins hard-coded no nome "Uruaçu" no código).

---

## 8. Ações preventivas de baixo custo (opcional, hoje)

Sem executar a migração completa, três medidas de higiene reduzem custo futuro:

1. **Padronizar `partners.city`** — normalizar valores existentes (`"Uruaçu"`, `"uruaçu"`, `"Uruacu"`) para uma única grafia. Facilita backfill.
2. **Popular `cities`** com as 5-10 cidades da região (Uruaçu, Niquelândia, Ceres, Goianésia, Anápolis, Goiânia) marcadas como `is_active = false`. Zero impacto operacional.
3. **Adotar convenção** em novos hooks/queries: sempre expor parâmetro `cityId?: string` mesmo que ignorado hoje. Reduz refactor futuro em ~30%.

Essas 3 ações podem ser feitas em <1 dia quando desejado — **não fazem parte desta tarefa**, apenas registradas para consideração.

---

_Documento de planejamento. Nenhuma alteração de banco de dados, código, RLS ou infraestrutura foi realizada._
