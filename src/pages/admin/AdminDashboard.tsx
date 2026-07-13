import { supabase } from '@/integrations/supabase/client';
import { Card, PageHeader, StatCard, EmptyState } from './ui';
import { PeriodPicker, useAsync, useDateRange } from './hooks';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const dr = useDateRange('30d');
  const { data, loading } = useAsync(async () => {
    const [associados, empresas, empresasMembro, cupons, cuponsPeriodo, coupSum, articleViews, newProfiles, weeklyCoupons, searches, productViews, professionalViews, companyViews] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('partners').select('id', { count: 'exact', head: true }),
      supabase.from('partners').select('id', { count: 'exact', head: true }).eq('is_member', true),
      supabase.from('coupons').select('id', { count: 'exact', head: true }),
      supabase.from('coupons').select('id', { count: 'exact', head: true }).gte('created_at', dr.range.from).lte('created_at', dr.range.to),
      supabase.from('coupons').select('savings'),
      supabase.from('analytics_events').select('target_id, target_label').eq('event_type', 'article_view').gte('created_at', dr.range.from).lte('created_at', dr.range.to),
      supabase.from('profiles').select('created_at').gte('created_at', new Date(Date.now() - 1000*60*60*24*30*6).toISOString()),
      supabase.from('coupons').select('created_at').gte('created_at', new Date(Date.now() - 1000*60*60*24*7*8).toISOString()),
      supabase.from('analytics_events').select('target_label').eq('event_type', 'search_query').gte('created_at', dr.range.from).lte('created_at', dr.range.to),
      supabase.from('analytics_events').select('target_id, target_label').eq('event_type', 'product_view').gte('created_at', dr.range.from).lte('created_at', dr.range.to),
      supabase.from('analytics_events').select('target_id, target_label').eq('event_type', 'professional_view').gte('created_at', dr.range.from).lte('created_at', dr.range.to),
      supabase.from('analytics_events').select('target_id, target_label').eq('event_type', 'company_profile_view').gte('created_at', dr.range.from).lte('created_at', dr.range.to),
    ]);
    const savings = (coupSum.data || []).reduce((s, r: any) => s + Number(r.savings || 0), 0);
    // Top article
    const counts: Record<string, { label: string; n: number }> = {};
    (articleViews.data || []).forEach((r: any) => {
      const k = r.target_id || 'x';
      counts[k] = counts[k] || { label: r.target_label || 'Matéria', n: 0 };
      counts[k].n += 1;
    });
    const top = Object.values(counts).sort((a, b) => b.n - a.n)[0];
    // Series: new profiles per month (last 6)
    const monthMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      monthMap.set(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, 0);
    }
    (newProfiles.data || []).forEach((r: any) => {
      const d = new Date(r.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (monthMap.has(k)) monthMap.set(k, (monthMap.get(k) || 0) + 1);
    });
    const monthSeries = Array.from(monthMap.entries()).map(([k, v]) => ({ label: k.slice(5), value: v }));
    // Weekly coupons
    const weekMap = new Map<string, number>();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i * 7);
      weekMap.set(`S${8-i}`, 0);
    }
    const weekKeys = Array.from(weekMap.keys());
    (weeklyCoupons.data || []).forEach((r: any) => {
      const daysAgo = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000*60*60*24));
      const bucket = Math.min(7, Math.floor(daysAgo / 7));
      const k = weekKeys[7 - bucket];
      weekMap.set(k, (weekMap.get(k) || 0) + 1);
    });
    const weekSeries = Array.from(weekMap.entries()).map(([k, v]) => ({ label: k, value: v }));

    const rank = (rows: any[]) => {
      const m = new Map<string, { label: string; n: number }>();
      rows.forEach((r) => {
        const k = (r.target_label || r.target_id || '').toString().trim();
        if (!k) return;
        const cur = m.get(k.toLowerCase()) || { label: k, n: 0 };
        cur.n += 1;
        m.set(k.toLowerCase(), cur);
      });
      return Array.from(m.values()).sort((a, b) => b.n - a.n).slice(0, 8);
    };

    return {
      associados: associados.count ?? 0,
      empresas: empresas.count ?? 0,
      empresasMembro: empresasMembro.count ?? 0,
      cupons: cupons.count ?? 0,
      cuponsPeriodo: cuponsPeriodo.count ?? 0,
      savings,
      top,
      monthSeries,
      weekSeries,
      topSearches: rank(searches.data || []),
      topProducts: rank(productViews.data || []),
      topPros: rank(professionalViews.data || []),
      topCompanies: rank(companyViews.data || []),
      totalSearches: (searches.data || []).length,
    };
  }, [dr.range.from, dr.range.to]);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral da plataforma" />
      <PeriodPicker {...dr} />
      {loading || !data ? <EmptyState>Carregando dados…</EmptyState> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="Associados ativos" value={data.associados} />
            <StatCard label="Empresas" value={data.empresas} sub={`${data.empresasMembro} Empresa Membro`} />
            <StatCard label="Cupons totais" value={data.cupons} sub={`${data.cuponsPeriodo} no período`} />
            <StatCard label="Economia gerada" value={`R$ ${data.savings.toFixed(2)}`} positive />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-3">Novos Associados / mês (6 meses)</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={data.monthSeries}>
                    <CartesianGrid stroke="#1f2a44" vertical={false} />
                    <XAxis dataKey="label" stroke="#7a8397" fontSize={11} />
                    <YAxis stroke="#7a8397" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid #1f2a44' }} />
                    <Bar dataKey="value" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-3">Cupons por semana (8 semanas)</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={data.weekSeries}>
                    <CartesianGrid stroke="#1f2a44" vertical={false} />
                    <XAxis dataKey="label" stroke="#7a8397" fontSize={11} />
                    <YAxis stroke="#7a8397" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid #1f2a44' }} />
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <Card className="p-4 mt-4">
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">Matéria mais lida no período</div>
            <div className="text-white">{data.top?.label ?? 'Sem visualizações ainda'}</div>
            {data.top && <div className="text-xs text-gray-400 mt-1">{data.top.n} visualizações</div>}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <RankCard title={`Termos mais buscados (${data.totalSearches})`} rows={data.topSearches} color="text-yellow-400" />
            <RankCard title="Empresas mais visualizadas" rows={data.topCompanies} color="text-blue-400" />
            <RankCard title="Produtos mais visualizados" rows={data.topProducts} color="text-green-400" />
            <RankCard title="Profissionais mais acionados" rows={data.topPros} color="text-purple-400" />
          </div>
        </>
      )}
    </>
  );
}

function RankCard({ title, rows, color }: { title: string; rows: { label: string; n: number }[]; color: string }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-300 mb-2">{title}</div>
      {!rows.length ? <div className="text-gray-500 text-xs">Sem dados no período.</div> : (
        rows.map((r) => (
          <div key={r.label} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-b-0">
            <span className="text-white truncate mr-2">{r.label}</span>
            <span className={color}>{r.n}</span>
          </div>
        ))
      )}
    </Card>
  );
}
