import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, Input, PageHeader } from './ui';
import { useAsync } from './hooks';
import { Trash2, Plus } from 'lucide-react';

function CategorySection({
  table,
  title,
  usageSource,
}: {
  table: 'partner_categories' | 'article_categories';
  title: string;
  usageSource?: 'partners' | 'journal_articles';
}) {
  const [name, setName] = useState('');
  const { data, loading, reload } = useAsync(async () => (await supabase.from(table).select('*').order('name')).data || [], [table]);
  const { data: inUse, reload: reloadUsage } = useAsync(async () => {
    if (!usageSource) return [] as string[];
    const col = usageSource === 'partners' ? 'category' : 'category';
    const { data } = await supabase.from(usageSource).select(col);
    const set = new Set<string>();
    (data || []).forEach((r: any) => { if (r[col]) set.add(r[col]); });
    return Array.from(set).sort();
  }, [usageSource]);

  const registered = new Set((data || []).map((c: any) => c.name));
  const orphans = (inUse || []).filter((n) => !registered.has(n));

  const add = async (val?: string) => {
    const v = (val ?? name).trim();
    if (!v) return;
    const { error } = await supabase.from(table).insert({ name: v });
    if (error) return alert(error.message);
    if (!val) setName('');
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm('Excluir categoria?')) return;
    await supabase.from(table).delete().eq('id', id);
    reload();
  };
  return (
    <Card className="p-4">
      <div className="text-white font-semibold mb-3">{title}</div>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Nova categoria" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <Btn onClick={() => add()}>Adicionar</Btn>
      </div>
      {loading ? <CardGridSkeleton items={3} /> :
        !data?.length ? <div className="text-gray-400 text-sm">Nenhuma categoria oficial.</div> : (
          <div className="space-y-1 mb-3">
            {data.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center py-1.5 px-2 hover:bg-white/5">
                <span className="text-white text-sm">{c.name}</span>
                <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      {orphans.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-yellow-400 mb-2">
            Em uso mas não oficializadas ({orphans.length})
          </div>
          <div className="space-y-1">
            {orphans.map((n) => (
              <div key={n} className="flex justify-between items-center py-1 px-2 bg-yellow-500/5">
                <span className="text-gray-300 text-sm">{n}</span>
                <button onClick={() => { add(n); reloadUsage(); }} className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1">
                  <Plus size={12} /> Oficializar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminCategorias() {
  return (
    <>
      <PageHeader title="Categorias" subtitle="Categorias oficiais de empresas e de matérias — inclui as já utilizadas" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection table="partner_categories" title="Categorias de Empresas" usageSource="partners" />
        <CategorySection table="article_categories" title="Categorias do R.Journal" usageSource="journal_articles" />
      </div>
    </>
  );
}
