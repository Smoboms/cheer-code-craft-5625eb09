# Painel Administrativo Rarques — Plano de Construção

Vou construir um Painel ADM novo e separado, sem tocar em nada da Área do Associado nem do Portal Público que já funcionam. Este é um escopo grande — antes de começar, quero alinhar decisões-chave, porque algumas afetam quanto tempo leva e o que efetivamente vai ser "dado real" vs. "dado que só existe depois que a plataforma começar a operar".

---

## 1. Acesso restrito

- O painel só aparece para `imobiliario454@gmail.com` e `rarquesmatriz@gmail.com`.
- Aparece como um **botão novo dentro do menu de Configurações** da Área do Associado (não é um login separado — o usuário já está logado como associado, e se o e-mail dele está na allowlist, aparece "Painel Administrativo").
- Verificação real no backend via tabela `user_roles` com role `admin` + trigger que atribui role `admin` automaticamente para esses dois e-mails quando confirmam o cadastro.
- Rota nova: `/admin` protegida por checagem server-side.

## 2. O que já existe hoje no banco (e vou reusar)

- `profiles` (associados) — já dá para listar, editar, desativar.
- `partners` (empresas) + `partner_benefits` + `partner_photos` — já dá para CRUD completo.
- `user_roles` — já existe, uso para admin.

## 3. O que precisa ser criado no banco

Vou criar as tabelas que faltam para o painel funcionar com **dados reais**:

- `journal_articles` — matérias do Journal (hoje estão hard-coded em `src/data/journalArticles.ts`). Migro para o banco.
- `article_categories` e `partner_categories` — categorias editáveis.
- `coupons` — cada cupom gerado (associado, empresa, valor da compra, % desconto, economia gerada, data).
- `analytics_events` — eventos-chave: `page_view`, `seja_associado_click`, `paywall_hit`, `paywall_login_click`, `company_profile_view`, `article_view`, `article_read_full`.
- `home_carousel_slides` — slides do carrossel de avisos da Área do Associado (hoje em localStorage).
- `additional_cards` — cartões adicionais (familiares/colaboradores) por associado.
- Coluna `is_member` em `partners` (Empresa Membro) e `status` (`pending_curation`, `approved`, `rejected`).

Tudo com RLS: admin lê/escreve tudo; associados leem o que já leem hoje; público lê o que é público.

## 4. Estrutura do Painel

Layout com sidebar fixa (desktop) / hambúrguer (mobile), padrão visual atual (navy, cantos retos, dourado, masthead gótico).

Rotas:

```
/admin              → Dashboard (Seção 1)
/admin/empresas     → Seção 2
/admin/journal      → Seção 3
/admin/categorias   → Seção 4
/admin/associados   → Seção 5
/admin/cupons       → Seção 6
/admin/analytics    → Seção 7
/admin/banners      → Seção 8
```

## 5. As 8 seções

1. **Dashboard** — cards de resumo + 2 gráficos (recharts, já disponível no shadcn). Filtro de período no topo.
2. **Empresas** — tabela com busca/filtros, CRUD completo, toggle "Empresa Membro", fila de curadoria (`status='pending_curation'`), stats por empresa (cupons gerados, valor transacionado).
3. **Journal** — CRUD de matérias, toggle "Destaque", views e paywall hits por matéria.
4. **Categorias** — CRUD simples de categorias de empresa e de notícia.
5. **Associados** — tabela com busca/filtros, cadastro manual (via edge function que cria auth user), editar, desativar/reativar, gestão de cartões adicionais, stats por associado.
6. **Cupons** — lista, filtros, totais, ranking empresas, ranking associados, gráfico temporal.
7. **Analytics** — gráficos dos eventos-chave, taxa de conversão paywall→"Seja Associado".
8. **Banners** — CRUD do banner da Home pública (já existe em localStorage, migro para tabela) + CRUD dos 3 slides do carrossel da Área do Associado.

## 6. Instrumentação dos eventos

Vou plantar chamadas para gravar eventos em `analytics_events` nos pontos certos:
- `PublicHome` → `page_view:home`, botão "Seja Associado" → `seja_associado_click`
- `PublicJournal` / `PublicJournalArticle` → `page_view:journal`, `article_view`, `paywall_hit` quando o paywall aparece, `paywall_login_click` no CTA
- `PublicCompanies` / `CompanyProfile` → `page_view:empresas`, `company_profile_view`
- `PublicSearch` → `page_view:buscar`
- Área do Associado → `article_read_full` quando associado logado abre matéria inteira

## 7. Cupons — decisão importante

Hoje **não existe geração de cupons implementada** no app do associado. Para o dashboard de cupons mostrar "dados reais", uma de duas coisas precisa acontecer:

- **(A)** Eu já implemento o fluxo do associado gerar cupom (botão "Gerar cupom" no perfil da empresa, formulário com valor da compra + % desconto → grava em `coupons`), e aí o dashboard mostra dados reais desde o dia 1. **Isso adiciona escopo, mas é o único jeito do dashboard de cupons não ficar vazio.**
- **(B)** Só crio a tabela e o dashboard; ele começa vazio e enche à medida que a geração de cupons for construída depois.

Preciso que você escolha antes de eu implementar (pergunta abaixo).

## 8. Ordem de execução

1. Migração SQL (tabelas novas + colunas + RLS + trigger admin allowlist).
2. Layout base do `/admin` (sidebar, guard de acesso).
3. Seção por seção, começando pelas mais simples (Categorias, Banners, Journal, Empresas), depois Associados, depois Dashboard/Cupons/Analytics que dependem das outras.
4. Instrumentação de eventos nas páginas públicas.
5. Verificação: login com um dos dois e-mails, tentar CRUD em cada seção, conferir gravação real no banco.

## 9. O que NÃO vou tocar

Área do Associado (R-CARD, Benefícios, Nexus, Elas, Journal, Magna, Panorama, Minha Empresa, Crescer, Perfil, login, autenticação existente), Portal Público (páginas, layout, paywall). Só instrumento eventos — não mudo comportamento.

---

## Perguntas antes de começar

Preciso de duas respostas para não fazer trabalho que você vai querer refazer:

1. **Cupons**: opção (A) implemento agora a geração de cupom pelo associado, ou (B) só o painel e enche depois?
2. **Migração das matérias do Journal**: as 5 matérias que hoje estão hard-coded devem ser migradas para o banco (viram editáveis) ou mantenho as hard-coded e o CRUD só cria matérias novas?

Assim que você responder, começo pela migração do banco.
