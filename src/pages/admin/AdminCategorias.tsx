import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, PageHeader } from './ui';
import { useAsync } from './hooks';
import { Trash2 } from 'lucide-react';

function CategorySection({ table, title }: { table: 'partner_categories' | 'article_categories'; title: string }) {
  const [name, setName] = useState('');
  const { data, loading, reload } = useAsync(async () => (await supabase.from(table).select('*').order('name')).data || [], [table]);
  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from(table).insert({ name: name.trim() });
    if (error) return alert(error.message);
    setName(''); reload();
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
        <Input placeholder="Nova categoria" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e => e.key==='Enter' && add()} />
        <Btn onClick={add}>Adicionar</Btn>
      </div>
      {loading ? <div className="text-gray-400 text-sm">Carregando…</div> :
       !data?.length ? <div className="text-gray-400 text-sm">Nenhuma categoria.</div> : (
        <div className="space-y-1">
          {data.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center py-1.5 px-2 hover:bg-white/5">
              <span className="text-white text-sm">{c.name}</span>
              <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function AdminCategorias() {
  return (
    <>
      <PageHeader title="Categorias" subtitle="Categorias de empresas e de matérias" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection table="partner_categories" title="Categorias de Empresas" />
        <CategorySection table="article_categories" title="Categorias de Notícias" />
      </div>
    </>
  );
}
