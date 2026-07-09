import { supabase } from '@/integrations/supabase/client';
import { Card, EmptyState, PageHeader, StatCard } from './ui';
import { PeriodPicker, useAsync, useDateRange } from './hooks';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminCupons() {
  const dr = useDateRange('30d');
  const { data, loading } = useAsync(async () => {
    const { data: coupons } = await supabase.from('coupons')
      .select('*, partner:partners(name), profile:profiles!inner(name, email, user_id)')
      .gte('created_at', dr.range.from).lte('created_at', dr.range.to)
      .order('created_at', { ascending: false });
    const list = coupons || [];
    const partnerRank = new Map<string, { name: string; n: number; sum: number }>();
    const userRank = new Map<string, { name: string; n: number; sum: number }>();
    list.forEach((c: any) => {
      const pk = c.partner?.name || '—';
      const pv = partnerRank.get(pk) || { name: pk, n: 0, sum: 0 };
      pv.n += 1; pv.sum += Number(c.savings || 0);
      partnerRank.set(pk, pv);
      const uk = c.profile?.email || '—';
      const uv = userRank.get(uk) || { name: c.profile?.name || uk, n: 0, sum: 0 };
      uv.n += 1; uv.sum += Number(c.savings || 0);
      userRank.set(uk, uv);
    });
    // Timeline (daily buckets)
    const days = new Map<string, number>();
    const start = new Date(dr.range.from);
    const end = new Date(dr.range.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.set(d.toISOString().slice(0,10), 0);
    }
    list.forEach((c: any) => {
      const k = new Date(c.created_at).toISOString().slice(0,10);
      if (days.has(k)) days.set(k, (days.get(k) || 0) + 1);
    });
    const series = Array.from(days.entries()).map(([k,v]) => ({ label: k.slice(5), value: v }));
    const totalSavings = list.reduce((s: number, c: any) => s + Number(c.savings || 0), 0);
    return {
      list,
      total: list.length,
      totalSavings,
      partners: Array.from(partnerRank.values()).sort((a,b) => b.n - a.n).slice(0,5),
      users: Array.from(userRank.values()).sort((a,b) => b.n - a.n).slice(0,5),
      series,
    };
  }, [dr.range.from, dr.range.to]);

  return (
    <>
      <PageHeader title="Cupons" subtitle="Análise de cupons gerados na plataforma" />
      <PeriodPicker {...dr} />
      {loading || !data ? <EmptyState>Carregando…</EmptyState> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <StatCard label="Cupons no período" value={data.total} />
            <StatCard label="Economia gerada" value={`R$ ${data.totalSavings.toFixed(2)}`} positive />
          </div>
          <Card className="p-4 mb-4">
            <div className="text-sm text-gray-300 mb-3">Cupons por dia</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={data.series}>
                  <CartesianGrid stroke="#1f2a44" vertical={false} />
                  <XAxis dataKey="label" stroke="#7a8397" fontSize={10} />
                  <YAxis stroke="#7a8397" fontSize={10} allowDecimals={false} />
                  <Tooltip contentStyle={{ background:'#0a0f1e', border:'1px solid #1f2a44' }} />
                  <Bar dataKey="value" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Ranking de empresas</div>
              {!data.partners.length ? <div className="text-gray-500 text-xs">Sem dados.</div> : data.partners.map(p => (
                <div key={p.name} className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-white truncate">{p.name}</span>
                  <span className="text-yellow-400">{p.n} cupons</span>
                </div>
              ))}
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-300 mb-2">Ranking de associados</div>
              {!data.users.length ? <div className="text-gray-500 text-xs">Sem dados.</div> : data.users.map(u => (
                <div key={u.name} className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-white truncate">{u.name}</span>
                  <span className="text-green-400">R$ {u.sum.toFixed(2)}</span>
                </div>
              ))}
            </Card>
          </div>
          <Card className="p-4">
            <div className="text-sm text-gray-300 mb-2">Todos os cupons</div>
            {!data.list.length ? <div className="text-gray-500 text-xs">Nenhum cupom no período.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-gray-400">
                    <tr className="text-left border-b border-white/10">
                      <th className="py-2">Data</th><th>Associado</th><th>Empresa</th><th>Compra</th><th>%</th><th>Economia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.list.map((c: any) => (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="py-2 text-gray-300">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="text-white">{c.profile?.name || c.profile?.email || '—'}</td>
                        <td className="text-white">{c.partner?.name || '—'}</td>
                        <td className="text-gray-300">R$ {Number(c.purchase_amount).toFixed(2)}</td>
                        <td className="text-yellow-400">{Number(c.discount_percent).toFixed(0)}%</td>
                        <td className="text-green-400">R$ {Number(c.savings).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
