import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, PageHeader } from './ui';
import { useMarketCategories, MarketCategory, MarketSubcategory } from '@/data/useMarketCategories';
import { Trash2, Edit3, Plus, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminMercadoCategorias() {
  const { categories, subcategories, loading, reload } = useMarketCategories(false);
  const [newCat, setNewCat] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingCat, setEditingCat] = useState<MarketCategory | null>(null);
  const [editingSub, setEditingSub] = useState<MarketSubcategory | null>(null);
  const [newSubByCat, setNewSubByCat] = useState<Record<string, string>>({});

  const subsByCat = useMemo(() => {
    const m: Record<string, MarketSubcategory[]> = {};
    for (const s of subcategories) (m[s.category_id] = m[s.category_id] || []).push(s);
    return m;
  }, [subcategories]);

  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order));
    const { error } = await supabase.from('market_categories' as any).insert({
      name, slug: slugify(name), sort_order: maxOrder + 1,
    });
    if (error) return alert(error.message);
    setNewCat(''); reload();
  };
  const removeCategory = async (c: MarketCategory) => {
    if (!confirm(`Excluir categoria "${c.name}"? Isto removerá também as subcategorias.`)) return;
    const { error } = await supabase.from('market_categories' as any).delete().eq('id', c.id);
    if (error) return alert(error.message); reload();
  };
  const toggleCategory = async (c: MarketCategory) => {
    await supabase.from('market_categories' as any).update({ is_active: !c.is_active }).eq('id', c.id);
    reload();
  };
  const moveCategory = async (c: MarketCategory, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const i = sorted.findIndex((x) => x.id === c.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const other = sorted[j];
    await Promise.all([
      supabase.from('market_categories' as any).update({ sort_order: other.sort_order }).eq('id', c.id),
      supabase.from('market_categories' as any).update({ sort_order: c.sort_order }).eq('id', other.id),
    ]);
    reload();
  };
  const saveCategory = async () => {
    if (!editingCat) return;
    const { error } = await supabase.from('market_categories' as any)
      .update({ name: editingCat.name, slug: slugify(editingCat.name) })
      .eq('id', editingCat.id);
    if (error) return alert(error.message);
    setEditingCat(null); reload();
  };

  const addSub = async (cat: MarketCategory) => {
    const name = (newSubByCat[cat.id] || '').trim();
    if (!name) return;
    const existing = subsByCat[cat.id] || [];
    const maxOrder = Math.max(0, ...existing.map((s) => s.sort_order));
    const { error } = await supabase.from('market_subcategories' as any).insert({
      category_id: cat.id, name, sort_order: maxOrder + 1,
    });
    if (error) return alert(error.message);
    setNewSubByCat({ ...newSubByCat, [cat.id]: '' }); reload();
  };
  const removeSub = async (s: MarketSubcategory) => {
    if (!confirm(`Excluir subcategoria "${s.name}"?`)) return;
    await supabase.from('market_subcategories' as any).delete().eq('id', s.id); reload();
  };
  const toggleSub = async (s: MarketSubcategory) => {
    await supabase.from('market_subcategories' as any).update({ is_active: !s.is_active }).eq('id', s.id); reload();
  };
  const moveSub = async (s: MarketSubcategory, dir: -1 | 1) => {
    const sorted = (subsByCat[s.category_id] || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const i = sorted.findIndex((x) => x.id === s.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const other = sorted[j];
    await Promise.all([
      supabase.from('market_subcategories' as any).update({ sort_order: other.sort_order }).eq('id', s.id),
      supabase.from('market_subcategories' as any).update({ sort_order: s.sort_order }).eq('id', other.id),
    ]);
    reload();
  };
  const saveSub = async () => {
    if (!editingSub) return;
    const { error } = await supabase.from('market_subcategories' as any)
      .update({ name: editingSub.name }).eq('id', editingSub.id);
    if (error) return alert(error.message);
    setEditingSub(null); reload();
  };

  return (
    <>
      <PageHeader title="Categorias do Mercado" subtitle="Gerencie categorias principais e suas subcategorias" />

      <Card className="p-4 mb-4">
        <div className="text-white font-semibold mb-3 text-sm">Nova categoria</div>
        <div className="flex gap-2">
          <Input placeholder="Ex.: Serviços" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
          <Btn onClick={addCategory}><Plus size={12} /> Adicionar</Btn>
        </div>
      </Card>

      {loading ? <CardGridSkeleton items={3} /> :
       !categories.length ? <EmptyState>Nenhuma categoria criada.</EmptyState> : (
        <div className="space-y-2">
          {[...categories].sort((a, b) => a.sort_order - b.sort_order).map((c) => {
            const open = !!expanded[c.id];
            const subs = (subsByCat[c.id] || []).slice().sort((a, b) => a.sort_order - b.sort_order);
            return (
              <Card key={c.id} className="p-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded({ ...expanded, [c.id]: !open })} className="text-gray-400 hover:text-white">
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {editingCat?.id === c.id ? (
                    <>
                      <Input value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} />
                      <Btn onClick={saveCategory}>Salvar</Btn>
                      <Btn variant="ghost" onClick={() => setEditingCat(null)}>Cancelar</Btn>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${c.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>{c.name}</div>
                        <div className="text-[10px] text-gray-500">{subs.length} subcategoria(s) · ordem {c.sort_order}</div>
                      </div>
                      <Btn variant="ghost" onClick={() => moveCategory(c, -1)}><ArrowUp size={12} /></Btn>
                      <Btn variant="ghost" onClick={() => moveCategory(c, 1)}><ArrowDown size={12} /></Btn>
                      <Btn variant="ghost" onClick={() => toggleCategory(c)}>
                        {c.is_active ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} className="text-gray-500" />}
                      </Btn>
                      <Btn variant="ghost" onClick={() => setEditingCat(c)}><Edit3 size={12} /></Btn>
                      <Btn variant="danger" onClick={() => removeCategory(c)}><Trash2 size={12} /></Btn>
                    </>
                  )}
                </div>

                {open && (
                  <div className="mt-3 pl-6 border-l border-white/10 space-y-1.5">
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Nova subcategoria"
                        value={newSubByCat[c.id] || ''}
                        onChange={(e) => setNewSubByCat({ ...newSubByCat, [c.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addSub(c)}
                      />
                      <Btn onClick={() => addSub(c)}><Plus size={12} /></Btn>
                    </div>
                    {subs.length === 0 ? (
                      <div className="text-gray-500 text-xs">Nenhuma subcategoria.</div>
                    ) : subs.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 py-1">
                        {editingSub?.id === s.id ? (
                          <>
                            <Input value={editingSub.name} onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })} />
                            <Btn onClick={saveSub}>Salvar</Btn>
                            <Btn variant="ghost" onClick={() => setEditingSub(null)}>Cancelar</Btn>
                          </>
                        ) : (
                          <>
                            <span className={`text-sm flex-1 truncate ${s.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>{s.name}</span>
                            <Btn variant="ghost" onClick={() => moveSub(s, -1)}><ArrowUp size={12} /></Btn>
                            <Btn variant="ghost" onClick={() => moveSub(s, 1)}><ArrowDown size={12} /></Btn>
                            <Btn variant="ghost" onClick={() => toggleSub(s)}>
                              {s.is_active ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} className="text-gray-500" />}
                            </Btn>
                            <Btn variant="ghost" onClick={() => setEditingSub(s)}><Edit3 size={12} /></Btn>
                            <Btn variant="danger" onClick={() => removeSub(s)}><Trash2 size={12} /></Btn>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
