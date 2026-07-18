# Runbook — Rarques 50K

Plano operacional para sustentar ~50.000 usuários ativos.
Este documento é a referência única de decisões pós-Fase 4.

## Estado atual (Fase 4 concluída)

- Analytics assíncrono em batch (3s / 20 eventos, `sendBeacon` no unload)
- `userId` cacheado em memória (1 chamada `auth.getUser()` por sessão)
- ErrorBoundary global (fallback visual + log estruturado)
- Code-splitting agressivo (rotas ADM/públicas lazy, `manualChunks` no Vite)
- React Query: `staleTime` global 60s, cache tiers em `queryConfig.ts`
- Índices críticos criados (partners, payments, coupons, analytics_events)
- RPC `issue_coupon` server-side com trigger anti auto-aprovação
- RLS auditada + role guard via `private.has_role`
- Imagens públicas com `loading="lazy"` + `decoding="async"`; hero com `fetchPriority="high"`
- Cap defensivo de 50k eventos em `AdminAnalytics` para agregação client-side

## Métricas-alvo

| Métrica                       | SLO             |
|-------------------------------|-----------------|
| LCP público                   | < 2.5s p75      |
| INP interações críticas       | < 200ms p75     |
| Tempo médio de query          | < 5ms           |
| Erro RPC issue_coupon         | < 0.5%          |
| Perda de eventos analytics    | < 1%            |

## Próximos gargalos previstos (>10k DAU)

### 1. Analytics — agregação server-side
Hoje `AdminAnalytics.tsx` puxa até 50k linhas e agrega em JS.
Ação: criar RPC `admin_analytics_summary(_from, _to)` retornando JSON já agregado
(page_views por rota, top empresas, top artigos, funil paywall).
Ganho estimado: 30-50x na latência do painel.

### 2. Paginação real nas listas ADM
`AdminAssociados`, `AdminCupons`, `AdminEmpresas`, `AdminMercado` hoje
carregam listas completas. Ação: usar `.range(from, to)` + total via `count: exact`
+ paginação em URL.

### 3. Imagens — variantes WEBP
Bucket `partner-images` guarda originais grandes. Ação: pipeline Edge Function
+ `imageOptimizer.ts` para gerar variantes 320/640/1280.

### 4. Realtime
Sem canais ativos hoje. Se introduzir, limitar a 1 subscription por sessão
e desmontar em `useEffect` cleanup.

## Playbook de incidente

**Sintoma: painel ADM lento (>3s)**
1. `supabase--slow_queries` → identificar query dominante
2. Se `analytics_events` → confirmar cap de 50k ativo em `AdminAnalytics`
3. Se persistir → migrar para RPC agregada (item 1 acima)

**Sintoma: erros 429 / DB saturado**
1. `supabase--db_health` — checar conexões + memória
2. Aumentar tamanho do "Database server" (compute) — não o disco
3. Confirmar `refetchOnWindowFocus: false` (já configurado em `App.tsx`)

**Sintoma: perda de eventos analytics**
1. Console: procurar `[analytics] batch insert failed`
2. Verificar RLS de `analytics_events` (INSERT liberado para anon+authenticated)
3. Testar `navigator.sendBeacon` no browser do usuário reportante

**Sintoma: cupom duplicado / auto-aprovação**
1. Confirmar UNIQUE em `coupons.code` (Fase 2)
2. Confirmar trigger `protect_marketplace_product_curation_fields` ativo
3. Rodar `security--run_security_scan`

## Testes de carga (pendente — T18)

Ferramenta recomendada: k6.
Cenário mínimo antes do soft-launch:
- 500 VUs por 5min percorrendo Home → Empresa → Mercado
- 100 VUs concorrentes emitindo cupons (RPC `issue_coupon`)
- 1000 eventos/s de analytics
Baseline aceitável: p95 < 800ms em rotas públicas.

## Observabilidade (pendente — T19)

Integrações previstas:
- Sentry (front-end error tracking) — plugar em `ErrorBoundary.componentDidCatch`
- Log estruturado de RPC failures via `console.warn` já em produção
- Dashboard Supabase (built-in) — monitorar Auth, DB, Edge Function daily

## Contato

Owner técnico: Rarques Matriz.
Escalada P0: consultar `platform_goals` e ADM Financeiro para janelas de pico.
