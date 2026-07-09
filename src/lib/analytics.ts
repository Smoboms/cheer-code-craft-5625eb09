import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'rarques.analytics.session.v1';

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
  | 'article_read_full';

export async function trackEvent(
  event_type: AnalyticsEventType,
  target_id?: string | null,
  target_label?: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      event_type,
      target_id: target_id ?? null,
      target_label: target_label ?? null,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.warn('analytics track failed', e);
  }
}
