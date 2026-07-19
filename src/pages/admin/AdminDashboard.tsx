import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, PageHeader, StatCard, EmptyState } from './ui';
import { PeriodPicker, useAsync, useDateRange } from './hooks';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); }
function startOfWeek() { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString(); }
function startOfMonth() { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString(); }

export default function AdminDashboard() {
  const dr = useDateRange('30d');

  // Central de Controle
  const cc = useAsync(async () => {
    const [pending, cuponsToday, partnersAll, productsPending, journalTotal, journalScheduled, productsAll] = await Promise.all([
      supabase.from('partners').select('id', { count: 'exact', head: true }).eq('status', 'pending_curation'),
      supabase.from('coupons').select('id', { count: 'exact', head: true }).gte('created_at', startOfToday()),
      supabase.from('partners').select('id, name, logo_url, profile_image_url, banner_url, whatsapp, phone, email, description'),
      supabase.from('marketplace_products').select('id', { count: 'exact', head: true }).eq('status', 'pending_curation'),
      supabase.from('journal_articles').select('id', { count: 'exact', head: true }),
      supabase.from('journal_articles').select('id', { count: 'exact', head: true }).gt('published_at', new Date().toISOString()),
      supabase.from('marketplace_products').select('id, status', { count: 'exact' }),
    ]);
    const partners = (partnersAll.data || []) as any[];
    const noPhoto = partners.filter(p => !p.logo_url && !p.profile_image_url && !p.banner_url).length;
    const incomplete = partners.filter(p => {
      const hasContact = !!(p.whatsapp || p.phone || p.email);
      return !p.name || !hasContact || !p.description;
    }).length;
    const productsPublished = (productsAll.data || []).filter((p: any) => p.status === 'approved').length;
    return {
      empresasPendentes: pending.count ?? 0,
      produtosPendentes: productsPending.count ?? 0,
      cuponsHoje: cuponsToday.count ?? 0,
      empresasSemFoto: noPhoto,
      empresasIncompletas: incomplete,
      empresasTotal: partners.length,
      journalTotal: journalTotal.count ?? 0,
      journalProgramadas: journalScheduled.count ?? 0,
      produtosTotal: productsAll.count ?? 0,
      produtosPublicados: productsPublished,
    };
  }, []);

  // Cupons por período (Saúde da Plataforma)
  const health = useAsync(async () => {
    const [today, week, month] = await Promise.all([
      supabase.from('coupons').select('id', { count: 'exact', head: true }).gte('created_at', startOfToday()),
      supabase.from('coupons').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeek()),
      supabase.from('coupons').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth()),
    ]);
    return { hoje: today.count ?? 0, semana: week.count ?? 0, mes: month.count ?? 0 };
  }, []);

  // Metas
  const goals = useAsync(async () => {
    const [{ data: gs }, associados, empresasMembro, rcards, produtos] = await Promise.all([
      supabase.from('platform_goals').select('*').order('sort_order'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'client').eq('is_active', true),
      supabase.from('partners').select('id', { count: 'exact', head: true }).eq('is_member', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'client').eq('is_active', true),
      supabase.from('marketplace_products').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    ]);
    const map: Record<string, number> = {
      associados: associados.count ?? 0,
      empresas_select: empresasMembro.count ?? 0,
      rcard_ativos: rcards.count ?? 0,
      produtos_publicados: produtos.count ?? 0,
    };
    return ((gs as any) || []).map((g: any) => ({ ...g, current: map[g.key] ?? 0 }));
  }, []);

  const { data, loading } = useAsync(async () => {
    const [associados, empresas, empresasMembro, cupons, cuponsPeriodo, coupSum, articleViews, newProfiles, weeklyCoupons, searches, productViews, professionalViews, companyViews] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'client').eq('is_active', true),
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
    const counts: Record<string, { label: string; n: number }> = {};
    (articleViews.data || []).forEach((r: any) => {
      const k = r.target_id || 'x';
      counts[k] = counts[k] || { label: r.target_label || 'Matéria', n: 0 };
      counts[k].n += 1;
    });
    const top = Object.values(counts).sort((a, b) => b.n - a.n)[0];
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
    const weekMap = new Map<string, number>();
    for (let i = 7; i >= 0; i--) { weekMap.set(`S${8-i}`, 0); }
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
        cur.n += 1; m.set(k.toLowerCase(), cur);
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

      {/* Central de Controle */}
      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-300 mb-3">🚦 Central de Controle</div>
        {cc.loading || !cc.data ? <div className="text-gray-500 text-xs">Carregando…</div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ActionTile color="bg-red-500" label="Empresas aguardando aprovação" value={cc.data.empresasPendentes} to="/admin/empresas?status=pending_curation" />
            <ActionTile color="bg-yellow-400" label="Produtos aguardando aprovação" value={cc.data.produtosPendentes} to="/admin/mercado?status=pending_curation" />
            <ActionTile color="bg-green-500" label="Cupons emitidos hoje" value={cc.data.cuponsHoje} to="/admin/cupons" />
            <ActionTile color="bg-orange-500" label="Empresas sem foto" value={cc.data.empresasSemFoto} to="/admin/empresas?filter=no_photo" />
            <ActionTile color="bg-gray-500" label="Empresas com cadastro incompleto" value={cc.data.empresasIncompletas} to="/admin/empresas?filter=incomplete" />
          </div>
        )}
      </Card>

      {/* Saúde da Plataforma */}
      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-300 mb-3">❤️ Saúde da Plataforma</div>
        {cc.loading || !cc.data || health.loading || !health.data ? <div className="text-gray-500 text-xs">Carregando…</div> : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <HealthBlock title="Empresas" rows={[
              ['Total', cc.data.empresasTotal],
              ['Completas', cc.data.empresasTotal - cc.data.empresasIncompletas],
              ['Incompletas', cc.data.empresasIncompletas],
            ]} />
            <HealthBlock title="Produtos" rows={[
              ['Total', cc.data.produtosTotal],
              ['Pendentes', cc.data.produtosPendentes],
              ['Publicados', cc.data.produtosPublicados],
            ]} />
            <HealthBlock title="R.Journal" rows={[
              ['Total', cc.data.journalTotal],
              ['Programadas', cc.data.journalProgramadas],
            ]} />
            <HealthBlock title="Cupons" rows={[
              ['Hoje', health.data.hoje],
              ['Semana', health.data.semana],
              ['Mês', health.data.mes],
            ]} />
          </div>
        )}
      </Card>

      {/* Crescimento */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-300">📈 Crescimento</div>
          <Link to="/admin/metas" className="text-xs text-yellow-400 underline">Configurar metas</Link>
        </div>
        {goals.loading || !goals.data ? <div className="text-gray-500 text-xs">Carregando…</div> :
         !goals.data.length ? <div className="text-gray-500 text-xs">Nenhuma meta configurada.</div> : (
          <div className="space-y-3">
            {goals.data.map((g: any) => {
              const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{g.label}</span>
                    <span className="text-gray-400">{g.current} / {g.target} <span className="text-yellow-400 ml-2">{pct}%</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <PeriodPicker {...dr} />
      {loading || !data ? <EmptyState>Carregando dados…</EmptyState> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="Associados ativos" value={data.associados} />
            <StatCard label="Empresas" value={data.empresas} sub={`${data.empresasMembro} Empresa Membro`} />
            <StatCard label="Cupons totais" value={data.cupons} sub={`${data.cuponsPeriodo} no período`} />
            <StatCard label="Economia gerada" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.savings)} positive />
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

function ActionTile({ color, label, value, to }: { color: string; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="block bg-[#0a0f1e] border border-white/10 hover:border-yellow-500/60 transition p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-[10px] uppercase tracking-widest text-gray-400 leading-tight">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </Link>
  );
}

function HealthBlock({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="bg-[#0a0f1e] border border-white/10 p-3">
      <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">{title}</div>
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-300">{k}</span>
            <span className="text-white font-semibold">{v}</span>
          </div>
        ))}
      </div>
    </div>
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
