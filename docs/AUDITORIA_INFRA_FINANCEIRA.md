# Auditoria Financeira e de Infraestrutura — RARQUES

> **Modo:** READ-ONLY. Nenhum arquivo, migração, política ou dado foi alterado.
> **Data:** Julho 2026
> **Escopo:** Backend (Lovable Cloud), Banco de Dados, Storage, Auth, AI Gateway.

---

## ⚠️ Observação inicial importante — leia primeiro

Este projeto **não está hospedado em uma conta Supabase própria**. Está rodando sobre **Lovable Cloud**, que é o backend gerenciado da Lovable (construído sobre a mesma tecnologia open-source do Supabase — Postgres, PostgREST, GoTrue, Storage), mas **entregue como um serviço embutido na sua assinatura Lovable**.

Isso muda substancialmente as respostas de "plano" e "preço":

| Item | Supabase (conta própria) | **Lovable Cloud (o seu caso)** |
|---|---|---|
| Modelo de cobrança | Plano fixo mensal (Free / Pro $25 / Team $599 / Enterprise) | **Consumo em créditos**, deduzidos da sua assinatura Lovable |
| Acesso ao painel supabase.com | Sim, completo | **Não.** Toda a gestão é via aba **Cloud** dentro do editor Lovable |
| Cobrança separada | Sim, cartão direto na Supabase | **Não.** Tudo entra na mesma fatura Lovable |
| Migração/exportação | Total | Exportação de dados disponível via **Cloud → Advanced settings → Export data** |

Por isso, ao longo deste documento, quando eu falo de **"plano"** estou falando do **seu plano Lovable + o consumo do Cloud** — não de uma conta Supabase separada.

---

## 1. Plano atual e limites reais

### 1.1 Instância Cloud provisionada

Levantamento feito agora, ao vivo:

- **Instance size (Cloud):** `Tiny` (menor tamanho de compute disponível)
- **Status:** `ACTIVE_HEALTHY` — banco e pooler operacionais
- **Restarts desde o boot:** 0 (estável)
- **Região:** `us-east-1` (AWS Norte da Virgínia)
- **Postgres:** versão 17.6
- **Pooler:** PgBouncer ativo (transaction mode, porta 6543)

### 1.2 Uso atual (em produção, hoje)

| Recurso | Uso agora | Capacidade Tiny | Ocupação |
|---|---|---|---|
| **Memória RAM** | ~63% | 1 GB | 🟡 Moderado |
| **Disco de dados** | 16% | ~8 GB | 🟢 Baixo |
| **Tamanho do banco** | 14.9 MB | — | 🟢 Muito baixo |
| **WAL (write-ahead log)** | 128 MB | — | 🟢 Normal |
| **Conexões diretas** | 24 / 60 | 60 | 🟡 Moderado |
| **Conexões via pooler** | 1 / 200 | 200 | 🟢 Baixíssimo |
| **Rollbacks acumulados** | 1.686 | — | 🟢 Normal (RLS bloqueando tentativas indevidas) |

### 1.3 Plano Lovable

O plano Lovable define quantos créditos você recebe por mês. Créditos são consumidos por **três coisas**:
1. Mensagens em Build mode (uso variável)
2. Mensagens em Plan mode (1 crédito cada)
3. **Consumo do Cloud + AI Gateway** (uso variável)

**Franquia grátis mensal para Cloud incluída em qualquer plano pago:**
- Free / Pro: **40 créditos/mês** só para Cloud
- Business: **20 créditos/mês** só para Cloud
- Além disso, existe uma pequena franquia para AI Gateway.

**Suporta o RARQUES hoje?** Sim, com folga confortável. O banco tem menos de 15 MB, o disco está a 16%, o pooler está praticamente ocioso. A restrição atual é RAM (63%) e conexões diretas (24/60) — ambos indicadores para monitorar, não para escalar já.

---

## 2. Estimativa de custo para 3 cenários

> Importante: no Lovable Cloud, o custo real vem do **consumo em créditos**, que depende de tráfego, egress, edge functions, storage e AI Gateway. As faixas abaixo assumem que o projeto **não usa muito AI Gateway** (que é o principal item volátil). Se você ativar geração de imagens/embeddings em escala, o custo sobe rapidamente.

| Componente do custo | Cenário A (até 2k ativos) | Cenário B (10k ativos) | Cenário C (50k ativos) |
|---|---|---|---|
| **Instance size Cloud** | Tiny (atual) | Small / Medium | Medium / Large |
| **Postgres compute** | incluído no Cloud | incluído | incluído |
| **Storage (partner-images, avatars, exports)** | baixo | médio (~5-20 GB) | alto (~50-200 GB) |
| **Transferência (egress)** | baixa | média | alta — item mais imprevisível |
| **Auth (usuários)** | trivial | trivial | trivial (Auth não é o gargalo) |
| **Realtime** | não usado no RARQUES | idem | idem |
| **RPCs (`issue_coupon`, `lookup_client_for_partner`, `get_public_card_by_code`, `create_secondary_profile`)** | uso normal | uso normal | precisa de índices já criados |
| **Edge Functions** | poucas invocações | idem | idem |
| **AI Gateway** | opcional | opcional | opcional |

**Faixas de custo mensal esperadas (Cloud + Lovable, tudo somado)**

| Cenário | Franquia cobre? | Custo mensal aproximado |
|---|---|---|
| **A — Lançamento (até 2.000 ativos)** | Provavelmente sim, com margem | **~ US$ 0 – 50 acima do seu plano Lovable** |
| **B — Crescendo (10.000 ativos)** | Parcialmente | **~ US$ 80 – 250 acima do plano** |
| **C — Consolidado (50.000 ativos)** | Não | **~ US$ 400 – 900 acima do plano**, muito dependente de egress e uploads |

Essas faixas **não são compromisso comercial** — são estimativas baseadas em benchmarks públicos de projetos Postgres/PostgREST com o mesmo perfil de leitura pesada (Portal Público) + escrita moderada (cupons, cashback).

**Onde ver seu consumo real:** editor Lovable → nome do workspace (canto superior esquerdo) → hover na barra de créditos → **Settings → Plans & credits** para detalhamento diário/mensal.

---

## 3. Quando fazer upgrade — tabela de gatilhos

Como você está no Lovable Cloud, o "upgrade" acontece em dois eixos: **plano Lovable** (mais créditos) e **Cloud instance size** (mais CPU/RAM/conexões). Traduzido para os planos Supabase equivalentes que você citou:

| Sinal disparador | Equivale a sair de… | …para… | Onde fica no seu caso |
|---|---|---|---|
| Projeto ainda em desenvolvimento, poucos usuários | Free | — | Você já está além disso |
| **Está aqui hoje.** 100–2.000 ativos, RAM ~60%, disco ~16% | Free | **Pro** | ✅ Plano Lovable pago + Cloud Tiny |
| RAM passa de 80% de forma sustentada, conexões diretas > 45/60 | Pro | **Pro com upgrade de compute** | Aumentar instância para `Small` |
| 10k+ ativos, egress consistente, timeouts em horário de pico | Pro | **Team-equivalente** | Compute `Medium` + revisão de índices |
| 30k+ ativos, necessidade de SLA, Read Replicas, HA | Team | **Enterprise-equivalente** | Compute `Large` + suporte prioritário |
| 100k+ ativos, multi-região, DPO, contratos | Enterprise | Enterprise dedicado | Conversa comercial |

**Regra prática do RARQUES:**
- Enquanto RAM < 75% E conexões diretas < 45/60 E disco < 60%, **não faça upgrade**.
- Suba de instância assim que **qualquer um dos três** passar do teto por mais de 48h.

---

## 4. Painel administrativo — o que existe no seu caso

Como Lovable Cloud, você **não tem acesso ao painel supabase.com**. Toda a administração fica dentro do editor Lovable, na aba **Cloud** (barra de navegação superior do projeto). O que está disponível:

| Menu Cloud | Para que serve |
|---|---|
| **Database** | Ver tabelas, colunas, índices, dados. Executar SQL. Ver e editar **RLS Policies**. Este é o seu "SQL Editor + Table Editor + Policies + Triggers + Functions" combinados. |
| **Users** | Lista de usuários autenticados. Configurações de Auth (provedores Google/Apple, email, phone). "Auth settings" pelo ícone de engrenagem. |
| **Files / Storage** | Buckets: `partner-images` (público), `avatars` (privado), `database_export_12_07_26` (privado). Upload, download, permissões. |
| **Emails** | Templates de e-mail transacional e de auth. Domínio custom quando configurado. |
| **Edge Functions** | Deploy, logs, secrets por função. Hoje você não tem edge functions ativas depois da remoção do módulo Agro. |
| **Secrets** | Onde ficam `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `SUPABASE_JWKS` etc. **Não são acessíveis pelo usuário** no Cloud gerenciado — apenas usadas por edge functions. |
| **Advanced settings** | Instance size (compute), **Export data** (backup manual do banco inteiro), região. |

**O que NÃO está exposto no Cloud (existe no Supabase padrão, mas não aqui):**
- Painel de Extensions dedicado (as extensões usadas — `pgcrypto`, `pg_stat_statements` etc. — vêm pré-instaladas)
- Painel de Performance/Query Insights visual (você vê isso via ferramentas Lovable: `db_health`, `slow_queries`, `linter`)
- Configurações de projeto Supabase (billing, pausar, região) — tudo isso é controlado pela Lovable

---

## 5. Como editar o banco manualmente

Todo o trabalho de schema no seu caso passa por **um destes caminhos**:

| O que você quer fazer | Onde/como |
|---|---|
| Criar tabela, apagar tabela, editar coluna | **Via IA no chat Lovable** → o agente gera uma migração (você aprova antes de aplicar). É o único caminho recomendado, porque garante que RLS, GRANTS e triggers fiquem consistentes. |
| Criar índice | Mesma via — migração aprovada. |
| Criar trigger, criar função, editar RPC | Mesma via — migração aprovada. |
| Executar SQL manual (SELECT, análise ad-hoc) | Cloud → Database → SQL editor (leitura livre; escritas seguem migrações). |
| Importar dados em massa | Via SQL `INSERT` em migração, ou via CSV pelo Table Editor do Cloud. |
| Exportar dados | Cloud → Advanced settings → **Export data**. |
| Restaurar backup | Backups automáticos diários são feitos pelo Lovable Cloud. Restauração pontual: hoje ainda depende de suporte Lovable — não há botão "restore" self-service no seu tier atual. |

**Regra de ouro que o seu projeto já segue:** todo `CREATE TABLE` no schema `public` precisa vir com `GRANT` explícito para `authenticated`/`service_role`, senão o PostgREST devolve permissão negada mesmo com RLS aberto.

---

## 6. Acesso direto ao banco (DBeaver / pgAdmin / DataGrip)

**Sim, é possível.** A string de conexão do seu projeto é:

- **Modo pooler (recomendado para ferramentas GUI):**
  - Host: `aws-0-us-east-1.pooler.supabase.com`
  - Porta: `6543` (transaction mode) ou `5432` (session mode)
  - Database: `postgres`
  - Usuário: `postgres.wplfonpempaimkneqqdz`
  - SSL: **obrigatório** (`sslmode=require`)
- **Senha:** definida no momento do provisionamento do projeto. **No Lovable Cloud, a senha do banco e a `SERVICE_ROLE_KEY` não são acessíveis pelo usuário** (política do Cloud gerenciado). Para conectar via DBeaver/pgAdmin/DataGrip com credenciais reutilizáveis, o caminho oficial é:
  1. Abrir uma solicitação de senha via **Cloud → Advanced settings** (quando a opção estiver disponível no tier), **ou**
  2. Trabalhar exclusivamente via SQL Editor do Cloud + migrações Lovable.

**Como conectar:**
- **DBeaver:** New Connection → PostgreSQL → cole host/porta/db/usuário, SSL mode = `require`.
- **pgAdmin:** Register Server → Connection tab com os mesmos campos, SSL mode = `Require`.
- **DataGrip:** Data Source → PostgreSQL → aba SSH/SSL → Use SSL = `require`.

Enquanto a senha do DB não estiver disponível, mantenha o trabalho dentro do Cloud/editor Lovable — que é o fluxo suportado.

---

## 7. Backups

| Tipo | Como fazer |
|---|---|
| **Backup automático** | Lovable Cloud faz snapshots diários do banco. Retenção depende do tier. |
| **Backup manual (banco inteiro)** | Cloud → Advanced settings → **Export data**. Gera um arquivo compactado e notifica quando pronto. |
| **Restaurar backup** | Snapshots são restaurados via suporte Lovable no tier atual (não há botão self-service). |
| **Exportar só uma tabela** | SQL Editor: `COPY (SELECT * FROM public.<tabela>) TO STDOUT WITH CSV HEADER`, ou via Cloud → Database → botão de export da tabela. |
| **Exportar só dados** | `pg_dump --data-only` via ferramenta externa (requer conexão direta) ou script SQL. |
| **Exportar estrutura + dados** | O Export data do Cloud já faz isso. Alternativa via `pg_dump` para quem tem conexão direta. |

Observação: no bucket `database_export_12_07_26` já existe um export anterior arquivado.

---

## 8. Segurança — quem pode fazer o quê

| Ação | Quem pode |
|---|---|
| **Acessar dados via app** | Qualquer usuário logado, limitado pelas políticas RLS (hoje 100 policies ativas em ~37 tabelas) |
| **Executar SQL manual** | Somente quem tem acesso ao editor Lovable do projeto (você e quem você convidar para o workspace) |
| **Alterar RLS** | Idem — via migração aprovada |
| **Apagar tabelas** | Idem — via migração aprovada. O RLS não protege contra `DROP TABLE`; a proteção é o controle de acesso ao workspace Lovable. |
| **Criar funções/RPCs** | Idem — via migração aprovada |
| **Ler dados via anon key** | Apenas o que as policies liberarem para `anon`. Você já revogou colunas PII sensíveis (`email`, `phone` em `partners`) para `anon` — bom. |
| **Executar edge functions** | Depende de cada função. Hoje você não tem edge functions no projeto. |

**Cuidados para não quebrar a aplicação:**
1. Nunca desabilite RLS numa tabela em produção sem uma policy `USING (true)` explícita — sem policies e com RLS ativo, ninguém vê nada.
2. Nunca dê `GRANT ... TO anon` em tabelas com dados sensíveis (perfis, cupons, financeiro).
3. Antes de alterar `handle_new_user()` (o trigger que cria profile no signup), lembre que ele também gera `card_number` e `card_code` únicos — quebrar ele quebra o cadastro inteiro.
4. Não mexa nas RPCs financeiras (`issue_coupon`) sem revisar atomicidade — hoje elas são o único caminho seguro para emitir cupom + atualizar `total_savings` + `client_cashback_balances`.
5. Nunca reduza a instância Cloud durante horário de pico — o restart derruba conexões.

---

## 9. Monitoramento — onde ver cada métrica

| Métrica | Onde |
|---|---|
| **CPU / RAM** | Cloud → Overview (ou ferramenta interna `db_health`) — hoje: RAM 63% |
| **Conexões** | Cloud → Database → Connections. Hoje: 24/60 diretas, 1/200 pooler |
| **Uso de disco de dados** | Cloud → Overview. Hoje: 16% |
| **Queries lentas** | Ferramenta interna `slow_queries` (roda `pg_stat_statements`) |
| **Uso de Storage** | Cloud → Files (soma por bucket) |
| **Auth (logins, falhas)** | Cloud → Users → logs de auth |
| **Consumo de API (PostgREST)** | Cloud → Logs → filtro por rota |
| **Banda / egress** | Cloud → Usage (Settings → Plans & credits mostra o consumo em créditos) |
| **Nº de usuários** | Cloud → Users (contagem) ou `SELECT count(*) FROM auth.users` |
| **Rollbacks / deadlocks / OOM** | `db_health` |

---

## 10. Escalabilidade da arquitetura atual

Com base no que já foi implementado (índices críticos, RPCs, code-splitting, prefetch, cache tiers do React Query, RLS otimizada):

| Marco | Ação necessária |
|---|---|
| **Até 5.000 ativos** | Tiny atual aguenta. Nenhuma ação. |
| **5k – 15k ativos** | Subir Cloud para `Small`. Confirmar que os índices em `coupons(user_id, created_at)`, `partners(status)`, `marketplace_products(status, is_featured)` continuam sendo usados. |
| **15k – 40k ativos** | `Medium`. Ativar **CDN** para as imagens do bucket `partner-images` (é o item que mais gera egress). Considerar cache de página HTML para as rotas públicas via edge. |
| **40k – 80k ativos** | `Large`. Avaliar **Read Replica** para as leituras pesadas do Portal Público (empresas, produtos, journal, profissionais). O app já está separado em rotas públicas vs. autenticadas, então direcionar leituras públicas ao replica é viável. |
| **80k+ ativos** | Particionar tabelas de alto volume: `coupons` (por mês), `analytics_events` se existir, `payments`. Considerar `pg_partman`. |
| **150k+ ativos** | Multi-região, sharding lógico por cidade (o schema já tem `cities` como dimensão natural). |

---

## 11. Recomendação final

### Quanto você paga hoje
- **Sua assinatura Lovable** (mensal, do plano que você escolheu) **+ ~US$ 0 a US$ 50/mês** de Cloud/AI Gateway acima da franquia — provavelmente nada acima da franquia, dado o uso atual (banco de 15 MB, disco 16%, RAM 63%).

### Quanto você pagaria com ~50.000 ativos
- **Faixa realista:** US$ 400 – 900/mês em consumo de Cloud, somado à assinatura Lovable. A variação depende quase inteiramente de **egress** (transferência de imagens do Portal Público) e do quanto o AI Gateway for usado. Sem uso de AI, fica na parte baixa da faixa.

### Vale a pena continuar no Lovable Cloud?
**Sim, hoje vale.** Motivos objetivos:
1. Você já tem 100 policies RLS, 15 RPCs, triggers de proteção (curadoria, feature flags, card tier) e código cliente 100% acoplado ao SDK `@supabase/supabase-js`. Migrar para outra stack é reescrita massiva.
2. A conta de infraestrutura própria (RDS + Cognito + S3 + CloudFront + gerenciamento) para 50k ativos ficaria em **US$ 600 – 1.500/mês**, com muito mais trabalho de DevOps.
3. Firebase/GCP para o mesmo workload sairia **3x a 6x mais caro** e exigiria reescrever RLS em Firestore Rules — auditoria anterior já concluiu isso.

### Existe alternativa com custo similar?
- **Supabase auto-hospedado (self-hosted em VPS):** ~US$ 40–120/mês em VPS, mas você assume backup, monitoramento, patch, HA. **Não recomendado** enquanto o time for pequeno.
- **Neon + PostgREST + Auth0 + Cloudflare R2:** custo parecido, mais peças móveis, sem os hooks que a Lovable já provê.
- **Manter Lovable Cloud é a opção com melhor custo-benefício técnico para o RARQUES nos próximos 12 meses.**

### Como reduzir custo sem perder desempenho
1. **CDN nas imagens públicas** (partner-images) — corta 60-80% do egress em escala.
2. **Comprimir imagens no upload** (WebP/AVIF) — já é possível via `vite-imagetools` para assets bundle; para uploads dinâmicos, aplicar `sharp` numa edge function antes de salvar no bucket.
3. **Cache agressivo no React Query** — parcialmente feito; ampliar `staleTime` para catálogos (cidades: 24h, categorias: 1h) confirmado na Fase 6.
4. **Evitar polling** — hoje não há polling agressivo; manter assim.
5. **Não ativar Realtime** enquanto não for necessário — é caro em conexões idle.
6. **AI Gateway sob demanda** — não colocar chamadas de IA em rotas públicas (elas seriam consumidas por bots/crawlers).

---

## Veredicto executivo

> **🟢 Infraestrutura saudável, dimensionamento adequado, custo controlado.**
> Nenhuma ação urgente. Monitorar RAM (hoje 63%) — se passar de 80% de forma sustentada, subir a instância Cloud um degrau. Toda a arquitetura já está preparada para escalar até ~40k ativos apenas com upgrade de compute, sem refactor.

Nota geral de prontidão de infraestrutura: **9.3 / 10**.

---

*Documento gerado em modo somente-leitura. Nenhum arquivo do projeto, migração, política RLS, tabela ou configuração foi modificado.*
