import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, PageHeader, Select, Textarea } from './ui';
import { Check, X, Trash2, Power, Edit2 } from 'lucide-react';

type Row = {
  id: string;
  name: string;
  category: string;
  category_slug: string | null;
  whatsapp: string;
  city: string | null;
  neighborhood: string | null;
  description: string | null;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
};

type Cat = { id: string; name: string; slug: string };

export default function AdminProfissionais() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'categories'>('pending');
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [newCat, setNewCat] = useState('');

  const reload = async () => {
    setLoading(true);
    const [{ data: profs }, { data: catRows }] = await Promise.all([
      (supabase as any).from('professionals').select('*').order('created_at', { ascending: false }),
      (supabase as any).from('professional_categories').select('*').order('name'),
    ]);
    setRows((profs as any) || []);
    setCats((catRows as any) || []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const setStatus = async (id: string, status: Row['status']) => {
    await (supabase as any).from('professionals').update({ status }).eq('id', id);
    reload();
  };
  const toggleActive = async (r: Row) => {
    await (supabase as any).from('professionals').update({ is_active: !r.is_active }).eq('id', r.id);
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm('Remover definitivamente este profissional?')) return;
    await (supabase as any).from('professionals').delete().eq('id', id);
    reload();
  };
  const saveEdit = async () => {
    if (!editing) return;
    const cat = cats.find((c) => c.slug === editing.category_slug);
    await (supabase as any).from('professionals').update({
      name: editing.name,
      category: cat?.name || editing.category,
      category_slug: editing.category_slug,
      whatsapp: editing.whatsapp,
      city: editing.city,
      neighborhood: editing.neighborhood,
      description: editing.description,
      photo_url: editing.photo_url,
    }).eq('id', editing.id);
    setEditing(null);
    reload();
  };

  const addCat = async () => {
    const name = newCat.trim();
    if (!name) return;
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { error } = await (supabase as any).from('professional_categories').insert({ name, slug });
    if (error) return alert(error.message);
    setNewCat('');
    reload();
  };
  const delCat = async (id: string) => {
    if (!confirm('Excluir categoria?')) return;
    await (supabase as any).from('professional_categories').delete().eq('id', id);
    reload();
  };

  const filtered = tab === 'categories' ? [] : rows.filter((r) => r.status === tab);

  return (
    <>
      <PageHeader title="Profissionais" subtitle="Curadoria do diretório público de profissionais autônomos" />

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { k: 'pending', label: `Pendentes (${rows.filter(r => r.status === 'pending').length})` },
          { k: 'approved', label: `Aprovados (${rows.filter(r => r.status === 'approved').length})` },
          { k: 'rejected', label: `Recusados (${rows.filter(r => r.status === 'rejected').length})` },
          { k: 'categories', label: 'Categorias' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
              tab === t.k ? 'bg-yellow-500 text-black border-yellow-500' : 'text-gray-300 border-white/20 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div><CardGridSkeleton items={3} /></div>
      ) : tab === 'categories' ? (
        <Card className="p-4">
          <div className="flex gap-2 mb-4">
            <Input placeholder="Nova categoria" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCat()} />
            <Btn onClick={addCat}>Adicionar</Btn>
          </div>
          {!cats.length ? <EmptyState>Nenhuma categoria.</EmptyState> : (
            <div className="space-y-1">
              {cats.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-1.5 px-2 hover:bg-white/5">
                  <span className="text-white text-sm">{c.name} <span className="text-gray-500 text-xs">/{c.slug}</span></span>
                  <button onClick={() => delCat(c.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState>Nenhum registro em "{tab}".</EmptyState>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="p-3 flex items-center gap-3">
              <div className="w-14 h-14 bg-[#0a0f1e] shrink-0 overflow-hidden flex items-center justify-center">
                {r.photo_url ? <img src={r.photo_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <span className="text-gray-600 text-[10px]">Sem foto</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{r.name}</p>
                  {!r.is_active && <span className="text-[10px] text-red-400 border border-red-500/40 px-1.5">INATIVO</span>}
                </div>
                <p className="text-gray-400 text-xs">{r.category} · {r.whatsapp}</p>
                <p className="text-gray-500 text-xs truncate">{[r.neighborhood, r.city].filter(Boolean).join(' - ') || '—'}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus(r.id, 'approved')} title="Aprovar" className="p-2 bg-green-600 hover:bg-green-500 text-white"><Check size={14} /></button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => setStatus(r.id, 'rejected')} title="Recusar" className="p-2 bg-white/10 hover:bg-white/20 text-white"><X size={14} /></button>
                )}
                <button onClick={() => setEditing(r)} title="Editar" className="p-2 bg-white/10 hover:bg-white/20 text-white"><Edit2 size={14} /></button>
                <button onClick={() => toggleActive(r)} title={r.is_active ? 'Desativar' : 'Ativar'} className="p-2 bg-white/10 hover:bg-white/20 text-white"><Power size={14} /></button>
                <button onClick={() => remove(r.id)} title="Remover" className="p-2 bg-red-600/80 hover:bg-red-500 text-white"><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0f1830] border border-white/15 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/10 text-white font-semibold">Editar Profissional</div>
            <div className="p-5 space-y-3">
              <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Categoria</Label>
                <Select value={editing.category_slug || ''} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}>
                  <option value="">—</option>
                  {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </Select>
              </div>
              <div><Label>WhatsApp</Label><Input value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cidade</Label><Input value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></div>
                <div><Label>Bairro</Label><Input value={editing.neighborhood || ''} onChange={(e) => setEditing({ ...editing, neighborhood: e.target.value })} /></div>
              </div>
              <div><Label>Descrição</Label><Textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Foto (URL)</Label><Input value={editing.photo_url || ''} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} /></div>
            </div>
            <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn onClick={saveEdit}>Salvar</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
