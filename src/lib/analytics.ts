/**
 * Analytics (Fase 4 · Tarefa 7 — Assíncrono e não-bloqueante).
 *
 * Antes: cada trackEvent() fazia `supabase.auth.getUser()` + INSERT síncrono
 *   → ~716 chamadas em sessão de teste, gargalo #1 do banco.
 *
 * Agora:
 *   • Fila em memória com flush em batch (INSERT array) a cada 3s ou 20 eventos.
 *   • userId cacheado em memória (uma leitura por sessão).
 *   • Flush final via `navigator.sendBeacon` no unload (garantido pelo browser
 *     mesmo em navegação/fechamento de aba).
 *   • Assinatura pública `trackEvent()` inalterada — nenhum call-site precisa mudar.
 */
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'rarques.analytics.session.v1';
const FLUSH_INTERVAL_MS = 3_000;
const FLUSH_BATCH_SIZE = 20;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function getSessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return 'anon';
  }
}

export type AnalyticsEventType =
  | 'page_view'
  | 'seja_associado_click'
  | 'paywall_hit'
  | 'paywall_login_click'
  | 'company_profile_view'
  | 'article_view'
  | 'article_read_full'
  | 'search_query'
  | 'product_view'
  | 'professional_view'
  | 'lugar_view'
  | 'coupon_click'
  | 'benefit_use'
  | 'shortcut_click'
  | 'category_click';

interface QueuedEvent {
  event_type: AnalyticsEventType;
  target_id: string | null;
  target_label: string | null;
  user_id: string | null;
  session_id: string;
  metadata: Record<string, unknown> | null;
}

let cachedUserId: string | null | undefined = undefined; // undefined = não resolvido ainda
let userIdPromise: Promise<string | null> | null = null;
const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let installedUnload = false;

async function resolveUserId(): Promise<string | null> {
  if (cachedUserId !== undefined) return cachedUserId;
  if (!userIdPromise) {
    userIdPromise = supabase.auth.getUser().then(({ data }) => {
      cachedUserId = data.user?.id ?? null;
      return cachedUserId;
    }).catch(() => {
      cachedUserId = null;
      return null;
    });
  }
  return userIdPromise;
}

// Mantém cachedUserId em sincronia com mudanças de sessão (login/logout).
try {
  supabase.auth.onAuthStateChange((_evt, session) => {
    cachedUserId = session?.user?.id ?? null;
    userIdPromise = null;
  });
} catch {
  /* noop */
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQueue();
  }, FLUSH_INTERVAL_MS);
}

async function flushQueue() {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  try {
    const { error } = await supabase.from('analytics_events').insert(batch as any);
    if (error) {
      // Se falhar, descartamos silenciosamente — analytics é best-effort.
      console.warn('[analytics] batch insert failed', error.message);
    }
  } catch (e) {
    console.warn('[analytics] batch insert exception', e);
  }
}

function flushBeacon() {
  if (queue.length === 0) return;
  if (!SUPABASE_URL || !SUPABASE_ANON) return;
  const batch = queue.splice(0, queue.length);
  try {
    const url = `${SUPABASE_URL}/rest/v1/analytics_events`;
    const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
    // sendBeacon não permite headers customizados → usamos fetch com keepalive
    // como fallback, que preserva o request no unload em navegadores modernos.
    const beaconOk = navigator.sendBeacon?.(
      `${url}?apikey=${encodeURIComponent(SUPABASE_ANON)}`,
      blob,
    );
    if (!beaconOk) {
      void fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(batch),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* noop */
  }
}

function installUnloadHooks() {
  if (installedUnload || typeof window === 'undefined') return;
  installedUnload = true;
  const handler = () => flushBeacon();
  window.addEventListener('pagehide', handler);
  window.addEventListener('beforeunload', handler);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushBeacon();
  });
}

export async function trackEvent(
  event_type: AnalyticsEventType,
  target_id?: string | null,
  target_label?: string | null,
  metadata?: Record<string, unknown>,
) {
  try {
    installUnloadHooks();
    const user_id = await resolveUserId();
    queue.push({
      event_type,
      target_id: target_id ?? null,
      target_label: target_label ?? null,
      user_id,
      session_id: getSessionId(),
      metadata: metadata ?? null,
    });
    if (queue.length >= FLUSH_BATCH_SIZE) {
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      void flushQueue();
    } else {
      scheduleFlush();
    }
  } catch (e) {
    console.warn('[analytics] enqueue failed', e);
  }
}
