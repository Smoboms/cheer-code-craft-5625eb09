import { supabase } from '@/integrations/supabase/client';
import { Card, EmptyState, PageHeader, StatCard } from './ui';
import { PeriodPicker, useAsync, useDateRange } from './hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function AdminAnalytics() {
  const dr = useDateRange('30d');
  const { data, loading } = useAsync(async () => {
    // Fase 4 · T16 — hard cap defensivo. Em escala 50k+, agregação client-side
    // fica proibitiva. O cap protege o painel enquanto uma RPC de agregação
    // não é introduzida (ver Runbook seção "Analytics agregação server-side").
    const { data: events } = await supabase.from('analytics_events').select('*')
      .gte('created_at', dr.range.from).lte('created_at', dr.range.to)
      .order('created_at', { ascending: false })
      .limit(50_000);
    const list = events || [];
    const by = (t: string) => list.filter((e: any) => e.event_type === t);
    const paywallHits = by('paywall_hit').length;
    const paywallClicks = by('paywall_login_click').length;
    const sejaAssociado = by('seja_associado_click').length;

    // Pages
    const pageMap = new Map<string, number>();
    by('page_view').forEach((e: any) => pageMap.set(e.target_id || 'x', (pageMap.get(e.target_id || 'x') || 0) + 1));
    const pages = Array.from(pageMap.entries()).map(([k, v]) => ({ label: k, value: v }));

    // Companies visited
    const compMap = new Map<string, { name: string; n: number }>();
    by('company_profile_view').forEach((e: any) => {
      const k = e.target_id || 'x';
      const cur = compMap.get(k) || { name: e.target_label || 'Empresa', n: 0 };
      cur.n += 1; compMap.set(k, cur);
    });
    const companies = Array.from(compMap.values()).sort((a, b) => b.n - a.n).slice(0, 8);

    // Articles most viewed
    const artMap = new Map<string, { name: string; n: number }>();
    by('article_view').forEach((e: any) => {
      const k = e.target_id || 'x';
      const cur = artMap.get(k) || { name: e.target_label || 'Matéria', n: 0 };
      cur.n += 1; artMap.set(k, cur);
    });
    const articlesView = Array.from(artMap.values()).sort((a, b) => b.n - a.n).slice(0, 8);

    // Articles read full
    const readMap = new Map<string, { name: string; n: number }>();
    by('article_read_full').forEach((e: any) => {
      const k = e.target_id || 'x';
      const cur = readMap.get(k) || { name: e.target_label || 'Matéria', n: 0 };
      cur.n += 1; readMap.set(k, cur);
    });
    const articlesRead = Array.from(readMap.values()).sort((a, b) => b.n - a.n).slice(0, 8);

    // Timeline of visits
    const days = new Map<string, number>();
    const start = new Date(dr.range.from);
    const end = new Date(dr.range.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.set(d.toISOString().slice(0,10), 0);
    }
    by('page_view').forEach((e: any) => {
      const k = new Date(e.created_at).toISOString().slice(0,10);
      if (days.has(k)) days.set(k, (days.get(k) || 0) + 1);
    });
    const visits = Array.from(days.entries()).map(([k,v]) => ({ label: k.slice(5), value: v }));

    const conv = paywallHits > 0 ? (paywallClicks / paywallHits) * 100 : 0;

    return { pages, companies, articlesView, articlesRead, visits, paywallHits, paywallClicks, sejaAssociado, conv };
  }, [dr.range.from, dr.range.to]);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Comportamento e sinais de interesse" />
      <PeriodPicker {...dr} />
      {loading || !data ? <EmptyState>Carregando…</EmptyState> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="'Seja Associado' cliques" value={data.sejaAssociado} />
            <StatCard label="Paywall atingidos" value={data.paywallHits} />
            <StatCard label="Cliques no CTA do paywall" value={data.paywallClicks} />
            <StatCard label="Conversão paywall→CTA" value={`${data.conv.toFixed(1)}%`} positive={data.conv > 0} />
          </div>
          <Card className="p-4 mb-4">
            <div className="text-sm text-gray-300 mb-3">Visitas por dia</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={data.visits}>
                  <CartesianGrid stroke="#1f2a44" vertical={false} />
                  <XAxis dataKey="label" stroke="#7a8397" fontSize={10} />
                  <YAxis stroke="#7a8397" fontSize={10} allowDecimals={false} />
                  <Tooltip contentStyle={{ background:'#0a0f1e', border:'1px solid #1f2a44' }} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Visitas por página</div>
              {!data.pages.length ? <div className="text-gray-500 text-xs">Sem dados.</div> : (
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={data.pages} layout="vertical">
                      <XAxis type="number" stroke="#7a8397" fontSize={10} />
                      <YAxis type="category" dataKey="label" stroke="#7a8397" fontSize={10} width={80} />
                      <Bar dataKey="value" fill="#eab308" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Empresas mais visitadas</div>
              {!data.companies.length ? <div className="text-gray-500 text-xs">Sem dados.</div> :
                data.companies.map(c => (
                  <div key={c.name} className="flex justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-white truncate">{c.name}</span><span className="text-yellow-400">{c.n}</span>
                  </div>
                ))}
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Matérias mais visualizadas (resumo)</div>
              {!data.articlesView.length ? <div className="text-gray-500 text-xs">Sem dados.</div> :
                data.articlesView.map(a => (
                  <div key={a.name} className="flex justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-white truncate">{a.name}</span><span className="text-yellow-400">{a.n}</span>
                  </div>
                ))}
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Matérias mais lidas (completas)</div>
              {!data.articlesRead.length ? <div className="text-gray-500 text-xs">Sem dados.</div> :
                data.articlesRead.map(a => (
                  <div key={a.name} className="flex justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-white truncate">{a.name}</span><span className="text-green-400">{a.n}</span>
                  </div>
                ))}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
